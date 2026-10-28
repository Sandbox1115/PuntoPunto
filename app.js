/* PuntoPunto — client-side Open Cross Stitch reader / progress tracker. No dependencies. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const el = {
    oxsInput:$('oxsInput'),progressInput:$('progressInput'),welcome:$('welcome'),editor:$('editor'),
    title:$('projectTitle'),meta:$('projectMeta'),canvas:$('patternCanvas'),wrap:$('canvasWrap'),
    legend:$('legendList'),summary:$('paletteSummary'),search:$('searchPalette'),kinds:$('stitchKinds'),
    all:$('showAllColors'),filterInfo:$('filterInfo'),toast:$('toast'),donut:$('donut'),
    done:$('totalDone'),remaining:$('totalRemaining'),percent:$('percentDone'),
    dimensions:$('dimensions'),colorCount:$('colorCount'),stitchCount:$('stitchCount'),
    lastSaved:$('lastSaved'),zoom:$('zoomLabel'),coords:$('coords'),hover:$('hoverInfo'),
    symbols:$('showSymbols'),markTool:$('markTool'),panTool:$('panTool'),
    left:$('leftPanel'),right:$('rightPanel'),backdrop:$('backdrop'),reset:$('resetProgress')
  };
  const marks = '● ■ ◆ ▲ ▼ ✚ ✕ ◇ ○ □ △ ▽ ✧ + × # @ % & = ? ! $ § ∆ ◈ ◉ ◌ ☼ ✤ ✳ ▣ ▥ ▧ ∞ ϟ ⊕ ⊗ ⊙ ▤ ▦ ╳ ╬ ⋄ ∗ ⌘ ⋆ ▴ ▾ ◐ ◒ ⌑ ▰ ▱ ※'.split(' ');
  const visuals=window.PuntoPuntoStitchVisuals;
  const filterKindEl=$('filterKind'),viewModeEl=$('oxsViewMode');
  const kindDefs = {full:['×','Croce intera'],part:['◩','Punto parziale'],half:['╱','Mezzo punto'],quarter:['◢','Quarto di punto'],tent:['╱','Punto diagonale'],verticalhalf:['▐','Mezza croce verticale'],horizontalhalf:['▂','Mezza croce orizzontale'],back:['━','Punto scritto'],knot:['●','Nodo francese'],bead:['◆','Perlina'],fullcross:['×','Croce decorativa']};
  const state = {pattern:null,completed:new Set(),activeColor:null,activeKind:null,pendingOnly:false,mono:false,mode:'mark',showSymbols:true,cell:16,ox:0,oy:0,drag:null,picker:null,pickerTimer:null,savedTimer:null,saveAvailable:true,saveAt:0,dirty:false,lastStorageWarning:0,oxsFilename:''};
  const ctx = el.canvas.getContext('2d',{alpha:false});
  const touchGesture={points:new Map(),pinching:false,lastDistance:0,lastCenter:null};
  let oxsFocusMode=false;
  // Keyboard cursor is a view-only position, never a saved stitch or progress record.
  let keyboardCell=null;
  // Mobile OXS: make the existing reactive panels readable *below* the canvas.
  // Reparenting rather than cloning preserves filter actions, localization, and live counts.
  const mobileInsights=$('oxsMobileInsights'),mobileQuickNav=$('oxsMobileQuickNav'),
    workspaceLayout=document.querySelector('.layout'),workspaceMain=document.querySelector('.main-panel');
  const compactMobile=window.matchMedia('(max-width:620px)');
  let mobileInsightsActive=false;
  function syncOXSInlinePanels(){
    const enable=!!state.pattern&&!el.editor.classList.contains('hidden')&&compactMobile.matches;
    if(enable===mobileInsightsActive)return;
    closePanels();mobileInsightsActive=enable;
    if(enable){
      addMobileReturnButtons();
      // Show progress first, then selectable threads and stitch-type filters.
      mobileInsights.append(el.right,el.left);
    }else{
      workspaceLayout.insertBefore(el.left,workspaceMain);
      workspaceLayout.append(el.right);
    }
    mobileInsights.classList.toggle('hidden',!enable);
    mobileQuickNav.classList.toggle('hidden',!enable);
    document.body.classList.toggle('pp-oxs-inline-mobile',enable);
    requestAnimationFrame(()=>{if(state.pattern){resizeCanvas();}});
  }
  function jumpToOXSSection(node){
    if(!mobileInsightsActive)return;
    if(oxsFocusMode)setOXSFocus(false);
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'start'});
    node.setAttribute('tabindex','-1');node.focus({preventScroll:true});
  }

  // v0.9.8.8.17: independent, best-effort view preference. Never stored in OXS/JSON.
  let oxsViewTimer=null,lastWorkPoint=null,lastMarkUndo=null,markStroke=null;
  const viewKey=()=>state.pattern?'pp-oxs-view-v1-'+state.pattern.id:'';
  function validPoint(p){return !!state.pattern&&p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<state.pattern.width&&p.y<state.pattern.height;}
  function saveOXSView(){
    clearTimeout(oxsViewTimer);oxsViewTimer=null;
    if(!state.pattern)return;
    const d=dimensions();if(!d.w||!d.h)return;
    const centerX=(d.w/2-state.ox)/state.cell,centerY=(d.h/2-state.oy)/state.cell;
    if(!Number.isFinite(centerX)||!Number.isFinite(centerY))return;
    try{localStorage.setItem(viewKey(),JSON.stringify({v:1,cell:state.cell,x:centerX,y:centerY,last:lastWorkPoint}));}
    catch(e){console.warn('Preferenze vista OXS non salvabili',e);}
  }
  function queueViewSave(){if(!state.pattern)return;clearTimeout(oxsViewTimer);oxsViewTimer=setTimeout(saveOXSView,500);}
  function restoreOXSView(){
    lastWorkPoint=null;lastMarkUndo=null;markStroke=null;keyboardCell=null;
    if(!state.pattern)return;
    try{
      const rec=JSON.parse(localStorage.getItem(viewKey())||'null');if(!rec||rec.v!==1)return;
      if(validPoint(rec.last))lastWorkPoint={x:rec.last.x,y:rec.last.y};
      const d=dimensions();
      if(Number.isFinite(rec.cell)&&rec.cell>=2&&rec.cell<=75&&Number.isFinite(rec.x)&&Number.isFinite(rec.y)&&rec.x>=-state.pattern.width&&rec.x<=2*state.pattern.width&&rec.y>=-state.pattern.height&&rec.y<=2*state.pattern.height&&d.w>0&&d.h>0){
        state.cell=rec.cell;state.ox=d.w/2-rec.x*state.cell;state.oy=d.h/2-rec.y*state.cell;
        updateZoom();draw();
      }
    }catch(e){console.warn('Posizione OXS precedente non valida',e);}
    if(lastWorkPoint)keyboardCell={x:Math.floor(lastWorkPoint.x),y:Math.floor(lastWorkPoint.y)};
    syncOXSWorkbar();
  }
  function jumpToOXSCanvas(){
    if(!state.pattern)return;
    const stage=$('stage');
    if(oxsFocusMode)setOXSFocus(false);
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'start'});
    el.wrap.focus({preventScroll:true});
  }
  function rememberWorkPoint(g){
    if(!validPoint(g))return;
    lastWorkPoint={x:Math.floor(g.x)+.5,y:Math.floor(g.y)+.5};
    syncOXSWorkbar();queueViewSave();
  }
  function goToLastOXSPoint(){
    if(!validPoint(lastWorkPoint))return;
    const d=dimensions();if(!d.w||!d.h)return;
    state.ox=d.w/2-lastWorkPoint.x*state.cell;
    state.oy=d.h/2-lastWorkPoint.y*state.cell;
    draw();queueViewSave();jumpToOXSCanvas();
  }
  function finishMarkStroke(){
    if(markStroke?.size){
      const changes=[...markStroke.entries()].filter(([id,was])=>state.completed.has(id)!==was);
      if(changes.length)lastMarkUndo=changes;
    }
    markStroke=null;syncOXSWorkbar();
  }
  function undoOXSMark(){
    if(!lastMarkUndo||!state.pattern)return;
    for(const [id,was] of lastMarkUndo){was?state.completed.add(id):state.completed.delete(id);}
    lastMarkUndo=null;queueSave();renderLegends();updateStats();draw();syncOXSWorkbar();
    notify(window.PuntoPuntoI18n?.t?.('Ultima marcatura annullata.')||'Ultima marcatura annullata.');
  }
  function clearOXSFilters(){
    state.activeColor=null;state.activeKind=null;state.pendingOnly=false;el.search.value='';
    renderLegends();draw();
  }
  function syncOXSWorkbar(){
    const l=window.PuntoPuntoI18n?.language==='en';
    const fields=[];
    if(state.activeColor!==null)fields.push((l?'Thread ':'Filato ')+(state.pattern?.palette.get(state.activeColor)?.number??state.activeColor));
    if(state.activeKind!==null)fields.push(visuals.name(state.activeKind));
    if(state.pendingOnly)fields.push(l?'Unfinished':'Da ricamare');
    if(el.search.value.trim())fields.push(l?'Search':'Ricerca');
    $('oxsActiveFilters').textContent=fields.length?(l?'Filters: ':'Filtri: ')+fields.join(' · '):(l?'No filters active':'Nessun filtro attivo');
    $('oxsClearFilters').disabled=!fields.length;
    $('oxsPendingOnly').setAttribute('aria-pressed',String(!!state.pendingOnly));
    $('oxsPendingOnly').classList.toggle('is-active',!!state.pendingOnly);
    $('oxsUndoMark').disabled=!lastMarkUndo;
    $('oxsGoLast').disabled=!validPoint(lastWorkPoint);
  }
  function addMobileReturnButtons(){
    for(const panel of [el.left,el.right]){
      if(panel.querySelector('.pp-oxs-back-to-canvas'))continue;
      const button=document.createElement('button');button.type='button';button.className='btn btn-soft pp-oxs-back-to-canvas';
      button.textContent='↑ Torna allo schema';button.addEventListener('click',jumpToOXSCanvas);
      panel.append(button);
    }
  }
  function resetTouchGesture(){touchGesture.points.clear();touchGesture.pinching=false;touchGesture.lastDistance=0;touchGesture.lastCenter=null;state.drag=null;el.wrap.classList.remove('grabbing');}
  function setOXSFocus(enabled){
    const active=!!enabled&&!!state.pattern&&!el.editor.classList.contains('hidden');
    if(active===oxsFocusMode)return;
    closeStitchPicker();closePanels();resetTouchGesture();
    const old=dimensions();
    const focusX=(old.w/2-state.ox)/state.cell,focusY=(old.h/2-state.oy)/state.cell;
    oxsFocusMode=active;document.body.classList.toggle('pp-oxs-focus',active);
    $('toggleOXSFocus').setAttribute('aria-pressed',String(active));
    $('exitOXSFocus').setAttribute('aria-hidden',String(!active));
    requestAnimationFrame(()=>{
      resizeCanvas();const next=dimensions();
      if(state.pattern&&next.w>0&&next.h>0){state.ox=next.w/2-focusX*state.cell;state.oy=next.h/2-focusY*state.cell;draw();}
    });
  }
  function touchPinchGeometry(){
    const [a,b]=[...touchGesture.points.values()];
    return {center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};
  }
  let currentFileText='',toastTimer=0,resizeObserver=null;
  const edits=window.PuntoPuntoPatternEdits.create({state,refresh:refreshEditedView,queueSave,notify});

  function notify(msg, isError=false) {
    el.toast.textContent=msg;el.toast.classList.toggle('error',isError);el.toast.setAttribute('aria-live',isError?'assertive':'polite');el.toast.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.toast.classList.remove('visible'),4200);
  }
  function normalizeHex(raw, fallback='#9ab6a5') {
    if(!raw)return fallback;
    let s=String(raw).trim().replace(/^#/,'');
    if(/^[0-9a-f]{3}$/i.test(s))s=s.split('').map(c=>c+c).join('');
    return /^[0-9a-f]{6}$/i.test(s)?'#'+s.toLowerCase():fallback;
  }
  function darkInk(hex){let s=hex.slice(1),r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);return (0.2126*r+0.7152*g+0.0722*b)>152?'#344940':'#ffffff';}
  function attr(node,name,defaultValue=''){return node?.getAttribute(name)??defaultValue;}
  function integer(node,name,defaultValue=0){let n=Number.parseInt(attr(node,name),10);return Number.isFinite(n)?n:defaultValue;}
  function number(node,name,defaultValue=0){let n=Number(attr(node,name));return Number.isFinite(n)?n:defaultValue;}
  function section(root,name){return root.getElementsByTagName(name)[0]||null;}
  function children(sectionNode,name){return sectionNode?Array.from(sectionNode.getElementsByTagName(name)):[];}
  function safeInt(n){return Number.isInteger(n)&&n>=0&&n<10000;}

  function parseOXS(xmlText,filename) {
    if(xmlText.length>20000000)throw new Error('Il file supera il limite di 20 MB della versione attuale.');
    if(/<!DOCTYPE|<!ENTITY/i.test(xmlText))throw new Error('Per sicurezza non sono accettate dichiarazioni XML con entità esterne.');
    const xml=new DOMParser().parseFromString(xmlText,'application/xml');
    if(xml.querySelector('parsererror'))throw new Error('Il file non contiene XML valido. Controlla che sia un vero file OXS.');
    if(xml.documentElement.localName!=='chart')throw new Error('Formato non riconosciuto: è atteso un file OXS con elemento <chart>.');
    const root=xml.documentElement,props=section(root,'properties');
    const palette=new Map();
    children(section(root,'palette'),'palette_item').forEach((item,i)=>{
      const index=integer(item,'index',i);
      if(index<0||index>10000)return;
      const number=attr(item,'number',index===0?'Tessuto':String(index));
      const name=attr(item,'name',number);
      const rawSymbol=attr(item,'symbol');
      // In Ursa/OXS numerical symbols refer to a proprietary font, not Unicode.
      const usableSymbol=rawSymbol&&rawSymbol.length===1&&!/\d/.test(rawSymbol)?rawSymbol:marks[(index-1+marks.length)%marks.length];
      const color=normalizeHex(attr(item,'color'));
      palette.set(index,{index,number,name,color,ink:darkInk(color),symbol:usableSymbol,strands:attr(item,'strands'),isCloth:index===0});
    });
    const stitches=[],byCell=new Map(),linear=[],ornaments=[];
    const unsupported={count:0,types:new Set()};
    const maxStitches=300000;
    function add(item){
      if(stitches.length>=maxStitches)throw new Error('Schema troppo grande per questa versione (oltre 300.000 punti).');
      item.id=stitches.length;item.palIndex=Number(item.palIndex);
      if(!palette.has(item.palIndex)&&item.palIndex!==0){
        const i=item.palIndex,color='#9baeb0';palette.set(i,{index:i,number:String(i),name:'Colore '+i,color,ink:darkInk(color),symbol:marks[(i-1+marks.length)%marks.length],strands:'',isCloth:false});
      }
      stitches.push(item);
      if(item.kind==='back'){linear.push(item);}else if(['knot','bead','quarter','tent','verticalhalf','horizontalhalf','fullcross'].includes(item.kind)){ornaments.push(item);}else{
        const key=item.y*10000+item.x;
        if(!byCell.has(key))byCell.set(key,[]);
        byCell.get(key).push(item);
      }
    }
    for(const node of children(section(root,'fullstitches'),'stitch')){
      const x=integer(node,'x'),y=integer(node,'y'),palIndex=integer(node,'palindex');
      if(safeInt(x)&&safeInt(y)&&palIndex>0)add({kind:'full',x,y,palIndex,marked:attr(node,'marked').toLowerCase()==='true'});
    }
    for(const node of children(section(root,'partstitches'),'partstitch')){
      const x=integer(node,'x'),y=integer(node,'y'),direction=integer(node,'direction');
      if(!safeInt(x)||!safeInt(y))continue;
      if(direction===1||direction===2){
        for(const side of [1,2]){
          const palIndex=integer(node,'palindex'+side);
          if(palIndex>0)add({kind:'part',x,y,palIndex,direction,side,marked:attr(node,'marked').toLowerCase()==='true'});
        }
      }else if(direction===3||direction===4){
        const first=integer(node,'palindex1'),second=integer(node,'palindex2');
        const palIndex=first>0?first:second;
        if(palIndex>0)add({kind:'half',x,y,palIndex,direction,marked:attr(node,'marked').toLowerCase()==='true'});
        if(first>0&&second>0&&first!==second){unsupported.count++;unsupported.types.add('mezzo punto con due colori');}
      }else{unsupported.count++;unsupported.types.add('partstitch direzione '+direction);}
    }
    for(const node of children(section(root,'backstitches'),'backstitch')){
      const x1=number(node,'x1'),x2=number(node,'x2'),y1=number(node,'y1'),y2=number(node,'y2');
      const palIndex=integer(node,'palindex'),objecttype=attr(node,'objecttype','backstitch').toLowerCase();
      if([x1,x2,y1,y2].every(n=>n>=0&&n<10000)&&palIndex>0){
        if(objecttype==='backstitch'||objecttype==='')add({kind:'back',x1,y1,x2,y2,palIndex,marked:false});
        else if(objecttype.includes('daisy')||objecttype.includes('bugle')){unsupported.count++;unsupported.types.add(objecttype);}
        else{unsupported.count++;unsupported.types.add(objecttype);}
      }
    }
    for(const node of children(section(root,'ornaments_inc_knots_and_beads'),'object')){
      const x1=number(node,'x1'),y1=number(node,'y1'),palIndex=integer(node,'palindex');
      const kind=attr(node,'objecttype').toLowerCase(),direction=integer(node,'direction',1);
      if(!Number.isFinite(x1)||!Number.isFinite(y1)||x1<0||y1<0||x1>10000||y1>10000)continue;
      if(['knot','bead','tent','quarter','verticalhalf','horizontalhalf','fullcross'].includes(kind)||/^bead\d+mm$/.test(kind)){
        if(palIndex>0)add({kind:kind.startsWith('bead')?'bead':kind,x1,y1,palIndex,direction,marked:attr(node,'marked').toLowerCase()==='true'});
      }else{unsupported.count++;unsupported.types.add(kind||'senza tipo');}
    }
    if(!stitches.length && (integer(props,'chartwidth')<1||integer(props,'chartheight')<1))throw new Error('Lo schema non contiene punti supportati da visualizzare.');
    let maxX=1,maxY=1;
    for(const s of stitches){
      if(s.kind==='back'){maxX=Math.max(maxX,s.x1,s.x2);maxY=Math.max(maxY,s.y1,s.y2);}
      else if(s.x1!==undefined){maxX=Math.max(maxX,Math.floor(s.x1)+1);maxY=Math.max(maxY,Math.floor(s.y1)+1);}
      else{maxX=Math.max(maxX,s.x+1);maxY=Math.max(maxY,s.y+1);}
    }
    const width=integer(props,'chartwidth',Math.ceil(maxX)),height=integer(props,'chartheight',Math.ceil(maxY));
    if(width<1||height<1||width>10000||height>10000)throw new Error('Dimensioni della griglia non valide.');
    // Protect against malformed size metadata that would cut off stitches.
    const finalWidth=Math.max(width,Math.ceil(maxX)),finalHeight=Math.max(height,Math.ceil(maxY));
    // Spatial lookup for individually selectable ornamental and written stitches.
    // Keep these separate from byCell: painting/removing base crosses must not
    // silently delete an ornament occupying the same square.
    const specialsByCell=new Map();
    function indexSpecial(s,x,y){
      if(x<0||y<0||x>=finalWidth||y>=finalHeight)return;
      const key=y*10000+x;
      if(!specialsByCell.has(key))specialsByCell.set(key,[]);
      specialsByCell.get(key).push(s);
    }
    // NOTE: the index is populated after finalWidth/finalHeight are computed below.
    for(const s of ornaments){
      const x=Math.floor(s.x1),y=Math.floor(s.y1);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)indexSpecial(s,x+dx,y+dy);
    }
    for(const s of linear){
      // Index only boxes covered by the segment; bounds are restricted to the grid.
      const left=Math.max(0,Math.floor(Math.min(s.x1,s.x2)-.3));
      const right=Math.min(finalWidth-1,Math.floor(Math.max(s.x1,s.x2)+.3));
      const top=Math.max(0,Math.floor(Math.min(s.y1,s.y2)-.3));
      const bottom=Math.min(finalHeight-1,Math.floor(Math.max(s.y1,s.y2)+.3));
      // An exceptionally long diagonal must not consume excessive memory.
      if((right-left+1)*(bottom-top+1)>5000)continue;
      for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++)indexSpecial(s,x,y);
    }
    return {filename,title:attr(props,'charttitle')||filename.replace(/\.oxs$/i,''),width:finalWidth,height:finalHeight,palette,
      stitches,byCell,linear,ornaments,specialsByCell,unsupported,properties:props?{author:attr(props,'author'),stitchesPerInch:attr(props,'stitchesperinch')}:{} };
  }

  async function fingerprint(text) {
    if(crypto?.subtle){const bytes=new TextEncoder().encode(text),sum=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(sum)).map(b=>b.toString(16).padStart(2,'0')).join('');}
    let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return 'fnv-'+(h>>>0).toString(16)+'-'+text.length;
  }
  function progressKey(){return state.pattern?'pp-progress-v1-'+state.pattern.id:'';}
  function validOXSProgress(p){
    if(!p||p.version!==1||p.id!==state.pattern?.id||!Array.isArray(p.completed)||(p.edits!==undefined&&!Array.isArray(p.edits)))return false;
    const limit=Math.max(100000,state.pattern.width*state.pattern.height*16);
    if(p.completed.length>limit||(p.edits||[]).length>state.pattern.width*state.pattern.height)return false;
    if(!p.completed.every(i=>Number.isInteger(i)&&i>=0&&i<limit))return false;
    const kinds=new Set(['erase','full','halfForward','halfBack','quarterNW','quarterNE','quarterSW','quarterSE','tentForward','tentBack','knot','bead']);
    return (p.edits||[]).every(item=>Array.isArray(item)&&item.length===3&&Number.isInteger(item[0])&&item[0]>=0&&item[0]<state.pattern.width&&Number.isInteger(item[1])&&item[1]>=0&&item[1]<state.pattern.height&&item[2]&&kinds.has(item[2].kind)&& (item[2].kind==='erase'||(Number.isInteger(item[2].palIndex)&&state.pattern.palette.has(item[2].palIndex))));
  }
  let oxsRestoreNotice=null;
  function getStoredProgress(){
    oxsRestoreNotice=null;
    const recovered=window.PuntoPuntoStorage?.read(progressKey(),validOXSProgress);
    if(recovered?.found){if(recovered.recovered||recovered.damaged)oxsRestoreNotice='Ripristinata una copia valida dei progressi OXS: verifica i punti ed esporta subito un backup JSON.';return recovered.value;}
    try{const raw=localStorage.getItem(progressKey());if(raw){const parsed=JSON.parse(raw);if(validOXSProgress(parsed))return parsed;}}
    catch(e){console.warn('Progressi OXS precedenti non leggibili',e);}
    if(recovered?.damaged)oxsRestoreNotice='Salvataggio OXS danneggiato: importa un backup JSON, non iniziare da una copia vuota.';
    return null;
  }
  function saveNow(silent=true) {
    if(!state.pattern)return;
    clearTimeout(state.savedTimer);state.savedTimer=null;
    const data={version:1,id:state.pattern.id,filename:state.pattern.filename,completed:[...state.completed],edits:edits.serialize(),savedAt:new Date().toISOString()};
    const result=window.PuntoPuntoStorage?.write(progressKey(),data,validOXSProgress);
    if(result?.ok){state.saveAvailable=true;state.saveAt=Date.now();state.dirty=false;updateSavedLabel();}
    else{state.saveAvailable=false;updateSavedLabel();if(!silent||Date.now()-state.lastStorageWarning>12000){state.lastStorageWarning=Date.now();notify('Impossibile salvare nel browser. Esporta subito un JSON dei progressi.',true);}}
  }
  function queueSave(){state.dirty=true;clearTimeout(state.savedTimer);state.savedTimer=setTimeout(()=>saveNow(),360);}
  function updateSavedLabel(){el.lastSaved.textContent=state.saveAvailable?(state.saveAt?'Automatico · '+new Date(state.saveAt).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'Automatico'):'Solo esportazione';}
  function openDB(){return new Promise((resolve,reject)=>{
    if(!('indexedDB'in window))return reject(Error('IndexedDB indisponibile'));
    const request=indexedDB.open('PuntoPunto',2);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('projects'))request.result.createObjectStore('projects',{keyPath:'id'});};
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};
    request.onblocked=()=>reject(Error('Database occupato da un’altra scheda: chiudila e riprova.'));
    request.onerror=()=>reject(request.error||Error('Apertura IndexedDB non riuscita.'));
  });}
  async function dbPut(record){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error||Error('Salvataggio annullato.'));};});}
  async function dbGet(id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readonly');let record=null;const req=tx.objectStore('projects').get(id);req.onsuccess=()=>{record=req.result;};tx.oncomplete=()=>{db.close();resolve(record);};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error||Error('Lettura annullata.'));};});}

  let manualOpenStarted=false;
  async function loadPattern(text,filename,{restoring=false}={}){
    if(!restoring)manualOpenStarted=true;
    setOXSFocus(false);closeStitchPicker();
    window.PuntoPuntoPDFTracker?.closeBeforeOXS?.();
    const pattern=parseOXS(text,filename);pattern.id=await fingerprint(text);
    if(state.dirty)saveNow();
    if(state.pattern)saveOXSView();
    currentFileText=text;
    state.pattern=pattern;state.completed=new Set(pattern.stitches.filter(s=>s.marked).map(s=>s.id));
    const stored=getStoredProgress();
    edits.load(stored?.id===pattern.id?stored:null);
    if(stored?.id===pattern.id&&Array.isArray(stored.completed)){
      state.completed=new Set(stored.completed.filter(id=>Number.isInteger(id)&&id>=0&&id<pattern.stitches.length));
      state.saveAt=Date.parse(stored.savedAt)||Date.now();
    }else state.saveAt=0;
    state.activeColor=null;state.activeKind=null;state.pendingOnly=false;state.mono=false;filterKindEl.value='';viewModeEl.value='color';state.mode='mark';state.showSymbols=true;el.symbols.checked=true;el.search.value='';
    setMode('mark');$('closeOXSProject').classList.remove('hidden');el.welcome.classList.add('hidden');el.editor.classList.remove('hidden');
    syncOXSInlinePanels();
    state.oxsFilename=filename;el.title.setAttribute('data-i18n-ignore','');el.title.textContent=pattern.title;
    el.meta.setAttribute('data-i18n-ignore','');el.meta.textContent=`${pattern.width} × ${pattern.height} ${window.PuntoPuntoI18n?.language==='en'?'cells':'caselle'} · ${filename}`;
    el.summary.textContent=`${[...pattern.palette.values()].filter(c=>!c.isCloth&&pattern.stitches.some(s=>s.palIndex===c.index)).length} colori nello schema`;
    el.dimensions.textContent=`${pattern.width} × ${pattern.height}`;
    el.stitchCount.textContent=pattern.stitches.length.toLocaleString(window.PuntoPuntoI18n?.language==='en'?'en-US':'it-IT');
    el.colorCount.textContent=[...new Set(pattern.stitches.map(s=>s.palIndex))].length;
    ['saveProgress','loadProgress','resetProgress','exportOXS'].forEach(id=>$(id).disabled=false);
    renderLegends();updateStats();resizeCanvas();fit();restoreOXSView();
    try{await dbPut({id:pattern.id,text,filename,updatedAt:Date.now()});
      const confirmed=await dbGet(pattern.id);
      if(!confirmed||confirmed.text!==text||confirmed.id!==pattern.id)throw Error('Verifica lettura del progetto OXS non riuscita');
      localStorage.setItem('pp-last-project',pattern.id);
    }catch(e){console.warn('File OXS non archiviabile',e);notify('Schema aperto ma originale OXS non conservato: mantieni il file per riprenderlo.',true);}
    if(oxsRestoreNotice)notify(oxsRestoreNotice,true);
    else if(pattern.unsupported.count)notify(`Schema aperto: ${pattern.unsupported.count} elementi particolari non supportati (non inclusi nel conteggio).`);
    else if(restoring)notify('Bentornato! Ho ripristinato il tuo progetto.');
    else if(stored)notify('Schema aperto. Ho recuperato i tuoi progressi salvati.');
    else notify('Schema aperto! Puoi iniziare a segnare le crocette.');
  }
  // Return every OXS-only legend, filter and summary control to its initial home state.
  // Do not clear persisted backups: closing a view is not deleting a saved project.
  function resetHomeProjectUI(){
    state.activeColor=null;state.activeKind=null;state.mono=false;state.showSymbols=true;
    state.saveAt=0;state.oxsFilename='';state.drag=null;lastWorkPoint=null;lastMarkUndo=null;markStroke=null;keyboardCell=null;state.pendingOnly=false;
    el.search.value='';el.summary.textContent='Apri uno schema per vedere tutti i colori.';
    el.filterInfo.textContent='';el.all.classList.add('active');
    el.legend.replaceChildren();
    const emptyThreads=document.createElement('div');emptyThreads.className='empty-side';
    emptyThreads.textContent='I tuoi filati appariranno qui, con quantità e avanzamento.';
    el.legend.appendChild(emptyThreads);
    filterKindEl.replaceChildren(new Option('Tutti i tipi di punto',''));
    filterKindEl.value='';
    el.kinds.replaceChildren();
    const emptyKinds=document.createElement('span');emptyKinds.className='muted';
    emptyKinds.textContent='I tipi di punto presenti nello schema.';
    el.kinds.appendChild(emptyKinds);
    viewModeEl.value='color';el.symbols.checked=true;
    el.donut.style.background='conic-gradient(#25887b 0%, #e7efea 0%)';
    el.percent.textContent='0%';el.done.textContent='0';el.remaining.textContent='0';
    el.dimensions.textContent='—';el.colorCount.textContent='—';
    el.stitchCount.textContent='—';el.lastSaved.textContent='—';
    setMode('mark');
    window.PuntoPuntoI18n?.refresh();
  }
  function closeOXSProject({confirmExit=true,showHome=true}={}){
    if(!state.pattern)return true;
    if(confirmExit&&!window.ppConfirm('Vuoi chiudere il progetto OXS e tornare alla home? Prima di uscire esporta il JSON dei progressi e, se hai modificato lo schema, scarica anche l’OXS aggiornato. I salvataggi già presenti nel browser non verranno eliminati.'))return false;
    if(state.dirty)saveNow();
    clearTimeout(state.savedTimer);state.savedTimer=null;
    saveOXSView();clearTimeout(oxsViewTimer);oxsViewTimer=null;
    setOXSFocus(false);closeStitchPicker();closePanels();
    edits.load(null);
    state.pattern=null;currentFileText='';state.completed.clear();state.dirty=false;
    syncOXSInlinePanels();
    resetHomeProjectUI();
    try{localStorage.removeItem('pp-last-project');}catch(_){}
    el.editor.classList.add('hidden');$('closeOXSProject').classList.add('hidden');
    ['saveProgress','loadProgress','resetProgress','exportOXS'].forEach(id=>$(id).disabled=true);
    if(showHome){el.welcome.classList.remove('hidden');el.title.removeAttribute('data-i18n-ignore');el.meta.removeAttribute('data-i18n-ignore');el.title.textContent='Il tuo prossimo ricamo';el.meta.textContent='Carica un OXS o un PDF interattivo per iniziare a lavorare';}
    return true;
  }
  async function handleOXS(file){
    if(!file)return;
    // The OXS picker accepts only OXS/XML. PDFs must be explicitly opened with "Apri PDF".
    if(!/\.(oxs|xml)$/i.test(file.name)){notify('Seleziona un file .oxs (oppure XML OXS).',true);return;}
    if(file.size>20000000){notify('Il file supera il limite di 20 MB.',true);return;}
    try{const contents=await file.text();await loadPattern(contents,file.name);closePanels();}
    catch(err){console.error(err);notify('Impossibile aprire lo schema: '+err.message,true);}
  }
  async function handleDroppedFile(file){
    if(!file)return;
    // The drop area is the only multi-format entry point; buttons remain format-specific.
    if(/\.pdf$/i.test(file.name)){
      if(window.PuntoPuntoPDFImport)return window.PuntoPuntoPDFImport.readFile(file);
      notify('L’importatore PDF non è disponibile.',true);return;
    }
    return handleOXS(file);
  }
  // v0.2: scarica sempre il progetto effettivamente aperto, compresi quelli convertiti da PDF.
  function downloadOXS(){
    if(!state.pattern||!currentFileText)return;
    const blob=new Blob([edits.exportOXS(currentFileText)],{type:'application/xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=state.pattern.filename.replace(/\.[^.]+$/,'')+'.oxs';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    notify('Schema OXS scaricato. I progressi restano nel salvataggio JSON separato.');
  }
  async function downloadJSON(){
    if(!state.pattern)return;
    saveNow();
    const payload={app:'PuntoPunto',version:1,patternFingerprint:await fingerprint(edits.exportOXS(currentFileText)),patternFile:state.pattern.filename,
      dimensions:{width:state.pattern.width,height:state.pattern.height},completed:[...state.completed],completedTokens:state.pattern.stitches.filter(s=>state.completed.has(s.id)).map(edits.stitchKey),savedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=state.pattern.filename.replace(/\.[^.]+$/,'')+'-progressi.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    notify('Progressi esportati. Conserva il JSON insieme al file OXS.');
  }
  async function importProgress(file){
    if(!file||!state.pattern)return;
    if(file.size>5000000){notify('Il file dei progressi è troppo grande.',true);return;}
    try{
      const data=JSON.parse(await file.text());
      if(data.app!=='PuntoPunto'||data.version!==1||!Array.isArray(data.completed))throw Error('File dei progressi non riconosciuto.');
      const currentFingerprint=await fingerprint(edits.exportOXS(currentFileText));
      if(data.patternFingerprint!==currentFingerprint && data.patternFingerprint!==state.pattern.id)throw Error('Questi progressi appartengono a un altro file OXS. Apri prima lo schema corretto.');
      if(Array.isArray(data.completedTokens)){
        const keys=new Set(data.completedTokens);state.completed=new Set(state.pattern.stitches.filter(s=>keys.has(edits.stitchKey(s))).map(s=>s.id));
      }else{
        if(!data.completed.every(n=>Number.isInteger(n)&&n>=0&&n<state.pattern.stitches.length))throw Error('Il salvataggio contiene punti non validi.');
        state.completed=new Set(data.completed);
      }
      lastMarkUndo=null;saveNow();renderLegends();updateStats();draw();
      notify('Progressi importati: '+state.completed.size+' punti completati.');
    }catch(err){notify(err.message||'Impossibile leggere il file JSON.',true);}
  }
  function setMode(mode){
    closeStitchPicker();
    state.mode=mode;
    for(const [id,m]of [['markTool','mark'],['panTool','pan'],['paintTool','paint'],['eraseTool','erase'],['restoreTool','restore']]){
      $(id).classList.toggle('active',mode===m);$(id).setAttribute('aria-pressed',String(mode===m));
    }
    if(['paint','erase','restore'].includes(mode)&&(state.activeColor!==null||state.activeKind!==null)){state.activeColor=null;state.activeKind=null;renderLegends();draw();}
    el.wrap.classList.toggle('panning',mode==='pan');
    const hints={mark:'Tocca per segnare il punto: in caso di sovrapposizioni scegli quale. Trascina per segnare più caselle.',pan:'Trascina il disegno per spostarti nello schema.',paint:'Tocca o trascina per applicare colore e tipo di punto scelti.',erase:'Tocca o trascina per cancellare i punti dalla griglia. Le linee di contorno non vengono eliminate.',restore:'Tocca o trascina per ripristinare le caselle del disegno originale.'};
    $('canvasHint').textContent=hints[mode]||hints.mark;
    $('editControls').classList.toggle('is-editing', ['paint','erase','restore'].includes(mode));
  }

  function refreshEditedView(){
    closeStitchPicker();
    const p=state.pattern;if(!p)return;
    lastMarkUndo=null;syncOXSWorkbar();
    el.stitchCount.textContent=p.stitches.length.toLocaleString(window.PuntoPuntoI18n?.language==='en'?'en-US':'it-IT');
    el.colorCount.textContent=new Set(p.stitches.map(s=>s.palIndex)).size;
    el.summary.textContent=`${new Set(p.stitches.map(s=>s.palIndex)).size} colori nello schema`;
    renderLegends();updateStats();draw();
  }
  function matchesFilter(s){return (state.activeColor===null||s.palIndex===state.activeColor)&&(state.activeKind===null||visuals.token(s)===state.activeKind)&&(!state.pendingOnly||!state.completed.has(s.id));}
  function renderLegends(){
    const p=state.pattern;if(!p)return;
    syncOXSWorkbar();
    const counts=new Map(),done=new Map(),kinds=new Set();
    for(const s of p.stitches){counts.set(s.palIndex,(counts.get(s.palIndex)||0)+1);if(state.completed.has(s.id))done.set(s.palIndex,(done.get(s.palIndex)||0)+1);kinds.add(visuals.token(s));}
    const lookup=el.search.value.trim().toLocaleLowerCase('it');
    const colors=[...p.palette.values()].filter(c=>counts.get(c.index)).sort((a,b)=>a.index-b.index);
    el.legend.replaceChildren();
    let visible=0;
    for(const c of colors){
      const label=`${c.number} ${c.name} ${c.index}`.toLocaleLowerCase('it');if(lookup&&!label.includes(lookup))continue;
      visible++;
      const row=document.createElement('button');row.type='button';row.className='legend-item'+(state.activeColor===c.index?' selected':'');
      row.title='Mostra soltanto il colore '+c.number;row.setAttribute('aria-pressed',String(state.activeColor===c.index));
      const sw=document.createElement('span');sw.className='legend-swatch';sw.style.background=c.color;sw.style.color=c.ink;sw.textContent=c.symbol;
      const meta=document.createElement('span');meta.className='legend-text';
      const name=document.createElement('strong');name.textContent=c.number;
      const desc=document.createElement('small');desc.textContent=c.name;
      const bar=document.createElement('span');bar.className='mini-track';const fill=document.createElement('span');fill.style.width=(100*(done.get(c.index)||0)/counts.get(c.index))+'%';bar.appendChild(fill);
      meta.append(name,desc,bar);
      const progress=document.createElement('span');progress.className='legend-stat';progress.textContent=(Math.round(100*(done.get(c.index)||0)/counts.get(c.index)))+'%';
      const sub=document.createElement('small');sub.textContent=`${done.get(c.index)||0}/${counts.get(c.index)}`;progress.appendChild(sub);
      row.append(sw,meta,progress);row.addEventListener('click',()=>{state.activeColor=state.activeColor===c.index?null:c.index;renderLegends();draw();});el.legend.appendChild(row);
    }
    if(!visible){const none=document.createElement('div');none.className='empty-side';none.textContent='Nessun filato corrisponde alla ricerca.';el.legend.appendChild(none);}
    el.all.classList.toggle('active',state.activeColor===null);
    el.all.setAttribute('aria-pressed',String(state.activeColor===null));
    el.filterInfo.textContent=state.activeColor===null?`${visible} filati`:'1 colore isolato';
    const currentKind=state.activeKind;filterKindEl.replaceChildren(new Option('Tutti i tipi di punto',''));
    for(const k of [...kinds].sort((a,b)=>visuals.name(a).localeCompare(visuals.name(b),'it'))){const quantity=p.stitches.filter(s=>visuals.token(s)===k).length;filterKindEl.add(new Option(`${visuals.glyph(k)} ${visuals.name(k)} (${quantity})`,k));}
    filterKindEl.value=currentKind??'';
    el.kinds.replaceChildren();
    const entries=[...kinds].sort((a,b)=>visuals.name(a).localeCompare(visuals.name(b),'it'));
    for(const k of entries){const item=document.createElement('button');item.type='button';item.className='kind kind-action'+(state.activeKind===k?' is-active':'');item.setAttribute('aria-pressed',String(state.activeKind===k));item.title='Isola i punti di tipo '+visuals.name(k);
      const icon=document.createElement('b');icon.textContent=visuals.glyph(k);const lab=document.createElement('span');lab.textContent=visuals.name(k);item.append(icon,lab);item.addEventListener('click',()=>{state.activeKind=state.activeKind===k?null:k;renderLegends();draw();});el.kinds.appendChild(item);}
  }
  function updateStats(){
    const p=state.pattern;if(!p)return;
    const done=state.completed.size,total=p.stitches.length,percent=total?100*done/total:0;
    el.donut.style.background=`conic-gradient(#25887b ${percent}%, #e7efea ${percent}%)`;
    el.percent.textContent=Math.round(percent)+'%';el.done.textContent=done.toLocaleString(window.PuntoPuntoI18n?.language==='en'?'en-US':'it-IT');el.remaining.textContent=(total-done).toLocaleString(window.PuntoPuntoI18n?.language==='en'?'en-US':'it-IT');
    updateSavedLabel();
  }

  function resizeCanvas(){
    const rect=el.wrap.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const dpr=Math.min(devicePixelRatio||1,2);
    el.canvas.width=Math.round(rect.width*dpr);el.canvas.height=Math.round(rect.height*dpr);
    el.canvas.style.width=rect.width+'px';el.canvas.style.height=rect.height+'px';draw();
  }
  function dimensions(){const r=el.wrap.getBoundingClientRect();return {w:r.width,h:r.height};}
  function fit(){const p=state.pattern;if(!p)return;const {w,h}=dimensions();if(!w||!h)return;
    state.cell=Math.max(2,Math.min(44,Math.min((w-55)/p.width,(h-55)/p.height)));
    state.ox=(w-p.width*state.cell)/2;state.oy=(h-p.height*state.cell)/2;updateZoom();draw();}
  function updateZoom(){el.zoom.textContent=Math.round(state.cell/22*100)+'%';}
  function zoomAt(factor,x,y){if(!state.pattern)return;const next=Math.max(2,Math.min(75,state.cell*factor)),t=next/state.cell;
    state.ox=x-(x-state.ox)*t;state.oy=y-(y-state.oy)*t;state.cell=next;updateZoom();draw();queueViewSave();}
  function pointInCanvas(e){const r=el.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function localToGrid(x,y){return {x:(x-state.ox)/state.cell,y:(y-state.oy)/state.cell};}
  function rectanglePath(x,y,w=1,h=1){ctx.beginPath();ctx.rect(x,y,w,h);}
  function polygonPath(points,x,y){ctx.beginPath();ctx.moveTo(x+points[0][0],y+points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(x+points[i][0],y+points[i][1]);ctx.closePath();}
  function colorFor(palIndex){return state.pattern.palette.get(palIndex)||{color:'#acb9a8',ink:'#fff',symbol:'×'};}
  function shapeForPart(s){
    // Two triangles divided by the diagonal. palindex1 occupies the left-hand region.
    const d=s.direction===1;
    if(d)return s.side===1?[[0,0],[0,1],[1,1]]:[[0,0],[1,0],[1,1]];
    return s.side===1?[[0,0],[1,0],[0,1]]:[[1,0],[1,1],[0,1]];
  }
  function overlapsAnotherStitch(x,y){
    const p=state.pattern,key=Math.floor(y)*10000+Math.floor(x);
    return (p.byCell.get(key)?.length||0)+(p.specialsByCell?.get(key)||[]).filter(s=>s.kind!=='back').length>1;
  }
  function paintCell(s){
    const c=colorFor(s.palIndex),done=state.completed.has(s.id),filtered=!matchesFilter(s);
    ctx.save();ctx.globalAlpha=filtered ? .13 : 1;
    if(s.kind==='full')rectanglePath(s.x,s.y);
    else if(s.kind==='part')polygonPath(shapeForPart(s),s.x,s.y);
    else rectanglePath(s.x,s.y);
    ctx.fillStyle=state.mono?'#fafbf8':c.color;ctx.fill();
    ctx.save();ctx.clip();
    if(done){ctx.fillStyle='rgba(250,251,248,.74)';ctx.fillRect(s.x,s.y,1,1);
      if(!overlapsAnotherStitch(s.x,s.y)){
        ctx.beginPath();ctx.moveTo(s.x+.15,s.y+.56);ctx.lineTo(s.x+.42,s.y+.8);ctx.lineTo(s.x+.88,s.y+.2);
        ctx.strokeStyle='#176e60';ctx.lineWidth=Math.max(.05,2/state.cell);ctx.stroke();
      }}
    else if(state.showSymbols&&state.cell>=12){
      ctx.font=`700 ${Math.min(.71,16/state.cell)}px ui-sans-serif,Segoe UI Symbol,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=state.mono?'#213e37':c.ink;
      if(s.kind==='full')ctx.fillText(state.mono?'×':c.symbol,s.x+.5,s.y+.53);
      else if(s.kind==='part')ctx.fillText(state.mono?'◩':c.symbol,s.x+(s.side===1?.31:.69),s.y+.53);
      else{ctx.fillText(visuals.glyph(visuals.token(s)),s.x+.5,s.y+.53);}
    }else if(!state.showSymbols&&s.kind==='half'){
      ctx.beginPath();if(s.direction===3){ctx.moveTo(s.x,s.y+1);ctx.lineTo(s.x+1,s.y);}else{ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+1,s.y+1);}
      ctx.strokeStyle=c.ink;ctx.lineWidth=Math.max(.065,1.5/state.cell);ctx.stroke();
    }
    ctx.restore();ctx.restore();
  }
  function paintOrnament(s){
    const c=colorFor(s.palIndex),done=state.completed.has(s.id),filtered=!matchesFilter(s);
    ctx.save();ctx.globalAlpha=filtered ? .14 : 1;ctx.fillStyle=done?'#aab8af':(state.mono?'#234f43':c.color);ctx.strokeStyle=done?'#aab8af':(state.mono?'#234f43':c.color);ctx.lineWidth=Math.max(.09,2.5/state.cell);
    let x=s.x1,y=s.y1;
    if(s.kind==='knot'||s.kind==='bead'){ctx.beginPath();ctx.arc(x,y,s.kind==='knot'?.16:.22,0,Math.PI*2);ctx.fill();
      if(s.kind==='bead'){ctx.strokeStyle=c.ink;ctx.lineWidth=.05;ctx.stroke();}
    }else if(s.kind==='quarter'){
      x=Math.floor(x);y=Math.floor(y);const cx=s.x1-x>=.5?1:0,cy=s.y1-y>=.5?1:0;
      const endX=cx?1:0,endY=cy?1:0;
      ctx.beginPath();ctx.moveTo(x+.5,y+.5);ctx.lineTo(x+endX,y+endY);ctx.stroke();
    }else if(s.kind==='tent'){
      x=Math.floor(x);y=Math.floor(y);ctx.beginPath();if(s.direction===1){ctx.moveTo(x,y);ctx.lineTo(x+1,y+1);}else{ctx.moveTo(x+1,y);ctx.lineTo(x,y+1);}ctx.stroke();
    }else{
      const w=s.kind==='verticalhalf'?.5:1,h=s.kind==='horizontalhalf'?.5:1;
      ctx.fillRect(x,y,w,h);
      if(s.kind==='fullcross'){ctx.strokeStyle=c.ink;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+1,y+1);ctx.moveTo(x+1,y);ctx.lineTo(x,y+1);ctx.stroke();}
    }
    if(done&&!overlapsAnotherStitch(s.x1,s.y1)){ctx.fillStyle='#176e60';ctx.font='bold .45px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✓',s.x1+.17,s.y1+.12);}
    ctx.restore();
  }
  function paintBack(s){
    const c=colorFor(s.palIndex),done=state.completed.has(s.id),filtered=!matchesFilter(s);
    ctx.save();ctx.globalAlpha=filtered ? .16 : 1;
    ctx.lineWidth=Math.max(.09,2.2/state.cell);ctx.lineCap='round';ctx.strokeStyle=done?'#afbbb3':(state.mono?'#234f43':c.color);
    if(done)ctx.setLineDash([.2,.17]);ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke();ctx.restore();
  }
  // v0.9.8.8.19: render completion above EVERY overlapping layer.
  // The underlying stitched shapes are intentionally left unchanged. Without
  // this pass, a later uncompleted half stitch can paint over the checkmark of
  // an already-completed full cross (and vice versa for other combinations).
  function paintOverlapCompletion(stitches,x,y){
    if(stitches.length<2||!stitches.some(s=>state.completed.has(s.id)))return;
    // Mirror the picker priority: partial/half before full, then ornaments.
    const priority={part:0,half:1,full:2};
    const ordered=[...stitches].sort((a,b)=>(priority[a.kind]??3)-(priority[b.kind]??3)||a.id-b.id);
    const done=ordered.filter(s=>state.completed.has(s.id));
    const large=state.cell>=14&&ordered.length<=4;
    const center=(i)=>large?{x:x+(i%2?.74:.26),y:y+(i<2?.27:.73)}:{x:x+.74,y:y+.26};
    const radius=large?.205:.255;
    ctx.save();
    ctx.lineWidth=Math.max(.045,1/state.cell);
    ctx.lineJoin='round';ctx.lineCap='round';
    const indices=large?ordered.map((s,i)=>state.completed.has(s.id)?i:-1).filter(i=>i!==-1):[0];
    for(const i of indices){
      const point=center(i);
      ctx.beginPath();ctx.arc(point.x,point.y,radius,0,Math.PI*2);
      ctx.fillStyle='#ffffff';ctx.fill();ctx.strokeStyle='#146550';ctx.stroke();
      ctx.beginPath();ctx.moveTo(point.x-radius*.57,point.y+.01);
      ctx.lineTo(point.x-radius*.14,point.y+radius*.47);
      ctx.lineTo(point.x+radius*.63,point.y-radius*.49);
      ctx.strokeStyle='#146550';ctx.lineWidth=Math.max(.095,1.55/state.cell);ctx.stroke();
    }
    if(!large&&state.cell>=16&&ordered.length>4){
      const point=center(0);
      ctx.font='bold .24px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='#ffffff';ctx.fillText(`${done.length}/${ordered.length}`,point.x,point.y+.43);
    }
    ctx.restore();
  }
  function draw(){
    const p=state.pattern;if(!p||!el.canvas.width)return;
    const {w,h}=dimensions(),dpr=el.canvas.width/w;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#eef2ed';ctx.fillRect(0,0,w,h);
    const size=state.cell;ctx.save();ctx.translate(state.ox,state.oy);ctx.scale(size,size);
    const fromX=Math.max(0,Math.floor(-state.ox/size)-1),toX=Math.min(p.width,Math.ceil((w-state.ox)/size)+1);
    const fromY=Math.max(0,Math.floor(-state.oy/size)-1),toY=Math.min(p.height,Math.ceil((h-state.oy)/size)+1);
    ctx.fillStyle=(p.palette.get(0)||{}).color||'#ffffff';ctx.fillRect(0,0,p.width,p.height);
    for(let y=fromY;y<toY;y++)for(let x=fromX;x<toX;x++){
      const group=p.byCell.get(y*10000+x);if(group)for(const s of group)paintCell(s);
    }
    // Draw grid lines after filled cells, using thicker lines every ten squares.
    if(size>=5){ctx.beginPath();for(let x=fromX;x<=toX;x++){ctx.moveTo(x,fromY);ctx.lineTo(x,toY);}for(let y=fromY;y<=toY;y++){ctx.moveTo(fromX,y);ctx.lineTo(toX,y);}
      ctx.strokeStyle=size<9?'rgba(69,85,79,.14)':'rgba(70,85,79,.24)';ctx.lineWidth=Math.max(.025,.7/size);ctx.stroke();}
    ctx.beginPath();for(let x=Math.ceil(fromX/10)*10;x<=toX;x+=10){ctx.moveTo(x,fromY);ctx.lineTo(x,toY);}for(let y=Math.ceil(fromY/10)*10;y<=toY;y+=10){ctx.moveTo(fromX,y);ctx.lineTo(toX,y);}
    ctx.strokeStyle='rgba(42,68,59,.58)';ctx.lineWidth=Math.max(.05,1.35/size);ctx.stroke();
    for(const s of p.ornaments){if(s.x1>=fromX-1&&s.x1<=toX+1&&s.y1>=fromY-1&&s.y1<=toY+1)paintOrnament(s);}
    for(const s of p.linear){if(Math.max(s.x1,s.x2)>=fromX-1&&Math.min(s.x1,s.x2)<=toX+1&&Math.max(s.y1,s.y2)>=fromY-1&&Math.min(s.y1,s.y2)<=toY+1)paintBack(s);}
    ctx.strokeStyle='#566e65';ctx.lineWidth=Math.max(.08,1.5/size);ctx.strokeRect(0,0,p.width,p.height);
    // Draw checks after all cell fills, ornaments and lines so neither a half
    // stitch nor a full stitch can hide the completion of another stitch.
    for(let y=fromY;y<toY;y++)for(let x=fromX;x<toX;x++){
      const key=y*10000+x;
      const base=p.byCell.get(key)||[];
      const special=(p.specialsByCell?.get(key)||[]).filter(s=>s.kind!=='back');
      if(base.length+special.length>1)paintOverlapCompletion([...base,...special],x,y);
    }
    if(keyboardCell&&document.activeElement===el.wrap){
      // Visible selection for keyboard navigation; no change to stitch rendering.
      ctx.save();ctx.lineWidth=Math.max(.08,3/size);
      ctx.strokeStyle='#122d77';ctx.strokeRect(keyboardCell.x+.055,keyboardCell.y+.055,.89,.89);
      ctx.setLineDash([Math.max(.12,5/size),Math.max(.09,3/size)]);
      ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(.065,1.7/size);
      ctx.strokeRect(keyboardCell.x+.12,keyboardCell.y+.12,.76,.76);
      ctx.restore();
    }
    ctx.restore();
    // Fixed top/left index labels, when zoomed in far enough.
    if(size>=14){ctx.font='600 10px ui-sans-serif, sans-serif';ctx.fillStyle='#58786d';ctx.textBaseline='middle';
      for(let x=Math.ceil(fromX/10)*10;x<=toX;x+=10){if(x===0)continue;let sx=state.ox+x*size;if(sx>=18&&sx<w-25){ctx.textAlign='center';ctx.fillText(String(x),sx,Math.max(13,Math.min(h-12,state.oy-10)));}}
      for(let y=Math.ceil(fromY/10)*10;y<=toY;y+=10){if(y===0)continue;let sy=state.oy+y*size;if(sy>=15&&sy<h-15){ctx.textAlign='left';ctx.fillText(String(y),Math.max(6,Math.min(w-30,state.ox-21)),sy);}}
    }
  }

  function stitchChoices(gx,gy,touch=false){
    const p=state.pattern;if(!p)return [];
    const ix=Math.floor(gx),iy=Math.floor(gy);
    if(ix<0||iy<0||ix>=p.width||iy>=p.height)return [];
    const visibleSpecial=(p.specialsByCell?.get(iy*10000+ix)||[]).filter(matchesFilter);
    // The 15px touch radius makes small ornaments selectable on phones.
    // Distances remain bounded to avoid selecting distant neighbouring points.
    const radius=touch?Math.min(.56,Math.max(.30,15/state.cell)):Math.min(.30,Math.max(.10,7/state.cell));
    const distSegment=(ax,ay,bx,by)=>{
      const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
      const t=den?Math.max(0,Math.min(1,((gx-ax)*dx+(gy-ay)*dy)/den)):0;
      return Math.hypot(gx-ax-t*dx,gy-ay-t*dy);
    };
    const specialMatches=[];
    for(const s of visibleSpecial){
      let distance=Infinity;
      if(s.kind==='back')distance=distSegment(s.x1,s.y1,s.x2,s.y2);
      else if(s.kind==='tent'){
        const x=Math.floor(s.x1),y=Math.floor(s.y1);
        distance=s.direction===1?distSegment(x,y,x+1,y+1):distSegment(x+1,y,x,y+1);
      }else if(s.kind==='quarter'){
        const x=Math.floor(s.x1),y=Math.floor(s.y1);
        distance=distSegment(x+.5,y+.5,x+(s.x1-x>=.5?1:0),y+(s.y1-y>=.5?1:0));
      }else if(s.kind==='verticalhalf'||s.kind==='horizontalhalf'||s.kind==='fullcross'){
        const w=s.kind==='verticalhalf'?.5:1,h=s.kind==='horizontalhalf'?.5:1;
        const cx=Math.max(s.x1,Math.min(s.x1+w,gx)),cy=Math.max(s.y1,Math.min(s.y1+h,gy));
        distance=Math.hypot(gx-cx,gy-cy);
      }else distance=Math.hypot(gx-s.x1,gy-s.y1);
      if(distance<=radius)specialMatches.push({stitch:s,distance});
    }
    specialMatches.sort((a,b)=>a.distance-b.distance||a.stitch.id-b.stitch.id);
    const group=p.byCell.get(iy*10000+ix)||[];
    const fx=gx-ix,fy=gy-iy;
    const candidates=group.filter(s=>{
      if(s.kind!=='part')return true;
      if(s.direction===1)return s.side===1?fx<=fy:fx>fy;
      return s.side===1?fx+fy<=1:fx+fy>1;
    });
    const visible=candidates.filter(matchesFilter);
    // Preserve v0.9.6 priority for drag-marking and Ctrl+click.
    const base=visible.find(s=>s.kind==='part')||visible.find(s=>s.kind==='half')||visible.find(s=>s.kind==='full')||null;
    const ordered=[];
    if(base)ordered.push(base);
    for(const s of visible)if(s!==base)ordered.push(s);
    for(const item of specialMatches)if(!ordered.includes(item.stitch))ordered.push(item.stitch);
    return ordered;
  }
  function pickStitch(gx,gy,preferSpecial=false){
    const list=stitchChoices(gx,gy);
    return preferSpecial?(list.find(s=>s.kind==='back'||state.pattern?.ornaments.includes(s))||list[0]||null):(list[0]||null);
  }
  function closeStitchPicker(restoreFocus=false){
    if(state.pickerTimer!==null){clearTimeout(state.pickerTimer);state.pickerTimer=null;}
    const wasOpen=!!state.picker;
    state.picker=null;
    $('stitchPicker').classList.add('hidden');
    $('stitchPickerList').replaceChildren();
    if(wasOpen&&restoreFocus)el.wrap.focus({preventScroll:true});
  }
  function openStitchPicker(point,choices){
    closeStitchPicker();
    if(!state.pattern||choices.length<2)return;
    const {w,h}=dimensions();
    const popup=$('stitchPicker'),items=$('stitchPickerList');
    const grid=localToGrid(point.x,point.y);
    const en=window.PuntoPuntoI18n?.language==='en';
    const t=window.PuntoPuntoI18n?.t||((s)=>s);
    $('stitchPickerTitle').textContent=`${en?'Cell':'Casella'} ${Math.floor(grid.x)+1}, ${Math.floor(grid.y)+1} · ${en?'choose a stitch':'scegli il punto'}`;
    state.picker={choices:choices.map(s=>s.id)};
    for(const s of choices){
      const pal=colorFor(s.palIndex),def=kindDefs[s.kind]||['·',s.kind];
      const button=document.createElement('button');button.type='button';button.className='oxs-picker-choice';
      const sw=document.createElement('span');sw.className='oxs-picker-swatch';sw.style.background=pal.color;sw.style.color=pal.ink;sw.textContent=def[0];
      const desc=document.createElement('span');desc.className='oxs-picker-desc';
      const name=document.createElement('strong');name.textContent=t(def[1]);
      const small=document.createElement('small');small.textContent=`${pal.number||s.palIndex} · ${pal.name||'Filato'}`;
      const done=document.createElement('span');done.className='oxs-picker-status';done.textContent=state.completed.has(s.id)?(en?'✓ Done':'✓ Fatto'):(en?'To do':'Da fare');
      desc.append(name,small);button.append(sw,desc,done);
      button.setAttribute('aria-label',`${t(def[1])}, ${en?'thread':'filato'} ${pal.number||s.palIndex}, ${state.completed.has(s.id)?(en?'completed; mark unfinished':'completato, segna da fare'):(en?'unfinished; mark completed':'da fare, segna completato')}`);
      button.addEventListener('click',()=>{if(!state.picker||!state.picker.choices.includes(s.id))return;closeStitchPicker();setCompleted(s.id,!state.completed.has(s.id));rememberWorkPoint(grid);el.wrap.focus({preventScroll:true});});
      items.appendChild(button);
    }
    popup.classList.remove('hidden');
    // Clamp to the visible canvas. The picker lives inside canvasWrap, not the PDF overlay.
    const pw=popup.offsetWidth,ph=popup.offsetHeight;
    const left=Math.min(Math.max(6,point.x+12),Math.max(6,w-pw-6));
    const top=point.y+ph+14>h?Math.max(6,point.y-ph-12):Math.min(Math.max(6,point.y+12),Math.max(6,h-ph-6));
    popup.style.left=left+'px';popup.style.top=top+'px';
    items.querySelector('button')?.focus({preventScroll:true});
  }
  function setCompleted(id,value){
    const old=state.completed.has(id);if(old===value)return;
    if(markStroke){if(!markStroke.has(id))markStroke.set(id,old);}
    else lastMarkUndo=[[id,old]];
    value?state.completed.add(id):state.completed.delete(id);
    queueSave();renderLegends();updateStats();draw();syncOXSWorkbar();
  }
  function markAt(point,drag,preferSpecial=false){
    const g=localToGrid(point.x,point.y);
    const s=pickStitch(g.x,g.y,preferSpecial);
    if(!s||drag.seen.has(s.id))return;
    drag.seen.add(s.id);
    if(drag.target===null)drag.target=!state.completed.has(s.id);
    setCompleted(s.id,drag.target);
    rememberWorkPoint(g);
  }
  function canvasPointerDown(e){
    if(!state.pattern)return;
    if(e.pointerType==='mouse'&&e.button!==0&&e.button!==1)return;
    const point=pointInCanvas(e);
    if(e.pointerType==='touch'){
      touchGesture.points.set(e.pointerId,point);
      try{el.canvas.setPointerCapture(e.pointerId);}catch{}
      if(touchGesture.points.size>=2){
        // A second finger cancels the pending single-touch stroke without saving edits.
        touchGesture.pinching=true;markStroke=null;state.drag=null;el.wrap.classList.remove('grabbing');closeStitchPicker();
        const g=touchPinchGeometry();touchGesture.lastDistance=g.distance;touchGesture.lastCenter=g.center;
        e.preventDefault();return;
      }
      if(touchGesture.pinching){e.preventDefault();return;}
    }
    closeStitchPicker();
    const pan=state.mode==='pan'||e.button===1||e.altKey||e.shiftKey;
    const drag={id:e.pointerId,pan,last:point,start:point,target:null,seen:new Set(),pending:null,preferSpecial:!!e.ctrlKey};
    state.drag=drag;
    if(!pan&&state.mode==='mark')markStroke=new Map();
    try{el.canvas.setPointerCapture(e.pointerId);}catch{}
    if(pan)el.wrap.classList.add('grabbing');
    if(e.pointerType==='touch'){
      // Defer mark/erase/paint until finger release. The gesture may become a pinch.
      drag.touchTrace=[point];e.preventDefault();return;
    }
    if(pan){}
    else if(['paint','erase','restore'].includes(state.mode))edits.at(localToGrid(point.x,point.y),state.mode,drag);
    else if(!drag.preferSpecial){
      const g=localToGrid(point.x,point.y),choices=stitchChoices(g.x,g.y,false);
      if(choices.length>1)drag.pending={point,choices};
      else markAt(point,drag);
    }else markAt(point,drag,true);
    e.preventDefault();
  }
  function canvasPointerMove(e){
    if(!state.pattern)return;
    const pt=pointInCanvas(e),g=localToGrid(pt.x,pt.y);
    el.coords.textContent=g.x>=0&&g.y>=0&&g.x<state.pattern.width&&g.y<state.pattern.height?`Casella ${Math.floor(g.x)+1}, ${Math.floor(g.y)+1}`:'Fuori schema';
    if(e.pointerType==='touch'&&touchGesture.points.has(e.pointerId)){
      touchGesture.points.set(e.pointerId,pt);
      if(touchGesture.pinching){
        if(touchGesture.points.size>=2){
          const current=touchPinchGeometry(),before=touchGesture.lastCenter;
          if(before){
            const factor=current.distance/touchGesture.lastDistance;
            zoomAt(factor,before.x,before.y);
            state.ox+=current.center.x-before.x;
            state.oy+=current.center.y-before.y;
            draw();queueViewSave();
          }
          touchGesture.lastDistance=current.distance;touchGesture.lastCenter=current.center;
        }
        e.preventDefault();return;
      }
    }
    if(!state.drag||state.drag.id!==e.pointerId)return;
    const drag=state.drag;
    if(drag.pan){state.ox+=pt.x-drag.last.x;state.oy+=pt.y-drag.last.y;draw();queueViewSave();}
    else if(drag.touchTrace){
      const prev=drag.touchTrace[drag.touchTrace.length-1];
      if(Math.hypot(pt.x-prev.x,pt.y-prev.y)>=2)drag.touchTrace.push(pt);
    }
    else if(['paint','erase','restore'].includes(state.mode))edits.at(g,state.mode,drag);
    else if(drag.pending){
      if(Math.hypot(pt.x-drag.start.x,pt.y-drag.start.y)>9){
        const origin=drag.pending.point;drag.pending=null;
        markAt(origin,drag);markAt(pt,drag);
      }
    }else markAt(pt,drag,drag.preferSpecial);
    drag.last=pt;
    if(e.pointerType==='touch')e.preventDefault();
  }
  function canvasPointerUp(e){
    if(e.pointerType==='touch'&&touchGesture.points.has(e.pointerId)){
      touchGesture.points.delete(e.pointerId);
      if(touchGesture.pinching){
        // Never interpret fingers lifted after a pinch as stitch taps.
        markStroke=null;state.drag=null;el.wrap.classList.remove('grabbing');
        if(touchGesture.points.size===0){touchGesture.pinching=false;touchGesture.lastCenter=null;touchGesture.lastDistance=0;}
        e.preventDefault();return;
      }
    }
    if(state.drag?.id!==e.pointerId)return;
    const drag=state.drag;state.drag=null;el.wrap.classList.remove('grabbing');
    if(drag.touchTrace){
      if(e.type!=='pointerup'){finishMarkStroke();return;}
      const tail=pointInCanvas(e),trace=drag.touchTrace;
      if(Math.hypot(tail.x-trace[trace.length-1].x,tail.y-trace[trace.length-1].y)>2)trace.push(tail);
      if(drag.pan){finishMarkStroke();return;}
      const moved=Math.hypot(tail.x-drag.start.x,tail.y-drag.start.y)>9;
      if(!moved){
        const point=drag.start;
        if(['paint','erase','restore'].includes(state.mode))edits.at(localToGrid(point.x,point.y),state.mode,drag);
        else{
          const g=localToGrid(point.x,point.y),choices=stitchChoices(g.x,g.y,true);
          if(choices.length>1){
            const pattern=state.pattern;
            state.pickerTimer=setTimeout(()=>{state.pickerTimer=null;if(pattern===state.pattern&&state.mode==='mark')openStitchPicker(point,choices);},85);
          }else markAt(point,drag);
        }
      }else if(['paint','erase','restore'].includes(state.mode)){
        for(const point of trace)edits.at(localToGrid(point.x,point.y),state.mode,drag);
      }else for(const point of trace)markAt(point,drag);
      finishMarkStroke();return;
    }
    finishMarkStroke();
    if(e.type==='pointerup'&&drag.pending){
      const pattern=state.pattern,selection=drag.pending;
      state.pickerTimer=setTimeout(()=>{
        state.pickerTimer=null;
        if(pattern===state.pattern&&state.mode==='mark')openStitchPicker(selection.point,selection.choices);
      },85);
    }
  }
  // WCAG keyboard path: arrow keys move the virtual focus (one cell, or ten with Shift).
  // Enter/Space delegates to the same stitch chooser and mutation logic as pointer input.
  function positionKeyboardCell(){
    if(!state.pattern)return;
    if(!keyboardCell){
      const d=dimensions(),g=localToGrid(d.w/2,d.h/2);
      keyboardCell={x:Math.max(0,Math.min(state.pattern.width-1,Math.floor(lastWorkPoint?.x??g.x))),
        y:Math.max(0,Math.min(state.pattern.height-1,Math.floor(lastWorkPoint?.y??g.y)))};
    }
    const d=dimensions(),margin=Math.max(14,Math.min(45,state.cell));
    const x=state.ox+(keyboardCell.x+.5)*state.cell,y=state.oy+(keyboardCell.y+.5)*state.cell;
    if(x<margin)state.ox+=margin-x;else if(x>d.w-margin)state.ox+=d.w-margin-x;
    if(y<margin)state.oy+=margin-y;else if(y>d.h-margin)state.oy+=d.h-margin-y;
    draw();queueViewSave();
  }
  function keyboardCellAnnouncement(action=''){
    if(!state.pattern||!keyboardCell)return;
    const en=window.PuntoPuntoI18n?.language==='en';
    const {x,y}=keyboardCell;
    const choices=stitchChoices(x+.5,y+.5);
    const completed=choices.filter(s=>state.completed.has(s.id)).length;
    const s=en?`Cell ${x+1}, ${y+1}. ${choices.length} stitches; ${completed} completed.`:
      `Casella ${x+1}, ${y+1}. ${choices.length} punti; ${completed} completati.`;
    $('oxsKeyboardStatus').textContent=action?`${s} ${action}`:s;
    el.coords.textContent=(en?'Cell ':'Casella ')+(x+1)+', '+(y+1);
  }
  function oxsKeyboardNavigate(e){
    if(e.target!==el.wrap||!state.pattern||state.picker||el.editor.classList.contains('hidden'))return;
    const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
    if(directions[e.key]||e.key==='Home'||e.key==='End'){
      e.preventDefault();positionKeyboardCell();
      const step=e.shiftKey?10:1;
      if(directions[e.key]){
        const [dx,dy]=directions[e.key];keyboardCell.x=Math.max(0,Math.min(state.pattern.width-1,keyboardCell.x+dx*step));
        keyboardCell.y=Math.max(0,Math.min(state.pattern.height-1,keyboardCell.y+dy*step));
      }else keyboardCell.x=e.key==='Home'?0:state.pattern.width-1;
      positionKeyboardCell();keyboardCellAnnouncement();return;
    }
    if(e.key!=='Enter'&&e.key!==' ')return;
    e.preventDefault();positionKeyboardCell();
    const point={x:state.ox+(keyboardCell.x+.5)*state.cell,y:state.oy+(keyboardCell.y+.5)*state.cell};
    const g={x:keyboardCell.x+.5,y:keyboardCell.y+.5};
    if(state.mode==='mark'){
      const choices=stitchChoices(g.x,g.y);
      if(choices.length>1){openStitchPicker(point,choices);return;}
      if(choices.length===1){const s=choices[0];setCompleted(s.id,!state.completed.has(s.id));rememberWorkPoint(g);}
    }else if(['paint','erase','restore'].includes(state.mode)){
      edits.at(g,state.mode,{seen:new Set()});rememberWorkPoint(g);
    }
    keyboardCellAnnouncement();
  }
  function syncPanelAria(){
    $('toggleLegend').setAttribute('aria-expanded',String(el.left.classList.contains('open')));
    $('toggleStats').setAttribute('aria-expanded',String(el.right.classList.contains('open')));
  }
  function closePanels(){el.left.classList.remove('open');el.right.classList.remove('open');el.backdrop.classList.remove('visible');syncPanelAria();}
  function togglePanel(which){if(mobileInsightsActive){jumpToOXSSection(which==='left'?el.left:el.right);return;}
    const panel=which==='left'?el.left:el.right,other=which==='left'?el.right:el.left;
    other.classList.remove('open');panel.classList.toggle('open');el.backdrop.classList.toggle('visible',panel.classList.contains('open'));
    syncPanelAria();
    if(panel.classList.contains('open'))panel.querySelector('.close-panel')?.focus({preventScroll:true});
    else $(which==='left'?'toggleLegend':'toggleStats').focus({preventScroll:true});}
  function buildHeroArt(){
    const hero=$('heroArt');hero.replaceChildren();
    for(let y=0;y<11;y++)for(let x=0;x<13;x++){
      const dot=document.createElement('span');dot.className='art-cell';
      const dx=x-6,dy=y-4.5,r=Math.hypot(dx*.85,dy*1.03),petals=(Math.cos(Math.atan2(dy,dx)*5)+1)/2;
      const floral=(r>1.5&&r<4.65&&petals>.30),core=r<1.8,stem=x>=6&&x<=7&&y>=6&&y<=10;
      if(floral){dot.style.background=((x+y)%4===0?'#e9a785':'#f7c8ae');dot.textContent='×';dot.style.color='#b87759';}
      else if(core){dot.style.background='#deb56d';dot.textContent='×';dot.style.color='#927034';}
      else if(stem){dot.style.background='#8db59b';dot.textContent='×';dot.style.color='#577b64';}
      hero.appendChild(dot);
    }
  }
  function events(){
    $('openFile').onclick=()=>el.oxsInput.click();$('dropArea').onclick=()=>el.oxsInput.click();
    $('mobileOpenOXS').onclick=()=>$('openFile').click();
    $('mobileOpenPDF').onclick=()=>$('openPDF').click();
    $('dropArea').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.oxsInput.click();}};
    el.oxsInput.onchange=async()=>{await handleOXS(el.oxsInput.files[0]);el.oxsInput.value='';};
    $('exportOXS').onclick=downloadOXS;$('saveProgress').onclick=downloadJSON;$('loadProgress').onclick=()=>el.progressInput.click();
    el.progressInput.onchange=async()=>{await importProgress(el.progressInput.files[0]);el.progressInput.value='';};
    $('openExample').onclick=()=>loadPattern(DEMO_OXS,'esempio-fiore.oxs').catch(e=>notify(e.message,true));
    $('closeOXSProject').onclick=()=>closeOXSProject();
    $('showAllColors').onclick=()=>{state.activeColor=null;renderLegends();draw();};
    $('oxsPendingOnly').onclick=()=>{state.pendingOnly=!state.pendingOnly;renderLegends();draw();};
    $('oxsClearFilters').onclick=clearOXSFilters;
    $('oxsUndoMark').onclick=undoOXSMark;
    $('oxsGoLast').onclick=goToLastOXSPoint;
    filterKindEl.onchange=()=>{state.activeKind=filterKindEl.value||null;renderLegends();draw();};
    viewModeEl.onchange=()=>{state.mono=viewModeEl.value==='mono';state.showSymbols=state.mono||el.symbols.checked;draw();};
    el.search.oninput=()=>renderLegends();
    el.markTool.onclick=()=>setMode('mark');el.panTool.onclick=()=>setMode('pan');
    $('paintTool').onclick=()=>setMode('paint');$('eraseTool').onclick=()=>setMode('erase');$('restoreTool').onclick=()=>setMode('restore');
    $('zoomIn').onclick=()=>{closeStitchPicker();const d=dimensions();zoomAt(1.25,d.w/2,d.h/2);};
    $('zoomOut').onclick=()=>{closeStitchPicker();const d=dimensions();zoomAt(.8,d.w/2,d.h/2);};
    $('zoomFit').onclick=()=>{closeStitchPicker();fit();queueViewSave();};
    $('toggleOXSFocus').onclick=()=>setOXSFocus(!oxsFocusMode);
    $('exitOXSFocus').onclick=()=>setOXSFocus(false);
    el.symbols.onchange=e=>{state.showSymbols=state.mono||e.target.checked;draw();};
    el.wrap.addEventListener('keydown',oxsKeyboardNavigate);
    el.wrap.addEventListener('focus',()=>{if(state.pattern){positionKeyboardCell();keyboardCellAnnouncement();}});
    el.wrap.addEventListener('blur',()=>{if(state.pattern)draw();});
    el.canvas.addEventListener('pointerdown',canvasPointerDown);
    el.canvas.addEventListener('pointermove',canvasPointerMove);
    el.canvas.addEventListener('pointerup',canvasPointerUp);
    el.canvas.addEventListener('pointercancel',canvasPointerUp);
    el.canvas.addEventListener('wheel',e=>{if(!state.pattern)return;closeStitchPicker();e.preventDefault();const pt=pointInCanvas(e);zoomAt(e.deltaY<0?1.125:1/1.125,pt.x,pt.y);},{passive:false});
    $('toggleLegend').onclick=()=>togglePanel('left');$('toggleStats').onclick=()=>togglePanel('right');el.backdrop.onclick=closePanels;
    $('oxsJumpCanvas').onclick=jumpToOXSCanvas;
    $('oxsJumpProgress').onclick=()=>jumpToOXSSection(el.right);$('oxsJumpThreads').onclick=()=>jumpToOXSSection(el.left);
    document.querySelectorAll('.close-panel').forEach(b=>b.onclick=()=>{
      const panel=b.closest('.sidebar');closePanels();
      (panel===el.left?$('toggleLegend'):$('toggleStats')).focus({preventScroll:true});
    });
    el.reset.onclick=()=>{if(!state.pattern||!window.ppConfirm('Vuoi davvero azzerare TUTTI i punti completati in questo progetto?'))return;
      state.completed.clear();lastMarkUndo=null;saveNow();renderLegends();updateStats();draw();notify('Tracciamento azzerato.');};
    const drop=$('dropArea');
    for(const target of [drop,document.body]){
      target.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();drop.classList.add('dragover');}});
      target.addEventListener('dragleave',()=>drop.classList.remove('dragover'));
      target.addEventListener('drop',async e=>{if(e.dataTransfer?.files.length){e.preventDefault();e.stopPropagation();drop.classList.remove('dragover');await handleDroppedFile(e.dataTransfer.files[0]);}});
    }
    window.addEventListener('resize',syncOXSInlinePanels);
    window.addEventListener('pagehide',()=>{if(state.dirty)saveNow();saveOXSView();});
    window.addEventListener('beforeunload',event=>{if(state.dirty||(!state.saveAvailable&&state.pattern)){event.preventDefault();event.returnValue='';}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state.dirty)saveNow();saveOXSView();}});
    window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.picker){e.preventDefault();closeStitchPicker(true);}else closePanels();}});
    $('stitchPickerClose').onclick=()=>closeStitchPicker(true);
    document.addEventListener('pointerdown',e=>{if(state.picker&&!$('stitchPicker').contains(e.target)&&e.target!==el.canvas)closeStitchPicker();});
    resizeObserver=new ResizeObserver(()=>resizeCanvas());resizeObserver.observe(el.wrap);
  }
  const DEMO_OXS = "<?xml version='1.0' encoding='utf-8'?>\n<chart>\n  <properties charttitle=\"Fiore di primavera\" author=\"PuntoPunto\" chartwidth=\"34\" chartheight=\"34\" stitchesperinch=\"14\" palettecount=\"7\" />\n  <palette>\n    <palette_item index=\"0\" number=\"Tessuto\" name=\"Avorio\" color=\"FFF9F1\" />\n    <palette_item index=\"1\" number=\"DMC 3712\" name=\"Salmone medio\" color=\"EAA895\" />\n    <palette_item index=\"2\" number=\"DMC 761\" name=\"Rosa chiaro\" color=\"F1C5C1\" />\n    <palette_item index=\"3\" number=\"DMC 3820\" name=\"Paglia scuro\" color=\"D7AD59\" />\n    <palette_item index=\"4\" number=\"DMC 3346\" name=\"Verde cacciatore\" color=\"69875B\" />\n    <palette_item index=\"5\" number=\"DMC 3348\" name=\"Verde giallo chiaro\" color=\"BBCF9A\" />\n    <palette_item index=\"6\" number=\"DMC 3810\" name=\"Turchese scuro\" color=\"468F8B\" />\n    <palette_item index=\"7\" number=\"DMC 3865\" name=\"Bianco inverno\" color=\"F8EDE0\" />\n  </palette>\n  <fullstitches>\n    <stitch x=\"29\" y=\"0\" palindex=\"6\" />\n    <stitch x=\"30\" y=\"0\" palindex=\"6\" />\n    <stitch x=\"29\" y=\"1\" palindex=\"6\" />\n    <stitch x=\"30\" y=\"1\" palindex=\"6\" />\n    <stitch x=\"29\" y=\"2\" palindex=\"6\" />\n    <stitch x=\"30\" y=\"2\" palindex=\"6\" />\n    <stitch x=\"29\" y=\"3\" palindex=\"6\" />\n    <stitch x=\"30\" y=\"3\" palindex=\"6\" />\n    <stitch x=\"29\" y=\"4\" palindex=\"6\" />\n    <stitch x=\"30\" y=\"4\" palindex=\"6\" />\n    <stitch x=\"13\" y=\"6\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"6\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"6\" palindex=\"2\" />\n    <stitch x=\"20\" y=\"6\" palindex=\"1\" />\n    <stitch x=\"11\" y=\"7\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"7\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"7\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"7\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"7\" palindex=\"2\" />\n    <stitch x=\"20\" y=\"7\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"7\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"7\" palindex=\"1\" />\n    <stitch x=\"10\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"11\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"8\" palindex=\"2\" />\n    <stitch x=\"15\" y=\"8\" palindex=\"2\" />\n    <stitch x=\"18\" y=\"8\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"8\" palindex=\"2\" />\n    <stitch x=\"20\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"23\" y=\"8\" palindex=\"1\" />\n    <stitch x=\"10\" y=\"9\" palindex=\"2\" />\n    <stitch x=\"11\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"9\" palindex=\"2\" />\n    <stitch x=\"18\" y=\"9\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"9\" palindex=\"1\" />\n    <stitch x=\"23\" y=\"9\" palindex=\"2\" />\n    <stitch x=\"11\" y=\"10\" palindex=\"2\" />\n    <stitch x=\"12\" y=\"10\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"10\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"10\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"10\" palindex=\"2\" />\n    <stitch x=\"18\" y=\"10\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"10\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"10\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"10\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"10\" palindex=\"2\" />\n    <stitch x=\"12\" y=\"11\" palindex=\"2\" />\n    <stitch x=\"13\" y=\"11\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"11\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"11\" palindex=\"2\" />\n    <stitch x=\"18\" y=\"11\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"11\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"11\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"11\" palindex=\"2\" />\n    <stitch x=\"13\" y=\"12\" palindex=\"2\" />\n    <stitch x=\"14\" y=\"12\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"12\" palindex=\"1\" />\n    <stitch x=\"18\" y=\"12\" palindex=\"1\" />\n    <stitch x=\"19\" y=\"12\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"12\" palindex=\"2\" />\n    <stitch x=\"7\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"8\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"9\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"14\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"15\" y=\"13\" palindex=\"3\" />\n    <stitch x=\"16\" y=\"13\" palindex=\"3\" />\n    <stitch x=\"17\" y=\"13\" palindex=\"3\" />\n    <stitch x=\"18\" y=\"13\" palindex=\"3\" />\n    <stitch x=\"19\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"24\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"25\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"26\" y=\"13\" palindex=\"2\" />\n    <stitch x=\"7\" y=\"14\" palindex=\"1\" />\n    <stitch x=\"8\" y=\"14\" palindex=\"1\" />\n    <stitch x=\"9\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"10\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"11\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"12\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"14\" y=\"14\" palindex=\"3\" />\n    <stitch x=\"15\" y=\"14\" palindex=\"3\" />\n    <stitch x=\"16\" y=\"14\" palindex=\"3\" />\n    <stitch x=\"17\" y=\"14\" palindex=\"3\" />\n    <stitch x=\"18\" y=\"14\" palindex=\"3\" />\n    <stitch x=\"19\" y=\"14\" palindex=\"3\" />\n    <stitch x=\"21\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"22\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"23\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"24\" y=\"14\" palindex=\"2\" />\n    <stitch x=\"25\" y=\"14\" palindex=\"1\" />\n    <stitch x=\"26\" y=\"14\" palindex=\"1\" />\n    <stitch x=\"7\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"8\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"9\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"10\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"11\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"15\" palindex=\"3\" />\n    <stitch x=\"15\" y=\"15\" palindex=\"3\" />\n    <stitch x=\"16\" y=\"15\" palindex=\"3\" />\n    <stitch x=\"17\" y=\"15\" palindex=\"3\" />\n    <stitch x=\"18\" y=\"15\" palindex=\"3\" />\n    <stitch x=\"19\" y=\"15\" palindex=\"3\" />\n    <stitch x=\"20\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"23\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"24\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"25\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"26\" y=\"15\" palindex=\"1\" />\n    <stitch x=\"7\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"8\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"9\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"10\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"11\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"16\" palindex=\"3\" />\n    <stitch x=\"15\" y=\"16\" palindex=\"3\" />\n    <stitch x=\"16\" y=\"16\" palindex=\"3\" />\n    <stitch x=\"17\" y=\"16\" palindex=\"3\" />\n    <stitch x=\"18\" y=\"16\" palindex=\"3\" />\n    <stitch x=\"19\" y=\"16\" palindex=\"3\" />\n    <stitch x=\"20\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"23\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"24\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"25\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"26\" y=\"16\" palindex=\"1\" />\n    <stitch x=\"7\" y=\"17\" palindex=\"1\" />\n    <stitch x=\"8\" y=\"17\" palindex=\"1\" />\n    <stitch x=\"9\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"10\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"11\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"12\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"14\" y=\"17\" palindex=\"3\" />\n    <stitch x=\"15\" y=\"17\" palindex=\"3\" />\n    <stitch x=\"16\" y=\"17\" palindex=\"3\" />\n    <stitch x=\"17\" y=\"17\" palindex=\"3\" />\n    <stitch x=\"18\" y=\"17\" palindex=\"3\" />\n    <stitch x=\"19\" y=\"17\" palindex=\"3\" />\n    <stitch x=\"21\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"22\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"23\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"24\" y=\"17\" palindex=\"2\" />\n    <stitch x=\"25\" y=\"17\" palindex=\"1\" />\n    <stitch x=\"26\" y=\"17\" palindex=\"1\" />\n    <stitch x=\"7\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"8\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"9\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"14\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"15\" y=\"18\" palindex=\"3\" />\n    <stitch x=\"16\" y=\"18\" palindex=\"3\" />\n    <stitch x=\"17\" y=\"18\" palindex=\"3\" />\n    <stitch x=\"18\" y=\"18\" palindex=\"3\" />\n    <stitch x=\"19\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"24\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"25\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"26\" y=\"18\" palindex=\"2\" />\n    <stitch x=\"13\" y=\"19\" palindex=\"2\" />\n    <stitch x=\"14\" y=\"19\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"19\" palindex=\"1\" />\n    <stitch x=\"16\" y=\"19\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"19\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"19\" palindex=\"1\" />\n    <stitch x=\"19\" y=\"19\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"19\" palindex=\"2\" />\n    <stitch x=\"12\" y=\"20\" palindex=\"2\" />\n    <stitch x=\"13\" y=\"20\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"20\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"20\" palindex=\"2\" />\n    <stitch x=\"16\" y=\"20\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"20\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"20\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"20\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"20\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"20\" palindex=\"2\" />\n    <stitch x=\"11\" y=\"21\" palindex=\"2\" />\n    <stitch x=\"12\" y=\"21\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"21\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"21\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"21\" palindex=\"2\" />\n    <stitch x=\"16\" y=\"21\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"21\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"21\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"21\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"21\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"21\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"21\" palindex=\"2\" />\n    <stitch x=\"10\" y=\"22\" palindex=\"2\" />\n    <stitch x=\"11\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"15\" y=\"22\" palindex=\"2\" />\n    <stitch x=\"16\" y=\"22\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"22\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"22\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"20\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"22\" palindex=\"1\" />\n    <stitch x=\"23\" y=\"22\" palindex=\"2\" />\n    <stitch x=\"10\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"11\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"23\" palindex=\"2\" />\n    <stitch x=\"15\" y=\"23\" palindex=\"2\" />\n    <stitch x=\"16\" y=\"23\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"23\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"23\" palindex=\"2\" />\n    <stitch x=\"19\" y=\"23\" palindex=\"2\" />\n    <stitch x=\"20\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"23\" y=\"23\" palindex=\"1\" />\n    <stitch x=\"11\" y=\"24\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"24\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"24\" palindex=\"1\" />\n    <stitch x=\"14\" y=\"24\" palindex=\"5\" />\n    <stitch x=\"15\" y=\"24\" palindex=\"5\" />\n    <stitch x=\"16\" y=\"24\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"24\" palindex=\"4\" />\n    <stitch x=\"19\" y=\"24\" palindex=\"2\" />\n    <stitch x=\"20\" y=\"24\" palindex=\"1\" />\n    <stitch x=\"21\" y=\"24\" palindex=\"1\" />\n    <stitch x=\"22\" y=\"24\" palindex=\"1\" />\n    <stitch x=\"13\" y=\"25\" palindex=\"5\" />\n    <stitch x=\"14\" y=\"25\" palindex=\"5\" />\n    <stitch x=\"15\" y=\"25\" palindex=\"5\" />\n    <stitch x=\"16\" y=\"25\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"25\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"25\" palindex=\"5\" />\n    <stitch x=\"19\" y=\"25\" palindex=\"2\" />\n    <stitch x=\"20\" y=\"25\" palindex=\"1\" />\n    <stitch x=\"12\" y=\"26\" palindex=\"5\" />\n    <stitch x=\"13\" y=\"26\" palindex=\"5\" />\n    <stitch x=\"14\" y=\"26\" palindex=\"5\" />\n    <stitch x=\"15\" y=\"26\" palindex=\"5\" />\n    <stitch x=\"16\" y=\"26\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"26\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"26\" palindex=\"5\" />\n    <stitch x=\"19\" y=\"26\" palindex=\"5\" />\n    <stitch x=\"11\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"12\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"13\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"14\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"16\" y=\"27\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"27\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"19\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"20\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"21\" y=\"27\" palindex=\"5\" />\n    <stitch x=\"10\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"11\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"12\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"13\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"16\" y=\"28\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"28\" palindex=\"4\" />\n    <stitch x=\"18\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"19\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"20\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"21\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"22\" y=\"28\" palindex=\"5\" />\n    <stitch x=\"9\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"10\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"11\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"16\" y=\"29\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"29\" palindex=\"4\" />\n    <stitch x=\"19\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"20\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"21\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"22\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"23\" y=\"29\" palindex=\"5\" />\n    <stitch x=\"4\" y=\"30\" palindex=\"6\" />\n    <stitch x=\"5\" y=\"30\" palindex=\"6\" />\n    <stitch x=\"6\" y=\"30\" palindex=\"6\" />\n    <stitch x=\"8\" y=\"30\" palindex=\"5\" />\n    <stitch x=\"9\" y=\"30\" palindex=\"5\" />\n    <stitch x=\"10\" y=\"30\" palindex=\"5\" />\n    <stitch x=\"16\" y=\"30\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"30\" palindex=\"4\" />\n    <stitch x=\"21\" y=\"30\" palindex=\"5\" />\n    <stitch x=\"22\" y=\"30\" palindex=\"5\" />\n    <stitch x=\"23\" y=\"30\" palindex=\"5\" />\n    <stitch x=\"4\" y=\"31\" palindex=\"6\" />\n    <stitch x=\"5\" y=\"31\" palindex=\"6\" />\n    <stitch x=\"6\" y=\"31\" palindex=\"6\" />\n    <stitch x=\"16\" y=\"31\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"31\" palindex=\"4\" />\n    <stitch x=\"4\" y=\"32\" palindex=\"6\" />\n    <stitch x=\"5\" y=\"32\" palindex=\"6\" />\n    <stitch x=\"6\" y=\"32\" palindex=\"6\" />\n    <stitch x=\"16\" y=\"32\" palindex=\"4\" />\n    <stitch x=\"17\" y=\"32\" palindex=\"4\" />\n    <stitch x=\"4\" y=\"33\" palindex=\"6\" />\n    <stitch x=\"5\" y=\"33\" palindex=\"6\" />\n    <stitch x=\"6\" y=\"33\" palindex=\"6\" />\n  </fullstitches>\n  <partstitches>\n    <partstitch x=\"13\" y=\"15\" palindex1=\"1\" palindex2=\"2\" direction=\"1\" />\n    <partstitch x=\"20\" y=\"15\" palindex1=\"2\" palindex2=\"1\" direction=\"2\" />\n    <partstitch x=\"16\" y=\"11\" palindex1=\"2\" palindex2=\"0\" direction=\"3\" />\n  </partstitches>\n  <backstitches>\n    <backstitch x1=\"16.5\" y1=\"18.5\" x2=\"16.5\" y2=\"33\" palindex=\"4\" objecttype=\"backstitch\" />\n  </backstitches>\n  <ornaments_inc_knots_and_beads>\n    <object objecttype=\"knot\" x1=\"16.5\" y1=\"16.5\" palindex=\"3\" />\n    <object objecttype=\"bead\" x1=\"18.5\" y1=\"16.5\" palindex=\"3\" />\n  </ornaments_inc_knots_and_beads>\n</chart>";
  async function restore(){
    try{const last=localStorage.getItem('pp-last-project');if(!last)return;
      const rec=await dbGet(last);if(manualOpenStarted)return;
      if(!rec?.text||typeof rec.filename!=='string'||rec.id!==last){notify('Impossibile recuperare il file OXS archiviato: reimporta l’originale.',true);return;}
      await loadPattern(rec.text,rec.filename,{restoring:true});
    }catch(e){console.warn('Recupero automatico OXS non riuscito',e);if(!manualOpenStarted)notify('Recupero OXS non riuscito: apri l’originale e importa il backup JSON.',true);}
  }
  const startupReady=restore();
  window.PuntoPuntoOXSNavigation=Object.freeze({hasProject:()=>!!state.pattern,close:closeOXSProject,ready:startupReady});
  window.PuntoPuntoImport={loadPattern,notify}; // accesso limitato per il modulo PDF, senza modificare editor/stato
  document.addEventListener('puntopunto:languagechange',()=>{if(!state.pattern)return;if(keyboardCell&&document.activeElement===el.wrap)keyboardCellAnnouncement();syncOXSWorkbar();const p=state.pattern;el.meta.textContent=`${p.width} × ${p.height} ${window.PuntoPuntoI18n?.language==='en'?'cells':'caselle'} · ${state.oxsFilename}`;renderLegends();updateSavedLabel();});
  buildHeroArt();events();
})();

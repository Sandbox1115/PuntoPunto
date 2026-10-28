/* PuntoPunto 0.9.2 — manual PDF editor.
   Distinct states: stitch, confirmed empty, unknown. Completion is independent.
   Offline self-contained project JSON and OXS export after deterministic validation. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),codec=window.PuntoPuntoPDFCodec;
  const ui={root:$('pdfTracker'),image:$('trackerImage'),grid:$('trackerGrid'),page:$('trackerPage'),scroller:$('trackerScroller'),count:$('trackerCount'),zoom:$('trackerZoomLabel'),name:$('trackerName'),json:$('trackerJSON'),projectFile:$('trackerProjectFile'),list:$('trackerLegendList'),code:$('trackerThreadCode'),color:$('trackerThreadColor'),info:$('trackerLegendInfo'),digital:$('trackerDigitalStats'),oxs:$('trackerExportOXS'),kind:$('trackerKind'),tour:$('trackerTutorial'),projectStatus:$('trackerProjectStatus'),threadSource:$('trackerThreadSource'),dmcFields:$('trackerDMCFields'),customFields:$('trackerCustomFields'),dmcSearch:$('trackerDMCQuery'),dmcResults:$('trackerDMCResults'),dmcStatus:$('trackerDMCStatus'),addDMC:$('trackerAddDMC'),customName:$('trackerCustomName')};
  if(!ui.root||!codec)return;
  const VISUALS=window.PuntoPuntoStitchVisuals;
  const KINDS={full:'Croce intera',halfForward:'Mezza croce ╱',halfBack:'Mezza croce ╲',quarterNW:'Quarto ◤ alto a sinistra',quarterNE:'Quarto ◥ alto a destra',quarterSW:'Quarto ◣ basso a sinistra',quarterSE:'Quarto ◢ basso a destra',tentForward:'Punto diagonale ╲•',tentBack:'Punto diagonale ╱•',knot:'Nodo francese',bead:'Perlina'};
  const controlPanel=$('trackerControlPanel'),collapse=$('trackerCollapse'),focus=$('trackerFocus'),quarterPicker=$('trackerQuarterPicker');
  const mobileThreads=$('trackerMobileThreads'),mobileClose=$('trackerMobilePanelClose'),mobileBackdrop=$('trackerMobilePanelBackdrop');
  const mobileActions=$('trackerMobileActions'),actionsMenu=$('trackerActionsMenu');
  const mobileQuery=window.matchMedia('(max-width:700px)');
  let mobilePanelOpen=false,mobileMenuOpen=false;
  function setMobilePanel(value,{returnFocus=false}={}){
    mobilePanelOpen=!!value&&mobileQuery.matches;
    ui.root.classList.toggle('pp-mobile-threads-open',mobilePanelOpen);
    mobileThreads.setAttribute('aria-expanded',String(mobilePanelOpen));
    controlPanel.setAttribute('aria-hidden',mobileQuery.matches&&!mobilePanelOpen?'true':'false');
    if(!mobilePanelOpen&&returnFocus)mobileThreads.focus();
    if(mobilePanelOpen){setCompact(false);setMobileMenu(false);}
  }
  function setMobileMenu(value,{returnFocus=false}={}){
    mobileMenuOpen=!!value&&mobileQuery.matches;
    ui.root.classList.toggle('pp-mobile-actions-open',mobileMenuOpen);
    mobileActions.setAttribute('aria-expanded',String(mobileMenuOpen));
    if(!mobileMenuOpen&&returnFocus)mobileActions.focus();
    if(mobileMenuOpen)setMobilePanel(false);
  }
  mobileThreads.addEventListener('click',()=>setMobilePanel(!mobilePanelOpen));
  mobileClose.addEventListener('click',()=>setMobilePanel(false,{returnFocus:true}));
  mobileBackdrop.addEventListener('click',()=>setMobilePanel(false,{returnFocus:true}));
  mobileActions.addEventListener('click',()=>setMobileMenu(!mobileMenuOpen));
  actionsMenu.addEventListener('click',event=>{if(event.target.closest('button'))setMobileMenu(false);});
  document.addEventListener('pointerdown',event=>{
    if(mobileMenuOpen&&!event.target.closest('#trackerActionsMenu,#trackerMobileActions'))setMobileMenu(false);
  });
  mobileQuery.addEventListener('change',()=>{setMobilePanel(false);setMobileMenu(false);});
  function syncQuarterPicker(){
    if(!quarterPicker)return;
    const isQuarter=ui.kind.value.startsWith('quarter');
    quarterPicker.classList.toggle('hidden',!isQuarter);
    for(const button of quarterPicker.querySelectorAll('[data-quarter]')){
      const selected=button.dataset.quarter===ui.kind.value;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-pressed',String(selected));
    }
  }
  quarterPicker?.querySelectorAll('[data-quarter]').forEach(button=>button.addEventListener('click',()=>{
    ui.kind.value=button.dataset.quarter;
    ui.kind.dispatchEvent(new Event('change',{bubbles:true}));
  }));
  let compact=false,focusMode=false;
  const state={key:null,hash:null,name:'',page:0,cols:0,rows:0,rect:null,pdfBytes:null,done:new Set(),cells:new Map(),empty:new Set(),palette:[],selected:null,tool:'progress',kind:'full',scale:1,legacy:false,dmcSelected:null,saveOK:true,saveWarningAt:0};
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),validColor=s=>/^#[a-f0-9]{6}$/i.test(s);
  const total=()=>state.cols*state.rows;
  const source=()=>({name:state.name,hash:state.hash,page:state.page,cols:state.cols,rows:state.rows,rect:{...state.rect}});
  const model=()=>({cols:state.cols,rows:state.rows,palette:state.palette,cells:[...state.cells],empty:[...state.empty],completed:[...state.done]});
  const key=info=>'pp-pdf-tracker-v1:'+info.hash+':'+info.page+':'+info.cols+'x'+info.rows+':'+[info.rect.x,info.rect.y,info.rect.w,info.rect.h].map(x=>x.toFixed(4)).join(':');
  const legacyKey=()=>state.key+':legend-v2',schemaKey=()=>state.key+':schema-v3';
  function notify(m,bad=false){if(window.PuntoPuntoImport?.notify)window.PuntoPuntoImport.notify(m,bad);else ui.projectStatus.textContent=m;}
  function payload(){return {version:4,completed:[...state.done],palette:state.palette,cells:[...state.cells],empty:[...state.empty]};}
  function warnUnsaved(){ui.projectStatus.textContent='⚠ Salvataggio automatico non riuscito: usa «Salva progetto» e conserva il JSON.';
    if(Date.now()-state.saveWarningAt>12000){notify('Attenzione: salvataggio locale non riuscito. Scarica una copia del progetto.',true);state.saveWarningAt=Date.now();}}
  let pendingSave=null, pendingPayload=null, latestSave=Promise.resolve(), saveRevision=0;
  const writesInFlight=new Set();
  function validSnapshot(p,cols=state.cols,rows=state.rows){
    if(!p||p.version!==4)return false;
    try{codec.normalize({cols,rows,palette:p.palette,cells:p.cells,empty:p.empty,completed:p.completed});return true;}
    catch{return false;}
  }
  const stamp=value=>{const n=Date.parse(value||'');return Number.isFinite(n)?n:0;};
  function persistPending(){
    if(!pendingPayload)return latestSave;
    const {key,value,revision,cols,rows}=pendingPayload;pendingPayload=null;
    if(pendingSave){clearTimeout(pendingSave);pendingSave=null;}
    const store=window.PuntoPuntoPDFStore;
    // A save is only acknowledged after the IndexedDB transaction commits.
    const task=(store?store.writeProgress(key,value,p=>validSnapshot(p,cols,rows)):Promise.reject(Error('IndexedDB non disponibile')))
      .then(()=>{
        if(state.key===key&&revision===saveRevision){state.saveOK=true;ui.projectStatus.textContent='Salvato sul dispositivo · esporta periodicamente una copia del progetto';}
      }).catch(e=>{
        console.warn('IndexedDB non disponibile, uso salvataggio precedente',e);
        const result=window.PuntoPuntoStorage?.write(key,value,p=>validSnapshot(p,cols,rows));
        if(state.key===key&&revision===saveRevision){state.saveOK=!!result?.ok;
          if(result?.ok)ui.projectStatus.textContent='Salvato in memoria locale ridotta · esporta periodicamente il progetto';
          else warnUnsaved();}
        else if(!result?.ok)notify('Un salvataggio PDF in chiusura non è riuscito. Conserva il progetto JSON.',true);
      });
    writesInFlight.add(task);
    task.finally(()=>writesInFlight.delete(task)).catch(()=>{});
    latestSave=task;return task;
  }
  function save(){if(!state.key)return;
    pendingPayload={key:state.key,value:payload(),revision:++saveRevision,cols:state.cols,rows:state.rows};
    state.saveOK=false;ui.projectStatus.textContent='Salvataggio in corso…';
    if(pendingSave)clearTimeout(pendingSave);
    pendingSave=setTimeout(persistPending,150);
  }
  async function flushSave(){if(pendingPayload)persistPending();await Promise.allSettled([...writesInFlight]);}
  async function load(){
    state.done=new Set();state.cells=new Map();state.empty=new Set();state.palette=[];state.legacy=false;state.dmcSelected=null;state.saveOK=true;
    let database=null,local=null,readError=false;
    try{database=await window.PuntoPuntoPDFStore?.readProgress(state.key,validSnapshot);}
    catch(e){console.warn('Archivio PDF non leggibile',e);readError=true;}
    try{local=window.PuntoPuntoStorage?.read(state.key,validSnapshot);}
    catch(e){console.warn('Backup browser non leggibile',e);readError=true;}
    // A fallback to localStorage can succeed after a previously valid IndexedDB
    // save. Prefer the newest *valid* snapshot instead of silently losing edits.
    const choices=[database,local].filter(s=>s?.found).sort((a,b)=>stamp(b.savedAt)-stamp(a.savedAt));
    const snapshot=choices[0]||null;
    const damaged=!!(readError||database?.damaged||local?.damaged);
    if(snapshot){
      const c=codec.normalize({cols:state.cols,rows:state.rows,palette:snapshot.value.palette,cells:snapshot.value.cells,empty:snapshot.value.empty,completed:snapshot.value.completed});
      state.done=c.completed;state.cells=c.cells;state.empty=c.empty;state.palette=c.palette;
      if(snapshot.recovered||damaged){ui.projectStatus.textContent='⚠ Recuperata una copia valida: esporta subito un progetto JSON.';notify('Recuperato un salvataggio PDF valido. Esporta una copia di sicurezza.',true);}
    }else{
      try{
        const arr=JSON.parse(localStorage.getItem(state.key)||'[]');
        if(Array.isArray(arr))state.done=new Set(arr.filter(i=>Number.isInteger(i)&&i>=0&&i<total()));
        const saved=JSON.parse(localStorage.getItem(legacyKey())||'null');
        if(saved){state.palette=Array.isArray(saved.palette)?saved.palette.filter(p=>p&&typeof p.code==='string'&&validColor(p.color)).slice(0,100):[];
          if(Array.isArray(saved.assigned))for(const [i,code]of saved.assigned)if(Number.isInteger(i)&&i>=0&&i<total()&&state.palette.some(p=>p.code===code))state.cells.set(i,{code,kind:'full'});
          state.legacy=state.cells.size>0;
        }
        const old=JSON.parse(localStorage.getItem(schemaKey())||'null');
        if(old?.version===3){const parsed=codec.normalize({...model(),cells:old.cells,empty:old.empty});state.cells=parsed.cells;state.empty=parsed.empty;state.legacy=false;}
        if(arr.length||saved||old){save();}
      }catch(err){console.warn('Salvataggio precedente non leggibile',err);ui.projectStatus.textContent='⚠ Vecchio salvataggio danneggiato: importa il progetto JSON.';}
      if(damaged){state.saveOK=false;ui.projectStatus.textContent='⚠ Salvataggi locali danneggiati: importa un progetto JSON prima di continuare.';notify('Salvataggi PDF non recuperabili automaticamente. Verifica i backup JSON.',true);}
    }
    state.selected=null;state.tool='progress';state.kind='full';
  }
  function getStats(){const resolved=state.cells.size+state.empty.size,unknown=total()-resolved;return {resolved,unknown,total:total(),stitches:state.cells.size,empty:state.empty.size};}
  function setTool(tool){
    state.tool=tool;
    const control=document.querySelector(`input[name="trackerTool"][value="${tool}"]`);
    if(control)control.checked=true;
    ui.root.querySelectorAll('[data-mobile-tool]').forEach(button=>{
      const active=button.dataset.mobileTool===tool;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    renderLegend();
  }
  function legendInfo(){
    const s=getStats();
    if(state.tool==='stitch')return state.selected?'Assegna '+state.selected+' ('+KINDS[state.kind]+'). Tocca una casella per sostituirla.':'Seleziona un filato dalla legenda.';
    if(state.tool==='empty')return 'Conferma che la casella è vuota: non contiene alcun punto.';
    if(state.tool==='unknown')return 'Rimetti la casella tra quelle da esaminare.';
    return state.legacy?'I filati della v0.9 sono stati importati come croci intere: verifica i punti prima di completare l’OXS.':'Segna o deseleziona i punti già ricamati. Il disegno rimane invariato.';
  }
  function renderLegend(){
    ui.list.replaceChildren();
    const counts=new Map();for(const point of state.cells.values())counts.set(point.code,(counts.get(point.code)||0)+1);
    for(const item of state.palette){
      const b=document.createElement('button');b.type='button';b.className='pp-c-thread'+(state.selected===item.code?' is-active':'');b.title='Seleziona '+item.code;
      const sw=document.createElement('span');sw.className='pp-c-thread-swatch';sw.style.background=item.color;
      const name=document.createElement('strong');name.textContent=(item.brand==='DMC'?'DMC ':'')+item.code;
      const title=document.createElement('small');title.className='pp-thread-desc';title.textContent=item.name||'';
      const count=document.createElement('span');count.textContent=(counts.get(item.code)||0)+' punti';
      b.append(sw,name,title,count);b.addEventListener('click',()=>{state.selected=item.code;setTool('stitch');setMobilePanel(false);});ui.list.appendChild(b);
    }
    if(!state.palette.length)ui.info.textContent='Aggiungi i filati riportati sulla legenda del PDF.';
    else ui.info.textContent=legendInfo();
    const s=getStats(),pct=s.total?Math.round(s.resolved/s.total*100):0;
    ui.digital.textContent=`Digitalizzate ${s.resolved.toLocaleString('it-IT')} / ${s.total.toLocaleString('it-IT')} caselle (${pct}%) · ${s.stitches} punti · ${s.empty} vuote · ${s.unknown} da verificare`;
    ui.oxs.disabled=s.unknown!==0;
    ui.oxs.title=s.unknown?'Definisci tutte le caselle per esportare un OXS completo.':'Esporta e verifica l’OXS contro i dati digitalizzati.';
  }
  function addThread(code,color,{brand='Personalizzato',name=''}={}){
    code=String(code||'').trim();name=String(name||'').trim();color=String(color||'').toLowerCase();
    if(!code||code.length>40||name.length>100||!validColor(color))return {ok:false,message:'Codice, descrizione o colore non valido.'};
    const existing=state.palette.find(p=>p.code.toLowerCase()===code.toLowerCase());
    if(existing){
      if(existing.brand===brand&&existing.color.toLowerCase()===color){state.selected=existing.code;setTool('stitch');return {ok:true,existing:true};}
      return {ok:false,message:'Il codice '+code+' è già usato per un altro filato. Per il personalizzato, scegli un codice diverso (es. MIO-'+code+').'};
    }
    if(state.palette.length>=100)return {ok:false,message:'La legenda ammette al massimo 100 filati.'};
    state.palette.push({code,color,brand,name});state.selected=code;setTool('stitch');save();draw();setMobilePanel(false);return {ok:true};
  }
  function sourceMode(){
    const dmc=ui.threadSource.value==='dmc';ui.dmcFields.classList.toggle('hidden',!dmc);ui.customFields.classList.toggle('hidden',dmc);
    if(dmc)loadDMC();
  }
  function renderDMCResults(){
    const cat=window.PuntoPuntoDMC;if(!cat?.count)return;
    const q=ui.dmcSearch.value,results=cat.search(q,16);ui.dmcResults.replaceChildren();
    for(const item of results){
      const button=document.createElement('button');button.type='button';button.className='pp-dmc-item'+(state.dmcSelected?.code===item.code?' pp-dmc-item-active':'');
      const sw=document.createElement('span');sw.className='pp-c-thread-swatch';sw.style.backgroundColor=item.hex;
      const info=document.createElement('span'),code=document.createElement('strong');code.textContent='DMC '+item.code;
      const name=document.createElement('small');name.textContent=item.name;info.append(code,name);
      button.append(sw,info);button.addEventListener('click',()=>{state.dmcSelected=item;ui.dmcSearch.value=item.code;ui.addDMC.disabled=false;ui.dmcStatus.textContent='Selezionato: DMC '+item.code+' · '+item.name+' · '+item.hex;renderDMCResults();});
      ui.dmcResults.append(button);
    }
    if(!results.length)ui.dmcStatus.textContent='Nessuna corrispondenza. Per un filato fuori catalogo usa «Colore personalizzato».';
  }
  async function loadDMC(){
    const cat=window.PuntoPuntoDMC;if(!cat){ui.dmcStatus.textContent='Il modulo DMC non è stato caricato.';return;}
    if(cat.count){renderDMCResults();return;}
    ui.dmcStatus.textContent='Caricamento catalogo DMC…';ui.addDMC.disabled=true;
    try{await cat.load();ui.dmcStatus.textContent='489 filati DMC disponibili · catalogo non ufficiale';renderDMCResults();}
    catch(error){ui.dmcStatus.textContent=error.message+' Puoi continuare con i filati personalizzati.';}
  }
  function draw(){
    const cvs=ui.grid,c=cvs.getContext('2d'),W=cvs.width,H=cvs.height;
    c.clearRect(0,0,W,H);if(!state.cols||!state.rows)return;
    const cw=W/state.cols,ch=H/state.rows,colors=new Map(state.palette.map(p=>[p.code,p.color]));
    for(const i of state.empty){const x=i%state.cols,y=Math.floor(i/state.cols);c.fillStyle='rgba(228,234,229,.38)';c.fillRect(x*cw,y*ch,cw,ch);if(Math.min(cw,ch)>8){c.strokeStyle='rgba(87,103,96,.6)';c.lineWidth=.9;c.beginPath();c.moveTo(x*cw+cw*.28,y*ch+ch*.5);c.lineTo(x*cw+cw*.72,y*ch+ch*.5);c.stroke();}}
    for(const [i,p] of state.cells){const x=i%state.cols,y=Math.floor(i/state.cols),color=colors.get(p.code)||'#999999';c.fillStyle=color+'9f';c.fillRect(x*cw,y*ch,cw,ch);
      if(Math.min(cw,ch)>10){c.fillStyle='rgba(255,255,255,.88)';c.font=`bold ${Math.min(cw,ch)*.52}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.strokeStyle='rgba(255,255,255,.96)';c.lineWidth=Math.max(1,Math.min(cw,ch)*.085);VISUALS.draw(c,p.kind,x*cw,y*ch,cw,ch);}}
    for(const i of state.done){const x=i%state.cols,y=Math.floor(i/state.cols);c.fillStyle='rgba(19,146,106,.23)';c.fillRect(x*cw,y*ch,cw,ch);
      if(Math.min(cw,ch)>=7){c.strokeStyle='#07543b';c.lineWidth=Math.min(2,cw/8);c.beginPath();c.moveTo(x*cw+cw*.23,y*ch+ch*.49);c.lineTo(x*cw+cw*.43,y*ch+ch*.70);c.lineTo(x*cw+cw*.76,y*ch+ch*.27);c.stroke();}}
    const stride=Math.max(1,Math.ceil(Math.max(state.cols/W,state.rows/H)*8));c.strokeStyle='rgba(6,72,55,.55)';c.lineWidth=Math.max(.65,Math.min(1.4,W/1400));c.beginPath();
    for(let x=0;x<=state.cols;x+=stride){c.moveTo(x*cw,0);c.lineTo(x*cw,H);}for(let y=0;y<=state.rows;y+=stride){c.moveTo(0,y*ch);c.lineTo(W,y*ch);}c.stroke();
    c.strokeStyle='rgba(12,117,83,.9)';c.lineWidth=2;c.strokeRect(1,1,W-2,H-2);
    ui.count.textContent=`${state.done.size} caselle segnate come ricamate · ${state.cells.size} punti definiti`;
    renderLegend();
  }
  function scaleTo(n){state.scale=clamp(n,.5,4);ui.page.style.width=Math.round(ui.image.width*state.scale)+'px';ui.page.style.height=Math.round(ui.image.height*state.scale)+'px';ui.zoom.textContent=Math.round(state.scale*100)+'%';}
  async function open(info){
    if(!info.image?.width)throw Error('La pagina PDF non è stata renderizzata.');
    if(!Number.isInteger(info.cols)||!Number.isInteger(info.rows)||info.cols<1||info.rows<1||info.cols*info.rows>100000)throw Error('Griglia non valida.');
    const r=info.rect;if(!r||r.w<=0||r.h<=0||r.x<0||r.y<0||r.x+r.w>1.001||r.y+r.h>1.001)throw Error('Area non valida.');
    await flushSave(); // Never discard pending edits when changing PDF or grid.
    Object.assign(state,{name:info.name,hash:info.hash,page:info.page,cols:info.cols,rows:info.rows,rect:{...r},pdfBytes:info.pdfBytes?new Uint8Array(info.pdfBytes):null,key:key(info)});
    const sx=Math.round(r.x*info.image.width),sy=Math.round(r.y*info.image.height),sw=Math.max(1,Math.round(r.w*info.image.width)),sh=Math.max(1,Math.round(r.h*info.image.height));
    ui.image.width=ui.grid.width=sw;ui.image.height=ui.grid.height=sh;ui.image.getContext('2d').drawImage(info.image,sx,sy,sw,sh,0,0,sw,sh);
    try{localStorage.setItem('pp-pdf-tracker-last-v1:'+state.hash,JSON.stringify({page:state.page,cols:state.cols,rows:state.rows,rect:state.rect}));}catch(e){console.warn('Griglia recente non salvata',e);notify('La griglia potrebbe non essere ripristinata automaticamente: esporta il progetto JSON.',true);}
    await load();ui.dmcSearch.value='';ui.addDMC.disabled=true;ui.name.textContent=`${info.name} · pagina ${info.page} · ${info.cols} × ${info.rows}`;
    window.PuntoPuntoOXSNavigation?.close({confirmExit:false,showHome:false});
    // An OXS session exempts its filename/metadata from automatic translation.
    // On entry to PDF mode, keep the PDF filename literal but translate the fixed metadata.
    $('projectTitle').setAttribute('data-i18n-ignore','');
    $('projectMeta').removeAttribute('data-i18n-ignore');
    document.body.classList.add('pp-tracker-mode');$('welcome').classList.add('hidden');$('editor').classList.add('hidden');ui.root.classList.remove('hidden');
    $('projectTitle').textContent=info.name.replace(/\.pdf$/i,'')+' · PDF';$('projectMeta').textContent='Digitalizzazione manuale e avanzamento separati';
    ['exportOXS','saveProgress','loadProgress'].forEach(id=>$(id).disabled=true);
    document.querySelector('input[name=trackerTool][value=progress]').checked=true;ui.kind.value=state.kind;syncQuarterPicker();
    setMobilePanel(false);setMobileMenu(false);setCompact(true);
    setFocus(mobileQuery.matches);setTool('progress');
    scaleTo(Math.min(1,(ui.scroller.clientWidth-25)/sw));draw();sourceMode();ui.scroller.scrollTop=0;ui.scroller.scrollLeft=0;
    if(state.pdfBytes&&window.PuntoPuntoPDFStore){window.PuntoPuntoPDFStore.rememberPDF(source(),state.pdfBytes).catch(e=>{notify('PDF aperto, ma non memorizzato: usa «Salva progetto» per conservarlo. '+e.message,true);});}
  }
  function setCompact(value){compact=!!value;controlPanel.classList.toggle('pp-compact',compact);collapse.setAttribute('aria-expanded',String(!compact));collapse.textContent=compact?'▾ Mostra filati':'▴ Riduci pannello filati';}
  function setFocus(value){focusMode=!!value;setMobilePanel(false);setMobileMenu(false);document.body.classList.toggle('pp-tracker-focus',focusMode);focus.setAttribute('aria-pressed',String(focusMode));focus.textContent=focusMode?'⤡ Vista normale':'⛶ Schermo ampio';}
  collapse.addEventListener('click',()=>setCompact(!compact));focus.addEventListener('click',()=>setFocus(!focusMode));
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape'||ui.root.classList.contains('hidden'))return;
    if(!document.getElementById('pdfTutorial')?.classList.contains('hidden'))return;
    if(mobilePanelOpen){setMobilePanel(false,{returnFocus:true});return;}
    if(mobileMenuOpen){setMobileMenu(false,{returnFocus:true});return;}
    if(focusMode){setFocus(false);focus.focus();}
  });
  function closeBeforeOXS(){setMobilePanel(false);setMobileMenu(false);setFocus(false);if(ui.root.classList.contains('hidden'))return;flushSave();ui.root.classList.add('hidden');document.body.classList.remove('pp-tracker-mode');}
  function close({confirmExit=true}={}){
    if(ui.root.classList.contains('hidden'))return true;
    if(confirmExit&&!window.ppConfirm('Stai per tornare alla home e uscire dal lavoro PDF in corso. Prima di procedere usa «Salva progetto» per scaricare una copia JSON con il PDF e la digitalizzazione: il salvataggio automatico del browser potrebbe non essere sufficiente. Vuoi uscire comunque?'))return false;
    setMobilePanel(false);setMobileMenu(false);setFocus(false);flushSave();
    ui.root.classList.add('hidden');document.body.classList.remove('pp-tracker-mode');
    $('welcome').classList.remove('hidden');$('projectTitle').removeAttribute('data-i18n-ignore');$('projectMeta').removeAttribute('data-i18n-ignore');
    $('projectTitle').textContent='Il tuo prossimo ricamo';$('projectMeta').textContent='Carica un OXS o un PDF interattivo per iniziare a lavorare';
    state.pdfBytes=null;state.key=null;state.name='';return true;
  }
  function activate(e){
    if(e.button!==0&&e.pointerType==='mouse')return;
    const rect=ui.grid.getBoundingClientRect(),x=Math.floor((e.clientX-rect.left)/rect.width*state.cols),y=Math.floor((e.clientY-rect.top)/rect.height*state.rows);
    if(x<0||x>=state.cols||y<0||y>=state.rows)return;
    const i=y*state.cols+x;
    if(state.tool==='stitch'){
      if(!state.selected){ui.info.textContent='Seleziona prima un filato.';return;}
      state.cells.set(i,{code:state.selected,kind:state.kind});state.empty.delete(i);
    }else if(state.tool==='empty'){state.empty.add(i);state.cells.delete(i);}
    else if(state.tool==='unknown'){state.empty.delete(i);state.cells.delete(i);}
    else if(state.tool==='progress'){if(state.done.has(i))state.done.delete(i);else state.done.add(i);}
    save();draw();e.preventDefault();
  }
  function progressData(){return{format:'PuntoPunto-PDF-Progress',version:3,source:source(),completed:[...state.done].sort((a,b)=>a-b),palette:state.palette,cells:[...state.cells],empty:[...state.empty],assigned:[...state.cells].map(([i,p])=>[i,p.code])};}
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
  function filename(stem){return state.name.replace(/\.pdf$/i,'').replace(/[\\/:*?"<>|]/g,'-')+stem;}
  function downloadProgress(){downloadBlob(new Blob([JSON.stringify(progressData(),null,2)],{type:'application/json'}),filename('-progressi.json'));}
  function sameSource(data){const s=data?.source;if(!s||s.hash!==state.hash||s.cols!==state.cols||s.rows!==state.rows||s.page!==state.page||s.name!==state.name)return false;
    return ['x','y','w','h'].every(k=>typeof s.rect?.[k]==='number'&&Math.abs(s.rect[k]-state.rect[k])<.002);
  }
  function applyData(data){
    if(!sameSource(data))throw Error('Il salvataggio appartiene a un PDF, pagina o griglia diversa.');
    let candidate;
    if(data.version===3){candidate=codec.normalize({cols:state.cols,rows:state.rows,palette:data.palette,cells:data.cells,empty:data.empty,completed:data.completed});}
    else if(data.version===2){candidate=codec.normalize({cols:state.cols,rows:state.rows,palette:data.palette,cells:(data.assigned||[]).map(([i,code])=>[i,{kind:'full',code}]),empty:[],completed:data.completed});}
    else if(data.version===1){candidate=codec.normalize({cols:state.cols,rows:state.rows,palette:[],cells:[],empty:[],completed:data.completed});}
    else throw Error('Versione salvataggio non supportata.');
    state.palette=candidate.palette;state.cells=candidate.cells;state.empty=candidate.empty;state.done=candidate.completed;state.selected=null;state.legacy=data.version===2;setTool('progress');save();draw();
  }
  async function importProgress(file){if(!file)return;try{if(file.size>12*1024*1024)throw Error('Salvataggio troppo grande (limite 12 MB).');const data=JSON.parse(await file.text());if(data.format!=='PuntoPunto-PDF-Progress'||![1,2,3].includes(data.version))throw Error('JSON progressi PDF non supportato.');applyData(data);notify('Progressi e digitalizzazione importati.');}catch(err){notify('Importazione non riuscita: '+err.message,true);}}
  function exportOXS(){
    try{const xml=codec.write(model(),state.name.replace(/\.pdf$/i,'')),check=codec.verify(xml,model());
      downloadBlob(new Blob([xml],{type:'application/xml;charset=utf-8'}),filename('-digitalizzato.oxs'));
      ui.projectStatus.textContent=`OXS verificato: ${check.stitches} punti e ${check.palette} filati. Verifica visivamente la fedeltà al PDF.`;
      notify('OXS creato e riletto senza differenze rispetto alla tua digitalizzazione.');
    }catch(err){notify('Esportazione OXS bloccata: '+err.message,true);}
  }
  // Read/export PDF as a self-contained project, independent of device/browser.
  function pdfToBase64(data){
    if(!data?.length)throw Error('Il PDF originale non è disponibile nella sessione.');
    const parts=[];for(let i=0;i<data.length;i+=8192)parts.push(String.fromCharCode(...data.subarray(i,i+8192)));
    return btoa(parts.join(''));
  }
  async function exportProject(){
    try{
      const pdf=pdfToBase64(state.pdfBytes);
      const content={format:'PuntoPunto-Project',version:1,source:source(),pdf:{encoding:'base64',mime:'application/pdf',checksum:codec.checksum(state.pdfBytes),data:pdf},digitalization:{...progressData(),format:'PuntoPunto-PDF-Progress'}};
      downloadBlob(new Blob([JSON.stringify(content)],{type:'application/json'}),filename('-progetto.puntopunto.json'));
      notify('Progetto salvato con PDF originale, filati, schema e avanzamento.');
    }catch(err){notify('Impossibile esportare il progetto: '+err.message,true);}
  }
  async function importProject(file){
    if(!file)return;try{
      if(file.size>52*1024*1024)throw Error('Progetto oltre il limite di 52 MB.');
      const data=JSON.parse(await file.text());
      if(data.format!=='PuntoPunto-Project'||data.version!==1||data.pdf?.encoding!=='base64'||data.pdf?.mime!=='application/pdf'||typeof data.pdf?.data!=='string'||!data.digitalization)throw Error('Formato progetto non valido.');
      await window.PuntoPuntoPDFImport.loadProject(data);
      notify('Progetto completo ripristinato.');
    }catch(err){notify('Caricamento del progetto non riuscito: '+err.message,true);}
  }
  function restoreProject(payload){if(payload.format!=='PuntoPunto-Project')throw Error('Formato progetto sconosciuto.');applyData(payload.digitalization);}
  // A single mobile tap edits on release, never on first contact: this prevents
  // a second finger arriving for pinch-zoom from accidentally marking a cell.
  const activeTouches=new Map();
  let touchGesture=false,pinchStart=null;
  const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function zoomAt(next,x,y){
    const old=ui.page.getBoundingClientRect();
    if(!old.width||!old.height)return;
    const relativeX=(x-old.left)/old.width,relativeY=(y-old.top)/old.height;
    scaleTo(next);
    const now=ui.page.getBoundingClientRect();
    ui.scroller.scrollLeft+=now.left+relativeX*now.width-x;
    ui.scroller.scrollTop+=now.top+relativeY*now.height-y;
  }
  ui.grid.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch'){activate(event);return;}
    if(activeTouches.size>=2)return;
    activeTouches.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,time:Date.now()});
    try{ui.grid.setPointerCapture(event.pointerId);}catch(_){ }
    if(activeTouches.size===2){
      touchGesture=true;
      const [a,b]=[...activeTouches.values()];
      pinchStart={distance:Math.max(1,distance(a,b)),scale:state.scale};
    }
    event.preventDefault();
  });
  ui.grid.addEventListener('pointermove',event=>{
    if(!activeTouches.has(event.pointerId))return;
    const old=activeTouches.get(event.pointerId);
    activeTouches.set(event.pointerId,{...old,x:event.clientX,y:event.clientY});
    if(activeTouches.size===2&&pinchStart){
      const [a,b]=[...activeTouches.values()];
      const mid=midpoint(a,b);
      zoomAt(pinchStart.scale*distance(a,b)/pinchStart.distance,mid.x,mid.y);
      // Rebase on current geometry so moving the midpoint also pans naturally.
      pinchStart={distance:Math.max(1,distance(a,b)),scale:state.scale};
    }
    event.preventDefault();
  });
  function finishTouch(event,cancel=false){
    const old=activeTouches.get(event.pointerId);
    if(!old)return;
    activeTouches.delete(event.pointerId);
    if(!cancel&&!touchGesture&&!activeTouches.size&&Math.hypot(event.clientX-old.startX,event.clientY-old.startY)<12&&Date.now()-old.time<1500){
      activate(event);
    }
    if(!activeTouches.size){touchGesture=false;pinchStart=null;}
    event.preventDefault();
  }
  ui.grid.addEventListener('pointerup',e=>finishTouch(e));
  ui.grid.addEventListener('pointercancel',e=>finishTouch(e,true));
  ui.root.querySelectorAll('[data-mobile-tool]').forEach(button=>button.addEventListener('click',()=>{
    setTool(button.dataset.mobileTool);
    if(button.dataset.mobileTool==='stitch'&&!state.selected)setMobilePanel(true);
  }));
  ui.threadSource.addEventListener('change',sourceMode);
  ui.dmcSearch.addEventListener('input',()=>{state.dmcSelected=null;ui.addDMC.disabled=true;renderDMCResults();});
  ui.dmcSearch.addEventListener('keydown',event=>{if(event.key!=='Enter')return;const exact=window.PuntoPuntoDMC?.get(ui.dmcSearch.value);if(exact){event.preventDefault();state.dmcSelected=exact;ui.addDMC.disabled=false;ui.addDMC.click();}});
  ui.addDMC.addEventListener('click',()=>{
    const item=state.dmcSelected;if(!item)return;
    const outcome=addThread(item.code,item.hex,{brand:'DMC',name:item.name});
    ui.dmcStatus.textContent=outcome.ok?'DMC '+item.code+' aggiunto alla legenda.':outcome.message;
  });
  $('trackerAddThread').addEventListener('click',()=>{
    const outcome=addThread(ui.code.value,ui.color.value,{brand:'Personalizzato',name:ui.customName.value});
    if(!outcome.ok)ui.info.textContent=outcome.message;
    else{ui.code.value='';ui.customName.value='';ui.info.textContent='Filato personalizzato aggiunto.';}
  });
  $('trackerEraseThread').addEventListener('click',()=>setTool('unknown'));
  $('trackerClearTool').addEventListener('click',()=>setTool('progress'));
  document.querySelectorAll('input[name=trackerTool]').forEach(r=>r.addEventListener('change',()=>{if(r.checked)setTool(r.value);}));
  ui.kind.addEventListener('change',()=>{state.kind=ui.kind.value;syncQuarterPicker();renderLegend();});
  $('trackerMarkEmpty').addEventListener('click',()=>{
    const s=getStats();if(!s.unknown)return;
    if(!window.ppConfirm(`Confermi che tutte le ${s.unknown} caselle non definite sono effettivamente vuote nel PDF? Questa azione non assegna filati.`))return;
    for(let i=0;i<total();i++)if(!state.cells.has(i))state.empty.add(i);
    save();draw();notify('Le caselle non definite sono ora vuote confermate.');
  });
  $('trackerMinus').addEventListener('click',()=>scaleTo(state.scale/1.25));$('trackerPlus').addEventListener('click',()=>scaleTo(state.scale*1.25));
  $('trackerExport').addEventListener('click',downloadProgress);$('trackerImport').addEventListener('click',()=>ui.json.click());
  ui.json.addEventListener('change',async()=>{await importProgress(ui.json.files[0]);ui.json.value='';});
  $('trackerExportProject').addEventListener('click',exportProject);$('trackerImportProject').addEventListener('click',()=>ui.projectFile.click());
  ui.projectFile.addEventListener('change',async()=>{await importProject(ui.projectFile.files[0]);ui.projectFile.value='';});
  ui.oxs.addEventListener('click',exportOXS);
  $('openProject').addEventListener('click',()=>$('projectInput').click());
  $('projectInput').addEventListener('change',async()=>{await importProject($('projectInput').files[0]);$('projectInput').value='';});
  $('trackerClose').addEventListener('click',()=>close());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&pendingPayload)persistPending();});
  window.addEventListener('beforeunload',event=>{if(pendingPayload||writesInFlight.size||(!state.saveOK&&!ui.root.classList.contains('hidden'))){event.preventDefault();event.returnValue='';}});
  window.addEventListener('pagehide',()=>{if(pendingPayload)persistPending();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&pendingPayload)persistPending();});
  // The tutorial remains an in-page dialog so it is easy to open at any time.
  $('trackerTutorial').addEventListener('click',()=>{$('pdfTutorial').classList.remove('hidden');$('pdfTutorialClose').focus();});
  $('pdfTutorialClose').addEventListener('click',()=>{$('pdfTutorial').classList.add('hidden');ui.tour.focus();});
  $('pdfTutorialDone').addEventListener('click',()=>$('pdfTutorialClose').click());
  $('pdfTutorial').addEventListener('click',e=>{if(e.target===$('pdfTutorial'))$('pdfTutorialClose').click();});
  $('pdfTutorial').addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const all=[...$('pdfTutorial').querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(x=>x.getClientRects().length);
    if(!all.length)return;
    if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all[all.length-1].focus();}
    else if(!e.shiftKey&&document.activeElement===all[all.length-1]){e.preventDefault();all[0].focus();}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('pdfTutorial').classList.contains('hidden'))$('pdfTutorialClose').click();});
  const resumeButton=$('resumeLastPDF');
  if(resumeButton&&window.PuntoPuntoPDFStore){
    window.PuntoPuntoPDFStore.getRecentPDF().then(record=>{
      if(!record)return;
      resumeButton.classList.remove('hidden');
      resumeButton.addEventListener('click',async()=>{
        resumeButton.disabled=true;
        try{
          const saved=await window.PuntoPuntoPDFStore.getRecentPDF();
          if(!saved)throw Error('Nessun PDF archiviato sul dispositivo.');
          if(saved.recovered)notify('Ultimo PDF locale danneggiato: recuperato il documento precedente. Verifica lo schema.',true);
          const file=new File([saved.buffer],saved.name,{type:'application/pdf'});
          await window.PuntoPuntoPDFImport.readFile(file,{resumeSource:saved.source});
        }catch(e){notify('Impossibile riaprire il PDF locale: '+e.message,true);}
        finally{resumeButton.disabled=false;}
      });
    }).catch(e=>console.warn('Riapertura ultimo PDF indisponibile',e));
  }
  window.PuntoPuntoPDFTracker={open,close,closeBeforeOXS,restoreProject,importProject,inspect:()=>({...getStats(),source:source()})};
})();

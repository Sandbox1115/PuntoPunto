/* PuntoPunto 0.9 — solo PDF interattivo. Nessun OCR, nessun riconoscimento
   automatico, nessuna conversione OXS da PDF. Tutto gira localmente nel browser. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ui = {
    overlay:$('pdfOverlay'), file:$('pdfInput'), page:$('pdfPage'), cols:$('pdfCols'), rows:$('pdfRows'),
    preview:$('pdfPreview'), overlayCanvas:$('pdfGridOverlay'), shell:$('pdfPreviewShell'),
    status:$('pdfStatus'), filename:$('pdfFilename'), confirm:$('pdfConfirm'),
    review:$('pdfReview'), info:$('pdfCellInfo'),
    x:$('pdfLeft'),y:$('pdfTop'),w:$('pdfWidth'),h:$('pdfHeight')
  };
  if (!ui.overlay) return;
  const PDFJS_LOCAL='vendor/pdf.min.js';
  const WORKER_LOCAL='vendor/pdf.worker.min.js';
  const MAX_BYTES=30*1024*1024, MAX_CELLS=100000, MAX_SIDE=600;
  const initialRect=()=>({x:.08,y:.08,w:.84,h:.84});
  const state={doc:null,name:'',hash:'',page:1,rect:initialRect(),width:0,height:0,
    imageReady:false,drag:null,renderToken:0,buffer:null,loading:false};
  let pdfLoader=null;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const notify=(message,error=false)=>window.PuntoPuntoImport?.notify?.(message,error);
  function message(s,error=false){ui.status.textContent=s;ui.status.classList.toggle('is-error',error);}
  function openDialog(){ui.overlay.classList.remove('hidden');document.body.classList.add('pp-pdf-modal-open');}
  function closeDialog(){ui.overlay.classList.add('hidden');document.body.classList.remove('pp-pdf-modal-open');state.drag=null;}
  function validDimensions(){
    const c=Number(ui.cols.value),r=Number(ui.rows.value);
    return ui.cols.value.trim()!==''&&ui.rows.value.trim()!==''&&Number.isInteger(c)&&Number.isInteger(r)&&c>0&&r>0&&c<=MAX_SIDE&&r<=MAX_SIDE&&c*r<=MAX_CELLS;
  }
  function validRect(rect){
    return rect&&Object.values(rect).every(Number.isFinite)&&rect.x>=0&&rect.y>=0&&rect.w>=.005&&rect.h>=.005&&rect.x+rect.w<=1.000001&&rect.y+rect.h<=1.000001;
  }
  function refreshValidity(){
    const ready=state.imageReady&&validDimensions()&&validRect(state.rect)&&!state.loading;
    ui.confirm.disabled=!ready;
    if (!ui.cols.value&&!ui.rows.value)ui.info.textContent='Inserisci colonne e righe indicate sullo schema originale.';
    else if(!validDimensions())ui.info.textContent='Dimensioni non valide: ogni lato deve avere 1–600 celle, massimo 100.000 caselle.';
    else ui.info.textContent=`Griglia ${ui.cols.value} × ${ui.rows.value} · ${Number(ui.cols.value)*Number(ui.rows.value)} caselle`;
    return ready;
  }
  function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');
    script.src=src;script.async=true;script.onload=()=>window.pdfjsLib?resolve(window.pdfjsLib):reject(Error('PDF.js non valido: '+src));
    script.onerror=()=>reject(Error('Risorsa non disponibile: '+src));document.head.appendChild(script);
  });}
  async function ensurePDFJS(){
    if(window.pdfjsLib)return window.pdfjsLib;
    if(pdfLoader)return pdfLoader;
    pdfLoader=(async()=>{
      const lib=await loadScript(PDFJS_LOCAL).catch(()=>{
        throw Error('Motore PDF.js locale non disponibile. Verifica la cartella vendor e ripristina i file originali del sito.');
      });
      if(lib.GlobalWorkerOptions)lib.GlobalWorkerOptions.workerSrc=WORKER_LOCAL;
      return lib;
    })().catch(e=>{pdfLoader=null;throw e;});
    return pdfLoader;
  }
  // Keep the v0.8.1 document fingerprint algorithm to preserve previous
  // tracking and manually assigned colors for the same PDF and crop.
  async function fingerprint(data,file){
    try{
      if(!crypto?.subtle)throw Error('WebCrypto unavailable');
      const digest=await crypto.subtle.digest('SHA-256',data.slice(0));
      return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    }catch{const bytes=new Uint8Array(data);let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return 'fnv32-'+(h>>>0).toString(16)+'-'+bytes.length;}
  }
  function recentKey(){return 'pp-pdf-tracker-last-v1:'+state.hash;}
  function restoreLast(){
    try{const record=JSON.parse(localStorage.getItem(recentKey())||'null');
      if(record&&Number.isInteger(record.page)&&record.page>=1&&record.page<=state.doc.numPages&&validRect(record.rect)
        &&Number.isInteger(record.cols)&&Number.isInteger(record.rows)&&record.cols>0&&record.rows>0&&record.cols<=MAX_SIDE&&record.rows<=MAX_SIDE&&record.cols*record.rows<=MAX_CELLS)
        return record;
    }catch{}
    return null;
  }
  async function readFile(file,options={}){
    if(!file)return;
    if(!/\.pdf$/i.test(file.name)){notify('Seleziona un PDF.',true);return;}
    if(file.size>MAX_BYTES){notify('Dimensione PDF superiore a 30 MB.',true);return;}
    openDialog();state.loading=true;state.imageReady=false;state.drag=null;state.page=1;state.rect=initialRect();
    state.name=file.name;state.hash='';state.buffer=null;ui.filename.setAttribute('data-i18n-ignore','');ui.filename.textContent=file.name;
    ui.preview.width=ui.preview.height=ui.overlayCanvas.width=ui.overlayCanvas.height=1;
    ui.cols.value='';ui.rows.value='';ui.page.replaceChildren();refreshValidity();message('Apertura del PDF in corso…');
    const token=++state.renderToken;
    try{
      const bytes=await file.arrayBuffer();if(token!==state.renderToken)return;state.buffer=bytes.slice(0);
      if(String.fromCharCode(...new Uint8Array(bytes.slice(0,5)))!=='%PDF-')throw Error('Il file non presenta un’intestazione PDF valida.');
      state.hash=await fingerprint(bytes,file);
      // Compatibility with v0.9.x opened via file:// (no WebCrypto): earlier
      // releases used filename:size. Never silently restore that weak key for a
      // different document: ask the user and let them review the old grid.
      if(!options.project && state.hash.startsWith('fnv32-')){
        const legacyHash=file.name+':'+file.size;
        try{
          if(localStorage.getItem('pp-pdf-tracker-last-v1:'+legacyHash) &&
            window.ppConfirm('Ho trovato un salvataggio di una versione precedente associato a nome e dimensione del PDF. Vuoi provare a recuperarlo? Verifica attentamente che il disegno sia lo stesso.')){
            state.hash=legacyHash;
          }
        }catch(e){console.warn('Recupero salvataggio precedente non disponibile',e);}
      }
      if(options.project){
        if(!options.project.pdf?.checksum || window.PuntoPuntoPDFCodec.checksum(new Uint8Array(bytes))!==options.project.pdf.checksum)
          throw Error('Il contenuto PDF del progetto non supera il controllo di integrità.');
        // Use the saved fingerprint so projects move between secure and local browser contexts.
        state.hash=options.project.source.hash;
      }
      const lib=await ensurePDFJS();
      if(token!==state.renderToken)return;
      const doc=await lib.getDocument({data:new Uint8Array(bytes),useSystemFonts:true,isEvalSupported:false,enableScripting:false,enableXfa:false}).promise;
      if(token!==state.renderToken){try{await doc.destroy();}catch{}return;}
      const previous=state.doc;state.doc=doc;
      if(previous){try{await previous.destroy();}catch{}}
      for(let n=1;n<=doc.numPages;n++){
        const opt=document.createElement('option');opt.value=String(n);opt.textContent=`Pagina ${n} di ${doc.numPages}`;ui.page.append(opt);
      }
      const last=options.project?options.project.source:(options.resumeSource||restoreLast());
      if(options.project){
        if(!last||last.name!==state.name||last.hash!==state.hash||!Number.isInteger(last.page)||last.page<1||last.page>doc.numPages||!validRect(last.rect)||
          !Number.isInteger(last.cols)||!Number.isInteger(last.rows)||last.cols<1||last.rows<1||last.cols*last.rows>MAX_CELLS)
          throw Error('Il PDF non corrisponde alla configurazione del progetto salvato.');
      }
      if(last){state.page=last.page;state.rect={...last.rect};ui.cols.value=String(last.cols);ui.rows.value=String(last.rows);}
      else{state.page=1;state.rect=initialRect();}
      await displayPage(state.page,token);
      if(token!==state.renderToken)return;
      if(options.project){
        await window.PuntoPuntoPDFTracker.open({image:ui.preview,name:state.name,hash:state.hash,page:state.page,cols:last.cols,rows:last.rows,rect:{...last.rect},pdfBytes:state.buffer});
        window.PuntoPuntoPDFTracker.restoreProject(options.project);closeDialog();
      }
      else if(options.resumeSource&&last){
        await window.PuntoPuntoPDFTracker.open({image:ui.preview,name:state.name,hash:state.hash,page:state.page,cols:last.cols,rows:last.rows,rect:{...last.rect},pdfBytes:state.buffer});
        closeDialog();
      }
      message(last?'Configurazione precedente ripristinata: verifica allineamento, colonne e righe prima di confermare.':
        'Seleziona il rettangolo della griglia (escludi legenda, numeri e margini), poi inserisci righe e colonne.');
    }catch(err){if(token!==state.renderToken)return;console.error(err);message('Impossibile aprire il PDF: '+err.message,true);notify('PDF non aperto: '+err.message,true);if(options.project)throw err;}
    finally{if(token===state.renderToken){state.loading=false;refreshValidity();}}
  }
  async function displayPage(number,parentToken){
    if(!state.doc)return;
    const n=Number(number);if(!Number.isInteger(n)||n<1||n>state.doc.numPages)throw Error('Pagina non valida.');
    state.loading=true;state.imageReady=false;state.drag=null;ui.page.value=String(n);state.page=n;refreshValidity();message('Rendering della pagina '+n+'…');
    const token=parentToken??++state.renderToken;
    try{
      const page=await state.doc.getPage(n);
      const natural=page.getViewport({scale:1});
      const scale=Math.min(2.6,2200/Math.max(natural.width,natural.height));
      const viewport=page.getViewport({scale});
      const w=Math.max(1,Math.ceil(viewport.width)),h=Math.max(1,Math.ceil(viewport.height));
      // Render to a detached canvas: stale page requests cannot overwrite the live preview.
      const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;
      const ctx=tmp.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
      await page.render({canvasContext:ctx,viewport,intent:'display'}).promise;
      if(token!==state.renderToken)return;
      ui.preview.width=ui.overlayCanvas.width=w;
      ui.preview.height=ui.overlayCanvas.height=h;
      ui.preview.getContext('2d',{alpha:false}).drawImage(tmp,0,0);
      state.width=w;state.height=h;state.imageReady=true;
      syncPercent();drawOverlay();refreshValidity();
    }finally{if(token===state.renderToken){state.loading=false;refreshValidity();}}
  }
  function syncPercent(){
    const r=state.rect;
    for(const [ctrl,v] of [[ui.x,r.x],[ui.y,r.y],[ui.w,r.w],[ui.h,r.h]])ctrl.value=(v*100).toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
  }
  function applyPercent(){
    const candidate={x:Number(ui.x.value)/100,y:Number(ui.y.value)/100,w:Number(ui.w.value)/100,h:Number(ui.h.value)/100};
    if(!validRect(candidate)){message('Le coordinate devono restare nella pagina: controlla posizione e dimensioni.',true);syncPercent();return;}
    state.rect=candidate;drawOverlay();refreshValidity();message('Rettangolo aggiornato. Controlla che corrisponda esattamente ai bordi della griglia.');
  }
  function drawOverlay(){
    const cvs=ui.overlayCanvas,ctx=cvs.getContext('2d'),W=cvs.width,H=cvs.height;
    ctx.clearRect(0,0,W,H);if(!state.imageReady)return;
    const r=state.rect,L=r.x*W,T=r.y*H,R=(r.x+r.w)*W,B=(r.y+r.h)*H,w=R-L,h=B-T;
    // Dim everything outside the chosen chart rectangle.
    ctx.fillStyle='rgba(10,25,20,.22)';ctx.fillRect(0,0,W,T);ctx.fillRect(0,T,L,h);ctx.fillRect(R,T,W-R,h);ctx.fillRect(0,B,W,H-B);
    ctx.fillStyle='rgba(29,154,109,.045)';ctx.fillRect(L,T,w,h);
    if(validDimensions()){
      const cols=Number(ui.cols.value),rows=Number(ui.rows.value);
      ctx.beginPath();
      for(let c=1;c<cols;c++){const x=L+c*w/cols;ctx.moveTo(x,T);ctx.lineTo(x,B);}
      for(let row=1;row<rows;row++){const y=T+row*h/rows;ctx.moveTo(L,y);ctx.lineTo(R,y);}
      ctx.lineWidth=Math.max(.6,W/1500);ctx.strokeStyle='rgba(11,123,101,.55)';ctx.stroke();
      ctx.beginPath();
      for(let c=10;c<cols;c+=10){const x=L+c*w/cols;ctx.moveTo(x,T);ctx.lineTo(x,B);}
      for(let row=10;row<rows;row+=10){const y=T+row*h/rows;ctx.moveTo(L,y);ctx.lineTo(R,y);}
      ctx.strokeStyle='rgba(0,89,75,.78)';ctx.lineWidth=Math.max(1,W/1000);ctx.stroke();
    }
    ctx.strokeStyle='#078a69';ctx.lineWidth=Math.max(2.5,W/620);ctx.setLineDash([12,7]);ctx.strokeRect(L,T,w,h);ctx.setLineDash([]);
    const radius=Math.max(6,W/130);
    for(const [x,y] of [[L,T],[R,T],[L,B],[R,B]]){
      ctx.fillStyle='white';ctx.strokeStyle='#078a69';ctx.lineWidth=Math.max(2,W/800);
      ctx.fillRect(x-radius,y-radius,radius*2,radius*2);ctx.strokeRect(x-radius,y-radius,radius*2,radius*2);
    }
    ctx.font=`bold ${Math.max(12,W/78)}px system-ui`;ctx.textBaseline='top';
    ctx.fillStyle='#05664e';ctx.fillText(validDimensions()?`${ui.cols.value} × ${ui.rows.value}`:'Inserisci colonne e righe',L+radius,T+radius+4);
  }
  function point(e){
    const box=ui.preview.getBoundingClientRect();
    return{x:clamp((e.clientX-box.left)/box.width,0,1),y:clamp((e.clientY-box.top)/box.height,0,1)};
  }
  function chooseMode(p){
    const r=state.rect;
    const bounds=ui.preview.getBoundingClientRect();
    const spanX=Math.max(.027,15/Math.max(bounds.width,1));
    const spanY=Math.max(.027,15/Math.max(bounds.height,1));
    const corners=[['nw',r.x,r.y],['ne',r.x+r.w,r.y],['sw',r.x,r.y+r.h],['se',r.x+r.w,r.y+r.h]];
    let closest=null,min=Infinity;
    for(const [name,x,y] of corners){const d=Math.hypot((p.x-x)*(state.width/state.height||1),p.y-y);
      if(Math.abs(p.x-x)<=spanX&&Math.abs(p.y-y)<=spanY&&d<min){min=d;closest=name;}}
    if(closest)return closest;
    if(p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h)return 'move';
    return 'new';
  }
  function onDown(e){
    if(!state.imageReady||state.loading||e.button!==0&&e.pointerType==='mouse')return;
    e.preventDefault();const p=point(e);
    state.drag={id:e.pointerId,mode:chooseMode(p),start:p,origin:{...state.rect}};
    try{ui.shell.setPointerCapture(e.pointerId);}catch{}
  }
  function onMove(e){
    const d=state.drag;if(!d||d.id!==e.pointerId)return;
    const p=point(e),o=d.origin,min=.006;
    if(d.mode==='new'){
      const x=Math.min(d.start.x,p.x),y=Math.min(d.start.y,p.y);
      state.rect={x,y,w:Math.max(min,Math.abs(p.x-d.start.x)),h:Math.max(min,Math.abs(p.y-d.start.y))};
      state.rect.w=Math.min(state.rect.w,1-state.rect.x);state.rect.h=Math.min(state.rect.h,1-state.rect.y);
    }else if(d.mode==='move'){
      state.rect={...o,x:clamp(o.x+p.x-d.start.x,0,1-o.w),y:clamp(o.y+p.y-d.start.y,0,1-o.h)};
    }else{
      const left=o.x,top=o.y,right=o.x+o.w,bottom=o.y+o.h;
      const x=d.mode.includes('w')?clamp(p.x,0,right-min):left;
      const y=d.mode.startsWith('n')?clamp(p.y,0,bottom-min):top;
      const r=d.mode.includes('e')?clamp(p.x,left+min,1):right;
      const b=d.mode.startsWith('s')?clamp(p.y,top+min,1):bottom;
      state.rect={x,y,w:r-x,h:b-y};
    }
    syncPercent();drawOverlay();refreshValidity();e.preventDefault();
  }
  function onUp(e){
    const d=state.drag;if(!d||d.id!==e.pointerId)return;
    state.drag=null;
    if(!validRect(state.rect)){state.rect={...d.origin};syncPercent();drawOverlay();}
    refreshValidity();
    message(validDimensions()?'Controlla l’allineamento della prima e ultima colonna e riga, poi conferma.':'Area selezionata. Ora specifica colonne e righe.');
    try{ui.shell.releasePointerCapture(e.pointerId);}catch{}
  }
  async function confirm(){
    if(!refreshValidity())return;
    try{
      ui.confirm.disabled=true;
      // Explicitly use the rendered PDF canvas and the exact manually declared grid.
      await window.PuntoPuntoPDFTracker.open({
        image:ui.preview,name:state.name,hash:state.hash,page:state.page,
        cols:Number(ui.cols.value),rows:Number(ui.rows.value),rect:{...state.rect},pdfBytes:state.buffer
      });
      closeDialog();notify('PDF pronto: griglia manuale '+ui.cols.value+' × '+ui.rows.value+'.');
    }catch(err){message('Impossibile aprire la griglia: '+err.message,true);notify(err.message,true);}
    finally{refreshValidity();}
  }
  function selectFile(){ui.file.click();}
  $('openPDF').addEventListener('click',selectFile);
  $('welcomePDF').addEventListener('click',selectFile);
  ui.file.addEventListener('change',async()=>{const file=ui.file.files?.[0];ui.file.value='';await readFile(file);});
  ui.page.addEventListener('change',async()=>{
    // No inferred grid or colors: a different page must be manually delimited.
    state.rect=initialRect();ui.cols.value='';ui.rows.value='';++state.renderToken;
    try{await displayPage(Number(ui.page.value));message('Pagina selezionata. Delimita la griglia su questa pagina.');}
    catch(err){message('Pagina non caricata: '+err.message,true);}
  });
  [ui.cols,ui.rows].forEach(field=>field.addEventListener('input',()=>{refreshValidity();drawOverlay();}));
  [ui.x,ui.y,ui.w,ui.h].forEach(field=>field.addEventListener('change',applyPercent));
  ui.shell.addEventListener('pointerdown',onDown);
  ui.shell.addEventListener('pointermove',onMove);
  ui.shell.addEventListener('pointerup',onUp);
  ui.shell.addEventListener('pointercancel',onUp);
  $('pdfClose').addEventListener('click',closeDialog);$('pdfCancel').addEventListener('click',closeDialog);
  ui.confirm.addEventListener('click',confirm);
  ui.overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();closeDialog();}});
  async function loadProject(payload){
    if(payload?.format!=='PuntoPunto-Project'||payload.version!==1||typeof payload.pdf?.data!=='string'||payload.pdf.data.length>43*1024*1024||
       !payload.source||payload.pdf.encoding!=='base64')throw Error('Progetto non valido.');
    let bytes;try{const decoded=atob(payload.pdf.data);bytes=new Uint8Array(decoded.length);for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);}catch{throw Error('Contenuto PDF non decodificabile.');}
    if(bytes.length>MAX_BYTES||String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw Error('Il progetto non contiene un PDF valido.');
    const name=payload.source.name;
    if(typeof name!=='string'||!name.toLowerCase().endsWith('.pdf'))throw Error('Nome del PDF non valido.');
    const file=new File([bytes],name,{type:'application/pdf'});
    await readFile(file,{project:payload});
  }
  window.PuntoPuntoPDFImport={readFile,loadProject};
})();

/* Responsive UI review 0.9.8.8.23. Presentation only: reuses the original controls,
   listeners and canvas nodes. No project, palette or persistence transformations. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const texts=[];
  function make(tag,cls,parent){const e=document.createElement(tag);e.className=cls;if(parent)parent.append(e);return e;}
  function label(e,it,en){e.dataset.i18nIgnore='';texts.push([e,it,en]);return e;}
  function heading(parent,it,en){return label(make('h3','studio-heading',parent),it,en);}
  function move(parent,...nodes){nodes.forEach(n=>{if(n)parent.append(n);});}
  function button(parent,it,en,fn,cls='btn btn-outline'){const b=label(make('button',cls,parent),it,en);b.type='button';b.addEventListener('click',fn);return b;}
  const root=$('pdfTracker'),panel=$('trackerControlPanel');
  // Replace the old vertical pile with a left tool rail / canvas / right inspector.
  const steps=make('nav','studio-steps');root.prepend(steps);
  steps.setAttribute('aria-label','PDF workflow');
  const step1=label(make('div','studio-step is-done',steps),'1  Griglia impostata','1  Grid ready');
  const stepButtons=[];
  [['2  Colori e punti','2  Colours & stitches','colours'],['3  Rifinisci','3  Review','manage'],['4  Salva ed esporta','4  Save & export','export']].forEach(([it,en,key])=>{
    const b=button(steps,it,en,()=>{selectTab(key);if(matchMedia('(max-width:700px)').matches&&!root.classList.contains('pp-mobile-threads-open'))$('trackerMobileThreads').click();},'studio-step');stepButtons.push([b,key]);
  });
  const bar=root.querySelector('.pp-tracker-bar');
  const work=make('div','studio-workspace',root);
  const tools=make('aside','studio-tools',work);heading(tools,'Strumenti','Tools');
  const toolBox=make('section','studio-tool-section',tools);heading(toolBox,'Modifica e avanzamento','Edit & progress');
  const digital=root.querySelector('.pp-digital-tools');move(toolBox,digital);
  const view=make('section','studio-tool-section',tools);heading(view,'Visualizzazione','View');
  const zoom=make('div','studio-zoom',view);move(zoom,$('trackerMinus'),$('trackerZoomLabel'),$('trackerPlus'));move(view,$('trackerFocus'));
  const undo=make('section','studio-tool-section',tools);heading(undo,'Ultima operazione','Last operation');move(undo,$('trackerUndoBulk'));
  label(make('p','studio-note',undo),'Annulla l’ultimo riempimento, la sostituzione o l’eliminazione di un filato.','Undo the last fill, thread replacement or removal.');
  const canvas=make('section','studio-canvas',work);move(canvas,bar,$('trackerScroller'),root.querySelector('.pp-tracker-details'));
  move(work,panel);
  move(bar,$('trackerTutorial'),$('trackerClose'));
  // Three explicit inspector sections. All original IDs remain unique.
  const oldHead=panel.querySelector('.pp-c-legend-head');oldHead.querySelector('strong').classList.add('studio-superseded');
  heading(panel,'Colori e gestione schema','Colours & pattern');
  const tabs=make('div','studio-tabs',panel);tabs.setAttribute('role','tablist');
  const panes={};const tabButtons={};let active='colours';
  [['colours','Colori','Colours'],['manage','Gestione','Manage'],['export','Esporta','Export']].forEach(([key,it,en],index)=>{
    const b=button(tabs,it,en,()=>selectTab(key),'studio-tab');b.id='studio-tab-'+key;b.setAttribute('role','tab');b.setAttribute('aria-controls','studio-pane-'+key);
    const pane=make('section','studio-pane',panel);pane.id='studio-pane-'+key;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',b.id);pane.tabIndex=0;
    panes[key]=pane;tabButtons[key]=b;
    b.addEventListener('keydown',e=>{const keys=Object.keys(panes);let next=index;if(e.key==='ArrowRight')next=(index+1)%3;else if(e.key==='ArrowLeft')next=(index+2)%3;else if(e.key==='Home')next=0;else if(e.key==='End')next=2;else return;e.preventDefault();selectTab(keys[next]);tabButtons[keys[next]].focus();});
  });
  const colours=panes.colours;
  move(colours,oldHead);
  heading(colours,'Filati nello schema','Pattern palette');move(colours,$('trackerLegendList'),$('trackerPaletteEditor'));
  heading(colours,'Aggiungi un filato','Add a thread');move(colours,$('trackerCatalogWrap'));
  heading(panes.manage,'Rifinisci lo schema','Review your pattern');
  label(make('p','studio-note',panes.manage),'Completa le caselle restanti e controlla la digitalizzazione prima di esportare.','Resolve the remaining cells and review your digitisation before exporting.');
  move(panes.manage,root.querySelector('.pp-digital-summary'));
  button(panes.manage,'Sostituisci o elimina un filato →','Replace or remove a thread →',()=>selectTab('colours'));
  label(make('p','studio-note',panes.manage),'Nella palette, usa Gestisci accanto al filato da correggere.','In the palette, choose Manage next to the thread you want to change.');
  heading(panes.export,'Salvataggi e file','Save & files');move(panes.export,$('trackerActionsMenu'));
  label(make('p','studio-note',panes.export),'Salva progetto include PDF e digitalizzazione. Esporta OXS si attiva quando tutte le caselle sono definite.','Save project includes the PDF and digitisation. Export OXS becomes available once every cell is defined.');
  move(panes.export,root.querySelector('.pp-rights-notice'));
  // Undo also remains visible next to the canvas. Palette collapse retains its original behavior.
  panel.querySelector('.pp-tracker-compact-note').classList.add('studio-superseded');
  const mobileToolsHome=make('div','studio-mobile-tool-home',colours);
  const toolHome=toolBox;
  function adaptTools(){if(matchMedia('(max-width:700px)').matches){mobileToolsHome.append(digital,view,undo);$('trackerActionsMenu').append($('trackerTutorial'));}else{toolHome.append(digital);tools.append(view,undo);if(matchMedia('(max-width:1100px)').matches)$('trackerActionsMenu').append($('trackerTutorial'));else bar.append($('trackerTutorial'));}}
  matchMedia('(max-width:700px)').addEventListener('change',adaptTools);matchMedia('(max-width:1100px)').addEventListener('change',adaptTools);adaptTools();
  function selectTab(key){active=key;for(const k of Object.keys(panes)){panes[k].hidden=k!==key;tabButtons[k].setAttribute('aria-selected',String(k===key));tabButtons[k].tabIndex=k===key?0:-1;}stepButtons.forEach(([b,k])=>{b.classList.toggle('is-current',k===key);if(k===key)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});}
  selectTab('colours');
  let wasOpen=false;
  new MutationObserver(()=>{const open=!root.classList.contains('hidden');if(open&&!wasOpen){selectTab('colours');if(panel.classList.contains('pp-compact'))$('trackerCollapse').click();}wasOpen=open;}).observe(root,{attributes:true,attributeFilter:['class']});
  // Home: welcoming entry points, without empty editing panels.
  const welcome=$('welcome'),inner=welcome.querySelector('.welcome-inner');
  const intro=make('div','studio-home-intro');const actions=make('div','studio-home-actions');
  move(intro,inner.querySelector('.hero-tag'),inner.querySelector('h2'),inner.querySelector(':scope > p'),inner.querySelector('.hero-art'));
  const homeFiles=inner.querySelector('.pp-mobile-file-actions');move(actions,homeFiles);
  const resume=button(actions,'Riprendi un progetto PDF','Open a saved PDF project',()=>$('openProject').click(),'studio-home-project');
  label(make('p','studio-note',actions),'Riapri un progetto salvato in formato PuntoPunto JSON.','Reopen a project saved as PuntoPunto JSON.');
  move(actions,$('resumeLastPDF'),$('openHomeGuide'),$('openExample'),$('welcomePDF'));
  const drop=$('dropArea');move(actions,drop);move(inner,intro,actions);
  // Keep the branded mark and wordmark exactly as supplied. No replacement assets.
  const nav=make('div','studio-header-nav');document.querySelector('.topbar').insertBefore(nav,document.querySelector('.topbar-actions'));
  button(nav,'Guida','Guide',()=>$('openHomeGuide').click(),'btn btn-plain');
  const edition=label(make('span','studio-edition',document.querySelector('.bottomline')),'Versione · 0.9.8.8.23.2','Version · 0.9.8.8.23.2');
  function syncMode(){document.body.classList.toggle('studio-home',!welcome.classList.contains('hidden'));}
  new MutationObserver(syncMode).observe(welcome,{attributes:true,attributeFilter:['class']});syncMode();
  // Setup dialog: form and PDF preview side by side, never resize one canvas independently.
  label($('pdfOverlay').querySelector('.eyebrow'),'PDF INTERATTIVO · 0.9.8.8.23.2','INTERACTIVE PDF · 0.9.8.8.23.2');
  const body=$('pdfOverlay').querySelector('.pp-pdf-body');const setup=make('div','studio-setup-grid',body),form=make('div','studio-setup-form',setup),preview=make('div','studio-setup-preview',setup);
  move(form,body.querySelector('.pp-pdf-fields'),$('pdfStatus'),body.querySelector('.pp-manual-precise'));
  move(preview,body.querySelector('.pp-manual-guide'),$('pdfPreviewShell'));
  function translate(){const en=window.PuntoPuntoI18n?.language==='en';steps.setAttribute('aria-label',en?'PDF workflow':'Percorso PDF');tabs.setAttribute('aria-label',en?'Colours, management and export':'Colori, gestione ed esportazione');texts.forEach(([e,it,eng])=>{e.textContent=en?eng:it;});}
  document.addEventListener('puntopunto:languagechange',translate);translate();
})();

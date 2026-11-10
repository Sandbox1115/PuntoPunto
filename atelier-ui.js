/* Responsive presentation layer; original commands, project IDs and persistence retained. */
(() => {
'use strict';const $=id=>document.getElementById(id),words=[];const en=()=>window.PuntoPuntoI18n?.language==='en';
function el(tag,cls,parent){const e=document.createElement(tag);e.className=cls;if(parent)parent.append(e);return e;}
function text(e,it,eng){e.dataset.i18nIgnore='';words.push([e,it,eng]);e.textContent=en()?eng:it;return e;}
function btn(parent,it,eng,fn,cls='btn btn-outline'){const b=text(el('button',cls,parent),it,eng);b.type='button';b.addEventListener('click',fn);return b;}
function title(parent,it,eng){return text(el('h3','atelier-title',parent),it,eng);}
const proxies=[];function proxy(parent,id,it,eng){const b=btn(parent,it,eng,() => $(id)?.click(),'atelier-tool');proxies.push([b,id]);return b;}
const top=document.querySelector('.topbar');const slogan=text(el('p','atelier-slogan',top),'Il tuo ricamo prende forma.\nUn punto alla volta.','Your stitching takes shape.\nOne stitch at a time.');
const florals=el('div','atelier-flowers',top);florals.setAttribute('aria-hidden','true');
const nav=el('nav','atelier-nav');nav.setAttribute('aria-label',en()?'Workspace navigation':'Navigazione area di lavoro');top.after(nav);
btn(nav,'▱  Apri progetto','▱  Open project',()=>$('openProject').click());btn(nav,'＋  Apri uno schema','＋  Open a pattern',()=>openDialog('files'));btn(nav,'▤  Guida','▤  Guide',()=>$('openHomeGuide').click());btn(nav,'⚙︎  Visualizzazione','⚙︎  Appearance',()=>openDialog('appearance'));
const dialog=el('dialog','atelier-dialog',document.body);dialog.id='atelierDialog';const dh=el('header','atelier-dialog-head',dialog);const dt=title(dh,'Visualizzazione','Appearance');dt.id='atelierDialogTitle';dialog.setAttribute('aria-labelledby',dt.id);btn(dh,'× Chiudi','× Close',()=>dialog.close());const dc=el('div','atelier-dialog-content',dialog);
let returnFocus=null;dialog.addEventListener('close',()=>returnFocus?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
function appearance(parent){const box=el('section','atelier-appearance',parent);title(box,'Tessuto e visualizzazione','Fabric & appearance');el('div','atelier-fabric-sample',box).setAttribute('aria-hidden','true');
 text(el('p','atelier-note',box),'Tela Aida · anteprima tessile','Aida cloth · textile preview');
 [['cloth','Trama del tessuto (OXS)','Fabric weave (OXS)'],['threads','Punti come fili incrociati','Stitches as crossed threads'],['grid','Mostra griglia','Show grid'],['major','Griglia 10 × 10 (OXS)','10 × 10 grid (OXS)']].forEach(([k,it,eng])=>{const label=el('label','atelier-switch',box);text(el('span','',label),it,eng);const input=el('input','',label);input.type='checkbox';input.dataset.fabricSetting=k;input.checked=window.PuntoPuntoFabric.settings[k];input.addEventListener('change',()=>window.PuntoPuntoFabric.set(k,input.checked));});
 text(el('p','atelier-note',box),'Solo l’aspetto cambia. Il PDF originale e i colori dei filati restano il riferimento.','Only the view changes. The original PDF and thread colours remain the reference.');return box;
}
function openDialog(mode){returnFocus=document.activeElement;dc.replaceChildren();dt.textContent=en()?'Your workspace':'Il tuo spazio di ricamo';
 if(mode==='files'){title(dc,'Apri il tuo schema','Open your pattern');for(const [id,it,eng] of [['openPDF','▤ Apri PDF','▤ Open PDF'],['openFile','▦ Apri OXS','▦ Open OXS'],['openProject','▱ Riprendi progetto PDF','▱ Resume PDF project']])btn(dc,it,eng,()=>{dialog.close();$(id).click();});}
 else if(mode==='progress'){title(dc,'Avanzamento del ricamo','Stitching progress');for(const [id,it,eng] of [['percentDone','Completato','Completed'],['totalDone','Punti ricamati','Stitched'],['totalRemaining','Punti restanti','Remaining'],['dimensions','Dimensioni','Dimensions'],['lastSaved','Ultimo salvataggio','Last saved']]){const line=el('p','atelier-progress-line',dc);text(el('span','',line),it,eng);el('strong','',line).textContent=$(id).textContent;}proxy(dc,'resetProgress','↺ Ricomincia il tracciamento','↺ Reset progress');}
 else if(mode==='export'){title(dc,'Salva il tuo lavoro','Save your work');for(const [id,it,eng] of [['exportOXS','↓ Scarica OXS','↓ Download OXS'],['saveProgress','↓ Esporta progressi','↓ Export progress'],['loadProgress','↑ Importa progressi','↑ Import progress']])proxy(dc,id,it,eng);}
 else if(mode==='tools'){toolSet(dc);proxy(dc,'closeOXSProject','← Chiudi progetto','← Close project');btn(dc,'◷ Avanzamento','◷ Progress',()=>openDialog('progress'));appearance(dc);}else appearance(dc);
 dialog.showModal();sync();}
const rail=el('aside','atelier-oxs-tools');rail.id='atelierOXSTools';document.querySelector('.layout').prepend(rail);
function toolSet(parent){title(parent,'Strumenti di editing','Editing tools');for(const row of [['markTool','✓ Segna punti','✓ Mark stitches'],['panTool','✥ Sposta','✥ Pan'],['paintTool','╱ Modifica','╱ Edit'],['eraseTool','◇ Cancella','◇ Erase'],['restoreTool','↺ Originale','↺ Original']])proxy(parent,...row);title(parent,'Azioni','Actions');proxy(parent,'editUndo','↶ Annulla modifica','↶ Undo edit');proxy(parent,'oxsUndoMark','↶ Annulla segno','↶ Undo mark');}
toolSet(rail);btn(rail,'◷ Avanzamento','◷ Progress',()=>openDialog('progress'));btn(rail,'↥ Salva ed esporta','↥ Save & export',()=>openDialog('export'));title(rail,'Zoom e navigazione','Zoom & navigation');const zr=el('div','atelier-zoom',rail);proxy(zr,'zoomOut','−','−');proxy(zr,'zoomFit','Adatta','Fit');proxy(zr,'zoomIn','＋','＋');btn(rail,'⚙︎ Tessuto e vista','⚙︎ Fabric & view',()=>openDialog('appearance'));
const toolsHome=$('editor').querySelector('.editor-toolbar .tool-group');const mini=el('div','atelier-mini-tools');for(const r of [['markTool','✓ Segna','✓ Mark'],['paintTool','╱ Modifica','╱ Edit'],['panTool','✥ Sposta','✥ Pan']])proxy(mini,...r);btn(mini,'••• Altri','••• More',()=>openDialog('tools'),'atelier-tool');
const wrap=$('canvasWrap'),canvasLayout=el('div','atelier-canvas-layout');wrap.before(canvasLayout);canvasLayout.append(wrap,mini);
const options=appearance($('rightPanel'));$('rightPanel').prepend(options);
const pdfOptions=appearance(document.querySelector('.studio-workspace'));pdfOptions.classList.add('atelier-pdf-options');
// Compact copies of the real palette entries, with no fabricated swatches.
function swatchStrip(source,parent,cls){const strip=el('div','atelier-swatches '+cls,parent);strip.setAttribute('aria-label',en()?'Pattern palette':'Tavolozza schema');function update(){strip.replaceChildren();for(const item of source.querySelectorAll('button.legend-item,button.pp-c-thread')){const b=el('button','atelier-swatch',strip);b.type='button';const sample=item.querySelector('.legend-swatch,.swatch,.pp-c-thread-swatch');b.style.backgroundColor=sample?getComputedStyle(sample).backgroundColor:getComputedStyle(item).backgroundColor;b.title=item.textContent.trim();b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>item.click());}}new MutationObserver(update).observe(source,{childList:true,subtree:true});update();return strip;}
const oxsPalette=el('section','atelier-inline-palette');canvasLayout.after(oxsPalette);text(el('strong','',oxsPalette),'Tavolozza dello schema','Pattern palette');swatchStrip($('legendList'),oxsPalette,'');
const pp=el('div','atelier-palette-preview',$('studio-pane-colours'));$('studio-pane-colours').prepend(pp);text(el('strong','',pp),'Tavolozza dello schema','Pattern palette');swatchStrip($('trackerLegendList'),pp,'');
// Mobile dashboard follows the reference, with entry points supported by the app.
const homeGrid=el('div','atelier-home-grid');const actions=document.querySelector('.studio-home-actions');actions.prepend(homeGrid);
btn(homeGrid,'▱\nI miei progetti','▱\nMy projects',()=>$('openProject').click(),'atelier-home-card');btn(homeGrid,'▤\nGuida','▤\nGuide',()=>$('openHomeGuide').click(),'atelier-home-card');btn(homeGrid,'⚙︎\nAspetto','⚙︎\nAppearance',()=>openDialog('appearance'),'atelier-home-card');
const dock=el('nav','atelier-dock',document.body);dock.setAttribute('aria-label',en()?'Editor navigation':'Navigazione editor');
function pdf(){return !$('pdfTracker').classList.contains('hidden');}
function pdfPanel(tab){$('studio-tab-'+tab).click();if(!$('pdfTracker').classList.contains('pp-mobile-threads-open'))$('trackerMobileThreads').click();}
btn(dock,'⚒\nStrumenti','⚒\nTools',()=>{if(pdf()){pdfPanel('colours');document.querySelector('.studio-mobile-tool-home').scrollIntoView({block:'nearest'});}else openDialog('tools');});
btn(dock,'◉\nColori','◉\nColours',()=>{if(pdf())pdfPanel('colours');else $('leftPanel').scrollIntoView({behavior:'smooth',block:'start'});});
btn(dock,'▦\nSchema','▦\nPattern',()=>{if(pdf()){$('trackerMobilePanelClose').click();$('trackerScroller').scrollIntoView({block:'center'});}else $('canvasWrap').scrollIntoView({behavior:'smooth',block:'center'});});
btn(dock,'↥\nEsporta','↥\nExport',()=>{if(pdf())pdfPanel('export');else openDialog('export');});
function sync(){for(const [b,id] of proxies){const o=$(id);if(!b.isConnected)continue;b.disabled=!!o?.disabled;const pressed=o?.getAttribute('aria-pressed');if(pressed!==null){b.setAttribute('aria-pressed',pressed);b.classList.toggle('is-active',pressed==='true');}}document.querySelectorAll('[data-fabric-setting]').forEach(i=>{i.checked=window.PuntoPuntoFabric.settings[i.dataset.fabricSetting];});document.body.classList.toggle('atelier-cloth',window.PuntoPuntoFabric.settings.cloth);}
const obs=new MutationObserver(sync);['markTool','panTool','paintTool','eraseTool','restoreTool','editUndo','oxsUndoMark','exportOXS'].forEach(id=>obs.observe($(id),{attributes:true,attributeFilter:['disabled','aria-pressed']}));document.addEventListener('puntopunto:appearancechange',sync);sync();
document.addEventListener('puntopunto:languagechange',()=>{words.forEach(([e,it,eng])=>e.textContent=en()?eng:it);});
})();

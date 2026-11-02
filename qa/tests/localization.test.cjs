'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(ROOT,'i18n.js'),'utf8');
function engine(){
 const saved=new Map(),selectors=[],events=[];
 const doc={readyState:'loading',body:null,documentElement:{lang:'it'},addEventListener(){},dispatchEvent:e=>events.push(e),
  querySelectorAll:()=>selectors,querySelector:()=>null,head:{querySelector:()=>null}};
 const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
 const win={confirm:x=>x};
 vm.runInNewContext(source,{window:win,document:doc,localStorage:storage,CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail}},queueMicrotask:fn=>fn()});
 return {t:win.PuntoPuntoI18n,doc,selectors,saved,events};
}
class Node{
 constructor(){this.attributes=new Map();this.textContent='';this.dataset={};}
 setAttribute(k,v){this.attributes.set(k,v)}
 getAttribute(k){return this.attributes.get(k)||null}
}
test('PDF grid progress is a complete English message, not a mixture',()=>{
 const {t}=engine();const data={resolved:'1,200',total:'2,000',percent:60,stitches:500,empty:700,unknown:800};
 t.setLanguage('en');
 const out=t.message('pdf.progressStats',data);
 assert.equal(out,'Digitized 1,200 / 2,000 cells (60%) · 500 stitches · 700 empty · 800 to review');
 assert.doesNotMatch(out,/caselle|punti|vuote|verificare/);
 t.setLanguage('it');
 assert.equal(t.message('pdf.progressStats',{...data,resolved:'1.200',total:'2.000'}),'Digitalizzate 1.200 / 2.000 caselle (60%) · 500 punti · 700 vuote · 800 da verificare');
});
test('Legacy interpolated full sentences translate atomically, not by fragments',()=>{
 const {t}=engine();t.setLanguage('en');
 assert.equal(t.t('Digitalizzate 345 / 500 caselle (69%) · 300 punti · 45 vuote · 155 da verificare'),
  'Digitized 345 / 500 cells (69%) · 300 stitches · 45 empty · 155 to review');
 assert.equal(t.t('OXS verificato: 300 punti e 12 filati. Verifica visivamente la fedeltà al PDF.'),
  'OXS verified: 300 stitches and 12 threads. Visually compare it with the PDF.');
});
test('Text and tooltip bindings refresh on IT/EN/IT without duplicating content',()=>{
 const {t,doc,selectors}=engine();const label=new Node(),tooltip=new Node();selectors.push(label,tooltip);
 doc.body={nodeType:1,closest:()=>true};doc.head.querySelector=()=>({nodeType:3,parentElement:{closest:()=>true}});
 t.setText(label,'pdf.completionStats',{completed:2,stitches:7});
 t.setAttr(tooltip,'title','oxs.threadTooltip',{code:'DMC 310'});
 assert.equal(label.textContent,'2 caselle segnate come ricamate · 7 punti definiti');
 t.setLanguage('en');assert.equal(label.textContent,'2 cells marked as stitched · 7 stitches defined');
 assert.equal(tooltip.getAttribute('title'),'Show only thread color DMC 310');
 t.setLanguage('it');assert.equal(label.textContent,'2 caselle segnate come ricamate · 7 punti definiti');
 assert.equal(tooltip.getAttribute('title'),'Mostra soltanto il colore DMC 310');
});
test('Variable file and thread names remain unchanged in both languages',()=>{
 const {t}=engine();const variable={filename:'My original name - schema italiano.pdf',page:3,cols:34,rows:56};
 t.setLanguage('en');
 assert.equal(t.message('pdf.pdfInfo',variable),'My original name - schema italiano.pdf · page 3 · 34 × 56');
 assert.equal(t.message('pdf.duplicateThread',{code:'MIO-310'}),'Code MIO-310 is already used for another thread. For a custom thread choose a different code (e.g. MY-MIO-310).');
 t.setLanguage('it');assert.equal(t.message('pdf.pdfInfo',variable),'My original name - schema italiano.pdf · pagina 3 · 34 × 56');
});
test('OXS chooser progress and keyboard status use one complete locale',()=>{
 const {t}=engine();t.setLanguage('en');
 assert.equal(t.message('oxs.pickerProgress',{completed:2,total:3}),'2 of 3 stitches completed');
 assert.equal(t.message('oxs.keyboardStatus',{col:14,row:16,stitches:3,completed:2}),
 'Cell 14, 16. 3 stitches; 2 completed.');
 t.setLanguage('it');assert.equal(t.message('oxs.pickerProgress',{completed:2,total:3}),'2 di 3 punti completati');
});
test('Never silently fall back to Italian for an unknown localization ID',()=>{
 const {t}=engine();t.setLanguage('en');assert.throws(()=>t.message('pdf.unknown'),/Unknown localization key/);
});
test('Production sources and documents retain clear language boundaries',()=>{
 const read=n=>fs.readFileSync(path.join(ROOT,n),'utf8');
 assert.match(read('privacy.html'),/data-pp-locale="en"/);
 assert.match(read('licenze.html'),/data-pp-locale="it"/);
 assert.match(read('CHANGELOG.md'),/v0\.9\.8\.8\.21 — .*localization/);
 assert.match(read('CHANGELOG_IT.md'),/0\.9\.8\.8\.21 — .*localizzazione/);
 assert.match(read('app.js'),/msg\('oxs\.pickerProgress'/);
 assert.match(read('pdf-tracker.js'),/pdf\.progressStats/);
});

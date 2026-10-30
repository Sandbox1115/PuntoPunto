'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
function load(name,window,other={}) {
 const context={window,console, ...other};
 vm.runInNewContext(fs.readFileSync(path.join(ROOT,name),'utf8'),context,{filename:name});
 return context;
}
test('DMC source has 489 validated entries without fetching external data',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(ROOT,'data/dmc-floss.json'),'utf8'));
 assert.equal(data.id,'dmc-floss');assert.equal(data.license,'CC-BY-4.0');assert.equal(data.colors.length,489);
 assert.equal(new Set(data.colors.map(x=>x.code.toUpperCase())).size,489);
});
test('OXS codec rejects incomplete or inconsistent project',()=>{
 const win={};load('pdf-project-codec.js',win);const c=win.PuntoPuntoPDFCodec;
 const base={cols:2,rows:1,palette:[{code:'310',name:'Black',brand:'DMC',color:'#000000'}],cells:[[0,{kind:'full',code:'310'}]],empty:[1],completed:[0]};
 const model=c.normalize(base);
 assert.equal(model.unresolved,0);assert.equal(model.cells.size,1);
 assert.match(c.write(base,'QA test'),/chartwidth="2"/);
 assert.throws(()=>c.write({...base,empty:[]}),/non è completa/);
 assert.throws(()=>c.normalize({...base,cols:0}),/Dimensioni/);
 assert.throws(()=>c.normalize({...base,cells:[[0,{kind:'full',code:'310'}],[0,{kind:'full',code:'310'}]]}),/duplicato/);
 assert.throws(()=>c.normalize({...base,cells:[[2,{kind:'full',code:'310'}]]}),/fuori griglia/);
 assert.throws(()=>c.normalize({...base,completed:[0,0]}),/Avanzamento/);
 assert.throws(()=>c.normalize({...base,palette:[base.palette[0],base.palette[0]]}),/duplicato/);
});
test('OXS codec XML escapes titles and floss codes',()=>{
 const w={};load('pdf-project-codec.js',w);const c=w.PuntoPuntoPDFCodec;
 const source={cols:1,rows:1,palette:[{code:'A&B',color:'#123456',brand:'DMC',name:'<test>'}],cells:[[0,{kind:'full',code:'A&B'}]],empty:[],completed:[]};
 const out=c.write(source,'<A&B>');
 assert.match(out,/A&amp;B/);assert.match(out,/&lt;A&amp;B&gt;/);assert.match(out,/&lt;test&gt;/);
});
test('Browser snapshots reject corruption and recover previous valid record',()=>{
 const store=new Map();const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};const w={};
 load('storage-safe.js',w,{localStorage:storage});const s=w.PuntoPuntoStorage;
 assert.equal(s.write('qa',{score:1},x=>Number.isInteger(x.score)).ok,true);
 assert.equal(s.write('qa',{score:2},x=>Number.isInteger(x.score)).ok,true);
 assert.equal(s.read('qa',x=>Number.isInteger(x.score)).value.score,2);
 store.set('pp-snapshot-v1:qa','{"bad":"data"}');
 const restored=s.read('qa',x=>Number.isInteger(x.score));
 assert.equal(restored.found,true);assert.equal(restored.recovered,true);assert.equal(restored.damaged,true);assert.equal(restored.value.score,1);
 assert.equal(s.write('qa',{score:'bad'},x=>Number.isInteger(x.score)).ok,false);
});
test('Language engine switches IT/EN and restores original, including full labels',()=>{
 const win={confirm:x=>x};const map=new Map();const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const doc={readyState:'loading',addEventListener(){},dispatchEvent(){},body:null};
 class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail}}
 load('i18n.js',win,{localStorage:storage,document:doc,CustomEvent,queueMicrotask:fn=>fn()});
 const t=win.PuntoPuntoI18n;
 const source='Cancella il punto nella casella';
 assert.equal(t.t(source),source);
 t.setLanguage('en');assert.equal(t.t(source),'Erase the stitch in the cell');
 assert.equal(t.t('Schema a punto croce'),'Cross-stitch pattern');
 t.setLanguage('it');assert.equal(t.t(source),source);assert.equal(map.get('puntopunto.language'),'it');
});

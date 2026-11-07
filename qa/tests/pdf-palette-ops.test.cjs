'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const window={};
for(const name of ['pdf-project-codec.js','pdf-palette-ops.js'])vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),{window});
const codec=window.PuntoPuntoPDFCodec,ops=window.PuntoPuntoPDFPaletteOps;
const read=path=>fs.readFileSync(require('node:path').join(root,path),'utf8');
const data=()=>({cols:3,rows:2,palette:[{code:'310',color:'#000000',brand:'DMC',name:'Black'},{code:'666',color:'#dd0000',brand:'DMC',name:'Red'}],cells:[[0,{code:'310',kind:'halfBack'}],[1,{code:'666',kind:'full'}]],empty:[2],completed:[0,2]});
test('White bulk-fill preserves already colored stitches, fills undefined and confirmed empty',()=>{
 const old=data(),fresh=ops.fillWhite(old);
 assert.equal(fresh.changed,4);assert.equal(fresh.unknown,3);assert.equal(fresh.empty,1);
 assert.equal(fresh.data.cells.length,6);assert.equal(fresh.data.empty.length,0);
 const cells=new Map(fresh.data.cells);assert.equal(cells.get(0).code,'310');assert.equal(cells.get(0).kind,'halfBack');
 assert.equal(cells.get(1).code,'666');for(let i=2;i<6;i++){assert.equal(cells.get(i).code,'B5200');assert.equal(cells.get(i).kind,'full');}
 assert.equal(fresh.data.palette.find(x=>x.code==='B5200').color,'#ffffff');
 assert.deepEqual([...fresh.data.completed],[0]);assert.equal(codec.normalize(fresh.data).unresolved,0);
 assert.equal(old.cells.length,2);assert.deepEqual(old.empty,[2]);assert.deepEqual(old.completed,[0,2]);
 assert.match(codec.write(fresh.data),/number="B5200"/);
});
test('White fill is idempotent and reuses valid DMC Snow White without duplicates',()=>{
 const first=ops.fillWhite(data());const second=ops.fillWhite(first.data);
 assert.equal(second.changed,0);assert.equal(second.data.palette.filter(x=>x.code==='B5200').length,1);
});
test('White fill never hijacks custom B5200 with a different color',()=>{
 const old=data();old.palette.push({code:'B5200',color:'#abcdef',name:'custom blue',brand:'Personalizzato'});
 const r=ops.fillWhite(old);assert.equal(r.code,'PP-WHITE');
 assert.equal(r.data.palette.find(x=>x.code==='B5200').color,'#abcdef');
});
test('White fill fails safely if 100 threads already exist',()=>{
 const d=data();d.palette=Array.from({length:100},(_,i)=>({code:'T'+i,color:'#c0c0c0',brand:'Personalizzato',name:'x'}));d.cells=[];
 assert.throws(()=>ops.fillWhite(d),/100 filati/);assert.equal(d.palette.length,100);
});
test('Replace thread globally preserves stitch type and completion and removes only old palette item',()=>{
 const old=data();const fresh=ops.replaceThread(old,'310','666');
 assert.equal(fresh.affected,1);assert.equal(fresh.data.palette.length,1);
 assert.equal(new Map(fresh.data.cells).get(0).code,'666');assert.equal(new Map(fresh.data.cells).get(0).kind,'halfBack');
 assert.deepEqual([...fresh.data.completed],[0,2]);assert.equal(codec.normalize(fresh.data).unresolved,3);
 assert.equal(old.palette.length,2);assert.equal(new Map(old.cells).get(0).code,'310');
});
test('Replacement merges already used target without duplicate point or palette entries',()=>{
 const old=data();old.cells.push([3,{code:'310',kind:'quarterNE'}]);
 const next=ops.replaceThread(old,'310','666');
 assert.equal(next.affected,2);assert.equal(next.data.cells.length,3);assert.equal(next.data.palette.length,1);
 assert.equal(new Map(next.data.cells).get(3).kind,'quarterNE');
});
test('Replacement with missing or same target is refused without changing source',()=>{
 const old=data();assert.throws(()=>ops.replaceThread(old,'310','310'));
 assert.throws(()=>ops.replaceThread(old,'310','999'));
 assert.throws(()=>ops.replaceThread(old,'999','666'));
 assert.equal(old.palette.length,2);
});
test('Removal returns assigned squares to undefined and clears their completed flags',()=>{
 const old=data();const r=ops.removeThread(old,'310');
 assert.equal(r.affected,1);assert.equal(r.data.palette.length,1);
 assert.ok(!new Map(r.data.cells).has(0));assert.ok(!r.data.completed.includes(0));
 assert.ok(r.data.completed.includes(2));assert.equal(codec.normalize(r.data).unresolved,4);
 assert.throws(()=>codec.write(r.data),/non è completa/);
});
test('Remove unused thread preserves all point and completion data',()=>{
 const old=data();old.palette.push({code:'NEW',color:'#aaaaaa',name:'',brand:'Personalizzato'});
 const r=ops.removeThread(old,'NEW');assert.equal(r.affected,0);
 assert.deepEqual(Array.from(r.data.cells,x=>x[0]),old.cells.map(x=>x[0]));
});
test('Bulk actions never change codec, project serialization, locked DMC or external network',()=>{
 const s=read('pdf-palette-ops.js');
 assert.doesNotMatch(s,/fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|eval\s*\(/);
 assert.match(read('pdf-tracker.js'),/commitBulk\(/);
 assert.match(read('pdf-tracker.js'),/clearBulkUndo\(\);save\(\);draw\(\);/);
 assert.match(read('index.html'),/id="trackerUndoBulk"/);
 assert.match(read('index.html'),/id="trackerPaletteReplacement"/);
});
test('Mobile dropdown preserves existing button IDs, closing behavior and 44px touch targets',()=>{
 const html=read('index.html'),css=read('styles.css'),js=read('home-guide.js');
 for(const id of ['openPDF','openFile','openProject','mobileFileMenu','mobileFileMenuToggle','mobileOpenOXS','mobileOpenPDF'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 assert.match(js,/fileToggle\.addEventListener\('click'/);
 assert.match(js,/e\.key==='Escape'/);
 assert.match(css,/min-height:48px/);
 assert.match(css,/pp-file-actions\.is-open/);
});
test('Bulk operation confirmations and summaries have complete IT/EN templates',()=>{
 const source=read('i18n.js');
 const doc={readyState:'loading',body:null,documentElement:{lang:'it'},addEventListener(){},dispatchEvent(){},querySelectorAll:()=>[],querySelector:()=>null,head:{querySelector:()=>null}};
 const store=new Map(),localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 const win={confirm:()=>true};
 vm.runInNewContext(source,{window:win,document:doc,localStorage,queueMicrotask:fn=>fn(),CustomEvent:class{}});
 const lang=win.PuntoPuntoI18n,values={count:4,unknown:3,empty:1,source:'TEST-RED',target:'DMC 310',code:'B5200'};
 for(const mode of ['en','it']){
  lang.setLanguage(mode);
  for(const key of ['pdf.confirmFillWhite','pdf.filledWhite','pdf.confirmReplaceThread','pdf.replacedThread','pdf.confirmDeleteThread','pdf.deletedThread','pdf.paletteManageTitle','pdf.paletteManageInfo']){
   const output=lang.message(key,values);
   assert.ok(!output.includes('{'),key+' interpolation missing in '+mode);
   assert.ok(output.length>10,key+' missing in '+mode);
  }
 }
 lang.setLanguage('en');assert.match(lang.message('pdf.confirmFillWhite',values),/white DMC full stitches|white DMC/i);
 lang.setLanguage('it');assert.match(lang.message('pdf.confirmFillWhite',values),/croce intera/);
});

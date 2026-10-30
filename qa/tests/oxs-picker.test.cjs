'use strict';
// Tests the REAL chooser functions extracted from the production OXS editor.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const before=source.indexOf('  function cellPickerStitches(');
const after=source.indexOf('  function setCompleted(id,value){',before);
assert.ok(before>0&&after>before,'The cell chooser should be present');
const fragment=source.slice(before,after);

class Element {
  constructor(name='div'){
    this.nodeName=name;this.children=[];this.style={};this.attrs={};this.events={};
    this.classList={values:new Set(),add:x=>this.classList.values.add(x),remove:x=>this.classList.values.delete(x),
      toggle:(x,enabled)=>enabled?this.classList.values.add(x):this.classList.values.delete(x),
      contains:x=>this.classList.values.has(x)};
    this.textContent='';this.offsetWidth=300;this.offsetHeight=240;this.focused=false;
  }
  append(...items){this.children.push(...items)}
  appendChild(item){this.children.push(item);return item}
  replaceChildren(...items){this.children=[...items]}
  setAttribute(name,val){this.attrs[name]=val}
  addEventListener(name,fn){this.events[name]=fn}
  focus(){this.focused=true}
  click(){this.events.click?.()}
  querySelector(selector){return selector==='button'?this.children.find(x=>x.nodeName==='button'):null}
}
function harness({direction=1,completed=[],lang='it',pendingOnly=false,withNeighbor=false}={}){
  const a={id:1,kind:'full',x:13,y:15,palIndex:3};
  const b={id:2,kind:'part',x:13,y:15,side:1,direction,palIndex:1};
  const c={id:3,kind:'part',x:13,y:15,side:2,direction,palIndex:2};
  const neighbor={id:4,kind:'knot',x1:14.5,y1:15.5,palIndex:4};
  const pattern={width:34,height:34,byCell:new Map([[150013,[a,b,c]]]),
    specialsByCell:withNeighbor?new Map([[150013,[neighbor]]]):new Map()};
  const state={pattern,completed:new Set(completed),picker:null,pickerTimer:null,pendingOnly};
  const nodes=new Map(['stitchPicker','stitchPickerList','stitchPickerTitle','stitchPickerProgress'].map(n=>[n,new Element()]));
  const $=key=>nodes.get(key);
  const pal=new Map([[1,{color:'#edb39e',ink:'#234',number:'DMC 1',name:'Rose'}],
    [2,{color:'#9c8c4f',ink:'#234',number:'DMC 2',name:'Olive'}],
    [3,{color:'#d9b356',ink:'#234',number:'DMC 3',name:'Gold'}]]);
  const eventUpdates=[];
  const code=fragment+'\n;({cellPickerStitches,partLocation,openStitchPicker,closeStitchPicker,refreshStitchPicker})';
  const ctx={state,$,document:{createElement:n=>new Element(n)},window:{PuntoPuntoI18n:{language:lang,t:s=>s}},
    kindDefs:{full:['×','Croce intera'],part:['◩','Punto parziale']},
    colorFor:i=>pal.get(i)||{color:'#fff',name:'Thread',number:i},dimensions:()=>({w:800,h:600}),
    localToGrid:p=>p,setCompleted:(id,value)=>{value?state.completed.add(id):state.completed.delete(id);eventUpdates.push([id,value]);},
    rememberWorkPoint:()=>{},el:{wrap:{focus(){}}},clearTimeout:()=>{},stitchChoices:()=>[]};
  const funcs=vm.runInNewContext(code,ctx,{filename:'app.js:cell-picker'});
  const list=()=>nodes.get('stitchPickerList').children;
  const count=()=>nodes.get('stitchPickerProgress').textContent;
  return{a,b,c,neighbor,pattern,state,funcs,events:eventUpdates,list,count,nodes};
}
test('Example OXS has a full cross plus two differently colored triangular halves in one cell',()=>{
  const xml=fs.readFileSync(path.join(root,'esempio-fiore.oxs'),'utf8');
  assert.match(xml,/<stitch x="13" y="15" palindex="\d+"/);
  assert.match(xml,/<partstitch x="13" y="15" palindex1="1" palindex2="2" direction="1"/);
  const h=harness({withNeighbor:true});
  const all=h.funcs.cellPickerStitches(13.7,15.3,[h.c]);
  assert.equal(all.length,3,'The other triangle and full stitch must not be hidden by hit location');
  assert.equal(new Set(all.map(s=>s.id)).size,3,'Unique stitch IDs');
  assert.deepEqual(Array.from(all.map(s=>s.id)),[2,3,1]);
  assert.ok(!all.includes(h.neighbor),'Do not count a neighboring knot from the touch index');
});
test('Both triangular halves show correct independent geometry, named location and thread color',()=>{
  const h=harness();const all=h.funcs.cellPickerStitches(13.25,15.75,[h.b]);h.funcs.openStitchPicker({x:13.25,y:15.75},all);
  assert.equal(h.list().length,3);assert.equal(h.count(),'0 di 3 punti completati');
  const [first,second,full]=h.list();
  assert.equal(first.children[0].children[0].style.clipPath,'polygon(0 0,0 100%,100% 100%)');
  assert.equal(first.children[0].children[0].style.backgroundColor,'#edb39e');
  assert.equal(second.children[0].children[0].style.clipPath,'polygon(0 0,100% 0,100% 100%)');
  assert.equal(second.children[0].children[0].style.backgroundColor,'#9c8c4f');
  assert.equal(first.children[1].children[1].textContent,'Metà inferiore sinistra');
  assert.equal(second.children[1].children[1].textContent,'Metà superiore destra');
  assert.equal(full.children[1].children[0].textContent,'Croce intera');
  assert.equal(full.children[0].style.background,'#d9b356');
});
test('Marking all three points updates live 0/3 → 3/3 without adding an extra completion',()=>{
  const h=harness();h.funcs.openStitchPicker({x:13.25,y:15.75},h.funcs.cellPickerStitches(13.25,15.75,[h.b]));
  const rows=h.list();rows[0].click();assert.equal(h.count(),'1 di 3 punti completati');assert.equal(rows[0].attrs['aria-pressed'],'true');
  rows[1].click();assert.equal(h.count(),'2 di 3 punti completati');
  rows[2].click();assert.equal(h.count(),'3 di 3 punti completati');
  assert.equal(h.state.completed.size,3);assert.equal(h.list().length,3);
  rows[1].click();assert.equal(h.count(),'2 di 3 punti completati');assert.equal(h.state.completed.size,2);
  rows[1].click();assert.equal(h.count(),'3 di 3 punti completati');assert.equal(h.state.completed.size,3);
  assert.deepEqual(h.events.map(x=>x[0]),[2,3,1,3,3]);
});
test('Chooser shows all 3 even when Unfinished would hide completed points from canvas',()=>{
  const h=harness({completed:[1,2],pendingOnly:true});const entries=h.funcs.cellPickerStitches(13.7,15.3,[h.c]);
  h.funcs.openStitchPicker({x:13.7,y:15.3},entries);
  assert.equal(h.count(),'2 di 3 punti completati');assert.equal(h.list().length,3);
  assert.deepEqual([h.list()[0].attrs['aria-pressed'],h.list()[1].attrs['aria-pressed'],h.list()[2].attrs['aria-pressed']],['true','false','true']);
  assert.equal(h.state.completed.size,2,'Opening the chooser must not modify stored state');
});
test('Inverse diagonal (direction 2) has upper-left and lower-right labels in English',()=>{
  const h=harness({direction:2,lang:'en',completed:[3]});h.funcs.openStitchPicker({x:13.3,y:15.3},h.funcs.cellPickerStitches(13.3,15.3,[h.b]));
  assert.equal(h.count(),'1 of 3 stitches completed');
  assert.equal(h.list()[0].children[1].children[1].textContent,'Upper-left half');
  assert.equal(h.list()[1].children[1].children[1].textContent,'Lower-right half');
  assert.equal(h.list()[0].children[0].children[0].style.clipPath,'polygon(0 0,100% 0,0 100%)');
  assert.equal(h.list()[1].children[0].children[0].style.clipPath,'polygon(100% 0,100% 100%,0 100%)');
});
test('The OXS completion renderer retains the original plain tick, with no circular badges',()=>{
  const start=source.indexOf('  function drawCompletionMark('),end=source.indexOf('  function paintCompletionMarks(',start);
  const method=source.slice(start,end);
  assert.ok(start>0&&end>start);
  assert.match(method,/ctx\.moveTo\(x\+\.15\*scale,y\+\.56\*scale\)/);
  assert.match(method,/ctx\.lineTo\(x\+\.42\*scale,y\+\.8\*scale\)/);
  assert.match(method,/ctx\.lineTo\(x\+\.88\*scale,y\+\.2\*scale\)/);
  assert.match(method,/ctx\.strokeStyle='#176e60'/);
  assert.doesNotMatch(method,/\.arc\(|fillText|fillRect/);
});

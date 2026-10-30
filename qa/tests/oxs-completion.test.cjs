'use strict';
// Exercises the actual OXS completion renderer extracted from app.js.
// No third-party test packages or network access required.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../../app.js'),'utf8');
const from=source.indexOf('  function drawCompletionMark(');
const until=source.indexOf('  function stitchChoices(',from);
assert(from>0&&until>from,'The completion renderer and canvas redraw must exist');
const fragment=source.slice(from,until);

function harness({stitches=[],completed=[],cell=48,pendingOnly=false,activeColor=null,activeKind=null,
  specialsByCell=new Map(),cols=2,rows=2}={}){
  const calls=[],marks=[];
  const ctx=new Proxy({}, {
    set(obj,key,value){obj[key]=value;return true;},
    get(obj,key){
      if(key in obj)return obj[key];
      return (...args)=>{
        calls.push({op:key,args,style:obj.strokeStyle});
        if(key==='beginPath')marks.push([]);
        if(['moveTo','lineTo'].includes(key)&&marks.length)marks.at(-1).push(args);
      };
    }
  });
  const state={cell,completed:new Set(completed),pendingOnly,activeColor,activeKind,ox:0,oy:0,pattern:null};
  const matchesFilter=s=>(state.activeColor===null||s.palIndex===state.activeColor)
    &&(state.activeKind===null||s.kind===state.activeKind)
    &&(!state.pendingOnly||!state.completed.has(s.id));
  const byCell=new Map();
  for(const s of stitches){
    const key=s.y*10000+s.x;
    if(!byCell.has(key))byCell.set(key,[]);
    byCell.get(key).push(s);
  }
  state.pattern={width:cols,height:rows,byCell,specialsByCell,
    palette:new Map([[0,{color:'#fff'}]]),ornaments:[],linear:[]};
  const el={canvas:{width:500},wrap:{},coords:{}};
  const context={state,ctx,matchesFilter,el,keyboardCell:null,
    document:{activeElement:null},dimensions:()=>({w:cols*cell,h:rows*cell}),
    paintCell:()=>{},paintOrnament:()=>{},paintBack:()=>{},
    visuals:{token:s=>s.kind}};
  const api=vm.runInNewContext(fragment+';({drawCompletionMark,paintCompletionMarks,draw})',context,{filename:'app.js:completion'});
  return {state,calls,marks,api,strokes:()=>calls.filter(c=>c.op==='stroke'&&c.style==='#176e60').length,
    paths:()=>marks.filter(m=>m.length===3),reset:()=>{calls.length=0;marks.length=0;}};
}
const stitch=(id,kind='full',x=0,y=0,palIndex=1)=>({id,kind,x,y,palIndex});

test('Single completion uses the original plain check with exactly three vertices',()=>{
 const h=harness({stitches:[stitch(1)],completed:[1]});h.api.draw();
 assert.equal(h.strokes(),1);
 assert.deepEqual(Array.from(h.paths()[0].map(p=>Array.from(p))),[[.15,.56],[.42,.8],[.88,.2]]);
 assert.equal(h.calls.filter(c=>c.op==='arc').length,0,'The completion mark must not draw a circular badge');
 assert.equal(h.calls.filter(c=>c.op==='fillText').length,0,'The completion mark must not use a font glyph');
});
test('Overlapping full and half stitches retain the independent completion for the SECOND point',()=>{
 const h=harness({stitches:[stitch(1,'full'),stitch(2,'half')],completed:[2]});
 h.api.draw();assert.equal(h.strokes(),1);assert.equal(h.paths().length,1);
 assert.ok(h.paths()[0][0][0]<.5,'Second half stitch uses its own slot by render priority');
 assert.equal(h.calls.filter(c=>c.op==='arc').length,0);
 h.reset();h.state.completed.add(1);h.api.draw();
 assert.equal(h.strokes(),2);assert.equal(h.state.completed.size,2);
});
test('Unfinished hides every completed mark, including when the OTHER overlapping stitch is unfinished',()=>{
 const h=harness({stitches:[stitch(1),stitch(2,'half')],completed:[2],pendingOnly:true});
 h.api.draw();assert.equal(h.strokes(),0,'A completed point cannot show a tick in Unfinished mode');
 assert.equal(h.state.completed.size,1,'The progress record must not change on filter toggle');
 h.state.completed.add(1);h.reset();h.api.draw();assert.equal(h.strokes(),0);
 h.state.pendingOnly=false;h.reset();h.api.draw();assert.equal(h.strokes(),2);
 h.state.completed.delete(2);h.reset();h.api.draw();assert.equal(h.strokes(),1);
});
test('Thread and stitch-type filters suppress completion ticks from the other overlapping point',()=>{
 const h=harness({stitches:[stitch(1,'full',0,0,1),stitch(2,'half',0,0,2)],completed:[1,2]});
 h.state.activeColor=2;h.api.draw();assert.equal(h.strokes(),1);
 h.state.activeColor=null;h.state.activeKind='half';h.reset();h.api.draw();assert.equal(h.strokes(),1);
 h.state.activeKind=null;h.reset();h.api.draw();assert.equal(h.strokes(),2);
});
test('Low zoom and crowded cells show one original tick, never a circular badge',()=>{
 const multi=[stitch(1),stitch(2,'half')];
 const h=harness({stitches:multi,completed:[1,2],cell:9});h.api.draw();
 assert.equal(h.strokes(),1);assert.equal(h.calls.filter(c=>c.op==='arc').length,0);
 const crowded=harness({stitches:[...multi,stitch(3,'part'),stitch(4,'quarter'),stitch(5,'knot')],completed:[5]});
 crowded.api.draw();assert.equal(crowded.strokes(),1);
});
test('Neighbour ornaments in selection index must not create phantom completion checks',()=>{
 const foreign={id:77,kind:'knot',palIndex:3,x1:1.5,y1:.5};
 const h=harness({stitches:[stitch(1)],completed:[1,77],specialsByCell:new Map([[0,[foreign]],[1,[foreign]]])});
 h.api.draw();assert.equal(h.strokes(),2,'One normal tick in cell 0, one ornament tick in cell 1');
 assert.equal(h.paths().length,2);
 assert.deepEqual(Array.from(h.paths()[0].map(p=>Array.from(p))),[[.15,.56],[.42,.8],[.88,.2]],
   'Neighbouring ornament must not incorrectly shrink the original mark in cell 0');
});
test('Progress state is untouched by the rendering pass',()=>{
 const h=harness({stitches:[stitch(1),stitch(2,'half')],completed:[1]});
 const original=[...h.state.completed];
 h.api.draw();h.state.pendingOnly=true;h.api.draw();h.state.pendingOnly=false;h.api.draw();
 assert.deepEqual([...h.state.completed],original);
});

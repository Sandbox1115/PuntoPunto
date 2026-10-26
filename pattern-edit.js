/* PuntoPunto v0.6 — edit layer for individual stitches.
   Keeps imported OXS intact in memory; only affected grid cells are patched on export.
   Backstitch lines are deliberately preserved, not silently discarded. */
(() => {
  'use strict';
  const editKinds = new Set(['full','halfForward','halfBack','quarterNW','quarterNE','quarterSW','quarterSE','tentForward','tentBack','knot','bead']);
  const editableOrnaments = new Set(['quarter','tent','knot','bead','verticalhalf','horizontalhalf','fullcross']);
  const $ = id => document.getElementById(id);
  const keyOf = (x,y) => x+','+y;
  const validPatch = p => p && (p.kind==='erase'||(editKinds.has(p.kind)&&Number.isInteger(p.palIndex)&&p.palIndex>0));
  const coordOf = s => s.kind==='back' ? null : s.x!==undefined ? [s.x,s.y] : [Math.floor(s.x1),Math.floor(s.y1)];
  const editable = s => ['full','part','half'].includes(s.kind)||editableOrnaments.has(s.kind);
  const stitchKey = s => {
    const c=coordOf(s);
    if(s.kind==='back')return `back:${s.x1},${s.y1},${s.x2},${s.y2}:${s.palIndex}`;
    return `${s.kind}:${c?.join(',')}:${s.palIndex}:${s.direction||0}:${s.side||0}:${s.x1??''}:${s.y1??''}`;
  };
  function create({state,refresh,queueSave,notify}){
    const patches=new Map(),history=[];
    let source=[],cache=new Map();
    function keyPatch(x,y){return patches.get(keyOf(x,y));}
    function createStitch(x,y,p){
      const palIndex=p.palIndex;
      if(p.kind==='full')return {kind:'full',x,y,palIndex,marked:false};
      if(p.kind==='halfForward'||p.kind==='halfBack')return {kind:'half',x,y,palIndex,direction:p.kind==='halfForward'?3:4,marked:false};
      if(p.kind.startsWith('quarter')){
        const code=p.kind.slice(-2);
        return {kind:'quarter',x1:x+(code.endsWith('W')?.25:.75),y1:y+(code.startsWith('N')?.25:.75),palIndex,direction:1,marked:false};
      }
      if(p.kind.startsWith('tent'))return {kind:'tent',x1:x+.1,y1:y+.1,palIndex,direction:p.kind==='tentForward'?1:2,marked:false};
      if(p.kind==='knot'||p.kind==='bead')return {kind:p.kind,x1:x+.5,y1:y+.5,palIndex,direction:1,marked:false};
      throw new Error('Tipo di punto non riconosciuto');
    }
    function rebuild(){
      const pat=state.pattern;if(!pat)return;
      const completedObjects=new Set(pat.stitches.filter(s=>state.completed.has(s.id)));
      const now=source.filter(s=>{
        const c=coordOf(s);return !c||!editable(s)||!patches.has(keyOf(...c));
      });
      for(const [key,p] of patches){
        if(p.kind==='erase')continue;
        const [x,y]=key.split(',').map(Number);
        const old=cache.get(key);
        if(old && old.label===JSON.stringify(p)){now.push(old.stitch);continue;}
        const stitch=createStitch(x,y,p);
        cache.set(key,{label:JSON.stringify(p),stitch});now.push(stitch);
      }
      const byCell=new Map(),linear=[],ornaments=[];
      pat.stitches=now;
      state.completed.clear();
      now.forEach((s,id)=>{
        s.id=id;
        if(completedObjects.has(s))state.completed.add(id);
        if(s.kind==='back')linear.push(s);
        else if(['knot','bead','quarter','tent','verticalhalf','horizontalhalf','fullcross'].includes(s.kind))ornaments.push(s);
        else {
          const c=coordOf(s),key=c[1]*10000+c[0];
          if(!byCell.has(key))byCell.set(key,[]);
          byCell.get(key).push(s);
        }
      });
      pat.byCell=byCell;pat.linear=linear;pat.ornaments=ornaments;
    }
    function load(stored){
      patches.clear();history.length=0;cache=new Map();
      source=state.pattern ? state.pattern.stitches.slice():[];
      const saved=Array.isArray(stored?.edits)?stored.edits:[];
      for(const entry of saved){
        if(!Array.isArray(entry)||entry.length!==3)continue;
        const [x,y,p]=entry;
        if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=state.pattern.width||y>=state.pattern.height||!validPatch(p))continue;
        if(p.kind!=='erase'&&!state.pattern.palette.has(p.palIndex))continue;
        patches.set(keyOf(x,y),p);
      }
      if(patches.size)rebuild();
      setupPalette();
      $('editUndo').disabled=true;
      $('editChangeCount').textContent=patches.size?'Caselle modificate: '+patches.size:'Nessuna modifica allo schema';
    }
    function setupPalette(){
      const sel=$('editColor');sel.replaceChildren();
      const colors=[...state.pattern.palette.values()].filter(c=>!c.isCloth&&c.index>0).sort((a,b)=>a.index-b.index);
      for(const c of colors){const opt=document.createElement('option');opt.value=String(c.index);opt.textContent=c.number+' — '+c.name;sel.appendChild(opt);}
      if(colors.length)sel.value=String(colors[0].index);
      state.editColor=Number(sel.value)||0;
      state.editKind=$('editKind').value;
    }
    function changed(){
      $('editChangeCount').textContent='Caselle modificate: '+patches.size;
      $('editUndo').disabled=!history.length;
      queueSave();refresh();
    }
    function put(x,y,action){
      const pat=state.pattern;if(!pat||!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=pat.width||y>=pat.height)return false;
      const key=keyOf(x,y);
      const prev=patches.has(key)?structuredClone(patches.get(key)):undefined;
      const completedBefore=state.pattern.stitches.filter(s=>{const c=coordOf(s);return c&&keyOf(...c)===key&&state.completed.has(s.id);}).map(stitchKey);
      let next;
      if(action==='erase')next={kind:'erase'};
      else if(action==='restore')next=undefined;
      else {
        const palIndex=Number($('editColor').value),kind=$('editKind').value;
        if(!pat.palette.has(palIndex)||palIndex===0||!editKinds.has(kind))return false;
        next={kind,palIndex};
      }
      if(JSON.stringify(prev)===JSON.stringify(next))return false;
      history.push({key,prev,completedBefore});if(history.length>200)history.shift();
      if(next===undefined)patches.delete(key);else patches.set(key,next);
      cache.delete(key);rebuild();changed();
      return true;
    }
    function at(g,action,drag){
      const x=Math.floor(g.x),y=Math.floor(g.y);
      const key=keyOf(x,y);
      if(drag.seen.has(key))return;
      drag.seen.add(key);
      put(x,y,action);
    }
    function undo(){
      const entry=history.pop();if(!entry)return;
      if(entry.prev===undefined)patches.delete(entry.key);else patches.set(entry.key,entry.prev);
      cache.delete(entry.key);rebuild();
      const previous=new Set(entry.completedBefore);
      for(const s of state.pattern.stitches){const c=coordOf(s);if(c&&keyOf(...c)===entry.key&&previous.has(stitchKey(s)))state.completed.add(s.id);}
      changed();notify('Ultima modifica annullata.');
    }
    function exportOXS(base){
      if(!patches.size)return base;
      const xml=new DOMParser().parseFromString(base,'application/xml');
      if(xml.querySelector('parsererror'))throw new Error('Sorgente OXS non valida.');
      const root=xml.documentElement;
      function sect(name){let n=root.getElementsByTagName(name)[0];if(!n){n=xml.createElement(name);root.appendChild(n);}return n;}
      const full=sect('fullstitches'),parts=sect('partstitches'),orn=sect('ornaments_inc_knots_and_beads');
      for(const [parent,tag] of [[full,'stitch'],[parts,'partstitch'],[orn,'object']]){
        for(const node of Array.from(parent.getElementsByTagName(tag))){
          const kind=tag==='object'?(node.getAttribute('objecttype')||'').toLowerCase():'full';
          if(tag==='object' && !editableOrnaments.has(kind) && !/^bead\d+mm$/.test(kind))continue;
          const x=tag==='object'?Math.floor(Number(node.getAttribute('x1'))):Number(node.getAttribute('x'));
          const y=tag==='object'?Math.floor(Number(node.getAttribute('y1'))):Number(node.getAttribute('y'));
          if(patches.has(keyOf(x,y)))node.remove();
        }
      }
      function add(parent,tag,attrs){const n=xml.createElement(tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));parent.appendChild(n);}
      for(const [key,p]of patches){
        if(p.kind==='erase')continue;
        const [x,y]=key.split(',').map(Number),color=p.palIndex;
        if(p.kind==='full')add(full,'stitch',{x,y,palindex:color});
        else if(p.kind==='halfForward'||p.kind==='halfBack')add(parts,'partstitch',{x,y,palindex1:color,palindex2:0,direction:p.kind==='halfForward'?3:4});
        else if(p.kind.startsWith('quarter')){
          const code=p.kind.slice(-2);
          add(orn,'object',{objecttype:'quarter',x1:x+(code.endsWith('W')?.25:.75),y1:y+(code.startsWith('N')?.25:.75),palindex:color,direction:1});
        }else if(p.kind.startsWith('tent'))add(orn,'object',{objecttype:'tent',x1:x+.1,y1:y+.1,palindex:color,direction:p.kind==='tentForward'?1:2});
        else add(orn,'object',{objecttype:p.kind,x1:x+.5,y1:y+.5,palindex:color,direction:1});
      }
      return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(root);
    }
    $('editColor').addEventListener('change',()=>{state.editColor=Number($('editColor').value);});
    $('editKind').addEventListener('change',()=>{state.editKind=$('editKind').value;});
    $('editUndo').addEventListener('click',undo);
    return {load,put,at,undo,exportOXS,serialize:()=>[...patches].map(([key,p])=>[...key.split(',').map(Number),p]),stitchKey};
  }
  window.PuntoPuntoPatternEdits={create,stitchKey};
})();

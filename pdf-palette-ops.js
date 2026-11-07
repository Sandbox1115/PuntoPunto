/* PuntoPunto PDF bulk palette actions.
   All operations return NEW validated data; callers decide when to commit/save.
   No changes to the OXS or JSON project format. */
(() => {
  'use strict';
  const codeKey=code=>String(code||'').trim().toLowerCase();
  const copy=data=>({cols:data.cols,rows:data.rows,palette:data.palette.map(p=>({...p})),cells:data.cells.map(([i,p])=>[i,{...p}]),empty:[...data.empty],completed:[...data.completed]});
  function checked(data){
    const codec=window.PuntoPuntoPDFCodec;
    if(!codec)throw Error('Motore PDF non disponibile.');
    const parsed=codec.normalize(data);
    return {cols:parsed.cols,rows:parsed.rows,palette:parsed.palette,cells:[...parsed.cells],empty:[...parsed.empty],completed:[...parsed.completed]};
  }
  const find=(palette,code)=>palette.find(item=>codeKey(item.code)===codeKey(code));
  function counts(data,code){return data.cells.filter(([,p])=>codeKey(p.code)===codeKey(code)).length;}
  function fillWhite(data){
    const next=copy(checked(data));
    const used=new Set(next.cells.map(([i])=>i));
    const unknown=next.cols*next.rows-used.size-next.empty.length;
    const previouslyEmpty=next.empty.length;
    if(!unknown&&!previouslyEmpty)return {data:next,changed:0,unknown,empty:previouslyEmpty,code:null};
    let white=find(next.palette,'B5200');
    if(white&&(white.brand!=='DMC'||white.color.toLowerCase()!=='#ffffff'))white=null;
    if(!white){
      if(next.palette.some(p=>codeKey(p.code)==='b5200')){
        let n=0,code='PP-WHITE';
        while(find(next.palette,code))code='PP-WHITE-'+(++n);
        white={code,color:'#ffffff',name:'White',brand:'Personalizzato'};
      }else white={code:'B5200',color:'#ffffff',name:'Snow White',brand:'DMC'};
      if(next.palette.length>=100)throw Error('Legenda completa (massimo 100 filati).');
      next.palette.push(white);
    }
    for(let i=0;i<next.cols*next.rows;i++)if(!used.has(i))next.cells.push([i,{code:white.code,kind:'full'}]);
    // A square confirmed empty becomes a white stitch, not a confirmed blank.
    next.empty=[];
    const newlyAssigned=new Set(next.cells.filter(([i,p])=>codeKey(p.code)===codeKey(white.code)&&!used.has(i)).map(([i])=>i));
    next.completed=next.completed.filter(i=>!newlyAssigned.has(i));
    const result=checked(next);
    return {data:result,changed:unknown+previouslyEmpty,unknown,empty:previouslyEmpty,code:white.code};
  }
  function replaceThread(data,source,target){
    const next=copy(checked(data));
    const old=find(next.palette,source);
    if(!old)throw Error('Il filato originale non esiste.');
    const replacement=find(next.palette,target);
    if(!replacement)throw Error('Aggiungi prima il filato sostitutivo alla legenda.');
    if(codeKey(old.code)===codeKey(replacement.code))throw Error('Seleziona un filato differente.');
    let affected=0;
    for(const [,point] of next.cells)if(codeKey(point.code)===codeKey(old.code)){point.code=replacement.code;affected++;}
    next.palette=next.palette.filter(p=>p!==old);
    return {data:checked(next),affected,old:old.code,target:replacement.code};
  }
  function removeThread(data,source){
    const next=copy(checked(data));
    const old=find(next.palette,source);
    if(!old)throw Error('Filato non trovato.');
    const removed=new Set(next.cells.filter(([,p])=>codeKey(p.code)===codeKey(old.code)).map(([i])=>i));
    next.cells=next.cells.filter(([,p])=>codeKey(p.code)!==codeKey(old.code));
    next.completed=next.completed.filter(i=>!removed.has(i));
    next.palette=next.palette.filter(p=>p!==old);
    return {data:checked(next),affected:removed.size,code:old.code};
  }
  window.PuntoPuntoPDFPaletteOps={fillWhite,replaceThread,removeThread,counts};
})();

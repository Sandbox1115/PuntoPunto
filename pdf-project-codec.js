/* PuntoPunto v0.9.2. Deterministic OXS writer + independent XML round-trip verification.
   This module never inspects the source PDF; it verifies only data confirmed in the editor. */
(() => {
  'use strict';
  const KINDS = new Set(['full','halfForward','halfBack','quarterNW','quarterNE','quarterSW','quarterSE','tentForward','tentBack','knot','bead']);
  const safe = n => Number.isInteger(n) && n >= 0;
  const xmlSafe = s => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  const escape = s => xmlSafe(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function normalize(data) {
    const {cols,rows}=data||{};
    if(!safe(cols)||!safe(rows)||cols<1||rows<1||cols>600||rows>600||cols*rows>100000)throw Error('Dimensioni del progetto non valide.');
    if(!Array.isArray(data.palette)||data.palette.length>100)throw Error('La legenda non è valida.');
    const colors=new Map();
    for(const item of data.palette){
      if(!item||typeof item.code!=='string'||!item.code.trim()||item.code.length>40||!/^#[a-f\d]{6}$/i.test(item.color))throw Error('Filato non valido nella legenda.');
      const code=item.code.trim();if(colors.has(code.toLowerCase()))throw Error('Codice filato duplicato: '+code);
      const brand=item.brand==='DMC'?'DMC':'Personalizzato';
      const name=(typeof item.name==='string'?item.name:'').trim();if(name.length>100)throw Error('Descrizione filato troppo lunga.');
      colors.set(code.toLowerCase(),{code,color:item.color.toLowerCase(),brand,name});
    }
    if(!Array.isArray(data.cells)||!Array.isArray(data.empty)||!Array.isArray(data.completed))throw Error('Dati delle caselle mancanti.');
    const cells=new Map(),empty=new Set(),completed=new Set();
    const total=cols*rows;
    for(const pair of data.cells){
      if(!Array.isArray(pair)||pair.length!==2||!safe(pair[0])||pair[0]>=total||!pair[1]||typeof pair[1]!=='object')throw Error('Punto fuori griglia.');
      const [index,point]=pair;
      if(cells.has(index))throw Error('Punto duplicato in una casella.');
      if(!KINDS.has(point.kind)||typeof point.code!=='string'||!colors.has(point.code.toLowerCase()))throw Error('Tipo di punto o filato non valido.');
      cells.set(index,{kind:point.kind,code:colors.get(point.code.toLowerCase()).code});
    }
    for(const index of data.empty){if(!safe(index)||index>=total||empty.has(index)||cells.has(index))throw Error('Caselle vuote non valide.');empty.add(index);}
    for(const index of data.completed){if(!safe(index)||index>=total||completed.has(index))throw Error('Avanzamento non valido.');completed.add(index);}
    const unresolved=total-cells.size-empty.size;
    return {cols,rows,total,cells,empty,completed,palette:[...colors.values()],unresolved};
  }
  function write(data, title='Schema PuntoPunto') {
    const model=normalize(data);
    if(model.unresolved!==0)throw Error('La digitalizzazione non è completa: '+model.unresolved+' caselle ancora da definire.');
    const items=['<palette_item index="0" number="Tessuto" name="Tela" color="FFFFFF"/>'];
    const paletteIndex=new Map();model.palette.forEach((p,i)=>{const idx=i+1;paletteIndex.set(p.code,idx);items.push(`<palette_item index="${idx}" number="${escape(p.code)}" name="${escape((p.brand==='DMC'?'DMC':'Personalizzato')+(p.name?' · '+p.name:''))}" color="${p.color.slice(1).toUpperCase()}"/>`);});
    const full=[],parts=[],orn=[];
    for(const [index,p] of [...model.cells].sort((a,b)=>a[0]-b[0])){
      const x=index%model.cols,y=Math.floor(index/model.cols),color=paletteIndex.get(p.code);
      if(p.kind==='full')full.push(`<stitch x="${x}" y="${y}" palindex="${color}"/>`);
      else if(p.kind==='halfForward'||p.kind==='halfBack')parts.push(`<partstitch x="${x}" y="${y}" palindex1="${color}" palindex2="0" direction="${p.kind==='halfForward'?3:4}"/>`);
      else {
        let xx=x+.5,yy=y+.5,kind=p.kind,direction=1;
        if(p.kind.startsWith('quarter')){const side=p.kind.slice(-2);xx=x+(side.endsWith('W')?.25:.75);yy=y+(side.startsWith('N')?.25:.75);kind='quarter';}
        if(p.kind.startsWith('tent')){xx=x+.1;yy=y+.1;kind='tent';direction=p.kind==='tentForward'?1:2;}
        orn.push(`<object objecttype="${kind}" x1="${xx}" y1="${yy}" palindex="${color}" direction="${direction}"/>`);
      }
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n<chart>\n<properties charttitle="${escape(title||'Schema PuntoPunto')}" author="PuntoPunto" chartwidth="${model.cols}" chartheight="${model.rows}" stitchesperinch="14" palettecount="${model.palette.length+1}"/>\n<palette>${items.join('')}</palette>\n<fullstitches>${full.join('')}</fullstitches>\n<partstitches>${parts.join('')}</partstitches>\n<backstitches/>\n<ornaments_inc_knots_and_beads>${orn.join('')}</ornaments_inc_knots_and_beads>\n</chart>`;
  }
  // Independent XML reader for the exact OXS subset produced by this writer.
  function verify(xmlText, original) {
    const model=normalize(original);
    if(model.unresolved)throw Error('Non è possibile certificare una digitalizzazione incompleta.');
    const dom=new DOMParser().parseFromString(xmlText,'application/xml');
    if(dom.querySelector('parsererror')||dom.documentElement.nodeName!=='chart')throw Error('OXS XML malformato.');
    const root=dom.documentElement,props=root.querySelector('properties');
    if(Number(props?.getAttribute('chartwidth'))!==model.cols||Number(props?.getAttribute('chartheight'))!==model.rows)throw Error('Le dimensioni OXS non coincidono.');
    const palette=new Map();
    for(const entry of root.querySelectorAll('palette > palette_item')){
      const index=Number(entry.getAttribute('index'));
      if(!Number.isInteger(index)||palette.has(index))throw Error('Indici duplicati nella legenda OXS.');
      palette.set(index,{code:entry.getAttribute('number'),color:'#'+entry.getAttribute('color')?.toLowerCase(),name:entry.getAttribute('name')});
    }
    if(palette.size!==model.palette.length+1)throw Error('Numero dei filati OXS differente.');
    const sourceColors=new Map(model.palette.map(c=>[c.code,c]));
    for(const [i,p] of palette)if(i>0){const reference=sourceColors.get(p.code);
      if(!reference||reference.color!==p.color)throw Error('Codice o colore del filato non conservato: '+p.code);
      const expected=(reference.brand==='DMC'?'DMC':'Personalizzato')+(reference.name?' · '+reference.name:'');
      if(p.name!==expected)throw Error('Descrizione del filato non conservata: '+p.code);
    }
    const recovered=new Map(),total=model.total;
    function add(x,y,kind,pal){
      if(!safe(x)||!safe(y)||x>=model.cols||y>=model.rows)throw Error('Punto esportato fuori griglia.');
      if(!palette.has(pal)||pal===0)throw Error('Punto esportato con filato sconosciuto.');
      const i=y*model.cols+x;if(recovered.has(i))throw Error('Due punti occupano la stessa casella.');
      recovered.set(i,{kind,code:palette.get(pal).code});
    }
    for(const node of root.querySelectorAll('fullstitches > stitch'))add(Number(node.getAttribute('x')),Number(node.getAttribute('y')),'full',Number(node.getAttribute('palindex')));
    for(const node of root.querySelectorAll('partstitches > partstitch')){
      const d=Number(node.getAttribute('direction'));if(d!==3&&d!==4)throw Error('Tipo di mezzo punto inatteso.');
      add(Number(node.getAttribute('x')),Number(node.getAttribute('y')),d===3?'halfForward':'halfBack',Number(node.getAttribute('palindex1')));
    }
    for(const node of root.querySelectorAll('ornaments_inc_knots_and_beads > object')){
      const x=Number(node.getAttribute('x1')),y=Number(node.getAttribute('y1'));
      let kind=node.getAttribute('objecttype');
      if(kind==='quarter'){kind='quarter'+(y%1<.5?'N':'S')+(x%1<.5?'W':'E');}
      else if(kind==='tent')kind=Number(node.getAttribute('direction'))===1?'tentForward':'tentBack';
      add(Math.floor(x),Math.floor(y),kind,Number(node.getAttribute('palindex')));
    }
    if(root.querySelectorAll('backstitches > backstitch').length)throw Error('Sono comparsi backstitch non previsti.');
    if(recovered.size!==model.cells.size)throw Error('Numero di punti OXS diverso dal progetto.');
    for(const [i,p] of model.cells){const q=recovered.get(i);if(!q||q.kind!==p.kind||q.code!==p.code)throw Error('Punto OXS differente alla casella '+(i+1));}
    return {ok:true,stitches:recovered.size,palette:model.palette.length,empty:model.empty.size,cols:model.cols,rows:model.rows};
  }
  function checksum(bytes){
    if(!bytes||!Number.isInteger(bytes.length))throw Error('Contenuto PDF non valido.');
    let h=2166136261;for(let i=0;i<bytes.length;i++)h=Math.imul(h^bytes[i],16777619);
    return 'fnv32-'+(h>>>0).toString(16).padStart(8,'0')+'-'+bytes.length;
  }
  window.PuntoPuntoPDFCodec={normalize,write,verify,checksum,KINDS};
})();

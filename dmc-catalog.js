/* PuntoPunto v0.9.2 – DMC palette loader.
 * Source: craft-color-codes by MakeBead, data licensed CC BY 4.0.
 * https://github.com/makebead/craft-color-codes
 * Data is independently maintained; this is NOT an official DMC chart.
 */
(() => {
  'use strict';
  const KEY='pp-dmc-craft-color-codes-v1';
  const SOURCES=['data/dmc-floss.json'];
  const EXPECTED_SHA256='dd173705a0b871219915e6b73328fa8eebb752b699b99474879751d8a70b574a';
  let list=null, pending=null;
  const validHex=s=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);
  function parse(raw){
    if(raw?.id!=='dmc-floss'||raw.license!=='CC-BY-4.0'||!Array.isArray(raw.colors)||raw.colors.length<480)throw Error('Catalogo DMC incompleto o inatteso.');
    const items=[],seen=new Set();
    for(const item of raw.colors){
      if(!item||typeof item.code!=='string'||!/^(\d{1,4}|B5200|BLANC|ECRU|\d{2})$/i.test(item.code)||!validHex(item.hex)||seen.has(item.code.toUpperCase()))throw Error('Catalogo DMC con codici non validi.');
      if(typeof item.name!=='string'||!item.name||item.name.length>100)throw Error('Catalogo DMC con descrizioni non valide.');
      seen.add(item.code.toUpperCase());items.push(Object.freeze({code:item.code,name:item.name,hex:item.hex.toUpperCase()}));
    }
    if(items.length!==489)throw Error('Il catalogo non contiene i 489 filati attesi.');
    return Object.freeze(items);
  }
  async function fetchOne(url){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
    try{
      // Revalidate on new releases instead of retaining a stale force-cached 404 or JSON.
      const res=await fetch(url,{mode:'same-origin',signal:controller.signal,cache:'no-cache'});
      if(!res.ok)throw Error('HTTP '+res.status);
      const raw=await res.text();
      if(window.crypto?.subtle){
        const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));
        const value=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
        if(value!==EXPECTED_SHA256)throw Error('Impronta SHA-256 del catalogo DMC non corrispondente.');
      }
      const json=JSON.parse(raw),items=parse(json);
      try{localStorage.setItem(KEY,JSON.stringify(json));}catch{}
      return items;
    }finally{clearTimeout(timeout);}
  }
  async function load(){
    if(list)return list;
    if(pending)return pending;
    pending=(async()=>{
      // Prefer the versioned local source to avoid stale browser cache values.
      try{list=await fetchOne(SOURCES[0]);return list;}catch(e){console.warn('Catalogo DMC locale non disponibile',e.message);}
      try{const cached=localStorage.getItem(KEY);if(cached){list=parse(JSON.parse(cached));return list;}}catch{}
      throw Error('Catalogo DMC non disponibile. Installa il file locale data/dmc-floss.json oppure usa un filato personalizzato.');
    })();
    try{return await pending;}finally{pending=null;}
  }
  function search(query,max=16){
    if(!list)return[];
    const q=String(query||'').trim().toLowerCase().replace(/^dmc\s*[:#-]?\s*/, '');
    if(!q)return list.slice(0,max);
    return list.filter(p=>p.code.toLowerCase()===q||p.code.toLowerCase().startsWith(q)||p.name.toLowerCase().includes(q)).sort((a,b)=>Number(b.code.toLowerCase()===q)-Number(a.code.toLowerCase()===q)||Number(b.code.toLowerCase().startsWith(q))-Number(a.code.toLowerCase().startsWith(q))||a.code.localeCompare(b.code,'en',{numeric:true})).slice(0,max);
  }
  const get=code=>list?.find(p=>p.code.toUpperCase()===String(code).trim().toUpperCase())||null;
  window.PuntoPuntoDMC=Object.freeze({load,search,get,get count(){return list?.length||0;},source:SOURCES[0],credit:'craft-color-codes di MakeBead · CC BY 4.0'});
})();

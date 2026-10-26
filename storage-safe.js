/* PuntoPunto 0.9.5 — checksum-verified atomic snapshots and one backup. */
(() => {
  'use strict';
  const prefix='pp-snapshot-v1:';
  function digest(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');}
  function encode(value){const payload=JSON.stringify(value);return JSON.stringify({type:'PuntoPunto-Snapshot',version:1,hash:digest(payload),payload,created:new Date().toISOString()});}
  function decode(value){if(!value)return null;const data=JSON.parse(value);if(data.type!=='PuntoPunto-Snapshot'||data.version!==1||typeof data.payload!=='string'||digest(data.payload)!==data.hash)throw Error('Checksum del salvataggio non valido.');return JSON.parse(data.payload);}
  function write(name,payload){const key=prefix+name,record=encode(payload);try{
    const previous=localStorage.getItem(key);
    // A failed backup must not block a new save; the primary is set atomically.
    if(previous){try{decode(previous);localStorage.setItem(key+':backup',previous);}catch(e){console.warn('Backup non aggiornato',e);}}
    localStorage.setItem(key,record);
    // Check that the whole committed record can be decoded and matches.
    decode(localStorage.getItem(key));
    return {ok:true};
  }catch(e){return {ok:false,error:e?.name==='QuotaExceededError'?'Spazio di archiviazione esaurito.':(e?.message||'Memoria locale non disponibile.')}}}
  function read(name){const key=prefix+name;let damaged=false;for(const suffix of ['',':backup']){
    try{const raw=localStorage.getItem(key+suffix);if(raw){const value=decode(raw);return {found:true,value,recovered:suffix!=='' ,damaged};}}
    catch(e){damaged=true;console.warn('Salvataggio non leggibile',name,suffix,e);}
  }return {found:false,value:null,recovered:false,damaged};}
  window.PuntoPuntoStorage=Object.freeze({write,read});
})();

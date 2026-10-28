/* PuntoPunto 0.9.8 — durable PDF project storage (IndexedDB v2).
 * Atomic writes, SHA-256 integrity, previous-valid snapshot, version 0.9.x read fallback.
 * All PDFs and progress remain on this device. No network requests.
 */
(() => {
  'use strict';
  const DB='PuntoPunto', VERSION=2, PROGRESS='pdfProgress', DOCUMENTS='pdfDocuments';
  const textEncoder=new TextEncoder();
  const queues=new Map();
  function dbOpen(){return new Promise((resolve,reject)=>{
    if(!window.indexedDB){reject(Error('IndexedDB non disponibile'));return;}
    let request;try{request=indexedDB.open(DB,VERSION);}catch(e){reject(e);return;}
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains('projects'))db.createObjectStore('projects',{keyPath:'id'});
      if(!db.objectStoreNames.contains(PROGRESS))db.createObjectStore(PROGRESS,{keyPath:'key'});
      if(!db.objectStoreNames.contains(DOCUMENTS))db.createObjectStore(DOCUMENTS,{keyPath:'hash'});
    };
    request.onblocked=()=>reject(Error('Database occupato da un’altra scheda di PuntoPunto. Chiudila e riprova.'));
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};
    request.onerror=()=>reject(request.error||Error('Apertura database non riuscita'));
  });}
  async function hashText(text){
    if(!window.crypto?.subtle)throw Error('Verifica crittografica non disponibile: apri il sito tramite HTTPS o localhost.');
    const sum=await crypto.subtle.digest('SHA-256',textEncoder.encode(text));
    return Array.from(new Uint8Array(sum),b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function encode(value){const payload=JSON.stringify(value);return {payload,hash:await hashText(payload),savedAt:new Date().toISOString()};}
  async function decode(record){if(!record||typeof record.payload!=='string'||typeof record.hash!=='string')throw Error('Snapshot assente o danneggiato');if(await hashText(record.payload)!==record.hash)throw Error('Checksum del progetto non valido');return JSON.parse(record.payload);}
  async function read(store,key){const db=await dbOpen();return new Promise((resolve,reject)=>{
    let result=null;const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).get(key);
    r.onsuccess=()=>{result=r.result||null;};
    tx.oncomplete=()=>{db.close();resolve(result);};
    tx.onerror=()=>{const err=tx.error;db.close();reject(err||Error('Lettura IndexedDB non riuscita'));};
    tx.onabort=()=>{const err=tx.error;db.close();reject(err||Error('Lettura IndexedDB annullata'));};
  });}
  async function write(store,key,value){const db=await dbOpen();return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{const error=tx.error;db.close();reject(error||Error('Scrittura IndexedDB non riuscita'));};
    tx.onabort=()=>{const error=tx.error;db.close();reject(error||Error('Salvataggio annullato'));};
  });}
  function serialized(key,task){const prior=queues.get(key)||Promise.resolve();const next=prior.catch(()=>{}).then(task);queues.set(key,next);next.finally(()=>{if(queues.get(key)===next)queues.delete(key);}).catch(()=>{});return next;}
  async function writeProgress(key,value,validate){return serialized('progress:'+key,async()=>{
    if(typeof validate==='function'&&!validate(value))throw Error('Dati da salvare non coerenti con il progetto.');
    const current=await read(PROGRESS,key);
    const previous=await encode(value);
    // Keep the last *semantically valid* snapshot, even if the latest primary
    // has a valid checksum but an invalid model. Never replace a good backup.
    let backup=null;
    for(const candidate of [current?.current,current?.backup]){
      if(!candidate)continue;
      try{
        const model=await decode(candidate);
        if(typeof validate==='function'&&!validate(model))throw Error('Snapshot precedente incompatibile.');
        backup=candidate;break;
      }catch(e){console.warn('Copia precedente esclusa dal backup',e);}
    }
    await write(PROGRESS,key,{key,current:previous,backup});
    const verified=await read(PROGRESS,key);
    const model=await decode(verified?.current);
    if(typeof validate==='function'&&!validate(model))throw Error('Verifica post-scrittura del progetto non riuscita.');
    return {ok:true,storage:'indexedDB'};
  });}
  async function readProgress(key,validate){
    // Read-your-writes: a quick close/reopen must not overtake a pending save.
    await queues.get('progress:'+key)?.catch(()=>{});
    const record=await read(PROGRESS,key);if(!record)return {found:false};
    let damaged=false;
    for(const [entry,recovered] of [[record.current,false],[record.backup,true]]){
      try{if(entry){const value=await decode(entry);if(typeof validate==='function'&&!validate(value))throw Error('Dati del progetto non coerenti.');return {found:true,value,recovered,damaged,savedAt:entry.savedAt||null};}}
      catch(e){damaged=true;console.warn('Copia del progetto danneggiata',e);}
    }
    return {found:false,damaged};
  }
  function bytesToBuffer(bytes){return bytes instanceof ArrayBuffer?bytes.slice(0):bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);}
  async function rememberPDF(source,bytes){
    if(!source?.hash||!source?.name||!bytes?.byteLength)throw Error('PDF o identificativo non valido');
    const buffer=bytesToBuffer(bytes);
    if(!crypto?.subtle)throw Error('SHA-256 indisponibile: serve HTTPS o localhost.');
    const checksum=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');
    const record={hash:source.hash,name:source.name,source,buffer,byteLength:buffer.byteLength,checksum,storedAt:new Date().toISOString()};
    return serialized('pdf:'+source.hash,async()=>{
      const db=await dbOpen();return new Promise((resolve,reject)=>{
        const tx=db.transaction(DOCUMENTS,'readwrite'),store=tx.objectStore(DOCUMENTS);
        const recent=store.get('__recent');
        recent.onsuccess=()=>{
          const earlier=recent.result||null;
          const previous=earlier?.reference===source.hash?(earlier.previous||null):(earlier?.reference||null);
          store.put(record);
          store.put({hash:'__recent',reference:source.hash,previous,storedAt:record.storedAt});
        };
        tx.oncomplete=()=>{db.close();resolve({ok:true});};
        tx.onerror=()=>{const e=tx.error;db.close();reject(e||Error('Archiviazione PDF fallita'));};
        tx.onabort=()=>{const e=tx.error;db.close();reject(e||Error('Archiviazione PDF annullata'));};
      });
    });
  }
  async function getRecentPDF(){
    const recent=await read(DOCUMENTS,'__recent');if(!recent?.reference)return null;
    if(!crypto?.subtle)throw Error('SHA-256 indisponibile: serve HTTPS o localhost.');
    let lastError=null;
    for(const [reference,recovered] of [[recent.reference,false],[recent.previous,true]]){
      if(!reference)continue;
      try{
        const record=await read(DOCUMENTS,reference);
        if(!record?.buffer||!record.source||!record.byteLength||record.buffer.byteLength!==record.byteLength)throw Error('PDF salvato incompleto');
        const checksum=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',record.buffer)),b=>b.toString(16).padStart(2,'0')).join('');
        if(checksum!==record.checksum)throw Error('Verifica integrità PDF salvato non superata');
        return {source:record.source,buffer:record.buffer,name:record.name,recovered};
      }catch(e){console.warn('Copia PDF non leggibile',reference,e);lastError=e;}
    }
    throw lastError||Error('Nessun PDF recuperabile nel browser');
  }
  window.PuntoPuntoPDFStore=Object.freeze({writeProgress,readProgress,rememberPDF,getRecentPDF,dbOpen});
})();

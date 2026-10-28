/* PuntoPunto v0.9.8.8.14.1 — PDF.js 6.4.299 bridge.
   Local: embedded, hash-verified payloads and Blob module workers.
   GitHub Pages: fetched and SHA-256 verified module/worker before import.
   No CDN, telemetry, eval, or document upload. */
(() => {
  'use strict';
  const VERSION = '6.4.299';
  const HASHES = {"core":"3ab3d2fee1200547309d5f5e4116066a1ccb6277451b9533aebe618530eb62ca","worker":"07ceb740d746e5d9012fcf9f27d5c7dea09f7d2f5e74f5c8109e5787551a2333"};
  // PDF.js 6.4 uses recently standardized JavaScript methods that may not
  // exist yet in slightly older Chromium/Firefox builds. Scoped, non-eval
  // shims are inserted into both the rendering module and its worker.
  const COMPAT = `
if (!Map.prototype.getOrInsertComputed) {
  Object.defineProperty(Map.prototype,'getOrInsertComputed',{configurable:true,writable:true,
    value:function(key,compute){if(this.has(key))return this.get(key);
      const value=compute(key);this.set(key,value);return value;}});
}
if (!Promise.withResolvers) {
  Object.defineProperty(Promise,'withResolvers',{configurable:true,writable:true,
    value:function(){let resolve,reject;const promise=new this((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}});
}
if (!Promise.try) {
  Object.defineProperty(Promise,'try',{configurable:true,writable:true,
    value:function(fn,...args){return new this((resolve)=>resolve(fn(...args)));}});
}
if (!URL.parse) {URL.parse=function(input,base){try{return new URL(input,base);}catch{return null;}};}
if (!Math.sumPrecise) {Math.sumPrecise=function(iterable){let sum=0,loss=0;
  for(const x of iterable){const y=x-loss;const next=sum+y;loss=(next-sum)-y;sum=next;}return sum;};}
if (!Uint8Array.fromBase64) {Uint8Array.fromBase64=function(s){
  return Uint8Array.from(atob(s),x=>x.charCodeAt(0));};}
`;
  let loadPromise = null;
  function enableEmbeddedFontURLs(resources) {
    if (typeof window.FontFace !== 'function') return;
    const NativeFontFace = window.FontFace;
    const prefix = 'embedded://standard_fonts/';
    const urls = new Map();
    window.FontFace = class extends NativeFontFace {
      constructor(name, source, options) {
        if (typeof source === 'string' && source.includes(prefix)) {
          source = source.replace(/embedded:\/\/standard_fonts\/([A-Za-z0-9_.-]+)/g, (_, file) => {
            if (!resources['standard_fonts/' + file]) return prefix + file;
            let url = urls.get(file);
            if (!url) {
              const content = bytesFromBase64(resources['standard_fonts/' + file]);
              url = URL.createObjectURL(new Blob([content], {type:'font/ttf'}));
              urls.set(file,url);
            }
            return url;
          });
        }
        super(name,source,options);
      }
    };
  }
  let sourceURL = null;
  let workerURL = null;
  let options = {};
  const bytesFromBase64 = input => {
    const s = input.replace(/\s+/g, '');
    const result = new Uint8Array(Math.floor(s.length * 3 / 4));
    let pos = 0;
    for (let i = 0; i < s.length; i += 32768) {
      let part = s.slice(i, i + 32768);
      if (part.length % 4) part += s.slice(i + part.length, i + part.length + (4 - part.length % 4));
      const binary = atob(part);
      for (let j = 0; j < binary.length; j++) result[pos++] = binary.charCodeAt(j);
      i += part.length - Math.min(part.length, 32768);
    }
    return result.subarray(0, pos);
  };
  const hex = data => Array.from(new Uint8Array(data), b => b.toString(16).padStart(2, '0')).join('');
  // SHA-256 without a network dependency for local file:// browsers in which
  // WebCrypto is unavailable. HTTPS uses native WebCrypto.
  function sha256Fallback(data) {
    const bytes = new Uint8Array(data);
    const padded = new Uint8Array((bytes.length + 9 + 63) & ~63);
    padded.set(bytes); padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    const bits = bytes.length * 8;
    view.setUint32(padded.length - 8, Math.floor(bits / 0x100000000), false);
    view.setUint32(padded.length - 4, bits >>> 0, false);
    const h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
               0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const k = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    const rotr = (x,n) => (x >>> n) | (x << (32-n));
    const w = new Uint32Array(64);
    for (let offset = 0; offset < padded.length; offset += 64) {
      for (let j=0; j<16; j++) w[j] = view.getUint32(offset + j*4,false);
      for (let j=16; j<64; j++) {
        const a=w[j-15],b=w[j-2];
        const s0=rotr(a,7)^rotr(a,18)^(a>>>3);
        const s1=rotr(b,17)^rotr(b,19)^(b>>>10);
        w[j]=(w[j-16]+s0+w[j-7]+s1)>>>0;
      }
      let [a,b,c,d,e,f,g,hh] = h;
      for (let j=0; j<64; j++) {
        const s1=rotr(e,6)^rotr(e,11)^rotr(e,25);
        const ch=(e&f)^(~e&g);
        const t1=(hh+s1+ch+k[j]+w[j])>>>0;
        const s0=rotr(a,2)^rotr(a,13)^rotr(a,22);
        const maj=(a&b)^(a&c)^(b&c);
        const t2=(s0+maj)>>>0;
        hh=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
      }
      for (const [i,v] of [a,b,c,d,e,f,g,hh].entries())h[i]=(h[i]+v)>>>0;
    }
    return h.map(n=>n.toString(16).padStart(8,'0')).join('');
  }
  async function verify(bytes, expected, name) {
    const actual = crypto?.subtle
      ? hex(await crypto.subtle.digest('SHA-256', bytes))
      : sha256Fallback(bytes);
    if (actual !== expected) throw Error('SHA-256 non valido per ' + name);
    return bytes;
  }
  function asURL(bytes) { return URL.createObjectURL(new Blob([COMPAT, '\n', bytes], {type:'text/javascript'})); }
  const inline = id => document.getElementById(id)?.textContent?.trim();
  async function fetchVerified(path, sha) {
    const response = await fetch(new URL(path, document.baseURI).href, {cache:'no-store'});
    if (!response.ok) throw Error('Risorsa PDF.js assente: ' + path + ' (' + response.status + ')');
    return verify(await response.arrayBuffer(), sha, path);
  }
  async function instantiate() {
    const embedded = !!inline('pp-pdfjs-core');
    let source, worker, resources;
    if (embedded) {
      source = bytesFromBase64(inline('pp-pdfjs-core'));
      worker = bytesFromBase64(inline('pp-pdfjs-worker'));
      await verify(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength), HASHES.core, 'PDF.js offline');
      await verify(worker.buffer.slice(worker.byteOffset, worker.byteOffset + worker.byteLength), HASHES.worker, 'worker PDF.js offline');
      const resText = inline('pp-pdfjs-resources');
      if (!resText) throw Error('Risorse PDF.js offline mancanti.');
      resources = JSON.parse(resText);
      enableEmbeddedFontURLs(resources);
      class EmbeddedBinaryDataFactory {
        constructor() {}
        async fetch({kind,filename}) {
          const group = ({cMapUrl:'cmaps',standardFontDataUrl:'standard_fonts',wasmUrl:'wasm'})[kind];
          if (!group || !/^[\w.\-]+$/.test(filename)) throw Error('Risorsa PDF.js non valida.');
          const encoded = resources[group + '/' + filename];
          if (!encoded) throw Error('Risorsa PDF.js assente: ' + group + '/' + filename);
          return bytesFromBase64(encoded);
        }
      }
      options = {BinaryDataFactory:EmbeddedBinaryDataFactory,cMapUrl:'embedded://cmaps/',
        cMapPacked:true,standardFontDataUrl:'embedded://standard_fonts/',wasmUrl:'embedded://wasm/',
        useWorkerFetch:false};
    } else {
      if (location.protocol === 'file:') throw Error('Distribuzione locale incompleta: manca PDF.js incorporato.');
      if (!crypto?.subtle) throw Error('Caricamento sicuro PDF.js richiede HTTPS/WebCrypto.');
      [source,worker] = await Promise.all([
        fetchVerified('vendor/pdf.mjs', HASHES.core),
        fetchVerified('vendor/pdf.worker.mjs', HASHES.worker)
      ]);
      const base = new URL('vendor/',document.baseURI);
      options = {cMapUrl:new URL('cmaps/',base).href,cMapPacked:true,
        standardFontDataUrl:new URL('standard_fonts/',base).href,
        wasmUrl:new URL('wasm/',base).href,
        iccUrl:new URL('iccs/',base).href,useWorkerFetch:true};
    }
    sourceURL = asURL(source);
    workerURL = asURL(worker);
    const lib = await import(/* webpackIgnore: true */ sourceURL);
    if (lib.version !== VERSION || typeof lib.getDocument !== 'function' || !lib.GlobalWorkerOptions)
      throw Error('Modulo PDF.js inatteso: richiesta versione ' + VERSION);
    lib.GlobalWorkerOptions.workerSrc = workerURL;
    window.pdfjsLib = lib;
    return lib;
  }
  window.PuntoPuntoPDFJS = Object.freeze({
    version:VERSION,
    load(){return loadPromise ||= instantiate().catch(err=>{loadPromise=null;throw err;});},
    documentOptions(){return {...options};}
  });
})();

/* PuntoPunto 0.9.8.8.21.1 — view-only DMC color names.
 * Original OXS palette descriptions are never altered or exported differently.
 */
(() => {
  'use strict';
  const codeOf=thread=>{
    if(!thread||thread.isCloth)return null;
    const value=String(thread.number??'').trim();
    // Explicit DMC labels and typical OXS DMC numeric labels. Non-numeric
    // custom labels remain unmodified; never infer a thread from its RGB color.
    const match=value.match(/^(?:DMC[\s:#-]*)?(\d{1,4}|B5200|BLANC|ECRU)$/i);
    return match?match[1].toUpperCase():null;
  };
  function display(thread,language,lookup){
    const original=String(thread?.name||'');
    if(language!=='en')return original;
    const code=codeOf(thread);
    const canonical=code&&typeof lookup==='function'?lookup(code):null;
    return canonical?.name||original;
  }
  window.PuntoPuntoFlossNames=Object.freeze({codeOf,display});
})();

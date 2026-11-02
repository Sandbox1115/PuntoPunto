/* PuntoPunto 0.9.8.8.21.1 — physical design size to stitch count.
 * Pure, deterministic conversion. Never reads a PDF or changes saved formats.
 */
(() => {
  'use strict';
  const MAX_SIDE=600, MAX_CELLS=100000;
  const decimal=value=>{
    const s=String(value??'').trim();
    // Accept Italian/English decimal separators, not ambiguous thousands or exponents.
    if(!/^\d+(?:[.,]\d{1,5})?$/.test(s))return NaN;
    return Number(s.replace(',','.'));
  };
  function limits(cols,rows){
    return Number.isSafeInteger(cols)&&Number.isSafeInteger(rows)&&cols>=1&&rows>=1&&
      cols<=MAX_SIDE&&rows<=MAX_SIDE&&cols*rows<=MAX_CELLS;
  }
  function derive(mode,width,height,density){
    if(!['cm','in'].includes(mode))return null;
    const w=decimal(width),h=decimal(height),d=decimal(density);
    if(!Number.isFinite(w)||!Number.isFinite(h)||!Number.isFinite(d)||w<=0||h<=0||d<=0||d>50||w>1000||h>1000)return null;
    const cols=Math.round(w*d),rows=Math.round(h*d);
    return limits(cols,rows)?Object.freeze({cols,rows,unit:mode,physicalWidth:w,physicalHeight:h,density:d,rounded:(w*d!==cols||h*d!==rows)}):null;
  }
  // Convert both the measurements and the count so that changing UI units
  // preserves the SAME stitch grid, barring rounding of displayed decimals.
  function convert(value,from,to,kind){
    const n=decimal(value);
    if(!Number.isFinite(n)||n<=0||from===to)return from===to?n:NaN;
    if(!['cm','in'].includes(from)||!['cm','in'].includes(to)||!['size','density'].includes(kind))return NaN;
    const factor=from==='cm'?2.54:1/2.54;
    return kind==='density'?n*factor:n/factor;
  }
  window.PuntoPuntoGridSize=Object.freeze({decimal,derive,convert,limits,MAX_SIDE,MAX_CELLS});
})();

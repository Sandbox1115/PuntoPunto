/* Display-only Aida cloth and thread rendering. No pattern data is changed. */
(() => {
 'use strict';
 const defaults={cloth:true,threads:true,grid:true,major:true};let settings={...defaults};
 try{const saved=JSON.parse(localStorage.getItem('pp-appearance-v23')||'{}');for(const k of Object.keys(defaults))if(typeof saved[k]==='boolean')settings[k]=saved[k];}catch{}
 const cache=new WeakMap();
 function texture(ctx){if(cache.has(ctx))return cache.get(ctx);const tile=document.createElement('canvas');tile.width=tile.height=64;const t=tile.getContext('2d');t.fillStyle='#fbf3e6';t.fillRect(0,0,64,64);
 for(let i=0;i<64;i+=16){t.fillStyle='#e8d9c4';t.fillRect(i,0,2,64);t.fillRect(0,i,64,2);t.fillStyle='#fffdf5';t.fillRect(i+2,0,3,64);t.fillRect(0,i+2,64,2);}
 for(const x of [1,63])for(const y of [1,63]){t.fillStyle='#bbab94';t.beginPath();t.arc(x,y,2,0,Math.PI*2);t.fill();}
 const p=ctx.createPattern(tile,'repeat');cache.set(ctx,p);return p;}
 function cloth(ctx,x,y,w,h,unit=1){if(!settings.cloth)return;ctx.save();const p=texture(ctx);p.setTransform(new DOMMatrix().scale(unit/64));ctx.fillStyle=p;ctx.fillRect(x,y,w,h);ctx.restore();}
 function stitch(ctx,x,y,w,h,color,kind='full'){
  ctx.save();ctx.translate(x,y);ctx.scale(w,h);ctx.lineCap='round';ctx.lineJoin='round';
  const forward=[.1,.9,.9,.1],back=[.1,.1,.9,.9];
  const lines=kind==='full'?[forward,back]:kind==='halfForward'?[forward]:kind==='halfBack'?[back]:[];
  for(const [a,b,c,d] of lines){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.lineWidth=.38;ctx.strokeStyle='#67453655';ctx.stroke();ctx.lineWidth=.31;ctx.strokeStyle=color;ctx.stroke();ctx.beginPath();ctx.moveTo(a-.025,b-.025);ctx.lineTo(c-.025,d-.025);ctx.lineWidth=.045;ctx.strokeStyle='#ffffff70';ctx.stroke();}
  ctx.restore();return !!lines.length;
 }
 function set(key,value){if(!(key in defaults))return;settings[key]=!!value;try{localStorage.setItem('pp-appearance-v23',JSON.stringify(settings));}catch{}document.dispatchEvent(new CustomEvent('puntopunto:appearancechange'));}
 window.PuntoPuntoFabric=Object.freeze({get settings(){return {...settings}},cloth,stitch,set});
})();

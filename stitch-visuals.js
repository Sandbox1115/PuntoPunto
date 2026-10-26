/* PuntoPunto — pittogrammi dei punti, indipendenti dal colore del filato. */
(function(root){'use strict';
const GLYPHS=Object.freeze({full:'×',part:'◩',quarter:'◢',halfForward:'╱',halfBack:'╲',quarterNW:'◤',quarterNE:'◥',quarterSW:'◣',quarterSE:'◢',tentForward:'╲•',tentBack:'╱•',knot:'●',bead:'◆',back:'━',verticalhalf:'▐',horizontalhalf:'▂',fullcross:'×'});
const NAMES=Object.freeze({full:'Croce intera',part:'Punto parziale',quarter:'Quarto di punto',halfForward:'Mezza croce ╱',halfBack:'Mezza croce ╲',quarterNW:'Quarto ◤ alto a sinistra',quarterNE:'Quarto ◥ alto a destra',quarterSW:'Quarto ◣ basso a sinistra',quarterSE:'Quarto ◢ basso a destra',tentForward:'Punto diagonale ╲•',tentBack:'Punto diagonale ╱•',knot:'Nodo francese',bead:'Perlina',back:'Punto scritto',verticalhalf:'Mezza croce verticale',horizontalhalf:'Mezza croce orizzontale',fullcross:'Croce decorativa'});
function token(s){if(s.kind==='half')return s.direction===3?'halfForward':'halfBack';if(s.kind==='tent')return s.direction===1?'tentForward':'tentBack';if(s.kind==='quarter')return 'quarter';return s.kind;}
function glyph(kind){return GLYPHS[kind]||'•';}
function name(kind){const value=NAMES[kind]||kind;return root.PuntoPuntoI18n?.t(value)||value;}
// Use actual short diagonal segments for geometric accuracy at large zoom.
function draw(c,kind,x,y,w,h){if(['halfForward','halfBack','tentForward','tentBack'].includes(kind)){
 // A single stroke denotes a half cross. Two closely spaced strokes denote a
 // diagonal stitch. Keep the direction unchanged; only the visual differs.
 const uphill=kind==='halfForward'||kind==='tentBack';
 const offsets=kind.startsWith('tent')?[-.08,.08]:[0];
 for(const delta of offsets){
   c.beginPath();
   if(uphill){c.moveTo(x+w*(.20+delta),y+h*(.80+delta));c.lineTo(x+w*(.80+delta),y+h*(.20+delta));}
   else {c.moveTo(x+w*(.20+delta),y+h*(.20-delta));c.lineTo(x+w*(.80+delta),y+h*(.80-delta));}
   c.stroke();
 }
 return;
 }
 // A quarter stitch occupies a specific corner. Draw its half-diagonal from
 // the cell centre towards that corner, plus a pronounced corner marker.
 // Unlike unicode arrows, the geometry remains meaningful at every zoom.
 if(['quarterNW','quarterNE','quarterSW','quarterSE'].includes(kind)){
  const left=kind.endsWith('W'),top=kind.includes('N');
  const px=x+w*(left?.17:.83),py=y+h*(top?.17:.83);
  c.save();c.lineCap='round';c.lineJoin='round';
  c.strokeStyle='rgba(255,255,255,.98)';c.fillStyle='rgba(255,255,255,.98)';
  c.lineWidth=Math.max(1.7,Math.min(w,h)*.12);
  c.beginPath();c.moveTo(x+w*.5,y+h*.5);c.lineTo(px,py);c.stroke();
  c.beginPath();c.arc(px,py,Math.max(1.35,Math.min(w,h)*.12),0,Math.PI*2);c.fill();
  c.restore();return;
 }
 c.fillText(glyph(kind),x+w*.5,y+h*.52);}
root.PuntoPuntoStitchVisuals=Object.freeze({GLYPHS,NAMES,token,glyph,name,draw});
})(typeof window!=='undefined'?window:globalThis);

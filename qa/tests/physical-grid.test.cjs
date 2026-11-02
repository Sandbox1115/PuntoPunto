'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const file=n=>fs.readFileSync(path.join(root,n),'utf8');
const window={};vm.runInNewContext(file('pdf-grid-size.js'),{window});
const size=window.PuntoPuntoGridSize;
const plain=value=>JSON.parse(JSON.stringify(value));

test('24,5 × 16 cm with 5,5 stitches/cm produces 135 × 88 cells',()=>{
 const x=size.derive('cm','24,5','16','5,5');
 assert.equal(x.cols,135);assert.equal(x.rows,88);assert.equal(x.rounded,true);
});
test('9.64 × 6.29 inches at 14 ct produces the same 135 × 88 grid',()=>{
 const x=size.derive('in','9.64','6.29','14');
 assert.equal(x.cols,135);assert.equal(x.rows,88);
});
test('Switching cm/in converts both width and density, not only the label',()=>{
 const width=size.convert('24,5','cm','in','size'),height=size.convert('16','cm','in','size');
 const density=size.convert('5,5','cm','in','density');
 assert.ok(Math.abs(width-24.5/2.54)<1e-9);assert.ok(Math.abs(density-13.97)<1e-9);
 assert.deepEqual(plain([size.derive('in',width.toFixed(5),height.toFixed(5),density.toFixed(5)).cols,
   size.derive('in',width.toFixed(5),height.toFixed(5),density.toFixed(5)).rows]),[135,88]);
 assert.ok(Math.abs(size.convert(width.toFixed(5),'in','cm','size')-24.5)<0.0001);
});
test('Inputs accept decimal commas but reject garbage, HTML, scientific notation and negatives',()=>{
 assert.equal(size.decimal('5,5'),5.5);assert.equal(size.decimal('9.64'),9.64);
 for(const bad of ['24,5,6','1e6','<script>','-2','0x14','Infinity','2 000','']){
   assert.equal(size.derive('cm',bad,'16','5.5'),null,bad);
 }
});
test('Refuse zero, overly large and out-of-range physical grids',()=>{
 for(const vals of [['cm','0','16','5.5'],['in','10','3','0'],['cm','100','100','50'],['cm','600','600','1'],['cm','1000','1','1']])
  assert.equal(size.derive(...vals),null,JSON.stringify(vals));
 assert.equal(size.derive('cm','100','80','1').cols,100);
 assert.equal(size.limits(600,600),false);
 assert.equal(size.limits(500,200),true);
});
test('Exact stitch counts do not need rounding',()=>{
 const result=size.derive('in','8','12','14');
 assert.equal(result.cols,112);assert.equal(result.rows,168);assert.equal(result.rounded,false);
});
test('PDF form keeps existing cell mode and physical units separate',()=>{
 const html=file('index.html'),js=file('pdf-manual.js');
 for(const key of ['pdfDimensionMode','pdfPhysicalWidth','pdfPhysicalHeight','pdfFabricDensity','pdfCellDimensions','pdfPhysicalDimensions'])assert.ok(html.includes(`id="${key}"`));
 assert.match(js,/GridSize\.derive\(ui\.dimensionMode\.value,ui\.physicalWidth\.value,ui\.physicalHeight\.value,ui\.fabricDensity\.value\)/);
 assert.match(js,/cols:grid\.cols,rows:grid\.rows,rect:\{\.\.\.state\.rect\}/);
 assert.match(js,/last\.cols\);ui\.rows\.value=String\(last\.rows\)/);
 assert.doesNotMatch(js,/payload\.physicalWidth|payload\.density|source\.unit/);
});
test('Locale messages provide complete unit labels and grid summaries in English',()=>{
 const source=file('i18n.js'); const env={window:{confirm:x=>x},document:{readyState:'loading',addEventListener(){},dispatchEvent(){}},localStorage:{getItem:()=>null,setItem(){}},queueMicrotask:f=>f(),CustomEvent:class{}};
 vm.runInNewContext(source,env);const t=env.window.PuntoPuntoI18n;
 t.setLanguage('en');assert.equal(t.message('pdf.fabricCountIn'),'Fabric count (stitches/in, ct)');
 assert.equal(t.message('pdf.physicalGridSummary',{cols:135,rows:88,cells:11880}),
  'Estimated grid: 135 × 88 stitches (11880 cells). Check squares against the PDF.');
 t.setLanguage('it');assert.equal(t.message('pdf.physicalWidthCm'),'Larghezza disegno (cm)');
});

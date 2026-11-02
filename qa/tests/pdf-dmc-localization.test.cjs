'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../..'),src=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const window={};vm.runInNewContext(src('dmc-floss-names-it.js'),{window});
const labels=window.PuntoPuntoDMCNames;
const source=JSON.parse(src('data/dmc-floss.json')).colors;
test('Every original DMC code has a nonempty Italian label, no catalog changes',()=>{
 assert.equal(labels.count,489);assert.equal(source.length,489);
 for(const color of source){
  const translation=labels.name(color.code,color.name,'it');
  assert.equal(typeof translation,'string');assert.ok(translation.length>1);
  assert.equal(labels.name(color.code,color.name,'en'),color.name);
  assert.notEqual(translation,color.name,'Untranslated DMC '+color.code);
 }
 assert.equal(labels.name('3712','Salmon Medium','it'),'Salmone medio');
 assert.equal(labels.name('310','Black','it'),'Nero');
 assert.equal(labels.name('3346','Hunter Green','it'),'Verde cacciatore');
});
test('IT/EN round trip does not mutate a selected DMC or stored PDF palette',()=>{
 const original={code:'3712',brand:'DMC',name:'Salmon Medium',color:'#f18787'};
 assert.equal(labels.name(original.code,original.name,'it'),'Salmone medio');
 assert.equal(labels.name(original.code,original.name,'en'),'Salmon Medium');
 assert.equal(original.name,'Salmon Medium');
 assert.equal(original.color,'#f18787');
 assert.equal(labels.name('MY-PINK','My personal pink','it'),'My personal pink');
});
test('Italian search matches accents and leaves code/English searches available',()=>{
 assert.ok(labels.matches('3712','Salmon Medium','salmone','it'));
 assert.ok(labels.matches('Ecru','Ecru','ecru','it'));
 assert.ok(labels.matches('3712','Salmon Medium','Salmon','it'));
 assert.ok(labels.matches('310','Black','310','it'));
 assert.ok(!labels.matches('310','Black','salmone','it'));
});
test('PDF results, legend and selected status use display helpers with no palette rewrites',()=>{
 const js=src('pdf-tracker.js');
 assert.match(js,/title\.textContent=threadDisplayName\(item\)/);
 assert.match(js,/name\.textContent=dmcDisplayName\(item\)/);
 assert.match(js,/name:dmcDisplayName\(item\)/);
 assert.match(js,/puntopunto:languagechange/);
 assert.match(js,/renderDMCResults\(\)/);
 assert.match(js,/cat\.search\('',489\)/);
 assert.match(js,/state\.palette\.push\(\{code,color,brand,name\}\)/);
 assert.match(js,/palette:state\.palette/);
 assert.ok(src('index.html').indexOf('dmc-floss-names-it.js')<src('index.html').indexOf('pdf-tracker.js'));
});
test('No translations or remote resources embedded into the original locked DMC file',()=>{
 const locked=JSON.parse(src('ASSET_LOCK.json'));
 assert.equal(locked.assets['data/dmc-floss.json'].sha256,'dd173705a0b871219915e6b73328fa8eebb752b699b99474879751d8a70b574a');
 assert.doesNotMatch(src('dmc-floss-names-it.js'),/fetch\(|XMLHttpRequest|navigator\.sendBeacon|localStorage|eval\(/);
});

'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');const code=n=>fs.readFileSync(path.join(ROOT,n),'utf8');
const window={};vm.runInNewContext(code('oxs-floss-names.js'),{window});
const labels=window.PuntoPuntoFlossNames;
const dmc=JSON.parse(code('data/dmc-floss.json')).colors;
const map=new Map(dmc.map(x=>[x.code.toUpperCase(),x]));
const lookup=key=>map.get(key);

test('English DMC thread names come from locked catalog, not a translation of the imported OXS file',()=>{
 const pal={number:'DMC 3712',name:'Salmone medio',color:'#F18787',isCloth:false};
 assert.equal(labels.display(pal,'en',lookup),'Salmon Medium');
 assert.equal(labels.display(pal,'it',lookup),'Salmone medio');
 assert.equal(pal.name,'Salmone medio','OXS source must remain unchanged');
});
test('Recognized bare DMC codes and textual DMC thread IDs translate correctly',()=>{
 assert.equal(labels.display({number:'310',name:'Nero'},'en',lookup),'Black');
 assert.equal(labels.display({number:'DMC BLANC',name:'Bianco'},'en',lookup),'White');
});
test('Preserve unknown, custom, cloth and unrecognized thread names in both languages',()=>{
 for(const thread of [
   {number:'MIO-3712',name:'Il mio rosa'},
   {number:'CustomBlue',name:'Blu speciale'},
   {number:'0',name:'Tessuto',isCloth:true},
   {number:'DMC 9999',name:'Non trovato'}
 ]){
  assert.equal(labels.display(thread,'en',lookup),thread.name);
  assert.equal(labels.display(thread,'it',lookup),thread.name);
 }
});
test('OXS legend and overlapping stitch chooser use the same view-only display name',()=>{
 const app=code('app.js');
 assert.match(app,/const shownName=threadDisplayName\(c\)/);
 assert.match(app,/desc\.textContent=shownName/);
 assert.match(app,/threadDisplayName\(pal\)/);
 assert.match(app,/\$\{c\.number\} \$\{c\.name\} \$\{shownName\}/);
 assert.match(app,/loadDMCDisplayNames\(pattern\)/);
 assert.match(app,/state\.pattern!==pattern/);
 assert.match(app,/window\.PuntoPuntoDMC\?\.load\(\)/);
});

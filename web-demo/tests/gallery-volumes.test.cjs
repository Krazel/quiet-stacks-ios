const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {SERIES,TOTAL}=require('../web/js/gallery-model.js'),{atlases,bindings}=require('../web/js/gallery-volumes.js');
test('all 960 volumes have distinct complete painted spines within real atlas dimensions',()=>{
 const sizes=atlases.map(a=>{const p=fs.readFileSync(path.join(__dirname,'../web',a.file));assert.equal(p.toString('ascii',1,4),'PNG');const size=[p.readUInt32BE(16),p.readUInt32BE(20)];assert.deepEqual(size,a.size);return size;});
 assert.equal(bindings.length,117);const used=new Set();
 for(const s of SERIES){assert.equal(bindings[s.art].length,s.count);for(const v of bindings[s.art]){assert.ok(v);const [x,y,w,h]=v.source,[aw,ah]=sizes[v.atlas];assert.ok([x,y,w,h].every(Number.isInteger));assert.ok(x>=0&&y>=0&&w>15&&h>70&&x+w<=aw&&y+h<=ah);const key=JSON.stringify(v);assert.ok(!used.has(key),s.name+' has repeated artwork');used.add(key);}}
 assert.equal(used.size,TOTAL);assert.equal(atlases[bindings[0][0].atlas].file,'assets/moon-volumes-v15.png');
});
test('442 coherent spines preserve the 518 unaffected originals and exist in packed textures',()=>{
 const original=require('../design/volume-redraw-20260920/original-volume-manifest.cjs');
 const packed=require('../web/js/gallery-packed.js');let preserved=0,redrawn=0,repairs=0;
 const repairKeys=new Set(['42:11','43:11','46:11','57:9','59:9','61:12','13:4']);
 for(const s of SERIES)for(let i=0;i<s.count;i++){
  const v=bindings[s.art][i],old=original.bindings[s.art]?.[i];
  if(old&&!repairKeys.has(s.art+':'+(i+1))){assert.deepEqual(v,old);preserved++;}else{assert.equal(v.redrawn,true);assert.equal(v.coherent,true);if(old)repairs++;else redrawn++;}
  assert(packed.sprites[atlases[v.atlas].file+'|'+v.source.join(',')],`${s.name} volume ${i+1}`);
 }
 assert.equal(preserved,518);assert.equal(redrawn,435);assert.equal(repairs,7);
});

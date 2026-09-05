const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {SERIES,TOTAL}=require('../web/js/gallery-model.js'),{atlases,bindings}=require('../web/js/gallery-volumes.js');
test('all 525 volumes have distinct complete numbered spines within real atlas dimensions',()=>{
 const sizes=atlases.map(a=>{const p=fs.readFileSync(path.join(__dirname,'../web',a.file));assert.equal(p.toString('ascii',1,4),'PNG');const size=[p.readUInt32BE(16),p.readUInt32BE(20)];assert.deepEqual(size,a.size);return size;});
 assert.equal(bindings.length,100);const used=new Set();
 for(const s of SERIES){assert.equal(bindings[s.art].length,s.count);for(const v of bindings[s.art]){assert.ok(v);const [x,y,w,h]=v.source,[aw,ah]=sizes[v.atlas];assert.ok([x,y,w,h].every(Number.isInteger));assert.ok(x>=0&&y>=0&&w>15&&h>70&&x+w<=aw&&y+h<=ah);const key=JSON.stringify(v);assert.ok(!used.has(key),s.name+' has repeated artwork');used.add(key);}}
 assert.equal(used.size,TOTAL);assert.equal(atlases[bindings[0][0].atlas].file,'assets/moon-volumes-v15.png');
});

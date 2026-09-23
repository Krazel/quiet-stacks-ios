const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {SERIES,TOTAL}=require('../web/js/gallery-model.js'),{atlases,bindings}=require('../web/js/gallery-volumes.js');
test('all 1119 volumes have distinct complete painted spines within real atlas dimensions',()=>{
 const sizes=atlases.map(a=>{const p=fs.readFileSync(path.join(__dirname,'../web',a.file));assert.equal(p.toString('ascii',1,4),'PNG');const size=[p.readUInt32BE(16),p.readUInt32BE(20)];assert.deepEqual(size,a.size);return size;});
 assert.equal(bindings.length,117);const used=new Set();
 for(const s of SERIES){assert.equal(bindings[s.art].length,s.count);for(const v of bindings[s.art]){assert.ok(v);const [x,y,w,h]=v.source,[aw,ah]=sizes[v.atlas];assert.ok([x,y,w,h].every(Number.isInteger));assert.ok(x>=0&&y>=0&&w>15&&h>70&&x+w<=aw&&y+h<=ah);const key=JSON.stringify(v);assert.ok(!used.has(key),s.name+' has repeated artwork');used.add(key);}}
 assert.equal(used.size,TOTAL);assert.equal(atlases[bindings[0][0].atlas].file,'assets/moon-volumes-v15.png');
});
test('coherent spines preserve every unaffected original and include the 55 approved master corrections in packed textures',()=>{
 const original=require('../design/volume-redraw-20260920/original-volume-manifest.cjs');
 const selected=require('../design/volume-selected-20260922/composed.json'),selectedKeys=new Set(selected.map(x=>x.art+':'+x.volume));
 const reported=require('../design/reported-spines-20260923/composed.json'),reportedKeys=new Set(reported.map(x=>x.art+':'+x.volume));let reportedCount=0;
 const packed=require('../web/js/gallery-packed.js');let preserved=0,redrawn=0,repairs=0,added=0,masterCorrected=0;
 const repairKeys=new Set(['42:11','43:11','46:11','57:9','59:9','61:12','13:4']);
 for(const s of SERIES)for(let i=0;i<s.count;i++){
  const v=bindings[s.art][i],old=original.bindings[s.art]?.[i];
  const key=s.art+':'+(i+1);
  if(reportedKeys.has(key)){assert.equal(v.reportedRepair,true);assert.equal(v.coherent,true);reportedCount++;}
  else if(selectedKeys.has(key)){assert.equal(v.masterCorrected,true);assert.equal(v.selectedRepair,true);assert.equal(v.coherent,true);masterCorrected++;}
  else if(v.shelfFit){assert.equal(v.coherent,true);added++;}else if(old&&!repairKeys.has(key)){assert.deepEqual(v,old);preserved++;}else{assert.equal(v.redrawn,true);assert.equal(v.coherent,true);if(old)repairs++;else redrawn++;}
  assert(packed.sprites[atlases[v.atlas].file+'|'+v.source.join(',')],`${s.name} volume ${i+1}`);
 }
 assert.equal(reportedCount,59);assert.equal(masterCorrected,55-[...reportedKeys].filter(k=>selectedKeys.has(k)).length);assert.equal(preserved+redrawn+repairs+added+masterCorrected+reportedCount,TOTAL);
 for(const item of selected){const v=bindings[item.art][item.volume-1];assert.deepEqual(v.source.slice(2),item.size);assert.equal(item.outsideChanges,0);assert.equal(item.alphaChanges,0);}
});

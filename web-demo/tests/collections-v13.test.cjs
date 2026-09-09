const test=require('node:test'),assert=require('node:assert/strict');
const m=require('../web/js/gallery-model.js');
test('all new collection views refer to their own complete measured raster sprites',()=>{
 const seen=new Set();assert.equal(m.COLLECTION_ATLASES.length,16);
 for(const s of m.SERIES){if(s.art<24)continue;const atlas=m.COLLECTION_ATLASES[s.art>=100?13+Math.floor((s.art-100)/6):Math.floor((s.art-24)/6)],col=s.art>=100?(s.art-100)%6:(s.art-24)%6;
  for(let row=0;row<4;row++){const [x,y,w,h]=atlas.sprites[row*atlas.columns+col];assert.ok(x>=0&&y>=0&&w>30&&h>70);assert.ok(x+w<=atlas.size[0]&&y+h<=atlas.size[1]);if(row<2)assert.ok(w/h>.65&&w/h<1.5);const key=[atlas.file,x,y,w,h].join(':');assert.ok(!seen.has(key));seen.add(key);}
 }assert.equal(seen.size,372);
});
test('ladder spaces accept shelf books and the parked ladder occupies floor only',()=>{
 for(const s of m.SLOTS)assert.equal(m.slotAt({x:s.x,y:s.y-13.5}),s.id);
 assert.equal(m.floorAllowed({x:1340,y:625}),false);
 for(const s of m.SLOTS)assert.ok(!(s.x>=1300&&s.x<=1380&&s.y>=612&&s.y<=635));
});
test('black atlas padding clears while enclosed ink stays opaque',()=>{
 const {clearMatte}=require('../web/js/gallery-textures.js'),w=7,a=new Uint8ClampedArray(w*w*4);
 for(let i=0;i<w*w;i++)a.set([0,0,0,255],i*4);
 for(let y=1;y<6;y++)for(let x=1;x<6;x++)a.set([160,90,45,255],(y*w+x)*4);
 a.set([0,0,0,255],(3*w+3)*4);clearMatte(a,w,w,true);assert.equal(a[3],0);assert.equal(a[(3*w+3)*4+3],255);
});

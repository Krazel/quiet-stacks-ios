const test=require('node:test'),assert=require('node:assert/strict');
const m=require('../web/js/gallery-model.js');
test('all new collection views refer to their own complete measured raster sprites',()=>{
 const seen=new Set();assert.equal(m.COLLECTION_ATLASES.length,13);
 for(const s of m.SERIES){if(s.art<24)continue;const atlas=m.COLLECTION_ATLASES[Math.floor((s.art-24)/6)],col=(s.art-24)%6;
  for(let row=0;row<4;row++){const [x,y,w,h]=atlas.sprites[row*atlas.columns+col];assert.ok(x>=0&&y>=0&&w>30&&h>70);assert.ok(x+w<=atlas.size[0]&&y+h<=atlas.size[1]);if(row<2)assert.ok(w/h>.65&&w/h<1.5);const key=[atlas.file,x,y,w,h].join(':');assert.ok(!seen.has(key));seen.add(key);}
 }assert.equal(seen.size,304);
});
test('ladder spaces accept shelf books and the parked ladder occupies floor only',()=>{
 for(const p of [{x:302,y:430},{x:1368,y:520},{x:184,y:810},{x:1190,y:750},{x:128,y:255},{x:1333,y:255},{x:488,y:40},{x:1215,y:40},{x:992,y:185}])assert.ok(m.slotAt(p)>=0,JSON.stringify(p));
 assert.equal(m.floorAllowed({x:1390,y:612}),false);
 for(const s of m.SLOTS)assert.ok(!(s.x>=1340&&s.x<=1438&&s.y>=597&&s.y<=628));
});
test('black atlas padding clears while enclosed ink stays opaque',()=>{
 const {clearMatte}=require('../web/js/gallery-textures.js'),w=7,a=new Uint8ClampedArray(w*w*4);
 for(let i=0;i<w*w;i++)a.set([0,0,0,255],i*4);
 for(let y=1;y<6;y++)for(let x=1;x<6;x++)a.set([160,90,45,255],(y*w+x)*4);
 a.set([0,0,0,255],(3*w+3)*4);clearMatte(a,w,w,true);assert.equal(a[3],0);assert.equal(a[(3*w+3)*4+3],255);
});

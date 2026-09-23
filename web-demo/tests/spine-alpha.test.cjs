const test=require('node:test'),assert=require('node:assert/strict');
const {clearMatte}=require('../web/js/gallery-textures.js');
test('light atlas import preserves black book interiors connected to the outside contour',()=>{
 const w=7,h=7,data=Buffer.alloc(w*h*4,255);
 // White surrounds a black leather binding, with gold bands enclosing its centre.
 for(let y=1;y<6;y++)for(let x=1;x<6;x++)data.set(x===1||x===5||y===3?[15,14,12,255]:[160,93,29,255],(y*w+x)*4);
 clearMatte(data,w,h,false);
 assert.equal(data[3],0);for(let y=1;y<6;y++)for(let x=1;x<6;x++)assert.equal(data[(y*w+x)*4+3],255,`book pixel ${x},${y}`);
});

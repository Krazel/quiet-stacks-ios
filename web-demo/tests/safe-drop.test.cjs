const test=require('node:test'),assert=require('node:assert/strict'),{Gallery,SLOTS,floorAllowed}=require('../web/js/gallery-model.js');
test('screen-constrained drops search valid nearby surfaces without changing other books',()=>{
 const g=new Gallery(),before=structuredClone(g.state.books),accept=t=>t.place==='floor'&&t.point.x>=730&&t.point.x<=930&&t.point.y>=370&&t.point.y<=440;
 for(const point of [{x:0,y:400},{x:830,y:941},{x:SLOTS[0].x,y:SLOTS[0].y-8}]){const seed={x:Math.max(730,Math.min(930,point.x)),y:Math.max(370,Math.min(440,point.y))},t=g.nearestDrop(0,point,accept,seed);assert(t&&accept(t));assert(floorAllowed(t.point));assert(g.drop(0,point,accept,seed));assert.deepEqual(g.state.books.slice(1),before.slice(1));}
});
test('unavailable visible surface rejects drop transactionally',()=>{const g=new Gallery(),before=structuredClone(g.state);assert.equal(g.drop(0,{x:800,y:400},()=>false),false);assert.deepEqual(g.state,before);});

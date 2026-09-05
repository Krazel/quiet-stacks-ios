const test=require('node:test'),assert=require('node:assert/strict');
const {Gallery,SLOTS,TOTAL,floorAllowed}=require('../web/js/gallery-model.js');
test('demo arrangements preserve identities and camera, and scatter changes each time',()=>{
 const m=new Gallery(),identity=m.state.books.map(({id,series,volume})=>({id,series,volume})),camera={...m.state.camera};
 m.move(0,'cart');assert.ok(m.demoArrange('sort'));assert.ok(m.state.books.every(b=>b.place==='shelf'&&b.slot===b.id));
 assert.ok(m.demoArrange('scatter'));assert.ok(m.state.books.every(b=>b.place==='floor'&&floorAllowed(b)));
 assert.equal(new Set(m.state.books.map(b=>b.x+','+b.y)).size,TOTAL);const first=JSON.stringify(m.state.books.map(b=>[b.x,b.y]));
 m.demoArrange('scatter');assert.notEqual(JSON.stringify(m.state.books.map(b=>[b.x,b.y])),first);
 assert.deepEqual(m.state.books.map(({id,series,volume})=>({id,series,volume})),identity);assert.deepEqual(m.state.camera,camera);assert.ok(Gallery.valid(m.state));
 const before=JSON.stringify(m.state);assert.equal(m.demoArrange('unknown'),false);assert.equal(JSON.stringify(m.state),before);
});
test('an occupied shelf chooses the physically nearest free slot, regardless of collection',()=>{
 const m=new Gallery();m.move(0,'shelf',0);const before={...m.book(0)},s=SLOTS[0];
 assert.ok(m.drop(524,{x:s.x,y:s.y-16}));assert.equal(m.book(524).slot,1);assert.deepEqual(m.book(0),before);assert.ok(Gallery.valid(m.state));
});
test('a full trolley redirects a drop onto nearby free floor without losing any books',()=>{
 const m=new Gallery();for(let i=0;i<12;i++)m.move(i,'cart');const cart=JSON.stringify(m.cart()),p={x:843,y:505};
 assert.ok(m.drop(524,p));const b=m.book(524);assert.equal(b.place,'floor');assert.ok(floorAllowed(b));assert.ok(Math.hypot(b.x-p.x,b.y-p.y)<65);
 assert.equal(JSON.stringify(m.cart()),cart);assert.ok(Gallery.valid(m.state));
 const before=JSON.stringify(m.state);assert.equal(m.drop(524,{x:NaN,y:0}),false);assert.equal(JSON.stringify(m.state),before);
});
test('the nearest surface beside a lamp is within half a pixel of its boundary',()=>{
 const m=new Gallery(),p={x:443,y:878},target=m.nearestDrop(524,p);
 assert.equal(target.place,'floor');assert.ok(floorAllowed(target.point));assert.ok(Math.hypot(target.point.x-p.x,target.point.y-p.y)<=17.5);
});

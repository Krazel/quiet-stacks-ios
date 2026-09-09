const test=require('node:test'),assert=require('node:assert/strict');
const m=require('../web/js/gallery-model.js'),old=require('./fixtures/gallery-v4-catalog.json');
test('all 525 existing identities, shelf assignments, trolley and camera survive the expanded catalog',()=>{
 const input=structuredClone(old.save);for(let i=0;i<500;i++){input.books[i].place='shelf';input.books[i].slot=499-i;}for(let i=500;i<512;i++)input.books[i].place='cart';input.camera={x:1200,y:700,zoom:3};
 const before=structuredClone(input),g=new m.Gallery();assert.ok(g.restore(input));assert.deepEqual(input,before);assert.equal(g.state.books.length,960);assert.deepEqual(g.state.camera,input.camera);
 for(let i=0;i<525;i++){const a=input.books[i],b=g.book(i);for(const key of ['id','series','volume','place','slot','order'])assert.equal(b[key],a[key]);if(a.place==='floor')assert.ok(m.floorAllowed(b));assert.equal(m.details(i).category,old.series[a.series].category);assert.equal(m.details(i).collection,old.series[a.series].name);}
 assert.equal(g.cart().length,12);assert.ok(m.Gallery.valid(g.state));const next=new m.Gallery();assert.ok(next.restore(g.state));assert.deepEqual(next.state,g.state);
});
test('old malformed snapshots are rejected before touching a live expanded game',()=>{
 for(const mutate of [s=>s.books.pop(),s=>s.books[0].id=2,s=>s.books[0].volume=100,s=>s.books[0].x=NaN,s=>s.books[0].pose='flat',s=>{s.books[0].place='shelf';s.books[0].slot=0;s.books[1].place='shelf';s.books[1].slot=0;},s=>{for(let i=0;i<13;i++)s.books[i].place='cart';},s=>s.camera.zoom=0]){const input=structuredClone(old.save);mutate(input);const g=new m.Gallery(),before=structuredClone(g.state);assert.equal(g.restore(input),false);assert.deepEqual(g.state,before);}
});
test('every painted collection has a tight non-overlapping run of uniform spines',()=>{
 const used=new Set();for(const c of m.SERIES){assert.equal(c.slotIds.length,c.count);assert.equal(c.slotWidth,9.2);let right=c.left;for(const [index,id] of c.slotIds.entries()){assert.ok(!used.has(id));used.add(id);const s=m.SLOTS[id];assert.ok(s.x-4.5>=right-1e-8);if(index)assert.ok(Math.abs(s.x-4.5-right-.2)<1e-8);assert.ok(s.x+4.5<=c.right+1e-8);assert.equal(s.y,c.y);right=s.x+4.5;assert.ok(s.y-27>=m.RACKS[c.rack].box[1]);}assert.ok(Math.abs((m.SLOTS[c.slotIds[0]].x-4.5-c.left)-(c.right-right))<1e-8);}
 assert.equal(used.size,m.TOTAL);assert.equal(new Set(m.SERIES.map(c=>c.art)).size,m.SERIES.length);
});

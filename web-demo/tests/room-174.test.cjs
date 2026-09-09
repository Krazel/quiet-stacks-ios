const test=require('node:test'),assert=require('node:assert/strict'),m=require('../web/js/gallery-model.js'),old=require('./fixtures/catalog-0173-identities.json');
test('repainted room keeps every collection, volume, slot identity and exact drop target',()=>{
 assert.deepEqual(m.SLOTS.map(({id,series,volume})=>({id,series,volume})),old.slots);
 assert.deepEqual(m.SERIES.map(({art,count,slotIds})=>({art,count,slotIds})),old.series);
 const g=new m.Gallery();for(const s of m.SLOTS){assert.equal(m.slotAt({x:s.x,y:s.y-13.5}),s.id);assert(g.drop(s.id,{x:s.x,y:s.y-13.5}));assert.equal(g.placement(s.id),'exact');}
 const restored=new m.Gallery();assert(restored.restore(g.state));assert.deepEqual(restored.state,g.state);
});
test('repaint migrates only obstructed loose books and keeps valid floor coordinates and shelf progress',()=>{
 const g=new m.Gallery();g.demoArrange('sort');const s=structuredClone(g.state);delete s.artRevision;
 Object.assign(s.books[0],{place:'floor',slot:-1,x:500,y:530});
 Object.assign(s.books[1],{place:'floor',slot:-1,x:836,y:360});
 assert(!m.floorAllowed(s.books[0]));assert(m.floorAllowed(s.books[1]));
 const before=structuredClone(s),r=new m.Gallery();assert(r.restore(s));assert.deepEqual(s,before);assert(m.floorAllowed(r.book(0)));assert.deepEqual(r.book(1),s.books[1]);assert.deepEqual(r.state.books.slice(2),s.books.slice(2));
 const next=new m.Gallery();assert(next.restore(r.state));assert.deepEqual(next.state,r.state);
});

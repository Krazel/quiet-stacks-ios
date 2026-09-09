const test=require('node:test'),assert=require('node:assert/strict');
const {Gallery,SLOTS,SERIES}=require('../web/js/gallery-model.js');
test('each volume has one exact destination, with a distinct correct-bookcase result',()=>{
 const g=new Gallery();for(const b of g.state.books){assert.equal(g.placement(b.id),null);assert(g.move(b.id,'shelf',b.id));assert.equal(g.placement(b.id),'exact');}
 for(const b of g.state.books){const rack=SERIES[b.series].rack,other=SLOTS.find(s=>s.id!==b.id&&SERIES[s.series].rack===rack),wrong=SLOTS.find(s=>SERIES[s.series].rack!==rack),saved=b.slot;b.slot=other.id;assert.equal(g.placement(b.id),'rack');b.slot=wrong.id;assert.equal(g.placement(b.id),null);b.slot=saved;}
});
test('drop feedback follows the actual nearest free position and survives save restoration',()=>{
 const g=new Gallery(),b=g.book(0),home=SLOTS[0];g.move(1,'shelf',0);assert(g.drop(0,{x:home.x,y:home.y-13}));assert.notEqual(b.slot,0);assert.equal(g.placement(0),'rack');g.move(1,'floor',-1,{x:836,y:350});assert(g.drop(0,{x:home.x,y:home.y-13}));assert.equal(g.placement(0),'exact');const restored=new Gallery();assert(restored.restore(JSON.parse(JSON.stringify(g.state))));assert.equal(restored.placement(0),'exact');assert.equal(restored.placement(9999),null);
});

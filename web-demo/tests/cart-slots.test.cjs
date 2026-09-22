const test=require('node:test'),assert=require('node:assert/strict');
const {Gallery,CART_SLOTS,CART_BOOK_HEIGHT,cartPoint,cartHit}=require('../web/js/gallery-model.js');
const center=i=>{const p=cartPoint(i);return {x:p.x,y:p.y-CART_BOOK_HEIGHT/2};};
test('any empty cart bay can be chosen and removing a book leaves that bay empty',()=>{
 const g=new Gallery();assert(g.drop(0,center(10)));assert.equal(g.book(0).cartSlot,10);assert(g.drop(1,center(3)));assert.equal(g.book(1).cartSlot,3);
 assert(g.move(0,'floor',-1,{x:870,y:350}));assert.equal(g.book(0).cartSlot,undefined);assert.equal(g.book(1).cartSlot,3);assert(Gallery.valid(g.state));
});
test('a full cart permits internal swaps and exchanges with floor books',()=>{
 const g=new Gallery();for(let id=0;id<12;id++)assert(g.move(id,'cart',id));assert(g.drop(0,center(11)));assert.equal(g.book(0).cartSlot,11);assert.equal(g.book(11).cartSlot,0);
 const before=structuredClone(g.book(12)),others=structuredClone(g.cart().filter(b=>b.id!==0));assert(g.drop(12,center(11)));assert.equal(g.book(12).cartSlot,11);assert.equal(g.book(0).place,'floor');assert.equal(g.book(0).cartSlot,undefined);for(const k of ['x','y','pose','slot'])assert.equal(g.book(0)[k],before[k]);assert.deepEqual(g.cart().filter(b=>b.id!==12),others);assert.equal(g.cart().length,12);assert(Gallery.valid(g.state));
});
test('outside books target the occupied bay even when other cart bays are empty',()=>{
 for(const place of ['floor','shelf']){const g=new Gallery();g.move(0,'cart',7);if(place==='shelf')g.move(12,'shelf',45);else g.move(12,'floor',-1,{x:830,y:667});const before=structuredClone(g.book(12));assert(g.drop(12,center(7)));assert.equal(g.book(12).cartSlot,7);assert.equal(g.book(0).place,place);for(const k of ['slot','x','y','pose'])assert.equal(g.book(0)[k],before[k]);assert.equal(g.book(0).cartSlot,undefined);assert.equal(g.cart().length,1);assert(Gallery.valid(g.state));const restored=new Gallery();assert(restored.restore(structuredClone(g.state)));assert.deepEqual(restored.state,g.state);}
});
test('automatic cart insertion never swaps an arbitrary resident and rejected drops do not swap',()=>{
 const g=new Gallery();for(let id=0;id<12;id++)g.move(id,'cart',id);const before=structuredClone(g.state);assert.equal(g.move(12,'cart'),false);assert.equal(g.drop(12,center(7),()=>false),false);assert.deepEqual(g.state,before);
});
test('legacy cart order acquires stable bays without mutating the supplied save',()=>{
 const g=new Gallery();for(const id of [8,3,12])g.move(id,'cart');const legacy=structuredClone(g.state);for(const b of legacy.books)delete b.cartSlot;const before=structuredClone(legacy),restored=new Gallery();assert(restored.restore(legacy));assert.deepEqual(legacy,before);
 assert.deepEqual([8,3,12].map(id=>restored.book(id).cartSlot),[0,1,2]);assert(restored.move(8,'cart',9));const next=new Gallery();assert(next.restore(structuredClone(restored.state)));assert.deepEqual(next.state,restored.state);
});
test('invalid or duplicate cart bays reject the save without modifying the game',()=>{
 for(const slot of [-1,12,1.5,NaN,0]){const g=new Gallery();g.move(0,'cart',0);g.move(1,'cart',1);const bad=structuredClone(g.state);bad.books[1].cartSlot=slot;const before=structuredClone(g.state);assert.equal(g.restore(bad),false);assert.deepEqual(g.state,before);}
});
test('the sloping cart bays stay inside the shelf lips, away from posts and wheels',()=>{
 assert.equal(CART_SLOTS.length,12);for(const s of CART_SLOTS){assert(cartHit(center(s.id)));assert(s.x-4>828&&s.x+4<891);if(s.id%6)assert(s.y<CART_SLOTS[s.id-1].y);if(s.id>=6)assert(s.y-CART_BOOK_HEIGHT>CART_SLOTS[s.id-6].y+3);}
 for(const p of [{x:823,y:540},{x:899,y:535},{x:833,y:579},{x:852,y:511}])assert(!cartHit(p));
});

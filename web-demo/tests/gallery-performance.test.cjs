const test=require('node:test'),assert=require('node:assert/strict');
const current=require('../web/js/gallery-model.js'),layout=require('../web/js/gallery-layout.js');
const previous=require('./fixtures/gallery-model-0164.cjs');
test('precomputed opening positions exactly preserve the approved 0.16.4 layout',()=>{
  assert.deepEqual(current.SCATTER,previous.SCATTER);
  assert.equal(layout.points.length%2,0);
  for(let i=0;i<layout.points.length;i+=2)assert.ok(current.floorAllowed({x:layout.points[i],y:layout.points[i+1]}),'stale boundary '+i);
});
test('indexed invalid drops remain valid and no farther than the former search plus half a pixel',()=>{
  const a=new previous.Gallery(),b=new current.Gallery();a.demoArrange('sort');b.demoArrange('sort');
  // Full trolley as well as fully occupied shelves: exercises the expensive fallback.
  for(let id=0;id<12;id++){a.move(id,'cart');b.move(id,'cart');}
  const points=[{x:0,y:0},{x:1672,y:0},{x:1672,y:941},{x:443,y:878},{x:395,y:480},{x:1200,y:500},{x:840,y:505}];
  let seed=89;for(let i=0;i<180;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed/2**32*1672;seed=(Math.imul(seed,1664525)+1013904223)>>>0;points.push({x,y:seed/2**32*941});}
  const distance=(target,p,g)=>{if(target.place==='floor')return Math.hypot(target.point.x-p.x,target.point.y-p.y);const s=current.SLOTS[target.slot];return Math.hypot(s.x-p.x,s.y-current.SHELF_BOOK.height/2-p.y);};
  for(const p of points){const old=a.nearestDrop(524,p),now=b.nearestDrop(524,p);assert.ok(now);assert.ok(b.canPlace(524,now.place,now.slot,now.point));
    assert.ok(distance(now,p,b)<=distance(old,p,a)+.5,JSON.stringify({p,old,now}));
    if(current.floorAllowed(p)&&current.slotAt(p)<0&&!current.cartHit(p))assert.deepEqual(now,{place:'floor',point:p});
  }
});

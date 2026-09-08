const test=require('node:test'),assert=require('node:assert/strict');
const current=require('../web/js/gallery-model.js'),layout=require('../web/js/gallery-layout.js');
test('all expanded opening positions and boundary samples lie on usable surfaces',()=>{
 assert.equal(current.SCATTER.length,current.TOTAL);for(const p of current.SCATTER)assert.ok(current.floorAllowed(p));assert.equal(layout.points.length%2,0);
 for(let i=0;i<layout.points.length;i+=2)assert.ok(current.floorAllowed({x:layout.points[i],y:layout.points[i+1]}),'stale boundary '+i);
});
test('indexed invalid drops are no farther than an exhaustive boundary search',()=>{
 const b=new current.Gallery();b.demoArrange('sort');for(let id=0;id<12;id++)b.move(id,'cart');
 let seed=89;for(let n=0;n<180;n++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed/2**32*1672;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const p={x,y:seed/2**32*941},now=b.nearestDrop(524,p);assert.ok(now);assert.ok(b.canPlace(524,now.place,now.slot,now.point));
  if(current.floorAllowed(p)&&current.slotAt(p)<0&&!current.cartHit(p)){assert.deepEqual(now,{place:'floor',point:p});continue;}
  let nearest=Infinity;for(let i=0;i<layout.points.length;i+=2)nearest=Math.min(nearest,Math.hypot(layout.points[i]-p.x,layout.points[i+1]-p.y));
  const q=now.place==='floor'?now.point:{x:current.SLOTS[now.slot].x,y:current.SLOTS[now.slot].y-current.SHELF_BOOK.height/2};assert.ok(Math.hypot(q.x-p.x,q.y-p.y)<=nearest+.5);
 }
});

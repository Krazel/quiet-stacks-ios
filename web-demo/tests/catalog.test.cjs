const test=require('node:test'),assert=require('node:assert/strict');
const {Gallery,SLOTS,SERIES,TOTAL,details}=require('../web/js/gallery-model.js');
const {clearMatte}=require('../web/js/gallery-textures.js');

test('texture import clears grey halos and transparent padding without erasing ink or ivory',()=>{
 const w=11,h=11,data=new Uint8ClampedArray(w*h*4),set=(x,y,c)=>data.set(c,(y*w+x)*4),at=(x,y)=>Array.from(data.slice((y*w+x)*4,(y*w+x)*4+4));
 // Real atlas-style fringe: transparent black padding, neutral matte, blended
 // grey edge, dark outline, then enclosed light paper.
 for(let y=1;y<10;y++)for(let x=1;x<10;x++)set(x,y,[225,225,225,255]);
 for(let y=2;y<9;y++)for(let x=2;x<9;x++)set(x,y,[185,183,187,255]);
 for(let y=3;y<8;y++)for(let x=3;x<8;x++)set(x,y,[145,147,149,255]);
 for(let y=4;y<7;y++)for(let x=4;x<7;x++)set(x,y,[40,30,20,255]);
 set(5,5,[247,241,220,255]);clearMatte(data,w,h);
 assert.equal(at(1,1)[3],0);assert.equal(at(2,2)[3],0);
 assert.ok(at(3,3)[3]>0&&at(3,3)[3]<255);assert.ok(Math.max(...at(3,3).slice(0,3))<90);
 assert.deepEqual(at(4,4),[40,30,20,255]);assert.deepEqual(at(5,5),[247,241,220,255]);
});
test('every physical bay has a coherent collection and all 525 titles are distinct',()=>{assert.equal(new Set(SLOTS.map(s=>details(s.id).title)).size,TOTAL);for(const collection of SERIES){const members=SLOTS.slice(collection.start,collection.start+collection.count);assert.ok(members.every(s=>s.series===members[0].series&&s.segment===members[0].segment));assert.ok(collection.category&&collection.name);assert.ok(members.every(s=>details(s.id).category===collection.category));}});
test('the scattered books have nonaligned positions and finite book dimensions',()=>{const m=new Gallery();assert.equal(new Set(m.state.books.map(b=>b.x)).size,TOTAL);assert.equal(new Set(m.state.books.map(b=>b.y)).size,TOTAL);for(const b of m.state.books){assert.ok(Number.isFinite(details(b.id).width)&&details(b.id).width>0);assert.ok(Number.isFinite(details(b.id).height)&&details(b.id).height>0);}});
test('a version 2 save keeps placed identities while replacing the old floor piles',()=>{const m=new Gallery();m.move(0,'shelf',0);const old=JSON.parse(JSON.stringify(m.state));old.version=2;old.books.forEach(b=>{b.series=0;b.volume=1;if(b.place==='floor'){b.x=800;b.y=400;}});const next=new Gallery();assert.ok(next.restore(old));assert.equal(next.book(0).slot,0);assert.equal(next.state.books.filter(b=>b.place==='shelf').length,1);assert.ok(new Set(next.state.books.filter(b=>b.place==='floor').map(b=>b.x)).size>500);});
test('matte import clears connected neutral background and preserves ivory interiors and colored edges',()=>{const w=7,h=7,data=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)data.set([240,240,240,255],i*4);for(let y=1;y<6;y++)for(let x=1;x<6;x++)data.set([155,110,60,255],(y*w+x)*4);data.set([245,245,245,255],(3*w+3)*4);data.set([245,235,210,255],(2*w+2)*4);clearMatte(data,w,h);assert.equal(data[3],0);assert.equal(data[(3*w+3)*4+3],255);assert.equal(data[(2*w+2)*4+3],255);assert.equal(data[(1*w+1)*4+3],255);});
test('each of the 100 collections has a unique binding, repeated only within its volumes',()=>{
 const {BINDINGS,RACKS}=require('../web/js/gallery-model.js');
 assert.equal(BINDINGS.length,100);assert.equal(new Set(SERIES.map(s=>s.art)).size,100);
 for(const c of SERIES)for(const slot of SLOTS.filter(s=>s.series===SERIES.indexOf(c)))assert.equal(details(slot.id).art,c.art);
 const forgotten=SERIES.filter(s=>s.category==='Forgotten Realms');
 assert.ok(new Set(forgotten.map(s=>s.color)).size>=8);
 assert.equal(BINDINGS[forgotten.find(s=>s.name==='Royal Histories').art].name,'Crown');
 assert.equal(BINDINGS[forgotten.find(s=>s.name==='Ancient Cities').art].name,'Column arch');
 assert.equal(BINDINGS[forgotten.find(s=>s.name==='Border Wars').art].name,'Swords');
});

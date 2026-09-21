const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),art=require('../web/js/gallery-room-artwork.js');
test('removed bench and chair leave usable floor and preserve shelf destinations',()=>{const m=require('../web/js/gallery-model.js'),g=new m.Gallery();for(const p of [{x:1340,y:625},{x:1380,y:370}]){assert(m.floorAllowed(p));assert(g.drop(0,p));assert.equal(g.book(0).x,p.x);assert.equal(g.book(0).y,p.y);}assert.equal(g.state.books.length,1119);});
test('approved x3 painting covers the exact world with GPU-safe, lossless-source tiles',async()=>{
 assert.equal(art.sha256,'2d5216f27b7d09c62bda830b1cf6216ffa62db1d8b9f0058172ace1187a11489');assert.equal(art.embeddedTitles,true);assert.equal(art.tiles.length,4);
 let pixels=0;for(const t of art.tiles){const png=fs.readFileSync(path.join(__dirname,'../web',t.file)),w=png.readUInt32BE(16),h=png.readUInt32BE(20);assert(w<=4096&&h<=4096);assert.equal(t.source[2]/3,t.rect.w);assert.equal(t.source[3]/3,t.rect.h);assert(t.source[0]+t.source[2]<=w&&t.source[1]+t.source[3]<=h);pixels+=t.source[2]*t.source[3];}
 assert.equal(pixels,5976*2823);const [a,b,c,d]=art.tiles.map(t=>t.rect);assert.equal(a.x,-130);assert.equal(a.x+a.w,b.x);assert.equal(a.y+a.h,c.y);assert.equal(c.x+c.w,d.x);assert.equal(d.x+d.w,1862);assert.equal(d.y+d.h,941);
 const {default:files}=await import('../runtime-files.mjs');assert(!files.includes('assets/gallery-walls-v174.png'));assert(!files.includes('assets/nameplates-v14.png'));for(const t of art.tiles)assert(files.includes(t.file));
});



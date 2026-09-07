const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {distribution,summarize}=require('../web/js/gallery-performance.js');
test('performance report distinguishes idle from missing timing samples',()=>{
 assert.deepEqual(distribution([]),{count:0,median:null,p95:null,max:null});
 const s=summarize({name:'idle',started:0,frames:[],ticks:[0,16,32],inputs:[],drops:[],events:{}},1000);
 assert.equal(s.renderFPS,0);assert.equal(s.drawMainThreadMs.median,null);assert.equal(s.schedulerIntervalMs.median,16);
});
test('report separates frame costs, listener latency and drop latency',()=>{
 const s=summarize({name:'manual-play',started:0,frames:[{at:10,total:5,room:2,books:3,count:20},{at:60,total:55,room:20,books:35,count:30}],ticks:[0,16,60],inputs:[20],drops:[3,9],events:{pointermove:2}},1000);
 assert.equal(s.renderFPS,2);assert.equal(s.framesOver50ms,1);assert.equal(s.roomDrawMs.max,20);assert.equal(s.bookDrawMs.max,35);assert.equal(s.inputToRenderMs.max,20);assert.equal(s.dropMs.max,9);
 assert.equal(s.renderIntervalMs.max,50);assert.equal(s.visibleBooks.max,30);assert.equal(s.frames,undefined);
});
test('diagnostic version matches the package delivered to testers',()=>{
 const version=JSON.parse(fs.readFileSync('package.json')).version;
 assert.ok(fs.readFileSync('web/js/gallery-performance.js','utf8').includes("version:'"+version+"'"));
});

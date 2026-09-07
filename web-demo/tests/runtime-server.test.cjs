const test=require('node:test'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
test('local server serves exactly the active offline payload including packed assets',async()=>{
 const root=path.resolve(__dirname,'..'),child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try{
  const url=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('server startup timeout')),10000);child.once('error',reject);child.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});});
  const {default:files}=await import('../runtime-files.mjs');
  for(const file of files){const response=await fetch(url+'/'+file);assert.equal(response.status,200,file);assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync(path.join(root,'web',file)),file);}
  for(const file of ['.git/config','store/testflight.json','assets/books-varied-v9.png'])assert.equal((await fetch(url+'/'+file)).status,404);
 }finally{child.kill();}
});

const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/room-viewport');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {default:files}=await import('../runtime-files.mjs');
 const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!files.includes(name)){res.writeHead(404).end();return;}
  let data=fs.readFileSync(path.join(root,'web',name));
  if(name==='js/gallery.js')data=Buffer.from(data.toString().replace('const local=e=>','window.__qa={model,constrain,update,screen,scale,select};const local=e=>'));
  res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':'image/png'});res.end(data);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,headless:true});const results=[];
  for(const [name,width,height,insets] of [['iphone-x',812,375,[0,44,21,44]],['iphone-small',568,320,[0,0,0,0]],['ipad',1024,768,[0,0,20,0]],['ipad-pro',1366,1024,[0,0,20,0]]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.__galleryRenderedFrames>0);
   await page.evaluate(insets=>['top','right','bottom','left'].forEach((side,i)=>document.documentElement.style.setProperty('--safe-'+side,insets[i]+'px')),insets);await page.evaluate(()=>dispatchEvent(new Event('resize')));await page.waitForTimeout(100);const area=await page.locator('#scene').boundingBox();
   const coverage=await page.evaluate(()=>{
    const qa=__qa,c=qa.model.state.camera,before=JSON.stringify(qa.model.state.books),cases=[];
    for(const zoom of [1,1.12,3,8])for(const x of [-10000,10000])for(const y of [-10000,10000]){Object.assign(c,{zoom,x,y});qa.constrain();const a=qa.screen({x:-160,y:0}),b=qa.screen({x:1672,y:941});cases.push({zoom,left:a.x,top:a.y,right:b.x,bottom:b.y});}
    Object.assign(c,{x:836,y:470.5,zoom:1});qa.constrain();qa.update();return {cases,unchanged:before===JSON.stringify(qa.model.state.books)};
   });
   assert.ok(coverage.unchanged);for(const c of coverage.cases)assert.ok(c.left<=1e-6&&c.top<=1e-6&&c.right>=area.width-1e-6&&c.bottom>=area.height-1e-6,JSON.stringify(c));
   await page.screenshot({path:path.join(out,name+'-room.png')});
   const safe=async(selector)=>{const box=await page.locator(selector).boundingBox();assert.ok(box,selector);assert.ok(box.x>=insets[3]-1&&box.y>=insets[0]-1&&box.x+box.width<=width-insets[1]+1&&box.y+box.height<=height-insets[2]+1,selector+JSON.stringify(box));return box;};
   await safe('#demo-toggle');await page.evaluate(()=>__qa.select(0));const card=await safe('#inspection');await safe('#inspect-close');await safe('#inspect-pickup');
   await page.screenshot({path:path.join(out,name+'-details.png')});
   await page.locator('#inspect-close').click();await safe('#selection');await page.screenshot({path:path.join(out,name+'-summary.png')});
   await page.setViewportSize({width:height,height:width});await page.waitForTimeout(80);
   const rotated=await page.evaluate(()=>({a:__qa.screen({x:0,y:0}),b:__qa.screen({x:1672,y:941}),width:document.getElementById('scene').clientWidth,height:document.getElementById('scene').clientHeight}));
   assert.ok(rotated.a.x<=1e-6&&rotated.a.y<=1e-6&&rotated.b.x>=rotated.width-1e-6&&rotated.b.y>=rotated.height-1e-6);
   assert.deepEqual(errors,[]);results.push({name,width,height,simulatedSafeInsets:insets,coverage,card,rotationCovered:true,errors});await page.close();
  }
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({status:'browser QA; safe insets simulated, not native screenshots',views:results},null,2));console.log('PASS: four full viewports, 64 edge/zoom cases, safe panels and resize.');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/expanded-room-0174');fs.mkdirSync(out,{recursive:true});
(async()=>{const {default:files}=await import('../runtime-files.mjs');const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!files.includes(name)){res.writeHead(404).end();return;}let data=fs.readFileSync(path.join(root,'web',name));if(name==='js/gallery.js')data=Buffer.from(data.toString().replace('const local=e=>','window.__qa={model,constrain,update,screen,scale,select};const local=e=>'));res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':'image/png'});res.end(data);});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,headless:true});const result=[];
 for(const [name,width,height] of [['full-map',1672,941],['iphone',812,375],['ipad',1024,768]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:name==='full-map'?1:2,hasTouch:true,isMobile:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);try{await page.waitForFunction(()=>window.__galleryRenderedFrames>0,{},{timeout:20000});}catch(e){throw Error(e.message+' '+JSON.stringify(errors));}
  await page.evaluate(()=>{__qa.model.demoArrange('sort');Object.assign(__qa.model.state.camera,{x:836,y:470.5,zoom:1});__qa.constrain();__qa.update();});await page.waitForTimeout(120);
  await page.screenshot({path:path.join(out,name+'-sorted.png')});
  const sorted=await page.evaluate(()=>({total:GalleryModel.TOTAL,collections:GalleryModel.SERIES.length,sorted:__qa.model.state.books.every(b=>b.place==='shelf'&&b.slot===b.id),valid:GalleryModel.Gallery.valid(__qa.model.state),graphics:__galleryGraphics}));assert.ok(sorted.sorted&&sorted.valid);
  const first=await page.evaluate(()=>__galleryRenderedFrames);await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>__galleryRenderedFrames),first,'Atmosphere redrew the full book scene');
  const glows=await page.locator('.ambience').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;});assert.ok(glows>0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(120);assert.ok(await page.locator('.ambience').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.every(x=>x===0)));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{__qa.model.demoArrange('scatter');__qa.update();});await page.waitForTimeout(120);await page.screenshot({path:path.join(out,name+'-scattered.png')});
  assert.deepEqual(errors,[]);result.push({name,width,height,...sorted,ambientPixels:glows,idleBookFrames:0,reducedMotionVerified:true,errors});await page.close();
 }
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

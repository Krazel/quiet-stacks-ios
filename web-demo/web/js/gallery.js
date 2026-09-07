(() => {
  'use strict';
  const {Gallery,SERIES,SLOTS,RACKS,TOTAL,CART_CAPACITY,floorAllowed,details,BINDINGS}=GalleryModel, model=new Gallery();
  const $=id=>document.getElementById(id);let canvas=$('scene'),gpu;
  try{gpu=window.GalleryGpu?.create(canvas,requestDraw);}catch(error){const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;console.warn('Using Canvas fallback:',error.message);}
  const ctx=gpu?null:canvas.getContext('2d');
  const W=1672,H=941,KEY='quiet-stacks.gallery.v4',clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let width=1,height=1,dpr=1,base=1,selected=null,series=0,ready=false,restored=false,noticeTimer,saveTimer,storageWarning=false;
  let gesture=null,pinch=null,suppressTap=false,dragPoint=null,framePending=false;
  const visualCache=new Map();let cachedState,cachedOrder=-1,sortedBooks=[],cartBooks=[];
  function requestDraw(){if(!framePending){framePending=true;requestAnimationFrame(frame);}}
  const pointers=new Map();let profiler=null,autoTesting=false,perfMeasuring=false,perfBookCount=0;
  const packed=window.GalleryPacked,packedImages=packed?packed.pages.map(()=>new Image()):[];
  let expectedImages=11+GalleryModel.COLLECTION_ATLASES.length+GalleryVolumes.atlases.length;
  const volumeImages=GalleryVolumes.atlases.map(()=>new Image()),volumeAtlases=[...volumeImages];
  const nameplateImage=new Image(),repairImage=new Image();let room;const collectionImages=GalleryModel.COLLECTION_ATLASES.map(()=>new Image()),collectionAtlases=[...collectionImages];
  const background=new Image(),atlasImage=new Image(),floorImage=new Image(),directionsImage=new Image();const openImage=new Image();let openAtlas=openImage;const turnImage=new Image(),bindingImages=[new Image(),new Image(),new Image()];let turnAtlas=turnImage,bindingAtlases=[...bindingImages],directionsAtlas=directionsImage,floorAtlas=floorImage,atlas=atlasImage,loadedImages=0;
  const FLOOR_SPRITES=[[148,190,350,276],[596,194,352,275],[1057,183,340,280],[145,550,355,307],[589,561,335,296],[1042,559,355,297]];
  const DIRECTION_SPRITES=[[76,65,226,189],[414,109,239,130],[736,62,283,206],[75,299,227,192],[411,345,242,131],[735,299,285,206],[76,536,226,196],[412,583,241,133],[735,538,285,207],[75,777,227,197],[410,825,243,127],[735,778,285,209],[78,1009,222,188],[409,1054,238,129],[734,1005,281,209],[77,1227,223,186],[408,1278,235,127],[734,1228,280,207]];
  const BINDING_SPRITES=[[[24,93,180,180],[232,93,181,184],[437,94,178,183],[641,94,176,180],[844,93,177,182],[1048,93,175,184],[31,353,168,165],[235,357,163,163],[449,352,161,169],[642,356,164,170],[852,359,166,164],[1053,354,169,174],[76,582,64,212],[279,582,66,212],[478,582,64,212],[685,582,65,212],[893,582,59,212],[1094,582,62,212],[22,983,162,213],[229,983,163,213],[434,983,165,213],[637,984,163,212],[843,984,163,212],[1049,984,175,212]],[[26,87,192,201],[238,87,187,198],[438,89,180,195],[648,89,184,196],[855,89,180,198],[1048,91,177,195],[32,342,188,181],[244,341,181,180],[451,341,174,181],[662,340,179,183],[869,340,176,183],[1055,342,173,183],[87,568,54,222],[292,568,53,222],[494,568,54,222],[699,568,54,222],[906,568,54,222],[1096,568,56,222],[42,968,156,228],[246,968,157,229],[449,968,156,229],[648,968,160,229],[853,969,157,228],[1051,969,156,228]],[[20,96,187,174],[233,96,184,174],[439,96,184,174],[640,98,181,175],[843,98,181,175],[1045,96,182,176],[33,352,174,174],[240,353,173,175],[445,354,173,176],[649,355,172,176],[854,357,170,174],[1056,357,169,174],[78,593,54,174],[283,593,53,174],[490,593,53,174],[699,593,51,174],[901,593,53,174],[1108,593,53,174],[24,994,147,204],[238,994,145,204],[439,993,150,205],[649,994,151,205],[859,994,147,204],[1070,994,141,204]]];
  const TURN_SPRITES=[[136,135,336,298],[592,138,327,295],[1052,132,331,302],[141,556,333,308],[595,558,322,306],[1052,555,328,309]];
  const OPEN_SPRITES=[[65,180,455,285],[552,180,452,285],[1030,180,455,285],[65,556,455,286],[552,556,452,286],[1030,556,455,286]];
  const SYMBOLS=['☾','❧','◇','♜','✿','✧'];
  const floorVariant=b=>SERIES[b.series].art<6?(b.id%19===0?3:(Math.imul(b.id+1,2654435761)>>>0)%3):(Math.imul(b.id+1,2654435761)>>>0)%2;
  const floorSprite=b=>bookVisual(b,0).source;
  function originalBookVisual(b,view){if(view===1){const v=GalleryVolumes.bindings[SERIES[b.series].art][b.volume-1];return {image:volumeAtlases[v.atlas],source:v.source};}const art=SERIES[b.series].art,v=floorVariant(b);if(view===0&&v===3)return {image:openAtlas,source:OPEN_SPRITES[art]};if(art>=24){const group=Math.floor((art-24)/6),sheet=GalleryModel.COLLECTION_ATLASES[group],col=(art-24)%6,row=view===0?v:view===1?2:3;return {image:collectionAtlases[group],source:sheet.sprites[row*sheet.columns+col]};}if(art>=6){const group=Math.floor(art/6)-1,col=art%6,row=view===0?v:view===1?2:3;return {image:bindingAtlases[group],source:BINDING_SPRITES[group][row*6+col]};}if(view!==0)return {image:atlas,source:SPRITES[(view-1)*6+art]};return v===2?{image:turnAtlas,source:TURN_SPRITES[art]}:v?{image:directionsAtlas,source:DIRECTION_SPRITES[art*3+v-1]}:{image:floorAtlas,source:FLOOR_SPRITES[art]};}
  function bookVisual(b,view){const key=b.id*3+view;if(visualCache.has(key))return visualCache.get(key);const visual=originalBookVisual(b,view);if(!packed){visualCache.set(key,visual);return visual;}
    const crop=packed.sprites[visual.image.assetFile+'|'+visual.source.join(',')];
    if(!crop)throw new Error('Missing packed book artwork');
    const result={image:packedImages[crop.page],source:crop.source};visualCache.set(key,result);return result;
  }
  const SPRITES=[[106,327,75,237],[346,329,77,235],[576,329,87,233],[813,329,87,233],[1046,327,63,235],[1250,327,75,233],[60,788,159,225],[296,788,163,225],[530,782,179,235],[777,782,169,233],[1016,794,123,223],[1216,782,171,233]];
  for(const key of [KEY,KEY+'.backup','quiet-stacks.gallery.v3','quiet-stacks.gallery.v3.backup','quiet-stacks.gallery.v2','quiet-stacks.gallery.v2.backup']){try{if(model.restore(JSON.parse(localStorage.getItem(key)))){restored=true;break;}}catch{}}
  const camera=()=>model.state.camera;
  const scale=()=>base*camera().zoom;
  const world=p=>({x:(p.x-width/2)/scale()+camera().x,y:(p.y-height/2)/scale()+camera().y});
  const screen=p=>({x:(p.x-camera().x)*scale()+width/2,y:(p.y-camera().y)*scale()+height/2});
  const local=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const slotPoint=i=>({x:SLOTS[i].x,y:SLOTS[i].y});
  function pointFor(b){if(b.place==='shelf')return slotPoint(b.slot);if(b.place==='cart'){refreshOrder();const i=cartBooks.indexOf(b);return {x:811+i%6*14,y:i<6?500:529};}return {x:b.x,y:b.y};}
  function constrain(){requestDraw();const c=camera(),s=scale(),hx=width/(2*s),hy=height/(2*s);c.x=clamp(c.x,Math.min(W/2,Math.max(0,hx-60/s)),Math.max(W/2,Math.min(W,W-hx+60/s)));c.y=clamp(c.y,Math.min(H/2,Math.max(0,hy-90/s)),Math.max(H/2,Math.min(H,H-hy+(width<600?180:140)/s)));}
  function resize(){width=canvas.clientWidth||innerWidth;height=canvas.clientHeight||innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);base=Math.min(width/W,height/H);constrain();}
  function say(message){$('notice').textContent=message;$('notice').classList.remove('quiet');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').classList.add('quiet'),6500);}
  function save(){if(autoTesting)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{const data=JSON.stringify(model.state),previous=localStorage.getItem(KEY);if(previous){try{if(Gallery.valid(JSON.parse(previous)))localStorage.setItem(KEY+'.backup',previous);}catch{}}localStorage.setItem(KEY,data);}catch{if(!storageWarning){storageWarning=true;say('Storage is unavailable. You can still play in this session.');}}},200);}
  function select(id,inspect=true){selected=id;const b=model.book(id);if(b)series=b.series;update();if(inspect&&b)showInspection(b);}
  function update(){requestDraw();const b=model.book(selected);$('selection').hidden=!b||!$('inspection').hidden;const info=SERIES[b?b.series:series];$('selected-title').textContent=b?details(b.id).title:'';$('selected-detail').textContent=b?info.category+' '+b.volume+' · '+info.name:'';if(b&&ready){const icon=$('cover'),ic=icon.getContext('2d'),v=bookVisual(b,2),r=v.source,f=Math.min(96/r[2],136/r[3]);ic.clearRect(0,0,100,140);ic.drawImage(v.image,...r,(100-r[2]*f)/2,(140-r[3]*f)/2,r[2]*f,r[3]*f);}
    const trolley=model.cart();$('cart-section').hidden=!trolley.length;$('cart-label').textContent='On the trolley · '+trolley.length+(trolley.length===1?' book':' books');const items=$('cart-items');items.replaceChildren();for(const item of model.cart()){const button=document.createElement('button');button.textContent=BINDINGS[SERIES[item.series].art].icon;button.style.background=SERIES[item.series].color;button.title=details(item.id).title;button.setAttribute('aria-label','On the trolley: '+button.title+' · Volume '+item.volume);button.setAttribute('aria-pressed',String(selected===item.id));button.onclick=()=>select(item.id);items.append(button);}}
  function moveTo(id,place,slot=-1,p){if(!model.move(id,place,slot,p)){say(place==='cart'?'The trolley is full.':'That space is occupied.');return false;}const b=model.book(id);selected=id;series=b.series;save();update();return true;}
  function zoom(factor,anchor={x:width/2,y:height/2}){if(autoTesting)return;const before=world(anchor),c=camera();c.zoom=clamp(c.zoom*factor,1,8);c.x=before.x-(anchor.x-width/2)/scale();c.y=before.y-(anchor.y-height/2)/scale();constrain();save();}
  function bookRect(b,p=pointFor(b),held=false){
    const floor=b.place==='floor'||held,source=bookVisual(b,floor?0:1).source;
    const collection=SERIES[b.series],factor=b.place==='cart'?25/collection.bookHeight:1;
    const w=floor?details(b.id).width*(floorVariant(b)===3?1.45:1):collection.bookWidth*factor;
    const h=floor?w*source[3]/source[2]:collection.bookHeight*factor;
    return {x:p.x-w/2,y:p.y-h,w,h,view:floor?0:1};
  }
  function refreshOrder(){
    if(cachedState===model.state&&cachedOrder===model.state.nextOrder)return;
    cachedState=model.state;cachedOrder=model.state.nextOrder;
    cartBooks=model.cart();
    sortedBooks=[...model.state.books].sort((a,b)=>{
      if(a.place==='floor'&&b.place==='floor')return a.order-b.order;
      return (a.place==='floor'?1:0)-(b.place==='floor'?1:0)||pointFor(a).y-pointFor(b).y||a.order-b.order;
    });
  }
  function orderedBooks(){refreshOrder();return sortedBooks;}
  function hitBook(p){let nearest,dist=Infinity;const books=orderedBooks().slice().reverse(),margin=Math.min(18,12/scale());
    const chosen=model.book(selected);if(chosen){const r=bookRect(chosen),q=p;if(q.x>=r.x&&q.x<=r.x+r.w&&q.y>=r.y&&q.y<=r.y+r.h)return chosen;}
    for(const b of books){const r=bookRect(b),q=p,dx=Math.max(r.x-q.x,0,q.x-r.x-r.w),dy=Math.max(r.y-q.y,0,q.y-r.y-r.h);
      if(!dx&&!dy)return b;const d=Math.hypot(dx,dy);if(d<margin&&d<dist){nearest=b;dist=d;}}return nearest;}
  const hitSlot=GalleryModel.slotAt;
  const onCart=GalleryModel.cartHit;
  function tap(p){const b=hitBook(p),slot=hitSlot(p);
    if(b){select(b.id);return;}
    if(selected!==null&&slot>=0){moveTo(selected,'shelf',slot);return;}
    if(onCart(p)){if(selected!==null)moveTo(selected,'cart');else if(model.cart().length)select(model.cart()[0].id);return;}
    if(slot>=0)return;
    if(selected!==null&&floorAllowed(p)){moveTo(selected,'floor',-1,p);return;}selected=null;update();
  }
  function pinchStart(){const [a,b]=[...pointers.values()];pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),anchor:world({x:(a.x+b.x)/2,y:(a.y+b.y)/2}),zoom:camera().zoom};gesture=null;dragPoint=null;suppressTap=true;}
  canvas.addEventListener('pointerdown',e=>{if(!ready||autoTesting||e.button>0)return;profiler?.input('pointerdown');canvas.setPointerCapture(e.pointerId);const p=local(e);pointers.set(e.pointerId,p);if(pointers.size===2){pinchStart();return;}if(pointers.size>2)return;const b=hitBook(world(p));gesture={start:p,last:p,id:b?.id,moved:false};canvas.classList.add('grabbing');});
  canvas.addEventListener('pointermove',e=>{if(autoTesting||!pointers.has(e.pointerId))return;profiler?.input('pointermove');requestDraw();const p=local(e);pointers.set(e.pointerId,p);if(pointers.size>=2&&pinch){const [a,b]=[...pointers.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};camera().zoom=clamp(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance,1,8);camera().x=pinch.anchor.x-(mid.x-width/2)/scale();camera().y=pinch.anchor.y-(mid.y-height/2)/scale();constrain();return;}if(suppressTap||!gesture)return;const g=gesture;if(!g.moved&&Math.hypot(p.x-g.start.x,p.y-g.start.y)>7){g.moved=true;if(g.id!==undefined){$('inspection').hidden=true;select(g.id,false);}}if(g.moved){if(g.id!==undefined){$('inspection').hidden=true;selected=g.id;series=model.book(g.id).series;dragPoint=world(p);}else{camera().x-=(p.x-g.last.x)/scale();camera().y-=(p.y-g.last.y)/scale();constrain();}}g.last=p;});
  function endPointer(e,cancel=false){if(autoTesting||!pointers.has(e.pointerId))return;profiler?.input('pointerup');const p=world(local(e)),g=gesture;pointers.delete(e.pointerId);if(!cancel&&!suppressTap&&g){if(g.moved&&g.id!==undefined){const dropStart=profiler?.active?performance.now():null;const dropped=model.drop(g.id,p);if(dropStart!==null)profiler.drop(performance.now()-dropStart);if(dropped){selected=g.id;series=model.book(g.id).series;save();update();}}else if(!g.moved)tap(p);}gesture=null;dragPoint=null;pinch=null;canvas.classList.remove('grabbing');if(!pointers.size)suppressTap=false;else suppressTap=true;constrain();save();update();}
  canvas.addEventListener('pointerup',e=>endPointer(e));canvas.addEventListener('pointercancel',e=>endPointer(e,true));canvas.addEventListener('lostpointercapture',e=>endPointer(e,true));
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(autoTesting)return;profiler?.input('wheel');zoom(Math.exp(-e.deltaY*.0015),local(e));},{passive:false});

  $('demo-toggle').onclick=()=>{const panel=$('demo-actions');panel.hidden=!panel.hidden;$('demo-toggle').setAttribute('aria-expanded',String(!panel.hidden));};
  for(const [id,mode] of [['demo-sort','sort'],['demo-scatter','scatter']])$(id).onclick=()=>{if(!ready||autoTesting||pointers.size)return;model.demoArrange(mode);selected=null;dragPoint=null;$('inspection').hidden=true;$('demo-actions').hidden=true;$('demo-toggle').setAttribute('aria-expanded','false');save();update();};
  window.addEventListener('keydown',e=>{if(autoTesting||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;profiler?.input('keydown');let handled=true;switch(e.key){case 'Home':camera().zoom=1;camera().x=W/2;camera().y=H/2;break;case '+':case '=':zoom(1.2);break;case '-':zoom(1/1.2);break;case 'ArrowLeft':camera().x-=65/scale();break;case 'ArrowRight':camera().x+=65/scale();break;case 'ArrowUp':camera().y-=65/scale();break;case 'ArrowDown':camera().y+=65/scale();break;case 'Escape':$('demo-actions').hidden=true;$('demo-toggle').setAttribute('aria-expanded','false');$('inspection').hidden=true;selected=null;update();break;default:handled=false;}if(handled){e.preventDefault();constrain();save();}});
  function showInspection(b){
    const d=details(b.id);$('inspection').hidden=false;$('selection').hidden=true;$('inspect-title').textContent=d.title;$('inspect-author').textContent='By '+d.author;$('inspect-type').textContent=d.type;$('inspect-category').textContent=d.category+' '+d.volume;$('inspect-collection').textContent=d.collection;$('inspect-volume').textContent='Volume '+d.volume+' of '+d.total;$('inspect-edition').textContent='Edition '+d.edition+' · Library year '+d.year+' · '+d.binding+' binding';
    const cover=$('inspection-cover'),ic=cover.getContext('2d'),visual=bookVisual(b,2),source=visual.source;ic.clearRect(0,0,220,260);ic.imageSmoothingEnabled=false;const factor=Math.min(176/source[2],225/source[3]),w=source[2]*factor,h=source[3]*factor;ic.drawImage(visual.image,...source,(220-w)/2,(260-h)/2,w,h);
  }
  function closeInspection(){$('inspection').hidden=true;update();canvas.focus?.({preventScroll:true});}
  $('inspect-close').onclick=closeInspection;
  $('inspect-pickup').onclick=closeInspection;
  let visibleBounds;
  function bookArt(b,p,held=false){const r=bookRect(b,p,held);
    if(r.x+r.w<visibleBounds.left||r.x>visibleBounds.right||r.y+r.h<visibleBounds.top||r.y>visibleBounds.bottom)return;
    if(perfMeasuring)perfBookCount++;const visual=bookVisual(b,r.view),source=visual.source;/* Preserve the painted ground plane and native aspect ratio. */if(gpu)gpu.draw(visual.image,source,r);else ctx.drawImage(visual.image,...source,r.x,r.y,r.w,r.h);
  }
  function frame(time){framePending=false;if(!ready)return;perfMeasuring=!!profiler?.active;perfBookCount=0;const perfStart=perfMeasuring?performance.now():0;const s=scale(),c=camera(),held=model.book(selected);
    if(gpu){if(!gpu.begin(width,height,dpr,s,c))return;gpu.draw(room,[0,0,W,H],{x:0,y:0,w:W,h:H},true);for(const plate of GalleryRoom.NAMEPLATES){const [cx,cy]=plate.center,w=plate.width,h=w*plate.source[3]/plate.source[2];gpu.draw(nameplateImage,plate.source,{x:cx-w/2,y:cy-h/2,w,h},false,2.6);}}
    else{ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#17120e';ctx.fillRect(0,0,width,height);ctx.translate(width/2-c.x*s,height/2-c.y*s);ctx.scale(s,s);ctx.imageSmoothingEnabled=false;ctx.drawImage(room,0,0,W,H);GalleryRoom.drawNameplates(ctx,nameplateImage);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';}const perfRoomEnd=perfMeasuring?performance.now():0;
    const hx=width/(2*s),hy=height/(2*s),margin=2/s;visibleBounds={left:c.x-hx-margin,right:c.x+hx+margin,top:c.y-hy-margin,bottom:c.y+hy+margin};
    for(const b of orderedBooks()){if(b.id!==selected)bookArt(b,pointFor(b));}
    if(held)bookArt(held,dragPoint||pointFor(held),!!dragPoint);
    gpu?.end();window.__galleryGraphics=gpu?gpu.stats():{backend:'canvas2d'};
    if(perfMeasuring){const end=performance.now();profiler.frame({total:end-perfStart,room:perfRoomEnd-perfStart,books:end-perfRoomEnd,count:perfBookCount});}perfMeasuring=false;
    window.__galleryRenderedFrames=(window.__galleryRenderedFrames||0)+1;
    if(window.__galleryRenderedFrames===1){if(window.GalleryDiagnostics)GalleryDiagnostics.ready();else window.webkit?.messageHandlers?.galleryStatus?.postMessage('ready');}
  }
  const imageLoaded=()=>{loadedImages++;if(loadedImages<expectedImages)return;visualCache.clear();room=GalleryRoom.compose(background,repairImage);ready=true;$('loading').hidden=true;resize();if(!restored&&width<600)camera().zoom=Math.max(1.12,(height*.7)/(H*base));constrain();update();};
  const imageError=(error)=>{window.GalleryDiagnostics?.report('asset-error',{message:error?.message||error?.name||'Image did not load',asset:error?.target?.assetFile||error?.target?.src});console.error("Gallery asset error",error?.name||"ImageError",error?.message||error?.target?.src||"Unknown image error");$('loading').querySelector('h2').textContent='The gallery could not load.';$('loading').querySelector('p').textContent='Please try loading the room again.';$('retry').hidden=false;};
  let loadGeneration=0,textureBusy=false;
  const textureQueue=[];
  function nextTexture(){
    if(textureBusy||!textureQueue.length)return;
    const job=textureQueue.shift();textureBusy=true;
    const finish=(resource)=>{
      if(job.generation!==loadGeneration){resource?.close?.();return;}
      job.assign(resource);
      // ImageBitmap owns the pixels now; release the source image decoder too.
      if(resource!==job.image&&typeof resource.close==='function'){
        job.image.onload=null;job.image.onerror=null;job.image.src='';
      }
      imageLoaded();
    };
    const failed=error=>{if(job.generation===loadGeneration)imageError(error);};
    const done=()=>{textureBusy=false;nextTexture();};
    try{
      const result=GalleryTextures.importAtlas(job.image,job.black);
      if(result&&typeof result.then==='function')result.then(finish).catch(failed).finally(done);
      else{finish(result);done();}
    }catch(error){failed(error);done();}
  }
  function loadAssets(){
    gpu?.reset();
    ready=false;loadedImages=0;window.__galleryRenderedFrames=0;const generation=++loadGeneration;textureQueue.length=0;
    expectedImages=packed?packed.pages.length+3:11+collectionImages.length+volumeImages.length;
    const pending=[];
    $('retry').hidden=true;$('loading').hidden=false;
    $('loading').querySelector('h2').textContent='Opening the gallery…';
    $('loading').querySelector('p').textContent='A quiet moment among the books.';
    for(const resource of [atlas,floorAtlas,directionsAtlas,turnAtlas,openAtlas,...bindingAtlases,...collectionAtlases,...volumeAtlases])resource?.close?.();
    const watch=(img,file,assign,black=false)=>{
      img.assetFile=file;
      if(packed&&assign)return;
      if(packed){pending.push({img,file});return;}
      img.onerror=error=>{if(generation===loadGeneration)imageError(error);};
      img.onload=()=>{
        if(generation!==loadGeneration)return;
        if(assign){textureQueue.push({image:img,assign,black,generation});nextTexture();}
        else imageLoaded();
      };
      img.crossOrigin='anonymous';img.src=file+'?v=162';
    };
    volumeImages.forEach((img,i)=>watch(img,GalleryVolumes.atlases[i].file,value=>volumeAtlases[i]=value,true));
    watch(nameplateImage,'assets/nameplates-v14.png');watch(repairImage,'assets/gallery-repair-v13.png');
    collectionImages.forEach((img,i)=>watch(img,GalleryModel.COLLECTION_ATLASES[i].file,value=>collectionAtlases[i]=value,true));
    watch(openImage,'assets/books-open-v12.png',value=>openAtlas=value);
    watch(background,'assets/gallery-empty.png');
    watch(atlasImage,'assets/books-varied-v9.png',value=>atlas=value);
    watch(floorImage,'assets/books-floor-v6.png',value=>floorAtlas=value);
    watch(directionsImage,'assets/books-directions-v7.png',value=>directionsAtlas=value);
    watch(turnImage,'assets/books-turn-v8.png',value=>turnAtlas=value);
    bindingImages.forEach((img,i)=>watch(img,'assets/bindings-'+['b','c','d'][i]+'-v9.png',value=>bindingAtlases[i]=value));
    if(packed){
      packedImages.forEach((img,i)=>pending.push({img,file:packed.pages[i].file}));
      // Decode one final PNG at a time. No canvas readback or atlas conversion on device.
      const next=()=>{if(generation!==loadGeneration||!pending.length)return;const {img,file}=pending.shift();
        img.onload=()=>{if(generation!==loadGeneration)return;window.GalleryDiagnostics?.report('asset-loaded',{asset:file,loaded:loadedImages+1,total:expectedImages});imageLoaded();next();};
        img.onerror=imageError;img.assetFile=file;window.GalleryDiagnostics?.report('asset-request',{asset:file,loaded:loadedImages,total:expectedImages});img.crossOrigin='anonymous';img.src=file+'?v=163';};next();
    }
  }
  if(window.GalleryPerformance){
    let dropModel;
    profiler=GalleryPerformance.attach({
      ready:()=>ready&&!pointers.size,
      environment:()=>({viewport:{width,height,dpr},canvas:{width:canvas.width,height:canvas.height},graphics:window.__galleryGraphics,zoom:camera().zoom,totalBooks:TOTAL,
        placements:{floor:model.state.books.filter(b=>b.place==='floor').length,shelf:model.state.books.filter(b=>b.place==='shelf').length,cart:model.cart().length},
        decodedImageEstimateMiB:Math.round([...packedImages,background,repairImage,nameplateImage].reduce((n,i)=>n+(i.naturalWidth||0)*(i.naturalHeight||0)*4,0)/1048576*100)/100,userAgent:navigator.userAgent||'unknown'}),
      begin(){clearTimeout(saveTimer);const snapshot={state:JSON.parse(JSON.stringify(model.state)),selected,series,inspectionHidden:$('inspection').hidden};try{localStorage.setItem(KEY,JSON.stringify(snapshot.state));}catch{}autoTesting=true;$('gallery').inert=true;$('inspection').hidden=true;return snapshot;},
      restore(snapshot){try{if(!model.restore(snapshot.state))throw Error('Performance snapshot restore failed');selected=snapshot.selected;series=snapshot.series;dragPoint=null;cachedState=null;$('inspection').hidden=snapshot.inspectionHidden;}finally{autoTesting=false;$('gallery').inert=false;update();constrain();}},
      setup(name){if(name==='manual-play')return;selected=null;dragPoint=null;if(name==='shelves')model.demoArrange('sort');Object.assign(camera(),{x:836,y:470,zoom:name==='drag'?2.2:1.2});constrain();},
      animate(name,t){
        const c=camera();if(name==='zoom'){c.zoom=1.2+2.8*(.5-.5*Math.cos(t*Math.PI*2));c.x=836;c.y=470;}
        else if(name==='drag'){selected=(model.state.books.find(b=>b.place==='floor')||model.state.books[0]).id;dragPoint={x:836+Math.sin(t*Math.PI*4)*140,y:470+Math.cos(t*Math.PI*4)*80};}
        else{c.x=836+Math.sin(t*Math.PI*2)*140;c.y=470+Math.cos(t*Math.PI*2)*60;}constrain();
      },
      dropNames:['clear-floor','table','lamp','shelf-left','shelf-right','map-corner','full-trolley'],
      dropCase(name){if(!dropModel)dropModel=new Gallery();dropModel.demoArrange('sort');if(name==='full-trolley')for(let id=0;id<CART_CAPACITY;id++)dropModel.move(id,'cart');
        const point={'clear-floor':{x:836,y:350},table:{x:826,y:665},lamp:{x:443,y:878},'shelf-left':{x:395,y:480},'shelf-right':{x:1200,y:500},'map-corner':{x:0,y:0},'full-trolley':{x:843,y:505}}[name];
        const start=performance.now(),target=dropModel.nearestDrop(524,point),ms=performance.now()-start;return {name,ms:Math.round(ms*100)/100,target:target?.place||null};}
    });
  }
  $('retry').onclick=loadAssets;loadAssets();
  window.addEventListener('pageshow',requestDraw);window.addEventListener('resize',resize);window.addEventListener('pagehide',()=>{try{localStorage.setItem(KEY,JSON.stringify(model.state));}catch{}});resize();update();requestDraw();
})();

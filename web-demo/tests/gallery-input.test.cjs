const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function harness(width=1440,height=810,initial,importAtlas=image=>image){
  const elements=new Map(),events=new Map(),timers=new Map(),data=new Map(initial),registered=new Map();let frame,live,clock=0;const signDraws=[],draws=[],rotations=[],texts=[],strokes=[];
  const ctx=new Proxy({strokeRect(...args){strokes.push(args);},fillText(text){texts.push(String(text));},rotate(angle){rotations.push(angle);},drawImage(...args){(args[0]?._src?.includes('nameplates')?signDraws:draws).push(args); }},{get:(o,k)=>o[k]??((...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),'Non-finite canvas '+k);})});
  class Element{constructor(){this.listeners={};this.children=[];this.value='';this.textContent='';this.style={};this.classList={add(){},remove(){}};this.dataset={};this.tagName='CANVAS';this.clientWidth=width;this.clientHeight=height;this.sub=new Map();}getBoundingClientRect(){return {left:0,top:0,width,height};}getContext(){return ctx;}setPointerCapture(){}addEventListener(k,f){this.listeners[k]=f;}setAttribute(k,v){this[k]=v;}replaceChildren(){this.children=[];this.value='';}append(x){this.children.push(x);if(!this.value)this.value=x.value;}querySelector(k){if(!this.sub.has(k))this.sub.set(k,new Element());return this.sub.get(k);}click(){this.onclick?.();}showModal(){this.open=true;}close(){this.open=false;}}
  const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
  const sandbox={console,innerWidth:width,innerHeight:height,devicePixelRatio:2,Image:class{set src(v){this._src=v;this.onload?.();}},matchMedia:()=>({matches:false}),setTimeout:f=>{const id=timers.size+1;timers.set(id,f);return id;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:f=>{frame=f;},localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},document:{getElementById:get,createElement:()=>new Element(),querySelectorAll:()=>[],querySelector:()=>null},navigator:{modelContext:{registerTool:t=>registered.set(t.name,t)}},addEventListener:(k,f)=>events.set(k,f)};
  sandbox.GalleryVolumes=require('../web/js/gallery-volumes.js');sandbox.GalleryRoom={compose:image=>image,drawNameplates:require('../web/js/gallery-room.js').drawNameplates};sandbox.GalleryTextures={importAtlas};sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../web/js/gallery-model.js'),'utf8'),sandbox);
  const Base=sandbox.GalleryModel.Gallery;sandbox.GalleryModel.Gallery=class extends Base{constructor(){super();live=this;}};
  get('demo-actions').hidden=true;vm.runInContext(fs.readFileSync(path.join(__dirname,'../web/js/gallery.js'),'utf8'),sandbox);
  const state=()=>JSON.parse(JSON.stringify(live.state)),screen=([x,y])=>{const c=live.state.camera,s=Math.min(width/1672,height/941)*c.zoom;return [(x-c.x)*s+width/2,(y-c.y)*s+height/2];};
  const pointer=(type,p,id=1)=>get('scene').listeners[type]({pointerId:id,button:0,clientX:p[0],clientY:p[1]});
  const tap=p=>{pointer('pointerdown',p);pointer('pointerup',p);};
  return {state,screen,pointer,tap,get,live,data,events,registered,signDraws,draws,rotations,texts,strokes,slots:sandbox.GalleryModel.SLOTS,advance:()=>{for(let t=0;t<18;t++){clock+=33;frame(clock);}}};
}


test('manual gallery loads all books at desktop and touch dimensions',()=>{for(const [w,h] of [[1440,810],[390,844]]){const t=harness(w,h);t.advance();assert.equal(t.get('loading').hidden,true);assert.equal(t.state().books.length,525);assert.ok(t.draws.length>=525);assert.equal(t.get('selection').hidden,true);}});

test('every shelf book renders its own numbered artwork after changing bays',()=>{
 const {SERIES}=require('../web/js/gallery-model.js'),{atlases,bindings}=require('../web/js/gallery-volumes.js'),t=harness();t.live.demoArrange('sort');
 t.live.move(524,'floor',-1,{x:860,y:250});t.live.move(0,'shelf',524);t.live.move(524,'shelf',0);t.draws.length=0;t.advance();
 const rendered=t.draws.filter(d=>d.length===9).slice(0,525);
 for(const b of t.state().books){const s=t.slots[b.slot],v=bindings[SERIES[b.series].art][b.volume-1],d=rendered.find(d=>Math.abs(d[5]+d[7]/2-s.x)<1e-8&&Math.abs(d[6]+d[8]-s.y)<1e-8);assert.ok(d);assert.ok(d[0]._src.startsWith(atlases[v.atlas].file));assert.deepEqual(d.slice(1,5),v.source);}
 assert.deepEqual(t.texts,[]);assert.equal(t.strokes.length,0);t.events.get('pagehide')();assert.deepEqual(harness(1440,810,t.data).state().books,t.state().books);
});

test('engraved volumes follow only Moon Phases identities and never appear on loose books',()=>{
  const t=harness(),numbered=()=>t.draws.filter(d=>d[0]._src.includes('moon-volumes-v15'));
  t.advance();assert.equal(numbered().length,0);
  t.live.demoArrange('sort');t.draws.length=0;t.advance();const spines=numbered().slice(0,4);
  assert.equal(spines.length,4);assert.equal(new Set(spines.map(d=>d[1])).size,4);
  assert.equal(numbered().length,t.draws.filter(d=>d.length===5).length*4);
  t.live.move(3,'floor',-1,{x:860,y:250});t.live.move(0,'shelf',3);
  t.draws.length=0;t.advance();const moved=numbered().find(d=>d[5]===t.slots[3].x-5.5);
  assert.equal(moved[1],spines[0][1]);assert.deepEqual(t.texts,[]);assert.equal(t.strokes.length,0);
  t.events.get('pagehide')();assert.deepEqual(harness(1440,810,t.data).state().books,t.state().books);
});
test('drag updates the identity and volume before release without moving the saved book',()=>{const t=harness(),b=t.state().books.at(-1),a=t.screen([b.x,b.y-14]),p=[a[0]+30,a[1]-20],before=t.state().books;t.pointer('pointerdown',a);t.pointer('pointermove',p);assert.equal(t.get('selection').hidden,false);assert.match(t.get('selected-title').textContent,/./);assert.match(t.get('selected-detail').textContent,new RegExp(' '+b.volume+' · '));assert.deepEqual(t.state().books,before);t.advance();assert.equal(t.strokes.length,0);t.pointer('pointercancel',p);assert.deepEqual(t.state().books,before);});
test('manual drag places the exact book and reload preserves it',()=>{const t=harness(),b=t.state().books.at(-1),slot=t.slots[b.id];t.pointer('pointerdown',t.screen([b.x,b.y-14]));t.pointer('pointermove',t.screen([slot.x,slot.y-15]));t.pointer('pointerup',t.screen([slot.x,slot.y-15]));assert.equal(t.state().books[b.id].slot,b.id);t.advance();assert.equal(t.strokes.length,0);t.events.get('pagehide')();assert.deepEqual(harness(1440,810,t.data).state().books,t.state().books);});
test('pinch on a book changes camera without moving the book',()=>{const t=harness(390,844),b=t.state().books.at(-1),p=t.screen([b.x,b.y-14]),before=t.state();t.pointer('pointerdown',p,1);t.pointer('pointerdown',[p[0]+80,p[1]],2);t.pointer('pointermove',[p[0]+120,p[1]],2);t.pointer('pointerup',[p[0]+120,p[1]],2);t.pointer('pointerup',p,1);assert.deepEqual(t.state().books,before.books);assert.ok(t.state().camera.zoom>before.camera.zoom);});
test('painted scene labels do not draw overlaid text or targets',()=>{const t=harness();t.live.state.camera.zoom=8;t.advance();assert.deepEqual(t.texts,[]);assert.ok(t.signDraws.length>=8);assert.ok(t.signDraws.every(d=>d[3]===704&&d[3]>d[7]*3));assert.equal(t.strokes.length,0);const b=t.state().books.at(-1);t.tap(t.screen([b.x,b.y-14]));t.strokes.length=0;t.advance();assert.equal(t.strokes.length,0);assert.equal(t.get('notice').textContent,'');});
test('removed aids and orientation controls have no callbacks or keyboard actions',()=>{const t=harness();for(const id of ['find','gather','shelve','rotate','undo','help','books-button','place','inspect-button'])assert.equal(t.get(id).onclick,undefined);assert.equal(t.registered.size,0);const before=t.state().books;for(const key of ['r','R','z','Z'])t.events.get('keydown')({key,target:{tagName:'CANVAS'},preventDefault(){}});assert.deepEqual(t.state().books,before);});
test('new binding remains the same on shelf and in book information',()=>{const t=harness(),b=t.state().books.find(b=>t.slots[b.id].series===1);t.live.move(b.id,'shelf',b.id);const slot=t.slots[b.id];t.tap(t.screen([slot.x,slot.y-14]));assert.match(t.get('inspect-edition').textContent,/Sun binding/);assert.equal(t.get('inspect-category').textContent,'Astral Charts '+b.volume);const cover=t.draws.at(-1);assert.ok(cover[0]._src.includes('bindings-b-v9'));assert.equal(cover[2],983);});
test('no horizontal shelf assets are rendered and floor art keeps proportions',()=>{const t=harness();t.live.move(0,'shelf',0);t.advance();const books=t.draws.filter(d=>d.length===9);for(const d of books){assert.ok(!(d[0]._src.includes('books-varied')&&d[2]>620&&d[2]<725));assert.ok(!(d[0]._src.includes('bindings-')&&d[2]>860&&d[2]<930));}const floor=books.filter(d=>!d[0]._src.includes('books-varied')&&!d[0]._src.includes('moon-volumes-v15'));for(const d of floor)assert.ok(Math.abs(d[7]/d[8]-d[3]/d[4])<1e-10);assert.deepEqual(t.rotations,[]);});

test('all 525 shelf books share one size and every collection still fits its bay',()=>{
  const {SERIES}=require('../web/js/gallery-model.js'),t=harness();
  for(const b of t.state().books)assert.ok(t.live.move(b.id,'shelf',b.id));
  t.advance();const rendered=t.draws.filter(d=>d.length===9).slice(0,525);
  assert.equal(rendered.length,525);for(const d of rendered)assert.deepEqual(d.slice(7),[11,32]);
  for(const collection of SERIES){
    const slots=t.slots.slice(collection.start,collection.start+collection.count);
    const images=slots.map(slot=>rendered.find(d=>Math.abs(d[5]+d[7]/2-slot.x)<1e-8&&Math.abs(d[6]+d[8]-slot.y)<1e-8));
    assert.ok(images.every(Boolean),collection.name);
    for(const d of images){assert.deepEqual(d.slice(7),images[0].slice(7));assert.ok(d[0]._src.includes('volumes-'));}
    assert.ok(images[0][5]>=collection.left-1e-8);
    assert.ok(images.at(-1)[5]+images.at(-1)[7]<=collection.right+1e-8);
    for(let i=1;i<images.length;i++)assert.ok(images[i-1][5]+images[i-1][7]<=images[i][5]+1e-8);
  }
});
test('book proportions belong to the collection even in another bay or the trolley',()=>{
  const t=harness(),spine=()=>{t.draws.length=0;t.advance();return t.draws.find(d=>d.length===9&&d[0]._src.includes('moon-volumes-v15'));};
  t.live.move(0,'shelf',0);const own=spine();
  t.live.move(0,'shelf',524);const elsewhere=spine();
  assert.deepEqual(own.slice(7),elsewhere.slice(7));
  t.live.move(0,'cart');const cart=spine();
  assert.ok(Math.abs(cart[7]/cart[8]-own[7]/own[8])<1e-10);
});
test('drag accepts both ends of a wide single-volume bay without an outline',()=>{
  const {SERIES}=require('../web/js/gallery-model.js');
  for(const width of [1440,390])for(const edge of ['left','right']){
    const t=harness(width,844),collection=SERIES.find(s=>s.count===1&&s.right-s.left>26),b=t.state().books.at(-1);
    const p=t.screen([collection[edge]+(edge==='left'?.1:-.1),collection.y-15]);
    t.pointer('pointerdown',t.screen([b.x,b.y-14]));t.pointer('pointermove',p);t.advance();
    t.pointer('pointerup',p);t.advance();
    assert.equal(t.state().books[b.id].slot,collection.start);
    assert.equal(t.strokes.length,0);
  }
});

test('dragging onto both desks and newly accessible floor survives reload',()=>{
  for(const dimensions of [[1440,810],[390,844]])for(const destination of [[830,667],[385,884],[272,190],[870,250],[605,500],[794,460]]){
    const t=harness(...dimensions),b=t.state().books.at(-1),p=t.screen(destination);
    t.pointer('pointerdown',t.screen([b.x,b.y-14]));t.pointer('pointermove',p);t.pointer('pointerup',p);
    const placed=t.state().books[b.id];assert.equal(placed.place,'floor');
    assert.ok(Math.abs(placed.x-destination[0])<1e-8);assert.ok(Math.abs(placed.y-destination[1])<1e-8);
    t.events.get('pagehide')();assert.deepEqual(harness(...dimensions,t.data).state().books,t.state().books);
  }
});
test('dropping on solid furniture moves only that book to a nearby valid surface',()=>{
  for(const destination of [[443,878],[740,610],[805,730],[540,635],[870,60]]){
    const t=harness(),b=t.state().books.at(-1),before=t.state().books,p=t.screen(destination);
    t.pointer('pointerdown',t.screen([b.x,b.y-14]));t.pointer('pointermove',p);t.pointer('pointerup',p);
    const placed=t.state().books[b.id];assert.notDeepEqual(placed,before[b.id]);
    assert.ok(t.live.constructor.valid(t.live.state));assert.equal(t.get('notice').textContent,'');
    assert.deepEqual(t.state().books.slice(0,-1),before.slice(0,-1));
  }
});

test('demo controls sort and scatter the whole room and save the result',()=>{
 const t=harness();t.get('demo-toggle').click();assert.equal(t.get('demo-actions').hidden,false);
 t.get('demo-sort').click();assert.ok(t.state().books.every(b=>b.place==='shelf'&&b.slot===b.id));assert.equal(t.get('selection').hidden,true);
 t.get('demo-scatter').click();assert.ok(t.state().books.every(b=>b.place==='floor'));assert.equal(t.live.cart().length,0);
 t.events.get('pagehide')();assert.deepEqual(harness(1440,810,t.data).state().books,t.state().books);
});
test('the selectable icons are explicitly labeled as books on the trolley',()=>{
 const t=harness();t.live.move(0,'cart');t.live.move(1,'cart');const b=t.state().books.at(-1);t.tap(t.screen([b.x,b.y-14]));
 assert.equal(t.get('cart-section').hidden,false);assert.equal(t.get('cart-label').textContent,'On the trolley · 2 books');
 assert.equal(t.get('cart-items').children.length,2);assert.match(t.get('cart-items').children[0]['aria-label'],/^On the trolley:/);
});
test('open books use the new spread atlas and preserve its aspect ratio',()=>{
 const t=harness();t.advance();const open=t.draws.filter(d=>d.length===9&&d[0]._src.includes('books-open-v12'));
 assert.ok(open.length>0);for(const d of open)assert.ok(Math.abs(d[7]/d[8]-d[3]/d[4])<1e-10);
 assert.ok(!t.draws.some(d=>d.length===9&&d[0]._src.includes('books-directions-v7')&&[62,299,538,778,1005,1228].includes(d[2])&&d[1]>700));
});
test('dragging to the highest shelf still targets its visible slot',()=>{
 const t=harness(),b=t.state().books.at(-1),slot=t.slots.find(s=>s.y===48),p=t.screen([slot.x,slot.y-16]);
 t.pointer('pointerdown',t.screen([b.x,b.y-14]));t.pointer('pointermove',p);t.pointer('pointerup',p);
 assert.equal(t.state().books[b.id].slot,slot.id);
});


test('asynchronous texture imports run one at a time and only unlock after all atlases',async()=>{
 let active=0,peak=0,loaded=0,closed=0;
 const t=harness(844,390,undefined,image=>{
   active++;peak=Math.max(peak,active);const src=image._src;
   return Promise.resolve().then(()=>{active--;loaded++;return {_src:src,close(){closed++;}};});
 });
 assert.equal(t.get('loading').hidden,false);
 for(let n=0;n<100&&!t.get('loading').hidden;n++)await new Promise(setImmediate);
 assert.equal(t.get('loading').hidden,true);assert.equal(peak,1);assert.equal(loaded,41);
 t.advance();assert.ok(t.draws.length>=525);
 t.get('retry').click();assert.equal(closed,41);
 for(let n=0;n<100&&!t.get('loading').hidden;n++)await new Promise(setImmediate);
 assert.equal(t.get('loading').hidden,true);assert.equal(loaded,82);assert.equal(peak,1);
});

test('retry ignores an obsolete in-flight bitmap and starts a complete new gallery',async()=>{
 let first=true,release,obsoleteClosed=0;
 const t=harness(844,390,undefined,image=>{
   if(first){first=false;return new Promise(resolve=>{release=()=>resolve({close(){obsoleteClosed++;}});});}
   return Promise.resolve({_src:image._src,close(){}});
 });
 t.get('retry').click();release();
 for(let n=0;n<100&&!t.get('loading').hidden;n++)await new Promise(setImmediate);
 assert.equal(obsoleteClosed,1);assert.equal(t.get('loading').hidden,true);t.advance();assert.ok(t.draws.length>=525);
});

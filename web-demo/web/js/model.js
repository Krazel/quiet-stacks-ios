(function(root){'use strict';
const CATEGORIES=['Nature','Stories','Discovery'];
const SERIES=[['Field Notes','Wild Gardens','Tide & Timber'],['Small Journeys','Evening Tales','The Orchard'],['Night Sky','Curious Things','Ways of Seeing']];
const COLORS=[['#698572','#8e9a6a','#436f68'],['#b16f54','#c69b68','#8e6263'],['#617f93','#8882a0','#bc9958']];
const clone=x=>JSON.parse(JSON.stringify(x));const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
class Library{
 constructor(){this.history=[];this.fresh()}
 fresh(){this.history=[];this.state={version:2,books:{},containers:{},cart:[1140,910],camera:[1000,620],zoom:.6,next_pile:1,moves:0};const s=this.state;
 for(let c=0;c<3;c++)for(let row=0;row<3;row++)for(let bay=0;bay<2;bay++)s.containers[`shelf_${c}_${row}_${bay}`]={kind:'shelf',x:130+c*780+bay*290,y:304+row*137,width:266,category:c,series:row,books:[]};
 for(let n=0;n<2;n++)s.containers[`cart_${n}`]={kind:'cart',x:0,y:n*105,width:250,category:-1,series:-1,books:[]};
 for(const p of [[280,839],[455,839],[680,1070],[915,1240],[1530,980],[1970,1130]])this.createPile(p);
 for(let c=0;c<3;c++)for(let row=0;row<3;row++)for(let v=1;v<=6;v++){const id=`book_${c}_${row}_${v}`;s.books[id]={id,category:c,series:row,volume:v,title:SERIES[c][row],color:COLORS[c][row],width:24+(v*7+row*3)%12,height:83+(v*11+c*5)%27}}
 const ids=Object.keys(s.books);for(let i=0;i<54;i++){const key=i<9?`shelf_${i%3}_${Math.floor(i/3)}_0`:i<15?`cart_${i%2}`:`pile_${1+i%6}`;s.containers[key].books.push(ids[(i*17+7)%54])}return this;
 }
 snapshot(){return clone(this.state)}
 checkpoint(){this.history.push(this.snapshot());if(this.history.length>30)this.history.shift()}
 undo(){if(!this.history.length)return false;const {camera,zoom}=this.state;this.state=this.history.pop();this.state.camera=camera;this.state.zoom=zoom;return true}
 createPile([x,y]){const key=`pile_${this.state.next_pile++}`;this.state.containers[key]={kind:'pile',x:clamp(x,90,2350),y:clamp(y,790,1410),width:135,category:-1,series:-1,books:[]};return key}
 location(id){return Object.keys(this.state.containers).find(k=>this.state.containers[k].books.includes(id))||''}
 origin(key){const c=this.state.containers[key];return c.kind==='cart'?[this.state.cart[0]+20,this.state.cart[1]+c.y]:[c.x,c.y]}
 canPlace(id,key){const b=this.state.books[id],c=this.state.containers[key];if(!b||!c)return false;const others=c.books.filter(x=>x!==id);return c.kind==='pile'?others.length<10:others.reduce((n,x)=>n+this.state.books[x].width+3,b.width)<=c.width}
 move(id,key,index=-1){if(!Number.isInteger(index)||!this.canPlace(id,key))return false;const old=this.location(id);if(!old)return false;this.checkpoint();const s=this.state;s.containers[old].books=s.containers[old].books.filter(x=>x!==id);const target=s.containers[key].books;target.splice(index<0?target.length:clamp(index,0,target.length),0,id);if(old!==key&&s.containers[old].kind==='pile'&&!s.containers[old].books.length)delete s.containers[old];s.moves++;return true}
 floor(id,p){if(!this.state.books[id]||!Array.isArray(p)||!p.every(Number.isFinite)||p[0]<75||p[0]>2425||p[1]<790||p[1]>1450)return false;const before=this.snapshot(),key=this.createPile(p);if(this.move(id,key)){this.history[this.history.length-1]=before;return true}this.state=before;return false}
 moveCart([x,y]){if(!Number.isFinite(x)||!Number.isFinite(y))return false;this.state.cart=[clamp(x,85,2145),clamp(y,810,1280)];return true}
 count(){return Object.values(this.state.containers).filter(c=>c.kind==='shelf').reduce((n,c)=>n+c.books.length,0)}
 rects(){const a=[];for(const [key,c] of Object.entries(this.state.containers)){const [x,y]=this.origin(key);let offset=0;for(const id of c.books){const b=this.state.books[id],flat=c.kind==='pile';a.push({id,key,flat,x:x+(flat?(b.volume%3-1)*5:offset),y:y-(flat?offset+19:b.height),w:flat?110+b.height*.2:b.width,h:flat?19:b.height});offset+=flat?20:b.width+3}}return a}
 containerRect(key){const c=this.state.containers[key],[x,y]=this.origin(key),h=Math.max(60,c.books.length*20+25);return c.kind==='pile'?{x:x-12,y:y-h,w:155,h:h+15}:{x:x-4,y:y-119,w:c.width+8,h:125}}
 indexAt(key,x,held=''){const c=this.state.containers[key];if(c.kind==='pile')return -1;let offset=this.origin(key)[0],index=0;for(const id of c.books){if(id===held)continue;const w=this.state.books[id].width;if(x<offset+w/2)return index;offset+=w+3;index++}return index}
 description(key){const c=this.state.containers[key];return c.kind==='shelf'?`${CATEGORIES[c.category]} / ${SERIES[c.category][c.series]} · ${key.endsWith('_0')?'left':'right'} bay`:c.kind==='cart'?`Cart · ${key==='cart_0'?'upper':'lower'} tray`:`Floor pile ${key.split('_')[1]}`}
 static valid(s){try{if(!s||s.version!==2||!s.books||!s.containers||Array.isArray(s.containers)||Object.keys(s.books).length!==54)return false;const base=new Library().state;
 for(const k of ['cart','camera'])if(!Array.isArray(s[k])||s[k].length!==2||!s[k].every(Number.isFinite))return false;
 if(!Number.isFinite(s.zoom)||s.zoom<.18||s.zoom>3.6||!Number.isInteger(s.moves)||s.moves<0||!Number.isInteger(s.next_pile)||s.next_pile<1)return false;
 if(s.cart[0]<85||s.cart[0]>2145||s.cart[1]<810||s.cart[1]>1280)return false;
 for(const [id,b] of Object.entries(base.books)){if(!s.books[id])return false;for(const field of Object.keys(b))if(s.books[id][field]!==b[field])return false}
 for(const [key,c] of Object.entries(base.containers)){if(c.kind==='pile')continue;for(const f of ['kind','x','y','width','category','series'])if(s.containers[key]?.[f]!==c[f])return false}
 const seen=new Set();for(const [key,c] of Object.entries(s.containers)){if(!c||!['shelf','cart','pile'].includes(c.kind)||!Array.isArray(c.books))return false;for(const f of ['x','y','width','category','series'])if(!Number.isFinite(c[f]))return false;
 if(c.kind==='pile'){if(!/^pile_[1-9]\d*$/.test(key)||Number(key.slice(5))>=s.next_pile||c.books.length>10||c.x<90||c.x>2350||c.y<790||c.y>1410||c.width!==135)return false}else if(!base.containers[key]||base.containers[key].kind!==c.kind)return false;
 let width=-3;for(const id of c.books){if(typeof id!=='string'||!s.books[id]||seen.has(id))return false;seen.add(id);width+=s.books[id].width+3}if(c.kind!=='pile'&&width>c.width)return false}return seen.size===54}catch{return false}}
 restore(s){if(!Library.valid(s))return false;this.state=clone(s);this.history=[];return true}
}
class SaveStore{
 constructor(storage,key='quiet-stacks.web.v2'){this.storage=storage;this.key=key}
 load(model){for(const key of [this.key,this.key+'.backup'])try{const data=JSON.parse(this.storage.getItem(key));if(model.restore(data))return key===this.key?'loaded':'recovered'}catch{}return 'new'}
 save(model){try{const data=JSON.stringify(model.state);if(!Library.valid(model.state))return false;const previous=this.storage.getItem(this.key);if(previous){try{if(Library.valid(JSON.parse(previous)))this.storage.setItem(this.key+'.backup',previous)}catch{}}
 this.storage.setItem(this.key+'.pending',data);this.storage.setItem(this.key,data);this.storage.removeItem(this.key+'.pending');return true}catch{return false}}
}
const api={Library,SaveStore,CATEGORIES,SERIES,COLORS,clamp};if(typeof module!=='undefined')module.exports=api;root.QuietModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);

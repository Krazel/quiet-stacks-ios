(function(root){'use strict';
const KEY='quiet-stacks.story.v1';
const COPY={opening:{chapter:'The royal library',title:'A place among the stories',first:'For forty years, Master Alden has kept the king’s library. Now his hands tire, and he is ready to pass on its keys.',second:'You have asked to take his place. His final test is a quiet one: return every volume to its rightful place.',signature:'A letter from Master Alden',action:'Enter the library'},ending:{chapter:'Royal Librarian',title:'The keys are yours',first:'Every volume rests where it belongs. Alden walks the aisles once more, then places a small brass key in your hand.',second:'“You have cared for these stories as I have. With the king’s blessing, you are now the Royal Librarian.”',signature:'Master Alden can finally rest.',action:'Stay a little longer'}};
function complete(books,total){return total>0&&books.length===total&&books.every(b=>b.place==='shelf'&&b.slot===b.id);}
function create({books,total,onOpen=()=>{},onClose=()=>{},storage,document=root.document,schedule=root.setTimeout,cancel=root.clearTimeout}){
 let state={started:false,earned:false,seen:false,pending:false},timer=null,view=null,preview=false;
 try{storage=storage||root.localStorage;const old=JSON.parse(storage.getItem(KEY));if(old&&['started','earned','seen','pending'].every(k=>typeof old[k]==='boolean'))state=old;}catch{}
 const $=id=>document.getElementById(id),dialog=$('story');
 const persist=()=>{try{storage.setItem(KEY,JSON.stringify(state));}catch{}};
 function open(kind,isPreview=false){if(!COPY[kind])return;view=kind;preview=isPreview;onOpen();const c=COPY[kind];for(const name of ['chapter','title','first','second','signature','action'])$('story-'+name).textContent=c[name];dialog.dataset.chapter=kind;if(!dialog.open)dialog.showModal();$('story-action').focus({preventScroll:true});}
 function close(){if(!view)return;if(!preview){if(view==='opening')state.started=true;else state.seen=true;persist();}view=null;dialog.close();onClose();}
 function finish(){timer=null;if(!state.pending||!complete(books(),total))return;state.pending=false;state.earned=true;state.seen=false;persist();open('ending');}
 function cancelPending(){if(timer!==null)cancel(timer);timer=null;if(state.pending){state.pending=false;persist();}}
 function check(){if(!complete(books(),total)){cancelPending();return;}if(state.earned||state.pending)return;state.pending=true;persist();timer=schedule(finish,850);}
 $('story-action').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 return {boot(){if(state.pending&&!complete(books(),total))cancelPending();if(state.pending)finish();else if(state.earned&&!state.seen)open('ending');else if(!state.started)open('opening');},check,cancelPending,preview:kind=>open(kind,true),get active(){return view!==null;},snapshot:()=>({...state,view,preview})};
}
const api={create,complete,COPY};if(typeof module!=='undefined')module.exports=api;root.GalleryStory=api;
})(typeof window!=='undefined'?window:globalThis);

(function(root){'use strict';
function create({now=()=>performance.now(),reduced}={}){
 // Keep one live query; creating one per book adds thousands of DOM objects/sec.
 const motion=reduced?null:matchMedia('(prefers-reduced-motion: reduce)');
 if(!reduced)reduced=()=>motion.matches;
 const active=new Map();let held=null,time=0,animating=false,motionReduced=reduced();
 function lift(id){active.delete(id);held={id,start:now()};}
 function release(id,cancelled=false){if(held?.id!==id)return;const amount=Math.min(1,(now()-held.start)/130);held=null;active.delete(id);if(!reduced())active.set(id,{start:now(),amount,cancelled});while(active.size>4)active.delete(active.keys().next().value);}
 function tick(){time=now();animating=false;motionReduced=reduced();if(motionReduced){active.clear();return false;}for(const [id,e]of active){if(time-e.start>=190)active.delete(id);else animating=true;}if(held&&time-held.start<130)animating=true;return animating;}
 function rect(id,r,scale){
  if(motionReduced||(held?.id!==id&&!active.has(id)))return r;
  let liftAmount=0,size=1;
  if(held?.id===id){const t=Math.min(1,Math.max(0,(time-held.start)/130));liftAmount=1-(1-t)**3;size=1+.025*liftAmount;}
  else if(active.has(id)){const e=active.get(id),t=Math.min(1,Math.max(0,(time-e.start)/190));liftAmount=e.amount*(1-t)**3;if(!e.cancelled)liftAmount-=Math.sin(Math.PI*t)*(1-t)*.18;size=1+.025*e.amount*(1-t)**3;}
  if(!liftAmount&&size===1)return r;
  return {...r,x:r.x-r.w*(size-1)/2,y:r.y-r.h*(size-1)-6*liftAmount/scale,w:r.w*size,h:r.h*size};
 }
 return {lift,release,tick,rect,clear(){held=null;active.clear();},stats:()=>({held:held?.id??null,settling:active.size,animating})};
}
root.GalleryBookMotion={create};if(typeof module!=='undefined')module.exports={create};
})(typeof window!=='undefined'?window:globalThis);

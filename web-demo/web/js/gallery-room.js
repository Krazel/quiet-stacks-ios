(function(root){'use strict';
// Local repairs use whole joinery fragments to avoid seams through planks.
// Coordinates belong to the stable 1672×941 world.
const PATCHES=[
 [47,128,155,166],[123,294,49,30],
 [214,401,354,170],[281,571,55,20],
 [116,679,434,169],[167,848,49,24],
 [1083,679,464,169],[1147,848,60,24],
 [1048,401,364,169],[1337,570,52,31],
 [1049,128,306,166],[1300,294,65,35],
 [448,12,197,84],[1160,12,178,84],
 [973,76,51,145],[1340,593,98,35]
];
// Keep the painted lettering in its native atlas until the final screen render.
const NAMEPLATES=[
 {source:[36,123,704,136],center:[516,424],width:120},
 {source:[798,123,704,136],center:[1151,424],width:120},
 {source:[36,335,704,136],center:[410,658],width:140},
 {source:[798,335,704,136],center:[1242,658],width:142},
 {source:[36,548,704,136],center:[199,207],width:128},
 {source:[798,548,704,136],center:[537,207],width:135},
 {source:[36,760,704,136],center:[1151,207],width:153},
 {source:[798,760,704,136],center:[1477,207],width:147}
];
function compose(original,west){
 const c=document.createElement('canvas');c.width=1832;c.height=941;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;if(west)ctx.drawImage(west,0,0,160,941);ctx.drawImage(original,160,0,1672,941);
 // A wooden divider retains all three Luminara collections on each row.
 ctx.drawImage(original,1097,439,11,109,1403,439,11,109);
 return c;
}
function numberedBindings(items){
 const canvas=document.createElement('canvas'),columns=31;canvas.width=2048;canvas.height=Math.ceil(items.length/columns)*194;const ctx=canvas.getContext('2d'),bySeries=new Map();
 for(let i=0;i<items.length;i++){const item=items[i],x=(i%columns)*66+1,y=Math.floor(i/columns)*194+1,w=64,h=192;ctx.drawImage(item.visual.image,...item.visual.source,x,y,w,h);
  // Continue the existing leather grain through the foil area; retain the curved
  // silhouette and outer tooling instead of laying a rectangular label over it.
  const pixels=ctx.getImageData(x,y,w,h),d=pixels.data;
  const top=item.hasFirst?119:138,bottom=179,left=15,right=49;
  for(let yy=top;yy<bottom;yy++)for(let xx=left;xx<right;xx++){
   const edge=Math.min(1,(xx-left)/4,(right-1-xx)/4,(yy-top)/3,(bottom-1-yy)/3),t=(xx-left)/(right-left);
   for(let ch=0;ch<3;ch++){const row=item.hasFirst?yy:150;const a=d[(row*w+left-1)*4+ch],b=d[(row*w+right)*4+ch],v=a*(1-t)+b*t;const at=(yy*w+xx)*4+ch;d[at]=d[at]*(1-edge)+v*edge;}
  }
  ctx.putImageData(pixels,x,y);
  bySeries.set(item.series,{image:canvas,source:[x,y,w,h]});
 }return {canvas,bySeries};
}
function volumeMarks(){
 const c=document.createElement('canvas');c.width=48*17;c.height=64;const ctx=c.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='36px Georgia,serif';
 // Gold foil and its small impressed shadow, directly over the leather: no label rectangle.
 for(let n=1;n<=17;n++){const x=(n-1)*48+24;ctx.lineJoin='round';ctx.lineWidth=.8;ctx.strokeStyle='#211607';ctx.strokeText(String(n),x,34,40);ctx.fillStyle='#634014';ctx.fillText(String(n),x+1,35,40);ctx.fillStyle='#e6c179';ctx.fillText(String(n),x,33,40);}
 return c;
}
function drawNameplates(ctx,signs){
 for(const plate of NAMEPLATES){
  const [cx,cy]=plate.center,w=plate.width,h=w*plate.source[3]/plate.source[2],x=cx-w/2,y=cy-h/2,k=2.6;
  ctx.save();ctx.beginPath();ctx.moveTo(x+k,y);ctx.lineTo(x+w-k,y);ctx.lineTo(x+w,y+k);ctx.lineTo(x+w,y+h-k);ctx.lineTo(x+w-k,y+h);ctx.lineTo(x+k,y+h);ctx.lineTo(x,y+h-k);ctx.lineTo(x,y+k);ctx.closePath();ctx.clip();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(signs,...plate.source,x,y,w,h);ctx.restore();
 }
}
const api={numberedBindings,volumeMarks,compose,drawNameplates,PATCHES,NAMEPLATES};if(typeof module!=='undefined')module.exports=api;root.GalleryRoom=api;
})(typeof globalThis!=='undefined'?globalThis:this);

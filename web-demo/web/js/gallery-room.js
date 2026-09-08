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
function compose(original){
 const c=document.createElement('canvas');c.width=1672;c.height=941;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(original,0,0,c.width,c.height);
 // A wooden divider retains all three Luminara collections on each row.
 ctx.drawImage(original,1097,439,11,109,1243,439,11,109);
 return c;
}
function volumeMarks(){
 const c=document.createElement('canvas');c.width=1024;c.height=48;const ctx=c.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 26px Georgia,serif';
 for(let n=1;n<=32;n++){const x=(n-1)*32;ctx.fillStyle='#291b12';ctx.fillRect(x+1,2,30,43);ctx.strokeStyle='#af8042';ctx.lineWidth=1;ctx.strokeRect(x+2,3,28,41);ctx.fillStyle='#684221';ctx.fillText(String(n),x+16,25,25);ctx.fillStyle='#efd092';ctx.fillText(String(n),x+16,24,25);}
 return c;
}
function drawNameplates(ctx,signs){
 for(const plate of NAMEPLATES){
  const [cx,cy]=plate.center,w=plate.width,h=w*plate.source[3]/plate.source[2],x=cx-w/2,y=cy-h/2,k=2.6;
  ctx.save();ctx.beginPath();ctx.moveTo(x+k,y);ctx.lineTo(x+w-k,y);ctx.lineTo(x+w,y+k);ctx.lineTo(x+w,y+h-k);ctx.lineTo(x+w-k,y+h);ctx.lineTo(x+k,y+h);ctx.lineTo(x,y+h-k);ctx.lineTo(x,y+k);ctx.closePath();ctx.clip();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(signs,...plate.source,x,y,w,h);ctx.restore();
 }
}
const api={volumeMarks,compose,drawNameplates,PATCHES,NAMEPLATES};if(typeof module!=='undefined')module.exports=api;root.GalleryRoom=api;
})(typeof globalThis!=='undefined'?globalThis:this);

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
 {source:[36,123,704,136],center:[395,389],width:158},
 {source:[798,123,704,136],center:[1232,389],width:158},
 {source:[36,335,704,136],center:[313,667],width:164},
 {source:[798,335,704,136],center:[1310,667],width:170},
 {source:[36,548,704,136],center:[109,115],width:165},
 {source:[798,548,704,136],center:[494,115],width:166},
 {source:[36,760,704,136],center:[1213,115],width:186},
 {source:[798,760,704,136],center:[1570,115],width:184}
];
function compose(original,repair){
 const c=document.createElement('canvas');c.width=1672;c.height=941;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
 ctx.drawImage(original,0,0,c.width,c.height);
 const sx=repair.naturalWidth/c.width,sy=repair.naturalHeight/c.height;
 for(const [x,y,w,h] of PATCHES)ctx.drawImage(repair,x*sx,y*sy,w*sx,h*sy,x,y,w,h);
 // These old sections were separated by ladders; now each has a full wooden post.
 ctx.drawImage(repair,1124*sx,130*sy,14*sx,164*sy,135,130,14,164);
 ctx.drawImage(repair,1142*sx,402*sy,14*sx,167*sy,1348,402,14,167);
 // Close the outermost shelf ends within the map instead of clipping planks.
 for(const [y,h] of [[0,84],[85,210],[355,215]]){
  ctx.drawImage(repair,214*sx,130*sy,5*sx,140*sy,0,y,4,h);
  ctx.drawImage(repair,214*sx,130*sy,5*sx,140*sy,1668,y,4,h);
 }
 ctx.drawImage(original,1580,101,10,29,1662,101,10,29);
 return c;
}
function drawNameplates(ctx,signs){
 for(const plate of NAMEPLATES){
  const [cx,cy]=plate.center,w=plate.width,h=w*plate.source[3]/plate.source[2],x=cx-w/2,y=cy-h/2,k=2.6;
  ctx.save();ctx.beginPath();ctx.moveTo(x+k,y);ctx.lineTo(x+w-k,y);ctx.lineTo(x+w,y+k);ctx.lineTo(x+w,y+h-k);ctx.lineTo(x+w-k,y+h);ctx.lineTo(x+k,y+h);ctx.lineTo(x,y+h-k);ctx.lineTo(x,y+k);ctx.closePath();ctx.clip();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(signs,...plate.source,x,y,w,h);ctx.restore();
 }
}
const api={compose,drawNameplates,PATCHES,NAMEPLATES};if(typeof module!=='undefined')module.exports=api;root.GalleryRoom=api;
})(typeof globalThis!=='undefined'?globalThis:this);

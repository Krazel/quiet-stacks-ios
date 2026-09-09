(function(root){'use strict';
// A small independent overlay: moving light never redraws the book catalogue.
function create(parent){
 const canvas=document.createElement('canvas');canvas.className='ambience';canvas.setAttribute('aria-hidden','true');parent.appendChild(canvas);const ctx=canvas.getContext('2d');
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),lights=[[-64.5096,222.6961],[1794.3266,222.6961],[-64.5096,414.826],[1794.3266,414.826],[45.7326,91.6984],[336.0734,91.6984],[377.5507,91.6984],[1305.3315,91.6984],[1345.7173,91.6984],[1633.8751,91.6984],[9.7129,266.3619],[1352.2663,292.5615],[1681.9014,267.4536],[-18.6663,493.4246],[796.6893,620.0557],[483.4268,828.5603]];
 let timer=null,view=null,paints=0,totalMs=0,lastTime=0;
 function stop(){if(timer!==null){clearTimeout(timer);timer=null;}}
 function paint(){timer=null;if(!view||document.hidden||motion.matches){ctx.clearRect(0,0,canvas.width,canvas.height);return;}
  const started=performance.now(),t=started*.001,{width,height,scale,x,y}=view;ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(width/2-x*scale,height/2-y*scale);ctx.scale(scale,scale);
  for(let i=0;i<lights.length;i++){const [lx,ly]=lights[i],pulse=.5+.3*Math.sin(t*1.8+i*2.1)+.2*Math.sin(t*3.4+i),radius=18+pulse*3;if(lx<x-width/scale/2-radius||lx>x+width/scale/2+radius||ly<y-height/scale/2-radius||ly>y+height/scale/2+radius)continue;const g=ctx.createRadialGradient(lx,ly,0,lx,ly,radius);g.addColorStop(0,'rgba(255,218,119,'+(.09+pulse*.06)+')');g.addColorStop(1,'rgba(255,171,60,0)');ctx.fillStyle=g;ctx.fillRect(lx-radius,ly-radius,radius*2,radius*2);ctx.fillStyle='rgba(255,242,183,'+(.2+pulse*.2)+')';ctx.fillRect(lx-.7,ly-3-pulse,1.4,3+pulse);}
  for(let i=0;i<12;i++){const px=749.7545+(i%3)*66+Math.sin(t*.22+i*3.8)*18,py=195+((i*31+t*4)%130);ctx.fillStyle='rgba(255,228,173,'+(.08+.11*(.5+.5*Math.sin(t*.7+i)))+')';ctx.fillRect(px,py,.8,.8);}
  ctx.restore();paints++;lastTime=performance.now()-started;totalMs+=lastTime;timer=setTimeout(paint,1000/12);
 }
 function resume(){stop();paint();}
 document.addEventListener('visibilitychange',resume);motion.addEventListener?.('change',resume);
 return {sync(width,height,scale,camera){const changed=!view||view.width!==width||view.height!==height||view.scale!==scale||view.x!==camera.x||view.y!==camera.y;view={width,height,scale,x:camera.x,y:camera.y};if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}if(changed||timer===null)resume();},stats:()=>({enabled:!motion.matches&&!document.hidden,paints,averagePaintMs:paints?totalMs/paints:0,lastPaintMs:lastTime,targetFPS:12}),dispose(){stop();motion.removeEventListener?.('change',resume);document.removeEventListener('visibilitychange',resume);canvas.remove();}};
}
root.GalleryAmbience={create};
})(typeof window!=='undefined'?window:globalThis);

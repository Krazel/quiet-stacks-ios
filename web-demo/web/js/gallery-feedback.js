(function(root){'use strict';
// A short independent effect: celebrations never redraw the catalogue at 60 FPS.
function create(parent){
 const canvas=document.createElement('canvas');canvas.className='placement-feedback';canvas.setAttribute('aria-hidden','true');parent.appendChild(canvas);const ctx=canvas.getContext('2d'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let view=null,active=[],frame=null,lastKind=null,plays=0,paints=0;
 function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;active=[];ctx.clearRect(0,0,canvas.width,canvas.height);}
 function paint(t){frame=null;ctx.clearRect(0,0,canvas.width,canvas.height);if(!view||document.hidden)return;const {width,height,scale,x,y}=view;active=active.filter(e=>t-e.start<e.duration);
  for(const e of active){const p=Math.max(0,(t-e.start)/e.duration),fade=Math.sin(Math.PI*Math.min(1,p)),px=(e.x-x)*scale+width/2,py=(e.y-y)*scale+height/2,exact=e.kind==='exact',radius=Math.min(38,Math.max(16,scale*14)),color=exact?'139,255,169':'255,214,126';
   ctx.globalAlpha=motion.matches ? .65 : fade;const g=ctx.createRadialGradient(px,py,0,px,py,radius);g.addColorStop(0,`rgba(${color},.48)`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(px-radius,py-radius,radius*2,radius*2);
   const count=exact?9:4;ctx.fillStyle=exact?'#baffcb':'#ffe6ac';for(let i=0;i<count;i++){const angle=i/count*Math.PI*2-.7,r=radius*(.35+(motion.matches ? .15 : p*.6)),sx=px+Math.cos(angle)*r,sy=py+Math.sin(angle)*r-(motion.matches?0:p*12),size=exact?2.6:1.8;ctx.fillRect(sx-size,sy-.6,size*2,1.2);ctx.fillRect(sx-.6,sy-size,1.2,size*2);}
  }ctx.globalAlpha=1;paints++;if(active.length)frame=requestAnimationFrame(paint);
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 return {sync(width,height,scale,camera){view={width,height,scale,x:camera.x,y:camera.y};if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}},play(kind,point){if(!['rack','exact'].includes(kind)||!view)return;lastKind=kind;plays++;active.push({kind,x:point.x,y:point.y-14,start:performance.now(),duration:motion.matches?220:kind==='exact'?760:430});active=active.slice(-4);if(frame===null)frame=requestAnimationFrame(paint);},clear:stop,stats:()=>({lastKind,plays,active:active.length,paints})};
}
root.GalleryFeedback={create};
})(typeof window!=='undefined'?window:globalThis);

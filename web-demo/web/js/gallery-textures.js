(function(root){'use strict';
// Color-key import for generated sprite sheets. Only neutral pixels connected
// to the sheet border become transparent; pale book interiors are preserved.
// Include the grey antialias fringe and existing transparent padding.
function clearMatte(data,width,height,blackMatte=false){
  if(data.length!==width*height*4)throw new Error('Texture dimensions do not match pixels');
  const visited=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
  function add(i){if(i<0||i>=visited.length||visited[i])return;visited[i]=1;const p=i*4,r=data[p],g=data[p+1],b=data[p+2],dark=blackMatte&&Math.max(r,g,b)<28&&Math.max(r,g,b)-Math.min(r,g,b)<12;if(data[p+3]!==0&&!dark&&(Math.min(r,g,b)<170||Math.max(r,g,b)-Math.min(r,g,b)>30))return;queue[tail++]=i;}
  for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
  while(head<tail){const i=queue[head++];data[i*4+3]=0;if(i%width)add(i-1);if(i%width<width-1)add(i+1);add(i-width);add(i+width);}
  // Defringe only the outer pixel ring. The dark ink contour and enclosed
  // cream pages are not flood-filled; mixed white/ink edge pixels lose matte.
  const edge=[];
  for(let i=0;i<visited.length;i++){const p=i*4;if(!data[p+3])continue;
    const x=i%width,r=data[p],g=data[p+1],b=data[p+2],low=Math.min(r,g,b),high=Math.max(r,g,b);
    if(low<90||high-low>30)continue;
    if((x&&data[(i-1)*4+3]===0)||(x<width-1&&data[(i+1)*4+3]===0)||(i>=width&&data[(i-width)*4+3]===0)||(i<width*(height-1)&&data[(i+width)*4+3]===0))edge.push(i);
  }
  for(const i of edge){const p=i*4,light=(data[p]+data[p+1]+data[p+2])/3,alpha=Math.min(1,(245-light)/185);
    for(let ch=0;ch<3;ch++)data[p+ch]=Math.max(0,Math.min(255,(data[p+ch]-245*(1-alpha))/alpha));
    data[p+3]=Math.round(data[p+3]*alpha);
  }
  return data;
}
function importAtlas(image,blackMatte=false){const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const context=c.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);const pixels=context.getImageData(0,0,c.width,c.height);clearMatte(pixels.data,c.width,c.height,blackMatte);context.putImageData(pixels,0,0);return c;}
const api={clearMatte,importAtlas};if(typeof module!=='undefined')module.exports=api;root.GalleryTextures=api;
})(typeof globalThis!=='undefined'?globalThis:this);

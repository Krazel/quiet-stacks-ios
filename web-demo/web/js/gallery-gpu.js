(function(root){'use strict';
// Small ordered sprite batcher. Texture uploads happen once per context lifetime.
function create(canvas,invalidate){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false});
 if(!gl)return null;
 const maxTextures=Math.min(8,gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)),capacity=8192,data=new Float32Array(capacity*5);
 const derivatives=!!gl.getExtension('OES_standard_derivatives');
 let program,buffer,position,uv,slot,transform,smoothing,samplers,resources=new Map(),batch=[],count=0,nearest=false,lost=false,uploads=0,textureBytes=0,drawCalls=0;
 const vertex='attribute vec2 a_position;attribute vec2 a_uv;attribute float a_slot;uniform vec4 u_transform;varying vec2 v_uv;varying float v_slot;void main(){gl_Position=vec4(a_position*u_transform.xy+u_transform.zw,0.,1.);v_uv=a_uv;v_slot=a_slot;}';
 // Four subpixel samples reduce shimmer when detailed book art is minified,
 // without a second atlas or the memory overhead of padded mipmap textures.
 const sample=derivatives?'vec4 sampleBook(sampler2D tex,vec2 dx,vec2 dy){if(u_smoothing<0.5)return texture2D(tex,v_uv);return (texture2D(tex,v_uv-dx-dy)+texture2D(tex,v_uv+dx-dy)+texture2D(tex,v_uv-dx+dy)+texture2D(tex,v_uv+dx+dy))*.25;}':'';
 const fragment=(derivatives?'#extension GL_OES_standard_derivatives : enable\n':'')+'precision highp float;varying vec2 v_uv;varying float v_slot;uniform float u_smoothing;'+Array.from({length:maxTextures},(_,i)=>'uniform sampler2D u_tex'+i+';').join('')+sample+'void main(){'+(derivatives?'vec2 dx=dFdx(v_uv)*.25,dy=dFdy(v_uv)*.25;':'')+Array.from({length:maxTextures},(_,i)=>(i?'else ':'')+(i===maxTextures-1?'':'if(v_slot<'+(i+.5).toFixed(1)+')')+'{gl_FragColor='+(derivatives?'sampleBook(u_tex'+i+',dx,dy)':'texture2D(u_tex'+i+',v_uv)')+';}').join('')+'}';
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Sprite shader failed');return s;}
 function init(){
  if(derivatives)gl.getExtension('OES_standard_derivatives');
  program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Sprite program failed');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data.byteLength,gl.DYNAMIC_DRAW);
  position=gl.getAttribLocation(program,'a_position');uv=gl.getAttribLocation(program,'a_uv');slot=gl.getAttribLocation(program,'a_slot');transform=gl.getUniformLocation(program,'u_transform');
  for(const [loc,size,offset] of [[position,2,0],[uv,2,8],[slot,1,16]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,20,offset);}
  smoothing=gl.getUniformLocation(program,'u_smoothing');samplers=Array.from({length:maxTextures},(_,i)=>gl.getUniformLocation(program,'u_tex'+i));samplers.forEach((s,i)=>gl.uniform1i(s,i));
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  resources=new Map();count=0;batch=[];uploads=0;textureBytes=0;
 }
 function resource(image){
  let r=resources.get(image);if(r)return r;
  const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;if(!w||!h||w>gl.getParameter(gl.MAX_TEXTURE_SIZE)||h>gl.getParameter(gl.MAX_TEXTURE_SIZE))throw Error('Invalid sprite texture size');
  const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  r={texture,w,h};resources.set(image,r);uploads++;textureBytes+=w*h*4;return r;
 }
 function flush(){if(!count||lost)return;batch.forEach((r,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,r.texture);const filter=nearest?gl.NEAREST:gl.LINEAR;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);});
  // Bind unused sampler slots too: WebGL validates every active sampler.
  for(let i=batch.length;i<maxTextures;i++){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,batch[0].texture);}
  gl.uniform1f(smoothing,nearest?0:1);gl.bufferSubData(gl.ARRAY_BUFFER,0,data.subarray(0,count*5));gl.drawArrays(gl.TRIANGLES,0,count);drawCalls++;count=0;batch=[];
 }
 function begin(width,height,dpr,scale,camera){drawCalls=0;if(lost)return false;gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(23/255,18/255,14/255,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform4f(transform,2*scale/width,-2*scale/height,-2*camera.x*scale/width,2*camera.y*scale/height);return true;}
 function draw(image,source,rect,sharp=false,cut=0){if(lost)return;const r=resource(image);let index=batch.indexOf(r);if(count&&(nearest!==sharp||(index<0&&batch.length===maxTextures)||count+30>capacity)){flush();index=-1;}nearest=sharp;if(index<0){index=batch.length;batch.push(r);}
  const [sx,sy,sw,sh]=source,{x,y,w,h}=rect;
  function emit(px,py){const i=count++*5;data[i]=px;data[i+1]=py;data[i+2]=(sx+(px-x)/w*sw)/r.w;data[i+3]=(sy+(py-y)/h*sh)/r.h;data[i+4]=index;}
  if(cut){const points=[[x+cut,y],[x+w-cut,y],[x+w,y+cut],[x+w,y+h-cut],[x+w-cut,y+h],[x+cut,y+h],[x,y+h-cut],[x,y+cut]];for(let i=0;i<8;i++){emit(x+w/2,y+h/2);emit(...points[i]);emit(...points[(i+1)%8]);}}
  else{emit(x,y);emit(x+w,y);emit(x,y+h);emit(x,y+h);emit(x+w,y);emit(x+w,y+h);}
 }
 init();canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;count=0;batch=[];root.GalleryDiagnostics?.report('graphics-context-lost',{});});
 canvas.addEventListener('webglcontextrestored',()=>{try{lost=false;init();invalidate();root.GalleryDiagnostics?.report('graphics-context-restored',{});}catch(error){root.GalleryDiagnostics?.report('asset-error',{message:error.message});}});
 return {begin,draw,end:flush,reset(){for(const r of resources.values())gl.deleteTexture(r.texture);resources.clear();count=0;batch=[];uploads=0;textureBytes=0;},stats:()=>({backend:'webgl',drawCalls,textureUploads:uploads,textureMiB:Math.round(textureBytes/1048576*100)/100,contextLost:lost})};
}
root.GalleryGpu={create};
})(typeof window!=='undefined'?window:globalThis);

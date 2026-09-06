(function(root){
  'use strict';
  if(root.GalleryDiagnostics)return;
  var pending=[],limit=24;
  function short(value,max){return String(value==null?'':value).slice(0,max||700);}
  function asset(value){return short(value,500).split('?')[0].split('#')[0].replace(/^.*\/web\//,'').replace(/^quietstacks:\/\/localhost\//,'');}
  function report(kind,detail){
    detail=detail||{};var event={type:'diagnostic',kind:short(kind,60)};
    ['message','stage','status','stack'].forEach(function(key){if(detail[key]!=null)event[key]=short(detail[key],key==='stack'?1200:700);});
    if(detail.asset)event.asset=asset(detail.asset);
    ['line','column','loaded','total'].forEach(function(key){if(typeof detail[key]==='number')event[key]=detail[key];});
    pending.push(event);if(pending.length>limit)pending.shift();
    try{var h=root.webkit&&root.webkit.messageHandlers&&root.webkit.messageHandlers.galleryStatus;if(h)h.postMessage(event);}catch(_){}
    return event;
  }
  root.addEventListener('error',function(e){
    var target=e.target;
    if(target&&target!==root&&(target.src||target.href))report('resource-error',{asset:target.currentSrc||target.src||target.href,message:'Bundled resource did not load'});
    else report('javascript-error',{message:e.message||'Unknown JavaScript error',asset:e.filename,line:e.lineno,column:e.colno,stack:e.error&&e.error.stack});
  },true);
  root.addEventListener('unhandledrejection',function(e){var error=e.reason;report('promise-rejection',{message:error&&error.message||short(error),stack:error&&error.stack});});
  root.GalleryDiagnostics={report:report,ready:function(){report('ready');},events:function(){return pending.slice();}};
  report('bootstrap',{stage:'Diagnostic bridge installed'});
})(typeof window!=='undefined'?window:this);

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('web/js/gallery-diagnostics.js','utf8');
function setup(native=true){
  const listeners={},messages=[];
  const window={addEventListener:(kind,fn)=>{(listeners[kind]??=[]).push(fn);}};
  if(native)window.webkit={messageHandlers:{galleryStatus:{postMessage:m=>messages.push(m)}}};
  const context=vm.createContext({window});vm.runInContext(source,context);
  return {window,listeners,messages,context,fire:(kind,event)=>listeners[kind].forEach(fn=>fn(event))};
}
test('reports the original JavaScript location and stack to the native wrapper',()=>{
  const d=setup();d.fire('error',{target:d.window,message:'Bad image',filename:'quietstacks://localhost/js/gallery.js?v=163',lineno:42,colno:7,error:{stack:'at gallery.js:42:7'}});
  const event=d.messages.at(-1);assert.equal(event.kind,'javascript-error');assert.equal(event.asset,'js/gallery.js');assert.equal(event.line,42);assert.equal(event.column,7);assert.equal(event.stack,'at gallery.js:42:7');
});
test('distinguishes failed resources from rejected promises',()=>{
  const d=setup();d.fire('error',{target:{src:'quietstacks://localhost/assets/page.png?token=private#fragment'}});
  assert.equal(d.messages.at(-1).kind,'resource-error');assert.equal(d.messages.at(-1).asset,'assets/page.png');
  d.fire('unhandledrejection',{reason:new Error('Decode failed')});assert.equal(d.messages.at(-1).kind,'promise-rejection');assert.equal(d.messages.at(-1).message,'Decode failed');
});
test('keeps a bounded report and excludes unapproved payloads such as saved games',()=>{
  const d=setup();for(let i=0;i<60;i++)d.window.GalleryDiagnostics.report('asset-loaded',{loaded:i,message:'x'.repeat(2000),saved:{books:['private']},account:'private'});
  const events=d.window.GalleryDiagnostics.events();assert.equal(events.length,24);assert.equal(events[0].loaded,36);assert.equal(events.at(-1).message.length,700);assert.equal(events.at(-1).saved,undefined);assert.equal(events.at(-1).account,undefined);
});
test('document injection and script loading do not duplicate listeners',()=>{
  const d=setup();vm.runInContext(source,d.context);assert.equal(d.listeners.error.length,1);assert.equal(d.listeners.unhandledrejection.length,1);assert.equal(d.messages.length,1);
});
test('works without a native bridge and signals the first rendered frame',()=>{
  const d=setup(false);d.window.GalleryDiagnostics.ready();assert.equal(d.window.GalleryDiagnostics.events().at(-1).kind,'ready');
});

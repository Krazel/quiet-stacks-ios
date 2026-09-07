import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const out=path.resolve('artifacts/native-qa');fs.mkdirSync(out,{recursive:true});
function run(cmd,args){console.log('QA step:',cmd,args.slice(0,3).join(' '));const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:20*1024*1024,timeout:180000});if(r.status!==0)throw Error(r.stderr||r.stdout||String(r.error||r.signal||r.status));return r.stdout.trim();}
run('node',['build.mjs']);run('node',['scripts/prepare-ios.mjs']);
const pathTest=path.join(process.env.RUNNER_TEMP,'quiet-stacks-asset-path-test');
run('xcrun',['clang','-fobjc-arc','-framework','Foundation','tests/gallery-asset-path.m','-o',pathTest]);
const pathResult=JSON.parse(run(pathTest,[]));assert.equal(pathResult.passed,true);
fs.writeFileSync(path.join(out,'asset-path.json'),JSON.stringify(pathResult,null,2));
const derived=path.join(process.env.RUNNER_TEMP,'QuietStacksQA');
const log=spawnSync('xcodebuild',['build','-project','ios/QuietStacks.xcodeproj','-scheme','QuietStacks','-configuration','Release','-sdk','iphonesimulator','-destination','generic/platform=iOS Simulator','-derivedDataPath',derived,'CODE_SIGNING_ALLOWED=NO'],{encoding:'utf8',maxBuffer:20*1024*1024,timeout:180000});
fs.writeFileSync(path.join(out,'compile.log'),log.stdout+log.stderr);if(log.status!==0)throw Error((log.stderr+'\n'+log.stdout.slice(-3000)).slice(0,14000));
const available=JSON.parse(run('xcrun',['simctl','list','devices','available','--json'])).devices;
const runtimes=Object.keys(available).filter(k=>k.includes('iOS-'));
console.log('Installed iOS runtimes:',runtimes);
// Match the Xcode 16.4 SDK instead of booting a newer, unrelated runtime.
const runtime=runtimes.find(k=>k.endsWith('iOS-18-5'))||runtimes.filter(k=>k.includes('iOS-18-')).sort().reverse()[0]||runtimes.sort().reverse()[0];
const phone=available[runtime].find(d=>d.name.includes('iPhone'));
run('xcrun',['simctl','boot',phone.udid]);run('xcrun',['simctl','bootstatus',phone.udid,'-b']);
run('xcrun',['simctl','install',phone.udid,path.join(derived,'Build/Products/Release-iphonesimulator/QuietStacks.app')]);
run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks','--gallery-smoke']);
const container=run('xcrun',['simctl','get_app_container',phone.udid,'com.krazel.quietstacks','data']);
const snapshot=()=>{try{return JSON.parse(fs.readFileSync(path.join(container,'Documents/gallery-smoke.json'),'utf8'));}catch{return null;}};
let result;for(let n=0;n<60;n++){await new Promise(r=>setTimeout(r,1000));result=snapshot();if(result?.nativeReady||result?.errors?.length)break;}
if(!result?.nativeReady)throw Error('Gallery never rendered a first frame');
const samples=[];let sorted=!!result.qaSorted,scattered=!!result.qaScattered,previousFrames=result.frames,idleFrames=null,idleSamples=0;
for(let n=0;n<45;n++){
 await new Promise(r=>setTimeout(r,1000));result=snapshot();
 if(!result?.nativeReady||result.errors?.length||result.processTerminations||result.storageError)throw Error('Gallery failed during sustained play: '+JSON.stringify({...result,saved:undefined,bootSaved:undefined}));
 if(result.qaTicks>=30){if(idleFrames===null)idleFrames=result.frames;assert.equal(result.frames,idleFrames,'Canvas kept drawing after interaction stopped');idleSamples++;}previousFrames=result.frames;
 const shelf=result.saved?.books.filter(b=>b.place==='shelf').length||0,floor=result.saved?.books.filter(b=>b.place==='floor').length||0;
 if(result.qaSorted)sorted=true;if(result.qaScattered)scattered=true;
 samples.push({frames:result.frames,shelf,floor,qaTicks:result.qaTicks});
}
fs.writeFileSync(path.join(out,'launch.json'),JSON.stringify({device:phone.name,runtime,...result,samples,sorted,scattered},null,2));
run('xcrun',['simctl','io',phone.udid,'screenshot',path.join(out,'launch.png')]);
if(!sorted||!scattered)throw Error('Native sort/scatter/save sequence did not complete');
assert.ok(idleSamples>=5,'Insufficient idle observation');assert.ok(result.qaMotion?.frames>20,'Camera interaction did not produce new frames');
fs.writeFileSync(path.join(out,'performance.json'),JSON.stringify({device:phone.name,runtime,simulatorOnly:true,idleSamples,idleFrames,motion:result.qaMotion,renderFPS:result.qaMotion.frames*1000/result.qaMotion.durationMs},null,2));
const saved=result.saved;
run('xcrun',['simctl','terminate',phone.udid,'com.krazel.quietstacks']);
if(typeof container!=='undefined')fs.rmSync(path.join(container,'Documents/gallery-smoke.json'),{force:true});run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks','--gallery-restore-smoke']);
let restored=false;for(let n=0;n<60;n++){await new Promise(r=>setTimeout(r,1000));result=snapshot();if(result?.nativeReady&&result.bootSaved){fs.writeFileSync(path.join(out,'restored-state.json'),JSON.stringify({expected:saved,actual:JSON.parse(result.bootSaved)},null,2));assert.deepStrictEqual(JSON.parse(result.bootSaved),saved,'Saved layout did not survive relaunch');restored=true;break;}}
if(!restored)throw Error('App did not restore after relaunch');
fs.writeFileSync(path.join(out,'relaunch.json'),JSON.stringify({restored,frames:result.frames,nativeReady:result.nativeReady,errors:result.errors,processTerminations:result.processTerminations},null,2));
run('xcrun',['simctl','terminate',phone.udid,'com.krazel.quietstacks']);
run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks','--gallery-diagnostic-smoke']);
let diagnostic;for(let n=0;n<60;n++){
 await new Promise(r=>setTimeout(r,1000));
 try{diagnostic=JSON.parse(fs.readFileSync(path.join(container,'Documents/gallery-diagnostic-probe.json'),'utf8'));break;}catch{}
}
const cachedDiagnostic=path.join(container,'Library/Caches/gallery-last-diagnostic.json');
if(fs.existsSync(cachedDiagnostic))fs.copyFileSync(cachedDiagnostic,path.join(out,'last-native-diagnostic.json'));
run('xcrun',['simctl','io',phone.udid,'screenshot',path.join(out,'diagnostic.png')]);
if(diagnostic)fs.writeFileSync(path.join(out,'diagnostic-probe.json'),JSON.stringify(diagnostic,null,2));
assert.ok(diagnostic,'Diagnostic probe did not reach the native error panel; see last-native-diagnostic.json and diagnostic.png');
assert.equal(diagnostic.report.firstFailure.kind,'javascript-error');
assert.match(diagnostic.report.firstFailure.message,/QUIET_STACKS_DIAGNOSTIC_PROBE/);
assert.equal(diagnostic.copyVerified,true,'Copy diagnostic did not put the report on the clipboard');
// Objective-C boxes a logical expression as NSNumber(int) on some targets.
assert.ok(diagnostic.overlayVisible===true||diagnostic.overlayVisible===1,'Native diagnostic overlay was not visible');
assert.ok(diagnostic.report.firstFailure.line>0);
assert.equal(diagnostic.report.saved,undefined);assert.equal(diagnostic.report.books,undefined);
run('xcrun',['simctl','terminate',phone.udid,'com.krazel.quietstacks']);
run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks','--gallery-performance-smoke']);
let performanceProbe,shareProbe;
for(let n=0;n<120;n++){
 await new Promise(r=>setTimeout(r,1000));
 try{performanceProbe=JSON.parse(fs.readFileSync(path.join(container,'Documents/gallery-performance-probe.json'),'utf8'));shareProbe=JSON.parse(fs.readFileSync(path.join(container,'Documents/gallery-performance-share.json'),'utf8'));break;}catch{}
}
assert.ok(performanceProbe&&shareProbe,'Performance test did not finish, copy and present its file share sheet');
assert.equal(performanceProbe.copyVerified,true);assert.equal(performanceProbe.report.status,'complete');assert.equal(performanceProbe.report.stages.length,6);
assert.equal(performanceProbe.report.nativeStart.appVersion,JSON.parse(fs.readFileSync('package.json')).version);
assert.ok(performanceProbe.report.nativeStart.hardware);assert.equal(performanceProbe.report.nativeEnd.webContentMemoryMiB,null);
assert.ok(shareProbe.shareSheetPresented);assert.ok(shareProbe.jsonFileMatchesReport);assert.match(shareProbe.filename,/\.json$/);
fs.writeFileSync(path.join(out,'performance-report.json'),JSON.stringify(performanceProbe,null,2));fs.writeFileSync(path.join(out,'performance-share.json'),JSON.stringify(shareProbe,null,2));
run('xcrun',['simctl','io',phone.udid,'screenshot',path.join(out,'performance-share.png')]);
run('xcrun',['simctl','terminate',phone.udid,'com.krazel.quietstacks']);if(typeof container!=='undefined')fs.rmSync(path.join(container,'Documents/gallery-smoke.json'),{force:true});run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks','--gallery-restore-smoke']);
let performanceSavePreserved=false;for(let n=0;n<60;n++){await new Promise(r=>setTimeout(r,1000));const after=snapshot();if(after?.nativeReady&&after.bootSaved){assert.deepStrictEqual(JSON.parse(after.bootSaved),saved,'Performance test changed the saved game');performanceSavePreserved=true;break;}}
assert.ok(performanceSavePreserved);fs.writeFileSync(path.join(out,'performance-save.json'),JSON.stringify({preserved:true}));
// Same simulator, same saved game and automated path. Only renderer changes.
assert.equal(performanceProbe.report.environment.graphics.backend,'webgl');
run('xcrun',['simctl','terminate',phone.udid,'com.krazel.quietstacks']);
for(const name of ['gallery-performance-probe.json','gallery-performance-share.json'])fs.unlinkSync(path.join(container,'Documents',name));
run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks','--gallery-performance-smoke','--gallery-canvas-baseline']);
let baseline;for(let n=0;n<120;n++){await new Promise(r=>setTimeout(r,1000));try{baseline=JSON.parse(fs.readFileSync(path.join(container,'Documents/gallery-performance-probe.json'),'utf8'));break;}catch{}}
assert.equal(baseline?.report.status,'complete');assert.equal(baseline.report.environment.graphics.backend,'canvas2d');
const comparison=['pan-wide','zoom','drag','shelves'].map(name=>{const a=baseline.report.stages.find(s=>s.name===name),b=performanceProbe.report.stages.find(s=>s.name===name);return {name,canvasFPS:a.renderFPS,webglFPS:b.renderFPS,ratio:b.renderFPS/a.renderFPS};});
fs.writeFileSync(path.join(out,'renderer-comparison.json'),JSON.stringify({simulatorOnly:true,device:phone.name,runtime,comparison},null,2));fs.writeFileSync(path.join(out,'canvas-baseline-report.json'),JSON.stringify(baseline,null,2));
assert.ok(comparison.every(s=>s.webglFPS>=20),'GPU renderer did not sustain 20 submitted FPS in every motion stage');
assert.ok(comparison.filter(s=>['pan-wide','zoom'].includes(s.name)).every(s=>s.ratio>=1.5||s.canvasFPS>=40),'GPU path did not improve the slow camera stages');
async function checkBookUI(device,label,boot=false){
 if(boot){run('xcrun',['simctl','boot',device.udid]);run('xcrun',['simctl','bootstatus',device.udid,'-b']);run('xcrun',['simctl','install',device.udid,path.join(derived,'Build/Products/Release-iphonesimulator/QuietStacks.app')]);}
 else run('xcrun',['simctl','terminate',device.udid,'com.krazel.quietstacks']);
 run('xcrun',['simctl','launch',device.udid,'com.krazel.quietstacks','--gallery-ui-smoke']);const folder=run('xcrun',['simctl','get_app_container',device.udid,'com.krazel.quietstacks','data']);
 for(const view of ['details','summary']){let info;for(let n=0;n<60;n++){await new Promise(r=>setTimeout(r,500));try{info=JSON.parse(fs.readFileSync(path.join(folder,'Documents','gallery-ui-'+view+'.json')));break;}catch{}}
  assert.ok(info?.removed);assert.equal(info.selectionDisabled,true);assert.ok(info.title);if(view==='details'){assert.ok(info.inspection.height>=250);assert.ok(info.inspection.bottom<=info.height);assert.ok(info.close.height>=44);assert.ok(info.action.bottom<=info.height);assert.ok(info.summaryHidden);}else{assert.ok(!info.summaryHidden);assert.ok(info.summary.bottom<=info.height);if(label==='iphone')assert.ok(info.summary.height<=78);}
  fs.writeFileSync(path.join(out,label+'-'+view+'.json'),JSON.stringify(info,null,2));run('xcrun',['simctl','io',device.udid,'screenshot',path.join(out,label+'-'+view+'.png')]);
 }
}
await checkBookUI(phone,'iphone');run('xcrun',['simctl','shutdown',phone.udid]);
const tablet=available[runtime].find(d=>d.name.includes('iPad mini'))||available[runtime].find(d=>d.name.includes('iPad'));assert.ok(tablet,'iPad simulator unavailable');await checkBookUI(tablet,'ipad',true);
console.log(JSON.stringify({ready:true,sustainedSeconds:45,sorted,scattered,restored,diagnosticCopied:true,frames:previousFrames,mobileUI:true}));

import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const out=path.resolve('artifacts/native-qa');fs.mkdirSync(out,{recursive:true});
function run(cmd,args){console.log('QA step:',cmd,args.slice(0,3).join(' '));const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:20*1024*1024,timeout:180000});if(r.status!==0)throw Error(r.stderr||r.stdout||String(r.error||r.signal||r.status));return r.stdout.trim();}
run('node',['build.mjs']);run('node',['scripts/prepare-ios.mjs']);
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
const samples=[];let sorted=!!result.qaSorted,scattered=!!result.qaScattered,previousFrames=result.frames,staleSamples=0;
for(let n=0;n<45;n++){
 await new Promise(r=>setTimeout(r,1000));result=snapshot();
 if(!result?.nativeReady||result.errors?.length||result.processTerminations||result.storageError)throw Error('Gallery failed during sustained play: '+JSON.stringify({...result,saved:undefined,bootSaved:undefined}));
 staleSamples=result.frames<=previousFrames?staleSamples+1:0;if(staleSamples>=5)throw Error('Rendering stalled for five samples');previousFrames=result.frames;
 const shelf=result.saved?.books.filter(b=>b.place==='shelf').length||0,floor=result.saved?.books.filter(b=>b.place==='floor').length||0;
 if(result.qaSorted)sorted=true;if(result.qaScattered)scattered=true;
 samples.push({frames:result.frames,shelf,floor,qaTicks:result.qaTicks});
}
fs.writeFileSync(path.join(out,'launch.json'),JSON.stringify({device:phone.name,runtime,...result,samples,sorted,scattered},null,2));
run('xcrun',['simctl','io',phone.udid,'screenshot',path.join(out,'launch.png')]);
if(!sorted||!scattered)throw Error('Native sort/scatter/save sequence did not complete');
const saved=result.saved;
run('xcrun',['simctl','terminate',phone.udid,'com.krazel.quietstacks']);
run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks','--gallery-smoke']);
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
assert.equal(diagnostic.overlayVisible,true);
assert.ok(diagnostic.report.firstFailure.line>0);
assert.equal(diagnostic.report.saved,undefined);assert.equal(diagnostic.report.books,undefined);
console.log(JSON.stringify({ready:true,sustainedSeconds:45,sorted,scattered,restored,diagnosticCopied:true,frames:previousFrames}));

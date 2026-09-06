import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const out=path.resolve('artifacts/native-qa');fs.mkdirSync(out,{recursive:true});
function run(cmd,args){console.log('QA step:',cmd,args[0]);const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:20*1024*1024,timeout:180000});if(r.status!==0)throw Error(r.stderr||r.stdout);return r.stdout.trim();}
run('node',['build.mjs']);run('node',['scripts/prepare-ios.mjs']);
const derived=path.join(process.env.RUNNER_TEMP,'QuietStacksQA');
const log=spawnSync('xcodebuild',['build','-project','ios/QuietStacks.xcodeproj','-scheme','QuietStacks','-configuration','Release','-sdk','iphonesimulator','-destination','generic/platform=iOS Simulator','-derivedDataPath',derived,'CODE_SIGNING_ALLOWED=NO'],{encoding:'utf8',maxBuffer:20*1024*1024,timeout:180000});
fs.writeFileSync(path.join(out,'compile.log'),log.stdout+log.stderr);if(log.status!==0)throw Error(log.stdout.slice(-12000));
const available=JSON.parse(run('xcrun',['simctl','list','devices','available','--json'])).devices;
const runtime=Object.keys(available).filter(k=>k.includes('iOS-')).sort().reverse()[0];
const phone=available[runtime].find(d=>d.name.includes('iPhone'));
run('xcrun',['simctl','boot',phone.udid]);run('xcrun',['simctl','bootstatus',phone.udid,'-b']);
run('xcrun',['simctl','install',phone.udid,path.join(derived,'Build/Products/Release-iphonesimulator/QuietStacks.app')]);
run('xcrun',['simctl','launch',phone.udid,'com.krazel.quietstacks.webdemo','--gallery-smoke']);
const container=run('xcrun',['simctl','get_app_container',phone.udid,'com.krazel.quietstacks.webdemo','data']);
let result;for(let n=0;n<40;n++){await new Promise(r=>setTimeout(r,1000));try{result=JSON.parse(fs.readFileSync(path.join(container,'Documents/gallery-smoke.json'),'utf8'));if(result.ready||result.errors?.length)break;}catch{}}
fs.writeFileSync(path.join(out,'launch.json'),JSON.stringify({device:phone.name,runtime,...result},null,2));
run('xcrun',['simctl','io',phone.udid,'screenshot',path.join(out,'launch.png')]);
console.log(JSON.stringify(result));if(!result?.ready||result.errors?.length)throw Error('iOS gallery failed to open; see native-qa artifacts');

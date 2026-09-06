import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const cfg=JSON.parse(fs.readFileSync('store/testflight.json','utf8').replace(/^\uFEFF/,''));
if(process.platform!=='darwin'||process.env.QUIET_STACKS_DISTRIBUTION!=='testflight')throw Error('Explicit macOS TestFlight environment required');
const temp=process.env.RUNNER_TEMP;if(!temp)throw Error('Missing runner temp');
function run(cmd,args,{quiet=false}={}){const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:20*1024*1024});if(!quiet)process.stdout.write(r.stdout||'');if(r.status!==0)throw Error(`${cmd} failed: ${r.stderr||r.stdout}`);return r.stdout.trim();}
function decode(name,file){if(!process.env[name])throw Error('Missing '+name);fs.writeFileSync(file,Buffer.from(process.env[name],'base64'),{mode:0o600});}
const keychain=path.join(temp,'quiet-stacks-signing.keychain-db'),p12=path.join(temp,'distribution.p12'),pp=path.join(temp,'quiet-stacks.mobileprovision'),ppxml=path.join(temp,'profile.plist'),password=crypto.randomBytes(24).toString('hex');
const keyDir=path.join(process.env.HOME,'.appstoreconnect/private_keys');fs.mkdirSync(keyDir,{recursive:true});const keyPath=path.join(keyDir,`AuthKey_${process.env.ASC_KEY_ID}.p8`);
decode('IOS_DISTRIBUTION_P12_BASE64',p12);decode('IOS_APP_STORE_PROFILE_BASE64',pp);decode('ASC_PRIVATE_KEY_BASE64',keyPath);
try{
 run('node',['build.mjs']);run('node',['scripts/prepare-ios.mjs']);
 run('security',['cms','-D','-i',pp,'-o',ppxml]);
 const summary=JSON.parse(run('python3',['-c',"import plistlib,json,sys; p=plistlib.load(open(sys.argv[1],'rb')); print(json.dumps({k:p[k] for k in ['Name','UUID','Entitlements']}))",ppxml],{quiet:true}));
 if(summary.Entitlements['application-identifier']!==`${cfg.teamId}.${cfg.bundleId}`||summary.Entitlements['get-task-allow']!==false||summary.Entitlements['beta-reports-active']!==true)throw Error('Wrong App Store profile');
 const ppDir=path.join(process.env.HOME,'Library/MobileDevice/Provisioning Profiles');fs.mkdirSync(ppDir,{recursive:true});fs.copyFileSync(pp,path.join(ppDir,summary.UUID+'.mobileprovision'));
 run('security',['create-keychain','-p',password,keychain],{quiet:true});run('security',['set-keychain-settings','-lut','21600',keychain]);run('security',['unlock-keychain','-p',password,keychain],{quiet:true});
 run('security',['import',p12,'-k',keychain,'-P',process.env.IOS_DISTRIBUTION_P12_PASSWORD,'-T','/usr/bin/codesign','-T','/usr/bin/security'],{quiet:true});
 run('security',['list-keychains','-d','user','-s',keychain]);run('security',['set-key-partition-list','-S','apple-tool:,apple:,codesign:','-s','-k',password,keychain],{quiet:true});
 const archive=path.join(temp,'QuietStacks.xcarchive');
 run('xcodebuild',['archive','-project','ios/QuietStacks.xcodeproj','-scheme','QuietStacks','-configuration','Release','-destination','generic/platform=iOS','-archivePath',archive,'ARCHS=arm64','ONLY_ACTIVE_ARCH=NO','CODE_SIGN_STYLE=Manual',`DEVELOPMENT_TEAM=${cfg.teamId}`,'CODE_SIGN_IDENTITY=Apple Distribution',`PROVISIONING_PROFILE_SPECIFIER=${summary.Name}`,`CURRENT_PROJECT_VERSION=${cfg.buildNumber}`]);
 const app=path.join(archive,'Products/Applications/QuietStacks.app');run('codesign',['--verify','--deep','--strict',app]);
 const options=path.join(temp,'ExportOptions.plist');
 const exportSettings={method:'app-store-connect',destination:'export',teamID:cfg.teamId,signingStyle:'manual',signingCertificate:'Apple Distribution',provisioningProfiles:{[cfg.bundleId]:summary.Name},manageAppVersionAndBuildNumber:false,uploadSymbols:true,stripSwiftSymbols:true};
 const settingsPath=path.join(temp,'export.json');fs.writeFileSync(settingsPath,JSON.stringify(exportSettings));run('python3',['-c',"import plistlib,json,sys; plistlib.dump(json.load(open(sys.argv[1])),open(sys.argv[2],'wb'))",settingsPath,options]);
 const exported=path.join(temp,'quiet-stacks-export');run('xcodebuild',['-exportArchive','-archivePath',archive,'-exportOptionsPlist',options,'-exportPath',exported]);
 const ipa=path.join(exported,fs.readdirSync(exported).find(n=>n.endsWith('.ipa')));fs.mkdirSync('artifacts/testflight',{recursive:true});
 const final=`artifacts/testflight/QuietStacks-${cfg.marketingVersion}-build${cfg.buildNumber}-${process.env.GITHUB_SHA.slice(0,7)}-TestFlight.ipa`;fs.copyFileSync(ipa,final);
 run('python3',['scripts/verify-ipa.py',final]);
 fs.writeFileSync('artifacts/testflight/manifest.json',JSON.stringify({...cfg,commit:process.env.GITHUB_SHA,run:process.env.GITHUB_RUN_ID,ipa:path.basename(final),sha256:crypto.createHash('sha256').update(fs.readFileSync(final)).digest('hex'),signatureVerified:true},null,2));
 run('xcrun',['altool','--validate-app','-f',final,'-t','ios','--apiKey',process.env.ASC_KEY_ID,'--apiIssuer',process.env.ASC_ISSUER_ID]);
 run('xcrun',['altool','--upload-app','-f',final,'-t','ios','--apiKey',process.env.ASC_KEY_ID,'--apiIssuer',process.env.ASC_ISSUER_ID]);
 fs.writeFileSync('artifacts/testflight/upload.json',JSON.stringify({uploaded:true,appId:cfg.appId,version:cfg.marketingVersion,build:cfg.buildNumber,commit:process.env.GITHUB_SHA,run:process.env.GITHUB_RUN_ID},null,2));
}finally{
 spawnSync('security',['delete-keychain',keychain],{stdio:'ignore'});for(const file of [p12,pp,ppxml,keyPath])if(fs.existsSync(file))fs.unlinkSync(file);
}

import {readFile, mkdir, copyFile, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const target = path.join(root, 'ios', 'web');
if (path.relative(root, target) !== path.join('ios', 'web')) throw Error('Invalid bundle path');
const manifest = JSON.parse(await readFile(path.join(root, 'artifacts/web-build.json'), 'utf8'));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (manifest.version !== pkg.version) throw Error('Build version differs from package');
const project = await readFile(path.join(root, 'ios/QuietStacks.xcodeproj/project.pbxproj'), 'utf8');
if (!project.includes(`MARKETING_VERSION = ${pkg.version};`)) throw Error('iOS version differs from web version');
for (const name of manifest.files) {
  if (path.isAbsolute(name) || name.split(/[\\/]/).includes('..')) throw Error('Invalid asset path');
}
await rm(target, {recursive:true, force:true});
for (const name of manifest.files) {
  const destination = path.join(target, name);
  await mkdir(path.dirname(destination), {recursive:true});
  await copyFile(path.join(root, 'web', name), destination);
}
console.log(`iOS web bundle: ${manifest.files.length} active files, version ${pkg.version}`);

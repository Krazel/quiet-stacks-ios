import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import files from './runtime-files.mjs';
await mkdir(new URL('./dist/js/',import.meta.url),{recursive:true});
await mkdir(new URL('./dist/assets/',import.meta.url),{recursive:true});
for(const name of files)await copyFile(new URL('./web/'+name,import.meta.url),new URL('./dist/'+name,import.meta.url));
await writeFile(new URL('./artifacts/web-build.json',import.meta.url),JSON.stringify({version:'0.16.9',files,engine:'HTML + Canvas 2D + JavaScript',dependencies:0},null,2));
console.log('Built dist/ — manual gallery, '+files.length+' files, no runtime dependencies.');

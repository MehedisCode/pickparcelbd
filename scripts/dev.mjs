import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(!existsSync(path.join(root,'backend/vendor/autoload.php'))||!existsSync(path.join(root,'backend/.env'))){
 console.error('Complete the local setup in README.md first.');process.exit(1);
}
const php=process.env.PICKPARCEL_PHP||(existsSync('/tmp/pickparcel-runtime/php')?'/tmp/pickparcel-runtime/php':'php');
const children=[spawn(php,['-S','127.0.0.1:8000','-t','public','public/index.php'],{cwd:path.join(root,'backend'),stdio:'inherit'}),spawn(process.platform==='win32'?'npm.cmd':'npm',['run','dev'],{cwd:path.join(root,'frontend'),stdio:'inherit'})];
let closing=false;
function close(code=0){if(closing)return;closing=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code;}
for(const child of children){child.on('error',e=>{console.error(e.message);close(1);});child.on('exit',code=>close(code??0));}
process.on('SIGINT',()=>close());process.on('SIGTERM',()=>close());

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fail(message) {
  console.error(message);
  process.exit(1);
}
if (!existsSync(path.join(root, 'backend/vendor/autoload.php')) || !existsSync(path.join(root, 'backend/.env'))) {
  fail('Complete the local setup in README.md first (PHP, Composer, backend dependencies and .env).');
}
const hasSystemPhp = spawnSync('php', ['-v'], { stdio: 'ignore' }).status === 0;
const php = process.env.PICKPARCEL_PHP || (hasSystemPhp ? 'php' : existsSync('/tmp/pickparcel-runtime/php') ? '/tmp/pickparcel-runtime/php' : 'php');
if (spawnSync(php, ['-v'], { stdio: 'ignore' }).status !== 0) {
  fail('PHP is unavailable. Install PHP and its extensions using the Ubuntu instructions in README.md, or set PICKPARCEL_PHP.');
}
if (php === '/tmp/pickparcel-runtime/php') {
  console.warn('Using temporary development PHP. Install system PHP for a permanent setup; see README.md.');
}
const env = readFileSync(path.join(root, 'backend/.env'), 'utf8');
if (!/^APP_KEY\s*=\s*["']?base64:[A-Za-z0-9+/]+=*["']?\s*$/m.test(env)) {
  fail('APP_KEY is missing from backend/.env. Follow the initial setup in README.md. Preserve an existing key when reusing a database.');
}
if (!existsSync(path.join(root, 'frontend/node_modules/next/package.json'))) {
  fail('Frontend dependencies are missing. Run npm ci inside frontend first.');
}
for (const port of [8000, 3000]) {
  await new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (error) => fail(error.code === 'EADDRINUSE'
      ? `Port ${port} is already in use. If PickParcelBD is already running, open http://127.0.0.1:3000. Otherwise stop the previous server with Ctrl+C, then run npm run dev again.`
      : `Cannot listen on port ${port}: ${error.message}`));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}
const children = [
  spawn(php, ['-S', '127.0.0.1:8000', '-t', 'public', 'public/index.php'], { cwd: path.join(root, 'backend'), stdio: 'inherit' }),
  spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], { cwd: path.join(root, 'frontend'), stdio: 'inherit' }),
];
let closing = false;
function close(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', (error) => { console.error(error.message); close(1); });
  child.on('exit', (code) => close(code ?? 0));
}
process.on('SIGINT', () => close());
process.on('SIGTERM', () => close());

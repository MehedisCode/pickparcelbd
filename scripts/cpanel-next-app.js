// Copy beside runtime/ in the cPanel Node.js application root.
// A deployment.hold file keeps requests away from an incomplete release.
const fs = require('node:fs');
const path = require('node:path');

process.env.BACKEND_URL ||= 'https://staging-api.pickparcelbd.com';
process.env.NEXT_PUBLIC_SITE_URL ||= 'https://staging.pickparcelbd.com';
process.env.NODE_ENV = 'production';
process.env.HOSTNAME = '127.0.0.1';

if (fs.existsSync(path.join(__dirname, 'deployment.hold'))) {
  require('node:http').createServer((_request, response) => {
    response.writeHead(503, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '300',
      'X-Robots-Tag': 'noindex, nofollow',
    });
    response.end('PickParcelBD staging deployment is being configured.');
  }).listen(Number(process.env.PORT) || 3000);
} else {
  require('./runtime/server.js');
}

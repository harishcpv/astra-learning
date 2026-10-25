const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);

const routes = new Map([
  ['/', { file: path.join(ROOT, 'gui', 'index.html'), type: 'text/html; charset=utf-8' }],
  ['/gui/index.html', { file: path.join(ROOT, 'gui', 'index.html'), type: 'text/html; charset=utf-8' }],
  ['/gui/styles.css', { file: path.join(ROOT, 'gui', 'styles.css'), type: 'text/css; charset=utf-8' }],
  ['/gui/learning-engine.js', { file: path.join(ROOT, 'gui', 'learning-engine.js'), type: 'application/javascript; charset=utf-8' }],
  ['/gui/app.js', { file: path.join(ROOT, 'gui', 'app.js'), type: 'application/javascript; charset=utf-8' }],
  ['/content-plans/pdfs/harish-vlogs.pdf', { file: path.join(ROOT, 'content-plans', 'pdfs', 'harish-vlogs.pdf'), type: 'application/pdf' }],
  ['/content-plans/pdfs/harish-tiny-kitchen.pdf', { file: path.join(ROOT, 'content-plans', 'pdfs', 'harish-tiny-kitchen.pdf'), type: 'application/pdf' }],
  ['/content-plans/pdfs/priyacreatives-fashion.pdf', { file: path.join(ROOT, 'content-plans', 'pdfs', 'priyacreatives-fashion.pdf'), type: 'application/pdf' }],
]);

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`).pathname;
  const route = routes.get(pathname);
  if (!route) {
    send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    return;
  }
  fs.stat(route.file, (statError, stat) => {
    if (statError || !stat.isFile()) {
      send(res, 500, 'Required workspace asset is missing', 'text/plain; charset=utf-8');
      return;
    }
    res.writeHead(200, { 'Content-Type': route.type, 'Content-Length': stat.size, 'Cache-Control': 'no-store' });
    fs.createReadStream(route.file).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Orbit GUI running at http://127.0.0.1:${PORT}`);
});

server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

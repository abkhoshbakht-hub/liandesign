#!/usr/bin/env node
/**
 * Static dev server - zero dependencies.
 * Usage: node serve.js [port]
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.zip': 'application/zip'
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'Cache-Control': 'no-store' }, headers || {}));
  res.end(body);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(url.parse(req.url).pathname || '/');
  } catch {
    return send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  // resolve + contain inside ROOT
  const target = path.resolve(ROOT, '.' + path.posix.normalize(pathname));
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  fs.stat(target, (err, stat) => {
    if (err || !stat) {
      return send(res, 404, '404 Not Found: ' + pathname, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    const file = stat.isDirectory() ? path.join(target, 'index.html') : target;
    fs.readFile(file, (err2, data) => {
      if (err2) {
        return send(res, 404, '404 Not Found: ' + pathname, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      send(res, 200, data, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('  Ariatech  ->  http://localhost:' + PORT);
  console.log('  serving:   ' + ROOT);
  console.log('  press Ctrl+C to stop');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('  port ' + PORT + ' is busy - try:  node serve.js ' + (PORT + 1));
  } else {
    console.error(e.message);
  }
  process.exit(1);
});

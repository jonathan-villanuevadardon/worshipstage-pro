import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

function safeFilePath(pathname) {
  const candidate = resolve(root, pathname.replace(/^\/+/, ''));
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : null;
}

function sendFile(request, response, filePath) {
  const isIndex = filePath === resolve(root, 'index.html');
  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': isIndex
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000, immutable',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath)
    .on('error', () => {
      if (!response.headersSent) response.writeHead(500);
      response.end('Internal Server Error');
    })
    .pipe(response);
}

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
    return;
  }

  const requestedPath = safeFilePath(pathname === '/' ? 'index.html' : pathname);
  const filePath = requestedPath && existsSync(requestedPath) && statSync(requestedPath).isFile()
    ? requestedPath
    : resolve(root, 'index.html');

  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end('Not Found');
    return;
  }

  sendFile(request, response, filePath);
}).listen(port, '0.0.0.0', () => {
  console.log(`WorshipStage static server listening on port ${port}`);
});

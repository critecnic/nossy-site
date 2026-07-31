import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { URL } from 'url';

const NEXT_DIR = '/home/z/my-project/.next';
const PORT = 3789;

// Map Turbopack phantom chunks to their webpack equivalents
// The Turbopack runtime injects these references but the actual code is in webpack chunks
const CHUNK_MAP = {
  '21762618518ba9a5.css': null, // CSS is already in other files, serve empty
  '6357ba953b6895f1.js': null, // Will serve a module no-op that re-exports from existing chunks
  '341668d67e1b1f50.js': null,
};

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.txt': 'text/plain',
};

// Simple API handler for jobs
function handleApiJobs(res, search) {
  const params = new URLSearchParams(search);
  const country = params.get('country');
  try {
    // Dynamically import the API route
    const mod = await import('/home/z/my-project/src/app/api/jobs/route.ts');
    // The route exports GET as default or named
    const handler = mod.GET || mod.default;
    if (handler) {
      const req = { url: '/api/jobs?' + search.toString(), nextUrl: { searchParams: params } };
      const response = await handler(req);
      const data = await response.json();
      const filtered = country ? data.filter(j => j.country === country) : data;
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(filtered));
      return;
    }
  } catch (e) {
    console.error('API error:', e.message);
  }
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end('[]');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API route
  if (pathname === '/api/jobs') {
    await handleApiJobs(res, url.search);
    return;
  }

  // Static files from .next/static
  if (pathname.startsWith('/_next/static/')) {
    const filePath = join(NEXT_DIR, pathname);
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(readFileSync(filePath));
      return;
    }
    // Check phantom chunk map
    const fileName = pathname.split('/').pop();
    if (CHUNK_MAP.hasOwnProperty(fileName)) {
      const ext = extname(fileName);
      if (ext === '.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end('');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end('');
      }
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // SSG HTML pages
  const ssgPath = join(NEXT_DIR, 'server/app', pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '')}/index.html`);
  if (existsSync(ssgPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync(ssgPath));
    return;
  }

  // Try .segments RSC
  const segPath = join(NEXT_DIR, 'server/app', pathname.replace(/^\//, '') + '.segments', '_index.segment.rsc');
  if (existsSync(segPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync(segPath));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Preview server on http://127.0.0.1:${PORT}`);
});

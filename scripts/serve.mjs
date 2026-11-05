import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const argument = (name, fallback) => { const index = args.indexOf(name); return index === -1 ? fallback : args[index + 1]; };
const root = path.resolve(workspace, args.includes('--dist') ? 'dist' : '.');
const base = `/${argument('--base', '').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
const port = Number(argument('--port', 5173));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.wasm': 'application/wasm', '.md': 'text/plain; charset=utf-8' };
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (base !== '/' && pathname === base.slice(0, -1)) { response.writeHead(302, { Location: base }); response.end(); return; }
    if (!pathname.startsWith(base)) { response.writeHead(404); response.end('Not found'); return; }
    const relative = pathname.slice(base.length) || 'index.html';
    const filename = path.resolve(root, relative);
    const inside = path.relative(root, filename);
    const segments = inside.split(path.sep);
    if (inside.startsWith('..') || path.isAbsolute(inside) || segments.some((segment) => segment.startsWith('.') || segment === 'node_modules') || !mime[path.extname(filename)]) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    const info = await stat(filename);
    if (!info.isFile()) throw new Error('Not found');
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()' });
    response.end(request.method === 'HEAD' ? undefined : await readFile(filename));
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Mallorca Unlocked · http://127.0.0.1:${port}${base}`));
server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());

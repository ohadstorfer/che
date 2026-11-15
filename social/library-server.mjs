// The content library dashboard (2026-11-06): see what is only on this disk, what is safe on S3, and move things.
//   node library-server.mjs   → http://localhost:4580   (or preview_start "posta-library")
// Approve = push to S3 and check it; then "free up" deletes the local copy, only after S3 is checked again (md5).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT, status, push, prune, pull, presign} from './library.mjs';

const PORT = 4580;
const job = {running: false, kind: '', total: 0, done: 0, log: []};

function disk() {
  const [, , , avail] = execFileSync('df', ['-k', ROOT], {encoding: 'utf8'}).trim().split('\n')[1].split(/\s+/);
  const [, total] = execFileSync('df', ['-k', ROOT], {encoding: 'utf8'}).trim().split('\n')[1].split(/\s+/);
  return {free: +avail * 1024, total: +total * 1024};
}
const body = req => new Promise(ok => { let s = ''; req.on('data', d => s += d); req.on('end', () => ok(s ? JSON.parse(s) : {})); });
const send = (res, code, data, type = 'application/json') => { res.writeHead(code, {'content-type': type}); res.end(type === 'application/json' ? JSON.stringify(data) : data); };

async function start(kind, paths) {
  if (job.running) return false;
  Object.assign(job, {running: true, kind, total: paths.length, done: 0, log: []});
  const log = line => { job.log.push(line); job.done++; };
  const fn = {push, prune, pull}[kind];
  fn(paths, log).catch(e => job.log.push('ERROR ' + e.message)).finally(() => { job.running = false; });
  return true;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/') return send(res, 200, fs.readFileSync(new URL('./library.html', import.meta.url)), 'text/html; charset=utf-8');
    if (url.pathname === '/api/list') return send(res, 200, {rows: await status(), disk: disk(), job});
    if (url.pathname === '/api/job') return send(res, 200, {job, disk: disk()});
    if (req.method === 'POST' && ['/api/push', '/api/prune', '/api/pull'].includes(url.pathname)) {
      const {paths = []} = await body(req);
      return send(res, (await start(url.pathname.slice(5), paths)) ? 202 : 409, {job});
    }
    if (url.pathname === '/media') {
      const rel = url.searchParams.get('p') || '', file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT + path.sep)) return send(res, 400, {error: 'bad path'});
      if (!fs.existsSync(file)) { res.writeHead(302, {location: await presign(rel)}); return res.end(); } // only on S3: watch it from there
      const size = fs.statSync(file).size, type = /\.mp4$/i.test(file) ? 'video/mp4' : /\.png$/i.test(file) ? 'image/png' : /\.webp$/i.test(file) ? 'image/webp' : /\.jpe?g$/i.test(file) ? 'image/jpeg' : 'application/octet-stream';
      const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
      if (range) {
        const a = +range[1] || 0, b = range[2] ? +range[2] : size - 1;
        res.writeHead(206, {'content-type': type, 'content-range': `bytes ${a}-${b}/${size}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1});
        return fs.createReadStream(file, {start: a, end: b}).pipe(res);
      }
      res.writeHead(200, {'content-type': type, 'content-length': size, 'accept-ranges': 'bytes'});
      return fs.createReadStream(file).pipe(res);
    }
    send(res, 404, {error: 'not found'});
  } catch (e) { send(res, 500, {error: e.message}); }
}).listen(PORT, () => console.log(`library on http://localhost:${PORT}`));

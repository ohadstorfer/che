// usage: node yt-auth.mjs   One-time: lets the Posta YouTube channel authorize our Google Cloud OAuth client and saves
//   YT_REFRESH_TOKEN in ../.env (needs YT_CLIENT_ID and YT_CLIENT_SECRET there). Open the printed URL, pick the
//   account that owns the channel (support@picawave.com) and allow.
import http from 'node:http'; import fs from 'node:fs';
const ENV = new URL('../.env', import.meta.url);
const env = Object.fromEntries(fs.readFileSync(ENV, 'utf8').split('\n').filter(l => /^\w+=/.test(l)).map(l => [l.split('=')[0], l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]));
const {YT_CLIENT_ID: id, YT_CLIENT_SECRET: secret} = env;
if (!id || !secret) throw new Error('YT_CLIENT_ID / YT_CLIENT_SECRET missing in .env');
const PORT = 4597, redirect = `http://127.0.0.1:${PORT}`;
const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl';
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({client_id: id, redirect_uri: redirect, response_type: 'code', scope, access_type: 'offline', prompt: 'consent', login_hint: 'support@picawave.com'});
console.log('Open:\n' + url);
const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get('code');
  if (!code) { res.end('no code'); return; }
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', body: new URLSearchParams({code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: 'authorization_code'})});
  const t = await r.json();
  if (!t.refresh_token) { res.end('failed: ' + JSON.stringify(t)); console.error(t); process.exit(1); }
  let text = fs.readFileSync(ENV, 'utf8').replace(/^YT_REFRESH_TOKEN=.*\n?/m, '');
  fs.writeFileSync(ENV, text.replace(/\n?$/, '\n') + `YT_REFRESH_TOKEN=${t.refresh_token}\n`);
  res.end('Posta YouTube: authorized. You can close this tab.');
  console.log('saved YT_REFRESH_TOKEN'); server.close();
}).listen(PORT, '127.0.0.1');

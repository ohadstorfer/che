// usage: node yt-meta.mjs <video id>...   Writes ~/che/posta-videos/youtube/<id>.txt with the title, description and tags
//   (src/yt/meta.mjs), ready to paste into Studio. yt-upload.mjs sends the same through the API.
import fs from 'fs'; import os from 'os';
import {meta} from './src/yt/meta.mjs';
for (const id of process.argv.slice(2)) {
  const m = meta(id);
  fs.writeFileSync(`${os.homedir()}/che/posta-videos/youtube/${id}.txt`, `TITLE\n${m.title}\n\nDESCRIPTION\n${m.description}\n\nTAGS\n${m.tags.join(', ')}\n`);
  console.log(id, m.title);
}

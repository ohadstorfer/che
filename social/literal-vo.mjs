// Lengths of the app's clips used by the literal reels (src/literal), for the timeline. No recording here.
//   node literal-vo.mjs   ->  src/literal/clips.json  {<id>: seconds, <id>-ex: seconds}
import fs from 'node:fs';
import {envelope} from './vo-lib.mjs';
const out = {};
for (const f of fs.readdirSync('public/vo/literal').filter(f => f.endsWith('.mp3')))
  out[f.replace(/\.mp3$/, '')] = +envelope(`public/vo/literal/${f}`).seconds.toFixed(2);
fs.writeFileSync('src/literal/clips.json', JSON.stringify(out, null, 0));
console.log(Object.keys(out).length, 'clips', Math.max(...Object.values(out)), 's longest');

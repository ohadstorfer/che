// YouTube title, description (blurb, links, chapters from the voice timings) and tags for one video in videos.mjs.
import fs from 'fs';
import {video} from './videos.mjs';
export function meta(id) {
  const V = video(id), T = JSON.parse(fs.readFileSync(new URL(`./timing/${id}.json`, import.meta.url), 'utf8'));
  let at = 10; const chapters = [];
  for (const ch of V.chapters) {
    const s = at / 30;
    chapters.push(`${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')} ${ch.step ? ch.step + ': ' : ''}${ch.title}`);
    at += Math.ceil(T[ch.id].seconds * 30) + 21;
  }
  const y = V.youtube ?? {};
  const description = `${y.blurb ?? ''}

📱 Practice with Posta, the Argentine Spanish app: https://postaspanish.com
📖 Free guide: https://${V.guide}

Chapters
${chapters.join('\n')}

#ArgentineSpanish #LearnSpanish #Voseo #Lunfardo #BuenosAires`;
  return {title: y.title, description, tags: y.tags ?? []};
}

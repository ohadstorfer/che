// Builds the three free guides that comment-to-DM posts give away, into ../posta-site/free:
//   /free/slang   "GUIDE" or "SLANG"  the 50 everyday words, grouped by theme
//   /free/vos     "VOS"               the vos cheat sheet: rules, commands, the 50 verbs
//   /free/learn   "LEARN"             how to learn Argentine Spanish: 5 steps + a 30-day plan
// Each page shows the whole guide and the PDF button, open to everyone. At the end an
// optional box offers to email the PDF (functions/free-guide saves the address in
// public.guide_leads and sends it once). The same
// page printed is the PDF: free/pdf/<slug>.pdf, made here with headless Chrome.
//
//   node scripts/site/build-free.mjs            (pages + PDFs)
//   node scripts/site/build-free.mjs --no-pdf   (pages only)
//
// The keywords live in functions/meta-comments (KEYWORDS); keep them and these slugs in step.
// Same rules as guides.mjs: plain English, vos only, no other learning apps named.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';
import { top50 } from './guides.mjs';
import { VERBS, conj } from './vos.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SITE = path.resolve(ROOT, '../posta-site');
const OUT = path.join(SITE, 'free');
const ORIGIN = 'https://postaspanish.com';
const ENDPOINT = 'https://qbzjaseetusewxnfgpes.supabase.co/functions/v1/free-guide';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const prose = (s) => esc(s).replace(/&quot;([^&]*?)&quot;/g, '“$1”');
const es = (s) => `<span lang="es-AR">${esc(s)}</span>`;

// ---------------------------------------------------------------- slang

const allWords = yaml.load(fs.readFileSync(path.join(ROOT, 'docs/argentine/words.yaml'), 'utf8')).words;
const byEs = new Map(allWords.map((w) => [w.es, w]));
const pack = top50.map((x) => {
  const w = byEs.get(x);
  if (!w?.example) throw new Error(`slang pack: no word or example for ${x}`);
  return w;
});

// Hand-made groups read better than the yaml themes for a first list.
const SLANG_GROUPS = [
  ['Words you’ll hear in every chat', 'The fillers and reactions that run every conversation.', ['che', 'dale', 're', 'posta', 'qué onda', 'todo bien', 'viste', 'o sea', 'tipo', 'chau', 'buen día', 'no te puedo creer', 'es un montón', 'por las dudas']],
  ['People', 'Guys, girls, friends and legends.', ['boludo', 'chabón', 'pibe', 'piba', 'mina', 'flaco', 'capo', 'loco']],
  ['Work and money', 'What you do all week, and what you get for it.', ['laburo', 'laburar', 'plata', 'guita', 'luca', 'mango', 'garpar']],
  ['Going out', 'Friday night, from the previa to the boliche.', ['birra', 'boliche', 'joda', 'previa', 'bondi', 'morfar']],
  ['Moods and reactions', 'How it went, and how you feel about it.', ['quilombo', 'trucho', 'fiaca', 'bajón', 'bronca', 'embole', 'copado', 'mala onda', 'al pedo', 'ni en pedo', 'en pedo']],
  ['Verbs you need', 'Short verbs that do a lot of work.', ['dar bola', 'zafar', 'bancar', 'fijarse']],
];
{
  const grouped = SLANG_GROUPS.flatMap((g) => g[2]);
  const missing = top50.filter((w) => !grouped.includes(w));
  const extra = grouped.filter((w) => !top50.includes(w));
  if (missing.length || extra.length || grouped.length !== 50) throw new Error(`slang groups: missing ${missing}, extra ${extra}`);
}

let n = 0;
const wordCard = (w) => {
  n += 1;
  const careful = w.vulgar || /boludo|pedo/.test(w.es);
  return `<li class="wcard">
  <div class="wcard-top"><span class="num">${n}</span><h4 lang="es-AR">${esc(w.es)}</h4>${careful ? '<span class="chip warn">Careful</span>' : ''}</div>
  <p class="gloss">${esc(w.en)}</p>
  ${w.note ? `<p class="note">${prose(w.note)}</p>` : ''}
  <p class="ex">${es(w.example.es)}<span class="en">${esc(w.example.en)}</span></p>
</li>`;
};
const slangSections = SLANG_GROUPS.map(([title, sub, list]) => ({
  title,
  html: `<p class="sub">${esc(sub)}</p>\n<ol class="wgrid">${list.map((x) => wordCard(byEs.get(x))).join('\n')}</ol>`,
}));
slangSections.push({
  title: 'How to make them stick',
  html: `<ol class="steps">
  <li><b>Five a day.</b> Read five words out loud, with the example. Tomorrow, the next five. In ten days you have all 50.</li>
  <li><b>Hunt for them.</b> Put on any Argentine series or stream and count how many of these you hear in ten minutes. “Che”, “dale” and “re” come first.</li>
  <li><b>Use one today.</b> Text a friend “dale” instead of “OK”. Say “¿posta?” instead of “really?”. One word a day, used for real, beats fifty read once.</li>
</ol>`,
});

// ---------------------------------------------------------------- vos

const vosRow = (inf) => {
  const c = conj(inf);
  return `<tr><td><b lang="es-AR">${inf}</b><span class="m">${esc(VERBS[inf])}</span></td><td class="vos" lang="es-AR">vos ${c.vosPres}</td><td class="vos" lang="es-AR">${c.vosImp ?? '—'}</td><td lang="es-AR">${c.pret}</td></tr>`;
};
const table = (head, rows) => `<div class="table"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const compare = (rows) => table(['Verb', 'Vos', 'Tú (not used)'], rows.map(([v, m, vos, tu]) => `<tr><td><b lang="es-AR">${v}</b><span class="m">${m}</span></td><td class="vos" lang="es-AR">${vos}</td><td class="tu" lang="es-AR">${tu}</td></tr>`));

const verbEx = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'data/verbs.json'), 'utf8')).ex;
const EX_VERBS = ['tener', 'querer', 'poder', 'venir', 'hacer', 'decir', 'salir', 'saber', 'pedir', 'volver', 'entender', 'abrir'];
const vosExamples = EX_VERBS.map((v) => verbEx.find((e) => e.lemma === v && e.es.length < 46)).filter(Boolean);

const vosSections = [
  {
    title: 'The one rule',
    html: `<div class="answer"><p>Take the infinitive, drop the final <b>-r</b>, add <b>-s</b> and stress the last vowel. That’s the present tense with vos.</p></div>
<div class="rule"><span lang="es-AR">habla<s>r</s></span><span class="arrow">→</span><span lang="es-AR" class="hl">hablás</span><span lang="es-AR">come<s>r</s></span><span class="arrow">→</span><span lang="es-AR" class="hl">comés</span><span lang="es-AR">vivi<s>r</s></span><span class="arrow">→</span><span lang="es-AR" class="hl">vivís</span></div>
${compare([['querer', 'to want', 'vos querés', 'tú quieres'], ['poder', 'can', 'vos podés', 'tú puedes'], ['tener', 'to have', 'vos tenés', 'tú tienes'], ['dormir', 'to sleep', 'vos dormís', 'tú duermes']])}
<p>See it? With tú, those verbs change their stem (quiero → quieres). <b>With vos they don’t.</b> That’s why vos is easier than tú.</p>`,
  },
  {
    title: 'The only irregular you need',
    html: `<div class="big"><span lang="es-AR">vos <b>sos</b></span><span class="m">you are (from ser)</span></div>
<p>Ir, ver, dar and estar are short, but they follow the same pattern:</p>
${compare([['ir', 'to go', 'vos vas', 'tú vas'], ['ver', 'to see', 'vos ves', 'tú ves'], ['estar', 'to be', 'vos estás', 'tú estás']])}
<p>Te, tu and the rest don’t change: “Vos te llamás Ana”, “¿Es tu auto?”. Only contigo does: it becomes <b lang="es-AR">con vos</b>.</p>`,
  },
  {
    title: 'Orders: even easier',
    html: `<div class="answer"><p>Drop the <b>-r</b> and stress the last vowel: hablar → <b lang="es-AR">hablá</b>, comer → <b lang="es-AR">comé</b>, venir → <b lang="es-AR">vení</b>. Verbs that are irregular with tú are regular with vos.</p></div>
${compare([['venir', 'to come', '¡vení!', '¡ven!'], ['tener', 'to have', 'tené', 'ten'], ['hacer', 'to do', 'hacé', 'haz'], ['decir', 'to say', 'decí, decime', 'di, dime'], ['poner', 'to put', 'poné', 'pon'], ['salir', 'to go out', 'salí', 'sal'], ['ir', 'to go', 'andá', 've']])}
<p>With me, lo or la on the end, the stress mark moves so the word keeps its sound: <b lang="es-AR">decime</b> (tell me), <b lang="es-AR">pasame</b> (pass me), <b lang="es-AR">avisame</b> (let me know). For “go!”, Argentines say <b lang="es-AR">andá</b>.</p>`,
  },
  {
    title: 'What stays the same',
    html: `<ul class="ticks">
  <li><b>The past.</b> Vos uses the tú forms: vos tuviste, vos fuiste, vos dijiste, vos tenías. (You’ll hear “tuvistes” with an extra -s. Many people say it, but don’t write it.)</li>
  <li><b>“Don’t…” and the subjunctive.</b> Use the tú forms: <span lang="es-AR">no vengas, no te preocupes, no digas nada</span>.</li>
  <li><b>You all.</b> Ustedes, always. Nobody in Argentina says vosotros.</li>
</ul>`,
  },
  {
    title: 'Real sentences from Posta',
    html: `<ul class="examples">${vosExamples.map((e) => `<li>${es(e.es)}<span class="en">${esc(e.en)}</span></li>`).join('')}</ul>`,
  },
  {
    title: 'The 50 verbs you’ll use most',
    html: `<p class="sub">The 50 verbs used most in Posta’s course, with the present, the order and the past. Print it, stick it on the fridge.</p>
<div class="split">${[0, 25].map((i) => table(['Verb', 'Present', 'Order', 'Past'], Object.keys(VERBS).slice(i, i + 25).map(vosRow))).join('')}</div>`,
  },
];

// ---------------------------------------------------------------- learn

const learnSections = [
  {
    title: 'Why Argentine Spanish is different',
    html: `<p>Argentine Spanish plays by its own rules. Three things change, and if you learn them from day one you never have to unlearn anything:</p>
<div class="trio">
  <div class="tcard" style="--c:var(--butter)"><b lang="es-AR">vos</b><p>instead of tú. “Vos tenés”, not “tú tienes”. Everyone uses it, with friends and strangers.</p></div>
  <div class="tcard" style="--c:var(--sky)"><b>“sh”</b><p>for ll and y. “Yo me llamo” sounds like “sho me shamo”. “Calle” sounds like “cashe”.</p></div>
  <div class="tcard" style="--c:var(--sage)"><b lang="es-AR">lunfardo</b><p>the local slang: laburo for work, plata for money, bondi for the bus.</p></div>
</div>`,
  },
  {
    title: 'Step 1: Learn vos from day one',
    html: `<p>A lot of people learn tú first and plan to “switch later”. Don’t. It’s double the work, and in Argentina you’ll sound like a TV dub.</p>
<p>The good news: vos is easy. Swap the -r of the infinitive for an -s and stress the last vowel: <b lang="es-AR">tener → tenés</b>, <b lang="es-AR">querer → querés</b>, <b lang="es-AR">poder → podés</b>, <b lang="es-AR">vivir → vivís</b>. The one irregular you need is <b lang="es-AR">vos sos</b>.</p>
<p class="tip">Want all of it in one place? Comment <b>VOS</b> on any Posta post and we’ll send you the cheat sheet.</p>`,
  },
  {
    title: 'Step 2: Use an app made for Argentina',
    html: `<p>Not “neutral” Spanish with a flag stuck on it. That’s why we made <b>Posta</b>: every lesson uses vos, every sentence is written the way people talk in Buenos Aires, and the audio is Argentine voices, so your ear gets used to the “sh” from the first day.</p>
<p>You learn words like <b lang="es-AR">laburo</b>, <b lang="es-AR">bondi</b> and <b lang="es-AR">fiaca</b> inside real sentences, and when you’re ready to speak, you talk out loud with Pancho, our capybara, in Hablar. Ten minutes a day is enough.</p>`,
  },
  {
    title: 'Step 3: YouTube, in Argentine Spanish',
    html: `<p>Not videos <i>about</i> Spanish: videos <i>in</i> Argentine Spanish. Streaming channels like <b>Olga</b> and <b>Luzu TV</b> are live talk shows with friends joking around, which is exactly how people really talk.</p>
<div class="answer"><p><b>The trick:</b> Spanish subtitles on, speed at <b>0.75</b>. When a word keeps coming up, look it up once. “¿Viste?”, “re” and “posta” stop sounding like noise surprisingly fast.</p></div>`,
  },
  {
    title: 'Step 4: Netflix, with a system',
    html: `<p>Pick an Argentine series:</p>
<ul class="shows">
  <li><b>División Palermo</b><span>dry comedy</span></li>
  <li><b>Envidiosa</b><span>drama with jokes</span></li>
  <li><b>El Eternauta</b><span>sci-fi</span></li>
  <li><b>Casi feliz</b><span>everyday Buenos Aires</span></li>
</ul>
<p>Watch each episode <b>twice</b>. First with English subtitles, to follow the story. Then with Spanish subtitles, to catch the words. The second time is where the learning happens: you already know what they mean, so you can focus on how they say it.</p>`,
  },
  {
    title: 'Step 5: Classes, for speaking only',
    html: `<p>Look for an <b>Argentine</b> teacher online, someone who says vos without thinking about it. And use the class for one thing: talking. Thirty minutes of conversation a week is worth more than two hours of worksheets.</p>
<p class="tip"><b>Classes for speaking. The app for vocabulary.</b> That’s the combination.</p>`,
  },
  {
    title: 'Your week',
    html: `<div class="week">
  <div class="wk" style="--c:var(--butter)"><span>Every day</span><b>10 minutes in the app</b></div>
  <div class="wk" style="--c:var(--sky)"><span>Twice a week</span><b>One Argentine episode, watched twice</b></div>
  <div class="wk" style="--c:var(--sage)"><span>Once a week</span><b>A 30-minute class where you just talk</b></div>
</div>`,
  },
  {
    title: 'Your first 30 days',
    html: `<p class="sub"><span class="screen">Tick them off as you go. The page remembers your ticks on this device.</span><span class="print">Tick them off as you go.</span></p>
${[
  ['Week 1', 'Sound like Buenos Aires', ['Learn the present tense with vos (the one rule above)', 'Learn your first 10 words: che, dale, re, posta, qué onda, todo bien, viste, laburo, plata, bondi', 'Say “sho me shamo” out loud until the “sh” feels normal', '10 minutes in the app, every day']],
  ['Week 2', 'Train your ear', ['Pick a series and watch episode 1 twice (English, then Spanish subtitles)', 'Watch one stream clip at 0.75 with Spanish subtitles', 'Learn 10 more words', 'Count how many of your 20 words you hear in one episode']],
  ['Week 3', 'Start speaking', ['Say five sentences about your day out loud, with vos', 'Have a spoken chat with Pancho in Hablar', 'Learn the orders: vení, decime, pasame, avisame', 'Watch episode 2, twice']],
  ['Week 4', 'Talk to a real person', ['Book a 30-minute conversation class with an Argentine teacher', 'Use five of your words in the class', 'Watch episode 1 again with no subtitles and notice how much you get', 'Plan your next month']],
].map(([w, t, items], i) => `<div class="plan"><div class="plan-head"><span class="chip">${w}</span><h4>${t}</h4></div><ul>${items.map((x, j) => `<li><label><input type="checkbox" data-tick="w${i}-${j}"><span>${prose(x)}</span></label></li>`).join('')}</ul></div>`).join('\n')}`,
  },
];

// ---------------------------------------------------------------- guides

const GUIDES = [
  {
    slug: 'slang',
    keyword: 'GUIDE',
    title: 'The Argentine Slang Pack',
    h1: 'The 50 Argentine words you’ll hear <em>every day</em>',
    lede: 'Che, dale, boludo, posta, quilombo… The words every Argentine conversation runs on, with plain-English meanings, when (not) to use them, and a real example for each.',
    inside: ['50 words, grouped so they’re easy to learn', 'Which ones are safe and which ones are rude', 'A real example sentence for every word'],
    art: 'pancho-gesto-mano.webp',
    color: 'var(--butter)',
    cover: ['50', 'words'],
    sections: slangSections,
  },
  {
    slug: 'vos',
    keyword: 'VOS',
    title: 'The Vos Cheat Sheet',
    h1: 'The <em>vos</em> cheat sheet',
    lede: 'Argentines never say tú. Here’s everything you need to switch to vos: the one rule, the one irregular, the orders, and the 50 verbs you’ll use most.',
    inside: ['The one rule that does 90% of the work', 'Orders like vení, decime and andá', 'A table of the 50 most-used verbs'],
    art: 'pancho-saludando.webp',
    color: 'var(--sky)',
    cover: ['vos', 'sos'],
    sections: vosSections,
  },
  {
    slug: 'learn',
    keyword: 'LEARN',
    title: 'How to Learn Argentine Spanish',
    h1: 'How to learn <em>Argentine</em> Spanish',
    lede: 'The five steps that actually work, what to watch and listen to, and a 30-day plan you can tick off. From the Posta video, in one place.',
    inside: ['The 5 steps, in the right order', 'The series and streams worth your time', 'A 30-day plan with a checklist'],
    art: 'pancho-mate.webp',
    color: 'var(--sage)',
    cover: ['30', 'days'],
    sections: learnSections,
  },
];

function page(g) {
  const url = `${ORIGIN}/free/${g.slug}`;
  const titleText = `${g.title} (free) | Posta`;
  const description = g.lede;
  const others = GUIDES.filter((o) => o.slug !== g.slug);
  const sec = (s, i) => `<section class="gsec" id="s${i + 1}"><h2><span class="sn">${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</h2>${s.html}</section>`;
  const sections = g.sections.map(sec).join('\n');
  const form = (id) => `<form class="get" data-guide-form novalidate>
      <label class="sr" for="${id}">Your email</label>
      <div class="get-row">
        <input id="${id}" type="email" name="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="you@email.com" required>
        <button type="submit"><span class="btn-label">Email it to me</span></button>
      </div>
      <input class="hp" type="text" name="bot-field" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="get-note" role="status" aria-live="polite">We send you the PDF once, and that’s it. No spam.</p>
    </form>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(titleText)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="noindex, follow">
  <meta name="theme-color" content="#F7EFE6">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Posta">
  <meta property="og:title" content="${esc(g.title)}: free guide">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ORIGIN}/assets/og.png?v=4">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=3">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,500;0,700;0,800;1,700&family=Gabarito:wght@800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="free.css">
</head>
<body data-guide="${g.slug}" data-endpoint="${ENDPOINT}" style="--accent:${g.color}">
  <header class="top">
    <div class="wrap top-in">
      <a class="brand" href="/"><img src="../assets/icon.png?v=3" width="34" height="34" alt="">Posta</a>
      <a class="top-link" href="/get" data-store="get">Get the app</a>
    </div>
  </header>

  <!-- Cover: only on the PDF -->
  <section class="pcover" aria-hidden="true">
    <img class="pcover-logo" src="../assets/icon.png?v=3" width="64" height="64" alt="">
    <p class="eyebrow">Free guide from Posta</p>
    <h1>${g.h1}</h1>
    <p class="lede">${esc(g.lede)}</p>
    <img class="pcover-art" src="../assets/art/${g.art}" alt="">
    <p class="pcover-foot">postaspanish.com · Learn the Spanish Argentina actually speaks</p>
  </section>

  <main>
    <section class="hero wrap">
      <div class="hero-copy">
        <p class="eyebrow"><span class="pill">Free guide</span> PDF · ${g.sections.length} sections</p>
        <h1>${g.h1}</h1>
        <p class="lede">${esc(g.lede)}</p>
        <ul class="inside">${g.inside.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="done">
          <a class="btn" href="pdf/${g.slug}.pdf" download data-pdf>Download the PDF</a>
          <a class="btn ghost" href="#guide">Read it here</a>
        </div>
      </div>
      <div class="cover" aria-hidden="true">
        <div class="sheet back"></div>
        <div class="sheet front">
          <span class="cover-brand"><img src="../assets/icon.png?v=3" width="22" height="22" alt="">Posta</span>
          <span class="cover-big" lang="es-AR">${g.cover[0]}<small>${g.cover[1]}</small></span>
          <span class="cover-title">${esc(g.title)}</span>
          <img class="cover-art" src="../assets/art/${g.art}" alt="" width="260">
        </div>
      </div>
    </section>

    <section class="guide wrap narrow" id="guide">
${sections}
    </section>

    <section class="more wrap narrow">
      <div class="app">
        <img src="../assets/art/pancho-avatar.webp" width="88" height="88" alt="">
        <div>
          <h3>Want to practice all this and learn a lot more?</h3>
          <p class="print"><b>postaspanish.com</b>: download Posta free on Google Play and the App Store.</p>
          <p>Download Posta. It teaches only the Spanish of Argentina: vos from the first lesson, the slang inside real sentences, and spoken chats with Pancho, a capybara who talks like a porteño.</p>
          <a class="btn" href="/get" data-store="get">Download Posta free</a>
        </div>
      </div>
      <div class="mail-card">
        <img src="../assets/art/pancho-avatar.webp" width="64" height="64" alt="">
        <h3>Want it in your inbox?</h3>
        <p>Leave your email and we’ll send you the PDF, so it’s there when you need it.</p>
        ${form('email')}
      </div>
      <h3 class="more-h">More free guides</h3>
      <div class="others">
        ${others.map((o) => `<a class="other" href="/free/${o.slug}" style="--accent:${o.color}"><img src="../assets/art/${o.art}" alt="" width="64"><span><b>${esc(o.title)}</b><small>Comment <b>${o.keyword}</b> on any Posta post, or open it here</small></span></a>`).join('\n        ')}
      </div>
    </section>
  </main>

  <footer class="foot wrap">
    <p>Posta · PICAWAVE, LLC · <a href="/privacy">Privacy</a> · <a href="/">postaspanish.com</a></p>
  </footer>
  <script src="free.js" defer></script>
  <script src="/analytics.js" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- write

fs.mkdirSync(path.join(OUT, 'pdf'), { recursive: true });
for (const f of ['free.css', 'free.js']) fs.copyFileSync(path.join(import.meta.dirname, 'free', f), path.join(OUT, f));
for (const g of GUIDES) {
  n = 0;
  fs.writeFileSync(path.join(OUT, `${g.slug}.html`), page(g));
}
console.log(`Wrote ${GUIDES.length} free guides to ${OUT}`);

if (!process.argv.includes('--no-pdf')) {
  for (const g of GUIDES) {
    const pdf = path.join(OUT, 'pdf', `${g.slug}.pdf`);
    const r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=8000',
      `--print-to-pdf=${pdf}`, `file://${path.join(OUT, `${g.slug}.html`)}`], { stdio: 'pipe' });
    if (r.status !== 0 || !fs.existsSync(pdf)) throw new Error(`PDF failed for ${g.slug}: ${r.stderr}`);
    console.log(`  pdf/${g.slug}.pdf ${(fs.statSync(pdf).size / 1024).toFixed(0)} KB`);
  }
}


// Builds the SEO pages of postaspanish.com into ../posta-site:
//   /learn-argentine-spanish, /argentine-spanish-vs-other-spanish, /voseo   (guides.mjs)
//   /argentine-slang      the 50 everyday words
//   /slang, /slang/<word> one page per "said every day" word (words.yaml rank 1 + a few)
//   /vos/<verb>           vos forms of the 50 verbs most used in the course
// and rewrites sitemap.xml. Data: docs/argentine/words.yaml plus the snapshots in
// scripts/site/data (refresh with: node scripts/site/fetch-data.mjs).
//
//   node scripts/site/build-learn.mjs            (date = today)
//   SITE_DATE=2026-11-04 node scripts/site/build-learn.mjs
//
// The App Store badge goes live by itself once posta-site/config.js has an ios link
// (run this again after pasting it).

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { guides, top50 } from './guides.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SITE = path.resolve(ROOT, '../posta-site');
const ORIGIN = 'https://postaspanish.com';
const TODAY = process.env.SITE_DATE || new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- data

const allWords = yaml.load(fs.readFileSync(path.join(ROOT, 'docs/argentine/words.yaml'), 'utf8')).words;
const EXTRA_WORDS = ['copado', 'morfar', 'mango'];
const words = allWords.filter((w) => w.rank === 1 || EXTRA_WORDS.includes(w.es));
const byEs = new Map(words.map((w) => [w.es, w]));
for (const es of top50) if (!byEs.has(es)) throw new Error(`top50 word not on a page: ${es}`);
if (top50.length !== 50 || new Set(top50).size !== 50) throw new Error('top50 must be 50 different words');

// Course sentences that contain each word (fetch-data.mjs). Some matches are a
// different sense of the word; those are dropped here.
const SKIP_SENTENCES = {
  // "¿Qué película viste?" is the verb ver; keep only the filler "¿viste?"
  viste: { test: (s) => !/(, ¿viste\?|^¿Viste\? )/.test(s) },
  charlar: /\bcharla\b/i, // the noun
  factura: /factura\?$/i,
  medias: /a medias/i,
  loco: /ni loco/i,
  flaco: /alto y flaco/i,
  tipo: /ese tipo/i,
  'en pedo': /ni en pedo/i,
  garpar: /significa/i,
};
const extraSentences = new Map();
for (const r of JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'data/word-sentences.json'), 'utf8'))) {
  if (SKIP_SENTENCES[r.word]?.test(r.es)) continue;
  const list = extraSentences.get(r.word) ?? [];
  if (!list.some((s) => s.es === r.es)) list.push({ es: r.es, en: r.en });
  extraSentences.set(r.word, list);
}

const verbData = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'data/verbs.json'), 'utf8'));

const THEMES = {
  charla: 'Everyday talk', futbol: 'Football', gente: 'People', plata: 'Money and work',
  comida: 'Food and drink', ciudad: 'Getting around', casa: 'Home and clothes', cuerpo: 'Body and looks',
  animo: 'Moods', verbos: 'Verbs', noche: 'Going out', politica: 'Politics and news', campo: 'The countryside',
  lunfardo: 'Lunfardo', vesre: 'Vesre (words said backwards)', expresiones: 'Expressions', puteadas: 'Swear words',
};
const POS = { intj: 'Interjection', adv: 'Adverb', phrase: 'Expression', adj: 'Adjective', noun: 'Noun', verb: 'Verb' };

// ---------------------------------------------------------------- vos verbs

import { VERBS, conj, STEM_CHANGE } from './vos.mjs';
// Check the rules against the forms the course already teaches.
const dbForms = new Map();
for (const v of verbData.verbs) (dbForms.get(v.lemma) ?? dbForms.set(v.lemma, []).get(v.lemma)).push(v);
const mismatches = [];
for (const inf of Object.keys(VERBS)) {
  const c = conj(inf);
  for (const f of dbForms.get(inf) ?? []) {
    if (f.form.includes(' ')) continue;
    const { mood, tense } = f.f;
    if (mood === 'ind' && tense === 'pres' && f.form !== c.vosPres) mismatches.push(`${inf}: pres ${f.form} vs ${c.vosPres}`);
    if (mood === 'ind' && tense === 'pret' && f.form !== c.pret) mismatches.push(`${inf}: pret ${f.form} vs ${c.pret}`);
    if (mood === 'imp' && !/(me|te|le|lo|la|nos|les|los|las|selo|mela|melo)$/.test(f.form) && f.form !== c.vosImp)
      mismatches.push(`${inf}: imp ${f.form} vs ${c.vosImp}`);
  }
}
if (mismatches.length) throw new Error('vos forms differ from the course:\n' + mismatches.join('\n'));
if (Object.keys(VERBS).length !== 50) throw new Error(`expected 50 verbs, got ${Object.keys(VERBS).length}`);

// ---------------------------------------------------------------- helpers

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const wordUrl = (w) => `/slang/${slug(w.es)}`;
// Notes use "quotes" for Spanish examples; show them in bold-free curly quotes.
const prose = (s) => esc(s).replace(/&quot;([^&]*?)&quot;/g, '“$1”');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function readStores() {
  const cfg = fs.readFileSync(path.join(SITE, 'config.js'), 'utf8');
  const get = (k) => (cfg.match(new RegExp(`^\\s*${k}:\\s*'([^']*)'`, 'm')) || [])[1] || '';
  return { ios: get('ios'), android: get('android') };
}
const STORES = readStores();

// Both store badges, the same size, plus the landing page's waitlist card.
// /script.js (with /config.js) wires them exactly like on the home page: a
// live store's badge links to it, the one that isn't out yet opens the card.
let waitlists = 0;
function storeButtons() {
  const id = `wl-${++waitlists}-contact`;
  return `<div class="get">
  <div class="stores" data-stores>
    <div class="badges">
      <a class="badge" data-store="ios" href="${esc(STORES.ios || '/#get')}" aria-label="Download on the App Store"><img src="/assets/badge-app-store.svg" width="132" height="44" alt="Download on the App Store"></a>
      <a class="badge" data-store="android" href="${esc(STORES.android || '/#get')}" aria-label="Get it on Google Play"><img src="/assets/badge-google-play.png" width="148" height="44" alt="Get it on Google Play"></a>
    </div>
  </div>
  <form class="waitlist" name="waitlist" method="POST" data-waitlist hidden>
    <input type="hidden" name="form-name" value="waitlist">
    <p class="sr"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <p class="waitlist-intro"><strong>On iPhone? Almost there.</strong> Posta lands on the App Store in the next few days. Leave your email and we'll tell you the moment it's out.</p>
    <div class="waitlist-row">
      <label class="sr" for="${id}">Your email</label>
      <input id="${id}" type="email" name="contact" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="Your email" required>
      <button class="btn" type="submit">Notify me</button>
    </div>
    <p class="waitlist-note" role="status" aria-live="polite"></p>
  </form>
</div>`;
}

// The landing page's row of store screenshots, looping (a finger holds it).
// Same files as index.html and the structured data below: descriptive names
// and alt text that say "Posta Spanish", so search engines and AI answers tie
// these pictures (not another app's) to the name.
const SHOTS = [
  ['course', 'The course: short daily lessons'],
  ['vos-grammar', 'Argentinian grammar: vos sos, not tú eres'],
  ['culture', 'Mate, asado, fútbol: the culture too'],
  ['speaking-pancho', 'Out-loud speaking practice with Pancho'],
  ['lunfardo-words', 'Lunfardo, the local vocabulary'],
  ['real-sentences', 'Sentences Argentines actually say'],
  ['home-screen-widget', 'Slang on your Home Screen'],
  ['daily-minutes', 'A few minutes a day'],
].map(([name, caption]) => ({ src: `/assets/shots/posta-spanish-app-${name}.webp`, alt: `Posta Spanish app screenshot. ${caption}`, caption }));
const LOGO = ORIGIN + '/assets/posta-spanish-app-icon.png';
const shotsList = (hidden) => `<ul class="shots-list"${hidden ? ' aria-hidden="true"' : ''}>
${SHOTS.map((s, i) => `  <li><img src="${s.src}" width="480" height="853" ${i < 2 && !hidden ? 'fetchpriority="high"' : 'loading="lazy"'} alt="${hidden ? '' : esc(s.alt)}"></li>`).join('\n')}
</ul>`;
const shotsBlock = () => `<div class="shots" role="region" aria-label="Screens from the app">
  <div class="shots-track">
${shotsList(false)}
${shotsList(true)}
  </div>
</div>
${storeButtons()}`;

function cta(heading = 'Learn Argentine Spanish with Posta', { waitlist = false } = {}) {
  const play = STORES.android
    ? `<a href="${esc(STORES.android)}" data-store="android"><img src="/assets/badge-google-play.png" alt="Get it on Google Play" width="148" height="44"></a>` : '';
  const ios = STORES.ios
    ? `<a href="${esc(STORES.ios)}" data-store="ios"><img src="/assets/badge-app-store.svg" alt="Download on the App Store" width="132" height="44"></a>`
    : `<span class="soon">On iPhone? <a href="/#get">Join the App Store waitlist</a></span>`;
  return `<aside class="cta" aria-label="Get the Posta app">
  <img src="/assets/icon.png?v=3" width="64" height="64" alt="">
  <div>
    <h2>${esc(heading)}</h2>
    <p>Posta teaches only the Spanish of Argentina: vos from the first lesson, ${allWords.length} everyday words and slang inside real sentences, and spoken chats with Pancho the capybara.</p>
    ${waitlist ? storeButtons() : `<div class="stores">${play}${ios}</div>`}
  </div>
</aside>`;
}

const NAV = [
  ['/learn-argentine-spanish', 'Guide'],
  ['/argentine-slang', 'Slang'],
  ['/voseo', 'Vos'],
  ['/', 'The app'],
];

function page({ url, title, description, h1Block, body, crumbs, schema = [], navKey, stores = false }) {
  const canonical = ORIGIN + url;
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [['Posta', '/'], ...crumbs].map(([name, u], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: ORIGIN + u,
    })),
  };
  const graph = { '@context': 'https://schema.org', '@graph': [breadcrumb, ...schema] };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#F7EFE6">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Posta">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ORIGIN}/assets/og.png?v=4">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Posta Spanish, the app for learning Argentine Spanish, with Pancho the capybara">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" href="/assets/favicon-192.png" sizes="192x192">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=3">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@500;700;800&family=Gabarito:wght@800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/learn.css">
  ${ld(graph)}
</head>
<body>
  <header class="top">
    <div class="wrap top-in">
      <a class="brand" href="/"><img src="/assets/icon.png?v=3" width="34" height="34" alt="">Posta</a>
      <nav aria-label="Guides">${NAV.map(([u, t]) => `<a href="${u}"${navKey === u ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    </div>
  </header>
  <main class="wrap">
    <ol class="crumbs">${[['Posta', '/'], ...crumbs].map(([n, u], i, a) => `<li>${i === a.length - 1 ? esc(n) : `<a href="${u}">${esc(n)}</a>`}</li>`).join('')}</ol>
    ${h1Block}
    ${body}
  </main>
  <footer class="foot">
    <div class="wrap">
      <nav aria-label="Footer">
        <a href="/learn-argentine-spanish">How to learn Argentine Spanish</a>
        <a href="/argentine-spanish-vs-other-spanish">Argentina vs Spain vs Mexico</a>
        <a href="/argentine-slang">50 everyday words</a>
        <a href="/slang">All slang</a>
        <a href="/voseo">Vos</a>
        <a href="/best-app-to-learn-argentine-spanish">Best app for Argentine Spanish</a>
        <a href="/support">Support</a>
        <a href="/privacy">Privacy</a>
      </nav>
      <p>&copy; 2026 PICAWAVE, LLC. Updated ${TODAY}. Google Play and the Google Play logo are trademarks of Google LLC. App Store is a service mark of Apple Inc.</p>
    </div>
  </footer>
  <script src="/analytics.js"></script>${stores ? '\n  <script src="/config.js"></script>\n  <script src="/script.js" defer></script>' : ''}
</body>
</html>
`;
}

const article = (headline, description, url) => ({
  '@type': 'Article', headline, description, url: ORIGIN + url,
  datePublished: TODAY, dateModified: TODAY, inLanguage: 'en',
  author: { '@type': 'Organization', name: 'Posta', url: ORIGIN + '/' },
  publisher: { '@type': 'Organization', name: 'PICAWAVE, LLC', url: 'https://picawave.com' },
  image: ORIGIN + '/assets/og.png?v=4',
});
const faqLd = (faq) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
const faqHtml = (faq) => faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n');

// ---------------------------------------------------------------- writers

const written = [];
function write(url, html) {
  const file = url === '/' ? 'index.html' : url.slice(1) + '.html';
  const out = path.join(SITE, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  written.push(url);
}

// Slang word pages
for (const w of words) {
  const url = wordUrl(w);
  const examples = [w.example, ...(extraSentences.get(w.es) ?? []).filter((s) => s.es !== w.example.es)].slice(0, 4);
  const related = words.filter((o) => o.theme === w.theme && o !== w).slice(0, 8);
  const fill = top50.map((es) => byEs.get(es)).filter((o) => o !== w && !related.includes(o));
  while (related.length < 6) related.push(fill.shift());
  const theme = THEMES[w.theme];
  const chips = [
    `<span class="chip">${POS[w.pos] ?? w.pos}</span>`,
    w.tag ? `<span class="chip">${esc(w.tag)}</span>` : '',
    `<span class="chip">${esc(theme)}</span>`,
    w.rank === 1 ? '<span class="chip daily">Said every day</span>' : '',
    w.vulgar ? '<span class="chip rude">Rude</span>' : '',
  ].join('');
  const question = `What does “${w.es}” mean in Argentina?`;
  const answer = `“${w.es}” means “${w.en}” in Argentine Spanish. ${w.note}`;
  const body = `
<div class="answer"><p><strong>${esc(cap(w.es))}</strong> means <strong>${esc(w.en)}</strong>.</p><p>${prose(w.note)}</p>${
    w.vulgar ? '<p class="note">This word is rude. Use it only with close friends, or not at all.</p>' : ''}</div>

<h2>Examples with “${esc(w.es)}”</h2>
<ul class="examples">
${examples.map((e) => `  <li><span class="es" lang="es-AR">${esc(e.es)}</span><span class="en">${esc(e.en)}</span></li>`).join('\n')}
</ul>

<section class="related">
<h2>More Argentine words${theme && w.theme !== 'puteadas' ? `: ${esc(theme.toLowerCase())}` : ''}</h2>
<ul class="grid">
${related.map((o) => `  <li><a href="${wordUrl(o)}"><b lang="es-AR">${esc(o.es)}</b><span>${esc(o.en)}</span></a></li>`).join('\n')}
</ul>
<p>See <a href="/argentine-slang">the 50 words Argentines say every day</a>, <a href="/slang">all slang words</a>, or <a href="/learn-argentine-spanish">how to learn Argentine Spanish</a>.</p>
</section>
${cta()}`;
  write(url, page({
    url,
    // Searches are "sube meaning", "quilombo meaning argentina": lead with that and
    // put the answer in the title itself, so the result is worth the click.
    title: `${cap(w.es)} Meaning in Argentina: ${cap(w.en)} | Posta`,
    description: `In Argentina, “${w.es}” means ${w.en}. ${w.note}`.slice(0, 140).replace(/\s+\S*$/, '…') + ' With examples.',
    h1Block: `<div class="word"><h1>${esc(question)}</h1><div class="chips">${chips}</div></div>`,
    body,
    crumbs: [['Slang', '/slang'], [w.es, url]],
    navKey: '/argentine-slang',
    schema: [
      { '@type': 'DefinedTerm', name: w.es, description: `${w.en}. ${w.note}`, inLanguage: 'es-AR', url: ORIGIN + url,
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Argentine Spanish slang', url: ORIGIN + '/slang' } },
      faqLd([[question, answer]]),
    ],
  }));
}

// Slang index by topic
{
  const order = Object.keys(THEMES);
  const groups = order.map((t) => [t, words.filter((w) => w.theme === t)]).filter(([, l]) => l.length);
  const body = `
<p class="lede">The ${words.length} Argentine words you will hear most, by topic. Each one has its meaning in plain English and real example sentences.</p>
${groups.map(([t, list]) => `<h2>${esc(THEMES[t])}</h2>
<ul class="grid">
${list.map((w) => `  <li><a href="${wordUrl(w)}"><b lang="es-AR">${esc(w.es)}</b><span>${esc(w.en)}</span></a></li>`).join('\n')}
</ul>`).join('\n')}
${cta()}`;
  write('/slang', page({
    url: '/slang',
    title: 'Argentine Slang Dictionary: Meanings and Examples | Posta',
    description: `${words.length} Argentine slang and everyday words, from che and boludo to quilombo and laburo, with plain English meanings and real example sentences.`,
    h1Block: '<h1>Argentine slang dictionary</h1>',
    body,
    crumbs: [['Slang', '/slang']],
    navKey: '/argentine-slang',
    schema: [{ '@type': 'DefinedTermSet', name: 'Argentine Spanish slang', url: ORIGIN + '/slang', inLanguage: 'es-AR',
      hasDefinedTerm: words.map((w) => ({ '@type': 'DefinedTerm', name: w.es, url: ORIGIN + wordUrl(w) })) }],
  }));
}

// The 50 everyday words
{
  const url = '/argentine-slang';
  const title = '50 Argentine Slang Words You’ll Hear Every Day';
  const description = 'Che, boludo, dale, re, posta, quilombo, laburo, guita: the 50 Argentine slang words people say every day, with plain English meanings and examples.';
  const faq = [
    ['What is the most common Argentine slang word?', 'Che. It is used to call someone or to get attention, like "hey": "Che, ¿venís?". Right after it come boludo (dude; idiot), dale (OK, sure) and re (really).'],
    ['What is lunfardo?', 'Lunfardo is the slang that was born in Buenos Aires in the late 1800s and early 1900s, partly from Italian and other immigrant languages, and spread through tango. Many lunfardo words, like laburo, guita, mina and pibe, are now normal everyday Argentine Spanish.'],
    ['Is boludo an insult?', 'It can be. Between friends it means "dude" and is very common. Said in anger, or to someone you don\'t know, it means "idiot". The tone tells you which one it is.'],
  ];
  const body = `
<p class="lede">Posta’s word list has ${allWords.length} Argentine words and expressions. We mark the ones you hear <strong>every day</strong>, in almost every conversation. These are 50 of them: if you learn only these, you will already understand a lot more on the street.</p>
<p class="updated">Updated ${TODAY}</p>
<ol class="ranked">
${top50.map((es) => {
    const w = byEs.get(es);
    return `  <li><div><h3><a href="${wordUrl(w)}" lang="es-AR">${esc(w.es)}</a></h3><p><strong>${esc(w.en)}</strong>. ${prose(w.note)}</p><p class="ex"><span lang="es-AR">${esc(w.example.es)}</span> — ${esc(w.example.en)}</p></div></li>`;
  }).join('\n')}
</ol>
<p>Want more? See <a href="/slang">all ${words.length} slang words by topic</a>, or learn <a href="/voseo">how vos works</a>.</p>
<h2>Common questions</h2>
${faqHtml(faq)}
${cta()}`;
  write(url, page({
    url, title: `${title} | Posta`, description,
    h1Block: `<h1>${esc(title)}</h1>`,
    body,
    crumbs: [['50 everyday words', url]],
    navKey: url,
    schema: [article(title, description, url), faqLd(faq),
      { '@type': 'ItemList', name: title, itemListElement: top50.map((es, i) => ({ '@type': 'ListItem', position: i + 1, name: es, url: ORIGIN + wordUrl(byEs.get(es)) })) }],
  }));
}

// Vos verb pages
const verbList = Object.keys(VERBS);
const verbEx = new Map();
for (const e of verbData.ex) {
  const l = verbEx.get(e.lemma) ?? [];
  if (!l.some((x) => x.es === e.es)) l.push(e);
  verbEx.set(e.lemma, l);
}
const FEATURE_NAMES = { 'ind/impf': 'Past (was doing, used to)', 'ind/cond': 'Would', 'ind/fut': 'Future', 'subj/pres': 'Subjunctive', 'subj/impf': 'Past subjunctive' };
for (const inf of verbList) {
  const url = `/vos/${inf}`;
  const c = conj(inf);
  const examples = (verbEx.get(inf) ?? []).slice(0, 4);
  const other = (dbForms.get(inf) ?? [])
    .filter((f) => FEATURE_NAMES[`${f.f.mood}/${f.f.tense}`] && f.gloss)
    .sort((a, b) => Object.keys(FEATURE_NAMES).indexOf(`${a.f.mood}/${a.f.tense}`) - Object.keys(FEATURE_NAMES).indexOf(`${b.f.mood}/${b.f.tense}`));
  const forms = [c.vosPres, c.vosImp, c.pret].filter(Boolean);
  const answer = `With vos, ${inf} is <strong>vos ${c.vosPres}</strong>`
    + (c.vosImp ? `. The command is <strong>${c.vosImp}</strong>` : '')
    + `, and the past is <strong>vos ${c.pret}</strong>.`;
  const stemNote = STEM_CHANGE.has(inf)
    ? `<p>With tú, ${inf} changes its stem (tú ${c.tuPres}). With vos it doesn’t: <strong>vos ${c.vosPres}</strong>. That is one reason vos is easier.</p>` : '';
  const idx = verbList.indexOf(inf);
  const neighbours = [...verbList.slice(idx + 1), ...verbList.slice(0, idx)].slice(0, 8);
  const body = `
<div class="answer"><p>${answer}</p></div>
<p class="note">${esc(cap(inf))}: ${esc(VERBS[inf])}.</p>
<div class="table"><table>
  <thead><tr><th></th><th>Vos (Argentina)</th><th>Tú (not used)</th></tr></thead>
  <tbody>
    <tr><td>Present</td><td class="vos">vos ${c.vosPres}</td><td class="tu">tú ${c.tuPres}</td></tr>
    ${c.vosImp ? `<tr><td>Command</td><td class="vos">¡${c.vosImp}!</td><td class="tu">¡${c.tuImp}!</td></tr>` : ''}
    <tr><td>Past</td><td class="vos">vos ${c.pret}</td><td>tú ${c.pret} (the same)</td></tr>
  </tbody>
</table></div>
${stemNote}
${examples.length ? `<h2>Examples with “vos ${c.vosPres}”</h2>
<ul class="examples">
${examples.map((e) => `  <li><span class="es" lang="es-AR">${esc(e.es)}</span><span class="en">${esc(e.en)}</span></li>`).join('\n')}
</ul>` : ''}
${other.length ? `<h2>Other vos forms of ${inf}</h2>
<div class="table"><table>
  <thead><tr><th>Form</th><th>Vos</th><th>Meaning</th></tr></thead>
  <tbody>
${other.map((f) => `    <tr><td>${FEATURE_NAMES[`${f.f.mood}/${f.f.tense}`]}</td><td class="vos">${esc(f.form)}</td><td>${esc(f.gloss)}</td></tr>`).join('\n')}
  </tbody>
</table></div>` : ''}
<section class="related">
<h2>More verbs with vos</h2>
<ul class="grid">
${neighbours.map((v) => `  <li><a href="/vos/${v}"><b lang="es-AR">vos ${conj(v).vosPres}</b><span>${esc(v)}: ${esc(VERBS[v])}</span></a></li>`).join('\n')}
</ul>
<p>See <a href="/voseo">how vos works</a> and <a href="/voseo#all-verbs">all 50 verbs</a>.</p>
</section>
${cta()}`;
  write(url, page({
    url,
    title: `${cap(inf)} with Vos: ${forms.map(cap).join(', ')} | Posta`,
    description: `How to say ${inf} (${VERBS[inf]}) with vos in Argentina: vos ${c.vosPres}${c.vosImp ? `, ${c.vosImp}` : ''}, vos ${c.pret}. Compared with tú, with real example sentences.`,
    h1Block: `<h1>${esc(cap(inf))} with vos</h1>`,
    body,
    crumbs: [['Vos', '/voseo'], [inf, url]],
    navKey: '/voseo',
    schema: [faqLd([[`What is the vos form of ${inf}?`, `Vos ${c.vosPres}${c.vosImp ? `; the command is ${c.vosImp}` : ''}; the past is vos ${c.pret}.`]])],
  }));
}

// Guides
// The app itself, for the pages that are about it (same facts as index.html).
const APP_LD = {
  '@type': 'MobileApplication', '@id': ORIGIN + '/#app', name: 'Posta',
  alternateName: ['Posta: Argentinian Spanish', 'Posta: Learn Argentine Spanish', 'Posta Spanish'],
  url: ORIGIN + '/', applicationCategory: 'EducationalApplication', applicationSubCategory: 'Language learning',
  operatingSystem: STORES.ios ? 'iOS, Android' : 'Android', inLanguage: 'en',
  description: `An app to learn Argentine Spanish: vos, lunfardo and ${allWords.length} slang words, short daily lessons, culture classes and spoken chats with Pancho the capybara.`,
  image: { '@type': 'ImageObject', url: LOGO, width: 512, height: 512, caption: 'Posta Spanish app icon: Pancho the capybara drinking mate' },
  screenshot: SHOTS.map((s) => ({ '@type': 'ImageObject', url: ORIGIN + s.src, width: 480, height: 853, caption: s.alt })),
  brand: { '@type': 'Brand', name: 'Posta Spanish', logo: LOGO },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  ...(STORES.android ? { installUrl: STORES.android } : {}),
};
const verbGrid = `<ul class="grid" id="all-verbs">
${verbList.map((v) => `  <li><a href="/vos/${v}"><b lang="es-AR">vos ${conj(v).vosPres}</b><span>${esc(v)}: ${esc(VERBS[v])}</span></a></li>`).join('\n')}
</ul>`;
for (const g of guides) {
  const url = '/' + g.slug;
  write(url, page({
    url, title: `${g.title} | Posta`, description: g.description,
    h1Block: `<h1>${esc(g.h1)}</h1><p class="updated">Updated ${TODAY}</p>`,
    body: g.body.replace('<!--VERB_GRID-->', verbGrid).replace('<!--SHOTS-->', () => shotsBlock()).replaceAll('{{WORDS}}', allWords.length)
      + faqHtml(g.faq) + cta(undefined, { waitlist: Boolean(g.shots) }),
    stores: Boolean(g.shots),
    crumbs: [[g.crumb, url]],
    navKey: url,
    schema: [article(g.title, g.description, url), faqLd(g.faq), ...(g.app ? [APP_LD] : [])],
  }));
}

// ---------------------------------------------------------------- sitemap

const STATIC = [
  ['/', TODAY], ['/support', '2026-10-14'], ['/privacy', '2026-11-04'], ['/terms', '2026-10-20'], ['/delete-account', null],
];
// The app's own pictures, listed on the pages that show them (image sitemap).
const IMAGE_PAGES = new Set(['/', '/best-app-to-learn-argentine-spanish']);
const sitemapImages = [LOGO, ...SHOTS.map((s) => ORIGIN + s.src)].map((u) => `<image:image><image:loc>${u}</image:loc></image:image>`).join('');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...STATIC, ...written.map((u) => [u, TODAY])].map(([u, d]) => `  <url><loc>${ORIGIN}${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}${IMAGE_PAGES.has(u) ? sitemapImages : ''}</url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(SITE, 'sitemap.xml'), sitemap);

console.log(`Wrote ${written.length} pages to ${SITE} (${words.length} words, ${verbList.length} verbs, ${guides.length + 1} guides) and sitemap.xml`);

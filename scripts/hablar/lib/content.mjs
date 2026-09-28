// Hablar's static content: loading docs/hablar/scenarios.yaml, checking it,
// and turning it into the JSON the app and the edge functions bundle.
//
// Pure apart from the loaders at the bottom, so the tests can feed it any
// document. Runs under scripts/test/register.mjs, because the rioplatense
// rules are the app's TypeScript (src/lib/course-rules), shared with the
// course pipeline — Hablar can't disagree with the course about what is
// allowed.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

import { chePlacement, checkPhrases, compoundPast, missingOpeningMarks } from '../../../src/lib/course-rules/check.ts';
import { REGIONAL, TUTEO, fold } from '../../course/lib/rules.mjs';

export const SCENARIOS = 'docs/hablar/scenarios.yaml';
export const MANIFEST = 'docs/hablar/audio.json';
export const CULTURE = 'src/lib/culture.json';
export const OUT_APP = 'src/lib/hablar.json';
export const OUT_FUNCTIONS = 'supabase/functions/_shared/hablar-content.json';

/** The four levels a scenario version or a free-chat opener pool is written for. */
export const BANDS = ['A1', 'A2', 'B1', 'B2'];

/** Scribe's limit per keyterm. */
export const MAX_KEYTERM = 50;
/** More than this and biasing stops meaning anything (and the request grows). */
export const MAX_KEYTERMS = 100;

/** Who records the static lines: the `tomas` row of public.voices
 *  (migration 20260918000007). Hard-coded so recording never has to read the DB. */
export const TOMAS = { id: 'tomas', provider_id: 'QK4xDwo9ESPHA4JNUpX3', model: 'eleven_multilingual_v2' };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const str = (v) => typeof v === 'string' && v.trim().length > 0;

// ---------------------------------------------------------------------------
// Rioplatense

/**
 * What is wrong with a piece of Spanish, by the course's rules: tuteo and
 * vosotros forms, words from other Spanishes, set phrases a porteño doesn't
 * say, the compound past, `che` tacked on the end, and missing ¿ ¡.
 *
 * Every word is scanned, not just the ones in a lexicon — this is free text.
 * Note `tomas` (tú tomas) is on the tuteo list, so the character is always
 * written Tomás.
 */
export function spanishProblems(es) {
  const problems = [];
  for (const raw of es.split(/[^\p{L}]+/u)) {
    if (!raw) continue;
    const w = fold(raw);
    if (TUTEO.has(w)) problems.push(`"${raw}" is tuteo/vosotros — use the vos form`);
    else if (REGIONAL.has(w)) problems.push(`"${raw}" is not rioplatense — use "${REGIONAL.get(w)}"`);
  }
  problems.push(...checkPhrases(es), ...compoundPast(es), ...chePlacement(es), ...missingOpeningMarks(es));
  return problems;
}

/**
 * A goal reads as a vos imperative: "Pedí", "Preguntá", "Pedile", "Contá".
 * The vos imperative is the infinitive minus its `r`, stressed on the last
 * vowel — so it ends in á/é/í, or has a clitic after it ("Pedile", "Decime").
 * A heuristic, but it catches "Pide", "Pregunta" and "Pida".
 */
export function isVosImperative(es) {
  const first = fold(es.trim().split(/\s+/)[0] ?? '').replace(/[^\p{L}]/gu, '');
  return /[áéí]$/.test(first) || /[aei](me|te|le|les|lo|la|los|las|nos|se)$/.test(first);
}

// ---------------------------------------------------------------------------
// Validation

/**
 * Every problem with the document, as "where: what" strings. Empty = valid.
 * `cultureIds` are the section slugs of src/lib/culture.json; every one of
 * them needs a culture opener and no opener may name another.
 */
export function validate(doc, { cultureIds = [] } = {}) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  const spanish = (where, es) => {
    if (!str(es)) return err(where, 'missing Spanish');
    for (const p of spanishProblems(es)) err(where, p);
  };
  const pair = (where, x, { needQuestion = false } = {}) => {
    if (!x || typeof x !== 'object') return err(where, 'missing');
    spanish(where, x.es);
    if (!str(x.en)) err(where, 'missing English');
    if (needQuestion && str(x.es) && !x.es.trim().endsWith('?')) err(where, 'an opener must end in a question');
  };
  const keyterms = (where, list, { required = true } = {}) => {
    if (list === undefined && !required) return;
    if (!Array.isArray(list) || list.length === 0) return err(where, 'needs keyterms');
    if (list.length > MAX_KEYTERMS) err(where, `${list.length} keyterms (max ${MAX_KEYTERMS})`);
    const seen = new Set();
    for (const k of list) {
      if (!str(k)) {
        err(where, `empty keyterm: ${JSON.stringify(k)}`);
        continue;
      }
      if (k.length > MAX_KEYTERM) err(where, `keyterm over ${MAX_KEYTERM} chars: "${k}"`);
      if (seen.has(fold(k.trim()))) err(where, `duplicate keyterm: "${k}"`);
      seen.add(fold(k.trim()));
      for (const p of spanishProblems(k)) err(where, `keyterm "${k}": ${p}`);
    }
  };

  if (!doc || typeof doc !== 'object') return ['not a document'];

  // --- scenarios
  const scenarios = doc.scenarios;
  if (!Array.isArray(scenarios) || scenarios.length === 0) errors.push('no scenarios');
  const ids = new Set();
  for (const [i, s] of (Array.isArray(scenarios) ? scenarios : []).entries()) {
    const at = `scenario ${s?.id ?? i}`;
    if (!s || typeof s !== 'object') {
      err(at, 'not an object');
      continue;
    }
    if (!SLUG.test(s.id ?? '')) err(at, 'bad id (want a slug)');
    if (ids.has(s.id)) err(at, 'duplicate id');
    ids.add(s.id);

    for (const k of ['title_es', 'setting_es', 'role_es']) spanish(`${at} ${k}`, s[k]);
    for (const k of ['title_en', 'setting_en', 'role_en']) if (!str(s[k])) err(at, `missing ${k}`);
    for (const k of ['setting_es', 'setting_en']) if (str(s[k]) && /\n/.test(s[k].trim())) err(at, `${k} must be one line`);

    // One version per band it is written for (A1, A2, B1, B2). A version may
    // move the scene (setting) or recast Pancho (role); goals, phrases and the
    // opener are always its own.
    const versions = s.versions;
    const bands = versions && typeof versions === 'object' ? Object.keys(versions) : [];
    if (!bands.length) err(at, 'no versions (want at least one of A1, A2, B1, B2)');
    for (const band of bands) if (!BANDS.includes(band)) err(`${at} ${band}`, `unknown band (want ${BANDS.join(', ')})`);
    for (const band of bands.filter((b) => BANDS.includes(b))) {
      const v = versions[band];
      const vat = `${at} ${band}`;
      if (!v || typeof v !== 'object') {
        err(vat, 'not an object');
        continue;
      }
      for (const k of ['setting_es', 'role_es']) if (v[k] !== undefined) spanish(`${vat} ${k}`, v[k]);
      if ((v.setting_es === undefined) !== (v.setting_en === undefined)) err(vat, 'setting_es and setting_en go together');
      if ((v.role_es === undefined) !== (v.role_en === undefined)) err(vat, 'role_es and role_en go together');
      for (const k of ['setting_es', 'setting_en']) if (str(v[k]) && /\n/.test(v[k].trim())) err(vat, `${k} must be one line`);

      const goals = v.goals;
      if (!Array.isArray(goals) || goals.length < 2 || goals.length > 3) err(vat, `${goals?.length ?? 0} goals (want 2–3)`);
      const goalIds = new Set();
      for (const [gi, g] of (Array.isArray(goals) ? goals : []).entries()) {
        const gat = `${vat} goal ${g?.id ?? gi + 1}`;
        if (!SLUG.test(g?.id ?? '')) err(gat, 'bad id (want a slug)');
        if (goalIds.has(g?.id)) err(gat, 'duplicate goal id');
        goalIds.add(g?.id);
        pair(gat, g);
        if (str(g?.es) && !isVosImperative(g.es)) err(gat, `"${g.es}" should open with a vos imperative ("Pedí…", "Preguntá…")`);
      }

      const phrases = v.key_phrases;
      if (!Array.isArray(phrases) || phrases.length < 3 || phrases.length > 4)
        err(vat, `${phrases?.length ?? 0} key phrases (want 3–4)`);
      for (const [pi, p] of (Array.isArray(phrases) ? phrases : []).entries()) pair(`${vat} key phrase ${pi + 1}`, p);

      pair(`${vat} opener`, v.opener, { needQuestion: true });
      keyterms(`${vat} keyterms`, v.keyterms, { required: false });
    }
    keyterms(`${at} keyterms`, s.keyterms);
  }

  // --- openers
  const openers = doc.openers ?? {};
  const free = openers.free ?? {};
  for (const band of BANDS) {
    const list = free[band];
    if (!Array.isArray(list) || list.length < 2) err(`free ${band}`, `${list?.length ?? 0} openers (want at least 2)`);
    for (const [i, o] of (Array.isArray(list) ? list : []).entries()) pair(`free ${band} ${i + 1}`, o, { needQuestion: true });
  }
  for (const band of Object.keys(free)) if (!BANDS.includes(band)) err(`free ${band}`, `unknown band (want ${BANDS.join(', ')})`);

  const culture = openers.culture ?? {};
  const known = new Set(cultureIds);
  for (const [id, o] of Object.entries(culture)) {
    if (!known.has(id)) err(`culture ${id}`, 'no culture section with this id');
    pair(`culture ${id}`, o, { needQuestion: true });
    keyterms(`culture ${id} keyterms`, o?.keyterms);
  }
  for (const id of cultureIds) if (!culture[id]) err(`culture ${id}`, 'no opener for this culture section');

  return errors;
}

// ---------------------------------------------------------------------------
// Audio

/**
 * Where a line's clip lives in the `audio` bucket. Derived from what is said
 * and who says it with which model, so a re-run finds the same file, an edited
 * line gets a new name (the bucket is served with a year of cache), and
 * switching the model after Phase 0 re-records everything by itself.
 */
export function clipPath(text, voice = TOMAS) {
  const sha = createHash('sha256').update(`${voice.id}|${voice.model}|${text.trim()}`).digest('hex');
  return `hablar/${sha.slice(0, 20)}.mp3`;
}

/** Every line Tomás has pre-recorded: scenario openers and key phrases, and the
 *  free and culture openers. Unique by text, in document order. */
export function recordableLines(doc) {
  const out = new Map();
  const add = (kind, where, es) => {
    const text = es.trim();
    if (!out.has(text)) out.set(text, { text, kind, where });
  };
  for (const s of doc.scenarios ?? []) {
    for (const band of BANDS) {
      const v = s.versions?.[band];
      if (!v) continue;
      add('opener', `${s.id} ${band} opener`, v.opener.es);
      for (const [i, p] of v.key_phrases.entries()) add('phrase', `${s.id} ${band} phrase ${i + 1}`, p.es);
    }
  }
  for (const band of BANDS) for (const [i, o] of (doc.openers?.free?.[band] ?? []).entries()) add('opener', `free ${band} ${i + 1}`, o.es);
  for (const [id, o] of Object.entries(doc.openers?.culture ?? {})) add('opener', `culture ${id}`, o.es);
  return [...out.values()];
}

// ---------------------------------------------------------------------------
// Build

/**
 * The bundled shape. `audio` is the clip's path in the `audio` bucket when the
 * manifest says it was recorded and uploaded, otherwise null (the app falls
 * back to no ▶️, the function to text only).
 */
export function buildContent(doc, manifest = {}, { cultureIds = Object.keys(doc.openers?.culture ?? {}) } = {}) {
  const audio = (es) => {
    const path = clipPath(es);
    return manifest[path] ? path : null;
  };
  const line = ({ es, en }) => ({ es: es.trim(), en: en.trim(), audio: audio(es) });
  // Each version comes out whole (setting and role filled in from the
  // scenario), so the app and the functions never merge anything.
  const scenarios = doc.scenarios.map((s) => ({
    id: s.id,
    title_es: s.title_es,
    title_en: s.title_en,
    versions: Object.fromEntries(
      BANDS.filter((b) => s.versions[b]).map((b) => {
        const v = s.versions[b];
        const terms = [...s.keyterms, ...(v.keyterms ?? [])].map((k) => k.trim());
        return [
          b,
          {
            setting_es: (v.setting_es ?? s.setting_es).trim(),
            setting_en: (v.setting_en ?? s.setting_en).trim(),
            role_es: (v.role_es ?? s.role_es).trim(),
            role_en: (v.role_en ?? s.role_en).trim(),
            goals: v.goals.map((g) => ({ id: g.id, es: g.es, en: g.en })),
            key_phrases: v.key_phrases.map(line),
            opener: line(v.opener),
            keyterms: [...new Set(terms)],
          },
        ];
      }),
    ),
  }));
  const free = Object.fromEntries(BANDS.map((b) => [b, (doc.openers.free[b] ?? []).map(line)]));
  const culture = {};
  for (const id of cultureIds) {
    const o = doc.openers.culture[id];
    if (o) culture[id] = { ...line(o), keyterms: o.keyterms.map((k) => k.trim()) };
  }
  return { scenarios, openers: { free, culture } };
}

// ---------------------------------------------------------------------------
// Loaders

export const loadScenarios = (path = SCENARIOS) => parse(readFileSync(path, 'utf8'));
export const loadCultureIds = (path = CULTURE) => JSON.parse(readFileSync(path, 'utf8')).sections.map((s) => s.slug);
export const loadManifest = (path = MANIFEST) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {});

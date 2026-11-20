import type { ImageSourcePropType } from 'react-native';

import type { Fact } from '@/app/culture-class';
import { type ArWord, arPacks } from '@/lib/argentine';
import { ART_SECTIONS, artFor } from '@/lib/culture-art';
import type { Level } from '@/lib/onboarding';
import type { QueueItem } from '@/lib/round';
import { type SentenceRow, toSentence } from '@/lib/sentences';
import { supabase } from '@/lib/supabase';
import { pastel } from '@/lib/theme';
import type { Form, Sentence } from '@/lib/types';
import { courseArt } from '@/lib/word-art';

// ---------------------------------------------------------------------------
// The first class as a list of screens, wherever it comes from.
//
// Two sources (2026-11-19):
//   · local — the class built into the app (components/first-class.tsx), the
//     one everyone gets unless the switch says otherwise.
//   · db    — a row of `first_classes`, edited in the dashboard with no app
//     update: questions, answers, pictures, screens added or taken out, and a
//     different class per onboarding level.
//
// The switch is app_config `first_class_source`: "db" uses the database, anything
// else (or no answer) the local class. With it on "local" the app reads only
// that one tiny row; the class itself is never downloaded.
//
// A database class that doesn't hold together (a missing id, no right answer,
// no screens for her level) is never shown half-broken: the local class is.
// The schema of `content` is DbContent below; supabase/first-class-README.md
// has it with examples.
// ---------------------------------------------------------------------------

export type Part = 'class' | 'slang' | 'culture';
export type Source = 'local' | 'db';

/** One screen, ready to draw. */
export type Step =
  /** A course exercise (New word + its question, or a sentence build). */
  | {
      kind: 'exercise';
      item: QueueItem;
      /** The sentences its choices are drawn from. */
      sentences: Sentence[];
      /** The words it draws from (a build's spare tiles). */
      forms: Form[];
      /** Its tap-a-word lookup; none for a build, as the course does. */
      lexicon?: Map<string, Form>;
      /** New word, then its question: the bar moves halfway after the first. */
      twoStep: boolean;
    }
  /** Read Pancho's line, tap its picture. */
  | {
      kind: 'picture';
      prompt: string;
      line: Sentence;
      options: { id: string; label: string; image?: ImageSourcePropType }[];
      correctId: string;
      answer: string;
    }
  /** A slang class: the butter opener, each card met, then asked. */
  | { kind: 'slang'; words: ArWord[]; decoys: ArWord[] }
  /** The peach CULTURE opener. */
  | { kind: 'culture_intro' }
  /** One culture card. `section`/`cls` give its tap-a-word glosses. */
  | { kind: 'culture_card'; fact: Fact; section: string; cls: string };

export interface Screen {
  /** Stable name, sent to PostHog with every screen reached. */
  id: string;
  part: Part;
  step: Step;
}

export interface Script {
  source: Source;
  /** Which `first_classes` row, for a database class. */
  rowId?: string;
  screens: Screen[];
  /** Every word of the class, for the tap-a-word bubbles. */
  lexicon: Map<string, Form>;
  /** Under "You nailed it!" on the end screen. */
  doneLine: string;
  /** Pancho's picture beside his lines in the exercise part; null for the plain one. */
  speakerArt: ImageSourcePropType | null;
  /** Pictures to have in memory before their screen. */
  preload: ImageSourcePropType[];
}

// --- the database's shape ----------------------------------------------------

/** `first_classes.content`. */
export interface DbContent {
  /** Every word the class uses, same columns as form_entries (first-class.json's "forms"). */
  forms?: Form[];
  /** Every sentence it uses, same columns as sentences (first-class.json's "sentences"). */
  sentences?: SentenceRow[];
  screens: DbScreen[];
  done_line?: string;
  /** Pancho's picture in the exercise part: a URL, "none", or left out for Pancho with his facturas. */
  speaker_image?: string;
}

type DbScreenBase = {
  id: string;
  /** Which bar piece it fills. Left out: class for exercises, slang, culture. */
  part?: Part;
  /** Only for these onboarding levels. Left out: everyone who gets this class. */
  levels?: Level[];
};

export type DbScreen = DbScreenBase &
  (
    | { type: 'new_word'; form_id: string; sentence_id: string; choice_sentence_ids?: string[] }
    | { type: 'build'; sentence_id: string; spare_form_ids?: string[] }
    | {
        type: 'pick_picture';
        prompt: string;
        sentence_id: string;
        /** Exactly one has correct: true. A picture is a URL (`image`) or a course word's art (`lemma_id`). */
        options: { id?: string; label: string; image?: string; lemma_id?: string; correct?: boolean }[];
      }
    | {
        type: 'slang';
        /** argentine.json ids, or a whole word (an id there with fields changed, or a new one). */
        words: (string | (Partial<ArWord> & { id: string }))[];
        /** Wrong answers: argentine.json ids. Left out: three other words. */
        decoys?: string[];
      }
    | { type: 'culture_intro' }
    | {
        type: 'culture_card';
        text: string;
        chip?: string;
        /** A URL, or a culture section's art by number. */
        image?: string;
        art?: { section: string; index?: number };
        /** A pastel name (butter, peach, sage, lav, sky) or a colour. */
        bg?: string;
        /** The culture class whose glosses its words use. */
        section?: string;
        class?: string;
      }
  );

export interface DbRow {
  id: string;
  levels: string[] | null;
  content: DbContent;
}

// --- reading it --------------------------------------------------------------

/** The switch, read with the anon key (onboarding may have no account yet). */
async function fetchSource(): Promise<Source> {
  const { data } = await supabase.from('app_config').select('value').eq('key', 'first_class_source').maybeSingle();
  return data?.value === 'db' ? 'db' : 'local';
}

/** Her level's class: a row naming her level, else a row with no levels (everyone's). */
export function pickRow(rows: DbRow[], level: Level): DbRow | null {
  return (
    rows.find((r) => r.levels?.includes(level)) ??
    rows.find((r) => !r.levels || r.levels.length === 0) ??
    null
  );
}

async function fetchRow(level: Level): Promise<DbRow | null> {
  const { data, error } = await supabase
    .from('first_classes')
    .select('id, levels, content')
    .eq('published', true)
    .order('id');
  if (error) throw error;
  return pickRow((data ?? []) as DbRow[], level);
}

/** Every published row, for the admin preview. */
export async function fetchRows(): Promise<(DbRow & { published: boolean })[]> {
  const { data, error } = await supabase.from('first_classes').select('id, levels, content, published').order('id');
  if (error) throw error;
  return (data ?? []) as (DbRow & { published: boolean })[];
}

// --- turning a row into screens --------------------------------------------------

const allWords = arPacks.flatMap((p) => p.words);
const arWordById = new Map(allWords.map((w) => [w.id, w]));

const PARTS_OF: Record<DbScreen['type'], Part> = {
  new_word: 'class',
  build: 'class',
  pick_picture: 'class',
  slang: 'slang',
  culture_intro: 'culture',
  culture_card: 'culture',
};

const DEFAULT_DECOYS = ['celu', 'cumple', 'finde'];

const colour = (c: string | undefined) => (c ? ((pastel as Record<string, string>)[c] ?? c) : pastel.butter);
const uri = (u: string): ImageSourcePropType => ({ uri: u });

/** A database class, checked and drawn as screens for her level. Throws when
 *  something in it doesn't hold, naming what. */
export function resolveRow(
  row: DbRow,
  level: Level,
  fallbackSpeaker: ImageSourcePropType | null,
): Script {
  const c = row.content;
  const fail = (what: string): never => {
    throw new Error(`first_classes "${row.id}": ${what}`);
  };
  if (!c || !Array.isArray(c.screens)) fail('content.screens is missing');

  if (c.forms !== undefined && !Array.isArray(c.forms)) fail('content.forms must be a list');
  if (c.sentences !== undefined && !Array.isArray(c.sentences)) fail('content.sentences must be a list');
  const forms = c.forms ?? [];
  // Every field the exercises read, checked here: a gap found while drawing
  // would crash the class instead of falling back to the local one.
  const isStr = (v: unknown) => typeof v === 'string';
  const strList = (v: unknown) => v === null || v === undefined || (Array.isArray(v) && v.every(isStr));
  for (const f of forms) {
    if (!f || !isStr(f.id) || !isStr(f.form) || !isStr(f.lemma) || !isStr(f.lemma_id) || !isStr(f.gloss_en) || !isStr(f.pos))
      fail(`a word in content.forms lacks id, form, lemma, lemma_id, gloss_en or pos (${f?.id ?? '?'})`);
    if (!strList(f.alt)) fail(`word ${f.id}: alt must be a list of texts`);
  }
  for (const r of c.sentences ?? []) {
    if (!r || !isStr(r.id) || !isStr(r.es) || !isStr(r.en) || !isStr(r.target_form_id) || !Array.isArray(r.tokens))
      fail(`a sentence lacks id, es, en, target_form_id or tokens (${r?.id ?? '?'})`);
    if (!strList(r.en_alt) || !strList(r.es_alt)) fail(`sentence ${r.id}: en_alt/es_alt must be lists of texts`);
    for (const t of r.tokens) if (!t || !isStr(t.surface) || !Array.isArray(t.form_ids)) fail(`sentence ${r.id}: a token lacks surface or form_ids`);
  }
  const lexicon = new Map(forms.map((f) => [f.id, f]));
  const rows = new Map((c.sentences ?? []).map((s) => [s.id, s]));
  const sentenceCache = new Map<string, Sentence>();
  const sentence = (id: string, where: string): Sentence => {
    const hit = sentenceCache.get(id);
    if (hit) return hit;
    const r = rows.get(id) ?? fail(`${where}: sentence ${id} is not in content.sentences`);
    for (const t of r.tokens) for (const f of t.form_ids) if (!lexicon.has(f)) fail(`${where}: word ${f} of sentence ${id} is not in content.forms`);
    const s = toSentence(r, lexicon);
    sentenceCache.set(id, s);
    return s;
  };
  const form = (id: string, where: string): Form => lexicon.get(id) ?? fail(`${where}: word ${id} is not in content.forms`);
  const allSentences = () => [...rows.keys()].map((id) => sentence(id, 'sentences'));
  const item = (i: Omit<QueueItem, 'state'>): QueueItem => ({ ...i, state: null });
  const preload: ImageSourcePropType[] = [];

  const screens: Screen[] = [];
  const ids = new Set<string>();
  for (const s of c.screens) {
    if (!s || typeof s !== 'object') fail('a screen is not an object');
    if (s.levels !== undefined && !Array.isArray(s.levels)) fail(`screen "${s.id}": levels must be a list`);
    if (s.levels?.length && !s.levels.includes(level)) continue;
    const where = `screen "${s.id}"`;
    if (!s.id) fail('a screen has no id');
    if (ids.has(s.id)) fail(`${where} appears twice`);
    ids.add(s.id);
    if (s.part !== undefined && s.part !== 'class' && s.part !== 'slang' && s.part !== 'culture') fail(`${where}: part must be class, slang or culture`);
    if (s.levels !== undefined && !Array.isArray(s.levels)) fail(`${where}: levels must be a list`);
    const part: Part = s.part ?? PARTS_OF[s.type] ?? fail(`${where}: unknown type "${(s as { type: string }).type}"`);
    let step: Step;
    switch (s.type) {
      case 'new_word': {
        const f = form(s.form_id, where);
        const choices = s.choice_sentence_ids?.map((id) => sentence(id, where)) ?? allSentences();
        step = {
          kind: 'exercise',
          item: item({ form: f, mode: 'sentence_intro', direction: 'es_to_en', sentence: sentence(s.sentence_id, where), introduces: f }),
          sentences: choices,
          forms,
          lexicon,
          twoStep: true,
        };
        break;
      }
      case 'build': {
        // Seen before, on paper: a brand-new build wears the "Harder" badge, wrong on a first class.
        const base = sentence(s.sentence_id, where);
        const built: Sentence = { ...base, shown: { shown_count: 9, correct_count: 9, last_shown_at: null } };
        const group = [...new Set(built.tokens.flatMap((t) => t.form_ids))].map((id) => form(id, where));
        if (!group.length) fail(`${where}: the sentence has no words to build with`);
        const target = group.find((g) => g.id === rows.get(s.sentence_id)?.target_form_id) ?? group[0];
        // Spare tiles: as named, or every other word of the class, never another form of its own.
        const own = new Set(group.map((g) => g.lemma_id));
        const spare = s.spare_form_ids ? s.spare_form_ids.map((id) => form(id, where)) : forms.filter((f) => !own.has(f.lemma_id));
        step = {
          kind: 'exercise',
          item: item({ form: target, mode: 'sentence_build', direction: 'en_to_es', sentence: built, group }),
          sentences: allSentences(),
          forms: spare,
          twoStep: false,
        };
        break;
      }
      case 'pick_picture': {
        if (!Array.isArray(s.options) || s.options.length < 2) fail(`${where}: needs two options or more`);
        if (!s.options.every((o) => o && isStr(o.label))) fail(`${where}: every option needs a label`);
        if (new Set(s.options.map((o, i) => o.id ?? `o${i}`)).size !== s.options.length) fail(`${where}: two options share an id`);
        const right = s.options.filter((o) => o.correct);
        if (right.length !== 1) fail(`${where}: exactly one option must have correct: true`);
        const line = sentence(s.sentence_id, where);
        const options = s.options.map((o, i) => {
          if (o.image !== undefined && !(isStr(o.image) && /^https:\/\//.test(o.image))) fail(`${where}: option images must be https URLs`);
          const image = o.image ? uri(o.image) : o.lemma_id ? courseArt(o.lemma_id) : undefined;
          if (o.lemma_id && !image) fail(`${where}: no picture in the app for lemma ${o.lemma_id}`);
          if (image) preload.push(image);
          return { id: o.id ?? `o${i}`, label: o.label, image };
        });
        // Pictures for all of them or none: the grid needs four of a kind.
        const pictured = options.filter((o) => o.image).length;
        if (pictured && pictured !== options.length) fail(`${where}: give every option a picture, or none`);
        const correct = options[s.options.indexOf(right[0])];
        step = { kind: 'picture', prompt: s.prompt, line, options, correctId: correct.id, answer: correct.label };
        break;
      }
      case 'slang': {
        if (!s.words?.length) fail(`${where}: no words`);
        const words = s.words.map((w) => {
          const id = typeof w === 'string' ? w : w.id;
          const base = arWordById.get(id);
          const word = { pos: 'phrase', note: '', level: 1, ...base, ...(typeof w === 'string' ? {} : w) } as ArWord;
          if (!word.es || !word.en || !word.example?.es || !word.gap) fail(`${where}: word "${id}" needs es, en, example and gap`);
          // As a whole word, the way the slang class cuts the blank: "re" is not in "creo".
          const escaped = word.gap.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (!new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'iu').test(word.example.es))
            fail(`${where}: "${word.gap}" is not a word of the example of "${id}"`);
          return word;
        });
        const taken = new Set(words.map((w) => w.id));
        const decoys = (s.decoys ?? DEFAULT_DECOYS.filter((d) => !taken.has(d))).map(
          (id) => arWordById.get(id) ?? fail(`${where}: decoy "${id}" is not in argentine.json`),
        );
        if (decoys.length < 2) fail(`${where}: needs two decoys or more`);
        if (decoys.some((d) => taken.has(d.id))) fail(`${where}: a decoy is one of its own words`);
        step = { kind: 'slang', words, decoys };
        break;
      }
      case 'culture_intro':
        step = { kind: 'culture_intro' };
        break;
      case 'culture_card': {
        if (!isStr(s.text) || !s.text) fail(`${where}: no text`);
        const idx = s.art?.index ?? 0;
        if (!Number.isInteger(idx) || idx < 0) fail(`${where}: art.index must be a whole number from 0`);
        if (s.image !== undefined && !(isStr(s.image) && /^https:\/\//.test(s.image))) fail(`${where}: image must be an https URL`);
        const art = s.image ? uri(s.image) : artFor(s.art?.section ?? s.section ?? 'asado', idx);
        const section = s.art?.section ?? s.section ?? 'asado';
        if (!s.image && !ART_SECTIONS.includes(section)) fail(`${where}: no culture section "${section}"`);
        preload.push(art);
        step = {
          kind: 'culture_card',
          fact: { art, text: s.text, hero: null, chip: s.chip, bg: colour(s.bg) },
          section: s.section ?? 'asado',
          cls: s.class ?? 'el-ritual',
        };
        break;
      }
      default:
        fail(`${where}: unknown type "${(s as { type: string }).type}"`);
    }
    screens.push({ id: s.id, part, step: step! });
  }
  if (!screens.length) fail(`no screens for level "${level}"`);

  return {
    source: 'db',
    rowId: row.id,
    screens,
    lexicon,
    doneLine: c.done_line ?? 'Three words in, many more to go.',
    speakerArt: c.speaker_image === 'none' ? null : c.speaker_image ? uri(c.speaker_image) : fallbackSpeaker,
    preload,
  };
}

// --- one answer per app run ----------------------------------------------------

/** How long the class waits for the database before it opens the local one. */
const WAIT_MS = 4000;

type Pending = { promise: Promise<DbRow | null>; settled: boolean; row: DbRow | null };
let sourceAsk: { promise: Promise<Source>; value: Source | null } | null = null;
const rowAsks = new Map<Level, Pending>();

function askSource() {
  if (!sourceAsk) {
    const ask: { promise: Promise<Source>; value: Source | null } = { promise: Promise.resolve('local'), value: null };
    ask.promise = fetchSource()
      .catch((): Source => 'local')
      .then((v) => (ask.value = v));
    sourceAsk = ask;
  }
  return sourceAsk;
}

function askRow(level: Level): Pending {
  let p = rowAsks.get(level);
  if (!p) {
    const pending: Pending = { promise: Promise.resolve(null), settled: false, row: null };
    pending.promise = fetchRow(level)
      .catch((e) => {
        console.warn('[first-class] could not read first_classes', e);
        return null;
      })
      .then((row) => {
        pending.settled = true;
        pending.row = row;
        return row;
      });
    rowAsks.set(level, pending);
    p = pending;
  }
  return p;
}

/** Onboarding calls this early (as it opens, and once her level is known), so
 *  the class has its answer by the time it starts. Reads only the switch while
 *  it says "local". */
export function prefetchFirstClass(level?: Level) {
  const s = askSource();
  if (level) void s.promise.then((v) => v === 'db' && askRow(level));
}

/**
 * The class to play. `force` (admin preview) skips the switch. Never rejects:
 * anything wrong with the database class gives the local one.
 * `peek` returns it at once when the answer is already in; null means wait.
 */
export function firstClassScript(
  level: Level,
  local: () => Script,
  speaker: ImageSourcePropType | null,
  force?: Source,
): { peek: Script | null; promise: Promise<Script> } {
  const fromRow = (row: DbRow | null): Script => {
    if (!row) return local();
    try {
      return resolveRow(row, level, speaker);
    } catch (e) {
      console.warn('[first-class] database class not usable, playing the local one:', (e as Error).message);
      return local();
    }
  };
  if (force === 'local') return { peek: local(), promise: Promise.resolve(local()) };
  const s = force === 'db' ? null : askSource();
  if (s?.value === 'local') return { peek: local(), promise: Promise.resolve(local()) };
  if (s?.value === 'db' || force === 'db') {
    const r = askRow(level);
    if (r.settled) {
      const script = fromRow(r.row);
      return { peek: script, promise: Promise.resolve(script) };
    }
  }
  const work = (async () => {
    const source = force ?? (await s!.promise);
    if (source !== 'db') return local();
    return fromRow(await askRow(level).promise);
  })();
  // The admin preview waits longer (10 s), never forever.
  const timeout = new Promise<Script>((done) => setTimeout(() => done(local()), force ? 10000 : WAIT_MS));
  return { peek: null, promise: Promise.race([work, timeout]) };
}

/** The admin preview reads afresh: the dashboard may have just changed. */
export function forgetFirstClass() {
  sourceAsk = null;
  rowAsks.clear();
}

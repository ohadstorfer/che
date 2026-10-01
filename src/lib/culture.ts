import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import data from './culture.json';
import { localKey, pushSide, type SideEntries, syncSide } from './side-progress';
import { type CultureTone, cultureTones } from './theme';

// ---------------------------------------------------------------------------
// Culture lessons (docs/culture-spec.md): short classes about Argentine life,
// apart from the grammar course. The content ships inside the app — it is
// built from docs/culture/*.yaml by `npm run culture:build` — and which
// classes she has finished is kept on the device and on her account
// (lib/side-progress.ts).
// ---------------------------------------------------------------------------

export type CulturePage =
  | {
      type: 'info';
      title: string;
      body: string;
      emoji?: string;
      fun_fact?: string;
      /** A word or phrase worth a card of its own: shown huge, with a tag and its meaning. */
      word?: { es: string; en: string; tag?: string };
    }
  /** One short idea in big type, for classes told as cards (docs/culture-spec.md, "Card classes"). */
  | { type: 'card'; text: string; chip?: string }
  | { type: 'choice'; scenario?: string; prompt: string; options: string[]; correct: number; explain: string }
  | { type: 'true_false'; statement: string; answer: boolean; explain: string }
  | { type: 'order'; prompt: string; items: string[]; explain?: string }
  | { type: 'match'; prompt: string; pairs: [string, string][]; explain?: string }
  | {
      type: 'gap';
      prompt: string;
      text: string;
      options: string[];
      correct: number;
      translation?: string;
      explain: string;
    };

export interface CultureWord {
  es: string;
  en: string;
  example?: { es: string; en: string };
  note?: string;
  /** Storage path of the recorded pronunciation, once it exists. */
  audio?: string;
}

export interface CultureClass {
  slug: string;
  title: string;
  summary: string;
  pages: CulturePage[];
  vocabulary: CultureWord[];
  /** Spanish that appears in the reading but isn't practiced: tappable for its meaning, never quizzed. */
  glossary?: CultureWord[];
}

export interface CultureSection {
  slug: string;
  title: string;
  emoji: string;
  summary: string;
  classes: CultureClass[];
}

export const cultureSections = (data as { sections: CultureSection[] }).sections;

export function findClass(section: string, cls: string) {
  const s = cultureSections.find((x) => x.slug === section);
  const c = s?.classes.find((x) => x.slug === cls);
  return s && c ? { section: s, cls: c } : null;
}

const KEY = 'culture:done';
const keyOf = (section: string, cls: string) => `${section}/${cls}`;

export const classKey = keyOf;

async function readLocal(key: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

// A finished class is a pack score of 100 played once, so both kinds sync the same way.
const asEntries = (done: Set<string>): SideEntries =>
  Object.fromEntries([...done].map((k) => [k, { best: 100, last: 100, plays: 1 }]));

async function readDone(): Promise<Set<string>> {
  const key = await localKey(KEY);
  const done = await readLocal(key);
  const merged = await syncSide('culture', asEntries(done)).catch(() => null);
  if (!merged) return done;
  // Re-read so a class finished while the server answered isn't dropped.
  const all = new Set([...Object.keys(merged), ...(await readLocal(key))]);
  try {
    await AsyncStorage.setItem(key, JSON.stringify([...all]));
  } catch {
    // Still shown this time; the next session syncs again.
  }
  return all;
}

/** Records the class as finished and returns everything she has finished, this one included. */
export async function markClassDone(section: string, cls: string) {
  const done = await readDone();
  done.add(keyOf(section, cls));
  try {
    await AsyncStorage.setItem(await localKey(KEY), JSON.stringify([...done]));
  } catch {
    // Progress is a convenience; the class itself already happened.
  }
  pushSide('culture', keyOf(section, cls), { best: 100, last: 100, plays: 1, at: Date.now() });
  return done;
}

/** Finished classes, re-read whenever the screen comes back into focus. */
export function useCultureDone() {
  const [done, setDone] = useState<Set<string>>(new Set());
  useFocusEffect(
    useCallback(() => {
      void readDone().then(setDone);
    }, []),
  );
  return (section: string, cls: string) => done.has(keyOf(section, cls));
}

/** "Historia: el siglo XX y hoy" → eyebrow "Historia", title "el siglo XX y hoy" (capitalised). */
export function splitTitle(title: string): { eyebrow: string | null; title: string } {
  const i = title.indexOf(':');
  if (i < 0) return { eyebrow: null, title };
  const rest = title.slice(i + 1).trim();
  return { eyebrow: title.slice(0, i).trim(), title: rest.charAt(0).toUpperCase() + rest.slice(1) };
}

/** A class told as big cards, with no word review at the end. */
export const isCardClass = (cls: CultureClass) => cls.pages.some((p) => p.type === 'card');

/** Rough reading time: ~20s a page, plus a minute for the words at the end. A card class is ~12s a card, no words. */
export function classMinutes(cls: CultureClass) {
  if (isCardClass(cls)) return Math.max(1, Math.round((cls.pages.length * 12) / 60));
  return Math.max(2, Math.round((cls.pages.length * 20 + 60) / 60));
}

/** A section's colour, dealt in order so neighbouring tiles never share one. */
export function sectionTone(slug: string): CultureTone {
  const i = cultureSections.findIndex((s) => s.slug === slug);
  return cultureTones[Math.max(i, 0) % cultureTones.length];
}

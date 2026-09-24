import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import data from './culture.json';
import { type CultureTone, cultureTones } from './theme';

// ---------------------------------------------------------------------------
// Culture lessons (docs/culture-spec.md): short classes about Argentine life,
// apart from the grammar course. The content ships inside the app — it is
// built from docs/culture/*.yaml by `npm run culture:build` — and which
// classes she has finished is kept on the device.
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
}

export interface CultureClass {
  slug: string;
  title: string;
  summary: string;
  pages: CulturePage[];
  vocabulary: CultureWord[];
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

async function readDone(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Records the class as finished and returns everything she has finished, this one included. */
export async function markClassDone(section: string, cls: string) {
  const done = await readDone();
  done.add(keyOf(section, cls));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    // Progress is a convenience; the class itself already happened.
  }
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

/** Rough reading time: ~20s a page, plus a minute for the words at the end. */
export function classMinutes(cls: CultureClass) {
  return Math.max(2, Math.round((cls.pages.length * 20 + 60) / 60));
}

/** A section's colour, dealt in order so neighbouring tiles never share one. */
export function sectionTone(slug: string): CultureTone {
  const i = cultureSections.findIndex((s) => s.slug === slug);
  return cultureTones[Math.max(i, 0) % cultureTones.length];
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import data from './culture.json';

// ---------------------------------------------------------------------------
// Culture lessons (docs/culture-spec.md): short classes about Argentine life,
// apart from the grammar course. The content ships inside the app — it is
// built from docs/culture/*.yaml by `npm run culture:build` — and which
// classes she has finished is kept on the device.
// ---------------------------------------------------------------------------

export type CulturePage =
  | { type: 'info'; title: string; body: string; emoji?: string; fun_fact?: string }
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

async function readDone(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export async function markClassDone(section: string, cls: string) {
  const done = await readDone();
  done.add(keyOf(section, cls));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    // Progress is a convenience; the class itself already happened.
  }
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

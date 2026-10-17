import AsyncStorage from '@react-native-async-storage/async-storage';

import { pastel } from './theme';

/** The little pictures in the option coins (from the onboarding canvas). */
export const ART = {
  taxi: require('@/assets/images/onboarding/taxi.webp'),
  obelisco: require('@/assets/images/onboarding/obelisco.webp'),
  mate: require('@/assets/images/onboarding/mate.webp'),
  chat: require('@/assets/images/onboarding/chat.webp'),
  bandoneon: require('@/assets/images/onboarding/bandoneon.webp'),
  phone: require('@/assets/images/onboarding/phone.webp'),
  gramophone: require('@/assets/images/onboarding/gramophone.webp'),
  book: require('@/assets/images/onboarding/book.webp'),
  flag: require('@/assets/images/onboarding/flag.webp'),
  shout: require('@/assets/images/onboarding/shout.webp'),
} as const;
export type Art = keyof typeof ART;

// ---------------------------------------------------------------------------
// Onboarding — the few questions before the account, and the plan they add up
// to. Every answer is used somewhere she can see it again: on the plan, on the
// paywall's headline, or in the placement offer. A question whose answer
// changes nothing is not asked.
// ---------------------------------------------------------------------------

export type Why = 'moving' | 'trip' | 'love' | 'people' | 'culture';
export type Level = 'none' | 'basics' | 'spanish' | 'conversational';
export type When = 'month' | 'quarter' | 'half' | 'someday';
export type Minutes = 5 | 10 | 15 | 20;

export type Struggle = 'speak' | 'follow' | 'wrong' | 'kept' | 'bored' | 'slang' | 'english' | 'none';

export interface Answers {
  /** What he calls her during onboarding; empty when she skipped it. */
  name?: string;
  /** Her main reason: the one with a date, if she picked one (see mainWhy). */
  why: Why;
  /** Every reason she picked, in the order she picked them. */
  whys?: Why[];
  level: Level;
  /** No longer asked: the plan has no deadline unless an old answer set has one. */
  when?: When;
  minutes: Minutes;
  /** What got in the way before. Shapes Achieve and the paywall's promise. */
  struggle?: Struggle[];
  /** Whether she let him send a daily reminder. Subscribed once she has an account. */
  reminder?: boolean;
}

/** ", Sam" or nothing: for the lines that end on her name. */
export const nameTail = (a: Partial<Answers>) => (a.name?.trim() ? `, ${a.name.trim()}` : '');

// Each option carries the mascot's reaction to it: the question is asked by
// him, so the answer gets a reply, not just a checkmark.

export const WHY: { value: Why; label: string; icon: string; art: Art; tone: string; react: string; reactSpeaker: string }[] = [
  { value: 'trip', label: 'I’m going on a trip', icon: 'airplane', art: 'taxi', tone: pastel.sky, react: '¡Qué bueno! You’ll order empanadas like a local.', reactSpeaker: '¡Qué bueno! No more tourist Spanish at the parrilla.' },
  { value: 'moving', label: 'I’m moving to Argentina', icon: 'home-city-outline', art: 'obelisco', tone: pastel.peach, react: '¡Qué lindo! Let’s make it feel like home.', reactSpeaker: '¡Qué lindo! You’ll sound like a neighbour, not a newcomer.' },
  { value: 'love', label: 'Someone I love is Argentine', icon: 'heart-outline', art: 'mate', tone: pastel.sage, react: 'Ay, qué lindo. Let’s win over the family.', reactSpeaker: 'Ay, qué lindo. Time to talk the way the family does.' },
  { value: 'people', label: 'Friends, family or work', icon: 'account-group-outline', art: 'chat', tone: pastel.lav, react: 'Dale. You’ll keep up in the group chat.', reactSpeaker: 'Dale. You’ll get the jokes in the group chat.' },
  { value: 'culture', label: 'I love the culture', icon: 'music-note-outline', art: 'bandoneon', tone: pastel.butter, react: '¡Grande! Tango, rock, fútbol. We’ll get there.', reactSpeaker: '¡Grande! The lunfardo is where it gets good.' },
];

/** Of several reasons, the one the plan follows: a move or a trip has a date. */
export const mainWhy = (whys: Why[]): Why =>
  (['moving', 'trip', 'love', 'people', 'culture'] as Why[]).find((w) => whys.includes(w)) ?? 'trip';

export const LEVEL: { value: Level; label: string; short: string; sub: string; bars: number; tone: string; react: string }[] = [
  { value: 'none', label: 'I’m new to Spanish', short: 'New to Spanish', sub: 'Hola is about it', bars: 1, tone: pastel.sky, react: 'Perfecto. Nothing to unlearn.' },
  { value: 'basics', label: 'I know some basics', short: 'Some basics', sub: 'Simple words and phrases', bars: 2, tone: pastel.sage, react: 'Bien. Keep it. I’ll add the local parts.' },
  { value: 'spanish', label: 'I speak textbook Spanish', short: 'Textbook Spanish', sub: 'Tú, not vos', bars: 3, tone: pastel.lav, react: 'Then you have 90%. I’ll give you the rest.' },
  { value: 'conversational', label: 'I can hold a conversation', short: 'Conversational', sub: 'I want to sound local', bars: 4, tone: pastel.peach, react: '¡Genial! We skip the basics.' },
];

/** Whether she already speaks Spanish: the flashcards show her full sentences. */
export const speaksSpanish = (level: Level) => level === 'spanish' || level === 'conversational';

/** Asked in her own words: a trip has a date, a move has a day. */
export function whenQuestion(why: Why): string {
  if (why === 'trip') return "When's the trip?";
  if (why === 'moving') return 'When do you move?';
  return 'When do you want to be talking?';
}

/** The same question the way he'd ask it, in Spanish, above the English. */
export function whenQuestionEs(why: Why): string {
  if (why === 'trip') return '¿Cuándo viajás?';
  if (why === 'moving') return '¿Cuándo te mudás?';
  return '¿Para cuándo?';
}

export const WHEN: { value: When; label: string; react: string }[] = [
  { value: 'month', label: 'In the next month', react: "Tight, but doable. We start with what you'll use first." },
  { value: 'quarter', label: 'In 1–3 months', react: "Perfect. That's enough time to really sound local." },
  { value: 'half', label: 'In 3–6 months', react: '¡Bárbaro! Plenty of time to sound porteño.' },
  { value: 'someday', label: 'No date, just curious', react: 'Tranqui, no rush. We go at your pace.' },
];

export const MINUTES: { value: Minutes; label: string; words: number; tone: string; react: string }[] = [
  { value: 5, label: 'Casual', words: 60, tone: pastel.sky, react: 'Tranqui. Slow and steady gets there.' },
  { value: 10, label: 'Regular', words: 120, tone: pastel.peach, react: 'Dale. That’s how a habit sticks.' },
  { value: 15, label: 'Serious', words: 180, tone: pastel.sage, react: '¡Bien! You’ll feel it within a week.' },
  { value: 20, label: 'Intense', words: 240, tone: pastel.lav, react: '¡Epa! The fast lane. I like it.' },
];

// --- try it: a textbook line she turns into the Buenos Aires one -----------

const VARIANT: Record<Level, 'n' | 't' | 'q' | 'c'> = { none: 'n', basics: 't', spanish: 'q', conversational: 'c' };

// Same number of words in both lines; the ones that differ are hers to tap.
// Longer lines and less help as the level goes up.
const TRY_LINES: Record<Why, Record<'n' | 't' | 'q' | 'c', [string, string, string]>> = {
  trip: {
    n: ['¿Tú tomas el autobús?', '¿Vos tomás el colectivo?', 'Do you take the bus?'],
    t: ['¿Tú tienes que tomar el autobús?', '¿Vos tenés que tomar el colectivo?', 'Do you have to take the bus?'],
    q: ['¿Tú quieres tomar el autobús?', '¿Vos querés tomar el colectivo?', 'Do you want to take the bus?'],
    c: ['Ven aquí, tomamos el autobús.', 'Vení acá, tomamos el colectivo.', 'Come here, we’ll take the bus.'],
  },
  moving: {
    n: ['¿Tú tienes un piso?', '¿Vos tenés un depto?', 'Do you have a flat?'],
    t: ['¿Tú tienes un piso en Palermo?', '¿Vos tenés un depto en Palermo?', 'Do you have a flat in Palermo?'],
    q: ['¿Tú quieres ver el piso?', '¿Vos querés ver el depto?', 'Do you want to see the flat?'],
    c: ['Ven aquí y mira el piso.', 'Vení acá y mirá el depto.', 'Come here and look at the flat.'],
  },
  love: {
    n: ['Tú eres muy guay.', 'Vos sos muy copado.', 'You are very cool.'],
    t: ['Tú tienes una familia guay.', 'Vos tenés una familia copada.', 'You have a cool family.'],
    q: ['¿Tú quieres conocer gente guay?', '¿Vos querés conocer gente copada?', 'Do you want to meet cool people?'],
    c: ['Ven aquí, mi familia es guay.', 'Vení acá, mi familia es copada.', 'Come here, my family is cool.'],
  },
  people: {
    n: ['Vale, ¿tú vienes?', 'Dale, ¿vos venís?', 'OK, are you coming?'],
    t: ['Vale, ¿tú tienes tiempo?', 'Dale, ¿vos tenés tiempo?', 'OK, do you have time?'],
    q: ['Vale, ¿tú quieres venir?', 'Dale, ¿vos querés venir?', 'OK, do you want to come?'],
    c: ['Vale, ven aquí a las ocho.', 'Dale, vení acá a las ocho.', 'OK, come here at eight.'],
  },
  culture: {
    n: ['¿Tú eres aficionado?', '¿Vos sos hincha?', 'Are you a fan?'],
    t: ['¿Tú tienes un amigo aficionado de Boca?', '¿Vos tenés un amigo hincha de Boca?', 'Do you have a friend who is a Boca fan?'],
    q: ['¿Tú quieres ser aficionado de Boca?', '¿Vos querés ser hincha de Boca?', 'Do you want to be a Boca fan?'],
    c: ['Ven aquí, soy aficionado de Boca.', 'Vení acá, soy hincha de Boca.', 'Come here, I’m a Boca fan.'],
  },
};

export interface TryIt {
  book: string[];
  local: string[];
  en: string;
  /** Indexes of the words that change. */
  targets: number[];
  head: string;
  start: string;
  done: string;
}

export function tryIt(a: Pick<Answers, 'why' | 'level'>): TryIt {
  const [es, ar, en] = TRY_LINES[a.why][VARIANT[a.level]];
  const book = es.split(' ');
  const local = ar.split(' ');
  const targets = book.map((_, i) => i).filter((i) => book[i] !== local[i]);
  const n = targets.length;
  // One line at every level: how many words give the textbook away.
  const start = `${n} of these words are different in Argentina.`;
  const copy = {
    none: { head: 'Make it Argentine.', start, done: '¡Eso! Your first Argentine sentence.' },
    basics: { head: 'Make it Argentine.', start, done: '¡Eso! That’s how we say it here.' },
    spanish: { head: 'Which words give you away?', start, done: '¡Eso! Nobody will ask where you learned it.' },
    conversational: { head: 'Which words give you away?', start, done: '¡Eso! Now you sound like you live here.' },
  }[a.level];
  return { book, local, en, targets, ...copy };
}

// --- struggle: what got in the way ------------------------------------------

export interface StruggleOption {
  value: Struggle;
  label: string;
  art: Art;
  tone: string;
  react: string;
}

/** A beginner has no "before"; a Spanish speaker has a different problem. */
export function struggleQuestion(level: Level): { en: string; options: StruggleOption[] } {
  if (level === 'none')
    return {
      en: 'What worries you about starting?',
      options: [
        { value: 'speak', label: 'Speaking out loud', art: 'phone', tone: pastel.sky, react: 'With me, nobody is listening.' },
        { value: 'follow', label: 'Understanding real people', art: 'gramophone', tone: pastel.lav, react: 'Real voices from lesson 1, slowed down.' },
        { value: 'kept', label: 'Finding the time', art: 'mate', tone: pastel.sage, react: 'That’s why it’s 10 minutes.' },
        { value: 'bored', label: 'Getting bored', art: 'book', tone: pastel.peach, react: 'Then we keep it short, and about you.' },
        { value: 'none', label: 'Nothing. I’m ready', art: 'flag', tone: pastel.butter, react: '¡Esa! Let’s go.' },
      ],
    };
  if (level === 'basics')
    return {
      en: 'What got in the way before?',
      options: [
        { value: 'speak', label: 'I freeze when I speak', art: 'phone', tone: pastel.sky, react: 'With me you can mess up. I fix one thing.' },
        { value: 'follow', label: 'I can’t follow real speech', art: 'gramophone', tone: pastel.lav, react: 'You get real porteño audio from lesson 1.' },
        { value: 'wrong', label: 'I learned textbook Spanish', art: 'book', tone: pastel.peach, react: 'It wasn’t you. We swap it, word by word.' },
        { value: 'kept', label: 'I never kept it up', art: 'mate', tone: pastel.sage, react: 'That’s why it’s 10 minutes, and I knock.' },
        { value: 'none', label: 'Nothing. Just teach me', art: 'flag', tone: pastel.butter, react: 'Dale. We build on what you have.' },
      ],
    };
  return {
    en: 'What trips you up with Argentines?',
    options: [
      { value: 'follow', label: 'They talk fast, I get lost', art: 'gramophone', tone: pastel.lav, react: 'It’s the sh and the slang. We train your ear.' },
      { value: 'wrong', label: 'I sound like a textbook', art: 'book', tone: pastel.peach, react: 'It’s vos, the sh and about 30 words.' },
      { value: 'slang', label: 'The slang loses me', art: 'shout', tone: pastel.butter, react: 'Lunfardo has its own section.' },
      { value: 'english', label: 'They switch to English', art: 'chat', tone: pastel.sky, react: 'They stop when you answer with vos.' },
      { value: 'none', label: 'Nothing yet', art: 'flag', tone: pastel.sage, react: 'Dale. Straight to sounding porteño.' },
    ],
  };
}

// --- achieve: results, not features ------------------------------------------

export interface AchieveRow {
  text: string;
  tone: string;
  art?: Art;
  /** A word drawn in place of a picture. */
  glyph?: string;
}

const SCENE: Record<Why, Record<Level, string>> = {
  trip: { none: 'Order a coffee and find your bus', basics: 'Order dinner and chat with the waiter', spanish: 'Order like a porteño, not a tourist', conversational: 'Trade jokes with the waiter at a parrilla' },
  moving: { none: 'Greet the portero and buy a SUBE', basics: 'Rent a depto and sort the paperwork', spanish: 'Handle landlord, bank and kiosco in vos', conversational: 'Sound like a neighbour, not a newcomer' },
  love: { none: 'Greet the whole family the Argentine way', basics: 'Follow the talk at the family asado', spanish: 'Joke with the in‑laws in their Spanish', conversational: 'Be one of the family at the table' },
  people: { none: 'Say hi and make plans in the chat', basics: 'Keep up with small talk at work', spanish: 'Use dale, re and che like they do', conversational: 'Hold your own when everyone talks at once' },
  culture: { none: 'Catch the words in songs and matches', basics: 'Follow a match with the locals', spanish: 'Get the lunfardo in tango and rock', conversational: 'Get the jokes without subtitles' },
};

const SKILL: Record<Level, { text: string; glyph: string }> = {
  none: { text: 'Say your first words the local way', glyph: 'che' },
  basics: { text: 'Use vos and tenés like everyone here', glyph: 'vos' },
  spanish: { text: 'Swap tú for vos without thinking', glyph: 'vos' },
  conversational: { text: 'Nail the vos commands: vení, decime, mirá', glyph: 'vení' },
};

const FIX: Partial<Record<Struggle, string>> = {
  speak: 'Speak out loud without freezing',
  follow: 'Follow real people at real speed',
  wrong: 'Drop the textbook words for good',
  kept: 'Keep a habit that finally sticks',
  bored: 'Learn from your life, not a textbook',
  slang: 'Get the street words, the lunfardo',
  english: 'Keep them from switching to English',
};

/** Three lines in her words: the scene for each reason she picked (at her
 *  level), what her level gets, and the answer to what she said gets in the way. */
export function achieveRows(a: Answers): AchieveRow[] {
  const whys = a.whys?.length ? a.whys : [a.why];
  const ranked = (['love', 'moving', 'trip', 'culture', 'people'] as Why[]).filter((w) => whys.includes(w));
  const scene = (w: Why): AchieveRow => {
    const o = WHY.find((x) => x.value === w)!;
    return { text: SCENE[w][a.level], art: o.art, tone: o.tone };
  };
  const named = (a.struggle ?? []).find((k) => FIX[k]);
  const fixOpt = named ? struggleQuestion(a.level).options.find((o) => o.value === named) : undefined;
  const fix: AchieveRow = named
    ? { text: FIX[named]!, art: fixOpt?.art ?? 'mate', tone: fixOpt?.tone ?? pastel.butter }
    : { text: 'Know the customs, not only the words', art: 'mate', tone: pastel.butter };
  const skill: AchieveRow = { text: SKILL[a.level].text, glyph: SKILL[a.level].glyph, tone: pastel.lav };
  const rows = ranked.length > 1 ? [scene(ranked[0]), scene(ranked[1]), named ? fix : skill] : [scene(ranked[0] ?? 'trip'), skill, fix];
  // No two stickers with the same picture or the same colour.
  if (rows[2].art && (rows[2].art === rows[0].art || rows[2].art === rows[1].art)) rows[2].art = 'shout';
  const tones = [pastel.sky, pastel.lav, pastel.peach, pastel.sage, pastel.butter];
  const used: string[] = [];
  for (const r of rows) {
    if (used.includes(r.tone)) r.tone = tones.find((t) => !used.includes(t) && rows.every((x) => x === r || x.tone !== t)) ?? r.tone;
    used.push(r.tone);
  }
  return rows;
}

// --- notifications: the nudge she will get ----------------------------------

const TODAY: Record<Why, [string, string]> = {
  trip: ['ordering a coffee', 'ordering without a single tú'],
  moving: ['meeting the portero', 'small talk with the portero'],
  love: ['greeting the family', 'jokes at the family table'],
  people: ['the group chat', 'the slang in the group chat'],
  culture: ['what che means', 'the lunfardo in a tango'],
};

export function reminderLine(a: Answers): string {
  const who = a.name?.trim() ? `Che ${a.name.trim()}` : 'Che';
  return `${who}, ${a.minutes} minutes? Today: ${TODAY[a.why][speaksSpanish(a.level) ? 1 : 0]}.`;
}

/** A word a day, three days of it: everyday words for a beginner, street
 *  words for someone who already speaks Spanish. */
export const WORDS_OF_DAY: Record<Level, [string, string][]> = {
  none: [['che', 'hey'], ['dale', 'OK, sure'], ['bondi', 'the bus']],
  basics: [['dale', 'OK, sure'], ['bondi', 'the bus'], ['guita', 'money']],
  spanish: [['quilombo', 'a total mess'], ['laburo', 'work'], ['posta', 'for real']],
  conversational: [['chamuyo', 'smooth talk'], ['fiaca', 'can’t be bothered'], ['bancar', 'to back someone']],
};

// --- your course: the clip, and what it shows -------------------------------

/** Her course clip, one per reason (the beginner cut), bundled so it plays
 *  at once and offline. Rendered from che/social/src/onboarding/CourseLoop.tsx,
 *  optimized copies in che/social/out/optimized. */
export const COURSE_CLIP: Record<Why, number> = {
  trip: require('@/assets/videos/onboarding/course-trip.mp4'),
  moving: require('@/assets/videos/onboarding/course-moving.mp4'),
  love: require('@/assets/videos/onboarding/course-love.mp4'),
  people: require('@/assets/videos/onboarding/course-people.mp4'),
  culture: require('@/assets/videos/onboarding/course-culture.mp4'),
};

const TOMORROW: Record<Why, [string, string]> = {
  trip: ['Order a coffee like a local', 'Order without a single tú'],
  moving: ['What to say to the portero', 'Small talk with the portero'],
  love: ['Greet the whole family', 'Jokes at the family table'],
  people: ['The two words that end every chat', 'The slang in the group chat'],
  culture: ['What che really means', 'The lunfardo in a tango'],
};

const FIRST_CHAT: Record<Why, [{ bad: string; fix: string }, { bad: string; fix: string }]> = {
  trip: [{ bad: 'Tienes', fix: 'Tenés' }, { bad: 'Puedes', fix: 'Podés' }],
  moving: [{ bad: 'tú', fix: 'vos' }, { bad: 'Tienes', fix: 'Tenés' }],
  love: [{ bad: 'tú', fix: 'vos' }, { bad: 'Eres', fix: 'Sos' }],
  people: [{ bad: 'Vale', fix: 'Dale' }, { bad: 'Vienes', fix: 'Venís' }],
  culture: [{ bad: 'tú', fix: 'vos' }, { bad: 'Eres', fix: 'Sos' }],
};

const CUSTOM: Record<Why, string> = {
  trip: 'Dinner starts at 10 pm.',
  moving: 'One kiss on the cheek. Guys too.',
  love: 'At the mate, gracias means “no more”.',
  people: 'One kiss on the cheek. Guys too.',
  culture: 'You’re not a fan. You’re an hincha.',
};

/** The same course in words: what the clip shows, for when it can't play. */
export function courseMoments(a: Answers) {
  const tier = speaksSpanish(a.level) ? 1 : 0;
  return {
    first: TOMORROW[a.why][tier],
    chat: FIRST_CHAT[a.why][tier],
    custom: CUSTOM[a.why],
  };
}

// --- the plan ---------------------------------------------------------------

export interface Milestone {
  when: string;
  what: string;
}

export interface Plan {
  /** "by March 14": when she'll be having her first real conversations. */
  date: Date;
  headline: string;
  /** Where the plan takes her, short enough for the ticket. */
  to: string;
  weeks: number;
  milestones: Milestone[];
  /** Her date comes before the plan's: the daily goal that would close the gap. */
  faster: { minutes: Minutes; date: Date } | null;
}

/** Weeks until the date she gave, roughly. */
const DEADLINE: Record<When, number | null> = { month: 4, quarter: 12, half: 24, someday: null };

function weeksFor(level: Level, minutes: Minutes): number {
  // Weeks to a first real conversation: where she starts, slowed or sped by
  // her daily minutes. Rough on purpose — it is a promise sized to her, not a
  // forecast, and it errs early so it reads as reachable.
  const base = { none: 16, basics: 11, spanish: 5, conversational: 3 }[level];
  return Math.max(2, Math.round(base * (10 / minutes) ** 0.6));
}

const inWeeks = (now: Date, weeks: number) => new Date(now.getTime() + weeks * 7 * 86400000);

/** What the milestones are about, in the life she told us about. `to` is the
 *  same goal cut to fit the plan's ticket. */
const GOAL: Record<Why, { first: string; real: string; to: string }> = {
  moving: { first: 'Sort out a SUBE card and a café order', real: 'Talk with your neighbors, landlord and new friends', to: 'Living like a local' },
  trip: { first: 'Order empanadas and ask for directions', real: 'Chat with locals at a parrilla', to: 'Chatting at a parrilla' },
  love: { first: 'Greet the family the Argentine way', real: 'Keep up at the family asado', to: 'Keeping up at the asado' },
  people: { first: 'Small talk, the porteño way', real: 'Hold your own in a group chat', to: 'Holding your own' },
  culture: { first: 'Get the jokes in tango and rock nacional', real: 'Watch Argentine TV without subtitles', to: 'TV without subtitles' },
};

export function buildPlan(a: Answers, now = new Date()): Plan {
  const weeks = weeksFor(a.level, a.minutes);
  const date = inWeeks(now, weeks);
  const g = GOAL[a.why];
  const deadline = DEADLINE[a.when ?? 'someday'];
  const inTime = deadline != null && weeks <= deadline;
  const headline =
    inTime && a.why === 'trip'
      ? 'Ready for your trip'
      : inTime && a.why === 'moving'
        ? 'Ready for the move'
        : a.level === 'spanish' || a.level === 'conversational'
          ? 'Sound like a porteño'
          : 'Talk like an Argentine';
  // Past her date: the smallest daily goal that makes it, if one does.
  let faster: Plan['faster'] = null;
  if (deadline != null && !inTime) {
    const m = ([15, 20] as Minutes[]).find((x) => x > a.minutes && weeksFor(a.level, x) <= deadline) ?? null;
    const best = ([15, 20] as Minutes[]).filter((x) => x > a.minutes).at(-1);
    const pick = m ?? best;
    if (pick) faster = { minutes: pick, date: inWeeks(now, weeksFor(a.level, pick)) };
  }
  return {
    date,
    headline,
    to: g.to,
    weeks,
    faster,
    milestones: [
      { when: 'Day 1', what: a.level === 'spanish' ? 'Swap tú for vos, and never look back' : 'Your first words, with vos from day one' },
      { when: 'Day 3', what: 'Your first 5-minute chat with Pancho' },
      { when: 'Week 1', what: g.first },
      { when: `Week ${weeks}`, what: g.real },
    ],
  };
}

export const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
export const formatShortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// --- storage ----------------------------------------------------------------

const KEY = 'che.onboarding';
const OFFER_KEY = 'che.winback-shown';

export async function saveAnswers(a: Answers): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(a)).catch(() => {});
}

export async function loadAnswers(): Promise<Answers | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Answers) : null;
  } catch {
    return null;
  }
}

/** The win-back offer is shown once, ever — it is a real one-time offer. */
export async function winbackShown(): Promise<boolean> {
  return (await AsyncStorage.getItem(OFFER_KEY).catch(() => null)) === '1';
}

export async function markWinbackShown(): Promise<void> {
  await AsyncStorage.setItem(OFFER_KEY, '1').catch(() => {});
}

/** Staff replaying onboarding see the offer again. */
export async function resetWinbackShown(): Promise<void> {
  await AsyncStorage.removeItem(OFFER_KEY).catch(() => {});
}

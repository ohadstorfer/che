import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface Answers {
  why: Why;
  level: Level;
  when: When;
  minutes: Minutes;
}

// Each option carries the mascot's reaction to it: the question is asked by
// him, so the answer gets a reply, not just a checkmark.

export const WHY: { value: Why; label: string; icon: string; react: string }[] = [
  { value: 'moving', label: "I'm moving to Argentina", icon: 'home-city-outline', react: "¡Qué lindo! Let's make Argentina feel like home." },
  { value: 'trip', label: "I'm going on a trip", icon: 'airplane', react: "¡Qué bueno! I'll have you ordering empanadas like a local." },
  { value: 'love', label: 'Someone I love is Argentine', icon: 'heart-outline', react: "Ay, qué lindo. Let's win over the family asado." },
  { value: 'people', label: 'Friends, family or work', icon: 'account-group-outline', react: "Dale. You'll keep up in the group chat in no time." },
  { value: 'culture', label: 'I love the culture', icon: 'music-note-outline', react: '¡Grande! Tango, rock nacional, fútbol: we’ll get there.' },
];

export const LEVEL: { value: Level; label: string; short: string; sub: string; bars: number; react: string }[] = [
  { value: 'none', label: "I'm new to Spanish", short: 'New to Spanish', sub: 'Hola is about it', bars: 1, react: 'Perfecto. We start from cero, with vos from day one.' },
  { value: 'basics', label: 'I know some basics', short: 'Some basics', sub: 'Simple words and phrases', bars: 2, react: "Bien. We'll build on it, the Argentine way." },
  { value: 'spanish', label: 'I speak Spanish, not Argentine', short: 'Textbook Spanish', sub: 'Tú, not vos', bars: 3, react: "Ah, then I've got a surprise for you. Next screen." },
  { value: 'conversational', label: 'I can hold a conversation', short: 'Conversational', sub: 'I want to sound local', bars: 4, react: "¡Genial! Let's make you sound porteño." },
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

export const MINUTES: { value: Minutes; label: string; words: number; react: string }[] = [
  { value: 5, label: 'Casual', words: 60, react: 'Like one mate. About 60 new words a month.' },
  { value: 10, label: 'Regular', words: 120, react: 'Buenísimo. About 120 new words a month.' },
  { value: 15, label: 'Serious', words: 180, react: '¡Eso! About 180 new words a month.' },
  { value: 20, label: 'Intense', words: 240, react: '¡Uy, a full ronda! About 240 new words a month.' },
];

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
  const deadline = DEADLINE[a.when];
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

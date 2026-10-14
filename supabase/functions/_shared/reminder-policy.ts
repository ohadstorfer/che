// When to remind a learner, and with which words. Pure: no database, no clock
// of its own, so `supabase/tests/reminders.test.mjs` can run every case.
//
// The shape follows what Duolingo has published about its own reminders:
//
//   - A routine reminder half an hour before the time she practised last
//     (23.5 hours after her last session), because the best guess for when
//     she is free today is when she was free yesterday.
//   - A save reminder late in the evening, only when a live streak is about
//     to freeze.
//   - Never more than those two in a day, and nothing once she has practised.
//   - Fewer the longer she stays away, then one message saying the reminders
//     will stop, then silence until she comes back on her own.
//   - The words are picked by the bandit from "A Sleeping, Recovering Bandit
//     Algorithm for Optimizing Recurring Notifications" (Yancey & Settles,
//     KDD 2020): templates with eligibility rules, scored by how much more
//     often a round follows within two hours when the template is sent than
//     when it could have been and wasn't, minus a penalty for having been
//     shown to this learner recently, then chosen by softmax.

export type Slot = "routine" | "save";

export type Sent = { template: string; slot: Slot; sent_at: string; local_date: string };

export type Learner = {
  timezone: string;
  /** When her first device signed up for reminders: the anchor until she has practised. */
  anchorAt: string;
  streak: number;
  lastPracticeDate: string | null;
  /** The first round she finished on the last day she practised. */
  lastCompletedAt: string | null;
  lastRoundStartedAt: string | null;
  /** What she was sent over the last weeks, any order. */
  recent: Sent[];
};

export type TemplateStats = { chosen: number; chosenWon: number; passed: number; passedWon: number };

export type Decision =
  | { send: { slot: Slot; template: string; eligible: string[]; body: string } }
  | { skip: string };

const EARLIEST = 8 * 60;
const LATEST_ROUTINE = 21 * 60;
/** How long after her habit time a routine reminder is still worth sending. */
const ROUTINE_WINDOW = 180;
const HABIT_LEAD = 30;
const SAVE_FROM = 21 * 60;
const SAVE_UNTIL = 23 * 60;
const MIN_GAP_MINUTES = 90;
const IN_A_ROUND_MINUTES = 20;

/** Days since she last practised on which a routine reminder goes out. Day 1
 *  is the day after a practice day, when the streak is still alive. */
const ROUTINE_DAYS = new Set([1, 2, 3, 4, 6]);
/** The day the last message goes out. Nothing is sent after it. */
export const FAREWELL_DAY = 8;
export const FAREWELL = "farewell";

// The paper's values.
const RECENCY_PENALTY = 0.017;
const RECENCY_HALF_LIFE_DAYS = 15;
const TEMPERATURE = 0.0025;
/** The most a score can count for. The paper lets a strong template win every
 *  round; with a pool this small that would be the same line every day, so a
 *  proven winner sent yesterday only ties with an untested one not yet seen. */
const SCORE_CAP = RECENCY_PENALTY;
/** Weight of the prior (the average over both cases) in each rate estimate. */
const PRIOR_WEIGHT = 20;

type Context = { streak: number; idle: number; practised: boolean };

type Template = {
  id: string;
  slot: Slot;
  when: (c: Context) => boolean;
  body: (c: Context) => string;
};

const alive = (c: Context) => c.practised && c.idle === 1;
const away = (c: Context) => c.practised && c.idle > 1;

export const TEMPLATES: Template[] = [
  // The day after a practice day.
  { id: "streak_keep", slot: "routine", when: (c) => alive(c) && c.streak >= 2,
    body: (c) => `Day ${c.streak + 1} is waiting. Keep your ${c.streak}-day streak going 🔥` },
  { id: "same_time", slot: "routine", when: alive,
    body: () => "Same time as yesterday? Your round is ready." },
  { id: "mate", slot: "routine", when: alive,
    body: () => "Put the kettle on. One round while the mate brews 🧉" },
  { id: "porteno", slot: "routine", when: alive,
    body: () => "One round closer to sounding like a porteño." },
  // Any day she has practised before.
  { id: "five_minutes", slot: "routine", when: (c) => c.practised,
    body: () => "Five minutes of Spanish? Dale 💪" },
  { id: "que_onda", slot: "routine", when: (c) => c.practised,
    body: () => "¿Qué onda? Got five minutes for a round?" },
  { id: "pancho_seat", slot: "routine", when: (c) => c.practised,
    body: () => "Pancho saved you a seat. One quick round?" },
  // After a missed day. A run that outlived its last practice day is frozen,
  // and two rounds on the day she comes back buy it back (finish_lesson).
  { id: "frozen", slot: "routine", when: (c) => away(c) && c.streak >= 2,
    body: (c) => `Your ${c.streak}-day streak is frozen, not gone. Two rounds today bring it back.` },
  { id: "frozen_pancho", slot: "routine", when: (c) => away(c) && c.streak >= 2,
    body: (c) => `Pancho is guarding your ${c.streak}-day streak. Two rounds and it's yours again.` },
  { id: "no_pressure", slot: "routine", when: away,
    body: () => "No pressure. One short round and you're back in it." },
  { id: "still_here", slot: "routine", when: away,
    body: () => "Che, your Spanish misses you. ¿Volvemos?" },
  { id: "two_minutes", slot: "routine", when: away,
    body: () => "Two minutes. That's all a comeback takes." },
  // Reminders on, no round finished yet.
  { id: "first_round", slot: "routine", when: (c) => !c.practised,
    body: () => "Your first round takes three minutes. ¿Arrancamos?" },
  { id: "first_real", slot: "routine", when: (c) => !c.practised,
    body: () => "Ready to hear how Argentines really talk? Round one is waiting." },
  // The evening save.
  { id: "save_midnight", slot: "save", when: alive,
    body: (c) => `Your ${c.streak}-day streak freezes at midnight. One round keeps it going 🔥` },
  { id: "save_still_time", slot: "save", when: alive,
    body: (c) => `Still time. A quick round keeps your ${c.streak}-day streak alive.` },
  { id: "save_pancho", slot: "save", when: alive,
    body: (c) => `Pancho is watching the clock. Save your ${c.streak}-day streak before midnight.` },
];

const FAREWELL_BODY = "These reminders don't seem to be helping, so I'll stop for now. Volvé cuando quieras.";

export function decide(
  learner: Learner,
  now: Date,
  stats: Map<string, TemplateStats> = new Map(),
  random: () => number = Math.random,
): Decision {
  const here = localParts(learner.timezone, now);
  // `>=`, not `===`: the app writes the phone's date, which can be a day ahead
  // of the timezone on the subscription.
  if (learner.lastPracticeDate && learner.lastPracticeDate >= here.date) return { skip: "done-today" };
  if (minutesSince(learner.lastRoundStartedAt, now) < IN_A_ROUND_MINUTES) return { skip: "in-a-round" };

  const practised = learner.lastPracticeDate !== null;
  const since = learner.lastPracticeDate ?? localParts(learner.timezone, new Date(learner.anchorAt)).date;
  const idle = daysBetween(since, here.date);
  if (idle < 1) return { skip: "first-day" };
  if (idle > FAREWELL_DAY) return { skip: "gone-quiet" };
  if (idle !== FAREWELL_DAY && !ROUTINE_DAYS.has(idle)) return { skip: "rest-day" };

  if (learner.recent.some((s) => minutesSince(s.sent_at, now) < MIN_GAP_MINUTES)) return { skip: "throttled" };
  const today = learner.recent.filter((s) => s.local_date === here.date);
  const sentToday = (slot: Slot) => today.some((s) => s.slot === slot);

  const habitAt = localParts(learner.timezone, new Date(learner.lastCompletedAt ?? learner.anchorAt)).minutes;
  const routineAt = Math.min(Math.max(habitAt - HABIT_LEAD, EARLIEST), LATEST_ROUTINE);

  let slot: Slot | null = null;
  if (!sentToday("routine") && here.minutes >= routineAt && here.minutes < routineAt + ROUTINE_WINDOW) {
    slot = "routine";
  } else if (
    idle === 1 && practised && learner.streak >= 1 && !sentToday("save") &&
    here.minutes >= SAVE_FROM && here.minutes < SAVE_UNTIL
  ) {
    slot = "save";
  }
  if (!slot) return { skip: here.minutes < routineAt && !sentToday("routine") ? "before-habit-time" : "nothing-due" };

  if (idle === FAREWELL_DAY) {
    return { send: { slot, template: FAREWELL, eligible: [FAREWELL], body: FAREWELL_BODY } };
  }

  const context: Context = { streak: learner.streak, idle, practised };
  const eligible = TEMPLATES.filter((t) => t.slot === slot && t.when(context));
  if (eligible.length === 0) return { skip: "no-template" };

  const weights = eligible.map((t) => {
    const last = learner.recent
      .filter((s) => s.template === t.id)
      .reduce((latest, s) => Math.max(latest, new Date(s.sent_at).getTime()), -Infinity);
    const days = (now.getTime() - last) / 86_400_000;
    const penalty = Number.isFinite(days) ? RECENCY_PENALTY * 0.5 ** (days / RECENCY_HALF_LIFE_DAYS) : 0;
    const evidence = Math.max(-SCORE_CAP, Math.min(SCORE_CAP, score(stats.get(t.id))));
    return Math.exp((evidence - penalty) / TEMPERATURE);
  });
  let roll = random() * weights.reduce((a, b) => a + b, 0);
  let chosen = eligible[eligible.length - 1];
  for (let i = 0; i < eligible.length; i++) {
    roll -= weights[i];
    if (roll < 0) {
      chosen = eligible[i];
      break;
    }
  }
  return {
    send: { slot, template: chosen.id, eligible: eligible.map((t) => t.id), body: chosen.body(context) },
  };
}

/**
 * How much more often a round follows this template than follows another one
 * sent to a learner it was also eligible for, relative to the latter (the
 * paper's equation 1). Comparing inside the same eligibility keeps a streak
 * message from looking good only because learners with streaks practise more.
 *
 * The paper has millions of sends a day behind each estimate; here there may
 * be a dozen. So the score only counts by how far it clears its own 95%
 * interval (the paper's equation 5): with little data every template scores
 * zero and the recency penalty alone rotates them.
 */
export function score(s: TemplateStats | undefined): number {
  if (!s || s.chosen === 0 || s.passed === 0) return 0;
  const prior = (s.chosenWon + s.passedWon) / (s.chosen + s.passed);
  const plus = (s.chosenWon + prior * PRIOR_WEIGHT) / (s.chosen + PRIOR_WEIGHT);
  const minus = (s.passedWon + prior * PRIOR_WEIGHT) / (s.passed + PRIOR_WEIGHT);
  if (minus <= 0) return 0;
  const relative = (plus - minus) / minus;
  const error = Math.sqrt(
    (plus * (1 - plus)) / (s.chosen + PRIOR_WEIGHT) + (minus * (1 - minus)) / (s.passed + PRIOR_WEIGHT),
  ) / minus;
  return Math.sign(relative) * Math.max(0, Math.abs(relative) - 1.96 * error);
}

/** The local date (YYYY-MM-DD) and minute of the day in a timezone. */
export function localParts(timezone: string, at: Date): { date: string; minutes: number } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = formatter(timezone).formatToParts(at);
  } catch {
    parts = formatter("UTC").formatToParts(at);
  }
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timezone: string): Intl.DateTimeFormat {
  let f = formatters.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timezone, f);
  }
  return f;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function minutesSince(at: string | null, now: Date): number {
  return at ? (now.getTime() - new Date(at).getTime()) / 60_000 : Infinity;
}

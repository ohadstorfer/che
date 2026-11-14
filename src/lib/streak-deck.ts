import AsyncStorage from '@react-native-async-storage/async-storage';

import { type CheerRow, r } from '@/lib/cheer-deck';

// ---------------------------------------------------------------------------
// The streak's reward screens, drawn by the same engine as the mid-lesson
// cheers (lesson-cheer.tsx, `streak` mode): the colour comes in full screen,
// Pancho, a big line, stickers slapped down, something moving behind him.
//
// An ordinary day deals from a deck of thirty without repeats, like the
// cheers. A milestone day always gets its own screen: the big version, with
// two or three things behind him and its own stickers.
//
// In streak mode the layouts read the run as days: `count` and `stamps` show
// the number big, the chips carry the flame, the medal says "days in a row".
// ---------------------------------------------------------------------------

export type StreakDesign = CheerRow & { id: string; milestone?: string };

const DECK: CheerRow[] = [
  r('rise', 'none', 'hero', 'rosa', 'gol', 'Day {n}!', 'Your streak is on fire.'),
  r('sun', 'rays', 'count', 'butter', 'mate', 'days in a row!'),
  r('fade', 'none', 'stamps', 'mint', 'wave', 'days in a row', undefined, { words: ['Still', 'here!'] }),
  r('left', 'stripes', 'badge', 'sky', 'kick', 'Keep it rolling!'),
  r('iris', 'confetti', 'polaroid', 'lav', 'musica', '{n} days!', 'Music to Pancho’s ears.'),
  r('right', 'sparkles', 'bubble', 'peach', 'hand', 'days in a row', 'That’s “nice one”.', { words: ['¡Bien ahí!'] }),
  r('doors', 'food', 'hero', 'sage', 'empanadas', '{n} days!', 'Fresh out of the oven.', { bits: ['empanada'] }),
  r('blinds', 'rings', 'medal', 'night', 'tango', 'Smooth!'),
  r('tilt', 'none', 'count', 'flame', 'asado', 'days in a row!'),
  r('drop', 'balloons', 'hero', 'sky', 'wave', 'Look who’s back!', 'Day {n}. Pancho missed you.', { bits: ['escarapela'] }),
  r('sun', 'burst', 'stamps', 'butter', 'gol', 'days in a row', undefined, { words: ['GOL', 'GOL', 'GOL!'] }),
  r('rise', 'ticker', 'badge', 'rosa', 'cafe', 'Same time tomorrow?', undefined, { words: ['RACHA'] }),
  r('fade', 'rain', 'polaroid', 'sage', 'sip', 'Day {n}.', 'Calm, steady, every day.'),
  r('left', 'none', 'bubble', 'lav', 'gaucho', 'days in a row', 'You’re a star!', { words: ['¡Sos un crack!'] }),
  r('iris', 'rays', 'hero', 'peach', 'alfajor', '{n} days!', 'Sweet, sweet streak.'),
  r('right', 'confetti', 'count', 'mint', 'kick', 'days in a row!'),
  r('blinds', 'food', 'stamps', 'butter', 'dulce', 'days in a row', undefined, { words: ['So', 'sweet!'], bits: ['caramelos'] }),
  r('doors', 'sparkles', 'medal', 'sky', 'flag', 'Proud of you!'),
  r('tilt', 'stripes', 'polaroid', 'rosa', 'choripan', 'Hot streak!', '{n} days, straight off the grill.'),
  r('drop', 'none', 'hero', 'night', 'musica', '{n} days!', 'You’ve got rhythm.'),
  r('sun', 'balloons', 'bubble', 'butter', 'wave', 'days in a row', 'That’s it!', { words: ['¡Eso!'], bits: ['caramelos'] }),
  r('rise', 'rings', 'count', 'lav', 'sip', 'days in a row!'),
  r('iris', 'ticker', 'hero', 'flame', 'gol', 'Unstoppable!', 'Day {n} and counting.', { words: ['DALE'] }),
  r('fade', 'food', 'polaroid', 'peach', 'facturas', 'Fresh batch!', 'Day {n}, warm from the oven.', { bits: ['facturas'] }),
  r('left', 'burst', 'stamps', 'sky', 'tango', 'days in a row', undefined, { words: ['Perfect', 'step!'] }),
  r('right', 'none', 'badge', 'sage', 'mate', 'Mate’s on me.'),
  r('blinds', 'confetti', 'bubble', 'rosa', 'hand', 'days in a row', 'Keep going!', { words: ['¡Dale que va!'] }),
  r('doors', 'rays', 'medal', 'butter', 'gaucho', 'Steady!'),
  r('tilt', 'sparkles', 'hero', 'mint', 'kick', '{n} days!', 'Right in the top corner.'),
  r('drop', 'food', 'count', 'sage', 'alfajor', 'days in a row!', undefined, { bits: ['alfajor'] }),
];

export const STREAK_DECK: StreakDesign[] = DECK.map((c, i) => ({ ...c, id: `day-${i + 1}` }));

/** The days that get their own screen, and what each is called. */
const MILESTONES: Record<number, [string, CheerRow]> = {
  3: ['Three days', r('iris', 'sparkles', 'stamps', 'butter', 'wave', 'days in a row', 'That’s how habits start.', { words: ['Three', 'days!'], more: ['confetti'] })],
  7: ['One week', r('sun', 'rays', 'count', 'flame', 'mate', 'days in a row!', 'A whole week.', { more: ['confetti'] })],
  14: ['Two weeks', r('doors', 'burst', 'polaroid', 'lav', 'musica', 'Two weeks!', '14 days. Frame this one.', { more: ['confetti'] })],
  21: ['Three weeks', r('blinds', 'rays', 'medal', 'sky', 'gaucho', 'Three weeks!', 'They say a habit takes 21 days.', { more: ['sparkles'] })],
  30: ['One month', r('rise', 'rays', 'stamps', 'rosa', 'mate', 'days in a row', 'A whole month of Spanish.', { words: ['One', 'month!'], more: ['confetti'] })],
  50: ['Fifty', r('sun', 'rays', 'count', 'sky', 'flag', 'days in a row!', '¡Cincuenta! Fifty!', { bits: ['escarapela'], more: ['balloons'] })],
  75: ['Seventy-five', r('doors', 'rings', 'bubble', 'night', 'tango', 'days in a row', 'What a level!', { words: ['¡Qué nivel!'], more: ['sparkles'] })],
  100: ['One hundred', r('iris', 'confetti', 'count', 'rosa', 'gol', 'days in a row!', '¡Cien! The whole stadium is up.', { words: ['CIEN'], more: ['ticker'] })],
  150: ['150', r('tilt', 'rays', 'polaroid', 'flame', 'asado', '150 days!', 'Asado’s on Pancho.', { bits: ['choripan'], more: ['food'] })],
  200: ['Two hundred', r('right', 'stripes', 'bubble', 'butter', 'wave', 'days in a row', 'All aboard!', { words: ['¡Doscientos!'], bits: ['colectivo'], more: ['balloons'] })],
  250: ['250', r('blinds', 'rays', 'medal', 'peach', 'facturas', 'Two-fifty!', 'Facturas for everyone.', { bits: ['facturas'], more: ['food'] })],
  300: ['Three hundred', r('fade', 'sparkles', 'stamps', 'night', 'musica', 'days in a row', 'Pancho wrote you a song.', { words: ['Three', 'hundred!'], more: ['rings'] })],
  365: ['One year', r('sun', 'rays', 'stamps', 'rosa', 'dulce', 'days in a row', '¡Feliz aniversario!', { words: ['ONE', 'YEAR!'], bits: ['cotillon', 'torta', 'caramelos'], more: ['balloons', 'confetti'] })],
  400: ['Four hundred', r('doors', 'rays', 'medal', 'lav', 'tango', 'Still dancing!', '400 days.', { more: ['sparkles'] })],
  500: ['Five hundred', r('tilt', 'burst', 'count', 'mint', 'gaucho', 'days in a row!', '¡Quinientos!', { words: ['500'], more: ['confetti', 'ticker'] })],
  600: ['600', r('iris', 'confetti', 'hero', 'sky', 'kick', '600 days!', 'Still scoring.', { more: ['stripes'] })],
  700: ['700', r('blinds', 'rays', 'medal', 'butter', 'cafe', 'Seven hundred!', 'A gaucho never quits.', { more: ['sparkles'] })],
  730: ['Two years', r('sun', 'rays', 'stamps', 'lav', 'dulce', 'days in a row', 'Two years of Spanish.', { words: ['TWO', 'YEARS!'], bits: ['cotillon', 'torta'], more: ['balloons', 'confetti'] })],
  1000: ['A thousand', r('iris', 'rays', 'medal', 'night', 'gol', '¡MIL!', 'A thousand days. Posta legend.', { bits: ['copa', 'escarapela'], more: ['burst', 'confetti', 'balloons'] })],
};

export const MILESTONE_DAYS = Object.keys(MILESTONES).map(Number);

/** The milestone screen for this day, if it is one. Past 1000 every year and every hundred days come round again. */
export function milestoneFor(n: number): StreakDesign | null {
  const own = MILESTONES[n];
  if (own) return { ...own[1], id: `ms-${n}`, milestone: own[0] };
  if (n > 1000 && n % 365 === 0) {
    const years = n / 365;
    return { ...MILESTONES[730][1], words: [String(years), 'YEARS!'], id: `ms-${n}`, milestone: `${years} years` };
  }
  if (n > 1000 && n % 100 === 0) return { ...MILESTONES[100][1], words: [String(n)], id: `ms-${n}`, milestone: String(n) };
  return null;
}

// The deal ------------------------------------------------------------------------

const KEY = 'streak.seen.v1';
/** Ids shown, oldest first. */
let seen: string[] = [];
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(KEY)
    .then((raw) => {
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      seen = [...ids.filter((id) => !seen.includes(id)), ...seen];
    })
    .catch(() => {});
}
load();

/** Today's screen: the milestone's own, or one off the deck she hasn't seen lately. */
export function dealStreak(n: number): StreakDesign {
  const ms = milestoneFor(n);
  if (ms) return ms;
  // Hold back all but the three seen longest ago, as the cheers do.
  const recent = new Set(seen.slice(-(STREAK_DECK.length - 3)));
  const fresh = STREAK_DECK.filter((c) => !recent.has(c.id));
  const pick = fresh[Math.floor(Math.random() * fresh.length)] ?? STREAK_DECK[0];
  seen = [...seen.filter((id) => id !== pick.id), pick.id].slice(-STREAK_DECK.length);
  AsyncStorage.setItem(KEY, JSON.stringify(seen)).catch(() => {});
  return pick;
}

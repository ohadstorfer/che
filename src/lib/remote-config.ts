import type { ImageSourcePropType } from 'react-native';

import { ART_SECTIONS, artFor } from '@/lib/culture-art';
import { deviceId } from '@/lib/funnel';
import type { Level, Why } from '@/lib/onboarding';
import { PANCHO_ART } from '@/lib/screen-art';
import { supabase } from '@/lib/supabase';
import { colors, pastel } from '@/lib/theme';
import { courseArt, packArt } from '@/lib/word-art';

// ---------------------------------------------------------------------------
// Onboarding and paywall knobs, changed from the dashboard with no app update
// (2026-11-19). Read once per app run with the anon key (no account yet).
//
// app_config keys:
//   · paywall          PaywallConfig: headline, plans shown, the close button and its 40% offer
//   · onboarding_skip  questions left out: any of name, why, struggle, goal
//   · experiments      splits for custom screens: { "bf": { "a": 50, "none": 50 } };
//                      a screen with audience { experiment: "bf", variant: "a" } shows
//                      only to "a" (a variant with no screens is the control)
//
// Any value can be an A/B test instead of a plain value:
//   { "experiment": "pw-hero", "variants": [
//       { "name": "a", "weight": 50, "value": { ... } },
//       { "name": "b", "weight": 50, "value": { ... } } ] }
// Each phone lands in one variant for good (hashed from its onboarding id),
// and the variant rides on every funnel_events row (props.ab) and is set on
// her PostHog person (exp_<name>). Our own split, not PostHog flags: PostHog's
// free plan counts every flag call, and the funnel lives in our own table.
//
// Custom screens (onboarding_screens table) are below: designed from the
// dashboard as blocks, shown at a slot of the flow, to whom and when you say.
// The shape and examples: supabase/onboarding-config-README.md.
// ---------------------------------------------------------------------------

export interface PaywallConfig {
  /** The three headline lines; the third is the pink sticker. */
  hero?: [string, string, string];
  /** Which plan is chosen when it opens. Default: year. */
  preselect?: 'year' | 'month';
  /** false hides the monthly plan. Default: shown. */
  show_monthly?: boolean;
  /** Seconds before the close button shows on the onboarding paywall. Default: 15 on the hard paywall (the user, 2026-11-19), 2.2 otherwise. */
  close_after_seconds?: number;
  /** The onboarding paywall's close button opens the one-time 40% offer (hard paywall included). Default: true. */
  close_offer?: boolean;
  /** Turning the offer down: back to the plans (default), or the free week as before. */
  offer_decline?: 'plans' | 'free_week';
  /** The trial timeline's three dots (today, reminder, charge day), as app colour names. */
  timeline_colors?: [string, string, string];
}

export const SKIPPABLE = ['name', 'why', 'struggle', 'goal'] as const;
export type Skippable = (typeof SKIPPABLE)[number];

type Experiment<T> = { experiment: string; variants: { name: string; weight?: number; value: T }[] };
const isExperiment = (v: unknown): v is Experiment<unknown> =>
  !!v && typeof v === 'object' && typeof (v as Experiment<unknown>).experiment === 'string' && Array.isArray((v as Experiment<unknown>).variants);

// --- which variant -------------------------------------------------------------

/** FNV-1a: the same phone and test give the same number, every run. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const assigned = new Map<string, string>();
const listeners = new Set<(experiment: string, variant: string) => void>();

/** Every test this phone is in, as "test:variant,…": for funnel_events. */
export const abTag = () => [...assigned].map(([e, v]) => `${e}:${v}`).join(',') || null;

/** Called once per test as she lands in it (onboarding sends it to PostHog). */
export function onAssigned(fn: (experiment: string, variant: string) => void) {
  listeners.add(fn);
  for (const [e, v] of assigned) fn(e, v);
  return () => void listeners.delete(fn);
}

/** A variant's share as a whole number: "50" and 0.5 both work (×1000, rounded). */
const share = (w: unknown) => {
  const n = w === undefined ? 1 : Number(w);
  return Number.isFinite(n) && n > 0 ? Math.max(1, Math.round(n * 1000)) : 0;
};

export async function pickVariant<T>(exp: Experiment<T>): Promise<{ name: string; value: T } | null> {
  const variants = exp.variants.filter((v) => v && typeof v === 'object' && typeof v.name === 'string' && share(v.weight) > 0);
  if (!variants.length) return null;
  const total = variants.reduce((n, v) => n + share(v.weight), 0);
  const id = await deviceId().catch(() => 'no-id');
  let at = hash(`${id}:${exp.experiment}`) % total;
  const chosen = variants.find((v) => (at -= share(v.weight)) < 0) ?? variants[0];
  if (!assigned.has(exp.experiment)) {
    assigned.set(exp.experiment, chosen.name);
    for (const fn of listeners) fn(exp.experiment, chosen.name);
  }
  return { name: chosen.name, value: chosen.value };
}

async function resolve<T>(value: unknown): Promise<T | undefined> {
  try {
    if (isExperiment(value)) return (await pickVariant(value as Experiment<T>))?.value;
    return value as T | undefined;
  } catch {
    return undefined;
  }
}

const own = (o: object, k: unknown): boolean => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const optStr = (v: unknown) => v === undefined || v === null || typeof v === 'string';
const optNum = (v: unknown) => v === undefined || (typeof v === 'number' && Number.isFinite(v));

// --- app_config ----------------------------------------------------------------

const KEYS = ['paywall', 'onboarding_skip', 'experiments'];
let configAsk: Promise<Map<string, unknown>> | null = null;

function loadConfig() {
  configAsk ??= (async () => {
    try {
      const { data } = await supabase.from('app_config').select('key, value').in('key', KEYS);
      return new Map((data ?? []).map((r) => [r.key as string, r.value as unknown]));
    } catch {
      return new Map<string, unknown>();
    }
  })();
  return configAsk;
}

export async function paywallConfig(): Promise<PaywallConfig> {
  const v = await resolve<Record<string, unknown>>((await loadConfig()).get('paywall'));
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  // Only well-formed values pass; anything else is the default.
  const out: PaywallConfig = {};
  if (Array.isArray(v.hero) && v.hero.length === 3 && v.hero.every(str)) out.hero = v.hero as PaywallConfig['hero'];
  if (v.preselect === 'year' || v.preselect === 'month') out.preselect = v.preselect;
  if (typeof v.show_monthly === 'boolean') out.show_monthly = v.show_monthly;
  if (typeof v.close_after_seconds === 'number' && Number.isFinite(v.close_after_seconds) && v.close_after_seconds >= 0)
    out.close_after_seconds = Math.min(v.close_after_seconds, 120);
  if (typeof v.close_offer === 'boolean') out.close_offer = v.close_offer;
  if (v.offer_decline === 'plans' || v.offer_decline === 'free_week') out.offer_decline = v.offer_decline;
  if (Array.isArray(v.timeline_colors) && v.timeline_colors.length === 3 && v.timeline_colors.every((c) => own(SCREEN_COLORS, c)))
    out.timeline_colors = v.timeline_colors as PaywallConfig['timeline_colors'];
  return out;
}

/** Asked as the app opens (welcome), so onboarding's first question already
 *  knows whether it is skipped. */
export function prefetchRemoteConfig() {
  void loadConfig().then((m) => {
    const v = m.get('onboarding_skip');
    if (Array.isArray(v)) skipNow = v.filter((x) => (SKIPPABLE as readonly string[]).includes(x)) as Skippable[];
  });
}
let skipNow: Skippable[] | null = null;
/** The skip list if it's already here and a plain list (not a test): for onboarding's first frame. */
export const peekSkip = () => skipNow ?? [];

export async function onboardingSkip(): Promise<Skippable[]> {
  // (A test needs the phone's id, so it resolves here, never in peekSkip.)
  const v = await resolve<string[]>((await loadConfig()).get('onboarding_skip'));
  return Array.isArray(v) ? (v.filter((s) => (SKIPPABLE as readonly string[]).includes(s)) as Skippable[]) : [];
}

// --- custom screens --------------------------------------------------------------

/** Where in the flow: before the class's opener, after the class (and its Day 1
 *  screens), or right before the paywall (after the loading beat). */
export type Slot = 'before_class' | 'after_class' | 'before_paywall';
export const SLOTS: Slot[] = ['before_class', 'after_class', 'before_paywall'];

/** The app's own colours, by name: the only ones a screen may use. */
export const SCREEN_COLORS = {
  oat: colors.bg,
  card: colors.card,
  rosa: colors.primary,
  butter: pastel.butter,
  peach: pastel.peach,
  sage: pastel.sage,
  lav: pastel.lav,
  sky: pastel.sky,
  flame: pastel.flame,
} as const;
export type ScreenColor = keyof typeof SCREEN_COLORS;
/** Text colours: ink (default), rosa, or the quieter muted brown. */
export type TextColor = 'ink' | 'rosa' | 'muted';

/** A picture we already have: a Pancho (screen-art.ts), a culture section's
 *  art, a word's picture (Argentine pack word by its Spanish, or a course word
 *  by lemma id), or, last, any URL. */
export type Picture = { pancho?: string; art?: { section: string; index?: number }; word?: string; lemma_id?: string; url?: string };

type TextStyle = { color?: TextColor; align?: 'center' | 'left' };

export type Block =
  | ({ type: 'kicker'; text: string } & TextStyle)
  | { type: 'headline'; small?: string; big: string; fill?: ScreenColor }
  | ({ type: 'title'; text: string } & TextStyle)
  | ({ type: 'text'; text: string } & TextStyle)
  | ({ type: 'image'; height?: number } & Picture)
  | { type: 'bullets'; items: string[]; bg?: ScreenColor }
  | { type: 'quote'; text: string; author?: string; stars?: number; bg?: ScreenColor }
  | { type: 'countdown'; until: string; label?: string; bg?: ScreenColor }
  | { type: 'sticker'; text: string; color?: ScreenColor; tilt?: number };

export interface ScreenContent {
  /** The page: one of SCREEN_COLORS. Default oat, the app's page. */
  bg?: ScreenColor;
  blocks: Block[];
  /** The main button. action "paywall" goes straight to the paywall, skipping the screens after it. */
  button?: { label?: string; action?: 'next' | 'paywall'; style?: 'primary' | 'secondary' };
  /** A quiet second link under the button that just moves on. */
  skip?: { label: string };
}

/** The picture for a block, or null when it names one we don't have. */
export function pictureOf(p: Picture): ImageSourcePropType | null {
  if (p.pancho !== undefined) return own(PANCHO_ART, p.pancho) ? PANCHO_ART[p.pancho] : null;
  if (p.art !== undefined) {
    const i = p.art?.index ?? 0;
    if (!p.art || !ART_SECTIONS.includes(p.art.section) || !Number.isInteger(i) || i < 0) return null;
    return artFor(p.art.section, i) ?? null;
  }
  // Never a key every object has ("constructor", "toString"): that's a function, not a picture.
  const plainKey = (k: unknown): k is string => typeof k === 'string' && !(k in Object.prototype);
  if (p.word !== undefined) return plainKey(p.word) ? (packArt(p.word) ?? null) : null;
  if (p.lemma_id !== undefined) return plainKey(p.lemma_id) ? (courseArt(p.lemma_id) ?? null) : null;
  if (p.url !== undefined) return typeof p.url === 'string' && /^https:\/\/\S+$/.test(p.url) ? { uri: p.url } : null;
  return null;
}

export interface ScreenRow {
  id: string;
  slot: Slot;
  position: number;
  audience: { levels?: Level[]; whys?: Why[]; experiment?: string; variant?: string } | null;
  starts_at: string | null;
  ends_at: string | null;
  content: ScreenContent;
}

let screensAsk: Promise<ScreenRow[]> | null = null;
let screensDone: ScreenRow[] | null = null;

/** Asked as onboarding opens; a slot reached before the answer shows nothing. */
export function prefetchScreens() {
  screensAsk ??= (async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_screens')
        .select('id, slot, position, audience, starts_at, ends_at, content')
        .eq('published', true)
        .order('position');
      if (error) throw error;
      return (data ?? []) as ScreenRow[];
    } catch (e) {
      console.warn('[remote-config] could not read onboarding_screens', e);
      return [];
    }
  })().then((rows) => (screensDone = rows));
  return screensAsk;
}

/** Whether a row is for her, now. Tests are resolved here, so only someone who
 *  reaches the slot is counted in one. */
export async function forHer(row: ScreenRow, who: { level?: Level; whys?: Why[] }, now = Date.now()): Promise<boolean> {
  if (row.starts_at && Date.parse(row.starts_at) > now) return false;
  if (row.ends_at && Date.parse(row.ends_at) <= now) return false;
  const a = row.audience ?? {};
  if (a.levels?.length && (!who.level || !a.levels.includes(who.level))) return false;
  if (a.whys?.length && !who.whys?.some((w) => a.whys!.includes(w))) return false;
  if (a.experiment && a.variant) {
    const splits = (await loadConfig()).get('experiments') as Record<string, Record<string, number>> | undefined;
    const split = splits?.[a.experiment];
    const picked = split
      ? await pickVariant({ experiment: a.experiment, variants: Object.entries(split).map(([name, weight]) => ({ name, weight, value: null })) })
      : null;
    if (picked?.name !== a.variant) return false;
  }
  return true;
}

/** The screens for a slot, checked, in order; [] if the answer isn't in yet. */
export async function screensFor(slot: Slot, who: { level?: Level; whys?: Why[] }): Promise<ScreenRow[]> {
  const safe = (r: ScreenRow) => {
    try {
      return !!r && r.slot === slot && validScreen(r) === null;
    } catch {
      return false;
    }
  };
  const out: ScreenRow[] = [];
  for (const r of (screensDone ?? []).filter(safe)) if (await forHer(r, who).catch(() => false)) out.push(r);
  return out;
}

/** What is wrong with a row, or null. The admin screen lists these. */
export function validScreen(r: ScreenRow): string | null {
  if (!r || typeof r !== 'object') return 'not a row';
  if (!SLOTS.includes(r.slot)) return `unknown slot "${r.slot}"`;
  if (r.starts_at && Number.isNaN(Date.parse(r.starts_at))) return 'starts_at is not a date';
  if (r.ends_at && Number.isNaN(Date.parse(r.ends_at))) return 'ends_at is not a date';
  const a = r.audience;
  if (a && (typeof a !== 'object' || Array.isArray(a))) return 'audience must be an object';
  if (a?.levels && !(Array.isArray(a.levels) && a.levels.every(str))) return 'audience.levels must be a list of levels';
  if (a?.whys && !(Array.isArray(a.whys) && a.whys.every(str))) return 'audience.whys must be a list';
  const c = r.content;
  if (!c || typeof c !== 'object' || !Array.isArray(c.blocks) || !c.blocks.length) return 'content.blocks is empty';
  const colour = (v: unknown, what: string) =>
    v === undefined || own(SCREEN_COLORS, v) ? null : `${what}: "${String(v)}" is not one of ${Object.keys(SCREEN_COLORS).join(', ')}`;
  const textColour = (v: unknown, what: string) =>
    v === undefined || v === 'ink' || v === 'rosa' || v === 'muted' ? null : `${what}: color must be ink, rosa or muted`;
  const align = (v: unknown, what: string) => (v === undefined || v === 'center' || v === 'left' ? null : `${what}: align must be center or left`);
  const bad = colour(c.bg, 'bg');
  if (bad) return bad;
  if (c.button !== undefined) {
    if (!c.button || typeof c.button !== 'object') return 'button must be an object';
    if (c.button.action !== undefined && c.button.action !== 'next' && c.button.action !== 'paywall') return 'button.action must be next or paywall';
    if (c.button.style !== undefined && c.button.style !== 'primary' && c.button.style !== 'secondary') return 'button.style must be primary or secondary';
    if (!optStr(c.button.label)) return 'button.label must be text';
  }
  if (c.skip !== undefined && !(c.skip && typeof c.skip === 'object' && str(c.skip.label))) return 'skip needs a label';
  for (const [i, b] of c.blocks.entries()) {
    if (!b || typeof b !== 'object') return `block ${i + 1}: not a block`;
    const at = `block ${i + 1} (${typeof b.type === 'string' ? b.type : '?'})`;
    let err: string | null = null;
    switch (b.type) {
      case 'kicker':
      case 'title':
      case 'text':
        err = !str(b.text) ? `${at}: text must be text` : (textColour(b.color, at) ?? align(b.align, at));
        break;
      case 'sticker':
        err = !str(b.text) ? `${at}: text must be text` : !optNum(b.tilt) ? `${at}: tilt must be a number` : colour(b.color, at);
        break;
      case 'headline':
        err = !str(b.big) ? `${at}: big must be text` : !optStr(b.small) ? `${at}: small must be text` : colour(b.fill, at);
        break;
      case 'image':
        if (!optNum(b.height) || (b.height !== undefined && (b.height < 40 || b.height > 600))) err = `${at}: height must be 40–600`;
        else if (b.pancho === undefined && b.art === undefined && b.word === undefined && b.lemma_id === undefined && b.url === undefined)
          err = `${at}: needs pancho, art, word, lemma_id or url`;
        else if (!pictureOf(b))
          err =
            b.pancho !== undefined
              ? `${at}: no Pancho "${String(b.pancho)}" (have: ${Object.keys(PANCHO_ART).join(', ')})`
              : b.art !== undefined
                ? `${at}: art needs a section of ${ART_SECTIONS.join(', ')} and a whole index`
                : b.url !== undefined
                  ? `${at}: url must start with https://`
                  : `${at}: no picture in the app for that word`;
        break;
      case 'bullets':
        err = !(Array.isArray(b.items) && b.items.length && b.items.every(str)) ? `${at}: items must be a list of texts` : colour(b.bg, at);
        break;
      case 'quote':
        err = !str(b.text)
          ? `${at}: text must be text`
          : !optStr(b.author)
            ? `${at}: author must be text`
            : !optNum(b.stars)
              ? `${at}: stars must be a number`
              : colour(b.bg, at);
        break;
      case 'countdown':
        err =
          typeof b.until !== 'string' || Number.isNaN(Date.parse(b.until))
            ? `${at}: until is not a date`
            : !optStr(b.label)
              ? `${at}: label must be text`
              : colour(b.bg, at);
        break;
      default:
        err = `${at}: unknown type`;
    }
    if (err) return err;
  }
  return null;
}

/** For the admin preview: every row, drafts included (staff only by RLS). */
export async function fetchAllScreens(): Promise<(ScreenRow & { published: boolean })[]> {
  const { data, error } = await supabase
    .from('onboarding_screens')
    .select('id, slot, position, audience, starts_at, ends_at, content, published')
    .order('slot')
    .order('position');
  if (error) throw error;
  return (data ?? []) as (ScreenRow & { published: boolean })[];
}

export const forgetScreens = () => {
  screensAsk = null;
  screensDone = null;
};

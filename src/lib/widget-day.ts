import { localDateStr } from './dates';
import words from './widget-words.json';

// ---------------------------------------------------------------------------
// What the home screen widget shows at a given moment (docs/widgets-spec.md),
// for the Android widget, which is drawn from JS. The iOS widget has the same
// rules in Swift (targets/widget/Day.swift): change one, change the other.
// The streak rules mirror `streakStatus()` in streak.ts.
// ---------------------------------------------------------------------------

/** Her streak row as the app last saw it. */
export interface WidgetRow {
  count: number;
  /** YYYY-MM-DD on her phone's calendar, or null before her first round. */
  last: string | null;
  /** A run lost to a missed day, still recoverable today. */
  banked: number;
}

export interface WidgetWord {
  id: string;
  es: string;
  en: string;
  ex: string;
}

export type WidgetMoment =
  | 'word'
  | 'sideEye'
  | 'sad'
  | 'begging'
  | 'crying'
  | 'lastHour'
  | 'practiced'
  | 'frozen'
  | 'recovering'
  | 'fresh';

export interface WidgetDay {
  moment: WidgetMoment;
  /** The number on the chip. */
  count: number;
  /** The run shown struck through, when frozen or recovering. */
  lost?: number;
}

const DAY = 24 * 3600_000;

/** One word per calendar day, the same for everyone and the same as the iOS widget. */
export function wordOf(date = new Date()): WidgetWord {
  const list = words as WidgetWord[];
  // Calendar days since 2026-01-01, counted in UTC so a daylight-saving hour never moves it.
  const days = Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2026, 0, 1)) / DAY,
  );
  return list[((days % list.length) + list.length) % list.length];
}

export function widgetDay(row: WidgetRow | null, date = new Date()): WidgetDay {
  const hour = date.getHours();
  const quiet: WidgetDay = { moment: hour < 14 ? 'word' : 'fresh', count: 0 };
  if (!row?.last) return quiet;

  const today = localDateStr(date);
  const yesterday = localDateStr(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));

  if (row.last === today) {
    return row.banked > 0
      ? { moment: 'recovering', count: row.count, lost: row.banked }
      : { moment: 'practiced', count: row.count };
  }
  if (row.last !== yesterday) {
    return row.count > 0 ? { moment: 'frozen', count: 0, lost: row.count } : quiet;
  }
  const moment: WidgetMoment =
    hour < 14 ? 'word' : hour < 17 ? 'sideEye' : hour < 20 ? 'sad' : hour < 22 ? 'begging' : hour < 23 ? 'crying' : 'lastHour';
  return { moment, count: row.count };
}

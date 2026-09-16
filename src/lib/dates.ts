// The user's local date as YYYY-MM-DD. "Today" for streaks and daily sessions
// is always the device's local day.
export function localDateStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 3600_000);
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}

/**
 * The seven local dates of the week `d` falls in, Monday first — the week as it
 * is read in Spanish, so the strip in the header runs lunes to domingo.
 */
export function weekDates(d = new Date()): string[] {
  // getDay() is Sunday-first; shift it so Monday is 0.
  const offset = (d.getDay() + 6) % 7;
  // Walked by calendar day rather than in 24h steps: a DST change makes one of
  // those steps 23 or 25 hours long, and the week would skip or repeat a date.
  return Array.from({ length: 7 }, (_, i) =>
    localDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset + i)),
  );
}

/** Initials of the Spanish weekdays, Monday first — the strip's labels. */
export const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

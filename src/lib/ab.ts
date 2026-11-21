// ---------------------------------------------------------------------------
// Which A/B variant this phone landed in, for each test (lib/remote-config.ts
// picks them). Its own small module so funnel.ts can tag every row with it
// without importing remote-config, which imports funnel.ts back for the
// device id (a cycle, review 2026-11-20).
// ---------------------------------------------------------------------------

const assigned = new Map<string, string>();
const listeners = new Set<(experiment: string, variant: string) => void>();

/** Every test this phone is in, as "test:variant,…": for funnel_events. */
export const abTag = () => [...assigned].map(([e, v]) => `${e}:${v}`).join(',') || null;

/** Called once per test as she lands in it, and at once for the ones she is
 *  already in. The analytics tracker sends them to PostHog, app-wide, so a
 *  test that resolves on the paywall is counted too. */
export function onAssigned(fn: (experiment: string, variant: string) => void) {
  listeners.add(fn);
  for (const [e, v] of assigned) fn(e, v);
  return () => void listeners.delete(fn);
}

/** Records her variant the first time a test is resolved. */
export function noteAssigned(experiment: string, variant: string) {
  if (assigned.has(experiment)) return;
  assigned.set(experiment, variant);
  for (const fn of listeners) fn(experiment, variant);
}

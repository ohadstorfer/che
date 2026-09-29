import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Progress outside the course — finished culture classes, Argentine pack
// scores — kept in two places. The phone's copy answers every read at once;
// the side_progress table is what survives a reinstall or a new phone. The
// two meet once per session: whatever the server has that the phone lacks
// comes down, whatever the phone has that the server lacks (a save made
// offline, progress from before the table existed) goes up. After that, each
// save writes both.
// ---------------------------------------------------------------------------

export type SideKind = 'culture' | 'pack';

export interface SideEntry {
  /** Percent right on the first try, the best she has done. */
  best: number;
  last: number;
  plays: number;
  /** When she last finished it (ms since epoch). */
  at?: number;
}

export type SideEntries = Record<string, SideEntry>;

async function userId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

/** The fuller of two records of the same thing. */
function fuller(a: SideEntry | undefined, b: SideEntry | undefined): SideEntry {
  if (!a) return b!;
  if (!b) return a;
  const newer = (a.at ?? 0) >= (b.at ?? 0) ? a : b;
  return {
    best: Math.max(a.best, b.best),
    last: newer.last,
    plays: Math.max(a.plays, b.plays),
    at: newer.at,
  };
}

export function mergeEntries(a: SideEntries, b: SideEntries): SideEntries {
  const out: SideEntries = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = fuller(out[k], v);
  return out;
}

const ahead = (local: SideEntry, remote: SideEntry | undefined) =>
  !remote || local.best > remote.best || local.plays > remote.plays || (local.at ?? 0) > (remote.at ?? 0);

const toRow = (user: string, kind: SideKind, key: string, e: SideEntry) => ({
  user_id: user,
  kind,
  key,
  best: e.best,
  last: e.last,
  plays: e.plays,
  at: e.at ? new Date(e.at).toISOString() : null,
  updated_at: new Date().toISOString(),
});

/**
 * Where the phone keeps this progress: one key per account, so a second
 * account on the same phone starts clean. Progress saved before accounts had
 * their own key belongs to whoever opens it first, which is the person who
 * made it.
 */
export async function localKey(base: string): Promise<string> {
  const user = await userId();
  if (!user) return base;
  const own = `${base}:${user}`;
  try {
    const [mine, legacy] = await Promise.all([AsyncStorage.getItem(own), AsyncStorage.getItem(base)]);
    if (legacy != null) {
      if (mine == null) await AsyncStorage.setItem(own, legacy);
      await AsyncStorage.removeItem(base);
    }
  } catch {
    // Worst case the old progress stays where it was.
  }
  return own;
}

const synced = new Set<string>();

/**
 * Meets the server once per session. Returns the merged progress when it did,
 * null when there was nothing to do (signed out, already synced, offline).
 */
export async function syncSide(kind: SideKind, local: SideEntries): Promise<SideEntries | null> {
  const user = await userId();
  if (!user) return null;
  const tag = `${user}:${kind}`;
  if (synced.has(tag)) return null;
  synced.add(tag);

  const { data, error } = await supabase
    .from('side_progress')
    .select('key, best, last, plays, at')
    .eq('kind', kind);
  if (error || !data) {
    // Try again on the next read.
    synced.delete(tag);
    return null;
  }

  const remote: SideEntries = {};
  for (const r of data as { key: string; best: number; last: number; plays: number; at: string | null }[]) {
    remote[r.key] = { best: r.best, last: r.last, plays: r.plays, at: r.at ? Date.parse(r.at) : undefined };
  }

  const up = Object.entries(local)
    .filter(([k, e]) => ahead(e, remote[k]))
    .map(([k, e]) => toRow(user, kind, k, fuller(e, remote[k])));
  if (up.length) {
    const { error: upErr } = await supabase.from('side_progress').upsert(up, { onConflict: 'user_id,kind,key' });
    if (upErr) synced.delete(tag);
  }

  return mergeEntries(local, remote);
}

/** Saves one finished thing to the server; the phone already has it. */
export function pushSide(kind: SideKind, key: string, entry: SideEntry) {
  void (async () => {
    const user = await userId();
    if (!user) return;
    await supabase
      .from('side_progress')
      .upsert([toRow(user, kind, key, entry)], { onConflict: 'user_id,kind,key' });
    // A failed save is picked up by the next session's sync.
  })().catch(() => {});
}

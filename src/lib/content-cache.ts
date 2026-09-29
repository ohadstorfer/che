import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Published content, loaded once and kept on the phone.
//
// The course, the lexicon, the gloss tallies and the sentence blocks only
// change when content is published. Each is loaded through `stored`: from
// memory if this run already has it, else from the phone's copy if it is
// still current, else from the server — and then saved. What "current" means
// comes from one small call on opening, `content_version` (docs/
// content-on-device.md): a stamp per piece, so a fix to unit 40 refreshes
// unit 40's block and nothing else. When no version can be had (offline,
// signed out, the demo backend, an older server) the phone's copy is used as
// it is, and a fetch is kept for a while as it always was.
// ---------------------------------------------------------------------------

/** How long a fetch is kept when no version says whether it is current. */
const TTL_MS = 30 * 60 * 1000;
/** How long the version answer is kept: a publish reaches a long-open app
 *  within this plus the tallies job's five minutes. */
const VERSION_TTL_MS = 5 * 60 * 1000;
/** How long a refusal is kept — signed out, offline — so a screen that loads
 *  several pieces doesn't ask several times. */
const NO_VERSION_TTL_MS = 30 * 1000;
/** Bump when the shape of a stored row changes, so old files are skipped. */
export const CONTENT_FORMAT = 1;

export interface ContentVersion {
  lexicon: string;
  course: string;
  tallies: string | null;
  /** Per unit: `<published sentence count>:<last change>`. */
  units: Record<string, string>;
}

interface Entry {
  version: string | null;
  at: number;
  value: Promise<unknown>;
}

const memo = new Map<string, Entry>();
let version: { at: number; ttl: number; value: Promise<ContentVersion | null> } | null = null;

/** The server's stamps, or null when they can't be had. Shared for a while. */
export function contentVersion(): Promise<ContentVersion | null> {
  if (version && Date.now() - version.at < version.ttl) return version.value;
  const value = (async () => {
    try {
      const { data, error } = await supabase.rpc('content_version');
      if (error || !data || typeof data !== 'object') return null;
      const v = data as Partial<ContentVersion>;
      if (typeof v.lexicon !== 'string' || typeof v.course !== 'string' || !v.units) return null;
      return { lexicon: v.lexicon, course: v.course, tallies: v.tallies ?? null, units: v.units };
    } catch {
      return null;
    }
  })();
  const asked = { at: Date.now(), ttl: VERSION_TTL_MS, value };
  version = asked;
  // A miss is asked again soon, not in five minutes.
  value.then((v) => {
    if (v == null && version === asked) asked.ttl = NO_VERSION_TTL_MS;
  });
  return value;
}

/** A short stable key for a list of stamps — file names stay short. */
export function stampHash(parts: string[]): string {
  let h = 5381;
  const text = parts.join('\u0000');
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + text.length.toString(36);
}

// --- the phone's copy --------------------------------------------------------

export interface ContentDisk {
  read(name: string): Promise<string | null>;
  write(name: string, text: string): Promise<void>;
}

interface Stored {
  format: number;
  version: string;
  data: unknown;
}

let diskPromise: Promise<ContentDisk | null> | undefined;

/** Tests hand in a fake; the app finds the phone's storage by itself. */
export function setContentDisk(disk: ContentDisk | null) {
  diskPromise = Promise.resolve(disk);
}

function disk(): Promise<ContentDisk | null> {
  diskPromise ??= (async () => {
    // Only on the phones: the web has no file system to speak of, and node
    // (the tests) must never load the native module.
    if (typeof navigator === 'undefined' || navigator.product !== 'ReactNative') return null;
    try {
      const { Directory, File, Paths } = await import('expo-file-system');
      const dir = new Directory(Paths.document, 'content');
      if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
      const fileOf = (name: string) => new File(dir, `${name.replace(/[^\w.-]/g, '_')}.json`);
      return {
        read: async (name) => {
          const f = fileOf(name);
          return f.exists ? f.text() : null;
        },
        write: async (name, text) => {
          fileOf(name).write(text);
        },
      };
    } catch {
      return null;
    }
  })();
  return diskPromise;
}

async function readStored(name: string, version: string | null): Promise<{ data: unknown } | null> {
  try {
    const text = await (await disk())?.read(name);
    if (!text) return null;
    const parsed = JSON.parse(text) as Partial<Stored>;
    if (parsed.format !== CONTENT_FORMAT || typeof parsed.version !== 'string') return null;
    if (version != null && parsed.version !== version) return null;
    return { data: parsed.data };
  } catch {
    return null;
  }
}

function writeStored(name: string, version: string, data: unknown) {
  disk()
    .then((d) => d?.write(name, JSON.stringify({ format: CONTENT_FORMAT, version, data } satisfies Stored)))
    .catch(() => {});
}

/**
 * `name`'s content at `version`: from memory, the phone, or `fetch` — in that
 * order. `version` null means it couldn't be had; then whatever the phone
 * holds is used, and a fetch is kept for `TTL_MS`.
 */
export function stored<T>(name: string, version: string | null, fetch: () => Promise<T>): Promise<T> {
  const hit = memo.get(name);
  if (hit && (version != null ? hit.version === version : Date.now() - hit.at < TTL_MS)) {
    return hit.value as Promise<T>;
  }
  const value = (async () => {
    const onDisk = await readStored(name, version);
    if (onDisk) return onDisk.data as T;
    const data = await fetch();
    if (version != null) writeStored(name, version, data);
    return data;
  })();
  memo.set(name, { version, at: Date.now(), value });
  value.catch(() => {
    if (memo.get(name)?.value === value) memo.delete(name);
  });
  return value;
}

/** Loads through `stored`, versioned by `pick` of the server's stamps. */
export function versioned<T>(
  name: string,
  pick: (v: ContentVersion) => string | null,
  fetch: () => Promise<T>,
): Promise<T> {
  return contentVersion().then((v) => stored(name, v ? pick(v) : null, fetch));
}

/** The unversioned form, for anything the version call doesn't cover. */
export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  return stored(key, null, load);
}

/** Forget everything in memory — after staff edit content, so they see it at
 *  once. The phone's files stay; their versions no longer match, so they are
 *  passed over. */
export function clearContentCache() {
  memo.clear();
  version = null;
}

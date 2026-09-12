import { Platform } from 'react-native';
import { supabase } from './supabase';

// Recording is web-only for now (the PWA is the primary platform). Safari and
// Chrome both support MediaRecorder; Safari records audio/mp4 (AAC).
export const canRecord =
  Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== 'undefined';

export interface ActiveRecording {
  stop: () => Promise<{ blob: Blob; mime: string }>;
  cancel: () => void;
}

export async function startRecording(): Promise<ActiveRecording> {
  // The app pins its audio session to `playback` so her side keeps sounding
  // with the silent switch on. That is a promise to the browser that the page
  // only makes sound, and Safari holds it to it: the microphone is refused
  // until the page says it means to record too. Back to `playback` the moment
  // the recording ends.
  setAudioSession('play-and-record');
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    setAudioSession('playback');
    throw err;
  }
  const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']
    .find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
  recorder.start();

  const cleanup = () => {
    stream.getTracks().forEach((t) => t.stop());
    setAudioSession('playback');
  };

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          cleanup();
          const type = recorder.mimeType || 'audio/webm';
          resolve({ blob: new Blob(chunks, { type }), mime: type });
        };
        recorder.stop();
      }),
    cancel: () => {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {}
      cleanup();
    },
  };
}

/** Stores a recording in the `audio` bucket, under `cards/` or `sentences/`. */
export async function uploadAudio(
  id: string,
  blob: Blob,
  mime: string,
  folder: 'cards' | 'sentences' = 'cards',
): Promise<string> {
  const ext = mime.includes('mp4') ? 'm4a' : 'webm';
  const path = `${folder}/${id}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('audio').upload(path, blob, {
    contentType: mime,
    upsert: true,
    // Every recording gets its own timestamped name, so it never changes once
    // written and the browser can hold it for as long as it likes.
    cacheControl: '31536000',
  });
  if (error) throw error;
  return path;
}

// The bucket is public (migration 0011), so a clip's address is derived from
// its path with no request at all — no signing round trip before a download,
// and the URL is stable, which is what lets it be cached under its own name.
const publicRoot = supabase.storage.from('audio').getPublicUrl('').data.publicUrl;

export function getAudioUrl(path: string): string {
  return publicRoot + path.split('/').map(encodeURIComponent).join('/');
}

// ---------------------------------------------------------------------------
// Playback.
//
// Three things used to make a clip fail silently on an iPhone:
//
//  1. Every press built a fresh Audio element. Safari only lets an element
//     sound if it has been started from a real tap at least once, so a clip
//     that had to be signed or fetched first — the promise resolves after the
//     tap has ended — was refused, and the rejection was swallowed. Now one
//     element is unlocked by the first tap anywhere in the app and reused for
//     everything after, which is also what lets the listening exercise play
//     itself on arrival.
//  2. Warming a clip meant holding an <audio> per clip. iOS caps how many it
//     will keep, and past the cap the new ones quietly refuse to play. Clips
//     are now warmed as blobs, which nothing caps.
//  3. Nothing that went wrong reached the screen. Failures now come back
//     through `onEnd` with a reason.
// ---------------------------------------------------------------------------

/** Why a clip stopped. `undefined` means it played to the end. */
export type AudioFailure =
  | 'blocked' // the browser refused to start it without a tap
  | 'offline' // the phone could not reach storage
  | 'missing' // the recording is not there
  | 'failed'; // it arrived but would not decode or play

export type OnEnd = (reason?: AudioFailure) => void;

// --- the single unlocked element -------------------------------------------

const isWeb = Platform.OS === 'web';
const hasDom = isWeb && typeof document !== 'undefined';

let element: HTMLAudioElement | null = null;

function player(): HTMLAudioElement {
  if (!element) {
    element = new window.Audio();
    element.preload = 'auto';
    element.setAttribute('playsinline', 'true');
  }
  return element;
}

// A tenth of a second of silence. Playing it inside a tap is what marks the
// element as user-started; everything after that is allowed to play on its own.
const SILENCE =
  'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v///////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAYbjKmJIAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxDwDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxHiDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

let unlocked = false;

// The silent switch on the side of an iPhone mutes web audio outright, at any
// volume — which for an app whose whole point is hearing Spanish said out loud
// means it looks broken rather than muted. Declaring the page as `playback`
// puts it in the same category as a podcast or a video: it keeps sounding with
// the switch on. `play-and-record` is the same promise plus the microphone,
// and is what recording needs. Safari 16.4 and up; everywhere else the
// property is absent and there is nothing to declare.
function setAudioSession(type: 'playback' | 'play-and-record'): void {
  const session = (navigator as { audioSession?: { type: string } }).audioSession;
  if (session) session.type = type;
}

/**
 * Bless the element on the first touch of the session. Runs at most once, and
 * is harmless where it is not needed — desktop browsers allow playback anyway.
 */
function unlock(): void {
  if (unlocked) return;
  unlocked = true;
  setAudioSession('playback');
  const el = player();
  el.src = SILENCE;
  el.load();
  el.play()
    .then(() => el.pause())
    .catch(() => {
      // The tap was not one Safari counts. Let the next one try again.
      unlocked = false;
    });
}

if (hasDom) {
  const events = ['pointerdown', 'touchend', 'keydown'] as const;
  const once = () => {
    unlock();
    if (unlocked) for (const e of events) document.removeEventListener(e, once, true);
  };
  for (const e of events) document.addEventListener(e, once, true);

  // Coming back from the lock screen or another app can leave the audio
  // session dead. Touching the element again wakes it.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !unlocked) return;
    setAudioSession('playback');
    if (element && element.paused) element.load();
  });
}

// --- warmed clips -----------------------------------------------------------
//
// A press should not wait on the network, so clips are pulled down ahead of
// it. Blobs, not <audio> elements: an object URL costs nothing to hold and
// there is no limit on how many can exist.
//
// Two layers, because an app kept on the home screen is not a tab that stays
// open. iOS discards a standalone web app within a minute or two of leaving
// it, so every visit starts from a fresh page with nothing in memory. The
// clips therefore also go into the Cache API, which survives that — the same
// recording is downloaded once, ever, and every visit after the first plays it
// off the phone with no network at all.

const CLIP_LIMIT = 48; // decoded and ready in memory — a whole lesson fits
const STORE_LIMIT = 300; // kept on disk between visits
const STORE = 'che-audio-v1';

/** A same-origin key for a clip, so the store is addressed by the path the card
 *  holds rather than by a storage URL that may move. */
const keyFor = (path: string) => `/clip/${encodeURIComponent(path)}`;

const canStore = isWeb && typeof caches !== 'undefined';

/** path -> object URL, in insertion order so the oldest can be let go. */
const clips = new Map<string, string>();
const loading = new Map<string, Promise<string | null>>();

function remember(path: string, blob: Blob): string {
  const url = URL.createObjectURL(blob);
  clips.set(path, url);
  for (const old of clips.keys()) {
    if (clips.size <= CLIP_LIMIT) break;
    if (old === path || old === playingPath) continue;
    URL.revokeObjectURL(clips.get(old)!);
    clips.delete(old);
  }
  return url;
}

/** Why the last attempt at a clip came to nothing, kept for the button to show. */
const reasons = new Map<string, AudioFailure>();

function fail(path: string, reason: AudioFailure): null {
  reasons.set(path, reason);
  return null;
}

let sincePrune = 0;

/** Drop the oldest recordings once the store has grown past its cap. */
async function prune(cache: Cache): Promise<void> {
  const keys = await cache.keys();
  for (const key of keys.slice(0, keys.length - STORE_LIMIT)) await cache.delete(key);
}

// Warming a lesson asks for a dozen clips at once. Left unchecked they all
// share the same thin connection, and the one she is about to hear arrives no
// sooner than the one twenty exercises away. Four at a time, in the order they
// were asked for — which is nearest first — gets the near ones down first. A
// clip she has actually pressed skips the line entirely.
const MAX_PARALLEL = 4;
let active = 0;
const queued: (() => void)[] = [];

function takeSlot(): Promise<void> {
  if (active < MAX_PARALLEL) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise((go) =>
    queued.push(() => {
      active += 1;
      go();
    }),
  );
}

function freeSlot(): void {
  active -= 1;
  queued.shift()?.();
}

/** The clip, ready to hand to the element. Fetches it if this is the first ask. */
function clipUrl(path: string, urgent = false): Promise<string | null> {
  const have = clips.get(path);
  if (have) return Promise.resolve(have);
  reasons.delete(path);
  const running = loading.get(path);
  if (running) return running;

  // Only a fetch that actually queued gives its place back — a clip already in
  // the store never took one.
  let held = false;
  const job = (async () => {
    // Off the web the player streams the URL itself.
    if (!isWeb) return getAudioUrl(path);

    const cache = canStore ? await caches.open(STORE) : null;
    const stored = await cache?.match(keyFor(path));
    if (stored) return remember(path, await stored.blob());

    if (!urgent) {
      await takeSlot();
      held = true;
    }
    const res = await fetch(getAudioUrl(path)).catch(() => null);
    // No response at all is a phone with no signal; a response that is not OK
    // is a recording that is genuinely gone. She should be told which.
    if (!res) return fail(path, 'offline');
    if (!res.ok) return fail(path, 'missing');
    if (cache) {
      await cache.put(keyFor(path), res.clone());
      // Listing the store costs more than the write does, so it is only worth
      // checking once in a while — nothing breaks by being a few clips over.
      if (++sincePrune >= 25) {
        sincePrune = 0;
        void prune(cache);
      }
    }
    return remember(path, await res.blob());
  })()
    .catch(() => fail(path, 'failed'))
    .finally(() => {
      loading.delete(path);
      if (held) freeSlot();
    });

  loading.set(path, job);
  return job;
}

/** Fetch a clip ahead of the press. Resolves when it is ready to play — or when
 *  it is clear that it will not be, which is just as good for a caller waiting. */
export function preloadAudio(path: string | null | undefined): Promise<void> {
  if (!path) return Promise.resolve();
  const ready = clips.get(path);
  if (ready) return Promise.resolve();
  return clipUrl(path).then(() => undefined);
}

// --- playing ----------------------------------------------------------------

type Playing = { stop: () => void; onEnd?: OnEnd };

let current: Playing | null = null;
let playingPath: string | null = null;
/** Bumped by every play and stop, so a slow fetch knows it has been overtaken. */
let generation = 0;

/** Ends whatever is playing, telling its button that it stopped. */
export function stopAudio(): void {
  generation += 1;
  const playing = current;
  current = null;
  playingPath = null;
  playing?.stop();
  playing?.onEnd?.();
}

/**
 * Play a clip. `onEnd` fires when it finishes, is cut short by another clip,
 * or gives up — in that last case with the reason, so a button can say so
 * instead of going quiet.
 */
export function playAudio(path: string, onEnd?: OnEnd): void {
  stopAudio();
  const mine = generation;
  playingPath = path;

  const warm = clips.get(path);
  // A warmed clip starts inside the press itself, which is the fastest path
  // and the one Safari is happiest with.
  if (warm) return start(warm, onEnd);

  void clipUrl(path, true).then((url) => {
    if (generation !== mine) return; // something else took over while it loaded
    if (!url) {
      playingPath = null;
      const reason = reasons.get(path) ?? 'missing';
      console.warn('[audio]', reason, path);
      onEnd?.(reason);
      return;
    }
    start(url, onEnd);
  });
}

function start(url: string, onEnd?: OnEnd): void {
  if (isWeb) {
    const el = player();
    const entry: Playing = {
      onEnd,
      stop: () => {
        el.onended = null;
        el.onerror = null;
        el.pause();
      },
    };
    const done = (reason?: AudioFailure) => {
      if (current !== entry) return;
      if (reason) console.warn('[audio]', reason, url.slice(0, 40));
      current = null;
      playingPath = null;
      onEnd?.(reason);
    };
    el.onended = () => done();
    el.onerror = () => done('failed');
    current = entry;
    el.src = url;
    // Without this an element that has already finished once refuses to start
    // again — the old single-element version's bug.
    el.load();
    el.play().catch((err: unknown) => {
      const name = err && typeof err === 'object' ? (err as Error).name : '';
      if (name === 'NotAllowedError') unlocked = false; // let the next tap re-bless it
      done(name === 'NotAllowedError' ? 'blocked' : 'failed');
    });
    return;
  }

  void import('expo-audio').then(({ createAudioPlayer }) => {
    const p = createAudioPlayer(url);
    const entry: Playing = {
      onEnd,
      stop: () => {
        sub.remove();
        p.pause();
        p.remove();
      },
    };
    const sub = p.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish || current !== entry) return;
      current = null;
      playingPath = null;
      entry.stop();
      onEnd?.();
    });
    current = entry;
    p.play();
  });
}

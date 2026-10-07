import { AppState, Platform } from 'react-native';
import { supabase } from './supabase';

// Che ships as an iOS and Android app; the web build is a fallback. On the
// phones recording goes through expo-audio (AAC in an .m4a file). On the web,
// Safari and Chrome both support MediaRecorder; Safari records audio/mp4 (AAC).
export const canRecord =
  Platform.OS !== 'web' ||
  (typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined');

/**
 * A finished recording. The web hands back a Blob; the phones a file on disk,
 * which is also how it goes into an upload there.
 */
export interface RecordedClip {
  blob?: Blob;
  uri?: string;
  mime: string;
  size: number;
  /** Known only on the phones, from the mic level while recording: nothing near speech was heard. */
  quiet?: boolean;
}

export interface ActiveRecording {
  stop: () => Promise<RecordedClip>;
  cancel: () => void;
  /** How loud the mic is right now, 0–1. For the on-screen wave; 0 when it can't tell. */
  level: () => number;
}

/** A refused microphone, named the way the browser names it so callers check one thing. */
function micRefused(): Error {
  const e = new Error('Microphone permission denied');
  e.name = 'NotAllowedError';
  return e;
}

// Level of the mic as the phones report it, in dBFS. Speech at arm's length
// sits around -30 to -10; a quiet room around -50 and below.
const FLOOR_DB = -50;
const QUIET_DB = -48;
const toLevel = (db: number) => Math.max(0, Math.min(1, (db - FLOOR_DB) / 42));

// Everything a recording needs that doesn't depend on the tap, loaded once:
// the modules, and whether the mic is already allowed. A tap then goes straight
// to the audio session and the recorder.
type NativeKit = {
  audio: typeof import('expo-audio');
  AudioModule: typeof import('expo-audio/build/AudioModule').default;
  createRecordingOptions: typeof import('expo-audio/build/utils/options').createRecordingOptions;
  File: typeof import('expo-file-system').File;
};
let kit: Promise<NativeKit> | null = null;
let micAllowed = false;

function nativeKit(): Promise<NativeKit> {
  kit ??= Promise.all([
    import('expo-audio'),
    import('expo-audio/build/AudioModule'),
    import('expo-audio/build/utils/options'),
    import('expo-file-system'),
  ]).then(([audio, mod, options, fs]) => ({
    audio,
    AudioModule: mod.default,
    createRecordingOptions: options.createRecordingOptions,
    File: fs.File,
  }));
  return kit;
}

/**
 * Get the mic ready ahead of the tap, on a screen that will record: loads what
 * recording needs and learns whether the mic is allowed, without asking.
 */
export function warmMic(): void {
  if (Platform.OS === 'web') return;
  void nativeKit()
    .then(({ audio }) => audio.getRecordingPermissionsAsync())
    .then((perm) => {
      if (perm.granted) micAllowed = true;
      arm();
    })
    .catch(() => {});
}

type NativeRecorder = InstanceType<NativeKit['AudioModule']['AudioRecorder']>;

/** The audio session in recording mode and a recorder prepared on it: all that is left is to start. */
async function prepareRecorder(): Promise<NativeRecorder> {
  const { audio, AudioModule, createRecordingOptions } = await nativeKit();
  await setAudioSession('play-and-record', true);
  const recorder = new AudioModule.AudioRecorder(
    createRecordingOptions({
      ...audio.RecordingPresets.HIGH_QUALITY,
      numberOfChannels: 1,
      bitRate: 64000,
      isMeteringEnabled: true,
    }),
  );
  try {
    await recorder.prepareToRecordAsync();
  } catch (err) {
    recorder.release();
    throw err;
  }
  return recorder;
}

/** Let go of a recorder that never got used (or must not be), and the empty file it made. */
function discard(recorder: NativeRecorder): void {
  void (async () => {
    await recorder.stop().catch(() => {});
    const uri = recorder.uri;
    recorder.release();
    try {
      if (uri) new (await nativeKit()).File(uri).delete();
    } catch {}
  })();
}

// Switching the audio session and preparing a recorder take a few hundred
// milliseconds on a phone: started on the tap, her first word is lost. A screen
// where she is about to speak arms the mic instead, so the tap only has to
// start a recorder that is already waiting. Nothing is captured (and the
// phone's mic light stays off) until she taps.
let wantArmed = false;
let armed: { recorder: Promise<NativeRecorder | null>; watch: ReturnType<typeof setInterval> } | null = null;

function arm(): void {
  if (armed || !wantArmed || !micAllowed) return;
  const recorder = prepareRecorder().catch(() => null);
  // iOS starts a prepared recorder by itself when an interruption (a call,
  // an alarm) ends. Nothing records without her tap: catch it and start over.
  const watch = setInterval(() => {
    void recorder.then((r) => {
      if (!r || armed?.recorder !== recorder || !r.getStatus().isRecording) return;
      unarm();
      arm();
    });
  }, 1000);
  armed = { recorder, watch };
}

/** Drop the waiting recorder, if any. The session is left as it is. */
function unarm(): void {
  const a = armed;
  if (!a) return;
  armed = null;
  clearInterval(a.watch);
  void a.recorder.then((r) => r && discard(r));
}

/** The waiting recorder, handed over to the tap. */
function takeArmed(): Promise<NativeRecorder | null> {
  const a = armed;
  if (!a) return Promise.resolve(null);
  armed = null;
  clearInterval(a.watch);
  return a.recorder;
}

/**
 * It's her turn to speak: have a recorder waiting, so the mic opens the
 * instant she taps. Only once the mic is allowed — this never asks. Call
 * `disarmMic` when it stops being her turn or the screen goes away.
 */
export function armMic(): void {
  if (Platform.OS === 'web') return;
  wantArmed = true;
  arm();
}

export function disarmMic(): void {
  if (Platform.OS === 'web' || !wantArmed) return;
  wantArmed = false;
  if (armed) void setAudioSession('playback');
}

// A recorder left waiting while the app is away could be started by the
// system, or hold the audio session other apps want: armed only in front.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') arm();
    else if (armed) void setAudioSession('playback');
  });
}

/** The slow way, on the tap itself: nothing was waiting (first use, or she cut in while Pancho spoke). */
async function freshRecording(audio: NativeKit['audio']): Promise<NativeRecorder> {
  if (!micAllowed) {
    const perm = await audio.requestRecordingPermissionsAsync();
    if (!perm.granted) throw micRefused();
    micAllowed = true;
  }
  let recorder: NativeRecorder;
  try {
    recorder = await prepareRecorder();
    recorder.record();
  } catch (err) {
    await setAudioSession('playback');
    // Maybe the mic was taken away in Settings: ask again next time.
    micAllowed = false;
    throw err;
  }
  return recorder;
}

async function startNativeRecording(): Promise<ActiveRecording> {
  // Taken inside the tap, before anything else can let it go.
  const taken = takeArmed();
  const { audio, File } = await nativeKit();

  let waiting = await taken;
  if (waiting) {
    // Waiting since before the tap: this is the whole cost of starting.
    try {
      if (waiting.getStatus().isRecording) throw new Error('already recording');
      waiting.record();
      if (!waiting.getStatus().isRecording) throw new Error('did not start');
    } catch {
      discard(waiting);
      waiting = null;
    }
  }
  const recorder = waiting ?? (await freshRecording(audio));

  // The loudest moment so far, sampled on our own clock so the quiet check
  // doesn't depend on anyone drawing the wave.
  let peak = -160;
  const read = () => {
    const db = recorder.getStatus().metering;
    if (typeof db === 'number') peak = Math.max(peak, db);
    return db;
  };
  const sampler = setInterval(read, 100);

  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    clearInterval(sampler);
    await recorder.stop().catch(() => {});
    const uri = recorder.uri;
    recorder.release();
    // Her turn again already (a cancelled recording): stay ready for the next tap.
    if (wantArmed) arm();
    else await setAudioSession('playback');
    return uri;
  };

  return {
    stop: async () => {
      const uri = await close();
      if (!uri) return { mime: 'audio/mp4', size: 0 };
      let size = 0;
      try {
        size = new File(uri).size ?? 0;
      } catch {}
      return { uri, mime: 'audio/mp4', size, quiet: peak > -160 && peak < QUIET_DB };
    },
    cancel: () => {
      void close().then((uri) => {
        try {
          if (uri) new File(uri).delete();
        } catch {}
      });
    },
    level: () => {
      if (closed) return 0;
      const db = read();
      return typeof db === 'number' ? toLevel(db) : 0;
    },
  };
}

export async function startRecording(): Promise<ActiveRecording> {
  if (Platform.OS !== 'web') return startNativeRecording();
  // The app pins its audio session to `playback` so her side keeps sounding
  // with the silent switch on. That is a promise to the browser that the page
  // only makes sound, and Safari holds it to it: the microphone is refused
  // until the page says it means to record too. Back to `playback` the moment
  // the recording ends.
  void setAudioSession('play-and-record');
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    void setAudioSession('playback');
    throw err;
  }
  // WebM first: Chrome also offers audio/mp4 now, but its MP4 recorder can hand
  // back an empty blob. Safari has no WebM recorder and falls through to MP4.
  const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
    .find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
  const track = stream.getAudioTracks()[0];
  const describe = () =>
    track ? `"${track.label}" ${track.readyState}${track.muted ? ' muted' : ''}${track.enabled ? '' : ' disabled'}` : 'no track';
  console.info(`[audio] mic start: ${describe()}, ${mime || 'default type'}`);
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  recorder.onerror = (e) => console.warn('[audio] recorder error', e);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
  // Timesliced, so the audio arrives while she speaks rather than all at stop.
  recorder.start(250);

  // Loudness for the wave. Best effort: without an AudioContext there's no
  // wave, and the recording itself doesn't care.
  let meter: { ctx: AudioContext; analyser: AnalyserNode; buf: Float32Array<ArrayBuffer> } | null = null;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    void ctx.resume().catch(() => {});
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    meter = { ctx, analyser, buf: new Float32Array(analyser.fftSize) };
  } catch {}

  const cleanup = () => {
    void meter?.ctx.close().catch(() => {});
    meter = null;
    stream.getTracks().forEach((t) => t.stop());
    void setAudioSession('playback');
  };

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          console.info(`[audio] mic stop: ${describe()}, ${chunks.length} chunks`);
          cleanup();
          const type = recorder.mimeType || 'audio/webm';
          const blob = new Blob(chunks, { type });
          resolve({ blob, mime: type, size: blob.size });
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
    level: () => {
      if (!meter) return 0;
      meter.analyser.getFloatTimeDomainData(meter.buf);
      let sum = 0;
      for (const v of meter.buf) sum += v * v;
      // RMS of speech sits around 0.02–0.2; the square root spreads it over the bar.
      return Math.min(1, Math.sqrt(Math.sqrt(sum / meter.buf.length)) * 2.2);
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
//
// The phones get the same two modes through expo-audio. Recording mode puts
// Bluetooth headphones on their low-quality call profile, so it's only on
// while the mic is open or armed (armMic), never while Pancho speaks.
export async function setAudioSession(type: 'playback' | 'play-and-record', keepArmed = false): Promise<void> {
  if (!isWeb) {
    // Leaving recording mode disables a waiting recorder: let it go first.
    if (type === 'playback' && !keepArmed) unarm();
    const { setAudioModeAsync } = await import('expo-audio');
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: type === 'play-and-record' }).catch(() => {});
    return;
  }
  const session = (navigator as { audioSession?: { type: string } }).audioSession;
  if (session) session.type = type;
}

// Sound even with the silent switch on, from the first clip.
if (!isWeb) void setAudioSession('playback');

/**
 * Bless the element on the first touch of the session. Runs at most once, and
 * is harmless where it is not needed — desktop browsers allow playback anyway.
 */
function unlock(): void {
  if (unlocked) return;
  unlocked = true;
  void setAudioSession('playback');
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
    void setAudioSession('playback');
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

// On the phones clips are saved to the cache directory the first time they
// are fetched, so a word she hears twenty times is downloaded once, a lesson's
// clips are on the device before she presses them, and they play offline.
// Clip paths never change content, so the path is the key. The OS may clear
// the directory under storage pressure; a missing file is simply fetched again.
/** path -> file uri, for the clips already on the phone. */
const onDevice = new Map<string, string>();

async function nativeClip(path: string): Promise<string> {
  const { Directory, File, Paths } = await import('expo-file-system');
  const dir = new Directory(Paths.cache, 'clips');
  const file = new File(dir, path.replace(/[^\w.-]/g, '_'));
  if (file.exists) {
    onDevice.set(path, file.uri);
    return file.uri;
  }
  try {
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    // Into a temporary name first, so a cut-off download never passes for a clip.
    const part = new File(dir, `${file.name}.part`);
    const got = await File.downloadFileAsync(getAudioUrl(path), part, { idempotent: true });
    got.move(file);
    onDevice.set(path, file.uri);
    return file.uri;
  } catch {
    // Could not save it: let the player stream it, as it always could.
    return getAudioUrl(path);
  }
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
    if (!isWeb) {
      if (!urgent) {
        await takeSlot();
        held = true;
      }
      return nativeClip(path);
    }

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

/** A clip that is already here (warmed in memory, or saved on the phone), ready to play with no wait. */
export function readyClip(path: string | null | undefined): string | null {
  if (!path) return null;
  return clips.get(path) ?? onDevice.get(path) ?? null;
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
      if (current !== entry) return;
      // A clip that fails to load never finishes, so without this its button
      // would stay on "playing" and the player would never be let go.
      const failed = !!(status as { error?: string | null }).error || status.playbackState === 'failed';
      if (!status.didJustFinish && !failed) return;
      current = null;
      playingPath = null;
      entry.stop();
      onEnd?.(failed ? 'failed' : undefined);
    });
    current = entry;
    p.play();
  });
}

import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { type RecordedClip, setAudioSession, stopAudio } from './audio';

// ---------------------------------------------------------------------------
// Pancho's voice (docs/hablar-hld.md §4.8).
//
// A reply arrives as one base64 mp3 per sentence, in order, while the text is
// still streaming. Each plays as soon as it lands and the one before it has
// finished, on ONE player: an HTMLAudioElement blessed inside a tap (Empezar,
// Enviar) on the web, one expo-audio player on the phones, where each sentence
// is written to a cache file first.
//
// 🐢 uses the same player at 0.75 with the pitch kept, fed either with the
// sentences already held in memory (joined into one file) or the stored file.
// The AudioContext is only used to measure a web recording (checkClip).
// ---------------------------------------------------------------------------

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (!isWeb) return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

// A tenth of a second of silence as a WAV, for blessing the slow-replay
// element inside a tap so it may play later without one.
function silentWav(): string {
  const rate = 8000;
  const samples = 800;
  const bytes = new Uint8Array(44 + samples * 2);
  const view = new DataView(bytes.buffer);
  const str = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  str(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, 'data');
  view.setUint32(40, samples * 2, true);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `data:audio/wav;base64,${btoa(bin)}`;
}

let slowEl: HTMLAudioElement | null = null;
let silence: string | null = null;

/**
 * Call from inside a tap, before anything async: declares the page as
 * `playback` (keeps sounding with the silent switch on), wakes the context,
 * and blesses the slow-replay element.
 */
export function prime(): void {
  void setAudioSession('playback');
  if (!isWeb) return;
  const el = voice();
  if (el.paused && silence) {
    el.src = silence;
    el.play().then(() => el.pause()).catch(() => {});
  }
}

// --- what is playing, for the ▶ / 🐢 buttons ------------------------------------

export type NowPlaying = { key: string; slow: boolean } | null;
let now: NowPlaying = null;
const listeners = new Set<() => void>();

function setNow(n: NowPlaying) {
  now = n;
  listeners.forEach((l) => l());
}

export const nowPlaying = (): NowPlaying => now;

export function usePlaying(): NowPlaying {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => now,
    () => null,
  );
}

// --- clips: one per message, filled by the stream or by a URL ----------------
//
// Everything plays through ONE HTMLAudioElement, a sentence at a time. An
// AudioContext was tried first and could sound into nothing in Chrome on macOS:
// it stays on the output device it was created with, while an element follows
// the current one. The element is blessed inside a tap (prime), and reusing it
// keeps it allowed to play on iOS.

interface Clip {
  /** mp3 per seq; `null` means that sentence failed and is skipped. */
  bytes: Map<number, Uint8Array | null>;
  /** Next seq to play. */
  next: number;
  /** A sentence of this clip is on the element right now. */
  playing: boolean;
  /** The stream has sent `done`: no more sentences will come. */
  complete: boolean;
}

const clips = new Map<string, Clip>();

function clipFor(key: string): Clip {
  let c = clips.get(key);
  if (!c) {
    c = { bytes: new Map(), next: 0, playing: false, complete: false };
    clips.set(key, c);
  }
  return c;
}

export function hasClip(key: string): boolean {
  const c = clips.get(key);
  return !!c && [...c.bytes.values()].some(Boolean);
}

// --- one player, either platform ----------------------------------------------

type NativePlayer = import('expo-audio').AudioPlayer;
let nativePlayer: NativePlayer | null = null;
/** What to call when the native player reaches the end of the current source. */
let nativeEnded: (() => void) | null = null;
let fileSeq = 0;

async function native(): Promise<NativePlayer> {
  if (!nativePlayer) {
    const { createAudioPlayer } = await import('expo-audio');
    const p = createAudioPlayer(null, { updateInterval: 250 });
    p.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish) return;
      const fn = nativeEnded;
      nativeEnded = null;
      fn?.();
    });
    nativePlayer = p;
  }
  return nativePlayer;
}

/** mp3 bytes → something the player can open, and how to let it go afterwards. */
async function sourceOf(parts: Uint8Array[]): Promise<{ url: string; release: () => void }> {
  if (isWeb) {
    const url = URL.createObjectURL(new Blob(parts as BlobPart[], { type: 'audio/mpeg' }));
    return { url, release: () => URL.revokeObjectURL(url) };
  }
  const { File, Paths } = await import('expo-file-system');
  const joined = parts.length === 1 ? parts[0] : concat(parts);
  const file = new File(Paths.cache, `tomas-${Date.now()}-${fileSeq++}.mp3`);
  file.write(joined);
  return {
    url: file.uri,
    release: () => {
      try {
        file.delete();
      } catch {}
    },
  };
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Start `url` at `rate`; `onEnd` runs once when it finishes or can't play. */
async function startOn(url: string, rate: number, onEnd: () => void): Promise<void> {
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    onEnd();
  };
  if (isWeb) {
    const el = voice();
    el.onended = end;
    el.onerror = end;
    el.src = url;
    el.playbackRate = rate;
    (el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    await el.play().catch(end);
    // Some browsers reset the rate on a new source; set it again once it runs.
    el.playbackRate = rate;
    return;
  }
  const p = await native();
  nativeEnded = end;
  try {
    p.replace({ uri: url });
    p.shouldCorrectPitch = true;
    p.setPlaybackRate(rate, 'high');
    p.play();
  } catch {
    nativeEnded = null;
    end();
  }
}

/** Silence the player without firing its end handler. */
function halt() {
  if (slowEl) {
    slowEl.onended = null;
    slowEl.onerror = null;
    slowEl.pause();
  }
  if (nativePlayer) {
    nativeEnded = null;
    nativePlayer.pause();
  }
}

function voice(): HTMLAudioElement {
  if (!slowEl) {
    slowEl = new window.Audio();
    slowEl.setAttribute('playsinline', 'true');
    silence = silentWav();
  }
  return slowEl;
}

/** Play the clip's next sentence if the element is free and it has arrived. */
function pump(key: string) {
  const clip = clips.get(key);
  if (!clip || clip.playing || now?.key !== key || now.slow) return;
  while (clip.bytes.has(clip.next) && clip.bytes.get(clip.next) === null) clip.next += 1;
  const bytes = clip.bytes.get(clip.next);
  if (!bytes) return maybeFinished(key, clip);
  clip.next += 1;
  clip.playing = true;
  void sourceOf([bytes]).then(({ url, release }) => {
    // Overtaken while the file was written: stopAll already let this clip go.
    if (!clip.playing || now?.key !== key) return release();
    void startOn(url, 1, () => {
      release();
      clip.playing = false;
      pump(key);
    });
  });
}

function maybeFinished(key: string, clip: Clip) {
  if (now?.key !== key || now.slow || clip.playing) return;
  if (!clip.complete || clip.bytes.has(clip.next)) return; // more coming, or arrived but not played
  setNow(null);
  onIdle?.();
}

/** Called once a reply's audio has fully drained (used to leave after the goodbye). */
let onIdle: (() => void) | null = null;
export function whenIdle(fn: (() => void) | null) {
  onIdle = fn;
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** A reply is about to stream: stop anything else and play its sentences as they land. */
export function streamStart(key: string): void {
  stopAll();
  clips.delete(key); // a retry replays the whole turn
  clipFor(key);
  setNow({ key, slow: false });
}

export function streamChunk(key: string, seq: number, mp3Base64: string): void {
  if (!mp3Base64) return;
  const clip = clipFor(key);
  try {
    clip.bytes.set(seq, b64ToBytes(mp3Base64));
  } catch {
    clip.bytes.set(seq, null);
  }
  pump(key);
}

/** A sentence whose TTS failed: skip its slot so the ones after it still play. */
export function streamSkip(key: string, seq: number): void {
  const clip = clips.get(key);
  if (!clip || clip.bytes.has(seq)) return;
  clip.bytes.set(seq, null);
  pump(key);
}

export function streamEnd(key: string): void {
  const clip = clips.get(key);
  if (!clip) return;
  clip.complete = true;
  pump(key);
  maybeFinished(key, clip);
}

/** Stop and skip whatever is playing. */
export function stopAll(): void {
  for (const clip of clips.values()) clip.playing = false;
  halt();
  stopAudio();
  if (now) setNow(null);
}

/**
 * ▶ Replay a message at normal speed. Uses the sentences held in memory when
 * there are any; otherwise fetches `source()` (a URL) and keeps its bytes.
 */
export async function play(key: string, source?: () => Promise<string | null>): Promise<boolean> {
  prime();
  stopAll();
  setNow({ key, slow: false });
  let clip = clips.get(key);
  if (!clip || !hasClip(key)) {
    const url = source ? await source().catch(() => null) : null;
    if (!url) return fail(key);
    if (!isWeb) {
      // The phone's player streams the file itself.
      if (now?.key !== key) return true;
      await startOn(url, 1, () => {
        if (now?.key === key && !now.slow) setNow(null);
      });
      return true;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) return fail(key);
      const raw = new Uint8Array(await res.arrayBuffer());
      clips.delete(key);
      clip = clipFor(key);
      clip.bytes.set(0, raw);
    } catch {
      return fail(key);
    }
    if (now?.key !== key) return true; // overtaken while loading
  }
  clip.next = 0;
  clip.complete = true;
  clip.playing = false;
  pump(key);
  return true;
}

function fail(key: string): false {
  if (now?.key === key) setNow(null);
  return false;
}

/** 🐢 Replay at 0.75, pitch kept. Prefers the bytes in memory; else `source()`. */
export async function playSlow(key: string, source?: () => Promise<string | null>): Promise<boolean> {
  prime();
  stopAll();
  setNow({ key, slow: true });
  const clip = clips.get(key);
  let url: string | null = null;
  let release = () => {};
  const parts = clip
    ? ([...clip.bytes.keys()].sort((a, b) => a - b).map((s) => clip.bytes.get(s)).filter(Boolean) as Uint8Array[])
    : [];
  if (parts.length) ({ url, release } = await sourceOf(parts));
  else if (source) url = await source().catch(() => null);
  if (!url) return fail(key);
  if (now?.key !== key || !now.slow) {
    release();
    return true;
  }
  await startOn(url, 0.75, () => {
    release();
    if (now?.key === key && now.slow) setNow(null);
  });
  return true;
}

// --- checking a recording before it is sent (§2.3 step 2) ---------------------

export type ClipCheck = 'ok' | 'short' | 'quiet';

/**
 * Too short (< 0.6 s) or too quiet → "No te escuché", and nothing is sent.
 * On the web it decodes the clip to measure it; if the browser can't decode
 * its own recording, falls back to the wall-clock length alone.
 */
export async function checkClip(clip: RecordedClip, elapsedMs: number): Promise<ClipCheck> {
  if (elapsedMs < 600) return 'short';
  // The phones measured the mic while it recorded.
  if (clip.quiet) return 'quiet';
  const c = context();
  if (!c || !clip.blob) return 'ok';
  try {
    const buf = await c.decodeAudioData(await clip.blob.arrayBuffer());
    if (buf.duration < 0.6) return 'short';
    const data = buf.getChannelData(0);
    const win = Math.max(1, Math.floor(buf.sampleRate * 0.05));
    let loudest = 0;
    for (let i = 0; i < data.length; i += win) {
      let sum = 0;
      const end = Math.min(data.length, i + win);
      for (let j = i; j < end; j++) sum += data[j] * data[j];
      loudest = Math.max(loudest, Math.sqrt(sum / (end - i)));
    }
    // Speech at arm's length peaks well above 0.02 RMS in its loudest 50 ms;
    // room noise with the phone on a table sits below 0.008.
    return loudest < 0.008 ? 'quiet' : 'ok';
  } catch {
    return 'ok';
  }
}

/** Longest turn she can record; the recorder stops itself here. */
export const MAX_RECORD_MS = 45_000;

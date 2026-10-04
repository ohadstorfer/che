import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoCrypto from 'expo-crypto';
import { fetch as expoFetch } from 'expo/fetch';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { getAudioUrl, type RecordedClip } from './audio';
import { cultureSections } from './culture';
import { localDateStr } from './dates';
import data from './hablar.json';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Hablar — the speaking tab (docs/hablar-hld.md). Every call to the five edge
// functions lives in this file, so when the backend contract moves only this
// file has to follow it. Screens never build a request body themselves.
//
// The server builds every prompt and owns the clock (§4.1): the client sends
// ids and learner audio, never prompt text, and its timer is display-only.
// ---------------------------------------------------------------------------

// --- bundled content ---------------------------------------------------------

export interface Phrase {
  es: string;
  en: string;
  /** Storage path in the public `audio` bucket, like course audio. */
  audio?: string | null;
}

export interface Goal {
  id: string;
  es: string;
  en: string;
}

/** The four levels a scenario is written at. Learners see the names, never the codes. */
export type Band = 'A1' | 'A2' | 'B1' | 'B2';
export const BANDS: Band[] = ['A1', 'A2', 'B1', 'B2'];
export const LEVEL_NAMES: Record<Band, string> = { A1: 'Beginner', A2: 'Intermediate', B1: 'Advanced', B2: 'Local' };
/** One line on how Pancho talks at each level — shown under the level picker. */
export const LEVEL_NOTES: Record<Band, string> = {
  A1: 'Short, simple sentences. Present tense only.',
  A2: 'Everyday talk. The past tense comes in.',
  B1: 'Natural speed, some lunfardo.',
  B2: 'Full speed. Idioms, lunfardo, opinions.',
};
export const isBand = (v: unknown): v is Band => BANDS.includes(v as Band);

/** 'A2.3' → 'A2'. Anything past B2 is B2; anything unknown is A1 (the server's bandOf). */
export function bandOf(cefr: string | null | undefined): Band {
  const b = String(cefr ?? '').slice(0, 2).toUpperCase();
  if (isBand(b)) return b;
  return b.startsWith('C') ? 'B2' : 'A1';
}

/** One level's take on a scenario, whole: setting and role already filled in. */
export interface ScenarioVersion {
  setting_es: string;
  setting_en: string;
  role_es: string;
  /** The same role in English — what the brief shows her. */
  role_en: string;
  goals: Goal[];
  key_phrases: Phrase[];
  opener: Phrase;
  keyterms: string[];
}

export interface Scenario {
  id: string;
  title_es: string;
  title_en: string;
  versions: Partial<Record<Band, ScenarioVersion>>;
}

interface HablarContent {
  scenarios: Scenario[];
  openers: {
    free: Record<string, Phrase[]>;
    culture: Record<string, Phrase & { keyterms?: string[] }>;
  };
}

const content = data as unknown as HablarContent;
export const scenarios: Scenario[] = content.scenarios ?? [];
export const findScenario = (id?: string | null) => scenarios.find((s) => s.id === id);

/** The levels a scenario is written at, easiest first. */
export const bandsOf = (s: Scenario): Band[] => BANDS.filter((b) => s.versions[b]);

/** The band closest to `want` that the scenario is written for; the easier one on a tie (the server's nearestBand). */
export function nearestBand(s: Scenario, want: Band): Band {
  const written = bandsOf(s);
  const d = (b: Band) => Math.abs(BANDS.indexOf(b) - BANDS.indexOf(want));
  return written.reduce((best, b) => (d(b) < d(best) ? b : best), written[0]);
}

/** A scenario at a level: that level's version, or the nearest one written. */
export function scenarioAt(s: Scenario, want: Band): ScenarioVersion & { band: Band } {
  const band = nearestBand(s, want);
  return { ...s.versions[band]!, band };
}

/**
 * A clip reference from the bundle or a function: a storage path in the public
 * `audio` bucket (resolved the way course audio is), or already a full URL.
 */
export function resolveAudio(ref?: string | null): string | null {
  if (!ref) return null;
  return /^https?:|^blob:|^data:/.test(ref) ? ref : getAudioUrl(ref);
}

// --- types on the wire ---------------------------------------------------------

/** 'unit': a unit's Speaking lesson on the road — its own scene, outside the day's one chat. */
export type HablarKind = 'scenario' | 'culture' | 'free' | 'unit';

export interface StartResult {
  session_id: string;
  kind?: HablarKind;
  topic_id?: string | null;
  level?: string;
  started_at?: string;
  limit_seconds?: number | null;
  key_words?: string[];
  /** A unit chat: its scene's title, and who Pancho plays in it. */
  title?: string | null;
  role_es?: string | null;
  /** null for a staff chat: no clock. */
  deadline_at: string | null;
  unlimited?: boolean;
  opener: { turn_id?: string; text: string; text_en: string; audio_url: string | null };
  key_phrases: { es: string; en: string; audio_url: string | null }[];
}

/** The feedback event on a learner turn (§3.2). */
export interface Feedback {
  has_error: boolean;
  /** What she is told. Missing on turns stored before it existed: read it with `verdictOf`. */
  verdict?: Verdict;
  severity?: 'none' | 'meaning' | 'target' | 'minor';
  corrected: string;
  /** Shape not pinned down yet; the diff is computed client-side from `text` vs `corrected`. */
  spans?: { from: string; to: string }[];
  why_en: string;
  better: string;
  /** Plain English for `better`. */
  better_en?: string;
}

/** A tick, the fix, the Argentine way to say it ("note"), or nothing (a garbled line). */
export type Verdict = 'correct' | 'error' | 'note' | 'unclear';
const VERDICTS: Verdict[] = ['correct', 'error', 'note', 'unclear'];

export const verdictOf = (fb: Pick<Feedback, 'has_error' | 'verdict'>): Verdict =>
  fb.has_error ? 'error' : fb.verdict ?? 'correct';

export type DiloStatus = 'ok' | 'almost' | 'again';

export interface HintResult {
  starter: string;
  full: string;
  full_en: string;
}

export interface SummaryCorrection {
  turn_id?: string;
  said: string;
  corrected: string;
  better?: string;
  why_en?: string;
  /** Pancho saying the corrected line, in the private `hablar` bucket (may be null). */
  audio_path?: string | null;
}

export interface HablarSummary {
  /** Lines she said. */
  turns?: number;
  corrections?: SummaryCorrection[];
  phrases?: { es: string; en?: string }[];
  went_well?: string | null;
  streak_credited?: boolean;
  /** A unit chat: its scene's title, and whether it finished its lesson on the road. */
  title?: string | null;
  lesson_done?: boolean;
  /** Filled client-side from `end`'s `streak` (first close only; a repeat returns null). */
  streak?: number;
  previous_streak?: number;
  xp?: number;
}

export interface DoneEvent {
  turn_id: string;
  /** Id of Pancho's stored turn row (used for 🔤). */
  tomas_turn_id?: string;
  /** Storage path of the joined reply mp3 in the `hablar` bucket (▶ / 🐢 after a reload). */
  audio_path?: string | null;
  wrap_up: boolean;
  /** Pancho closed the chat (his call, or wrap_up): go to the summary once this reply's audio has played. */
  ended: boolean;
  /** The server replayed a turn it had already answered. */
  replay?: boolean;
}

export interface ReplyHandlers {
  /** The line as the server stored it (speak only): it opens the stream. */
  onTranscript?: (text: string) => void;
  /** The verdict on her line, ahead of the full feedback: right or wrong, and the fixed line. */
  onCorrection?: (verdict: { has_error: boolean; verdict?: Verdict; corrected: string }) => void;
  onText: (seq: number, delta: string) => void;
  /** The rioplatense guard rewrote part of an already-shown sentence: replace `from` with `to`. */
  onTextFix: (seq: number, from: string, to: string) => void;
  onAudio: (seq: number, mp3Base64: string) => void;
  onFeedback: (fb: Feedback) => void;
  onDone: (done: DoneEvent) => void;
  /** stage 'claude' + retry → call reply again with the same turn_id; 'tts' / 'feedback' are soft. */
  onError: (err: { stage: string; retry: boolean; seq?: number }) => void;
}

/** A function answered with a non-2xx status. `body` is its parsed JSON, if any. */
export class HablarError extends Error {
  constructor(
    public status: number,
    public body: Record<string, unknown> | null,
  ) {
    super(`hablar ${status}`);
  }
}

// --- helpers -----------------------------------------------------------------

export function newTurnId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID ? c.randomUUID() : ExpoCrypto.randomUUID();
}

async function call<T>(name: string, body: Record<string, unknown> | FormData): Promise<T> {
  const { data: out, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const res = error.context as Response;
      const parsed = await res.json().catch(() => null);
      console.warn(`[hablar] ${name} ${res.status}`, parsed);
      throw new HablarError(res.status, parsed);
    }
    // No response at all (the request never got through): say why.
    const cause = (error as { context?: unknown }).context;
    console.warn(`[hablar] ${name} failed: ${error.name}: ${error.message}`, cause instanceof Error ? cause.message : cause);
    throw new HablarError(0, null);
  }
  return out as T;
}

// --- the five functions -------------------------------------------------------

/** §4.3. A second chat on the same local day comes back as `{ doneToday }`. */
export async function start(args: {
  kind: HablarKind;
  topic_id?: string | null;
  /** A unit chat: its Speaking lesson. */
  lesson_id?: string | null;
  level: Band;
}): Promise<StartResult | { doneToday: true; summaryId: string | null } | { paywall: true }> {
  try {
    const res = await call<StartResult>('hablar-start', {
      kind: args.kind,
      topic_id: args.topic_id ?? null,
      ...(args.lesson_id ? { lesson_id: args.lesson_id } : {}),
      level_override: args.level,
    });
    startCache.set(res.session_id, res);
    return res;
  } catch (e) {
    if (e instanceof HablarError && e.status === 409) {
      return { doneToday: true, summaryId: (e.body?.summary_id as string) ?? null };
    }
    // The free chats are used up (hablar-start checks the entitlement too).
    if (e instanceof HablarError && e.status === 402) return { paywall: true };
    throw e;
  }
}

/**
 * §4.4. An empty `text` means nothing usable was heard. For purpose=turn the
 * server's `status` is 'draft' | 'empty'; for dilo it's ok / almost / again.
 */
export async function transcribe(args: {
  clip: RecordedClip;
  session_id: string;
  turn_id: string;
  purpose: 'turn' | 'dilo';
  target?: string;
  paused_seconds?: number;
}): Promise<{ text: string; status?: DiloStatus | 'draft' | 'empty' }> {
  const { clip } = args;
  console.info(`[hablar] transcribe ${clip.size} bytes, ${clip.mime}`);
  if (!clip.size) return { text: '', status: 'empty' };
  const form = new FormData();
  await appendClip(form, clip, args.turn_id);
  form.append('session_id', args.session_id);
  form.append('turn_id', args.turn_id);
  form.append('purpose', args.purpose);
  if (args.target) form.append('target', args.target);
  if (args.paused_seconds) form.append('paused_seconds', String(args.paused_seconds));
  const res = await call<{ text?: string; status?: DiloStatus | 'draft' | 'empty' }>('hablar-transcribe', form);
  return { text: (res?.text ?? '').trim(), status: res?.status };
}

/** A typed line for Pancho: stored as the turn's draft, the same as a transcript. */
export async function sendTyped(args: {
  text: string;
  session_id: string;
  turn_id: string;
  paused_seconds?: number;
}): Promise<{ text: string }> {
  const form = new FormData();
  form.append('text', args.text);
  form.append('session_id', args.session_id);
  form.append('turn_id', args.turn_id);
  form.append('purpose', 'turn');
  if (args.paused_seconds) form.append('paused_seconds', String(args.paused_seconds));
  const res = await call<{ text?: string }>('hablar-transcribe', form);
  return { text: (res?.text ?? '').trim() };
}

/**
 * §4.5 — the streamed turn, for a line already stored (a draft from an older
 * build, or a retry after a dropped stream).
 */
export function reply(
  args: { session_id: string; turn_id: string; paused_seconds?: number },
  on: ReplyHandlers,
  signal?: AbortSignal,
): Promise<'streamed' | 'empty'> {
  return streamTurn(
    JSON.stringify({
      session_id: args.session_id,
      turn_id: args.turn_id,
      paused_seconds: args.paused_seconds ?? 0,
    }),
    on,
    signal,
  );
}

/**
 * Her line and Pancho's answer in one request: the recording (or what she
 * typed) goes straight to hablar-reply, which transcribes it, stores it and
 * answers on the same stream, opening with `transcript`. Resolves 'empty' when
 * nothing usable was heard. Safe to send again with the same turn_id: the
 * server neither transcribes nor answers twice.
 */
export async function speak(
  args: { clip?: RecordedClip; text?: string; session_id: string; turn_id: string; paused_seconds?: number },
  on: ReplyHandlers,
  signal?: AbortSignal,
): Promise<'streamed' | 'empty'> {
  const form = new FormData();
  if (args.clip) {
    const { clip } = args;
    console.info(`[hablar] speak ${clip.size} bytes, ${clip.mime}`);
    await appendClip(form, clip, args.turn_id);
  } else form.append('text', args.text ?? '');
  form.append('session_id', args.session_id);
  form.append('turn_id', args.turn_id);
  if (args.paused_seconds) form.append('paused_seconds', String(args.paused_seconds));
  return streamTurn(form, on, signal);
}

/** The recording as a multipart part, the way each platform's fetch can send it. */
async function appendClip(form: FormData, clip: RecordedClip, turnId: string) {
  const name = `${turnId}.${clip.mime.includes('mp4') ? 'm4a' : 'webm'}`;
  if (clip.blob) return form.append('audio', clip.blob, name);
  // The phones' fetch is expo/fetch (SDK 57 installs it globally), which
  // can't send React Native's { uri, name, type } part ("Unsupported
  // FormDataPart implementation"). It sends any part that has bytes().
  const { File } = await import('expo-file-system');
  const file = new File(clip.uri!);
  form.append('audio', { name, type: clip.mime, bytes: () => file.bytes() } as unknown as Blob);
}

const functionsBase = () => `${process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''}/functions/v1`;

/**
 * Boot an edge function ahead of the request that needs it: a cold one costs
 * a few hundred milliseconds the learner would otherwise wait through. A CORS
 * preflight is the cheapest request that starts the worker; nothing is read.
 */
export function warm(...names: ('hablar-start' | 'hablar-reply')[]): void {
  for (const name of names) {
    void fetch(`${functionsBase()}/${name}`, { method: 'OPTIONS' }).catch(() => {});
  }
}

/**
 * A plain POST whose body is read and split into SSE events by hand:
 * `functions.invoke` can't stream. Resolves when the stream closes; rejects on
 * a network failure or a non-2xx status. React Native's own fetch has no
 * readable body, so the phones use expo/fetch.
 */
async function streamTurn(body: string | FormData, on: ReplyHandlers, signal?: AbortSignal): Promise<'streamed' | 'empty'> {
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const { data: auth } = await supabase.auth.getSession();
  const token = auth.session?.access_token ?? anon;

  const streamingFetch = (Platform.OS === 'web' ? fetch : expoFetch) as typeof fetch;
  const res = await streamingFetch(`${functionsBase()}/hablar-reply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anon,
      // A form sets its own type, with the boundary.
      ...(typeof body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'text/event-stream',
    },
    body,
    signal,
  });
  if (!res.ok || !res.body) {
    throw new HablarError(res.status, await res.json().catch(() => null));
  }
  // Nothing usable was heard: a plain answer, not a stream.
  if ((res.headers.get('content-type') ?? '').includes('application/json')) {
    const out = (await res.json().catch(() => null)) as { status?: string } | null;
    if (out?.status === 'empty') return 'empty';
    throw new HablarError(res.status, out as Record<string, unknown> | null);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (event: string, raw: string) => {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(raw);
    } catch {
      return;
    }
    switch (event) {
      case 'transcript':
        on.onTranscript?.(String(payload.text ?? ''));
        break;
      case 'correction':
        on.onCorrection?.({
          has_error: payload.has_error === true,
          verdict: VERDICTS.find((v) => v === payload.verdict),
          corrected: String(payload.corrected ?? ''),
        });
        break;
      case 'text':
        on.onText(Number(payload.seq ?? 0), String(payload.delta ?? ''));
        break;
      case 'text_fix':
        on.onTextFix(Number(payload.seq ?? 0), String(payload.from ?? ''), String(payload.to ?? ''));
        break;
      case 'audio':
        on.onAudio(Number(payload.seq ?? 0), String(payload.mp3 ?? ''));
        break;
      case 'feedback':
        on.onFeedback(payload as unknown as Feedback);
        break;
      case 'done':
        on.onDone(payload as unknown as DoneEvent);
        break;
      case 'error':
        on.onError({
          stage: String(payload.stage ?? ''),
          retry: payload.retry === true,
          seq: typeof payload.seq === 'number' ? payload.seq : undefined,
        });
        break;
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    // Events end at a blank line; tolerate \r\n from proxies.
    buffer = buffer.replace(/\r\n/g, '\n');
    let cut: number;
    while ((cut = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      let event = 'message';
      const lines: string[] = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) lines.push(line.slice(5).replace(/^ /, ''));
      }
      if (lines.length) dispatch(event, lines.join('\n'));
    }
    if (done) break;
  }
  return 'streamed';
}

/** §4.7. Hints are capped at 3 per chat on the server. */
export function hint(session_id: string): Promise<HintResult> {
  return call<HintResult>('hablar-assist', { session_id, kind: 'hint' });
}

/** §4.7. English for one of Pancho's turns; cached on the server's turn row. */
export async function translate(session_id: string, turn_id: string): Promise<string> {
  const res = await call<{ en?: string; text_en?: string }>('hablar-assist', { session_id, kind: 'translate', turn_id });
  return res?.en ?? res?.text_en ?? '';
}

/** §4.7. Idempotent: calling it on a closed session returns the stored summary. */
export async function end(args: {
  session_id: string;
  reason: 'user' | 'time';
  paused_seconds?: number;
}): Promise<HablarSummary> {
  const res = await call<{ summary?: HablarSummary; streak?: { current_streak?: number; previous_streak?: number } | null }>('hablar-end', {
    session_id: args.session_id,
    reason: args.reason,
    paused_seconds: args.paused_seconds ?? 0,
  });
  const summary: HablarSummary = { ...(res?.summary ?? {}) };
  if (res?.streak?.current_streak) {
    summary.streak = res.streak.current_streak;
    summary.previous_streak = res.streak.previous_streak ?? 0;
  }
  summaryCache.set(args.session_id, summary);
  return summary;
}

// --- stored conversations (read straight from the tables; RLS: owner select) ---

export interface ConversationRow {
  id: string;
  local_date: string;
  kind: HablarKind;
  topic_id: string | null;
  level: string | null;
  started_at: string;
  ended_at: string | null;
  paused_seconds: number;
  hints_used: number;
  goals_done: string[];
  summary: HablarSummary | null;
  /** Staff chat: no clock, no daily limit. */
  unlimited: boolean;
  /** A unit chat: the scene it ran. */
  scenario?: { title_en?: string; role_es?: string } | null;
}

export interface TurnRow {
  id: string;
  idx: number;
  role: 'user' | 'tomas';
  status: 'draft' | 'final' | null;
  text: string;
  text_en: string | null;
  audio_path: string | null;
  feedback: Feedback | null;
  /** The opener carries `{ opener: true, audio_url }`. */
  meta?: { opener?: boolean; audio_url?: string | null } | null;
}

const CONVERSATION_COLS =
  'id, local_date, kind, topic_id, level, started_at, ended_at, paused_seconds, hints_used, goals_done, summary, unlimited, scenario';

/** The day's chat, or the last one: a unit chat on the road is never the day's chat. */
export async function latestConversation(): Promise<ConversationRow | null> {
  const { data: rows } = await supabase
    .from('conversations')
    .select(CONVERSATION_COLS)
    .neq('kind', 'unit')
    .order('started_at', { ascending: false })
    .limit(1);
  return ((rows ?? [])[0] as ConversationRow | undefined) ?? null;
}

export async function history(limit = 20): Promise<ConversationRow[]> {
  const { data: rows } = await supabase
    .from('conversations')
    .select(CONVERSATION_COLS)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit);
  return (rows ?? []) as ConversationRow[];
}

export async function loadConversation(id: string): Promise<{ conversation: ConversationRow; turns: TurnRow[] } | null> {
  const [{ data: conv }, { data: turns }] = await Promise.all([
    supabase.from('conversations').select(CONVERSATION_COLS).eq('id', id).maybeSingle(),
    supabase
      .from('conversation_turns')
      .select('id, idx, role, status, text, text_en, audio_path, feedback, meta')
      .eq('conversation_id', id)
      .order('idx', { ascending: true }),
  ]);
  if (!conv) return null;
  return { conversation: conv as ConversationRow, turns: (turns ?? []) as TurnRow[] };
}

/** Short-lived signed URL for a recording in the private `hablar` bucket. */
export async function signedHablarUrl(path: string): Promise<string | null> {
  const { data: signed } = await supabase.storage.from('hablar').createSignedUrl(path, 3600);
  return signed?.signedUrl ?? null;
}

/** Where the server writes the joined reply mp3 (§4.5 step 7). */
export function tomasAudioPath(userId: string, sessionId: string, userTurnId: string) {
  return `${userId}/${sessionId}/${userTurnId}-tomas.mp3`;
}

export const isToday = (c: ConversationRow) => c.local_date === localDateStr();

/**
 * The hard stop by level, as the server's CLOCK has it (supabase/functions/_shared/hablar.ts):
 * four minutes for A1 and A2, three above. A chat just started counts down to the server's own
 * `deadline_at`; this is for the brief, and for a chat loaded back from the tables.
 */
export const chatSeconds = (level: string | null | undefined) => (level === 'A1' || level === 'A2' ? 240 : 180);
/** What the brief promises: Pancho usually closes about a minute before the hard stop. */
export const chatLength = (level: string | null | undefined) => `About ${chatSeconds(level) / 60 - 1} min`;
/** The hard stop, plus whatever time the clock was stopped (the app in the background, Pancho's turn). */
export const deadlineOf = (c: ConversationRow) =>
  new Date(new Date(c.started_at).getTime() + (chatSeconds(c.level) + (c.paused_seconds ?? 0)) * 1000).toISOString();

/** A human title for a conversation, for History and the summary header. */
export function conversationTitle(kind: HablarKind, topicId: string | null | undefined, title?: string | null): string {
  if (kind === 'unit') return title ?? 'Unit chat';
  if (kind === 'scenario') return findScenario(topicId)?.title_en ?? 'Scenario';
  if (kind === 'culture') return cultureSections.find((s) => s.slug === topicId)?.title ?? 'Culture';
  return 'Talk about anything';
}

// --- hand-offs between screens (in memory; a reload falls back to the DB) ------

export const startCache = new Map<string, StartResult>();
export const summaryCache = new Map<string, HablarSummary>();

// --- the level the Speaking tab opens at, kept on the device ---------------------

const LEVEL_KEY = 'hablar.band';

/**
 * Where the level switch starts: the level of the last chat she played, or on
 * a first visit her course level. The course level comes from the
 * hablar_my_level RPC; if that can't answer, her latest chat's level, then
 * Beginner.
 */
export async function getDefaultLevel(): Promise<Band> {
  const stored = await AsyncStorage.getItem(LEVEL_KEY).catch(() => null);
  if (isBand(stored)) return stored;
  const { data, error } = await supabase.rpc('hablar_my_level');
  if (!error && typeof data === 'string') return bandOf(data);
  const latest = await latestConversation().catch(() => null);
  return isBand(latest?.level) ? latest.level : 'A1';
}

/** A chat was played at this level: the tab opens there next time. */
export function setDefaultLevel(v: Band) {
  void AsyncStorage.setItem(LEVEL_KEY, v).catch(() => {});
}

// --- a word-level diff for the correction sheet ---------------------------------

export type DiffPart = { text: string; kind: 'same' | 'removed' | 'added' };

/** "Quiero un manzana" vs "Quiero una manzana" → same · removed(un) · added(una) · same. */
export function wordDiff(said: string, corrected: string): DiffPart[] {
  const a = said.trim().split(/\s+/).filter(Boolean);
  const b = corrected.trim().split(/\s+/).filter(Boolean);
  const norm = (w: string) => w.toLowerCase().replace(/[.,!?¡¿;:…"]/g, '');
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i][j] = norm(a[i]) === norm(b[j]) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);

  const parts: DiffPart[] = [];
  const push = (text: string, kind: DiffPart['kind']) => {
    const last = parts[parts.length - 1];
    if (last && last.kind === kind) last.text += ` ${text}`;
    else parts.push({ text, kind });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (norm(a[i]) === norm(b[j])) {
      // Case and punctuation aren't worth a strike-through (the text never
      // heard them); show the corrected spelling as unchanged.
      push(b[j], 'same');
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) push(a[i++], 'removed');
    else push(b[j++], 'added');
  }
  while (i < n) push(a[i++], 'removed');
  while (j < m) push(b[j++], 'added');
  return parts;
}

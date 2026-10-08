import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Diff,
  type IconName,
  MicButton,
  Sheet,
  ThinkingDots,
  PanchoAvatar,
  RosaFill,
  webPress,
} from '@/components/hablar-ui';
import { Button } from '@/components/ui';
import { type ActiveRecording, armMic, canRecord, disarmMic, readyClip, type RecordedClip, startRecording, warmMic } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import {
  conversationTitle,
  type DoneEvent,
  deadlineOf,
  end,
  type Feedback,
  type Verdict,
  verdictOf,
  bandOf,
  findScenario,
  scenarioAt,
  HablarError,
  hint,
  type HintResult,
  loadConversation,
  newTurnId,
  reply,
  resolveAudio,
  signedHablarUrl,
  speak,
  startCache,
  tomasAudioPath,
  translate,
  warm,
  wordDiff,
} from '@/lib/hablar';
import {
  checkClip,
  MAX_RECORD_MS,
  nowPlaying,
  play,
  playSlow,
  prime,
  stopAll,
  streamChunk,
  streamEnd,
  streamSkip,
  streamStart,
  usePlaying,
  whenIdle,
} from '@/lib/hablar-audio';
import { tap } from '@/lib/haptics';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, gradients, pastel, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The conversation (§2.3–2.4). Turn-based: she records and taps to send. The
// recording goes to hablar-reply, which transcribes it and answers on the same
// stream: her line lands, then the verdict on it, then Pancho — his reply is
// held back (text and voice) until the correction is on screen, or for at most
// HOLD_MS, so the thread always reads in that order and nothing jumps under
// him. (A draft left over from an older build still shows for review after a reload.)
//
// The server owns the clock. The timer here is a display: it counts down to
// `deadline_at`, stops while the app is in the background and while it is
// Pancho's turn (her line is being answered, or he is speaking), and reports
// those paused seconds with the next request so the server can extend the deadline.
// ---------------------------------------------------------------------------

type PanchoMsg = {
  role: 'tomas';
  key: string;
  text: string;
  textEn?: string | null;
  /** Row id of Pancho's turn, for 🔤. */
  turnId?: string;
  /** The learner turn this answers (live turns only). */
  userTurnId?: string;
  /** Public clip (opener): path in the `audio` bucket or URL. */
  audioRef?: string | null;
  /** Private recording in the `hablar` bucket. */
  audioPath?: string | null;
  streaming?: boolean;
  failed?: boolean;
  /** Not shown yet: waiting for the correction above it (see HOLD_MS). */
  held?: boolean;
};

type UserMsg = {
  role: 'user';
  key: string;
  text: string;
  feedback: Feedback | null;
  pending: boolean;
};
type Msg = PanchoMsg | UserMsg;

type Phase =
  | 'boot'
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'draft'
  | 'waiting' // sent; nothing streamed yet
  | 'streaming'
  | 'retry'
  | 'ended'
  | 'ending'
  | 'denied'
  | 'gone';

const HINTS_PER_CHAT = 3;
/** Longest Pancho waits for the correction once his reply has started coming in. */
const HOLD_MS = 1200;

/** The scenario version a chat runs: the one of its level (hablar-start stores the version's band). */
const versionOf = (kind: string | undefined, topicId: string | null | undefined, level: string | null | undefined) => {
  const s = kind === 'scenario' ? findScenario(topicId) : undefined;
  return s ? scenarioAt(s, bandOf(level)) : undefined;
};
const WAVE_BARS = 18;

export default function HablarChat() {
  useStatusBarColor(colors.bg);
  const { session: sessionParam } = useLocalSearchParams<{
    session?: string;
  }>();
  const sessionId = sessionParam ?? '';
  const { session: auth } = useAuth();
  const userId = auth?.user.id ?? '';

  const [phase, setPhase] = useState<Phase>('boot');
  const [messages, setMessages] = useState<Msg[]>([]);
  /** The thread as last rendered, for code that runs between renders. */
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [draft, setDraft] = useState<{ turnId: string; text: string } | null>(null);
  /** Writing instead of speaking — the only way in where the mic can't record. */
  const [typing, setTyping] = useState(!canRecord);
  const [typed, setTyped] = useState('');
  const [title, setTitle] = useState<{ text: string; role: string | null }>({
    text: '',
    role: null,
  });
  const [deadline, setDeadline] = useState<number>(0);
  /** Staff chat: no clock (deadline stays 0, the timer is hidden). */
  const [unlimited, setUnlimited] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [wrapUp, setWrapUp] = useState(false);

  const [hintState, setHintState] = useState<{
    data: HintResult | null;
    level: 0 | 1 | 2 | 3;
    loading: boolean;
  }>({
    data: null,
    level: 0,
    loading: false,
  });
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showEn, setShowEn] = useState<Set<string>>(new Set());
  const [translating, setTranslating] = useState<string | null>(null);
  /** Older Pancho messages she tapped to show their ▶ / 🐢 / EN row. */
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [sheet, setSheet] = useState<
    | { kind: 'message'; key: string }
    | { kind: 'end' }
    | null
  >(null);

  const playing = usePlaying();
  const scroll = useRef<ScrollView>(null);
  /**
   * The recording in progress. The button turns to "recording" on the tap
   * itself; the recorder catches up a moment later (`rec` stays null until
   * `starting` settles, and a stop before then waits for it).
   */
  const rec = useRef<{
    rec: ActiveRecording | null;
    starting: Promise<ActiveRecording | null>;
    at: number;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const reRecordTurn = useRef<string | null>(null);
  /** Total seconds the clock was stopped this chat. The server keeps the max it has seen, so this is cumulative. */
  const pausedTotal = useRef(0);
  /** What is stopping the clock right now (the app is away, it's Pancho's turn), and since when. */
  const holds = useRef({ n: 0, since: 0 });
  /** When the clock stopped, while it is: the timer shows the time left as of then. */
  const [heldAt, setHeldAt] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);

  const say = useCallback((text: string) => {
    setNotice(text);
    setTimeout(() => setNotice((n) => (n === text ? null : n)), 3200);
  }, []);

  // A stop still running counts up to now, so the server never sees less than the timer shows.
  const takePaused = () =>
    Math.floor(pausedTotal.current + (holds.current.n ? (Date.now() - holds.current.since) / 1000 : 0));

  // --- boot: from the start hand-off, or from the tables after a reload ------
  useEffect(() => {
    if (!sessionId) return setPhase('gone');
    let alive = true;
    (async () => {
      const started = startCache.get(sessionId);
      if (started) {
        const kind = started.kind ?? 'scenario';
        setTitle({
          text: conversationTitle(kind, started.topic_id, started.title),
          role: versionOf(kind, started.topic_id, started.level)?.role_es ?? started.role_es ?? null,
        });
        setUnlimited(!!started.unlimited);
        if (started.deadline_at) setDeadline(new Date(started.deadline_at).getTime());
        setMessages([
          {
            role: 'tomas',
            key: 'opener',
            turnId: started.opener.turn_id,
            text: started.opener.text,
            textEn: started.opener.text_en,
            audioRef: started.opener.audio_url,
          },
        ]);
        setPhase('idle');
        // Pancho speaks first. The context was woken in the Empezar tap; the
        // brief put his line on the phone, when it could.
        const openerPath = versionOf(kind, started.topic_id, started.level)?.opener.audio;
        if (started.opener.audio_url)
          void play('opener', async () => readyClip(openerPath) ?? resolveAudio(started.opener.audio_url));
        return;
      }
      const loaded = await loadConversation(sessionId).catch(() => null);
      if (!alive) return;
      if (!loaded) return setPhase('gone');
      const { conversation, turns } = loaded;
      if (conversation.ended_at) return router.replace(`/hablar-summary?session=${sessionId}`);
      const scenario = versionOf(conversation.kind, conversation.topic_id, conversation.level);
      setTitle({
        text: conversationTitle(conversation.kind, conversation.topic_id, conversation.scenario?.title_en),
        role: scenario?.role_es ?? conversation.scenario?.role_es ?? null,
      });
      setHintsUsed(conversation.hints_used ?? 0);
      pausedTotal.current = conversation.paused_seconds ?? 0;
      setUnlimited(!!conversation.unlimited);
      if (!conversation.unlimited) setDeadline(new Date(deadlineOf(conversation)).getTime());
      const msgs: Msg[] = [];
      let pendingDraft: { turnId: string; text: string } | null = null;
      turns.forEach((t) => {
        if (t.role === 'tomas') {
          msgs.push({
            role: 'tomas',
            key: t.id,
            text: t.text,
            textEn: t.text_en,
            turnId: t.id,
            audioRef: t.meta?.opener ? (t.meta.audio_url ?? scenario?.opener.audio ?? null) : null,
            audioPath: t.audio_path,
          });
        } else if (t.status === 'draft') {
          pendingDraft = { turnId: t.id, text: t.text };
        } else {
          msgs.push({
            role: 'user',
            key: t.id,
            text: t.text,
            feedback: t.feedback,
            pending: false,
          });
        }
      });
      setMessages(msgs);
      setDraft(pendingDraft);
      setPhase(pendingDraft ? 'draft' : 'idle');
    })();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  // Get the first turn's way ready while Pancho says his opener: the recorder,
  // and the function that will answer.
  useEffect(() => {
    warmMic();
    warm('hablar-reply');
  }, []);

  // --- the clock: stops while the app is in the background, and on Pancho's turn --
  // The ticking display is its own component (ChatTimer), so the countdown
  // re-renders one chip, not the whole chat, every half second.
  /** Stop the clock, or let it run again. The stops overlap (the app goes away while he speaks): time counts once. */
  const hold = useCallback((on: boolean) => {
    const h = holds.current;
    if (on) {
      if (h.n++ === 0) setHeldAt((h.since = Date.now()));
      return;
    }
    if (h.n === 0 || --h.n > 0) return;
    const gap = Date.now() - h.since;
    pausedTotal.current += gap / 1000;
    setDeadline((d) => (d ? d + gap : d));
    setHeldAt(null);
  }, []);

  useEffect(() => {
    let hidden = false;
    const away = () => {
      if (hidden) return;
      hidden = true;
      hold(true);
    };
    const back = () => {
      if (!hidden) return;
      hidden = false;
      hold(false);
    };
    if (Platform.OS === 'web') {
      if (typeof document === 'undefined') return;
      const onVis = () => (document.hidden ? away() : back());
      document.addEventListener('visibilitychange', onVis);
      return () => document.removeEventListener('visibilitychange', onVis);
    }
    const sub = AppState.addEventListener('change', (state) => (state === 'background' ? away() : state === 'active' && back()));
    return () => sub.remove();
  }, [hold]);

  // Pancho's turn: from her line going up until his voice has finished (a
  // replay of one of his lines counts too). A beginner hears him slowly; that
  // is not her time to lose. Starting to record always ends it (startRec stops the audio).
  const panchoTurn = phase === 'transcribing' || phase === 'waiting' || phase === 'streaming' || !!playing;
  useEffect(() => {
    if (!panchoTurn) return;
    hold(true);
    return () => hold(false);
  }, [panchoTurn, hold]);

  // Her turn: a recorder waits for the tap, so the mic opens at once (armMic).
  // A beat after Pancho's voice ends, so the switch never lands between two of
  // his sentences.
  const herTurn = (phase === 'idle' || phase === 'draft' || phase === 'retry') && !playing;
  useEffect(() => {
    if (!herTurn) return;
    const t = setTimeout(armMic, 150);
    return () => {
      clearTimeout(t);
      disarmMic();
    };
  }, [herTurn]);

  useEffect(
    () => () => {
      // Leaving the screen: silence Pancho, drop a recording in progress.
      dropRecording();
      abort.current?.abort();
      stopAll();
      whenIdle(null);
    },
    [],
  );

  // Flips once, when the deadline passes — the deadline moves on a pause, and a
  // stopped clock doesn't run out.
  const [timeUp, setTimeUp] = useState(false);
  useEffect(() => {
    if (!deadline || heldAt !== null) return;
    const left = deadline - Date.now();
    setTimeUp(left <= 0);
    if (left <= 0) return;
    const id = setTimeout(() => setTimeUp(true), left);
    return () => clearTimeout(id);
  }, [deadline, heldAt]);

  // Keep the newest message in view.
  const toBottom = () => requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));

  // --- finishing ----------------------------------------------------------------
  const finishing = useRef(false);
  const finish = useCallback(
    async (reason: 'user' | 'time') => {
      if (finishing.current) return;
      finishing.current = true;
      whenIdle(null);
      stopAll();
      dropRecording();
      setPhase('ending');
      await end({
        session_id: sessionId,
        reason,
        paused_seconds: takePaused(),
      }).catch(() => null);
      router.replace(`/hablar-summary?session=${sessionId}`);
    },
    [sessionId],
  );

  // --- recording ----------------------------------------------------------------
  /** Drop a recording in progress, whether or not the recorder has started yet. */
  function dropRecording() {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    clearTimeout(r.timer);
    if (r.rec) r.rec.cancel();
    else void r.starting.then((x) => x?.cancel());
  }

  const stopRecording = async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    clearTimeout(r.timer);
    setPhase('transcribing');
    const active = r.rec ?? (await r.starting);
    if (!active) return setPhase('idle'); // the mic never opened; startRec said why
    let clip: RecordedClip;
    try {
      clip = await active.stop();
    } catch {
      setPhase('idle');
      return say('No te escuché.');
    }
    if (!clip.size) {
      setPhase('idle');
      return say('The mic sent no sound. Check your microphone and try again.');
    }
    const check = await checkClip(clip, Date.now() - r.at);
    if (check !== 'ok') {
      setPhase('idle');
      return say(
        check === 'short' ? 'No te escuché. Mantené el mic un poco más.' : 'No te escuché. Hablá un poco más fuerte.',
      );
    }
    // A re-record replaces the draft for the same turn.
    const turnId = reRecordTurn.current ?? newTurnId();
    reRecordTurn.current = turnId;
    void runReply(turnId, 0, { clip });
  };

  const startRec = () => {
    stopAll();
    tap();
    // She talks for a few seconds: long enough to boot the function that will answer.
    warm('hablar-reply');
    const starting = startRecording().then(
      (r) => r,
      (e) => {
        // Only if it's still this attempt she's waiting on.
        if (rec.current?.starting === starting) {
          clearTimeout(rec.current.timer);
          rec.current = null;
          const name = e && typeof e === 'object' ? (e as Error).name : '';
          if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError')
            setPhase('denied');
          else {
            setPhase('idle');
            say("Couldn't open the microphone.");
          }
        }
        return null;
      },
    );
    rec.current = {
      rec: null,
      starting,
      at: Date.now(),
      timer: setTimeout(() => void stopRecording(), MAX_RECORD_MS),
    };
    // On the tap, not when the recorder is ready: the button answers at once.
    setPhase('recording');
    // Cancelled meanwhile: dropRecording cancels it. Stopped meanwhile:
    // stopRecording waits on `starting` itself.
    void starting.then((r) => {
      if (r && rec.current?.starting === starting) rec.current.rec = r;
    });
  };

  const toggleMic = () => {
    if (phase === 'recording') {
      prime(); // inside the tap: the transcript is sent without another one
      tap();
      return void stopRecording();
    }
    if (phase === 'draft' && draft) {
      reRecordTurn.current = draft.turnId;
      setDraft(null);
    }
    startRec();
  };

  const cancelRecording = () => {
    if (!rec.current) return;
    dropRecording();
    reRecordTurn.current = null;
    setPhase('idle');
  };

  // --- the turn -----------------------------------------------------------------
  const patch = (key: string, fn: (m: Msg) => Msg) => setMessages((ms) => ms.map((m) => (m.key === key ? fn(m) : m)));

  /** Her line and Pancho's answer, side by side in the thread; his stays hidden until released. */
  const addTurn = (turnId: string, text: string) =>
    setMessages((ms) =>
      ms.some((m) => m.key === turnId)
        ? ms.map((m) => (m.key === turnId ? ({ ...m, text } as UserMsg) : m))
        : [
            ...ms,
            { role: 'user', key: turnId, text, feedback: null, pending: true },
            { role: 'tomas', key: `${turnId}-tomas`, userTurnId: turnId, text: '', streaming: true, held: true },
          ],
    );

  /** Take a turn back out of the thread: it never reached the server. */
  const dropTurn = (turnId: string) =>
    setMessages((ms) => ms.filter((m) => m.key !== turnId && m.key !== `${turnId}-tomas`));

  /**
   * Answer a turn. With `line` (a recording or typed text) the line itself goes
   * up and the stream opens with its transcript; without, the turn is already
   * stored and only the answer comes back.
   */
  const runReply = async (
    turnId: string,
    attempt = 0,
    line?: { clip: RecordedClip } | { text: string },
  ): Promise<void> => {
    const tkey = `${turnId}-tomas`;
    let heard = !line; // the server has her line (a stored turn always has)

    // Pancho waits for the correction: everything of his goes through `held`
    // until the verdict lands, or HOLD_MS after his reply starts coming in. A
    // retry whose correction is already on screen doesn't wait.
    let holding = !messagesRef.current.some((m) => m.key === turnId && m.role === 'user' && m.feedback);
    const waiting: (() => void)[] = [];
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    const release = () => {
      if (!holding) return;
      holding = false;
      if (holdTimer) clearTimeout(holdTimer);
      patch(tkey, (m) => ({ ...m, held: false }) as PanchoMsg);
      for (const fn of waiting.splice(0)) fn();
    };
    const held = (fn: () => void) => {
      if (!holding) return fn();
      waiting.push(fn);
      holdTimer ??= setTimeout(release, HOLD_MS);
    };

    // Text arrives a few characters at a time: one render per frame, not per delta.
    let pendingText = '';
    let frame: number | null = null;
    const flushText = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      if (!pendingText) return;
      const add = pendingText;
      pendingText = '';
      patch(tkey, (m) => ({ ...m, text: m.text + add }));
    };

    const settle = (d: DoneEvent) => {
      streamEnd(tkey);
      patch(tkey, (m) => ({
        ...(m as PanchoMsg),
        streaming: false,
        turnId: d.tomas_turn_id,
        audioPath: d.audio_path ?? (userId ? tomasAudioPath(userId, sessionId, turnId) : null),
      }));
      if (d.wrap_up) setWrapUp(true);
      setPhase(d.ended ? 'ended' : 'idle');
    };
    streamStart(tkey);
    if (heard) patch(tkey, (m) => ({ ...m, text: '', streaming: true, failed: false }) as PanchoMsg);
    // A recording shows "listening" until its transcript is back; anything else is already in the thread.
    if (!line || !('clip' in line)) setPhase('waiting');
    let fatal = false;
    let empty = false;
    let done: DoneEvent | null = null;
    abort.current = new AbortController();
    const handlers = {
      onTranscript: (text: string) => {
        heard = true;
        // Sent: the next recording is a new turn, not a re-record of this one.
        reRecordTurn.current = null;
        addTurn(turnId, text);
        setPhase('waiting');
      },
      onCorrection: (v: { has_error: boolean; verdict?: Verdict; corrected: string }) => {
        patch(turnId, (m) =>
          (m as UserMsg).feedback
            ? m
            : ({ ...m, feedback: { ...v, why_en: '', better: '' }, pending: false } as UserMsg),
        );
        release();
      },
      onText: (_seq: number, delta: string) =>
        held(() => {
          setPhase((p) => (p === 'waiting' ? 'streaming' : p));
          pendingText += delta;
          frame ??= requestAnimationFrame(flushText);
        }),
      onTextFix: (_seq: number, from: string, to: string) =>
        held(() => {
          if (!from) return;
          flushText();
          patch(tkey, (m) => {
            const at = m.text.lastIndexOf(from);
            return at < 0
              ? m
              : {
                  ...m,
                  text: m.text.slice(0, at) + to + m.text.slice(at + from.length),
                };
          });
        }),
      onAudio: (seq: number, mp3: string) => held(() => streamChunk(tkey, seq, mp3)),
      onFeedback: (fb: Feedback) => {
        patch(turnId, (m) => ({ ...m, feedback: fb, pending: false }) as UserMsg);
        release();
      },
      onDone: (d: DoneEvent) => {
        done = d;
        release();
        flushText();
        // Pancho is done talking: she can answer now, while a slower
        // correction may still be on its way down the same stream.
        settle(d);
      },
      onError: (err: { stage: string; retry: boolean; seq?: number }) => {
        // A failed reply sends no `done`, which retries below. A sentence
        // without voice or a missing correction is not worth interrupting her for.
        if (err.stage === 'tts' && err.seq !== undefined) {
          const seq = err.seq;
          held(() => streamSkip(tkey, seq));
        } else if (err.stage === 'feedback') {
          patch(turnId, (m) => ({ ...m, pending: false }) as UserMsg);
          release();
        }
      },
    };
    try {
      const args = { session_id: sessionId, turn_id: turnId, paused_seconds: takePaused() };
      const out = line && !heard
        ? await speak({ ...args, ...line }, handlers, abort.current.signal)
        : await reply(args, handlers, abort.current.signal);
      empty = out === 'empty';
    } catch (e) {
      // 409 "time_up" / "ended" closes the chat; a 409 with retry:true means
      // the same turn is still being answered, so it's worth another try.
      if (
        e instanceof HablarError &&
        (e.status === 409 || e.status === 410 || e.status === 403) &&
        e.body?.retry !== true
      )
        fatal = true;
      if ((e as Error)?.name === 'AbortError') return;
      if (!heard && e instanceof HablarError && e.status === 429) {
        streamEnd(tkey);
        dropTurn(turnId);
        reRecordTurn.current = null;
        setPhase('idle');
        if (line && 'text' in line) {
          const text = line.text;
          setTyped((t) => t || text);
          return say("That's all the lines this chat can take.");
        }
        return say('That was the last recording for this chat. Type instead.');
      }
    }
    release();
    flushText();
    const d = done as DoneEvent | null;
    if (!d) streamEnd(tkey); // otherwise settle() already did

    if (fatal) {
      setPhase('ended');
      return;
    }
    if (empty) {
      dropTurn(turnId);
      setPhase('idle');
      return say('No te escuché.');
    }
    if (!d) {
      // One quiet retry with the same turn_id: the server replays a turn it
      // already finished, runs it again if it didn't, and takes her line
      // again if it never got it.
      if (attempt === 0) return runReply(turnId, 1, heard ? undefined : line);
      if (!heard) {
        // Her line never got through: give it back.
        dropTurn(turnId);
        reRecordTurn.current = null;
        setPhase('idle');
        const typedText = line && 'text' in line ? line.text : null;
        if (typedText) setTyped((t) => t || typedText);
        return say(typedText ? "Couldn't send that. Try again." : "Couldn't hear that. Try again.");
      }
      patch(tkey, (m) => ({ ...m, streaming: false, failed: true }) as PanchoMsg);
      setPhase('retry');
      return;
    }
    // The stream is closed, so a correction that never came won't.
    patch(turnId, (m) => ({ ...m, pending: false }) as UserMsg);
    if (d.ended) {
      // Let him finish his goodbye, then the summary. Called once the stream
      // has closed, so the last line's correction is already saved for it.
      whenIdle(() => setTimeout(() => void finish('time'), 1200));
      if (!nowPlaying()) setTimeout(() => void finish('time'), 2500);
    }
  };

  /** Show a line in the thread right away and answer it (a restored draft, or typed text). */
  const sendTurn = (turnId: string, text: string, line?: { text: string }) => {
    setDraft(null);
    reRecordTurn.current = null;
    setHintState({ data: null, level: 0, loading: false });
    addTurn(turnId, text);
    toBottom();
    void runReply(turnId, 0, line);
  };

  /** A restored draft: she reviews it and taps Enviar. */
  const send = () => {
    if (!draft) return;
    prime(); // inside the tap: Pancho's first sentence must be allowed to sound
    sendTurn(draft.turnId, draft.text);
  };

  /** A typed line: on screen at once, stored and answered in one request. */
  const submitTyped = () => {
    const text = typed.trim();
    if (!text || busy) return;
    prime(); // inside the tap: Pancho's first sentence must be allowed to sound
    setTyped('');
    sendTurn(newTurnId(), text, { text });
  };

  const retry = () => {
    prime();
    const last = [...messages].reverse().find((m): m is PanchoMsg => m.role === 'tomas' && !!m.failed);
    if (last?.userTurnId) void runReply(last.userTurnId, 1);
  };

  // --- 💡 --------------------------------------------------------------------------
  const onHint = async () => {
    if (hintState.loading) return;
    if (hintState.data) {
      if (hintState.level < 3) setHintState((h) => ({ ...h, level: (h.level + 1) as 1 | 2 | 3 }));
      return;
    }
    if (hintsUsed >= HINTS_PER_CHAT) return say('No more hints in this chat.');
    setHintState((h) => ({ ...h, loading: true }));
    try {
      const data = await hint(sessionId);
      setHintsUsed((n) => n + 1);
      setHintState({ data, level: 1, loading: false });
      toBottom();
    } catch (e) {
      setHintState((h) => ({ ...h, loading: false }));
      if (e instanceof HablarError && e.status === 429) {
        setHintsUsed(HINTS_PER_CHAT);
        say('No more hints in this chat.');
      } else say("Couldn't get a hint.");
    }
  };

  // --- 🔤 / ▶ / 🐢 on Pancho's messages ------------------------------------------------
  const onTranslate = async (m: PanchoMsg) => {
    if (m.textEn) {
      setShowEn((s) => {
        const next = new Set(s);
        if (next.has(m.key)) next.delete(m.key);
        else next.add(m.key);
        return next;
      });
      return;
    }
    const id = m.turnId ?? m.userTurnId;
    if (!id) return;
    setTranslating(m.key);
    try {
      const en = await translate(sessionId, id);
      patch(m.key, (x) => ({ ...x, textEn: en }) as PanchoMsg);
      setShowEn((s) => new Set(s).add(m.key));
    } catch {
      say("Couldn't translate that.");
    }
    setTranslating(null);
  };

  const sourceOf = (m: PanchoMsg) => async () =>
    m.audioRef ? resolveAudio(m.audioRef) : m.audioPath ? signedHablarUrl(m.audioPath) : null;

  const onPlay = async (m: PanchoMsg, slow: boolean) => {
    if (playing?.key === m.key && playing.slow === slow) return stopAll();
    const ok = slow ? await playSlow(m.key, sourceOf(m)) : await play(m.key, sourceOf(m));
    if (!ok) say("Couldn't play that.");
  };

  // Stable across renders, so a row that didn't change doesn't redraw while
  // Pancho's reply streams into the one that did.
  const toggleReveal = useStable((key: string) =>
    setRevealed((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    }),
  );
  const playMsg = useStable((m: PanchoMsg, slow: boolean) => void onPlay(m, slow));
  const translateMsg = useStable((m: PanchoMsg) => void onTranslate(m));
  const openMessage = useStable((key: string) => setSheet({ kind: 'message', key }));

  // --- derived ----------------------------------------------------------------------
  const sheetMsg = sheet && 'key' in sheet ? (messages.find((m) => m.key === sheet.key) as Msg | undefined) : undefined;
  const busy = phase === 'waiting' || phase === 'streaming' || phase === 'transcribing';
  const micLocked = timeUp && phase !== 'recording' && phase !== 'draft';
  const lastPanchoKey = [...messages].reverse().find((m) => m.role === 'tomas')?.key;

  // --- screens that replace the chat ----------------------------------------------
  if (phase === 'gone') {
    return (
      <FullMessage icon="chatbubble-ellipses-outline" title="This chat isn't here" body="It may have ended already.">
        <Button title="Back to Speaking" onPress={() => router.dismissTo('/hablar')} />
      </FullMessage>
    );
  }
  if (phase === 'denied') {
    return (
      <FullMessage
        icon="mic-off-outline"
        title="Pancho can't hear you"
        body={
          Platform.OS === 'web'
            ? 'Posta needs the microphone for this. In Safari: tap aA in the address bar → Website Settings → Microphone → Allow. In Chrome: tap the lock icon → Permissions → Microphone.'
            : 'Posta needs the microphone for this. Turn it on in Settings, then come back and try again.'
        }>
        {Platform.OS !== 'web' ? <Button title="Open Settings" onPress={() => void Linking.openSettings()} /> : null}
        <Button
          title="Type instead"
          variant="secondary"
          onPress={() => {
            setTyping(true);
            setPhase('idle');
          }}
        />
        <Button
          title="Try again"
          onPress={() => {
            setPhase('idle');
            void startRec();
          }}
        />
        <Button title="End chat" variant="ghost" onPress={() => void finish('user')} />
      </FullMessage>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      {/* On iOS the keyboard covers the screen instead of shrinking it. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header: back · Pancho · scenario · timer · ⋮ */}
      <View style={styles.header}>
        <Pressable
          onPress={() => setSheet({ kind: 'end' })}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.headerIcon, { transform: [{ scale: pressed ? 0.94 : 1 }] }, webPress]}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <PanchoAvatar size={40} />
        <View style={styles.headerTitle}>
          <FitText style={styles.headerName} lines={1}>
            {title.text}
          </FitText>
          <FitText style={styles.headerRole} lines={1}>
            {title.role ? `Pancho · ${title.role}` : 'Pancho'}
          </FitText>
        </View>
        {unlimited ? null : (
          <ChatTimer deadline={deadline} heldAt={heldAt} />
        )}
        <Pressable
          onPress={() => setSheet({ kind: 'end' })}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="More"
          style={({ pressed }) => [styles.headerIcon, { transform: [{ scale: pressed ? 0.94 : 1 }] }, webPress]}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}>
        {messages.map((m) =>
          m.role === 'tomas' ? (
            m.held ? null : (
              <PanchoRow
                key={m.key}
                m={m}
                isLast={m.key === lastPanchoKey}
                revealed={revealed.has(m.key)}
                english={showEn.has(m.key)}
                translating={translating === m.key}
                playing={playing?.key === m.key ? (playing.slow ? 'slow' : 'normal') : null}
                onToggle={toggleReveal}
                onPlay={playMsg}
                onTranslate={translateMsg}
              />
            )
          ) : (
            <UserRow key={m.key} m={m} onCopy={openMessage} />
          ),
        )}

        {phase === 'transcribing' ? (
          <Appear key="transcribing">
            <View style={styles.userRow}>
              <View style={styles.listening} accessibilityLabel="Escuchando lo que dijiste">
                <ThinkingDots />
              </View>
            </View>
          </Appear>
        ) : null}

        {draft ? (
          <Appear key={`draft-${draft.turnId}-${draft.text}`}>
            <View style={styles.userRow}>
              <Text style={styles.draftLabel}>¿Dijiste esto?</Text>
              <View style={styles.draftBubble}>
                <Text style={styles.draftText}>{draft.text}</Text>
              </View>
              <View style={styles.draftActions}>
                <Pressable
                  onPress={toggleMic}
                  disabled={micLocked}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.redo,
                    { transform: [{ scale: pressed ? press.scale : 1 }] },
                    webPress,
                  ]}>
                  <MaterialCommunityIcons name="refresh" size={17} color={colors.ink} />
                  <Text style={styles.redoText}>Grabar de nuevo</Text>
                </Pressable>
                <Pressable
                  onPress={send}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.sendBtn,
                    { transform: [{ scale: pressed ? press.scale : 1 }] },
                    webPress,
                  ]}>
                  <RosaFill round={22} />
                  <Text style={styles.sendText}>Enviar</Text>
                  <MaterialCommunityIcons name="send" size={16} color={colors.onPrimary} />
                </Pressable>
              </View>
            </View>
          </Appear>
        ) : null}

        {hintState.data && hintState.level > 0 ? (
          <Appear key="hint">
            <View style={styles.hintCard}>
              <View style={styles.hintHead}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={colors.onPastel} />
                <Text style={styles.hintLabel}>Pista</Text>
                <View style={styles.hintSteps}>
                  {[1, 2, 3].map((n) => (
                    <View
                      key={n}
                      style={[
                        styles.hintStep,
                        n <= hintState.level && {
                          backgroundColor: colors.onPastel,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Pressable
                  onPress={() => setHintState((h) => ({ ...h, level: 0 }))}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Close hint"
                  style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close" size={18} color={colors.onPastel} />
                </Pressable>
              </View>
              <Text style={styles.hintText}>
                {hintState.level >= 2 ? hintState.data.full : `${hintState.data.starter}…`}
              </Text>
              {hintState.level >= 3 ? <Text style={styles.hintEn}>{hintState.data.full_en}</Text> : null}
              {hintState.level < 3 ? (
                <Text style={styles.hintMore}>
                  Tap Hint again for {hintState.level === 1 ? 'the full answer' : 'the English'}
                </Text>
              ) : null}
            </View>
          </Appear>
        ) : null}
      </ScrollView>

      {/* Bottom dock */}
      <View style={styles.bar}>
        {notice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        {phase === 'retry' ? (
          <View style={styles.barStack}>
            <Text style={styles.caption}>Se cortó la conexión.</Text>
            <Button title="Reintentar" onPress={retry} />
          </View>
        ) : phase === 'ended' || phase === 'ending' || micLocked ? (
          <View style={styles.barStack}>
            <Text style={styles.caption}>
              {phase === 'ended' && !timeUp ? 'Pancho cerró la charla.' : 'Se terminó el tiempo.'}
            </Text>
            <Button title="Ver resumen" loading={phase === 'ending'} onPress={() => void finish('time')} />
          </View>
        ) : typing && phase !== 'recording' ? (
          <>
            <View style={styles.typeRow}>
              <Pressable
                onPress={() => void onHint()}
                disabled={busy || phase === 'boot' || hintState.loading}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Hint, ${Math.max(0, HINTS_PER_CHAT - hintsUsed)} left`}
                style={({ pressed }) => [
                  styles.typeCircle,
                  { backgroundColor: pastel.butter },
                  (busy || phase === 'boot') && { opacity: 0.4 },
                  { transform: [{ scale: pressed ? 0.94 : 1 }] },
                  webPress,
                ]}>
                {hintState.loading ? (
                  <ActivityIndicator size="small" color={colors.ink} />
                ) : (
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={colors.ink} />
                )}
              </Pressable>
              <TextInput
                value={typed}
                onChangeText={setTyped}
                placeholder="Escribile a Pancho…"
                placeholderTextColor={colors.muted}
                multiline
                maxLength={300}
                autoFocus={canRecord}
                autoCorrect={false}
                accessibilityLabel="Your message to Pancho"
                style={styles.typeInput}
              />
              <Pressable
                onPress={submitTyped}
                disabled={!typed.trim() || busy || phase === 'boot'}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel="Send"
                accessibilityState={{ disabled: !typed.trim() || busy }}
                style={({ pressed }) => [
                  styles.typeCircle,
                  { backgroundColor: colors.primary },
                  (!typed.trim() || busy || phase === 'boot') && { opacity: 0.4 },
                  { transform: [{ scale: pressed ? 0.94 : 1 }] },
                  webPress,
                ]}>
                <Ionicons name="arrow-up" size={22} color={colors.onPrimary} />
              </Pressable>
            </View>
            {canRecord ? (
              <Pressable
                onPress={() => setTyping(false)}
                hitSlop={8}
                accessibilityRole="button"
                style={({ pressed }) => [styles.typeSwitch, { opacity: pressed ? 0.6 : 1 }, webPress]}>
                <MaterialCommunityIcons name="microphone-outline" size={16} color={colors.muted} />
                <Text style={styles.caption}>
                  {phase === 'waiting' || phase === 'streaming' ? 'Pancho está hablando…' : 'Hablar en vez de escribir'}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.caption}>
                {phase === 'waiting' || phase === 'streaming' ? 'Pancho está hablando…' : 'Escribí en español'}
              </Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.barRow}>
              <SideButton
                icon="lightbulb-on-outline"
                label={`Hint · ${Math.max(0, HINTS_PER_CHAT - hintsUsed)}`}
                tone="accent"
                busy={hintState.loading}
                disabled={busy || phase === 'recording' || phase === 'boot'}
                onPress={() => void onHint()}
                accessibilityLabel={`Hint, ${Math.max(0, HINTS_PER_CHAT - hintsUsed)} left`}
              />
              <MicButton
                size={84}
                recording={phase === 'recording'}
                busy={phase === 'transcribing'}
                disabled={phase === 'boot' || phase === 'waiting' || phase === 'streaming'}
                onPress={toggleMic}
              />
              {phase === 'recording' ? (
                <SideButton
                  icon="close"
                  label="Cancel"
                  onPress={cancelRecording}
                  accessibilityLabel="Cancel recording"
                />
              ) : (
                <SideButton
                  icon="keyboard-outline"
                  label="Type"
                  disabled={phase === 'boot'}
                  onPress={() => setTyping(true)}
                  accessibilityLabel="Type instead of speaking"
                />
              )}
            </View>
            {phase === 'recording' ? (
              <RecordingMeter since={rec.current?.at ?? Date.now()} level={() => rec.current?.rec?.level() ?? 0} />
            ) : (
              <Text style={styles.caption}>
                {phase === 'transcribing'
                  ? 'Escuchando lo que dijiste…'
                  : phase === 'waiting' || phase === 'streaming'
                    ? 'Pancho está hablando…'
                    : phase === 'draft'
                      ? 'Revisá el texto y enviá'
                      : wrapUp
                        ? 'Pancho está cerrando la charla'
                        : 'Tocá para hablar'}
              </Text>
            )}
          </>
        )}
      </View>

      </KeyboardAvoidingView>

      {/* long-press on her message */}
      <Sheet open={sheet?.kind === 'message'} onClose={() => setSheet(null)}>
        {sheetMsg ? (
          <>
            <Text style={styles.sheetBig}>{sheetMsg.text}</Text>
            <Button
              title="Copy text"
              variant="secondary"
              onPress={() => {
                void Clipboard.setStringAsync(sheetMsg.text).catch(() => {});
                setSheet(null);
                say('Copied.');
              }}
            />
          </>
        ) : null}
      </Sheet>

      {/* Volver / ⋮ → end */}
      <Sheet open={sheet?.kind === 'end'} onClose={() => setSheet(null)} title="End the chat?">
        <Text style={styles.sheetBody}>
          You'll see your summary, and today's chat is used up.
        </Text>
        <Button
          title="Terminar charla"
          onPress={() => {
            setSheet(null);
            void finish('user');
          }}
        />
        <Button title="Seguir hablando" variant="ghost" onPress={() => setSheet(null)} />
      </Sheet>
    </SafeAreaView>
  );
}

/** A callback that keeps its identity across renders but always runs the latest closure. */
function useStable<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: A) => ref.current(...args), []);
}

/** One of Pancho's messages. Memoized: while one streams, the rest of the thread stays still. */
const PanchoRow = memo(function PanchoRow({
  m,
  isLast,
  revealed,
  english,
  translating,
  playing,
  onToggle,
  onPlay,
  onTranslate,
}: {
  m: PanchoMsg;
  isLast: boolean;
  revealed: boolean;
  english: boolean;
  translating: boolean;
  playing: 'normal' | 'slow' | null;
  onToggle: (key: string) => void;
  onPlay: (m: PanchoMsg, slow: boolean) => void;
  onTranslate: (m: PanchoMsg) => void;
}) {
  const tools = !m.streaming && !m.failed && (isLast || revealed);
  return (
    <Appear>
      <View style={styles.tomasRow}>
        <PanchoAvatar size={28} />
        <Pressable
          onPress={() => !isLast && onToggle(m.key)}
          accessibilityHint={isLast ? undefined : 'Shows play and translate'}
          style={[styles.tomasBubble, tools && styles.tomasBubbleTools]}>
          {m.streaming && !m.text ? (
            <View style={styles.thinking}>
              <Text style={styles.thinkingText}>Pancho está pensando</Text>
              <ThinkingDots />
            </View>
          ) : (
            <Text style={styles.tomasText}>{m.text}</Text>
          )}
          {m.failed ? <Text style={styles.failed}>Se cortó la conexión.</Text> : null}
          {english && m.textEn ? <Text style={styles.english}>{m.textEn}</Text> : null}
          {tools ? (
            <View style={styles.tools}>
              <Tool active={playing === 'normal'} onPress={() => onPlay(m, false)} accessibilityLabel="Play">
                <MaterialCommunityIcons name={playing === 'normal' ? 'stop' : 'play'} size={20} color={colors.primary} />
              </Tool>
              <Tool active={playing === 'slow'} onPress={() => onPlay(m, true)} accessibilityLabel="Play slowly">
                <MaterialCommunityIcons name={playing === 'slow' ? 'stop' : 'tortoise'} size={20} color={colors.primary} />
              </Tool>
              <Tool
                active={english}
                onPress={() => onTranslate(m)}
                accessibilityLabel={english ? 'Hide translation' : 'Translate'}>
                {translating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.toolText}>EN</Text>
                )}
              </Tool>
            </View>
          ) : null}
        </Pressable>
      </View>
    </Appear>
  );
});

/** One of her messages, with the correction and the local way to say it under it. */
const UserRow = memo(function UserRow({
  m,
  onCopy,
}: {
  m: UserMsg;
  onCopy: (key: string) => void;
}) {
  const fb = m.feedback;
  return (
    <Appear>
      <View style={styles.userRow}>
        <Pressable onLongPress={() => onCopy(m.key)} accessibilityHint="Long-press to copy" style={styles.userBubble}>
          <LinearGradient colors={gradients.deep} style={styles.userFill} pointerEvents="none" />
          <Text style={styles.userText}>{m.text}</Text>
        </Pressable>
        {m.pending ? (
          <View style={styles.checking} accessibilityLabel="Checking what you said">
            <ThinkingDots />
          </View>
        ) : fb ? (
          <Appear>
            <Correction said={m.text} feedback={fb} />
          </Appear>
        ) : null}
      </View>
    </Appear>
  );
});

/** Messages rise into place: 200ms, ease-out, a few points of travel. */
function Appear({ children }: { children: React.ReactNode }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 220,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [t]);
  return (
    <Animated.View
      style={{
        opacity: t,
        transform: [
          {
            translateY: t.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }}>
      {children}
    </Animated.View>
  );
}

/** ▶ / 🐢 / EN inside Pancho's bubble. */
function Tool({
  active,
  onPress,
  accessibilityLabel,
  children,
}: {
  active?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.tool,
        active && { backgroundColor: colors.primarySoft },
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
        webPress,
      ]}>
      {children}
    </Pressable>
  );
}

/**
 * The correction, always open under her message: what she said with the fix
 * struck through and filled in, and why — or a quiet tick when it was right.
 * A line that is no mistake but not right either (an English word, a tú form)
 * gets the way to say it instead of the tick; a garbled one gets nothing.
 *
 * When her line would sound foreign in Argentina — and only then; the server
 * decides, strictly — the Argentine way to say it sits in the same card, under
 * a line.
 */
function Correction({ said, feedback }: { said: string; feedback: Feedback }) {
  const verdict = verdictOf(feedback);
  if (verdict === 'unclear') return null;
  if (verdict === 'note') {
    // Until the full feedback lands there is no better line to show yet.
    if (!feedback.better) return null;
    return (
      <View style={styles.correct} accessibilityLabel={`Try: ${feedback.better}`}>
        <Text style={styles.noteText}>Try: {feedback.better}</Text>
      </View>
    );
  }
  const tick = (
    <View style={styles.correct} accessibilityLabel="Correct">
      <MaterialCommunityIcons name="check-bold" size={14} color={colors.success} />
      <Text style={styles.correctText}>Correct</Text>
    </View>
  );
  if (verdict === 'correct') {
    if (!feedback.better) return tick;
    return (
      <View style={[styles.correction, styles.correctionPlain]}>
        <View style={{ marginHorizontal: -4 }}>{tick}</View>
        <Local feedback={feedback} />
      </View>
    );
  }
  return (
    <View style={styles.correction} accessibilityLabel={`Correction: ${feedback.corrected}`}>
      <Diff parts={wordDiff(said, feedback.corrected)} size={17} />
      {feedback.why_en ? <Text style={styles.correctionWhy}>{feedback.why_en}</Text> : null}
      {feedback.better ? <Local feedback={feedback} /> : null}
    </View>
  );
}

/** Under the line in the correction card: the Argentine way to say it. Arrives with the full feedback, so it fades in. */
function Local({ feedback }: { feedback: Feedback }) {
  return (
    <Appear>
      <View style={styles.local} accessibilityLabel={`A more Argentine way to say it: ${feedback.better}`}>
        <Text style={styles.localLabel}>A more Argentine way to say it:</Text>
        <Text style={styles.localText}>{feedback.better}</Text>
        {feedback.better_en ? <Text style={styles.correctionWhy}>{feedback.better_en}</Text> : null}
      </View>
    </Appear>
  );
}

/** Round button with a label under it, either side of the mic. */
function SideButton({
  icon,
  label,
  tone = 'plain',
  busy,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  icon: IconName;
  label: string;
  tone?: 'plain' | 'accent';
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const fg = colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.side,
        disabled && { opacity: 0.4 },
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
        webPress,
      ]}>
      <View style={[styles.sideCircle, tone === 'accent' && { backgroundColor: pastel.butter }]}>
        {busy ? (
          <ActivityIndicator size="small" color={fg} />
        ) : (
          <MaterialCommunityIcons name={icon} size={22} color={fg} />
        )}
      </View>
      <Text style={styles.sideLabel}>{label}</Text>
    </Pressable>
  );
}

function FullMessage({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.full}>
        <View style={styles.fullIcon}>
          <Ionicons name={icon} size={32} color={colors.primary} />
        </View>
        <Text style={styles.fullTitle}>{title}</Text>
        <Text style={styles.fullBody}>{body}</Text>
        <View style={{ gap: 10, alignSelf: 'stretch' }}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

/** The countdown chip. Ticks on its own, so the chat around it stays still. */
function ChatTimer({ deadline, heldAt }: { deadline: number; heldAt: number | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  // Stopped: the time left when it stopped, until the deadline moves by the length of the stop.
  const remaining = deadline ? Math.max(0, deadline - (heldAt ?? now)) : 5 * 60_000;
  const low = remaining <= 30_000;
  return (
    <View style={[styles.timer, low && styles.timerLow]} accessibilityLabel={`Quedan ${fmt(remaining)}`}>
      <MaterialCommunityIcons name="timer-outline" size={15} color={low ? colors.dangerInk : colors.ink} />
      <Text style={[styles.timerText, low && { color: colors.dangerInk }]}>{fmt(remaining)}</Text>
    </View>
  );
}

/** The waveform and seconds while she records. Its own component: it redraws
 *  12 times a second, and the whole chat used to redraw with it. */
function RecordingMeter({ since, level }: { since: number; level: () => number }) {
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(WAVE_BARS).fill(0));
  const read = useRef(level);
  read.current = level;
  useEffect(() => {
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - since) / 1000)), 250);
    const wave = setInterval(() => {
      const l = read.current();
      setLevels((ls) => [...ls.slice(1), l]);
    }, 80);
    return () => {
      clearInterval(id);
      clearInterval(wave);
    };
  }, [since]);
  return (
    <View style={styles.recRow}>
      <View style={styles.wave} accessible={false}>
        {levels.map((l, i) => (
          <View key={i} style={[styles.waveBar, { height: 4 + l * 20 }]} />
        ))}
      </View>
      <Text style={[styles.caption, { color: colors.dangerInk }]}>{fmt(seconds * 1000)} · tocá para enviar</Text>
    </View>
  );
}

function fmt(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** The dock's lift: a warm shade cast upward over the thread. */
const DOCK_SHADOW = `0 -2.5px 0 ${colors.ink}`;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, minWidth: 0, marginLeft: 4 },
  headerName: {
    ...font.display[800],
    fontSize: 19,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  headerRole: { ...font.body[700], fontSize: 13, color: colors.muted },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  timerLow: { backgroundColor: colors.dangerSoft },
  timerText: {
    ...font.body[800],
    fontSize: 15,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },

  thread: {
    padding: 16,
    gap: 14,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 24,
  },
  tomasRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    paddingRight: 40,
  },
  // Pancho speaks in clay: 26 26 26 8, the tail at his side.
  tomasBubble: {
    flexShrink: 1,
    backgroundColor: colors.card,
    borderRadius: 26,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 17,
    paddingVertical: 12,
    gap: 6,
    boxShadow: clay.surface,
  },
  tomasBubbleTools: { paddingBottom: 4 },
  tomasText: { ...font.body[600], fontSize: 19, lineHeight: 27, color: colors.ink },
  english: {
    ...font.body[500],
    fontSize: 15,
    lineHeight: 21,
    color: colors.muted,
    fontStyle: 'italic',
  },
  failed: { ...font.body[700], fontSize: 13, color: colors.dangerInk },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
  },
  thinkingText: { ...font.body[500], fontSize: 15, color: colors.muted, fontStyle: 'italic' },
  tools: { flexDirection: 'row', gap: 2, marginLeft: -8 },
  tool: {
    height: 36,
    minWidth: 44,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: { ...font.body[800], fontSize: 14, color: colors.primary },

  userRow: { alignItems: 'flex-end', gap: 8, paddingLeft: 48 },
  // Hers is rosa clay, the mirror of his: the tail on her side.
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: 26,
    borderBottomRightRadius: 8,
    paddingHorizontal: 17,
    paddingVertical: 12,
    boxShadow: clay.button,
  },
  userFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26, borderBottomRightRadius: 8 },
  checking: {
    height: 30,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
  },
  correct: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 4 },
  correctText: { ...font.body[800], fontSize: 13, color: colors.success },
  noteText: { ...font.body[700], fontSize: 14, lineHeight: 20, color: colors.muted, flexShrink: 1 },
  correction: {
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    borderTopRightRadius: 6,
    backgroundColor: colors.dangerSoft,
  },
  correctionWhy: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.muted },
  /** A correct line that still gets the Argentine way: the card without the red. */
  correctionPlain: { backgroundColor: colors.card, boxShadow: clay.surface },
  local: {
    gap: 3,
    marginTop: 4,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  localLabel: { ...font.body[700], fontSize: 12, lineHeight: 16, color: colors.muted },
  localText: { ...font.body[700], fontSize: 17, lineHeight: 24, color: colors.ink },
  listening: {
    height: 46,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 26,
    borderBottomRightRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  userText: { ...font.body[600], fontSize: 19, lineHeight: 27, color: colors.onPrimary },

  draftLabel: {
    ...font.body[800],
    fontSize: 13,
    color: colors.muted,
  },
  draftBubble: {
    borderRadius: 26,
    borderTopRightRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  draftText: { ...font.body[600], fontSize: 19, lineHeight: 27, color: colors.ink },
  draftActions: { flexDirection: 'row', gap: 8 },
  redo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  redoText: { ...font.body[700], fontSize: 14, color: colors.ink },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  sendText: { ...font.body[800], fontSize: 15, color: colors.onPrimary },

  // The hint is a peach clay card: an aside, not an answer.
  hintCard: {
    gap: 6,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: pastel.peach,
    boxShadow: clay.surface,
  },
  hintHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintSteps: { flexDirection: 'row', gap: 3, marginLeft: 4 },
  hintStep: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.trough,
  },
  hintLabel: {
    ...font.body[800],
    fontSize: 13,
    color: colors.onPastel,
  },
  hintText: {
    ...font.display[700],
    fontSize: 19,
    lineHeight: 24,
    color: colors.onPastel,
  },
  hintEn: { ...font.body[600], fontSize: 14, color: colors.onPastel, opacity: 0.85 },
  hintMore: { ...font.body[700], fontSize: 12, color: colors.onPastel, opacity: 0.8 },

  bar: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 10,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.card,
    boxShadow: DOCK_SHADOW,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barStack: { gap: 8, paddingVertical: 6 },
  typeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  typeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: 24,
    backgroundColor: colors.card,
    ...font.body[600],
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  typeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 32,
  },
  side: { width: 72, alignItems: 'center', gap: 4 },
  sideCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  sideLabel: {
    ...font.body[800],
    fontSize: 12,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 24,
  },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 24 },
  waveBar: { width: 3, borderRadius: 1.5, backgroundColor: colors.accent },
  caption: {
    textAlign: 'center',
    ...font.body[700],
    fontSize: 14,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  notice: {
    position: 'absolute',
    top: -44,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    boxShadow: clay.float,
  },
  noticeText: { ...font.body[700], color: colors.bg, fontSize: 14 },

  sheetBig: {
    ...font.display[700],
    fontSize: 21,
    lineHeight: 27,
    color: colors.ink,
  },
  sheetBody: { ...font.body[600], fontSize: 15, lineHeight: 22, color: colors.muted },
  sheetGood: { ...font.body[800], fontSize: 15, color: colors.success },

  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 28,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  fullIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: pastel.sky,
    boxShadow: clay.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullTitle: {
    ...font.display[800],
    fontSize: 24,
    letterSpacing: -0.3,
    color: colors.ink,
    textAlign: 'center',
  },
  fullBody: {
    ...font.body[600],
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
});

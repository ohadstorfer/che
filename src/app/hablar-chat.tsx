import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';

import {
  DayPips,
  type IconName,
  MicButton,
  Sheet,
  ThinkingDots,
  RosaFill,
  useReducedMotion,
  webPress,
} from '@/components/hablar-ui';
import { Button } from '@/components/ui';
import { type ActiveRecording, armMic, canRecord, disarmMic, readyClip, type RecordedClip, startRecording, warmMic } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import {
  CHATS_PER_DAY,
  conversationTitle,
  type DoneEvent,
  deadlineOf,
  end,
  bandOf,
  findScenario,
  scenarioAt,
  HablarError,
  type HablarKind,
  hint,
  type HintResult,
  loadConversation,
  messageLimitOf,
  newTurnId,
  reply,
  resolveAudio,
  signedHablarUrl,
  speak,
  startCache,
  todaysChats,
  tomasAudioPath,
  translate,
  warm,
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
import { usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The conversation (§2.3–2.4), as a call: Pancho big on the rosa, and only
// what he just said under him — her own lines aren't shown, and nothing is
// corrected while they talk (Pancho just says it back right, the way a
// porteño would; every line is graded once, for the summary). Turn-based and
// voice only: she taps the mic, talks, taps again. The recording goes to
// hablar-reply, which transcribes it and answers on the same stream. (A draft
// left over from an older build still shows for review after a reload.)
//
// A chat is measured in lines: eight, in a unit chat too (the server counts
// them too). Two before the end a pill over the dock says how many are left;
// Pancho's answer to the last one closes the chat, and the dock then says how
// many of the day's chats are left.
//
// The server also keeps a clock, only as a backstop for a chat left running.
// It isn't shown; it stops while the app is in the background and while it is
// Pancho's turn (her line is being answered, or he is speaking), and the
// paused seconds go up with the next request so the server can extend it.
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
};

type UserMsg = {
  role: 'user';
  key: string;
  text: string;
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

/** The scenario version a chat runs: the one of its level (hablar-start stores the version's band). */
const versionOf = (kind: string | undefined, topicId: string | null | undefined, level: string | null | undefined) => {
  const s = kind === 'scenario' ? findScenario(topicId) : undefined;
  return s ? scenarioAt(s, bandOf(level)) : undefined;
};
const WAVE_BARS = 18;
/** The call's Pancho: the onboarding mate loop cut out as a sticker on the
 *  call's pink (social/out/pancho-loop), and its first frame as the still. */
const CALL_CLIP = require('@/assets/videos/pancho-call.mp4');
const CALL_STILL = require('@/assets/images/pancho-call-still.png');
/** Seconds where he is back in the still pose: the start, just before the
 *  pour, just after it. On his turn the clip stops at the next one. */
const REST = [0, 3.8, 10.8];
/** Her turn starts here, a beat before the pour, so he pours at once. */
const POUR_FROM = 3.5;

export default function HablarChat() {
  useStatusBarColor(colors.primary);
  const insets = useSafeAreaInsets();
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
  /** Voice only: typing is just for a build that can't record. */
  const typing = !canRecord;
  const [typed, setTyped] = useState('');
  const [title, setTitle] = useState<{ text: string; role: string | null }>({
    text: '',
    role: null,
  });
  const [deadline, setDeadline] = useState<number>(0);
  /** Staff chat: no clock (deadline stays 0) and no day's count. */
  const [unlimited, setUnlimited] = useState(false);
  /** What kind of chat this is: a unit chat has no line count. Unknown until boot. */
  const [kind, setKind] = useState<HablarKind | null>(null);
  /** The day's chats left (Course and Speaking together), shown once the chat is over; null where it doesn't apply. */
  const [chatsLeft, setChatsLeft] = useState<number | null>(null);
  const { status: plan } = usePremium();
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

  const [sheet, setSheet] = useState<
    | { kind: 'end' }
    | null
  >(null);

  const playing = usePlaying();
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
  /** The server couldn't make out her last recording and she was asked to say it again: the next one is taken as heard. */
  const askedAgain = useRef(false);
  /** Total seconds the clock was stopped this chat. The server keeps the max it has seen, so this is cumulative. */
  const pausedTotal = useRef(0);
  /** What is stopping the clock right now (the app is away, it's Pancho's turn), and since when. */
  const holds = useRef({ n: 0, since: 0 });
  /** When the clock stopped, while it is (the backstop doesn't run out while stopped). */
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
        setKind(kind);
        setTitle({
          text: conversationTitle(kind, started.topic_id, started.title),
          role: versionOf(kind, started.topic_id, started.level)?.role_es ?? started.role_es ?? null,
        });
        setUnlimited(!!started.unlimited);
        if (started.deadline_at) setDeadline(new Date(started.deadline_at).getTime());
        // Keyed by its turn, as after a reload: the player keeps a clip's bytes
        // under its key, and one shared key replayed the last chat's opener.
        const openerKey = started.opener.turn_id ?? `opener-${sessionId}`;
        setMessages([
          {
            role: 'tomas',
            key: openerKey,
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
          void play(openerKey, async () => readyClip(openerPath) ?? resolveAudio(started.opener.audio_url));
        return;
      }
      const loaded = await loadConversation(sessionId).catch(() => null);
      if (!alive) return;
      if (!loaded) return setPhase('gone');
      const { conversation, turns } = loaded;
      if (conversation.ended_at) return router.replace(`/hablar-summary?session=${sessionId}`);
      const scenario = versionOf(conversation.kind, conversation.topic_id, conversation.level);
      setKind(conversation.kind);
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
      return say("I didn't hear you. Try again.");
    }
    if (!clip.size) {
      setPhase('idle');
      return say('The mic sent no sound. Check your microphone and try again.');
    }
    const check = await checkClip(clip, Date.now() - r.at);
    if (check !== 'ok') {
      setPhase('idle');
      return say(
        check === 'short' ? "I didn't hear you. Speak a little longer." : "I didn't hear you. Speak a little louder.",
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

  /** Her line and Pancho's answer, side by side in the thread. */
  const addTurn = (turnId: string, text: string) =>
    setMessages((ms) =>
      ms.some((m) => m.key === turnId)
        ? ms.map((m) => (m.key === turnId ? ({ ...m, text } as UserMsg) : m))
        : [
            ...ms,
            { role: 'user', key: turnId, text },
            { role: 'tomas', key: `${turnId}-tomas`, userTurnId: turnId, text: '', streaming: true },
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
    let unclear = false;
    let done: DoneEvent | null = null;
    abort.current = new AbortController();
    const handlers = {
      onTranscript: (text: string) => {
        heard = true;
        // Sent: the next recording is a new turn, not a re-record of this one.
        reRecordTurn.current = null;
        askedAgain.current = false;
        addTurn(turnId, text);
        setPhase('waiting');
      },
      onText: (_seq: number, delta: string) => {
        setPhase((p) => (p === 'waiting' ? 'streaming' : p));
        pendingText += delta;
        frame ??= requestAnimationFrame(flushText);
      },
      onTextFix: (_seq: number, from: string, to: string) => {
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
      },
      onAudio: (seq: number, mp3: string) => streamChunk(tkey, seq, mp3),
      onDone: (d: DoneEvent) => {
        done = d;
        flushText();
        settle(d);
      },
      onError: (err: { stage: string; retry: boolean; seq?: number }) => {
        // A failed reply sends no `done`, which retries below. A sentence
        // without voice is not worth interrupting her for.
        if (err.stage === 'tts' && err.seq !== undefined) streamSkip(tkey, err.seq);
      },
    };
    try {
      const args = { session_id: sessionId, turn_id: turnId, paused_seconds: takePaused() };
      const out = line && !heard
        ? await speak({ ...args, ...line, unclear: askedAgain.current ? 'take' : 'ask' }, handlers, abort.current.signal)
        : await reply(args, handlers, abort.current.signal);
      empty = out === 'empty';
      unclear = out === 'unclear';
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
      // Her lines for this chat are used (the server counts them too): the chat is over.
      if (e instanceof HablarError && e.status === 429 && e.body?.error === 'message_limit') {
        streamEnd(tkey);
        dropTurn(turnId);
        reRecordTurn.current = null;
        setPhase('ended');
        return;
      }
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
        return say('That was the last recording for this chat.');
      }
    }
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
      return say("I didn't hear you. Try again.");
    }
    if (unclear) {
      // Better to ask once than to correct a line she never said.
      askedAgain.current = true;
      dropTurn(turnId);
      setPhase('idle');
      return say("I didn't catch that. Say it again?");
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
    if (d.ended) {
      // Let him finish his goodbye, then the summary (which grades her lines).
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

  // --- derived ----------------------------------------------------------------------
  const busy = phase === 'waiting' || phase === 'streaming' || phase === 'transcribing';
  // Lines left in a Speaking-tab chat: hers in the thread, a line on its way included.
  const limit = messageLimitOf(kind ?? undefined);
  const linesLeft = limit === null || kind === null ? null : Math.max(0, limit - messages.filter((m) => m.role === 'user').length);
  /** All her lines are said, and nothing of the last one is still in flight (a chat loaded back after the end). */
  const outOfLines = linesLeft === 0 && !busy && phase !== 'recording';
  const micLocked = (timeUp || outOfLines) && phase !== 'recording' && phase !== 'draft';
  const over = phase === 'ended' || phase === 'ending' || micLocked;

  // Once the chat is over: how many of the day's chats are left, Course and
  // Speaking together (premium only; a free account's limit is its free chats,
  // which the tab shows).
  useEffect(() => {
    if (!over || kind === null || unlimited || plan !== 'premium') return;
    let alive = true;
    void todaysChats()
      .then((today) => alive && setChatsLeft(Math.max(0, CHATS_PER_DAY - today.length)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [over, kind, unlimited, plan]);

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
          title="Try again"
          onPress={() => {
            setPhase('idle');
            void startRec();
          }}
        />
        <Button title="End call" variant="ghost" onPress={() => void finish('user')} />
      </FullMessage>
    );
  }

  const current = [...messages].reverse().find((m): m is PanchoMsg => m.role === 'tomas');
  const thinking = phase === 'waiting' || (phase === 'streaming' && !current?.text);
  const currentPlaying = current && playing?.key === current.key;
  const currentEn = current && showEn.has(current.key) ? current.textEn : null;

  return (
    <SafeAreaView style={[styles.safe, styles.callBg]} edges={['top', 'left', 'right']}>
      {/* On iOS the keyboard covers the screen instead of shrinking it (typing is only for builds that can't record). */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* The call: Pancho, big, and only what he just said. */}
      <View style={styles.call}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setSheet({ kind: 'end' })}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.headerIcon, { transform: [{ scale: pressed ? 0.94 : 1 }] }, webPress]}>
            <Ionicons name="chevron-back" size={24} color={colors.onPrimary} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={styles.callLabel}>Call</Text>
            <FitText style={styles.headerName} lines={1}>
              Pancho
            </FitText>
            <FitText style={styles.headerRole} lines={1}>
              {title.role ? `${title.text} · ${title.role}` : title.text}
            </FitText>
          </View>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.stage}>
          <Talking active={!!currentPlaying || phase === 'streaming'}>
            <CallPancho busy={panchoTurn} />
          </Talking>

          <ScrollView
            style={styles.lineScroll}
            contentContainerStyle={styles.lineWrap}
            showsVerticalScrollIndicator={false}>
            {thinking ? (
              <View style={styles.thinking} accessibilityLabel="Pancho is thinking">
                <ThinkingDots color={colors.onPrimary} />
              </View>
            ) : current ? (
              <Appear key={current.key}>
                <Text style={styles.line} accessibilityLiveRegion="polite">
                  {current.text}
                </Text>
                {current.failed ? <Text style={styles.lineSub}>The connection dropped.</Text> : null}
                {currentEn ? <Text style={styles.lineSub}>{currentEn}</Text> : null}
              </Appear>
            ) : null}
          </ScrollView>

          {current && !current.streaming && !current.failed && !thinking ? (
            <View style={styles.lineTools}>
              <CallPill
                icon={currentPlaying ? 'stop' : 'replay'}
                label={currentPlaying ? 'Stop' : 'Replay'}
                active={!!currentPlaying}
                onPress={() => void onPlay(current, false)}
              />
              <CallPill
                icon="translate"
                label="English"
                active={!!currentEn}
                busy={translating === current.key}
                onPress={() => void onTranslate(current)}
              />
            </View>
          ) : null}
        </View>

        {draft ? (
          <Appear key={`draft-${draft.turnId}-${draft.text}`}>
            <View style={styles.floatCard}>
              <Text style={styles.draftLabel}>Did you say this?</Text>
              <Text style={styles.draftText}>{draft.text}</Text>
              <View style={styles.draftActions}>
                <Pressable
                  onPress={toggleMic}
                  disabled={micLocked}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.redo, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
                  <MaterialCommunityIcons name="refresh" size={17} color={colors.ink} />
                  <Text style={styles.redoText}>Record again</Text>
                </Pressable>
                <Pressable
                  onPress={send}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.sendBtn, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
                  <RosaFill round={22} />
                  <Text style={styles.sendText}>Send</Text>
                  <MaterialCommunityIcons name="send" size={16} color={colors.onPrimary} />
                </Pressable>
              </View>
            </View>
          </Appear>
        ) : hintState.data && hintState.level > 0 ? (
          <Appear key="hint">
            <View style={[styles.hintCard, styles.floatCard]}>
              <View style={styles.hintHead}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={colors.onPastel} />
                <Text style={styles.hintLabel}>Hint</Text>
                <View style={styles.hintSteps}>
                  {[1, 2, 3].map((n) => (
                    <View key={n} style={[styles.hintStep, n <= hintState.level && { backgroundColor: colors.onPastel }]} />
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
      </View>

      {/* Bottom dock */}
      <View style={[styles.bar, { paddingBottom: 8 + insets.bottom }]}>
        {notice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        {phase === 'retry' ? (
          <View style={styles.barStack}>
            <Text style={styles.caption}>The connection dropped.</Text>
            <Button title="Try again" onPress={retry} />
          </View>
        ) : over ? (
          <View style={styles.barStack}>
            <Text style={styles.caption}>
              {timeUp && phase !== 'ended' && !outOfLines ? "Time's up." : 'Pancho ended the call.'}
            </Text>
            <Button title="See summary" loading={phase === 'ending'} onPress={() => void finish('time')} />
            {chatsLeft !== null ? (
              <View style={styles.dayLeft} accessible accessibilityLabel={`${chatsLeft} ${chatsLeft === 1 ? 'chat' : 'chats'} left today`}>
                <DayPips used={CHATS_PER_DAY - chatsLeft} small />
                <Text style={styles.dayLeftText}>
                  {chatsLeft === 0 ? 'No chats left today' : `${chatsLeft} ${chatsLeft === 1 ? 'chat' : 'chats'} left today`}
                </Text>
              </View>
            ) : null}
          </View>
        ) : typing && phase !== 'recording' ? (
          // Only where the phone can't record: the call is voice only.
          <>
            <View style={styles.typeRow}>
              <TextInput
                value={typed}
                onChangeText={setTyped}
                placeholder="Write to Pancho in Spanish…"
                placeholderTextColor={colors.muted}
                multiline
                maxLength={300}
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
                <SideButton icon="close" label="Cancel" onPress={cancelRecording} accessibilityLabel="Cancel recording" />
              ) : (
                <SideButton
                  icon="phone-hangup"
                  label="End"
                  tone="danger"
                  disabled={phase === 'boot'}
                  onPress={() => setSheet({ kind: 'end' })}
                  accessibilityLabel="End the call"
                />
              )}
            </View>
            {phase === 'recording' ? (
              <RecordingMeter since={rec.current?.at ?? Date.now()} level={() => rec.current?.rec?.level() ?? 0} />
            ) : (
              <Text style={styles.caption}>
                {phase === 'transcribing'
                  ? 'Listening…'
                  : phase === 'waiting' || phase === 'streaming'
                    ? 'Pancho is talking…'
                    : phase === 'draft'
                      ? 'Check it and send'
                      : wrapUp
                        ? 'Pancho is wrapping up'
                        : 'Tap to talk'}
              </Text>
            )}
          </>
        )}
      </View>

      </KeyboardAvoidingView>

      {/* Volver / ⋮ → end */}
      <Sheet open={sheet?.kind === 'end'} onClose={() => setSheet(null)} title="End the call?">
        <Text style={styles.sheetBody}>
          {unlimited
            ? "You'll see your summary."
            : `You'll see your summary. It counts as one of today's ${CHATS_PER_DAY} chats.`}
        </Text>
        <Button
          title="End call"
          onPress={() => {
            setSheet(null);
            void finish('user');
          }}
        />
        <Button title="Keep talking" variant="ghost" onPress={() => setSheet(null)} />
      </Sheet>
    </SafeAreaView>
  );
}

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

/** Pancho sipping and pouring on her turn. On his (thinking or speaking) the
 *  clip runs on to the next resting pose and stops there, so he never pours
 *  while he talks. */
function CallPancho({ busy }: { busy: boolean }) {
  const reduced = useReducedMotion();
  const player = useVideoPlayer(CALL_CLIP, (p) => {
    p.muted = true;
    p.loop = true;
    p.audioMixingMode = 'mixWithOthers';
    p.timeUpdateEventInterval = 0.1;
  });
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    if (reduced) return player.pause();
    if (busy) return;
    // Stopped on a resting pose: every rest is the same pose, so skip to the pour.
    if (!player.playing) player.currentTime = POUR_FROM;
    player.play();
  }, [busy, reduced, player]);

  useEffect(() => {
    let last = 0;
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      const prev = last;
      last = currentTime;
      if (!busyRef.current || !player.playing) return;
      const wrapped = currentTime < prev;
      const hit = REST.find((s) => (wrapped ? s > prev || s <= currentTime : s > prev && s <= currentTime));
      if (hit === undefined) return;
      player.pause();
      player.currentTime = hit;
    });
    return () => sub.remove();
  }, [player]);

  return (
    <View style={styles.callArt} accessible accessibilityRole="image" accessibilityLabel="Pancho, drinking mate">
      {/* The still sits underneath until the first frame is up. */}
      <Image source={CALL_STILL} style={StyleSheet.absoluteFill} contentFit="contain" />
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
        surfaceType="textureView"
      />
    </View>
  );
}

/** Pancho, a touch bigger and back while he talks: a slow breath, not a bounce. */
function Talking({ active, children }: { active: boolean; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active || reduced) {
      Animated.timing(t, { toValue: 0, duration: 200, easing: Easing.bezier(0.23, 1, 0.32, 1), useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, reduced, t]);
  return (
    <Animated.View style={{ transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }] }}>
      {children}
    </Animated.View>
  );
}

/** Replay / English under Pancho's line, on the call's color. */
function CallPill({
  icon,
  label,
  active,
  busy,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  busy?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        { transform: [{ scale: pressed ? 0.96 : 1 }] },
        webPress,
      ]}>
      {busy ? (
        <ActivityIndicator size="small" color={active ? colors.primary : colors.onPrimary} />
      ) : (
        <MaterialCommunityIcons name={icon} size={18} color={active ? colors.primary : colors.onPrimary} />
      )}
      <Text style={[styles.pillText, active && { color: colors.primary }]}>{label}</Text>
    </Pressable>
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
  tone?: 'plain' | 'accent' | 'danger';
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const fg = colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={!!(disabled || busy)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.side,
        disabled && { opacity: 0.4 },
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
        webPress,
      ]}>
      <View
        style={[
          styles.sideCircle,
          tone === 'accent' && { backgroundColor: pastel.butter },
          tone === 'danger' && { backgroundColor: colors.danger },
        ]}>
        {busy ? (
          <ActivityIndicator size="small" color={fg} />
        ) : (
          <MaterialCommunityIcons name={icon} size={22} color={tone === 'danger' ? colors.onPrimary : fg} />
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
      <Text style={[styles.caption, { color: colors.dangerInk }]}>{fmt(seconds * 1000)} · tap to send</Text>
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
  callBg: { backgroundColor: colors.primary },
  call: { flex: 1, maxWidth: 640, width: '100%', alignSelf: 'center' },
  callLabel: { ...font.body[700], fontSize: 13, color: colors.onPrimary, opacity: 0.75, textAlign: 'center' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  callArt: { width: 240, height: 240 },
  lineScroll: { flexGrow: 0, maxHeight: 220, alignSelf: 'stretch' },
  lineWrap: { alignItems: 'center', paddingVertical: 4 },
  line: {
    ...font.display[800],
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.2,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  lineSub: {
    ...font.body[600],
    fontSize: 16,
    lineHeight: 22,
    color: colors.onPrimary,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
  },
  lineTools: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  pillActive: { backgroundColor: colors.onPrimary, borderColor: colors.onPrimary },
  pillText: { ...font.body[800], fontSize: 14, color: colors.onPrimary },
  floatCard: { marginHorizontal: 16, marginBottom: 14, gap: 8, padding: 16, borderRadius: radius.lg, backgroundColor: colors.card },

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
  headerTitle: { flex: 1, minWidth: 0, alignItems: 'center' },
  headerName: {
    ...font.display[800],
    fontSize: 19,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  headerRole: { ...font.body[700], fontSize: 13, color: colors.onPrimary, opacity: 0.75, textAlign: 'center' },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
  },

  /** A correct line that still gets the Argentine way: the card without the red. */

  draftLabel: {
    ...font.body[800],
    fontSize: 13,
    color: colors.muted,
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
    // Sits on top of the dock whatever its own height: a long line wraps to two.
    bottom: '100%',
    marginBottom: 10,
    alignSelf: 'center',
    maxWidth: '92%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    boxShadow: clay.float,
  },
  noticeText: { ...font.body[700], color: colors.bg, fontSize: 17, lineHeight: 22, textAlign: 'center' },
  dayLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dayLeftText: { ...font.body[800], fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] },

  sheetBody: { ...font.body[600], fontSize: 15, lineHeight: 22, color: colors.muted },

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

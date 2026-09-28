import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Diff,
  DiloButton,
  type IconName,
  MicButton,
  Sheet,
  ThinkingDots,
  PanchoAvatar,
  RosaFill,
  webPress,
} from '@/components/hablar-ui';
import { Button } from '@/components/ui';
import { type ActiveRecording, canRecord, type RecordedClip, startRecording } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import {
  conversationTitle,
  type DoneEvent,
  deadlineOf,
  end,
  type Feedback,
  bandOf,
  findScenario,
  scenarioAt,
  type Goal,
  HablarError,
  hint,
  type HintResult,
  loadConversation,
  newTurnId,
  reply,
  resolveAudio,
  signedHablarUrl,
  startCache,
  tomasAudioPath,
  transcribe,
  translate,
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
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, gradients, pastel, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The conversation (§2.3–2.4). Turn-based: she records and taps to send; the
// transcript goes straight to Pancho, whose reply streams in as text while his
// voice starts on the first sentence; the correction chip fills a moment later.
// (A draft left over from an older build still shows for review after a reload.)
//
// The server owns the clock. The timer here is a display: it counts down to
// `deadline_at`, stops while the app is in the background, and reports those
// paused seconds with the next request so the server can extend the deadline.
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
  feedback: Feedback | null;
  pending: boolean;
};
/** A goal she completed this session, shown as a line in the thread. */
type GoalMsg = { role: 'goal'; key: string; text: string };
type Msg = PanchoMsg | UserMsg | GoalMsg;

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
  const [draft, setDraft] = useState<{ turnId: string; text: string } | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsDone, setGoalsDone] = useState<string[]>([]);
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
  /** Older Pancho messages she tapped to show their ▶ / 0.7× / EN row. */
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [sheet, setSheet] = useState<
    | { kind: 'correction'; key: string; explain: boolean }
    | { kind: 'better'; key: string }
    | { kind: 'message'; key: string }
    | { kind: 'end' }
    | null
  >(null);

  const playing = usePlaying();
  const scroll = useRef<ScrollView>(null);
  const rec = useRef<{
    rec: ActiveRecording;
    at: number;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const reRecordTurn = useRef<string | null>(null);
  /** Total seconds spent in the background this chat. The server keeps the max it has seen, so this is cumulative. */
  const pausedTotal = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const goalsRef = useRef<Goal[]>([]);
  const doneRef = useRef<string[]>([]);

  const say = useCallback((text: string) => {
    setNotice(text);
    setTimeout(() => setNotice((n) => (n === text ? null : n)), 3200);
  }, []);

  const takePaused = () => Math.floor(pausedTotal.current);

  // --- boot: from the start hand-off, or from the tables after a reload ------
  useEffect(() => {
    if (!sessionId) return setPhase('gone');
    let alive = true;
    (async () => {
      const started = startCache.get(sessionId);
      if (started) {
        const kind = started.kind ?? 'scenario';
        setTitle({
          text: conversationTitle(kind, started.topic_id),
          role: versionOf(kind, started.topic_id, started.level)?.role_es ?? null,
        });
        goalsRef.current = started.goals ?? [];
        setGoals(started.goals ?? []);
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
        // Pancho speaks first. The context was woken in the Empezar tap.
        if (started.opener.audio_url) void play('opener', async () => resolveAudio(started.opener.audio_url));
        return;
      }
      const loaded = await loadConversation(sessionId).catch(() => null);
      if (!alive) return;
      if (!loaded) return setPhase('gone');
      const { conversation, turns } = loaded;
      if (conversation.ended_at) return router.replace(`/hablar-summary?session=${sessionId}`);
      const scenario = versionOf(conversation.kind, conversation.topic_id, conversation.level);
      setTitle({
        text: conversationTitle(conversation.kind, conversation.topic_id),
        role: scenario?.role_es ?? null,
      });
      goalsRef.current = scenario?.goals ?? [];
      doneRef.current = conversation.goals_done ?? [];
      setGoals(scenario?.goals ?? []);
      setGoalsDone(conversation.goals_done ?? []);
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

  // --- the clock: pauses while the app is in the background ---------------------
  // The ticking display is its own component (ChatTimer), so the countdown
  // re-renders one chip, not the whole chat, every half second.
  useEffect(() => {
    let hiddenAt: number | null = null;
    const away = () => {
      if (hiddenAt === null) hiddenAt = Date.now();
    };
    const back = () => {
      if (hiddenAt === null) return;
      const gap = Date.now() - hiddenAt;
      hiddenAt = null;
      pausedTotal.current += gap / 1000;
      setDeadline((d) => (d ? d + gap : d));
    };
    if (Platform.OS === 'web') {
      if (typeof document === 'undefined') return;
      const onVis = () => (document.hidden ? away() : back());
      document.addEventListener('visibilitychange', onVis);
      return () => document.removeEventListener('visibilitychange', onVis);
    }
    const sub = AppState.addEventListener('change', (state) => (state === 'background' ? away() : state === 'active' && back()));
    return () => sub.remove();
  }, []);

  useEffect(
    () => () => {
      // Leaving the screen: silence Pancho, drop a recording in progress.
      rec.current?.rec.cancel();
      abort.current?.abort();
      stopAll();
      whenIdle(null);
    },
    [],
  );

  // Flips once, when the deadline passes — the deadline moves on a pause.
  const [timeUp, setTimeUp] = useState(false);
  useEffect(() => {
    if (!deadline) return;
    const left = deadline - Date.now();
    setTimeUp(left <= 0);
    if (left <= 0) return;
    const id = setTimeout(() => setTimeUp(true), left);
    return () => clearTimeout(id);
  }, [deadline]);

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
      rec.current?.rec.cancel();
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
  const stopRecording = async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    clearTimeout(r.timer);
    setPhase('transcribing');
    let clip: RecordedClip;
    try {
      clip = await r.rec.stop();
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
    try {
      const res = await transcribe({
        clip,
        session_id: sessionId,
        turn_id: turnId,
        purpose: 'turn',
        paused_seconds: takePaused(),
      });
      if (!res.text || res.status === 'empty') {
        setPhase('idle');
        return say('No te escuché.');
      }
      sendTurn(turnId, res.text);
    } catch (e) {
      if (e instanceof HablarError && (e.status === 409 || e.status === 410 || e.status === 403)) {
        setPhase('ended');
        return;
      }
      setPhase('idle');
      say("Couldn't transcribe that. Try again.");
    }
  };

  const startRec = async () => {
    stopAll();
    try {
      const r = await startRecording();
      rec.current = {
        rec: r,
        at: Date.now(),
        timer: setTimeout(() => void stopRecording(), MAX_RECORD_MS),
      };
      setPhase('recording');
    } catch (e) {
      const name = e && typeof e === 'object' ? (e as Error).name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError')
        setPhase('denied');
      else say("Couldn't open the microphone.");
    }
  };

  const toggleMic = () => {
    if (phase === 'recording') {
      prime(); // inside the tap: the transcript is sent without another one
      return void stopRecording();
    }
    if (phase === 'draft' && draft) {
      reRecordTurn.current = draft.turnId;
      setDraft(null);
    }
    void startRec();
  };

  const cancelRecording = () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    clearTimeout(r.timer);
    r.rec.cancel();
    reRecordTurn.current = null;
    setPhase('idle');
  };

  // --- the turn -----------------------------------------------------------------
  const patch = (key: string, fn: (m: Msg) => Msg) => setMessages((ms) => ms.map((m) => (m.key === key ? fn(m) : m)));

  /** New goals get a line in the thread, right under the turn that did them. */
  const addGoalsDone = (ids: string[], turnId: string) => {
    const fresh = ids.filter((id) => !doneRef.current.includes(id));
    if (!fresh.length) return;
    doneRef.current = [...doneRef.current, ...fresh];
    setGoalsDone(doneRef.current);
    const lines: GoalMsg[] = fresh.map((id) => ({
      role: 'goal',
      key: `goal-${id}`,
      text: goalsRef.current.find((g) => g.id === id)?.es ?? '',
    }));
    setMessages((ms) => {
      const at = ms.findIndex((m) => m.key === turnId);
      return at < 0 ? [...ms, ...lines] : [...ms.slice(0, at + 1), ...lines, ...ms.slice(at + 1)];
    });
  };

  const runReply = async (turnId: string, attempt = 0): Promise<void> => {
    const tkey = `${turnId}-tomas`;
    streamStart(tkey);
    patch(tkey, (m) => ({ ...m, text: '', streaming: true, failed: false }) as PanchoMsg);
    setPhase('waiting');
    let failed = false;
    let fatal = false;
    let done: DoneEvent | null = null;
    abort.current = new AbortController();
    try {
      await reply(
        {
          session_id: sessionId,
          turn_id: turnId,
          paused_seconds: takePaused(),
        },
        {
          onText: (_seq, delta) => {
            setPhase((p) => (p === 'waiting' ? 'streaming' : p));
            patch(tkey, (m) => ({ ...m, text: m.text + delta }));
            toBottom();
          },
          onTextFix: (_seq, from, to) => {
            if (!from) return;
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
          onAudio: (seq, mp3) => streamChunk(tkey, seq, mp3),
          onFeedback: (fb) => {
            patch(turnId, (m) => ({ ...m, feedback: fb, pending: false }) as UserMsg);
            if (fb.goals_done?.length) addGoalsDone(fb.goals_done, turnId);
          },
          onDone: (d) => {
            done = d;
            if (d.goals_done) addGoalsDone(d.goals_done, turnId);
          },
          onError: (err) => {
            // Only a failed reply is fatal to the turn. A sentence without
            // voice or a missing badge is not worth interrupting her for.
            if (err.stage === 'claude') failed = true;
            else if (err.stage === 'tts' && err.seq !== undefined) streamSkip(tkey, err.seq);
            else if (err.stage === 'feedback') patch(turnId, (m) => ({ ...m, pending: false }) as UserMsg);
          },
        },
        abort.current.signal,
      );
    } catch (e) {
      failed = true;
      // 409 "time_up" / "ended" closes the chat; a 409 with retry:true means
      // the same turn is still being answered, so it's worth another try.
      if (
        e instanceof HablarError &&
        (e.status === 409 || e.status === 410 || e.status === 403) &&
        e.body?.retry !== true
      )
        fatal = true;
      if ((e as Error)?.name === 'AbortError') return;
    }
    streamEnd(tkey);

    if (fatal) {
      setPhase('ended');
      return;
    }
    const d = done as DoneEvent | null;
    if (failed || !d) {
      // One quiet retry with the same turn_id: the server replays a turn it
      // already finished, or runs it again if it didn't.
      if (attempt === 0) return runReply(turnId, 1);
      patch(tkey, (m) => ({ ...m, streaming: false, failed: true }) as PanchoMsg);
      setPhase('retry');
      return;
    }
    patch(tkey, (m) => ({
      ...(m as PanchoMsg),
      streaming: false,
      turnId: d.tomas_turn_id,
      audioPath: d.audio_path ?? (userId ? tomasAudioPath(userId, sessionId, turnId) : null),
    }));
    patch(turnId, (m) => ({ ...m, pending: false }) as UserMsg);
    if (d.wrap_up) setWrapUp(true);
    if (d.ended) {
      setPhase('ended');
      // Let him finish his goodbye, then the summary.
      whenIdle(() => setTimeout(() => void finish('time'), 1200));
      if (!nowPlaying()) setTimeout(() => void finish('time'), 2500);
    } else setPhase('idle');
  };

  const sendTurn = (turnId: string, text: string) => {
    setDraft(null);
    reRecordTurn.current = null;
    setHintState({ data: null, level: 0, loading: false });
    setMessages((ms) => [
      ...ms,
      { role: 'user', key: turnId, text, feedback: null, pending: true },
      {
        role: 'tomas',
        key: `${turnId}-tomas`,
        userTurnId: turnId,
        text: '',
        streaming: true,
      },
    ]);
    toBottom();
    void runReply(turnId);
  };

  /** A restored draft: she reviews it and taps Enviar. */
  const send = () => {
    if (!draft) return;
    prime(); // inside the tap: Pancho's first sentence must be allowed to sound
    sendTurn(draft.turnId, draft.text);
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

  // --- derived ----------------------------------------------------------------------
  const sheetMsg = sheet && 'key' in sheet ? (messages.find((m) => m.key === sheet.key) as Msg | undefined) : undefined;
  const busy = phase === 'waiting' || phase === 'streaming' || phase === 'transcribing';
  const micLocked = timeUp && phase !== 'recording' && phase !== 'draft';
  const currentGoal = goals.find((g) => !goalsDone.includes(g.id));
  const goalsDoneCount = goals.filter((g) => goalsDone.includes(g.id)).length;
  const lastPanchoKey = [...messages].reverse().find((m) => m.role === 'tomas')?.key;

  // --- screens that replace the chat ----------------------------------------------
  if (phase === 'gone') {
    return (
      <FullMessage icon="chatbubble-ellipses-outline" title="This chat isn't here" body="It may have ended already.">
        <Button title="Back to Speaking" onPress={() => router.dismissTo('/hablar')} />
      </FullMessage>
    );
  }
  if (!canRecord && phase !== 'boot') {
    return (
      <FullMessage
        icon="phone-portrait-outline"
        title="This browser can't record"
        body="Open Posta on your phone to talk with Pancho.">
        <Button title="End chat" variant="secondary" onPress={() => void finish('user')} />
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
        <Button title="End chat" variant="ghost" onPress={() => void finish('user')} />
      </FullMessage>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
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
          <ChatTimer deadline={deadline} />
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

      {goals.length ? (
        <View style={styles.goalCard}>
          <View style={styles.goalHead}>
            <Text style={styles.goalLabel}>
              {currentGoal ? `Goal ${goalsDoneCount + 1} of ${goals.length}` : 'All goals done'}
            </Text>
            <View style={styles.segments}>
              {goals.map((g) => (
                <View
                  key={g.id}
                  style={[
                    styles.segment,
                    goalsDone.includes(g.id)
                      ? { backgroundColor: colors.success }
                      : g.id === currentGoal?.id && {
                          backgroundColor: colors.primary,
                        },
                  ]}
                />
              ))}
            </View>
          </View>
          <Text style={styles.goalMain}>{currentGoal ? currentGoal.en : '¡Bien ahí!'}</Text>
          <Text style={styles.goalSub}>
            {currentGoal ? currentGoal.es : 'Keep chatting, or end the chat to see your summary.'}
          </Text>
        </View>
      ) : null}

      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}>
        {messages.map((m) => {
          if (m.role === 'goal') {
            return (
              <Appear key={m.key}>
                <View style={styles.goalLine}>
                  <MaterialCommunityIcons name="check-bold" size={13} color={colors.success} />
                  <FitText style={styles.goalLineText} lines={2}>
                    Goal done · {m.text}
                  </FitText>
                </View>
              </Appear>
            );
          }
          if (m.role === 'tomas') {
            const tools = !m.streaming && !m.failed && (m.key === lastPanchoKey || revealed.has(m.key));
            return (
              <Appear key={m.key}>
                <View style={styles.tomasRow}>
                  <PanchoAvatar size={28} />
                  <Pressable
                    onPress={() =>
                      m.key !== lastPanchoKey &&
                      setRevealed((s) => {
                        const next = new Set(s);
                        if (next.has(m.key)) next.delete(m.key);
                        else next.add(m.key);
                        return next;
                      })
                    }
                    accessibilityHint={m.key === lastPanchoKey ? undefined : 'Shows play and translate'}
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
                    {showEn.has(m.key) && m.textEn ? <Text style={styles.english}>{m.textEn}</Text> : null}
                    {tools ? (
                      <View style={styles.tools}>
                        <Tool
                          active={playing?.key === m.key && !playing.slow}
                          onPress={() => void onPlay(m, false)}
                          accessibilityLabel="Play">
                          <MaterialCommunityIcons
                            name={playing?.key === m.key && !playing.slow ? 'stop' : 'play'}
                            size={20}
                            color={colors.primary}
                          />
                        </Tool>
                        <Tool
                          active={playing?.key === m.key && playing.slow}
                          onPress={() => void onPlay(m, true)}
                          accessibilityLabel="Play slowly">
                          <Text style={styles.toolText}>0.7×</Text>
                        </Tool>
                        <Tool
                          active={showEn.has(m.key)}
                          onPress={() => void onTranslate(m)}
                          accessibilityLabel={showEn.has(m.key) ? 'Hide translation' : 'Translate'}>
                          {translating === m.key ? (
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
          }
          const fb = m.feedback;
          return (
            <Appear key={m.key}>
              <View style={styles.userRow}>
                <Pressable
                  onLongPress={() => setSheet({ kind: 'message', key: m.key })}
                  accessibilityHint="Long-press to copy"
                  style={styles.userBubble}>
                  <LinearGradient colors={gradients.deep} style={styles.userFill} pointerEvents="none" />
                  <Text style={styles.userText}>{m.text}</Text>
                </Pressable>
                {m.pending || fb ? (
                  <View style={styles.chips}>
                    {m.pending ? (
                      <View style={[styles.chip, styles.chipQuiet]} accessibilityLabel="Checking what you said">
                        <ThinkingDots />
                      </View>
                    ) : fb ? (
                      <Chip
                        tone={fb.has_error ? 'fix' : 'ok'}
                        icon={fb.has_error ? undefined : 'check-bold'}
                        label={fb.has_error ? 'See the fix' : 'Correct'}
                        onPress={() =>
                          setSheet({
                            kind: 'correction',
                            key: m.key,
                            explain: false,
                          })
                        }
                      />
                    ) : null}
                    {!m.pending && fb?.better ? (
                      <Chip
                        tone="local"
                        icon="creation"
                        label="Like a local"
                        onPress={() => setSheet({ kind: 'better', key: m.key })}
                      />
                    ) : null}
                  </View>
                ) : null}
              </View>
            </Appear>
          );
        })}

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
                <View style={styles.side} />
              )}
            </View>
            {phase === 'recording' ? (
              <RecordingMeter since={rec.current?.at ?? Date.now()} level={() => rec.current?.rec.level() ?? 0} />
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

      {/* ✏️ correction */}
      <Sheet open={sheet?.kind === 'correction'} onClose={() => setSheet(null)} title="Correction">
        {sheetMsg?.role === 'user' ? (
          sheetMsg.pending ? (
            <Text style={styles.sheetBody}>Checking what you said…</Text>
          ) : !sheetMsg.feedback ? (
            <Text style={styles.sheetBody}>No feedback for this one.</Text>
          ) : !sheetMsg.feedback.has_error ? (
            <>
              <Text style={styles.sheetBig}>{sheetMsg.text}</Text>
              <Text style={styles.sheetGood}>¡Perfecto! Nothing to fix.</Text>
            </>
          ) : (
            <>
              <Diff parts={wordDiff(sheetMsg.text, sheetMsg.feedback.corrected)} />
              {sheet?.kind === 'correction' && sheet.explain ? (
                <Text style={styles.sheetBody}>{sheetMsg.feedback.why_en}</Text>
              ) : (
                <Button
                  title="Explain this feedback"
                  variant="secondary"
                  onPress={() =>
                    setSheet({
                      kind: 'correction',
                      key: sheetMsg.key,
                      explain: true,
                    })
                  }
                />
              )}
            </>
          )
        ) : null}
      </Sheet>

      {/* 🪄 better phrasing */}
      <Sheet open={sheet?.kind === 'better'} onClose={() => setSheet(null)} title="A more natural way">
        {sheetMsg?.role === 'user' ? (
          sheetMsg.pending ? (
            <Text style={styles.sheetBody}>Thinking of a better way to say it…</Text>
          ) : sheetMsg.feedback?.better ? (
            <>
              <Text style={styles.sheetBig}>{sheetMsg.feedback.better}</Text>
              {(sheetMsg.feedback as Feedback & { better_en?: string }).better_en ? (
                <Text style={styles.sheetBody}>
                  {(sheetMsg.feedback as Feedback & { better_en?: string }).better_en}
                </Text>
              ) : null}
              <DiloButton key={sheetMsg.key} sessionId={sessionId} target={sheetMsg.feedback.better} />
            </>
          ) : (
            <Text style={styles.sheetBody}>Nothing to add. That already sounds natural.</Text>
          )
        ) : null}
      </Sheet>

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

/** ▶ / 0.7× / EN inside Pancho's bubble. */
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

/** Labeled chip under her message: the correction, or the local way to say it. */
function Chip({
  tone,
  icon,
  label,
  onPress,
}: {
  tone: 'ok' | 'fix' | 'local';
  icon?: IconName;
  label: string;
  onPress: () => void;
}) {
  const fg = tone === 'ok' ? colors.success : tone === 'fix' ? colors.dangerInk : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        tone === 'fix' && { backgroundColor: colors.dangerSoft },
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      {tone === 'fix' ? (
        <View style={styles.chipDot} />
      ) : icon ? (
        <MaterialCommunityIcons name={icon} size={15} color={fg} />
      ) : null}
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
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
function ChatTimer({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const remaining = deadline ? Math.max(0, deadline - now) : 5 * 60_000;
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
const DOCK_SHADOW = 'inset 0 3px 0 rgba(255, 255, 255, 0.7), 0 -10px 24px -12px rgba(120, 70, 40, 0.3)';

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

  goalCard: {
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    maxWidth: 608,
    alignSelf: 'stretch',
    boxShadow: clay.surface,
  },
  goalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalLabel: {
    ...font.body[800],
    fontSize: 13,
    color: colors.muted,
  },
  segments: { flexDirection: 'row', gap: 4 },
  segment: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
  },
  goalMain: { ...font.display[700], fontSize: 18, color: colors.ink, marginTop: 6 },
  goalSub: { ...font.body[600], fontSize: 13, color: colors.muted, marginTop: 1 },

  goalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    maxWidth: '90%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  goalLineText: {
    ...font.body[800],
    fontSize: 13,
    color: colors.success,
    flexShrink: 1,
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
  tomasText: { ...font.body[600], fontSize: 17, lineHeight: 24, color: colors.ink },
  english: {
    ...font.body[500],
    fontSize: 14,
    lineHeight: 20,
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
  chips: { flexDirection: 'row', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  chipQuiet: {
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  chipText: { ...font.body[800], fontSize: 14 },
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
  userText: { ...font.body[600], fontSize: 17, lineHeight: 24, color: colors.onPrimary },

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
  draftText: { ...font.body[600], fontSize: 17, lineHeight: 24, color: colors.ink },
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

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { ExerciseFrame, type Verdict } from '@/components/exercise-frame';
import { LessonComplete } from '@/components/lesson-complete';
import { LoadingVideo } from '@/components/loading-video';
import { StreakCelebration } from '@/components/streak-celebration';
import { Button, Panel } from '@/components/ui';
import { playAudio, preloadAudio, stopAudio, type AudioFailure } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { localDateStr } from '@/lib/dates';
import { goBack } from '@/lib/nav';
import { notifyEvent } from '@/lib/push';
import { buildLesson } from '@/lib/lesson';
import {
  buildFreeSession,
  buildSession,
  buildTiles,
  isPhrase,
  pickImposter,
  pickOptions,
  type SessionItem,
  typedAnswerMatches,
  wordPool,
} from '@/lib/session';
import {
  gapOptions,
  meaningOptions,
  missedForms,
  recordShown,
  sentenceTiles,
  tokenIndexOf,
  tokenHead,
  tokenTail,
  tokenWord,
  type Option,
} from '@/lib/sentences';
import { schedule } from '@/lib/srs';
import { streakStatus } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { colors, radius, shadow } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';
import type { Form, FormState, Rating, Sentence, Streak, Tip } from '@/lib/types';

type QueueItem = SessionItem & { isIntro?: boolean; isRetry?: boolean };

/** Forms an item drills — matching and sentences cover their whole group. */
const formsOf = (item: QueueItem): Form[] => item.group ?? [item.form];

/** Whether an exercise counts towards a form's grade. Introductions — the
 *  plain screen and the sentence that stands in for it — do not, and neither
 *  does a tip, which asks nothing. */
const graded = (item: QueueItem) =>
  !item.isIntro && item.mode !== 'sentence_intro' && item.mode !== 'tip';

/** Lapses at which a word is reported as a leech (and again at every multiple).
 *  Anki's default is 8; four is enough when someone can actually rewrite the
 *  sentences that teach it. */
const LEECH_LAPSES = 4;

export default function Practice() {
  // The gradient is inverted — pale at the top edge — so the strip above
  // matches `bg` here like everywhere else (iOS 26 freezes one strip colour
  // per session; every screen having a pale top is what makes it fit).
  useStatusBarColor(colors.bg);
  const { profile } = useAuth();
  // `?lesson=<id>` plays that lesson off the path. Without it this is a
  // practice round — everything due, from the Practice button. Either one
  // finished credits the day, and a second round on a comeback day buys the
  // lost streak back (finish_lesson).
  // `again=1` marks a round entered straight from the "Una clase más!"
  // screen, which just said everything the gate would say.
  const { lesson: lessonId, again } = useLocalSearchParams<{ lesson?: string; again?: string }>();
  const isAgain = again === '1';
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState<{
    streak: number;
    previous: number;
    /** Set mid-comeback: the banked run one more class would recover. */
    oneMore?: number;
  } | null>(null);
  /** The loading clip is watched to the end before the first exercise shows. */
  const [clipPlayed, setClipPlayed] = useState(false);
  /** Set by the Dale! on the finish screen, when there is a streak to show. */
  const [celebrating, setCelebrating] = useState(false);
  /** A frozen streak stops her at the door: what she lost, and the way back.
   *  `undefined` while the answer is in flight — the doorway holds still until
   *  it lands, so the loading clip can't flash in front of the gate. */
  const [gate, setGate] = useState<{ lost: number; oneMore: boolean } | null | undefined>(
    undefined,
  );

  // Scoring. A form is graded once, when the last exercise that drills it is
  // answered — so one word seen from three angles still moves its schedule a
  // single, well-informed step. `typed` records a passed typing exercise, the
  // one test strict enough to earn "fácil".
  const pending = useRef(new Map<string, number>());
  const results = useRef(new Map<string, { attempts: number; wrongs: number; typed: boolean }>());
  const liveStates = useRef(new Map<string, FormState>());
  /** Re-asks granted per form, capped so a stubborn word can't loop forever. */
  const retries = useRef(new Map<string, number>());
  /** Cards the session only added to give a thin day a full class. They are
   *  drilled and logged like any other, but their SM-2 schedule is left where
   *  it was — see MIN_SESSION_ITEMS. */
  const fillerForms = useRef(new Set<string>());
  /** Today's sentence screens and how many went wrong — written to
   *  daily_sessions as they happen, read back tomorrow to set the cap. */
  const sentenceScreens = useRef(0);
  const sentenceFails = useRef(0);
  /** First-attempt answers and how many went wrong — the lesson's score. */
  const firstTries = useRef({ answered: 0, wrong: 0 });

  const countPending = (items: QueueItem[]) => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (!graded(item)) continue;
      for (const form of formsOf(item)) {
        map.set(form.id, (map.get(form.id) ?? 0) + 1);
      }
    }
    return map;
  };

  // Depend on the id, not on the profile object: every auth event hands back a
  // freshly-fetched profile, and rebuilding the queue underneath her
  // mid-session would swap out the exercise she is answering.
  const userId = profile?.id;

  useEffect(() => {
    if (!userId) return;
    // A practice round on a day where nothing happens to fall due still has a
    // day to earn, so it falls back to words she has met — as filler, so the
    // day is credited but SM-2 is left alone: none of those words are due, and
    // scheduling them early is what once sent words out to 2027.
    const load = lessonId
      ? buildLesson(userId, lessonId)
      : buildSession(userId).then((s) =>
          s.items.length > 0
            ? s
            : buildFreeSession(userId).then((f) => ({
                ...f,
                items: f.items.map((it) => ({ ...it, filler: true })),
              })),
        );
    load.then(({ items, allForms: forms, sentences, scheduledFormIds }) => {
      // A brand-new word gets an intro screen right before its first exercise,
      // so she always meets it before being asked anything about it — unless a
      // sentence exercise is doing the introducing, in which case that is the
      // meeting and the plain intro screen stays out.
      const withIntros: QueueItem[] = [];
      const introduced = new Set<string>();
      for (const item of items) {
        if (item.introduces) introduced.add(item.introduces.id);
        const isNew = !item.group && item.state === null && item.mode !== 'tip';
        if (isNew && !introduced.has(item.form.id)) {
          introduced.add(item.form.id);
          withIntros.push({ ...item, isIntro: true });
        }
        withIntros.push(item);
      }

      items.forEach((it) => {
        if (it.state) liveStates.current.set(it.form.id, it.state);
        for (const s of it.groupStates ?? []) liveStates.current.set(s.form_id, s);
      });
      pending.current = countPending(withIntros);
      results.current = new Map();
      retries.current = new Map();
      sentenceScreens.current = 0;
      sentenceFails.current = 0;
      firstTries.current = { answered: 0, wrong: 0 };
      // Filler is what the round padded itself with, plus every word a
      // sentence carries that SM-2 didn't ask for today: drilled and logged,
      // schedule untouched.
      const scheduled = new Set(scheduledFormIds);
      fillerForms.current = new Set([
        ...items.filter((it) => it.filler).map((it) => it.form.id),
        ...items
          .filter((it) => it.sentence)
          .flatMap((it) => formsOf(it).filter((c) => !scheduled.has(c.id)).map((c) => c.id)),
      ]);
      setQueue(withIntros);
      setAllForms(forms);
      setAllSentences(sentences);
      if (withIntros.length > 0) {
        supabase
          .from('daily_sessions')
          .upsert(
            { user_id: userId, session_date: localDateStr(), total_cards: withIntros.length },
            { onConflict: 'user_id,session_date' },
          )
          .then(() => {});
      }
    });
  }, [userId, lessonId]);

  // The "Una clase más!" button replaces the route with new params. Replacing
  // remounts the screen (the entry gets a fresh navigation key), which resets
  // state on its own — but that same remount is why the skip has to travel in
  // the URL: anything held in a ref is reborn false. The reset below is a
  // belt-and-braces for the case where the screen is reused instead.
  useEffect(() => {
    setFinished(null);
    setCelebrating(false);
    setIndex(0);
    setQueue(null);
    setClipPlayed(false);
  }, [lessonId, isAgain]);

  // The gate is read once, on the way in. Reading it at finish() instead
  // would let a lesson started before midnight recover a streak after it —
  // acceptable, and the simpler read wins.
  useEffect(() => {
    if (!userId) return;
    // Coming straight from the "Una clase más!" screen — showing the gate
    // again would be saying the same thing twice in a row.
    if (isAgain) {
      setGate(null);
      return;
    }
    supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        // Frozen: this round is the first of the two that thaw it. Recovering:
        // today's first round is done and this one is the second.
        const st = streakStatus((data as Streak) ?? null);
        if (st.kind === 'frozen') setGate({ lost: st.lost, oneMore: false });
        else if (st.kind === 'recovering') setGate({ lost: st.lost, oneMore: true });
        else setGate(null);
      });
  }, [userId, isAgain]);

  const current = queue?.[index] ?? null;

  // The clips for the exercise she is on and the two after it are fetched
  // ahead of the press, so by the time she taps the speaker there is nothing
  // left to load.
  useEffect(() => {
    if (!queue) return;
    for (const item of queue.slice(index, index + 3)) {
      for (const form of formsOf(item)) preloadAudio(form.audio_path);
      if (item.sentence?.audio_path) preloadAudio(item.sentence.audio_path);
    }
  }, [queue, index]);

  // Then the rest of the lesson, behind those, once — the queue object is
  // replaced on every answer, and re-asking for the same clips each time would
  // be churn. A clip is a second of speech, so the whole lesson is a small
  // download, and it is spent inside the wait she is already having: the queue
  // is built behind the loading clip, so this starts the moment it exists and
  // has the rest of those six seconds to finish in.
  const warmed = useRef(false);
  const warmedFirst = useRef(false);
  useEffect(() => {
    if (!queue || warmed.current) return;
    warmed.current = true;
    for (const item of queue) for (const form of formsOf(item)) void preloadAudio(form.audio_path);
  }, [queue]);

  // The loading clip is a fixed six seconds, which on a slow connection can end
  // before the first recording has arrived — and the first exercise is often
  // the one that plays itself on arrival. So the doorway also waits on that one
  // clip, though never for long: a few seconds more of pitas is better than
  // silence where a voice should be, and either way she goes in.
  const [firstReady, setFirstReady] = useState(false);
  const firstClip = useMemo(
    () =>
      queue
        ?.slice(0, 3)
        .flatMap(formsOf)
        .find((form) => form.audio_path)?.audio_path ?? null,
    [queue],
  );
  useEffect(() => {
    if (!firstClip || warmedFirst.current) return;
    warmedFirst.current = true;
    const open = () => setFirstReady(true);
    void preloadAudio(firstClip).then(open);
    const giveUp = setTimeout(open, 2500);
    return () => clearTimeout(giveUp);
  }, [firstClip]);

  const advance = (nextQueue: QueueItem[]) => {
    if (index + 1 < nextQueue.length) {
      setQueue(nextQueue);
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    if (!profile) return;
    // One call does all of it: records the lesson (which moves the path on),
    // credits the day, and trades in a banked run on a comeback day's second
    // round. Awaited, so the path she lands back on has already counted it.
    const { answered, wrong } = firstTries.current;
    const { data, error } = await supabase.rpc('finish_lesson', {
      p_local_date: localDateStr(),
      p_lesson_id: lessonId ?? null,
      p_score: answered > 0 ? Math.round((100 * (answered - wrong)) / answered) : null,
    });
    // A failed RPC used to fall through as streak 0, which looks exactly like a
    // round that legitimately didn't move the streak — the same finish screen,
    // no celebration, nothing to tell the two apart. Say it out loud instead.
    if (error) console.warn('finish_lesson failed', error);
    const row = (data as { current_streak: number; previous_streak: number; recoverable_streak: number }[] | null)?.[0];
    const streak = row?.current_streak ?? 0;
    const previous = row?.previous_streak ?? 0;
    if (streak !== previous) notifyEvent('session_completed', { streak });
    // Did this round start a comeback? With a run still banked, the screen
    // after this one has one job — sending her into the second round — and
    // celebrating a streak of 1 would read as the 13 being gone.
    setFinished({
      streak,
      previous,
      oneMore: row && row.recoverable_streak > 0 ? row.recoverable_streak : undefined,
    });
  };

  // A word she has just met gets its SRS state, so the exercises that follow
  // have something to grade. Called from the plain intro screen and from the
  // sentence exercise that stands in for it.
  const createState = async (form: Form) => {
    if (!profile) return;
    const { data } = await supabase
      .from('form_states')
      .upsert(
        {
          form_id: form.id,
          user_id: profile.id,
          state: 'learning',
          due_at: new Date().toISOString(),
          introduced_on: localDateStr(),
        },
        { onConflict: 'form_id,user_id' },
      )
      .select()
      .single();
    if (data) liveStates.current.set(form.id, data as FormState);
  };

  const onIntroDone = async (item: QueueItem) => {
    if (!profile || !queue) return;
    await createState(item.form);
    advance(queue);
  };

  // Commits SM-2 for a form once nothing else in the queue drills it.
  const commitIfDone = (formId: string) => {
    if ((pending.current.get(formId) ?? 0) > 0) return;
    const tally = results.current.get(formId);
    const state = liveStates.current.get(formId);
    if (!tally || !state) return;

    // A form SM-2 did not ask for today — filler, free practice, a word a
    // sentence dragged along — keeps its schedule when she gets it right:
    // passing a word early says little, and scheduling it early is what once
    // sent words out to 2027. Getting it wrong is different: a word she was
    // supposed to hold for weeks and couldn't is a lapse, whatever the day.
    const unscheduled = fillerForms.current.has(formId);
    if (unscheduled && tally.wrongs === 0) return;

    // Flawless is "bien". Multiple choice, true/false and listening come out
    // right 97% of the time, so a clean sweep of them proves little; "fácil"
    // — a 1.3× bonus and a permanent ease raise — is reserved for a passed
    // typing exercise. One slip is "difícil"; two or more resets the form.
    const rating: Rating = unscheduled
      ? 0
      : tally.wrongs === 0 ? (tally.typed ? 3 : 2) : tally.wrongs === 1 ? 1 : 0;

    const next = schedule(state, rating);
    liveStates.current.set(formId, { ...state, ...next });
    supabase
      .from('form_states')
      .update({ ...next, updated_at: new Date().toISOString() })
      .eq('id', state.id)
      .then(() => {});

    // A word that keeps lapsing is a leech (Anki's word). She can't fix a
    // leech by seeing it more; whoever writes the course can, by rewriting the
    // sentences that teach it — so it gets reported, at the threshold and every
    // few lapses after.
    if (rating === 0 && next.lapses > 0 && next.lapses % LEECH_LAPSES === 0) {
      const form = allForms.find((c) => c.id === formId);
      if (form) notifyEvent('leech', { word: form.form, lapses: next.lapses });
    }
  };

  // Every exercise reports here: which forms it drilled, and which were missed.
  const onAnswered = async (item: QueueItem, wrongFormIds: string[]) => {
    if (!profile || !queue) return;
    // A tip asks nothing, so there is nothing to record.
    if (item.mode === 'tip') return advance(queue);
    // Meeting a word inside a sentence is its introduction: the state is made
    // here, where the plain intro screen would have made it.
    if (item.introduces && !liveStates.current.has(item.introduces.id)) {
      await createState(item.introduces);
    }
    // Every sentence screen feeds the ladder: the sentence's own record (which
    // rung it has earned) and the day's tally (a bad day lowers tomorrow's cap).
    if (item.sentence) {
      const passed = wrongFormIds.length === 0;
      recordShown(profile.id, item.sentence, passed);
      sentenceScreens.current += 1;
      if (!passed) sentenceFails.current += 1;
      supabase
        .from('daily_sessions')
        .update({
          sentence_screens: sentenceScreens.current,
          sentence_fails: sentenceFails.current,
        })
        .eq('user_id', profile.id)
        .eq('session_date', localDateStr())
        .then(() => {});
    }
    const drilled = formsOf(item);
    const wrong = new Set(wrongFormIds);

    for (const form of drilled) {
      supabase
        .from('review_logs')
        .insert({
          user_id: profile.id,
          form_id: form.id,
          rating: wrong.has(form.id) ? 0 : 2,
          mode: item.mode,
        })
        .then(() => {});
    }

    // Meeting a word is not recalling it. The sentence intro is logged like
    // the plain intro screen and, like it, grades nobody: a right guess at the
    // sentence's meaning is not a flawless recall, and a wrong one is not a slip.
    if (!graded(item)) return advance(queue);

    // The lesson's score counts first attempts only — a re-ask she gets right
    // is the round working, not a better score.
    if (!item.isRetry) {
      firstTries.current.answered += 1;
      if (wrong.size > 0) firstTries.current.wrong += 1;
    }

    for (const form of drilled) {
      pending.current.set(form.id, Math.max((pending.current.get(form.id) ?? 1) - 1, 0));
      const tally = results.current.get(form.id) ?? { attempts: 0, wrongs: 0, typed: false };
      tally.attempts += 1;
      if (wrong.has(form.id)) tally.wrongs += 1;
      else if (item.mode === 'typing') tally.typed = true;
      results.current.set(form.id, tally);
    }

    // A missed form comes back later in the round, in the gentlest format, so
    // she rarely leaves without having got it right at least once. Two re-asks
    // is the limit — beyond that the word is simply due again tomorrow.
    const MAX_RETRIES = 2;
    const retryItems: QueueItem[] = [...wrong]
      .map((id) => drilled.find((c) => c.id === id))
      .filter((c): c is Form => !!c)
      .filter((form) => (retries.current.get(form.id) ?? 0) < MAX_RETRIES)
      .map((form) => {
        retries.current.set(form.id, (retries.current.get(form.id) ?? 0) + 1);
        return {
          form,
          state: liveStates.current.get(form.id) ?? null,
          mode: (allForms.length >= 4 ? 'multiple_choice' : 'true_false') as QueueItem['mode'],
          direction: 'es_to_en' as const,
          isRetry: true,
        };
      });

    for (const retry of retryItems) {
      pending.current.set(retry.form.id, (pending.current.get(retry.form.id) ?? 0) + 1);
    }
    for (const form of drilled) commitIfDone(form.id);

    advance(retryItems.length ? [...queue, ...retryItems] : queue);
  };

  if (!profile) return null;

  if (finished) {
    // Every finished round ends on the same clip. One that actually moved the
    // streak then hands over to the full celebration; any other just goes
    // home. Either way she leaves by tapping, not by waiting out a timer.
    const celebrate =
      finished.oneMore != null || (finished.streak > 0 && finished.streak !== finished.previous);
    if (celebrating) {
      // Mid-comeback there is nothing to celebrate yet — there is a second
      // class to start. The same frozen pitas she met at the door, one step
      // from thawing.
      if (finished.oneMore != null) {
        const lost = finished.oneMore;
        return (
          <SafeAreaView style={styles.safe}>
            <View style={styles.doneWrap}>
              <View style={styles.gatePanel}>
                <Text style={styles.gateTitle}>Ya casi!</Text>
                <Image
                  source={require('@/assets/videos/frozen-pitas.webp')}
                  style={styles.gateClip}
                  contentFit="contain"
                  accessible={false}
                />
                <Text style={styles.gateBody}>
                  Una clase más y recuperás tu racha de {lost} días.
                </Text>
                <Button
                  title="Una clase más!"
                  onPress={() => router.replace('/practice?again=1')}
                />
                <Button title="Al inicio" variant="ghost" onPress={() => router.replace('/home')} />
              </View>
            </View>
          </SafeAreaView>
        );
      }
      return (
        <SafeAreaView style={styles.safe}>
          <StreakCelebration
            previous={finished.previous}
            streak={finished.streak}
            onDone={() => router.replace('/home')}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe}>
        <LessonComplete
          // The celebration is about to count the streak out loud; saying it
          // twice would spend the surprise before it lands.
          streak={celebrate || finished.streak <= 0 ? null : finished.streak}
          onNext={() => (celebrate ? setCelebrating(true) : router.replace('/home'))}
        />
      </SafeAreaView>
    );
  }

  // A frozen streak stops her at the door, before the loading clip: what the
  // two classes are for is decided here, so it is said here — once on the way
  // into the first class, once on the way into the second. Until the answer is
  // back the doorway shows the bare background; letting the loading clip start
  // and then yanking it for the gate read as a glitch.
  if (gate === undefined) {
    return <SafeAreaView style={styles.safe} />;
  }
  if (gate) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <View style={styles.gatePanel}>
            <Text style={styles.gateTitle}>
              {gate.oneMore ? 'Ya casi!' : 'Se te congeló la racha!'}
            </Text>
            <Image
              source={require('@/assets/videos/frozen-pitas.webp')}
              style={styles.gateClip}
              contentFit="contain"
              accessible={false}
            />
            {gate.oneMore ? null : (
              <Text style={styles.gateSub}>Tu racha de {gate.lost} días se congeló</Text>
            )}
            <Text style={styles.gateBody}>
              {gate.oneMore
                ? `Una clase más y recuperás tu racha de ${gate.lost} días.`
                : 'Para recuperarla, tenés que hacer dos clases seguidas hoy.'}
            </Text>
            <Button title="Vamos!" onPress={() => setGate(null)} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // The clip is the doorway into a lesson: it is watched to the end, and the
  // queue and its recordings are built behind it. When there turns out to be no
  // lesson to enter, there is nothing to hold her for.
  if (!queue || (queue.length > 0 && (!clipPlayed || (!!firstClip && !firstReady)))) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <LoadingVideo onPlayedThrough={() => setClipPlayed(true)} />
        </View>
      </SafeAreaView>
    );
  }

  if (queue.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>😌</Text>
          <Text style={styles.doneTitle}>No hay nada para practicar ahora</Text>
          <Text style={styles.doneHint}>Hacé una lección del camino y volvé.</Text>
          <Button title="Volver al inicio" onPress={() => router.replace('/home')} />
        </View>
      </SafeAreaView>
    );
  }

  const progress = index / queue.length;

  return (
    // The bottom edge is left to the exercise frame: its docked bar and its
    // result panel are meant to sit against it, not float above it.
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/home')} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 3)}%` }]} />
        </View>
        <Text style={styles.counter}>
          {index + 1}/{queue.length}
        </Text>
      </View>

      {current && (
        <Exercise
          key={`${current.form.id}-${index}`}
          item={current}
          allForms={allForms}
          allSentences={allSentences}
          onIntroDone={() => onIntroDone(current)}
          onAnswered={(wrongIds) => void onAnswered(current, wrongIds)}
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// A single exercise. Every one of them grades itself — none ask her to judge
// her own recall — and they all share the same rhythm: answer, comprobar, read
// the verdict, continuar.
// ---------------------------------------------------------------------------
function Exercise({
  item,
  allForms,
  allSentences,
  onIntroDone,
  onAnswered,
}: {
  item: QueueItem;
  allForms: Form[];
  allSentences: Sentence[];
  onIntroDone: () => void;
  onAnswered: (wrongFormIds: string[]) => void;
}) {
  const { form } = item;

  if (item.isIntro) return <Intro form={form} onDone={onIntroDone} />;
  if (item.mode === 'tip' && item.tip) return <TipCard tip={item.tip} onDone={() => onAnswered([])} />;

  const single = (correct: boolean) => onAnswered(correct ? [] : [form.id]);

  switch (item.mode) {
    case 'matching':
      return <Matching item={item} onAnswered={onAnswered} />;
    case 'sentence_intro':
    case 'sentence_meaning':
      return <SentenceIntro item={item} allSentences={allSentences} onAnswered={onAnswered} />;
    case 'sentence_gap':
      return <SentenceGap item={item} allForms={allForms} onAnswered={onAnswered} />;
    case 'sentence_build':
      return <SentenceBuild item={item} allForms={allForms} onAnswered={onAnswered} />;
    case 'sentence_listen':
      return <SentenceBuild item={item} allForms={allForms} onAnswered={onAnswered} byEar />;
    case 'listen':
      return <Listen item={item} allForms={allForms} onAnswer={single} />;
    case 'true_false':
      return <TrueFalse item={item} allForms={allForms} onAnswer={single} />;
    case 'word_build':
      return <WordBuild item={item} allForms={allForms} onAnswer={single} />;
    case 'listen_build':
      return <ListenBuild item={item} allForms={allForms} onAnswer={single} />;
    case 'typing':
      return <Typing item={item} onAnswer={single} />;
    default:
      return <MultipleChoice item={item} allForms={allForms} onAnswer={single} />;
  }
}

// On web the press scale eases instead of snapping; native gets the snap, which
// is what a touch already feels like.
const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, background-color, border-color',
        transitionDuration: '160ms',
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

function Intro({ form, onDone }: { form: Form; onDone: () => void }) {
  const phrase = isPhrase(form.form);
  return (
    <ExerciseFrame
      prompt={phrase ? '✨ Frase nueva' : '✨ Palabra nueva'}
      verdict={null}
      canCheck
      checkLabel="Entendido!"
      onCheck={onDone}
      onContinue={onDone}>
      <Panel style={styles.bigCard}>
        <Text style={phrase ? styles.esPhraseHero : styles.esHero}>{form.form}</Text>
        <View style={styles.divider} />
        <Text style={phrase ? styles.enPhrase : styles.enBig}>{form.gloss_en}</Text>
        {form.audio_path ? <PlayButton path={form.audio_path} big /> : null}
      </Panel>
    </ExerciseFrame>
  );
}

// ---------------------------------------------------------------------------
// TipCard — a grammar note between exercises. It asks nothing and grades
// nothing; it is there so the rule arrives just before the questions that lean
// on it. Tips are short by design, so a single panel of prose is enough, with
// the two bits of emphasis the course writes in: **bold** and *italic*.
// ---------------------------------------------------------------------------
function TipCard({ tip, onDone }: { tip: Tip; onDone: () => void }) {
  const paragraphs = tip.body_md.split(/\n{2,}/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim());
  return (
    <ExerciseFrame
      prompt={`💡 ${tip.title_en}`}
      verdict={null}
      canCheck
      checkLabel="Entendido!"
      onCheck={onDone}
      onContinue={onDone}>
      <Panel style={styles.tip}>
        {paragraphs.map((para, i) => (
          <Text key={i} style={styles.tipText}>
            {inlineMarkdown(para)}
          </Text>
        ))}
      </Panel>
    </ExerciseFrame>
  );
}

/** `**bold**` and `*italic*` as nested Text; everything else as written. */
function inlineMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith('**')) return <Text key={i} style={styles.tipStrong}>{part.slice(2, -2)}</Text>;
    if (part.startsWith('*')) return <Text key={i} style={styles.tipEm}>{part.slice(1, -1)}</Text>;
    return part;
  });
}

// A clip and whether it is sounding right now. Nothing else on screen moves
// while audio plays, so without this the speaker button is a dead control —
// you press it and cannot tell whether anything happened.
function useClip(path: string | null) {
  const [playing, setPlaying] = useState(false);
  // A clip that will not sound has to say so. Silence on its own reads as a
  // broken button, and there is no console to look at on her phone.
  const [problem, setProblem] = useState<AudioFailure | null>(null);
  const live = useRef(false);
  const set = (value: boolean) => {
    live.current = value;
    setPlaying(value);
  };

  const play = useCallback(() => {
    if (!path) return;
    setProblem(null);
    // playAudio stops whatever was sounding first, which reports back through
    // the old onEnd — so this order matters: claim the state last.
    playAudio(path, (reason) => {
      set(false);
      // 'blocked' only means the browser wants a tap first, which the button
      // already asks for — not something to complain about.
      if (reason && reason !== 'blocked') setProblem(reason);
    });
    set(true);
  }, [path]);

  // Leaving the exercise takes its sound with it.
  useEffect(() => () => void (live.current && stopAudio()), []);

  return { playing, problem, play };
}

const AUDIO_PROBLEM: Record<AudioFailure, string> = {
  blocked: 'Tocá para escuchar',
  offline: 'Sin conexión',
  missing: 'No se encontró el audio',
  failed: 'No se pudo reproducir',
};

// An expanding ring, looping while the clip sounds. A Reanimated CSS animation,
// so it runs on the UI thread and React never re-renders for it.
const PULSE = {
  animationName: {
    from: { transform: [{ scale: 0.9 }], opacity: 0.55 },
    to: { transform: [{ scale: 1.4 }], opacity: 0 },
  },
  animationDuration: '1100ms',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-out',
} as const;

function Pulse({ inset }: { inset: number }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pulse, { top: -inset, left: -inset, right: -inset, bottom: -inset }, PULSE]}
    />
  );
}

function PlayButton({ path, big }: { path: string; big?: boolean }) {
  const { playing, problem, play } = useClip(path);
  const reduced = useReducedMotion();

  // It says itself on arrival, the way a teacher would say the word before
  // asking about it — the button is there to hear it again. Every place this
  // sits, the Spanish is already on screen, so the sound gives nothing away.
  useEffect(() => play(), [play]);

  return (
    <View style={styles.playWrap}>
      <Pressable
        onPress={play}
        accessibilityLabel={playing ? 'Sonando' : problem ? AUDIO_PROBLEM[problem] : 'Escuchar'}
        style={({ pressed }) => [
          styles.playButton,
          big && styles.playButtonBig,
          // The colour shift carries the state on its own, for anyone who has
          // motion turned off.
          playing && styles.playButtonOn,
          problem && styles.playButtonDead,
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webPress,
        ]}>
        {playing && !reduced ? <Pulse inset={big ? 6 : 4} /> : null}
        <Ionicons
          name={problem ? 'volume-mute' : 'volume-high'}
          size={big ? 30 : 20}
          color={colors.onPrimary}
        />
      </Pressable>
      {problem ? <Text style={styles.audioProblem}>{AUDIO_PROBLEM[problem]}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SpeechBubble — Mora, and a bubble coming out of her.
//
// The tail is two stacked triangles because the bubble is a bordered panel:
// the back one is the border colour, the front one the fill, a couple of
// points smaller and pushed right so it leaves the back one showing as a rim
// and covers the panel's own border where the two meet. That is what makes the
// outline read as one continuous shape rather than a form with a sticker on it.
// ---------------------------------------------------------------------------
const MORA_WIDTH = 74;
/** The cut-out is 275 × 379; holding the ratio keeps her head from squashing. */
const MORA_HEIGHT = Math.round((MORA_WIDTH * 379) / 275);
const TAIL = 11;
const TAIL_RIM = 2;

function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.speechRow}>
      <Image
        source={require('@/assets/images/mora-figure.png')}
        style={styles.moraFigure}
        contentFit="contain"
        accessible={false}
      />
      <View style={styles.bubbleWrap}>
        <Panel style={styles.bubble}>{children}</Panel>
        {/* After the panel, so they paint over its border rather than under it. */}
        <View style={[styles.tail, styles.tailEdge]} pointerEvents="none" />
        <View style={[styles.tail, styles.tailFill]} pointerEvents="none" />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// PromptBlock — the word under test. It is not printed on a form, it is
// *said*: the same content, but coming out of Mora's mouth, which is the whole
// reason there is a face on the screen. Text sits left, the way speech does —
// centred text in a bubble reads as a label someone hung on her.
// ---------------------------------------------------------------------------
function PromptBlock({ form, side }: { form: Form; side: 'es' | 'en' }) {
  const phrase = isPhrase(form.form);
  // Audio is always the Spanish, so it only ever accompanies the Spanish side —
  // playing it next to the English prompt would hand her the answer.
  const audio = side === 'es' ? form.audio_path : null;

  return (
    <SpeechBubble>
      <View style={styles.bubbleRow}>
        {audio ? <PlayButton path={audio} /> : null}
        <View style={styles.bubbleText}>
          {side === 'es' ? (
            <Text style={phrase ? styles.bubblePhrase : styles.bubbleWord}>{form.form}</Text>
          ) : (
            <Text style={phrase ? styles.bubblePhraseEn : styles.bubbleEn}>{form.gloss_en}</Text>
          )}
        </View>
      </View>
    </SpeechBubble>
  );
}

function Choices({
  options,
  correctId,
  chosen,
  revealed,
  onPick,
}: {
  options: Option[];
  correctId: string;
  chosen: string | null;
  revealed: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      {options.map((opt) => {
        const picked = chosen === opt.id;
        const right = revealed && opt.id === correctId;
        const wrong = revealed && picked && opt.id !== correctId;
        return (
          <Pressable
            key={opt.id}
            disabled={revealed}
            onPress={() => onPick(opt.id)}
            style={({ pressed }) => [
              styles.choice,
              picked && styles.choicePicked,
              right && styles.choiceRight,
              wrong && styles.choiceWrong,
              { transform: [{ scale: pressed && !revealed ? 0.985 : 1 }] },
              webPress,
            ]}>
            <Text
              style={[
                styles.choiceText,
                picked && { color: colors.primaryDark, fontWeight: '700' },
                right && { color: colors.success, fontWeight: '700' },
                wrong && { color: colors.danger },
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MultipleChoice({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: (correct: boolean) => void;
}) {
  const { form } = item;
  const askSpanish = item.direction === 'es_to_en';
  const answerField = askSpanish ? 'gloss_en' : 'form';
  // Randomised content is generated exactly once per exercise: a `useMemo`
  // may legitimately re-run, and a reshuffle mid-answer would grade her
  // against options she never saw.
  const [options] = useState(() =>
    pickOptions(form, allForms, answerField).map((c) => ({ id: c.id, label: c[answerField] })),
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const phrase = isPhrase(form.form);
  const prompt = askSpanish
    ? phrase
      ? '¿Qué significa esta frase?'
      : '¿Qué significa?'
    : phrase
      ? '¿Cómo se dice esta frase en argentino?'
      : '¿Cómo se dice en argentino?';

  return (
    <ExerciseFrame
      prompt={item.isRetry ? `🔁 ${prompt}` : prompt}
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() => setVerdict({ correct: chosen === form.id, answer: form[answerField] })}
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <PromptBlock form={form} side={askSpanish ? 'es' : 'en'} />
      <Choices
        options={options}
        correctId={form.id}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </ExerciseFrame>
  );
}

function Listen({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: (correct: boolean) => void;
}) {
  const { form } = item;
  const [options] = useState(() =>
    pickOptions(form, allForms, 'gloss_en').map((c) => ({ id: c.id, label: c.gloss_en })),
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  return (
    <ExerciseFrame
      prompt="¿Qué significa lo que escuchás?"
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({ correct: chosen === form.id, answer: `${form.form} — ${form.gloss_en}` })
      }
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <AudioPad path={form.audio_path!} />
      <Choices
        options={options}
        correctId={form.id}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </ExerciseFrame>
  );
}

/** The tap-to-listen panel used by the two audio-first exercises. */
function AudioPad({ path }: { path: string }) {
  const { playing, problem, play } = useClip(path);
  const reduced = useReducedMotion();

  // She should hear it before reading anything, so it plays itself on arrival.
  useEffect(() => play(), [play]);

  return (
    <Pressable
      onPress={play}
      style={({ pressed }) => [
        styles.audioPad,
        { transform: [{ scale: pressed ? 0.99 : 1 }] },
        webPress,
      ]}>
      <View
        style={[
          styles.audioPadCircle,
          playing && styles.playButtonOn,
          problem && styles.playButtonDead,
        ]}>
        {playing && !reduced ? <Pulse inset={7} /> : null}
        <Ionicons
          name={problem ? 'volume-mute' : playing ? 'volume-high' : 'play'}
          size={30}
          color={colors.onPrimary}
        />
      </View>
      <Text style={[styles.audioPadHint, problem && styles.audioProblem]}>
        {problem ? AUDIO_PROBLEM[problem] : playing ? 'Sonando…' : 'Tocá para escuchar'}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// ¿Sí o no? — a fast recognition check: is this the right meaning?
// ---------------------------------------------------------------------------
function TrueFalse({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: (correct: boolean) => void;
}) {
  const { form } = item;
  const [picked, setPicked] = useState<boolean | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  // Half the time we show the real meaning, half an imposter's.
  const [{ shown, isTrue }] = useState(() => {
    const imposter = pickImposter(form, allForms);
    if (!imposter || Math.random() < 0.5) return { shown: form.gloss_en, isTrue: true };
    return { shown: imposter.gloss_en, isTrue: false };
  });

  return (
    <ExerciseFrame
      prompt={item.isRetry ? '🔁 ¿Significa esto?' : '¿Significa esto?'}
      verdict={verdict}
      canCheck={picked !== null}
      onCheck={() =>
        setVerdict({
          correct: picked === isTrue,
          answer: isTrue ? undefined : `«${form.form}» es «${form.gloss_en}»`,
        })
      }
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <Panel style={styles.bigCard}>
        <Text style={styles.esBig}>{form.form}</Text>
        {form.audio_path ? <PlayButton path={form.audio_path} /> : null}
        <View style={styles.divider} />
        <Text style={styles.enBig}>{shown}</Text>
      </Panel>

      <View style={styles.ratingRow}>
        {[
          { label: 'No', value: false, icon: 'close' as const, tone: colors.danger },
          { label: 'Sí', value: true, icon: 'checkmark' as const, tone: colors.success },
        ].map((opt) => (
          <Pressable
            key={opt.label}
            disabled={verdict !== null}
            onPress={() => setPicked(opt.value)}
            style={({ pressed }) => [
              styles.bigChoice,
              { borderColor: colors.border },
              picked === opt.value && { borderColor: opt.tone, backgroundColor: colors.card },
              { transform: [{ scale: pressed && verdict === null ? 0.97 : 1 }] },
              webPress,
            ]}>
            <Ionicons
              name={opt.icon}
              size={22}
              color={picked === opt.value ? opt.tone : colors.faint}
            />
            <Text
              style={[
                styles.bigChoiceText,
                { color: picked === opt.value ? opt.tone : colors.muted },
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ExerciseFrame>
  );
}

// ---------------------------------------------------------------------------
// Tile building — the shared machinery behind "traducí esta frase" and
// "¿qué dice el audio?". A sentence breaks into words, a word into letters,
// and the bank always carries a few spare tiles so the answer is never just
// "use everything you can see".
//
// Tiles are addressed by position, so a repeated word or letter stays
// independent from its twin.
// ---------------------------------------------------------------------------
const TILE_ROW = 58;

// A tapped word travels to where it landed instead of teleporting: the tile
// under her finger is the same object that appears on the line, so she never
// has to re-find it. 220ms ease-in-out — the curve for something moving across
// the screen rather than entering it.
const FLY_MS = 220;
const EASE_MOVE = Easing.bezier(0.77, 0, 0.175, 1);

type Rect = { x: number; y: number; width: number; height: number };
/** A tile in mid-air. `hide` is the slot it stands in for while it flies. */
type Flight = { id: number; text: string; from: Rect; to: Rect; hide: string };
/** A tile dropped onto the line that does not yet know where it landed. */
type Pending = { text: string; from: Rect; slot: string };

/**
 * Where `node` sits inside `root`, in layout coordinates. The offset chain is
 * used rather than getBoundingClientRect because the tile is still wearing its
 * press-scale transform when it is measured, and offsets ignore transforms.
 */
function offsetRect(node: any): Rect {
  let x = node.offsetLeft;
  let y = node.offsetTop;
  let p = node.offsetParent;
  while (p) {
    x += p.offsetLeft + p.clientLeft - p.scrollLeft;
    y += p.offsetTop + p.clientTop - p.scrollTop;
    p = p.offsetParent;
  }
  return { x, y, width: node.offsetWidth, height: node.offsetHeight };
}

function FlyingTile({ flight, onDone }: { flight: Flight; onDone: () => void }) {
  const t = useSharedValue(0);
  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;

  useEffect(() => {
    t.set(
      withTiming(1, { duration: FLY_MS, easing: EASE_MOVE }, () => {
        'worklet';
        scheduleOnRN(onDone);
      }),
    );
    // One trip per mounted tile — the builder keys a fresh one for each flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fly = useAnimatedStyle(() => ({
    transform: [{ translateX: dx * t.get() }, { translateY: dy * t.get() }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.tile,
        styles.tileFlying,
        {
          left: flight.from.x,
          top: flight.from.y,
          width: flight.from.width,
          height: flight.from.height,
        },
        fly,
      ]}>
      <Text style={styles.tileText}>{flight.text}</Text>
    </Animated.View>
  );
}

function TileBuilder({
  tiles,
  used,
  setUsed,
  locked,
  ruled,
}: {
  tiles: string[];
  used: number[];
  setUsed: (next: number[]) => void;
  locked: boolean;
  /** Sentence builds get writing lines to lay the words on. */
  ruled: boolean;
}) {
  const reduced = useReducedMotion();
  const rootRef = useRef<View>(null);
  // Bank tiles are keyed `b<index>`, tiles on the line `a<position>`.
  const nodes = useRef<Record<string, View | null>>({});
  const flightId = useRef(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);

  // Measured at the moment of the tap rather than cached: on web a tile that
  // only reflows never fires onLayout, so anything remembered from mount is
  // stale as soon as a word is pulled out of the middle of the line.
  const rectOf = (key: string, cb: (rect: Rect | null) => void) => {
    const node = nodes.current[key] as any;
    const root = rootRef.current as any;
    if (!node || !root) return cb(null);
    if (Platform.OS === 'web') {
      const a = offsetRect(node);
      const b = offsetRect(root);
      return cb({ ...a, x: a.x - b.x, y: a.y - b.y });
    }
    node.measureLayout(
      root,
      (x: number, y: number, width: number, height: number) => cb({ x, y, width, height }),
      () => cb(null),
    );
  };

  const hold = (key: string) => (node: View | null) => {
    nodes.current[key] = node;
  };

  const add = (i: number) => {
    const next = [...used, i];
    const slot = `a${used.length}`;
    if (reduced || pending) return setUsed(next);
    // Measured before the state change, and committed together with it, so the
    // slot is already hidden on the frame it first appears.
    rectOf(`b${i}`, (from) => {
      if (from) setPending({ text: tiles[i], from, slot });
      setUsed(next);
    });
  };

  // The slot only knows where it landed once it has been laid out, which is the
  // first moment the flight into it can be aimed.
  const landed = (key: string) => () => {
    if (!pending || pending.slot !== key) return;
    const p = pending;
    setPending(null);
    rectOf(key, (to) => {
      if (!to) return;
      setFlight({ id: ++flightId.current, text: p.text, from: p.from, to, hide: key });
    });
  };

  // If the slot somehow never reports a layout, stop hiding it.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(null), 300);
    return () => clearTimeout(t);
  }, [pending]);

  const remove = (position: number) => {
    const i = used[position];
    const next = used.filter((_, p) => p !== position);
    if (reduced) return setUsed(next);
    rectOf(`a${position}`, (from) =>
      rectOf(`b${i}`, (to) => {
        setUsed(next);
        if (from && to) {
          setFlight({ id: ++flightId.current, text: tiles[i], from, to, hide: `b${i}` });
        }
      }),
    );
  };

  return (
    <View ref={rootRef} style={{ gap: 18 }}>
      <View style={[styles.answerArea, ruled ? styles.answerAreaRuled : styles.answerAreaBoxed]}>
        {ruled ? (
          <>
            <View style={[styles.answerRule, { top: TILE_ROW }]} />
            <View style={[styles.answerRule, { top: TILE_ROW * 2 }]} />
          </>
        ) : null}
        <View style={styles.answerTiles}>
          {used.length === 0 && !ruled ? (
            <Text style={styles.answerPlaceholder}>tocá las fichas…</Text>
          ) : null}
          {used.map((tileIndex, position) => {
            const key = `a${position}`;
            // While its word is in the air the slot holds the space, empty.
            const flying = pending?.slot === key || flight?.hide === key;
            return (
              <Pressable
                key={`${tileIndex}-${position}`}
                ref={hold(key)}
                disabled={locked || flying}
                onLayout={landed(key)}
                onPress={() => remove(position)}
                style={({ pressed }) => [
                  styles.tile,
                  flying && styles.tileInFlight,
                  { transform: [{ scale: pressed && !locked ? 0.94 : 1 }] },
                  webPress,
                ]}>
                <Text style={[styles.tileText, flying && { opacity: 0 }]}>{tiles[tileIndex]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.tileBank}>
        {tiles.map((tile, i) => {
          // A word on its way home has already left the line, but its place in
          // the bank stays greyed until it has actually landed there.
          const gone = used.includes(i) || flight?.hide === `b${i}`;
          return (
            <Pressable
              key={i}
              ref={hold(`b${i}`)}
              disabled={gone || locked}
              onPress={() => add(i)}
              style={({ pressed }) => [
                styles.tile,
                gone && styles.tileTaken,
                { transform: [{ scale: pressed && !gone ? 0.94 : 1 }] },
                webPress,
              ]}>
              <Text style={[styles.tileText, gone && { opacity: 0 }]}>{tile}</Text>
            </Pressable>
          );
        })}
      </View>

      {flight ? (
        <FlyingTile
          key={flight.id}
          flight={flight}
          onDone={() => setFlight((f) => (f?.id === flight.id ? null : f))}
        />
      ) : null}
    </View>
  );
}

function WordBuild({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: (correct: boolean) => void;
}) {
  const { form } = item;
  const phrase = isPhrase(form.form);
  const toSpanish = item.direction === 'en_to_es';
  const field = toSpanish ? 'form' : 'gloss_en';
  const target = form[field];

  const [{ tiles }] = useState(() => buildTiles(target, wordPool(form, allForms, field)));
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const joined = used.map((i) => tiles[i]).join(phrase ? ' ' : '');
  const prompt = phrase
    ? toSpanish
      ? 'Traducí esta frase'
      : '¿Qué significa esta frase?'
    : 'Armá la palabra en argentino';

  return (
    <ExerciseFrame
      prompt={prompt}
      verdict={verdict}
      canCheck={used.length > 0}
      onCheck={() => setVerdict({ correct: typedAnswerMatches(joined, target), answer: target })}
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <PromptBlock form={form} side={toSpanish ? 'en' : 'es'} />
      <TileBuilder
        tiles={tiles}
        used={used}
        setUsed={setUsed}
        locked={verdict !== null}
        ruled={phrase}
      />
    </ExerciseFrame>
  );
}

// ---------------------------------------------------------------------------
// ¿Qué dice el audio? — transcription. The only exercise that goes straight
// from sound to form, with nothing written to lean on.
// ---------------------------------------------------------------------------
function ListenBuild({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: (correct: boolean) => void;
}) {
  const { form } = item;
  const phrase = isPhrase(form.form);
  const [{ tiles }] = useState(() =>
    buildTiles(form.form, wordPool(form, allForms, 'form')),
  );
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const joined = used.map((i) => tiles[i]).join(phrase ? ' ' : '');

  return (
    <ExerciseFrame
      prompt="¿Qué dice el audio?"
      verdict={verdict}
      canCheck={used.length > 0}
      onCheck={() =>
        setVerdict({
          correct: typedAnswerMatches(joined, form.form),
          answer: `${form.form} — ${form.gloss_en}`,
        })
      }
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <AudioPad path={form.audio_path!} />
      <TileBuilder
        tiles={tiles}
        used={used}
        setUsed={setUsed}
        locked={verdict !== null}
        ruled={phrase}
      />
    </ExerciseFrame>
  );
}

function Typing({ item, onAnswer }: { item: QueueItem; onAnswer: (correct: boolean) => void }) {
  const { form } = item;
  const [input, setInput] = useState('');
  const [verdict, setVerdict] = useState<Verdict>(null);

  const check = () =>
    setVerdict({ correct: typedAnswerMatches(input, form.form), answer: form.form });

  return (
    <ExerciseFrame
      prompt="Escribí cómo se dice en argentino"
      verdict={verdict}
      canCheck={!!input.trim()}
      onCheck={check}
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <PromptBlock form={form} side="en" />
      <TextInput
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        placeholder="tu respuesta…"
        placeholderTextColor={colors.faint}
        editable={verdict === null}
        onSubmitEditing={check}
        style={[
          styles.typingInput,
          verdict?.correct === true && {
            borderColor: colors.success,
            backgroundColor: colors.successSoft,
          },
          verdict?.correct === false && {
            borderColor: colors.danger,
            backgroundColor: colors.dangerSoft,
          },
        ]}
      />
    </ExerciseFrame>
  );
}

// ---------------------------------------------------------------------------
// Uní los pares — four words drilled on one screen. This one grades each pair
// as she taps it: waiting to check eight taps at once would be cruel, and the
// instant red flash is the whole point of the format.
// ---------------------------------------------------------------------------
function Matching({
  item,
  onAnswered,
}: {
  item: QueueItem;
  onAnswered: (wrongFormIds: string[]) => void;
}) {
  const group = item.group ?? [item.form];
  const [left] = useState(() => [...group].sort(() => Math.random() - 0.5));
  const [right] = useState(() => [...group].sort(() => Math.random() - 0.5));

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [flashWrong, setFlashWrong] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const pickLeft = (id: string) => {
    if (matched.has(id) || verdict) return;
    setSelected(selected === id ? null : id);
  };

  const pickRight = (id: string) => {
    if (matched.has(id) || !selected || verdict) return;
    if (id === selected) {
      const next = new Set(matched).add(id);
      setMatched(next);
      setSelected(null);
      if (next.size === group.length) {
        const wrong = [...missed];
        setVerdict({
          correct: wrong.length === 0,
          answer: group
            .filter((c) => missed.has(c.id))
            .map((c) => `${c.form} = ${c.gloss_en}`)
            .join('\n'),
        });
      }
    } else {
      // A wrong pairing marks both words involved — she confused them.
      setMissed(new Set([...missed, id, selected]));
      setFlashWrong(id);
      setTimeout(() => setFlashWrong(null), 450);
      setSelected(null);
    }
  };

  return (
    <ExerciseFrame
      prompt="Uní cada palabra con su significado"
      verdict={verdict}
      note={`${matched.size} de ${group.length} unidos`}
      onContinue={() => onAnswered([...missed])}>
      <View style={styles.matchGrid}>
        <View style={styles.matchColumn}>
          {left.map((c) => {
            const isMatched = matched.has(c.id);
            const isSelected = selected === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => pickLeft(c.id)}
                disabled={isMatched}
                style={({ pressed }) => [
                  styles.matchCell,
                  isSelected && styles.matchCellPicked,
                  isMatched && styles.matchCellDone,
                  { transform: [{ scale: pressed && !isMatched ? 0.97 : 1 }] },
                  webPress,
                ]}>
                <Text
                  style={[
                    styles.matchText,
                    isSelected && { color: colors.onPrimary },
                    isMatched && { color: colors.success },
                  ]}
                  numberOfLines={2}>
                  {c.form}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.matchColumn}>
          {right.map((c) => {
            const isMatched = matched.has(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => pickRight(c.id)}
                disabled={isMatched}
                style={({ pressed }) => [
                  styles.matchCell,
                  flashWrong === c.id && {
                    borderColor: colors.danger,
                    backgroundColor: colors.dangerSoft,
                  },
                  isMatched && styles.matchCellDone,
                  { transform: [{ scale: pressed && !isMatched ? 0.97 : 1 }] },
                  webPress,
                ]}>
                <Text
                  style={[styles.matchText, isMatched && { color: colors.success }]}
                  numberOfLines={2}>
                  {c.gloss_en}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ExerciseFrame>
  );
}

// ---------------------------------------------------------------------------
// Sentences. Three exercises share one line of text: the sentence as a row of
// words, laid out one Text each so a single one can be marked (the word she is
// meeting for the first time, tappable) or blanked (the one she has to supply).
// ---------------------------------------------------------------------------
function SentenceLine({
  sentence,
  mark,
  onTapMark,
  blank,
}: {
  sentence: Sentence;
  /** Form id of the word to mark as new. */
  mark?: string;
  onTapMark?: () => void;
  /** Token to replace with a blank, and what she has put in it so far. */
  blank?: { index: number; filled?: string; tone?: 'right' | 'wrong' };
}) {
  return (
    <View style={styles.bubbleText}>
      <View style={styles.tokenRow}>
        {sentence.tokens.map((t, i) => {
          if (blank && i === blank.index) {
            // The blank keeps the word's punctuation on both sides of it —
            // Spanish opens a question as well as closing it: "¿____?".
            const head = tokenHead(t);
            const tail = tokenTail(t);
            return (
              <View key={i} style={[styles.tokenRow, styles.tokenTight]}>
                {head ? <Text style={styles.bubblePhrase}>{head}</Text> : null}
                <View
                  style={[
                    styles.gap,
                    blank.tone === 'right' && styles.gapRight,
                    blank.tone === 'wrong' && styles.gapWrong,
                  ]}>
                  <Text
                    style={[
                      styles.gapText,
                      blank.tone === 'right' && { color: colors.success },
                      blank.tone === 'wrong' && { color: colors.dangerInk },
                    ]}>
                    {/* Back in its sentence, a first word takes its capital again. */}
                    {blank.filled
                      ? i === 0
                        ? blank.filled.charAt(0).toLocaleUpperCase('es') + blank.filled.slice(1)
                        : blank.filled
                      : ' '}
                  </Text>
                </View>
                {tail ? <Text style={styles.bubblePhrase}>{tail}</Text> : null}
              </View>
            );
          }
          if (mark && t.form_ids?.includes(mark)) {
            return (
              <Pressable
                key={i}
                onPress={onTapMark}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.tokenNew,
                  { transform: [{ scale: pressed ? 0.96 : 1 }] },
                  webPress,
                ]}>
                <Text style={[styles.bubblePhrase, styles.tokenNewText]}>{t.surface}</Text>
              </Pressable>
            );
          }
          return (
            <Text key={i} style={styles.bubblePhrase}>
              {t.surface}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

// Read the sentence, pick its meaning. Two uses: the first rung of the ladder
// for a sentence she knows every word of (sentence_meaning), and meeting a new
// word inside a sentence (sentence_intro) — then the new word is marked, and
// tapping it opens the form she would otherwise have been shown on an intro
// screen: the word, what it means, and how it sounds. The meaning of
// the rest she already has, so the choice is mostly a nudge to notice what the
// new word must mean.
function SentenceIntro({
  item,
  allSentences,
  onAnswered,
}: {
  item: QueueItem;
  allSentences: Sentence[];
  onAnswered: (wrongFormIds: string[]) => void;
}) {
  const sentence = item.sentence!;
  const word = item.introduces;
  const [options] = useState(() => meaningOptions(sentence, allSentences));
  const [chosen, setChosen] = useState<string | null>(null);
  const [peeked, setPeeked] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const prompt = word
    ? '✨ Palabra nueva: ¿qué dice la frase?'
    : item.isRetry
      ? '🔁 ¿Qué dice la frase?'
      : '¿Qué dice la frase?';

  return (
    <ExerciseFrame
      prompt={prompt}
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() => setVerdict({ correct: chosen === sentence.id, answer: sentence.en })}
      onContinue={() => onAnswered(verdict?.correct ? [] : [(word ?? item.form).id])}>
      <SpeechBubble>
        <View style={styles.bubbleRow}>
          <SentenceLine
            sentence={sentence}
            mark={word?.id}
            onTapMark={word ? () => setPeeked(true) : undefined}
          />
        </View>
      </SpeechBubble>

      {!word ? null : peeked ? (
        <Panel style={styles.peek}>
          <View style={styles.peekRow}>
            {word.audio_path ? <PlayButton path={word.audio_path} /> : null}
            <View style={styles.bubbleText}>
              <Text style={styles.peekEs}>{word.form}</Text>
              <Text style={styles.peekEn}>{word.gloss_en}</Text>
            </View>
          </View>
        </Panel>
      ) : (
        <Text style={styles.peekHint}>Tocá la palabra marcada para ver qué significa</Text>
      )}

      <Choices
        options={options}
        correctId={sentence.id}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </ExerciseFrame>
  );
}

// Completá la frase — the sentence with one due word missing (item.form, which
// the session picked among the words the sentence covers), and four words to
// fill it with. The English sits under the bubble: without it any word that
// fits the grammar would do.
function SentenceGap({
  item,
  allForms,
  onAnswered,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswered: (wrongFormIds: string[]) => void;
}) {
  const sentence = item.sentence!;
  const target = item.form;
  const [index] = useState(() => tokenIndexOf(sentence, target.id));
  const [options] = useState(() => gapOptions(sentence, target, allForms));
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const filled = options.find((o) => o.id === chosen)?.label;
  const answer = index >= 0 ? tokenWord(sentence.tokens[index]) : target.form;

  return (
    <ExerciseFrame
      prompt={item.isRetry ? '🔁 Completá la frase' : 'Completá la frase'}
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({ correct: chosen === target.id, answer: `${answer} — ${sentence.en}` })
      }
      onContinue={() => onAnswered(verdict?.correct ? [] : [target.id])}>
      <SpeechBubble>
        <View style={styles.bubbleRow}>
          <SentenceLine
            sentence={sentence}
            blank={{
              index,
              filled,
              tone: verdict ? (verdict.correct ? 'right' : 'wrong') : undefined,
            }}
          />
        </View>
      </SpeechBubble>
      <Text style={styles.gapEn}>{sentence.en}</Text>
      <Choices
        options={options}
        correctId={target.id}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </ExerciseFrame>
  );
}

// Traducí esta frase / ¿Qué dice el audio? — rebuild the sentence from word
// tiles, from its English or from its sound. A wrong build blames only the
// words she actually missed (see missedForms), not the whole sentence.
function SentenceBuild({
  item,
  allForms,
  onAnswered,
  byEar,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswered: (wrongFormIds: string[]) => void;
  byEar?: boolean;
}) {
  const sentence = item.sentence!;
  const [{ tiles, answer }] = useState(() => sentenceTiles(sentence, allForms));
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const placed = used.map((i) => tiles[i]);

  return (
    <ExerciseFrame
      prompt={byEar ? '¿Qué dice el audio?' : 'Traducí esta frase'}
      verdict={verdict}
      canCheck={used.length > 0}
      onCheck={() =>
        setVerdict({
          correct: typedAnswerMatches(placed.join(' '), answer.join(' ')),
          answer: `${sentence.es} — ${sentence.en}`,
        })
      }
      onContinue={() => onAnswered(verdict?.correct ? [] : missedForms(sentence, placed))}>
      {byEar && sentence.audio_path ? (
        <AudioPad path={sentence.audio_path} />
      ) : (
        <SpeechBubble>
          <View style={styles.bubbleRow}>
            <View style={styles.bubbleText}>
              <Text style={styles.bubblePhraseEn}>{sentence.en}</Text>
            </View>
          </View>
        </SpeechBubble>
      )}
      <TileBuilder tiles={tiles} used={used} setUsed={setUsed} locked={verdict !== null} ruled />
    </ExerciseFrame>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 99,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.primary },
  counter: { fontSize: 13, fontWeight: '600', color: colors.muted, minWidth: 40, textAlign: 'right' },

  // Prompts ------------------------------------------------------------------
  bigCard: { alignItems: 'center', gap: 10, paddingVertical: 26 },
  // The Spanish leads — it is the form she is being tested on — and the meaning
  // sits under a rule, in the primary's deep tone.
  esHero: {
    fontSize: 42,
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  esBig: {
    fontSize: 34,
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  esPhraseHero: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
  },
  enBig: { fontSize: 24, color: colors.primaryDark, fontWeight: '700', textAlign: 'center' },
  enPhrase: { fontSize: 20, color: colors.primaryDark, fontWeight: '700', textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginVertical: 8 },

  // Mora and her bubble ------------------------------------------------------
  // The tail is absolute, so it eats into this gap: 16 leaves its tip about
  // five points clear of her beard instead of growing out of it.
  speechRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moraFigure: { width: MORA_WIDTH, height: MORA_HEIGHT },
  bubbleWrap: { flex: 1 },
  bubble: { paddingVertical: 16, paddingHorizontal: 16 },
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bubbleText: { flex: 1, gap: 2 },
  // The apex sits at the element's left edge and halfway down its height, so
  // `top: 50%` with a matching negative margin points it at her mouth whatever
  // the bubble grows to.
  tail: {
    position: 'absolute',
    top: '50%',
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  tailEdge: {
    left: -TAIL,
    marginTop: -TAIL,
    borderTopWidth: TAIL,
    borderBottomWidth: TAIL,
    borderRightWidth: TAIL,
    borderRightColor: colors.border,
  },
  tailFill: {
    left: -(TAIL - TAIL_RIM) + 1,
    marginTop: -(TAIL - TAIL_RIM),
    borderTopWidth: TAIL - TAIL_RIM,
    borderBottomWidth: TAIL - TAIL_RIM,
    borderRightWidth: TAIL - TAIL_RIM,
    borderRightColor: colors.card,
  },
  bubbleWord: { fontSize: 32, color: colors.ink, fontWeight: '700', letterSpacing: -0.4 },
  bubbleEn: { fontSize: 26, color: colors.primaryDark, fontWeight: '700' },
  bubblePhrase: { fontSize: 22, lineHeight: 30, color: colors.ink, fontWeight: '700' },
  bubblePhraseEn: { fontSize: 20, lineHeight: 28, color: colors.primaryDark, fontWeight: '700' },

  // Tips ---------------------------------------------------------------------
  tip: { gap: 12, paddingVertical: 20, paddingHorizontal: 20 },
  tipText: { fontSize: 17, lineHeight: 26, color: colors.ink },
  tipStrong: { fontWeight: '700', color: colors.primaryDark },
  tipEm: { fontStyle: 'italic' },

  // Sentences ----------------------------------------------------------------
  // Words are laid out one Text each so a single one can be marked or blanked;
  // the row wraps like a line of prose would.
  tokenRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', columnGap: 6 },
  /** A blank and the punctuation around it: "¿____?" reads as one word. */
  tokenTight: { columnGap: 1, flexWrap: 'nowrap' },
  // The new word: a wash of the primary and a rule under it — a highlighter
  // stroke, not a button. The negative margin keeps the wash from widening the
  // word's slot in the line.
  tokenNew: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingHorizontal: 5,
    marginHorizontal: -3,
  },
  tokenNewText: { color: colors.primaryDark },
  gap: {
    minWidth: 68,
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.primary,
  },
  gapRight: { borderBottomColor: colors.success },
  gapWrong: { borderBottomColor: colors.danger },
  gapText: { fontSize: 22, lineHeight: 30, fontWeight: '700', color: colors.primaryDark },
  gapEn: { fontSize: 18, lineHeight: 26, color: colors.muted, textAlign: 'center' },
  peek: { paddingVertical: 14, paddingHorizontal: 16 },
  peekRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  peekEs: { fontSize: 26, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  peekEn: { fontSize: 18, fontWeight: '700', color: colors.primaryDark },
  peekHint: { fontSize: 14, color: colors.faint, textAlign: 'center' },

  playWrap: { alignItems: 'center', gap: 6 },
  playButton: { backgroundColor: colors.primary, borderRadius: 99, padding: 13 },
  playButtonDead: { backgroundColor: colors.muted },
  playButtonBig: { padding: 18 },
  playButtonOn: { backgroundColor: colors.primaryDark },
  pulse: { position: 'absolute', borderRadius: 99, borderWidth: 2, borderColor: colors.primary },
  audioPad: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 12,
  },
  audioPadCircle: {
    width: 78,
    height: 78,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  audioPadHint: { fontSize: 15, color: colors.muted },
  audioProblem: { fontSize: 13, color: colors.muted, textAlign: 'center' },

  // Choices ------------------------------------------------------------------
  choice: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  choicePicked: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceRight: { borderColor: colors.success, backgroundColor: colors.successSoft },
  choiceWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  choiceText: { fontSize: 17, color: colors.ink, textAlign: 'center', fontWeight: '500' },

  ratingRow: { flexDirection: 'row', gap: 10 },
  bigChoice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  bigChoiceText: { fontSize: 17, fontWeight: '700' },

  typingInput: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
  },

  // Tile building ------------------------------------------------------------
  answerArea: { minHeight: TILE_ROW * 2 + 4 },
  answerAreaRuled: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 },
  answerAreaBoxed: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
    minHeight: 72,
    padding: 8,
  },
  answerRule: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border },
  answerTiles: { flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: 8 },
  answerPlaceholder: { color: colors.faint, fontSize: 15, alignSelf: 'center' },
  tileBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tile: {
    minWidth: 54,
    height: 50,
    paddingHorizontal: 16,
    // Rounded rectangle, not a pill: a row of pills reads as loose beads, and
    // the words have to line up like something she is building a sentence out of.
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  // An empty slot while its tile is in the air: the outline stays so nothing
  // reflows mid-flight, but it reads as a gap rather than as a tile.
  tileInFlight: { backgroundColor: 'transparent', borderColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  tileFlying: { position: 'absolute', zIndex: 10 },
  tileTaken: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  tileText: { fontSize: 19, fontWeight: '600', color: colors.ink },

  // Matching -----------------------------------------------------------------
  matchGrid: { flexDirection: 'row', gap: 10 },
  matchColumn: { flex: 1, gap: 10 },
  matchCell: {
    minHeight: 58,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  matchCellPicked: { borderColor: colors.primary, backgroundColor: colors.primary },
  matchCellDone: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
    opacity: 0.75,
  },
  matchText: { fontSize: 16, fontWeight: '600', color: colors.ink, textAlign: 'center' },

  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },

  // The frozen-streak gate ---------------------------------------------------
  gatePanel: { alignItems: 'stretch', gap: 12, maxWidth: 400, width: '100%' },
  gateTitle: { fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  gateClip: { width: 210, height: 210, alignSelf: 'center' },
  gateSub: { fontSize: 17, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  gateBody: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 24, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  doneHint: { fontSize: 15, color: colors.muted, textAlign: 'center' },
});

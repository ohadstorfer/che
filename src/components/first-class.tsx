import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  ZoomIn,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CultureGlosses, type Fact, FactCard } from '@/app/culture-class';
import { In, Rays, Slap } from '@/components/cheer-bits';
import { ExerciseFrame, PageColorContext, type Verdict } from '@/components/exercise-frame';
import { AudioPad, Choices, Exercise, PlayButton } from '@/components/exercises';
import { POSE } from '@/components/mascot';
import { Button } from '@/components/ui';
import { WordIntro } from '@/components/word-intro';
import { CultureOpener, SlangOpener } from '@/components/slang-opener';
import { OutlinedHeadline } from '@/components/sticker';
import { type ArWord, type PackItem, arPacks, buildPackRound, decoyWords, toForm as arForm, toGapForm } from '@/lib/argentine';
import { playAudio, stopAudio } from '@/lib/audio';
import fixture from '@/lib/first-class.json';
import { start as startHablar } from '@/lib/hablar';
import { success, tap } from '@/lib/haptics';
import type { Level } from '@/lib/onboarding';
import type { QueueItem } from '@/lib/round';
import { type SentenceRow, toSentence } from '@/lib/sentences';
import { artFor } from '@/lib/culture-art';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel, radius } from '@/lib/theme';
import type { Form, Sentence } from '@/lib/types';

// ---------------------------------------------------------------------------
// "Your first class: at the café". One short class that mixes the four parts
// of the app (course, slang, culture, a call with Pancho) under one progress
// bar. It is the class inside onboarding (onboarding.tsx, after "Building your
// course"), and staff replay it from admin/first-class.tsx with the admin
// extras (Play again, the live AI call).
//
// Content is real: the course rows (forms + sentences, their recordings) are a
// snapshot of the database in first-class.json, the slang words come from
// argentine.json, three asado cards from culture.json. Nothing is graded or saved.
// ---------------------------------------------------------------------------

type Part = 'class' | 'slang' | 'culture' | 'pancho';

const PARTS: Record<Part, { label: string; color: string }> = {
  class: { label: 'EXERCISE', color: colors.primary },
  slang: { label: 'SLANG', color: pastel.butter },
  culture: { label: 'CULTURE', color: pastel.peach },
  pancho: { label: 'SPEAKING', color: pastel.sage },
};

type ScreenId =
  | 'order'
  | 'medialuna'
  | 'build'
  | 'slang'
  | 'culture-intro'
  | 'asado-1'
  | 'asado-2'
  | 'asado-3'
  | 'call';

const SCREENS: { id: ScreenId; part: Part }[] = [
  { id: 'order', part: 'class' },
  { id: 'medialuna', part: 'class' },
  { id: 'build', part: 'class' },
  { id: 'slang', part: 'slang' },
  { id: 'culture-intro', part: 'culture' },
  { id: 'asado-1', part: 'culture' },
  { id: 'asado-2', part: 'culture' },
  { id: 'asado-3', part: 'culture' },
  { id: 'call', part: 'pancho' },
];

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const NEXT = FadeInRight.duration(240).easing(EASE_OUT);

// --- content ------------------------------------------------------------------

const ID = {
  caféConLeche: '928bee92-a24f-5bcc-a825-d51cc7bf068a',
  medialuna: '61df6d82-e066-542f-b158-5524f130294e',
  che: '91232a84-b055-5e03-8ed2-651c79f5b376',
  querés: '94890c85-b399-59cf-bb96-6552de128c40',
  medialunas: '362f3213-c426-54c2-9702-c788da937db5',
  cheQuerésMedialunas: '2e1e0e3c-0847-520b-b36f-af53f7070321',
  medialunaGracias: 'c2268e3e-a367-5746-bba2-28619fa7f2b7',
};

const allWords = arPacks.flatMap((p) => p.words);
const arWord = (id: string) => allWords.find((w) => w.id === id)!;
const packOf = (id: string) => arPacks.find((p) => p.words.some((w) => w.id === id))!;

// The cards' own examples are a plan and a film; here both are the café's,
// recorded in Malena's voice like the words themselves (scripts/first-class/tts.mjs).
const DALE: ArWord = {
  ...arWord('dale'),
  // Short on purpose: a first day reads three words, not a waiter's whole reply.
  example: { es: '¿Un café? ¡Dale!', en: 'A coffee? Sure!', audio: 'argentine/2a068844663cfe67bfca.mp3' },
  gap: 'Dale',
};
const RE: ArWord = {
  ...arWord('re'),
  example: { es: '¡La medialuna está re rica!', en: 'The medialuna is really tasty!', audio: 'argentine/d2aff656364e13ce0f76.mp3' },
  gap: 're',
};

function useContent() {
  return useMemo(() => {
    const forms = fixture.forms as unknown as Form[];
    const byId = new Map(forms.map((f) => [f.id, f]));
    const sentences = (fixture.sentences as unknown as SentenceRow[]).map((r) => toSentence(r, byId));
    const sentence = (id: string) => sentences.find((s) => s.id === id)!;
    const form = (id: string) => byId.get(id)!;

    // A course sentence, changed here from "tenés" to "querés": its recording
    // says "tenés", so it is read, not heard, until it is re-recorded. Marked
    // as already seen: a brand-new build wears the "Harder" badge, wrong on a
    // first class.
    const build: Sentence = {
      ...sentence(ID.cheQuerésMedialunas),
      shown: { shown_count: 9, correct_count: 9, last_shown_at: null },
    };

    const item = (i: Omit<QueueItem, 'state'>): QueueItem => ({ ...i, state: null });

    // The first question of all is an easy read: its wrong answers come only
    // from the short lines, so all three options stay a few words long — and
    // never the next screen's sentence, which would give that one away.
    const short = sentences.filter((s) => s.id !== ID.cheQuerésMedialunas && s.es.split(/\s+/).length <= 5);

    return {
      forms,
      lexicon: byId,
      sentences,
      short,
      caféConLeche: form(ID.caféConLeche),
      medialuna: item({
        form: form(ID.medialuna),
        mode: 'sentence_intro',
        direction: 'es_to_en',
        sentence: sentence(ID.medialunaGracias),
        introduces: form(ID.medialuna),
      }),
      build: item({
        form: form(ID.che),
        mode: 'sentence_build',
        direction: 'en_to_es',
        sentence: build,
        group: [form(ID.che), form(ID.querés), form(ID.medialunas)],
      }),
    };
  }, []);
}

// --- the screen ---------------------------------------------------------------

export type FirstClassPart = Part;

export function FirstClassLesson({
  part,
  admin,
  level = 'none',
  onFinish,
  onClose,
}: {
  /** Opens the class at that part (slang, culture, pancho), or on its end screen (done), for reviewing it. */
  part?: string;
  /** Her answer in onboarding: how fast Pancho talks on the call. */
  level?: Level;
  /** Staff replaying it: Play again, Back to admin and the live AI call. */
  admin?: boolean;
  /** The lesson-complete screen's Continue. */
  onFinish: () => void;
  onClose: () => void;
}) {
  const content = useContent();
  const [at, setAt] = useState(() => Math.max(SCREENS.findIndex((x) => x.part === part), 0));
  const [done, setDone] = useState(part === 'done');
  const [run, setRun] = useState(0);
  /** How far into the current screen she is, where one screen is a whole round (the slang class). */
  const [sub, setSub] = useState(0);
  /** The slang class's opener is up: the whole page turns butter, as it does in a real slang class. */
  const [butter, setButter] = useState(false);
  const screen = SCREENS[at];
  // The page takes the opener's colour while one is up: butter for slang, peach for culture.
  const tint = done ? pastel.butter : screen.id === 'culture-intro' ? pastel.peach : butter ? pastel.butter : null;
  useStatusBarColor(tint ?? colors.bg);

  const next = () => {
    stopAudio();
    setSub(0);
    setButter(false);
    if (at + 1 < SCREENS.length) setAt(at + 1);
    else setDone(true);
  };
  const restart = () => {
    stopAudio();
    setAt(0);
    setSub(0);
    setButter(false);
    setDone(false);
    setRun((r) => r + 1);
  };
  const close = () => {
    stopAudio();
    onClose();
  };

  if (done) return <Complete onAgain={admin ? restart : undefined} onClose={close} onFinish={onFinish} />;

  // Slang and culture open with their own screens, and the call says who is on it: no chip.
  const NO_CHIP: ScreenId[] = ['slang', 'culture-intro', 'call'];
  const startsPart = (at === 0 || SCREENS[at - 1].part !== screen.part) && !NO_CHIP.includes(screen.id);

  return (
    <SafeAreaView style={[styles.safe, tint ? { backgroundColor: tint } : null]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close" style={{ marginTop: -4 }}>
          <Ionicons name="close" size={26} color={tint ? colors.ink : colors.muted} />
        </Pressable>
        <PartBar at={at + sub} />
      </View>
      {startsPart ? <PartChip key={`chip-${at}-${run}`} part={screen.part} /> : null}
      <PageColorContext.Provider value={tint ?? colors.bg}>
        <Animated.View key={`${screen.id}-${run}`} entering={at === 0 ? FadeIn.duration(200) : NEXT} style={styles.stage}>
          <ScreenView id={screen.id} content={content} admin={!!admin} level={level} onNext={next} onProgress={setSub} onOpening={setButter} />
        </Animated.View>
      </PageColorContext.Provider>
    </SafeAreaView>
  );
}

function ScreenView({
  id,
  content,
  admin,
  level,
  onNext,
  onProgress,
  onOpening,
}: {
  id: ScreenId;
  content: ReturnType<typeof useContent>;
  admin: boolean;
  level: Level;
  onNext: () => void;
  onProgress: (share: number) => void;
  onOpening: (opening: boolean) => void;
}) {
  const exercise = (item: QueueItem, sentences: Sentence[] = content.sentences) => (
    <Exercise
      item={item}
      allForms={content.forms}
      allSentences={sentences}
      lexicon={content.lexicon}
      onIntroDone={onNext}
      onAnswered={() => onNext()}
    />
  );
  switch (id) {
    case 'order':
      return <OrderStep word={content.caféConLeche} onDone={onNext} />;
    case 'medialuna':
      return exercise(content.medialuna, content.short);
    case 'build':
      return exercise(content.build);
    case 'slang':
      return <SlangRound onDone={onNext} onProgress={onProgress} onOpening={onOpening} />;
    case 'culture-intro':
      return <CultureOpener onStart={onNext} />;
    case 'asado-1':
      return (
        <CultureGlosses key={id} section="asado" cls="el-ritual">
          <FactCard fact={ASADO[0]} onDone={onNext} tapToAdvance={false} bigArt />
        </CultureGlosses>
      );
    case 'asado-2':
      return (
        <CultureGlosses key={id} section="asado" cls="el-ritual">
          <FactCard fact={ASADO[1]} onDone={onNext} tapToAdvance={false} bigArt />
        </CultureGlosses>
      );
    case 'asado-3':
      return (
        <CultureGlosses key={id} section="asado" cls="el-ritual">
          <FactCard fact={ASADO[2]} onDone={onNext} tapToAdvance={false} bigArt />
        </CultureGlosses>
      );
    case 'call':
      return <CallStep admin={admin} rate={TALK_RATE[level]} onDone={onNext} onProgress={onProgress} />;
  }
}

// culture.json · asado / "More than a barbecue", pages 1, 4 and 6: what an
// asado is, then why it matters. Explained, never quizzed: a first day is no
// time to guess at a country she doesn't know yet. Art and tones as that
// class deals them (culture-art.ts, CARD_TONES).
// The art is passed in, never a number: in React Native a required image *is*
// a number (its asset id), so "a number means the class's nth picture" sent
// the steak and the chori to artFor and showed the grill and the provoleta.
const asadoCard = (art: ImageSourcePropType, text: string, bg: string): Fact => ({
  art,
  text,
  hero: null,
  chip: 'More than a barbecue',
  bg,
});
const ASADO: Fact[] = [
  asadoCard(artFor('asado', 0), 'An **asado** is grilled meat, sure. But mostly it’s an excuse to spend the whole day together. **¿Hacemos un asado?** really means: want to hang out?', pastel.butter),
  // The chori, not the grill again (the first card already shows it).
  asadoCard(require('@/assets/images/objects/choripan-figure.webp'), 'An [asado] is also how Argentines celebrate almost anything: a birthday, a win, a new job, a Friday.', pastel.peach),
  // A steak (vacío) rather than the class's provoleta: the weekly asado is about the meat.
  asadoCard(require('@/assets/images/objects/vacio-figure.webp'), 'For lots of families it’s a weekly date: **el asado del domingo**. Same backyard, same [asador], same people.', pastel.sage),
];

// --- the bar: one track, a piece per run of a part, each in its colour --------

/** The first piece never starts empty: a sliver is already filled, so the bar
 *  reads as "you've begun" from the first screen. */
const HEAD_START = 0.15;

/** Fast progress: each part's first steps fill most of its piece, the last
 *  ones a little (ease-out: a third of the way shows as over half). */
const frontLoaded = (raw: number) => 1 - (1 - raw) ** 2;

function PartBar({ at }: { at: number }) {
  const runs: { part: Part; from: number; size: number }[] = [];
  SCREENS.forEach((s, i) => {
    const last = runs[runs.length - 1];
    if (last && last.part === s.part) last.size++;
    else runs.push({ part: s.part, from: i, size: 1 });
  });
  const current = SCREENS[Math.min(Math.floor(at), SCREENS.length - 1)].part;
  return (
    <View style={styles.barWrap}>
      <View
        style={styles.bar}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: SCREENS.length, now: Math.floor(at) }}>
        {runs.map((r) => (
          <View key={r.from} style={styles.barPiece}>
            <BarFill
              color={PARTS[r.part].color}
              share={Math.max(frontLoaded(Math.min(Math.max((at - r.from) / r.size, 0), 1)), r.from === 0 ? HEAD_START : 0)}
            />
          </View>
        ))}
      </View>
      <View style={styles.barLabels} importantForAccessibility="no-hide-descendants">
        {runs.map((r) => (
          <Text key={r.from} style={[styles.barLabel, r.part === current && styles.barLabelOn]} numberOfLines={1}>
            {PARTS[r.part].label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function BarFill({ color, share }: { color: string; share: number }) {
  const shown = useSharedValue(share);
  useEffect(() => {
    shown.set(withTiming(share, { duration: 420, easing: EASE_OUT }));
  }, [share, shown]);
  const fill = useAnimatedStyle(() => ({ width: `${shown.get() * 100}%` }));
  return <Animated.View style={[styles.barFill, { backgroundColor: color }, fill]} />;
}

/** The part's name, stuck on when the part starts: EXERCISE, SLANG, CULTURE, SPEAKING. */
function PartChip({ part }: { part: Part }) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={reduced ? FadeIn.duration(150) : ZoomIn.duration(240).easing(EASE_OUT)}
      style={[styles.chip, { backgroundColor: PARTS[part].color }]}>
      <Text style={[styles.chipText, part === 'class' && { color: colors.onPrimary }]}>{PARTS[part].label}</Text>
    </Animated.View>
  );
}

// --- 1. listen: what did Pancho order? -----------------------------------------

function OrderStep({ word, onDone }: { word: Form; onDone: () => void }) {
  const options = useMemo(
    () =>
      [
        { id: 'right', label: 'A coffee with milk' },
        { id: 'chocolate', label: 'A hot chocolate' },
        { id: 'agua', label: 'A glass of water' },
        { id: 'te', label: 'A cup of tea' },
      ].sort(() => Math.random() - 0.5),
    [],
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  return (
    <ExerciseFrame
      prompt="Pancho orders at the café. What does he get?"
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({
          correct: chosen === 'right',
          answer: 'café con leche: a coffee with milk',
          note: 'café con leche: a coffee with milk',
          about: word.gloss_note_en ?? undefined,
        })
      }
      onContinue={onDone}>
      <AudioPad path={word.audio_path!} />
      <Choices options={options} correctId="right" chosen={chosen} revealed={verdict !== null} onPick={setChosen} />
    </ExerciseFrame>
  );
}

// --- the slang class -------------------------------------------------------------
// A unit's slang class as the road plays it (argentine-round.tsx, first time):
// the butter SLANG opener, each card introduced, then its meaning asked, then
// the gaps. A miss comes back once at the end. Nothing is scored or saved.

const SLANG_WORDS = [DALE, RE];
const uniqueWords = (words: ArWord[]) => [...new Map(words.map((w) => [w.id, w])).values()];

/** A meaning's words, with "okay" and "ok" as one: "done, okay" → done, ok. */
const meaningWords = (en: string) =>
  en
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .map((w) => (w === 'okay' ? 'ok' : w));

/** A wrong answer may not mean what a right one does: "listo" (done, okay)
 *  is no decoy for "dale" (OK), and the class has no "Both are right". */
const clashes = (w: ArWord) => {
  const theirs = meaningWords(w.en);
  return SLANG_WORDS.some((s) => s.id !== w.id && meaningWords(s.en).some((m) => theirs.includes(m)));
};

function SlangRound({
  onDone,
  onProgress,
  onOpening,
}: {
  onDone: () => void;
  onProgress: (share: number) => void;
  onOpening: (opening: boolean) => void;
}) {
  const [queue, setQueue] = useState<PackItem[]>(() => buildPackRound(SLANG_WORDS, true));
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const retried = useRef(new Set<number>());
  const decoys = useMemo(() => uniqueWords(SLANG_WORDS.flatMap((w) => decoyWords(packOf(w.id)))).filter((w) => !clashes(w)), []);
  const forms = useMemo(() => decoys.map(arForm), [decoys]);
  const gapForms = useMemo(() => decoys.map(toGapForm), [decoys]);

  useEffect(() => {
    onOpening(!started);
  }, [started, onOpening]);
  useEffect(() => {
    onProgress(started ? index / queue.length : 0);
  }, [started, index, queue.length, onProgress]);

  if (!started) return <SlangOpener onStart={() => setStarted(true)} />;

  const current = queue[index];
  const next = (q: PackItem[]) => (index + 1 < q.length ? setIndex(index + 1) : onDone());
  const onAnswered = (wrongIds: string[]) => {
    if (current.kind !== 'exercise') return;
    let q = queue;
    if (wrongIds.length > 0 && !current.item.isRetry && !retried.current.has(index)) {
      retried.current.add(index);
      q = [...queue, { kind: 'exercise', item: { ...current.item, isRetry: true } }];
      setQueue(q);
    }
    next(q);
  };

  return current.kind === 'intro' ? (
    <WordIntro key={`intro-${index}`} word={current.word} onDone={() => next(queue)} />
  ) : (
    <Exercise
      key={`${current.item.form.id}-${index}`}
      item={current.item}
      allForms={current.item.mode === 'sentence_gap' ? gapForms : forms}
      allSentences={[]}
      onIntroDone={() => next(queue)}
      onAnswered={onAnswered}
    />
  );
}

// --- 8. the call ------------------------------------------------------------------

type Turn = { es: string; en: string; audio?: string; replies: { es: string; en: string }[] };

// Pancho as a friend who calls her, two turns short enough for a first day:
// the first reply is the class's café and medialuna, the second the slang
// part's "dale", and the asado he invites her to is the culture part's.
// Recorded in Tomás's voice (scripts/first-class/tts.mjs), played at her level's speed.
const SCRIPT: Turn[] = [
  {
    es: '¡Hola! ¿Qué hacés?',
    en: 'Hi! What are you up to?',
    audio: 'argentine/51bed0a478ac5d9a83cc.mp3',
    replies: [
      { es: 'Acá, tomando un café.', en: 'Just here, having a coffee.' },
      { es: 'Comiendo una medialuna.', en: 'Eating a medialuna.' },
    ],
  },
  {
    es: '¡Qué rico! Che, el domingo hago un asado. ¿Venís?',
    en: 'Yum! Hey, I’m having an asado on Sunday. Are you coming?',
    audio: 'argentine/ae8ab3357addf51b3732.mp3',
    replies: [
      { es: '¡Sí, dale!', en: 'Yes, sure!' },
      { es: '¡Dale, gracias!', en: 'Sure, thanks!' },
    ],
  },
  {
    es: '¡Genial! ¡Nos vemos el domingo! ¡Chau!',
    en: 'Great! See you on Sunday! Bye!',
    audio: 'argentine/901abcd0880b674531c4.mp3',
    replies: [],
  },
];

/** How fast Pancho talks for her level: Hablar's own speeds (TALK_SPEED, in
 *  supabase/functions/_shared/hablar.ts), A1–A2 slow, B1 a little under
 *  native, only "conversational" at full speed. The clip is recorded at
 *  natural speed and slowed on the phone, pitch kept. */
const TALK_RATE: Record<Level, number> = { none: 0.75, basics: 0.75, spanish: 0.9, conversational: 1 };

/**
 * The call as a chat of voice notes, in time:
 *  · Pancho's note arrives and plays ('speaking'); the dock says only LISTEN
 *    FIRST, at the bottom, so she listens before she answers;
 *  · 350 ms after his audio ends her replies come up, one after the other ('ready');
 *  · her tap ('sent'): the dock empties, and 120 ms later her reply lands in the
 *    thread as her own rosa note, under his;
 *  · 650 ms on, his recording mic appears ('typing'), for 1 s;
 *  · it turns into his next note, which plays at once, and round it goes.
 * The thread keeps everything said and scrolls itself to the newest.
 */
type CallPhase = 'speaking' | 'ready' | 'sent' | 'typing';
type Msg = { kind: 'pancho'; turn: number } | { kind: 'me'; reply: Turn['replies'][number] } | { kind: 'typing' };

/** Without a recording, how long his line stays before her replies come up. */
const READ_MS = 1200;
const SEND_MS = 120;
const TYPING_AT = 650;
const TYPING_FOR = 1000;

function CallStep({
  admin,
  rate,
  onDone,
  onProgress,
}: {
  admin: boolean;
  rate: number;
  onDone: () => void;
  /** How far into the call, a turn at a time, for the bar's speaking piece. */
  onProgress: (share: number) => void;
}) {
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<CallPhase>('speaking');
  const [msgs, setMsgs] = useState<Msg[]>([{ kind: 'pancho', turn: 0 }]);
  const [live, setLive] = useState(false);
  const reduced = useReducedMotion();
  const line = SCRIPT[turn];
  const over = line.replies.length === 0;
  const thread = useRef<ScrollView>(null);
  useEffect(() => {
    onProgress(turn / SCRIPT.length);
  }, [turn, onProgress]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (ms: number, fn: () => void) => void timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Which of his notes is sounding, and how: its wave runs while it does.
  const [playing, setPlaying] = useState<{ turn: number; how: 'play' | 'slow'; key: number } | null>(null);
  const playNote = (t: number, how: 'play' | 'slow', onEnd?: () => void) => {
    const path = SCRIPT[t].audio;
    if (!path) return;
    const key = Date.now() + Math.random();
    setPlaying({ turn: t, how, key });
    playAudio(
      path,
      () => {
        setPlaying((p) => (p?.key === key ? null : p));
        onEnd?.();
      },
      how === 'play' ? rate : rate * 0.8,
    );
  };

  // His newest note: its sound now, her replies once it ends.
  useEffect(() => {
    let done = false;
    const ready = () => {
      if (done) return;
      done = true;
      later(350, () => setPhase((p) => (p === 'speaking' ? 'ready' : p)));
    };
    if (line.audio) playNote(turn, 'play', ready);
    else later(READ_MS, ready);
    // A replay cut short still counts as heard; never strand her without replies.
    later(12000, ready);
    return () => {
      done = true;
    };
  }, [turn, line.audio, rate]);

  const say = (r: Turn['replies'][number]) => {
    if (phase !== 'ready') return;
    tap();
    stopAudio();
    setPhase('sent');
    later(SEND_MS, () => setMsgs((m) => [...m, { kind: 'me', reply: r }]));
    later(SEND_MS + TYPING_AT, () => {
      setMsgs((m) => [...m, { kind: 'typing' }]);
      setPhase('typing');
    });
    later(SEND_MS + TYPING_AT + TYPING_FOR, () => {
      setMsgs((m) => [...m.filter((x) => x.kind !== 'typing'), { kind: 'pancho', turn: turn + 1 }]);
      setTurn((t) => t + 1);
      setPhase('speaking');
    });
  };

  // He bobs while he talks: a small, slow rise and fall, off for reduced motion.
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduced || phase !== 'speaking') {
      bob.value = withTiming(0, { duration: 200 });
      return;
    }
    bob.value = withRepeat(withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [phase, reduced, bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * bob.value }] }));

  // The real thing: a Hablar chat in the café scene (hablar-start, A1). It is
  // eight lines and ends on its own summary; come back here to finish.
  const goLive = async () => {
    setLive(true);
    try {
      const res = await startHablar({ kind: 'scenario', topic_id: 'cafe', level: 'A1' });
      if ('session_id' in res) router.push(`/hablar-chat?session=${res.session_id}`);
      else if ('open' in res) router.push(`/hablar-chat?session=${res.open}`);
      else Alert.alert('Can’t start a live call', JSON.stringify(res));
    } catch (e) {
      Alert.alert('Can’t start a live call', String(e));
    } finally {
      setLive(false);
    }
  };

  const bottom = useSafeAreaInsets().bottom;
  const showReplies = phase === 'ready';
  const enter = (fromMe: boolean) =>
    reduced ? FadeIn.duration(150) : (fromMe ? FadeInRight : FadeInDown).duration(280).easing(EASE_OUT);
  return (
    <View style={styles.call}>
      <ScrollView
        ref={thread}
        style={{ flex: 1 }}
        contentContainerStyle={styles.callBody}
        onContentSizeChange={() => thread.current?.scrollToEnd({ animated: !reduced })}
        // The dock grows and shrinks with her replies: keep the newest note in view.
        onLayout={() => thread.current?.scrollToEnd({ animated: !reduced })}
        showsVerticalScrollIndicator={false}>
        <View style={styles.callHead}>
          <Animated.View style={[styles.callFace, bobStyle]}>
            <Image source={POSE.wave} style={styles.callFaceImg} contentFit="contain" accessibilityLabel="Pancho" />
          </Animated.View>
          <Text style={styles.callName}>Pancho</Text>
          <Text style={styles.callSub}>{phase === 'typing' ? 'recording a voice note…' : 'voice notes'}</Text>
        </View>
        {msgs.map((m, i) =>
          m.kind === 'pancho' ? (
            <Animated.View key={`p${m.turn}`} entering={i === 0 ? undefined : enter(false)} style={styles.noteWrapLeft}>
              <PanchoNote
                line={SCRIPT[m.turn]}
                rate={rate}
                playing={playing?.turn === m.turn ? playing : null}
                onPlay={(how) => {
                  tap();
                  playNote(m.turn, how);
                }}
              />
            </Animated.View>
          ) : m.kind === 'me' ? (
            <Animated.View key={`m${i}`} entering={enter(true)} style={styles.noteWrapRight}>
              <MyNote reply={m.reply} />
            </Animated.View>
          ) : (
            <Animated.View key={`t${i}`} entering={reduced ? FadeIn.duration(150) : FadeIn.duration(200)} style={{ alignSelf: 'flex-start' }}>
              <RecordingMic reduced={!!reduced} />
            </Animated.View>
          ),
        )}
      </ScrollView>

      <View style={[styles.callDock, { paddingBottom: 14 + bottom }]}>
        {over && showReplies ? (
          <Animated.View entering={reduced ? FadeIn.duration(150) : FadeInDown.duration(260).easing(EASE_OUT)} style={styles.callDockInner}>
            {/* The call above is scripted; the real one isn't, and says so. */}
            <Text style={styles.callReal}>In the app, you speak and Pancho answers. No script. Talk about anything.</Text>
            <Button title="End call" onPress={onDone} />
          </Animated.View>
        ) : showReplies && !over ? (
          // Her replies come up only once his note has played the first time,
          // one after the other; while she sends and he records, the dock is empty.
          <>
            <Animated.View entering={reduced ? FadeIn.duration(150) : FadeIn.duration(220)} style={styles.callHintRow}>
              <Text style={styles.callHint}>ANSWER WITH A VOICE NOTE</Text>
            </Animated.View>
            <View key={turn} style={styles.callDockInner}>
              {line.replies.map((r, k) => (
                <Animated.View key={r.es} entering={reduced ? FadeIn.duration(150) : FadeInDown.delay(60 + k * 80).duration(320).easing(EASE_OUT)}>
                  <Pressable
                    onPress={() => say(r)}
                    style={({ pressed }) => [styles.callReply, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
                    <View style={styles.replyMic}>
                      <Ionicons name="mic-outline" size={20} color={colors.ink} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.callReplyEs}>{r.es}</Text>
                      <Text style={styles.callReplyEn}>{r.en}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
            <Animated.Text entering={reduced ? FadeIn.duration(150) : FadeIn.delay(260).duration(240)} style={styles.callFoot}>
              Say it out loud, then tap it
            </Animated.Text>
          </>
        ) : phase === 'speaking' ? (
          // His note's first play: no replies yet, only this, at the bottom.
          <Animated.View entering={FadeIn.duration(200)} style={styles.callHintRow}>
            <Text style={styles.callHint}>LISTEN FIRST</Text>
            <TypingDots small />
          </Animated.View>
        ) : null}
        {admin ? (
          <Pressable onPress={() => void goLive()} disabled={live} hitSlop={8}>
            <Text style={styles.liveLink}>{live ? 'Starting…' : 'Admin: try the live AI call instead →'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** While he records his next note: a mic that pulses, as WhatsApp shows it. */
function RecordingMic({ reduced }: { reduced: boolean }) {
  const o = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    o.value = withRepeat(withTiming(0.3, { duration: 520, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(o);
  }, [reduced, o]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <View style={styles.typing} accessible accessibilityLabel="Pancho is recording a voice note">
      <Animated.View style={pulse}>
        <Ionicons name="mic" size={22} color={colors.primary} />
      </Animated.View>
    </View>
  );
}

/** His voice note in the thread: ▶ and the tortoise, its wave and length, the words. */
function PanchoNote({
  line,
  rate,
  playing,
  onPlay,
}: {
  line: Turn;
  rate: number;
  /** Set while this note sounds: how, and a key that restarts the wave on a replay. */
  playing: { how: 'play' | 'slow'; key: number } | null;
  onPlay: (how: 'play' | 'slow') => void;
}) {
  const secs = (line.es.split(/\s+/).length * 0.42) / rate;
  const shown = Math.max(1, Math.round(secs));
  return (
    <View style={styles.note}>
      <View style={styles.noteRow}>
        {line.audio ? (
          <CallAudio on={playing?.how ?? null} onPlay={onPlay} />
        ) : (
          <View style={[styles.notePlay, { opacity: 0.4 }]}>
            <Ionicons name="play" size={18} color={colors.onPrimary} />
          </View>
        )}
        <NoteWave
          bars={NOTE_WAVE.slice(0, 13)}
          runKey={playing?.key ?? null}
          durationMs={secs * 1000 * (playing?.how === 'slow' ? 1.25 : 1)}
        />
        <Text style={styles.noteTime}>{`0:0${Math.min(9, shown)}`}</Text>
      </View>
      <Text style={styles.callEs}>{line.es}</Text>
      <Text style={styles.callEn}>{line.en}</Text>
    </View>
  );
}

/**
 * A voice note's wave, alive while it plays: the bars fill rosa left to right
 * over the note's length, and the lit ones breathe. Still and soft otherwise.
 */
function NoteWave({ bars, runKey, durationMs }: { bars: number[]; runKey: number | null; durationMs: number }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (runKey == null) {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 160 });
      progress.value = withTiming(0, { duration: 260, easing: EASE_OUT });
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration: Math.max(600, durationMs), easing: Easing.linear });
    if (!reduced) pulse.value = withRepeat(withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [runKey, durationMs, reduced, progress, pulse]);
  return (
    <View style={styles.noteWave} accessible={false}>
      {bars.map((h, i) => (
        <WaveBar key={i} i={i} n={bars.length} h={h} progress={progress} pulse={pulse} />
      ))}
    </View>
  );
}

function WaveBar({
  i,
  n,
  h,
  progress,
  pulse,
}: {
  i: number;
  n: number;
  h: number;
  progress: { value: number };
  pulse: { value: number };
}) {
  const style = useAnimatedStyle(() => {
    // How lit this bar is: 0 until the fill reaches it, 1 once it has passed.
    const lit = Math.min(1, Math.max(0, progress.value * n - i));
    const wobble = 1 + 0.35 * pulse.value * lit * (i % 2 === 0 ? 1 : -0.6);
    return {
      backgroundColor: interpolateColor(lit, [0, 1], [NOTE_BAR_SOFT, colors.primary]),
      transform: [{ scaleY: wobble }],
    };
  });
  return <Animated.View style={[styles.noteBar, { height: h }, style]} />;
}

/** What she said, as her own bubble: rosa, on the right, just the words. */
function MyNote({ reply }: { reply: Turn['replies'][number] }) {
  return (
    <View style={styles.myNote}>
      <Text style={[styles.callEs, { color: colors.onPrimary, fontSize: 21, lineHeight: 26 }]}>{reply.es}</Text>
      <Text style={[styles.callEn, { color: colors.onPrimary, opacity: 0.85 }]}>{reply.en}</Text>
    </View>
  );
}

/** A voice note's wave: fixed, so it never changes between turns. */
const NOTE_WAVE = [10, 22, 14, 28, 18, 24, 12, 26, 16, 20, 10, 22, 14, 8, 18, 12];
const NOTE_BAR_SOFT = '#D9B3BC';

/** Pancho thinking: three dots taking turns, in his bubble where the words go. */
function TypingDots({ small }: { small?: boolean }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.value = withRepeat(withTiming(3, { duration: 900, easing: Easing.linear }), -1, false);
  }, [reduced, t]);
  return (
    <View style={small ? styles.dotsSmall : styles.dots} accessibilityLabel="Pancho is thinking">
      {[0, 1, 2].map((i) => (
        <Dot key={i} i={i} t={t} small={small} />
      ))}
    </View>
  );
}

function Dot({ i, t, small }: { i: number; t: { value: number }; small?: boolean }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(((t.value - i + 3) % 3) - 0.5);
    return { opacity: 0.35 + 0.65 * Math.max(0, 1 - d), transform: [{ translateY: -3 * Math.max(0, 1 - d) }] };
  });
  return <Animated.View style={[small ? styles.dotSmall : styles.dot, style]} />;
}

/** Soft ink that still reads on sage and on the cream dock. */
const CALL_SOFT = '#5E4A3C';

/**
 * Pancho's line, out loud: ▶ at his speed for her level, and the tortoise
 * slower still (four fifths of that), as everywhere else in the app.
 */
function CallAudio({ on, onPlay }: { on: 'play' | 'slow' | null; onPlay: (how: 'play' | 'slow') => void }) {
  return (
    <>
      <Pressable
        onPress={() => onPlay('play')}
        accessibilityRole="button"
        accessibilityLabel="Play Pancho's message"
        style={({ pressed }) => [styles.notePlay, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
        <Ionicons name={on === 'play' ? 'volume-high' : 'play'} size={18} color={colors.onPrimary} />
      </Pressable>
      <Pressable
        onPress={() => onPlay('slow')}
        accessibilityRole="button"
        accessibilityLabel="Play slowly"
        style={({ pressed }) => [styles.noteSlow, on === 'slow' && { backgroundColor: colors.primarySoft }, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
        <MaterialCommunityIcons name="tortoise" size={20} color={colors.primary} />
      </Pressable>
    </>
  );
}

// --- 9. lesson complete -------------------------------------------------------
// A festejo, like the cheer screens: the page is butter, the rays turn behind
// Pancho, "First class done!" slaps down as a sticker and the four parts land
// around him one by one, a tap each. His bubble says, gently, that this was a
// taste: in the course each part has its own full classes.

const STICKERS: {
  part: Part;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tilt: number;
  spot: { left?: number; right?: number; top: number };
}[] = [
  { part: 'class', icon: 'school', tilt: -14, spot: { left: 18, top: 6 } },
  { part: 'slang', icon: 'chatbubbles', tilt: 12, spot: { right: 18, top: 16 } },
  { part: 'culture', icon: 'earth', tilt: 10, spot: { left: 6, top: 150 } },
  { part: 'pancho', icon: 'call', tilt: -10, spot: { right: 8, top: 160 } },
];
const STICKER_AT = 600;
const STICKER_GAP = 110;

function Complete({ onAgain, onClose, onFinish }: { onAgain?: () => void; onClose: () => void; onFinish: () => void }) {
  const reduced = useReducedMotion();
  const bottom = useSafeAreaInsets().bottom;
  const { width, height } = useWindowDimensions();
  const raySize = Math.max(width, height) * 1.4;
  useEffect(() => {
    success();
    if (reduced) return;
    // One small tap for each sticker as it lands.
    const taps = STICKERS.map((_, k) => setTimeout(tap, STICKER_AT + 120 + k * STICKER_GAP));
    return () => taps.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.doneFull}>
      {/* The rays turn around Pancho, about 40% down the screen. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', width: raySize, height: raySize, left: (width - raySize) / 2, top: height * 0.4 - raySize / 2 }}>
        <Rays size={raySize} color="rgba(255,249,243,0.55)" />
      </View>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.doneBody} bounces={false}>
          <Text style={styles.doneKicker}>LESSON COMPLETE</Text>
          <Slap delay={150} tilt={0} style={styles.doneHeadline}>
            <OutlinedHeadline small="First class" big="done!" fill={colors.card} center />
          </Slap>
          <View style={styles.doneStage}>
            <In delay={300} style={styles.donePancho}>
              <Image source={POSE.cafe} style={styles.donePanchoImg} contentFit="contain" accessibilityLabel="Pancho" />
            </In>
            {STICKERS.map((s, i) => (
              <Slap key={s.part} delay={STICKER_AT + i * STICKER_GAP} tilt={s.tilt} style={[styles.doneSticker, s.spot, { backgroundColor: PARTS[s.part].color }]}>
                <Ionicons name={s.icon} size={28} color={s.part === 'class' ? colors.onPrimary : colors.ink} accessibilityLabel={PARTS[s.part].label} />
              </Slap>
            ))}
          </View>
          <In delay={1050} style={styles.doneBubble}>
            <Text style={styles.doneBubbleTitle}>You nailed it!</Text>
            <Text style={styles.doneBubbleLine}>
              Your first taste of Argentine Spanish. In your course, exercises, slang, culture and speaking each get their own full classes.
            </Text>
          </In>
        </ScrollView>
        <View style={[styles.doneDock, { paddingBottom: 20 + bottom }]}>
          <Button title="Continue" onPress={onFinish} />
          {onAgain ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button title="Play again" variant="secondary" small onPress={onAgain} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Back to admin" variant="ghost" small onPress={onClose} />
              </View>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

// --- styles -----------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  stage: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  bar: {
    height: 18,
    flexDirection: 'row',
    gap: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  barWrap: { flex: 1, gap: 6 },
  barPiece: { flex: 1, backgroundColor: colors.trough, overflow: 'hidden' },
  barLabels: { flexDirection: 'row', gap: 3 },
  barLabel: {
    flex: 1,
    textAlign: 'center',
    ...font.body[800],
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.muted,
  },
  barLabelOn: { color: colors.ink },
  barFill: { height: '100%' },
  chip: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
    boxShadow: clay.chip,
    marginBottom: 2,
  },
  chipText: { ...font.body[800], fontSize: 12, letterSpacing: 1.4, color: colors.ink },

  replyEn: { ...font.body[600], fontSize: 16, color: colors.muted },

  call: { flex: 1 },
  callBody: { paddingHorizontal: 20, paddingBottom: 18, gap: 12 },
  callHead: { alignItems: 'center', gap: 2, marginTop: 10, marginBottom: 6 },
  // His face and waving hand fill the circle: the figure, zoomed in on top.
  callFace: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: pastel.butter,
    boxShadow: `0 0 0 3px ${colors.ink}, 3px 4px 0 3px ${colors.ink}`,
  },
  callFaceImg: { position: 'absolute', width: 116, height: 173, left: -3, top: 7 },
  callName: { ...font.display[900], fontSize: 22, color: colors.ink, textAlign: 'center' },
  callSub: { ...font.body[600], fontSize: 13, color: colors.muted, textAlign: 'center' },
  noteWrapLeft: { alignSelf: 'flex-start', width: '90%' },
  noteWrapRight: { alignSelf: 'flex-end', maxWidth: '80%' },
  myNote: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    borderBottomRightRadius: 8,
    backgroundColor: colors.primary,
    boxShadow: `0 0 0 2.5px ${colors.ink}, 3px 4px 0 2.5px ${colors.ink}`,
  },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    backgroundColor: colors.card,
    boxShadow: `0 0 0 2.5px ${colors.ink}, 3px 4px 0 2.5px ${colors.ink}`,
  },
  typingText: { ...font.body[700], fontSize: 14, color: colors.muted },
  callDock: { paddingHorizontal: 20, paddingTop: 12, gap: 10, backgroundColor: colors.bg },
  note: {
    gap: 4,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: colors.card,
    boxShadow: `0 0 0 2.5px ${colors.ink}, 3px 4px 0 2.5px ${colors.ink}`,
  },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  notePlay: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  noteSlow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 2px ${colors.primary}` },
  noteWave: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, height: 32 },
  noteBar: { width: 4, borderRadius: 2 },
  noteTime: { ...font.body[700], fontSize: 13, color: colors.muted, minWidth: 28, textAlign: 'right' },
  callEs: { ...font.display[800], fontSize: 24, lineHeight: 29, color: colors.ink },
  callEn: { ...font.body[600], fontSize: 17, color: colors.muted },
  callDockInner: { gap: 12 },
  callReply: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    boxShadow: `0 0 0 2.5px ${colors.ink}, 3px 4px 0 2.5px ${colors.ink}`,
  },
  replyMic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastel.sage,
    boxShadow: `0 0 0 2px ${colors.ink}`,
  },
  callReplyEs: { ...font.display[800], fontSize: 21, lineHeight: 25, color: colors.ink },
  callReplyEn: { ...font.body[600], fontSize: 17, color: colors.muted },
  callFoot: { ...font.body[600], fontSize: 13, color: colors.muted, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, height: 34, alignItems: 'center', justifyContent: 'center' },
  dotsSmall: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dotSmall: { width: 5, height: 5, borderRadius: 3, backgroundColor: CALL_SOFT },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink },
  callHintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 16 },
  // Her pick, once tapped: her own line, in rosa like the rest of her side.
  callReplyMine: { backgroundColor: colors.primary },
  callHint: { ...font.body[800], fontSize: 12, letterSpacing: 1, color: CALL_SOFT, textAlign: 'center' },
  callReal: { ...font.body[800], fontSize: 15, lineHeight: 21, color: colors.ink, textAlign: 'center', paddingHorizontal: 8 },
  micNote: { ...font.body[600], fontSize: 12, color: colors.muted, textAlign: 'center' },
  liveLink: { ...font.body[800], fontSize: 13, color: colors.primaryDark, textAlign: 'center', paddingVertical: 6 },

  doneFull: { flex: 1, backgroundColor: pastel.butter, overflow: 'hidden' },
  doneBody: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 12, alignItems: 'center' },
  doneKicker: { ...font.body[800], fontSize: 13, letterSpacing: 1.6, color: colors.primaryDark },
  doneHeadline: { width: '100%', maxWidth: 390, marginTop: 10 },
  doneStage: { width: '100%', maxWidth: 340, height: 250, marginTop: 6 },
  donePancho: { position: 'absolute', left: 0, right: 0, top: 24, alignItems: 'center' },
  donePanchoImg: { width: 190, height: 210 },
  doneSticker: { position: 'absolute', width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', boxShadow: clay.button },
  doneBubble: {
    width: '100%',
    maxWidth: 330,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    alignItems: 'center',
    gap: 4,
  },
  doneBubbleTitle: { ...font.display[800], fontSize: 21, color: colors.ink, textAlign: 'center' },
  // Ink, not muted: on the butter page the muted brown read as faint.
  doneBubbleLine: { ...font.body[600], fontSize: 17, lineHeight: 24, color: colors.ink, textAlign: 'center' },
  doneDock: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },
});

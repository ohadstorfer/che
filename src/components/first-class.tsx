import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Fact, FactCard } from '@/app/culture-class';
import { ExerciseFrame, PageColorContext, type Verdict } from '@/components/exercise-frame';
import { AudioPad, Choices, Exercise, PlayButton } from '@/components/exercises';
import { POSE } from '@/components/mascot';
import { Button } from '@/components/ui';
import { WordIntro } from '@/components/word-intro';
import { CultureOpener, SlangOpener } from '@/components/slang-opener';
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
  culture: { label: 'CULTURE', color: pastel.sky },
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
  /** Opens the class at that part (slang, culture, pancho), for reviewing it. */
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
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);
  /** How far into the current screen she is, where one screen is a whole round (the slang class). */
  const [sub, setSub] = useState(0);
  /** The slang class's opener is up: the whole page turns butter, as it does in a real slang class. */
  const [butter, setButter] = useState(false);
  const screen = SCREENS[at];
  // The page takes the opener's colour while one is up: butter for slang, sky for culture.
  const tint = screen.id === 'culture-intro' ? pastel.sky : butter ? pastel.butter : null;
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
      return <FactCard key={id} fact={ASADO[0]} onDone={onNext} tapToAdvance={false} bigArt />;
    case 'asado-2':
      return <FactCard key={id} fact={ASADO[1]} onDone={onNext} tapToAdvance={false} bigArt />;
    case 'asado-3':
      return <FactCard key={id} fact={ASADO[2]} onDone={onNext} tapToAdvance={false} bigArt />;
    case 'call':
      return <CallStep admin={admin} rate={TALK_RATE[level]} onDone={onNext} onProgress={onProgress} />;
  }
}

// culture.json · asado / "More than a barbecue", pages 1, 4 and 6: what an
// asado is, then why it matters. Explained, never quizzed: a first day is no
// time to guess at a country she doesn't know yet. Art and tones as that
// class deals them (culture-art.ts, CARD_TONES).
const asadoCard = (n: number | ImageSourcePropType, text: string, bg: string): Fact => ({
  art: typeof n === 'number' ? artFor('asado', n) : n,
  text,
  hero: null,
  chip: 'More than a barbecue',
  bg,
});
const ASADO: Fact[] = [
  asadoCard(0, 'An **asado** is grilled meat, sure. But mostly it’s an excuse to spend the whole day together. **¿Hacemos un asado?** really means: want to hang out?', pastel.butter),
  asadoCard(3, 'An [asado] is also how Argentines celebrate almost anything: a birthday, a win, a new job, a Friday.', pastel.peach),
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
 *  · Pancho's note arrives and plays ('speaking'); her two replies wait dimmed
 *    in the dock, so she listens before she answers;
 *  · 350 ms after his audio ends they light up ('ready');
 *  · her tap ('sent'): the dock empties, and 120 ms later her reply lands in the
 *    thread as her own rosa note, under his;
 *  · 650 ms on, his "recording…" bubble appears ('typing'), for 1 s;
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

  // His newest note: its sound now, her replies once it ends.
  useEffect(() => {
    let done = false;
    const ready = () => {
      if (done) return;
      done = true;
      later(350, () => setPhase((p) => (p === 'speaking' ? 'ready' : p)));
    };
    if (line.audio) playAudio(line.audio, ready, rate);
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

  // Her replies: dimmed while he talks, lit for her turn, gone once sent.
  const lit = useSharedValue(0.4);
  useEffect(() => {
    const to = phase === 'ready' ? 1 : phase === 'speaking' ? 0.4 : 0;
    lit.value = withTiming(to, { duration: reduced ? 0 : phase === 'ready' ? 240 : 160, easing: EASE_OUT });
  }, [phase, reduced, lit]);
  const litStyle = useAnimatedStyle(() => ({ opacity: lit.value }));

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
  const hint =
    phase === 'ready' ? 'ANSWER WITH A VOICE NOTE' : phase === 'speaking' ? 'LISTEN FIRST' : phase === 'sent' ? 'SENT' : 'PANCHO IS RECORDING';
  return (
    <View style={styles.call}>
      <ScrollView
        ref={thread}
        style={{ flex: 1 }}
        contentContainerStyle={styles.callBody}
        onContentSizeChange={() => thread.current?.scrollToEnd({ animated: !reduced })}
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
              <PanchoNote line={SCRIPT[m.turn]} rate={rate} />
            </Animated.View>
          ) : m.kind === 'me' ? (
            <Animated.View key={`m${i}`} entering={enter(true)} style={styles.noteWrapRight}>
              <MyNote reply={m.reply} />
            </Animated.View>
          ) : (
            <Animated.View key={`t${i}`} entering={reduced ? FadeIn.duration(150) : FadeIn.duration(200)} style={{ alignSelf: 'flex-start' }}>
              <View style={styles.typing}>
                <TypingDots small />
                <Text style={styles.typingText}>recording…</Text>
              </View>
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
        ) : (
          <>
            <View style={styles.callHintRow}>
              <Text style={styles.callHint}>{over ? 'LISTEN FIRST' : hint}</Text>
              {showReplies ? null : <TypingDots small />}
            </View>
            {/* The same slots throughout, so the dock never jumps: dimmed while
                he talks, lit for her turn, emptied the moment she sends. */}
            <Animated.View key={turn} style={[styles.callDockInner, litStyle]}>
              {(over ? SCRIPT[turn - 1]?.replies ?? [] : line.replies).map((r) => (
                <Pressable
                  key={r.es}
                  onPress={() => say(r)}
                  disabled={!showReplies || over}
                  accessibilityState={{ disabled: !showReplies || over }}
                  style={({ pressed }) => [styles.callReply, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
                  <View style={styles.replyMic}>
                    <Ionicons name="mic-outline" size={20} color={colors.ink} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.callReplyEs}>{r.es}</Text>
                    <Text style={styles.callReplyEn}>{r.en}</Text>
                  </View>
                </Pressable>
              ))}
            </Animated.View>
            <Text style={[styles.callFoot, { opacity: showReplies ? 1 : 0 }]}>Say it out loud, then tap it</Text>
          </>
        )}
        {admin ? (
          <Pressable onPress={() => void goLive()} disabled={live} hitSlop={8}>
            <Text style={styles.liveLink}>{live ? 'Starting…' : 'Admin: try the live AI call instead →'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** His voice note in the thread: ▶ and the tortoise, its wave and length, the words. */
function PanchoNote({ line, rate }: { line: Turn; rate: number }) {
  const secs = Math.max(1, Math.round((line.es.split(/\s+/).length * 0.42) / rate));
  return (
    <View style={styles.note}>
      <View style={styles.noteRow}>
        {line.audio ? (
          <CallAudio path={line.audio} rate={rate} />
        ) : (
          <View style={[styles.notePlay, { opacity: 0.4 }]}>
            <Ionicons name="play" size={18} color={colors.onPrimary} />
          </View>
        )}
        <View style={styles.noteWave} accessible={false}>
          {NOTE_WAVE.slice(0, 13).map((h, i) => (
            <View key={i} style={[styles.noteBar, { height: h, backgroundColor: i < 5 ? colors.primary : NOTE_BAR_SOFT }]} />
          ))}
        </View>
        <Text style={styles.noteTime}>{`0:0${Math.min(9, secs)}`}</Text>
      </View>
      <Text style={styles.callEs}>{line.es}</Text>
      <Text style={styles.callEn}>{line.en}</Text>
    </View>
  );
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
function CallAudio({ path, rate }: { path: string; rate: number }) {
  const [on, setOn] = useState<'play' | 'slow' | null>(null);
  const go = (which: 'play' | 'slow') => {
    tap();
    setOn(which);
    playAudio(path, () => setOn(null), which === 'play' ? rate : rate * 0.8);
  };
  return (
    <>
      <Pressable
        onPress={() => go('play')}
        accessibilityRole="button"
        accessibilityLabel="Play Pancho's message"
        style={({ pressed }) => [styles.notePlay, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
        <Ionicons name={on === 'play' ? 'volume-high' : 'play'} size={18} color={colors.onPrimary} />
      </Pressable>
      <Pressable
        onPress={() => go('slow')}
        accessibilityRole="button"
        accessibilityLabel="Play slowly"
        style={({ pressed }) => [styles.noteSlow, on === 'slow' && { backgroundColor: colors.primarySoft }, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
        <MaterialCommunityIcons name="tortoise" size={20} color={colors.primary} />
      </Pressable>
    </>
  );
}

// --- 9. lesson complete -------------------------------------------------------

const STAMPS: { part: Part; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { part: 'class', label: 'Exercise', icon: 'school' },
  { part: 'slang', label: 'Slang', icon: 'chatbubbles' },
  { part: 'culture', label: 'Culture', icon: 'earth' },
  { part: 'pancho', label: 'Speaking', icon: 'call' },
];
const TILT = ['-7deg', '5deg', '6deg', '-5deg'];

function Complete({ onAgain, onClose, onFinish }: { onAgain?: () => void; onClose: () => void; onFinish: () => void }) {
  const reduced = useReducedMotion();
  const bottom = useSafeAreaInsets().bottom;
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current) success();
    fired.current = true;
  }, []);
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.doneBody}>
        <Text style={styles.doneKicker}>LESSON COMPLETE</Text>
        <Text style={styles.doneTitle}>Your first class: at the café</Text>
        <Text style={styles.doneLine}>You ordered, spoke like a porteño, learned the slang and what an asado really is. All in four minutes.</Text>
        <View style={styles.stamps}>
          {STAMPS.map((s, i) => (
            <Animated.View
              key={s.part}
              entering={reduced ? FadeIn.duration(150) : ZoomIn.duration(300).delay(150 + i * 140).easing(EASE_OUT)}
              style={[styles.stamp, { transform: [{ rotate: TILT[i] }] }]}>
              <View style={[styles.stampDisc, { backgroundColor: PARTS[s.part].color }]}>
                <Ionicons name={s.icon} size={30} color={s.part === 'class' ? colors.onPrimary : colors.ink} />
              </View>
              <Text style={styles.stampLabel}>{s.label}</Text>
              <Text style={styles.stampSub}>DONE</Text>
            </Animated.View>
          ))}
        </View>
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

  replyEn: { ...font.body[600], fontSize: 14, color: colors.muted },

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
  callEn: { ...font.body[600], fontSize: 15, color: colors.muted },
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
  callReplyEn: { ...font.body[600], fontSize: 15, color: colors.muted },
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

  doneBody: { padding: 24, paddingTop: 40, alignItems: 'center', gap: 12 },
  doneKicker: { ...font.body[800], fontSize: 13, letterSpacing: 1.6, color: colors.primaryDark },
  doneTitle: { ...font.display[900], fontSize: 32, lineHeight: 36, letterSpacing: -0.5, color: colors.ink, textAlign: 'center' },
  doneLine: { ...font.body[600], fontSize: 17, lineHeight: 24, color: colors.muted, textAlign: 'center', maxWidth: 320 },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 24, maxWidth: 340 },
  stamp: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.card,
  },
  stampDisc: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', boxShadow: clay.chip },
  stampLabel: { ...font.display[800], fontSize: 20, color: colors.accent },
  stampSub: { ...font.body[800], fontSize: 10, letterSpacing: 2, color: colors.accent },
  doneDock: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },
});

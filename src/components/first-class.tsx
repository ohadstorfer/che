import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CultureGlosses, type Fact, FactCard } from '@/app/culture-class';
import { In, Rays, Slap } from '@/components/cheer-bits';
import { ExerciseFrame, GentleContext, PageColorContext, type Verdict } from '@/components/exercise-frame';
import { Choices, Exercise, SentenceLine, SpeakerArtContext, WordMetContext,
  SpeechBubble, useWordPopover, WordBubble } from '@/components/exercises';
import { POSE } from '@/components/mascot';
import { QuitSheet } from '@/components/quit-sheet';
import { Button } from '@/components/ui';
import { WordIntro } from '@/components/word-intro';
import { CultureOpener, SlangOpener } from '@/components/slang-opener';
import { OutlinedHeadline } from '@/components/sticker';
import { type ArWord, type PackItem, arPacks, buildPackRound, toForm as arForm, toGapForm } from '@/lib/argentine';
import { stopAudio } from '@/lib/audio';
import fixture from '@/lib/first-class.json';
import { success, tap } from '@/lib/haptics';
import type { Level } from '@/lib/onboarding';
import type { QueueItem } from '@/lib/round';
import { type SentenceRow, toSentence } from '@/lib/sentences';
import { artFor } from '@/lib/culture-art';
import { courseArt, preloadWordArt } from '@/lib/word-art';
import { ContentBoundary } from '@/components/error-boundary';
import { type Part, type Screen, type Script, type Source, type Step, firstClassScript } from '@/lib/first-class-script';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel, radius } from '@/lib/theme';
import type { Form, Sentence } from '@/lib/types';

// ---------------------------------------------------------------------------
// "Your first class: at the café". One short class that mixes the four parts
// of the app (course, slang, culture) under one progress
// bar. It is the class inside onboarding (onboarding.tsx, after "Building your
// course"), and staff replay it from admin/first-class.tsx with the admin
// extras (Play again). The scripted call with Pancho at the end was cut on
// 2026-11-18: it wasn't the real AI, felt worse than it, and made the class longer.
//
// Content is real: the course rows (forms + sentences, their recordings) are a
// snapshot of the database in first-class.json, the slang words come from
// argentine.json, one asado card from culture.json. Nothing is graded or saved.
// ---------------------------------------------------------------------------

// What it shows is a Script (lib/first-class-script.ts): this local class, or
// a `first_classes` row when app_config `first_class_source` says "db".

const PARTS: Record<Part, { label: string; color: string }> = {
  class: { label: 'EXERCISE', color: colors.primary },
  slang: { label: 'SLANG', color: pastel.butter },
  culture: { label: 'CULTURE', color: pastel.peach },
};


/** The exercise part teaches medialuna: Pancho holds his box of facturas on every screen of it. */
const PANCHO_FACTURAS = require('@/assets/images/capybara/capybara-facturas-figure.webp');

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const NEXT = FadeInRight.duration(240).easing(EASE_OUT);

// --- content ------------------------------------------------------------------

const ID = {
  medialuna: '61df6d82-e066-542f-b158-5524f130294e',
  che: '91232a84-b055-5e03-8ed2-651c79f5b376',
  querés: '94890c85-b399-59cf-bb96-6552de128c40',
  medialunas: '362f3213-c426-54c2-9702-c788da937db5',
  cheQuerésMedialunas: '2e1e0e3c-0847-520b-b36f-af53f7070321',
  medialunaGracias: 'c2268e3e-a367-5746-bba2-28619fa7f2b7',
  algoMás: 'be99423e-6489-5a9f-878f-500251f4e8a3',
  querésUnCafé: '299d346b-881a-5ef3-a8e1-b3ca97fb52cf',
  o: '14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c',
};

const allWords = arPacks.flatMap((p) => p.words);
const arWord = (id: string) => allWords.find((w) => w.id === id)!;

// The card's own example is not the café's; this one is, recorded in Malena's
// voice like the word itself (scripts/first-class/tts.mjs).
const RE: ArWord = {
  ...arWord('re'),
  example: { es: '¡La medialuna está re rica!', en: 'The medialuna is really tasty!', audio: 'argentine/d2aff656364e13ce0f76.mp3' },
  gap: 're',
};

function localContent() {
  {
    // "medialuna" glossed as "medialuna" taught nothing. Said plainly instead,
    // and that it isn't a croissant (2026-11-18).
    const forms = (fixture.forms as unknown as Form[]).map((f) =>
      f.id === ID.medialuna
        ? {
            ...f,
            gloss_en: 'Argentine pastry',
            meaning_en: 'A common Argentine pastry. Not a croissant, though it looks like one.',
            // The croissant line is for the New word screen only: the tap bubble
            // gives just the short gloss, as it does for every word in the app.
            gloss_note_en: null,
          }
        : f.id === ID.medialunas
          ? {
              ...f,
              gloss_en: 'Argentine pastries',
              meaning_en: 'Common Argentine pastries. Not croissants, though they look like them.',
              gloss_note_en: null,
            }
          : f,
    );
    const byId = new Map(forms.map((f) => [f.id, f]));
    const sentences = (fixture.sentences as unknown as SentenceRow[]).map((r) => toSentence(r, byId));
    const sentence = (id: string) => sentences.find((s) => s.id === id)!;
    const form = (id: string) => byId.get(id)!;

    // A course sentence, changed here from "tenés" to "querés" and without its
    // "Che," (one new word a screen: 2026-11-18). Its recording says "Che,
    // ¿tenés…", so it is read, not heard. Marked as already seen: a brand-new
    // build wears the "Harder" badge, wrong on a first class.
    const withChe = sentence(ID.cheQuerésMedialunas);
    const build: Sentence = {
      ...withChe,
      es: '¿Querés medialunas?',
      en: 'Do you want medialunas?',
      es_alt: ['¿Vos querés medialunas?'],
      en_alt: ['Would you like medialunas?', 'Want some medialunas?', 'Do you want some medialunas?'],
      // "¿querés" opens the sentence now: its capital back.
      tokens: withChe.tokens
        .filter((t) => !t.form_ids.includes(ID.che))
        .map((t, i) => (i === 0 ? { ...t, surface: t.surface.replace(/\p{Ll}/u, (c) => c.toLocaleUpperCase('es')) } : t)),
      audio_path: null,
      shown: { shown_count: 9, correct_count: 9, last_shown_at: null },
    };

    const item = (i: Omit<QueueItem, 'state'>): QueueItem => ({ ...i, state: null });

    // The first question of all is an easy read: its wrong answers are short
    // lines with no medialuna in them, so the right one stands out at a glance
    // ("A medialuna, thanks." against "Anything else?" and "Do you want a
    // coffee?"), and never the next screen's sentence (2026-11-18).
    const short = [ID.medialunaGracias, ID.algoMás, ID.querésUnCafé].map(sentence);

    // The build's spare tiles: never another form of its own words
    // ("medialuna" beside "medialunas", "u" for "o"), which turns an easy
    // first build into a spot-the-difference.
    const own = new Set([ID.che, ID.querés, ID.medialunas, ID.o].map((id) => form(id).lemma_id));
    // "che" isn't in the sentence any more, but as a spare tile it would still
    // be a word she hasn't met: kept out with the rest.
    const buildForms = forms.filter((f) => !own.has(f.lemma_id));

    return {
      forms,
      lexicon: byId,
      sentences,
      short,
      buildForms,
      offer: build,
      medialuna: item({
        form: form(ID.medialuna),
        mode: 'sentence_intro',
        direction: 'es_to_en',
        sentence: sentence(ID.medialunaGracias),
        introduces: form(ID.medialuna),
      }),
      build: item({
        form: form(ID.querés),
        mode: 'sentence_build',
        direction: 'en_to_es',
        sentence: build,
        group: [form(ID.querés), form(ID.medialunas)],
      }),
    };
  }
}

// Short on purpose (2026-11-18): the exercise part is one word, medialuna, met
// and then used; the slang part one word, re; the culture part one card. The
// café-order listening screen that opened it is gone: a second new word
// before the first had landed.
let localCache: ReturnType<typeof localContent> | null = null;
function localScript(level: Level): Script {
  const c = (localCache ??= localContent());
  return {
    source: 'local',
    screens: [
      { id: 'medialuna', part: 'class', step: { kind: 'exercise', item: c.medialuna, sentences: c.short, forms: c.forms, lexicon: c.lexicon, twoStep: true } },
      // Beginners pick a picture; who knows some Spanish builds the sentence.
      {
        id: 'build',
        part: 'class',
        step: BEGINNER[level]
          ? {
              kind: 'picture',
              prompt: 'What is Pancho offering you?',
              line: c.offer,
              options: OFFERS.map((o) => ({ id: o.id, label: o.label, image: courseArt(o.lemma)! })),
              correctId: 'right',
              answer: 'Medialunas',
            }
          : { kind: 'exercise', item: c.build, sentences: c.sentences, forms: c.buildForms, twoStep: false },
      },
      { id: 'slang', part: 'slang', step: { kind: 'slang', words: SLANG_WORDS, decoys: SLANG_DECOYS.map(arWord) } },
      { id: 'culture-intro', part: 'culture', step: { kind: 'culture_intro' } },
      { id: 'asado', part: 'culture', step: { kind: 'culture_card', fact: ASADO, section: 'asado', cls: 'el-ritual' } },
    ],
    lexicon: c.lexicon,
    doneLine: 'Medialuna, re, asado. Three words in, many more to go.',
    speakerArt: PANCHO_FACTURAS,
    preload: OFFERS.flatMap((o) => courseArt(o.lemma) ?? []),
  };
}

/** Which class a script is, for a resume: 'local' or its first_classes row. */
const scriptKey = (s: Script) => (s.source === 'db' && s.rowId ? s.rowId : 'local');

/** The class to play: what the switch says, or the local one until it answers. */
function useScript(level: Level, force?: Source, resumingLocal?: boolean): Script | null {
  const [ask] = useState(() => firstClassScript(level, () => localScript(level), PANCHO_FACTURAS, force));
  // Back after a restart in the local class: no wait (it was instant before
  // the switch existed). Back in a database class: its answer is waited for
  // like a first start, so she lands in the class she was in.
  const [script, setScript] = useState<Script | null>(() => ask.peek ?? (resumingLocal && !force ? localScript(level) : null));
  useEffect(() => {
    if (script) return;
    let live = true;
    void ask.promise.then((s) => live && setScript(s));
    return () => {
      live = false;
    };
  }, [ask]);
  return script;
}

// --- the screen ---------------------------------------------------------------

export type { Part as FirstClassPart } from '@/lib/first-class-script';

export function FirstClassLesson({
  part,
  startAt,
  startScript,
  onProgress,
  admin,
  level = 'none',
  source,
  onFinish,
  onClose,
}: {
  /** Opens the class at that part (slang, culture), or on its end screen (done), for reviewing it. */
  part?: string;
  /** Back after the app closed mid-class: the screen she was on, or its end screen. */
  startAt?: number | 'done';
  /** Which class `startAt` counts in ('local' or a first_classes row id), as onProgress gave it. */
  startScript?: string;
  /** Each screen she reaches, and which class it is in, so onboarding can bring her back to it after a restart. */
  onProgress?: (at: number | 'done', script: string) => void;
  /** Her answer in onboarding: how fast Pancho talks on the call. */
  level?: Level;
  /** Staff replaying it: Play again and Back to admin. */
  admin?: boolean;
  /** Staff preview: this source whatever the switch says. */
  source?: Source;
  /** The lesson-complete screen's Continue. */
  onFinish: () => void;
  onClose: () => void;
}) {
  const script = useScript(level, source, startAt !== undefined && (startScript ?? 'local') === 'local');
  // Waiting on the database (seconds at most, then the local class): the page, blank.
  if (!script) return <Waiting />;
  // A screen number saved in another class than the one playing now (the
  // database answer changed, or timed out this time): from the start, not a
  // screen of a different class.
  const sameClass = (startScript ?? 'local') === scriptKey(script);
  const props = {
    part,
    startAt: startAt === 'done' || sameClass ? startAt : undefined,
    onProgress,
    admin: !!admin,
    level,
    onFinish,
    onClose,
  };
  if (script.source === 'local') return <Lesson script={script} {...props} />;
  // A database class that crashes while drawing: the local class takes over.
  return (
    <ContentBoundary fallback={<LocalFallback {...props} />}>
      <Lesson script={script} {...props} />
    </ContentBoundary>
  );
}

/** The local class, built only if the database one crashed. */
function LocalFallback({ level, ...props }: Omit<Parameters<typeof Lesson>[0], 'script'>) {
  const [script] = useState(() => localScript(level));
  return <Lesson script={script} level={level} {...props} />;
}

/** The blank page while the class is decided. Android's back waits too: it
 *  must not reach onboarding's handler and leave the app mid-class. */
function Waiting() {
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => h.remove();
  }, []);
  return <View style={styles.safe} />;
}

function Lesson({
  script,
  part,
  startAt,
  onProgress,
  admin,
  level,
  onFinish,
  onClose,
}: {
  script: Script;
  part?: string;
  startAt?: number | 'done';
  onProgress?: (at: number | 'done', script: string) => void;
  admin: boolean;
  level: Level;
  onFinish: () => void;
  onClose: () => void;
}) {
  const SCREENS = script.screens;
  // Its pictures, so they are in memory before their screen.
  useEffect(() => preloadWordArt(script.preload), [script]);
  const [at, setAt] = useState(() =>
    typeof startAt === 'number' && startAt < SCREENS.length ? startAt : Math.max(SCREENS.findIndex((x) => x.part === part), 0),
  );
  const [done, setDone] = useState(part === 'done' || startAt === 'done');
  const progress = useRef(onProgress);
  progress.current = onProgress;
  useEffect(() => progress.current?.(done ? 'done' : at, scriptKey(script)), [at, done, script]);
  const [run, setRun] = useState(0);
  /** How far into the current screen she is, where one screen is a whole round (the slang class). */
  const [sub, setSub] = useState(0);
  /** The slang class's opener is up: the whole page turns butter, as it does in a real slang class. */
  const [butter, setButter] = useState(false);
  const screen = SCREENS[at];
  // Where people leave (2026-11-18): one event per screen reached, and per
  // step inside the slang round, plus the end. Never for staff replays.
  const posthog = usePostHog();
  const track = useRef<{ key: string; capture?: typeof posthog }>({ key: '' });
  track.current.capture = admin ? undefined : posthog;
  useEffect(() => {
    const key = done ? 'done' : `${at}:${sub.toFixed(2)}`;
    if (track.current.key === key) return;
    track.current.key = key;
    track.current.capture?.capture(
      done ? 'first_class_done' : 'first_class_screen',
      done
        ? { level, source: script.source, row: script.rowId ?? null }
        : { screen: SCREENS[at].id, part: SCREENS[at].part, index: at, step: Number(sub.toFixed(2)), level, source: script.source, row: script.rowId ?? null },
    );
  }, [at, sub, done, level, SCREENS, script]);
  // The page takes the opener's colour while one is up: butter for slang, peach for culture.
  const tint = done ? pastel.butter : screen.step.kind === 'culture_intro' ? pastel.peach : butter ? pastel.butter : null;
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
    setQuitting(false);
    if (!admin && !done) posthog?.capture('first_class_quit', { screen: screen.id, index: at, step: Number(sub.toFixed(2)), level, source: script.source, row: script.rowId ?? null });
    onClose();
  };
  // As in a real class: once she is past the first screen, the close button
  // (or Android's back) asks first, because leaving throws the class away.
  const [quitting, setQuitting] = useState(false);
  const begun = at > 0 || sub > 0;
  const askClose = () => (begun && !admin ? setQuitting(true) : close());
  const askRef = useRef(askClose);
  askRef.current = askClose;
  const backState = useRef({ done, quitting });
  backState.current = { done, quitting };
  // Android's back, for the whole class including its end screen (onboarding
  // leaves it to this handler): with the sheet up it closes the sheet, as in a
  // real class; on "First class done!" it does nothing (Continue moves on).
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (backState.current.done) return true;
      if (backState.current.quitting) setQuitting(false);
      else askRef.current();
      return true;
    });
    return () => h.remove();
  }, []);

  if (done) return <Complete line={script.doneLine} onAgain={admin ? restart : undefined} onClose={close} onFinish={onFinish} />;

  // Slang and culture open with their own screens: no chip.
  const ownOpener = screen.step.kind === 'slang' || screen.step.kind === 'culture_intro';
  const startsPart = (at === 0 || SCREENS[at - 1].part !== screen.part) && !ownOpener;

  return (
    <SafeAreaView style={[styles.safe, tint ? { backgroundColor: tint } : null]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={askClose} hitSlop={12} accessibilityLabel="Close" style={{ marginTop: -4 }}>
          <Ionicons name="close" size={26} color={tint ? colors.ink : colors.muted} />
        </Pressable>
        <PartBar screens={SCREENS} at={at + sub} />
      </View>
      {startsPart ? <PartChip key={`chip-${at}-${run}`} part={screen.part} /> : null}
      <PageColorContext.Provider value={tint ?? colors.bg}>
        <GentleContext.Provider value>
          <SpeakerArtContext.Provider value={screen.part === 'class' ? script.speakerArt : null}>
            <Animated.View key={`${screen.id}-${run}`} entering={at === 0 ? FadeIn.duration(200) : NEXT} style={styles.stage}>
              <ScreenView step={screen.step} lexicon={script.lexicon} onNext={next} onProgress={setSub} onOpening={setButter} />
            </Animated.View>
          </SpeakerArtContext.Provider>
        </GentleContext.Provider>
      </PageColorContext.Provider>
      <QuitSheet open={quitting} test={false} onStay={() => setQuitting(false)} onQuit={close} />
    </SafeAreaView>
  );
}

function ScreenView({
  step,
  lexicon,
  onNext,
  onProgress,
  onOpening,
}: {
  step: Step;
  lexicon: Map<string, Form>;
  onNext: () => void;
  onProgress: (share: number) => void;
  onOpening: (opening: boolean) => void;
}) {
  switch (step.kind) {
    case 'exercise': {
      const exercise = (
        <Exercise
          item={step.item}
          allForms={step.forms}
          allSentences={step.sentences}
          lexicon={step.lexicon}
          onIntroDone={onNext}
          onAnswered={() => onNext()}
        />
      );
      // Its New word screen and its question are two steps: the bar moves after the first.
      return step.twoStep ? <WordMetContext.Provider value={() => onProgress(0.5)}>{exercise}</WordMetContext.Provider> : exercise;
    }
    case 'picture':
      return <PictureStep step={step} lexicon={lexicon} onDone={onNext} />;
    case 'slang':
      return <SlangRound words={step.words} decoyWords={step.decoys} onDone={onNext} onProgress={onProgress} onOpening={onOpening} />;
    case 'culture_intro':
      return <CultureOpener onStart={onNext} />;
    case 'culture_card':
      return (
        <CultureGlosses section={step.section} cls={step.cls}>
          <FactCard fact={step.fact} onDone={onNext} tapToAdvance={false} bigArt />
        </CultureGlosses>
      );
  }
}

// culture.json · asado / "More than a barbecue", page 1: what an asado is
// really about. One card since 2026-11-18 (it was three, and the culture part
// is where people left). Explained, never quizzed: a first day is no time to
// guess at a country she doesn't know yet. Art and tone as that class deals
// them (culture-art.ts, CARD_TONES).
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
const ASADO: Fact = asadoCard(
  artFor('asado', 0),
  'An **asado** is grilled meat, sure. But mostly it’s an excuse to spend the whole day together. **¿Hacemos un asado?** really means: want to hang out?',
  pastel.butter,
);

// --- the bar: one track, a piece per run of a part, each in its colour --------

/** The first piece never starts empty: a sliver is already filled, so the bar
 *  reads as "you've begun" from the first screen. */
const HEAD_START = 0.15;

/** Fast progress: each part's first steps fill most of its piece, the last
 *  ones a little (ease-out: a third of the way shows as over half). */
const frontLoaded = (raw: number) => 1 - (1 - raw) ** 2;

function PartBar({ screens: SCREENS, at }: { screens: Screen[]; at: number }) {
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

/** The part's name, stuck on when the part starts: EXERCISE, SLANG, CULTURE. */
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

// --- 2. beginners: what is he offering? ---------------------------------------
// The build asks a beginner for Spanish she doesn't have yet. She has just met
// "medialuna", so here she reads Pancho's line and taps its picture: "querés"
// comes along without being asked, and any word of the line can be tapped for
// its meaning, as in a real class.

/** Levels that pick a picture instead of building the sentence. */
const BEGINNER: Record<Level, boolean> = { none: true, basics: true, learning: false, spanish: false, conversational: false };

const OFFERS = [
  { id: 'right', label: 'Medialunas', lemma: 'aa5883af-95bf-5b63-a33a-9dc346c549ca' },
  { id: 'pizza', label: 'Pizza', lemma: '6ddd50e0-dea7-59da-b239-b1ab69cf7824' },
  { id: 'helado', label: 'Ice cream', lemma: '33c92145-598a-56f6-ab96-f3b6584caf1d' },
  { id: 'jugo', label: 'Orange juice', lemma: '6d2c0df3-c171-5f0e-a6f9-1c6b55dde303' },
];

type PictureStepProps = Extract<Step, { kind: 'picture' }>;

function PictureStep({ step, lexicon, onDone }: { step: PictureStepProps; lexicon: Map<string, Form>; onDone: () => void }) {
  const words = useWordPopover((id) => lexicon.get(id));
  const options = useMemo(() => [...step.options].sort(() => Math.random() - 0.5), [step]);
  const images = useMemo(
    () => (step.options.every((o) => o.image) ? Object.fromEntries(step.options.map((o) => [o.id, o.image!])) : undefined),
    [step],
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  return (
    <ExerciseFrame
      prompt={step.prompt}
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({
          correct: chosen === step.correctId,
          answer: step.answer,
          note: `${step.line.es} · ${step.line.en}`,
        })
      }
      onContinue={onDone}>
      <SpeechBubble>
        <SentenceLine sentence={step.line} onWord={words.open} />
      </SpeechBubble>
      <WordBubble state={words.showing} onClose={words.close} />
      <Choices options={options} images={images} correctId={step.correctId} chosen={chosen} revealed={verdict !== null} onPick={setChosen} />
    </ExerciseFrame>
  );
}

// --- the slang class -------------------------------------------------------------
// A unit's slang class as the road plays it (argentine-round.tsx, first time):
// the butter SLANG opener, the card introduced, then its meaning asked, then
// its gap. One word since 2026-11-18 ("dale" went: two new words was too much
// for a taste). A miss is not asked again. Nothing is scored or saved.

const SLANG_WORDS = [RE];

/** The wrong answers, picked by hand so none is close to the word: things,
 *  not reactions. "ahre" right after "re" got people wrong for the look of
 *  it, not the meaning (2026-11-18). */
const SLANG_DECOYS = ['celu', 'cumple', 'finde'];
function SlangRound({
  words,
  decoyWords: decoys,
  onDone,
  onProgress,
  onOpening,
}: {
  words: ArWord[];
  decoyWords: ArWord[];
  onDone: () => void;
  onProgress: (share: number) => void;
  onOpening: (opening: boolean) => void;
}) {
  const [queue] = useState<PackItem[]>(() => buildPackRound(words, true));
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
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
  const onAnswered = () => {
    if (current.kind !== 'exercise') return;
    next(queue);
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

// --- 8. lesson complete -------------------------------------------------------
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
];
const STICKER_AT = 600;
const STICKER_GAP = 110;

function Complete({ line, onAgain, onClose, onFinish }: { line: string; onAgain?: () => void; onClose: () => void; onFinish: () => void }) {
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
            <Text style={styles.doneBubbleLine}>{line}</Text>
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

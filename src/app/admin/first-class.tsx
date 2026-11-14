import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChoiceStep, type Fact, FactCard } from '@/app/culture-class';
import { ExerciseFrame, PageColorContext, type Verdict } from '@/components/exercise-frame';
import { AudioPad, Choices, Exercise, PlayButton, SpeechBubble } from '@/components/exercises';
import { PanchoAvatar } from '@/components/hablar-ui';
import { Button } from '@/components/ui';
import { WordIntro } from '@/components/word-intro';
import {
  type ArWord,
  arPacks,
  decoyWords,
  toForm as arForm,
  toGapForm,
  toSentence as arSentence,
} from '@/lib/argentine';
import { playAudio, stopAudio } from '@/lib/audio';
import fixture from '@/lib/first-class.json';
import { start as startHablar } from '@/lib/hablar';
import { success, tap } from '@/lib/haptics';
import type { QueueItem } from '@/lib/round';
import { type SentenceRow, toSentence } from '@/lib/sentences';
import { clay, colors, font, pastel, radius } from '@/lib/theme';
import type { Form, Sentence } from '@/lib/types';

// ---------------------------------------------------------------------------
// ADMIN PROTOTYPE — "Your first class: at the café". One short class that
// mixes the four parts of the app (course, slang, culture, a call with
// Pancho) under one progress bar, to judge the feel of a first class at the
// end of onboarding before it is wired in. Not linked from onboarding.
//
// Content is real: the course rows (forms + sentences, their recordings) are a
// snapshot of the database in first-class.json, the slang words come from
// argentine.json, the tip card from culture.json. Nothing is graded or saved.
// ---------------------------------------------------------------------------

type Part = 'class' | 'slang' | 'culture' | 'pancho';

const PARTS: Record<Part, { label: string; color: string }> = {
  class: { label: 'CLASS', color: colors.primary },
  slang: { label: 'SLANG', color: pastel.butter },
  culture: { label: 'CULTURE', color: pastel.sky },
  pancho: { label: 'SPEAKING', color: pastel.sage },
};

type ScreenId =
  | 'order'
  | 'vos'
  | 'medialuna'
  | 'build'
  | 'waiter'
  | 'dale'
  | 'dale-gap'
  | 'tip-guess'
  | 'tip-card'
  | 're'
  | 're-gap'
  | 'call';

const SCREENS: { id: ScreenId; part: Part }[] = [
  { id: 'order', part: 'class' },
  { id: 'vos', part: 'class' },
  { id: 'medialuna', part: 'class' },
  { id: 'build', part: 'class' },
  { id: 'waiter', part: 'slang' },
  { id: 'dale', part: 'slang' },
  { id: 'dale-gap', part: 'slang' },
  { id: 're', part: 'slang' },
  { id: 're-gap', part: 'slang' },
  { id: 'tip-guess', part: 'culture' },
  { id: 'tip-card', part: 'culture' },
  { id: 'call', part: 'pancho' },
];

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const NEXT = FadeInRight.duration(240).easing(EASE_OUT);

// --- content ------------------------------------------------------------------

const ID = {
  cortado: '495df4cb-c037-5679-aa48-1c6b79f02ad6',
  medialuna: '61df6d82-e066-542f-b158-5524f130294e',
  me: 'be20724b-3be1-5bcc-801e-f13718511443',
  das: 'e057e89e-3024-5bdb-ba47-9dfef6ad3b2d',
  un: '060197a5-9154-5a14-ac6d-8a8ffa3e9f6b',
  cafeConMedialuna: '96de3eee-afab-511a-9d87-c0f68c2f35bb',
  querésUnCafé: '299d346b-881a-5ef3-a8e1-b3ca97fb52cf',
  algoMás: 'be99423e-6489-5a9f-878f-500251f4e8a3',
};

/** The opener of the Hablar café scene (hablar.json, cafe · A1), in Tomás's voice. */
const CALL_OPENER_AUDIO = 'hablar/cfed6eee32d9b08b5299.mp3';

const allWords = arPacks.flatMap((p) => p.words);
const arWord = (id: string) => allWords.find((w) => w.id === id)!;
const packOf = (id: string) => arPacks.find((p) => p.words.some((w) => w.id === id))!;

const DALE = arWord('dale');
// The pack's own example is about the cinema; here it is the café's. It has no
// recording yet, so the line is read, not heard.
const RE: ArWord = { ...arWord('re'), example: { es: '¡La medialuna está re rica!', en: 'The medialuna is really tasty!' }, gap: 're' };

function useContent() {
  return useMemo(() => {
    const forms = fixture.forms as unknown as Form[];
    const byId = new Map(forms.map((f) => [f.id, f]));
    const sentences = (fixture.sentences as unknown as SentenceRow[]).map((r) => toSentence(r, byId));
    const sentence = (id: string) => sentences.find((s) => s.id === id)!;
    const form = (id: string) => byId.get(id)!;

    // "¿Me das un cortado?" isn't a course sentence yet: put together from
    // course forms, with no recording.
    const build: Sentence = {
      id: 'first-class:me-das-un-cortado',
      unit_id: '',
      es: '¿Me das un cortado?',
      en: 'Can I get a cortado?',
      en_alt: ['Can you give me a cortado?', 'Could I have a cortado?'],
      es_alt: [],
      audio_path: null,
      voice_id: null,
      target_form_id: ID.cortado,
      difficulty: 1,
      tokens: [
        { surface: '¿Me', form_ids: [], glue: ID.me },
        { surface: 'das', form_ids: [ID.das] },
        { surface: 'un', form_ids: [], glue: ID.un },
        { surface: 'cortado?', form_ids: [ID.cortado] },
      ],
      form_ids: [ID.das, ID.cortado],
      // As if already seen: a brand-new build wears the "Harder" badge, which
      // is wrong on a learner's very first class.
      shown: { shown_count: 9, correct_count: 9, last_shown_at: null },
    };

    const item = (i: Omit<QueueItem, 'state'>): QueueItem => ({ ...i, state: null });
    const slangGap = (w: ArWord) =>
      item({ form: toGapForm(w), mode: 'sentence_gap', direction: 'en_to_es', sentence: arSentence(w) });

    return {
      forms,
      lexicon: byId,
      sentences,
      cortado: form(ID.cortado),
      querés: sentence(ID.querésUnCafé),
      algoMás: sentence(ID.algoMás),
      medialuna: item({
        form: form(ID.medialuna),
        mode: 'sentence_intro',
        direction: 'es_to_en',
        sentence: sentence(ID.cafeConMedialuna),
        introduces: form(ID.medialuna),
      }),
      build: item({
        form: form(ID.cortado),
        mode: 'sentence_build',
        direction: 'en_to_es',
        sentence: build,
        group: [form(ID.das), form(ID.cortado)],
      }),
      daleGap: slangGap(DALE),
      reGap: slangGap(RE),
      daleDecoys: decoyWords(packOf('dale')).map(toGapForm),
      reDecoys: decoyWords(packOf('re')).map(toGapForm),
    };
  }, []);
}

// --- the screen ---------------------------------------------------------------

export default function FirstClass() {
  const content = useContent();
  const [at, setAt] = useState(0);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);
  const screen = SCREENS[at];

  const next = () => {
    stopAudio();
    if (at + 1 < SCREENS.length) setAt(at + 1);
    else setDone(true);
  };
  const restart = () => {
    stopAudio();
    setAt(0);
    setDone(false);
    setRun((r) => r + 1);
  };
  const close = () => {
    stopAudio();
    if (router.canGoBack()) router.back();
    else router.replace('/admin');
  };

  if (done) return <Complete onAgain={restart} onClose={close} />;

  const startsPart = at === 0 || SCREENS[at - 1].part !== screen.part;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close" style={{ marginTop: -4 }}>
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
        <PartBar at={at} />
      </View>
      {startsPart ? <PartChip key={`chip-${at}-${run}`} part={screen.part} /> : null}
      <PageColorContext.Provider value={colors.bg}>
        <Animated.View key={`${screen.id}-${run}`} entering={at === 0 ? FadeIn.duration(200) : NEXT} style={styles.stage}>
          <ScreenView id={screen.id} content={content} onNext={next} />
        </Animated.View>
      </PageColorContext.Provider>
    </SafeAreaView>
  );
}

function ScreenView({ id, content, onNext }: { id: ScreenId; content: ReturnType<typeof useContent>; onNext: () => void }) {
  const exercise = (item: QueueItem, forms: Form[] = content.forms) => (
    <Exercise
      item={item}
      allForms={forms}
      allSentences={content.sentences}
      lexicon={content.lexicon}
      onIntroDone={onNext}
      onAnswered={() => onNext()}
    />
  );
  switch (id) {
    case 'order':
      return <OrderStep cortado={content.cortado} onDone={onNext} />;
    case 'vos':
      return <VosStep audio={content.querés.audio_path} onDone={onNext} />;
    case 'medialuna':
      return exercise(content.medialuna);
    case 'build':
      return exercise(content.build);
    case 'waiter':
      return <WaiterStep algoMás={content.algoMás.audio_path} onDone={onNext} />;
    case 'dale':
      return <WordIntro word={DALE} onDone={onNext} />;
    case 'dale-gap':
      return exercise(content.daleGap, content.daleDecoys);
    case 'tip-guess':
      return (
        <ChoiceStep
          prompt="How much do you tip at a café in Argentina?"
          options={['About 10%, often in cash', 'Nothing. Tipping is rude here', '20%, like in the US']}
          correct={0}
          explain="Tipping is normal here, just smaller than in the US."
          onDone={onNext}
        />
      );
    case 'tip-card':
      return <FactCard fact={TIP_FACT} onDone={onNext} />;
    case 're':
      return <WordIntro word={RE} onDone={onNext} />;
    case 're-gap':
      return exercise(content.reGap, content.reDecoys);
    case 'call':
      return <CallStep onDone={onNext} />;
  }
}

const TIP_FACT: Fact = {
  art: require('@/assets/images/objects/cafe-con-medialunas-figure.webp'),
  // culture.json · buenos-aires / pagar, its Pro tip card.
  text: 'The tip, **la propina**, is about 10%. People usually leave it in cash on the table, even when they pay the bill by card. By law the place must also let you tip by card or QR.',
  hero: null,
  chip: 'Pro tip',
  bg: pastel.butter,
};

// --- the bar: one track, a piece per run of a part, each in its colour --------

function PartBar({ at }: { at: number }) {
  const runs: { part: Part; from: number; size: number }[] = [];
  SCREENS.forEach((s, i) => {
    const last = runs[runs.length - 1];
    if (last && last.part === s.part) last.size++;
    else runs.push({ part: s.part, from: i, size: 1 });
  });
  const current = SCREENS[Math.min(at, SCREENS.length - 1)].part;
  return (
    <View style={styles.barWrap}>
      <View
        style={styles.bar}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: SCREENS.length, now: at }}>
        {runs.map((r) => (
          <View key={r.from} style={styles.barPiece}>
            <BarFill color={PARTS[r.part].color} share={Math.min(Math.max((at - r.from) / r.size, 0), 1)} />
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

/** The part's name, stuck on when the part starts: CLASS, SLANG, CULTURE, SPEAKING. */
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

function OrderStep({ cortado, onDone }: { cortado: Form; onDone: () => void }) {
  const options = useMemo(
    () =>
      [
        { id: 'cortado', label: 'Espresso with a little milk' },
        { id: 'leche', label: 'A big coffee with milk' },
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
          correct: chosen === 'cortado',
          answer: 'cortado: espresso with a little milk',
          note: 'cortado: espresso with a little milk',
          about: cortado.gloss_note_en ?? undefined,
        })
      }
      onContinue={onDone}>
      <AudioPad path={cortado.audio_path!} />
      <Choices options={options} correctId="cortado" chosen={chosen} revealed={verdict !== null} onPick={setChosen} />
    </ExerciseFrame>
  );
}

// --- 2. the vos moment ------------------------------------------------------------

const BOOK = ['¿Quieres', 'un', 'café?'];
const LOCAL = ['¿Querés', 'un', 'café?'];

function VosStep({ audio, onDone }: { audio: string | null; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [fixed, setFixed] = useState(false);
  const bottom = useSafeAreaInsets().bottom;
  const reveal = () => {
    setFixed(true);
    success();
    if (audio) playAudio(audio);
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.saysRow}>
          <PanchoAvatar size={64} />
          <View style={styles.saysBubble}>
            <Text style={styles.saysText}>
              {fixed ? '¡Eso! That’s vos. Everyone in Argentina talks like this.' : 'Your textbook says this. Nobody here does.'}
            </Text>
          </View>
        </View>
        <Animated.View entering={reduced ? undefined : FadeInDown.duration(260).easing(EASE_OUT)} style={styles.tryCard}>
          <View style={styles.tryWords}>
            {BOOK.map((word, k) => {
              const changes = word !== LOCAL[k];
              return (
                <View key={k} style={[styles.tryWord, fixed && changes && styles.tryWordFixed]}>
                  {fixed && changes ? (
                    <Animated.Text entering={reduced ? undefined : ZoomIn.duration(260).easing(EASE_OUT)} style={styles.tryText}>
                      {LOCAL[k]}
                    </Animated.Text>
                  ) : (
                    <Text style={[styles.tryText, !fixed && changes && styles.tryStrike]}>{word}</Text>
                  )}
                </View>
              );
            })}
            {fixed && audio ? <PlayButton path={audio} small autoPlay={false} /> : null}
          </View>
          <Text style={styles.tryEn}>Do you want a coffee?</Text>
          <Pressable
            onPress={fixed ? onDone : reveal}
            accessibilityRole="button"
            style={({ pressed }) => [styles.tryStrip, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            <Text style={styles.tryStripText}>{fixed ? 'Continue' : 'Make it Argentine'}</Text>
          </Pressable>
        </Animated.View>
        {fixed ? (
          <Animated.Text entering={FadeIn.duration(200).delay(200)} style={[styles.hint, { paddingBottom: bottom }]}>
            quieres → querés. Same word, the Buenos Aires way.
          </Animated.Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

// --- 5. the waiter: "¿Algo más?" … "Dale." -------------------------------------

function WaiterStep({ algoMás, onDone }: { algoMás: string | null; onDone: () => void }) {
  const [replied, setReplied] = useState(false);
  return (
    <ExerciseFrame
      prompt="Your cortado arrives. The waiter asks:"
      verdict={null}
      canCheck={replied}
      checkLabel="What’s “dale”?"
      onCheck={onDone}
      onContinue={onDone}>
      <SpeechBubble>
        <View style={styles.lineRow}>
          <Text style={styles.lineEs}>¿Algo más?</Text>
          {algoMás ? <PlayButton path={algoMás} small /> : null}
        </View>
        <Text style={styles.lineEn}>Anything else?</Text>
      </SpeechBubble>
      {replied ? (
        <Animated.View entering={FadeInDown.duration(240).easing(EASE_OUT)} style={{ gap: 14 }}>
          <View style={[styles.mine, { alignSelf: 'flex-end' }]}>
            <Text style={styles.mineText}>No, nada más, gracias.</Text>
          </View>
          <SpeechBubble>
            <View style={styles.lineRow}>
              <Text style={styles.lineEs}>¡Dale!</Text>
              {DALE.audio ? <PlayButton path={DALE.audio} small /> : null}
            </View>
          </SpeechBubble>
        </Animated.View>
      ) : (
        <Pressable
          onPress={() => {
            tap();
            setReplied(true);
          }}
          style={({ pressed }) => [styles.reply, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          <Text style={styles.replyEs}>No, nada más, gracias.</Text>
          <Text style={styles.replyEn}>No, that’s all, thanks.</Text>
        </Pressable>
      )}
    </ExerciseFrame>
  );
}

// --- 8. the call ------------------------------------------------------------------

type Turn = { es: string; en: string; audio?: string; replies: { es: string; en: string }[] };

// Pancho's lines after the first have no recording yet: they are read.
const SCRIPT: Turn[] = [
  {
    es: '¡Buenas! ¿Qué te traigo?',
    en: 'Hi there! What can I get you?',
    audio: CALL_OPENER_AUDIO,
    replies: [
      { es: '¿Me das un cortado?', en: 'Can I get a cortado?' },
      { es: 'Un café con leche, por favor.', en: 'A coffee with milk, please.' },
    ],
  },
  {
    es: 'Dale. ¿Algo más?',
    en: 'OK. Anything else?',
    replies: [
      { es: 'Una medialuna, por favor.', en: 'A medialuna, please.' },
      { es: 'No, nada más, gracias.', en: 'No, that’s all, thanks.' },
    ],
  },
  {
    es: '¡Dale! Acá las medialunas están re ricas.',
    en: 'Sure! The medialunas here are really good.',
    replies: [{ es: '¡Genial! ¿Cuánto dejo de propina?', en: 'Great! How much should I tip?' }],
  },
  {
    es: 'Lo que quieras… pero un diez por ciento está bien. ¡Chau!',
    en: 'Up to you… but ten percent is fine. Bye!',
    replies: [],
  },
];

function CallStep({ onDone }: { onDone: () => void }) {
  const [turn, setTurn] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [live, setLive] = useState(false);
  const line = SCRIPT[turn];
  const over = line.replies.length === 0;

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (line.audio) playAudio(line.audio);
  }, [line.audio]);

  const say = () => {
    tap();
    stopAudio();
    setTurn((t) => t + 1);
  };

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

  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const bottom = useSafeAreaInsets().bottom;
  return (
    <View style={styles.call}>
      <Text style={styles.callTop}>Calling Pancho · at the café · {clock}</Text>
      <View style={styles.callMiddle}>
        <PanchoAvatar size={168} drop={0.04} />
        <Animated.View key={turn} entering={FadeInDown.duration(260).easing(EASE_OUT)} style={styles.callLine}>
          <View style={styles.lineRow}>
            <Text style={styles.callEs}>{line.es}</Text>
            {line.audio ? <PlayButton path={line.audio} small autoPlay={false} /> : null}
          </View>
          <Text style={styles.callEn}>{line.en}</Text>
        </Animated.View>
      </View>
      <View style={[styles.callDock, { paddingBottom: 20 + bottom }]}>
        {over ? (
          <Button title="End call" onPress={onDone} />
        ) : (
          <>
            <Text style={styles.callHint}>Say one out loud, then tap it</Text>
            {line.replies.map((r) => (
              <Pressable
                key={r.es}
                onPress={say}
                style={({ pressed }) => [styles.reply, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
                <Text style={styles.replyEs}>{r.es}</Text>
                <Text style={styles.replyEn}>{r.en}</Text>
              </Pressable>
            ))}
            <Text style={styles.micNote}>Prototype: a scripted call. Nothing is recorded.</Text>
          </>
        )}
        <Pressable onPress={() => void goLive()} disabled={live} hitSlop={8}>
          <Text style={styles.liveLink}>{live ? 'Starting…' : 'Admin: try the live AI call instead →'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- 9. lesson complete -------------------------------------------------------

const STAMPS: { part: Part; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { part: 'class', label: 'Class', icon: 'school' },
  { part: 'slang', label: 'Slang', icon: 'chatbubbles' },
  { part: 'culture', label: 'Culture', icon: 'earth' },
  { part: 'pancho', label: 'Speaking', icon: 'call' },
];
const TILT = ['-7deg', '5deg', '6deg', '-5deg'];

function Complete({ onAgain, onClose }: { onAgain: () => void; onClose: () => void }) {
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
        <Text style={styles.doneLine}>You ordered, spoke like a porteño, learned the slang and the tip. All in four minutes.</Text>
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
        <Button title="See my plan" onPress={() => Alert.alert('Placeholder', 'Here the plan and then the paywall would open.')} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button title="Play again" variant="secondary" small onPress={onAgain} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Back to admin" variant="ghost" small onPress={onClose} />
          </View>
        </View>
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

  body: { padding: 24, gap: 24, maxWidth: 560, width: '100%', alignSelf: 'center' },
  saysRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saysBubble: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 14, boxShadow: clay.surface },
  saysText: { ...font.body[700], fontSize: 17, lineHeight: 23, color: colors.ink },
  tryCard: { borderRadius: radius.lg, backgroundColor: colors.card, boxShadow: clay.surface },
  tryWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 9,
    rowGap: 14,
    paddingHorizontal: 18,
    paddingTop: 26,
  },
  tryWord: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 3 },
  tryWordFixed: { paddingHorizontal: 11, borderRadius: 13, backgroundColor: pastel.sage, boxShadow: clay.chip },
  tryText: { ...font.display[900], fontSize: 38, lineHeight: 50, color: colors.ink, letterSpacing: -0.6 },
  tryStrike: { textDecorationLine: 'underline', textDecorationStyle: 'dashed', textDecorationColor: colors.primary },
  tryEn: { ...font.body[700], fontSize: 16, lineHeight: 22, color: colors.muted, textAlign: 'center', paddingTop: 14, paddingBottom: 18 },
  tryStrip: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  tryStripText: { ...font.display[800], fontSize: 18, color: colors.onPrimary },
  hint: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center' },

  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  lineEs: { ...font.display[800], fontSize: 26, color: colors.ink },
  lineEn: { ...font.body[600], fontSize: 15, color: colors.muted, marginTop: 4 },
  mine: { backgroundColor: pastel.sky, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, boxShadow: clay.chip },
  mineText: { ...font.body[800], fontSize: 17, color: colors.ink },
  reply: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 14,
    boxShadow: clay.surface,
    gap: 2,
  },
  replyEs: { ...font.display[800], fontSize: 20, color: colors.ink },
  replyEn: { ...font.body[600], fontSize: 14, color: colors.muted },

  call: { flex: 1, backgroundColor: pastel.peach },
  callTop: { ...font.body[800], fontSize: 13, letterSpacing: 0.4, color: colors.ink, textAlign: 'center', marginTop: 10 },
  callMiddle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 24 },
  callLine: { alignItems: 'center', gap: 6, maxWidth: 480 },
  callEs: { ...font.display[900], fontSize: 28, lineHeight: 34, color: colors.ink, textAlign: 'center' },
  callEn: { ...font.body[700], fontSize: 16, color: colors.muted, textAlign: 'center' },
  callDock: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    boxShadow: clay.float,
  },
  callHint: { ...font.body[800], fontSize: 13, letterSpacing: 0.4, color: colors.muted, textAlign: 'center' },
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

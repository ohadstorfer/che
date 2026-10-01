import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Easing,
  type ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseFrame, type Verdict } from '@/components/exercise-frame';
import { Choices } from '@/components/exercises';
import { PathLessonDone } from '@/components/path-lesson-done';
import { Button, Panel } from '@/components/ui';
import { artFor, speakerArt } from '@/lib/culture-art';
import {
  type CulturePage,
  type CultureWord,
  classKey,
  findClass,
  markClassDone,
  splitTitle,
} from '@/lib/culture';
import { playAudio } from '@/lib/audio';
import { lessonWithUnit } from '@/lib/lesson';
import { goBack } from '@/lib/nav';
import type { FinishResult } from '@/lib/round';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, gradients, pastel, pastelGrad, PICKED, radius, shadow } from '@/lib/theme';
import { FitText } from '@/components/fit-text';
import { finishPathLesson, unitCulture } from '@/lib/unit-extras';

// ---------------------------------------------------------------------------
// A culture class (docs/culture-spec.md), played as cards: the reading is cut
// into short story beats — one idea, one capybara, a couple of sentences —
// with a fun fact given a card of its own, easy questions between them, and
// the class's words at the end as a deck of cards, then a match and a couple
// of "what does it mean?". Nothing here is scheduled or scored against her; a
// wrong answer just gets its explanation. Finishing stamps her passport.
//
// The story cards sit *under* a pale header rather than running to the top of
// the screen: the strip above a standalone PWA is one frozen oat colour on
// iOS 26 (see status-bar-color), and a pastel edge there would meet it badly.
// ---------------------------------------------------------------------------

/** A story card's look. Five layouts take turns (never the same twice running); a page's big word gets its own. */
type Layout = 'poster' | 'split' | 'bubble' | 'rays' | 'chat' | 'word';
const LAYOUTS: Layout[] = ['poster', 'split', 'bubble', 'rays', 'chat'];

interface Story {
  art: ImageSourcePropType;
  /** The section's capybara, for the chat layout's avatar. */
  speaker: ImageSourcePropType;
  layout: Layout;
  eyebrow: string;
  /** Only the first beat of a page carries its title; the rest are just the words. */
  title?: string;
  text: string;
  /** Set on the first beat of a page that has a word to show off; the card takes the big-word look. */
  bigWord?: { es: string; en: string; tag?: string };
}

interface Fact {
  art: ImageSourcePropType;
  text: string;
  /** The date or year worth showing huge, when the fact has one. */
  hero: string | null;
  /** A card class's card: its own chip and colour, and its bold words kept. */
  chip?: string;
  bg?: string;
}

type Step =
  | { kind: 'story'; story: Story }
  | { kind: 'fact'; fact: Fact }
  /** `bare`: a card class's question, asked straight, without the capybara's aside. */
  | { kind: 'page'; page: CulturePage; bare?: boolean }
  | { kind: 'words'; words: CultureWord[] }
  | { kind: 'match'; pairs: [string, string][] }
  | { kind: 'meaning'; word: CultureWord; options: string[] };

/** Enter: 220ms, strong ease-out, a short rise — a page arriving, not flying in. */
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** A story card holds about this many words: two sentences, read in a breath. */
const BEAT_WORDS = 26;

const shuffle = <T,>(xs: T[]): T[] => {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const partition = <T,>(xs: T[], keep: (x: T) => boolean): [T[], T[]] => [xs.filter(keep), xs.filter((x) => !keep(x))];

const GLOSS_STOP = new Set(['the', 'and', 'for', 'with', 'from', 'your', 'someone', 'something', 'very', 'really', 'lit', 'slang', 'short']);
/** The meaningful words of a gloss, to tell whether two glosses could both answer the same word. */
const glossWords = (en: string) =>
  new Set(
    en
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z]+/)
      .filter((w) => w.length > 2 && !GLOSS_STOP.has(w)),
  );

const stripMarks = (text: string) => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
const wordCount = (text: string) => stripMarks(text).split(/\s+/).filter(Boolean).length;
// A sentence ends at . ! ? followed by a capital, a digit or an opening mark — so "8 p.m. and you'll" stays whole.
const sentencesOf = (text: string) =>
  text.split(/(?<=[.!?]["')\]”*]*)\s+(?=[A-ZÁÉÍÓÚÑ¿¡"“'(*\d])/).map((x) => x.trim()).filter(Boolean);

/** A long paragraph as short beats, split at sentence ends so no beat stops mid-thought. */
function beatsOf(body: string): string[] {
  const beats: string[] = [];
  let cur: string[] = [];
  let n = 0;
  for (const sentence of sentencesOf(body)) {
    const w = wordCount(sentence);
    if (cur.length && n + w > BEAT_WORDS) {
      beats.push(cur.join(' '));
      cur = [];
      n = 0;
    }
    cur.push(sentence);
    n += w;
  }
  if (cur.length) beats.push(cur.join(' '));
  // Never leave a stub on a card of its own: fold a short last beat into the one before.
  if (beats.length > 1 && wordCount(beats[beats.length - 1]) < 8) {
    const last = beats.pop()!;
    beats[beats.length - 1] += ` ${last}`;
  }
  return beats;
}

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';

/** "November 30" or "2013", when a fun fact turns on one — it becomes the card's headline. */
function heroOf(text: string): string | null {
  const plain = stripMarks(text);
  const date = plain.match(new RegExp(`\\b(${MONTHS}) (\\d{1,2})\\b`));
  if (date) return `${date[1].slice(0, 3)} ${date[2]}`;
  return plain.match(/\b(1[5-9]\d\d|20\d\d)\b/)?.[0] ?? null;
}

/** The vocabulary word a highlighted span in the text stands for, if it is one. */
function wordFor(words: CultureWord[], span: string): CultureWord | undefined {
  const a = span.trim().toLowerCase();
  return words.find((w) => {
    const b = w.es.toLowerCase();
    return a === b || (b.length >= 4 && a.includes(b));
  });
}

/** The authored pages as cards, then the word review built from the vocabulary. */
function buildSteps(section: string, classTitle: string, pages: CulturePage[], vocab: CultureWord[]): Step[] {
  const steps: Step[] = [];
  let prev: Layout | null = null;
  const pick = (bigWord: boolean): Layout => {
    const choices = LAYOUTS.filter((l) => l !== prev);
    prev = bigWord ? 'word' : choices[Math.floor(Math.random() * choices.length)];
    return prev;
  };
  const speaker = speakerArt(section);
  const cardClass = pages.some((p) => p.type === 'card');
  let tone = 0;
  pages.forEach((page, n) => {
    if (page.type === 'card') {
      const bg = CARD_TONES[tone++ % CARD_TONES.length];
      steps.push({ kind: 'fact', fact: { art: artFor(section, n), text: page.text, hero: null, chip: page.chip ?? classTitle, bg } });
      return;
    }
    if (page.type !== 'info') {
      steps.push({ kind: 'page', page, bare: cardClass });
      return;
    }
    const art = artFor(section, n);
    beatsOf(page.body).forEach((text, i) => {
      steps.push({
        kind: 'story',
        story: {
          art,
          speaker,
          layout: pick(i === 0 && !!page.word),
          text,
          eyebrow: i === 0 ? classTitle : page.title,
          title: i === 0 ? page.title : undefined,
          bigWord: i === 0 ? page.word : undefined,
        },
      });
    });
    if (page.fun_fact) {
      steps.push({ kind: 'fact', fact: { art: artFor(section, n + 1), text: page.fun_fact, hero: heroOf(page.fun_fact) } });
    }
  });
  if (vocab.length) steps.push({ kind: 'words', words: vocab });
  // Matches of 3–5 pairs: split evenly rather than leaving a stub of one or two.
  const groups = Math.ceil(vocab.length / 5);
  const mixed = shuffle(vocab);
  for (let g = 0; g < groups; g++) {
    const chunk = mixed.filter((_, i) => i % groups === g);
    steps.push({ kind: 'match', pairs: chunk.map((w) => [w.es, w.en]) });
  }
  for (const word of shuffle(vocab)) {
    // Wrong answers that share a word with the right one ("city bus" for "bus (slang)") can be right too: use them last.
    const own = glossWords(word.en);
    const [clear, close] = partition(shuffle(vocab.filter((w) => w !== word)), (w) => ![...glossWords(w.en)].some((x) => own.has(x)));
    const others = [...clear, ...close].slice(0, 3);
    steps.push({ kind: 'meaning', word, options: shuffle([word.en, ...others.map((w) => w.en)]) });
  }
  return steps;
}

/**
 * A class from the Culture tab (?section=&class=), or a unit's culture class
 * on the road (?lesson=<id>), which plays the class the unit was given
 * (unit-extras.ts). Played on the road, it counts in the passport too, and
 * finishing it finishes the lesson and goes back to the path.
 */
export default function CultureClass() {
  const params = useLocalSearchParams<{ section?: string; class?: string; lesson?: string }>();
  const lessonId = params.lesson;
  const [fromLesson, setFromLesson] = useState<ReturnType<typeof findClass> | undefined>(undefined);

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    lessonWithUnit(lessonId)
      .then(({ unit }) => unitCulture(unit.slug))
      .catch(() => null)
      .then((found) => {
        if (!cancelled) setFromLesson(found);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (lessonId) {
    if (fromLesson === undefined) return <SafeAreaView style={styles.safe} />;
    return <ClassPlayer found={fromLesson} lessonId={lessonId} />;
  }
  return <ClassPlayer found={findClass(params.section ?? '', params.class ?? '')} />;
}

function ClassPlayer({ found, lessonId }: { found: ReturnType<typeof findClass>; lessonId?: string }) {
  useStatusBarColor(colors.bg);
  const [steps] = useState(() =>
    found ? buildSteps(found.section.slug, found.cls.title, found.cls.pages, found.cls.vocabulary) : [],
  );
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Set<string> | null>(null);
  const [ended, setEnded] = useState<{ result: FinishResult | null } | null>(null);
  const finished = found !== null && index >= steps.length;
  const sectionSlug = found?.section.slug;
  const classSlug = found?.cls.slug;

  useEffect(() => {
    if (!finished || !sectionSlug || !classSlug) return;
    void markClassDone(sectionSlug, classSlug).then(setDone);
    if (lessonId) void finishPathLesson(lessonId, null).then((result) => setEnded({ result }));
  }, [finished, sectionSlug, classSlug, lessonId]);

  if (!found) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This class doesn't exist.</Text>
          {lessonId ? (
            <Button title="Back to the course" onPress={() => goBack('/home')} />
          ) : (
            <Button title="Back to culture" onPress={() => router.dismissTo('/culture')} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (finished && lessonId) {
    // A beat of nothing while the lesson is saved: the path must know it's done before she returns to it.
    return ended ? <PathLessonDone result={ended.result} /> : <SafeAreaView style={styles.safe} />;
  }

  if (finished) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Complete found={found} done={done} />
      </SafeAreaView>
    );
  }

  const step = steps[index];
  const next = () => setIndex((i) => i + 1);
  const back = index > 0 ? () => setIndex((i) => Math.max(0, i - 1)) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header section={found.section.slug} index={index} total={steps.length} />
      <Enter key={index}>
        <StepView
          step={step}
          section={found.section.slug}
          words={[...found.cls.vocabulary, ...(found.cls.glossary ?? [])]}
          onDone={next}
          onBack={back}
        />
      </Enter>
    </SafeAreaView>
  );
}

function StepView({
  step,
  section,
  words,
  onDone,
  onBack,
}: {
  step: Step;
  section: string;
  words: CultureWord[];
  onDone: () => void;
  onBack?: () => void;
}) {
  if (step.kind === 'story') return <StoryCard story={step.story} words={words} onDone={onDone} onBack={onBack} />;
  if (step.kind === 'fact') return <FactCard fact={step.fact} onDone={onDone} onBack={onBack} />;
  if (step.kind === 'words') return <WordsStep words={step.words} onDone={onDone} />;
  if (step.kind === 'match') return <MatchStep prompt="Match each word to its meaning" pairs={step.pairs} onDone={onDone} />;
  if (step.kind === 'meaning') {
    return (
      <ChoiceStep
        prompt="What does this mean?"
        options={step.options}
        correct={step.options.indexOf(step.word.en)}
        explain={step.word.note}
        onDone={onDone}>
        <Panel style={styles.bigWord}>
          <Text style={styles.bigWordText}>{step.word.es}</Text>
        </Panel>
      </ChoiceStep>
    );
  }

  const page = step.page;
  switch (page.type) {
    case 'info':
    case 'card':
      return null; // Always turned into story and fact cards by buildSteps.
    case 'choice':
      return (
        <ChoiceStep prompt={page.prompt} options={page.options} correct={page.correct} explain={page.explain} onDone={onDone}>
          {step.bare ? null : <CapySays art={speakerArt(section)} />}
          {page.scenario ? (
            <View style={styles.scenario}>
              <Text style={styles.scenarioText}>
                <Rich text={page.scenario} />
              </Text>
            </View>
          ) : null}
        </ChoiceStep>
      );
    case 'true_false':
      return (
        <ChoiceStep
          prompt="True or false?"
          options={['True', 'False']}
          correct={page.answer ? 0 : 1}
          explain={page.explain}
          keepOrder
          side
          onDone={onDone}>
          <CapySays art={speakerArt(section)} />
          <View style={styles.scenario}>
            <Text style={styles.statement}>
              <Rich text={page.statement} />
            </Text>
          </View>
        </ChoiceStep>
      );
    case 'gap':
      return <GapStep page={page} onDone={onDone} />;
    case 'order':
      return <OrderStep page={page} onDone={onDone} />;
    case 'match':
      return <MatchStep prompt={page.prompt} pairs={page.pairs} explain={page.explain} onDone={onDone} />;
  }
}

// ---------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------

/** One segment per card, filled up to the one she is on: she can see how much is left. */
function Header({ section, index, total }: { section: string; index: number; total: number }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => goBack(`/culture-section?section=${section}`)} hitSlop={12} accessibilityLabel="Close">
        <Ionicons name="close" size={26} color={colors.muted} />
      </Pressable>
      <View style={[styles.segments, { gap: total > 20 ? 2 : 4 }]}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.segment, i <= index && styles.segmentOn]} />
        ))}
      </View>
    </View>
  );
}

/** A step's entrance. Opacity and transform only; reduced motion keeps the fade. */
function Enter({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const t = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.timing(t, {
      toValue: 1,
      duration: 220,
      easing: EASE_OUT,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [t]);
  const rise = reduced ? [] : [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }];
  return <RNAnimated.View style={{ flex: 1, opacity: t, transform: rise }}>{children}</RNAnimated.View>;
}

/** The feedback bar takes plain strings, so markdown is dropped there. */
const plain = (text?: string) => text?.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');

/** Light markdown: **bold** and *italic*, nothing else. Render inside a Text. */
function Rich({ text, bold }: { text: string; bold?: object }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <Text key={i} style={bold ?? styles.bold}>
            {p.slice(2, -2)}
          </Text>
        ) : p.startsWith('*') && p.length > 2 ? (
          <Text key={i} style={styles.italic}>
            {p.slice(1, -1)}
          </Text>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** A capybara with a line of encouragement above a question, so a quiz reads as a friend asking. */
function CapySays({ art }: { art: ImageSourcePropType }) {
  return (
    <View style={styles.capyRow}>
      <Image source={art} style={styles.capyImage} contentFit="contain" accessible={false} />
      <View style={styles.capyBubble}>
        <Text style={styles.capyText}>Quick check, no pressure.</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Story and fact cards
// ---------------------------------------------------------------------------

/**
 * Tap the left third of a card to go back a card, anywhere else to go on — the
 * way stories work. The card's position is measured at the tap, so it holds on
 * a wide web window where the card doesn't start at the screen's edge. The
 * first card has nothing behind it, so there the whole card goes forward.
 */
const BACK_ZONE = 0.3;

function useSideTap(onNext: () => void, onBack?: () => void) {
  const ref = useRef<View>(null);
  return {
    ref,
    onPress: (e: { nativeEvent: { pageX: number } }) => {
      if (!onBack) return onNext();
      const x = e.nativeEvent.pageX;
      ref.current?.measureInWindow((left, _top, width) => {
        if (width > 0 && x - left < width * BACK_ZONE) onBack();
        else onNext();
      });
    },
  };
}

/** A small pop for something anchored to a spot: it grows out of its corner, never from nothing. */
function Pop({ children, style }: { children: React.ReactNode; style?: object }) {
  const t = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.timing(t, { toValue: 1, duration: 150, easing: EASE_OUT, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [t]);
  return (
    <RNAnimated.View
      style={[
        style,
        { opacity: t, transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }], transformOrigin: 'left bottom' },
      ]}>
      {children}
    </RNAnimated.View>
  );
}

/** How a highlighted word is painted on a given card: its chip, and the colour of a plain bold word. */
interface Ink {
  chip: string;
  chipText: string;
  bold: string;
}

/** Story text. Highlighted words that are in the class's vocabulary become tappable chips. */
function StoryText({
  text,
  words,
  onOpen,
  style,
  ink,
}: {
  text: string;
  words: CultureWord[];
  onOpen: (w: CultureWord) => void;
  style: object;
  ink: Ink;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <Text style={style}>
      {parts.map((p, i) => {
        if (p.startsWith('**')) {
          const label = p.slice(2, -2);
          const word = wordFor(words, label);
          if (!word) {
            return (
              <Text key={i} style={[styles.storyBold, { color: ink.bold }]}>
                {label}
              </Text>
            );
          }
          return (
            <Text
              key={i}
              onPress={() => onOpen(word)}
              accessibilityRole="button"
              style={[styles.wordChip, { backgroundColor: ink.chip, color: ink.chipText }]}>
              {` ${label} `}
            </Text>
          );
        }
        if (p.startsWith('*') && p.length > 2) {
          return (
            <Text key={i} style={styles.italic}>
              {p.slice(1, -1)}
            </Text>
          );
        }
        return p;
      })}
    </Text>
  );
}

/** The rosa gradient under an action, clipped to its pill. */
function RosaFill({ r }: { r: number }) {
  return <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, { borderRadius: r }]} pointerEvents="none" />;
}

/** Going on is the action on every card, so it is always the rosa button. */
function RoundNext({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Continue"
      style={({ pressed }) => [styles.roundNext, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
      <RosaFill r={26} />
      <Ionicons name="arrow-forward" size={24} color={colors.onPrimary} />
    </Pressable>
  );
}

/** A word's popover: its meaning, an example, a note, and the recording when there is one. */
function WordPop({ word, style }: { word: CultureWord; style: object }) {
  return (
    <Pop style={[styles.popover, style]}>
      <View style={styles.popHead}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.popWord}>{word.es}</Text>
          <Text style={styles.popMeaning}>{word.en}</Text>
        </View>
        <View style={styles.popActions}>
          {word.audio ? (
            <Pressable
              onPress={() => playAudio(word.audio!)}
              accessibilityRole="button"
              accessibilityLabel="Hear it"
              style={({ pressed }) => [styles.popSpeak, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
              <Ionicons name="volume-high" size={20} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {word.example ? (
        <View style={styles.popExample}>
          <Text style={styles.popExampleEs}>{word.example.es}</Text>
          <Text style={styles.popExampleEn}>{word.example.en}</Text>
        </View>
      ) : null}
      {word.note ? <Text style={styles.popNote}>{word.note}</Text> : null}
    </Pop>
  );
}

/** The rays' second tone: the sky pastel's lighter end, fanned over the sky card. */
const RAY = pastelGrad.sky[0];

/** Vocabulary chips: rosa-tinted on light cards, a white chip on pastel ones — a word is something she taps. */
const LIGHT_INK: Ink = { chip: colors.primarySoft, chipText: colors.primaryDark, bold: colors.ink };
const PASTEL_INK: Ink = { chip: colors.chip, chipText: colors.primaryDark, bold: colors.onPastel };

/**
 * A beat as two parts, the way a field note wraps around its sketch: a lead
 * beside the picture, the rest after it. The lead is the first sentence when it
 * is short enough for a narrow column; a single sentence breaks at a clause (a
 * colon, semicolon or dash, or a comma before "which", "so", "but"… — never a
 * list's comma — outside bold and brackets) near its middle.
 * Nothing to break, and the beat stays whole, after the picture.
 */
const JOINS = /^(which|so|but|where|who|because|while|though|although|since|when|then|yet|as|until|unless|meaning|making)\b/i;

function splitBeat(text: string, maxLead: number): [string | null, string] {
  const s = sentencesOf(text);
  if (s.length >= 2 && wordCount(s[0]) <= maxLead) return [s[0], s.slice(1).join(' ')];
  const total = wordCount(text);
  if (total < 12) return [null, text];
  let best: [number, number] | null = null; // [cut index, distance from the ideal]
  let depth = 0;
  let bold = false;
  for (let i = 0; i < text.length - 1; i++) {
    const c = text[i];
    if (text.startsWith('**', i)) {
      bold = !bold;
      i++;
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (!bold && depth === 0 && /[,;:—–]/.test(c) && text[i + 1] === ' ' && (c !== ',' || JOINS.test(text.slice(i + 2)))) {
      const lead = wordCount(text.slice(0, i + 1));
      if (lead < 5 || lead > maxLead || total - lead < 5) continue;
      const off = Math.abs(lead - total * 0.45);
      if (!best || off < best[1]) best = [i + 1, off];
    }
  }
  if (!best) return [null, text];
  return [text.slice(0, best[0]).trim(), text.slice(best[0]).trim()];
}

/** Sun rays behind the picture: thin wedges fanned round one point. Drawn with borders, so no SVG. */
function Rays() {
  const len = 900;
  const half = Math.tan((5 * Math.PI) / 180) * len;
  return (
    <View style={styles.raysHub} pointerEvents="none">
      {Array.from({ length: 18 }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: -half,
            top: -len,
            width: 0,
            height: 0,
            borderLeftWidth: half,
            borderRightWidth: half,
            borderTopWidth: len,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: RAY,
            transformOrigin: 'bottom',
            transform: [{ rotate: `${i * 20}deg` }],
          }}
        />
      ))}
    </View>
  );
}

/** The coloured disc behind the picture: off the right edge, or centred under it. */
function Disc({ color, centered }: { color: string; centered?: boolean }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.discLayer, centered && { alignItems: 'center' }]} pointerEvents="none">
      <View style={[styles.disc, centered ? styles.discCenter : null, { backgroundColor: color }]} />
    </View>
  );
}

/** A white speech bubble with a solid under-edge and a tail pointing at the picture. */
function Bubble({ children, tail }: { children: React.ReactNode; tail: 'down' | 'up' }) {
  return (
    <View style={styles.bubbleEdge}>
      <View style={styles.bubble}>{children}</View>
      <View style={tail === 'down' ? styles.tailDown : styles.tailUp} />
    </View>
  );
}

/**
 * One idea per card. Tap anywhere to go on; tap a highlighted word to look at it.
 * The card wears one of five layouts (see buildSteps), each splitting its text
 * around the picture; a word card keeps its own quiet look.
 */
function StoryCard({
  story,
  words,
  onDone,
  onBack,
}: {
  story: Story;
  words: CultureWord[];
  onDone: () => void;
  onBack?: () => void;
}) {
  const bottom = useSafeAreaInsets().bottom;
  const tap = useSideTap(onDone, onBack);
  // Which half the tapped word sits in: the popover opens over the other one.
  const [open, setOpen] = useState<{ word: CultureWord; lead: boolean } | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const layout = story.layout;
  const chipWord = story.text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((p) => (p.startsWith('**') ? wordFor(words, p.slice(2, -2)) : undefined))
    .find(Boolean);
  const hint = chipWord ? 'Tap a highlighted word' : 'Tap right to go on, left to go back';
  const [lead, rest] = layout === 'word' ? [null, story.text] : splitBeat(story.text, layout === 'chat' ? 99 : 16);
  const toggle = (lead: boolean) => (w: CultureWord) => setOpen((cur) => (cur?.word === w ? null : { word: w, lead }));
  const text = (t: string, isLead: boolean, style: object, ink: Ink) => (
    <StoryText text={t} words={words} onOpen={toggle(isLead)} style={style} ink={ink} />
  );
  const foot = (onPastel?: boolean) => (
    <View style={styles.sheetFoot}>
      <Text style={[styles.hint, onPastel && styles.hintOnPastel]}>{hint}</Text>
      <RoundNext onPress={onDone} />
    </View>
  );
  const pad = { paddingBottom: 24 + bottom };
  const title = story.title ? story.title : null;
  const art = <Image source={story.art} style={styles.artFill} contentFit="contain" accessible={false} />;
  const pop = open ? (
    <WordPop word={open.word} style={open.lead ? { bottom: sheetHeight + 12 } : { top: 12 }} />
  ) : null;

  let body: React.ReactNode;
  if (layout === 'word') {
    const big = story.bigWord!;
    const ink = PASTEL_INK;
    body = (
      <>
        <View style={styles.bigZone}>
          {big.tag ? (
            <View style={styles.bigTag}>
              <Text style={styles.bigTagText}>{big.tag}</Text>
            </View>
          ) : null}
          <FitText style={styles.hugeWord} lines={2}>
            {big.es}
          </FitText>
          <Text style={styles.bigMeaning}>{big.en}</Text>
          <Image source={story.art} style={styles.bigArt} contentFit="contain" accessible={false} />
        </View>
        <View style={[styles.sheet, styles.sheetBig, pad]} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
          <FitText style={[styles.eyebrow, styles.onLightMuted]} lines={1}>
            {story.eyebrow}
          </FitText>
          {title ? <Text style={[styles.storyTitle, styles.onLight]}>{title}</Text> : null}
          {text(story.text, true, [styles.body, styles.onLight], ink)}
          {foot(true)}
        </View>
      </>
    );
  } else if (layout === 'poster') {
    const ink = LIGHT_INK;
    body = (
      <>
        <View style={styles.head}>
          <FitText style={[styles.eyebrow, { color: colors.muted }]} lines={1}>
            {story.eyebrow}
          </FitText>
          {title ? <Text style={styles.posterTitle}>{title}</Text> : null}
        </View>
        <View style={styles.mid}>
          {lead ? <View style={styles.leadCol}>{text(lead, true, [styles.lead, { color: colors.ink }], ink)}</View> : null}
          <View style={styles.artBox}>
            <Disc color={pastel.peach} />
            {art}
          </View>
        </View>
        <View style={[styles.whiteSheet, pad]} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
          {text(rest, false, [styles.body, { color: colors.ink }], ink)}
          {foot()}
        </View>
      </>
    );
  } else if (layout === 'split') {
    const leadInk = PASTEL_INK;
    const ink = LIGHT_INK;
    body = (
      <>
        <View style={styles.head}>
          <View style={styles.pill}>
            <FitText style={styles.pillText} lines={1}>
              {story.eyebrow}
            </FitText>
          </View>
          {title ? <Text style={[styles.storyTitle, { color: colors.onPastel }]}>{title}</Text> : null}
        </View>
        <View style={styles.mid}>
          {lead ? <View style={styles.leadCol}>{text(lead, true, [styles.lead, { color: colors.onPastel }], leadInk)}</View> : null}
          <View style={styles.artBox}>
            <Disc color={colors.pod} />
            {art}
          </View>
        </View>
        <View style={[styles.oatSheet, pad]} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
          <View style={styles.slant} />
          {text(rest, false, [styles.body, { color: colors.ink }], ink)}
          {foot()}
        </View>
      </>
    );
  } else if (layout === 'bubble') {
    const ink = LIGHT_INK;
    body = (
      <View style={[styles.bubbleCol, pad]}>
        <View style={styles.headCenter}>
          <FitText style={[styles.eyebrow, styles.onPastelSoft, { textAlign: 'center' }]} lines={1}>
            {story.eyebrow}
          </FitText>
          {title ? <Text style={[styles.storyTitle, { color: colors.onPastel, textAlign: 'center' }]}>{title}</Text> : null}
        </View>
        {lead ? (
          <View style={styles.bubbleLead}>
            <Bubble tail="down">{text(lead, true, [styles.body, { color: colors.ink }], ink)}</Bubble>
          </View>
        ) : null}
        <View style={styles.artBox}>
          <Disc color={colors.pod} centered />
          {art}
        </View>
        <View onLayout={(e) => setSheetHeight(bottom + 24 + e.nativeEvent.layout.height)}>
          <Bubble tail="up">{text(rest, false, [styles.body, { color: colors.ink }], ink)}</Bubble>
          {foot(true)}
        </View>
      </View>
    );
  } else if (layout === 'rays') {
    const ink = PASTEL_INK;
    body = (
      <>
        <Rays />
        <View style={styles.head}>
          <View style={styles.pill}>
            <FitText style={styles.pillText} lines={1}>
              {story.eyebrow}
            </FitText>
          </View>
          {title ? <Text style={[styles.storyTitle, { color: colors.onPastel }]}>{title}</Text> : null}
        </View>
        <View style={styles.mid}>
          {lead ? (
            <View style={styles.leadCol}>
              <View style={styles.raysLead}>{text(lead, true, [styles.body, { color: colors.onPastel }], LIGHT_INK)}</View>
            </View>
          ) : null}
          <View style={styles.artBox}>{art}</View>
        </View>
        <LinearGradient
          colors={[`${pastel.sky}00`, pastel.sky]}
          locations={[0, 0.3]}
          style={[styles.raysSheet, pad]}
          onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
          {text(rest, false, [styles.body, { color: colors.onPastel }], ink)}
          {foot(true)}
        </LinearGradient>
      </>
    );
  } else {
    // Chat: the capybara sends the title, the first sentence, the picture as a photo, then the rest.
    const ink = LIGHT_INK;
    body = (
      <View style={[styles.chat, pad]}>
        <View style={styles.chatThread}>
          <FitText style={[styles.eyebrow, { color: colors.muted, marginLeft: 54 }]} lines={1}>
            {story.eyebrow}
          </FitText>
          {title ? (
            <View style={styles.chatBubble}>
              <Text style={[styles.chatTitle]}>{title}</Text>
            </View>
          ) : null}
          {lead ? <View style={styles.chatBubble}>{text(lead, true, [styles.body, { color: colors.ink }], ink)}</View> : null}
          <View style={styles.chatPhoto}>{art}</View>
          <View style={styles.chatLastRow}>
            <Image source={story.speaker} style={styles.chatAvatar} contentFit="contain" accessible={false} />
            <View style={[styles.chatBubble, styles.chatLast]}>{text(rest, false, [styles.body, { color: colors.ink }], ink)}</View>
          </View>
        </View>
        <View style={styles.chatFoot} onLayout={(e) => setSheetHeight(bottom + 24 + e.nativeEvent.layout.height)}>
          {chipWord ? (
            <Pressable
              onPress={() => setOpen((cur) => (cur ? null : { word: chipWord, lead: true }))}
              accessibilityRole="button"
              style={({ pressed }) => [styles.chatAsk, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <FitText style={styles.chatAskText} lines={1}>
                What’s {chipWord.es}?
              </FitText>
            </Pressable>
          ) : (
            <Text style={styles.hint}>{hint}</Text>
          )}
          <Pressable
            onPress={onDone}
            accessibilityRole="button"
            style={({ pressed }) => [styles.chatNext, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
            <RosaFill r={27} />
            <Text style={styles.chatNextText}>Next</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      ref={tap.ref}
      style={[styles.card, { backgroundColor: CARD_BG[layout] }]}
      onPress={(e) => (open ? setOpen(null) : tap.onPress(e))}
      accessible={false}>
      {body}
      {pop}
    </Pressable>
  );
}

const CARD_BG: Record<Layout, string> = {
  word: colors.bg,
  poster: colors.bg,
  split: pastel.peach,
  bubble: pastel.lav,
  rays: pastel.sky,
  chat: colors.bg,
};

/** A card class deals these in turn, so two cards running never share a colour. */
const CARD_TONES = [pastel.butter, pastel.sky, pastel.peach, pastel.sage, pastel.lav];

/**
 * The fun fact, on a card of its own so it lands instead of hanging off the end
 * of a paragraph. A card class tells its whole story on these.
 */
function FactCard({ fact, onDone, onBack }: { fact: Fact; onDone: () => void; onBack?: () => void }) {
  const bottom = useSafeAreaInsets().bottom;
  const tap = useSideTap(onDone, onBack);
  // The biggest size fits about 22 words above the art; a longer card steps down one.
  const size = fact.hero || wordCount(fact.text) > 22 ? styles.factText : styles.factTextBig;
  return (
    <Pressable
      ref={tap.ref}
      style={[styles.card, styles.factCard, fact.bg ? { backgroundColor: fact.bg } : null]}
      onPress={tap.onPress}
      accessible={false}>
      <Image source={fact.art} style={styles.factArt} contentFit="contain" accessible={false} />
      <View style={styles.factBody}>
        <View style={styles.factChip}>
          <Text style={styles.factChipText}>{fact.chip ?? 'Did you know?'}</Text>
        </View>
        {fact.hero ? (
          <Text style={[styles.factHero, fact.hero.length > 4 && styles.factHeroLong]}>
            {fact.hero}
          </Text>
        ) : null}
        <Text style={size}>{fact.chip ? <Rich text={fact.text} bold={styles.factBold} /> : stripMarks(fact.text)}</Text>
      </View>
      <View style={[styles.factFoot, { paddingBottom: 24 + bottom }]}>
        <Pressable
          onPress={onDone}
          accessibilityRole="button"
          style={({ pressed }) => [styles.factButton, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          <RosaFill r={28} />
          <Text style={styles.factButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// The words: a deck to swipe through. 
// ---------------------------------------------------------------------------

function WordsStep({ words, onDone }: { words: CultureWord[]; onDone: () => void }) {
  const bottom = useSafeAreaInsets().bottom;
  const deck = words;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;
  const [at, setAt] = useState(0);
  const scroller = useRef<ScrollView>(null);
  const last = at === deck.length - 1;

  const go = (i: number) => {
    setAt(i);
    scroller.current?.scrollTo({ x: i * width, animated: true });
  };

  return (
    <View style={styles.frame}>
      <Text style={styles.deckLabel}>
        Word {at + 1} of {deck.length} · swipe
      </Text>
      <View style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)}>
        {width > 0 ? (
          <ScrollView
            ref={scroller}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setAt(Math.round(e.nativeEvent.contentOffset.x / width))}>
            {deck.map((w) => (
              <View key={w.es} style={{ width, height, paddingHorizontal: 20, paddingVertical: 6 }}>
                <View style={styles.wordCard}>
                  <View style={styles.wordCardTop} />
                  <View style={styles.wordCardMid}>
                    <FitText style={styles.wordEs} lines={2}>
                      {w.es}
                    </FitText>
                    <Text style={styles.wordEn}>{w.en}</Text>
                  </View>
                  {w.example ? (
                    <View style={styles.wordExampleBox}>
                      <Text style={styles.wordExampleEs}>{w.example.es}</Text>
                      <Text style={styles.wordExampleEn}>{w.example.en}</Text>
                    </View>
                  ) : null}
                  {w.note ? <Text style={styles.wordNote}>{w.note}</Text> : null}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
      <View style={[styles.deckFoot, { paddingBottom: 20 + bottom }]}>
        <View style={styles.dots}>
          {deck.map((w, i) => (
            <View key={w.es} style={[styles.dot, i === at && styles.dotOn]} />
          ))}
        </View>
        {last ? (
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Button title="Practice them" onPress={onDone} />
          </View>
        ) : (
          <RoundNext onPress={() => go(at + 1)} />
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The stamp: the reward for finishing, and a page of her culture passport.
// ---------------------------------------------------------------------------

const STAMP = 216;

function Stamp({ label, number }: { label: string; number: number }) {
  const reduced = useReducedMotion();
  const t = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    // A stamp lands: a touch too big, then down. Late enough that the screen has settled first.
    RNAnimated.timing(t, { toValue: 1, duration: 300, delay: 120, easing: EASE_OUT, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [t]);
  const scale = reduced ? [] : [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1.25, 1] }) }];
  return (
    <RNAnimated.View style={[styles.stamp, { opacity: t, transform: [{ rotate: '-9deg' }, ...scale] }]}>
      <View style={styles.stampDashed} />
      <View style={styles.stampInner} />
      <Text style={styles.stampTop}>POSTA · ARGENTINA</Text>
      <FitText style={styles.stampLabel} lines={1}>
        {label}
      </FitText>
      <Text style={styles.stampSub}>CLASS {number} · DONE</Text>
    </RNAnimated.View>
  );
}

function Complete({
  found,
  done,
}: {
  found: NonNullable<ReturnType<typeof findClass>>;
  done: Set<string> | null;
}) {
  const bottom = useSafeAreaInsets().bottom;
  const { section, cls } = found;
  const at = section.classes.findIndex((c) => c.slug === cls.slug);
  const { eyebrow, title } = splitTitle(section.title);
  // The class she just finished counts even before the store has answered.
  const isDone = (slug: string) => slug === cls.slug || (done?.has(classKey(section.slug, slug)) ?? false);
  const upNext = section.classes.find((c, i) => i > at && !isDone(c.slug)) ?? section.classes.find((c) => !isDone(c.slug));
  const back = () => goBack(`/culture-section?section=${section.slug}`);
  const finishedCount = section.classes.filter((c) => isDone(c.slug)).length;

  return (
    <View style={styles.frame}>
      <View style={styles.completeTop}>
        <Pressable onPress={back} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.completeBody} showsVerticalScrollIndicator={false}>
        <Stamp label={(eyebrow ?? title).toUpperCase()} number={at + 1} />
        <Text style={styles.completeTitle}>Stamped.</Text>
        <Text style={styles.completeLine}>{cls.summary}</Text>

        <View style={styles.passport}>
          <View style={styles.passportHead}>
            <Text style={styles.passportTitle}>Your culture passport</Text>
            <Text style={styles.passportCount}>
              {finishedCount} of {section.classes.length}
            </Text>
          </View>
          <View style={styles.slots}>
            {section.classes.map((c, i) => (
              <View key={c.slug} style={[styles.pSlot, isDone(c.slug) ? styles.pSlotDone : styles.pSlotTodo]}>
                {isDone(c.slug) ? (
                  <Ionicons name="checkmark" size={20} color={colors.onPastel} />
                ) : (
                  <Text style={styles.pSlotNumber}>{i + 1}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.completeFoot, { paddingBottom: 20 + bottom }]}>
        {upNext ? (
          <Button
            title={`Next: ${upNext.title}`}
            onPress={() => router.replace(`/culture-class?section=${section.slug}&class=${upNext.slug}`)}
          />
        ) : null}
        <Pressable onPress={back} style={styles.textButton}>
          <Text style={styles.textButtonText}>Back to {title}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

/** One answer from a list. Options are shuffled unless their order means something. */
function ChoiceStep({
  prompt,
  options,
  correct,
  explain,
  keepOrder,
  side,
  onDone,
  children,
}: {
  prompt: string;
  options: string[];
  correct: number;
  explain?: string;
  keepOrder?: boolean;
  /** Lay the options out side by side — for true / false. */
  side?: boolean;
  onDone: () => void;
  children?: React.ReactNode;
}) {
  const [shown] = useState(() => {
    const opts = options.map((label, i) => ({ id: String(i), label }));
    return keepOrder ? opts : shuffle(opts);
  });
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  return (
    <ExerciseFrame
      prompt={prompt}
      verdict={verdict}
      canCheck={chosen !== null}
      onCheck={() => setVerdict({ correct: chosen === String(correct), answer: plain(options[correct]), about: plain(explain) })}
      onContinue={onDone}>
      {children}
      <Choices
        options={shown}
        correctId={String(correct)}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
        side={side}
      />
    </ExerciseFrame>
  );
}

/** A Spanish phrase with a hole; the chosen option drops into it as she picks. */
function GapStep({ page, onDone }: { page: Extract<CulturePage, { type: 'gap' }>; onDone: () => void }) {
  const [shown] = useState(() => shuffle(page.options.map((label, i) => ({ id: String(i), label }))));
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [before, after] = page.text.split('___');
  const fill = chosen !== null ? page.options[Number(chosen)] : null;
  const about = plain([page.translation ? `“${page.translation}”` : null, page.explain].filter(Boolean).join('\n\n'));
  return (
    <ExerciseFrame
      prompt={page.prompt}
      verdict={verdict}
      canCheck={chosen !== null}
      onCheck={() =>
        setVerdict({ correct: chosen === String(page.correct), answer: page.options[page.correct], about })
      }
      onContinue={onDone}>
      <View style={styles.scenario}>
        <Text style={styles.gapText}>
          {before}
          <Text style={[styles.gapFill, !fill && styles.gapEmpty]}>{fill ?? '   '}</Text>
          {after}
        </Text>
      </View>
      <Choices
        options={shown}
        correctId={String(page.correct)}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </ExerciseFrame>
  );
}

/** Tap the items in order; tap a placed one to send it back. */
function OrderStep({ page, onDone }: { page: Extract<CulturePage, { type: 'order' }>; onDone: () => void }) {
  const [bank] = useState(() => {
    const ids = page.items.map((_, i) => i);
    let out = shuffle(ids);
    // Never hand her the answer already sorted.
    while (out.every((v, i) => v === i)) out = shuffle(ids);
    return out;
  });
  const [placed, setPlaced] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const revealed = verdict !== null;

  return (
    <ExerciseFrame
      prompt={page.prompt}
      verdict={verdict}
      canCheck={placed.length === page.items.length}
      onCheck={() =>
        setVerdict({
          correct: placed.every((v, i) => v === i),
          answer: page.items.map((it, i) => `${i + 1}. ${it}`).join('\n'),
          about: plain(page.explain),
        })
      }
      onContinue={onDone}>
      <View style={{ gap: 8 }}>
        {page.items.map((_, slot) => {
          const item = placed[slot];
          const filled = item !== undefined;
          const right = revealed && item === slot;
          const wrong = revealed && filled && item !== slot;
          return (
            <Pressable
              key={slot}
              disabled={!filled || revealed}
              onPress={() => setPlaced((p) => p.filter((x) => x !== item))}
              style={({ pressed }) => [
                styles.slot,
                filled && styles.slotFilled,
                right && styles.slotRight,
                wrong && styles.slotWrong,
                { transform: [{ scale: pressed ? 0.985 : 1 }] },
              ]}>
              <Text style={styles.slotNumber}>{slot + 1}</Text>
              <Text style={[styles.slotText, !filled && { color: colors.faint }]}>
                {filled ? page.items[item] : ' '}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.bank}>
        {bank
          .filter((i) => !placed.includes(i))
          .map((i) => (
            <Pressable
              key={i}
              disabled={revealed}
              onPress={() => setPlaced((p) => [...p, i])}
              style={({ pressed }) => [styles.chip, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <Text style={styles.chipText}>{page.items[i]}</Text>
            </Pressable>
          ))}
      </View>
    </ExerciseFrame>
  );
}

/** Two columns; pick one on the left, then its partner on the right. */
function MatchStep({
  prompt,
  pairs,
  explain,
  onDone,
}: {
  prompt: string;
  pairs: [string, string][];
  explain?: string;
  onDone: () => void;
}) {
  const [left] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [right] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [flashWrong, setFlashWrong] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const pickRight = (id: number) => {
    if (matched.has(id) || selected === null || verdict) return;
    if (id !== selected) {
      setMissed(new Set([...missed, id, selected]));
      setFlashWrong(id);
      setTimeout(() => setFlashWrong(null), 450);
      setSelected(null);
      return;
    }
    const next = new Set(matched).add(id);
    setMatched(next);
    setSelected(null);
    if (next.size === pairs.length) {
      setVerdict({
        correct: missed.size === 0,
        answer: pairs
          .filter((_, i) => missed.has(i))
          .map(([a, b]) => `${a} = ${b}`)
          .join('\n'),
        about: plain(explain),
      });
    }
  };

  const cell = (id: number, text: string, side: 'left' | 'right') => {
    const done = matched.has(id);
    const picked = side === 'left' && selected === id;
    return (
      <Pressable
        key={id}
        disabled={done}
        onPress={() => (side === 'left' ? setSelected(selected === id ? null : id) : pickRight(id))}
        style={({ pressed }) => [
          styles.matchCell,
          picked && styles.matchCellPicked,
          flashWrong === id && side === 'right' && styles.matchCellWrong,
          done && styles.matchCellDone,
          { transform: [{ scale: pressed && !done ? 0.97 : 1 }] },
        ]}>
        <Text
          style={[
            styles.matchText,
            done && { color: colors.success },
          ]}>
          {text}
        </Text>
      </Pressable>
    );
  };

  return (
    <ExerciseFrame
      prompt={prompt}
      verdict={verdict}
      note={`${matched.size} of ${pairs.length} matched`}
      onContinue={onDone}>
      <View style={styles.matchGrid}>
        <View style={styles.matchColumn}>{left.map((i) => cell(i, pairs[i][0], 'left'))}</View>
        <View style={styles.matchColumn}>{right.map((i) => cell(i, pairs[i][1], 'right'))}</View>
      </View>
    </ExerciseFrame>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  missingText: { ...font.body[600], fontSize: 17, color: colors.muted },
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

  frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },

  bold: { ...font.body[800], color: colors.ink },
  italic: { fontStyle: 'italic' },


  // Tinted and flat: raised clay cards are the things she taps.
  scenario: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: radius.lg, backgroundColor: colors.accentSoft },
  scenarioText: { ...font.body[600], fontSize: 17, lineHeight: 25, color: colors.ink },
  statement: { ...font.body[600], fontSize: 19, lineHeight: 27, color: colors.ink },
  bigWord: { alignItems: 'center', paddingVertical: 28 },
  bigWordText: { ...font.display[800], fontSize: 32, color: colors.ink, letterSpacing: -0.4 },

  gapText: { ...font.body[600], fontSize: 22, lineHeight: 32, color: colors.ink, textAlign: 'center' },
  gapFill: { color: colors.primary, textDecorationLine: 'underline' },
  gapEmpty: { color: colors.faint },

  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  slotFilled: { borderStyle: 'solid', borderColor: 'transparent', backgroundColor: colors.card, boxShadow: clay.surface },
  slotRight: { borderColor: colors.success, backgroundColor: colors.successSoft },
  slotWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  slotNumber: { ...font.body[800], fontSize: 14, color: colors.muted, width: 16, fontVariant: ['tabular-nums'] },
  slotText: { ...font.body[600], flex: 1, fontSize: 16, color: colors.ink },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  chipText: { ...font.body[600], fontSize: 16, color: colors.ink },

  matchGrid: { flexDirection: 'row', gap: 10 },
  matchColumn: { flex: 1, gap: 10 },
  matchCell: {
    minHeight: 58,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  matchCellPicked: PICKED,
  matchCellWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  matchCellDone: { borderColor: colors.success, backgroundColor: colors.successSoft, boxShadow: clay.flat, opacity: 0.75 },
  matchText: { ...font.body[700], fontSize: 15, color: colors.ink, textAlign: 'center' },

  wordList: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    boxShadow: clay.surface,
    overflow: 'hidden',
  },

  segments: { flex: 1, flexDirection: 'row' },
  segment: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.trough, boxShadow: clay.trough },
  segmentOn: { backgroundColor: colors.primary, boxShadow: 'none' },

  // Story card -------------------------------------------------------------
  card: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  capyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  capyImage: { width: 48, height: 60 },
  capyBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  capyText: { ...font.body[700], fontSize: 15, color: colors.ink },

  // The big-word variant: oat above, peach below — the card is quiet so the word can shout.
  cardBig: { backgroundColor: colors.bg },
  bigZone: { flex: 1, minHeight: 200, justifyContent: 'center', paddingHorizontal: 24, gap: 4 },
  bigTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: pastel.butter,
    boxShadow: clay.surface,
  },
  bigTagText: { ...font.body[800], fontSize: 12, letterSpacing: 0.4, color: colors.onPastel },
  hugeWord: { ...font.display[800], fontSize: 84, lineHeight: 88, letterSpacing: -2.5, color: colors.ink },
  bigMeaning: { ...font.body[600], fontSize: 20, color: colors.muted },
  bigArt: { position: 'absolute', right: 6, bottom: -10, width: 130, height: 170 },
  sheetBig: { backgroundColor: pastel.peach },
  onLight: { color: colors.onPastel },
  onLightMuted: { color: colors.onPastel, opacity: 0.8 },
  onPastelSoft: { color: colors.onPastel, opacity: 0.8 },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 20,
    paddingHorizontal: 24,
    gap: 8,
    boxShadow: clay.surface,
  },
  eyebrow: { ...font.body[800], fontSize: 13 },
  storyTitle: { ...font.display[800], fontSize: 30, lineHeight: 32, letterSpacing: -0.4, color: colors.onPastel },
  body: { ...font.body[600], fontSize: 17, lineHeight: 25 },
  lead: { ...font.body[600], fontSize: 18, lineHeight: 26 },
  storyBold: { ...font.body[800] },
  wordChip: { ...font.body[800] },

  // The five layouts. Each splits its text around the picture: `lead` beside it, the rest after.
  head: { paddingHorizontal: 24, paddingTop: 22, gap: 8 },
  headCenter: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  posterTitle: { ...font.display[800], fontSize: 44, lineHeight: 44, letterSpacing: -1, color: colors.ink },
  pill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    boxShadow: clay.surface,
  },
  pillText: { ...font.body[800], fontSize: 12, color: colors.onPastel },
  mid: { flex: 1, minHeight: 170, flexDirection: 'row', alignItems: 'center', paddingLeft: 24, gap: 4 },
  leadCol: { width: '44%', justifyContent: 'center' },
  artBox: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  artFill: { width: '100%', height: '100%', maxHeight: 320 },
  discLayer: { justifyContent: 'center', alignItems: 'flex-end' },
  disc: { marginRight: -40, height: '82%', aspectRatio: 1, borderRadius: 999, boxShadow: clay.surface },
  discCenter: { marginRight: 0, height: '72%' },
  whiteSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 8,
    ...shadow.raised,
  },
  oatSheet: { backgroundColor: colors.bg, paddingTop: 20, paddingHorizontal: 24, gap: 8 },
  // The split block's diagonal: a strip of the sheet, tilted up over the peach.
  slant: { position: 'absolute', top: -34, left: -40, right: -40, height: 80, backgroundColor: colors.bg, transform: [{ rotate: '-6deg' }] },
  bubbleCol: { flex: 1, paddingTop: 22, paddingHorizontal: 20, gap: 10 },
  bubbleLead: { alignSelf: 'flex-start', maxWidth: '72%' },
  bubbleEdge: { backgroundColor: pastelGrad.lav[1], borderRadius: 24, paddingBottom: 5 },
  bubble: { backgroundColor: colors.card, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 18 },
  tailDown: {
    position: 'absolute',
    right: 36,
    bottom: -16,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.card,
  },
  tailUp: {
    position: 'absolute',
    left: 60,
    top: -16,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.card,
  },
  raysHub: { position: 'absolute', left: '68%', top: '42%' },
  raysLead: { backgroundColor: colors.chip, borderRadius: radius.md, padding: 14, boxShadow: clay.surface },
  raysSheet: { paddingTop: 48, paddingHorizontal: 24, gap: 8 },
  chat: { flex: 1, paddingTop: 18, paddingHorizontal: 20, gap: 12 },
  chatThread: { flex: 1, gap: 6 },
  chatBubble: {
    alignSelf: 'flex-start',
    marginLeft: 50,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    boxShadow: clay.surface,
  },
  chatLastRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  chatLast: { flex: 1, marginLeft: 0 },
  chatTitle: { ...font.display[800], fontSize: 26, lineHeight: 28, letterSpacing: -0.4, color: colors.ink },
  chatPhoto: {
    flex: 1,
    width: '66%',
    marginLeft: 50,
    minHeight: 110,
    maxHeight: 230,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    backgroundColor: pastel.sage,
    boxShadow: clay.surface,
    padding: 10,
  },
  chatAvatar: { width: 42, height: 52 },
  chatFoot: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatAsk: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  chatAskText: { ...font.body[800], fontSize: 16, color: colors.primary },
  chatNext: {
    height: 54,
    paddingHorizontal: 26,
    borderRadius: 27,
    backgroundColor: colors.primary,
    boxShadow: clay.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatNextText: { ...font.body[800], fontSize: 16, color: colors.onPrimary },
  sheetFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 16 },
  hint: { ...font.body[600], flex: 1, fontSize: 14, color: colors.muted },
  hintOnPastel: { color: colors.onPastel, opacity: 0.8 },
  roundNext: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },

  popover: {
    position: 'absolute',
    left: 28,
    right: 28,
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    ...shadow.raised,
  },
  popWord: { ...font.display[800], fontSize: 20, letterSpacing: -0.3, color: colors.ink },
  popHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  popActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  popSpeak: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  popExample: { paddingRight: 4, gap: 1 },
  popExampleEs: { ...font.body[700], fontSize: 15, color: colors.ink },
  popExampleEn: { ...font.body[600], fontSize: 13, color: colors.muted },
  popNote: { ...font.body[600], fontSize: 13, lineHeight: 18, color: colors.muted, paddingRight: 4 },
  popMeaning: { ...font.body[600], fontSize: 14, color: colors.muted, marginTop: 1 },

  // Fact card --------------------------------------------------------------
  factCard: { backgroundColor: pastel.butter },
  factBody: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 90, gap: 12 },
  factChip: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    boxShadow: clay.surface,
  },
  factChipText: { ...font.body[800], fontSize: 13, color: colors.onPastel },
  factHero: { ...font.display[800], fontSize: 88, lineHeight: 92, letterSpacing: -3, color: colors.onPastel },
  factHeroLong: { fontSize: 60, lineHeight: 64, letterSpacing: -2 },
  factText: { ...font.display[700], fontSize: 26, lineHeight: 31, letterSpacing: -0.3, color: colors.onPastel },
  factTextBig: { ...font.display[700], fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: colors.onPastel },
  factBold: { ...font.display[800], color: colors.primaryDark },
  factArt: { position: 'absolute', left: 4, bottom: 70, width: 150, height: 180 },
  factFoot: { paddingHorizontal: 28, paddingTop: 12 },
  factButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingHorizontal: 26,
    borderRadius: 28,
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  factButtonText: { ...font.body[800], fontSize: 17, color: colors.onPrimary },

  // Word deck --------------------------------------------------------------
  deckLabel: {
    ...font.body[800],
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 6,
    fontSize: 13,
    color: colors.muted,
  },
  wordCard: { flex: 1, borderRadius: radius.xl, backgroundColor: pastel.lav, boxShadow: clay.surface, padding: 26, gap: 16 },
  wordCardTop: { minHeight: 28, flexDirection: 'row' },
  wordCardMid: { flex: 1, justifyContent: 'center', gap: 8 },
  wordEs: { ...font.display[800], fontSize: 48, lineHeight: 52, letterSpacing: -1, color: colors.onPastel },
  wordEn: { ...font.body[600], fontSize: 21, lineHeight: 27, color: colors.onPastel, opacity: 0.85 },
  wordExampleBox: { padding: 16, borderRadius: radius.md, backgroundColor: colors.chip, boxShadow: clay.surface, gap: 3 },
  wordExampleEs: { ...font.body[700], fontSize: 18, lineHeight: 24, color: colors.onPastel },
  wordExampleEn: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.muted },
  wordNote: { ...font.body[600], fontSize: 14, lineHeight: 19, color: colors.onPastel, opacity: 0.85 },
  deckFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.trough },
  dotOn: { width: 22, backgroundColor: colors.primary },

  // Stamp and passport -----------------------------------------------------
  completeTop: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'flex-end' },
  completeBody: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24, gap: 8 },
  stamp: { width: STAMP, height: STAMP, marginTop: 6, marginBottom: 10, alignItems: 'center', justifyContent: 'center' },
  stampDashed: {
    position: 'absolute',
    width: STAMP,
    height: STAMP,
    borderRadius: STAMP / 2,
    borderWidth: 5,
    borderColor: colors.accent,
  },
  stampInner: {
    position: 'absolute',
    width: STAMP - 56,
    height: STAMP - 56,
    borderRadius: (STAMP - 56) / 2,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  stampTop: { ...font.body[800], position: 'absolute', top: 30, fontSize: 10, letterSpacing: 2.5, color: colors.accent },
  stampLabel: { ...font.display[800], width: STAMP - 100, textAlign: 'center', fontSize: 34, letterSpacing: -0.6, color: colors.accent },
  stampSub: { ...font.body[800], position: 'absolute', bottom: 68, fontSize: 10, letterSpacing: 2, color: colors.accent },
  completeTitle: { ...font.display[800], fontSize: 34, letterSpacing: -0.5, color: colors.ink },
  completeLine: { ...font.body[600], fontSize: 17, lineHeight: 24, textAlign: 'center', color: colors.muted, maxWidth: 300 },
  passport: {
    alignSelf: 'stretch',
    marginTop: 18,
    padding: 18,
    gap: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  passportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  passportTitle: { ...font.display[800], fontSize: 17, color: colors.ink },
  passportCount: { ...font.body[800], fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pSlot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pSlotDone: { backgroundColor: pastel.peach, boxShadow: clay.surface },
  pSlotTodo: { backgroundColor: colors.trough, boxShadow: clay.trough },
  pSlotNumber: { ...font.body[800], fontSize: 16, color: colors.muted },
  completeFoot: { paddingHorizontal: 24, paddingTop: 12, gap: 6 },
  textButton: { height: 44, alignItems: 'center', justifyContent: 'center' },
  textButtonText: { ...font.body[700], fontSize: 15, color: colors.muted },
});

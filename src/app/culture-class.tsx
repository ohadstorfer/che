import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
import { Button, Panel } from '@/components/ui';
import { artFor } from '@/lib/culture-art';
import {
  type CulturePage,
  type CultureWord,
  classKey,
  findClass,
  markClassDone,
  splitTitle,
} from '@/lib/culture';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, fonts, gradients, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// A culture class (docs/culture-spec.md), played as cards: the reading is cut
// into short story beats — one idea, one capybara, a couple of sentences —
// with a fun fact given a card of its own, easy questions between them, and
// the class's words at the end as a deck of cards, then a match and a couple
// of "what does it mean?". Nothing here is scheduled or scored against her; a
// wrong answer just gets its explanation. Finishing stamps her passport.
//
// The story cards sit *under* a pale header rather than running to the top of
// the screen: the strip above a standalone PWA is one frozen bone colour on
// iOS 26 (see status-bar-color), and a green edge there would meet it badly.
// ---------------------------------------------------------------------------

interface Story {
  art: ImageSourcePropType;
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
}

type Step =
  | { kind: 'story'; story: Story }
  | { kind: 'fact'; fact: Fact }
  | { kind: 'page'; page: CulturePage }
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

const stripMarks = (text: string) => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
const wordCount = (text: string) => stripMarks(text).split(/\s+/).filter(Boolean).length;
const sentencesOf = (text: string) =>
  text.match(/[^.!?]+(?:[.!?]+["')\]”]*|$)\s*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];

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
  pages.forEach((page, n) => {
    if (page.type !== 'info') {
      steps.push({ kind: 'page', page });
      return;
    }
    const art = artFor(section, n);
    beatsOf(page.body).forEach((text, i) => {
      steps.push({
        kind: 'story',
        story: {
          art,
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
  steps.push({ kind: 'words', words: vocab });
  // Matches of 3–5 pairs: split evenly rather than leaving a stub of one or two.
  const groups = Math.ceil(vocab.length / 5);
  const mixed = shuffle(vocab);
  for (let g = 0; g < groups; g++) {
    const chunk = mixed.filter((_, i) => i % groups === g);
    steps.push({ kind: 'match', pairs: chunk.map((w) => [w.es, w.en]) });
  }
  for (const word of shuffle(vocab).slice(0, 2)) {
    const others = shuffle(vocab.filter((w) => w !== word)).slice(0, 3);
    steps.push({ kind: 'meaning', word, options: shuffle([word.en, ...others.map((w) => w.en)]) });
  }
  return steps;
}

export default function CultureClass() {
  useStatusBarColor(colors.bg);
  const params = useLocalSearchParams<{ section?: string; class?: string }>();
  const found = findClass(params.section ?? '', params.class ?? '');
  const [steps] = useState(() =>
    found ? buildSteps(found.section.slug, found.cls.title, found.cls.pages, found.cls.vocabulary) : [],
  );
  const [index, setIndex] = useState(0);
  // Words she tapped "Keep" on while reading; they lead the deck at the end.
  const [kept, setKept] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string> | null>(null);
  const finished = found !== null && index >= steps.length;

  useEffect(() => {
    if (finished && params.section && params.class) void markClassDone(params.section, params.class).then(setDone);
  }, [finished, params.section, params.class]);

  if (!found) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This class doesn't exist.</Text>
          <Button title="Back to culture" onPress={() => router.replace('/culture')} />
        </View>
      </SafeAreaView>
    );
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
  const keep = (es: string) => setKept((prev) => new Set(prev).add(es));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header section={found.section.slug} index={index} total={steps.length} />
      <Enter key={index}>
        <StepView
          step={step}
          section={found.section.slug}
          words={found.cls.vocabulary}
          kept={kept}
          onKeep={keep}
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
  kept,
  onKeep,
  onDone,
  onBack,
}: {
  step: Step;
  section: string;
  words: CultureWord[];
  kept: Set<string>;
  onKeep: (es: string) => void;
  onDone: () => void;
  onBack?: () => void;
}) {
  if (step.kind === 'story') return <StoryCard story={step.story} words={words} kept={kept} onKeep={onKeep} onDone={onDone} onBack={onBack} />;
  if (step.kind === 'fact') return <FactCard fact={step.fact} onDone={onDone} onBack={onBack} />;
  if (step.kind === 'words') return <WordsStep words={step.words} kept={kept} onDone={onDone} />;
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
      return null; // Always split into story and fact cards by buildSteps.
    case 'choice':
      return (
        <ChoiceStep prompt={page.prompt} options={page.options} correct={page.correct} explain={page.explain} onDone={onDone}>
          <CapySays art={artFor(section, 0)} />
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
          <CapySays art={artFor(section, 0)} />
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
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <Text key={i} style={styles.bold}>
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

/** Story text on a dark card. Highlighted words that are in the class's vocabulary become tappable chips. */
function StoryText({
  text,
  words,
  kept,
  onOpen,
  style,
  light,
}: {
  light?: boolean;
  text: string;
  words: CultureWord[];
  kept: Set<string>;
  onOpen: (w: CultureWord) => void;
  style: object;
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
              <Text key={i} style={[styles.storyBold, light && styles.onLight]}>
                {label}
              </Text>
            );
          }
          return (
            <Text
              key={i}
              onPress={() => onOpen(word)}
              accessibilityRole="button"
              style={[styles.wordChip, kept.has(word.es) && styles.wordChipKept]}>
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

function RoundNext({ onPress, bg, fg }: { onPress: () => void; bg: string; fg: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Continue"
      style={({ pressed }) => [styles.roundNext, { backgroundColor: bg, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
      <Ionicons name="arrow-forward" size={24} color={fg} />
    </Pressable>
  );
}

/** One idea per card. Tap anywhere to go on; tap a highlighted word to look at it and keep it. */
function StoryCard({
  story,
  words,
  kept,
  onKeep,
  onDone,
  onBack,
}: {
  story: Story;
  words: CultureWord[];
  kept: Set<string>;
  onKeep: (es: string) => void;
  onDone: () => void;
  onBack?: () => void;
}) {
  const bottom = useSafeAreaInsets().bottom;
  const tap = useSideTap(onDone, onBack);
  const [open, setOpen] = useState<CultureWord | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const first = story.title !== undefined;
  const big = story.bigWord;
  const hasChips = story.text.split(/(\*\*[^*]+\*\*)/g).some((p) => p.startsWith('**') && wordFor(words, p.slice(2, -2)));

  return (
    <Pressable
      ref={tap.ref}
      style={[styles.card, big && styles.cardBig]}
      onPress={(e) => (open ? setOpen(null) : tap.onPress(e))}
      accessible={false}>
      {big ? (
        <View style={styles.bigZone}>
          {big.tag ? (
            <View style={styles.bigTag}>
              <Text style={styles.bigTagText}>{big.tag}</Text>
            </View>
          ) : null}
          <Text style={styles.hugeWord} adjustsFontSizeToFit numberOfLines={2}>
            {big.es}
          </Text>
          <Text style={styles.bigMeaning}>{big.en}</Text>
          <Image source={story.art} style={styles.bigArt} contentFit="contain" accessible={false} />
        </View>
      ) : (
        <View style={styles.art}>
          <View style={styles.artDisc} />
          <Image source={story.art} style={styles.artImage} contentFit="contain" accessible={false} />
        </View>
      )}

      {open ? (
        <Pop style={[styles.popover, { bottom: sheetHeight + 12 }]}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.popWord}>{open.es}</Text>
            <Text style={styles.popMeaning}>{open.en}</Text>
          </View>
          <Pressable
            onPress={() => {
              onKeep(open.es);
              setOpen(null);
            }}
            style={({ pressed }) => [styles.popKeep, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
            {kept.has(open.es) ? <Ionicons name="checkmark" size={16} color={colors.onPrimary} /> : null}
            <Text style={styles.popKeepText}>{kept.has(open.es) ? 'Kept' : 'Keep'}</Text>
          </Pressable>
        </Pop>
      ) : null}

      <View style={[styles.sheet, big && styles.sheetBig, { paddingBottom: 24 + bottom }]} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
        <Text style={[styles.eyebrowDark, big && styles.onLightMuted]} numberOfLines={1}>
          {story.eyebrow}
        </Text>
        {first ? <Text style={[styles.storyTitle, big && styles.onLight]}>{story.title}</Text> : null}
        <StoryText
          text={story.text}
          words={words}
          kept={kept}
          onOpen={(w) => setOpen((cur) => (cur === w ? null : w))}
          light={!!big}
          style={[first ? styles.storyBody : styles.storyBodyBig, big && styles.onLight]}
        />
        <View style={styles.sheetFoot}>
          <Text style={[styles.hint, big && styles.onLightMuted]}>{hasChips ? 'Tap a highlighted word to keep it' : 'Tap right to go on, left to go back'}</Text>
          <RoundNext onPress={onDone} bg={big ? colors.primary : colors.onPrimary} fg={big ? colors.onPrimary : colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

/** The fun fact, on a card of its own so it lands instead of hanging off the end of a paragraph. */
function FactCard({ fact, onDone, onBack }: { fact: Fact; onDone: () => void; onBack?: () => void }) {
  const bottom = useSafeAreaInsets().bottom;
  const tap = useSideTap(onDone, onBack);
  return (
    <Pressable ref={tap.ref} style={[styles.card, styles.factCard]} onPress={tap.onPress} accessible={false}>
      <Image source={fact.art} style={styles.factArt} contentFit="contain" accessible={false} />
      <View style={styles.factBody}>
        <View style={styles.factChip}>
          <Text style={styles.factChipText}>Did you know?</Text>
        </View>
        {fact.hero ? (
          <Text style={[styles.factHero, fact.hero.length > 4 && styles.factHeroLong]}>
            {fact.hero}
          </Text>
        ) : null}
        <Text style={fact.hero ? styles.factText : styles.factTextBig}>{stripMarks(fact.text)}</Text>
      </View>
      <View style={[styles.factFoot, { paddingBottom: 24 + bottom }]}>
        <Pressable
          onPress={onDone}
          accessibilityRole="button"
          style={({ pressed }) => [styles.factButton, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          <Text style={styles.factButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.dangerInk} />
        </Pressable>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// The words: a deck to swipe through. The ones she kept while reading come first.
// ---------------------------------------------------------------------------

function WordsStep({ words, kept, onDone }: { words: CultureWord[]; kept: Set<string>; onDone: () => void }) {
  const bottom = useSafeAreaInsets().bottom;
  const [deck] = useState(() => [...words].sort((a, b) => Number(kept.has(b.es)) - Number(kept.has(a.es))));
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
                  <View style={styles.wordCardTop}>
                    {kept.has(w.es) ? (
                      <View style={styles.keptTag}>
                        <Text style={styles.keptTagText}>Kept</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.wordCardMid}>
                    <Text style={styles.wordEs} adjustsFontSizeToFit numberOfLines={2}>
                      {w.es}
                    </Text>
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
          <RoundNext onPress={() => go(at + 1)} bg={colors.ink} fg={colors.bg} />
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
      <Text style={styles.stampTop}>CHE · ARGENTINA</Text>
      <Text style={styles.stampLabel} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
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
                  <Ionicons name="checkmark" size={20} color={colors.accent} />
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
            picked && { color: colors.onPrimary },
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
  missingText: { fontSize: 17, color: colors.muted },
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

  bold: { fontWeight: '700', color: colors.ink },
  italic: { fontStyle: 'italic' },


  // Tinted and borderless: white bordered cards are the things she taps.
  scenario: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: radius.lg, backgroundColor: colors.primarySoft },
  scenarioText: { fontSize: 17, lineHeight: 25, color: colors.ink },
  statement: { fontSize: 19, lineHeight: 27, color: colors.ink, fontWeight: '500' },
  bigWord: { alignItems: 'center', paddingVertical: 28 },
  bigWordText: { fontSize: 32, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },

  gapText: { fontSize: 22, lineHeight: 32, color: colors.ink, fontWeight: '600', textAlign: 'center' },
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
  slotFilled: { borderStyle: 'solid', backgroundColor: colors.card },
  slotRight: { borderColor: colors.success, backgroundColor: colors.successSoft },
  slotWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  slotNumber: { fontSize: 14, fontWeight: '700', color: colors.muted, width: 16, fontVariant: ['tabular-nums'] },
  slotText: { flex: 1, fontSize: 16, color: colors.ink, fontWeight: '500' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipText: { fontSize: 16, color: colors.ink, fontWeight: '500' },

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
  matchCellWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  matchCellDone: { borderColor: colors.success, backgroundColor: colors.successSoft, opacity: 0.75 },
  matchText: { fontSize: 15, fontWeight: '600', color: colors.ink, textAlign: 'center' },

  wordList: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  segments: { flex: 1, flexDirection: 'row' },
  segment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border },
  segmentOn: { backgroundColor: colors.primary },

  // Story card -------------------------------------------------------------
  card: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  capyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  capyImage: { width: 48, height: 60 },
  capyBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    backgroundColor: colors.border,
  },
  capyText: { fontSize: 15, fontWeight: '600', color: colors.ink },

  // The big-word variant: bone above, sage below — the card is quiet so the word can shout.
  cardBig: { backgroundColor: colors.bg },
  bigZone: { flex: 1, minHeight: 200, justifyContent: 'center', paddingHorizontal: 24, gap: 4 },
  bigTag: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, backgroundColor: colors.border },
  bigTagText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', color: colors.primaryDark },
  hugeWord: { fontFamily: fonts.display, fontSize: 84, lineHeight: 88, letterSpacing: -2.5, color: colors.primary },
  bigMeaning: { fontSize: 20, fontWeight: '600', color: colors.muted },
  bigArt: { position: 'absolute', right: 6, bottom: -10, width: 130, height: 170 },
  sheetBig: { backgroundColor: gradients.tile[1] },
  onLight: { color: colors.primaryDark },
  onLightMuted: { color: 'rgba(43, 60, 46, 0.7)' },
  art: { flex: 1, minHeight: 190, alignItems: 'center', justifyContent: 'flex-end' },
  artDisc: {
    position: 'absolute',
    bottom: -90,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: gradients.tile[0],
  },
  artImage: { width: 250, height: '92%', marginBottom: 8 },
  sheet: {
    backgroundColor: colors.primaryDark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 24,
    gap: 8,
  },
  eyebrowDark: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: gradients.tile[1] },
  storyTitle: { fontFamily: fonts.display, fontSize: 31, lineHeight: 34, letterSpacing: -0.6, color: colors.onPrimary },
  storyBody: { fontSize: 17, lineHeight: 25, color: 'rgba(241, 238, 230, 0.88)' },
  storyBodyBig: { fontSize: 22, lineHeight: 30, fontWeight: '600', letterSpacing: -0.2, color: colors.onPrimary },
  storyBold: { fontWeight: '700', color: colors.onPrimary },
  wordChip: { fontWeight: '700', color: '#FFFFFF', backgroundColor: colors.accent },
  wordChipKept: { backgroundColor: 'rgba(241, 238, 230, 0.24)' },
  sheetFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 16 },
  hint: { flex: 1, fontSize: 14, color: 'rgba(241, 238, 230, 0.6)' },
  roundNext: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },

  popover: {
    position: 'absolute',
    left: 28,
    right: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 18,
    backgroundColor: colors.card,
    ...shadow.raised,
  },
  popWord: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.3, color: colors.ink },
  popMeaning: { fontSize: 14, color: colors.muted, marginTop: 1 },
  popKeep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  popKeepText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },

  // Fact card --------------------------------------------------------------
  factCard: { backgroundColor: colors.accent },
  factBody: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 90, gap: 12 },
  factChip: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  factChipText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', color: '#FFFFFF' },
  factHero: { fontFamily: fonts.display, fontSize: 88, lineHeight: 92, letterSpacing: -3, color: '#FFFFFF' },
  factHeroLong: { fontSize: 60, lineHeight: 64, letterSpacing: -2 },
  factText: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.4, color: '#FFFFFF' },
  factTextBig: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5, color: '#FFFFFF' },
  factArt: { position: 'absolute', right: 4, bottom: 70, width: 150, height: 180 },
  factFoot: { paddingHorizontal: 28, paddingTop: 12 },
  factButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingHorizontal: 26,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  factButtonText: { fontSize: 17, fontWeight: '700', color: colors.dangerInk },

  // Word deck --------------------------------------------------------------
  deckLabel: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  wordCard: { flex: 1, borderRadius: 32, backgroundColor: colors.primary, padding: 26, gap: 16 },
  wordCardTop: { minHeight: 28, flexDirection: 'row' },
  keptTag: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 99, backgroundColor: colors.accent },
  keptTagText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#FFFFFF' },
  wordCardMid: { flex: 1, justifyContent: 'center', gap: 8 },
  wordEs: { fontFamily: fonts.display, fontSize: 48, lineHeight: 52, letterSpacing: -1.2, color: colors.onPrimary },
  wordEn: { fontSize: 21, lineHeight: 27, fontWeight: '500', color: gradients.tile[1] },
  wordExampleBox: { padding: 16, borderRadius: 20, backgroundColor: 'rgba(241, 238, 230, 0.12)', gap: 3 },
  wordExampleEs: { fontSize: 18, lineHeight: 24, fontWeight: '600', color: colors.onPrimary },
  wordExampleEn: { fontSize: 15, lineHeight: 21, color: 'rgba(241, 238, 230, 0.7)' },
  wordNote: { fontSize: 14, lineHeight: 19, color: gradients.tile[1] },
  deckFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
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
  stampTop: { position: 'absolute', top: 30, fontSize: 10, fontWeight: '700', letterSpacing: 2.5, color: colors.accent },
  stampLabel: { fontFamily: fonts.display, width: STAMP - 100, textAlign: 'center', fontSize: 34, letterSpacing: -0.8, color: colors.accent },
  stampSub: { position: 'absolute', bottom: 68, fontSize: 10, fontWeight: '700', letterSpacing: 2, color: colors.accent },
  completeTitle: { fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.7, color: colors.ink },
  completeLine: { fontSize: 17, lineHeight: 24, textAlign: 'center', color: colors.muted, maxWidth: 300 },
  passport: {
    alignSelf: 'stretch',
    marginTop: 18,
    padding: 18,
    gap: 14,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  passportTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  passportCount: { fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pSlot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pSlotDone: { borderWidth: 2.5, borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pSlotTodo: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border },
  pSlotNumber: { fontSize: 16, fontWeight: '700', color: colors.faint },
  completeFoot: { paddingHorizontal: 24, paddingTop: 12, gap: 6 },
  textButton: { height: 44, alignItems: 'center', justifyContent: 'center' },
  textButtonText: { fontSize: 15, fontWeight: '600', color: colors.muted },
});

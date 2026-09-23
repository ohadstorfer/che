import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseFrame, type Verdict } from '@/components/exercise-frame';
import { Choices } from '@/components/exercises';
import { LessonComplete } from '@/components/lesson-complete';
import { Button, Panel } from '@/components/ui';
import { type CulturePage, type CultureWord, findClass, markClassDone } from '@/lib/culture';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// A culture class (docs/culture-spec.md): a few pages to read, easy questions
// between them, and the class's words at the end — first as a list, then as
// a match and a couple of "what does it mean?". Nothing here is scheduled or
// scored against her; a wrong answer just gets its explanation.
// ---------------------------------------------------------------------------

type Step =
  | { kind: 'page'; page: CulturePage }
  | { kind: 'words'; words: CultureWord[] }
  | { kind: 'match'; pairs: [string, string][] }
  | { kind: 'meaning'; word: CultureWord; options: string[] };

/** Enter: 220ms, strong ease-out, a short rise — a page arriving, not flying in. */
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const shuffle = <T,>(xs: T[]): T[] => {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** The authored pages, then the word review built from the vocabulary. */
function buildSteps(pages: CulturePage[], vocab: CultureWord[]): Step[] {
  const steps: Step[] = pages.map((page) => ({ kind: 'page', page }));
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
  const [steps] = useState(() => (found ? buildSteps(found.cls.pages, found.cls.vocabulary) : []));
  const [index, setIndex] = useState(0);
  const finished = found !== null && index >= steps.length;

  useEffect(() => {
    if (finished && params.section && params.class) void markClassDone(params.section, params.class);
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
      <SafeAreaView style={styles.safe}>
        <LessonComplete streak={null} onNext={() => router.replace('/culture')} />
      </SafeAreaView>
    );
  }

  const step = steps[index];
  const next = () => setIndex((i) => i + 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header progress={index / steps.length} />
      <Enter key={index}>
        <StepView step={step} onDone={next} />
      </Enter>
    </SafeAreaView>
  );
}

function StepView({ step, onDone }: { step: Step; onDone: () => void }) {
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
      return <InfoStep page={page} onDone={onDone} />;
    case 'choice':
      return (
        <ChoiceStep prompt={page.prompt} options={page.options} correct={page.correct} explain={page.explain} onDone={onDone}>
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
          onDone={onDone}>
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

function Header({ progress }: { progress: number }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => goBack('/culture')} hitSlop={12} accessibilityLabel="Close">
        <Ionicons name="close" size={26} color={colors.muted} />
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 3)}%` }]} />
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

/** A reading screen with its one button docked where the exercises keep theirs. */
function Reading({ children, onDone, label = 'Continue' }: { children: React.ReactNode; onDone: () => void; label?: string }) {
  const bottom = useSafeAreaInsets().bottom;
  return (
    <View style={styles.frame}>
      <ScrollView contentContainerStyle={styles.readingBody} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: 20 + bottom }]}>
        <Button title={label} onPress={onDone} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function InfoStep({ page, onDone }: { page: Extract<CulturePage, { type: 'info' }>; onDone: () => void }) {
  return (
    <Reading onDone={onDone}>
      {page.emoji ? <Text style={styles.infoEmoji}>{page.emoji}</Text> : null}
      <Text style={styles.infoTitle}>{page.title}</Text>
      <Text style={styles.infoBody}>
        <Rich text={page.body} />
      </Text>
      {page.fun_fact ? (
        <View style={styles.funFact}>
          <Text style={styles.funFactLabel}>Fun fact</Text>
          <Text style={styles.funFactText}>
            <Rich text={page.fun_fact} />
          </Text>
        </View>
      ) : null}
    </Reading>
  );
}

function WordsStep({ words, onDone }: { words: CultureWord[]; onDone: () => void }) {
  return (
    <Reading onDone={onDone} label="Practice them">
      <Text style={styles.infoTitle}>Words from this class</Text>
      <View style={styles.wordList}>
        {words.map((w, i) => (
          <View key={w.es} style={[styles.wordRow, i > 0 && styles.wordRule]}>
            <View style={styles.wordTop}>
              <Text style={styles.wordEs}>{w.es}</Text>
              <Text style={styles.wordEn}>{w.en}</Text>
            </View>
            {/* Two lines, not "es — en": the examples are often dialogue, full of dashes already. */}
            {w.example ? (
              <View>
                <Text style={[styles.wordExample, styles.italic, { color: colors.ink }]}>{w.example.es}</Text>
                <Text style={styles.wordExample}>{w.example.en}</Text>
              </View>
            ) : null}
            {w.note ? <Text style={styles.wordNote}>{w.note}</Text> : null}
          </View>
        ))}
      </View>
    </Reading>
  );
}

/** One answer from a list. Options are shuffled unless their order means something. */
function ChoiceStep({
  prompt,
  options,
  correct,
  explain,
  keepOrder,
  onDone,
  children,
}: {
  prompt: string;
  options: string[];
  correct: number;
  explain?: string;
  keepOrder?: boolean;
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
      <Choices options={shown} correctId={String(correct)} chosen={chosen} revealed={verdict !== null} onPick={setChosen} />
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
  progressTrack: { flex: 1, height: 10, borderRadius: 99, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.primary },

  frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  readingBody: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 14, flexGrow: 1 },
  footer: { padding: 20, paddingTop: 12 },

  bold: { fontWeight: '700', color: colors.ink },
  italic: { fontStyle: 'italic' },

  infoEmoji: { fontSize: 56, marginTop: 8 },
  infoTitle: { fontSize: 26, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  infoBody: { fontSize: 18, lineHeight: 27, color: colors.ink },
  funFact: {
    marginTop: 6,
    padding: 16,
    gap: 4,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  funFactLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.dangerInk,
  },
  funFactText: { fontSize: 16, lineHeight: 23, color: colors.ink },

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
  wordRow: { paddingVertical: 12, paddingHorizontal: 16, gap: 3 },
  wordRule: { borderTopWidth: 1, borderTopColor: colors.border },
  wordTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  wordEs: { fontSize: 17, fontWeight: '700', color: colors.ink },
  wordEn: { flexShrink: 1, fontSize: 15, color: colors.muted, textAlign: 'right' },
  wordExample: { fontSize: 14, lineHeight: 20, color: colors.muted },
  wordNote: { fontSize: 13, lineHeight: 18, color: colors.dangerInk },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseFrame, type Verdict } from '@/components/exercise-frame';
import { Choices, Exercise, PlayButton, SentenceLine, WordBubble, useWordPopover } from '@/components/exercises';
import { LessonEnd } from '@/components/unit-progress';
import { StreakCelebration } from '@/components/streak-celebration';
import { Button, Panel } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { LessonLockedError, lessonWithUnit, readLessonRows } from '@/lib/lesson';
import { backToCourse, goBack } from '@/lib/nav';
import { type AnswerExtra, type FinishResult, type QueueItem, useRound } from '@/lib/round';
import { type LearnerData, deckUpTo, drillable, loadLearner, sentenceItem } from '@/lib/session';
import { clay, colors, font, gradients, pastel, radius } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';
import type { Form, Sentence } from '@/lib/types';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// A story (learning-engine-spec §8): a short dialogue made almost entirely of
// words she already has, revealed a line at a time, with a question every few
// lines. Every word can be tapped for its meaning — a story is for reading, so
// peeking costs nothing here. Questions are the practice screen's own
// exercises, scored the same way; a comprehension question asks about the
// story rather than a word, and only counts towards finishing it.
// ---------------------------------------------------------------------------

type Question =
  | { type: 'meaning' | 'build' }
  | { type: 'gap'; form: string }
  | { type: 'choice'; prompt_en: string; options_en: string[]; correct: number };

interface Line {
  id: string;
  ordinal: number;
  speaker: string;
  sentence: Sentence;
  question: Question | null;
  /** The exercise for a word question. */
  item: QueueItem | null;
}

/** Enter: 220ms, strong ease-out, a short rise — a line arriving, not flying in. */
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** A line's entrance. Opacity and transform only; reduced motion keeps the fade. */
function Enter({ reduced, style, children }: { reduced: boolean; style: object; children: React.ReactNode }) {
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
  return <RNAnimated.View style={[style, { opacity: t, transform: rise }]}>{children}</RNAnimated.View>;
}

export default function Story() {
  useStatusBarColor(colors.bg);
  const { profile } = useAuth();
  const userId = profile?.id;
  const { lesson: lessonId } = useLocalSearchParams<{ lesson?: string }>();
  const round = useRound(userId);
  const reduced = useReducedMotion();
  const bottom = useSafeAreaInsets().bottom;

  const [lines, setLines] = useState<Line[] | null>(null);
  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState<Form[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [shown, setShown] = useState(1);
  /** The line whose question is on screen, if any. */
  const [asking, setAsking] = useState<Line | null>(null);
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const words = useWordPopover((id) => formById.current.get(id));
  const [finished, setFinished] = useState<FinishResult | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const formById = useRef(new Map<string, Form>());

  useEffect(() => {
    if (!userId || !lessonId) return;
    let cancelled = false;
    (async () => {
      const [{ lesson, unit }, rows] = await Promise.all([
        lessonWithUnit(lessonId),
        readLessonRows<RawLine>('story_lines', lessonId),
      ]);
      // Sentences as far as the story's unit, and every line's, wherever it is.
      const data = await loadLearner(userId, {
        throughOrder: unit.course_order,
        unitIds: [unit.id],
        sentenceIds: rows.map((r) => r.sentence_id),
      });
      if (cancelled) return;
      const built = buildLines(data, rows);
      formById.current = data.formById;
      const nowIso = new Date().toISOString();
      const queue = built.flatMap((l) => (l.item ? [l.item] : []));
      const scheduled = queue.flatMap((i) =>
        (i.group ?? [i.form]).filter((f) => {
          const st = data.stateByForm.get(f.id);
          return !!st?.due_at && st.due_at <= nowIso;
        }),
      );
      round.begin({
        kind: 'story',
        lessonId,
        queue,
        scheduledFormIds: scheduled.map((f) => f.id),
        sentences: data.sentences,
        ladder: data.ladder,
        retries: false,
      });
      setTitle(lesson.title_en);
      setDeck(deckUpTo(data, unit.course_order));
      setSentences(data.sentences);
      setLines(built);
    })().catch((e) => {
      if (cancelled) return;
      if (e instanceof LessonLockedError) router.replace('/paywall?from=lesson');
      else console.warn('story failed to load', e);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonId]);

  if (!profile) return null;

  if (finished) {
    const celebrate = finished.current_streak > 0 && finished.current_streak !== finished.previous_streak;
    if (celebrating) {
      return (
        <SafeAreaView style={styles.safe}>
          <StreakCelebration
            previous={finished.previous_streak}
            streak={finished.current_streak}
            onDone={backToCourse}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe}>
        <LessonEnd
          lessonId={lessonId}
          streak={finished.current_streak}
          celebrate={celebrate}
          onNext={() => (celebrate ? setCelebrating(true) : backToCourse())}
        />
      </SafeAreaView>
    );
  }

  if (!lines) return <SafeAreaView style={styles.safe} />;

  const done = shown >= lines.length && lines.every((l) => !l.question || answered.has(l.id));
  const last = lines[shown - 1];
  const pending = last?.question && !answered.has(last.id) ? last : null;

  const answeredLine = (line: Line) => {
    setAnswered((prev) => new Set(prev).add(line.id));
    setAsking(null);
  };

  const next = async () => {
    if (pending) return setAsking(pending);
    if (done) {
      setFinished(await round.finish());
      return;
    }
    words.close();
    setShown((n) => Math.min(lines.length, n + 1));
    requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: !reduced }));
  };

  if (asking) {
    const q = asking.question!;
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Header title={title} progress={shown / lines.length} />
        {q.type === 'choice' ? (
          <ChoiceQuestion question={q} onDone={() => answeredLine(asking)} />
        ) : asking.item ? (
          <Exercise
            key={asking.id}
            item={asking.item}
            allForms={deck}
            allSentences={sentences}
            hints={false}
            onIntroDone={() => answeredLine(asking)}
            onAnswered={(wrong: string[], extra?: AnswerExtra) => {
              void round.answer(asking.item!, asking.ordinal, [asking.item!], wrong, extra);
              answeredLine(asking);
            }}
          />
        ) : null}
      </SafeAreaView>
    );
  }

  const speakers = [...new Set(lines.map((l) => l.speaker).filter((s) => s !== 'narrator'))];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header title={title} progress={shown / lines.length} />
      <ScrollView
        ref={scroller}
        contentContainerStyle={styles.chat}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: !reduced })}>
        {lines.slice(0, shown).map((line) => {
          const right = speakers.indexOf(line.speaker) === 1;
          const narrator = line.speaker === 'narrator';
          return (
            <Enter
              key={line.id}
              reduced={reduced}
              style={[styles.lineWrap, right && styles.lineRight, narrator && styles.lineNarrator]}>
              {narrator ? null : <Text style={[styles.speaker, right && styles.speakerRight]}>{line.speaker}</Text>}
              <Panel style={[styles.bubble, right && styles.bubbleRight]}>
                <View style={styles.bubbleRow}>
                  {line.sentence.audio_path ? <PlayButton path={line.sentence.audio_path} /> : null}
                  <SentenceLine sentence={line.sentence} onWord={words.open} />
                </View>
              </Panel>
            </Enter>
          );
        })}
        {shown === 1 && !words.peeked.length ? (
          <Text style={styles.hint}>Tap any word to see what it means</Text>
        ) : null}
      </ScrollView>
      <WordBubble state={words.showing} onClose={words.close} />
      <View style={[styles.footer, { paddingBottom: 20 + bottom }]}>
        <Button title={pending ? 'Answer' : done ? 'Finish' : 'Continue'} onPress={() => void next()} />
      </View>
    </SafeAreaView>
  );
}

function Header({ title, progress }: { title: string; progress: number }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => goBack('/home')} hitSlop={12} accessibilityLabel="Close">
        <Ionicons name="close" size={26} color={colors.muted} />
      </Pressable>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={gradients.progress}
          style={[styles.progressFill, { width: `${Math.max(progress * 100, 3)}%` }]}
        />
      </View>
      <FitText style={styles.headerTitle} lines={1}>
        {title}
      </FitText>
    </View>
  );
}

/** A question about the story itself. It drills no word, so nothing is
 *  scheduled — it is there to make sure the story was followed. */
function ChoiceQuestion({
  question,
  onDone,
}: {
  question: Extract<Question, { type: 'choice' }>;
  onDone: () => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const options = question.options_en.map((label, i) => ({ id: String(i), label }));
  return (
    <ExerciseFrame
      prompt={question.prompt_en}
      verdict={verdict}
      canCheck={chosen !== null}
      onCheck={() =>
        setVerdict({ correct: chosen === String(question.correct), answer: question.options_en[question.correct] })
      }
      onContinue={onDone}>
      <Choices
        options={options}
        correctId={String(question.correct)}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </ExerciseFrame>
  );
}

interface RawLine {
  id: string;
  ordinal: number;
  speaker: string;
  sentence_id: string;
  question: Question | null;
}

/** Story rows as lines, each word question made into its exercise. */
function buildLines(data: LearnerData, rows: RawLine[]): Line[] {
  const byId = new Map(data.sentences.map((s) => [s.id, s]));
  const out: Line[] = [];
  for (const row of rows) {
    const sentence = byId.get(row.sentence_id);
    if (!sentence) continue;
    const q = row.question;
    let item: QueueItem | null = null;
    if (q && q.type !== 'choice') {
      const target =
        q.type === 'gap'
          ? data.formById.get(q.form)
          : (data.formById.get(sentence.target_form_id) ??
            sentence.form_ids.map((id) => data.formById.get(id)).find((f) => f && drillable(f)));
      if (target) {
        const mode = q.type === 'meaning' ? 'sentence_meaning' : q.type === 'gap' ? 'sentence_gap' : 'sentence_build';
        item = sentenceItem(data, sentence, mode, target);
      }
    }
    out.push({
      id: row.id,
      ordinal: row.ordinal,
      speaker: row.speaker,
      sentence,
      question: q && (q.type === 'choice' || item) ? q : null,
      item,
    });
  }
  return out;
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
    height: 18,
    borderRadius: 99,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99 },
  headerTitle: { ...font.body[800], fontSize: 13, color: colors.muted, maxWidth: 120 },
  chat: { padding: 20, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  lineWrap: { alignItems: 'flex-start', gap: 4, maxWidth: '88%' },
  lineRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  lineNarrator: { alignSelf: 'center', alignItems: 'center' },
  speaker: { ...font.body[800], fontSize: 12, letterSpacing: 0.4, color: colors.muted, marginLeft: 4 },
  speakerRight: { marginLeft: 0, marginRight: 4 },
  bubble: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.lg },
  bubbleRight: { backgroundColor: pastel.lav, borderColor: 'transparent' },
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hint: { ...font.body[600], fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8 },
  footer: { padding: 20, paddingTop: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
});

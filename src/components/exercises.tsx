import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { KeyboardExtender, useKeyboardState } from 'react-native-keyboard-controller';
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ExerciseFrame, TightContext, type Verdict } from '@/components/exercise-frame';
import { CheerUpContext } from '@/components/lesson-cheer';
import { WrongAnswerActions } from '@/components/wrong-answer-actions';
import { Panel } from '@/components/ui';
import { type Anchor, WordPopover, measureAnchor } from '@/components/word-popover';
import { tap, warn } from '@/lib/haptics';
import { answerFeedback } from '@/lib/sfx';
import { playAudio, stopAudio, type AudioFailure } from '@/lib/audio';
import { clausesOf } from '@/lib/course-rules/shape';
import { isSlang } from '@/lib/course-rules/vocabulary';
import {
  builtAnswerMatches,
  clauseOf,
  gapOptions,
  isCanonical,
  isPhrase,
  meaningOptions,
  missedForms,
  nearMiss,
  type Option,
  pickImposter,
  pickOptions,
  sameAnswer,
  sentenceAnswerMatches,
  sentenceTiles,
  tokenHead,
  tokenIndexOf,
  tokenTail,
  tokenWord,
  gradeGap,
  gradeTyped,
  labelOf,
  meaningOf,
  senseOf,
  shownMeaning,
  type Note,
  startsSentence,
  turnCount,
  turnsOf,
  turnsOfText,
} from '@/lib/answers';
import type { AnswerExtra, QueueItem } from '@/lib/round';
import { DEFAULT_LADDER, type Ladder, RUNG_BUILD_AT } from '@/lib/sentences';
import { SETTLED_DAYS, buildTiles, wordPool } from '@/lib/session';
import { clay, colors, font, OUTLINE, pastel, PICKED, radius } from '@/lib/theme';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { type TipBlock, type TipSpan, tipSpans, tipSteps } from '@/lib/tip-layout';
import type { Form, Sentence, Tip } from '@/lib/types';
import { WORD_ART_CACHE, courseArt } from '@/lib/word-art';
import { articleOf } from '@/lib/article';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The exercises a round is played through — every screen the practice queue
// and a story can put in front of her. Moved out of app/practice.tsx so the
// story screen plays the same exercises the same way.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// A single exercise. Every one of them grades itself — none ask her to judge
// her own recall — and they all share the same rhythm: answer, comprobar, read
// the verdict, continuar.
// ---------------------------------------------------------------------------
/** Per-exercise context the frame reads: the item on screen, so the result
 *  panel can offer to report or explain a wrong answer. */
const ItemContext = createContext<QueueItem | null>(null);

/** The ladder the round was built with — what decides when a screen is still
 *  new enough to her to be worth marking "Harder". */
const LadderContext = createContext<Ladder>(DEFAULT_LADDER);

/** The whole lexicon, where an answer's other forms — the best wrong answers
 *  there are — are found. The deck alone rarely holds them. */
const LexiconContext = createContext<Map<string, Form> | undefined>(undefined);

type Answered = (wrongFormIds: string[], extra?: AnswerExtra) => void;
type Single = (correct: boolean, extra?: AnswerExtra) => void;

/** The label a harder exercise wears (learning-engine-spec §6.5). */
function badgeFor(item: QueueItem, ladder: Ladder = DEFAULT_LADDER): string | undefined {
  if (item.isIntro || item.isRetry || item.placementUnit) return undefined;
  // Building one clause is the step the ladder takes *instead* of the full
  // build, because the full build was too much. It never wears the badge.
  if (item.clause != null) return undefined;
  if (item.promoted || item.mode === 'typing') return 'Harder';
  // Only while the rung is new to her: the first screens of a sentence at it.
  const newAt = (until: number) => ((item.sentence?.shown?.correct_count ?? 0) <= until ? 'Harder' : undefined);
  if ((item.mode === 'sentence_build' || item.mode === 'sentence_listen') && item.sentence) return newAt(RUNG_BUILD_AT);
  if (item.mode === 'sentence_gap_tiles' && item.sentence) return newAt(ladder.gapTilesAt);
  if (item.mode === 'sentence_gap_typed' && item.sentence) return newAt(ladder.gapTypedAt);
  return undefined;
}

/** ExerciseFrame, with the item's badge, and — once she has got it wrong — a
 *  way to say her answer should count, and to ask why it doesn't. */
function Frame({
  answer,
  ...props
}: React.ComponentProps<typeof ExerciseFrame> & {
  /** What she gave, when the exercise is one whose answer can be reported. */
  answer?: string;
}) {
  const item = useContext(ItemContext);
  const ladder = useContext(LadderContext);
  const wrong = props.verdict && !props.verdict.correct;
  return (
    <ExerciseFrame
      {...props}
      badge={item ? badgeFor(item, ladder) : undefined}
      actions={wrong && item && answer ? <WrongAnswerActions item={item} answer={answer} /> : undefined}
    />
  );
}

const NOTE_TEXT: Record<Note, (expected: string) => string> = {
  accent: (w) => `Watch the accent: ${w}`,
  enye: (w) => `It's ñ: ${w}`,
  typo: (w) => `Typo — ${w}`,
  synonym: (w) => `That works too. This one was ${w}`,
};

/**
 * Whether the words of a sentence may be tapped for their meaning (§6.4).
 * Every word can be — function words included, since `de` and `el` are exactly
 * where a beginner stalls — lessons too, the way Duolingo lets any word be
 * peeked at; not in a placement test, where the whole point is to find out
 * what she already knows.
 *
 * What a tap costs is decided separately, in `round.ts`: an id reported as
 * hinted only counts against her if it is one of the forms this item grades,
 * so looking up a function word is free.
 */
function canTapWords(item: QueueItem, hints: boolean) {
  return hints && !!item.sentence && !item.introduces && !item.placementUnit;
}

export function Exercise({
  item,
  allForms,
  allSentences,
  onIntroDone,
  onAnswered,
  hints,
  lexicon,
  ladder = DEFAULT_LADDER,
}: {
  item: QueueItem;
  allForms: Form[];
  allSentences: Sentence[];
  onIntroDone: () => void;
  onAnswered: Answered;
  /** Whether words of a sentence may be tapped for their meaning (§6.4):
   *  review screens, practice and recaps — not a lesson's new material. */
  hints?: boolean;
  /** The whole lexicon, not just the deck. A tapped word can be a function
   *  word or a form she is not drilling, and neither is in `allForms`. */
  lexicon?: Map<string, Form>;
  /** The ladder the round was built with (session.ts). Only the badge reads
   *  it: on an easier or harder ladder a screen becomes new to her at a
   *  different pass count. */
  ladder?: Ladder;
}) {
  return (
    <ItemContext.Provider value={item}>
      <LadderContext.Provider value={ladder}>
        <LexiconContext.Provider value={lexicon}>
        <ExerciseBody
          item={item}
          allForms={allForms}
          allSentences={allSentences}
          onIntroDone={onIntroDone}
          onAnswered={onAnswered}
          hints={!!hints}
          lexicon={lexicon}
        />
        </LexiconContext.Provider>
      </LadderContext.Provider>
    </ItemContext.Provider>
  );
}

function ExerciseBody({
  item,
  allForms,
  allSentences,
  onIntroDone,
  onAnswered,
  hints,
  lexicon,
}: {
  item: QueueItem;
  allForms: Form[];
  allSentences: Sentence[];
  onIntroDone: () => void;
  onAnswered: Answered;
  hints: boolean;
  lexicon?: Map<string, Form>;
}) {
  const { form } = item;
  const canTap = canTapWords(item, hints);

  if (item.isIntro) return <Intro form={form} onDone={onIntroDone} />;
  if (item.mode === 'tip' && item.tip) return <TipCard tip={item.tip} onDone={() => onAnswered([])} />;

  const single: Single = (correct, extra) => onAnswered(correct ? [] : [form.id], extra);

  switch (item.mode) {
    case 'matching':
      return <Matching item={item} onAnswered={onAnswered} />;
    case 'sentence_meaning_tiles':
      return (
        <SentenceBuild
          item={item}
          allForms={allForms}
          onAnswered={onAnswered}
          side="en"
          canTap={canTap}
          lexicon={lexicon}
        />
      );
    case 'sentence_intro':
    case 'sentence_meaning':
      return (
        <SentenceIntro
          item={item}
          allSentences={allSentences}
          allForms={allForms}
          onAnswered={onAnswered}
          canTap={canTap}
          lexicon={lexicon}
        />
      );
    case 'sentence_gap':
    case 'sentence_gap_tiles':
    case 'sentence_gap_typed':
      return (
        <SentenceGap
          item={item}
          allForms={allForms}
          onAnswered={onAnswered}
          canTap={canTap}
          lexicon={lexicon}
          fill={item.mode === 'sentence_gap_typed' ? 'typed' : item.mode === 'sentence_gap_tiles' ? 'tiles' : 'choices'}
        />
      );
    case 'sentence_build':
      return <SentenceBuild item={item} allForms={allForms} onAnswered={onAnswered} lexicon={lexicon} />;
    case 'sentence_listen':
      return <SentenceBuild item={item} allForms={allForms} onAnswered={onAnswered} lexicon={lexicon} byEar />;
    case 'listen':
      return <Listen item={item} allForms={allForms} onAnswer={single} />;
    case 'true_false':
      return <TrueFalse item={item} allForms={allForms} onAnswer={single} />;
    case 'word_build':
      return <WordBuild item={item} allForms={allForms} onAnswer={single} />;
    case 'listen_build':
      return <ListenBuild item={item} allForms={allForms} onAnswer={single} />;
    case 'typing':
      return <Typing item={item} allForms={allForms} onAnswer={single} />;
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

// A tile is dragged, not scrolled: without this the browser claims the touch
// for the page and the tile never moves. The rest of the screen still scrolls.
const dragTouch = Platform.OS === 'web' ? ({ touchAction: 'none' } as object) : null;

function Intro({ form, onDone }: { form: Form; onDone: () => void }) {
  const phrase = isPhrase(form.form);
  const art = courseArt(form.lemma_id);
  return (
    <Frame
      prompt={`✨ New ${isSlang(form) ? 'slang ' : ''}${phrase ? 'phrase' : 'word'}`}
      verdict={null}
      canCheck
      checkLabel="Got it"
      onCheck={onDone}
      onContinue={onDone}>
      <Panel style={styles.bigCard}>
        {/* A thing she can picture gets its picture: the meaning lands before
            she reads the English. Abstract words have none and the card is
            as it always was. */}
        {art ? (
          <Image
            source={art}
            style={styles.introArt}
            contentFit="contain"
            cachePolicy={WORD_ART_CACHE}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        <Text style={phrase ? styles.esPhraseHero : styles.esHero}>{form.form}</Text>
        <View style={styles.divider} />
        {/* Where the word is taught the hint always shows: this is the one
            screen that can say everything the gloss does. */}
        <Text style={phrase ? styles.enPhrase : styles.enBig}>{senseOf(form, meaningOf(form)).main}</Text>
        {senseOf(form, meaningOf(form)).hint ? (
          <Text style={[styles.meaningHint, { textAlign: 'center' }]}>{senseOf(form, meaningOf(form)).hint}</Text>
        ) : null}
        {/* The aside lives here, where the word is being taught — it explains
            what the gloss can only name ("mate" → the drink). */}
        {form.gloss_note_en ? <Text style={styles.glossNote}>{form.gloss_note_en}</Text> : null}
        {form.audio_path ? <PlayButton path={form.audio_path} big /> : null}
      </Panel>
    </Frame>
  );
}

/**
 * A new word that has a picture is met on its own first: the thing, its name
 * — with its article, so the gender comes with it — and what it means, the
 * word saying itself on arrival. Only then the sentence, without the picture:
 * on the sentence's card it read as the picture of the whole sentence ("Un
 * helado de chocolate" under a chocolate bar).
 */
function WordPicture({ form, art, onDone }: { form: Form; art: ImageSourcePropType; onDone: () => void }) {
  const phrase = isPhrase(form.form);
  const article = phrase ? null : articleOf(form);
  const sense = senseOf(form, meaningOf(form));
  return (
    <Frame
      prompt={`New ${isSlang(form) ? 'slang ' : ''}${phrase ? 'phrase' : 'word'}`}
      verdict={null}
      canCheck
      checkLabel="Continue"
      onCheck={onDone}
      onContinue={onDone}>
      <View style={styles.meet}>
        <Image
          source={art}
          style={styles.meetArt}
          contentFit="contain"
          cachePolicy={WORD_ART_CACHE}
          accessibilityIgnoresInvertColors
        />
        <Text style={phrase ? styles.esPhraseHero : styles.esHero}>
          {/* The article is part of what she learns, not the word: quieter. */}
          {article ? <Text style={styles.meetArticle}>{article} </Text> : null}
          {form.form}
        </Text>
        <Text style={styles.meetEn}>{sense.main}</Text>
        {sense.hint ? <Text style={[styles.meaningHint, { textAlign: 'center' }]}>{sense.hint}</Text> : null}
        {form.audio_path ? <PlayButton path={form.audio_path} big /> : null}
      </View>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// TipCard — a grammar note between exercises. It asks nothing and grades
// nothing; it is there so the rule arrives just before the questions that lean
// on it. Tips are written as prose with the odd table, and no two are shaped
// alike, so the layout is read off each one (tip-layout.ts): the first
// sentence large, Spanish with its English as a pair, a Spanish sentence given
// as an example on a butter sticker, a paradigm as a real table.
// ---------------------------------------------------------------------------
function TipCard({ tip, onDone }: { tip: Tip; onDone: () => void }) {
  const steps = useMemo(() => tipSteps(tip.body_md), [tip.body_md]);
  const [at, setAt] = useState(0);
  const reduced = useReducedMotion();
  const last = at >= steps.length - 1;
  // Each step arrives rather than swaps: without it the text changes under an
  // unmoved button and the tap seems to have done nothing.
  const shown = useSharedValue(1);
  const arrive = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateY: reduced ? 0 : (1 - shown.get()) * 8 }],
  }));
  const next = () => {
    if (last) return onDone();
    shown.set(0);
    shown.set(withTiming(1, { duration: 220, easing: Easing.bezier(0.23, 1, 0.32, 1) }));
    setAt(at + 1);
  };
  return (
    <Frame
      prompt={`💡 ${tip.title_en}`}
      verdict={null}
      canCheck
      checkLabel={last ? 'Got it' : 'Next'}
      onCheck={next}
      onContinue={next}>
      {steps.length > 1 ? (
        <View style={styles.tipDots} accessibilityLabel={`Part ${at + 1} of ${steps.length}`}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.tipDot, i <= at && styles.tipDotOn]} />
          ))}
        </View>
      ) : null}
      <Animated.View style={[styles.tip, arrive]}>
        {(steps[at] ?? []).map((block, i) => (
          <TipPart key={`${at}-${i}`} block={block} />
        ))}
      </Animated.View>
    </Frame>
  );
}

function TipPart({ block }: { block: TipBlock }) {
  switch (block.kind) {
    case 'lead':
      return <Text style={styles.tipLead}>{tipInline(block.spans)}</Text>;
    case 'text':
      return <Text style={styles.tipText}>{tipInline(block.spans)}</Text>;
    case 'examples':
      return (
        <View style={[styles.tipSticker, styles.tipExamples]}>
          {block.lines.map((line, i) => (
            <Text key={i} style={[styles.tipRowPad, styles.tipEs, i > 0 && styles.tipRowInk]}>
              {line}
            </Text>
          ))}
        </View>
      );
    case 'pairs':
      return (
        <View style={styles.tipSticker}>
          {block.rows.map((row, i) => (
            <View key={i} style={[styles.tipRowPad, i > 0 && styles.tipRowInk]}>
              <Text style={styles.tipEs}>{row.es}</Text>
              {row.en ? <Text style={styles.tipEn}>{row.en}</Text> : null}
            </View>
          ))}
        </View>
      );
    case 'table':
      return <TipTable head={block.head} rows={block.rows} />;
  }
}

const bare = (cell: string) => cell.replace(/\*/g, '');

/**
 * A paradigm. The letters get as large as the columns allow; a column of
 * labels (yo, vos…) steps back; and where only part of a word is marked — the
 * ending that changed — that part is highlighted rather than recoloured, so
 * the eye lands on the two letters that matter.
 */
function TipTable({ head, rows }: { head: string[] | null; rows: string[][] }) {
  const cols = Math.max(...rows.map((r) => r.length), head?.length ?? 0);
  const longest = Math.max(...rows.flat().map((c) => bare(c).length));
  const size = longest > 16 ? 16 : cols <= 2 ? 22 : cols === 3 ? 19 : cols === 4 ? 16 : 13;
  const text = { fontSize: size, lineHeight: Math.round(size * 1.3) };
  const labels = rows.every((r) => !r[0]?.includes('**') && bare(r[0] ?? '').length <= 16);
  const pad = cols > 4 ? 10 : 16;
  return (
    <View style={styles.tipSticker}>
      {head ? (
        <View style={[styles.tipRow, styles.tipHeadRow, { paddingHorizontal: pad }]}>
          {Array.from({ length: cols }, (_, c) => (
            <Text key={c} style={[styles.tipCell, styles.tipHead, cols > 4 && styles.tipHeadTight]}>
              {bare(head[c] ?? '')}
            </Text>
          ))}
        </View>
      ) : null}
      {rows.map((cells, r) => (
        <View key={r} style={[styles.tipRow, (r > 0 || head) && styles.tipRowRule, { paddingHorizontal: pad }]}>
          {Array.from({ length: cols }, (_, c) => (
            <Text key={c} style={[styles.tipCell, text, c === 0 && labels && styles.tipCellLabel]}>
              {tipCell(cells[c] ?? '')}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/** A cell's marks: a wholly marked form is the irregular one; a marked part is the ending. */
function tipCell(cell: string): React.ReactNode[] {
  const spans = tipSpans(cell);
  const whole = spans.length === 1;
  return spans.map((span, i) =>
    span.kind === 'strong' ? (
      <Text key={i} style={whole ? styles.tipStrong : styles.tipMark}>
        {span.text}
      </Text>
    ) : (
      span.text
    ),
  );
}

/** `**bold**` and `*italic*` as nested Text; everything else as written. */
function tipInline(spans: TipSpan[]): React.ReactNode[] {
  return spans.map((span, i) => {
    if (span.kind === 'strong') return <Text key={i} style={styles.tipStrong}>{span.text}</Text>;
    if (span.kind === 'em') return <Text key={i} style={styles.tipEm}>{span.text}</Text>;
    return span.text;
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
  // How fast the clip that is sounding was asked for, so a slow button can say it is the one playing.
  const [rate, setRate] = useState(1);
  const live = useRef(false);
  const set = (value: boolean) => {
    live.current = value;
    setPlaying(value);
  };

  const run = useCallback(
    (at: number) => {
      if (!path) return;
      setProblem(null);
      setRate(at);
      // playAudio stops whatever was sounding first, which reports back through
      // the old onEnd — so this order matters: claim the state last.
      playAudio(
        path,
        (reason) => {
          set(false);
          // 'blocked' only means the browser wants a tap first, which the button
          // already asks for — not something to complain about.
          if (reason && reason !== 'blocked') setProblem(reason);
        },
        at,
      );
      set(true);
    },
    [path],
  );
  const play = useCallback(() => run(1), [run]);
  const slow = useCallback(() => run(SLOW_RATE), [run]);

  // Leaving the exercise takes its sound with it.
  useEffect(() => () => void (live.current && stopAudio()), []);

  return { playing, problem, play, slow, rate };
}

/** The slow way to hear a clip: three quarters of the speed, pitch kept. */
const SLOW_RATE = 0.75;

const AUDIO_PROBLEM: Record<AudioFailure, string> = {
  blocked: 'Tap to listen',
  offline: 'No connection',
  missing: 'Audio not found',
  failed: "Couldn't play it",
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

export function PlayButton({
  path,
  big,
  small,
  autoPlay = true,
}: {
  path: string;
  big?: boolean;
  /** Inline at the end of a sentence, where a full-size button would outweigh the words. */
  small?: boolean;
  autoPlay?: boolean;
}) {
  const { playing, problem, play } = useClip(path);
  const reduced = useReducedMotion();

  // It says itself on arrival, the way a teacher would say the word before
  // asking about it — the button is there to hear it again. Every place this
  // sits, the Spanish is already on screen, so the sound gives nothing away.
  // Lists (the guidebook, her words) turn it off: a page of rows would all
  // start talking at once. There it plays only when tapped.
  useEffect(() => {
    if (autoPlay) play();
  }, [autoPlay, play]);

  return (
    <View style={styles.playWrap}>
      <Pressable
        onPress={play}
        accessibilityLabel={playing ? 'Playing' : problem ? AUDIO_PROBLEM[problem] : 'Listen'}
        style={({ pressed }) => [
          styles.playButton,
          big && styles.playButtonBig,
          small && styles.playButtonSmall,
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
          size={big ? 30 : small ? 16 : 20}
          color={colors.onPrimary}
        />
      </Pressable>
      {problem ? <Text style={styles.audioProblem}>{AUDIO_PROBLEM[problem]}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SpeechBubble — a capybara, and a bubble coming out of it.
//
// Each bubble that appears gets the next capybara in the set, so a lesson isn't
// asked by the same face all the way through. They all look left in the art, and
// the bubble is on the right, so they are mirrored to look at what they say.
//
// The tail is two stacked triangles because the bubble is a bordered panel:
// the back one is the border colour, the front one the fill, a couple of
// points smaller and pushed right so it leaves the back one showing as a rim
// and covers the panel's own border where the two meet. That is what makes the
// outline read as one continuous shape rather than a form with a sticker on it.
// ---------------------------------------------------------------------------
const SPEAKERS = [
  require('@/assets/images/capybara/capybara-saludando-figure.webp'),
  require('@/assets/images/capybara/capybara-gaucho-figure.webp'),
  require('@/assets/images/capybara/capybara-mate-figure.webp'),
  require('@/assets/images/capybara/capybara-gaucho-cafe-figure.webp'),
  require('@/assets/images/capybara/capybara-empanadas-figure.webp'),
  require('@/assets/images/capybara/capybara-dulce-de-leche-figure.webp'),
  require('@/assets/images/capybara/capybara-facturas-figure.webp'),
  require('@/assets/images/capybara/capybara-alfajor-maicena-figure.webp'),
];
let nextSpeaker = 0;

/** Every capybara is fitted into the same box, so the bubble beside it never
 *  shifts. No sun behind him: he is the figure, a bigger one in its place. */
const SPEAKER_WIDTH = 104;
const SPEAKER_HEIGHT = 124;
const TAIL = 11;
/** The speaking bubble's tail is drawn, so its two slanted sides can carry the bubble's outline. */
const TAIL_W = TAIL + 4;
const TAIL_H = TAIL * 2 + 8;

/**
 * 1 while the capybara is in, 0 once the keyboard has left no room for him
 * (see `TightContext`). He fades and his space closes together, in step with
 * the keyboard, so the field slides up rather than jumping.
 */
function useMakeRoom() {
  const tight = useContext(TightContext);
  const shown = useSharedValue(tight ? 0 : 1);
  useEffect(() => {
    shown.set(withTiming(tight ? 0 : 1, { duration: 200, easing: Easing.out(Easing.cubic) }));
  }, [tight, shown]);
  return shown;
}

export function SpeechBubble({
  children,
  replies,
  bare,
}: {
  children: React.ReactNode;
  /** The other speaker's lines, when what is said is a dialogue: each in a
   *  bubble of its own on the far side, the way a chat lays two people out. */
  replies?: React.ReactNode[];
  /** No capybara: two chat bubbles, each as wide as what is said in it, the
   *  first one's tail pointing off the left edge. */
  bare?: boolean;
}) {
  const [speaker] = useState(() => SPEAKERS[nextSpeaker++ % SPEAKERS.length]);
  // Out of the way, he gives the bubble his width, so a long line wraps less.
  const shown = useMakeRoom();
  const speakerRoom = useAnimatedStyle(() => ({
    opacity: shown.get(),
    width: SPEAKER_WIDTH * shown.get(),
    marginRight: -12 * (1 - shown.get()),
  }));
  const tailRoom = useAnimatedStyle(() => ({ opacity: shown.get() }));
  const said = (
    <View style={styles.speechRow}>
      {bare ? null : (
        <Animated.View style={speakerRoom} pointerEvents="none">
          <Image
            source={speaker}
            style={styles.speaker}
            contentFit="contain"
            contentPosition={{ left: 0 }}
            accessible={false}
          />
        </Animated.View>
      )}
      <View style={[styles.bubbleWrap, bare && styles.bareWrap]}>
        <Panel style={styles.bubble}>{children}</Panel>
        {/* After the panel, so it paints over the outline where the two join.
            With no capybara to make room for, it never has to fade. */}
        <Animated.View style={[styles.speechTail, !bare && tailRoom]} pointerEvents="none">
          <Svg width={TAIL_W} height={TAIL_H}>
            <SvgPath d={`M ${TAIL_W} 4 L 3 ${TAIL_H / 2} L ${TAIL_W} ${TAIL_H - 4} Z`} fill={pastel.butter} />
            <SvgPath
              d={`M ${TAIL_W} 4 L 3 ${TAIL_H / 2} L ${TAIL_W} ${TAIL_H - 4}`}
              fill="none"
              stroke={colors.ink}
              strokeWidth={OUTLINE}
              strokeLinejoin="round"
              strokeLinecap="butt"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
  if (!replies?.length) return said;
  return (
    <View style={styles.dialogue}>
      {said}
      {replies.map((reply, i) => (
        <View key={i} style={styles.replyWrap}>
          <Panel style={[styles.bubble, styles.replyBubble]}>{reply}</Panel>
          {/* Drawn like the first speaker's tail, mirrored: its two slanted sides carry the outline. */}
          <View style={[styles.speechTail, styles.replySpeechTail]} pointerEvents="none">
            <Svg width={TAIL_W} height={TAIL_H}>
              <SvgPath d={`M 0 4 L ${TAIL_W - 3} ${TAIL_H / 2} L 0 ${TAIL_H - 4} Z`} fill={pastel.lav} />
              <SvgPath
                d={`M 0 4 L ${TAIL_W - 3} ${TAIL_H / 2} L 0 ${TAIL_H - 4}`}
                fill="none"
                stroke={colors.ink}
                strokeWidth={OUTLINE}
                strokeLinejoin="round"
                strokeLinecap="butt"
              />
            </Svg>
          </View>
        </View>
      ))}
    </View>
  );
}

/** A dialogue's English, one bubble a speaker; plain when it is one voice. */
function EnglishBubble({ sentence }: { sentence: Sentence }) {
  const turns = turnsOfText(sentence.en, turnCount(sentence.tokens));
  const line = (text: string) => (
    <View style={styles.bubbleRow}>
      <View style={styles.bubbleText}>
        <Text style={styles.bubblePhraseEn}>{text}</Text>
      </View>
    </View>
  );
  const replies = turns?.slice(1).map((text, i) => (
    <Text key={i} style={styles.bubblePhraseEn}>
      {text}
    </Text>
  ));
  return <SpeechBubble replies={replies}>{line(turns ? turns[0] : sentence.en)}</SpeechBubble>;
}

/** A sentence read in a bubble: a dialogue gets one a speaker. */
function SpanishBubble({ sentence, ...line }: React.ComponentProps<typeof SentenceLine>) {
  const turns = turnCount(sentence.tokens);
  const first = (
    <View style={styles.bubbleRow}>
      {sentence.audio_path ? <PlayButton path={sentence.audio_path} /> : null}
      <SentenceLine sentence={sentence} {...line} turn={turns > 1 ? 0 : undefined} />
    </View>
  );
  if (turns < 2) return <SpeechBubble>{first}</SpeechBubble>;
  return (
    <SpeechBubble
      replies={Array.from({ length: turns - 1 }, (_, i) => (
        <SentenceLine key={i} sentence={sentence} {...line} turn={i + 1} />
      ))}>
      {first}
    </SpeechBubble>
  );
}

/**
 * A dialogue being completed, said once: each speaker's line in their own
 * bubble, the Spanish with its gap and the English a size down beneath it. The
 * English is what makes the gap one answer, so it sits by the line it belongs
 * to rather than in bubbles of its own over a second copy of the Spanish.
 */
function GapBubbles({
  sentence,
  english,
  play,
  ...line
}: React.ComponentProps<typeof SentenceLine> & {
  /** The English as shown, its borrowed answer blanked until the verdict. */
  english: string;
  /** The recording, offered once she has answered. */
  play?: boolean;
}) {
  const turns = turnCount(sentence.tokens);
  const en = turnsOfText(english, turns);
  // A translation that won't split a line a speaker goes whole under the last.
  const said = (i: number) => {
    const text = en ? en[i] : i === turns - 1 ? english : null;
    return (
      <SentenceLine
        {...line}
        sentence={sentence}
        turn={i}
        hug
        under={text ? <Text style={styles.bubbleEnUnder}>{text}</Text> : undefined}
      />
    );
  };
  return (
    <SpeechBubble bare replies={Array.from({ length: turns - 1 }, (_, i) => <View key={i}>{said(i + 1)}</View>)}>
      <View style={styles.bubbleRow}>
        {play && sentence.audio_path ? <PlayButton path={sentence.audio_path} autoPlay={false} /> : null}
        {said(0)}
      </View>
    </SpeechBubble>
  );
}

function useSpeaker() {
  const [speaker] = useState(() => SPEAKERS[nextSpeaker++ % SPEAKERS.length]);
  return speaker;
}

/**
 * A sentence as the star of the screen: a butter card. `center` is a sentence
 * being read: its play button (`beside`) over it, on its centre line.
 * Otherwise (a sentence being completed) the card is plain. Either way the
 * capybara is beside the prompt (TitlePancho), standing on the card's edge.
 */
function PhraseCard({
  center,
  beside,
  children,
}: {
  center?: boolean;
  beside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.phraseCard, center ? styles.phraseCardCentered : styles.phraseCardPlain]}>
      {center && beside ? <View style={styles.phraseCardHead}>{beside}</View> : null}
      {children}
    </View>
  );
}

/** The capybara at the end of the prompt's line on a sentence being completed:
 *  he takes the room the title leaves instead of a row of his own over the
 *  card. He stands over the card's top edge, above its sentence, so the row
 *  barely grows.
 *  He stays when the keyboard is up: the bubble's capybara fades to give
 *  the line his width, but this one is in the title's row and takes no room
 *  the field or the card could use. */
const TITLE_ART = 116;

function TitlePancho() {
  const speaker = useSpeaker();
  return (
    <View pointerEvents="none" style={styles.titleArt}>
      <Image source={speaker} style={styles.titleArtImage} contentFit="contain" accessible={false} />
    </View>
  );
}

/** The bars of the wave: fixed, so it never changes between visits. */
const WAVE = [10, 22, 30, 16, 34, 26, 12, 28, 36, 20, 14, 24, 32, 18, 26, 34, 14, 22, 30, 12, 26, 18, 10];

/**
 * Listen's player: play, a long wave, and a tortoise for the slow take. It
 * says the clip once on arrival, like the pad it replaces. No clock — she is
 * not timing anything.
 */
function ListenPlayer({ path }: { path: string }) {
  const { playing, problem, play, slow, rate } = useClip(path);
  const reduced = useReducedMotion();

  useEffect(() => play(), [play]);

  const slowOn = playing && rate !== 1;
  return (
    <View style={styles.player}>
      <Pressable
        onPress={play}
        accessibilityLabel={problem ? AUDIO_PROBLEM[problem] : 'Listen'}
        style={({ pressed }) => [
          styles.playerPlay,
          playing && !slowOn && styles.playButtonOn,
          problem && styles.playButtonDead,
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webPress,
        ]}>
        {playing && !slowOn && !reduced ? <Pulse inset={5} /> : null}
        <Ionicons name={problem ? 'volume-mute' : playing && !slowOn ? 'volume-high' : 'play'} size={24} color={colors.onPrimary} />
      </Pressable>
      <View style={styles.playerWave} accessible={false}>
        {WAVE.map((h, i) => (
          <View key={i} style={[styles.playerBar, { height: h, opacity: playing ? 1 : 0.85 }]} />
        ))}
      </View>
      <Pressable
        onPress={slow}
        accessibilityLabel="Play slowly"
        style={({ pressed }) => [
          styles.playerSlow,
          slowOn && { backgroundColor: colors.primarySoft },
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webPress,
        ]}>
        <MaterialCommunityIcons name="tortoise" size={26} color={colors.primary} />
      </Pressable>
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
            <BubbleText style={phrase ? styles.bubblePhrase : styles.bubbleWord}>{form.form}</BubbleText>
          ) : (
            <>
              <BubbleText style={phrase ? styles.bubblePhraseEn : styles.bubbleEn}>
                {shownMeaning(form).text}
              </BubbleText>
              {shownMeaning(form).hint ? <Text style={styles.meaningHint}>{shownMeaning(form).hint}</Text> : null}
            </>
          )}
        </View>
      </View>
    </SpeechBubble>
  );
}

/**
 * What the bubble says. A phrase wraps like speech; a single word never does —
 * the bubble is narrow, beside the capybara and the play button, and a word
 * that runs out of room breaks wherever the edge happens to fall
 * ("termotanqu / e"). One word is one line, shrunk until it fits.
 */
function BubbleText({ style, children }: { style: TextStyle; children: string }) {
  if (isPhrase(children)) return <Text style={style}>{children}</Text>;
  return (
    <FitText lines={1} minScale={0.5} style={style}>
      {children}
    </FitText>
  );
}

/** A dialogue offered as an answer: a line a speaker, the dashes off. */
const turnLines = (label: string) =>
  label.startsWith('—') ? label.split('—').map((p) => p.trim()).filter(Boolean).join('\n') : label;

export function Choices({
  options,
  correctId,
  chosen,
  revealed,
  onPick,
  side,
}: {
  options: Option[];
  correctId: string;
  chosen: string | null;
  revealed: boolean;
  onPick: (id: string) => void;
  /** Two short answers (true / false) as big buttons next to each other instead of a list. */
  side?: boolean;
}) {
  return (
    <View style={side ? styles.choicesSide : styles.choicesList}>
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
              side && styles.choiceSide,
              picked && styles.choicePicked,
              right && styles.choiceRight,
              wrong && styles.choiceWrong,
              { transform: [{ scale: pressed && !revealed ? 0.985 : 1 }] },
              webPress,
            ]}>
            <Text
              style={[
                styles.choiceText,
                side && styles.choiceTextSide,
                picked && font.body[800],
                right && { color: colors.success, ...font.body[800] },
                wrong && { color: colors.danger },
              ]}>
              {turnLines(opt.label)}
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
  onAnswer: Single;
}) {
  const { form } = item;
  const askSpanish = item.direction === 'es_to_en';
  const answerField = askSpanish ? 'gloss_en' : 'form';
  const lexicon = useContext(LexiconContext);
  // Randomised content is generated exactly once per exercise: a `useMemo`
  // may legitimately re-run, and a reshuffle mid-answer would grade her
  // against options she never saw.
  const [options] = useState(() =>
    pickOptions(form, allForms, answerField, lexicon?.values()).map((c) => ({ id: c.id, label: labelOf(c, answerField) })),
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const phrase = isPhrase(form.form);
  const prompt = askSpanish
    ? phrase
      ? 'What does this phrase mean?'
      : 'What does it mean?'
    : phrase
      ? 'How do you say this phrase in Spanish?'
      : 'How do you say it in Spanish?';

  return (
    <Frame
      prompt={item.isRetry ? `🔁 ${prompt}` : prompt}
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({
          correct: chosen === form.id,
          answer: labelOf(form, answerField),
          about: form.gloss_note_en ?? undefined,
          // Asked from the English, the Spanish is the answer: hear it now.
          audio: askSpanish ? undefined : (form.audio_path ?? undefined),
        })
      }
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <PromptBlock form={form} side={askSpanish ? 'es' : 'en'} />
      <Choices
        options={options}
        correctId={form.id}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </Frame>
  );
}

function Listen({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: Single;
}) {
  const { form } = item;
  const lexicon = useContext(LexiconContext);
  const [options] = useState(() =>
    pickOptions(form, allForms, 'gloss_en', lexicon?.values()).map((c) => ({ id: c.id, label: shownMeaning(c).text })),
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  return (
    <Frame
      prompt="What does it mean?"
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({
          correct: chosen === form.id,
          answer: `${form.form} — ${meaningOf(form)}`,
          // Right by ear, she still hasn't seen it written: show her.
          note: chosen === form.id ? `${form.form} — ${meaningOf(form)}` : undefined,
          about: form.gloss_note_en ?? undefined,
        })
      }
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <ListenPlayer path={form.audio_path!} />
      <Choices
        options={options}
        correctId={form.id}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </Frame>
  );
}

/** The tap-to-listen panel used by the two audio-first exercises. */
export function AudioPad({
  path,
  compact,
}: {
  path: string;
  /** A build has an answer line and a bank of tiles to fit under it, so there
   *  the pad lies down: the button and its hint side by side, half the height. */
  compact?: boolean;
}) {
  const { playing, problem, play, slow, rate } = useClip(path);
  const reduced = useReducedMotion();

  // She should hear it before reading anything, so it plays itself on arrival.
  useEffect(() => play(), [play]);

  const slowOn = playing && rate !== 1;
  return (
    <View style={styles.audioPadWrap}>
      <Pressable
        onPress={play}
        accessibilityLabel={problem ? AUDIO_PROBLEM[problem] : 'Listen'}
        style={({ pressed }) => [
          styles.audioPad,
          compact && styles.audioPadCompact,
          { transform: [{ scale: pressed ? 0.99 : 1 }] },
          webPress,
        ]}>
        <View
          style={[
            styles.audioPadCircle,
            compact && styles.audioPadCircleCompact,
            playing && !slowOn && styles.playButtonOn,
            problem && styles.playButtonDead,
          ]}>
          {playing && !slowOn && !reduced ? <Pulse inset={compact ? 6 : 7} /> : null}
          <Ionicons
            name={problem ? 'volume-mute' : playing && !slowOn ? 'volume-high' : 'play'}
            size={compact ? 24 : 30}
            color={colors.onPrimary}
          />
        </View>
        <Text style={[styles.audioPadHint, compact && styles.audioPadHintCompact, problem && styles.audioProblem]}>
          {problem ? AUDIO_PROBLEM[problem] : playing ? 'Playing…' : 'Tap to listen'}
        </Text>
      </Pressable>
      {/* The slow take, like Listen's player: a sentence by ear is where a
          learner most needs to hear it again at three quarters. */}
      <Pressable
        onPress={slow}
        accessibilityLabel="Play slowly"
        hitSlop={6}
        style={({ pressed }) => [
          styles.playerSlow,
          styles.audioPadSlow,
          compact && styles.audioPadSlowCompact,
          slowOn && { backgroundColor: colors.primarySoft },
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webPress,
        ]}>
        <MaterialCommunityIcons name="tortoise" size={24} color={colors.primary} />
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ¿Sí o no? — a fast recognition check: is this the right meaning?
//
// The English is set as a guess — smaller, in a dashed box with a rosa "?" —
// so it reads as a claim to judge rather than the word's translation. A word
// and its meaning stacked at the same weight is a flashcard, and that is how
// it used to read. One tap answers: with two choices, a Check button is only a
// second tap.
// ---------------------------------------------------------------------------
/** The real meaning, dropping in over the struck guess. */
const MEET_SENTENCE = FadeInRight.duration(240).easing(Easing.bezier(0.23, 1, 0.32, 1));
const REAL_MEANING = FadeInDown.duration(240).easing(Easing.bezier(0.23, 1, 0.32, 1));

function TrueFalse({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: Single;
}) {
  const { form } = item;
  const lexicon = useContext(LexiconContext);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  // Half the time we show the real meaning, half an imposter's.
  const [{ shown, isTrue }] = useState(() => {
    const imposter = pickImposter(form, allForms, lexicon?.values());
    if (!imposter || Math.random() < 0.5) return { shown: shownMeaning(form).text, isTrue: true };
    return { shown: shownMeaning(imposter).text, isTrue: false };
  });

  const choose = (value: boolean) => {
    if (verdict) return;
    setPicked(value);
    setVerdict({
      correct: value === isTrue,
      // The real meaning goes up on the card itself, over the struck guess.
      about: form.gloss_note_en ?? undefined,
    });
  };

  return (
    <Frame
      prompt={item.isRetry ? '🔁 Is this right?' : 'Is this right?'}
      verdict={verdict}
      instant
      onContinue={() => onAnswer(!!verdict?.correct)}>
      <Panel style={styles.bigCard}>
        <Text style={styles.esBig}>{form.form}</Text>
        {form.audio_path ? <PlayButton path={form.audio_path} /> : null}
        <Text style={styles.guessMeans}>means</Text>
        {/* A guess that was wrong is struck out, and what the word really
            means arrives above it — the answer where the eye already is. */}
        {verdict && !isTrue ? (
          <Animated.View entering={REAL_MEANING} style={[styles.guess, styles.guessTrue]}>
            <Text style={styles.guessText}>{shownMeaning(form).text}</Text>
          </Animated.View>
        ) : null}
        {/* Once answered the guess shows what it was: confirmed, or struck out. */}
        <View
          style={[
            styles.guess,
            verdict && (isTrue ? styles.guessTrue : styles.guessFalse),
          ]}>
          <Text
            style={[
              styles.guessText,
              verdict && !isTrue && styles.guessTextFalse,
            ]}>
            {shown}
          </Text>
          {verdict ? null : <Text style={styles.guessMark}>?</Text>}
        </View>
      </Panel>

      <View style={styles.ratingRow}>
        {[
          // Her answer, not the verdict: an ink outline either way — salvia
          // and coral are kept for the result sheet that grades it.
          { label: 'Yes', value: true, icon: 'checkmark' as const },
          { label: 'No', value: false, icon: 'close' as const },
        ].map((opt) => (
          <Pressable
            key={turnLines(opt.label)}
            disabled={verdict !== null}
            onPress={() => choose(opt.value)}
            accessibilityRole="button"
            accessibilityLabel={turnLines(opt.label)}
            accessibilityState={{ selected: picked === opt.value, disabled: verdict !== null }}
            style={({ pressed }) => [
              styles.bigChoice,
              { borderColor: 'transparent' },
              picked === opt.value && PICKED,
              { transform: [{ scale: pressed && verdict === null ? 0.97 : 1 }] },
              webPress,
            ]}>
            <Ionicons
              name={opt.icon}
              size={22}
              color={picked === opt.value ? colors.ink : colors.faint}
            />
            <Text
              style={[
                styles.bigChoiceText,
                { color: picked === opt.value ? colors.ink : colors.muted },
              ]}>
              {turnLines(opt.label)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Frame>
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
/** A long sentence deals more tiles than the screen has rows for at full size,
 *  and a bank that runs under the Check button looks finished when it is not.
 *  Past this many, every tile is cut a size smaller — on the line and in the
 *  bank alike, so a word is the same object wherever it sits. Still 44 high:
 *  the smallest thing a thumb hits without aiming. */
const DENSE_FROM = 9;
const TILE_ROW_DENSE = 50;

// A tapped word travels to where it landed instead of teleporting: the tile
// under her finger is the same object that appears on the line, so she never
// has to re-find it. 220ms ease-in-out — the curve for something moving across
// the screen rather than entering it.
const FLY_MS = 220;
const EASE_MOVE = Easing.bezier(0.77, 0, 0.175, 1);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

// Dragging. A tap is still the fast way to lay a tile down, but the order it
// lands in is hers to fix: pick a tile up and the rest open a place for it.
/** How far the finger travels before a press becomes a drag. Under this, taps
 *  still work everywhere, including on a tile she only meant to prod. */
const DRAG_SLOP = 8;
/** How far below the line a tile has to be carried before it counts as taken
 *  off it — without the margin it would flicker in and out on the edge. */
const DRAG_OUT = 14;
const LIFT_MS = 120;

type Rect = { x: number; y: number; width: number; height: number };
/** A tile in mid-air. `hide` is the slot it stands in for while it flies. */
type Flight = { id: number; text: string; from: Rect; to: Rect; hide: string };
/** A tile dropped onto the line that does not yet know where it landed. */
type Pending = { text: string; from: Rect; slot: string };
/** The tile under her finger, and where it was picked up from. `out` while it
 *  is held below the line: it stays in `used`, with its slot folded away, until
 *  she lets go, because unmounting the slot would take the gesture with it. */
type Drag = { tile: number; origin: Rect; out?: boolean };

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

function FlyingTile({ flight, dense, onDone }: { flight: Flight; dense: boolean; onDone: () => void }) {
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
        dense && styles.tileDense,
        styles.tileFlying,
        {
          left: flight.from.x,
          top: flight.from.y,
          width: flight.from.width,
          height: flight.from.height,
        },
        fly,
      ]}>
      <Text style={[styles.tileText, dense && styles.tileTextDense]}>{flight.text}</Text>
    </Animated.View>
  );
}

export function TileBuilder({
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
  const dense = tiles.length >= DENSE_FROM;
  const row = dense ? TILE_ROW_DENSE : TILE_ROW;
  const tileStyle = dense ? styles.tileDense : null;
  const textStyle = dense ? styles.tileTextDense : null;
  const rootRef = useRef<View>(null);
  // Bank tiles are keyed `b<tile>`, tiles on the line `t<tile>`, and the line
  // itself `area` — the drop zone a tile has to stay inside to count. Keyed by
  // the tile rather than by its position, because a tile being dragged has to
  // survive the reorder it is causing: keyed by position, React would tear the
  // slot down and rebuild it, and the gesture would go with it.
  const nodes = useRef<Record<string, View | null>>({});
  const flightId = useRef(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);

  // Drag state lives twice over: in React, because the slot it came from has to
  // render as a gap, and in shared values, because the finger has to be
  // followed on the UI thread whatever React is doing.
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;
  const usedRef = useRef(used);
  usedRef.current = used;
  /** True from the moment a press turns into a drag until the tile lands, so
   *  the press underneath it never also fires. */
  const dragged = useRef(false);
  /** Which drag this is. A tile picked up while the last one is still settling
   *  must not be cleared away by that one finishing. */
  const seq = useRef(0);
  /** From the press turning into a drag until the finger lifts. The pick-up is
   *  measured asynchronously on native, and a quick flick can let go first. */
  const holding = useRef(false);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const lift = useSharedValue(0);
  const originSV = useSharedValue<Rect | null>(null);
  /** Where every slot on the line currently sits, for the worklet to aim at. */
  const slotsSV = useSharedValue<(Rect | null)[]>([]);
  const areaBottomSV = useSharedValue(0);
  /** The slot the finger was last over, so a crossing costs one render and a
   *  hundred frames inside the same slot cost none. */
  const overSV = useSharedValue(-2);

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
    const slot = `t${i}`;
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
    rectOf(`t${i}`, (from) =>
      rectOf(`b${i}`, (to) => {
        setUsed(next);
        if (from && to) {
          setFlight({ id: ++flightId.current, text: tiles[i], from, to, hide: `b${i}` });
        }
      }),
    );
  };

  // Dragging ----------------------------------------------------------------
  // Re-measured rather than remembered: every reorder moves every slot after
  // it, and on web a tile that only reflows never reports a layout.
  const syncSlots = () => {
    const count = usedRef.current.length;
    const out: (Rect | null)[] = new Array(count).fill(null);
    const d = dragRef.current;
    for (let p = 0; p < count; p++) {
      const tile = usedRef.current[p];
      // A folded slot is nowhere on the line, so it is nothing to aim at.
      if (d?.out && d.tile === tile) continue;
      rectOf(`t${tile}`, (r) => (out[p] = r));
    }
    slotsSV.set(out);
    rectOf('area', (r) => areaBottomSV.set(r ? r.y + r.height : 0));
  };

  // Slots move under the finger as the tiles part for it, so the aim is only
  // as good as the last measurement.
  useEffect(() => {
    if (drag) syncSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [used, drag]);

  /** Picked up. A tile taken from the bank joins the line immediately — the
   *  same thing a tap would have done — and from there it is being reordered
   *  like any other, so there is only ever one drag to reason about. */
  const grab = (i: number, fromBank: number) => {
    const position = usedRef.current.indexOf(i);
    // A tile already on the line is not the bank's to pick up again.
    if (fromBank && position >= 0) return;
    dragged.current = true;
    holding.current = true;
    const mine = ++seq.current;
    rectOf(position < 0 ? `b${i}` : `t${i}`, (origin) => {
      // Let go (or superseded) before the measurement came back: starting the
      // drag now would leave a tile in the air that no gesture will ever land.
      if (!origin || !holding.current || seq.current !== mine) return;
      originSV.set(origin);
      dragRef.current = { tile: i, origin };
      setDrag({ tile: i, origin });
      syncSlots();
      if (position < 0) setUsed([...usedRef.current, i]);
      lift.set(reduced ? 1 : withTiming(1, { duration: LIFT_MS, easing: EASE_OUT }));
    });
  };

  /** Dropped into slot `to`, or back into the bank when `to` is -1. Called only
   *  as the finger crosses out of one slot and into the next. */
  const moveTo = (i: number, to: number) => {
    const d = dragRef.current;
    const wasOut = !!d?.out;
    const setOut = (out: boolean) => {
      if (!d || d.tile !== i || wasOut === out) return;
      // Written through to the ref at once: the next crossing can arrive before
      // React has rendered this one.
      dragRef.current = { ...d, out };
      setDrag(dragRef.current);
    };
    // Off the line, it only folds its slot away. Taking it out of `used` here
    // would unmount the slot, and the gesture under her finger with it — it
    // would never finish. It leaves the line for real when she lets go.
    if (to < 0) return setOut(true);
    const prev = usedRef.current;
    const at = prev.indexOf(i);
    const next = prev.filter((x) => x !== i);
    // The slot she is over is measured on the line as it stands now, so the
    // tile simply takes that index: whatever was there slides along. A folded
    // tile still holds its index, so the slots after it sit one further on.
    const index = wasOut && at >= 0 && to > at ? to - 1 : to;
    next.splice(Math.min(index, next.length), 0, i);
    setOut(false);
    if (next.length === prev.length && next.every((x, p) => x === prev[p])) return;
    setUsed(next);
  };

  /** Let go. The tile keeps travelling to wherever it ended up rather than
   *  snapping there, so the place it landed is never in doubt. */
  const land = (i: number, vx: number, vy: number) => {
    const d = dragRef.current;
    const mine = seq.current;
    const stale = () => seq.current !== mine;
    holding.current = false;
    // Only the React state is cleared, never the offsets: the tile is standing
    // exactly on its slot by now, and zeroing them here would flick it back to
    // where it was picked up for the one frame before it disappears. The next
    // drag resets them on the way up instead.
    const done = () => {
      if (stale()) return;
      dragged.current = false;
      dragRef.current = null;
      originSV.set(null);
      overSV.set(-2);
      setDrag(null);
    };
    if (!d) return done();
    // Carried off the line: now that the gesture is over, the slot can go.
    const home = d.out || !usedRef.current.includes(i);
    if (d.out) setUsed(usedRef.current.filter((x) => x !== i));
    // One frame for the last reorder to lay itself out before it is measured.
    requestAnimationFrame(() => {
      if (stale()) return;
      rectOf(home ? `b${i}` : `t${i}`, (to) => {
        if (!to || reduced) return done();
        const settle = { duration: 320, dampingRatio: 0.85 };
        lift.set(withTiming(0, { duration: 160, easing: EASE_OUT }));
        dy.set(withSpring(to.y - d.origin.y, { ...settle, velocity: vy }));
        dx.set(
          withSpring(to.x - d.origin.x, { ...settle, velocity: vx }, () => {
            'worklet';
            scheduleOnRN(done);
          }),
        );
      });
    });
  };

  // The worklets below are handed one stable function, not this render's
  // closures: a reorder mid-drag would otherwise rebuild every gesture and
  // re-attach the handler the finger is currently holding.
  const api = useRef({ grab, moveTo, land });
  api.current = { grab, moveTo, land };
  const call = useCallback((name: 'grab' | 'moveTo' | 'land', ...args: number[]) => {
    (api.current[name] as (...a: number[]) => void)(...args);
  }, []);

  const gestures = useMemo(() => {
    // Two detectors are mounted per tile — its place in the bank and its place
    // on the line — and a gesture belongs to exactly one of them.
    const pan = (i: number, fromBank: number) =>
      Gesture.Pan()
        .enabled(!locked)
        .minDistance(DRAG_SLOP)
        .onStart(() => {
          'worklet';
          dx.set(0);
          dy.set(0);
          lift.set(0);
          overSV.set(-2);
          scheduleOnRN(call, 'grab', i, fromBank);
        })
        .onUpdate((e) => {
          'worklet';
          dx.set(e.translationX);
          dy.set(e.translationY);
          const origin = originSV.get();
          if (!origin) return;
          const cx = origin.x + e.translationX + origin.width / 2;
          const cy = origin.y + e.translationY + origin.height / 2;
          // Rows first, then position along the row: on a wrapped line the row
          // she is over matters far more than the horizontal distance does.
          let over = -1;
          const floor = areaBottomSV.get();
          if (floor <= 0 || cy < floor + DRAG_OUT) {
            const slots = slotsSV.get();
            let best = Infinity;
            for (let p = 0; p < slots.length; p++) {
              const r = slots[p];
              if (!r) continue;
              const d =
                Math.abs(cy - (r.y + r.height / 2)) * 3 + Math.abs(cx - (r.x + r.width / 2));
              if (d < best) {
                best = d;
                over = p;
              }
            }
            if (over < 0) over = 0;
          }
          if (over !== overSV.get()) {
            overSV.set(over);
            scheduleOnRN(call, 'moveTo', i, over);
          }
        })
        .onFinalize((e) => {
          'worklet';
          scheduleOnRN(call, 'land', i, e.velocityX ?? 0, e.velocityY ?? 0);
        });
    return {
      line: tiles.map((_, i) => pan(i, 0)),
      bank: tiles.map((_, i) => pan(i, 1)),
    };
    // Rebuilt only when the bank itself changes or the round is graded — never
    // on a reorder, so the handler under her finger stays the same one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles.length, locked]);

  // Rebuilt gestures replace the one under her finger without it ever
  // finishing, so whatever drag it was carrying ends here instead of hanging.
  useEffect(
    () => () => {
      seq.current += 1;
      holding.current = false;
      dragged.current = false;
      dragRef.current = null;
      originSV.set(null);
      overSV.set(-2);
      setDrag(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gestures],
  );

  const folded = drag?.out ? drag.tile : -1;
  const firstOnLine = used.find((t) => t !== folded);

  const ghost = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.get() },
      { translateY: dy.get() },
      // Lifted off the page, barely — enough to read as held rather than as
      // grown, and it takes its letter with it.
      { scale: 1 + 0.08 * lift.get() },
    ],
  }));

  return (
    <View ref={rootRef} style={{ gap: dense ? 14 : 18 }}>
      <View
        ref={hold('area')}
        style={[
          styles.answerArea,
          ruled ? styles.answerAreaRuled : styles.answerAreaBoxed,
          ruled && { minHeight: row * 2 + 4 },
        ]}>
        {ruled ? (
          <>
            <View style={[styles.answerRule, { top: row }]} />
            <View style={[styles.answerRule, { top: row * 2 }]} />
          </>
        ) : null}
        <View style={[styles.answerTiles, dense && styles.tilesDense]}>
          {used.length === 0 && !ruled ? (
            <Text style={styles.answerPlaceholder}>tap the tiles…</Text>
          ) : null}
          {used.map((tileIndex) => {
            const key = `t${tileIndex}`;
            // While its word is in the air — thrown by a tap, or carried by a
            // finger — the slot holds the space, empty.
            const flying =
              pending?.slot === key || flight?.hide === key || drag?.tile === tileIndex;
            return (
              <GestureDetector key={tileIndex} gesture={gestures.line[tileIndex]}>
                <Pressable
                  ref={hold(key)}
                  disabled={locked || pending?.slot === key || flight?.hide === key}
                  onLayout={landed(key)}
                  onPress={() => {
                    if (dragged.current) return;
                    remove(used.indexOf(tileIndex));
                  }}
                  style={({ pressed }) => [
                    styles.tile,
                    tileStyle,
                    flying && styles.tileInFlight,
                    // Held off the line: out of the flow but still mounted, so
                    // the drag it is carrying can finish.
                    folded === tileIndex && styles.tileFolded,
                    { transform: [{ scale: pressed && !locked && !drag ? 0.94 : 1 }] },
                    webPress,
                    dragTouch,
                  ]}>
                  {/* First on the line, a word takes its capital again. */}
                  <Text style={[styles.tileText, textStyle, flying && { opacity: 0 }]}>
                    {tileIndex === firstOnLine
                      ? tiles[tileIndex].charAt(0).toLocaleUpperCase('es') + tiles[tileIndex].slice(1)
                      : tiles[tileIndex]}
                  </Text>
                </Pressable>
              </GestureDetector>
            );
          })}
        </View>
      </View>

      <View style={[styles.tileBank, dense && styles.tilesDense]}>
        {tiles.map((tile, i) => {
          // A word on its way home has already left the line, but its place in
          // the bank stays greyed until it has actually landed there.
          const gone = used.includes(i) || flight?.hide === `b${i}` || drag?.tile === i;
          return (
            <GestureDetector key={i} gesture={gestures.bank[i]}>
              <Pressable
                ref={hold(`b${i}`)}
                disabled={gone || locked}
                onPress={() => {
                  if (dragged.current) return;
                  add(i);
                }}
                style={({ pressed }) => [
                  styles.tile,
                  tileStyle,
                  gone && styles.tileTaken,
                  { transform: [{ scale: pressed && !gone ? 0.94 : 1 }] },
                  webPress,
                  dragTouch,
                ]}>
                <Text style={[styles.tileText, textStyle, gone && { opacity: 0 }]}>{tile}</Text>
              </Pressable>
            </GestureDetector>
          );
        })}
      </View>

      {flight ? (
        <FlyingTile
          key={flight.id}
          flight={flight}
          dense={dense}
          onDone={() => setFlight((f) => (f?.id === flight.id ? null : f))}
        />
      ) : null}

      {/* The tile under her finger. It is the only thing that does not reflow:
          everything else opens and closes around where it is pointing. */}
      {drag ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tile,
            tileStyle,
            styles.tileFlying,
            styles.tileHeld,
            {
              left: drag.origin.x,
              top: drag.origin.y,
              width: drag.origin.width,
              height: drag.origin.height,
            },
            ghost,
          ]}>
          <Text style={[styles.tileText, textStyle]}>{tiles[drag.tile]}</Text>
        </Animated.View>
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
  onAnswer: Single;
}) {
  const { form } = item;
  const phrase = isPhrase(form.form);
  const toSpanish = item.direction === 'en_to_es';
  const field = toSpanish ? 'form' : 'gloss_en';
  const target = labelOf(form, field);
  // Whether she builds from words or from letters goes by what she builds, not
  // by the Spanish: "una masa" means "great", one word, so its tiles are letters.
  const byWords = isPhrase(target);

  // A word's tiles are its letters and a few spare letters; only a phrase
  // takes spare words, and finding them reads every form of her deck — not
  // worth doing for tiles that would never use them.
  const [{ tiles }] = useState(() => buildTiles(target, byWords ? wordPool(form, allForms, field) : []));
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const joined = used.map((i) => tiles[i]).join(byWords ? ' ' : '');
  const prompt = phrase
    ? toSpanish
      ? 'Translate this phrase'
      : 'What does this phrase mean?'
    : 'Build the word in Spanish';

  return (
    <Frame
      prompt={prompt}
      verdict={verdict}
      canCheck={used.length > 0}
      onCheck={() =>
        setVerdict({
          // Tiles can't be mistyped: the letters or words are right or they aren't.
          // Building Spanish, the other gender of the same word counts too.
          correct: builtAnswerMatches(
            joined,
            target,
            toSpanish ? sameAnswer(form, allForms).map((f) => f.form) : [],
          ),
          answer: target,
          about: form.gloss_note_en ?? undefined,
          audio: toSpanish ? (form.audio_path ?? undefined) : undefined,
        })
      }
      answer={joined}
      onContinue={() => onAnswer(!!verdict?.correct, verdict?.correct ? {} : { answer: joined })}>
      <PromptBlock form={form} side={toSpanish ? 'en' : 'es'} />
      <TileBuilder
        tiles={tiles}
        used={used}
        setUsed={setUsed}
        locked={verdict !== null}
        ruled={byWords}
      />
    </Frame>
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
  onAnswer: Single;
}) {
  const { form } = item;
  const phrase = isPhrase(form.form);
  // Spare words for a phrase only, as in WordBuild: a word's tiles are letters.
  const [{ tiles }] = useState(() =>
    buildTiles(form.form, phrase ? wordPool(form, allForms, 'form') : []),
  );
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const joined = used.map((i) => tiles[i]).join(phrase ? ' ' : '');

  return (
    <Frame
      prompt="What does the audio say?"
      verdict={verdict}
      canCheck={used.length > 0}
      onCheck={() =>
        setVerdict({
          correct: builtAnswerMatches(joined, form.form),
          answer: `${form.form} — ${meaningOf(form)}`,
          about: form.gloss_note_en ?? undefined,
        })
      }
      onContinue={() => onAnswer(!!verdict?.correct, verdict?.correct ? {} : { answer: joined })}>
      <AudioPad path={form.audio_path!} compact />
      <TileBuilder
        tiles={tiles}
        used={used}
        setUsed={setUsed}
        locked={verdict !== null}
        ruled={phrase}
      />
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// SpanishInput — the field a word is typed into, and the letters an English
// keyboard doesn't have on its face: á é í ó ú ü ñ, one tap each, put in where
// the caret is. Duolingo's row, for the same reason: holding a key down for
// its accent is a trick most learners never find.
//
// The row only comes when the answer has one of those letters: on "abuela" it
// was seven buttons with nothing to do, and testers took them for a glitch.
// (Accents are forgiven when graded anyway, so its showing up is a small hint
// at most.) On iOS it rides on the keyboard itself, as its accessory bar, so
// it reads as extra keys and goes when the keyboard does.
//
// The keyboard is told this is not prose and not a login: no autocorrect, no
// spell check, no suggestion bar (it would spell the answer — "gaseosa" as she
// types "gas"), and no Paste / AutoFill bubble over the field.
// ---------------------------------------------------------------------------
const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ'];
const NEEDS_ACCENT = /[áéíóúüñ]/i;

type SpanishFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  verdict: Verdict;
  onSubmit: () => void;
  /** What she is meant to type: the row is only offered if it has a letter from it. */
  answer: string;
  /** Typed into a sentence's blank (`SentenceLine`'s `blank.field`) rather than
   *  a field of its own: drawn as the blank's word, `large` on a card. */
  inline?: 'bubble' | 'large';
};

function SpanishInput(props: SpanishFieldProps) {
  const { field, accents } = useSpanishField(props);
  return (
    <View style={styles.spanishInput}>
      {field}
      {accents}
    </View>
  );
}

/** The field she types Spanish into and the accent keys that go with it, apart,
 *  so the field can sit in a sentence's blank while the keys stay below it. */
function useSpanishField({
  value,
  onChangeText,
  placeholder,
  verdict,
  onSubmit,
  answer,
  inline,
}: SpanishFieldProps) {
  const input = useRef<TextInput>(null);
  const selection = useRef({ start: value.length, end: value.length });
  // Behind a cheer the keyboard would come up over it: it waits, and comes up
  // as the cheer goes.
  const cheerUp = useContext(CheerUpContext);
  const coveredAtStart = useRef(cheerUp);
  useEffect(() => {
    if (!cheerUp && coveredAtStart.current) {
      coveredAtStart.current = false;
      input.current?.focus();
    }
  }, [cheerUp]);
  const editable = verdict === null;
  const letters = editable && NEEDS_ACCENT.test(answer.normalize('NFC'));
  const onKeyboard = letters && Platform.OS === 'ios';
  // Docked keys are a row of the keyboard: with it down they would be left
  // stuck to the bottom of the screen on their own.
  const keyboardShown = useKeyboardState((s) => s.isVisible);

  const insert = (letter: string) => {
    const { start, end } = selection.current;
    const at = Math.min(start, value.length);
    const next = value.slice(0, at) + letter + value.slice(Math.min(end, value.length));
    selection.current = { start: at + 1, end: at + 1 };
    tap();
    onChangeText(next);
    // The caret goes after the letter, wherever it was put in; without this it
    // jumps to the end of the field.
    requestAnimationFrame(() => input.current?.setSelection?.(at + 1, at + 1));
  };

  const keys = ACCENTS.map((letter) => (
    <Pressable
      key={letter}
      onPress={() => insert(letter)}
      accessibilityRole="button"
      accessibilityLabel={`Type ${letter}`}
      hitSlop={4}
      style={({ pressed }) => [
        styles.accentKey,
        onKeyboard && styles.accentKeyDocked,
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
        webPress,
      ]}>
      <Text style={styles.accentText}>{letter}</Text>
    </Pressable>
  ));

  return {
    field: (
      <TextInput
        ref={input}
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={(e) => {
          selection.current = e.nativeEvent.selection;
        }}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        textContentType="none"
        importantForAutofill="no"
        // The edit menu a tap on the field raises — Paste, AutoFill — has
        // nothing to offer an answer she is meant to spell herself.
        contextMenuHidden
        // Android: the keyboard's suggestion strip is off only for this kind.
        keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
        autoFocus={!coveredAtStart.current}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        editable={editable}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        style={
          inline
            ? [styles.gapInput, inline === 'large' && styles.cardGapInput]
            : [
                styles.typingInput,
                verdict?.correct === true && { borderColor: colors.success, backgroundColor: colors.successSoft },
                verdict?.correct === false && { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
              ]
        }
      />
    ),
    accents: onKeyboard ? (
      keyboardShown ? (
        <KeyboardExtender>
          <View style={styles.accentBar}>{keys}</View>
        </KeyboardExtender>
      ) : null
    ) : letters ? (
      <View style={styles.accentRow}>{keys}</View>
    ) : null,
  };
}

function Typing({
  item,
  allForms,
  onAnswer,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswer: Single;
}) {
  const { form } = item;
  const [input, setInput] = useState('');
  const [verdict, setVerdict] = useState<Verdict>(null);

  const [graded, setGraded] = useState<ReturnType<typeof gradeTyped> | null>(null);
  const check = () => {
    const g = gradeTyped(input, form, allForms);
    setGraded(g);
    setVerdict({
      correct: g.correct,
      answer: form.form,
      note: g.note ? NOTE_TEXT[g.note](g.expected) : undefined,
      audio: form.audio_path ?? undefined,
    });
  };

  return (
    <Frame
      prompt="Type it in Spanish"
      verdict={verdict}
      canCheck={!!input.trim()}
      onCheck={check}
      answer={input.trim()}
      onContinue={() =>
        onAnswer(!!verdict?.correct, { answer: input.trim(), note: graded?.note })
      }>
      <PromptBlock form={form} side="en" />
      <SpanishInput
        value={input}
        onChangeText={setInput}
        placeholder="your answer…"
        verdict={verdict}
        onSubmit={() => input.trim() && check()}
        answer={form.form}
      />
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Uní los pares — four words drilled on one screen. This one grades each pair
// as she taps it: waiting to check eight taps at once would be cruel, and the
// instant red flash is the whole point of the format. Either column can be
// tapped first, and the last pair ends the screen by itself — there is
// nothing left to check, so a Continue there would be a tap for its own sake.
// ---------------------------------------------------------------------------
/** Long enough to see the last pair go green, short enough not to wait on. */
const MATCH_DONE_MS = 650;

function Matching({
  item,
  onAnswered,
}: {
  item: QueueItem;
  onAnswered: Answered;
}) {
  const group = item.group ?? [item.form];
  const [left] = useState(() => [...group].sort(() => Math.random() - 0.5));
  const [right] = useState(() => [...group].sort(() => Math.random() - 0.5));

  const [selected, setSelected] = useState<{ side: 'left' | 'right'; id: string } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [flashWrong, setFlashWrong] = useState<string[]>([]);
  const finished = useRef(false);

  useEffect(() => {
    if (matched.size !== group.length || finished.current) return;
    finished.current = true;
    // Every pair is matched, so whatever she got wrong on the way she has
    // already put right, and the red flash told her at the time. The words she
    // confused still go to the round through `missed`.
    answerFeedback(true);
    const t = setTimeout(() => onAnswered([...missed]), MATCH_DONE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const pick = (side: 'left' | 'right', id: string) => {
    if (matched.has(id) || finished.current) return;
    // The left column is the Spanish, so a tap there is a chance to hear the
    // word — the right column is its English and stays silent, the same rule
    // PromptBlock follows. Nothing is given away: the word is already legible,
    // and what is being asked is which meaning it goes with.
    if (side === 'left') {
      const audio = group.find((f) => f.id === id)?.audio_path;
      if (audio) playAudio(audio);
    }
    // Nothing chosen yet, or another word in the same column: that is the pick.
    if (!selected || selected.side === side) {
      setSelected(selected?.side === side && selected.id === id ? null : { side, id });
      return;
    }
    setSelected(null);
    if (id === selected.id) {
      const next = new Set(matched).add(id);
      // The last pair's tap is the chime and the buzz of the whole screen.
      if (next.size < group.length) tap();
      setMatched(next);
    } else {
      // A wrong pairing marks both words involved — she confused them.
      warn();
      setMissed(new Set([...missed, id, selected.id]));
      setFlashWrong([`${side}:${id}`, `${selected.side}:${selected.id}`]);
      setTimeout(() => setFlashWrong([]), 450);
    }
  };
  const isPicked = (side: 'left' | 'right', id: string) => selected?.side === side && selected.id === id;
  const flashes = (side: 'left' | 'right', id: string) => flashWrong.includes(`${side}:${id}`);

  return (
    <Frame
      prompt="Match each word to its meaning"
      verdict={null}
      note={`${matched.size} of ${group.length} matched`}
      onContinue={() => onAnswered([...missed])}>
      <View style={styles.matchGrid}>
        <View style={styles.matchColumn}>
          {left.map((c) => {
            const isMatched = matched.has(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => pick('left', c.id)}
                disabled={isMatched}
                style={({ pressed }) => [
                  styles.matchCell,
                  isPicked('left', c.id) && styles.matchCellPicked,
                  flashes('left', c.id) && {
                    borderColor: colors.danger,
                    backgroundColor: colors.dangerSoft,
                  },
                  isMatched && styles.matchCellDone,
                  { transform: [{ scale: pressed && !isMatched ? 0.97 : 1 }] },
                  webPress,
                ]}>
                <FitText
                  style={[
                    styles.matchText,
                    isMatched && { color: colors.success },
                  ]}
                  lines={2}>
                  {c.form}
                </FitText>
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
                onPress={() => pick('right', c.id)}
                disabled={isMatched}
                style={({ pressed }) => [
                  styles.matchCell,
                  isPicked('right', c.id) && styles.matchCellPicked,
                  flashes('right', c.id) && {
                    borderColor: colors.danger,
                    backgroundColor: colors.dangerSoft,
                  },
                  isMatched && styles.matchCellDone,
                  { transform: [{ scale: pressed && !isMatched ? 0.97 : 1 }] },
                  webPress,
                ]}>
                <FitText
                  style={[styles.matchText, isMatched && { color: colors.success }]}
                  lines={2}>
                  {shownMeaning(c).text}
                </FitText>
                {shownMeaning(c).hint ? (
                  <Text style={[styles.matchHint, isMatched && { color: colors.success }]} numberOfLines={1}>
                    {shownMeaning(c).hint}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Sentences. Three exercises share one line of text: the sentence as a row of
// words, laid out one Text each so a single one can be marked (the word she is
// meeting for the first time, tappable) or blanked (the one she has to supply).
// ---------------------------------------------------------------------------
export function SentenceLine({
  sentence,
  mark,
  blank,
  onWord,
  tappable,
  turn,
  large,
  trailing,
  under,
  hug,
}: {
  sentence: Sentence;
  /** In a bubble as wide as its line (`SpeechBubble`'s `bare`): the line sizes
   *  the bubble instead of stretching to fill it. */
  hug?: boolean;
  /** One speaker's line of a dialogue, by index, without its dash — for a
   *  bubble of its own. Left out, a dialogue is laid out a line a speaker. */
  turn?: number;
  /** Form id of the word to mark as new. */
  mark?: string;
  /** Tapping a word asks for its meaning, with where the word sits on screen
   *  so the answer can be anchored to it, and what it means in this sentence.
   *  Omitted where a meaning would hand over the answer — building a sentence
   *  from tiles, or transcribing one. */
  onWord?: (formId: string, anchor: Anchor, gloss?: string) => void;
  /** Which words answer to a tap. Defaults to all of them; a screen that must
   *  hold one word back — the one under test — says so here. */
  tappable?: (formId: string) => boolean;
  /** Token to replace with a blank, and what she has put in it so far. A
   *  `field` is typed into in the blank itself, in place of the word. */
  blank?: { index: number; filled?: string; tone?: 'right' | 'wrong'; field?: React.ReactNode };
  /** The sentence as the star of a card: bigger, and centred. */
  large?: boolean;
  /** Sits after the last word, on its line: a play button that belongs to the sentence. */
  trailing?: React.ReactNode;
  /** Under the line, in the same block: its English, in a bubble. */
  under?: React.ReactNode;
}) {
  const phrase = large ? styles.cardPhrase : styles.bubblePhrase;
  // Measured on tap, never cached: a word only reflows when the sentence
  // rewraps, which fires no layout event, so a remembered rect goes stale.
  const nodes = useRef<Record<number, unknown>>({});
  const tapWord = (i: number, formId: string) =>
    measureAnchor(nodes.current[i], (a) => a && onWord?.(formId, a, sentence.tokens[i]?.gloss));
  const canTap = (id: string) => !!onWord && (tappable?.(id) ?? true);
  const turns = turnsOf(sentence.tokens);
  const rows = turn != null ? [turn] : [...new Set(turns)];
  // In a bubble of its own the line needs no dash to say whose it is.
  const shown = (text: string) => (turn != null ? text.replace(/^—\s*/, '') : text);

  return (
    // A reply's bubble is as wide as what is said in it, so its line can't
    // be the one that stretches.
    <View style={hug ? styles.hugText : turn ? styles.replyText : large ? styles.cardText : styles.bubbleText}>
      {rows.map((row) => (
      <View key={row} style={[styles.tokenRow, large && styles.tokenRowCentered]}>
        {sentence.tokens.map((t, i) => {
          if (turns[i] !== row) return null;
          if (blank && i === blank.index) {
            // The blank keeps the word's punctuation on both sides of it —
            // Spanish opens a question as well as closing it: "¿____?".
            const head = shown(tokenHead(t));
            const tail = tokenTail(t);
            return (
              <View key={i} style={[styles.tokenRow, styles.tokenTight]}>
                {head ? <Text style={phrase}>{head}</Text> : null}
                <View
                  style={[
                    styles.gap,
                    !blank.filled && styles.gapEmpty,
                    blank.field && blank.filled ? styles.gapTyping : null,
                    blank.tone === 'right' && styles.gapRight,
                    blank.tone === 'wrong' && styles.gapWrong,
                  ]}>
                  {blank.field ?? (
                  <Text
                    style={[
                      styles.gapText,
                      large && styles.cardGapText,
                      blank.tone === 'right' && { color: colors.success },
                      blank.tone === 'wrong' && { color: colors.dangerInk },
                    ]}>
                    {/* Back in its sentence, a word that opens one takes its capital again. */}
                    {blank.filled
                      ? startsSentence(sentence.tokens, i)
                        ? blank.filled.charAt(0).toLocaleUpperCase('es') + blank.filled.slice(1)
                        : blank.filled
                      : ' '}
                  </Text>
                  )}
                </View>
                {tail ? <Text style={phrase}>{tail}</Text> : null}
              </View>
            );
          }
          // The new word wears its own highlight, but opens the same bubble as
          // every other word — one way to ask what something means, not two.
          if (mark && t.form_ids?.includes(mark)) {
            return (
              <Pressable
                key={i}
                ref={(n) => {
                  nodes.current[i] = n;
                }}
                onPress={() => tapWord(i, mark)}
                disabled={!canTap(mark)}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.tokenNew,
                  { transform: [{ scale: pressed ? 0.96 : 1 }] },
                  webPress,
                ]}>
                <Text style={[phrase, styles.tokenNewText]}>{shown(t.surface)}</Text>
              </Pressable>
            );
          }
          // Every word she can be told about is tappable, function words
          // included — `de` and `el` are exactly the ones a beginner stalls
          // on. Only proper nouns are left plain: a name has no translation
          // to show, and underlining one would promise an answer that isn't
          // there.
          const id = t.form_ids[0] ?? t.glue;
          if (id && canTap(id)) {
            return (
              <Pressable
                key={i}
                ref={(n) => {
                  nodes.current[i] = n;
                }}
                onPress={() => tapWord(i, id)}
                hitSlop={6}
                accessibilityHint="Shows what this word means"
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }] }, webPress]}>
                <Text style={[phrase, styles.tokenPeek]}>{shown(t.surface)}</Text>
              </Pressable>
            );
          }
          return (
            <Text key={i} style={phrase}>
              {shown(t.surface)}
            </Text>
          );
        })}
        {row === rows[rows.length - 1] ? trailing : null}
      </View>
      ))}
      {under}
    </View>
  );
}

/**
 * Resolves a tapped word. The deck is only what she is drilling: a function
 * word, or a form from a unit she is not being tested on, is in the lexicon
 * and nowhere else — so the lexicon is asked first and the deck is the
 * fallback for the screens that have no lexicon to hand.
 */
function lookupWith(lexicon: Map<string, Form> | undefined, allForms: Form[]) {
  return (id: string) => lexicon?.get(id) ?? allForms.find((f) => f.id === id);
}

/**
 * The word a tap opened, where it sits on screen, and every word opened so far
 * — the last of which is what the round is told about, so that looking a word
 * up still costs what it always did.
 */
export function useWordPopover(lookup: (id: string) => Form | undefined) {
  const [showing, setShowing] = useState<Showing | null>(null);
  const [peeked, setPeeked] = useState<string[]>([]);

  const open = (id: string, anchor: Anchor, gloss?: string) => {
    const form = lookup(id);
    if (!form) return;
    setShowing({ form, anchor, gloss });
    setPeeked((p) => (p.includes(id) ? p : [...p, id]));
  };

  return { showing, peeked, open, close: () => setShowing(null) };
}

/** A tapped word, where it sits, and what it means in its sentence. */
type Showing = { form: Form; anchor: Anchor; gloss?: string };

/** The popover itself, wired to the app's audio player. */
export function WordBubble({ state, onClose }: { state: Showing | null; onClose: () => void }) {
  return (
    <WordPopover
      form={state?.form ?? null}
      anchor={state?.anchor ?? null}
      gloss={state?.gloss}
      onClose={onClose}
      audio={(path) => <PlayButton path={path} />}
      image={state ? courseArt(state.form.lemma_id) : undefined}
    />
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
  allForms,
  onAnswered,
  canTap,
  lexicon,
}: {
  item: QueueItem;
  allSentences: Sentence[];
  allForms: Form[];
  onAnswered: Answered;
  canTap: boolean;
  lexicon?: Map<string, Form>;
}) {
  const sentence = item.sentence!;
  const word = item.introduces;
  // The new word's picture is in the bubble a tap on it opens, never on the
  // sentence: on the card it reads as the picture of the whole sentence, and
  // the wrong meanings name the same word, so it pointed at them as much as
  // at the right one ("Un helado de chocolate" under a chocolate bar).
  const words = useWordPopover(lookupWith(lexicon, allForms));
  const [options] = useState(() => meaningOptions(sentence, allSentences, allForms));
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  // So its picture comes first, on a screen of its own (WordPicture).
  const art = word ? courseArt(word.lemma_id) : undefined;
  const [met, setMet] = useState(!art);

  // On a screen that introduces a word, only that word answers to a tap — the
  // rest is material she is meant to already have. Otherwise every word does,
  // the one being practised included: a peek is better than being stuck (and
  // than a picture she can't reach), and it is paid for — a peeked word is
  // reported as hinted, which caps its rating (round.ts).
  const tappable = word ? (id: string) => id === word.id : () => true;

  if (word && art && !met) return <WordPicture form={word} art={art} onDone={() => setMet(true)} />;

  // A form of more than one word ("sobre gustos no hay nada escrito") is a phrase, not a word.
  const isPhrase = !!word && /\s/.test(word.form.trim());
  const prompt = word
    ? `New ${isSlang(word) ? (isPhrase ? 'slang phrase' : 'slang') : isPhrase ? 'phrase' : 'word'} · what does it say?`
    : item.isRetry
      ? '🔁 What does the sentence say?'
      : 'What does the sentence say?';

  return (
    // After its picture the sentence comes in as the next screen would.
    <Animated.View entering={art ? MEET_SENTENCE : undefined} style={styles.meetStage}>
      <Frame
        prompt={prompt}
        // One voice, read: the card, and him by the prompt as on a gap's card. A
        // dialogue's first bubble has him already.
        art={turnCount(sentence.tokens) < 2 ? <TitlePancho /> : undefined}
        verdict={verdict}
        canCheck={!!chosen}
        onCheck={() => setVerdict({ correct: chosen === sentence.id, answer: sentence.en })}
        onContinue={() =>
          onAnswered(verdict?.correct ? [] : [(word ?? item.form).id], { hinted: words.peeked })
        }>
        {/* The Spanish is already on screen and the answer is its English, so
            hearing it gives nothing away — it binds the sound to the spelling,
            which is the whole reason the sentence is read rather than shown. */}
        {turnCount(sentence.tokens) < 2 ? (
          <PhraseCard center beside={sentence.audio_path ? <PlayButton path={sentence.audio_path} big /> : null}>
            <SentenceLine
              large
              sentence={sentence}
              mark={word?.id}
              onWord={word || canTap ? words.open : undefined}
              tappable={tappable}
            />
          </PhraseCard>
        ) : (
          <SpanishBubble
            sentence={sentence}
            mark={word?.id}
            onWord={word || canTap ? words.open : undefined}
            tappable={tappable}
          />
        )}
        <WordBubble state={words.showing} onClose={words.close} />
        {word && !words.peeked.length ? (
          <Text style={styles.peekHint}>Tap the marked word to see what it means</Text>
        ) : null}

        <Choices
          options={options}
          correctId={sentence.id}
          chosen={chosen}
          revealed={verdict !== null}
          onPick={setChosen}
        />
      </Frame>
    </Animated.View>
  );
}

// Completá la frase — the sentence with one due word missing (item.form, which
// the session picked among the words the sentence covers), and four words to
// fill it with. The English sits under the bubble: without it any word that
// fits the grammar would do.
/** How many words the tile bank offers when the blank is filled from tiles. */
const GAP_TILES = 8;

/**
 * The sentence with one word blanked out, filled three ways. Which one she
 * gets is the gap's flavour (session.ts, `gapMode`): four choices on a
 * sentence she has just started passing, a bank of tiles once it stops moving
 * up the ladder, and typed once it has stayed there. The screen around them is
 * the same — the sentence, the recording once she has answered, the English
 * underneath — because it is the same question, asked with less help.
 */
function SentenceGap({
  item,
  allForms,
  onAnswered,
  canTap,
  lexicon,
  fill = 'choices',
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswered: Answered;
  canTap: boolean;
  lexicon?: Map<string, Form>;
  fill?: 'choices' | 'tiles' | 'typed';
}) {
  const sentence = item.sentence!;
  const target = item.form;
  // By ear the recording asks the question: the English waits for the verdict.
  const byEar = !!item.byEar && !!sentence.audio_path;
  // One voice, read: the card. A dialogue, or one heard, keeps its bubbles.
  const oneCard = !byEar && turnCount(sentence.tokens) < 2;
  const words = useWordPopover(lookupWith(lexicon, allForms));
  const [index] = useState(() => tokenIndexOf(sentence, target.id));
  const [options] = useState(() =>
    fill === 'typed' ? [] : gapOptions(sentence, target, allForms, fill === 'tiles' ? GAP_TILES : 4, lexicon?.values()),
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [graded, setGraded] = useState<ReturnType<typeof gradeGap> | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const answer = index >= 0 ? tokenWord(sentence.tokens[index]) : target.form;
  // The English is what makes the gap one answer and not any word that fits
  // ("¿Tenés ___?"), so it is never blanked: a word the English spells out —
  // "a medialuna", "drink mate" — never gets a gap (session.ts, `fairGap`).
  const english = sentence.en;
  const typed = input.trim();
  const filled = fill === 'typed' ? typed || undefined : options.find((o) => o.id === chosen)?.label;
  const correct = fill === 'typed' ? !!graded?.correct : chosen === target.id;
  const tone = verdict ? (correct ? 'right' : 'wrong') : undefined;

  const check = () => {
    const g = fill === 'typed' ? gradeGap(typed, target, allForms, sentence, { byEar }) : null;
    setGraded(g);
    setVerdict({
      correct: g ? g.correct : chosen === target.id,
      answer: `${answer} — ${sentence.en}`,
      note: g?.note ? NOTE_TEXT[g.note](g.expected) : undefined,
      // The whole sentence, gap filled — said by the result sheet, after its chime.
      audio: sentence.audio_path ?? undefined,
    });
  };

  // Typed, she writes in the blank itself: the word goes where it will be
  // read, and there is no second box to look back and forth from. Once graded
  // the blank shows the word as written, in the verdict's colour.
  const spanish = useSpanishField({
    value: input,
    onChangeText: setInput,
    verdict,
    onSubmit: () => typed && check(),
    answer,
    inline: oneCard ? 'large' : 'bubble',
  });
  const blank = { index, filled, tone, field: fill === 'typed' && !verdict ? spanish.field : undefined } as const;

  return (
    <Frame
      prompt={`${item.isRetry ? '🔁 ' : ''}${byEar ? 'Listen and complete the sentence' : 'Complete the sentence'}`}
      art={oneCard ? <TitlePancho /> : undefined}
      badgeBeside
      verdict={verdict}
      canCheck={fill === 'typed' ? !!typed : !!chosen}
      onCheck={check}
      answer={fill === 'typed' ? typed : undefined}
      onContinue={() =>
        onAnswered(correct ? [] : [target.id], {
          hinted: words.peeked,
          ...(fill === 'typed' ? { answer: typed, note: graded?.note } : {}),
        })
      }>
      {oneCard ? (
        // The Spanish with its gap, the English a size down beneath it, all on one card.
        <PhraseCard>
          {verdict && sentence.audio_path ? <PlayButton path={sentence.audio_path} autoPlay={false} /> : null}
          <SentenceLine large sentence={sentence} onWord={canTap ? words.open : undefined} blank={blank} />
          <Text style={styles.phraseCardEn}>{english}</Text>
        </PhraseCard>
      ) : byEar ? (
        // Heard, the recording is the question and the Spanish its ruled line.
        <>
          <AudioPad path={sentence.audio_path!} />
          <View style={styles.gapLine}>
            <SentenceLine sentence={sentence} onWord={canTap ? words.open : undefined} blank={blank} />
          </View>
        </>
      ) : (
        <GapBubbles
          sentence={sentence}
          english={english}
          play={!!verdict}
          onWord={canTap ? words.open : undefined}
          blank={blank}
        />
      )}
      <WordBubble state={words.showing} onClose={words.close} />
      {fill === 'typed' ? (
        spanish.accents
      ) : fill === 'tiles' ? (
        <GapBank
          options={options}
          correctId={target.id}
          chosen={chosen}
          revealed={verdict !== null}
          onPick={setChosen}
        />
      ) : (
        <Choices
          options={options}
          correctId={target.id}
          chosen={chosen}
          revealed={verdict !== null}
          onPick={setChosen}
        />
      )}
    </Frame>
  );
}

/**
 * The bank a tile gap is filled from: the same question as the four choices,
 * with twice as many words and none of the help a full-width button gives.
 * Tiles are tapped rather than dragged — there is only one slot to fill.
 */
function GapBank({
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
    <View style={styles.gapBank}>
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
              styles.tile,
              picked && styles.choicePicked,
              right && styles.choiceRight,
              wrong && styles.choiceWrong,
              { transform: [{ scale: pressed && !revealed ? 0.96 : 1 }] },
              webPress,
            ]}>
            <Text
              style={[
                styles.tileText,
                right && { color: colors.success },
                wrong && { color: colors.danger },
              ]}>
              {turnLines(opt.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
  side = 'es',
  canTap = false,
  lexicon,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswered: Answered;
  byEar?: boolean;
  /** Only the English build shows Spanish to read, so only it can offer the
   *  word-tap — the others show English, or nothing at all. */
  canTap?: boolean;
  lexicon?: Map<string, Form>;
  /** Which side she puts together. The English side is the meaning rung asked
   *  properly: she reads the Spanish and builds what it says, instead of
   *  picking it out of four. No clause ever narrows it — the English of a long
   *  sentence is still English she can read. */
  side?: 'es' | 'en';
}) {
  const sentence = item.sentence!;
  // A sentence too long to rebuild whole asks for one of its clauses, with the
  // rest of it written out above. Everything below works on `asked` — the
  // clause, or the whole sentence when there is no clause to single out — so
  // the tiles, the marking and the blame all narrow together.
  const asked = item.clause != null && side === 'es' ? clauseOf(sentence, item.clause) : sentence;
  const words = useWordPopover(lookupWith(lexicon, allForms));
  const testing = !!item.placementUnit;
  const [{ tiles }] = useState(() => sentenceTiles(asked, allForms, side, byEar, testing, testing ? undefined : lexicon?.values()));
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const placed = used.map((i) => tiles[i]);

  return (
    <Frame
      prompt={
        side === 'en'
          ? 'What does this say?'
          : byEar
            ? 'What does the audio say?'
            : item.clause != null
              ? 'Say the missing part'
              : 'Translate this sentence'
      }
      verdict={verdict}
      canCheck={used.length > 0}
      onCheck={() => {
        const canonical = isCanonical(placed, asked, side);
        setVerdict({
          correct: sentenceAnswerMatches(placed, asked, { byEar, side }),
          answer: `${sentence.es} — ${sentence.en}`,
          // Right, but not the sentence as written: show that one too.
          also: canonical ? undefined : side === 'en' ? asked.en : asked.es,
          // And why the written one has the word she left out, or missed. Not
          // when she built it as written: there is nothing left to explain.
          // The note is about the Spanish, so the English build doesn't carry it.
          about: !canonical && side === 'es' ? (sentence.note_en ?? undefined) : undefined,
          // Built from the English, the Spanish is hers now: hear how it goes.
          audio: side === 'es' && !byEar ? (sentence.audio_path ?? undefined) : undefined,
        });
      }}
      answer={placed.join(' ')}
      onContinue={() =>
        onAnswered(verdict?.correct ? [] : missedForms(asked, placed, allForms, { side, drilled: item.form.id }), {
          answer: placed.join(' '),
          ...(side === 'en' ? { hinted: words.peeked } : {}),
          // A test counts one small word left out as half a miss.
          ...(testing && !verdict?.correct && lexicon && nearMiss(placed, asked, lexicon, { byEar, side })
            ? { credit: 0.5 }
            : {}),
        })
      }>
      {byEar && sentence.audio_path ? (
        <AudioPad path={sentence.audio_path} compact />
      ) : side === 'en' ? (
        // Reading a sentence in Spanish, like the rung this replaces: the
        // recording binds the sound to the spelling, and a word she cannot
        // place is one tap away. Losing both on the harder half of a coin
        // flip would make the same rung two different exercises.
        <>
          <SpanishBubble sentence={sentence} onWord={canTap ? words.open : undefined} />
          <WordBubble state={words.showing} onClose={words.close} />
        </>
      ) : (
        <EnglishBubble sentence={sentence} />
      )}
      {item.clause != null && side === 'es' ? <ClauseContext es={sentence.es} clause={item.clause} /> : null}
      <TileBuilder tiles={tiles} used={used} setUsed={setUsed} locked={verdict !== null} ruled />
    </Frame>
  );
}

/**
 * The sentence around the clause she is building: the other clauses as written
 * Spanish, and a rule where hers goes. It is the half of the sentence she is not
 * being asked for, which is the whole point — six tiles in no marked order was
 * the exercise this replaces.
 */
function ClauseContext({ es, clause }: { es: string; clause: number }) {
  // A dialogue keeps a line a speaker, so the part she owes sits where its
  // speaker says it: under the question, or over the answer.
  const parts = clausesOf(es);
  const lines: number[][] = [];
  parts.forEach((part, i) => {
    if (i === 0 || part.startsWith('—')) lines.push([i]);
    else lines.at(-1)!.push(i);
  });
  return (
    <View style={styles.clauseLines}>
      {lines.map((line, n) => (
        <View key={n} style={styles.clauseLine}>
          {line.map((i) =>
            i === clause ? (
              <View key={i} style={styles.clauseRow}>
                {parts[i].startsWith('—') ? <Text style={styles.clauseWritten}>—</Text> : null}
                <View style={styles.clauseSlot} />
              </View>
            ) : (
              <Text key={i} style={styles.clauseWritten}>
                {parts[i]}
              </Text>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

/** The ink pick's own shade: a drop in its colour and a faint lit edge. */

/** Answers lie flat: outlined, without the hard shadow every other sticker
 *  has — on a stack of answers it read as a thick bottom border. A held tile
 *  still lifts (clay.float); that lift is what says it is picked up. */
const FLAT = `0 0 0 ${OUTLINE}px ${colors.ink}`;

const styles = StyleSheet.create({
  bigCard: { alignItems: 'center', gap: 10, paddingVertical: 26 },

  // The sentence around a clause build: what is already written sits in the
  // ink of a finished sentence, and the part she owes is an empty rule of the
  // same height, so the line reads as one sentence with a hole in it.
  clauseLines: { gap: 4 },
  clauseLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 },
  clauseRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clauseWritten: { ...font.display[700], fontSize: 20, lineHeight: 30, color: colors.ink },
  clauseSlot: {
    width: 72,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    marginBottom: 6,
  },
  introArt: { width: 132, height: 112, marginBottom: 4 },
  meetStage: { flex: 1 },
  meet: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 12 },
  meetArt: { width: 220, height: 184, maxWidth: '100%', marginBottom: 8 },
  meetArticle: { ...font.display[700], fontSize: 26, color: colors.muted },
  meetEn: { ...font.body[600], fontSize: 20, color: colors.muted, textAlign: 'center', marginTop: -4 },
  // The Spanish leads — it is the form she is being tested on — and the meaning
  // sits under a rule, in the primary's deep tone.
  esHero: {
    ...font.display[800],
    fontSize: 42,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  esBig: {
    ...font.display[800],
    fontSize: 34,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  esPhraseHero: {
    ...font.display[800],
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 36,
  },
  enBig: { ...font.display[700], fontSize: 24, color: colors.ink, textAlign: 'center' },
  // ¿Sí o no?: the meaning on offer, set as a guess rather than an answer.
  guessMeans: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center' },
  guess: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.faint,
  },
  guessTrue: { borderStyle: 'solid', borderColor: colors.success, backgroundColor: colors.successSoft },
  guessFalse: { borderStyle: 'solid', borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  guessText: { ...font.display[700], fontSize: 21, color: colors.ink, textAlign: 'center', flexShrink: 1 },
  guessTextFalse: { textDecorationLine: 'line-through', textDecorationColor: colors.danger },
  guessMark: { ...font.display[800], fontSize: 21, color: colors.primary },
  enPhrase: { ...font.display[700], fontSize: 20, color: colors.ink, textAlign: 'center' },
  // Room between the prompt and the sentence — space, not a line.
  divider: { height: 6, alignSelf: 'stretch' },

  // The capybara and its bubble ---------------------------------------------
  // The tail is absolute, so it eats into this gap: 12 leaves its tip a few
  // points clear of the snout instead of growing out of it. The figure is packed
  // against the box's inner edge (left, before the mirror), so the gap is the
  // same for every one.
  speechRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  speaker: { width: SPEAKER_WIDTH, height: SPEAKER_HEIGHT, transform: [{ scaleX: -1 }] },
  // The bubble is a butter sticker, a little crooked; the tail leans with it.
  bubbleWrap: { flex: 1, transform: [{ rotate: '-1.5deg' }] },
  // Bare, the first bubble is as wide as its line, its tail clear of the page edge.
  bareWrap: { flex: 0, alignSelf: 'flex-start', maxWidth: '82%', marginLeft: TAIL },
  // Its outline is a real border, not the theme's spread shadow: the tail has to
  // paint over the outline where they join, and a later sibling reliably covers
  // a border but not, on iOS, a shadow.
  bubble: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    // Tight enough that a one-line bubble still has a straight edge for the tail to join.
    borderRadius: 18,
    backgroundColor: pastel.butter,
    borderWidth: OUTLINE,
    borderColor: colors.ink,
    boxShadow: `3px 4px 0 ${colors.ink}`,
  },
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  // The second speaker: a bubble on the far side, in lavender so the
  // two voices read apart at a glance, its tail pointing off to the right.
  dialogue: { gap: 10 },
  replyWrap: { alignSelf: 'flex-end', maxWidth: '82%', marginRight: TAIL },
  replyBubble: { backgroundColor: pastel.lav },
  replyText: { gap: 2 },
  hugText: { flexShrink: 1, gap: 2 },
  // The first speaker's tail sits on the left edge; hers is the same shape on the right.
  replySpeechTail: { left: undefined, right: -TAIL_W + OUTLINE },
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
  // Its base reaches just inside the bubble's border, covering it between the two sides.
  // Centred by layout, not by a percentage and a negative margin: on iOS that pair left it low, on the corner's curve.
  speechTail: { position: 'absolute', top: 0, bottom: 0, left: -TAIL_W + OUTLINE, width: TAIL_W, justifyContent: 'center', zIndex: 1 },
  // Line heights are spelled out because a single word is fitted to one line
  // (BubbleText), and the fit is judged against the line's height.
  bubbleWord: { ...font.display[800], fontSize: 32, lineHeight: 38, color: colors.ink, letterSpacing: -0.4 },
  bubbleEn: { ...font.display[800], fontSize: 26, lineHeight: 32, color: colors.ink, letterSpacing: -0.3 },
  bubblePhrase: { ...font.display[700], fontSize: 22, lineHeight: 30, color: colors.ink },
  cardPhrase: { ...font.display[800], fontSize: 30, lineHeight: 38, color: colors.ink, letterSpacing: -0.3 },
  cardGapText: { fontSize: 30, lineHeight: 40 },
  // In the card the line takes the card's whole width. Shrunk to fit its words
  // (the card centres its children), pixel rounding could leave the row a hair
  // too narrow and push the last word to a second line, over the English under
  // it — "Él es mi / abuelo." when the whole sentence had room.
  cardText: { alignSelf: 'stretch', gap: 2 },
  tokenRowCentered: { justifyContent: 'center' },
  // The sentence as the star: a butter sticker, the capybara peeking over its edge.
  phraseCard: {
    marginTop: 8,
    borderRadius: 30,
    backgroundColor: pastel.butter,
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
    boxShadow: clay.surface,
  },
  phraseCardPlain: { marginTop: 10 },
  // He reaches up into the scroll's top padding (20), and down over the card's top edge to just above
  // its sentence (the gap 18, the card's 10 and its padding 22), standing on the card like a sticker.
  titleArt: { width: TITLE_ART, height: TITLE_ART, marginTop: -20, marginBottom: -48, marginRight: -8 },
  titleArtImage: { width: TITLE_ART, height: TITLE_ART },
  // Read: the capybara stands on its top edge like the completed card's, at the
  // right, clear of the play button on the centre line.
  phraseCardCentered: { marginTop: 10, paddingTop: 18 },
  phraseCardHead: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  // Sits on the sentence's last line, centred on the words rather than their baseline.
  phraseCardEn: { ...font.body[700], fontSize: 15, lineHeight: 20, color: colors.muted, textAlign: 'center', marginTop: 4 },
  phraseCardSpeak: { position: 'absolute', right: 14, top: 14 },
  // Listen: one pill, play at one end, the slow button at the other.
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.pill,
    backgroundColor: pastel.butter,
    boxShadow: clay.surface,
  },
  playerPlay: {
    width: 54,
    height: 54,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    boxShadow: clay.button,
  },
  playerWave: { flex: 1, minWidth: 0, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playerBar: { width: 4, borderRadius: 3, backgroundColor: colors.ink },
  playerSlow: {
    width: 46,
    height: 46,
    borderRadius: 99,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.button,
  },
  bubblePhraseEn: { ...font.display[700], fontSize: 20, lineHeight: 28, color: colors.ink },

  // Tips ---------------------------------------------------------------------
  // No panel around the whole tip: the prose sits on the page, and only what
  // is worth a second look (examples, pairs, a table) is a sticker.
  tip: { gap: 16 },
  tipDots: { flexDirection: 'row', gap: 6, paddingLeft: 2 },
  tipDot: { width: 22, height: 7, borderRadius: radius.pill, backgroundColor: colors.stone, boxShadow: clay.trough },
  tipDotOn: { backgroundColor: colors.primary },
  tipLead: { ...font.body[700], fontSize: 21, lineHeight: 29, color: colors.ink },
  tipText: { ...font.body[600], fontSize: 18, lineHeight: 27, color: colors.ink },
  tipStrong: { ...font.body[800], color: colors.primaryDark },
  tipEm: { fontStyle: 'italic' },
  /** The changed ending inside a form: highlighted, the way she would mark it herself. */
  tipMark: { ...font.body[800], backgroundColor: pastel.butter },
  // The outline and shadow are drawn outside the box, so it keeps clear of the next block.
  tipSticker: { borderRadius: 22, backgroundColor: colors.card, boxShadow: clay.surface, overflow: 'hidden', marginBottom: 4 },
  tipExamples: { backgroundColor: pastel.butter },
  tipRowPad: { paddingVertical: 14, paddingHorizontal: 18 },
  tipRowInk: { borderTopWidth: OUTLINE, borderTopColor: colors.ink },
  tipEs: { ...font.display[800], fontSize: 23, lineHeight: 28, letterSpacing: -0.3, color: colors.ink },
  tipEn: { ...font.body[600], fontSize: 16, lineHeight: 22, color: colors.muted, marginTop: 3 },
  tipRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, columnGap: 8 },
  tipRowRule: { borderTopWidth: 2, borderTopColor: colors.border },
  tipHeadRow: { backgroundColor: colors.stone, paddingVertical: 9 },
  tipHead: { ...font.body[800], fontSize: 12.5, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  tipHeadTight: { fontSize: 10.5, letterSpacing: 0.2 },
  tipCell: { ...font.body[700], flex: 1, color: colors.ink },
  tipCellLabel: { ...font.body[600], color: colors.muted },

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
  // A word she may peek at: a dotted rule, quieter than the new word's wash.
  tokenPeek: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.faint,
  },
  // The blank: once a word is in, it just sits in the sentence on an ink
  // underline — no fill. Salvia or coral once it is judged.
  gap: {
    minWidth: 68,
    alignItems: 'center',
    paddingHorizontal: 6,
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
  },
  /** Nothing picked yet: a sunken slot, waiting. */
  gapEmpty: { borderRadius: 12, borderBottomWidth: 0, backgroundColor: colors.trough, boxShadow: clay.trough },
  gapRight: { borderBottomColor: colors.success },
  gapWrong: { borderBottomColor: colors.danger },
  gapText: { ...font.display[800], fontSize: 22, lineHeight: 30, color: colors.ink },
  // Typed into the blank: drawn as the word it will be, as wide as what is
  // typed, and never narrower than the slot, so a tap anywhere on it lands.
  // In the primary while it is still hers to change; ink once it is graded.
  gapInput: {
    ...font.display[800],
    fontSize: 22,
    height: 30,
    minWidth: 56,
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  gapTyping: { borderBottomColor: colors.primary },
  cardGapInput: { fontSize: 30, height: 40 },
  // A bubble's English, under its Spanish line: there to make the gap one
  // answer, so a step quieter than what she is completing.
  bubbleEnUnder: { ...font.body[700], fontSize: 15, lineHeight: 20, color: colors.muted, marginTop: 4 },
  gapLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  gapBank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  // The aside sits a step down from the gloss it explains: lighter, smaller,
  // and never bold — it is context, not the thing being learnt.
  glossNote: { ...font.body[500], fontSize: 14, color: colors.muted, lineHeight: 19 },
  // What sets a meaning apart from another word's: "plural" under "you".
  meaningHint: { ...font.body[500], fontSize: 14, color: colors.muted, lineHeight: 19 },
  peekHint: { ...font.body[600], fontSize: 14, color: colors.muted, textAlign: 'center' },

  playWrap: { alignItems: 'center', gap: 6 },
  playButton: { backgroundColor: colors.primary, borderRadius: radius.pill, padding: 13, boxShadow: clay.button },
  playButtonDead: { backgroundColor: colors.muted, boxShadow: clay.flat },
  playButtonBig: { padding: 18 },
  playButtonSmall: { padding: 9 },
  playButtonOn: { backgroundColor: colors.primaryDark },
  pulse: { position: 'absolute', borderRadius: 99, borderWidth: 2, borderColor: colors.primary },
  // Butter, like the sentence card: what she is asked about is always the yellow card.
  audioPad: {
    borderRadius: radius.xl,
    backgroundColor: pastel.butter,
    boxShadow: clay.surface,
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
    boxShadow: clay.button,
  },
  audioPadCompact: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 14, gap: 14 },
  audioPadWrap: { position: 'relative' },
  // In the pad's corner, clear of the button and its hint.
  audioPadSlow: { position: 'absolute', right: 14, bottom: 14 },
  audioPadSlowCompact: { bottom: undefined, top: '50%', marginTop: -23 },
  audioPadCircleCompact: { width: 56, height: 56, paddingLeft: 3 },
  // Beside the button a long line (a recording that will not load) has to wrap.
  audioPadHintCompact: { flexShrink: 1 },
  audioPadHint: { ...font.body[700], fontSize: 15, color: colors.muted },
  audioProblem: { ...font.body[600], fontSize: 13, color: colors.muted, textAlign: 'center' },

  // Choices ------------------------------------------------------------------
  // The border stays, transparent, so a state's rim never shifts the layout.
  choice: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radius.md,
    boxShadow: FLAT,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  // The outline eats into a small gap, so the options look glued at 10.
  choicesList: { gap: 14 },
  choicesSide: { flexDirection: 'row', gap: 12 },
  choiceSide: { flex: 1, minHeight: 88, borderRadius: radius.lg - 4, alignItems: 'center', justifyContent: 'center' },
  choiceTextSide: { ...font.display[800], fontSize: 22 },
  choicePicked: PICKED,
  choiceRight: { borderColor: colors.success, backgroundColor: colors.successSoft },
  choiceWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  choiceText: { ...font.body[700], fontSize: 17, color: colors.ink, textAlign: 'center' },

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
    boxShadow: FLAT,
  },
  bigChoiceText: { ...font.body[800], fontSize: 17 },

  spanishInput: { gap: 10 },
  accentRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  accentKey: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: FLAT,
  },
  accentText: { ...font.body[800], fontSize: 18, color: colors.ink },
  // In the keyboard: one more row of keys, spaced like the keyboard's own.
  accentBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 6, paddingVertical: 6 },
  // Drawn like the system's keys, not the app's buttons: they belong to the keyboard.
  accentKeyDocked: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 0,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 0 rgba(0, 0, 0, 0.3)',
  },
  typingInput: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    ...font.body[700],
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
  },

  // Tile building ------------------------------------------------------------
  answerArea: { minHeight: TILE_ROW * 2 + 4 },
  answerAreaRuled: { borderTopWidth: 1, borderTopColor: colors.trough, paddingTop: 4 },
  // A sunken well the tiles drop into.
  answerAreaBoxed: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    justifyContent: 'center',
    minHeight: 72,
    padding: 8,
  },
  answerRule: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.trough },
  answerTiles: { flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: 8 },
  answerPlaceholder: { ...font.body[600], color: colors.muted, fontSize: 15, alignSelf: 'center' },
  tileBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tile: {
    minWidth: 54,
    height: 50,
    paddingHorizontal: 16,
    // Rounded clay block, not a pill: a row of pills reads as loose beads, and
    // the words have to line up like something she is building a sentence out of.
    // The border stays, transparent, so state rims never change a tile's size.
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: FLAT,
  },
  // An empty slot while its tile is in the air: the outline stays so nothing
  // reflows mid-flight, but it reads as a gap rather than as a tile.
  tileInFlight: { backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none' },
  tileFlying: { position: 'absolute', zIndex: 10 },
  tileFolded: { position: 'absolute', opacity: 0 },
  // Held: manteca, lifted off the page rather than on it, so it reads as
  // picked up and not as one more tile sitting in the row.
  tileHeld: {
    zIndex: 20,
    backgroundColor: pastel.butter,
    boxShadow: clay.float,
  },
  // Where a tile came from: a pressed-in hollow of its shape. Sunk below the
  // page with a faint rim, never white with an ink outline — that reads as a
  // blank tile still waiting to be used.
  tileTaken: {
    backgroundColor: colors.stone,
    boxShadow: clay.flat,
  },
  tileText: { ...font.body[800], fontSize: 19, color: colors.ink },
  // The smaller cut a long sentence is dealt in (DENSE_FROM).
  tileDense: { minWidth: 46, height: 44, paddingHorizontal: 12, borderRadius: 16 },
  tileTextDense: { fontSize: 17 },
  tilesDense: { gap: 6 },

  // Matching -----------------------------------------------------------------
  matchGrid: { flexDirection: 'row', gap: 10 },
  matchColumn: { flex: 1, gap: 10 },
  matchCell: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.card,
    boxShadow: FLAT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  matchCellPicked: PICKED,
  matchCellDone: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
    opacity: 0.75,
  },
  matchText: { ...font.body[800], fontSize: 16, color: colors.ink, textAlign: 'center' },
  matchHint: { ...font.body[500], fontSize: 12.5, color: colors.muted, textAlign: 'center', marginTop: 1 },

});

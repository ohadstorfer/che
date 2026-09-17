import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ExerciseFrame, type Verdict } from '@/components/exercise-frame';
import { WrongAnswerActions } from '@/components/wrong-answer-actions';
import { Panel } from '@/components/ui';
import { type Anchor, WordPopover, measureAnchor } from '@/components/word-popover';
import { playAudio, stopAudio, type AudioFailure } from '@/lib/audio';
import {
  builtAnswerMatches,
  gapOptions,
  isCanonical,
  isPhrase,
  meaningOptions,
  missedForms,
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
  gradeTyped,
  labelOf,
  meaningOf,
  type Note,
} from '@/lib/answers';
import type { AnswerExtra, QueueItem } from '@/lib/round';
import { RUNG_BUILD_AT } from '@/lib/sentences';
import { SETTLED_DAYS, buildTiles, wordPool } from '@/lib/session';
import { colors, radius, shadow } from '@/lib/theme';
import type { Form, Sentence, Tip } from '@/lib/types';

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

type Answered = (wrongFormIds: string[], extra?: AnswerExtra) => void;
type Single = (correct: boolean, extra?: AnswerExtra) => void;

/** The label a harder exercise wears (learning-engine-spec §6.5). */
function badgeFor(item: QueueItem): string | undefined {
  if (item.isIntro || item.isRetry || item.placementUnit) return undefined;
  if (item.promoted || item.mode === 'typing') return 'Harder';
  if ((item.mode === 'sentence_build' || item.mode === 'sentence_listen') && item.sentence) {
    // Only while the rung is new to her: the first builds of a sentence.
    return (item.sentence.shown?.correct_count ?? 0) <= RUNG_BUILD_AT ? 'Harder' : undefined;
  }
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
  const wrong = props.verdict && !props.verdict.correct;
  return (
    <ExerciseFrame
      {...props}
      badge={item ? badgeFor(item) : undefined}
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
 * where a beginner stalls — but not on a lesson's new material, and not in a
 * placement test, where the whole point is to find out what she already knows.
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
}) {
  return (
    <ItemContext.Provider value={item}>
      <ExerciseBody
        item={item}
        allForms={allForms}
        allSentences={allSentences}
        onIntroDone={onIntroDone}
        onAnswered={onAnswered}
        hints={!!hints}
        lexicon={lexicon}
      />
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
      return (
        <SentenceGap
          item={item}
          allForms={allForms}
          onAnswered={onAnswered}
          canTap={canTap}
          lexicon={lexicon}
        />
      );
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

function Intro({ form, onDone }: { form: Form; onDone: () => void }) {
  const phrase = isPhrase(form.form);
  return (
    <Frame
      prompt={phrase ? '✨ New phrase' : '✨ New word'}
      verdict={null}
      canCheck
      checkLabel="Got it"
      onCheck={onDone}
      onContinue={onDone}>
      <Panel style={styles.bigCard}>
        <Text style={phrase ? styles.esPhraseHero : styles.esHero}>{form.form}</Text>
        <View style={styles.divider} />
        <Text style={phrase ? styles.enPhrase : styles.enBig}>{meaningOf(form)}</Text>
        {/* The aside lives here, where the word is being taught — it explains
            what the gloss can only name ("mate" → the drink). */}
        {form.gloss_note_en ? <Text style={styles.glossNote}>{form.gloss_note_en}</Text> : null}
        {form.audio_path ? <PlayButton path={form.audio_path} big /> : null}
      </Panel>
    </Frame>
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
    <Frame
      prompt={`💡 ${tip.title_en}`}
      verdict={null}
      canCheck
      checkLabel="Got it"
      onCheck={onDone}
      onContinue={onDone}>
      <Panel style={styles.tip}>
        {paragraphs.map((para, i) => (
          <Text key={i} style={styles.tipText}>
            {inlineMarkdown(para)}
          </Text>
        ))}
      </Panel>
    </Frame>
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

export function PlayButton({ path, big }: { path: string; big?: boolean }) {
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
        accessibilityLabel={playing ? 'Playing' : problem ? AUDIO_PROBLEM[problem] : 'Listen'}
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

export function SpeechBubble({ children }: { children: React.ReactNode }) {
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
            <Text style={phrase ? styles.bubblePhraseEn : styles.bubbleEn}>{meaningOf(form)}</Text>
          )}
        </View>
      </View>
    </SpeechBubble>
  );
}

export function Choices({
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
  onAnswer: Single;
}) {
  const { form } = item;
  const askSpanish = item.direction === 'es_to_en';
  const answerField = askSpanish ? 'gloss_en' : 'form';
  // Randomised content is generated exactly once per exercise: a `useMemo`
  // may legitimately re-run, and a reshuffle mid-answer would grade her
  // against options she never saw.
  const [options] = useState(() =>
    pickOptions(form, allForms, answerField).map((c) => ({ id: c.id, label: labelOf(c, answerField) })),
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const phrase = isPhrase(form.form);
  const prompt = askSpanish
    ? phrase
      ? 'What does this phrase mean?'
      : 'What does it mean?'
    : phrase
      ? 'How do you say this phrase in Argentine Spanish?'
      : 'How do you say it in Argentine Spanish?';

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
  const [options] = useState(() =>
    pickOptions(form, allForms, 'gloss_en').map((c) => ({ id: c.id, label: meaningOf(c) })),
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  return (
    <Frame
      prompt="What does what you hear mean?"
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({
          correct: chosen === form.id,
          answer: `${form.form} — ${meaningOf(form)}`,
          about: form.gloss_note_en ?? undefined,
        })
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
    </Frame>
  );
}

/** The tap-to-listen panel used by the two audio-first exercises. */
export function AudioPad({ path }: { path: string }) {
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
        {problem ? AUDIO_PROBLEM[problem] : playing ? 'Playing…' : 'Tap to listen'}
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
  onAnswer: Single;
}) {
  const { form } = item;
  const [picked, setPicked] = useState<boolean | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  // Half the time we show the real meaning, half an imposter's.
  const [{ shown, isTrue }] = useState(() => {
    const imposter = pickImposter(form, allForms);
    if (!imposter || Math.random() < 0.5) return { shown: meaningOf(form), isTrue: true };
    return { shown: meaningOf(imposter), isTrue: false };
  });

  return (
    <Frame
      prompt={item.isRetry ? '🔁 Does it mean this?' : 'Does it mean this?'}
      verdict={verdict}
      canCheck={picked !== null}
      onCheck={() =>
        setVerdict({
          correct: picked === isTrue,
          answer: isTrue ? undefined : `«${form.form}» es «${meaningOf(form)}»`,
          about: form.gloss_note_en ?? undefined,
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
          { label: 'Yes', value: true, icon: 'checkmark' as const, tone: colors.success },
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
            <Text style={styles.answerPlaceholder}>tap the tiles…</Text>
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
  onAnswer: Single;
}) {
  const { form } = item;
  const phrase = isPhrase(form.form);
  const toSpanish = item.direction === 'en_to_es';
  const field = toSpanish ? 'form' : 'gloss_en';
  const target = labelOf(form, field);

  const [{ tiles }] = useState(() => buildTiles(target, wordPool(form, allForms, field)));
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const joined = used.map((i) => tiles[i]).join(phrase ? ' ' : '');
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
        ruled={phrase}
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
  const [{ tiles }] = useState(() =>
    buildTiles(form.form, wordPool(form, allForms, 'form')),
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
      <AudioPad path={form.audio_path!} />
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
    });
  };

  return (
    <Frame
      prompt="Type it in Argentine Spanish"
      verdict={verdict}
      canCheck={!!input.trim()}
      onCheck={check}
      answer={input.trim()}
      onContinue={() =>
        onAnswer(!!verdict?.correct, { answer: input.trim(), note: graded?.note })
      }>
      <PromptBlock form={form} side="en" />
      <TextInput
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        placeholder="your answer…"
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
    </Frame>
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
  onAnswered: Answered;
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
          // The pairs she got wrong, each with its aside — the reveal is the
          // one place in this exercise where a note can't give anything away.
          answer: group
            .filter((c) => missed.has(c.id))
            .map((c) => `${c.form} = ${meaningOf(c)}${c.gloss_note_en ? ` (${c.gloss_note_en})` : ''}`)
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
    <Frame
      prompt="Match each word to its meaning"
      verdict={verdict}
      note={`${matched.size} of ${group.length} matched`}
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
                  {meaningOf(c)}
                </Text>
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
}: {
  sentence: Sentence;
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
  /** Token to replace with a blank, and what she has put in it so far. */
  blank?: { index: number; filled?: string; tone?: 'right' | 'wrong' };
}) {
  // Measured on tap, never cached: a word only reflows when the sentence
  // rewraps, which fires no layout event, so a remembered rect goes stale.
  const nodes = useRef<Record<number, unknown>>({});
  const tapWord = (i: number, formId: string) =>
    measureAnchor(nodes.current[i], (a) => a && onWord?.(formId, a, sentence.tokens[i]?.gloss));
  const canTap = (id: string) => !!onWord && (tappable?.(id) ?? true);

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
                <Text style={[styles.bubblePhrase, styles.tokenNewText]}>{t.surface}</Text>
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
                <Text style={[styles.bubblePhrase, styles.tokenPeek]}>{t.surface}</Text>
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
  const words = useWordPopover(lookupWith(lexicon, allForms));
  const [options] = useState(() => meaningOptions(sentence, allSentences, allForms));
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  // On a screen that introduces a word, only that word answers to a tap — the
  // rest is material she is meant to already have. Otherwise every word does,
  // except the one whose meaning is the answer.
  const tappable = word ? (id: string) => id === word.id : (id: string) => id !== item.form.id;

  const prompt = word
    ? '✨ New word: what does the sentence say?'
    : item.isRetry
      ? '🔁 What does the sentence say?'
      : 'What does the sentence say?';

  return (
    <Frame
      prompt={prompt}
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() => setVerdict({ correct: chosen === sentence.id, answer: sentence.en })}
      onContinue={() =>
        onAnswered(verdict?.correct ? [] : [(word ?? item.form).id], { hinted: words.peeked })
      }>
      <SpeechBubble>
        <View style={styles.bubbleRow}>
          <SentenceLine
            sentence={sentence}
            mark={word?.id}
            onWord={word || canTap ? words.open : undefined}
            tappable={tappable}
          />
        </View>
      </SpeechBubble>
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
  canTap,
  lexicon,
}: {
  item: QueueItem;
  allForms: Form[];
  onAnswered: Answered;
  canTap: boolean;
  lexicon?: Map<string, Form>;
}) {
  const sentence = item.sentence!;
  const target = item.form;
  const words = useWordPopover(lookupWith(lexicon, allForms));
  const [index] = useState(() => tokenIndexOf(sentence, target.id));
  const [options] = useState(() => gapOptions(sentence, target, allForms));
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const filled = options.find((o) => o.id === chosen)?.label;
  const answer = index >= 0 ? tokenWord(sentence.tokens[index]) : target.form;

  return (
    <Frame
      prompt={item.isRetry ? '🔁 Complete the sentence' : 'Complete the sentence'}
      verdict={verdict}
      canCheck={!!chosen}
      onCheck={() =>
        setVerdict({ correct: chosen === target.id, answer: `${answer} — ${sentence.en}` })
      }
      onContinue={() => onAnswered(verdict?.correct ? [] : [target.id], { hinted: words.peeked })}>
      <SpeechBubble>
        <View style={styles.bubbleRow}>
          <SentenceLine
            sentence={sentence}
            onWord={canTap ? words.open : undefined}
            blank={{
              index,
              filled,
              tone: verdict ? (verdict.correct ? 'right' : 'wrong') : undefined,
            }}
          />
        </View>
      </SpeechBubble>
      <WordBubble state={words.showing} onClose={words.close} />
      <Text style={styles.gapEn}>{sentence.en}</Text>
      <Choices
        options={options}
        correctId={target.id}
        chosen={chosen}
        revealed={verdict !== null}
        onPick={setChosen}
      />
    </Frame>
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
  onAnswered: Answered;
  byEar?: boolean;
}) {
  const sentence = item.sentence!;
  const [{ tiles }] = useState(() => sentenceTiles(sentence, allForms));
  const [used, setUsed] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);

  const placed = used.map((i) => tiles[i]);

  return (
    <Frame
      prompt={byEar ? 'What does the audio say?' : 'Translate this sentence'}
      verdict={verdict}
      canCheck={used.length > 0}
      onCheck={() =>
        setVerdict({
          correct: sentenceAnswerMatches(placed, sentence, { byEar }),
          answer: `${sentence.es} — ${sentence.en}`,
          // Right, but not the sentence as written: show that one too.
          also: isCanonical(placed, sentence) ? undefined : sentence.es,
        })
      }
      answer={placed.join(' ')}
      onContinue={() =>
        onAnswered(verdict?.correct ? [] : missedForms(sentence, placed, allForms), {
          answer: placed.join(' '),
        })
      }>
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
    </Frame>
  );
}

const styles = StyleSheet.create({
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
  // A word she may peek at: a dotted rule, quieter than the new word's wash.
  tokenPeek: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.faint,
  },
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
  // The aside sits a step down from the gloss it explains: lighter, smaller,
  // and never bold — it is context, not the thing being learnt.
  glossNote: { fontSize: 14, color: colors.muted, lineHeight: 19 },
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

});

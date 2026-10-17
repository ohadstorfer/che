import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, type VideoPlayer, VideoView } from 'expo-video';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Keyframe,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { MASCOT_NAME, MascotSays, pop, type Pose, POSE, SpeechBubble } from '@/components/mascot';
import { EASE_OUT, IconButton, ProgressBar, rise, slide } from '@/components/onboarding-ui';
import { type Provider, SocialButtons } from '@/components/social-buttons';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { startGuest } from '@/lib/guest';
import { success, tap } from '@/lib/haptics';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import {
  achieveRows,
  ART,
  type Art,
  type Answers,
  COURSE_CLIP,
  courseMoments,
  buildPlan,
  formatShortDate,
  LEVEL,
  mainWhy,
  MINUTES,
  type Level,
  nameTail,
  reminderLine,
  resetWinbackShown,
  saveAnswers,
  speaksSpanish,
  type Struggle,
  struggleQuestion,
  type TryIt,
  tryIt,
  type Why,
  WHY,
  WORDS_OF_DAY,
} from '@/lib/onboarding';
import { askNotifyPermission } from '@/lib/notify-permission';
import { type SocialResult, signInWithApple, signInWithGoogle } from '@/lib/social-auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, pastel, radius, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Onboarding — the carpincho asks four questions, shows her one surprise,
// builds a plan from the answers. Then the paywall, and only after it the
// account that keeps the plan (on the Ready screen; lib/guest.ts says why).
//
// The order is the argument: why she's here (so the plan speaks her life),
// where she starts, a moment that shows what makes Che different (tú → vos),
// when she needs it and how much time she has — then the plan, visibly made
// for her, which is the thing the account saves and the paywall unlocks.
// Every answer gets a reply from him before she moves on, so a choice is a
// line of conversation, not a form field.
// ---------------------------------------------------------------------------

type Step = 'name' | 'level' | 'why' | 'try' | 'struggle' | 'achieve' | 'goal' | 'notify' | 'building' | 'pledge' | 'account';
const STEPS: Step[] = ['name', 'level', 'why', 'try', 'struggle', 'achieve', 'goal', 'notify', 'building', 'pledge', 'account'];
/** Steps that count on the progress bar; the builder and what follows sit past it. */
const COUNTED = STEPS.indexOf('building');

export default function Onboarding() {
  useStatusBarColor(colors.bg);
  // Staff replay it from the admin screen while signed in: the account step is
  // skipped (there is already one), and the one-time offer is shown again.
  const { session } = useAuth();
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  useEffect(() => {
    if (replay) void resetWinbackShown();
  }, [replay]);
  const reduced = useReducedMotion();
  const pancho = useVideoPlayer(PANCHO_CLIP, (p) => {
    p.muted = true;
    p.loop = true;
    p.audioMixingMode = 'mixWithOthers';
  });
  useEffect(() => {
    if (reduced) pancho.pause();
    else pancho.play();
  }, [pancho, reduced]);
  const [step, setStep] = useState<Step>('name');
  const [dir, setDir] = useState<1 | -1>(1);
  const [a, setA] = useState<Partial<Answers>>({ minutes: 10, name: '' });
  // The daily goal starts on 10 so the button works at once, but he only
  // replies once she has actually touched it.
  const [goalTouched, setGoalTouched] = useState(false);

  const index = STEPS.indexOf(step);
  const go = (to: Step, d: 1 | -1 = 1) => {
    setDir(d);
    setStep(to);
  };
  const next = () => go(STEPS[Math.min(index + 1, STEPS.length - 1)]);
  const back = () => {
    if (index === 0) return router.canGoBack() ? router.back() : router.replace('/welcome');
    // The builder is a moment, not a place: back from the pledge skips it.
    const prev = STEPS[index - 1] === 'building' ? STEPS[index - 2] : STEPS[index - 1];
    go(prev, -1);
  };

  // Paywall first, account after: she is a guest by now, or signed in (staff
  // replaying it). If no guest could be made — anonymous sign-ins switched
  // off, no connection — the account step comes first, as it used to.
  const afterPledge = async () => {
    if (session || (await startGuest())) router.replace('/paywall?from=onboarding');
    else next();
  };

  const choose = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    tap();
    setA((cur) => ({ ...cur, [key]: value }));
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      back();
      return true;
    });
    return () => sub.remove();
  });

  const entering = slide(dir, reduced);
  const complete = a as Answers;
  const showChrome = step !== 'building';

  return (
    <PanchoPlayer.Provider value={reduced ? null : pancho}>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, !showChrome && { opacity: 0 }]} pointerEvents={showChrome ? 'auto' : 'none'}>
          <IconButton icon="chevron-back" label="Back" onPress={back} />
          {index < COUNTED ? <ProgressBar value={(index + 1) / (COUNTED + 1)} /> : <View style={{ flex: 1 }} />}
          <View style={{ width: 36 }} />
        </View>

        <Animated.View key={step} entering={entering} style={{ flex: 1 }}>
          {step === 'name' ? (
            <NameStep name={a.name ?? ''} reduced={reduced} onChange={(name) => setA((cur) => ({ ...cur, name }))} onNext={next} />
          ) : step === 'level' ? (
            <Question
              line={a.level ? (LEVEL.find((o) => o.value === a.level)?.react ?? '') : `How much Spanish do you know${nameTail(a)}?`}
              answered={!!a.level}
              reduced={reduced}
              onNext={next}>
              {LEVEL.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <Choice label={o.label} tone={o.tone} bars={o.bars} selected={a.level === o.value} onPress={() => choose('level', o.value)} />
                </Animated.View>
              ))}
            </Question>
          ) : step === 'why' ? (
            <Question line={whyLine(a)} answered={!!a.whys?.length} hint="Pick all that apply" reduced={reduced} onNext={next}>
              {WHY.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <Choice
                    label={o.label}
                    tone={o.tone}
                    art={o.art}
                    multi
                    selected={!!a.whys?.includes(o.value)}
                    onPress={() => {
                      tap();
                      setA((cur) => {
                        const had = cur.whys ?? [];
                        const whys = had.includes(o.value) ? had.filter((w) => w !== o.value) : [...had, o.value];
                        return { ...cur, whys, why: whys.length ? mainWhy(whys) : undefined };
                      });
                    }}
                  />
                </Animated.View>
              ))}
            </Question>
          ) : step === 'try' ? (
            <TryItStep line={tryIt(complete)} reduced={reduced} onNext={next} />
          ) : step === 'struggle' ? (
            <StruggleStep
              level={complete.level}
              picked={a.struggle ?? []}
              reduced={reduced}
              onChange={(struggle) => setA((cur) => ({ ...cur, struggle }))}
              onNext={next}
            />
          ) : step === 'achieve' ? (
            <AchieveStep answers={complete} reduced={reduced} onNext={next} />
          ) : step === 'goal' ? (
            <Question
              line={goalTouched ? (MINUTES.find((o) => o.value === a.minutes)?.react ?? '') : 'How much time a day?'}
              answered
              reduced={reduced}
              onNext={next}>
              {MINUTES.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <Choice
                    label={`${o.value} min a day`}
                    tone={o.tone}
                    glyph={String(o.value)}
                    tag={o.label}
                    selected={a.minutes === o.value}
                    onPress={() => {
                      setGoalTouched(true);
                      choose('minutes', o.value);
                    }}
                  />
                </Animated.View>
              ))}
            </Question>
          ) : step === 'notify' ? (
            <NotifyStep
              answers={complete}
              reduced={reduced}
              onDone={(reminder) => {
                setA((cur) => ({ ...cur, reminder }));
                next();
              }}
            />
          ) : step === 'building' ? (
            <Building
              answers={complete}
              reduced={reduced}
              onReady={() => {
                // Her guest account, made while she reads the result: the
                // paywall after the pledge sells to it (lib/guest.ts).
                void saveAnswers(complete).then(() => startGuest());
                success();
              }}
              onNext={next}
            />
          ) : step === 'pledge' ? (
            <Pledge answers={complete} reduced={reduced} onNext={() => void afterPledge()} />
          ) : (
            <Account answers={complete} reduced={reduced} />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </PanchoPlayer.Provider>
  );
}

// --- a question, asked by him ----------------------------------------------

/** His line for the reasons question: the question, then his reply to the
 *  last pick, or one line for a mix. */
function whyLine(a: Partial<Answers>): string {
  const whys = a.whys ?? [];
  if (!whys.length) return 'What brings you to Argentine Spanish?';
  if (whys.length > 1) return 'Good mix. I’ll start with what matters most.';
  const o = WHY.find((x) => x.value === whys[0])!;
  return a.level && speaksSpanish(a.level) ? o.reactSpeaker : o.react;
}

/**
 * He asks in the bubble; once she answers, the bubble becomes his reply.
 * Continue waits for an answer.
 */
function Question({
  line,
  answered,
  hint,
  reduced,
  onNext,
  children,
}: {
  line: string;
  answered: boolean;
  hint?: string;
  reduced: boolean;
  onNext: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Says line={line} small={answered && line.length > 36} reduced={reduced} />
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        <View style={{ gap: 18 }}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={onNext} disabled={!answered} />
      </View>
    </View>
  );
}

/** One answer: a coloured coin with its picture (or level bars, or a number),
 *  the label, and a square check. Picked, the row turns manteca. */
function Choice({
  label,
  tone,
  art,
  bars,
  glyph,
  tag,
  multi,
  selected,
  onPress,
}: {
  label: string;
  tone: string;
  art?: Art;
  bars?: number;
  glyph?: string;
  tag?: string;
  multi?: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        if (!multi) tap();
        onPress();
      }}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      style={({ pressed }) => [styles.choice, selected && styles.choiceOn, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <View style={[styles.coin, { backgroundColor: selected ? colors.card : tone }]}>
        {art ? (
          <Image source={ART[art]} style={styles.coinArt} contentFit="contain" accessible={false} />
        ) : bars ? (
          <View style={styles.bars}>
            {[1, 2, 3, 4].map((k) => (
              <View
                key={k}
                style={[styles.bar, { height: 6 + k * 4, backgroundColor: k <= bars ? (selected ? colors.primary : colors.ink) : 'rgba(58,42,32,0.2)' }]}
              />
            ))}
          </View>
        ) : glyph ? (
          <Text style={styles.coinGlyph}>{glyph}</Text>
        ) : null}
      </View>
      <Text style={styles.choiceLabel}>{label}</Text>
      {tag ? (
        <View style={[styles.choiceTag, { backgroundColor: selected ? colors.card : pastel.butter }]}>
          <Text style={styles.choiceTagText}>{tag}</Text>
        </View>
      ) : null}
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? <MaterialCommunityIcons name="check-bold" size={15} color={colors.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

// --- him, saying one thing ---------------------------------------------------

/** His figure and a bubble whose words change in place: no pop on every
 *  keystroke or tap, the way MascotSays (keyed by its line) would. */
const PANCHO = require('@/assets/images/onboarding/pancho-mate.png');
/** The same figure, slowly sipping and pouring (social/out/pancho-loop). One
 *  player for the whole flow, so the loop carries on from screen to screen. */
const PANCHO_CLIP = require('@/assets/videos/onboarding/pancho-mate.mp4');
const PanchoPlayer = createContext<VideoPlayer | null>(null);

function Says({ pose, line, small }: { pose?: Pose; line: string; small?: boolean; reduced?: boolean }) {
  const player = useContext(PanchoPlayer);
  return (
    <View style={styles.saysRow}>
      {pose || !player ? (
        <Image source={pose ? POSE[pose] : PANCHO} style={styles.saysArt} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} the carpincho`} />
      ) : (
        <View style={styles.saysArt} accessible accessibilityRole="image" accessibilityLabel={`${MASCOT_NAME} the carpincho, drinking mate`}>
          {/* The still sits underneath until the first frame is up. */}
          <Image source={PANCHO} style={StyleSheet.absoluteFill} contentFit="contain" />
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture={false}
            surfaceType="textureView"
          />
        </View>
      )}
      <View style={styles.saysBubble}>
        <SpeechBubble>
          <Text style={[styles.saysText, small && styles.saysTextSmall]} accessibilityRole="header" accessibilityLiveRegion="polite">
            {line}
          </Text>
        </SpeechBubble>
      </View>
    </View>
  );
}

// --- name: he asks, she answers, and he uses it from here on ----------------

function NameStep({
  name,
  reduced,
  onChange,
  onNext,
}: {
  name: string;
  reduced: boolean;
  onChange: (name: string) => void;
  onNext: () => void;
}) {
  const has = name.trim().length > 0;
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Says line={has ? `Nice to meet you, ${name.trim()}!` : 'What’s your name?'} reduced={reduced} />
        <Animated.View entering={rise(1, reduced)} style={styles.nameCard}>
          <Text style={styles.nameLabel}>Me llamo…</Text>
          <TextInput
            value={name}
            onChangeText={(v) => onChange(v.slice(0, 40))}
            placeholder="Your name"
            placeholderTextColor={colors.faint}
            autoComplete="given-name"
            textContentType="givenName"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => has && onNext()}
            style={styles.nameInput}
            accessibilityLabel="Your name"
          />
        </Animated.View>
      </ScrollView>
      <View style={[styles.footer, { gap: 4 }]}>
        <Button title="Continue" onPress={onNext} disabled={!has} />
        <Pressable
          onPress={() => {
            onChange('');
            onNext();
          }}
          hitSlop={6}
          accessibilityRole="button"
          style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- try it: the one demo. She makes a textbook line sound like Buenos Aires --

const WORD_TILT = ['-3deg', '2.5deg', '-2deg', '3deg'];

/** The canvas sun, half off the right edge behind the line. */
function Sun() {
  return (
    <Svg width={330} height={330} viewBox="-100 -100 200 200" style={styles.sun} pointerEvents="none">
      <G fill={pastel.butter}>
        <Circle r={42} />
        {Array.from({ length: 16 }, (_, i) => (
          <Path key={i} transform={`rotate(${i * 22.5})`} d="M -5.5 -47 L 0 -98 L 5.5 -47 Z" />
        ))}
      </G>
    </Svg>
  );
}

/** A dashed line under a word still to tap; solid rosa when it's one of hers. */
function Underline({ marked }: { marked: boolean }) {
  return (
    <Svg height={3} width="100%" style={styles.underline} pointerEvents="none">
      <Line
        x1="0"
        y1="1.5"
        x2="100%"
        y2="1.5"
        stroke={marked ? colors.primary : 'rgba(58,42,32,0.26)'}
        strokeWidth={3}
        strokeDasharray={marked ? undefined : '6 4'}
      />
    </Svg>
  );
}

function TryItStep({ line, reduced, onNext }: { line: TryIt; reduced: boolean; onNext: () => void }) {
  // Not a test: Pancho says how many words give the textbook away, and one
  // press turns them all into the Buenos Aires ones together.
  const [done, setDone] = useState(false);
  const says = done ? line.done : line.start;
  const length = Math.max(line.book.join(' ').length, line.local.join(' ').length);
  const size = length <= 22 ? 38 : length <= 30 ? 33 : 28;
  const text = { fontSize: size, lineHeight: size + 12 };

  const reveal = () => {
    setDone(true);
    success();
  };

  return (
    <View style={{ flex: 1 }}>
      <Sun />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Says line={says} small={says.length > 44} reduced={reduced} />
        <View style={styles.tryMiddle}>
          <Animated.View entering={rise(1, reduced)} style={styles.tryCard} accessibilityLabel={done ? line.local.join(' ') : line.book.join(' ')}>
            {line.book.map((word, k) => {
              const order = line.targets.indexOf(k);
              const fixed = done && order >= 0;
              return (
                <View
                  key={k}
                  style={[styles.tryWord, fixed && [styles.tryWordFixed, { transform: [{ rotate: WORD_TILT[order % 4] }] }]]}>
                  {fixed ? (
                    // One after another, left to right, so the eye follows the sentence changing.
                    <Animated.Text
                      entering={reduced ? undefined : ZoomIn.duration(260).delay(order * 90).easing(EASE_OUT)}
                      style={[styles.tryText, text]}>
                      {line.local[k]}
                    </Animated.Text>
                  ) : (
                    <Text style={[styles.tryText, text]}>{word}</Text>
                  )}
                  {!done && order >= 0 ? <Underline marked /> : null}
                </View>
              );
            })}
          </Animated.View>
          <Text style={styles.tryEn}>{line.en}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={done ? 'Continue' : 'Make it Argentine'} onPress={done ? onNext : reveal} />
      </View>
    </View>
  );
}

// --- struggle: what got in the way, as many as apply ---------------------------

function StruggleStep({
  level,
  picked,
  reduced,
  onChange,
  onNext,
}: {
  level: Level;
  picked: Struggle[];
  reduced: boolean;
  onChange: (picked: Struggle[]) => void;
  onNext: () => void;
}) {
  const q = struggleQuestion(level);
  const last = q.options.find((o) => o.value === picked[picked.length - 1]);
  const toggle = (v: Struggle) => {
    tap();
    // "Nothing" stands alone: picking it clears the rest, and the rest clear it.
    if (picked.includes(v)) return onChange(picked.filter((x) => x !== v));
    onChange(v === 'none' ? ['none'] : [...picked.filter((x) => x !== 'none'), v]);
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Says line={last ? last.react : q.en} small={!!last} reduced={reduced} />
        <Text style={styles.hint}>Pick all that apply</Text>
        <View style={{ gap: 18 }} accessibilityLabel={q.en}>
          {q.options.map((o, i) => (
            <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
              <Choice label={o.label} tone={o.tone} art={o.art} multi selected={picked.includes(o.value)} onPress={() => toggle(o.value)} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={onNext} disabled={picked.length === 0} />
      </View>
    </View>
  );
}

// --- achieve: three stickers, results in her words -------------------------------

const ACHIEVE_TILT = ['-1.2deg', '0.9deg', '-0.7deg'];

function AchieveStep({ answers, reduced, onNext }: { answers: Answers; reduced: boolean; onNext: () => void }) {
  const rows = achieveRows(answers);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Says line={`Here’s what you can achieve${nameTail(answers)}.`} reduced={reduced} />
        <View style={styles.achieveList}>
          {rows.map((r, i) => (
            <Animated.View
              key={r.text}
              entering={rise(i + 2, reduced)}
              style={[styles.achieveRow, { backgroundColor: r.tone, transform: [{ rotate: ACHIEVE_TILT[i] }] }]}>
              <View style={styles.achieveCoin}>
                {r.art ? (
                  <Image source={ART[r.art]} style={styles.achieveArt} contentFit="contain" accessible={false} />
                ) : (
                  <Text style={styles.achieveGlyph}>{r.glyph}</Text>
                )}
              </View>
              <Text style={styles.achieveText}>{r.text}</Text>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="That’s what I want" onPress={onNext} />
      </View>
    </View>
  );
}

// --- notifications: the nudge she'll get, then the phone's own question ----------

const DAYS = ['Mon', 'Tue', 'Wed'];
/** When each word gives way to the next, in ms: a day apart, as it would be. */
const WORD_CUTS = [2300, 3500];

// The screen plays out as the canvas does: the reminder lands, the word of the
// day a beat later, and once the words have turned over, the phone's question.
const NOTE_IN = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -14 }, { scale: 0.96 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }], easing: EASE_OUT },
});
const ASK_IN = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 10 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
});
/** A notification arriving: down from the top, as the phone shows one. */
const noteIn = (ms: number, reduced: boolean) => (reduced ? FadeIn.duration(200) : NOTE_IN.delay(ms).duration(420));
const ASK_AT = 4300;
/** Allow starts calling once the question has settled. */
const NUDGE_AT = 4700;

/** A notification as the lock screen draws it: frosted, the app's icon, a line. */
function Ping({ title, when, children }: { title: string; when: string; children: React.ReactNode }) {
  return (
    <View style={styles.ping}>
      <Image source={require('@/assets/images/icon.png')} style={styles.pingIcon} accessible={false} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.pingTop}>
          <Text style={styles.pingTitle}>{title}</Text>
          <Text style={styles.pingWhen}>{when}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

/** The ring around Allow: it breathes in time with the arrow. */
function PulseRing({ reduced }: { reduced: boolean }) {
  const o = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    o.value = withDelay(
      NUDGE_AT,
      withRepeat(withSequence(withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })), -1),
    );
    return () => cancelAnimation(o);
  }, [reduced, o]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.promptRing, pulse]} pointerEvents="none" />;
}

/** The arrow under Allow: it starts bobbing once she has had time to read. */
function BobArrow({ reduced }: { reduced: boolean }) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    y.value = withDelay(
      NUDGE_AT,
      withRepeat(withSequence(withTiming(-6, { duration: 550, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 550, easing: Easing.inOut(Easing.ease) })), -1),
    );
    return () => cancelAnimation(y);
  }, [reduced, y]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.promptArrow, bob]} pointerEvents="none" accessible={false}>
      <Svg width={26} height={30} viewBox="0 0 26 30" fill="none" stroke={colors.primary} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M13 27V4M4 13l9-9 9 9" />
      </Svg>
    </Animated.View>
  );
}

function NotifyStep({ answers, reduced, onDone }: { answers: Answers; reduced: boolean; onDone: (granted: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const words = WORDS_OF_DAY[answers.level];
  // The word card stays and its word changes: the next day's comes in as the
  // last one goes. Reduced motion shows the first day only.
  const [day, setDay] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timers = WORD_CUTS.map((ms, i) => setTimeout(() => setDay(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);
  const [word, gloss] = words[day];

  const ask = async () => {
    if (busy) return;
    setBusy(true);
    const granted = await askNotifyPermission();
    setBusy(false);
    onDone(granted);
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Says line="Let me send you notifications, so Spanish becomes a habit." reduced={reduced} />
        <View style={{ flex: 1, minHeight: 16 }} />
        <Animated.View entering={noteIn(300, reduced)}>
          <Ping title="Time for your Spanish" when="now">
            <Text style={styles.pingBody}>{reminderLine(answers)}</Text>
          </Ping>
        </Animated.View>
        <Animated.View entering={noteIn(1100, reduced)} style={{ marginTop: 8 }}>
          <Ping title="Word of the day" when={DAYS[day]}>
            <Animated.Text key={day} entering={day === 0 ? undefined : FadeIn.duration(260)} style={styles.pingBody} numberOfLines={1}>
              {word}: {gloss}
            </Animated.Text>
          </Ping>
        </Animated.View>

        {/* The phone's own question, drawn, with Allow pointed out: what she
            is about to see, and which button keeps him knocking. Its Allow
            asks for real, the same as Continue. */}
        <Animated.View entering={reduced ? FadeIn.duration(200) : ASK_IN.delay(ASK_AT).duration(380)} style={styles.prompt}>
          <View style={styles.promptCard}>
            <Text style={styles.promptTitle} accessible={false}>
              “Posta” Would Like to Send You Notifications
            </Text>
            <View style={styles.promptRow}>
              <Text style={[styles.promptButton, styles.promptLeft]} accessible={false}>
                Don’t Allow
              </Text>
              <Pressable
                onPress={() => void ask()}
                accessibilityRole="button"
                accessibilityLabel="Allow notifications"
                style={({ pressed }) => [styles.promptAllowWrap, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
                <Text style={[styles.promptButton, styles.promptAllow]}>Allow</Text>
                <PulseRing reduced={reduced} />
              </Pressable>
            </View>
          </View>
          <BobArrow reduced={reduced} />
        </Animated.View>
        <View style={{ flex: 1, minHeight: 24 }} />
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={() => void ask()} loading={busy} />
      </View>
    </View>
  );
}

// --- building: her course builds while it plays -------------------------------
//
// The course clip (che/social/src/onboarding/CourseLoop.tsx) plays at 1.75× while
// a rosa line draws around it, once through: the line closes as the culture scene
// leaves and the result lands as the clip ends. It runs on the clip's own clock,
// so a clip that starts late never lands "ready" in the middle of a scene.

/** Where each part of the build starts, in seconds of clip: the lesson done,
 *  Pancho asking, her line landing, the fix, the first and the third slang card,
 *  the culture scene arriving, and its answer turning green. */
const BUILD_BEATS = [0, 2.56, 5.15, 7.82, 9.98, 12.22, 15.42, 17.22, 19.9];
/** The line closes and the check lands: the culture scene is about to leave. */
const BUILD_CLOSED = 23.5;
/** The result: the clip (23.67 s) has played through. */
const BUILD_READY = 23.6;
const BUILD_RATE = 1.75;
/** Wall time after which the result shows whatever the clip did (the clip takes 13.5 s). */
const BUILD_HOLD_MAX = 18000;

/** Within one part: fast as it starts, slowing all the way to its end without
 *  stopping, so the next part's kick (about 4× the speed it ended on) is what
 *  marks the change. A stronger ease stalls halfway and the kick looks late. */
const partEase = (x: number) => 0.45 * x + 0.55 * (1 - Math.pow(1 - x, 2.5));

/** A loader's rhythm: each part gets its share of the line, by its length in the clip. */
function buildProgress(t: number) {
  if (t >= BUILD_CLOSED) return 1;
  const ends = [...BUILD_BEATS, BUILD_CLOSED];
  for (let k = 0; k < BUILD_BEATS.length; k++) {
    const a = ends[k];
    const b = ends[k + 1];
    if (t < b) return (a + (b - a) * partEase(Math.max(0, (t - a) / (b - a)))) / BUILD_CLOSED;
  }
  return 1;
}

/** The clip's card, and how far the line stands off it. */
const CLIP_W = 304;
const CLIP_RATIO = 4 / 5;
const RIM_GAP = 10;
const RIM_WIDTH = 6;
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** A rounded rectangle from top centre, clockwise, and its length. */
function rimPath(w: number, h: number, r: number, o: number) {
  const x = o;
  const y = o;
  const right = x + w;
  const bottom = y + h;
  const d = [
    `M ${x + w / 2} ${y}`,
    `H ${right - r}`,
    `A ${r} ${r} 0 0 1 ${right} ${y + r}`,
    `V ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    'Z',
  ].join(' ');
  return { d, length: 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r };
}

function Building({ answers, reduced, onReady, onNext }: { answers: Answers; reduced: boolean; onReady: () => void; onNext: () => void }) {
  const name = answers.name?.trim();
  const m = courseMoments(answers);
  const [failed, setFailed] = useState(false);
  const [closed, setClosed] = useState(false);
  const [ready, setReady] = useState(false);
  const readied = useRef(onReady);
  readied.current = onReady;

  const player = useVideoPlayer(COURSE_CLIP[answers.why], (p) => {
    p.muted = true;
    p.loop = true;
    p.playbackRate = BUILD_RATE;
    p.timeUpdateEventInterval = 0.05;
    if (!reduced) p.play();
  });

  // On a short phone the card shrinks so the headline and the button still fit.
  const { width: screenW, height: screenH } = useWindowDimensions();
  const cardW = Math.max(200, Math.min(CLIP_W, screenW - 2 * (RIM_GAP + RIM_WIDTH + 30), (screenH - 330) * CLIP_RATIO));
  const cardH = cardW / CLIP_RATIO;
  const radiusIn = Math.round(cardW * 0.092);
  const box = { w: cardW + 2 * RIM_GAP, h: cardH + 2 * RIM_GAP };
  const rim = rimPath(box.w, box.h, radiusIn + RIM_GAP, RIM_WIDTH / 2);
  const svgW = box.w + RIM_WIDTH;
  const svgH = box.h + RIM_WIDTH;

  const progress = useSharedValue(0);
  const rimProps = useAnimatedProps(() => ({ strokeDashoffset: rim.length * (1 - progress.value), opacity: progress.value > 0.002 ? 1 : 0 }));

  useEffect(() => {
    let last = 0;
    let done = false;
    const begun = Date.now();
    // Each reading moves the line on to where it should be by the next one.
    const at = (t: number) => {
      if (done) return;
      last = Math.max(last, t);
      progress.value = withTiming(buildProgress(last), { duration: 60, easing: Easing.linear });
      if (last >= BUILD_CLOSED) setClosed(true);
      if (last >= BUILD_READY) {
        done = true;
        setReady(true);
        readied.current();
      }
    };
    // The clip's clock while it plays; the wall clock, at the clip's pace, when
    // it can't (reduced motion, no clip). A clip that loops has played past ready.
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (reduced || failed) return;
      at(currentTime < last - 1 ? 99 : currentTime);
    });
    const wall = setInterval(() => {
      const t = ((Date.now() - begun) / 1000) * BUILD_RATE;
      if (Date.now() - begun > BUILD_HOLD_MAX) at(99);
      else if (reduced || failed) at(t);
    }, 50);
    const status = player.addListener('statusChange', ({ status: st }) => {
      if (st === 'error') setFailed(true);
    });
    return () => {
      sub.remove();
      status.remove();
      clearInterval(wall);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, reduced, failed]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.buildMiddle}>
        <View style={styles.buildHead}>
          {/* Both headlines share one place, so nothing moves when one becomes the other. */}
          <View>
            <Animated.Text
              key={ready ? 'ready' : 'building'}
              entering={reduced ? FadeIn.duration(150) : FadeIn.duration(260)}
              style={styles.courseTitle}
              accessibilityRole="header"
              accessibilityLiveRegion="polite">
              {ready ? (name ? `${name}, your course is ready.` : 'Your course is ready.') : 'Building your course…'}
            </Animated.Text>
          </View>
          <Text style={[styles.courseSub, !ready && { opacity: 0 }]}>Argentine Spanish, {answers.minutes} minutes a day.</Text>
        </View>

        {failed ? (
          // No connection, or the clip isn't there: the same moments, still.
          <Animated.View entering={rise(1, reduced)} style={[styles.moments, { paddingHorizontal: 24 }]}>
            <Moment tag="DAY 1" tone={pastel.peach} text={m.first} />
            <Moment tag="DAY 3 · FIRST CHAT" tone={pastel.lav}>
              <Text style={styles.momentText}>
                <Text style={styles.momentStrike}>{m.chat.bad}</Text> {m.chat.fix}
              </Text>
            </Moment>
            <Moment tag="WEEK 2 · CULTURE" tone={pastel.sky} text={m.custom} />
          </Animated.View>
        ) : (
          <View style={{ width: svgW, height: svgH, alignSelf: 'center' }}>
            <View
              style={[styles.buildClip, { left: RIM_WIDTH / 2 + RIM_GAP, top: RIM_WIDTH / 2 + RIM_GAP, width: cardW, height: cardH, borderRadius: radiusIn }]}
              accessible
              accessibilityRole="image"
              accessibilityLabel="Your course: a lesson done, a chat where Pancho fixes one word, three street words, and a question about the culture">
              {/* A TextureView keeps to the rounded corners (see ClipCard). */}
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
                allowsPictureInPicture={false}
                surfaceType="textureView"
              />
            </View>
            <Svg width={svgW} height={svgH} style={StyleSheet.absoluteFill} pointerEvents="none">
              <Path d={rim.d} stroke="rgba(58,42,32,0.10)" strokeWidth={RIM_WIDTH} fill="none" />
              <AnimatedPath
                d={rim.d}
                stroke={colors.primary}
                strokeWidth={RIM_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={[rim.length, rim.length]}
                animatedProps={rimProps}
              />
            </Svg>
            {closed ? (
              // Lands like a sticker: from 0.9, with an ease-out.
              <Animated.View
                entering={reduced ? FadeIn.duration(150) : ZoomIn.duration(300).easing(EASE_OUT)}
                style={[styles.buildDone, { right: -4, top: -4 }]}>
                <MaterialCommunityIcons name="check" size={22} color={colors.onPrimary} />
              </Animated.View>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {ready ? (
          <Animated.View entering={reduced ? FadeIn.duration(200) : rise(0).delay(280)}>
            <Button title="Continue" onPress={onNext} />
          </Animated.View>
        ) : (
          <View style={{ height: 54 }} />
        )}
      </View>
    </View>
  );
}

function Moment({ tag, tone, text, children }: { tag: string; tone: string; text?: string; children?: React.ReactNode }) {
  return (
    <View style={[styles.moment, { backgroundColor: tone }]}>
      <Text style={styles.momentTag}>{tag}</Text>
      {children ?? <Text style={styles.momentText}>{text}</Text>}
    </View>
  );
}

// --- the deal: two stickers, what she gives and what he gives -------------------

const GIVE: Record<Why, string> = {
  trip: 'Spanish for your trip',
  moving: 'Spanish for your move',
  love: 'Spanish for the family',
  people: 'Spanish for your people',
  culture: 'The Spanish behind the culture',
};

const FROM: Record<Level, string> = {
  none: 'From zero.',
  basics: 'From the basics you have.',
  spanish: 'From the Spanish you know.',
  conversational: 'From the Spanish you already speak.',
};

function Pledge({ answers, reduced, onNext }: { answers: Answers; reduced: boolean; onNext: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.pledgeBody}>
        <Animated.Text entering={rise(0, reduced)} style={styles.pledgeTitle} accessibilityRole="header">
          The deal{nameTail(answers)}.
        </Animated.Text>
        <View style={styles.pledgeStack}>
          <Animated.View entering={rise(2, reduced)} style={[styles.deal, { backgroundColor: pastel.lav, transform: [{ rotate: '-1deg' }] }]}>
            <Text style={styles.dealLabel}>YOU GIVE</Text>
            <Text style={styles.dealBig}>{answers.minutes} minutes a day</Text>
            <Text style={styles.dealSub}>Every day.</Text>
          </Animated.View>
          <Animated.View entering={rise(3, reduced)} style={styles.dealArrow}>
            <MaterialCommunityIcons name="swap-vertical" size={22} color={colors.ink} />
          </Animated.View>
          <Animated.View entering={rise(4, reduced)} style={[styles.deal, { backgroundColor: pastel.sage, transform: [{ rotate: '0.8deg' }] }]}>
            <Text style={styles.dealLabel}>I GIVE</Text>
            <Text style={styles.dealBig}>{GIVE[answers.why]}</Text>
            <Text style={styles.dealSub}>{FROM[answers.level]} The way it’s spoken here.</Text>
          </Animated.View>
        </View>
        <View style={{ flex: 1 }} />
        <Animated.View entering={rise(5, reduced)} style={{ alignItems: 'center' }}>
          <Image source={POSE.wave} style={styles.pledgeArt} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} the carpincho, waving`} />
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <Button title="I’m committed!" onPress={onNext} />
      </View>
    </View>
  );
}

// --- account: what keeps the plan ------------------------------------------

function explain(message: string): string {
  if (/provider is not enabled|unsupported provider/i.test(message)) return 'That sign-in option isn’t working right now. Try the other one.';
  if (/network|fetch/i.test(message)) return 'No connection. Try again.';
  return message;
}

const toPaywall = () => router.replace('/paywall?from=onboarding');

function Account({ answers, reduced }: { answers: Answers; reduced: boolean }) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const plan = buildPlan(answers);

  const social = async (which: Provider) => {
    if (busy) return;
    tap();
    setBusy(which);
    setError(null);
    const res: SocialResult = which === 'apple' ? await signInWithApple() : await signInWithGoogle();
    if (res.status === 'ok') {
      // The answers go on the account, so the plan is there on any phone.
      await supabase.auth.updateUser({ data: { onboarding: answers } }).catch(() => {});
      setBusy(null);
      return toPaywall();
    }
    setBusy(null);
    if (res.status === 'error') setError(explain(res.message));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.accountHero}>
        <Animated.View entering={pop(150, reduced)} style={{ transformOrigin: 'bottom center' }}>
          <SpeechBubble tail="bottom" style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 22 }}>
            <Text style={styles.accountSays}>Último paso. Where should I save your plan?</Text>
          </SpeechBubble>
        </Animated.View>
        <Image source={POSE.tango} style={styles.accountArt} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} dancing tango`} />
        <View style={styles.chips}>
          <Chip icon="clock-outline" text={`${answers.minutes} min a day`} />
          <Chip icon="flag-variant" text={`${plan.to} by ${formatShortDate(plan.date)}`} />
        </View>
      </View>
      <View style={[styles.footer, { gap: 12 }]}>
        {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
        <SocialButtons busy={busy} onPress={(which) => void social(which)} />
        <Text style={styles.legal}>
          By continuing you agree to the{' '}
          <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)}>
            Terms
          </Text>{' '}
          and{' '}
          <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

function Chip({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={15} color={colors.primaryDark} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10 },
  body: { padding: 24, paddingTop: 8, maxWidth: 520, width: '100%', alignSelf: 'center', flexGrow: 1 },
  pledgeBody: { flex: 1, paddingHorizontal: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  pledgeTitle: { ...type.display, fontSize: 34, lineHeight: 38, color: colors.ink, textAlign: 'center', marginTop: 10 },
  pledgeStack: { marginTop: 30 },
  deal: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 22, borderRadius: radius.lg, boxShadow: clay.surface },
  dealLabel: { ...font.body[800], fontSize: 13, letterSpacing: 1.2, color: colors.onPastel, opacity: 0.62 },
  dealBig: { ...font.display[900], fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: colors.onPastel, marginTop: 4 },
  dealSub: { ...font.body[700], fontSize: 16, lineHeight: 22, color: colors.onPastel, opacity: 0.72, marginTop: 4 },
  dealArrow: { alignSelf: 'center', width: 44, height: 44, borderRadius: 22, marginVertical: -10, zIndex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, boxShadow: clay.surface },
  pledgeArt: { width: 100, height: 132, marginBottom: 4 },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, maxWidth: 520, width: '100%', alignSelf: 'center' },

  // him, saying one thing
  saysRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginLeft: -8, marginBottom: 14 },
  saysArt: { width: 104, height: 128 },
  saysBubble: { flex: 1, marginBottom: 26 },
  saysText: { ...font.display[800], fontSize: 22, lineHeight: 27, letterSpacing: -0.4, color: colors.ink },
  saysTextSmall: { fontSize: 19, lineHeight: 24, letterSpacing: -0.3 },

  // name
  nameCard: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, boxShadow: clay.surface },
  nameLabel: { ...font.body[800], fontSize: 13, letterSpacing: 0.4, color: colors.muted },
  nameInput: {
    ...font.display[800],
    fontSize: 32,
    letterSpacing: -0.6,
    color: colors.ink,
    marginTop: 4,
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  skip: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  skipText: { ...font.body[800], fontSize: 15, color: colors.muted },

  // try it
  tryMiddle: { flex: 1, justifyContent: 'center', gap: 22, paddingVertical: 12 },
  tryCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 9,
    rowGap: 14,
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 24,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    transform: [{ rotate: '-1deg' }],
  },
  tryWord: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 3 },
  tryWordFixed: { paddingHorizontal: 11, borderRadius: 13, backgroundColor: pastel.sage, boxShadow: clay.chip },
  tryText: { ...font.display[900], color: colors.ink, letterSpacing: -0.6 },
  underline: { position: 'absolute', left: 3, right: 3, bottom: 0 },
  sun: { position: 'absolute', right: -120, top: 250, opacity: 0.55 },
  tryEn: { ...font.body[700], fontSize: 17, lineHeight: 23, color: colors.muted, textAlign: 'center' },

  // a choice
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 28, backgroundColor: colors.card, boxShadow: clay.surface },
  choiceOn: { backgroundColor: pastel.butter },
  coin: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: clay.chip },
  coinArt: { width: 34, height: 34 },
  coinGlyph: { ...font.display[900], fontSize: 19, letterSpacing: -0.3, color: colors.ink },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 22 },
  bar: { width: 6, borderRadius: 3 },
  choiceLabel: { ...font.body[700], flex: 1, fontSize: 16.5, lineHeight: 21, letterSpacing: -0.1, color: colors.ink },
  choiceTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  choiceTagText: { ...font.body[800], fontSize: 12, color: colors.ink },
  check: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 2, borderColor: colors.ink },
  checkOn: { backgroundColor: colors.primary, borderWidth: 0, boxShadow: clay.chip },

  // struggle
  hint: { ...font.body[700], fontSize: 14, color: colors.muted, marginLeft: 4, marginBottom: 8 },

  // achieve
  achieveList: { gap: 18, marginTop: 18 },
  achieveRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 96, paddingVertical: 16, paddingLeft: 16, paddingRight: 20, borderRadius: radius.lg, boxShadow: clay.surface },
  achieveCoin: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, boxShadow: clay.chip },
  achieveArt: { width: 46, height: 46 },
  achieveGlyph: { ...font.display[900], fontSize: 18, letterSpacing: -0.4, color: colors.ink },
  achieveText: { ...font.display[800], flex: 1, fontSize: 21, lineHeight: 25, letterSpacing: -0.4, color: colors.onPastel },

  // notifications
  ping: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: -10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: '#141413',
    boxShadow: '0 10px 26px rgba(58,42,32,0.13)',
  },
  pingIcon: { width: 38, height: 38, borderRadius: 9 },
  pingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  pingTitle: { fontSize: 15, lineHeight: 20, fontWeight: '600', letterSpacing: -0.24, color: '#000' },
  pingWhen: { fontSize: 13, lineHeight: 20, letterSpacing: -0.08, color: 'rgba(60,60,67,0.6)' },
  pingBody: { fontSize: 15, lineHeight: 20, letterSpacing: -0.24, color: '#000' },
  prompt: { alignSelf: 'center', width: 290, marginTop: 30, marginBottom: 44 },
  promptCard: { alignSelf: 'stretch', borderRadius: 14, backgroundColor: 'rgba(255,249,243,0.85)', borderWidth: 2, borderColor: 'rgba(58,42,32,0.2)', overflow: 'hidden' },
  promptTitle: { paddingTop: 17, paddingHorizontal: 16, paddingBottom: 15, fontSize: 16, lineHeight: 20, fontWeight: '600', color: '#9C8878', textAlign: 'center' },
  promptRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(58,42,32,0.14)' },
  promptButton: { paddingVertical: 12, fontSize: 17, lineHeight: 22, textAlign: 'center', color: '#9C8878' },
  promptLeft: { flex: 1, borderRightWidth: 1, borderRightColor: 'rgba(58,42,32,0.14)' },
  promptAllowWrap: { flex: 1, justifyContent: 'center' },
  promptAllow: { fontWeight: '700', color: colors.primary },
  promptRing: { position: 'absolute', top: 4, right: 4, bottom: 4, left: 4, borderRadius: 10, borderWidth: 2.5, borderColor: colors.primary },
  promptArrow: { position: 'absolute', left: '75%', top: '100%', marginTop: 10, marginLeft: -13 },

  // building
  // The headline sits right above the clip, and the two are centred together.
  buildMiddle: { flex: 1, justifyContent: 'center', gap: 22, maxWidth: 520, width: '100%', alignSelf: 'center' },
  buildHead: { alignItems: 'center', gap: 8, paddingHorizontal: 26 },
  buildClip: { position: 'absolute', overflow: 'hidden', backgroundColor: colors.bg },
  buildDone: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 3px ${colors.bg}`,
  },

  // your course
  courseTitle: { ...type.display, fontSize: 30, lineHeight: 33, letterSpacing: -0.7, color: colors.ink, textAlign: 'center' },
  courseSub: { ...font.body[600], fontSize: 16.5, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  moments: { gap: 16 },
  moment: { paddingHorizontal: 20, paddingVertical: 16, borderRadius: radius.lg, boxShadow: clay.surface },
  momentTag: { ...font.body[800], fontSize: 12, letterSpacing: 1.1, color: colors.onPastel, opacity: 0.65 },
  momentText: { ...font.display[800], fontSize: 21, lineHeight: 26, letterSpacing: -0.4, color: colors.onPastel, marginTop: 4 },
  momentStrike: { textDecorationLine: 'line-through', opacity: 0.55 },

  // account
  accountHero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, maxWidth: 520, width: '100%', alignSelf: 'center' },
  accountSays: { ...font.body[700], fontSize: 18, lineHeight: 24, color: colors.ink, textAlign: 'center' },
  accountArt: { width: 170, height: 210, marginTop: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.card, boxShadow: clay.surface },
  chipText: { ...font.body[700], fontSize: 13.5, color: colors.primaryDark },
  legal: { ...font.body[500], fontSize: 12.5, lineHeight: 17, color: colors.muted, textAlign: 'center', paddingHorizontal: 16 },
  legalLink: { color: colors.primaryDark, textDecorationLine: 'underline' },

  error: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.dangerInk },
});

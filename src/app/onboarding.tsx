import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, type VideoPlayer, VideoView } from 'expo-video';
import * as WebBrowser from 'expo-web-browser';
import { usePostHog } from 'posthog-react-native';
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
  FadeOut,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Keyframe,
  LinearTransition,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { FirstClassLesson } from '@/components/first-class';
import { FirstClassOpener } from '@/components/first-class-opener';
import { MASCOT_NAME, MascotSays, pop, type Pose, POSE, SpeechBubble } from '@/components/mascot';
import { EASE_OUT, IconButton, ProgressBar, rise, slide } from '@/components/onboarding-ui';
import { type Provider, SocialButtons } from '@/components/social-buttons';
import { StreakCelebration } from '@/components/streak-celebration';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { r } from '@/lib/cheer-deck';
import { localDateStr } from '@/lib/dates';
import { keepAnswers, type OnboardingStep, trackStep } from '@/lib/funnel';
import { startGuest } from '@/lib/guest';
import { success, tap } from '@/lib/haptics';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import {
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
  fetchNotifyAt,
  NOTIFY_AT_DEFAULT,
  type NotifyAt,
  nameTail,
  reminderLine,
  resetWinbackShown,
  saveAnswers,
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
import { strikeLine } from '@/lib/strike-line';
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
// He asks each question in his bubble, and the question stays put while she
// picks: no reply per answer (2026-11-17).
// ---------------------------------------------------------------------------

type Step = 'name' | 'level' | 'why' | 'try' | 'struggle' | 'goal' | 'building' | 'intro' | 'class' | 'streak' | 'notify' | 'offer' | 'account';
/** The order, by where notifications are asked (app_config `onboarding_notify_at`). */
const ORDER: Record<NotifyAt, Step[]> = {
  after_class: ['name', 'level', 'why', 'struggle', 'goal', 'building', 'intro', 'class', 'streak', 'notify', 'account'],
  after_build: ['name', 'level', 'why', 'struggle', 'goal', 'building', 'notify', 'intro', 'class', 'streak', 'account'],
};
/** The questions, on the progress bar. The builder, the first class and its
 *  streak are moments with their own screens; the account sits past the bar.
 *  The "Make it Argentine" step ('try') is out of the flow for now: its screen
 *  and TryWord stay below, ready to go back in by adding 'try' after 'why'. */
const BAR: Record<NotifyAt, Step[]> = {
  // After the class, notifications are part of the Day 1 screen, past the bar.
  after_class: ['name', 'level', 'why', 'struggle', 'goal'],
  after_build: ['name', 'level', 'why', 'struggle', 'goal', 'notify'],
};
/** Full-screen steps: no back button or bar above them. */
const BARE: Step[] = ['intro', 'class', 'streak', 'offer'];
/** Where back goes, where it isn't simply the step before: a moment (the
 *  builder, the class, the streak) is never gone back into. */
const BACK: Record<NotifyAt, Partial<Record<Step, Step>>> = {
  after_class: { intro: 'goal', class: 'intro', streak: 'intro', notify: 'intro' },
  after_build: { notify: 'goal', class: 'intro', streak: 'intro' },
};
/** The steps the funnel table knows (its check constraint); the new ones wait for a migration. */
// intro → class → streak: reaching streak means she finished the trial class.
const TRACKED = new Set<Step>(['name', 'level', 'why', 'try', 'struggle', 'goal', 'building', 'intro', 'class', 'streak', 'notify', 'offer', 'account']);

/** Day 1 of her streak, at the end of the first class: the cheer engine's
 *  polaroid on lavender, Pancho with his guitar, confetti behind. */
const DAY_ONE = { ...r('doors', 'confetti', 'polaroid', 'lav', 'musica', 'Day 1!', 'Every streak starts with one.'), id: 'onboarding-day-1' };

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
  // Dev only: ?step=streak opens on that step with sample answers, to try a
  // late screen without playing everything before it. ?step=class&part=done
  // opens the first class at a part (slang, culture, pancho) or its end screen.
  const { step: devStep, part: devPart } = useLocalSearchParams<{ step?: Step; part?: string }>();
  const jump = __DEV__ && devStep ? devStep : null;
  const [step, setStep] = useState<Step>(jump ?? 'name');
  const [dir, setDir] = useState<1 | -1>(1);
  const [a, setA] = useState<Partial<Answers>>(
    jump ? { minutes: 10, name: '', level: 'basics', why: 'trip', whys: ['trip'] } : { minutes: 10, name: '' },
  );
  const posthog = usePostHog();

  useEffect(() => {
    if (TRACKED.has(step)) trackStep(step as OnboardingStep);
  }, [step]);

  // Where notifications come: read once as onboarding opens, and frozen as she
  // reaches the builder (the first step whose next one depends on it), so the
  // order never changes under her. Not answered by then, or failed: the default.
  // ?notify= overrides it, for trying both from a deep link.
  const { notify: notifyParam } = useLocalSearchParams<{ notify?: string }>();
  const fetched = useRef<NotifyAt | null>(null);
  useEffect(() => {
    void fetchNotifyAt()
      .then((v) => (fetched.current = v))
      .catch(() => {});
  }, []);
  const notifyAt: NotifyAt = a.notifyAt ?? NOTIFY_AT_DEFAULT;
  useEffect(() => {
    if (step !== 'building' || a.notifyAt) return;
    const v: NotifyAt =
      notifyParam === 'after_build' || notifyParam === 'after_class' ? notifyParam : (fetched.current ?? NOTIFY_AT_DEFAULT);
    setA((cur) => ({ ...cur, notifyAt: v }));
    posthog?.capture('onboarding_notify_at', { onboarding_notify_at: v, $set: { onboarding_notify_at: v } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  const STEPS = ORDER[notifyAt];
  const index = STEPS.indexOf(step);
  const go = (to: Step, d: 1 | -1 = 1) => {
    setDir(d);
    setStep(to);
  };
  const next = () => go(STEPS[Math.min(index + 1, STEPS.length - 1)]);
  const back = () => {
    if (index === 0) return router.canGoBack() ? router.back() : router.replace('/welcome');
    go(BACK[notifyAt][step] ?? STEPS[index - 1], -1);
  };

  // Paywall first, account after: she is a guest by now, or signed in (staff
  // replaying it). If no guest could be made — anonymous sign-ins switched
  // off, no connection — the account step comes first, as it used to.
  const toPaywall = async () => {
    if (session || (await startGuest())) router.replace('/paywall?from=onboarding');
    else go('account');
  };
  /** After the class's streak (or its skip): notifications, or the paywall if they came already. */
  /** The beat before the paywall. The clip is parked on the pour first, so the
   *  loader never opens on a frame from somewhere else in the loop. */
  const toOffer = () => {
    pancho.pause();
    pancho.currentTime = POUR_FROM;
    go('offer');
  };
  const afterClass = () => (notifyAt === 'after_class' ? go('notify') : toOffer());

  // The class done: that's her first day of practice, so the streak starts
  // here (bump_streak, the same row every round writes). Her guest account was
  // made while "Building your course" played; startGuest just returns it.
  const classDone = () => {
    void startGuest()
      .then((ok) => (ok ? supabase.rpc('bump_streak', { p_today: localDateStr() }) : null))
      .catch(() => {});
    go('streak');
  };

  const choose = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    tap();
    setA((cur) => ({ ...cur, [key]: value }));
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // The class asks before it lets her go (its own handler, next in line).
      if (step === 'class') return false;
      back();
      return true;
    });
    return () => sub.remove();
  });

  const entering = slide(dir, reduced);
  const complete = a as Answers;
  // Asked after the class now, so the answers saved while the course was
  // building get the reminder added here.
  const notified = (reminder: boolean) => {
    const answers = { ...complete, reminder };
    setA(answers);
    void saveAnswers(answers);
    keepAnswers(answers);
    posthog?.capture('onboarding_reminder', { reminder, $set: { onboarding_reminder: reminder } });
    if (notifyAt === 'after_class') toOffer();
    else next();
  };
  const showChrome = step !== 'building';
  const bar = BAR[notifyAt].indexOf(step);

  // The first class and the two screens around it fill the screen themselves.
  if (BARE.includes(step)) {
    return (
      <Animated.View key={step} entering={entering} style={{ flex: 1, backgroundColor: step === 'intro' ? pastel.lav : colors.bg }}>
        {step === 'intro' ? (
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <FirstClassOpener onStart={() => go('class')} onSkip={afterClass} />
          </SafeAreaView>
        ) : step === 'offer' ? (
          <OfferLoading player={pancho} reduced={reduced} onDone={() => void toPaywall()} />
        ) : step === 'class' ? (
          <FirstClassLesson level={a.level} part={jump ? devPart : undefined} onFinish={classDone} onClose={back} />
        ) : notifyAt === 'after_class' ? (
          <DayOneAsk answers={complete} reduced={reduced} onDone={notified} />
        ) : (
          <StreakCelebration streak={1} design={DAY_ONE} cta="Continue" onDone={afterClass} />
        )}
      </Animated.View>
    );
  }

  return (
    <PanchoPlayer.Provider value={reduced ? null : pancho}>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, !showChrome && { opacity: 0 }]} pointerEvents={showChrome ? 'auto' : 'none'}>
          <IconButton icon="chevron-back" label="Back" onPress={back} />
          {bar >= 0 ? <ProgressBar value={(bar + 1) / BAR[notifyAt].length} /> : <View style={{ flex: 1 }} />}
          <View style={{ width: 36 }} />
        </View>

        <Animated.View key={step} entering={entering} style={{ flex: 1 }}>
          {step === 'name' ? (
            <NameStep name={a.name ?? ''} reduced={reduced} onChange={(name) => setA((cur) => ({ ...cur, name }))} onNext={next} />
          ) : step === 'level' ? (
            <Question
              line={`How much Spanish do you know${nameTail(a)}?`}
              answered={!!a.level}
              reduced={reduced}
              onNext={next}>
              {LEVEL.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <Choice label={o.label} sub={o.sub} tone={o.tone} bars={o.bars} selected={a.level === o.value} onPress={() => choose('level', o.value)} />
                </Animated.View>
              ))}
            </Question>
          ) : step === 'why' ? (
            <Question line="What brings you to Argentine Spanish?" answered={!!a.whys?.length} hint="Pick all that apply" reduced={reduced} onNext={next}>
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
          ) : step === 'struggle' ? (
            <StruggleStep
              level={a.level ?? 'basics'}
              picked={a.struggle ?? []}
              reduced={reduced}
              onChange={(struggle) => setA((cur) => ({ ...cur, struggle }))}
              onNext={next}
            />
          ) : step === 'try' ? (
            <TryItStep line={tryIt(complete)} reduced={reduced} onNext={next} />
          ) : step === 'goal' ? (
            <Question
              line="How much time a day?"
              answered
              reduced={reduced}
              onNext={next}>
              {MINUTES.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <Choice
                    label={`${o.value} min`}
                    tone={o.tone}
                    glyph={String(o.value)}
                    tag={o.label}
                    selected={a.minutes === o.value}
                    onPress={() => {
                      choose('minutes', o.value);
                    }}
                  />
                </Animated.View>
              ))}
            </Question>
          ) : step === 'notify' ? (
            <NotifyStep answers={complete} reduced={reduced} onDone={notified} />
          ) : step === 'building' ? (
            <Building
              answers={complete}
              reduced={reduced}
              onReady={() => {
                // Her guest account, made while she reads the result: the
                // class's streak and the paywall at the end go to it
                // (lib/guest.ts). The reminder answer comes later, after the
                // class (the notifications step adds it).
                void saveAnswers(complete)
                  .then(() => startGuest())
                  .then((ok) => {
                    if (!ok) return;
                    keepAnswers(complete);
                    // On her PostHog person too (no name), so replays and
                    // funnels can be split by level, reason and goal.
                    const props = {
                      onboarding_level: complete.level,
                      onboarding_why: complete.why,
                      onboarding_whys: (complete.whys ?? []).join(','),
                      onboarding_struggle: (complete.struggle ?? []).join(','),
                      onboarding_minutes: complete.minutes,
                      onboarding_notify_at: complete.notifyAt ?? NOTIFY_AT_DEFAULT,
                    };
                    posthog?.capture('onboarding_answers', { ...props, $set: props });
                  });
                success();
              }}
              onNext={next}
            />
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

/**
 * He asks in the bubble and the question stays there while she picks: the
 * answers don't change what he says (2026-11-17, her call). Continue waits
 * for an answer.
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
        <Says line={line} reduced={reduced} />
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
  sub,
  tone,
  art,
  bars,
  glyph,
  tag,
  multi,
  selected,
  detail,
  onPress,
}: {
  label: string;
  /** A second, quieter line under the label. */
  sub?: string;
  tone: string;
  art?: Art;
  bars?: number;
  glyph?: string;
  tag?: string;
  multi?: boolean;
  selected: boolean;
  /** Shown under the row once it is picked, behind a "THE FIX" pill. */
  detail?: string;
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
      <View style={styles.choiceRow}>
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
      {sub ? (
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.choiceLabel, { flex: 0 }]}>{label}</Text>
          <Text style={styles.choiceSub}>{sub}</Text>
        </View>
      ) : (
        <Text style={styles.choiceLabel}>{label}</Text>
      )}
      {tag ? (
        <View style={[styles.choiceTag, { backgroundColor: selected ? colors.card : pastel.butter }]}>
          <Text style={styles.choiceTagText}>{tag}</Text>
        </View>
      ) : null}
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? <MaterialCommunityIcons name="check-bold" size={15} color={colors.onPrimary} /> : null}
      </View>
      </View>
      {detail && selected ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.choiceDetail}>
          <View style={styles.postaPill}>
            <Text style={styles.postaPillText}>THE FIX</Text>
          </View>
          <Text style={styles.choiceDetailText}>{detail}</Text>
        </Animated.View>
      ) : null}
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

// --- offer: a short beat before the paywall ----------------------------------
// Straight from the notifications ask to prices felt like asking for money out
// of nowhere. Pancho pours his mate while the offer "gets ready", then the
// paywall. Nothing is actually loading: it is a breath, so it stays short.
//
// Timed by the clip itself, not a timer: he fades in once the player is at the
// pour (seeking takes a moment, and until then the view shows whatever frame
// the loop was on), and at POUR_TO, before he snaps the thermos back up, the
// clip pauses on that frame and the paywall comes.

const POUR_FROM = 7;
const POUR_TO = 10.2;
const POUR_MS = (POUR_TO - POUR_FROM) * 1000;

function OfferLoading({ player, reduced, onDone }: { player: VideoPlayer; reduced: boolean; onDone: () => void }) {
  const [ready, setReady] = useState(reduced);
  const shown = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      player.pause();
      onDone();
    };
    if (reduced) {
      const t = setTimeout(finish, 2000);
      return () => clearTimeout(t);
    }
    player.timeUpdateEventInterval = 0.05;
    player.currentTime = POUR_FROM;
    player.play();
    let seen = false;
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (!seen && currentTime >= POUR_FROM && currentTime < POUR_FROM + 1) {
        seen = true;
        setReady(true);
        shown.value = withTiming(1, { duration: 180, easing: EASE_OUT });
      }
      if (seen && currentTime >= POUR_TO) finish();
    });
    // If the clip never reports (no video, a stalled player), don't strand her here.
    const guard = setTimeout(finish, POUR_MS + 1500);
    // No touching the player here: the paywall replaces this whole screen,
    // and by then the player is released (a set on it throws).
    return () => {
      sub.remove();
      clearTimeout(guard);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fade = useAnimatedStyle(() => ({ opacity: shown.value }));
  return (
    <SafeAreaView style={styles.offer} edges={['top', 'bottom']}>
      <Animated.View style={[styles.offerArt, fade]} accessible accessibilityRole="image" accessibilityLabel={`${MASCOT_NAME} pouring his mate`}>
        {reduced ? (
          <Image source={PANCHO} style={StyleSheet.absoluteFill} contentFit="contain" />
        ) : (
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} allowsPictureInPicture={false} surfaceType="textureView" />
        )}
      </Animated.View>
      <Text style={styles.offerTitle} accessibilityRole="header" accessibilityLiveRegion="polite">
        Getting your offer ready…
      </Text>
      <OfferBar ms={(reduced ? 2000 : POUR_MS) - 150} start={ready} />
    </SafeAreaView>
  );
}

/** The bar fills once, ending just before the paywall comes up. */
const FILL_EASE = Easing.bezier(0.4, 0, 0.2, 1);
function OfferBar({ ms, start }: { ms: number; start: boolean }) {
  const t = useSharedValue(0.04);
  useEffect(() => {
    if (start) t.value = withTiming(1, { duration: ms, easing: FILL_EASE });
  }, [ms, start, t]);
  const a = useAnimatedStyle(() => ({ transform: [{ scaleX: t.value }] }));
  return (
    <View style={styles.offerTrack}>
      <Animated.View style={[styles.offerFill, a]} />
    </View>
  );
}

// --- struggle: what got in the way, and what Posta does about it ------------

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
  const toggle = (v: Struggle) => {
    tap();
    // "Nothing" stands alone: picking it clears the rest, and the rest clear it.
    if (picked.includes(v)) return onChange(picked.filter((x) => x !== v));
    onChange(v === 'none' ? ['none'] : [...picked.filter((x) => x !== 'none'), v]);
  };
  return (
    <Question line={q.en} answered={picked.length > 0} hint="Pick all that apply" reduced={reduced} onNext={onNext}>
      {q.options.map((o, i) => (
        <Animated.View key={o.value} entering={rise(i + 1, reduced)} layout={reduced ? undefined : LinearTransition.duration(220).easing(EASE_OUT)}>
          <Choice label={o.label} tone={o.tone} art={o.art} multi selected={picked.includes(o.value)} detail={o.posta} onPress={() => toggle(o.value)} />
        </Animated.View>
      ))}
    </Question>
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
  // He answers once she stops typing, not letter by letter ("Nice to meet you, J!").
  const [heard, setHeard] = useState(name.trim());
  useEffect(() => {
    const t = setTimeout(() => setHeard(name.trim()), 700);
    return () => clearTimeout(t);
  }, [name]);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Says line={has && heard ? `Nice to meet you, ${heard}!` : `¡Hola! I’m ${MASCOT_NAME}. What’s your name?`} reduced={reduced} />
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

/**
 * One word of the "Make it Argentine" sentence. A textbook word, once she taps,
 * is crossed out by the welcome screen's hand-drawn line, then lifts above its
 * place, smaller and faded, while the street word is slapped on where it stood.
 * Left to right, a word at a time. The rest just stay.
 */
function TryWord({
  book,
  local,
  order,
  done,
  reduced,
  size,
}: {
  book: string;
  local: string;
  order: number;
  done: boolean;
  reduced: boolean;
  size: number;
}) {
  const target = order >= 0;
  const swapped = done && target;
  const text = { fontSize: size, lineHeight: size + 12 };
  const [w, setW] = useState(0);
  const line = strikeLine(w);
  const length = useSharedValue(0);
  const strike = useSharedValue(0);
  const lift = useSharedValue(0);
  const delay = Math.max(0, order) * 140;
  useEffect(() => {
    if (!swapped) return;
    if (reduced) {
      strike.value = 1;
      lift.value = 1;
      return;
    }
    strike.value = withDelay(delay, withTiming(1, { duration: 260, easing: EASE_OUT }));
    lift.value = withDelay(delay + 220, withTiming(1, { duration: 320, easing: EASE_OUT }));
  }, [swapped, reduced, delay, strike, lift]);
  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: length.value * (1 - strike.value) }));
  const bookStyle = useAnimatedStyle(() => ({
    opacity: 1 - 0.4 * lift.value,
    transform: [{ translateY: -(size * 1.32) * lift.value }, { scale: 1 - 0.3 * lift.value }],
  }));

  return (
    <Animated.View layout={reduced ? undefined : LinearTransition.duration(260)} style={styles.tryWord}>
      {swapped ? (
        <Animated.View
          entering={reduced ? undefined : ZoomIn.duration(260).delay(delay + 300).easing(EASE_OUT)}
          style={[styles.tryWordFixed, { transform: [{ rotate: WORD_TILT[order % 4] }] }]}>
          <Text style={[styles.tryText, text]}>{local}</Text>
        </Animated.View>
      ) : null}
      <Animated.View style={[swapped && styles.tryBookLifted, swapped && bookStyle]}>
        <View
          onLayout={(e) => {
            if (w) return;
            const width = e.nativeEvent.layout.width;
            length.value = strikeLine(width).length;
            setW(width);
          }}>
          <Text style={[styles.tryText, text, swapped && { color: colors.muted }]}>{book}</Text>
          {swapped && w > 0 ? (
            <Svg width={w + 12} height={18} style={[styles.tryStrike, { top: (size + 12) / 2 - 10 }]} pointerEvents="none">
              <AnimatedPath
                d={line.d}
                stroke={colors.primary}
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={[line.length, line.length]}
                animatedProps={lineProps}
              />
            </Svg>
          ) : null}
        </View>
      </Animated.View>
      {!done && target ? <Underline marked /> : null}
    </Animated.View>
  );
}

function TryItStep({ line, reduced, onNext }: { line: TryIt; reduced: boolean; onNext: () => void }) {
  // Not a test: Pancho says how many words give the textbook away, and one
  // press turns them all into the Buenos Aires ones together.
  const [done, setDone] = useState(false);
  const says = done ? line.done : line.start;
  const length = Math.max(line.book.join(' ').length, line.local.join(' ').length);
  const size = length <= 22 ? 38 : length <= 30 ? 33 : 28;
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
          <Animated.View entering={rise(1, reduced)}>
            {/* The whole card is the button: a tap anywhere turns it Argentine, then moves on. */}
            <Pressable
              onPress={done ? onNext : reveal}
              accessibilityRole="button"
              accessibilityLabel={done ? `${line.local.join(' ')}. Continue` : `${line.book.join(' ')}. Make it Argentine`}
              style={styles.tryCard}>
              {({ pressed }) => (
                <>
                  <View style={[styles.tryWords, done && styles.tryWordsDone]}>
                    {line.book.map((word, k) => (
                      <TryWord
                        key={k}
                        book={word}
                        local={line.local[k]}
                        order={line.targets.indexOf(k)}
                        done={done}
                        reduced={reduced}
                        size={size}
                      />
                    ))}
                  </View>
                  <Text style={styles.tryEn}>{line.en}</Text>
                  {/* The action is the card's own bottom edge, so it can't be missed. */}
                  <View style={[styles.tryStrip, pressed && { opacity: 0.88 }]}>
                    {done ? null : <MaterialCommunityIcons name="creation" size={20} color={colors.onPrimary} />}
                    <Text style={styles.tryStripText}>{done ? 'Continue' : 'Make it Argentine'}</Text>
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

// --- notifications: the nudge she'll get, then the phone's own question ----------

const DAYS = ['Mon', 'Tue', 'Wed'];
/** The ink of Android's permission sheet (its bell). */
const DROID_INK = '#3A4A7C';
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
function PulseRing({ reduced, at = NUDGE_AT, round }: { reduced: boolean; at?: number; round?: boolean }) {
  const o = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    o.value = withDelay(
      at,
      withRepeat(withSequence(withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })), -1),
    );
    return () => cancelAnimation(o);
  }, [reduced, o, at]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.promptRing, round && styles.droidRing, pulse]} pointerEvents="none" />;
}

/** The arrow under Allow: it starts bobbing once she has had time to read. */
function BobArrow({ reduced, at = NUDGE_AT }: { reduced: boolean; at?: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    y.value = withDelay(
      at,
      withRepeat(withSequence(withTiming(-6, { duration: 550, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 550, easing: Easing.inOut(Easing.ease) })), -1),
    );
    return () => cancelAnimation(y);
  }, [reduced, y, at]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.promptArrow, bob]} pointerEvents="none" accessible={false}>
      <Svg width={26} height={30} viewBox="0 0 26 30" fill="none" stroke={colors.primary} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M13 27V4M4 13l9-9 9 9" />
      </Svg>
    </Animated.View>
  );
}

/**
 * The phone's permission question, drawn the way her phone will show it:
 * iOS's two-button alert, or Android 13's sheet with the bell and the two
 * stacked buttons. Allow is ringed. With onAllow, the drawn Allow asks for
 * real; without it, it is only a picture (the real one opens over it).
 * With onDeny, the drawn "Don't allow" moves on without asking.
 */
function PhonePrompt({ reduced, at, onAllow, onDeny }: { reduced: boolean; at?: number; onAllow?: () => void; onDeny?: () => void }) {
  // "Don't allow" on the drawing: she goes on and the phone's own question is
  // never spent, so it can still be asked on a better day.
  const deny = (body: React.ReactNode, style: object) =>
    onDeny ? (
      <Pressable onPress={onDeny} accessibilityRole="button" accessibilityLabel="Don’t allow notifications" style={style}>
        {body}
      </Pressable>
    ) : (
      <View style={style}>{body}</View>
    );
  const allow = (body: React.ReactNode, style: object) =>
    onAllow ? (
      <Pressable
        onPress={onAllow}
        accessibilityRole="button"
        accessibilityLabel="Allow notifications"
        style={({ pressed }) => [style, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
        {body}
      </Pressable>
    ) : (
      <View style={style}>{body}</View>
    );

  if (Platform.OS === 'android') {
    return (
      <View style={styles.droidCard}>
        <MaterialCommunityIcons name="bell-ring" size={28} color={DROID_INK} style={{ alignSelf: 'center' }} accessible={false} />
        <Text style={styles.droidTitle} accessible={false}>
          Allow <Text style={{ fontWeight: '700' }}>Posta</Text> to send you notifications?
        </Text>
        <View style={{ gap: 4 }}>
          {allow(
            <>
              <Text style={[styles.droidButtonText, onAllow && { fontWeight: '700' }]} accessible={!onAllow ? false : undefined}>
                Allow
              </Text>
              <PulseRing reduced={reduced} at={at} round />
            </>,
            [styles.droidButton, styles.droidTop],
          )}
          {deny(
            <Text style={styles.droidButtonText} accessible={false}>
              Don’t allow
            </Text>,
            [styles.droidButton, styles.droidBottom],
          )}
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.promptCard}>
        <Text style={styles.promptTitle} accessible={false}>
          “Posta” Would Like to Send You Notifications
        </Text>
        <View style={styles.promptRow}>
          {deny(
            <Text style={styles.promptButton} accessible={false}>
              Don’t Allow
            </Text>,
            styles.promptLeft,
          )}
          {allow(
            <>
              <Text style={[styles.promptButton, styles.promptAllow]} accessible={!onAllow ? false : undefined}>
                Allow
              </Text>
              <PulseRing reduced={reduced} at={at} />
            </>,
            styles.promptAllowWrap,
          )}
        </View>
      </View>
      <BobArrow reduced={reduced} at={at} />
    </>
  );
}

function NotifyStep({ answers, reduced, onDone }: { answers: Answers; reduced: boolean; onDone: (granted: boolean) => void }) {
  const posthog = usePostHog();
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);
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

  const deny = () => {
    if (busy || declined) return;
    tap();
    setDeclined(true);
    posthog?.capture('notify_soft_declined');
    setTimeout(() => onDone(false), 1500);
  };
  const ask = async () => {
    if (busy || declined) return;
    setBusy(true);
    const granted = await askNotifyPermission();
    // The answer lives only on the phone otherwise: kept on her PostHog person
    // (and as an event) so the replay's person panel says whether she allowed it.
    posthog?.capture('notify_permission', { granted, $set: { notifications_allowed: granted } });
    setBusy(false);
    onDone(granted);
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Says
          line={declined ? 'No problem! Your next class will be waiting for you in the app.' : 'Let me send you notifications, so Spanish becomes a habit.'}
          reduced={reduced}
        />
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
          <PhonePrompt reduced={reduced} onAllow={() => void ask()} onDeny={deny} />
        </Animated.View>
        <View style={{ flex: 1, minHeight: 24 }} />
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={() => void ask()} loading={busy} />
      </View>
    </View>
  );
}

// --- day 1, then the reminder: one screen ------------------------------------
//
// Asked after the class (onboarding_notify_at = after_class), Continue on the
// Day 1 polaroid doesn't leave: the lavender stays and its content swaps for
// the ask (canvas "10 + 11"). See you tomorrow, the phone's question drawn with
// Allow pointed out, tomorrow's reminder under it; a beat later the real
// question opens over the drawn one. Either answer gets one line, then
// Continue goes on to the plans.

type DayPhase = 'day' | 'ask' | 'allowed' | 'denied';
/** When the phone's own question opens, after the ask has landed. */
const REAL_ASK_AT = 1400;

function DayOneAsk({ answers, reduced, onDone }: { answers: Answers; reduced: boolean; onDone: (granted: boolean) => void }) {
  const posthog = usePostHog();
  const [phase, setPhase] = useState<DayPhase>('day');
  useEffect(() => {
    if (phase !== 'ask') return;
    let live = true;
    const t = setTimeout(() => {
      void askNotifyPermission().then((granted) => {
        posthog?.capture('notify_permission', { granted, $set: { notifications_allowed: granted } });
        if (live) setPhase(granted ? 'allowed' : 'denied');
      });
    }, reduced ? 300 : REAL_ASK_AT);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  const answered = phase === 'allowed' || phase === 'denied';
  const enter = (ms: number) => (reduced ? FadeIn.duration(150) : ASK_IN.delay(ms).duration(360));

  return (
    <View style={{ flex: 1 }}>
      <StreakCelebration
        streak={1}
        design={DAY_ONE}
        cta="Continue"
        onDone={() => {
          trackStep('notify');
          setPhase('ask');
        }}
      />
      {phase !== 'day' ? (
        <Animated.View entering={FadeIn.duration(reduced ? 150 : 240)} style={[StyleSheet.absoluteFill, { backgroundColor: pastel.lav, zIndex: 60, elevation: 60 }]}>
          {/* Above the cheer screen, which draws itself at zIndex 50. */}
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <View style={styles.dayAsk}>
              <Animated.View entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(14).delay(60)} style={styles.daySticker} accessible accessibilityRole="header" accessibilityLabel="See you tomorrow?">
                <StickerLine text="SEE YOU" size={60} />
                <StickerLine text="TOMORROW?" size={50} />
              </Animated.View>
              <Animated.View entering={enter(140)}>
                <Image source={POSE.gol} style={styles.dayPancho} contentFit="contain" accessibilityLabel="Pancho celebrating" />
              </Animated.View>
              {answered ? (
                <Animated.View entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(13)} style={styles.dayResult}>
                  <View style={[styles.dayChip, { backgroundColor: phase === 'allowed' ? pastel.sage : colors.card, transform: [{ rotate: phase === 'allowed' ? '-3deg' : '3deg' }] }]}>
                    <Text style={styles.dayChipText}>{phase === 'allowed' ? 'Reminder on' : 'No problem!'}</Text>
                  </View>
                  <Text style={styles.dayLine}>
                    {phase === 'allowed' ? 'Deal. I’ll knock tomorrow.' : 'Your next class will be waiting for you in the app.'}
                  </Text>
                </Animated.View>
              ) : (
                <Animated.View entering={enter(300)} exiting={FadeOut.duration(180)} style={[styles.prompt, { marginTop: 18, marginBottom: 40 }]}>
                  <PhonePrompt reduced={reduced} at={600} />
                </Animated.View>
              )}
              {phase !== 'denied' ? (
                <Animated.View entering={enter(480)} exiting={FadeOut.duration(200)} style={{ alignSelf: 'stretch' }}>
                  <Ping title="Time for your Spanish" when="tomorrow">
                    <Text style={styles.pingBody}>{reminderLine(answers)}</Text>
                  </Ping>
                </Animated.View>
              ) : null}
            </View>
            <View style={[styles.footer, !answered && { opacity: 0 }]} pointerEvents={answered ? 'auto' : 'none'}>
              <Button title="Continue" onPress={() => onDone(phase === 'allowed')} />
            </View>
          </SafeAreaView>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** One line of a sticker headline: cream letters, an ink outline, a hard ink shadow. */
function StickerLine({ text, size }: { text: string; size: number }) {
  const w = 340;
  const h = Math.round(size * 1.12);
  const y = Math.round(size * 0.88);
  const base = { x: w / 2, y, textAnchor: 'middle' as const, fontFamily: 'Gabarito_900Black', fontSize: size, letterSpacing: -2 };
  const ink = { fill: colors.ink, stroke: colors.ink, strokeWidth: 9, strokeLinejoin: 'round' as const };
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <SvgText {...base} {...ink} x={w / 2 + 4} y={y + 4}>
        {text}
      </SvgText>
      <SvgText {...base} {...ink}>
        {text}
      </SvgText>
      <SvgText {...base} fill={colors.card}>
        {text}
      </SvgText>
    </Svg>
  );
}

// --- building: her course builds while it plays -------------------------------
//
// The course clip (che/social/src/onboarding/CourseLoop.tsx) plays at 2.3× while
// a rosa line draws around it, once through: the line closes as the culture scene
// leaves and the result lands as the clip ends. It runs on the clip's own clock,
// so a clip that starts late never lands "ready" in the middle of a scene.

/** Where each part of the build starts, in seconds of clip: the lesson done,
 *  Pancho asking, her line landing, the fix, the first and the third slang card,
 *  the culture scene arriving, and its answer turning green. */
const BUILD_BEATS = [0, 2.56, 5.15, 7.82, 9.98, 12.22, 15.42, 17.22, 19.9];
/** The line closes and the check lands: the culture scene is about to leave. */
/** Where the clip rests at the end, in seconds: the Course tab, its lesson done and the streak landed. */
const COURSE_REST = 4.3;
const BUILD_CLOSED = 23.5;
/** The result: the clip (23.67 s) has played through. */
const BUILD_READY = 23.6;
const BUILD_RATE = 2.3;
/** Wall time after which the result shows whatever the clip did (the clip takes ~10.3 s). */
const BUILD_HOLD_MAX = 14000;
/** With reduced motion there is no clip to wait for: the still moments, and the result soon after. */
const BUILD_REDUCED_MS = 1200;

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
    // Once through, then round into the Course tab and it rests there.
    p.loop = false;
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
    // it can't (reduced motion, no clip). A clip back at its start has played past ready.
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (reduced || failed) return;
      at(currentTime < last - 1 ? 99 : currentTime);
    });
    const wall = setInterval(() => {
      const t = ((Date.now() - begun) / 1000) * BUILD_RATE;
      if (Date.now() - begun > (reduced ? BUILD_REDUCED_MS : BUILD_HOLD_MAX)) at(99);
      else if (failed) at(t);
    }, 50);
    const status = player.addListener('statusChange', ({ status: st }) => {
      if (st === 'error') setFailed(true);
    });
    // At the end it goes round once more into the Course tab and stops there,
    // once the lesson is done and the streak has landed: its first frame is
    // still the Culture scene fading out.
    let parking = false;
    const park = player.addListener('timeUpdate', ({ currentTime }) => {
      if (parking && currentTime >= COURSE_REST) {
        parking = false;
        player.pause();
      }
    });
    const end = player.addListener('playToEnd', () => {
      parking = true;
      player.currentTime = 0;
      player.play();
    });
    return () => {
      sub.remove();
      status.remove();
      end.remove();
      park.remove();
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

        {failed || reduced ? (
          // No connection, the clip isn't there, or reduced motion: the same moments, still.
          <Animated.View entering={rise(1, reduced)} style={[styles.moments, { paddingHorizontal: 24 }]}>
            <Moment tag="DAY 1" tone={pastel.sky} text={m.first} />
            <Moment tag="DAY 3 · FIRST CHAT" tone={pastel.lav}>
              <Text style={styles.momentText}>
                <Text style={styles.momentStrike}>{m.chat.bad}</Text> {m.chat.fix}
              </Text>
            </Moment>
            <Moment tag="WEEK 2 · CULTURE" tone={pastel.peach} text={m.custom} />
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
            <Text style={styles.accountSays}>Último paso. Where should I save your course?</Text>
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
  codeError: { ...font.body[700], fontSize: 14, color: colors.danger, marginTop: 8 },

  // try it
  tryMiddle: { flex: 1, justifyContent: 'center', gap: 22, paddingVertical: 12 },
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
    paddingBottom: 18,
  },
  tryStrip: {
    minHeight: 58,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  tryStripText: { ...font.display[800], fontSize: 18, color: colors.onPrimary },
  tryWord: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 3 },
  // Room above each row for the crossed-out words to lift into.
  tryWordsDone: { rowGap: 56, paddingTop: 66 },
  // The crossed-out word, over the street word's spot, before it lifts away.
  tryBookLifted: { position: 'absolute', left: -40, right: -40, top: 0, alignItems: 'center' },
  tryStrike: { position: 'absolute', left: -2 },
  tryWordFixed: { paddingHorizontal: 11, borderRadius: 13, backgroundColor: pastel.sage, boxShadow: clay.chip },
  tryText: { ...font.display[900], color: colors.ink, letterSpacing: -0.6 },
  underline: { position: 'absolute', left: 3, right: 3, bottom: 0 },
  sun: { position: 'absolute', right: -120, top: 250, opacity: 0.55 },
  tryEn: {
    ...font.body[700],
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
    marginHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 2,
    borderTopColor: 'rgba(58,42,32,0.12)',
  },

  // a choice
  choice: { minHeight: 64, justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 16, borderRadius: 28, backgroundColor: colors.card, boxShadow: clay.surface },
  choiceRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  // A picked struggle opens to what Posta does about it, under a dashed line.
  choiceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(58,42,32,0.25)',
  },
  choiceDetailText: { ...font.body[700], flex: 1, fontSize: 15.5, lineHeight: 21, color: colors.ink },
  postaPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: pastel.sage, borderWidth: 1.5, borderColor: colors.ink },
  postaPillText: { ...font.body[800], fontSize: 11, letterSpacing: 1, color: colors.ink },
  choiceOn: { backgroundColor: pastel.butter },
  coin: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: clay.chip },
  coinArt: { width: 34, height: 34 },
  coinGlyph: { ...font.display[900], fontSize: 19, letterSpacing: -0.3, color: colors.ink },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 22 },
  bar: { width: 6, borderRadius: 3 },
  choiceLabel: { ...font.body[700], flex: 1, fontSize: 16.5, lineHeight: 21, letterSpacing: -0.1, color: colors.ink },
  choiceSub: { ...font.body[600], fontSize: 14, lineHeight: 18, color: colors.muted },
  choiceTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  choiceTagText: { ...font.body[800], fontSize: 12, color: colors.ink },
  check: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 2, borderColor: colors.ink },
  checkOn: { backgroundColor: colors.primary, borderWidth: 0, boxShadow: clay.chip },

  // offer
  offer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: colors.bg },
  offerArt: { width: 160, height: 220 },
  offerTitle: { ...font.display[900], fontSize: 28, lineHeight: 32, letterSpacing: -0.4, color: colors.ink, textAlign: 'center', marginTop: 22 },
  offerTrack: { width: '100%', height: 16, marginTop: 22, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 2.5, borderColor: colors.ink, overflow: 'hidden' },
  offerFill: { flex: 1, backgroundColor: colors.primary, transformOrigin: 'left' },

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
  dayAsk: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 6 },
  daySticker: { alignItems: 'center', transform: [{ rotate: '-4deg' }] },
  dayPancho: { width: 140, height: 150 },
  dayResult: { alignItems: 'center', gap: 12, marginTop: 18, marginBottom: 36, minHeight: 110 },
  dayChip: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 14, borderWidth: 2.5, borderColor: colors.ink, boxShadow: `3px 4px 0 0 ${colors.ink}` },
  dayChipText: { ...font.display[900], fontSize: 26, color: colors.ink },
  dayLine: { ...font.body[700], fontSize: 17, lineHeight: 23, color: colors.ink, textAlign: 'center', maxWidth: 300 },
  promptCard: { alignSelf: 'stretch', borderRadius: 14, backgroundColor: 'rgba(255,249,243,0.85)', borderWidth: 2, borderColor: 'rgba(58,42,32,0.2)', overflow: 'hidden' },
  promptTitle: { paddingTop: 17, paddingHorizontal: 16, paddingBottom: 15, fontSize: 16, lineHeight: 20, fontWeight: '600', color: '#9C8878', textAlign: 'center' },
  promptRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(58,42,32,0.14)' },
  promptButton: { paddingVertical: 12, fontSize: 17, lineHeight: 22, textAlign: 'center', color: '#9C8878' },
  promptLeft: { flex: 1, borderRightWidth: 1, borderRightColor: 'rgba(58,42,32,0.14)' },
  promptAllowWrap: { flex: 1, justifyContent: 'center' },
  promptAllow: { fontWeight: '700', color: colors.primary },
  promptRing: { position: 'absolute', top: 4, right: 4, bottom: 4, left: 4, borderRadius: 10, borderWidth: 2.5, borderColor: colors.primary },
  // Android 13's notification sheet, as Material You draws it.
  droidCard: { alignSelf: 'stretch', borderRadius: 28, backgroundColor: '#F1EDF4', paddingTop: 22, paddingHorizontal: 18, paddingBottom: 18, gap: 14 },
  droidTitle: { fontSize: 20, lineHeight: 26, color: '#1C1B1F', textAlign: 'center', paddingHorizontal: 4 },
  droidButton: { minHeight: 54, justifyContent: 'center', backgroundColor: '#DCE1FF' },
  droidTop: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  droidBottom: { borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  droidButtonText: { fontSize: 16, lineHeight: 22, color: '#1C1B1F', textAlign: 'center' },
  droidRing: { top: -3, right: -3, bottom: -3, left: -3, borderRadius: 22, borderWidth: 3 },
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

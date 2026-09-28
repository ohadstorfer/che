import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { AudioPlayer } from 'expo-audio';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { MASCOT_NAME, MascotSays, pop, type Pose, POSE, SpeechBubble } from '@/components/mascot';
import { EASE_OUT, IconButton, OptionCard, ProgressBar, rise, slide } from '@/components/onboarding-ui';
import { Button, Field } from '@/components/ui';
import { setAudioSession } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { success, tap } from '@/lib/haptics';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import {
  type Answers,
  buildPlan,
  formatDate,
  formatShortDate,
  LEVEL,
  MINUTES,
  type Minutes,
  resetWinbackShown,
  saveAnswers,
  speaksSpanish,
  WHEN,
  whenQuestion,
  whenQuestionEs,
  WHY,
} from '@/lib/onboarding';
import { appleAvailable, type SocialResult, signInWithApple, signInWithGoogle } from '@/lib/social-auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, pastel, pastelGrad, radius, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Onboarding — the carpincho asks four questions, shows her one surprise,
// builds a plan from the answers, and keeps it once she has an account. Then
// the paywall.
//
// The order is the argument: why she's here (so the plan speaks her life),
// where she starts, a moment that shows what makes Che different (tú → vos),
// when she needs it and how much time she has — then the plan, visibly made
// for her, which is the thing the account saves and the paywall unlocks.
// Every answer gets a reply from him before she moves on, so a choice is a
// line of conversation, not a form field.
// ---------------------------------------------------------------------------

type Step = 'why' | 'level' | 'insight' | 'when' | 'goal' | 'building' | 'plan' | 'account';
const STEPS: Step[] = ['why', 'level', 'insight', 'when', 'goal', 'building', 'plan', 'account'];
/** Steps that count on the progress bar; the plan and account sit past it. */
const COUNTED = 5;

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
  const [step, setStep] = useState<Step>('why');
  const [dir, setDir] = useState<1 | -1>(1);
  const [a, setA] = useState<Partial<Answers>>({ minutes: 10 });
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
    if (step === 'why') return router.canGoBack() ? router.back() : router.replace('/welcome');
    // The builder is a moment, not a place: back from the plan skips it.
    const prev = STEPS[index - 1] === 'building' ? 'goal' : STEPS[index - 1];
    go(prev, -1);
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
  const reply = <T,>(list: { value: T; react: string }[], value: T | undefined) => list.find((o) => o.value === value)?.react;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, !showChrome && { opacity: 0 }]} pointerEvents={showChrome ? 'auto' : 'none'}>
          <IconButton icon="chevron-back" label="Back" onPress={back} />
          {index < COUNTED ? <ProgressBar value={(index + 1) / (COUNTED + 1)} /> : <View style={{ flex: 1 }} />}
          <View style={{ width: 36 }} />
        </View>

        <Animated.View key={step} entering={entering} style={{ flex: 1 }}>
          {step === 'why' ? (
            <Ask
              pose="cafe"
              es="¿Qué te trae por acá?"
              en="What brings you to Argentine Spanish?"
              reaction={reply(WHY, a.why)}
              reduced={reduced}
              onNext={next}>
              {WHY.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <OptionCard label={o.label} icon={o.icon} selected={a.why === o.value} onPress={() => choose('why', o.value)} />
                </Animated.View>
              ))}
            </Ask>
          ) : step === 'level' ? (
            <Ask pose="sip" es="¿Cuánto español sabés?" en="How much Spanish do you know?" reaction={reply(LEVEL, a.level)} reduced={reduced} onNext={next}>
              {LEVEL.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <OptionCard label={o.label} sub={o.sub} bars={o.bars} selected={a.level === o.value} onPress={() => choose('level', o.value)} />
                </Animated.View>
              ))}
            </Ask>
          ) : step === 'insight' ? (
            <Flashcards advanced={speaksSpanish(complete.level)} reduced={reduced} onNext={next} />
          ) : step === 'when' ? (
            <Ask
              pose="flag"
              es={whenQuestionEs(complete.why)}
              en={whenQuestion(complete.why)}
              reaction={reply(WHEN, a.when)}
              reduced={reduced}
              onNext={next}>
              {WHEN.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <OptionCard label={o.label} selected={a.when === o.value} onPress={() => choose('when', o.value)} />
                </Animated.View>
              ))}
            </Ask>
          ) : step === 'goal' ? (
            <Ask
              pose="mate"
              es="¿Cuánto tiempo por día?"
              en="How much time a day?"
              reaction={goalTouched ? reply(MINUTES, a.minutes) : undefined}
              ready
              cta="Build my plan"
              reduced={reduced}
              onNext={next}>
              {MINUTES.map((o, i) => (
                <Animated.View key={o.value} entering={rise(i + 1, reduced)}>
                  <OptionCard
                    label={`${o.value} min a day`}
                    sub={o.value === 10 ? `${o.label} · recommended` : o.label}
                    selected={a.minutes === o.value}
                    onPress={() => {
                      setGoalTouched(true);
                      choose('minutes', o.value);
                    }}
                  />
                </Animated.View>
              ))}
            </Ask>
          ) : step === 'building' ? (
            <Building
              reduced={reduced}
              why={complete.why}
              minutes={complete.minutes}
              onDone={() => {
                void saveAnswers(complete);
                success();
                go('plan');
              }}
            />
          ) : step === 'plan' ? (
            <PlanTicket
              answers={complete}
              reduced={reduced}
              onNext={() => (session ? router.replace('/paywall?from=onboarding') : next())}
              onFaster={(m) => {
                tap();
                const updated = { ...complete, minutes: m };
                setA(updated);
                void saveAnswers(updated);
              }}
            />
          ) : (
            <Account answers={complete} reduced={reduced} />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- a question, asked by him ----------------------------------------------

/**
 * He asks in the bubble; once she answers, the bubble becomes his reply to it.
 * Continue waits for an answer (or `ready`, when one is already chosen).
 */
function Ask({
  pose,
  es,
  en,
  reaction,
  ready,
  cta = 'Continue',
  reduced,
  onNext,
  children,
}: {
  pose: Pose;
  es: string;
  en: string;
  reaction?: string;
  ready?: boolean;
  cta?: string;
  reduced: boolean;
  onNext: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise(0, reduced)} style={{ marginLeft: -8, marginBottom: 14 }}>
          {reaction ? (
            <MascotSays pose={pose} es={MASCOT_NAME} en={reaction} size="sm" reduced={reduced} />
          ) : (
            <MascotSays pose={pose} es={es} en={en} reduced={reduced} />
          )}
        </Animated.View>
        <View style={{ gap: 10 }} accessibilityRole="radiogroup" accessibilityLabel={en}>
          {children}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={cta} onPress={onNext} disabled={!reaction && !ready} />
      </View>
    </View>
  );
}

// --- the surprise: what Che teaches that the others don't -------------------

// Beginners get short words; people who already speak Spanish get whole
// sentences, where the differences pile up (and one of them, coger, matters).
const PHRASES = {
  beginner: [
    { book: '¿Tú tienes tiempo?', ba: '¿Vos tenés tiempo?', en: 'Do you have time?', audio: require('@/assets/audio/onboarding/b1.mp3') },
    { book: 'Vale', ba: 'Dale', en: 'OK, sure', audio: require('@/assets/audio/onboarding/b2.mp3') },
    { book: 'El autobús', ba: 'El colectivo', en: 'The bus', audio: require('@/assets/audio/onboarding/b3.mp3') },
    { book: '¡Qué guay!', ba: '¡Qué copado!', en: 'How cool!', audio: require('@/assets/audio/onboarding/b4.mp3') },
  ],
  advanced: [
    { book: '¿Tú quieres unas fresas?', ba: '¿Vos querés unas frutillas?', en: 'Do you want some strawberries?', audio: require('@/assets/audio/onboarding/a1.mp3') },
    { book: 'Coge el autobús en la esquina.', ba: 'Tomate el colectivo en la esquina.', en: 'Catch the bus at the corner.', audio: require('@/assets/audio/onboarding/a2.mp3') },
    { book: '¿Dónde aparco el coche?', ba: '¿Dónde estaciono el auto?', en: 'Where do I park the car?', audio: require('@/assets/audio/onboarding/a3.mp3') },
    { book: '¡Qué guay! Me mola mucho.', ba: '¡Qué copado! Me re copa.', en: 'How cool! I love it.', audio: require('@/assets/audio/onboarding/a4.mp3') },
  ],
};

/** One bundled clip at a time; the next press cuts the last one off. */
function useClip() {
  const player = useRef<AudioPlayer | null>(null);
  useEffect(() => () => player.current?.remove(), []);
  return async (source: number) => {
    const { createAudioPlayer } = await import('expo-audio');
    await setAudioSession('playback');
    player.current?.remove();
    const p = createAudioPlayer(source);
    player.current = p;
    p.play();
  };
}

function Flashcards({ advanced, reduced, onNext }: { advanced: boolean; reduced: boolean; onNext: () => void }) {
  const cards = advanced ? PHRASES.advanced : PHRASES.beginner;
  const [i, setI] = useState(0);
  const play = useClip();
  const card = cards[i];
  const last = i === cards.length - 1;
  // Each card says itself as it lands: hearing it is the surprise.
  useEffect(() => {
    const t = setTimeout(() => void play(card.audio), reduced ? 150 : 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.cardsTitle} accessibilityRole="header">
          Here&apos;s how Buenos Aires really talks
        </Text>
        <Animated.View key={i} entering={i === 0 ? rise(1, reduced) : slide(1, reduced)} style={styles.flash}>
          <View style={styles.flashTop}>
            <Text style={styles.flashLabel}>TEXTBOOK SPANISH</Text>
            <Text style={[styles.flashBook, advanced && styles.flashBookLong]}>{card.book}</Text>
          </View>
          <View style={styles.flashMid}>
            <Text style={[styles.flashLabel, { color: colors.onPastel, opacity: 0.8 }]}>IN BUENOS AIRES</Text>
            <View style={styles.flashBaRow}>
              <Text style={[styles.flashBa, advanced && styles.flashBaLong]}>{card.ba}</Text>
              <Pressable
                onPress={() => {
                  tap();
                  void play(card.audio);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Play: ${card.ba}`}
                hitSlop={6}
                style={({ pressed }) => [styles.speaker, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
                <MaterialCommunityIcons name="volume-high" size={22} color={colors.onPrimary} />
              </Pressable>
            </View>
          </View>
          <View style={styles.flashBottom}>
            <Text style={[styles.flashLabel, { color: colors.dangerInk }]}>MEANS</Text>
            <Text style={styles.flashEn}>{card.en}</Text>
          </View>
        </Animated.View>
        <View style={styles.dots} accessibilityLabel={`Card ${i + 1} of ${cards.length}`}>
          {cards.map((_, d) => (
            <View key={d} style={[styles.dot, d === i && styles.dotOn]} />
          ))}
        </View>
        <View style={{ flex: 1, minHeight: 16 }} />
        <View style={styles.cardsMascot}>
          <Image source={POSE.hand} style={{ width: 84, height: 104 }} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} the carpincho`} />
          <Animated.View entering={pop(300, reduced)} style={{ flex: 1, marginBottom: 24, transformOrigin: 'bottom left' }}>
            <SpeechBubble>
              <Text style={styles.cardsSays}>Suena distinto, ¿no? That&apos;s what I&apos;ll teach you.</Text>
            </SpeechBubble>
          </Animated.View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {last ? <Button title="Continue" onPress={onNext} /> : <Button title="Next one" variant="secondary" onPress={() => setI(i + 1)} />}
      </View>
    </View>
  );
}

// --- building: the plan on the grill ----------------------------------------

// How long each step takes, in ms. Uneven on purpose: the middle one has the
// most to do, and a row of identical beats reads as a fake progress bar.
const BUILD_STEPS = [1200, 1800, 1400];
const HOLD = 500;
const RING = 128;
const CIRC = 2 * Math.PI * RING;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Building({ reduced, why, minutes, onDone }: { reduced: boolean; why: Answers['why']; minutes: Minutes; onDone: () => void }) {
  const lines = [
    'Matching your level',
    why === 'trip' ? 'Picking phrases for your trip' : why === 'moving' ? 'Picking phrases for daily life' : 'Picking the phrases you need',
    `Pacing your plan to ${minutes} min a day`,
  ];
  const [done, setDone] = useState(0);
  const finished = useRef(onDone);
  finished.current = onDone;

  // The ring fills with the steps: each segment ends as its check lands.
  const total = BUILD_STEPS.reduce((s, x) => s + x, 0);
  const progress = useSharedValue(0);
  useEffect(() => {
    let at = 0;
    const ts = BUILD_STEPS.map((ms, i) => {
      at += ms;
      return setTimeout(() => setDone(i + 1), at);
    });
    ts.push(setTimeout(() => finished.current(), total + HOLD));
    let sum = 0;
    progress.value = withSequence(
      ...BUILD_STEPS.map((ms) => {
        sum += ms;
        return withTiming(sum / total, { duration: ms, easing: EASE_OUT });
      }),
    );
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - progress.value) }));

  return (
    <View style={styles.building}>
      <View style={styles.ringWrap}>
        <Svg width={280} height={280} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={140} cy={140} r={RING} stroke={colors.trough} strokeWidth={12} fill="none" />
          <AnimatedCircle
            cx={140}
            cy={140}
            r={RING}
            stroke={colors.primary}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRC}
            animatedProps={ringProps}
          />
        </Svg>
        <View style={styles.ringFace}>
          <Image source={POSE.asado} style={styles.buildingArt} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} grilling at an asado`} />
        </View>
        <Animated.View entering={pop(250, reduced)} style={styles.ringBubble}>
          <SpeechBubble style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
            <Text style={{ ...font.body[700], fontSize: 15, color: colors.ink }}>Un toque…</Text>
          </SpeechBubble>
        </Animated.View>
      </View>
      <Text style={styles.buildingTitle} accessibilityLiveRegion="polite">
        {MASCOT_NAME} is cooking your plan…
      </Text>
      <View style={{ gap: 16, alignSelf: 'stretch', paddingHorizontal: 16 }}>
        {lines.map((l, i) => (
          <View key={l} style={styles.buildRow}>
            <View style={styles.buildIcon}>
              {i < done ? (
                <Animated.View entering={reduced ? FadeIn.duration(120) : ZoomIn.duration(220).easing(EASE_OUT)} style={styles.buildCheck}>
                  <MaterialCommunityIcons name="check" size={15} color={colors.onPrimary} />
                </Animated.View>
              ) : i === done ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={styles.buildDot} />
              )}
            </View>
            <Text style={[styles.buildText, i > done && { color: colors.faint }]}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- the plan, as a ticket --------------------------------------------------

function PlanTicket({
  answers,
  reduced,
  onNext,
  onFaster,
}: {
  answers: Answers;
  reduced: boolean;
  onNext: () => void;
  onFaster: (m: Minutes) => void;
}) {
  const plan = buildPlan(answers);
  const words = MINUTES.find((m) => m.value === answers.minutes)?.words ?? 120;
  const from = LEVEL.find((l) => l.value === answers.level)?.short ?? '';
  const travel = answers.why === 'trip' || answers.why === 'moving';
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise(0, reduced)} style={{ marginLeft: -8, marginBottom: -14, zIndex: 1 }}>
          <MascotSays pose="gol" es="¡Pasaje listo!" en="Your ticket to Argentine Spanish." size="sm" reduced={reduced} />
        </Animated.View>

        <Animated.View entering={rise(2, reduced)} style={styles.ticket}>
          <LinearGradient colors={pastelGrad.lav} style={styles.ticketHead}>
            <Text style={styles.ticketBrand}>CHE · YOUR PLAN</Text>
            <MaterialCommunityIcons name={travel ? 'airplane' : 'ticket-confirmation-outline'} size={20} color={colors.onPastel} />
          </LinearGradient>
          <View style={styles.ticketRoute}>
            <TicketField label="FROM" value={from} big />
            <MaterialCommunityIcons name="arrow-right" size={22} color={colors.muted} />
            <TicketField label="TO" value={plan.to} big right />
          </View>
          <View style={styles.ticketGrid}>
            <TicketField label="ARRIVES" value={formatShortDate(plan.date)} />
            <TicketField label="DAILY" value={`${answers.minutes} min`} />
            <TicketField label="WORDS" value={`~${words}/mo`} />
          </View>
          <View style={styles.perforation}>
            <View style={[styles.notch, { left: -28 }]} />
            <View style={[styles.notch, { right: -28 }]} />
          </View>
          <View style={styles.stops}>
            <Text style={styles.fieldLabel}>STOPS ON THE WAY</Text>
            {plan.milestones.map((m, i) => (
              <View key={i} style={styles.stop}>
                <Text style={styles.stopWhen}>{m.when}</Text>
                <Text style={styles.stopWhat}>{m.what}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {plan.faster ? (
          <Animated.View entering={rise(4, reduced)} style={styles.faster}>
            <MaterialCommunityIcons name="rocket-launch-outline" size={18} color={colors.dangerInk} />
            <Text style={styles.fasterText}>
              Need it sooner? At <Text style={font.body[800]}>{plan.faster.minutes} min a day</Text> you&apos;d get there
              by {formatDate(plan.faster.date)}.{' '}
              <Text style={styles.fasterLink} onPress={() => onFaster(plan.faster!.minutes)}>
                Switch
              </Text>
            </Text>
          </Animated.View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Save my plan" onPress={onNext} />
      </View>
    </View>
  );
}

function TicketField({ label, value, big, right }: { label: string; value: string; big?: boolean; right?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: right ? 'flex-end' : 'flex-start' }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[big ? styles.fieldBig : styles.fieldValue, right && { textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}

// --- account: what keeps the plan ------------------------------------------

function explain(message: string): string {
  if (/already registered|already exists/i.test(message)) return 'That email already has an account. Sign in instead.';
  if (/password should be at least/i.test(message)) return 'The password needs at least 6 characters.';
  if (/provider is not enabled|unsupported provider/i.test(message)) return 'That sign-in option isn’t switched on yet. Use email for now.';
  if (/network|fetch/i.test(message)) return 'No connection. Try again.';
  return message;
}

const toPaywall = () => router.replace('/paywall?from=onboarding');

function Account({ answers, reduced }: { answers: Answers; reduced: boolean }) {
  const [mode, setMode] = useState<'social' | 'email'>('social');
  const [apple, setApple] = useState(false);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void appleAvailable().then(setApple);
  }, []);
  const plan = buildPlan(answers);

  const social = async (which: 'apple' | 'google') => {
    if (busy) return;
    tap();
    setBusy(which);
    setError(null);
    const res: SocialResult = which === 'apple' ? await signInWithApple() : await signInWithGoogle();
    if (res.status === 'ok') {
      // Email sign-ups carry the answers in their metadata; so do these.
      await supabase.auth.updateUser({ data: { onboarding: answers } }).catch(() => {});
      setBusy(null);
      return toPaywall();
    }
    setBusy(null);
    if (res.status === 'error') setError(explain(res.message));
  };

  if (mode === 'email') return <EmailAccount answers={answers} reduced={reduced} onBack={() => setMode('social')} />;

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
        {apple ? (
          <View pointerEvents={busy ? 'none' : 'auto'} style={{ opacity: busy === 'google' ? 0.5 : 1 }}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={27}
              style={{ height: 54 }}
              onPress={() => void social('apple')}
            />
          </View>
        ) : null}
        <Pressable
          onPress={() => void social('google')}
          disabled={!!busy}
          accessibilityRole="button"
          style={({ pressed }) => [styles.google, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          {busy === 'google' ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              <MaterialCommunityIcons name="google" size={20} color={colors.ink} />
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={() => setMode('email')} hitSlop={8} style={styles.switch} accessibilityRole="button">
          <Text style={styles.switchLink}>Use email instead</Text>
        </Pressable>
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

function EmailAccount({ answers, reduced, onBack }: { answers: Answers; reduced: boolean; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const cleanEmail = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) && password.length >= 6;

  const submit = async () => {
    if (!valid || busy) return;
    tap();
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { onboarding: answers } },
    });
    setBusy(false);
    if (err) return setError(explain(err.message));
    if (!data.session) return setNotice('We sent you an email to confirm the account. Then sign in.');
    toPaywall();
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Animated.View entering={rise(0, reduced)} style={{ marginLeft: -8, marginBottom: 18 }}>
        <MascotSays pose="tango" es="¡No lo pierdas!" en="Save your plan and I'll keep it safe for you." size="sm" reduced={reduced} />
      </Animated.View>
      <View style={{ gap: 16 }}>
        <Field
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (error) setError(null);
          }}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
        />
        <Field
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (error) setError(null);
          }}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!busy}
          hint="At least 6 characters."
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Button title="Create account" onPress={submit} loading={busy} disabled={!valid} />
        <Pressable onPress={onBack} hitSlop={8} style={styles.switch} accessibilityRole="button">
          <Text style={styles.switchLink}>Other ways to sign up</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/login')} hitSlop={8} style={styles.switch}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchLink}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
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
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, maxWidth: 520, width: '100%', alignSelf: 'center' },

  // flashcards
  cardsTitle: { ...type.title, fontSize: 25, lineHeight: 30, letterSpacing: -0.5, color: colors.ink, marginTop: 8, marginBottom: 18 },
  flash: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', boxShadow: clay.surface },
  flashTop: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16 },
  flashMid: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 20, backgroundColor: pastel.butter },
  flashBottom: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 20 },
  flashLabel: { ...font.body[800], fontSize: 11.5, letterSpacing: 1, color: colors.muted },
  flashBook: { ...font.body[600], marginTop: 6, fontSize: 21, lineHeight: 26, color: colors.muted, textDecorationLine: 'line-through', textDecorationColor: colors.faint },
  flashBookLong: { fontSize: 18, lineHeight: 23 },
  flashBaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  flashBa: { ...font.display[800], flex: 1, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: colors.primaryDark },
  flashBaLong: { fontSize: 24, lineHeight: 29, letterSpacing: -0.5 },
  flashEn: { ...font.display[700], marginTop: 4, fontSize: 22, lineHeight: 28, letterSpacing: -0.3, color: colors.ink },
  speaker: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, boxShadow: clay.button },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.trough },
  dotOn: { width: 22, backgroundColor: colors.primary },
  cardsMascot: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginLeft: -12 },
  cardsSays: { ...font.body[600], fontSize: 15.5, lineHeight: 21, color: colors.ink },

  // building
  building: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, maxWidth: 440, width: '100%', alignSelf: 'center' },
  ringWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  ringFace: { width: 236, height: 236, borderRadius: 118, backgroundColor: colors.card, boxShadow: clay.surface, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  buildingArt: { width: 200, height: 200, marginTop: 18 },
  ringBubble: { position: 'absolute', right: -14, top: 2, transformOrigin: 'bottom left' },
  buildingTitle: { ...type.title, fontSize: 24, letterSpacing: -0.4, color: colors.ink, marginTop: 26, marginBottom: 22 },
  buildRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  buildIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  buildCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  buildDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.trough },
  buildText: { ...font.body[600], fontSize: 16, color: colors.ink },

  // ticket
  ticket: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', boxShadow: clay.surface },
  ticketHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  ticketBrand: { ...font.body[800], fontSize: 12, letterSpacing: 1.4, color: colors.onPastel },
  ticketRoute: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  ticketGrid: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 },
  fieldLabel: { ...font.body[800], fontSize: 10.5, letterSpacing: 1.1, color: colors.muted },
  fieldBig: { ...font.display[800], marginTop: 3, fontSize: 21, lineHeight: 25, letterSpacing: -0.5, color: colors.ink },
  fieldValue: { ...font.body[800], marginTop: 3, fontSize: 15.5, lineHeight: 20, color: colors.ink },
  perforation: { height: 0, marginHorizontal: 16, borderTopWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  notch: { position: 'absolute', top: -12, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg, boxShadow: clay.trough },
  stops: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  stop: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingVertical: 7 },
  stopWhen: { ...font.body[800], width: 58, fontSize: 12.5, color: colors.primary },
  stopWhat: { ...font.body[600], flex: 1, fontSize: 14.5, lineHeight: 19, color: colors.ink },
  faster: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: radius.md, backgroundColor: pastel.peach, boxShadow: clay.surface, marginTop: 16 },
  fasterText: { ...font.body[600], flex: 1, fontSize: 14.5, lineHeight: 20, color: colors.onPastel },
  fasterLink: { ...font.body[800], textDecorationLine: 'underline' },

  // account
  accountHero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, maxWidth: 520, width: '100%', alignSelf: 'center' },
  accountSays: { ...font.body[700], fontSize: 18, lineHeight: 24, color: colors.ink, textAlign: 'center' },
  accountArt: { width: 170, height: 210, marginTop: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.card, boxShadow: clay.surface },
  chipText: { ...font.body[700], fontSize: 13.5, color: colors.primaryDark },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  googleText: { ...font.body[800], fontSize: 17, color: colors.ink },
  legal: { ...font.body[500], fontSize: 12.5, lineHeight: 17, color: colors.muted, textAlign: 'center', paddingHorizontal: 16 },
  legalLink: { color: colors.primaryDark, textDecorationLine: 'underline' },

  error: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.dangerInk },
  notice: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.primaryDark },
  switch: { alignSelf: 'center', paddingVertical: 6 },
  switchText: { ...font.body[600], fontSize: 15, color: colors.muted },
  switchLink: { ...font.body[800], color: colors.primary, fontSize: 15 },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { OUT } from '@/components/cheer-bits';
import { Flame } from '@/components/flame';
import { Button } from '@/components/ui';
import { wordOf } from '@/lib/widget-day';
import { addWidget, WIDGET_PROMO_SUPPORTED, widgetPlaced } from '@/lib/widget-promo';
import { clay, colors, font, pastel, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The home screen widget promo (design: https://claude.ai/artifact/XsKw4cxJfGfThgZhi95Rci).
//
// It follows the streak cheer, the way Duolingo sells its widget: at a happy
// moment, as Pancho guarding the streak rather than "a widget". Only from day 2
// of a streak (day 1 has nothing to guard), never once a widget is placed, at
// most 3 times, 3 days apart. Android adds it in one tap through the
// launcher's dialog; iOS can't, so the button opens three short steps.
// Account keeps a row to it for good (offerWidget there).
// ---------------------------------------------------------------------------

const KEY = 'widget-promo';
const MAX_SHOWS = 3;
const GAP = 3 * 24 * 60 * 60 * 1000;

interface Seen {
  shows: number;
  last: number;
}

async function seen(): Promise<Seen> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Seen) : { shows: 0, last: 0 };
  } catch {
    return { shows: 0, last: 0 };
  }
}

/** Whether the promo should follow today's streak cheer. */
export async function shouldOfferWidget(streak: number): Promise<boolean> {
  if (!WIDGET_PROMO_SUPPORTED || streak < 2) return false;
  const s = await seen();
  if (s.shows >= MAX_SHOWS || Date.now() - s.last < GAP) return false;
  return (await widgetPlaced()) !== true;
}

async function noteShown() {
  const s = await seen();
  await AsyncStorage.setItem(KEY, JSON.stringify({ shows: s.shows + 1, last: Date.now() })).catch(() => {});
}

type Source = 'streak' | 'account';

export function WidgetPromo({ streak, source, onDone }: { streak: number; source: Source; onDone: () => void }) {
  const posthog = usePostHog();
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    if (source === 'streak') void noteShown();
    posthog?.capture('widget_promo_shown', { source, streak, platform: Platform.OS });
  }, [posthog, source, streak]);

  // Back from the launcher's dialog or the home screen: was one added?
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void widgetPlaced().then((placed) => {
        if (!placed) return;
        posthog?.capture('widget_added', { source, platform: Platform.OS });
        onDone();
      });
    });
    return () => sub.remove();
  }, [onDone, posthog, source]);

  const add = async () => {
    posthog?.capture('widget_promo_add', { source, platform: Platform.OS });
    if ((await addWidget()) === 'guide') setGuide(true);
  };

  const later = () => {
    posthog?.capture('widget_promo_dismiss', { source, platform: Platform.OS });
    onDone();
  };

  if (guide) return <Steps onDone={onDone} />;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Pressable onPress={later} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} style={styles.close}>
          <Ionicons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(320).easing(OUT)} style={styles.home}>
        <View style={styles.homeTop}>
          <WidgetPreview streak={streak} />
          <View style={styles.appColumn}>
            <View style={styles.app} />
            <View style={styles.app} />
          </View>
        </View>
        <View style={styles.appRow}>
          {Array.from({ length: 4 }, (_, i) => (
            <View key={i} style={styles.appSmall} />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(120).duration(260)} style={styles.copy}>
        <Text style={styles.title} accessibilityRole="header">
          Keep Pancho on your home screen
        </Text>
        <Text style={styles.body}>
          {streak >= 2
            ? `A new Argentine word every morning. And if your ${streak} day streak is in danger, he'll let you know.`
            : "A new Argentine word every morning. And on days you haven't practiced, he'll let you know."}
        </Text>
      </Animated.View>

      <View style={styles.flex} />

      <View style={styles.buttons}>
        <Button title={Platform.OS === 'android' ? 'Add to home screen' : 'Add the widget'} onPress={() => void add()} />
        <Button title="Not now" variant="ghost" onPress={later} />
      </View>
    </View>
  );
}

const SCENES = [
  require('@/assets/images/widget/scene-morning-small.png'),
  require('@/assets/images/widget/scene-fire-small.png'),
  require('@/assets/images/widget/scene-goal-small.png'),
];

/** The small widget going through its day: the word, a crying Pancho, the goal. */
function WidgetPreview({ streak }: { streak: number }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const word = wordOf();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 3), 2600);
    return () => clearInterval(id);
  }, [reduced]);

  const lit = step === 2;
  return (
    <View style={styles.widget} accessibilityLabel="The Posta widget on a home screen" accessible>
      <Animated.View key={step} entering={FadeIn.duration(240)} exiting={FadeOut.duration(180)} style={StyleSheet.absoluteFill}>
        <Image source={SCENES[step]} style={StyleSheet.absoluteFill} contentFit="cover" />
        {step === 0 ? (
          <View style={styles.wordBox}>
            <Text style={styles.wotd}>WORD OF THE DAY</Text>
            <Text style={styles.word} numberOfLines={1} adjustsFontSizeToFit>
              {word.es}
            </Text>
            <Text style={styles.gloss} numberOfLines={1}>
              {word.en}
            </Text>
          </View>
        ) : (
          <>
            <Image
              source={
                step === 1
                  ? require('@/assets/images/capybara/capybara-crying-figure.png')
                  : require('@/assets/images/capybara/widget-futbol-gol.png')
              }
              style={styles.pancho}
              contentFit="contain"
            />
            <Text style={[styles.line, step === 1 && styles.lineLight]}>{step === 1 ? "You're killing me!" : 'Goooal!'}</Text>
          </>
        )}
        <View style={[styles.chip, lit && styles.chipLit]}>
          <Flame size={13} still={!lit} />
          <Text style={styles.chipText}>{lit ? streak + 1 : streak}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const STEPS = [
  'Press and hold an empty spot on your home screen',
  Platform.OS === 'android' ? 'Tap Widgets in the menu that pops up' : 'Tap Edit at the top, then Add Widget',
  Platform.OS === 'android'
    ? 'Find Posta, then hold the widget and drag it onto your screen'
    : 'Search for Posta and tap Add Widget',
];

function Steps({ onDone }: { onDone: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.flex} />
      <Text style={[styles.title, styles.stepsTitle]} accessibilityRole="header">
        Three steps, ten seconds
      </Text>
      <View style={styles.steps}>
        {STEPS.map((text, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(260).easing(OUT)} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{text}</Text>
          </Animated.View>
        ))}
      </View>
      <View style={styles.tip}>
        <Image source={require('@/assets/images/capybara/widget-saludando.png')} style={styles.tipArt} contentFit="contain" />
        <Text style={styles.tipText}>Pick the small one or the wide one. The wide one adds an example sentence.</Text>
      </View>
      <View style={styles.flex} />
      <Button title="Got it" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, paddingBottom: 16, gap: 20, maxWidth: 440, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  // Close sits on the left: the floating feedback button owns the top right.
  top: { flexDirection: 'row', justifyContent: 'flex-start' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  home: {
    alignSelf: 'center',
    width: 300,
    borderRadius: 40,
    backgroundColor: pastel.lav,
    boxShadow: clay.surface,
    padding: 22,
    gap: 22,
  },
  homeTop: { flexDirection: 'row', gap: 18 },
  widget: { width: 156, height: 156, borderRadius: 26, overflow: 'hidden', boxShadow: `0 0 0 2.5px ${colors.ink}` },
  appColumn: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  app: { width: 66, height: 66, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.55)' },
  appRow: { flexDirection: 'row', justifyContent: 'space-between' },
  appSmall: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.55)' },
  wordBox: { position: 'absolute', left: 10, right: 10, bottom: 12 },
  wotd: { ...font.body[700], fontSize: 10, letterSpacing: 0.4, color: colors.muted },
  word: { ...font.display[900], fontSize: 24, color: colors.ink },
  gloss: { ...font.body[700], fontSize: 12, color: colors.muted },
  pancho: { position: 'absolute', left: 28, top: 18, width: 100, height: 108 },
  line: { position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', ...font.display[900], fontSize: 17, color: colors.ink },
  lineLight: { color: colors.card },
  chip: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    boxShadow: `0 0 0 2px ${colors.ink}`,
  },
  chipLit: { backgroundColor: pastel.butter },
  chipText: { ...font.body[800], fontSize: 13, color: colors.ink },
  copy: { gap: 10, paddingHorizontal: 8 },
  title: { ...font.display[800], fontSize: 28, lineHeight: 31, letterSpacing: -0.3, color: colors.ink, textAlign: 'center' },
  body: { ...font.body[600], fontSize: 16, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  buttons: { gap: 6 },
  stepsTitle: { fontSize: 24, lineHeight: 28 },
  steps: { gap: 14 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    boxShadow: clay.surface,
  },
  stepNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: pastel.lav, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { ...font.display[900], fontSize: 18, color: colors.ink },
  stepText: { flex: 1, ...font.body[800], fontSize: 17, lineHeight: 22, color: colors.ink },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: pastel.butter,
    borderRadius: radius.sm,
    padding: 12,
    boxShadow: `0 0 0 2px ${colors.ink}`,
  },
  tipArt: { width: 34, height: 50 },
  tipText: { flex: 1, ...font.body[700], fontSize: 14, lineHeight: 19, color: colors.ink },
});

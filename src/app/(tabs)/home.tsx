import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Fragment, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Guidebook } from '@/components/guidebook';
import { Button, Panel } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { localDateStr, WEEKDAY_INITIALS, weekDates } from '@/lib/dates';
import {
  type Course,
  currentIndex,
  loadCheckAttempts,
  loadCourse,
  loadProgress,
  type PathLesson,
  sectionAt,
  sectionSummaries,
} from '@/lib/course';
import { maxUnitsInTest } from '@/lib/placement';
import {
  enablePartnerReminders,
  enablePush,
  getPartnerId,
  getPushStatus,
  type PushStatus,
} from '@/lib/push';
import { getMistakeCount, getPracticeCounts } from '@/lib/session';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { streakStatus, type StreakStatus } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { colors, frost, path, radius, shadow } from '@/lib/theme';
import type { LessonKind, Section, Streak, Unit } from '@/lib/types';

interface HomeData {
  course: Course;
  /** Her step on the road: the first lesson she hasn't finished. */
  current: number;
  streak: Streak | null;
  /** Words she has met at all; the road's first step is only "start" until one. */
  known: number;
  /** Which days of this week she has already completed, as YYYY-MM-DD. */
  weekDone: string[];
  /** Words she has missed lately and not got right since — the Mistakes entry. */
  mistakes: number;
  /** Unit checks tried and not yet passed, by lesson id: attempts so far. */
  checkAttempts: Map<string, number>;
}

// ---------------------------------------------------------------------------
// The path — a Duolingo-style trail of "coin" buttons winding down the screen.
// One coin per lesson of the course, in order: the ones she has finished, the
// current step (the only tappable one), and the rest of the road locked ahead
// of her. Each unit opens with a banner naming what it teaches.
//
// A node's whole look — size, colour, icon, ring — is derived from one number,
// its phase: 0 locked, 1 current, 2 done. That is what makes finishing a lesson
// animatable: the step she just finished runs 1 → 2 while the next runs 0 → 1.
// ---------------------------------------------------------------------------

const NODE = 62;
const NODE_ACTIVE = 74;
const RING_PAD = 5;
const RING_BORDER = 3;
/** The current step is drawn bigger by scaling, so the row never reflows. */
const ACTIVE_SCALE = NODE_ACTIVE / NODE;
// The coin and freeze palettes live in theme.ts — see `path` and `frost` there
// for why the freeze blue is the one hue allowed outside Che's palette.
const LOCKED_FACE = path.lockedFace;
const ICE_INK = frost.ink;
const ICE_FACE = frost.face;
const FROZEN_BG = frost.bg;
const RING_RGB = path.ringRgb;
const COIN_SHADOW = path.coinShadow;

// Every row is the same square whatever its phase, so the road's geometry is
// arithmetic: no measuring, and scrolling to a step is exact the instant the
// step exists.
const BOX = NODE + 2 * (RING_PAD + RING_BORDER);
const STEP_GAP = 28;
const STEP_PITCH = BOX + STEP_GAP;
/** Breathing room before the first node. */
const PATH_TOP = 24;
/** A unit's banner is a fixed-height row too, so it folds into the arithmetic. */
const BANNER_H = 76;
const BANNER_GAP = 26;
const BANNER_PITCH = BANNER_H + BANNER_GAP;
/** So is the header that opens a section. */
const SECTION_H = 64;
const SECTION_GAP = 22;
const SECTION_PITCH = SECTION_H + SECTION_GAP;
/** Where step `i` sits, given the banners and section headers standing above it. */
const stepY = (i: number, bannersAbove: number, sectionsAbove: number) =>
  PATH_TOP + bannersAbove * BANNER_PITCH + sectionsAbove * SECTION_PITCH + i * STEP_PITCH;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
/** The step she just finished stamps itself done; the next one lights up after. */
const LEAVE_MS = 420;
const ENTER_DELAY = 170;
const ENTER_MS = 430;
/** Half a breath of the current step's ring — the only thing still moving. */
const BREATHE_MS = 1300;
/** Horizontal S-curve: one full wave every 8 steps. */
const swing = (i: number) => Math.round(Math.sin((i * Math.PI) / 4) * 78);
// A step's icon is its own, whatever phase it is in: locked it is a grey hint
// of what's coming, and it lights up when she gets there. Marks of the place
// beat generic book/headset/dumbbell icons: the road she is walking should look
// like where the language is spoken.
//
// Six marks of the place the language comes from, cycling down the road so no
// two neighbouring steps wear the same one. Solid weights only: at 27pt an
// outline glyph goes to lace against a filled coin.
const STEP_ICONS = [
  { set: 'mdi', name: 'white-balance-sunny', size: 30 },  // el sol de mayo
  { set: 'fa5', name: 'mug-hot' },                        // el mate
  { set: 'fa5', name: 'guitar' },                         // el tango
  { set: 'fa5', name: 'futbol' },                         // el fútbol
  { set: 'mdi', name: 'book-open-variant', size: 30 },    // la lectura
  { set: 'fa5', name: 'drumstick-bite' },                 // el asado
] as const;

type StepIcon = (typeof STEP_ICONS)[number] | { set: 'mdi' | 'fa5'; name: string; size?: number };

/** A lesson that isn't new material wears what it is, not the next ornament. */
const KIND_ICONS: Partial<Record<LessonKind, StepIcon>> = {
  story: { set: 'mdi', name: 'book-open-page-variant', size: 30 },
  practice: { set: 'mdi', name: 'dumbbell' },
  review: { set: 'fa5', name: 'trophy' },
  checkpoint: { set: 'fa5', name: 'trophy' },
};

/** One size for every phase — the coin's own scale is what makes hers bigger. */
const ICON_SIZE = 27;

/** One glyph, either family, so a step's icon can come from whichever set
 *  draws it best. Colour is a prop on an icon font, hence two of these per
 *  coin rather than one animated colour. */
function StepGlyph({ icon, color }: { icon: StepIcon; color: string }) {
  const size = 'size' in icon ? icon.size : ICON_SIZE;
  return icon.set === 'mdi' ? (
    <MaterialCommunityIcons name={icon.name as never} size={size} color={color} />
  ) : (
    <FontAwesome5 name={icon.name} size={size} color={color} solid />
  );
}

// On web, react-native-web turns this into a real CSS transition so the coin
// press eases instead of snapping.
const webTransition =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: '100ms',
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as unknown as ViewStyle)
    : undefined;

// ---------------------------------------------------------------------------
// Figuritas — ornaments standing along the road, the way Duolingo dots its
// path with characters. They scroll with the path because they belong to it.
//
// The figuritas are the capybara mascot (sources in assets/images/mascot/). To
// add another: cut it out with the `cutout()` helper in scripts/cutout-figure.py
// into assets/images/capybara/capybara-<name>-figure.png, then drop it in FIGURES with its own width/height. They
// cycle down the road in order, so each entry takes the next slot and the set
// only repeats once she has passed all of them.
//
// These are cut-outs, not the boxed app icon — a figure standing on the page
// reads as part of the world; a rounded tile reads as a button she can't press.
// Keep the widths under ~115 so the figure never crowds the coin, even when
// the road swings fully to its side on a narrow phone. That is where the two
// meet: on a 320pt screen the path is 280 wide, and a node swung its full 78
// out leaves 179pt of clear margin opposite it, minus the breathing room a
// figure needs not to look glued to the coin.
//
// Each height is the source PNG's own aspect at that width. `contentFit` would
// letterbox a wrong one rather than distort it, so a stale height costs dead
// space in the row instead of a squashed figure.
// ---------------------------------------------------------------------------
const FIGURES = [
  { source: require('@/assets/images/capybara/capybara-gaucho-figure.png'), width: 68, height: 116 },
  { source: require('@/assets/images/capybara/capybara-asado-figure.png'), width: 107, height: 116 },
  { source: require('@/assets/images/capybara/capybara-mate-figure.png'), width: 85, height: 116 },
  { source: require('@/assets/images/capybara/capybara-futbol-pateando-figure.png'), width: 109, height: 116 },
  { source: require('@/assets/images/capybara/capybara-facturas-figure.png'), width: 92, height: 116 },
  { source: require('@/assets/images/capybara/capybara-tango-figure.png'), width: 86, height: 116 },
  { source: require('@/assets/images/capybara/capybara-milanesa-figure.png'), width: 94, height: 116 },
  { source: require('@/assets/images/capybara/capybara-saludando-figure.png'), width: 78, height: 116 },
  { source: require('@/assets/images/capybara/capybara-empanadas-figure.png'), width: 76, height: 116 },
  { source: require('@/assets/images/capybara/capybara-mate-amargo-figure.png'), width: 78, height: 116 },
  { source: require('@/assets/images/capybara/capybara-futbol-gol-figure.png'), width: 94, height: 116 },
  { source: require('@/assets/images/capybara/capybara-alfajor-figure.png'), width: 90, height: 116 },
  { source: require('@/assets/images/capybara/capybara-choripan-figure.png'), width: 90, height: 116 },
  { source: require('@/assets/images/capybara/capybara-gaucho-cafe-figure.png'), width: 89, height: 116 },
  { source: require('@/assets/images/capybara/capybara-dulce-de-leche-figure.png'), width: 87, height: 116 },
  { source: require('@/assets/images/capybara/capybara-mate-sorbiendo-figure.png'), width: 78, height: 116 },
  { source: require('@/assets/images/capybara/capybara-alfajor-maicena-figure.png'), width: 90, height: 116 },
];

// One figure per arc, standing in the bay the road leaves as it curves away.
// The road is a sine wave eight steps long, so an arc is four steps and its
// apex — the step that swings furthest out — is where the opposite margin is
// widest. That is the only place a figure this size fits without crowding the
// coins above and below it.
const FIGURE_FIRST = 2;
const FIGURE_EVERY = 4;

type Figure = (typeof FIGURES)[number] & { side: 'left' | 'right' };

function figureFor(index: number): Figure | null {
  if (index < FIGURE_FIRST || (index - FIGURE_FIRST) % FIGURE_EVERY !== 0) return null;
  const slot = (index - FIGURE_FIRST) / FIGURE_EVERY;
  // Always opposite the node's swing, so the coin and the figure never crowd
  // each other however far the road curves.
  return { ...FIGURES[slot % FIGURES.length], side: swing(index) > 0 ? 'left' : 'right' };
}

/** 0 locked · 1 current · 2 done. */
type Phase = 0 | 1 | 2;

// Each node animates to its own phase, so the parent only has to say where the
// path is now: the step she finished is handed a 2, the next one a 1, and the
// two moves choreograph themselves. The next step waits a beat before lighting
// up, so the eye reads "this one is finished" before "that one is yours".
const MOVE = {
  2: { duration: LEAVE_MS, delay: 0, easing: EASE_IN_OUT },
  1: { duration: ENTER_MS, delay: ENTER_DELAY, easing: EASE_OUT },
  0: { duration: 260, delay: 0, easing: EASE_OUT },
} as const;

function PathStep({
  index,
  phase,
  reduced,
  label,
  kind,
  attempts,
  onPress,
}: {
  index: number;
  phase: Phase;
  reduced: boolean;
  /** What the coin is, for screen readers: "Lesson 2 · Hola, che". */
  label: string;
  kind: LessonKind;
  /** A unit check tried and not passed yet: attempts so far, out of three. */
  attempts?: number;
  onPress?: () => void;
}) {
  // A step mounts wherever it already is and only moves when the path moves
  // under it. That is why the screen opens on her *old* position (see
  // `lastShown`) and advances a beat later: the move has to happen while she is
  // watching, not before the first paint.
  const start = useRef(phase).current;
  const p = useRef(new Animated.Value(start)).current;
  const mounted = useRef(false);
  const stepIcon: StepIcon = KIND_ICONS[kind] ?? STEP_ICONS[index % STEP_ICONS.length];
  // The ring around the current step is the only "tap here" left on the path,
  // so it breathes: out and faint, back in and solid, forever until she does.
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 1 || reduced) {
      breath.setValue(0);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: BREATHE_MS,
          easing: Easing.inOut(Easing.quad),
          // Shares a view with the ring's animated colour, which the native
          // driver can't take.
          useNativeDriver: false,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: BREATHE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [phase, reduced, breath]);

  useEffect(() => {
    // A node that mounts already in its phase has nothing to animate — only a
    // move she would have seen counts.
    const first = !mounted.current;
    mounted.current = true;
    if (first && start === phase) return;
    if (reduced) {
      p.setValue(phase);
      return;
    }
    const { duration, delay, easing } = MOVE[phase];
    const move = Animated.timing(p, {
      toValue: phase,
      duration,
      delay,
      easing,
      // Colours can't ride the native driver, and the whole look is one value.
      useNativeDriver: false,
    });
    move.start();
    return () => move.stop();
  }, [phase, reduced, p, start]);

  const at = (outputRange: number[], inputRange = [0, 1, 2]) =>
    p.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });

  // The coin swells past its final size as it lights up, then settles; going
  // done it dips, the way a stamp presses in.
  const scale = at(
    [1, ACTIVE_SCALE * 1.05, ACTIVE_SCALE, 0.97, 1],
    [0, 0.78, 1, 1.62, 2],
  );
  const face = p.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [LOCKED_FACE, colors.primary, colors.primary],
    extrapolate: 'clamp',
  });
  const ring = p.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [`rgba(${RING_RGB}, 0)`, `rgba(${RING_RGB}, 1)`, `rgba(${RING_RGB}, 0)`],
    extrapolate: 'clamp',
  });

  const breatheScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const breatheFade = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 0.32] });

  // The icon never changes — only its colour does, and it does it by
  // crossfading two copies of the same glyph in place, since a colour on an
  // icon font is a prop rather than something the driver can interpolate.
  // Grey while the step is locked, lit from the moment she reaches it and for
  // good after: a finished step keeps the ornament it was, so the road behind
  // her reads as a row of different things instead of a column of ticks.
  const iconDim = at([1, 0, 0], [0, 0.55, 2]);
  const iconLit = at([0, 1, 1], [0, 0.55, 2]);

  const coin = (pressed: boolean) => (
    <Animated.View style={[styles.nodeBox, { transform: [{ scale }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          { borderColor: ring, opacity: breatheFade, transform: [{ scale: breatheScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.coin,
          { backgroundColor: face },
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webTransition,
        ]}>
        <Animated.View style={[styles.icon, { opacity: iconDim }]}>
          <StepGlyph icon={stepIcon} color={path.lockedGlyph} />
        </Animated.View>
        <Animated.View style={[styles.icon, { opacity: iconLit }]}>
          <StepGlyph icon={stepIcon} color={colors.onPrimary} />
        </Animated.View>
      </Animated.View>
      {attempts ? (
        // Pinned to the coin's corner, outside the row's arithmetic.
        <View style={styles.attempts} pointerEvents="none">
          <Text style={styles.attemptsText}>{attempts}/3</Text>
        </View>
      ) : null}
    </Animated.View>
  );

  const figure = figureFor(index);

  return (
    <View style={styles.step}>
      {figure ? (
        <View
          style={[styles.figureSlot, figure.side === 'left' ? { left: 0 } : { right: 0 }]}
          pointerEvents="none">
          <Image
            source={figure.source}
            style={{ width: figure.width, height: figure.height }}
            contentFit="contain"
            accessible={false}
          />
        </View>
      ) : null}

      <View
        style={[
          styles.stepNode,
          { transform: [{ translateX: swing(index) }] },
        ]}>
        {onPress ? (
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Start: ${label}`}
            hitSlop={8}
            style={styles.nodeBox}>
            {({ pressed }) => coin(pressed)}
          </Pressable>
        ) : (
          <View
            style={styles.nodeBox}
            accessible
            accessibilityLabel={`${label}: ${phase === 2 ? 'done' : 'locked'}`}>
            {coin(false)}
          </View>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// SectionBar — the top of the road. The road holds one section, the way
// Duolingo's does, so the bar says which one and is the way to the map of all
// of them: tap it and the sections screen opens.
// ---------------------------------------------------------------------------
function SectionBar({ section, onPress }: { section: Section; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Shows every section of the course"
      accessibilityLabel={`Section ${section.ordinal}: ${section.title_en}, level ${section.cefr}`}
      style={({ pressed }) => [styles.sectionBar, { transform: [{ scale: pressed ? 0.98 : 1 }] }, webTransition]}>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionEyebrow}>
          SECTION {section.ordinal} · {section.cefr}
        </Text>
        <Text style={styles.sectionName} numberOfLines={1}>
          {section.title_en}
        </Text>
      </View>
      <View style={styles.sectionMap}>
        <Ionicons name="list" size={20} color={colors.primary} />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// SectionEnd — where the road stops. It names the section that comes next and,
// when she has got there, takes her onto it; one still ahead says what opens
// it, and offers the jump test when that can reach it in one sitting.
// ---------------------------------------------------------------------------
function SectionEnd({
  next,
  onOpen,
  onJump,
}: {
  next: { section: Section; units: Unit[] } | null;
  onOpen?: () => void;
  onJump?: () => void;
}) {
  if (!next) {
    return (
      <View style={styles.sectionEnd}>
        <MaterialCommunityIcons name="white-balance-sunny" size={28} color={colors.primary} />
        <Text style={styles.sectionEndTitle}>That's the whole course, for now</Text>
        <Text style={styles.sectionEndText}>More sections are on the way.</Text>
      </View>
    );
  }
  const { section, units } = next;
  return (
    <View style={styles.sectionEnd}>
      <Text style={styles.sectionEyebrow}>UP NEXT · SECTION {section.ordinal}</Text>
      <Text style={styles.sectionEndTitle}>{section.title_en}</Text>
      <Text style={styles.sectionEndText}>
        {section.cefr} · {units.length} units
        {onOpen ? '' : ' · opens when you finish this section'}
      </Text>
      {onOpen ? (
        <Button title={`Go to section ${section.ordinal}`} onPress={onOpen} />
      ) : onJump ? (
        <Button title="Jump ahead" variant="secondary" onPress={onJump} />
      ) : (
        <Ionicons name="lock-closed" size={18} color={colors.faint} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// UnitBanner — the row that opens each unit on the road: which unit, what it's
// called, and the one line of what it teaches. The unit she is in wears the
// primary; finished ones keep a tick; the ones ahead stay quiet and locked.
// A fixed height, like every row on the road, so scrolling to a step stays
// arithmetic.
// ---------------------------------------------------------------------------
type UnitState = 'done' | 'current' | 'locked';

function UnitBanner({ lesson, state, onPress }: { lesson: PathLesson; state: UnitState; onPress: () => void }) {
  const current = state === 'current';
  const { unit } = lesson;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.banner,
        current && styles.bannerCurrent,
        state === 'locked' && styles.bannerLocked,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
        webTransition,
      ]}
      accessibilityRole="button"
      accessibilityHint="Opens the unit guidebook"
      accessibilityLabel={`Unit ${unit.ordinal}: ${unit.title_en}. ${unit.summary_en}`}>
      <View style={styles.bannerText}>
        <Text style={[styles.bannerEyebrow, current && styles.onPrimaryMuted]}>UNIT {unit.ordinal}</Text>
        <Text style={[styles.bannerTitle, current && styles.onPrimary]} numberOfLines={1}>
          {unit.title_en}
        </Text>
        <Text style={[styles.bannerSummary, current && styles.onPrimaryMuted]} numberOfLines={1}>
          {unit.summary_en}
        </Text>
      </View>
      {state === 'done' ? (
        <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
      ) : state === 'locked' ? (
        <Ionicons name="lock-closed" size={17} color={colors.faint} />
      ) : (
        <Ionicons name="book-outline" size={20} color={colors.onPrimary} style={{ opacity: 0.85 }} />
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Notificaciones — the one thing Perfil still had to say. It is a prompt, not
// a setting: there is nothing to choose any more (the reminders run on a fixed
// schedule), only a permission the browser has to be asked for. So it shows up
// when it is actionable and disappears for good once it is granted.
// ---------------------------------------------------------------------------
function PushPrompt({
  userId,
  status,
  onStatus,
}: {
  userId: string;
  status: PushStatus;
  onStatus: (s: PushStatus) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set right after her own reminders switch on, when she has a linked partner. */
  const [partner, setPartner] = useState<'ask' | 'sharing' | { result: string } | null>(null);

  const enable = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await enablePush(userId);
      // Asked here, while she's already thinking about reminders — not as a
      // standing banner. The prompt stays on screen for it even though her own
      // status has just become enabled.
      if (next === 'enabled' && (await getPartnerId(userId))) setPartner('ask');
      onStatus(next);
    } catch (e) {
      // A failure used to fall through as "off", which looks exactly like a tap
      // that did nothing. Say what went wrong; the button stays to try again.
      setError(e instanceof Error ? e.message : 'No se pudieron activar las notificaciones.');
    } finally {
      setBusy(false);
    }
  };

  const sharePartner = async () => {
    setPartner('sharing');
    try {
      const devices = await enablePartnerReminders();
      setPartner({
        result:
          devices > 0
            ? 'Done — your partner gets reminders too.'
            : "Your partner hasn't switched on notifications on any device yet.",
      });
    } catch (e) {
      setPartner({ result: e instanceof Error ? e.message : 'No se pudo activar.' });
    }
  };

  if (partner) {
    return (
      <Panel style={{ gap: 10 }}>
        <Text style={styles.sectionTitle}>Notifications are on</Text>
        {typeof partner === 'object' ? (
          <>
            <Text style={styles.mutedText}>{partner.result}</Text>
            <Button title="Close" variant="ghost" onPress={() => setPartner(null)} />
          </>
        ) : (
          <>
            <Text style={styles.mutedText}>Switch reminders on for your partner too?</Text>
            <Button
              title="Switch theirs on"
              variant="secondary"
              onPress={sharePartner}
              loading={partner === 'sharing'}
            />
            <Button title="Not now" variant="ghost" onPress={() => setPartner(null)} />
          </>
        )}
      </Panel>
    );
  }

  if (status === 'enabled' || status === 'unsupported') return null;

  return (
    <Panel style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      {status === 'needs_install' ? (
        <Text style={styles.mutedText}>
          To get reminders on an iPhone, add the app to your home screen first: in Safari tap{' '}
          <Text style={{ fontWeight: '700' }}>Share</Text> →{' '}
          <Text style={{ fontWeight: '700' }}>Add to Home Screen</Text>, then open it from there.
        </Text>
      ) : status === 'denied' ? (
        <Text style={styles.mutedText}>
          {Platform.OS === 'web'
            ? 'Notifications are blocked. Switch them on in your browser settings.'
            : 'Notifications are blocked. Switch them on in Settings → Che → Notifications.'}
        </Text>
      ) : (
        <>
          <Text style={styles.mutedText}>
            A reminder every half hour from 8am, until you finish the day's lesson.
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button
            title={error ? 'Try again' : 'Turn on notifications'}
            variant="secondary"
            onPress={enable}
            loading={busy}
          />
        </>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Loading — while the data is on its way the header keeps its full silhouette
// in soft grey, and the road's place is held by a faint white star. Everything
// breathes on the same slow cycle: that is what reads as "coming" rather than
// "empty".
// ---------------------------------------------------------------------------
const SKELETON = path.skeleton;

function Pulse({
  reduced,
  style,
  children,
}: {
  reduced: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}) {
  const glow = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    if (reduced) {
      glow.setValue(0.7);
      return;
    }
    const breathe = (to: number) =>
      Animated.timing(glow, {
        toValue: to,
        duration: 750,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      });
    const loop = Animated.loop(Animated.sequence([breathe(1), breathe(0.55)]));
    loop.start();
    return () => loop.stop();
  }, [glow, reduced]);
  return <Animated.View style={[{ opacity: glow }, style]}>{children}</Animated.View>;
}

/** The week's shape before its data: seven grey ghosts holding the row's height. */
function WeekStripSkeleton({ reduced }: { reduced: boolean }) {
  return (
    <View style={styles.week}>
      {WEEKDAY_INITIALS.map((_, i) => (
        <View key={i} style={styles.day}>
          <Pulse reduced={reduced} style={styles.dayLabelGhost} />
          <Pulse reduced={reduced} style={styles.dayDotGhost} />
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// WeekStrip — the seven days of this week, and which of them she finished.
//
// The chip says how long the run is; the strip says where it stands right now,
// which is the thing that decides whether she practises today. A number can be
// read as "already safe"; a row with a hole in it can't.
//
// Finished days fill in; a past day that went unpractised freezes — the same
// ice the chip wears when the run itself is frozen — and days still ahead
// stay quiet.
// ---------------------------------------------------------------------------
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** The circle's diameter. Small enough that seven of them fit a narrow phone. */
const DAY_SIZE = 30;

function WeekStrip({
  week,
  done,
  today,
  reduced,
}: {
  /** This week's seven local dates, Monday first. */
  week: string[];
  /** Which of them are finished. */
  done: Set<string>;
  today: string;
  reduced: boolean;
}) {
  return (
    <View style={styles.week} accessibilityRole="summary" accessibilityLabel="This week's streak">
      {week.map((date, i) => (
        <DayCell
          key={date}
          label={WEEKDAY_INITIALS[i]}
          name={DAY_NAMES[i]}
          done={done.has(date)}
          isToday={date === today}
          past={date < today}
          reduced={reduced}
        />
      ))}
    </View>
  );
}

function DayCell({
  label,
  name,
  done,
  isToday,
  past,
  reduced,
}: {
  label: string;
  name: string;
  done: boolean;
  isToday: boolean;
  past: boolean;
  reduced: boolean;
}) {
  // The day fills in the moment she comes back from the lesson, and that is the
  // one thing in this row worth a movement: it happens once a day, and it is
  // the answer to the question the row was asking. A day that was already done
  // when the screen opened just sits there.
  const pop = useRef(new Animated.Value(done ? 1 : 0)).current;
  const wasDone = useRef(done);
  useEffect(() => {
    if (done === wasDone.current) return;
    wasDone.current = done;
    if (reduced) {
      pop.setValue(done ? 1 : 0);
      return;
    }
    Animated.spring(pop, {
      toValue: done ? 1 : 0,
      friction: 6,
      tension: 160,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [done, pop, reduced]);

  // Never from nothing — the circle is already standing there, it only swells
  // as it fills.
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
  const state = done ? 'completado' : isToday ? 'pendiente' : past ? 'congelado' : 'por venir';

  return (
    <View style={styles.day} accessible accessibilityLabel={`${name}: ${state}`}>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{label}</Text>
      <Animated.View
        style={[
          styles.dayDot,
          past && !done && styles.dayDotMissed,
          isToday && !done && styles.dayDotToday,
          done && styles.dayDotDone,
          done && { transform: [{ scale }] },
        ]}>
        {done ? (
          <Ionicons name="checkmark" size={17} color={colors.onPrimary} />
        ) : past ? (
          <Ionicons name="snow" size={15} color={ICE_INK} />
        ) : null}
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// HomeHeader — the mascot, her name, her streak. It holds its place while the
// road scrolls past underneath, so the one line that says who this is for is
// never more than a glance away.
// ---------------------------------------------------------------------------
function HomeHeader({
  name,
  isStaff,
  status,
  week,
  weekDone,
  today,
  reduced,
  epoch,
  topInset,
  onLogout,
}: {
  name: string;
  /** Reviewers and admins get a sign-out button; learners never need one. */
  isStaff: boolean;
  /** Null until the real streak has loaded. */
  status: StreakStatus | null;
  /** This week's seven local dates, Monday first. */
  week: string[];
  /** Null until the real week has loaded — the strip waits with the chip. */
  weekDone: string[] | null;
  today: string;
  reduced: boolean;
  /** Bumped to remount the strip, so a day can be put back without un-ticking
   *  itself on screen (see `show` in Home). */
  epoch: number;
  /** The status-bar inset — the header's white paints all the way up under it. */
  topInset: number;
  onLogout: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop: 14 + topInset }]}>
      <View style={styles.headerTop}>
        <Image
          source={require('@/assets/images/mora-avatar.png')}
          style={styles.avatar}
          contentFit="cover"
          accessible={false}
        />
        <Text style={styles.hello} numberOfLines={1}>
          {name ? `Hi, ${name}!` : 'Hi!'}
        </Text>
        {/* A ghost until the count is real — "0 días" flashing into "1 día" is
            worse than a chip that arrives a moment late. A frozen run turns
            the chip dark and icy: the old count struck through, the count she
            is actually standing on beside it. */}
        {status == null ? (
          <Pulse reduced={reduced} style={styles.chipGhost} />
        ) : (
          status.kind === 'frozen' || status.kind === 'recovering' ? (
            <View style={[styles.streakChip, styles.streakChipFrozen]}>
              <Text style={styles.chipFlame}>🧊</Text>
              <Text style={styles.chipTextFrozen} numberOfLines={1}>
                <Text style={styles.chipLost}>{status.lost}</Text>
                {'  '}
                {status.kind === 'recovering' ? status.days : 0} day streak
              </Text>
            </View>
          ) : (
            <View style={styles.streakChip}>
              <Text style={styles.chipFlame}>🔥</Text>
              <Text style={styles.chipText} numberOfLines={1}>
                {status.kind === 'alive' ? status.days : 0}{' '}
                {status.kind === 'alive' && status.days === 1 ? 'day' : 'days'} streak
              </Text>
            </View>
          )
        )}
        {/* Only for staff. A learner stays signed in on her phone forever; the
            only thing a sign-out button could do for her is lock her out by
            accident. */}
        {!isStaff ? null : (
          <Pressable
            onPress={() => router.push('/admin')}
            accessibilityRole="button"
            accessibilityLabel="Course dashboard"
            hitSlop={8}
            style={({ pressed }) => [
              styles.logout,
              { transform: [{ scale: pressed ? 0.92 : 1 }] },
              webTransition,
            ]}>
            <Ionicons name="construct-outline" size={19} color={colors.muted} />
          </Pressable>
        )}
        {!isStaff ? null : (
          <Pressable
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={8}
            style={({ pressed }) => [
              styles.logout,
              { transform: [{ scale: pressed ? 0.92 : 1 }] },
              webTransition,
            ]}>
            <Ionicons name="log-out-outline" size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {/* Its ghost holds the row's height, so nothing below shifts when the
          real week lands — and seven empty days never flash like a lost week. */}
      {weekDone ? (
        <WeekStrip
          key={epoch}
          week={week}
          done={new Set(weekDone)}
          today={today}
          reduced={reduced}
        />
      ) : (
        <WeekStripSkeleton reduced={reduced} />
      )}
    </View>
  );
}

/** Null while her step is on screen; otherwise the way back to it. */
type JumpDirection = 'up' | 'down' | null;
/** How far past the edge the step has to go before the way back is offered. */
const JUMP_MARGIN = 60;

// ---------------------------------------------------------------------------
// The status this screen was last showing: the step she was standing on, the
// days already filled in, and the count the chip was wearing.
//
// Coming back from a lesson rebuilds this screen from scratch, so without it
// she would arrive to the new state already drawn — the day ticked, the road a
// step further down — and the one movement she just earned would have happened
// off screen. Held here, the screen opens on the status she left and plays the
// change over it. A full page reload does clear it, which is right: there is no
// move to show when she wasn't watching.
// ---------------------------------------------------------------------------
interface Shown {
  /** Lessons finished in path order — which is also the index of her step. */
  lessons: number;
  weekDone: string[];
  streak: StreakStatus | null;
}

let lastShown: Shown | null = null;
/** Cached for the same reason: an unknown push status holds the whole road back
 *  a frame, and the return from a lesson is the one time that shows. */
let lastPushStatus: PushStatus | null = null;

const sameShown = (a: Shown, b: Shown) =>
  a.lessons === b.lessons &&
  a.weekDone.length === b.weekDone.length &&
  a.weekDone.every((d) => b.weekDone.includes(d)) &&
  JSON.stringify(a.streak) === JSON.stringify(b.streak);

/** A move she earned: the road only ever goes forward, and no day she had
 *  filled in is taken back off her. Anything else is a correction, and a
 *  correction is put in place rather than animated. */
const isAdvance = (from: Shown, to: Shown) =>
  to.lessons >= from.lessons && from.weekDone.every((d) => to.weekDone.includes(d));

/** How long her old status stands before the change plays over it. Long enough
 *  to read as "this is where I was", short enough not to feel like a wait. */
const HOLD_MS = 420;
/** The header answers first — the day ticks — and the road follows a beat
 *  later. Two things moving at once would be one thing nobody watched. */
const DAY_MARK_MS = 520;

// The road's own travel. The browser's smooth scroll is a fixed ~400ms, which
// is the speed of getting somewhere — right for the jump button, wrong for the
// one move she earned: it whips past the coins she already walked and lands
// before the new step has finished lighting up. So the tween is ours, and the
// advance takes its time.
const SCROLL_MS = 380;
const ADVANCE_SCROLL_MS = 1100;
/** Off promptly, settling soft — a glide rather than a shove. */
const EASE_SCROLL = Easing.bezier(0.4, 0, 0.2, 1);


export default function Home() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  /** The section she opened from the sections screen; none means hers. */
  const { section: askedSection } = useLocalSearchParams<{ section?: string }>();
  // The header is a white card running the full width, so the strip iOS
  // reserves above it should be that same white and disappear into it.
  useStatusBarColor(colors.card);
  const [data, setData] = useState<HomeData | null>(null);
  // Null until the browser has answered. The path waits for it along with the
  // rest of the data, so the prompt is there from the first paint instead of
  // dropping in a moment later and shoving the road down a notch.
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(lastPushStatus);

  // What is actually on screen. Coming back from a lesson this is her *old*
  // status — the road and the strip are drawn from it, not from `data` — until
  // the advance plays and moves it on.
  const [shown, setShown] = useState<Shown | null>(lastShown);
  // Bumped to remount the road and the strip, which is how a status gets *put*
  // somewhere instead of animated to — the way a correction that walks
  // backwards has to arrive.
  const [epoch, setEpoch] = useState(0);
  const shownRef = useRef(shown);
  const show = useCallback((next: Shown, snap = false) => {
    shownRef.current = next;
    lastShown = next;
    setShown(next);
    if (snap) setEpoch((n) => n + 1);
  }, []);

  const scrollRef = useRef<ScrollView>(null);
  /** Which unit each step is in, and where its section starts — what `yOf`
   *  counts above it. The road holds one section at a time, so a step's place
   *  is counted from the top of its own section: one header, the units of that
   *  section before it, and its steps. */
  const unitIndexOf = useRef<number[]>([]);
  const sectionStartOf = useRef<number[]>([]);
  const yOf = useCallback((i: number) => {
    const units = unitIndexOf.current;
    if (units.length === 0) return stepY(i, 0, 0);
    const at = Math.min(i, units.length - 1);
    const start = sectionStartOf.current[at] ?? 0;
    return stepY(i - start, (units[at] ?? 0) - (units[start] ?? 0) + 1, 1);
  }, []);
  /** Where the path starts inside the scroll content, and how tall the window is. */
  const pathTop = useRef(0);
  /** The path's own DOM node (web) — measured before first paint. */
  const pathRef = useRef<View>(null);
  const viewport = useRef(0);
  /** The road is put in place once, as soon as both measurements exist. */
  const placed = useRef(false);
  /** Which section's road is standing — a different one is placed afresh. */
  const lastRoadKey = useRef<string | null>(null);
  /** When it landed — the hold that keeps her old status readable counts from
   *  there, not from when the data happened to arrive. */
  const placedAt = useRef(0);
  /** The frame loop currently gliding the road, so a new move cancels it. */
  const gliding = useRef<number | null>(null);
  /** The status waiting to be played, once the road is standing on her step. */
  const pendingAdvance = useRef<Shown | null>(null);
  const advanceTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Which way her step lies when it is off screen — mirrored in a ref so the
  // scroll handler only re-renders on the crossing, not on every frame.
  const [jump, setJump] = useState<JumpDirection>(null);
  const jumpRef = useRef<JumpDirection>(null);
  /** The unit whose guidebook is open. */
  const [guide, setGuide] = useState<Unit | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const week = weekDates();
    const [course, done, counts, streakRes, weekRes, mistakes, checkAttempts] = await Promise.all([
      loadCourse(),
      loadProgress(profile.id),
      getPracticeCounts(profile.id),
      supabase.from('streaks').select('*').eq('user_id', profile.id).maybeSingle(),
      // This week's completed days, for the strip in the header. Read off
      // `daily_sessions` rather than derived from the streak: a week with a
      // hole in it still has to show the days on either side of the hole.
      supabase
        .from('daily_sessions')
        .select('session_date')
        .eq('user_id', profile.id)
        .gte('session_date', week[0])
        .lte('session_date', week[6])
        .not('completed_at', 'is', null),
      getMistakeCount(profile.id),
      loadCheckAttempts(profile.id),
    ]);

    unitIndexOf.current = course.path.map((l) => l.unitIndex);
    const starts = new Map<number, number>();
    sectionStartOf.current = course.path.map((l) => {
      if (!starts.has(l.section.id)) starts.set(l.section.id, l.index);
      return starts.get(l.section.id)!;
    });
    setData({
      course,
      current: currentIndex(course.path, done),
      streak: (streakRes.data as Streak) ?? null,
      known: counts.known,
      weekDone: (weekRes.data ?? []).map((r: { session_date: string }) => r.session_date),
      mistakes,
      checkAttempts,
    });
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      // The hold restarts here as well as on placement: a screen that was never
      // unmounted comes back already standing on her old status, and the
      // advance still has to wait for her to have looked at it.
      if (placed.current) placedAt.current = Date.now();
      load();
    }, [load]),
  );

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    getPushStatus().then((s) => {
      lastPushStatus = s;
      setPushStatus(s);
    });
  }, []);

  useEffect(
    () => () => {
      for (const t of advanceTimers.current) clearTimeout(t);
      if (gliding.current != null) cancelAnimationFrame(gliding.current);
    },
    [],
  );

  /** The DOM element that actually owns the overflow, on web. */
  const scrollNode = useCallback(
    () =>
      Platform.OS === 'web'
        ? ((scrollRef.current as unknown as { getScrollableNode?: () => HTMLElement })
            ?.getScrollableNode?.() ?? null)
        : null,
    [],
  );

  const scrollToStep = useCallback(
    (i: number, animated: boolean, ms = SCROLL_MS) => {
      const y = Math.max(pathTop.current + yOf(i) - viewport.current * 0.42, 0);
      const node = scrollNode();
      if (gliding.current != null) {
        cancelAnimationFrame(gliding.current);
        gliding.current = null;
      }
      // Instant placement writes scrollTop straight onto the DOM node: RNW's
      // scrollTo goes through its animated-scroll path even with
      // animated:false, and Safari quietly drops that call in a container
      // whose content just changed. The direct write has nothing to drop.
      if (!animated) {
        if (node) node.scrollTop = y;
        else scrollRef.current?.scrollTo({ y, animated: false });
        return;
      }
      // Native has no duration to give — its animated scroll is the platform's
      // and that is fine there. On web the duration is the whole point, so the
      // tween is written a frame at a time onto the node itself.
      if (!node) {
        scrollRef.current?.scrollTo({ y, animated: true });
        return;
      }
      const from = node.scrollTop;
      const travel = y - from;
      if (Math.abs(travel) < 1) return;
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        node.scrollTop = from + travel * EASE_SCROLL(t);
        gliding.current = t < 1 ? requestAnimationFrame(frame) : null;
      };
      gliding.current = requestAnimationFrame(frame);
    },
    [scrollNode, yOf],
  );

  // ------------------------------------------------------------------
  // The advance — the whole point of coming back from a lesson.
  //
  // It runs in two beats, because the two things that changed are in different
  // places and one of them explains the other: first the header answers the
  // question the strip was asking (the day fills in, the chip counts up), then
  // the road follows — it scrolls down to centre the step she just unlocked
  // while the one she finished stamps itself done behind her and the new one
  // lights up.
  //
  // Nothing starts until the road is standing on her *old* step and has stood
  // there long enough to be read as one. A move nobody saw the start of is not
  // a move; it is just a different screen.
  // ------------------------------------------------------------------
  const advance = useCallback(() => {
    const next = pendingAdvance.current;
    const from = shownRef.current;
    if (!next || !from) return;
    pendingAdvance.current = null;

    if (reduced) {
      show(next);
      if (next.lessons !== from.lessons) scrollToStep(next.lessons, false);
      return;
    }

    const play = () => {
      // Beat one — the header.
      show({ ...from, weekDone: next.weekDone, streak: next.streak });
      // Beat two — the road. Skipped entirely on a day where only the strip
      // changed (an extra round credits the day but not a step).
      if (next.lessons === from.lessons) return;
      advanceTimers.current.push(
        setTimeout(() => {
          show(next);
          scrollToStep(next.lessons, true, ADVANCE_SCROLL_MS);
        }, DAY_MARK_MS),
      );
    };

    const waited = Date.now() - placedAt.current;
    if (waited >= HOLD_MS) play();
    else advanceTimers.current.push(setTimeout(play, HOLD_MS - waited));
  }, [reduced, scrollToStep, show]);

  useEffect(() => {
    if (!data) return;
    const next: Shown = {
      lessons: data.current,
      weekDone: data.weekDone,
      streak: streakStatus(data.streak, localDateStr()),
    };
    const from = shownRef.current;
    // A cold start has nothing to move from, so the screen simply opens where
    // she is — every node mounts in its phase and no animation runs.
    if (!from) {
      show(next);
      return;
    }
    if (sameShown(from, next)) return;
    // Not a move she earned — a session was undone, or the screen was left
    // open across midnight and this week's strip lost a day. Put it right;
    // don't animate a lesson being taken away from her.
    if (!isAdvance(from, next)) {
      show(next, true);
      return;
    }
    pendingAdvance.current = next;
    if (placed.current) advance();
  }, [data, advance, show]);

  // On web the road is pinned before its first paint. RNW's onLayout arrives a
  // few frames after the path appears — long enough for the top of the road to
  // flash before the jump to her step. A layout effect runs between the DOM
  // being built and the browser painting it, so measuring and writing
  // scrollTop here means the first frame anyone sees is already in place.
  // Native (and any web miss) still places through onLayout as before.
  useLayoutEffect(() => {
    if (Platform.OS !== 'web' || placed.current || shown == null) return;
    const scrollEl = scrollNode();
    const pathEl = pathRef.current as unknown as HTMLElement | null;
    const contentEl = scrollEl?.firstElementChild as HTMLElement | null;
    if (!scrollEl || !pathEl || !contentEl) return;
    viewport.current = scrollEl.clientHeight;
    pathTop.current =
      pathEl.getBoundingClientRect().top - contentEl.getBoundingClientRect().top;
    placed.current = true;
    placedAt.current = Date.now();
    scrollEl.scrollTop = Math.max(pathTop.current + yOf(shown.lessons) - viewport.current * 0.42, 0);
    if (pendingAdvance.current) requestAnimationFrame(advance);
  }, [shown, pushStatus, advance, scrollNode, yOf]);

  if (!profile) return null;
  const isStaff = profile.role !== 'student';
  // Re-derived on every render rather than held in state: the screen reloads on
  // focus, so a phone left open past midnight comes back to the right week.
  const todayDate = localDateStr();
  const thisWeek = weekDates();

  // ------------------------------------------------------------------
  // Path layout. Every lesson of the course is a coin; the road is drawn from
  // what is *shown*, which lags the data by the length of the advance — that
  // lag is the animation.
  // ------------------------------------------------------------------
  const path = data?.course.path ?? [];
  const noCourse = data != null && path.length === 0;
  const current = shown?.lessons ?? 0;

  // One section at a time (the sections screen holds the whole map). The road
  // opens on the section she is in, or on one she picked there; a section still
  // ahead is never walked into from a stale link, its road opens once she gets
  // there.
  const summaries = data ? sectionSummaries(data.course, current) : [];
  const hereSection = data ? sectionAt(data.course, current) : null;
  const asked = summaries.find((x) => String(x.section.id) === askedSection && x.state !== 'locked');
  const viewed = asked ?? summaries.find((x) => x.section.id === hereSection?.id) ?? null;
  const road = viewed ? path.filter((l) => l.section.id === viewed.section.id) : path;
  const nextSection = viewed ? (summaries[summaries.indexOf(viewed) + 1] ?? null) : null;
  const currentHere = road.some((l) => l.index === current);
  // A new section is a new road: it is placed afresh, not scrolled to.
  const roadKey = viewed ? `${viewed.section.id}` : 'all';
  if (lastRoadKey.current !== roadKey) {
    lastRoadKey.current = roadKey;
    placed.current = false;
  }
  const openSection = (id: number) => router.setParams({ section: String(id) });

  const phaseOf = (i: number): Phase => (i < current ? 2 : i === current ? 1 : 0);
  const unitStateOf = (lesson: PathLesson): UnitState => {
    const unitLessons = path.filter((l) => l.unit_id === lesson.unit_id);
    const last = unitLessons[unitLessons.length - 1]?.index ?? lesson.index;
    return current > last ? 'done' : current >= lesson.index ? 'current' : 'locked';
  };

  // Land with the step in view, path history above it — on her old step if a
  // move is about to play, so she sees it happen rather than arriving after it.
  const place = () => {
    if (placed.current || viewport.current === 0 || pathTop.current === 0) return;
    placed.current = true;
    placedAt.current = Date.now();
    // Her own step when it is on this road; the top of the section otherwise.
    const step = currentHere ? current : (road[0]?.index ?? 0);
    scrollToStep(step, false);
    if (pendingAdvance.current) {
      requestAnimationFrame(advance);
    } else {
      // Pinned again as the layout settles: iOS clamps a scroll issued before
      // the content's height is committed, and the road would open at the top
      // instead of standing on her step. Each repeat only fires while the view
      // is still stuck at the top — the moment the pin holds (or she starts
      // scrolling herself) they stand down.
      const repin = () => {
        const node = scrollNode();
        if (!node || node.scrollTop < 40) scrollToStep(step, false);
      };
      requestAnimationFrame(repin);
      for (const ms of [120, 400, 800]) setTimeout(repin, ms);
    }
  };

  const startLesson = (lesson: PathLesson) =>
    lesson.kind === 'story'
      ? router.push(`/story?lesson=${lesson.id}`)
      : router.push(`/practice?lesson=${lesson.id}`);

  // Jumping ahead (learning-engine-spec §7): a unit or section still ahead can
  // be tested into, as long as the test stays one sitting long.
  const units = data?.course.units ?? [];
  const hereUnit = path[Math.min(current, Math.max(path.length - 1, 0))]?.unit;
  const jumpSpan = (target: Unit) =>
    hereUnit && current < path.length
      ? units.filter((u) => u.course_order >= hereUnit.course_order && u.course_order < target.course_order).length
      : 0;
  const canJumpTo = (target: Unit) => {
    const span = jumpSpan(target);
    return span > 0 && span <= maxUnitsInTest();
  };
  const jumpTo = (target: Unit) => {
    setGuide(null);
    router.push(`/practice?test=jump&to=${target.id}`);
  };
  const guideJump = (() => {
    if (!guide || !hereUnit || guide.course_order <= hereUnit.course_order) return null;
    // Too far for one test: offer the start of its section instead, if that fits.
    const sectionStart = units.find((u) => u.section_id === guide.section_id);
    const target = canJumpTo(guide) ? guide : sectionStart && canJumpTo(sectionStart) ? sectionStart : null;
    return target ? { units: jumpSpan(target), onPress: () => jumpTo(target) } : null;
  })();

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.safe}>
      {/* The header is a sibling of the scroller, not its first row: it holds
          its place while the road runs past underneath. The top inset lives
          inside it, so its white reaches up under the status bar instead of
          the page colour showing through a padded band. */}
      <HomeHeader
        name={profile.display_name}
        isStaff={isStaff}
        status={shown?.streak ?? null}
        week={thisWeek}
        weekDone={shown?.weekDone ?? null}
        today={todayDate}
        reduced={reduced}
        epoch={epoch}
        topInset={insets.top}
        onLogout={logout}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        scrollEventThrottle={16}
        onLayout={(e) => {
          viewport.current = e.nativeEvent.layout.height;
          place();
        }}
        onScroll={({ nativeEvent: e }) => {
          // Wandering up the road she has walked, or down the one she hasn't,
          // offers a way back to the step that is actually hers.
          if (!currentHere) return;
          const node = pathTop.current + yOf(current) + BOX / 2;
          const top = e.contentOffset.y;
          const bottom = top + e.layoutMeasurement.height;
          const next = node < top + JUMP_MARGIN ? 'up' : node > bottom - JUMP_MARGIN ? 'down' : null;
          if (next !== jumpRef.current) {
            jumpRef.current = next;
            setJump(next);
          }
        }}
        onContentSizeChange={place}>
        {pushStatus ? (
          <PushPrompt
            userId={profile.id}
            status={pushStatus}
            onStatus={(s) => {
              lastPushStatus = s;
              setPushStatus(s);
            }}
          />
        ) : null}

        {data && data.current === 0 && data.known === 0 && !noCourse ? (
          <Panel style={styles.placement}>
            <Text style={styles.sectionTitle}>Already know some Spanish?</Text>
            <Text style={styles.mutedText}>
              A short test finds where you should start, so you don&apos;t sit through what you know.
            </Text>
            <Button title="Take the placement test" variant="secondary" onPress={() => router.push('/practice?test=placement')} />
          </Panel>
        ) : null}

        {shown == null || pushStatus == null ? (
          // The road's place, held by a sun instead of a spinner: white on the
          // bone, present but barely, until the real path stands here.
          <View key="loading" style={styles.pathLoading}>
            <Pulse reduced={reduced} style={styles.pathLoadingStar}>
              <MaterialCommunityIcons name="white-balance-sunny" size={124} color={colors.card} />
            </Pulse>
          </View>
        ) : noCourse ? (
          <Panel key="empty">
            <Text style={styles.mutedText}>No lessons published yet.</Text>
          </Panel>
        ) : (
          // Keyed so React can never recycle the loading view's DOM node into
          // this one: react-native-web only wires onLayout's ResizeObserver when
          // a node mounts, so a recycled node keeps the handler but never gets
          // observed — onLayout goes silent, pathTop stays unmeasured, and the
          // road opens at the top instead of on her step.
          <View
            key={`path:${roadKey}`}
            ref={pathRef}
            style={styles.path}
            onLayout={(e) => {
              pathTop.current = e.nativeEvent.layout.y;
              place();
            }}>
            {road.map((lesson) => (
              <Fragment key={`${epoch}:${lesson.id}`}>
                {lesson.opensSection ? (
                  <SectionBar section={lesson.section} onPress={() => router.push('/sections')} />
                ) : null}
                {lesson.opensUnit ? (
                  <UnitBanner lesson={lesson} state={unitStateOf(lesson)} onPress={() => setGuide(lesson.unit)} />
                ) : null}
                <PathStep
                  index={lesson.index}
                  phase={phaseOf(lesson.index)}
                  reduced={reduced}
                  kind={lesson.kind}
                  attempts={data?.checkAttempts.get(lesson.id)}
                  label={`${lesson.title_en} · ${lesson.unit.title_en}`}
                  onPress={lesson.index === current ? () => startLesson(lesson) : undefined}
                />
              </Fragment>
            ))}
            {viewed ? (
              <SectionEnd
                next={nextSection}
                onOpen={nextSection && nextSection.state !== 'locked' ? () => openSection(nextSection.section.id) : undefined}
                onJump={
                  nextSection?.state === 'locked' && nextSection.units[0] && canJumpTo(nextSection.units[0])
                    ? () => jumpTo(nextSection.units[0])
                    : undefined
                }
              />
            ) : null}
          </View>
        )}
      </ScrollView>

      {!noCourse && (data?.mistakes ?? 0) > 0 ? (
        <MistakesButton
          mistakes={data?.mistakes ?? 0}
          onPress={() => router.push('/practice?mode=mistakes')}
        />
      ) : null}
      <Guidebook
        unit={guide}
        tips={guide ? (data?.course.tipsByUnit.get(guide.id) ?? []) : []}
        onClose={() => setGuide(null)}
        jump={guideJump}
      />
      {!noCourse ? (
        <JumpButton
          direction={currentHere ? jump : viewed?.state === 'done' ? 'down' : 'up'}
          reduced={reduced}
          onPress={() =>
            currentHere ? scrollToStep(current, !reduced) : hereSection ? openSection(hereSection.id) : undefined
          }
        />
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// MistakesButton — the way back to what she got wrong. It only appears when
// there is something to go over, so the road is clear the rest of the time.
// ---------------------------------------------------------------------------
function MistakesButton({ mistakes, onPress }: { mistakes: number; onPress: () => void }) {
  return (
    <View style={styles.practiceSlot} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Mistakes: ${mistakes} to go over`}
        hitSlop={8}
        style={({ pressed }) => [
          styles.practice,
          styles.mistakes,
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webTransition,
        ]}>
        <Ionicons name="refresh" size={18} color={colors.accent} />
        <Text style={[styles.practiceText, { color: colors.accent }]}>Mistakes</Text>
        <Text style={styles.mistakesCount}>{mistakes > 99 ? '99+' : mistakes}</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// JumpButton — the way back to her own step. It stays mounted and fades, so a
// scroll that crosses the threshold twice doesn't restart it from nothing.
// ---------------------------------------------------------------------------
function JumpButton({
  direction,
  reduced,
  onPress,
}: {
  direction: JumpDirection;
  reduced: boolean;
  onPress: () => void;
}) {
  const show = useRef(new Animated.Value(0)).current;
  // Held so the arrow doesn't flip to the other direction while fading out.
  const facing = useRef<'up' | 'down'>('up');
  if (direction) facing.current = direction;

  useEffect(() => {
    if (reduced) {
      show.setValue(direction ? 1 : 0);
      return;
    }
    const anim = Animated.timing(show, {
      toValue: direction ? 1 : 0,
      duration: direction ? 200 : 140,
      easing: EASE_OUT,
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();
    return () => anim.stop();
  }, [direction, reduced, show]);

  return (
    <Animated.View
      pointerEvents={direction ? 'auto' : 'none'}
      style={[
        styles.jumpSlot,
        {
          opacity: show,
          transform: [
            { translateY: show.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            { scale: show.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
          ],
        },
      ]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Back to your lesson"
        hitSlop={10}
        style={({ pressed }) => [
          styles.jump,
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webTransition,
        ]}>
        <Ionicons
          name={facing.current === 'down' ? 'arrow-down' : 'arrow-up'}
          size={22}
          color={colors.primary}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },

  // Header ------------------------------------------------------------------
  header: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadow.card,
    // The road passes beneath it; the shadow has to land on top of the road.
    zIndex: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  hello: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipFlame: { fontSize: 15 },
  chipText: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  chipGhost: { width: 132, height: 33, borderRadius: radius.pill, backgroundColor: SKELETON },
  streakChipFrozen: { backgroundColor: FROZEN_BG },
  chipTextFrozen: { fontSize: 15, fontWeight: '700', color: frost.chipText },
  /** The count she lost — still legible, visibly crossed out. */
  chipLost: {
    color: frost.chipSub,
    textDecorationLine: 'line-through',
  },
  logout: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // The week --------------------------------------------------------------
  // A tray inset into the white header, so the seven days read as one object
  // rather than as seven loose dots.
  week: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  day: { flex: 1, alignItems: 'center', gap: 5 },
  dayLabel: { fontSize: 11, fontWeight: '700', color: colors.faint, letterSpacing: 0.4 },
  dayLabelToday: { color: colors.primary },
  dayDot: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // The days still ahead: present, but barely — nothing has happened yet.
    backgroundColor: path.dayAhead,
  },
  /** A day that went by unpractised: frozen over. */
  dayDotMissed: { backgroundColor: ICE_FACE },
  /** Today, still open: an empty ring, waiting to be filled. */
  dayDotToday: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.primary },
  dayDotDone: { backgroundColor: colors.primary },
  dayLabelGhost: { width: 12, height: 11, borderRadius: 4, backgroundColor: SKELETON },
  dayDotGhost: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.pill,
    backgroundColor: SKELETON,
  },

  // The road, before there is a road ----------------------------------------
  pathLoading: { alignItems: 'center', paddingVertical: 130 },
  pathLoadingStar: { opacity: 0.8 },

  // Back to her step --------------------------------------------------------
  jumpSlot: { position: 'absolute', right: 18, bottom: 18 },
  jump: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  mutedText: { fontSize: 15, color: colors.muted, lineHeight: 21 },
  errorText: { fontSize: 14, color: colors.dangerInk, lineHeight: 20 },

  // Unit banners -------------------------------------------------------------
  sectionBar: {
    height: SECTION_H,
    marginBottom: SECTION_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: { flex: 1, gap: 2 },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.faint,
  },
  sectionName: { fontSize: 17, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  sectionMap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  sectionEnd: {
    marginTop: 8,
    // Clear of the floating tab bar and the Mistakes button, which both sit
    // over the bottom of the scroller.
    marginBottom: 120,
    alignItems: 'center',
    gap: 8,
    padding: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  sectionEndTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, textAlign: 'center', letterSpacing: -0.2 },
  sectionEndText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 6 },
  banner: {
    height: BANNER_H,
    marginBottom: BANNER_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  bannerCurrent: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  bannerLocked: { backgroundColor: colors.bg, shadowOpacity: 0, elevation: 0 },
  bannerText: { flex: 1, gap: 1 },
  bannerEyebrow: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2, color: colors.faint },
  bannerTitle: { fontSize: 18, lineHeight: 23, fontWeight: '700', color: colors.ink, letterSpacing: -0.2 },
  bannerSummary: { fontSize: 13, lineHeight: 17, color: colors.muted },
  onPrimary: { color: colors.onPrimary },
  onPrimaryMuted: { color: colors.onPrimary, opacity: 0.78 },

  // Practice ---------------------------------------------------------------
  practiceSlot: { position: 'absolute', left: 18, bottom: 18, gap: 10, alignItems: 'flex-start' },
  mistakes: { height: 40, paddingLeft: 12, paddingRight: 14, gap: 6 },
  mistakesCount: { fontSize: 13, fontWeight: '800', color: colors.accent, fontVariant: ['tabular-nums'] },
  placement: { gap: 10 },
  attempts: {
    position: 'absolute',
    right: 0,
    top: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  attemptsText: { fontSize: 11, fontWeight: '800', color: colors.onPrimary, fontVariant: ['tabular-nums'] },
  practice: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.card,
  },
  practiceText: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },

  // Path -------------------------------------------------------------------
  path: {
    paddingTop: PATH_TOP,
    paddingBottom: 6,
  },
  step: { alignItems: 'center', alignSelf: 'stretch', marginBottom: STEP_GAP },
  stepNode: { alignItems: 'center' },
  /** Full-height slot pinned to one edge of the row, figure centred in it. */
  figureSlot: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
  /** Fixed whatever the node's phase — the current step grows by scaling,
   *  so the road's spacing never shifts under an animation. */
  nodeBox: { width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' },
  /** Sits around the coin rather than wrapping it, so it can breathe alone. */
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: RING_BORDER,
  },
  coin: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: COIN_SHADOW,
  },
  icon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

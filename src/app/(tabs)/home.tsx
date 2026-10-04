import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useIsFocused, useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { AppHeader, Pulse } from '@/components/app-header';
import { Guidebook } from '@/components/guidebook';
import { Button, Panel } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { markBootReady } from '@/lib/boot';
import { localDateStr } from '@/lib/dates';
import {
  type Course,
  currentIndex,
  loadCourse,
  loadLessonProgress,
  type PathLesson,
  peekCourse,
  sectionAt,
  sectionSummaries,
} from '@/lib/course';
import { jumpAllowed } from '@/lib/placement';
import { FREE_UNITS, usePremium } from '@/lib/premium';
import {
  enablePartnerReminders,
  enablePush,
  getPartnerId,
  getPushStatus,
  type PushStatus,
} from '@/lib/push';
import { getPracticeCounts } from '@/lib/session';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { readSnapshot, writeSnapshot } from '@/lib/snapshot';
import { streakStatus, type StreakStatus } from '@/lib/streak';
import { fetchStreakWeek } from '@/lib/streak-week';
import { clay, colors, font, gradients, pastel, pastelGrad, path, press, radius } from '@/lib/theme';
import type { LessonKind, Section, Streak, Unit } from '@/lib/types';
import { FitText } from '@/components/fit-text';

interface HomeData {
  course: Course;
  /** Her step on the road: the first lesson she hasn't finished. */
  current: number;
  streak: Streak | null;
  /** Words she has met at all; the road's first step is only "start" until one. */
  known: number;
  /** Which days of this week she has already completed, as YYYY-MM-DD. */
  weekDone: string[];
  /** Unit checks tried and not yet passed, by lesson id: attempts so far. */
  checkAttempts: Map<string, number>;
  /** Drawn from the phone's copy; the real load hasn't landed yet. */
  cached?: boolean;
}

/** What the phone keeps of Home between launches (snapshot.ts): her status,
 *  never the course — that is content-cache's. */
interface HomeSnapshot {
  /** Lessons finished — kept as ids, so the copy still fits a course that changed. */
  done: string[];
  checkAttempts: [string, number][];
  streak: Streak | null;
  known: number;
  weekDone: string[];
  pushStatus: PushStatus | null;
}

// ---------------------------------------------------------------------------
// The path — a Duolingo-style trail of clay pills winding down the screen.
// One pill per lesson of the course, in order: the ones she has finished
// (manteca, with a tick), the current step (the wide rosa one that says
// "Start", and the only tappable one), and the rest of the road locked ahead
// of her, pressed flat into the page. Each unit opens with a banner naming
// what it teaches.
//
// A node's whole look — size, colour, glyph, ring — is derived from one number,
// its phase: 0 locked, 1 current, 2 done. That is what makes finishing a lesson
// animatable: the step she just finished runs 1 → 2 while the next runs 0 → 1.
// ---------------------------------------------------------------------------

/** A done or locked step: a small clay pill. */
const PILL_W = 74;
const PILL_H = 64;
/** The current step: a wide pill with a play disc and what it starts. */
const CUR_W = 160;
const CUR_H = 76;
const DISC = 58;
const RING_PAD = 5;
const RING_BORDER = 3;
// The pill and freeze palettes live in theme.ts — see `path` and `frost` there
// for why the freeze blue is the one hue allowed outside the clay family.
const RING_RGB = path.ringRgb;

// Every row is the same box whatever its phase, so the road's geometry is
// arithmetic: no measuring, and scrolling to a step is exact the instant the
// step exists. The box fits the current pill with its ring, so a step can
// grow into it without the row reflowing.
const RING_OUT = RING_PAD + RING_BORDER;
const BOX_W = CUR_W + 2 * RING_OUT;
const BOX = CUR_H + 2 * RING_OUT;
const STEP_GAP = 4;
const STEP_PITCH = BOX + STEP_GAP;
/** Breathing room before the first node. */
const PATH_TOP = 24;
/** A unit's banner is a fixed-height row too, so it folds into the arithmetic. */
const BANNER_H = 176;
const BANNER_GAP = 22;
const BANNER_PITCH = BANNER_H + BANNER_GAP;
/** Where step `i` sits, given the banners standing above it. The section's
 *  name lives in the header's pill, so nothing else stands on the road. */
const stepY = (i: number, bannersAbove: number) => PATH_TOP + bannersAbove * BANNER_PITCH + i * STEP_PITCH;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
/** The step she just finished stamps itself done; the next one lights up after. */
const LEAVE_MS = 420;
const ENTER_DELAY = 170;
const ENTER_MS = 430;
/** Half a breath of the current step's ring — the only thing still moving. */
const BREATHE_MS = 1300;
/** Horizontal S-curve: one full wave every 8 steps. Shallow enough that the
 *  wide current pill never runs off a narrow phone at the top of a swing. */
const swing = (i: number) => Math.round(Math.sin((i * Math.PI) / 4) * 56);

/** What the current pill says under "Start": the lesson, or what kind of step it is. */
const KIND_LABEL: Partial<Record<LessonKind, string>> = {
  story: 'Story',
  practice: 'Practice',
  listening: 'Listening',
  review: 'Unit check',
  checkpoint: 'Unit check',
  speak: 'Speaking',
  slang: 'Slang',
  culture: 'Culture',
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * What a step wears: the same icons as the tabs its classes belong to, so the
 * road says what each step is — a lesson, Slang (Words), Culture, a chat with
 * Pancho (Speaking) — and the face's colour says how far she is. Always the
 * outline: the solid glyphs sat on the clay faces as heavy dark blots, and
 * the tab bar is line icons too. A check ahead wears its trophy, so she can
 * see the unit's end coming.
 */
const KIND_GLYPH: Record<LessonKind, IoniconName> = {
  lesson: 'book-outline',
  practice: 'book-outline',
  story: 'reader-outline',
  listening: 'headset-outline',
  review: 'trophy-outline',
  checkpoint: 'trophy-outline',
  slang: 'albums-outline',
  culture: 'cafe-outline',
  speak: 'chatbubble-ellipses-outline',
};

// On web, react-native-web turns this into a real CSS transition so the pill
// press eases instead of snapping.
const webTransition =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as unknown as ViewStyle)
    : undefined;

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

// Memoized: the road holds a whole section (hundreds of steps), and Home
// re-renders on every scroll crossing, guidebook open and load. Only the steps
// whose phase changed, and the current one, need to render again.
const PathStep = memo(function PathStep({
  index,
  phase,
  reduced,
  breathe,
  label,
  sub,
  kind,
  attempts,
  tone,
  onPress,
}: {
  index: number;
  phase: Phase;
  /** Its unit's banner colour: done steps wear it. */
  tone: BannerTone;
  reduced: boolean;
  /** The current step's ring breathes only while Home is on screen. */
  breathe: boolean;
  /** What the pill is, for screen readers: "Lesson 2 · Hola, che". */
  label: string;
  /** The line under "Start" while it is her step: "Lesson 3", "Story". */
  sub: string;
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
  // The ring around the current step is the only "tap here" left on the path,
  // so it breathes: out and faint, back in and solid, forever until she does.
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 1 || reduced || !breathe) {
      breath.setValue(0);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: BREATHE_MS,
          easing: Easing.inOut(Easing.quad),
          // Native: the breath has its own view, apart from the ring's
          // colour, so it runs off the JS thread (which a lesson opened on
          // top of Home needs for drags and audio).
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: BREATHE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [phase, reduced, breathe, breath]);

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
      // Size and colour can't ride the native driver, and the whole look is one value.
      useNativeDriver: false,
    });
    move.start();
    return () => move.stop();
  }, [phase, reduced, p, start]);

  // Built once per step: the value never changes, so neither do they.
  const anim = useMemo(() => {
    const at = (outputRange: number[], inputRange = [0, 1, 2]) =>
      p.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });

    // The pill widens into her step and narrows back once it is done. On top
    // of that it swells past its size as it lights up, then settles; going
    // done it dips, the way a stamp presses in.
    const width = at([PILL_W, CUR_W, PILL_W]);
    const height = at([PILL_H, CUR_H, PILL_H]);
    const scale = at([1, 1.05, 1, 0.97, 1], [0, 0.78, 1, 1.62, 2]);
    const ring = p.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [`rgba(${RING_RGB}, 0)`, `rgba(${RING_RGB}, 1)`, `rgba(${RING_RGB}, 0)`],
      extrapolate: 'clamp',
    });

    const breatheScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
    const breatheFade = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 0.32] });

    // Each phase has its own face — pressed-flat oat, rosa clay, manteca clay —
    // and its own glyph, and they crossfade in place: a gradient and a clay
    // shadow are not things a driver can interpolate, but their opacity is.
    const lockedOn = at([1, 0, 0], [0, 0.55, 2]);
    const currentOn = at([0, 1, 0], [0.45, 1, 1.55]);
    const doneOn = at([0, 0, 1], [0, 1.45, 2]);
    return { width, height, scale, ring, breatheScale, breatheFade, lockedOn, currentOn, doneOn };
  }, [p, breath]);

  const pill = (pressed: boolean) => (
    <Animated.View
      style={[
        styles.pill,
        { width: anim.width, height: anim.height, transform: [{ scale: anim.scale }] },
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.ringBox, { opacity: anim.breatheFade, transform: [{ scale: anim.breatheScale }] }]}>
        <Animated.View style={[styles.ring, { borderColor: anim.ring }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.pillPress,
          { transform: [{ scale: pressed ? press.scale : 1 }] },
          webTransition,
        ]}>
        <Animated.View style={[styles.face, styles.faceLocked, { opacity: anim.lockedOn }]} />
        <Animated.View style={[styles.face, styles.faceLit, { opacity: anim.currentOn }]}>
          <LinearGradient pointerEvents="none" colors={gradients.deep} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[styles.face, styles.faceDone, { opacity: anim.doneOn }]}>
          <LinearGradient pointerEvents="none" colors={tone.grad} style={StyleSheet.absoluteFill} />
        </Animated.View>
        {/* The glyphs sit in a clipped layer of their own, so the wide "Start"
            row is cut to the pill while it grows rather than spilling past it. */}
        <View pointerEvents="none" style={styles.glyphs}>
          <Animated.View style={[styles.glyph, { opacity: anim.lockedOn }]}>
            <Ionicons name={KIND_GLYPH[kind]} size={26} color={path.lockedGlyph} />
          </Animated.View>
          <Animated.View style={[styles.glyph, { opacity: anim.doneOn }]}>
            <Ionicons name={KIND_GLYPH[kind]} size={27} color={tone.ink} />
          </Animated.View>
          <Animated.View style={[styles.startRow, { opacity: anim.currentOn }]}>
            <View style={styles.disc}>
              <Ionicons name="play" size={26} color={path.litGlyph} style={styles.play} />
            </View>
            <View style={styles.startText}>
              <Text style={styles.startTitle}>Start</Text>
              <FitText style={styles.startSub} lines={1}>
                {sub}
              </FitText>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
      {attempts ? (
        // Pinned to the pill's corner, outside the row's arithmetic.
        <View style={styles.attempts} pointerEvents="none">
          <Text style={styles.attemptsText}>{attempts}/3</Text>
        </View>
      ) : null}
    </Animated.View>
  );

  return (
    <View style={styles.step}>
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
            {({ pressed }) => pill(pressed)}
          </Pressable>
        ) : (
          <View
            style={styles.nodeBox}
            accessible
            accessibilityLabel={`${label}: ${phase === 2 ? 'done' : 'locked'}`}>
            {pill(false)}
          </View>
        )}
      </View>
    </View>
  );
});

const NO_PATH: PathLesson[] = [];

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
        <MaterialCommunityIcons name="white-balance-sunny" size={28} color={colors.accent} />
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
        <Ionicons name="lock-closed" size={18} color={path.lockedGlyph} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// UnitBanner — the card that opens each unit on the road: which unit, what
// it's called, the one line of what it teaches, and how far through it she is,
// with the carpincho in his pod at the corner. Units take the palette in turn
// (salvia, durazno, lavanda, manteca, rosa), so each one reads as its own
// place. A fixed height, like every row on the road, so scrolling to a step
// stays arithmetic.
// ---------------------------------------------------------------------------
type UnitState = 'done' | 'current' | 'locked';

/** The carpincho on every banner — the same cut-out he waves with elsewhere. */
const BANNER_ART = require('@/assets/images/capybara/capybara-saludando-figure.webp');

type BannerTone = {
  grad: readonly [string, string];
  ink: string;
  track: string;
  /** The progress fill; null draws the progress gradient. */
  fill: string | null;
};
const onTone = (grad: readonly [string, string]): BannerTone => ({ grad, ink: colors.onPastel, track: colors.trough, fill: null });
/** Units take the palette in turn; a unit's banner and its finished steps share it. */
const BANNER_TONES: BannerTone[] = [
  onTone(pastelGrad.sage),
  onTone(pastelGrad.peach),
  onTone(pastelGrad.lav),
  onTone(pastelGrad.butter),
  // Rosa is the one dark tone: white type, and the fill turns white so it
  // still shows against the card.
  { grad: gradients.deep, ink: colors.onPrimary, track: 'rgba(255, 255, 255, 0.22)', fill: colors.onPrimary },
];

const toneOf = (unit: Unit) => BANNER_TONES[(unit.ordinal - 1) % BANNER_TONES.length];

function UnitBanner({
  lesson,
  state,
  done,
  total,
  onPress,
}: {
  lesson: PathLesson;
  state: UnitState;
  /** Lessons of the unit she has finished, out of `total`. */
  done: number;
  total: number;
  onPress: () => void;
}) {
  const { unit } = lesson;
  const tone = toneOf(unit);
  const share = total > 0 ? done / total : 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.banner, { transform: [{ scale: pressed ? press.scale : 1 }] }, webTransition]}
      accessibilityRole="button"
      accessibilityHint="Opens the unit guidebook"
      accessibilityLabel={`Unit ${unit.ordinal}: ${unit.title_en}. ${unit.summary_en}. ${done} of ${total} lessons done`}>
      <LinearGradient pointerEvents="none" colors={tone.grad} style={StyleSheet.absoluteFill} />
      {/* An inset shadow paints under children; redraw clay's lit edge over the gradient. */}
      <View pointerEvents="none" style={styles.bannerClay} />
      <View pointerEvents="none" style={styles.bannerPod} />
      <Image source={BANNER_ART} style={styles.bannerArt} contentFit="contain" accessible={false} />
      <View style={styles.bannerBody}>
        <View style={styles.bannerText}>
          <View style={styles.bannerEyebrowRow}>
            {state === 'current' ? null : (
              <Ionicons name={state === 'done' ? 'checkmark-circle' : 'lock-closed'} size={13} color={tone.ink} />
            )}
            <Text style={[styles.bannerEyebrow, { color: tone.ink }]}>Unit {unit.ordinal}</Text>
          </View>
          <FitText style={[styles.bannerTitle, { color: tone.ink }]} lines={2}>
            {unit.title_en}
          </FitText>
          <FitText style={[styles.bannerSummary, { color: tone.ink }]} lines={1}>
            {unit.summary_en}
          </FitText>
        </View>
        <View style={styles.bannerProgress}>
          <View style={[styles.bannerTrack, { backgroundColor: tone.track }]}>
            {done > 0 ? (
              <View
                style={[
                  styles.bannerFill,
                  { width: `${Math.max(share, 0.08) * 100}%` },
                  tone.fill ? { backgroundColor: tone.fill } : null,
                ]}>
                {tone.fill ? null : (
                  <LinearGradient pointerEvents="none" colors={gradients.progress} style={StyleSheet.absoluteFill} />
                )}
              </View>
            ) : null}
          </View>
          <Text style={[styles.bannerCount, { color: tone.ink }]}>
            {done}/{total}
          </Text>
        </View>
      </View>
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
          <Text style={styles.strong}>Share</Text> →{' '}
          <Text style={styles.strong}>Add to Home Screen</Text>, then open it from there.
        </Text>
      ) : status === 'denied' ? (
        <Text style={styles.mutedText}>
          {Platform.OS === 'web'
            ? 'Notifications are blocked. Switch them on in your browser settings.'
            : 'Notifications are blocked. Switch them on in Settings → Posta → Notifications.'}
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
  // Her id comes straight off the session, which is read from storage: waiting
  // for the profile row as well put a whole round trip in front of the road.
  const { session } = useAuth();
  const userId = session?.user.id;
  const focused = useIsFocused();
  const { limited, paywall } = usePremium();
  /** The section she opened from the sections screen; none means hers. */
  const { section: askedSection } = useLocalSearchParams<{ section?: string }>();
  // The header sits straight on the oat, so the strip iOS reserves above it
  // is the page's own colour.
  useStatusBarColor(colors.bg);
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

  const scrollRef = useRef<FlatList<PathLesson>>(null);
  /** Which unit each step is in, and where its section starts — what `yOf`
   *  counts above it. The road holds one section at a time, so a step's place
   *  is counted from the top of its own section: one header, the units of that
   *  section before it, and its steps. */
  const unitIndexOf = useRef<number[]>([]);
  const sectionStartOf = useRef<number[]>([]);
  const yOf = useCallback((i: number) => {
    const units = unitIndexOf.current;
    if (units.length === 0) return stepY(i, 0);
    const at = Math.min(i, units.length - 1);
    const start = sectionStartOf.current[at] ?? 0;
    return stepY(i - start, (units[at] ?? 0) - (units[start] ?? 0) + 1);
  }, []);
  /** Where the path starts inside the scroll content, and how tall the window is. */
  const pathTop = useRef(0);
  /** Where the first row of the road starts in the list — the header's bottom.
   *  State, not just a ref: the list's row offsets are counted from it. */
  const [listTop, setListTop] = useState(0);
  /** The list's header (web) — the road starts under it, measured before first paint. */
  const headerRef = useRef<View>(null);
  const viewport = useRef(0);
  /** The road is put in place once, as soon as both measurements exist. */
  const placed = useRef(false);
  /** The list's content height, once it has one. On native the road is placed
   *  only after this: iOS clamps a scroll issued before the content is sized. */
  const contentH = useRef(0);
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

  /** Set once the real load has landed: a late read of the phone's copy must
   *  never paint over it. */
  const fresh = useRef(false);
  /** The road on screen was drawn from the phone's copy, and the real load
   *  hasn't checked it yet. */
  const shownFromCache = useRef(false);

  /** Puts a course and her status on the road — the real load's or the phone's copy. */
  const adopt = useCallback((course: Course, snap: HomeSnapshot, cached: boolean) => {
    unitIndexOf.current = course.path.map((l) => l.unitIndex);
    const starts = new Map<number, number>();
    sectionStartOf.current = course.path.map((l) => {
      if (!starts.has(l.section.id)) starts.set(l.section.id, l.index);
      return starts.get(l.section.id)!;
    });
    setData({
      course,
      current: currentIndex(course.path, new Set(snap.done)),
      streak: snap.streak,
      known: snap.known,
      weekDone: snap.weekDone,
      checkAttempts: new Map(snap.checkAttempts),
      cached,
    });
  }, []);

  // Keyed on her id, not the profile object: a profile refetch that changes
  // nothing must not reload the path.
  const load = useCallback(async () => {
    if (!userId) return;
    const [course, { done, checkAttempts }, counts, streakWeek] = await Promise.all([
      loadCourse(),
      loadLessonProgress(userId),
      getPracticeCounts(userId),
      // Her streak and this week's days, for the header — published to the
      // copy every tab's header reads, so theirs is in place before they open.
      fetchStreakWeek(userId),
    ]);
    const snap: HomeSnapshot = {
      done: [...done],
      checkAttempts: [...checkAttempts],
      streak: streakWeek.streak,
      known: counts.known,
      weekDone: streakWeek.weekDone,
      pushStatus: lastPushStatus,
    };
    fresh.current = true;
    adopt(course, snap, false);
    writeSnapshot('home', userId, snap);
  }, [userId, adopt]);

  // A cold start opens on the road as the phone last saw it — course and
  // status both — and the real load corrects it quietly behind. Coming back
  // from a lesson needs none of this: `lastShown` is already standing.
  useEffect(() => {
    if (!userId || lastShown) return;
    let alive = true;
    void Promise.all([peekCourse(), readSnapshot<HomeSnapshot>('home', userId)]).then(([course, snap]) => {
      if (!alive || fresh.current || !course || !snap) return;
      if (snap.pushStatus && lastPushStatus == null) {
        lastPushStatus = snap.pushStatus;
        setPushStatus((s) => s ?? snap.pushStatus);
      }
      adopt(course, snap, true);
    });
    return () => {
      alive = false;
    };
  }, [userId, adopt]);

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
        else scrollRef.current?.scrollToOffset({ offset: y, animated: false });
        return;
      }
      // Native has no duration to give — its animated scroll is the platform's
      // and that is fine there. On web the duration is the whole point, so the
      // tween is written a frame at a time onto the node itself.
      if (!node) {
        scrollRef.current?.scrollToOffset({ offset: y, animated: true });
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
      shownFromCache.current = !!data.cached;
      show(next);
      return;
    }
    // The real status, landing on a road drawn from the phone's copy. Nothing
    // she did on this screen changed it, so nothing animates: a step finished
    // elsewhere is put in place, and the header simply takes the true count.
    if (shownFromCache.current && !data.cached) {
      shownFromCache.current = false;
      if (sameShown(from, next)) return;
      const moved = next.lessons !== from.lessons;
      show(next, moved || !isAdvance(from, next));
      if (moved && placed.current) requestAnimationFrame(() => scrollToStep(next.lessons, false));
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
  }, [data, advance, show, scrollToStep]);

  // On web the road is pinned before its first paint. RNW's onLayout arrives a
  // few frames after the path appears — long enough for the top of the road to
  // flash before the jump to her step. A layout effect runs between the DOM
  // being built and the browser painting it, so measuring and writing
  // scrollTop here means the first frame anyone sees is already in place.
  // Native (and any web miss) still places through onLayout as before.
  useLayoutEffect(() => {
    if (Platform.OS !== 'web' || placed.current || shown == null || pushStatus == null) return;
    if (!data?.course.path.length) return;
    const scrollEl = scrollNode();
    const headerEl = headerRef.current as unknown as HTMLElement | null;
    const contentEl = scrollEl?.firstElementChild as HTMLElement | null;
    if (!scrollEl || !headerEl || !contentEl) return;
    viewport.current = scrollEl.clientHeight;
    // The header ends in the path's own top padding, so the path "starts"
    // PATH_TOP above where its first row does — what `yOf` counts from.
    pathTop.current =
      headerEl.getBoundingClientRect().bottom - contentEl.getBoundingClientRect().top - PATH_TOP;
    placed.current = true;
    placedAt.current = Date.now();
    scrollEl.scrollTop = Math.max(pathTop.current + yOf(shown.lessons) - viewport.current * 0.42, 0);
    markBootReady();
    if (pendingAdvance.current) requestAnimationFrame(advance);
  }, [shown, pushStatus, data, askedSection, advance, scrollNode, yOf]);

  // ------------------------------------------------------------------
  // Path layout. Every lesson of the course is a coin; the road is drawn from
  // what is *shown*, which lags the data by the length of the advance — that
  // lag is the animation.
  // ------------------------------------------------------------------
  const path = data?.course.path ?? NO_PATH;
  /** Each unit's last step on the road, so a banner's state is a lookup
   *  rather than a pass over the whole course. Above the early return: it is
   *  a hook. */
  const unitLastIndex = useMemo(() => {
    const last = new Map<string, number>();
    for (const l of path) last.set(l.unit_id, l.index);
    return last;
  }, [path]);

  // Nothing to place: the launch splash has waited long enough.
  useEffect(() => {
    if (data && data.course.path.length === 0) markBootReady();
  }, [data]);

  if (!userId) return null;

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
    contentH.current = 0;
  }
  const openSection = (id: number) => router.setParams({ section: String(id) });
  /** The road itself is standing, not the loading sun or the empty note. */
  const roadReady = shown != null && pushStatus != null && !noCourse && road.length > 0;
  /** A row is a step, with its unit's banner above it when it opens one — so
   *  its place is the step's, less what stands on it. */
  const rowAbove = (lesson: PathLesson) => (lesson.opensUnit ? BANNER_PITCH : 0);
  const rowLayout = (rows: ArrayLike<PathLesson> | null | undefined, i: number) => {
    const lesson = rows![i];
    const above = rowAbove(lesson);
    return { length: above + STEP_PITCH, offset: listTop - PATH_TOP + yOf(lesson.index) - above, index: i };
  };

  const phaseOf = (i: number): Phase => (i < current ? 2 : i === current ? 1 : 0);
  const unitStateOf = (lesson: PathLesson): UnitState => {
    const last = unitLastIndex.get(lesson.unit_id) ?? lesson.index;
    return current > last ? 'done' : current >= lesson.index ? 'current' : 'locked';
  };
  /** How far through a unit she is, from the unit's first step on the road. */
  const unitProgressOf = (lesson: PathLesson) => {
    const total = (unitLastIndex.get(lesson.unit_id) ?? lesson.index) - lesson.index + 1;
    return { total, done: Math.min(Math.max(current - lesson.index, 0), total) };
  };

  // Land with the step in view, path history above it — on her old step if a
  // move is about to play, so she sees it happen rather than arriving after it.
  const place = () => {
    if (!roadReady || placed.current || viewport.current === 0 || pathTop.current === 0) return;
    if (Platform.OS !== 'web' && contentH.current === 0) return;
    placed.current = true;
    placedAt.current = Date.now();
    markBootReady();
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

  // The free tier is the first units of the road; a step past them opens the
  // paywall instead, at the moment she is reaching for more.
  const startLesson = (lesson: PathLesson) =>
    limited && lesson.unitIndex >= FREE_UNITS
      ? paywall('lesson')
      : lesson.kind === 'story'
      ? router.push(`/story?lesson=${lesson.id}`)
      : lesson.kind === 'speak'
      ? router.push(`/hablar-brief?kind=unit&lesson=${lesson.id}`)
      : lesson.kind === 'slang'
      ? router.push(`/argentine-round?lesson=${lesson.id}`)
      : lesson.kind === 'culture'
      ? router.push(`/culture-class?lesson=${lesson.id}`)
      : router.push(`/practice?lesson=${lesson.id}`);

  // Jumping ahead (learning-engine-spec §7): a unit or section still ahead can
  // be tested into, as long as the test stays one sitting long.
  const units = data?.course.units ?? [];
  const hereUnit = path[Math.min(current, Math.max(path.length - 1, 0))]?.unit;
  const jumpSpan = (target: Unit) =>
    hereUnit && current < path.length
      ? units.filter((u) => u.course_order >= hereUnit.course_order && u.course_order < target.course_order).length
      : 0;
  const canJumpTo = (target: Unit) =>
    !!hereUnit && current < path.length && jumpAllowed(units, hereUnit.course_order, target);
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

  return (
    <View style={styles.safe}>
      {/* The header is a sibling of the scroller, not its first row: it holds
          its place while the road runs past underneath. The top inset lives
          inside it, so its white reaches up under the status bar instead of
          the page colour showing through a padded band. */}
      {/* On Course the title's place is taken by the section she is on — the
          same way into the map of sections as the bar atop the road. */}
      <AppHeader
        title="Course"
        pill={
          viewed
            ? {
                label: `Course · Section ${viewed.section.ordinal}`,
                onPress: () => router.push('/sections'),
                accessibilityLabel: `Section ${viewed.section.ordinal}: ${viewed.section.title_en}, level ${viewed.section.cefr}`,
                accessibilityHint: 'Shows every section of the course',
              }
            : null
        }
        // Until the course is read, the pill's place is held rather than
        // filled with a title that would turn into the pill a moment later.
        pillPending={!data}
        status={shown?.streak ?? null}
        weekDone={shown?.weekDone ?? null}
        epoch={epoch}
      />

      <FlatList
        // A new section is a new list, opened on its own step.
        key={`road:${roadKey}`}
        ref={scrollRef}
        data={roadReady ? road : NO_PATH}
        keyExtractor={(lesson) => `${epoch}:${lesson.id}`}
        extraData={shown}
        getItemLayout={rowLayout}
        // A section is a few hundred rows; only the ones near the screen are
        // mounted. Rows are exact, so a jump anywhere lands without measuring.
        initialNumToRender={14}
        maxToRenderPerBatch={10}
        windowSize={7}
        // Figures stand past their row's edges; nothing may clip them.
        removeClippedSubviews={false}
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
        onContentSizeChange={(_, h) => {
          contentH.current = h;
          place();
        }}
        ListHeaderComponent={
          // Everything above the road, ending in the road's own top padding —
          // a spacer rather than padding, so the gap before it only appears
          // when something stands above it, as it did when this was a column.
          <View
            ref={headerRef}
            style={styles.header}
            onLayout={(e) => {
              // The list wraps its header in a view of its own at the very top
              // of the content, so the header's height is where the road starts.
              const { height } = e.nativeEvent.layout;
              pathTop.current = height - PATH_TOP;
              setListTop(height);
              place();
            }}>
            {pushStatus ? (
              <PushPrompt
                userId={userId}
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
            <View style={styles.pathTop} />
          </View>
        }
        ListEmptyComponent={
          noCourse ? (
            <Panel>
              <Text style={styles.mutedText}>No lessons published yet.</Text>
            </Panel>
          ) : (
            // The road's place, held by a sun instead of a spinner: clay white on
            // the oat, present but barely, until the real path stands here.
            <View style={styles.pathLoading}>
              <Pulse reduced={reduced} style={styles.pathLoadingStar}>
                <MaterialCommunityIcons name="white-balance-sunny" size={124} color={colors.card} />
              </Pulse>
            </View>
          )
        }
        renderItem={({ item: lesson }) => (
          <>
            {lesson.opensUnit ? (
              <UnitBanner
                lesson={lesson}
                state={unitStateOf(lesson)}
                {...unitProgressOf(lesson)}
                onPress={() => setGuide(lesson.unit)}
              />
            ) : null}
            <PathStep
              index={lesson.index}
              phase={phaseOf(lesson.index)}
              reduced={reduced}
              breathe={focused}
              kind={lesson.kind}
              sub={KIND_LABEL[lesson.kind] ?? `Lesson ${lesson.ordinal}`}
              attempts={data?.checkAttempts.get(lesson.id)}
              tone={toneOf(lesson.unit)}
              label={`${lesson.title_en} · ${lesson.unit.title_en}`}
              onPress={lesson.index === current ? () => startLesson(lesson) : undefined}
            />
          </>
        )}
        ListFooterComponent={
          roadReady && viewed ? (
            <View style={styles.pathEnd}>
              <SectionEnd
                next={nextSection}
                onOpen={nextSection && nextSection.state !== 'locked' ? () => openSection(nextSection.section.id) : undefined}
                onJump={
                  nextSection?.state === 'locked' && nextSection.units[0] && canJumpTo(nextSection.units[0])
                    ? () => jumpTo(nextSection.units[0])
                    : undefined
                }
              />
            </View>
          ) : null
        }
      />

      {!noCourse && (data?.known ?? 0) > 0 ? <ReviewButton onPress={() => router.push('/my-words')} /> : null}
      <Guidebook
        unit={guide}
        tips={guide ? (data?.course.tipsByUnit.get(guide.id) ?? []) : []}
        onClose={() => setGuide(null)}
        jump={guideJump}
      />
      {/* Only once there is a road to jump along — not over the loading sun. */}
      {roadReady ? (
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
// ReviewButton — the way back to what she has already learned: her words, how
// settled each one is, and a round of the weakest (my-words.tsx, which rises
// from the bottom). It appears once she knows a word, so the road is clear
// until there is something behind her to go over.
// ---------------------------------------------------------------------------
function ReviewButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.practiceSlot} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Review your words"
        hitSlop={8}
        style={({ pressed }) => [styles.practice, { transform: [{ scale: pressed ? press.scale : 1 }] }, webTransition]}>
        <View style={styles.practiceIcon}>
          <Ionicons name="refresh" size={17} color={colors.primary} />
        </View>
        <Text style={styles.practiceText}>Review</Text>
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
          { transform: [{ scale: pressed ? press.scale : 1 }] },
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

/** Covers its parent — spread into the styles that layer the pill's faces. */
const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  // No gap: the list's children are its rows, whose spacing is their own. No
  // top padding either — the header carries it, so its height is the road's top.
  container: { paddingHorizontal: 20, paddingBottom: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },

  // The road, before there is a road ----------------------------------------
  pathLoading: { alignItems: 'center', paddingVertical: 130 },
  pathLoadingStar: { opacity: 0.8 },

  // Back to her step --------------------------------------------------------
  jumpSlot: { position: 'absolute', right: 18, bottom: 18 },
  jump: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.surface,
  },
  sectionTitle: { ...font.display[700], fontSize: 19, color: colors.ink, letterSpacing: -0.2 },
  mutedText: { ...font.body[600], fontSize: 15, color: colors.muted, lineHeight: 21 },
  strong: { ...font.body[800] },
  errorText: { ...font.body[600], fontSize: 14, color: colors.dangerInk, lineHeight: 20 },

  // Section end --------------------------------------------------------------
  sectionEyebrow: { ...font.body[800], fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  sectionEnd: {
    marginTop: 8,
    // Clear of the floating tab bar and the Review button, which both sit
    // over the bottom of the scroller.
    marginBottom: 120,
    alignItems: 'center',
    gap: 8,
    padding: 22,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  sectionEndTitle: {
    ...font.display[800],
    fontSize: 22,
    lineHeight: 25,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionEndText: { ...font.body[600], fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 6 },

  // Unit banners -------------------------------------------------------------
  banner: {
    height: BANNER_H,
    marginBottom: BANNER_GAP,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: clay.surface,
  },
  bannerClay: {
    ...FILL,
    borderRadius: radius.xl,
    boxShadow: 'inset 2px 3px 0 rgba(255,255,255,0.4), inset -3px -5px 10px rgba(120,70,40,0.10)',
  },
  /** The text stops short of the carpincho's pod. */
  bannerBody: { flex: 1, justifyContent: 'space-between', padding: 20, paddingRight: 150 },
  bannerText: { gap: 2 },
  bannerEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bannerEyebrow: { ...font.body[800], fontSize: 13, lineHeight: 17, opacity: 0.8 },
  bannerTitle: { ...font.display[800], fontSize: 30, lineHeight: 31, letterSpacing: -0.5 },
  bannerSummary: { ...font.body[700], fontSize: 16, lineHeight: 20, opacity: 0.85 },
  bannerProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerTrack: {
    flex: 1,
    height: 16,
    borderRadius: radius.pill,
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  bannerFill: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.35)',
  },
  bannerCount: { ...font.body[800], fontSize: 13, fontVariant: ['tabular-nums'] },
  /** The soft white disc the carpincho stands in, half off the corner. */
  bannerPod: {
    position: 'absolute',
    right: -18,
    bottom: -26,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.pod,
    boxShadow: clay.surface,
  },
  bannerArt: { position: 'absolute', right: 10, bottom: -8, width: 110, height: 160 },

  // Practice ---------------------------------------------------------------
  practiceSlot: { position: 'absolute', left: 18, bottom: 18, gap: 10, alignItems: 'flex-start' },
  /** The rosa well the Review button's arrow sits in. */
  practiceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  placement: { gap: 10 },
  attempts: {
    position: 'absolute',
    right: -8,
    top: -6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: pastel.peach,
    boxShadow: clay.surface,
  },
  attemptsText: { ...font.body[800], fontSize: 11, color: colors.onPastel, fontVariant: ['tabular-nums'] },
  practice: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 7,
    paddingRight: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  practiceText: { ...font.body[800], fontSize: 15, color: colors.onPastel },

  // Path -------------------------------------------------------------------
  // The list's content is no longer one column with a gap, so the header keeps
  // the gap itself, and the road's top and bottom padding are their own pieces.
  header: { gap: 16, paddingTop: 20 },
  pathTop: { height: PATH_TOP },
  pathEnd: { paddingBottom: 6 },
  step: { alignItems: 'center', alignSelf: 'stretch', marginBottom: STEP_GAP },
  stepNode: { alignItems: 'center' },
  /** Fixed whatever the node's phase — the current step grows inside it,
   *  so the road's spacing never shifts under an animation. */
  nodeBox: { width: BOX_W, height: BOX, alignItems: 'center', justifyContent: 'center' },
  /** The pill's own box; its size is animated, its faces fill it. */
  pill: { alignItems: 'center', justifyContent: 'center' },
  pillPress: { ...FILL },
  /** Sits around the pill rather than wrapping it, so it can breathe alone. */
  ringBox: {
    position: 'absolute',
    top: -RING_OUT,
    left: -RING_OUT,
    right: -RING_OUT,
    bottom: -RING_OUT,
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.pill,
    borderWidth: RING_BORDER,
  },
  face: { ...FILL, borderRadius: radius.pill, overflow: 'hidden' },
  faceLocked: { backgroundColor: path.lockedFace, boxShadow: clay.flat },
  faceLit: { boxShadow: path.coinShadow },
  faceDone: { boxShadow: clay.surface },
  glyphs: { ...FILL, borderRadius: radius.pill, overflow: 'hidden' },
  glyph: { ...FILL, alignItems: 'center', justifyContent: 'center' },
  /** Laid out at the current pill's full width, left-anchored, so it never
   *  reflows while the pill grows around it. */
  startRow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: CUR_W,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: (CUR_H - DISC) / 2,
    paddingRight: 16,
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3)',
  },
  /** Nudged right: a play triangle's weight sits left of its box. */
  play: { marginLeft: 3 },
  startText: { flex: 1 },
  startTitle: { ...font.display[800], fontSize: 22, lineHeight: 24, color: path.litGlyph },
  startSub: { ...font.body[700], fontSize: 13, lineHeight: 17, color: path.litGlyph, opacity: 0.9 },
});

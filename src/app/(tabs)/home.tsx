import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

import { Button, Panel } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { localDateStr, WEEKDAY_INITIALS, weekDates } from '@/lib/dates';
import { enablePush, getPushStatus, type PushStatus } from '@/lib/push';
import { getPendingCounts } from '@/lib/session';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { streakStatus, type StreakStatus } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { colors, frost, path, radius, shadow } from '@/lib/theme';
import type { Profile, Streak } from '@/lib/types';

interface HomeData {
  streak: Streak | null;
  due: number;
  newAvailable: number;
  doneToday: boolean;
  /** Cards she has already met — the pool an extra round can draw from. */
  reviewable: number;
  /** Every lesson she has ever finished — one step of the path each. */
  lessons: number;
  studentName: string;
  lastPractice: string | null;
  /** Which days of this week she has already completed, as YYYY-MM-DD. */
  weekDone: string[];
}

// ---------------------------------------------------------------------------
// The path — a Duolingo-style trail of "coin" buttons winding down the screen.
// One node per finished lesson, then the current step (the only tappable one,
// it just starts a lesson), then a few locked nodes so the road visibly
// continues. No repeating, no jumping.
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
const stepY = (i: number) => PATH_TOP + i * STEP_PITCH;

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
// of what's coming, and it lights up when she gets there. FontAwesome5's
// Judaica set (solid only) beats the generic book/headset/dumbbell icons here:
// the road she is walking should look like the language she is learning.
// `hanukiah` is deliberately left out — next to `menorah` at 26px the two are
// the same grey blob.
//
// The star is Material's rather than FontAwesome's: FA draws the same
// interlaced hexagram with bands so thick the triangles almost close up, and
// against the airier ornaments around it the coin read as a blot.
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

type StepIcon = (typeof STEP_ICONS)[number];

/** One size for every phase — the coin's own scale is what makes hers bigger. */
const ICON_SIZE = 27;

/** One glyph, either family, so a step's icon can come from whichever set
 *  draws it best. Colour is a prop on an icon font, hence two of these per
 *  coin rather than one animated colour. */
function StepGlyph({ icon, color }: { icon: StepIcon; color: string }) {
  const size = 'size' in icon ? icon.size : ICON_SIZE;
  return icon.set === 'mdi' ? (
    <MaterialCommunityIcons name={icon.name} size={size} color={color} />
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
// To add another: cut it out with `python3 scripts/cutout-figure.py <source>
// <name>-figure`, then drop it in FIGURES with its own width/height. They
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
  { source: require('@/assets/images/shakshuka-figure.png'), width: 108, height: 97 },
  { source: require('@/assets/images/falafel-figure.png'), width: 106, height: 104 },
  { source: require('@/assets/images/shawarma-figure.png'), width: 108, height: 95 },
  { source: require('@/assets/images/pita-figure.png'), width: 106, height: 104 },
  { source: require('@/assets/images/hummus-figure.png'), width: 108, height: 95 },
  { source: require('@/assets/images/shawarma-pita-figure.png'), width: 106, height: 104 },
  { source: require('@/assets/images/pita-shnitzel-figure.png'), width: 108, height: 97 },
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
  onPress,
}: {
  index: number;
  phase: Phase;
  reduced: boolean;
  onPress?: () => void;
}) {
  // A step mounts wherever it already is and only moves when the path moves
  // under it. That is why the screen opens on her *old* position (see
  // `lastShown`) and advances a beat later: the move has to happen while she is
  // watching, not before the first paint.
  const start = useRef(phase).current;
  const p = useRef(new Animated.Value(start)).current;
  const mounted = useRef(false);
  const stepIcon = STEP_ICONS[index % STEP_ICONS.length];
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
            accessibilityLabel="Empezar la lección"
            hitSlop={8}
            style={styles.nodeBox}>
            {({ pressed }) => coin(pressed)}
          </Pressable>
        ) : (
          <View style={styles.nodeBox}>{coin(false)}</View>
        )}
      </View>
    </View>
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
  isStudent,
  status,
  onStatus,
}: {
  userId: string;
  isStudent: boolean;
  status: PushStatus;
  onStatus: (s: PushStatus) => void;
}) {
  const [busy, setBusy] = useState(false);
  if (status === 'enabled' || status === 'unsupported') return null;

  const enable = async () => {
    setBusy(true);
    try {
      onStatus(await enablePush(userId));
    } catch {
      onStatus('off');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>Notificaciones</Text>
      {status === 'needs_install' ? (
        <Text style={styles.mutedText}>
          Para recibir recordatorios en iPhone, primero agregá la app a tu pantalla de inicio: en
          Safari tocá <Text style={{ fontWeight: '700' }}>Compartir</Text> →{' '}
          <Text style={{ fontWeight: '700' }}>Agregar a inicio</Text>, y abrila desde ahí.
        </Text>
      ) : status === 'denied' ? (
        <Text style={styles.mutedText}>
          {Platform.OS === 'web'
            ? 'Las notificaciones están bloqueadas. Activalas en la configuración del navegador.'
            : 'Las notificaciones están bloqueadas. Activalas en Ajustes → Moribreo → Notificaciones.'}
        </Text>
      ) : (
        <>
          <Text style={styles.mutedText}>
            {isStudent
              ? 'Te recordamos la lección desde las 8 de la mañana, cada 3 horas, hasta que la termines.'
              : 'Te avisamos cuando tu alumno complete su lección, y si se saltea un día.'}
          </Text>
          <Button
            title="Activar notificaciones"
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
const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

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
    <View style={styles.week} accessibilityRole="summary" accessibilityLabel="Racha de la semana">
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
// HomeHeader — her face, her name, her streak. It holds its place while the
// road scrolls past underneath, so the one line that says who this is for is
// never more than a glance away.
//
// The photo is the student's, so the teacher's dashboard doesn't wear it: a
// face next to "Hola, Ohad" would be claiming to be him.
// ---------------------------------------------------------------------------
function HomeHeader({
  name,
  isStudent,
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
  isStudent: boolean;
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
        {isStudent ? (
          <Image
            source={require('@/assets/images/mora-avatar.png')}
            style={styles.avatar}
            contentFit="cover"
            accessible={false}
          />
        ) : null}
        <Text style={styles.hello} numberOfLines={1}>
          {isStudent ? `Hola, ${name}!` : `Hola, ${name}`}
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
                {status.kind === 'recovering' ? status.days : 0} días de racha
              </Text>
            </View>
          ) : (
            <View style={styles.streakChip}>
              <Text style={styles.chipFlame}>🔥</Text>
              <Text style={styles.chipText} numberOfLines={1}>
                {status.kind === 'alive' ? status.days : 0}{' '}
                {status.kind === 'alive' && status.days === 1 ? 'día' : 'días'} de racha
              </Text>
            </View>
          )
        )}
        {/* The last thing Perfil was still needed for — and only on the teacher's
            side. Mora stays signed in on her phone forever; the only thing a
            sign-out button could do for her is lock her out by accident. */}
        {isStudent ? null : (
          <Pressable
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
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

/** Locked steps rendered below the current one, extended as she scrolls. */
const LOCKED_CHUNK = 12;

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
  // The road ahead grows as she approaches its end, so it never bottoms out.
  const [lockedAhead, setLockedAhead] = useState(LOCKED_CHUNK);
  /** Where the path starts inside the scroll content, and how tall the window is. */
  const pathTop = useRef(0);
  /** The path's own DOM node (web) — measured before first paint. */
  const pathRef = useRef<View>(null);
  const viewport = useRef(0);
  /** The road is put in place once, as soon as both measurements exist. */
  const placed = useRef(false);
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

  const load = useCallback(async () => {
    if (!profile) return;
    // The teacher's dashboard shows the student's progress.
    let student: Profile | null = profile;
    if (profile.role === 'teacher') {
      const { data: rows } = await supabase.from('profiles').select('*').eq('role', 'student');
      student = (rows?.[0] as Profile) ?? null;
    }

    const today = localDateStr();
    const week = weekDates();
    const [counts, streakRes, sessionRes, lastRes, doneCountRes, lessonRes, weekRes] =
      await Promise.all([
        student
          ? getPendingCounts(student.id)
          : Promise.resolve({ due: 0, newAvailable: 0, total: 0, reviewable: 0 }),
        student
          ? supabase.from('streaks').select('*').eq('user_id', student.id).maybeSingle()
          : Promise.resolve({ data: null }),
        student
          ? supabase
              .from('daily_sessions')
              .select('completed_at')
              .eq('user_id', student.id)
              .eq('session_date', today)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        student
          ? supabase
              .from('review_logs')
              .select('reviewed_at')
              .eq('user_id', student.id)
              .order('reviewed_at', { ascending: false })
              .limit(1)
          : Promise.resolve({ data: null }),
        student
          ? supabase
              .from('daily_sessions')
              .select('session_date', { count: 'exact', head: true })
              .eq('user_id', student.id)
              .not('completed_at', 'is', null)
          : Promise.resolve({ count: 0 }),
        student
          ? supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', student.id)
          : Promise.resolve({ count: 0, error: null }),
        // This week's completed days, for the strip in the header. Read off
        // `daily_sessions` rather than derived from the streak: a week with a
        // hole in it still has to show the days on either side of the hole.
        student
          ? supabase
              .from('daily_sessions')
              .select('session_date')
              .eq('user_id', student.id)
              .gte('session_date', week[0])
              .lte('session_date', week[6])
              .not('completed_at', 'is', null)
          : Promise.resolve({ data: [] }),
      ]);

    setData({
      streak: (streakRes.data as Streak) ?? null,
      due: counts.due,
      newAvailable: counts.newAvailable,
      doneToday: !!sessionRes.data?.completed_at,
      reviewable: counts.reviewable,
      // Before migration 0005 there is no `lessons` table, and a HEAD request
      // for a missing one comes back with no body — which postgrest-js reports
      // as a null count and, because there is nothing to parse, no error at
      // all. So the count itself is the signal: a number means the table
      // answered, null means fall back to one step per completed day.
      lessons: lessonRes.count ?? doneCountRes.count ?? 0,
      studentName: student?.display_name ?? '',
      lastPractice: lastRes.data?.[0]?.reviewed_at ?? null,
      weekDone: (weekRes.data ?? []).map((r: { session_date: string }) => r.session_date),
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
      const y = Math.max(pathTop.current + stepY(i) - viewport.current * 0.42, 0);
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
    [scrollNode],
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
      lessons: data.lessons,
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
    scrollEl.scrollTop = Math.max(
      pathTop.current + stepY(shown.lessons) - viewport.current * 0.42,
      0,
    );
    if (pendingAdvance.current) requestAnimationFrame(advance);
  }, [shown, pushStatus, advance, scrollNode]);

  if (!profile) return null;
  const isStudent = profile.role === 'student';
  const pending = (data?.due ?? 0) + (data?.newAvailable ?? 0);
  // Re-derived on every render rather than held in state: the screen reloads on
  // focus, so a phone left open past midnight comes back to the right week.
  const todayDate = localDateStr();
  const thisWeek = weekDates();

  // ------------------------------------------------------------------
  // Path layout. One done node per finished lesson, then the step a tap
  // would practice right now — today's scheduled session, or an extra round
  // once today is already done. Either way finishing it moves her on.
  // ------------------------------------------------------------------
  const canPractice = data != null && (pending > 0 || data.reviewable > 0);
  const noCardsYet = data != null && pending === 0 && data.reviewable === 0;

  // The road is drawn from what is *shown*, which lags the data by the length
  // of the advance — that lag is the animation.
  const current = shown?.lessons ?? 0;
  const steps = current + 1 + lockedAhead;
  const phaseOf = (i: number): Phase => (i < current ? 2 : i === current ? 1 : 0);

  // Land with the step in view, path history above it — on her old step if a
  // move is about to play, so she sees it happen rather than arriving after it.
  const place = () => {
    if (placed.current || viewport.current === 0 || pathTop.current === 0) return;
    placed.current = true;
    placedAt.current = Date.now();
    const step = current;
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

  // What makes a round "extra" is that today is already credited — not that
  // there is nothing scheduled left. Those come apart on any day where nothing
  // happens to fall due: routing by `pending` sent the first lesson of the day
  // in as an extra round, so the day was never credited, the streak never
  // moved, and `last_completed_date` stayed old enough to reset the streak on
  // the next day that did count. `doneToday` is the flag that actually answers
  // the question, read straight off today's `daily_sessions` row.
  const startLesson = () => router.push(data?.doneToday ? '/practice?free=1' : '/practice');

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
        isStudent={isStudent}
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
          // Extend the road well before she reaches the bottom, so the scroll
          // never hits a hard stop and the path reads as endless.
          const remaining = e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height;
          if (remaining < 600) setLockedAhead((n) => n + LOCKED_CHUNK);

          // Wandering up the road she has walked, or down the one she hasn't,
          // offers a way back to the step that is actually hers.
          const node = pathTop.current + stepY(current) + BOX / 2;
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
            isStudent={isStudent}
            status={pushStatus}
            onStatus={(s) => {
              lastPushStatus = s;
              setPushStatus(s);
            }}
          />
        ) : null}

        {isStudent ? (
          shown == null || pushStatus == null ? (
            // The road's place, held by a sun instead of a spinner: white on
            // the bone, present but barely, until the real path stands here.
            <View key="loading" style={styles.pathLoading}>
              <Pulse reduced={reduced} style={styles.pathLoadingStar}>
                <MaterialCommunityIcons name="white-balance-sunny" size={124} color={colors.card} />
              </Pulse>
            </View>
          ) : noCardsYet ? (
            <Panel key="empty">
              <Text style={styles.mutedText}>
                Todavía no hay palabras para practicar. Pedile algunas a Ohad!
              </Text>
            </Panel>
          ) : (
            // Keyed so React can never recycle the loading view's DOM node
            // into this one: react-native-web only wires onLayout's
            // ResizeObserver when a node mounts, so a recycled node keeps the
            // handler but never gets observed — onLayout goes silent, pathTop
            // stays unmeasured, and the road opens at the top instead of on
            // her step.
            <View
              key="path"
              ref={pathRef}
              style={styles.path}
              onLayout={(e) => {
                pathTop.current = e.nativeEvent.layout.y;
                place();
              }}>
              {Array.from({ length: steps }, (_, i) => (
                <PathStep
                  key={`${epoch}:${i}`}
                  index={i}
                  phase={phaseOf(i)}
                  reduced={reduced}
                  onPress={i === current && canPractice ? startLesson : undefined}
                />
              ))}
            </View>
          )
        ) : (
          <Panel style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>{data?.studentName || 'Estudiante'}</Text>
            <Text style={styles.mutedText}>
              {data == null
                ? 'Cargando…'
                : data.doneToday
                  ? 'Ya completó la sesión de hoy ✅'
                  : pending > 0
                    ? `Tiene ${pending} tarjeta${pending === 1 ? '' : 's'} pendiente${pending === 1 ? '' : 's'} hoy.`
                    : 'Sin tarjetas pendientes hoy.'}
            </Text>
            {data?.lastPractice ? (
              <Text style={styles.mutedText}>
                Última práctica: {new Date(data.lastPractice).toLocaleDateString('es-AR')}
              </Text>
            ) : null}
          </Panel>
        )}
      </ScrollView>

      {isStudent && !noCardsYet ? (
        <JumpButton
          direction={jump}
          reduced={reduced}
          onPress={() => scrollToStep(current, !reduced)}
        />
      ) : null}
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
        accessibilityLabel="Volver a tu lección"
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

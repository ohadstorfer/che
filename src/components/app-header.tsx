import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { localDateStr, WEEKDAY_INITIALS, weekDates } from "@/lib/dates";
import { streakStatus, type StreakStatus } from "@/lib/streak";
import { fetchStreakWeek, useStreakWeekValue } from "@/lib/streak-week";
import {
  clay,
  colors,
  font,
  frost,
  pastel,
  path,
  press,
  radius,
} from "@/lib/theme";
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// AppHeader — the one header every tab shares: the tab's name (or, on Course,
// a clay pill naming her section), her streak in durazno and the avatar that
// leads to her account, with this week's seven days beneath.
// It sits outside each tab's scroller, so it holds its place while the page
// runs past underneath.
// ---------------------------------------------------------------------------

const ICE_INK = frost.ink;
const ICE_FACE = frost.face;
const FROZEN_BG = frost.bg;

const webPress =
  Platform.OS === "web"
    ? ({
        transitionProperty: "transform",
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      } as object)
    : null;

// ---------------------------------------------------------------------------
// Loading — while the data is on its way the header keeps its full silhouette
// in soft oat, and the road's place is held by a faint white sun. Everything
// breathes on the same slow cycle: that is what reads as "coming" rather than
// "empty".
// ---------------------------------------------------------------------------
const SKELETON = path.skeleton;

export function Pulse({
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
        useNativeDriver: Platform.OS !== "web",
      });
    const loop = Animated.loop(Animated.sequence([breathe(1), breathe(0.55)]));
    loop.start();
    return () => loop.stop();
  }, [glow, reduced]);
  return (
    <Animated.View style={[{ opacity: glow }, style]}>{children}</Animated.View>
  );
}

/** The week's shape before its data: seven grey ghosts holding the row's height. */
function WeekStripSkeleton({ reduced }: { reduced: boolean }) {
  return (
    <View style={styles.week}>
      {WEEKDAY_INITIALS.map((_, i) => (
        <View key={i} style={styles.day}>
          <Pulse reduced={reduced} style={styles.dayDotGhost} />
          <Pulse reduced={reduced} style={styles.dayLabelGhost} />
        </View>
      ))}
    </View>
  );
}

/** The week strip under the header is switched off; flip to bring it back. */
const SHOW_WEEK = false;

// ---------------------------------------------------------------------------
// WeekStrip — the seven days of this week, and which of them she finished.
//
// The count says how long the run is; the strip says where it stands right now,
// which is the thing that decides whether she practises today. A number can be
// read as "already safe"; a row with a hole in it can't.
//
// Finished days fill in; a past day that went unpractised freezes — the same
// ice the count wears when the run itself is frozen — and days still ahead
// stay quiet.
// ---------------------------------------------------------------------------
const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** The circle's diameter. Small enough that seven of them fit a narrow phone. */
const DAY_SIZE = 32;

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
    <View
      style={styles.week}
      accessibilityRole="summary"
      accessibilityLabel="This week's streak"
    >
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
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [done, pop, reduced]);

  // Never from nothing — the circle is already standing there, it only swells
  // as it fills.
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
  const state = done
    ? "completado"
    : isToday
      ? "pendiente"
      : past
        ? "congelado"
        : "por venir";

  return (
    <View
      style={styles.day}
      accessible
      accessibilityLabel={`${name}: ${state}`}
    >
      <Animated.View
        style={[
          styles.dayDot,
          past && !done && styles.dayDotMissed,
          isToday && !done && styles.dayDotToday,
          done && styles.dayDotDone,
          done && { transform: [{ scale }] },
        ]}
      >
        {done ? (
          <Ionicons name="checkmark" size={18} color={colors.onPastel} />
        ) : past ? (
          <Ionicons name="snow" size={16} color={ICE_INK} />
        ) : null}
      </Animated.View>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
        {label}
      </Text>
    </View>
  );
}

/** A clay pill in the title's place — on Course, the section she is on. */
export interface HeaderPill {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

export function AppHeader({
  title,
  pill,
  pillPending = false,
  status,
  weekDone,
  epoch = 0,
}: {
  title: string;
  /** Shown instead of the title when set. */
  pill?: HeaderPill | null;
  /** A pill is coming: hold its place with a ghost instead of the title. */
  pillPending?: boolean;
  /** Null until the real streak has loaded. */
  status: StreakStatus | null;
  /** Null until the real week has loaded — the strip waits with the count. */
  weekDone: string[] | null;
  /** Bumped to remount the strip, so a day can be put back without un-ticking
   *  itself on screen (see `show` in home.tsx). */
  epoch?: number;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReduced();
  const today = localDateStr();
  const week = weekDates();
  const frozen = status?.kind === "frozen" || status?.kind === "recovering";
  const days =
    status == null
      ? 0
      : status.kind === "alive" || status.kind === "recovering"
        ? status.days
        : 0;

  return (
    <View style={[styles.header, { paddingTop: 12 + insets.top }]}>
      <View style={styles.inner}>
        <View style={styles.top}>
          {pill ? (
            <View style={styles.pillSlot}>
              <Pressable
                onPress={pill.onPress}
                accessibilityRole="button"
                accessibilityLabel={pill.accessibilityLabel}
                accessibilityHint={pill.accessibilityHint}
                style={({ pressed }) => [
                  styles.pill,
                  { transform: [{ scale: pressed ? press.scale : 1 }] },
                  webPress,
                ]}
              >
                <FitText style={styles.pillText} lines={1}>
                  {pill.label}
                </FitText>
                <Ionicons name="chevron-down" size={16} color={colors.ink} />
              </Pressable>
            </View>
          ) : pillPending ? (
            <View style={styles.pillSlot}>
              <Pulse reduced={reduced} style={styles.pillGhost} />
            </View>
          ) : (
            <FitText
              style={styles.title}
              lines={1}
              minimumFontScale={0.8}
              accessibilityRole="header"
            >
              {title}
            </FitText>
          )}
          {/* A ghost until the count is real — a 0 flashing into a 10 is worse
              than a chip that arrives a moment late. A frozen run turns the chip
              icy: the count she lost struck through, the one she stands on beside it. */}
          {status == null ? (
            <Pulse reduced={reduced} style={styles.chipGhost} />
          ) : frozen ? (
            <View
              style={[styles.chip, styles.chipFrozen]}
              accessible
              accessibilityLabel={`Streak frozen. ${days} day streak`}
            >
              <Ionicons name="snow" size={16} color={ICE_INK} />
              <Text style={[styles.chipText, { color: frost.chipText }]}>
                <Text style={styles.chipLost}>
                  {status.kind === "frozen" || status.kind === "recovering"
                    ? status.lost
                    : 0}
                </Text>
                {days ? ` ${days}` : ""}
              </Text>
            </View>
          ) : (
            <View
              style={styles.chip}
              accessible
              accessibilityLabel={`${days} day streak`}
            >
              {/* A flame filled in its own orange, outlined in ink so it holds on the durazno. */}
              <View style={styles.flame}>
                <Ionicons
                  name="flame"
                  size={20}
                  color={pastel.flame}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons
                  name="flame-outline"
                  size={20}
                  color={colors.onPastel}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <Text style={styles.chipText}>{days}</Text>
            </View>
          )}
          {/* The avatar is the way into her account: sign out, delete, and for staff the dashboard. */}
          <Pressable
            onPress={() => router.push("/account")}
            accessibilityRole="button"
            accessibilityLabel="Account"
            hitSlop={6}
            style={({ pressed }) => [
              { transform: [{ scale: pressed ? press.scale : 1 }] },
              webPress,
            ]}
          >
            <Image
              source={require("@/assets/images/capybara-avatar.png")}
              style={styles.avatar}
              contentFit="cover"
              accessible={false}
            />
          </Pressable>
        </View>
        {/* The week in a clay tray on the oat — hidden for now (SHOW_WEEK).
            Its ghost holds the row's height, so nothing below shifts when the
            real days land. */}
        {SHOW_WEEK ? (
          <View style={styles.tray}>
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
        ) : null}
      </View>
    </View>
  );
}

function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => sub.remove();
  }, []);
  return reduced;
}

/**
 * The header's data for the tabs that don't load it themselves: her streak row
 * and this week's finished days. Read from the one shared copy (streak-week.ts)
 * so the chip is already there when a tab opens, and refreshed whenever the
 * tab comes into focus. (Course loads its own, alongside the path, so it can
 * celebrate a new day — and publishes it to the same copy.)
 */
export function useStreakWeek() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const value = useStreakWeekValue(userId);
  useFocusEffect(
    useCallback(() => {
      if (userId) void fetchStreakWeek(userId).catch(() => {});
    }, [userId]),
  );
  return {
    status: value ? streakStatus(value.streak, localDateStr()) : null,
    weekDone: value?.weekDone ?? null,
  };
}

const styles = StyleSheet.create({
  // What every tab opens with: its name, her streak, the avatar, and the week
  // underneath — straight on the oat, no block of its own. It sits outside the
  // scroller, which starts under it.
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: colors.bg,
    zIndex: 2,
  },
  inner: { gap: 16, maxWidth: 560, width: "100%", alignSelf: "center" },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: {
    ...font.display[800],
    flex: 1,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  /** Takes the title's room; the pill inside sizes to its label. */
  pillSlot: { flex: 1, flexDirection: "row" },
  pill: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  pillText: {
    ...font.body[800],
    flexShrink: 1,
    fontSize: 14,
    color: colors.ink,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: pastel.peach,
    boxShadow: clay.surface,
  },
  flame: { width: 20, height: 20 },
  chipText: {
    ...font.body[800],
    fontSize: 15,
    color: colors.onPastel,
    fontVariant: ["tabular-nums"],
  },
  pillGhost: {
    width: 190,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
  },
  chipGhost: {
    width: 70,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
  },
  chipFrozen: { backgroundColor: FROZEN_BG },
  /** The count she lost — still legible, visibly crossed out. */
  chipLost: { color: frost.chipSub, textDecorationLine: "line-through" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: pastel.butter,
    boxShadow: clay.surface,
  },
  tray: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md + 2,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },

  // The week --------------------------------------------------------------
  // Seven days spread across the tray: each dot big enough to carry a check or
  // the ice, with its letter underneath.
  week: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  day: { alignItems: "center", gap: 5 },
  dayLabel: { ...font.body[700], fontSize: 12, color: colors.muted },
  dayLabelToday: { ...font.body[800], color: colors.ink },
  dayLabelGhost: {
    width: 9,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON,
  },
  dayDot: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    // The days still ahead: pressed flat into the tray — nothing has happened yet.
    backgroundColor: path.dayAhead,
    boxShadow: clay.flat,
  },
  /** A day that went by unpractised: frozen over. */
  dayDotMissed: { backgroundColor: ICE_FACE },
  /** Today, still open: an empty ring, waiting to be filled. */
  dayDotToday: {
    backgroundColor: "transparent",
    boxShadow: undefined,
    borderWidth: 2.5,
    borderStyle: "dashed",
    borderColor: colors.accent,
  },
  /** Done: durazno clay, the streak's own colour. */
  dayDotDone: { backgroundColor: pastel.peach, boxShadow: clay.surface },
  dayDotGhost: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.pill,
    backgroundColor: SKELETON,
  },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { Easing, Keyframe, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { tap } from '@/lib/haptics';
import { clay, colors, font, pastel, press, radius, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Pieces shared by onboarding and the paywall.
// ---------------------------------------------------------------------------

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const webPress =
  Platform.OS === 'web'
    ? ({ transitionProperty: 'transform, border-color, background-color', transitionDuration: `${press.duration}ms`, transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' } as unknown as ViewStyle)
    : undefined;

// Keyframes rather than a preset with `withInitialValues`: the web build of
// Reanimated hides the element before a preset runs and, given initial values,
// never shows it again.
const RISE = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 8 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
});
const APPEAR = new Keyframe({ 0: { opacity: 0 }, 100: { opacity: 1 } });

/** Rises 8px into place, a beat after the one before it. */
export const rise = (i: number, reduced?: boolean) =>
  reduced ? APPEAR.duration(200) : RISE.delay(i * 55).duration(320);

/** Slides 16px in from the side she is moving toward. */
export const slide = (dir: 1 | -1, reduced?: boolean) =>
  reduced
    ? APPEAR.duration(180)
    : new Keyframe({
        0: { opacity: 0, transform: [{ translateX: 16 * dir }] },
        100: { opacity: 1, transform: [{ translateX: 0 }], easing: EASE_OUT },
      }).duration(300);

// --- OptionCard -------------------------------------------------------------

export function OptionCard({
  label,
  sub,
  icon,
  bars,
  selected,
  onPress,
}: {
  label: string;
  sub?: string;
  icon?: string;
  /** A level: this many of four bars filled, in place of an icon. */
  bars?: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      {icon ? (
        <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={22}
            color={selected ? colors.primary : colors.onPastel}
          />
        </View>
      ) : bars ? (
        <View style={styles.bars} accessible={false}>
          {[1, 2, 3, 4].map((b) => (
            <View
              key={b}
              style={[styles.bar, { height: 6 + b * 4 }, b <= bars && { backgroundColor: selected ? colors.onPastel : colors.primary }]}
            />
          ))}
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.optionLabel}>{label}</Text>
        {sub ? <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>{sub}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <Ionicons name="checkmark" size={15} color={colors.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

// --- ProgressBar ------------------------------------------------------------

/** Grows from the left; scaleX, so it never re-lays the header out. */
export function ProgressBar({ value }: { value: number }) {
  const v = useSharedValue(value);
  useEffect(() => {
    v.value = withTiming(value, { duration: 360, easing: EASE_OUT });
  }, [value, v]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.02, v.value) }] }));
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

// --- BackButton -------------------------------------------------------------

export function IconButton({
  icon,
  onPress,
  label,
  tint = colors.ink,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  tint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [styles.iconButton, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
      <Ionicons name={icon} size={22} color={tint} />
    </Pressable>
  );
}

export function Question({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 22 }}>
      <Text style={styles.question} accessibilityRole="header">
        {title}
      </Text>
      {sub ? <Text style={styles.questionSub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 16,
    minHeight: 64,
    boxShadow: clay.surface,
  },
  // Chosen: the card turns manteca clay — no outline.
  optionSelected: { backgroundColor: pastel.butter },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastel.peach,
    boxShadow: clay.surface,
  },
  optionIconSelected: { backgroundColor: colors.card },
  optionLabel: { ...font.body[700], fontSize: 16, color: colors.ink, letterSpacing: -0.1 },
  optionSub: { ...font.body[600], fontSize: 13.5, color: colors.muted },
  optionSubSelected: { color: colors.onPastel, opacity: 0.8 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, width: 42, justifyContent: 'center' },
  bar: { width: 6, borderRadius: 3, backgroundColor: colors.trough },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.primary, boxShadow: clay.button },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.trough, boxShadow: clay.trough, overflow: 'hidden' },
  fill: { height: '100%', width: '100%', borderRadius: 5, backgroundColor: colors.primary, transformOrigin: 'left' },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  question: { ...type.title, fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: colors.ink },
  questionSub: { ...type.body, color: colors.muted },
});

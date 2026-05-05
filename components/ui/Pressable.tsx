import { forwardRef, useCallback } from "react";
import { Platform, Pressable as RNPressable, type PressableProps, type View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { motion } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type PressFeedback = "scale" | "opacity" | "none";
export type HapticKind = "selection" | "impactLight" | "impactMedium" | "none";

export type AppPressableProps = PressableProps & {
  feedback?: PressFeedback;
  haptic?: HapticKind;
};

const isWeb = Platform.OS === "web";

function fireHaptic(kind: HapticKind) {
  if (kind === "none" || isWeb) return;
  try {
    if (kind === "selection") void Haptics.selectionAsync();
    else if (kind === "impactLight") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === "impactMedium") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}
}

export const Pressable = forwardRef<View, AppPressableProps>(function Pressable(
  { feedback = "scale", haptic = "selection", onPressIn, onPressOut, onPress, style, disabled, children, ...rest },
  ref,
) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      if (feedback === "scale") {
        scale.value = withTiming(motion.pressScaleNative, {
          duration: 90,
          easing: Easing.out(Easing.quad),
        });
      } else if (feedback === "opacity") {
        opacity.value = withTiming(0.6, { duration: 90 });
      }
      onPressIn?.(e);
    },
    [feedback, onPressIn, scale, opacity],
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
      if (feedback === "scale") {
        scale.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) });
      } else if (feedback === "opacity") {
        opacity.value = withTiming(1, { duration: 140 });
      }
      onPressOut?.(e);
    },
    [feedback, onPressOut, scale, opacity],
  );

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
      if (!disabled) fireHaptic(haptic);
      onPress?.(e);
    },
    [disabled, haptic, onPress],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: feedback === "scale" ? [{ scale: scale.value }] : undefined,
    opacity: feedback === "opacity" ? opacity.value : 1,
  }));

  return (
    <AnimatedPressable
      ref={ref as never}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[animatedStyle, style as never]}
      {...rest}
    >
      {children as never}
    </AnimatedPressable>
  );
});

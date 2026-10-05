import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, font, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The card a finished step opens: what the class was, and a way to do it
// again. It sits at the step she tapped and grows out of it, so it reads as
// that step's — not as a dialog about the road. Tapping anywhere else puts it
// away; a tap on a done step alone never starts a class, since she mostly
// touches the road to scroll it.
// ---------------------------------------------------------------------------

/** Where the tapped step is on screen. */
export interface StepRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const WIDTH = 264;
/** Tall enough for a two-line title; only used to decide which side of the step has room. */
const ROOM = 190;
const GAP = 10;
const EDGE = 16;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export function RedoCard({
  at,
  title,
  unit,
  onRedo,
  onClose,
}: {
  /** The step she tapped; null while the card is away. */
  at: StepRect | null;
  /** The class: "Lesson 3", "Story", "Unit check". */
  title: string;
  /** Its unit's title. */
  unit: string;
  onRedo: () => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const shown = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!at) return;
    shown.setValue(0);
    Animated.timing(shown, { toValue: 1, duration: 180, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [at, shown]);

  if (!at) return <Modal visible={false} transparent />;

  // Under the step when there is room, over it near the bottom of the screen.
  const below = at.y + at.height + GAP + ROOM <= screenH - insets.bottom;
  const left = Math.min(Math.max(at.x + at.width / 2 - WIDTH / 2, EDGE), screenW - WIDTH - EDGE);
  // It grows from the step: the point of the card nearest the step's centre.
  const originX = `${Math.round(((at.x + at.width / 2 - left) / WIDTH) * 100)}%`;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.card,
          { left, transformOrigin: `${originX} ${below ? 'top' : 'bottom'}` },
          below ? { top: at.y + at.height + GAP } : { bottom: screenH - at.y + GAP },
          {
            opacity: shown,
            transform: reduced ? [] : [{ scale: shown.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          },
        ]}>
        <View style={styles.text}>
          <Text style={styles.eyebrow} numberOfLines={1}>
            DONE
          </Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.unit} numberOfLines={2}>
            {unit}
          </Text>
        </View>
        <Button title="Do it again" onPress={onRedo} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: WIDTH,
    padding: 16,
    gap: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...shadow.raised,
  },
  text: { gap: 2 },
  eyebrow: { ...font.body[800], fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  title: { ...font.display[800], fontSize: 22, lineHeight: 25, color: colors.ink, letterSpacing: -0.3 },
  unit: { ...font.body[600], fontSize: 14, lineHeight: 19, color: colors.muted },
});

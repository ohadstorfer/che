import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  type ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PanchoAvatar } from '@/components/hablar-ui';
import { Button } from '@/components/ui';
import { colors, font, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The card a finished step opens: what the class was, and a way to do it
// again. It sits at the step she tapped and grows out of it, so it reads as
// that step's — not as a dialog about the road. Tapping anywhere else puts it
// away; a tap on a done step alone never starts a class, since she mostly
// touches the road to scroll it.
//
// The chat with Pancho uses the same card with other words (the "Chat limits
// UX" canvas): done, it says each chat happens once and leads to how it went;
// on a day he has had too many, it says when the step opens again and
// offers the next lesson instead.
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
/** The same for a card with a note in it. */
const ROOM_TALL = 330;
const GAP = 10;
const EDGE = 16;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export function RedoCard({
  at,
  title,
  unit,
  onRedo,
  onClose,
  eyebrow = 'DONE',
  action = 'Do it again',
  art,
  note,
  opensIn,
}: {
  /** The step she tapped; null while the card is away. */
  at: StepRect | null;
  /** The class: "Lesson 3", "Story", "Unit check". */
  title: string;
  /** Its unit's title, or a line about the class. */
  unit: string;
  /** The button; without it the card has none. */
  onRedo?: () => void;
  onClose: () => void;
  eyebrow?: string;
  /** The button's words. */
  action?: string;
  /** A capybara beside the title. */
  art?: ImageSourcePropType;
  /** A word from Pancho, in a well under the title. */
  note?: string;
  /** "Opens again in 6 h": when the step comes back. */
  opensIn?: string;
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
  const below = at.y + at.height + GAP + (note || opensIn ? ROOM_TALL : ROOM) <= screenH - insets.bottom;
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
        <View style={styles.head}>
          <View style={styles.text}>
            <Text style={styles.eyebrow} numberOfLines={1}>
              {eyebrow}
            </Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.unit} numberOfLines={note ? 3 : undefined}>
              {unit}
            </Text>
          </View>
          {art ? <Image source={art} style={styles.art} contentFit="contain" accessible={false} /> : null}
        </View>
        {note ? (
          <View style={styles.note}>
            <PanchoAvatar size={34} />
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ) : null}
        {opensIn ? (
          <View style={styles.opens}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={colors.muted} />
            <Text style={styles.opensText}>{opensIn}</Text>
          </View>
        ) : null}
        {onRedo ? <Button title={action} onPress={onRedo} /> : null}
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
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { flex: 1, gap: 2 },
  art: { width: 64, height: 72 },
  // Pancho's word, in a well a step darker than the card.
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.stone },
  noteText: { ...font.body[600], flex: 1, fontSize: 14, lineHeight: 19, color: colors.ink },
  opens: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  opensText: { ...font.body[800], fontSize: 14, color: colors.muted, fontVariant: ['tabular-nums'] },
  eyebrow: { ...font.body[800], fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  title: { ...font.display[800], fontSize: 22, lineHeight: 25, color: colors.ink, letterSpacing: -0.3 },
  unit: { ...font.body[600], fontSize: 14, lineHeight: 19, color: colors.muted },
});

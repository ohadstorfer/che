// ---------------------------------------------------------------------------
// WordPopover — a word's meaning, anchored to the word itself.
//
// The meaning used to arrive in a panel under the sentence, which meant
// reading the sentence, looking away, and finding your place again. Anchoring
// it to the word keeps her eye where it already was.
//
// It lives in a transparent Modal rather than an absolute box in the exercise
// tree, because the sentence sits inside a ScrollView: on Android anything
// positioned outside the scroll frame is clipped, and anything inside it
// scrolls out from under the word it points at. The Modal costs a measurement
// in window coordinates, which is the only thing it needs anyway.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { norm, senses } from '@/lib/answers';
import { colors, radius, shadow } from '@/lib/theme';
import type { Form } from '@/lib/types';

/** Where a word sits on screen, in window coordinates. */
export type Anchor = { x: number; y: number; width: number; height: number };

const WIDTH = 240;
/** Keep the bubble off the screen edges even when the word is at one. */
const MARGIN = 12;
/** The gap between the word and the bubble, big enough for the tail. */
const TAIL_GAP = 9;
/** Half the rotated square that forms the tail. */
const TAIL_HALF = 9;
/** Below the word only when there is less room above than a bubble needs. */
const MIN_ABOVE = 150;

/** Fast in, faster out: the eye is already on the word, and the bubble is
 *  opened often enough that any wait would be felt. */
const ENTER_MS = 150;
/** How long the bubble takes to leave — the Modal waits this out. */
const EXIT_MS = 110;

// The strong ease-out the rest of the app presses with: fast off the mark, so
// the bubble is already legible by the time she has finished tapping.
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * Measures a node in window coordinates. Native has `measureInWindow`; on web
 * the node is a DOM element, and `getBoundingClientRect` already reports
 * viewport coordinates. Measured on tap rather than remembered from layout: a
 * word that only reflows — the sentence rewrapping — never fires `onLayout`,
 * so anything cached at mount goes stale.
 */
export function measureAnchor(node: unknown, cb: (a: Anchor | null) => void) {
  const n = node as {
    measureInWindow?: (f: (x: number, y: number, w: number, h: number) => void) => void;
    getBoundingClientRect?: () => DOMRect;
  };
  if (!n) return cb(null);
  if (Platform.OS === 'web') {
    const rect = n.getBoundingClientRect?.();
    return cb(rect ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height } : null);
  }
  if (!n.measureInWindow) return cb(null);
  n.measureInWindow((x, y, width, height) => cb({ x, y, width, height }));
}

export function WordPopover({
  form,
  anchor,
  gloss,
  onClose,
  audio,
}: {
  /** The word to explain; null closes the popover. */
  form: Form | null;
  anchor: Anchor | null;
  /** What the word means in the sentence it was tapped in. */
  gloss?: string;
  onClose: () => void;
  /** Rendered next to the Spanish when the word has a clip — passed in so this
   *  component stays free of the audio player and its hooks. */
  audio?: (path: string) => React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState(() => Dimensions.get('window'));
  // The Modal outlives the word by the length of the exit, so the bubble can
  // fade out instead of being torn off screen. Tracked apart from `form` so
  // closing is instant to the caller.
  const [mounted, setMounted] = useState(false);
  // Driven by hand rather than through Reanimated's entering/exiting props:
  // those only accept the predefined animations on web, where a custom one is
  // dropped with a console warning and the bubble simply appears. A shared
  // value behaves the same on both platforms.
  const progress = useSharedValue(0);
  const last = useRef<{ form: Form; anchor: Anchor; gloss?: string } | null>(null);

  const open = !!form && !!anchor;
  useEffect(() => {
    if (open) {
      setMounted(true);
      progress.value = withTiming(1, { duration: ENTER_MS, easing: EASE_OUT });
      return;
    }
    progress.value = withTiming(0, { duration: EXIT_MS, easing: EASE_OUT });
    const t = setTimeout(() => setMounted(false), EXIT_MS + 30);
    return () => clearTimeout(t);
  }, [open, progress]);

  // Nothing appears out of nothing: the bubble starts at 0.95, not at 0, and
  // grows from the tail so it reads as coming out of the word.
  const motion = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: reduced ? 1 : 0.95 + 0.05 * progress.value }],
  }));

  // A rotation mid-popover would leave the bubble pointing at nothing.
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setScreen(window);
      close.current();
    });
    return () => sub.remove();
  }, []);

  // The word and its place are held through the exit: `form` is already null
  // by then, and a bubble that empties before it fades reads as a glitch.
  if (form && anchor) last.current = { form, anchor, gloss };
  const held = last.current;
  if (!mounted || !held) return null;

  const { form: shown, anchor: at, gloss: inContext } = held;
  const centre = at.x + at.width / 2;
  const left = Math.min(Math.max(centre - WIDTH / 2, MARGIN), Math.max(MARGIN, screen.width - WIDTH - MARGIN));
  // Above the word by default — that is where her eye already is. Below only
  // when there is no room, which is the top line of a tall sentence.
  const below = at.y < MIN_ABOVE;

  // The tail tracks the word even when a screen edge pushed the bubble off the
  // word's centre, so it still points at what it explains.
  const tailLeft = Math.min(Math.max(centre - left, radius.md + TAIL_HALF), WIDTH - radius.md - TAIL_HALF);

  // Anchored by whichever edge touches the word, so the bubble grows away from
  // it however many meanings the word turns out to have.
  const place = below
    ? { top: at.y + at.height + TAIL_GAP }
    : { bottom: Math.max(MARGIN, screen.height - at.y + TAIL_GAP) };

  // Scaling from the tail, not from the bubble's own centre, is what makes it
  // read as coming out of the word rather than landing on top of it.
  const origin: Array<string | number> = [tailLeft, below ? 0 : '100%', 0];

  // What the word means here, in the sentence she is reading: `bien` in "bien
  // hecho" is "well", not the dictionary's "well, fine, good". Only a sentence
  // that hasn't been glossed yet falls back to the dictionary list.
  //
  // A loanword glosses as itself — mate, empanada, peso. Printing the word
  // again under the word teaches nothing, so the repeat is dropped and what is
  // left is the note, or the plain fact that English borrowed it whole.
  const meanings = (inContext ? [inContext] : senses(shown.gloss_en)).filter((m) => norm(m) !== norm(shown.form));
  const borrowed = !meanings.length && !shown.gloss_note_en;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      <Animated.View
        pointerEvents="box-none"
        style={[styles.wrap, place, { left, width: WIDTH, transformOrigin: origin }, motion]}>
        <View style={styles.bubble}>
          <View style={styles.head}>
            {shown.audio_path && audio ? audio(shown.audio_path) : null}
            <Text style={styles.es}>{shown.form}</Text>
          </View>
          {/* One meaning per row, the way a dictionary lists them — three
              senses run together on one line read as one long phrase. */}
          {meanings.map((m, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.en}>{m}</Text>
            </View>
          ))}
          {borrowed ? <Text style={styles.note}>the same in English</Text> : null}
          {shown.gloss_note_en ? <Text style={styles.note}>{shown.gloss_note_en}</Text> : null}
        </View>
        {/* After the bubble, so the tail's fill covers the border it grows out
            of rather than being painted under it. */}
        <View
          style={[
            styles.tail,
            below ? styles.tailUp : styles.tailDown,
            { left: tailLeft - TAIL_HALF },
          ]}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingBottom: 4,
    ...shadow.raised,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  es: { fontSize: 17, fontWeight: '700', color: colors.ink },
  row: { paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.border },
  en: { fontSize: 16, fontWeight: '600', color: colors.primaryDark },
  note: { fontSize: 13, color: colors.muted, lineHeight: 18, paddingHorizontal: 14, paddingVertical: 8 },
  // A rotated square reads as a tail without needing an SVG; the bubble's own
  // border is faked by the two sides of it that stay visible.
  tail: {
    position: 'absolute',
    width: TAIL_HALF * 2,
    height: TAIL_HALF * 2,
    backgroundColor: colors.card,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
  tailUp: { top: -TAIL_HALF + 2, borderLeftWidth: 1, borderTopWidth: 1 },
  tailDown: { bottom: -TAIL_HALF + 2, borderRightWidth: 1, borderBottomWidth: 1 },
});

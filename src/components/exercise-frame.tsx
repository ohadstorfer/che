import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardController, KeyboardEvents, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { watchWebKeyboard } from '@/lib/keyboard-viewport';
import { clay, colors, font, press, radius } from '@/lib/theme';

/** Set once an exercise has been checked; `answer` is shown when she missed it,
 *  `also` when she got it right another way than the one written, `note` when
 *  she got it right with a slip worth pointing out (an accent, a typo), and
 *  `about` — the word's own aside, "the drink" for mate — either way: the
 *  reveal is where that explanation belongs, since it can no longer give the
 *  answer away. */
export type Verdict = {
  correct: boolean;
  answer?: string;
  also?: string;
  note?: string;
  about?: string;
} | null;

/** The colour of the page the frame sits on (six-digit hex), set by a screen
 *  whose page is one flat colour: an exercise too tall for it then fades into
 *  the page at the cut edge. Left unset, the cut edge only gets its arrow. */
export const PageColorContext = createContext<string | undefined>(undefined);

/** True while the keyboard is up and the exercise did not fit above it: the
 *  capybara steps out of the way then, so the field and the button can stay
 *  in view. It holds until the keyboard goes down — the room he gives back is
 *  what made it fit, and bringing him back would only push it out again. */
export const TightContext = createContext(false);

// ---------------------------------------------------------------------------
// ExerciseFrame — the shape every exercise shares: a question at the top, the
// exercise body in the middle, and one docked action at the bottom that turns
// into the result banner once she checks. Keeping the action in the same place
// throughout means her thumb never has to hunt for it.
// ---------------------------------------------------------------------------
export function ExerciseFrame({
  prompt,
  children,
  verdict,
  canCheck,
  onCheck,
  onContinue,
  note,
  checkLabel = 'Check',
  badge,
  actions,
  instant,
  art,
}: {
  /** A string, or text nodes to sit inside the question's own Text. */
  prompt: React.ReactNode;
  children: React.ReactNode;
  verdict: Verdict;
  canCheck?: boolean;
  onCheck?: () => void;
  onContinue: () => void;
  /** Shown in place of the check button by exercises that grade as she goes. */
  note?: string;
  checkLabel?: string;
  /** A small label above the question — "Harder". */
  badge?: string;
  /** Extra controls in the result panel, under the answer (report, why). */
  actions?: React.ReactNode;
  /** Graded on the tap itself (yes/no), so there is no button to wait on. */
  instant?: boolean;
  /** Art at the end of the question's line (the capybara), instead of a row of its own. */
  art?: React.ReactNode;
}) {
  const fade = useContext(PageColorContext);
  // The screen leaves its bottom edge alone so this bar can own it: a panel
  // that stops short of the edge reads as a card that failed to land. The inset
  // goes on the padding instead, which keeps the button clear of the home
  // indicator while the colour runs all the way down.
  const inset = useSafeAreaInsets().bottom;
  // With the keyboard up the home indicator is under it, so its inset would
  // only leave a gap between the button and the keys.
  const scroll = useRef<ScrollView>(null);
  // Refs as well as state: the layout that follows the keyboard can arrive
  // before the render that knows about it.
  const keyboardUp = useRef(false);
  const viewHeight = useRef(0);
  const contentHeight = useRef(0);
  const offset = useRef(0);
  const [more, setMore] = useState(false);
  const [tight, setTight] = useState(false);

  // More of the exercise lies under the fold. A few points of slack, so a
  // rounding error never draws the hint over a screen that fits.
  const measure = () => {
    const hidden = contentHeight.current - viewHeight.current - offset.current;
    setMore(viewHeight.current > 0 && hidden > MORE_SLACK);
    if (keyboardUp.current && viewHeight.current > 0 && contentHeight.current - viewHeight.current > MORE_SLACK) {
      setTight(true);
    }
  };

  // A typed answer's field is the last thing in the body, and the keyboard
  // takes the half of the screen it was sitting in. Focusing it scrolled
  // nothing, because the screen had not shrunk yet; by the time it has, nobody
  // asks again — so the field stayed under the fold until the first keystroke
  // made the system go and look for the caret. The frame asks instead, the
  // moment it knows how much room the keyboard left.
  // While the keyboard is still rising the frame shrinks a little every
  // frame, and keeping to the end without animating is what keeps up with it.
  const revealField = (animated = true) => {
    if (!keyboardUp.current || contentHeight.current <= viewHeight.current) return;
    scroll.current?.scrollToEnd({ animated });
  };

  const keyboard = useKeyboardUp((up) => {
    keyboardUp.current = up;
    if (!up) setTight(false);
  });
  // The keyboard's height as it moves (negative: it is measured upwards). The
  // frame reaches the bottom of the screen, so that is exactly how much of it
  // the keyboard covers, and the frame gives up that much from the bottom —
  // the docked button rides on top of the keys, on iOS and Android alike.
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const lift = useAnimatedStyle(() => ({ paddingBottom: Math.max(0, -keyboardHeight.get()) }));
  // If the screen had already resized by the time the keyboard was announced.
  useEffect(() => {
    if (!keyboard) return;
    const frame = requestAnimationFrame(() => revealField());
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboard]);
  const bottom = keyboard ? 0 : inset;

  // The keyboard would sit over the answer the moment it lands, so it goes
  // down as she checks.
  const check = () => {
    Keyboard.dismiss();
    onCheck?.();
  };

  return (
    // The keyboard covers the screen instead of shrinking it (on Android too,
    // since 15 draws edge to edge), so the docked button would end up under it.
    <Reanimated.View style={[styles.frame, lift]}>
      <TightContext.Provider value={tight}>
      <View style={styles.scroll}>
        <ScrollView
          ref={scroll}
          // With the keyboard up every point counts: the field, what it is
          // answering and the button all have to share what is left.
          contentContainerStyle={[styles.body, keyboard && styles.bodyTight]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={32}
          onScroll={(e) => {
            offset.current = e.nativeEvent.contentOffset.y;
            measure();
          }}
          onLayout={(e) => {
            viewHeight.current = e.nativeEvent.layout.height;
            measure();
            revealField(false);
          }}
          onContentSizeChange={(_, height) => {
            contentHeight.current = height;
            measure();
          }}>
          {badge ? (
            <View style={styles.badge}>
              <Ionicons name="trending-up" size={13} color={colors.accent} />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
          {art ? (
            <View style={styles.promptRow}>
              <Text style={[styles.prompt, styles.promptBeside]}>{prompt}</Text>
              {art}
            </View>
          ) : (
            <Text style={styles.prompt}>{prompt}</Text>
          )}
          {children}
        </ScrollView>
        <MoreBelow show={more} fade={fade} onPress={() => scroll.current?.scrollToEnd({ animated: true })} />
      </View>
      </TightContext.Provider>

      {verdict ? (
        <FeedbackBar verdict={verdict} onContinue={onContinue} bottom={bottom} actions={actions} />
      ) : instant ? null : (
        <View style={[styles.footer, { paddingBottom: (keyboard ? 12 : 20) + bottom }]}>
          {note ? (
            <Text style={styles.note}>{note}</Text>
          ) : (
            <Button title={checkLabel} variant="check" onPress={check} disabled={!canCheck} />
          )}
        </View>
      )}
    </Reanimated.View>
  );
}

/** How much of the body may sit under the fold before it counts as hidden. */
const MORE_SLACK = 6;
const FADE_HEIGHT = 44;

function useKeyboardUp(onChange: (up: boolean) => void) {
  const [up, setUp] = useState(false);
  const changed = useRef(onChange);
  changed.current = onChange;
  useEffect(() => {
    const set = (next: boolean) => {
      changed.current(next);
      setUp(next);
    };
    // Each exercise mounts a frame of its own, and a keyboard that never went
    // down between two of them announces nothing to the second.
    // The web has no keyboard events; the visual viewport says the same thing.
    if (Platform.OS === 'web') return watchWebKeyboard(set);
    if (KeyboardController.isVisible()) set(true);
    // Announced before it moves, on both platforms.
    const a = KeyboardEvents.addListener('keyboardWillShow', () => set(true));
    const b = KeyboardEvents.addListener('keyboardWillHide', () => set(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  return up;
}

// ---------------------------------------------------------------------------
// MoreBelow — an exercise taller than the screen scrolls, and a row of tiles
// cut flush by the button below reads as the end of the list, not as a list
// that goes on. So the cut edge fades into the page, and an arrow sits on it
// that takes her down. It stays mounted and only fades: it comes and goes as
// she scrolls, and popping in and out under her thumb would be noise.
// ---------------------------------------------------------------------------
function MoreBelow({ show, fade, onPress }: { show: boolean; fade?: string; onPress: () => void }) {
  const shown = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(shown, {
      toValue: show ? 1 : 0,
      duration: show ? 180 : 120,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [show, shown]);

  return (
    <Animated.View style={[styles.more, { opacity: shown }]} pointerEvents={show ? 'box-none' : 'none'}>
      {fade ? (
        <LinearGradient colors={[`${fade}00`, fade]} style={StyleSheet.absoluteFill} pointerEvents="none" />
      ) : null}
      <Pressable
        onPress={onPress}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Scroll down to see the rest"
        style={({ pressed }) => [styles.moreButton, { transform: [{ scale: pressed ? press.scale : 1 }] }]}>
        <Ionicons name="chevron-down" size={16} color={colors.ink} />
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// FeedbackBar — slides up from the bottom edge it will be dismissed towards,
// so the motion and the "Continue" tap point at the same place. It waits for
// its own height before moving, which is why it starts invisible.
// ---------------------------------------------------------------------------
function FeedbackBar({
  verdict,
  onContinue,
  bottom,
  actions,
}: {
  verdict: NonNullable<Verdict>;
  onContinue: () => void;
  actions?: React.ReactNode;
  /** The home indicator's share of the screen, added under the button. */
  bottom: number;
}) {
  const [height, setHeight] = useState(0);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!height) return;
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [enter, height]);

  const good = verdict.correct;
  // A wash of the colour, with the text in its deep tone — the panel covers a
  // third of the screen at the moment she is reading the answer, and a solid
  // block of saturated salvia or coral that size shouts at her instead of
  // telling her something. The one saturated thing left is what she has to act
  // on: the button, in the verdict's own colour so the sheet reads as one piece.
  const tint = good ? colors.success : colors.dangerInk;
  const wash = good ? colors.successSoft : colors.dangerSoft;

  return (
    <Animated.View
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      style={[
        styles.feedback,
        { backgroundColor: wash, paddingBottom: 20 + bottom },
        {
          opacity: height ? enter : 0,
          transform: [
            {
              translateY: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [height || 240, 0],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.feedbackHead}>
        <View style={[styles.feedbackIcon, { backgroundColor: tint }]}>
          <Ionicons name={good ? 'checkmark' : 'close'} size={18} color={colors.onPrimary} />
        </View>
        <Text style={[styles.feedbackTitle, { color: tint }]}>
          {good ? 'Correct!' : 'Almost!'}
        </Text>
      </View>

      {good && verdict.also ? (
        <View style={{ gap: 2 }}>
          <Text style={[styles.feedbackLabel, { color: tint }]}>Also correct:</Text>
          <Text style={[styles.feedbackAnswer, { color: tint }]}>{verdict.also}</Text>
        </View>
      ) : null}

      {good && verdict.note ? (
        <Text style={[styles.feedbackNote]}>{verdict.note}</Text>
      ) : null}

      {!good && verdict.answer ? (
        <View style={{ gap: 2 }}>
          <Text style={[styles.feedbackLabel, { color: tint }]}>Correct answer:</Text>
          <Text style={[styles.feedbackAnswer, { color: tint }]}>{verdict.answer}</Text>
        </View>
      ) : null}

      {verdict.about ? <Text style={styles.feedbackNote}>{verdict.about}</Text> : null}

      {actions}

      <Button title={good ? 'Continue' : 'Got it'} variant={good ? 'right' : 'wrong'} onPress={onContinue} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  scroll: { flex: 1 },
  body: { padding: 20, paddingBottom: 28, gap: 18, flexGrow: 1 },
  bodyTight: { paddingBottom: 12 },
  more: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  moreButton: {
    width: 30,
    height: 30,
    marginBottom: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.trough,
  },
  prompt: { ...font.display[800], fontSize: 24, lineHeight: 29, color: colors.ink, letterSpacing: -0.4 },
  // Over what follows, so art that reaches down onto the card is drawn on top of it.
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 2 },
  promptBeside: { flex: 1 },
  footer: { padding: 20, paddingTop: 12, gap: 10 },
  note: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center', paddingVertical: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    marginBottom: -8,
  },
  badgeText: { ...font.body[800], fontSize: 12, letterSpacing: 0.4, color: colors.accent, textTransform: 'uppercase' },
  feedbackNote: { ...font.body[700], fontSize: 15, lineHeight: 21, color: colors.inkOnWash },

  feedback: {
    padding: 20,
    paddingTop: 20,
    gap: 14,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    boxShadow: clay.float,
  },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.surface,
  },
  feedbackTitle: { ...font.display[800], fontSize: 23, letterSpacing: -0.3 },
  feedbackLabel: { ...font.body[800], fontSize: 15 },
  feedbackAnswer: { ...font.body[600], fontSize: 17, lineHeight: 24 },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { clay, colors, font, radius } from '@/lib/theme';

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
}) {
  // The screen leaves its bottom edge alone so this bar can own it: a panel
  // that stops short of the edge reads as a card that failed to land. The inset
  // goes on the padding instead, which keeps the button clear of the home
  // indicator while the colour runs all the way down.
  const inset = useSafeAreaInsets().bottom;
  // With the keyboard up the home indicator is under it, so its inset would
  // only leave a gap between the button and the keys.
  const keyboard = useKeyboardUp();
  const bottom = keyboard ? 0 : inset;

  // The keyboard would sit over the answer the moment it lands, so it goes
  // down as she checks.
  const check = () => {
    Keyboard.dismiss();
    onCheck?.();
  };

  return (
    // On iOS the keyboard covers the screen instead of shrinking it, so the
    // docked button would end up underneath it; Android resizes on its own.
    <KeyboardAvoidingView style={styles.frame} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {badge ? (
          <View style={styles.badge}>
            <Ionicons name="trending-up" size={13} color={colors.accent} />
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Text style={styles.prompt}>{prompt}</Text>
        {children}
      </ScrollView>

      {verdict ? (
        <FeedbackBar verdict={verdict} onContinue={onContinue} bottom={bottom} actions={actions} />
      ) : instant ? null : (
        <View style={[styles.footer, { paddingBottom: 20 + bottom }]}>
          {note ? (
            <Text style={styles.note}>{note}</Text>
          ) : (
            <Button title={checkLabel} variant="check" onPress={check} disabled={!canCheck} />
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function useKeyboardUp() {
  const [up, setUp] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    // iOS announces the keyboard before it moves, Android only once it has.
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const a = Keyboard.addListener(show, () => setUp(true));
    const b = Keyboard.addListener(hide, () => setUp(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  return up;
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
  body: { padding: 20, paddingBottom: 28, gap: 18, flexGrow: 1 },
  prompt: { ...font.display[800], fontSize: 24, lineHeight: 29, color: colors.ink, letterSpacing: -0.4 },
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

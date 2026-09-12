import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, shadow, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// PasswordDots
//
// A password field rendered as a row of big dots — one per character — instead
// of the native `secureTextEntry` bullets, which are small, tightly set and
// give no sign that a keypress landed. Each character pops in on a spring and
// leaves with a quick shrink, so the field acknowledges every key. A real but
// invisible TextInput sits underneath and does the actual work: system
// keyboard, password managers, autofill.
//
// Tap anywhere on the band to open the keyboard; long-press to paste.
// ---------------------------------------------------------------------------

const DOT = 14;
const GAP = 14;
/** Hollow slots shown while empty — a hint at the shape, not a length cap. */
const PLACEHOLDER_DOTS = 6;

// Native driver is a no-op on react-native-web and logs a warning there.
const NATIVE = Platform.OS !== 'web';

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  error?: string | null;
  autoFocus?: boolean;
  editable?: boolean;
};

export function PasswordDots({
  label,
  value,
  onChangeText,
  onSubmitEditing,
  error,
  autoFocus,
  editable = true,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReduceMotion();

  /**
   * Focus the hidden input so the system keyboard opens.
   * Android quirk: `focus()` on an already-focused TextInput is a no-op, and
   * the soft keyboard can be dismissed with the back button while RN still
   * considers the input focused — blur + refocus reliably reopens it. Only on
   * Android: on iOS web, focus() has to stay inside the tap's call stack or
   * Safari refuses to raise the keyboard at all.
   */
  const focusInput = () => {
    const input = inputRef.current;
    if (!input) return;
    if (Platform.OS === 'android' && input.isFocused()) {
      input.blur();
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      input.focus();
    }
  };

  const paste = async () => {
    const text = await readClipboard();
    if (!text) return;
    onChangeText(text);
    inputRef.current?.focus();
  };

  // --- dots -----------------------------------------------------------------
  // One entry per character, plus the ones on their way out. Ids are stable so
  // a dot animates once and is never re-keyed by a sibling's removal.
  const [dots, setDots] = useState<{ id: number; exiting: boolean }[]>([]);
  const nextId = useRef(0);
  const length = value.length;

  useEffect(() => {
    setDots((prev) => {
      const live = prev.filter((d) => !d.exiting);
      if (length > live.length) {
        // Typing: drop anything still leaving, so the row never jitters when a
        // backspace is followed immediately by a keypress.
        const added = Array.from({ length: length - live.length }, () => ({
          id: nextId.current++,
          exiting: false,
        }));
        return [...live, ...added];
      }
      if (length < live.length) {
        return [
          ...live.slice(0, length),
          ...prev.filter((d) => d.exiting),
          ...live.slice(length).map((d) => ({ ...d, exiting: true })),
        ];
      }
      return prev;
    });
  }, [length]);

  const removeDot = (id: number) => setDots((prev) => prev.filter((d) => d.id !== id));

  // --- placeholder ----------------------------------------------------------
  // Hollow slots sit on the same centre line as the real dots, so the first
  // character lands exactly where the first hollow one was.
  const placeholder = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(placeholder, {
      toValue: length ? 0 : 1,
      duration: length ? 140 : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE,
    }).start();
  }, [length, placeholder]);

  // --- error ----------------------------------------------------------------
  // A wrong password is rare and worth a reaction: a short shake says "that
  // one didn't work" before the eye reaches the message.
  const shake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!error || reduceMotion) return;
    shake.setValue(0);
    Animated.sequence(
      [-1, 1, -0.6, 0.6, 0].map((to) =>
        Animated.timing(shake, {
          toValue: to,
          duration: 55,
          easing: Easing.out(Easing.quad),
          useNativeDriver: NATIVE,
        }),
      ),
    ).start();
  }, [error, reduceMotion, shake]);

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] });

  return (
    <View style={{ gap: 8 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Animated.View style={{ transform: [{ translateX }] }}>
        <Pressable
          onPress={focusInput}
          onLongPress={paste}
          delayLongPress={350}
          disabled={!editable}
          accessibilityRole="none"
          accessibilityLabel={label ?? 'Contraseña'}
          accessibilityHint="Tocá para escribir. Mantené presionado para pegar."
          hitSlop={12}
          style={[
            styles.band,
            focused && styles.bandFocused,
            !!error && styles.bandError,
          ]}>
          <Animated.View style={[styles.placeholderRow, { opacity: placeholder }]} pointerEvents="none">
            {Array.from({ length: PLACEHOLDER_DOTS }, (_, i) => (
              <View key={i} style={styles.hollow} />
            ))}
          </Animated.View>

          <View style={styles.row}>
            {dots.map((d) => (
              <Dot
                key={d.id}
                exiting={d.exiting}
                reduceMotion={reduceMotion}
                onExited={() => removeDot(d.id)}
              />
            ))}
          </View>

          {/* The real field. Invisible, but a genuine input: password managers,
              autofill and the system keyboard all still see it. */}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={onSubmitEditing}
            autoFocus={autoFocus}
            editable={editable}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            caretHidden
            selectTextOnFocus={false}
            style={styles.hidden}
          />
        </Pressable>
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// One dot. Springs in from slightly small and slightly low; leaves faster than
// it arrived, the way a deletion should feel next to a keypress.
// ---------------------------------------------------------------------------
function Dot({
  exiting,
  reduceMotion,
  onExited,
}: {
  exiting: boolean;
  reduceMotion: boolean;
  onExited: () => void;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      t.setValue(1);
      return;
    }
    Animated.spring(t, {
      toValue: 1,
      tension: 220,
      friction: 12,
      useNativeDriver: NATIVE,
    }).start();
  }, [reduceMotion, t]);

  useEffect(() => {
    if (!exiting) return;
    Animated.timing(t, {
      toValue: 0,
      duration: reduceMotion ? 0 : 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE,
    }).start(onExited);
    // onExited is recreated each render; re-running the exit would restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exiting, reduceMotion, t]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: t,
          transform: [
            // Never from zero — a dot that shrinks to nothing reads as a glitch
            // rather than as a character leaving.
            { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [5, 0] }) },
          ],
        },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduce(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/** Clipboard read, where the platform offers one. Silent no-op otherwise. */
async function readClipboard(): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      return (await navigator.clipboard.readText()).trim();
    }
    // Lazily required so the app still builds without expo-clipboard linked.
    const Clipboard = require('expo-clipboard');
    return (await Clipboard.getStringAsync()).trim();
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  label: { ...type.label, color: colors.muted, textAlign: 'center' },
  // The whole band is the touch target: opening the keyboard never means
  // hitting a 14px dot.
  band: {
    minHeight: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadow.card,
  },
  bandFocused: { borderColor: colors.primary },
  bandError: { borderColor: colors.danger },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: GAP,
  },
  placeholderRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: GAP,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.ink,
  },
  // Present and focusable, but takes up no visible room: the dots above are
  // what the user reads.
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    color: 'transparent',
  },
  hollow: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
    borderColor: colors.faint,
  },
  error: { color: colors.danger, fontSize: 14, textAlign: 'center' },
});

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { clay, colors, font, gradients, path, press, radius, type } from '@/lib/theme';

// On web, react-native-web maps these to real CSS transitions, so the press
// scale eases instead of snapping. Native gets the snap, which is what a
// touch already feels like.
const webTransition = (property: string, duration: number) =>
  Platform.OS === 'web'
    ? ({
        transitionProperty: property,
        transitionDuration: `${duration}ms`,
        // Stronger than the built-in ease-out; something reacting to a press
        // should start moving immediately.
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as unknown as ViewStyle & TextStyle)
    : undefined;

// ---------------------------------------------------------------------------
// ScreenBackground — warm oat paper, darkening a step toward the bottom.
// Drop it as the first child of a screen's root view.
//
// The fade is deliberately upside-down: pale at the top, the canvas tone
// gathering toward the bottom edge. iOS 26 gives an installed web app ONE
// status-bar colour for the whole session, frozen at page load — no dynamic
// channel moves it (meta, manifest, body repaints and fixed-element tricks
// all tested dead on device, 2026-08-20). So instead of colouring the strip
// per screen, every screen starts pale and the one frozen colour fits them
// all.
// ---------------------------------------------------------------------------
export function ScreenBackground() {
  return (
    <LinearGradient
      // The page stays `bg` down to half-way, then settles into the canvas
      // tone at the bottom edge, under the floating tab bar.
      colors={[colors.bg, gradients.wash[0], gradients.wash[1]]}
      locations={[0.5, 0.75, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      // The solid colour underneath is never visible — the gradient covers it
      // edge to edge. It exists for iOS 26's status-bar tint sampler, which
      // reads background-*color* only: on web the gradient is a CSS
      // background-image, so without this the sampler falls through to
      // whatever surface sits behind the screen instead of the page's own
      // pale top (see useStatusBarColor).
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]}
      pointerEvents="none"
    />
  );
}

// ---------------------------------------------------------------------------
// MoraFace — the capybara's face on the brand green, as a tile.
// ---------------------------------------------------------------------------
export function MoraFace({ size = 112 }: { size?: number }) {
  return (
    <View style={[styles.face, { width: size, height: size, borderRadius: size * 0.2237 }]}>
      <Image
        source={require('@/assets/images/capybara-tile.png')}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel="Posta capybara"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Button — a molded clay pill; subtle scale-down on press for instant
// tactile feedback. Primary is rosa with the pressed-clay shading.
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'right' | 'wrong' | 'check';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  small,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
}) {
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string; clay?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary, clay: clay.button },
    secondary: { bg: colors.card, fg: colors.ink, clay: clay.surface },
    ghost: { bg: 'transparent', fg: colors.muted, border: colors.border },
    danger: { bg: colors.dangerSoft, fg: colors.dangerInk },
    // The answer sheet's button wears the verdict's colour.
    right: { bg: colors.success, fg: colors.onPrimary, clay: clay.verdictButton },
    wrong: { bg: colors.dangerSolid, fg: colors.onPrimary, clay: clay.verdictButton },
    // An exercise's Check: the primary once there is an answer to check.
    check: { bg: colors.check, fg: colors.onPrimary, clay: clay.button },
  };
  // Check waits in flat grey instead of a faded primary, so "not yet" never
  // reads as a washed-out version of "go".
  const grey = variant === 'check' && disabled;
  const p = grey ? { bg: path.lockedFace, fg: path.lockedGlyph } : palette[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        {
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? 1.5 : 0,
          boxShadow: disabled ? undefined : p.clay,
          opacity: disabled && !grey ? 0.45 : 1,
          transform: [{ scale: pressed ? press.scale : 1 }],
        },
        webTransition('transform', press.duration),
      ]}>
      {variant === 'primary' && !disabled && (
        <LinearGradient
          colors={gradients.deep}
          style={[StyleSheet.absoluteFill, { borderRadius: small ? radius.sm + 6 : BUTTON_RADIUS }]}
          pointerEvents="none"
        />
      )}
      {/* An inset shadow paints under children, so the gradient would hide the
          clay's lit top edge; redraw it over the gradient. */}
      {variant === 'primary' && !disabled && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: small ? radius.sm + 6 : BUTTON_RADIUS, boxShadow: CLAY_BUTTON_INSET },
          ]}
          pointerEvents="none"
        />
      )}
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <Text style={[styles.buttonText, small && styles.buttonTextSmall, { color: p.fg }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

/** Full-size buttons are rounded squares, not pills — they read as a key to press. */
const BUTTON_RADIUS = 18;

const CLAY_BUTTON_INSET = 'none';

// ---------------------------------------------------------------------------
// Card container
// ---------------------------------------------------------------------------
export function Panel({ style, ...props }: ViewProps) {
  return <View style={[styles.panel, style]} {...props} />;
}

// ---------------------------------------------------------------------------
// Badge — small status pill.
// ---------------------------------------------------------------------------
export function Badge({
  children,
  tone = 'primary',
}: {
  children: React.ReactNode;
  tone?: 'primary' | 'success' | 'accent' | 'danger';
}) {
  const tones = {
    primary: { bg: colors.primarySoft, fg: colors.primaryDark },
    success: { bg: colors.successSoft, fg: colors.success },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    danger: { bg: colors.dangerSoft, fg: colors.dangerInk },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: tones.bg }]}>
      <Text style={[styles.badgeText, { color: tones.fg }]}>{children}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Labeled text field — the border picks up rosa on focus so the
// caret is never the only thing telling you where you are.
// ---------------------------------------------------------------------------
export const Field = forwardRef<TextInput, TextInputProps & { label: string; hint?: string }>(
  function Field({ label, hint, style, onFocus, onBlur, ...props }, ref) {
    const [focused, setFocused] = useState(false);
    return (
      <View style={{ gap: 6 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.faint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            focused && { borderColor: colors.primary, backgroundColor: colors.card },
            webTransition('border-color', 150),
            style,
          ]}
          {...props}
        />
        {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      </View>
    );
  },
);

export function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.screenTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  face: { overflow: 'hidden', boxShadow: clay.float },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: BUTTON_RADIUS,
    minHeight: 54,
  },
  buttonSmall: { paddingVertical: 9, paddingHorizontal: 16, minHeight: 40, borderRadius: radius.sm + 6 },
  buttonText: { ...font.body[800], fontSize: 17, letterSpacing: 0.1 },
  buttonTextSmall: { fontSize: 14 },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    boxShadow: clay.surface,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: { ...font.body[800], fontSize: 13 },
  fieldLabel: { ...type.label, color: colors.muted },
  fieldHint: { ...type.caption, color: colors.faint },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...font.body[600],
    fontSize: 17,
    color: colors.ink,
  },
  screenTitle: { ...type.display, color: colors.ink },
});

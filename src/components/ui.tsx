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

import { colors, gradients, press, radius, shadow, type } from '@/lib/theme';

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
// ScreenBackground — the icon's wash, pooled at the bottom of the page.
// Drop it as the first child of a screen's root view.
//
// The fade is deliberately upside-down: pale at the top, lilac and blush
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
      // Mirror of the old top-heavy fade: the page stays `bg` down to a third
      // from the bottom, then blush bleeds into lavender at the bottom edge.
      colors={[colors.bg, gradients.wash[0], colors.blush, colors.lilac]}
      locations={[0.34, 0.66, 0.89, 1]}
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
        accessibilityLabel="Che capybara"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Button — subtle scale-down on press for instant tactile feedback.
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

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
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    secondary: { bg: colors.primarySoft, fg: colors.primaryDark },
    ghost: { bg: 'transparent', fg: colors.muted, border: colors.border },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  };
  const p = palette[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        variant === 'primary' && shadow.card,
        {
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? 1 : 0,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? press.scale : 1 }],
        },
        webTransition('transform', press.duration),
      ]}>
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
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: tones.bg }]}>
      <Text style={[styles.badgeText, { color: tones.fg }]}>{children}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Labeled text field — the border picks up the kippah navy on focus so the
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
  face: { overflow: 'hidden', ...shadow.raised },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    minHeight: 52,
  },
  buttonSmall: { paddingVertical: 9, paddingHorizontal: 14, minHeight: 38, borderRadius: radius.sm },
  buttonText: { fontSize: 17, fontWeight: '600', letterSpacing: 0.1 },
  buttonTextSmall: { fontSize: 14 },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  fieldLabel: { ...type.label, color: colors.muted },
  fieldHint: { ...type.caption, color: colors.faint },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 17,
    color: colors.ink,
  },
  screenTitle: { ...type.display, color: colors.ink },
});

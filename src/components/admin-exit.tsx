import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { endAdminPreview, useAdminPreview } from '@/lib/admin-preview';
import { resetTo } from '@/lib/nav';
import { clay, colors, press } from '@/lib/theme';

/**
 * The admin's way out of a preview (lib/admin-preview.ts): an X in the top
 * right corner, over the screen, back to the dashboard. Top right because
 * the learner's own controls are on the left there (the paywall's close,
 * onboarding's back) and onboarding keeps that corner empty.
 */
export function AdminExit() {
  const on = useAdminPreview();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  if (!on || path.startsWith('/admin')) return null;
  return (
    <Pressable
      onPress={() => {
        endAdminPreview();
        resetTo('/admin');
      }}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Back to the admin dashboard"
      style={({ pressed }) => [styles.button, { top: insets.top + 6, transform: [{ scale: pressed ? press.scale : 1 }] }]}>
      <Ionicons name="close" size={20} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Ink, not the app's cream: it's the admin's button, not part of the screen.
  button: {
    position: 'absolute',
    right: 14,
    zIndex: 999,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    boxShadow: clay.chip,
  },
});

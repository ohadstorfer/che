import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, press, radius } from '@/lib/theme';
import type { ContentStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// The admin dashboard's building blocks. Dense and desktop-first — this is a
// reviewer's work surface, not the learner's app — but in the app's own paper
// and greens, so the two never feel like different products.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, background-color',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

const NAV = [
  { href: '/admin', label: 'Units', icon: 'layers-outline' },
  { href: '/admin/reports', label: 'Reports', icon: 'flag-outline' },
  { href: '/admin/words', label: 'Words', icon: 'book-outline' },
  { href: '/admin/answers', label: 'Answers', icon: 'checkmark-done-outline' },
  { href: '/admin/engine', label: 'Engine', icon: 'pulse-outline' },
] as const;

export function AdminScreen({
  title,
  subtitle,
  back,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Where the back arrow goes; none on the top-level pages. */
  back?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const path = usePathname();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.replace('/home')} hitSlop={8} accessibilityLabel="Back to the app">
          <Text style={styles.brand}>che · admin</Text>
        </Pressable>
        <View style={styles.nav}>
          {NAV.map((n) => {
            const active = n.href === '/admin' ? path === '/admin' || path.startsWith('/admin/units') || path.startsWith('/admin/sentences') || path.startsWith('/admin/lessons') : path.startsWith(n.href);
            return (
              <Pressable
                key={n.href}
                onPress={() => router.push(n.href)}
                style={({ pressed }) => [styles.navItem, active && styles.navItemActive, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
                <Ionicons name={n.icon} size={16} color={active ? colors.onPrimary : colors.muted} />
                <Text style={[styles.navText, active && styles.navTextActive]}>{n.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          {back ? (
            <Pressable onPress={() => router.push(back as never)} hitSlop={8} style={styles.back} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={20} color={colors.muted} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Section({ title, right, children, style }: { title: string; right?: React.ReactNode; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const STATUS_TONE: Record<ContentStatus, { bg: string; fg: string }> = {
  draft: { bg: 'rgba(31, 37, 33, 0.06)', fg: colors.muted },
  linted: { bg: 'rgba(94, 158, 201, 0.14)', fg: '#3E7196' },
  ai_reviewed: { bg: 'rgba(184, 140, 58, 0.16)', fg: '#8A6420' },
  approved: { bg: colors.primarySoft, fg: colors.primaryDark },
  published: { bg: colors.primary, fg: colors.onPrimary },
  retired: { bg: 'rgba(31, 37, 33, 0.04)', fg: colors.faint },
};

export function StatusPill({ status, count }: { status: ContentStatus; count?: number }) {
  const tone = STATUS_TONE[status];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.pillText, { color: tone.fg }]}>
        {status.replace('_', ' ')}
        {count != null ? ` ${count}` : ''}
      </Text>
    </View>
  );
}

/** A table row that navigates. */
export function RowLink({ onPress, children, style }: { onPress?: () => void; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.row,
        hovered && onPress ? styles.rowHover : null,
        { transform: [{ scale: pressed && onPress ? 0.995 : 1 }] },
        webPress,
        style,
      ]}>
      {children}
    </Pressable>
  );
}

export function SmallButton({
  label,
  icon,
  onPress,
  tone = 'default',
  disabled,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  tone?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const fg = tone === 'primary' ? colors.onPrimary : tone === 'danger' ? colors.dangerInk : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.small,
        tone === 'primary' && styles.smallPrimary,
        tone === 'danger' && styles.smallDanger,
        disabled && { opacity: 0.45 },
        { transform: [{ scale: pressed && !disabled ? press.scale : 1 }] },
        webPress,
      ]}>
      {icon ? <Ionicons name={icon} size={15} color={fg} /> : null}
      <Text style={[styles.smallText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Code({ children }: { children: string }) {
  return (
    <View style={styles.code}>
      <Text selectable style={styles.codeText}>
        {children}
      </Text>
    </View>
  );
}

export const adminStyles = StyleSheet.create({
  cellGrow: { flex: 1, minWidth: 0 },
  cellEs: { fontSize: 15, fontWeight: '700', color: colors.ink },
  cellEn: { fontSize: 14, color: colors.muted },
  num: { fontSize: 14, fontVariant: ['tabular-nums'], color: colors.ink, minWidth: 48, textAlign: 'right' },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, color: colors.muted, textTransform: 'uppercase' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexWrap: 'wrap',
  },
  brand: { fontSize: 15, fontWeight: '800', color: colors.primaryDark, letterSpacing: 0.2 },
  nav: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  navItemActive: { backgroundColor: colors.primary },
  navText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  navTextActive: { color: colors.onPrimary },
  page: { padding: 24, gap: 20, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  back: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: colors.muted },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  section: { gap: 8 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, color: colors.muted, textTransform: 'uppercase' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexWrap: 'wrap',
  },
  rowHover: { borderColor: colors.primary },
  small: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  smallPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  smallDanger: { backgroundColor: colors.dangerSoft, borderColor: 'transparent' },
  smallText: { fontSize: 14, fontWeight: '600' },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  code: { backgroundColor: 'rgba(31, 37, 33, 0.05)', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  codeText: { fontFamily: Platform.select({ web: 'ui-monospace, Menlo, monospace', default: 'Courier' }), fontSize: 13, color: colors.ink },
});

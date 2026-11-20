import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { playAudio } from '@/lib/audio';
import { resetTo } from '@/lib/nav';
import { clay, colors, font, press, radius, type } from '@/lib/theme';
import type { ContentStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// The admin dashboard's building blocks, in the app's own sticker look: oat
// page, ink-outlined surfaces with a hard shadow, pastel icon dots — so the
// admin feels like part of Posta, not a separate tool.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, background-color',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

// Only what the owner uses. The course tools (units, reports, words, answers,
// engine) still live at /admin/units, /admin/reports, … — just not in the nav.
const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'grid-outline' },
  { href: '/admin/revenue', label: 'Revenue', icon: 'cash-outline' },
  { href: '/admin/feedback', label: 'Feedback', icon: 'chatbubbles-outline' },
] as const;

export function AdminScreen({
  title,
  subtitle,
  back,
  actions,
  detail,
  fill,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Where the back arrow goes when there is nothing to pop back to; none on the top-level pages. */
  back?: string;
  actions?: React.ReactNode;
  /** A page about one thing (a tester's thread): the top bar is just back, its name and actions, no nav. */
  detail?: boolean;
  /** The page brings its own scrolling (a chat thread): children fill the space under the bar. */
  fill?: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace((back ?? '/admin') as never));
  if (detail) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.bar, styles.detailBar]}>
          <Pressable onPress={goBack} hitSlop={8} style={({ pressed }) => [styles.back, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={20} color={colors.ink} />
          </Pressable>
          <View style={{ flex: 1, flexShrink: 1, minWidth: 0 }}>
            <Text style={styles.detailTitle} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.detailSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
        {fill ? (
          <View style={{ flex: 1 }}>{children}</View>
        ) : (
          <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.bar}>
        <Pressable onPress={() => resetTo('/home')} hitSlop={8} accessibilityLabel="Back to the app">
          <Text style={styles.brand}>Admin dashboard</Text>
        </Pressable>
        <View style={styles.nav}>
          {NAV.map((n) => {
            const active = n.href === '/admin' ? path === '/admin' || path.startsWith('/admin/units') || path.startsWith('/admin/sentences') || path.startsWith('/admin/lessons') : path.startsWith(n.href);
            return (
              <Pressable
                key={n.href}
                onPress={() => router.push(n.href)}
                style={({ pressed }) => [styles.navItem, active && styles.navItemActive, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
                <Ionicons name={n.icon} size={14} color={active ? colors.onPrimary : colors.ink} />
                <Text style={[styles.navText, active && styles.navTextActive]}>{n.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => resetTo('/home')}
          hitSlop={8}
          style={({ pressed }) => [styles.back, styles.close, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}
          accessibilityLabel="Close admin">
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          {back ? (
            <Pressable onPress={goBack} hitSlop={8} style={styles.back} accessibilityLabel="Back">
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
  draft: { bg: 'rgba(58, 42, 32, 0.06)', fg: colors.muted },
  linted: { bg: 'rgba(94, 158, 201, 0.14)', fg: '#3E7196' },
  ai_reviewed: { bg: 'rgba(184, 140, 58, 0.16)', fg: '#8A6420' },
  approved: { bg: colors.primarySoft, fg: colors.primaryDark },
  published: { bg: colors.primary, fg: colors.onPrimary },
  retired: { bg: 'rgba(58, 42, 32, 0.04)', fg: colors.faint },
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
        pressed && onPress ? styles.rowPressed : null,
        { transform: [{ scale: pressed && onPress ? press.scale : 1 }] },
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
      disabled={!!disabled}
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

/**
 * Hear a clip, and see who said it.
 *
 * Deliberately not the exercise `PlayButton`: that one plays itself the moment
 * it appears, which is right in a lesson and wrong here — opening a word would
 * make noise before the reviewer asked for any. This one only ever plays on a
 * press.
 *
 * The voice is shown by its id rather than a prettied-up name. A reviewer
 * comparing two clips needs the value that is actually in the row.
 */
export function Listen({ path, voice }: { path: string | null; voice?: string | null }) {
  if (!path) return <Muted>no audio</Muted>;
  return (
    <SmallButton
      label={voice ? `Listen · ${voice}` : 'Listen'}
      icon="volume-high-outline"
      onPress={() => playAudio(path)}
    />
  );
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
  cellEs: { fontSize: 15, ...font.body[700], color: colors.ink },
  cellEn: { fontSize: 14, color: colors.muted },
  num: { fontSize: 14, fontVariant: ['tabular-nums'], color: colors.ink, minWidth: 48, textAlign: 'right' },
  label: { fontSize: 12, ...font.body[700], letterSpacing: 0.4, color: colors.muted, textTransform: 'uppercase' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingRight: 68,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.bg,
    flexWrap: 'wrap',
  },
  // Pinned to the top-right corner so it stays put however the nav wraps.
  close: { position: 'absolute', top: 8, right: 18, backgroundColor: colors.card, boxShadow: clay.chip },
  detailBar: { gap: 12, paddingHorizontal: 16, paddingRight: 16, flexWrap: 'nowrap' },
  detailTitle: { ...type.section, color: colors.ink },
  detailSubtitle: { fontSize: 13, color: colors.muted },
  brand: { ...type.section, fontSize: 22, color: colors.ink, width: '100%' },
  nav: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.chip,
  },
  navItemActive: { backgroundColor: colors.primary },
  navText: { ...type.label, fontSize: 13, color: colors.ink },
  navTextActive: { color: colors.onPrimary },
  page: { padding: 20, paddingBottom: 48, gap: 24, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  back: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, boxShadow: clay.chip },
  title: { ...type.title, color: colors.ink },
  subtitle: { ...type.body, color: colors.muted },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { ...type.label, letterSpacing: 0.6, color: colors.muted, textTransform: 'uppercase' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, ...font.body[700] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    boxShadow: clay.surface,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  rowHover: { backgroundColor: colors.stone },
  rowPressed: { backgroundColor: colors.stone },
  small: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.chip,
  },
  smallPrimary: { backgroundColor: colors.primary },
  smallDanger: { backgroundColor: colors.dangerSoft },
  smallText: { ...type.label, fontSize: 14 },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  code: { backgroundColor: 'rgba(58, 42, 32, 0.05)', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  codeText: { fontFamily: Platform.select({ web: 'ui-monospace, Menlo, monospace', default: 'Courier' }), fontSize: 13, color: colors.ink },
});

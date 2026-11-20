import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminScreen } from '@/components/admin';
import { startAdminPreview } from '@/lib/admin-preview';
import { resetWinbackShown } from '@/lib/onboarding';
import { type PastelName, clay, colors, pastel, radius, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The admin dashboard's home: the testing tools the owner uses, as one card
// of rows like Account's. Revenue and Feedback are in the top nav. The course
// tools (units, reports, words, answers, engine) are hidden from here but
// still open at their own paths — /admin/units/…, /admin/reports, …
// ---------------------------------------------------------------------------

// `preview`: a learner's screen with no way back here of its own, so it gets
// the admin's X (components/admin-exit.tsx).
const TOOLS: { icon: keyof typeof Ionicons.glyphMap; tone: PastelName; label: string; detail: string; href: string; preview?: boolean }[] = [
  {
    icon: 'refresh-outline',
    tone: 'peach',
    label: 'Replay onboarding',
    detail: 'Questions, plan and paywall, as a new learner sees them. Your account is not changed.',
    href: '/welcome?replay=1',
    preview: true,
  },
  {
    icon: 'card-outline',
    tone: 'sage',
    label: 'View paywall',
    detail: 'The paywall at the end of onboarding, with its 40% offer when you close it. Nothing is bought unless you buy.',
    href: '/paywall?from=onboarding',
    preview: true,
  },
  {
    icon: 'cafe-outline',
    tone: 'butter',
    label: 'First class prototype',
    detail: '“At the café”, local or from the database, per level. Nothing is saved.',
    href: '/admin/first-class',
  },
  {
    icon: 'albums-outline',
    tone: 'lav',
    label: 'Onboarding screens',
    detail: 'Custom screens from the database, drafts included.',
    href: '/admin/screens',
  },
  {
    icon: 'map-outline',
    tone: 'sky',
    label: 'Replay welcome tour',
    detail: 'The four-tab tour shown once after the first purchase.',
    href: '/admin/welcome-tour',
  },
];

export default function AdminHome() {
  return (
    <AdminScreen title="Testing">
      <View style={styles.card}>
          {TOOLS.map((t, i) => (
            <Fragment key={t.href}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                onPress={async () => {
                  if (t.preview) {
                    startAdminPreview();
                    // So the one-time offer shows again, as for a new learner.
                    await resetWinbackShown();
                  }
                  router.push(t.href as never);
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                <View style={[styles.icon, { backgroundColor: pastel[t.tone] }]}>
                  <Ionicons name={t.icon} size={18} color={colors.onPastel} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.label}>{t.label}</Text>
                  <Text style={styles.detail}>{t.detail}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.faint} />
              </Pressable>
            </Fragment>
          ))}
      </View>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 6, boxShadow: clay.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 12, minHeight: 60 },
  rowPressed: { backgroundColor: colors.stone },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', boxShadow: clay.surface },
  label: { ...type.body, ...type.label, fontSize: 15, color: colors.ink },
  detail: { fontSize: 13, lineHeight: 18, color: colors.muted },
  divider: { height: 1.5, backgroundColor: colors.border, marginLeft: 64 },
});

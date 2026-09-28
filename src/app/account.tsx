import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton, rise } from '@/components/onboarding-ui';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import { goBack, resetTo } from '@/lib/nav';
import { usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { clay, colors, pastel, pastelGrad, type PastelName, press, radius, type } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// Account — who she is signed in as, her plan, the legal links, and the two
// ways out: signing out, and deleting the account for good. The stores require
// the delete to live inside the app (App Store 5.1.1(v), Google Play's
// account-deletion policy). It asks once, in place, saying exactly what goes
// and that a store subscription has to be cancelled in the store.
// ---------------------------------------------------------------------------

const MANAGE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as unknown as ViewStyle)
    : undefined;

export default function AccountScreen() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const { session, profile } = useAuth();
  const { status, staff, paywall } = usePremium();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    resetTo('/welcome');
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setError(null);
    const { error: err } = await supabase.functions.invoke('delete-account', { body: {} });
    if (err) {
      setDeleting(false);
      setError("Couldn't delete your account. Check your connection and try again.");
      return;
    }
    // The user is gone on the server; this just clears the phone's session.
    await supabase.auth.signOut().catch(() => {});
    resetTo('/welcome');
  };

  const premium = status === 'premium';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <IconButton icon="chevron-back" label="Back" onPress={() => goBack('/home')} />
        <Text style={styles.topTitle} accessibilityRole="header">
          Account
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise(0, reduced)} style={styles.heroWrap}>
          <LinearGradient colors={pastelGrad.sage} style={styles.hero}>
            <FitText style={styles.name} lines={1}>
              {profile?.display_name || 'You'}
            </FitText>
            <FitText style={styles.email} lines={1}>
              {session?.user.email ?? ''}
            </FitText>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={rise(1, reduced)} style={styles.card}>
          <Row
            icon="star-outline"
            label={premium ? 'Posta Premium' : staff ? 'Staff access' : 'Free plan'}
            detail={premium ? 'Manage' : staff ? undefined : 'Upgrade'}
            onPress={
              premium && Platform.OS !== 'web'
                ? () => void Linking.openURL(MANAGE_URL)
                : !premium && !staff
                  ? () => paywall('settings')
                  : undefined
            }
          />
          <View style={styles.divider} />
          <Row icon="shield-checkmark-outline" tone="sage" label="Privacy policy" onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)} />
          <View style={styles.divider} />
          <Row icon="document-text-outline" tone="sky" label="Terms of use" onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)} />
          {staff ? (
            <>
              <View style={styles.divider} />
              <Row icon="construct-outline" tone="peach" label="Course dashboard" onPress={() => router.push('/admin')} />
            </>
          ) : null}
        </Animated.View>

        <Animated.View entering={rise(2, reduced)} style={styles.actions}>
          <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
        </Animated.View>

        {staff ? null : !confirming ? (
          <Animated.View entering={rise(3, reduced)}>
            <Pressable
              onPress={() => setConfirming(true)}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.deleteLink, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
              <Text style={styles.deleteLinkText}>Delete account</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={rise(0, reduced)} style={[styles.card, styles.confirm]}>
            <Text style={styles.confirmTitle}>Delete your account?</Text>
            <Text style={styles.confirmBody}>
              This deletes your progress, streak, saved words, Hablar chats and recordings for good. It can't be undone.
            </Text>
            {premium ? (
              <Text style={styles.confirmBody}>
                Your subscription is billed by the {Platform.OS === 'android' ? 'Play Store' : 'App Store'}, so deleting
                your account doesn't cancel it. Cancel it there first.
              </Text>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.confirmButtons}>
              <Button title="Delete forever" variant="danger" loading={deleting} onPress={() => void deleteAccount()} />
              <Button title="Keep my account" variant="ghost" disabled={deleting} onPress={() => setConfirming(false)} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  tone = 'butter',
  label,
  detail,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone?: PastelName;
  label: string;
  detail?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={[styles.rowIcon, { backgroundColor: pastel[tone] }]}>
        <Ionicons name={icon} size={18} color={colors.onPastel} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.faint} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topTitle: { ...type.section, fontSize: 22, color: colors.ink },
  spacer: { width: 44 },
  body: { padding: 20, gap: 16, paddingBottom: 48 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 6,
    boxShadow: clay.surface,
  },
  heroWrap: { borderRadius: radius.xl, boxShadow: clay.surface },
  hero: { borderRadius: radius.xl, paddingHorizontal: 22, paddingVertical: 22 },
  name: { ...type.title, fontSize: 28, letterSpacing: -0.5, color: colors.onPastel },
  email: { ...type.body, color: colors.onPastel, opacity: 0.8, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 18,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', boxShadow: clay.surface },
  rowPressed: { backgroundColor: colors.trough },
  rowLabel: { ...type.body, color: colors.ink, flex: 1 },
  rowDetail: { ...type.label, color: colors.primary },
  divider: { height: 1, backgroundColor: colors.trough, marginLeft: 64 },
  actions: { marginTop: 8 },
  deleteLink: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  deleteLinkText: { ...type.label, color: colors.dangerInk },
  confirm: { padding: 18, gap: 10 },
  confirmTitle: { ...type.section, color: colors.ink },
  confirmBody: { ...type.body, color: colors.muted },
  error: { ...type.body, color: colors.dangerInk },
  confirmButtons: { gap: 10, marginTop: 6 },
});

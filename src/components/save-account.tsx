import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Provider, SocialButtons } from '@/components/social-buttons';
import { success, tap } from '@/lib/haptics';
import type { Answers } from '@/lib/onboarding';
import { type SaveResult, saveWithApple, saveWithGoogle } from '@/lib/social-auth';
import { supabase } from '@/lib/supabase';
import { colors, font } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The ways a guest saves her account (lib/guest.ts): Apple, Google, or email
// on its own screen (app/save-account.tsx). Each adds a sign-in to the
// account she already has, so her plan and anything she bought stay where
// they are. Used by Ready, after the paywall, and by the save-account screen.
// ---------------------------------------------------------------------------

/** Supabase's messages are English and technical; these are the ones people hit. */
export function explainSave(message: string): string {
  if (/already registered|already been registered|email_exists|already exists/i.test(message)) return 'That email already has an account. Sign in instead.';
  if (/password should be at least/i.test(message)) return 'The password needs at least 6 characters.';
  if (/provider is not enabled|unsupported provider/i.test(message)) return 'That sign-in option isn’t switched on yet. Use email for now.';
  if (/network|fetch/i.test(message)) return 'No connection. Try again.';
  return message;
}

/** Her onboarding answers onto the account, as a sign-up from onboarding has
 *  always carried them — unless it is an older account of hers with its own. */
export async function keepAnswers(result: SaveResult, answers: Answers | null) {
  if (!answers || (result.status === 'switched' && result.returning)) return;
  await supabase.auth.updateUser({ data: { onboarding: answers } }).catch(() => {});
}

export function SaveButtons({
  answers,
  onEmail,
  onLater,
  onDone,
}: {
  answers: Answers | null;
  onEmail: () => void;
  /** Shown as "Not now" when given: she can stay a guest. */
  onLater?: () => void;
  onDone: (result: SaveResult) => void;
}) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (which: Provider) => {
    if (busy) return;
    tap();
    setBusy(which);
    setError(null);
    const res = which === 'apple' ? await saveWithApple() : await saveWithGoogle();
    if (res.status === 'saved' || res.status === 'switched') await keepAnswers(res, answers);
    setBusy(null);
    if (res.status === 'cancel') return;
    if (res.status === 'error') return setError(explainSave(res.message));
    success();
    onDone(res);
  };

  return (
    <View style={styles.stack}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SocialButtons busy={busy} onPress={(which) => void save(which)} />
      <Pressable onPress={onEmail} disabled={!!busy} hitSlop={8} style={styles.link} accessibilityRole="button">
        <Text style={styles.linkText}>Use email instead</Text>
      </Pressable>
      {onLater ? (
        <Pressable onPress={onLater} disabled={!!busy} hitSlop={8} style={styles.later} accessibilityRole="button">
          <Text style={styles.laterText}>Not now</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  error: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.dangerInk, textAlign: 'center' },
  link: { alignSelf: 'center', minHeight: 36, justifyContent: 'center', paddingHorizontal: 16 },
  linkText: { ...font.body[800], fontSize: 15, color: colors.primary },
  later: { alignSelf: 'center', minHeight: 36, justifyContent: 'center', paddingHorizontal: 16, marginTop: -8 },
  laterText: { ...font.body[800], fontSize: 15, color: colors.muted },
});

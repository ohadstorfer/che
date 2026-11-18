import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { loadResume } from '@/lib/onboarding';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors } from '@/lib/theme';

export default function Index() {
  const { session, loading } = useAuth();
  // This is the first thing the app shows on a cold start, and in a standalone
  // PWA the value live at page load is the one iOS is most reliable about
  // picking up — a later claim from the screen we redirect to can be missed
  // entirely (it was: Home's header sat under a mismatched strip). So the
  // screen wears the colour Home wants, and the strip is already right by
  // the time the redirect lands, whether or not iOS re-reads the tag.
  useStatusBarColor(colors.bg);

  // Signed in with onboarding left halfway (the app closed after her guest
  // account was made): back to where she was, not Home (lib/onboarding.ts).
  const userId = session?.user.id;
  const [resume, setResume] = useState<{ userId: string; found: boolean } | null>(null);
  useEffect(() => {
    if (!userId) return;
    let live = true;
    void loadResume(userId).then((r) => live && setResume({ userId, found: !!r }));
    return () => {
      live = false;
    };
  }, [userId]);

  // The launch splash (components/boot-splash.tsx) stands over this until
  // her session is known, so there is nothing to draw here meanwhile.
  if (loading || (userId && resume?.userId !== userId)) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  if (!session) return <Redirect href="/welcome" />;
  return <Redirect href={resume?.found ? '/onboarding?resume=1' : '/home'} />;
}

import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth';
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

  // The launch splash (components/boot-splash.tsx) stands over this until
  // her session is known, so there is nothing to draw here meanwhile.
  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return <Redirect href={session ? '/home' : '/welcome'} />;
}

import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors } from '@/lib/theme';

export default function Index() {
  const { session, loading } = useAuth();
  // This is the first thing the app shows on a cold start, and in a standalone
  // PWA the value live at page load is the one iOS is most reliable about
  // picking up — a later claim from the screen we redirect to can be missed
  // entirely (it was: Inicio's white header sat under a `bg` strip). So the
  // splash wears the colour Inicio wants, and the strip is already right by
  // the time the redirect lands, whether or not iOS re-reads the tag.
  useStatusBarColor(colors.card);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <Redirect href={session ? '/home' : '/login'} />;
}

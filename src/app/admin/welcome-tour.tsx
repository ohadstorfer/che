import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { resetTo } from '@/lib/nav';
import { colors } from '@/lib/theme';
import { startWelcomeTour } from '@/lib/welcome-tour';

// posta://admin/welcome-tour — replays the welcome tour (components/welcome-tour.tsx)
// without buying: back to the tabs with the tour started, seen or not.
export default function ReplayWelcomeTour() {
  useEffect(() => {
    startWelcomeTour();
    resetTo('/home');
  }, []);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

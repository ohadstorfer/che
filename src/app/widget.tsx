import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { WidgetPromo } from '@/components/widget-promo';
import { useAuth } from '@/lib/auth';
import { goBack } from '@/lib/nav';
import { useStreakWeekValue } from '@/lib/streak-week';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors } from '@/lib/theme';

// The widget promo on its own, from Account's "Home screen widget" row
// (posta://widget). The one after the streak cheer is the same screen.
export default function WidgetScreen() {
  useStatusBarColor(colors.bg);
  const { session } = useAuth();
  const week = useStreakWeekValue(session?.user.id);
  return (
    <SafeAreaView style={styles.safe}>
      <WidgetPromo streak={week?.streak?.current_streak ?? 0} source="account" onDone={() => goBack('/account')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
});

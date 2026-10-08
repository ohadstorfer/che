import { StyleSheet, View } from 'react-native';

import { ArgentineHub } from '@/components/argentine-hub';
import { AppHeader, useStreakWeek } from '@/components/app-header';
import { usePackScores } from '@/lib/argentine-scores';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Words — vocabulary apart from the course: themed packs of words Argentines
// actually say (lib/argentine.ts). The words the course itself has taught her
// live on their own screen (my-words.tsx), opened from Course's Review button.
// ---------------------------------------------------------------------------

export default function Words() {
  // The tabs' opaque `sceneStyle` (see (tabs)/_layout) covers the root
  // gradient, so this screen's actual background is flat `colors.bg`.
  useStatusBarColor(colors.bg);
  const { status: streak, weekDone } = useStreakWeek();
  const scores = usePackScores();

  return (
    <View style={styles.safe}>
      <AppHeader title="Words" status={streak} weekDone={weekDone} />
      <View style={styles.container}>
        <ArgentineHub scores={scores} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
});

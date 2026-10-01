import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonComplete } from '@/components/lesson-complete';
import { StreakCelebration } from '@/components/streak-celebration';
import { backToCourse } from '@/lib/nav';
import type { FinishResult } from '@/lib/round';

/**
 * The end of a lesson on the road that isn't a round of exercises — a unit's
 * slang or culture class: the same beat a lesson or story ends on, then the
 * streak celebration when the day's first lesson moved it, then back to the
 * path, where the next step lights up.
 */
export function PathLessonDone({ result }: { result: FinishResult | null }) {
  const [celebrating, setCelebrating] = useState(false);
  const streak = result?.current_streak ?? 0;
  const celebrate = !!result && streak > 0 && streak !== result.previous_streak;

  if (celebrating && result) {
    return (
      <SafeAreaView style={styles.safe}>
        <StreakCelebration previous={result.previous_streak} streak={streak} onDone={backToCourse} />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <LessonComplete
        streak={celebrate || streak <= 0 ? null : streak}
        onNext={() => (celebrate ? setCelebrating(true) : backToCourse())}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});

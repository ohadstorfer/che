import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WordIntro } from '@/components/word-intro';
import { arPacks } from '@/lib/argentine';
import { useAuth } from '@/lib/auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, font } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Where the home screen widget's word of the day lands (posta://word-of-day?id=…):
// the word's own card, the one an Argentine pack teaches it with, and one
// button on to today's practice. The widget picks the word (targets/widget),
// so this only looks it up.
// ---------------------------------------------------------------------------

export default function WordOfDay() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session, loading } = useAuth();
  useStatusBarColor(colors.bg);

  const word = useMemo(() => {
    for (const pack of arPacks) {
      const found = pack.words.find((w) => w.id === id);
      if (found) return found;
    }
    return null;
  }, [id]);

  if (loading) return <View style={styles.safe} />;
  if (!session) return <Redirect href="/welcome" />;
  // A word a newer widget knows and this build doesn't: the road is still the right place.
  if (!word) return <Redirect href="/home" />;

  const toHome = () => router.replace('/home');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={toHome} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
        <Text style={styles.label}>WORD OF THE DAY</Text>
      </View>
      <WordIntro word={word} onDone={toHome} doneLabel="Practice now" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  label: { ...font.body[800], fontSize: 13, letterSpacing: 1.2, color: colors.muted },
});

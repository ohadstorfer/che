import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StreakCelebration } from '@/components/streak-celebration';
import { MILESTONE_DAYS, milestoneFor, STREAK_DECK, type StreakDesign } from '@/lib/streak-deck';
import { colors, font, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Every streak screen — the thirty ordinary days and the milestones — to look
// over without keeping a streak for a year. posta://admin/streaks
// ---------------------------------------------------------------------------

type Play = { design: StreakDesign; n: number; key: number };

export default function StreakGallery() {
  const [play, setPlay] = useState<Play | null>(null);

  if (play) {
    return (
      <SafeAreaView style={styles.safe}>
        <StreakCelebration key={play.key} streak={play.n} design={play.design} onDone={() => setPlay(null)} />
      </SafeAreaView>
    );
  }

  const show = (design: StreakDesign, n: number) => setPlay({ design, n, key: Date.now() });
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>Streak screens</Text>
        <Text style={styles.meta}>Milestones</Text>
        <View style={styles.grid}>
          {MILESTONE_DAYS.map((n) => (
            <Pressable key={n} style={[styles.step, styles.ms]} onPress={() => show(milestoneFor(n)!, n)}>
              <Text style={styles.stepText}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.meta}>The deck (shown as day 12)</Text>
        <View style={styles.grid}>
          {STREAK_DECK.map((d, i) => (
            <Pressable key={d.id} style={styles.step} onPress={() => show(d, 12)}>
              <Text style={styles.stepText}>{i + 1}</Text>
              <Text style={styles.small}>{d.layout}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: 24, gap: 12 },
  title: { ...font.display[900], fontSize: 28, color: colors.ink },
  meta: { ...font.body[800], fontSize: 14, color: colors.muted, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  step: { width: 64, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', borderWidth: 2, borderColor: colors.ink },
  ms: { backgroundColor: pastel.butter },
  stepText: { ...font.body[800], fontSize: 16, color: colors.ink },
  small: { ...font.body[600], fontSize: 10, color: colors.muted },
});

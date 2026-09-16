import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { AdminScreen, Code, Muted, RowLink, Section, adminStyles } from '@/components/admin';
import { type EngineStats, loadEngineStats } from '@/lib/admin';

// ---------------------------------------------------------------------------
// How rounds land (learning-engine-spec §2): first-try accuracy against the
// 85–92% band, per week and kind, and per exercise type. The tuning table in
// §2.3 says which constant to move when a number stays out of band.
// ---------------------------------------------------------------------------
const pct = (n: number | null | undefined) => (n == null ? '–' : `${Math.round(Number(n) * 100)}%`);

export default function AdminEngine() {
  const [stats, setStats] = useState<EngineStats | null>(null);
  useFocusEffect(
    useCallback(() => {
      loadEngineStats().then(setStats);
    }, []),
  );

  return (
    <AdminScreen title="Engine" subtitle="Last 8 weeks">
      <Section title="Rounds">
        {!stats ? <Muted>Loading…</Muted> : stats.rounds.length === 0 ? <Muted>No rounds recorded yet.</Muted> : null}
        {(stats?.rounds ?? []).map((r) => (
          <RowLink key={`${r.week}-${r.kind}`}>
            <Text style={[adminStyles.cellEn, { minWidth: 96 }]}>{r.week}</Text>
            <Text style={[adminStyles.cellEs, adminStyles.cellGrow]}>{r.kind}</Text>
            <Muted>{r.finished} finished</Muted>
            <Muted>{r.abandoned} abandoned</Muted>
            <Muted>avg {r.avg_score ?? '–'}</Muted>
            <Muted>{r.out_of_band} out of band</Muted>
          </RowLink>
        ))}
      </Section>
      <Section title="Exercises (first tries)">
        {(stats?.modes ?? []).map((m) => (
          <RowLink key={`${m.week}-${m.mode}-${m.promoted}`}>
            <Text style={[adminStyles.cellEn, { minWidth: 96 }]}>{m.week}</Text>
            <Text style={[adminStyles.cellEs, adminStyles.cellGrow]}>
              {m.mode}
              {m.promoted ? ' (promoted)' : ''}
            </Text>
            <Muted>{m.first_tries} tries</Muted>
            <Muted>{pct(m.fail_rate)} fail</Muted>
            <Muted>median {m.median_ms ?? '–'} ms</Muted>
          </RowLink>
        ))}
      </Section>
      <Section title="Deeper">
        <View style={{ gap: 6 }}>
          <Code>npm run engine:report   # bands, abandonment by position</Code>
          <Code>npm run engine:eval     # SM-2 vs FSRS on scheduling decisions</Code>
          <Code>npm run engine:elo      # difficulty model vs per-exercise baseline</Code>
        </View>
      </Section>
    </AdminScreen>
  );
}

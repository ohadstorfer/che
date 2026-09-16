import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { AdminScreen, Muted, RowLink, Section, StatusPill, adminStyles } from '@/components/admin';
import { type Attention, STATUSES, type UnitSummary, loadAttention, loadUnits } from '@/lib/admin';
import { colors } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The reviewer's queue: every unit with its sentences counted by status, and
// above it what needs attention — sentences learners keep failing or report,
// words that keep lapsing, units whose check most learners fail first time.
// ---------------------------------------------------------------------------
export default function AdminHome() {
  const [units, setUnits] = useState<UnitSummary[] | null>(null);
  const [attention, setAttention] = useState<Attention | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadUnits().then(setUnits);
      loadAttention().then(setAttention);
    }, []),
  );

  const toReview = units?.reduce((n, u) => n + u.sentences.ai_reviewed + u.sentences.linted, 0) ?? 0;

  return (
    <AdminScreen title="Units" subtitle={units ? `${units.length} units · ${toReview} sentences waiting for review` : 'Loading…'}>
      <Section title="Needs attention">
        {!attention ? (
          <Muted>Loading…</Muted>
        ) : attention.sentences.length + attention.leeches.length + attention.checks.length + attention.openReports === 0 ? (
          <Muted>Nothing flagged. Sentences show up here once 20 learners have tried them and more than a third fail.</Muted>
        ) : (
          <View style={{ gap: 6 }}>
            {attention.openReports > 0 ? (
              <RowLink onPress={() => router.push('/admin/reports')}>
                <Text style={adminStyles.cellEs}>{attention.openReports} open answer reports</Text>
                <Muted>Learners think an answer should have been accepted.</Muted>
              </RowLink>
            ) : null}
            {attention.sentences.map((s) => (
              <RowLink key={s.sentence_id} onPress={() => router.push(`/admin/sentences/${s.sentence_id}`)}>
                <Text style={[adminStyles.cellEs, adminStyles.cellGrow]}>{s.es}</Text>
                <Muted>
                  {Math.round(s.fail_rate * 100)}% fail · {s.tries} tries
                  {s.open_reports ? ` · ${s.open_reports} reports` : ''}
                </Muted>
              </RowLink>
            ))}
            {attention.leeches.map((l) => (
              <RowLink key={l.form_id}>
                <Text style={[adminStyles.cellEs, adminStyles.cellGrow]}>{l.form}</Text>
                <Muted>
                  keeps lapsing for {l.learners} learners (avg {l.avg_lapses} lapses) — rewrite the sentences that teach it
                </Muted>
              </RowLink>
            ))}
            {attention.checks.map((c) => (
              <RowLink key={c.unit_id} onPress={() => router.push(`/admin/units/${c.unit_id}`)}>
                <Text style={[adminStyles.cellEs, adminStyles.cellGrow]}>{c.unit_title}</Text>
                <Muted>
                  unit check passed first time by {Math.round(c.first_attempt_pass * 100)}% of {c.learners}
                </Muted>
              </RowLink>
            ))}
          </View>
        )}
      </Section>

      <Section title="All units">
        {!units ? (
          <Muted>Loading…</Muted>
        ) : (
          <View style={{ gap: 6 }}>
            {units.map((u) => (
              <RowLink key={u.id} onPress={() => router.push(`/admin/units/${u.id}`)}>
                <Text style={[adminStyles.num, { minWidth: 36, textAlign: 'left', color: colors.muted }]}>
                  {u.section?.ordinal ?? '?'}.{u.ordinal}
                </Text>
                <View style={[adminStyles.cellGrow, { gap: 2, minWidth: 220 }]}>
                  <Text style={adminStyles.cellEs}>{u.title_en}</Text>
                  <Text style={adminStyles.cellEn}>
                    {u.summary_en} · {u.forms} words · {u.lessons} lessons · {u.slots} slots
                  </Text>
                </View>
                <StatusPill status={u.status} />
                <View style={adminStyles.wrap}>
                  {STATUSES.filter((s) => s !== 'retired' && u.sentences[s] > 0).map((s) => (
                    <StatusPill key={s} status={s} count={u.sentences[s]} />
                  ))}
                  {STATUSES.every((s) => u.sentences[s] === 0) ? <Muted>no sentences</Muted> : null}
                </View>
              </RowLink>
            ))}
          </View>
        )}
      </Section>
    </AdminScreen>
  );
}

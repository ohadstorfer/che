import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AdminScreen, Muted, RowLink, Section, SmallButton, adminStyles } from '@/components/admin';
import { type ReportGroup, type SentenceRow, acceptReport, loadReportGroups, rejectReport } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import type { Form } from '@/lib/types';

// ---------------------------------------------------------------------------
// "My answer should be accepted" (learning-engine-spec §6.2). Identical reports
// are grouped, most-reported first. Accepting adds the answer to what the
// sentence (or word) accepts and resolves the whole group; the answer can be
// tidied first — capitals and accents as they should be written.
// ---------------------------------------------------------------------------
export default function AdminReports() {
  const [groups, setGroups] = useState<ReportGroup[] | null>(null);
  const [sentences, setSentences] = useState<Map<string, SentenceRow>>(new Map());
  const [forms, setForms] = useState<Map<string, Form>>(new Map());
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    (async () => {
      const list = await loadReportGroups();
      const sIds = [...new Set(list.flatMap((g) => (g.sentence_id ? [g.sentence_id] : [])))];
      const fIds = [...new Set(list.flatMap((g) => (g.form_id ? [g.form_id] : [])))];
      const [{ data: s }, { data: f }] = await Promise.all([
        sIds.length ? supabase.from('sentences').select('*').in('id', sIds) : Promise.resolve({ data: [] }),
        fIds.length ? supabase.from('form_entries').select('*').in('id', fIds) : Promise.resolve({ data: [] }),
      ]);
      setSentences(new Map(((s ?? []) as SentenceRow[]).map((x) => [x.id, x])));
      setForms(new Map(((f ?? []) as Form[]).map((x) => [x.id, x])));
      setGroups(list);
    })();
  }, []);
  useFocusEffect(load);

  const key = (g: ReportGroup) => `${g.sentence_id ?? ''}|${g.form_id ?? ''}|${g.answer_key}`;
  const act = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That failed.');
    }
  };

  return (
    <AdminScreen title="Answer reports" subtitle={groups ? `${groups.length} open groups` : 'Loading…'}>
      {error ? <Text style={{ color: colors.dangerInk }}>{error}</Text> : null}
      <Section title="Open">
        {groups?.length === 0 ? <Muted>No open reports.</Muted> : null}
        {(groups ?? []).map((g) => {
          const s = g.sentence_id ? sentences.get(g.sentence_id) : undefined;
          const f = g.form_id ? forms.get(g.form_id) : undefined;
          const value = edits[key(g)] ?? g.answer;
          return (
            <RowLink key={key(g)}>
              <View style={[adminStyles.cellGrow, { gap: 4, minWidth: 280 }]}>
                <Text style={adminStyles.cellEn}>
                  {s ? `${s.en}  →  ${s.es}` : f ? `${f.gloss_en}  →  ${f.form}` : 'content not found'}
                </Text>
                {s?.es_alt?.length ? <Muted>also accepted: {s.es_alt.join(' · ')}</Muted> : null}
                <TextInput
                  value={value}
                  onChangeText={(v) => setEdits({ ...edits, [key(g)]: v })}
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, fontSize: 16, fontWeight: '700', color: colors.ink }}
                />
              </View>
              <Text style={adminStyles.num}>{g.reports}×</Text>
              {s ? <SmallButton label="Open" onPress={() => router.push(`/admin/sentences/${s.id}`)} /> : null}
              <SmallButton label="Accept" icon="checkmark" tone="primary" onPress={() => act(() => acceptReport(g, value))} />
              <SmallButton label="Reject" tone="danger" onPress={() => act(() => rejectReport(g))} />
            </RowLink>
          );
        })}
      </Section>
    </AdminScreen>
  );
}

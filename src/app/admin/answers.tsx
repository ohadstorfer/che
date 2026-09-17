import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AdminScreen, Muted, RowLink, Section, SmallButton, adminStyles } from '@/components/admin';
import { staffUpdate } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Other answers accepted when a word is typed on its own (`form_answers`,
// drafted by `course:answers`). Everything here is live: the app accepts it the
// next time her data loads. Retiring one is how a reviewer takes it back.
// What the rules accept — a pronoun, an article, the other gender — isn't
// listed; that follows from the grammar (src/lib/answers.ts).
// ---------------------------------------------------------------------------

interface AnswerRow {
  id: string;
  form_id: string;
  meaning: string;
  answer: string;
  source: string;
  created_at: string;
}

interface FormRow {
  id: string;
  form: string;
  gloss_en: string;
  unit_order: number;
}

export default function AdminAnswers() {
  const [rows, setRows] = useState<AnswerRow[] | null>(null);
  const [forms, setForms] = useState<Map<string, FormRow>>(new Map());
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    (async () => {
      const { data, error: failed } = await supabase
        .from('form_answers')
        .select('id, form_id, meaning, answer, source, created_at')
        .eq('status', 'published');
      if (failed) {
        setError(failed.message);
        setRows([]);
        return;
      }
      const list = (data ?? []) as AnswerRow[];
      const ids = [...new Set(list.map((r) => r.form_id))];
      const { data: f } = ids.length
        ? await supabase.from('form_entries').select('id, form, gloss_en, unit_order').in('id', ids)
        : { data: [] };
      setForms(new Map(((f ?? []) as FormRow[]).map((x) => [x.id, x])));
      setRows(list);
    })();
  }, []);
  useFocusEffect(load);

  const groups = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('es');
    const byForm = new Map<string, AnswerRow[]>();
    for (const r of rows ?? []) {
      const f = forms.get(r.form_id);
      const text = `${f?.form ?? ''} ${r.meaning} ${r.answer}`.toLocaleLowerCase('es');
      if (needle && !text.includes(needle)) continue;
      byForm.set(r.form_id, [...(byForm.get(r.form_id) ?? []), r]);
    }
    return [...byForm]
      .map(([id, answers]) => ({ form: forms.get(id), id, answers }))
      .sort((a, b) => (a.form?.unit_order ?? 0) - (b.form?.unit_order ?? 0) || (a.form?.form ?? '').localeCompare(b.form?.form ?? '', 'es'));
  }, [rows, forms, q]);

  const retire = async (row: AnswerRow) => {
    setError(null);
    try {
      await staffUpdate('form_answers', row.id, { status: 'retired' });
      // Gone from the list at once; a reload would only confirm it.
      setRows((all) => (all ?? []).filter((r) => r.id !== row.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That failed.');
    }
  };

  return (
    <AdminScreen
      title="Accepted answers"
      subtitle={rows ? `${rows.length} answers for ${new Set(rows.map((r) => r.form_id)).size} words` : 'Loading…'}>
      {error ? <Text style={{ color: colors.dangerInk }}>{error}</Text> : null}
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search a word, a meaning or an answer…"
        placeholderTextColor={colors.faint}
        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.ink }}
      />
      <Section title="By word">
        {rows && groups.length === 0 ? <Muted>{q ? 'Nothing matches.' : 'No stored answers yet. Run npm run course:answers.'}</Muted> : null}
        {groups.map(({ id, form, answers }) => (
          <View key={id} style={{ gap: 6 }}>
            <Text style={adminStyles.cellEs}>
              {form?.form ?? '?'} <Text style={adminStyles.cellEn}>· {form?.gloss_en} · unit {form?.unit_order}</Text>
            </Text>
            {answers.map((r) => (
              <RowLink key={r.id}>
                <Text style={[adminStyles.cellEn, { minWidth: 120 }]}>“{r.meaning}”</Text>
                <Text style={[adminStyles.cellEs, adminStyles.cellGrow]}>{r.answer}</Text>
                <Muted>{r.source}</Muted>
                <SmallButton label="Retire" icon="archive-outline" tone="danger" onPress={() => retire(r)} />
              </RowLink>
            ))}
          </View>
        ))}
      </Section>
    </AdminScreen>
  );
}

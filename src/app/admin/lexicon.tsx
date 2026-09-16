import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AdminScreen, Muted, RowLink, Section, StatusPill, adminStyles } from '@/components/admin';
import { loadForms } from '@/lib/admin';
import { colors, radius } from '@/lib/theme';
import type { ContentStatus, Form } from '@/lib/types';

// ---------------------------------------------------------------------------
// Every form in the course: which lemma, which unit teaches it, what it means.
// ---------------------------------------------------------------------------
export default function AdminLexicon() {
  const [forms, setForms] = useState<(Form & { status: ContentStatus })[] | null>(null);
  const [q, setQ] = useState('');
  useFocusEffect(
    useCallback(() => {
      loadForms().then((f) => setForms(f as (Form & { status: ContentStatus })[]));
    }, []),
  );
  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('es');
    return (forms ?? [])
      .filter((f) => f.status !== 'retired')
      .filter((f) => !needle || f.form.toLocaleLowerCase('es').includes(needle) || f.lemma.includes(needle) || f.gloss_en.toLowerCase().includes(needle))
      .sort((a, b) => a.unit_order - b.unit_order || a.form.localeCompare(b.form, 'es'))
      .slice(0, 200);
  }, [forms, q]);

  return (
    <AdminScreen title="Lexicon" subtitle={forms ? `${forms.length} forms` : 'Loading…'}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search a form, a lemma or a meaning…"
        placeholderTextColor={colors.faint}
        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.ink }}
      />
      <Section title={`Forms${shown.length === 200 ? ' (first 200)' : ''}`}>
        {shown.length === 0 && forms ? <Muted>Nothing matches.</Muted> : null}
        {shown.map((f) => (
          <RowLink key={f.id} onPress={() => router.push(`/admin/units/${f.unit_id}`)}>
            <Text style={[adminStyles.cellEs, { minWidth: 140 }]}>{f.form}</Text>
            <View style={[adminStyles.cellGrow, { minWidth: 200 }]}>
              <Text style={adminStyles.cellEn}>
                {f.gloss_en} · {f.lemma} · {f.pos}
                {f.is_glue ? ' · glue' : ''}
                {Object.keys(f.features ?? {}).length ? ` · ${JSON.stringify(f.features)}` : ''}
              </Text>
            </View>
            <Muted>unit {f.unit_order}</Muted>
            <StatusPill status={f.status} />
          </RowLink>
        ))}
      </Section>
    </AdminScreen>
  );
}

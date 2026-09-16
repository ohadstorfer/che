import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AdminScreen, Code, Muted, RowLink, Section, SmallButton, StatusPill, adminStyles } from '@/components/admin';
import { STATUSES, type UnitDetail, loadUnit, publishUnit } from '@/lib/admin';
import { colors, radius } from '@/lib/theme';
import type { ContentStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// One unit: its grammar and words, its lessons, and its sentences filtered by
// status or by the word they teach. Generating, linting, AI review and lesson
// building run from the terminal (scripts/course); publishing happens here.
// ---------------------------------------------------------------------------
export default function AdminUnit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const [status, setStatus] = useState<ContentStatus | 'all'>('all');
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (id) loadUnit(id).then(setDetail);
  }, [id]);
  useFocusEffect(load);

  const formById = useMemo(() => new Map((detail?.forms ?? []).map((f) => [f.id, f])), [detail]);
  const sentences = useMemo(() => {
    const q = target.trim().toLocaleLowerCase('es');
    return (detail?.sentences ?? []).filter(
      (s) =>
        (status === 'all' ? s.status !== 'retired' : s.status === status) &&
        (!q || (formById.get(s.target_form_id)?.form ?? '').toLocaleLowerCase('es').includes(q)),
    );
  }, [detail, status, target, formById]);

  if (!detail) return <AdminScreen title="Unit" back="/admin"><Muted>Loading…</Muted></AdminScreen>;
  const { unit } = detail;
  const approved = detail.sentences.filter((s) => s.status === 'approved').length;

  const publish = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await publishUnit(detail);
      setMessage(`Published ${unit.title_en} with ${approved} approved sentences.`);
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Publishing failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminScreen
      title={unit.title_en}
      subtitle={`Unit ${unit.ordinal} · ${unit.summary_en} · course order ${unit.course_order}`}
      back="/admin"
      actions={
        <>
          <StatusPill status={unit.status} />
          <SmallButton
            label={unit.status === 'published' ? 'Publish new approvals' : 'Publish unit'}
            icon="cloud-upload-outline"
            tone="primary"
            disabled={busy || (approved === 0 && unit.status === 'published')}
            onPress={publish}
          />
        </>
      }>
      {message ? <Muted>{message}</Muted> : null}

      <Section title="Grammar and words">
        <View style={adminStyles.wrap}>
          {unit.grammar_focus.map((g) => (
            <Code key={g}>{g}</Code>
          ))}
          <Muted>register up to {unit.register_max}</Muted>
        </View>
        <View style={adminStyles.wrap}>
          {detail.forms
            .filter((f) => f.status !== 'retired')
            .map((f) => (
              <View key={f.id} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: f.is_glue ? 'transparent' : colors.card, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 14, color: f.is_glue ? colors.muted : colors.ink }}>
                  {f.form} <Text style={{ color: colors.faint }}>{f.gloss_en}</Text>
                </Text>
              </View>
            ))}
        </View>
      </Section>

      <Section title="Lessons">
        {detail.lessons.map((l) => (
          <RowLink key={l.id} onPress={() => router.push(`/admin/lessons/${l.id}`)}>
            <Text style={[adminStyles.num, { minWidth: 24, textAlign: 'left' }]}>{l.ordinal}</Text>
            <Text style={[adminStyles.cellEs, adminStyles.cellGrow]}>{l.title_en}</Text>
            <Muted>{l.kind}</Muted>
            <StatusPill status={l.status} />
          </RowLink>
        ))}
      </Section>

      <Section title="Pipeline (terminal)">
        <Code>{`npm run course:generate -- ${unit.slug}      # draft sentences (over-generates, keeps the best)
npm run course:lint -- ${unit.slug}          # mechanical checks → linted
npm run course:review -- ${unit.slug}        # AI judge → ai_reviewed
npm run course:lessons -- ${unit.slug}       # propose lesson slots from approved sentences`}</Code>
      </Section>

      <Section
        title={`Sentences (${sentences.length})`}
        right={
          <View style={adminStyles.wrap}>
            {(['all', ...STATUSES] as const).map((s) => (
              <SmallButton key={s} label={s.replace('_', ' ')} tone={status === s ? 'primary' : 'default'} onPress={() => setStatus(s)} />
            ))}
          </View>
        }>
        <TextInput
          value={target}
          onChangeText={setTarget}
          placeholder="Filter by target word…"
          placeholderTextColor={colors.faint}
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: colors.ink }}
        />
        {sentences.length === 0 ? <Muted>No sentences here.</Muted> : null}
        {sentences.map((s) => (
          <RowLink key={s.id} onPress={() => router.push(`/admin/sentences/${s.id}`)}>
            <View style={[adminStyles.cellGrow, { gap: 2, minWidth: 240 }]}>
              <Text style={adminStyles.cellEs}>{s.es}</Text>
              <Text style={adminStyles.cellEn}>{s.en}</Text>
            </View>
            <Muted>
              {formById.get(s.target_form_id)?.form ?? '?'} · {s.kind} · d{s.difficulty}
            </Muted>
            <StatusPill status={s.status} />
          </RowLink>
        ))}
      </Section>
    </AdminScreen>
  );
}

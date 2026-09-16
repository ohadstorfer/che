import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminScreen, Muted, RowLink, Section, SmallButton, StatusPill, adminStyles } from '@/components/admin';
import { type UnitDetail, loadUnit, staffDeleteSlot, staffInsert, staffUpdate } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import type { Lesson, LessonSlot, SlotKind } from '@/lib/types';

// ---------------------------------------------------------------------------
// One lesson's slots, in order: move them, remove them, add one, pin a drill's
// exercise. "Preview" plays the lesson's canonical rendering — review and recap
// slots as placeholders — without recording anything.
// ---------------------------------------------------------------------------

const DRILL_MODES = ['', 'sentence_intro', 'sentence_meaning', 'sentence_gap', 'sentence_build', 'sentence_listen'];
const KINDS: SlotKind[] = ['teach', 'drill', 'match', 'tip', 'review', 'recap'];

export default function AdminLesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [slots, setSlots] = useState<LessonSlot[]>([]);
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [adding, setAdding] = useState<SlotKind | null>(null);
  const [pick, setPick] = useState('');
  const [count, setCount] = useState('2');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    (async () => {
      const [{ data: l }, { data: s }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', id).single(),
        supabase.from('lesson_slots').select('*').eq('lesson_id', id).order('ordinal', { ascending: true }),
      ]);
      setLesson(l as Lesson);
      setSlots((s ?? []) as LessonSlot[]);
      setUnit(await loadUnit((l as Lesson).unit_id));
    })();
  }, [id]);
  useFocusEffect(load);

  const formById = useMemo(() => new Map((unit?.forms ?? []).map((f) => [f.id, f])), [unit]);
  const sentenceById = useMemo(() => new Map((unit?.sentences ?? []).map((s) => [s.id, s])), [unit]);
  const tipById = useMemo(() => new Map((unit?.tips ?? []).map((t) => [t.id, t])), [unit]);

  if (!lesson || !unit) return <AdminScreen title="Lesson" back="/admin"><Muted>Loading…</Muted></AdminScreen>;

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That failed.');
    }
  };

  // Ordinals are unique within a lesson, so a swap parks one of them first.
  const move = (i: number, by: -1 | 1) =>
    run(async () => {
      const a = slots[i];
      const b = slots[i + by];
      if (!a || !b) return;
      await staffUpdate('lesson_slots', a.id, { ordinal: -1 });
      await staffUpdate('lesson_slots', b.id, { ordinal: a.ordinal });
      await staffUpdate('lesson_slots', a.id, { ordinal: b.ordinal });
    });

  const add = () =>
    run(async () => {
      if (!adding) return;
      const n = Number(count);
      const row: Record<string, unknown> = {
        lesson_id: lesson.id,
        ordinal: (slots.at(-1)?.ordinal ?? 0) + 1,
        kind: adding,
      };
      if (adding === 'teach') row.form_id = pick;
      if (adding === 'drill') row.sentence_id = pick;
      if (adding === 'tip') row.tip_id = pick;
      if (adding === 'review') row.review_count = n;
      if (adding === 'recap') {
        row.review_count = n;
        row.scope = pick === 'section' ? 'section' : 'unit';
      }
      await staffInsert('lesson_slots', row);
      setAdding(null);
      setPick('');
    });

  const describe = (s: LessonSlot) => {
    switch (s.kind) {
      case 'teach':
        return `teach ${formById.get(s.form_id ?? '')?.form ?? '?'}`;
      case 'drill':
        return `drill “${sentenceById.get(s.sentence_id ?? '')?.es ?? '?'}”`;
      case 'tip':
        return `tip: ${tipById.get(s.tip_id ?? '')?.title_en ?? '?'}`;
      case 'review':
        return `review × ${s.review_count}`;
      case 'recap':
        return `recap × ${s.review_count} (${s.scope})`;
      default:
        return 'matching block';
    }
  };

  const options: { id: string; label: string }[] =
    adding === 'teach'
      ? unit.forms.filter((f) => !f.is_glue && f.pos !== 'propn').map((f) => ({ id: f.id, label: f.form }))
      : adding === 'drill'
        ? unit.sentences.filter((s) => s.status === 'approved' || s.status === 'published').map((s) => ({ id: s.id, label: s.es }))
        : adding === 'tip'
          ? unit.tips.map((t) => ({ id: t.id, label: t.title_en }))
          : adding === 'recap'
            ? [
                { id: 'unit', label: 'this unit' },
                { id: 'section', label: 'the whole section' },
              ]
            : [];

  return (
    <AdminScreen
      title={`${unit.unit.title_en} · ${lesson.title_en}`}
      subtitle={`${lesson.kind} · ${slots.length} slots`}
      back={`/admin/units/${unit.unit.id}`}
      actions={
        <>
          <StatusPill status={lesson.status} />
          <SmallButton
            label="Preview"
            icon="play-outline"
            tone="primary"
            onPress={() => router.push(lesson.kind === 'story' ? `/story?lesson=${lesson.id}` : `/practice?lesson=${lesson.id}&preview=1`)}
          />
        </>
      }>
      {error ? <Text style={{ color: colors.dangerInk }}>{error}</Text> : null}

      <Section title="Slots">
        {slots.length === 0 ? <Muted>No slots yet. Run `npm run course:lessons -- {unit.unit.slug}` to propose some, or add them below.</Muted> : null}
        {slots.map((s, i) => (
          <RowLink key={s.id}>
            <Text style={[adminStyles.num, { minWidth: 24, textAlign: 'left' }]}>{s.ordinal}</Text>
            <Text style={[adminStyles.cellEs, adminStyles.cellGrow, { fontWeight: '600' }]}>{describe(s)}</Text>
            {s.kind === 'drill' ? (
              <View style={adminStyles.wrap}>
                {DRILL_MODES.map((m) => (
                  <SmallButton
                    key={m || 'ladder'}
                    label={m ? m.replace('sentence_', '') : 'ladder'}
                    tone={(s.mode ?? '') === m ? 'primary' : 'default'}
                    onPress={() => run(() => staffUpdate('lesson_slots', s.id, { mode: m || null }))}
                  />
                ))}
              </View>
            ) : null}
            <SmallButton label="↑" onPress={() => move(i, -1)} disabled={i === 0} />
            <SmallButton label="↓" onPress={() => move(i, 1)} disabled={i === slots.length - 1} />
            <SmallButton label="Remove" tone="danger" onPress={() => run(() => staffDeleteSlot(s))} />
          </RowLink>
        ))}
      </Section>

      <Section title="Add a slot">
        <View style={adminStyles.wrap}>
          {KINDS.map((k) => (
            <SmallButton key={k} label={k} tone={adding === k ? 'primary' : 'default'} onPress={() => { setAdding(k); setPick(''); }} />
          ))}
        </View>
        {adding && options.length ? (
          <View style={adminStyles.wrap}>
            {options.map((o) => (
              <SmallButton key={o.id} label={o.label} tone={pick === o.id ? 'primary' : 'default'} onPress={() => setPick(o.id)} />
            ))}
          </View>
        ) : null}
        {adding === 'review' || adding === 'recap' ? (
          <TextInput value={count} onChangeText={setCount} keyboardType="number-pad" style={styles.count} />
        ) : null}
        {adding ? (
          <SmallButton
            label={`Add ${adding}`}
            icon="add"
            tone="primary"
            disabled={['teach', 'drill', 'tip'].includes(adding) && !pick}
            onPress={add}
          />
        ) : null}
      </Section>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  count: {
    width: 80,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.ink,
  },
});

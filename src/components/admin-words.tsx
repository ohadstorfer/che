import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Listen, Muted, RowLink, Section, SmallButton, StatusPill, adminStyles } from '@/components/admin';
import { Exercise } from '@/components/exercises';
import { lastBatchFor, undoBatch } from '@/lib/admin';
import {
  type AdminForm,
  type NewForm,
  type Pending,
  type SentencePlan,
  type WordSentence,
  type WordsData,
  type Write,
  addForm,
  applyWrites,
  checkAnswer,
  checkNewForm,
  deckOf,
  isPending,
  learnerSentences,
  lessonsOf,
  meaningsFor,
  orphanAnswers,
  pendingFor,
  planFeatures,
  planMeaning,
  planMove,
  planRetire,
  planRetireAnswer,
  planRetireSentence,
  planSentence,
  planSpelling,
  sentenceState,
  sentencesUsing,
  teachingLesson,
  unitById,
} from '@/lib/admin-words';
import { setGloss } from '@/lib/course-rules/gloss';
import { POS, REGISTERS } from '@/lib/course-rules/rules';
import { type QueueItem } from '@/lib/round';
import { colors, radius } from '@/lib/theme';
import type { ExerciseMode, Form, FormFeatures } from '@/lib/types';

// ---------------------------------------------------------------------------
// The words screen's parts (docs/superplan-admin-palabras.md §4). A tool used
// all day: no entrance animations, press feedback from the admin's own buttons.
// Every save shows what it changes first when it touches more than the field
// being edited, then writes it as one batch that Undo reverts.
// ---------------------------------------------------------------------------

const lines = (a: string[]) => a.join('\n');
const unlines = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
const errorText = (e: unknown) => (e instanceof Error ? e.message : 'That failed.');

// ---------------------------------------------------------------------------
// Small controls
// ---------------------------------------------------------------------------

export function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  right,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={adminStyles.label}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          style={[styles.input, multiline && { minHeight: 72 }, { flex: 1 }]}
        />
        {right}
      </View>
    </View>
  );
}

/** One choice out of a few, as a row of buttons. */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
}: {
  label?: string;
  options: readonly T[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  render?: (v: T) => string;
}) {
  return (
    <View style={{ gap: 4 }}>
      {label ? <Text style={adminStyles.label}>{label}</Text> : null}
      <View style={adminStyles.wrap}>
        {options.map((o) => (
          <SmallButton key={o || '—'} label={render ? render(o) : o || '—'} tone={value === o ? 'primary' : 'default'} onPress={() => onChange(o)} />
        ))}
      </View>
    </View>
  );
}

function Problems({ items, tone = 'danger' }: { items: string[]; tone?: 'danger' | 'muted' }) {
  if (!items.length) return null;
  return (
    <View style={{ gap: 2 }}>
      {items.map((p) => (
        <Text key={p} style={[styles.problem, tone === 'muted' && { color: colors.muted }]}>
          • {p}
        </Text>
      ))}
    </View>
  );
}

/** The longer forms a bound word lives inside: `llamo` → «me llamo». */
const chunksFor = (data: WordsData, form: AdminForm) =>
  data.forms.filter((f) => f.lemma_id === form.lemma_id && f.id !== form.id && f.form.endsWith(` ${form.form}`));

function StateBadge({ s }: { s: WordSentence }) {
  const state = sentenceState(s);
  const label = state === 'live' ? 'live' : state === 'paused' ? 'paused' : s.status.replace('_', ' ');
  const tone = state === 'live' ? styles.badgeLive : state === 'paused' ? styles.badgePaused : styles.badgeMuted;
  return (
    <View style={[styles.badge, tone]}>
      <Text style={[styles.badgeText, state === 'live' && { color: colors.onPrimary }, state === 'paused' && { color: colors.dangerInk }]}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Change summary: what a save does, before it does it
// ---------------------------------------------------------------------------

export interface Change {
  title: string;
  errors: string[];
  notes: string[];
  sentences: SentencePlan[];
  writes: Write[];
  confirmLabel: string;
}

export function ChangeSummary({ change, onDone, onCancel }: { change: Change; onDone: (batchId?: string) => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(await applyWrites(change.writes));
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>{change.title}</Text>
      <Problems items={change.errors} />
      {change.notes.map((n) => (
        <Muted key={n}>{n}</Muted>
      ))}
      {change.sentences.map((p) => (
        <View key={p.id ?? p.row.es} style={styles.summaryRow}>
          {p.before && p.before.es !== p.row.es ? (
            <Text style={styles.summaryBefore}>{p.before.es}</Text>
          ) : null}
          <View style={styles.summaryLine}>
            <Text style={[adminStyles.cellEs, { flex: 1 }]}>{p.row.es}</Text>
            {p.paused ? <Text style={styles.problem}>pauses</Text> : p.wentLive ? <Text style={styles.liveText}>goes live</Text> : null}
          </View>
          <Problems items={p.problems} />
          {p.droppedAlts.length ? <Muted>Removes other Spanish: {p.droppedAlts.join(' · ')}</Muted> : null}
        </View>
      ))}
      {error ? <Text style={styles.problem}>{error}</Text> : null}
      <View style={adminStyles.wrap}>
        <SmallButton label={change.confirmLabel} icon="checkmark" tone="primary" disabled={busy || change.errors.length > 0} onPress={confirm} />
        <SmallButton label="Cancel" onPress={onCancel} disabled={busy} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The list
// ---------------------------------------------------------------------------

export function WordList({
  data,
  selected,
  onSelect,
  onAdd,
}: {
  data: WordsData;
  selected: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  const [q, setQ] = useState('');
  const [unit, setUnit] = useState<string>('all');
  const [pendingOnly, setPendingOnly] = useState(false);
  const learner = useMemo(() => learnerSentences(data), [data]);
  const pending = useMemo(() => new Map(data.forms.map((f) => [f.id, pendingFor(data, f, learner)])), [data, learner]);
  const pendingCount = useMemo(() => data.forms.filter((f) => f.status !== 'retired' && isPending(pending.get(f.id) ?? [])).length, [data, pending]);
  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('es');
    return data.forms
      .filter((f) => f.status !== 'retired')
      .filter((f) => unit === 'all' || f.unit_id === unit)
      .filter((f) => !pendingOnly || isPending(pending.get(f.id) ?? []))
      .filter(
        (f) =>
          !needle ||
          f.form.toLocaleLowerCase('es').includes(needle) ||
          f.lemma.toLocaleLowerCase('es').includes(needle) ||
          f.gloss_en.toLowerCase().includes(needle),
      )
      .sort((a, b) => a.unit_order - b.unit_order || a.position - b.position || a.form.localeCompare(b.form, 'es'));
  }, [data, q, unit, pendingOnly, pending]);
  const [limit, setLimit] = useState(150);

  return (
    <View style={{ gap: 10 }}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search a word, a lemma or a meaning…"
        placeholderTextColor={colors.faint}
        style={styles.input}
      />
      <View style={adminStyles.wrap}>
        <SmallButton label={`Pending ${pendingCount}`} icon="alert-circle-outline" tone={pendingOnly ? 'primary' : 'default'} onPress={() => setPendingOnly(!pendingOnly)} />
        <SmallButton label="Word" icon="add" onPress={onAdd} />
      </View>
      <View style={adminStyles.wrap}>
        <SmallButton label="All units" tone={unit === 'all' ? 'primary' : 'default'} onPress={() => setUnit('all')} />
        {data.units.map((u) => (
          <Pressable key={u.id} onPress={() => setUnit(u.id)} style={[styles.unitChip, unit === u.id && styles.unitChipOn]} accessibilityLabel={u.title_en}>
            <Text style={[styles.unitChipText, unit === u.id && { color: colors.onPrimary }]}>{u.course_order}</Text>
          </Pressable>
        ))}
      </View>
      <Muted>{shown.length} words</Muted>
      <View style={{ gap: 4 }}>
        {shown.slice(0, limit).map((f) => {
          const p = pending.get(f.id) ?? [];
          return (
            <RowLink key={f.id} onPress={() => onSelect(f.id)} style={selected === f.id ? { ...styles.listRow, ...styles.listRowOn } : styles.listRow}>
              <Text style={styles.listUnit}>u{f.unit_order}</Text>
              <Text style={[adminStyles.cellEs, adminStyles.cellGrow]} numberOfLines={1}>
                {f.form}
              </Text>
              {isPending(p) ? <Text style={styles.warn}>⚠</Text> : null}
            </RowLink>
          );
        })}
      </View>
      {shown.length > limit ? <SmallButton label={`Show ${Math.min(150, shown.length - limit)} more`} onPress={() => setLimit(limit + 150)} /> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// The detail
// ---------------------------------------------------------------------------

const FEATURE_CHOICES = {
  gender: ['', 'm', 'f'],
  number: ['', 'sg', 'pl'],
  person: ['', '1', '2', '3'],
  mood: ['', 'ind', 'imp', 'subj'],
  verb_form: ['', 'inf', 'ger', 'part'],
  tense: ['', 'pres', 'pret', 'impf', 'fut', 'cond'],
} as const;

type FeatureDraft = { gender: string; number: string; person: string; mood: string; verb_form: string; tense: string; voseo: boolean; clitic: boolean; irregular: boolean };

const draftOf = (f: FormFeatures): FeatureDraft => ({
  gender: f.gender ?? '',
  number: f.number ?? '',
  person: f.person ? String(f.person) : '',
  mood: f.mood ?? '',
  verb_form: f.verb_form ?? '',
  tense: f.tense ?? '',
  voseo: !!f.voseo,
  clitic: !!f.clitic,
  irregular: !!f.irregular,
});

const featuresOf = (d: FeatureDraft): FormFeatures =>
  ({
    ...(d.person ? { person: Number(d.person) } : {}),
    ...(d.number ? { number: d.number } : {}),
    ...(d.tense ? { tense: d.tense } : {}),
    ...(d.mood ? { mood: d.mood } : {}),
    ...(d.verb_form ? { verb_form: d.verb_form } : {}),
    ...(d.voseo ? { voseo: true } : {}),
    ...(d.clitic ? { clitic: true } : {}),
    ...(d.gender ? { gender: d.gender } : {}),
    ...(d.irregular ? { irregular: true } : {}),
  }) as FormFeatures;

const featureText = (f: FormFeatures) =>
  [f.person && f.number ? `${f.person}${f.number}` : f.number, f.gender, f.tense, f.mood, f.verb_form, f.voseo ? 'vos' : null, f.clitic ? 'clitic' : null]
    .filter(Boolean)
    .join('.') || 'no features';

export function WordDetail({ data, formId, onChanged }: { data: WordsData; formId: string; onChanged: (select?: string) => void }) {
  const form = data.forms.find((f) => f.id === formId);
  const [change, setChange] = useState<Change | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [undo, setUndo] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [spelling, setSpelling] = useState('');
  const [meaning, setMeaning] = useState({ gloss_en: '', gloss_note_en: '' });
  const [features, setFeatures] = useState<FeatureDraft>(draftOf({}));
  const using = useMemo(() => (form ? sentencesUsing(data, form.id) : []), [data, form]);

  // The drafts follow the word as saved: a new word, or a save, resets them.
  const saved = form ? JSON.stringify([form.id, form.form, form.gloss_en, form.gloss_note_en, form.features]) : '';
  useEffect(() => {
    if (!form) return;
    setSpelling(form.form);
    setMeaning({ gloss_en: form.gloss_en, gloss_note_en: form.gloss_note_en ?? '' });
    setFeatures(draftOf(form.features));
    setChange(null);
    setMoving(false);
  }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!form) return;
    let alive = true;
    lastBatchFor([form.id, ...using.map((s) => s.id)]).then((r) => alive && setUndo(r?.batch_id ?? null));
    return () => {
      alive = false;
    };
  }, [form, using]);

  if (!form) return <Muted>That word isn’t in the course.</Muted>;
  const unit = unitById(data, form.unit_id);
  const lesson = teachingLesson(data, form.id);
  const pending = pendingFor(data, form);

  const done = (text: string) => (batchId?: string) => {
    setChange(null);
    setMoving(false);
    setMessage(text);
    if (batchId) setUndo(batchId);
    onChanged(form.id);
  };

  const doUndo = async () => {
    if (!undo) return;
    try {
      await undoBatch(undo);
      setUndo(null);
      setMessage('Undone.');
      onChanged(form.id);
    } catch (e) {
      setMessage(errorText(e));
    }
  };

  const saveSpelling = () => {
    const plan = planSpelling(data, form, spelling);
    setChange({
      title: `Write “${form.form}” as “${spelling.trim()}”`,
      errors: plan.errors,
      notes: [
        'Same word, same id: learners keep their progress. Its audio is removed.',
        ...(plan.renameLemma ? [`The lemma is renamed too.`] : []),
        plan.sentences.length ? `${plan.sentences.length} sentence(s) change:` : 'No sentence uses it.',
      ],
      sentences: plan.sentences,
      writes: plan.writes,
      confirmLabel: 'Fix spelling',
    });
  };

  const saveMeaning = () => {
    const plan = planMeaning(data, form, meaning);
    const run = { title: 'Change the meaning', errors: plan.errors, sentences: [], writes: plan.writes, confirmLabel: 'Save meaning' };
    const notes = [
      plan.onLemma ? 'Written on the lemma.' : 'Written on this form only; its lemma’s other forms keep theirs.',
      ...(plan.orphans.length ? [`${plan.orphans.length} accepted answer(s) are for a meaning it won’t have: ${plan.orphans.map((a) => `“${a.meaning}” → ${a.answer}`).join(', ')}. Reassign or retire them below.`] : []),
      'Its alternatives will be pending review (course:answers).',
    ];
    if (plan.errors.length || plan.orphans.length) setChange({ ...run, notes });
    else applyWrites(plan.writes).then(done('Meaning saved.'), (e) => setMessage(errorText(e)));
  };

  const saveFeatures = () => {
    const plan = planFeatures(data, form, featuresOf(features));
    const change: Change = {
      title: `Grammar: ${featureText(featuresOf(features))}`,
      errors: plan.errors,
      notes: plan.sentences.length ? ['The accepted Spanish of these sentences is regenerated:'] : [],
      sentences: plan.sentences,
      writes: plan.writes,
      confirmLabel: 'Save grammar',
    };
    if (plan.errors.length || plan.sentences.length) setChange(change);
    else applyWrites(plan.writes).then(done('Grammar saved.'), (e) => setMessage(errorText(e)));
  };

  const retire = () => {
    const plan = planRetire(data, form);
    setChange({
      title: `Retire “${form.form}”`,
      errors: [],
      notes: [
        'Learners keep their progress, but it stops being scheduled.',
        ...(plan.retiresLemma ? ['Its lemma has no other form, so it is retired too.'] : []),
        plan.sentences.length ? 'These sentences pause:' : 'No sentence uses it.',
      ],
      sentences: plan.sentences,
      writes: plan.writes,
      confirmLabel: 'Retire word',
    });
  };

  return (
    <View style={{ gap: 20 }}>
      <View style={styles.detailHead}>
        <View style={{ flex: 1, gap: 2, minWidth: 220 }}>
          <Text style={styles.detailTitle}>{form.form}</Text>
          <Muted>
            Unit {unit?.course_order ?? '?'} · {lesson ? `Lesson ${lesson.ordinal}` : 'no lesson'} · {form.pos} · {featureText(form.features)} ·{' '}
            {form.register} · from {form.source === 'dashboard' ? 'the admin' : 'the outline'}
          </Muted>
          {/* Why this word has no exercises and no answers to review, said where
              a reviewer will be looking when they wonder. */}
          {form.bound ? (
            <Muted>
              Never drilled: only ever said inside{' '}
              {chunksFor(data, form).map((c) => `«${c.form}»`).join(' and ') || 'a longer word'}.
            </Muted>
          ) : null}
        </View>
        <View style={adminStyles.wrap}>
          <StatusPill status={form.status} />
          <SmallButton label="Move" icon="swap-horizontal-outline" onPress={() => setMoving(!moving)} />
          <SmallButton label="Undo" icon="arrow-undo-outline" disabled={!undo} onPress={doUndo} />
          <SmallButton label="Retire" icon="archive-outline" tone="danger" onPress={retire} />
        </View>
      </View>
      {message ? <Muted>{message}</Muted> : null}
      {pending.length ? (
        <View style={adminStyles.wrap}>
          {pending.map((p: Pending) => (
            <View key={p.kind} style={[styles.badge, styles.badgePaused]}>
              <Text style={[styles.badgeText, { color: colors.dangerInk }]}>{p.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {moving ? <MovePanel data={data} form={form} onPlan={setChange} onCancel={() => setMoving(false)} /> : null}
      {change ? <ChangeSummary change={change} onDone={done('Saved.')} onCancel={() => setChange(null)} /> : null}

      <Section title="Word">
        <Field
          label="Spelling"
          value={spelling}
          onChange={setSpelling}
          right={<SmallButton label="Fix" disabled={spelling.trim() === form.form} onPress={saveSpelling} />}
        />
        <Field label="Meaning" value={meaning.gloss_en} onChange={(gloss_en) => setMeaning({ ...meaning, gloss_en })} />
        <Field
          label="Note (shown when taught, never on an answer)"
          value={meaning.gloss_note_en}
          onChange={(gloss_note_en) => setMeaning({ ...meaning, gloss_note_en })}
        />
        <View style={adminStyles.wrap}>
          <SmallButton
            label="Save meaning"
            icon="save-outline"
            disabled={meaning.gloss_en === form.gloss_en && meaning.gloss_note_en === (form.gloss_note_en ?? '')}
            onPress={saveMeaning}
          />
        </View>
        <View style={adminStyles.wrap}>
          <Listen path={form.audio_path} voice={form.voice_id} />
        </View>
      </Section>

      <Section title="Grammar">
        <View style={{ gap: 8 }}>
          {(Object.keys(FEATURE_CHOICES) as (keyof typeof FEATURE_CHOICES)[]).map((k) => (
            <Choice key={k} label={k.replace('_', ' ')} options={FEATURE_CHOICES[k]} value={features[k]} onChange={(v) => setFeatures({ ...features, [k]: v })} />
          ))}
          <View style={adminStyles.wrap}>
            {(['voseo', 'clitic', 'irregular'] as const).map((k) => (
              <SmallButton key={k} label={k} tone={features[k] ? 'primary' : 'default'} onPress={() => setFeatures({ ...features, [k]: !features[k] })} />
            ))}
          </View>
          <View style={adminStyles.wrap}>
            <SmallButton
              label="Save grammar"
              icon="save-outline"
              disabled={JSON.stringify(featuresOf(features)) === JSON.stringify(featuresOf(draftOf(form.features)))}
              onPress={saveFeatures}
            />
          </View>
        </View>
      </Section>

      <AnswersSection data={data} form={form} onChanged={done('Saved.')} />

      <SentencesSection data={data} form={form} sentences={using} onChanged={done('Saved.')} />

      <ExercisePreview data={data} form={form} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Move to another unit
// ---------------------------------------------------------------------------

function MovePanel({ data, form, onPlan, onCancel }: { data: WordsData; form: AdminForm; onPlan: (c: Change) => void; onCancel: () => void }) {
  const [unitId, setUnitId] = useState<string | null>(null);
  const lessons = unitId ? lessonsOf(data, unitId).filter((l) => l.kind !== 'review') : [];
  const [lessonId, setLessonId] = useState<string | null>(null);
  useEffect(() => setLessonId(lessons[0]?.id ?? null), [unitId]); // eslint-disable-line react-hooks/exhaustive-deps

  const review = () => {
    if (!unitId || !lessonId) return;
    const plan = planMove(data, form, unitId, lessonId);
    const unit = unitById(data, unitId);
    onPlan({
      title: `Move “${form.form}” to unit ${unit?.course_order}`,
      errors: plan.errors,
      notes: [
        `${plan.paused.length} sentence(s) pause, ${plan.wentLive.length} go live again.`,
        'It is taught at the end of the lesson you picked; its old teach slot is removed.',
      ],
      sentences: plan.sentences,
      writes: plan.writes,
      confirmLabel: 'Move word',
    });
  };

  return (
    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>Move to which unit?</Text>
      <View style={adminStyles.wrap}>
        {data.units.map((u) => (
          <Pressable key={u.id} onPress={() => setUnitId(u.id)} style={[styles.unitChip, unitId === u.id && styles.unitChipOn, u.id === form.unit_id && { opacity: 0.4 }]}>
            <Text style={[styles.unitChipText, unitId === u.id && { color: colors.onPrimary }]}>{u.course_order}</Text>
          </Pressable>
        ))}
      </View>
      {unitId ? (
        <>
          <Muted>{unitById(data, unitId)?.title_en}. Which lesson teaches it?</Muted>
          <Choice options={lessons.map((l) => l.id)} value={lessonId} onChange={setLessonId} render={(id) => lessons.find((l) => l.id === id)?.title_en ?? id} />
        </>
      ) : null}
      <View style={adminStyles.wrap}>
        <SmallButton label="Review move" tone="primary" disabled={!unitId || !lessonId} onPress={review} />
        <SmallButton label="Cancel" onPress={onCancel} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Accepted answers
// ---------------------------------------------------------------------------

function AnswersSection({ data, form, onChanged }: { data: WordsData; form: AdminForm; onChanged: (batchId?: string) => void }) {
  const meanings = useMemo(() => meaningsFor(data, form), [data, form]);
  const orphans = useMemo(() => orphanAnswers(data, form), [data, form]);
  const [meaning, setMeaning] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setMeaning(meanings[0] ?? null), [form.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const own = data.answers.filter((a) => a.form_id === form.id);

  const add = async () => {
    if (!meaning) return;
    const { error: why, writes } = checkAnswer(data, form, meaning, answer);
    setError(why);
    if (why) return;
    try {
      const batch = await applyWrites(writes);
      setAnswer('');
      onChanged(batch);
    } catch (e) {
      setError(errorText(e));
    }
  };
  const retire = async (id: string) => {
    const a = own.find((x) => x.id === id);
    if (a) onChanged(await applyWrites(planRetireAnswer(a)));
  };

  return (
    <Section title="Accepted answers">
      <Muted>Besides the word itself, its pronoun or article, and the other gender — those follow from the grammar.</Muted>
      {meanings.map((m) => {
        const list = own.filter((a) => a.meaning.toLowerCase() === m.toLowerCase());
        return (
          <View key={m} style={styles.answerRow}>
            <Text style={[adminStyles.cellEn, { minWidth: 120 }]}>“{m}”</Text>
            <View style={[adminStyles.wrap, { flex: 1 }]}>
              {list.length ? null : <Muted>—</Muted>}
              {list.map((a) => (
                <Pressable key={a.id} onPress={() => retire(a.id)} style={styles.answerChip} accessibilityLabel={`Retire ${a.answer}`}>
                  <Text style={adminStyles.cellEs}>{a.answer}</Text>
                  <Text style={styles.answerRetire}>×</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
      {orphans.length ? (
        <View style={{ gap: 4 }}>
          <Text style={adminStyles.label}>Orphaned — for a meaning it no longer has</Text>
          {orphans.map((a) => (
            <View key={a.id} style={styles.answerRow}>
              <Text style={[adminStyles.cellEn, { minWidth: 120 }]}>“{a.meaning}”</Text>
              <Text style={[adminStyles.cellEs, { flex: 1 }]}>{a.answer}</Text>
              {meaning ? (
                <SmallButton
                  label={`Move to “${meaning}”`}
                  onPress={async () => {
                    const { error: why, writes } = checkAnswer({ ...data, answers: data.answers.filter((x) => x.id !== a.id) }, form, meaning, a.answer);
                    if (why) return setError(why);
                    onChanged(await applyWrites([...planRetireAnswer(a), ...writes]));
                  }}
                />
              ) : null}
              <SmallButton label="Retire" tone="danger" onPress={() => retire(a.id)} />
            </View>
          ))}
        </View>
      ) : null}
      <Choice options={meanings} value={meaning} onChange={setMeaning} render={(m) => `for “${m}”`} />
      <Field label="Add an answer" value={answer} onChange={setAnswer} right={<SmallButton label="Add" icon="add" disabled={!answer.trim() || !meaning} onPress={add} />} />
      {error ? <Text style={styles.problem}>{error}</Text> : null}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Sentences
// ---------------------------------------------------------------------------

function SentencesSection({ data, form, sentences, onChanged }: { data: WordsData; form: AdminForm; sentences: WordSentence[]; onChanged: (batchId?: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const sorted = [...sentences].sort((a, b) => Number(b.target_form_id === form.id) - Number(a.target_form_id === form.id) || a.es.localeCompare(b.es, 'es'));
  return (
    <Section title={`Sentences (${sentences.length})`} right={<SmallButton label="New" icon="add" onPress={() => setAdding(!adding)} />}>
      {adding ? <SentenceEditor data={data} form={form} sentence={null} onSaved={(b) => { setAdding(false); onChanged(b); }} onCancel={() => setAdding(false)} /> : null}
      {sorted.length === 0 && !adding ? <Muted>No sentence uses it yet.</Muted> : null}
      {sorted.map((s) => (
        <View key={s.id} style={{ gap: 6 }}>
          <RowLink onPress={() => setOpen(open === s.id ? null : s.id)}>
            <Text style={styles.caret}>{open === s.id ? '▾' : '▸'}</Text>
            <View style={[adminStyles.cellGrow, { minWidth: 180 }]}>
              <Text style={adminStyles.cellEs}>{s.es}</Text>
              <Text style={adminStyles.cellEn}>{s.en}</Text>
            </View>
            {s.target_form_id !== form.id ? <Muted>uses it</Muted> : null}
            {s.status === 'published' && s.tokens.some((t) => t.gloss_pending) ? <Muted>glosses pending</Muted> : null}
            <StateBadge s={s} />
          </RowLink>
          {sentenceState(s) === 'paused' && open !== s.id ? <Problems items={s.problems} /> : null}
          {open === s.id ? (
            // Keyed by the sentence as saved: after a save the editor starts
            // again from it, rather than from the drafts that were just written.
            <SentenceEditor
              key={`${s.id}:${s.es}:${s.en}:${JSON.stringify(s.tokens)}`}
              data={data}
              form={form}
              sentence={s}
              onSaved={onChanged}
              onCancel={() => setOpen(null)}
            />
          ) : null}
        </View>
      ))}
    </Section>
  );
}

function SentenceEditor({
  data,
  form,
  sentence,
  onSaved,
  onCancel,
}: {
  data: WordsData;
  form: AdminForm;
  sentence: WordSentence | null;
  onSaved: (batchId?: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(() => ({
    es: sentence?.es ?? '',
    en: sentence?.en ?? '',
    en_alt: lines(sentence?.en_alt ?? []),
    es_alt: lines(sentence?.es_alt ?? []),
  }));
  const [glosses, setGlosses] = useState<string[]>(() => (sentence?.tokens ?? []).map((t) => t.gloss ?? ''));
  const [confirm, setConfirm] = useState<Change | null>(null);
  const [error, setError] = useState<string | null>(null);

  const edits = { es: draft.es, en: draft.en, en_alt: unlines(draft.en_alt), es_alt: unlines(draft.es_alt), ...(sentence ? {} : { target_form_id: form.id }) };
  const plan = useMemo(() => planSentence(data, sentence, edits), [data, sentence, JSON.stringify(edits)]); // eslint-disable-line react-hooks/exhaustive-deps
  const textChanged = !sentence || sentence.es !== plan.row.es || sentence.en !== plan.row.en;

  // Glosses typed by hand, on the tokens as they will be saved.
  const glossPlan = useMemo(() => {
    let current = { en: plan.row.en, tokens: plan.row.tokens };
    const problems: string[] = [];
    if (!sentence || textChanged) return { tokens: current.tokens, problems };
    current.tokens.forEach((t, i) => {
      const typed = glosses[i]?.trim() ?? '';
      if (typed === (t.gloss ?? '')) return;
      const { tokens, problem } = setGloss(current, i, typed);
      if (problem) problems.push(problem);
      else current = { ...current, tokens };
    });
    return { tokens: current.tokens, problems };
  }, [sentence, textChanged, plan, glosses]);

  const save = async () => {
    setError(null);
    const writes = plan.writes.map((w): Write => (w.op === 'update' ? { ...w, patch: { ...w.patch, tokens: glossPlan.tokens } } : w));
    const needsWrite = writes.length || JSON.stringify(glossPlan.tokens) !== JSON.stringify(sentence?.tokens);
    const final: Write[] = writes.length ? writes : needsWrite && sentence ? [{ op: 'update', table: 'sentences', id: sentence.id, patch: { tokens: glossPlan.tokens } }] : [];
    if (!final.length) return onCancel();
    if (plan.droppedAlts.length && !confirm) {
      setConfirm({ title: 'Save the sentence', errors: [], notes: ['This removes other accepted Spanish that no longer fits:'], sentences: [plan], writes: final, confirmLabel: 'Save' });
      return;
    }
    try {
      onSaved(await applyWrites(final));
    } catch (e) {
      setError(errorText(e));
    }
  };

  const retire = async () => {
    if (!sentence) return;
    const { writes, slots } = planRetireSentence(data, sentence);
    setConfirm({ title: 'Retire the sentence', errors: [], notes: [slots ? `It leaves ${slots} lesson drill(s).` : 'No lesson drills it.'], sentences: [], writes, confirmLabel: 'Retire sentence' });
  };

  const formById = new Map(data.forms.map((f) => [f.id, f]));
  return (
    <View style={styles.editor}>
      <Field label="Spanish" value={draft.es} onChange={(es) => setDraft({ ...draft, es })} />
      {sentence ? (
        <View style={adminStyles.wrap}>
          <Listen path={sentence.audio_path} voice={sentence.voice_id} />
          {/* The clip says the sentence as saved. Saving an edited Spanish drops
              it (planSentence), so this is the last chance to hear the old one. */}
          {sentence.audio_path && textChanged ? <Muted>of the saved text</Muted> : null}
        </View>
      ) : null}
      <Field label="English" value={draft.en} onChange={(en) => setDraft({ ...draft, en })} />
      <Field label="Other English (one per line)" value={draft.en_alt} onChange={(en_alt) => setDraft({ ...draft, en_alt })} multiline />
      <Field label="Other Spanish (one per line; the rules add pronoun and che variants)" value={draft.es_alt} onChange={(es_alt) => setDraft({ ...draft, es_alt })} multiline />

      <View style={{ gap: 4 }}>
        <Text style={adminStyles.label}>Glosses — what each word means in this sentence</Text>
        {textChanged && sentence ? <Muted>Save the text first; glosses of changed words wait for course:gloss.</Muted> : null}
        <View style={adminStyles.wrap}>
          {(sentence && !textChanged ? plan.row.tokens : []).map((t, i) => {
            const forms = t.form_ids.map((id) => formById.get(id)).filter(Boolean) as Form[];
            return (
              <View key={i} style={[styles.token, !forms.length && styles.tokenMissing]}>
                <Text style={styles.tokenSurface}>{t.surface}</Text>
                <TextInput
                  value={glosses[i] ?? ''}
                  onChangeText={(v) => setGlosses(glosses.map((g, k) => (k === i ? v : g)).concat(i >= glosses.length ? [v] : []))}
                  placeholder={t.gloss_pending ? 'pending' : '—'}
                  placeholderTextColor={colors.faint}
                  style={styles.glossInput}
                />
                {t.gloss_source === 'staff' ? <Text style={styles.tokenMeta}>by hand</Text> : null}
              </View>
            );
          })}
        </View>
        <Problems items={glossPlan.problems} />
      </View>

      <View style={{ gap: 4 }}>
        {plan.problems.length ? <Text style={adminStyles.label}>Saving pauses it</Text> : null}
        <Problems items={plan.problems} />
        <Problems items={plan.altProblems} />
        <Problems items={plan.altWarnings} tone="muted" />
        {plan.row.es_alt.length ? <Muted>Accepted Spanish after saving: {plan.row.es_alt.join(' · ')}</Muted> : null}
        {!plan.problems.length && (plan.wentLive || !sentence) ? <Text style={styles.liveText}>Saving puts it live.</Text> : null}
      </View>

      {confirm ? (
        <ChangeSummary change={confirm} onDone={(b) => { setConfirm(null); onSaved(b); }} onCancel={() => setConfirm(null)} />
      ) : (
        <View style={adminStyles.wrap}>
          <SmallButton label="Save" icon="save-outline" tone="primary" disabled={!draft.es.trim() || !draft.en.trim() || glossPlan.problems.length > 0} onPress={save} />
          {sentence ? <SmallButton label="Retire" icon="archive-outline" tone="danger" onPress={retire} /> : null}
          <SmallButton label="Cancel" onPress={onCancel} />
          {sentence ? <SmallButton label="Full editor" icon="open-outline" onPress={() => router.push(`/admin/sentences/${sentence.id}`)} /> : null}
        </View>
      )}
      {error ? <Text style={styles.problem}>{error}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Exercise preview: what a learner gets for this word, with the data as saved
// ---------------------------------------------------------------------------

const WORD_MODES: ExerciseMode[] = ['typing', 'multiple_choice', 'word_build', 'listen_build'];
const SENTENCE_MODES: ExerciseMode[] = [
  'sentence_meaning',
  'sentence_meaning_tiles',
  'sentence_gap',
  'sentence_gap_tiles',
  'sentence_gap_typed',
  'sentence_build',
];

export function ExercisePreview({ data, form }: { data: WordsData; form: AdminForm }) {
  const deck = useMemo(() => deckOf(data), [data]);
  const lexicon = useMemo(() => new Map<string, Form>(data.forms.map((f) => [f.id, f])), [data]);
  const sentences = useMemo(() => learnerSentences(data), [data]);
  // Opened on request: an exercise takes the keyboard focus, which would pull the page down to it.
  const [mode, setMode] = useState<ExerciseMode | null>(null);
  const [key, setKey] = useState(0);
  const drilled = deck.find((f) => f.id === form.id);
  const sentence = sentences.find((s) => s.target_form_id === form.id) ?? sentences.find((s) => s.form_ids.includes(form.id));
  const modes = [...WORD_MODES, ...(sentence ? SENTENCE_MODES : [])];
  const target = drilled ?? form;
  const item: QueueItem | null = !mode
    ? null
    : SENTENCE_MODES.includes(mode) && sentence
      ? { form: target, state: null, mode, direction: 'en_to_es', sentence, group: sentence.form_ids.map((id) => deck.find((f) => f.id === id) ?? lexicon.get(id)).filter((f): f is Form => !!f) }
      : { form: target, state: null, mode: SENTENCE_MODES.includes(mode) ? 'typing' : mode, direction: 'en_to_es' };

  return (
    <Section title="Exercise preview">
      <View style={adminStyles.wrap}>
        {modes.map((m) => (
          <SmallButton key={m} label={m.replace('sentence_', 'sentence ').replace('_', ' ')} tone={mode === m ? 'primary' : 'default'} onPress={() => { setMode(m); setKey((k) => k + 1); }} />
        ))}
        {mode ? <SmallButton label="Close" onPress={() => setMode(null)} /> : null}
      </View>
      {form.status !== 'published' ? <Muted>It isn’t published, so learners don’t get it yet. This is how it would look.</Muted> : null}
      {item ? (
        <>
          <View style={styles.preview}>
            <Exercise
              key={`${form.id}-${mode}-${key}-${target.meaning_en ?? ''}-${form.form}`}
              item={item}
              allForms={deck.length ? deck : [target]}
              allSentences={sentences}
              lexicon={lexicon}
              hints
              onIntroDone={() => setKey((k) => k + 1)}
              onAnswered={() => undefined}
            />
          </View>
          <Muted>Try an answer to see what is accepted. Nothing is recorded.</Muted>
        </>
      ) : (
        <Muted>Pick an exercise to see it the way a learner gets it, with the data as saved.</Muted>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Add a word
// ---------------------------------------------------------------------------

export function AddWord({ data, onAdded, onCancel }: { data: WordsData; onAdded: (id: string) => void; onCancel: () => void }) {
  const [fields, setFields] = useState<NewForm>({
    form: '',
    lemma_id: null,
    lemma: '',
    pos: 'noun',
    features: {},
    gloss_en: '',
    gloss_note_en: '',
    register: 'neutral',
    is_glue: false,
    unit_id: data.units[0]?.id ?? '',
    lesson_id: '',
  });
  const [features, setFeatures] = useState<FeatureDraft>(draftOf({}));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lessons = lessonsOf(data, fields.unit_id).filter((l) => l.kind !== 'review');
  useEffect(() => setFields((f) => ({ ...f, lesson_id: lessons[0]?.id ?? '' })), [fields.unit_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const lemmaText = (fields.lemma || fields.form).trim();
  const existing = data.lemmas.find((l) => l.lemma === lemmaText && l.pos === fields.pos);
  const candidate: NewForm = { ...fields, lemma: lemmaText, lemma_id: existing?.id ?? null, features: featuresOf(features) };
  const { errors } = checkNewForm(data, candidate);
  const set = (patch: Partial<NewForm>) => setFields({ ...fields, ...patch });

  const add = async () => {
    setBusy(true);
    setError(null);
    try {
      const { id } = await addForm(data, candidate);
      onAdded(id);
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <Text style={styles.detailTitle}>New word</Text>
      <Field label="Word, as written" value={fields.form} onChange={(form) => set({ form })} />
      <Field label="Lemma (dictionary form; blank = the word)" value={fields.lemma} onChange={(lemma) => set({ lemma })} placeholder={fields.form} />
      <Choice label="Part of speech" options={POS} value={fields.pos} onChange={(pos) => set({ pos })} />
      {existing ? <Muted>Adds a form to the existing lemma “{existing.lemma}” ({existing.gloss_en}).</Muted> : null}
      <Field label={existing ? 'Meaning (blank = the lemma’s)' : 'Meaning'} value={fields.gloss_en} onChange={(gloss_en) => set({ gloss_en })} />
      <Field label="Note" value={fields.gloss_note_en} onChange={(gloss_note_en) => set({ gloss_note_en })} />
      {(Object.keys(FEATURE_CHOICES) as (keyof typeof FEATURE_CHOICES)[]).map((k) => (
        <Choice key={k} label={k.replace('_', ' ')} options={FEATURE_CHOICES[k]} value={features[k]} onChange={(v) => setFeatures({ ...features, [k]: v })} />
      ))}
      <View style={adminStyles.wrap}>
        {(['voseo', 'clitic', 'irregular'] as const).map((k) => (
          <SmallButton key={k} label={k} tone={features[k] ? 'primary' : 'default'} onPress={() => setFeatures({ ...features, [k]: !features[k] })} />
        ))}
        <SmallButton label="glue word" tone={fields.is_glue ? 'primary' : 'default'} onPress={() => set({ is_glue: !fields.is_glue })} />
      </View>
      {!existing ? <Choice label="Register" options={REGISTERS} value={fields.register} onChange={(register) => set({ register })} /> : null}
      <View style={{ gap: 4 }}>
        <Text style={adminStyles.label}>Unit</Text>
        <View style={adminStyles.wrap}>
          {data.units.map((u) => (
            <Pressable key={u.id} onPress={() => set({ unit_id: u.id })} style={[styles.unitChip, fields.unit_id === u.id && styles.unitChipOn]}>
              <Text style={[styles.unitChipText, fields.unit_id === u.id && { color: colors.onPrimary }]}>{u.course_order}</Text>
            </Pressable>
          ))}
        </View>
        <Muted>{unitById(data, fields.unit_id)?.title_en}</Muted>
      </View>
      <Choice label="Taught in" options={lessons.map((l) => l.id)} value={fields.lesson_id} onChange={(lesson_id) => set({ lesson_id })} render={(id) => lessons.find((l) => l.id === id)?.title_en ?? id} />
      {fields.form.trim() ? <Problems items={errors} /> : null}
      {error ? <Text style={styles.problem}>{error}</Text> : null}
      <Muted>It starts with no sentences; write the first one on its page.</Muted>
      <View style={adminStyles.wrap}>
        <SmallButton label="Add word" icon="add" tone="primary" disabled={busy || errors.length > 0} onPress={add} />
        <SmallButton label="Cancel" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  fieldRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  problem: { fontSize: 14, color: colors.dangerInk, lineHeight: 20 },
  liveText: { fontSize: 14, color: colors.primaryDark, fontWeight: '600' },
  warn: { fontSize: 14, color: colors.dangerInk },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  badgeLive: { backgroundColor: colors.primary },
  badgePaused: { backgroundColor: colors.dangerSoft },
  badgeMuted: { backgroundColor: 'rgba(31, 37, 33, 0.06)' },
  summary: { gap: 8, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.card },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  summaryRow: { gap: 2, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  summaryLine: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  summaryBefore: { fontSize: 14, color: colors.faint, textDecorationLine: 'line-through' },
  listRow: { paddingVertical: 7, paddingHorizontal: 10, gap: 8, flexWrap: 'nowrap' },
  listRowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  listUnit: { fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'], minWidth: 26 },
  unitChip: { minWidth: 30, height: 28, paddingHorizontal: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  unitChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitChipText: { fontSize: 13, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
  detailHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  detailTitle: { fontSize: 26, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  answerChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  answerRetire: { fontSize: 15, color: colors.muted },
  caret: { fontSize: 13, color: colors.muted, width: 12 },
  editor: { gap: 12, padding: 14, marginLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.border },
  token: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 2, minWidth: 90 },
  tokenMissing: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  tokenSurface: { fontSize: 15, fontWeight: '700', color: colors.ink },
  tokenMeta: { fontSize: 11, color: colors.muted },
  glossInput: { fontSize: 13, color: colors.ink, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: colors.border, minWidth: 70 },
  preview: { height: 620, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.bg },
});

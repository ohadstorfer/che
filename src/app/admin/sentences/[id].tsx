import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminScreen, Code, Muted, Section, SmallButton, StatusPill, adminStyles } from '@/components/admin';
import { Exercise } from '@/components/exercises';
import {
  type ReviewRow,
  type SentenceRow,
  loadForms,
  loadReviews,
  recordReview,
  staffUpdate,
} from '@/lib/admin';
import { type QueueItem } from '@/lib/round';
import { toSentence } from '@/lib/sentences';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import type { ExerciseMode, Form } from '@/lib/types';

// ---------------------------------------------------------------------------
// The sentence editor: the Spanish and its English, the answers it accepts,
// the words each token resolves to, what the linter and the AI judge said —
// and the verdict. A live preview shows the sentence the way a learner meets
// it in each exercise.
// ---------------------------------------------------------------------------

const PREVIEW_MODES: ExerciseMode[] = ['sentence_meaning', 'sentence_gap', 'sentence_build'];
const lines = (a: string[]) => a.join('\n');
const unlines = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

export default function AdminSentence() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [row, setRow] = useState<SentenceRow | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [draft, setDraft] = useState({ es: '', en: '', en_alt: '', es_alt: '' });
  const [comment, setComment] = useState('');
  const [mode, setMode] = useState<ExerciseMode>('sentence_meaning');
  const [previewKey, setPreviewKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('sentences').select('*').eq('id', id).single();
      const s = data as SentenceRow;
      setRow(s);
      setDraft({ es: s.es, en: s.en, en_alt: lines(s.en_alt ?? []), es_alt: lines(s.es_alt ?? []) });
      const [all, revs] = await Promise.all([loadForms(), loadReviews('sentences', s.id)]);
      setForms(all);
      setReviews(revs);
    })();
  }, [id]);
  useFocusEffect(load);

  const formById = useMemo(() => new Map(forms.map((f) => [f.id, f])), [forms]);
  const target = row ? formById.get(row.target_form_id) : undefined;
  const deck = useMemo(
    () => forms.filter((f) => !f.is_glue && f.pos !== 'propn' && f.unit_order <= (target?.unit_order ?? 0)),
    [forms, target],
  );

  if (!row) return <AdminScreen title="Sentence" back="/admin"><Muted>Loading…</Muted></AdminScreen>;

  const dirty =
    draft.es !== row.es || draft.en !== row.en || draft.en_alt !== lines(row.en_alt ?? []) || draft.es_alt !== lines(row.es_alt ?? []);

  const save = async () => {
    const esChanged = draft.es.trim() !== row.es;
    const next = await staffUpdate<SentenceRow>('sentences', row.id, {
      es: draft.es.trim(),
      en: draft.en.trim(),
      en_alt: unlines(draft.en_alt),
      es_alt: unlines(draft.es_alt),
      // New Spanish means new tokens: back through the linter first.
      ...(esChanged ? { status: 'draft' } : {}),
    });
    setRow(next);
    setMessage(esChanged ? 'Saved. The Spanish changed, so it is a draft again — run the linter to re-tokenize it.' : 'Saved.');
  };

  const verdict = async (status: 'approved' | 'draft' | 'retired') => {
    const next = await staffUpdate<SentenceRow>('sentences', row.id, { status });
    await recordReview('sentences', row.id, status === 'approved' ? 'pass' : status === 'draft' ? 'flag' : 'fail', comment || undefined);
    setRow(next);
    setComment('');
    setReviews(await loadReviews('sentences', row.id));
    setMessage(status === 'approved' ? 'Approved.' : status === 'draft' ? 'Sent back.' : 'Retired.');
  };

  const sentence = toSentence(row, formById);
  const previewItem: QueueItem | null = target
    ? {
        form: target,
        state: null,
        mode,
        direction: 'en_to_es',
        sentence,
        group: sentence.form_ids.map((fid) => formById.get(fid)).filter((f): f is Form => !!f),
      }
    : null;

  return (
    <AdminScreen
      title={row.es}
      subtitle={`${row.en} · target: ${target?.form ?? '?'} · ${row.kind} · difficulty ${row.difficulty} · ${row.source}`}
      back={`/admin/units/${row.unit_id}`}
      actions={<StatusPill status={row.status} />}>
      {message ? <Muted>{message}</Muted> : null}

      <View style={styles.columns}>
        <View style={styles.column}>
          <Section title="Text" right={<SmallButton label="Save" icon="save-outline" tone="primary" disabled={!dirty} onPress={save} />}>
            <Field label="Spanish" value={draft.es} onChange={(es) => setDraft({ ...draft, es })} />
            <Field label="English" value={draft.en} onChange={(en) => setDraft({ ...draft, en })} />
            <Field label="Other English (one per line)" value={draft.en_alt} onChange={(en_alt) => setDraft({ ...draft, en_alt })} multiline />
            <Field label="Other accepted Spanish (one per line)" value={draft.es_alt} onChange={(es_alt) => setDraft({ ...draft, es_alt })} multiline />
          </Section>

          <Section title="Tokens">
            <View style={adminStyles.wrap}>
              {row.tokens.map((t, i) => {
                const resolved = t.form_ids.map((fid) => formById.get(fid)).filter(Boolean) as Form[];
                const missing = resolved.length === 0;
                return (
                  <View key={i} style={[styles.token, missing && styles.tokenMissing]}>
                    <Text style={styles.tokenSurface}>{t.surface}</Text>
                    <Text style={styles.tokenForms}>
                      {missing ? 'unresolved' : resolved.map((f) => `${f.lemma} · ${f.pos}${f.is_glue ? ' · glue' : ''}`).join(' / ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Section>

          <Section title="Verdict">
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Comment for the author or the generator (optional)"
              placeholderTextColor={colors.faint}
              multiline
              style={[styles.input, { minHeight: 64 }]}
            />
            <View style={adminStyles.wrap}>
              <SmallButton label="Approve" icon="checkmark" tone="primary" onPress={() => verdict('approved')} />
              <SmallButton label="Send back" icon="arrow-undo-outline" onPress={() => verdict('draft')} />
              <SmallButton label="Retire" icon="archive-outline" tone="danger" onPress={() => verdict('retired')} />
            </View>
          </Section>

          <Section title="Reviews">
            {reviews.length === 0 ? <Muted>No reviews yet.</Muted> : null}
            {reviews.map((r) => (
              <View key={r.id} style={styles.review}>
                <Text style={styles.reviewHead}>
                  {r.stage} · {r.verdict} · {new Date(r.created_at).toLocaleString()}
                </Text>
                <Code>{JSON.stringify(r.notes, null, 2)}</Code>
              </View>
            ))}
          </Section>
        </View>

        <View style={styles.column}>
          <Section
            title="Learner preview"
            right={
              <View style={adminStyles.wrap}>
                {PREVIEW_MODES.map((m) => (
                  <SmallButton key={m} label={m.replace('sentence_', '')} tone={mode === m ? 'primary' : 'default'} onPress={() => { setMode(m); setPreviewKey((k) => k + 1); }} />
                ))}
              </View>
            }>
            <View style={styles.preview}>
              {previewItem ? (
                <Exercise
                  key={`${mode}-${previewKey}-${row.es}`}
                  item={previewItem}
                  allForms={deck}
                  allSentences={[]}
                  onIntroDone={() => setPreviewKey((k) => k + 1)}
                  onAnswered={() => setPreviewKey((k) => k + 1)}
                />
              ) : (
                <Muted>The target word isn't in the lexicon.</Muted>
              )}
            </View>
            <Muted>The meaning exercise draws wrong options from other published sentences; here it has none to draw from.</Muted>
          </Section>
        </View>
      </View>
    </AdminScreen>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={adminStyles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} multiline={multiline} style={[styles.input, multiline && { minHeight: 72 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 340, gap: 20 },
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
  token: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 1 },
  tokenMissing: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  tokenSurface: { fontSize: 15, fontWeight: '700', color: colors.ink },
  tokenForms: { fontSize: 11, color: colors.muted },
  review: { gap: 4 },
  reviewHead: { fontSize: 13, fontWeight: '600', color: colors.muted },
  preview: { height: 620, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.bg },
});

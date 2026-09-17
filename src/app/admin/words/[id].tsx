import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import { AdminScreen, Muted } from '@/components/admin';
import { WordDetail } from '@/components/admin-words';
import { type WordsData, loadWords } from '@/lib/admin-words';
import { colors } from '@/lib/theme';

// ---------------------------------------------------------------------------
// One word on its own page: for narrow screens and direct links.
// ---------------------------------------------------------------------------
export default function AdminWord() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<WordsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    loadWords().then(setData, (e) => setError(e instanceof Error ? e.message : 'Loading failed.'));
  }, []);
  useFocusEffect(load);
  const form = data?.forms.find((f) => f.id === id);

  return (
    <AdminScreen title={form?.form ?? 'Word'} subtitle={form ? `${form.lemma} · ${form.gloss_en}` : undefined} back={`/admin/words?word=${id}`}>
      {error ? <Text style={{ color: colors.dangerInk }}>{error}</Text> : null}
      {data && id ? <WordDetail data={data} formId={id} onChanged={load} /> : <Muted>Loading…</Muted>}
    </AdminScreen>
  );
}

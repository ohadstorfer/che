import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AdminScreen, Muted } from '@/components/admin';
import { AddWord, WordDetail, WordList } from '@/components/admin-words';
import { type WordsData, loadWords } from '@/lib/admin-words';
import { colors, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Every word of the course and its sentences (docs/superplan-admin-palabras.md
// §4). The database is the source of truth: what is saved here is what learners
// get the next time their data loads. Wide screens show the list and the word
// side by side; narrow ones open the word on its own page.
// ---------------------------------------------------------------------------

/** Below this the detail gets its own page. */
const SPLIT_AT = 980;

export default function AdminWords() {
  const params = useLocalSearchParams<{ word?: string }>();
  const { width } = useWindowDimensions();
  const [data, setData] = useState<WordsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(params.word ?? null);
  const [adding, setAdding] = useState(false);
  const split = width >= SPLIT_AT;

  const load = useCallback(() => {
    loadWords().then(setData, (e) => setError(e instanceof Error ? e.message : 'Loading failed.'));
  }, []);
  useFocusEffect(load);

  const select = (id: string) => {
    setAdding(false);
    if (split) {
      setSelected(id);
      router.setParams({ word: id });
    } else {
      router.push(`/admin/words/${id}`);
    }
  };
  const changed = (id?: string) => {
    if (id) setSelected(id);
    load();
  };

  const live = data?.forms.filter((f) => f.status !== 'retired').length ?? 0;
  const list = data ? <WordList data={data} selected={selected} onSelect={select} onAdd={() => setAdding(true)} /> : null;
  const detail = !data ? null : adding ? (
    <AddWord data={data} onAdded={(id) => { setAdding(false); changed(id); if (!split) router.push(`/admin/words/${id}`); }} onCancel={() => setAdding(false)} />
  ) : selected ? (
    <WordDetail data={data} formId={selected} onChanged={changed} />
  ) : (
    <Muted>Pick a word.</Muted>
  );

  return (
    <AdminScreen title="Words" subtitle={data ? `${live} words · ${data.sentences.length} sentences` : 'Loading…'}>
      {error ? <Text style={{ color: colors.dangerInk }}>{error}</Text> : null}
      {!data ? null : split ? (
        <View style={styles.split}>
          <View style={styles.list}>
            <ScrollView contentContainerStyle={{ padding: 12 }}>{list}</ScrollView>
          </View>
          <View style={styles.detail}>{detail}</View>
        </View>
      ) : adding ? (
        detail
      ) : (
        list
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  split: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  list: {
    width: 300,
    maxHeight: 1400,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  detail: { flex: 1, minWidth: 0 },
});

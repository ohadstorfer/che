import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenTitle } from '@/components/ui';
import { playAudio } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { colors, radius, shadow } from '@/lib/theme';
import type { Form, FormState } from '@/lib/types';

// ---------------------------------------------------------------------------
// Palabras — everything she has met so far, and nothing she hasn't.
//
// The course decides what exists; this screen is the other side of it: the
// words the path has actually given her, with how settled each one is, and the
// sentences she has been shown. Writing and recording the course happens in
// the dashboard, not here.
// ---------------------------------------------------------------------------

type Tab = 'words' | 'sentences';

interface WordRow {
  form: Form;
  state: FormState;
}

interface SentenceRow {
  id: string;
  es: string;
  en: string;
  audio_path: string | null;
}

/** How settled a word is, in three steps a glance can read. */
function strength(state: FormState): { label: string; tone: 'new' | 'growing' | 'strong' } {
  if (state.interval_days >= 21) return { label: 'firme', tone: 'strong' };
  if (state.interval_days >= 4) return { label: 'creciendo', tone: 'growing' };
  return { label: 'nueva', tone: 'new' };
}

export default function Words() {
  // The tabs' opaque `sceneStyle` (see (tabs)/_layout) covers the root
  // gradient, so this screen's actual background is flat `colors.bg`.
  useStatusBarColor(colors.bg);
  const { profile } = useAuth();
  // `null` until the first fetch lands. An empty array would be a lie the
  // screen tells for as long as the round trip takes.
  const [words, setWords] = useState<WordRow[] | null>(null);
  const [sentences, setSentences] = useState<SentenceRow[] | null>(null);
  const [tab, setTab] = useState<Tab>('words');
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      Promise.all([
        supabase.from('form_states').select('*').eq('user_id', profile.id),
        supabase.from('form_entries').select('*').eq('status', 'published'),
      ]).then(([{ data: states }, { data: forms }]) => {
        const formById = new Map(((forms ?? []) as Form[]).map((f) => [f.id, f]));
        const rows = ((states ?? []) as FormState[]).flatMap((state) => {
          const form = formById.get(state.form_id);
          return form ? [{ form, state }] : [];
        });
        // In the order the course taught them — the newest words at the top.
        rows.sort(
          (a, b) =>
            b.form.unit_order - a.form.unit_order ||
            b.state.introduced_on.localeCompare(a.state.introduced_on) ||
            a.form.form.localeCompare(b.form.form, 'es'),
        );
        setWords(rows);
      });
      supabase
        .from('sentence_states')
        .select('sentence_id, last_shown_at')
        .eq('user_id', profile.id)
        .then(async ({ data: shown }) => {
          const ids = (shown ?? []).map((r: { sentence_id: string }) => r.sentence_id);
          if (ids.length === 0) return setSentences([]);
          const { data } = await supabase.from('sentences').select('id, es, en, audio_path').in('id', ids);
          const lastShown = new Map((shown ?? []).map((r: { sentence_id: string; last_shown_at: string | null }) => [r.sentence_id, r.last_shown_at ?? '']));
          setSentences(
            ((data ?? []) as SentenceRow[]).sort((a, b) =>
              (lastShown.get(b.id) ?? '').localeCompare(lastShown.get(a.id) ?? ''),
            ),
          );
        });
    }, [profile]),
  );

  const q = search.trim().toLocaleLowerCase('es');
  const filteredWords = useMemo(
    () =>
      (words ?? []).filter(
        ({ form }) =>
          !q || form.form.toLocaleLowerCase('es').includes(q) || form.gloss_en.toLowerCase().includes(q),
      ),
    [words, q],
  );
  const filteredSentences = useMemo(
    () =>
      (sentences ?? []).filter(
        (s) => !q || s.es.toLocaleLowerCase('es').includes(q) || s.en.toLowerCase().includes(q),
      ),
    [sentences, q],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <ScreenTitle>Palabras</ScreenTitle>
          {words ? <Text style={styles.count}>{words.length}</Text> : null}
        </View>

        <View style={styles.segment}>
          {(['words', 'sentences'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={({ pressed }) => [
                styles.segmentItem,
                tab === t && styles.segmentItemActive,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}>
              <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
                {t === 'words' ? 'Palabras' : 'Frases'}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar…"
          placeholderTextColor={colors.faint}
          style={styles.search}
        />

        {tab === 'words' ? (
          words == null ? (
            <WordsSkeleton />
          ) : (
            <FlatList
              data={filteredWords}
              keyExtractor={(r) => r.form.id}
              contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  {words.length === 0
                    ? 'Todavía no aprendiste ninguna palabra. Empezá la primera lección del camino.'
                    : 'Sin resultados.'}
                </Text>
              }
              renderItem={({ item: { form, state } }) => {
                const s = strength(state);
                return (
                  <View style={styles.row}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.rowTop}>
                        <Text style={styles.es} numberOfLines={2}>
                          {form.form}
                        </Text>
                        <Text
                          style={[
                            styles.strength,
                            s.tone === 'strong' && styles.strengthStrong,
                            s.tone === 'growing' && styles.strengthGrowing,
                          ]}>
                          {s.label}
                        </Text>
                      </View>
                      <Text style={styles.en} numberOfLines={2}>
                        {form.gloss_en}
                      </Text>
                    </View>
                    {form.audio_path ? <PlayButton path={form.audio_path} /> : null}
                  </View>
                );
              }}
            />
          )
        ) : sentences == null ? (
          <WordsSkeleton />
        ) : (
          <FlatList
            data={filteredSentences}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {sentences.length === 0 ? 'Las frases que veas en las lecciones aparecen acá.' : 'Sin resultados.'}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.es}>{item.es}</Text>
                  <Text style={styles.en}>{item.en}</Text>
                </View>
                {item.audio_path ? <PlayButton path={item.audio_path} /> : null}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function PlayButton({ path }: { path: string }) {
  return (
    <Pressable
      onPress={() => playAudio(path)}
      hitSlop={8}
      accessibilityLabel="Escuchar"
      style={({ pressed }) => [styles.playButton, { transform: [{ scale: pressed ? 0.9 : 1 }] }]}>
      <Ionicons name="volume-high" size={18} color={colors.primary} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// WordsSkeleton — the shape of the list before the list exists: same rows, same
// spacing, so nothing jumps when the words arrive. The bars are ragged on
// purpose; six identical ones read as a table, not as words.
// ---------------------------------------------------------------------------
const BONE_WIDTHS = ['58%', '42%', '66%', '48%', '61%', '38%'] as const;

function WordsSkeleton() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) return;
      const half = (toValue: number) =>
        Animated.timing(pulse, {
          toValue,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        });
      loop = Animated.loop(Animated.sequence([half(1), half(0)]));
      loop.start();
    });
    return () => loop?.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <View style={{ gap: 10 }} accessibilityLabel="Cargando palabras">
      {BONE_WIDTHS.map((width, i) => (
        <View key={i} style={styles.row}>
          <View style={{ flex: 1, gap: 9 }}>
            <Animated.View style={[styles.bone, { width, opacity }]} />
            <Animated.View
              style={[styles.bone, styles.boneSmall, { width: BONE_WIDTHS[(i + 3) % 6], opacity }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    padding: 20,
    gap: 14,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  count: { fontSize: 15, fontWeight: '700', color: colors.muted, fontVariant: ['tabular-nums'] },
  segment: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  segmentItemActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 15, fontWeight: '600', color: colors.muted },
  segmentTextActive: { color: colors.primaryDark },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...shadow.card,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  es: { fontSize: 17, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  en: { fontSize: 14, color: colors.muted },
  strength: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  strengthGrowing: { color: colors.primaryDark, backgroundColor: colors.primarySoft },
  strengthStrong: { color: colors.onPrimary, backgroundColor: colors.primary },
  playButton: { backgroundColor: colors.primarySoft, borderRadius: 99, padding: 8 },
  bone: { height: 15, borderRadius: 7, backgroundColor: colors.border },
  boneSmall: { height: 11, borderRadius: 5 },
  empty: { textAlign: 'center', color: colors.faint, fontSize: 15, marginTop: 32, lineHeight: 21 },
});

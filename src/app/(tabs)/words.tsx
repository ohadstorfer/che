import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
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

import { Button, ScreenTitle } from '@/components/ui';
import {
  type ActiveRecording,
  canRecord,
  playAudio,
  startRecording,
  uploadAudio,
} from '@/lib/audio';
import { isPhrase } from '@/lib/session';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { colors, press, radius, shadow } from '@/lib/theme';
import type { Card, Sentence } from '@/lib/types';

type Tab = 'words' | 'sentences';
/** What the list needs of a generated sentence. */
type SentenceRow = Pick<Sentence, 'id' | 'hebrew' | 'translit' | 'spanish' | 'audio_path'>;

export default function Words() {
  // The tabs' opaque `sceneStyle` (see (tabs)/_layout) covers the root
  // gradient, so this screen's actual background is flat `colors.bg` — the
  // claim has to match that, not the gradient the scene no longer shows.
  useStatusBarColor(colors.bg);
  // `null` until the first fetch lands. An empty array would be a lie the
  // screen tells for as long as the round trip takes — "todavía no hay
  // palabras", with a button to add the first one, over a deck that is full.
  const [cards, setCards] = useState<Card[] | null>(null);
  // Generated sentences live in their own tab: mixed in by date they would
  // bury the words under the week's batch. They are also where Ohad records —
  // the generator writes text only, so every sentence starts out silent.
  const [sentences, setSentences] = useState<SentenceRow[] | null>(null);
  const [tab, setTab] = useState<Tab>('words');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => setCards((data as Card[]) ?? []));
      // Oldest first: the batch is written in the order she will meet the
      // words, so recording top to bottom records what she needs soonest.
      supabase
        .from('sentences')
        .select('id, hebrew, translit, spanish, audio_path')
        .is('retired_at', null)
        .order('created_at', { ascending: true })
        .then(({ data }) => setSentences((data as SentenceRow[]) ?? []));
    }, []),
  );

  const q = search.trim().toLowerCase();
  const filteredCards = useMemo(() => {
    if (!cards) return [];
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.translit.toLowerCase().includes(q) ||
        c.spanish.toLowerCase().includes(q) ||
        c.hebrew.includes(q) ||
        (c.english ?? '').toLowerCase().includes(q),
    );
  }, [cards, q]);

  const missing = useMemo(() => (sentences ?? []).filter((s) => !s.audio_path).length, [sentences]);
  const filteredSentences = useMemo(() => {
    if (!sentences) return [];
    return sentences.filter(
      (s) =>
        (!onlyMissing || !s.audio_path) &&
        (!q ||
          s.translit.toLowerCase().includes(q) ||
          s.spanish.toLowerCase().includes(q) ||
          s.hebrew.includes(q)),
    );
  }, [sentences, q, onlyMissing]);

  // ---- Recording, one sentence at a time -----------------------------------
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeRec = useRef<ActiveRecording | null>(null);

  // Leaving the screen mid-take drops it rather than leaving the mic open.
  useEffect(() => () => activeRec.current?.cancel(), []);

  const toggleRecord = async (s: SentenceRow) => {
    setError(null);
    if (recordingId === s.id) {
      const rec = activeRec.current;
      activeRec.current = null;
      setRecordingId(null);
      if (!rec) return;
      setSavingId(s.id);
      try {
        const { blob, mime } = await rec.stop();
        const path = await uploadAudio(s.id, blob, mime, 'sentences');
        const { error: err } = await supabase
          .from('sentences')
          .update({ audio_path: path })
          .eq('id', s.id);
        if (err) throw err;
        setSentences((prev) =>
          prev ? prev.map((x) => (x.id === s.id ? { ...x, audio_path: path } : x)) : prev,
        );
      } catch (err) {
        console.warn('[words] sentence audio failed', err);
        setError('No se pudo guardar el audio.');
      } finally {
        setSavingId(null);
      }
      return;
    }
    if (recordingId) return; // another take is running — its stop button is the way out
    try {
      activeRec.current = await startRecording();
      setRecordingId(s.id);
    } catch {
      setError('No se pudo acceder al micrófono.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <ScreenTitle>Palabras</ScreenTitle>
          <Pressable
            onPress={() => router.push('/add')}
            accessibilityLabel="Agregar palabra"
            style={({ pressed }) => [
              styles.addButton,
              { transform: [{ scale: pressed ? press.scale : 1 }] },
            ]}>
            <Ionicons name="add" size={20} color={colors.onPrimary} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </Pressable>
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
                {t === 'words' ? 'Palabras' : 'Oraciones'}
              </Text>
              {t === 'sentences' && missing > 0 ? (
                <View style={styles.segmentBadge}>
                  <Text style={styles.segmentBadgeText}>{missing}</Text>
                </View>
              ) : null}
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
          cards == null ? (
            <WordsSkeleton />
          ) : (
            <FlatList
              data={filteredCards}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
              ListEmptyComponent={
                cards.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Text style={[styles.empty, { marginTop: 0 }]}>Todavía no hay palabras.</Text>
                    <Button title="+ Agregar la primera" onPress={() => router.push('/add')} />
                  </View>
                ) : (
                  <Text style={styles.empty}>Sin resultados.</Text>
                )
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/card/${item.id}`)}
                  style={({ pressed }) => [
                    styles.row,
                    { transform: [{ scale: pressed ? 0.985 : 1 }] },
                  ]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowTop}>
                      <Text style={styles.translit} numberOfLines={2}>
                        {item.translit}
                      </Text>
                      {isPhrase(item.translit) ? (
                        <Text style={styles.kindTag}>frase</Text>
                      ) : (
                        <Text style={styles.hebrew}>{item.hebrew}</Text>
                      )}
                    </View>
                    <Text style={styles.spanish} numberOfLines={2}>
                      {item.spanish}
                    </Text>
                  </View>
                  {item.audio_path ? (
                    <Pressable
                      onPress={() => playAudio(item.audio_path!)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.playButton,
                        { transform: [{ scale: pressed ? 0.9 : 1 }] },
                      ]}>
                      <Ionicons name="volume-high" size={18} color={colors.primary} />
                    </Pressable>
                  ) : null}
                  <Ionicons name="chevron-forward" size={18} color={colors.faint} />
                </Pressable>
              )}
            />
          )
        ) : sentences == null ? (
          <WordsSkeleton />
        ) : (
          <FlatList
            data={filteredSentences}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
            ListHeaderComponent={
              <View style={{ gap: 10 }}>
                {missing > 0 ? (
                  <Pressable
                    onPress={() => setOnlyMissing((v) => !v)}
                    style={({ pressed }) => [
                      styles.chip,
                      onlyMissing && styles.chipOn,
                      { transform: [{ scale: pressed ? 0.97 : 1 }] },
                    ]}>
                    <Ionicons
                      name="mic-off"
                      size={14}
                      color={onlyMissing ? colors.onPrimary : colors.primaryDark}
                    />
                    <Text style={[styles.chipText, onlyMissing && { color: colors.onPrimary }]}>
                      Sin audio · {missing}
                    </Text>
                  </Pressable>
                ) : null}
                {!canRecord && missing > 0 ? (
                  <Text style={styles.hint}>Las oraciones se graban desde el navegador.</Text>
                ) : null}
                {error ? <Text style={styles.error}>{error}</Text> : null}
              </View>
            }
            ListEmptyComponent={
              <Text style={styles.empty}>
                {sentences.length === 0 ? 'Todavía no hay oraciones.' : 'Sin resultados.'}
              </Text>
            }
            renderItem={({ item }) => {
              const recording = recordingId === item.id;
              const saving = savingId === item.id;
              return (
                <View style={[styles.row, recording && styles.rowRecording]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.translit} numberOfLines={2}>
                      {item.translit}
                    </Text>
                    <Text style={styles.sentenceHebrew} numberOfLines={2}>
                      {item.hebrew}
                    </Text>
                    <Text
                      style={[styles.spanish, recording && { color: colors.danger }]}
                      numberOfLines={2}>
                      {recording ? 'Grabando… tocá para parar' : item.spanish}
                    </Text>
                  </View>
                  {item.audio_path && !recording ? (
                    <Pressable
                      onPress={() => playAudio(item.audio_path!)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.playButton,
                        { transform: [{ scale: pressed ? 0.9 : 1 }] },
                      ]}>
                      <Ionicons name="volume-high" size={18} color={colors.primary} />
                    </Pressable>
                  ) : null}
                  {canRecord ? (
                    <Pressable
                      onPress={() => toggleRecord(item)}
                      disabled={saving || (!!recordingId && !recording)}
                      hitSlop={8}
                      accessibilityLabel={recording ? 'Parar' : 'Grabar'}
                      style={({ pressed }) => [
                        styles.micButton,
                        recording && styles.micButtonOn,
                        !!recordingId && !recording && { opacity: 0.4 },
                        { transform: [{ scale: pressed ? 0.9 : 1 }] },
                      ]}>
                      {saving ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                      ) : (
                        <Ionicons
                          name={recording ? 'stop' : 'mic'}
                          size={18}
                          color={recording ? colors.onPrimary : colors.danger}
                        />
                      )}
                    </Pressable>
                  ) : !item.audio_path ? (
                    <Text style={styles.missingTag}>sin audio</Text>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
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

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 9,
    ...shadow.card,
  },
  addButtonText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },
  // Same segmented control as /add's Palabra · Frase.
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
  // How many sentences still have no voice — the number he is working down.
  segmentBadge: {
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: 'center',
  },
  segmentBadgeText: { fontSize: 12, fontWeight: '700', color: colors.onPrimary },
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
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  hint: { fontSize: 13, color: colors.faint },
  error: { fontSize: 13, color: colors.danger },
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
  rowRecording: { borderColor: colors.danger },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  translit: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    flexShrink: 1,
  },
  kindTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  missingTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dangerInk,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  hebrew: { fontSize: 15, color: colors.muted },
  // Stated alignment keeps the right-to-left line under its transliteration
  // instead of parked at the far edge of the row.
  sentenceHebrew: { fontSize: 15, color: colors.muted, textAlign: 'left' },
  spanish: { fontSize: 14, color: colors.muted },
  playButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 99,
    padding: 8,
  },
  micButton: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 99,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonOn: { backgroundColor: colors.danger },
  bone: { height: 15, borderRadius: 7, backgroundColor: colors.border },
  boneSmall: { height: 11, borderRadius: 5 },
  emptyWrap: { marginTop: 32, gap: 16, alignItems: 'stretch' },
  empty: {
    textAlign: 'center',
    color: colors.faint,
    fontSize: 15,
    marginTop: 32,
  },
});

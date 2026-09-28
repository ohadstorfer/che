import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
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

import { ArgentineHub } from '@/components/argentine-hub';
import { AppHeader, useStreakWeek } from '@/components/app-header';
import { playAudio } from '@/lib/audio';
import { usePackScores } from '@/lib/argentine-scores';
import { useAuth } from '@/lib/auth';
import { CONCEPT_LABELS, type ConceptScore, conceptScores, weakestConcept } from '@/lib/concepts';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { all } from '@/lib/fetch-all';
import { supabase } from '@/lib/supabase';
import { WORDS_SIZE, loadLexicon } from '@/lib/session';
import { clay, colors, font, gradients, pastel, press, radius } from '@/lib/theme';
import type { Form, FormState } from '@/lib/types';
import { FitText } from '@/components/fit-text';

// On web the press scale eases instead of snapping; native gets the snap.
const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

// ---------------------------------------------------------------------------
// Words — a practice hub in two halves.
//
// "My words" is everything the course has given her and nothing it hasn't: a
// round of her weakest words on top (practice.tsx, ?mode=words), then the
// words themselves with how settled each one is, and the sentences she has
// been shown. "Argentine" is vocabulary apart from the course — themed packs
// of words Argentines actually say (lib/argentine.ts).
// ---------------------------------------------------------------------------

type Hub = 'mine' | 'argentine';
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
  if (state.interval_days >= 21) return { label: 'solid', tone: 'strong' };
  if (state.interval_days >= 4) return { label: 'growing', tone: 'growing' };
  return { label: 'new', tone: 'new' };
}

export default function Words() {
  // The tabs' opaque `sceneStyle` (see (tabs)/_layout) covers the root
  // gradient, so this screen's actual background is flat `colors.bg`.
  useStatusBarColor(colors.bg);
  const { status: streak, weekDone } = useStreakWeek();
  const { profile } = useAuth();
  // `null` until the first fetch lands. An empty array would be a lie the
  // screen tells for as long as the round trip takes.
  const [words, setWords] = useState<WordRow[] | null>(null);
  const [sentences, setSentences] = useState<SentenceRow[] | null>(null);
  const [hub, setHub] = useState<Hub>('argentine');
  const [tab, setTab] = useState<Tab>('words');
  const [search, setSearch] = useState('');
  /** The grammar concept her recent answers say needs work, if any. */
  const [weak, setWeak] = useState<ConceptScore | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      Promise.all([
        // Paged (all): her states are past PostgREST's 1,000 rows; the lexicon is shared.
        all<FormState>(() => supabase.from('form_states').select('*').eq('user_id', profile.id).order('form_id')).then((data) => ({ data })),
        loadLexicon().then((data) => ({ data })),
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
        // Accuracy per concept over the last month of first tries (§12).
        supabase
          .from('review_logs')
          .select('form_id, correct, is_retry, reviewed_at')
          .eq('user_id', profile.id)
          .gte('reviewed_at', new Date(Date.now() - 30 * 86_400_000).toISOString())
          .then(({ data: logs }) => {
            const scores = conceptScores(
              (logs ?? []) as { form_id: string; correct: boolean | null; is_retry?: boolean }[],
              formById,
            );
            setWeak(weakestConcept(scores));
          });
      });
      // One query, the sentence embedded in her record of it. Sending her ids
      // back in an `in` list broke once she had seen a few hundred sentences
      // (the URL outgrew the gateway), and stopped silently at 1,000.
      all<{ sentence_id: string; last_shown_at: string | null; sentences: SentenceRow | null }>(() =>
        supabase
          .from('sentence_states')
          .select('sentence_id, last_shown_at, sentences(id, es, en, audio_path)')
          .eq('user_id', profile.id)
          .order('sentence_id'),
      )
        .then((shown) =>
          setSentences(
            shown
              .sort((a, b) => (b.last_shown_at ?? '').localeCompare(a.last_shown_at ?? ''))
              .flatMap((r) => (r.sentences ? [r.sentences] : [])),
          ),
        )
        .catch(() => setSentences([]));
    }, [profile]),
  );

  const q = search.trim().toLocaleLowerCase('es');
  const filteredWords = useMemo(
    () =>
      (words ?? []).filter(
        ({ form }) =>
          !q ||
          form.form.toLocaleLowerCase('es').includes(q) ||
          form.gloss_en.toLowerCase().includes(q) ||
          // "the drink" should find mate, the same as its gloss does.
          (form.gloss_note_en?.toLowerCase().includes(q) ?? false),
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

  const scores = usePackScores();

  const header = (
    <View style={{ gap: 14, paddingBottom: 10 }}>
      <PracticeCard count={words?.length ?? null} />
      {weak ? (
        <Pressable
          onPress={() => router.push(`/practice?mode=concept&concept=${encodeURIComponent(weak.concept)}`)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.needsWork, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
          <Ionicons name="fitness-outline" size={18} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.needsWorkTitle}>Needs work: {CONCEPT_LABELS[weak.concept] ?? weak.concept}</Text>
            <Text style={styles.needsWorkSub}>
              {Math.round(weak.accuracy * 100)}% right lately — practise just these
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </Pressable>
      ) : null}
      <View style={styles.listHead}>
        {(['words', 'sentences'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            hitSlop={6}
            style={({ pressed }) => [styles.pill, tab === t && styles.pillActive, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
            <Text style={[styles.pillText, tab === t && styles.pillTextActive]}>
              {t === 'words' ? `Words${words ? ` · ${words.length}` : ''}` : 'Sentences'}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search…"
        placeholderTextColor={colors.faint}
        style={styles.search}
      />
    </View>
  );

  return (
    <View style={styles.safe}>
      <AppHeader title="Words" status={streak} weekDone={weekDone} />
      <View style={styles.container}>

        <View style={styles.segment}>
          {(['argentine', 'mine'] as const).map((h) => (
            <Pressable
              key={h}
              onPress={() => setHub(h)}
              accessibilityRole="tab"
              accessibilityState={{ selected: hub === h }}
              style={({ pressed }) => [
                styles.segmentItem,
                hub === h && styles.segmentItemActive,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}>
              <Text style={[styles.segmentText, hub === h && styles.segmentTextActive]}>
                {h === 'mine' ? 'My words' : 'Argentine'}
              </Text>
            </Pressable>
          ))}
        </View>

        {hub === 'argentine' ? (
          <ArgentineHub scores={scores} />
        ) : tab === 'words' ? (
          <FlatList
            data={words == null ? [] : filteredWords}
            keyExtractor={(r) => r.form.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={header}
            contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
            ListEmptyComponent={
              words == null ? (
                <WordsSkeleton />
              ) : (
                <Text style={styles.empty}>
                  {words.length === 0
                    ? "You haven't learned any words yet. Start the first lesson on the path."
                    : 'Nothing matches.'}
                </Text>
              )
            }
            renderItem={({ item: { form, state } }) => {
              const s = strength(state);
              return (
                <View style={styles.row}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowTop}>
                      <FitText style={styles.es} lines={2}>
                        {form.form}
                      </FitText>
                      <Text
                        style={[
                          styles.strength,
                          s.tone === 'strong' && styles.strengthStrong,
                          s.tone === 'growing' && styles.strengthGrowing,
                        ]}>
                        {s.label}
                      </Text>
                    </View>
                    <FitText style={styles.en} lines={2}>
                      {form.gloss_en}
                    </FitText>
                    {form.gloss_note_en ? (
                      <FitText style={styles.enNote} lines={2}>
                        {form.gloss_note_en}
                      </FitText>
                    ) : null}
                  </View>
                  {form.audio_path ? <PlayButton path={form.audio_path} /> : null}
                </View>
              );
            }}
          />
        ) : (
          <FlatList
            data={sentences == null ? [] : filteredSentences}
            keyExtractor={(s) => s.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={header}
            contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
            ListEmptyComponent={
              sentences == null ? (
                <WordsSkeleton />
              ) : (
                <Text style={styles.empty}>
                  {sentences.length === 0 ? 'Sentences you meet in lessons show up here.' : 'Nothing matches.'}
                </Text>
              )
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
    </View>
  );
}

// ---------------------------------------------------------------------------
// PracticeCard — the one thing "My words" asks her to do: a round of the words
// she holds least well. It needs four words for its matching screens to mean
// anything, so before then it says what it is waiting for instead.
// ---------------------------------------------------------------------------
function PracticeCard({ count }: { count: number | null }) {
  const ready = (count ?? 0) >= 4;
  return (
    <Pressable
      onPress={() => router.push('/practice?mode=words')}
      disabled={!ready}
      accessibilityRole="button"
      accessibilityLabel="Practice your weakest words"
      style={({ pressed }) => [
        styles.practice,
        !ready && { opacity: 0.55, boxShadow: undefined },
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, styles.practiceFace]} pointerEvents="none" />
      <View style={styles.practiceIcon}>
        <Ionicons name="barbell" size={24} color={colors.onPrimary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.practiceTitle}>Practice your weakest words</Text>
        <Text style={styles.practiceSub}>
          {ready
            ? `${Math.min(count ?? 0, WORDS_SIZE)} words · meaning, listening, pairs`
            : 'Learn a few words on the path first'}
        </Text>
      </View>
      <View style={styles.practiceGo}>
        <Ionicons name="arrow-forward" size={22} color={colors.primary} />
      </View>
    </Pressable>
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
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      // Gone before the answer came: never start a loop nothing will stop.
      if (reduce || !alive) return;
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
    return () => {
      alive = false;
      loop?.stop();
    };
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

/** Soft white over the rosa action — the practice card's icon well and aside. */
const ON_ROSA_WELL = 'rgba(255, 255, 255, 0.18)';
const ON_ROSA_SUB = 'rgba(255, 255, 255, 0.85)';

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
  // A sunken well; the chosen half is a clay segment raised out of it.
  segment: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    borderRadius: 26,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    height: 44,
    borderRadius: 22,
  },
  segmentItemActive: { backgroundColor: colors.card, boxShadow: clay.surface },
  segmentText: { ...font.body[700], fontSize: 15, color: colors.muted },
  segmentTextActive: { ...font.body[800], color: colors.ink },
  search: {
    ...font.body[600],
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    boxShadow: clay.surface,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    boxShadow: clay.surface,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  es: { ...font.body[800], fontSize: 17, color: colors.ink, flexShrink: 1 },
  en: { ...font.body[600], fontSize: 14, color: colors.muted },
  enNote: { ...font.body[500], fontSize: 12, color: colors.muted, opacity: 0.85, fontStyle: 'italic' },
  strength: {
    ...font.body[800],
    fontSize: 11,
    color: colors.muted,
    backgroundColor: colors.trough,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  strengthGrowing: { color: colors.onPastel, backgroundColor: pastel.butter },
  strengthStrong: { color: colors.success, backgroundColor: colors.successSoft },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  bone: { height: 15, borderRadius: 7, backgroundColor: colors.stone },
  boneSmall: { height: 11, borderRadius: 5 },
  empty: { ...font.body[600], textAlign: 'center', color: colors.muted, fontSize: 15, marginTop: 32, lineHeight: 21 },
  listHead: { flexDirection: 'row', gap: 8, marginTop: 4 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
  },
  pillActive: { backgroundColor: colors.card, boxShadow: clay.surface },
  pillText: { ...font.body[700], fontSize: 14, color: colors.muted, fontVariant: ['tabular-nums'] },
  pillTextActive: { ...font.body[800], color: colors.ink },
  practice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  practiceFace: { borderRadius: radius.xl },
  practiceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ON_ROSA_WELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceTitle: { ...font.display[800], fontSize: 18, lineHeight: 21, color: colors.onPrimary },
  practiceSub: { ...font.body[600], fontSize: 13, color: ON_ROSA_SUB },
  practiceGo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needsWork: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  needsWorkTitle: { ...font.body[800], fontSize: 15, color: colors.ink },
  needsWorkSub: { ...font.body[600], fontSize: 13, color: colors.muted },
});

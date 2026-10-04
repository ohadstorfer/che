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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitText } from '@/components/fit-text';
import { playAudio } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { CONCEPT_LABELS, type ConceptScore, conceptScores, weakestConcept } from '@/lib/concepts';
import { all } from '@/lib/fetch-all';
import { goBack } from '@/lib/nav';
import { loadLexicon } from '@/lib/session';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, gradients, pastel, pastelGrad, press, radius } from '@/lib/theme';
import type { Form, FormState } from '@/lib/types';

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
// My words — everything the course has given her and nothing it hasn't,
// opened from Course's Review button. On top, how much she holds and how well;
// then a round of her weakest words (practice.tsx, ?mode=words); then the
// words themselves, each with a dot for how settled it is, and the sentences
// she has been shown.
// ---------------------------------------------------------------------------

type Tone = 'new' | 'growing' | 'strong';
type Filter = 'all' | Tone | 'sentences';

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

/** One line of the list, word or sentence. */
interface Row {
  key: string;
  es: string;
  en: string;
  note?: string | null;
  audio: string | null;
  tone?: Tone;
}

/** How settled a word is, in three steps a glance can read. */
function toneOf(state: FormState): Tone {
  if (state.interval_days >= 21) return 'strong';
  if (state.interval_days >= 4) return 'growing';
  return 'new';
}

const TONES: { tone: Tone; label: string; color: string }[] = [
  { tone: 'strong', label: 'Solid', color: colors.success },
  { tone: 'growing', label: 'Growing', color: pastel.butter },
  { tone: 'new', label: 'New', color: colors.border },
];
const TONE_COLOR = Object.fromEntries(TONES.map((t) => [t.tone, t.color])) as Record<Tone, string>;

export default function MyWords() {
  useStatusBarColor(colors.bg);
  const { profile } = useAuth();
  const bottom = useSafeAreaInsets().bottom;
  // `null` until the first fetch lands. An empty array would be a lie the
  // screen tells for as long as the round trip takes.
  const [words, setWords] = useState<WordRow[] | null>(null);
  const [sentences, setSentences] = useState<SentenceRow[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  /** The grammar concept her recent answers say needs work, if any. */
  const [weak, setWeak] = useState<ConceptScore | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      Promise.all([
        // Paged (all): her states are past PostgREST's 1,000 rows; the lexicon is shared.
        all<FormState>(() => supabase.from('form_states').select('*').eq('user_id', profile.id).order('form_id')),
        loadLexicon(),
      ]).then(([states, forms]) => {
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

  const counts = useMemo(() => {
    const c: Record<Tone, number> = { new: 0, growing: 0, strong: 0 };
    for (const w of words ?? []) c[toneOf(w.state)]++;
    return c;
  }, [words]);

  const onSentences = filter === 'sentences';
  const loading = onSentences ? sentences == null : words == null;
  const q = search.trim().toLocaleLowerCase('es');

  const rows = useMemo<Row[]>(() => {
    if (onSentences) {
      return (sentences ?? [])
        .filter((s) => !q || s.es.toLocaleLowerCase('es').includes(q) || s.en.toLowerCase().includes(q))
        .map((s) => ({ key: s.id, es: s.es, en: s.en, audio: s.audio_path }));
    }
    return (words ?? []).flatMap(({ form, state }) => {
      const tone = toneOf(state);
      if (filter !== 'all' && filter !== tone) return [];
      if (
        q &&
        !form.form.toLocaleLowerCase('es').includes(q) &&
        !form.gloss_en.toLowerCase().includes(q) &&
        // "the drink" should find mate, the same as its gloss does.
        !(form.gloss_note_en?.toLowerCase().includes(q) ?? false)
      )
        return [];
      return [{ key: form.id, es: form.form, en: form.gloss_en, note: form.gloss_note_en, audio: form.audio_path, tone }];
    });
  }, [onSentences, sentences, words, filter, q]);

  const total = words?.length ?? 0;
  const chips: { id: Filter; label: string; count: number | null }[] = [
    { id: 'all', label: 'All', count: words ? total : null },
    ...TONES.map((t) => ({ id: t.tone as Filter, label: t.label, count: words ? counts[t.tone] : null })),
    { id: 'sentences', label: 'Sentences', count: sentences ? sentences.length : null },
  ];

  const header = (
    <View style={styles.head}>
      <View style={styles.top}>
        <Text style={styles.title}>My words</Text>
        {/* It came up from the bottom, so it closes downward — not "back". */}
        <Pressable
          onPress={() => goBack('/home')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={({ pressed }) => [styles.close, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
          <Ionicons name="chevron-down" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <LinearGradient colors={pastelGrad.sage} style={[StyleSheet.absoluteFill, styles.statsFace]} pointerEvents="none" />
        <View style={styles.statsTop}>
          <Text style={styles.statsCount}>{words ? total : '–'}</Text>
          <Text style={styles.statsLabel}>{total === 1 ? 'word from the course' : 'words from the course'}</Text>
        </View>
        <View style={styles.statsPanel}>
        <View style={styles.bar}>
          {TONES.map((t) =>
            counts[t.tone] > 0 ? (
              <View key={t.tone} style={{ flexGrow: counts[t.tone], flexBasis: 0, minWidth: 6, backgroundColor: t.color }} />
            ) : null,
          )}
        </View>
        <View style={styles.legend}>
          {TONES.map((t) => (
            <View key={t.tone} style={{ flex: 1, gap: 1 }}>
              <Text style={styles.legendCount}>{words ? counts[t.tone] : '–'}</Text>
              <View style={styles.legendLabelRow}>
                <View style={[styles.dot, { backgroundColor: t.color }]} />
                <Text style={styles.legendLabel}>{t.label}</Text>
              </View>
            </View>
          ))}
        </View>
        </View>
        <PracticeButton count={words?.length ?? null} />
      </View>

      {weak ? (
        <Pressable
          onPress={() => router.push(`/practice?mode=concept&concept=${encodeURIComponent(weak.concept)}`)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.needsWork, { transform: [{ scale: pressed ? 0.98 : 1 }] }, webPress]}>
          <View style={styles.needsWorkIcon}>
            <Ionicons name="fitness-outline" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.needsWorkTitle}>Needs work: {CONCEPT_LABELS[weak.concept] ?? weak.concept}</Text>
            <Text style={styles.needsWorkSub}>{Math.round(weak.accuracy * 100)}% right lately · practise just these</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </Pressable>
      ) : null}

      {/* Bleeds to the screen's edges so the chips scroll under nothing. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}>
        {chips.map((c) => {
          const on = filter === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setFilter(c.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              hitSlop={{ top: 6, bottom: 6 }}
              style={({ pressed }) => [styles.chip, on && styles.chipOn, { transform: [{ scale: pressed ? 0.96 : 1 }] }, webPress]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {c.label}
                {c.count != null ? ` · ${c.count}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.faint} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search in Spanish or English"
          placeholderTextColor={colors.faint}
          accessibilityLabel="Search your words"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          style={styles.searchInput}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={loading ? [] : rows}
        keyExtractor={(r) => r.key}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        contentContainerStyle={[styles.container, { paddingBottom: bottom + 28 }]}
        ListEmptyComponent={
          loading ? (
            <WordsSkeleton />
          ) : (
            <Text style={styles.empty}>
              {q || (filter !== 'all' && !onSentences && total > 0)
                ? 'Nothing matches.'
                : onSentences
                  ? 'Sentences you meet in lessons show up here.'
                  : "You haven't learned any words yet. Start the first lesson on the path."}
            </Text>
          )
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.row,
              index === 0 && styles.rowFirst,
              index === rows.length - 1 && styles.rowLast,
            ]}>
            {item.tone ? <View style={[styles.dot, { backgroundColor: TONE_COLOR[item.tone] }]} /> : null}
            <View style={{ flex: 1, gap: 1 }}>
              {item.tone ? (
                <FitText style={styles.es} lines={2}>
                  {item.es}
                </FitText>
              ) : (
                <Text style={styles.es}>{item.es}</Text>
              )}
              <Text style={styles.en}>{item.en}</Text>
              {item.note ? <Text style={styles.enNote}>{item.note}</Text> : null}
            </View>
            {item.audio ? <PlayButton path={item.audio} label={item.es} /> : null}
            {index < rows.length - 1 ? <View style={styles.rowLine} /> : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// PracticeButton — the one thing the screen asks her to do, at the foot of
// the card that says how her words stand: a round of the ones she holds least
// well. It needs four words for its matching screens to mean anything, so
// before then it says what it is waiting for instead.
// ---------------------------------------------------------------------------
function PracticeButton({ count }: { count: number | null }) {
  const ready = (count ?? 0) >= 4;
  const label = ready ? 'Refresh weakest words' : 'Learn a few words first';
  return (
    <Pressable
      onPress={() => router.push('/practice?mode=words')}
      disabled={!ready}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.practice,
        !ready && { opacity: 0.55, boxShadow: undefined },
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, styles.practiceFace]} pointerEvents="none" />
      {ready ? <Ionicons name="refresh" size={20} color={colors.onPrimary} /> : null}
      <Text style={styles.practiceTitle}>{label}</Text>
    </Pressable>
  );
}

function PlayButton({ path, label }: { path: string; label: string }) {
  return (
    <Pressable
      onPress={() => playAudio(path)}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`Play ${label}`}
      style={({ pressed }) => [styles.playButton, { transform: [{ scale: pressed ? 0.9 : 1 }] }, webPress]}>
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
    <View accessibilityLabel="Loading words">
      {BONE_WIDTHS.map((width, i) => (
        <View
          key={i}
          style={[styles.row, i === 0 && styles.rowFirst, i === BONE_WIDTHS.length - 1 && styles.rowLast]}>
          <View style={{ flex: 1, gap: 9 }}>
            <Animated.View style={[styles.bone, { width, opacity }]} />
            <Animated.View style={[styles.bone, styles.boneSmall, { width: BONE_WIDTHS[(i + 3) % 6], opacity }]} />
          </View>
          {i < BONE_WIDTHS.length - 1 ? <View style={styles.rowLine} /> : null}
        </View>
      ))}
    </View>
  );
}

const GUTTER = 20;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: GUTTER, maxWidth: 560, width: '100%', alignSelf: 'center' },
  head: { gap: 14, paddingBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 2 },
  title: { ...font.display[800], fontSize: 34, letterSpacing: -0.5, color: colors.ink },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },

  // Stats — a salvia tile: the count on the clay, the breakdown in a white
  // panel so its three colors read, and the round's button at the foot. -------
  stats: { gap: 14, padding: 18, borderRadius: radius.xl, backgroundColor: pastel.sage, boxShadow: clay.surface },
  statsFace: { borderRadius: radius.xl },
  statsTop: { flexDirection: 'row', alignItems: 'baseline', gap: 7, paddingHorizontal: 2 },
  statsCount: { ...font.display[800], fontSize: 32, lineHeight: 34, letterSpacing: -0.8, color: colors.onPastel, fontVariant: ['tabular-nums'] },
  statsLabel: { ...font.body[700], fontSize: 15, color: 'rgba(58, 42, 32, 0.78)' },
  statsPanel: { gap: 12, padding: 14, borderRadius: 22, backgroundColor: colors.chip },
  // One pill cut into three.
  bar: {
    flexDirection: 'row',
    gap: 3,
    height: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.trough,
  },
  legend: { flexDirection: 'row', gap: 8 },
  legendCount: { ...font.body[800], fontSize: 18, color: colors.ink, fontVariant: ['tabular-nums'] },
  legendLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLabel: { ...font.body[600], fontSize: 13, color: colors.inkOnWash },
  dot: { width: 9, height: 9, borderRadius: 5 },

  // Practice -----------------------------------------------------------------
  practice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  practiceFace: { borderRadius: radius.pill },
  practiceTitle: { ...font.body[800], fontSize: 17, color: colors.onPrimary },
  needsWork: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  needsWorkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needsWorkTitle: { ...font.body[800], fontSize: 15, color: colors.ink },
  needsWorkSub: { ...font.body[600], fontSize: 13, color: colors.muted },

  // Filters ------------------------------------------------------------------
  chipsScroll: { marginHorizontal: -GUTTER, marginTop: 18, flexGrow: 0 },
  chips: { gap: 8, paddingHorizontal: GUTTER },
  chip: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
  },
  chipOn: { backgroundColor: colors.ink },
  chipText: { ...font.body[700], fontSize: 14, color: colors.muted, fontVariant: ['tabular-nums'] },
  chipTextOn: { ...font.body[800], color: colors.card },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  searchInput: { ...font.body[600], flex: 1, alignSelf: 'stretch', fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object,

  // List — one clay slab. Each row carries the slab's drop shadow and the row
  // under it covers it, so only the last one's shows. ------------------------
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 62,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 10,
    backgroundColor: colors.card,
    boxShadow: '0 10px 22px -10px rgba(120,70,40,0.35)',
  },
  rowFirst: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingTop: 12 },
  rowLast: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, paddingBottom: 12 },
  rowLine: {
    position: 'absolute',
    left: 16,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  es: { ...font.body[800], fontSize: 17, color: colors.ink },
  en: { ...font.body[600], fontSize: 14, color: colors.muted },
  enNote: { ...font.body[500], fontSize: 12, color: colors.muted, opacity: 0.85, fontStyle: 'italic' },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  bone: { height: 15, borderRadius: 7, backgroundColor: colors.stone },
  boneSmall: { height: 11, borderRadius: 5 },
  empty: { ...font.body[600], textAlign: 'center', color: colors.muted, fontSize: 15, marginTop: 28, lineHeight: 21 },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { type ArWord, findPack, findTheme, knownIn, loadCourseWords, packsOf } from '@/lib/argentine';
import { usePackScores } from '@/lib/argentine-scores';
import { useAuth } from '@/lib/auth';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// One Argentine pack (?pack=<slug>), just before she plays it: what it is, how
// she did last time, and every word in it — a tap opens a word's note and its
// example. Words the course has already taught her are marked "known" and
// left out of the play. The button stays pinned at the bottom, however long
// the list, so starting is always one tap.
// ---------------------------------------------------------------------------

/** How common a pack's words are, said the way a learner would. */
function levelLabel(words: ArWord[]) {
  const avg = words.reduce((n, w) => n + w.level, 0) / Math.max(words.length, 1);
  return avg <= 1.2 ? 'Everyone says these' : avg <= 1.8 ? 'Common words' : 'Less common words';
}

export default function ArgentinePack() {
  useStatusBarColor(colors.bg);
  const { pack: slug } = useLocalSearchParams<{ pack?: string }>();
  const pack = slug ? findPack(slug) : null;
  const { profile } = useAuth();
  const scores = usePackScores();
  const bottom = useSafeAreaInsets().bottom;
  const [known, setKnown] = useState<Set<string> | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    loadCourseWords(profile.id)
      .then(setKnown)
      .catch(() => setKnown(new Set()));
  }, [profile?.id]);

  if (!pack) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This pack doesn't exist.</Text>
          <Button title="Back to words" onPress={() => router.dismissTo('/words')} />
        </View>
      </SafeAreaView>
    );
  }

  const theme = findTheme(pack.theme);
  const siblings = packsOf(pack.theme);
  const score = scores[pack.slug];
  const isKnown = (w: ArWord) => !!known && knownIn(known, w);
  const knownCount = pack.words.filter(isKnown).length;
  const toLearn = pack.words.length - knownCount;
  // A first play teaches every word and asks each one about twice; a replay
  // is quicker. Roughly twenty and ten seconds a word.
  const minutes = Math.max(1, Math.round((toLearn * (score ? 10 : 20)) / 60));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => goBack(`/argentine-theme?theme=${pack.theme}`)}
          hitSlop={10}
          accessibilityLabel="Back"
          style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.muted} />
          <Text style={styles.backText}>{theme?.title ?? 'Argentine'}</Text>
        </Pressable>

        <View style={{ gap: 10 }}>
          {siblings.length > 1 ? (
            <Text style={styles.eyebrow}>
              Pack {siblings.indexOf(pack) + 1} of {siblings.length}
            </Text>
          ) : null}
          <Text style={styles.title}>{siblings.length > 1 ? pack.name : pack.title}</Text>
          <View style={styles.chips}>
            {pack.vulgar ? <Text style={[styles.chip, styles.chipAdult]}>18+ · Rude words</Text> : null}
            <Text style={styles.chip}>{toLearn} new words</Text>
            {knownCount ? <Text style={styles.chip}>{knownCount} you know</Text> : null}
            <Text style={styles.chip}>{levelLabel(pack.words)}</Text>
            {score ? <Text style={styles.chip}>Best {score.best}%</Text> : null}
          </View>
        </View>

        <View style={styles.list}>
          {pack.words.map((w, i) => {
            const expanded = open === w.id;
            const wordKnown = isKnown(w);
            return (
              <Pressable
                key={w.id}
                onPress={() => setOpen(expanded ? null : w.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityHint="Shows how the word is used"
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && styles.rowRule,
                  expanded && styles.rowOpen,
                  pressed && !expanded && { backgroundColor: colors.bg },
                ]}>
                <View style={styles.rowTop}>
                  <View style={styles.rowWord}>
                    <Text style={[styles.es, expanded && styles.esOpen, wordKnown && styles.dim]}>{w.es}</Text>
                    {wordKnown ? <Text style={styles.known}>known</Text> : null}
                  </View>
                  <FitText
                    style={[styles.en, expanded && styles.enOpen, wordKnown && styles.dim]}
                    lines={expanded ? 2 : 1}>
                    {w.en}
                  </FitText>
                </View>
                {expanded ? (
                  <View style={{ gap: 10 }}>
                    <Text style={styles.note}>{w.note}</Text>
                    <View style={styles.example}>
                      <Text style={styles.exEs}>
                        <Highlighted text={w.example.es} part={w.gap} />
                      </Text>
                      <Text style={styles.exEn}>{w.example.en}</Text>
                    </View>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: 16 + bottom }]}>
        <Button
          title={toLearn === 0 ? 'You know all of these' : score ? 'Practice again' : `Learn ${toLearn} words`}
          onPress={() => router.push(`/argentine-round?pack=${pack.slug}${score ? '' : '&first=1'}`)}
          disabled={toLearn === 0 || known === null}
        />
        <Text style={styles.dockNote}>
          About {minutes} {minutes === 1 ? 'minute' : 'minutes'} · tap a word to see how it's used
        </Text>
      </View>
    </SafeAreaView>
  );
}

/** The example with the word itself set in bold. */
function Highlighted({ text, part }: { text: string; part: string }) {
  const at = text.toLocaleLowerCase('es').indexOf(part.toLocaleLowerCase('es'));
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <Text style={styles.exWord}>{text.slice(at, at + part.length)}</Text>
      {text.slice(at + part.length)}
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingTop: 12, gap: 18, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', minHeight: 44, marginLeft: -6 },
  backText: { ...font.body[700], fontSize: 15, color: colors.muted },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  missingText: { ...font.body[600], fontSize: 16, color: colors.muted },

  eyebrow: { ...font.body[800], fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.primary },
  title: { ...font.display[800], fontSize: 32, lineHeight: 36, letterSpacing: -0.5, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    ...font.body[800],
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
    fontVariant: ['tabular-nums'],
  },
  chipAdult: { color: colors.card, backgroundColor: colors.dangerInk },

  list: { borderRadius: radius.lg, backgroundColor: colors.card, overflow: 'hidden', boxShadow: clay.surface },
  row: { minHeight: 52, paddingHorizontal: 16, paddingVertical: 14, gap: 10, justifyContent: 'center' },
  rowRule: { borderTopWidth: 1, borderTopColor: colors.stone },
  rowOpen: { backgroundColor: colors.bg },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  rowWord: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  es: { ...font.body[700], fontSize: 17, color: colors.ink, flexShrink: 1 },
  esOpen: { ...font.display[800], fontSize: 20 },
  en: { ...font.body[600], fontSize: 15, color: colors.muted, flexShrink: 1, textAlign: 'right' },
  enOpen: { ...font.body[700], color: colors.primary },
  dim: { opacity: 0.5 },
  known: {
    ...font.body[800],
    fontSize: 11,
    color: colors.success,
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  note: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.ink, opacity: 0.8 },
  example: { gap: 2, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: colors.stone },
  exEs: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.ink },
  exWord: { ...font.body[800], color: colors.primary },
  exEn: { ...font.body[500], fontSize: 13, lineHeight: 18, fontStyle: 'italic', color: colors.muted },

  dock: {
    gap: 8,
    paddingTop: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  dockNote: { ...font.body[600], textAlign: 'center', fontSize: 13, color: colors.muted },
});

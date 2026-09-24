import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { classMinutes, cultureSections, sectionTone, splitTitle, useCultureDone } from '@/lib/culture';
import { tileArt } from '@/lib/culture-art';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, fonts, press, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// One culture subject: a hero in the subject's own tone, then its classes as a
// short path. Nothing is locked — the path only suggests an order — but the
// first class she hasn't finished is marked "Up next" and carries the one
// primary button on the screen, so there is never a question of where to tap.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

export default function CultureSectionScreen() {
  useStatusBarColor(colors.bg);
  const { section: slug } = useLocalSearchParams<{ section?: string }>();
  const section = cultureSections.find((s) => s.slug === slug);
  const isDone = useCultureDone();

  if (!section) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This subject doesn't exist.</Text>
          <Button title="Back to culture" onPress={() => router.replace('/culture')} />
        </View>
      </SafeAreaView>
    );
  }

  const tone = sectionTone(section.slug);
  const { eyebrow, title } = splitTitle(section.title);
  const total = section.classes.length;
  const done = section.classes.filter((c) => isDone(section.slug, c.slug)).length;
  const minutes = section.classes.reduce((n, c) => n + classMinutes(c), 0);
  const nextIndex = section.classes.findIndex((c) => !isDone(section.slug, c.slug));
  const open = (cls: string) => router.push(`/culture-class?section=${section.slug}&class=${cls}`);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => goBack('/culture')}
          hitSlop={10}
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={[styles.hero, { backgroundColor: tone.bg }]}>
          <Image
            source={tileArt(section.slug, cultureSections.indexOf(section))}
            style={styles.heroArt}
            contentFit="contain"
            accessible={false}
          />
          {eyebrow ? <Text style={[styles.eyebrow, { color: tone.sub }]}>{eyebrow}</Text> : null}
          <Text style={[styles.heroTitle, { color: tone.ink }]}>{title}</Text>
          <Text style={[styles.heroSummary, { color: tone.sub }]}>{section.summary}</Text>

          <View style={styles.stats}>
            <Stat tone={tone} icon="albums-outline" label={`${total} classes`} />
            <Stat tone={tone} icon="time-outline" label={`~${minutes} min`} />
            {done > 0 ? <Stat tone={tone} icon="checkmark-circle-outline" label={`${done} done`} /> : null}
          </View>
          {done > 0 ? (
            <View style={[styles.track, { backgroundColor: tone.track }]}>
              <View style={[styles.fill, { backgroundColor: tone.fill, width: `${(done / total) * 100}%` }]} />
            </View>
          ) : null}
        </View>

        <View>
          {section.classes.map((cls, i) => {
            const finished = isDone(section.slug, cls.slug);
            const next = i === nextIndex;
            const last = i === total - 1;
            return (
              <View key={cls.slug} style={styles.step}>
                {/* The rail: a node per class and a line down to the next one. */}
                <View style={styles.rail}>
                  <View style={[styles.node, finished && styles.nodeDone, next && styles.nodeNext]}>
                    {finished ? (
                      <Ionicons name="checkmark" size={18} color={colors.accent} />
                    ) : (
                      <Text style={[styles.nodeText, next && { color: colors.onPrimary }]}>{i + 1}</Text>
                    )}
                  </View>
                  {!last ? <View style={[styles.line, finished && styles.lineDone]} /> : null}
                </View>

                <Pressable
                  onPress={() => open(cls.slug)}
                  accessibilityRole="button"
                  accessibilityLabel={`${cls.title}${finished ? ', done' : ''}`}
                  style={({ pressed }) => [
                    styles.card,
                    next && styles.cardNext,
                    { transform: [{ scale: pressed ? press.scale : 1 }] },
                    webPress,
                  ]}>
                  {next ? <Text style={styles.upNext}>{done === 0 ? 'Start here' : 'Up next'}</Text> : null}
                  <Text style={styles.cardTitle}>{cls.title}</Text>
                  <Text style={styles.cardSummary}>{cls.summary}</Text>
                  <View style={styles.cardFoot}>
                    <Text style={styles.meta}>
                      {classMinutes(cls)} min · {cls.vocabulary.length} words
                    </Text>
                    {finished ? <Text style={styles.again}>Read again</Text> : null}
                  </View>
                  {next ? (
                    <View style={{ marginTop: 6 }}>
                      <Button title="Start" onPress={() => open(cls.slug)} small />
                    </View>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  tone,
  icon,
  label,
}: {
  tone: ReturnType<typeof sectionTone>;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={15} color={tone.sub} />
      <Text style={[styles.statText, { color: tone.ink }]}>{label}</Text>
    </View>
  );
}

const NODE = 32;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  missingText: { fontSize: 17, color: colors.muted },
  container: { padding: 20, paddingTop: 8, gap: 22, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 48 },

  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -8,
    ...shadow.card,
  },

  hero: { borderRadius: radius.xl, padding: 22, paddingTop: 24, gap: 6, overflow: 'hidden', minHeight: 230, justifyContent: 'flex-end' },
  heroArt: { position: 'absolute', right: 8, top: 10, width: 136, height: 170 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  heroTitle: { fontFamily: fonts.display, fontSize: 34, lineHeight: 37, letterSpacing: -0.8, maxWidth: '62%' },
  heroSummary: { fontSize: 16, lineHeight: 22, maxWidth: '62%' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  track: { height: 6, borderRadius: radius.pill, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%', borderRadius: radius.pill },

  step: { flexDirection: 'row', gap: 14 },
  rail: { width: NODE, alignItems: 'center' },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  // A finished class is a stamp in her passport: terracotta ink, the way the class ends.
  nodeDone: { backgroundColor: colors.accentSoft, borderColor: colors.accent, borderWidth: 2.5 },
  nodeNext: { backgroundColor: colors.primary, borderColor: colors.primary },
  nodeText: { fontSize: 14, fontWeight: '700', color: colors.muted, fontVariant: ['tabular-nums'] },
  line: { flex: 1, width: 2, marginVertical: 4, borderRadius: 1, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.accent },

  card: {
    flex: 1,
    marginBottom: 12,
    padding: 16,
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardNext: { borderColor: colors.primary, borderWidth: 1.5 },
  upNext: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, letterSpacing: -0.2 },
  cardSummary: { fontSize: 14, lineHeight: 20, color: colors.muted },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  meta: { fontSize: 13, color: colors.faint, fontWeight: '600', fontVariant: ['tabular-nums'] },
  again: { fontSize: 13, color: colors.primary, fontWeight: '600' },
});

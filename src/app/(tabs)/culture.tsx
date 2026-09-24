import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenTitle } from '@/components/ui';
import { type CultureSection, cultureSections, sectionTone, splitTitle, useCultureDone } from '@/lib/culture';
import { tileArt } from '@/lib/culture-art';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, fonts, gradients, press, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Culture — one tile per subject, and nothing else. The classes live one tap
// further in (culture-section); here she only picks what she's in the mood for.
//
// A subject she has started puts a "Keep going" card on top, so the next class
// is one tap away instead of two.
//
// Tiles sit two to a row; an odd one out at the end takes the full width
// rather than leaving a hole. The three tones are dealt in order, so the grid
// reads as a checkerboard and no two neighbours share a colour.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

export default function Culture() {
  useStatusBarColor(colors.bg);
  const isDone = useCultureDone();

  // The first subject she has started but not finished, and its next class.
  const resume = cultureSections.flatMap((section, i) => {
    const doneCount = section.classes.filter((c) => isDone(section.slug, c.slug)).length;
    const next = section.classes.find((c) => !isDone(section.slug, c.slug));
    return doneCount > 0 && next ? [{ section, next, index: i, number: section.classes.indexOf(next) + 1 }] : [];
  })[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <ScreenTitle>Culture</ScreenTitle>
          <Text style={styles.lede}>The things nobody puts in a grammar book.</Text>
        </View>

        {resume ? <Resume {...resume} /> : null}

        <View style={styles.grid}>
          {cultureSections.map((section, i) => {
            const wide = i === cultureSections.length - 1 && cultureSections.length % 2 === 1;
            const done = section.classes.filter((c) => isDone(section.slug, c.slug)).length;
            return <Tile key={section.slug} section={section} index={i} done={done} wide={wide} />;
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Resume({ section, next, index, number }: { section: CultureSection; next: CultureSection['classes'][number]; index: number; number: number }) {
  return (
    <Pressable
      onPress={() => router.push(`/culture-class?section=${section.slug}&class=${next.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`Keep going: ${section.title}, ${next.title}`}
      style={({ pressed }) => [styles.resume, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
      <View style={styles.resumeArt}>
        <Image source={tileArt(section.slug, index)} style={styles.resumeImage} contentFit="contain" accessible={false} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.resumeEyebrow}>Keep going</Text>
        <Text style={styles.resumeTitle} numberOfLines={2}>
          {section.title} · {next.title}
        </Text>
        <Text style={styles.resumeMeta}>
          Class {number} of {section.classes.length}
        </Text>
      </View>
      <View style={styles.resumeGo}>
        <Ionicons name="arrow-forward" size={22} color={colors.primary} />
      </View>
    </Pressable>
  );
}

function Tile({ section, index, done, wide }: { section: CultureSection; index: number; done: number; wide: boolean }) {
  const tone = sectionTone(section.slug);
  const { eyebrow, title } = splitTitle(section.title);
  const total = section.classes.length;
  const started = done > 0;

  return (
    <Pressable
      onPress={() => router.push(`/culture-section?section=${section.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`${section.title}, ${total} classes${started ? `, ${done} done` : ''}`}
      style={({ pressed }) => [
        styles.tile,
        wide && styles.tileWide,
        { backgroundColor: tone.bg, transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      {/* The emoji is the tile's picture: big, tipped, and cropped by the corner
          so it reads as art rather than as an icon sitting in a box. */}
      <Image source={tileArt(section.slug, index)} style={[styles.art, wide && styles.artWide]} contentFit="contain" accessible={false} />

      <View style={[styles.tileText, wide && { maxWidth: '68%', marginTop: 0 }]}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: tone.sub }]}>{eyebrow}</Text> : null}
        <Text style={[styles.tileTitle, { color: tone.ink }]} numberOfLines={3}>
          {title}
        </Text>
      </View>

      <View style={styles.tileFoot}>
        <Text style={[styles.count, { color: tone.sub }]}>
          {done === total ? 'All done ✓' : started ? `${done} of ${total} done` : `${total} classes`}
        </Text>
        {started ? (
          <View style={[styles.track, { backgroundColor: tone.track }]}>
            <View style={[styles.fill, { backgroundColor: tone.fill, width: `${(done / total) * 100}%` }]} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 22, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  head: { gap: 4 },
  lede: { fontSize: 16, color: colors.muted },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '46%', // two per row; flexGrow shares out the rest of the row
    flexGrow: 1,
    minHeight: 196,
    borderRadius: radius.xl,
    padding: 16,
    paddingTop: 18,
    overflow: 'hidden',
    // Name, count and progress stack at the foot of the tile; the picture owns the top.
    justifyContent: 'flex-end',
  },
  tileWide: { width: '100%', minHeight: 150 },
  art: {
    position: 'absolute',
    right: -8,
    top: -4,
    width: 96,
    height: 120,
    transform: [{ rotate: '-8deg' }],
  },
  artWide: { right: 12, top: 14, width: 120, height: 140 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
  },
  resumeArt: { width: 64, height: 64, borderRadius: 32, backgroundColor: gradients.tile[0], overflow: 'hidden', alignItems: 'center' },
  resumeImage: { width: 60, height: 76, marginTop: 6 },
  resumeEyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: gradients.tile[1] },
  resumeTitle: { fontFamily: fonts.displayMedium, fontSize: 17, lineHeight: 21, color: colors.onPrimary },
  resumeMeta: { fontSize: 13, color: 'rgba(241, 238, 230, 0.7)' },
  resumeGo: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.onPrimary, alignItems: 'center', justifyContent: 'center' },
  tileText: { gap: 3, maxWidth: '100%' },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  tileTitle: { fontFamily: fonts.displayMedium, fontSize: 19, lineHeight: 23, letterSpacing: -0.3 },
  tileFoot: { gap: 7, marginTop: 8 },
  count: { fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  track: { height: 5, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader, useStreakWeek } from '@/components/app-header';
import { type CultureSection, cultureSections, sectionTone, splitTitle, useCultureDone } from '@/lib/culture';
import { tileArt } from '@/lib/culture-art';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, gradients, pastelGrad, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// Culture — one tile per subject, and nothing else. The classes live one tap
// further in (culture-section); here she only picks what she's in the mood for.
//
// A subject she has started puts a peach "continue" card on top, so the next
// class is one tap away instead of two.
//
// Tiles sit two to a row; an odd one out at the end takes the full width
// rather than leaving a hole. The five pastel tones are dealt in order, so no
// two neighbours — beside or above — share a colour.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

/** The tile art's drop shadow: iOS shades the image's own alpha, the rest take a CSS filter. */
const artShadow = (
  Platform.OS === 'ios'
    ? { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } }
    : { filter: 'drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.18))' }
) as object;

export default function Culture() {
  useStatusBarColor(colors.bg);
  const { status: streak, weekDone } = useStreakWeek();
  const isDone = useCultureDone();

  // The first subject she has started but not finished, and its next class.
  const resume = cultureSections.flatMap((section, i) => {
    const doneCount = section.classes.filter((c) => isDone(section.slug, c.slug)).length;
    const next = section.classes.find((c) => !isDone(section.slug, c.slug));
    return doneCount > 0 && next ? [{ section, next, index: i, number: section.classes.indexOf(next) + 1 }] : [];
  })[0];

  return (
    <View style={styles.safe}>
      <AppHeader title="Culture" status={streak} weekDone={weekDone} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* What this tab is: the country around the language. */}
        <View style={styles.introBlock}>
          <Text style={styles.kicker}>Beyond the language</Text>
          <Text style={styles.heading} accessibilityRole="header">
            Get to know Argentina
          </Text>
          <Text style={styles.intro}>Learn about Argentine culture.</Text>
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
    </View>
  );
}

function Resume({ section, next, index, number }: { section: CultureSection; next: CultureSection['classes'][number]; index: number; number: number }) {
  const { eyebrow, title } = splitTitle(section.title);
  return (
    <Pressable
      onPress={() => router.push(`/culture-class?section=${section.slug}&class=${next.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`Keep going: ${section.title}, ${next.title}`}
      style={({ pressed }) => [styles.resume, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
      <LinearGradient colors={pastelGrad.peach} style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]} pointerEvents="none" />
      {/* The art sits on a soft white pod, half off the right edge. */}
      <View style={styles.pod} pointerEvents="none" />
      <Image source={tileArt(section.slug, index)} style={styles.resumeImage} contentFit="contain" accessible={false} />
      <View style={styles.resumeText}>
        <FitText style={styles.resumeLabel} lines={1}>
          {eyebrow ?? title} · Class {number} of {section.classes.length}
        </FitText>
        <FitText style={styles.resumeTitle} lines={2}>
          {next.title}
        </FitText>
      </View>
      <View style={styles.resumeGo}>
        <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, { borderRadius: 24 }]} pointerEvents="none" />
        <Text style={styles.resumeGoText}>Continue</Text>
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
      {/* The subject's object, tucked in the top corner with a shadow of its own. */}
      <Image source={tileArt(section.slug, index)} style={[styles.art, artShadow]} contentFit="contain" accessible={false} />

      <View style={styles.tileText}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: tone.ink }]}>{eyebrow}</Text> : null}
        <FitText style={[styles.tileTitle, { color: tone.ink }]} lines={3}>
          {title}
        </FitText>
        <View style={styles.tileFoot}>
          <View style={styles.track}>
            <View style={[styles.fill, { backgroundColor: tone.fill, width: `${(done / total) * 100}%` }]} />
          </View>
          <Text style={[styles.count, { color: tone.ink }]}>
            {done === total ? 'All done ✓' : started ? `${done} of ${total} done` : `${total} classes`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingTop: 14, gap: 18, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  introBlock: { gap: 6, paddingHorizontal: 2, paddingTop: 4 },
  /** Durazno, darkened until it reads as text on the oat. */
  kicker: { ...font.body[800], fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: '#A8502C' },
  heading: { ...font.display[800], fontSize: 40, lineHeight: 42, letterSpacing: -1, color: colors.ink },
  intro: { ...font.body[600], fontSize: 16, lineHeight: 22, color: colors.muted },

  resume: {
    height: 188,
    borderRadius: radius.xl,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: pastelGrad.peach[1],
    boxShadow: clay.surface,
  },
  pod: {
    position: 'absolute',
    right: -24,
    top: 18,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.pod,
    boxShadow: clay.surface,
  },
  resumeImage: { position: 'absolute', right: -4, bottom: -14, width: 150, height: 150 },
  resumeText: { gap: 4, maxWidth: 180 },
  resumeLabel: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8 },
  resumeTitle: { ...font.display[800], fontSize: 28, lineHeight: 29, letterSpacing: -0.4, color: colors.onPastel },
  resumeGo: {
    alignSelf: 'flex-start',
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  resumeGoText: { ...font.body[800], fontSize: 16, color: colors.onPrimary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '46%', // two per row; flexGrow shares out the rest of the row
    flexGrow: 1,
    minHeight: 124,
    borderRadius: 30,
    padding: 14,
    paddingTop: 66, // clears the art in the corner
    overflow: 'hidden',
    // Name and progress stack at the foot of the tile; the picture owns the top.
    justifyContent: 'flex-end',
    boxShadow: clay.surface,
  },
  tileWide: { width: '100%' },
  art: { position: 'absolute', right: 6, top: 8, width: 84, height: 62 },
  tileText: { gap: 6, maxWidth: '100%' },
  eyebrow: { ...font.body[800], fontSize: 12, opacity: 0.8, marginBottom: -4 },
  tileTitle: { ...font.display[800], fontSize: 18, lineHeight: 20 },
  tileFoot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { ...font.body[800], fontSize: 12, fontVariant: ['tabular-nums'] },
  track: { flex: 1, height: 8, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.trough, boxShadow: clay.trough },
  fill: { height: '100%', borderRadius: 6 },
});

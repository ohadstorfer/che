import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { type ArPack, findTheme, packTone, packsOf } from '@/lib/argentine';
import { themeObject } from '@/lib/argentine-art';
import { MASTERED, type PackScore, usePackScores } from '@/lib/argentine-scores';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { type PastelName, clay, colors, font, pastel, pastelGrad, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// One Argentine theme (?theme=<slug>): its packs as a short path, easiest
// first. Nothing is locked — any pack opens — but the first one she hasn't
// played is "Up next" and carries the screen's one button, so there is never
// a question of where to tap. The rail fills in as she goes.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

/** The pastel gradient behind a flat tone, so the hero is molded like the tiles. */
function gradOf(bg: string) {
  const name = (Object.keys(pastelGrad) as PastelName[]).find((k) => pastel[k] === bg);
  return name ? pastelGrad[name] : ([bg, bg] as const);
}

type Status = 'mastered' | 'played' | 'next' | 'new';

function statusOf(score: PackScore | undefined, isNext: boolean): Status {
  if (score) return score.best >= MASTERED ? 'mastered' : 'played';
  return isNext ? 'next' : 'new';
}

export default function ArgentineTheme() {
  useStatusBarColor(colors.bg);
  const { theme: slug } = useLocalSearchParams<{ theme?: string }>();
  const theme = slug ? findTheme(slug) : null;
  const scores = usePackScores();

  if (!theme) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This theme doesn't exist.</Text>
          <Button title="Back to words" onPress={() => router.dismissTo('/words')} />
        </View>
      </SafeAreaView>
    );
  }

  const packs = packsOf(theme.slug);
  const tone = packTone(theme.slug);
  const words = packs.reduce((n, p) => n + p.words.length, 0);
  const next = packs.find((p) => !scores[p.slug]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => goBack('/words')} hitSlop={10} accessibilityLabel="Back" style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.muted} />
          <Text style={styles.backText}>Argentine</Text>
        </Pressable>

        <View style={styles.hero}>
          <LinearGradient colors={gradOf(tone.bg)} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <View style={styles.heroPod} />
          <Image source={themeObject(theme.slug)} style={styles.heroArt} contentFit="contain" accessible={false} />
          <Text style={[styles.heroEyebrow, { color: tone.ink }]}>
            {packs.length === 1 ? '1 pack' : `${packs.length} packs`} · {words} words
          </Text>
          <Text style={[styles.heroTitle, { color: tone.ink }]}>{theme.title}</Text>
          <Text style={[styles.heroAbout, { color: tone.ink }]}>{theme.about}</Text>
        </View>

        <View>
          {packs.map((pack, i) => (
            <Step
              key={pack.slug}
              pack={pack}
              number={i + 1}
              score={scores[pack.slug]}
              status={statusOf(scores[pack.slug], pack === next)}
              last={i === packs.length - 1}
              // The rail below a step is filled once she has played it.
              railDone={!!scores[pack.slug]}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({
  pack,
  number,
  score,
  status,
  last,
  railDone,
}: {
  pack: ArPack;
  number: number;
  score?: PackScore;
  status: Status;
  last: boolean;
  railDone: boolean;
}) {
  const open = () => router.push(`/argentine-pack?pack=${pack.slug}`);
  const preview = pack.words.map((w) => w.es);

  return (
    <View style={styles.step}>
      <View style={styles.rail}>
        <Marker status={status} number={number} score={score} />
        {last ? null : <View style={[styles.railLine, railDone && styles.railLineDone]} />}
      </View>

      {status === 'next' ? (
        <View style={styles.nextCard}>
          <View style={{ gap: 3 }}>
            <Text style={styles.nextEyebrow}>Up next</Text>
            <Text style={styles.nextTitle}>{pack.name}</Text>
            <FitText style={styles.stepWords} lines={1}>
              {preview.slice(0, 4).join(' · ')}
              {preview.length > 4 ? ` · +${preview.length - 4}` : ''}
            </FitText>
          </View>
          <Button title={`Start · ${pack.words.length} words`} onPress={open} />
        </View>
      ) : (
        <Pressable
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={`${pack.name}${score ? `, best ${score.best}%` : ', new'}`}
          style={({ pressed }) => [styles.stepBody, { transform: [{ scale: pressed ? 0.98 : 1 }] }, webPress]}>
          <View style={styles.stepTop}>
            <Text style={styles.stepTitle}>{pack.name}</Text>
            <Chip status={status} score={score} />
          </View>
          <FitText style={styles.stepWords} lines={1}>
            {preview.slice(0, 4).join(' · ')}
          </FitText>
        </Pressable>
      )}
    </View>
  );
}

/** The circle on the rail: a check once mastered, her best score once
 *  played, a lit outline for the next one, a plain number otherwise. */
function Marker({ status, number, score }: { status: Status; number: number; score?: PackScore }) {
  if (status === 'mastered') {
    return (
      <View style={[styles.marker, styles.markerDone]}>
        <Ionicons name="checkmark" size={22} color={colors.onPastel} />
      </View>
    );
  }
  if (status === 'played' && score) {
    return (
      <View style={[styles.marker, styles.markerPlayed]}>
        <Text style={styles.ringText}>{score.best}</Text>
      </View>
    );
  }
  if (status === 'next') {
    return (
      <View style={[styles.marker, styles.markerNext]}>
        <Text style={[styles.markerText, { color: colors.primary }]}>{number}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.marker, styles.markerNew]}>
      <Text style={styles.markerText}>{number}</Text>
    </View>
  );
}

function Chip({ status, score }: { status: Status; score?: PackScore }) {
  if (status === 'mastered' && score) return <Text style={[styles.chip, styles.chipGood]}>Mastered · {score.best}%</Text>;
  if (status === 'played' && score) return <Text style={[styles.chip, styles.chipWarm]}>{score.best}% · replay</Text>;
  return <Text style={[styles.chip, styles.chipNew]}>New</Text>;
}

const MARKER = 40;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingTop: 12, gap: 18, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', minHeight: 44, marginLeft: -6 },
  backText: { ...font.body[700], fontSize: 15, color: colors.muted },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  missingText: { ...font.body[600], fontSize: 16, color: colors.muted },

  hero: {
    minHeight: 176,
    borderRadius: radius.xl,
    padding: 20,
    gap: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    boxShadow: clay.surface,
  },
  heroPod: { position: 'absolute', right: -6, top: 14, width: 132, height: 132, borderRadius: 66, backgroundColor: colors.pod },
  heroArt: { position: 'absolute', right: 10, top: 18, width: 124, height: 124, transform: [{ rotate: '-6deg' }] },
  heroEyebrow: { ...font.body[800], fontSize: 13, opacity: 0.8 },
  heroTitle: { ...font.display[800], fontSize: 30, lineHeight: 32, letterSpacing: -0.5, maxWidth: '68%' },
  heroAbout: { ...font.body[600], opacity: 0.85, fontSize: 14, lineHeight: 19, maxWidth: '62%' },

  step: { flexDirection: 'row', gap: 14 },
  rail: { width: MARKER, alignItems: 'center' },
  railLine: { width: 4, flex: 1, minHeight: 14, borderRadius: 2, backgroundColor: colors.trough },
  railLineDone: { backgroundColor: pastel.butter },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  markerDone: { backgroundColor: pastel.butter, boxShadow: clay.surface },
  markerNew: { backgroundColor: colors.stone, boxShadow: clay.flat },
  markerNext: {
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.primary,
    boxShadow: `0 0 0 5px ${colors.primarySoft}, ${clay.surface}`,
  },
  markerPlayed: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.primary, boxShadow: clay.surface },
  markerText: { ...font.display[800], fontSize: 15, color: colors.muted },
  ringText: { ...font.body[800], fontSize: 11, color: colors.primaryDark, fontVariant: ['tabular-nums'] },

  stepBody: { flex: 1, gap: 3, paddingTop: 8, paddingBottom: 22, minHeight: 44 },
  stepTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stepTitle: { ...font.body[800], fontSize: 17, color: colors.ink, flexShrink: 1 },
  stepWords: { ...font.body[600], fontSize: 14, color: colors.muted },

  nextCard: {
    flex: 1,
    gap: 12,
    padding: 14,
    marginBottom: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  nextEyebrow: { ...font.body[800], fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.primary },
  nextTitle: { ...font.display[800], fontSize: 20, color: colors.ink },

  chip: {
    ...font.body[800],
    fontSize: 12,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    overflow: 'hidden',
    fontVariant: ['tabular-nums'],
  },
  chipGood: { color: colors.success, backgroundColor: colors.successSoft },
  chipWarm: { color: colors.dangerInk, backgroundColor: colors.accentSoft },
  chipNew: { color: colors.muted, backgroundColor: colors.trough },
});

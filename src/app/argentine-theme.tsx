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

// ---------------------------------------------------------------------------
// One Argentine theme (?theme=<slug>): its packs as an album of stickers,
// easiest first, each showing its words and no title. Nothing is locked — any
// pack opens — but the first one she hasn't played is butter with a START tab,
// so there is never a question of where to tap.
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

        <View style={styles.album}>
          {packs.map((pack, i) => (
            <Sticker
              key={pack.slug}
              pack={pack}
              index={i}
              score={scores[pack.slug]}
              status={statusOf(scores[pack.slug], pack === next)}
            />
          ))}
          {/* Empty cells finish the last row, so its stickers keep the width of the others. */}
          {Array.from({ length: (COLS - (packs.length % COLS)) % COLS }, (_, i) => (
            <View key={`pad${i}`} style={styles.cell} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const COLS = 3;
const TILT = [-1.5, 1.2, -1, 1.5, -1.2, 1];
// Packs to play are butter; the ones she has played turn peach or salvia, in turn.
const DONE = [pastel.peach, pastel.sage];

/**
 * A pack as a sticker in the album: its words inside it as little pills, none
 * of them the title. Nothing is locked. Every pack to play is butter, the
 * next one with a START tab; played ones turn peach or salvia.
 */
function Sticker({ pack, index, score, status }: { pack: ArPack; index: number; score?: PackScore; status: Status }) {
  const open = () => router.push(`/argentine-pack?pack=${pack.slug}`);
  const played = status === 'mastered' || status === 'played';
  const bg = played ? DONE[index % DONE.length] : pastel.butter;
  const words = pack.words.map((w) => w.es);

  return (
    // The outer press target is plain and unrotated, so the badge and the tab
    // can hang off the sticker's edge without the sticker's own clipping.
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`${pack.name}: ${words.join(', ')}${score ? `, best ${score.best}%` : status === 'next' ? ', up next' : ', new'}`}
      style={({ pressed }) => [styles.cell, { transform: [{ scale: pressed ? 0.97 : 1 }] }, webPress]}>
      <View
        style={[
          styles.sticker,
          { backgroundColor: bg, transform: [{ rotate: `${TILT[index % TILT.length]}deg` }] },
        ]}>
        <View style={styles.tags}>
          {words.map((w) => (
            <View key={w} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {w}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {status === 'mastered' ? (
        <View style={styles.badge}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      ) : status === 'played' && score ? (
        <View style={[styles.badge, styles.badgeScore]}>
          <Text style={styles.badgeText}>{score.best}%</Text>
        </View>
      ) : null}
      {status === 'next' ? (
        <View style={styles.startTab}>
          <Text style={styles.startText}>START</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

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

  album: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 30, paddingTop: 10 },
  cell: { width: '30%', overflow: 'visible' },
  sticker: {
    height: 150,
    padding: 10,
    borderRadius: 22,
    justifyContent: 'center',
    boxShadow: clay.surface,
  },
  // The words sit inside the sticker as small white pills, wrapped and centred.
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 5 },
  tag: {
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: '#fff',
    boxShadow: `0 0 0 1.5px ${colors.ink}`,
  },
  tagText: { ...font.body[800], fontSize: 12, color: colors.ink },
  badge: {
    position: 'absolute',
    right: -7,
    top: -9,
    zIndex: 2,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 4,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 2px ${colors.ink}`,
  },
  badgeScore: { paddingHorizontal: 6 },
  badgeText: { ...font.body[800], fontSize: 11, lineHeight: 14, color: '#fff', fontVariant: ['tabular-nums'] },
  startTab: {
    position: 'absolute',
    bottom: -13,
    alignSelf: 'center',
    zIndex: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: colors.primary,
    boxShadow: `0 0 0 2px ${colors.ink}`,
  },
  startText: { ...font.body[800], fontSize: 11, lineHeight: 14, letterSpacing: 0.5, color: '#fff' },
});

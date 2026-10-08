import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { type ArPack, arPacks, arThemes, packTone, packsOf } from '@/lib/argentine';
import { themeObject } from '@/lib/argentine-art';
import { type PackScore, useShowAdult } from '@/lib/argentine-scores';
import { clay, colors, font, gradients, pastel, pastelGrad, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';
import { OutlinedHeadline, tiltAt, useSlap } from '@/components/sticker';

// ---------------------------------------------------------------------------
// The Argentine half of the Words tab: how far she has got, the one pack to
// carry on with, and the themes. A theme opens its packs as a short path
// (argentine-theme); nothing is locked. The rude theme stays out of sight —
// and out of the totals — until she turns it on.
//
// Theme cards are stickers in the theme's own pastel, each leaning its own
// way. packTone deals the pastels in order, so no two neighbours in the grid —
// across or down — share one.
//
// The progress bar and the "keep going" card are switched off (SHOW_PROGRESS,
// SHOW_KEEP); flip them to bring either back.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

/** The art's drop shadow, where one can follow the picture's own outline: a CSS
 *  filter on web and Android. iOS's view shadow shades the image's whole box —
 *  a grey rectangle behind the object — so there it goes without. */
const artShadow = (
  Platform.OS === 'ios' ? null : { filter: `drop-shadow(2px 3px 0px ${colors.ink})` }
) as object | null;

const SHOW_PROGRESS = false;
const SHOW_KEEP = false;

export function ArgentineHub({ scores }: { scores: Record<string, PackScore> }) {
  const [adult, setAdult] = useShowAdult();
  const themes = arThemes.filter((t) => adult || !t.vulgar);
  const shown = arPacks.filter((p) => adult || !p.vulgar);
  const played = shown.filter((p) => scores[p.slug]);
  const total = shown.reduce((n, p) => n + p.words.length, 0);
  const learned = played.reduce((n, p) => n + p.words.length, 0);
  const next = nextPack(scores, adult);
  const rude = arThemes.find((t) => t.vulgar);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Banner learned={learned} total={total} />

      {SHOW_KEEP && next ? <KeepGoing pack={next} /> : null}

      <View style={styles.grid}>
        {themes.map((theme, i) => (
          <ThemeTile key={theme.slug} theme={theme} index={i} scores={scores} />
        ))}
        {/* An odd one out keeps its half: without a partner it would stretch
            across the row and read as a different kind of card. */}
        {themes.length % 2 ? <View style={[styles.slot, styles.filler]} /> : null}
      </View>

      {rude ? (
        <View style={styles.adultRow}>
          <View style={[styles.adultAvatar, { backgroundColor: pastel.peach }]}>
            <Image source={themeObject(rude.slug)} style={styles.adultArt} contentFit="contain" accessible={false} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.adultTitleRow}>
              <Text style={styles.adultTitle}>{rude.title}</Text>
              <Text style={styles.adultBadge}>18+</Text>
            </View>
            <Text style={styles.adultSub}>Insults and swearing · {packsOf(rude.slug).length} packs</Text>
          </View>
          <Switch
            value={adult}
            onValueChange={setAdult}
            accessibilityLabel="Show 18+ packs"
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
            {...(Platform.OS === 'web' ? ({ activeThumbColor: colors.card } as object) : null)}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

function ThemeTile({ theme, index, scores }: { theme: (typeof arThemes)[number]; index: number; scores: Record<string, PackScore> }) {
  const packs = packsOf(theme.slug);
  const done = packs.filter((p) => scores[p.slug]).length;
  const words = packs.reduce((n, p) => n + p.words.length, 0);
  const tone = packTone(theme.slug);
  const slap = useSlap(index, tiltAt(index));
  return (
    <Animated.View style={[styles.slot, slap]}>
      <Pressable
        onPress={() => router.push(`/argentine-theme?theme=${theme.slug}`)}
        accessibilityRole="button"
        accessibilityLabel={`${theme.title}, ${packs.length} packs${done ? `, ${done} done` : ''}`}
        style={({ pressed }) => [styles.tile, { backgroundColor: tone.bg, transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
        <View style={styles.tilePanel}>
          <Image source={themeObject(theme.slug)} style={[styles.tileArt, artShadow]} contentFit="contain" accessible={false} />
        </View>
        <View style={styles.tileText}>
          <FitText style={styles.tileTitle} lines={2}>
            {theme.title}
          </FitText>
          {done ? (
            <View style={{ gap: 6 }}>
              <FitText style={styles.tileMeta} lines={1}>
                {done === packs.length ? 'All done ✓' : `${done} of ${packs.length} packs`}
              </FitText>
              <View style={styles.tileTrack}>
                <View style={[styles.tileFill, { width: `${(done / packs.length) * 100}%` }]} />
              </View>
            </View>
          ) : (
            <FitText style={styles.tileMeta} lines={1}>
              {words} words
            </FitText>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * What this half is, said the way the Culture tab says what it is: a kicker, a
 * the outlined headline and one line, straight on the oat. Her progress as one
 * bar is switched off (SHOW_PROGRESS).
 */
function Banner({ learned, total }: { learned: number; total: number }) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  return (
    <View style={styles.intro}>
      <OutlinedHeadline small="Talk like a" big="Local" style={styles.headline} />
      <Text style={styles.lead}>The words locals actually use.</Text>
      {SHOW_PROGRESS ? (
      <View style={styles.progress} accessibilityLabel={`${learned} of ${total} words learned`}>
        <View style={styles.track}>
          <LinearGradient
            colors={gradients.progress}
            style={[styles.fill, { width: `${Math.max(pct, learned ? 3 : 0)}%` }]}
          />
        </View>
        <Text style={styles.progressOf}>
          {learned} of {total}
        </Text>
      </View>
      ) : null}
    </View>
  );
}

/**
 * Where to carry on: the theme she played last, at its first pack she hasn't
 * played — or, when that theme is done, the next theme's. Nothing until she
 * has played a pack; before then the themes themselves are the start.
 */
function nextPack(scores: Record<string, PackScore>, adult: boolean): ArPack | null {
  const shown = arPacks.filter((p) => adult || !p.vulgar);
  const last = shown
    .filter((p) => scores[p.slug])
    .sort((a, b) => (scores[b.slug].at ?? 0) - (scores[a.slug].at ?? 0))[0];
  if (!last) return null;
  const inTheme = shown.filter((p) => p.theme === last.theme);
  const after = shown.slice(shown.indexOf(inTheme[0]));
  return inTheme.find((p) => !scores[p.slug]) ?? after.find((p) => !scores[p.slug]) ?? null;
}

function KeepGoing({ pack }: { pack: ArPack }) {
  const theme = arThemes.find((t) => t.slug === pack.theme);
  return (
    <Pressable
      onPress={() => router.push(`/argentine-pack?pack=${pack.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`Keep going: ${pack.title}`}
      style={({ pressed }) => [styles.keep, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
      <LinearGradient colors={pastelGrad.lav} style={[StyleSheet.absoluteFill, styles.keepFace]} pointerEvents="none" />
      <Image source={themeObject(pack.theme)} style={styles.keepImage} contentFit="contain" accessible={false} />
      <View style={styles.keepHead}>
        <FitText style={styles.keepEyebrow} lines={1}>
          Keep going · {pack.words.length} words
        </FitText>
        <FitText style={styles.keepTitle} lines={2}>
          {theme ? `${theme.title} · ` : ''}
          {pack.name}
        </FitText>
      </View>
      {/* Drawn, not pressable: the whole card is the tap. */}
      <View style={styles.keepGo}>
        <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, styles.keepGoFace]} pointerEvents="none" />
        <Ionicons name="arrow-forward" size={22} color={colors.onPrimary} />
      </View>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  // The side padding is the scroller's own, not its parent's: a scroller clips
  // at its edge, and the tiles' outlines and shadows reach past their boxes.
  container: { gap: 20, padding: 20, paddingBottom: 32 },

  // The same header as the Culture tab.
  intro: { gap: 6, paddingHorizontal: 2, paddingTop: 4 },
  headline: { width: '72%', marginBottom: 2 },
  lead: { ...font.body[700], fontSize: 16, lineHeight: 22, color: colors.muted },

  progress: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  progressOf: { ...font.body[800], fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] },
  track: {
    flex: 1,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },

  // The capybara stands above the card's top edge, so the card leaves it room
  // and does not clip.
  keep: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: radius.lg,
    boxShadow: clay.surface,
  },
  keepFace: { borderRadius: radius.lg },
  keepImage: { width: 58, height: 72 },
  keepHead: { flex: 1, gap: 2 },
  keepEyebrow: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8 },
  keepTitle: { ...font.display[800], fontSize: 18, lineHeight: 22, letterSpacing: -0.2, color: colors.onPastel },
  keepGo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: clay.button,
  },
  keepGoFace: { borderRadius: 24 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 18 },
  // The slot holds the tile's place in the grid, its lean and its entrance.
  slot: {
    width: '44%', // two per row; flexGrow shares out the rest
    flexGrow: 1,
  },
  // A sticker in the theme's pastel: the picture on top, name and count underneath.
  tile: {
    flex: 1,
    padding: 8,
    paddingBottom: 14,
    gap: 6,
    borderRadius: 20,
    boxShadow: clay.surface,
  },
  filler: { opacity: 0 },
  tilePanel: { height: 100, alignItems: 'center', justifyContent: 'center' },
  tileArt: { width: 116, height: 88 },
  tileText: { gap: 3, paddingHorizontal: 6 },
  tileTitle: { ...font.display[900], fontSize: 20, lineHeight: 21, color: colors.onPastel },
  tileMeta: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8, fontVariant: ['tabular-nums'] },
  tileTrack: {
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  tileFill: { height: '100%', backgroundColor: colors.progress },

  adultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  adultAvatar: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', boxShadow: clay.surface },
  adultArt: { width: 38, height: 38 },
  adultTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adultTitle: { ...font.body[800], fontSize: 16, color: colors.ink },
  adultBadge: {
    ...font.body[800],
    fontSize: 11,
    color: colors.card,
    backgroundColor: colors.dangerInk,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  adultSub: { ...font.body[600], fontSize: 13, color: colors.muted },
});

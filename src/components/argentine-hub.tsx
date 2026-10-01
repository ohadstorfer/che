import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { type ArPack, arPacks, arThemes, packTone, packsOf } from '@/lib/argentine';
import { themeObject } from '@/lib/argentine-art';
import { type PackScore, useShowAdult } from '@/lib/argentine-scores';
import { clay, colors, font, gradients, pastel, pastelGrad, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The Argentine half of the Words tab: how far she has got, the one pack to
// carry on with, and the themes. A theme opens its packs as a short path
// (argentine-theme); nothing is locked. The rude theme stays out of sight —
// and out of the totals — until she turns it on.
//
// Theme cards are clay, like every other card in the app; each theme's
// pastel lives only in the circle behind its capybara, so sixteen of them
// read as a set rather than a wall. packTone deals the pastels in order, so
// no two neighbours in the grid — across or down — share one.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

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

      {next ? <KeepGoing pack={next} /> : null}

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Themes</Text>
      </View>

      <View style={styles.grid}>
        {themes.map((theme) => {
          const packs = packsOf(theme.slug);
          const done = packs.filter((p) => scores[p.slug]).length;
          const words = packs.reduce((n, p) => n + p.words.length, 0);
          const tone = packTone(theme.slug);
          return (
            <Pressable
              key={theme.slug}
              onPress={() => router.push(`/argentine-theme?theme=${theme.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={`${theme.title}, ${packs.length} packs${done ? `, ${done} done` : ''}`}
              style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
              {/* A soft pastel pod running off the card's edge, clipped by its own
                  layer: clipping the tile itself would clip its clay shadow too. */}
              <View style={styles.podClip} pointerEvents="none">
                <View style={[styles.pod, { backgroundColor: tone.bg }]} />
              </View>
              <Image source={themeObject(theme.slug)} style={styles.tileArt} contentFit="contain" accessible={false} />
              <View style={styles.tileText}>
                <FitText style={styles.tileTitle} lines={2}>
                  {theme.title}
                </FitText>
                {done ? (
                  <View style={{ gap: 5 }}>
                    <FitText style={styles.tileMeta} lines={1}>
                      {done === packs.length ? 'All done ✓' : `${done} of ${packs.length} packs`}
                    </FitText>
                    <View style={styles.tileTrack}>
                      <LinearGradient
                        colors={gradients.progress}
                        style={[styles.tileFill, { width: `${(done / packs.length) * 100}%` }]}
                      />
                    </View>
                  </View>
                ) : (
                  <FitText style={styles.tileMeta} lines={1}>
                    {words} words
                  </FitText>
                )}
              </View>
            </Pressable>
          );
        })}
        {/* An odd one out keeps its half: without a partner it would stretch
            across the row and read as a different kind of card. */}
        {themes.length % 2 ? <View style={[styles.tile, styles.filler]} /> : null}
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

/**
 * What this half is, said the way the Culture tab says what it is: a kicker, a
 * heading and one line, straight on the oat — then her progress as one bar, so
 * the themes come sooner.
 */
function Banner({ learned, total }: { learned: number; total: number }) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  return (
    <View style={styles.intro}>
      <Text style={styles.kicker}>Argentine slang</Text>
      <Text style={styles.heading} accessibilityRole="header">
        Talk like a local
      </Text>
      <Text style={styles.lead}>The words locals actually use.</Text>
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
  container: { gap: 18, paddingBottom: 32 },

  // The same header as the Culture tab.
  intro: { gap: 6, paddingHorizontal: 2, paddingTop: 4 },
  /** Durazno, darkened until it reads as text on the oat. */
  kicker: { ...font.body[800], fontSize: 16, letterSpacing: 1.6, textTransform: 'uppercase', color: '#A8502C' },
  heading: { ...font.display[800], fontSize: 40, lineHeight: 42, letterSpacing: -1, color: colors.ink },
  lead: { ...font.body[600], fontSize: 16, lineHeight: 22, color: colors.muted },

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

  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  sectionTitle: { ...font.display[800], fontSize: 21, lineHeight: 25, letterSpacing: -0.2, color: colors.ink },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '46%', // two per row; flexGrow shares out the rest
    flexGrow: 1,
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  filler: { opacity: 0, boxShadow: undefined },
  podClip: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius.lg, overflow: 'hidden' },
  pod: {
    position: 'absolute',
    left: -18,
    top: '50%',
    width: 84,
    height: 84,
    marginTop: -42,
    borderRadius: 42,
    opacity: 0.55,
  },
  tileArt: { width: 68, height: 62, flexShrink: 0 },
  tileText: { flex: 1, gap: 3 },
  tileTitle: { ...font.body[800], fontSize: 14, lineHeight: 17, color: colors.ink },
  tileMeta: { ...font.body[700], fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'] },
  tileTrack: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  tileFill: { height: '100%', borderRadius: radius.pill },

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

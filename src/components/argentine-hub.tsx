import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { type ArPack, arPacks, arThemes, packTone, packsOf } from '@/lib/argentine';
import { themeArt } from '@/lib/argentine-art';
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
              <View style={[styles.avatar, { backgroundColor: tone.bg }]}>
                <Image source={themeArt(theme.slug)} style={styles.avatarArt} contentFit="contain" accessible={false} />
              </View>
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
                        colors={gradients.deep}
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
            <Image source={themeArt(rude.slug)} style={styles.adultArt} contentFit="contain" accessible={false} />
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
 * What this half is, said the way a word card says a word: a clay sticker
 * pinned on the durazno at a tilt, the capybara beside it on its pod, and her
 * progress right on the tile — no card of its own, so the themes come sooner.
 */
function Banner({ learned, total }: { learned: number; total: number }) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  return (
    <View style={styles.banner}>
      <LinearGradient colors={pastelGrad.peach} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.bannerPod} />
      <View style={styles.bannerTop}>
        <View style={styles.bannerLeft} accessibilityRole="header" accessibilityLabel="Lunfardo: Argentine slang">
          <View style={styles.bannerCard}>
            <FitText style={styles.bannerWord} lines={1}>
              lunfardo
            </FitText>
            <Text style={styles.bannerTag}>ARGENTINE SLANG</Text>
          </View>
          <Text style={styles.bannerSub}>The words locals actually use.</Text>
        </View>
        <Image source={themeArt('casa')} style={styles.bannerCapy} contentFit="contain" accessible={false} />
      </View>
      <View style={styles.progress} accessibilityLabel={`${learned} of ${total} words learned`}>
        <View style={styles.progressRow}>
          <View style={styles.progressCount}>
            <Text style={styles.progressBig}>{learned}</Text>
            <Text style={styles.progressOf}>of {total} words</Text>
          </View>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(pct, learned ? 3 : 0)}%` }]} />
        </View>
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
      <View style={styles.keepHead}>
        <Text style={styles.keepEyebrow}>Keep going · {pack.words.length} words</Text>
        <FitText style={styles.keepTitle} lines={2}>
          {theme ? `${theme.title}\n` : ''}
          {pack.name}
        </FitText>
      </View>
      <View style={styles.keepChips}>
        {pack.words.slice(0, 4).map((w) => (
          <FitText key={w.id} style={styles.keepChip} lines={1}>
            {w.es}
          </FitText>
        ))}
      </View>
      {/* The button is drawn, not pressable: the whole card is the tap. */}
      <View style={styles.keepGo}>
        <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, styles.keepGoFace]} pointerEvents="none" />
        <Text style={styles.keepGoText}>Continue</Text>
      </View>
      <Image source={themeArt(pack.theme)} style={styles.keepImage} contentFit="contain" accessible={false} />
    </Pressable>
  );
}

/** Text on the durazno banner: the pastel ink, a touch softer for asides. */
const BANNER_SUB = 'rgba(58, 42, 32, 0.8)';

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 32 },

  banner: { padding: 18, gap: 14, borderRadius: radius.xl, overflow: 'hidden', boxShadow: clay.surface },
  bannerPod: {
    position: 'absolute',
    right: -14,
    top: 8,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.pod,
  },
  bannerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bannerLeft: { flex: 1, gap: 14, alignItems: 'flex-start' },
  bannerCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 16,
    boxShadow: clay.surface,
    transform: [{ rotate: '-3deg' }],
  },
  bannerWord: { ...font.display[800], fontSize: 36, lineHeight: 40, letterSpacing: -1, color: colors.ink },
  bannerTag: { ...font.body[800], fontSize: 10, letterSpacing: 1.3, color: colors.onPastel, opacity: 0.8 },
  bannerSub: { ...font.body[600], fontSize: 15, lineHeight: 20, color: BANNER_SUB, paddingLeft: 4 },
  bannerCapy: { width: 92, height: 136, marginRight: -6, marginBottom: -20 },

  progress: { gap: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  progressCount: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  progressBig: {
    ...font.display[800],
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.onPastel,
    fontVariant: ['tabular-nums'],
  },
  progressOf: { ...font.body[700], fontSize: 14, color: BANNER_SUB },
  progressPct: { ...font.body[800], fontSize: 13, color: BANNER_SUB, fontVariant: ['tabular-nums'] },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.trough,
    boxShadow: clay.trough,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.onPastel },

  // The capybara stands above the card's top edge, so the card leaves it room
  // and does not clip.
  keep: {
    marginTop: 14,
    padding: 20,
    gap: 14,
    borderRadius: radius.xl,
    boxShadow: clay.surface,
  },
  keepFace: { borderRadius: radius.xl },
  keepHead: { gap: 4, paddingRight: 92 },
  keepEyebrow: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8 },
  keepTitle: { ...font.display[800], fontSize: 26, lineHeight: 28, letterSpacing: -0.3, color: colors.onPastel },
  keepChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keepChip: {
    ...font.body[800],
    fontSize: 15,
    color: colors.onPastel,
    backgroundColor: colors.chip,
    boxShadow: clay.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  keepGo: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: clay.button,
  },
  keepGoFace: { borderRadius: 27 },
  keepGoText: { ...font.body[800], fontSize: 17, color: colors.onPrimary },
  keepImage: { position: 'absolute', right: 10, top: -26, width: 84, height: 120 },

  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  sectionTitle: { ...font.display[800], fontSize: 21, lineHeight: 25, letterSpacing: -0.2, color: colors.ink },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '46%', // two per row; flexGrow shares out the rest
    flexGrow: 1,
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  filler: { opacity: 0, boxShadow: undefined },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    flexShrink: 0,
    boxShadow: clay.surface,
  },
  avatarArt: { width: 42, height: 62, marginTop: 4 },
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
  adultAvatar: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', boxShadow: clay.surface },
  adultArt: { width: 42, height: 62, marginTop: 4 },
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

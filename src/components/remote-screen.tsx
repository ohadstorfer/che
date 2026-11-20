import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { In, Slap } from '@/components/cheer-bits';
import { OutlinedHeadline } from '@/components/sticker';
import { Button } from '@/components/ui';
import { type Block, SCREEN_COLORS, type ScreenColor, type ScreenContent, type TextColor, pictureOf } from '@/lib/remote-config';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// A custom onboarding screen, drawn from its blocks (onboarding_screens.content,
// lib/remote-config.ts). One template: blocks stacked top to bottom on a
// pastel page, landing one after another, and the button docked at the bottom.
// The blocks are the app's own pieces (the outlined headline, the stickers,
// Pancho), so a screen made in the dashboard looks like the rest of the app.
// ---------------------------------------------------------------------------

/** Blocks land 70 ms apart: quick enough not to hold her up, slow enough to read as a cascade. */
const STAGGER = 70;

const colour = (c: ScreenColor | undefined, fallback: string) => (c && SCREEN_COLORS[c]) || fallback;
const TEXT: Record<TextColor, string> = { ink: colors.ink, rosa: colors.primaryDark, muted: colors.muted };
/** Text on a filled colour: white on rosa, ink on everything else. */
const on = (c: ScreenColor | undefined) => (c === 'rosa' ? colors.onPrimary : colors.ink);

export function RemoteScreen({
  content,
  onNext,
  onPaywall,
}: {
  content: ScreenContent;
  onNext: () => void;
  onPaywall: () => void;
}) {
  const bg = colour(content.bg, colors.bg);
  useStatusBarColor(bg);
  const bottom = useSafeAreaInsets().bottom;
  const onPage = bg === colors.bg ? colors.card : colors.bg;
  const go = content.button?.action === 'paywall' ? onPaywall : onNext;
  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.body} bounces={false}>
          {content.blocks.map((b, i) => (
            <BlockView key={i} block={b} delay={120 + i * STAGGER} fill={onPage} page={content.bg} />
          ))}
        </ScrollView>
        <View style={[styles.dock, { paddingBottom: 20 + bottom }]}>
          <Button title={content.button?.label || 'Continue'} variant={content.button?.style === 'secondary' ? 'secondary' : 'primary'} onPress={go} />
          {content.skip?.label ? <Button title={content.skip.label} variant="ghost" small onPress={onNext} /> : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

function BlockView({ block: b, delay, fill, page }: { block: Block; delay: number; fill: string; page?: ScreenColor }) {
  const textStyle = (t: { color?: TextColor; align?: 'center' | 'left' }, fallback: TextColor = 'ink') => ({
    color: page === 'rosa' ? colors.onPrimary : TEXT[t.color ?? fallback],
    textAlign: t.align ?? 'center',
    alignSelf: t.align === 'left' ? ('stretch' as const) : undefined,
  });
  const cardBg = (c?: ScreenColor) => ({ backgroundColor: colour(c, colors.card) });
  switch (b.type) {
    case 'kicker':
      return (
        <In delay={delay}>
          <Text style={[styles.kicker, textStyle(b, 'rosa')]}>{b.text.toUpperCase()}</Text>
        </In>
      );
    case 'headline':
      return (
        <Slap delay={delay} tilt={0} style={styles.headline}>
          {/* Sized as if one letter longer: the outline's stroke made a long word
              (PAYWALL) touch the edge. Text from the dashboard can be any length. */}
          <OutlinedHeadline small={b.small ?? ''} big={b.big} sizeLike={`${b.big}M`} fill={colour(b.fill, fill)} center />
        </Slap>
      );
    case 'title':
      return (
        <In delay={delay}>
          <Text style={[styles.title, textStyle(b)]}>{b.text}</Text>
        </In>
      );
    case 'text':
      return (
        <In delay={delay}>
          <Rich style={{ ...styles.text, ...textStyle(b) }} text={b.text} />
        </In>
      );
    case 'image': {
      const source = pictureOf(b);
      if (!source) return null;
      return (
        <In delay={delay} style={{ alignSelf: 'stretch', alignItems: 'center' }}>
          <Image source={source} style={{ width: '100%', height: b.height ?? 200 }} contentFit="contain" accessibilityIgnoresInvertColors />
        </In>
      );
    }
    case 'bullets':
      return (
        <In delay={delay} style={[styles.card, cardBg(b.bg)]}>
          {b.items.map((item, i) => (
            <View key={i} style={styles.bullet}>
              <Ionicons name="checkmark-circle" size={22} color={b.bg === 'rosa' ? colors.onPrimary : colors.primary} />
              <Rich style={{ ...styles.bulletText, color: on(b.bg) }} text={item} />
            </View>
          ))}
        </In>
      );
    case 'quote':
      return (
        <In delay={delay} style={[styles.card, cardBg(b.bg)]}>
          {b.stars ? <Text style={styles.stars}>{'★'.repeat(Math.min(5, Math.max(1, b.stars)))}</Text> : null}
          <Text style={[styles.quote, { color: on(b.bg) }]}>“{b.text}”</Text>
          {b.author ? <Text style={styles.author}>{b.author}</Text> : null}
        </In>
      );
    case 'countdown':
      return (
        <In delay={delay} style={[styles.card, cardBg(b.bg)]}>
          {b.label ? <Text style={styles.countLabel}>{b.label}</Text> : null}
          <Countdown until={Date.parse(b.until)} />
        </In>
      );
    case 'sticker':
      return (
        <Slap delay={delay} tilt={b.tilt ?? -2.5} style={[styles.sticker, { backgroundColor: colour(b.color, colors.primary) }]}>
          <Text style={[styles.stickerText, { color: on(b.color ?? 'rosa') }]}>{b.text}</Text>
        </Slap>
      );
    default:
      return null;
  }
}

/** **bold** spans, the way the culture cards write them. */
function Rich({ text, style }: { text: string; style: object }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <Text key={i} style={{ ...font.body[800] }}>
            {p.slice(2, -2)}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

function Countdown({ until }: { until: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, until - now);
  const d = Math.floor(left / 86400000);
  const h = Math.floor(left / 3600000) % 24;
  const m = Math.floor(left / 60000) % 60;
  const s = Math.floor(left / 1000) % 60;
  const cells: [number, string][] = [
    [d, 'days'],
    [h, 'hours'],
    [m, 'min'],
    [s, 'sec'],
  ];
  return (
    <View style={styles.countRow} accessibilityLabel={`${d} days ${h} hours ${m} minutes left`}>
      {cells.map(([n, label]) => (
        <View key={label} style={styles.countCell}>
          <Text style={styles.countNum}>{String(n).padStart(2, '0')}</Text>
          <Text style={styles.countUnit}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16, alignItems: 'center', gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { ...font.body[800], fontSize: 13, letterSpacing: 1.6, color: colors.primaryDark, textAlign: 'center' },
  headline: { width: '100%', maxWidth: 390 },
  title: { ...font.display[800], fontSize: 28, lineHeight: 34, color: colors.ink, textAlign: 'center' },
  text: { ...font.body[600], fontSize: 17, lineHeight: 25, color: colors.ink, textAlign: 'center' },
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    boxShadow: clay.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  bullet: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletText: { flex: 1, ...font.body[600], fontSize: 16, lineHeight: 22, color: colors.ink },
  stars: { fontSize: 18, color: pastel.flame, letterSpacing: 2 },
  quote: { ...font.body[600], fontSize: 17, lineHeight: 24, color: colors.ink },
  author: { ...font.body[700], fontSize: 14, color: colors.muted },
  countLabel: { ...font.body[800], fontSize: 13, letterSpacing: 1.2, color: colors.muted, textAlign: 'center' },
  countRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  countCell: { alignItems: 'center', minWidth: 58 },
  countNum: { ...font.display[800], fontSize: 32, color: colors.ink, fontVariant: ['tabular-nums'] },
  countUnit: { ...font.body[700], fontSize: 12, color: colors.muted },
  sticker: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, boxShadow: clay.chip },
  stickerText: { ...font.body[800], fontSize: 16 },
  dock: { paddingHorizontal: 20, paddingTop: 12, gap: 6, maxWidth: 560, width: '100%', alignSelf: 'center' },
});

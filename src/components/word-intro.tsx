import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ImageSourcePropType, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ArWord } from '@/lib/argentine';
import { clay, colors, font, gradients, pastel, pastelGrad, press, radius, type PastelName } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The "new word" screen of an Argentine pack. One word, big, with what it means
// and one sentence of it in the wild — dressed in one of six looks that rotate
// through the pack so ten new words in a row don't read as one screen ten times.
// Every look owns the whole page (background included), so the round hands it
// the header colours through `IntroLook` and lets it paint behind them.
// ---------------------------------------------------------------------------

const OAT = colors.bg;
const CARD = colors.card;
const INK = colors.onPastel;
/** Header ink, track and fill on a pastel page: the warm ink, never muted grey. */
const ON_PASTEL_SUB = 'rgba(58, 42, 32, 0.8)';
const ON_PASTEL_TRACK = 'rgba(58, 42, 32, 0.12)';
/** The word picked out of its sentence: durazno on clay, deep rosa on a pastel page. */
const PICK = colors.accent;
const PICK_ON_PASTEL = colors.primaryDark;

export type IntroLook = {
  key: 'hero' | 'sticker' | 'sage' | 'stickerGreen' | 'deck' | 'duo';
  /** Page colour: also the status bar's. */
  bg: string;
  /** Close button, counter and the pack title above the word. */
  ink: string;
  /** Progress bar: the empty track and the filled part. */
  track: string;
  fill: string;
};

export const INTRO_LOOKS: IntroLook[] = [
  { key: 'hero', bg: OAT, ink: colors.muted, track: colors.trough, fill: colors.primary },
  { key: 'sticker', bg: pastel.peach, ink: ON_PASTEL_SUB, track: ON_PASTEL_TRACK, fill: INK },
  { key: 'sage', bg: pastel.sage, ink: ON_PASTEL_SUB, track: ON_PASTEL_TRACK, fill: INK },
  { key: 'stickerGreen', bg: pastel.lav, ink: ON_PASTEL_SUB, track: ON_PASTEL_TRACK, fill: INK },
  { key: 'deck', bg: OAT, ink: colors.muted, track: colors.trough, fill: colors.primary },
  { key: 'duo', bg: OAT, ink: colors.muted, track: colors.trough, fill: colors.primary },
];

/** A stable start for a pack, so a pack doesn't always open on the same look. */
export function lookOffset(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % INTRO_LOOKS.length;
}

const LEVEL_LABEL = { 1: 'Everyone says it', 2: 'Common', 3: 'Less common' } as const;

/** The word's size: a phrase or a long word steps down instead of wrapping badly. */
function wordSize(es: string, max: number) {
  const n = es.length;
  const size = n <= 5 ? max : n <= 8 ? max * 0.78 : n <= 12 ? max * 0.52 : max * 0.4;
  return { fontSize: Math.round(size), lineHeight: Math.round(size * 1.04), letterSpacing: -size * 0.035 };
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

/** Rises in once: 8px and a fade, ease-out. Short: she sees this dozens of times. */
function Enter({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 240,
      delay,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [t, delay]);
  return (
    <Animated.View
      style={[style, { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

function GotIt({ onPress }: { onPress: () => void }) {
  const bottom = useSafeAreaInsets().bottom;
  return (
    <View style={[styles.footer, { paddingBottom: 20 + bottom }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          { transform: [{ scale: pressed ? press.scale : 1 }] },
          Platform.OS === 'web'
            ? ({
                transitionProperty: 'transform',
                transitionDuration: `${press.duration}ms`,
                transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
              } as object)
            : null,
        ]}>
        <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, { borderRadius: 27 }]} pointerEvents="none" />
        <Text style={styles.buttonText}>Got it</Text>
      </Pressable>
    </View>
  );
}

/** A pastel clay card: the gradient runs top to bottom under the content. */
function Clay({
  tone,
  round = radius.xl,
  style,
  children,
}: {
  tone: PastelName;
  round?: number;
  style?: object;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.clayCard, { borderRadius: round }, style]}>
      <LinearGradient colors={pastelGrad[tone]} style={[StyleSheet.absoluteFill, { borderRadius: round }]} pointerEvents="none" />
      {children}
    </View>
  );
}

function Tag({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** The sentence with the word itself picked out. */
function Example({ word, ink, accent, size = 20 }: { word: ArWord; ink: string; accent: string; size?: number }) {
  const text = word.example.es;
  const at = text.toLocaleLowerCase('es').indexOf(word.gap.toLocaleLowerCase('es'));
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ ...font.body[600], fontSize: size, lineHeight: size + 8, color: ink }}>
        {at < 0 ? (
          text
        ) : (
          <>
            {text.slice(0, at)}
            <Text style={{ ...font.body[800], color: accent }}>{text.slice(at, at + word.gap.length)}</Text>
            {text.slice(at + word.gap.length)}
          </>
        )}
      </Text>
      <Text style={{ ...font.body[500], fontSize: 15, lineHeight: 21, fontStyle: 'italic', color: ink, opacity: 0.8 }}>{word.example.en}</Text>
    </View>
  );
}

const Note = ({ word, color }: { word: ArWord; color: string }) => (
  <Text style={{ ...font.body[600], fontSize: 16, lineHeight: 24, color }}>{word.note}</Text>
);

function Scroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// The looks
// ---------------------------------------------------------------------------

type Props = { word: ArWord; art: ImageSourcePropType; onDone: () => void };

/** Big durazno clay card, the word in ink; the sentence on raised clay beneath it. */
function Hero({ word, art, onDone }: Props) {
  return (
    <>
      <Scroll>
        <Enter>
          <Clay tone="peach" style={styles.heroCard}>
            <View style={styles.heroPod}>
              <Image source={art} style={styles.heroArt} contentFit="contain" accessible={false} />
            </View>
            <Text style={styles.heroKicker}>✨ NEW WORD</Text>
            <FitText style={[styles.heroWord, wordSize(word.es, 96)]} lines={2}>
              {word.es}
            </FitText>
            <Text style={styles.heroMeaning}>{word.en}</Text>
            <Tag label={LEVEL_LABEL[word.level]} bg={colors.chip} fg={INK} />
          </Clay>
        </Enter>
        <Enter delay={50} style={{ gap: 16, marginTop: 20 }}>
          <Note word={word} color={colors.muted} />
          <View style={styles.whiteCard}>
            <Example word={word} ink={INK} accent={PICK} />
          </View>
        </Enter>
      </Scroll>
      <GotIt onPress={onDone} />
    </>
  );
}

/** Durazno page, a clay card pinned on at a tilt, the capybara beside the meaning. */
function Sticker({ word, art, onDone }: Props) {
  return (
    <>
      <Scroll>
        <Enter>
          <View style={[styles.stickerCard, { transform: [{ rotate: '-3deg' }] }]}>
            <FitText style={[styles.stickerWord, { color: colors.primary }, wordSize(word.es, 92)]} lines={2}>
              {word.es}
            </FitText>
            <Text style={[styles.tagText, { color: colors.muted, marginTop: 6 }]}>{LEVEL_LABEL[word.level].toUpperCase()}</Text>
          </View>
        </Enter>
        <Enter delay={40} style={styles.meaningRow}>
          <Text style={[styles.meaningBig, { color: INK, flex: 1 }]}>{word.en}</Text>
          <Image source={art} style={styles.capy} contentFit="contain" accessible={false} />
        </Enter>
      </Scroll>
      <View style={[styles.sheet, { backgroundColor: OAT }]}>
        <Note word={word} color={colors.muted} />
        <Example word={word} ink={INK} accent={PICK} />
      </View>
      <View style={{ backgroundColor: OAT }}>
        <GotIt onPress={onDone} />
      </View>
    </>
  );
}

/** Salvia page, the word huge in ink, the sentence on a clay card. */
function Sage({ word, art, onDone }: Props) {
  return (
    <>
      <Scroll>
        <Enter>
          <Tag label={LEVEL_LABEL[word.level]} bg={colors.chip} fg={INK} />
          <FitText style={[styles.sageWord, wordSize(word.es, 120)]} lines={2}>
            {word.es}
          </FitText>
          <Text style={styles.sageMeaning}>{word.en}</Text>
        </Enter>
        <Enter delay={50} style={{ marginTop: 14, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Note word={word} color={ON_PASTEL_SUB} />
            </View>
            <Image source={art} style={styles.capySmall} contentFit="contain" accessible={false} />
          </View>
          <View style={styles.whiteCard}>
            <Example word={word} ink={INK} accent={PICK} />
          </View>
        </Enter>
      </Scroll>
      <GotIt onPress={onDone} />
    </>
  );
}

/** Lavanda page, a clay card tilted the other way, the meaning as a manteca label. */
function StickerGreen({ word, art, onDone }: Props) {
  return (
    <>
      <Scroll>
        <Enter>
          <View style={[styles.stickerCard, { transform: [{ rotate: '3deg' }] }]}>
            <FitText style={[styles.stickerWord, { color: INK }, wordSize(word.es, 92)]} lines={2}>
              {word.es}
            </FitText>
            <Text style={[styles.tagText, { color: colors.primary, marginTop: 6 }]}>{LEVEL_LABEL[word.level].toUpperCase()}</Text>
          </View>
        </Enter>
        <Enter delay={40} style={styles.meaningRow}>
          <Image source={art} style={[styles.capy, { transform: [{ scaleX: -1 }] }]} contentFit="contain" accessible={false} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View style={[styles.label, { transform: [{ rotate: '-2deg' }] }]}>
              <Text style={styles.labelText}>{word.en}</Text>
            </View>
          </View>
        </Enter>
        <Enter delay={80} style={{ gap: 16, marginTop: 8 }}>
          <Note word={word} color={ON_PASTEL_SUB} />
          <Example word={word} ink={INK} accent={PICK_ON_PASTEL} />
        </Enter>
      </Scroll>
      <GotIt onPress={onDone} />
    </>
  );
}

/** A manteca card on top of a fanned deck: the next words, waiting. */
function Deck({ word, onDone }: Props) {
  return (
    <>
      <Scroll>
        <Enter>
          <View style={styles.deck}>
            <View style={[styles.deckBack, { backgroundColor: pastel.sky, transform: [{ rotate: '-4deg' }] }]} />
            <View style={[styles.deckBack, { backgroundColor: pastel.sage, transform: [{ rotate: '2.5deg' }] }]} />
            <Clay tone="butter" style={styles.heroCard}>
              <Text style={styles.heroKicker}>✨ NEW WORD</Text>
              <FitText style={[styles.heroWord, wordSize(word.es, 96)]} lines={2}>
                {word.es}
              </FitText>
              <Text style={styles.heroMeaning}>{word.en}</Text>
              <Tag label={LEVEL_LABEL[word.level]} bg={colors.chip} fg={INK} />
            </Clay>
          </View>
        </Enter>
        <Enter delay={50} style={{ gap: 14, marginTop: 24 }}>
          <Note word={word} color={colors.muted} />
          <Example word={word} ink={INK} accent={PICK} size={19} />
        </Enter>
      </Scroll>
      <GotIt onPress={onDone} />
    </>
  );
}

/** Two clay stickers slapped on at opposite tilts: the word, then what it means. */
function Duo({ word, onDone }: Props) {
  return (
    <>
      <Scroll>
        <Enter>
          <View style={{ transform: [{ rotate: '-3deg' }], marginRight: 30 }}>
            <Clay tone="lav" style={styles.duoWord}>
              <FitText style={[styles.stickerWord, { color: INK }, wordSize(word.es, 88)]} lines={2}>
                {word.es}
              </FitText>
            </Clay>
          </View>
          <View style={{ transform: [{ rotate: '2.5deg' }], marginLeft: 44, marginTop: -8 }}>
            <Clay tone="sage" round={radius.lg} style={styles.duoMeaning}>
              <FitText style={styles.duoMeaningText} lines={2}>
                {word.en}
              </FitText>
            </Clay>
          </View>
        </Enter>
        <Enter delay={50} style={{ gap: 16, marginTop: 22 }}>
          <View style={{ alignSelf: 'flex-start' }}>
            <Tag label={LEVEL_LABEL[word.level]} bg={colors.trough} fg={INK} />
          </View>
          <Note word={word} color={colors.muted} />
          <View style={styles.whiteCard}>
            <Example word={word} ink={INK} accent={PICK} />
          </View>
        </Enter>
      </Scroll>
      <GotIt onPress={onDone} />
    </>
  );
}

const BODIES: Record<IntroLook['key'], (p: Props) => React.ReactElement> = {
  hero: Hero,
  sticker: Sticker,
  sage: Sage,
  stickerGreen: StickerGreen,
  deck: Deck,
  duo: Duo,
};

export function WordIntro({ look, word, art, onDone }: Props & { look: IntroLook }) {
  const Body = BODIES[look.key];
  return (
    <View style={{ flex: 1 }}>
      <Body word={word} art={art} onDone={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 8, maxWidth: 560, width: '100%', alignSelf: 'center' },
  button: {
    minHeight: 58,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  buttonText: { ...font.body[800], fontSize: 18, color: colors.onPrimary },

  tag: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, overflow: 'hidden' },
  tagText: { ...font.body[800], fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  whiteCard: {
    backgroundColor: CARD,
    borderRadius: radius.lg,
    padding: 20,
    boxShadow: clay.surface,
  },
  clayCard: { boxShadow: clay.surface },

  heroCard: { padding: 24, gap: 8, minHeight: 330 },
  heroPod: {
    position: 'absolute',
    right: 18,
    top: 18,
    width: 104,
    height: 104,
    borderRadius: radius.pill,
    backgroundColor: colors.pod,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArt: { width: 84, height: 84 },
  heroKicker: { ...font.body[800], fontSize: 13, letterSpacing: 1, color: INK, opacity: 0.8 },
  heroWord: { ...font.display[800], color: INK, marginTop: 30 },
  heroMeaning: { ...font.display[700], fontSize: 26, color: INK, opacity: 0.85, marginBottom: 'auto' },

  stickerCard: {
    backgroundColor: CARD,
    borderRadius: radius.lg,
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    boxShadow: clay.surface,
  },
  stickerWord: { ...font.display[800], textAlign: 'center' },
  meaningRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  meaningBig: { ...font.display[800], fontSize: 32, lineHeight: 34, letterSpacing: -0.5 },
  capy: { width: 150, height: 170 },
  capySmall: { width: 96, height: 110 },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 24, gap: 16, boxShadow: clay.float },

  sageWord: { ...font.display[800], color: INK, marginTop: 12 },
  sageMeaning: { ...font.display[700], fontSize: 30, color: INK, opacity: 0.85, marginTop: 4 },

  label: {
    backgroundColor: pastel.butter,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: 200,
    boxShadow: clay.surface,
  },
  labelText: { ...font.display[800], fontSize: 26, color: INK },

  deck: { position: 'relative', paddingHorizontal: 0 },
  deckBack: { position: 'absolute', left: 12, right: 12, top: 8, bottom: 0, borderRadius: radius.xl, boxShadow: clay.surface },

  duoWord: { paddingVertical: 32, paddingHorizontal: 16, alignItems: 'center' },
  duoMeaning: { paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  duoMeaningText: { ...font.display[800], fontSize: 34, letterSpacing: -0.6, color: INK, textAlign: 'center' },
});

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ArWord } from '@/lib/argentine';
import { clay, colors, font, gradients, press } from '@/lib/theme';
import { PlayButton } from '@/components/exercises';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// The "new word" screen of an Argentine pack. Deliberately quiet: the word,
// one short English translation (with an optional two-word tag when the
// translation alone could mislead), a thin line, then the word in a sentence.
// No long note and no mascot: the sentence does the explaining. The word says
// itself on arrival, as in the course; the sentence waits to be tapped, so the
// two never talk over each other.
// ---------------------------------------------------------------------------

const INK = colors.ink;

/** The word's size: a phrase or a long word steps down instead of wrapping badly. */
function wordSize(es: string, max: number) {
  const n = es.length;
  const size = n <= 5 ? max : n <= 8 ? max * 0.78 : n <= 12 ? max * 0.56 : max * 0.44;
  return { fontSize: Math.round(size), lineHeight: Math.round(size * 1.04), letterSpacing: -size * 0.035 };
}

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
        <LinearGradient colors={gradients.deep} style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} pointerEvents="none" />
        <Text style={styles.buttonText}>Got it</Text>
      </Pressable>
    </View>
  );
}

/** The sentence with the word itself underlined. */
function Example({ word }: { word: ArWord }) {
  const text = word.example.es;
  const at = text.toLocaleLowerCase('es').indexOf(word.gap.toLocaleLowerCase('es'));
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.exEs}>
        {at < 0 ? (
          text
        ) : (
          <>
            {text.slice(0, at)}
            <Text style={styles.pick}>{text.slice(at, at + word.gap.length)}</Text>
            {text.slice(at + word.gap.length)}
          </>
        )}
      </Text>
      <Text style={styles.exEn}>{word.example.en}</Text>
      {word.example.audio ? (
        <View style={styles.exPlay}>
          <PlayButton path={word.example.audio} autoPlay={false} />
        </View>
      ) : null}
    </View>
  );
}

export function WordIntro({ word, onDone }: { word: ArWord; onDone: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Enter>
          <View style={styles.wordRow}>
            <View style={{ flex: 1 }}>
              <FitText style={[styles.word, wordSize(word.es, 76)]} lines={2}>
                {word.es}
              </FitText>
            </View>
            {word.audio ? <PlayButton path={word.audio} /> : null}
          </View>
          <View style={styles.enRow}>
            <Text style={styles.en}>{word.en}</Text>
            {word.tag ? <Text style={styles.tag}>{word.tag}</Text> : null}
          </View>
        </Enter>
        <Enter delay={50}>
          <View style={styles.rule} />
          <Example word={word} />
        </Enter>
      </ScrollView>
      <GotIt onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 76, paddingBottom: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 8, maxWidth: 560, width: '100%', alignSelf: 'center' },
  button: {
    minHeight: 58,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  buttonText: { ...font.body[800], fontSize: 18, color: colors.onPrimary },

  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  word: { ...font.display[800], color: INK },
  enRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 12, rowGap: 4, marginTop: 12 },
  en: { ...font.display[700], fontSize: 30, lineHeight: 34, color: INK },
  tag: { ...font.body[700], fontSize: 14, color: colors.muted },

  rule: { height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.border, marginTop: 32, marginBottom: 30 },

  exEs: { ...font.body[600], fontSize: 24, lineHeight: 31, color: INK, textAlign: 'center' },
  pick: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.accent,
    textDecorationStyle: 'solid',
  },
  exEn: { ...font.body[500], fontSize: 18, lineHeight: 25, color: colors.muted, textAlign: 'center' },
  exPlay: { marginTop: 12 },
});

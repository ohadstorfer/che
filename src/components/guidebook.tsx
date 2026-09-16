import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlayButton } from '@/components/exercises';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { colors, press, radius, shadow } from '@/lib/theme';
import type { Tip, Unit } from '@/lib/types';

// ---------------------------------------------------------------------------
// The unit guidebook (learning-engine-spec §9): what the unit is for, the five
// phrases it is built around, and its tips — plus, for a unit still ahead of
// her, the way to test out of what stands between her and it (§7).
//
// A sheet from the bottom edge: it enters with the iOS drawer curve and leaves
// faster than it came, since closing is the system responding, not her deciding.
// ---------------------------------------------------------------------------

const DRAWER = Easing.bezier(0.32, 0.72, 0, 1);

interface Phrase {
  ordinal: number;
  es: string;
  en: string;
  audio_path: string | null;
}

export function Guidebook({
  unit,
  tips,
  onClose,
  jump,
}: {
  unit: Unit | null;
  tips: Tip[];
  onClose: () => void;
  /** Set when she can test out to this unit: what the test spans, and how to start it. */
  jump?: { units: number; onPress: () => void } | null;
}) {
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [phrases, setPhrases] = useState<Phrase[] | null>(null);

  useEffect(() => {
    if (!unit) return;
    setPhrases(null);
    (async () => {
      const { data: rows } = await supabase.from('unit_phrases').select('*').eq('unit_id', unit.id);
      const list = (rows ?? []) as { ordinal: number; sentence_id: string }[];
      if (list.length === 0) return setPhrases([]);
      const { data: sentences } = await supabase
        .from('sentences')
        .select('*')
        .in(
          'id',
          list.map((r) => r.sentence_id),
        );
      const byId = new Map(((sentences ?? []) as { id: string; es: string; en: string; audio_path: string | null }[]).map((s) => [s.id, s]));
      setPhrases(
        list
          .sort((a, b) => a.ordinal - b.ordinal)
          .flatMap((r) => {
            const s = byId.get(r.sentence_id);
            return s ? [{ ordinal: r.ordinal, es: s.es, en: s.en, audio_path: s.audio_path }] : [];
          }),
      );
    })();
  }, [unit]);

  return (
    <Modal visible={!!unit} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {unit ? (
        <View style={styles.root}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(160)}
            style={StyleSheet.absoluteFill}>
            <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close guidebook" />
          </Animated.View>
          <Animated.View
            entering={reduced ? FadeIn.duration(200) : SlideInDown.duration(320).easing(DRAWER)}
            exiting={reduced ? FadeOut.duration(160) : SlideOutDown.duration(200).easing(DRAWER)}
            style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.grabber} />
            <View style={styles.head}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.eyebrow}>UNIT {unit.ordinal} · GUIDEBOOK</Text>
                <Text style={styles.title}>{unit.title_en}</Text>
                <Text style={styles.summary}>{unit.summary_en}</Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                accessibilityLabel="Close"
                style={({ pressed }) => [styles.close, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {phrases && phrases.length > 0 ? (
                <View style={styles.block}>
                  <Text style={styles.label}>Key phrases</Text>
                  {phrases.map((p) => (
                    <View key={p.ordinal} style={styles.phrase}>
                      {p.audio_path ? <PlayButton path={p.audio_path} /> : null}
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.phraseEs}>{p.es}</Text>
                        <Text style={styles.phraseEn}>{p.en}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              {tips.length > 0 ? (
                <View style={styles.block}>
                  <Text style={styles.label}>Tips</Text>
                  {tips.map((t) => (
                    <View key={t.id} style={styles.tip}>
                      <Text style={styles.tipTitle}>{t.title_en}</Text>
                      <Text style={styles.tipBody}>{plain(t.body_md)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            {jump ? (
              <View style={styles.jump}>
                <Text style={styles.jumpText}>
                  Already know this? Pass a short test on {jump.units === 1 ? 'the unit' : `the ${jump.units} units`} before
                  it and start here.
                </Text>
                <Button title="Jump here" onPress={jump.onPress} />
              </View>
            ) : null}
          </Animated.View>
        </View>
      ) : null}
    </Modal>
  );
}

/** Tips are written with **bold** and *italic*; the guidebook shows them plain. */
const plain = (md: string) => md.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { flex: 1, backgroundColor: 'rgba(31, 37, 33, 0.38)' },
  sheet: {
    maxHeight: '86%',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
    ...shadow.raised,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: colors.faint },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  summary: { fontSize: 15, color: colors.muted },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  body: { gap: 18, paddingBottom: 4 },
  block: { gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, letterSpacing: 0.3 },
  phrase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phraseEs: { fontSize: 18, fontWeight: '700', color: colors.ink },
  phraseEn: { fontSize: 15, color: colors.primaryDark },
  tip: { gap: 4 },
  tipTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  tipBody: { fontSize: 15, lineHeight: 22, color: colors.ink },
  jump: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  jumpText: { fontSize: 14, lineHeight: 20, color: colors.muted },
});

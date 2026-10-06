import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { POSE, pop } from '@/components/mascot';
import { Button } from '@/components/ui';
import { clay, colors, font, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The class while it loads. Not a screen of its own with a spinner on it: the
// class's own frame — the way out, the empty bar, the button at the bottom —
// with nothing in the middle yet, so the first exercise arrives into a room
// that is already there. Most classes open in under a second, and a loading
// screen that long is only a flash between two others.
//
// A wait that does drag (a weak signal) gets Pancho and a line after a
// second, so it reads as something happening rather than something stuck.
// ---------------------------------------------------------------------------

/** How long the middle stays empty before the wait is admitted to. */
const SLOW_MS = 1000;

/** The middle of the frame: empty, then Pancho once the wait has gone on. */
export function ClassWait({ line = 'Getting your class ready…' }: { line?: string }) {
  const reduced = useReducedMotion();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.wait} accessibilityRole="progressbar" accessibilityLabel={line}>
      {slow ? (
        <Animated.View entering={pop(0, reduced)} style={styles.slow}>
          <Image source={POSE.sip} style={styles.figure} contentFit="contain" />
          <Text style={styles.line}>{line}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

export function ClassDoor({ onClose, line }: { onClose: () => void; line?: string }) {
  const inset = useSafeAreaInsets().bottom;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.muted} />
        </Pressable>
        <View style={styles.track} />
        <View style={styles.counter} />
      </View>
      <View style={styles.frame}>
        <ClassWait line={line} />
        {/* The docked button's place, held: it has no word yet, since the first
            screen may be a tip ("Got it") as easily as an exercise ("Check"). */}
        <View style={[styles.footer, { paddingBottom: 20 + inset }]} importantForAccessibility="no-hide-descendants" aria-hidden>
          <Button title=" " variant="check" onPress={() => {}} disabled />
        </View>
      </View>
    </SafeAreaView>
  );
}

// The header and footer repeat practice.tsx's and exercise-frame.tsx's
// measures: the point is that nothing moves when the class takes over.
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  track: { flex: 1, height: 18, borderRadius: radius.pill, backgroundColor: colors.trough, boxShadow: clay.trough },
  counter: { minWidth: 40 },
  frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  footer: { padding: 20, paddingTop: 12, gap: 10 },
  wait: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  slow: { alignItems: 'center', gap: 14 },
  figure: { width: 132, height: 132 },
  line: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center' },
});

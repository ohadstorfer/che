import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui';
import { clay, colors, font, pastel, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The placement card a brand-new learner sees above the path: a salvia sticker
// with Pancho reading in a round frame and a few loose stickers around him.
// "I'm new" hides it for good on this device; starting a lesson hides it anyway.
// ---------------------------------------------------------------------------

const hiddenKey = (userId: string) => `placement-card-hidden:${userId}`;

export function PlacementCard({ userId }: { userId?: string }) {
  // Starts hidden until storage answers, so a dismissed card never flashes in.
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!userId) {
      setHidden(false);
      return;
    }
    let live = true;
    AsyncStorage.getItem(hiddenKey(userId))
      .then((v) => live && setHidden(v === '1'))
      .catch(() => live && setHidden(false));
    return () => {
      live = false;
    };
  }, [userId]);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    if (userId) AsyncStorage.setItem(hiddenKey(userId), '1').catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={[styles.dot, styles.dotButter]} pointerEvents="none" />
      <View style={[styles.dot, styles.dotPeach]} pointerEvents="none" />
      <Svg width={34} height={34} viewBox="0 0 24 24" style={styles.star} pointerEvents="none">
        <Path
          d="M12 2l2.6 6.4L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.6z"
          fill={pastel.lav}
          stroke={colors.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.frame} pointerEvents="none">
        <Image source={require('@/assets/images/capybara/capybara-historia-figure.webp')} style={styles.pancho} contentFit="contain" />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        Already know some?
      </Text>
      <Text style={styles.body}>A short test finds where you should start,{'\n'}so you don&apos;t sit through what you know.</Text>
      <View style={styles.actions}>
        <View style={styles.primary}>
          <Button title="Take the test" onPress={() => router.push('/practice?test=placement')} />
        </View>
        <Button title="I'm new" variant="secondary" onPress={dismiss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: pastel.sage,
    borderRadius: radius.lg - 2,
    boxShadow: clay.surface,
    padding: 22,
    gap: 12,
    overflow: 'hidden',
  },
  dot: { position: 'absolute', boxShadow: `0 0 0 2px ${colors.ink}` },
  dotButter: { right: 108, top: 18, width: 28, height: 28, borderRadius: radius.pill, backgroundColor: pastel.butter },
  dotPeach: { right: 6, top: 8, width: 22, height: 22, borderRadius: 6, backgroundColor: pastel.peach, transform: [{ rotate: '18deg' }] },
  star: { position: 'absolute', right: 118, top: 66 },
  frame: {
    position: 'absolute',
    right: 8,
    top: 6,
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pancho: { width: 90, height: 90 },
  title: { ...font.display[900], fontSize: 30, lineHeight: 31, color: colors.ink, maxWidth: 180, marginTop: 4 },
  body: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.ink, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  primary: { flex: 1 },
});

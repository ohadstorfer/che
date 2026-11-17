import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { POSE } from '@/components/mascot';
import { Button } from '@/components/ui';
import { clay, colors, font, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// "Leave the class?" — raised by the close button (or Android's back) once she
// has answered something, because leaving throws the class away. Staying is
// the big button; leaving is there, plainly, under it.
// ---------------------------------------------------------------------------
export function QuitSheet({
  open,
  test,
  onStay,
  onQuit,
}: {
  open: boolean;
  test: boolean;
  onStay: () => void;
  onQuit: () => void;
}) {
  const inset = useSafeAreaInsets().bottom;
  // Drawn over the class inside the screen itself, not in a native Modal: a
  // Modal still closing as the screen goes away can stay behind on iOS as an
  // invisible layer that swallows every touch in the app.
  if (!open) return null;
  return (
    <View style={[StyleSheet.absoluteFill, styles.quitLayer]}>
        <View style={styles.quitDock}>
          <Animated.View entering={FadeIn.duration(200)} style={[StyleSheet.absoluteFill, styles.quitScrim]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onStay} accessibilityLabel="Keep going" />
          </Animated.View>
          <Animated.View
            entering={SlideInDown.duration(300).easing(Easing.bezier(0.32, 0.72, 0, 1))}
            style={[styles.quitSheet, { paddingBottom: 20 + inset }]}>
            <Image source={POSE.sip} style={styles.quitFigure} contentFit="contain" accessible={false} />
            <Text style={styles.quitTitle}>Wait, don&apos;t go!</Text>
            <Text style={styles.quitBody}>
              {test
                ? "If you leave now, this test won't count."
                : "If you leave now, you'll lose your progress in this lesson."}
            </Text>
            <Button title="Keep going" onPress={onStay} />
            <Button title={test ? 'Leave the test' : 'End lesson'} variant="ghost" onPress={onQuit} />
          </Animated.View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quitLayer: { zIndex: 10, elevation: 10 },
  quitDock: { flex: 1, justifyContent: 'flex-end' },
  quitScrim: { backgroundColor: 'rgba(58, 42, 32, 0.38)' },
  quitSheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'stretch',
    gap: 10,
    padding: 24,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    boxShadow: clay.float,
  },
  quitFigure: { width: 104, height: 104, alignSelf: 'center' },
  quitTitle: { ...font.display[800], fontSize: 24, letterSpacing: -0.3, color: colors.ink, textAlign: 'center' },
  quitBody: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.muted, textAlign: 'center', marginBottom: 8 },
});

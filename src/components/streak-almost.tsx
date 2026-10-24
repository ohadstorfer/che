import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, font } from '@/lib/theme';

/**
 * The end of the first round on a comeback day, whatever the round was (a
 * lesson, a story, a slang or culture class, a chat): the frozen run is banked
 * and one more round today buys it back (finish_lesson). It stands in for the
 * streak celebration, which would cheer a 0 → 1 while the old run waits.
 */
export function StreakAlmost({
  lost,
  moreLabel = 'Next lesson',
  onMore,
  onHome,
}: {
  lost: number;
  moreLabel?: string;
  onMore: () => void;
  onHome?: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <View style={styles.panel}>
          <Text style={styles.title}>One more to go!</Text>
          <Image
            source={require('@/assets/images/mate-frozen-figure.png')}
            style={styles.art}
            contentFit="contain"
            accessible={false}
          />
          <Text style={styles.body}>One more lesson today and your {lost} day streak is back.</Text>
          <Button title={moreLabel} onPress={onMore} />
          {onHome ? <Button title="Back home" variant="ghost" onPress={onHome} /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  panel: { alignItems: 'stretch', gap: 12, maxWidth: 400, width: '100%' },
  title: { ...font.display[800], fontSize: 26, letterSpacing: -0.3, color: colors.ink, textAlign: 'center' },
  art: { width: 210, height: 210, alignSelf: 'center' },
  body: { ...font.body[600], fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
});

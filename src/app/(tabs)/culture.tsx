import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenTitle } from '@/components/ui';
import { cultureSections, useCultureDone } from '@/lib/culture';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { colors, press, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Culture — mate, asado, fútbol and the rest: every section with its classes,
// all open from the start. They sit apart from the path; nothing here is
// unlocked by the course, and nothing in the course waits on them.
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, background-color',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as object)
    : null;

export default function Culture() {
  useStatusBarColor(colors.bg);
  const isDone = useCultureDone();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 4 }}>
          <ScreenTitle>Culture</ScreenTitle>
          <Text style={styles.lede}>Short classes about Argentine life. Pick anything.</Text>
        </View>

        {cultureSections.map((section) => {
          const finished = section.classes.filter((c) => isDone(section.slug, c.slug)).length;
          return (
            <View key={section.slug} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionSummary} numberOfLines={2}>
                    {section.summary}
                  </Text>
                </View>
                <Text style={styles.count}>
                  {finished}/{section.classes.length}
                </Text>
              </View>

              <View style={styles.card}>
                {section.classes.map((cls, i) => {
                  const done = isDone(section.slug, cls.slug);
                  return (
                    <Pressable
                      key={cls.slug}
                      onPress={() => router.push(`/culture-class?section=${section.slug}&class=${cls.slug}`)}
                      style={({ pressed }) => [
                        styles.row,
                        i > 0 && styles.rowRule,
                        pressed && { backgroundColor: colors.primarySoft },
                        webPress,
                      ]}>
                      <View style={[styles.dot, done && styles.dotDone]}>
                        {done ? (
                          <Ionicons name="checkmark" size={15} color={colors.onPrimary} />
                        ) : (
                          <Text style={styles.dotText}>{i + 1}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.classTitle}>{cls.title}</Text>
                        <Text style={styles.classSummary} numberOfLines={2}>
                          {cls.summary}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 26, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  lede: { fontSize: 15, color: colors.muted },
  section: { gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionEmoji: { fontSize: 32 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: colors.ink, letterSpacing: -0.2 },
  sectionSummary: { fontSize: 14, color: colors.muted },
  count: { fontSize: 14, fontWeight: '700', color: colors.muted, fontVariant: ['tabular-nums'] },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  rowRule: { borderTopWidth: 1, borderTopColor: colors.border },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  dotText: { fontSize: 13, fontWeight: '700', color: colors.muted, fontVariant: ['tabular-nums'] },
  classTitle: { fontSize: 16, fontWeight: '600', color: colors.ink },
  classSummary: { fontSize: 14, color: colors.muted, lineHeight: 19 },
});

import { Ionicons } from '@expo/vector-icons';
import { createContext, useContext, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { QueueItem } from '@/lib/round';
import { colors, press, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Under a wrong answer: "My answer should be accepted" (learning-engine-spec
// §6.2) and "Why?" (§6.3). The screen playing the round decides what each one
// does by providing AnswerActions; without a provider, nothing shows.
// ---------------------------------------------------------------------------

export interface AnswerActions {
  report: (item: QueueItem, answer: string) => Promise<void>;
  /** The explanation, or null when there isn't one to give. */
  explain: (item: QueueItem, answer: string) => Promise<string | null>;
}

export const AnswerActionsContext = createContext<AnswerActions | null>(null);

/** Modes whose answer is something she built or typed, so it can be reported. */
const REPORTABLE = new Set(['sentence_build', 'sentence_listen', 'typing', 'word_build']);

export function WrongAnswerActions({ item, answer }: { item: QueueItem; answer: string }) {
  const actions = useContext(AnswerActionsContext);
  const [reported, setReported] = useState(false);
  const [why, setWhy] = useState<{ loading: boolean; text: string | null } | null>(null);

  if (!actions || !answer.trim() || item.placementUnit) return null;
  const reportable = REPORTABLE.has(item.mode);

  const report = () => {
    if (reported) return;
    setReported(true);
    void actions.report(item, answer);
  };
  const explain = async () => {
    if (why) return;
    setWhy({ loading: true, text: null });
    const text = await actions.explain(item, answer);
    setWhy({ loading: false, text: text ?? "Couldn't explain this one right now." });
  };

  return (
    <View style={styles.wrap}>
      {why ? (
        <View style={styles.why}>
          {why.loading ? (
            <ActivityIndicator size="small" color={colors.dangerInk} />
          ) : (
            <Text style={styles.whyText}>
              {(why.text ?? '').split(/(\*[^*]+\*)/g).map((part, i) =>
                part.startsWith('*') && part.endsWith('*') ? (
                  <Text key={i} style={styles.whyEs}>
                    {part.slice(1, -1)}
                  </Text>
                ) : (
                  part
                ),
              )}
            </Text>
          )}
        </View>
      ) : null}
      <View style={styles.row}>
        {!why ? <Chip icon="help-circle-outline" label="Why?" onPress={explain} /> : null}
        {reportable ? (
          <Chip
            icon={reported ? 'checkmark' : 'flag-outline'}
            label={reported ? 'Reported — thanks' : 'My answer should be accepted'}
            onPress={report}
            disabled={reported}
          />
        ) : null}
      </View>
    </View>
  );
}

function Chip({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        disabled && styles.chipDone,
        { transform: [{ scale: pressed && !disabled ? press.scale : 1 }] },
        Platform.OS === 'web'
          ? ({
              transitionProperty: 'transform',
              transitionDuration: `${press.duration}ms`,
              transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
            } as object)
          : null,
      ]}>
      <Ionicons name={icon} size={15} color={colors.dangerInk} />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(184, 84, 58, 0.35)',
  },
  chipDone: { opacity: 0.7 },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.dangerInk },
  why: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  whyText: { fontSize: 15, lineHeight: 21, color: colors.dangerInk },
  whyEs: { fontWeight: '700', fontStyle: 'italic' },
});

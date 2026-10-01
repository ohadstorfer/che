import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Diff, DiloButton, PanchoAvatar, webPress } from '@/components/hablar-ui';
import { Button } from '@/components/ui';
import {
  type ConversationRow,
  conversationTitle,
  end,
  type HablarSummary,
  isToday,
  loadConversation,
  signedHablarUrl,
  summaryCache,
  type TurnRow,
  wordDiff,
} from '@/lib/hablar';
import { play, stopAll, usePlaying } from '@/lib/hablar-audio';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel, pastelGrad, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The summary (§2.5), and History's view of an old chat. Generic summaries are
// the top complaint about these apps, so this one is concrete and short:
// the top corrections (each with Decilo), phrases worth keeping, one
// specific line on what went well. The full transcript folds away below.
// ---------------------------------------------------------------------------

export default function HablarSummaryScreen() {
  useStatusBarColor(colors.bg);
  const { session: sessionId } = useLocalSearchParams<{ session?: string }>();
  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [turns, setTurns] = useState<TurnRow[]>([]);
  const [summary, setSummary] = useState<HablarSummary | null>(sessionId ? (summaryCache.get(sessionId) ?? null) : null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!sessionId) return setState('missing');
    let alive = true;
    (async () => {
      const loaded = await loadConversation(sessionId).catch(() => null);
      if (!alive) return;
      if (!loaded) return setState(summary ? 'ready' : 'missing');
      const { conversation: c, turns: t } = loaded;
      // An open chat from today belongs in the chat screen, not here.
      if (!c.ended_at && isToday(c)) return router.replace(`/hablar-chat?session=${c.id}`);
      setConversation(c);
      setTurns(t);
      let s = summary ?? c.summary;
      if (!s) s = await end({ session_id: c.id, reason: 'time' }).catch(() => null);
      if (!alive) return;
      setSummary(s);
      setState('ready');
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // A unit chat was opened from the road (or from History): back to wherever that was.
  const close = () => (conversation?.kind === 'unit' ? goBack('/home') : router.dismissTo('/hablar'));

  if (state === 'loading') {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Pancho is writing up your chat…</Text>
      </SafeAreaView>
    );
  }
  if (state === 'missing') {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={styles.muted}>This chat isn't here.</Text>
        <Button title="Back to Speaking" onPress={close} />
      </SafeAreaView>
    );
  }

  const s = summary ?? {};

  const corrections = (s.corrections ?? []).slice(0, 3);
  const phrases = (s.phrases ?? []).slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={close}
          hitSlop={10}
          accessibilityLabel="Close"
          style={({ pressed }) => [styles.back, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.hero}>
          <LinearGradient colors={pastelGrad.sage} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <View style={styles.pod}>
            <PanchoAvatar size={64} />
          </View>
          <Text style={styles.title}>¡Bien ahí!</Text>
          {conversation ? (
            <Text style={styles.heroMeta}>
              {conversationTitle(
                conversation.kind,
                conversation.topic_id,
                conversation.summary?.title ?? conversation.scenario?.title_en,
              )} · {formatDay(conversation.local_date)}
            </Text>
          ) : null}
          {s.xp ? (
            <View style={styles.rewards}>
              <Reward icon="star-four-points" label={`+${s.xp} XP`} delay={150} />
            </View>
          ) : null}
        </View>

        {corrections.length ? (
          <Card title="Worth fixing">
            {corrections.map((c, i) => (
              <View key={i} style={[styles.correction, i > 0 && styles.divider]}>
                <Diff parts={wordDiff(c.said, c.corrected)} size={17} />
                {c.why_en ? <Text style={styles.small}>{c.why_en}</Text> : null}
                <View style={styles.correctionActions}>
                  {c.audio_path ? <PlayClip path={c.audio_path} id={`summary-${i}`} /> : null}
                  {sessionId ? <View style={{ flex: 1 }}><DiloButton sessionId={sessionId} target={c.corrected} /></View> : null}
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        {phrases.length ? (
          <Card title="Phrases worth keeping">
            {phrases.map((p, i) => (
              <View key={i}>
                <Text style={styles.phraseEs}>{p.es}</Text>
                {p.en ? <Text style={styles.small}>{p.en}</Text> : null}
              </View>
            ))}
          </Card>
        ) : null}

        {s.went_well ? (
          <View style={styles.well}>
            <MaterialCommunityIcons name="thumb-up-outline" size={18} color={colors.onPastel} />
            <Text style={styles.wellText}>{s.went_well}</Text>
          </View>
        ) : null}

        {turns.length ? (
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => setShowTranscript((v) => !v)}
              accessibilityRole="button"
              style={styles.transcriptToggle}>
              <Text style={styles.transcriptToggleText}>{showTranscript ? 'Hide the chat' : 'See the whole chat'}</Text>
              <Ionicons name={showTranscript ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
            </Pressable>
            {showTranscript
              ? turns
                  .filter((t) => t.role === 'tomas' || t.status !== 'draft')
                  .map((t) =>
                    t.role === 'tomas' ? (
                      <View key={t.id} style={styles.tRow}>
                        <PanchoAvatar size={26} />
                        <View style={styles.tPancho}>
                          <Text style={styles.tText}>{t.text}</Text>
                          {t.text_en ? <Text style={styles.small}>{t.text_en}</Text> : null}
                        </View>
                      </View>
                    ) : (
                      <View key={t.id} style={styles.tUser}>
                        <Text style={styles.tUserText}>{t.text}</Text>
                        {t.feedback?.has_error ? (
                          <Text style={styles.tFix}>→ {t.feedback.corrected}</Text>
                        ) : null}
                      </View>
                    ),
                  )
              : null}
          </View>
        ) : null}

        <Button title="Listo" onPress={close} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PlayClip({ path, id }: { path: string; id: string }) {
  const playing = usePlaying();
  const on = playing?.key === id;
  return (
    <Pressable
      onPress={() => (on ? stopAll() : void play(id, () => signedHablarUrl(path)))}
      accessibilityRole="button"
      accessibilityLabel="Play"
      style={({ pressed }) => [styles.play, on && { backgroundColor: colors.primary }, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
      <MaterialCommunityIcons name={on ? 'stop' : 'play'} size={20} color={on ? colors.onPrimary : colors.primary} />
    </Pressable>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

/** The reward chips arrive once, slightly after the page: a rare moment, so it gets a little lift. */
function Reward({ icon, label, delay }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; delay: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 320, delay, easing: Easing.bezier(0.23, 1, 0.32, 1), useNativeDriver: true }).start();
  }, [t, delay]);
  return (
    <Animated.View
      style={[
        styles.reward,
        { opacity: t, transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
      ]}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.onPastel} />
      <Text style={styles.rewardText}>{label}</Text>
    </Animated.View>
  );
}

function formatDay(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  container: { padding: 20, paddingTop: 8, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.surface,
  },
  // A sage clay hero: Pancho on his soft white pod, the chat's name under him.
  hero: {
    alignItems: 'center',
    gap: 6,
    padding: 22,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: clay.surface,
  },
  pod: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.pod,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...font.display[800], fontSize: 30, letterSpacing: -0.6, color: colors.onPastel, marginTop: 4 },
  heroMeta: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8, textAlign: 'center' },
  muted: { ...font.body[600], fontSize: 15, color: colors.muted },
  small: { ...font.body[600], fontSize: 13, lineHeight: 18, color: colors.muted },
  rewards: { flexDirection: 'row', gap: 8, marginTop: 8 },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    boxShadow: clay.surface,
  },
  rewardText: { ...font.body[800], fontSize: 14, color: colors.onPastel, fontVariant: ['tabular-nums'] },

  card: {
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  cardTitle: { ...font.display[800], fontSize: 20, letterSpacing: -0.1, color: colors.ink },
  correction: { gap: 8 },
  correctionActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  phraseEs: { ...font.display[700], fontSize: 18, color: colors.ink },
  well: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: pastel.butter,
    boxShadow: clay.surface,
    alignItems: 'flex-start',
  },
  wellText: { ...font.body[700], flex: 1, fontSize: 15, lineHeight: 21, color: colors.onPastel },

  transcriptToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 },
  transcriptToggleText: { ...font.body[800], fontSize: 15, color: colors.primary },
  tRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', paddingRight: 32 },
  // Transcript bubbles echo the chat: his in clay, hers rosa-tinted.
  tPancho: {
    flex: 1,
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    boxShadow: clay.surface,
  },
  tText: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.ink },
  tUser: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: 22,
    borderBottomRightRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tUserText: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.ink },
  tFix: { ...font.body[700], fontSize: 13, color: colors.success },
});

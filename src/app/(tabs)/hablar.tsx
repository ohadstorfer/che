import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PanchoAvatar, Sheet, StartButton, webPress } from '@/components/hablar-ui';
import { AppHeader, useStreakWeek } from '@/components/app-header';
import { useAuth } from '@/lib/auth';
import {
  type Band,
  type ConversationRow,
  conversationTitle,
  end,
  getDefaultLevel,
  history,
  isToday,
  latestConversation,
  type Scenario,
  scenarioAt,
  scenarios,
} from '@/lib/hablar';
import { freeChatArt, levelDistance, pickScenario, scenarioArt } from '@/lib/hablar-art';
import { chatsUsed, FREE_CHATS, usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, type PastelName, pastel, pastelGrad, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// Speaking — one short chat a day with Pancho (docs/hablar-hld.md §2.1).
//
// The top card is the day: Pancho's pick with one Start button while the chat
// is still there to take, Resume while one is open, and once it's used, what
// she got out of it and tomorrow's pick. Below, everything
// else she could talk about instead — a scenario, or talking about anything.
// The level switch opens at the level of her last chat (her course level on a
// first visit) and shows every scenario at that level, the ones written for
// it first. The brief's chip can still move it before she starts.
// ---------------------------------------------------------------------------

type Today =
  | { state: 'loading' }
  | { state: 'free' }
  | { state: 'open'; conversation: ConversationRow }
  | { state: 'done'; conversation: ConversationRow };


/** Scenario rows deal their icon circles through these, so neighbours differ. */
const ROW_TONES = [pastel.peach, pastel.sage, pastel.lav, pastel.sky, pastel.butter] as const;

export default function Hablar() {
  const { height } = useWindowDimensions();
  useStatusBarColor(colors.bg);
  const { status: streak, weekDone } = useStreakWeek();
  const [today, setToday] = useState<Today>({ state: 'loading' });
  const [past, setPast] = useState<ConversationRow[]>([]);
  /** Pancho's call was answered: the sheet asking what to talk about is up. */
  const [choosing, setChoosing] = useState(false);
  /** Her saved level; null until read. It is changed on the brief, not here. */
  const [level, setLevel] = useState<Band | null>(null);
  // Staff have no daily limit (hablar-start agrees), so a finished chat never locks the tab.
  const { profile } = useAuth();
  const staff = profile?.role === 'admin' || profile?.role === 'reviewer';
  // A free account has a few chats in all; null until counted.
  const { limited, paywall } = usePremium();
  const [used, setUsed] = useState<number | null>(null);
  const freeLeft = limited && used != null ? Math.max(0, FREE_CHATS - used) : null;

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        let latest = await latestConversation().catch(() => null);
        // A chat left open on an earlier day (app killed mid-chat): close it
        // quietly so it gets its summary. The streak isn't bumped for that day.
        if (latest && !latest.ended_at && !isToday(latest)) {
          await end({ session_id: latest.id, reason: 'time' }).catch(() => {});
          latest = null;
        }
        const [rows, count, band] = await Promise.all([
          history().catch(() => []),
          profile && limited ? chatsUsed(profile.id).catch(() => null) : Promise.resolve(null),
          getDefaultLevel().catch((): Band => 'A1'),
        ]);
        if (!alive) return;
        setPast(rows);
        setLevel(band);
        setUsed(count);
        // Staff chats don't use up the day: a finished one leaves the door open.
        if (latest && isToday(latest) && !((latest.unlimited || staff) && latest.ended_at)) {
          setToday({ state: latest.ended_at ? 'done' : 'open', conversation: latest });
        } else setToday({ state: 'free' });
      })();
      return () => {
        alive = false;
      };
    }, [staff, profile, limited]),
  );

  const openDoor = (kind: 'scenario' | 'free', topic?: string) => {
    if (today.state === 'open') return router.push(`/hablar-chat?session=${today.conversation.id}`);
    if (today.state === 'done') return router.push(`/hablar-summary?session=${today.conversation.id}`);
    if (freeLeft === 0) return paywall('hablar');
    router.push(`/hablar-brief?kind=${kind}${topic ? `&topic=${topic}` : ''}&level=${band}`);
  };

  const band: Band = level ?? 'A1';
  const pick = level ? pickScenario(past, band) : null;
  // Every scenario, the ones written at this level first; otherwise course order.
  const byFit = [...scenarios].sort((a, b) => levelDistance(a, band) - levelDistance(b, band));

  return (
    <View style={styles.safe}>
      <AppHeader title="Speaking" status={streak} weekDone={weekDone} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {freeLeft != null && today.state === 'free' ? (
          <Pressable
            onPress={() => paywall('hablar')}
            accessibilityRole="button"
            hitSlop={6}
            style={({ pressed }) => [styles.freeLeft, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
            <MaterialCommunityIcons name="microphone-outline" size={16} color={colors.muted} />
            <Text style={styles.freeLeftText}>
              {freeLeft === 0
                ? 'Your free chats are used up.'
                : `${freeLeft} free ${freeLeft === 1 ? 'chat' : 'chats'} left.`}{' '}
              <Text style={styles.freeLeftLink}>Talk every day</Text>
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </Pressable>
        ) : null}

        {today.state === 'loading' ? (
          <View style={[styles.hero, styles.heroLoading]} />
        ) : today.state === 'done' ? (
          <DoneCard conversation={today.conversation} />
        ) : today.state === 'open' ? (
          <ResumeCard conversation={today.conversation} />
        ) : pick ? (
          <CallCard onAnswer={() => setChoosing(true)} />
        ) : null}

        {today.state === 'done' && pick ? <Tomorrow scenario={pick} band={band} /> : null}

        {today.state !== 'done' ? (
          <View style={styles.section}>
            <View style={styles.list}>
              {byFit.map((s, i) => {
                const v = scenarioAt(s, band);
                return (
                  <Row
                    key={s.id}
                    art={scenarioArt(s.id)}
                    tone={i}
                    title={s.title_en}
                    sub={`With ${v.role_en}`}
                    label={s.title_en}
                    onPress={() => openDoor('scenario', s.id)}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

      </ScrollView>

      {/* Answering Pancho: say what to talk about — anything, or a scenario. */}
      <Sheet open={choosing} onClose={() => setChoosing(false)}>
        <View style={styles.askHead}>
          <PanchoAvatar size={48} />
          <Text style={styles.askTitle} accessibilityRole="header">
            ¡Hola! What do you want to talk about?
          </Text>
        </View>
        <ScrollView style={{ maxHeight: height * 0.62 }} contentContainerStyle={styles.askList}>
          <Pressable
            onPress={() => {
              setChoosing(false);
              openDoor('free');
            }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.freeRow, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
            <LinearGradient colors={pastelGrad.lav} style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={styles.freeArt}>
              <Image source={freeChatArt} style={styles.rowImage} contentFit="contain" accessible={false} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.freeTitle}>Talk about anything</Text>
              <Text style={styles.freeSub}>No script. Pancho follows your lead.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onPastel} />
          </Pressable>
          <Text style={styles.askLabel}>OR PICK A SCENARIO</Text>
          {byFit.map((s, i) => {
            const v = scenarioAt(s, band);
            return (
              <Row
                key={s.id}
                art={scenarioArt(s.id)}
                tone={i}
                title={s.title_en}
                sub={`With ${v.role_en}`}
                label={s.title_en}
                onPress={() => {
                  setChoosing(false);
                  openDoor('scenario', s.id);
                }}
              />
            );
          })}
        </ScrollView>
      </Sheet>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The day's card, in its three states.
// ---------------------------------------------------------------------------

/** A pastel clay hero: the day's card in every state. */
function Hero({ tone = 'sky', children }: { tone?: PastelName; children: React.ReactNode }) {
  return (
    <View style={styles.hero}>
      <LinearGradient colors={pastelGrad[tone]} style={StyleSheet.absoluteFill} pointerEvents="none" />
      {children}
    </View>
  );
}

/** Pancho in his manteca circle, saying `line` in a chip bubble. */
function PanchoSays({ line }: { line: string }) {
  return (
    <View style={styles.says}>
      <PanchoAvatar size={64} />
      <View style={styles.saysCol}>
        <Text style={styles.saysName}>Pancho</Text>
        <View style={styles.bubble}>
          <FitText style={styles.bubbleText} lines={3}>
            {line}
          </FitText>
        </View>
      </View>
    </View>
  );
}

/**
 * Pancho "calling": what this tab is, said as plainly as a phone ringing — an
 * AI who talks like a porteño, out loud. Answering asks what to talk about.
 */
function CallCard({ onAnswer }: { onAnswer: () => void }) {
  return (
    <Hero tone="sage">
      <View style={styles.call}>
        <View style={styles.callKicker}>
          <View style={styles.aiChip}>
            <Ionicons name="sparkles" size={12} color={colors.onPastel} />
            <Text style={styles.aiChipText}>AI</Text>
          </View>
          <Text style={styles.heroEyebrow}>Voice chat · Buenos Aires</Text>
        </View>
        <View style={styles.rings}>
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringInner]} />
          <PanchoAvatar size={92} />
        </View>
        <Text style={styles.callTitle} accessibilityRole="header">
          Pancho is calling…
        </Text>
        <Text style={styles.callText}>
          An AI who talks like a porteño. Pick up and practice your Spanish out loud.
        </Text>
      </View>
      <StartButton label="Answer" icon="phone" onPress={onAnswer} />
    </Hero>
  );
}

function ResumeCard({ conversation }: { conversation: ConversationRow }) {
  return (
    <Hero>
      <View style={styles.heroHead}>
        <Text style={styles.heroEyebrow}>Chat in progress</Text>
        <Text style={styles.heroTitle}>{conversationTitle(conversation.kind, conversation.topic_id, conversation.summary?.title)}</Text>
      </View>
      <PanchoSays line="Pancho is waiting for your answer. Pick up where you left off." />
      <StartButton label="Resume" onPress={() => router.push(`/hablar-chat?session=${conversation.id}`)} />
    </Hero>
  );
}

/** Today's chat is used: what it gave her and a way into the summary. */
function DoneCard({ conversation }: { conversation: ConversationRow }) {
  const summary = conversation.summary;
  const stats: [string, string][] = [
    [String(summary?.turns ?? 0), (summary?.turns ?? 0) === 1 ? 'answer' : 'answers'],
    [String(summary?.phrases?.length ?? 0), 'new phrases'],
    [String(summary?.corrections?.length ?? 0), (summary?.corrections?.length ?? 0) === 1 ? 'fix' : 'fixes'],
  ];
  return (
    <Hero tone="sage">
      <View style={styles.heroBody}>
        <View style={[styles.heroHead, { flex: 1 }]}>
          <Text style={styles.heroEyebrow}>Done for today</Text>
          <Text style={styles.heroTitle}>¡Bien ahí!{'\n'}A real chat, out loud.</Text>
        </View>
        <View style={styles.doneArtPod}>
          <Image source={scenarioArt('conocer')} style={styles.doneArt} contentFit="contain" accessible={false} />
        </View>
      </View>
      <View style={styles.stats}>
        {stats.map(([n, l]) => (
          <View key={l} style={styles.stat}>
            <Text style={styles.statNum}>{n}</Text>
            <Text style={styles.statLabel}>{l}</Text>
          </View>
        ))}
      </View>
      <StartButton
        icon={null}
        label="See what Pancho noticed"
        onPress={() => router.push(`/hablar-summary?session=${conversation.id}`)}
      />
    </Hero>
  );
}

/** What's waiting tomorrow, and how long until it opens. */
function Tomorrow({ scenario, band }: { scenario: Scenario; band: Band }) {
  const v = scenarioAt(scenario, band);
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const hours = Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000));
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tomorrow</Text>
      <View style={styles.tomorrow}>
        <View style={[styles.rowArt, { backgroundColor: pastel.butter }]}>
          <Image source={scenarioArt(scenario.id)} style={styles.rowImage} contentFit="contain" accessible={false} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{scenario.title_en}</Text>
          <FitText style={styles.rowSub} lines={1}>
            {`With ${v.role_en}`}
          </FitText>
        </View>
        <Text style={styles.tomorrowIn}>in {hours} h</Text>
      </View>
    </View>
  );
}

/** A scenario as a clay row: pastel circle with its art, name, who Pancho plays, level. */
function Row({
  art,
  tone,
  title,
  sub,
  label,
  onPress,
}: {
  art: ImageSourcePropType;
  tone: number;
  title: string;
  sub: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
      <View style={[styles.rowArt, { backgroundColor: ROW_TONES[tone % ROW_TONES.length] }]}>
        <Image source={art} style={styles.rowImage} contentFit="contain" accessible={false} />
      </View>
      <View style={styles.rowText}>
        <FitText style={styles.rowTitle} lines={1}>
          {title}
        </FitText>
        <FitText style={styles.rowSub} lines={2}>
          {sub}
        </FitText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The free-chats count: a small clay pill, as in the header row.
  freeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    marginBottom: -4,
  },
  freeLeftText: { ...font.body[700], flexShrink: 1, fontSize: 13, lineHeight: 18, color: colors.muted },
  freeLeftLink: { ...font.body[800], color: colors.primary },
  safe: { flex: 1 },
  container: { padding: 20, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },

  hero: { padding: 20, gap: 16, borderRadius: radius.xl, overflow: 'hidden', boxShadow: clay.surface },
  heroLoading: { minHeight: 360, backgroundColor: pastel.sky, opacity: 0.5 },
  heroHead: { gap: 6 },
  heroEyebrow: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8 },
  heroTitle: { ...font.display[800], fontSize: 28, lineHeight: 31, letterSpacing: -0.6, color: colors.onPastel },
  heroBody: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },

  call: { alignItems: 'center', gap: 12 },
  callKicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: colors.chip,
    boxShadow: clay.surface,
  },
  aiChipText: { ...font.body[800], fontSize: 12, letterSpacing: 0.3, color: colors.onPastel },
  rings: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999 },
  ringOuter: { top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.35)' },
  ringInner: { top: 14, left: 14, right: 14, bottom: 14, backgroundColor: 'rgba(255, 255, 255, 0.5)' },
  callTitle: {
    ...font.display[800],
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: colors.onPastel,
    textAlign: 'center',
  },
  callText: {
    ...font.body[700],
    maxWidth: 290,
    fontSize: 15,
    lineHeight: 20,
    color: colors.onPastel,
    opacity: 0.85,
    textAlign: 'center',
  },

  says: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  saysCol: { flex: 1, gap: 4, alignItems: 'flex-start' },
  saysName: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.85 },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomLeftRadius: 8,
    backgroundColor: colors.chip,
    boxShadow: clay.surface,
  },
  bubbleText: { ...font.display[700], fontSize: 21, lineHeight: 24, color: colors.onPastel },

  doneArtPod: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.pod,
    alignItems: 'center',
    overflow: 'hidden',
  },
  doneArt: { width: 96, height: 120, marginTop: 8 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.chip,
    boxShadow: clay.surface,
  },
  statNum: { ...font.display[800], fontSize: 24, lineHeight: 28, color: colors.onPastel, fontVariant: ['tabular-nums'] },
  statLabel: { ...font.body[800], fontSize: 12, color: colors.onPastel, opacity: 0.8 },

  section: { gap: 12 },
  sectionTitle: { ...font.display[800], fontSize: 20, lineHeight: 24, letterSpacing: -0.1, color: colors.ink },
  askHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  askTitle: { ...font.display[800], flex: 1, fontSize: 22, lineHeight: 25, letterSpacing: -0.3, color: colors.ink },
  askList: { gap: 10, paddingBottom: 4 },
  askLabel: { ...font.body[800], fontSize: 12, letterSpacing: 1, color: colors.muted, marginTop: 6 },
  freeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 84,
    padding: 14,
    borderRadius: 30,
    overflow: 'hidden',
    boxShadow: clay.surface,
  },
  freeArt: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', backgroundColor: colors.pod },
  freeTitle: { ...font.display[800], fontSize: 19, lineHeight: 22, color: colors.onPastel },
  freeSub: { ...font.body[700], fontSize: 13, lineHeight: 17, color: colors.onPastel, opacity: 0.85 },

  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    padding: 12,
    paddingRight: 16,
    borderRadius: 30,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  rowArt: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    boxShadow: clay.surface,
  },
  rowImage: { width: 52, height: 70, marginTop: 6 },
  rowText: { flex: 1, gap: 3, alignItems: 'flex-start' },
  rowTitle: { ...font.body[800], fontSize: 16, lineHeight: 20, color: colors.ink },
  rowSub: { ...font.body[600], fontSize: 13, lineHeight: 17, color: colors.muted },

  tomorrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    padding: 12,
    paddingRight: 16,
    borderRadius: 30,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  tomorrowIn: {
    ...font.body[800],
    fontSize: 12,
    color: colors.onPastel,
    backgroundColor: pastel.butter,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
    fontVariant: ['tabular-nums'],
  },
});

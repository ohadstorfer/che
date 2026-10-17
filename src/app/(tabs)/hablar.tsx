import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Animated, type ImageSourcePropType, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayPips, PanchoAvatar, StartButton, webPress } from '@/components/hablar-ui';
import { AppHeader, useStreakWeek } from '@/components/app-header';
import { useAuth } from '@/lib/auth';
import {
  type Band,
  CHATS_PER_DAY,
  type ConversationRow,
  conversationTitle,
  end,
  hoursToMidnight,
  isToday,
  scenarioAt,
  scenarios,
} from '@/lib/hablar';
import { levelDistance, pickScenario, scenarioArt, tomasArt } from '@/lib/hablar-art';
import { forgetHablarLatest, loadHablarHome, peekHablarHome } from '@/lib/hablar-home';
import { FREE_CHATS, usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, type PastelName, pastel, pastelGrad, press, radius } from '@/lib/theme';
import { FitText } from '@/components/fit-text';
import { OutlinedHeadline, useSlap } from '@/components/sticker';

// ---------------------------------------------------------------------------
// Speaking — three short chats a day with Pancho (docs/hablar-hld.md §2.1,
// the "Chat limits UX" canvas).
//
// Under the headline, a pill counts the day: three little bubbles, ticked as
// the chats are used, and how many are left (when they come back, once none
// are). The top card is the day: Pancho calling while a chat is there to
// take, Resume while one is open, and once all three are used, what she got
// out of them and the course, which has no daily limit. Below, everything
// else she could talk about instead: the scenarios as pastel postcards, the capybara of each
// standing on its card and breaking out of the top, on alternating sides.
// The level switch opens at the level of her last chat (her course level on a
// first visit) and shows every scenario at that level, the ones written for
// it first. The brief's chip can still move it before she starts.
// ---------------------------------------------------------------------------

type Today =
  | { state: 'loading' }
  | { state: 'free' }
  | { state: 'open'; conversation: ConversationRow }
  | { state: 'done'; chats: ConversationRow[] };


/** Scenario rows deal their icon circles through these, so neighbours differ. */
const ROW_TONES = [pastel.peach, pastel.sage, pastel.lav, pastel.sky, pastel.butter] as const;

/**
 * The top card: Resume while a chat is open today; what the day gave her once
 * it's used — all three chats, or the last of her free ones; Pancho calling
 * otherwise. Staff chats count toward nothing, so they never use up the day.
 */
const todayOf = (latest: ConversationRow | null, today: ConversationRow[], staff: boolean, freeLeft: number | null): Today => {
  if (latest && isToday(latest) && !latest.ended_at) return { state: 'open', conversation: latest };
  if (!staff && today.length && (today.length >= CHATS_PER_DAY || freeLeft === 0)) return { state: 'done', chats: today };
  return { state: 'free' };
};

export default function Hablar() {
  useStatusBarColor(colors.bg);
  const { status: streak, weekDone } = useStreakWeek();
  // Staff have no daily limit (hablar-start agrees), so a finished chat never locks the tab.
  const { profile, session } = useAuth();
  const userId = session?.user.id;
  const staff = profile?.role === 'admin' || profile?.role === 'reviewer';
  // A free account has a few chats in all; null until counted.
  const { limited, paywall, status } = usePremium();
  // Opens on what was read last — or read ahead while she was on Course
  // (lib/prefetch.ts) — and refreshes on focus.
  const kept = peekHablarHome(userId, limited);
  /** Her latest chat and today's; null until read. */
  const [day, setDay] = useState<{ latest: ConversationRow | null; today: ConversationRow[] } | null>(() =>
    kept ? { latest: kept.latest, today: kept.today } : null,
  );
  const [past, setPast] = useState<ConversationRow[]>(() => kept?.past ?? []);
  /** Her saved level; null until read. It is changed on the brief, not here. */
  const [level, setLevel] = useState<Band | null>(() => kept?.level ?? null);
  const [used, setUsed] = useState<number | null>(() => kept?.used ?? null);
  const freeLeft = limited && used != null ? Math.max(0, FREE_CHATS - used) : null;
  const today: Today = day ? todayOf(day.latest, day.today, staff, freeLeft) : { state: 'loading' };
  // The day's count is shown to premium only: a free account's binding limit is its free chats (the pill below).
  const usedToday = status === 'premium' && !staff && day ? Math.min(CHATS_PER_DAY, day.today.length) : null;

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let alive = true;
      (async () => {
        const home = await loadHablarHome(userId, limited);
        let latest = home.latest;
        // A chat left open on an earlier day (app killed mid-chat): close it
        // quietly so it gets its summary. The streak isn't bumped for that day.
        if (latest && !latest.ended_at && !isToday(latest)) {
          await end({ session_id: latest.id, reason: 'time' }).catch(() => {});
          forgetHablarLatest();
          latest = null;
        }
        if (!alive) return;
        setPast(home.past);
        setLevel(home.level);
        setUsed(home.used);
        setDay({ latest, today: home.today });
      })();
      return () => {
        alive = false;
      };
    }, [userId, limited]),
  );

  const openDoor = (kind: 'scenario' | 'free', topic?: string) => {
    if (today.state === 'open') return router.push(`/hablar-chat?session=${today.conversation.id}`);
    if (today.state === 'done') return router.push(`/hablar-summary?session=${today.chats[0].id}`);
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
        <OutlinedHeadline small="Speaking practice with" big="AI argentino" style={styles.headline} />

        {usedToday != null ? <DayPill used={usedToday} /> : null}

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
          <DoneCard chats={today.chats} />
        ) : today.state === 'open' ? (
          <ResumeCard conversation={today.conversation} />
        ) : pick ? (
          <CallCard onAnswer={() => openDoor('free')} />
        ) : null}

        {today.state === 'done' ? <CourseRow /> : null}

        {today.state !== 'done' ? (
          <View style={styles.section}>
            <View style={styles.pickLabel}>
              <Text style={styles.pickLabelText}>Or pick a scenario</Text>
            </View>
            <View style={styles.cards}>
              {byFit.map((s, i) => {
                const v = scenarioAt(s, band);
                return (
                  <Postcard
                    key={s.id}
                    index={i}
                    art={scenarioArt(s.id)}
                    title={s.title_en}
                    sub={`With ${v.role_en}`}
                    onPress={() => openDoor('scenario', s.id)}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

      </ScrollView>
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
 * AI who talks like a porteño, out loud. Answering goes straight to a free chat;
 * the scenarios are right below for anyone who wants a situation instead.
 */
function CallCard({ onAnswer }: { onAnswer: () => void }) {
  return (
    <Hero tone="butter">
      <View style={styles.call}>
        <View style={styles.callRow}>
          <View>
            <PanchoAvatar size={64} drop={0.05} />
            <View style={styles.aiChip}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={colors.ink} />
              <Text style={styles.aiChipText}>AI</Text>
            </View>
          </View>
          <View style={styles.callCol}>
            <Text style={styles.callTitle} accessibilityRole="header">
              Pancho is calling…
            </Text>
            <Text style={styles.callText}>Talk about anything.</Text>
          </View>
        </View>
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

/**
 * The day's chats, as a pill under the headline: a bubble for each of the
 * three, ticked once used, and how many are left — or, once none are, when
 * they come back.
 */
function DayPill({ used }: { used: number }) {
  const left = CHATS_PER_DAY - used;
  const label = left > 0 ? `${left} ${left === 1 ? 'chat' : 'chats'} left today` : `New chats in ${hoursToMidnight()} h`;
  return (
    <View style={styles.dayPill} accessible accessibilityLabel={`${used} of ${CHATS_PER_DAY} chats used today. ${label}.`}>
      <DayPips used={used} />
      <Text style={styles.dayPillText}>{label}</Text>
    </View>
  );
}

/** The day's chats are used: what they gave her and a way into the last one's summary. */
function DoneCard({ chats }: { chats: ConversationRow[] }) {
  const sum = (of: (c: ConversationRow) => number) => chats.reduce((n, c) => n + of(c), 0);
  const turns = sum((c) => c.summary?.turns ?? 0);
  const fixes = sum((c) => c.summary?.corrections?.length ?? 0);
  const stats: [string, string][] = [
    [String(turns), turns === 1 ? 'answer' : 'answers'],
    [String(fixes), fixes === 1 ? 'fix' : 'fixes'],
  ];
  return (
    <Hero tone="sage">
      <View style={styles.heroBody}>
        <View style={[styles.heroHead, { flex: 1 }]}>
          <Text style={styles.heroEyebrow}>Done for today</Text>
          <Text style={styles.heroTitle}>
            Nicely done!{'\n'}
            {chats.length === 1 ? 'A real chat' : `${chats.length} chats`}, out loud.
          </Text>
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
        onPress={() => router.push(`/hablar-summary?session=${chats[0].id}`)}
      />
    </Hero>
  );
}

/** Where to go once the day's chats are used: the course, whose chats with Pancho have no daily limit. */
function CourseRow() {
  return (
    <Pressable
      onPress={() => router.navigate('/home')}
      accessibilityRole="button"
      accessibilityLabel="Keep talking in the course. Every unit ends with a chat with Pancho."
      style={({ pressed }) => [styles.row, { transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
      <View style={[styles.rowArt, { backgroundColor: pastel.butter }]}>
        <Image source={tomasArt} style={styles.rowImage} contentFit="contain" accessible={false} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>Keep talking in the course</Text>
        <FitText style={styles.rowSub} lines={2}>
          Every unit ends with a chat with Pancho
        </FitText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.primary} />
    </Pressable>
  );
}

/** The art's hard sticker shadow, where it can follow the picture's own outline
 *  (a CSS filter on web and Android); iOS would shade the image's whole box. */
const artShadow = (side: 'left' | 'right') =>
  (Platform.OS === 'ios' ? null : { filter: `drop-shadow(${side === 'left' ? -2 : 2}px 3px 0px ${colors.ink})` }) as object | null;

/** A scenario as a postcard: its pastel, its name, who Pancho plays, and its capybara on one side. */
function Postcard({ index, art, title, sub, onPress }: { index: number; art: ImageSourcePropType; title: string; sub: string; onPress: () => void }) {
  const side = index % 2 ? 'left' : 'right';
  const slap = useSlap(index + 1, side === 'right' ? '-1deg' : '1deg');
  return (
    <Animated.View style={slap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${sub}`}
        style={({ pressed }) => [
          styles.card,
          side === 'right' ? styles.cardTextLeft : styles.cardTextRight,
          { backgroundColor: ROW_TONES[index % ROW_TONES.length], transform: [{ scale: pressed ? press.scale : 1 }] },
          webPress,
        ]}>
        <FitText style={styles.cardTitle} lines={2}>
          {title}
        </FitText>
        <FitText style={styles.cardSub} lines={2}>
          {sub}
        </FitText>
      </Pressable>
      {/* Beside the card, not inside it: on iOS a card's outline is drawn over its own children. */}
      <Image
        source={art}
        style={[styles.cardArt, side === 'right' ? styles.cardArtRight : styles.cardArtLeft, artShadow(side)]}
        contentFit="contain"
        contentPosition="bottom"
        accessible={false}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // The day's chats: a clay pill at the headline's right, as the free-chats count was.
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 10,
    minHeight: 36,
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
    marginBottom: -4,
  },
  dayPillText: { ...font.body[800], fontSize: 13, lineHeight: 18, color: colors.ink, fontVariant: ['tabular-nums'] },
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
  headline: { width: '94%', marginTop: -6, marginBottom: 4 },
  container: { padding: 20, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },

  hero: { padding: 20, gap: 16, borderRadius: radius.xl, overflow: 'hidden', boxShadow: clay.surface },
  heroLoading: { minHeight: 360, backgroundColor: pastel.sky, opacity: 0.5 },
  heroHead: { gap: 6 },
  heroEyebrow: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8 },
  heroTitle: { ...font.display[800], fontSize: 28, lineHeight: 31, letterSpacing: -0.6, color: colors.onPastel },
  heroBody: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },

  call: { paddingTop: 8 },
  // A white sticker pill, tilted, stuck over the top of Pancho's circle: who is on the line.
  aiChip: {
    position: 'absolute',
    top: -17,
    left: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: '#fff',
    boxShadow: clay.chip,
    transform: [{ rotate: '-3deg' }],
  },
  aiChipText: { ...font.display[900], fontSize: 15, color: colors.ink },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  callCol: { flex: 1, gap: 3 },
  callTitle: { ...font.display[800], fontSize: 24, lineHeight: 26, letterSpacing: -0.4, color: colors.onPastel },
  callText: { ...font.body[700], fontSize: 16, lineHeight: 21, color: colors.onPastel, opacity: 0.85 },

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

  list: { gap: 12 },

  // Talking about anything -------------------------------------------------
  // The postcards ----------------------------------------------------------
  // The gap leaves room for each capybara's head, which stands above its card.
  /** A small sticker label between the day's card and the postcards. */
  pickLabel: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.chip,
    transform: [{ rotate: '-2deg' }],
  },
  pickLabelText: { ...font.display[900], fontSize: 14, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  cards: { gap: 30, paddingTop: 20 },
  card: { minHeight: 100, justifyContent: 'center', gap: 4, paddingVertical: 14, borderRadius: 20, boxShadow: clay.surface },
  cardTextLeft: { paddingLeft: 18, paddingRight: 116 },
  cardTextRight: { paddingLeft: 116, paddingRight: 18 },
  cardTitle: { ...font.display[900], fontSize: 24, lineHeight: 25, letterSpacing: -0.3, color: colors.onPastel },
  cardSub: { ...font.body[700], fontSize: 14, lineHeight: 18, color: colors.onPastel, opacity: 0.85 },
  cardArt: { position: 'absolute', bottom: 0, width: 92, height: 122 },
  cardArtRight: { right: 12 },
  cardArtLeft: { left: 12, transform: [{ scaleX: -1 }] },
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
});

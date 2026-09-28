import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelChip, StartButton, webPress } from '@/components/hablar-ui';
import {
  type Band,
  bandsOf,
  findScenario,
  getDefaultLevel,
  type HablarKind,
  isBand,
  scenarioAt,
  setDefaultLevel,
  start,
} from '@/lib/hablar';
import { freeChatArt, scenarioArt } from '@/lib/hablar-art';
import { prime } from '@/lib/hablar-audio';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastelGrad, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The brief (§2.2): what she's walking into, before the clock starts. Every
// tutor studied shows one — it's what removes the "what do I even say?"
// freeze. How hard it should be is decided here, next to what it is: the chip
// swaps the scenario's version (goals, setting, Pancho's role) in place. One
// button; the five minutes start when she presses it, and the level she
// plays becomes the Speaking tab's default.
// ---------------------------------------------------------------------------

export default function HablarBrief() {
  const params = useLocalSearchParams<{ kind?: string; topic?: string; level?: string }>();
  const kind: HablarKind = params.kind === 'scenario' ? 'scenario' : 'free';
  const [level, setLevel] = useState<Band>(isBand(params.level) ? params.level : 'A1');
  const scenario = kind === 'scenario' ? findScenario(params.topic) : undefined;
  // The version she'd play: the chip's level, or the nearest one written.
  const version = scenario ? scenarioAt(scenario, level) : undefined;
  const played: Band = version?.band ?? level;

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The Speaking tab's level, unless the link carried one.
  useEffect(() => {
    if (!isBand(params.level)) void getDefaultLevel().then(setLevel);
  }, [params.level]);

  const begin = async () => {
    // Inside the tap: the audio context has to be woken here for Pancho's
    // opener to be allowed to sound once the chat opens.
    prime();
    setStarting(true);
    setError(null);
    try {
      const res = await start({ kind, topic_id: scenario?.id ?? null, level: played });
      if ('paywall' in res) return void router.replace('/paywall?from=hablar');
      if ('doneToday' in res) {
        if (res.summaryId) router.replace(`/hablar-summary?session=${res.summaryId}`);
        else router.dismissTo('/hablar');
        return;
      }
      setDefaultLevel(isBand(res.level) ? res.level : played);
      router.replace(`/hablar-chat?session=${res.session_id}`);
    } catch {
      setError("Couldn't start the chat. Check your connection and try again.");
      setStarting(false);
    }
  };

  const eyebrow = kind === 'scenario' ? 'Scenario' : 'Talk about anything';
  const title = scenario?.title_en ?? 'Talk about anything';

  // The hero takes a pastel by kind: peach for a scenario, lavender for talking about anything.
  const tone = scenario ? pastelGrad.peach : pastelGrad.lav;
  useStatusBarColor(colors.bg);
  const role = version
    ? `Pancho is ${version.role_en}.`
    : 'Pancho asks the questions. Talk about whatever you like.';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => goBack('/hablar')}
          hitSlop={10}
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.hero}>
          <LinearGradient colors={tone} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>{eyebrow} · 5 min</Text>
            <Text style={styles.title}>{title}</Text>
            {version ? <Text style={styles.settingEn}>{version.setting_en}</Text> : null}
            <Text style={styles.role}>{role}</Text>
          </View>
          <View style={styles.heroArtWrap}>
            <View style={styles.pod} />
            <Image
              source={scenario ? scenarioArt(scenario.id) : freeChatArt}
              style={styles.heroArt}
              contentFit="contain"
              accessible={false}
            />
          </View>
        </View>

        {/* The ticket: what she's there to do, torn off above how hard it'll be. */}
        <View style={styles.ticket}>
          {version ? (
            <>
              <View style={styles.ticketHead}>
                <Text style={styles.ticketTitle}>Your goals</Text>
                <Text style={styles.ticketMeta}>{version.goals.length} goals</Text>
              </View>
              <Perforation />
              <View style={styles.ticketBody}>
                {version.goals.map((g) => (
                  <View key={g.id} style={styles.goal}>
                    <View style={styles.goalBox} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.goalMain}>{g.en}</Text>
                      <Text style={styles.goalSub}>{g.es}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Perforation />
            </>
          ) : null}
          <View style={styles.ticketFoot}>
            <Text style={styles.levelLabel}>How hard</Text>
            <LevelChip value={played} onChange={setLevel} available={scenario ? bandsOf(scenario) : undefined} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.rules}>
          <Rule icon="timer-outline" text="5 min" />
          <Rule icon="microphone-outline" text="Tap to talk" />
          <Rule icon="lightbulb-on-outline" text="3 hints" />
        </View>
        <StartButton
          label={starting ? 'Starting…' : 'Start talking'}
          onPress={begin}
          busy={starting}
          disabled={starting}
          accessibilityState={{ busy: starting }}
        />
      </View>
    </SafeAreaView>
  );
}

/** The ticket's tear line. RN only dashes a full border, so a dashed box is clipped to its top edge. */
function Perforation() {
  return (
    <View style={styles.perf}>
      <View style={styles.perfLine} />
    </View>
  );
}

function Rule({ icon, text }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; text: string }) {
  return (
    <View style={styles.rule}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.muted} />
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingTop: 8, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 24 },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: clay.surface,
  },
  // A pastel clay hero: what it is, and the art on its soft white pod.
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 20,
    paddingTop: 20,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: clay.surface,
  },
  heroText: { flex: 1, gap: 6, paddingBottom: 20 },
  heroArtWrap: { width: 128, height: 168, alignItems: 'center', justifyContent: 'flex-end' },
  pod: { position: 'absolute', bottom: 18, width: 116, height: 116, borderRadius: 58, backgroundColor: colors.pod },
  heroArt: { width: 124, height: 164, marginRight: -8 },
  eyebrow: { ...font.body[800], fontSize: 13, color: colors.onPastel, opacity: 0.8 },
  title: { ...font.display[800], fontSize: 30, letterSpacing: -0.6, color: colors.onPastel, lineHeight: 32 },
  settingEn: { ...font.body[600], fontSize: 14, lineHeight: 19, color: colors.onPastel, opacity: 0.85 },
  role: { ...font.body[700], fontSize: 14, lineHeight: 19, color: colors.onPastel },

  ticket: { borderRadius: radius.xl, backgroundColor: colors.card, boxShadow: clay.surface },
  ticketHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 16 },
  ticketTitle: { ...font.display[800], fontSize: 20, letterSpacing: -0.1, color: colors.ink },
  ticketMeta: { ...font.body[800], fontSize: 13, color: colors.muted },
  ticketBody: { gap: 16, paddingHorizontal: 22, paddingVertical: 18 },
  ticketFoot: { gap: 10, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 20 },
  perf: { height: 2, marginHorizontal: 14, overflow: 'hidden' },
  perfLine: { height: 6, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 1 },
  goal: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  goalBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.trough, boxShadow: clay.trough },
  goalMain: { ...font.body[700], fontSize: 16, lineHeight: 21, color: colors.ink },
  goalSub: { ...font.body[600], fontSize: 13, color: colors.muted },
  levelLabel: { ...font.body[800], fontSize: 13, color: colors.muted },

  rules: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  rule: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  ruleText: { ...font.body[700], fontSize: 13, color: colors.muted },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  error: { ...font.body[700], fontSize: 14, color: colors.dangerInk, textAlign: 'center' },
});

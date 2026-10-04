import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelTabs, StartButton, webPress } from '@/components/hablar-ui';
import {
  type Band,
  bandOf,
  bandsOf,
  chatLength,
  findScenario,
  getDefaultLevel,
  type HablarKind,
  isBand,
  scenarioAt,
  setDefaultLevel,
  start,
  warm,
} from '@/lib/hablar';
import { preloadAudio } from '@/lib/audio';
import { freeChatArt, scenarioArt } from '@/lib/hablar-art';
import { loadCourse } from '@/lib/course';
import { prime } from '@/lib/hablar-audio';
import { goBack } from '@/lib/nav';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The brief (§2.2): what she's walking into, before the clock starts. Every
// tutor studied shows one — it's what removes the "what do I even say?"
// freeze. How hard it should be is decided here, next to what it is: the chip
// swaps the scenario's version (setting, Pancho's role) in place. One
// button; the chat starts when she presses it, and the level she
// plays becomes the Speaking tab's default.
//
// A unit's Speaking lesson on the road (?kind=unit&lesson=<id>) has a brief
// too: the unit's goal, at the unit's own level. Its scene is only written
// once someone starts it, so the brief promises the unit, not a setting.
// ---------------------------------------------------------------------------

export default function HablarBrief() {
  const params = useLocalSearchParams<{ kind?: string; topic?: string; level?: string; lesson?: string }>();
  const kind: HablarKind = params.kind === 'unit' ? 'unit' : params.kind === 'scenario' ? 'scenario' : 'free';
  const lessonId = kind === 'unit' ? params.lesson : undefined;
  const [unit, setUnit] = useState<{ title: string; number: number } | null>(null);
  const [level, setLevel] = useState<Band>(isBand(params.level) ? params.level : 'A1');
  const scenario = kind === 'scenario' ? findScenario(params.topic) : undefined;
  // The version she'd play: the chip's level, or the nearest one written.
  const version = scenario ? scenarioAt(scenario, level) : undefined;
  const played: Band = version?.band ?? level;

  // While she reads the brief: boot the function that starts the chat, and get
  // Pancho's opening line onto the phone so he speaks the moment it opens.
  useEffect(() => warm('hablar-start'), []);
  const openerAudio = version?.opener.audio;
  useEffect(() => void preloadAudio(openerAudio), [openerAudio]);

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The Speaking tab's level, unless the link carried one. A unit chat starts
  // at the unit's level.
  useEffect(() => {
    if (lessonId) {
      void loadCourse().then((course) => {
        const step = course.path.find((l) => l.id === lessonId);
        if (!step) return;
        setUnit({ title: step.unit.title_en, number: step.unitIndex + 1 });
        setLevel(bandOf(step.section.cefr));
      });
      return;
    }
    if (!isBand(params.level)) void getDefaultLevel().then(setLevel);
  }, [params.level, lessonId]);

  const begin = async () => {
    // Inside the tap: the audio context has to be woken here for Pancho's
    // opener to be allowed to sound once the chat opens.
    prime();
    setStarting(true);
    setError(null);
    try {
      const res = await start({ kind, topic_id: scenario?.id ?? null, lesson_id: lessonId ?? null, level: played });
      if ('paywall' in res) return void router.replace(lessonId ? '/paywall?from=lesson' : '/paywall?from=hablar');
      if ('doneToday' in res) {
        if (res.summaryId) router.replace(`/hablar-summary?session=${res.summaryId}`);
        else router.dismissTo('/hablar');
        return;
      }
      if (!lessonId) setDefaultLevel(isBand(res.level) ? res.level : played);
      router.replace(`/hablar-chat?session=${res.session_id}`);
    } catch {
      setError("Couldn't start the chat. Check your connection and try again.");
      setStarting(false);
    }
  };

  const eyebrow = unit ? `Unit ${unit.number} · Speaking` : kind === 'scenario' ? 'Scenario' : 'Talk about anything';
  const title = unit?.title ?? (kind === 'unit' ? 'Speaking' : scenario?.title_en ?? 'Talk about anything');

  // Pancho's pod takes a pastel by kind: peach for a scenario, lavender for talking about anything.
  const pod = scenario || kind === 'unit' ? POD_PEACH : POD_LAV;
  useStatusBarColor(colors.bg);
  const role = version
    ? `Pancho is ${version.role_en}.`
    : kind === 'unit'
    ? 'Pancho sets up a scene from this unit. Use what you just learned.'
    : 'Pancho asks the questions. Talk about whatever you like.';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => goBack(lessonId ? '/home' : '/hablar')}
          hitSlop={10}
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.back, { transform: [{ scale: pressed ? 0.92 : 1 }] }, webPress]}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        {/* The stage: no card around it, so nothing here looks like a button
            but the level tabs and Start. */}
        <View style={styles.stage}>
          <View style={[styles.pod, { backgroundColor: pod }]} />
          <Image
            source={scenario ? scenarioArt(scenario.id) : freeChatArt}
            style={styles.art}
            contentFit="contain"
            accessible={false}
          />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.setting}>
            {version ? `${version.setting_en} ` : ''}
            <Text style={styles.role}>{role}</Text>
          </Text>
        </View>

        <View style={styles.level}>
          <Text style={styles.levelLabel}>How hard</Text>
          <LevelTabs value={played} onChange={setLevel} available={scenario ? bandsOf(scenario) : undefined} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.rules}>
          <Rule icon="timer-outline" text={chatLength(played)} />
          <Rule icon="microphone-outline" text="Tap to talk" />
          <Rule icon="lightbulb-on-outline" text="3 hints" />
        </View>
        <StartButton
          label={starting ? (kind === 'unit' ? 'Setting the scene…' : 'Starting…') : 'Start talking'}
          onPress={begin}
          busy={starting}
          disabled={starting}
          accessibilityState={{ busy: starting }}
        />
      </View>
    </SafeAreaView>
  );
}

/** Soft pastel discs behind Pancho, strong enough to read on the oat. */
const POD_PEACH = 'rgba(255, 179, 138, 0.38)';
const POD_LAV = 'rgba(201, 184, 240, 0.45)';

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
  stage: { height: 240, alignItems: 'center', justifyContent: 'flex-end' },
  pod: { position: 'absolute', top: 16, width: 210, height: 210, borderRadius: 105 },
  art: { width: 220, height: 240 },

  intro: { gap: 8, alignItems: 'center', paddingHorizontal: 4 },
  /** Durazno, darkened until it reads as text on the oat — as on the Culture tab. */
  eyebrow: { ...font.body[800], fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: '#A8502C' },
  title: { ...font.display[800], fontSize: 34, lineHeight: 37, letterSpacing: -0.8, color: colors.ink, textAlign: 'center' },
  // Big and dark enough to read at a glance: this is what she's walking into.
  setting: { ...font.body[600], fontSize: 18, lineHeight: 26, color: colors.ink, textAlign: 'center' },
  role: { ...font.body[800] },

  level: { gap: 10, marginTop: 6 },
  levelLabel: { ...font.body[800], fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.muted },

  rules: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  rule: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  ruleText: { ...font.body[700], fontSize: 13, color: colors.muted },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  error: { ...font.body[700], fontSize: 14, color: colors.dangerInk, textAlign: 'center' },
});

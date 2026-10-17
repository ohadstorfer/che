import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelChip, StartButton, webPress } from '@/components/hablar-ui';
import {
  type Band,
  bandOf,
  bandsOf,
  chatLength,
  COURSE_CHATS_PER_DAY,
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
import { clay, colors, font, pastel, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The brief (§2.2): what she's walking into, before the chat starts. Every
// tutor studied shows one — it's what removes the "what do I even say?"
// freeze. One pastel sticker holds what it is: Pancho, the title and the three
// facts (how many messages, tap to talk, hints). How hard it should be is decided at
// the bottom, over the button: easier / harder around the level's name, which
// swaps the scenario's version in place. One button; the chat starts when she presses
// it, and the level she plays becomes the Speaking tab's default.
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
      // A chat of hers is still open (or this unit's is): back into it.
      if ('open' in res) return void router.replace(`/hablar-chat?session=${res.open}`);
      // A unit chat is had once: what came of it.
      if ('doneToday' in res) {
        if (res.summaryId) router.replace(`/hablar-summary?session=${res.summaryId}`);
        else router.dismissTo('/hablar');
        return;
      }
      // The day's chats are used: the tab says so, and when they come back.
      if ('dailyLimit' in res) return void router.dismissTo('/hablar');
      if ('courseBreak' in res) {
        setError(`Pancho needs a break: you've had ${COURSE_CHATS_PER_DAY} chats with him today. This one opens again tomorrow.`);
        setStarting(false);
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

  // The scene's sticker takes a pastel by kind: peach for a scenario or a unit, lavender for talking about anything.
  const tile = scenario || kind === 'unit' ? pastel.peach : pastel.lav;
  useStatusBarColor(colors.bg);

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

        {/* The scene, on one sticker: who she talks to, about what, and the rules of the chat. */}
        <View style={[styles.scene, { backgroundColor: tile }]}>
          <View style={styles.stage}>
            <View style={styles.pod} />
            <Image
              source={scenario ? scenarioArt(scenario.id) : freeChatArt}
              style={styles.art}
              contentFit="contain"
              accessible={false}
            />
          </View>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <View style={styles.rules}>
            <Rule icon="chat-outline" text={chatLength(kind)} />
            <Rule icon="microphone-outline" text="Tap to talk" />
            <Rule icon="lightbulb-on-outline" text="3 hints" />
          </View>
        </View>
      </ScrollView>

      {/* The level sits with the button, at the bottom: the last thing she sets before she starts, and within a thumb's reach. */}
      <View style={styles.footer}>
        <LevelChip value={played} onChange={setLevel} available={scenario ? bandsOf(scenario) : undefined} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
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

function Rule({ icon, text }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; text: string }) {
  return (
    <View style={styles.rule}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.onPastel} />
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
  /** The scene's sticker: a pastel tile with Pancho on his white pod, as on the hero tiles. */
  scene: { borderRadius: radius.xl, paddingTop: 14, paddingHorizontal: 18, paddingBottom: 20, alignItems: 'center', gap: 8, boxShadow: clay.surface },
  stage: { height: 216, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 },
  pod: { position: 'absolute', top: 8, width: 200, height: 200, borderRadius: 100, backgroundColor: colors.pod },
  art: { width: 200, height: 216 },

  /** On a pastel the eyebrow is the tile's ink, a step back, not the oat's durazno. */
  eyebrow: { ...font.body[800], fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.onPastel, opacity: 0.72 },
  title: { ...font.display[800], fontSize: 34, lineHeight: 37, letterSpacing: -0.8, color: colors.onPastel, textAlign: 'center' },

  rules: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8 },
  rule: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 11, borderRadius: radius.pill, backgroundColor: colors.chip },
  ruleText: { ...font.body[800], fontSize: 13, color: colors.onPastel },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
  error: { ...font.body[700], fontSize: 14, color: colors.dangerInk, textAlign: 'center' },
});

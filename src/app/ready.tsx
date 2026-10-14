import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MASCOT_NAME, POSE } from '@/components/mascot';
import { EASE_OUT, rise } from '@/components/onboarding-ui';
import { SaveButtons } from '@/components/save-account';
import { useAuth } from '@/lib/auth';
import { loadCourse, type PathLesson } from '@/lib/course';
import { isGuest } from '@/lib/guest';
import { tap } from '@/lib/haptics';
import { resetTo } from '@/lib/nav';
import { type Answers, loadAnswers, nameTail, speaksSpanish } from '@/lib/onboarding';
import { enablePush } from '@/lib/push';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, pastel, press, radius, type } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Ready — the end of onboarding, after the paywall. Two ways in: lesson 1, or
// a short test that starts her further along. The one her level points to
// wears the "For you" tag.
//
// A guest (lib/guest.ts: the paywall comes before the account) saves her
// account here first, with Apple, Google or email; the choices follow once
// she has, or once she says "Not now".
//
// It is also where the onboarding answers reach her account: the name she
// gave becomes her profile name, and the reminder she allowed is subscribed
// (onboarding asked for the permission before there was an account to tie it to).
// ---------------------------------------------------------------------------

const webPress =
  Platform.OS === 'web'
    ? ({ transitionProperty: 'transform', transitionDuration: `${press.duration}ms`, transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' } as unknown as ViewStyle)
    : undefined;

/** Where a lesson opens, by kind: the same routes the Course screen uses. */
const lessonHref = (l: PathLesson) =>
  l.kind === 'story'
    ? `/story?lesson=${l.id}`
    : l.kind === 'speak'
      ? `/hablar-brief?kind=unit&lesson=${l.id}`
      : l.kind === 'slang'
        ? `/argentine-round?lesson=${l.id}`
        : l.kind === 'culture'
          ? `/culture-class?lesson=${l.id}`
          : `/practice?lesson=${l.id}`;

const CONFETTI: { left: number; top: number; w: number; tone: string; rot: number }[] = [
  { left: 8, top: 14, w: 16, tone: pastel.peach, rot: -24 },
  { left: 24, top: 4, w: 9, tone: pastel.sage, rot: 18 },
  { left: 78, top: 8, w: 16, tone: colors.card, rot: 30 },
  { left: 88, top: 22, w: 9, tone: pastel.lav, rot: -12 },
  { left: 5, top: 48, w: 9, tone: pastel.sky, rot: 40 },
  { left: 91, top: 52, w: 16, tone: pastel.peach, rot: -34 },
  { left: 15, top: 72, w: 16, tone: pastel.lav, rot: 14 },
  { left: 82, top: 76, w: 9, tone: pastel.sage, rot: -20 },
];

export default function Ready() {
  useStatusBarColor(pastel.butter);
  const reduced = useReducedMotion();
  const { session, profile, refreshProfile } = useAuth();
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [busy, setBusy] = useState(false);
  const [later, setLater] = useState(false);
  const saving = isGuest(session) && !later;

  useEffect(() => {
    void loadAnswers().then(setAnswers);
  }, []);

  // Her answers, onto her account: once per arrival, and never in her way.
  const userId = session?.user.id;
  useEffect(() => {
    if (!answers || !userId) return;
    const name = answers.name?.trim();
    if (name && profile && profile.display_name !== name) {
      void supabase
        .from('profiles')
        .update({ display_name: name })
        .eq('user_id', userId)
        .then(() => refreshProfile());
    }
    if (answers.reminder) void enablePush(userId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, userId]);

  const speaker = answers ? speaksSpanish(answers.level) : false;

  const startLesson = async () => {
    if (busy) return;
    tap();
    setBusy(true);
    const first = await loadCourse()
      .then((c) => c.path[0] ?? null)
      .catch(() => null);
    resetTo('/home');
    if (first) router.push(lessonHref(first) as Parameters<typeof router.push>[0]);
  };

  const takeTest = () => {
    if (busy) return;
    tap();
    resetTo('/home');
    router.push('/practice?test=placement');
  };

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          {CONFETTI.map((c, i) => (
            <View
              key={i}
              accessible={false}
              style={[
                styles.bit,
                { left: `${c.left}%`, top: `${c.top}%`, width: c.w, height: c.w > 10 ? 7 : 9, backgroundColor: c.tone, transform: [{ rotate: `${c.rot}deg` }] },
              ]}
            />
          ))}
          <View style={styles.heroCenter}>
            <View style={styles.halo} />
            <Animated.View entering={reduced ? undefined : ZoomIn.duration(420).easing(EASE_OUT)}>
              <Image source={POSE.gol} style={styles.art} contentFit="contain" accessibilityLabel={`${MASCOT_NAME} the carpincho, celebrating`} />
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.body}>
        <Animated.Text entering={rise(1, reduced)} style={styles.title} accessibilityRole="header">
          ¡Listo{answers ? nameTail(answers) : ''}! You&apos;re in.
        </Animated.Text>
        <Animated.Text entering={rise(2, reduced)} style={styles.sub}>
          {saving ? 'Save your plan first.' : 'Where do you want to start?'}
        </Animated.Text>

        {saving ? (
          <Animated.View entering={rise(3, reduced)} style={styles.save}>
            <SaveButtons
              answers={answers}
              onEmail={() => router.push('/save-account?mode=email')}
              onLater={() => setLater(true)}
              onDone={(res) => {
                // An account she already had, with its own course to go back to.
                if (res.status === 'switched' && res.returning) resetTo('/home');
              }}
            />
          </Animated.View>
        ) : (
          <View style={styles.choices}>
            <Animated.View entering={rise(3, reduced)}>
              <Choice
                icon="play"
                tone={pastel.peach}
                title="Start lesson 1"
                sub="From the beginning, with vos from day one."
                tag={answers && !speaker ? 'For you' : null}
                onPress={() => void startLesson()}
              />
            </Animated.View>
            <Animated.View entering={rise(4, reduced)}>
              <Choice
                icon="target"
                tone={pastel.lav}
                title="Find my level"
                sub="A 5-minute test. Skip what you already know."
                tag={answers && speaker ? 'For you' : null}
                onPress={takeTest}
              />
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function Choice({
  icon,
  tone,
  title,
  sub,
  tag,
  onPress,
}: {
  icon: string;
  tone: string;
  title: string;
  sub: string;
  tag: string | null;
  onPress: () => void;
}) {
  // The tag is the card's sibling, drawn after it: as a child, iOS paints the card's outline across it.
  return (
    <View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${sub}`}
        style={({ pressed }) => [styles.choice, { backgroundColor: tone, transform: [{ scale: pressed ? press.scale : 1 }] }, webPress]}>
        <View style={styles.choiceCoin}>
          <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={26} color={colors.onPastel} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.choiceTitle}>{title}</Text>
          <Text style={styles.choiceSub}>{sub}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={26} color={colors.onPastel} />
      </Pressable>
      {tag ? (
        <View style={styles.tag} pointerEvents="none">
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  hero: {
    height: 340,
    backgroundColor: pastel.butter,
    borderBottomLeftRadius: 46,
    borderBottomRightRadius: 46,
    boxShadow: clay.surface,
    overflow: 'hidden',
  },
  bit: { position: 'absolute', borderRadius: 99 },
  heroCenter: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18 },
  halo: { position: 'absolute', bottom: 10, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.45)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)' },
  art: { width: 170, height: 212 },
  body: { flex: 1, paddingHorizontal: 22, maxWidth: 520, width: '100%', alignSelf: 'center' },
  title: { ...type.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.7, color: colors.ink, textAlign: 'center', marginTop: 26 },
  sub: { ...font.body[600], fontSize: 16.5, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 6 },
  choices: { gap: 18, marginTop: 28 },
  save: { flex: 1, justifyContent: 'flex-end', paddingTop: 20, paddingBottom: 12 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 92, paddingVertical: 16, paddingLeft: 16, paddingRight: 14, borderRadius: radius.lg, boxShadow: clay.surface },
  choiceCoin: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, boxShadow: clay.chip },
  choiceTitle: { ...font.display[900], fontSize: 21, lineHeight: 25, letterSpacing: -0.4, color: colors.onPastel },
  choiceSub: { ...font.body[700], fontSize: 14.5, lineHeight: 19, color: colors.onPastel, opacity: 0.75, marginTop: 2 },
  tag: { position: 'absolute', top: -12, right: 18, paddingHorizontal: 11, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.primary, boxShadow: clay.chip },
  tagText: { ...font.body[800], fontSize: 12, color: colors.onPrimary },
});

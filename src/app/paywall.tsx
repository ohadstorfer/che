import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useReducedMotion,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EASE_OUT, IconButton, rise } from '@/components/onboarding-ui';
import { Button } from '@/components/ui';
import { billing } from '@/lib/billing';
import { annualSaving, type Offer, type Plan, winbackDiscount } from '@/lib/billing-shared';
import { success, tap } from '@/lib/haptics';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import { resetTo } from '@/lib/nav';
import { buildPlan, formatDate, loadAnswers, markWinbackShown, winbackShown } from '@/lib/onboarding';
import { FREE_CHATS, type PaywallSource, usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel, pastelGrad, type PastelName, press, radius, type } from '@/lib/theme';
import { scheduleTrialReminder } from '@/lib/trial-reminder';

// ---------------------------------------------------------------------------
// Paywall — flow 7: ask right after onboarding, with a free week on the
// annual plan; if she closes it, one real one-time offer; if she closes that,
// the free tier, and the paywall again only at moments she wants more.
//
// What it does to be trusted, not just to convert:
//   · the trial is a timeline (today / reminder / first charge), so "free"
//     has an end she can see, and the reminder is real (trial-reminder)
//   · the price after the trial sits right under the button, in full
//   · the close button waits a moment on the first showing — long enough to
//     read the headline, never hidden
//   · the win-back is shown once, ever, and says so
// ---------------------------------------------------------------------------

type Stage = 'plans' | 'offer' | 'done';

const webPress =
  Platform.OS === 'web'
    ? ({ transitionProperty: 'transform', transitionDuration: `${press.duration}ms`, transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' } as unknown as ViewStyle)
    : undefined;

const perPeriod = (p: Plan) => (p.period === 'year' ? 'year' : p.period === 'week' ? 'week' : 'month');
const trialWord = (days: number) => (days === 7 ? 'week' : `${days} days`);

export default function Paywall() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const params = useLocalSearchParams<{ from?: string }>();
  const from = (params.from ?? 'home') as PaywallSource;
  const { catalog, hardPaywall, grant, refresh } = usePremium();
  const main = catalog?.main ?? null;
  const locked = hardPaywall || from === 'gate';

  const [stage, setStage] = useState<Stage>('plans');
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canClose, setCanClose] = useState(from !== 'onboarding');
  const [headline, setHeadline] = useState<{ title: string; sub: string } | null>(null);
  const [purchasedTrial, setPurchasedTrial] = useState(false);

  // The plan she just built is the thing on offer; say so in its own words.
  useEffect(() => {
    let alive = true;
    void loadAnswers().then((answers) => {
      if (!alive) return;
      if (from === 'lesson') return setHeadline({ title: 'Keep going', sub: "You've finished the free units. Unlock the whole course." });
      if (from === 'hablar') return setHeadline({ title: 'Keep talking with Pancho', sub: `You've used your ${FREE_CHATS} free chats. Talk with him every day.` });
      if (answers) {
        const plan = buildPlan(answers);
        return setHeadline({ title: 'Start your plan for free', sub: `${plan.headline} by ${formatDate(plan.date)}.` });
      }
      setHeadline({ title: 'Posta Premium', sub: 'Everything in Posta, every day.' });
    });
    return () => {
      alive = false;
    };
  }, [from]);

  // The first showing holds the close button back a moment, never longer.
  useEffect(() => {
    if (canClose) return;
    const t = setTimeout(() => setCanClose(true), 2200);
    return () => clearTimeout(t);
  }, [canClose]);

  useEffect(() => {
    if (!selected && main?.plans[0]) setSelected(main.plans[0].id);
  }, [main, selected]);

  const plan = main?.plans.find((p) => p.id === selected) ?? null;
  const saving = main ? annualSaving(main.plans) : null;

  // Out of onboarding the welcome screen is still underneath, so the app
  // starts fresh; from inside the app, it goes back to the Course that's there.
  const home = () => (from === 'onboarding' ? resetTo('/home') : router.dismissTo('/home'));
  const leave = () => {
    if (from === 'onboarding' || from === 'gate' || !router.canGoBack()) home();
    else router.back();
  };

  const close = async () => {
    if (locked || busy) return;
    const offerReady = from === 'onboarding' && !!catalog?.winback && winbackDiscount(main, catalog.winback) != null;
    if (offerReady && !(await winbackShown())) {
      void markWinbackShown();
      tap();
      return setStage('offer');
    }
    leave();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stage === 'offer') leave();
      else if (canClose && !locked) void close();
      return true;
    });
    return () => sub.remove();
  });

  const buy = async (offer: 'main' | 'winback', p: Plan | null) => {
    if (!p || busy) return;
    tap();
    setBusy('buy');
    setError(null);
    const out = await billing.purchase(p.id, offer);
    setBusy(null);
    if (out === 'cancelled') return;
    if (out === 'pending') return setError('Your purchase is waiting for approval. We’ll unlock Posta as soon as it goes through.');
    if (typeof out === 'object') return setError(out.error);
    success();
    grant();
    setPurchasedTrial(!!p.trialDays);
    if (p.trialDays) void scheduleTrialReminder(p.trialDays);
    setStage('done');
    void refresh();
  };

  const restore = async () => {
    if (busy) return;
    setBusy('restore');
    setError(null);
    const ok = await billing.restore().catch(() => false);
    setBusy(null);
    if (!ok) return setError('No subscription found for this account.');
    success();
    grant();
    setStage('done');
  };

  if (stage === 'done') return <Welcome trial={purchasedTrial} reduced={reduced} onGo={home} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        {locked ? (
          <View style={{ width: 36 }} />
        ) : canClose ? (
          <Animated.View entering={FadeIn.duration(260)}>
            <IconButton icon="close" label="Close" onPress={() => void close()} tint={colors.muted} />
          </Animated.View>
        ) : (
          <View style={{ width: 36 }} />
        )}
        {billing.available ? (
          <Pressable onPress={restore} hitSlop={10} accessibilityRole="button" disabled={!!busy}>
            {busy === 'restore' ? <ActivityIndicator color={colors.muted} /> : <Text style={styles.restore}>Restore</Text>}
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise(0, reduced)} style={styles.heroWrap}>
          <LinearGradient colors={pastelGrad.peach} style={styles.hero}>
            <View style={styles.pod} />
            <Image source={require('@/assets/images/capybara/capybara-mate-sorbiendo-figure.webp')} style={styles.heroArt} contentFit="contain" accessible={false} />
          </LinearGradient>
        </Animated.View>
        {headline ? (
          <>
            <Animated.Text entering={rise(1, reduced)} style={styles.title} accessibilityRole="header">
              {headline.title}
            </Animated.Text>
            <Animated.Text entering={rise(2, reduced)} style={styles.sub}>
              {headline.sub}
            </Animated.Text>
          </>
        ) : (
          <View style={{ height: 70 }} />
        )}

        {plan?.trialDays ? (
          <Animated.View entering={rise(3, reduced)}>
            <TrialTimeline days={plan.trialDays} />
          </Animated.View>
        ) : (
          <Animated.View entering={rise(3, reduced)}>
            <Benefits />
          </Animated.View>
        )}

        <Animated.View entering={rise(4, reduced)} style={{ gap: 10, marginTop: 22 }} accessibilityRole="radiogroup">
          {main ? (
            main.plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selected === p.id}
                badge={p.period === 'year' ? (p.trialDays ? `${p.trialDays} DAYS FREE` : saving ? `SAVE ${saving}%` : null) : null}
                saving={p.period === 'year' ? saving : null}
                onPress={() => {
                  tap();
                  setSelected(p.id);
                }}
              />
            ))
          ) : catalog ? (
            <Text style={styles.unavailable}>
              {Platform.OS === 'web'
                ? 'Subscriptions are in the Posta app for iPhone and Android. Subscribe there and Premium opens here too.'
                : 'Plans could not load. Check your connection and try again.'}
            </Text>
          ) : (
            <>
              <View style={styles.skeleton} />
              <View style={[styles.skeleton, { height: 64 }]} />
            </>
          )}
        </Animated.View>

        {plan?.trialDays ? (
          <Animated.View entering={rise(5, reduced)} style={{ marginTop: 22 }}>
            <Benefits />
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={plan?.trialDays ? `Start my free ${trialWord(plan.trialDays)}` : 'Continue'}
          onPress={() => void buy('main', plan)}
          loading={busy === 'buy'}
          disabled={!plan}
        />
        {plan ? (
          <Text style={styles.terms}>
            {plan.trialDays
              ? `Free for ${plan.trialDays} days, then ${plan.priceString}/${perPeriod(plan)}. Cancel anytime.`
              : `${plan.priceString}/${perPeriod(plan)}. Renews automatically. Cancel anytime.`}
          </Text>
        ) : null}
        <View style={styles.legal}>
          <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)}>
            Terms
          </Text>
          <Text style={styles.legalDot}>·</Text>
          <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}>
            Privacy
          </Text>
        </View>
      </View>

      {stage === 'offer' && catalog?.winback ? (
        <WinbackSheet
          main={main}
          winback={catalog.winback}
          reduced={reduced}
          busy={busy === 'buy'}
          error={error}
          onClaim={() => void buy('winback', catalog.winback!.plans.find((p) => p.period === 'year') ?? null)}
          onDecline={leave}
        />
      ) : null}
    </SafeAreaView>
  );
}

// --- the free week, drawn as the three days that matter ---------------------

function TrialTimeline({ days }: { days: number }) {
  const rows = [
    { icon: 'lock-open-variant', when: 'Today', what: 'Full access to all of Posta: every lesson, every chat.' },
    { icon: 'bell-ring-outline', when: `Day ${Math.max(1, days - 2)}`, what: "We'll remind you that your trial is ending." },
    { icon: 'star-four-points', when: `Day ${days}`, what: 'Your subscription starts. Cancel before and pay nothing.' },
  ];
  return (
    <View style={styles.timeline}>
      {rows.map((r, i) => {
        const last = i === rows.length - 1;
        return (
          <View key={r.when} style={styles.tRow}>
            <View style={styles.tRail}>
              <View style={[styles.tIcon, i === 0 && styles.tIconNow]}>
                <MaterialCommunityIcons
                  name={r.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={16}
                  color={colors.onPastel}
                />
              </View>
              {!last ? <View style={[styles.tLine, i === 0 && { backgroundColor: colors.primary }]} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
              <Text style={styles.tWhen}>{r.when}</Text>
              <Text style={styles.tWhat}>{r.what}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Benefits() {
  const rows: { icon: string; title: string; sub: string; tone: PastelName }[] = [
    { icon: 'road-variant', title: 'The whole course', sub: 'Every section, from hola to lunfardo', tone: 'sage' },
    { icon: 'microphone-outline', title: 'A daily chat with Pancho', sub: 'Five minutes of real talk, with feedback', tone: 'lav' },
    { icon: 'brain', title: 'Reviews that stick', sub: 'Words come back right before you forget them', tone: 'sky' },
  ];
  return (
    <View style={{ gap: 14 }}>
      {rows.map((r) => (
        <View key={r.title} style={styles.benefit}>
          <View style={[styles.benefitIcon, { backgroundColor: pastel[r.tone] }]}>
            <MaterialCommunityIcons name={r.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color={colors.onPastel} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.benefitTitle}>{r.title}</Text>
            <Text style={styles.benefitSub}>{r.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function PlanCard({
  plan,
  selected,
  badge,
  saving,
  onPress,
}: {
  plan: Plan;
  selected: boolean;
  badge: string | null;
  saving: number | null;
  onPress: () => void;
}) {
  const yearly = plan.period === 'year';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.plan,
        selected && styles.planSelected,
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      {/* The chosen plan is molded in manteca clay. */}
      {selected ? <LinearGradient colors={pastelGrad.butter} style={styles.planFill} /> : null}
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.planName}>{yearly ? 'Yearly' : plan.period === 'week' ? 'Weekly' : 'Monthly'}</Text>
        <Text style={[styles.planSub, selected && styles.onPastelSoft]}>
          {yearly ? `${plan.priceString} a year${saving ? ` · save ${saving}%` : ''}` : 'Billed monthly'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.planPrice}>{yearly && plan.perMonthString ? plan.perMonthString : plan.priceString}</Text>
        <Text style={[styles.planPer, selected && styles.onPastelSoft]}>/ month</Text>
      </View>
    </Pressable>
  );
}

// --- the one-time offer -------------------------------------------------------

function WinbackSheet({
  main,
  winback,
  reduced,
  busy,
  error,
  onClaim,
  onDecline,
}: {
  main: Offer | null;
  winback: Offer;
  reduced: boolean;
  busy: boolean;
  error: string | null;
  onClaim: () => void;
  onDecline: () => void;
}) {
  const discount = winbackDiscount(main, winback);
  const regular = main?.plans.find((p) => p.period === 'year');
  const offer = winback.plans.find((p) => p.period === 'year');
  const firstYear = offer?.introPrice?.priceString ?? offer?.priceString;
  const drawer = reduced ? FadeIn.duration(200) : SlideInDown.duration(420).easing(EASE_OUT);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(240)} exiting={FadeOut.duration(160)} style={styles.scrim} />
      <Animated.View entering={drawer} exiting={reduced ? FadeOut.duration(160) : SlideOutDown.duration(220).easing(EASE_OUT)} style={styles.sheet}>
        <SafeAreaView edges={['bottom']} style={{ gap: 6, alignItems: 'center' }}>
          <View style={styles.grabber} />
          <Animated.View entering={reduced ? undefined : ZoomIn.delay(160).duration(320).easing(EASE_OUT)} style={styles.gift}>
            <MaterialCommunityIcons name="gift-outline" size={30} color={colors.onPastel} />
          </Animated.View>
          <Text style={styles.offerEyebrow}>ONE-TIME WELCOME OFFER</Text>
          <Text style={styles.offerTitle}>{discount}% off your first year</Text>
          <View style={styles.offerPriceRow}>
            {regular ? <Text style={styles.offerOld}>{regular.priceString}</Text> : null}
            <Text style={styles.offerNew}>{firstYear}</Text>
            <Text style={styles.offerPer}>for your first year</Text>
          </View>
          <Text style={styles.offerNote}>You won&apos;t see this price again after you close this.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={{ alignSelf: 'stretch', gap: 4, marginTop: 10 }}>
            <Button title="Claim my offer" onPress={onClaim} loading={busy} />
            <Pressable onPress={onDecline} hitSlop={8} style={styles.decline} accessibilityRole="button" disabled={busy}>
              <Text style={styles.declineText}>No thanks, continue for free</Text>
            </Pressable>
          </View>
          {offer && regular ? (
            <Text style={styles.terms}>
              {firstYear} for the first year, then {regular.priceString}/year. Cancel anytime.
            </Text>
          ) : null}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// --- in ------------------------------------------------------------------------

function Welcome({ trial, reduced, onGo }: { trial: boolean; reduced: boolean; onGo: () => void }) {
  const go = useRef(onGo);
  go.current = onGo;
  useEffect(() => {
    const t = setTimeout(() => go.current(), 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <SafeAreaView style={[styles.safe, styles.welcome]} edges={['top', 'bottom']}>
      <Animated.View entering={reduced ? FadeIn.duration(200) : ZoomIn.duration(380).easing(EASE_OUT)} style={styles.welcomeCheck}>
        <Ionicons name="checkmark" size={44} color={colors.onPrimary} />
      </Animated.View>
      <Animated.Text entering={rise(3, reduced)} style={styles.welcomeTitle}>
        ¡Listo! You&apos;re in.
      </Animated.Text>
      <Animated.Text entering={rise(4, reduced)} style={styles.sub}>
        {trial ? "Your free week starts now. We'll remind you before it ends." : 'All of Posta is open. ¡Vamos!'}
      </Animated.Text>
      <Animated.View entering={rise(6, reduced)} style={{ alignSelf: 'stretch', marginTop: 24 }}>
        <Button title="Start learning" onPress={onGo} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4, minHeight: 44 },
  restore: { ...font.body[700], fontSize: 15, color: colors.muted, paddingHorizontal: 8 },
  body: { paddingHorizontal: 24, paddingBottom: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  heroWrap: { marginTop: 4, borderRadius: radius.xl, boxShadow: clay.surface },
  hero: { height: 150, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pod: { position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: colors.pod },
  heroArt: { width: 124, height: 124 },
  title: { ...type.display, fontSize: 30, lineHeight: 34, color: colors.ink, textAlign: 'center', marginTop: 18 },
  sub: { ...type.body, fontSize: 16, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 22 },

  timeline: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, boxShadow: clay.surface },
  tRow: { flexDirection: 'row', gap: 14 },
  tRail: { alignItems: 'center', width: 34 },
  tIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: pastel.lav, boxShadow: clay.surface },
  tIconNow: { backgroundColor: pastel.butter },
  tLine: { flex: 1, width: 3, marginVertical: 4, borderRadius: 2, backgroundColor: colors.trough },
  tWhen: { ...font.body[800], fontSize: 15, color: colors.ink, marginTop: 6 },
  tWhat: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 1 },

  benefit: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', boxShadow: clay.surface },
  benefitTitle: { ...font.body[700], fontSize: 16, color: colors.ink },
  benefitSub: { ...font.body[600], fontSize: 14, color: colors.muted, marginTop: 1 },

  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 18,
    boxShadow: clay.surface,
  },
  planSelected: { backgroundColor: pastel.butter },
  planFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius.lg },
  onPastelSoft: { color: colors.onPastel, opacity: 0.8 },
  badge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: pastel.peach,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 5,
    boxShadow: clay.surface,
  },
  badgeText: { ...font.body[800], fontSize: 11, letterSpacing: 0.6, color: colors.onPastel },
  radio: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.trough, boxShadow: clay.trough, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.card },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  planName: { ...font.display[800], fontSize: 18, color: colors.ink, letterSpacing: -0.2 },
  planSub: { ...font.body[600], fontSize: 13.5, color: colors.muted, marginTop: 2 },
  planPrice: { ...font.display[800], fontSize: 20, color: colors.ink, letterSpacing: -0.3 },
  planPer: { ...font.body[700], fontSize: 12, color: colors.muted },
  skeleton: { height: 76, borderRadius: radius.lg, backgroundColor: colors.trough },
  unavailable: { ...type.body, color: colors.muted, textAlign: 'center', paddingVertical: 12 },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  terms: { ...font.body[600], fontSize: 12.5, lineHeight: 17, color: colors.muted, textAlign: 'center' },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  legalLink: { ...font.body[600], fontSize: 12.5, color: colors.muted, textDecorationLine: 'underline', paddingVertical: 4 },
  legalDot: { ...font.body[600], fontSize: 12.5, color: colors.faint, paddingVertical: 4 },
  error: { ...font.body[600], fontSize: 14, lineHeight: 20, color: colors.dangerInk, textAlign: 'center' },

  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(58, 42, 32, 0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    boxShadow: clay.float,
  },
  grabber: { width: 38, height: 5, borderRadius: 3, backgroundColor: colors.trough, marginBottom: 12 },
  gift: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: pastel.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    boxShadow: clay.surface,
  },
  offerEyebrow: { ...type.label, fontSize: 12, letterSpacing: 1.2, color: colors.muted },
  offerTitle: { ...type.display, fontSize: 28, lineHeight: 32, color: colors.ink, textAlign: 'center' },
  offerPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  offerOld: { ...font.body[600], fontSize: 17, color: colors.faint, textDecorationLine: 'line-through' },
  offerNew: { ...font.display[800], fontSize: 24, color: colors.ink },
  offerPer: { ...font.body[600], fontSize: 14, color: colors.muted },
  offerNote: { ...font.body[600], fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 4 },
  decline: { alignSelf: 'center', paddingVertical: 12 },
  declineText: { ...font.body[700], fontSize: 15, color: colors.muted },

  welcome: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, maxWidth: 480, width: '100%', alignSelf: 'center' },
  welcomeCheck: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: clay.surface,
  },
  welcomeTitle: { ...type.display, color: colors.ink, textAlign: 'center' },
});

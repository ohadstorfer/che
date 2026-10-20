import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useReducedMotion,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EASE_OUT, IconButton, rise } from '@/components/onboarding-ui';
import { POSE } from '@/components/mascot';
import { Button } from '@/components/ui';
import { HiddenFromReplay } from '@/lib/analytics';
import { billing } from '@/lib/billing';
import { appleRedeemUrl, normalizeCode, type Offer, type Plan, type PurchaseOutcome, winbackDiscount } from '@/lib/billing-shared';
import { success, tap } from '@/lib/haptics';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import { resetTo } from '@/lib/nav';
import { track } from '@/lib/funnel';
import { formatDate, loadAnswers, nameTail, markWinbackShown, winbackShown } from '@/lib/onboarding';
import { cancelFreeUnitReminder, scheduleFreeUnitReminder } from '@/lib/free-unit-reminder';
import { type PaywallSource, usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { clay, colors, font, pastel, press, radius, type } from '@/lib/theme';
import { scheduleTrialReminder } from '@/lib/trial-reminder';
import { winbackOfferUntil } from '@/lib/winback-offer';

// ---------------------------------------------------------------------------
// Paywall — flow 7: ask right after onboarding, with a free week on the
// annual plan; if she closes it, one real one-time offer; if she closes that,
// Ready (her account, her reminder) and the free tier, and the paywall again
// only at moments she wants more.
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

// Prices, codes and her purchase (the code and offer sheets included): never
// seen in session replays.
export default function PaywallScreen() {
  return (
    <HiddenFromReplay>
      <Paywall />
    </HiddenFromReplay>
  );
}

function Paywall() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const params = useLocalSearchParams<{ from?: string; code?: string; offer?: string }>();
  const from = (params.from ?? 'home') as PaywallSource;
  const { catalog, hardPaywall, configReady, pass, freeChats, grant, refresh, testerUnlock, unlockAsTester } = usePremium();
  const main = catalog?.main ?? null;
  // With the hard paywall there is no way out (the gate, and right after
  // onboarding until the server has said which it is). The free week is offered
  // here from the next day instead (free-unit.tsx).
  const locked = hardPaywall || from === 'gate' || (from === 'onboarding' && !configReady);
  const freeWeek = hardPaywall && pass?.state === 'offer';

  const [stage, setStage] = useState<Stage>('plans');
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | 'tester' | 'code' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canClose, setCanClose] = useState(from !== 'onboarding');
  const [headline, setHeadline] = useState<{ title: string; sub: string } | null>(null);
  const [purchasedTrial, setPurchasedTrial] = useState(false);
  // A discount code: Android types it here; iOS types it in Apple's own sheet.
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // The plan she just built is the thing on offer; say so in its own words.
  useEffect(() => {
    let alive = true;
    void loadAnswers().then((answers) => {
      if (!alive) return;
      if (from === 'lesson') return setHeadline({ title: 'Keep going', sub: "You've finished the free units. Unlock the whole course." });
      if (from === 'hablar') return setHeadline({ title: 'Keep talking with Pancho', sub: `You've used your free ${freeChats === 1 ? 'chat' : 'chats'}. Talk with him every day.` });
      if (answers) return setHeadline({ title: `Pick your plan${nameTail(answers)}.`, sub: 'For less than a medialuna a day.' });
      setHeadline({ title: 'Posta Premium', sub: 'Everything in Posta, every day.' });
    });
    return () => {
      alive = false;
    };
  }, [from, freeChats]);

  // The first showing holds the close button back a moment, never longer.
  useEffect(() => {
    if (canClose) return;
    const t = setTimeout(() => setCanClose(true), 2200);
    return () => clearTimeout(t);
  }, [canClose]);

  useEffect(() => {
    track('paywall_shown', { from });
  }, [from]);

  // Out of onboarding with the hard paywall: a notification the next day,
  // when the free week opens, if she let us notify her.
  useEffect(() => {
    if (from === 'onboarding' && configReady && hardPaywall) void scheduleFreeUnitReminder();
  }, [from, configReady, hardPaywall]);

  // The day-30 win-back (posta://offer from the mail, or the app opening it by
  // itself): the offer over the plans, but only if the server says it is hers
  // (lib/winback-offer.ts) and once the store has priced it. If not, the plans.
  const offerLink = params.offer === 'winback';
  const [offerUntil, setOfferUntil] = useState<Date | null>(null);
  useEffect(() => {
    if (!offerLink) return;
    let alive = true;
    void winbackOfferUntil().then((until) => {
      if (alive) setOfferUntil(until);
    });
    return () => {
      alive = false;
    };
  }, [offerLink]);
  useEffect(() => {
    if (!offerUntil || stage !== 'plans' || !catalog?.winback || winbackDiscount(main, catalog.winback) == null) return;
    track('winback_shown', { from });
    setStage('offer');
  }, [offerUntil, catalog]);

  useEffect(() => {
    if (!selected && main?.plans[0]) setSelected(main.plans[0].id);
  }, [main, selected]);

  const plan = main?.plans.find((p) => p.id === selected) ?? null;
  
  // Out of onboarding the welcome screen is still underneath, so the app
  // starts fresh at Ready, bought or not: a guest saves her account there, and
  // the reminder she asked for is switched on. From inside the app, it goes
  // back to the Course that's there.
  const home = () => (from === 'onboarding' ? resetTo('/ready') : router.dismissTo('/home'));
  const leave = () => {
    if (from === 'onboarding' || from === 'gate' || !router.canGoBack()) home();
    else router.back();
  };

  const close = async () => {
    if (locked || busy) return;
    const offerReady = from === 'onboarding' && !!catalog?.winback && winbackDiscount(main, catalog.winback) != null;
    if (offerReady && !(await winbackShown())) {
      void markWinbackShown();
      track('paywall_closed', { from, next: 'offer' });
      track('winback_shown', { from });
      tap();
      return setStage('offer');
    }
    track('paywall_closed', { from, next: 'leave' });
    leave();
  };

  const decline = () => {
    track('winback_declined', { from });
    leave();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (codeOpen) setCodeOpen(false);
      else if (stage === 'offer') decline();
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
    const what = { from, offer, plan: p.period, trial: !!p.trialDays };
    track('checkout_started', what);
    const out = await billing.purchase(p.id, offer);
    setBusy(null);
    track('checkout_ended', { ...what, result: typeof out === 'object' ? 'error' : out });
    if (out === 'cancelled') return;
    if (out === 'pending') return setError('Your purchase is waiting for approval. We’ll unlock Posta as soon as it goes through.');
    if (typeof out === 'object') return setError(out.error);
    success();
    grant();
    void cancelFreeUnitReminder();
    setPurchasedTrial(!!p.trialDays);
    if (p.trialDays) void scheduleTrialReminder(p.trialDays);
    setStage('done');
    void refresh();
  };

  const opened = (out: PurchaseOutcome) => {
    if (out !== 'purchased') return false;
    success();
    grant();
    void cancelFreeUnitReminder();
    setPurchasedTrial(false);
    setCodeOpen(false);
    setStage('done');
    void refresh();
    return true;
  };

  const redeem = async (code?: string) => {
    if (busy) return;
    tap();
    setBusy('code');
    setCodeError(null);
    setError(null);
    const out = await billing.redeem(code);
    setBusy(null);
    track('checkout_ended', { from, offer: 'code', result: typeof out === 'object' ? 'error' : out });
    if (opened(out) || out === 'cancelled') return;
    const message =
      typeof out === 'object' ? out.error : 'Your purchase is waiting for approval. We’ll unlock Posta as soon as it goes through.';
    if (Platform.OS === 'ios') setError(message);
    else setCodeError(message);
  };

  const haveCode = () => {
    if (Platform.OS === 'ios') return void redeem();
    tap();
    setCodeError(null);
    setCodeOpen(true);
  };

  // A link with a code in it (posta://redeem?code=…): iOS goes to the App
  // Store's own page with the code filled in, Android opens the field with it.
  const linkCode = params.code ? normalizeCode(params.code) : '';
  useEffect(() => {
    if (!linkCode || !billing.available) return;
    if (Platform.OS === 'ios') void Linking.openURL(appleRedeemUrl(linkCode));
    else setCodeOpen(true);
  }, [linkCode]);

  const restore = async () => {
    if (busy) return;
    setBusy('restore');
    setError(null);
    const ok = await billing.restore().catch(() => false);
    setBusy(null);
    track('restore', { from, found: ok });
    if (!ok) return setError('No subscription found for this account.');
    success();
    grant();
    void cancelFreeUnitReminder();
    setStage('done');
  };

  const unlockTester = async () => {
    if (busy) return;
    tap();
    setBusy('tester');
    setError(null);
    const ok = await unlockAsTester();
    setBusy(null);
    if (!ok) return setError('Could not unlock. Check your connection and try again.');
    success();
    setStage('done');
  };

  // Out of onboarding she picks where to start (ready.tsx); anywhere else the
  // short welcome hands her back to what she was doing.
  useEffect(() => {
    if (stage === 'done' && from === 'onboarding') resetTo('/ready');
  }, [stage, from]);
  if (stage === 'done') return from === 'onboarding' ? null : <Welcome trial={purchasedTrial} reduced={reduced} onGo={home} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        {locked ? (
          <View style={{ width: 36 }} />
        ) : canClose ? (
          <Animated.View entering={FadeIn.duration(260)}>
            <IconButton icon="close" label="Close" onPress={close} tint={colors.muted} />
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
        <Animated.View entering={rise(0, reduced)} style={styles.hero}>
          <View style={styles.heroPod} />
          <Image source={POSE.gol} style={styles.heroArt} contentFit="contain" accessible={false} />
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

        <Animated.View entering={rise(3, reduced)} style={styles.plans} accessibilityRole="radiogroup">
          {main ? (
            main.plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selected === p.id}
                badge={p.period === 'year' && main.plans.length > 1}
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
              <View style={styles.skeleton} />
            </>
          )}
        </Animated.View>

        {billing.available && main ? (
          <Animated.View entering={rise(4, reduced)}>
            <Pressable onPress={haveCode} hitSlop={8} style={styles.haveCode} accessibilityRole="button" disabled={!!busy}>
              {busy === 'code' && Platform.OS === 'ios' ? (
                <ActivityIndicator color={colors.muted} />
              ) : (
                <Text style={styles.haveCodeText}>Have a code?</Text>
              )}
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button
            title={plan?.trialDays ? `Start my free ${trialWord(plan.trialDays)}` : 'Continue'}
            onPress={() => void buy('main', plan)}
            loading={busy === 'buy'}
            disabled={!plan || !!busy}
          />
          {freeWeek ? (
            <Button
              title="Try Unit 1 free"
              variant="secondary"
              onPress={() => {
                tap();
                router.push('/free-unit');
              }}
              disabled={!!busy}
            />
          ) : null}
          {testerUnlock ? (
            <Button
              title="Unlock as a tester"
              variant="secondary"
              onPress={() => void unlockTester()}
              loading={busy === 'tester'}
              disabled={!!busy}
            />
          ) : null}
        </View>
        {plan ? (
          <Text style={styles.terms}>
            {plan.trialDays
              ? `Free for ${plan.trialDays} days, then ${plan.priceString}/${perPeriod(plan)}. Cancel anytime.`
              : `${plan.priceString}/${perPeriod(plan)}. Renews automatically. Cancel anytime.`}
          </Text>
        ) : null}
        <Legal />
      </View>

      {stage === 'offer' && catalog?.winback ? (
        <WinbackSheet
          main={main}
          winback={catalog.winback}
          until={offerUntil}
          reduced={reduced}
          busy={busy === 'buy'}
          error={error}
          onClaim={() => void buy('winback', catalog.winback!.plans.find((p) => p.period === 'year') ?? null)}
          onDecline={decline}
        />
      ) : null}

      {codeOpen ? (
        <CodeSheet
          initial={linkCode}
          reduced={reduced}
          busy={busy === 'code'}
          error={codeError}
          onApply={(code) => void redeem(code)}
          onClose={() => !busy && setCodeOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

// --- a plan, as a sticker -------------------------------------------------------

function PlanCard({ plan, selected, badge, onPress }: { plan: Plan; selected: boolean; badge: boolean; onPress: () => void }) {
  const name = plan.period === 'year' ? 'Yearly' : plan.period === 'week' ? 'Weekly' : 'Monthly';
  const per = `a ${perPeriod(plan)}${plan.trialDays ? ` · ${trialWord(plan.trialDays)} free` : ''}`;
  // The badge is the card's sibling, drawn after it: as a child, iOS paints the card's outline across it.
  return (
    <View style={styles.planSlot}>
      <Pressable
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={({ pressed }) => [
          styles.plan,
          selected ? styles.planSelected : styles.planFlat,
          { transform: [{ scale: pressed ? press.scale : 1 }] },
          webPress,
        ]}>
        <Text style={styles.planName}>{name}</Text>
        <Text style={styles.planPrice}>{plan.priceString}</Text>
        <Text style={styles.planPer}>{per}</Text>
      </Pressable>
      {badge ? (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>Best value</Text>
        </View>
      ) : null}
    </View>
  );
}

// --- the links the stores ask for wherever she can buy --------------------------

function Legal() {
  return (
    <View style={styles.legal}>
      <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)}>
        Terms
      </Text>
      <Text style={styles.legalDot}>·</Text>
      <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}>
        Privacy
      </Text>
    </View>
  );
}

// --- the one-time offer -------------------------------------------------------

function WinbackSheet({
  main,
  winback,
  until,
  reduced,
  busy,
  error,
  onClaim,
  onDecline,
}: {
  main: Offer | null;
  winback: Offer;
  /** The day-30 offer's last day; none for the one on closing the first paywall. */
  until: Date | null;
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
          <View
            style={styles.offerPriceRow}
            accessible
            accessibilityLabel={`${firstYear} for your first year${regular ? `, instead of ${regular.priceString}` : ''}${discount ? `, ${discount}% off` : ''}`}>
            {regular ? <Text style={styles.offerOld}>{regular.priceString}</Text> : null}
            <Text style={styles.offerNew}>{firstYear}</Text>
          </View>
          <Text style={styles.offerPer}>for your first year · {until ? `until ${formatDate(until)}` : 'only now'}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={{ alignSelf: 'stretch', gap: 2, marginTop: 14 }}>
            <Button title="Claim offer" onPress={onClaim} loading={busy} />
            <Pressable onPress={onDecline} hitSlop={8} style={styles.decline} accessibilityRole="button" disabled={busy}>
              <Text style={styles.declineText}>No thanks</Text>
            </Pressable>
          </View>
          {/* Apple wants the renewal price, cancel info and Terms/Privacy where people buy: one quiet line. */}
          <View style={styles.offerFine}>
            {offer && regular ? <Text style={styles.terms}>Then {regular.priceString}/year. Cancel anytime.</Text> : null}
            <Legal />
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// --- a discount code (Android; iOS uses Apple's sheet) -------------------------

function CodeSheet({
  initial,
  reduced,
  busy,
  error,
  onApply,
  onClose,
}: {
  initial: string;
  reduced: boolean;
  busy: boolean;
  error: string | null;
  onApply: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState(initial);
  const valid = normalizeCode(code).length >= 3;
  // The sheet stands on the keyboard, followed frame by frame.
  const { height: keyboard } = useReanimatedKeyboardAnimation();
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: keyboard.get() }] }));
  const drawer = reduced ? FadeIn.duration(180) : SlideInDown.duration(300).easing(EASE_OUT);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(140)} style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View style={[styles.sheetSlot, lift]} pointerEvents="box-none">
        <Animated.View entering={drawer} exiting={reduced ? FadeOut.duration(140) : SlideOutDown.duration(200).easing(EASE_OUT)} style={styles.codeSheet}>
          <SafeAreaView edges={['bottom']} style={{ gap: 12 }}>
            <View style={[styles.grabber, { alignSelf: 'center', marginBottom: 4 }]} />
            <Text style={styles.codeTitle}>Enter your code</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="POSTA50"
              placeholderTextColor={colors.faint}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={!initial}
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={() => valid && !busy && onApply(code)}
              editable={!busy}
              style={styles.codeInput}
              accessibilityLabel="Discount code"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Apply" onPress={() => onApply(code)} loading={busy} disabled={!valid || busy} />
          </SafeAreaView>
        </Animated.View>
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
  hero: { height: 176, alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  heroPod: { position: 'absolute', bottom: 0, width: 150, height: 150, borderRadius: 75, backgroundColor: pastel.peach, boxShadow: clay.surface },
  heroArt: { width: 138, height: 172, marginBottom: 0 },
  title: { ...type.display, fontSize: 30, lineHeight: 34, color: colors.ink, textAlign: 'center', marginTop: 18 },
  sub: { ...type.body, fontSize: 16, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 6 },

  plans: { flexDirection: 'row', gap: 14, marginTop: 40 },
  planSlot: { flex: 1 },
  plan: { flex: 1, alignItems: 'center', gap: 4, paddingTop: 30, paddingBottom: 22, paddingHorizontal: 10, borderRadius: radius.lg },
  planSelected: { backgroundColor: pastel.butter, boxShadow: clay.surface },
  planFlat: { backgroundColor: colors.card, boxShadow: clay.flat },
  badge: { position: 'absolute', top: -14, alignSelf: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, boxShadow: clay.chip },
  badgeText: { ...font.body[800], fontSize: 12.5, lineHeight: 16, color: colors.onPrimary },
  planName: { ...font.body[800], fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  planPrice: { ...font.display[900], fontSize: 30, lineHeight: 34, letterSpacing: -0.6, color: colors.ink },
  planPer: { ...font.body[700], fontSize: 14, color: colors.muted, textAlign: 'center' },
  skeleton: { flex: 1, height: 120, borderRadius: radius.lg, backgroundColor: colors.trough },
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
  actions: { gap: 18 },
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
  offerPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, justifyContent: 'center', marginTop: 8 },
  offerOld: { ...font.display[700], fontSize: 22, color: colors.muted, textDecorationLine: 'line-through' },
  offerNew: { ...font.display[900], fontSize: 40, lineHeight: 44, color: colors.ink },
  offerPer: { ...font.body[600], fontSize: 16, color: colors.muted },
  offerFine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: 6 },
  decline: { alignSelf: 'center', paddingVertical: 12 },
  declineText: { ...font.body[700], fontSize: 15, color: colors.muted },

  haveCode: { alignSelf: 'center', marginTop: 22, paddingVertical: 6, paddingHorizontal: 8, minHeight: 32, justifyContent: 'center' },
  haveCodeText: { ...font.body[700], fontSize: 15, color: colors.muted, textDecorationLine: 'underline' },
  sheetSlot: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  codeSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    boxShadow: clay.float,
  },
  codeTitle: { ...type.display, fontSize: 22, lineHeight: 28, color: colors.ink, textAlign: 'center' },
  codeInput: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: clay.flat,
    ...font.body[800],
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    color: colors.ink,
  },

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

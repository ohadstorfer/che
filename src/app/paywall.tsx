import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  useWindowDimensions,
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
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Slap } from '@/components/cheer-bits';
import { EASE_OUT, IconButton, rise } from '@/components/onboarding-ui';
import { Button } from '@/components/ui';
import { billing } from '@/lib/billing';
import {
  annualSaving,
  appleRedeemUrl,
  normalizeCode,
  type Offer,
  type Plan,
  type PurchaseOutcome,
  trialDaysLeft,
  trialEnd,
  trialLabel,
  winbackDiscount,
} from '@/lib/billing-shared';
import { success, tap } from '@/lib/haptics';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import { resetTo } from '@/lib/nav';
import { track } from '@/lib/funnel';
import { checkCreatorCode, type CreatorCode, loadCreatorCode, saveCreatorCode } from '@/lib/creator-code';
import { formatDate, markWinbackShown, winbackShown } from '@/lib/onboarding';
import { cancelFreeUnitReminder, scheduleFreeUnitReminder } from '@/lib/free-unit-reminder';
import { type PaywallSource, usePremium } from '@/lib/premium';
import { useStatusBarColor } from '@/lib/status-bar-color';
import { supabase } from '@/lib/supabase';
import { clay, colors, font, pastel, press, radius, type } from '@/lib/theme';
import { scheduleTrialReminder } from '@/lib/trial-reminder';
import { winbackOfferUntil } from '@/lib/winback-offer';
import { type PaywallConfig, SCREEN_COLORS, type ScreenColor, paywallConfig } from '@/lib/remote-config';
import { queueWelcomeTour } from '@/lib/welcome-tour';

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
const trialWord = (days: number) => (days === 7 ? 'week' : days === 30 || days === 31 ? 'month' : `${days} days`);

/** The headline: three lines, each kept on one line on every phone. */
const HERO = ['Understand Argentines.', 'Sound like one.', 'In a few minutes a day.'];

/** The sticker line's size: 21 when it fits, smaller for a longer line, never under 15.
 *  Room = the screen less the page's and the sticker's padding; a display-font
 *  character is about 0.56 of its size wide. */
const stickerSize = (text: string, width: number) => {
  const room = Math.min(width, 560) - 48 - 28;
  const size = Math.max(15, Math.min(21, room / (Math.max(text.length, 1) * 0.56)));
  return { fontSize: size, lineHeight: Math.round(size * 1.25) };
};

/** A failed restore, a moment ago: tapping again says the same, without asking the store. */
const RESTORE_COOLDOWN = 15000;

// Recorded in session replays like any other screen, so we can see how she
// reads the plans and where she stops. The store's own payment sheet is drawn
// by Google/Apple outside the app and never appears in a replay.
export default function Paywall() {
  useStatusBarColor(colors.bg);
  const reduced = useReducedMotion();
  const params = useLocalSearchParams<{ from?: string; code?: string; offer?: string }>();
  const from = (params.from ?? 'home') as PaywallSource;
  const { catalog, hardPaywall, configReady, pass, grant, refresh, refreshPass, reloadCatalog, testerUnlock, unlockAsTester } = usePremium();
  const main = catalog?.main ?? null;
  // The store was asked (configReady comes with it) and no plans came: say
  // so, with a way to ask again, instead of grey cards forever.
  const [retrying, setRetrying] = useState(false);
  const plansFailed = Platform.OS !== 'web' && configReady && !main && !retrying;
  const retryPlans = async () => {
    setRetrying(true);
    await reloadCatalog();
    setRetrying(false);
  };
  const freeWeek = hardPaywall && pass?.state === 'offer';
  // The dashboard's knobs (app_config `paywall`, lib/remote-config.ts): the
  // headline, the plans, the close button and its offer. Unread: the defaults.
  const [cfg, setCfg] = useState<PaywallConfig | null>(null);
  useEffect(() => {
    let alive = true;
    void paywallConfig()
      .then((c) => alive && setCfg(c))
      .catch(() => alive && setCfg((c) => c ?? {}));
    // No answer in 3 s (no connection): the defaults, so the close button still comes.
    const t = setTimeout(() => alive && setCfg((c) => c ?? {}), 3000);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  const winWidth = useWindowDimensions().width;
  const hero = cfg?.hero?.length === 3 && cfg.hero.every((l) => typeof l === 'string' && l.trim()) ? cfg.hero : HERO;

  const [stage, setStage] = useState<Stage>('plans');
  // With the hard paywall there is no way out: no close button, not even out of
  // onboarding (the user, 2026-11-19, when "Learn more" went). The free week is
  // offered here from the next day instead (free-unit.tsx).
  const offerReady = from === 'onboarding' && !!catalog?.winback && winbackDiscount(main, catalog.winback) != null;
  const locked = hardPaywall || from === 'gate' || (from === 'onboarding' && !configReady);
  // The hard paywall out of onboarding still gets a close button after a few
  // seconds (the user, 2026-11-19), but it only opens the one-time 40% offer,
  // never a way out. Not when the offer was already shown or isn't priced.
  const [offerSeen, setOfferSeen] = useState<boolean | null>(null);
  useEffect(() => {
    void winbackShown().then(setOfferSeen);
  }, []);
  const exitOffer =
    from === 'onboarding' && hardPaywall && configReady && cfg?.close_offer !== false && offerReady && offerSeen === false && stage === 'plans';
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | 'tester' | 'code' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canClose, setCanClose] = useState(from !== 'onboarding');
  const showClose = (!locked || exitOffer) && canClose;
  const [purchasedTrial, setPurchasedTrial] = useState(0);
  // A discount code: Android types it here; iOS types it in Apple's own sheet.
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  // A creator's code from onboarding (lib/creator-code.ts): on Android the
  // annual plan is bought with the creator offer, the first month free.
  const [creator, setCreator] = useState<CreatorCode | null>(null);
  useEffect(() => {
    if (Platform.OS === 'android') void loadCreatorCode().then(setCreator);
  }, []);

  // The first showing holds the close button back a moment, never longer.
  useEffect(() => {
    // Wait for the premium config too: hardPaywall starts false, and a 2.2 s timer
    // started before it lands would show the hard paywall's X far too early.
    if (canClose || !cfg || !configReady) return;
    // The dashboard's delay is for the hard paywall's X; the soft one keeps its 2.2 s.
    const secs = hardPaywall ? (cfg.close_after_seconds ?? 15) : 2.2;
    const t = setTimeout(() => setCanClose(true), Math.max(0, secs) * 1000);
    return () => clearTimeout(t);
  }, [canClose, cfg, hardPaywall, configReady]);

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

  // The yearly plan comes first and is chosen for her until she picks one
  // herself — even if the store lists the monthly plan a moment before it.
  const picked = useRef(false);
  const shownPlans = (main?.plans ?? []).filter((p) => cfg?.show_monthly !== false || p.period !== 'month' || main!.plans.length === 1);
  useEffect(() => {
    // Her pick stands unless that plan is no longer shown (the config arrived late and hid it).
    if (picked.current && !shownPlans.some((p) => p.id === selected)) picked.current = false;
    const first = shownPlans.find((p) => p.period === (cfg?.preselect ?? 'year')) ?? shownPlans[0];
    if (first && !picked.current && selected !== first.id) setSelected(first.id);
  }, [main, selected, cfg]);

  const plan = shownPlans.find((p) => p.id === selected) ?? null;
  const creatorOffer = !!creator && billing.available && plan?.period === 'year';
  
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
    if (busy) return;
    if (locked && !exitOffer) return;
    if ((offerReady && cfg?.close_offer !== false && !(await winbackShown())) || exitOffer) {
      void markWinbackShown();
      setOfferSeen(true);
      track('paywall_closed', { from, next: 'offer' });
      track('winback_shown', { from });
      tap();
      return setStage('offer');
    }
    track('paywall_closed', { from, next: 'leave' });
    leave();
  };

  // The free week, opened today. If it can't be (no connection), she stays on
  // the plans with the error and a "Try Unit 1 free" that asks again, rather
  // than landing on a free-unit screen that says "tomorrow".
  const [freeNow, setFreeNow] = useState(false);
  // One call at a time: a second tap while it runs would push a second free-unit screen.
  const opening = useRef(false);
  const openFreeNow = async () => {
    if (opening.current) return;
    opening.current = true;
    setFreeNow(true);
    setError(null);
    try {
      const { error: failed } = await supabase.rpc('open_free_pass_now');
      if (failed) return setError('Couldn’t open your free week. Check your connection and try again.');
      await refreshPass();
      router.push('/free-unit');
    } finally {
      opening.current = false;
    }
  };

  const decline = () => {
    track('winback_declined', { from });
    // Hard paywall: the free week opens now instead of tomorrow
    // (open_free_pass_now), and she goes straight to it. The plans stay
    // underneath, with no close button and "Try Unit 1 free" on them.
    if (hardPaywall && from === 'onboarding') {
      setStage('plans');
      // Back to the plans (2026-11-19: the X gives 40% off, not a free week);
      // the free week as before only if the dashboard asks for it.
      if (cfg?.offer_decline === 'free_week') void openFreeNow();
      return;
    }
    leave();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (codeOpen) setCodeOpen(false);
      else if (stage === 'offer') decline();
      else if (showClose) void close();
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
    // Her first purchase: the welcome tour waits for the tabs (once, ever).
    void queueWelcomeTour();
    void cancelFreeUnitReminder();
    setPurchasedTrial(p.trialDays ?? 0);
    const ends = trialEnd(p);
    if (ends) void scheduleTrialReminder(ends);
    setStage('done');
    void refresh();
  };

  const opened = (out: PurchaseOutcome) => {
    if (out !== 'purchased') return false;
    success();
    grant();
    void queueWelcomeTour();
    void cancelFreeUnitReminder();
    setPurchasedTrial(0);
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

  // The annual plan with a creator's code: the creator offer through
  // redeem-code. If the store has no such offer, the plan as it is.
  const buyWithCreator = async () => {
    if (!creator || busy) return;
    tap();
    setBusy('code');
    setError(null);
    track('checkout_started', { from, offer: 'creator', plan: 'year', trial: true });
    const out = await billing.redeem(creator.code);
    setBusy(null);
    track('checkout_ended', { from, offer: 'creator', result: typeof out === 'object' ? 'error' : out });
    if (opened(out) || out === 'cancelled') return;
    if (out === 'pending') return setError('Your purchase is waiting for approval. We’ll unlock Posta as soon as it goes through.');
    setCreator(null);
    void buy('main', plan);
  };

  // "Have a code?": one field for both kinds. A creator's code (the step
  // onboarding used to ask, lib/creator-code.ts) is kept for her account; on
  // Android it also opens the creator offer. Any other code is the store's:
  // Android redeems it here, iOS opens the App Store's page with it filled in.
  const haveCode = () => {
    if (busy) return;
    tap();
    setCodeError(null);
    setCodeOpen(true);
  };
  const applyCode = async (raw: string) => {
    if (busy) return;
    const code = normalizeCode(raw);
    setBusy('code');
    setCodeError(null);
    const name = await checkCreatorCode(code);
    setBusy(null);
    if (name) {
      success();
      await saveCreatorCode({ code, name });
      setCreator({ code, name });
      setCodeOpen(false);
      return;
    }
    if (Platform.OS === 'android' && billing.available) return void redeem(code);
    if (name === undefined) return setCodeError('Couldn’t check the code. Check your connection.');
    if (Platform.OS === 'ios' && billing.available) {
      setCodeOpen(false);
      return void Linking.openURL(appleRedeemUrl(code));
    }
    setCodeError('That code isn’t valid.');
  };

  // A link with a code in it (posta://redeem?code=…): iOS goes to the App
  // Store's own page with the code filled in, Android opens the field with it.
  const linkCode = params.code ? normalizeCode(params.code) : '';
  useEffect(() => {
    if (!linkCode || !billing.available) return;
    if (Platform.OS === 'ios') void Linking.openURL(appleRedeemUrl(linkCode));
    else setCodeOpen(true);
  }, [linkCode]);

  // Restore sits low and quiet: on a hard paywall people tapped it again and
  // again as a way out. A miss says plainly what's next, and a tap right after
  // a miss repeats that instead of asking the store again.
  const restoreMissAt = useRef(0);
  const restoreMiss = `No subscription on this ${Platform.OS === 'ios' ? 'Apple' : 'Google Play'} account. Posta needs a plan to go on: the trial is free and you can cancel anytime.`;
  const restore = async () => {
    if (busy) return;
    if (Date.now() - restoreMissAt.current < RESTORE_COOLDOWN) {
      track('restore', { from, found: false, repeat: true });
      return setError(restoreMiss);
    }
    setBusy('restore');
    setError(null);
    const ok = await billing.restore().catch(() => false);
    setBusy(null);
    track('restore', { from, found: ok });
    if (!ok) {
      restoreMissAt.current = Date.now();
      return setError(restoreMiss);
    }
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

  // "There's more below": a fade over the bottom edge while content remains, and
  // the scroll bar flashed once, the iOS way, when the page first overflows.
  const scroller = useRef<ScrollView>(null);
  const dims = useRef({ view: 0, content: 0, y: 0 });
  const flashed = useRef(false);
  const more = useSharedValue(0);
  const measure = (next: Partial<typeof dims.current>) => {
    const d = Object.assign(dims.current, next);
    if (!d.view || !d.content) return;
    const left = d.content - d.view - d.y > 12;
    more.value = withTiming(left ? 1 : 0, { duration: 180 });
    if (left && !flashed.current && d.y < 4) {
      flashed.current = true;
      setTimeout(() => scroller.current?.flashScrollIndicators(), 700);
    }
  };
  const fadeStyle = useAnimatedStyle(() => ({ opacity: more.value }));

  // Out of onboarding she picks where to start (ready.tsx); anywhere else the
  // short welcome hands her back to what she was doing.
  useEffect(() => {
    if (stage === 'done' && from === 'onboarding') resetTo('/ready');
  }, [stage, from]);
  if (stage === 'done') return from === 'onboarding' ? null : <Welcome trial={purchasedTrial} reduced={reduced} onGo={home} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* The bar only takes room when it has the close button: locked, the
          headline starts right under the safe area, so the whole trial
          timeline fits above the button on a regular-size phone. */}
      {!showClose ? null : (
        <View style={styles.topBar}>
          <Animated.View entering={FadeIn.duration(260)}>
            <IconButton icon="close" label="Close" onPress={close} tint={colors.muted} />
          </Animated.View>
        </View>
      )}

      <View style={styles.scrollWrap}>
        <ScrollView
          ref={scroller}
          contentContainerStyle={styles.body}
          scrollEventThrottle={32}
          onLayout={(e) => measure({ view: e.nativeEvent.layout.height })}
          onContentSizeChange={(_, h) => measure({ content: h })}
          onScroll={(e) => measure({ y: e.nativeEvent.contentOffset.y })}>
        {/* Three lines, each always on one line: it shrinks before it wraps. The
            last is the rosa sticker from the welcome screen, so the promise she
            started with is the one she pays for; it lands once, nothing more. */}
        <Animated.View entering={rise(0, reduced)} accessibilityRole="header" accessible accessibilityLabel={hero.join(' ')}>
          {hero.slice(0, 2).map((line) => (
            <Text key={line} style={styles.hero} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {line}
            </Text>
          ))}
          <Slap delay={250} tilt={-2.5} style={styles.heroSticker}>
            {/* Sized from its length, not adjustsFontSizeToFit: on iOS that one
                measured the sticker mid-landing and left the line tiny (2026-11-19). */}
            <Text style={[styles.heroStickerText, stickerSize(hero[2], winWidth)]} numberOfLines={1}>
              {hero[2]}
            </Text>
          </Slap>
        </Animated.View>

        {creator ? (
          <Animated.View entering={rise(2, reduced)} style={styles.creatorChip}>
            <Text style={styles.creatorChipText}>
              {Platform.OS === 'android' ? `${creator.name}’s code: your first month free on the yearly plan` : `Thanks to ${creator.name}! Your code is saved.`}
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={rise(2, reduced)} style={styles.plans} accessibilityRole="radiogroup">
          {main ? (
            shownPlans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selected === p.id}
                save={p.period === 'year' ? annualSaving(main.plans) : null}
                onPress={() => {
                  tap();
                  picked.current = true;
                  setSelected(p.id);
                }}
              />
            ))
          ) : Platform.OS === 'web' && catalog ? (
            <Text style={styles.unavailable}>
              Subscriptions are in the Posta app for iPhone and Android. Subscribe there and Premium opens here too.
            </Text>
          ) : plansFailed ? (
            <>
              <Text style={styles.unavailable}>Plans could not load. Check your connection and try again.</Text>
              <Button title="Try again" variant="secondary" onPress={() => void retryPlans()} />
            </>
          ) : (
            <>
              <View style={styles.skeleton} />
              <View style={styles.skeleton} />
            </>
          )}
        </Animated.View>

        {plan?.trialDays ? <TrialSteps plan={plan} tones={cfg?.timeline_colors} /> : null}

        </ScrollView>
        {/* More below: the page fades out above the button, and stops fading at the end. */}
        <Animated.View pointerEvents="none" style={[styles.fade, fadeStyle]}>
          <LinearGradient colors={[`${colors.bg}00`, colors.bg]} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button
            title={creatorOffer ? 'Start my free month' : plan && trialLabel(plan) ? `Start ${trialLabel(plan)!.adj} free trial` : 'Continue'}
            onPress={() => void (creatorOffer ? buyWithCreator() : buy('main', plan))}
            loading={busy === 'buy' || (creatorOffer && busy === 'code')}
            disabled={!plan || !!busy}
          />
          {freeWeek || freeNow ? (
            <Button
              title="Try Unit 1 free"
              variant="secondary"
              onPress={() => {
                tap();
                if (freeWeek) router.push('/free-unit');
                else void openFreeNow();
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
            {/* The date the store charges, counted the way it counts (a trial
                month is a calendar month): the most binding line on the page. */}
            {trialEnd(plan)
              ? `You won’t be charged until ${formatDate(trialEnd(plan)!)}. Then ${plan.priceString}/${perPeriod(plan)}, auto-renews. Cancel anytime before.`
              : `${plan.priceString}/${perPeriod(plan)}. Renews automatically. Cancel anytime.`}
          </Text>
        ) : null}
        <Legal onRestore={billing.available ? restore : undefined} restoring={busy === 'restore'} onCode={haveCode} />
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
          onApply={(code) => void applyCode(code)}
          onClose={() => !busy && setCodeOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

// --- a plan, as a sticker -------------------------------------------------------

function PlanCard({ plan, selected, save, onPress }: { plan: Plan; selected: boolean; save: number | null; onPress: () => void }) {
  const name = plan.period === 'year' ? 'Yearly' : plan.period === 'week' ? 'Weekly' : 'Monthly';
  const trial = trialLabel(plan);
  const tag = [trial ? `${trial.noun} free` : null, save ? `Save ${save}%` : null].filter(Boolean).join(' · ');
  const under = plan.period === 'year' && plan.perMonthString ? `Just ${plan.perMonthString} a month` : `Billed every ${perPeriod(plan)}`;
  // The tag is the card's sibling, drawn after it: as a child, iOS paints the card's outline across it.
  return (
    <View>
      <Pressable
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={`${name}, ${plan.priceString} a ${perPeriod(plan)}${tag ? `, ${tag}` : ''}`}
        style={({ pressed }) => [
          styles.plan,
          selected ? styles.planSelected : styles.planFlat,
          { transform: [{ scale: pressed ? press.scale : 1 }] },
          webPress,
        ]}>
        <View style={[styles.radio, selected ? styles.radioOn : null]} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.planName}>{name}</Text>
          <Text style={styles.planUnder}>{under}</Text>
        </View>
        {/* The amount she's billed is the biggest number on the card (Apple 3.1.2). */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.planPrice}>{plan.priceString}</Text>
          <Text style={styles.planUnder}>a {perPeriod(plan)}</Text>
        </View>
      </Pressable>
      {tag ? (
        <View style={[styles.tag, plan.period === 'year' ? styles.tagHot : null]} pointerEvents="none">
          <Text style={[styles.tagText, plan.period === 'year' ? { color: colors.onPrimary } : null]}>{tag}</Text>
        </View>
      ) : null}
    </View>
  );
}

// --- the free trial, as a timeline: when it ends is never a surprise ------------

function TrialSteps({ plan, tones }: { plan: Plan; tones?: PaywallConfig['timeline_colors'] }) {
  // The three dots' colours: the dashboard's (app_config paywall.timeline_colors,
  // app colour names), else sage / sky / lav (2026-11-19:
  // green reads as "open, free", sky as "we'll tell you", lavender as premium
  // rather than the alarm a rosa dot gave the charge day).
  const tone = (i: number, fallback: string) => {
    const name = tones?.[i];
    return (name && SCREEN_COLORS[name as ScreenColor]) || fallback;
  };
  // Days to the real charge date: 28 for a trial month started in February.
  const days = trialDaysLeft(plan);
  const label = trialLabel(plan)?.noun ?? `${days} days`;
  const steps: { when: string; what: string; icon: 'lock-open' | 'notifications' | 'star'; tone: string }[] = [
    { when: 'Today', what: 'The whole course, AI speaking practice, slang and culture. All yours.', icon: 'lock-open', tone: tone(0, pastel.sage) },
    // The reminder really goes out two days before (lib/trial-reminder).
    { when: `In ${Math.max(1, days - 2)} days`, what: 'We’ll remind you that your free trial is ending.', icon: 'notifications', tone: tone(1, pastel.sky) },
    {
      when: `In ${days} days`,
      what: `Your ${plan.period === 'year' ? 'yearly' : plan.period === 'week' ? 'weekly' : 'monthly'} plan starts. You’ll be charged ${plan.priceString}.`,
      icon: 'star',
      tone: tone(2, pastel.lav),
    },
  ];
  return (
    <View style={styles.trial}>
      <Text style={[styles.h2, styles.trialHead]}>Try it for {label} free</Text>
      <View>
        {steps.map((s, i) => (
          <View key={s.when} style={styles.step}>
            <View style={styles.stepRail}>
              <View style={[styles.stepDot, { backgroundColor: s.tone }]}>
                <Ionicons name={s.icon} size={20} color={s.tone === colors.primary ? colors.onPrimary : colors.ink} />
              </View>
              {i < steps.length - 1 ? <View style={styles.stepLine} /> : null}
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepWhen}>{s.when}</Text>
              <Text style={styles.stepWhat}>{s.what}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- the links the stores ask for wherever she can buy --------------------------

function Legal({ onRestore, restoring, onCode }: { onRestore?: () => void; restoring?: boolean; onCode?: () => void } = {}) {
  return (
    <View style={styles.legal}>
      <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)}>
        Terms
      </Text>
      <Text style={styles.legalDot}>·</Text>
      <Text style={styles.legalLink} onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}>
        Privacy
      </Text>
      {onRestore ? (
        <>
          <Text style={styles.legalDot}>·</Text>
          {restoring ? (
            <ActivityIndicator size="small" color={colors.muted} />
          ) : (
            <Text style={styles.legalLink} onPress={onRestore} accessibilityRole="button">
              Subscribed? Restore
            </Text>
          )}
        </>
      ) : null}
      {onCode ? (
        <>
          <Text style={styles.legalDot}>·</Text>
          <Text style={[styles.legalLink, styles.legalCode]} onPress={onCode} accessibilityRole="button">
            Have a code?
          </Text>
        </>
      ) : null}
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
            {/* After the cheaper first year she renews at the offer product's own
                price, which need not be the regular annual's. */}
            {offer?.introPrice ? <Text style={styles.terms}>Then {offer.priceString}/year. Cancel anytime.</Text> : null}
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

function Welcome({ trial, reduced, onGo }: { trial: number; reduced: boolean; onGo: () => void }) {
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
      <Animated.Text entering={rise(4, reduced)} style={[styles.sub, styles.welcomeSub]}>
        {trial ? `Your free ${trialWord(trial)} starts now. We'll remind you before it ends.` : 'All of Posta is open. ¡Vamos!'}
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
  // The page fills the room above the button: the headline, the plans and the
  // trial share the spare height evenly. On a phone too short for it all, the
  // minimum gaps below hold and the page scrolls.
  body: { flexGrow: 1, justifyContent: 'space-evenly', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, maxWidth: 520, width: '100%', alignSelf: 'center' },
  hero: { ...font.display[900], fontSize: 31, lineHeight: 35, letterSpacing: -0.8, color: colors.ink, textAlign: 'center' },
  heroSticker: {
    alignSelf: 'center',
    maxWidth: '100%',
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary,
    boxShadow: clay.surface,
  },
  heroStickerText: { ...font.display[900], fontSize: 21, lineHeight: 26, letterSpacing: -0.3, color: colors.onPrimary },
  sub: { ...type.body, flex: 1, fontSize: 16, lineHeight: 22, color: colors.muted },
  h2: { ...font.display[900], fontSize: 22, lineHeight: 27, letterSpacing: -0.3, color: colors.ink, marginTop: 30, marginBottom: 14 },

  // Room for the next plan's badge, which sits over its top edge, to clear the card above.
  plans: { gap: 30, marginTop: 24 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 20, paddingBottom: 14, paddingHorizontal: 18, borderRadius: radius.lg },
  planSelected: { backgroundColor: pastel.butter, boxShadow: clay.surface },
  planFlat: { backgroundColor: colors.card, boxShadow: clay.flat },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.card },
  radioOn: { backgroundColor: colors.ink, boxShadow: `inset 0 0 0 4px ${pastel.butter}` },
  planName: { ...font.display[900], fontSize: 21, lineHeight: 25, color: colors.ink },
  planUnder: { ...font.body[800], fontSize: 13, lineHeight: 17, color: colors.muted },
  planPrice: { ...font.display[900], fontSize: 23, lineHeight: 27, letterSpacing: -0.4, color: colors.ink },
  tag: { position: 'absolute', top: -13, left: 16, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 3, boxShadow: clay.chip },
  tagHot: { backgroundColor: colors.primary },
  tagText: { ...font.body[800], fontSize: 13, lineHeight: 17, color: colors.ink },

  // The last step keeps its 20 of padding; pull the next heading up a little.
  trial: { marginTop: 0, marginBottom: -12 },
  step: { flexDirection: 'row', gap: 16 },
  stepRail: { width: 42, alignItems: 'center' },
  stepDot: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', boxShadow: clay.trough },
  stepLine: { width: 3, flex: 1, minHeight: 14, borderRadius: 2, backgroundColor: colors.ink, marginVertical: 2 },
  stepText: { flex: 1, gap: 2, paddingTop: 1, paddingBottom: 14 },
  trialHead: { marginTop: 20 },
  stepWhen: { ...font.body[800], fontSize: 16, lineHeight: 20, color: colors.ink },
  stepWhat: { ...font.body[700], fontSize: 14, lineHeight: 19, color: colors.inkOnWash },

  skeleton: { flex: 1, height: 120, borderRadius: radius.lg, backgroundColor: colors.trough },
  unavailable: { ...type.body, color: colors.muted, textAlign: 'center', paddingVertical: 12 },

  scrollWrap: { flex: 1 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 },
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
  legal: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: 8 },
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

  creatorChip: {
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: -4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: pastel.butter,
  },
  creatorChipText: { ...font.body[800], fontSize: 14, color: colors.ink, textAlign: 'center' },
  legalCode: { ...font.body[800], color: colors.primary },
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
  welcomeSub: { flex: 0, textAlign: 'center', marginTop: 6 },
});

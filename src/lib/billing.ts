import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Billing, Catalog } from './billing-shared';

// ---------------------------------------------------------------------------
// Billing on the web. There is no store here: in development a mock stands in
// so the paywall can be walked end to end in a browser; in production nothing
// is for sale, and premium comes only from the server (a subscription bought
// on a phone, via the RevenueCat webhook — see premium.tsx).
// ---------------------------------------------------------------------------

const MOCK = __DEV__;
const KEY = 'che.mock-premium';

const MOCK_CATALOG: Catalog = {
  main: {
    hardPaywall: false,
    plans: [
      { id: '$rc_annual', period: 'year', price: 59.99, priceString: '$59.99', perMonthString: '$4.99', trialDays: 7, introPrice: null, currency: 'USD' },
      { id: '$rc_monthly', period: 'month', price: 12.99, priceString: '$12.99', perMonthString: '$12.99', trialDays: null, introPrice: null, currency: 'USD' },
    ],
  },
  winback: {
    hardPaywall: false,
    plans: [
      { id: '$rc_annual', period: 'year', price: 59.99, priceString: '$59.99', perMonthString: '$4.99', trialDays: null, introPrice: { price: 35.99, priceString: '$35.99' }, currency: 'USD' },
    ],
  },
};

const listeners = new Set<(premium: boolean) => void>();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const billing: Billing = {
  available: MOCK,
  async identify() {},
  async forget() {
    if (MOCK) await AsyncStorage.removeItem(KEY);
  },
  async catalog() {
    return MOCK ? MOCK_CATALOG : { main: null, winback: null };
  },
  async purchase() {
    if (!MOCK) return { error: 'Subscriptions are sold in the Posta app for iPhone and Android.' };
    await wait(900);
    await AsyncStorage.setItem(KEY, '1');
    for (const l of listeners) l(true);
    return 'purchased';
  },
  async restore() {
    return MOCK && (await AsyncStorage.getItem(KEY)) === '1';
  },
  async isPremium() {
    return MOCK && (await AsyncStorage.getItem(KEY)) === '1';
  },
  onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Billing, type Catalog, normalizeCode, PRODUCTS } from './billing-shared';

// ---------------------------------------------------------------------------
// Billing on the web. There is no store here: in development a mock stands in
// so the paywall can be walked end to end in a browser; in production nothing
// is for sale, and premium comes only from the server (a subscription bought
// on a phone, checked with its store by verify-purchase — see premium.tsx).
// ---------------------------------------------------------------------------

const MOCK = __DEV__;
const KEY = 'che.mock-premium';

const MOCK_CATALOG: Catalog = {
  main: {
    plans: [
      { id: PRODUCTS.annual, period: 'year', price: 99, priceString: '$99.00', perMonthString: '$8.25', trialDays: 7, introPrice: null, currency: 'USD' },
      { id: PRODUCTS.monthly, period: 'month', price: 14.99, priceString: '$14.99', perMonthString: '$14.99', trialDays: null, introPrice: null, currency: 'USD' },
    ],
  },
  winback: {
    plans: [
      { id: PRODUCTS.winback, period: 'year', price: 99, priceString: '$99.00', perMonthString: '$8.25', trialDays: null, introPrice: { price: 59, priceString: '$59.00' }, currency: 'USD' },
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
  async redeem(code) {
    if (!MOCK) return { error: 'Codes are redeemed in the Posta app for iPhone and Android.' };
    await wait(700);
    if (normalizeCode(code ?? '') !== 'POSTA50') return { error: 'That code isn’t valid.' };
    await AsyncStorage.setItem(KEY, '1');
    for (const l of listeners) l(true);
    return 'purchased';
  },
  async restore() {
    return MOCK && (await AsyncStorage.getItem(KEY)) === '1';
  },
  async sync() {
    return MOCK && (await AsyncStorage.getItem(KEY)) === '1';
  },
  async adopt() {
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

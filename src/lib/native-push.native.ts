// Native push, iOS and Android: an Expo push token on `push_subscriptions`
// instead of a Web Push subscription. `send-reminder` sends to whichever
// channel a row carries.
//
// Metro picks this file on native and native-push.ts on web, so
// expo-notifications is never bundled for the browser.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ExpoCrypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { deviceTimezone, REMINDER_TIME, type PushStatus } from './push';

// A reminder arriving while the app is open still shows as a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const nativePushAvailable = () => Device.isDevice;

async function token(): Promise<string> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) throw new Error('extra.eas.projectId is missing from app.json');
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

/** This install's own secret, sent with every claim of its push token: the
 *  server moves the token's row to another account only with it, so knowing
 *  a token alone doesn't take a phone's reminders over (claim_push_device). */
const SECRET_KEY = 'posta.push-device-secret';

async function deviceSecret(): Promise<string> {
  const kept = await AsyncStorage.getItem(SECRET_KEY).catch(() => null);
  if (kept) return kept;
  const made = Array.from(ExpoCrypto.getRandomBytes(32), (b) => b.toString(16).padStart(2, '0')).join('');
  await AsyncStorage.setItem(SECRET_KEY, made);
  return made;
}

export async function getNativePushStatus(): Promise<PushStatus> {
  if (!Device.isDevice) return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'denied') return 'denied';
  if (status !== 'granted') return 'off';
  // Permission alone is not a subscription: the token has to be on the server.
  try {
    const t = await token();
    const { data } = await supabase
      .from('push_subscriptions')
      .select('notifications_enabled')
      .eq('expo_push_token', t)
      .maybeSingle();
    if (data?.notifications_enabled) return 'enabled';
    // No row of hers for this phone, though the phone already said yes: the
    // row is still on the account signed in here before (a guest, a second
    // account), and nothing else would ever move it. Take it over now.
    await claim(t);
    return 'enabled';
  } catch {
    return 'off';
  }
}

async function claim(t: string) {
  // The token may still be on an account that was signed in on this phone
  // before; the server moves it to this one when this install's secret
  // matches (claim_push_device).
  const { error } = await supabase.rpc('claim_push_device', {
    p_token: t,
    p_platform: Platform.OS === 'ios' ? 'ios' : 'android',
    p_timezone: deviceTimezone(),
    p_reminder_time: REMINDER_TIME,
    p_device_secret: await deviceSecret(),
  });
  if (error) throw error;
}

export async function enableNativePush(userId: string): Promise<PushStatus> {
  if (!Device.isDevice) return 'unsupported';
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'denied') return 'denied';
  if (status !== 'granted') return 'off';
  await claim(await token());
  return 'enabled';
}

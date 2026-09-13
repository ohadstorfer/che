// Native push, iOS and Android: an Expo push token on `push_subscriptions`
// instead of a Web Push subscription. `send-reminder` sends to whichever
// channel a row carries.
//
// Metro picks this file on native and native-push.ts on web, so
// expo-notifications is never bundled for the browser.

import Constants from 'expo-constants';
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
  if (!projectId) throw new Error('Falta extra.eas.projectId en app.json');
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
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
    return data?.notifications_enabled ? 'enabled' : 'off';
  } catch {
    return 'off';
  }
}

export async function enableNativePush(userId: string): Promise<PushStatus> {
  if (!Device.isDevice) return 'unsupported';
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'denied') return 'denied';
  if (status !== 'granted') return 'off';
  const t = await token();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      expo_push_token: t,
      reminder_time: REMINDER_TIME,
      timezone: deviceTimezone(),
      notifications_enabled: true,
    },
    { onConflict: 'expo_push_token' },
  );
  if (error) throw error;
  return 'enabled';
}

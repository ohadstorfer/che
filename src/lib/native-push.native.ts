// Native push, iOS and Android: an Expo push token instead of a Web Push
// subscription. The edge function tells the two apart by `kind`.
//
// Metro picks this file on native and native-push.ts on web, so
// expo-notifications is never bundled for the browser.

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import type { PushStatus } from './push';

// A notification arriving while the app is open still shows as a banner —
// "Mora completó su sesión" is worth seeing even mid-lesson.
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
      .select('id')
      .eq('endpoint', t)
      .maybeSingle();
    return data ? 'enabled' : 'off';
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
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, endpoint: t, kind: 'expo' }, { onConflict: 'endpoint' });
  if (error) throw error;
  return 'enabled';
}

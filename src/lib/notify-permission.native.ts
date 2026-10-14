// Onboarding's reminder screen asks the phone for permission before there is
// an account to subscribe. The subscription itself (push_subscriptions) is
// made once she is signed in: see enablePush, called from the ready screen.
//
// Metro picks this file on native and notify-permission.ts on web.

import * as Notifications from 'expo-notifications';

export async function askNotifyPermission(): Promise<boolean> {
  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    return status === 'granted';
  } catch {
    return false;
  }
}

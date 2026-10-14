// Web: the browser asks only from a tap, which Continue is. A browser without
// notifications says no, and onboarding goes on.

export async function askNotifyPermission(): Promise<boolean> {
  try {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

// Web build of native-push: the browser has Web Push (push.ts) and nothing
// here applies. See native-push.native.ts.

import type { PushStatus } from './push';

export const nativePushAvailable = () => false;
export const getNativePushStatus = async (): Promise<PushStatus> => 'unsupported';
export const enableNativePush = async (_userId: string): Promise<PushStatus> => 'unsupported';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// The day-30 win-back offer: 40% off the first year, for a week after the last
// win-back mail (functions/_shared/winback.ts). The server decides who may have
// it — winback_offer(): that mail went to her in the last 7 days and she hasn't
// bought — so a forwarded mail or a typed posta://offer opens nothing for
// anyone else. The mail's button only opens the app; so does opening it on her
// own, which shows her the offer once.
// ---------------------------------------------------------------------------

/** Until when she may have the 40%, or null: not hers, or the server couldn't say. */
export async function winbackOfferUntil(): Promise<Date | null> {
  const { data, error } = await supabase.rpc('winback_offer');
  const answer = data as { eligible?: boolean; until?: string | null } | null;
  if (error || !answer?.eligible || !answer.until) return null;
  return new Date(answer.until);
}

const shownKey = (userId: string) => `che.winback-offer-shown:${userId}`;

/** True the first time it is asked for her on this phone: the offer opens by itself once. */
export async function firstAutoShow(userId: string): Promise<boolean> {
  try {
    if (await AsyncStorage.getItem(shownKey(userId))) return false;
    await AsyncStorage.setItem(shownKey(userId), '1');
    return true;
  } catch {
    return false;
  }
}

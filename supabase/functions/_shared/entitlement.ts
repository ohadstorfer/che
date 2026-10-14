// Premium, written from what the stores say. verify-purchase (the app, right
// after buying or restoring) and the two notification functions (Apple and
// Google, whenever a subscription changes) all end here, so there is one
// place that decides whose `entitlements` row a purchase belongs to.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A purchase as its store describes it at one moment. */
export interface StoreState {
  store: "APP_STORE" | "PLAY_STORE";
  /** What the store calls this purchase for as long as it lives: Apple's
   *  originalTransactionId, Google's purchase token. */
  ref: string;
  /** Google only: the token this purchase replaced (a plan change, a
   *  resubscription), so the row that held the old one follows along. */
  linkedRef: string | null;
  productId: string;
  active: boolean;
  /** null: never (a lifetime purchase). */
  expiresAt: string | null;
  periodType: "TRIAL" | "INTRO" | "NORMAL";
  /** When the store said so. An older word never overwrites a newer one. */
  signedAt: string;
  /** The Posta user id the app attached to the purchase, when it did. */
  accountId: string | null;
}

export interface EntitlementRow {
  user_id: string;
  active: boolean;
  store: string | null;
  store_ref: string | null;
  expires_at: string | null;
  store_signed_at: string | null;
}

export type Decision =
  | { write: false; reason: "no user" | "stale" | "inactive"; premium: boolean }
  /** `release`: the account that held this purchase and now gives it up. */
  | { write: true; userId: string; release: string | null };

const live = (row: EntitlementRow | null, now: number) =>
  !!row && row.active && (!row.expires_at || new Date(row.expires_at).getTime() > now);

/**
 * Who the purchase belongs to: the account asking (the app, signed in), else
 * whoever already holds it, else the account the app attached when it was
 * bought. A notification about a purchase nobody here ever claimed has none.
 */
export function ownerOf(state: StoreState, holder: EntitlementRow | null, claimant: string | null): string | null {
  if (claimant) return claimant;
  if (holder) return holder.user_id;
  return state.accountId && UUID.test(state.accountId) ? state.accountId : null;
}

/**
 * What to do with a store's word. `holder` is the row that has this purchase
 * now, `own` the row of the account it would go to.
 *
 *  · Older than what we already wrote for this purchase: ignored. This is
 *    what stops a transaction signed before a refund from undoing the refund.
 *  · Not active: recorded only on the row that holds this purchase. An old
 *    subscription restored from the store must not switch off a newer one.
 *  · Active, and held by another account: it moves. One store purchase opens
 *    one Posta account at a time (restoring it on a second account).
 */
export function decide(
  state: StoreState,
  holder: EntitlementRow | null,
  own: EntitlementRow | null,
  userId: string | null,
  now = Date.now(),
): Decision {
  if (!userId) return { write: false, reason: "no user", premium: false };
  const mine = holder?.user_id === userId;
  if (holder?.store_signed_at && new Date(holder.store_signed_at).getTime() > new Date(state.signedAt).getTime()) {
    return { write: false, reason: "stale", premium: mine ? live(holder, now) : live(own, now) };
  }
  if (!state.active) {
    if (mine) return { write: true, userId, release: null };
    return { write: false, reason: "inactive", premium: live(own, now) };
  }
  return { write: true, userId, release: holder && !mine ? holder.user_id : null };
}

export interface Applied {
  userId: string | null;
  premium: boolean;
  ignored?: string;
}

/**
 * Writes a store's word into `entitlements`. Throws when the database
 * refuses, so a notification answers non-2xx and the store sends it again.
 */
export async function applyState(db: SupabaseClient, state: StoreState, event: string, claimant: string | null = null): Promise<Applied> {
  const refs = state.linkedRef ? [state.ref, state.linkedRef] : [state.ref];
  const { data: held, error: heldError } = await db
    .from("entitlements")
    .select("user_id, active, store, store_ref, expires_at, store_signed_at")
    .eq("store", state.store)
    .in("store_ref", refs);
  if (heldError) throw new Error(heldError.message);
  const holders = (held ?? []) as EntitlementRow[];
  const holder = holders.find((r) => r.store_ref === state.ref) ?? holders[0] ?? null;

  const userId = ownerOf(state, holder, claimant);
  let own: EntitlementRow | null = holder?.user_id === userId ? holder : null;
  if (userId && !own) {
    const { data, error } = await db
      .from("entitlements")
      .select("user_id, active, store, store_ref, expires_at, store_signed_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    own = data as EntitlementRow | null;
  }

  const decision = decide(state, holder, own, userId);
  if (!decision.write) return { userId, premium: decision.premium, ignored: decision.reason };

  const now = new Date().toISOString();
  if (decision.release) {
    const { error } = await db
      .from("entitlements")
      .update({ active: false, store_ref: null, last_event: "TRANSFER", updated_at: now })
      .eq("user_id", decision.release);
    if (error) throw new Error(error.message);
  }
  const { error } = await db.from("entitlements").upsert({
    user_id: decision.userId,
    active: state.active,
    product_id: state.productId,
    store: state.store,
    store_ref: state.ref,
    period_type: state.periodType,
    expires_at: state.expiresAt,
    store_signed_at: state.signedAt,
    last_event: event,
    updated_at: now,
  });
  // The account was deleted and its subscription is still running in the
  // store: nothing to write to, and sending it again would not help.
  if (error?.code === "23503") return { userId: null, premium: false, ignored: "no user" };
  if (error) throw new Error(error.message);
  return { userId: decision.userId, premium: state.active };
}

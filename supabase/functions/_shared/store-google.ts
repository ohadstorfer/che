// Google Play, read without a middleman. A purchase token proves nothing on
// its own; the Play Developer API says what it is worth, asked as a service
// account (GOOGLE_PLAY_SERVICE_ACCOUNT, the JSON key of an account invited in
// Play Console → Users and permissions with "View financial data" and
// "Manage orders and subscriptions").

import type { StoreState } from "./entitlement.ts";

const API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";
const SCOPE = "https://www.googleapis.com/auth/androidpublisher";

export interface ServiceAccount {
  client_email: string;
  private_key: string;
}

/** purchases.subscriptionsv2, the parts read here. */
export interface PlaySubscription {
  subscriptionState?: string;
  linkedPurchaseToken?: string;
  acknowledgementState?: string;
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  lineItems?: {
    productId: string;
    expiryTime?: string;
    offerPhase?: { freeTrial?: unknown; introductoryPrice?: unknown };
  }[];
}

// States in which she has access. A cancelled subscription runs to the end of
// what she paid for; on hold and paused do not.
const OPEN = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_CANCELED", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);

const base64Url = (bytes: Uint8Array) => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const text = (s: string) => new TextEncoder().encode(s);

let cached: { token: string; until: number; email: string } | null = null;

/** An OAuth token for the Play Developer API, kept until shortly before it lapses. */
export async function playAccessToken(account: ServiceAccount): Promise<string> {
  if (cached && cached.email === account.client_email && cached.until > Date.now()) return cached.token;
  const pem = account.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const iat = Math.floor(Date.now() / 1000);
  const unsigned =
    base64Url(text(JSON.stringify({ alg: "RS256", typ: "JWT" }))) +
    "." +
    base64Url(text(JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat, exp: iat + 3600 })));
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, text(unsigned)));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64Url(signature)}` }),
  });
  if (!res.ok) throw new Error(`Google sign-in failed (${res.status})`);
  const { access_token, expires_in } = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: access_token, until: Date.now() + (expires_in - 60) * 1000, email: account.client_email };
  return access_token;
}

/** The subscription behind a purchase token; null when Play doesn't know it. */
export async function playSubscription(account: ServiceAccount, packageName: string, purchaseToken: string): Promise<PlaySubscription | null> {
  const res = await fetch(`${API}/${packageName}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`, {
    headers: { Authorization: `Bearer ${await playAccessToken(account)}` },
  });
  if (res.status === 400 || res.status === 404 || res.status === 410) return null;
  if (!res.ok) throw new Error(`Play answered ${res.status}`);
  return (await res.json()) as PlaySubscription;
}

/**
 * Play refunds a purchase nobody acknowledges within three days. The app does
 * it when it finishes the transaction; this is for when the app never got
 * that far.
 */
export async function playAcknowledge(account: ServiceAccount, packageName: string, productId: string, purchaseToken: string): Promise<void> {
  await fetch(`${API}/${packageName}/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await playAccessToken(account)}`, "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => {});
}

/** What Play's answer means for her access right now; null when it has no product. */
export function playState(sub: PlaySubscription, purchaseToken: string, now = Date.now()): StoreState | null {
  const items = [...(sub.lineItems ?? [])].sort((a, b) => Date.parse(b.expiryTime ?? "") - Date.parse(a.expiryTime ?? ""));
  const item = items[0];
  if (!item) return null;
  const until = item.expiryTime ? Date.parse(item.expiryTime) : NaN;
  return {
    store: "PLAY_STORE",
    ref: purchaseToken,
    linkedRef: sub.linkedPurchaseToken ?? null,
    productId: item.productId,
    active: OPEN.has(sub.subscriptionState ?? "") && until > now,
    expiresAt: Number.isNaN(until) ? null : new Date(until).toISOString(),
    periodType: item.offerPhase?.freeTrial ? "TRIAL" : item.offerPhase?.introductoryPrice ? "INTRO" : "NORMAL",
    // Asked just now, so it is the newest word there is.
    signedAt: new Date(now).toISOString(),
    accountId: sub.externalAccountIdentifiers?.obfuscatedExternalAccountId?.toLowerCase() ?? null,
  };
}

/** The service account from its secret; null when billing on Android isn't set up. */
export function serviceAccount(json: string | undefined): ServiceAccount | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Partial<ServiceAccount>;
    return parsed.client_email && parsed.private_key ? { client_email: parsed.client_email, private_key: parsed.private_key } : null;
  } catch {
    return null;
  }
}

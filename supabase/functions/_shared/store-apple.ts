// The App Store, read without a middleman. Everything Apple tells us about a
// purchase arrives as a JWS: the transaction StoreKit hands the app, and the
// notifications Apple posts to apple-notifications. Each carries its own
// certificate chain (x5c), which has to end in Apple's root — that, and
// nothing else, is what makes a transaction real.

// The certificate library asks for this polyfill before it loads.
import "npm:reflect-metadata@0.2.2";
import * as x509 from "npm:@peculiar/x509@2.1.0";

import type { StoreState } from "./entitlement.ts";

/** SHA-256 of "Apple Root CA - G3" (apple.com/certificateauthority), the root
 *  of every App Store signature. Valid until 2039. */
export const APPLE_ROOT_G3 = "63343abfb89a6a03ebb57e9b3f5fa7be7c4f5c756f3017b3a8c488c3653e9179";

// Apple marks the certificates allowed to sign for the App Store: the leaf
// carries the first, the intermediate (WWDR) the second.
const LEAF_OID = "1.2.840.113635.100.6.11.1";
const INTERMEDIATE_OID = "1.2.840.113635.100.6.2.1";

export interface AppleTransaction {
  bundleId: string;
  productId: string;
  /** "Auto-Renewable Subscription" | "Non-Consumable" | … */
  type: string;
  transactionId: string;
  originalTransactionId: string;
  /** The Posta user id the app passed at purchase; absent for a purchase
   *  made outside the app (an offer code redeemed in the App Store). */
  appAccountToken?: string;
  expiresDate?: number;
  revocationDate?: number;
  /** 1 introductory · 2 promotional · 3 offer code · 4 win-back */
  offerType?: number;
  offerDiscountType?: "FREE_TRIAL" | "PAY_AS_YOU_GO" | "PAY_UP_FRONT";
  environment: string;
  signedDate: number;
}

export interface AppleRenewal {
  originalTransactionId: string;
  /** Billing failed but Apple is still trying, and she keeps access till then. */
  gracePeriodExpiresDate?: number;
  signedDate: number;
}

export interface AppleNotification {
  notificationType: string;
  subtype?: string;
  data?: {
    bundleId?: string;
    environment?: string;
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
  signedDate: number;
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

/**
 * The payload of a JWS Apple signed, or a throw. `root` is the SHA-256 of the
 * root the chain must end in — Apple's, except in tests.
 */
export async function verifyAppleJws<T extends { signedDate?: number }>(jws: string, root = APPLE_ROOT_G3): Promise<T> {
  const parts = jws.split(".");
  if (parts.length !== 3) throw new Error("not a JWS");
  const [head, body, sig] = parts;
  const header = JSON.parse(decoder.decode(fromBase64Url(head))) as { alg?: string; x5c?: string[] };
  if (header.alg !== "ES256") throw new Error("unexpected algorithm");
  if (!Array.isArray(header.x5c) || header.x5c.length !== 3) throw new Error("unexpected certificate chain");
  const payload = JSON.parse(decoder.decode(fromBase64Url(body))) as T;

  const [leaf, intermediate, rootCert] = header.x5c.map((c) => new x509.X509Certificate(c));
  if (hex(await crypto.subtle.digest("SHA-256", rootCert.rawData)) !== root) throw new Error("chain does not end in Apple's root");
  if (!leaf.getExtension(LEAF_OID) || !intermediate.getExtension(INTERMEDIATE_OID)) {
    throw new Error("certificates are not App Store signing certificates");
  }
  // Checked as of the day it was signed, as Apple's own library does: a
  // transaction stays true after the certificate that signed it lapses.
  const date = new Date(payload.signedDate ?? Date.now());
  const chained =
    (await leaf.verify({ publicKey: intermediate, date })) &&
    (await intermediate.verify({ publicKey: rootCert, date })) &&
    (await rootCert.verify({ date }));
  if (!chained) throw new Error("certificate chain does not verify");

  const key = await leaf.publicKey.export({ name: "ECDSA", namedCurve: "P-256" }, ["verify"]);
  const signed = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, fromBase64Url(sig), encoder.encode(`${head}.${body}`));
  if (!signed) throw new Error("signature does not verify");
  return payload;
}

/** What a transaction (and, from a notification, its renewal info) means for
 *  her access right now. */
export function appleState(tx: AppleTransaction, renewal: AppleRenewal | null, now = Date.now()): StoreState {
  const until = Math.max(tx.expiresDate ?? 0, renewal?.gracePeriodExpiresDate ?? 0) || null;
  const subscription = tx.type === "Auto-Renewable Subscription";
  const live = subscription ? !!until && until > now : tx.type === "Non-Consumable";
  return {
    store: "APP_STORE",
    ref: tx.originalTransactionId,
    linkedRef: null,
    productId: tx.productId,
    active: live && !tx.revocationDate,
    expiresAt: until ? new Date(until).toISOString() : null,
    periodType: tx.offerType === 1 ? (tx.offerDiscountType === "FREE_TRIAL" ? "TRIAL" : "INTRO") : "NORMAL",
    signedAt: new Date(Math.max(tx.signedDate, renewal?.signedDate ?? 0)).toISOString(),
    accountId: tx.appAccountToken?.toLowerCase() ?? null,
  };
}

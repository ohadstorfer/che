// The store code the edge functions share, run under node: Apple's signature
// check against a certificate chain made here (so every way it can be wrong
// is tried), what a transaction or a Play answer means for access, and whose
// row a purchase goes to.
//
//   npm run store:test
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

// The functions are written for Deno, which asks for packages as npm:name@version.
registerHooks({
  resolve(specifier, context, next) {
    const npm = /^npm:(@?[^@]+)@/.exec(specifier);
    return next(npm ? npm[1] : specifier, context);
  },
});

await import('reflect-metadata');
const x509 = await import('@peculiar/x509');
const { appleState, verifyAppleJws } = await import('../functions/_shared/store-apple.ts');
const { playState } = await import('../functions/_shared/store-google.ts');
const { decide, ownerOf } = await import('../functions/_shared/entitlement.ts');

const b64url = (bytes) => Buffer.from(bytes).toString('base64url');
const sha256 = async (buf) => Buffer.from(await crypto.subtle.digest('SHA-256', buf)).toString('hex');
const mark = (oid) => new x509.Extension(oid, false, new Uint8Array([5, 0]));
const LEAF = '1.2.840.113635.100.6.11.1';
const WWDR = '1.2.840.113635.100.6.2.1';

const NOW = Date.UTC(2026, 9, 13);
const DAY = 86_400_000;

/** A chain shaped like Apple's: P-384 root and intermediate, P-256 leaf. */
async function chain({ leafMark = true, notAfter = new Date(NOW + 365 * DAY) } = {}) {
  const p384 = { name: 'ECDSA', namedCurve: 'P-384', hash: 'SHA-384' };
  const p256 = { name: 'ECDSA', namedCurve: 'P-256', hash: 'SHA-256' };
  const notBefore = new Date(NOW - 365 * DAY);
  const rootKeys = await crypto.subtle.generateKey(p384, true, ['sign', 'verify']);
  const midKeys = await crypto.subtle.generateKey(p384, true, ['sign', 'verify']);
  const leafKeys = await crypto.subtle.generateKey(p256, true, ['sign', 'verify']);
  const root = await x509.X509CertificateGenerator.createSelfSigned({
    serialNumber: '01', name: 'CN=Test Root', notBefore, notAfter: new Date(NOW + 3650 * DAY), keys: rootKeys, signingAlgorithm: p384,
  });
  const mid = await x509.X509CertificateGenerator.create({
    serialNumber: '02', subject: 'CN=Test WWDR', issuer: root.subject, notBefore, notAfter: new Date(NOW + 3650 * DAY),
    publicKey: midKeys.publicKey, signingKey: rootKeys.privateKey, signingAlgorithm: p384, extensions: [mark(WWDR)],
  });
  const leaf = await x509.X509CertificateGenerator.create({
    serialNumber: '03', subject: 'CN=Test Leaf', issuer: mid.subject, notBefore, notAfter,
    publicKey: leafKeys.publicKey, signingKey: midKeys.privateKey, signingAlgorithm: p384, extensions: leafMark ? [mark(LEAF)] : [],
  });
  return { root, mid, leaf, leafKeys, rootHash: await sha256(root.rawData) };
}

async function sign(c, payload, { x5c = [c.leaf, c.mid, c.root], alg = 'ES256' } = {}) {
  const head = b64url(JSON.stringify({ alg, x5c: x5c.map((cert) => cert.toString('base64')) }));
  const body = b64url(JSON.stringify(payload));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, c.leafKeys.privateKey, Buffer.from(`${head}.${body}`));
  return `${head}.${body}.${b64url(new Uint8Array(sig))}`;
}

const TX = {
  bundleId: 'app.posta.ios',
  productId: 'posta_premium_annual',
  type: 'Auto-Renewable Subscription',
  transactionId: '2000000000000002',
  originalTransactionId: '2000000000000001',
  appAccountToken: '0B5E7C2A-9D1F-4E3B-8A6C-1F2E3D4C5B6A',
  expiresDate: NOW + 7 * DAY,
  environment: 'Sandbox',
  signedDate: NOW,
};

test('a transaction signed down to the pinned root is read', async () => {
  const c = await chain();
  assert.deepEqual(await verifyAppleJws(await sign(c, TX), c.rootHash), TX);
});

test('the same transaction is refused against Apple\'s real root', async () => {
  const c = await chain();
  await assert.rejects(verifyAppleJws(await sign(c, TX)), /Apple's root/);
});

test('a changed payload is refused', async () => {
  const c = await chain();
  const [head, , sig] = (await sign(c, TX)).split('.');
  const forged = b64url(JSON.stringify({ ...TX, expiresDate: NOW + 3650 * DAY }));
  await assert.rejects(verifyAppleJws(`${head}.${forged}.${sig}`, c.rootHash), /signature/);
});

test('a leaf signed by someone else\'s intermediate is refused', async () => {
  const c = await chain();
  const other = await chain();
  // Her own leaf and key, under a chain that ends in the pinned root.
  const jws = await sign(other, TX, { x5c: [other.leaf, c.mid, c.root] });
  await assert.rejects(verifyAppleJws(jws, c.rootHash), /chain does not verify/);
});

test('a leaf without the App Store marker is refused', async () => {
  const c = await chain({ leafMark: false });
  await assert.rejects(verifyAppleJws(await sign(c, TX), c.rootHash), /signing certificates/);
});

test('a certificate that had lapsed when it signed is refused', async () => {
  const c = await chain({ notAfter: new Date(NOW - DAY) });
  await assert.rejects(verifyAppleJws(await sign(c, TX), c.rootHash), /chain does not verify/);
});

test('an unsigned token and a short chain are refused', async () => {
  const c = await chain();
  await assert.rejects(verifyAppleJws(await sign(c, TX, { alg: 'none' }), c.rootHash), /algorithm/);
  await assert.rejects(verifyAppleJws(await sign(c, TX, { x5c: [c.leaf, c.root] }), c.rootHash), /certificate chain/);
  await assert.rejects(verifyAppleJws('nope', c.rootHash), /not a JWS/);
});

test('a running subscription is active until it expires', () => {
  const s = appleState(TX, null, NOW);
  assert.equal(s.active, true);
  assert.equal(s.store, 'APP_STORE');
  assert.equal(s.ref, TX.originalTransactionId);
  assert.equal(s.expiresAt, new Date(TX.expiresDate).toISOString());
  assert.equal(s.accountId, TX.appAccountToken.toLowerCase());
  assert.equal(appleState(TX, null, TX.expiresDate + 1).active, false);
});

test('a free trial, an intro price and a regular period are told apart', () => {
  assert.equal(appleState({ ...TX, offerType: 1, offerDiscountType: 'FREE_TRIAL' }, null, NOW).periodType, 'TRIAL');
  assert.equal(appleState({ ...TX, offerType: 1, offerDiscountType: 'PAY_UP_FRONT' }, null, NOW).periodType, 'INTRO');
  assert.equal(appleState(TX, null, NOW).periodType, 'NORMAL');
});

test('a refund ends access at once', () => {
  assert.equal(appleState({ ...TX, revocationDate: NOW - 1000 }, null, NOW).active, false);
});

test('the grace period keeps her in after the paid period ends', () => {
  const lapsed = { ...TX, expiresDate: NOW - DAY };
  assert.equal(appleState(lapsed, null, NOW).active, false);
  const grace = { originalTransactionId: TX.originalTransactionId, gracePeriodExpiresDate: NOW + 5 * DAY, signedDate: NOW + 1 };
  const s = appleState(lapsed, grace, NOW);
  assert.equal(s.active, true);
  assert.equal(s.expiresAt, new Date(NOW + 5 * DAY).toISOString());
  assert.equal(s.signedAt, new Date(NOW + 1).toISOString());
});

test('a subscription with no end date opens nothing; a lifetime purchase does', () => {
  assert.equal(appleState({ ...TX, expiresDate: undefined }, null, NOW).active, false);
  const forever = appleState({ ...TX, type: 'Non-Consumable', expiresDate: undefined }, null, NOW);
  assert.equal(forever.active, true);
  assert.equal(forever.expiresAt, null);
});

const play = (over = {}) => ({
  subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
  externalAccountIdentifiers: { obfuscatedExternalAccountId: 'a1b2c3d4-0000-4000-8000-000000000001' },
  lineItems: [{ productId: 'posta_premium_annual', expiryTime: new Date(NOW + 30 * DAY).toISOString() }],
  ...over,
});

test('Play: active, cancelled-but-paid and grace are open; hold, paused and expired are not', () => {
  for (const s of ['ACTIVE', 'CANCELED', 'IN_GRACE_PERIOD']) {
    assert.equal(playState(play({ subscriptionState: `SUBSCRIPTION_STATE_${s}` }), 'tok', NOW).active, true, s);
  }
  for (const s of ['ON_HOLD', 'PAUSED', 'EXPIRED', 'PENDING']) {
    assert.equal(playState(play({ subscriptionState: `SUBSCRIPTION_STATE_${s}` }), 'tok', NOW).active, false, s);
  }
});

test('Play: an end date in the past closes it whatever the state says', () => {
  const past = play({ lineItems: [{ productId: 'p', expiryTime: new Date(NOW - DAY).toISOString() }] });
  assert.equal(playState(past, 'tok', NOW).active, false);
});

test('Play: the token is the reference, the replaced token is carried, the trial is seen', () => {
  const s = playState(play({ linkedPurchaseToken: 'old', lineItems: [{ productId: 'p', expiryTime: new Date(NOW + DAY).toISOString(), offerPhase: { freeTrial: {} } }] }), 'tok', NOW);
  assert.equal(s.ref, 'tok');
  assert.equal(s.linkedRef, 'old');
  assert.equal(s.periodType, 'TRIAL');
  assert.equal(s.accountId, 'a1b2c3d4-0000-4000-8000-000000000001');
  assert.equal(playState({ subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE' }, 'tok', NOW), null);
});

const A = 'aaaaaaaa-0000-4000-8000-000000000001';
const B = 'bbbbbbbb-0000-4000-8000-000000000002';
const state = (over = {}) => ({ ...appleState(TX, null, NOW), accountId: A, ...over });
const row = (userId, over = {}) => ({
  user_id: userId, active: true, store: 'APP_STORE', store_ref: TX.originalTransactionId,
  expires_at: new Date(NOW + 7 * DAY).toISOString(), store_signed_at: new Date(NOW - DAY).toISOString(), ...over,
});

test('the purchase goes to who asks, else who holds it, else who it was bought for', () => {
  assert.equal(ownerOf(state(), row(B), A), A);
  assert.equal(ownerOf(state(), row(B), null), B);
  assert.equal(ownerOf(state(), null, null), A);
  assert.equal(ownerOf(state({ accountId: null }), null, null), null);
  assert.equal(ownerOf(state({ accountId: 'not-a-user' }), null, null), null);
});

test('a first purchase is written; a notification nobody can be found for is not', () => {
  assert.deepEqual(decide(state(), null, null, A, NOW), { write: true, userId: A, release: null });
  assert.deepEqual(decide(state(), null, null, null, NOW), { write: false, reason: 'no user', premium: false });
});

test('restoring on a second account moves the purchase', () => {
  assert.deepEqual(decide(state(), row(A), null, B, NOW), { write: true, userId: B, release: A });
});

test('a guest who signs in to her older account takes what she bought as the guest', () => {
  // Bought as guest A (the store carries A), claimed by her account B, which
  // has a lapsed subscription of its own: B gets it, A lets it go.
  const lapsed = row(B, { active: false, store_ref: 'older', expires_at: new Date(NOW - DAY).toISOString() });
  assert.deepEqual(decide(state(), row(A), lapsed, B, NOW), { write: true, userId: B, release: A });
  // The same transaction, read again on the phone, is not "older" than the row.
  const sameMoment = row(A, { store_signed_at: state().signedAt });
  assert.deepEqual(decide(state(), sameMoment, null, B, NOW), { write: true, userId: B, release: A });
  // Its renewals still say A; the row that holds it now says B.
  assert.equal(ownerOf(state({ accountId: A }), row(B), null), B);
});

test('a transaction signed before the refund cannot undo the refund', () => {
  const refunded = row(A, { active: false, store_signed_at: new Date(NOW + DAY).toISOString() });
  assert.deepEqual(decide(state(), refunded, refunded, A, NOW), { write: false, reason: 'stale', premium: false });
  // Nor hand it to someone else.
  assert.deepEqual(decide(state(), refunded, null, B, NOW), { write: false, reason: 'stale', premium: false });
});

test('an expiry is recorded on the row that holds the purchase, and nowhere else', () => {
  const expired = state({ active: false });
  assert.deepEqual(decide(expired, row(A), row(A), A, NOW), { write: true, userId: A, release: null });
  // An old, dead subscription restored next to a live one from the other store.
  const other = row(A, { store: 'PLAY_STORE', store_ref: 'tok' });
  assert.deepEqual(decide(expired, null, other, A, NOW), { write: false, reason: 'inactive', premium: true });
  assert.deepEqual(decide(expired, row(A), null, B, NOW), { write: false, reason: 'inactive', premium: false });
});

# Email on Amazon SES (next to Resend)

Status 2026-11-15: SES is set up and tested, **Resend still sends everything**.
Waiting on AWS to approve production access (asked 2026-11-15, status PENDING).

## What exists

| Piece | Where / what |
|---|---|
| SES identity | `postaspanish.com`, us-east-1, Easy DKIM (RSA 2048), verified |
| DNS (Namecheap) | 3 CNAMEs `<token>._domainkey` → `<token>.dkim.amazonses.com`, TXT `_dmarc` = `v=DMARC1; p=none;` |
| Untouched DNS | Resend records (`resend._domainkey`, `send`, `rsend`), root SPF, email-forwarding MX for `hola@` |
| No custom MAIL FROM | Namecheap only allows MX records on "Custom MX", which would end the `hola@` forwarding. DMARC passes through DKIM, so it isn't needed. |
| IAM user | `posta-ses-sender`, inline policy `send-from-postaspanish`: `ses:SendEmail`/`SendRawEmail` only when From is `*@postaspanish.com` (tested: other From → 403) |
| Supabase secrets | `SES_AWS_ACCESS_KEY_ID`, `SES_AWS_SECRET_ACCESS_KEY`, `SES_REGION=us-east-1` (set). `EMAIL_PROVIDER` **not set** → Resend. |
| Code | `supabase/functions/_shared/email-ses.ts` (SESv2 SendEmail via aws4fetch). `_shared/email.ts` `sendEmail()` picks `EMAIL_PROVIDER` (`ses` or default `resend`); a call can override with `provider: "ses"`. |
| Test script | `scripts/email/ses-test.ts` — sends to `success@simulator.amazonses.com` by default (works in sandbox) |
| Account | Suppression list on for BOUNCE + COMPLAINT. Sandbox: 200/day, 1/s, verified recipients only. |

Callers of `sendEmail` (all switch together): free-guide, winback-email,
launch-email, cost-alert, social-queue.

## When AWS approves

AWS mails the account address. Check anytime:

```bash
aws sesv2 get-account --region us-east-1 --query '{prod:ProductionAccessEnabled,quota:SendQuota,review:Details.ReviewDetails}'
```

`prod: true` = approved. If they ask questions, answer in the support case.

### 1. Bounce + complaint handling (do before switching)

We told AWS we'd do this. High bounce (>5%) or complaint (>0.1%) rates get
the account paused.

- Create a configuration set (e.g. `posta`) with an event destination to an
  SNS topic for `BOUNCE` and `COMPLAINT`.
- SNS → HTTPS subscription to a new edge function (e.g. `ses-events`) that
  verifies the SNS signature, confirms the subscription, and marks the
  address as undeliverable (same effect as `email-unsubscribe`: no more mail).
- Set secret `SES_CONFIGURATION_SET=posta` — `email-ses.ts` already sends it
  when present.

### 2. Deploy the functions with the new `email.ts`

Careful: several of these functions have other uncommitted changes in the
working tree. Commit first, or deploy from a clean worktree, so only the email
change ships.

```bash
npx supabase@2 functions deploy free-guide winback-email launch-email cost-alert social-queue --project-ref qbzjaseetusewxnfgpes
```

With `EMAIL_PROVIDER` unset this changes nothing — still Resend.

### 3. Test one real mail through SES

Send a free guide to your own address from the site, or run the test script
with the key (`aws iam create-access-key --user-name posta-ses-sender` if you
need a local copy; delete it after):

```bash
SES_AWS_ACCESS_KEY_ID=... SES_AWS_SECRET_ACCESS_KEY=... deno run -A --node-modules-dir=none scripts/email/ses-test.ts you@example.com
```

Check in Gmail → "Show original": DKIM pass `postaspanish.com`, DMARC pass.

### 4. Switch

```bash
npx supabase@2 secrets set EMAIL_PROVIDER=ses --project-ref qbzjaseetusewxnfgpes
```

Rollback (back to Resend):

```bash
npx supabase@2 secrets unset EMAIL_PROVIDER --project-ref qbzjaseetusewxnfgpes
```

### 5. After a week on SES

- Watch bounce/complaint rates: SES console → Account dashboard → Reputation.
- Consider DMARC `p=quarantine` once reports look clean.
- Then optionally remove Resend (key, DNS records, code path).

## Notes

- SES has no idempotency key (Resend did). Callers already record each send
  in the DB, so retries don't double-send.
- `winback_emails.resend_id` will hold the SES MessageId when on SES — just a
  column name.
- Cost: ~USD 0.10 per 1,000 mails. Resend free plan: 3,000/month, 100/day.

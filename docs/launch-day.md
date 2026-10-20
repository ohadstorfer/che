# Launch day: site and waitlist mail

Everything below is ready and switched off. Do it only after **both** stores
show Posta as live (a link that opens the store page).

## 1. The site: badges go live

In `/Users/ohadstorfer/che/posta-site/config.js`, fill the two empty links
(they are also written in the comment above them):

```js
ios: 'https://apps.apple.com/app/id6817374310',
android: 'https://play.google.com/store/apps/details?id=app.posta.android',
```

Then publish:

```bash
cd /Users/ohadstorfer/che && aws/deploy.sh postaspanish.com
```

What changes on postaspanish.com: the App Store / Google Play badges become
links (a phone only sees its own store), the waitlist form goes away, "Join the
waitlist" turns into "Get the app", and the QR code shows.
`postaspanish.com/get` starts sending iPhones to the App Store and Androids to
Google Play (use it in bios and reels).

If only one store is live, fill only that link: the other badge stays as a
picture.

## 2. The waitlist mail

One mail, only to people who left an email. Code: `supabase/functions/launch-email`
(text in `supabase/functions/_shared/launch-email.ts`). It needs:

```bash
cd /Users/ohadstorfer/che/che
npx supabase@2 db push --linked          # migration 20261020000040 (launch_emailed_at)
npx supabase@2 functions deploy launch-email --project-ref qbzjaseetusewxnfgpes --use-api
```

First a dry run (counts, shows the text, sends nothing). In the Supabase SQL
editor:

```sql
select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'functions_url') || '/launch-email',
  headers := jsonb_build_object('Content-Type', 'application/json',
    'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
  body := '{"dryRun": true}'::jsonb);
-- a few seconds later:
select status_code, content from net._http_response order by id desc limit 1;
```

The answer lists `phones`: people who left a phone number. Message them by hand
(WhatsApp) with the `/get` link.

When the dry run looks right, the same call with `'{"send": true}'::jsonb`
sends. Each person is stamped (`waitlist.launch_emailed_at`), so running it
again only reaches whoever is left.

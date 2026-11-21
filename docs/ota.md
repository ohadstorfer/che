# OTA updates

`npm run update -- --platform ios|android --message "..."` publishes to the production channel. The app asks for a new update at every launch (src/lib/app-updates.ts).

## Who waits for an update

- **A launch still on the store build's own code** (a fresh install, or a phone that never got an update down; `Updates.isEmbeddedLaunch`). If an update is available and the answer comes while the splash is up (its 3 s), the splash stays up with a small "Updating…" at the bottom (Deel's way: no new screen, no bar), and the app restarts into the new version. This way a copy of an old build (APK mirrors, Xiaomi GetApps, a store build months old) never shows an outdated onboarding.
- **Everyone, when the OTA is marked critical** (below).
- **Everyone else** gets the update on the spot only if it finishes downloading while the splash is still up (about 4 s). Otherwise it applies on their next launch.

25 s after launch, the check included, the app goes on by itself, and the update applies on the next launch.

## Marking an OTA critical

Use this for a crash fix, a broken paywall, or anything everyone must have right away.

1. In the commit you are publishing, bump `CRITICAL_INDEX` in `src/lib/ota-critical.ts` by one (0 → 1).
2. Publish the OTA for both platforms, as usual.
3. Only **after** both are live, set the server number to match:

   ```sql
   insert into app_config (key, value) values ('ota_critical', '1')
   on conflict (key) do update set value = excluded.value;
   ```

On launch, a phone whose running code has a lower number than the server's waits for the update.

Setting the server number before the OTA is out does no harm: the app only waits when an update is actually available. But users would wait for nothing on every launch until the OTA lands.

## Why not app.json

`expo.extra` and `updates.fallbackToCacheTimeout` are part of the native fingerprint. Changing either makes a new runtime, and OTAs stop reaching every build already in the stores. Everything here is JS plus one `app_config` row.

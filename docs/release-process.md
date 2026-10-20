# How a change reaches people

Three paths. Pick by what changed.

| What changed | Path | Reaches people |
|---|---|---|
| Course, words, culture, scenes, prices of AI, anything in the database | migration / script (`db push`, `course:*`) | at once, every app version |
| Edge functions (`supabase/functions/*`) | `npx supabase@2 functions deploy <name> --project-ref qbzjaseetusewxnfgpes --use-api` | at once, every app version |
| App JS/TS only (screens, copy, logic, `src/**`, images already bundled) | OTA: `npm run update` | next launch, only for builds with the same native fingerprint |
| Native: a new native module, an `app.json` plugin or permission, the iOS widget, the app icon or splash, Expo SDK upgrade | new build: `npm run build:ios` / `npm run build:android`, then store review | after review and the store update |

## OTA, and why it sometimes doesn't arrive

`app.json` uses `runtimeVersion: { policy: "fingerprint" }`. EAS hashes
everything native; an update only goes to builds with the same hash. So:

- JS-only change → same fingerprint → `npm run update` reaches everyone on
  that build.
- Anything native → new fingerprint → the update is published but **no
  installed build takes it**. It needs a store build.

Check before publishing: `npx expo-updates fingerprint:generate --platform ios`
(compare with the build's `runtimeVersion` in EAS).

Natives added since the last store build (October 2026), so the next release
**must** be a build, not an OTA: `expo-store-review`, `@sentry/react-native`,
`expo-secure-store` session storage, the iOS widget extension changes.

## Before a store build

1. Commit everything that goes in (the build is made from the folder,
   `EAS_NO_VCS=1`, so uncommitted files go in too: check `git status`).
2. `npx tsc --noEmit`, `npm run engine:test`, `deno test` in
   `supabase/functions`.
3. Functions and migrations the build needs are already live (an app that
   calls a function before it exists breaks).
4. Bump nothing by hand: `autoIncrement` in `eas.json` numbers the build;
   `version` in `app.json` changes only for a new store version (1.0.0 → 1.0.1).

## After a store build

- Apple: TestFlight first, then attach the build to the version and "Add for
  Review". The version is set to **manual release**: publish it yourself once
  approved.
- Google: internal track (as `eas submit` does), then promote to production
  and "Send for review" in Publishing overview.
- OTA updates after that go to the new build only (new fingerprint).

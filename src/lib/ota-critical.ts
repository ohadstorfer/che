// ---------------------------------------------------------------------------
// The critical-update counter (Expo's own pattern, UpdatesAPIDemo, 2026-11-19).
//
// An OTA that everyone must be on right away — a crash fix, a broken paywall —
// is marked critical: bump this number in the same commit, publish the OTA,
// then set app_config `ota_critical` to the same number (the critical step in
// docs/ota.md). A phone whose running code has a lower number than the
// server's waits on the splash ("Updating…") until the new update is down, instead of picking it up on its next launch.
//
// It lives in JS, not app.json `extra`: `extra` is part of the native
// fingerprint, so bumping it there would cut every live build off from OTAs.
// ---------------------------------------------------------------------------

export const CRITICAL_INDEX = 0;

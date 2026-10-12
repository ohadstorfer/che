import { ExtensionStorage } from '@bacons/apple-targets';

import type { Streak } from './types';

// ---------------------------------------------------------------------------
// The home screen widget's feed (targets/widget, docs/widgets-spec.md).
//
// The widget works out what to show from the clock on its own; all it needs
// from the app is her streak row, left where the widget can read it (the app
// group's defaults). So this runs wherever the row is published
// (streak-week.ts), and the widget redraws at once: finishing a round turns
// a crying Pancho into a goal celebration without waiting for the next hour.
// ---------------------------------------------------------------------------

const GROUP = 'group.com.posta.app';
const KEY = 'streak';

let storage: ExtensionStorage | null = null;
let last: string | null = null;

function write(value: string | undefined) {
  // The same row is published by every tab on focus; only a change is worth a redraw.
  if (value === (last ?? undefined)) return;
  last = value ?? null;
  try {
    storage ??= new ExtensionStorage(GROUP);
    storage.set(KEY, value);
    ExtensionStorage.reloadWidget();
  } catch {
    // A build without the widget target (an old dev client): nothing to feed.
  }
}

export function syncWidget(streak: Streak | null) {
  write(
    JSON.stringify({
      count: streak?.current_streak ?? 0,
      last: streak?.last_practice_date ?? null,
      banked: streak?.recoverable_streak ?? 0,
    }),
  );
}

/** Signed out: the widget goes back to the word of the day and an empty chip. */
export function clearWidget() {
  write(undefined);
}

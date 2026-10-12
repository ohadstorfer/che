import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestWidgetUpdate } from 'react-native-android-widget';

import type { Streak } from './types';
import { renderPostaWidget, WIDGET_NAMES, WIDGET_ROW_KEY } from '@/widget-android/render';

// ---------------------------------------------------------------------------
// The Android home screen widget's feed (src/widget-android,
// docs/widgets-spec.md). The widget is drawn from JS, by a background task
// that has no session: so her streak row is left in AsyncStorage for it, and
// any widget on the home screen is redrawn at once when the row changes.
// See widget.ios.ts for the iPhone's side.
// ---------------------------------------------------------------------------

let last: string | null = null;

function write(value: string | null) {
  // The same row is published by every tab on focus; only a change is worth a redraw.
  if (value === last) return;
  last = value;
  const saved = value === null ? AsyncStorage.removeItem(WIDGET_ROW_KEY) : AsyncStorage.setItem(WIDGET_ROW_KEY, value);
  saved
    .then(() =>
      Promise.all(WIDGET_NAMES.map((widgetName) => requestWidgetUpdate({ widgetName, renderWidget: renderPostaWidget }))),
    )
    // No widget on the home screen, or a build without the module: nothing to redraw.
    .catch(() => {});
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
  write(null);
}

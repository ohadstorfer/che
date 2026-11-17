import { getWidgetInfo, requestPinWidget } from 'react-native-android-widget';

import { WIDGET_NAMES } from '@/widget-android/render';

// ---------------------------------------------------------------------------
// The Android side of the widget promo (src/components/widget-promo.tsx).
// Android can say which widgets are placed, and the launcher can add one in a
// single tap with its own dialog. A launcher that can't pin falls back to the
// how-to steps.
// ---------------------------------------------------------------------------

export const WIDGET_PROMO_SUPPORTED = true;

export async function widgetPlaced(): Promise<boolean | null> {
  try {
    const placed = await Promise.all(WIDGET_NAMES.map((name) => getWidgetInfo(name)));
    return placed.some((list) => list.length > 0);
  } catch {
    return null;
  }
}

export async function addWidget(): Promise<'pinned' | 'guide'> {
  try {
    return (await requestPinWidget({ widgetName: 'PostaSmall' })) ? 'pinned' : 'guide';
  } catch {
    return 'guide';
  }
}

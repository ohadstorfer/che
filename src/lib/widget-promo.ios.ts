import { ExtensionStorage } from '@bacons/apple-targets';

// ---------------------------------------------------------------------------
// The iPhone side of the widget promo (src/components/widget-promo.tsx).
//
// Apple gives apps no way to add a widget or to ask whether one is placed. So:
// adding is a three-step guide, and "placed" is a mark the widget leaves in the
// app group each time it builds a timeline (targets/widget/PostaWidget.swift),
// which only a widget on a home screen does. iOS asks for a timeline at least
// every few hours, so a mark from the last 3 days means one is there. A build
// whose widget predates the mark has none: that reads as "not placed".
// ---------------------------------------------------------------------------

export const WIDGET_PROMO_SUPPORTED = true;

const GROUP = 'group.app.posta.ios';
const FRESH = 3 * 24 * 60 * 60;

export async function widgetPlaced(): Promise<boolean | null> {
  try {
    const raw = new ExtensionStorage(GROUP).get('widgetSeen');
    const at = raw ? Number(raw) : NaN;
    if (!Number.isFinite(at)) return false;
    return Date.now() / 1000 - at < FRESH;
  } catch {
    return null;
  }
}

export async function addWidget(): Promise<'pinned' | 'guide'> {
  return 'guide';
}

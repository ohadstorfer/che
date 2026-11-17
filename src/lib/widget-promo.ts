// Web build of the widget promo's platform side: there is no home screen widget
// here, so the promo never shows. See widget-promo.ios.ts / widget-promo.android.ts.

export const WIDGET_PROMO_SUPPORTED = false;

/** Whether a Posta widget is on the home screen; null when this build can't tell. */
export async function widgetPlaced(): Promise<boolean | null> {
  return null;
}

/** 'pinned': the system's add dialog opened. 'guide': show the how-to steps instead. */
export async function addWidget(): Promise<'pinned' | 'guide'> {
  return 'guide';
}

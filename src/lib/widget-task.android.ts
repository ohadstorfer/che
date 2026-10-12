import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { renderPostaWidget } from '@/widget-android/render';

// Android asks for the widget to be drawn when it is added, resized, and every
// half hour after that (app.json), with or without the app open: this is what
// moves it through the day. Taps are deep links and never reach here.
registerWidgetTaskHandler(async ({ widgetAction, widgetInfo, renderWidget }) => {
  if (widgetAction === 'WIDGET_ADDED' || widgetAction === 'WIDGET_UPDATE' || widgetAction === 'WIDGET_RESIZED') {
    renderWidget(await renderPostaWidget(widgetInfo));
  }
});

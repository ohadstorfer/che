import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Small, deliberate taps: a selection ticks, a finished purchase lands. Web has
// no motor, so it stays silent there.
const native = Platform.OS !== 'web';

// A Button ticks on press-in, and many callers also tick in their onPress:
// one press must still feel like one tick, so taps closer than this merge.
const TAP_GAP_MS = 150;
let lastTap = 0;

export const tap = () => {
  if (!native) return;
  const now = Date.now();
  if (now - lastTap < TAP_GAP_MS) return;
  lastTap = now;
  void Haptics.selectionAsync().catch(() => {});
};

export const thud = () => {
  if (native) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

export const success = () => {
  if (native) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

/** A wrong answer: the "no" buzz, short enough not to scold. */
export const warn = () => {
  if (native) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};

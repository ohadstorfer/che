import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Small, deliberate taps: a selection ticks, a finished purchase lands. Web has
// no motor, so it stays silent there.
const native = Platform.OS !== 'web';

export const tap = () => {
  if (native) void Haptics.selectionAsync().catch(() => {});
};

export const thud = () => {
  if (native) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

export const success = () => {
  if (native) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

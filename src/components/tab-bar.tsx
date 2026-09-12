import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { colors, press, radius, shadow } from '@/lib/theme';

// ---------------------------------------------------------------------------
// TabBar
//
// The stock bar is a flat white slab pinned to the very bottom edge with a
// hairline on top — on iOS Safari its labels end up clipped by the browser
// chrome, and it reads as browser furniture rather than part of the app.
//
// This one is a floating card: same white, same violet-tinted shadow and same
// radius as the word cards above it, lifted clear of the home indicator. The
// active tab is marked by a lavender pill that *slides* between tabs, so the
// selection reads as a place you moved to rather than a colour that blinked.
// ---------------------------------------------------------------------------

/** Movement on screen wants ease-in-out; 220ms keeps it under the 300ms ceiling. */
const SLIDE_DURATION = 220;
const SLIDE_EASING = Easing.bezier(0.77, 0, 0.175, 1);

/** Breathing room between the pill and its tab slot. */
const PILL_INSET = 4;

// Colour can't ride the native driver, so on web it eases via a real CSS
// transition and on native it simply lands — the sliding pill already carries
// the motion, and the swap is never the thing the eye is following.
const colorTransition =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'color',
        transitionDuration: '200ms',
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as unknown as TextStyle)
    : undefined;

const pressTransition =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: `${press.duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      } as unknown as ViewStyle)
    : undefined;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [rowWidth, setRowWidth] = useState(0);

  // Tracks the focused index as a float so the pill can be interpolated to any
  // point between slots mid-slide.
  const slide = useRef(new Animated.Value(state.index)).current;
  const settledIndex = useRef(state.index);
  if (settledIndex.current !== state.index) {
    settledIndex.current = state.index;
    Animated.timing(slide, {
      toValue: state.index,
      duration: SLIDE_DURATION,
      easing: SLIDE_EASING,
      useNativeDriver: true,
    }).start();
  }

  const slotWidth = rowWidth / Math.max(state.routes.length, 1);

  return (
    <View style={styles.dock}>
      <View
        style={styles.bar}
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        accessibilityRole="tablist">
        {slotWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              {
                width: slotWidth - PILL_INSET * 2,
                transform: [
                  {
                    translateX: slide.interpolate({
                      inputRange: [0, 1],
                      outputRange: [PILL_INSET, PILL_INSET + slotWidth],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;
          // Icon and label share one resting tone so neither reads as the
          // louder half of the pair; `faint` is reserved for disabled glyphs.
          const tint = focused ? colors.primary : colors.muted;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={styles.tab}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.tabContent,
                    // Every pressable in the app answers a press by shrinking;
                    // the bar shouldn't be the one place that feels inert.
                    { transform: [{ scale: pressed ? 0.92 : 1 }] },
                    pressTransition,
                  ]}>
                  {options.tabBarIcon?.({ focused, color: tint, size: 23 })}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.label,
                      { color: focused ? colors.primaryDark : colors.muted },
                      colorTransition,
                    ]}>
                    {label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // No safe-area inset under the bar: the card sits 12pt off the bottom edge
  // and the home indicator draws over it, exactly as it does over a native tab
  // bar. Padding the dock by `insets.bottom` would stack the indicator's 34pt
  // on top of that and strand the bar halfway up the screen.
  dock: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: PILL_INSET,
    ...shadow.card,
  },
  pill: {
    position: 'absolute',
    top: PILL_INSET,
    bottom: PILL_INSET,
    left: 0,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  tab: {
    flex: 1,
    // 52 + the 4pt padding either side clears the 44pt touch-target minimum
    // and, more importantly, gives the label room to sit without being clipped.
    height: 52,
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

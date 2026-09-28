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
import { clay, colors, font, press } from '@/lib/theme';
import { FitText } from '@/components/fit-text';

// ---------------------------------------------------------------------------
// TabBar
//
// The stock bar is a flat white slab pinned to the very bottom edge with a
// hairline on top — on iOS Safari its labels end up clipped by the browser
// chrome, and it reads as browser furniture rather than part of the app.
//
// This one is a floating clay pill lifted clear of the home indicator. The
// active tab is marked by a tinta (ink) pill that *slides* between tabs, so
// the selection reads as a place you moved to rather than a colour that blinked.
// ---------------------------------------------------------------------------

/** Movement on screen wants ease-in-out; 220ms keeps it under the 300ms ceiling. */
const SLIDE_DURATION = 220;
const SLIDE_EASING = Easing.bezier(0.77, 0, 0.175, 1);

/** The bar's padding: the pill and the tabs both sit inside it. */
const BAR_PAD = 6;

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

  // The tabs share the bar's width inside its padding, so the slots do too —
  // measuring the padded width would drift the pill right, tab by tab.
  const slotWidth = (rowWidth - BAR_PAD * 2) / Math.max(state.routes.length, 1);

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
                width: slotWidth,
                transform: [
                  {
                    translateX: slide.interpolate({
                      inputRange: [0, 1],
                      outputRange: [BAR_PAD, BAR_PAD + slotWidth],
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
          const tint = focused ? colors.card : colors.muted;

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
                  <FitText
                    lines={1}
                    style={[
                      styles.label,
                      focused ? styles.labelActive : null,
                      { color: focused ? colors.card : colors.muted },
                      colorTransition,
                    ]}>
                    {label}
                  </FitText>
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
    borderRadius: 34,
    padding: BAR_PAD,
    boxShadow: clay.float,
  },
  pill: {
    position: 'absolute',
    top: BAR_PAD,
    bottom: BAR_PAD,
    left: 0,
    borderRadius: 28,
    backgroundColor: colors.ink,
    // Ink's own shade: a drop in its colour and a faint lit edge.
    boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.15), 0 10px 22px -10px rgba(58, 42, 32, 0.6)',
  },
  tab: {
    flex: 1,
    // 52 + the 6pt padding either side clears the 44pt touch-target minimum
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
    ...font.body[700],
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.1,
  },
  labelActive: font.body[800],
});

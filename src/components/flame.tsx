import { useEffect, useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

// ---------------------------------------------------------------------------
// Flame — the streak's own fire, drawn instead of borrowed from the emoji font.
//
// Three tongues stacked on one base: a red-orange body, an amber middle, a
// pale core. Each is its own layer and only ever moves by transform (stretch
// and lean, pinned at the base), so the whole thing runs on the UI thread and
// the GPU composites it: no path is redrawn, no JS runs per frame.
//
// The layers breathe at periods that don't divide into each other (outer
// slowest, core quickest), so the flicker never visibly loops. Reduced motion
// gets the same flame, standing still.
// ---------------------------------------------------------------------------

// Drawn in a 100 × 120 box, base at the bottom centre.
const OUTER =
  'M50 4 C58 22 80 36 84 66 C88 96 70 116 50 116 C30 116 12 100 14 74 C16 56 28 48 32 34 C36 46 40 52 44 54 C42 36 44 20 50 4 Z';
const MIDDLE =
  'M53 32 C59 49 73 60 73 83 C73 103 63 113 50 113 C37 113 27 103 27 87 C27 72 37 64 42 54 C45 62 47 66 50 68 C48 56 49 44 53 32 Z';
const CORE =
  'M50 66 C56 76 63 84 63 95 C63 105 57 111 50 111 C43 111 37 105 37 97 C37 86 45 78 50 66 Z';

const LAYERS = [
  { d: OUTER, from: '#FF5E3A', to: '#FF9A4D', period: 920, stretch: 0.07, lean: 4 },
  { d: MIDDLE, from: '#FF9F43', to: '#FFD36E', period: 710, stretch: 0.09, lean: 6 },
  { d: CORE, from: '#FFE7A3', to: '#FFF8E1', period: 560, stretch: 0.12, lean: 8 },
] as const;

const BREATHE = Easing.inOut(Easing.sin);

function useOscillator(period: number, still: boolean) {
  const t = useSharedValue(0.5);
  useEffect(() => {
    if (still) return;
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: period, easing: BREATHE }), -1, true);
    return () => cancelAnimation(t);
  }, [period, still, t]);
  return t;
}

function Tongue({
  layer,
  size,
  id,
  t,
  sway,
}: {
  layer: (typeof LAYERS)[number];
  size: number;
  id: string;
  t: SharedValue<number>;
  sway: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const s = t.value - 0.5;
    const w = sway.value - 0.5;
    return {
      transform: [
        // Taller means thinner, the way a real flame pulls in as it rises.
        { scaleY: 1 + layer.stretch * s },
        { scaleX: 1 - layer.stretch * 0.5 * s },
        { skewX: `${layer.lean * w}deg` },
      ],
    };
  });
  const gradient = `g${id}`;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pinned, style]}>
      <Svg width={size * (100 / 120)} height={size} viewBox="0 0 100 120">
        <Defs>
          <LinearGradient id={gradient} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={layer.from} />
            <Stop offset="1" stopColor={layer.to} />
          </LinearGradient>
        </Defs>
        <Path d={layer.d} fill={`url(#${gradient})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * The streak flame. `size` is its height; the width follows. Pass `still` for
 * places that shouldn't move (or that are too small for movement to read).
 */
export function Flame({ size, still = false, style }: { size: number; still?: boolean; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const quiet = still || reduced;
  // Gradient ids are document-global on web, so every flame needs its own.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const outer = useOscillator(LAYERS[0].period, quiet);
  const middle = useOscillator(LAYERS[1].period, quiet);
  const core = useOscillator(LAYERS[2].period, quiet);
  // One slow lean shared by all three, so the tongues sway together and only
  // their stretch disagrees.
  const sway = useOscillator(1730, quiet);
  const beats = [outer, middle, core];

  return (
    <View
      style={[{ width: size * (100 / 120), height: size }, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants">
      {LAYERS.map((layer, i) => (
        <Tongue key={i} layer={layer} size={size} id={`${uid}${i}`} t={beats[i]} sway={sway} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Stretch and lean from the base, where a flame is anchored, not its middle.
  pinned: { transformOrigin: 'bottom' },
});

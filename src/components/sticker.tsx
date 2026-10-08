import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { colors, pastel } from '@/lib/theme';

// ---------------------------------------------------------------------------
// The sticker look's own pieces: the outlined, tilted headline, the flag's sun,
// and the way a sticker is slapped on. Outlines and hard shadows on ordinary
// surfaces come from the theme (`clay`); these are the parts a shadow can't do.
// ---------------------------------------------------------------------------

const DISPLAY = 'Gabarito_900Black';
/** The headline is drawn on a 960-wide board and scaled to the width it is given. */
const BOARD = 960;

/** The largest size, up to `max`, at which `text` stays on one line of the board. */
const fit = (text: string, max: number, perChar: number) => Math.min(max, Math.floor((BOARD - 20) / (text.length * perChar)));

/** One outlined line. The outline is its own text underneath, so its corners stay round on every platform. */
function Line({ text, size, y, stroke, spacing = 0 }: { text: string; size: number; y: number; stroke: number; spacing?: number }) {
  const shared = { x: stroke / 2, y, fontFamily: DISPLAY, fontSize: size, letterSpacing: spacing };
  return (
    <>
      <SvgText {...shared} fill={colors.ink} stroke={colors.ink} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round">
        {text}
      </SvgText>
      <SvgText {...shared} fill={pastel.butter}>
        {text}
      </SvgText>
    </>
  );
}

/**
 * A tab's headline: a small line over a big one, in butter with a thick ink
 * outline, tilted. Read out as one heading.
 */
export function OutlinedHeadline({ small, big, style }: { small: string; big: string; style?: StyleProp<ViewStyle> }) {
  const a = small.toUpperCase();
  const b = big.toUpperCase();
  const sizeA = fit(a, 88, 0.56);
  const sizeB = fit(b, 210, 0.6);
  const height = Math.round(sizeA * 1.02 + sizeB * 1.02 + 14);
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${small} ${big}`}
      style={[{ width: '100%', aspectRatio: BOARD / height, transform: [{ rotate: '-3deg' }] }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${BOARD} ${height}`}>
        <Line text={a} size={sizeA} y={sizeA * 0.86} stroke={16} />
        <Line text={b} size={sizeB} y={sizeA * 1.02 + sizeB * 0.84 + 6} stroke={22} spacing={-4} />
      </Svg>
    </View>
  );
}

const RAYS = Array.from({ length: 16 }, (_, k) => k * 22.5);

/** The sun from the Argentine flag: a disc with sixteen straight rays and sixteen wavy ones. */
export function FlagSun({ size, color = pastel.butter, opacity = 0.6, style }: { size: number; color?: string; opacity?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" accessible={false} style={[{ position: 'absolute', width: size, height: size, opacity }, style]}>
      <Svg width={size} height={size} viewBox="-100 -100 200 200">
        <G fill={color}>
          <Circle r={42} />
          {RAYS.map((deg) => (
            <G key={deg} rotation={deg}>
              <Path d="M -5.5 -47 L 0 -98 L 5.5 -47 Z" />
              <Path rotation={11.25} d="M -5 -47 C -11 -62 3 -72 -3 -94 C 9 -76 -1 -64 5 -47 Z" />
            </G>
          ))}
        </G>
      </Svg>
    </View>
  );
}

/** Tiles in a grid lean a little, each its own way, so the grid reads as stuck on by hand. */
const TILTS = ['-1.2deg', '1deg', '1.2deg', '-1deg'];
export const tiltAt = (index: number) => TILTS[index % TILTS.length];

/**
 * A sticker being slapped on: a short scale-up from just under full size, at
 * its own tilt, once when the screen first draws. `index` staggers a group.
 * With reduced motion it is simply there.
 */
export function useSlap(index = 0, tilt = '0deg') {
  const t = useRef(new Animated.Value(0)).current;
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (!live) return;
      if (on) {
        setReduced(true);
        t.setValue(1);
        return;
      }
      Animated.timing(t, {
        toValue: 1,
        duration: 320,
        delay: 80 + Math.min(index, 8) * 45,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
    return () => {
      live = false;
    };
  }, [index, t]);
  return {
    opacity: reduced ? 1 : t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] }),
    transform: [{ rotate: tilt }, { scale: reduced ? 1 : t.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
  };
}

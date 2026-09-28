import React, { useLayoutEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TextProps, TextStyle } from 'react-native';

type Props = TextProps & {
  /** The most lines the text may take. */
  lines?: number;
  /** How small it may shrink, as a share of the style's font size. */
  minScale?: number;
};

/**
 * Text that shrinks to fit in `lines` lines instead of cutting off with "…".
 * Measures its own height (works on native and web alike), steps the font
 * down until it fits, and only clamps if even `minScale` is too big.
 */
export function FitText({ lines = 1, minScale = 0.6, style, children, onLayout, ...rest }: Props) {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const size = flat.fontSize ?? 14;
  const lineHeight = flat.lineHeight ?? size * 1.2;
  const [scale, setScale] = useState(1);
  const [settled, setSettled] = useState(false);

  // New words: measure again from full size.
  useLayoutEffect(() => {
    setScale(1);
    setSettled(false);
  }, [textOf(children), size, lines]);

  const handleLayout = (e: LayoutChangeEvent) => {
    onLayout?.(e);
    const h = e.nativeEvent.layout.height;
    if (settled) return;
    const tooTall = h > lines * lineHeight * scale + 1;
    if (tooTall && scale > minScale) setScale(Math.max(minScale, scale - 0.06));
    else setSettled(true);
  };

  const fitted: TextStyle =
    scale === 1
      ? {}
      : {
          fontSize: size * scale,
          lineHeight: lineHeight * scale,
          ...(flat.letterSpacing ? { letterSpacing: flat.letterSpacing * scale } : null),
        };

  return (
    <Text
      {...rest}
      style={[style, fitted, settled ? null : styles.measuring]}
      numberOfLines={settled && scale <= minScale ? lines : undefined}
      onLayout={handleLayout}>
      {children}
    </Text>
  );
}

/** The plain words, so a fresh children array with the same text doesn't re-measure. */
function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return '';
}

const styles = StyleSheet.create({
  // Hidden for the frame or two it takes to find the size, so it never jumps.
  measuring: { opacity: 0 },
});

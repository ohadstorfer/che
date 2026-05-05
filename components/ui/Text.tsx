import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { useTheme, type TypeVariant } from "@/lib/theme";

type ColorVariant =
  | "label"
  | "labelSecondary"
  | "labelTertiary"
  | "primary"
  | "primaryText"
  | "heading"
  | "success"
  | "error"
  | "flame"
  | "highlight"
  | "inverse"
  | "ink"
  | "inkSoft"
  | "inkFaint"
  | "green"
  | "greenSoft"
  | "terra"
  | "bone";

export type AppTextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ColorVariant;
  weight?: "regular" | "medium" | "semibold" | "bold" | "heavy";
  align?: "left" | "center" | "right" | "auto";
  uppercase?: boolean;
  rtl?: boolean;
};

const weightMap: Record<NonNullable<AppTextProps["weight"]>, TextStyle["fontWeight"]> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
};

export function Text({
  variant = "body",
  color = "label",
  weight,
  align,
  uppercase,
  rtl,
  style,
  children,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const t = theme.typography[variant];

  const colorMap: Record<ColorVariant, string> = {
    label: theme.colors.label,
    labelSecondary: theme.colors.labelSecondary,
    labelTertiary: theme.colors.labelTertiary,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    heading: theme.colors.heading,
    success: theme.colors.success,
    error: theme.colors.error,
    flame: theme.colors.flame,
    highlight: theme.colors.highlight,
    inverse: theme.colors.bone,
    ink: theme.colors.ink,
    inkSoft: theme.colors.inkSoft,
    inkFaint: theme.colors.inkFaint,
    green: theme.colors.green,
    greenSoft: theme.colors.greenSoft,
    terra: theme.colors.terra,
    bone: theme.colors.bone,
  };

  const tFontStyle = (t as { fontStyle?: TextStyle["fontStyle"] }).fontStyle;
  const baseStyle: TextStyle = {
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    fontWeight: weight ? weightMap[weight] : (t.fontWeight as TextStyle["fontWeight"]),
    letterSpacing: t.letterSpacing,
    color: colorMap[color],
    fontFamily: theme.fontFamily,
    ...(tFontStyle ? { fontStyle: tFontStyle } : {}),
  };

  if (align) baseStyle.textAlign = align;
  if (uppercase) baseStyle.textTransform = "uppercase";
  if (rtl) {
    baseStyle.writingDirection = "rtl";
    baseStyle.textAlign = baseStyle.textAlign ?? "right";
  }

  return (
    <RNText style={[baseStyle, style]} {...rest}>
      {children}
    </RNText>
  );
}

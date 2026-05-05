import { Platform } from "react-native";

export type Palette = {
  background: string;
  backgroundSecondary: string;
  paper: string;
  card: string;
  cardElevated: string;
  separator: string;
  separatorOpaque: string;
  label: string;
  labelSecondary: string;
  labelTertiary: string;
  labelQuaternary: string;
  heading: string;
  primary: string;
  primaryText: string;
  primaryMuted: string;
  success: string;
  successMuted: string;
  error: string;
  errorMuted: string;
  flame: string;
  flameMuted: string;
  highlight: string;
  highlightMuted: string;
  fill: string;
  searchField: string;
  overlay: string;
  // Mate-specific aliases for pixel-perfect recreation
  bone: string;
  boneShade: string;
  green: string;
  greenSoft: string;
  greenLight: string;
  greenLine: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  terra: string;
};

const BONE = "#F1EEE6";
const BONE_SHADE = "#E7E2D6";
const GREEN = "#3E5641";
const GREEN_SOFT = "#5C7560";
const GREEN_LIGHT = "#A8B89A";
const GREEN_LINE = "#C5CFB8";
const INK = "#1F2521";
const INK_SOFT = "rgba(31, 37, 33, 0.62)";
const INK_FAINT = "rgba(31, 37, 33, 0.38)";
const INK_QUART = "rgba(31, 37, 33, 0.18)";
const TERRA = "#B8543A";
const TERRA_MUTED = "rgba(184, 84, 58, 0.14)";
const GREEN_MUTED = "rgba(62, 86, 65, 0.12)";

const palette: Palette = {
  background: BONE,
  backgroundSecondary: BONE_SHADE,
  paper: BONE,
  card: BONE,
  cardElevated: BONE,
  separator: GREEN_LINE,
  separatorOpaque: GREEN_LINE,
  label: INK,
  labelSecondary: INK_SOFT,
  labelTertiary: INK_FAINT,
  labelQuaternary: INK_QUART,
  heading: GREEN,
  primary: GREEN,
  primaryText: BONE,
  primaryMuted: GREEN_MUTED,
  success: GREEN,
  successMuted: GREEN_MUTED,
  error: TERRA,
  errorMuted: TERRA_MUTED,
  flame: TERRA,
  flameMuted: TERRA_MUTED,
  highlight: GREEN_LIGHT,
  highlightMuted: GREEN_MUTED,
  fill: BONE_SHADE,
  searchField: BONE_SHADE,
  overlay: "rgba(31, 37, 33, 0.55)",
  bone: BONE,
  boneShade: BONE_SHADE,
  green: GREEN,
  greenSoft: GREEN_SOFT,
  greenLight: GREEN_LIGHT,
  greenLine: GREEN_LINE,
  ink: INK,
  inkSoft: INK_SOFT,
  inkFaint: INK_FAINT,
  terra: TERRA,
};

export const palettes = { light: palette };

export const fontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
});

export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight:
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "normal"
    | "bold";
  letterSpacing?: number;
  fontStyle?: "italic" | "normal";
};

// iOS HIG scale (matching design handoff). letterSpacing values from mate.jsx
// converted from em → pt at the given fontSize (em * fontSize).
export const typography = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: "700", letterSpacing: -0.75 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.5 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.31 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: "600", letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: "600", letterSpacing: -0.085 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: "400", letterSpacing: -0.085 },
  bodyEmphasized: { fontSize: 17, lineHeight: 22, fontWeight: "600", letterSpacing: -0.085 },
  bodyItalic: { fontSize: 17, lineHeight: 22, fontWeight: "400", letterSpacing: -0.085, fontStyle: "italic" },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: "400", letterSpacing: 0 },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: "400", letterSpacing: 0 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: "400", letterSpacing: 0 },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: "400", letterSpacing: 0 },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: "400", letterSpacing: 0 },
  // Eyebrow: caption2 uppercased, letter-spacing 0.18em ≈ 2pt at 11pt, weight 500.
  eyebrow: { fontSize: 11, lineHeight: 13, fontWeight: "500", letterSpacing: 2 },
} as const satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof typography;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  none: 0,
  sm: 8,
  input: 0,
  button: 12,
  card: 12,
  sheet: 16,
  pill: 999,
} as const;

export const screenPadding = {
  edge: 16,
  primary: 30,
  section: 32,
} as const;

export const cardShadow = {
  shadowColor: "transparent",
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
} as const;

export const motion = {
  pressScaleNative: 0.98,
  pressScaleWeb: 1.0,
  defaultDurationMs: 250,
  spring: { damping: 14, stiffness: 200, mass: 0.6 },
  springSettle: { damping: 22, stiffness: 100, mass: 0.6 },
} as const;

export type Theme = {
  colors: Palette;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  screenPadding: typeof screenPadding;
  shadow: typeof cardShadow;
  fontFamily: string;
  motion: typeof motion;
};

const theme: Theme = {
  colors: palette,
  typography,
  spacing,
  radii,
  screenPadding,
  shadow: cardShadow,
  fontFamily: fontFamily as string,
  motion,
};

export function getTheme(): Theme {
  return theme;
}

export function useTheme(): Theme {
  return theme;
}

export const navigationColors = {
  light: {
    headerBackground: palette.background,
    headerTint: palette.label,
    contentBackground: palette.background,
  },
} as const;

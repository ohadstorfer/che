// ---------------------------------------------------------------------------
// Theme — Arcilla (soft clay)
//
// Warm oat paper, molded surfaces, pastel tiles. Rosa is what he acts on;
// salvia means "right"; a warm coral means "wrong". The pastels (durazno,
// salvia, manteca, lavanda, cielo) are decoration and grouping only — they
// never carry meaning on their own.
//
// Surfaces feel pressed out of clay: a light inner edge on top, a soft warm
// shade inside the bottom, and a diffuse drop under it (`clay`). One blue
// still sits outside the family on purpose:
//   · `frost` — the streak-freeze blue. Cold is blue.
// ---------------------------------------------------------------------------

// Raw hues. Everything below is one of these or a shade of one.
const OAT = '#F7EFE6'; // the page
const CANVAS = '#EFE4D8'; // a step darker than the page
const SURFACE = '#FFF9F3'; // raised clay
const LINE = '#E6D8C8';
const INK = '#3A2A20';
const INK_2 = '#7A6556';
const ROSA = '#B44A60';
const ROSA_TOP = '#B24A62';
const ROSA_BOTTOM = '#A8425A';
const ROSA_DARK = '#8A3347';
const SALVIA_INK = '#3F7A57'; // salvia deep enough to read and to mean "right"
const CORAL = '#C9553E'; // warm wrong, well clear of rosa in lightness
const CORAL_DARK = '#94371F';
const LOCKED = '#EADFD2';
const LOCKED_ICON = '#9C8878';

/** The five clay pastels, flat and as their top→bottom gradients. */
export const pastel = {
  peach: '#FFB38A',
  sage: '#A8D5BA',
  butter: '#FFE08A',
  lav: '#C9B8F0',
  sky: '#A9D6F5',
  flame: '#FF8A5B',
} as const;

export const pastelGrad = {
  peach: ['#FFC4A3', '#FFAB7F'] as const,
  sage: ['#BDE1CB', '#A0D0B3'] as const,
  butter: ['#FFE9A6', '#FFD970'] as const,
  lav: ['#D6C8F5', '#C2AFEE'] as const,
  sky: ['#BDE0F8', '#A1D1F3'] as const,
};

export type PastelName = keyof typeof pastelGrad;

/**
 * Clay depth, as CSS box-shadow strings (RN takes them straight through).
 * `clay` for any raised surface, `clayBtn` for the rosa action, `clayFloat`
 * for things hovering over content (the tab bar), `trough` for sunken wells.
 */
export const clay = {
  surface:
    'inset 2px 3px 0 rgba(255,255,255,0.65), inset -3px -5px 10px rgba(120,70,40,0.10), 0 10px 22px -10px rgba(120,70,40,0.35)',
  button:
    'inset 0 3px 0 rgba(255,255,255,0.28), inset 0 -5px 10px rgba(80,10,30,0.25), 0 12px 22px -8px rgba(160,50,75,0.55)',
  float: 'inset 2px 3px 0 rgba(255,255,255,0.7), 0 18px 36px -12px rgba(120,70,40,0.4)',
  trough: 'inset 0 2px 5px rgba(58,42,32,0.12)',
  /** A flat, pressed-down surface (locked coins, disabled) — no lift. */
  flat: 'inset 0 2px 4px rgba(58,42,32,0.08)',
} as const;

export const gradients = {
  /** Full-strength decorative gradient — used behind hero art. */
  tile: pastelGrad.peach,
  /** The page, barely moving, for large page-filling areas. */
  wash: [OAT, CANVAS] as const,
  /** The rosa action, top to bottom — primary buttons and the current step. */
  deep: [ROSA_TOP, ROSA_BOTTOM] as const,
};

export const colors = {
  // Surfaces --------------------------------------------------------------
  bg: OAT,
  /** Raised clay — cards, chips, the tab bar. */
  card: SURFACE,
  border: LINE,

  // Text ------------------------------------------------------------------
  ink: INK,
  muted: INK_2,
  faint: 'rgba(58, 42, 32, 0.38)', // placeholders and disabled glyphs only
  /** Text on any pastel tile — the same warm ink, so tiles never need a lookup. */
  onPastel: INK,

  // Rosa — the app's primary ---------------------------------------------
  primary: ROSA,
  primaryDark: ROSA_DARK,
  /** The canvas: oat a step darker — shared tab header, wells. */
  stone: CANVAS,
  primarySoft: 'rgba(180, 74, 96, 0.12)',
  onPrimary: '#FFFFFF',

  // Accent — durazno, for "needs review" and asides ------------------------
  accent: '#C4663F',
  accentSoft: 'rgba(255, 179, 138, 0.38)',

  // Success — salvia --------------------------------------------------------
  success: SALVIA_INK,
  successSoft: 'rgba(168, 213, 186, 0.5)',

  // Danger — warm coral -----------------------------------------------------
  danger: CORAL,
  dangerSoft: 'rgba(201, 85, 62, 0.14)',
  /** Text on `dangerSoft`. */
  dangerInk: CORAL_DARK,

  // Sunken wells: progress tracks, segmented-control backs.
  trough: 'rgba(58, 42, 32, 0.10)',
  /** Translucent white chip laid over a pastel tile. */
  chip: 'rgba(255, 255, 255, 0.72)',
  /** The soft disc behind the carpincho on hero tiles. */
  pod: 'rgba(255, 255, 255, 0.45)',

  // Raw decorative hues, kept by slot name for the art that reaches for them.
  lilac: pastel.lav,
  blush: pastel.peach,
} as const;

/**
 * The freeze palette — the one blue in an app of warm clay, so ice is
 * unmistakably not just another decoration.
 */
export const frost = {
  ink: '#5E9EC9',
  face: '#DFEFFA',
  bg: '#243240',
  chipText: '#D6EBFA',
  chipSub: 'rgba(214, 235, 250, 0.55)',
} as const;

/**
 * The path's steps. Size, fill and shade encode whether a step is locked,
 * current or done, so the values live here rather than inline in the screen.
 * Done steps wear their unit's colour (home.tsx), the current one is rosa,
 * locked ones are pressed-flat oat.
 */
export const path = {
  lockedFace: LOCKED,
  lockedGlyph: LOCKED_ICON,
  litGlyph: '#FFFFFF',
  lockedRim: 'rgba(58, 42, 32, 0.06)',
  litRim: 'rgba(255, 255, 255, 0.22)',
  lockedEngrave: 'rgba(255, 255, 255, 0.9)',
  litEngrave: 'rgba(0, 0, 0, 0.25)',
  sheen: ['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0)', 'rgba(58, 42, 32, 0.06)'] as const,
  /** The pulsing ring around the current step, as an rgb triplet to animate alpha. */
  ringRgb: '180, 74, 96',
  coinShadow: clay.button,
  skeleton: LOCKED,
  dayAhead: LOCKED,
} as const;

/** Clay is round: everything is molded, nothing has a sharp corner. */
export const radius = { sm: 14, md: 20, lg: 28, xl: 34, pill: 999 };

export const spacing = { xs: 6, sm: 10, md: 16, lg: 20, xl: 28 };

/**
 * Fonts. Gabarito for display, Figtree for everything else. On native a
 * custom font's weight lives in its family name, so never pair these with
 * `fontWeight` — pick the weight here instead: `font.body[700]`.
 */
export const font = {
  display: {
    600: { fontFamily: 'Gabarito_600SemiBold' },
    700: { fontFamily: 'Gabarito_700Bold' },
    800: { fontFamily: 'Gabarito_800ExtraBold' },
  },
  body: {
    500: { fontFamily: 'Figtree_500Medium' },
    600: { fontFamily: 'Figtree_600SemiBold' },
    700: { fontFamily: 'Figtree_700Bold' },
    800: { fontFamily: 'Figtree_800ExtraBold' },
  },
} as const;

/** Type scale. */
export const type = {
  display: { ...font.display[800], fontSize: 34, letterSpacing: -0.5 },
  title: { ...font.display[800], fontSize: 26, letterSpacing: -0.3 },
  section: { ...font.display[800], fontSize: 20, letterSpacing: -0.1 },
  body: { ...font.body[600], fontSize: 15, lineHeight: 21 },
  label: { ...font.body[800], fontSize: 13, letterSpacing: 0.1 },
  caption: { ...font.body[600], fontSize: 12 },
} as const;

/** Legacy names — both are clay now. */
export const shadow = {
  card: { boxShadow: clay.surface },
  raised: { boxShadow: clay.float },
};

/**
 * Press feedback: 160ms is short enough to read as instant, and 0.97 is the
 * smallest scale that still registers as a response.
 */
export const press = { scale: 0.97, duration: 160 };

/**
 * Culture subjects: pastel clay tiles, dealt out so neighbours never match.
 * `ink` is the type on the tone, `fill` the progress.
 */
const tone = (bg: string) => ({
  bg,
  ink: INK,
  sub: 'rgba(58, 42, 32, 0.72)',
  track: 'rgba(58, 42, 32, 0.12)',
  fill: INK,
});
export const cultureTones = [
  tone(pastel.sage),
  tone(pastel.peach),
  tone(pastel.lav),
  tone(pastel.sky),
  tone(pastel.butter),
] as const;

export type CultureTone = (typeof cultureTones)[number];

/** A selected answer or tab: a soft ink outline pressed into the page — the text keeps its own color. */
export const PICKED = {
  borderColor: 'rgba(58, 42, 32, 0.55)',
  backgroundColor: 'rgba(58, 42, 32, 0.06)',
  boxShadow: 'inset 0 2px 4px rgba(58, 42, 32, 0.08), 0 0 0 3px rgba(58, 42, 32, 0.08)',
};

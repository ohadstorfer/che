// ---------------------------------------------------------------------------
// Theme — Figuritas (stickers)
//
// Warm oat paper, sticker surfaces, pastel tiles. Rosa is what he acts on;
// salvia means "right"; a warm coral means "wrong". The pastels (durazno,
// salvia, manteca, lavanda, cielo) are decoration and grouping only — they
// never carry meaning on their own.
//
// Surfaces are stickers: a thick ink outline and a hard ink shadow, no blur
// (`clay`, named for the look it replaced). One blue still sits outside the
// family on purpose:
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
const ROSA_DARK = '#8A3347';
const SALVIA_INK = '#3F7A57'; // salvia deep enough to read and to mean "right"
const CORAL = '#C9553E'; // warm wrong, well clear of rosa in lightness
const CORAL_DARK = '#94371F';
const LOCKED = '#EADFD2';
const LOCKED_ICON = '#9C8878';

/** The five pastels. Stickers are flat colour, so `pastelGrad` holds the same hue twice: it is kept for the surfaces that still draw themselves as a gradient. */
export const pastel = {
  peach: '#FFB38A',
  sage: '#A8D5BA',
  butter: '#FFE08A',
  lav: '#C9B8F0',
  sky: '#A9D6F5',
  flame: '#FF8A5B',
} as const;

export const pastelGrad = {
  peach: [pastel.peach, pastel.peach] as const,
  sage: [pastel.sage, pastel.sage] as const,
  butter: [pastel.butter, pastel.butter] as const,
  lav: [pastel.lav, pastel.lav] as const,
  sky: [pastel.sky, pastel.sky] as const,
};

export type PastelName = keyof typeof pastelGrad;

/**
 * Sticker depth, as CSS box-shadow strings (RN takes them straight through).
 * Every raised surface is a sticker: a thick ink outline and a hard ink shadow,
 * no blur. The outline is a zero-blur spread shadow rather than a border, so it
 * never changes a surface's layout. The token names are from the clay look this
 * replaced: `surface` for any raised surface, `button` for an action, `float`
 * for things over content (the tab bar), `trough` for progress tracks.
 */
export const OUTLINE = 2.5;
const stuck = (x: number, y: number, line = OUTLINE) => `0 0 0 ${line}px ${INK}, ${x}px ${y}px 0 ${line}px ${INK}`;
export const clay = {
  surface: stuck(3, 4),
  button: stuck(3, 4),
  float: stuck(4, 5),
  trough: `0 0 0 2px ${INK}`,
  /** The verdict buttons (green / coral). */
  verdictButton: stuck(3, 4),
  /** A flat, stuck-down surface (locked coins, disabled): a faint outline, no lift. */
  flat: '0 0 0 2px rgba(58, 42, 32, 0.22)',
  /** Small stickers: chips, the streak badge. */
  chip: stuck(2, 3, 2),
} as const;

export const gradients = {
  /** Full-strength decorative gradient — used behind hero art. */
  tile: pastelGrad.peach,
  /** The page, barely moving, for large page-filling areas. */
  wash: [OAT, CANVAS] as const,
  /** The rosa action, top to bottom — primary buttons and the current step. */
  deep: [ROSA, ROSA] as const,
  /** Progress, everywhere: the rosa, like the actions. */
  progress: [ROSA, ROSA] as const,
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
  /** An exercise's Check button: the primary. */
  check: ROSA,
  /** Progress (bars, the current step's ring): the rosa. */
  progress: ROSA,
  /** The "wrong" button: coral a step deeper, so white text on it reads. */
  dangerSolid: '#B24A34',
  /** Body text on the answer sheet's green or coral wash — warm ink, dark enough to read on both. */
  inkOnWash: '#6B5647',

  // Sunken wells: progress tracks, segmented-control backs.
  trough: SURFACE,
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
    /** Sticker headlines: the heaviest cut. */
    900: { fontFamily: 'Gabarito_900Black' },
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
  display: { ...font.display[900], fontSize: 34, letterSpacing: -0.5 },
  title: { ...font.display[900], fontSize: 26, letterSpacing: -0.3 },
  section: { ...font.display[900], fontSize: 20, letterSpacing: -0.1 },
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
  fill: ROSA,
});
export const cultureTones = [
  tone(pastel.sage),
  tone(pastel.peach),
  tone(pastel.lav),
  tone(pastel.sky),
  tone(pastel.butter),
] as const;

export type CultureTone = (typeof cultureTones)[number];

/** A selected answer: the sticker turns butter. Its outline and shadow stay as they were. */
export const PICKED = {
  backgroundColor: pastel.butter,
};

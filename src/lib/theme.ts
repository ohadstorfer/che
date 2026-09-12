// ---------------------------------------------------------------------------
// Theme
//
// Che's palette — bone paper, olive green, terracotta — poured into the shape
// the UI was built against. Green is what he acts on; terracotta is the second
// voice, for "needs review", warnings and anything gone wrong. Pages are bone
// so the green only ever appears where it means something.
//
// Two colours deliberately sit outside the palette, because in both cases the
// meaning is carried by the hue itself and an olive version would read as just
// another decoration:
//   · `frost` — the streak-freeze blue. Cold is blue; rendered in olive, a
//     frozen day would be indistinguishable from a finished one.
//   · nothing else. Errors use terracotta, same as the rest of the app.
// ---------------------------------------------------------------------------

// Raw hues. Everything below is one of these or a shade of one — no third
// family gets introduced.
const BONE = '#F1EEE6';
const BONE_SHADE = '#E7E2D6';
const GREEN = '#3E5641';
const GREEN_DARK = '#2B3C2E'; // shade of GREEN, for the underside of surfaces
const GREEN_SOFT = '#5C7560';
const GREEN_LIGHT = '#A8B89A';
const GREEN_LINE = '#C5CFB8';
const INK = '#1F2521';
const TERRA = '#B8543A';
const TERRA_DARK = '#8F3F2B'; // shade of TERRA: terracotta is too bright to read a sentence in

export const gradients = {
  /** Full-strength decorative gradient — used behind hero art. */
  tile: [GREEN_SOFT, GREEN_LIGHT] as const,
  /** The same family washed out, for large page-filling areas. */
  wash: [BONE, BONE_SHADE] as const,
  /** Deep green, for filled surfaces that need to feel weighty. */
  deep: [GREEN, GREEN_DARK] as const,
};

export const colors = {
  // Surfaces --------------------------------------------------------------
  bg: BONE, // warm bone paper — the page
  /**
   * Raised surfaces. Che's flat design had card === bg with a hairline between
   * them; the path's coins and panels need to actually sit on top of something,
   * so cards lift to white. White is not a new hue — it is the absence of the
   * bone tint, which is exactly what "raised" should read as here.
   */
  card: '#FFFFFF',
  border: GREEN_LINE,

  // Text ------------------------------------------------------------------
  ink: INK, // near-black, warmed toward green so it sits in the family
  muted: 'rgba(31, 37, 33, 0.62)',
  faint: 'rgba(31, 37, 33, 0.38)', // placeholders and disabled glyphs only

  // Green — the app's primary ----------------------------------------------
  primary: GREEN,
  primaryDark: GREEN_DARK,
  primarySoft: 'rgba(62, 86, 65, 0.12)',
  onPrimary: BONE,

  // Terracotta — the second voice, for "needs review" and asides ------------
  accent: TERRA,
  accentSoft: 'rgba(184, 84, 58, 0.14)',

  // Success ----------------------------------------------------------------
  // The same green as the primary, on purpose: the button he presses and the
  // answer he got right are the same idea wearing the same colour.
  success: GREEN,
  successSoft: 'rgba(62, 86, 65, 0.12)',

  // Danger -----------------------------------------------------------------
  // Terracotta, as it is everywhere else in Che. It reads as warm-wrong rather
  // than alarm-red, which suits a language app.
  danger: TERRA,
  dangerSoft: 'rgba(184, 84, 58, 0.14)',
  /** Text on `dangerSoft`. `danger` itself is too bright to read a sentence in. */
  dangerInk: TERRA_DARK,

  // Raw decorative hues, for gradients and washes ---------------------------
  // Named for their slots rather than their old hues: these are the two pale
  // greens the decorative art reaches for.
  lilac: GREEN_LINE,
  blush: GREEN_LIGHT,
} as const;

/**
 * The freeze palette — the one blue in an app of greens and bone, so ice is
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
 * The path's coins. Their look is not decoration — size, fill and shade encode
 * whether a step is locked, current or done — so the values live here rather
 * than inline in the screen.
 */
export const path = {
  /** A step he has not reached: bone paper with the tint drained out of it. */
  lockedFace: BONE_SHADE,
  /** The glyph on a locked coin — present, but not asking to be read. */
  lockedGlyph: GREEN_LIGHT,
  /** The pulsing ring around the current step, as an rgb triplet to animate alpha. */
  ringRgb: '168, 184, 154',
  /**
   * The weight of a physical button, kept inside the circle: a band of shade
   * along the bottom of the face rather than a rim sticking out under it, so the
   * coin reads as domed instead of as a stack of two discs. Written as a CSS
   * string — react-native-web takes it straight through, and RN parses it.
   */
  coinShadow: 'inset 0 -5px 7px rgba(31, 37, 33, 0.34)',
  /** Loading placeholders, while the real path is still coming. */
  skeleton: BONE_SHADE,
  /** Days still ahead in the week strip: present, but barely. */
  dayAhead: BONE_SHADE,
} as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const spacing = { xs: 6, sm: 10, md: 16, lg: 20, xl: 28 };

/** Type scale. */
export const type = {
  display: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  section: { fontSize: 17, fontWeight: '700', letterSpacing: -0.1 },
  body: { fontSize: 15, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  caption: { fontSize: 12 },
} as const;

// Shadows are tinted with the ink green rather than black so they sit in the
// same colour family as everything else.
export const shadow = {
  card: {
    shadowColor: INK,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  raised: {
    shadowColor: INK,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

/**
 * Press feedback: 160ms is short enough to read as instant, and 0.97 is the
 * smallest scale that still registers as a response.
 */
export const press = { scale: 0.97, duration: 160 };

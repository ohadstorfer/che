#!/usr/bin/env python3
"""Cut a figurita out of its generated tile.

The path on the home screen is dotted with cut-outs — a figure standing on the
page reads as part of the world, where a rounded tile would read as a button
she can't press. The source art always arrives boxed, so this is the step
between "an image was generated" and "an ornament exists".

    python3 scripts/cutout-figure.py assets/source/falafel.jpeg falafel-figure

Two cuts, because the sources come in two kinds:

  flood (default)  Illustrations on a flat card. Colour thresholds don't work
                   on them: the card is a gradient, the corners are white, and
                   the drop shadow is a third colour — meanwhile the silver
                   foil is closer to the card than the shadow is. So the mask
                   is built from *edges*. Every subject is drawn with a hard
                   outline; the shadow and the gradient are soft. Flood inward
                   from the border, stop only at strong gradients, and what is
                   left standing is the drawing.

  warm             Photographs of dark food on a dark backdrop, where there is
                   no gradient wall to stop at. What separates them is hue.

Requires Pillow + numpy + scipy (dev-only; the generated PNGs are committed).
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'assets/images')
# Big enough to stay sharp at 3x on the ~95pt slot the path gives a figure.
MAX_DIM = 384


def flood_cut(a, wall=16.0, shade=80.0, min_blob=0.002):
    """Mask an outlined illustration sitting on a flat card."""
    h, w, _ = a.shape

    # Gradient magnitude across all three channels — a coloured edge with no
    # luminance step (red on green) still has to count as a wall.
    sm = ndimage.gaussian_filter(a, (1.0, 1.0, 0))
    gx = ndimage.sobel(sm, axis=1) / 4.0
    gy = ndimage.sobel(sm, axis=0) / 4.0
    grad = np.sqrt((gx ** 2 + gy ** 2).sum(axis=2))

    lab, _ = ndimage.label(grad < wall)
    border = np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])
    bg = np.isin(lab, [int(v) for v in np.unique(border) if v])

    # The drop shadow is walled off by its own soft rim, so the first flood
    # leaves it standing. Run a second flood that only travels through colours
    # near the local background: the shadow qualifies, the drawing's own greens
    # are far too saturated, and the pale foil is unreachable behind its
    # outline. A local model, not one colour — the card is a gradient and its
    # corners are white.
    field = np.dstack([_nanblur(np.where(bg, a[..., c], np.nan), 151) for c in range(3)])
    # Deep inside a large subject there is no nearby background to average;
    # fall back to the whole card's colour so the field is defined everywhere.
    field = np.where(np.isfinite(field), field, np.median(a[bg], axis=0))
    dist = np.linalg.norm(a - field, axis=2)

    lab, _ = ndimage.label((dist < shade) | bg)
    bg = np.isin(lab, [int(v) for v in np.unique(lab[bg]) if v])

    # Whatever the flood couldn't reach is the drawing, plus its own interior
    # edges, which fill_holes puts back — except the gaps that really are gaps.
    # A wire basket has card showing through its mesh, and every one of those
    # holes is sealed off from the flood by the wire around it. So fill a hole
    # only if it doesn't look like the card.
    raw = ~bg
    subj = ndimage.binary_fill_holes(raw)
    holes, n = ndimage.label(subj & ~raw)
    if n:
        seen = ndimage.median(dist, holes, range(1, n + 1))
        subj &= ~np.isin(holes, [i + 1 for i, d in enumerate(seen) if d < shade])

    lab, n = ndimage.label(subj)
    if n:
        ids = range(1, n + 1)
        sizes = ndimage.sum(subj, lab, ids)
        # A sliver of shadow can be walled in between a character's feet, where
        # the flood can't reach it. It is still the background's colour, so
        # judge each piece by what it looks like and not only by its size.
        shade_like = ndimage.median(dist, lab, ids)
        keep = [i + 1 for i, (sz, d) in enumerate(zip(sizes, shade_like))
                if sz >= min_blob * h * w and d >= shade]
        if keep:
            # Garnish scattered across the card — a stray parsley leaf, a
            # sesame seed — belongs to the photo, not to the character. One
            # figure standing on the path should be one object.
            keep = [max(keep, key=lambda i: sizes[i - 1])]
        subj = np.isin(lab, keep)

    # The flood stops a pixel short of the outline; give that back.
    return ndimage.binary_dilation(subj, iterations=2)


def warm_cut(a):
    """Mask warm-toned food shot on a cool dark backdrop."""
    pan = ndimage.gaussian_filter(a[..., 0] - a[..., 2], 2.0) > 0
    pan = ndimage.binary_closing(pan, np.ones((9, 9)))
    pan = ndimage.binary_opening(pan, np.ones((9, 9)))
    pan = ndimage.binary_fill_holes(pan)
    lab, n = ndimage.label(pan)
    sizes = ndimage.sum(pan, lab, range(1, n + 1))
    return lab == int(np.argmax(sizes)) + 1


def circle_of(mask):
    """The disc a round subject describes, as soft alpha.

    A skillet's own silhouette comes out ragged where its shadow sits between
    warm and cool. It is a circle in the photograph, so make it one. The
    handles go with it, which is what a sticker wants anyway.
    """
    ys, xs = np.nonzero(mask)
    cy, cx = ys.mean(), xs.mean()
    r = np.sqrt(mask.sum() / np.pi)
    yy, xx = np.ogrid[:mask.shape[0], :mask.shape[1]]
    d = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
    return np.clip((r - d) / 1.6 + 0.5, 0, 1).astype(np.float32)


def _nanblur(x, size):
    m = np.isfinite(x)
    num = ndimage.uniform_filter(np.where(m, x, 0.0), size)
    den = ndimage.uniform_filter(m.astype(np.float32), size)
    return np.where(den > 1e-4, num / np.maximum(den, 1e-6), np.nan)


def cutout(src, name, mode='flood'):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)

    if mode == 'warm':
        alpha = circle_of(warm_cut(a))
    else:
        mask = flood_cut(a)
        # Let a blur carry the edge so it doesn't read as cut with scissors.
        alpha = ndimage.gaussian_filter(mask.astype(np.float32), 1.5)
        alpha = np.clip((alpha - 0.35) / 0.45, 0, 1)

    rgb = _despill(a, alpha)
    img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8))

    ys, xs = np.nonzero(alpha > 0.06)
    img = img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = MAX_DIM / max(img.size)
    if s < 1:
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)

    out = os.path.join(OUT_DIR, name + '.png')
    img.save(out, optimize=True)
    print(f'{os.path.relpath(out, ROOT)}  {img.width}x{img.height}')


def _despill(a, alpha):
    """Pull half-transparent edge pixels toward the subject's own colours, so
    no rim of the old background survives against a different page."""
    rgb = a.copy()
    band = (alpha > 0.02) & (alpha < 0.98)
    if not band.any():
        return rgb
    core = np.where((alpha > 0.98)[..., None], rgb, np.nan)
    near = np.dstack([_nanblur(core[..., c], 6) for c in range(3)])
    idx = np.nonzero(band)
    good = np.isfinite(near[band]).all(axis=1)
    sel = (idx[0][good], idx[1][good])
    k = alpha[band][good][:, None]
    rgb[sel] = rgb[sel] * k + near[sel] * (1 - k)
    return rgb


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    cutout(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 'flood')

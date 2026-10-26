#!/usr/bin/env python3
"""Brings Pancho's fur in some word pictures to the brown the rest share.

Gemini draws the capybara a shade lighter on some sheets. Rather than redraw
them, this moves only the fur-coloured pixels (warm brown, by hue) toward the
reference brown; the outline, props and anything not brown stay as they are.

    python3 scripts/word-art/match-fur.py pancho-waving pancho-paying ...

Rewrites assets/images/words/<concept>.webp in place.
"""
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORDS = os.path.join(ROOT, 'assets/images/words')

# Median fur of the cut pictures that look right (hue in degrees, s and v
# 0–1), measured the way `match` measures (r01, r02, r03, r07, r10, r14, r19).
TARGET = (21.6, 0.53, 0.68)


def fur_mask(h, s, v):
    """How much each pixel is fur: 1 inside the brown band, fading out at its edges."""
    def band(x, lo, hi, soft):
        return np.clip(np.minimum((x - lo) / soft, (hi - x) / soft), 0, 1)
    return band(h, 10, 40, 5) * band(s, 0.25, 0.8, 0.08) * band(v, 0.3, 0.97, 0.06)


def match(name):
    path = os.path.join(WORDS, name + '.webp')
    img = Image.open(path).convert('RGBA')
    alpha = np.asarray(img)[..., 3]
    hsv = np.asarray(img.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    m = fur_mask(h, s, v) * (alpha > 0)
    if m.sum() < 50:
        print(f'{name}: no fur found, left as it is')
        return
    w = m / m.sum()
    cur = ((h * w).sum(), (s * w).sum(), (v * w).sum())
    # Shift hue, scale saturation and value, by how much each pixel is fur.
    h2 = h + (TARGET[0] - cur[0]) * m
    s2 = np.clip(s * (1 + (TARGET[1] / cur[1] - 1) * m), 0, 1)
    # Only ever darker: a sheet whose average is pulled down by brown props
    # (a wooden balcony) must not have its fur lightened.
    v2 = np.clip(v * (1 + (min(1.0, TARGET[2] / cur[2]) - 1) * m), 0, 1)
    out = np.dstack([h2 % 360 * 255 / 360, s2 * 255, v2 * 255]).astype(np.uint8)
    rgb = Image.frombytes('HSV', (out.shape[1], out.shape[0]), out.tobytes()).convert('RGB')
    res = Image.merge('RGBA', (*rgb.split(), Image.fromarray(alpha)))
    res.save(path, quality=82, method=6)
    print(f'{name}: h {cur[0]:.0f}→{TARGET[0]:.0f}  s {cur[1]:.2f}→{TARGET[1]:.2f}  v {cur[2]:.2f}→{TARGET[2]:.2f}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for n in sys.argv[1:]:
        match(n)

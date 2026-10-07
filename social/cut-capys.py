# Cuts the two capybaras out of the generated mouth frames (same drawing, only
# the mouths differ) and writes one transparent PNG per capybara per mouth.
#   python3 cut-capys.py
# Background = the pale green the frames share; found by flooding in from the
# image border, so pale colors INSIDE the outlines (shirt stripes) are kept.
import numpy as np
from collections import deque
from PIL import Image, ImageFilter

SRC = 'out/mouths'
FRAMES = {  # file -> mouth state of (left, right)
    'gen-Lclosed-Ropen.jpg': ('closed', 'open'),
    'gen-Lopen-Rclosed.jpg': ('open', 'closed'),
    'gen-half.jpg': ('half', 'half'),
}
OUT = 'public/pancho/versus'
SCALE = 0.7  # the reel draws them ~1000px tall; the frames are 2752px

def flood(mask):
    """Pixels of `mask` reachable from the border."""
    H, W = mask.shape
    seen = np.zeros_like(mask); q = deque()
    for y, x in [(y, x) for y in (0, H - 1) for x in range(W)] + [(y, x) for x in (0, W - 1) for y in range(H)]:
        if mask[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return seen

def alpha_of(im):
    a = np.asarray(im).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    bg = (g > 150) & (g - r > 8) & (g - b > 2) & (r > 110) & (b > 120) & (g - r < 75)
    fg = Image.fromarray((~flood(bg) * 255).astype('uint8'))
    return fg.filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.GaussianBlur(1.2))

def two_bodies(alpha):
    """Label map at 1/4 size: 1 = left capybara, 2 = right one, 0 = everything else."""
    small = np.asarray(alpha.resize((alpha.width // 4, alpha.height // 4))) > 128
    H, W = small.shape; lab = np.zeros((H, W), int); sizes = {}; n = 0
    for sy, sx in zip(*np.nonzero(small)):
        if lab[sy, sx]: continue
        n += 1; lab[sy, sx] = n; q = deque([(sy, sx)]); count = 0
        while q:
            y, x = q.popleft(); count += 1
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < H and 0 <= nx < W and small[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n; q.append((ny, nx))
        sizes[n] = count
    big = sorted(sorted(sizes, key=sizes.get)[-2:], key=lambda k: np.nonzero(lab == k)[1].mean())
    out = np.zeros((H, W), 'uint8'); out[lab == big[0]] = 1; out[lab == big[1]] = 2
    return out

import os
os.makedirs(OUT, exist_ok=True)
frames = {f: Image.open(f'{SRC}/{f}').convert('RGB') for f in FRAMES if os.path.exists(f'{SRC}/{f}')}
alphas = {f: alpha_of(im) for f, im in frames.items()}
# One silhouette split and one crop box for all frames, so the mouths swap in place.
union = Image.fromarray(np.max([np.asarray(a) for a in alphas.values()], axis=0))
labels = two_bodies(union)
for side, name in ((1, 'mx'), (2, 'ar')):
    mine = Image.fromarray(((labels == side) * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5)).resize(union.size, Image.BILINEAR)
    ys, xs = np.nonzero(np.asarray(mine) > 128)
    box = (max(0, xs.min() - 12), max(0, ys.min() - 12), min(union.width, xs.max() + 12), min(union.height, ys.max() + 12))
    for f, im in frames.items():
        a = Image.fromarray(np.minimum(np.asarray(alphas[f]), np.asarray(mine)))
        cut = im.convert('RGBA'); cut.putalpha(a); cut = cut.crop(box)
        cut = cut.resize((round(cut.width * SCALE), round(cut.height * SCALE)), Image.LANCZOS)
        mouth = FRAMES[f][side - 1]
        cut.save(f'{OUT}/{name}-{mouth}.png'); print(name, mouth, cut.size, 'box', box)

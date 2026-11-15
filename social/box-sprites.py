# Seven mouth sprites for a gloved boxer of the boxing reels (src/box), from one Gemini image of the left boxer.
#   python3 box-sprites.py <code> <full.jpg>   ->  public/pancho/box/<code>-{closed,half,a,e,i,o,u}.png
#   python3 box-sprites.py <code> <punch.jpg> --punch  ->  <code>-p-*.png: the punching pose (arm straight at the other one),
#     on a canvas PUNCH_EXTRA px wider on the punching side, head in the same place as the normal sprites.
#     For ar (the right boxer) give the left-boxer image (punching to the right); it is mirrored at the end.
# The image must be Gemini's recolour of the mirrored gloved Argentinian (same head, same pose, white background):
# the left boxer gets the Argentinian's own mouth drawings, mirrored, pasted into his face, so both lip-sync the same way.
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageChops

code, src_path = sys.argv[1], sys.argv[2]
punch = '--punch' in sys.argv
PUNCH_EXTRA = 260
FR = ['closed', 'a', 'e', 'i', 'o', 'u', 'half']
A = {f: ImageOps.mirror(Image.open(f'public/pancho/box/ar-{f}.png').convert('RGBA')) for f in FR}
W, H = A['closed'].size

src = Image.open(src_path).convert('RGB')
a = np.asarray(src).astype(int); h, w, _ = a.shape
white = a.min(2) > 232
mask = np.zeros((h, w), bool); q = deque()
for x in range(w):
    for y in (0, h - 1):
        if white[y, x] and not mask[y, x]: mask[y, x] = 1; q.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if white[y, x] and not mask[y, x]: mask[y, x] = 1; q.append((y, x))
while q:
    y, x = q.popleft()
    for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
        if 0 <= yy < h and 0 <= xx < w and white[yy, xx] and not mask[yy, xx]: mask[yy, xx] = 1; q.append((yy, xx))
alpha = Image.fromarray(((~mask) * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
rgba = src.copy(); rgba.putalpha(alpha)
crop = rgba.crop(rgba.getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox())

# line the head up with the Argentinian's (scale + offset, on the top 30%)
ref = np.asarray(A['closed'].convert('L')).astype(float); refa = np.asarray(A['closed'].getchannel('A')) > 200
top = int(H * .3); best = None
CW = W + PUNCH_EXTRA if punch else W
# the normal image is as wide as the sprite; a punching one is sized by its height (the arm makes it wider)
size = (lambda s: (round(crop.width * H * s / crop.height), round(H * s))) if punch else (lambda s: (round(W * s), round(crop.height * W * s / crop.width)))
R = (np.arange(.88, 1.1, .01), range(-30, 31, 2)) if punch else (np.arange(.94, 1.07, .01), range(-14, 15, 2))
for s in R[0]:
    cw, ch = size(s); c = crop.resize((cw, ch), Image.LANCZOS)
    for dx in R[1]:
        for dy in range(-14, 15, 2):
            can = Image.new('RGBA', (CW, H)); can.paste(c, (dx, dy)); can = can.crop((0, 0, W, H))
            g = np.asarray(can.convert('L')).astype(float); ga = np.asarray(can.getchannel('A')) > 200
            m = refa[:top] & ga[:top]; e = np.abs(g[:top] - ref[:top])[m].mean()
            if best is None or e < best[0]: best = (e, s, dx, dy)
e, s, dx, dy = best; print(f'align error {e:.1f} (ok under ~8), scale {s:.2f}, offset {dx},{dy}')
cw, ch = size(s)
base = Image.new('RGBA', (CW, H)); base.paste(crop.resize((cw, ch), Image.LANCZOS), (dx, dy))

cl = np.asarray(A['closed']).astype(int); d = np.zeros((H, W), bool)
for f in FR[1:]: d |= np.abs(np.asarray(A[f]).astype(int) - cl)[..., :3].sum(2) > 40
d[:int(H * .08)] = 0; d[top:] = 0
mk = Image.fromarray((d * 255).astype('uint8')).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(4))
big = Image.new('L', (CW, H)); big.paste(mk, (0, 0)); mk = big
mk = ImageChops.multiply(mk, base.getchannel('A').filter(ImageFilter.MinFilter(5)))
for f in FR:
    face = Image.new('RGBA', (CW, H)); face.paste(A[f], (0, 0))
    o = base.copy(); o.paste(face, (0, 0), mk)
    if punch and code == 'ar': o = ImageOps.mirror(o)
    o.save(f'public/pancho/box/{code}{"-p" if punch else ""}-{f}.png')
print('wrote', code, 'punch' if punch else '', CW, H)

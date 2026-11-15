# The Argentinian holding a mate and a thermos (pancho/ar-mate), for the versus reels (2026-11-07).
# Gemini redrew his arms on a magenta copy of pancho/ar-arm/ar-closed.png (padded 100 px left/right, 30 px top/bottom).
# Each sprite = that new body, with the head of the matching ar-arm mouth sprite laid over it (feathered at the neck),
# so the seven mouths, the eye rig and the size stay exactly those of ar-arm.
# Usage: python3 mate-sprites.py <gemini image> [out folder]
import sys, numpy as np
from PIL import Image, ImageFilter

SRC = 'public/pancho/ar-arm/ar'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'public/pancho/ar-mate'
W, H = 632, 1069
PAD_X, PAD_Y = 100, 30
NECK = (285, 335)  # rows (sprite px) over which the old head fades into the new body

g = Image.open(sys.argv[1]).convert('RGB').resize((W + 2 * PAD_X, H + 2 * PAD_Y), Image.LANCZOS)
a = np.asarray(g).astype(float)
r, gr, b = a[..., 0], a[..., 1], a[..., 2]
# magenta key: how far from (255,0,255); soft edge, then remove the pink spill on the rim
mag = np.minimum(r, b) - gr  # ~255 on the background, ~0 or below on the drawing
alpha = np.clip((150 - mag) / 60, 0, 1)
# despill everywhere: nothing in the drawing has red AND blue above green (fur is r>g>b, shirt b>g>r),
# so any such excess is magenta bleeding in from the background
spill = np.clip(np.minimum(r, b) - gr, 0, None)
a[..., 0] -= spill
a[..., 2] -= spill
body = np.dstack([np.clip(a, 0, 255), alpha * 255]).astype('uint8')
body = Image.fromarray(body).crop((PAD_X, PAD_Y, PAD_X + W, PAD_Y + H))
# shrink the alpha 1 px so no magenta rim survives
al = body.getchannel('A').filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.7))
body.putalpha(al)

ramp = np.clip((np.arange(H) - NECK[0]) / (NECK[1] - NECK[0]), 0, 1)[:, None]  # 0 = old head, 1 = new body
import os; os.makedirs(OUT, exist_ok=True)
for m in ['closed', 'half', 'a', 'e', 'i', 'o', 'u', 'open']:
    try: old = Image.open(f'{SRC}-{m}.png').convert('RGBA')
    except FileNotFoundError: continue
    o, n = np.asarray(old).astype(float) / 255, np.asarray(body).astype(float) / 255
    w = (1 - ramp)[:, :, None]  # weight of the old head, per row
    oa, na = o[..., 3:] * w, n[..., 3:]
    # old head over new body ("over" compositing with the old weighted by the ramp)
    outa = oa + na * (1 - oa)
    outc = (o[..., :3] * oa + n[..., :3] * na * (1 - oa)) / np.maximum(outa, 1e-6)
    Image.fromarray((np.dstack([outc, outa]) * 255).round().astype('uint8')).save(f'{OUT}/ar-{m}.png')
    print('wrote', f'{OUT}/ar-{m}.png')

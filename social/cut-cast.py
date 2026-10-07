# Cuts a "cast" (two capybaras drawn together) into the sprites the versus reel uses:
# one transparent PNG per capybara per mouth shape (closed, half, a, e, i, o, u),
# identical everywhere except around the mouth, plus the rig numbers for the reel.
#   python3 cut-cast.py <cast>          e.g.  python3 cut-cast.py mx-ar
#
# A cast is a folder of generated frames, all the same size and the same drawing:
#   ../../posta-videos/casts/<cast>/half.jpg    both mouths half open: the BASE every other frame was edited from
#   .../closed.jpg                              both mouths closed (or closed-l.jpg and closed-r.jpg, one per capybara)
#   .../a.jpg e.jpg i.jpg o.jpg u.jpg           both saying that vowel
#   .../cast.json (optional)                    {"out": "<folder in public/pancho>", "names": ["<left>", "<right>"],
#                                               "snout": [[x0, y0, x1, y1], [x0, y0, x1, y1]]}  (in frame pixels; found automatically if left out)
# Without cast.json the sprites go to public/pancho/<cast>/l-<shape>.png and r-<shape>.png.
#
# Why it is done this way (each of these was a visible fault before it was fixed):
# - Every shape starts from the base frame and takes only a soft-edged patch around the mouth
#   from its own frame. Generated frames differ slightly all over, so swapping whole frames shimmers.
# - The patch is only as big as what really changed, so the frame's other small differences stay out.
# - Inside the patch the fur is recoloured to the base frame's fur. Generated frames paint the snout
#   lighter or darker (the "o" and "u" ones shade its whole front), which flickers when mouths swap.
# - The closed frame's patch is held to the mouth area, and each patch's fur is levelled to the base at its rim.
# - Inside the patch the cut-out follows that frame's own outline: a wide "a" moves the snout's edge.
import json, os, sys
import numpy as np
from collections import deque
from PIL import Image, ImageFilter, ImageDraw

if len(sys.argv) < 2: sys.exit('usage: python3 cut-cast.py <cast>')
CAST = sys.argv[1]
SRC = f'../../posta-videos/casts/{CAST}'  # the generated frames, kept outside the repo
conf = json.load(open(f'{SRC}/cast.json')) if os.path.exists(f'{SRC}/cast.json') else {}
OUT = f"public/pancho/{conf.get('out', CAST)}"
NAMES = conf.get('names', ['l', 'r'])
VOWELS = ['a', 'e', 'i', 'o', 'u']
FEATHER = 16
SCALE = 0.7  # the reel draws them about 1000px tall; generated frames are 2752px

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
    """What is not background. The background must be the pale green the casts are drawn on;
    it is found by flooding in from the border, so pale colours inside the outlines are kept."""
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

def soft(m, radius):
    """A wide blur of a float image: three box blurs each way, which is close to a Gaussian."""
    for axis in (0, 1):
        for _ in range(3):
            pad = [(radius, radius) if a == axis else (0, 0) for a in (0, 1)]
            c = np.cumsum(np.pad(m, pad, mode='edge'), axis=axis, dtype=np.float64)
            c = np.concatenate([np.zeros_like(c.take([0], axis)), c], axis)
            n = m.shape[axis]
            m = ((c.take(range(2 * radius + 1, 2 * radius + 1 + n), axis) - c.take(range(0, n), axis)) / (2 * radius + 1)).astype(np.float32)
    return m

def fur(a):
    """Where an RGB array is fur: warm brown, lighter than the outlines and the inside of a mouth, and not tongue pink."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > 125) & (g - b > 18) & (r - g > 25) & (r - g < 76)  # the tongue is redder: r - g is about 90

def toned(src, base, box, radius=22):
    """`src` with the fur around the mouth pulled back to the colour it has in the base frame.
    The colour difference is measured only where both frames show fur, smoothed, and taken out of
    the fur of `src`; the mouth itself, its outlines and the tongue are left as drawn."""
    x0, y0, x1, y1 = (max(0, box[0] - 3 * radius), max(0, box[1] - 3 * radius), min(src.width, box[2] + 3 * radius), min(src.height, box[3] + 3 * radius))
    a = np.asarray(src.crop((x0, y0, x1, y1))).astype(np.float32); b = np.asarray(base.crop((x0, y0, x1, y1))).astype(np.float32)
    both = (fur(a) & fur(b)).astype(np.float32)
    weight = np.maximum(soft(both, radius), 1e-3)
    shade = np.stack([soft((a - b)[..., c] * both, radius) / weight for c in range(3)], -1)
    mine = soft(fur(a).astype(np.float32), 3)[..., None]  # only the fur is recoloured, with a soft edge
    out = src.copy(); out.paste(Image.fromarray(np.clip(a - shade * mine, 0, 255).astype('uint8')), (x0, y0))
    return out

def level(src, base, box, rim=34, radius=6):
    """`src` with the fur in and around `box` pulled to the base's colour wherever both frames show the same fur
    (a small difference, so not a moved outline, a tongue or the inside of a mouth). The difference is smoothed
    and spread into the mouth from the fur around it. Returns the image and the difference left at the rim of the
    box, where the patch fades into the base, judged side by side."""
    pad = 3 * radius
    X0, Y0, X1, Y1 = max(0, box[0] - pad), max(0, box[1] - pad), min(src.width, box[2] + pad), min(src.height, box[3] + pad)
    a = np.asarray(src.crop((X0, Y0, X1, Y1))).astype(np.float32); b = np.asarray(base.crop((X0, Y0, X1, Y1))).astype(np.float32)
    same = (fur(a) & fur(b) & (np.abs(a - b).max(-1) < 40)).astype(np.float32)
    weight = soft(same, radius)
    shade = np.stack([soft((a - b)[..., c] * same, radius) / np.maximum(weight, 1e-3) for c in range(3)], -1)
    shade *= np.clip(weight * 8, 0, 1)[..., None]  # no correction where there is no shared fur nearby to measure
    fixed = np.clip(a - shade * soft(fur(a).astype(np.float32), 3)[..., None], 0, 255)
    out = src.copy(); out.paste(Image.fromarray(fixed.astype('uint8')), (X0, Y0))
    x0, y0, x1, y1 = box[0] - X0, box[1] - Y0, box[2] - X0, box[3] - Y0
    fa, fb, ok = fixed[y0:y1, x0:x1], b[y0:y1, x0:x1], same[y0:y1, x0:x1] > 0
    left = 0.0
    for part in (np.s_[:rim], np.s_[-rim:], np.s_[:, :rim], np.s_[:, -rim:]):
        m = ok[part]
        if m.sum() > 80: left = max(left, float(np.abs((fa - fb)[part][m].mean(0)).max()))
    return out, left

def changed(src, base, box, margin=30):
    """The part of `box` where `src` really differs from the base (the mouth itself), with a margin."""
    x0, y0, x1, y1 = box
    d = np.abs(np.asarray(src.crop(box)).astype(int) - np.asarray(base.crop(box)).astype(int)).max(-1) > 40
    d = np.asarray(Image.fromarray((d * 255).astype('uint8')).filter(ImageFilter.MedianFilter(9))) > 0
    ys, xs = np.nonzero(d)
    if not len(ys): return None
    return (max(x0, x0 + xs.min() - margin), max(y0, y0 + ys.min() - margin), min(x1, x0 + xs.max() + margin), min(y1, y0 + ys.max() + margin))

frames = {}
def frame(f):
    if f not in frames: frames[f] = Image.open(f'{SRC}/{f}').convert('RGB')
    return frames[f]
def closed_of(side):  # side 0 = left, 1 = right
    own = f"closed-{'lr'[side]}.jpg"
    return own if os.path.exists(f'{SRC}/{own}') else 'closed.jpg'

base = frame('half.jpg')
for f in [closed_of(0), closed_of(1)] + [v + '.jpg' for v in VOWELS]:
    if frame(f).size != base.size: sys.exit(f'{f} is {frame(f).size}, the base is {base.size}: every frame must be the same size')

# One silhouette for the whole cast, from the frames where the snouts are at rest.
union = Image.fromarray(np.max([np.asarray(alpha_of(frame(f))) for f in dict.fromkeys([closed_of(0), closed_of(1), 'half.jpg'])], axis=0))
labels = two_bodies(union)
os.makedirs(OUT, exist_ok=True)
rigs = {}; worst = {}
for side, name in enumerate(NAMES):
    mine = Image.fromarray(((labels == side + 1) * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5)).resize(union.size, Image.BILINEAR)
    ys, xs = np.nonzero(np.asarray(mine) > 128)
    box = (max(0, xs.min() - 12), max(0, ys.min() - 12), min(union.width, xs.max() + 12), min(union.height, ys.max() + 12))
    alpha = Image.fromarray(np.minimum(np.asarray(union), np.asarray(mine)))
    # The snout: the area, in the top half of this capybara, where any frame differs from the base.
    head = (box[0], box[1], box[2], box[1] + (box[3] - box[1]) // 2)
    sources = {'closed': closed_of(side), 'half': 'half.jpg', **{v: v + '.jpg' for v in VOWELS}}
    found = [changed(frame(f), base, head, margin=30) for f in sources.values() if f != 'half.jpg']
    found = [b for b in found if b]
    if not found: sys.exit(f'{name}: no frame differs from the base around the mouth')
    snout = (min(b[0] for b in found), min(b[1] for b in found), max(b[2] for b in found), max(b[3] for b in found))
    if 'snout' in conf: snout = tuple(conf['snout'][side])
    print(name, 'snout', tuple(int(v) for v in snout))
    # The closed frame may only replace the mouth: generated "closed" frames often repaint the whole face
    # (seen on es-ar: the listener's face went darker), so its patch is held inside the area the vowels use.
    vowel_boxes = [b for b in (changed(toned(frame(v + '.jpg'), base, snout), base, snout) for v in VOWELS) if b]
    mouth_area = (min(b[0] for b in vowel_boxes), min(b[1] for b in vowel_boxes), max(b[2] for b in vowel_boxes), max(b[3] for b in vowel_boxes)) if vowel_boxes else snout
    for shape, f in sources.items():
        src = toned(frame(f), base, snout)
        patch = Image.new('L', base.size, 0)
        tight = changed(src, base, snout)
        if tight and shape == 'closed':
            tight = (max(tight[0], mouth_area[0]), max(tight[1], mouth_area[1]), min(tight[2], mouth_area[2]), min(tight[3], mouth_area[3]))
        if tight:
            src, left = level(src, base, tight)
            worst[f'{name} {shape}'] = left
        if tight: ImageDraw.Draw(patch).rounded_rectangle(tight, radius=60, fill=255)
        patch = patch.filter(ImageFilter.GaussianBlur(FEATHER))
        cut = Image.composite(src, base, patch).convert('RGBA')
        own = Image.fromarray(np.minimum(np.asarray(alpha_of(src)), np.asarray(mine)))
        cut.putalpha(Image.composite(own, alpha, patch)); cut = cut.crop(box)
        cut = cut.resize((round(cut.width * SCALE), round(cut.height * SCALE)), Image.LANCZOS)
        cut.save(f'{OUT}/{name}-{shape}.png'); print(name, shape, cut.size, 'mouth', tuple(int(v) for v in tight) if tight else None)

    # The rig: where the eye is and what colour the fur around it is, in the sprite's own pixels.
    sprite = np.asarray(Image.open(f'{OUT}/{name}-closed.png').convert('RGBA')).astype(int)
    H, W = sprite.shape[:2]
    top = sprite[:int(H * 0.22)]
    white = (top[..., 0] > 235) & (top[..., 1] > 235) & (top[..., 2] > 230) & (top[..., 3] > 250)
    ys, xs = np.nonzero(white)
    if not len(ys): print(f'  {name}: no eye found; set the rig by hand'); continue
    x0, x1, y0, y1 = xs.min() - 22, xs.max() + 22, ys.min() - 22, ys.max() + 22
    reg = sprite[max(0, y0):y1, max(0, x0):x1]
    dy, dx = np.nonzero((reg[..., :3].sum(-1) < 230) & (reg[..., 3] > 250))
    ex0, ex1, ey0, ey1 = max(0, x0) + dx.min(), max(0, x0) + dx.max(), max(0, y0) + dy.min(), max(0, y0) + dy.max()
    below = sprite[min(H - 1, ey1 + 18):min(H, ey1 + 48), ex0:ex1, :3].reshape(-1, 3)
    below = below[fur(below[None])[0]] if len(below) else below
    colour = '#%02X%02X%02X' % tuple(int(v) for v in np.median(below, 0)) if len(below) else '#C0804E'
    rigs[name] = {'size': [W, H], 'eye': [int((ex0 + ex1) // 2), int((ey0 + ey1) // 2), int((ex1 - ex0) // 2), int((ey1 - ey0) // 2)], 'fur': colour}

json.dump(rigs, open(f'{OUT}/rig.json', 'w'), indent=1)

# The fur where each mouth patch meets the base must match it, or the face changes shade as mouths swap.
off = {k: v for k, v in worst.items() if v > 2}
print('fur match at the patch rims: worst %.1f levels' % max(worst.values(), default=0), '(ok)' if not off else f'TOO FAR OFF: {off}; regenerate those frames')

# A sheet of every mouth, close up, to look at before using the cast: out of place colours, torn edges and
# mouths that do not look like their vowel all show here.
shapes = ['closed', 'half'] + VOWELS
sheet = Image.new('RGB', (len(shapes) * 300, len(NAMES) * 300), (189, 225, 203))
for row, name in enumerate(NAMES):
    if name not in rigs: continue
    W, H = rigs[name]['size']; ex, ey = rigs[name]['eye'][:2]
    x0 = min(max(0, ex - 230), W - 460); y0 = max(0, ey - 120)
    for col, shape in enumerate(shapes):
        im = Image.open(f'{OUT}/{name}-{shape}.png').crop((x0, y0, x0 + 460, y0 + 460)).resize((300, 300))
        sheet.paste(im, (col * 300, row * 300), im)
sheet.save(f'{OUT}/check.jpg', quality=88)
print('look at', f'{OUT}/check.jpg', '(columns: ' + ', '.join(shapes) + ')')
print('\nrig (also saved to ' + f'{OUT}/rig.json' + '); paste into the reel in src/versus/reels.mjs:')
for name, r in rigs.items(): print(f"  sprite: '{os.path.basename(OUT)}/{name}', rig: {{size: {r['size']}, eye: {r['eye']}, fur: '{r['fur']}'}}")

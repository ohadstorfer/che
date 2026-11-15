# Cuts Pancho into puppet layers. Every source is a Gemini edit of ONE base drawing, and Gemini
# keeps every pixel it was not asked to change, so a part is simply "what this edit changed".
#   python3 rig/cut-rig.py            (run from social/)
#
# Sources (generated, kept out of the repo) in ../.course-work/pancho-rig/gen/, prompts in rig/poses.json:
#   base-1.jpg          full Pancho, arms hanging loose (the master every edit starts from)
#   body-noarms-1.jpg   base with the arms removed -> the body layer
#   <pose>.jpg          base with one thing changed (an arm, the eye, the mouth)
# Output in public/pancho/rig/: one cropped PNG per layer and rig.json (where each crop sits on the base canvas).
#
# Layers, back to front: body, eye group, mouth group, arm-b group, arm-a group.
#   arms: the arm is what the pose has that the armless body does not (minus the other arm, which did not move)
#   eye / mouth: a soft patch around what changed against the base, taken from the pose
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

GEN = '../.course-work/pancho-rig/gen'
OUT = 'public/pancho/rig'
os.makedirs(OUT, exist_ok=True)

GROUPS = {
    'arm-a': ['rest', 'a-mid', 'point-ul', 'point-l', 'point-dl', 'a-up', 'a-finger'],
    'arm-b': ['rest', 'b-mid', 'b-open'],
    'eye': ['eye-closed', 'eye-half', 'eye-cam', 'brow-up', 'happy'],
    'mouth': ['m-half', 'm-a', 'm-e', 'm-i', 'm-o', 'm-u'],
}
HEAD_BOTTOM = 1150  # face changes never reach below this line (base pixels)
# Where each arm joins the body (base pixels), measured from where all of an arm's poses overlap.
# The puppet turns an arm around this point when it moves between two drawings.
PIVOT = {'arm-a': (500, 1190), 'arm-b': (1140, 1330)}

def load(name):
    return np.asarray(Image.open(f'{GEN}/{name}.jpg').convert('RGB')).astype(np.float32)

def cutout(img, bg):
    """Alpha for a drawing on a flat background: flood the background in from the border,
    soften the rim by colour distance, and take the background's tint back out of the rim."""
    dist = np.sqrt(((img - bg) ** 2).sum(-1))
    lab, _ = ndi.label(dist < 26)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fig = ndi.binary_fill_holes(~np.isin(lab, edge[edge > 0]))
    alpha = fig.astype(np.float32)
    rim = fig & ~ndi.binary_erosion(fig, iterations=2)
    alpha[rim] = np.clip((dist[rim] - 6) / 30, 0, 1)
    a = alpha[..., None]
    rgb = np.where(a > 0.02, (img - (1 - a) * bg) / np.maximum(a, 0.02), 0)
    return np.clip(rgb, 0, 255), alpha

def changed(a, b, thr=30, blur=2):
    return ndi.gaussian_filter(np.abs(a - b).max(-1), blur) > thr

def clean(mask, open_it=3, close_it=6):
    mask = ndi.binary_opening(mask, iterations=open_it)
    mask = ndi.binary_closing(mask, iterations=close_it)
    return ndi.binary_fill_holes(mask)

def biggest(mask, n=1):
    lab, k = ndi.label(mask)
    if k == 0: return mask
    sizes = ndi.sum(mask, lab, range(1, k + 1))
    return np.isin(lab, np.argsort(sizes)[::-1][:n] + 1)

def save(name, rgb, alpha):
    ys, xs = np.nonzero(alpha > 0.01)
    H, W = alpha.shape
    y0, y1, x0, x1 = max(ys.min() - 4, 0), min(ys.max() + 5, H), max(xs.min() - 4, 0), min(xs.max() + 5, W)
    rgba = np.dstack([rgb, alpha[..., None] * 255])[y0:y1, x0:x1].astype(np.uint8)
    Image.fromarray(rgba).save(f'{OUT}/{name}.png', optimize=True)
    return {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0)}

base, body = load('base-1'), load('body-noarms-1')
border = np.concatenate([base[:8].reshape(-1, 3), base[:, :8].reshape(-1, 3), base[:, -8:].reshape(-1, 3)])
bg = np.median(border, axis=0)
base_rgb, base_a = cutout(base, bg)
body_rgb, body_a = cutout(body, bg)
H, W = base_a.shape
rig = {'canvas': [W, H], 'order': ['body', 'eye', 'mouth', 'arm-b', 'arm-a'], 'layers': {}}
rig['layers']['body'] = {'body': save('body', body_rgb, body_a)}

# The resting arms: where base and the armless body disagree. Left one is arm-a.
rest = clean(changed(base, body) & (base_a > 0.5))
two = biggest(rest, 2)
lab, _ = ndi.label(two)
ids = sorted([i for i in np.unique(lab) if i], key=lambda i: np.nonzero(lab == i)[1].mean())
rest_mask = {'arm-a': lab == ids[0], 'arm-b': lab == ids[1]}

def arm_alpha(fig_a, mask):
    m = ndi.binary_dilation(mask, iterations=3)
    soft = ndi.gaussian_filter(m.astype(np.float32), 1.5)  # soft where the arm meets the torso
    return np.minimum(fig_a, np.clip(soft * 1.4, 0, 1))

for group in ['arm-a', 'arm-b']:
    other = ndi.binary_dilation(rest_mask['arm-b' if group == 'arm-a' else 'arm-a'], iterations=12)
    rig['layers'][group] = {}
    for pose in GROUPS[group]:
        if pose == 'rest':
            rgb, a = base_rgb, arm_alpha(base_a, rest_mask[group])
        else:
            img = load(pose)
            rgb, fa = cutout(img, bg)
            m = biggest(clean(changed(img, body) & (fa > 0.5) & ~other))
            a = arm_alpha(fa, m)
        info = save(f'{group}-{pose}', rgb, a)
        # the arm's direction: from the shoulder to the farthest point of the drawing (the hand)
        ys, xs = np.nonzero(a > 0.5)
        px, py = PIVOT[group]
        far = np.argmax((xs - px) ** 2 + (ys - py) ** 2)
        info['angle'] = round(float(np.degrees(np.arctan2(ys[far] - py, xs[far] - px))), 1)
        info['hand'] = [int(xs[far]), int(ys[far])]
        rig['layers'][group][pose] = info
    rig['pivot'] = rig.get('pivot', {}) | {group: list(PIVOT[group])}

for group in ['eye', 'mouth']:
    rig['layers'][group] = {}
    for pose in GROUPS[group]:
        img = load(pose)
        rgb, fa = cutout(img, bg)
        m = changed(img, base, thr=24) & ((fa > 0.5) | (base_a > 0.5))
        m[HEAD_BOTTOM:] = False
        m = biggest(clean(m, 2, 10), 2)
        m = ndi.binary_dilation(m, iterations=14)
        soft = ndi.gaussian_filter(m.astype(np.float32), 6)
        # inside the figure: a feathered patch; on the rim: the pose's own outline (a wide mouth moves the chin)
        a = np.where(fa > 0.99, np.clip(soft * 1.6, 0, 1), np.minimum(fa, np.clip(soft * 3, 0, 1)))
        rig['layers'][group][pose] = save(f'{group}-{pose}', rgb, a)

json.dump(rig, open(f'{OUT}/rig.json', 'w'), indent=1)
print(json.dumps({g: list(v) for g, v in rig['layers'].items()}))

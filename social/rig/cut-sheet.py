# Cuts the Panchos out of a Gemini sheet (several frames drawn in one image), lines them up
# and writes them as frames + an animated preview.
#   python3 rig/cut-sheet.py <sheet.jpg> <out-dir> [frames per drawing=2] [order like 0,1,2,...]
# Lining up: every figure is moved so its feet sit on the same spot (bottom centre of the two feet),
# because Gemini draws the cells a few pixels apart and that shows as jitter.
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, out = sys.argv[1], sys.argv[2]
hold = int(sys.argv[3]) if len(sys.argv) > 3 else 2
os.makedirs(out, exist_ok=True)
img = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
bg = np.median(np.concatenate([img[:6].reshape(-1, 3), img[:, :6].reshape(-1, 3)]), axis=0)
dist = np.sqrt(((img - bg) ** 2).sum(-1))
fig = ndi.binary_fill_holes(ndi.binary_closing(dist > 30, iterations=3))
lab, n = ndi.label(fig)
sizes = ndi.sum(fig, lab, range(1, n + 1))
big = [i + 1 for i in np.argsort(sizes)[::-1] if sizes[i] > sizes.max() * 0.3]
boxes = [ndi.find_objects((lab == k).astype(int))[0] for k in big]
# reading order: rows (by top, grouped), then left to right
boxes.sort(key=lambda b: (round(b[0].start / (img.shape[0] / 6)), b[1].start))
if len(sys.argv) > 4: boxes = [boxes[int(i)] for i in sys.argv[4].split(',')]

def feet(mask):
    ys, xs = np.nonzero(mask)
    bottom = ys.max()
    low = xs[ys > bottom - (bottom - ys.min()) * 0.08]
    return (low.min() + low.max()) / 2, bottom

def body_height(mask, fx, fy):
    """Feet to the top of the head, measured only on the snout side of the feet, where the moving arm
    (on the other side) never reaches. Gemini draws the cells a few % bigger or smaller: this evens them."""
    ys, xs = np.nonzero(mask[:, :int(fx)])
    return fy - ys.min()

info = []
for b in boxes:
    m = (lab[b] > 0)
    fx, fy = feet(m)
    info.append((b, m, fx, fy, body_height(m, fx, fy)))
target = float(np.median([h for *_, h in info]))
H = int(max(b[0].stop - b[0].start for b in boxes) * 1.1) + 60
W = int(max(b[1].stop - b[1].start for b in boxes) * 1.1) + 160
frames = []
for i, (b, m, fx, fy, bh) in enumerate(info):
    k = target / bh
    crop = Image.fromarray(img[b].astype(np.uint8))
    crop = crop.resize((round(crop.width * k), round(crop.height * k)), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), tuple(int(v) for v in bg))
    canvas.paste(crop, (int(W / 2 - fx * k), int(H - 30 - fy * k)))
    print(f'frame {i}: scaled {k:.3f}')
    canvas.save(f'{out}/f{i:02d}.png')
    frames.append(canvas)
seq = frames + frames[::-1][1:-1]  # there and back, so the preview loops
seq[0].save(f'{out}/preview.gif', save_all=True, append_images=seq[1:], duration=int(1000 / 30 * hold), loop=0)
print(len(frames), 'frames', W, 'x', H)

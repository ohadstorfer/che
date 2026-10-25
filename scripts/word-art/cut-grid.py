#!/usr/bin/env python3
"""Cut a Gemini sticker sheet of word pictures into one figure per word.

Each Gemini request draws up to 9 objects on a 3x3 white sheet, so one
generation serves nine words. This finds the objects on the sheet, orders them
row by row, and runs the culture cut-out ('plain') on each one.

    python3 scripts/word-art/cut-grid.py grid.png juice,coffee,medialuna,...

Writes assets/images/words/<concept>.webp. Then run scripts/word-art/build-map.mjs.
Stops if the sheet holds a different number of objects than concepts given,
because then the order can't be trusted.
"""
import importlib.util
import os
import sys
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
spec = importlib.util.spec_from_file_location('cutout_figure', os.path.join(ROOT, 'scripts/cutout-figure.py'))
cf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cf)

OUT = os.path.join(ROOT, 'assets/images/words')


def objects(a):
    """Bounding boxes of the drawings on the sheet, row by row."""
    ink = a.min(axis=2) < 225
    ink = ndimage.binary_dilation(ink, iterations=6)
    ink = ndimage.binary_fill_holes(ink)
    lab, n = ndimage.label(ink)
    boxes = ndimage.find_objects(lab)
    sizes = ndimage.sum(ink, lab, range(1, n + 1))
    big = sizes.max() if n else 0
    # Steam, crumbs and sparkles float apart from their object; a real object
    # is never far smaller than the biggest one on the sheet.
    keep = [b for b, s in zip(boxes, sizes) if s >= 0.08 * big]
    # Steam that floats above a cup is its own blob: merge any small blob into
    # the box it sits on top of.
    keep = merge_close(keep, a.shape[0] * 0.04)
    cy = [(b[0].start + b[0].stop) / 2 for b in keep]
    rows, order = [], sorted(range(len(keep)), key=lambda i: cy[i])
    for i in order:
        if rows and abs(cy[i] - np.mean([cy[j] for j in rows[-1]])) < a.shape[0] / 8:
            rows[-1].append(i)
        else:
            rows.append([i])
    return [keep[i] for row in rows for i in sorted(row, key=lambda i: keep[i][1].start)]


def merge_close(boxes, gap):
    boxes = [[b[0].start, b[0].stop, b[1].start, b[1].stop] for b in boxes]
    median = np.median([(b[1] - b[0]) * (b[3] - b[2]) for b in boxes]) if boxes else 0
    merged = True
    while merged:
        merged = False
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                a, b = boxes[i], boxes[j]
                ox = min(a[3], b[3]) - max(a[2], b[2])
                oy = max(a[0], b[0]) - min(a[1], b[1])
                small = min((a[1] - a[0]) * (a[3] - a[2]), (b[1] - b[0]) * (b[3] - b[2])) < 0.3 * median
                if small and ox > 0 and oy < gap:
                    boxes[i] = [min(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), max(a[3], b[3])]
                    del boxes[j]
                    merged = True
                    break
            if merged:
                break
    return [(slice(y0, y1), slice(x0, x1)) for y0, y1, x0, x1 in boxes]


def main(src, names):
    img = Image.open(src).convert('RGB')
    a = np.asarray(img)
    boxes = objects(a)
    if len(boxes) != len(names):
        sys.exit(f'{src}: found {len(boxes)} objects for {len(names)} concepts — check the sheet by eye')
    os.makedirs(OUT, exist_ok=True)
    pad = 14
    with tempfile.TemporaryDirectory() as tmp:
        for (ys, xs), name in zip(boxes, names):
            box = (max(xs.start - pad, 0), max(ys.start - pad, 0),
                   min(xs.stop + pad, img.width), min(ys.stop + pad, img.height))
            cell = os.path.join(tmp, name + '.png')
            img.crop(box).save(cell)
            cf.OUT_DIR = OUT
            cf.cutout(cell, name, 'plain')
            png = os.path.join(OUT, name + '.png')
            Image.open(png).save(os.path.join(OUT, name + '.webp'), quality=82, method=6)
            os.remove(png)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], [n.strip() for n in sys.argv[2].split(',') if n.strip()])

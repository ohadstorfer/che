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


def objects(a, n):
    """Bounding boxes of the n drawings on the sheet, row by row.

    A drawing can come in pieces: steam over a cup, "Zzz" over a sleeper,
    snowflakes around someone cold. The n biggest pieces are the drawings;
    every other piece joins the drawing it floats nearest to."""
    ink = a.min(axis=2) < 225
    ink = ndimage.binary_dilation(ink, iterations=6)
    ink = ndimage.binary_fill_holes(ink)
    lab, count = ndimage.label(ink)
    if count < n:
        return []
    boxes = ndimage.find_objects(lab)
    sizes = ndimage.sum(ink, lab, range(1, count + 1))
    order = sorted(range(count), key=lambda i: -sizes[i])
    anchors, rest = order[:n], order[n:]
    # A drawing is never far smaller than the others; if the n-th biggest
    # piece is, two pieces of one drawing were taken for two drawings.
    if sizes[anchors[-1]] < 0.2 * np.median([sizes[i] for i in anchors]):
        return []
    centre = lambda b: ((b[0].start + b[0].stop) / 2, (b[1].start + b[1].stop) / 2)
    reach = max(a.shape) / 3 * 0.6
    box = {i: [boxes[i][0].start, boxes[i][0].stop, boxes[i][1].start, boxes[i][1].stop] for i in anchors}
    for i in rest:
        if sizes[i] < 0.0005 * ink.size:
            continue
        cy, cx = centre(boxes[i])
        near = min(anchors, key=lambda j: np.hypot(cy - centre(boxes[j])[0], cx - centre(boxes[j])[1]))
        if np.hypot(cy - centre(boxes[near])[0], cx - centre(boxes[near])[1]) > reach:
            continue
        b = box[near]
        box[near] = [min(b[0], boxes[i][0].start), max(b[1], boxes[i][0].stop),
                     min(b[2], boxes[i][1].start), max(b[3], boxes[i][1].stop)]
    keep = [(slice(b[0], b[1]), slice(b[2], b[3])) for b in box.values()]
    cy = [(b[0].start + b[0].stop) / 2 for b in keep]
    rows, by_y = [], sorted(range(len(keep)), key=lambda i: cy[i])
    for i in by_y:
        if rows and abs(cy[i] - np.mean([cy[j] for j in rows[-1]])) < a.shape[0] / 8:
            rows[-1].append(i)
        else:
            rows.append([i])
    return [keep[i] for row in rows for i in sorted(row, key=lambda i: keep[i][1].start)]


def drop_ghosts(path):
    """Removes the loose pieces with no outline in them. Kept low, the piece
    threshold keeps a "Zzz" or a snowflake, but also slivers of the sticker's
    pale shadow; only real drawing has the dark-brown outline."""
    img = Image.open(path).convert('RGBA')
    a = np.asarray(img).astype(np.float32)
    solid = a[..., 3] > 128
    lab, count = ndimage.label(solid)
    if count < 2:
        return img
    lum = a[..., :3].mean(axis=2)
    keep = np.zeros_like(solid)
    for i in range(1, count + 1):
        piece = lab == i
        if (lum[piece] < 110).sum() >= 12:
            keep |= piece
    keep = ndimage.binary_dilation(keep, iterations=3)
    a[..., 3] = np.where(keep, a[..., 3], 0)
    out = Image.fromarray(a.astype(np.uint8))
    return out.crop(out.getbbox() or (0, 0, out.width, out.height))


def main(src, names):
    img = Image.open(src).convert('RGB')
    a = np.asarray(img)
    boxes = objects(a, len(names))
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
            cf.KEEP_PIECES = 0.015
            cf.cutout(cell, name, 'plain')
            png = os.path.join(OUT, name + '.png')
            drop_ghosts(png).save(os.path.join(OUT, name + '.webp'), quality=82, method=6)
            os.remove(png)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], [n.strip() for n in sys.argv[2].split(',') if n.strip()])

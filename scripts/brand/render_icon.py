"""Render Posta's app icon and its store/platform variants.

The design is artboard "34 · Icon: face and mate, sticker" on the design
canvas (https://claude.ai/artifact/G4beWfxvd6tkDrVbPWfjw2): a 440×440 green
square, a lighter green hill, and the mate capybara with a bone sticker
outline. The geometry below is copied from that artboard, in its 440-unit
coordinates, and redrawn at full resolution from the original Canva art
(assets/images/mascot/canva/mate.jpg), cut out of its white background here.

    python3 scripts/brand/render_icon.py

Writes:
  assets/images/icon.png                       1024 iOS / store icon (no alpha)
  assets/images/android-icon-background.png    adaptive icon: green + hill
  assets/images/android-icon-foreground.png    adaptive icon: the capybara
  assets/images/android-icon-monochrome.png    themed icon: line art only
  assets/images/splash-icon.png                splash: rounded icon
  assets/images/favicon.png, public/icon-192.png, public/icon-512.png
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parents[2]
IMG = ROOT / "assets/images"

GREEN = (62, 86, 65)  # #3E5641, the app's primary
HILL = (92, 117, 96)  # #5C7560
BONE = (241, 238, 230)  # #F1EEE6

FRAME = 440  # the artboard, in design units
HILL_BOX = (-39, 162, 921, 470)  # left, top, width, height
FIG_BOX = (-42, 69, 493, 591)  # the <img> box; the art is contained in it
OUTLINE = 6  # the sticker border
SHADOW_Y, SHADOW_A = 8, 0.22


def cutout() -> Image.Image:
    """The Canva capybara without its white background, cropped to him."""
    a = np.array(Image.open(IMG / "mascot/canva/mate.jpg").convert("RGB")).astype(int)
    white = a.min(axis=2) > 232
    lab, _ = nd.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = nd.binary_opening(~np.isin(lab, list(edge)), iterations=1)
    alpha = nd.gaussian_filter(fg.astype(float), 0.7)
    im = Image.fromarray(np.dstack([a, alpha * 255]).astype("uint8"))
    return im.crop(im.getbbox())


def figure_rect(art: Image.Image):
    """object-fit: contain inside FIG_BOX."""
    left, top, w, h = FIG_BOX
    s = min(w / art.width, h / art.height)
    fw, fh = art.width * s, art.height * s
    return left + (w - fw) / 2, top + (h - fh) / 2, fw, fh


def disk(r: int) -> np.ndarray:
    y, x = np.ogrid[-r : r + 1, -r : r + 1]
    return x * x + y * y <= r * r


def layers(art: Image.Image, origin: float, extent: float, px: int):
    """Background (green + hill) and foreground (capybara + sticker) for the
    design-unit window [origin, origin + extent] drawn at `px` pixels."""
    k = px / extent
    to = lambda v: (v - origin) * k  # noqa: E731

    bg = Image.new("RGBA", (px, px), GREEN + (255,))
    hl, ht, hw, hh = HILL_BOX
    ss = 4  # supersample the ellipse edge
    big = Image.new("L", (px * ss, px * ss), 0)
    ImageDraw.Draw(big).ellipse(
        [to(hl) * ss, to(ht) * ss, to(hl + hw) * ss, to(ht + hh) * ss], fill=255
    )
    hill = Image.new("RGBA", (px, px), HILL + (255,))
    bg.paste(hill, (0, 0), big.resize((px, px), Image.LANCZOS))

    fx, fy, fw, fh = figure_rect(art)
    fig = art.resize((round(fw * k), round(fh * k)), Image.LANCZOS)
    # Paste with clipping: the figure runs off the bottom of the frame.
    canvas = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    canvas.paste(fig, (round(to(fx)), round(to(fy))), fig)
    a = np.array(canvas)[:, :, 3].astype(float) / 255

    r = max(1, round(OUTLINE * k))
    sticker = nd.binary_dilation(a > 0.5, structure=disk(r))
    sticker = nd.gaussian_filter(sticker.astype(float), 0.8)
    sticker = np.maximum(sticker, a)

    fg = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    dy = round(SHADOW_Y * k)
    shadow = np.zeros_like(sticker)
    shadow[dy:] = sticker[:-dy] if dy else sticker
    fg.alpha_composite(Image.fromarray(np.dstack([np.zeros((px, px, 3)), shadow * SHADOW_A * 255]).astype("uint8")))
    fg.alpha_composite(Image.fromarray(np.dstack([np.full((px, px, 3), BONE), sticker * 255]).astype("uint8")))
    fg.alpha_composite(canvas)
    return bg, fg, canvas


def rounded(im: Image.Image, frac=0.2237) -> Image.Image:
    ss = 4
    m = Image.new("L", (im.width * ss, im.height * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, m.width - 1, m.height - 1], radius=m.width * frac, fill=255)
    out = im.convert("RGBA")
    out.putalpha(m.resize(im.size, Image.LANCZOS))
    return out


def main():
    art = cutout()

    # The icon: exactly the artboard.
    bg, fg, _ = layers(art, 0, FRAME, 1024)
    icon = bg.copy()
    icon.alpha_composite(fg)
    icon.convert("RGB").save(IMG / "icon.png")

    # Android adaptive: the layers are 108dp and the launcher shows the middle
    # 72dp, so the artboard fills that middle and the scene carries on past it.
    pad = FRAME * (108 / 72 - 1) / 2
    abg, afg, acanvas = layers(art, -pad, FRAME + 2 * pad, 1024)
    abg.convert("RGB").save(IMG / "android-icon-background.png")
    afg.save(IMG / "android-icon-foreground.png")

    # Themed (monochrome) icon: only his dark line art, in white.
    rgb = np.array(acanvas)[:, :, :3].astype(float)
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    lines = np.clip((95 - lum) / 35, 0, 1) * (np.array(acanvas)[:, :, 3] / 255)
    Image.fromarray(np.dstack([np.full((1024, 1024, 3), 255), lines * 255]).astype("uint8")).save(
        IMG / "android-icon-monochrome.png"
    )

    rounded(icon.resize((512, 512), Image.LANCZOS)).save(IMG / "splash-icon.png")
    icon.convert("RGB").resize((96, 96), Image.LANCZOS).save(IMG / "favicon.png")
    icon.convert("RGB").resize((192, 192), Image.LANCZOS).save(ROOT / "public/icon-192.png")
    icon.convert("RGB").resize((512, 512), Image.LANCZOS).save(ROOT / "public/icon-512.png")


if __name__ == "__main__":
    main()

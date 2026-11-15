# The "tourist" capybara: Pancho waving with no shirt (public/pancho/saludando.png, mirrored so he
# faces right) with the Argentinian capybara's head (public/pancho/ar-arm/ar-<shape>.png without its redrawn elbow, mirrored),
# cut off at the collar, so the seven approved mouths come with it. 2026-11-05, at the user's request.
# Writes public/pancho/tourist/l-<shape>.png and check.jpg.
from PIL import Image, ImageOps, ImageFilter, ImageDraw
P = 'public/pancho/'
S, TX, TY = 1.12, 45, 11  # mirrored ar -> mirrored saludando (eye and nostril line up)
body = ImageOps.mirror(Image.open(P + 'saludando.png').convert('RGBA'))
# the head, in mirrored-ar pixels: everything above the shirt collar, left of his raised arm
poly = [(-50, -30), (480, -30), (480, 300), (355, 300), (300, 366), (60, 286), (-50, 286)]
mask = Image.new('L', body.size, 0)
ImageDraw.Draw(mask).polygon([(x * S + TX, y * S + TY) for x, y in poly], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(10))
SHAPES = ['closed', 'half', 'a', 'e', 'i', 'o', 'u']
out = {}
for sh in SHAPES:
    ar = Image.open(P + f'ar-arm/ar-{sh}.png').convert('RGBA')
    ar = ImageOps.mirror(ar.crop((0, 0, 543, ar.height)))  # the body only: the same pixels as the deleted versus/ar
    ar = ar.resize((round(ar.width * S), round(ar.height * S)), Image.LANCZOS)
    head = Image.new('RGBA', body.size, (0, 0, 0, 0)); head.paste(ar, (TX, TY))
    img = Image.composite(head, body, mask)  # inside the mask his head replaces Pancho's, transparency included
    img.save(P + f'tourist/l-{sh}.png'); out[sh] = img
sheet = Image.new('RGB', (300 * 7, 520), (190, 225, 205))
for k, sh in enumerate(SHAPES):
    c = out[sh].crop((60, 0, 560, 520)).resize((300, 312))
    sheet.paste(c, (300 * k, 0), c)
big = out['half'].resize((384, 576)); sheet.paste(big, (0, 0) if False else (900, 0), big) if False else None
sheet.save(P + 'tourist/check.jpg')

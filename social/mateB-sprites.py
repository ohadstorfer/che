# Version B of the Argentinian with a mate (pancho/ar-mateB, 2026-11-07): the ORIGINAL drawing (pancho/ar-arm),
# holding the mate and the thermos of the app's mate picture (public/pancho/mate.png) with his own hands:
# the objects are rebuilt whole (the app's paws removed), laid over his body, and his own fist / paw redrawn on top.
import numpy as np, os, sys
from PIL import Image, ImageDraw, ImageFilter
S = sys.argv[1] if len(sys.argv) > 1 else None  # optional folder for check images
app = Image.open('public/pancho/mate.png').convert('RGBA'); A = np.asarray(app).astype(float); AH, AW = A.shape[:2]
def poly_mask(size, pts, blur=0):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).polygon(pts, fill=255)
    if blur: m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(m).astype(float) / 255

# --- the gourd: right half is clean, the app's paw hides the left half -> mirror it
CX = 262
gourd_r = [(268, 420), (330, 424), (352, 440), (362, 458), (375, 500), (378, 550), (364, 602), (334, 634), (290, 650), (262, 653)]
gourd = gourd_r + [(2 * CX - x, y) for x, y in reversed(gourd_r)]
straw = [(283, 446), (284, 420), (318, 352), (345, 345), (354, 358), (303, 448)]
paw_g = [(122, 498), (150, 494), (205, 500), (238, 518), (246, 560), (240, 625), (220, 650), (160, 648), (124, 615), (118, 560)]
G = A.copy()
pm = poly_mask((AW, AH), paw_g) > 0
for y, x in zip(*np.nonzero(pm)):
    mx = 2 * CX - x
    if 0 <= mx < AW: G[y, x] = A[y, mx]
ga = np.maximum(poly_mask((AW, AH), gourd, 0.8), poly_mask((AW, AH), straw, 0.8))
inner = np.asarray(Image.fromarray((ga * 255).astype('uint8')).filter(ImageFilter.MinFilter(25))).astype(float) / 255
furry = (G[..., 1] > 100) & (G[..., 0] > 165) & (G[..., 0] - G[..., 2] > 60)  # light orange fur, not the darker gourd
ga = np.where(furry & (inner < 0.5), 0, ga)
G[..., 3] = np.minimum(ga * 255, 255)
gimg = Image.fromarray(G.astype('uint8')).crop((140, 340, 390, 660))

# --- the thermos: fill the app's paw by carrying each column down the cylinder (its shading runs along it)
therm = [(470, 452), (500, 445), (560, 447), (598, 460), (600, 530), (606, 572), (640, 576), (650, 596), (644, 700), (636, 745), (614, 752), (600, 760), (560, 775), (520, 790), (470, 808), (445, 808), (414, 795), (420, 700), (442, 560), (450, 500)]
paw_t = [(512, 606), (545, 600), (604, 600), (612, 640), (610, 724), (560, 732), (516, 726), (508, 690)]
T = A.copy(); tm = poly_mask((AW, AH), therm) > 0.5; pt = poly_mask((AW, AH), paw_t) > 0
for x in range(500, 615):
    ys = np.nonzero(pt[:, x] & tm[:, x])[0]
    if not len(ys): continue
    y0, y1 = ys.min() - 4, ys.max() + 4
    if not (tm[y0, x] and tm[y1, x]): continue
    for y in ys:
        t = (y - y0) / (y1 - y0); T[y, x, :3] = A[y0, x, :3] * (1 - t) + A[y1, x, :3] * t
ta = poly_mask((AW, AH), therm, 0.8)
furT = (T[..., 0] - T[..., 2] > 45) & (T[..., 0] > 120)
ta = np.where(furT, 0, ta) * (1 - poly_mask((AW, AH), [(603, 604), (621, 604), (621, 726), (603, 726)]))
ta = np.asarray(Image.fromarray((ta * 255).astype('uint8')).filter(ImageFilter.MedianFilter(3))).astype(float) / 255
T[..., 3] = np.minimum(ta * 255, A[..., 3])
# the app's leg hid the thermos's foot: draw it again as a cylinder's foot (dark band between two ellipse arcs,
# outlined), in the colours of the intact bit on the left, and carry the body down to it
band_c = T[782:790, 424:432, :3].reshape(-1, 3).mean(0); line_c = T[740:750, 416:420, :3].reshape(-1, 3).min(0)
L, R = 417, 566; CXF = (L + R) / 2; HW = (R - L) / 2
for x in range(L, R + 1):
    u = (x - CXF) / HW; k = np.sqrt(max(0, 1 - u * u))
    yt, yb = round(762 + 10 * k), round(796 + 20 * k)
    for y in range(752, yb + 6):
        if y < yt: 
            if T[y, x, 3] < 128 or y > 754: T[y, x] = T[752, x]
        elif y < yt + 3: T[y, x, :3] = line_c; T[y, x, 3] = 255
        elif y < yb: T[y, x, :3] = band_c * (0.9 + 0.2 * (1 - abs(u))); T[y, x, 3] = 255
        elif y < yb + 4: T[y, x, :3] = line_c; T[y, x, 3] = 255
        else: T[y, x, 3] = 0
    if x < L + 4 or x > R - 4:  # the sides of the outline
        for y in range(752, yb + 4): T[y, x, :3] = line_c; T[y, x, 3] = 255
T[812:, :, 3] = np.where(np.arange(AW)[None, :] < 600, 0, T[812:, :, 3]) if False else T[812:, :, 3]
for y in range(796, 840):
    for x in range(400, 600):
        u = (x - CXF) / HW
        if abs(u) <= 1 and y > round(796 + 20 * np.sqrt(max(0, 1 - u * u))) + 4: T[y, x, 3] = 0
        elif abs(u) > 1 and y > 790: T[y, x, 3] = 0
T[..., 3] = np.asarray(Image.fromarray(T[..., 3].astype('uint8')).filter(ImageFilter.GaussianBlur(0.6)))
timg = Image.fromarray(T.astype('uint8')).crop((405, 440, 660, 840))

KG, KT = 0.52, 0.70
gimg = gimg.resize((round(gimg.width * KG), round(gimg.height * KG)), Image.LANCZOS)
timg = timg.resize((round(timg.width * KT), round(timg.height * KT)), Image.LANCZOS)
# where they go, in sprite px: the gourd's left side tucked behind his fist; the thermos handle under his paw's fingers
G_AT = (30, 528)  # gourd bottom-left near the fist
T_AT = (round(410 - (624 - 405) * KT), round(652 - (660 - 440) * KT))  # handle bar (app x 624, y 660) under the fingers

# his own fist and paw, cut from the original drawing, go back on top
fist = [(36, 568), (58, 560), (74, 562), (84, 580), (82, 622), (76, 642), (72, 662), (62, 672), (50, 664), (40, 640), (34, 610), (34, 585)]
paw = [(358, 630), (372, 606), (400, 594), (440, 586), (472, 580), (488, 596), (484, 640), (474, 682), (444, 700), (410, 702), (378, 694), (364, 674), (356, 650)]
os.makedirs('public/pancho/ar-mateB', exist_ok=True)
for m in ['closed', 'half', 'a', 'e', 'i', 'o', 'u', 'open']:
    p = f'public/pancho/ar-arm/ar-{m}.png'
    if not os.path.exists(p): continue
    o = Image.open(p).convert('RGBA'); W, H = o.size
    O = np.asarray(o).astype(float)
    brown = ((O[..., 0] > O[..., 2] + 20) | (O[..., :3].mean(-1) < 95)).astype('uint8') * 255
    brown = np.asarray(Image.fromarray(brown).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))).astype(float) / 255
    keep = np.maximum(poly_mask((W, H), fist, 1.2), poly_mask((W, H), paw, 1.2)) * brown
    top = o.copy(); top.putalpha(Image.fromarray(np.minimum(O[..., 3], keep * 255).astype('uint8')))
    o.alpha_composite(gimg, G_AT); o.alpha_composite(timg, T_AT); o.alpha_composite(top)
    o.save(f'public/pancho/ar-mateB/ar-{m}.png')
if S:
    c = Image.new('RGBA', (W, H), (60, 140, 200, 255)); c.alpha_composite(Image.open('public/pancho/ar-mateB/ar-closed.png'))
    c.convert('RGB').save(f'{S}/B2.jpg')
    for n, im in (('gourd', gimg), ('thermos', timg)):
        b = Image.new('RGBA', im.size, (60, 140, 200, 255)); b.alpha_composite(im); b.convert('RGB').resize((im.width * 2, im.height * 2)).save(f'{S}/{n}.jpg')
print('gourd at', G_AT, gimg.size, 'thermos at', T_AT, timg.size)

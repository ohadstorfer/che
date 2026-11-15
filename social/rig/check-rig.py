# Puts the rig back together for every layer and saves a sheet to eyeball the seams:
# each layer assembled from parts (on grey), plus a few mixed poses Gemini never drew.
#   python3 rig/check-rig.py <out.jpg>      (run from social/)
import json, sys
from PIL import Image, ImageDraw

DIR = 'public/pancho/rig'
rig = json.load(open(f'{DIR}/rig.json'))
W, H = rig['canvas']

def compose(pick):
    """pick: {group: pose}; arms default to rest, face groups default to none."""
    c = Image.new('RGBA', (W, H), (70, 72, 82, 255))
    for group in rig['order']:
        pose = pick.get(group, 'rest' if group.startswith('arm') else 'body' if group == 'body' else None)
        if not pose: continue
        d = rig['layers'][group][pose]
        name = 'body' if group == 'body' else f'{group}-{pose}'
        c.alpha_composite(Image.open(f'{DIR}/{name}.png'), (d['x'], d['y']))
    return c

combos = [({}, 'rest')] + [({g: p}, p) for g in ['arm-a', 'arm-b', 'eye', 'mouth'] for p in rig['layers'][g] if p != 'rest']
combos += [({'arm-a': 'point-ul', 'mouth': 'm-a', 'eye': 'brow-up'}, 'mix 1'), ({'arm-a': 'point-l', 'arm-b': 'b-open', 'mouth': 'm-o'}, 'mix 2'),
           ({'arm-a': 'a-mid', 'arm-b': 'b-mid', 'eye': 'happy', 'mouth': 'm-i'}, 'mix 3')]
tw, th, cols = 300, 420, 8
crop = (180, 300, 1380, 2000)
rows = -(-len(combos) // cols)
sheet = Image.new('RGB', (tw * cols, (th + 22) * rows), 'white')
dr = ImageDraw.Draw(sheet)
for i, (pick, label) in enumerate(combos):
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(compose(pick).crop(crop).resize((tw, th)).convert('RGB'), (x, y + 22))
    dr.text((x + 4, y + 5), label, fill='black')
sheet.save(sys.argv[1], quality=88)

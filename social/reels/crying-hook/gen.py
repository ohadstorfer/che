"""Crying-hook reel: frame 1 = the AI girl crying with the hook (0-3 s),
frame 2 = a quick demo of the app (3-8 s). One reel per entry in hooks.json.

Usage: python3 gen.py <out-dir>   -> writes CH<id>-1.dc.html and CH<id>-2.dc.html
(artboards for the "Posta carousels" canvas, page "Crying hook").
"""
import json, os, sys
from html import escape

W, H = 1080, 1920
INK = '#3A2A20'
ICON = '/_blob/a978793c89816df37a0e7ac8f29be0da'
GIRL_BG = 'repeating-linear-gradient(135deg, #CDB8A3 0px, #CDB8A3 24px, #C4AE98 24px, #C4AE98 48px)'
SCREEN_BG = 'repeating-linear-gradient(135deg, #E9DFD3 0px, #E9DFD3 24px, #E1D5C7 24px, #E1D5C7 48px)'
APP_BG = 'linear-gradient(180deg, #BDE0F8, #A1D1F3)'


def page(title, bg, body):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{escape(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Figtree:wght@600;700;800&amp;family=Gabarito:wght@700;800;900&amp;display=swap" rel="stylesheet">
<style>
body{{margin:0}}
</style>
</helmet>
<div style="position: relative; width: {W}px; height: {H}px; overflow: hidden; background: {bg}; font-family: 'Figtree', system-ui, sans-serif; color: {INK}">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{W},"height":{H}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''


def caption(text, top, size):
    return (f'<div style="position: absolute; left: 80px; top: {top}px; width: 920px; text-align: center; '
            f'font-weight: 800; font-size: {size}px; line-height: 1.15; color: #FFFFFF; '
            f'text-shadow: 0 0 7px rgba(0,0,0,0.9), 0 3px 0 rgba(0,0,0,0.6)">{escape(text)}</div>')


def placeholder(text, top):
    return (f'<div style="position: absolute; left: 200px; top: {top}px; width: 680px; box-sizing: border-box; '
            f'text-align: center; font-weight: 800; font-size: 30px; line-height: 1.3; color: #5E4A3B; '
            f'background: rgba(255,249,243,0.88); padding: 22px; border-radius: 24px">{escape(text)}</div>')


def girl(r):
    # Long hooks get a smaller caption so they stay in the top third.
    size = 64 if len(r['hook']) <= 70 else 56 if len(r['hook']) <= 100 else 50
    return page(f"Crying hook {r['id']} · girl", '#CDB8A3', f'''
<div style="position: absolute; left: 0px; top: 0px; width: {W}px; height: {H}px; background: {GIRL_BG}"></div>
{placeholder('[AI girl video: ' + r['girl'] + ']', 1080)}
{caption(r['hook'], 300, size)}
''')


def app(r):
    return page(f"Crying hook {r['id']} · app", APP_BG, f'''
{caption(r['app'], 150, 58)}
<div style="position: absolute; left: 250px; top: 400px; width: 580px; height: 1200px; border-radius: 80px; background: #1C1511; padding: 22px; box-sizing: border-box; box-shadow: 0 40px 60px -30px rgba(40,30,20,0.6)">
<div style="width: 536px; height: 1156px; border-radius: 60px; background: {SCREEN_BG}; display: flex; align-items: center; justify-content: center; text-align: center; padding: 44px; box-sizing: border-box; font-weight: 800; font-size: 32px; line-height: 1.3; color: #5E4A3B">[Screen recording: {escape(r['screen'])}]</div>
</div>
<div style="position: absolute; left: 0px; top: 1700px; width: {W}px; display: flex; justify-content: center; align-items: center; gap: 18px">
<img src="{ICON}" alt="Posta app icon" style="width: 72px; height: 72px; border-radius: 18px">
<div style="font-family: 'Gabarito', sans-serif; font-weight: 900; font-size: 52px; color: {INK}">Posta</div>
</div>
''')


def main():
    out = sys.argv[1]
    here = os.path.dirname(os.path.abspath(__file__))
    rows = json.load(open(os.path.join(here, 'hooks.json')))
    os.makedirs(out, exist_ok=True)
    for r in rows:
        for n, html in ((1, girl(r)), (2, app(r))):
            name = f"CH{r['id']}-{n}.dc.html"
            open(os.path.join(out, name), 'w').write(html)
            print(name)


if __name__ == '__main__':
    main()

# Refreshes the app screens shown in the ending (public/end/*.jpg) from the app running in the iOS simulator.
#   python3 end-screens.py
# Needs a booted simulator with Posta installed and signed in. It opens the Course, Words and Culture tabs
# by link and photographs each with a clean status bar, then puts that status bar on the AI chat screen.
# The chat is a designed mock-up (../../posta-videos/end-card/chat-mock.png), not a photo: opening a real
# chat would start a voice session on the account.
import subprocess, time, sys
from PIL import Image

SIM = ['xcrun', 'simctl']
MOCK = '../../posta-videos/end-card/chat-mock.png'
SHOTS = {'course': 'home', 'slang': 'words', 'culture': 'culture'}  # file in public/end -> route in the app
W, H = 780, 1696  # the shape of a real screenshot (1206 x 2622)

if 'Booted' not in subprocess.run(SIM + ['list', 'devices', 'booted'], capture_output=True, text=True).stdout:
    sys.exit('no simulator is running: start the app in the iOS simulator first')
subprocess.run(SIM + ['status_bar', 'booted', 'override', '--time', '9:41', '--batteryState', 'charged', '--batteryLevel', '100', '--cellularBars', '4', '--wifiBars', '3'])
try:
    for name, route in SHOTS.items():
        subprocess.run(SIM + ['openurl', 'booted', f'posta:///{route}'], check=True)
        time.sleep(3.5)  # the tab's entrance has to finish
        subprocess.run(SIM + ['io', 'booted', 'screenshot', f'/tmp/posta-{name}.png'], check=True, capture_output=True)
        Image.open(f'/tmp/posta-{name}.png').convert('RGB').resize((W, H), Image.LANCZOS).save(f'public/end/{name}.jpg', quality=85)
        print('saved', f'public/end/{name}.jpg')
finally:
    subprocess.run(SIM + ['status_bar', 'booted', 'clear'])

# The mock chat, with the real status bar (time, island, signal) over its empty top band, faded in over the last rows.
mock = Image.open(MOCK).convert('RGB').resize((W, H), Image.LANCZOS)
real = Image.open('public/end/slang.jpg')
BAND, FADE = 114, 8
mask = Image.new('L', (W, BAND), 255)
for y in range(BAND - FADE, BAND):
    mask.paste(int(255 * (BAND - y) / FADE), (0, y, W, y + 1))
mock.paste(real.crop((0, 0, W, BAND)), (0, 0), mask)
mock.save('public/end/chat.jpg', quality=88)
print('saved public/end/chat.jpg (mock chat with the real status bar)')

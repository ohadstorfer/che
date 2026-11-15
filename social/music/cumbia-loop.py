"""Cumbia background loop, synthesized from scratch (no samples).

python3 social/music/cumbia-loop.py [out.wav] [bpm]
Writes a seamless 8-bar loop: güiro, conga, soft kick, offbeat
accordion-like chord stabs and a root/fifth bass. Am - Dm - E - Am.
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "social/public/music/cumbia-loop-01.wav"
BPM = float(sys.argv[2]) if len(sys.argv) > 2 else 96
BEAT = 60 / BPM
BARS = 8
N = int(round(BARS * 4 * BEAT * SR))
rng = np.random.default_rng(7)

def bus():
    return np.zeros(N)

def place(buf, sig, t):
    """Add sig at time t, wrapping the tail to the start so the loop is seamless."""
    i = int(round(t * SR)) % N
    end = i + len(sig)
    if end <= N:
        buf[i:end] += sig
    else:
        cut = N - i
        buf[i:] += sig[:cut]
        buf[: end - N] += sig[cut:]

def env(n, a=0.003, d=0.15):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)

def lp(x, f, order=2):
    return sosfilt(butter(order, f, "lowpass", fs=SR, output="sos"), x)

def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)

# ---------- instruments ----------
def guiro(dur, strong):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ridges = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 75 * t))  # the scrape ridges
    x = bp(rng.standard_normal(n), 2500, 7000) * ridges
    shape = np.minimum(1, t / 0.01) * np.exp(-t / (dur * 0.7))
    return x * shape * (0.9 if strong else 0.55)

def conga(f, slap=False):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    pitch = f * (1 + 0.25 * np.exp(-t / 0.01))
    body = np.sin(2 * np.pi * np.cumsum(pitch) / SR) * env(n, 0.001, 0.12)
    if slap:
        body = 0.5 * body + bp(rng.standard_normal(n), 800, 4000) * env(n, 0.0005, 0.03)
    return body

def kick():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    pitch = 50 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(pitch) / SR) * env(n, 0.001, 0.12)

def cowbell():
    n = int(0.2 * SR)
    x = np.sign(np.sin(2 * np.pi * 587 * np.arange(n) / SR)) + np.sign(np.sin(2 * np.pi * 845 * np.arange(n) / SR))
    return bp(x, 500, 3000) * env(n, 0.001, 0.05)

def bass(midi, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(midi)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    e = np.minimum(1, t / 0.005) * np.exp(-t / 0.35) * np.minimum(1, (dur - t) / 0.02)
    return lp(x * e, 600)

def accordion(midis, dur):
    """Detuned reed pairs + vibrato = musette-ish accordion."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t)
    for m in midis:
        for det in (1.0, 1.006, 0.996):
            ph = 2 * np.pi * np.cumsum(hz(m) * det * vib) / SR
            x += 2 * (ph / (2 * np.pi) % 1) - 1  # saw
    x = lp(x, 2600, 4)
    e = np.minimum(1, t / 0.012) * np.minimum(1, np.maximum(0, dur - t) / 0.03) * (0.85 + 0.15 * np.exp(-t / 0.05))
    return x * e / len(midis)

# ---------- arrangement ----------
# Am, Dm, E, Am — two bars each over 8 bars
CHORDS = [
    (45, 52, [57, 60, 64]),  # Am: root A2, fifth E3
    (50, 57, [57, 62, 65]),  # Dm
    (52, 59, [56, 59, 64]),  # E
    (45, 52, [57, 60, 64]),  # Am
]
gu, cg, kk, bs, ac, cb = bus(), bus(), bus(), bus(), bus(), bus()
s = BEAT / 4  # sixteenth

for bar in range(BARS):
    root, fifth, chord = CHORDS[bar // 2]
    b0 = bar * 4 * BEAT
    for beat in range(4):
        t0 = b0 + beat * BEAT
        # güiro: long - short short (the classic chiqui-chiqui)
        place(gu, guiro(2 * s * 0.9, True), t0)
        place(gu, guiro(s * 0.8, False), t0 + 2 * s)
        place(gu, guiro(s * 0.8, False), t0 + 3 * s)
        # accordion stabs on every offbeat
        place(ac, accordion(chord, s * 1.6), t0 + 2 * s)
        if beat in (0, 2):
            place(kk, kick(), t0)
        place(cb, cowbell(), t0)
    # bass: root on 1, fifth on 3, pickup on the "and" of 4
    place(bs, bass(root, BEAT * 1.6), b0)
    place(bs, bass(fifth, BEAT * 1.4), b0 + 2 * BEAT)
    place(bs, bass(root + 12 if bar % 2 else fifth, BEAT * 0.45), b0 + 3.5 * BEAT)
    # conga: slap on 2 and 4, open tones on 4 and its "and"
    place(cg, conga(330, True), b0 + BEAT)
    place(cg, conga(330, True), b0 + 3 * BEAT)
    place(cg, conga(220), b0 + 3.5 * BEAT)
    place(cg, conga(220), b0 + 3.75 * BEAT)
    if bar % 2:
        place(cg, conga(260), b0 + 1.5 * BEAT)

mix = 0.45 * gu + 0.5 * cg + 0.45 * kk + 0.9 * bs + 0.38 * ac + 0.12 * cb
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write(OUT, SR, (mix * 32767).astype(np.int16))
print(f"{OUT}  {N / SR:.1f}s  {BPM:g} bpm")

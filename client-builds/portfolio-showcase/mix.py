"""Soundtrack for the portfolio showcase: a clean 120 bpm tech beat + whooshes on the camera moves.

    python3.13 -I client-builds/portfolio-showcase/mix.py   -> client-builds/portfolio-showcase/audio/mix.wav
"""
import subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

OUT = Path(__file__).parent / "audio"; OUT.mkdir(exist_ok=True)
SR = 48000; TOTAL = 16.5; N = int(TOTAL * SR); rng = np.random.default_rng(5)
T = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
def whoosh(d=.5):
    t = T(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 250, 1400) * (1 - k) + bp(x, 1400, 8000) * k) * np.sin(np.pi * t / d) ** 1.4 * 1.3
def kick(): t = T(.35); return np.sin(2 * np.pi * 52 * (1 + 2.5 * np.exp(-t * 35)) * t) * np.exp(-t * 8)
def hat(): t = T(.05); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * 90) * .3
def clap(): t = T(.18); return bp(rng.standard_normal(len(t)), 900, 4000) * np.exp(-t * 25) * .6
def riser(d): t = T(d); return bp(rng.standard_normal(len(t)), 600, 7000) * (t / d) ** 2.2 * .7
def impact(): t = T(1.6); return np.sin(2 * np.pi * 45 * t) * np.exp(-t * 3) * .9 + lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 4) * .5
def stab(fs, d=.35): t = T(d); return sum(np.sin(2 * np.pi * f * t) + .35 * np.sign(np.sin(2 * np.pi * f * t)) for f in fs) / len(fs) * np.exp(-t * 7) * .35
BEAT = .5
mus = np.zeros(N)
chords = [(220, 277.2, 329.6), (196, 246.9, 293.7), (174.6, 220, 261.6), (196, 246.9, 311.1)]
for b in range(int(TOTAL / BEAT)):
    tt = b * BEAT
    if tt >= 12.9 and tt < 13.0 + 1.5: continue  # drop into the title
    put(mus, kick(), tt, .7 if tt > .4 else .3)
    put(mus, hat(), tt + BEAT / 2, 1)
    if b % 2 == 1: put(mus, clap(), tt, .5)
    if b % 2 == 0: put(mus, lp(stab(chords[(b // 8) % 4]), 3000), tt + .25, 1)
for k in range(0, int(TOTAL / 2)): put(mus, lp(sum(np.sin(2 * np.pi * f / 2 * T(2.1)) for f in chords[k % 4]) / 3, 1200) * np.minimum(1, T(2.1) / .2) * np.minimum(1, (2.1 - T(2.1)) / .3) * .25, k * 2)
sfx = np.zeros(N)
for s in (0.1, 2.3, 7.9, 10.9, 12.9): put(sfx, whoosh(.6), s - .3, .8)
for s in (3.3, 4.0, 4.7, 5.5, 6.2, 7.0): put(sfx, whoosh(.35), s - .17, .45)
put(sfx, riser(1.6), 11.4, .7); put(sfx, impact(), 13.0, .9)
for k, s in enumerate((13.4, 13.55, 13.7, 13.85, 14.0, 14.1)): t = T(.12); put(sfx, np.sin(2 * np.pi * (700 + 90 * k) * (1 + 8 * t) * t) * np.exp(-t * 40), s, .35)
idx = np.arange(N); env = np.minimum(1, idx / (.3 * SR)) * np.minimum(1, (N - idx) / (1.0 * SR))
mix = (mus * .55 + sfx * .6) * env
mix = np.tanh(mix * 1.1) / 1.1
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print("wrote", OUT / "mix.wav")

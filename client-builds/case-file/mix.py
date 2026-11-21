"""Soundtrack for The Rubel Case File: VO + low pulsing synth + ticking clock + chalk / tape / car / phone / boom.

    python3.13 -I mix.py   -> remotion-composer/public/casefile/mix.wav
Cue times follow CaseFile.tsx (line starts from vo.json).
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
HERE = Path(__file__).parent; OUT = HERE / "audio"; ROOT = HERE.parents[1]
V = json.loads((ROOT / "remotion-composer/src/casefile/vo.json").read_text()); LN = V["lines"]; Ls = lambda i: LN[i]["s"]
CUT = LN[-1]["e"] + 0.3; TOTAL = CUT + 6.0; SR = 48000; N = int(TOTAL * SR); rng = np.random.default_rng(31)
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
t = np.arange(N) / SR
# low pulsing synth (D minor drone with a slow filter wobble), dies at the cut
saw = lambda f: 2 * ((t * f) % 1) - 1
bed = lp(saw(36.7) * .5 + saw(55.0) * .35 + saw(73.4) * .25, 260 + 120 * 0) * (0.55 + 0.45 * np.sin(2 * np.pi * t * 0.5) ** 2)
bed *= np.where(t < CUT, 1, 0) * np.minimum(1, t / 1.5)
pad = lp(np.sin(2 * np.pi * 146.8 * t) + .6 * np.sin(2 * np.pi * 174.6 * t) + .4 * np.sin(2 * np.pi * 220 * t), 900) * .12 * np.where(t < CUT, 1, 0)
tick = np.zeros(N)
def tk(f): x = tt(.04); return hp(rng.standard_normal(len(x)), 3000) * np.exp(-x * 140) * .5 + np.sin(2 * np.pi * f * x) * np.exp(-x * 90) * .3
k, alt = 0.4, 0
while k < CUT: put(tick, tk(2400 if alt % 2 else 2000), k, 1); k += 1.0; alt += 1
def chalk(d):
    x = tt(d); n = rng.standard_normal(len(x)); g = (np.abs(np.sin(2 * np.pi * x * rng.uniform(5, 8))) > .35).astype(float)
    return lp(bp(n, 1200, 4500), 3500) * lp(g, 25) * .12 * np.minimum(1, x / .08) * np.minimum(1, (d - x) / .15)
def rip(): x = tt(.35); return bp(rng.standard_normal(len(x)), 800, 6000) * np.exp(-x * 9) * (1 + .5 * np.sin(2 * np.pi * 60 * x)) * .5
def hum(d): x = tt(d); return (lp(rng.standard_normal(len(x)), 300) * .6 + np.sin(2 * np.pi * (70 + 10 * x / d) * x) * .3) * np.sin(np.pi * x / d)
def whoosh(d=.8):
    x = tt(d); n = rng.standard_normal(len(x)); kk = np.linspace(0, 1, len(x)); return (bp(n, 200, 1200) * (1 - kk) + bp(n, 1200, 7000) * kk) * np.sin(np.pi * x / d) ** 1.4
def buzz(): x = tt(.5); return np.sin(2 * np.pi * 180 * x) * (np.sin(2 * np.pi * 22 * x) > 0) * np.sin(np.pi * x / .5) * .4
def boom(): x = tt(3.5); return np.sin(2 * np.pi * 34 * x) * np.exp(-x * 1.4) * 1.2 + lp(rng.standard_normal(len(x)), 220) * np.exp(-x * 3) * .7
def shimmer(d=2.5):
    x = np.zeros(int(d * SR))
    for q in range(14):
        y = tt(.6); i = int(rng.uniform(0, d - .6) * SR); x[i:i + len(y)] += np.sin(2 * np.pi * rng.uniform(1500, 3500) * y) * np.exp(-y * 7) * .15
    return x
sfx = np.zeros(N)
for at, d in [(Ls(0) + .4, 1.2), (Ls(1) + .6, .9), (Ls(1) + 1.6, 1.0), (Ls(2) + 1.0, 1.8), (Ls(3) + 1.4, 2.4), (Ls(4) + 1.0, 2.2), (Ls(5) + 1.2, 1.8), (Ls(6) + 1.4, 1.2),
              (Ls(7) + 1.9, 1.3), (Ls(8) + 2.2, 1.8), (Ls(9) + .4, .7), (Ls(9) + 1.2, .6), (Ls(9) + 1.9, .6), (Ls(10) + .5, 1.2)]: put(sfx, chalk(d), at, .9)
for at in [0.0, Ls(1) + .2, Ls(2) + .2, Ls(3) + .2, Ls(3) + 2.7, Ls(4) + .2, Ls(4) + 2.2, Ls(5) + .2, Ls(6) + .2, Ls(9)]: put(sfx, rip(), at, .45)
put(sfx, hum(Ls(8) - Ls(7)), Ls(7) - .2, .9); put(sfx, whoosh(1.0), Ls(7) + .3, .5); put(sfx, whoosh(1.6), Ls(8), .5)
for q in range(3): put(sfx, buzz(), Ls(10) - .2 + q * .6, .9)
put(sfx, boom(), CUT, 1.0); put(sfx, shimmer(), CUT + .3, .8)
y, sr = sf.read(OUT / "vo.wav"); y = y if y.ndim == 1 else y.mean(1)
idx = (np.arange(int(len(y) * SR / sr)) * sr / SR).astype(int); vo = np.zeros(N); n = min(N, len(idx)); vo[:n] = y[np.clip(idx[:n], 0, len(y) - 1)]
vo = hp(vo, 70); vo = vo / (np.abs(vo).max() + 1e-9) * .92
ev = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); ev = np.clip(ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .5 * np.convolve(ev, np.ones(14400) / 14400, mode="same")
sduck = 1 - .75 * np.convolve(ev, np.ones(9600) / 9600, mode="same")
mix = vo + (bed * .5 + pad + tick * .5) * .5 * duck + sfx * .35 * np.where(t < CUT, sduck, 1)
mix = np.tanh(mix * 1.05) / 1.05 * np.minimum(1, (TOTAL - t) / 1.5)
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-15:TP=-1.5:LRA=9", "-ar", str(SR), str(ROOT / "remotion-composer/public/casefile/mix.wav")], check=True)
print("wrote mix", round(TOTAL, 2))

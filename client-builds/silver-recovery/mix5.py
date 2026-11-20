"""Soundtrack for the "5 Recovery Signals" cut: the client's own voiceover (audio/vo5.wav) + the same dark bed.

    python3.13 -I mix5.py   -> remotion-composer/public/silver/mix5.wav
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
HERE = Path(__file__).parent; OUT = HERE / "audio"; ROOT = HERE.parents[1]
V = json.loads((ROOT / "remotion-composer/src/silver5/vo.json").read_text()); LN = V["lines"]
BRAND = LN[-1]["e"] + 0.6; TOTAL = BRAND + 5.0; SR = 48000; N = int(TOTAL * SR); rng = np.random.default_rng(21)
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
B = lambda i: 0 if i <= 0 else (LN[i - 1]["e"] + LN[i]["s"]) / 2
SCN = [B(i) for i in (0, 2, 4, 6, 8, 10, 12, 13)]
t = np.arange(N) / SR
drone = lp((np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t) + .35 * np.sin(2 * np.pi * np.where(t < SCN[1], 65.4, 69.3) * t)) * .25 + .05 * rng.standard_normal(N), 900)
pulse = np.zeros(N)
def thump(): x = tt(.35); return np.sin(2 * np.pi * 48 * (1 + 1.6 * np.exp(-x * 25)) * x) * np.exp(-x * 9)
k = 0.0
while k < TOTAL - 5: put(pulse, thump(), k, .8); k += .75
def pad(f, d): x = tt(d); return lp(sum(np.sin(2 * np.pi * f * m * x + p) for m, p in ((1, 0), (1.003, 1), (2, .5))), 2200) * np.minimum(1, x / 1.2) * np.minimum(1, (d - x) / 1.2) * .2
pads = np.zeros(N)
for i, (a, f) in enumerate(zip(SCN, [196, 220, 246.9, 261.6, 293.7, 329.6, 220, 261.6])): put(pads, pad(f, (SCN[i + 1] if i + 1 < len(SCN) else BRAND) - a + 1), a, 1)
put(pads, pad(261.6, 5.5), BRAND, 1.2); put(pads, pad(329.6, 5.5), BRAND, .8)
def whoosh(d=.6):
    x = tt(d); n = rng.standard_normal(len(x)); kk = np.linspace(0, 1, len(x)); return (bp(n, 200, 1200) * (1 - kk) + bp(n, 1200, 7000) * kk) * np.sin(np.pi * x / d) ** 1.4
def impact(): x = tt(2.0); return np.sin(2 * np.pi * 38 * x) * np.exp(-x * 2) + lp(rng.standard_normal(len(x)), 400) * np.exp(-x * 4) * .6
def chime(f): x = tt(1.6); return sum(np.sin(2 * np.pi * f * m * x) * a for m, a in ((1, 1), (2.76, .3))) * np.exp(-x * 3)
def shimmer(d=2.0):
    x = np.zeros(int(d * SR))
    for q in range(16):
        y = tt(.5); i = int(rng.uniform(0, d - .5) * SR); x[i:i + len(y)] += np.sin(2 * np.pi * (2000 + rng.uniform(0, 3000)) * y) * np.exp(-y * 9) * .2
    return x
sfx = np.zeros(N)
for a in SCN[1:]: put(sfx, whoosh(), a - .3, .6)
put(sfx, impact(), 2.4, .8)
for i, a in enumerate(SCN[1:6]): put(sfx, chime(880 * 2 ** (i / 12 * 2)), a + .2, .45)
put(sfx, impact(), SCN[6] + 2.8, .5); put(sfx, shimmer(), SCN[7] + .8, .6); put(sfx, shimmer(3), BRAND + 1.4, .9)
y, sr = sf.read(OUT / "vo5.wav"); y = y if y.ndim == 1 else y.mean(1)
idx = (np.arange(int(len(y) * SR / sr)) * sr / SR).astype(int); vo = np.zeros(N); n = min(N, len(idx)); vo[:n] = y[np.clip(idx[:n], 0, len(y) - 1)]
vo = hp(vo, 70); vo = vo / (np.abs(vo).max() + 1e-9) * .92
ev = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); ev = np.clip(ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .55 * np.convolve(ev, np.ones(14400) / 14400, mode="same"); fade = np.minimum(1, t / 1.0) * np.minimum(1, (TOTAL - t) / 2.0)
mix = vo + (drone * .5 + pulse * .35 + pads) * .45 * duck * fade + sfx * .32
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix5_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix5_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(ROOT / "remotion-composer/public/silver/mix5.wav")], check=True)
print("wrote mix5", round(TOTAL, 2))

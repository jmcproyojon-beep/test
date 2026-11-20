"""Soundtrack: Bangla narration + dark cinematic pulse bed + crash / recovery cues.

    python3.13 -I mix.py   -> audio/mix.wav and remotion-composer/public/silver/mix.wav
"""
import json, shutil, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent; OUT = HERE / "audio"; ROOT = HERE.parents[1]
V = json.loads((ROOT / "remotion-composer/src/silver/vo.json").read_text()); CL = V["clips"]
TOTAL = V["total"]; SR = 48000; N = int(TOTAL * SR); rng = np.random.default_rng(12)
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
S = lambda i: CL[i]["s"]
# bed: low drone + 80 bpm pulse, minor colour; brighter (major third) from clip 10 on
BEAT = 60 / 80; t = np.arange(N) / SR
root = np.where(t < S(9), 55.0, 55.0)
drone = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t) + .35 * np.sin(2 * np.pi * np.where(t < S(9), 65.4, 69.3) * t)) * .25
drone = lp(drone + .05 * rng.standard_normal(N), 900) * (0.7 + 0.3 * np.sin(2 * np.pi * t / 8))
pulse = np.zeros(N)
def thump(): x = tt(.35); return np.sin(2 * np.pi * 48 * (1 + 1.6 * np.exp(-x * 25)) * x) * np.exp(-x * 9)
def tick(): x = tt(.05); return hp(rng.standard_normal(len(x)), 5000) * np.exp(-x * 80) * .3
k = 0.0
while k < TOTAL - 5:
    put(pulse, thump(), k, .8); put(pulse, tick(), k + BEAT / 2, .6); k += BEAT
def pad(f, d): x = tt(d); return lp(sum(np.sin(2 * np.pi * f * m * x + p) for m, p in ((1, 0), (1.003, 1), (2, .5))), 2200) * np.minimum(1, x / 1.5) * np.minimum(1, (d - x) / 1.5) * .2
pads = np.zeros(N)
for i, c in enumerate(CL): put(pads, pad([220, 196, 174.6, 164.8, 146.8, 130.8, 146.8, 164.8, 196, 220, 246.9, 261.6][i], c["dur"] + 1), c["s"], 1)
put(pads, pad(261.6, 5.5), V["brand"], 1.2); put(pads, pad(329.6, 5.5), V["brand"], .8)
def whoosh(d=.6):
    x = tt(d); n = rng.standard_normal(len(x)); kk = np.linspace(0, 1, len(x))
    return (bp(n, 200, 1200) * (1 - kk) + bp(n, 1200, 7000) * kk) * np.sin(np.pi * x / d) ** 1.4
def impact(): x = tt(2.4); return np.sin(2 * np.pi * 38 * x) * np.exp(-x * 2) + lp(rng.standard_normal(len(x)), 400) * np.exp(-x * 4) * .6
def riser(d): x = tt(d); return bp(rng.standard_normal(len(x)), 400, 6000) * (x / d) ** 2.5 * .6
def alarm(): x = tt(.22); return np.sign(np.sin(2 * np.pi * 880 * x)) * np.exp(-x * 6) * .25
def shimmer(d=2.0):
    x = np.zeros(int(d * SR))
    for q in range(18):
        f = 2000 + rng.uniform(0, 3000); y = tt(.5); i = int(rng.uniform(0, d - .5) * SR); x[i:i + len(y)] += np.sin(2 * np.pi * f * y) * np.exp(-y * 9) * .2
    return x
def coin(): x = tt(.4); return sum(np.sin(2 * np.pi * f * x) for f in (3100, 4870, 6230)) * np.exp(-x * 14) * .25
sfx = np.zeros(N)
for i, c in enumerate(CL): put(sfx, whoosh(), c["s"] - .3, .6)
d0 = CL[0]["dur"]; put(sfx, riser(3.0), S(0) + .3 + (d0 - 1.5) * .6 - 3.0, .7); put(sfx, impact(), S(0) + .3 + (d0 - 1.5) * .6, 1.0)
for q in range(4): put(sfx, impact() * .3, S(1) + 3.3 + q * .45, .5)
for q in range(14): put(sfx, alarm(), S(4) + 3.2 + q * .5, .7)
put(sfx, impact(), S(4) + 5.4, .8)
for q in range(7): put(sfx, coin(), S(5) + 2 + q * .8, .6)
put(sfx, impact(), S(6) + .3 + (CL[6]["dur"] - 1.1) * .76, .7); put(sfx, impact(), S(7) + .3 + (CL[7]["dur"] - 1.9) * .4, .6)
put(sfx, impact(), S(8) + 2.2, .6); put(sfx, shimmer(), S(8) + 4.2, .7)
put(sfx, shimmer(), S(9) + 4.8, .6)
for q in range(5): put(sfx, coin(), S(10) + (CL[10]["vs"] - S(10)) + 1.8 + q * ((CL[10]["ve"] - CL[10]["vs"] - 1.8) / 5), .8)
put(sfx, shimmer(3.0), S(11) + 1.5, .7); put(sfx, shimmer(3.0), V["brand"] + 1.4, .9); put(sfx, impact(), V["brand"] + 2.0, .4)
y, sr = sf.read(OUT / "vo.wav"); y = y if y.ndim == 1 else y.mean(1)
idx = (np.arange(int(len(y) * SR / sr)) * sr / SR).astype(int); vo = np.zeros(N); n = min(N, len(idx)); vo[:n] = y[np.clip(idx[:n], 0, len(y) - 1)]
vo = hp(vo, 70); vo = vo / (np.abs(vo).max() + 1e-9) * .92
ev = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); ev = np.clip(ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .55 * np.convolve(ev, np.ones(14400) / 14400, mode="same")
fade = np.minimum(1, t / 1.0) * np.minimum(1, (TOTAL - t) / 2.0)
mix = vo + (drone * .5 + pulse * .35 + pads) * .45 * duck * fade + sfx * .32
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
shutil.copy(OUT / "mix.wav", ROOT / "remotion-composer/public/silver/mix.wav"); print("wrote mix", round(TOTAL, 2))

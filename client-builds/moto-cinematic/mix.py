"""Soundtrack for the motorcycle film: cinematic drone + pulses, laser zaps, ignition hits, gears,
brake squeal, assembly impacts, an engine rev on the reveal and a title hit.

    python3.13 -I client-builds/moto-cinematic/mix.py   -> client-builds/moto-cinematic/audio/mix.wav
"""
import subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

OUT = Path(__file__).parent / "audio"; OUT.mkdir(exist_ok=True)
SR = 48000; TOTAL = 28.5; N = int(TOTAL * SR); rng = np.random.default_rng(9)
T = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
def whoosh(d=.6):
    t = T(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 200, 1200) * (1 - k) + bp(x, 1200, 7000) * k) * np.sin(np.pi * t / d) ** 1.4 * 1.3
def hit(f=45, d=2.0): t = T(d); return (np.sin(2 * np.pi * f * (1 + .6 * np.exp(-t * 8)) * t) * np.exp(-t * 2.2) + lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 6) * .6)
def zap(d=.35): t = T(d); return np.sin(2 * np.pi * np.cumsum(3000 * np.exp(-t * 9) + 300) / SR) * np.exp(-t * 7) * .35
def ignite(): t = T(.5); return (bp(rng.standard_normal(len(t)), 300, 3000) * np.exp(-t * 14) + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 10)) * .9
def clank(f=900): t = T(.25); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t * 22) * .5 + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 60) * .3
def squeal(d=1.2): t = T(d); return np.sin(2 * np.pi * (2600 + 200 * np.sin(2 * np.pi * 7 * t)) * t) * np.minimum(1, t / .05) * np.exp(-t * 2.2) * .18 + bp(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t * 3) * .2
def rev(d=3.2):
    t = T(d); f = 38 + 95 * np.sin(np.pi * np.clip(t / (d * .55), 0, 1)) ** 1.5 * np.exp(-np.maximum(0, t - d * .55) * 1.2)
    ph = np.cumsum(f) / SR; x = np.sign(np.sin(2 * np.pi * ph)) * .5 + np.sin(4 * np.pi * ph) * .3 + np.sin(6 * np.pi * ph) * .15
    x = lp(x, 1800) + bp(rng.standard_normal(len(t)), 100, 900) * .25
    return x * np.minimum(1, t / .08) * np.minimum(1, (d - t) / .4) * .7
def riser(d): t = T(d); return (bp(rng.standard_normal(len(t)), 500, 7000) + np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * .3) * (t / d) ** 2.3 * .6

# bed: dark drone + heartbeat pulse that tightens toward the reveal
bed = np.zeros(N); t = T(TOTAL)
bed += (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t) + .3 * np.sin(2 * np.pi * 110.3 * t)) * .18 * (0.6 + .4 * np.sin(2 * np.pi * .1 * t))
bed += lp(rng.standard_normal(N), 180) * .08
for k in range(int(20.5 / .75)):
    tt = k * .75 if k * .75 < 16.4 else 16.4 + (k * .75 - 16.4) * .66
    if tt < 20.4: p = T(.4); put(bed, np.sin(2 * np.pi * 48 * (1 + np.exp(-p * 25)) * p) * np.exp(-p * 9) * .7, tt)
fade = np.minimum(1, np.arange(N) / (1.0 * SR)) * np.clip((25.4 - np.arange(N) / SR) / .8, 0, 1); bed *= fade

sfx = np.zeros(N)
for c in (3.2, 7.0, 10.4, 13.6, 16.4, 20.5): put(sfx, whoosh(.6), c - .3, .7)
put(sfx, zap(), .35, 1); put(sfx, zap(), 2.6, .6)
for f in (0.45, 1.25, 2.05, 2.85): put(sfx, ignite(), 3.2 + f, 1)
for k in range(30): put(sfx, clank(700 + 300 * (k % 3)), 7.1 + k * .11, .35)
put(sfx, zap(), 7.2, .7); put(sfx, squeal(), 11.7, 1); put(sfx, hit(60, 1.0), 11.7, .5)
put(sfx, riser(2.2), 13.9, .7); put(sfx, zap(.5), 14.0, .6)
for k, d in enumerate((0, .18, .34)): put(sfx, clank(500), 16.4 + d + 1.45, .8)
put(sfx, hit(), 17.95, 1.0); put(sfx, zap(.6), 18.0, .8)
put(sfx, riser(1.8), 20.6, .5); put(sfx, rev(3.4), 22.2, 1.0)
put(sfx, hit(40, 2.6), 25.55, 1.1); put(sfx, zap(.6), 26.2, .5)
mix = bed * .8 + sfx * .7
mix = np.tanh(mix * 1.2) / 1.2
mix *= np.minimum(1, (N - np.arange(N)) / (1.2 * SR))
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print("wrote", OUT / "mix.wav")

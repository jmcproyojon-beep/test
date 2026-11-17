"""Soundtrack for the Proyojon "flat or plot" reel: the clip's own voiceover + warm music + cues.

    python3.13 -I client-builds/proyojon-reel/mix_flatplot.py   -> client-builds/proyojon-reel/audio/mix_flatplot.wav
"""
import subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent; SRC = HERE.parents[1] / "remotion-composer/public/proyojon"; OUT = HERE / "audio"; OUT.mkdir(exist_ok=True)
SR = 48000; TOTAL = 33.6; N = int(TOTAL * SR); rng = np.random.default_rng(11)
T = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]

vo = np.zeros(N)
y, _ = sf.read(SRC / "fp_vo.wav"); y = y if y.ndim == 1 else y.mean(1)
f = int(.03 * SR); y[-f:] *= np.linspace(1, 0, f); put(vo, y, 0)
vo = hp(vo, 90); vo = vo / (np.abs(vo).max() + 1e-9) * .9

def whoosh(d=.4):
    t = T(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 300, 1500) * (1 - k) + bp(x, 1500, 7000) * k) * np.sin(np.pi * t / d) ** 1.5 * 1.4
def pop(f=650): t = T(.12); return np.sin(2 * np.pi * f * (1 + 8 * t) * t) * np.exp(-t * 40)
def thump(): t = T(.35); return np.sin(2 * np.pi * 60 * (1 + 1.5 * np.exp(-t * 25)) * t) * np.exp(-t * 10)
def ring():
    out = np.zeros(int(1.0 * SR))
    for k in range(2): t = T(.35); put(out, (np.sin(2 * np.pi * 1300 * t) + np.sin(2 * np.pi * 1650 * t)) * (0.5 + .5 * np.sign(np.sin(2 * np.pi * 20 * t))) * .25 * np.minimum(1, (0.35 - t) / .05), k * .45)
    return out
def chime():
    out = np.zeros(int(1.6 * SR))
    for i, f in enumerate((784, 988, 1175, 1568)): t = T(1.2); put(out, (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 4) * .4, i * .08)
    return out
sfx = np.zeros(N)
for s_ in (10.125, 30.0): put(sfx, whoosh(), s_ - .22, .45)
put(sfx, whoosh(.7), 19.9, .25)
for s_ in (0.98, 2.64, 8.8, 12.8, 15.06, 21.42, 22.36, 29.78): put(sfx, thump(), s_, .45)
for s_ in (3.4, 4.8, 5.44, 23.2, 23.75, 24.3, 24.85): put(sfx, pop(620 + 40 * int(s_ % 7)), s_, .35)
put(sfx, pop(800), 16.48, .3); put(sfx, ring(), 15.45, .3); put(sfx, pop(800), 27.55, .3); put(sfx, chime(), 30.05, .45)
for k, s_ in enumerate((30.45, 30.65, 30.85)): put(sfx, pop(900 + k * 80), s_, .25)

# warm, bright music bed: plucked chords + soft beat, swelling on the end card
mus = np.zeros(N); BEAT = 60 / 108
def pluck(f, d=.6):
    t = T(d); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t) + .15 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 6) * np.minimum(1, t / .004)
def pad(fs, d):
    t = T(d); x = sum(np.sin(2 * np.pi * f * t * (1 + dt)) for f in fs for dt in (-.003, .003)) / (2 * len(fs))
    return lp(x, 2200) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .3)
def kick(): t = T(.3); return np.sin(2 * np.pi * 55 * (1 + 2 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
def shaker(): t = T(.06); return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 70) * .3
prog = [(261.6, 329.6, 392.0), (196.0, 246.9, 293.7), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6)]  # C G Am F
b, t0 = 0, 0.0
while t0 < TOTAL:
    ch = prog[b % 4]; put(mus, pad(ch, 4 * BEAT + .3) * .45, t0)
    for k in range(8):
        tt = t0 + k * BEAT / 2
        put(mus, pluck(ch[(k * 2) % 3] * 2, .5), tt, .22 if k % 2 == 0 else .14)
        put(mus, shaker(), tt, .8)
    for k in (0, 2): put(mus, kick(), t0 + k * BEAT, .45 if t0 > .5 else 0)
    b += 1; t0 += 4 * BEAT
idx = np.arange(N); mus *= np.minimum(1, idx / (.5 * SR)) * np.minimum(1, (N - idx) / (1.5 * SR))
env = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .6 * np.convolve(env, np.ones(9600) / 9600, mode="same")
endk = np.clip((idx / SR - 29.9) / .5, 0, 1)
mix = vo + mus * (.17 * duck * (1 - endk) + .42 * endk) + sfx * .5
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix_flatplot_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_flatplot_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix_flatplot.wav")], check=True)
print("wrote", OUT / "mix_flatplot.wav")

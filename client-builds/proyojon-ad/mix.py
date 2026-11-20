"""Soundtrack for the Proyojon Abashon brand ad: dialogue + playful ukulele-style bed + cartoon cues.

    python3.13 -I mix.py   (in client-builds/proyojon-ad) -> audio/mix.wav
Scene times mirror S in remotion-composer/src/proyojonad/ProyojonAd.tsx.
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent; OUT = HERE / "audio"
V = json.loads((HERE.parents[1] / "remotion-composer/src/proyojonad/vo.json").read_text())
S = dict(q=6.25, snap=11.4, office=11.7, desk=15.9, montage=22.95, dream=26.6, cta=32.75, end=39.9)
TOTAL = V["total"]; SR = 48000; N = int(TOTAL * SR); rng = np.random.default_rng(3)
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
def curve(pts): ts, gs = zip(*pts); return np.interp(np.arange(N) / SR, ts, gs)

# ---- music: 112 bpm, C - G - Am - F, plucked "ukulele", bass, claps, shaker
BEAT = 60 / 112; BAR = 4 * BEAT
PROG = [(261.6, 329.6, 392.0), (196.0, 246.9, 293.7), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6)]
def pluck(f, d=.45):  # Karplus-Strong string
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * np.minimum(1, np.arange(n) / 40)
PL = {}
def pl(f):
    if f not in PL: PL[f] = pluck(f)
    return PL[f]
def bass(f, d): t = tt(d); return lp(np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t), 500) * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .05)
def kick(): t = tt(.3); return np.sin(2 * np.pi * 55 * (1 + 2 * np.exp(-t * 35)) * t) * np.exp(-t * 10)
def clap(): t = tt(.18); return bp(rng.standard_normal(len(t)), 1000, 5000) * np.exp(-t * 25) * .6
def shaker(): t = tt(.07); return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 60) * .25
uke = np.zeros(N); rhythm = np.zeros(N); low = np.zeros(N)
STRUM = [0, .5, 1, 1.5, 2, 2.5, 3, 3.5]; ACC = [1, .5, .8, .6, 1, .5, .8, .6]
b = 0; t0 = 0.0
while t0 < TOTAL:
    ch = PROG[b % 4]
    for k, (st, ac) in enumerate(zip(STRUM, ACC)):
        for j, f in enumerate(ch): put(uke, pl(round(f * 2, 1)), t0 + st * BEAT + j * .012, .22 * ac)
    put(low, bass(ch[0] / 2, BAR - .05), t0, .4)
    for k in range(4):
        put(rhythm, kick(), t0 + k * BEAT, .8 if k in (0, 2) else .35)
        if k in (1, 3): put(rhythm, clap(), t0 + k * BEAT, .8)
        put(rhythm, shaker(), t0 + k * BEAT + BEAT / 2, 1)
    b += 1; t0 += BAR
music = uke * curve([(0, .8), (S["q"], .7), (S["snap"], .5), (S["office"], .85), (S["montage"], 1), (TOTAL - 1.5, 1), (TOTAL, 0)]) \
      + low * curve([(0, .6), (S["office"], 1), (TOTAL - 1.5, 1), (TOTAL, 0)]) \
      + rhythm * curve([(0, 0), (.4, .7), (S["q"], .7), (S["q"] + .1, .35), (S["snap"], .35), (S["snap"] + .05, 0), (S["office"] + .6, 0), (S["office"] + .8, .6),
                        (S["montage"], .9), (S["dream"], .9), (S["dream"] + .05, 0), (27.3, 0), (27.4, .8), (TOTAL - 1.5, .8), (TOTAL, 0)])

# ---- cues
def whoosh(d=.45):
    t = tt(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 300, 1500) * (1 - k) + bp(x, 1500, 8000) * k) * np.sin(np.pi * t / d) ** 1.4
def pop(f=700): t = tt(.14); return np.sin(2 * np.pi * f * (1 + 6 * t) * t) * np.exp(-t * 34)
def boing(f=180): t = tt(.5); return np.sin(2 * np.pi * f * (1 + .5 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)) * t) * np.exp(-t * 6)
def snap(): t = tt(.08); return hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 90) * 1.2
def sparkle(d=1.2):
    x = np.zeros(int(d * SR))
    for k in range(16):
        f = 1800 + rng.uniform(0, 2600); t = tt(.35); i = int(rng.uniform(0, d - .35) * SR); x[i:i + len(t)] += np.sin(2 * np.pi * f * t) * np.exp(-t * 14) * .3
    return x
def chime(f=1318.5): t = tt(2.0); return sum(np.sin(2 * np.pi * f * m * t) * a for m, a in ((1, 1), (2.76, .3), (5.4, .1))) * np.exp(-t * 2.5) * np.minimum(1, t / .003)
def chirp(): t = tt(.18); f = 3200 + 1200 * np.sin(2 * np.pi * 18 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .18) * .25
def step(): t = tt(.09); return lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 50) * .5
sfx = np.zeros(N)
put(sfx, whoosh(.5), 0.02, .7); put(sfx, boing(160), 0.55, .45)
for at, f in ((6.65, 650), (7.5, 760), (8.25, 870), (8.7, 980)): put(sfx, pop(f), at, .7)
for k in range(3): put(sfx, boing(260 + 60 * k), 9.2 + .2 * k, .25)
put(sfx, snap(), S["snap"], 1); put(sfx, sparkle(1.3), S["snap"] + .02, .8); put(sfx, chime(1046.5), S["office"], .4)
for at, f in ((16.45, 700), (17.35, 820), (18.1, 940), (20.2, 1060)): put(sfx, pop(f), at, .6); put(sfx, sparkle(.5), at, .35)
put(sfx, whoosh(.5), S["montage"] - .2, .6)
for k in range(5): put(sfx, whoosh(.35), S["montage"] + .3 + k * (S["dream"] - S["montage"] - .7) / 4, .3)
for k in range(3): put(sfx, pop(800 + 90 * k), S["montage"] + .6 + .25 * k, .4)
put(sfx, whoosh(.9), S["dream"] - .1, .7); put(sfx, sparkle(1.0), 27.3, .5)
for k in range(9): put(sfx, chirp(), S["dream"] + .8 + k * 1.15 + rng.uniform(0, .4), .5)
for k in range(5): put(sfx, step(), 29.6 + k * .13, .6)
put(sfx, pop(520), S["cta"] + .1, .6); put(sfx, chime(1568), S["cta"] + .4, .35)
put(sfx, chime(1318.5), S["end"], .5); put(sfx, chime(1975.5), S["end"] + .05, .25)
for k, d in enumerate((.3, .6, .9)): put(sfx, pop(700 + 100 * k), S["end"] + d, .4)

# ---- mix with ducking under the dialogue
y, sr = sf.read(OUT / "dialogue.wav"); y = y if y.ndim == 1 else y.mean(1)
vo = np.zeros(N); vo[:min(N, len(y))] = y[:N]
ev = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); ev = np.clip(ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .6 * np.convolve(ev, np.ones(12000) / 12000, mode="same")
mix = vo + music * .22 * duck + sfx * .3
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print("wrote", OUT / "mix.wav", round(TOTAL, 2))

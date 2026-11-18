"""Soundtrack for the Rapar Rubel promo: Bangla VO + an upbeat agency-style track + UI sounds.

    python3.13 -I mix.py   (in client-builds/rubel-promo) -> audio/mix.wav
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent; OUT = HERE / "audio"
V = json.loads((HERE.parents[1] / "remotion-composer/src/rubelpromo/vo.json").read_text())
LN = V["lines"]; WD = V["words"]
END = LN[-1]["e"] + 0.5; TOTAL = END + 4.5
SR = 48000; N = int(TOTAL * SR); rng = np.random.default_rng(21)
T = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
B = lambda i: 0 if i <= 0 else (END if i >= len(LN) else (LN[i - 1]["e"] + LN[i]["s"]) / 2)
Wt = lambda i, k: [w for w in WD if w["line"] == i][k]["s"]

# voice
y, sr = sf.read(OUT / "vo.wav"); y = y if y.ndim == 1 else y.mean(1)
idx = (np.arange(int(len(y) * SR / sr)) * sr / SR).astype(int); vo = np.zeros(N); vo[: len(idx)] = y[np.clip(idx, 0, len(y) - 1)][:N]
vo = hp(vo, 80); vo = vo / (np.abs(vo).max() + 1e-9) * .92

# music: 112 bpm, A minor-ish progression, kick/clap/hats, sub bass, plucks; breaks at scene changes
BEAT = 60 / 112; BAR = 4 * BEAT
prog = [(220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7), (164.8, 207.7, 246.9)]
def kick(): t = T(.32); return np.sin(2 * np.pi * 50 * (1 + 2.5 * np.exp(-t * 32)) * t) * np.exp(-t * 9)
def clap(): t = T(.2); return bp(rng.standard_normal(len(t)), 900, 5000) * np.exp(-t * 22) * .55
def hat(): t = T(.05); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * 80) * .25
def pluck(f, d=.4): t = T(d); return (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 7) * np.minimum(1, t / .003)
def bass(f, d): t = T(d); return lp(np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sin(2 * np.pi * f * t) * .5, 400) * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .05)
mus = np.zeros(N)
quiet = [(B(16) - .2, B(21)), (B(36) - .2, B(40))]  # softer sections (approach story, results)
b = 0; t0 = 0.0
while t0 < TOTAL - 1:
    ch = prog[b % 4]; soft = any(a <= t0 < e for a, e in quiet); g = .55 if soft else 1.0
    for k in range(4):
        tt = t0 + k * BEAT
        if not soft or k % 2 == 0: put(mus, kick(), tt, .8 * g)
        if k % 2 == 1 and not soft: put(mus, clap(), tt, .7)
        put(mus, hat(), tt + BEAT / 2, .9 * g)
    put(mus, bass(ch[0] / 2, BAR - .05), t0, .35 * g)
    for k in range(8): put(mus, pluck(ch[k % 3] * (2 if k % 4 < 2 else 1)), t0 + k * BEAT / 2, .22 * g)
    b += 1; t0 += BAR
fade = np.minimum(1, np.arange(N) / (.8 * SR)) * np.minimum(1, (N - np.arange(N)) / (2.0 * SR)); mus *= fade

# ui sounds
def whoosh(d=.45):
    t = T(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 250, 1400) * (1 - k) + bp(x, 1400, 8000) * k) * np.sin(np.pi * t / d) ** 1.4 * 1.2
def pop(f=700): t = T(.12); return np.sin(2 * np.pi * f * (1 + 7 * t) * t) * np.exp(-t * 38)
def click(): t = T(.04); return hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 170) * .7 + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 120) * .3
def thud(): t = T(.5); return np.sin(2 * np.pi * 55 * (1 + np.exp(-t * 20)) * t) * np.exp(-t * 7) + lp(rng.standard_normal(len(t)), 600) * np.exp(-t * 14) * .5
def riser(d): t = T(d); return bp(rng.standard_normal(len(t)), 600, 7000) * (t / d) ** 2.2 * .6
def hit(): t = T(1.4); return np.sin(2 * np.pi * 45 * t) * np.exp(-t * 3) + lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 5) * .5
sfx = np.zeros(N)
for c in [B(i) for i in (1, 2, 5, 6, 10, 16, 21, 22, 23, 24, 25, 26, 27, 28, 32, 36, 40, 42)] + [END]: put(sfx, whoosh(), c - .2, .5)
for at in [2.2, Wt(5, 2) + .15, Wt(41, 5)] + [Wt(17, k) for k in (1, 3, 5, 9, 11)]: put(sfx, click(), at, .8)
for at in [Wt(2, 0), Wt(3, 7), Wt(4, 0), Wt(7, 3), Wt(7, 6), Wt(8, 0), Wt(8, 2), Wt(8, 5), Wt(18, 4), Wt(19, 1), Wt(20, 2), Wt(34, 0), Wt(34, 2), Wt(34, 7), Wt(41, 0), Wt(41, 3)]: put(sfx, pop(650 + 80 * (int(at * 10) % 4)), at, .45)
for i in range(5): put(sfx, pop(900), B(10) + .3 + i * .15, .3)
put(sfx, thud(), LN[4]["e"] + .55, .8); put(sfx, riser(1.4), B(5) - 1.4, .5); put(sfx, hit(), Wt(42, 1), .8); put(sfx, hit(), END, .6)
env = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .62 * np.convolve(env, np.ones(9600) / 9600, mode="same")
mix = vo + mus * .2 * duck + sfx * .45
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print("wrote", OUT / "mix.wav", round(TOTAL, 2))

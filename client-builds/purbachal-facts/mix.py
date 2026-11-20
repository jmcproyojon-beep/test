"""Soundtrack for the Purbachal 5-facts reel: VO + light editorial bed (piano + pizzicato + soft beat) + cues.

    python3.13 -I mix.py   (in client-builds/purbachal-facts) -> audio/mix.wav
Cue times come from remotion-composer/src/facts/vo.json, the same way Facts.tsx derives them.
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent; OUT = HERE / "audio"
V = json.loads((HERE.parents[1] / "remotion-composer/src/facts/vo.json").read_text()); LN, WD = V["lines"], V["words"]
END = LN[-1]["e"] + 2.6; SR = 48000; N = int(END * SR); rng = np.random.default_rng(11)
B = lambda i: 0 if i <= 0 else (END if i >= len(LN) else (LN[i - 1]["e"] + LN[i]["s"]) / 2)
Wt = lambda i, k: [w for w in WD if w["line"] == i][k]["s"]
SC = [0, B(1), B(3), B(5), B(7), B(9), B(11), END]
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]

BEAT = 60 / 100; BAR = 4 * BEAT
PROG = [(220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (261.6, 329.6, 392.0), (196.0, 246.9, 293.7)]  # Am F C G
def piano(f, d=1.4): t = tt(d); return sum(np.sin(2 * np.pi * f * m * t) * a for m, a in ((1, 1), (2, .35), (3, .12))) * np.exp(-t * 2.6) * np.minimum(1, t / .004)
def pizz(f): t = tt(.25); return np.sin(2 * np.pi * f * t) * np.exp(-t * 16)
def kick(): t = tt(.3); return np.sin(2 * np.pi * 52 * (1 + 2 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
def snap(): t = tt(.12); return bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 40) * .5
def hat(): t = tt(.04); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * 90) * .2
mus = np.zeros(N); beat = np.zeros(N)
b = 0; t0 = 0.0
while t0 < END:
    ch = PROG[b % 4]
    put(mus, piano(ch[0] / 2, BAR), t0, .5); put(mus, piano(ch[1], 1.2), t0, .25); put(mus, piano(ch[2], 1.2), t0 + 2 * BEAT, .22)
    for k in range(8): put(mus, pizz(ch[k % 3] * 2), t0 + k * BEAT / 2, .12 if k % 2 == 0 else .07)
    for k in range(4):
        put(beat, kick(), t0 + k * BEAT, .7 if k in (0, 2) else 0); put(beat, snap(), t0 + k * BEAT, .6 if k in (1, 3) else 0); put(beat, hat(), t0 + k * BEAT + BEAT / 2, 1)
    b += 1; t0 += BAR
g = np.interp(np.arange(N) / SR, [0, SC[1], SC[1] + .3, END - 1.5, END], [0, 0, 1, 1, 0])
music = mus * np.minimum(1, np.arange(N) / (.5 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.5 * SR)) + beat * g * .6

def whoosh(d=.4):
    t = tt(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 300, 1500) * (1 - k) + bp(x, 1500, 8000) * k) * np.sin(np.pi * t / d) ** 1.4
def pop(f=700): t = tt(.14); return np.sin(2 * np.pi * f * (1 + 6 * t) * t) * np.exp(-t * 34)
def tick(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200) * .6
def thud(): t = tt(.4); return np.sin(2 * np.pi * 70 * (1 + np.exp(-t * 18)) * t) * np.exp(-t * 9)
def chime(f=1318.5): t = tt(1.8); return sum(np.sin(2 * np.pi * f * m * t) * a for m, a in ((1, 1), (2.76, .3))) * np.exp(-t * 2.8)
def car(d): t = tt(d); return lp(rng.standard_normal(len(t)), 300) * np.sin(np.pi * t / d) * .7 + np.sin(2 * np.pi * (90 + 30 * t / d) * t) * np.sin(np.pi * t / d) * .2
sfx = np.zeros(N)
for s in SC[1:-1]: put(sfx, whoosh(), s - .2, .6)
put(sfx, whoosh(.6), .15, .5); put(sfx, thud(), 1.55, .8); put(sfx, pop(900), Wt(0, 6), .7)
put(sfx, thud(), SC[1] + .8, .7)
for k in range(24): put(sfx, tick(), LN[2]["s"] + .2 + k * (LN[2]["e"] - LN[2]["s"] - .3) / 24, .6)
put(sfx, thud(), Wt(3, 2) + .1, .6); put(sfx, car(LN[4]["e"] - Wt(3, 4)), Wt(3, 4), .6); put(sfx, thud(), LN[4]["s"] + .1, .6)
put(sfx, pop(600), SC[3] + .3, .6)
for k in range(8): put(sfx, pop(700 + 70 * k), LN[6]["s"] + .1 * k, .35)
put(sfx, thud(), SC[4] + .6, .6); put(sfx, pop(800), Wt(7, 2), .6); put(sfx, car(1.0), LN[8]["s"], .5)
for k in range(14): put(sfx, tick(), Wt(8, 4) + .3 + k * .15, .5)
for k in range(20): put(sfx, tick(), Wt(9, 4) + k * (Wt(9, 7) + .3 - Wt(9, 4)) / 20, .5)
for k in range(5): put(sfx, pop(650 + 80 * k), Wt(9, 6) + .08 * k, .4)
put(sfx, chime(1568), LN[10]["s"], .4); put(sfx, chime(1318.5), SC[6] + .3, .4); put(sfx, chime(1975.5), Wt(12, 2), .35)

y, sr = sf.read(OUT / "vo.wav"); y = y if y.ndim == 1 else y.mean(1)
idx = (np.arange(int(len(y) * SR / sr)) * sr / SR).astype(int); vo = np.zeros(N); n = min(N, len(idx)); vo[:n] = y[np.clip(idx[:n], 0, len(y) - 1)]
vo = hp(vo, 80); vo = vo / (np.abs(vo).max() + 1e-9) * .92
ev = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); ev = np.clip(ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .6 * np.convolve(ev, np.ones(12000) / 12000, mode="same")
mix = vo + music * .22 * duck + sfx * .3
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print("wrote", OUT / "mix.wav", round(END, 2))

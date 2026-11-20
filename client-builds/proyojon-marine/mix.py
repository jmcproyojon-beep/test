"""Soundtrack for the Proyojon Abashon Marine City reel: Bangla VO + an uplifting cinematic bed + cues.

    python3.13 -I mix.py   (in client-builds/proyojon-marine) -> audio/mix.wav

Times mirror the T table in remotion-composer/src/marine/MarineReel.tsx.
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent; OUT = HERE / "audio"; OUT.mkdir(exist_ok=True)
T = dict(plot=3.6, road=7.2, south=10.4, lake=12.6, build=15.4, rise0=16.2, rise1=21.0, flash=21.4, solid1=23.0,
         hero=23.4, studio=27.8, dusk=34.2, spec=38.6, logo=43.8, cta=47.8)
# canonical cue times (54 s timeline) -> video seconds, re-timed by the voiceover like warp() in the TSX
V = json.loads((HERE.parents[1] / "remotion-composer/src/marine/vo.json").read_text())
BEATS = [0, 3.6, 7.2, 10.4, 12.6, 15.4, 23.4, 27.8, 34.2, 38.6, 43.8, 47.8]
ANCH = [(0 if i == 0 else V["lines"][i]["s"] - 0.2, c) for i, c in enumerate(BEATS)] + [(V["lines"][-1]["e"] + 2.5, 54.0)]
vt = lambda c: float(np.interp(c, [a[1] for a in ANCH], [a[0] for a in ANCH]))
T = {k: vt(c) for k, c in T.items()}
TOTAL = ANCH[-1][0]; SR = 48000; N = int(TOTAL * SR); rng = np.random.default_rng(7)
GH, FH, TOP = 3.6, 3.1, 3.6 + 9 * 3.1 + 4.2 + 0.5
tt = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]
def env(n, a, r):  # attack/release envelope in seconds
    k = np.arange(n) / SR; return np.minimum(1, k / max(a, 1e-3)) * np.minimum(1, (n / SR - k) / max(r, 1e-3))
def gain_curve(points):  # piecewise-linear gain over the timeline
    ts, gs = zip(*points); return np.interp(np.arange(N) / SR, ts, gs)

# ---- music: 92 bpm, D major-ish  (D, Bm, G, A)
BEAT = 60 / 92; BAR = 4 * BEAT
PROG = [(146.8, 185.0, 220.0), (123.5, 146.8, 185.0), (98.0, 123.5, 146.8), (110.0, 138.6, 164.8)]
def pad(ch, d):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * m * (1 + dt) * t + p) for f in ch for m, dt, p in ((1, 0, 0), (1, .004, 1.3), (2, -.003, .7)))
    return lp(x, 1800) * env(len(t), .6, .8) * .12
def keys(f, d=1.2):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t) + .15 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 3.2) * np.minimum(1, t / .004)
def sub(f, d): t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), .02, .1)
def kick(): t = tt(.35); return np.sin(2 * np.pi * 48 * (1 + 2.2 * np.exp(-t * 30)) * t) * np.exp(-t * 8)
def snare(): t = tt(.25); return bp(rng.standard_normal(len(t)), 1200, 6000) * np.exp(-t * 18) * .5 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .3
def hat(): t = tt(.05); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * 90) * .22
def tom(f=90): t = tt(.5); return np.sin(2 * np.pi * f * (1 + .6 * np.exp(-t * 12)) * t) * np.exp(-t * 6)

mus = np.zeros(N); drums = np.zeros(N)
b = 0; t0 = 0.0
while t0 < TOTAL:
    ch = PROG[b % 4]
    put(mus, pad(ch, BAR + .6), t0, 1)
    put(mus, sub(ch[0] / 2, BAR - .05), t0, .32)
    for k in range(8):  # arpeggio
        put(mus, keys(ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] * 2), t0 + k * BEAT / 2, .09)
    for k in range(4):
        tb = t0 + k * BEAT
        put(drums, kick(), tb, .9 if k in (0, 2) else .0)
        if k in (1, 3): put(drums, snare(), tb, .6)
        put(drums, hat(), tb + BEAT / 2, 1); put(drums, hat(), tb, .5)
    b += 1; t0 += BAR
# arrangement: soft intro, drums enter for the reveal, pull back for studio & logo, lift for the CTA
mus *= gain_curve([(0, .55), (T["build"], .7), (T["flash"], 1.0), (T["studio"], .9), (T["logo"], .75), (T["cta"], 1.0), (TOTAL - 2.2, 1.0), (TOTAL, 0)])
drums *= gain_curve([(0, 0), (T["plot"] - .1, 0), (T["plot"], .45), (T["build"], .45), (T["build"] + .2, 0), (T["flash"], 0), (T["flash"] + .01, 1),
                     (T["studio"], 1), (T["studio"] + .4, .5), (T["dusk"], .5), (T["dusk"] + .3, .9), (T["logo"] - .2, .9), (T["logo"], 0), (T["cta"], 0), (T["cta"] + .01, 1), (TOTAL - 2, 1), (TOTAL, 0)])
music = mus + drums * .55

# ---- cues
def whoosh(d=.5):
    t = tt(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 250, 1400) * (1 - k) + bp(x, 1400, 8000) * k) * np.sin(np.pi * t / d) ** 1.4 * 1.1
def riser(d): t = tt(d); return bp(rng.standard_normal(len(t)), 500, 7000) * (t / d) ** 2.4 * .6 + np.sin(2 * np.pi * (200 + 600 * (t / d) ** 2) * t) * (t / d) ** 2 * .15
def impact(): t = tt(2.2); return np.sin(2 * np.pi * 42 * t) * np.exp(-t * 2.2) + lp(rng.standard_normal(len(t)), 500) * np.exp(-t * 4) * .6 + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 9) * .25
def tick(f=1800): t = tt(.09); return np.sin(2 * np.pi * f * t) * np.exp(-t * 45) * .7 + hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 120) * .3
def pop(f=700): t = tt(.14); return np.sin(2 * np.pi * f * (1 + 6 * t) * t) * np.exp(-t * 34)
def thud(): t = tt(.5); return np.sin(2 * np.pi * 60 * (1 + np.exp(-t * 20)) * t) * np.exp(-t * 8)
def chime(f=1318.5): t = tt(2.5); return sum(np.sin(2 * np.pi * f * m * t) * a for m, a in ((1, 1), (2.76, .3), (5.4, .12))) * np.exp(-t * 2.2) * np.minimum(1, t / .003)
def shimmer(d=1.8):
    t = tt(d); x = np.zeros(len(t))
    for k in range(14): put_local = int(k * d / 14 * SR); n = min(len(t) - put_local, int(.6 * SR)); x[put_local:put_local + n] += np.sin(2 * np.pi * (2000 + 180 * k) * t[:n]) * np.exp(-t[:n] * 7) * .25
    return x
def hum(d):
    t = tt(d); return (np.sin(2 * np.pi * 110 * t) + .5 * np.sin(2 * np.pi * 220.7 * t) + .25 * np.sin(2 * np.pi * 331 * t)) * (0.6 + .4 * np.sin(2 * np.pi * 6 * t)) * env(len(t), .6, .6) * .18
def ripple(): t = tt(1.2); return np.sin(2 * np.pi * (500 + 300 * np.sin(2 * np.pi * 3 * t)) * t) * np.exp(-t * 3) * .4

sfx = np.zeros(N)
for k in ("plot", "road", "south", "lake", "build", "hero", "studio", "dusk", "spec", "logo", "cta"): put(sfx, whoosh(), T[k] - .25, .55)
put(sfx, whoosh(.9), 0.6, .5)                                         # outline draw
for at in (T["plot"] + .25, T["road"] + .85, T["south"] + .25): put(sfx, thud(), at, .8)   # ground text drops
put(sfx, ripple(), T["lake"] + .4, .7); put(sfx, pop(900), T["lake"] + .55, .5)
put(sfx, hum(T["solid1"] - T["build"]), T["build"] + .2, 1)
for k in range(10): put(sfx, tick(1500 + 70 * k), T["rise0"] + (GH + k * FH) / TOP * (T["rise1"] - T["rise0"]), .7)
put(sfx, riser(1.8), T["flash"] - 1.8, .8); put(sfx, impact(), T["flash"], 1.0)
for k in range(3): put(sfx, pop(700 + 120 * k), T["studio"] + 2.3 + .3 * k, .45)
for k in range(5): put(sfx, pop(650 + 60 * k), T["spec"] + .35 + .32 * k, .4)
put(sfx, chime(), T["spec"] + 2.2, .35)
put(sfx, shimmer(), T["logo"] + .1, .9); put(sfx, chime(1174.7), T["logo"] + 1.0, .55); put(sfx, chime(1760), T["logo"] + 1.05, .3)
put(sfx, impact(), T["cta"], .55)
for k, d in enumerate((0.2, 0.5, 1.0, 1.4, 1.8)): put(sfx, pop(600 + 90 * k), T["cta"] + d, .45)

y, sr = sf.read(OUT / "vo.wav"); y = y if y.ndim == 1 else y.mean(1)
idx = (np.arange(int(len(y) * SR / sr)) * sr / SR).astype(int); vo = np.zeros(N); n = min(N, len(idx)); vo[:n] = y[np.clip(idx[:n], 0, len(y) - 1)]
vo = hp(vo, 80); vo = vo / (np.abs(vo).max() + 1e-9) * .92
ev = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); ev = np.clip(ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .6 * np.convolve(ev, np.ones(14400) / 14400, mode="same")
mix = vo + music * .3 * duck + sfx * .32 * (1 - .35 * (duck < .7))
mix = np.tanh(mix * 1.1) / 1.1
st = np.stack([mix, np.roll(mix, 24)], 1)                             # tiny width
sf.write(OUT / "mix_raw.wav", st, SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print("wrote", OUT / "mix.wav", TOTAL)

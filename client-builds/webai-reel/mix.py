"""Soundtrack for the WebAI reel: the avatars' own lip-synced voice + a light beat + UI sounds.

    python3.13 -I client-builds/webai-reel/mix.py
Reads remotion-composer/public/webai/a1..a5.wav (trimmed clip audio), writes audio/mix.wav.
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent; ROOT = HERE.parents[1]
SRC = ROOT / "remotion-composer/public/webai"; OUT = HERE / "audio"; OUT.mkdir(exist_ok=True)
SR = 48000; STARTS = [0, 9.4, 18.7, 26.55, 34.6]; TOTAL = 41.35
N = int(TOTAL * SR); rng = np.random.default_rng(7)
T = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[: j - i]

# voice: the five trimmed clips back to back, short fades at the joins
vo = np.zeros(N)
for k, s0 in enumerate(STARTS):
    y, sr = sf.read(SRC / f"a{k + 1}.wav"); y = y if y.ndim == 1 else y.mean(1)
    f = int(.012 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    put(vo, y, s0)
vo = hp(vo, 80); vo = vo / (np.abs(vo).max() + 1e-9) * .9

# sounds
def whoosh(d=.35):
    t = T(d); x = rng.standard_normal(len(t)); k = np.linspace(0, 1, len(t))
    return (bp(x, 300, 1500) * (1 - k) + bp(x, 1500, 7000) * k) * np.sin(np.pi * t / d) ** 1.5 * 1.4
def pop(f=700): t = T(.12); return np.sin(2 * np.pi * f * (1 + 8 * t) * t) * np.exp(-t * 40)
def click(): t = T(.04); return hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) * .7 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .3
def key(): t = T(.03); return bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 220) * .5
def chime(fs=(1047, 1319, 1568, 2093)):
    out = np.zeros(int(1.3 * SR))
    for i, f in enumerate(fs): t = T(1.0); put(out, (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 5) * .4, i * .07)
    return out
def riser(d=.9): t = T(d); return bp(rng.standard_normal(len(t)), 800, 6000) * (t / d) ** 2 * .6
sfx = np.zeros(N)
segs = [0, 2.38, 6.48, 9.4, 11.1, 13.54, 15.5, 18.7, 20.4, 21.87, 24.91, 26.55, 28.8, 29.94, 31.0, 34.6, 37.93]
for s in segs[1:]: put(sfx, whoosh(), s - .17, .35)
for s in [0.25, 3.76, 5.56, 6.55, 9.45, 13.6, 18.75, 26.6, 34.7, 37.0]: put(sfx, pop(650 + (int(s * 7) % 5) * 60), s, .4)
for s in [11.24, 12.74, 20.83, 31.06, 32.08]: put(sfx, pop(900), s, .3)
for s in [13.22, 21.31, 33.64, 40.07]: put(sfx, click(), s, .7)
for k in range(int(2.6 / .09)): put(sfx, key(), 15.6 + k * .09 + rng.uniform(0, .03), .5)
put(sfx, whoosh(.3), 18.3, .3); put(sfx, chime((1319, 1568)), 29.38, .35); put(sfx, chime(), 33.95, .45); put(sfx, riser(), 33.0, .3)

# music: light lo-fi bed (pads + soft kick/hat), ducked under the voice
mus = np.zeros(N); BPM = 96; BEAT = 60 / BPM
def pad(fs, d):
    t = T(d); x = sum(np.sin(2 * np.pi * f * t * (1 + dt)) for f in fs for dt in (-.003, .003)) / (2 * len(fs))
    return lp(x, 1800) * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .4)
def kick(): t = T(.3); return np.sin(2 * np.pi * 55 * (1 + 2 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
def hat(): t = T(.05); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * 90) * .25
chords = [(220, 277.2, 329.6), (185, 233.1, 277.2), (246.9, 311.1, 370), (207.7, 261.6, 311.1)]  # A F#m B G#m-ish
b, t0 = 0, 0.0
while t0 < TOTAL:
    put(mus, pad(chords[b % 4], 4 * BEAT + .4) * .5, t0)
    for k in range(4):
        tt = t0 + k * BEAT
        if tt > .4 and tt < TOTAL - 1: put(mus, kick(), tt, .5 if k % 2 == 0 else .25)
        put(mus, hat(), tt + BEAT / 2, .8)
    b += 1; t0 += 4 * BEAT
fade = np.minimum(1, np.arange(N) / (.6 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.2 * SR)); mus *= fade
env = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, mode="same")); env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - .55 * np.convolve(env, np.ones(9600) / 9600, mode="same")
mix = vo + mus * .16 * duck + sfx * .5
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
print("wrote", OUT / "mix.wav")

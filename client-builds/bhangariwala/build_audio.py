"""Music + sound design + mix for the BhangariWala e-waste explainer (30 s).

    python3.13 client-builds/bhangariwala/build_audio.py

Everything is synthesised here (numpy/scipy): a light, modern corporate
underscore at 100 BPM (restrained in parts 1-2, brighter in part 3), and
soft UI-style effects placed on the picture's beats (times mirror
remotion-composer/src/bhangariwala/part*.tsx). Music ducks under the voice;
the mix is normalised to -14 LUFS.
"""
import json, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[2]
A = ROOT / "projects/bhangariwala/audio"
vo = json.loads((ROOT / "remotion-composer/src/bhangariwala/vo.json").read_text())
SR = 48000
TOTAL = vo["total"]
N = int(TOTAL * SR)
rng = np.random.default_rng(7)


def at(needle, nth=0, edge="s"):
    hits = [w for w in vo["words"] if w["w"].startswith(needle)]
    return hits[nth][edge]


t_ = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def add(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    j = min(len(buf), i + len(x)); buf[max(0, i):j] += g * x[max(0, -i):j - i]


def note(f, d, kind="pluck", a=0.005, r=0.3):
    t = t_(d)
    if kind == "pad":
        x = sum(np.sin(2 * np.pi * f * (1 + dt) * t) for dt in (-0.004, 0, 0.005)) / 3
        x += 0.25 * np.sin(2 * np.pi * 2 * f * t)
        e = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
    elif kind == "bell":
        x = sum(np.sin(2 * np.pi * f * m * t) * np.exp(-t * (3 + 2 * m)) / m for m in (1, 2.0, 3.01, 4.2))
        e = np.minimum(1, t / a)
    else:  # soft pluck (filtered triangle-ish)
        x = sum(np.sin(2 * np.pi * f * k * t) / (k * k) for k in (1, 3, 5)) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
        e = np.minimum(1, t / a) * np.exp(-t / r)
    return x * e


def kick():
    t = t_(0.3); f = 48 + 70 * np.exp(-t * 32); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
def clap():
    t = t_(0.18); return bp(rng.normal(0, 1, len(t)), 1200, 6000) * np.exp(-t * 26)
def hat(): t = t_(0.04); return hp(rng.normal(0, 1, len(t)), 8000) * np.exp(-t * 90)


# ------------------------------------------------------------------ music
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
MINOR = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (261.63, 329.63, 392.0), (196.0, 246.94, 293.66)]   # Am F C G
MAJOR = [(261.63, 329.63, 392.0), (196.0, 246.94, 293.66), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63)]   # C G Am F
mus = np.zeros(N)
PAUSE_A, PAUSE_B = 7.9, 9.15        # "everything pauses" on the question
for b in range(int(TOTAL / BAR) + 1):
    t0 = b * BAR
    p3 = t0 >= 20.0 - 0.01
    chords = MAJOR if p3 else MINOR
    c = chords[b % 4]
    for f in c:
        add(mus, note(f / 2, BAR + 0.3, "pad"), t0, 0.05 if not p3 else 0.06)
    for k in range(4):
        bt = t0 + k * BEAT
        if PAUSE_A <= bt < PAUSE_B or bt < 1.8:
            continue
        add(mus, kick(), bt, 0.55 if k in (0, 2) else 0.0)
        if k in (1, 3) and (p3 or bt > 10.0): add(mus, clap(), bt, 0.18)
        add(mus, hat(), bt + BEAT / 2, 0.22)
    for k in range(8):                                  # pluck arpeggio
        tt = t0 + k * BEAT / 2
        if PAUSE_A <= tt < PAUSE_B:
            continue
        f = c[k % 3] * (2 if k % 4 < 2 else 1)
        add(mus, note(f, 0.6, "pluck", r=0.16), tt, 0.09 if tt > 1.0 else 0.05)
    for k in range(2):                                  # bass
        if not (PAUSE_A <= t0 + k * 2 * BEAT < PAUSE_B):
            add(mus, lp(note(c[0] / 4, 2 * BEAT, "pluck", r=0.5), 400), t0 + k * 2 * BEAT, 0.35)
# riser into the push-in, and the end chord
rt = t_(1.0); add(mus, bp(rng.normal(0, 1, len(rt)), 300, 6000) * (rt / 1.0) ** 2, 9.05, 0.35)
for f in MAJOR[0]:
    add(mus, note(f, 2.2, "pad"), TOTAL - 2.2, 0.1)
mus = lp(mus, 11000)

# duck under the voice
v, _ = sf.read(A / "vo.wav")
if v.ndim > 1: v = v.mean(1)
v = np.pad(v, (0, max(0, N - len(v))))[:N]
e = np.sqrt(np.convolve(v ** 2, np.ones(4800) / 4800, mode="same"))
e = np.clip(e / (np.percentile(e[e > 1e-4], 90) + 1e-9), 0, 1)
mus *= 1 - 0.55 * np.convolve(e, np.ones(9600) / 9600, mode="same")

# ------------------------------------------------------------------ sfx
fx = np.zeros(N)


def whoosh(d=0.5, lo=300, hi=3300):
    n = rng.normal(0, 1, int(d * SR)); t = t_(d); out = np.zeros_like(n)
    for k in range(10):
        a, b = int(k * len(n) / 10), int((k + 1) * len(n) / 10); f = lo + (hi - lo) * k / 10
        out[a:b] = bp(n, f, f * 2.2)[a:b]
    return out * np.sin(np.pi * t / d) ** 2
def pop(f=900): t = t_(0.09); return np.sin(2 * np.pi * (f - 3800 * t) * t) * np.exp(-t * 55)
def click(): t = t_(0.025); return hp(rng.normal(0, 1, len(t)), 2500) * np.exp(-t * 220)
def clack(): t = t_(0.07); return bp(rng.normal(0, 1, len(t)), 800, 3500) * np.exp(-t * 70) + 0.4 * np.sin(2 * np.pi * 320 * t) * np.exp(-t * 60)
def chime(f=1046.5): return note(f, 1.4, "bell")
def thump():
    t = t_(0.6); f = 40 + 60 * np.exp(-t * 10)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + 0.2 * lp(rng.normal(0, 1, len(t)), 600) * np.exp(-t * 9)
def hum(d):
    t = t_(d); return lp(np.sin(2 * np.pi * 55 * t) + 0.5 * np.sign(np.sin(2 * np.pi * 110 * t)), 500) * np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.3)


# part 1
add(fx, whoosh(1.0, 150, 1500), 0.0, 0.35)
for c in (0.8, 1.05): add(fx, chime(1318.5), c, 0.12)
for i in range(6): add(fx, pop(800 + i * 60), 1.0 + i * 0.17, 0.28)
for i in range(46): add(fx, clack(), 2.0 + 0.05 * i + 0.5, 0.08 + 0.04 * (i % 3))
c0, c1 = at("৩৬৭") - 0.15, at("৩৬৭", 0, "e")
for k in range(int((c1 - c0) / 0.06)): add(fx, click(), c0 + k * 0.06, 0.16)
add(fx, thump(), c1, 0.55); add(fx, chime(1567.98), c1, 0.12)
add(fx, whoosh(0.6), 4.8, 0.32)
add(fx, chime(1174.66), 5.5, 0.14)
for i in range(18): add(fx, clack(), 5.3 + i * 0.09 + 0.48, 0.12)
add(fx, whoosh(0.5, 400, 2500), 6.95, 0.3)
for i in range(10): add(fx, clack(), 7.4 + i * 0.05, 0.1)
add(fx, pop(600), 7.75, 0.4)
add(fx, whoosh(0.9, 200, 5000), 9.15, 0.45)
# part 2
add(fx, whoosh(0.7, 3000, 300), 9.95, 0.3)
for i in range(3): add(fx, whoosh(0.35, 600, 2400), 10.85 + i * 0.12, 0.14)
for k in (at("মিশে") - 0.2, at("মিশে") + 0.6, at("সাধারণ") + 0.6):
    add(fx, whoosh(0.4, 500, 1800), k, 0.16); add(fx, pop(500), k + 0.45, 0.28)
add(fx, whoosh(0.5), 14.6, 0.25)
for k in (at("unsafe"), at("পরিবেশ"), at("স্বাস্থ্য"), at("data")):
    add(fx, pop(700), k, 0.3); add(fx, note(660, 0.6, "bell") * 0.6, k + 0.25, 0.08)
add(fx, whoosh(0.7, 2500, 400), 17.8, 0.3)
add(fx, pop(520), 18.45, 0.42)
# part 3
add(fx, whoosh(0.8, 300, 4000), 20.0, 0.3)
for i, f in enumerate((783.99, 1046.5, 1318.5)): add(fx, chime(f), 20.35 + i * 0.16, 0.16)
add(fx, thump(), 20.95, 0.3)
add(fx, whoosh(0.45), 21.4, 0.22)
for k in (21.8, 22.7, 23.55, 24.4): add(fx, click(), k, 0.4); add(fx, pop(1000), k + 0.02, 0.15)
for k in (22.7, 23.55, 24.4): add(fx, whoosh(0.45, 400, 2600), k - 0.15, 0.2)
for i in range(4): add(fx, pop(900 + i * 80), 21.95 + i * 0.14 + 0.45, 0.2)
add(fx, hum(0.9), 22.6, 0.2); add(fx, clack(), 23.45, 0.3)
add(fx, chime(1567.98), 24.1, 0.16)
for i in range(16): add(fx, click(), 24.7 + i * 0.08, 0.1)
add(fx, whoosh(0.8, 2500, 300), 25.9, 0.28)
for i in range(8): add(fx, note(880 * (1.0595 ** (i * 2)), 0.4, "bell"), 26.6 + i * 0.09, 0.05)
add(fx, whoosh(0.6), 27.9, 0.25)
for i, f in enumerate((1046.5, 1318.5, 1567.98, 2093.0)): add(fx, chime(f), 28.0 + i * 0.12, 0.12)
add(fx, pop(800), 28.15, 0.25); add(fx, pop(900), 28.55, 0.25); add(fx, thump(), 29.0, 0.35)

# ------------------------------------------------------------------ mix
mix = v * 1.0 + mus * 0.55 + fx * 0.38
mix = np.tanh(mix * 1.1) / 1.1
st = np.stack([mix, mix], 1)
sf.write(A / "mix_raw.wav", st, SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(A / "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR),
                str(A / "mix.wav")], check=True)
print("wrote", A / "mix.wav")

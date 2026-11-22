"""Music + sound design + mix for the 60 s BhangariWala journey.

    python3.13 -I client-builds/bw-journey/mix.py
      -> client-builds/bw-journey/audio/mix.wav  (and a copy in remotion-composer/public/bwj/)

All synthesised (numpy/scipy): a calm, modern underscore at 100 BPM (C-G-Am-F, warmer in
part 6, a soft sting on the logo) and quiet UI-style effects on the picture's beats (times
mirror remotion-composer/src/bwjourney/parts*.tsx). The music ducks under the client's voice
and sits well below it; the mix is normalised to -15 LUFS (two-pass loudnorm).
"""
import json, re, shutil, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

HERE = Path(__file__).parent
ROOT = HERE.parents[1]
A = HERE / "audio"
SR = 48000
TOTAL = 60.0
N = int(TOTAL * SR)
rng = np.random.default_rng(11)

t_ = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    j = min(len(buf), i + len(x)); buf[max(0, i):j] += g * x[max(0, -i):j - i]

def note(f, d, kind="pluck", a=0.005, r=0.3):
    t = t_(d)
    if kind == "pad":
        x = sum(np.sin(2 * np.pi * f * (1 + dt) * t) for dt in (-0.004, 0, 0.005)) / 3 + 0.2 * np.sin(2 * np.pi * 2 * f * t)
        e = np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5)
    elif kind == "bell":
        x = sum(np.sin(2 * np.pi * f * m * t) * np.exp(-t * (3 + 2 * m)) / m for m in (1, 2.0, 3.01, 4.2))
        e = np.minimum(1, t / a)
    else:
        x = sum(np.sin(2 * np.pi * f * k * t) / (k * k) for k in (1, 3, 5)) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
        e = np.minimum(1, t / a) * np.exp(-t / r)
    return x * e
def kick(): t = t_(0.3); f = 48 + 60 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)
def shaker(): t = t_(0.06); return hp(rng.normal(0, 1, len(t)), 7000) * np.exp(-t * 70)

# ------------------------------------------------------------------ music
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
PROG = [(261.63, 329.63, 392.0), (196.0, 246.94, 293.66), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63)]   # C G Am F
mus = np.zeros(N)
END = 57.0                     # logo sting
for b in range(int(TOTAL / BAR) + 1):
    t0 = b * BAR
    if t0 >= END: break
    c = PROG[b % 4]
    warm = 1.25 if t0 >= 50 else 1.0
    for f in c: add(mus, note(f / 2, BAR + 0.5, "pad"), t0, 0.045 * warm)
    for k in range(4):
        bt = t0 + k * BEAT
        if bt < 1.0 or bt >= END: continue
        if k in (0, 2): add(mus, kick(), bt, 0.32)
        add(mus, shaker(), bt + BEAT / 2, 0.12)
    for k in range(8):
        tt = t0 + k * BEAT / 2
        if tt >= END: continue
        f = c[k % 3] * (2 if k % 4 < 2 else 1)
        add(mus, note(f, 0.6, "pluck", r=0.15), tt, 0.065 * warm)
    for k in range(2):
        if t0 + k * 2 * BEAT < END: add(mus, lp(note(c[0] / 4, 2 * BEAT, "pluck", r=0.5), 380), t0 + k * 2 * BEAT, 0.3)
# riser into the logo, then the end chord with a bell line
rt = t_(1.2); add(mus, bp(rng.normal(0, 1, len(rt)), 300, 5000) * (rt / 1.2) ** 2, END - 1.2, 0.18)
for f in PROG[0]: add(mus, note(f, 3.0, "pad"), END, 0.1); add(mus, note(f / 2, 3.0, "pad"), END, 0.06)
for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)): add(mus, note(f, 1.8, "bell"), END + 0.05 + i * 0.14, 0.12)
fade = np.ones(N); k0 = int(59.0 * SR); fade[k0:] = np.linspace(1, 0, N - k0); mus *= fade
mus = lp(mus, 10000)

# duck under the voice
v, sr = sf.read(A / "vo.wav")
assert sr == SR
if v.ndim > 1: v = v.mean(1)
v = np.pad(v, (0, max(0, N - len(v))))[:N]
e = np.sqrt(np.convolve(v ** 2, np.ones(4800) / 4800, mode="same"))
e = np.clip(e / (np.percentile(e[e > 1e-4], 90) + 1e-9), 0, 1)
mus *= 1 - 0.6 * np.convolve(e, np.ones(9600) / 9600, mode="same")

# ------------------------------------------------------------------ sfx (kept soft: nothing should mask the voice)
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
    t = t_(0.5); f = 40 + 55 * np.exp(-t * 10)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + 0.2 * lp(rng.normal(0, 1, len(t)), 600) * np.exp(-t * 10)
def buzz(): t = t_(0.28); return lp(np.sign(np.sin(2 * np.pi * 140 * t)), 900) * np.exp(-t * 6)
def hum(d, f0=55):
    t = t_(d); return lp(np.sin(2 * np.pi * f0 * t) + 0.4 * np.sign(np.sin(2 * np.pi * 2 * f0 * t)), 420) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)
def slide(d=0.35): t = t_(d); return bp(rng.normal(0, 1, len(t)), 500, 1800) * np.sin(np.pi * t / d)
def beep(f=1760): t = t_(0.12); return np.sin(2 * np.pi * f * t) * np.exp(-t * 30)

for s in (10, 20, 30, 40, 50): add(fx, whoosh(0.8, 2400, 300), s - 0.4, 0.22)                  # seams
# part 1
add(fx, slide(0.6), 0.3, 0.25); add(fx, slide(0.5), 0.45, 0.2)                               # almirah + drawer
for i in range(8): add(fx, whoosh(0.4, 800, 3000), 0.6 + i * 0.13, 0.06); add(fx, pop(900 + i * 40), 1.45 + i * 0.13, 0.12)
add(fx, buzz(), 4.12, 0.1)
for i in range(8): add(fx, clack(), 4.95 + i * 0.1, 0.08)
add(fx, chime(1318.5), 5.48, 0.12)
add(fx, whoosh(0.6, 300, 2500), 5.95, 0.2)
add(fx, click(), 7.18, 0.45); add(fx, pop(1200), 7.2, 0.15)
for i, f in enumerate((1046.5, 1318.5, 1567.98)): add(fx, chime(f), 7.45 + i * 0.1, 0.1)
for i in range(8): add(fx, click(), 8.6 + i * 0.12, 0.07)
add(fx, hum(1.0), 9.5, 0.15)
# part 2
add(fx, hum(3.0), 10.0, 0.16)
add(fx, whoosh(0.6, 1500, 300), 12.6, 0.12)
add(fx, whoosh(0.5, 400, 2200), 13.2, 0.18)
add(fx, whoosh(0.6, 500, 1500), 13.95, 0.14)
add(fx, slide(0.3), 14.75, 0.2)
for i in range(5): add(fx, pop(1000 + i * 70), 15.0 + i * 0.13, 0.12)
for i in range(3): add(fx, pop(700 + i * 120), 15.95 + i * 0.28, 0.18)
add(fx, chime(1567.98), 16.55, 0.08)
add(fx, slide(0.4), 17.05, 0.22); add(fx, thump(), 17.75, 0.22); add(fx, slide(0.3), 17.85, 0.2)
add(fx, hum(1.9, 60), 18.2, 0.17)
# part 3
add(fx, thump(), 20.75, 0.35); add(fx, slide(0.3), 21.05, 0.2)
for i in range(10): add(fx, clack(), 21.35 + i * 0.05, 0.08)
add(fx, whoosh(0.6, 300, 3000), 22.35, 0.18)
for i in range(20): add(fx, pop(800 + (i % 5) * 90), 23.05 + i * 0.15 + 0.5, 0.09)
for i in range(3): add(fx, chime(1318.5 + i * 200), 26.6 + i * 0.15, 0.07)
add(fx, whoosh(1.2, 200, 1500), 27.55, 0.12)
# part 4
for i in range(3): add(fx, pop(700 + i * 100), 30.05 + i * 0.12, 0.15)
for i in range(9): add(fx, beep(1600 + (i % 3) * 200), 30.75 + i * 0.14, 0.035)
rt = t_(0.8); add(fx, bp(rng.normal(0, 1, len(rt)), 400, 4000) * (rt / 0.8), 32.4, 0.12)
add(fx, chime(880), 33.2, 0.12); add(fx, click(), 33.9, 0.4); add(fx, pop(600), 33.92, 0.2)
for i in range(3): add(fx, pop(900 + i * 100), 34.3 + i * 0.35, 0.15)
add(fx, hum(2.8, 70), 36.0, 0.1)
for k in range(3): add(fx, beep(2093), 37.04 + k * 0.45, 0.06); add(fx, beep(2637), 37.12 + k * 0.45, 0.05)
add(fx, thump(), 37.95, 0.2)
for i in range(6): add(fx, note(1567.98 * 1.0595 ** (i * 2), 0.5, "bell"), 38.2 + i * 0.08, 0.03)
# part 5
add(fx, whoosh(1.0, 200, 3000), 41.3, 0.2)
for i in range(6): add(fx, click(), 42.1 + i * 0.12, 0.2)
for i in range(6): add(fx, pop(600 + i * 60), 43.9 + i * 0.07, 0.1)
for i in range(6): add(fx, whoosh(0.4, 600, 2400), 44.25 + i * 0.28, 0.08); add(fx, clack(), 44.8 + i * 0.28, 0.14)
add(fx, whoosh(1.4, 300, 2000), 45.4, 0.1)
for i, f in enumerate((1046.5, 1318.5)): add(fx, chime(f), 46.5 + i * 0.12, 0.08)
# part 6
for i in range(4): add(fx, whoosh(0.6, 400, 2600), 50.1 + i * 0.28, 0.1)
add(fx, whoosh(0.8, 300, 2000), 52.7, 0.14)
for i in range(8): add(fx, pop(900 + i * 60), 53.05 + i * 0.24, 0.08)
add(fx, whoosh(0.6, 2500, 400), 55.05, 0.16); add(fx, thump(), 55.4, 0.2)
for i in range(4): add(fx, pop(1000 + i * 80), 56.1 + i * 0.12, 0.08)
add(fx, pop(700), 58.7, 0.15)

# ------------------------------------------------------------------ mix
mix = v * 1.0 + mus * 0.42 + fx * 0.3
peak = np.abs(mix).max(); mix = mix / max(1.0, peak / 0.95)
sf.write(A / "mix_raw.wav", np.stack([mix, mix], 1), SR)
I, TP, LRA = -15, -1.5, 11
m = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", str(A / "mix_raw.wav"), "-af", f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-i", str(A / "mix_raw.wav"), "-af", af, "-ar", str(SR), str(A / "mix.wav")], check=True)
shutil.copy(A / "mix.wav", ROOT / "remotion-composer/public/bwj/mix.wav")
print("wrote", A / "mix.wav")

"""Original music bed for "The Green Crest" (63 s): warm piano arpeggios over soft pads and a light pulse,
building into the call-to-action, synthesised with numpy/scipy. -16 LUFS.
    python3.13 -I music.py -> audio/music.wav and remotion-composer/public/gc/music.wav"""
import json, shutil, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
HERE = Path(__file__).parent
SR, DUR = 48000, 63.0
N = int(SR * DUR)
rng = np.random.default_rng(5)
t_ = lambda d: np.arange(int(d * SR)) / SR
lp = lambda x, f: sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f: sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += g * x[: j - i]
def piano(f, d=2.4):
    t = t_(d)
    x = sum(np.sin(2 * np.pi * f * k * t + k) * np.exp(-t * (1.6 + 1.2 * k)) / k ** 1.3 for k in (1, 2, 3, 4, 5))
    return x * np.minimum(1, t / 0.004)
def pad(f, d):
    t = t_(d)
    x = sum(np.sin(2 * np.pi * f * (1 + dt) * t) for dt in (-0.003, 0, 0.004)) / 3
    return lp(x, 1800) * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2)
def kick():
    t = t_(0.35); f = 45 + 50 * np.exp(-t * 28); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def tick(): t = t_(0.05); return hp(rng.normal(0, 1, len(t)), 6000) * np.exp(-t * 80)
BPM = 84; BEAT = 60 / BPM; BAR = 4 * BEAT
CH = [(261.63, 329.63, 392.0, 493.88), (220.0, 261.63, 329.63, 392.0), (174.61, 220.0, 261.63, 329.63), (196.0, 246.94, 293.66, 392.0)]
mus = np.zeros(N); perc = np.zeros(N)
for b in range(int(DUR / BAR) + 1):
    t0 = b * BAR; c = CH[b % 4]
    for f in c[:3]: add(mus, pad(f / 2, BAR + 1.0), t0, 0.05)
    add(mus, lp(piano(c[0] / 4, 3.0), 300), t0, 0.22)
    for k in range(8):
        tt = t0 + k * BEAT / 2
        f = c[[0, 1, 2, 3, 2, 1, 2, 3][k]] * (2 if k in (3, 7) else 1)
        add(mus, piano(f), tt, 0.07 * (1.0 if k % 2 == 0 else 0.7))
    if t0 >= 4.5 and t0 < 55:
        for k in range(4):
            add(perc, kick(), t0 + k * BEAT, 0.28 if k % 2 == 0 else 0.12)
            add(perc, tick(), t0 + k * BEAT + BEAT / 2, 0.05)
# swells at the section changes, and the end chord
for s in (4.5, 12.5, 31.0, 49.0, 55.5):
    rt = t_(1.4); add(mus, lp(rng.normal(0, 1, len(rt)), 2600) * (rt / 1.4) ** 2, s - 1.4, 0.05)
for f in (261.63, 329.63, 392.0, 523.25): add(mus, piano(f, 6.0), 55.5, 0.1); add(mus, pad(f / 2, 7.0), 55.5, 0.06)
mix = mus + perc
fade = np.ones(N); k0 = int(60.6 * SR); fade[k0:] = np.linspace(1, 0, N - k0) ** 1.5
fi = int(0.4 * SR); fade[:fi] *= np.linspace(0, 1, fi)
mix = mix * fade; mix /= np.abs(mix).max() / 0.9
(HERE / "audio").mkdir(exist_ok=True)
sf.write(HERE / "audio/raw.wav", np.stack([mix, mix], 1), SR)
m = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", str(HERE / "audio/raw.wav"), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(HERE / "audio/raw.wav"), "-af", af, "-ar", str(SR), str(HERE / "audio/music.wav")], check=True)
shutil.copy(HERE / "audio/music.wav", HERE.parents[1] / "remotion-composer/public/gc/music.wav")
print("music ok")

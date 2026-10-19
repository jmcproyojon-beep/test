"""Original score + sound design + dialogue mix for মিষ্টির প্যাকেট (synthesized, royalty-free)."""
import json, subprocess
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

P = "/home/user/test/projects/mishtir-packet"
SCH = json.load(open(f"{P}/artifacts/schedule.json"))
SR, DUR = 48000, 70.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(19)


def lp(x, f, o=2):
    b, a = butter(o, f / (SR / 2)); return lfilter(b, a, x)


def hp(x, f, o=2):
    b, a = butter(o, f / (SR / 2), "high"); return lfilter(b, a, x)


def env(a, b, fi=1.5, fo=1.5):
    e = np.zeros(N); i0, i1 = int(a * SR), int(b * SR)
    seg = np.ones(i1 - i0); k1, k2 = int(fi * SR), int(fo * SR)
    seg[:k1] = np.linspace(0, 1, k1) ** 2; seg[-k2:] = np.linspace(1, 0, k2) ** 2
    e[i0:i1] = seg; return e


def cello(f, a, b, amp=1.0, fi=2, fo=2):
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    x = sum((1 / k) * np.sin(k * ph) for k in range(1, 9))
    return lp(x, 900) * env(a, b, fi, fo) * amp


def piano(f, at, amp=1.0, dec=3.2):
    y = np.zeros(N); i = int(at * SR); n = min(N - i, int(6 * SR)); tt = np.arange(n) / SR
    s = sum((0.6 ** (k - 1)) * np.sin(2 * np.pi * f * k * tt * (1 + 0.0004 * k)) for k in range(1, 6))
    s *= np.exp(-tt * (1.2 if dec > 3 else 2)) * (1 - np.exp(-tt * 300))
    y[i:i + n] = s * amp; return y


music = np.zeros(N)
# S1–S2: tense low cello drone (D2 + A2), drops to one low note (D2) at the salary question
music += cello(73.42, 0.0, 16.4, 0.9, 2.5, 0.6) + cello(110.0, 1.5, 16.2, 0.45, 3, 0.5)
music += cello(73.42, 16.0, 21.5, 0.85, 0.15, 2.5)                     # single low note under "বেতন কত পায়?"
# S3: soft unsettled drone (D2 + Eb3 whisper)
music += cello(73.42, 20.5, 30.8, 0.55, 2, 1.5) + cello(155.56, 23, 30.5, 0.12, 3, 2)
# S4: flight — gentle motion, low pulse
music += cello(65.41, 30.2, 40.8, 0.6, 1.5, 1.5) + cello(98.0, 31, 40.6, 0.3, 2, 2)
# S5: cold reveal — darker, minor-second rub
music += cello(61.74, 40.2, 50.8, 0.75, 1.2, 1.5) + cello(65.41, 42, 50.5, 0.18, 3, 2)
# S6: warm room, quiet drone + a single soft sad piano note
music += cello(73.42, 50.3, 60.6, 0.4, 2, 2) + piano(220.0, 53.0, 0.55)
# S7: dawn — resolve softly (D major colour), silence in the final second
music += cello(73.42, 60.2, 68.9, 0.45, 2.5, 2.2) + cello(110.0, 61, 68.9, 0.25, 3, 2.2)
for f, at, a in [(293.66, 60.8, .35), (369.99, 61.0, .25), (440.0, 61.2, .22), (293.66, 66.4, .25), (220.0, 66.6, .28)]:
    music += piano(f, at, a)
music /= np.max(np.abs(music)) + 1e-9

# ambience: distant city (brown noise), room tone, wind for the flight
brown = np.cumsum(rng.standard_normal(N)); brown = hp(brown - np.convolve(brown, np.ones(4800) / 4800, "same"), 40)
brown /= np.max(np.abs(brown)) + 1e-9
city = lp(brown, 500) * (env(0, 30.5, .5, 1) * .9 + env(40, 60.6, 1, 1) * .7 + env(60, 69, 1, 1.5) * .45)
wind = lp(hp(rng.standard_normal(N), 200), 1400) * env(30.4, 40.8, 1.2, 1.2) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t))
sfx = np.zeros(N)


def put(at, sig, g):
    i = int(at * SR); n = min(len(sig), N - i); sfx[i:i + n] += g * sig[:n]


def bell(f, d=1.4):
    tt = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt * 3.5)


put(4.55, bell(659.25), .35); put(4.95, bell(523.25), .35)             # doorbell (ding-dong)
for k in range(10):                                                    # ticking clock under scene 3
    tk = np.arange(int(.025 * SR)) / SR
    put(20.5 + k, np.sin(2 * np.pi * 2400 * tk) * np.exp(-tk * 260), .12)
for k in range(30):                                                    # soft wing flaps
    n = int(.22 * SR); w = lp(rng.standard_normal(n), 900) * np.hanning(n)
    put(31.0 + k * .32, w, .35 if k % 2 == 0 else .25)
for at in (8.3, 46.0):                                                 # far-off horns
    tt = np.arange(int(.7 * SR)) / SR
    put(at, lp(np.sign(np.sin(2 * np.pi * 330 * tt)), 900) * np.hanning(len(tt)), .03)
put(67.0, piano(880, 0, .0)[:10], 0)

# dialogue track
dia = np.zeros(N)
for lid, s in SCH.items():
    a, sr = sf.read(s["wav"]); a = a if a.ndim == 1 else a.mean(1)
    f = int(.012 * SR); g = int(.07 * SR); a = a.copy(); a[:f] *= np.linspace(0, 1, f); a[-g:] *= np.linspace(1, 0, g) ** 1.5
    i = int(s["start"] * SR); n = min(len(a), N - i); dia[i:i + n] += a[:n]

# ducking envelope from dialogue
de = np.convolve(np.abs(dia), np.ones(2400) / 2400, "same")
duck = 1 - 0.55 * np.clip(de / (de.max() * .25 + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(9600) / 9600, "same")

mix = dia * 1.0 + music * 0.20 * duck + city * 0.05 + wind * 0.10 * duck + sfx * 0.9
mix[int(69.0 * SR):] = 0.0                                             # last second silent
k = int(.25 * SR); mix[int(69.0 * SR) - k:int(69.0 * SR)] *= np.linspace(1, 0, k)
sf.write(f"{P}/assets/audio/premix.wav", np.stack([mix, mix], 1).astype(np.float32), SR)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{P}/assets/audio/premix.wav", "-af", "loudnorm=I=-14:TP=-3:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
d = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{P}/assets/audio/premix.wav", "-af",
                f"loudnorm=I=-14:TP=-3:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true,alimiter=limit=0.58:attack=1:release=50:level=false,atrim=0:70",
                "-ar", "48000", f"{P}/assets/audio/final_mix.wav"], check=True)
print("mixed")

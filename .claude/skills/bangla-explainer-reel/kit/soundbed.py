"""Synthesize the music bed + SFX from cues.json into hyperframes/assets/soundbed.wav."""
import json, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).parent
SR = 48000
rng = np.random.default_rng(7)
cfg = json.loads((ROOT / "cues.json").read_text())
N = int(cfg["duration"] * SR)
t_all = np.arange(N) / SR


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1.0) * np.exp(-t / d)


def lp(x, cutoff):
    # one-pole low-pass via exponential smoothing (vectorised in blocks is overkill; loop is fine)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def sweep(n, f0, f1):
    f = np.geomspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def noise(n):
    return rng.standard_normal(n)


def sfx(kind):
    if kind == "boom":
        n = int(1.2 * SR); return 1.0 * sweep(n, 120, 35) * env(n, 0.003, 0.35) + 0.25 * lp(noise(n), 900) * env(n, 0.001, 0.08)
    if kind == "bass":
        n = int(0.8 * SR); return 0.9 * sweep(n, 90, 40) * env(n, 0.002, 0.22)
    if kind == "whoosh":
        n = int(0.45 * SR); w = np.sin(np.linspace(0, np.pi, n)) ** 2
        return 0.5 * (noise(n) - lp(noise(n), 300)) * w * np.linspace(0.3, 1, n)
    if kind in ("pop", "pop2"):
        n = int(0.09 * SR); f = 900 if kind == "pop" else 1150
        return 0.45 * sweep(n, f * 1.6, f) * env(n, 0.001, 0.025)
    if kind == "tick":
        n = int(0.05 * SR); return 0.4 * np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * env(n, 0.0005, 0.01)
    if kind == "ding":
        n = int(0.9 * SR); t = np.arange(n) / SR
        return 0.28 * (np.sin(2 * np.pi * 1760 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t)) * env(n, 0.002, 0.25)
    if kind == "riser":
        n = int(1.6 * SR); r = np.linspace(0, 1, n) ** 2
        return 0.3 * (sweep(n, 200, 1600) * 0.5 + (noise(n) - lp(noise(n), 800)) * 0.5) * r
    if kind == "glitch":
        n = int(0.35 * SR); g = np.sign(np.sin(2 * np.pi * 60 * np.arange(n) / SR)) * noise(n)
        gate = (np.floor(np.arange(n) / (SR * 0.03)) % 2)
        return 0.25 * g * gate
    if kind == "buzz":
        n = int(0.4 * SR); return 0.25 * np.sign(np.sin(2 * np.pi * 110 * np.arange(n) / SR)) * env(n, 0.002, 0.3)
    if kind == "click":
        n = int(0.03 * SR); return 0.5 * noise(n) * env(n, 0.0005, 0.004)
    if kind == "key":
        out = np.zeros(int(0.6 * SR))
        for k, off in enumerate((0.5, 0.7)):
            n = int(0.03 * SR); i = int((off - 0.45) * SR)
            out[i:i + n] += 0.4 * lp(noise(n), 3000) * env(n, 0.0005, 0.006)
        return out
    if kind == "flash":
        n = int(1.0 * SR); return 0.9 * sweep(n, 100, 38) * env(n, 0.002, 0.3)
    raise ValueError(kind)


# ---- music bed: 104 BPM, minor tech/lo-fi pulse ----
bpm = 104; beat = 60 / bpm
music = np.zeros(N)
kick_n = int(0.35 * SR); kick = sweep(kick_n, 140, 45) * env(kick_n, 0.001, 0.12)
hat_n = int(0.05 * SR); hat = (noise(hat_n) - lp(noise(hat_n), 6000)) * env(hat_n, 0.0005, 0.012)
roots = [55.0, 55.0, 43.65, 49.0]  # A, A, F, G (bass)
drop_t = cfg["drop_t"]
b = 0
while b * beat < cfg["duration"] - 0.5:
    t0 = b * beat; i = int(t0 * SR)
    if not (drop_t - 0.45 < t0 < drop_t):  # silence gap right before the drop
        if b % 2 == 0 or t0 >= drop_t:
            music[i:i + kick_n] += 0.8 * kick[: max(0, min(kick_n, N - i))]
        for h in (0, 0.5):
            j = int((t0 + h * beat) * SR)
            if j + hat_n < N:
                music[j:j + hat_n] += 0.18 * hat
        bar = (b // 4) % 4
        bn = int(beat * SR * 0.9); tb = np.arange(bn) / SR
        bass = np.sin(2 * np.pi * roots[bar] * tb) * env(bn, 0.01, 0.35)
        music[i:i + bn] += 0.35 * bass[: max(0, min(bn, N - i))]
    b += 1
# soft pad chord
pad = sum(np.sin(2 * np.pi * f * t_all) for f in (220.0, 261.63, 329.63)) * 0.05
music += lp(pad, 1200)
# section levels: tense middle a bit lower, full after drop
lvl = np.full(N, 0.55)
lvl[(t_all >= cfg["tense"][0]) & (t_all < cfg["tense"][1])] = 0.42
lvl[t_all >= drop_t] = 0.75
lvl[t_all > cfg["duration"] - 0.8] *= np.linspace(1, 0, int(np.sum(t_all > cfg["duration"] - 0.8)))
mix = music * lvl
sfx_bus = np.zeros(N)

for c in cfg["cues"]:
    s = sfx(c["sfx"]); off = c["t"]
    if c["sfx"] == "riser":
        off = c["end"] - 1.6  # riser peaks at the end of its line
    elif c["sfx"] == "whoosh":
        off = c["t"] - 0.22  # whoosh straddles the cut
    i = max(0, int(off * SR)); n = min(len(s), N - i)
    sfx_bus[i:i + n] += s[:n]

def write(name, x, gain):
    pcm = (np.clip(x * gain, -1, 1) * 32767).astype(np.int16)
    out = ROOT / name
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("wrote", out)

# voice-ready levels: music sits ~-24 LUFS-ish under a -14 LUFS voice, SFX punch through
m = mix / np.max(np.abs(mix)) * 0.16
f = sfx_bus / np.max(np.abs(sfx_bus)) * 0.55
write("renders/stems/music.wav", m, 1.0)
write("renders/stems/sfx.wav", f, 1.0)
# voiceover on top (already -14 LUFS-ish); music ducks a further ~4 dB while voice is active
vo_raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "voice/vo_clean.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                        capture_output=True, check=True).stdout
vo = np.zeros(N); v = np.frombuffer(vo_raw, dtype=np.float32)[:N]; vo[:len(v)] = v
act = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
duck = 1.0 - 0.4 * np.clip(act * 4, 0, 1)
full = m * duck + f * 0.8 + vo * 1.15
write("hyperframes/assets/soundbed.wav", full / max(1.0, np.max(np.abs(full)) / 0.95), 1.0)
write("renders/stems/voice.wav", vo, 1.0)

"""Chiptune sound bed for the arcade concept: square-wave lead + pulse bass + noise drums,
8-bit SFX on cues, voice on top with music ducking. Writes hyperframes/assets/soundbed.wav + stems."""
import json, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).parent
SR = 48000
rng = np.random.default_rng(3)
cfg = json.loads((ROOT / "cues.json").read_text())
N = int(cfg["duration"] * SR)


def sq(f, n, duty=.5):
    t = np.arange(n) / SR
    return np.where((t * f) % 1 < duty, 1.0, -1.0)


def env(n, a=.002, d=.15):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def note(m):  # midi -> Hz
    return 440 * 2 ** ((m - 69) / 12)


# ---- music: 132 BPM, A minor-ish arcade loop ----
bpm = 132; step = 60 / bpm / 2  # eighth notes
lead_pat = [69, 72, 76, 72, 74, 77, 81, 77, 67, 71, 74, 71, 72, 76, 79, 76]
bass_pat = [45, 45, 45, 45, 41, 41, 41, 41, 43, 43, 43, 43, 40, 40, 40, 40]
music = np.zeros(N)
i = 0
while i * step < cfg["duration"] - .3:
    t0 = int(i * step * SR); n = int(step * SR * .9)
    if t0 + n >= N: break
    music[t0:t0 + n] += .16 * sq(note(lead_pat[i % 16]), n, .25) * env(n, .002, .09)
    music[t0:t0 + n] += .20 * sq(note(bass_pat[(i // 2) % 16] - 12), n, .5) * env(n, .003, .2)
    if i % 4 == 0:  # kick: pitch-dropping square
        k = int(.12 * SR); f = np.geomspace(160, 50, k)
        music[t0:t0 + k] += .35 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(k, .001, .05)
    if i % 2 == 1:  # hat: noise tick
        h = int(.03 * SR); music[t0:t0 + h] += .07 * rng.standard_normal(h) * env(h, .0005, .008)
    if i % 8 == 4:  # snare
        sn = int(.12 * SR); music[t0:t0 + sn] += .16 * rng.standard_normal(sn) * env(sn, .001, .05)
    i += 1
t_all = np.arange(N) / SR
lvl = np.full(N, .7)
lvl[(t_all >= cfg["tense"][0]) & (t_all < cfg["tense"][1])] = .55
lvl[t_all > cfg["duration"] - .8] *= np.linspace(1, 0, int(np.sum(t_all > cfg["duration"] - .8)))
music *= lvl


def arp(notes, d=.05, duty=.25, vol=.3):
    out = []
    for m in notes:
        n = int(d * SR); out.append(vol * sq(note(m), n, duty) * env(n, .001, d))
    return np.concatenate(out)


def sfx(kind):
    if kind in ("pop", "pop2"):   # coin
        return np.concatenate([arp([83], .06), arp([88], .22)])
    if kind == "tick":            # menu blip
        return arp([96], .04, .5, .2)
    if kind == "ding":            # power-up
        return arp([60, 64, 67, 72, 76, 79, 84], .045)
    if kind == "riser":
        return arp(list(range(48, 84, 2)), .05, .5, .22)
    if kind == "whoosh":          # jump
        n = int(.25 * SR); f = np.geomspace(300, 1200, n)
        return .25 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, .002, .12)
    if kind in ("boom", "flash"):  # explosion
        n = int(.6 * SR); x = rng.standard_normal(n)
        x = np.repeat(x[::6], 6)[:n]  # crushed noise
        return .5 * x * env(n, .001, .18)
    if kind == "glitch":
        return arp([90, 40, 85, 45, 80, 50], .03, .5, .25)
    if kind in ("click", "key"):
        return arp([100], .02, .5, .2)
    if kind == "buzz":
        return arp([40, 39], .15, .5, .25)
    return arp([72], .05)


sfx_bus = np.zeros(N)
for c in cfg["cues"]:
    s = sfx(c["sfx"]); off = c["t"]
    if c["sfx"] == "riser":
        off = c["end"] - len(s) / SR
    i0 = max(0, int(off * SR)); n = min(len(s), N - i0)
    sfx_bus[i0:i0 + n] += s[:n]

raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "voice/vo_clean.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
vo = np.zeros(N); v = np.frombuffer(raw, dtype=np.float32)[:N]; vo[:len(v)] = v
act = np.convolve((np.abs(vo) > .02).astype(float), np.ones(int(.25 * SR)) / int(.25 * SR), mode="same")
duck = 1 - .5 * np.clip(act * 4, 0, 1)
m = music / max(1e-9, np.max(np.abs(music))) * .16
f = sfx_bus / max(1e-9, np.max(np.abs(sfx_bus))) * .5
full = m * duck + f * .8 + vo * 1.15


def write(name, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    out = ROOT / name; out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("wrote", out)


write("renders/stems/music.wav", m); write("renders/stems/sfx.wav", f); write("renders/stems/voice.wav", vo)
write("hyperframes/assets/soundbed.wav", full / max(1.0, np.max(np.abs(full)) / .95))

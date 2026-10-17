"""Soft educational music bed + UI sound effects for Lesson 01 (synthesized, royalty-free)."""
import json
import numpy as np
import soundfile as sf
from scipy.signal import lfilter

P = "/home/user/test/projects/pillar01-lesson01"
T = json.load(open(f"{P}/artifacts/timing.json"))
SR = 48000; DUR = T["video_duration"]; N = int(DUR * SR)
rng = np.random.default_rng(11)


def lp(x, a): return lfilter([a], [1, a - 1], x)
def note(m): return 440.0 * 2 ** ((m - 69) / 12)


# music: 84 BPM, Cmaj7 - Am7 - Fmaj7 - G6, warm pad + soft bass + sparse bell arpeggio (no drums)
BPM = 84; beat = 60 / BPM; bar = 4 * beat; clen = 2 * bar
prog = [(48, 52, 55, 59), (45, 48, 52, 55), (41, 45, 48, 52), (43, 47, 50, 52)]
music = np.zeros(N)
for ci in range(int(DUR / clen) + 1):
    s0 = int(ci * clen * SR); s1 = min(N, int((ci + 1) * clen * SR))
    if s0 >= N: break
    tt = np.arange(s1 - s0) / SR; seg = np.zeros(s1 - s0)
    for m in prog[ci % 4]:
        for det in (-0.06, 0.06):
            seg += np.sin(2 * np.pi * note(m + 12 + det) * tt) + 0.3 * np.sin(2 * np.pi * note(m + 24 + det) * tt)
    fade = np.minimum(1, np.minimum(tt / 0.8, (tt[-1] - tt + 1e-3) / 0.8))
    music[s0:s1] += 0.22 * seg * fade
    root = prog[ci % 4][0] - 12
    for b in range(8):
        b0 = s0 + int(b * beat * SR); n = min(int(beat * SR), N - b0)
        if n <= 0 or b0 >= N: continue
        t2 = np.arange(n) / SR
        music[b0:b0 + n] += 0.28 * np.sin(2 * np.pi * note(root) * t2) * np.exp(-t2 * 3) * (b % 2 == 0)
        a0 = b0 + int(0.5 * beat * SR); n2 = min(int(0.6 * SR), N - a0)
        if n2 > 0 and (b + ci) % 3 == 0:
            t3 = np.arange(n2) / SR; m = prog[ci % 4][(b // 2) % 4] + 24
            music[a0:a0 + n2] += 0.05 * np.sin(2 * np.pi * note(m) * t3) * np.exp(-t3 * 5)
music = lp(music, 0.25)
fi, fo = int(2 * SR), int(3 * SR)
music[:fi] *= np.linspace(0, 1, fi); music[-fo:] *= np.linspace(1, 0, fo)
music /= np.max(np.abs(music)) + 1e-9
sf.write(f"{P}/assets/music/music_bed.wav", np.stack([music, music], 1).astype(np.float32), SR)

sfx = np.zeros(N); cues = []
def add(at, sig, g):
    s0 = int(at * SR)
    if 0 <= s0 < N:
        n = min(len(sig), N - s0); sfx[s0:s0 + n] += g * sig[:n]
def whoosh():
    n = int(0.7 * SR); x = rng.standard_normal(n); tt = np.arange(n) / SR
    a = 0.02 + 0.22 * np.sin(np.pi * tt / tt[-1]) ** 2; y = np.empty(n); acc = 0.0
    for i in range(n): acc += a[i] * (x[i] - acc); y[i] = acc
    return y * np.sin(np.pi * tt / tt[-1]) ** 1.5 * 3
def pop(f=1100):
    n = int(0.08 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 800 * np.exp(-tt * 60)) * tt) * np.exp(-tt * 45)
def chime(fs=(1047, 1319, 1568)):
    n = int(1.4 * SR); tt = np.arange(n) / SR; y = np.zeros(n)
    for k, f in enumerate(fs):
        d = int(k * 0.12 * SR); y[d:] += np.sin(2 * np.pi * f * tt[:n - d]) * np.exp(-tt[:n - d] * 3.5)
    return y / 3
def key():
    n = int(0.03 * SR); return rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 220)

W = whoosh()
add(0.0, chime((784, 988, 1175)), 0.35); cues.append((0.0, "logo sting"))
for s in T["scenes"][1:]:
    add(s["start"], W, 0.45); cues.append((s["start"], f"whoosh: chapter {s['num']}"))
for s in T["scenes"]:
    add(s["narr_start"] + 0.6, pop(), 0.25); cues.append((round(s["narr_start"] + 0.6, 2), f"pop: {s['id']} first element"))
L8 = [L for L in T["lines"] if L["scene"] == "s08"]
st, en = L8[5]["start"], L8[5]["end"]
t = st
while t < en:
    add(t, key(), 0.18); t += 0.11 + 0.06 * rng.random()
cues.append((round(st, 2), "keyboard typing texture (prompt)"))
add(L8[7]["start"] + 0.1, W, 0.3); cues.append((round(L8[7]["start"] + 0.1, 2), "send whoosh"))
add(L8[7]["start"] + 1.2, pop(1500), 0.3); cues.append((round(L8[7]["start"] + 1.2, 2), "answer notification"))
r = [s for s in T["scenes"] if s["id"] == "s10"][0]
add(r["narr_start"] + 0.3, chime(), 0.35); cues.append((round(r["narr_start"] + 0.3, 2), "success chime (recap)"))
sfx /= max(1.0, np.max(np.abs(sfx)) * 1.05)
sf.write(f"{P}/assets/audio/sfx.wav", np.stack([sfx, sfx], 1).astype(np.float32), SR)
json.dump(sorted(cues), open(f"{P}/artifacts/sfx_cues.json", "w"), ensure_ascii=False, indent=1)
print("music+sfx", len(cues))

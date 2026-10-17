"""Synthesize an original tech-news music bed and UI sound effects (royalty-free, made in code)."""
import json
import numpy as np
import soundfile as sf

W = "/home/user/test/projects/ai-news-quantum-2026-10-16"
T = json.load(open(f"{W}/artifacts/timing.json"))
SR = 48000
DUR = T["video_duration"]
N = int(DUR * SR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR


def note(f):
    return 440.0 * 2 ** ((f - 69) / 12)


def lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)


def env_ad(n, a, d):
    e = np.ones(n)
    na, nd = int(a * SR), int(d * SR)
    e[:na] = np.linspace(0, 1, na)
    e[na:] = np.exp(-np.arange(n - na) / max(1, nd))
    return e


# ---------------- music: 104 BPM, Am - F - C - G, 2 bars each
BPM = 104; beat = 60 / BPM; bar = 4 * beat
prog = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]  # Am F C G
music = np.zeros(N)
# pad (detuned saws, softened)
pad = np.zeros(N)
chord_len = 2 * bar
for ci in range(int(DUR / chord_len) + 1):
    s0 = int(ci * chord_len * SR); s1 = min(N, int((ci + 1) * chord_len * SR))
    if s0 >= N: break
    tt = np.arange(s1 - s0) / SR
    seg = np.zeros(s1 - s0)
    for m in prog[ci % 4]:
        for det in (-0.08, 0.08):
            f = note(m + det)
            seg += 2 * ((tt * f) % 1.0) - 1
    fade = np.minimum(1, np.minimum(tt / 0.4, (tt[-1] - tt + 1e-3) / 0.4))
    pad[s0:s1] += seg * fade
pad = lp(pad / 6, 0.035)
music += pad * 0.5
# bass (sine, root on each beat, octave down)
for bi in range(int(DUR / beat) + 1):
    s0 = int(bi * beat * SR)
    if s0 >= N: break
    root = prog[int(bi * beat / chord_len) % 4][0] - 24
    n = min(int(beat * SR), N - s0); tt = np.arange(n) / SR
    music[s0:s0 + n] += 0.35 * np.sin(2 * np.pi * note(root) * tt) * env_ad(n, 0.01, 0.25)
# soft kick on 1 and 3, hats on 8ths, arp pluck 16ths (quiet)
for bi in range(int(DUR / beat) + 1):
    s0 = int(bi * beat * SR)
    if s0 >= N: break
    if bi % 2 == 0:
        n = min(int(0.3 * SR), N - s0); tt = np.arange(n) / SR
        f = 50 + 80 * np.exp(-tt * 30)
        music[s0:s0 + n] += 0.55 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
    for h in (0, 0.5):
        h0 = int((bi + h) * beat * SR); n = min(int(0.05 * SR), N - h0)
        if n > 0:
            hn = rng.standard_normal(n); hn = hn - lp(hn, 0.5)
            music[h0:h0 + n] += 0.05 * hn * np.exp(-np.arange(n) / SR * 80)
    chord = prog[int(bi * beat / chord_len) % 4]
    for q in range(4):
        p0 = int((bi + q / 4) * beat * SR); n = min(int(0.18 * SR), N - p0)
        if n <= 0: continue
        m = chord[(bi * 4 + q) % 3] + 12; tt = np.arange(n) / SR
        music[p0:p0 + n] += 0.07 * np.sign(np.sin(2 * np.pi * note(m) * tt)) * np.exp(-tt * 22)
music = lp(music, 0.6)
# fade in / out
fi, fo = int(1.0 * SR), int(2.5 * SR)
music[:fi] *= np.linspace(0, 1, fi); music[-fo:] *= np.linspace(1, 0, fo)
music /= np.max(np.abs(music)) + 1e-9
sf.write(f"{W}/assets/music/music_bed.wav", np.stack([music, music], 1).astype(np.float32), SR)

# ---------------- SFX
sfx = np.zeros(N); cues = []


def add(at, sig, gain):
    s0 = int(at * SR)
    if s0 < 0 or s0 >= N: return
    n = min(len(sig), N - s0); sfx[s0:s0 + n] += gain * sig[:n]


def whoosh():
    n = int(0.6 * SR); x = rng.standard_normal(n); tt = np.arange(n) / SR
    a = 0.02 + 0.25 * np.sin(np.pi * tt / tt[-1]) ** 2
    y = np.empty(n); acc = 0.0
    for i in range(n):
        acc += a[i] * (x[i] - acc); y[i] = acc
    return y * np.sin(np.pi * tt / tt[-1]) ** 1.5 * 3


def pop(f=1200):
    n = int(0.09 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-tt * 60)) * tt) * np.exp(-tt * 45)


def ding(f1=1318, f2=1760):
    n = int(0.7 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f1 * tt) * np.exp(-tt * 6)
    b = np.zeros(n); k = int(0.12 * SR); b[k:] = np.sin(2 * np.pi * f2 * tt[:n - k]) * np.exp(-tt[:n - k] * 6)
    return (a + b) * 0.5


def click():
    n = int(0.02 * SR); return rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 300)


W_ = whoosh()
for s in T["scenes"][1:]:
    add(s["start"] - 0.35, W_, 0.5); cues.append((round(s["start"] - 0.35, 2), "whoosh", s["id"]))


def wt(scene, tok, nth=0):
    hits = [w for L in T["lines"] if L["scene"] == scene for w in L["words"] if tok in w["t"]]
    return hits[nth]["s"]


pops = [("s1", "চমক"), ("s1", "Quantum"), ("s1", "নিরাপত্তা"),
        ("s2", "সাতটিতে"), ("s2", "গেট"), ("s4", "অনাকাঙ্ক্ষিতভাবে"), ("s4", "ঘটনাটি"), ("s4", "নিরাপত্তা"),
        ("s5", "সাইবার"), ("s5", "যৌথ"), ("s5", "মহড়ার"), ("s6", "প্রোটোটাইপ"), ("s6", "পরীক্ষা"),
        ("s7", "সম্ভাবনা"), ("s7", "নিরাপত্তা")]
for sc, tok in pops:
    at = wt(sc, tok) - 0.05; add(at, pop(), 0.35); cues.append((round(at, 2), "pop", f"{sc}:{tok}"))
for k in range(8):
    at = wt("s2", "আটটি") + k * 0.12; add(at, click(), 0.3); cues.append((round(at, 2), "click", f"s2 grid {k+1}"))
for at, lab in [(wt("s3", "গবেষণার"), "caveat ding"), (wt("s4", "অন্যদিকে"), "alert ding (safety)"), (wt("s6", "আর"), "ding (free tool)"), (wt("s7", "প্রতিদিন"), "ding (CTA)")]:
    add(at, ding() if "safety" not in lab else ding(988, 740), 0.35); cues.append((round(at, 2), "ding", lab))
sfx /= max(1.0, np.max(np.abs(sfx)) * 1.05)
sf.write(f"{W}/assets/audio/sfx.wav", np.stack([sfx, sfx], 1).astype(np.float32), SR)
json.dump(sorted(cues), open(f"{W}/artifacts/sfx_cues.json", "w"), ensure_ascii=False, indent=1)
print("music+sfx written", len(cues), "sfx cues")

import numpy as np, soundfile as sf, json
from scipy import signal
SR = 44100
import json as _j, os as _os
WARP = _j.load(open('audio/warp.json')) if _os.path.exists('audio/warp.json') else None
def toNew(x):
    if not WARP: return x
    A = WARP['anchors']
    if x <= A[0][0]: return x - A[0][0] + A[0][1]
    for i in range(len(A) - 1):
        if x <= A[i + 1][0]: k = (x - A[i][0]) / (A[i + 1][0] - A[i][0]); return A[i][1] + k * (A[i + 1][1] - A[i][1])
    return x - A[-1][0] + A[-1][1]
SHOTJ = json.load(open('audio/shots.json'))
DUR = SHOTJ['dur'] + 0.6
N = int(DUR * SR)
rng = np.random.default_rng(3)
def T(n): return np.arange(n) / SR
def env(n, a=.005, d=.2, curve=4):
    t = T(n); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4)); return e
def place(buf, x, at, g=1.0):
    i = int(toNew(at) * SR); j = min(len(buf), i + len(x))
    if i < 0 or i >= len(buf): return
    buf[i:j] += x[:j - i] * g
def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi / (SR / 2), .99)], 'band'); return signal.lfilter(b, a, x)
def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)

# ---------------- SFX ----------------
def whoosh(dur=.35, up=True):
    n = int(dur * SR); x = rng.standard_normal(n); t = T(n)
    lo, hi = bp(x, 250, 1200), bp(x, 1500, 6000); k = np.linspace(0, 1, n) if up else np.linspace(1, 0, n)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return (lo * (1 - k) + hi * k) * e * 1.6
def thud(f0=70, dur=.35, g=1):
    n = int(dur * SR); t = T(n); f = f0 * (1 + 1.5 * np.exp(-t * 30))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)
    x += lp(rng.standard_normal(n), 900) * np.exp(-t * 40) * .6
    return x * g
def clang(f0=520, dur=1.0):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for k, (r, a, d) in enumerate([(1, 1, 5), (2.76, .6, 7), (5.4, .4, 10), (8.9, .25, 14), (1.5, .5, 6)]):
        x += a * np.sin(2 * np.pi * f0 * r * t + k) * np.exp(-t * d)
    x += hp(rng.standard_normal(n), 2000) * np.exp(-t * 60) * .8
    return x * .5 + thud(90, dur, .7)[:n]
def pluck(f, dur=.5, bright=.5):
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = bright * buf[i % p] + (1 - bright) * .5 * (buf[i % p] + buf[(i + 1) % p]) * .996 if False else .5 * (buf[i % p] + buf[(i + 1) % p]) * .995
    return out
def chime(f=1760, dur=.8):
    n = int(dur * SR); t = T(n)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.01 * t) + .3 * np.sin(2 * np.pi * f * 3 * t)) * np.exp(-t * 6) * np.minimum(1, t / .003) * .5
def sparkle_sfx():
    out = np.zeros(int(.7 * SR))
    for i, f in enumerate([2093, 2637, 3136, 4186]): place(out, chime(f, .5) * .5, i * .05)
    return out
def tick(): n = int(.04 * SR); t = T(n); return hp(rng.standard_normal(n), 3000) * np.exp(-t * 200) * .8 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 150) * .4
def pop(f=600):
    n = int(.12 * SR); t = T(n); fr = f * (1 + 2 * t * 10); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 40)
def boing(f=220, dur=.5):
    n = int(dur * SR); t = T(n); fr = f * (1 + .35 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 3)) * (1 + t)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 5) * .6
def tweet():
    out = np.zeros(int(1.2 * SR))
    for i in range(4):
        n = int(.1 * SR); t = T(n); fr = 3200 + 900 * np.sin(2 * np.pi * 30 * t)
        place(out, np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / .1) * .25, i * .25)
    return out
def scribble(dur=.18):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 1500, 6000) * (0.5 + .5 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / dur) * .5
def riser(dur=2.8):
    n = int(dur * SR); t = T(n); f = 200 * (2 ** (t / dur * 2.5))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + bp(rng.standard_normal(n), 800, 5000) * .3 * (t / dur)
    return x * (t / dur) ** 2
def waves(dur):
    n = int(dur * SR); t = T(n); x = lp(rng.standard_normal(n), 700, 2)
    return x * (0.5 + .5 * np.sin(2 * np.pi * t / 4.5) ** 2) * .5
def heartbeat():
    out = np.zeros(int(.8 * SR)); place(out, thud(55, .3, .8), 0); place(out, thud(50, .3, .6), .22); return out

def rumble(dur=1.6, g=1.0):
    n = int(dur * SR); t = T(n); x = lp(rng.standard_normal(n), 220, 2) * np.exp(-t * 2.2) * 2.2
    x += hp(rng.standard_normal(n), 1200) * np.exp(-t * 25) * .5
    return x * np.minimum(1, t / .01) * g
def shutter(dur=.5):
    n = int(dur * SR); t = T(n); x = bp(rng.standard_normal(n), 500, 3000) * (0.6 + .4 * np.sign(np.sin(2 * np.pi * 40 * t)))
    return x * np.exp(-t * 2) * .5 + np.pad(thud(80, .3, .8), (int(.42 * SR), 0))[:n]
def bell():
    out = np.zeros(int(1.4 * SR))
    for i in range(3): place(out, chime(1568, 1.0) * .7, i * .12); place(out, chime(2093, .8) * .4, i * .12 + .03)
    return out

WJ = json.load(open('audio/words_new.json'))
LS = {}
for w in WJ: LS.setdefault(w['line'], []).append(w['s'])
LE = {}
for w in WJ: LE[w['line']] = w['e']
NL = max(LS) + 1
def Wt(i, k): return LS[i][k]
def Bd(i): return 0 if i <= 0 else (LE[NL - 1] + .9 if i >= NL else (LE[i - 1] + LS[i][0]) / 2)

sfx = np.zeros(N)
spans, trs = SHOTJ['spans'], SHOTJ['tr']
for (a, b), tr in zip(spans[:-1], trs[:-1]):
    if tr == 'whip': place(sfx, whoosh(.36), b - .22, .3)
    else: place(sfx, tick() * .6, b, .25)
def pour(dur):
    n = int(dur * SR); t = T(n); x = bp(rng.standard_normal(n), 600, 4000) * (0.7 + .3 * np.sin(2 * np.pi * 7 * t) ** 2)
    return x * np.minimum(1, t / .15) * np.minimum(1, (dur - t) / .2) * .5
def gurgle(dur):
    n = int(dur * SR); t = T(n); x = lp(rng.standard_normal(n), 900) * .4
    for k in range(int(dur * 9)):
        t0 = rng.uniform(0, dur - .1); f = rng.uniform(250, 700); m = int(.07 * SR); tt = T(m)
        i = int(t0 * SR); x[i:i + m] += np.sin(2 * np.pi * f * (1 + 3 * tt) * tt) * np.exp(-tt * 40) * .8
    return x * np.minimum(1, t / .2) * np.minimum(1, (dur - t) / .3)
def drip(): n = int(.12 * SR); t = T(n); return np.sin(2 * np.pi * 900 * (1 + 4 * t) * t) * np.exp(-t * 45)
POP = [(0, 3), (1, 2), (2, 1), (2, 7), (3, 0), (4, 5), (5, 3), (5, 9), (6, 1), (6, 8), (8, 0), (9, 2), (11, 4), (11, 9), (12, 0), (12, 12),
       (13, 0), (13, 3), (13, 7), (14, 3), (14, 7), (16, 6), (17, 0), (17, 11), (19, 6), (19, 7), (20, 2), (20, 4)]
for i, k in POP: place(sfx, pop(560 + (i * 37) % 300), Wt(i, k), .4)
for i, k in [(1, 7), (4, 6), (7, 2), (8, 6), (15, 4), (18, 8)]: place(sfx, sparkle_sfx(), Wt(i, k), .32)
place(sfx, whoosh(.9, False), Wt(4, 2), .35)
f0, f1, g0, g1 = Wt(8, 0) + .2, Wt(8, 6) - .1, Wt(9, 3), Wt(9, 9) + .15
place(sfx, pour(f1 - f0), f0, .55); place(sfx, pour(g1 - g0), g0, .6)
place(sfx, boing(300, .5), Wt(9, 9), .4); place(sfx, riser(1.0), Wt(9, 9) - .9, .3)
gs = g1 + .7; ge = Wt(12, 10)
place(sfx, gurgle(ge - g1 + .5), g1, .5)
for k in range(int((ge - gs) / .5)): place(sfx, drip(), gs + k * .5, .2)
for k in range(8): place(sfx, drip(), Wt(12, 7) + k * .3, .3)
place(sfx, thud(70, .4), Wt(14, 7), .5); place(sfx, chime(1320, 1.0), Wt(16, 1), .3)
place(sfx, gurgle(3.0), Wt(17, 3), .3)
place(sfx, bell(), Wt(20, 4) + .25, .45)

plk_cache = {}
def midi(m): return 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N)
BEAT = 60 / 104
def pizz(m, dur=.45, g=1.0):
    k = ('pz', m, round(dur, 2))
    if k not in plk_cache:
        x = pluck(midi(m), dur); n = len(x); t = T(n)
        x = bp(x, 180, 3500) * np.exp(-t * 7) + bp(rng.standard_normal(n), 1500, 5000) * np.exp(-t * 300) * .15
        plk_cache[k] = x / (np.max(np.abs(x)) + 1e-9)
    return plk_cache[k] * g
def glock(m, dur=1.2, g=1.0):
    n = int(dur * SR); t = T(n); f = midi(m)
    x = (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12))
    return x * np.exp(-t * 3.5) * np.minimum(1, t / .002) * .5 * g
def reed(m, dur=.22, g=1.0):
    n = int(dur * SR); t = T(n); f = midi(m); ph = (f * t) % 1
    x = lp(np.sign(np.sin(2 * np.pi * ph)) * .6 + (2 * ph - 1) * .4, 900)
    return x * np.minimum(1, t / .015) * np.exp(-t * 6) * np.minimum(1, (dur - t) / .03) * .5 * g
def strings(ms, dur, g=1.0):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for m in ms:
        for d in (-.004, 0, .005):
            ph = np.cumsum(midi(m) * (1 + d) * (1 + .003 * np.sin(2 * np.pi * 5 * t))) / SR; x += 2 * (ph % 1) - 1
    x = lp(x / (len(ms) * 3), 1100); e = np.minimum(1, t / .5) * np.minimum(1, (dur - t) / .5)
    return x * e * g
# progressions (root, chord tones) in midi
DM = [(38, (62, 65, 69)), (43, (62, 67, 71)), (38, (62, 65, 69)), (45, (61, 64, 67))]   # Dm G Dm A7
DMAJ = [(38, (62, 66, 69)), (43, (62, 67, 71)), (45, (61, 64, 69)), (38, (62, 66, 69))]  # D G A D
motif = [(0, 74), (.5, 77), (1, 81), (2, 79), (2.5, 77), (3, 76)]  # glock line over 1 bar
def playful(t0, t1, prog, g=1.0, glock_on=True, stabs=True):
    t = t0; bar = 0
    while t < t1 - .05:
        root, ch = prog[bar % 4]
        place(music, pizz(root, .5, .9), t, g); place(music, pizz(root + 7, .5, .7), t + 2 * BEAT, g)
        if stabs:
            for bt in (1, 3): 
                for m in ch: place(music, pizz(m - 12, .3, .28), t + bt * BEAT, g)
        if glock_on and bar % 2 == 0:
            for (bt, m) in motif:
                mm = m if prog is DM else m + (1 if m % 12 in (5,) else 0)
                if t + bt * BEAT < t1: place(music, glock(mm, 1.0, .35), t + bt * BEAT, g)
        t += 4 * BEAT; bar += 1
def sneak(t0, t1, g=1.0):
    steps = [38, 38, 41, 40, 39, 38, 36, 37]
    t = t0; i = 0
    while t < t1 - .05:
        place(music, reed(steps[i % 8] + 12, .2, .8), t, g); place(music, pizz(steps[i % 8], .35, .6), t, g)
        t += BEAT * (1 if i % 2 == 0 else 1); i += 1

B4, B8, B13, B18 = Bd(4), Bd(8), Bd(13), Bd(18)
playful(0, B4, DMAJ, .7)
playful(B4, B8, DMAJ, .55, glock_on=False, stabs=False)
place(music, strings((50, 57, 62), B13 - B8, .25), B8)
for k in range(int((B13 - B8) / BEAT)): place(music, pizz([38, 45, 43, 45][k % 4], .5, .45), B8 + k * BEAT)
playful(B13, B18, DM, .6, glock_on=False)
playful(B18, DUR - 1.5, DMAJ, .8)
for m in (62, 66, 69, 74): place(music, pizz(m - 12, .8, .5), DUR - 1.4); place(music, glock(m + 12, 1.3, .25), DUR - 1.4)
music = lp(music, 6000)

# ---------------- VO + mix ----------------
vo, vsr = sf.read('audio/vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = signal.resample_poly(vo, SR, vsr)
vo = hp(vo, 90)
# gentle compression
envv = np.abs(signal.hilbert(vo)); envv = lp(envv, 20)
gain = np.where(envv > .15, (.15 / np.maximum(envv, 1e-6)) ** .4, 1.0); vo = vo * gain
vo = vo / np.max(np.abs(vo)) * .9
VO = np.zeros(N); VO[:min(N, len(vo))] = vo[:N]
# duck music under VO
venv = lp(np.abs(VO), 6); vtrack = np.clip(venv / .05, 0, 1)
duck = 1 - .55 * vtrack
mixL = VO * 1.0 + music * .2 * duck + sfx * .6
mixR = mixL.copy()
out = np.stack([mixL, mixR], 1)
fade = np.ones(N); fl = int(.5 * SR); fade[-fl:] = np.linspace(1, 0, fl); out *= fade[:, None]
pk = np.max(np.abs(out)); out = out / pk * .89
sf.write('audio/mix.wav', out, SR)
print('done', out.shape, 'rms dB', 20 * np.log10(np.sqrt(np.mean(out ** 2))))

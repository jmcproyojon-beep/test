"""Sound for «আরেকটু থাকো» -> mix.wav (48 kHz stereo, exactly DUR seconds).
The song (the artist's master) is the soundtrack. Under it, very quiet, on the picture's own events (events.json):
real chalk recordings cut into grains (foley/lib, CC0), one grain chain per stroke, the accent chalk softer and duller;
the felt pass of the one wipe; the panel's low roll ending on its stop; a distant school bell; very low room tone.
Run from the library root after `node core/render/events.mjs <film>`:  .venv/bin/python <film>/audio.py"""
import sys, os, json, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LEMO_OPUSCAR_HOME') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, soxr, pyloudnorm as pyln
from core.audio import sampler as S
from core.audio.sfx import SR, add, noise, bp, hp, lp, t_, brown, thump

rng = np.random.default_rng(7)
EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; ev = EV['ev']; N = int(round(DUR * SR))
fx = np.zeros((N, 2), np.float32)

def fade(x, a=.004, b=.03):
    n = len(x); a, b = min(int(a * SR), n // 2), min(int(b * SR), n // 2)
    x = x.copy(); x[:a] *= np.linspace(0, 1, a); x[n - b:] *= np.linspace(1, 0, b); return x

# ---------------------------------------------------------------- the song
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(HERE, 'assets/song.mp3'), '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_f32le', f'{tmp}/s.wav'], check=True)
song, _ = sf.read(f'{tmp}/s.wav', dtype='float32')
song = np.pad(song, ((0, max(0, N - len(song))), (0, 0)))[:N]
song[-int(.4 * SR):] *= np.linspace(1, 0, int(.4 * SR))[:, None]

# ---------------------------------------------------------------- chalk
IDX = json.load(open(os.path.join(HERE, 'foley/lib/index.json')))
strokes = [g for g in IDX if g['kind'] == 'stroke']; taps = [g for g in IDX if g['kind'] == 'tap']
cache = {}
def grain(g):
    if g['file'] not in cache:
        x, sr = sf.read(os.path.join(HERE, 'foley/lib', g['file']), dtype='float32')
        if x.ndim > 1: x = x.mean(1)
        if sr != SR: x = soxr.resample(x, sr, SR)
        cache[g['file']] = x / (np.abs(x).max() + 1e-9)
    return cache[g['file']]
def chalk(d, v, orange=False):
    out = np.zeros(int((d + .06) * SR), np.float32); pos = 0
    while pos < len(out) - int(.03 * SR):
        g = grain(strokes[rng.integers(len(strokes))]); n = min(len(g), len(out) - pos)
        out[pos:pos + n] += fade(g[:n], .006, .02); pos += max(int(.6 * n), int(.04 * SR))
    env = np.ones(len(out)); a = int(.012 * SR); env[:a] = np.linspace(.3, 1, a); env[-int(.05 * SR):] *= np.linspace(1, 0, int(.05 * SR))
    out = out * env
    out = lp(out, 3800) if orange else hp(out, 500)
    return (out * v).astype(np.float32)
for e in ev:
    if e['type'] != 'chalk' or e['t'] < 0: continue
    d = max(.04, e['d']); size = min(1.0, e['len'] / 700)
    v = (.12 + .32 * size) * (1.2 if e['big'] else .8)
    add(fx, chalk(d, v, e['color'] == 'orange'), e['t'], 1.0, e['pan'])
    if d > .12 and rng.random() < .5:
        add(fx, fade(grain(taps[rng.integers(len(taps))]), .002, .03) * .3 * v, e['t'] - .005, 1.0, e['pan'])

# ---------------------------------------------------------------- room, panel, wipe, thread, bell
room = lp(brown(DUR), 900) * .006; fx[:, 0] += room[:N]; fx[:, 1] += np.roll(room, 997)[:N]
for e in [x for x in ev if x['type'] == 'slide']:
    d = e['d']
    r = lp(brown(d + .3), 260) * .5; r *= np.sin(np.pi * np.clip(t_(d + .3) / (d + .3), 0, 1)) ** .7
    tick = np.zeros_like(r); per = int(.045 * SR)
    for i in range(0, len(tick) - 400, per): tick[i:i + 300] += np.exp(-np.arange(300) / 40) * .25 * (.5 + .5 * np.sin(np.pi * i / len(tick)))
    add(fx, ((r + lp(tick, 1200)) * .7).astype(np.float32), e['t'], 1.0, .2)
    add(fx, thump(.8, 62) * .7, e['t'] + d, 1.0, .35)
for e in [x for x in ev if x['type'] == 'wipe']:
    d = e['d']; w = bp(noise(d + .1), 280, 2200) * .22
    w *= np.sin(np.pi * np.clip(t_(d + .1) / (d + .1), 0, 1)) ** 1.2 * (1 + .35 * np.sin(2 * np.pi * 2.2 * t_(d + .1)))
    add(fx, w.astype(np.float32), e['t'], 1.0, 0)
for e in [x for x in ev if x['type'] == 'thread']:
    add(fx, chalk(e['d'], .3, True), e['t'], 1.0, 0)
for e in [x for x in ev if x['type'] == 'bell']:                       # the school bell, far down the corridor
    d = 2.2
    b = (np.sign(np.sin(2 * np.pi * 980 * t_(d))) * .3 + np.sin(2 * np.pi * 1960 * t_(d)) * .2) * (.6 + .4 * np.sin(2 * np.pi * 24 * t_(d)))
    b = lp(bp(b, 600, 3000), 2000) * np.minimum(1, t_(d) / .05) * np.exp(-np.maximum(0, t_(d) - 1.7) / .15) * .05
    add(fx, S.room(np.stack([b, b], 1).astype(np.float32), size=.7, mix=.6)[:, 0], e['t'], 1.0, .5)

# ---------------------------------------------------------------- mix: the song leads; foley sits ~17 LU under it
meter = pyln.Meter(SR)
ls = meter.integrated_loudness(song.astype(np.float64))
lf = meter.integrated_loudness((fx + 1e-7 * rng.standard_normal(fx.shape)).astype(np.float64))
mix = song + fx * 10 ** ((ls - 17 - lf) / 20)
mix *= 10 ** ((-16 - meter.integrated_loudness(mix.astype(np.float64))) / 20)          # about -16 LUFS before the master
pk = np.abs(mix).max()
if pk > .84: mix *= .84 / pk
sf.write(os.path.join(HERE, 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print(f'mix.wav {DUR:.2f}s  song {ls:.1f} LUFS  foley gain {(ls - 17 - lf):+.1f} dB  out {meter.integrated_loudness(mix.astype(np.float64)):.1f} LUFS  peak {20*np.log10(np.abs(mix).max()):.1f} dBFS')

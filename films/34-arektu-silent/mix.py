"""Mix for «আরেকটু থাকো» (silent-film version): the artist's song master is the soundtrack (his choice, in place of a cinema
pianist). Under it, low, the projector in the booth: lamp click and spin-up before the curtain, the claw-and-motor purr that
follows the crank (slowing, stopping at the freeze, running backwards at the rewind), the tail of the film flapping when the
reel runs out, silence at the station, the purr again in the empty booth, and the run-out flapping after the curtain.
Run from the library root: .venv/bin/python films/arektu-silent/mix.py  → films/arektu-silent/mix.wav"""
import sys, os, json, subprocess, tempfile
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(D, '../..'))
sys.path.insert(0, ROOT)
from core.audio.sfx import SR, bp, t_, limit
rng = np.random.default_rng(7)
EV = json.load(open(os.path.join(D, 'events.json'))); DUR = EV['dur']
sec = {e['name']: e['t'] for e in EV['ev'] if e['type'] == 'section'}; hit = {e['name']: e['t'] for e in EV['ev'] if e['type'] == 'hit'}
N = int(round(DUR * SR))
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(D, 'assets/song.mp3'), '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_f32le', f'{tmp}/s.wav'], check=True)
song, _ = sf.read(f'{tmp}/s.wav', dtype='float32'); song = np.pad(song, ((0, max(0, N - len(song))), (0, 0)))[:N]
def claw(v=1.0):
    d = .05; tt = t_(d)
    x = bp(rng.standard_normal(len(tt)), 1200, 5200) * np.exp(-tt / .004) * .9 + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / .012) * .5
    return x * v
# projector speed (claw frames/s) from the picture's own crank: 18 normal, slowing, 0 at the freeze, back at the rewind
def fps(t):
    if t < .15: return 0
    if t < 1.3: return 18 * min(1, (t - .15) / 1.0) ** .7
    if t < hit['slow']: return 18
    if t < 90.9: return 18 * (1 - .7 * (t - hit['slow']) / (90.9 - hit['slow']))
    if t < hit['freeze']: return 5.4 * (1 - (t - 90.9) / (hit['freeze'] - 90.9))
    if t < hit['rewind']: return 0
    if t < sec['CARD3']: return 22
    if t < sec['RUNOUT']: return 0 if t < sec['LOOK'] else 18
    if t < sec['STATION']: return 18 if t < sec['EMPTY'] + 1 else 0
    if t < sec['ALONE']: return 0
    if t < hit['burn']: return 0 if t < hit['hold'] else 4
    if t < hit['white']: return 0
    if t > hit['curtainOut'] - 3: return 18
    return 0
proj = np.zeros(N); t = .15
while t < DUR - .05:
    f = fps(t)
    if f < 1: t += .02; continue
    c = claw(.8 + .2 * rng.random()); s = int(t * SR); e = min(N, s + len(c)); proj[s:e] += c[:e - s]
    t += 1 / f * (1 + (rng.random() - .5) * .04)
tt = np.arange(N) / SR; sp = np.interp(tt, tt[::480], np.array([fps(x) for x in tt[::480]])) / 18
proj = proj * .5 + (np.sin(2 * np.pi * 60 * tt) * .5 + np.sin(2 * np.pi * 120 * tt) * .3) * sp * .05 + bp(rng.standard_normal(N), 300, 1800) * .25 * sp * .35
def flap(t0, t1, rate0=14):
    t = t0
    while t < t1:
        f = max(4, rate0 - (t - t0) * 2); x = bp(rng.standard_normal(int(.03 * SR)), 600, 4000) * np.exp(-t_(.03) / .006) * 1.2
        s = int(t * SR); e = min(N, s + len(x)); proj[s:e] += x[:e - s]; t += 1 / f
flap(sec['RUNOUT'] + .3, sec['EMPTY'] + 1.0)          # the reel has run out
flap(hit['white'], hit['white'] + 2.0, 10)            # the frame burns through
flap(hit['curtainOut'] + 1.0, DUR - .2, 10)           # after the curtain
k = int(.08 * SR); proj[k:k + int(.03 * SR)] += bp(rng.standard_normal(int(.03 * SR)), 900, 6000) * np.exp(-t_(.03) / .004) * 2
# the projector sits far under the song; it comes forward where the song is quiet (the opening, the run-out, the ending)
lev = np.interp(tt, [0, 3.5, 6, sec['RUNOUT'], sec['RUNOUT'] + .5, sec['EMPTY'] + 1, sec['EMPTY'] + 2, hit['curtainOut'] - 4, DUR],
                [1.0, 1.0, .25, .25, .6, .6, .25, .25, .9])
proj = proj * lev * .1
mix = song + np.stack([proj * .9, proj], 1)
for c in (0, 1): mix[:, c] = limit(mix[:, c], .95)
sf.write(os.path.join(D, 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
print('mix.wav', round(len(mix) / SR, 2), 's')

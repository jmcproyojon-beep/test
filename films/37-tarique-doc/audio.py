"""Soundtrack for 37-tarique-doc: the client's Bangla narration (assets/vo_user.wav, starts at 1.2 s) over a soft glass-pad ambient
bed that blooms when the name is spoken and resolves on «শুভ জন্মদিন»; soft whooshes on the glass-plate moves.
Ducked under the voice, -14 LUFS / -1.5 dBTP.  Run from the mg-styles-15 root: python3 demos/37-tarique-doc/audio.py"""
import os, sys, subprocess, tempfile
D = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, os.path.join(D, '../../lib/audio'))
import numpy as np, soundfile as sf
from mgaudio import sfx, recipes
DUR, OFF = 61.2, 1.2
CUTS = [4.18, 6.94, 12.24, 16.64, 19.65, 22.18, 25.50, 29.59, 33.34, 38.46, 43.62, 47.25, 50.13, 55.38]   # narration line starts
m = recipes.ambient(duration=DUR, key='D', mode='major', flavor='glass', build=42.0, drop=43.62 + OFF, outro=55.38 + OFF,
                    music_level=-22.0, sfx_duck=2.0)
S = lambda s, at, lv=0.0: m.sfx(s, at=at, gain=lv)
for i, c in enumerate(CUTS): S(sfx.whoosh(0.6, kind='swoosh', seed=i + 3), c + OFF + .1, -16)
S(sfx.swell(sfx.ding('D6', kind='bell'), decay=2.0), 43.62 + OFF, -12)
S(sfx.riser(2.4, kind='tonal', note='D3'), 55.38 + OFF, -16)
S(sfx.ding('A6', kind='bell'), 55.38 + OFF, -10); S(sfx.ding('D7', kind='bell'), 55.9 + OFF, -14)
os.makedirs(D + 'out', exist_ok=True); out = D + 'out/music_sfx.wav'; m.export(out)
mus, sr = sf.read(out, dtype='float32')
tmp = tempfile.mkdtemp()
# voice: clean low end, gentle 3:1 compression, levelled to -16 LUFS (it carries the film)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', D + 'assets/vo_user.wav', '-af',
                'highpass=f=75,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-2:LRA=7:linear=true',
                '-ar', str(sr), '-ac', '2', f'{tmp}/vo.wav'], check=True)
# music: soften the bright glass/bell top end so it never bites
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-af', 'highshelf=f=5500:g=-6,lowpass=f=12000',
                f'{tmp}/mus.wav'], check=True)
v, _ = sf.read(f'{tmp}/vo.wav', dtype='float32'); mus, _ = sf.read(f'{tmp}/mus.wav', dtype='float32'); N = int(DUR * sr)
v = np.pad(v, ((int(OFF * sr), 0), (0, 0))); v = np.pad(v, ((0, max(0, N - len(v))), (0, 0)))[:N]
mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
# ducking: music sits ~20 dB under the voice while it speaks, rises softly (to ~-11 dB re voice) in the pauses
env = np.abs(v).mean(1); k = int(.05 * sr); env = np.convolve(env, np.ones(k) / k, 'same')
on = (env > np.percentile(env[env > 1e-4], 20) * .5).astype(np.float32)
a_up, a_dn = np.exp(-1 / (.12 * sr)), np.exp(-1 / (.7 * sr))      # duck fast, release slowly
from scipy.signal import lfilter
g = np.empty_like(on); y = 0.0
idx = np.flatnonzero(np.diff(np.r_[on[0] - 1, on]))                 # piecewise one-pole smoothing (fast down, slow up)
bounds = list(idx) + [len(on)]
for i in range(len(bounds) - 1):
    a, b = bounds[i], bounds[i + 1]; tgt = on[a]; c = a_up if tgt > .5 else a_dn
    n = np.arange(1, b - a + 1); g[a:b] = tgt + (y - tgt) * c ** n; y = g[b - 1]
duck_db = -9.0 * g                                                    # extra dip while the voice speaks
MUS_GAIN = 10 ** ((-27.0 - (-14.0)) / 20)                             # bed at -27 LUFS in the pauses (export is -14)
mix = v + mus * MUS_GAIN * (10 ** (duck_db / 20))[:, None]
sf.write(f'{tmp}/mix.wav', mix, sr, subtype='FLOAT')
# master: no loudness pumping, just a fixed gain to about -15 LUFS and a gentle true-peak limiter
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/mix.wav', '-af', 'volume=1.5dB,alimiter=limit=0.85:attack=5:release=60:level=disabled',
                '-ar', '48000', '-c:a', 'pcm_s24le', D + 'out/audio.wav'], check=True)
print('out/audio.wav', DUR, 's')

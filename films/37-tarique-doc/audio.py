"""Soundtrack for 37-tarique-doc: the Bangla narration (assets/vo.wav, starts at 1.2 s) over a soft glass-pad ambient
bed that blooms when the name is spoken and resolves on «শুভ জন্মদিন»; soft whooshes on the glass-plate moves.
Ducked under the voice, -14 LUFS / -1.5 dBTP.  Run from the mg-styles-15 root: python3 demos/37-tarique-doc/audio.py"""
import os, sys, subprocess, tempfile
D = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, os.path.join(D, '../../lib/audio'))
import numpy as np, soundfile as sf
from mgaudio import sfx, recipes
DUR, OFF = 62.2, 1.2
CUTS = [4.02, 6.70, 12.27, 17.10, 19.90, 22.64, 26.06, 30.61, 34.68, 39.59, 45.26, 49.18, 52.40, 57.42]   # narration line starts
m = recipes.ambient(duration=DUR, key='D', mode='major', flavor='glass', build=44.0, drop=45.26 + OFF, outro=57.42 + OFF,
                    music_level=-22.0, sfx_duck=2.0)
S = lambda s, at, lv=0.0: m.sfx(s, at=at, gain=lv)
for i, c in enumerate(CUTS): S(sfx.whoosh(0.6, kind='swoosh', seed=i + 3), c + OFF + .1, -16)
S(sfx.swell(sfx.ding('D6', kind='bell'), decay=2.0), 45.26 + OFF, -12)
S(sfx.riser(2.4, kind='tonal', note='D3'), 57.42 + OFF, -16)
S(sfx.ding('A6', kind='bell'), 57.42 + OFF, -10); S(sfx.ding('D7', kind='bell'), 57.9 + OFF, -14)
os.makedirs(D + 'out', exist_ok=True); out = D + 'out/music_sfx.wav'; m.export(out)
mus, sr = sf.read(out, dtype='float32')
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', D + 'assets/vo.wav', '-ar', str(sr), '-ac', '2', f'{tmp}/vo.wav'], check=True)
v, _ = sf.read(f'{tmp}/vo.wav', dtype='float32'); N = int(DUR * sr)
v = np.pad(v, ((int(OFF * sr), 0), (0, 0))); v = np.pad(v, ((0, max(0, N - len(v))), (0, 0)))[:N]
mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
env = np.abs(v).mean(1); k = int(.25 * sr); env = np.convolve(env, np.ones(k) / k, 'same')
duck = 1 - .4 * np.clip(env / (np.percentile(env, 90) + 1e-9), 0, 1)
mix = v * 1.0 + mus * duck[:, None] * 0.32
sf.write(f'{tmp}/mix.wav', mix, sr, subtype='FLOAT')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=disabled', '-ar', '48000',
                '-c:a', 'pcm_s24le', D + 'out/audio.wav'], check=True)
print('out/audio.wav', DUR, 's')

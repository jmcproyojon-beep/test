"""Soundtrack for 35-flow-ad: the cleaned voice-over (assets/vo.wav, speaker labels cut) + a bright explainer bed that
drops into the logo reveal + synthesised sound design on the picture's own hits; ducked under the voice, -14 LUFS / -1 dBTP.
Run from the mg-styles-15 root: python3 demos/35-flow-ad/audio.py"""
import os, sys
D = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, os.path.join(D, '../../lib/audio'))
import numpy as np, soundfile as sf
import mgaudio as mg
from mgaudio import sfx, recipes
DUR = 61.0
m = recipes.explainer(duration=DUR, bpm=112, key='D', mode='major', drop=48.9, build=46.6, outro=58.4, music_level=-25.0, sfx_duck=4.0)
S = lambda s, at, lv=0.0: m.sfx(s, at=at, gain=lv)
for at in (6.3, 12.9, 19.3, 25.6, 30.9, 35.5, 39.4, 52.9, 55.9, 58.4): S(sfx.whoosh(0.45, kind='swish', seed=int(at)), at - .15, -10)
for at in (2.5, 3.0, 5.36): S(sfx.ding('A5', kind='bell', dur=.25), at, -18)                          # honks (soft)
for at in (4.62, 7.04, 8.02, 9.06, 10.32, 11.98, 16.88, 23.82, 24.5, 28.7, 28.95, 29.2): S(sfx.pop('mouth', pitch=1.0 + (at % 3) * .1), at, -12)
S(sfx.click('soft'), 13.8, -6); S(sfx.coin(), 15.76, -14); S(sfx.impact('punch', size=.6), 17.86, -10)
for at in (31.18, 32.06, 32.88, 33.56, 34.62): S(sfx.whoosh(0.35, kind='swoosh', seed=int(at * 10)), at - .12, -12)
S(sfx.ding('E6', kind='bell'), 38.16, -12); S(sfx.ding('D6', kind='bell'), 39.58, -14); S(sfx.ding('A6', kind='bell'), 42.02, -16)
S(sfx.riser(2.2, kind='hybrid', note='D3'), 46.7, -12); S(sfx.impact('cinematic', size=.9), 48.94, -6)
S(sfx.whoosh(0.8, kind='swoosh', seed=7), 49.1, -10); S(sfx.pop('mouth', pitch=.8), 51.76, -8)
out = D + 'out/music_sfx.wav'; os.makedirs(D + 'out', exist_ok=True); m.export(out)
mus, sr = sf.read(out, dtype='float32')
vo, vsr = sf.read(D + 'assets/vo.wav', dtype='float32')
import subprocess, tempfile
tmp = tempfile.mkdtemp(); sf.write(f'{tmp}/vo.wav', vo, vsr)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/vo.wav', '-ar', str(sr), '-ac', '2', f'{tmp}/vo48.wav'], check=True)
v, _ = sf.read(f'{tmp}/vo48.wav', dtype='float32'); N = int(DUR * sr)
v = np.pad(v, ((0, max(0, N - len(v))), (0, 0)))[:N]; mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
# duck the bed under the voice
env = np.abs(v).mean(1); k = int(.12 * sr); env = np.convolve(env, np.ones(k) / k, 'same'); duck = 1 - .45 * np.clip(env / (np.percentile(env, 90) + 1e-9), 0, 1)
mix = v * 1.0 + mus * duck[:, None] * 0.16
sf.write(f'{tmp}/mix.wav', mix, sr, subtype='FLOAT')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'pcm_s24le', D + 'out/audio.wav'], check=True)
print('out/audio.wav', DUR, 's')

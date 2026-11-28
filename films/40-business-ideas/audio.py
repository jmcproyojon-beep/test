"""Soundtrack for 40-business-ideas: the Bangla voice-over (assets/vo.wav, vidIQ voice 'Ashwat'), split so there is a
0.5 s held breath before #1, over an upbeat 120 BPM bed (mgaudio, made in code, royalty-free) that cuts to silence
for that breath and drops on the gold ‘১’. SFX sit on the picture's own events. Ducked under the voice, -14 LUFS.
Run from the mg-styles-15 root: python3 demos/40-business-ideas/audio.py"""
import os, sys, subprocess, tempfile
D = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, os.path.join(D, '../../lib/audio'))
import numpy as np, soundfile as sf
from mgaudio import sfx, recipes

L = [0, 5.878, 10.162, 19.148, 29.336, 37.042, 44.199, 52.715, 59.873, 62.798]
OFF, GAP = 0.3, 0.5
ST = [OFF + v + (GAP if i >= 6 else 0) for i, v in enumerate(L)]
DUR = ST[9] + 1.6
m = recipes.explainer(duration=DUR, bpm=120, key='C', mode='major', build=ST[6] - 4.0, drop=ST[6], outro=ST[8], music_level=-24.0, sfx_duck=3.0)
S = lambda s, at, lv=0.0: m.sfx(s, at=at, gain=lv)
# 1 hook: the bundle bursts (coin + whoosh), five shops land (pops)
S(sfx.coin(), ST[0] + 0.55, -4); S(sfx.whoosh(0.6, kind='swoosh', seed=1), ST[0] + 0.7, -8)
for i in range(5): S(sfx.pop('mouth', pitch=0.9 + i * 0.08), ST[0] + 0.55 + 0.08 * i + 0.7, -10)
# 2 open loop: the padlock snaps, a small riser
S(sfx.click('soft'), ST[1] + 1.55, 0); S(sfx.riser(1.6, kind='tonal', note='C4'), ST[1] + 3.6, -16)
# countdown numbers: a thud as each lands
for k in (2, 3, 4, 5): S(sfx.impact('thud', size=0.8), ST[k] + 0.05 + 0.2, -4); S(sfx.whoosh(0.4, kind='swish', seed=k), ST[k] + 0.0, -12)
S(sfx.whoosh(0.3, kind='swish', seed=21), ST[2] + 1.0, -16)                                  # page flip
for i in range(7): S(sfx.pop('mouth', pitch=1.0 + (i % 3) * 0.12), ST[3] + 1.25 + i * 0.45, -10)   # plants pop up
for i in range(6): S(sfx.ding('E6', kind='bell', dur=0.3), ST[3] + 5.2 + i * 0.4, -18)       # likes
for i in range(4): S(sfx.click('soft'), ST[4] + 0.9 + i * 0.35, -6)                            # tiffin boxes clack
S(sfx.ding('A5', kind='bell'), ST[4] + 3.2, -12); S(sfx.whoosh(0.8, kind='swoosh', seed=33), ST[4] + 3.3, -10)
S(sfx.whoosh(0.5, kind='swoosh', seed=41), ST[5] + 0.3, -8)
for i in range(6): S(sfx.ding('C6', kind='bell', dur=0.25), ST[5] + 0.8 + i * 0.5, -18)       # new orders
S(sfx.ding('G6', kind='bell'), ST[5] + 4.45, -8)                                              # the green tick
# #1: silence, then the slam + confetti; four posts fly to the shops
S(sfx.impact('cinematic', size=1.0), ST[6] + 0.25, 0); S(sfx.pop('mouth', pitch=1.3), ST[6] + 0.4, -6)
for i in range(4): S(sfx.whoosh(0.35, kind='swish', seed=60 + i), ST[6] + 2.9 + i * 0.5, -10); S(sfx.ding('E6', kind='bell', dur=0.3), ST[6] + 3.2 + i * 0.5, -16)
# the mistake: lock opens, coins pour, rewind, one coin, the boat floats (splash)
S(sfx.click('soft'), ST[7] + 0.3, -2)
for i in range(8): S(sfx.coin(), ST[7] + 0.9 + i * 0.12, -16)
S(sfx.reverse_cymbal(0.8), ST[7] + 3.4, -10)
S(sfx.splash(size=0.7), ST[7] + 3.4 + 0.9, -6)
# CTA: the shops fold back into the bundle
S(sfx.whoosh(0.6, kind='swoosh', seed=91), ST[8] + 1.7, -10); S(sfx.pop('mouth', pitch=1.1), ST[8] + 2.6, -6)
os.makedirs(D + 'out', exist_ok=True); out = D + 'out/music_sfx.wav'; m.export(out)

mus, sr = sf.read(out, dtype='float32')
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', D + 'assets/vo.wav', '-af', 'highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-2:LRA=7:linear=true',
                '-ar', str(sr), '-ac', '2', f'{tmp}/vo.wav'], check=True)
vo, _ = sf.read(f'{tmp}/vo.wav', dtype='float32'); N = int(DUR * sr)
cut = int(L[6] * sr)
v = np.zeros((N, 2), np.float32)
a0 = int(OFF * sr); v[a0:a0 + cut] += vo[:cut][: N - a0]
b0 = int((OFF + L[6] + GAP) * sr); rest = vo[cut:]; v[b0:b0 + len(rest)] += rest[: N - b0]
mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
# the held breath: music and effects drop out for GAP before the slam
g = np.ones(N, np.float32); s0, s1 = int((ST[6] - GAP) * sr), int(ST[6] * sr); g[s0:s1] = 0
fade = int(0.03 * sr); g[s0 - fade:s0] = np.linspace(1, 0, fade)
env = np.abs(v).mean(1); k = int(0.25 * sr); env = np.convolve(env, np.ones(k) / k, 'same')
duck = 1 - 0.55 * np.clip(env / (np.percentile(env, 90) + 1e-9), 0, 1)
mix = v + mus * (duck * g)[:, None] * 0.42
sf.write(f'{tmp}/mix.wav', mix, sr, subtype='FLOAT')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/mix.wav', '-af', 'volume=2dB,alimiter=limit=0.85:attack=5:release=60:level=disabled', '-ar', '48000', '-c:a', 'pcm_s24le', D + 'out/audio.wav'], check=True)
print('out/audio.wav', round(DUR, 2), 's')

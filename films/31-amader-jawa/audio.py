"""Soundtrack for 31-amader-jawa: the song master + a very sparse layer of hand-made SFX on the same cue sheet as the picture
(paper swish under each ink-wipe scene change, camera shutter on the two photo flashes), mastered to -14 LUFS / <= -1 dBTP, 48 kHz.
Run from the repo root: python3 demos/31-amader-jawa/audio.py"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf, pyloudnorm as pyln
D = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, os.path.join(D, '../../lib/audio'))
from mgaudio import sfx
SR = 48000
L = json.load(open(D + 'lines.json'))
t0 = lambda i: L[i]['t0']
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', D + 'assets/song.mp3', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_f32le', f'{tmp}/s.wav'], check=True)
x, _ = sf.read(f'{tmp}/s.wav', dtype='float32'); x = x.T.copy()
meter = pyln.Meter(SR); song_lufs = meter.integrated_loudness(x.T)
bus = np.zeros_like(x)
def place(s, at, g=0.0):
    d = s.data if s.data.ndim == 2 else np.stack([s.data, s.data])
    i0 = int(round((at - s.sync) * SR)); a, b = max(0, i0), min(x.shape[1], i0 + d.shape[1])
    if b > a: bus[:, a:b] += d[:, a - i0:b - i0] * 10 ** (g / 20)
SEC = [0, 8, 12, 16, 20, 24, 32, 40, 48, 52, 60, 68, 80]          # first lyric line of each section (same as the page)
lead = {24: 0.9, 52: 0.9, 68: 0.9}
for j, li in enumerate(SEC[1:]):
    place(sfx.paper('slide', dur=0.45, seed=10 + j), max(0, t0(li) - lead.get(li, 0.6)) + 0.1, -4)
place(sfx.shutter('phone'), t0(63) + 0.8, 0)
place(sfx.shutter('film'), t0(81), 2)
lvl = meter.integrated_loudness(bus.T + 1e-9 * np.random.default_rng(0).standard_normal(bus.T.shape))
mix = x + bus * 10 ** ((song_lufs - 18 - lvl) / 20)
sf.write(f'{tmp}/m.wav', mix.T, SR, subtype='FLOAT')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{tmp}/m.wav', '-af', 'loudnorm=I=-14:TP=-1.8:LRA=20:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.8:LRA=20:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
os.makedirs(D + 'out', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/m.wav', '-af', af, '-ar', '48000', '-c:a', 'pcm_s24le', D + 'out/audio.wav'], check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', D + 'out/audio.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print(r[r.rindex('Summary:'):])

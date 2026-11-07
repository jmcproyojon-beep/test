"""Soundtrack for 30-manobotar-dak: the song master + a light layer of paper / collage SFX on the shared cue sheet,
mastered to -14 LUFS integrated, true peak <= -1 dBTP, 48 kHz stereo.  Output: out/audio.wav
Run from the repo root:  python3 demos/30-manobotar-dak/audio.py <song.mp3>
"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf, pyloudnorm as pyln
D = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, os.path.join(D, '../../lib/audio'))
from mgaudio import sfx
SR = 48000
song = sys.argv[1] if len(sys.argv) > 1 else D + 'assets/song.mp3'
C = json.load(open(D + 'cues.json')); A = json.load(open(D + 'cues_audio.json'))
L = A['lines']

tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', song, '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_f32le', f'{tmp}/song.wav'], check=True)
x, _ = sf.read(f'{tmp}/song.wav', dtype='float32'); x = x.T.copy()          # (2, n)
meter = pyln.Meter(SR)
song_lufs = meter.integrated_loudness(x.T)
sfx_bus = np.zeros_like(x)

def place(s, at, gain_db=0.0):
    d = s.data if s.data.ndim == 2 else np.stack([s.data, s.data])
    i0 = int(round((at - s.sync) * SR)); a, b = max(0, i0), min(x.shape[1], i0 + d.shape[1])
    if b > a: sfx_bus[:, a:b] += d[:, a - i0:b - i0] * 10 ** (gain_db / 20)

# the cue sheet (same numbers the picture reads)
place(sfx.sticker_slap(seed=1), C['hits']['portrait_slap'], 2)                       # hook: portrait slapped on
for i, (name, t0, t1) in enumerate(C['sections'][1:]):                               # page slapped over at every section
    place(sfx.paper('slide', dur=0.5, seed=10 + i), t0 + 0.05, -2)
for i, (a, b) in enumerate(C['lid_open']):                                           # flip-top: POP open, slam shut
    place(sfx.pop('cork', pitch=0.9 + 0.05 * i), a, 3)
    place(sfx.sticker_slap(seed=30 + i), b + 0.08, -1)
for i, t in enumerate(np.arange(L[1]['t0'], L[1]['t0'] + 1.6, 0.17)):                # scissors cut the borders
    place(sfx.scissors(seed=40 + i), float(t), -6)
place(sfx.tape_rip(dur=0.5, seed=50), C['hits']['tear'][0], 2)                       # the sunrise tear
for i in range(71, 77):                                                              # chant: rubber stamps on each line
    place(sfx.stamp('rubber', seed=60 + i), L[i]['t0'], 0)
for i, t in enumerate([246.26, 247.6]):                                              # the Earth is taped back together
    place(sfx.tape_rip(dur=0.35, up=False, seed=70 + i), t, -4)
place(sfx.paper('flip', dur=0.8, seed=80), C['hits']['page_flip'], 2)

# SFX sit ~12 dB under the song, then master the sum
sfx_lufs = meter.integrated_loudness(sfx_bus.T + 1e-9 * np.random.default_rng(0).standard_normal(sfx_bus.T.shape))
target = song_lufs - 12 - sfx_lufs + (meter.integrated_loudness(sfx_bus.T) if False else 0)
mix = x + sfx_bus * 10 ** ((song_lufs - 16 - sfx_lufs) / 20)
sf.write(f'{tmp}/mix.wav', mix.T, SR, subtype='FLOAT')
# two-pass EBU R128 loudness normalisation (linear) with true-peak ceiling
r = subprocess.run(['ffmpeg', '-v', 'info', '-hide_banner', '-i', f'{tmp}/mix.wav', '-af', 'loudnorm=I=-14:TP=-1.2:LRA=20:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=20:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
os.makedirs(D + 'out', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/mix.wav', '-af', af, '-ar', '48000', '-c:a', 'pcm_s24le', D + 'out/audio.wav'], check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', D + 'out/audio.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
summ = r[r.rindex('Summary:'):]
print(f'song {song_lufs:.1f} LUFS -> out/audio.wav'); print(summ)

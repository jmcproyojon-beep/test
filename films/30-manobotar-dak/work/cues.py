"""Cue sheet for 30-manobotar-dak: lyric lines from the SRT + beats / downbeats / vocal envelope from the master.
Run from the repo root: python3 demos/30-manobotar-dak/work/cues.py <song.mp3> <lyrics.srt>"""
import json, re, sys, os
import numpy as np, librosa
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
song, srt = sys.argv[1], sys.argv[2]
y, sr = librosa.load(song, sr=22050, mono=True)
dur = len(y) / sr
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time', tightness=120)
# vocal-ish envelope: harmonic part, 300-3400 Hz band energy, 30 fps
yh = librosa.effects.harmonic(y, margin=3)
S = np.abs(librosa.stft(yh, n_fft=2048, hop_length=735))
f = librosa.fft_frequencies(sr=sr, n_fft=2048)
band = S[(f > 300) & (f < 3400)].mean(0)
band = band / (np.percentile(band, 98) + 1e-9)
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=735)[0]; rms = rms / (np.percentile(rms, 98) + 1e-9)
on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=735); on = on / (np.percentile(on, 99) + 1e-9)
def ts(s):
    h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
lines = []
for blk in re.split(r'\n\s*\n', open(srt, encoding='utf-8').read().strip()):
    ls = [l for l in blk.strip().splitlines() if l.strip()]
    if len(ls) < 3: continue
    a, b = [ts(x.strip()) for x in ls[1].split('-->')]
    lines.append({'t0': round(a, 3), 't1': round(b, 3), 'text': ' '.join(ls[2:]).strip()})
out = {'duration': round(dur, 3), 'tempo': float(np.atleast_1d(tempo)[0]), 'beats': [round(float(b), 3) for b in beats],
       'lines': lines, 'voc': [round(float(v), 3) for v in np.clip(band, 0, 1.5)], 'rms': [round(float(v), 3) for v in np.clip(rms, 0, 1.5)],
       'onset': [round(float(v), 3) for v in np.clip(on, 0, 1.5)]}
json.dump(out, open(D + 'cues_audio.json', 'w'))
print('dur', dur, 'tempo', out['tempo'], 'beats', len(beats), 'lines', len(lines))
print('beat gaps', np.round(np.diff(beats)[:12], 3))

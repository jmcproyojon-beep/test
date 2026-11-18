"""Cut the spoken speaker labels out of the generated voice-over (the TTS read «ক্যানভাসার», «Flow টিম», «ন্যারেটর», «বিরতি»,
«রহিম ভাই», «ভাগ্নে ফিসফিস» aloud). Keeps everything else; «বিরতি» becomes a real pause. Writes assets/vo.wav and
assets/timemap.json (original seconds -> new seconds) so the word timings from work_asr.json still line up."""
import json, sys, numpy as np, soundfile as sf
src = sys.argv[1]
x, sr = sf.read(src, dtype='float32')
CUTS = [(19.45, 20.42, 0.0), (27.00, 28.05, 0.0), (33.25, 34.40, 0.0), (42.58, 43.60, 0.55), (56.91, 57.98, 0.0), (60.84, 62.50, 0.0)]   # (from, to, silence inserted)
F = int(.012 * sr)
out, segs, pos, prev = [], [], 0.0, 0.0
def piece(a, b):
    y = x[int(a * sr):int(b * sr)].copy()
    if len(y) > 2 * F: y[:F] *= np.linspace(0, 1, F); y[-F:] *= np.linspace(1, 0, F)
    return y
for a, b, gap in CUTS:
    out.append(piece(prev, a)); segs.append([prev, a, pos]); pos += a - prev
    if gap: out.append(np.zeros(int(gap * sr), np.float32)); pos += gap
    prev = b
out.append(piece(prev, len(x) / sr)); segs.append([prev, len(x) / sr, pos]); pos += len(x) / sr - prev
y = np.concatenate(out)
sf.write('assets/vo.wav', y, sr)
json.dump({'segs': segs, 'dur': len(y) / sr}, open('assets/timemap.json', 'w'))
print('vo.wav', round(len(y) / sr, 2), 's')

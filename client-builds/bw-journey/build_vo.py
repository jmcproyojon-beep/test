"""Place the client's six voice lines into the six 10 s parts.

    python3.13 -I build_vo.py <client voice .wav>
      -> audio/vo.wav (60 s, 48 kHz mono)  and  remotion-composer/src/bwjourney/vo.json

The recording has the six lines back to back (49.5 s). Each line is cut at the pauses
between lines and starts OFF[i] s into its part. Caption word times come from the
Whisper word starts (whisper_words.json), mapped onto the script words by letter position.
"""
import json, re, sys
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

HERE = Path(__file__).parent
SR = 48000
CUTS = [(0.0, 7.75), (8.05, 14.75), (15.15, 23.45), (23.95, 30.8), (31.25, 40.55), (41.0, 49.52)]
OFF = [1.0, 1.3, 1.0, 1.3, 0.55, 0.9]
LINES = json.load(open(HERE / "script.json"))
HW = json.load(open(HERE / "whisper_words.json"))

sr, x = wavfile.read(sys.argv[1])
x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
if x.ndim > 1: x = x.mean(axis=1)
x = resample_poly(x, SR // 100, sr // 100) if sr != SR else x
out = np.zeros(60 * SR, np.float32)
words, lines = [], []
# heard words belonging to each line (global indices into whisper_words.json), and for each
# script word the heard word it starts on (x.5 = half way into a heard word that merged two)
SPAN = [(0, 16), (17, 33), (34, 50), (51, 68), (69, 87), (88, 104)]
MAP = [[0, 1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 13, 14, 16],
       [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16],
       [0, 1, 2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 16.5],
       [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 16],
       [0, 1, 2, 3, 4, 5, 6, 7, 8, 8.5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
       [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16]]
# Whisper puts the first word after a pause too early, so a start that lands in silence
# moves forward to where the voice actually begins.
HOP = SR // 100
env = np.sqrt(np.convolve(x[:len(x) // HOP * HOP].reshape(-1, HOP).astype(np.float64).__pow__(2).mean(1), np.ones(3) / 3, "same"))
THR = 0.08 * np.percentile(env, 95)
def onset(t):
    k = int(t * 100)
    while k < len(env) - 1 and env[k] < THR and k < int(t * 100) + 100: k += 1
    return k / 100
for i, ((a, b), text) in enumerate(zip(CUTS, LINES)):
    seg = x[int(a * SR):int(b * SR)].copy()
    f = int(0.03 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    t0 = i * 10 + OFF[i]
    out[int(t0 * SR):int(t0 * SR) + len(seg)] += seg
    hw = HW[SPAN[i][0]:SPAN[i][1] + 1]
    sw = [w for w in re.split(r"[ —]+", text) if w]
    assert len(sw) == len(MAP[i]), (i, len(sw), len(MAP[i]))
    def at(q):   # heard-word index (fractional = part way into that word) -> source time, pushed past silence
        k = int(q); w = hw[k]; t = w["s"] + (q - k) * (w["e"] - w["s"])
        return onset(max(t, a))
    st = [at(q) for q in MAP[i]] + [min(b, hw[-1]["e"] + 0.15)]
    st = np.maximum.accumulate(np.array(st)) - a + t0
    for k, w in enumerate(sw):
        words.append({"w": w, "s": round(float(st[k]), 2), "e": round(float(st[k + 1]), 2), "line": i})
    lines.append({"i": i, "text": text, "s": round(float(st[0]), 2), "e": round(float(st[-1]), 2)})
    print(i, f"{st[0]:.2f}-{st[-1]:.2f}", len(sw), "words /", len(hw), "heard")
(HERE / "audio").mkdir(exist_ok=True)
wavfile.write(HERE / "audio/vo.wav", SR, (np.clip(out, -1, 1) * 32767).astype(np.int16))
json.dump({"total": 60, "lines": lines, "words": words},
          open(HERE.parents[1] / "remotion-composer/src/bwjourney/vo.json", "w"), ensure_ascii=False)

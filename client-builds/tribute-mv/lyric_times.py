"""Final lyric timings: Whisper/NW alignment (align_lyrics.py) checked line by line, with the choruses and
the lines Whisper garbled re-timed from prompted re-transcriptions of those stretches. Start times in seconds.

    python3.13 -I lyric_times.py   -> remotion-composer/src/tribute/lyrics.json
"""
import json
from pathlib import Path
HERE = Path(__file__).parent
STARTS = [10.3, 22.4, 31.7, 36.3, 57.5, 63.0, 69.6, 75.8, 82.4, 89.8, 96.9, 102.0, 108.2, 117.6, 124.8, 128.2, 131.8, 136.8,
          148.7, 152.0, 155.1, 158.2, 161.5, 164.6, 167.8, 170.9, 174.1, 177.7, 180.9, 183.9,
          212.5, 218.1, 225.0, 230.9, 240.3, 247.6, 254.0, 257.8,
          266.8, 270.3, 273.3, 276.8, 280.2, 283.6, 287.2, 290.2, 293.0, 296.0,
          319.1, 323.8, 331.8, 337.4, 343.7, 349.7, 370.6, 377.0, 383.0, 387.0, 390.4, 393.3, 407.6, 414.5, 422.8, 432.0, 437.8]
GAP_END = {3: 44.6, 17: 143.5, 29: 188.5, 33: 238.0, 37: 262.0, 47: 300.0, 53: 358.2, 59: 397.0, 64: 445.0}
L = json.load(open(HERE / "lyrics_srt.json")); assert len(L) == len(STARTS) == 65
out = []
for i, l in enumerate(L):
    e = GAP_END.get(i, STARTS[i + 1] - 0.08 if i + 1 < len(STARTS) else STARTS[i] + 6)
    out.append({"i": i, "text": l["text"], "s": STARTS[i], "e": round(min(e, STARTS[i] + 9), 2)})
json.dump({"total": 447.0, "lines": out}, open(HERE.parents[1] / "remotion-composer/src/tribute/lyrics.json", "w"), ensure_ascii=False)
print("ok", out[-1])

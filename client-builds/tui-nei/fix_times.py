"""Hand fixes after align_lyrics.py, from the Whisper word times (audio/whisper_words.json):
the processed intro chant (lines 0-2) sits 9.3-16.4 s, the clear chant (line 3) 18.26-21.66 s, and verse 2's first
line starts at 113.6 s (Whisper hears a long ad-lib in the break before it).
    python3 fix_times.py   (rewrites remotion-composer/src/tuinei/lyrics.json in place)"""
import json
from pathlib import Path
P = Path(__file__).resolve().parents[1] / ".." / "remotion-composer/src/tuinei/lyrics.json"
P = P.resolve()
d = json.load(open(P))
SPANS = {0: (9.3, 11.6), 1: (11.65, 14.0), 2: (14.05, 16.4), 3: (18.26, 21.62), 37: (113.6, 115.2)}
for li, (a, b) in SPANS.items():
    ws = [w for w in d["words"] if w["line"] == li]
    step = (b - a) / len(ws)
    for k, w in enumerate(ws):
        w["s"] = round(a + k * step, 2); w["e"] = round(a + (k + 0.92) * step, 2)
    for l in d["lines"]:
        if l["i"] == li: l["s"], l["e"] = a, b
json.dump(d, open(P, "w"), ensure_ascii=False)
print("fixed", list(SPANS))

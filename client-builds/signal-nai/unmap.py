"""Map word times from the sped-up transcription collage back to song time.

collage.json lists the song windows that were cut out, sped up by `tempo`
and joined with `gap` seconds of silence. A collage time falls in exactly
one window (or a gap, which is clamped to the nearest window edge).

    python3 -I client-builds/signal-nai/unmap.py   # collage_words.json -> words.json
"""
import json
from pathlib import Path

HERE = Path(__file__).parent
A = Path(__file__).resolve().parents[2]/"projects/signal-nai/assets/audio"
cfg = json.load(open(HERE/"collage.json"))
k, gap = cfg["tempo"], cfg["gap"]

spans, c = [], 0.0          # (collage start, collage end, song start)
for a, b in cfg["windows"]:
    L = (b - a) / k
    spans.append((c, c + L, a)); c += L + gap


def to_song(tc):
    for i, (c0, c1, a) in enumerate(spans):
        if tc <= c1 or i == len(spans) - 1:
            return a + (max(tc, c0) - c0) * k
    return None


if __name__ == "__main__":
    words = json.load(open(HERE/"collage_words.json", encoding="utf-8"))["words"]  # Scribe output, kept in git
    out = []
    for w in words:
        if w.get("type") != "word":
            continue
        if w["end"] - w["start"] < 0.01:      # zero-length repeats are padding, not singing
            continue
        out.append({**w, "start": round(to_song(w["start"]), 3), "end": round(to_song(w["end"]), 3)})
    json.dump({"words": out}, open(A/"words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"{len(out)} words -> words.json  ({out[0]['start']:.2f} .. {out[-1]['end']:.2f}s)")

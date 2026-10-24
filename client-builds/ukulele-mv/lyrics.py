"""Group Scribe's word timings into singable lyric lines."""
import json
from pathlib import Path

P = Path("projects/ukulele-mv")
MAX_SECS, MAX_WORDS, GAP = 5.0, 7, 0.9

def lines():
    words = json.load(open(P/"assets/audio/words.json"))["words"]
    words = [w for w in words if w.get("type") == "word"]
    out, cur = [], []

    def flush():
        if cur:
            out.append({"text": " ".join(w["text"] for w in cur),
                        "start": cur[0]["start"], "end": cur[-1]["end"]})
            cur.clear()

    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        span = w["end"] - cur[0]["start"]
        # a danda ends a line; so does a long pause, an over-long line, or a
        # comma once the line is already long enough to stand on its own
        if (w["text"].endswith("।")
                or nxt is None
                or nxt["start"] - w["end"] > GAP
                or span > MAX_SECS
                or (w["text"].endswith(",") and (len(cur) >= 4 or span > 3.0))
                or len(cur) >= MAX_WORDS):
            flush()

    # Scribe sometimes strands a last word on its own ("জল।"). Fold any stub
    # back into the line it belongs to rather than flashing it alone.
    merged = []
    for l in out:
        stub = len(l["text"].split()) < 2 or l["end"] - l["start"] < 0.8
        if stub and merged and l["start"] - merged[-1]["end"] < 0.5:
            merged[-1]["text"] += " " + l["text"]
            merged[-1]["end"] = l["end"]
        else:
            merged.append(l)
    return merged

if __name__ == "__main__":
    ls = lines()
    print(f"{len(ls)} lines")
    for l in ls:
        print(f"  {l['start']:7.2f} - {l['end']:7.2f}  ({l['end']-l['start']:4.1f}s)  {l['text']}")

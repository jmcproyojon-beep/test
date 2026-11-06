"""Export the timing data the "মানবতার ডাক" video reacts to.

    python3.13 -I client-builds/manobotar-dak/export_data.py

- lyric lines with per-word timings (align.py: the artist's words on the
  Whisper transcript's clock), plus a Bangla .srt for YouTube captions
- section start times (first line of each sheet section)
- beats, downbeats, per-frame loudness and bass
"""
import json, sys
from pathlib import Path
import numpy as np
import librosa

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
import align  # noqa: E402

A = ROOT/"projects/manobotar-dak/assets/audio"
OUT = ROOT/"remotion-composer/src/manobotar/data.json"
FPS = 30


def srt_time(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# Lines the transcript missed or mis-timed, set from the audio. Key: (text, nth
# occurrence) -> (start, end). Evidence:
#  - verse 1 opens just before "মানচিত্র আঁকা হয়" (heard at 74.4 s); nothing
#    of the sheet is heard 49-71 s
#  - pre-chorus 1 lines 3-6 and chorus 1's opening hooks: Whisper skipped
#    101-116 s while the vocal runs on. Chorus 2's hooks are heard at 193.9 /
#    197.2 s and chorus 2 matches chorus 1 at +84.8 s (chroma, r = 0.93), so
#    chorus 1's hooks are at 109.1 / 112.4 s; the four lines fill 101-109 s
#  - chorus 2 after "যত ঝড়ই": chorus 1's timings + 84.8 s (Whisper skipped
#    206-227 s; the bridge starts at 227.7 s)
#  - the last "আলো জ্বলবেই" and the outro, tightened to the heard words
OV = {
    ("রাজপ্রাসাদের", 0): (71.3, 74.3),
    ("আমরা তবু হাত", 0): (101.3, 103.1), ("একসঙ্গে পথ চলব", 0): (103.2, 104.9),
    ("আমাদের বিশ্বাস", 0): (105.0, 106.8), ("আমাদের কণ্ঠ", 0): (106.9, 108.8),
    ("শেষ আলো জ্বলবেই", 0): (109.1, 112.2), ("শেষ আলো জ্বলবেই", 1): (112.4, 115.8),
    ("যত ঝড়ই", 0): (116.0, 118.5), ("মানুষ আবার দাঁড়াবেই", 0): (118.6, 122.4), ("আমরা হার", 0): (123.0, 126.2),
    ("ঘৃণার কাছে", 0): (126.3, 129.4), ("শান্তির নামে", 0): (129.5, 132.2), ("নতুন সকাল", 0): (132.3, 135.0),
    ("শেষ আলো জ্বলবেই", 2): (135.1, 138.4), ("শেষ আলো জ্বলবেই", 3): (139.5, 142.6),
    ("শেষ আলো জ্বলবেই", 4): (193.9, 196.9), ("শেষ আলো জ্বলবেই", 5): (197.2, 200.4),
    ("যত ঝড়ই", 1): (200.8, 203.3), ("মানুষ আবার দাঁড়াবেই", 1): (203.4, 207.2), ("আমরা হার", 1): (207.8, 211.0),
    ("ঘৃণার কাছে", 1): (211.1, 214.2), ("শান্তির নামে", 1): (214.3, 217.0), ("নতুন সকাল", 1): (217.1, 219.8),
    ("শেষ আলো জ্বলবেই", 6): (219.9, 223.2), ("শেষ আলো জ্বলবেই", 7): (224.3, 227.3),
    ("হে স্রষ্টা, আলো", 0): (186.4, 188.0), ("সত্যের পথে", 0): (188.1, 189.6),
    ("একটি শিশু", 0): (227.7, 229.8), ("আমি আবার স্কুলে", 0): (229.9, 232.9),     # heard 227.7 / 229.9-232.0
    ("এই বিশ্বাস রইবেই", 0): (288.8, 292.5),
    ("আলো জ্বলবেই!", 1): (307.9, 310.8),
    ("এই পৃথিবী", 0): (318.6, 321.4), ("আমাদের সবার", 0): (321.6, 325.0),
}
# The climax after the outro (327-350.5 s) repeats the hook — not on the sheet.
# Chroma matches chorus 1's hook melody at 324.8 / 338.0 s (r ~ 0.9); the
# transcript hears the hook three times from 327.2 s, each ~3.4 s.
REPRISE = [327.2, 330.7, 333.8, 337.2, 340.6, 344.0, 347.4]


def syl_split(text, s, e):
    ws = text.split()
    wt = [max(1, len(x)) for x in ws]
    tot, acc, out = sum(wt), 0, []
    for x, k in zip(ws, wt):
        a = s + (e - s) * acc / tot; acc += k
        out.append({"w": x, "s": round(a, 3), "e": round(s + (e - s) * acc / tot - 0.03, 3)})
    return out


def main():
    lines = [{"section": l["section"].split(" — ")[0].strip(), "text": l["text"], "s": l["start"], "e": l["end"],
              "words": [{"w": w["w"], "s": w["s"], "e": w["e"]} for w in l["words"]]} for l in align.build()]
    count = {}
    match = lambda key, text: text.startswith(key) or (key.endswith("!") and text == key)
    for l in lines:                       # lines are in time order = sheet order here
        for key in sorted({k for k, _ in OV}, key=len, reverse=True):
            if match(key, l["text"]):
                c = count.get(key, 0); count[key] = c + 1
                if (key, c) in OV:
                    s0, e0 = OV[(key, c)]
                    l["s"], l["e"], l["words"] = s0, e0, syl_split(l["text"], s0, e0)
                break
    for i, s0 in enumerate(REPRISE):
        e0 = (REPRISE[i + 1] - 0.1) if i + 1 < len(REPRISE) else 350.5
        lines.append({"section": "Reprise", "text": "শেষ আলো জ্বলবেই!", "s": s0, "e": round(e0, 2), "words": syl_split("শেষ আলো জ্বলবেই!", s0, e0)})
    lines.sort(key=lambda l: l["s"])
    for a, b in zip(lines, lines[1:]):
        if a["e"] > b["s"] - 0.05:
            a["e"] = round(max(a["s"] + 0.4, b["s"] - 0.05), 2)
            for w in a["words"]:
                w["s"] = min(w["s"], a["e"]); w["e"] = min(w["e"], a["e"])
    sections = {}
    for l in lines:
        sections.setdefault(l["section"], l["s"])
    y, sr = librosa.load(A/"song.wav", sr=24000, mono=True)
    dur = len(y) / sr; n = int(np.ceil(dur * FPS)); hop = sr // FPS
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
    fit = lambda v: (np.asarray(v)[:n] if len(v) >= n else np.pad(v, (0, n - len(v)), mode="edge"))
    nrm = lambda v: np.clip(v / (np.percentile(v, 98) or 1), 0, 1)
    rms = fit(nrm(librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]))
    bass = fit(nrm(S[(fr >= 30) & (fr < 150)].sum(0)))
    beats = json.load(open(A/"beats.json"))["beats"]
    bi = [min(n - 1, int(round(b * FPS))) for b in beats]
    phase = int(np.argmax([sum(bass[f] for k, f in enumerate(bi) if k % 4 == p) for p in range(4)]))
    q = lambda v: [int(round(x * 99)) for x in v]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"fps": FPS, "duration": round(dur, 3), "frames": n, "beats": [round(b, 3) for b in beats],
                               "downbeats": [round(b, 3) for k, b in enumerate(beats) if k % 4 == phase], "sections": sections,
                               "lines": lines, "rms": q(rms), "bass": q(bass)}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    cues = []
    for i, l in enumerate(lines):
        nxt = lines[i + 1]["s"] if i + 1 < len(lines) else dur
        cues.append(f"{i + 1}\n{srt_time(l['s'])} --> {srt_time(min(max(l['e'] + 0.3, l['s'] + 1.2), nxt - 0.05))}\n{l['text']}\n")
    (HERE/"manobotar-dak.bn.srt").write_text("\n".join(cues), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}: {n} frames, {len(lines)} lines; sections:")
    for k, v in sections.items():
        print(f"  {v:7.2f}  {k}")


if __name__ == "__main__":
    main()

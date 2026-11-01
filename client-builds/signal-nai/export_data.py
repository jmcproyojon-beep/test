"""Export everything the "Signal নাই" video reacts to, as one JSON file.

    python3.13 -I client-builds/signal-nai/export_data.py

- every lyric line with PER-WORD timings: the artist's words from lyrics.md,
  the clock from the ElevenLabs transcript (align.py)
- the intro "Signal নাই" chant, one entry per sung repeat
- the detected beat grid and which beats are downbeats
- per-frame (30 fps) loudness, bass, onset strength and 8 frequency bands
- near-silent gaps, and the section hits, located from onsets in the master

Lines the transcript could not time are set here from the audio (OVERRIDE),
each with the evidence it was read from.
"""
import json, sys
from pathlib import Path

import numpy as np
import librosa

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
import align  # noqa: E402

A = ROOT/"projects/signal-nai/assets/audio"
OUT = ROOT/"remotion-composer/src/signal/data.json"
FPS = 30

# text-prefix -> (word starts, line end). Times in song seconds.
OVERRIDE = {
    # modem noise: transcript hears it as "ট্রকি জুম" at 12.29-13.54; the
    # rms dips to 0.06 at 11.5 just before it starts
    "ট্র্র্র": ([11.6, 12.25, 12.85], 13.5),
    # chorus tags: only "Signal" (112.96) was transcribed. In the final
    # chorus "অফলাইন যাই" is heard at 233.0-234.3, inside the bass dropout
    # that ends it; chorus 1 has the same dropout 109.9 s earlier (123-124.5)
    "ও-ও-ও... Signal": ([109.4, 112.96, 113.4], 116.8),
    "ও-ও-ও... অফলাইন": ([119.6, 123.06, 123.9], 124.6),
    # the drop: the bass cuts at 138.5 under "Signal! Signal!" and the vocal
    # band peaks at 139.5 before the bass is back at 140.0
    "নাই!": ([139.45], 140.15),
    # final build: transcript "নিচে আয় আজকে Online" runs straight on
    # (187.6-189.6); the bass slams back at 189.5
    "নিচে আয়": ([187.6, 187.92], 188.05),
    "আজকে আর অনলাইন": ([188.1, 188.4, 188.65, 189.35], 191.8),
    # outro: transcript "মেরা মানুষ পাইছি" at 239.48 / 239.73 / 240.0
    "না রে": ([239.48, 239.6, 239.73, 240.0], 243.6),
}
COPY_DT = align.COPY["Final Chorus"][1]


def lines():
    out = []
    for l in align.build():
        for key, (starts, end) in OVERRIDE.items():
            if l["text"].startswith(key):
                break
        else:
            key = None
        ws = l["words"]
        if key is not None:
            starts, end = OVERRIDE[key]
            if l.get("copied"):      # final-chorus copy of an overridden chorus tag
                starts, end = [x + COPY_DT for x in starts], end + COPY_DT
                if "অফলাইন" in l["text"]:
                    end = 234.25          # "হ্যালো?" at 234.32
            assert len(starts) == len(ws), (l["text"], len(ws))
            for i, w in enumerate(ws):
                w["s"] = round(starts[i], 3)
                w["e"] = round(starts[i + 1] - 0.04 if i + 1 < len(ws) else min(end, starts[i] + 0.9), 3)
            l["start"], l["end"] = round(starts[0], 2), round(end, 2)
        out.append({"section": l["section"], "text": l["text"], "dialogue": l["dialogue"],
                    "s": l["start"], "e": l["end"],
                    "words": [{"w": w["w"], "s": w["s"], "e": w["e"]} for w in ws]})
    out.sort(key=lambda l: l["s"])
    # the intro impact line is the first chant after the dialogue
    ch = chant()
    for l in out:
        if l["section"] == "Intro" and l["text"].startswith("Signal"):
            l["s"], l["e"] = ch[0][0], round(ch[0][1] + 0.6, 2)
            l["words"][0].update(s=ch[0][0], e=round(ch[0][0] + 0.3, 3))
            l["words"][1].update(s=round(ch[0][0] + 0.38, 3), e=l["e"])
    for a, b in zip(out, out[1:]):
        if a["e"] > b["s"] - 0.04:
            a["e"] = round(max(a["s"] + 0.3, b["s"] - 0.04), 2)
            for w in a["words"]:
                w["s"] = min(w["s"], a["e"]); w["e"] = min(w["e"], a["e"])
    return out


def chant():
    """Each sung 'Signal নাই' between the dialogue and the bass entry."""
    tw = json.load(open(align.WORDS, encoding="utf-8"))["words"]
    out = []
    for a, b in zip(tw, tw[1:]):
        if a["text"].startswith("Signal") and 16.0 < a["start"] < 31.5:
            out.append([round(a["start"], 3), round(b["end"], 3)])
    return out


def features(n):
    y, sr = librosa.load(A/"song.wav", sr=24000, mono=True)
    hop = sr // FPS
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    fr = librosa.fft_frequencies(sr=sr, n_fft=2048)

    def norm(v, pct=98):
        v = np.asarray(v, dtype=float); hi = np.percentile(v, pct) or 1.0
        return np.clip(v / hi, 0, 1)

    def fit(v):
        v = np.asarray(v)
        return v[:n] if len(v) >= n else np.pad(v, (0, n - len(v)), mode="edge")

    raw = fit(librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0])
    bass = fit(norm(S[(fr >= 30) & (fr < 150)].sum(axis=0)))
    onset = fit(norm(librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop), 99.5))
    edges = np.geomspace(40, 11000, 9)
    bands = np.stack([fit(norm(S[(fr >= a) & (fr < b)].sum(axis=0))) for a, b in zip(edges, edges[1:])], axis=1)
    return fit(norm(raw)), bass, onset, bands, raw


def main():
    info = json.load(open(A/"beats.json"))
    beats = info["beats"]
    song = librosa.get_duration(path=str(A/"song.mp3"))
    n = int(np.ceil(song * FPS))
    rms, bass, onset, bands, raw = features(n)

    bi = [min(n - 1, int(round(b * FPS))) for b in beats]
    phase = int(np.argmax([sum(bass[f] for k, f in enumerate(bi) if k % 4 == p) for p in range(4)]))
    downbeats = [b for k, b in enumerate(beats) if k % 4 == phase]

    quiet = raw < (np.median(raw) * 0.18)
    gaps, st = [], None
    for f, q in enumerate(quiet):
        if q and st is None:
            st = f
        elif not q and st is not None:
            if f - st >= int(0.25 * FPS):
                gaps.append([round(st / FPS, 2), round(f / FPS, 2)])
            st = None

    def strongest(lo, hi, v=onset):
        a, b = int(lo * FPS), min(n, int(hi * FPS))
        return round((a + int(np.argmax(v[a:b]))) / FPS, 3)

    # windows read off the energy profile of the master (bass in/out)
    hits = {
        "bassIn": strongest(33.2, 33.9), "verse1": strongest(55.9, 56.5),
        "chorus1": strongest(93.8, 94.3), "drop": strongest(124.6, 125.4),
        "cut": 138.5, "verse2": strongest(139.85, 140.3),
        "breakdown": 155.45, "bridge": 169.6,
        "slam": strongest(189.2, 189.8), "final": strongest(203.7, 204.2),
        "callStop": 233.0, "back": strongest(236.2, 236.8), "end": 245.0,
    }
    q = lambda v: [int(round(x * 99)) for x in v]
    data = {
        "fps": FPS, "duration": round(song, 3), "frames": n,
        "beats": [round(b, 3) for b in beats], "downbeats": [round(b, 3) for b in downbeats],
        "gaps": gaps, "hits": hits, "chant": chant(),
        "tags": [0.22, 7.49],               # sung "Signal নাই" tags over the modem intro
        "echoes": [195.24, 195.5],          # "আজকে, আজকে" chops in the run-up
        "lines": lines(),
        "rms": q(rms), "bass": q(bass), "onset": q(onset), "bands": [q(r) for r in bands],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB): {n} frames, "
          f"{len(beats)} beats, phase {phase}, {len(data['lines'])} lines, {len(data['chant'])} chants")
    print("gaps", gaps); print("hits", hits)
    for l in data["lines"]:
        print(f"  {l['s']:7.2f} {l['e']:7.2f} [{l['section'][:12]:>12}] {l['text']}  "
              + " ".join(f"{w['s']:.2f}" for w in l["words"]))


if __name__ == "__main__":
    main()

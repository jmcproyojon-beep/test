"""Export everything the Remotion music video reacts to, as one JSON file.

    python3.13 -I client-builds/nikhoj-mv/export_data.py

- every lyric line with PER-WORD timings — the artist's words, the
  transcript's clock (see ../nikhoj-songbad/align.py for why)
- the detected beat grid, and which beats are downbeats
- per-frame (30 fps) loudness, bass, onset strength and 8 frequency bands
- the near-silent gaps the lyric sheet calls for ("Bass cuts. One second
  silence.", "Bass stops.")
- the finger snaps the sheet marks, located from onsets

The visuals read these instead of a nominal tempo: a periodic 129.2 BPM
grid drifts ~3 s against the real beats over this song.
"""
import json, sys
from pathlib import Path

import numpy as np
import librosa

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/"client-builds/nikhoj-songbad"))
import align  # noqa: E402

P = ROOT/"projects/nikhoj-songbad"
OUT = ROOT/"remotion-composer/src/nikhoj/data.json"
FPS = 30


def word_timings():
    """Each display line with the artist's words, timed from the transcript."""
    tw = [w for w in json.load(open(align.WORDS, encoding="utf-8"))["words"]
          if w.get("type") == "word"]
    t_norm = [align.norm(w["text"]) for w in tw]
    lines = align.build()                    # line-level, already cleaned up

    a_words, owner, a_tok = [], [], []
    for li, l in enumerate(lines):
        for tok in l["text"].split():
            n = align.norm(tok)
            if n:
                a_words.append(n); owner.append(li); a_tok.append(tok)
    pairs = align.align(a_words, t_norm)

    by_line = [[] for _ in lines]
    for ai, tok in enumerate(a_tok):
        bj = pairs.get(ai)
        by_line[owner[ai]].append({"w": tok,
                                   "s": tw[bj]["start"] if bj is not None else None,
                                   "e": tw[bj]["end"] if bj is not None else None})

    out = []
    for l, words in zip(lines, by_line):
        s0, e0 = l["start"], l["end"]
        n = len(words)
        # unmatched words: spread them between their matched neighbours
        for i, w in enumerate(words):
            if w["s"] is None:
                prev = next((words[j]["e"] for j in range(i - 1, -1, -1)
                             if words[j]["e"] is not None), s0)
                nxt = next((words[j]["s"] for j in range(i + 1, n)
                            if words[j]["s"] is not None), e0)
                gap = [k for k in range(n) if words[k]["s"] is None]
                w["s"] = prev + (nxt - prev) * 0.15
                w["e"] = max(w["s"] + 0.12, nxt - (nxt - prev) * 0.1)
        # keep words inside the (cleaned) line span and in order
        last = s0
        for w in words:
            w["s"] = round(min(max(w["s"], last), e0), 3)
            w["e"] = round(min(max(w["e"], w["s"] + 0.08), e0), 3)
            last = w["s"]
        out.append({"section": l["section"], "text": l["text"],
                    "s": l["start"], "e": l["end"], "words": words})
    return out


def audio_features(n_frames):
    y, sr = librosa.load(P/"assets/audio/song.wav", sr=24000, mono=True)
    hop = sr // FPS
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)

    def norm(v, pct=98):
        v = np.asarray(v, dtype=float)
        hi = np.percentile(v, pct) or 1.0
        return np.clip(v / hi, 0, 1)

    def fit(v):
        v = np.asarray(v)
        if len(v) >= n_frames:
            return v[:n_frames]
        return np.pad(v, (0, n_frames - len(v)), mode="edge")

    rms = fit(norm(librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]))
    bass = fit(norm(S[(freqs >= 30) & (freqs < 150)].sum(axis=0)))
    onset = fit(norm(librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop), 99.5))
    edges = np.geomspace(40, 11000, 9)
    bands = np.stack([fit(norm(S[(freqs >= a) & (freqs < b)].sum(axis=0)))
                      for a, b in zip(edges, edges[1:])], axis=1)
    raw_rms = fit(librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0])
    return rms, bass, onset, bands, raw_rms


def main():
    beats_info = json.load(open(P/"assets/audio/beats.json"))
    beats = beats_info["beats"]
    song = librosa.get_duration(path=str(P/"assets/audio/song.mp3"))
    n_frames = int(np.ceil(song * FPS))

    rms, bass, onset, bands, raw = audio_features(n_frames)

    # downbeat phase: the beat position in the bar that carries the most bass
    bi = [min(n_frames - 1, int(round(b * FPS))) for b in beats]
    phase = int(np.argmax([sum(bass[f] for k, f in enumerate(bi) if k % 4 == p)
                           for p in range(4)]))
    downbeats = [b for k, b in enumerate(beats) if k % 4 == phase]

    # near-silent stretches (the sheet's "silence" and "bass stops" cues)
    quiet = raw < (np.median(raw) * 0.18)
    gaps, start = [], None
    for f, q in enumerate(quiet):
        if q and start is None:
            start = f
        elif not q and start is not None:
            if f - start >= int(0.25 * FPS):
                gaps.append([round(start / FPS, 2), round(f / FPS, 2)])
            start = None

    # finger snaps: the sharpest onsets inside the windows the sheet marks them
    def strongest(lo, hi):
        a, b = int(lo * FPS), min(n_frames, int(hi * FPS))
        return round((a + int(np.argmax(onset[a:b]))) / FPS, 3)
    # The windows are read off the master, not the sheet. The sheet's "One
    # second silence" before the first chorus is only a dip in this mix (the
    # hit lands at ~97.0 s), and the closing snap comes AFTER the last sung
    # word ends at 349.1 s — searching from 347.5 s picks up the vocal.
    snaps = {"intro": strongest(26.5, 30.5), "build": strongest(276.0, 278.5),
             "outro": strongest(349.15, song - 0.05)}
    hits = {"chorus1": strongest(96.75, 97.3), "drop": strongest(139.0, 140.5),
            "verse2": strongest(156.5, 157.5), "chorus2": strongest(208.9, 209.6),
            "final": strongest(288.0, 289.2)}

    q = lambda v: [int(round(x * 99)) for x in v]
    data = {
        "fps": FPS, "duration": round(song, 3), "frames": n_frames,
        "beats": [round(b, 3) for b in beats],
        "downbeats": [round(b, 3) for b in downbeats],
        "downbeatPhase": phase,
        "gaps": gaps, "snaps": snaps, "hits": hits,
        "lines": word_timings(),
        "rms": q(rms), "bass": q(bass), "onset": q(onset),
        "bands": [q(row) for row in bands],
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")),
                   encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")
    print(f"  {n_frames} frames, {len(beats)} beats, {len(downbeats)} downbeats "
          f"(phase {phase})")
    print(f"  {len(data['lines'])} lines, "
          f"{sum(len(l['words']) for l in data['lines'])} timed words")
    print(f"  silent gaps: {gaps}")
    print(f"  snaps: {snaps}")
    print(f"  hits:  {hits}")


if __name__ == "__main__":
    main()

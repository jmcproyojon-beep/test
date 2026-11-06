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


def main():
    lines = [{"section": l["section"].split(" — ")[0].strip(), "text": l["text"], "s": l["start"], "e": l["end"],
              "words": [{"w": w["w"], "s": w["s"], "e": w["e"]} for w in l["words"]]} for l in align.build()]
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

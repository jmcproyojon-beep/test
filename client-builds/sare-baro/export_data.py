"""Export what the "সাড়ে বারো" video reacts to, and the Bangla CC (SRT).

    python3.13 -I client-builds/sare-baro/export_data.py

- lines + per-word timings from timing.json (see timing.py)
- detected beats, downbeats, per-frame loudness / bass / onset / 8 bands
- section hits measured from the master
- sare-baro.bn.srt: Bangla closed captions for YouTube, one cue per line
"""
import json
from pathlib import Path
import numpy as np
import librosa

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
A = ROOT/"projects/sare-baro/assets/audio"
OUT = ROOT/"remotion-composer/src/sarebaro/data.json"
FPS = 30


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    lines = json.load(open(HERE/"timing.json", encoding="utf-8"))["lines"]
    y, sr = librosa.load(A/"song.wav", sr=24000, mono=True)
    song = len(y) / sr
    n = int(np.ceil(song * FPS))
    hop = sr // FPS
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    fr = librosa.fft_frequencies(sr=sr, n_fft=2048)

    def norm(v, pct=98):
        v = np.asarray(v, float); hi = np.percentile(v, pct) or 1.0
        return np.clip(v / hi, 0, 1)

    def fit(v):
        v = np.asarray(v)
        return v[:n] if len(v) >= n else np.pad(v, (0, n - len(v)), mode="edge")

    rms = fit(norm(librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]))
    bass = fit(norm(S[(fr >= 30) & (fr < 150)].sum(0)))
    onset = fit(norm(librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop), 99.5))
    edges = np.geomspace(40, 11000, 9)
    bands = np.stack([fit(norm(S[(fr >= a) & (fr < b)].sum(0))) for a, b in zip(edges, edges[1:])], axis=1)
    beats = json.load(open(A/"beats.json"))["beats"]
    bi = [min(n - 1, int(round(b * FPS))) for b in beats]
    phase = int(np.argmax([sum(bass[f] for k, f in enumerate(bi) if k % 4 == p) for p in range(4)]))
    downbeats = [b for k, b in enumerate(beats) if k % 4 == phase]

    def strongest(lo, hi):
        a, b = int(lo * FPS), min(n, int(hi * FPS))
        return round((a + int(np.argmax(onset[a:b]))) / FPS, 3)

    hits = {"start": strongest(4.2, 5.0), "hook1": strongest(27.8, 28.5), "verse2": strongest(45.6, 46.6),
            "full2": strongest(56.6, 57.6), "bridge": strongest(68.8, 69.4), "bang": strongest(89.3, 89.9),
            "hook2": strongest(95.2, 95.9), "hook3": strongest(107.2, 107.9), "outro": 118.8, "end": 124.2}
    q = lambda v: [int(round(x * 99)) for x in v]
    data = {"fps": FPS, "duration": round(song, 3), "frames": n, "beats": [round(b, 3) for b in beats],
            "downbeats": [round(b, 3) for b in downbeats], "hits": hits, "lines": lines,
            "rms": q(rms), "bass": q(bass), "onset": q(onset), "bands": [q(r) for r in bands]}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    cues = []
    for i, l in enumerate(lines):
        nxt = lines[i + 1]["s"] if i + 1 < len(lines) else song
        end = min(max(l["e"] + 0.3, l["s"] + 1.2), nxt - 0.05)
        cues.append(f"{i + 1}\n{srt_time(l['s'])} --> {srt_time(end)}\n{l['text']}\n")
    (HERE/"sare-baro.bn.srt").write_text("\n".join(cues), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}: {n} frames, {len(beats)} beats (phase {phase}), {len(lines)} lines")
    print("hits", hits)


if __name__ == "__main__":
    main()

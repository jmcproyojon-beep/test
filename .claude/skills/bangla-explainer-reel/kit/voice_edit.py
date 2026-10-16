"""Cut the spoken line numbers / section labels out of the ElevenLabs take and
re-time it as one tight voiceover. Writes voice/vo_clean.wav + voice/lines.json."""
import json, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).parent
SRC = sys.argv[1]
SR = 48000
segs = json.loads((ROOT / "voice/segs.json").read_text())

# script line -> speech segments to keep (everything else is a read-out number or label)
LINE_SEGS = [[1, 2], [4], [6], [8], [10], [12], [14], [16], [19, 20], [22], [24], [27, 28],
             [30], [32], [34, 35], [37], [40], [43, 44], [46], [48, 49], [51], [53], [56], [58]]
CTA_SEGS = [(0.0, 1.82), (2.28, 4.22)]  # "কমেন্টে AI লিখুন।" | "ফ্রি AI টুলের লিস্ট পাঠিয়ে দেবো।"
INTRA_GAP, LINE_GAP, SECTION_GAP = 0.14, 0.16, 0.30
SECTION_BEFORE = {7, 8, 11, 16, 17, 22}  # pause a bit longer before these line indexes
PAD, FADE = 0.04, 0.012

raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)

out, t, lines = [], 0.0, []
for li, ids in enumerate(LINE_SEGS):
    if li:
        gap = SECTION_GAP if li in SECTION_BEFORE else LINE_GAP
        out.append(np.zeros(int(gap * SR), np.float32)); t += gap
    start, splits = t, []
    for k, sid in enumerate(ids):
        if k:
            out.append(np.zeros(int(INTRA_GAP * SR), np.float32)); t += INTRA_GAP
            splits.append(round(t, 3))
        a, b = segs[sid]
        piece = x[int(max(0, a - PAD) * SR): int((b + PAD) * SR)].copy()
        f = int(FADE * SR)
        piece[:f] *= np.linspace(0, 1, f); piece[-f:] *= np.linspace(1, 0, f)
        out.append(piece); t += len(piece) / SR
    lines.append({"start": round(start, 3), "end": round(t, 3), "splits": splits})

# optional CTA take (generated separately): two lines split at its longest pause
if len(sys.argv) > 2:
    raw2 = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", sys.argv[2], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                          capture_output=True, check=True).stdout
    y = np.frombuffer(raw2, dtype=np.float32)
    for a, b in CTA_SEGS:
        out.append(np.zeros(int(LINE_GAP * SR), np.float32)); t += LINE_GAP
        piece = y[int(max(0, a - PAD) * SR): int((b + PAD) * SR)].copy()
        f = int(FADE * SR); piece[:f] *= np.linspace(0, 1, f); piece[-f:] *= np.linspace(1, 0, f)
        lines.append({"start": round(t, 3), "end": round(t + len(piece) / SR, 3), "splits": []})
        out.append(piece); t += len(piece) / SR

vo = np.concatenate(out)
tmp = ROOT / "voice/vo_cut.f32"; tmp.write_bytes(vo.astype(np.float32).tobytes())
# light polish + loudness to -14 LUFS
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", str(tmp),
                "-af", "highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=7",
                "-ar", str(SR), str(ROOT / "voice/vo_clean.wav")], check=True)
tmp.unlink()
(ROOT / "voice/lines.json").write_text(json.dumps(lines, indent=1))
print(f"voice {t:.2f}s, {len(lines)} lines")

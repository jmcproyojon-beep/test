"""Word-timed transcript of the client's own voice recording.

    python3.13 -I client-builds/lighting-masterclass/transcribe_user.py

faster-whisper large-v3 skips stretches of a long, pause-less read, so the
take is transcribed in 14 s windows (2 s overlap) and the words are merged on
the absolute timeline. Also lists every pause >= 0.18 s (candidate line breaks).
"""
import json
from pathlib import Path
import numpy as np
import librosa
from faster_whisper import WhisperModel
A = Path(__file__).resolve().parents[2] / "projects/lighting-masterclass/audio/user"
y, sr = librosa.load(str(A / "voice.wav"), sr=16000, mono=True)
# pauses from a short-hop energy envelope
hop = 160
rms = librosa.feature.rms(y=y, frame_length=640, hop_length=hop)[0]
db = 20 * np.log10(rms + 1e-9); thr = np.percentile(db, 95) - 32
quiet = db < thr
pauses, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]: j += 1
        a, b = i * hop / sr, j * hop / sr
        if b - a >= 0.18: pauses.append([round(a, 3), round(b, 3)])
        i = j
    else: i += 1
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
words, W, OV = [], 14.0, 2.0
t0 = 0.0
while t0 < len(y) / sr:
    seg = y[int(t0 * sr): int((t0 + W) * sr)]
    out, _ = m.transcribe(seg, language="bn", word_timestamps=True, beam_size=5, condition_on_previous_text=False, vad_filter=False)
    for s in out:
        for w in s.words or []:
            a, b = t0 + w.start, t0 + w.end
            # keep a word only in the window's core (drop the overlap edges handled by neighbours)
            lo = t0 + (OV / 2 if t0 > 0 else 0); hi = t0 + W - OV / 2
            mid = (a + b) / 2
            if lo <= mid < hi and w.word.strip():
                words.append({"w": w.word.strip(), "s": round(a, 3), "e": round(b, 3)})
    t0 += W - OV
words.sort(key=lambda x: x["s"])
json.dump({"words": words, "pauses": pauses, "dur": len(y) / sr}, open(A / "words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(len(words), "words,", len(pauses), "pauses")
print(" ".join(w["w"] for w in words))

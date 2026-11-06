"""Word-timed transcript of the vocal, as the clock for the lyric sheet.

    python3.13 -I client-builds/manobotar-dak/transcribe.py   # -> assets/audio/words.json

faster-whisper large-v3 (int8, CPU), Bengali, word timestamps, on the
separated vocal (vocal_est.wav). Only the TIMES are used: every word shown
on screen comes from the artist's lyric sheet (see align.py).
"""
import json, sys, time
from pathlib import Path
from faster_whisper import WhisperModel
import librosa

A = Path(__file__).resolve().parents[2]/"projects/manobotar-dak/assets/audio"
src = A/(sys.argv[1] if len(sys.argv) > 1 else "vocal_est.wav")
t0 = time.time()
model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
audio, _ = librosa.load(str(src), sr=16000, mono=True)   # the bundled PyAV decoder is incompatible here
segs, info = model.transcribe(audio, language="bn", word_timestamps=True, beam_size=5, vad_filter=False,
                              condition_on_previous_text=False, initial_prompt="শেষ আলো জ্বলবেই। একটা পৃথিবী, কতগুলো সীমানা।")
words = []
for s in segs:
    for w in s.words or []:
        words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "type": "word", "p": round(w.probability, 3)})
    print(f"{s.start:7.2f}-{s.end:7.2f} {s.text}", flush=True)
json.dump({"words": words}, open(A/"words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"{len(words)} words in {time.time() - t0:.0f}s")

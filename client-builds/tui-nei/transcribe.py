"""Whisper word times for the sung vocal (faster-whisper large-v3-turbo, CPU int8).
    python3 transcribe.py audio/mono16k.wav -> audio/whisper_words.json
Fixed 20 s windows with 4 s overlap (words kept from each window's middle), prompted with the song's hook so
the sung Bangla is recognised; the words are only anchors for align_lyrics.py.
"""
import json, sys
import soundfile as sf
from faster_whisper import WhisperModel
y, sr = sf.read(sys.argv[1]); y = y.astype("float32")
m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
W, win, hop = [], 20.0, 16.0
t = 0.0
while t < len(y) / sr:
    seg = y[int(t * sr): int((t + win) * sr)]
    segs, _ = m.transcribe(seg, language="bn", word_timestamps=True, vad_filter=False, beam_size=5,
                           condition_on_previous_text=False, initial_prompt="তুই নেই নেই, বলে বলে ধেই ধেই")
    lo, hi = (0 if t == 0 else 2.0), (win if t + win >= len(y) / sr else win - 2.0)
    txt = []
    for s in segs:
        for w in s.words:
            if lo <= w.start < hi:
                W.append({"w": w.word.strip(), "s": round(t + w.start, 2), "e": round(t + w.end, 2)}); txt.append(w.word.strip())
    print(f"{t:6.1f} {' '.join(txt)}", flush=True)
    t += hop
json.dump(W, open("audio/whisper_words.json", "w"), ensure_ascii=False); print("words", len(W))

"""Male Bangla voiceover with Gemini TTS (free tier) for the BhangariWala explainer.

    GEMINI_API_KEY=proxy-injected python3.13 -I client-builds/bhangariwala/vo_gemini.py [voice]

Gemini's native speech generation (generateContent, responseModalities=AUDIO)
speaks each part's Bangla line, English terms left as the client wrote them,
in a male prebuilt voice (default Charon: "informative"). Takes are cached in
projects/bhangariwala/audio/gemini/ so re-runs don't spend free-tier quota.

Gemini returns no word timings, so each take is transcribed with
faster-whisper large-v3 (word timestamps) and the client's on-screen words
are laid over that timeline. Writes vo.wav + src/bhangariwala/vo.json in the
same format as vo.py, so build_audio.py and the Remotion film pick it up.
"""
import base64, json, os, subprocess, sys, urllib.request
from pathlib import Path
import numpy as np
import soundfile as sf
import librosa

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "projects/bhangariwala/audio"
CACHE = OUT / "gemini"
DATA = ROOT / "remotion-composer/src/bhangariwala/vo.json"
VOICE = sys.argv[1] if len(sys.argv) > 1 else "Charon"
MODELS = ["gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"]
URL = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent"
SR, TOTAL = 48000, 30.0
STYLE = ("Read the following in Bangla with a natural Bangladeshi accent, as a warm, confident male documentary narrator: "
         "clear, calm and trustworthy, a natural unhurried pace, English words pronounced the way an educated Dhaka speaker says them. "
         "Say only the text after the colon:\n")

# part, voice start (s), latest end before the next beat (s), text (client's wording)
PARTS = [
    (1, 0.35, 8.3, "বাংলাদেশে ২০২২ সালেই তৈরি হয়েছে প্রায় ৩৬৭ মিলিয়ন কেজি e-waste। কিন্তু এগুলোর শেষ গন্তব্য কোথায়?"),
    (2, 10.3, 18.2, "সঠিক collection না হলে e-waste মিশে যেতে পারে সাধারণ বর্জ্যে, আর unsafe handling বাড়ায় পরিবেশ, স্বাস্থ্য ও data risk।"),
    (3, 20.55, 28.3, "BhangariWala e-waste-কে আলাদা collection, secure handling এবং responsible processing-এর পথে নিয়ে যেতে কাজ করছে।"),
]
MAX_TEMPO = 1.12


def tts(text, path):
    if path.exists():
        return
    body = {"contents": [{"parts": [{"text": STYLE + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}}
    last = None
    for m in MODELS:
        req = urllib.request.Request(URL.format(m), data=json.dumps(body).encode(), method="POST",
                                     headers={"Content-Type": "application/json", "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "proxy-injected")})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
        except urllib.error.HTTPError as e:
            last = f"{m}: {e.code} {e.read()[:300]!r}"
            print("  ", last)
            continue
        parts = d["candidates"][0]["content"]["parts"]
        inl = next(p["inlineData"] for p in parts if "inlineData" in p)
        rate = int(inl["mimeType"].split("rate=")[1].split(";")[0]) if "rate=" in inl["mimeType"] else 24000
        pcm = np.frombuffer(base64.b64decode(inl["data"]), dtype="<i2").astype(np.float32) / 32768
        path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(path, pcm, rate)
        print(f"   {m} / {VOICE}: {len(pcm) / rate:.2f}s")
        return
    raise SystemExit(f"Gemini TTS failed: {last}")


def trim(y, sr, thr_db=-40):
    iv = librosa.effects.split(y, top_db=-thr_db, frame_length=1024, hop_length=256)
    a, b = iv[0][0], iv[-1][1]
    return y[max(0, a - int(0.03 * sr)): b + int(0.08 * sr)]


def words_of(y, model):
    a16 = librosa.resample(y, orig_sr=SR, target_sr=16000)
    segs, _ = model.transcribe(a16, language="bn", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    return [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in (s.words or []) if w.word.strip()]


def letters(s):
    return max(1, sum(ch.isalnum() or "ঀ" <= ch <= "৿" for ch in s))


def lay_out(display, heard):
    """Give each on-screen token a time on the heard timeline: 1:1 when counts
    match, else by share of letters along the spoken words."""
    toks = display.split()
    if len(toks) == len(heard):
        return [(t, h["s"], h["e"]) for t, h in zip(toks, heard)]
    cum = np.cumsum([0] + [letters(h["w"]) for h in heard]) / sum(letters(h["w"]) for h in heard)
    def T(f):
        k = min(len(heard) - 1, max(0, np.searchsorted(cum, f, side="right") - 1))
        u = (f - cum[k]) / max(1e-9, cum[k + 1] - cum[k])
        return heard[k]["s"] + u * (heard[k]["e"] - heard[k]["s"])
    tc = np.cumsum([0] + [letters(t) for t in toks]) / sum(letters(t) for t in toks)
    return [(t, T(tc[i]), T(tc[i + 1]) - 0.02) for i, t in enumerate(toks)]


def main():
    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
    track = np.zeros(int(TOTAL * SR), np.float32)
    allw, parts = [], []
    for pid, at, latest, text in PARTS:
        raw = CACHE / f"part{pid}_{VOICE.lower()}.wav"
        tts(text, raw)
        y, sr = librosa.load(raw, sr=SR, mono=True)
        y = trim(y, SR)
        room = latest - at
        tempo = len(y) / SR / room
        if tempo > 1.0:
            if tempo > MAX_TEMPO:
                print(f"   part {pid}: take is {len(y) / SR:.2f}s for {room:.2f}s; speeding up {MAX_TEMPO}x and letting it run a little long")
                tempo = MAX_TEMPO
            y = librosa.effects.time_stretch(y, rate=tempo)
        y = y / (np.abs(y).max() + 1e-9) * 0.89
        i = int(at * SR)
        track[i:i + len(y)] += y[: len(track) - i]
        heard = words_of(y, model)
        print(f"part {pid}: {len(y) / SR:.2f}s from {at:.2f}s (tempo {max(1.0, tempo):.3f}); heard: {' '.join(h['w'] for h in heard)}")
        for tok, s, e in lay_out(text, heard):
            allw.append({"w": tok, "s": round(at + s, 3), "e": round(at + e, 3), "part": pid})
        parts.append({"id": pid, "start": (pid - 1) * 10.0, "end": pid * 10.0, "vo": [at, round(at + len(y) / SR, 3)]})
    sf.write(OUT / "vo.wav", track, SR)
    DATA.write_text(json.dumps({"total": TOTAL, "voice": f"gemini/{VOICE}", "parts": parts, "words": allw}, ensure_ascii=False, indent=1))
    print("wrote", OUT / "vo.wav", "and", DATA)


if __name__ == "__main__":
    main()

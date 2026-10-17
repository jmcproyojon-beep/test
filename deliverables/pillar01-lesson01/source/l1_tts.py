"""Chunked Gemini TTS for Lesson 01 with transcribe-and-compare verification."""
import base64, difflib, json, os, re, subprocess, sys, time, urllib.error, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l1_script import SCENES

KEY = os.environ["GEMINI_API_KEY"]
P = "/home/user/test/projects/pillar01-lesson01"
OUT = f"{P}/assets/audio/chunks"; os.makedirs(OUT, exist_ok=True)
MAN = f"{P}/artifacts/tts_manifest.json"
TTS_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts", "gemini-3.8-flash-lite-tts"]
EXHAUSTED = set()
VOICE = "Orus"
STT_MODELS = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"]
MAXCH = 1300
class Quota(Exception): pass


def post(model, body):
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                 data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    for a in range(7):
        try:
            return json.load(urllib.request.urlopen(req, timeout=240))
        except urllib.error.HTTPError as e:
            body_txt = e.read().decode()
            if e.code == 429 and ("per day" in body_txt.lower() or "limit: 10" in body_txt or "limit: 0" in body_txt or "free_tier_requests" in body_txt):
                raise Quota(model)
            if e.code in (429, 500, 503) and a < 6:
                time.sleep(20 * (a + 1)); continue
            raise SystemExit(f"HTTP {e.code} {model}: {body_txt[:300]}")


def tts(text, wav):
    for m in TTS_MODELS:
        if m in EXHAUSTED: continue
        try:
            return _tts(m, text, wav)
        except Quota:
            print("quota exhausted:", m, flush=True); EXHAUSTED.add(m)
    raise SystemExit("all TTS models exhausted")


def _tts(model, text, wav):
    d = post(model, {"contents": [{"parts": [{"text": text}]}],
                         "generationConfig": {"responseModalities": ["AUDIO"],
                                              "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}})
    part = d["candidates"][0]["content"]["parts"][0]["inlineData"]
    rate = int(part.get("mimeType", "rate=24000").split("rate=")[-1].split(";")[0]) if "rate=" in part.get("mimeType", "") else 24000
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", "-",
                    "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                    "-ar", "48000", wav], input=base64.b64decode(part["data"]), check=True)
    return model


def stt(wav):
    mp3 = wav[:-4] + ".stt.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-ac", "1", "-ar", "16000", "-b:a", "48k", mp3], check=True)
    for m in STT_MODELS:
        if m in EXHAUSTED: continue
        try:
            return _stt(m, mp3)
        except Quota:
            print("quota exhausted:", m, flush=True); EXHAUSTED.add(m)
    raise SystemExit("all STT models exhausted")


def _stt(model, mp3):
    d = post(model, {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/mpeg", "data": base64.b64encode(open(mp3, "rb").read()).decode()}},
                                                 {"text": "Transcribe this Bengali speech verbatim in Bengali script; keep English words in Latin script. Output only the transcript text."}]}],
                         "generationConfig": {"temperature": 0}})
    return d["candidates"][0]["content"]["parts"][0]["text"].strip()


def norm(t):
    t = t.lower()
    for a, b in [("কোয়ান্টাম", "quantum"), ("এআই", "ai"), ("চ্যাটজিপিটি", "chatgpt"), ("গুগল", "google"), ("ডেটা", "data"), ("প্যাটার্ন", "pattern"), ("ভয়েস", "voice"), ("টাইপিং", "typing"), ("স্প্যাম", "spam"), ("মডেল", "model"), ("ট্রেনিং", "training"), ("প্রম্পট", "prompt"), ("টোকেন", "token"), ("ইনপুট", "input"), ("প্রেডিকশন", "prediction"), ("সফটওয়্যার", "software"), ("ফলো-আপ", "followup"), ("অ্যাপ", "app"), ("কনটেন্ট", "content")]:
        t = t.replace(a, b)
    return re.sub(r"[\s\W_]+", "", t)


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


man = json.load(open(MAN)) if os.path.exists(MAN) else {}
for s in SCENES:
    chunks, cur = [], []
    for l in s["lines"]:
        if cur and sum(len(x) for x in cur) + len(l) > MAXCH:
            chunks.append(cur); cur = []
        cur.append(l)
    chunks.append(cur)
    for ci, lines in enumerate(chunks):
        key = f"{s['id']}_c{ci}"
        text = " ".join(lines)
        if key in man and man[key]["ok"] and man[key]["text"] == text:
            continue
        best = None
        for attempt in range(2):
            wav = f"{OUT}/{key}.wav"
            if attempt == 0 and os.path.exists(wav) and os.path.getsize(wav) > 100000 and key not in man:
                model = "gemini-3.1-flash-tts-preview (reused)"
            else:
                model = tts(text, wav); time.sleep(3)
            d = dur(wav); cps = len(re.sub(r"\s", "", text)) / d
            tr = stt(wav); time.sleep(3)
            ratio = difflib.SequenceMatcher(None, norm(text), norm(tr), autojunk=False).ratio()
            ok = ratio >= 0.78 and 8.5 <= cps <= 19
            rec = dict(model=model, scene=s["id"], lines=lines, text=text, wav=wav, dur=round(d, 2), cps=round(cps, 1), ratio=round(ratio, 3), transcript=tr, ok=ok, attempt=attempt)
            print(key, f"dur={d:.1f}s cps={cps:.1f} ratio={ratio:.3f} ok={ok}", flush=True)
            if best is None or ratio > best["ratio"]:
                best = rec
                os.replace(wav, wav + ".best.wav")
            if ok:
                break
        os.replace(best["wav"] + ".best.wav", best["wav"])
        man[key] = best
        json.dump(man, open(MAN, "w"), ensure_ascii=False, indent=1)
print("done", sum(v["ok"] for v in man.values()), "/", len(man), "ok; total", round(sum(v["dur"] for v in man.values()), 1), "s")

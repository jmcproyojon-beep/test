"""Per-line Bangla voices for মিষ্টির প্যাকেট (Gemini TTS), each transcribed and checked."""
import base64, difflib, json, os, re, subprocess, sys, time, urllib.error, urllib.request

P = "/home/user/test/projects/mishtir-packet"
OUT = f"{P}/assets/audio/lines"
KEYS = [k for k in os.environ["GEMINI_KEYS"].split(",") if k]
MODELS = ["gemini-3.8-flash-tts", "gemini-2.5-flash-preview-tts"]
STT = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.5-flash"]
VOICE = {"dadu": "Algenib", "chhana": "Puck", "mojid": "Achird"}
LINES = [
 ("l01", "dadu", "মিষ্টি কেউ এমনি আনে না।"),
 ("l02", "chhana", "দাদু, উনি তো খুশির খবর শুনে এসেছেন!"),
 ("l03", "mojid", "মাশাআল্লাহ! কত বড় চাকরি!"),
 ("l04", "mojid", "তা, বেতন কত পায়?"),
 ("l05", "dadu", "প্রশ্নগুলো খেয়াল করো। একটাও শুভেচ্ছা না। সবগুলো হিসাব।"),
 ("l06", "chhana", "উনি কোথায় যাচ্ছেন?"),
 ("l07", "dadu", "পরের বাসায়। খবর বেচতে।"),
 ("l08", "mojid", "বেতন যতই হোক, ওদের ঘরের অবস্থা কিন্তু ভালো না।"),
 ("l09", "dadu", "যে মিষ্টি দিয়ে তোমার দরজা খোলে, সে খবর নিয়ে বের হয়।"),
 ("l10", "dadu", "সবাই তাকায়। কেউ দেখে না।"),
 ("l11", "dadu", "কম বলো। বেশি দেখো।"),
]
DEAD = set()


class Quota(Exception):
    pass


def post(key, model, body):
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                 data=json.dumps(body).encode(), headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    for a in range(6):
        try:
            return json.load(urllib.request.urlopen(req, timeout=180))
        except urllib.error.HTTPError as e:
            t = e.read().decode()
            if e.code == 429 and ("per day" in t.lower() or "free_tier" in t or "limit: 0" in t or "limit: 10" in t):
                raise Quota()
            if e.code in (429, 500, 503) and a < 5:
                time.sleep(15 * (a + 1)); continue
            raise SystemExit(f"HTTP {e.code} {model}: {t[:200]}")


def call(models, body):
    for m in models:
        for k in KEYS:
            if (k, m) in DEAD:
                continue
            try:
                return m, post(k, m, body)
            except Quota:
                DEAD.add((k, m)); print("quota:", m, k[:6], flush=True)
    raise SystemExit("all keys/models exhausted")


def norm(t):
    return re.sub(r"[\s\W_]+", "", t.lower().replace("মাশাল্লাহ", "মাশাআল্লাহ"))


man = json.load(open(f"{P}/artifacts/voices.json")) if os.path.exists(f"{P}/artifacts/voices.json") else {}
for lid, who, text in LINES:
    if lid in man and man[lid]["ok"]:
        continue
    best = None
    for attempt in range(2):
        model, d = call(MODELS, {"contents": [{"parts": [{"text": text}]}], "generationConfig": {"responseModalities": ["AUDIO"],
                        "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE[who]}}}}})
        part = d["candidates"][0]["content"]["parts"][0]["inlineData"]
        wav = f"{OUT}/{lid}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "-",
                        "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        "-ar", "48000", wav], input=base64.b64decode(part["data"]), check=True)
        mp3 = wav[:-4] + ".mp3"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-ac", "1", "-ar", "16000", "-b:a", "48k", mp3], check=True)
        sm, sd = call(STT, {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/mpeg", "data": base64.b64encode(open(mp3, "rb").read()).decode()}},
                                                    {"text": "Transcribe this Bengali speech verbatim in Bengali script. Output only the transcript."}]}], "generationConfig": {"temperature": 0}})
        tr = sd["candidates"][0]["content"]["parts"][0]["text"].strip()
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout)
        ratio = difflib.SequenceMatcher(None, norm(text), norm(tr), autojunk=False).ratio()
        rec = dict(who=who, voice=VOICE[who], model=model, text=text, transcript=tr, dur=round(dur, 2), ratio=round(ratio, 3), ok=ratio >= 0.8, wav=wav)
        print(lid, who, f"{dur:.2f}s", ratio, tr, flush=True)
        if best is None or ratio > best["ratio"]:
            best = rec; os.replace(wav, wav + ".best")
        if rec["ok"]:
            break
    os.replace(best["wav"] + ".best", best["wav"])
    man[lid] = best
    json.dump(man, open(f"{P}/artifacts/voices.json", "w"), ensure_ascii=False, indent=1)
print("done", sum(v["ok"] for v in man.values()), "/", len(man))

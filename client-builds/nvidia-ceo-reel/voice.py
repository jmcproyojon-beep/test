"""Bangla voiceover + word timings for the Nvidia CEO reel.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py      (run inside the reel folder)

Each script line is spoken by Microsoft neural TTS bn-BD-PradeepNeural (male),
with WordBoundary events for the word times. The lines are joined with short
pauses into audio/vo.wav. Writes audio/words_new.json, audio/words_ref.json,
web/words.js (captions; English brand names shown in Latin script) and an
identity web/warp.js. The engine's align.py is English only, so it is skipped.
"""
import asyncio, json, os, re
from pathlib import Path
import numpy as np
import soundfile as sf
import librosa
import edge_tts

HERE = Path(__file__).parent
A = HERE / "audio"; (A / "lines").mkdir(parents=True, exist_ok=True)
SR = 44100
VOICE, RATE = "bn-BD-PradeepNeural", "+6%"
LINES = json.loads((HERE / "script.json").read_text())

# spoken spelling -> on-screen caption spelling
SHOW = {"এনভিডিয়া": "Nvidia", "এনভিডিয়ার": "Nvidia-র", "এনভিডিয়াতে": "Nvidia-তে", "অ্যাপল": "Apple", "অ্যাপলের": "Apple-এর",
        "সিইও": "CEO", "সিইওর": "CEO-র", "সিএফও": "CFO", "ট্রুথ": "Truth", "সোশ্যালে": "Social-এ", "সেমাফোরের": "Semafor-এর",
        "সিসকো": "Cisco", "মাইক্রোসফটের": "Microsoft-এর", "মেগাস্পিডের": "Megaspeed-এর", "এআই": "AI"}
# pause after each line (s); longer at section turns
BIG = {1, 7, 11, 14, 21, 24, 28, 31, 34, 37, 42, 44, 45, 46, 47, 49, 50}


def spoken(s):
    for k, v in sorted(SHOW.items(), key=lambda kv: -len(kv[1])):
        s = s.replace(v, k)
    return s


async def tts(i, text):
    mp3, js = A / "lines" / f"l{i:02d}.mp3", A / "lines" / f"l{i:02d}.json"
    if mp3.exists() and js.exists():
        return
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
    audio, words = bytearray(), []
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"w": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
    mp3.write_bytes(bytes(audio)); js.write_text(json.dumps(words, ensure_ascii=False))


async def main():
    for i, l in enumerate(LINES):
        await tts(i, spoken(l))
    track, words, t = [], [], 0.0
    for i, l in enumerate(LINES):
        y, _ = librosa.load(A / "lines" / f"l{i:02d}.mp3", sr=SR, mono=True)
        iv = librosa.effects.split(y, top_db=42)
        a, b = max(0, iv[0][0] - int(.03 * SR)), min(len(y), iv[-1][1] + int(.06 * SR))
        y = y[a:b]; off = a / SR
        disp = re.findall(r"\S+", l.replace("—", " "))
        ws = json.loads((A / "lines" / f"l{i:02d}.json").read_text())
        for k, w in enumerate(ws):
            # caption word: the script's own spelling where the counts line up
            shown = disp[k] if len(disp) == len(ws) else SHOW.get(w["w"], w["w"])
            words.append({"w": shown, "s": round(t + w["s"] - off, 3), "e": round(t + w["e"] - off, 3), "line": i})
        track.append(y); t += len(y) / SR
        gap = .55 if i in BIG else .22
        track.append(np.zeros(int(gap * SR), np.float32)); t += gap
    vo = np.concatenate(track[:-1])
    vo = vo / (np.abs(vo).max() + 1e-9) * .9
    sf.write(A / "vo.wav", vo, SR)
    for n in ("words_new.json", "words_ref.json"):
        (A / n).write_text(json.dumps(words, ensure_ascii=False))
    (HERE / "web/words.js").write_text("const WORDS=" + json.dumps(words, ensure_ascii=False) + ";\n")
    (HERE / "web/warp.js").write_text("window.WARP=null;\n")
    starts = []
    for i in range(len(LINES)):
        lw = [w for w in words if w["line"] == i]
        starts.append((i, lw[0]["s"], lw[-1]["e"]))
    (A / "lines.json").write_text(json.dumps(starts))
    for i, s, e in starts:
        print(f"{i:2d} {s:7.2f}-{e:7.2f}  {LINES[i][:50]}")
    print(f"total {len(vo) / SR:.1f}s, {len(words)} words")


asyncio.run(main())

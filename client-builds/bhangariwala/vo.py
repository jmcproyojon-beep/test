"""Voice the three BhangariWala e-waste explainers (3 x 10 s = one 30 s film).

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I client-builds/bhangariwala/vo.py

Microsoft neural TTS (edge-tts, bn-BD-NabanitaNeural) speaks the client's
three Bangla lines. English words in the brief (e-waste, collection, unsafe
handling ...) are spelled in Bangla script for the voice so they are said
the way a Bangladeshi presenter would say them; the on-screen captions show
the client's original wording. Each part is placed inside its own 10 s
window, and word boundaries from the service drive the captions and cues.
"""
import asyncio, json, os, subprocess
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "projects/bhangariwala/audio"
DATA = ROOT / "remotion-composer/src/bhangariwala/vo.json"
VOICE = "bn-BD-NabanitaNeural"

# part, window start, voice start, rate, spoken text, display text (same token count)
PARTS = [
    (1, 0.0, 0.35, "+4%",
     "বাংলাদেশে ২০২২ সালেই তৈরি হয়েছে প্রায় ৩৬৭ মিলিয়ন কেজি ই-ওয়েস্ট। কিন্তু এগুলোর শেষ গন্তব্য কোথায়?",
     "বাংলাদেশে ২০২২ সালেই তৈরি হয়েছে প্রায় ৩৬৭ মিলিয়ন কেজি e-waste। কিন্তু এগুলোর শেষ গন্তব্য কোথায়?"),
    (2, 10.0, 10.3, "+4%",
     "সঠিক কালেকশন না হলে ই-ওয়েস্ট মিশে যেতে পারে সাধারণ বর্জ্যে, আর আনসেফ হ্যান্ডলিং বাড়ায় পরিবেশ, স্বাস্থ্য ও ডেটা রিস্ক।",
     "সঠিক collection না হলে e-waste মিশে যেতে পারে সাধারণ বর্জ্যে, আর unsafe handling বাড়ায় পরিবেশ, স্বাস্থ্য ও data risk।"),
    (3, 20.0, 20.55, "+2%",
     "ভাঙারিওয়ালা ই-ওয়েস্টকে আলাদা কালেকশন, সিকিউর হ্যান্ডলিং এবং রেসপন্সিবল প্রসেসিং-এর পথে নিয়ে যেতে কাজ করছে।",
     "BhangariWala e-waste-কে আলাদা collection, secure handling এবং responsible processing-এর পথে নিয়ে যেতে কাজ করছে।"),
]
TOTAL = 30.0
SR = 48000


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout)


async def speak(text, rate, mp3):
    c = edge_tts.Communicate(text, VOICE, rate=rate, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
    words = []
    with open(mp3, "wb") as fh:
        async for ch in c.stream():
            if ch["type"] == "audio":
                fh.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"w": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
    return words


def to_display(words, display):
    """Give each spoken word its on-screen spelling. Same token count -> 1:1;
    otherwise spread the display tokens over the spoken span by position."""
    toks = display.split()
    if len(toks) == len(words):
        return [dict(w, w=d) for w, d in zip(words, toks)]
    a, b = words[0]["s"], words[-1]["e"]
    n = len(toks)
    return [{"w": d, "s": a + (b - a) * i / n, "e": a + (b - a) * (i + 1) / n} for i, d in enumerate(toks)]


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    allw, parts, inputs, delays = [], [], [], []
    for pid, w0, at, rate, spoken, display in PARTS:
        mp3 = OUT / f"vo{pid}.mp3"
        words = await speak(spoken, rate, mp3)
        assert at + words[-1]["e"] < w0 + 9.7, f"part {pid} runs past its window"
        for w in to_display(words, display):
            allw.append({"w": w["w"], "s": round(at + w["s"], 3), "e": round(at + w["e"], 3), "part": pid})
        parts.append({"id": pid, "start": w0, "end": w0 + 10, "vo": [at, round(at + words[-1]["e"], 3)]})
        inputs += ["-i", str(mp3)]
        delays.append(int(at * 1000))
        print(f"part {pid}: {len(words)} words, voice {at:.2f}-{at + words[-1]['e']:.2f}s")
    fc = ";".join(f"[{i}:a]aresample={SR},adelay={d}|{d}[a{i}]" for i, d in enumerate(delays))
    fc += ";" + "".join(f"[a{i}]" for i in range(len(delays))) + f"amix=inputs={len(delays)}:normalize=0,apad,atrim=0:{TOTAL}[o]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc, "-map", "[o]", "-ac", "1", "-ar", str(SR),
                    str(OUT / "vo.wav")], check=True)
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps({"total": TOTAL, "parts": parts, "words": allw}, ensure_ascii=False, indent=1))
    print("wrote", OUT / "vo.wav", "and", DATA)


asyncio.run(main())

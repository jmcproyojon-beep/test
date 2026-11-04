"""Voice the "১০০ সেকেন্ডে শিখি — আর্লিং হালান্ড" script, section by section.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I client-builds/haaland-100s/vo.py

Microsoft neural TTS (edge-tts, voice bn-BD-PradeepNeural) speaks each
section of the creator's script; each section is fitted to its window in
the script (00-08 s, 08-20 s, ...) by adjusting the speaking rate, then laid
on one 120 s timeline. Word boundaries come back from the service and become
the burned-in Bangla captions.

The text is the creator's, emoji removed; a few numerals are spelled out so
the voice reads them as intended (৪–১ → চার-এক, রাত ৩টা → রাত তিনটা ...).
"""
import asyncio, json, os, subprocess
from pathlib import Path
import edge_tts

HERE = Path(__file__).parent
OUT = Path(__file__).resolve().parents[2]/"projects/haaland-100s/audio"
VOICE = "bn-BD-PradeepNeural"

# id, start, end, pitch, text
SECTIONS = [
    ("intro", 0, 8, "+0Hz", "আসসালামু আলাইকুম, আমি রুবেল মিয়া! চলো শুরু করি, ১০০ সেকেন্ডে শিখি! আজকের মানুষটাকে নিয়ে এই বছর সারা দুনিয়া গুগলে সবচেয়ে বেশি সার্চ করছে। নাম তার আর্লিং হালান্ড!"),
    ("child", 8, 20, "+0Hz", "জন্ম ২০০০ সালে, ইংল্যান্ডের লিডসে। বড় হয়েছে নরওয়ের ছোট্ট শহর ব্রাইনে। বাবা আলফ-ইঙ্গে হালান্ডও প্রিমিয়ার লিগে খেলতেন। ভাবছো সব সহজ ছিল? না ভাই! শোনা যায় ছোটবেলায় সে দলের সবচেয়ে বড় ছেলে ছিল না। আর আজ? সাড়ে ছয় ফুটের এক দৈত্য!"),
    ("stairs", 20, 32, "+0Hz", "তার যাত্রাটা দেখো: ব্রাইন, মোল্ডে, অস্ট্রিয়ার সালজবুর্গ, জার্মানির ডর্টমুন্ড, আর শেষে ম্যানচেস্টার সিটি। এক লাফে চূড়ায় ওঠেনি, ধাপে ধাপে উঠেছে। লিফট না, সিঁড়ি!"),
    ("record", 32, 44, "+0Hz", "সিটিতে প্রথম সিজনেই প্রিমিয়ার লিগে ৩৬ গোল, যা এক সিজনে সবচেয়ে বেশি গোলের রেকর্ড! ওই এক সিজনেই লিগ, এফএ কাপ আর চ্যাম্পিয়নস লিগ, মানে ট্রেবল! আমরা এক সিজনে ৩৬টা ক্লাসও করতে পারি না।"),
    ("routine", 44, 56, "+0Hz", "আর তার রুটিন? ঘুম একদম ফুল চার্জ। খাবারের তালিকায় কলিজা-গুর্দা! আমাদের দাদিরা এতদিন এটাই বলে আসছে! আর গোলের পর ধ্যানে বসে যায়। আর আমরা? রাত তিনটা পর্যন্ত রিল দেখি, সকালে বলি 'আজ মুড নেই'।"),
    ("wait", 56, 70, "-6Hz", "কিন্তু আসল গল্পটা এখানে। দুনিয়ার সেরা স্ট্রাইকার, অথচ দেশের হয়ে ২০২২ বিশ্বকাপে নেই, ইউরো ২০২৪-এও নেই। নরওয়ে শেষবার বিশ্বকাপ খেলেছিল ১৯৯৮ সালে, হালান্ডের জন্মেরও আগে! সে অভিযোগ করেনি, হাল ছাড়েনি। চুপচাপ পরিশ্রম চালিয়ে গেছে। তারপর ২০২৬ বিশ্বকাপ, প্রথম ম্যাচ, ইরাকের বিপক্ষে... ডাবল গোল!"),
    ("run", 70, 92, "+2Hz", "তারপর সেনেগালকে হারাল। কিন্তু ফ্রান্সের কাছে চার-এক গোলের বড় হার! সবাই বলল, গল্প শেষ। হালান্ড বলল, 'ভাই, কেবল তো শুরু!' আইভরি কোস্টকে হারাল। তারপর এল ব্রাজিল, পাঁচবারের বিশ্বচ্যাম্পিয়ন! খেলা শেষ হতে আর মাত্র ১১ মিনিট বাকি, তখন হালান্ডের দুই গোল! নরওয়ে দুই, ব্রাজিল এক! ইতিহাসে প্রথমবার নরওয়ে বিশ্বকাপের কোয়ার্টার ফাইনালে! কোয়ার্টার ফাইনালে ইংল্যান্ডের কাছে দুই-এক গোলে হেরে যাত্রা শেষ হলো। কিন্তু হালান্ড টুর্নামেন্ট শেষ করল ৭ গোল নিয়ে, সারা দুনিয়ার হিরো হয়ে।"),
    ("lessons", 92, 108, "+0Hz", "তাহলে আজ কী শিখলাম? এক, ছোট দিয়ে শুরু করা কোনো লজ্জার বিষয় না। দুই, সাফল্য আসে ধাপে ধাপে, শর্টকাটে না। তিন, সুযোগ দেরিতে এলেও প্রস্তুতি যেন দেরি না করে। চার, একটা ম্যাচ হারলেই পুরো গল্প হারায় না। ফ্রান্সের কাছে হারের পরেই এসেছিল ইতিহাস!"),
    ("outro", 108, 120, "+0Hz", "তোমার বিশ্বকাপও আসছে, তৈরি থাকো! আর হ্যাঁ, আজ রাতে ফোনটা একটু তাড়াতাড়ি রাখো। যে বন্ধু রাত তিনটা পর্যন্ত জেগে থাকে, তাকে ট্যাগ করো! আমি রুবেল মিয়া, পরের পর্বে আবার দেখা হবে। ১০০ সেকেন্ডে শিখি!"),
]
LEAD, TAIL = 0.25, 0.35          # breathing room inside each window


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout)


async def speak(text, rate, pitch, mp3):
    c = edge_tts.Communicate(text, VOICE, rate=f"{rate:+d}%", pitch=pitch, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
    words = []
    with open(mp3, "wb") as fh:
        async for ch in c.stream():
            if ch["type"] == "audio":
                fh.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"w": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
    return words


# Speaking rate per section. The script is ~350 words: at a natural pace it
# runs ~2:20, not 2:00 — squeezing it into the script's windows needed +40%
# and still overran, which sounds rushed. So each section is spoken at an
# energetic but natural rate and the video follows the voice; the serious
# section is slower and lower, the World Cup run faster (as the script asks).
RATE = {"wait": 18, "run": 35}
GAP = 0.45


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    plan, t = [], 0.0
    for sid, _a, _b, pitch, text in SECTIONS:
        rate, mp3 = RATE.get(sid, 30), OUT/f"{sid}.mp3"
        words = await speak(text, rate, pitch, mp3)
        d = dur(mp3)
        start = t + (LEAD if not plan else GAP)
        plan.append({"id": sid, "start": round(start, 3), "end": round(start + d, 3), "rate": rate, "dur": round(d, 3), "text": text,
                     "words": [{**w, "s": round(w["s"] + start, 3), "e": round(w["e"] + start, 3)} for w in words]})
        t = start + d
        print(f"{sid:8s} {start:7.2f}-{start + d:7.2f}s  rate {rate:+3d}%  {d:5.2f}s  {len(words)} words")
    total = round(t + 1.6, 2)
    json.dump({"total": total, "sections": plan}, open(OUT/"vo.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # one 120 s timeline
    inputs, filt = [], []
    for i, p in enumerate(plan):
        inputs += ["-i", str(OUT/f"{p['id']}.mp3")]
        ms = int(p["start"] * 1000)
        filt.append(f"[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]")
    filt.append("".join(f"[a{i}]" for i in range(len(plan))) + f"amix=inputs={len(plan)}:normalize=0,apad,atrim=0:{total}[out]")
    subprocess.run(["ffmpeg", "-v", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", "-ac", "2", str(OUT/"vo.wav"), "-y"], check=True)
    print("vo.wav", dur(OUT/"vo.wav"))


asyncio.run(main())

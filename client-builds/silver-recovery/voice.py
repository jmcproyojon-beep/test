"""Bangla narration for the 12-clip Silver Crash & Recovery documentary (deep, calm male voice).

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py
Each clip's line is spoken with bn-BD-PradeepNeural (slower, lower pitch). Clips are 10 s, or longer if the
line needs it; narration starts 0.7 s into each clip. Writes audio/vo.wav and remotion-composer/src/silver/vo.json.
"""
import asyncio, json, os, subprocess
from pathlib import Path
import numpy as np, soundfile as sf, edge_tts

HERE = Path(__file__).parent; A = HERE / "audio"; (A / "clips").mkdir(parents=True, exist_ok=True)
SR = 44100; VOICE, RATE, PITCH = "bn-BD-PradeepNeural", "-6%", "-6Hz"
CLIPS = json.loads((HERE / "clips.json").read_text())
SPOKEN = [("Profit Booking", "প্রফিট বুকিং"), ("Futures Trader", "ফিউচার্স ট্রেডার"), ("Margin Call", "মার্জিন কল"), ("Panic Selling", "প্যানিক সেলিং"),
          ("Higher Low", "হায়ার লো"), ("Bond Yield", "বন্ড ইল্ড"), ("ETF Buying", "ইটিএফ বায়িং"), ("Industrial Demand", "ইন্ডাস্ট্রিয়াল ডিমান্ড"),
          ("Chart Resistance", "চার্ট রেজিস্ট্যান্স"), ("Investor", "ইনভেস্টর"), ("Silver", "সিলভার"), ("Dollar", "ডলার"), ("Crash", "ক্র্যাশ"),
          ("Recovery", "রিকভারি"), ("Recover", "রিকভার"), ("stimulus", "স্টিমুলাস"), ("COVID", "কোভিড"), ("Buying", "বায়িং"), ("Market", "মার্কেট")]
def spoken(s):
    for a, b in SPOKEN: s = s.replace(a, b)
    return s
async def tts(i, text):
    mp3 = A / "clips" / f"c{i:02d}.mp3"
    if mp3.exists(): return
    c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, proxy=os.environ.get("HTTPS_PROXY"))
    audio = bytearray()
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
    mp3.write_bytes(bytes(audio))
async def main():
    for i, c in enumerate(CLIPS): await tts(i, spoken(c["vo"]))
    out, t, track = [], 0.0, []
    for i, c in enumerate(CLIPS):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(A / "clips" / f"c{i:02d}.mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        y = np.frombuffer(raw, np.float32).copy()
        env = np.sqrt(np.convolve(y ** 2, np.ones(441) / 441, mode="same")); on = np.where(env > env.max() * 10 ** (-42 / 20))[0]
        y = y[max(0, on[0] - 1300): on[-1] + 2600]
        d = len(y) / SR; dur = max(10.0, round(d + 1.6, 2))
        seg = np.zeros(int(dur * SR), np.float32); i0 = int(0.7 * SR); seg[i0:i0 + len(y)] = y
        track.append(seg); out.append({"i": i, "s": round(t, 3), "dur": dur, "vs": round(t + 0.7, 3), "ve": round(t + 0.7 + d, 3), "vo": c["vo"]}); t += dur
    END = 5.0; track.append(np.zeros(int(END * SR), np.float32))
    v = np.concatenate(track); v = v / (np.abs(v).max() + 1e-9) * 0.92
    sf.write(A / "vo.wav", v, SR)
    json.dump({"total": round(t + END, 3), "brand": round(t, 3), "clips": out}, open(HERE.parents[1] / "remotion-composer/src/silver/vo.json", "w"), ensure_ascii=False)
    for o in out: print(o["i"], o["s"], o["dur"], round(o["ve"] - o["vs"], 2))
    print("total", round(t + END, 2))
asyncio.run(main())

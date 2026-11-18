"""Bangla voiceover + word timings for the Rapar Rubel promo.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py   (run in client-builds/rubel-promo)
Speaks each line of script.json with bn-BD-PradeepNeural, joins them with short pauses into
audio/vo.wav and writes ../../remotion-composer/src/rubelpromo/vo.json (lines + words, seconds).
"""
import asyncio, json, os, re
from pathlib import Path
import subprocess
import numpy as np, soundfile as sf, edge_tts

HERE = Path(__file__).parent; A = HERE / "audio"; (A / "lines").mkdir(parents=True, exist_ok=True)
SR = 44100; VOICE, RATE = "bn-BD-PradeepNeural", "+4%"
LINES = json.loads((HERE / "script.json").read_text())
SPOKEN = {"Rapar Rubel.": "রাপার রুবেল।", "AI-কে": "এআই-কে", "AI": "এআই"}
BIG = {1, 4, 5, 9, 10, 15, 20, 21, 27, 28, 31, 32, 35, 36, 40, 42}
def spoken(s):
    for k, v in SPOKEN.items(): s = s.replace(k, v)
    return s
async def tts(i, text):
    mp3, js = A / "lines" / f"l{i:02d}.mp3", A / "lines" / f"l{i:02d}.json"
    if mp3.exists() and js.exists(): return
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
    audio, words = bytearray(), []
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "WordBoundary": words.append({"w": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
    mp3.write_bytes(bytes(audio)); js.write_text(json.dumps(words, ensure_ascii=False))
async def main():
    for i, l in enumerate(LINES): await tts(i, spoken(l))
    track, words, lines, t = [], [], [], 0.6
    track.append(np.zeros(int(.6 * SR), np.float32))
    for i, l in enumerate(LINES):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(A / "lines" / f"l{i:02d}.mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        y = np.frombuffer(raw, np.float32).copy()
        env = np.sqrt(np.convolve(y ** 2, np.ones(441) / 441, mode="same")); on_ = np.where(env > env.max() * 10 ** (-42 / 20))[0]
        a, b = max(0, on_[0] - int(.03 * SR)), min(len(y), on_[-1] + int(.06 * SR))
        y = y[a:b]; off = a / SR
        disp = re.findall(r"\S+", l); ws = json.loads((A / "lines" / f"l{i:02d}.json").read_text())
        for k, w in enumerate(ws):
            words.append({"w": disp[k] if len(disp) == len(ws) else w["w"], "s": round(t + w["s"] - off, 3), "e": round(t + w["e"] - off, 3), "line": i})
        lines.append({"i": i, "text": l, "s": round(t, 3), "e": round(t + len(y) / SR, 3)})
        track.append(y); t += len(y) / SR
        gap = .7 if i in BIG else .3
        track.append(np.zeros(int(gap * SR), np.float32)); t += gap
    vo = np.concatenate(track); vo = vo / (np.abs(vo).max() + 1e-9) * .9
    sf.write(A / "vo.wav", vo, SR)
    out = HERE.parents[1] / "remotion-composer/src/rubelpromo"; out.mkdir(parents=True, exist_ok=True)
    (out / "vo.json").write_text(json.dumps({"total": round(t + 1.5, 3), "lines": lines, "words": words}, ensure_ascii=False))
    bad = [l["i"] for l in lines if len([w for w in words if w["line"] == l["i"]]) != len(re.findall(r"\S+", l["text"]))]
    for l in lines: print(f"{l['i']:2d} {l['s']:6.2f}-{l['e']:6.2f} {l['text'][:46]}")
    print("total", round(t, 1), "s; lines with word-count mismatch:", bad)
asyncio.run(main())

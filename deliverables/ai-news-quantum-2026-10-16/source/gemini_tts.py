"""Gemini TTS for the quantum edition. Reads GEMINI_API_KEY from the environment (never stored)."""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

KEY = os.environ["GEMINI_API_KEY"]
STYLE = "Say in a confident, warm Bangladeshi Bengali TV news presenter voice:\n"


def tts(text, out_wav, model, voice):
    body = {"contents": [{"parts": [{"text": STYLE + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                 data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code == 429 and attempt < 3:
                time.sleep(20 * (attempt + 1)); continue
            raise SystemExit(f"HTTP {e.code}: {msg}")
    part = d["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm = base64.b64decode(part["data"])
    rate = 24000
    if "rate=" in part.get("mimeType", ""):
        rate = int(part["mimeType"].split("rate=")[1].split(";")[0])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", "-", out_wav], input=pcm, check=True)
    return out_wav


if __name__ == "__main__":
    model, voice, out = sys.argv[1], sys.argv[2], sys.argv[3]
    text = sys.argv[4]
    tts(text, out, model, voice)
    print(out, subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip())

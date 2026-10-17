"""Transcribe a WAV with Gemini (verbatim Bangla + per-sentence timestamps) for QC/alignment."""
import base64
import json
import os
import sys
import urllib.request

KEY = os.environ["GEMINI_API_KEY"]
MODEL = os.environ.get("STT_MODEL", "gemini-3.8-flash")
wav = sys.argv[1]
mp3 = wav.rsplit(".", 1)[0] + ".stt.mp3"
os.system(f'ffmpeg -v error -y -i "{wav}" -ac 1 -ar 16000 -b:a 48k "{mp3}"')
data = base64.b64encode(open(mp3, "rb").read()).decode()
prompt = ("Transcribe this Bengali speech verbatim in Bengali script (keep English words in Latin script). "
          "Return JSON only: {\"segments\":[{\"start\":seconds,\"end\":seconds,\"text\":\"...\"}]} with one segment per sentence "
          "or clause, times accurate to 0.1 s.")
body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/mpeg", "data": data}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                             data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
import time, urllib.error
for _a in range(6):
    try:
        d = json.load(urllib.request.urlopen(req, timeout=180)); break
    except urllib.error.HTTPError as e:
        if e.code == 429 and _a < 5: time.sleep(15 * (_a + 1)); continue
        raise
if "candidates" not in d or "content" not in d["candidates"][0]: print(json.dumps(d)[:600], file=sys.stderr); sys.exit(2)
txt = d["candidates"][0]["content"]["parts"][0]["text"]
print(txt)

"""Gemini TTS: python gemini_tts.py <key_file> <model> <voice> <text_file> <out.wav>. Key file holds GEMINI_API_KEY (never commit it)."""
import base64, json, sys, urllib.request
key = open(sys.argv[1]).read().strip()
model, voice, text, out = sys.argv[2], sys.argv[3], open(sys.argv[4]).read(), sys.argv[5]
body = {"contents": [{"parts": [{"text": text}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
                             "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                             data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try:
    r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode()[:400]); sys.exit(1)
part = r["candidates"][0]["content"]["parts"][0]["inlineData"]
open(out, "wb").write(base64.b64decode(part["data"]))
print("ok", part.get("mimeType"))

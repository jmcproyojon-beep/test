import base64, json, sys, urllib.request
sys.path.insert(0, sys.argv[1]); from lyrics import LINES
key, model, out = sys.argv[2], sys.argv[3], sys.argv[4]
audio = base64.b64encode(open(sys.argv[1] + "/song.mp3", "rb").read()).decode()
numbered = "\n".join(f"{i}: {l}" for i, (_, l) in enumerate(LINES))
prompt = ("This is a Bengali song (about 128 seconds). Below are its exact lyric lines, numbered. For EVERY line, give the time (in seconds, 2 decimals) "
          "when the singer starts singing it and when they finish it. If a line is sung more than once, give the FIRST occurrence and list extra occurrences in 'repeats'. "
          "Also note any sung lines NOT in this list under 'extra' with times. Return ONLY JSON: {\"lines\":[{\"i\":0,\"start\":0.0,\"end\":0.0,\"repeats\":[[s,e]]}],\"extra\":[{\"text\":\"\",\"start\":0,\"end\":0}],\"music_only\":[[s,e]]}\n\n" + numbered)
body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/mpeg", "data": audio}}, {"text": prompt}]}], "generationConfig": {"temperature": 0, "responseMimeType": "application/json"}}
r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(), headers={"x-goog-api-key": key, "Content-Type": "application/json"})
d = json.load(urllib.request.urlopen(r, timeout=600))
txt = "".join(p.get("text", "") for p in d["candidates"][0]["content"]["parts"] if not p.get("thought"))
open(out, "w").write(txt); print(model, "ok", len(txt))

"""Ask Gemini for word-level start times inside each known line window."""
import base64, json, sys, urllib.request
sys.path.insert(0, "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/mv"); from lyrics import LINES
D = "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad"
A = {x["i"]: x for x in json.load(open(f"{D}/mv/align_b.json"))["lines"]}
key, model = sys.argv[1], sys.argv[2]
audio = base64.b64encode(open(f"{D}/mv/song.mp3", "rb").read()).decode()
rows = "\n".join(f'{i} [{A[i]["start"]:.2f}-{A[i]["end"]:.2f}]: ' + " | ".join(l.split()) for i, (_, l) in enumerate(LINES))
prompt = ("Bengali song. Each numbered lyric line below is sung inside the given time window (seconds). Words are separated by ' | '. "
          "For every word, give the time (seconds, 2 decimals) when the singer starts that word. Times must increase and stay inside the window. "
          "Return ONLY JSON: {\"lines\":[{\"i\":0,\"w\":[t0,t1,...]}]}\n\n" + rows)
body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/mpeg", "data": audio}}, {"text": prompt}]}], "generationConfig": {"temperature": 0, "responseMimeType": "application/json"}}
r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(), headers={"x-goog-api-key": key, "Content-Type": "application/json"})
d = json.load(urllib.request.urlopen(r, timeout=600))
open(f"{D}/mv3/words_raw.json", "w").write("".join(p.get("text", "") for p in d["candidates"][0]["content"]["parts"] if not p.get("thought"))); print("ok")

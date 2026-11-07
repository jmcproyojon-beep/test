import base64, json, os, sys, time, subprocess, urllib.request
model, off0, stride, length, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
lyr = open("lyrics.txt").read()
res = json.load(open(out)) if os.path.exists(out) else {}
st = off0
while st < 268:
    key = f"{st:.1f}"
    if key in res: st += stride; continue
    fn = f"win/w_{key}_{length:.0f}.mp3"
    if not os.path.exists(fn):
        subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",str(st),"-t",str(length),"-i","song_small.mp3",fn],check=True)
    audio = base64.b64encode(open(fn,"rb").read()).decode()
    prompt = (f"This {length:.0f}-second clip starts at {st:.1f}s into a 268-second Bangla song. Below are the song's official lyrics in order, one phrase per line. "
      "Lines can repeat. Listen very carefully to the VOCALS and list every lyric line that is sung or spoken in THIS clip, in order, with the exact official text and "
      "precise start/end times in seconds relative to the start of THIS clip (0.1 s precision; start = the moment the first syllable begins). "
      "Include a line even if it is only partly inside the clip. Ad-libs not in the lyrics: prefix '*'. Return ONLY a JSON list of {\"t0\":s,\"t1\":s,\"text\":\"...\"}; empty list if no voice.\n\nLYRICS:\n" + lyr)
    body = {"contents":[{"parts":[{"text":prompt},{"inlineData":{"mimeType":"audio/mpeg","data":audio}}]}],"generationConfig":{"responseMimeType":"application/json","temperature":0}}
    ok = False
    for a in range(3):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                data=json.dumps(body).encode(), headers={"Content-Type":"application/json","x-goog-api-key":os.environ["GEMINI_API_KEY"]}), timeout=240))
            segs = json.loads(r["candidates"][0]["content"]["parts"][0]["text"])
            res[key] = segs; json.dump(res, open(out,"w"), ensure_ascii=False); ok = True
            print(model, key, len(segs), flush=True); break
        except Exception as e:
            print(model, key, "err", getattr(e,"code",""), str(e)[:60], flush=True); time.sleep(65)
    st += stride
    time.sleep(8)
print(model, "DONE", flush=True)

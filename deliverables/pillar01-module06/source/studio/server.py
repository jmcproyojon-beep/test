"""AI Reel Studio — local demo server. Every AI result shown in the page comes LIVE from the Google Gemini API
(chat/translation, SVG illustration, text-to-speech, audio transcription to SRT); export runs a real render."""
import base64, json, os, re, subprocess, sys, threading, time, urllib.error, urllib.request, wave
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

KEYS = [k for k in os.environ["GEMINI_KEYS"].split(",") if k]
REC = "/home/user/test/projects/pillar01-lesson06/assets/rec"
LOG = f"{REC}/outputs.jsonl"
TEXT_MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-2.5-flash"]
TTS_MODELS = ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts", "gemini-2.5-flash-preview-tts"]
EXPORT = {"state": "idle", "pct": 0}
os.chdir(os.path.dirname(os.path.abspath(__file__)))


def log(rec):
    with open(LOG, "a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def call(model, body, stream=False):
    """Try every key for this model; return an open response or raise the last HTTPError."""
    last = None
    for k in KEYS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:{'streamGenerateContent?alt=sse' if stream else 'generateContent'}"
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"x-goog-api-key": k, "Content-Type": "application/json"})
        try:
            return urllib.request.urlopen(req, timeout=600)
        except urllib.error.HTTPError as e:
            last = e; sys.stderr.write(f"{model} HTTP {e.code} {e.read()[:160]}\n")
    raise last


def stream_text(handler, contents, gen=None):
    handler.send_response(200); handler.send_header("Content-Type", "text/event-stream"); handler.send_header("Cache-Control", "no-cache"); handler.end_headers()
    full, used = "", None
    body = {"contents": contents}
    if gen: body["generationConfig"] = gen
    for model in TEXT_MODELS:
        try:
            r = call(model, body, stream=True)
        except urllib.error.HTTPError:
            continue
        used = model
        for raw in r:
            line = raw.decode("utf-8").strip()
            if not line.startswith("data:"):
                continue
            for c in json.loads(line[5:]).get("candidates", []):
                for p in c.get("content", {}).get("parts", []):
                    if p.get("text") and not p.get("thought"):
                        full += p["text"]
                        handler.wfile.write(("data: " + json.dumps({"t": p["text"]}) + "\n\n").encode()); handler.wfile.flush()
        break
    handler.wfile.write(("data: " + json.dumps({"done": True, "model": used}) + "\n\n").encode()); handler.wfile.flush()
    return full, used


def wav_info(path):
    with wave.open(path) as w:
        n = w.getnframes(); sr = w.getframerate(); raw = w.readframes(n)
    import array
    a = array.array("h", raw); step = max(1, len(a) // 600)
    peaks = [max(abs(x) for x in a[i:i + step]) / 32768 for i in range(0, len(a), step)]
    return n / sr, [round(p, 3) for p in peaks]


class H(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()

    def j(self, obj):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)

    def do_GET(self):
        if self.path.startswith("/api/narration"):
            last = None
            for l in open(LOG):
                o = json.loads(l)
                if o.get("demo") == "d1" and o.get("turn") == 1: last = o
            blocks = re.findall(r"```[a-zA-Z]*\n(.*?)```", last["response"], re.S) if last else []
            text = blocks[-1].strip() if blocks else ""
            open(f"{REC}/narration_bn.txt", "w").write(text)
            return self.j({"text": text})
        if self.path.startswith("/api/state"):
            rd = lambda f: open(f"{REC}/{f}").read() if os.path.exists(f"{REC}/{f}") else ""
            st = dict(narr=rd("narration_bn.txt"), fixed=rd("reel_fixed.srt"), svgs=[rd(f"img{i}.svg") for i in (1, 2, 3)], en=rd("dub_en.txt"), srt=rd("reel_ai.srt"),
                      takes=json.load(open(f"{REC}/takes.json")) if os.path.exists(f"{REC}/takes.json") else [],
                      plan=json.load(open(f"{REC}/reel_plan.json")) if os.path.exists(f"{REC}/reel_plan.json") else None)
            return self.j(st)
        if self.path.startswith("/api/export_status"):
            return self.j(EXPORT)
        return super().do_GET()

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        p = self.path
        if p == "/api/chat":
            contents = [{"role": m["role"], "parts": [{"text": m["text"]}]} for m in body["history"]]
            full, used = stream_text(self, contents)
            if body.get("save"): open(f"{REC}/{body['save']}", "w").write(full.strip())
            log({"demo": body.get("demo"), "turn": body.get("turn"), "kind": "chat", "model": used, "prompt": body["history"][-1]["text"], "response": full})
        elif p == "/api/svg":
            instr = ("Create a complete, detailed SVG illustration for this brief. Use viewBox=\"0 0 1080 1920\" (9:16). "
                     "Rich layered shapes, gradients, no text, no external images or fonts. Output ONLY the SVG code.\n\nBrief: " + body["prompt"])
            full, used = stream_text(self, [{"role": "user", "parts": [{"text": instr}]}])
            m = re.search(r"<svg.*</svg>", full, re.S)
            svg = m.group(0) if m else ""
            open(f"{REC}/img{body['idx']}.svg", "w").write(svg)
            log({"demo": "d2", "turn": body["idx"], "kind": "svg", "model": used, "prompt": body["prompt"], "instruction": instr, "response": full})
        elif p == "/api/tts":
            text = body["text"]; voice = body["voice"]; style = body.get("style", "")
            prompt = (f"Read the following text aloud in this style: {style.rstrip('.')}. Speak only the text below, not these instructions.\n\n{text}") if style else text
            used, err = None, ""
            for model in TTS_MODELS:
                try:
                    d = json.load(call(model, {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["AUDIO"],
                                   "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}))
                except urllib.error.HTTPError as e:
                    err = str(e.code); continue
                part = d["candidates"][0]["content"]["parts"][0]["inlineData"]; used = model
                mime = part.get("mimeType", ""); raw = base64.b64decode(part["data"]); sys.stderr.write(f"tts mime {mime} {raw[:4]}\n")
                mr = re.search(r"rate=(\d+)", mime)
                inp = ["-i", "-"] if (raw[:4] == b"RIFF" or "wav" in mime or "mpeg" in mime) else ["-f", "s16le", "-ar", mr.group(1) if mr else "24000", "-ac", "1", "-i", "-"]
                out = f"{REC}/{body['tag']}.wav"
                subprocess.run(["ffmpeg", "-v", "error", "-y", *inp, "-af",
                                "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.25",
                                "-ar", "24000", "-ac", "1", out], input=raw, check=True)
                break
            if not used:
                return self.j({"error": "TTS unavailable " + err})
            dur, peaks = wav_info(out)
            tj = f"{REC}/takes.json"; takes = json.load(open(tj)) if os.path.exists(tj) else []
            takes = [t for t in takes if t["tag"] != body["tag"]] + [dict(tag=body["tag"], voice=voice, dur=dur, peaks=peaks, model=used, url=f"rec/{body['tag']}.wav")]
            json.dump(takes, open(tj, "w"))
            log({"demo": body.get("demo"), "turn": body.get("tag"), "kind": "tts", "model": used, "voice": voice, "prompt": prompt, "response": f"{out} ({dur:.1f} s)"})
            self.j({"url": f"rec/{body['tag']}.wav", "dur": dur, "peaks": peaks, "model": used, "voice": voice})
        elif p == "/api/srt":
            wav = f"{REC}/{body['wav']}"; mp3 = wav[:-4] + ".mp3"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-ac", "1", "-b:a", "64k", mp3], check=True)
            contents = [{"role": "user", "parts": [{"inlineData": {"mimeType": "audio/mpeg", "data": base64.b64encode(open(mp3, "rb").read()).decode()}}, {"text": body["prompt"]}]}]
            full, used = stream_text(self, contents, {"temperature": 0})
            srt = re.sub(r"^```[a-z]*\n|```\s*$", "", full.strip(), flags=re.M).strip()
            open(f"{REC}/reel_ai.srt", "w").write(srt + "\n")
            log({"demo": "d5", "turn": 0, "kind": "srt", "model": used, "prompt": body["prompt"], "response": full})
        elif p == "/api/savesrt":
            open(f"{REC}/reel_fixed.srt", "w").write(body["srt"].strip() + "\n")
            log({"demo": "d5", "turn": 1, "kind": "srt_fix", "model": "rule-based timestamp check (not AI)", "prompt": "fix malformed SRT timestamps", "response": body["srt"]})
            self.j({"ok": True})
        elif p == "/api/export":
            if EXPORT["state"] != "running":
                EXPORT.update(state="running", pct=0)
                threading.Thread(target=run_export, daemon=True).start()
            self.j(EXPORT)


def run_export():
    t0 = time.time()
    pr = subprocess.Popen([sys.executable, "-u", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "build_reel.py")], stdout=subprocess.PIPE, text=True)
    for line in pr.stdout:
        m = re.search(r"PCT (\d+)", line)
        if m: EXPORT["pct"] = int(m.group(1))
    pr.wait()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{REC}/reel_final.mp4", "-c:v", "libvpx-vp9", "-b:v", "3M", "-deadline", "realtime", "-cpu-used", "8", "-an", f"{REC}/reel_final.webm"])
    EXPORT.update(state="done" if pr.returncode == 0 else "error", pct=100, secs=round(time.time() - t0, 1), url="rec/reel_final.mp4")
    log({"demo": "d6", "turn": 0, "kind": "export", "model": "HyperFrames render + ffmpeg", "prompt": "export 1080x1920 30fps MP4", "response": json.dumps(EXPORT)})


ThreadingHTTPServer(("127.0.0.1", 8766), H).serve_forever()

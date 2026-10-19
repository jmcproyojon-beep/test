"""Local demo server: serves the chat page and relays LIVE Gemini streaming responses (real AI output)."""
import json, os, sys, urllib.request, urllib.error
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

KEY = os.environ["GEMINI_API_KEY"]
MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-2.5-flash"]
LOG = os.environ.get("OUT_LOG", "outputs.jsonl")
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class H(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        contents = [{"role": m["role"], "parts": [{"text": m["text"]}]} for m in body["history"]]
        self.send_response(200); self.send_header("Content-Type", "text/event-stream"); self.send_header("Cache-Control", "no-cache"); self.end_headers()
        full, used = "", None
        for model in MODELS:
            req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse",
                                         data=json.dumps({"contents": contents}).encode(),
                                         headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
            try:
                r = urllib.request.urlopen(req, timeout=300)
            except urllib.error.HTTPError as e:
                sys.stderr.write(f"{model} HTTP {e.code} {e.read()[:200]}\n"); continue
            used = model
            for raw in r:
                line = raw.decode("utf-8").strip()
                if not line.startswith("data:"):
                    continue
                d = json.loads(line[5:])
                for c in d.get("candidates", []):
                    for p in c.get("content", {}).get("parts", []):
                        if p.get("text") and not p.get("thought"):
                            full += p["text"]
                            self.wfile.write(("data: " + json.dumps({"t": p["text"]}) + "\n\n").encode()); self.wfile.flush()
            break
        self.wfile.write(("data: " + json.dumps({"done": True, "model": used}) + "\n\n").encode()); self.wfile.flush()
        with open(LOG, "a") as f:
            f.write(json.dumps({"demo": body.get("demo"), "turn": body.get("turn"), "model": used, "prompt": body["history"][-1]["text"], "response": full}, ensure_ascii=False) + "\n")


ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()

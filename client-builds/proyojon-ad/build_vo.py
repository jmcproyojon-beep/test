"""Assemble the Sabbir / Nusrat dialogue from the two full-script takes and time the ad around it.

    python3.13 -I build_vo.py <male.wav> <female.wav>      -> audio/dialogue.wav, src/proyojonad/vo.json

Both uploads read the whole 12-line script; Sabbir's lines come from the male take, Nusrat's from the female take.
Clip in/out points were found from pauses (see README). Gaps between lines leave room for the visual beats.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf

HERE = Path(__file__).parent; SR = 48000; FPS = 30
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)
M, F = load(sys.argv[1]), load(sys.argv[2])
# (speaker, take in, take out, gap before this line, text)
LINES = [
    ("s", 0.15, 1.95, 0.5, "এই যে, আপনাকেই বলছি!"),
    ("s", 2.15, 5.40, 0.3, "ঢাকায় স্বপ্নের ফ্ল্যাট কিংবা পছন্দের প্লট খুঁজছেন?"),
    ("s", 5.75, 7.75, 0.75, "লোকেশন ঠিক তো? বাজেটে হবে তো?"),
    ("s", 8.10, 10.00, 0.55, "এত চিন্তা একা কেন করবেন?"),
    ("n", 11.20, 11.82, 1.35, "চিন্তা নেই!"),
    ("n", 12.00, 14.25, 0.3, "আমি নুসরাত, প্রয়োজন আবাসন থেকে বলছি।"),
    ("n", 14.65, 17.28, 0.8, "ফ্ল্যাট হোক বা প্লট, সঠিক লোকেশনে,"),
    ("n", 17.38, 20.90, 0.2, "আপনার প্রয়োজন ও বাজেট অনুযায়ী প্রপার্টি খুঁজে দেব আমরা।"),
    ("s", 20.60, 23.10, 4.6, "বাহ! এটাই তো আমার স্বপ্নের ঠিকানা!"),
    ("n", 24.95, 27.05, 0.45, "আপনার স্বপ্নের ঠিকানাও খুঁজে নিন আজই।"),
    ("s", 26.30, 29.45, 0.8, "তাহলে আজই যোগাযোগ করুন প্রয়োজন আবাসন লিমিটেডের সঙ্গে!"),
    ("n", 31.30, 34.25, 0.4, "প্রয়োজন আবাসন, আগামীর নিশ্চিত ঠিকানা।"),
]
TAIL = 5.2
t = 0.0; out = []
for spk, a, b, gap, text in LINES:
    t += gap; out.append({"i": len(out), "spk": spk, "text": text, "s": round(t, 3), "e": round(t + b - a, 3), "a": a, "b": b}); t += b - a
TOTAL = t + TAIL; N = int(TOTAL * SR)
trk = {"s": np.zeros(N, np.float32), "n": np.zeros(N, np.float32)}
for L in out:
    src = M if L["spk"] == "s" else F
    x = src[int(L["a"] * SR): int(L["b"] * SR)].copy(); f = int(.015 * SR)
    x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    i = int(L["s"] * SR); trk[L["spk"]][i:i + len(x)] += x
for k in trk: trk[k] = trk[k] / (np.abs(trk[k]).max() + 1e-9) * .9
dia = trk["s"] + trk["n"]; dia = dia / (np.abs(dia).max() + 1e-9) * .92
sf.write(HERE / "audio/dialogue.wav", dia, SR)
# mouth envelopes at 30 fps, 0..1
env = {}
for k, x in trk.items():
    h = SR // FPS; e = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, N - h + 1, h)])
    ref = np.percentile(e[e > 1e-3], 92) if (e > 1e-3).any() else 1
    env[k] = [round(float(v), 2) for v in np.clip(e / ref, 0, 1)]
json.dump({"total": round(TOTAL, 3), "lines": [{k: L[k] for k in ("i", "spk", "text", "s", "e")} for L in out], "env": env},
          open(HERE.parents[1] / "remotion-composer/src/proyojonad/vo.json", "w"), ensure_ascii=False)
for L in out: print(f"{L['i']:2d} {L['spk']} {L['s']:6.2f}-{L['e']:6.2f} {L['text']}")
print("total", round(TOTAL, 2))

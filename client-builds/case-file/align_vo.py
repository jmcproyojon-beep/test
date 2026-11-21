"""Fit the recorded voiceover to the Rubel case-file reel's 11 script lines (copy of rubel-promo/align_vo.py).

    python3.13 -I align_vo.py <voice.wav> <whisper_words.json>     (run in client-builds/rubel-promo)

whisper_words.json = [{w, s, e}, ...] from faster-whisper (word timestamps) on the same take.
1. Needleman-Wunsch aligns the transcript words to the script words (fuzzy Bangla match).
2. Unmatched script words are interpolated by letter count between matched neighbours.
3. Line edges snap to the nearest real pause.
Writes audio/vo.wav (the take, 0.6 s lead-in, 44.1 kHz) and remotion-composer/src/rubelpromo/vo.json.
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf

HERE = Path(__file__).parent
SR, LEAD = 44100, 0.3
src, wjson = Path(sys.argv[1]), Path(sys.argv[2])
LINES = json.loads((HERE / "script.json").read_text())
HW = json.loads(wjson.read_text())

EN = {"ai": "এআই", "power": "পাওয়ার", "user": "ইউজার"}
FOLD = [("ী", "ি"), ("ূ", "ু"), ("ষ", "স"), ("শ", "স"), ("ণ", "ন"), ("য়", "য"), ("য", "জ"), ("ড়", "র"), ("ঢ়", "র"), ("ং", "ঙ"),
        ("ঁ", ""), ("্", ""), ("ৃ", "ির"), ("ৈ", "ে"), ("ৌ", "ো"), ("ঃ", ""), ("়", ""), ("ঐ", "এ"), ("ঔ", "ও"), ("ঈ", "ই"), ("ঊ", "উ")]
def norm(w):
    w = re.sub(r"[^\wঀ-৿]", "", w.lower())
    for k, v in EN.items(): w = w.replace(k, v)
    for a, b in FOLD: w = w.replace(a, b)
    return w
def sim(a, b):
    if not a or not b: return 0.0
    if a == b: return 1.0
    A = {a[i:i + 2] for i in range(len(a) - 1)} or {a}; B = {b[i:i + 2] for i in range(len(b) - 1)} or {b}
    return 2 * len(A & B) / (len(A) + len(B))

S = []  # script words: (line, display, norm)
for li, l in enumerate(LINES):
    for w in re.findall(r"\S+", l):
        for part in [w] if not w.startswith("AI-") else [w]:
            S.append((li, part, norm(part)))
H = [(norm(w["w"]), w) for w in HW if norm(w["w"])]
n, m = len(S), len(H); G = -0.35
sc = np.zeros((n + 1, m + 1)); bt = np.zeros((n + 1, m + 1), np.int8)
sc[1:, 0] = G * np.arange(1, n + 1); sc[0, 1:] = G * np.arange(1, m + 1); bt[1:, 0] = 1; bt[0, 1:] = 2
for i in range(1, n + 1):
    si = S[i - 1][2]
    for j in range(1, m + 1):
        d = sc[i - 1, j - 1] + sim(si, H[j - 1][0]) - 0.45; u = sc[i - 1, j] + G; l_ = sc[i, j - 1] + G
        if d >= u and d >= l_: sc[i, j], bt[i, j] = d, 0
        elif u >= l_: sc[i, j], bt[i, j] = u, 1
        else: sc[i, j], bt[i, j] = l_, 2
hit, i, j = {}, n, m
while i > 0 or j > 0:
    if i > 0 and j > 0 and bt[i, j] == 0:
        if sim(S[i - 1][2], H[j - 1][0]) >= 0.34: hit[i - 1] = H[j - 1][1]
        i, j = i - 1, j - 1
    elif i > 0 and (j == 0 or bt[i, j] == 1): i -= 1
    else: j -= 1
print(f"matched {len(hit)}/{n} script words")

# interpolate unmatched words by letter count between matched anchors
y, sr = sf.read(src); y = y if y.ndim == 1 else y.mean(1)
dur = len(y) / sr
L = np.array([max(1, len(re.sub(r"[^\wঀ-৿]", "", s[1]))) for s in S], float)
st, en = np.zeros(n), np.zeros(n)
anchors = [(-1, 0.0)] + [(k, hit[k]["s"]) for k in sorted(hit)] + [(n, dur)]
# keep anchors strictly increasing in time
clean = [anchors[0]]
for a in anchors[1:]:
    if a[1] > clean[-1][1] + 0.02: clean.append(a)
for (ka, ta), (kb, tb) in zip(clean, clean[1:]):
    seg = list(range(ka + (1 if ka >= 0 else 0) if ka in hit or ka < 0 else ka, kb))
    if ka >= 0 and ka in hit: st[ka] = hit[ka]["s"]; en[ka] = hit[ka]["e"]
    idx = list(range(ka + 1, kb))
    t0 = hit[ka]["e"] if ka in hit else ta
    if not idx: continue
    tot = L[idx].sum(); span = max(0.05, tb - t0)
    acc = t0
    for k in idx:
        d = span * L[k] / tot; st[k] = acc; en[k] = acc + d * 0.9; acc += d
for k in hit: st[k], en[k] = hit[k]["s"], hit[k]["e"]

# pauses for snapping line edges
h = int(sr * .05); e = np.array([np.sqrt(np.mean(y[q:q + h] ** 2)) for q in range(0, len(y) - h, h)]); db = 20 * np.log10(e + 1e-9)
thr = np.percentile(db, 90) - 30; sil = db < thr; P = []; q = 0
while q < len(sil):
    if sil[q]:
        r = q
        while r < len(sil) and sil[r]: r += 1
        if (r - q) * .05 >= 0.2: P.append((q * .05, r * .05))
        q = r
    else: q += 1
lines = []
for li in range(len(LINES)):
    ks = [k for k in range(n) if S[k][0] == li]
    s0, e0 = st[ks[0]], en[ks[-1]]
    a = [p for p in P if abs(p[1] - s0) < 0.45]; s0 = min(a, key=lambda p: abs(p[1] - s0))[1] - 0.05 if a else s0
    b = [p for p in P if abs(p[0] - e0) < 0.45]; e0 = min(b, key=lambda p: abs(p[0] - e0))[0] + 0.05 if b else e0
    lines.append({"i": li, "text": LINES[li], "s": round(s0 + LEAD, 3), "e": round(max(e0, s0 + 0.3) + LEAD, 3)})
for k in range(1, len(lines)):
    if lines[k]["s"] < lines[k - 1]["e"]: mid = (lines[k]["s"] + lines[k - 1]["e"]) / 2; lines[k - 1]["e"] = round(mid - .01, 3); lines[k]["s"] = round(mid + .01, 3)
words = [{"w": S[k][1], "s": round(max(lines[S[k][0]]["s"], st[k] + LEAD), 3), "e": round(min(lines[S[k][0]]["e"], en[k] + LEAD), 3), "line": S[k][0]} for k in range(n)]
total = dur + LEAD + 1.5
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(src), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.float32); v = np.concatenate([np.zeros(int(LEAD * SR), np.float32), v]); v = v / (np.abs(v).max() + 1e-9) * .92
(HERE / "audio").mkdir(exist_ok=True); sf.write(HERE / "audio/vo.wav", v, SR)
out = HERE.parents[1] / "remotion-composer/src/casefile/vo.json"
out.write_text(json.dumps({"total": round(total, 3), "lines": lines, "words": words}, ensure_ascii=False))
for l in lines:
    got = " ".join(hit[k]["w"] for k in range(n) if S[k][0] == l["i"] and k in hit)
    print(f"{l['i']:2d} {l['s']:7.2f}-{l['e']:7.2f} {l['text'][:34]:<36}| {got[:44]}")

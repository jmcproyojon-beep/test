"""Time the 65 lyric lines against the sung vocals.

    python3.13 -I align_lyrics.py <lyrics_srt.json> <whisper_words.json> <song duration s>
        -> remotion-composer/src/tribute/lyrics.json

Needleman-Wunsch aligns Whisper's words (sung Bangla, often garbled) to the lyric words in order, so repeated
choruses land in the right place. Unmatched words are interpolated by letter count between matched anchors.
A line runs from its first word to its last word (+0.6 s), capped by the next line's start.
"""
import json, re, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
LINES = json.load(open(sys.argv[1])); HW = json.load(open(sys.argv[2])); DUR = float(sys.argv[3])
FOLD = [("ী", "ি"), ("ূ", "ু"), ("ষ", "স"), ("শ", "স"), ("ণ", "ন"), ("য়", "য"), ("য", "জ"), ("ড়", "র"), ("ঢ়", "র"), ("ং", "ঙ"),
        ("ঁ", ""), ("্", ""), ("ৃ", "ির"), ("ৈ", "ে"), ("ৌ", "ো"), ("ঃ", ""), ("়", ""), ("ঐ", "এ"), ("ঔ", "ও"), ("ঈ", "ই"), ("ঊ", "উ"), ("ো", ""), ("া", "")]
def norm(w):
    w = re.sub(r"[^\wঀ-৿]", "", w.lower())
    for a, b in FOLD: w = w.replace(a, b)
    return w
def sim(a, b):
    if not a or not b: return 0.0
    if a == b: return 1.0
    A = {a[i:i + 2] for i in range(len(a) - 1)} or {a}; B = {b[i:i + 2] for i in range(len(b) - 1)} or {b}
    return 2 * len(A & B) / (len(A) + len(B))
S = [(li, w, norm(w)) for li, l in enumerate(LINES) for w in re.findall(r"\S+", l["text"])]
H = [(norm(w["w"]), w) for w in HW if norm(w["w"])]
n, m = len(S), len(H); G = -0.3
sc = np.zeros((n + 1, m + 1)); bt = np.zeros((n + 1, m + 1), np.int8)
sc[1:, 0] = G * np.arange(1, n + 1); sc[0, 1:] = G * 0.5 * np.arange(1, m + 1); bt[1:, 0] = 1; bt[0, 1:] = 2
for i in range(1, n + 1):
    si = S[i - 1][2]
    for j in range(1, m + 1):
        d = sc[i - 1, j - 1] + sim(si, H[j - 1][0]) - 0.42; u = sc[i - 1, j] + G; l_ = sc[i, j - 1] + G * 0.5   # extra sung words are cheap
        if d >= u and d >= l_: sc[i, j], bt[i, j] = d, 0
        elif u >= l_: sc[i, j], bt[i, j] = u, 1
        else: sc[i, j], bt[i, j] = l_, 2
hit, i, j = {}, n, m
while i > 0 or j > 0:
    if i > 0 and j > 0 and bt[i, j] == 0:
        if sim(S[i - 1][2], H[j - 1][0]) >= 0.4: hit[i - 1] = H[j - 1][1]
        i, j = i - 1, j - 1
    elif i > 0 and (j == 0 or bt[i, j] == 1): i -= 1
    else: j -= 1
print(f"matched {len(hit)}/{n} lyric words")
Lw = np.array([max(1, len(re.sub(r"[^\wঀ-৿]", "", s[1]))) for s in S], float)
st = np.zeros(n)
anchors = [(-1, 0.0)] + [(k, hit[k]["s"]) for k in sorted(hit)] + [(n, DUR)]
clean = [anchors[0]]
for a in anchors[1:]:
    if a[1] > clean[-1][1] + 0.05: clean.append(a)
for (ka, ta), (kb, tb) in zip(clean, clean[1:]):
    if ka >= 0: st[ka] = ta
    idx = list(range(ka + 1, kb)); t0 = hit[ka]["e"] if ka in hit else ta
    if not idx: continue
    tot = Lw[idx].sum(); span = max(0.1, tb - t0); acc = t0
    for k in idx: st[k] = acc; acc += span * Lw[k] / tot
out = []
for li, l in enumerate(LINES):
    ks = [k for k in range(n) if S[k][0] == li]
    s0 = float(st[ks[0]]); last = ks[-1]
    e0 = float(hit[last]["e"]) if last in hit else float(st[last]) + 0.5
    out.append({"i": li, "text": l["text"], "s": round(s0, 2), "e": round(e0 + 0.6, 2), "m": sum(k in hit for k in ks), "n": len(ks)})
for k in range(len(out) - 1):
    out[k]["e"] = round(min(out[k]["e"], out[k + 1]["s"] - 0.05), 2)
json.dump({"total": DUR, "lines": [{k: o[k] for k in ("i", "text", "s", "e")} for o in out]},
          open(HERE.parents[1] / "remotion-composer/src/tribute/lyrics.json", "w"), ensure_ascii=False)
for o in out: print(f"{o['i']:2d} {o['s']:7.2f}-{o['e']:7.2f} {o['m']}/{o['n']} {o['text'].splitlines()[0]}")

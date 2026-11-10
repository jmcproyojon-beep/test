"""Cut the client's continuous voice take into the 51 script lines.

    python3.13 -I client-builds/lighting-masterclass/align_user.py

Inputs: projects/lighting-masterclass/audio/user/{voice.wav, words.json}
(words.json = windowed faster-whisper transcript + pauses, transcribe_user.py).

1. Needleman-Wunsch aligns the transcript words to the script words (fuzzy
   Bangla spelling match; English loanwords mapped to the script's spelling),
   which pins most script words to a time.
2. Each line boundary is placed in the pause nearest to where its first/last
   word was heard (or, with no match, where its share of letters says).
3. Writes voice-times.json: for every line, where it sits in the take
   [src_s, src_e]. place_user.py then lays each line on the video's cue.
"""
import json, re, subprocess
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
A = HERE.parents[1] / "projects/lighting-masterclass/audio/user"
D = json.loads((A / "words.json").read_text())
words, pauses, DUR = D["words"], D["pauses"], D["dur"]
LINES = json.loads(subprocess.run(["node", "-e", "import('./src/script.js').then(m=>console.log(JSON.stringify(m.timeLines())))"],
                                  cwd=HERE, capture_output=True, text=True, check=True).stdout)

EN = {"light": "লাইট", "subject": "সাবজেক্ট", "soft": "সফট", "hard": "হার্ড", "dramatic": "ড্রামাটিক", "look": "লুক", "background": "ব্যাকগ্রাউন্ড",
      "inverse": "ইনভার্স", "square": "স্কয়ার", "law": "ল", "key": "কী", "fill": "ফিল", "back": "ব্যাক", "softbox": "সফটবক্স", "reflector": "রিফ্লেক্টর",
      "diffuser": "ডিফিউজার", "golden": "গোল্ডেন", "hour": "আওয়ার", "white": "হোয়াইট", "balance": "ব্যালেন্স", "temperature": "টেম্পারেচার",
      "color": "কালার", "camera": "ক্যামেরা", "studio": "স্টুডিও", "outdoor": "আউটডোর", "portrait": "পোর্ট্রেট", "interview": "ইন্টারভিউ",
      "youtube": "ইউটিউব", "video": "ভিডিও", "professional": "প্রফেশনাল", "loop": "লুপ", "rembrandt": "রেমব্রান্ট", "butterfly": "বাটারফ্লাই",
      "split": "স্প্লিট", "lighting": "লাইটিং", "setup": "সেটআপ", "practice": "প্র্যাকটিস", "kelvin": "কেলভিন", "rim": "রিম", "open": "ওপেন", "shade": "শেড"}
BN_DIG = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
FOLD = [("ী", "ি"), ("ূ", "ু"), ("ষ", "স"), ("শ", "স"), ("ণ", "ন"), ("য়", "য"), ("য", "জ"), ("ড়", "র"), ("ঢ়", "র"), ("ং", "ঙ"),
        ("ঁ", ""), ("্", ""), ("ৃ", "ির"), ("ৈ", "ে"), ("ৌ", "ো"), ("ঃ", ""), ("়", ""), ("ঐ", "এ"), ("ঔ", "ও"), ("ঈ", "ই"), ("ঊ", "উ")]
NUM = {"45": "পঁয়তাল্লিশ"}


def norm(w):
    w = w.lower().strip()
    w = re.sub(r"[^\wঀ-৿]", "", w)
    w = NUM.get(w.translate(BN_DIG), w)
    if re.fullmatch(r"[a-z]+", w):
        w = EN.get(w, w)
    for a, b in FOLD:
        w = w.replace(a, b)
    return w


def sim(a, b):
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    A_ = {a[i:i + 2] for i in range(len(a) - 1)} or {a}
    B_ = {b[i:i + 2] for i in range(len(b) - 1)} or {b}
    return 2 * len(A_ & B_) / (len(A_) + len(B_))


# script words, each tagged with its line index
S = []
for li, l in enumerate(LINES):
    for w in l["text"].replace("—", " ").replace("-", " ").split():
        n = norm(w)
        if n:
            S.append((li, n))
H = [(norm(w["w"]), w) for w in words if norm(w["w"])]

# Needleman-Wunsch (score = similarity - 0.45; gaps -0.35)
n, m = len(S), len(H)
G = -0.35
sc = np.zeros((n + 1, m + 1)); bt = np.zeros((n + 1, m + 1), np.int8)
sc[1:, 0] = G * np.arange(1, n + 1); sc[0, 1:] = G * np.arange(1, m + 1); bt[1:, 0] = 1; bt[0, 1:] = 2
for i in range(1, n + 1):
    si = S[i - 1][1]
    for j in range(1, m + 1):
        d = sc[i - 1, j - 1] + sim(si, H[j - 1][0]) - 0.45
        u = sc[i - 1, j] + G
        l_ = sc[i, j - 1] + G
        if d >= u and d >= l_:
            sc[i, j], bt[i, j] = d, 0
        elif u >= l_:
            sc[i, j], bt[i, j] = u, 1
        else:
            sc[i, j], bt[i, j] = l_, 2
pairs, i, j = [], n, m
while i > 0 or j > 0:
    if i > 0 and j > 0 and bt[i, j] == 0:
        if sim(S[i - 1][1], H[j - 1][0]) >= 0.34:
            pairs.append((i - 1, j - 1))
        i, j = i - 1, j - 1
    elif i > 0 and (j == 0 or bt[i, j] == 1):
        i -= 1
    else:
        j -= 1
pairs.reverse()
hit = {si: H[hj][1] for si, hj in pairs}
print(f"matched {len(hit)}/{len(S)} script words")

# per line: first/last heard word times
nL = len(LINES)
first, last = [None] * nL, [None] * nL
for si, (li, _) in enumerate(S):
    if si in hit:
        w = hit[si]
        if first[li] is None:
            first[li] = w["s"]
        last[li] = w["e"]

# boundary between line k-1 and k: a pause between last[k-1] and first[k]
letters = np.array([len(re.sub(r"[\s—,;।?-]", "", l["text"])) for l in LINES], float)
cum = np.concatenate([[0], np.cumsum(letters)]) / letters.sum()
speech_a, speech_b = words[0]["s"] if words else 0.0, words[-1]["e"] if words else DUR
P = [(a + b) / 2 for a, b in pauses if a > speech_a + 0.3 and b < speech_b - 0.3]
# anchors: each line's first heard word; keep the longest in-order subset
anch = [(k, first[k]) for k in range(nL) if first[k] is not None]
best, prevk = [1] * len(anch), [-1] * len(anch)
for x in range(len(anch)):
    for z in range(x):
        if anch[z][1] + 0.3 < anch[x][1] and best[z] + 1 > best[x]:
            best[x], prevk[x] = best[z] + 1, z
x = int(np.argmax(best)); keep = []
while x >= 0:
    keep.append(anch[x]); x = prevk[x]
keep = dict(reversed(keep))
keep[0] = max(0.0, speech_a - 0.05)
known = sorted(keep.items()) + [(nL, speech_b + 0.05)]
starts = [0.0] * (nL + 1)
for (ka, ta), (kb, tb) in zip(known, known[1:]):
    for k in range(ka, kb + 1):
        starts[k] = ta + (tb - ta) * (cum[k] - cum[ka]) / max(1e-9, cum[kb] - cum[ka])
# snap to the nearest real pause, staying in order
bounds = [starts[0]]
for k in range(1, nL):
    nxt = starts[k + 1]
    cands = [p for p in P if bounds[-1] + 0.5 < p < nxt - 0.4 and abs(p - starts[k]) < (0.35 if k in keep else 0.9)]
    b = min(cands, key=lambda p: abs(p - starts[k])) if cands else max(starts[k], bounds[-1] + 0.5)
    bounds.append(round(b, 3))
bounds.append(round(min(DUR, speech_b + 0.1), 3))
# Boundaries checked by hand where the transcript has holes (start of line, s):
#  7.0 "প্রতিটা আলোর…": pause 108.03-108.28 (heard "…একটা রঙ্গ আছে" from 108.9)
#  7.4 "সব লাইট এক টেম্পারেচারে…": pause 118.27-118.46 after "…মিশিয়ে ফেলবেন না —"
#  9.1 "বড় উৎস…": pause 146.71-146.98 between "বদলায়," and "বডো উচ্ছ"
#  3.4 "লাইট কাছে থাকলে…": pause 36.26-36.93 after "…Square Law." (the transcript lost "লাইট")
OVERRIDE = {(3, 4): 36.6, (7, 0): 108.155, (7, 4): 118.365, (9, 1): 146.845}
for k, l in enumerate(LINES):
    if (l["scene"], l["i"]) in OVERRIDE:
        bounds[k] = OVERRIDE[(l["scene"], l["i"])]
print("anchored lines:", len(keep), "of", nL)

out = []
for k, l in enumerate(LINES):
    out.append({"scene": l["scene"], "i": l["i"], "text": l["text"], "src_s": bounds[k], "src_e": bounds[k + 1],
                "heard": " ".join(hit[si]["w"] for si, (li, _) in enumerate(S) if li == k and si in hit)})
(HERE / "voice-times.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
for o in out:
    print(f"{o['scene']}.{o['i']}  {o['src_s']:7.2f}-{o['src_e']:7.2f} ({o['src_e'] - o['src_s']:4.1f}s)  {o['text'][:38]:<40} | {o['heard'][:50]}")

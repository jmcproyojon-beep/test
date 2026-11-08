"""Merge Gemini window readings (a38.json, a37.json, …) into lines.json: the 84 official lines in order with t0/t1."""
import json, re, glob, statistics, sys
def norm(s): return re.sub(r"[^ঀ-৿]", "", s)
segs = []
for fn in sorted(glob.glob("a*.json")):
    for k, v in json.load(open(fn)).items():
        o = float(k)
        for x in v:
            if not isinstance(x, dict) or "t0" not in x: continue
            a, b = o + float(x["t0"]), o + float(x["t1"])
            if o > 0 and a < o + 0.4: continue              # clipped at the window start
            if a > o + 29.0: continue                         # clipped at the window end
            segs.append((a, b, norm(x.get("text", "")), fn))
segs.sort()
lyr = [l for l in open("lyrics.txt").read().splitlines() if l.strip()]
def match(n, s): return s and (s == n or (len(n) >= 4 and (s.startswith(n) or n.startswith(s) or n in s or s in n)))
out, prev, used, weak = [], -1.0, set(), []
for i, text in enumerate(lyr):
    n = norm(text)
    c = [(a, b, f) for a, b, s, f in segs if match(n, s) and prev + 0.25 < a < prev + 45 and (round(a, 1), f) not in used]
    groups = []
    for a, b, f in c:
        if groups and a - groups[-1][-1][0] < 1.5: groups[-1].append((a, b, f))
        else: groups.append([(a, b, f)])
    g = next((g for g in groups if len({x[2] for x in g}) >= 2), groups[0] if groups else None)
    if g is None: out.append(None); weak.append(i); continue
    for x in g: used.add((round(x[0], 1), x[2]))
    st = statistics.median(x[0] for x in g); en = statistics.median(x[1] for x in g)
    out.append([st, en, len({x[2] for x in g})]); prev = st
# interpolate missing lines between known neighbours
for i in range(len(out)):
    if out[i] is None:
        j0 = max([j for j in range(i) if out[j]], default=None); j1 = min([j for j in range(i + 1, len(out)) if out[j]], default=None)
        a = out[j0][0] if j0 is not None else 0; b = out[j1][0] if j1 is not None else a + 3 * (i - (j0 or 0) + 1)
        span = (j1 if j1 is not None else i + 1) - (j0 if j0 is not None else -1)
        out[i] = [a + (b - a) * (i - (j0 if j0 is not None else -1)) / span, None, 0]
L = []
for i, (st, en, nm) in enumerate(out):
    nxt = out[i + 1][0] if i + 1 < len(out) else st + 4
    e = en if en else min(nxt, st + 3)
    L.append({"t0": round(st, 2), "t1": round(min(max(e, st + 0.6), nxt - 0.02 if nxt > st + 0.65 else st + 0.6), 2), "text": lyr[i], "n": nm})
json.dump(L, open("../lines.json", "w"), ensure_ascii=False)
print(len(segs), "readings;", sum(1 for l in L if l["n"] >= 2), "agreed;", sum(1 for l in L if l["n"] == 1), "single;", len(weak), "interpolated", weak)

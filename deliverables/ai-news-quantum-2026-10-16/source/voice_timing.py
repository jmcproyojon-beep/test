"""Build timing.json + narration.wav from the per-scene Gemini takes (voiced edition)."""
import json
import re
import subprocess
import sys

sys.path.insert(0, "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/q")
from script_q import SCENES, MAXC

P = "/home/user/test/projects/ai-news-quantum-2026-10-16"
A = f"{P}/assets/audio"
LEAD, GAP, TAIL = 0.3, 0.55, 1.5


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


def silences(f):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=noise=-38dB:d=0.16", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(st, en))


t = LEAD; lines = []; scenes = []; offsets = []
for s in SCENES:
    f = f"{A}/{s['id']}.wav"; d = dur(f); sil = silences(f)
    offsets.append((s["id"], t))
    chars = [len(re.sub(r"\s", "", l)) for l in s["lines"]]
    bounds = []; cum = 0
    for i in range(len(chars) - 1):
        cum += chars[i]; est = d * cum / sum(chars)
        cands = [((a + b) / 2, abs((a + b) / 2 - est)) for a, b in sil if a > 0.3 and b < d - 0.2]
        snap = min(cands, key=lambda x: x[1]) if cands else None
        bounds.append(snap[0] if snap and snap[1] < 1.2 else est)
    edges = [0.0] + bounds + [d]
    for i, l in enumerate(s["lines"]):
        ls, le = t + edges[i], t + edges[i + 1]
        if i < len(s["lines"]) - 1: le -= 0.08
        if i > 0: ls += 0.08
        words = l.split(); wc = [len(w) for w in words]; tot = sum(wc); acc = ls; ws = []
        for w, n in zip(words, wc):
            dd = (le - ls) * n / tot; ws.append(dict(t=w, s=round(acc, 3), e=round(acc + dd, 3))); acc += dd
        lines.append(dict(scene=s["id"], text=l, start=round(ls, 3), end=round(le, 3), words=ws))
    t += d + GAP

total = round(t - GAP + TAIL, 3)
NB = {"Claude", "Mythos", "Quantum", "Google", "AI", "G7", "১৭"}
cues = []
for ln in lines:
    lc, cur = [], []
    for i, w in enumerate(ln["words"]):
        cur.append(w); txt = " ".join(x["t"] for x in cur)
        nxt = ln["words"][i + 1]["t"] if i + 1 < len(ln["words"]) else None
        brk = nxt is None or (w["t"] not in NB and (len(txt + " " + nxt) > MAXC or (len(txt) >= 18 and re.search(r"[,—।!]$", w["t"]))))
        if brk:
            lc.append(dict(scene=ln["scene"], text=txt, start=cur[0]["s"], end=cur[-1]["e"], words=cur)); cur = []
    if len(lc) > 1 and len(lc[-1]["text"]) <= 12:
        a, b = lc[-2], lc.pop(); a["text"] += " " + b["text"]; a["end"] = b["end"]; a["words"] += b["words"]
    cues += lc
for a, b in zip(cues, cues[1:]):
    if b["start"] - a["end"] < 0.6: a["end"] = round(b["start"] - 0.04, 3)
for i, s in enumerate(SCENES):
    first = next(x for x in lines if x["scene"] == s["id"])
    scenes.append(dict(id=s["id"], label=s["label"], start=0.0 if i == 0 else round(first["start"] - 0.45, 3)))
for a, b in zip(scenes, scenes[1:]): a["end"] = b["start"]
scenes[-1]["end"] = total
json.dump(dict(mode="voiced_gemini_orus", video_duration=total, scenes=scenes, lines=lines, cues=cues),
          open(f"{P}/artifacts/timing.json", "w"), ensure_ascii=False, indent=1)

# narration track: each scene placed at its offset
inputs, filt = [], []
for k, (sid, off) in enumerate(offsets):
    inputs += ["-i", f"{A}/{sid}.wav"]
    filt.append(f"[{k}:a]aresample=48000,adelay={int(off * 1000)}|{int(off * 1000)}[a{k}]")
filt.append("".join(f"[a{k}]" for k in range(len(offsets))) + f"amix=inputs={len(offsets)}:normalize=0,apad=whole_dur={total}[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", "-ac", "2", "-ar", "48000", "-t", str(total), f"{A}/narration.wav"], check=True)
print("total", total, "cues", len(cues))
for s in scenes: print(s["id"], s["start"], s["end"])
for L in lines: print(f'{L["start"]:6.2f}-{L["end"]:6.2f} {L["text"][:40]}')

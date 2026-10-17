"""Timeline + narration track for Lesson 03 from the verified per-scene takes."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l3_script import SCENES

P = "/home/user/test/projects/pillar01-lesson03"
A = f"{P}/assets/audio"
MAN = json.load(open(f"{P}/artifacts/tts_manifest.json"))
FIRST, FLASH, AFTER, TAIL, MAXC = 1.2, 1.4, 0.5, 3.0, 66


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


def silences(f):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=noise=-38dB:d=0.16", "-f", "null", "-"], capture_output=True, text=True).stderr
    return list(zip([float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)], [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]))


t = 0.0; scenes, lines, place = [], [], []
for i, s in enumerate(SCENES):
    start = t
    narr = start + (FIRST if i == 0 else FLASH)
    off = narr
    for ci in range(10):
        k = f"{s['id']}_c{ci}"
        if k not in MAN: break
        m = MAN[k]; f = m["wav"].replace("/chunks/", "/proc/"); d = dur(f); sil = silences(f)
        chars = [len(re.sub(r"\s", "", l)) for l in m["lines"]]
        bounds, cum = [], 0
        for j in range(len(chars) - 1):
            cum += chars[j]; est = d * cum / sum(chars)
            c = [((a + b) / 2, abs((a + b) / 2 - est)) for a, b in sil if a > 0.3 and b < d - 0.2]
            sn = min(c, key=lambda x: x[1]) if c else None
            bounds.append(sn[0] if sn and sn[1] < 1.5 else est)
        edges = [0.0] + bounds + [d]
        for j, l in enumerate(m["lines"]):
            ls, le = off + edges[j] + (0.06 if j else 0), off + edges[j + 1] - (0.06 if j < len(m["lines"]) - 1 else 0)
            lines.append(dict(scene=s["id"], idx=len([x for x in lines if x["scene"] == s["id"]]), text=l, start=round(ls, 3), end=round(le, 3)))
        place.append((f, off)); off += d + 0.35
    narr_end = off - 0.35
    scenes.append(dict(id=s["id"], num=s["num"], title=s["title"], start=round(start, 3), narr_start=round(narr, 3), narr_end=round(narr_end, 3)))
    t = narr_end + AFTER
for a, b in zip(scenes, scenes[1:]): a["end"] = b["start"]
total = round(scenes[-1]["narr_end"] + TAIL, 3)
scenes[-1]["end"] = total

cues = []
for L in lines:
    words = L["text"].split(); n = len(L["text"]); acc = L["start"]; span = L["end"] - L["start"]
    cur = []
    for wi, w in enumerate(words):
        cur.append(w); txt = " ".join(cur)
        nxt = words[wi + 1] if wi + 1 < len(words) else None
        if nxt is None or len(txt + " " + nxt) > MAXC or (len(txt) >= 30 and re.search(r"[,—।?!]$", w)):
            d = span * (len(txt) + 1) / (n + 1)
            cues.append(dict(scene=L["scene"], text=txt.strip(" —"), start=round(acc, 3), end=round(acc + d, 3))); acc += d; cur = []
    if len(cues) >= 2 and cues[-1]["scene"] == L["scene"] and len(cues[-1]["text"]) <= 12 and cues[-2]["end"] >= L["start"]:
        b = cues.pop(); cues[-1]["text"] += " " + b["text"]; cues[-1]["end"] = b["end"]
for a, b in zip(cues, cues[1:]):
    if b["start"] - a["end"] < 0.6: a["end"] = round(b["start"] - 0.04, 3)
json.dump(dict(video_duration=total, scenes=scenes, lines=lines, cues=cues), open(f"{P}/artifacts/timing.json", "w"), ensure_ascii=False, indent=1)

inputs, filt = [], []
for k, (f, off) in enumerate(place):
    inputs += ["-i", f]; filt.append(f"[{k}:a]aresample=48000,adelay={int(off * 1000)}|{int(off * 1000)}[a{k}]")
filt.append("".join(f"[a{k}]" for k in range(len(place))) + f"amix=inputs={len(place)}:normalize=0,apad=whole_dur={total}[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", "-ac", "2", "-ar", "48000", "-t", str(total), f"{A}/narration.wav"], check=True)
print("total", total, "s =", f"{int(total // 60)}:{total % 60:04.1f}", "cues", len(cues))
for s in scenes: print(s["id"], s["start"], s["narr_start"], s["end"])

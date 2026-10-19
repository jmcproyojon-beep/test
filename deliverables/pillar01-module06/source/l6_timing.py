"""Lesson 06 timeline: cut each scene take into lines (silence-snapped), lay out segments with demo / practice / quiz pauses."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l6_script import SEGS, SCENES

P = "/home/user/test/projects/pillar01-lesson06"
A = f"{P}/assets/audio"
MAN = json.load(open(f"{P}/artifacts/tts_manifest.json"))
PAD = json.load(open(f"{P}/artifacts/pads.json")) if os.path.exists(f"{P}/artifacts/pads.json") else {}
FIRST, FLASH, TAIL, MAXC = 1.0, 1.6, 3.2, 66
GAP_LINE = 0.35
REEL = json.load(open(f"{P}/assets/rec/reel_plan.json"))["dur"] if os.path.exists(f"{P}/assets/rec/reel_plan.json") else 30.0
PLAY = {"s05a": 12.0, "s05b": 10.0, "s06b": 10.0, "s06c": 12.0, "s07b": 12.0, "s08b": 6.0, "s09a": REEL}
os.makedirs(f"{A}/lines", exist_ok=True)


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


def silences(f):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=noise=-38dB:d=0.16", "-f", "null", "-"], capture_output=True, text=True).stderr
    return list(zip([float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)], [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]))


# 1) slice every scene take into per-line wavs
line_wav = {}
for sc, _, _ in SCENES:
    for ci in range(10):
        k = f"{sc}_c{ci}"
        if k not in MAN:
            break
        m = MAN[k]; f = m["wav"].replace("/chunks/", "/proc/"); d = dur(f); sil = silences(f)
        chars = [len(re.sub(r"\s", "", l)) for l in m["lines"]]
        bounds, cum = [], 0
        for j in range(len(chars) - 1):
            cum += chars[j]; est = d * cum / sum(chars)
            c = [((a + b) / 2, abs((a + b) / 2 - est)) for a, b in sil if a > 0.3 and b < d - 0.2]
            sn = min(c, key=lambda x: x[1]) if c else None
            bounds.append(sn[0] if sn and sn[1] < 1.6 else est)
        edges = [0.0] + bounds + [d]
        for j, l in enumerate(m["lines"]):
            out = f"{A}/lines/{k}_{j:02d}.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-ss", f"{edges[j]:.3f}", "-to", f"{edges[j + 1]:.3f}",
                            "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,afade=t=in:d=0.01,areverse,afade=t=in:d=0.06,areverse",
                            out], check=True)
            line_wav.setdefault(l, []).append(out)

# 2) lay out the timeline
t = 0.0; scenes, segs, lines, place = [], [], [], []
for si, (sc, num, title) in enumerate(SCENES):
    start = t
    t += FIRST if si == 0 else FLASH
    narr_start = t
    for g in [g for g in SEGS if g["scene"] == sc]:
        gs = t
        for li, l in enumerate(g["lines"]):
            f = line_wav[l].pop(0); d = dur(f)
            lines.append(dict(scene=sc, seg=g["id"], idx=li, text=l, start=round(t, 3), end=round(t + d, 3)))
            place.append((f, t)); t += d + GAP_LINE
            if g.get("quiz") and li % 2 == 0:
                t += 4.0                                   # thinking pause before each answer
        t -= GAP_LINE
        extra = {"anim": 0.8, "screen": 2.5, "reel": 0.8}[g["kind"]]
        if g["id"] in PLAY:
            extra = PLAY[g["id"]] + 1.0                    # the generated audio/video plays after the narration
        if g.get("practice"):
            extra = 7.0                                    # pause-and-practise countdown
        extra += PAD.get(g["id"], 0.0)
        t += extra
        segs.append(dict(id=g["id"], scene=sc, kind=g["kind"], demo=g.get("demo"), part=g.get("part"), play=PLAY.get(g["id"]), lip=bool(g.get("lip")), practice=bool(g.get("practice")),
                         quiz=bool(g.get("quiz")), start=round(gs, 3), narr_end=round(t - extra, 3), end=round(t, 3)))
    scenes.append(dict(id=sc, num=num, title=title, start=round(start, 3), narr_start=round(narr_start, 3), end=None))
for a, b in zip(scenes, scenes[1:]):
    a["end"] = b["start"]
total = round(t + TAIL, 3); scenes[-1]["end"] = total

cues = []
for L in lines:
    words = L["text"].split(); n = len(L["text"]); acc = L["start"]; span = L["end"] - L["start"]; cur = []
    for wi, w in enumerate(words):
        cur.append(w); txt = " ".join(cur); nxt = words[wi + 1] if wi + 1 < len(words) else None
        if nxt is None or len(txt + " " + nxt) > MAXC or (len(txt) >= 30 and re.search(r"[,—।?!]$", w)):
            d = span * (len(txt) + 1) / (n + 1)
            cues.append(dict(scene=L["scene"], text=txt.strip(" —"), start=round(acc, 3), end=round(acc + d, 3))); acc += d; cur = []
    if len(cues) >= 2 and cues[-1]["scene"] == L["scene"] and len(cues[-1]["text"]) <= 12 and cues[-2]["end"] >= L["start"]:
        b = cues.pop(); cues[-1]["text"] += " " + b["text"]; cues[-1]["end"] = b["end"]
for a, b in zip(cues, cues[1:]):
    if b["start"] - a["end"] < 0.6:
        a["end"] = round(b["start"] - 0.04, 3)
json.dump(dict(video_duration=total, scenes=scenes, segs=segs, lines=lines, cues=cues), open(f"{P}/artifacts/timing.json", "w"), ensure_ascii=False, indent=1)

# 3) narration track (mixed in chunks to keep ffmpeg's input count small)
parts = []
for i in range(0, len(place), 30):
    grp = place[i:i + 30]; out = f"{A}/narr_part{i // 30}.wav"
    inputs, filt = [], []
    for k, (f, off) in enumerate(grp):
        inputs += ["-i", f]; filt.append(f"[{k}:a]aresample=48000,adelay={int(off * 1000)}|{int(off * 1000)}[a{k}]")
    filt.append("".join(f"[a{k}]" for k in range(len(grp))) + f"amix=inputs={len(grp)}:normalize=0,apad=whole_dur={total}[out]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", "-ac", "2", "-ar", "48000", "-t", str(total), out], check=True)
    parts.append(out)
ins = sum((["-i", p] for p in parts), [])
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", "".join(f"[{k}:a]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0[out]",
                "-map", "[out]", "-ac", "2", "-ar", "48000", "-t", str(total), f"{A}/narration.wav"], check=True)
print("total", total, "s =", f"{int(total // 60)}:{total % 60:04.1f}", "lines", len(lines), "cues", len(cues))
for s in segs:
    print(s["id"], s["kind"], s["start"], s["narr_end"], s["end"])

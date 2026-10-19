"""Edit each genuine AI Reel Studio recording into the exact clip its narration segment needs.
Waiting for the AI is trimmed to ~1.2 s, typing is sped up, scroll-reads are retimed; generated audio/video playback stays at 1x.
Zoom boxes from the recorder are mapped onto the clip timeline and applied as smooth GSAP zooms in the lesson build."""
import json, os, subprocess, sys

P = "/home/user/test/projects/pillar01-lesson06"
R = f"{P}/assets/rec"
OUT = f"{P}/hf/assets/clips"; os.makedirs(OUT, exist_ok=True)
T = json.load(open(f"{P}/artifacts/timing.json"))
ONLY = sys.argv[1].split(",") if len(sys.argv) > 1 else None
CJ = f"{P}/artifacts/clips.json"
report = json.load(open(CJ)) if os.path.exists(CJ) else {}
WAIT_KEEP = (0.7, 0.6)      # keep the first 0.7 s ("thinking…") and the last 0.6 s before the result


def pieces_for(ev, part):
    s = next(e["t"] for e in ev if e["e"] == "part_start" and e.get("part") == part)
    e_ = next(e["t"] for e in ev if e["e"] == "part_end" and e.get("part") == part)
    inside = [x for x in ev if s <= x["t"] <= e_]
    cuts = sorted({s, e_} | {x["t"] for x in inside if x["e"] in ("wait_start", "wait_end", "type_start", "type_end", "read_start", "read_end", "play_start", "play_end")})
    kinds = []
    state = dict(wait=False, type=False, read=False, play=False)
    marks = {(x["t"], x["e"]) for x in inside}
    for a, b in zip(cuts, cuts[1:]):
        for (t, e) in marks:
            if t == a and e.endswith("_start"): state[e[:-6]] = True
            if t == a and e.endswith("_end"): state[e[:-4]] = False
        k = "play" if state["play"] else "wait" if state["wait"] else "type" if state["type"] else "read" if state["read"] else "norm"
        if b - a > 0.05: kinds.append([a, b, k])
    plays = [x for x in inside if x["e"] == "play_start"]
    zooms = [x for x in ev if x["e"] == "zoom" and x["t"] <= e_]
    clicks = [x for x in inside if x["e"] == "click"]
    return s, e_, kinds, plays, zooms, clicks


def retime(kinds, pre_target, play_cap):
    """Return list of (a, b, speed) source spans whose output duration fits pre_target (+ play at 1x)."""
    out = []
    for a, b, k in kinds:
        if k == "wait":
            w0, w1 = WAIT_KEEP
            if b - a > w0 + w1 + 0.2: out += [[a, a + w0, 1.0, k], [b - w1, b, 1.0, k]]
            else: out.append([a, b, 1.0, k])
        else: out.append([a, b, 1.0, k])
    pre = [x for x in out if x[3] != "play"]; ply = [x for x in out if x[3] == "play"]
    dur = lambda xs: sum((b - a) / s for a, b, s, _ in xs)
    for x in pre:
        if x[3] == "type": x[2] = max(1.0, min(6.0, (x[1] - x[0]) / max(3.0, 0.22 * pre_target)))
    for kind, cap in (("read", 3.0), ("norm", 2.2), ("type", 8.0), ("read", 5.0), ("norm", 3.5)):
        over = dur(pre) - pre_target
        if over <= 0: break
        grp = [x for x in pre if x[3] == kind]; g = dur(grp)
        if g <= 0: continue
        f = min(cap / 1.0, g / max(0.3, g - over))
        for x in grp: x[2] = min(cap, x[2] * f)
    short = pre_target - dur(pre)
    grp = [x for x in pre if x[3] == "read"]; g = dur(grp)
    if short > 0.5 and g > 0:                                    # too short: slow the scroll-reads (down to 0.5x) before holding a frame
        f = max(0.5, g / (g + short))
        for x in grp: x[2] = x[2] * f
    if ply:                                                      # only the first play_cap seconds of playback, 1x
        a0 = ply[0][0]; ply = [[a0, min(ply[-1][1], a0 + play_cap), 1.0, "play"]]
    return pre, ply


for s in T["segs"]:
    if s["kind"] != "screen" or (ONLY and s["id"] not in ONLY):
        continue
    if not os.path.exists(f"{R}/{s['demo']}.events.json"):
        continue
    D = s["end"] - s["start"]; ev = json.load(open(f"{R}/{s['demo']}.events.json"))
    src = f"{R}/{s['demo']}.webm"
    p0, p1, kinds, plays, zooms, clicks = pieces_for(ev, s["part"])
    has_play = bool(plays) and s.get("play")
    pre_target = (s["narr_end"] - s["start"] + 0.5) if has_play else D
    pre, ply = retime(kinds, pre_target, s.get("play") or 0)
    spans = pre + (ply if has_play else [])
    tmp = []; tmap = []; tout = 0.0
    for i, (a, b, sp, k) in enumerate(spans):
        f = f"{OUT}/_{s['id']}_{i}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src, "-an", "-vf", f"setpts=(PTS-STARTPTS)/{sp:.4f},fps=30,format=yuv420p",
                        "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", f], check=True)
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
        tmap.append((a, b, tout, d)); tmp.append(f); tout += d
        if has_play and k != "play" and (i + 1 == len(pre)) and tout < pre_target:   # hold before playback starts
            hold = pre_target - tout; hf = f"{OUT}/_{s['id']}_{i}h.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.1", "-i", f, "-vf", f"tpad=stop_mode=clone:stop_duration={hold:.3f},fps=30,format=yuv420p", "-t", f"{hold:.3f}",
                            "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", hf], check=True)
            tmp.append(hf); tmap.append((b, b, tout, hold)); tout += hold
    lst = f"{OUT}/_{s['id']}.txt"; open(lst, "w").write("".join(f"file '{x}'\n" for x in tmp))
    out = f"{OUT}/{s['id']}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf", f"tpad=stop_mode=clone:stop_duration={max(0, D - tout) + 0.5:.3f}",
                    "-t", f"{D:.3f}", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p", out], check=True)
    for x in tmp + [lst]: os.remove(x)

    def m(t):                                                   # source time -> clip time
        best = None
        for a, b, o, d in tmap:
            if a <= t <= b and b > a: return o + (t - a) / (b - a) * d
            if t < a and best is None: best = o
        return best if best is not None else tout
    zk = []
    for z in zooms:
        zk.append([round(max(0.0, m(max(z["t"], p0))), 3), z["box"]])
    zk = [z for i, z in enumerate(zk) if i == len(zk) - 1 or zk[i + 1][0] > z[0] + 0.05]
    if zk:                                                       # bake smooth zooms (0.7 s eased moves between boxes) into the clip
        def ex(vals):
            e_ = f"{vals[0][1]:.2f}"
            for (t0, v0), (t1, v1) in zip(vals, vals[1:]):
                if abs(v1 - v0) < 1e-3: continue
                sk = f"clip((it-{max(0, t1 - .2):.3f})/0.7,0,1)"
                e_ += f"+({v1 - v0:.4f})*{sk}*{sk}*(3-2*{sk})"
            return e_
        Z = ex([(t, 1920 / b[2]) for t, b in zk]); X = ex([(t, b[0]) for t, b in zk]); Y = ex([(t, b[1]) for t, b in zk])
        zo = out[:-4] + "_z.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-vf", f"zoompan=z='{Z}':x='{X}':y='{Y}':d=1:s=1500x844:fps=30,format=yuv420p",
                        "-c:v", "libx264", "-crf", "18", "-preset", "medium", zo], check=True)
        os.replace(zo, out)
    ck = [round(m(c["t"]), 3) for c in clicks if p0 <= c["t"] <= p1]
    play_at = round(sum(d for a, b, o, d in tmap if spans and o < pre_target and True and o + d <= pre_target + 0.01), 3) if has_play else None
    report[s["id"]] = dict(demo=s["demo"], part=s["part"], dur=round(D, 2), out_len=round(tout, 2), zooms=zk, clicks=ck,
                           play=dict(tag=plays[0]["tag"], at=round(pre_target, 3), len=round(ply[0][1] - ply[0][0], 3), src_from=0.0) if has_play else None,
                           waits_cut=[round(b - a, 1) for a, b, k in kinds if k == "wait"], speeds=[round(x[2], 2) for x in spans])
    print(s["id"], {k: report[s["id"]][k] for k in ("dur", "out_len", "waits_cut", "play")})
json.dump(report, open(CJ, "w"), indent=1)

"""Edit each genuine browser recording into the exact-length clip its narration segment needs.
Typing (zoomed on the prompt box) -> short wait -> answer arrives (full frame) -> read-through (zoomed on the chat column)."""
import json, os, subprocess

P = "/home/user/test/projects/pillar01-lesson05"
R = f"{P}/assets/rec"
OUT = f"{P}/hf/assets/clips"; os.makedirs(OUT, exist_ok=True)
T = json.load(open(f"{P}/artifacts/timing.json"))
W, H = 1440, 810
ZOOM_TYPE = "crop=1440:810:240:270"      # prompt box area
ZOOM_READ = "crop=1440:810:400:64"       # chat column, top-aligned
FULL = "scale=1440:810"


def part(src, a, b, speed, vf, out):
    b = max(b, a + 0.2)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src, "-an",
                    "-vf", f"{vf},{'scale=1440:810,' if vf != FULL else ''}setpts=PTS/{speed:.4f},fps=30,format=yuv420p",
                    "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", out], check=True)
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout)


import sys
ONLY = sys.argv[1].split(",") if len(sys.argv) > 1 else None
report = json.load(open(f"{P}/artifacts/clips.json")) if os.path.exists(f"{P}/artifacts/clips.json") and ONLY else {}
for s in T["segs"]:
    if s["kind"] != "screen":
        continue
    D = s["end"] - s["start"]; demo, turn = s["demo"], s["turn"]
    src = f"{R}/{demo}.webm"
    if not os.path.exists(f"{R}/{demo}.events.json") or (ONLY and s["id"] not in ONLY):
        continue
    ev = json.load(open(f"{R}/{demo}.events.json"))
    E = {(e["e"], e.get("turn")): e["t"] for e in ev}
    ts, te = E[("type_start", turn)] - 0.4, E[("type_end", turn)] + 0.5
    snd, dn = E[("send", turn)], E[("done", turn)]
    rs, re_ = E[("read_start", turn)], E[("read_end", turn)] + 1.2
    tsrc, rsrc = te - ts, re_ - rs
    t_target = min(max(3.0, D * 0.30), tsrc)
    t_speed = max(1.0, min(4.0, tsrc / t_target))
    tmp = [f"{OUT}/_{s['id']}_{k}.mp4" for k in range(4)]
    d0 = part(src, ts, te, t_speed, ZOOM_TYPE, tmp[0])
    d1 = part(src, snd, snd + 1.2, 1.0, FULL, tmp[1])                    # "লিখছে…" (wait trimmed)
    d2 = part(src, dn - 0.1, dn + 1.1, 1.0, FULL, tmp[2])                # answer arrives
    r_target = max(2.0, D - d0 - d1 - d2)
    r_speed = max(0.55, min(3.0, rsrc / r_target))
    d3 = part(src, rs, re_, r_speed, ZOOM_READ, tmp[3])
    lst = f"{OUT}/_{s['id']}.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in tmp))
    hold = max(0.0, D - (d0 + d1 + d2 + d3))
    out = f"{OUT}/{s['id']}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf", f"tpad=stop_mode=clone:stop_duration={hold + 0.5:.3f}",
                    "-t", f"{D:.3f}", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", out], check=True)
    for p in tmp + [lst]:
        os.remove(p)
    report[s["id"]] = dict(demo=demo, turn=turn, dur=round(D, 2), type_speed=round(t_speed, 2), read_speed=round(r_speed, 2),
                           wait_cut_from=round(dn - snd, 1), t_type=round(d0, 2), t_answer=round(d0 + d1, 2), t_read=round(d0 + d1 + d2, 2), hold=round(hold, 2))
    print(s["id"], report[s["id"]])
json.dump(report, open(f"{P}/artifacts/clips.json", "w"), indent=1)

"""Render every cut of the music video: frame, grade, and burn in the lyrics.

One segment per cut. Cuts are hard (no dissolves) because the whole point is
that the picture changes ON the beat — a crossfade smears that edge away.
"""
import json, random, subprocess
from pathlib import Path

P = Path("projects/ukulele-mv")
VID, OV = P/"assets/video", P/"assets/overlays"
SEG = P/"assets/segments"; SEG.mkdir(parents=True, exist_ok=True)
W, H, FPS = 1280, 720, 24

CLIPS = {"01": "01-player-portrait.mp4", "02": "02-fretboard-closeup.mp4",
         "03": "03-soundhole-strumming.mp4", "04": "04-player-brick-wall.mp4",
         "05": "05-player-wide-environment.mp4", "06": "06-shadows.mp4",
         "07": "07-strumming.mp4"}

# The lyric arc runs from "a thousand people behind glass, still so alone" to
# "let's all take hands" — so the grade cools off in the verses and warms
# through the choruses, ending golden before it fades out.
GRADE = {
    "cool":    "eq=contrast=1.08:saturation=0.80:brightness=-0.015,colorbalance=rs=-0.05:bs=0.07",
    "neutral": "eq=contrast=1.06:saturation=1.00",
    "warm":    "eq=contrast=1.09:saturation=1.15:brightness=0.012,colorbalance=rs=0.05:bs=-0.04",
    "golden":  "eq=contrast=1.12:saturation=1.24:brightness=0.02,colorbalance=rs=0.09:gs=0.02:bs=-0.07",
    "fade":    "eq=contrast=1.05:saturation=0.72:brightness=-0.03,colorbalance=rs=-0.03:bs=0.06",
}

TITLE_IN, TITLE_OUT = 3.6, 11.2


def frame_chain(zoom, ax, ay, drift, dur):
    """Scale up, then crop a slowly drifting window — so the same few seconds of
    source read as a different shot each time it comes round."""
    sw, sh = int(W * zoom) // 2 * 2, int(H * zoom) // 2 * 2
    mx, my = sw - W, sh - H
    x0, y0 = mx * ax, my * ay
    dx, dy = drift
    x1 = min(max(x0 + dx, 0), mx)
    y1 = min(max(y0 + dy, 0), my)
    xe = f"{x0:.1f}+({x1 - x0:.1f})*min(1,t/{dur:.3f})"
    ye = f"{y0:.1f}+({y1 - y0:.1f})*min(1,t/{dur:.3f})"
    return f"scale={sw}:{sh}:flags=lanczos,crop={W}:{H}:x='{xe}':y='{ye}'"


def build():
    plan = json.load(open(P/"assets/edit-plan.json"))
    cuts, lyr = plan["cuts"], plan["lyrics"]
    rng = random.Random(7)

    for n, c in enumerate(cuts):
        out = SEG/f"{n:03d}.mp4"
        dur, speed = c["dur"], c["speed"]
        nframes = max(1, round(dur * FPS))
        src_len = dur * speed

        # framing: close shots stay tighter and steadier, wides get more drift
        zoom = rng.choice([1.0, 1.0, 1.08, 1.14] if c["kind"] in ("close", "strum")
                          else [1.0, 1.06, 1.12, 1.18])
        ax, ay = rng.uniform(0.25, 0.75), rng.uniform(0.3, 0.7)
        amp = 26 if zoom > 1.0 else 0
        drift = (rng.uniform(-amp, amp), rng.uniform(-amp / 2, amp / 2))

        # Trim inside the filtergraph, not with -ss/-t. With more than one input
        # those are read as INPUT options for whichever file comes next — here
        # the overlay PNGs — so the clip silently played from 0:00 every time.
        chain = [f"trim=start={c['src_in']:.3f}:duration={src_len:.3f}", "setpts=PTS-STARTPTS"]
        if speed < 0.999:
            # setpts only restamps the frames it is given; without an explicit
            # fps after it the segment keeps the SOURCE frame count and ends
            # short, which walks every later cut off the beat.
            chain.append(f"setpts=PTS/{speed:.4f}")
            chain.append(f"fps={FPS}")
        chain.append(frame_chain(zoom, ax, ay, drift, dur))
        chain.append(GRADE[c["grade"]])
        base = "[0:v]" + ",".join(chain) + "[base]"

        # which overlays are live during this cut
        overs, inputs, idx = [], [], 1
        actives = [(l["start"], l["end"], OV/f"ly-{i:02d}.png")
                   for i, l in enumerate(lyr)
                   if l["end"] > c["t0"] + 0.05 and l["start"] < c["t1"] - 0.05]
        if TITLE_OUT > c["t0"] + 0.05 and TITLE_IN < c["t1"] - 0.05:
            actives.append((TITLE_IN, TITLE_OUT, OV/"title.png"))

        for gs, ge, png in actives:
            inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}", "-i", str(png)]
            ls, le = max(0.0, gs - c["t0"]), min(dur, ge - c["t0"])
            f = [f"[{idx}]format=rgba"]
            # fade only at the line's real edges; a line continuing across a cut
            # must not blink at the join
            if gs >= c["t0"] - 0.01:
                f.append(f"fade=t=in:st={ls:.3f}:d=0.30:alpha=1")
            if ge <= c["t1"] + 0.01:
                f.append(f"fade=t=out:st={max(0, le - 0.35):.3f}:d=0.35:alpha=1")
            overs.append(",".join(f) + f"[o{idx}]")
            idx += 1

        cur = "[base]"
        for k in range(1, idx):
            nxt = "[vout]" if k == idx - 1 else f"[m{k}]"
            overs.append(f"{cur}[o{k}]overlay=0:0{nxt}")
            cur = nxt
        if idx == 1:
            overs.append("[base]null[vout]")
        fc = base + ";" + ";".join(overs)

        cmd = ["ffmpeg", "-v", "error",
               "-i", str(VID/CLIPS[c["clip"]]),
               *inputs,
               "-filter_complex", fc, "-map", "[vout]",
               "-frames:v", str(nframes), "-r", str(FPS),
               "-c:v", "libx264", "-crf", "18", "-preset", "medium",
               "-pix_fmt", "yuv420p", "-an", str(out), "-y"]
        subprocess.run(cmd, check=True)
        if n % 10 == 0 or n == len(cuts) - 1:
            print(f"  {n:3d}/{len(cuts)-1}  {c['section']:8s} clip{c['clip']} "
                  f"{c['kind']:8s} {dur:4.2f}s x{speed:.2f} zoom{zoom:.2f}")

    # A segment that comes out short shifts every cut after it off the beat, and
    # nothing downstream would complain, so check the frame counts here.
    bad = []
    for n, c in enumerate(cuts):
        want = max(1, round(c["dur"] * FPS))
        got = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v",
                                  "-count_frames", "-show_entries", "stream=nb_read_frames",
                                  "-of", "csv=p=0", str(SEG/f"{n:03d}.mp4")],
                                 capture_output=True, text=True).stdout.strip())
        if got != want:
            bad.append(f"  {n:03d} {c['section']} clip{c['clip']} speed {c['speed']}: want {want} frames, got {got}")
    if bad:
        raise SystemExit("segments are the wrong length:\n" + "\n".join(bad))
    print(f"{len(cuts)} segments, all exact")


if __name__ == "__main__":
    build()

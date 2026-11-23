#!/usr/bin/env python3
"""ACI Eid Reel (60s) — assemble the Flow clips + song into one vertical MP4.

Usage (run from this folder):
    python3 make_reel.py
Needs: ffmpeg on PATH. Put the 7 Flow clips in ./clips with the names below.
Output: ACI_Eid_Reel_60s.mp4 (720x1280, 30fps, song audio only)
"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CLIPS = os.path.join(HERE, "clips")
SONG = os.path.join(HERE, "song_60s.mp3")
OUT = os.path.join(HERE, "ACI_Eid_Reel_60s.mp4")
W, H, FPS = 720, 1280, 30

# Edit decision list: (file name in ./clips, start sec in source, length sec)
# Reel time is shown in the comment. Total = 60s.
EDL = [
    ("01_office_late.mp4",       3.0,  7.0),  # 0:00-0:07  hook: alone in office, mother's photo on phone
    ("02_lemon_drink.mp4",       2.0,  8.0),  # 0:07-0:15  slow tired -> drinks ACI Lemon
    ("03_bus_rush.mp4",          0.0, 10.0),  # 0:15-0:25  energy back, finishes work, catches bus
    ("04_journey_home.mp4",      0.0, 10.0),  # 0:25-0:35  night coach -> dawn, mother at the door
    ("05_orange_for_mother.mp4", 3.0,  7.0),  # 0:35-0:42  tired mother in kitchen -> ACI Orange
    ("06_cooking_together.mp4",  0.0,  8.0),  # 0:42-0:50  mother sips, cooking together
    ("07_family_packshot.mp4",   0.0, 10.0),  # 0:50-1:00  family Eid table -> both bottles
]
END_TEXT = "BODY FLUID RECOVERY"   # from the bottle label; replace with the client's tagline if they give one
END_TEXT_FROM = 56.0               # seconds into the reel
FONT = ""                          # optional: path to a .ttf (e.g. a bold sans font); empty = ffmpeg default

def run(cmd):
    print(" ".join(cmd)); subprocess.run(cmd, check=True)

def main():
    missing = [f for f, _, _ in EDL if not os.path.exists(os.path.join(CLIPS, f))]
    if missing:
        sys.exit("Missing clips in ./clips: " + ", ".join(missing))
    parts = []
    for i, (f, ss, dur) in enumerate(EDL):
        p = os.path.join(HERE, f"_part{i}.mp4")
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(ss), "-t", str(dur), "-i", os.path.join(CLIPS, f),
             "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1",
             "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", p])
        parts.append(p)
    lst = os.path.join(HERE, "_list.txt")
    with open(lst, "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    total = sum(d for _, _, d in EDL)
    font = f":fontfile='{FONT}'" if FONT else ""
    vf = (f"drawtext=text='{END_TEXT}'{font}:fontcolor=white:fontsize=46:borderw=3:bordercolor=black@0.6:"
          f"x=(w-text_w)/2:y=h*0.80:enable='gte(t,{END_TEXT_FROM})':alpha='min(1,(t-{END_TEXT_FROM})/0.6)',"
          f"fade=t=out:st={total-1.0}:d=1.0")
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", SONG,
         "-vf", vf, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-t", str(total), "-movflags", "+faststart", OUT])
    for p in parts + [lst]:
        os.remove(p)
    print("Done:", OUT)

if __name__ == "__main__":
    main()

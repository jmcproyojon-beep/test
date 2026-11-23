#!/usr/bin/env python3
"""ACI Eid Reel (60 s), built from the client's README and make_reel.py.

The client sent the seven Flow clips already joined into one file (in/reel.mp4, 360x640, 63.9 s), so the README's
EDL is applied to where each clip sits inside that file. Clip boundaries in the joined file (scene detection):
  01 office 0-10 · 02 lemon 10-20 · 03 bus 20-30 · 04 journey home 30-40 · 05 orange for mother 40-50
  (no "cooking together" clip; 50.05-53.92 is the two bottles in front of the family) · 07 family packshot 53.92-63.88
Song: the README's song_60s.mp3 = the full song 0:25-1:25, fade in 0.8 s, fade out from 57 s over 3 s.
Text: END_TEXT from the bottle label at 56 s, fade to black over the last second (as make_reel.py).

    python3 make_reel_from_reel.py            -> out/ACI_Eid_Reel_60s.mp4 (1080x1920, 30 fps, song only)
"""
import os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
SRC, SONG_FULL = os.path.join(HERE, "in/reel.mp4"), os.path.join(HERE, "in/song_full.mp3")
OUT_DIR = os.path.join(HERE, "out"); os.makedirs(OUT_DIR, exist_ok=True)
SONG = os.path.join(OUT_DIR, "song_60s.mp3")
OUT = os.path.join(OUT_DIR, "ACI_Eid_Reel_60s.mp4")
W, H, FPS = 1080, 1920, 30          # README: "1080x1920 এক্সপোর্ট করো" -> W, H = 1080, 1920
SONG_START, SONG_LEN = 25.0, 60.0   # README: song_60s.mp3 = 0:25-1:25

# (start in the joined reel, length) per README clip; comments give the README's own line for that clip
EDL = [
    (1.85, 8.15),    # 01 office late      README 3-10 (7 s); starts 1.15 s earlier to keep the total at 60 s
    (12.0, 8.0),     # 02 lemon drink      README 2-10 (8 s)  -> joined 12-20
    (20.0, 10.0),    # 03 bus rush         README 0-10        -> joined 20-30
    (30.0, 10.0),    # 04 journey home     README 0-10        -> joined 30-40 (mother at the door)
    (40.0, 10.0),    # 05 orange for mother README 3-10; from 0 here, since 06 is missing (keeps the hug at the door)
    (50.05, 3.87),   # 06 cooking together: not in the file; this slot = the two bottles in front of the family
    (53.92, 9.96),   # 07 family packshot  README 0-10        -> joined 53.92-63.88
]
END_TEXT = "BODY FLUID RECOVERY"
END_TEXT_FROM = 56.0
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"

def run(cmd): print(" ".join(cmd)); subprocess.run(cmd, check=True)

def main():
    run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-ss", str(SONG_START), "-t", str(SONG_LEN), "-i", SONG_FULL,
         "-af", "afade=t=in:d=0.8,afade=t=out:st=57:d=3", SONG])
    parts = []
    for i, (ss, dur) in enumerate(EDL):
        p = os.path.join(OUT_DIR, f"_part{i}.mp4")
        # 360p source -> 1080x1920: lanczos upscale, a light sharpen
        run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-ss", str(ss), "-t", str(dur), "-i", SRC,
             "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},unsharp=5:5:0.7:5:5:0,fps={FPS},setsar=1",
             "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", p])
        parts.append(p)
    lst = os.path.join(OUT_DIR, "_list.txt")
    with open(lst, "w") as fh: fh.writelines(f"file '{p}'\n" for p in parts)
    total = round(sum(d for _, d in EDL), 3)
    fs = int(46 * W / 720)   # make_reel.py's 46 px at 720 wide, scaled
    vf = (f"drawtext=text='{END_TEXT}':fontfile='{FONT}':fontcolor=white:fontsize={fs}:borderw=4:bordercolor=black@0.6:"
          f"x=(w-text_w)/2:y=h*0.80:enable='gte(t,{END_TEXT_FROM})':alpha='min(1,(t-{END_TEXT_FROM})/0.6)',"
          f"fade=t=out:st={total - 1.0}:d=1.0")
    run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", SONG,
         "-vf", vf, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-t", str(total), "-movflags", "+faststart", OUT])
    for p in parts + [lst]: os.remove(p)
    print("Done:", OUT, "total", total)

if __name__ == "__main__":
    main()

"""Lay the untouched master under the silent Remotion render.

    python3 -I client-builds/nikhoj-mv/mux.py

Remotion renders picture only (--muted); the song is added here so it is
encoded once from the master, never round-tripped through the browser.

The picture is 10535 frames (351.167 s) against a 351.168 s master. The last
frame is held a little past the end and the output is cut with -t at the
song's length — NOT -shortest, which with a filtergraph stops at the shortest
INPUT and would clip the song's tail.
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PIC = ROOT/"projects/nikhoj-mv/renders/picture.mp4"
SONG = ROOT/"projects/nikhoj-songbad/assets/audio/song.mp3"
OUT = ROOT/"projects/nikhoj-mv/renders/nikhoj-songbad-animated-mv.mp4"


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)


song, pic = dur(SONG), dur(PIC)
pad = max(0.0, song - pic) + 0.2
print(f"song {song:.3f}s  picture {pic:.3f}s  -> hold last frame {pad:.3f}s")
subprocess.run(["ffmpeg", "-v", "error", "-stats", "-i", str(PIC), "-i", str(SONG),
                "-filter_complex", f"[0:v]tpad=stop_mode=clone:stop_duration={pad:.3f}[v]",
                "-map", "[v]", "-map", "1:a",
                "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p",
                "-maxrate", "12000k", "-bufsize", "24000k",
                "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
                "-movflags", "+faststart", "-t", f"{song:.3f}", str(OUT), "-y"], check=True)
print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size / 1048576:.1f} MB, {dur(OUT):.3f}s)")

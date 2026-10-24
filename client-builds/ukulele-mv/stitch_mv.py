"""Concat the cuts, lay the song under them, fade out, write delivery."""
import json, subprocess
from pathlib import Path

P = Path("projects/ukulele-mv")
SEG, R = P/"assets/segments", P/"renders"; R.mkdir(parents=True, exist_ok=True)
SONG = P/"assets/audio/song.wav"
FPS = 24

segs = sorted(SEG.glob("[0-9][0-9][0-9].mp4"))
plan = json.load(open(P/"assets/edit-plan.json"))
total = plan["cuts"][-1]["t1"]

lst = P/"assets/concat.txt"
lst.write_text("".join(f"file '{s.resolve()}'\n" for s in segs))

# hard cuts: concat demuxer, no re-encode of the picture content itself
subprocess.run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-r", str(FPS),
                "-pix_fmt", "yuv420p", "-an", str(R/"cut-silent.mp4"), "-y"], check=True)

vdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                             "-of", "csv=p=0", str(R/"cut-silent.mp4")],
                            capture_output=True, text=True).stdout.strip())
print(f"{len(segs)} segments -> {vdur:.2f}s of picture (plan said {total:.2f}s)")

# The song is the master. The picture ends on the last beat, a fraction before
# the song does, so hold the final frame to cover the gap rather than letting
# -shortest clip the music.
sdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                             "-of", "csv=p=0", str(SONG)],
                            capture_output=True, text=True).stdout.strip())
pad = max(0.0, sdur - vdur)
print(f"song {sdur:.2f}s, holding last frame for {pad:.2f}s")
fade_at = max(0.0, sdur - 4.0)
subprocess.run(["ffmpeg", "-v", "error", "-i", str(R/"cut-silent.mp4"), "-i", str(SONG),
                "-filter_complex",
                f"[0:v]tpad=stop_mode=clone:stop_duration={pad + 0.1:.2f},"
                f"fade=t=in:st=0:d=1.2,fade=t=out:st={fade_at:.2f}:d=4.0[v];"
                f"[1:a]afade=t=in:st=0:d=0.8,afade=t=out:st={fade_at:.2f}:d=4.0,"
                "alimiter=limit=0.97:level=disabled[a]",
                "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-crf", "20", "-preset", "medium",
                "-maxrate", "6000k", "-bufsize", "12000k", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                "-movflags", "+faststart", "-shortest",
                str(R/"ochena-shohor-music-video.mp4"), "-y"], check=True)
(R/"cut-silent.mp4").unlink()
print("final:", R/"ochena-shohor-music-video.mp4")

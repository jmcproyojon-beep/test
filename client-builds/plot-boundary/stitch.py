"""Stitch the plot-promo beats, lay the music bed under them, write delivery."""
import subprocess, glob

SEGDIR = "projects/plot-boundary/assets/segments"
R = "projects/plot-boundary/renders"
MUSIC = "projects/plot-boundary/assets/music-bed.m4a"
XF = 0.35

segs = sorted(p for p in glob.glob(f"{SEGDIR}/*.mp4") if "raw-" not in p)
durs, inputs = [], []
for s in segs:
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                              "-of", "csv=p=0", s], capture_output=True, text=True).stdout.strip())
    durs.append(d); inputs += ["-i", s]
    print(f"  {s.split('/')[-1]:14s} {d:5.2f}s")

total = sum(durs) - XF * (len(segs) - 1)
chain, offset, cur = "", 0.0, "[0:v]"
for i in range(1, len(segs)):
    offset += durs[i - 1] - XF
    out = f"[x{i}]" if i < len(segs) - 1 else "[vout]"
    chain += f"{cur}[{i}:v]xfade=transition=fade:duration={XF}:offset={offset:.3f}{out};"
    cur = out

subprocess.run(["ffmpeg", "-v", "error", *inputs, "-filter_complex", chain.rstrip(";"),
                "-map", "[vout]", "-c:v", "libx264", "-crf", "21", "-preset", "medium",
                "-pix_fmt", "yuv420p", f"{R}/cut-silent.mp4", "-y"], check=True)

# music bed: normalise, trim to the cut, fade in and out
fade_out = max(0.0, total - 2.5)
subprocess.run(["ffmpeg", "-v", "error", "-i", "projects/plot-boundary/assets/audio/music-source.wav",
                "-af", (f"aresample=48000,loudnorm=I=-16:LRA=11:TP=-1.5,apad,atrim=0:{total:.2f},"
                        f"asetpts=N/SR/TB,afade=t=in:st=0:d=1.2,afade=t=out:st={fade_out:.2f}:d=2.5,"
                        "alimiter=limit=0.95:level=disabled"),
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", MUSIC, "-y"], check=True)

subprocess.run(["ffmpeg", "-v", "error", "-i", f"{R}/cut-silent.mp4", "-i", MUSIC,
                "-map", "0:v", "-map", "1:a",
                "-c:v", "libx264", "-crf", "25", "-preset", "medium",
                "-maxrate", "3200k", "-bufsize", "6400k", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-shortest",
                f"{R}/plot-boundary-promo.mp4", "-y"], check=True)
subprocess.run(["rm", "-f", f"{R}/cut-silent.mp4"], check=True)
print("final:", round(total, 2), "s")

"""Stitch the finished beats, mux the ambience bed and write the delivery file.

Run after build_promo.py / fix_stills.py. Output is capped at ~3 Mbps so a
42-second cut stays under WhatsApp's 16 MB attachment limit.
"""
import subprocess, glob

SEGDIR = "projects/purbachal-house/assets/segments"
R = "projects/purbachal-house/renders"
BED = "projects/purbachal-house/assets/audio/bed.m4a"
XF = 0.35

segs = sorted(p for p in glob.glob(f"{SEGDIR}/*.mp4") if "raw-" not in p)
durs, inputs = [], []
for s in segs:
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                              "-of", "csv=p=0", s], capture_output=True, text=True).stdout.strip())
    durs.append(d)
    inputs += ["-i", s]
    print(f"  {s.split('/')[-1]:16s} {d:5.2f}s")

chain, offset, cur = "", 0.0, "[0:v]"
for i in range(1, len(segs)):
    offset += durs[i - 1] - XF
    out = f"[x{i}]" if i < len(segs) - 1 else "[vout]"
    chain += f"{cur}[{i}:v]xfade=transition=fade:duration={XF}:offset={offset:.3f}{out};"
    cur = out

subprocess.run(["ffmpeg", "-v", "error", *inputs, "-filter_complex", chain.rstrip(";"),
                "-map", "[vout]", "-c:v", "libx264", "-crf", "21", "-preset", "medium",
                "-pix_fmt", "yuv420p", f"{R}/cut-silent.mp4", "-y"], check=True)

subprocess.run(["ffmpeg", "-v", "error", "-i", f"{R}/cut-silent.mp4", "-i", BED,
                "-map", "0:v", "-map", "1:a",
                "-c:v", "libx264", "-crf", "25", "-preset", "medium",
                "-maxrate", "3200k", "-bufsize", "6400k", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-shortest",
                f"{R}/purbachal-house-promo.mp4", "-y"], check=True)

subprocess.run(["rm", "-f", f"{R}/cut-silent.mp4"], check=True)
print("final:", round(sum(durs) - XF * (len(segs) - 1), 2), "s")

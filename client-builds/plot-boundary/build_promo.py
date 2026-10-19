"""Build the walled-plot promo beats: trim, stabilise, brand, caption."""
import subprocess
from pathlib import Path

P = Path("projects/plot-boundary")
VID, IMG, OV = P/"assets/video", P/"assets/images", P/"assets/overlays"
SEG = P/"assets/segments"; SEG.mkdir(parents=True, exist_ok=True)
TRF = Path("/tmp/claude-0/-home-user-test/48ded2f8-cad5-5ab6-ba78-4d602f6b1eff/scratchpad/plot/trf")
TRF.mkdir(parents=True, exist_ok=True)
FPS = 30

# name, kind, source, in, out, overlay
BEATS = [
    ("01-hero",   "photo", "photo-01.jpg", None,  4.0, "title.png"),
    ("02-wall",   "video", "clip-a.mp4",    0.6,  5.0, "lt-01-wall.png"),
    ("03-build",  "video", "clip-a.mp4",    5.2,  9.8, "lt-02-build.png"),
    ("04-extent", "photo", "photo-02.jpg", None,  4.0, "lt-07-plot.png"),
    ("05-road",   "video", "clip-b.mp4",    1.0,  6.0, "lt-03-road.png"),
    ("06-gate",   "video", "clip-b.mp4",    6.5, 11.5, "lt-04-gate.png"),
    ("07-green",  "video", "clip-b.mp4",   12.5, 17.5, "lt-05-green.png"),
    ("08-calm",   "video", "clip-b.mp4",   17.6, 21.2, "lt-06-calm.png"),
]

def ov_chain(dur, ov_idx, bar_idx):
    fo = max(0.0, dur - 0.75)
    return (f"[{ov_idx}]format=rgba,fade=t=in:st=0.25:d=0.45:alpha=1,fade=t=out:st={fo:.2f}:d=0.45:alpha=1[ov];"
            f"[{bar_idx}]format=rgba,fade=t=in:st=0.15:d=0.4:alpha=1,fade=t=out:st={fo:.2f}:d=0.45:alpha=1[bar];"
            f"[base][ov]overlay=0:0[t1];[t1][bar]overlay=0:0,format=yuv420p[vout]")

for name, kind, src, a, b, ovf in BEATS:
    out = SEG/f"{name}.mp4"
    dur = b if kind == "photo" else round(b - a, 2)
    n = int(dur * FPS)
    if kind == "photo":
        base = (f"scale=2200:-2:flags=lanczos,"
                f"zoompan=z='if(eq(on,0),1.12,max(1.0,zoom-0.00040))':d={n}:"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},"
                f"eq=contrast=1.05:saturation=1.07:brightness=0.01[base]")
        cmd = ["ffmpeg", "-v", "error", "-loop", "1", "-i", str(IMG/src),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/ovf),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/"brand-bar.png"),
               "-filter_complex", base + ";" + ov_chain(dur, 1, 2),
               "-map", "[vout]", "-frames:v", str(n), "-r", str(FPS),
               "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-an", str(out), "-y"]
    else:
        raw = SEG/f"raw-{name}.mp4"
        if not raw.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", str(VID/src),
                            "-r", str(FPS), "-c:v", "libx264", "-crf", "16", "-preset", "fast",
                            "-an", str(raw), "-y"], check=True)
        trf = TRF/f"{name}.trf"
        if not trf.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-i", str(raw),
                            "-vf", f"vidstabdetect=shakiness=9:accuracy=15:result={trf}",
                            "-f", "null", "-"], check=True)
        base = (f"vidstabtransform=input={trf}:smoothing=28:zoom=1:optzoom=1:interpol=bilinear,"
                "unsharp=5:5:0.4,"
                "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,"
                "eq=contrast=1.06:saturation=1.08:brightness=0.015[base]")
        cmd = ["ffmpeg", "-v", "error", "-i", str(raw),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/ovf),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/"brand-bar.png"),
               "-filter_complex", base + ";" + ov_chain(dur, 1, 2),
               "-map", "[vout]", "-frames:v", str(n), "-r", str(FPS),
               "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-an", str(out), "-y"]
    subprocess.run(cmd, check=True)
    print(f"{name:10s} {dur:4.1f}s  {kind}")

# end card — zoompan emits d frames per input frame, so cap the output
subprocess.run(["ffmpeg", "-v", "error", "-loop", "1", "-i", str(OV/"card-end.png"), "-r", str(FPS),
                "-vf", (f"zoompan=z='min(1.04,1.0+0.00018*on)':d=126:x='iw/2-(iw/zoom/2)':"
                        f"y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},fade=t=in:st=0:d=0.4,format=yuv420p"),
                "-frames:v", "126", "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-an",
                str(SEG/"09-end.mp4"), "-y"], check=True)
print("09-end      4.2s  card")

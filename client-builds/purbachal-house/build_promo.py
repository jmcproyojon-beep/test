"""Build the Purbachal house promo: stabilised video beats + photos + brand overlays."""
import subprocess, os
from pathlib import Path

P = Path("projects/purbachal-house")
SRC = P / "assets/video/source.mp4"
IMG = P / "assets/images"
OV = P / "assets/overlays"
SEG = P / "assets/segments"; SEG.mkdir(parents=True, exist_ok=True)
TRF = Path("/tmp/claude-0/-home-user-test/48ded2f8-cad5-5ab6-ba78-4d602f6b1eff/scratchpad/ph/trf")
TRF.mkdir(parents=True, exist_ok=True)
FPS = 30

# name, kind, source, in, out, overlay png
BEATS = [
    ("01-hero",    "photo", "photo-01.jpg",  None, 4.0, "title.png"),
    ("02-wall",    "video", None,            4.0,  9.0, "lt-01-gate.png"),
    ("03-gate",    "video", None,           11.5, 15.5, "lt-08-gate2.png"),
    ("04-yard",    "video", None,           17.5, 22.0, "lt-02-yard.png"),
    ("05-house",   "photo", "photo-02.jpg",  None, 4.0, "lt-03-house.png"),
    ("06-parking", "video", None,           24.0, 29.0, "lt-04-parking.png"),
    ("07-entry",   "video", None,           33.0, 37.0, "lt-05-entry.png"),
    ("08-living",  "video", None,           40.0, 45.5, "lt-06-living.png"),
    ("09-stair",   "video", None,           50.0, 55.0, "lt-07-stair.png"),
]

def overlay_chain(dur, ov_idx, bar_idx):
    """Fade the lower third and brand bar in and out over the base video."""
    fo = max(0.0, dur - 0.75)
    return (f"[{ov_idx}]format=rgba,fade=t=in:st=0.25:d=0.45:alpha=1,"
            f"fade=t=out:st={fo:.2f}:d=0.45:alpha=1[ov];"
            f"[{bar_idx}]format=rgba,fade=t=in:st=0.15:d=0.4:alpha=1,"
            f"fade=t=out:st={fo:.2f}:d=0.45:alpha=1[bar];"
            f"[base][ov]overlay=0:0[t1];[t1][bar]overlay=0:0,format=yuv420p[vout]")

for name, kind, img, a, b, ovfile in BEATS:
    out = SEG / f"{name}.mp4"
    dur = b if kind == "photo" else round(b - a, 2)
    n = int(dur * FPS)

    if kind == "photo":
        base = (f"scale=2200:-2:flags=lanczos,"
                f"zoompan=z='if(eq(on,0),1.12,max(1.0,zoom-0.00040))':d={n}:"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},"
                f"eq=contrast=1.05:saturation=1.06:brightness=0.01[base]")
        cmd = ["ffmpeg", "-v", "error", "-loop", "1", "-t", str(dur), "-i", str(IMG / img),
               "-loop", "1", "-framerate", str(FPS), "-i", str(OV / ovfile),
               "-loop", "1", "-framerate", str(FPS), "-i", str(OV / "brand-bar.png"),
               "-filter_complex", base + ";" + overlay_chain(dur, 1, 2),
               "-map", "[vout]", "-frames:v", str(n), "-r", str(FPS),
               "-c:v", "libx264", "-crf", "19", "-preset", "slow", "-an", str(out), "-y"]
        subprocess.run(cmd, check=True)
    else:
        raw = SEG / f"raw-{name}.mp4"
        if not raw.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", str(SRC),
                            "-r", str(FPS), "-c:v", "libx264", "-crf", "16", "-preset", "fast",
                            "-an", str(raw), "-y"], check=True)
        trf = TRF / f"{name}.trf"
        if not trf.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-i", str(raw),
                        "-vf", f"vidstabdetect=shakiness=9:accuracy=15:result={trf}",
                        "-f", "null", "-"], check=True)
        base = (f"vidstabtransform=input={trf}:smoothing=28:zoom=1:optzoom=1:interpol=bilinear,"
                "unsharp=5:5:0.4,"
                "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,"
                "eq=contrast=1.06:saturation=1.07:brightness=0.015[base]")
        cmd = ["ffmpeg", "-v", "error", "-i", str(raw),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV / ovfile),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV / "brand-bar.png"),
               "-filter_complex", base + ";" + overlay_chain(dur, 1, 2),
               "-map", "[vout]", "-frames:v", str(n), "-r", str(FPS), "-c:v", "libx264", "-crf", "19",
               "-preset", "slow", "-an", str(out), "-y"]
        subprocess.run(cmd, check=True)
    print(f"{name:12s} {dur:4.1f}s  {kind}")

# end card
subprocess.run(["ffmpeg", "-v", "error", "-loop", "1", "-t", "4.0", "-i", str(OV / "card-end.png"),
                "-r", str(FPS), "-vf",
                f"zoompan=z='min(1.04,1.0+0.00018*on)':d=120:x='iw/2-(iw/zoom/2)':"
                f"y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},fade=t=in:st=0:d=0.4,format=yuv420p",
                # zoompan emits d frames per input frame: cap the output or this runs for minutes
                "-frames:v", "120",
                "-c:v", "libx264", "-crf", "19", "-preset", "slow", "-an",
                str(SEG / "10-end.mp4"), "-y"], check=True)
print("10-end        4.0s  card")

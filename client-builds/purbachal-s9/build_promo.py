"""Sector-9 plot promo: stabilise, frame and brand each beat.

Landscape clips and 4:3 photos are NOT cropped to 9:16 — an open plot loses its
whole point if the sides are cut. They sit full width over a blurred copy of
themselves; only portrait footage is cover-cropped.
"""
import subprocess
from pathlib import Path

P = Path("projects/purbachal-s9")
VID, IMG, OV = P/"assets/video", P/"assets/images", P/"assets/segments"
OV = P/"assets/overlays"
SEG = P/"assets/segments"; SEG.mkdir(parents=True, exist_ok=True)
TRF = Path("/tmp/claude-0/-home-user-test/48ded2f8-cad5-5ab6-ba78-4d602f6b1eff/scratchpad/s9/trf")
TRF.mkdir(parents=True, exist_ok=True)
FPS = 30

# name, kind, source, in, out, overlay, framing
BEATS = [
    ("01-hero",   "photo", "photo-17.jpg", None,  4.0, "title.png",       "fit"),
    ("02-open",   "video", "clip-a.mp4",    4.0,  9.0, "lt-01-open.png",  "fit"),
    ("03-pillar", "video", "clip-a.mp4",   10.0, 15.0, "lt-02-pillar.png","fit"),
    ("04-around", "photo", "photo-20.jpg", None,  3.8, "lt-03-around.png","fit"),
    ("05-path",   "video", "clip-b.mp4",    3.0,  8.0, "lt-04-path.png",  "cover"),
    ("06-green",  "photo", "photo-18.jpg", None,  3.8, "lt-05-green.png", "fit"),
    ("07-road",   "video", "clip-c.mp4",    2.0,  7.0, "lt-06-road.png",  "cover"),
    ("08-light",  "video", "clip-c.mp4",   12.0, 17.0, "lt-07-light.png", "cover"),
]

def ov_chain(dur, ov_idx, bar_idx):
    fo = max(0.0, dur - 0.75)
    return (f"[{ov_idx}]format=rgba,fade=t=in:st=0.25:d=0.45:alpha=1,fade=t=out:st={fo:.2f}:d=0.45:alpha=1[ov];"
            f"[{bar_idx}]format=rgba,fade=t=in:st=0.15:d=0.4:alpha=1,fade=t=out:st={fo:.2f}:d=0.45:alpha=1[bar];"
            f"[base][ov]overlay=0:0[t1];[t1][bar]overlay=0:0,format=yuv420p[vout]")

def frame_chain(mode, pre=""):
    """pre runs before framing (e.g. vidstabtransform)."""
    if mode == "cover":
        return (f"{pre}scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,"
                "crop=1080:1920,eq=contrast=1.06:saturation=1.08:brightness=0.015[base]")
    # fit: full width over a blurred, darkened copy of the same frame
    return (f"{pre}split=2[o][b];"
            "[b]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
            "gblur=sigma=38,eq=brightness=-0.16:saturation=0.45[bg];"
            "[o]scale=1080:-2:flags=lanczos,eq=contrast=1.06:saturation=1.08:brightness=0.015[fg];"
            "[bg][fg]overlay=0:(H-h)/2[base]")

for name, kind, src, a, b, ovf, mode in BEATS:
    out = SEG/f"{name}.mp4"
    dur = b if kind == "photo" else round(b - a, 2)
    n = int(dur * FPS)
    if kind == "photo":
        zoom = (f"zoompan=z='if(eq(on,0),1.10,max(1.0,zoom-0.00035))':d={n}:"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1600x1200:fps={FPS},")
        base = frame_chain(mode, f"scale=2400:-2:flags=lanczos,{zoom}")
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
        pre = (f"vidstabtransform=input={trf}:smoothing=28:zoom=1:optzoom=1:interpol=bilinear,"
               "unsharp=5:5:0.4,")
        base = frame_chain(mode, pre)
        cmd = ["ffmpeg", "-v", "error", "-i", str(raw),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/ovf),
               "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/"brand-bar.png"),
               "-filter_complex", base + ";" + ov_chain(dur, 1, 2),
               "-map", "[vout]", "-frames:v", str(n), "-r", str(FPS),
               "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-an", str(out), "-y"]
    subprocess.run(cmd, check=True)
    print(f"{name:10s} {dur:4.1f}s  {kind}/{mode}")

for cardname, seg, secs in (("card-spec.png", "09-spec", 3.6), ("card-end.png", "10-end", 4.2)):
    n = int(secs * FPS)
    subprocess.run(["ffmpeg", "-v", "error", "-loop", "1", "-i", str(OV/cardname), "-r", str(FPS),
                    "-vf", (f"zoompan=z='min(1.04,1.0+0.00018*on)':d={n}:x='iw/2-(iw/zoom/2)':"
                            f"y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},fade=t=in:st=0:d=0.4,format=yuv420p"),
                    "-frames:v", str(n),   # zoompan emits d frames per input frame — cap the output
                    "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-an",
                    str(SEG/f"{seg}.mp4"), "-y"], check=True)
    print(f"{seg:10s} {secs:4.1f}s  card")

"""Block-K apartment promo: trim, stabilise, frame and brand each beat.

Every source clip here is 480x854 portrait — the same 9:16 the delivery is in —
so all beats cover-crop to 1080x1920 and nothing is lost at the sides.
"""
import subprocess
from pathlib import Path

P = Path("projects/bashundhara-k12")
VID, IMG = P/"assets/video", P/"assets/images"
OV = P/"assets/overlays"
SEG = P/"assets/segments"; SEG.mkdir(parents=True, exist_ok=True)
TRF = Path("/tmp/claude-0/-home-user-test/48ded2f8-cad5-5ab6-ba78-4d602f6b1eff/scratchpad/k12/trf")
TRF.mkdir(parents=True, exist_ok=True)
FPS = 30

# WhatsApp hands these over as variable-frame-rate files, on which ffmpeg's
# timestamps are not trustworthy enough to cut against: a window picked off a
# preview frame lands a second or more away in the trim, silently putting the
# beat on a blank wall. Normalising each source to constant 30fps once, up
# front, makes previewing and cutting agree.
SOURCES = ("clip-a.mp4", "clip-b.mp4", "clip-c.mp4")
for src in SOURCES:
    cfr = VID/f"cfr-{src}"
    if not cfr.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(VID/src), "-vsync", "cfr",
                        "-r", str(FPS), "-c:v", "libx264", "-crf", "16", "-preset", "fast",
                        "-an", str(cfr), "-y"], check=True)
        print("normalised", cfr.name)

# name, source, in, out, overlay
#
# clip-b is a brisk handheld walkthrough: most subjects hold frame for only two
# or three seconds before the camera pans off. Every window below was read off a
# whole-clip `fps=1,tile` contact sheet of the normalised file, so the beats are
# short by design — stretching one to a comfortable 4.5s lands on a blank wall.
BEATS = [
    ("01-hero",    "cfr-clip-a.mp4",  2.0,   6.0, "title.png"),
    ("02-gate",    "cfr-clip-a.mp4", 11.0,  15.0, "lt-01-gate.png"),
    ("03-park",    "cfr-clip-c.mp4",  1.0,   5.0, "lt-02-park.png"),
    ("04-lift",    "cfr-clip-b.mp4",  0.2,   3.0, "lt-03-lift.png"),
    ("05-stair",   "cfr-clip-b.mp4",  4.0,   7.2, "lt-04-stair.png"),
    ("06-living",  "cfr-clip-b.mp4", 96.8, 100.2, "lt-05-living.png"),
    ("07-room",    "cfr-clip-b.mp4", 14.0,  17.5, "lt-06-room.png"),
    ("08-window",  "cfr-clip-b.mp4", 19.2,  22.2, "lt-07-window.png"),
    ("09-kitchen", "cfr-clip-b.mp4", 68.5,  72.5, "lt-08-kitchen.png"),
    ("10-bath",    "cfr-clip-b.mp4", 38.0,  41.5, "lt-09-bath.png"),
    ("11-balcony", "cfr-clip-b.mp4", 27.0,  30.5, "lt-10-balcony.png"),
]

def ov_chain(dur, ov_idx, bar_idx):
    """Captions hold a little longer than the house default — on a 3s beat the
    old 0.45s fades left barely a second of fully opaque Bengali to read."""
    fo = max(0.0, dur - 0.60)
    return (f"[{ov_idx}]format=rgba,fade=t=in:st=0.20:d=0.35:alpha=1,fade=t=out:st={fo:.2f}:d=0.40:alpha=1[ov];"
            f"[{bar_idx}]format=rgba,fade=t=in:st=0.12:d=0.30:alpha=1,fade=t=out:st={fo:.2f}:d=0.40:alpha=1[bar];"
            f"[base][ov]overlay=0:0[t1];[t1][bar]overlay=0:0,format=yuv420p[vout]")

for name, src, a, b, ovf in BEATS:
    out = SEG/f"{name}.mp4"
    dur = round(b - a, 2)
    n = int(dur * FPS)
    raw = SEG/f"raw-{name}.mp4"
    if not raw.exists():
        # -ss AFTER -i: these are variable-frame-rate phone captures, and input
        # seeking lands a second or more off on them, which silently shifts a
        # beat onto the wrong subject. Decoding from the top is exact.
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(VID/src),
                        "-ss", str(a), "-t", str(dur),
                        "-r", str(FPS), "-c:v", "libx264", "-crf", "16", "-preset", "fast",
                        "-an", str(raw), "-y"], check=True)
    trf = TRF/f"{name}.trf"
    if not trf.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(raw),
                        "-vf", f"vidstabdetect=shakiness=9:accuracy=15:result={trf}",
                        "-f", "null", "-"], check=True)
    # optzoom=1 picks ONE zoom for the whole beat, and on a deliberate pan or
    # tilt that zoom is large enough to crop the subject out of frame entirely —
    # the staircase beat came back as blank wall. Adaptive zoom plus lighter
    # smoothing steadies the handheld wobble while keeping the framing shot.
    base = ("vidstabtransform=input=" + str(trf) + ":smoothing=10:optzoom=2:interpol=bilinear,"
            "unsharp=5:5:0.4,"
            "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,"
            "crop=1080:1920,eq=contrast=1.06:saturation=1.08:brightness=0.015[base]")
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(raw),
                    "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/ovf),
                    "-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", str(OV/"brand-bar.png"),
                    "-filter_complex", base + ";" + ov_chain(dur, 1, 2),
                    "-map", "[vout]", "-frames:v", str(n), "-r", str(FPS),
                    "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-an", str(out), "-y"],
                   check=True)
    print(f"{name:10s} {dur:4.1f}s  {src}")

for cardname, seg, secs in (("card-spec.png", "12-spec", 3.6), ("card-end.png", "13-end", 4.2)):
    n = int(secs * FPS)
    subprocess.run(["ffmpeg", "-v", "error", "-loop", "1", "-i", str(OV/cardname), "-r", str(FPS),
                    "-vf", (f"zoompan=z='min(1.04,1.0+0.00018*on)':d={n}:x='iw/2-(iw/zoom/2)':"
                            f"y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},fade=t=in:st=0:d=0.4,format=yuv420p"),
                    "-frames:v", str(n),   # zoompan emits d frames per input frame — cap the output
                    "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-an",
                    str(SEG/f"{seg}.mp4"), "-y"], check=True)
    print(f"{seg:10s} {secs:4.1f}s  card")

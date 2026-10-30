"""Render the moving background for the lyric video, from the cover art alone.

Nothing is invented: the only picture in this video is the artist's own cover.
It is used twice — a heavily blurred, drifting copy that fills the frame, and
(in compose.py) the sharp artwork itself during the instrumental passages.

The grade follows the song's own structure, interpolated between keyframes so
the look slides from cold and desaturated in the verses to hot in the choruses
without a visible step.
"""
import subprocess
from pathlib import Path

P = Path("projects/nikhoj-songbad")
COVER = P/"assets/images/cover.png"
OUT = P/"assets/bg.mp4"
W, H, FPS = 1920, 1080, 30
DUR = 351.17

# t, saturation, brightness, contrast — read off the section analysis
KEYS = [
    (0.0,   0.44, -0.145, 1.04),   # intro, mirror talking in the dark
    (27.0,  0.55, -0.125, 1.05),   # instrumental
    (59.0,  0.51, -0.130, 1.05),   # verse 1
    (81.0,  0.72, -0.095, 1.08),   # pre-chorus lifts
    (96.5,  1.04, -0.040, 1.12),   # CHORUS
    (139.0, 1.14, -0.020, 1.14),   # drop
    (157.0, 0.51, -0.130, 1.05),   # verse 2
    (194.0, 0.72, -0.095, 1.08),
    (209.0, 1.04, -0.040, 1.12),   # chorus 2
    (238.0, 0.62, -0.120, 1.06),
    (247.0, 0.77, -0.085, 1.07),   # bridge, warm and close
    (277.0, 0.86, -0.070, 1.09),   # final build
    (288.0, 1.18, -0.010, 1.15),   # FINAL CHORUS, hottest
    (330.0, 0.63, -0.105, 1.05),   # outro settles
    (351.2, 0.53, -0.135, 1.04),
]


def lerp_expr(idx):
    """Piecewise-linear ffmpeg expression over t through the keyframes."""
    expr = f"{KEYS[-1][idx]:.4f}"
    for (t0, *a), (t1, *b) in zip(KEYS, KEYS[1:]):
        v0, v1 = a[idx - 1], b[idx - 1]
        span = t1 - t0
        seg = f"({v0:.4f}+({v1 - v0:.4f})*(t-{t0:.2f})/{span:.2f})"
        expr = f"if(lt(t,{t1:.2f}),{seg},{expr})"
    return expr


def build():
    # Scale the square cover well past frame size so a slow drifting crop has
    # somewhere to travel, then blur it down into a bed for the type.
    # Biased right and tightened: drifting too far left parks the cover's own
    # title block behind the lyrics, and even blurred its red reads as text.
    zoom = (f"scale=2700:2700:flags=lanczos,"
            f"crop={W}:{H}:"
            f"x='(iw-{W})/2 + 80 + 150*sin(t/47)':"
            f"y='(ih-{H})/2 - 180 + 150*sin(t/61)'")
    grade = (f"eq=eval=frame:saturation='{lerp_expr(1)}':"
             f"brightness='{lerp_expr(2)}':contrast='{lerp_expr(3)}'")
    # sigma 58, not 34: at 34 the artwork's lettering stays legible behind the
    # lyrics. This has to read as colour and light, not as a second picture.
    chain = (f"{zoom},gblur=sigma=58,{grade},"
             # a cool wash so the warm artwork reads as night, and a vignette
             "colorbalance=rs=-0.06:gs=-0.02:bs=0.10:bh=-0.04,"
             "vignette=angle=PI/4.0:mode=forward,"
             "noise=alls=4:allf=t+u,format=yuv420p")

    cmd = ["ffmpeg", "-v", "error", "-stats",
           "-loop", "1", "-framerate", str(FPS), "-t", f"{DUR:.2f}", "-i", str(COVER),
           "-vf", chain, "-frames:v", str(int(DUR * FPS)), "-r", str(FPS),
           "-c:v", "libx264", "-crf", "20", "-preset", "veryfast",
           "-pix_fmt", "yuv420p", "-an", str(OUT), "-y"]
    subprocess.run(cmd, check=True)
    print("wrote", OUT)


if __name__ == "__main__":
    build()

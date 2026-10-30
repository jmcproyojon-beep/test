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
    """Piecewise-linear ffmpeg expression over t through the keyframes.

    Built back to front. Each wrap becomes the OUTERMOST test, so the pairs
    must be added latest-first for the earliest boundary to end up outside.
    Building it forwards leaves `lt(t,<end of song>)` outermost, which is true
    at every t, so the whole song gets the final segment's slope extrapolated
    backwards — at t=5 that asked for saturation 2.16 and brightness +0.36
    instead of 0.46 and -0.14, and rendered a blown-out yellow frame.
    """
    expr = f"{KEYS[-1][idx]:.4f}"
    for (t0, *a), (t1, *b) in reversed(list(zip(KEYS, KEYS[1:]))):
        v0, v1 = a[idx - 1], b[idx - 1]
        span = t1 - t0
        seg = f"({v0:.4f}+({v1 - v0:.4f})*(t-{t0:.2f})/{span:.2f})"
        expr = f"if(lt(t,{t1:.2f}),{seg},{expr})"
    return expr


def _check_expressions():
    """Evaluate what we hand ffmpeg and compare it with the intended curve.

    A wrong grade expression still renders happily; it just looks wrong. So
    this is checked, not eyeballed.
    """
    def ev(expr, t):
        return eval(expr.replace("if(", "IF(").replace("lt(", "LT("),
                    {"IF": lambda c, a, b: a if c else b,
                     "LT": lambda a, b: a < b, "t": t})

    def intended(t, i):
        for k0, k1 in zip(KEYS, KEYS[1:]):
            if k0[0] <= t < k1[0]:
                return k0[i] + (k1[i] - k0[i]) * (t - k0[0]) / (k1[0] - k0[0])
        return KEYS[-1][i]

    for idx, name in ((1, "saturation"), (2, "brightness"), (3, "contrast")):
        expr = lerp_expr(idx)
        for t in (0.0, 5.0, 62.0, 110.0, 200.0, 300.0, 345.0, 351.0):
            got, want = ev(expr, t), intended(t, idx)
            if abs(got - want) > 1e-6:
                raise SystemExit(f"{name} expression wrong at t={t}: "
                                 f"{got:.4f}, want {want:.4f}")


def build():
    _check_expressions()
    # Scale the square cover well past frame size so a slow drifting crop has
    # somewhere to travel, then blur it down into a bed for the type.
    # Drifting around the whole square cover does not work: its left edge
    # carries the title, the credits and the wall graffiti top to bottom, so
    # some lettering is always in frame and even heavily blurred its red reads
    # as text behind the lyrics. Take the one text-free part of the artwork
    # instead — the figure watching the sunset over the city, which is already
    # 16:9 — and drift inside that.
    zoom = (f"crop=585:330:430:585,"
            f"scale=2560:-2:flags=lanczos,"
            f"crop={W}:{H}:"
            f"x='(iw-{W})/2 + 230*sin(t/53)':"
            f"y='(ih-{H})/2 + 120*sin(t/41)'")
    grade = (f"eq=eval=frame:saturation='{lerp_expr(1)}':"
             f"brightness='{lerp_expr(2)}':contrast='{lerp_expr(3)}'")
    # With no lettering left to hide, the blur only has to push the picture
    # behind the type — sigma 30 keeps the skyline and the sun readable as
    # shape and glow.
    chain = (f"{zoom},gblur=sigma=30,{grade},"
             # a cool wash so the warm artwork reads as night, and a vignette
             "colorbalance=rs=-0.05:gs=-0.015:bs=0.09:bh=-0.04,"
             "vignette=angle=PI/4.0:mode=forward,"
             "noise=alls=4:allf=t+u,format=yuv420p")

    cmd = ["ffmpeg", "-v", "error", "-stats",
           "-loop", "1", "-framerate", str(FPS), "-t", f"{DUR:.2f}", "-i", str(COVER),
           "-vf", chain, "-frames:v", str(int(DUR * FPS)), "-r", str(FPS),
           "-c:v", "libx264", "-crf", "20", "-preset", "veryfast",
           "-pix_fmt", "yuv420p", "-an", str(OUT), "-y"]
    done = OUT.with_suffix(".done")
    done.unlink(missing_ok=True)
    subprocess.run(cmd, check=True)
    done.write_text("ok")      # a sentinel to wait on: matching the ffmpeg
    print("wrote", OUT)        # command line also matches the watcher itself


if __name__ == "__main__":
    build()

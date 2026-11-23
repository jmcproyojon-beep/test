"""Prepare the client's photos and site videos for "The Green Crest" promo.
    python3.13 -I prep.py <uploads dir> <images dir>  -> remotion-composer/public/gc/
Site clips: the best moments of the WhatsApp videos, stabilised (vidstab, two passes), lightly graded,
upscaled to 1920 wide and muted (the film runs on its own music). The logo gets a transparent background.
"""
import subprocess, sys, shutil
from pathlib import Path
import numpy as np
from PIL import Image

UP, IMG = Path(sys.argv[1]), Path(sys.argv[2])
HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / "remotion-composer/public/gc"
OUT.mkdir(parents=True, exist_ok=True)
TMP = HERE / "clips"; TMP.mkdir(exist_ok=True)

V = {"v1": "fd0d3cf4-WhatsApp_Video_2026-11-23_at_13.01.56.mp4", "v2": "8db1460a-WhatsApp_Video_2026-11-23_at_13.02.01.mp4",
     "v3": "3f951e33-WhatsApp_Video_2026-11-23_at_13.02.06_1.mp4", "v5": "00f9b9a6-WhatsApp_Video_2026-11-23_at_13.02.06.mp4"}
CLIPS = [("site1", "v1", 0.0, 6.0), ("site2", "v1", 20.0, 6.0), ("site3", "v3", 1.0, 6.5), ("site4", "v5", 3.4, 6.0), ("lane", "v2", 0.0, 5.5)]
GRADE = "eq=contrast=1.07:saturation=1.14:brightness=0.01:gamma=0.98"
for name, src, ss, dur in CLIPS:
    inp = str(UP / V[src]); trf = TMP / f"{name}.trf"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(ss), "-t", str(dur), "-i", inp,
                    "-vf", f"vidstabdetect=shakiness=6:accuracy=12:result={trf}", "-f", "null", "-"], check=True)
    vert = src == "v2"
    scale = "scale=-2:1920:flags=lanczos" if vert else "scale=1920:-2:flags=lanczos"
    vf = f"vidstabtransform=input={trf}:zoom=4:smoothing=24:optzoom=0,{GRADE},{scale},unsharp=5:5:0.6,fps=30"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(ss), "-t", str(dur), "-i", inp, "-vf", vf,
                    "-an", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", str(OUT / f"{name}.mp4")], check=True)
    print("clip", name)
# photos: render, three site stills, the logo
for i, name in [(1, "render.jpg"), (2, "photo2.jpg"), (3, "photo3.jpg"), (4, "photo4.jpg")]:
    shutil.copy(IMG / f"{i}.jpg", OUT / name)
logo = np.asarray(Image.open(IMG / "5.jpg").convert("RGB")).astype(float)
dark = 255 - logo.min(axis=2)
alpha = np.clip((dark - 18) / 60, 0, 1)
alpha[:24, :] = 0; alpha[-24:, :] = 0; alpha[:, :24] = 0; alpha[:, -24:] = 0   # the thin frame line around the artwork
ys, xs = np.where(alpha > 0.5)
crop = (slice(max(0, ys.min() - 10), ys.max() + 10), slice(max(0, xs.min() - 10), xs.max() + 10))
rgb = logo[crop]; a = alpha[crop]
out = np.where(a[..., None] > 0.01, (rgb - 255 * (1 - a[..., None])) / np.maximum(a[..., None], 0.01), rgb)
Image.fromarray(np.dstack([np.clip(out, 0, 255), a * 255]).astype(np.uint8), "RGBA").save(OUT / "logo.png")
# a white version for dark backgrounds
w = np.dstack([np.full(a.shape + (3,), 255.0), a * 255]).astype(np.uint8)
Image.fromarray(w, "RGBA").save(OUT / "logo-white.png")
print("logo", Image.open(OUT / "logo.png").size)

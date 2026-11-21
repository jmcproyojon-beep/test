"""Floor texture for the Rubel Case File: tileable dark teal-green concrete (1024x1024) with scuffs and chalk dust.

    python3.13 -I prep.py   -> remotion-composer/public/casefile/floor.jpg
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
OUT = Path(__file__).resolve().parents[2] / "remotion-composer/public/casefile"; OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7); N = 1024
def tile_noise(res):
    g = rng.random((res, res)); g = np.tile(g, (2, 2))[: res + 1, : res + 1]          # wrap-around lattice
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((N + N // res, N + N // res), Image.BICUBIC)
    return np.asarray(im, float)[:N, :N] / 255
n = sum(tile_noise(r) / (i + 1) for i, r in enumerate([4, 8, 16, 32, 64, 128])); n = (n - n.min()) / (n.max() - n.min())
fine = rng.normal(0, 1, (N, N)) * .035
L = .23 + .07 * n + fine
rgb = np.dstack([L * .78, L * 1.02, L * .98]) * 255
img = Image.fromarray(rgb.clip(0, 255).astype(np.uint8)); d = ImageDraw.Draw(img, "RGBA")
for k in range(90):  # faint scuffs and chalk dust
    x, y = rng.uniform(0, N, 2); l = rng.uniform(20, 160); a = rng.uniform(0, np.pi)
    d.line([x, y, x + np.cos(a) * l, y + np.sin(a) * l], fill=(220, 235, 230, int(rng.uniform(5, 18))), width=int(rng.uniform(1, 3)))
for k in range(40):
    x, y, r = *rng.uniform(0, N, 2), rng.uniform(10, 70); d.ellipse([x - r, y - r, x + r, y + r], fill=(10, 20, 20, int(rng.uniform(6, 16))))
img.filter(ImageFilter.GaussianBlur(.5)).save(OUT / "floor.jpg", quality=90)
print("ok")

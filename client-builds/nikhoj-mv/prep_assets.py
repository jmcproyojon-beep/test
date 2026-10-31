"""Generate the music video's few raster assets.

    python3 -I client-builds/nikhoj-mv/prep_assets.py

The artist asked for a fully animated video drawn from scratch, with NO use of
their cover art — so nothing here is cut from it. Every character, city, prop
and sign is drawn in code in remotion-composer/src/nikhoj/. The only rasters
are generated textures: a newsprint page and eight film-grain tiles, baked
here because computing noise per frame in headless Chrome is slow.
"""
import shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT/"projects/nikhoj-songbad/assets"
OUT = ROOT/"remotion-composer/public/nikhoj"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(1404)

shutil.copy(SRC/"audio/song.mp3", OUT/"song.mp3")
for name in ("NotoSerifBengali-Regular", "NotoSerifBengali-Bold",
             "NotoSansBengali-Regular", "NotoSansBengali-Bold"):
    shutil.copy(f"/usr/share/fonts/truetype/noto/{name}.ttf", OUT/f"{name}.ttf")

# newsprint: warm off-white, fibres, uneven ageing toward the edges
h, w = 1080, 1920
base = np.ones((h, w, 3)) * np.array([236, 228, 211])
base += rng.normal(0, 5, (h, w, 1))
yy, xx = np.mgrid[0:h, 0:w]
edge = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
base -= (np.clip(edge - 0.55, 0, 1) ** 1.6 * 70)[..., None] * np.array([0.6, 0.75, 1.0])
paper = Image.fromarray(base.clip(0, 255).astype(np.uint8))
fib = Image.new("L", (w, h), 0)
fa = np.asarray(fib).copy()
for _ in range(2600):
    x, y = rng.integers(0, w), rng.integers(0, h)
    L = rng.integers(6, 26); ang = rng.uniform(0, np.pi)
    for t in range(L):
        px, py = int(x + t * np.cos(ang)), int(y + t * np.sin(ang))
        if 0 <= px < w and 0 <= py < h:
            fa[py, px] = 18
fib = Image.fromarray(fa).filter(ImageFilter.GaussianBlur(0.6))
paper = Image.composite(Image.new("RGB", (w, h), (205, 196, 178)), paper, fib)
paper.save(OUT/"paper.jpg", quality=90)

# film grain tiles, cycled per frame
for i in range(8):
    g = rng.normal(128, 46, (512, 512)).clip(0, 255).astype(np.uint8)
    a = (np.abs(g.astype(int) - 128) * 0.55).clip(0, 70).astype(np.uint8)
    Image.merge("RGBA", [Image.fromarray(g)] * 3 + [Image.fromarray(a)]) \
        .save(OUT/f"grain{i}.png")

for f in sorted(OUT.iterdir()):
    print(f"  {f.name:24s} {f.stat().st_size // 1024:6d} KB")

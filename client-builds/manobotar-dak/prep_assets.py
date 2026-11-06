"""Paper textures and the hero's collage cutouts for the music video.

    python3 -I client-builds/manobotar-dak/prep_assets.py

- three paper textures (kraft, cream, night) with fibres and grain
- (the hero cutouts come from the artist's character sheet: cutout_hero.py)
- film-grain tiles
"""
import shutil, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/"remotion-composer/public/manobotar"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(1971)


def paper(base, name, w=1920, h=1080, fib=3000, dark=False):
    img = np.ones((h, w, 3)) * np.array(base, float)
    img += rng.normal(0, 6, (h, w, 1))
    yy, xx = np.mgrid[0:h, 0:w]
    edge = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    img -= (np.clip(edge - 0.5, 0, 1) ** 1.5 * (40 if not dark else 20))[..., None]
    for _ in range(14):                                  # blotches
        cx, cy, r = rng.integers(0, w), rng.integers(0, h), rng.integers(60, 260)
        m = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * r * r)))
        img -= (m * rng.uniform(3, 9))[..., None]
    pil = Image.fromarray(img.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(pil)
    for _ in range(fib):
        x, y = rng.integers(0, w), rng.integers(0, h)
        L, a = rng.integers(6, 30), rng.uniform(0, np.pi)
        c = tuple(int(v) for v in (np.array(base) * (0.82 if not dark else 1.25)).clip(0, 255))
        d.line([(x, y), (x + L * np.cos(a), y + L * np.sin(a))], fill=c, width=1)
    pil.filter(ImageFilter.GaussianBlur(0.4)).save(OUT/name, quality=90)


paper((205, 176, 132), "kraft.jpg")
paper((240, 230, 210), "cream.jpg")
paper((34, 36, 52), "night.jpg", dark=True)


for i in range(8):
    g = rng.normal(128, 46, (512, 512)).clip(0, 255).astype(np.uint8)
    a = (np.abs(g.astype(int) - 128) * 0.55).clip(0, 70).astype(np.uint8)
    Image.merge("RGBA", [Image.fromarray(g)] * 3 + [Image.fromarray(a)]).save(OUT/f"grain{i}.png")
shutil.copy(ROOT/"projects/manobotar-dak/assets/audio/song.mp3", OUT/"song.mp3")
for f in sorted(OUT.iterdir()):
    print(f"  {f.name:22s} {f.stat().st_size // 1024:6d} KB")

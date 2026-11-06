"""Paper textures and the hero's collage cutouts for the music video.

    python3 -I client-builds/manobotar-dak/prep_assets.py COVER.png

- three paper textures (kraft, cream, night) with fibres and grain
- the hero (Raparrubel) cut from the artist's cover art, at the artist's
  request: his portrait and his seated figure, each with a torn white paper
  border, like a collage cutout. Nothing else from the cover is used.
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


def torn(img, border=18, seed=0):
    """Paste img on white paper with a ragged edge; return RGBA."""
    r = np.random.default_rng(seed)
    w, h = img.size
    W, H = w + 2 * border, h + 2 * border
    pts = []
    for side in range(4):
        n = 60
        for i in range(n):
            k = i / n
            j = r.uniform(0, border * 0.9)
            if side == 0: pts.append((k * W, j))
            elif side == 1: pts.append((W - j, k * H))
            elif side == 2: pts.append((W - k * W, H - j))
            else: pts.append((j, H - k * H))
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    sheet = Image.new("RGBA", (W, H), (248, 244, 232, 255))
    sheet.paste(img.convert("RGBA"), (border, border))
    sheet.putalpha(mask.filter(ImageFilter.GaussianBlur(0.6)))
    return sheet


cover = Image.open(sys.argv[1]).convert("RGB")
s = cover.width / 1254
portrait = cover.crop((int(668 * s), int(40 * s), int(1050 * s), int(630 * s)))   # clear of the title lettering
torn(portrait.resize((780, 1200), Image.LANCZOS), 26, 1).save(OUT/"hero_portrait.png")
seated = cover.crop((int(310 * s), int(610 * s), int(870 * s), int(1100 * s)))
torn(seated.resize((1120, 980), Image.LANCZOS), 22, 2).save(OUT/"hero_seated.png")

for i in range(8):
    g = rng.normal(128, 46, (512, 512)).clip(0, 255).astype(np.uint8)
    a = (np.abs(g.astype(int) - 128) * 0.55).clip(0, 70).astype(np.uint8)
    Image.merge("RGBA", [Image.fromarray(g)] * 3 + [Image.fromarray(a)]).save(OUT/f"grain{i}.png")
shutil.copy(ROOT/"projects/manobotar-dak/assets/audio/song.mp3", OUT/"song.mp3")
for f in sorted(OUT.iterdir()):
    print(f"  {f.name:22s} {f.stat().st_size // 1024:6d} KB")

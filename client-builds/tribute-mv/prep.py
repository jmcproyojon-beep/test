"""Assets for the documentary-style music video "ফিরে এসে কাকে ডাকি?".

    python3.13 -I prep.py <photos.json from the Drive folder index>     -> remotion-composer/public/tribute/

- p00.jpg..p51.jpg: the client's Drive photos (index order of photos.json), long side <= 1600, #0 cropped to its photograph.
- bg.jpg: dark grunge paper (2400x1350) for the slowly drifting background.
- grain0..5.png: film grain / dust frames cycled in the overlay.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]; PUB = ROOT / "remotion-composer/public/tribute"; PUB.mkdir(parents=True, exist_ok=True)
meta = json.load(open(sys.argv[1]))
for m in meta:
    im = Image.open(m["f"]).convert("RGB")
    if m["i"] == 0:  # newspaper advert: keep only the photograph at the top
        w, h = im.size; im = im.crop((int(w * .02), int(h * .08), int(w * .98), int(h * .58)))
    im.thumbnail((1600, 1600)); im.save(PUB / f"p{m['i']:02d}.jpg", quality=90)
rng = np.random.default_rng(5)
def fbm(w, h, oct=6, base=4):
    out = np.zeros((h, w))
    for o in range(oct):
        n = base * 2 ** o; g = rng.random((n + 1, int(n * w / h) + 2))
        out += np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), float) / 255 / 2 ** o
    return (out - out.min()) / (out.max() - out.min())
W, H = 2400, 1350
n = fbm(W, H); n2 = fbm(W, H, 4, 2)
yy, xx = np.mgrid[0:H, 0:W]; vig = 1 - 0.75 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2).clip(0, 1.6) / 1.6
L = (0.10 + 0.22 * n * n2 + 0.08 * n2) * vig
rgb = np.dstack([L * 1.0, L * 0.78, L * 0.58]) * 255
img = Image.fromarray(rgb.clip(0, 255).astype(np.uint8))
d = ImageDraw.Draw(img, "RGBA")
for k in range(60):  # stains and scratches
    x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(20, 160)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(30, 20, 12, int(rng.uniform(8, 30))))
for k in range(140):
    x = rng.uniform(0, W); y = rng.uniform(0, H); l = rng.uniform(30, 260); a = rng.uniform(0, np.pi)
    d.line([x, y, x + np.cos(a) * l, y + np.sin(a) * l], fill=(200, 170, 130, int(rng.uniform(6, 22))), width=1)
img = img.filter(ImageFilter.GaussianBlur(0.6)); img.save(PUB / "bg.jpg", quality=88)
for f in range(6):
    g = rng.normal(0, 1, (540, 960)); a = (np.abs(g) * 28).clip(0, 90)
    rgba = np.zeros((540, 960, 4), np.uint8); rgba[..., :3] = np.where(g[..., None] > 0, 235, 20); rgba[..., 3] = a
    im = Image.fromarray(rgba); dd = ImageDraw.Draw(im)
    for k in range(int(rng.integers(6, 16))):
        x, y = rng.uniform(0, 960), rng.uniform(0, 540); r = rng.uniform(0.6, 2.4)
        dd.ellipse([x - r, y - r, x + r, y + r], fill=(10, 8, 6, 200) if rng.random() < .6 else (240, 230, 210, 170))
    for k in range(int(rng.integers(0, 3))):
        x = rng.uniform(0, 960); dd.line([x, 0, x + rng.uniform(-8, 8), 540], fill=(235, 225, 205, 60), width=1)
    im.save(PUB / f"grain{f}.png")
print("ok", len(meta))

"""Assets for the Purbachal 5-facts reel.

    python3.13 -I prep.py <multi-plot aerial.jpg> <site photo.jpg>     -> remotion-composer/public/facts/

island.png: the Marine City plot cut out of the cleaned aerial (public/marine/aerial.jpg) with a soil block
underneath, like the floating-land cutouts in the reference. plots.jpg / site.jpg: the client's photos, resized.
"""
import sys, shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]; PUB = ROOT / "remotion-composer/public/facts"; PUB.mkdir(parents=True, exist_ok=True)
aer = Image.open(ROOT / "remotion-composer/public/marine/aerial.jpg").convert("RGB"); W, H = aer.size
OUTLINE = [(22, 655), (155, 612), (150, 593), (428, 497), (428, 475), (478, 455), (518, 470), (708, 412), (832, 452), (835, 478), (1070, 563), (1122, 582), (1122, 636), (922, 768), (1018, 848), (398, 1185)]
mask = Image.new("L", (W, H), 0); ImageDraw.Draw(mask).polygon(OUTLINE, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(1.2))
m = np.asarray(mask) > 128
rng = np.random.default_rng(4); DEP = 120
out = np.zeros((H + DEP + 20, W, 4), np.uint8)
xs = np.nonzero(m.any(0))[0]
depth = (DEP * 0.7 + 30 * np.convolve(rng.standard_normal(W + 60), np.ones(30) / 30, "same")[30:30 + W] * 3).clip(50, DEP)
strata = np.convolve(rng.standard_normal(DEP + 40), np.ones(5) / 5, "same")
for x in xs:
    ys = np.nonzero(m[:, x])[0]; yb = ys.max(); d = int(depth[x])
    for k in range(d):
        f = k / d; c = np.array([118, 82, 50]) * (1 - f) + np.array([58, 38, 22]) * f
        c = c * (1 + 0.12 * strata[k % len(strata)]) * (0.92 + 0.08 * np.sin(x / 9 + k / 4))
        out[yb + k, x, :3] = np.clip(c, 0, 255); out[yb + k, x, 3] = 255
    out[yb + d - 4: yb + d, x, 3] = np.linspace(255, 0, 4).astype(np.uint8)
top = np.dstack([np.asarray(aer), np.asarray(mask)])
a = top[..., 3:4] / 255.0
region = out[:H]
region[...] = (top * a + region * (1 - a)).astype(np.uint8); region[..., 3] = np.maximum(region[..., 3], top[..., 3])
img = Image.fromarray(out)
# grass lip along the cut edge
edge = mask.filter(ImageFilter.MaxFilter(5)); lip = Image.new("RGBA", img.size, (0, 0, 0, 0))
lip.paste((70, 120, 40, 255), (0, 0), Image.fromarray((np.asarray(edge) > 128).astype(np.uint8) * 255 - (np.asarray(mask) > 128).astype(np.uint8) * 255).convert("L"))
img = Image.alpha_composite(img, lip)
bb = img.getbbox(); img = img.crop(bb); img.thumbnail((1200, 1200)); img.save(PUB / "island.png")
print("island", img.size)
for src, name, mx in ((sys.argv[1], "plots.jpg", 1500), (sys.argv[2], "site.jpg", 1500)):
    im = Image.open(src).convert("RGB"); im.thumbnail((mx, mx * 2)); im.save(PUB / name, quality=90); print(name, im.size)
shutil.copy(ROOT / "remotion-composer/public/marine/logo.png", PUB / "logo.png")

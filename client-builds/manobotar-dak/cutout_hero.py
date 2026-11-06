"""Cut the hero out of the artist's character-reference sheet.

    python3.13 -I client-builds/manobotar-dak/cutout_hero.py SHEET.jpg

The sheet is shot on a near-white backdrop, and the hero's cream T-shirt is
almost the same brightness — but the backdrop is cool (B >= R) and the shirt
warm (R > B). Background = pixels close to the backdrop colour AND not warm,
flood-filled in from the panel edges; then the largest foreground component
is kept and the edge softened. Each cutout gets a torn white paper border.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/"remotion-composer/public/manobotar"
sheet = Image.open(sys.argv[1]).convert("RGB")
W0, H0 = sheet.size
sx, sy = W0 / 1536, H0 / 1024
# (name, box) in the 1536x1024 sheet
PANELS = {
    "hero_front": (18, 380, 398, 972), "hero_left": (402, 380, 765, 972), "hero_back": (770, 380, 1136, 972), "hero_right": (1140, 380, 1520, 972),
    "head_front": (18, 50, 398, 343), "head_left": (402, 50, 765, 343), "head_right": (770, 50, 1136, 343), "head_3q": (1140, 50, 1520, 343),
}


def cut(img):
    a = np.asarray(img).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bgc = np.median(edge, axis=0)
    dist = np.sqrt(((a - bgc) ** 2).sum(-1))
    cand = (dist < 16) & ((r - b) < 3.5)                     # backdrop-like and cool
    lab, _ = ndi.label(cand)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, border[border > 0])
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=2)
    fg = ndi.binary_closing(fg, iterations=3)
    lab2, n = ndi.label(fg)
    if n:
        sizes = ndi.sum(fg, lab2, range(1, n + 1))
        fg = lab2 == (1 + int(np.argmax(sizes)))
    fg = ndi.binary_fill_holes(fg)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    out = img.convert("RGBA"); out.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
    return out.crop(bbox), alpha.crop(bbox)


def paper_edge(rgba, alpha, pad=14, seed=0):
    """White paper border around the silhouette, slightly ragged."""
    rng = np.random.default_rng(seed)
    w, h = rgba.size
    big = Image.new("L", (w + 2 * pad, h + 2 * pad), 0); big.paste(alpha, (pad, pad))
    m = np.asarray(big) > 40
    m = ndi.binary_dilation(m, iterations=pad - 3)
    noise = ndi.gaussian_filter(rng.normal(0, 1, m.shape), 3) > 0.6
    m = m | (ndi.binary_dilation(m, iterations=3) & noise)
    border = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    sheet = Image.new("RGBA", big.size, (250, 247, 238, 0)); sheet.putalpha(border)
    sheet.alpha_composite(rgba, (pad, pad))
    return sheet


for i, (name, (x0, y0, x1, y1)) in enumerate(PANELS.items()):
    crop = sheet.crop((int(x0 * sx), int(y0 * sy), int(x1 * sx), int(y1 * sy)))
    crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
    rgba, alpha = cut(crop)
    paper_edge(rgba, alpha, 16, i).save(OUT/f"{name}.png")
    print(f"  {name:11s} {rgba.size}")

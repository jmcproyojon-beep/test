"""Paper / paint grain overlays for the film (numpy + PIL).  python3.13 -I texture.py -> public/tuinei/*.png"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
OUT = Path(__file__).resolve().parents[1] / ".." / "remotion-composer/public/tuinei"
OUT = OUT.resolve()
rng = np.random.default_rng(3)
W, H = 1920, 1080
def norm(a): a = a - a.min(); return a / (a.max() + 1e-9)
# tactile paper: low-frequency blotches + fibre grain, mid-grey so it can multiply / overlay
low = sum(np.array(Image.fromarray((rng.random((H // s + 1, W // s + 1)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), float) / 255 * w
          for s, w in ((240, 0.5), (90, 0.3), (30, 0.2)))
fib = np.array(Image.fromarray((rng.random((H, W)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), float) / 255
paper = 0.82 + 0.12 * (norm(low) - 0.5) + 0.08 * (fib - 0.5)
Image.fromarray((np.clip(paper, 0, 1) * 255).astype(np.uint8)).save(OUT / "paper.png")
# film grain tiles for the memories (4 variants, cycled per frame)
for i in range(4):
    g = rng.normal(0.5, 0.18, (H // 2, W // 2))
    Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8)).resize((W, H), Image.NEAREST).save(OUT / f"grain{i}.png")
print("ok", OUT)

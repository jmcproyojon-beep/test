"""Cut the official BhangariWala logo into mark + wordmark PNGs with transparent background."""
import sys
import numpy as np
from PIL import Image
im = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(float)
H, W, _ = im.shape
dist = 255 - im.min(axis=2)            # 0 for white
alpha = np.clip((dist - 10) / 40, 0, 1)
ink = alpha > 0.5
cols = ink.any(axis=0)
# find the gap between mark and wordmark: longest empty run of columns in the left 40 %
xs = np.where(cols)[0]
gaps = [(xs[i + 1] - xs[i], xs[i], xs[i + 1]) for i in range(len(xs) - 1) if xs[i] < W * 0.4]
g = max(gaps)
print("gap", g, "size", W, H)
def save(x0, x1, name):
    sub = ink[:, x0:x1]; rows = np.where(sub.any(axis=1))[0]
    y0, y1 = rows[0], rows[-1] + 1
    rgb = im[y0:y1, x0:x1]; a = alpha[y0:y1, x0:x1]
    # un-premultiply against white so edges stay clean
    out = np.where(a[..., None] > 0.01, (rgb - 255 * (1 - a[..., None])) / np.maximum(a[..., None], 0.01), rgb)
    rgba = np.dstack([np.clip(out, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(name); print(name, x1 - x0, y1 - y0)
save(xs[0], g[1] + 1, "logo-mark.png")
save(g[2], xs[-1] + 1, "logo-word.png")

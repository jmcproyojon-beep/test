import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
p = Image.open("product.jpg").convert("RGB")
im = p.resize((p.width * 3, p.height * 3), Image.LANCZOS)
a = np.asarray(im).astype(int)
mx, mn = a.max(axis=2), a.min(axis=2)
light = (mn > 140) & (mx - mn < 30)                      # white/grey background, floor and wheel gaps
lab, n = ndimage.label(light)
sizes = ndimage.sum(light, lab, range(1, n + 1))
big = np.isin(lab, np.where(sizes > 220)[0] + 1)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgm = big | np.isin(lab, list(edge))
bgm = ndimage.binary_opening(bgm, iterations=1); bgm = ndimage.binary_dilation(bgm, iterations=2)
alpha = Image.fromarray(((~bgm) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
im = im.filter(ImageFilter.UnsharpMask(radius=2.5, percent=90, threshold=2)); im.putalpha(alpha); im.save("bike.png")
# wireframe: edges of the cutout, for the laser build-up
g = np.asarray(im.convert("L")).astype(float)
sx, sy = ndimage.sobel(g, 1), ndimage.sobel(g, 0); e = np.hypot(sx, sy)
e = np.clip(e / np.percentile(e[np.asarray(alpha) > 128], 92), 0, 1) * (np.asarray(alpha) / 255.0)
ae = np.asarray(alpha).astype(float); ea = np.hypot(ndimage.sobel(ae, 1), ndimage.sobel(ae, 0)); ea = np.clip(ea / ea.max() * 3, 0, 1)
w = np.clip(np.maximum(e * .85, ea), 0, 1)
rgba = np.zeros((*w.shape, 4), np.uint8); rgba[..., 0] = 255; rgba[..., 1] = 60; rgba[..., 2] = 50; rgba[..., 3] = (w * 255).astype(np.uint8)
Image.fromarray(rgba).save("bike_wire.png"); print("ok", im.size)

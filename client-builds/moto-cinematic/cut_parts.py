"""Cut product/diagram parts out of their white backgrounds (flood fill from the borders)."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

def cutout(img, box, out, tol=28, scale=1, grow=1):
    im = img.crop(box).convert("RGB")
    if scale != 1: im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    a = np.asarray(im).astype(int)
    bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
    near = (np.abs(a - bg).max(axis=2) < tol) & (a.min(axis=2) > 175)
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgmask = np.isin(lab, list(edge))
    bgmask = ndimage.binary_dilation(bgmask, iterations=grow)
    alpha = Image.fromarray(((~bgmask) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    im.putalpha(alpha)
    if scale != 1: im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=2))
    im.save(out); print(out, im.size)

d = Image.open("diagram.png"); p = Image.open("product.jpg")
cutout(p, (0, 0, p.width, p.height), "bike.png", tol=22, scale=3)
cutout(d, (1210, 52, 1404, 338), "eng_inset.png", tol=30, scale=2)
cutout(d, (1205, 625, 1407, 808), "brake.png", tol=30, scale=2)
cutout(d, (1198, 388, 1398, 582), "tyre.png", tol=30, scale=2)
cutout(d, (130, 0, 1200, 800), "bike_cutaway.png", tol=30, scale=1)

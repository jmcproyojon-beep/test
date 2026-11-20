"""Prepare the photos and the paper texture for 37-tarique-doc.
Run: python3 -I demos/37-tarique-doc/prep.py <folder with p01.jpg … p44.jpg>
Photos are graded two ways: 'S' = archival sepia (the past), 'W' = warm colour (the present).
The two white-background portraits (p05, p28) are also cut out ('C', PNG with alpha)."""
import sys, os, glob
import numpy as np
from PIL import Image, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)) + '/assets/'
SRC = sys.argv[1]
os.makedirs(D + 'photos', exist_ok=True)
rng = np.random.default_rng(7)

def sepia(a, mix):
    L = (a @ np.array([.299, .587, .114]))[..., None]
    L = np.clip((L - .04) / .92, 0, 1) ** 1.05
    tone = np.concatenate([L * 1.0 + .06, L * .86 + .04, L * .66 + .02], -1)       # warm brown toning
    return np.clip(tone * (1 - mix) + a * mix, 0, 1)

for f in sorted(glob.glob(SRC + '/p*.jpg')):
    n = os.path.basename(f)[:3]
    try: im = Image.open(f).convert('RGB')
    except Exception: continue
    im.thumbnail((1400, 1400), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255
    Image.fromarray((sepia(a, .12) * 255).astype(np.uint8)).save(D + f'photos/{n}S.jpg', quality=88)
    w = np.clip(a * np.array([1.05, 1.0, .9]) * .96 + .02, 0, 1)
    w = sepia(w, .7)
    Image.fromarray((w * 255).astype(np.uint8)).save(D + f'photos/{n}W.jpg', quality=88)

# cut-outs: near-black connected to the border becomes transparent
from scipy import ndimage
for n in ('p05', 'p28'):
    im = Image.open(SRC + f'/{n}.jpg').convert('RGB'); im.thumbnail((1400, 1400), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255
    white = (a.max(-1) < .045)
    lab, _ = ndimage.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    alpha = 1 - ndimage.gaussian_filter(bg.astype(np.float32), 1.2)
    alpha = np.clip((alpha - .1) / .8, 0, 1)
    rgb = sepia(a, .75)
    out = np.dstack([rgb, alpha])
    Image.fromarray((out * 255).astype(np.uint8), 'RGBA').save(D + f'photos/{n}C.png')

# paper: dark brown grunge, 2400x1400 (room to drift)
W, H = 2400, 1400
def noise(scale, seed):
    r = np.random.default_rng(seed).random((H // scale + 2, W // scale + 2)).astype(np.float32)
    return np.asarray(Image.fromarray((r * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), dtype=np.float32) / 255
n = noise(300, 1) * .45 + noise(90, 2) * .3 + noise(20, 3) * .15 + noise(3, 4) * .1
stain = np.clip((noise(160, 5) - .55) * 3, 0, 1)
base = .10 + .10 * n - .05 * stain
img = np.dstack([base * 1.0, base * .82, base * .62])
img += (rng.random((H, W, 1)).astype(np.float32) - .5) * .035                      # grain
# vertical streaks + a few scratches
for _ in range(60):
    x = rng.integers(0, W); img[:, max(0, x - 1):x + 1] *= rng.uniform(.85, 1.12)
img = np.clip(img, 0, 1)
Image.fromarray((img * 255).astype(np.uint8)).save(D + 'paper.jpg', quality=90)
print('ok', len(glob.glob(D + 'photos/*')))

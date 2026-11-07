"""Hero rig from a single front-facing photo (assets/src/rubel.jpg, the artist's own photo):
head cut into lid (top of skull, Gilliam-style forehead cut) / jaw (beard) / face, plus a head-and-shoulders bust.
Run from the repo root: python3 demos/30-manobotar-dak/work/hero_photo.py demos/30-manobotar-dak/assets/src/rubel.jpg"""
import json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cutlib import halftone_cmyk, sticker
from prep import grab, save, layout, OUT
from hero import panel, jag_line, poly_mask

RIG = {
    'head': (520 / 1364, 20 / 768, 860 / 1364, 362 / 768), 'up': 2.2,
    'lid_y': 0.305, 'hinge': (0.22, 0.31), 'head_top': (0.5, 0.05), 'head_center': (0.5, 0.47),
    'jaw': [(0.40, 0.655), (0.60, 0.655), (0.64, 0.73), (0.585, 0.875), (0.415, 0.875), (0.36, 0.73)], 'jaw_hinge': (0.5, 0.655),
    'bust': (420 / 1364, 20 / 768, 960 / 1364, 362 / 768),
}
sheet = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32) / 255
a = panel(sheet, RIG['head'], RIG['up']); H, W = a.shape[:2]
al = grab(a, (0.12, 0.03, 0.9, 1.0), fg=[(0.32, 0.25, 0.68, 0.9)], bg=[(0.0, 0.0, 0.12, 0.6), (0.9, 0.0, 1.0, 0.6)])
col = halftone_cmyk(a, 6.0, 0.5, sat=1.08)
lid_m = poly_mask(H, W, [(0, 0), (W, 0)] + jag_line(W, RIG['lid_y'] * H, 7)[::-1]) * al
jaw_m = poly_mask(H, W, [(x * W, y * H) for x, y in RIG['jaw']]) * al
face_m = np.clip(al - lid_m, 0, 1)
mouth = np.array([0.23, 0.05, 0.04], np.float32)
face_rgb = col * (1 - jaw_m[..., None]) + mouth * jaw_m[..., None]      # dark mouth interior behind the jaw
pieces = {}
for name, rgb, m, seed in (('hero_face', face_rgb, face_m, 101), ('hero_lid', col, lid_m, 102), ('hero_jaw', col, jaw_m, 103)):
    pieces[name] = sticker(np.dstack([rgb, m]), r=5 if name != 'hero_jaw' else 3, seed=seed)
for k in pieces:
    d = (pieces['hero_face'].shape[0] - pieces[k].shape[0]) // 2
    if d > 0: pieces[k] = np.pad(pieces[k], ((d, d), (d, d), (0, 0)))
off = (pieces['hero_face'].shape[1] - W) / 2
P = lambda fx, fy: [fx * W + off, fy * H + off]
meta = dict(head_center=P(*RIG['head_center']), hinge=P(*RIG['hinge']), jaw_hinge=P(*RIG['jaw_hinge']), head_top=P(*RIG['head_top']), jaw_drop=0.05 * H)
for k, v in pieces.items(): save(k, v, **(meta if k == 'hero_face' else {}))
b = panel(sheet, RIG['bust'], 1.6)
bl = grab(b, (0.06, 0.03, 0.94, 1.0), fg=[(0.4, 0.2, 0.6, 0.9)], bg=[(0.0, 0.0, 0.08, 0.5), (0.92, 0.0, 1.0, 0.5)])
save('hero_body', sticker(np.dstack([halftone_cmyk(b, 6.0, 0.5, sat=1.08), bl]), r=5, seed=104))
json.dump(layout, open(OUT + 'layout.json', 'w'), indent=1)

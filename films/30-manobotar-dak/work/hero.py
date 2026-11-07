"""Hero rig for 30-manobotar-dak: cut the singer's 8-panel character sheet into collage puppet pieces.
Run from the repo root:  python3 demos/30-manobotar-dak/work/hero.py <character_sheet.(jpg|png|webp)>
Writes assets/gen/hero_face|hero_lid|hero_jaw (co-registered), hero_body, hero_profile, hero_back (+ layout.json entries).
All positions are fractions of the sheet / panel so any resolution of the same sheet works; tune them in RIG below.
"""
import json, os, sys
import numpy as np, cv2
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cutlib import halftone_cmyk, sticker, resize, scissor_border, pad, PAPER_W
from prep import grab, save, layout, OUT

RIG = {
    # panels on the sheet (x0, y0, x1, y1 as fractions of the whole sheet)
    'head_front': (0.012, 0.048, 0.258, 0.335), 'profile': (0.262, 0.048, 0.497, 0.335),
    'body_front': (0.012, 0.37, 0.258, 0.948), 'body_back': (0.502, 0.37, 0.740, 0.948),
    # head rig, fractions of the head_front panel
    'brim_y': 0.305,                      # scissor line between cap (lid) and face
    'hinge': (0.33, 0.31),               # brass fastener at the left end of the brim
    'jaw': [(0.43, 0.548), (0.61, 0.548), (0.645, 0.62), (0.595, 0.725), (0.45, 0.725), (0.40, 0.62)],
    'jaw_hinge': (0.52, 0.548), 'head_top': (0.52, 0.04),
    'logo': (0.35, 0.205, 0.66, 0.385),    # chest print on body_front (fractions of that panel) -> paper patch
    'up': 3.0,                           # upscale before halftone (the halftone hides the softness)
}


def panel(sheet, box, up):
    H, W = sheet.shape[:2]
    a = sheet[int(box[1] * H):int(box[3] * H), int(box[0] * W):int(box[2] * W)]
    return resize(a, a.shape[1] * up, a.shape[0] * up)


def jag_line(W, y, seed, amp=5, step=18):
    rng = np.random.default_rng(seed); xs = np.arange(0, W + step, step)
    return [(float(x), float(y + rng.uniform(-amp, amp))) for x in xs]


def poly_mask(H, W, pts):
    m = np.zeros((H * 3, W * 3), np.uint8)
    cv2.fillPoly(m, [np.round(np.array(pts) * 3).astype(np.int32)], 255, lineType=cv2.LINE_AA)
    return cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255


def main(path):
    sheet = np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255
    up = RIG['up']
    # ---------------- head: one cut-out, split into lid (cap) / jaw / face, all on the same canvas
    a = panel(sheet, RIG['head_front'], up); H, W = a.shape[:2]
    al = grab(a, (0.04, 0.02, 0.96, 1.0), fg=[(0.35, 0.3, 0.65, 0.7)])
    col = halftone_cmyk(a, 6.0, 0.5, sat=1.05)
    brim = jag_line(W, RIG['brim_y'] * H, 7)
    lid_m = poly_mask(H, W, [(0, 0), (W, 0)] + brim[::-1]) * al
    jaw_pts = [(x * W, y * H) for x, y in RIG['jaw']]
    jaw_m = poly_mask(H, W, jaw_pts) * al
    face_m = np.clip(al - lid_m - jaw_m, 0, 1)
    mouth = np.array([0.23, 0.05, 0.04], np.float32)               # dark mouth interior shows when the jaw drops
    face_rgb = col * (1 - jaw_m[..., None]) + mouth * jaw_m[..., None]
    face_m = np.clip(face_m + jaw_m * 0.98, 0, 1)
    r = 5; p = r * 3 + 4
    pieces = {}
    for name, rgb, m, seed in (('hero_face', face_rgb, face_m, 101), ('hero_lid', col, lid_m, 102), ('hero_jaw', col, jaw_m, 103)):
        pieces[name] = sticker(np.dstack([rgb, m]), r=r if name != 'hero_jaw' else 3, seed=seed)
    # sticker() pads every piece by the same amount for the same r; the jaw uses r=3 -> re-pad to match
    for k in pieces:
        d = (pieces['hero_face'].shape[0] - pieces[k].shape[0]) // 2
        if d > 0: pieces[k] = np.pad(pieces[k], ((d, d), (d, d), (0, 0)))
    off = (pieces['hero_face'].shape[1] - W) / 2
    P = lambda fx, fy: [fx * W + off, fy * H + off]
    meta = dict(head_center=P(0.52, 0.45), hinge=P(*RIG['hinge']), jaw_hinge=P(*RIG['jaw_hinge']), head_top=P(*RIG['head_top']),
                jaw_drop=0.06 * H)
    for k, v in pieces.items(): save(k, v, **(meta if k == 'hero_face' else {}))
    # ---------------- full figures
    for name, box, seed in (('hero_body', 'body_front', 104), ('hero_back', 'body_back', 105), ('hero_profile', 'profile', 106)):
        b = panel(sheet, RIG[box], 1.6 if name != 'hero_profile' else up)
        bl = grab(b, (0.05, 0.01, 0.95, 0.995), fg=[(0.4, 0.15, 0.6, 0.85)])
        bc = halftone_cmyk(b, 6.0, 0.5, sat=1.05)
        if name == 'hero_body':                                     # brand print on the T-shirt -> torn paper patch + red sun
            x0, y0, x1, y1 = RIG['logo']; Hb, Wb = b.shape[:2]
            rng = np.random.default_rng(9)
            pts = [(x0 * Wb + rng.uniform(-6, 6), y0 * Hb + rng.uniform(-6, 6)), (x1 * Wb + rng.uniform(-6, 6), y0 * Hb + rng.uniform(-6, 6)),
                   (x1 * Wb + rng.uniform(-6, 6), y1 * Hb + rng.uniform(-6, 6)), (x0 * Wb + rng.uniform(-6, 6), y1 * Hb + rng.uniform(-6, 6))]
            pm = poly_mask(Hb, Wb, pts)[..., None]
            bc = bc * (1 - pm) + np.array([0.95, 0.925, 0.87], np.float32) * pm
            cx, cy, rr = (x0 + x1) / 2 * Wb, (y0 + y1) / 2 * Hb, min(x1 - x0, y1 - y0) * min(Wb, Hb) * 0.32 * (Hb / Wb if Hb < Wb else 1)
            yy, xx = np.mgrid[0:Hb, 0:Wb]
            dm = np.clip(rr + 0.5 - np.hypot(xx - cx, yy - cy), 0, 1)[..., None]
            bc = bc * (1 - dm) + np.array([0.82, 0.15, 0.11], np.float32) * dm
        save(name, sticker(np.dstack([bc, bl]), r=5, seed=seed))
    json.dump(layout, open(OUT + 'layout.json', 'w'), indent=1)


if __name__ == '__main__':
    main(sys.argv[1])

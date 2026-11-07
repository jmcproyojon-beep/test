"""Asset prep for 30-manobotar-dak: CC0 / PD sources -> halftoned cutouts with scissor-cut white rims, and torn prints.
Run from the repo root:  python3 demos/30-manobotar-dak/work/prep.py   (deterministic, seeded)
Sources are fetched by work/fetch.py (see work/sources.json and CREDITS.md).
"""
import json, os, sys
import numpy as np, cv2
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cutlib import halftone_mono, halftone_cmyk, sticker, resize, PAPER_W

D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SRC, OUT = D + 'assets/src/', D + 'assets/gen/'
os.makedirs(OUT, exist_ok=True)
ONLY = set(sys.argv[1:]) if __name__ == '__main__' else set()
layout = json.load(open(OUT + 'layout.json')) if os.path.exists(OUT + 'layout.json') else {}


def rgb(name, maxside=1500):
    im = Image.open(SRC + name + '.jpg').convert('RGB')
    s = min(1.0, maxside / max(im.size))
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255


def save(name, rgba, **meta):
    Image.fromarray(np.clip(rgba * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA').save(OUT + name + '.png', optimize=True)
    layout[name] = dict(w=rgba.shape[1], h=rgba.shape[0], **meta)
    print('saved', name, rgba.shape[1], rgba.shape[0])


def grab(a, rect, iters=7, fg=None, bg=None):
    """GrabCut inside rect (fractions x0,y0,x1,y1); optional extra sure-fg / sure-bg boxes (fractions)."""
    H, W = a.shape[:2]
    img = (a * 255).astype(np.uint8)[..., ::-1].copy()
    m = np.zeros((H, W), np.uint8)
    x0, y0, x1, y1 = int(rect[0] * W), int(rect[1] * H), int(rect[2] * W), int(rect[3] * H)
    m[:] = cv2.GC_BGD
    m[y0:y1, x0:x1] = cv2.GC_PR_FGD
    for b in fg or []:
        m[int(b[1] * H):int(b[3] * H), int(b[0] * W):int(b[2] * W)] = cv2.GC_FGD
    for b in bg or []:
        m[int(b[1] * H):int(b[3] * H), int(b[0] * W):int(b[2] * W)] = cv2.GC_BGD
    bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, m, None, bgm, fgm, iters, cv2.GC_INIT_WITH_MASK)
    al = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    al = cv2.morphologyEx(al, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(al)               # keep the biggest blob (+ big neighbours)
    if n > 1:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
        keep = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 0.08 * st[big, cv2.CC_STAT_AREA]]
        al = np.isin(lab, keep).astype(np.uint8) * 255
    al = cv2.GaussianBlur(al, (3, 3), 0).astype(np.float32) / 255
    return al


def ink(a, rect, thr=0.07, close=25):
    """Line drawings / engravings on light paper: dark strokes -> closed, hole-filled silhouette."""
    H, W = a.shape[:2]
    L = a[..., 0] * 0.3 + a[..., 1] * 0.59 + a[..., 2] * 0.11
    L = cv2.GaussianBlur(L, (0, 0), 1.0)
    paper = cv2.GaussianBlur(L, (0, 0), 40)
    m = ((paper - L) > thr).astype(np.uint8) * 255
    box = np.zeros_like(m); box[int(rect[1] * H):int(rect[3] * H), int(rect[0] * W):int(rect[2] * W)] = 255
    m = cv2.bitwise_and(m, box)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close)))
    cn, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cn = sorted(cn, key=cv2.contourArea, reverse=True)
    out = np.zeros_like(m)
    big = cv2.contourArea(cn[0])
    cv2.drawContours(out, [c for c in cn if cv2.contourArea(c) > 0.15 * big], -1, 255, -1)
    return cv2.GaussianBlur(out, (3, 3), 0).astype(np.float32) / 255


def crop_alpha(rgba):
    ys, xs = np.where(rgba[..., 3] > 0.05)
    return rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def ellipse(a, cx, cy, rx, ry):
    H, W = a.shape[:2]
    m = np.zeros((H * 3, W * 3), np.uint8)
    cv2.ellipse(m, (int(cx * W * 3), int(cy * H * 3)), (int(rx * W * 3), int(ry * H * 3)), 0, 0, 360, 255, -1, cv2.LINE_AA)
    return cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255


def cutout(name, out, h=None, w=None, rect=None, oval=None, mode='mono', r=5, seed=1, period=6.0, mix=0.6, fg=None, bg=None,
           crop=None, flip=False, inkmode=False, thr=0.07, close=25, **kw):
    a = rgb(name)
    if crop:
        H0, W0 = a.shape[:2]
        a = a[int(crop[1] * H0):int(crop[3] * H0), int(crop[0] * W0):int(crop[2] * W0)]
    if oval == 'auto':                                       # bright disc on black: fit the circle
        Lm = ((a.mean(2) > 0.1) * 255).astype(np.uint8)
        cn, _ = cv2.findContours(Lm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        (cx, cy), rr = cv2.minEnclosingCircle(max(cn, key=cv2.contourArea))
        rr *= 0.985
        oval = (cx / a.shape[1], cy / a.shape[0], rr / a.shape[1], rr / a.shape[0])
    al = ellipse(a, *oval) if oval else ink(a, rect, thr, close) if inkmode else grab(a, rect, fg=fg, bg=bg)
    rgba = crop_alpha(np.dstack([a, al]))
    if flip: rgba = rgba[:, ::-1]
    s = (h / rgba.shape[0]) if h else (w / rgba.shape[1])
    rgba = resize(rgba, rgba.shape[1] * s, rgba.shape[0] * s)
    c = halftone_cmyk(rgba[..., :3], period, mix, **kw) if mode == 'cmyk' else halftone_mono(rgba[..., :3], period, **kw)
    save(out, sticker(np.dstack([c, np.clip(rgba[..., 3], 0, 1)]), r=r, seed=seed))


def torn_mask(H, W, seed, rough=14, step=9):
    """Deckled / hand-torn edge: per-edge random walks, rendered 3x and downsampled."""
    rng = np.random.default_rng(seed)
    ss = 3
    def walk(n):
        v = np.cumsum(rng.normal(0, rough * 0.35, n)); v -= np.linspace(v[0], v[-1], n)
        return np.clip(v + rng.uniform(0, rough * 0.5, n), -rough, rough)
    pts = []
    nx, ny = max(4, W // step), max(4, H // step)
    for i, d in enumerate(walk(nx)): pts.append((i / (nx - 1) * W, rough + d * 0.6))
    for i, d in enumerate(walk(ny)): pts.append((W - rough - d * 0.6, i / (ny - 1) * H))
    for i, d in enumerate(walk(nx)): pts.append(((1 - i / (nx - 1)) * W, H - rough - d * 0.6))
    for i, d in enumerate(walk(ny)): pts.append((rough + d * 0.6, (1 - i / (ny - 1)) * H))
    m = np.zeros((H * ss, W * ss), np.uint8)
    cv2.fillPoly(m, [np.round(np.array(pts) * ss).astype(np.int32)], 255, lineType=cv2.LINE_AA)
    return cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255


def torn(name, out, box, w=None, h=None, mode='mono', seed=1, period=5.5, mix=0.55, rough=14, fibre=True, **kw):
    a = rgb(name, 2200)
    H0, W0 = a.shape[:2]
    a = a[int(box[1] * H0):int(box[3] * H0), int(box[0] * W0):int(box[2] * W0)]
    s = (w / a.shape[1]) if w else (h / a.shape[0])
    a = resize(a, a.shape[1] * s, a.shape[0] * s)
    c = halftone_cmyk(a, period, mix, **kw) if mode == 'cmyk' else halftone_mono(a, period, **kw)
    m = torn_mask(c.shape[0], c.shape[1], seed, rough)
    if fibre:                                              # white paper fibre showing along the torn edge
        inner = cv2.erode((m * 255).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(np.float32) / 255
        rngf = np.random.default_rng(seed + 9)
        noise = cv2.GaussianBlur(rngf.random(m.shape).astype(np.float32), (0, 0), 1.2)
        edge = np.clip((m - inner) * (0.6 + noise), 0, 1)[..., None]
        c = c * (1 - edge) + PAPER_W * edge
    save(out, np.dstack([c, m]))


JOBS = {
    # people (GrabCut on light grounds / oval cameo crops)
    'boy':      lambda: cutout('boy', 'boy', h=900, rect=(0.3, 0.1, 0.7, 0.93), fg=[(0.46, 0.25, 0.54, 0.55)], bg=[(0.3, 0.1, 0.4, 0.2), (0.6, 0.1, 0.7, 0.2), (0.3, 0.8, 0.4, 0.93), (0.6, 0.8, 0.7, 0.93), (0.3, 0.45, 0.36, 0.7), (0.64, 0.45, 0.7, 0.7)], seed=11, tone=0.35),
    'girl':     lambda: cutout('girl', 'girl', h=820, rect=(0.06, 0.04, 0.95, 0.78), fg=[(0.38, 0.12, 0.58, 0.55)], bg=[(0.06, 0.04, 0.25, 0.3), (0.75, 0.04, 0.95, 0.25), (0.06, 0.3, 0.12, 0.6)], seed=12, tone=0.35),
    'man':      lambda: cutout('man', 'man', h=760, oval=(0.5, 0.53, 0.355, 0.40), seed=13, tone=0.3),
    'mother':   lambda: cutout('mother', 'mother', h=900, oval=(0.5, 0.49, 0.315, 0.36), mode='cmyk', mix=0.45, seed=14),
    'king':     lambda: cutout('king', 'king', h=960, rect=(0.03, 0.0, 0.97, 0.83), fg=[(0.35, 0.05, 0.55, 0.5)], seed=15, period=5.5),
    'flowers':  lambda: cutout('flowers', 'flowers', h=820, rect=(0.04, 0.05, 0.96, 0.95), mode='cmyk', mix=0.55, seed=18),
    'bird_b':   lambda: cutout('birds', 'bird_b', h=560, rect=(0.62, 0.42, 0.98, 0.97), mode='cmyk', mix=0.55, seed=20),
    'earth':    lambda: cutout('earth', 'earth', h=940, oval='auto', mode='cmyk', mix=0.5, period=7.0, seed=21, r=6),
    'sun':      lambda: cutout('sun', 'sun', h=760, oval='auto', mode='cmyk', mix=0.5, period=7.0, seed=22, r=6, sat=1.2),
    # torn prints / photographs (rectangles with deckled edges)
    'goya_a':   lambda: torn('goya_a', 'goya_a', (0.25, 0.19, 0.72, 0.76), w=1000, seed=31),
    'goya_b':   lambda: torn('goya_b', 'goya_b', (0.03, 0.04, 0.97, 0.92), w=1100, seed=32),
    'goya_c':   lambda: torn('goya_c', 'goya_c', (0.01, 0.01, 0.99, 0.92), w=1000, seed=33),
    'goya_d':   lambda: torn('goya_d', 'goya_d', (0.01, 0.01, 0.99, 0.92), w=1000, seed=34),
    'globe':    lambda: torn('globe', 'globe', (0.02, 0.02, 0.98, 0.95), h=800, seed=35, period=6.0),
    'court':    lambda: torn('court', 'court', (0.06, 0.03, 0.94, 0.86), h=860, seed=36, mode='cmyk', mix=0.35),
    'map_a':    lambda: torn('map_a', 'map_a', (0.0, 0.0, 1.0, 1.0), w=1500, seed=37, period=5.0),
    'map_b':    lambda: torn('map_b', 'map_b', (0.0, 0.0, 1.0, 1.0), w=1500, seed=38, period=5.0),
    'ruins':    lambda: torn('ruins', 'ruins', (0.0, 0.0, 1.0, 1.0), w=1000, seed=39, mode='cmyk', mix=0.4),
    'aircraft': lambda: torn('aircraft', 'aircraft', (0.02, 0.02, 0.98, 0.95), h=760, seed=40),
    'children': lambda: torn('children', 'children', (0.13, 0.08, 0.94, 0.78), w=1100, seed=41, mode='cmyk', mix=0.35),
}
if __name__ == '__main__':
    for k, f in JOBS.items():
        if not ONLY or k in ONLY: f()
    json.dump(layout, open(OUT + 'layout.json', 'w'), indent=1)

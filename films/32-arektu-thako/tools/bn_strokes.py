"""Bangla words → chalk centre-line strokes (the engine extension for this film).

Each word is set once in an OFL Bangla face (shaped by Raqm/HarfBuzz through Pillow), the মাত্রা (headline) band is
found and taken out, the rest is skeletonised and traced into polylines, and the strokes are ordered the way the word
is written by hand: letter by letter left to right, each letter top-down from its first free end, and the headline
drawn last across the word as one stroke per run.

Output: js/bn.js  →  export const BN = { "<hand>|<word>": { w, strokes: [[[x,y],…],…], matra: [[x0,x1,y],…] } }
in em units, x from the pen start, y down from the baseline (negative is above it).
Run: python3 tools/bn_strokes.py   (from the project folder; word list in tools/bn_words.json)
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.morphology import skeletonize, opening, disk
from skimage.measure import label

D = os.path.dirname(os.path.abspath(__file__)) + '/../'
FONTS = {'teacher': D + 'fonts/HindSiliguri-500-bn.ttf', 'child': D + 'fonts/Atma-500-bn.ttf'}
PX = 360                                    # render size (px per em)


def render(word, hand):
    f = ImageFont.truetype(FONTS[hand], PX, layout_engine=ImageFont.Layout.RAQM)
    l, t, r, b = f.getbbox(word, anchor='ls', language='bn')
    pad = 40
    W, H = r - l + 2 * pad, b - t + 2 * pad
    im = Image.new('L', (W, H), 0)
    ImageDraw.Draw(im).text((pad - l, pad - t), word, font=f, fill=255, anchor='ls', language='bn')
    adv = f.getlength(word, language='bn')
    return np.array(im) > 127, (pad - l, pad - t), adv


def headline_band(hand):
    """rows (relative to baseline, px) of the মাত্রা for this face, from a reference word"""
    m, (ox, oy), _ = render('কখগঘনমতপ', hand)
    rows = m.sum(1) / max(1, m.any(0).sum())
    ys = np.where(rows > .6)[0]
    return ys.min() - oy, ys.max() - oy


def trace(skel):
    """skeleton → list of polylines (pixel coords), greedy straightest continuation at junctions"""
    P = set(zip(*np.nonzero(skel)))
    nb = lambda p: [(p[0] + dy, p[1] + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx) and (p[0] + dy, p[1] + dx) in P]
    deg = {p: len(nb(p)) for p in P}
    used = set()                            # undirected pixel edges already drawn
    key = lambda a, b: (a, b) if a < b else (b, a)
    def walk(start, nxt, prev_dir=None):
        path = [start, nxt]; used.add(key(start, nxt))
        while True:
            cur = path[-1]
            cand = [q for q in nb(cur) if key(cur, q) not in used]
            if not cand: break
            # direction over the last few pixels
            a = path[max(0, len(path) - 6)]; d0 = (cur[0] - a[0], cur[1] - a[1])
            def turn(q):
                d1 = (q[0] - cur[0], q[1] - cur[1])
                return -(d0[0] * d1[0] + d0[1] * d1[1]) / (math.hypot(*d0) * math.hypot(*d1) + 1e-9)
            cand.sort(key=turn)
            if deg[cur] > 2 and turn(cand[0]) > -.2: break      # a junction with no straight way on: lift the chalk
            q = cand[0]
            used.add(key(cur, q)); path.append(q)
        return path
    strokes = []
    def remaining():
        return [p for p in P if any(key(p, q) not in used for q in nb(p))]
    while True:
        R = remaining()
        if not R: break
        ends = [p for p in R if deg[p] == 1] or [p for p in R if sum(1 for q in nb(p) if key(p, q) not in used) == 1] or R
        # write from the top-left free end
        s = min(ends, key=lambda p: p[0] * .55 + p[1])
        cand = [q for q in nb(s) if key(s, q) not in used]
        path = walk(s, cand[0])
        if len(path) > 3: strokes.append(path)
    return strokes


def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = np.array(pts[0], float), np.array(pts[-1], float); ab = b - a; L = np.hypot(*ab) + 1e-9
    d = [abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / L for p in pts[1:-1]]
    i = int(np.argmax(d)) + 1
    if d[i - 1] > eps: return rdp(pts[:i + 1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]


def word_strokes(word, hand, band):
    m, (ox, oy), adv = render(word, hand)
    h0, h1 = band[0] + oy, band[1] + oy
    hy0, hy1 = max(0, h0 - 3), h1 + 3
    # headline runs: columns where the band is mostly ink
    col = m[hy0:hy1 + 1].mean(0) > .55
    runs, x = [], 0
    while x < len(col):
        if col[x]:
            x0 = x
            while x < len(col) and col[x]: x += 1
            if x - x0 > PX * .12: runs.append((x0, x - 1))
        else: x += 1
    body = m.copy()
    for x0, x1 in runs: body[hy0:hy1 + 1, x0:x1 + 1] = False
    body = opening(body, disk(2)).astype(bool)
    lab = label(body, connectivity=2)
    comps = []
    for k in range(1, lab.max() + 1):
        c = lab == k
        if c.sum() < PX * PX * .00015: continue
        ys, xs = np.nonzero(c)
        comps.append((xs.min(), c))
    comps.sort(key=lambda z: z[0])
    out = []
    for _, c in comps:
        ys, xs = np.nonzero(c)
        if ys.max() < hy1 + 2 and np.ptp(ys) < PX * .07: continue   # stub above the headline
        if max(np.ptp(xs), np.ptp(ys)) < PX * .15 and c.sum() > .5 * (np.ptp(xs) + 1) * (np.ptp(ys) + 1):          # a dot (the nukta of র, য়, ড়…): one short pressed dab
            cx, cy, r = xs.mean(), ys.mean(), max(3, (np.ptp(xs) + np.ptp(ys)) / 6)
            out.append([[round((cx - r - ox) / PX, 4), round((cy - r * .4 - oy) / PX, 4)], [round((cx + r - ox) / PX, 4), round((cy + r * .4 - oy) / PX, 4)]])
            continue
        sk = skeletonize(c)
        for path in trace(sk):
            pts = [(x, y) for (y, x) in path]
            if any(y > h1 for x, y in pts):                     # a stem through the headline: start it at the headline, not above
                k = 0
                while k < len(pts) and pts[k][1] < h0: k += 1
                if 0 < k < PX * .08: pts = pts[k:]
                k = len(pts)
                while k > 0 and pts[k - 1][1] < h0: k -= 1
                if len(pts) - k < PX * .08: pts = pts[:k]
            # prune tiny spurs
            below = max(y for x, y in pts) > oy + PX * .02          # a short tail under the baseline (the dot of র) stays
            if len(pts) < PX * (.012 if below else .05): continue
            if max(y for x, y in pts) < hy0 and len(pts) < PX * .09: continue   # a stem's stub poking over the headline
            pts = rdp(pts, 1.1)
            out.append([[round((x - ox) / PX, 4), round((y - oy) / PX, 4)] for x, y in pts])
    my = ((h0 + h1) / 2 - oy) / PX
    matra = [[round((x0 - ox) / PX, 4), round((x1 - ox) / PX, 4), round(my, 4)] for x0, x1 in runs]
    return {'w': round(adv / PX, 4), 'strokes': out, 'matra': matra, 'hw': round((h1 - h0) / PX / 2, 4)}


if __name__ == '__main__':
    words = json.load(open(D + 'tools/bn_words.json'))
    bands = {h: headline_band(h) for h in FONTS}
    BN = {}
    for hand, lst in words.items():
        for w in lst:
            BN[hand + '|' + w] = word_strokes(w, hand, bands[hand])
            print(hand, w, len(BN[hand + '|' + w]['strokes']), 'strokes', len(BN[hand + '|' + w]['matra']), 'matra', file=sys.stderr)
    open(D + 'js/bn.js', 'w').write('// generated by tools/bn_strokes.py — Bangla centre-line strokes (em units, baseline y=0)\nexport const BN = ' + json.dumps(BN, ensure_ascii=False, separators=(',', ':')) + ';\n')

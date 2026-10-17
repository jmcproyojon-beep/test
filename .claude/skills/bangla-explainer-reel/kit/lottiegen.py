"""Tiny Lottie (Bodymovin 5.x) generator: vector shape layers with trim-path draw-ons and
Disney-principle keyframes (squash & stretch, overshoot, follow-through). Keyframes are placed at
absolute composition time because HyperFrames seeks every Lottie to the global time."""
import math

FPS = 30
EASE_OUT = {"o": {"x": [0.2], "y": [1]}, "i": {"x": [0.3], "y": [1]}}
EASE_IO = {"o": {"x": [0.6], "y": [0]}, "i": {"x": [0.3], "y": [1]}}


def hexrgb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [1]


def anim_prop(keys, dims=1):
    """keys: [(time_s, value_or_list)] -> animated Lottie property with eased segments."""
    out = []
    for k, (t, v) in enumerate(keys):
        v = v if isinstance(v, list) else [v]
        kf = {"t": round(t * FPS, 2), "s": v}
        if k < len(keys) - 1:
            kf.update({"o": {"x": [0.25] * dims, "y": [0.1] * dims}, "i": {"x": [0.3] * dims, "y": [1] * dims}})
        out.append(kf)
    return {"a": 1, "k": out}


def static(v):
    return {"a": 0, "k": v}


def transform(p=(0, 0), a=(0, 0), s=None, r=None, o=None):
    return {"ty": "tr", "p": static(list(p)), "a": static(list(a)), "s": s or static([100, 100]),
            "r": r or static(0), "o": o or static(100), "sk": static(0), "sa": static(0)}


def path(points, closed=False, smooth=0.0):
    """Polyline/curve through points; smooth>0 builds Catmull-Rom-ish tangents."""
    n = len(points)
    ins, outs = [], []
    for i, (x, y) in enumerate(points):
        if smooth and 0 < i < n - 1 or (smooth and closed):
            px, py = points[i - 1]
            nx, ny = points[(i + 1) % n]
            tx, ty = (nx - px) * smooth / 2, (ny - py) * smooth / 2
            ins.append([-tx, -ty]); outs.append([tx, ty])
        else:
            ins.append([0, 0]); outs.append([0, 0])
    return {"ty": "sh", "ks": static({"c": closed, "v": [list(p) for p in points], "i": ins, "o": outs})}


def stroke(color, w):
    return {"ty": "st", "c": static(hexrgb(color)), "o": static(100), "w": static(w), "lc": 2, "lj": 2, "ml": 4}


def fill(color):
    return {"ty": "fl", "c": static(hexrgb(color)), "o": static(100), "r": 1}


def trim(s, e):
    return {"ty": "tm", "s": s, "e": e, "o": static(0), "m": 1}


def ellipse(cx, cy, d):
    return {"ty": "el", "p": static([cx, cy]), "s": static([d, d]), "d": 1}


def group(items, tr=None):
    return {"ty": "gr", "it": items + [tr or transform()]}


def layer(shapes, op, ind, ks=None):
    return {"ddd": 0, "ind": ind, "ty": 4, "nm": f"l{ind}", "sr": 1, "ip": 0, "op": op, "st": 0, "bm": 0,
            "ks": ks or {"o": static(100), "r": static(0), "p": static([0, 0, 0]), "a": static([0, 0, 0]), "s": static([100, 100, 100])},
            "shapes": shapes}


def comp(w, h, op, layers):
    return {"v": "5.7.4", "fr": FPS, "ip": 0, "op": op, "w": w, "h": h, "nm": "gen", "ddd": 0, "assets": [], "layers": layers}


def draw_on(t0, dur):
    return trim(static(0), anim_prop([(t0, 0), (t0 + dur, 100)]))


def squash_scale(t0, cx, cy):
    """Exaggerated pop with squash & stretch and elastic settle (layer-level transform)."""
    return {"o": anim_prop([(t0 - .01, 0), (t0, 100)]), "r": static(0), "p": static([cx, cy, 0]), "a": static([cx, cy, 0]),
            "s": anim_prop([(t0, [0, 0, 100]), (t0 + .16, [122, 84, 100]), (t0 + .3, [90, 112, 100]),
                            (t0 + .44, [104, 97, 100]), (t0 + .6, [100, 100, 100])], 3)}


# ---------------- components ----------------
def check_badge(t0, op, size=260, color="#00A86B"):
    c = size / 2
    ring = group([ellipse(c, c, size * .82), stroke(color, size * .07), draw_on(t0, .4)])
    disc = group([ellipse(c, c, size * .82), fill("#FFFFFF")])
    tick = group([path([(c - size * .2, c + size * .01), (c - size * .05, c + size * .16), (c + size * .22, c - size * .14)]),
                  stroke(color, size * .09), draw_on(t0 + .3, .3)])
    return comp(size, size, op, [layer([tick, ring, disc], op, 1, squash_scale(t0, c, c))])


def burst(t0, op, size=560, color="#FFB800", rays=12):
    c = size / 2
    shapes = []
    for k in range(rays):
        a = 2 * math.pi * k / rays
        r0, r1 = size * .16, size * .46
        p0 = (c + r0 * math.cos(a), c + r0 * math.sin(a)); p1 = (c + r1 * math.cos(a), c + r1 * math.sin(a))
        # leading edge shoots out, trailing edge follows a beat later (follow-through)
        shapes.append(group([path([p0, p1]), stroke(color if k % 2 else "#111111", size * .022),
                             trim(anim_prop([(t0 + .06, 0), (t0 + .42, 100)]), anim_prop([(t0, 0), (t0 + .26, 100)]))]))
    dots = []
    for k in range(rays):
        a = 2 * math.pi * (k + .5) / rays
        r = size * .38
        dots.append(group([ellipse(0, 0, size * .035), fill("#2D5BFF" if k % 2 else "#FF3B30")],
                          transform(s=anim_prop([(t0 + .1, [0, 0]), (t0 + .28, [140, 140]), (t0 + .6, [0, 0])], 2),
                                    p=(c + r * math.cos(a), c + r * math.sin(a)))))
    return comp(size, size, op, [layer(shapes + dots, op, 1)])


def scribble(t0, op, w=640, h=200, color="#FF3B30"):
    """Hand-drawn loop around a word: an overlapping ellipse-ish stroke that draws on."""
    pts = []
    for k in range(15):
        a = -2.6 + 2 * math.pi * 1.08 * k / 14
        wob = 1 + .05 * math.sin(k * 2.3)
        pts.append((w / 2 + (w * .46) * math.cos(a) * wob, h / 2 + (h * .40) * math.sin(a) * wob))
    g = group([path(pts, smooth=.9), stroke(color, 10), draw_on(t0, .55)])
    return comp(w, h, op, [layer([g], op, 1)])


def arc_arrow(t0, op, w, h, p0, p1, bulge=-260, color="#111111"):
    """Curved arrow drawing along an arc (Disney: arcs), head pops with overshoot at the end."""
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + bulge
    pts = [((1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * mx + u * u * p1[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * my + u * u * p1[1]) for u in [i / 12 for i in range(13)]]
    body = group([path(pts, smooth=.9), stroke(color, 12), draw_on(t0, .5)])
    ang = math.atan2(pts[-1][1] - pts[-2][1], pts[-1][0] - pts[-2][0])
    L = 46
    hp = [(p1[0] - L * math.cos(ang - .5), p1[1] - L * math.sin(ang - .5)), p1, (p1[0] - L * math.cos(ang + .5), p1[1] - L * math.sin(ang + .5))]
    head = group([path(hp), stroke(color, 12)],
                 transform(p=p1, a=p1, s=anim_prop([(t0 + .45, [0, 0]), (t0 + .58, [140, 140]), (t0 + .75, [100, 100])], 2)))
    return comp(w, h, op, [layer([head, body], op, 1)])


def ripple(t0, t1, op, size=700, color="#00A3C4", period=1.1, rings=3):
    shapes = []
    c = size / 2
    t = t0
    while t < t1:
        for k in range(rings):
            ts = t + k * period / rings
            shapes.append(group([ellipse(c, c, size * .9), stroke(color, 6)],
                                transform(p=(c, c), a=(c, c), s=anim_prop([(ts, [0, 0]), (ts + period, [100, 100])], 2),
                                          o=anim_prop([(ts - .01, 0), (ts, 90), (ts + period, 0)]))))
        t += period
    return comp(size, size, op, [layer(shapes, op, 1)])

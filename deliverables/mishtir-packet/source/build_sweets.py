"""মিষ্টির প্যাকেট — 70 s 9:16 painterly 2.5D animated short (HyperFrames, vector illustration)."""
import json, math, os, random

P = "/home/user/test/projects/mishtir-packet"
SCH = json.load(open(f"{P}/artifacts/schedule.json"))
ENV = json.load(open(f"{P}/artifacts/envelopes.json"))
W, H, DUR = 1080, 1920, 70.0
rng = random.Random(7)
js = []

# palette
CH, TEAL, TEAL2, AMB, AMB2, RIM = "#0d0f12", "#0f2a2e", "#163b40", "#ffb35a", "#ff9a3c", "#ffd9a0"
COLD, COLD2 = "#7f97a6", "#2b3a46"
SKIN = {"mojid": "#8a5a3c", "father": "#7b4f33", "mother": "#93603f", "son": "#86573a", "daughter": "#9a6747", "n1": "#7e5236", "n2": "#8c5b3d"}

# ---------------------------------------------------------------- characters

def crow(uid, kind, x, y, s=1.0, flip=False, rim=AMB, sil=False):
    """Indian house crow, side view facing right; feet at (0,0). kind: dadu | chhana."""
    dadu = kind == "dadu"
    body = "#0b0c0e" if sil else "#15171b"
    dark = "#08090b" if sil else "#0e1013"
    neck = ("#2a2c30" if sil else "url(#neckSilver)") if dadu else ("#1c1e22" if sil else "#5a626b")
    hy = 12 if dadu else 0          # hunched: head lower
    hx = 6 if dadu else 0
    er = 7 if dadu else 10          # eye radius
    bk = 58 if dadu else 70         # beak length
    sx = -s if flip else s
    g = [f'<g id="{uid}" transform="translate({x},{y}) scale({sx},{s})">']
    # tail + body + wing
    g.append(f'<path d="M-60,-62 L-150,-18 L-138,-4 L-120,-14 L-128,2 L-46,-40 Z" fill="{dark}"/>')
    g.append(f'<ellipse cx="-12" cy="-96" rx="78" ry="56" fill="{body}"/>')
    g.append(f'<path d="M-82,-104 Q-8,-160 58,-108 Q26,-74 -64,-60 Z" fill="{dark}"/>')
    # primaries (dadu has one notched / short feather)
    for k, (dx, ln) in enumerate([(0, 62), (10, 56), (20, 50 if not dadu else 30), (30, 44)]):
        g.append(f'<path d="M{-40 + dx},-66 L{-40 + dx - ln},-30" stroke="{dark}" stroke-width="12" stroke-linecap="round"/>')
    if not sil:
        g.append(f'<path d="M-82,-104 Q-8,-160 58,-108" fill="none" stroke="#2b5156" stroke-width="5" opacity=".55"/>')
    # legs
    g.append('<g stroke="#1b1c1f" stroke-width="6" stroke-linecap="round" fill="none">'
             '<path d="M-22,-46 L-26,0 M-36,2 L-14,2"/><path d="M8,-46 L6,0 M-6,2 L18,2"/></g>')
    if dadu:  # thin red thread around the left leg
        g.append('<path d="M-32,-20 L-19,-23" stroke="#c4262e" stroke-width="5" stroke-linecap="round"/>')
    # head group (pivot at neck base)
    g.append(f'<g id="{uid}-hd"><g transform="translate({hx},{hy})">')
    g.append(f'<ellipse cx="44" cy="-138" rx="40" ry="44" fill="{neck}"/>')
    hr = 38 if dadu else 43
    g.append(f'<circle cx="72" cy="-176" r="{hr}" fill="{body}"/>')
    if kind == "chhana" and not sil:   # fluffy tufts
        for (cx, cy, r) in [(46, -206, 9), (58, -214, 8), (34, -192, 7), (20, -120, 10), (8, -110, 9)]:
            g.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{body}"/>')
    if not sil:
        g.append(f'<circle cx="88" cy="-182" r="{er + 3}" fill="{"#3a3f45" if dadu else "#22262a"}"/>'
                 f'<circle id="{uid}-eye" cx="88" cy="-182" r="{er}" fill="#141516"/>'
                 f'<circle cx="{88 + er * .35:.1f}" cy="{-182 - er * .35:.1f}" r="{max(2, er * .3):.1f}" fill="#fff" opacity=".9"/>')
    # beak (upper fixed, lower hinged for speech)
    g.append(f'<path d="M100,-186 L{100 + bk},-173 L102,-167 Z" fill="#0b0c0e"/>')
    g.append(f'<g id="{uid}-bl"><path d="M102,-169 L{100 + bk * .82:.0f},-167 L100,-159 Z" fill="#0a0a0c"/></g>')
    g.append('</g></g>')
    # rim light along back / crown
    g.append(f'<path d="M-130,-14 L-60,-60 Q-20,-150 40,-150 Q60,-212 {110 if dadu else 118},-196" fill="none" stroke="{rim}" stroke-width="4" opacity=".75" stroke-linecap="round"/>')
    g.append('</g>')
    return "".join(g)


def crow_fly(uid, kind, x, y, s=1.0, rim=AMB):
    dadu = kind == "dadu"
    neck = "url(#neckSilver)" if dadu else "#5a626b"
    bk = 56 if dadu else 68
    return (f'<g id="{uid}" transform="translate({x},{y}) scale({s})">'
            f'<g id="{uid}-w2"><path d="M-10,-6 Q-60,-90 -150,-110 Q-90,-40 -30,8 Z" fill="#0c0d10"/></g>'
            f'<path d="M-120,4 L-60,-10 L60,-14 Q100,-14 120,-2 Q100,14 60,14 L-60,12 Z" fill="#15171b"/>'
            f'<path d="M-120,4 L-180,-14 L-176,14 Z" fill="#0e1013"/>'
            f'<ellipse cx="96" cy="-6" rx="30" ry="24" fill="{neck}"/><circle cx="122" cy="-12" r="26" fill="#15171b"/>'
            f'<circle cx="132" cy="-16" r="5" fill="#141516"/><circle cx="134" cy="-18" r="1.8" fill="#fff"/>'
            f'<path d="M144,-18 L{144 + bk},-9 L146,-4 Z" fill="#0b0c0e"/><g id="{uid}-bl"><path d="M146,-6 L{144 + bk * .8:.0f},-4 L144,2 Z" fill="#0a0a0c"/></g>'
            + ('<path d="M-30,12 L-34,26" stroke="#c4262e" stroke-width="4"/>' if dadu else '')
            + f'<g id="{uid}-w1"><path d="M-10,-6 Q-50,-110 -160,-140 Q-90,-50 -30,10 Z" fill="#111317"/>'
            f'<path d="M-160,-140 Q-90,-50 -30,10" fill="none" stroke="{rim}" stroke-width="3" opacity=".7"/></g>'
            f'<path d="M-60,-10 L60,-14 Q100,-14 120,-2" fill="none" stroke="{rim}" stroke-width="3" opacity=".6"/></g>')


def person(uid, kind, x, y, s=1.0, facing=1, rim=AMB, arms="down", seated=False):
    """Upper-body figure; waist at (0,0). kinds: mojid, father, mother, son, daughter, n1, n2."""
    skin = SKIN[kind]
    small = kind == "daughter"
    k = 0.78 if small else 1.0
    cloth = {"mojid": "#e8dcc2", "father": "#58707c", "mother": "#7a2234", "son": "#4f5b3b", "daughter": "#d79c38", "n1": "#3e4b54", "n2": "#5b4635"}[kind]
    g = [f'<g id="{uid}" transform="translate({x},{y}) scale({s * facing * k},{s * k})">']
    # torso
    g.append(f'<path d="M-98,-300 Q-120,-290 -116,-230 L-92,0 L92,0 L116,-230 Q120,-290 98,-300 Q60,-318 0,-318 Q-60,-318 -98,-300 Z" fill="{cloth}"/>')
    if kind == "mojid":   # brown shawl over left shoulder + panjabi placket
        g.append('<path d="M-100,-300 Q-40,-316 10,-306 L70,-40 L20,-6 L-96,-120 Z" fill="#6a4127"/>'
                 '<path d="M-100,-300 Q-40,-316 10,-306" fill="none" stroke="#8b5a36" stroke-width="6"/>'
                 '<path d="M30,-306 L30,-200" stroke="#c9b997" stroke-width="5"/><circle cx="30" cy="-270" r="4" fill="#b8a780"/><circle cx="30" cy="-240" r="4" fill="#b8a780"/>')
    if kind == "mother":  # saree pallu with teal border
        g.append('<path d="M-104,-298 Q-10,-330 60,-300 L96,-60 L40,-20 Z" fill="#8c2a3e"/><path d="M60,-300 L96,-60" stroke="#1f6460" stroke-width="16"/>')
    if kind == "father":
        g.append('<path d="M-30,-312 L0,-262 L30,-312" fill="none" stroke="#405560" stroke-width="6"/>')
    # arms
    if arms == "hug":
        g.append(f'<path d="M96,-280 Q170,-240 190,-170 Q150,-150 110,-190 Z" fill="{cloth}"/><path d="M-96,-280 Q-60,-200 40,-190 L44,-166 Q-80,-160 -116,-230 Z" fill="{cloth}"/>')
    elif arms == "cup":
        g.append(f'<path d="M96,-280 Q140,-200 70,-150 L56,-172 Q96,-210 80,-260 Z" fill="{cloth}"/>'
                 f'<g id="{uid}-cup"><path d="M40,-190 L84,-190 L78,-150 L46,-150 Z" fill="#f2efe6"/><path d="M84,-182 Q100,-178 84,-160" fill="none" stroke="#f2efe6" stroke-width="5"/>'
                 f'<circle cx="62" cy="-160" r="10" fill="{skin}"/></g>')
    elif arms == "box":
        g.append(f'<path d="M96,-280 Q130,-200 90,-150 L60,-150 Q90,-210 78,-260 Z" fill="{cloth}"/><path d="M-96,-280 Q-130,-200 -90,-150 L-60,-150 Q-90,-210 -78,-260 Z" fill="{cloth}"/>')
    # neck + head
    g.append(f'<rect x="-22" y="-346" width="44" height="40" fill="{skin}"/>')
    g.append(f'<g id="{uid}-hd"><ellipse cx="0" cy="-400" rx="54" ry="66" fill="{skin}"/>')
    hair = {"mojid": "#bdb9b1", "father": "#2a2523", "mother": "#151213", "son": "#141110", "daughter": "#161212", "n1": "#3a3633", "n2": "#9e9a93"}[kind]
    if kind == "mojid":
        g.append(f'<path d="M-56,-410 Q-58,-470 -4,-472 Q52,-474 56,-414 Q40,-452 -10,-452 Q-34,-452 -56,-410 Z" fill="{hair}"/><path d="M-8,-470 L-14,-450" stroke="#8f8b84" stroke-width="3"/>')
    elif kind == "mother":
        g.append(f'<path d="M-58,-400 Q-62,-474 0,-474 Q62,-474 58,-400 Q44,-446 0,-448 Q-44,-446 -58,-400 Z" fill="{hair}"/><path d="M-70,-380 Q-74,-500 6,-494 Q76,-490 72,-360" fill="none" stroke="#8c2a3e" stroke-width="16"/>')
    elif kind == "daughter":
        g.append(f'<path d="M-58,-400 Q-62,-474 0,-474 Q62,-474 58,-400 Q44,-446 0,-448 Q-44,-446 -58,-400 Z" fill="{hair}"/><ellipse cx="-62" cy="-380" rx="12" ry="30" fill="{hair}"/><ellipse cx="62" cy="-380" rx="12" ry="30" fill="{hair}"/>')
    else:
        g.append(f'<path d="M-56,-408 Q-58,-472 0,-472 Q58,-472 56,-408 Q40,-450 0,-450 Q-40,-450 -56,-408 Z" fill="{hair}"/>')
    # brows, eyes (pupils movable), nose, moustache, mouth
    g.append(f'<path d="M-36,-424 L-12,-428 M12,-428 L36,-424" stroke="{hair if kind != "mojid" else "#9c978f"}" stroke-width="5" stroke-linecap="round"/>')
    g.append(f'<g id="{uid}-eyes"><ellipse cx="-22" cy="-408" rx="11" ry="6" fill="#f3ece0"/><ellipse cx="22" cy="-408" rx="11" ry="6" fill="#f3ece0"/>'
             f'<g id="{uid}-pup"><circle cx="-20" cy="-408" r="4.5" fill="#1a1210"/><circle cx="24" cy="-408" r="4.5" fill="#1a1210"/></g></g>')
    g.append(f'<path d="M0,-404 Q-6,-384 4,-378" fill="none" stroke="#5e3a26" stroke-width="3"/>')
    if kind == "mojid":
        g.append('<path d="M-26,-366 Q0,-378 26,-366 Q14,-360 0,-364 Q-14,-360 -26,-366 Z" fill="#a9a59d"/>')
    if kind in ("father", "n1"):
        g.append('<path d="M-24,-366 Q0,-376 24,-366 Q12,-360 0,-363 Q-12,-360 -24,-366 Z" fill="#2a2523"/>')
    g.append(f'<ellipse id="{uid}-m" cx="0" cy="-352" rx="13" ry="3.5" fill="#4a1e16"/>')
    if kind in ("mojid", "mother", "son", "daughter", "father"):
        g.append(f'<path id="{uid}-sm" d="M-16,-354 Q0,-344 16,-354" fill="none" stroke="#4a1e16" stroke-width="3" opacity=".8"/>')
    g.append('</g>')
    g.append(f'<path d="M98,-300 Q120,-290 116,-230 L92,0" fill="none" stroke="{rim}" stroke-width="5" opacity=".55"/>'
             f'<path d="M50,-450 Q60,-420 52,-370" fill="none" stroke="{rim}" stroke-width="4" opacity=".6"/>')
    g.append('</g>')
    return "".join(g)


# ---------------------------------------------------------------- props / sets

def grill(x, y, w, h, pat="bars", col="#5a3420", hi="#8a5634"):
    g = [f'<g opacity=".97">']
    g.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="{col}" stroke-width="22"/>')
    if pat == "bars":
        for bx in range(int(x) + 70, int(x + w) - 20, 78):
            g.append(f'<path d="M{bx},{y} L{bx},{y + h}" stroke="{col}" stroke-width="13"/><path d="M{bx - 4},{y} L{bx - 4},{y + h}" stroke="{hi}" stroke-width="2.5" opacity=".7"/>')
        for by in (y + h * .33, y + h * .66):
            g.append(f'<path d="M{x},{by:.0f} L{x + w},{by:.0f}" stroke="{col}" stroke-width="12"/>')
        for bx in range(int(x) + 109, int(x + w) - 40, 156):  # decorative curls
            g.append(f'<path d="M{bx - 30},{y + 60} q30,-40 60,0 q-30,40 -60,0" fill="none" stroke="{col}" stroke-width="8"/>')
    else:  # diamond lattice
        step = 110
        for k in range(-12, 14):
            x0 = x + k * step
            g.append(f'<path d="M{x0},{y} L{x0 + h},{y + h}" stroke="{col}" stroke-width="10"/><path d="M{x0 + h},{y} L{x0},{y + h}" stroke="{col}" stroke-width="10"/>')
    g.append('</g>')
    return "".join(g)


def room(sid, cold=False):
    wall = "url(#roomCold)" if cold else "url(#roomAmber)"
    lamp = "#cfe2ec" if cold else "#ffe2a8"
    s = [f'<rect x="-200" y="-200" width="1480" height="2320" fill="{wall}"/>']
    s.append(f'<rect x="-200" y="1500" width="1480" height="620" fill="{"#1f2b33" if cold else "#3a2414"}"/>')
    # framed picture + wall clock + curtain + lamp glow
    s.append(f'<rect x="140" y="420" width="230" height="170" fill="{"#24323b" if cold else "#4a2e19"}" stroke="{"#5b6b75" if cold else "#a07a45"}" stroke-width="10"/>')
    s.append(f'<g id="{sid}-clock"><circle cx="820" cy="520" r="74" fill="{"#d8e2e7" if cold else "#f1e4c8"}" stroke="{"#6c7b84" if cold else "#7a5530"}" stroke-width="10"/>'
             f'<path d="M820,520 L820,470" stroke="#222" stroke-width="6"/><path d="M820,520 L856,540" stroke="#222" stroke-width="5"/>'
             f'<path id="{sid}-sec" d="M820,520 L820,458" stroke="#a3262a" stroke-width="2.5"/></g>')
    s.append(f'<path d="M960,250 Q1000,800 940,1500 L1280,1500 L1280,250 Z" fill="{"#2a3b45" if cold else "#5c2a1c"}" opacity=".85"/>')
    s.append(f'<circle cx="980" cy="1080" r="260" fill="{lamp}" opacity=".18" filter="url(#blur40)"/>')
    # sofa
    s.append(f'<path d="M60,1300 Q60,1180 180,1180 L900,1180 Q1020,1180 1020,1300 L1020,1560 L60,1560 Z" fill="{"#33444f" if cold else "#6b3a22"}"/>'
             f'<rect x="60" y="1400" width="960" height="160" rx="30" fill="{"#2a3943" if cold else "#5a2f1b"}"/>')
    return "".join(s)


def wall_ext(sid):
    s = [f'<rect x="-200" y="-200" width="1480" height="2320" fill="url(#wallExt)"/>']
    for yy in range(-160, 2100, 46):
        off = 0 if (yy // 46) % 2 else 40
        s.append(f'<path d="M-200,{yy} L1280,{yy}" stroke="#0a1a1d" stroke-width="2" opacity=".5"/>')
    s.append(f'<rect x="170" y="300" width="740" height="980" fill="url(#winAmber)"/>')
    s.append('<path d="M170,300 Q330,700 250,1280 L170,1280 Z" fill="#6b2d1d" opacity=".9"/><path d="M910,300 Q760,760 840,1280 L910,1280 Z" fill="#6b2d1d" opacity=".9"/>')
    s.append(f'<rect id="{sid}-glow" x="170" y="300" width="740" height="980" fill="#ffd38a" opacity="0"/>')
    s.append('<rect x="130" y="1280" width="820" height="40" fill="#1a1d20"/>')                 # sill
    s.append('<rect x="930" y="1420" width="170" height="120" fill="#22282c"/><path d="M945,1440 L1085,1440 M945,1465 L1085,1465 M945,1490 L1085,1490" stroke="#141819" stroke-width="5"/>')  # AC unit
    s.append('<path d="M60,-200 L60,2100" stroke="#1c2326" stroke-width="18"/>')                 # pipe
    s.append('<path d="M-200,180 Q540,300 1280,140" fill="none" stroke="#050606" stroke-width="5"/><path d="M-200,230 Q540,340 1280,200" fill="none" stroke="#050606" stroke-width="3"/>')
    return "".join(s)


def skyline(y0, col, n, hmin, hmax, seed, lit=0.0, win="#ffb35a"):
    r = random.Random(seed)
    s, x = [], -200
    while x < 1300:
        w = r.randint(90, 200); h = r.randint(hmin, hmax)
        s.append(f'<rect x="{x}" y="{y0 - h}" width="{w}" height="{h + 600}" fill="{col}"/>')
        if r.random() < .55:   # water tank
            s.append(f'<rect x="{x + w * .25:.0f}" y="{y0 - h - 46}" width="{w * .35:.0f}" height="46" rx="8" fill="{col}"/>')
        if r.random() < .35:
            s.append(f'<path d="M{x + w * .7:.0f},{y0 - h} l0,-70 m-18,18 l36,0" stroke="{col}" stroke-width="4"/>')
        if lit:
            for _ in range(int(w * h / 9000)):
                if r.random() < lit:
                    s.append(f'<rect x="{x + r.randint(10, max(11, w - 26))}" y="{y0 - h + r.randint(20, max(21, h - 30))}" width="14" height="18" fill="{win}" opacity="{r.uniform(.35, .85):.2f}"/>')
        x += w + r.randint(0, 20)
    return "".join(s)


def sweets_plate(x, y, s=1.0, bite=True):
    g = [f'<g transform="translate({x},{y}) scale({s})">',
         '<ellipse cx="0" cy="20" rx="210" ry="58" fill="#0e1418" opacity=".5"/>',
         '<ellipse cx="0" cy="0" rx="200" ry="56" fill="#d9e1e5"/><ellipse cx="0" cy="-6" rx="160" ry="40" fill="#c4ced3"/>']
    for (dx, dy, c, r) in [(-90, -24, "#f4efe4", 34), (-20, -34, "#4a1f16", 32), (55, -26, "#d98a3c", 30), (110, -10, "#f4efe4", 30), (-40, 4, "#4a1f16", 30)]:
        g.append(f'<ellipse cx="{dx}" cy="{dy}" rx="{r}" ry="{r * .8:.0f}" fill="{c}"/>')
    if bite:
        g.append('<path d="M20,6 a34,28 0 1 0 64,-6 a14,14 0 0 1 -18,-10 a12,12 0 0 1 -18,-8 a12,12 0 0 1 -14,6 Z" fill="#f4efe4"/>')
    g.append('</g>')
    return "".join(g)


def sweet_box(x, y, s=1.0, open_=False):
    g = [f'<g transform="translate({x},{y}) scale({s})">']
    g.append('<rect x="-170" y="-90" width="340" height="180" rx="8" fill="#f3e6e9"/><rect x="-170" y="-90" width="340" height="34" fill="#e6c2cc"/>')
    g.append('<path d="M-40,-90 L-40,90 M40,-90 L40,90" stroke="#ece0e3" stroke-width="6"/>')
    g.append('<rect x="-170" y="-12" width="340" height="24" fill="#c3192a"/><rect x="-12" y="-90" width="24" height="180" fill="#c3192a"/>')
    g.append('<path d="M0,-92 Q-60,-150 -70,-110 Q-60,-82 0,-92 Q60,-150 70,-110 Q60,-82 0,-92 Z" fill="#d7202f"/><circle cx="0" cy="-92" r="13" fill="#a8121f"/>')
    g.append('</g>')
    return "".join(g)


DEFS = """<defs>
<radialGradient id="roomAmber" cx="55%" cy="45%" r="75%"><stop offset="0" stop-color="#ffcf86"/><stop offset=".45" stop-color="#c06a24"/><stop offset="1" stop-color="#2a170c"/></radialGradient>
<radialGradient id="roomCold" cx="50%" cy="42%" r="78%"><stop offset="0" stop-color="#a9bfcb"/><stop offset=".5" stop-color="#4b6171"/><stop offset="1" stop-color="#141c22"/></radialGradient>
<radialGradient id="winAmber" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#ffd690"/><stop offset=".6" stop-color="#e3882f"/><stop offset="1" stop-color="#7a3a15"/></radialGradient>
<linearGradient id="wallExt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1d21"/><stop offset=".5" stop-color="#142c31"/><stop offset="1" stop-color="#081214"/></linearGradient>
<linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060c0f"/><stop offset=".6" stop-color="#11282d"/><stop offset="1" stop-color="#1c3a3f"/></linearGradient>
<linearGradient id="skyDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4a52"/><stop offset=".45" stop-color="#b7895f"/><stop offset=".75" stop-color="#f2b277"/><stop offset="1" stop-color="#ffe0ad"/></linearGradient>
<linearGradient id="stair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2614"/><stop offset="1" stop-color="#0b0a09"/></linearGradient>
<linearGradient id="neckSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7dbe0"/><stop offset="1" stop-color="#8f969d"/></linearGradient>
<radialGradient id="moonG"><stop offset="0" stop-color="#f6efd8"/><stop offset=".25" stop-color="#e9dfbf" stop-opacity=".9"/><stop offset="1" stop-color="#e9dfbf" stop-opacity="0"/></radialGradient>
<radialGradient id="bulbG"><stop offset="0" stop-color="#fff0c4"/><stop offset=".3" stop-color="#ffb35a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>
<filter id="blur40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
<filter id="blur12" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
</defs>"""

# ---------------------------------------------------------------- scenes
SC = [("s1a", 0.0, 4.9), ("s1b", 4.3, 10.6), ("s2", 10.0, 20.6), ("s3", 20.0, 30.6),
      ("s4", 30.0, 40.6), ("s5", 40.0, 50.6), ("s6", 50.0, 60.6), ("s7", 60.0, 70.0)]
T = {k: (a, b) for k, a, b in SC}
svg = {}

# s1a — stairwell, sweet box carried up
st = ['<rect x="-200" y="-200" width="1480" height="2320" fill="url(#stair)"/>',
      '<circle cx="760" cy="180" r="420" fill="url(#bulbG)"/>',
      '<path d="M720,-200 L760,140" stroke="#0a0908" stroke-width="4"/><circle cx="760" cy="170" r="26" fill="#fff4cf"/>',
      '<path d="M760,170 L1180,1900 L260,1900 Z" fill="#ffcf86" opacity=".08"/>']
steps = ['<g id="s1a-steps">']
for k in range(16):
    yy = 2100 - k * 170
    steps.append(f'<path d="M-200,{yy} L1280,{yy - 120} L1280,{yy - 70} L-200,{yy + 50} Z" fill="{["#2a1b10", "#3a2615"][k % 2]}"/><path d="M-200,{yy} L1280,{yy - 120}" stroke="#7a4f2a" stroke-width="3" opacity=".6"/>')
steps.append('</g>')
st.append("".join(steps))
st.append('<path d="M-200,820 L1280,560" stroke="#1b120b" stroke-width="16"/><path d="M-200,800 L1280,540" stroke="#a0703f" stroke-width="3" opacity=".6"/>')  # banister
st.append('<g id="s1a-box">' + sweet_box(540, 1040, 1.9) +
          '<path d="M180,1180 Q150,1300 230,1420 L330,1420 Q300,1300 330,1200 Z" fill="#e8dcc2"/><ellipse cx="330" cy="1180" rx="46" ry="34" fill="#8a5a3c"/>'
          '<path d="M900,1180 Q930,1300 850,1420 L750,1420 Q780,1300 750,1200 Z" fill="#e8dcc2"/><ellipse cx="750" cy="1180" rx="46" ry="34" fill="#8a5a3c"/>'
          '<path d="M260,1040 Q540,980 820,1040" fill="none" stroke="#ffe0a8" stroke-width="5" opacity=".6"/></g>')
svg["s1a"] = st
js += ['tl.fromTo("#s1a-steps",{y:0},{y:520,duration:4.9,ease:"none"},0);',
       'tl.fromTo("#s1a-box",{y:40,rotation:-1.5,svgOrigin:"540 1040"},{y:-30,rotation:1.5,duration:1.2,ease:"sine.inOut",yoyo:true,repeat:3},0);',
       'tl.fromTo("#s1a-cam",{scale:1.18,svgOrigin:"540 1040"},{scale:1.04,duration:4.9,ease:"sine.out"},0);']

# s1b — crows on the window grill outside the lit flat
s = [wall_ext("s1b"), grill(170, 300, 740, 980),
     '<path d="M-200,1600 L1280,1600" stroke="#2c1c12" stroke-width="20"/>',          # grill lower rail extends to crows' perch
     '<rect x="100" y="1560" width="880" height="26" fill="#5a3420"/><path d="M100,1562 L980,1562" stroke="#8a5634" stroke-width="3"/>',
     crow("dk1", "dadu", 250, 1560, 1.5, rim=AMB), crow("ch1", "chhana", 860, 1560, 1.3, flip=True, rim=AMB)]
svg["s1b"] = s
js += ['tl.fromTo("#s1b-cam",{scale:1.12,x:-40,svgOrigin:"540 1300"},{scale:1.0,x:0,duration:6.3,ease:"sine.out"},4.3);',
       'tl.to("#s1b-glow",{opacity:.35,duration:.15,yoyo:true,repeat:1},4.65);',
       'tl.to("#ch1-hd",{rotation:-14,svgOrigin:"44 -138",duration:.5,ease:"power2.out"},5.4);',
       'tl.to("#ch1-hd",{rotation:0,duration:.6,ease:"power2.inOut"},9.2);',
       'tl.to("#dk1-hd",{rotation:6,svgOrigin:"44 -138",duration:1.2,ease:"sine.inOut",yoyo:true,repeat:1},7.0);']

# s2 — living room through the grill: hug, then the salary question (push-in on eyes)
s = ['<g id="s2-room">' + room("s2"),
     person("fa2", "father", 360, 1500, 1.15, 1, arms="down"),
     person("mo2", "mother", 860, 1520, 1.05, -1, arms="down"),
     person("mj2", "mojid", 520, 1520, 1.2, -1, arms="hug"), '</g>',
     grill(-30, -30, 1140, 1980)]
svg["s2"] = s
js += ['tl.fromTo("#s2-room",{x:0,scale:1,svgOrigin:"540 1000"},{x:-30,duration:4,ease:"sine.inOut"},10.0);',
       'tl.fromTo("#mj2",{x:520},{x:470,duration:.6,ease:"power2.out"},10.6);',
       'tl.to("#mj2",{x:700,duration:1.4,ease:"power2.inOut"},14.0);',       # moves to the mother
       'tl.to("#mj2-hd",{rotation:-8,svgOrigin:"0 -360",duration:.8},15.0);',
       'tl.to("#s2-room",{scale:2.9,x:-710,y:-2140,svgOrigin:"0 0",duration:4.2,ease:"sine.inOut"},15.4);',   # push-in on his eyes
       'tl.to("#mj2-sm",{opacity:0,duration:.6},16.0);',
       'tl.to("#mj2-eyes",{scaleY:.6,svgOrigin:"0 -408",duration:.8},16.4);']

# s3 — tea, scanning eyes, daughter passes, mother smiling; ticking clock
s = ['<g id="s3-room">' + room("s3"),
     person("da3", "daughter", -140, 1500, 1.05, 1, arms="down"),
     person("mj3", "mojid", 360, 1560, 1.15, 1, arms="cup"),
     person("mo3", "mother", 830, 1560, 1.05, -1, arms="down"), '</g>',
     '<g opacity=".9">' + grill(-30, -30, 1140, 1980) + '</g>',
     crow("dk3", "dadu", 150, 1940, 1.1, rim=AMB, sil=True), crow("ch3", "chhana", 1010, 1940, .95, flip=True, rim=AMB, sil=True)]
svg["s3"] = s
js += ['tl.fromTo("#s3-room",{scale:1.08,svgOrigin:"540 1100"},{scale:1.0,duration:10.6,ease:"none"},20.0);',
       'tl.to("#mj3-cup",{y:-150,x:-40,duration:.8,ease:"sine.inOut",yoyo:true,repeat:1},20.4);',
       'tl.to("#mj3-pup",{x:-8,duration:.4},22.4);', 'tl.to("#mj3-pup",{x:8,duration:.5},23.6);', 'tl.to("#mj3-pup",{x:-6,y:-2,duration:.4},25.0);',
       'tl.to("#mj3-pup",{x:6,duration:.4},26.6);', 'tl.to("#mj3-pup",{x:0,y:0,duration:.4},28.4);',
       'tl.fromTo("#da3",{x:-140},{x:1260,duration:3.2,ease:"none"},23.8);',
       'tl.to("#mj3-hd",{rotation:-6,svgOrigin:"0 -360",duration:.6,yoyo:true,repeat:1},24.4);']
for k in range(10):   # ticking second hand
    js.append(f'tl.set("#s3-sec",{{rotation:{(k + 1) * 6},svgOrigin:"820 520"}},{20.5 + k:.2f});')
rmo = random.Random(3)
t = 22.0
while t < 28.5:  # mother answers innocently (small mouth movements)
    js.append(f'tl.to("#mo3-m",{{scaleY:{rmo.uniform(1.6, 3.2):.2f},svgOrigin:"0 -352",duration:.09}},{t:.2f});')
    js.append(f'tl.to("#mo3-m",{{scaleY:1,duration:.09}},{t + .14:.2f});')
    t += rmo.uniform(.22, .42) + (.9 if rmo.random() < .15 else 0)

# s4 — he leaves; crows glide over rooftops under a hazy moon
s = ['<rect x="-200" y="-200" width="1480" height="2320" fill="url(#skyNight)"/>',
     '<circle id="s4-moon" cx="780" cy="420" r="260" fill="url(#moonG)"/><circle cx="780" cy="420" r="70" fill="#f4ecd2"/>',
     '<ellipse cx="560" cy="520" rx="700" ry="70" fill="#9fb3b0" opacity=".12" filter="url(#blur40)"/>',
     '<g id="s4-far">' + skyline(1250, "#122a2f", 0, 120, 380, 11, .25, "#e3a35a") + '</g>',
     '<g id="s4-mid">' + skyline(1520, "#0b1b1f", 0, 160, 520, 23, .18) + '</g>',
     '<g id="s4-wires"><path d="M-400,980 Q540,1220 1500,940" fill="none" stroke="#020303" stroke-width="5"/><path d="M-400,1040 Q600,1300 1500,1010" fill="none" stroke="#020303" stroke-width="3"/>'
     '<path d="M-400,900 Q300,1060 1500,1160" fill="none" stroke="#020303" stroke-width="3"/></g>',
     '<g id="s4-near"><rect x="-200" y="1640" width="1480" height="500" fill="#06100f"/><rect x="-200" y="1610" width="1480" height="36" fill="#0a1514"/>'
     '<rect x="700" y="1440" width="200" height="190" rx="14" fill="#08120f"/></g>',
     '<g id="s4-lane"><rect x="-200" y="1700" width="1480" height="400" fill="#050b0b"/><circle cx="300" cy="1720" r="140" fill="url(#bulbG)" opacity=".7"/>'
     + person("mj4", "mojid", 420, 1880, .32, 1, arms="down") + '</g>',
     crow_fly("dk4", "dadu", -300, 760, 1.05), crow_fly("ch4", "chhana", -520, 900, .85)]
svg["s4"] = s
js += ['tl.fromTo("#s4-lane",{opacity:1},{opacity:0,duration:.8},31.2);',
       'tl.fromTo("#mj4",{x:420},{x:760,duration:2.2,ease:"none"},30.0);',
       'tl.fromTo("#s4-far",{x:0},{x:-120,duration:10.6,ease:"none"},30.0);',
       'tl.fromTo("#s4-mid",{x:0},{x:-320,duration:10.6,ease:"none"},30.0);',
       'tl.fromTo("#s4-wires",{x:0},{x:-460,duration:10.6,ease:"none"},30.0);',
       'tl.fromTo("#s4-near",{x:0},{x:-700,duration:10.6,ease:"none"},30.0);',
       'tl.fromTo("#dk4",{x:-300,y:760},{x:640,y:700,duration:7.5,ease:"sine.inOut"},31.0);',
       'tl.fromTo("#ch4",{x:-520,y:900},{x:420,y:880,duration:7.5,ease:"sine.inOut"},31.2);',
       'tl.to("#dk4",{x:1400,y:600,duration:2.2,ease:"power1.in"},38.5);', 'tl.to("#ch4",{x:1300,y:760,duration:2.2,ease:"power1.in"},38.6);']
for cid, ph in (("dk4", 0.0), ("ch4", 0.18)):
    js.append(f'tl.fromTo("#{cid}-w1",{{rotation:-22,svgOrigin:"-10 -6"}},{{rotation:26,duration:.32,ease:"sine.inOut",yoyo:true,repeat:31}},{31.0 + ph:.2f});')
    js.append(f'tl.fromTo("#{cid}-w2",{{rotation:-18,svgOrigin:"-10 -6"}},{{rotation:22,duration:.32,ease:"sine.inOut",yoyo:true,repeat:31}},{31.0 + ph:.2f});')

# s5 — cold blue-grey: the gossip at another flat; push-in on half-eaten sweets
s = ['<g id="s5-room">' + room("s5", cold=True),
     person("n15", "n1", 210, 1500, 1.0, 1, rim="#cfe2ec"),
     person("n25", "n2", 880, 1500, 1.0, -1, rim="#cfe2ec"),
     person("mj5", "mojid", 560, 1450, 1.12, 1, rim="#cfe2ec", arms="down"),
     '<rect x="80" y="1460" width="920" height="40" fill="#2a3842"/><rect x="80" y="1500" width="920" height="400" fill="#1a242c"/>',
     sweets_plate(540, 1470, 1.0), '</g>',
     grill(-20, -20, 1120, 1960, pat="diamond", col="#3d3a36", hi="#6b6a66")]
svg["s5"] = s
js += ['tl.fromTo("#s5-room",{scale:1.0,svgOrigin:"540 1100"},{scale:1.04,duration:6.5,ease:"none"},40.0);',
       'tl.to("#mj5",{x:470,rotation:-6,svgOrigin:"560 1450",duration:1.2,ease:"sine.inOut"},42.2);',
       'tl.to("#mj5-hd",{rotation:-10,svgOrigin:"0 -360",duration:1},42.4);',
       'tl.to("#mj5-sm",{attr:{d:"M-16,-356 Q4,-344 18,-358"},duration:.4},47.0);',   # smirk
       'tl.to("#s5-room",{scale:2.4,x:-756,y:-2550,svgOrigin:"0 0",duration:3.4,ease:"sine.inOut"},46.9);']
for nid in ("n15", "n25"):   # quiet laughter (shoulders bounce)
    js.append(f'tl.to("#{nid}",{{y:"-=8",duration:.12,yoyo:true,repeat:9,ease:"sine.inOut"}},{47.8 + (0.1 if nid == "n25" else 0):.2f});')
    js.append(f'tl.to("#{nid}-m",{{scaleY:3,svgOrigin:"0 -352",duration:.2}},47.8);')

# s6 — back in the warm flat: the family shares his sweets, unaware
s = ['<g id="s6-room">' + room("s6"),
     person("fa6", "father", 170, 1520, 1.0, 1), person("so6", "son", 420, 1490, 1.0, 1),
     person("da6", "daughter", 900, 1540, 1.0, -1),
     person("mo6", "mother", 680, 1500, 1.05, -1, arms="box"),
     '<rect x="40" y="1520" width="1000" height="40" fill="#4a2a17"/><rect x="40" y="1560" width="1000" height="400" fill="#2d190d"/>',
     '<g id="s6-box">' + sweet_box(680, 1330, .62) + '</g>', '</g>',
     grill(-30, -30, 1140, 1980),
     '<rect x="-60" y="1800" width="1200" height="30" fill="#4a2a17"/>',
     crow("dk6", "dadu", 250, 1960, 1.45, rim=AMB, sil=True), crow("ch6", "chhana", 820, 1960, 1.25, flip=True, rim=AMB, sil=True)]
svg["s6"] = s
js += ['tl.fromTo("#s6-room",{scale:1.06,svgOrigin:"540 1200"},{scale:1.0,duration:10.6,ease:"none"},50.0);',
       'tl.fromTo("#s6-box",{y:-30},{y:20,duration:1.6,ease:"sine.out"},51.0);',
       'tl.to("#mo6",{x:620,duration:2,ease:"sine.inOut"},52.5);']
for pid in ("fa6", "so6", "da6"):
    js.append(f'tl.to("#{pid}-hd",{{rotation:{rng.choice([-5, 5])},svgOrigin:"0 -360",duration:1.2,yoyo:true,repeat:3,ease:"sine.inOut"}},{50.8 + rng.uniform(0, 1):.2f});')

# s7 — dawn: two crows on one wire; the moral; wide pull-back
s = ['<rect x="-200" y="-200" width="1480" height="2320" fill="url(#skyDawn)"/>',
     '<circle id="s7-sun" cx="560" cy="1500" r="420" fill="#ffe8b8" opacity=".55" filter="url(#blur40)"/>',
     '<g id="s7-far">' + skyline(1560, "#4b4a49", 0, 140, 420, 41) + '</g>',
     '<g id="s7-mid">' + skyline(1760, "#211d1b", 0, 180, 600, 53) + '</g>',
     '<ellipse cx="540" cy="1500" rx="900" ry="120" fill="#ffd9a3" opacity=".25" filter="url(#blur40)"/>',
     '<g id="s7-wire"><path d="M-400,1080 Q540,1160 1500,1040" fill="none" stroke="#0b0907" stroke-width="7"/>'
     + crow("dk7", "dadu", 250, 1128, 1.45, rim=RIM, sil=True) + crow("ch7", "chhana", 830, 1112, 1.25, flip=True, rim=RIM, sil=True) + '</g>']
svg["s7"] = s
js += ['tl.fromTo("#s7-cam",{scale:1.35,svgOrigin:"540 1100"},{scale:1.0,duration:9.4,ease:"sine.inOut"},60.2);',
       'tl.fromTo("#s7-sun",{y:80,opacity:.35},{y:-60,opacity:.7,duration:10,ease:"none"},60.0);',
       'tl.to("#dk7-hd",{rotation:-6,svgOrigin:"44 -138",duration:.6},64.6);',      # turns toward Chhana
       'tl.to("#dk7-hd",{rotation:0,duration:.8},68.9);',
       'tl.to("#ch7-hd",{rotation:14,svgOrigin:"44 -138",duration:.35,yoyo:true,repeat:3,ease:"sine.inOut"},68.6);']   # slow nod

# ---------------------------------------------------------------- lip/beak sync
SPEAK = {"l02": ["#ch1-bl"], "l03": ["#mj2-m"], "l04": ["#mj2-m"], "l06": ["#ch4-bl"], "l07": ["#dk4-bl"], "l08": ["#mj5-m"],
         "l10": ["#dk7-bl"], "l11": ["#dk7-bl"]}
for lid, targets in SPEAK.items():
    st0 = SCH[lid]["start"]; env = ENV[lid]
    for i in range(0, len(env), 2):        # 15 Hz
        v = max(env[i:i + 2])
        t = st0 + i / 30
        for tg in targets:
            if tg.endswith("-bl"):
                js.append(f'tl.to("{tg}",{{rotation:{min(24, v * 26):.1f},svgOrigin:"100 -167",duration:.066,ease:"none"}},{t:.3f});')
            else:
                js.append(f'tl.to("{tg}",{{scaleY:{1 + v * 3.4:.2f},svgOrigin:"0 -352",duration:.066,ease:"none"}},{t:.3f});')
    for tg in targets:
        js.append(f'tl.to("{tg}",{{{"rotation:0" if tg.endswith("-bl") else "scaleY:1"},duration:.12}},{SCH[lid]["end"] + .02:.3f});')
# crow beak hinge differs for flying crows
js = [j.replace('svgOrigin:"100 -167"', 'svgOrigin:"146 -6"') if ('#dk4-bl' in j or '#ch4-bl' in j) else j for j in js]

# ---------------------------------------------------------------- assemble
clips = []
for k, (sid, a, b) in enumerate(SC):
    body = "".join(svg[sid])
    cold = sid == "s5"
    grade = ("rgba(70,110,135,.20)" if cold else "rgba(255,150,60,.06)") if sid != "s7" else "rgba(255,190,120,.06)"
    clips.append(f'<div id="{sid}" class="clip scene" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="{1 + k % 2}">'
                 f'<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice">{DEFS}<g id="{sid}-cam">{body}</g></svg>'
                 f'<div class="grade" style="background:{grade}"></div></div>')
    if k > 0:
        js.append(f'tl.fromTo("#{sid}",{{opacity:0}},{{opacity:1,duration:{min(.6, SC[k - 1][2] - a):.2f},ease:"sine.inOut"}},{a:.3f});')
js.append('tl.to("#s1a",{opacity:0,duration:.6},4.3);')
# dust particles
dust = "".join(f'<i style="left:{rng.randint(0, W)}px;top:{rng.randint(0, H)}px;width:{(sz := rng.uniform(2, 6)):.1f}px;height:{sz:.1f}px;opacity:{rng.uniform(.15, .55):.2f}"></i>' for _ in range(70))
js.append('tl.fromTo("#dust i",{y:0,x:0},{y:-260,x:60,duration:35,ease:"none",stagger:{each:.05,repeat:1}},0);')
# film grain: cycle 4 pre-rendered noise frames
for i in range(int(DUR * 12)):
    js.append(f'tl.set("#grain",{{backgroundPosition:"{rng.randint(0, 200)}px {rng.randint(0, 200)}px"}},{i / 12:.3f});')
js.append(f'tl.fromTo("#fadeout",{{opacity:0}},{{opacity:1,duration:.9,ease:"sine.in"}},{DUR - 1.0:.2f});')
js.append('tl.fromTo("#fadein",{opacity:1},{opacity:0,duration:.6},0);')

CSS = f"""*{{box-sizing:border-box}} body{{margin:0;background:#000}}
#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden;background:#000}}
.clip{{position:absolute}} .scene{{left:0;top:0;width:{W}px;height:{H}px;overflow:hidden}}
.scene svg{{position:absolute;left:0;top:0;display:block}}
.grade{{position:absolute;inset:0;mix-blend-mode:soft-light}}
#fx{{left:0;top:0;width:{W}px;height:{H}px;pointer-events:none}}
#dust{{position:absolute;inset:0}} #dust i{{position:absolute;border-radius:50%;background:#ffdcaa;filter:blur(1px);display:block}}
#grain{{position:absolute;inset:-100px;background:url(assets/grain.png);opacity:.10;mix-blend-mode:overlay}}
#vig{{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,rgba(0,0,0,0) 45%,rgba(0,0,0,.72) 100%)}}
#haze{{position:absolute;left:-200px;top:600px;width:1500px;height:700px;background:radial-gradient(closest-side,rgba(255,214,160,.10),rgba(255,214,160,0));filter:blur(30px)}}
#fadeout,#fadein{{position:absolute;inset:0;background:#000}}"""
page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width={W}, height={H}"/>
<title>মিষ্টির প্যাকেট</title><script src="assets/gsap.min.js"></script><style>{CSS}</style></head><body>
<div id="root" data-composition-id="main" data-width="{W}" data-height="{H}" data-duration="{DUR:.3f}" data-fps="30">
{''.join(clips)}
<div id="fx" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="5"><div id="haze"></div><div id="dust">{dust}</div><div id="grain"></div><div id="vig"></div><div id="fadein"></div><div id="fadeout"></div></div>
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{paused:true}});
tl.fromTo("#haze",{{x:-120}},{{x:120,duration:{DUR:.1f},ease:"sine.inOut"}},0);
{chr(10).join(js)}
window.__timelines["main"] = tl;
</script></body></html>"""
open(f"{P}/hf/index.html", "w").write(page)
print("wrote", len(page), "tweens", len(js))

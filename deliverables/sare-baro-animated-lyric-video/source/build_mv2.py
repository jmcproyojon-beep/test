"""সাড়ে বারো — animated kinetic-typography collage lyric video (Paloan Animate Kor style). 1920x1080, HyperFrames + GSAP."""
import html, json, random, sys
D = "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad"
sys.path.insert(0, f"{D}/mv"); sys.path.insert(0, f"{D}/mv2")
from lyrics import LINES
from props import P, clock

OUT = "/home/user/test/projects/sare-baro-animated/hf/index.html"
A = {x["i"]: x for x in json.load(open(f"{D}/mv/align_b.json"))["lines"]}
B = json.load(open(f"{D}/mv2/beats.json"))
DUR = 127.9
rnd = random.Random(12)
e = html.escape
clips, js = [], []

# section palettes: bg, accent text colour, shadow colour
SEC = [(0, 4.9, "intro", "#0A0A0A"), (4.9, 27.6, "v1", "#0A0A0A"), (27.6, 43.9, "hook", "#B8001C"), (43.9, 68.8, "v2", "#0B1030"),
       (68.8, 100.8, "bridge", "#0A0A0A"), (100.8, 118.0, "hook2", "#B8001C"), (118.0, DUR, "outro", "#0A0A0A")]
PROP = {0: "sun", 1: "sun", 2: "moon", 3: "eye", 4: "qm", 5: "door", 6: "room", 7: "CLOCK", 11: "spiral", 12: "fridge", 13: "bellb", 14: "fly", 15: "guard", 16: "tap",
        17: "shirt", 18: "qm", 19: "pillow", 20: "mag", 21: "moon", 22: "mess", 23: "watch", 24: "office", 25: "mouse", 26: "glitch", 27: "sleepy", 28: "mess",
        29: "hurt", 30: "flame", 31: "watch"}
KEY = ["সাড়ে", "বারো", "বারো।", "বারো,", "বারো…", "ধ্যাততেরি!", "আগুন।", "এলোমেলো।", "দেরি,"]
TUNNEL = {8, 9, 10, 32}

# lyric events: (start, end, text, line index)
ev = [(A[i]["start"], A[i]["end"], l, i) for i, (_, l) in enumerate(LINES) if i != 33]
ev += [(s, en, "বাজে সাড়ে বারো।", 32) for s, en in A[32]["repeats"]]
ev.append((A[33]["start"], A[33]["end"], "সাড়ে বারো…", 33))
ev.sort()


def paper(inner, w, h, rot, cls=""):
    pts = []
    for k in range(24):                                     # torn edge polygon
        t = k / 24
        if t < .25: x, y = t * 4 * 100, rnd.uniform(0, 3)
        elif t < .5: x, y = 100 - rnd.uniform(0, 3), (t - .25) * 4 * 100
        elif t < .75: x, y = 100 - (t - .5) * 4 * 100, 100 - rnd.uniform(0, 3)
        else: x, y = rnd.uniform(0, 3), 100 - (t - .75) * 4 * 100
        pts.append(f"{x:.1f}% {y:.1f}%")
    return f'<div class="paper {cls}" style="width:{w}px;height:{h}px;transform:rotate({rot}deg);clip-path:polygon({",".join(pts)})">{inner}</div>'


for k, (s, en, text, i) in enumerate(ev):
    nxt = ev[k + 1][0] if k + 1 < len(ev) else DUR
    st, du = s - .18, min(nxt, en + 3.0 if i in (2, 5, 10, 22, 30, 32, 33) else en + .9) - (s - .18)
    if k + 1 < len(ev): du = min(du, nxt - (s - .18) - .02)
    if i == 33: du = A[33]["end"] + .6 - st
    cid = f"L{k}"
    side = "c" if i in TUNNEL or i == 33 or i not in PROP else ("l" if k % 2 else "r")
    words = text.split()
    n = sum(len(w) for w in words); acc = s; spans = ""
    for wi, w in enumerate(words):
        wt = acc; acc += (en - s) * len(w) / n
        cls = "w key" if any(w.startswith(x.rstrip("।,…!")) for x in KEY) else "w"
        spans += f'<span class="{cls}" id="{cid}w{wi}">{e(w)}</span> '
        js.append(f'tl.from("#{cid}w{wi}",{{scale:{1.55 if "key" in cls else 1.35},y:{-40 if wi % 2 else 40},opacity:0,rotation:{rnd.choice([-8, -4, 4, 8])},duration:.22,ease:"back.out(2.5)"}},{wt:.3f});')
    prop = ""
    if i in TUNNEL or i == 33:
        rings = "".join(f'<div class="ring r{r}">{clock(12, 30, 360, cls="tc")}</div>' for r in range(5))
        prop = f'<div class="tunnel">{rings}</div>'
        for r in range(5):
            js.append(f'tl.fromTo("#{cid} .r{r}",{{scale:{.15 + r * .35},opacity:{.9 - r * .12}}},{{scale:{.5 + r * .9},opacity:{.5 - r * .08},rotation:{(-1) ** r * 40},duration:{du:.2f},ease:"none",immediateRender:false}},{st:.3f});')
    elif i in PROP:
        name = PROP[i]
        svg = clock(12, 30, 480) if name == "CLOCK" else P[name].replace("<svg ", '<svg width="480" height="480" ', 1)
        prop = f'<div class="prop {side}">{paper(svg, 560, 560, rnd.uniform(-7, 7), "pp")}</div>'
        js.append(f'tl.from("#{cid} .prop",{{x:{-900 if side == "l" else 900},rotation:{rnd.choice([-25, 25])},duration:.45,ease:"power4.out"}},{st:.3f});')
        js.append(f'tl.fromTo("#{cid} .prop .paper",{{scale:1}},{{scale:1.07,duration:{du:.2f},ease:"none",immediateRender:false}},{st:.3f});')
        # prop-specific motion
        moves = {"sun": '.rays",{rotation:60,transformOrigin:"200px 200px",duration:DU,ease:"none"', "moon": ' .zz",{y:-40,opacity:.2,stagger:.4,duration:1.2,repeat:3,yoyo:true',
                 "eye": ' .lid",{scaleY:0,transformOrigin:"200px 200px",duration:.35,ease:"power2.in"', "door": ' .bell",{x:6,duration:.06,repeat:20,yoyo:true',
                 "spiral": ' .spin",{rotation:540,transformOrigin:"200px 200px",duration:DU,ease:"none"', "bellb": ' .swing",{rotation:18,transformOrigin:"200px 40px",duration:.12,repeat:24,yoyo:true',
                 "fly": ' .bug",{x:-220,y:150,rotation:-40,duration:DU,ease:"sine.inOut"', "tap": ' .drop",{y:60,opacity:0,stagger:.2,duration:.6,repeat:5',
                 "shirt": ' .fl1",{y:-30,rotation:-10,transformOrigin:"150px 150px",duration:.5,repeat:5,yoyo:true', "pillow": ' .peek",{y:-60,duration:.5,ease:"back.out(2)"',
                 "mag": ' svg",{x:60,y:-30,duration:DU,ease:"sine.inOut"', "mess": ' rect",{rotation:"+=90",transformOrigin:"50% 50%",stagger:.1,duration:DU,ease:"none"',
                 "mouse": ' .run",{x:-120,duration:.25,repeat:9,yoyo:true', "flame": ' .fire",{scaleY:1.18,transformOrigin:"200px 230px",duration:.12,repeat:30,yoyo:true',
                 "hurt": ' .bolt",{opacity:0,duration:.08,repeat:30,yoyo:true', "watch": ' .mh",{rotation:"+=720",transformOrigin:"200px 200px",duration:DU,ease:"power2.out"',
                 "CLOCK": ' .mh",{rotation:"+=360",transformOrigin:"200px 200px",duration:DU,ease:"power2.out"', "glitch": ' svg",{x:12,duration:.05,repeat:24,yoyo:true',
                 "sleepy": ' .zz",{y:-50,opacity:.2,duration:1.2,repeat:2,yoyo:true', "fridge": ' .ice",{y:-30,duration:.4,repeat:5,yoyo:true',
                 "qm": ' text",{y:-20,rotation:8,stagger:.15,duration:.3,repeat:7,yoyo:true', "office": ' rect",{opacity:.3,stagger:{each:.03,from:"random"},duration:.2,repeat:3,yoyo:true',
                 "room": ' text",{scale:1.3,transformOrigin:"50% 50%",duration:.3,repeat:5,yoyo:true', "guard": ' svg",{rotation:4,transformOrigin:"50% 100%",duration:.4,repeat:7,yoyo:true'}
        if name in moves:
            sel, rest = moves[name].replace("DU", f"{du:.2f}").split('",{', 1)
            js.append(f'tl.to("#{cid} .prop {sel.strip()}",{{{rest}}},{st + .3:.3f});')
    tcls = {"c": "tc", "l": "tr", "r": "tl"}[side]
    big = " huge" if i in TUNNEL or i == 33 else ""
    clips.append(f'<div id="{cid}" class="clip line" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{4 + k % 2}">{prop}<div class="lyr {tcls}{big}">{spans}</div></div>')
    js.append(f'tl.to("#{cid} .lyr",{{y:-30,opacity:0,duration:.2}},{st + du - .2:.3f});')

# background colour blocks per section + section label
for a, b, name, bg in SEC:
    clips.insert(0, f'<div id="bg_{name}" class="clip bgsec" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="1" style="background:{bg}"><div class="halo"></div></div>')

# impact frames: section starts + each hook "বারো"
impacts = [a for a, *_ in SEC[1:]] + [s for s, en, t, i in ev if i in TUNNEL]
for k, t in enumerate(impacts):
    clips.append(f'<div id="imp{k}" class="clip flash" data-start="{t - .02:.3f}" data-duration="0.2" data-track-index="9"></div>')
    js.append(f'tl.fromTo("#imp{k}",{{opacity:.9}},{{opacity:0,duration:.18,immediateRender:false}},{t - .02:.3f});')
    js.append(f'tl.fromTo("#stage",{{x:-14,y:8}},{{x:0,y:0,duration:.25,ease:"elastic.out(1,.3)",immediateRender:false}},{t:.3f});')

# beat pulse on every other detected beat (~81 BPM): text glow + halo
for t in B["beats"][::2]:
    js.append(f'tl.fromTo(".halo",{{scale:1.08,opacity:.55}},{{scale:1,opacity:.25,duration:.32,immediateRender:false}},{t:.3f});')

# intro title + outro credit
clips.append('<div id="title" class="clip" data-start="0" data-duration="4.8" data-track-index="7"><div class="tclock">' + clock(12, 30, 300) +
             '</div><div class="ttl">সাড়ে বারো</div><div class="tsub">PABLO PIKASO · LYRIC VIDEO</div></div>')
js.append('tl.from("#title .tclock",{scale:0,rotation:-180,duration:.8,ease:"back.out(1.8)"},0.2);tl.from("#title .ttl",{y:80,opacity:0,duration:.6,ease:"power3.out"},0.8);tl.from("#title .tsub",{opacity:0,duration:.6},1.3);')
js.append('tl.fromTo("#title .mh",{rotation:0},{rotation:540,transformOrigin:"200px 200px",duration:3,ease:"power2.inOut"},0.8);tl.to("#title",{scale:3,opacity:0,duration:.5,ease:"power2.in"},4.3);')
clips.append(f'<div id="credit" class="clip" data-start="{A[33]["end"] + .6:.3f}" data-duration="{DUR - A[33]["end"] - .6:.3f}" data-track-index="8"><div class="ttl" style="font-size:120px">সাড়ে বারো</div><div class="tsub">PABLO PIKASO</div></div>')
js.append(f'tl.from("#credit",{{opacity:0,duration:.8}},{A[33]["end"] + .6:.3f});')
js.append(f'{{let sd=7;const r=()=>{{sd=(sd*1103515245+12345)%2147483648;return sd/2147483648*120-60}};for(let t=0;t<{DUR};t+=0.1){{tl.set(".grain",{{x:r(),y:r()}},t)}}}}')
js.append(f'tl.fromTo(".leak",{{x:-300}},{{x:300,duration:{DUR / 4:.1f},yoyo:true,repeat:3,ease:"sine.inOut"}},0);')

css = open(f"{D}/mv2/mv2.css").read()
page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/><title>সাড়ে বারো — Lyric Video</title>
<script src="assets/gsap.min.js"></script><style>{css}</style></head><body>
<div id="root" data-composition-id="mv2" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
<div id="stage" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"></div>
{''.join(clips)}
<div id="tex" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="10"><div class="leak"></div><div class="grain"></div><div class="scan"></div><div class="vig"></div></div>
</div>
<script>window.__timelines=window.__timelines||{{}};const tl=gsap.timeline({{paused:true}});
{chr(10).join(js)}
window.__timelines["mv2"]=tl;</script></body></html>"""
open(OUT, "w").write(page)
print("wrote", len(page), "events", len(ev), "impacts", len(impacts))

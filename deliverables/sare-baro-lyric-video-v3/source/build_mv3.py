"""সাড়ে বারো — v3: vertical 9:16 scroll-stopping lyric video (Paloan Animate Kor). Word-synced lyrics, beat punches,
RGB-split / displacement-warp / glitch distortion, collage props, clock tunnel hooks. HyperFrames + GSAP."""
import html, json, random, sys
D = "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad"
sys.path.insert(0, f"{D}/mv"); sys.path.insert(0, f"{D}/mv2")
from lyrics import LINES
from props import P, clock

OUT = "/home/user/test/projects/sare-baro-v3/hf/index.html"
A = {x["i"]: x for x in json.load(open(f"{D}/mv/align_b.json"))["lines"]}
W = {x["i"]: x["w"] for x in json.load(open(f"{D}/mv3/words_raw.json"))["lines"]}
B = json.load(open(f"{D}/mv2/beats.json"))
ON = B["strong"]
DUR = 127.9
rnd = random.Random(31)
e = html.escape
clips, js = [], []


def snap(t):                                                   # pull a word start onto the nearest vocal onset (±0.12 s)
    c = min(ON, key=lambda o: abs(o - t))
    return c if abs(c - t) <= .12 else t


# events: (line start, line end, words, word times, line idx)
ev = []
for i, (_, l) in enumerate(LINES):
    ws = l.split(); ts = [snap(t) for t in W[i]]
    ts = [max(a, ts[k - 1] + .08) if k else a for k, a in enumerate(ts)]
    ev.append((A[i]["start"], A[i]["end"], ws, ts, i))
base32 = [t - A[32]["start"] for t in W[32]]
for s, en in A[32]["repeats"]:
    sc = (en - s) / (A[32]["end"] - A[32]["start"])
    ev.append((s, en, "বাজে সাড়ে বারো।".split(), [snap(s + d * sc) for d in base32], 32))
ev.sort(key=lambda x: x[0])

SEC = [(0, 4.9, "#0A0A0A"), (4.9, 27.6, "#0A0A0A"), (27.6, 43.9, "#B8001C"), (43.9, 68.8, "#0B1030"), (68.8, 100.8, "#0A0A0A"), (100.8, 118.0, "#B8001C"), (118.0, DUR, "#0A0A0A")]
for a, b, bg in SEC:
    clips.append(f'<div class="clip bgsec" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="1" style="background:{bg}"></div>')

PROP = {0: "sun", 1: "sun", 2: "moon", 3: "eye", 4: "qm", 5: "door", 6: "room", 7: "CLOCK", 11: "spiral", 12: "fridge", 13: "bellb", 14: "fly", 15: "guard", 16: "tap",
        17: "shirt", 18: "qm", 19: "pillow", 20: "mag", 21: "moon", 22: "mess", 23: "watch", 24: "office", 25: "mouse", 26: "glitch", 27: "sleepy", 28: "mess",
        29: "hurt", 30: "flame", 31: "watch"}
KEYW = ("সাড়ে", "বারো", "ধ্যাততেরি", "আগুন", "এলোমেলো", "দেরি", "ঝিমঝিম", "আইসক্রিম", "ঠনঠন", "ভনভন", "ইদুর")
TUNNEL = {8, 9, 10, 32, 33}
impacts = []


def torn(inner, w, h, rot):
    pts = []
    for k in range(28):
        t = k / 28
        if t < .25: x, y = t * 400, rnd.uniform(0, 3.5)
        elif t < .5: x, y = 100 - rnd.uniform(0, 3.5), (t - .25) * 400
        elif t < .75: x, y = 100 - (t - .5) * 400, 100 - rnd.uniform(0, 3.5)
        else: x, y = rnd.uniform(0, 3.5), 100 - (t - .75) * 400
        pts.append(f"{x:.1f}% {y:.1f}%")
    return f'<div class="paper" style="width:{w}px;height:{h}px;transform:rotate({rot:.1f}deg);clip-path:polygon({",".join(pts)})">{inner}</div>'


for k, (s, en, ws, ts, i) in enumerate(ev):
    nxt = ev[k + 1][0] if k + 1 < len(ev) else DUR
    st = s - .2
    du = (nxt - .02 - st) if k + 1 < len(ev) else (A[33]["end"] + .8 - st)
    cid = f"L{k}"
    impacts.append((s, "big" if i in TUNNEL else "small"))
    # lyric words: base + red/cyan ghost copies for RGB split
    spans = ""
    for wi, (w, t) in enumerate(zip(ws, ts)):
        key = any(w.startswith(x) for x in KEYW)
        spans += (f'<span class="w{" key" if key else ""}" id="{cid}w{wi}"><i class="gr">{e(w)}</i><i class="gc">{e(w)}</i><b>{e(w)}</b></span>')
        js.append(f'tl.fromTo("#{cid}w{wi}",{{opacity:0,scale:{1.9 if key else 1.5},y:{-70 if wi % 2 else 70},skewX:{rnd.choice([-18, 18])}}},'
                  f'{{opacity:1,scale:1,y:0,skewX:0,duration:.2,ease:"back.out(3)",immediateRender:false}},{t - .04:.3f});')
        js.append(f'tl.fromTo("#{cid}w{wi} .gr",{{x:-26,y:6}},{{x:-4,y:0,duration:.35,ease:"power3.out",immediateRender:false}},{t - .04:.3f});')
        js.append(f'tl.fromTo("#{cid}w{wi} .gc",{{x:26,y:-6}},{{x:4,y:0,duration:.35,ease:"power3.out",immediateRender:false}},{t - .04:.3f});')
        js.append(f'tl.fromTo("#{cid}w{wi} b",{{color:"#FFFFFF"}},{{color:"{"#FFD700" if key else "#FFFFFF"}",duration:.15,immediateRender:false}},{t:.3f});')
    # visual
    if i in TUNNEL:
        vis = '<div class="tunnel">' + "".join(f'<div class="ring r{r}">{clock(12, 30, 520, cls="tc")}</div>' for r in range(6)) + '</div>'
        for r in range(6):
            js.append(f'tl.fromTo("#{cid} .r{r}",{{scale:{.12 + r * .3},rotation:0,opacity:{.95 - r * .1}}},{{scale:{.6 + r * .75},rotation:{(-1) ** r * 70},opacity:{.55 - r * .07},duration:{du:.2f},ease:"none",immediateRender:false}},{st:.3f});')
    else:
        name = PROP.get(i, "qm")
        svg = clock(12, 30, 560) if name == "CLOCK" else P[name].replace("<svg ", '<svg width="560" height="560" ', 1)
        vis = f'<div class="prop">{torn(svg, 660, 660, rnd.uniform(-8, 8))}<div class="tape t1"></div><div class="tape t2"></div></div>'
        js.append(f'tl.fromTo("#{cid} .prop",{{scale:1.9,rotation:{rnd.choice([-30, 30])},opacity:0}},{{scale:1,rotation:0,opacity:1,duration:.32,ease:"expo.out",immediateRender:false}},{st:.3f});')
        js.append(f'tl.fromTo("#{cid} .prop .paper",{{scale:1}},{{scale:1.08,duration:{du:.2f},ease:"none",immediateRender:false}},{st:.3f});')
    clips.append(f'<div id="{cid}" class="clip line" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{4 + k % 2}">{vis}'
                 f'<div class="lyr{" huge" if i in TUNNEL else ""}">{spans}</div></div>')
    js.append(f'tl.to("#{cid}",{{opacity:0,x:{rnd.choice([-120, 120])},skewX:{rnd.choice([-25, 25])},duration:.14,ease:"power2.in"}},{st + du - .14:.3f});')

# beat punches (~81 BPM): whole stage bounce, burst rotate, halftone flash
for t in B["beats"][::2]:
    js.append(f'tl.fromTo("#beat",{{scale:1.06,opacity:.9}},{{scale:1,opacity:.45,duration:.3,ease:"power2.out",immediateRender:false}},{t:.3f});')
    js.append(f'tl.fromTo("#zone",{{scale:1.025}},{{scale:1,duration:.22,ease:"power2.out",immediateRender:false}},{t:.3f});')
js.append(f'tl.to("#beat .burst",{{rotation:360,duration:{DUR / 2:.1f},repeat:1,ease:"none"}},0);')

# impact frames: flash/invert + shake + displacement warp + VHS bars
for k, (t, kind) in enumerate(impacts + [(a, "big") for a, b, _ in SEC[1:]]):
    big = kind == "big"
    clips.append(f'<div id="imp{k}" class="clip flash" data-start="{t - .02:.3f}" data-duration="{.22 if big else .12:.2f}" data-track-index="9"></div>')
    js.append(f'tl.fromTo("#imp{k}",{{opacity:{.95 if big else .35}}},{{opacity:0,duration:{.2 if big else .1},immediateRender:false}},{t - .02:.3f});')
    js.append(f'tl.fromTo("#zone",{{x:{-26 if big else -10},y:{14 if big else 6}}},{{x:0,y:0,duration:.3,ease:"elastic.out(1,.3)",immediateRender:false}},{t:.3f});')
    js.append(f'tl.fromTo("#dmap",{{attr:{{scale:{70 if big else 28}}}}},{{attr:{{scale:0}},duration:{.45 if big else .28},ease:"power2.out",immediateRender:false}},{t:.3f});')
    if big:
        js.append(f'tl.fromTo("#vhs",{{opacity:1,y:{rnd.randint(-500, 500)}}},{{opacity:0,y:"+=180",duration:.3,ease:"steps(4)",immediateRender:false}},{t:.3f});')

# 0–4.9 s scroll-stopping hook
clips.append('<div id="hook" class="clip" data-start="0" data-duration="4.85" data-track-index="7"><div class="hclock">' + clock(12, 30, 520) + '</div>'
             '<div class="htitle"><i class="gr">সাড়ে বারো</i><i class="gc">সাড়ে বারো</i><b>সাড়ে বারো</b></div><div class="hsub">⏰ বাজে সাড়ে বারো · PABLO PIKASO</div></div>')
js.append('tl.fromTo("#hook .htitle",{scale:3,opacity:0},{scale:1,opacity:1,duration:.25,ease:"expo.out",immediateRender:false},0.05);')
js.append('tl.fromTo("#hook .hclock",{scale:0,rotation:-200},{scale:1,rotation:0,duration:.5,ease:"back.out(2)",immediateRender:false},0.15);')
js.append('tl.fromTo("#hook .mh",{rotation:0},{rotation:1080,transformOrigin:"200px 200px",duration:4.2,ease:"power2.inOut",immediateRender:false},0.3);')
js.append('tl.fromTo("#hook .hsub",{y:40,opacity:0},{y:0,opacity:1,duration:.4,immediateRender:false},0.6);')
for t in [0.05] + [b for b in B["beats"][::2] if b < 4.8]:
    js.append(f'tl.fromTo("#hook .htitle .gr",{{x:-30}},{{x:-5,duration:.25,immediateRender:false}},{t:.3f});tl.fromTo("#hook .htitle .gc",{{x:30}},{{x:5,duration:.25,immediateRender:false}},{t:.3f});')
    js.append(f'tl.fromTo("#hook .htitle",{{scale:1.12}},{{scale:1,duration:.25,ease:"power2.out",immediateRender:false}},{t:.3f});')
js.append('tl.to("#hook",{scale:2.6,opacity:0,filter:"blur(0px)",duration:.35,ease:"power3.in"},4.5);')
impacts.insert(0, (0.05, "big"))
clips.append(f'<div id="credit" class="clip" data-start="{A[33]["end"] + .8:.3f}" data-duration="{DUR - A[33]["end"] - .8:.3f}" data-track-index="8"><div class="hclock">{clock(12, 30, 360)}</div>'
             '<div class="htitle" style="font-size:150px"><b>সাড়ে বারো</b></div><div class="hsub">PABLO PIKASO</div></div>')
js.append(f'tl.from("#credit",{{opacity:0,scale:1.3,duration:.6}},{A[33]["end"] + .8:.3f});')
js.append(f'{{let sd=11;const r=()=>{{sd=(sd*1103515245+12345)%2147483648;return sd/2147483648*120-60}};for(let t=0;t<{DUR};t+=0.1){{tl.set(".grain",{{x:r(),y:r()}},t)}}}}')
js.append(f'tl.fromTo("#prog i",{{scaleX:0}},{{scaleX:1,duration:{DUR},ease:"none"}},0);')

css = open(f"{D}/mv3/mv3.css").read()
page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1080, height=1920"/><title>সাড়ে বারো — v3</title>
<script src="assets/gsap.min.js"></script><style>{css}</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="warp" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="4"/>
<feDisplacementMap id="dmap" in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
<div id="root" data-composition-id="mv3" data-width="1080" data-height="1920" data-duration="{DUR:.3f}" data-fps="30">
{''.join(clips[:len(SEC)])}
<div id="beatc" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><div id="beat"><div class="burst"></div><div class="dots"></div></div></div>
<div id="zone" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="3">{''.join(clips[len(SEC):])}</div>
<div id="ui" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="11"><div class="tagtop"><span class="dot"></span>সাড়ে বারো · LYRIC VIDEO</div><div id="prog"><i></i></div></div>
<div id="tex" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="12"><div id="vhs"></div><div class="grain"></div><div class="scan"></div><div class="vig"></div></div>
</div><script>window.__timelines=window.__timelines||{{}};const tl=gsap.timeline({{paused:true}});
{chr(10).join(js)}
window.__timelines["mv3"]=tl;</script></body></html>"""
open(OUT, "w").write(page)
print("wrote", len(page), "events", len(ev), "impacts", len(impacts))

"""সাড়ে বারো — lyric edit. Cleaned 1080p video + correct, vocal-synced lyrics with a karaoke fill.
Lines whose original baked caption was blurred are placed back in the same spot (corrected); all other lines sit at the bottom."""
import html, json, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/mv")
from lyrics import LINES

P = "/home/user/test/projects/sare-baro-mv"
A = {x["i"]: x for x in json.load(open("/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/mv/align_b.json"))["lines"]}
DUR = 127.9
K = 1920 / 848
e = html.escape
# display rows for long lines
ROWS = {5: ["ডোরবেল বাজিয়ে", "কে পালালো?"], 3: ["চোখ খুলে তাকিয়ে", "আতকে উঠি"]}
# groups placed where the original captions were: (window start, end, [line idx], (x, y, w, h) in source px, align, extra class)
GROUPS = [(4.6, 9.0, [0], (40, 370, 770, 80), "center", "big"), (16.7, 24.2, [3, 4], (480, 55, 340, 160), "center", ""),
          (24.4, 27.2, [5], (30, 135, 315, 115), "left", ""), (28.0, 32.6, [6, 7], (15, 155, 360, 105), "left", ""),
          (42.4, 48.6, [11, 12], (475, 50, 355, 115), "center", ""), (48.6, 50.6, [13, 14], (525, 8, 300, 262), "center", "ring"),
          (50.6, 55.4, [15, 16], (465, 35, 365, 120), "center", ""), (59.4, 67.6, [19, 20, 21, 22], (495, 30, 315, 200), "left", ""),
          (69.4, 74.6, [23, 24], (410, 30, 420, 125), "center", ""), (74.4, 80.6, [25, 26], (430, 305, 418, 115), "center", "brush")]
placed = {i for g in GROUPS for i in g[2]}
clips, js = [], []


def kara(id_, text, s, e_):
    """one text row: base layer + yellow fill revealed left→right with transforms only (mask slides, inner counter-slides)."""
    js.append(f'tl.fromTo("#{id_} .mk",{{xPercent:-100}},{{xPercent:0,duration:{max(.3, e_ - s):.2f},ease:"none",immediateRender:false}},{s:.3f});')
    js.append(f'tl.fromTo("#{id_} .mk .in",{{xPercent:100}},{{xPercent:0,duration:{max(.3, e_ - s):.2f},ease:"none",immediateRender:false}},{s:.3f});')
    return f'<div class="row" id="{id_}"><span class="base">{e(text)}</span><span class="mk"><span class="in">{e(text)}</span></span></div>'


def rows_of(i):
    return ROWS.get(i, [LINES[i][1]])


def row_times(i):
    s, en = A[i]["start"], A[i]["end"]; rs = rows_of(i); n = sum(len(r) for r in rs); out = []; acc = s
    for r in rs:
        d = (en - s) * len(r) / n; out.append((acc, acc + d)); acc += d
    return out


# positioned groups
for gi, (ws, we, idx, (x, y, w, h), al, cls) in enumerate(GROUPS):
    X, Y, W, H = x * K, y * K, w * K, h * K
    inner = ""
    for i in idx:
        for ri, (r, (rs, re_)) in enumerate(zip(rows_of(i), row_times(i))):
            rid = f"g{gi}l{i}r{ri}"
            inner += kara(rid, r, rs, re_)
            js.append(f'tl.from("#{rid}",{{y:24,opacity:0,duration:.3,ease:"power2.out"}},{max(ws, rs - .3):.3f});')
    ring = '<i class="ringc"></i>' if cls == "ring" else ""
    clips.append(f'<div id="g{gi}" class="clip grp {cls} al-{al}" data-start="{ws:.3f}" data-duration="{we - ws:.3f}" data-track-index="{4 + gi % 2}" '
                 f'style="left:{X:.0f}px;top:{Y:.0f}px;width:{W:.0f}px;height:{H:.0f}px;text-align:{al};justify-content:center">{ring}<div class="stack">{inner}</div></div>')
    js.append(f'tl.to("#g{gi}",{{opacity:0,duration:.25}},{we - .25:.3f});')
    if cls == "ring":
        js.append(f'tl.from("#g{gi} .ringc",{{scale:.4,opacity:0,rotation:-90,duration:.45,ease:"back.out(2)"}},{ws:.3f});')

# bottom captions for every other line (+ the repeated hook and the outro)
bottom = [(A[i]["start"], A[i]["end"], LINES[i][1]) for i in range(len(LINES)) if i not in placed and i != 33]
for s_, e_ in A[32].get("repeats", []):
    bottom.append((s_, e_, "বাজে সাড়ে বারো।"))
bottom.append((A[33]["start"], A[33]["end"], "সাড়ে বারো…"))
bottom.sort()
for k, (s_, e_, t) in enumerate(bottom):
    nxt = bottom[k + 1][0] if k + 1 < len(bottom) else DUR
    show_end = min(nxt - .05, e_ + 0.9)
    st = s_ - .25
    clips.append(f'<div id="b{k}" class="clip bot" data-start="{st:.3f}" data-duration="{show_end - st:.3f}" data-track-index="{6 + k % 2}"><div class="pill">{kara(f"b{k}r", t, s_, e_)}</div></div>')
    js.append(f'tl.from("#b{k} .pill",{{y:30,opacity:0,duration:.25,ease:"power2.out"}},{st:.3f});')
    js.append(f'tl.to("#b{k} .pill",{{opacity:0,duration:.2}},{show_end - .2:.3f});')

# title card over the instrumental intro
clips.append('<div id="title" class="clip" data-start="0" data-duration="4.7" data-track-index="8"><div class="clock"><i class="h"></i><i class="m"></i></div>'
             '<div class="tt">সাড়ে বারো</div><div class="ts">PABLO PIKASO</div></div>')
js.append('tl.from("#title .clock",{scale:.5,opacity:0,duration:.6,ease:"back.out(2)"},0.2);tl.from("#title .tt",{y:40,opacity:0,duration:.6},0.45);tl.from("#title .ts",{opacity:0,duration:.6},0.9);')
js.append('tl.fromTo("#title .m",{rotation:0},{rotation:180,duration:2.2,ease:"power2.inOut"},0.6);tl.to("#title",{opacity:0,duration:.5},4.15);')

css = open("/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/mv/mv.css").read()
page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/><title>সাড়ে বারো</title>
<script src="assets/gsap.min.js"></script><style>{css}</style></head><body>
<div id="root" data-composition-id="mv" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
<video id="vid" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0" src="assets/clean.mp4" muted playsinline></video>
{''.join(clips)}</div>
<script>window.__timelines=window.__timelines||{{}};const tl=gsap.timeline({{paused:true}});
{chr(10).join(js)}
window.__timelines["mv"]=tl;</script></body></html>"""
open(f"{P}/hf/index.html", "w").write(page)
print("wrote", len(page), "bottom", len(bottom), "groups", len(GROUPS))

"""HyperFrames 16:9 composition for PILLAR 01 · Lesson 02."""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from l2_script import SCENES

P = "/home/user/test/projects/pillar01-lesson02"
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
LN = {}
for L in T["lines"]:
    LN.setdefault(L["scene"], []).append(L)

_src = open(f"{HERE}/../../pillar01-lesson01/source/build_l1.py").read()
exec(_src[_src.index("ICON = {"):_src.index("\n\n\ndef ic(")])
ICON.update({
 "image": '<svg viewBox="0 0 48 48"><rect x="6" y="9" width="36" height="30" rx="4"/><circle cx="17" cy="19" r="4"/><path d="m6 34 11-10 9 8 6-5 10 9"/></svg>',
 "audio": '<svg viewBox="0 0 48 48"><path d="M18 36V10l22-4v26"/><circle cx="13" cy="36" r="5"/><circle cx="35" cy="32" r="5"/></svg>',
 "video": '<svg viewBox="0 0 48 48"><rect x="5" y="12" width="28" height="24" rx="4"/><path d="m33 21 10-6v18l-10-6z"/></svg>',
 "code": '<svg viewBox="0 0 48 48"><path d="m16 14-10 10 10 10M32 14l10 10-10 10M27 9l-6 30"/></svg>',
 "chat": '<svg viewBox="0 0 48 48"><path d="M8 10h32v22H22l-9 7v-7H8z"/><path d="M15 18h18M15 24h12"/></svg>',
 "search": '<svg viewBox="0 0 48 48"><circle cx="21" cy="21" r="12"/><path d="m30 30 11 11"/></svg>',
 "star": '<svg viewBox="0 0 48 48"><path d="m24 6 5.5 11.5L42 19l-9 8.5 2.3 12.5L24 34l-11.3 6 2.3-12.5L6 19l12.5-1.5z"/></svg>',
 "robot": '<svg viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="22" rx="6"/><circle cx="19" cy="25" r="3"/><circle cx="29" cy="25" r="3"/><path d="M24 14V7M20 7h8M6 23v6M42 23v6"/></svg>',
 "spark": '<svg viewBox="0 0 48 48"><path d="M24 5c2 10 9 17 19 19-10 2-17 9-19 19-2-10-9-17-19-19 10-2 17-9 19-19z"/></svg>',
 "doc": '<svg viewBox="0 0 48 48"><path d="M12 6h17l9 9v27H12z"/><path d="M29 6v9h9M18 24h14M18 31h14"/></svg>',
})


def at(scene, i, frac=0.0, off=0.0):
    L = LN[scene][i]
    return round(L["start"] + (L["end"] - L["start"]) * frac + off, 3)


def ic(name, cls=""):
    return f'<span class="ic {cls}">{ICON[name]}</span>'


def e(t):
    return html.escape(t)


scene_html, js = [], []


def rev(sel, t, frm="y:40,opacity:0", d=0.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{d},ease:"{ease}"}},{t:.3f});')


def hide(sel, t, d=0.3):
    js.append(f'tl.to("{sel}",{{opacity:0,duration:{d}}},{t:.3f});')


def clip(sid, inner):
    s = SC[sid]
    return (f'<div id="{sid}" class="clip scene" data-start="{s["start"]:.3f}" data-duration="{s["end"] - s["start"]:.3f}" data-track-index="3">'
            f'<div class="chap"><span class="n">{s["num"]} / ১১</span><span class="t">{e(s["title"])}</span></div>{inner}</div>')


# ---------- s01 intro
s = "s01"
road = SCENES[0]["onscreen"][1:]
inner = (f'<div class="photo"><img id="p1" src="assets/presenter.png" alt=""/><div class="tag">AI শেখার সঙ্গী · বাংলায়</div></div>'
         f'<div class="introR"><div class="kicker">PILLAR 01 · LESSON 02</div><div class="bigt" id="s01t" style="font-size:62px">AI, Machine Learning, Deep Learning ও Generative AI</div>'
         f'<div class="sub" id="s01s">যে শব্দগুলো সবাই বলে — আজ পরিষ্কার করে বুঝব</div><div class="road">'
         + "".join(f'<div class="chip" id="s01r{k}"><span class="num">{k + 1:02d}</span>{e(r)}</div>' for k, r in enumerate(road)) + '</div></div>')
scene_html.append(clip(s, inner))
rev("#s01 .photo", SC[s]["start"] + 0.2, "x:-60,opacity:0", 0.8)
rev("#s01 .kicker", at(s, 0, 0, -0.3), "y:20,opacity:0", 0.5)
rev("#s01t", at(s, 0, 0.1), "y:40,opacity:0", 0.7)
rev("#s01s", at(s, 1, 0.1))
for k, f in enumerate([0.08, 0.3, 0.55, 0.8]): rev(f"#s01r{k}", at(s, 2, f), "x:60,opacity:0", 0.45)
rev("#s01r4", at(s, 3, 0.05), "x:60,opacity:0", 0.45)
rev("#s01r5", at(s, 3, 0.6), "x:60,opacity:0", 0.45)
js.append(f'tl.fromTo("#p1",{{scale:1}},{{scale:1.06,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

# ---------- s02 nested circles
s = "s02"
rings = [("Artificial Intelligence", 640), ("Machine Learning", 500), ("Deep Learning", 360), ("Generative AI", 200)]
inner = '<div class="rings" id="s02rings">'
for k, (t, d) in enumerate(rings):
    inner += f'<div class="ring r{k}" id="s02g{k}" style="left:{380 - d // 2}px;top:{320 - d // 2}px;width:{d}px;height:{d}px"><span class="rl2">{e(t)}</span></div>'
inner += '</div>'
defs = [("var(--cyan)", "Artificial Intelligence", "বুদ্ধিমত্তার কাজ কম্পিউটারকে দিয়ে করানোর পুরো ক্ষেত্র", ""),
        ("var(--purple)", "Machine Learning", "AI তৈরির একটি পদ্ধতি — ডেটা থেকে নিজে শেখা", "হাতে লেখা নিয়মের দাবা প্রোগ্রাম = AI, কিন্তু ML নয়"),
        ("var(--pink)", "Deep Learning", "অনেক স্তরের নিউরাল নেটওয়ার্ক দিয়ে শেখা", ""),
        ("var(--amber)", "Generative AI", "নতুন কনটেন্ট তৈরি করে — বেশিরভাগই Deep Learning-ভিত্তিক", "")]
inner += '<div class="defs">' + "".join(
    f'<div class="drow" id="s02d{k}"><i class="dot2" style="background:{c};box-shadow:0 0 14px {c}"></i><div><div class="dt">{e(t)}</div><div class="dd">{e(d)}</div>'
    + (f'<div class="dn2" id="s02dn{k}">{e(n)}</div>' if n else '') + '</div></div>' for k, (c, t, d, n) in enumerate(defs)) + '</div>'
inner += f'<div class="clip" id="s02rule" style="position:absolute">{ic("check", "lg gr")}<span>সব Deep Learning-ই Machine Learning,<br/>কিন্তু সব Machine Learning, Deep Learning নয়</span></div>'.replace('class="clip" ', '')
scene_html.append(clip(s, inner))
for k in range(4):
    t = at(s, k + 1, 0.03)
    rev(f"#s02g{k}", t, "scale:0.6,opacity:0", 0.7, "back.out(1.4)")
    rev(f"#s02d{k}", t + 0.15, "x:60,opacity:0", 0.5)
rev("#s02dn1", at(s, 2, 0.55), "y:12,opacity:0", 0.4)
for k in range(4):
    js.append(f'tl.to("#s02g{k}",{{scale:1.04,duration:0.35,yoyo:true,repeat:1,ease:"sine.inOut"}},{at(s, 5, 0.05) + k * 0.3:.3f});')
rev("#s02rule", at(s, 5, 0.25), "y:40,opacity:0")
js.append(f'tl.fromTo("#s02rings",{{scale:1}},{{scale:1.04,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

# ---------- s03 machine learning types
s = "s03"
dots_init = [(40, 40), (420, 30), (230, 170), (90, 160), (330, 110), (150, 80), (440, 180), (260, 40), (30, 110), (380, 190), (190, 120), (310, 170)]
cent = [(80, 60), (400, 70), (240, 170)]
cols = ["#22e3ff", "#c4b5fd", "#fbbf24"]
offs = [(-26, -14), (14, -18), (0, 14), (-14, 26), (24, 12)]
dots_html, dot_js = "", []
for k, (x, y) in enumerate(dots_init):
    c = k % 3; ox, oy = offs[k // 3 % 5] if k < 15 else (0, 0)
    fx, fy = cent[c][0] + offs[k // 3][0], cent[c][1] + offs[k // 3][1]
    dots_html += f'<i class="dt3" id="s03p{k}" style="left:{x}px;top:{y}px;background:#9fb3d9"></i>'
    dot_js.append((k, fx - x, fy - y, cols[c]))
inner = (f'<div class="clip" id="s03head" style="position:absolute"><span>সাধারণ প্রোগ্রাম: <b class="am">নিয়ম লিখে দিই</b></span><span class="arrow">→</span><span>Machine Learning: <b class="cy">উদাহরণ দেখে নিজে প্যাটার্ন শেখে</b></span></div>'.replace('class="clip" ', '')
         + f'<div class="card mlc" id="s03c0" style="left:80px"><div class="lbl">১ · Supervised</div><div class="h">তত্ত্বাবধানে শেখা</div><div class="p">প্রতিটি উদাহরণের সাথে সঠিক উত্তর (লেবেল)</div>'
         + "".join(f'<div class="mrow" id="s03m{k}"><span>{ic("mail")} {e(t)}</span><span class="tg {c}">{e(l)}</span></div>' for k, (t, l, c) in enumerate([("“আপনি লটারি জিতেছেন!”", "স্প্যাম", "bad"), ("“কাল ক্লাস ১০টায়”", "স্প্যাম নয়", "good"), ("“ফ্রি রিচার্জ নিন”", "স্প্যাম", "bad")]))
         + '</div>'
         + f'<div class="card mlc" id="s03c1" style="left:675px"><div class="lbl">২ · Unsupervised</div><div class="h">লেবেল ছাড়া দল বানানো</div><div class="p">কেনাকাটার ধরন দেখে কাস্টমারদের দল</div><div class="dots">{dots_html}</div></div>'
         + f'<div class="card mlc" id="s03c2" style="left:1270px"><div class="lbl">৩ · Reinforcement</div><div class="h">চেষ্টা ও ভুল থেকে শেখা</div><div class="p">গেম খেলা, রোবট নিয়ন্ত্রণ</div>'
         + f'<div class="rlbox"><div class="agent">{ic("robot")}</div><div class="rarr">→</div><div class="rw p" id="s03rp">{ic("star", "gr")} ভালো কাজ: পুরস্কার</div><div class="rw n" id="s03rn">✗ খারাপ কাজ: শাস্তি</div></div></div>'
         + f'<div class="clip" id="s03foot" style="position:absolute">{ic("db", "gr")} শক্তি আসে ডেটা থেকে — ডেটা যত ভালো, শেখা তত ভালো</div>'.replace('class="clip" ', ''))
scene_html.append(clip(s, inner))
rev("#s03head", at(s, 0, 0.05), "y:-20,opacity:0")
for k in range(3): rev(f"#s03c{k}", at(s, 1, 0.1 + k * 0.25), "y:60,opacity:0", 0.55)
for k in range(3): rev(f"#s03m{k}", at(s, 2, 0.45 + k * 0.12), "x:-30,opacity:0", 0.35)
js.append(f'tl.to("#s03c0",{{borderColor:"rgba(34,227,255,.8)",duration:0.3,yoyo:true,repeat:1}},{at(s, 2, 0):.3f});')
js.append(f'tl.to("#s03c1",{{borderColor:"rgba(139,92,246,.9)",duration:0.3,yoyo:true,repeat:1}},{at(s, 3, 0):.3f});')
for k, dx, dy, c in dot_js:
    js.append(f'tl.to("#s03p{k}",{{x:{dx},y:{dy},backgroundColor:"{c}",duration:1.4,ease:"power2.inOut"}},{at(s, 3, 0.45) + (k % 4) * 0.08:.3f});')
js.append(f'tl.to("#s03c2",{{borderColor:"rgba(251,191,36,.9)",duration:0.3,yoyo:true,repeat:1}},{at(s, 4, 0):.3f});')
rev("#s03rp", at(s, 4, 0.35), "scale:0.6,opacity:0", 0.4, "back.out(2)")
rev("#s03rn", at(s, 4, 0.5), "scale:0.6,opacity:0", 0.4, "back.out(2)")
rev("#s03foot", at(s, 5, 0.05), "y:30,opacity:0")

# ---------- s04 neural network & deep learning
s = "s04"
LX = [230, 500, 760, 1020]
LY = [[130, 210, 290, 370], [90, 170, 250, 330, 410], [90, 170, 250, 330, 410], [190, 310]]
lines_svg = ""
for a in range(3):
    for i, y1 in enumerate(LY[a]):
        for j, y2 in enumerate(LY[a + 1]):
            wt = ' class="wt" id="s04wl"' if (a, i, j) == (0, 1, 2) else ''
            lines_svg += f'<line x1="{LX[a]}" y1="{y1}" x2="{LX[a + 1]}" y2="{y2}"{wt}/>'
nodes = ""
for a, ys in enumerate(LY):
    cls = "" if a == 0 else ("o" if a == 3 else "h")
    for i, y in enumerate(ys):
        nodes += f'<i class="nn {cls} L{a}" style="left:{LX[a]}px;top:{y}px"></i>'
shade = [0.15, 0.3, 0.3, 0.3, 0.15, 0.3, 0.8, 0.5, 0.8, 0.3, 0.3, 0.6, 0.9, 0.6, 0.3, 0.3, 0.5, 0.7, 0.5, 0.3, 0.15, 0.3, 0.4, 0.3, 0.15]
pix = '<div class="pix" id="s04pix">' + "".join(f'<i style="background:rgba(234,244,255,{v})"></i>' for v in shade) + '</div>'
SVG_L = '<svg viewBox="0 0 96 80" fill="none" stroke="#22e3ff" stroke-width="4" stroke-linecap="round"><path d="M8 66 30 20M42 66l20-44 26 44M8 40h22"/></svg>'
SVG_E = '<svg viewBox="0 0 96 80" fill="none" stroke="#c4b5fd" stroke-width="4" stroke-linejoin="round"><path d="M6 46c10-14 34-14 44 0-10 14-34 14-44 0z"/><circle cx="28" cy="46" r="7"/><path d="M62 64 74 18l16 46z"/></svg>'
SVG_F = '<svg viewBox="0 0 96 80" fill="none" stroke="#34d399" stroke-width="4" stroke-linejoin="round"><path d="M18 30 14 6l20 14h28l20-14-4 24c6 8 6 20 0 28-8 14-60 14-68 0-6-8-6-20 0-28z"/><circle cx="36" cy="42" r="4"/><circle cx="60" cy="42" r="4"/><path d="M44 54h8l-4 5z"/></svg>'
inner = (f'<div class="card" id="s04net"><svg class="lines" viewBox="0 0 1220 470" id="s04lines">{lines_svg}</svg>{pix}{nodes}'
         f'<span class="outl gr" style="left:1052px;top:177px">বিড়াল ✓</span><span class="outl" style="left:1052px;top:297px;color:var(--mute)">কুকুর</span>'
         f'<span class="lyl" style="left:230px">ইনপুট স্তর</span><span class="lyl" style="left:630px">লুকানো স্তর</span><span class="lyl" style="left:1020px">আউটপুট স্তর</span>'
         f'<span id="s04wt" style="left:300px;top:168px">weight (ওজন)</span><span id="s04deep">অনেক স্তর = Deep</span></div>'
         f'<div class="card" id="s04note"><div class="lbl pu">Artificial Neural Network</div><div class="p">মস্তিষ্কের নিউরন থেকে অনুপ্রাণিত — <b class="am">হুবহু নকল নয়</b>, সরল গাণিতিক মডেল</div></div>'
         f'<div class="card" id="s04use"><div class="lbl">Deep Learning-এ চলে</div><div class="chips">'
         + "".join(f'<span class="chip">{t}</span>' for t in ["ছবি চেনা", "বাংলা ভয়েস টাইপিং", "অনুবাদ"]) + '</div></div>'
         f'<div class="feat" id="s04feat"><div class="fbox" id="s04f0">{SVG_L}<span>প্রথম স্তর:<br/>রেখা ও কোণ</span></div><div class="farr">→</div>'
         f'<div class="fbox" id="s04f1">{SVG_E}<span>পরের স্তর:<br/>চোখ, কান</span></div><div class="farr">→</div>'
         f'<div class="fbox" id="s04f2">{SVG_F}<span>শেষের স্তর:<br/>পুরো মুখ</span></div></div>')
scene_html.append(clip(s, inner))
rev("#s04net", at(s, 0, 0.1), "y:40,opacity:0", 0.6)
js.append(f'tl.from("#s04lines line",{{opacity:0,duration:0.6,stagger:0.006}},{at(s, 0, 0.3):.3f});')
rev("#s04note", at(s, 1, 0.45), "x:60,opacity:0")
rev("#s04pix", at(s, 2, 0.12), "scale:0.5,opacity:0", 0.4, "back.out(2)")
for a, f in enumerate([0.15, 0.4, 0.55, 0.85]):
    js.append(f'tl.from("#s04net .L{a}",{{scale:0,duration:0.35,stagger:0.05,ease:"back.out(3)"}},{at(s, 2, f):.3f});')
for rep in range(2):
    for a in range(4):
        js.append(f'tl.to("#s04net .L{a}",{{scale:1.35,duration:0.18,yoyo:true,repeat:1}},{at(s, 3, 0.75) + rep * 1.2 + a * 0.25:.3f});')
rev("#s04 .outl", at(s, 2, 0.9), "x:-20,opacity:0", 0.4)
js.append(f'tl.to("#s04wl",{{opacity:0.25,duration:0.3,yoyo:true,repeat:5,ease:"sine.inOut"}},{at(s, 3, 0.45):.3f});')
rev("#s04wt", at(s, 3, 0.08), "scale:0.6,opacity:0", 0.4, "back.out(2)")
js.append(f'tl.to("#s04wt",{{rotation:6,duration:0.25,yoyo:true,repeat:5,ease:"sine.inOut"}},{at(s, 3, 0.45):.3f});')
rev("#s04deep", at(s, 4, 0.1), "y:-20,opacity:0", 0.45, "back.out(2)")
js.append(f'tl.to("#s04net .L1, #s04net .L2",{{scale:1.3,duration:0.3,yoyo:true,repeat:1,stagger:0.04}},{at(s, 4, 0.2):.3f});')
for k, f in enumerate([0.05, 0.4, 0.7]): rev(f"#s04f{k}", at(s, 5, f), "y:40,opacity:0", 0.45)
rev("#s04use", at(s, 6, 0.05), "x:60,opacity:0")
js.append(f'tl.from("#s04use .chip",{{y:20,opacity:0,stagger:0.3,duration:0.35}},{at(s, 6, 0.2):.3f});')

# ---------- s05 generative AI
s = "s05"
inner = (f'<div class="card gcard" id="s05L"><div class="lbl">আগের অনেক AI</div><div class="h">{ic("search", "lg")} চেনা ও বাছাই</div>'
         f'<div class="gq">{ic("mail")} এটা কি স্প্যাম? → <b class="gr">হ্যাঁ / না</b></div>'
         f'<div class="gq">{MANGO}{JACK} আম, নাকি কাঁঠাল?</div></div>'
         f'<div id="s05arr">→</div>'
         f'<div class="card gcard" id="s05R"><div class="lbl am">Generative AI</div><div class="h">{ic("spark", "lg am")} নতুন কনটেন্ট তৈরি</div>'
         f'<div class="p">যা আগে হুবহু ছিল না — বর্ণনা বা প্রম্পট থেকে</div>'
         + "".join(f'<i class="spark" id="s05k{k}" style="left:{x}px;top:{y}px"></i>' for k, (x, y) in enumerate([(700, 40), (740, 120), (660, 200), (560, 60)])) + '</div>'
         '<div class="outs">' + "".join(f'<div class="tile" id="s05o{k}">{ic(i, "lg am")}<div class="tt">{t}</div><div class="ts">{e(d)}</div></div>' for k, (i, t, d) in enumerate(
             [("doc", "লেখা", "ইমেইল, রিপোর্ট, গল্প"), ("image", "ছবি", "বর্ণনা থেকে নতুন ছবি"), ("audio", "অডিও", "কৃত্রিম কণ্ঠ, মিউজিক"), ("video", "ভিডিও", "ছোট ক্লিপ"), ("code", "কোড", "প্রোগ্রামের অংশ")])) + '</div>'
         f'<div class="clip" id="s05ban" style="position:absolute">{ic("alert", "am")}<span><b class="am">নতুন মানেই সঠিক বা নিরাপদ নয়</b> — ভুল তথ্য বানাতে পারে · কপিরাইট ও নৈতিকতা → লেসন ০৬</span></div>'.replace('class="clip" ', ''))
scene_html.append(clip(s, inner))
rev("#s05L", at(s, 1, 0, -0.2), "x:-60,opacity:0")
rev("#s05arr", at(s, 2, 0.02), "x:-30,opacity:0", 0.4)
rev("#s05R", at(s, 2, 0.05), "x:60,opacity:0")
js.append(f'tl.from("#s05R .spark",{{scale:0,rotation:-90,opacity:0,stagger:0.12,duration:0.45,ease:"back.out(3)"}},{at(s, 2, 0.4):.3f});')
for k, f in enumerate([0.01, 0.17, 0.33, 0.48, 0.58]): rev(f"#s05o{k}", at(s, 3, f), "y:50,scale:0.9,opacity:0", 0.5, "back.out(1.6)")
js.append(f'tl.to("#s05o0",{{borderColor:"rgba(251,191,36,.9)",duration:0.4,yoyo:true,repeat:1}},{at(s, 3, 0.75):.3f});')
rev("#s05ban", at(s, 4, 0.05), "y:40,opacity:0")

# ---------- s06 LLM
s = "s06"
inner = (f'<div class="card" id="s06def"><div class="lbl">Large Language Model · LLM</div><div class="h">বিপুল লেখায় ট্রেনিং পাওয়া <span class="cy">বড় নিউরাল নেটওয়ার্ক</span> — ভাষা বোঝে, উত্তর দেয়, নতুন লেখা তৈরি করে</div></div>'
         '<div id="s06as">' + "".join(f'<span class="chip" id="s06a{k}">{t}</span>' for k, t in enumerate(["ChatGPT", "Gemini", "Claude"]))
         + '<span class="arrow" id="s06aa">→</span><span class="eng" id="s06ae">পেছনের মূল ইঞ্জিন: LLM</span></div>'
         f'<div class="card lstep" id="s06p1"><div class="lbl">ধাপ ১</div><div class="h">{ic("book", "lg")} প্রি-ট্রেনিং</div>'
         '<div class="p">বই, ওয়েবসাইট, নানা লেখা থেকে শেখে — কোন শব্দের পরে কোন শব্দের সম্ভাবনা বেশি</div>'
         '<div class="nxtw" id="s06nx">আমি ভাত <span class="blank" id="s06bl"></span> <span class="fill" id="s06fl">খাই</span></div></div>'
         '<div id="s06arr">→</div>'
         f'<div class="card lstep" id="s06p2"><div class="lbl pu">ধাপ ২</div><div class="h">{ic("user", "lg pu")} ফাইন-টিউনিং ও ফিডব্যাক</div>'
         '<div class="blist">' + "".join(f'<span class="chip" id="s06b{k}">{t}</span>' for k, t in enumerate(["নির্দেশনা মানা", "কাজের উত্তর দেওয়া", "ক্ষতিকর অনুরোধ এড়ানো", "মানুষের মূল্যায়ন ও ফিডব্যাক"])) + '</div></div>'
         f'<div class="clip" id="s06note" style="position:absolute">{ic("alert", "am")}<span><b class="am">তথ্যভান্ডার থেকে খুঁজে আনে না</b> — শেখা প্যাটার্ন থেকে সম্ভাব্য উত্তর তৈরি করে · তাই আত্মবিশ্বাসী ভুলও হয়</span></div>'.replace('class="clip" ', ''))
scene_html.append(clip(s, inner))
rev("#s06def", at(s, 1, 0, -0.2), "y:40,opacity:0")
for k in range(3): rev(f"#s06a{k}", at(s, 2, 0.05 + k * 0.12), "y:20,opacity:0", 0.4)
rev("#s06aa", at(s, 2, 0.5), "x:-20,opacity:0", 0.3)
rev("#s06ae", at(s, 2, 0.55), "scale:0.8,opacity:0", 0.4, "back.out(2)")
rev("#s06p1", at(s, 4, 0.0, -0.3), "y:50,opacity:0")
js.append(f'tl.from("#s06fl",{{opacity:0,y:-10,duration:0.4}},{at(s, 4, 0.75):.3f});')
js.append(f'tl.to("#s06bl",{{minWidth:0,width:0,borderBottomColor:"rgba(34,227,255,0)",duration:0.3}},{at(s, 4, 0.74):.3f});')
rev("#s06arr", at(s, 5, 0.0), "x:-30,opacity:0", 0.3)
rev("#s06p2", at(s, 5, 0.02), "y:50,opacity:0")
for k, f in enumerate([0.12, 0.26, 0.4, 0.68]): rev(f"#s06b{k}", at(s, 5, f), "scale:0.7,opacity:0", 0.35, "back.out(2)")
rev("#s06note", at(s, 6, 0.05), "y:30,opacity:0")
js.append(f'tl.to("#s06note",{{scale:1.02,duration:0.3,yoyo:true,repeat:1}},{at(s, 6, 0.75):.3f});')

# ---------- s07 training data
s = "s07"
hw = [("অ", "অ"), ("ক", "ক"), ("ম", "ম"), ("৫", "৫")]
inner = (f'<div class="card" id="s07L"><div class="lbl">Training Data</div><div class="h" style="font-size:38px">শেখার উদাহরণ</div>'
         '<div class="dgrid">' + "".join(f'<div class="tile" id="s07t{k}">{ic(i)}<div class="tt">{t}</div></div>' for k, (i, t) in enumerate([("doc", "লেখা"), ("image", "ছবি"), ("audio", "শব্দ"), ("calc", "সংখ্যা")])) + '</div>'
         '<div class="hw" id="s07hw"><div class="hl">উদাহরণ: বাংলা হাতের লেখা চেনা — হাজারো ছবি + সঠিক লেবেল</div><div class="hwr">'
         + "".join(f'<div class="hwc"><b>{a}</b><span>লেবেল: {b}</span></div>' for a, b in hw) + '</div></div></div>'
         '<div class="drows">'
         f'<div class="drw w" id="s07r0">{ic("alert", "lg am")}<div><div class="lt">Garbage in, garbage out</div><div class="ls">ভুল বা নিম্নমানের ডেটা → খারাপ ফলাফল</div></div></div>'
         f'<div class="drw w" id="s07r1">{ic("scale", "lg am")}<div><div class="lt">পক্ষপাত (Bias)</div><div class="ls">শুধু এক ধরনের মানুষের ছবিতে শিখলে অন্যদের ক্ষেত্রে বেশি ভুল</div></div></div>'
         f'<div class="drw" id="s07r2">{ic("clock", "lg")}<div><div class="lt">সময়সীমা (Cut-off)</div><div class="ls">ট্রেনিংয়ের পরের ঘটনা নিজে জানে না — তাই কেউ কেউ ওয়েব সার্চ ব্যবহার করে</div></div></div>'
         f'<div class="drw" id="s07r3">{ic("globe", "lg")}<div><div class="lt">বাংলা ডেটা তুলনামূলক কম</div><div class="ls">বাংলায় দক্ষতা কম হতে পারে — তবে দ্রুত উন্নত হচ্ছে</div></div></div></div>')
scene_html.append(clip(s, inner))
rev("#s07L", at(s, 0, 0.3), "x:-60,opacity:0")
js.append(f'tl.from("#s07L .dgrid .tile",{{scale:0.7,opacity:0,stagger:0.25,duration:0.4,ease:"back.out(2)"}},{at(s, 1, 0.12):.3f});')
rev("#s07hw", at(s, 1, 0.5), "y:30,opacity:0")
js.append(f'tl.from("#s07hw .hwc",{{y:20,opacity:0,stagger:0.18,duration:0.35}},{at(s, 1, 0.6):.3f});')
for k in range(4): rev(f"#s07r{k}", at(s, k + 2, 0.03), "x:60,opacity:0", 0.5)

# ---------- s08 tokens & inference
s = "s08"
EN = ["I", " love", " learn", "ing", " AI"]
BN = ["আ", "মি", " AI", " শি", "খ", "তে", " ভা", "লো", "বা", "সি"]
TC = ["#22e3ff", "#c4b5fd", "#fbbf24", "#34d399", "#fb7185", "#f0abfc"]


def toks(lst, pre):
    return "".join(f'<span class="tk {pre}" style="color:{TC[k % 6]};border-color:{TC[k % 6]}88;background:{TC[k % 6]}1a">{e(t)}</span>' for k, t in enumerate(lst))


inner = (f'<div class="card" id="s08tok"><div class="lbl">টোকেন = লেখার ছোট টুকরো</div>'
         '<div class="ex2" style="top:auto;bottom:22px">উদাহরণ — আসল ভাঙন মডেলভেদে আলাদা</div>'
         '<div id="s08rule">OpenAI-এর মোটা হিসাব: ইংরেজিতে গড়ে <b class="cy">~৪ অক্ষর ≈ ১ টোকেন</b></div>'
         f'<div class="trow" id="s08en"><span class="lang">ইংরেজি</span>{toks(EN, "te")}<span class="cnt">৫ টোকেন</span></div>'
         f'<div class="trow" id="s08bn"><span class="lang">বাংলা</span>{toks(BN, "tb")}<span class="cnt">১০ টোকেন</span></div></div>'
         f'<div class="card" id="s08ctx"><div class="lbl">কনটেক্সট উইন্ডো</div><div class="p" style="font-size:25px">মডেল একবারে নির্দিষ্ট পরিমাণ টোকেনই মাথায় রাখতে পারে</div>'
         '<div class="cwin"><i id="s08cw"></i></div><div class="cost" id="s08cost"><span class="chip">💳 অনেক পেইড সার্ভিসে খরচ = টোকেনের হিসাবে</span></div></div>'
         f'<div class="card" id="s08inf"><div class="lbl gr">ইনফারেন্স = ট্রেনিং-শেষ মডেল দিয়ে উত্তর তৈরি</div>'
         '<div class="ians"><span class="q">“বাংলাদেশের রাজধানী কোথায়?” →</span>'
         + "".join(f'<span class="tk ti" id="s08i{k}" style="color:#34d399;border-color:#34d39988;background:#34d3991a">{e(t)}</span>' for k, t in enumerate(["বাংলাদেশের", " রাজধানী", " ঢাকা", "।"])) + '</div>'
         '<div class="tcmp" id="s08cmp"><span class="chip" style="border-color:rgba(139,92,246,.6);background:rgba(139,92,246,.12)">ট্রেনিং: একবার · অনেক সময় ও খরচ</span>'
         '<span class="chip" style="border-color:rgba(52,211,153,.6);background:rgba(52,211,153,.12)">ইনফারেন্স: প্রতিবার প্রশ্নে</span></div>'
         '<div class="p am" id="s08var" style="position:static;margin-top:14px;display:inline-block">একই প্রশ্নে উত্তর হুবহু এক না-ও হতে পারে</div></div>')
scene_html.append(clip(s, inner))
rev("#s08tok", at(s, 1, 0, -0.2), "y:40,opacity:0")
js.append(f'tl.from("#s08en .tk",{{scale:0.4,opacity:0,stagger:0.12,duration:0.3,ease:"back.out(2.5)"}},{at(s, 1, 0.35):.3f});')
js.append(f'tl.from("#s08bn .tk",{{scale:0.4,opacity:0,stagger:0.12,duration:0.3,ease:"back.out(2.5)"}},{at(s, 2, 0.45):.3f});')
rev("#s08en .cnt", at(s, 2, 0.2), "opacity:0", 0.4)
rev("#s08bn .cnt", at(s, 2, 0.75), "opacity:0", 0.4)
rev("#s08rule", at(s, 2, 0.05), "y:-20,opacity:0")
rev("#s08ctx", at(s, 3, 0.15), "y:50,opacity:0")
js.append(f'tl.fromTo("#s08cw",{{scaleX:0}},{{scaleX:1,duration:2.2,ease:"power1.inOut"}},{at(s, 3, 0.35):.3f});')
rev("#s08cost", at(s, 3, 0.75), "x:-30,opacity:0", 0.4)
rev("#s08inf", at(s, 4, 0.02), "y:50,opacity:0")
for k in range(4): rev(f"#s08i{k}", at(s, 4, 0.5 + k * 0.1), "scale:0.4,opacity:0", 0.3, "back.out(2.5)")
rev("#s08cmp", at(s, 5, 0.05), "y:20,opacity:0", 0.45)
rev("#s08var", at(s, 6, 0.1), "scale:0.8,opacity:0", 0.4, "back.out(2)")

# ---------- s09 search engine vs assistant
s = "s09"
BARS = '<div class="bar"><i style="background:#fb7185"></i><i style="background:#fbbf24"></i><i style="background:#34d399"></i>'
inner = (f'<div class="pan" id="s09A">{BARS}<div class="addr">🔍 সার্চ ইঞ্জিন</div><div class="illus">প্রতীকী চিত্র — আসল স্ক্রিনশট নয়</div></div>'
         '<div class="pbody"><div class="qbox">সালোকসংশ্লেষণ কী</div><span class="hyb" id="s09h1" style="top:92px;right:40px">AI-তৈরি সারাংশ</span>'
         + "".join(f'<div class="lnk" id="s09l{k}"><div class="lt3">ওয়েবপেজ {"১২৩"[k]} — শিরোনাম</div><div class="lu">উৎসের লিংক · website-{k + 1}</div></div>' for k in range(3))
         + '</div></div>'
         f'<div class="pan" id="s09B">{BARS}<div class="addr">💬 AI অ্যাসিস্ট্যান্ট</div><div class="illus">প্রতীকী চিত্র — আসল স্ক্রিনশট নয়</div></div>'
         '<div class="pbody"><div class="fub" style="margin-top:0">সালোকসংশ্লেষণ কী, সহজ বাংলায় বলুন</div>'
         '<div class="aib" id="s09ans"><div class="at3">একটি গোছানো উত্তর, এক জায়গায়</div>' + "".join(f'<i class="ln" style="width:{w}%"></i>' for w in [96, 88, 92, 60]) + '</div>'
         '<span class="hyb" id="s09h2" style="top:250px;left:24px;right:auto">উৎসের লিংক (কিছু অ্যাসিস্ট্যান্টে)</span>'
         '<div class="fub" id="s09fu">আরেকটু উদাহরণ দিন — ফলো-আপ</div></div></div>'
         '<div class="pc" id="s09pa"><div class="pr g">✓ সাম্প্রতিক তথ্য · আসল উৎসের লিংক · অফিশিয়াল সাইট</div><div class="pr a">✗ অনেক লিংক ঘেঁটে নিজেকেই উত্তর জোড়া দিতে হয়</div></div>'
         '<div class="pc" id="s09pb"><div class="pr g">✓ ব্যাখ্যা · সারসংক্ষেপ · খসড়া · ধাপে ধাপে বোঝানো</div><div class="pr a">✗ ভুল তথ্য বানাতে পারে · অনেক সময় উৎস দেখায় না</div></div>'
         f'<div class="clip" id="s09rule" style="position:absolute">{ic("shield", "lg")}<span>গুরুত্বপূর্ণ তথ্যের জন্য — <b class="cy">আসল উৎস খুলে মিলিয়ে নিন</b></span></div>'.replace('class="clip" ', '')
         + '<div class="exq" id="s09e1"><div class="qq">“এসএসসি পরীক্ষার ফলাফল কবে প্রকাশ হবে?”</div><div class="ans"><span class="stamp s">সার্চ</span>সাম্প্রতিক ও অফিশিয়াল → শিক্ষা বোর্ডের অফিশিয়াল ওয়েবসাইট</div></div>'
         '<div class="exq" id="s09e2"><div class="qq">“সালোকসংশ্লেষণ সহজ বাংলায় বুঝিয়ে দিন”</div><div class="ans"><span class="stamp a">AI অ্যাসিস্ট্যান্ট</span>ব্যাখ্যা → তবে পাঠ্যবইয়ের সাথে মিলিয়ে নিন</div></div>')
scene_html.append(clip(s, inner))
rev("#s09A", at(s, 0, 0.3), "x:-60,opacity:0", 0.6)
rev("#s09B", at(s, 0, 0.6), "x:60,opacity:0", 0.6)
for k in range(3): rev(f"#s09l{k}", at(s, 1, 0.3 + k * 0.12), "y:20,opacity:0", 0.35)
rev("#s09ans", at(s, 2, 0.15), "y:20,opacity:0", 0.45)
js.append(f'tl.from("#s09ans .ln",{{scaleX:0,stagger:0.25,duration:0.5,ease:"power2.out"}},{at(s, 2, 0.25):.3f});')
rev("#s09fu", at(s, 2, 0.7), "y:20,opacity:0", 0.4)
rev("#s09pa", at(s, 3, 0.03), "y:40,opacity:0")
rev("#s09pb", at(s, 4, 0.03), "y:40,opacity:0")
hide("#s09pa, #s09pb", at(s, 5, 0, -0.1))
rev("#s09h1", at(s, 5, 0.15), "scale:0.6,opacity:0", 0.4, "back.out(2)")
rev("#s09h2", at(s, 5, 0.05), "scale:0.6,opacity:0", 0.4, "back.out(2)")
rev("#s09rule", at(s, 5, 0.6), "y:40,opacity:0")
hide("#s09rule", at(s, 6, 0, -0.1))
rev("#s09e1", at(s, 6, 0.05), "x:-50,opacity:0")
js.append(f'tl.to("#s09A",{{borderColor:"rgba(147,197,253,.9)",duration:0.4}},{at(s, 6, 0.5):.3f});')
js.append(f'tl.to("#s09A",{{borderColor:"rgba(255,255,255,.16)",duration:0.4}},{at(s, 7, 0):.3f});')
rev("#s09e2", at(s, 7, 0.05), "x:50,opacity:0")
js.append(f'tl.to("#s09B",{{borderColor:"rgba(251,191,36,.9)",duration:0.4}},{at(s, 7, 0.3):.3f});')

# ---------- s10 exercise
s = "s10"
qs = ["জাতীয় ফলের নাম", "ইমেইলের ৫টি বিষয়", "এই সপ্তাহে ঢাকার আবহাওয়া"]
ex = ["স্প্যাম ফিল্টার", "ফোনের ফেস আনলক", "ChatGPT দিয়ে ইমেইল", "হাতে লেখা নিয়মের দাবা প্রোগ্রাম", "কাস্টমারদের দলে ভাগ", "বর্ণনা থেকে ছবি"]
inner = ('<div class="ws2" id="s10ws"><div style="margin-bottom:14px"><span class="ptag">অংশ ১</span> <b style="font:700 26px var(--bn);margin-left:10px">একই প্রশ্ন: Google সার্চ বনাম ChatGPT / Gemini</b></div>'
         '<div class="wsh" id="s10h"><div>প্রশ্ন</div><div>নির্ভুলতা</div><div>উৎস</div><div>সাম্প্রতিক</div><div>সহজবোধ্য</div></div>'
         + "".join(f'<div class="wsr" id="s10r{k}"><div class="q">{e(q)}</div>' + '<div>S / AI</div>' * 4 + '</div>' for k, q in enumerate(qs)) + '</div>'
         f'<div id="s10save">{ic("doc", "gr")} টেবিল আর উত্তরগুলো একটি ডকুমেন্টে সংরক্ষণ করুন — পরের লেসনে কাজে লাগবে</div>'
         '<div class="cls" id="s10cls"><span class="ptag">অংশ ২</span> <b style="font:700 26px var(--bn);margin-left:10px">কোন বৃত্তে? (সবচেয়ে ভেতরের)</b>'
         '<div class="cgrid">' + "".join(f'<div class="cc" id="s10c{k}">{e(t)}<i class="qm">?</i></div>' for k, t in enumerate(ex)) + '</div>'
         '<div class="legend" id="s10lg"><span style="color:var(--cyan);border-color:var(--cyan)">AI</span><span style="color:#c4b5fd;border-color:#c4b5fd">Machine Learning</span>'
         '<span style="color:#f0abfc;border-color:#f0abfc">Deep Learning</span><span style="color:var(--amber);border-color:var(--amber)">Generative AI</span></div></div>')
scene_html.append(clip(s, inner))
rev("#s10ws", at(s, 1, 0, -0.2), "y:40,opacity:0")
rev("#s10h", at(s, 2, 0.02), "y:20,opacity:0", 0.4)
for k, f in enumerate([0.45, 0.62, 0.8]): rev(f"#s10r{k}", at(s, 1, f), "x:-30,opacity:0", 0.35)
js.append(f'tl.from("#s10h div",{{backgroundColor:"rgba(34,227,255,.45)",stagger:0.4,duration:0.5}},{at(s, 2, 0.25):.3f});')
rev("#s10cls", at(s, 3, 0, -0.2), "x:60,opacity:0")
for k, f in enumerate([0.22, 0.32, 0.45, 0.6, 0.76, 0.88]): rev(f"#s10c{k}", at(s, 3, f), "rotationY:90,opacity:0", 0.45)
rev("#s10lg", at(s, 4, 0.2), "y:20,opacity:0", 0.45)
js.append(f'tl.to("#s10cls .qm",{{scale:1.25,duration:0.25,yoyo:true,repeat:1,stagger:0.12}},{at(s, 4, 0.75):.3f});')
rev("#s10save", at(s, 5, 0.05), "y:30,opacity:0")

# ---------- s11 recap
s = "s11"
items = ["চারটি বৃত্ত: AI ⊃ ML ⊃ DL ⊃ Generative AI", "Machine Learning-এর ৩ ধরন", "Neural Network ও Deep Learning", "Generative AI ও LLM", "ট্রেনিং ডেটা · টোকেন · ইনফারেন্স", "সার্চ ইঞ্জিন বনাম AI অ্যাসিস্ট্যান্ট"]
inner = (f'<div class="photo sm"><img id="p11" src="assets/presenter.png" alt=""/><div class="tag">দেখা হবে পরের লেসনে!</div></div>'
         '<div class="rlist">' + "".join(f'<div class="rl" id="s11i{k}">{ic("check", "gr")}{e(t)}</div>' for k, t in enumerate(items)) + '</div>'
         f'<div class="card" id="s11next"><div class="lbl pu">পরের লেসন · ০৩</div><div class="h">{ic("next", "lg pu")}</div>'
         '<div class="h" style="font-size:38px">প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম</div><div class="chips">'
         + "".join(f'<span class="chip">{t}</span>' for t in ["লেখা", "ছবি", "ভিডিও", "অডিও", "কোডিং", "সঠিক টুল বাছাই"]) + '</div></div>'
         f'<div id="s11key" style="position:absolute">{ic("shield", "lg")}<span>AI শক্তিশালী সহকারী — যাচাই আর শেষ সিদ্ধান্তের দায়িত্ব আপনার</span></div>')
scene_html.append(clip(s, inner))
rev("#s11 .photo", SC[s]["start"] + 0.2, "x:-50,opacity:0", 0.7)
rev("#s11i0", at(s, 0, 0.3), "x:40,opacity:0", 0.4)
rev("#s11i1", at(s, 1, 0.0), "x:40,opacity:0", 0.4)
rev("#s11i2", at(s, 1, 0.1), "x:40,opacity:0", 0.4)
rev("#s11i3", at(s, 1, 0.5), "x:40,opacity:0", 0.4)
rev("#s11i4", at(s, 2, 0.05), "x:40,opacity:0", 0.4)
rev("#s11i5", at(s, 2, 0.5), "x:40,opacity:0", 0.4)
rev("#s11next", at(s, 3, 0.03), "x:60,opacity:0")
js.append(f'tl.from("#s11next .chip",{{scale:0.6,opacity:0,stagger:0.2,duration:0.3}},{at(s, 3, 0.3):.3f});')
rev("#s11key", at(s, 4, 0.03), "y:40,opacity:0")
js.append(f'tl.fromTo("#p11",{{scale:1.06}},{{scale:1,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

# ---------- chapter flashes
flash_html = []
for sc in T["scenes"][1:]:
    fs, fe = sc["start"], sc["narr_start"] - 0.15
    flash_html.append(f'<div id="f{sc["id"]}" class="clip flash" data-start="{fs:.3f}" data-duration="{fe - fs:.3f}" data-track-index="7">'
                      f'<span class="fn">{sc["num"]}</span><span class="ft">{e(sc["title"])}</span><span class="fl"></span></div>')
    js.append(f'tl.from("#f{sc["id"]} .fn",{{scale:0.6,opacity:0,duration:0.45,ease:"back.out(2)"}},{fs:.3f});')
    js.append(f'tl.from("#f{sc["id"]} .ft",{{y:30,opacity:0,duration:0.45}},{fs + 0.15:.3f});')
    js.append(f'tl.fromTo("#f{sc["id"]} .fl",{{scaleX:0}},{{scaleX:1,duration:0.6,ease:"power2.out"}},{fs + 0.2:.3f});')
    js.append(f'tl.to("#f{sc["id"]}",{{opacity:0,duration:0.3}},{fe - 0.3:.3f});')
exit_js = [f'tl.to("#{sc["id"]}",{{opacity:0,duration:0.3}},{sc["end"] - 0.3:.3f});' for sc in T["scenes"][:-1]]


# ---------- captions
def is_kw(t):
    return bool(re.search(r"[A-Za-z0-9০-৯]", t.strip("।?!,—'\"")))


cap_html, cap_js = [], []
for i, c in enumerate(T["cues"]):
    spans = " ".join(f'<span class="{"kw" if is_kw(w) else ""}">{e(w)}</span>' for w in c["text"].split())
    st, du = c["start"] - 0.05, c["end"] - c["start"] + 0.05
    cap_html.append(f'<div id="cap{i}" class="clip cap" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{10 + i % 2}"><div class="capbox">{spans}</div></div>')
    cap_js.append(f'tl.from("#cap{i} .capbox",{{opacity:0,duration:0.15}},{st:.3f});')

CSS = open(f"{HERE}/style_l2.css").read()
page = f"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<title>PILLAR 01 · Lesson 02 — AI, ML, DL & Generative AI</title>
<script src="assets/gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
  <div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"><div class="bgfill"></div><div id="grid" class="grid"></div>
    <div id="orb1" class="orb o1"></div><div id="orb2" class="orb o2"></div><div id="orb3" class="orb o3"></div></div>
  <div id="topbar" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1">
    <div class="brand"><span class="dot"></span>PILLAR 01 · AI FUNDAMENTALS<span class="pill">বাংলা</span></div>
    <div class="lesson">লেসন ০২ · AI, ML, Deep Learning ও Generative AI</div></div>
  <div id="prog" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><i id="progfill"></i></div>
  {"".join(scene_html)}
  {"".join(flash_html)}
  {"".join(cap_html)}
  <div id="endc" class="clip endc" data-start="{DUR - 2.2:.3f}" data-duration="2.2" data-track-index="9">
    <div class="brand" style="font-size:44px"><span class="dot"></span>PILLAR 01 · AI FUNDAMENTALS</div>
    <div class="sub">পরের লেসন: প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম</div></div>
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{ paused: true }});
tl.to("#orb1",{{x:220,y:120,duration:{DUR / 4:.2f},ease:"sine.inOut",yoyo:true,repeat:3}},0);
tl.to("#orb2",{{x:-200,y:-140,duration:{DUR / 4:.2f},ease:"sine.inOut",yoyo:true,repeat:3}},0);
tl.to("#orb3",{{x:160,y:-90,duration:{DUR / 6:.2f},ease:"sine.inOut",yoyo:true,repeat:5}},0);
tl.fromTo("#grid",{{x:0}},{{x:-96,duration:{DUR:.2f},ease:"none"}},0);
tl.from("#topbar",{{y:-40,opacity:0,duration:0.6}},0);
tl.fromTo("#progfill",{{scaleX:0}},{{scaleX:1,duration:{DUR:.2f},ease:"none"}},0);
{chr(10).join(js)}
{chr(10).join(exit_js)}
{chr(10).join(cap_js)}
tl.from("#endc",{{opacity:0,duration:0.5}},{DUR - 2.2:.3f});
window.__timelines["main"] = tl;
</script></body></html>"""
open(f"{P}/hf/index.html", "w").write(page)
print("wrote", len(page), "duration", DUR)

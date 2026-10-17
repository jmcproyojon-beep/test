"""HyperFrames 16:9 composition for PILLAR 01 · Lesson 01."""
import html, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l1_script import SCENES, SAMPLE_ANSWER

P = "/home/user/test/projects/pillar01-lesson01"
HERE = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
LN = {}
for L in T["lines"]:
    LN.setdefault(L["scene"], []).append(L)


def at(scene, i, frac=0.0, off=0.0):
    L = LN[scene][i]
    return round(L["start"] + (L["end"] - L["start"]) * frac + off, 3)


ICON = {
 "brain": '<svg viewBox="0 0 48 48"><path d="M18 8a7 7 0 0 0-7 7 7 7 0 0 0-3 12 7 7 0 0 0 6 11 6 6 0 0 0 10 2V10a6 6 0 0 0-6-2zM30 8a7 7 0 0 1 7 7 7 7 0 0 1 3 12 7 7 0 0 1-6 11 6 6 0 0 1-10 2"/></svg>',
 "mic": '<svg viewBox="0 0 48 48"><rect x="18" y="7" width="12" height="22" rx="6"/><path d="M12 23a12 12 0 0 0 24 0M24 35v6"/></svg>',
 "map": '<svg viewBox="0 0 48 48"><path d="M6 12l12-5 12 5 12-5v29l-12 5-12-5-12 5z"/><path d="M18 7v29M30 12v29"/></svg>',
 "mail": '<svg viewBox="0 0 48 48"><rect x="6" y="11" width="36" height="26" rx="3"/><path d="m6 13 18 13 18-13"/></svg>',
 "feed": '<svg viewBox="0 0 48 48"><rect x="8" y="6" width="32" height="36" rx="4"/><path d="M14 14h20M14 22h20M14 30h12"/></svg>',
 "calc": '<svg viewBox="0 0 48 48"><rect x="12" y="6" width="24" height="36" rx="4"/><path d="M17 13h14v7H17zM18 27h2M24 27h2M30 27h2M18 34h2M24 34h2M30 34h2"/></svg>',
 "db": '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="11" rx="15" ry="5"/><path d="M9 11v26c0 3 7 5 15 5s15-2 15-5V11M9 24c0 3 7 5 15 5s15-2 15-5"/></svg>',
 "loop": '<svg viewBox="0 0 48 48"><path d="M36 18a13 13 0 1 0 2 10"/><path d="M38 8v10H28"/></svg>',
 "cube": '<svg viewBox="0 0 48 48"><path d="M24 5 41 14v20L24 43 7 34V14z"/><path d="M7 14l17 9 17-9M24 23v20"/></svg>',
 "target": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="2"/></svg>',
 "book": '<svg viewBox="0 0 48 48"><path d="M8 9h13a5 5 0 0 1 5 5v26a4 4 0 0 0-4-4H8zM40 9H29a5 5 0 0 0-5 5"/><path d="M40 9v27H28a4 4 0 0 0-4 4"/></svg>',
 "leaf": '<svg viewBox="0 0 48 48"><path d="M10 38C10 18 22 8 40 8c0 20-12 30-30 30z"/><path d="M10 38 28 20"/></svg>',
 "heart": '<svg viewBox="0 0 48 48"><path d="M24 40S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22z"/><path d="M14 22h6l3-5 4 9 3-4h5"/></svg>',
 "shop": '<svg viewBox="0 0 48 48"><path d="M7 18 10 8h28l3 10M7 18h34v22H7z"/><path d="M19 40V28h10v12"/></svg>',
 "globe": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c5 5 7 11 7 17s-2 12-7 17c-5-5-7-11-7-17s2-12 7-17z"/></svg>',
 "pen": '<svg viewBox="0 0 48 48"><path d="M10 38l4-12L32 8l8 8-18 18z"/><path d="M28 12l8 8"/></svg>',
 "check": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><path d="m16 24 6 6 11-12"/></svg>',
 "alert": '<svg viewBox="0 0 48 48"><path d="M24 7 43 40H5z"/><path d="M24 19v10M24 34v1"/></svg>',
 "clock": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><path d="M24 14v11l7 5"/></svg>',
 "scale": '<svg viewBox="0 0 48 48"><path d="M24 8v32M12 40h24M10 14h28M10 14l-5 12h10zM38 14l-5 12h10z"/></svg>',
 "user": '<svg viewBox="0 0 48 48"><circle cx="24" cy="16" r="8"/><path d="M8 42c2-9 9-13 16-13s14 4 16 13"/></svg>',
 "lock": '<svg viewBox="0 0 48 48"><rect x="11" y="21" width="26" height="19" rx="4"/><path d="M16 21v-6a8 8 0 0 1 16 0v6"/></svg>',
 "shield": '<svg viewBox="0 0 48 48"><path d="M24 6 39 12v11c0 9-6.5 16-15 19-8.5-3-15-10-15-19V12z"/><path d="m17 24 5 5 9-10"/></svg>',
 "next": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><path d="M20 16l8 8-8 8"/></svg>',
}
MANGO = '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="27" rx="14" ry="16" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/><path d="M24 11c2-4 6-5 9-4-2 3-5 4-9 4z" fill="#34d399"/></svg>'
JACK = '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="25" rx="15" ry="18" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/><g fill="#4d7c0f">' + "".join(f'<circle cx="{x}" cy="{y}" r="1.6"/>' for x, y in [(18,16),(26,14),(31,20),(17,25),(24,23),(31,29),(19,33),(27,34)]) + '</g></svg>'


def ic(name, cls=""):
    return f'<span class="ic {cls}">{ICON[name]}</span>'


def e(t):
    return html.escape(t)


scene_html, js = [], []


def rev(sel, t, frm="y:40,opacity:0", d=0.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{d},ease:"{ease}"}},{t:.3f});')


def clip(sid, inner):
    s = SC[sid]
    return (f'<div id="{sid}" class="clip scene" data-start="{s["start"]:.3f}" data-duration="{s["end"] - s["start"]:.3f}" data-track-index="3">'
            f'<div class="chap"><span class="n">{s["num"]} / ১০</span><span class="t">{e(s["title"])}</span></div>{inner}</div>')


# ---------- s01 intro
s = "s01"
road = SCENES[0]["onscreen"][1:]
inner = (f'<div class="photo"><img id="p1" src="assets/presenter.png" alt=""/><div class="tag">AI শেখার সঙ্গী · বাংলায়</div></div>'
         f'<div class="introR"><div class="kicker">PILLAR 01 · LESSON 01</div><div class="bigt" id="s01t">Artificial Intelligence-এর পরিচিতি</div>'
         f'<div class="sub" id="s01s">শুরু থেকে শেখা — আগে কোনো টেকনিক্যাল জ্ঞান লাগবে না</div><div class="road">'
         + "".join(f'<div class="chip" id="s01r{k}"><span class="num">{k + 1:02d}</span>{e(r)}</div>' for k, r in enumerate(road)) + '</div></div>')
scene_html.append(clip(s, inner))
rev("#s01 .photo", SC[s]["start"] + 0.2, "x:-60,opacity:0", 0.8)
rev("#s01 .kicker", at(s, 0, 0, -0.3), "y:20,opacity:0", 0.5)
rev("#s01t", at(s, 0, 0.1), "y:40,opacity:0", 0.7)
rev("#s01s", at(s, 2, 0, -0.2))
for k in range(4): rev(f"#s01r{k}", at(s, 3, 0.15 + k * 0.18), "x:60,opacity:0", 0.45)
rev("#s01r4", at(s, 4, 0.2), "x:60,opacity:0", 0.45)
rev("#s01r5", at(s, 5, 0.2), "x:60,opacity:0", 0.45)
js.append(f'tl.fromTo("#p1",{{scale:1}},{{scale:1.06,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

# ---------- s02 what
s = "s02"
tiles = [("mic", "বাংলা ভয়েস টাইপিং", "কথাকে লেখায় রূপান্তর"), ("map", "Google Maps-এর রুট", "জ্যাম দেখে দ্রুত রাস্তা"),
         ("mail", "ইমেইলের স্প্যাম ফিল্টার", "ভুয়া মেসেজ আলাদা করা"), ("feed", "Facebook / YouTube ফিড", "পছন্দমতো কনটেন্ট সাজানো")]
inner = ('<div class="card" id="s02def"><div class="lbl">Artificial Intelligence</div>'
         '<div class="h">মানুষের বুদ্ধি লাগে এমন কাজ — <span class="cy">কম্পিউটারকে দিয়ে করানো</span></div>'
         '<div class="chips" id="s02ch">' + "".join(f'<span class="chip">{t}</span>' for t in ["ছবি চেনা", "কথা বোঝা", "অনুবাদ", "সিদ্ধান্তে সহায়তা"]) + '</div></div>'
         '<div class="tiles">' + "".join(f'<div class="tile" id="s02t{k}">{ic(i, "lg")}<div class="tt">{e(a)}</div><div class="ts">{e(b)}</div></div>' for k, (i, a, b) in enumerate(tiles)) + '</div>'
         f'<div class="note l" id="s02n1">{ic("target", "lg pu")}<div><b class="pu">Narrow AI:</b> আজকের AI নির্দিষ্ট কাজে দক্ষ — সব কাজে মানুষের মতো নয়</div></div>'
         f'<div class="note r" id="s02n2">{ic("brain", "lg am")}<div>AI চিন্তা বা অনুভব করে না — <b class="am">ডেটা থেকে প্যাটার্ন শেখে</b></div></div>')
scene_html.append(clip(s, inner))
rev("#s02def", at(s, 1, 0, -0.3), "y:50,opacity:0", 0.6)
js.append(f'tl.from("#s02ch .chip",{{y:20,opacity:0,stagger:0.35,duration:0.35}},{at(s, 2, 0.05):.3f});')
rev("#s02t0", at(s, 4, 0.1), "y:50,scale:0.9,opacity:0", 0.5, "back.out(1.6)")
for k, f in [(1, 0.02), (2, 0.33), (3, 0.66)]: rev(f"#s02t{k}", at(s, 5, f), "y:50,scale:0.9,opacity:0", 0.5, "back.out(1.6)")
rev("#s02n1", at(s, 6, 0.05), "x:-50,opacity:0")
rev("#s02n2", at(s, 7, 0.05), "x:50,opacity:0")

# ---------- s03 compare
s = "s03"
inner = (f'<div class="card col" id="s03L"><div class="lbl">সাধারণ সফটওয়্যার</div><div class="h">{ic("calc", "lg")} প্রোগ্রামার নিয়ম লিখে দেন</div>'
         '<div class="flow" id="s03f1"><span class="pill k">নিয়ম</span><span class="arrow">+</span><span class="pill">ইনপুট</span><span class="arrow">→</span><span class="pill">উত্তর</span></div>'
         '<div class="ex">২ + ২ = ৪ <span style="font:600 26px var(--bn);color:var(--mute)">(সবসময়)</span></div></div>'
         f'<div class="card col" id="s03R"><div class="lbl">Artificial Intelligence</div><div class="h">{ic("brain", "lg")} উদাহরণ থেকে নিজে শেখে</div>'
         f'<div class="fruits" id="s03fr">' + "".join(f'<div class="fruit">{MANGO if k % 2 == 0 else JACK}<span>{"আম" if k % 2 == 0 else "কাঁঠাল"}</span></div>' for k in range(5)) + '</div>'
         '<div class="flow" id="s03f2"><span class="pill">উদাহরণ</span><span class="arrow">+</span><span class="pill">উত্তর</span><span class="arrow">→</span><span class="pill k">শেখা নিয়ম</span></div></div>'
         '<div id="s03hard">হাতে লিখে সব নিয়ম বানানো প্রায় অসম্ভব</div>'
         f'<div class="clip" id="s03spam" style="position:absolute">{ic("mail")}<span><b class="am">স্প্যাম ফিল্টার:</b> শব্দতালিকার নিয়ম সহজে ফাঁকি খায় · লাখো ইমেইল থেকে শেখা AI নতুন স্প্যামও অনেকটা ধরে</span></div>'
         '<div class="strip" id="s03b1">সফটওয়্যার: একই ইনপুটে একই ফল</div><div class="strip" id="s03b2">AI: সম্ভাবনাভিত্তিক — ভুলও হতে পারে</div>')
scene_html[-1:] = scene_html[-1:]  # no-op
scene_html.append(clip(s, inner.replace('class="clip" id="s03spam"', 'id="s03spam"')))
rev("#s03L", at(s, 1, 0, -0.2), "x:-60,opacity:0", 0.6)
rev("#s03R .lbl, #s03R .h", at(s, 2, 0.05), "x:60,opacity:0", 0.5)
js.append(f'tl.from("#s03fr .fruit",{{scale:0.5,opacity:0,stagger:0.12,duration:0.3,ease:"back.out(2)"}},{at(s, 2, 0.4):.3f});')
rev("#s03hard", at(s, 3, 0.3), "scale:0.8,opacity:0", 0.4, "back.out(2)")
rev("#s03spam", at(s, 4, 0.05), "y:30,opacity:0")
rev("#s03f2", at(s, 5, 0.4), "x:40,opacity:0")
js.append(f'tl.to("#s03f1 .pill.k, #s03f2 .pill.k",{{scale:1.08,duration:0.35,yoyo:true,repeat:3,ease:"sine.inOut"}},{at(s, 6, 0.1):.3f});')
js.append(f'tl.to("#s03hard",{{opacity:0,duration:0.3}},{at(s, 4, 0):.3f});')
rev("#s03b1", at(s, 7, 0.05), "y:30,opacity:0")
rev("#s03b2", at(s, 7, 0.45), "y:30,opacity:0")

# ---------- s04 timeline
s = "s04"
evs = [("১৯৫০", "অ্যালান টুরিং: যন্ত্র কি চিন্তা করতে পারে? — টুরিং টেস্ট", 1, 0.05, "up"),
       ("১৯৫৬", "ডার্টমাউথ সম্মেলন: প্রথম 'Artificial Intelligence' নাম", 2, 0.05, "dn"),
       ("১৯৯৭", "IBM Deep Blue দাবায় কাসপারভকে হারায়", 4, 0.05, "up"),
       ("২০১২", "ডিপ লার্নিংয়ে ছবি চেনায় বড় অগ্রগতি", 5, 0.02, "dn"),
       ("২০১৭", "Transformer মডেল-কাঠামো — আজকের ভাষা-মডেলের ভিত্তি", 5, 0.48, "up"),
       ("২০২২", "নভেম্বর: OpenAI চালু করে ChatGPT", 6, 0.05, "dn")]
xs = [100 + k * 300 for k in range(6)]
inner = '<div class="clip" id="s04line" style="position:absolute"></div>'.replace('class="clip" ', '')
for k, (y, t, li, f, pos) in enumerate(evs):
    x = xs[k]
    inner += f'<i class="node" id="s04n{k}" style="left:{x + 132}px"></i><div class="ev {pos}" id="s04e{k}" style="left:{x}px"><div class="yr">{y}</div><div class="et">{e(t)}</div></div>'
inner += '<div id="s04wave">কয়েক দশক: কখনো আশা, কখনো হতাশা</div>'
scene_html.append(clip(s, inner))
js.append(f'tl.fromTo("#s04line",{{scaleX:0}},{{scaleX:1,duration:1.6,ease:"power2.inOut"}},{at(s, 0, 0.1):.3f});')
for k, (y, t, li, f, pos) in enumerate(evs):
    js.append(f'tl.from("#s04n{k}",{{scale:0,duration:0.35,ease:"back.out(3)"}},{at(s, li, f):.3f});')
    rev(f"#s04e{k}", at(s, li, f) + 0.1, f"y:{-30 if pos == 'up' else 30},opacity:0", 0.5)
rev("#s04wave", at(s, 3, 0.1), "opacity:0", 0.6)

# ---------- s05 flow
s = "s05"
steps = [("১", "db", "ডেটা", "লেখা · ছবি · শব্দ · সংখ্যা"), ("২", "loop", "ট্রেনিং", "বারবার দেখে, ভুল কমিয়ে শেখা"),
         ("৩", "cube", "মডেল", "শেখা প্যাটার্ন — সংখ্যার আকারে"), ("৪", "target", "প্রেডিকশন", "নতুন ইনপুটে সম্ভাব্য উত্তর")]
inner = '<div class="steps">'
for k, (n, i, t, sub) in enumerate(steps):
    extra = '<div class="meter"><i id="s05m"></i></div>' if k == 1 else ''
    inner += f'<div class="step" id="s05s{k}"><span class="sn">ধাপ {n}</span>{ic(i)}<div class="st">{t}</div><div class="ss">{e(sub)}</div>{extra}</div>'
    if k < 3: inner += f'<div class="sarr" id="s05a{k}">→</div>'
inner += '</div>'
inner += f'<div id="s05lab">{ic("check", "gr")} লেবেল করা ডেটা: ছবি + সঠিক উত্তর (আম / কাঁঠাল)</div>'
bars = [("ঢাকা", 0.92), ("শহর", 0.03), ("চট্টগ্রাম", 0.02), ("কোথায়", 0.01)]
inner += ('<div class="card" id="s05llm"><div class="lbl">ভাষা-মডেল · পরের শব্দ (টোকেন) অনুমান</div>'
          '<div class="sent" id="s05sent">বাংলাদেশের রাজধানী <span class="blank" id="s05bl"></span></div><div class="bars" id="s05bars">'
          + "".join(f'<span class="w">{w}</span><span class="b"><i id="s05b{k}" style="width:{int(v * 100)}%"></i></span><span class="v">{int(round(v * 100))}%</span>' for k, (w, v) in enumerate(bars))
          + '</div><div class="ex2">উদাহরণ — সংখ্যাগুলো কাল্পনিক</div></div>'
          f'<div id="s05ver">{ic("alert", "am")} স্বাভাবিক শোনালেই সঠিক নয় — <b class="am">যাচাই করুন</b></div>')
scene_html.append(clip(s, inner))
rev("#s05s0", at(s, 1, 0.02), "y:40,opacity:0")
rev("#s05lab", at(s, 2, 0.1), "y:20,opacity:0")
rev("#s05a0", at(s, 3, 0.0), "x:-20,opacity:0", 0.3)
rev("#s05s1", at(s, 3, 0.02), "y:40,opacity:0")
js.append(f'tl.fromTo("#s05m",{{scaleX:1}},{{scaleX:0.15,duration:{max(1.5, at(s, 3, 0.9) - at(s, 3, 0.2)):.2f},ease:"power2.inOut"}},{at(s, 3, 0.2):.3f});')
rev("#s05a1", at(s, 4, 0.0), "x:-20,opacity:0", 0.3)
rev("#s05s2", at(s, 4, 0.02), "y:40,opacity:0")
rev("#s05a2", at(s, 5, 0.0), "x:-20,opacity:0", 0.3)
rev("#s05s3", at(s, 5, 0.02), "y:40,opacity:0")
js.append(f'tl.to("#s05lab",{{opacity:0,duration:0.3}},{at(s, 6, 0, -0.4):.3f});')
rev("#s05llm", at(s, 6, 0.05), "y:50,opacity:0")
js.append(f'tl.from("#s05bars",{{opacity:0,duration:0.4}},{at(s, 7, 0.25):.3f});')
for k in range(4): js.append(f'tl.fromTo("#s05b{k}",{{scaleX:0}},{{scaleX:1,duration:0.8,ease:"power2.out"}},{at(s, 7, 0.28) + k * 0.15:.3f});')
js.append(f'tl.to("#s05bl",{{borderBottomColor:"rgba(34,227,255,0)",duration:0.2}},{at(s, 7, 0.45):.3f});')
inner_add = ''
rev("#s05ver", at(s, 8, 0.05), "x:60,opacity:0")

# ---------- s06 apps
s = "s06"
apps = [("book", "শিক্ষা", "কঠিন বিষয় সহজে বোঝা, প্র্যাকটিস প্রশ্ন, ইংরেজি লেখা ঠিক করা", 1),
        ("leaf", "কৃষি", "পাতার ছবি দেখে ফসলের রোগ শনাক্তের মতো অ্যাপ", 2),
        ("heart", "স্বাস্থ্যসেবা", "এক্স-রে/মেডিক্যাল ছবি বিশ্লেষণে চিকিৎসকের সহায়ক — সিদ্ধান্ত চিকিৎসকের", 3),
        ("shop", "ব্যবসা", "কাস্টমারের সাধারণ প্রশ্ন, পণ্যের বিবরণ, বিক্রির তথ্য বিশ্লেষণ", 4),
        ("globe", "যোগাযোগ ও যাতায়াত", "বাংলা↔ইংরেজি অনুবাদ, ট্রাফিক দেখে সময়ের হিসাব", 5),
        ("pen", "ফ্রিল্যান্সিং ও কনটেন্ট", "আইডিয়া, লেখার খসড়া, অনুবাদ, ভিডিও স্ক্রিপ্ট", 6)]
inner = '<div class="appgrid">' + "".join(f'<div class="app" id="s06a{k}">{ic(i, "lg")}<div class="at">{t}</div><div class="as">{e(d)}</div></div>' for k, (i, t, d, li) in enumerate(apps)) + '</div>'
scene_html.append(clip(s, inner))
for k, (i, t, d, li) in enumerate(apps):
    rev(f"#s06a{k}", at(s, li, 0.02), "y:60,rotationX:-30,opacity:0", 0.6)

# ---------- s07 limits
s = "s07"
oks = ["লেখা তৈরি ও সংক্ষেপ", "অনুবাদ", "প্রশ্নের ব্যাখ্যা", "আইডিয়া দেওয়া", "তথ্যে প্যাটার্ন খোঁজা"]
lims = [("alert", "হ্যালুসিনেশন", "আত্মবিশ্বাসী ভুল: ভুল সংখ্যা, তারিখ, অস্তিত্বহীন সূত্র", 3),
        ("clock", "জ্ঞানের সময়সীমা", "সাম্প্রতিক খবর না-ও জানতে পারে (ওয়েব সার্চ ছাড়া)", 4),
        ("scale", "পক্ষপাত (Bias)", "ডেটার পক্ষপাত উত্তরে আসতে পারে", 5),
        ("user", "বিশেষজ্ঞের বিকল্প নয়", "আইন, স্বাস্থ্য, অর্থ — সিদ্ধান্তের আগে বিশেষজ্ঞ", 6),
        ("lock", "ব্যক্তিগত তথ্য দেবেন না", "পাসওয়ার্ড, NID নম্বর, ব্যাংকের তথ্য", 7)]
inner = ('<div class="card" id="s07ok"><div class="lbl gr">AI ভালো পারে</div><div class="oklist">' + "".join(f'<div>{ic("check", "gr")}{t}</div>' for t in oks) + '</div></div>'
         f'<div id="s07ban" style="position:absolute">{ic("shield", "lg")}<span>AI আপনার সহকারী — চূড়ান্ত সিদ্ধান্ত ও দায়িত্ব আপনার</span></div>'
         '<div class="card" id="s07lim"><div class="lbl am" id="s07lh">সীমাবদ্ধতা</div>' + "".join(f'<div class="lrow" id="s07l{k}">{ic(i, "am")}<div><div class="lt">{t}</div><div class="ls">{e(d)}</div></div></div>' for k, (i, t, d, li) in enumerate(lims)) + '</div>')
scene_html.append(clip(s, inner))
rev("#s07ok", at(s, 1, 0, -0.2), "x:-50,opacity:0")
js.append(f'tl.from("#s07ok .oklist div",{{x:-30,opacity:0,stagger:{max(0.3, (at(s, 1, 0.9) - at(s, 1, 0.1)) / 5):.2f},duration:0.35}},{at(s, 1, 0.1):.3f});')
rev("#s07lim", at(s, 2, 0, -0.2), "x:50,opacity:0")
for k, (i, t, d, li) in enumerate(lims): rev(f"#s07l{k}", at(s, li, 0.03), "x:60,opacity:0", 0.45)
rev("#s07ban", at(s, 8, 0.03), "y:40,opacity:0")

# ---------- s08 demo
s = "s08"
dsteps = [("chatgpt.com বা অফিশিয়াল অ্যাপ খুলুন", 2), ("প্রয়োজনে সাইন আপ / লগইন", 3), ("মেসেজ বক্সে প্রম্পট লিখুন", 4),
          ("Enter বা পাঠানোর বাটন", 7), ("একই চ্যাটে ফলো-আপ", 9), ("তথ্য যাচাই করুন", 10)]
prompt = SCENES[7]["lines"][5]
pw = prompt.split()
def pcls(i, w):
    seg = [("tagr", 0, 3), ("tagl", 3, 6), ("tagn", 6, 8), ("tage", len(pw) - 3, len(pw))]
    for c, a, b in seg:
        if a <= i < b: return c
    return ""
ptxt = " ".join(f'<span class="w {pcls(i, w)}" id="s08w{i}">{e(w)}</span>' for i, w in enumerate(pw))
inner = ('<div class="dsteps">' + "".join(f'<div class="ds" id="s08d{k}"><span class="dn">{k + 1}</span><span>{e(t)}</span></div>' for k, (t, li) in enumerate(dsteps)) + '</div>'
         f'<div id="s08def"><b class="pu">প্রম্পট</b> = AI-কে দেওয়া আপনার নির্দেশনা বা প্রশ্ন</div>'
         '<div class="browser"><div class="bar"><i style="background:#fb7185"></i><i style="background:#fbbf24"></i><i style="background:#34d399"></i>'
         '<div class="addr">chatgpt.com</div><div class="illus">প্রতীকী ডেমো — আসল স্ক্রিন রেকর্ডিং নয়</div></div>'
         f'<div class="chat"><div class="ub" id="s08ub">{e(prompt)}</div>'
         '<div class="ab" id="s08ab"><span class="samp">নমুনা উত্তর — উদাহরণ মাত্র, আসল উত্তর ভিন্ন হতে পারে</span>' + " ".join(e(x) for x in SAMPLE_ANSWER) + '</div>'
         '<div class="fu" id="s08fu">উদাহরণগুলো একটি টেবিল আকারে দিন</div>'
         f'<div id="s08chk">' + "".join(f'<span class="chip">{ic("check", "gr")}{t}</span>' for t in ["প্রশ্নের সাথে মিলছে?", "ভাষা সহজ?", "উদাহরণ বাস্তব?"]) + '</div>'
         f'<div id="s08ver">✓ তথ্য যাচাই করুন</div>'
         f'</div><div class="inp" id="s08inp"><span class="ptxt">{ptxt}</span><i class="send" id="s08send"></i></div></div>'
         '<div id="s08tags"><span class="chip tagr">আমি কে</span><span class="chip tagl">কোন ভাষায়</span><span class="chip tagn">কত লম্বা</span><span class="chip tage">কী উদাহরণ</span></div>'
         f'<div id="s08priv">🔒 ব্যক্তিগত তথ্য, পাসওয়ার্ড বা গোপন অফিস-ডকুমেন্ট চ্যাটে পেস্ট করবেন না</div>')
scene_html.append(clip(s, inner))
rev("#s08 .browser", SC[s]["start"] + 0.3, "x:80,opacity:0", 0.7)
rev("#s08def", at(s, 1, 0.05), "y:20,opacity:0")
for k, (t, li) in enumerate(dsteps):
    rev(f"#s08d{k}", at(s, li, 0, -0.1), "x:-40,opacity:0", 0.4)
    js.append(f'tl.call(()=>{{}},[],0);')
    js.append(f'tl.to("#s08d{k}",{{backgroundColor:"rgba(34,227,255,0.14)",borderColor:"rgba(34,227,255,0.75)",duration:0.3}},{at(s, li, 0):.3f});')
    nxt = dsteps[k + 1][1] if k + 1 < len(dsteps) else None
    if nxt is not None:
        js.append(f'tl.to("#s08d{k}",{{backgroundColor:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.12)",duration:0.3}},{at(s, nxt, 0, -0.05):.3f});')
js.append(f'tl.to("#s08def",{{opacity:0,duration:0.3}},{at(s, 4, 0):.3f});')
st, en = at(s, 5, 0.02), at(s, 5, 0.97)
for i in range(len(pw)):
    js.append(f'tl.to("#s08w{i}",{{opacity:1,duration:0.08}},{st + (en - st) * i / len(pw):.3f});')
js.append(f'tl.fromTo("#s08inp",{{scale:1}},{{scale:1.03,duration:0.4,ease:"power2.out"}},{st:.3f});')
js.append(f'tl.to("#s08inp",{{scale:1,duration:0.4}},{en:.3f});')
rev("#s08tags", at(s, 6, 0.1), "y:20,opacity:0")
js.append(f'tl.to("#s08tags",{{opacity:0,duration:0.3}},{at(s, 7, 0.0):.3f});')
js.append(f'tl.to("#s08send",{{scale:0.7,duration:0.12,yoyo:true,repeat:1}},{at(s, 7, 0.08):.3f});')
js.append(f'tl.to("#s08inp .ptxt",{{opacity:0,duration:0.2}},{at(s, 7, 0.12):.3f});')
rev("#s08ub", at(s, 7, 0.14), "y:30,opacity:0", 0.4)
rev("#s08ab", at(s, 7, 0.55), "y:30,opacity:0", 0.6)
rev("#s08chk", at(s, 8, 0.05), "x:40,opacity:0", 0.5)
js.append(f'tl.to("#s08chk",{{opacity:0,duration:0.3}},{at(s, 9, 0.0):.3f});')
rev("#s08fu", at(s, 9, 0.35), "y:20,opacity:0", 0.4)
rev("#s08ver", at(s, 10, 0.05), "scale:0.7,opacity:0", 0.4, "back.out(2)")
rev("#s08priv", at(s, 11, 0.02), "y:30,opacity:0", 0.45)

# ---------- s09 assignment
s = "s09"
inner = ('<div class="ws"><div class="lbl" style="margin-bottom:14px">ওয়ার্কশিট · ৫টি দরকারি AI অ্যাপ্লিকেশন</div><div class="wsh" id="s09h"><div>#</div><div>টুল / অ্যাপের নাম</div><div>কী কাজ করে</div><div>আমি কীভাবে ব্যবহার করব</div><div>সীমাবদ্ধতা / ঝুঁকি</div></div>'
         + "".join(f'<div class="wsr" id="s09r{k}"><div>{k + 1}</div><div></div><div></div><div></div><div></div></div>' for k in range(5)) + '</div>'
         f'<div class="card" id="s09note"><div class="h" style="font-size:32px">{ic("brain", "am")} ChatGPT আইডিয়া দিতে পারে</div><div class="p am">কিন্তু প্রতিটি তথ্য যাচাই আপনার দায়িত্ব</div></div>'
         '<div class="card" id="s09chk"><div class="lbl gr">জমার আগে নিজেকে প্রশ্ন</div>'
         + "".join(f'<div class="ck" id="s09c{k}"><i class="box"></i><span>{t}</span></div>' for k, t in enumerate(["৫টি আলাদা আলাদা কাজের?", "আমার জীবনের সাথে সম্পর্কিত?", "প্রতিটির অন্তত একটি সীমাবদ্ধতা লিখেছি?"])) + '</div>')
scene_html.append(clip(s, inner))
rev("#s09 .ws", at(s, 1, 0, -0.2), "y:40,opacity:0")
rev("#s09h", at(s, 2, 0.02), "y:20,opacity:0", 0.4)
for k in range(5): rev(f"#s09r{k}", at(s, 2, 0.15 + k * 0.12), "x:-30,opacity:0", 0.35)
rev("#s09note", at(s, 3, 0.05), "rotation:-8,scale:0.8,opacity:0", 0.5, "back.out(1.8)")
rev("#s09chk", at(s, 4, 0.02), "y:40,opacity:0")
for k, f in enumerate([0.25, 0.5, 0.75]): rev(f"#s09c{k}", at(s, 4, f), "x:30,opacity:0", 0.35)

# ---------- s10 recap
s = "s10"
items = ["AI কী", "সাধারণ সফটওয়্যার বনাম AI", "AI-এর ইতিহাস", "AI কীভাবে ডেটা থেকে শেখে", "বাস্তব ব্যবহার · সক্ষমতা · সীমাবদ্ধতা", "প্রথম ChatGPT প্রম্পট"]
inner = (f'<div class="photo sm"><img id="p10" src="assets/presenter.png" alt=""/><div class="tag">দেখা হবে পরের লেসনে!</div></div>'
         '<div class="rlist">' + "".join(f'<div class="rl" id="s10i{k}">{ic("check", "gr")}{e(t)}</div>' for k, t in enumerate(items)) + '</div>'
         f'<div class="card" id="s10next"><div class="lbl pu">পরের লেসন · ০২</div><div class="h">{ic("next", "lg pu")}</div>'
         '<div class="h" style="font-size:38px">Machine Learning<br/>Deep Learning<br/>Generative AI</div><div class="p" style="font-size:25px;color:var(--mute)">এগুলো কী, আর এদের সম্পর্ক কোথায়</div></div>'
         f'<div id="s10key" style="position:absolute">{ic("shield", "lg")}<span>AI শক্তিশালী সহকারী — প্রশ্ন করুন, যাচাই করুন, দায়িত্ব নিয়ে ব্যবহার করুন</span></div>')
scene_html.append(clip(s, inner))
rev("#s10 .photo", SC[s]["start"] + 0.2, "x:-50,opacity:0", 0.7)
for k in range(5): rev(f"#s10i{k}", at(s, 0, 0.08 + k * 0.17), "x:40,opacity:0", 0.4)
rev("#s10i5", at(s, 1, 0.05), "x:40,opacity:0", 0.4)
rev("#s10key", at(s, 2, 0.03), "y:40,opacity:0")
rev("#s10next", at(s, 3, 0.03), "x:60,opacity:0")

# ---------- chapter flashes (before each scene's narration, scenes 2..10)
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
    core = t.strip("।?!,—'\"")
    return bool(re.search(r"[A-Za-z0-9০-৯]", core))
cap_html, cap_js = [], []
for i, c in enumerate(T["cues"]):
    spans = " ".join(f'<span class="{"kw" if is_kw(w) else ""}">{e(w)}</span>' for w in c["text"].split())
    st, du = c["start"] - 0.05, c["end"] - c["start"] + 0.05
    cap_html.append(f'<div id="cap{i}" class="clip cap" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{10 + i % 2}"><div class="capbox">{spans}</div></div>')
    cap_js.append(f'tl.from("#cap{i} .capbox",{{opacity:0,duration:0.15}},{st:.3f});')

CSS = open(f"{HERE}/style_l1.css").read()
page = f"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<title>PILLAR 01 · Lesson 01 — Introduction to AI</title>
<script src="assets/gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
  <div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"><div class="bgfill"></div><div id="grid" class="grid"></div>
    <div id="orb1" class="orb o1"></div><div id="orb2" class="orb o2"></div><div id="orb3" class="orb o3"></div></div>
  <div id="topbar" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1">
    <div class="brand"><span class="dot"></span>PILLAR 01 · AI FUNDAMENTALS<span class="pill">বাংলা</span></div>
    <div class="lesson">লেসন ০১ · Artificial Intelligence-এর পরিচিতি</div></div>
  <div id="prog" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><i id="progfill"></i></div>
  {"".join(scene_html)}
  {"".join(flash_html)}
  {"".join(cap_html)}
  <div id="endc" class="clip endc" data-start="{DUR - 2.2:.3f}" data-duration="2.2" data-track-index="9">
    <div class="brand" style="font-size:44px"><span class="dot"></span>PILLAR 01 · AI FUNDAMENTALS</div>
    <div class="sub">পরের লেসন: AI, Machine Learning, Deep Learning ও Generative AI</div></div>
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

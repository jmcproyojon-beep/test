"""HyperFrames 16:9 composition for PILLAR 01 · Lesson 03 (warm-studio theme)."""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from l3_script import SCENES, PROMPT

P = "/home/user/test/projects/pillar01-lesson03"
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
LN = {}
for L in T["lines"]:
    LN.setdefault(L["scene"], []).append(L)

_src = open(f"{HERE}/../l2/build_l2.py").read()
exec(_src[_src.index("_src = open"):_src.index("\n\n\ndef at(")])  # ICON set from Lessons 01-02
ICON.update({
 "lock2": ICON["lock"],
 "dollar": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><path d="M29 17c-1-2-3-3-5-3-3 0-5 2-5 4 0 6 11 3 11 10 0 2-2 4-5 4-3 0-5-1-6-3M24 10v4M24 32v6"/></svg>',
 "free": '<svg viewBox="0 0 48 48"><rect x="8" y="14" width="32" height="24" rx="4"/><path d="M8 22h32M16 30h6"/></svg>',
 "crown": '<svg viewBox="0 0 48 48"><path d="M8 36 6 14l11 9 7-13 7 13 11-9-2 22z"/><path d="M8 40h32"/></svg>',
 "warn": ICON["alert"],
})


def at(scene, i, frac=0.0, off=0.0):
    L = LN[scene][i]
    return round(L["start"] + (L["end"] - L["start"]) * frac + off, 3)


def ic(name, cls=""):
    return f'<span class="ic {cls}">{ICON[name]}</span>'


def e(t):
    return html.escape(t)


scene_html, js, media_html = [], [], []
NSC = len(SCENES)
BN = "০১২৩৪৫৬৭৮৯"


def bn(n):
    return "".join(BN[int(c)] for c in str(n))


def rev(sel, t, frm="y:40,opacity:0", d=0.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{d},ease:"{ease}"}},{t:.3f});')


def hide(sel, t, d=0.3):
    js.append(f'tl.to("{sel}",{{opacity:0,duration:{d}}},{t:.3f});')


def clip(sid, inner):
    s = SC[sid]
    return (f'<div id="{sid}" class="clip scene" data-start="{s["start"]:.3f}" data-duration="{s["end"] - s["start"]:.3f}" data-track-index="3">'
            f'<div class="chap"><span class="n">{s["num"]} / {bn(NSC)}</span><span class="t">{e(s["title"])}</span></div>{inner}</div>')


def talk(sid, left, top, w, h, track):
    """Lip-synced presenter clip as a direct stage child over the photo card (if rendered)."""
    f = f"assets/talk_{sid}.mp4"
    if not os.path.exists(f"{P}/hf/{f}"):
        return False
    s = SC[sid]
    st, du = s["narr_start"], s["narr_end"] - s["narr_start"]
    media_html.append(f'<video id="v{sid}" class="clip talkv" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{track}" src="{f}" muted playsinline '
                      f'style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"></video>')
    js.append(f'tl.from("#v{sid}",{{opacity:0,duration:0.4}},{st:.3f});')
    js.append(f'tl.to("#v{sid}",{{opacity:0,duration:0.3}},{st + du - 0.3:.3f});')
    js.append(f'tl.set("#v{sid}",{{opacity:0}},{st + du:.3f});')
    return True


LIPSYNC = []

# ---------- s01 intro
s = "s01"
road = SCENES[0]["onscreen"][1:]
lip = talk(s, 83, 239, 554, 604, 8)
if lip: LIPSYNC.append(s)
inner = (f'<div class="photo"><img id="p1" src="assets/presenter.jpg" alt=""/><div class="tag">AI শেখার সঙ্গী · বাংলায়</div>'
         + ('<div class="lipbadge">AI লিপ-সিঙ্ক</div>' if lip else '') + '</div>'
         f'<div class="introR"><div class="kicker">PILLAR 01 · LESSON 03</div><div class="bigt" id="s01t">প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম</div>'
         f'<div class="sub" id="s01s">কোন কাজে কোন টুল — আর কীভাবে সঠিকটি বেছে নেবেন</div><div class="road">'
         + "".join(f'<div class="chip" id="s01r{k}"><span class="num">{k + 1:02d}</span>{e(r)}</div>' for k, r in enumerate(road)) + '</div></div>')
scene_html.append(clip(s, inner))
rev("#s01 .photo", SC[s]["start"] + 0.2, "x:-60,opacity:0", 0.8)
rev("#s01 .kicker", at(s, 0, 0, -0.3), "y:20,opacity:0", 0.5)
rev("#s01t", at(s, 0, 0.1), "y:40,opacity:0", 0.7)
rev("#s01s", at(s, 2, 0.1))
rev("#s01r0", at(s, 3, 0.05), "x:60,opacity:0", 0.45)
rev("#s01r1", at(s, 3, 0.35), "x:60,opacity:0", 0.45)
rev("#s01r2", at(s, 3, 0.8), "x:60,opacity:0", 0.45)
rev("#s01r3", at(s, 2, 0.55), "x:60,opacity:0", 0.45)
rev("#s01r4", at(s, 4, 0.1), "x:60,opacity:0", 0.45)
rev("#s01r5", at(s, 4, 0.6), "x:60,opacity:0", 0.45)
js.append(f'tl.fromTo("#p1",{{scale:1}},{{scale:1.06,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

# ---------- s02 families
s = "s02"
fams = [("doc", "লেখা", "ইমেইল, পোস্ট, অনুবাদ"), ("image", "ছবি", "বর্ণনা থেকে ছবি, এডিটিং"), ("video", "ভিডিও", "ক্লিপ তৈরি, অটো সাবটাইটেল"),
        ("audio", "অডিও", "কণ্ঠ, ট্রান্সক্রিপশন, মিউজিক"), ("code", "কোডিং", "কোড লেখা ও ব্যাখ্যা"), ("search", "গবেষণা", "উৎসসহ উত্তর, রিপোর্ট")]
inner = ('<div class="fam">' + "".join(f'<div class="tile" id="s02t{k}">{ic(i, "lg")}<div><div class="tt">{t}</div><div class="ts">{e(d)}</div></div></div>' for k, (i, t, d) in enumerate(fams)) + '</div>'
         f'<div class="clip" id="s02fl" style="position:absolute">{ic("user")} ফ্রিল্যান্সার: লেখার AI → প্রপোজাল · ছবির AI → থাম্বনেইল · অডিওর AI → ভয়েসওভার</div>'.replace('class="clip" ', '')
         + f'<div class="ribbon" id="s02rb">{ic("alert", "am")}<span><b class="am">টুলের নাম, ফিচার ও দাম দ্রুত বদলায়</b> — এখানে নামগুলো উদাহরণ মাত্র · ব্যবহারের আগে অফিশিয়াল ওয়েবসাইটে মিলিয়ে নিন</span></div>')
scene_html.append(clip(s, inner))
for k in range(6): rev(f"#s02t{k}", at(s, 1, 0.03 + k * 0.155), "rotationY:80,opacity:0", 0.5)
js.append(f'tl.to("#s02t0, #s02t1",{{borderColor:"rgba(255,162,76,.9)",duration:0.3,yoyo:true,repeat:1}},{at(s, 2, 0.3):.3f});')
rev("#s02fl", at(s, 3, 0.03), "y:30,opacity:0")
hide("#s02fl", at(s, 4, 0, -0.1))
rev("#s02rb", at(s, 4, 0.1), "y:40,opacity:0")

# ---------- s03 text & research
s = "s03"
inner = (f'<div class="card half l" id="s03L"><div class="lbl">লেখার AI</div><div class="h">{ic("doc", "lg")} লেখা, অনুবাদ, সারসংক্ষেপ</div>'
         '<div class="uses">' + "".join(f'<span class="chip" id="s03u{k}">{t}</span>' for k, t in enumerate(["ইমেইল", "গিগের বর্ণনা", "ফেসবুক পোস্ট", "অনুবাদ", "সারসংক্ষেপ"])) + '</div>'
         '<div class="names" id="s03n1"><span>ChatGPT</span><span>Gemini</span><span>Claude</span></div>'
         f'<div class="lim" id="s03ed">✎ নিজের ভাষায় সম্পাদনা করুন — হুবহু কপি নয়</div></div>'
         f'<div class="card half r" id="s03R"><div class="lbl">গবেষণার AI</div><div class="h">{ic("search", "lg")} উৎসসহ উত্তর</div>'
         f'<div class="rsrow" id="s03r0"><b>Perplexity</b><span>ওয়েব খুঁজে উৎসের লিংকসহ উত্তর</span></div>'
         f'<div class="rsrow" id="s03r1"><b>NotebookLM</b><span>আপনার আপলোড করা ডকুমেন্ট থেকে উত্তর</span></div>'
         f'<div class="rsrow" id="s03r2"><b>Deep Research</b><span>অনেক ওয়েবপেজ পড়ে রিপোর্ট (বিভিন্ন অ্যাসিস্ট্যান্টে)</span></div></div>'
         f'<div class="foot am" id="s03ft">{ic("check", "am")} উৎস দেখানো মানেই নির্ভুল নয় — লিংক খুলে নিজে মিলিয়ে নিন</div>')
scene_html.append(clip(s, inner))
rev("#s03L", at(s, 0, 0.1), "x:-60,opacity:0")
for k in range(5): rev(f"#s03u{k}", at(s, 1, 0.02 + k * 0.12), "scale:0.6,opacity:0", 0.35, "back.out(2)")
rev("#s03n1", at(s, 1, 0.7), "y:20,opacity:0", 0.45)
rev("#s03ed", at(s, 2, 0.05), "x:-20,opacity:0", 0.4)
rev("#s03R", at(s, 3, 0.02), "x:60,opacity:0")
rev("#s03r0", at(s, 4, 0.02), "x:40,opacity:0", 0.4)
rev("#s03r1", at(s, 4, 0.45), "x:40,opacity:0", 0.4)
rev("#s03r2", at(s, 5, 0.05), "x:40,opacity:0", 0.4)
rev("#s03ft", at(s, 6, 0.05), "y:30,opacity:0")

# ---------- s04 image & video
s = "s04"
pw = "সবুজ ধানক্ষেতে সূর্যাস্ত, জলরং স্টাইল".split()
TH = ["linear-gradient(160deg,#fb923c,#fde047 45%,#16a34a 46%,#065f46)", "linear-gradient(170deg,#f97316,#fbbf24 40%,#4ade80 41%,#166534)",
      "radial-gradient(circle at 70% 35%,#fde68a 0 12%,#fb923c 13% 40%,#15803d 41%)", "linear-gradient(150deg,#f472b6,#fdba74 42%,#22c55e 43%,#14532d)"]
FS = ["#7c2d12", "#9a3412", "#134e4a", "#3f6212", "#78350f", "#1e3a8a", "#7c2d12", "#14532d", "#9a3412", "#134e4a", "#78350f", "#3f6212"]
inner = (f'<div class="card half l" id="s04L"><div class="lbl">ছবির AI</div><div class="h">{ic("image", "lg")} বর্ণনা থেকে ছবি</div>'
         '<div class="pbar">' + " ".join(f'<span class="w" id="s04w{i}">{e(w)}</span>' for i, w in enumerate(pw)) + '</div>'
         '<div class="thumbs" id="s04th">' + "".join(f'<i style="background:{g}"></i>' for g in TH) + '</div>'
         '<div class="names" id="s04n1"><span>ChatGPT</span><span>Gemini</span><span>Canva AI</span><span>Adobe Firefly</span></div>'
         '<div class="illus2">প্রতীকী চিত্র</div></div>'
         f'<div class="card half r" id="s04R"><div class="lbl">ভিডিওর AI</div><div class="h">{ic("video", "lg")} তৈরি ও এডিটিং</div>'
         '<div class="film"><div class="strip" id="s04fs">' + "".join(f'<i style="background:linear-gradient(135deg,{c},#0e0b09)"></i>' for c in FS) + '</div><i class="play"></i></div>'
         '<div class="names" id="s04n2"><span>Google Veo</span><span>Runway</span></div>'
         '<div class="names" id="s04n3"><span>CapCut · অটো সাবটাইটেল</span></div>'
         '<div class="lim" id="s04lim">ভিডিও জেনারেশন সাধারণত সীমিত বা পেইড</div></div>'
         f'<div class="foot rd" id="s04ft">{ic("alert", "rd")} বাস্তবের মতো AI ছবি/ভিডিও দিয়ে কাউকে হেয় বা ভুয়া খবর নয় · প্ল্যাটফর্মের AI লেবেল ব্যবহার করুন</div>')
scene_html.append(clip(s, inner))
rev("#s04L", at(s, 0, 0, -0.2), "x:-60,opacity:0")
st, en = at(s, 0, 0.45), at(s, 0, 0.95)
for i in range(len(pw)): js.append(f'tl.to("#s04w{i}",{{opacity:1,duration:0.1}},{st + (en - st) * i / len(pw):.3f});')
js.append(f'tl.from("#s04th i",{{filter:"blur(18px)",opacity:0,stagger:0.18,duration:0.6}},{en:.3f});')
rev("#s04n1", at(s, 1, 0.1), "y:20,opacity:0", 0.45)
rev("#s04R", at(s, 2, 0.02), "x:60,opacity:0")
js.append(f'tl.fromTo("#s04fs",{{x:0}},{{x:-900,duration:{max(4, at(s, 4, 1) - at(s, 2, 0.1)):.2f},ease:"none"}},{at(s, 2, 0.1):.3f});')
rev("#s04n2", at(s, 2, 0.6), "y:20,opacity:0", 0.45)
rev("#s04n3", at(s, 3, 0.2), "y:20,opacity:0", 0.45)
rev("#s04lim", at(s, 4, 0.1), "x:30,opacity:0", 0.45)
rev("#s04ft", at(s, 5, 0.05), "y:30,opacity:0")

# ---------- s05 audio & code
s = "s05"
heights = [22, 48, 70, 40, 86, 60, 30, 74, 52, 88, 44, 66, 28, 80, 56, 36, 72, 50, 24, 64, 84, 42, 58, 34, 76, 46, 62, 30]
inner = (f'<div class="card half l" id="s05L"><div class="lbl">অডিওর AI</div><div class="h">{ic("audio", "lg")} কণ্ঠ, লেখা, নয়েজ, মিউজিক</div>'
         '<div class="wave" id="s05wv">' + "".join(f'<i style="height:{h}px"></i>' for h in heights) + '</div>'
         '<div class="arow">' + "".join(f'<span class="chip" id="s05a{k}">{t}</span>' for k, t in enumerate(["লেখা → কণ্ঠ", "কথা → লেখা", "নয়েজ দূর", "মিউজিক"])) + '</div>'
         '<div class="names" id="s05n1"><span>ElevenLabs</span><span>Adobe Podcast</span><span>Suno</span></div></div>'
         f'<div class="card half r" id="s05R"><div class="lbl">কোডিংয়ের AI</div><div class="h">{ic("code", "lg")} প্রোগ্রামারের সহকারী</div>'
         '<div class="code"><div><span class="k">def</span> greet(name):</div><div>&nbsp;&nbsp;&nbsp;&nbsp;<span id="s05gh" class="ghost">return <span class="s">f"স্বাগতম, {name}!"</span></span><span class="tabk" id="s05tab">Tab</span></div></div>'
         '<div class="names" id="s05n2"><span>GitHub Copilot</span><span>Cursor</span><span>Claude Code</span><span>ChatGPT</span></div>'
         '<div class="lim" id="s05lim">না বুঝে কপি নয় — প্রতিটি লাইন কী করে, জিজ্ঞেস করে শিখুন</div></div>'
         f'<div class="foot rd" id="s05ft">{ic("lock", "rd")} অনুমতি ছাড়া কারো কণ্ঠ ক্লোন করবেন না — প্রতারণা ও আইনি ঝুঁকি</div>')
scene_html.append(clip(s, inner))
rev("#s05L", at(s, 0, 0, -0.2), "x:-60,opacity:0")
js.append(f'tl.from("#s05wv i",{{scaleY:0.1,stagger:0.03,duration:0.4,ease:"power2.out"}},{at(s, 0, 0.1):.3f});')
js.append(f'tl.to("#s05wv i",{{scaleY:0.5,duration:0.35,yoyo:true,repeat:7,stagger:{{each:0.04,from:"center"}},ease:"sine.inOut"}},{at(s, 0, 0.4):.3f});')
for k, f in enumerate([0.08, 0.3, 0.52, 0.75]): rev(f"#s05a{k}", at(s, 0, f), "scale:0.6,opacity:0", 0.35, "back.out(2)")
rev("#s05n1", at(s, 1, 0.1), "y:20,opacity:0", 0.45)
rev("#s05ft", at(s, 2, 0.05), "y:30,opacity:0")
hide("#s05ft", at(s, 3, 0, -0.1))
rev("#s05R", at(s, 3, 0.0), "x:60,opacity:0")
js.append(f'tl.to("#s05gh",{{color:"#e7d9c8",duration:0.2}},{at(s, 3, 0.4):.3f});')
js.append(f'tl.to("#s05tab",{{scale:0.85,duration:0.1,yoyo:true,repeat:1}},{at(s, 3, 0.38):.3f});')
rev("#s05n2", at(s, 3, 0.15), "y:20,opacity:0", 0.45)
rev("#s05lim", at(s, 4, 0.05), "x:30,opacity:0", 0.45)


# ---------- s06–s08 assistant profiles
def profile(s, letter, grad, name, maker, access, extra_meta, tag, caps, cap_li, use_title, use_text, use_li, lim_text, lim_li, deco):
    inner = (f'<div class="card prof" id="{s}P"><div class="glyph" style="background:{grad}">{letter}</div><div class="pname">{name}</div>'
             f'<div class="pmeta"><div><b>নির্মাতা</b>{maker}</div><div><b>কোথায়</b>{access}</div>{extra_meta}</div>{tag}{deco}</div>'
             f'<div class="card caps" id="{s}C"><div class="lbl">যা করতে পারে</div><div class="uses">'
             + "".join(f'<span class="chip" id="{s}c{k}">{t}</span>' for k, t in enumerate(caps)) + '</div></div>'
             f'<div class="card usec" id="{s}U"><div class="lbl gr">{use_title}</div><div class="p">{use_text}</div><div class="lim" id="{s}L">{lim_text}</div></div>')
    scene_html.append(clip(s, inner))
    rev(f"#{s}P", at(s, 0, 0.1), "x:-60,opacity:0", 0.6)
    js.append(f'tl.from("#{s} .pmeta div",{{x:-20,opacity:0,stagger:0.4,duration:0.35}},{at(s, 1, 0.1):.3f});')
    rev(f"#{s}C", at(s, cap_li, 0, -0.2), "x:60,opacity:0")
    for k in range(len(caps)): rev(f"#{s}c{k}", at(s, cap_li, 0.08 + k * (0.8 / len(caps))), "scale:0.6,opacity:0", 0.35, "back.out(2)")
    rev(f"#{s}U", at(s, use_li, 0.02), "y:40,opacity:0")
    rev(f"#{s}L", at(s, lim_li, 0.05), "x:20,opacity:0", 0.4)


profile("s06", "GPT", "linear-gradient(135deg,#ffa24c,#fde047)", "ChatGPT", "OpenAI", "chatgpt.com · অফিশিয়াল অ্যাপ", "", '<div class="ptag" style="color:var(--amber);background:rgba(253,224,71,.10);border:2px solid rgba(253,224,71,.55)">⚠ নকল “ChatGPT” অ্যাপ থেকে সাবধান — শুধু OpenAI-এর অফিশিয়াল অ্যাপ</div>',
        ["লেখা ও প্রশ্নোত্তর", "ছবি তৈরি", "ফাইল ও ছবি বিশ্লেষণ", "ভয়েসে কথা", "ওয়েব সার্চ"], 2,
        "উদাহরণ · ফ্রিল্যান্সার", "ক্লায়েন্টের ইংরেজি মেসেজের ভদ্র উত্তর, বা গিগের আকর্ষণীয় বর্ণনা — তারপর নিজের মতো সম্পাদনা।", 4,
        "ফ্রি প্ল্যানে ব্যবহারের সীমা আছে · সীমা পেরোলে হালকা মডেলে যেতে পারে", 5, "")
rev("#s06U", at("s06", 3, 0.05), "y:40,opacity:0")
orbit = '<div class="orbit" id="s07o">' + "".join(f'<span style="left:{x}px;top:{y}px">{t}</span>' for t, x, y in [("Gmail", 70, 0), ("Docs", 150, 80), ("Drive", 70, 160), ("Android", -10, 80)]) + '</div>'
profile("s07", "Gem", "linear-gradient(135deg,#2dd4bf,#4ade80)", "Gemini", "Google", "gemini.google.com · অ্যাপ", "<div><b>ফোনে</b>অনেক Android ফোনে সহকারী</div>", '<div class="ptag" style="color:var(--amber);background:rgba(253,224,71,.10);border:2px solid rgba(253,224,71,.55)">🔒 Gmail/Drive-এ অ্যাক্সেস দেওয়ার আগে ভাবুন</div>',
        ["লেখা ও প্রশ্নোত্তর", "ছবি তৈরি", "Gmail · Docs · Drive (অনুমতি দিলে)", "Deep Research"], 2,
        "উদাহরণ · অফিস ও শিক্ষার্থী", "Gmail-এ জমে থাকা ইমেইলের জরুরি অংশের সারসংক্ষেপ, বা Google Doc-এর খসড়া সহজ ভাষায়।", 5,
        "Google অ্যাপে আগে থেকেই কাজ করলে বেশি সুবিধা", 4, orbit)
js.append(f'tl.from("#s07o span",{{scale:0,opacity:0,stagger:0.25,duration:0.4,ease:"back.out(2)"}},{at("s07", 2, 0.2):.3f});')
js.append(f'tl.to("#s07o",{{rotation:20,duration:{SC["s07"]["end"] - at("s07", 2, 0.2):.2f},ease:"none"}},{at("s07", 2, 0.2):.3f});')
pdfs = '<div class="pdfs" id="s08pd">' + "".join(f'<i style="left:{k * 14}px;top:{k * 10}px"></i>' for k in range(4)) + '<b>মূল পয়েন্ট ✓</b></div>'
profile("s08", "Cl", "linear-gradient(135deg,#fdba74,#f472b6)", "Claude", "Anthropic", "claude.ai · অফিশিয়াল অ্যাপ", "",
        '<div class="ptag" id="s08tag" style="color:var(--green);background:rgba(74,222,128,.12);border:2px solid rgba(74,222,128,.6)">✓ বাংলাদেশে অফিশিয়ালি সাপোর্টেড</div>',
        ["লম্বা ডকুমেন্ট পড়া ও সারসংক্ষেপ", "গোছানো, বিস্তারিত লেখা", "কোডিং ও বিশ্লেষণ"], 2,
        "উদাহরণ · রিপোর্ট ও থিসিস", "বড় রিপোর্টের মূল পয়েন্ট বের করা, বা নিজের অধ্যায়ের কোথায় যুক্তি দুর্বল তা জানা।", 3,
        "গোপন অফিস-ডকুমেন্ট আপলোডের আগে প্রতিষ্ঠানের নিয়ম জানুন", 4, pdfs)
rev("#s08tag", at("s08", 1, 0.6), "scale:0.7,opacity:0", 0.4, "back.out(2)")
js.append(f'tl.from("#s08pd i",{{y:-40,opacity:0,stagger:0.15,duration:0.4}},{at("s08", 3, 0.1):.3f});')
js.append(f'tl.to("#s08pd i",{{scale:0.4,x:60,y:80,opacity:0,stagger:0.08,duration:0.5}},{at("s08", 3, 0.6):.3f});')
rev("#s08pd b", at("s08", 3, 0.75), "scale:0.5,opacity:0", 0.4, "back.out(2)")

# ---------- s09 pricing
s = "s09"
inner = (f'<div class="card pcol l" id="s09F"><div class="lbl">ফ্রি প্ল্যান</div><div class="h">{ic("free", "lg")} শুরু করার জন্য যথেষ্ট</div>'
         + "".join(f'<div class="prow" id="s09f{k}">{ic("check", "gr")}{t}</div>' for k, t in enumerate(["মূল ফিচার ব্যবহার", "ব্যবহারের সীমা আছে", "অনেক সময় হালকা মডেল"])) + '</div>'
         f'<div class="card pcol r" id="s09P"><div class="lbl" style="color:var(--cyan)">পেইড প্ল্যান</div><div class="h">{ic("crown", "lg")} নিয়মিত ভারী কাজে</div>'
         + "".join(f'<div class="prow" id="s09p{k}">{ic("check")}{t}</div>' for k, t in enumerate(["বেশি ব্যবহারের সীমা", "শক্তিশালী মডেল", "বাড়তি ফিচার"])) + '</div>'
         '<div class="pstrip" id="s09st"><div class="pnote">রেফারেন্স · যুক্তরাষ্ট্রে মূল পেইড প্ল্যান (অক্টোবর ২০২৬) · দেশভেদে দাম ভিন্ন, প্রায়ই বদলায় — অফিশিয়াল প্রাইসিং পেজ দেখুন</div><div class="row">'
         + "".join(f'<div class="price"><b>{n}</b><span>{p}</span> <span class="pnote">/ মাস</span></div>' for n, p in [("ChatGPT Plus", "~$20"), ("Google AI Pro", "~$19.99"), ("Claude Pro", "~$20")]) + '</div></div>'
         f'<div class="foot rd" id="s09ft">{ic("alert", "rd")} ফেসবুকে "শেয়ার্ড অ্যাকাউন্ট" কিনবেন না — তথ্য ফাঁস ও নিয়মবিরুদ্ধ · শুধু অফিশিয়াল সাইট/অ্যাপ</div>')
scene_html.append(clip(s, inner))
rev("#s09F", at(s, 1, 0, -0.2), "x:-60,opacity:0")
for k, f in enumerate([0.35, 0.6, 0.8]): rev(f"#s09f{k}", at(s, 1, f), "x:-20,opacity:0", 0.35)
rev("#s09P", at(s, 2, 0, -0.2), "x:60,opacity:0")
for k, f in enumerate([0.15, 0.45, 0.7]): rev(f"#s09p{k}", at(s, 2, f), "x:20,opacity:0", 0.35)
rev("#s09st", at(s, 3, 0.05), "y:40,opacity:0")
js.append(f'tl.from("#s09st .price",{{y:20,opacity:0,stagger:0.25,duration:0.4}},{at(s, 3, 0.3):.3f});')
js.append(f'tl.to("#s09F",{{borderColor:"rgba(74,222,128,.9)",duration:0.4,yoyo:true,repeat:1}},{at(s, 4, 0.1):.3f});')
rev("#s09ft", at(s, 5, 0.05), "y:30,opacity:0")
js.append(f'tl.to("#s09ft",{{x:8,duration:0.06,yoyo:true,repeat:5}},{at(s, 5, 0.12):.3f});')

# ---------- s10 choose
s = "s10"
qs = [("১", "কী তৈরি করতে চাই?", "লেখা, ছবি, ভিডিও, অডিও, কোড, নাকি তথ্য — এতেই টুলের পরিবার ঠিক"),
      ("২", "বাংলায় মান কেমন?", "একই বাংলা প্রম্পট দিয়ে দু-তিনটি টুল পরীক্ষা"),
      ("৩", "সাম্প্রতিক তথ্য বা উৎস লাগবে?", "লাগলে ওয়েব সার্চ/উৎস দেখায় এমন টুল + আসল উৎস যাচাই"),
      ("৪", "বাজেট ও প্রাইভেসি", "ফ্রিতে চলবে? গোপন তথ্য AI-তে দেওয়া ঠিক কি না")]
inner = ('<div class="q4g">' + "".join(f'<div class="q4" id="s10q{k}"><span class="qn">{n}</span><div><div class="qt">{t}</div><div class="qs">{e(d)}</div></div></div>' for k, (n, t, d) in enumerate(qs)) + '</div>'
         '<div class="exflow" id="s10ex"><div class="lbl gr">উদাহরণ · দোকানের ফেসবুক পোস্ট</div><div class="pills">'
         + '<span class="arrow">→</span>'.join(f'<span class="pill{" k" if k == 4 else ""}" id="s10p{k}">{t}</span>' for k, t in enumerate(["লেখা → লেখার AI", "তিনটিতে একই প্রম্পট", "সাম্প্রতিক তথ্য লাগে না", "ফ্রিতেই চলে", "বাংলা সেরা যার = আপনার টুল"])) + '</div></div>')
scene_html.append(clip(s, inner))
for k in range(4):
    rev(f"#s10q{k}", at(s, k + 1, 0.02), "rotationX:-70,opacity:0", 0.5)
    js.append(f'tl.to("#s10q{k}",{{borderColor:"rgba(255,162,76,.9)",duration:0.3}},{at(s, k + 1, 0.02):.3f});')
    js.append(f'tl.to("#s10q{k}",{{borderColor:"rgba(255,190,130,.24)",duration:0.3}},{at(s, k + 1, 1, -0.1):.3f});')
rev("#s10ex", at(s, 5, 0, -0.1), "y:40,opacity:0")
for k, f in enumerate([0.15, 0.32, 0.5, 0.66, 0.8]): rev(f"#s10p{k}", at(s, 5, f), "scale:0.7,opacity:0", 0.35, "back.out(2)")

# ---------- s11 compare & assignment
s = "s11"
pw2 = PROMPT.split()
crit = ["বাংলার মান", "নির্দেশনা মানা", "সৃজনশীলতা", "ভুল তথ্য নেই"]
BARS = '<div class="bar"><i style="background:#f87171"></i><i style="background:#fde047"></i><i style="background:#4ade80"></i>'
inner = ('<div class="card pcard" id="s11pc"><div class="lbl">একই প্রম্পট · তিনটি টুল · নতুন চ্যাট</div><div class="pt">'
         + " ".join(f'<span class="w" id="s11w{i}">{e(w)}</span>' for i, w in enumerate(pw2)) + '</div></div>'
         + "".join(f'<div class="cpan" id="s11c{k}" style="left:{80 + k * 595}px">{BARS}<div class="addr">{n}</div><div class="illus">প্রতীকী — আসল স্ক্রিনশট নয়</div></div>'
                   f'<div class="body">' + "".join(f'<i class="ln" style="width:{w}%"></i>' for w in ws) + '</div></div>'
                   for k, (n, ws) in enumerate([("ChatGPT", [94, 86, 90, 60, 40]), ("Gemini", [90, 92, 70, 84, 30]), ("Claude", [88, 94, 82, 66, 52])]))
         + '<div class="score" id="s11sc"><span class="sub2">উদাহরণ স্কোর — আপনার ফল ভিন্ন হবে</span><div class="sg"><div></div>' + "".join(f'<div class="hd">{c}</div>' for c in crit)
         + "".join(f'<div class="tn">{n}</div>' + "".join('<div class="dots5">' + "".join(f'<i class="{"f" if d < sc else ""} d{r}"></i>' for d in range(5)) + '</div>' for sc in row)
                   for r, (n, row) in enumerate([("ChatGPT", [4, 4, 4, 5]), ("Gemini", [4, 3, 4, 5]), ("Claude", [5, 4, 4, 5])]))
         + '</div></div>')
scene_html.append(clip(s, inner))
rev("#s11pc", at(s, 1, 0, -0.3), "y:30,opacity:0")
st, en = at(s, 1, 0.22), at(s, 1, 0.98)
for i in range(len(pw2)): js.append(f'tl.to("#s11w{i}",{{opacity:1,duration:0.08}},{st + (en - st) * i / len(pw2):.3f});')
for k in range(3):
    rev(f"#s11c{k}", en - 0.2 + k * 0.15, "y:40,opacity:0", 0.5)
    js.append(f'tl.from("#s11c{k} .ln",{{scaleX:0,stagger:0.2,duration:0.5}},{en + 0.3 + k * 0.1:.3f});')
rev("#s11sc", at(s, 2, 0.02), "y:40,opacity:0")
for r in range(3): js.append(f'tl.from("#s11sc .d{r}.f",{{scale:0,stagger:0.05,duration:0.25,ease:"back.out(3)"}},{at(s, 2, 0.3 + r * 0.2):.3f});')
js.append(f'tl.to("#s11c0, #s11c1, #s11c2",{{borderColor:"rgba(255,162,76,.8)",duration:0.3,yoyo:true,repeat:1}},{at(s, 3, 0.1):.3f});')
inner_extra = ''

# ---------- s12 recap
s = "s12"
items = ["ছয় ধরনের AI টুল", "ChatGPT · Gemini · Claude", "ফ্রি বনাম পেইড", "বাছাইয়ের ৪ প্রশ্ন", "একই প্রম্পটে ন্যায্য তুলনা", "সেরা টুল = নির্ভুল ও নিরাপদ"]
lip12 = talk(s, 83, 239, 434, 514, 8)
if lip12: LIPSYNC.append(s)
inner = (f'<div class="photo sm"><img id="p12" src="assets/presenter.jpg" alt=""/><div class="tag">দেখা হবে পরের লেসনে!</div>'
         + ('<div class="lipbadge">AI লিপ-সিঙ্ক</div>' if lip12 else '') + '</div>'
         '<div class="rlist">' + "".join(f'<div class="rl" id="s12i{k}">{ic("check", "gr")}{e(t)}</div>' for k, t in enumerate(items)) + '</div>'
         f'<div class="card" id="s12next"><div class="lbl" style="color:#5eead4">পরের লেসন · ০৪</div><div class="h">{ic("next", "lg pu")}</div>'
         '<div class="h" style="font-size:38px">প্রম্পট ইঞ্জিনিয়ারিংয়ের মূল কথা</div><div class="p" style="font-size:25px;color:var(--mute)">ভালো প্রম্পট = ভালো উত্তর</div></div>'
         f'<div id="s12key" style="position:absolute">{ic("shield", "lg")}<span>শুরু করুন ফ্রিতে · তুলনা করুন · যাচাই করুন · দায়িত্ব নিয়ে ব্যবহার করুন</span></div>')
scene_html.append(clip(s, inner))
rev("#s12 .photo", SC[s]["start"] + 0.2, "x:-50,opacity:0", 0.7)
rev("#s12i0", at(s, 0, 0.2), "x:40,opacity:0", 0.4)
rev("#s12i1", at(s, 1, 0.05), "x:40,opacity:0", 0.4)
rev("#s12i2", at(s, 1, 0.55), "x:40,opacity:0", 0.4)
rev("#s12i3", at(s, 2, 0.05), "x:40,opacity:0", 0.4)
rev("#s12i4", at(s, 2, 0.55), "x:40,opacity:0", 0.4)
rev("#s12i5", at(s, 3, 0.1), "x:40,opacity:0", 0.4)
rev("#s12next", at(s, 4, 0.03), "x:60,opacity:0")
rev("#s12key", at(s, 5, 0.03), "y:40,opacity:0")
js.append(f'tl.fromTo("#p12",{{scale:1.06}},{{scale:1,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

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


def is_kw(t):
    return bool(re.search(r"[A-Za-z0-9০-৯$]", t.strip("।?!,—'\"")))


cap_html, cap_js = [], []
for i, c in enumerate(T["cues"]):
    spans = " ".join(f'<span class="{"kw" if is_kw(w) else ""}">{e(w)}</span>' for w in c["text"].split())
    st, du = c["start"] - 0.05, c["end"] - c["start"] + 0.05
    cap_html.append(f'<div id="cap{i}" class="clip cap" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{10 + i % 2}"><div class="capbox">{spans}</div></div>')
    cap_js.append(f'tl.from("#cap{i} .capbox",{{opacity:0,duration:0.15}},{st:.3f});')

CSS = open(f"{HERE}/style_l3.css").read() + "\n.talkv { position: absolute; object-fit: cover; border-radius: 25px; }\n"
page = f"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<title>PILLAR 01 · Lesson 03 — Essential AI Tools & Platforms</title>
<script src="assets/gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
  <div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"><div class="bgfill"></div><div id="grid" class="grid"></div>
    <div id="orb1" class="orb o1"></div><div id="orb2" class="orb o2"></div><div id="orb3" class="orb o3"></div></div>
  <div id="topbar" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1">
    <div class="brand"><span class="dot"></span>PILLAR 01 · AI FUNDAMENTALS<span class="pill">বাংলা</span></div>
    <div class="lesson">লেসন ০৩ · প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম</div></div>
  <div id="prog" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><i id="progfill"></i></div>
  {"".join(scene_html)}
  {"".join(media_html)}
  {"".join(flash_html)}
  {"".join(cap_html)}
  <div id="endc" class="clip endc" data-start="{DUR - 2.2:.3f}" data-duration="2.2" data-track-index="9">
    <div class="brand" style="font-size:44px"><span class="dot"></span>PILLAR 01 · AI FUNDAMENTALS</div>
    <div class="sub">পরের লেসন: প্রম্পট ইঞ্জিনিয়ারিংয়ের মূল কথা</div></div>
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
json.dump(LIPSYNC, open(f"{P}/artifacts/lipsync_scenes.json", "w"))
print("wrote", len(page), "duration", DUR, "lipsync", LIPSYNC)

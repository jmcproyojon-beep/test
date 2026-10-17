"""Generate the HyperFrames composition (index.html) for the Daily AI News short.

All timing comes from artifacts/timing.json (word-aligned narration, speed-adjusted).
"""
import html
import json
import re

W = "/home/user/test/projects/daily-ai-news-2026-10-17"
T = json.load(open(f"{W}/artifacts/timing.json"))
ENV = json.load(open(f"{W}/artifacts/narration_env.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
LINES = T["lines"]
CUES = T["cues"]


def wt(scene, token, nth=0, end=False):
    """Time (s) when `token` is spoken inside `scene` (nth occurrence)."""
    hits = [w for L in LINES if L["scene"] == scene for w in L["words"] if token in w["t"]]
    w = hits[nth]
    return round(w["e"] if end else w["s"], 3)


KEYWORDS = {"ফ্রি", "পেইড", "যাচাই", "নিরাপত্তা", "নিরাপত্তার", "সতর্কতা।", "দ্বিগুণ", "টোকেন", "লিমিট", "ভুয়া", "অসম্পূর্ণ", "ফলো"}


def is_kw(t):
    core = t.strip("।?!,—")
    return bool(re.search(r"[A-Za-z0-9০-৯]", core)) or core in {k.strip("।") for k in KEYWORDS}


# ---------------------------------------------------------------- captions
cap_html, cap_js = [], []
for i, c in enumerate(CUES):
    spans = []
    for j, w in enumerate(c["words"]):
        cls = "w kw" if is_kw(w["t"]) else "w"
        spans.append(f'<span id="c{i}w{j}" class="{cls}">{html.escape(w["t"])}</span>')
        cap_js.append(f'tl.to("#c{i}w{j}",{{opacity:1,duration:0.12,ease:"none"}},{w["s"]});')
    start, dur = c["start"] - 0.05, (c["end"] - c["start"]) + 0.05
    cap_html.append(
        f'<div id="cap{i}" class="clip cap" data-start="{start:.3f}" data-duration="{dur:.3f}" data-track-index="{10 + i % 2}">'
        f'<div class="capbox">{" ".join(spans)}</div></div>')
    cap_js.append(f'tl.from("#cap{i} .capbox",{{y:18,opacity:0,duration:0.18,ease:"power2.out"}},{start:.3f});')


# ---------------------------------------------------------------- scenes
def clip(id_, scene, inner, track=3, cls="scene"):
    s = SC[scene]
    return (f'<div id="{id_}" class="clip {cls}" data-start="{s["start"]:.3f}" '
            f'data-duration="{s["end"] - s["start"]:.3f}" data-track-index="{track}">{inner}</div>')


def header(scene, title, tag, tagcls, source):
    return (f'<div class="hdr"><div class="tag {tagcls}"><span class="dot"></span>{tag}</div>'
            f'<div class="htitle">{title}</div></div>'
            f'<div class="src">সূত্র: {source}</div>')


ICON = {
    "code": '<svg viewBox="0 0 48 48"><path d="M17 14 7 24l10 10M31 14l10 10-10 10M27 10l-6 28" /></svg>',
    "math": '<svg viewBox="0 0 48 48"><path d="M10 14h12M16 8v12M28 14h12M10 34h12M28 30l12 8M40 30l-12 8" /></svg>',
    "sci": '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="18" ry="7"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(-60 24 24)"/><circle cx="24" cy="24" r="2.5"/></svg>',
    "steps": '<svg viewBox="0 0 48 48"><path d="M8 38h10v-9h10v-9h10v-9h4"/><circle cx="40" cy="9" r="3"/></svg>',
    "lock": '<svg viewBox="0 0 48 48"><rect x="11" y="21" width="26" height="19" rx="4"/><path d="M16 21v-6a8 8 0 0 1 16 0v6"/></svg>',
    "calc": '<svg viewBox="0 0 48 48"><rect x="12" y="6" width="24" height="36" rx="4"/><path d="M17 13h14v7H17zM18 27h2M24 27h2M30 27h2M18 34h2M24 34h2M30 34h2"/></svg>',
    "chart": '<svg viewBox="0 0 48 48"><path d="M8 40h34M13 34V24M21 34V14M29 34V20M37 34V9"/></svg>',
    "widget": '<svg viewBox="0 0 48 48"><rect x="8" y="8" width="13" height="13" rx="3"/><rect x="27" y="8" width="13" height="13" rx="3"/><rect x="8" y="27" width="13" height="13" rx="3"/><circle cx="33.5" cy="33.5" r="6.5"/></svg>',
    "upload": '<svg viewBox="0 0 48 48"><path d="M24 32V10M15 19l9-9 9 9M10 38h28"/></svg>',
    "image": '<svg viewBox="0 0 48 48"><rect x="7" y="10" width="34" height="28" rx="4"/><circle cx="17" cy="19" r="3"/><path d="m9 35 10-10 7 7 5-5 9 8"/></svg>',
    "mic": '<svg viewBox="0 0 48 48"><rect x="18" y="7" width="12" height="22" rx="6"/><path d="M12 23a12 12 0 0 0 24 0M24 35v6"/></svg>',
    "server": '<svg viewBox="0 0 48 48"><rect x="9" y="7" width="30" height="10" rx="2"/><rect x="9" y="19" width="30" height="10" rx="2"/><rect x="9" y="31" width="30" height="10" rx="2"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="24" r="1.5"/><circle cx="15" cy="36" r="1.5"/></svg>',
    "cal": '<svg viewBox="0 0 48 48"><rect x="8" y="11" width="32" height="29" rx="4"/><path d="M8 19h32M16 7v8M32 7v8"/></svg>',
    "shield": '<svg viewBox="0 0 48 48"><path d="M24 6 39 12v11c0 9-6.5 16-15 19-8.5-3-15-10-15-19V12z"/><path d="m24 17 0 10M24 32v1"/></svg>',
    "form": '<svg viewBox="0 0 48 48"><rect x="11" y="6" width="26" height="36" rx="3"/><path d="M17 15h14M17 22h14M17 29h8"/></svg>',
    "alert": '<svg viewBox="0 0 48 48"><path d="M24 7 43 40H5z"/><path d="M24 19v10M24 34v1"/></svg>',
    "check": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><path d="m16 24 6 6 11-12"/></svg>',
    "gov": '<svg viewBox="0 0 48 48"><path d="M6 18 24 8l18 10M10 20v16M18 20v16M30 20v16M38 20v16M6 40h36"/></svg>',
    "share": '<svg viewBox="0 0 48 48"><circle cx="35" cy="11" r="5"/><circle cx="13" cy="24" r="5"/><circle cx="35" cy="37" r="5"/><path d="m18 22 13-8M18 26l13 8"/></svg>',
}


def chip(id_, icon, label, cls=""):
    return f'<div id="{id_}" class="chip {cls}"><span class="ic">{ICON[icon]}</span><span>{label}</span></div>'


scene_html, js = [], []

# --- S1 hook
s = "s1"
heads = [("GOOGLE", wt(s, "Google")), ("OPENAI", wt(s, "OpenAI")), ("META", wt(s, "Meta")), ("AI SAFETY", wt(s, "নিরাপত্তা"))]
s1 = '<div class="s1title"><div class="kicker">এই সপ্তাহের</div><div class="big">AI খবর</div></div><div class="heads">'
for k, (h, t) in enumerate(heads):
    s1 += f'<div id="s1h{k}" class="headchip {"warn" if k == 3 else ""}">{h}</div>'
s1 += '</div>'
scene_html.append(clip("s1", s, s1))
js.append(f'tl.from("#s1 .s1title",{{y:40,opacity:0,duration:0.6,ease:"power3.out"}},0.1);')
for k, (h, t) in enumerate(heads):
    js.append(f'tl.from("#s1h{k}",{{y:50,scale:0.8,opacity:0,duration:0.45,ease:"back.out(1.8)"}},{max(0.2, t - 0.1)});')

# --- S2 main story
s = "s2"
inner = header(s, "সবচেয়ে বড় খবর", "RELEASED · ১৩ অক্টোবর", "t-rel", "blog.google · ai.google.dev")
inner += ('<div id="s2card" class="glass hero"><div class="brand">Google</div>'
          '<div class="model">Gemini 4 Argon</div><div class="sub">এখন সবার জন্য চালু · General Availability</div>'
          '<div class="chips">'
          + chip("s2c0", "code", "কোডিং") + chip("s2c1", "math", "অংক") + chip("s2c2", "sci", "বিজ্ঞান") + chip("s2c3", "steps", "ধাপে ধাপে জটিল কাজ")
          + '</div></div>')
scene_html.append(clip("s2", s, inner))
t0 = SC[s]["start"]
js.append(f'tl.from("#s2 .hdr",{{x:-40,opacity:0,duration:0.5,ease:"power3.out"}},{t0 + 0.15});')
js.append(f'tl.from("#s2card",{{y:80,opacity:0,scale:0.94,duration:0.7,ease:"power3.out"}},{t0 + 0.3});')
js.append(f'tl.from("#s2card .model",{{opacity:0,y:20,duration:0.6,ease:"power2.out"}},{wt(s, "Gemini") - 0.1});')
for k, tok in enumerate(["কোডিং", "অংক", "বিজ্ঞান", "জটিল"]):
    js.append(f'tl.from("#s2c{k}",{{y:30,opacity:0,scale:0.85,duration:0.4,ease:"back.out(1.7)"}},{wt(s, tok) - 0.05});')

# --- S3 what users can do
s = "s3"
inner = header(s, "কী করতে পারে?", "PAID · Pro / Ultra", "t-paid", "ai.google.dev · gemini.google")
inner += ('<div id="s3card" class="glass"><div class="ctrwrap"><span class="approx">প্রায়</span>'
          '<span id="s3num" class="ctr">১০ লাখ</span></div><div class="ctrsub">টোকেন একসাথে · 1M context window</div>'
          '<div class="tokbar"><div id="s3fill" class="tokfill"></div></div>'
          '<div class="explain">টোকেন = লেখার ছোট ছোট টুকরো</div>'
          '<div class="docs">' + "".join(f'<div id="s3d{k}" class="doc"></div>' for k in range(7)) + '</div></div>'
          '<div id="s3pay" class="glass paycard"><span class="ic big">' + ICON["lock"] + '</span>'
          '<div><div class="payt">ফ্রি নয়</div><div class="pays">Gemini অ্যাপে Google AI Pro বা Ultra লাগবে</div></div></div>')
scene_html.append(clip("s3", s, inner))
t0 = SC[s]["start"]
js.append(f'tl.from("#s3 .hdr",{{x:-40,opacity:0,duration:0.5,ease:"power3.out"}},{t0 + 0.15});')
js.append(f'tl.from("#s3card",{{y:60,opacity:0,duration:0.6,ease:"power3.out"}},{t0 + 0.25});')
js.append(f'tl.from("#s3num",{{scale:0.6,opacity:0,duration:0.5,ease:"back.out(2)"}},{wt(s, "১০") - 0.1});')
js.append(f'tl.fromTo("#s3fill",{{scaleX:0}},{{scaleX:1,duration:2.2,ease:"power2.inOut"}},{wt(s, "১০")});')
for k in range(7):
    js.append(f'tl.from("#s3d{k}",{{y:-60,opacity:0,rotation:{(-8 + k * 3)},duration:0.35,ease:"power2.out"}},{wt(s, "ডকুমেন্ট") - 0.2 + k * 0.12});')
js.append(f'tl.from("#s3 .explain",{{opacity:0,y:14,duration:0.4}},{wt(s, "টোকেন", 1) - 0.1});')
js.append(f'tl.from("#s3pay",{{x:120,opacity:0,duration:0.55,ease:"power3.out"}},{wt(s, "ফ্রি") - 0.15});')

# --- S4 free tool
s = "s4"
inner = header(s, "ফ্রিতে কী পাচ্ছেন?", "FREE TIER · ৭–৮ অক্টোবর", "t-free", "openai.com · help.openai.com")
inner += ('<div id="s4card" class="glass"><div class="brand">OpenAI · ChatGPT</div><div class="model sm">Intelligent UI</div>'
          '<div class="sub">ফ্রি ইউজারদের কাছেও আসছে</div>'
          '<div class="morph"><div id="s4q" class="bubble">উত্তর এখন শুধু লেখা নয়…</div>'
          '<div class="widgets">' + chip("s4w0", "calc", "ক্যালকুলেটর") + chip("s4w1", "chart", "ছবি / গ্রাফ") + chip("s4w2", "widget", "ইন্টারঅ্যাকটিভ টুল") + '</div></div>'
          '<div class="illus">প্রতীকী চিত্র — আসল স্ক্রিনশট নয়</div></div>'
          '<div id="s4lim" class="glass limits"><div class="limt">আলাদা লিমিট</div><div class="limrow">'
          + chip("s4l0", "upload", "ফাইল আপলোড", "dim") + chip("s4l1", "image", "ছবি বানানো", "dim") + chip("s4l2", "mic", "ভয়েস", "dim") + '</div></div>')
scene_html.append(clip("s4", s, inner))
t0 = SC[s]["start"]
js.append(f'tl.from("#s4 .hdr",{{x:-40,opacity:0,duration:0.5,ease:"power3.out"}},{t0 + 0.15});')
js.append(f'tl.from("#s4card",{{y:60,opacity:0,duration:0.6,ease:"power3.out"}},{wt(s, "OpenAI") - 0.2});')
js.append(f'tl.from("#s4q",{{opacity:0,x:-30,duration:0.4}},{wt(s, "উত্তর") - 0.1});')
for k, tok in enumerate(["ক্যালকুলেটর", "ছবি", "ইন্টারঅ্যাকটিভ"]):
    js.append(f'tl.from("#s4w{k}",{{y:30,opacity:0,scale:0.8,duration:0.4,ease:"back.out(1.8)"}},{wt(s, tok) - 0.05});')
js.append(f'tl.from("#s4lim",{{y:60,opacity:0,duration:0.5,ease:"power3.out"}},{wt(s, "তবে") - 0.1});')
for k, tok in enumerate(["আপলোড", "বানানো", "ভয়েসে"]):
    js.append(f'tl.from("#s4l{k}",{{opacity:0,scale:0.85,duration:0.3}},{wt(s, tok) - 0.05});')

# --- S5 open model + upcoming
s = "s5"
inner = header(s, "ওপেন মডেল ও আসছে যা", "RELEASED · UPCOMING", "t-up", "huggingface.co · ai.google.dev/pricing")
inner += ('<div id="s5a" class="glass split"><div class="minitag t-rel">RELEASED · ১৫ অক্টোবর</div>'
          '<div class="brand">Meta</div><div class="model sm">Muse Spark Open</div>'
          '<div class="sub">ওপেন-ওয়েট মডেল · নিজস্ব লাইসেন্স</div>'
          '<div class="rack"><span class="ic big">' + ICON["server"] + '</span><span class="ic big">' + ICON["server"] + '</span>'
          '<span class="ic big">' + ICON["server"] + '</span><span class="racktxt">চালাতে লাগে ডেটা সেন্টারের মতো হার্ডওয়্যার</span></div></div>'
          '<div id="s5b" class="glass split"><div class="minitag t-upc">UPCOMING · ১ ডিসেম্বর</div>'
          '<div class="calrow"><span class="ic big">' + ICON["cal"] + '</span><div><div class="model sm">Gemini 4 Argon API</div>'
          '<div class="sub">দাম দ্বিগুণ হবে (প্রতি ১০ লাখ টোকেন)</div></div></div>'
          '<div class="prices"><div class="pr"><span class="pl">ইনপুট</span><span class="old">$2</span><span class="arr">→</span><span id="s5p0" class="new">$4</span></div>'
          '<div class="pr"><span class="pl">আউটপুট</span><span class="old">$10</span><span class="arr">→</span><span id="s5p1" class="new">$20</span></div></div></div>')
scene_html.append(clip("s5", s, inner))
t0 = SC[s]["start"]
js.append(f'tl.from("#s5 .hdr",{{x:-40,opacity:0,duration:0.5,ease:"power3.out"}},{t0 + 0.15});')
js.append(f'tl.from("#s5a",{{y:60,opacity:0,duration:0.6,ease:"power3.out"}},{t0 + 0.25});')
js.append(f'tl.from("#s5a .rack .ic",{{y:20,opacity:0,stagger:0.12,duration:0.35}},{wt(s, "চালাতে") - 0.1});')
js.append(f'tl.from("#s5a .racktxt",{{opacity:0,duration:0.4}},{wt(s, "ডেটা") - 0.1});')
js.append(f'tl.from("#s5b",{{y:60,opacity:0,duration:0.6,ease:"power3.out"}},{wt(s, "আসছে") - 0.2});')
js.append(f'tl.from("#s5p0,#s5p1",{{scale:0.5,opacity:0,stagger:0.15,duration:0.45,ease:"back.out(2)"}},{wt(s, "দ্বিগুণ") - 0.1});')

# --- S6 safety
s = "s6"
inner = header(s, "নিরাপত্তার খবর", "SAFETY · ১০–১৬ অক্টোবর", "t-safe", "Axios/NYT via spokesman.com · cybernews.com")
inner += ('<div id="s6card" class="glass alertcard"><div class="alhead"><span class="ic big warnic">' + ICON["shield"] + '</span>'
          '<div><div class="model sm">Anthropic-এর টেস্ট AI এজেন্ট</div><div class="sub">পরীক্ষার সময় ভুল করে আসল ওয়েবসাইটে</div></div></div>'
          '<div class="tline">'
          + chip("s6i0", "form", "প্রায় ২০টি অসম্পূর্ণ মার্কিন ভিসা ফর্ম", "row warnrow")
          + chip("s6i1", "alert", "১টি ভুয়া পুলিশ টিপ", "row warnrow")
          + chip("s6i2", "check", "কোনোটিই কার্যকর হয়নি", "row okrow")
          + chip("s6i3", "gov", "হোয়াইট হাউস: এমন ঘটনা জানাও ও ঠিক করো", "row govrow")
          + '</div></div>')
scene_html.append(clip("s6", s, inner))
t0 = SC[s]["start"]
js.append(f'tl.from("#s6 .hdr",{{x:-40,opacity:0,duration:0.5,ease:"power3.out"}},{t0 + 0.15});')
js.append(f'tl.from("#s6card",{{y:60,opacity:0,duration:0.6,ease:"power3.out"}},{wt(s, "Anthropic") - 0.25});')
for k, tok in enumerate(["২০টি", "ভুয়া", "কোনোটিই", "হোয়াইট"]):
    js.append(f'tl.from("#s6i{k}",{{x:-60,opacity:0,duration:0.45,ease:"power3.out"}},{wt(s, tok) - 0.1});')
js.append(f'tl.to("#s6card .warnic",{{scale:1.12,duration:0.3,yoyo:true,repeat:3,ease:"sine.inOut"}},{wt(s, "এজেন্ট")});')

# --- S7 takeaway + CTA
s = "s7"
inner = ('<div class="s7wrap"><div class="tag t-key"><span class="dot"></span>KEY TAKEAWAY</div>'
         + chip("s7k0", "check", "কোনটা ফ্রি, কোনটা পেইড — জেনে ব্যবহার করুন", "row okrow")
         + chip("s7k1", "share", "AI-এর তৈরি কিছু শেয়ারের আগে যাচাই করুন", "row okrow")
         + '<div id="s7cta" class="cta">ফলো করুন · প্রতিদিন যাচাই করা AI খবর</div></div>')
scene_html.append(clip("s7", s, inner))
t0 = SC[s]["start"]
js.append(f'tl.from("#s7 .tag",{{y:30,opacity:0,duration:0.4}},{t0 + 0.3});')
js.append(f'tl.from("#s7k0",{{x:-60,opacity:0,duration:0.5,ease:"power3.out"}},{wt(s, "মূল") - 0.05});')
js.append(f'tl.from("#s7k1",{{x:-60,opacity:0,duration:0.5,ease:"power3.out"}},{wt(s, "শেয়ার") - 0.6});')
js.append(f'tl.from("#s7cta",{{scale:0.7,opacity:0,duration:0.5,ease:"back.out(2)"}},{wt(s, "প্রতিদিনের") - 0.1});')
js.append(f'tl.to("#s7cta",{{scale:1.06,duration:0.35,yoyo:true,repeat:3,ease:"sine.inOut"}},{wt(s, "ফলো") + 0.05});')

# ---------------------------------------------------------------- presenter states (BIG <-> PIP)
big_scenes = {"s1", "s7"}
pres_js = []
for sc_ in T["scenes"]:
    st = sc_["start"]
    if sc_["id"] == "s7":
        state = '{x:160,y:0,scale:0.6,borderRadius:36}'
    elif sc_["id"] in big_scenes:
        state = '{x:0,y:0,scale:1,borderRadius:36}'
    else:
        state = '{x:-80,y:-8,scale:0.26,borderRadius:420}'
    if st == 0:
        continue
    pres_js.append(f'tl.to("#presenter",{{...{state},duration:0.7,ease:"power3.inOut"}},{st - 0.35});')
    pres_js.append(f'tl.to("#lower3",{{opacity:{1 if sc_["id"] in big_scenes else 0},duration:0.3}},{st - 0.35});')

# scene-boundary light sweep
sweep_js = []
for n_, sc_ in enumerate(T["scenes"][1:]):
    ir = "" if n_ == 0 else ",immediateRender:false"
    sweep_js.append(f'tl.fromTo("#sweep",{{x:-1400,opacity:0.0}},{{x:1400,opacity:0.9,duration:0.55,ease:"power2.inOut"{ir}}},{sc_["start"] - 0.3});')
    sweep_js.append(f'tl.to("#sweep",{{opacity:0,duration:0.15}},{sc_["start"] + 0.25});')

# scene exits (fade out last 0.3s of each scene except last)
exit_js = [f'tl.to("#{sc_["id"]}",{{opacity:0,y:-30,duration:0.3,ease:"power2.in"}},{sc_["end"] - 0.3});' for sc_ in T["scenes"][:-1]]

CSS = open("/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/om/style.css").read()

page = f"""<!doctype html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Daily AI News — 17 Oct 2026</title>
<script src="assets/gsap.min.js"></script>
<style>
{CSS}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="{DUR:.3f}" data-fps="30">
  <div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0">
    <div class="bgfill"></div><div id="grid" class="grid"></div>
    <div id="orb1" class="orb o1"></div><div id="orb2" class="orb o2"></div><div id="orb3" class="orb o3"></div>
    <div class="scan"></div>
  </div>
  <div id="topbar" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1">
    <div class="logo"><span class="live"></span>DAILY AI NEWS<span class="bn">বাংলা</span></div>
    <div class="date">১৭ অক্টোবর ২০২৬ · এই সপ্তাহ</div>
  </div>
  <div id="presenter" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2">
    <img id="pimg" src="assets/presenter.png" alt="" />
    <div class="pglow"></div>
    <div id="wave" class="wave">{"".join(f'<i id="wb{k}"></i>' for k in range(9))}</div>
    <div id="lower3" class="lower3"><span class="l3a">AI NEWS DESK</span><span class="l3b">যাচাই করা খবর · বাংলায়</span></div>
  </div>
  {"".join(scene_html)}
  <div id="sweep" class="clip sweep" data-start="0" data-duration="{DUR:.3f}" data-track-index="8"></div>
  {"".join(cap_html)}
  <div id="endcard" class="clip endcard" data-start="{DUR - 0.9:.3f}" data-duration="0.9" data-track-index="9">
    <div class="endlogo"><span class="live"></span>DAILY AI NEWS</div>
  </div>
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{ paused: true }});
const ENV = {json.dumps(ENV)};
// background life
tl.to("#orb1",{{x:160,y:120,duration:{DUR / 2:.2f},ease:"sine.inOut",yoyo:true,repeat:1}},0);
tl.to("#orb2",{{x:-140,y:-160,duration:{DUR / 2:.2f},ease:"sine.inOut",yoyo:true,repeat:1}},0);
tl.to("#orb3",{{x:90,y:-110,scale:1.25,duration:{DUR / 3:.2f},ease:"sine.inOut",yoyo:true,repeat:2}},0);
tl.fromTo("#grid",{{y:0}},{{y:120,duration:{DUR:.2f},ease:"none"}},0);
tl.from("#topbar",{{y:-60,opacity:0,duration:0.6,ease:"power3.out"}},0);
// presenter: entrance, slow ken-burns, state changes
tl.from("#presenter",{{opacity:0,scale:0.92,duration:0.7,ease:"power3.out"}},0);
tl.fromTo("#pimg",{{scale:1.0}},{{scale:1.09,duration:{DUR:.2f},ease:"none"}},0);
{chr(10).join(pres_js)}
// voice-reactive waveform (deterministic: driven by timeline time)
const bars = Array.from({{length:9}},(_,k)=>document.getElementById("wb"+k));
const proxy = {{t:0}};
tl.to(proxy,{{t:{DUR:.3f},duration:{DUR:.3f},ease:"none",onUpdate:()=>{{
  const i = Math.min(ENV.length-1, Math.max(0, Math.floor(tl.time()*15)));
  const v = ENV[i];
  for (let k=0;k<9;k++) {{
    const shape = 0.45 + 0.55*Math.abs(Math.sin((k+1)*1.7 + i*0.9));
    bars[k].style.transform = "scaleY(" + (0.12 + 0.88*v*shape).toFixed(3) + ")";
  }}
}}}},0);
{chr(10).join(js)}
{chr(10).join(exit_js)}
{chr(10).join(sweep_js)}
{chr(10).join(cap_js)}
tl.from("#endcard",{{opacity:0,duration:0.4}},{DUR - 0.9:.3f});
window.__timelines["main"] = tl;
</script>
</body>
</html>
"""
open(f"{W}/hf/index.html", "w").write(page)
print("wrote", len(page), "bytes; duration", DUR)

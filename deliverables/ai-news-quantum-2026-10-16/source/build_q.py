"""HyperFrames composition for the no-voiceover quantum / agent-safety edition."""
import html
import json
import re
import sys

sys.path.insert(0, "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/om")
P = "/home/user/test/projects/ai-news-quantum-2026-10-16"
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
LINES, CUES = T["lines"], T["cues"]
Q = "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/q"
OM = "/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/om"


def wt(scene, token, nth=0):
    hits = [w for L in LINES if L["scene"] == scene for w in L["words"] if token in w["t"]]
    return round(hits[nth]["s"], 3)


KW = {"নিরাপত্তা", "উদ্বেগ!", "গবেষণার", "ফ্রি", "সাতটিতে", "আটটি", "গুণ।", "অনাকাঙ্ক্ষিতভাবে", "যৌথ", "মহড়ার", "নয়।", "যাচাইকৃত"}


def is_kw(t):
    core = t.strip("।?!,—")
    return bool(re.search(r"[A-Za-z0-9০-৯]", core)) or t in KW or core in KW


# captions: whole cue appears at once (no narration to follow word-by-word)
cap_html, cap_js = [], []
for i, c in enumerate(CUES):
    spans = " ".join(f'<span class="{"w kw" if is_kw(w["t"]) else "w"}">{html.escape(w["t"])}</span>' for w in c["words"])
    st, du = c["start"] - 0.05, c["end"] - c["start"] + 0.05
    cap_html.append(f'<div id="cap{i}" class="clip cap" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{10 + i % 2}"><div class="capbox">{spans}</div></div>')
    cap_js.append(f'tl.from("#cap{i} .capbox",{{y:18,opacity:0,duration:0.2,ease:"power2.out"}},{st:.3f});')

exec(open(f"{OM}/build_hf.py").read().split("ICON = {")[0].split("# ---------------------------------------------------------------- scenes")[1].replace("\n\n\n", "\n"))  # clip(), header()
ICON = eval("{" + open(f"{OM}/build_hf.py").read().split("ICON = {")[1].split("\n}\n")[0] + "\n}")
ICON.update({
    "atom": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="3"/><ellipse cx="24" cy="24" rx="19" ry="8"/><ellipse cx="24" cy="24" rx="19" ry="8" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="19" ry="8" transform="rotate(120 24 24)"/></svg>',
    "chip": '<svg viewBox="0 0 48 48"><rect x="13" y="13" width="22" height="22" rx="3"/><rect x="19" y="19" width="10" height="10" rx="1"/><path d="M18 6v7M24 6v7M30 6v7M18 35v7M24 35v7M30 35v7M6 18h7M6 24h7M6 30h7M35 18h7M35 24h7M35 30h7"/></svg>',
    "flask": '<svg viewBox="0 0 48 48"><path d="M19 6h10M21 6v12L10 38a3 3 0 0 0 3 4h22a3 3 0 0 0 3-4L27 18V6"/><path d="M15 30h18"/></svg>',
    "globe": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c5 5 7 11 7 17s-2 12-7 17c-5-5-7-11-7-17s2-12 7-17z"/></svg>',
    "bank": '<svg viewBox="0 0 48 48"><path d="M6 18 24 8l18 10M10 20v15M18 20v15M30 20v15M38 20v15M6 39h36"/></svg>',
    "browser": '<svg viewBox="0 0 48 48"><rect x="6" y="9" width="36" height="30" rx="4"/><path d="M6 17h36M11 13h1M15 13h1M19 13h1"/></svg>',
    "eye": '<svg viewBox="0 0 48 48"><path d="M5 24s7-12 19-12 19 12 19 12-7 12-19 12S5 24 5 24z"/><circle cx="24" cy="24" r="5"/></svg>',
    "spark": '<svg viewBox="0 0 48 48"><path d="M24 6l4 14 14 4-14 4-4 14-4-14-14-4 14-4z"/></svg>',
})


def chip(id_, icon, label, cls=""):
    return f'<div id="{id_}" class="chip {cls}"><span class="ic">{ICON[icon]}</span><span>{label}</span></div>'


scene_html, js = [], []
def enter(sel, t, frm="y:60,opacity:0", dur=0.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{dur},ease:"{ease}"}},{t:.3f});')

# S1 hook
s = "s1"
heads = [("AI BREAKTHROUGH", wt(s, "চমক")), ("QUANTUM COMPUTING", wt(s, "Quantum")), ("AI AGENT SAFETY", wt(s, "নিরাপত্তা"))]
inner = '<div class="s1title"><div class="kicker">১৬ অক্টোবরের</div><div class="big">AI খবর</div></div><div class="heads">'
inner += "".join(f'<div id="s1h{k}" class="headchip {"warn" if k == 2 else ""}">{h}</div>' for k, (h, _) in enumerate(heads)) + "</div>"
scene_html.append(clip("s1", s, inner))
enter("#s1 .s1title", 0.1, "y:40,opacity:0", 0.6)
for k, (_, t) in enumerate(heads):
    enter(f"#s1h{k}", max(0.3, t - 0.1), "y:50,scale:0.8,opacity:0", 0.45, "back.out(1.8)")

# S2 Claude research
s = "s2"; t0 = SC[s]["start"]
inner = header(s, "Claude-এর নতুন গবেষণা", "RESEARCH · ১৬ অক্টোবর", "t-rel", "anthropic.com/research")
grid = "".join(f'<div id="s2g{k}" class="qcell {"newm" if k == 7 else "win"}"><span>{["রসায়ন","অপ্টিমাইজেশন","পদার্থবিদ্যা","সংখ্যাতত্ত্ব"][k % 4] if k < 4 else ""}</span></div>' for k in range(8))
inner += ('<div id="s2card" class="glass q1"><div class="brand">Anthropic</div><div class="model sm">Claude Mythos 5</div>'
          '<div class="sub">৮টি Quantum Circuit-এর কাজ</div>'
          f'<div class="qgrid">{grid}</div>'
          '<div class="qlegend"><span class="lg win"></span>৭টিতে আগের সেরা ডিজাইনের চেয়ে ভালো<span class="lg newm"></span>১টিতে নতুন পদ্ধতি</div></div>'
          '<div id="s2gate" class="glass gates"><div class="gt">গেট সংখ্যা (একটি সার্কিট)</div>'
          '<div class="grow"><span class="gl">আগের সেরা</span><div class="gbar"><div id="s2b0" class="gfill old"></div></div><span class="gv">১৭×</span></div>'
          '<div class="grow"><span class="gl">Claude</span><div class="gbar"><div id="s2b1" class="gfill neu"></div></div><span class="gv cy">১×</span></div>'
          '<div class="gnote">সর্বোচ্চ ১৭ গুণ কম গেট · তবে ১২% বেশি কিউবিট</div></div>')
scene_html.append(clip("s2", s, inner))
enter("#s2 .hdr", t0 + 0.15, "x:-40,opacity:0", 0.5)
enter("#s2card", t0 + 0.3)
for k in range(8):
    js.append(f'tl.from("#s2g{k}",{{scale:0.3,opacity:0,duration:0.3,ease:"back.out(2)"}},{wt(s, "আটটি") + k * 0.12:.3f});')
js.append(f'tl.from("#s2card .qlegend",{{opacity:0,y:12,duration:0.4}},{wt(s, "সাতটিতে") - 0.1:.3f});')
enter("#s2gate", wt(s, "একটি") - 0.2)
js.append(f'tl.fromTo("#s2b0",{{scaleX:0}},{{scaleX:1,duration:0.9,ease:"power2.out"}},{wt(s, "গেট"):.3f});')
js.append(f'tl.fromTo("#s2b1",{{scaleX:0}},{{scaleX:1,duration:0.5,ease:"power2.out"}},{wt(s, "গেট") + 0.6:.3f});')

# S3 why it matters
s = "s3"; t0 = SC[s]["start"]
inner = header(s, "কেন গুরুত্বপূর্ণ?", "RESEARCH, NOT A PRODUCT", "t-paid", "anthropic.com/research · Interesting Engineering")
inner += ('<div id="s3card" class="glass q3"><div class="iconrow"><span class="ic big">' + ICON["atom"] + '</span><span class="ic big">' + ICON["chip"] + '</span><span class="ic big">' + ICON["flask"] + '</span></div>'
          '<div class="payt cy">জটিল বৈজ্ঞানিক সমস্যা সমাধান আরও সাশ্রয়ী হতে পারে</div>'
          '<div class="pays">রসায়ন, অপ্টিমাইজেশন, পদার্থবিদ্যার সিমুলেশন</div></div>'
          '<div id="s3warn" class="glass paycard"><span class="ic big">' + ICON["alert"] + '</span>'
          '<div><div class="payt">গবেষণার ফলাফল</div><div class="pays">নতুন কোনো বাণিজ্যিক Quantum Computer নয় · মাপা হয়েছে কিউবিট × গেট, রানটাইম নয়</div></div></div>')
scene_html.append(clip("s3", s, inner))
enter("#s3 .hdr", t0 + 0.15, "x:-40,opacity:0", 0.5)
enter("#s3card", t0 + 0.3)
js.append(f'tl.from("#s3card .iconrow .ic",{{y:30,opacity:0,stagger:0.15,duration:0.4,ease:"back.out(1.8)"}},{t0 + 0.6:.3f});')
enter("#s3warn", wt(s, "গবেষণার") - 0.15, "x:120,opacity:0")

# S4 agent safety
s = "s4"; t0 = SC[s]["start"]
inner = header(s, "AI Agent সেফটি অ্যালার্ট", "SAFETY · ১৬ অক্টোবর", "t-safe", "Reuters via BusinessWorld · The Standard")
inner += ('<div id="s4card" class="glass alertcard q4"><div class="alhead"><span class="ic big warnic">' + ICON["shield"] + '</span>'
          '<div><div class="model sm">Tencent</div><div class="sub">মডেল পরীক্ষায় ব্যবহৃত AI Agent</div></div></div><div class="tline">'
          + chip("s4i0", "browser", "অনাকাঙ্ক্ষিতভাবে ওয়েব ব্রাউজ করেছে", "row warnrow")
          + chip("s4i1", "check", "বেশিরভাগ চেষ্টা ব্যর্থ বা ব্লকড (২,৮১৮টির মধ্যে)", "row okrow")
          + chip("s4i2", "eye", "Tencent: নেটওয়ার্ক নিয়ন্ত্রণ ও মনিটরিং জোরদার", "row govrow")
          + '</div></div>')
scene_html.append(clip("s4", s, inner))
enter("#s4 .hdr", t0 + 0.15, "x:-40,opacity:0", 0.5)
enter("#s4card", wt(s, "Tencent") - 0.2)
enter("#s4i0", wt(s, "অনাকাঙ্ক্ষিতভাবে") - 0.1, "x:-60,opacity:0", 0.45)
enter("#s4i1", wt(s, "ঘটনাটি") - 0.1, "x:-60,opacity:0", 0.45)
enter("#s4i2", wt(s, "নিরাপত্তা") - 0.1, "x:-60,opacity:0", 0.45)
js.append(f'tl.to("#s4card .warnic",{{scale:1.12,duration:0.3,yoyo:true,repeat:3,ease:"sine.inOut"}},{wt(s, "অনাকাঙ্ক্ষিতভাবে"):.3f});')

# S5 G7
s = "s5"; t0 = SC[s]["start"]
nodes = "".join(f'<i id="s5n{k}" class="node" style="left:{x}px;top:{y}px"></i>' for k, (x, y) in enumerate([(70, 60), (230, 30), (390, 80), (560, 40), (700, 95), (150, 150), (470, 160), (640, 175)]))
inner = header(s, "বৈশ্বিক AI নিরাপত্তা", "PLANNED · ১৬ অক্টোবর", "t-up", "Reuters via Yahoo Finance · Global Banking & Finance")
inner += ('<div id="s5card" class="glass q5"><div class="calrow"><span class="ic big">' + ICON["bank"] + '</span><div><div class="model sm">G7</div>'
          '<div class="sub">অর্থমন্ত্রী ও কেন্দ্রীয় ব্যাংক</div></div></div>'
          f'<div class="net">{nodes}</div>'
          '<div class="pays">আর্থিক খাতে AI-চালিত সাইবার হামলার যৌথ মহড়া</div><div class="chips">'
          + chip("s5c0", "eye", "শনাক্ত") + chip("s5c1", "shield", "প্রতিরোধ") + chip("s5c2", "check", "পুনরুদ্ধার") + '</div></div>')
scene_html.append(clip("s5", s, inner))
enter("#s5 .hdr", t0 + 0.15, "x:-40,opacity:0", 0.5)
enter("#s5card", t0 + 0.3)
js.append(f'tl.from("#s5card .node",{{scale:0,opacity:0,stagger:0.08,duration:0.3,ease:"back.out(2)"}},{wt(s, "G7"):.3f});')
for k, tok in enumerate(["সাইবার", "যৌথ", "মহড়ার"]):
    enter(f"#s5c{k}", wt(s, tok) - 0.05, "y:30,opacity:0,scale:0.85", 0.4, "back.out(1.7)")

# S6 free tool
s = "s6"; t0 = SC[s]["start"]
inner = header(s, "ফ্রি AI টুল", "FREE TIER", "t-free", "ai.google.dev/pricing · BenchLM (Sep 2026)")
inner += ('<div id="s6card" class="glass q6"><div class="brand">Google</div><div class="model sm">AI Studio</div>'
          '<div class="sub">নির্বাচিত ফ্রি Gemini মডেল</div><div class="morph"><div id="s6q" class="bubble">আমার দোকানের জন্য একটি অর্ডার-ট্র্যাকার বানাও…</div>'
          '<div class="widgets">' + chip("s6w0", "spark", "AI প্রোটোটাইপ") + chip("s6w1", "widget", "অ্যাপ টেস্ট") + '</div></div>'
          '<div class="illus">প্রতীকী চিত্র — আসল স্ক্রিনশট নয়</div></div>'
          '<div id="s6lim" class="glass limits"><div class="limt">মনে রাখুন</div><div class="pays">রেট লিমিট প্রজেক্ট অনুযায়ী · সব মডেল ফ্রি নয়</div></div>')
scene_html.append(clip("s6", s, inner))
enter("#s6 .hdr", t0 + 0.15, "x:-40,opacity:0", 0.5)
enter("#s6card", t0 + 0.3)
enter("#s6q", wt(s, "Google") - 0.1, "x:-30,opacity:0", 0.4)
enter("#s6w0", wt(s, "প্রোটোটাইপ") - 0.1, "y:30,opacity:0,scale:0.8", 0.4, "back.out(1.8)")
enter("#s6w1", wt(s, "পরীক্ষা") - 0.1, "y:30,opacity:0,scale:0.8", 0.4, "back.out(1.8)")
enter("#s6lim", wt(s, "পারেন") + 0.2)

# S7 CTA
s = "s7"; t0 = SC[s]["start"]
inner = ('<div class="s7wrap"><div class="tag t-key"><span class="dot"></span>KEY TAKEAWAY</div>'
         + chip("s7k0", "spark", "AI-এর নতুন সম্ভাবনা কাজে লাগান", "row okrow")
         + chip("s7k1", "shield", "তবে নিরাপত্তা ভুলবেন না", "row okrow")
         + '<div id="s7cta" class="cta">DAILY AI NEWS · ফলো করুন</div></div>')
scene_html.append(clip("s7", s, inner))
enter("#s7 .tag", t0 + 0.3, "y:30,opacity:0", 0.4)
enter("#s7k0", wt(s, "সম্ভাবনা") - 0.3, "x:-60,opacity:0", 0.5)
enter("#s7k1", wt(s, "নিরাপত্তা") - 0.1, "x:-60,opacity:0", 0.5)
enter("#s7cta", wt(s, "প্রতিদিন") - 0.1, "scale:0.7,opacity:0", 0.5, "back.out(2)")
js.append(f'tl.to("#s7cta",{{scale:1.06,duration:0.35,yoyo:true,repeat:3,ease:"sine.inOut"}},{wt(s, "থাকুন") - 0.6:.3f});')

# presenter states, sweeps, exits
pres_js, sweep_js = [], []
for sc_ in T["scenes"][1:]:
    st = sc_["start"]
    state = {"s7": "{x:160,y:0,scale:0.6,borderRadius:36}"}.get(sc_["id"], "{x:-80,y:-8,scale:0.26,borderRadius:420}")
    pres_js.append(f'tl.to("#presenter",{{...{state},duration:0.7,ease:"power3.inOut"}},{st - 0.35:.3f});')
    pres_js.append(f'tl.to("#lower3",{{opacity:{1 if sc_["id"] == "s7" else 0},duration:0.3}},{st - 0.35:.3f});')
for n_, sc_ in enumerate(T["scenes"][1:]):
    ir = "" if n_ == 0 else ",immediateRender:false"
    sweep_js.append(f'tl.fromTo("#sweep",{{x:-1400,opacity:0.0}},{{x:1400,opacity:0.9,duration:0.55,ease:"power2.inOut"{ir}}},{sc_["start"] - 0.3:.3f});')
    sweep_js.append(f'tl.to("#sweep",{{opacity:0,duration:0.15}},{sc_["start"] + 0.25:.3f});')
exit_js = [f'tl.to("#{sc_["id"]}",{{opacity:0,y:-30,duration:0.3,ease:"power2.in"}},{sc_["end"] - 0.3:.3f});' for sc_ in T["scenes"][:-1]] + [f'tl.to("#s7",{{opacity:0,duration:0.3}},{DUR - 1.0:.3f});']

CSS = open(f"{OM}/style.css").read() + open(f"{Q}/extra.css").read()
page = f"""<!doctype html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>AI News — Quantum & Agent Safety</title>
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
    <div class="date">১৬ অক্টোবর ২০২৬</div>
  </div>
  <div id="presenter" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2">
    <img id="pimg" src="assets/presenter.png" alt="" />
    <div class="pglow"></div>
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
tl.to("#orb1",{{x:160,y:120,duration:{DUR / 2:.2f},ease:"sine.inOut",yoyo:true,repeat:1}},0);
tl.to("#orb2",{{x:-140,y:-160,duration:{DUR / 2:.2f},ease:"sine.inOut",yoyo:true,repeat:1}},0);
tl.to("#orb3",{{x:90,y:-110,scale:1.25,duration:{DUR / 3:.2f},ease:"sine.inOut",yoyo:true,repeat:2}},0);
tl.fromTo("#grid",{{y:0}},{{y:120,duration:{DUR:.2f},ease:"none"}},0);
tl.from("#topbar",{{y:-60,opacity:0,duration:0.6,ease:"power3.out"}},0);
tl.from("#presenter",{{opacity:0,scale:0.92,duration:0.7,ease:"power3.out"}},0);
tl.fromTo("#pimg",{{scale:1.0}},{{scale:1.09,duration:{DUR:.2f},ease:"none"}},0);
{chr(10).join(pres_js)}
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
open(f"{P}/hf/index.html", "w").write(page)
print("wrote", len(page), "duration", DUR)

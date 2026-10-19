"""HyperFrames 16:9 composition for PILLAR 01 · Module/Lesson 06 — Video, Audio & Production (Instructor: Rubel Miah)."""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from l6_script import SEGS, SCENES

P = "/home/user/test/projects/pillar01-lesson06"
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
SG = {s["id"]: s for s in T["segs"]}
LN = {}
for L in T["lines"]:
    LN.setdefault(L["seg"], []).append(L)
CLIPS = json.load(open(f"{P}/artifacts/clips.json")) if os.path.exists(f"{P}/artifacts/clips.json") else {}
LIPJ = json.load(open(f"{P}/artifacts/lipsync.json")) if os.path.exists(f"{P}/artifacts/lipsync.json") else {}

_src = open(f"{HERE}/../l2/build_l2.py").read()
exec(_src[_src.index("_src = open"):_src.index("\n\n\ndef at(")])
ICON.update({
 "pause": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M19 16v16M29 16v16"/></svg>',
 "cam": '<svg viewBox="0 0 48 48"><rect x="5" y="14" width="30" height="22" rx="4"/><path d="m35 22 9-5v16l-9-5z"/><circle cx="20" cy="25" r="5"/></svg>',
 "cut": '<svg viewBox="0 0 48 48"><circle cx="13" cy="35" r="5"/><circle cx="35" cy="35" r="5"/><path d="M16 31 36 7M32 31 12 7"/></svg>',
 "cc": '<svg viewBox="0 0 48 48"><rect x="5" y="10" width="38" height="28" rx="5"/><path d="M21 20a4 4 0 1 0 0 8M33 20a4 4 0 1 0 0 8"/></svg>',
 "face": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><circle cx="18" cy="21" r="1.5"/><circle cx="30" cy="21" r="1.5"/><path d="M17 30c4 4 10 4 14 0"/></svg>',
 "lap": '<svg viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="20" rx="2"/><path d="M5 36h38l-3 4H8z"/></svg>',
 "globe2": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c6 6 6 30 0 36M24 6c-6 6-6 30 0 36"/></svg>',
 "dl": '<svg viewBox="0 0 48 48"><path d="M24 6v24M14 20l10 10 10-10M8 40h32"/></svg>',
 "play": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="m20 16 12 8-12 8z"/></svg>',
})


def at(seg, i, frac=0.0, off=0.0):
    L = LN[seg][i]
    return round(L["start"] + (L["end"] - L["start"]) * frac + off, 3)


def ic(name, cls=""):
    return f'<span class="ic {cls}">{ICON[name]}</span>'


def e(t):
    return html.escape(t)


BN = "০১২৩৪৫৬৭৮৯"
bn = lambda n: "".join(BN[int(c)] if c.isdigit() else c for c in str(n))
clips, js, media = [], [], []
SCREEN_T = [(s["start"], s["end"]) for s in T["segs"] if s["kind"] == "screen"]


def rev(sel, t, frm="y:40,opacity:0", d=0.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{d},ease:"{ease}"}},{t:.3f});')


def segclip(sid, inner, track=3, chap=True):
    s = SG[sid]; sc = SC[s["scene"]]
    head = f'<div class="chap"><span class="n">{sc["num"]} / ১০</span><span class="t">{e(sc["title"])}</span></div>' if chap else ""
    cls = " scr" if s["kind"] == "screen" else ""
    clips.append(f'<div id="{sid}" class="clip scene{cls}" data-start="{s["start"]:.3f}" data-duration="{s["end"] - s["start"]:.3f}" data-track-index="{track}">{head}{inner}</div>')
    js.append(f'tl.from("#{sid}",{{opacity:0,duration:.35}},{s["start"]:.3f});')
    js.append(f'tl.to("#{sid}",{{opacity:0,duration:.3}},{s["end"] - .3:.3f});')


LIP = []


def talk(sid_seg, left, top, w, h, tag):
    f = f"assets/talk_{sid_seg}.mp4"
    if not os.path.exists(f"{P}/hf/{f}") or sid_seg not in LIPJ:
        return False
    st = LN[sid_seg][0]["start"]; du = float(LIPJ[sid_seg]["dur"])
    media.append(f'<video id="v{sid_seg}" class="clip talkv" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="8" src="{f}" muted playsinline style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"></video>')
    media.append(f'<div id="o{sid_seg}" class="clip talko" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="12" style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"><div class="lipbadge">AI লিপ-সিঙ্ক</div>{tag}</div>')
    for el in (f"#v{sid_seg}", f"#o{sid_seg}"):
        js.append(f'tl.from("{el}",{{opacity:0,duration:.4}},{st:.3f});'); js.append(f'tl.to("{el}",{{opacity:0,duration:.3}},{st + du - .3:.3f});')
    LIP.append(sid_seg)
    return True


# ------------------------------------------------ live screen segments
CHIPS = {
 "s03a": ["ভূমিকা · ব্যবসা · দর্শক · লক্ষ্য", "দৃশ্যের কাঠামো আপনি দিন · সীমা: ৬০ শব্দ, কোনো দাবি নয়", "আসল উত্তর: সময় · ধারাবর্ণনা · দৃশ্য · হুক · CTA"],
 "s03b": ["ইমেজ ও মোশন প্রম্পট — ইংরেজিতে", "ধারাবর্ণনা আলাদা ব্লকে → পরের ধাপের ইনপুট"],
 "s04b": ["প্রম্পট: স্টাইল · ৯:১৬ · কে · কী করছে · আলো", "Gemini লিখছে SVG কোড = আসল ভেক্টর ছবি"],
 "s04c": ["একই স্টাইল-শব্দ = মানানসই সেট", "যাচাই: অদ্ভুত হাত/বস্তু, লেখা, লোগো"],
 "s05a": ["স্ক্রিপ্ট থেকে এক ক্লিকে ধারাবর্ণনা", "▶ শুনুন — আসল Gemini TTS"],
 "s05b": ["একই লেখা · অন্য কণ্ঠ · তুলনা করুন"],
 "s06a": ["আক্ষরিক নয় · স্বাভাবিক ইংরেজি", "দৈর্ঘ্য প্রায় একই = ডাব আঁটবে"],
 "s06b": ["▶ ইংরেজি ডাব — নতুন রেকর্ডিং ছাড়াই"],
 "s06c": ["ছবি + ভয়েস → কথা বলা অ্যাভাটার (SadTalker)", "শুধু নিজের বা লিখিত অনুমতি আছে এমন মুখ ও কণ্ঠ"],
 "s07a": ["বেশিরভাগ দর্শক সাউন্ড বন্ধ রাখে", "অডিও → SRT: লাইনে ≤ ৩২ অক্ষর"],
 "s07b": ["⚠ AI ভুল: 00:03:100 → 00:00:03,100", "প্রতিটি লাইন অডিওর সাথে মিলিয়ে দেখুন", "বড় · মোটা · উচ্চ কনট্রাস্ট · বাটনের ওপরে"],
 "s08a": ["ট্র্যাক: ছবি · ভয়েস · মিউজিক · সাবটাইটেল", "বাক্য শেষে কাট · ধীর জুম/প্যান · মিউজিক নিচু"],
 "s08b": ["১০৮০×১৯২০ · ৩০ fps · MP4", "এক্সপোর্ট = আসল রেন্ডার"],
}
for sid, seg in SG.items():
    if seg["kind"] != "screen":
        continue
    inner = (f'<div class="monframe"></div><div class="reclbl"><i class="dot"></i>লাইভ স্ক্রিন রেকর্ডিং<br/><b>AI Reel Studio · আসল AI আউটপুট</b></div>'
             f'<div class="stepbig">{e(SC[seg["scene"]]["title"])}</div>'
             f'<div class="tchip" id="{sid}-chip">' + "".join(f'<span id="{sid}-c{k}">{e(c)}</span>' for k, c in enumerate(CHIPS.get(sid, []))) + '</div>')
    segclip(sid, inner, chap=False)
    media.append(f'<video id="vid{sid}" class="clip scrvid" data-start="{seg["start"]:.3f}" data-duration="{seg["end"] - seg["start"]:.3f}" data-track-index="{20 + len(media) % 2}" src="assets/clips/{sid}.mp4" muted playsinline></video>')
    js.append(f'tl.from("#vid{sid}",{{opacity:0,duration:.35}},{seg["start"]:.3f});')
    js.append(f'tl.to("#vid{sid}",{{opacity:0,duration:.3}},{seg["end"] - .3:.3f});')
    ci = CLIPS.get(sid, {})
    if ci.get("play"):
        pa = seg["start"] + ci["play"]["at"]
        media.append(f'<div id="pl{sid}" class="clip playtag" data-start="{pa:.3f}" data-duration="{ci["play"]["len"]:.3f}" data-track-index="13">{ic("audio")}<span>এখন শুনছেন: আসল AI আউটপুট</span><i class="eq"><b></b><b></b><b></b><b></b></i></div>')
        js.append(f'tl.from("#pl{sid}",{{y:-20,opacity:0,duration:.35}},{pa:.3f});')
        js.append(f'tl.to("#pl{sid} .eq b",{{scaleY:.25,duration:.22,stagger:{{each:.07,repeat:{int(ci["play"]["len"] / .44)},yoyo:true}},ease:"sine.inOut"}},{pa:.3f});')
    n = len(CHIPS.get(sid, []))
    for k in range(n):
        t0 = at(sid, min(k, len(LN[sid]) - 1), 0 if k < len(LN[sid]) else .6, .1)
        js.append(f'tl.fromTo("#{sid}-c{k}",{{opacity:0,y:16}},{{opacity:1,y:0,duration:.4,immediateRender:false}},{t0:.3f});')
        if k + 1 < n:
            t1 = at(sid, min(k + 1, len(LN[sid]) - 1), 0 if k + 1 < len(LN[sid]) else .6, -.15)
            js.append(f'tl.to("#{sid}-c{k}",{{opacity:0,duration:.25}},{t1:.3f});')


def practice(sid, task):
    s = SG[sid]
    inner = (f'<div class="pausebig" id="{sid}-p">{ic("pause", "xl")}<div><div class="pt">এখন ভিডিওটি থামান · অনুশীলন করুন</div><div class="pd">{e(task)}</div></div></div>'
             f'<div class="count" id="{sid}-cnt"><span>৫</span><span>৪</span><span>৩</span><span>২</span><span>১</span></div>')
    return inner


def practice_js(sid):
    s = SG[sid]
    rev(f"#{sid}-p", s["start"] + .2, "scale:.85,opacity:0", .5, "back.out(1.6)")
    t0 = s["narr_end"] + .5
    for k in range(5):
        js.append(f'tl.fromTo("#{sid}-cnt span:nth-child({k + 1})",{{opacity:0,scale:1.6}},{{opacity:1,scale:1,duration:.3,immediateRender:false}},{t0 + k * 1.1:.3f});')
        js.append(f'tl.to("#{sid}-cnt span:nth-child({k + 1})",{{opacity:0,duration:.2}},{t0 + k * 1.1 + .85:.3f});')


# ------------------------------------------------ S01 intro
s = "s01a"
old = [("cam", "ক্যামেরা ও শুটিং"), ("mic", "ভয়েস আর্টিস্ট"), ("cut", "ভিডিও এডিটর"), ("clock", "কয়েক দিন")]
new = [("user", "একজন মানুষ"), ("lap", "একটি ল্যাপটপ"), ("spark", "কয়েকটি AI টুল"), ("clock", "এক বিকেল")]
sting_end = at(s, 0, .12) + .5
clips.append(f'<div id="stingc" class="clip" data-start="0" data-duration="{sting_end:.3f}" data-track-index="6" style="left:0;top:0;width:1920px;height:1080px"><div id="sting"><div class="k">PRACTICAL AI MASTERCLASS</div><div class="num">০৬</div><div class="t">Video, Audio &amp; Production</div></div></div>')
segclip(s, '<div class="vs l" id="s01L"><div class="vh">আগে</div>' + "".join(f'<div class="vr">{ic(i)}<span>{t}</span></div>' for i, t in old) + '<i class="strike"></i></div>'
           '<div class="vs r" id="s01R"><div class="vh">এখন</div>' + "".join(f'<div class="vr">{ic(i)}<span>{t}</span></div>' for i, t in new) + '</div>', chap=False)
js.append('tl.from("#sting .num",{scale:.4,opacity:0,duration:.6,ease:"back.out(2)"},0.1);tl.from("#sting .k",{y:-20,opacity:0,duration:.5},0.2);tl.from("#sting .t",{y:20,opacity:0,duration:.5},0.35);')
js.append(f'tl.to("#sting",{{opacity:0,y:-40,duration:.5}},{at(s, 0, .12):.3f});')
rev("#s01L", at(s, 0, .15), "x:-60,opacity:0", .6)
js.append(f'tl.from("#s01L .vr",{{x:-30,opacity:0,stagger:.35,duration:.35}},{at(s, 0, .25):.3f});')
js.append(f'tl.fromTo("#s01L .strike",{{scaleX:0}},{{scaleX:1,duration:.5,immediateRender:false}},{at(s, 1, 0, -.1):.3f});')
rev("#s01R", at(s, 1, .05), "x:60,opacity:0", .6)
js.append(f'tl.from("#s01R .vr",{{x:30,opacity:0,stagger:.35,duration:.35}},{at(s, 1, .15):.3f});')

s = "s01b"
segclip(s, '<div class="photo big" id="s01ph"><img src="assets/presenter.jpg" alt=""/></div>'
           '<div id="s01name"><div class="hi">আসসালামু আলাইকুম</div><div class="nm">Rubel Miah</div><div class="nmb">রুবেল মিয়া · ইন্সট্রাক্টর</div><i class="bar"></i>'
           '<div class="modb"><span>MODULE ০৬</span>Video, Audio &amp; Production</div><div class="sub2">স্ক্রিপ্ট থেকে সম্পূর্ণ সোশ্যাল রিল — হাতে-কলমে</div></div>', chap=False)
rev("#s01ph", SG[s]["start"] + .1, "x:-60,opacity:0", .6)
js.append(f'tl.from("#s01name > *",{{x:40,opacity:0,stagger:.18,duration:.5}},{SG[s]["start"] + .3:.3f});')
js.append(f'tl.fromTo("#s01name .bar",{{scaleX:0}},{{scaleX:1,duration:.6,immediateRender:false}},{SG[s]["start"] + .9:.3f});')
talk("s01b", 80, 150, 640, 760, '<div class="ntag"><b>Rubel Miah</b><span>Instructor · Practical AI Masterclass</span></div>')

s = "s01c"
learn = ["Text/image-to-video", "AI avatar ও short-form video", "Voice generation ও dubbing", "Subtitle ও video editing"]
segclip(s, '<div class="modcard" id="s01m"><div class="mh"><span class="mn">06</span><div><div class="mt">Video, Audio &amp; Production</div><div class="ms">AI দিয়ে ভিডিও, ভয়েস ও multimedia</div></div></div>'
           '<div class="ml">এই MODULE-এ যা শিখবেন</div><div class="mchips">' + "".join(f'<span id="s01k{k}">{e(t)}</span>' for k, t in enumerate(learn)) + '</div>'
           '<div class="mout" id="s01o"><span class="st">✦</span><div><div class="mo1">যা হাতে পাবেন</div><div class="mo2">' +
           " → ".join(f'<b id="s01p{k}">{t}</b>' for k, t in enumerate(["Script", "image", "voice", "video", "subtitle", "একটি সম্পূর্ণ social reel"])) + '</div></div></div></div>'
           f'<div id="s01live" class="card">{ic("check", "gr")}<span>সব ডেমো আসল AI দিয়ে লাইভ রেকর্ড — Google Gemini ও ওপেন-সোর্স টুল</span></div>')
rev("#s01m", SG[s]["start"] + .15, "y:40,opacity:0", .6)
for k in range(4):
    js.append(f'tl.from("#s01k{k}",{{scale:.7,opacity:0,duration:.35,ease:"back.out(2)"}},{at(s, 0, .3 + k * .17):.3f});')
rev("#s01o", at(s, 1, 0, -.1), "y:30,opacity:0")
for k in range(6):
    js.append(f'tl.from("#s01p{k}",{{opacity:.15,duration:.3}},{at(s, 1, .2 + k * .12):.3f});')
rev("#s01live", at(s, 2, .05), "y:30,opacity:0")

# ------------------------------------------------ S02 pipeline + project
s = "s02a"
pipe = [("doc", "স্ক্রিপ্ট"), ("image", "ছবি"), ("mic", "ভয়েস"), ("video", "ভিডিও"), ("cc", "সাবটাইটেল"), ("dl", "এডিট ও এক্সপোর্ট")]
segclip(s, '<div class="pipe6">' + "".join(f'<div class="pn" id="s02n{k}"><b>{bn(k + 1)}</b>{ic(i, "lg")}<span>{t}</span></div>' + ('<i class="pa"></i>' if k < 5 else '') for k, (i, t) in enumerate(pipe)) + '</div>'
           '<div class="card" id="s02io"><b>আউটপুট → পরের ধাপের ইনপুট</b><span>স্ক্রিপ্ট যত পরিষ্কার, পরের সব ধাপ তত সহজ</span></div>')
js.append(f'tl.from("#s02a .pn",{{y:40,opacity:0,stagger:.45,duration:.4}},{at(s, 0, .25):.3f});')
js.append(f'tl.from("#s02a .pa",{{scaleX:0,transformOrigin:"0 50%",stagger:.45,duration:.3}},{at(s, 0, .3):.3f});')
rev("#s02io", at(s, 1, .05), "y:30,opacity:0")
js.append(f'tl.to("#s02n0",{{boxShadow:"0 0 0 4px #facc15, 0 0 50px rgba(250,204,21,.5)",duration:.4}},{at(s, 1, .4):.3f});')
s = "s02b"
segclip(s, f'<div class="card" id="s02p"><div class="leaf"></div><div><div class="lbl">আমাদের প্রজেক্ট (কাল্পনিক)</div><div class="h">সবুজ পাতা · সিলেটের অনলাইন চা-দোকান</div>'
           '<div class="pd2">ফেসবুক পেজের জন্য ৩০ সেকেন্ডের রিল · ৯:১৬ · দর্শক: ঢাকার চাকরিজীবী তরুণ-তরুণী</div></div></div>'
           f'<div class="card" id="s02e">{ic("shield", "lg")}<div><div class="h" style="font-size:34px">দুটি নিয়ম</div><div class="rule">১. অনুমতি ছাড়া কারো মুখ বা কণ্ঠ নকল নয়</div><div class="rule">২. AI-তে বানানো কনটেন্ট হলে প্ল্যাটফর্মে জানান</div></div></div>')
rev("#s02p", at(s, 0, .05), "y:40,opacity:0", .6)
rev("#s02e", at(s, 1, .05), "y:40,opacity:0", .6)
js.append(f'tl.from("#s02e .rule",{{x:-30,opacity:0,stagger:.6,duration:.35}},{at(s, 1, .3):.3f});')

# ------------------------------------------------ practice segments
s = "s03c"; segclip(s, practice(s, "নিজের বা পরিচিত ব্যবসার জন্য একই কাঠামোয় ৩০ সেকেন্ডের রিল স্ক্রিপ্ট প্রম্পট — দৃশ্যগুলো নিজে ঠিক করে দিন")); practice_js(s)
s = "s05c"
segclip(s, practice(s, "নিজের স্ক্রিপ্ট দুটি কণ্ঠে জেনারেট করে শুনে তুলনা করুন") +
        '<div class="tips3">' + "".join(f'<div class="card tip" id="s05t{k}"><b>{bn(k + 1)}</b>{t}</div>' for k, t in enumerate(["দাঁড়ি-কমা দিয়ে বিরতি", "সংখ্যা কথায় লিখুন", "পুরোটা শুনে উচ্চারণ যাচাই", "স্টাইল নির্দেশনা ইংরেজিতে দিন"])) + '</div>')
practice_js(s); js.append(f'tl.from("#s05c .tip",{{y:30,opacity:0,stagger:.5,duration:.35}},{at(s, 0, .1):.3f});')
s = "s07c"; segclip(s, practice(s, "নিজের ভয়েস ফাইলের সাবটাইটেল বানিয়ে অন্তত তিনটি লাইন অডিওর সাথে মিলিয়ে দেখুন")); practice_js(s)

# ------------------------------------------------ S04a tools + prompt anatomy
s = "s04a"
tools = [("image", "টেক্সট → ছবি", "Gemini · ChatGPT · Ideogram"), ("play", "ছবি → ভিডিও", "Kling · Runway · Veo"), ("video", "টেক্সট → ভিডিও", "Veo · Sora · Kling")]
anat = [("বিষয়", "চা-বাগান"), ("কী ঘটছে", "পাতা তোলা"), ("ক্যামেরা", "ধীরে সামনে"), ("আলো", "ভোরের নরম আলো"), ("স্টাইল", "ফ্ল্যাট ইলাস্ট্রেশন"), ("সময়", "৫ সেকেন্ড")]
segclip(s, '<div class="tools3">' + "".join(f'<div class="card tool" id="s04t{k}">{ic(i, "lg")}<div class="h" style="font-size:34px">{a}</div><div class="pd2">{b}</div></div>' for k, (i, a, b) in enumerate(tools)) + '</div>'
           '<div class="anat" id="s04an"><div class="lbl">ভিডিও প্রম্পটের ৬টি অংশ</div><div class="arow6">' + "".join(f'<div class="ap" id="s04p{k}"><b>{a}</b><span>{b}</span></div>' for k, (a, b) in enumerate(anat)) + '</div></div>'
           f'<div class="card" id="s04h">{ic("alert", "lg am")}<div><div class="h" style="font-size:32px">সৎ কথা</div><div class="pd2">ফ্রি API-তে ছবি ও ভিডিও মডেল বন্ধ — তাই ভুয়া ডেমো নয়।<br/>বদলে: Gemini দিয়ে ভেক্টর ছবি + এডিটরে মোশন।</div></div></div>')
for k in range(3): rev(f"#s04t{k}", at(s, 0, .1 + k * .28), "y:40,opacity:0")
js.append(f'tl.to("#s04a .tools3",{{y:-60,scale:.8,opacity:.0,duration:.5}},{at(s, 1, 0, -.3):.3f});')
rev("#s04an", at(s, 1, 0), "y:40,opacity:0")
for k in range(6): js.append(f'tl.from("#s04p{k}",{{y:30,opacity:0,duration:.35}},{at(s, 1, .08 + k * .1):.3f});')
rev("#s04h", at(s, 2, .02), "y:40,opacity:0")

# ------------------------------------------------ S09 reel + checklist
s = "s09a"; sg = SG[s]
reel_at = LN[s][-1]["end"] + 0.4
segclip(s, '<div class="credits6" id="s09cr">' + "".join(f'<div class="cr" id="s09c{k}"><b>{a}</b><span>{b}</span></div>' for k, (a, b) in enumerate([
    ("স্ক্রিপ্ট", "Gemini (চ্যাট)"), ("ছবি", "Gemini · SVG ভেক্টর"), ("ভয়েস", "Gemini TTS · Aoede"), ("সাবটাইটেল", "Gemini + ফরম্যাট যাচাই"), ("মোশন ও এডিট", "জুম/প্যান · HyperFrames"), ("মিউজিক", "নিজস্ব সিন্থেসাইজড")])) + '</div>'
           '<div class="phone" id="s09ph"><div class="notch"></div></div><div class="reeltag" id="s09tg">সবুজ পাতা · ৩০ সেকেন্ডের রিল · শব্দসহ</div>')
media.append(f'<video id="reelv" class="clip reelv" data-start="{reel_at:.3f}" data-duration="{sg["end"] - reel_at - .2:.3f}" data-track-index="22" src="assets/reel_final.mp4" muted playsinline></video>')
rev("#s09ph", sg["start"] + .1, "y:60,opacity:0", .6)
js.append(f'tl.from("#reelv",{{opacity:0,duration:.4}},{reel_at:.3f});tl.to("#reelv",{{opacity:0,duration:.3}},{sg["end"] - .5:.3f});')
js.append(f'tl.from("#s09cr .cr",{{x:-40,opacity:0,stagger:.5,duration:.4}},{reel_at + 1:.3f});')
s = "s09b"
chk = ["তথ্য ও দাবি সঠিক?", "সাবটাইটেলের বানান", "ভয়েসের উচ্চারণ", "মিউজিক ব্যবহারের অনুমতি", "AI কনটেন্টের লেবেল"]
segclip(s, '<div class="card" id="s09k"><div class="lbl">পোস্ট করার আগে ৫টি যাচাই</div>' + "".join(f'<div class="ck2"><i class="box"></i>{t}</div>' for t in chk) + '</div>'
           f'<div class="card" id="s09m">{ic("heart", "lg")}<div class="h" style="font-size:34px">AI খসড়া বানায় দ্রুত —<br/>গল্প, রুচি আর শেষ সিদ্ধান্ত আপনার</div></div>')
rev("#s09k", at(s, 0, 0, -.2), "y:40,opacity:0")
js.append(f'tl.from("#s09k .ck2",{{x:-30,opacity:0,stagger:.9,duration:.35}},{at(s, 0, .15):.3f});')
rev("#s09m", at(s, 1, .05), "x:60,opacity:0")

# ------------------------------------------------ S10 quiz / assignment / outro
s = "s10a"
qa = [("ভিডিও প্রম্পটে কোন ছয়টি জিনিস বলা উচিত?", "বিষয় · কী ঘটছে · ক্যামেরা · আলো · স্টাইল · সময়"),
      ("ডাবিং-এর অনুবাদে দৈর্ঘ্য প্রায় একই রাখতে বলি কেন?", "নতুন ভয়েসকে পুরোনো ভিডিওর সময়ে আঁটতে হয়"),
      ("কারো ছবি দিয়ে AI অ্যাভাটার বানানোর আগে কী লাগবে?", "সেই মানুষের স্পষ্ট, লিখিত অনুমতি")]
segclip(s, "".join(f'<div class="card quiz" id="s10q{k}"><div class="qn">প্রশ্ন {bn(k + 1)}</div><div class="qq">{e(q)}</div><div class="qt" id="s10t{k}">ভাবুন… <i class="tbar3"></i></div><div class="qa" id="s10a{k}">{ic("check", "gr")} {e(a)}</div></div>' for k, (q, a) in enumerate(qa)))
for k in range(3):
    qs, an = at(s, 2 * k, 0, -.2), at(s, 2 * k + 1, 0, -.15)
    js.append(f'tl.fromTo("#s10q{k}",{{opacity:0,y:40}},{{opacity:1,y:0,duration:.45,immediateRender:false}},{qs:.3f});')
    js.append(f'tl.fromTo("#s10t{k} .tbar3",{{scaleX:1}},{{scaleX:0,duration:{max(1, an - qs - 2.5):.2f},ease:"none",immediateRender:false}},{qs + 2.2:.3f});')
    js.append(f'tl.to("#s10t{k}",{{opacity:0,duration:.2}},{an - .1:.3f});')
    js.append(f'tl.fromTo("#s10a{k}",{{opacity:0,scale:.8}},{{opacity:1,scale:1,duration:.4,ease:"back.out(2)",immediateRender:false}},{an:.3f});')
    if k < 2: js.append(f'tl.to("#s10q{k}",{{opacity:0,duration:.3}},{at(s, 2 * k + 2, 0, -.5):.3f});')
s = "s10b"
items = ["স্ক্রিপ্ট", "তিনটি ছবি", "ভয়েস", "সাবটাইটেল", "এক্সপোর্ট করা ৩০ সেকেন্ডের রিল", "কোথায় AI-এর আউটপুট বদলেছেন — আর কেন"]
segclip(s, '<div class="card" id="s10as"><div class="lbl am">ফাইনাল অ্যাসাইনমেন্ট · নিজের প্রথম AI রিল</div>' + "".join(f'<div class="ck2"><i class="box"></i>{t}</div>' for t in items) + '</div>')
rev("#s10as", at(s, 0, 0, -.2), "y:40,opacity:0")
js.append(f'tl.from("#s10as .ck2",{{x:-30,opacity:0,stagger:.7,duration:.35}},{at(s, 0, .2):.3f});')
s = "s10c"
segclip(s, '<div class="photo big" id="s10ph"><img src="assets/presenter.jpg" alt=""/></div>'
           '<div id="s10out"><div class="hi">ধন্যবাদ!</div><div class="nm">Rubel Miah</div><div class="nmb">ইন্সট্রাক্টর · Practical AI Masterclass</div><i class="bar"></i>'
           '<div class="sub2">আজ বানালাম: স্ক্রিপ্ট → ছবি → ভয়েস → ভিডিও → সাবটাইটেল → রিল</div><div class="modb"><span>পরের ক্লাসে</span>দেখা হবে · প্র্যাকটিস চালিয়ে যান</div></div>', chap=False)
rev("#s10ph", SG[s]["start"] + .1, "x:-60,opacity:0", .6)
js.append(f'tl.from("#s10out > *",{{x:40,opacity:0,stagger:.18,duration:.5}},{SG[s]["start"] + .3:.3f});')
js.append(f'tl.fromTo("#s10out .bar",{{scaleX:0}},{{scaleX:1,duration:.6,immediateRender:false}},{SG[s]["start"] + .9:.3f});')
talk("s10c", 80, 150, 640, 760, '<div class="ntag"><b>Rubel Miah</b><span>Instructor · Practical AI Masterclass</span></div>')

# chapter flashes
flash = []
for sc in T["scenes"][1:]:
    fs, fe = sc["start"], sc["narr_start"] - .12
    flash.append(f'<div id="f{sc["id"]}" class="clip flash" data-start="{fs:.3f}" data-duration="{fe - fs:.3f}" data-track-index="7"><span class="fn">{sc["num"]}</span><span class="ft">{e(sc["title"])}</span><span class="fl"></span></div>')
    js.append(f'tl.from("#f{sc["id"]} .fn",{{scale:.6,opacity:0,duration:.45,ease:"back.out(2)"}},{fs:.3f});')
    js.append(f'tl.from("#f{sc["id"]} .ft",{{y:30,opacity:0,duration:.45}},{fs + .15:.3f});')
    js.append(f'tl.fromTo("#f{sc["id"]} .fl",{{scaleX:0}},{{scaleX:1,duration:.6}},{fs + .2:.3f});')
    js.append(f'tl.to("#f{sc["id"]}",{{opacity:0,duration:.3}},{fe - .3:.3f});')

is_kw = lambda t: bool(re.search(r"[A-Za-z0-9০-৯]", t.strip("।?!,—'\"")))
caps = []
for i, c in enumerate(T["cues"]):
    spans = " ".join(f'<span class="{"kw" if is_kw(w) else ""}">{e(w)}</span>' for w in c["text"].split())
    st, du = c["start"] - .05, c["end"] - c["start"] + .05
    scr = any(a <= c["start"] < b for a, b in SCREEN_T)
    caps.append(f'<div id="cap{i}" class="clip cap{" capscr" if scr else ""}" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{10 + i % 2}"><div class="capbox">{spans}</div></div>')
    js.append(f'tl.from("#cap{i} .capbox",{{opacity:0,duration:.15}},{st:.3f});')

CSS = open(f"{HERE}/style_l6_base.css").read() + open(f"{HERE}/style_l6_extra.css").read()
page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/>
<title>Module 06 — Video, Audio &amp; Production</title><script src="assets/gsap.min.js"></script><style>{CSS}</style></head><body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
<div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"><div class="bgfill"></div><div id="grid" class="grid"></div><div id="orb1" class="orb o1"></div><div id="orb2" class="orb o2"></div><div id="orb3" class="orb o3"></div></div>
<div id="topbar" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1"><div class="brand"><span class="dot"></span>PRACTICAL AI MASTERCLASS · MODULE 06<span class="pill">বাংলা</span></div><div class="lesson">ভিডিও, অডিও ও প্রোডাকশন · ইন্সট্রাক্টর: রুবেল মিয়া</div></div>
<div id="prog" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><i id="progfill"></i></div>
{''.join(clips)}{''.join(media)}{''.join(flash)}{''.join(caps)}
<div id="endc" class="clip endc" data-start="{DUR - 4.0:.3f}" data-duration="4.0" data-track-index="9"><div class="brand" style="font-size:44px"><span class="dot"></span>PRACTICAL AI MASTERCLASS</div>
<div class="sub">মডিউল ০৬ সম্পন্ন · Video, Audio &amp; Production</div>
<div class="credits" id="credits"><div><span>ইন্সট্রাক্টর</span><b>Rubel Miah</b></div><i></i><div><span>ভিডিও এডিটর</span><b>Paloan</b></div></div></div>
</div><script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{paused:true}});
tl.to("#orb1",{{x:220,y:120,duration:{DUR / 6:.2f},ease:"sine.inOut",yoyo:true,repeat:5}},0);
tl.to("#orb2",{{x:-200,y:-140,duration:{DUR / 6:.2f},ease:"sine.inOut",yoyo:true,repeat:5}},0);
tl.fromTo("#grid",{{x:0}},{{x:-96,duration:{DUR:.2f},ease:"none"}},0);
tl.from("#topbar",{{y:-40,opacity:0,duration:.6}},0.4);
tl.fromTo("#progfill",{{scaleX:0}},{{scaleX:1,duration:{DUR:.2f},ease:"none"}},0);
{chr(10).join(js)}
tl.from("#endc",{{opacity:0,duration:.5}},{DUR - 4.0:.3f});
tl.from("#credits > *",{{y:20,opacity:0,stagger:.15,duration:.5}},{DUR - 3.6:.3f});
window.__timelines["main"] = tl;
</script></body></html>"""
open(f"{P}/hf/index.html", "w").write(page)
json.dump(LIP, open(f"{P}/artifacts/lipsync_scenes.json", "w"))
print("wrote", len(page), "dur", DUR, "lip", LIP, "screen", len(SCREEN_T))

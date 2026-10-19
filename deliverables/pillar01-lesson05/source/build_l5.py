"""HyperFrames 16:9 composition for PILLAR 01 · Lesson 05 — AI for Everyday Productivity (Instructor: Rubel Miah)."""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from l5_script import SEGS, SCENES, MEETING, DOC

P = "/home/user/test/projects/pillar01-lesson05"
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
SG = {s["id"]: s for s in T["segs"]}
LN = {}
for L in T["lines"]:
    LN.setdefault(L["seg"], []).append(L)

_src = open(f"{HERE}/../l2/build_l2.py").read()
exec(_src[_src.index("_src = open"):_src.index("\n\n\ndef at(")])
ICON.update({
 "pause": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M19 16v16M29 16v16"/></svg>',
 "cal": '<svg viewBox="0 0 48 48"><rect x="7" y="10" width="34" height="31" rx="4"/><path d="M7 19h34M16 6v8M32 6v8"/></svg>',
 "folder": '<svg viewBox="0 0 48 48"><path d="M5 12h14l4 5h20v22H5z"/></svg>',
 "bulb": '<svg viewBox="0 0 48 48"><path d="M17 30c-4-3-6-7-6-11a13 13 0 0 1 26 0c0 4-2 8-6 11v5H17z"/><path d="M18 40h12"/></svg>',
 "q": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M18 19a6 6 0 1 1 9 5c-2 1-3 2-3 4M24 34v1"/></svg>',
})


def at(seg, i, frac=0.0, off=0.0):
    L = LN[seg][i]
    return round(L["start"] + (L["end"] - L["start"]) * frac + off, 3)


def ic(name, cls=""):
    return f'<span class="ic {cls}">{ICON[name]}</span>'


def e(t):
    return html.escape(t)


BN = "০১২৩৪৫৬৭৮৯"
bn = lambda n: "".join(BN[int(c)] for c in str(n))
clips, js, media = [], [], []


def rev(sel, t, frm="y:40,opacity:0", d=0.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{d},ease:"{ease}"}},{t:.3f});')


def segclip(sid, inner, track=3):
    s = SG[sid]
    sc = SC[s["scene"]]
    head = f'<div class="chap"><span class="n">{sc["num"]} / ১০</span><span class="t">{e(sc["title"])}</span></div>'
    clips.append(f'<div id="{sid}" class="clip scene{' scr' if s['kind'] == 'screen' else ''}" data-start="{s["start"]:.3f}" data-duration="{s["end"] - s["start"]:.3f}" data-track-index="{track}">{head}{inner}</div>')
    js.append(f'tl.from("#{sid}",{{opacity:0,duration:.35}},{s["start"]:.3f});')
    js.append(f'tl.to("#{sid}",{{opacity:0,duration:.3}},{s["end"] - .3:.3f});')


LIP = []


def talk(sid_seg, left, top, w, h, tag, line0=0):
    f = f"assets/talk_{sid_seg}.mp4"
    if not os.path.exists(f"{P}/hf/{f}"):
        return False
    Ls = LN[sid_seg]; st = Ls[line0]["start"]; du = float(json.load(open(f"{P}/artifacts/lipsync.json"))[sid_seg]["dur"])
    media.append(f'<video id="v{sid_seg}" class="clip talkv" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="8" src="{f}" muted playsinline style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"></video>')
    media.append(f'<div id="o{sid_seg}" class="clip talko" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="12" style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"><div class="lipbadge">AI লিপ-সিঙ্ক</div><div class="tag">{tag}</div></div>')
    for el in (f"#v{sid_seg}", f"#o{sid_seg}"):
        js.append(f'tl.from("{el}",{{opacity:0,duration:.4}},{st:.3f});'); js.append(f'tl.to("{el}",{{opacity:0,duration:.3}},{st + du - .3:.3f});')
    js.append(f'tl.set("#v{sid_seg}",{{opacity:0}},{st + du:.3f});')
    LIP.append(sid_seg)
    return True


# ------------------------------------------------ teaching-point chips per screen segment (one per narration line)
CHIPS = {
 "s02b": ["ভূমিকা + আমি কে + কী চাই", "ধাপে ধাপে ব্যাখ্যা · উদাহরণ · অনুশীলনী প্রশ্ন"],
 "s02c": ["ফলো-আপ: গল্প + কুইজ", "বোঝাই আসল · পাঠ্যবইয়ের সাথে মিলিয়ে নিন"],
 "s03b": ["নির্দিষ্ট কলাম + 'অনুমান করবে না'", "নাম নেই → Unassigned · Deadline শুধু শুক্রবার"],
 "s03c": ["অগ্রাধিকার + অনুপস্থিত তথ্য", "অগ্রাধিকার AI-এর প্রস্তাব — সিদ্ধান্ত আপনার", "ভুল: অনুমান নিষেধ না করা"],
 "s04b": ["দুর্বল প্রম্পট → AI প্রশ্ন করে / সাধারণ খসড়া"],
 "s04c": ["প্রাপক · সময় · কারণ · টোন · অংশ", "Subject · Greeting · Message · Closing"],
 "s04d": ["ফলো-আপ: আরও সংক্ষিপ্ত ও বিনয়ী", "পাঠানোর আগে: সময়, তারিখ, নাম যাচাই"],
 "s05b": ["তথ্য + গ্রাহক + লক্ষ্য + ৭টি অংশ", "হুক · ক্যাপশন · ভিজ্যুয়াল · CTA · ফরম্যাট", "দাম/অফার নেই — তবুও যাচাই করুন"],
 "s05c": ["ফলো-আপ: Day 01 → ২০ সেকেন্ডের রিল", "ক্যালেন্ডার থেকে শুটিং-স্ক্রিপ্ট"],
 "s06b": ["৫টি আইডিয়া · ৭টি অংশ", "দর্শকের সমস্যা দিয়ে শুরু", "একটি বেছে নিন"],
 "s06c": ["৬০ সেকেন্ডের স্ক্রিপ্ট: সময় · ধারাবর্ণনা · স্ক্রিন", "দৃশ্য · সময় · ধারাবর্ণনা · ভিজ্যুয়াল", "টুলের তথ্য রেকর্ডিংয়ের আগে যাচাই", "ভুল: স্ক্রিপ্ট হুবহু পড়া"],
 "s07b": ["কাঠামো + 'নতুন তথ্য যোগ নয়'", "সারাংশ ≠ সত্য যাচাই"],
 "s07c": ["প্রতিটি দাবির পাশে মূল বাক্য", "উদ্ধৃতি নিজে খুঁজে মিলিয়ে নিন", "ভুল: সারাংশকে মূল লেখার বদলে ব্যবহার"],
 "s08b": ["সময়সীমা · বিরতি · শুরু/শেষ · অগ্রাধিকার", "৪.৫ ঘণ্টা কাজ + ০.৫ ঘণ্টা বিরতি = ৫ ঘণ্টা", "সময়ের হিসাব নিজে যাচাই"],
 "s09b": ["মাস্টার প্রম্পট: ৬টি অংশ", "আইডিয়া → ক্যাপশন → ছবি → রিল", "যাচাই চেকলিস্ট: স্টক, সময়, তথ্য"],
}

CLIPS = json.load(open(f"{P}/artifacts/clips.json")) if os.path.exists(f"{P}/artifacts/clips.json") else {}
for sid, seg in SG.items():
    if seg["kind"] != "screen":
        continue
    clipf = f"assets/clips/{sid}.mp4"
    inner = (f'<div class="monframe"></div><div class="reclbl"><i class="dot"></i>লাইভ স্ক্রিন রেকর্ডিং · Google Gemini · আসল AI উত্তর</div>'
             f'<div class="tchip" id="{sid}-chip">' + "".join(f'<span id="{sid}-c{k}">{e(c)}</span>' for k, c in enumerate(CHIPS.get(sid, []))) + '</div>')
    segclip(sid, inner)
    media.append(f'<video id="vid{sid}" class="clip monvid" data-start="{seg["start"]:.3f}" data-duration="{seg["end"] - seg["start"]:.3f}" data-track-index="{20 + len(media) % 2}" src="{clipf}" muted playsinline></video>')
    js.append(f'tl.from("#vid{sid}",{{opacity:0,duration:.35}},{seg["start"]:.3f});')
    js.append(f'tl.to("#vid{sid}",{{opacity:0,duration:.3}},{seg["end"] - .3:.3f});')
    js.append(f'tl.set("#vid{sid}",{{opacity:0}},{seg["end"]:.3f});')
    ci = CLIPS.get(sid)
    if ci and ci["hold"] > 2:                                   # slow push-in while the finished answer is held for reading
        h0 = seg["start"] + ci["dur"] - ci["hold"]
        js.append(f'tl.fromTo("#vid{sid}",{{scale:1}},{{scale:1.06,transformOrigin:"50% 35%",duration:{ci["hold"]:.2f},ease:"sine.inOut",immediateRender:false}},{h0:.3f});')
    for k in range(len(CHIPS.get(sid, []))):
        if k < len(LN[sid]):
            t0 = at(sid, k, 0, .1)
            js.append(f'tl.fromTo("#{sid}-c{k}",{{opacity:0,y:16}},{{opacity:1,y:0,duration:.4,immediateRender:false}},{t0:.3f});')
            if k + 1 < len(CHIPS[sid]) and k + 1 < len(LN[sid]):
                js.append(f'tl.to("#{sid}-c{k}",{{opacity:0,duration:.25}},{at(sid, k + 1, 0, -.15):.3f});')

# ------------------------------------------------ animated segments
def card(cls, inner, idattr=""):
    return f'<div class="card {cls}" {idattr}>{inner}</div>'


def practice(sid, task):
    s = SG[sid]
    inner = (f'<div class="pausebig" id="{sid}-p">{ic("pause", "xl")}<div><div class="pt">এখন ভিডিওটি থামান · অনুশীলন করুন</div><div class="pd">{e(task)}</div></div></div>'
             f'<div class="count" id="{sid}-cnt"><span>৫</span><span>৪</span><span>৩</span><span>২</span><span>১</span></div>')
    segclip(sid, inner)
    rev(f"#{sid}-p", s["start"] + .2, "scale:.85,opacity:0", .5, "back.out(1.6)")
    t0 = s["narr_end"] + .5
    for k in range(5):
        js.append(f'tl.fromTo("#{sid}-cnt span:nth-child({k + 1})",{{opacity:0,scale:1.6}},{{opacity:1,scale:1,duration:.3,immediateRender:false}},{t0 + k * 1.1:.3f});')
        js.append(f'tl.to("#{sid}-cnt span:nth-child({k + 1})",{{opacity:0,duration:.2}},{t0 + k * 1.1 + .85:.3f});')


# S01a hook
s = "s01a"
probs = [("book", "শিক্ষার্থী", "পড়ার নোট গুছাতে পারছে না"), ("mail", "অফিস কর্মী", "লম্বা ইমেইল লিখতে হবে"), ("shop", "ব্যবসায়ী", "ফেসবুক কনটেন্ট বানাতে হবে")]
inner = ('<div class="probs">' + "".join(f'<div class="card prob" id="s01p{k}">{ic(i, "lg")}<div class="pt2">{t}</div><div class="pd2">{e(d)}</div><div class="stress">⏱ সময় শেষ!</div></div>' for k, (i, t, d) in enumerate(probs)) + '</div>'
         '<div id="s01ws" class="card"><div class="lbl">AI-সহায়ক ওয়ার্কস্পেস</div><div class="wsrow"><span class="chip">প্রথম খসড়া</span><span class="chip">তথ্য গোছানো</span><span class="chip">পরিকল্পনা</span></div></div>'
         '<div id="s01title"><div class="k">PILLAR 01 — LESSON 05</div><div class="big">AI FOR EVERYDAY PRODUCTIVITY</div><div class="sub">দৈনন্দিন কাজে AI · হাতে-কলমে</div></div>'
         '<div class="photo" id="s01ph"><img src="assets/presenter.jpg" alt=""/><div class="tag">রুবেল মিয়া · ইন্সট্রাক্টর</div></div>'
         f'<div id="s01live" class="card">{ic("check", "gr")}<span>সব ডেমো আসল AI-এর সাথে লাইভ রেকর্ড · Google Gemini<br/><small>ChatGPT-তে একই প্রম্পটের উত্তর কিছুটা আলাদা হবে</small></span></div>')
segclip(s, inner)
for k in range(3): rev(f"#s01p{k}", at(s, 0, .05 + k * .3), "y:60,opacity:0", .55)
js.append(f'tl.from("#s01a .stress",{{scale:0,opacity:0,stagger:.2,duration:.35,ease:"back.out(3)"}},{at(s, 1, .1):.3f});')
js.append(f'tl.to("#s01a .probs",{{opacity:0,y:-40,duration:.5}},{at(s, 2, 0, -.2):.3f});')
rev("#s01ws", at(s, 2, .05), "scale:.8,opacity:0", .6, "back.out(1.6)")
js.append(f'tl.to("#s01ws",{{opacity:0,duration:.4}},{at(s, 3, 0, -.2):.3f});')
rev("#s01title", at(s, 3, .05), "y:40,opacity:0", .7)
rev("#s01ph", at(s, 4, 0, -.3), "x:-60,opacity:0", .6)
rev("#s01live", at(s, 5, .05), "y:30,opacity:0")
talk("s01a", 83, 239, 554, 604, "রুবেল মিয়া · ইন্সট্রাক্টর", line0=4)

# S02a student problem
s = "s02a"
segclip(s, f'<div class="card problem" id="s02x">{ic("book", "xl")}<div><div class="lbl">বাস্তব সমস্যা</div><div class="h">অষ্টম শ্রেণির শিক্ষার্থী · “Photosynthesis বুঝতে পারছি না”</div>'
           f'<div class="why"><b>কেন জরুরি:</b> বইয়ের ভাষা কঠিন, পরীক্ষা কাছে — না বুঝে মুখস্থ করলে মনে থাকে না</div></div></div>')
rev("#s02x", at(s, 0, .05), "y:50,opacity:0", .6)
practice("s02d", "নিজের পাঠ্যবইয়ের একটি কঠিন বিষয় বেছে নিয়ে একই ধাঁচের প্রম্পটে AI-কে বোঝাতে বলুন")

# S03a messy notes
s = "s03a"
segclip(s, f'<div class="card note" id="s03n"><div class="lbl">এলোমেলো মিটিং নোট (কাল্পনিক)</div><div class="hand">{e(MEETING)}</div></div>'
           f'<div class="arrowbig" id="s03ar">→</div><div class="card" id="s03t">{ic("feed", "xl")}<div class="h" style="font-size:34px">গোছানো Action Plan</div><div class="pd2">Task · Priority · দায়িত্ব · Deadline · Next Step</div></div>')
rev("#s03n", at(s, 0, .05), "x:-60,opacity:0", .6); rev("#s03ar", at(s, 0, .5), "x:-30,opacity:0", .4); rev("#s03t", at(s, 0, .6), "x:60,opacity:0", .6)

# S04a reschedule
s = "s04a"
segclip(s, f'<div class="card problem" id="s04x">{ic("cal", "xl")}<div><div class="lbl">বাস্তব সমস্যা</div><div class="h">টিম মিটিং: বৃহস্পতিবার <s>সকাল ১০:০০</s> → <b class="am">বিকেল ৩:০০</b></div>'
           f'<div class="why"><b>কেন জরুরি:</b> ম্যানেজারকে ভদ্রভাবে, পরিষ্কার করে, সময়মতো জানাতে হবে</div></div></div>')
rev("#s04x", at(s, 0, .05), "y:50,opacity:0", .6)

# S05a business sheet
s = "s05a"
rows = [("Business", "Local clothing store"), ("Location", "Dhaka"), ("Product", "Cotton T-shirts"), ("Audience", "Students and young professionals"),
        ("Goal", "Improve engagement and product inquiries"), ("Pricing", "Not provided"), ("Offers", "Not provided")]
segclip(s, '<div class="card sheet" id="s05sh"><div class="lbl">ব্যবসার তথ্য (কাল্পনিক)</div>' + "".join(
    f'<div class="sr{" miss" if v == "Not provided" else ""}" id="s05r{k}"><b>{a}</b><span>{v}</span></div>' for k, (a, v) in enumerate(rows)) + '</div>'
    f'<div class="card" id="s05warn">{ic("alert", "lg am")}<div class="h" style="font-size:30px">দাম ও অফার জানা নেই →<br/><b class="am">AI-কে বানাতে দেব না</b></div></div>')
js.append(f'tl.from("#s05sh .sr",{{x:-30,opacity:0,stagger:.35,duration:.35}},{at(s, 0, .05):.3f});')
rev("#s05warn", at(s, 0, .7), "x:60,opacity:0", .55)
practice("s05d", "ব্যবসা বদলে রেস্টুরেন্ট বা স্টেশনারি দোকান দিন — একই প্রম্পটে নতুন ক্যালেন্ডার")

# S06a creator
s = "s06a"
segclip(s, f'<div class="card problem" id="s06x">{ic("bulb", "xl")}<div><div class="lbl">বাস্তব সমস্যা</div><div class="h">নতুন ক্রিয়েটর · AI শেখানোর ভিডিও বানাতে চান, কিন্তু আইডিয়া নেই</div>'
           f'<div class="why"><b>কেন জরুরি:</b> নিয়মিত, দরকারি কনটেন্ট ছাড়া দর্শক ধরে রাখা যায় না</div></div></div>')
rev("#s06x", at(s, 0, .05), "y:50,opacity:0", .6)

# S07a document
s = "s07a"
segclip(s, f'<div class="card doc" id="s07d"><div class="lbl">লম্বা লেখা · কাল্পনিক প্রতিবেদন (ব্যক্তিগত তথ্য নয়)</div><div class="doctext">{e(DOC)}</div></div>')
rev("#s07d", at(s, 0, .05), "y:50,opacity:0", .6)

# S08a planning input
s = "s08a"
tasks = [("Study", 2.0, "#ffa24c"), ("Assignment", 1.0, "#2dd4bf"), ("Reading", .5, "#fde047"), ("Family time", 1.0, "#f472b6")]
x0 = 0
bar = ""
for name, h, c in tasks:
    bar += f'<div class="tb" style="width:{h / 5 * 100:.1f}%;background:{c}"><span>{name} · {h:g} ঘ.</span></div>'
segclip(s, f'<div class="card" id="s08in"><div class="lbl">সময়: বিকেল ৪টা – রাত ৯টা (৫ ঘণ্টা)</div><div class="tbar2">{bar}<div class="tb gap" style="width:10%"><span>বিরতি</span></div></div>'
           '<div class="ticks"><span>৪টা</span><span>৫টা</span><span>৬টা</span><span>৭টা</span><span>৮টা</span><span>৯টা</span></div>'
           '<div class="pd2" style="margin-top:20px">কাজ মোট ৪.৫ ঘণ্টা → বিরতির জন্য থাকে মাত্র ৩০ মিনিট</div></div>')
js.append(f'tl.from("#s08in .tb",{{scaleX:0,transformOrigin:"0 50%",stagger:.4,duration:.45}},{at(s, 0, .3):.3f});')
practice("s08c", "নমুনা কাজের জায়গায় আজকের নিজের কাজগুলো দিয়ে রুটিন বানান")

# S09a workflow steps / S09c deliverables
s = "s09a"
steps = ["ব্যবসার তথ্য", "৩টি আইডিয়া", "একটি বাছাই", "বাংলা ক্যাপশন", "ভিজ্যুয়াল ব্রিফ", "৩০ সেকেন্ডের স্ক্রিপ্ট", "দাবি যাচাই", "ফাইল গোছানো"]
segclip(s, '<div class="wf">' + "".join(f'<div class="wst" id="s09w{k}"><b>{bn(k + 1)}</b>{t}</div>' for k, t in enumerate(steps)) + '</div>'
           '<div class="card" id="s09biz"><div class="lbl">কাল্পনিক ব্যবসা</div><div class="pd2">Dhaka stationery shop · স্কুল ও কলেজের শিক্ষার্থী · লক্ষ্য: কোন কোন ধরনের স্টেশনারি আছে জানানো</div></div>')
js.append(f'tl.from("#s09a .wst",{{y:30,opacity:0,stagger:.25,duration:.35}},{at(s, 0, .2):.3f});')
rev("#s09biz", at(s, 0, .5), "y:30,opacity:0")
s = "s09c"
segclip(s, f'<div class="card" id="s09f">{ic("folder", "xl")}<div><div class="lbl">চূড়ান্ত ফোল্ডার</div><div class="files">' + "".join(f'<span class="chip">{t}</span>' for t in ["আইডিয়া.doc", "ক্যাপশন.doc", "ডিজাইন-ব্রিফ.doc", "রিল-স্ক্রিপ্ট.doc", "FAQ.doc", "যাচাই-চেকলিস্ট ✓"]) + '</div></div></div>')
rev("#s09f", at(s, 0, .05), "y:40,opacity:0", .6)
js.append(f'tl.from("#s09f .chip",{{scale:.6,opacity:0,stagger:.2,duration:.3}},{at(s, 0, .3):.3f});')

# S10a quiz
s = "s10a"
qa = [("AI-এর লেখা ইমেইল পাঠানোর আগে কেন পর্যালোচনা করবেন?", "টোন, নির্ভুলতা আর মানানসই কি না যাচাই করতে"),
      ("মিটিং নোটে দায়িত্বপ্রাপ্ত ব্যক্তি না থাকলে AI কী করবে?", "নাম বানাবে না — Unassigned / অজানা লিখবে"),
      ("ব্যবসায়ীকে কেন AI-এর পণ্যের দাবি যাচাই করতে হবে?", "AI দাম, অফার বা পণ্যের বৈশিষ্ট্য বানিয়ে ফেলতে পারে")]
inner = "".join(f'<div class="card quiz" id="s10q{k}"><div class="qn">প্রশ্ন {bn(k + 1)}</div><div class="qq">{e(q)}</div><div class="qt" id="s10t{k}">ভাবুন… <i class="tbar3"></i></div><div class="qa" id="s10a{k}">{ic("check", "gr")} {e(a)}</div></div>' for k, (q, a) in enumerate(qa))
segclip(s, inner)
for k in range(3):
    qs, an = at(s, 2 * k, 0, -.2), at(s, 2 * k + 1, 0, -.15)
    js.append(f'tl.fromTo("#s10q{k}",{{opacity:0,y:40}},{{opacity:1,y:0,duration:.45,immediateRender:false}},{qs:.3f});')
    js.append(f'tl.fromTo("#s10t{k} .tbar3",{{scaleX:1}},{{scaleX:0,duration:{max(1, an - qs - 2.5):.2f},ease:"none",immediateRender:false}},{qs + 2.2:.3f});')
    js.append(f'tl.to("#s10t{k}",{{opacity:0,duration:.2}},{an - .1:.3f});')
    js.append(f'tl.fromTo("#s10a{k}",{{opacity:0,scale:.8}},{{opacity:1,scale:1,duration:.4,ease:"back.out(2)",immediateRender:false}},{an:.3f});')
    if k < 2:
        js.append(f'tl.to("#s10q{k}",{{opacity:0,duration:.3}},{at(s, 2 * k + 2, 0, -.5):.3f});')
# S10b assignment
s = "s10b"
items = ["একটি শুরুর প্রম্পট", "একটি উন্নত প্রম্পট", "একটি ফলো-আপ প্রম্পট", "একটি যাচাই করা চূড়ান্ত ফলাফল", "AI কোথায় সাহায্য করেছে — ছোট ব্যাখ্যা"]
segclip(s, f'<div class="card" id="s10as"><div class="lbl am">ফাইনাল অ্যাসাইনমেন্ট · নিজের একটি বাস্তব AI ওয়ার্কফ্লো</div>' + "".join(f'<div class="ck2" id="s10i{k}"><i class="box"></i>{t}</div>' for k, t in enumerate(items)) + '</div>')
rev("#s10as", at(s, 0, 0, -.2), "y:40,opacity:0")
js.append(f'tl.from("#s10as .ck2",{{x:-30,opacity:0,stagger:.6,duration:.35}},{at(s, 0, .3):.3f});')
# S10c recap
s = "s10c"
topics = ["পড়াশোনা", "অফিসের কাজ", "ইমেইল", "ব্যবসা", "কনটেন্ট তৈরি", "রিসার্চ", "দৈনন্দিন পরিকল্পনা"]
segclip(s, '<div class="photo"><img src="assets/presenter.jpg" alt=""/><div class="tag">রুবেল মিয়া · ইন্সট্রাক্টর</div></div>'
           '<div class="introR"><div class="kicker">আজ যা শিখলাম</div><div class="road">' + "".join(f'<div class="chip" id="s10k{k}">{ic("check", "gr")}{t}</div>' for k, t in enumerate(topics)) + '</div>'
           f'<div class="card" id="s10key">{ic("shield", "lg")}<span>AI প্রথম খসড়া দেয় — সিদ্ধান্ত ও যাচাই আপনার</span></div>'
           f'<div class="card" id="s10next"><div class="lbl" style="color:#5eead4">পরবর্তী ক্লাস</div><div class="h" style="font-size:34px">AI নিরাপত্তা, তথ্যের গোপনীয়তা ও দায়িত্বশীল ব্যবহার</div></div></div>')
js.append(f'tl.from("#s10c .road .chip",{{x:40,opacity:0,stagger:.35,duration:.35}},{at(s, 0, .05):.3f});')
rev("#s10key", at(s, 1, .05), "y:30,opacity:0"); rev("#s10next", at(s, 2, .45), "x:60,opacity:0")
talk("s10c", 83, 239, 554, 604, "রুবেল মিয়া · ইন্সট্রাক্টর")

# chapter flashes
flash = []
for sc in T["scenes"][1:]:
    fs, fe = sc["start"], sc["narr_start"] - .12
    flash.append(f'<div id="f{sc["id"]}" class="clip flash" data-start="{fs:.3f}" data-duration="{fe - fs:.3f}" data-track-index="7"><span class="fn">{sc["num"]}</span><span class="ft">{e(sc["title"])}</span><span class="fl"></span></div>')
    js.append(f'tl.from("#f{sc["id"]} .fn",{{scale:.6,opacity:0,duration:.45,ease:"back.out(2)"}},{fs:.3f});')
    js.append(f'tl.from("#f{sc["id"]} .ft",{{y:30,opacity:0,duration:.45}},{fs + .15:.3f});')
    js.append(f'tl.fromTo("#f{sc["id"]} .fl",{{scaleX:0}},{{scaleX:1,duration:.6}},{fs + .2:.3f});')
    js.append(f'tl.to("#f{sc["id"]}",{{opacity:0,duration:.3}},{fe - .3:.3f});')


def is_kw(t):
    return bool(re.search(r"[A-Za-z0-9০-৯]", t.strip("।?!,—'\"")))


caps = []
for i, c in enumerate(T["cues"]):
    spans = " ".join(f'<span class="{"kw" if is_kw(w) else ""}">{e(w)}</span>' for w in c["text"].split())
    st, du = c["start"] - .05, c["end"] - c["start"] + .05
    caps.append(f'<div id="cap{i}" class="clip cap" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{10 + i % 2}"><div class="capbox">{spans}</div></div>')
    js.append(f'tl.from("#cap{i} .capbox",{{opacity:0,duration:.15}},{st:.3f});')

CSS = (open(f"{HERE}/../l3/style_l3.css").read() + open(f"{HERE}/../l4/style_l4_extra.css").read() + open(f"{HERE}/style_l5_extra.css").read())
page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/>
<title>Lesson 05 — AI for Everyday Productivity</title><script src="assets/gsap.min.js"></script><style>{CSS}</style></head><body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
<div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"><div class="bgfill"></div><div id="grid" class="grid"></div><div id="orb1" class="orb o1"></div><div id="orb2" class="orb o2"></div><div id="orb3" class="orb o3"></div></div>
<div id="topbar" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1"><div class="brand"><span class="dot"></span>PRACTICAL AI MASTERCLASS · PILLAR 01<span class="pill">বাংলা</span></div><div class="lesson">লেসন ০৫ · দৈনন্দিন কাজে AI · ইন্সট্রাক্টর: রুবেল মিয়া</div></div>
<div id="prog" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><i id="progfill"></i></div>
{''.join(clips)}{''.join(media)}{''.join(flash)}{''.join(caps)}
<div id="endc" class="clip endc" data-start="{DUR - 3.0:.3f}" data-duration="3.0" data-track-index="9"><div class="brand" style="font-size:44px"><span class="dot"></span>PRACTICAL AI MASTERCLASS</div>
<div class="sub">লেসন ০৫ সম্পন্ন · পরের ক্লাস: AI নিরাপত্তা ও দায়িত্বশীল ব্যবহার</div>
<div class="credits" id="credits"><div><span>ইন্সট্রাক্টর</span><b>Rubel Miah</b></div><i></i><div><span>ভিডিও এডিটর</span><b>Paloan</b></div></div></div>
</div><script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{paused:true}});
tl.to("#orb1",{{x:220,y:120,duration:{DUR / 6:.2f},ease:"sine.inOut",yoyo:true,repeat:5}},0);
tl.to("#orb2",{{x:-200,y:-140,duration:{DUR / 6:.2f},ease:"sine.inOut",yoyo:true,repeat:5}},0);
tl.fromTo("#grid",{{x:0}},{{x:-96,duration:{DUR:.2f},ease:"none"}},0);
tl.from("#topbar",{{y:-40,opacity:0,duration:.6}},0);
tl.fromTo("#progfill",{{scaleX:0}},{{scaleX:1,duration:{DUR:.2f},ease:"none"}},0);
{chr(10).join(js)}
tl.from("#endc",{{opacity:0,duration:.5}},{DUR - 3.0:.3f});
tl.from("#credits > *",{{y:20,opacity:0,stagger:.15,duration:.5}},{DUR - 2.6:.3f});
window.__timelines["main"] = tl;
</script></body></html>"""
open(f"{P}/hf/index.html", "w").write(page)
json.dump(LIP, open(f"{P}/artifacts/lipsync_scenes.json", "w"))
print("wrote", len(page), "dur", DUR, "lip", LIP, "screen clips", sum(1 for s in SG.values() if s["kind"] == "screen"))

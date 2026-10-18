"""HyperFrames 16:9 composition for Lesson 04 — Writing, Content & Communication (warm-studio theme)."""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from l4_script import SCENES, FORMULA, WEAK, STRONG

P = "/home/user/test/projects/pillar01-lesson04"
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
LN = {}
for L in T["lines"]:
    LN.setdefault(L["scene"], []).append(L)

_src = open(f"{HERE}/../l2/build_l2.py").read()
exec(_src[_src.index("_src = open"):_src.index("\n\n\ndef at(")].replace('f"{HERE}/../l1/build_l1.py"', 'f"{HERE}/../l1/build_l1.py"'))
ICON.update({
 "gear": '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="7"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.9 9.9l4.2 4.2M33.9 33.9l4.2 4.2M9.9 38.1l4.2-4.2M33.9 14.1l4.2-4.2"/></svg>',
 "cal": '<svg viewBox="0 0 48 48"><rect x="7" y="10" width="34" height="31" rx="4"/><path d="M7 19h34M16 6v8M32 6v8M14 26h4M22 26h4M30 26h4M14 33h4M22 33h4"/></svg>',
 "voice": ICON["user"],
 "trans": '<svg viewBox="0 0 48 48"><path d="M6 10h18M15 6v4M10 10c1 7 5 12 12 15M20 10c-1 7-5 12-12 15"/><path d="M26 42l8-20 8 20M29 35h10"/></svg>',
 "edit": ICON["pen"],
 "mega": '<svg viewBox="0 0 48 48"><path d="M6 20v8h8l18 10V10L14 20z"/><path d="M38 18c2 2 2 10 0 12"/></svg>',
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
BNUM = "০১২৩৪৫৬৭৮৯"


def bn(n):
    return "".join(BNUM[int(c)] for c in str(n))


def rev(sel, t, frm="y:40,opacity:0", d=0.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{d},ease:"{ease}"}},{t:.3f});')


def hide(sel, t, d=0.3):
    js.append(f'tl.to("{sel}",{{opacity:0,duration:{d}}},{t:.3f});')


def clip(sid, inner):
    s = SC[sid]
    return (f'<div id="{sid}" class="clip scene" data-start="{s["start"]:.3f}" data-duration="{s["end"] - s["start"]:.3f}" data-track-index="3">'
            f'<div class="chap"><span class="n">{s["num"]} / {bn(NSC)}</span><span class="t">{e(s["title"])}</span></div>{inner}</div>')


LIPSYNC = []


def talk(sid, left, top, w, h, tag):
    f = f"assets/talk_{sid}.mp4"
    if not os.path.exists(f"{P}/hf/{f}"):
        return False
    s = SC[sid]
    st, du = s["narr_start"], s["narr_end"] - s["narr_start"]
    media_html.append(f'<video id="v{sid}" class="clip talkv" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="8" src="{f}" muted playsinline '
                      f'style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"></video>')
    media_html.append(f'<div id="o{sid}" class="clip talko" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="12" '
                      f'style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"><div class="lipbadge">AI লিপ-সিঙ্ক</div><div class="tag">{tag}</div></div>')
    for el in (f"#v{sid}", f"#o{sid}"):
        js.append(f'tl.from("{el}",{{opacity:0,duration:0.4}},{st:.3f});')
        js.append(f'tl.to("{el}",{{opacity:0,duration:0.3}},{st + du - 0.3:.3f});')
    js.append(f'tl.set("#v{sid}",{{opacity:0}},{st + du:.3f});')
    LIPSYNC.append(sid)
    return True


FC = ["#ffa24c", "#2dd4bf", "#fde047", "#f472b6", "#4ade80", "#fdba74"]  # formula colours

# ---------- s01 intro
s = "s01"
road = SCENES[0]["onscreen"][1:]
talk(s, 83, 239, 554, 604, "AI শেখার সঙ্গী · বাংলায়")
inner = (f'<div class="photo"><img id="p1" src="assets/presenter.jpg" alt=""/><div class="tag">AI শেখার সঙ্গী · বাংলায়</div></div>'
         f'<div class="introR"><div class="kicker">LESSON 04 · MODULE</div><div class="bigt" id="s01t">Writing, Content ও Communication</div>'
         f'<div class="sub" id="s01s">AI দিয়ে লেখা, কনটেন্ট ও যোগাযোগ — দ্রুত, কিন্তু নিজের কণ্ঠে</div><div class="road">'
         + "".join(f'<div class="chip" id="s01r{k}"><span class="num">{k + 1:02d}</span>{e(r)}</div>' for k, r in enumerate(road)) + '</div></div>')
scene_html.append(clip(s, inner))
rev("#s01 .photo", SC[s]["start"] + 0.2, "x:-60,opacity:0", 0.8)
rev("#s01 .kicker", at(s, 0, 0, -0.3), "y:20,opacity:0", 0.5)
rev("#s01t", at(s, 0, 0.1), "y:40,opacity:0", 0.7)
rev("#s01s", at(s, 2, 0.05))
rev("#s01r0", at(s, 2, 0.6), "x:60,opacity:0", 0.45)
for k, f in [(1, 0.05), (2, 0.4), (3, 0.75)]: rev(f"#s01r{k}", at(s, 3, f), "x:60,opacity:0", 0.45)
rev("#s01r4", at(s, 4, 0.05), "x:60,opacity:0", 0.45)
rev("#s01r5", at(s, 4, 0.6), "x:60,opacity:0", 0.45)
js.append(f'tl.fromTo("#p1",{{scale:1}},{{scale:1.06,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

# ---------- s02 formula
s = "s02"
fdesc = ["কী লিখতে হবে", "কে পড়বে", "পড়ে কী করবে", "ভদ্র · বন্ধুসুলভ · আনুষ্ঠানিক", "কত শব্দ / লাইন", "অনুচ্ছেদ · বুলেট · টেবিল"]
inner = ('<div class="fgrid">' + "".join(f'<div class="ftile" id="s02f{k}" style="border-color:{FC[k]}"><span class="fn" style="color:{FC[k]}">{bn(k + 1)}</span><div class="ft">{t}</div><div class="fd">{e(d)}</div></div>'
                                          for k, (t, d) in enumerate(zip(FORMULA, fdesc))) + '</div>'
         f'<div class="foot gr" id="s02tip" style="top:600px">{ic("voice", "gr")} কৌশল: নিজের পুরোনো একটি লেখা দিয়ে বলুন — "এই ধাঁচে লেখো"</div>'
         f'<div class="foot am" id="s02gold">{ic("shield", "am")} <span><b class="am">সোনালি নিয়ম:</b> AI খসড়া দেয় — সিদ্ধান্ত, তথ্য আর দায়িত্ব আপনার</span></div>')
scene_html.append(clip(s, inner))
times = [at(s, 1, 0.02), at(s, 1, 0.28), at(s, 1, 0.52), at(s, 1, 0.78), at(s, 2, 0.02), at(s, 2, 0.5)]
for k, t in enumerate(times): rev(f"#s02f{k}", t, "y:-60,opacity:0", 0.5, "back.out(1.8)")
js.append(f'tl.to("#s02 .ftile",{{scale:1.04,duration:0.25,yoyo:true,repeat:1,stagger:0.1}},{at(s, 3, 0.1):.3f});')
rev("#s02tip", at(s, 4, 0.05), "y:30,opacity:0")
rev("#s02gold", at(s, 5, 0.05), "y:30,opacity:0")

# ---------- s03 email (weak vs strong)
s = "s03"
BARS = '<div class="bar"><i style="background:#f87171"></i><i style="background:#fde047"></i><i style="background:#4ade80"></i>'
strong_parts = [("একজন বিদেশি ক্লায়েন্টকে ইমেইল লেখো।", 0), ("আমি ঢাকার একজন ফ্রিল্যান্স গ্রাফিক ডিজাইনার।", 1),
                ("লোগোর প্রথম খসড়া আজ পাঠাচ্ছি, আর শুক্রবারের মধ্যে তাঁর মতামত চাই।", 2), ("ভদ্র ও আত্মবিশ্বাসী টোনে, ইংরেজিতে,", 3),
                ("১০০ শব্দের মধ্যে —", 4), ("বিষয় লাইনসহ।", 5)]
sample = ["Subject: First logo draft ready for your review", "Hi Sarah,", "I'm pleased to share the first draft of your logo (attached). I've focused on a clean, modern mark that works well in both colour and black-and-white.",
          "Could you please send your feedback by Friday? That keeps us on track for the final files next week.", "Best regards,<br/>Arif"]
inner = (f'<div class="pan" id="s03A">{BARS}<div class="addr">দুর্বল প্রম্পট</div><div class="illus">প্রতীকী চিত্র — আসল স্ক্রিনশট নয়</div></div>'
         f'<div class="pbody"><div class="fub" style="margin:0 0 0 auto;width:auto;background:rgba(248,113,113,.14);border-color:rgba(248,113,113,.55)">{e(WEAK)}</div>'
         '<div class="aib" id="s03wa"><div class="at3">Subject: <span class="ph">[Subject]</span></div><div class="at3">Dear <span class="ph">[Name]</span>,</div>'
         '<div class="at3">I am writing to inform you about <span class="ph">[topic]</span> on <span class="ph">[date]</span>…</div><div class="at3">Regards, <span class="ph">[Your Name]</span></div></div></div></div>'
         f'<div class="pan" id="s03B">{BARS}<div class="addr">শক্তিশালী প্রম্পট</div><div class="illus">প্রতীকী চিত্র — আসল স্ক্রিনশট নয়</div></div>'
         '<div class="pbody"><div class="sprompt">' + " ".join(f'<span class="sp" id="s03p{k}" data-c="{FC[c]}">{e(t)}</span>' for k, (t, c) in enumerate(strong_parts)) + '</div>'
         '<div class="aib" id="s03sa"><span class="samp2">নমুনা উত্তর — উদাহরণ মাত্র</span>' + "".join(f'<div class="at4">{x}</div>' for x in sample) + '</div></div></div>'
         '<div class="foot gr" id="s03chk">' + ic("check", "gr") + ' পাঠানোর আগে মিলিয়ে নিন: ' + " · ".join(f'<b id="s03c{k}">{t}</b>' for k, t in enumerate(["নাম", "তারিখ", "সংখ্যা", "টোন", "সংযুক্তি"])) + '</div>')
scene_html.append(clip(s, inner))
rev("#s03A", at(s, 0, 0.05), "x:-60,opacity:0", 0.6)
rev("#s03wa", at(s, 0, 0.45), "y:20,opacity:0", 0.45)
js.append(f'tl.to("#s03wa .ph",{{opacity:0.25,duration:0.3,yoyo:true,repeat:5}},{at(s, 0, 0.6):.3f});')
rev("#s03B", at(s, 1, 0, -0.2), "x:60,opacity:0", 0.6)
pt = [0.06, 0.2, 0.38, 0.62, 0.78, 0.9]
for k, (t, c) in enumerate(strong_parts):
    rev(f"#s03p{k}", at(s, 1, pt[k]), "opacity:0", 0.3)
    js.append(f'tl.to("#s03p{k}",{{backgroundColor:"{FC[c]}33",borderColor:"{FC[c]}",duration:0.3}},{at(s, 2, 0.1) + k * 0.15:.3f});')
rev("#s03sa", at(s, 2, 0.4), "y:20,opacity:0", 0.5)
rev("#s03chk", at(s, 4, 0.05), "y:30,opacity:0")
for k in range(5): js.append(f'tl.to("#s03c{k}",{{color:"#4ade80",duration:0.2}},{at(s, 4, 0.3 + k * 0.12):.3f});')

# ---------- s04 report & proposal
s = "s04"
rep = ["সারসংক্ষেপ", "মূল তথ্য", "বিশ্লেষণ", "সুপারিশ"]
prop = ["ক্লায়েন্টের সমস্যা", "আপনার সমাধান", "সময়সীমা", "মূল্য"]
inner = (f'<div class="card half l" id="s04L"><div class="lbl">রিপোর্ট</div><div class="h">{ic("feed", "lg")} নোট → গোছানো রিপোর্ট</div>'
         + "".join(f'<div class="stk" id="s04r{k}"><span class="sn2">{bn(k + 1)}</span>{t}</div>' for k, t in enumerate(rep))
         + f'<div class="lim" id="s04rl">⚠ সংখ্যা ও তথ্য আপনি দিন — নইলে AI বানানো সংখ্যা বসাতে পারে</div></div>'
         f'<div class="card half r" id="s04R"><div class="lbl">প্রপোজাল</div><div class="h">{ic("doc", "lg")} ক্লায়েন্টের চাহিদা → প্রপোজাল</div>'
         + "".join(f'<div class="stk" id="s04p{k}"><span class="sn2">{bn(k + 1)}</span>{t}{"<span class=redtag id=s04tag>দাম ও সময় আপনি ঠিক করবেন</span>" if k == 3 else ""}</div>' for k, t in enumerate(prop))
         + '</div>'
         f'<div class="foot rd" id="s04ft">{ic("lock", "rd")} ক্লায়েন্টের গোপন তথ্য ও চুক্তির বিবরণ দেওয়ার আগে নাম ও সংবেদনশীল তথ্য সরিয়ে নিন</div>')
scene_html.append(clip(s, inner))
rev("#s04L", at(s, 1, 0, -0.2), "x:-60,opacity:0")
for k in range(4): rev(f"#s04r{k}", at(s, 1, 0.45 + k * 0.12), "x:-30,opacity:0", 0.35)
rev("#s04rl", at(s, 2, 0.05), "x:-20,opacity:0", 0.4)
rev("#s04R", at(s, 3, 0, -0.2), "x:60,opacity:0")
for k in range(4): rev(f"#s04p{k}", at(s, 3, 0.45 + k * 0.12), "x:30,opacity:0", 0.35)
rev("#s04tag", at(s, 4, 0.05), "scale:0.5,opacity:0", 0.4, "back.out(2.5)")
rev("#s04ft", at(s, 5, 0.05), "y:30,opacity:0")

# ---------- s05 script
s = "s05"
rows = [("০–৩ সে.", "“এক মিনিটে শিখুন, AI দিয়ে ইমেইল লেখার ৩টি কৌশল!”", "মুখের ক্লোজআপ + বড় টেক্সট"),
        ("৩–৫০ সে.", "কৌশল ১, ২, ৩ — প্রতিটি এক লাইনের উদাহরণসহ", "স্ক্রিন রেকর্ডিং + সাবটাইটেল"),
        ("৫০–৬০ সে.", "“পরের ভিডিওর জন্য ফলো করুন”", "ফলো বাটনের অ্যানিমেশন")]
inner = ('<div class="tbar" id="s05bar"><div class="seg" id="s05g0" style="flex:9">হুক · ০–৩ সে.</div><div class="seg" id="s05g1" style="flex:41">মূল কথা · ৩–৫০ সে.</div><div class="seg" id="s05g2" style="flex:10">CTA · ৫০–৬০</div></div>'
         '<div class="card sct" id="s05tb"><div class="sgrid"><div class="sh">সময়</div><div class="sh">কী বলবেন</div><div class="sh">স্ক্রিনে কী দেখাবেন</div>'
         + "".join(f'<div class="sc r{k}">{a}</div><div class="sc r{k}">{e(b)}</div><div class="sc r{k}">{e(c)}</div>' for k, (a, b, c) in enumerate(rows)) + '</div>'
         '<div class="illus2">নমুনা</div></div>'
         f'<div class="card" id="s05wc"><div class="lbl">৬০ সেকেন্ড ≈</div><div class="big2">~১৫০ শব্দ</div><div class="p" style="font-size:22px;color:var(--mute)">বেশি লিখলে তাড়াহুড়ো</div></div>'
         f'<div class="foot am" id="s05ft">{ic("mic", "am")} স্ক্রিপ্ট জোরে পড়ে দেখুন — আটকালে বলুন "আরও সহজ কথ্য ভাষায় লেখো"</div>')
scene_html.append(clip(s, inner))
rev("#s05bar", at(s, 1, 0, -0.2), "y:-20,opacity:0")
for k, f in enumerate([0.1, 0.45, 0.75]): js.append(f'tl.from("#s05g{k}",{{scaleX:0,transformOrigin:"0 50%",duration:0.5}},{at(s, 1, f):.3f});')
rev("#s05tb", at(s, 2, 0.05), "y:40,opacity:0")
for k in range(3): js.append(f'tl.from("#s05tb .r{k}",{{opacity:0,x:-20,stagger:0.1,duration:0.35}},{at(s, 2, 0.4 + k * 0.15):.3f});')
rev("#s05wc", at(s, 3, 0.05), "scale:0.7,opacity:0", 0.45, "back.out(2)")
rev("#s05ft", at(s, 4, 0.05), "y:30,opacity:0")

# ---------- s06 blog
s = "s06"
steps = [("১", "doc", "আউটলাইন", "শিরোনাম + প্রতিটি অংশের মূল পয়েন্ট"), ("২", "pen", "অংশ ধরে লেখা", "প্রতিটি অংশ আলাদা প্রম্পটে"), ("৩", "heart", "নিজের অভিজ্ঞতা", "গল্প, উদাহরণ, মতামত — আপনার")]
inner = ('<div class="steps" id="s06st">' + "".join(
    f'<div class="step" id="s06s{k}"><span class="sn">ধাপ {n}</span>{ic(i)}<div class="st">{t}</div><div class="ss">{e(d)}</div></div>' + ('<div class="sarr">→</div>' if k < 2 else '')
    for k, (n, i, t, d) in enumerate(steps)) + '</div>'
         f'<div class="sticky" id="s06stk">আমার অভিজ্ঞতা ✍</div>'
         f'<div class="card" id="s06kw"><div class="lbl">সার্চের জন্য</div><div class="h" style="font-size:32px">{ic("search")} কিওয়ার্ড স্বাভাবিকভাবে</div><div class="names"><span>AI দিয়ে ইমেইল লেখা</span></div><div class="lim">জোর করে বারবার নয়</div></div>'
         f'<div class="card" id="s06hd"><div class="lbl">শিরোনাম</div><div class="h" style="font-size:32px">{ic("star")} ৫টি বিকল্প চেয়ে নিন</div><div class="hl"><i></i><i></i><i></i><i></i><i></i></div></div>'
         f'<div class="foot am" id="s06ft">{ic("alert", "am")} তথ্য, পরিসংখ্যান ও উদ্ধৃতি — আসল উৎস থেকে মিলিয়ে নিন</div>')
scene_html.append(clip(s, inner))
rev("#s06s0", at(s, 0, 0.3), "y:40,opacity:0")
rev("#s06s1", at(s, 1, 0.05), "y:40,opacity:0")
rev("#s06s2", at(s, 2, 0.05), "y:40,opacity:0")
rev("#s06stk", at(s, 2, 0.35), "rotation:-20,scale:0.4,opacity:0", 0.5, "back.out(2)")
rev("#s06kw", at(s, 3, 0.05), "x:-40,opacity:0")
rev("#s06hd", at(s, 4, 0.05), "x:40,opacity:0")
js.append(f'tl.from("#s06hd .hl i",{{scaleX:0,stagger:0.15,duration:0.3}},{at(s, 4, 0.3):.3f});')
rev("#s06ft", at(s, 5, 0.05), "y:30,opacity:0")

# ---------- s07 caption & ad
s = "s07"
caps = [("মজার", "😄 ঈদে সবাই বলবে, “এত সুন্দর পাঞ্জাবি কোথায় পেলে?” — উত্তরটা আমরা!"),
        ("আবেগী", "🌙 প্রিয়জনের সাথে ঈদের সকাল — নতুন পোশাকে আরও উজ্জ্বল।"),
        ("সরাসরি অফার", "🛍 নতুন ঈদ কালেকশন এসেছে — অর্ডার করতে ইনবক্স করুন।")]
adf = [("সমস্যা", "ঈদের ভিড়ে মার্কেটে যাওয়ার ঝামেলা?"), ("সুবিধা", "ঘরে বসে অর্ডার, ক্যাশ অন ডেলিভারি"), ("প্রমাণ", "কাস্টমারদের আসল রিভিউ"), ("কল-টু-অ্যাকশন", "এখনই মেসেজ করুন")]
inner = ('<div class="phones">' + "".join(f'<div class="phone" id="s07ph{k}"><div class="pt2">{t}</div><div class="pimg" style="background:linear-gradient(135deg,{c1},{c2})"></div><div class="pc2">{e(c)}</div></div>'
                                          for k, ((t, c), (c1, c2)) in enumerate(zip(caps, [("#7c2d12", "#fdba74"), ("#134e4a", "#5eead4"), ("#713f12", "#fde047")]))) + '<div class="illus2" style="top:-34px;right:0">প্রতীকী নমুনা</div></div>'
         f'<div class="card" id="s07ad"><div class="lbl" style="color:var(--cyan)">বিজ্ঞাপনের কাঠামো</div>'
         + "".join(f'<div class="adr" id="s07a{k}"><b>{a}</b><span>{e(b)}</span></div>' for k, (a, b) in enumerate(adf)) + '</div>'
         f'<div class="foot rd" id="s07ft">{ic("alert", "rd")} মিথ্যা দাবি নয় (যেমন "শতভাগ গ্যারান্টি") · প্ল্যাটফর্মের বিজ্ঞাপন নীতি মানুন · ভুল দাবি কেটে দিন</div>')
scene_html.append(clip(s, inner))
for k, f in enumerate([0.35, 0.6, 0.85]): rev(f"#s07ph{k}", at(s, 1, f), "y:60,opacity:0", 0.5)
rev("#s07ad", at(s, 2, 0, -0.2), "x:60,opacity:0")
for k, f in enumerate([0.25, 0.42, 0.6, 0.8]): rev(f"#s07a{k}", at(s, 2, f), "x:30,opacity:0", 0.35)
rev("#s07ft", at(s, 3, 0.05), "y:30,opacity:0")
js.append(f'tl.to("#s07ft",{{x:8,duration:0.06,yoyo:true,repeat:5}},{at(s, 4, 0.1):.3f});')

# ---------- s08 translation
s = "s08"
inner = (f'<div class="card" id="s08tr"><div class="lbl">প্রসঙ্গ ও টোনসহ অনুবাদ</div><div class="trow2">'
         '<div class="tsrc" id="s08bn">আপনার অর্ডারটি আগামীকাল পাঠানো হবে। দেরির জন্য আমরা দুঃখিত।</div><div class="tarr">→</div>'
         '<div class="tdst" id="s08en">Your order will be shipped tomorrow. We\'re sorry for the delay.</div></div>'
         '<div class="dial"><span>আনুষ্ঠানিক</span><i id="s08knob"></i><span>বন্ধুসুলভ</span></div>'
         '<div class="names" id="s08ck">' + "".join(f'<span>✓ {t}</span>' for t in ["নাম", "সংখ্যা", "তারিখ", "অর্থ"]) + '</div></div>'
         f'<div class="card" id="s08bk"><div class="lbl gr">যাচাইয়ের কৌশল</div><div class="h" style="font-size:30px">{ic("loop", "gr")} উল্টো অনুবাদ করে মিলিয়ে দেখুন</div></div>'
         f'<div class="card" id="s08nat"><div class="lbl">বাংলাভাষী গ্রাহকের জন্য</div><div class="h" style="font-size:30px">{ic("pen")} সরাসরি বাংলায় লিখতে বলুন</div></div>'
         f'<div class="foot rd" id="s08ft">{ic("scale", "rd")} আইনি, সরকারি বা চিকিৎসা-সংক্রান্ত লেখা → পেশাদার অনুবাদক বা বিশেষজ্ঞ</div>')
scene_html.append(clip(s, inner))
rev("#s08tr", at(s, 0, 0.2), "y:40,opacity:0")
js.append(f'tl.from("#s08en",{{opacity:0,x:-30,duration:0.6}},{at(s, 1, 0.4):.3f});')
js.append(f'tl.fromTo("#s08knob",{{x:0}},{{x:-110,duration:0.8,ease:"power2.inOut"}},{at(s, 1, 0.55):.3f});')
js.append(f'tl.from("#s08ck span",{{scale:0.5,opacity:0,stagger:0.25,duration:0.3}},{at(s, 2, 0.05):.3f});')
rev("#s08bk", at(s, 2, 0.5), "x:-40,opacity:0")
rev("#s08ft", at(s, 3, 0.05), "y:30,opacity:0")
rev("#s08nat", at(s, 4, 0.05), "x:40,opacity:0")

# ---------- s09 editing
s = "s09"
inner = (f'<div class="card" id="s09pg"><div class="lbl">আপনার লেখা → AI এডিট</div><div class="para">'
         'I am <del>very much</del> <ins>a detail-oriented</ins> junior developer <del>which</del> <ins>who</ins> <del>have</del> <ins>has</ins> built three web apps<del> and also I can work in team</del><ins> and works well in a team</ins>.</div>'
         '<div class="clog" id="s09log"><b>কী বদলেছে:</b> ১) “very much” বাদ · ২) which → who · ৩) have → has · ৪) শেষ অংশ আরও সংক্ষিপ্ত</div></div>'
         '<div class="modes">' + "".join(f'<span class="chip" id="s09m{k}">{t}</span>' for k, t in enumerate(["ব্যাকরণ ও বানান", "আরও স্পষ্ট", "অর্ধেক ছোট", "টোন বদল"])) + '</div>'
         f'<div class="card" id="s09cv"><div class="lbl am">সিভি এডিটের নিয়ম</div><div class="p" style="font-size:24px">ব্যাকরণ ঠিক করো, আরও আত্মবিশ্বাসী করো — কিন্তু <b class="am">নতুন দক্ষতা বা অভিজ্ঞতা যোগ নয়</b></div></div>'
         f'<div class="foot gr" id="s09ft">{ic("voice", "gr")} বলে দিন: "আমার কণ্ঠ আর মূল অর্থ যেন না বদলায়"</div>')
scene_html.append(clip(s, inner))
rev("#s09pg", at(s, 0, 0.2), "y:40,opacity:0")
js.append(f'tl.from("#s09pg del, #s09pg ins",{{opacity:0,stagger:0.3,duration:0.3}},{at(s, 1, 0.3):.3f});')
for k, f in enumerate([0.15, 0.4, 0.58, 0.78]): rev(f"#s09m{k}", at(s, 1, f), "scale:0.6,opacity:0", 0.35, "back.out(2)")
rev("#s09log", at(s, 2, 0.1), "y:20,opacity:0", 0.45)
rev("#s09cv", at(s, 3, 0.05), "x:40,opacity:0")
rev("#s09ft", at(s, 4, 0.05), "y:30,opacity:0")

# ---------- s10 workflow
s = "s10"
stages = ["আইডিয়া", "গবেষণা", "আউটলাইন", "খসড়া", "এডিট ও যাচাই", "ডিজাইন", "প্রকাশ ও মূল্যায়ন"]
human = {4, 6}
aihelp = {0, 2, 3}
inner = ('<div class="pipe">' + '<span class="parr">→</span>'.join(
    f'<div class="pst{" hu" if k in human else ""}" id="s10s{k}"><div class="pt3">{t}</div>'
    + (f'<div class="pbadge hu">{ic("user", "gr")} মানুষ</div>' if k in human else (f'<div class="pbadge">AI</div>' if k in aihelp else '<div class="pbadge dim">AI + আপনি</div>')) + '</div>'
    for k, t in enumerate(stages)) + '</div>'
         '<div class="card" id="s10rp"><div class="lbl">রিপারপাস · এক পরিশ্রমে পাঁচটি কনটেন্ট</div><div class="rprow">'
         '<span class="pill k">১টি ব্লগ</span><span class="arrow">→</span>' + "".join(f'<span class="pill" id="s10o{k}">{t}</span>' for k, t in enumerate(["৩টি ক্যাপশন", "১টি রিলস স্ক্রিপ্ট", "১টি নিউজলেটার ইমেইল"])) + '</div></div>'
         f'<div class="card" id="s10sh"><div class="lbl">ট্র্যাকিং</div><div class="h" style="font-size:28px">{ic("calc")} স্প্রেডশিটে ধাপগুলোর কলাম</div></div>'
         f'<div class="foot gr" id="s10ft">{ic("loop", "gr")} কোন পোস্ট ভালো চলল দেখে পরের আইডিয়া — প্রতি সপ্তাহে চক্রটি উন্নত হয়</div>')
scene_html.append(clip(s, inner))
for k in range(7): rev(f"#s10s{k}", at(s, 1, 0.04 + k * 0.13), "y:30,opacity:0", 0.4)
js.append(f'tl.to("#s10s0, #s10s2, #s10s3",{{borderColor:"rgba(255,162,76,.95)",duration:0.3,yoyo:true,repeat:1}},{at(s, 2, 0.1):.3f});')
js.append(f'tl.to("#s10s4, #s10s6",{{scale:1.08,duration:0.3,yoyo:true,repeat:1}},{at(s, 2, 0.6):.3f});')
rev("#s10rp", at(s, 3, 0.05), "y:40,opacity:0")
for k, f in enumerate([0.5, 0.62, 0.74]): rev(f"#s10o{k}", at(s, 3, f), "scale:0.6,opacity:0", 0.35, "back.out(2)")
rev("#s10sh", at(s, 4, 0.05), "x:40,opacity:0")
rev("#s10ft", at(s, 5, 0.05), "y:30,opacity:0")

# ---------- s11 content engine
s = "s11"
parts = [("voice", "ব্র্যান্ড ভয়েস কার্ড", "ভাষা · শব্দ · পাঠক"), ("doc", "প্রম্পট টেমপ্লেট", "ইমেইল · ক্যাপশন · ব্লগ · স্ক্রিপ্ট"),
         ("cal", "কনটেন্ট ক্যালেন্ডার", "সপ্তাহের পরিকল্পনা"), ("check", "যাচাই চেকলিস্ট", "প্রকাশের আগে")]
pos = [(80, 236), (80, 470), (1360, 236), (1360, 470)]
inner = ("".join(f'<div class="card epart" id="s11p{k}" style="left:{x}px;top:{y}px">{ic(i, "lg")}<div><div class="et2">{t}</div><div class="es">{e(d)}</div></div></div>'
                 for k, ((i, t, d), (x, y)) in enumerate(zip(parts, pos)))
         + f'<div class="engine" id="s11eng"><div class="gearw" id="s11gear">{ICON["gear"]}</div><div class="en">AI Content Engine</div></div>'
         '<div class="outs2" id="s11out">' + "".join(f'<span class="pill" id="s11o{k}">{t}</span>' for k, t in enumerate(["১ ব্লগ", "৩ ক্যাপশন", "১ রিলস স্ক্রিপ্ট", "১ ইমেইল"])) + '</div>'
         f'<div class="foot am" id="s11as">{ic("target", "am")} <span><b class="am">অ্যাসাইনমেন্ট:</b> চারটি অংশ একটি ডকুমেন্টে + এক সপ্তাহের কনটেন্ট · জমা: ডকুমেন্ট, কনটেন্ট, আর কোথায় AI-এর লেখা বদলেছেন ও কেন</span></div>')
scene_html.append(clip(s, inner))
rev("#s11eng", at(s, 0, 0.2), "scale:0.5,opacity:0", 0.6, "back.out(1.6)")
js.append(f'tl.to("#s11gear",{{rotation:360,duration:{SC[s]["end"] - at(s, 0, 0.2):.2f},ease:"none"}},{at(s, 0, 0.2):.3f});')
rev("#s11p0", at(s, 1, 0.05), "x:-60,opacity:0")
rev("#s11p1", at(s, 2, 0.02), "x:-60,opacity:0")
rev("#s11p2", at(s, 2, 0.62), "x:60,opacity:0")
rev("#s11p3", at(s, 2, 0.85), "x:60,opacity:0")
rev("#s11as", at(s, 3, 0.0), "y:30,opacity:0")
for k, f in enumerate([0.55, 0.68, 0.8, 0.9]): rev(f"#s11o{k}", at(s, 3, f), "scale:0.5,opacity:0", 0.35, "back.out(2)")
js.append(f'tl.to("#s11as",{{scale:1.02,duration:0.3,yoyo:true,repeat:1}},{at(s, 4, 0.1):.3f});')

# ---------- s12 recap
s = "s12"
items = ["লেখার ছয় অংশের ফর্মুলা", "Email · report · proposal · script", "Blog · caption · ad copy", "Translation ও editing", "Idea → publish ওয়ার্কফ্লো", "নিজের AI Content Engine"]
talk(s, 83, 239, 434, 514, "দেখা হবে পরের মডিউলে!")
inner = (f'<div class="photo sm"><img id="p12" src="assets/presenter.jpg" alt=""/><div class="tag">দেখা হবে পরের মডিউলে!</div></div>'
         '<div class="rlist">' + "".join(f'<div class="rl" id="s12i{k}">{ic("check", "gr")}{e(t)}</div>' for k, t in enumerate(items)) + '</div>'
         f'<div class="card" id="s12next"><div class="lbl" style="color:#5eead4">মডিউল ০৪</div><div class="h">{ic("star", "lg")}</div>'
         '<div class="h" style="font-size:40px">সম্পন্ন!</div><div class="p" style="font-size:25px;color:var(--mute)">অ্যাসাইনমেন্ট: নিজের AI Content Engine দিয়ে এক সপ্তাহের কনটেন্ট</div></div>'
         f'<div id="s12key" style="position:absolute">{ic("shield", "lg")}<span>AI গতি বাড়ায় — আপনার অভিজ্ঞতা, কণ্ঠ আর সততাই লেখাকে আলাদা করে</span></div>')
scene_html.append(clip(s, inner))
rev("#s12 .photo", SC[s]["start"] + 0.2, "x:-50,opacity:0", 0.7)
rev("#s12i0", at(s, 0, 0.3), "x:40,opacity:0", 0.4)
for k, f in [(1, 0.05), (2, 0.35), (3, 0.7)]: rev(f"#s12i{k}", at(s, 1, f), "x:40,opacity:0", 0.4)
rev("#s12i4", at(s, 2, 0.05), "x:40,opacity:0", 0.4)
rev("#s12i5", at(s, 2, 0.6), "x:40,opacity:0", 0.4)
rev("#s12key", at(s, 3, 0.05), "y:40,opacity:0")
rev("#s12next", at(s, 5, 0.0, -0.4), "x:60,opacity:0")
js.append(f'tl.fromTo("#p12",{{scale:1.06}},{{scale:1,duration:{SC[s]["end"] - SC[s]["start"]:.2f},ease:"none"}},{SC[s]["start"]:.3f});')

# ---------- chapter flashes, exits, captions
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

CSS = open(f"{HERE}/../l3/style_l3.css").read() + open(f"{HERE}/style_l4_extra.css").read()
page = f"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<title>Lesson 04 — Writing, Content & Communication</title>
<script src="assets/gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="{DUR:.3f}" data-fps="30">
  <div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"><div class="bgfill"></div><div id="grid" class="grid"></div>
    <div id="orb1" class="orb o1"></div><div id="orb2" class="orb o2"></div><div id="orb3" class="orb o3"></div></div>
  <div id="topbar" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1">
    <div class="brand"><span class="dot"></span>AI FUNDAMENTALS<span class="pill">বাংলা</span></div>
    <div class="lesson">লেসন ০৪ · Writing, Content ও Communication</div></div>
  <div id="prog" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><i id="progfill"></i></div>
  {"".join(scene_html)}
  {"".join(media_html)}
  {"".join(flash_html)}
  {"".join(cap_html)}
  <div id="endc" class="clip endc" data-start="{DUR - 3.0:.3f}" data-duration="3.0" data-track-index="9">
    <div class="brand" style="font-size:44px"><span class="dot"></span>AI FUNDAMENTALS</div>
    <div class="sub">মডিউল ০৪ সম্পন্ন · দেখা হবে পরের মডিউলে</div>
    <div class="credits" id="credits"><div><span>ইন্সট্রাক্টর</span><b>Rubel Miah</b></div><i></i><div><span>ভিডিও এডিটর</span><b>Paloan</b></div></div></div>
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
tl.from("#endc",{{opacity:0,duration:0.5}},{DUR - 3.0:.3f});
tl.from("#credits > *",{{y:20,opacity:0,stagger:0.15,duration:0.5}},{DUR - 2.6:.3f});
window.__timelines["main"] = tl;
</script></body></html>"""
open(f"{P}/hf/index.html", "w").write(page)
json.dump(LIPSYNC, open(f"{P}/artifacts/lipsync_scenes.json", "w"))
print("wrote", len(page), "duration", DUR, "lipsync", LIPSYNC)

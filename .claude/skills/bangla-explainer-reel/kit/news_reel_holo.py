"""Daily AI News — DeepSeek V4.1 Flash 1017 (18 Oct 2026). Voice assembly (or paced timing
when no voice yet), captions, premium 2.5D news scenes, cue list.
Run: python reel.py  (then python soundbed.py, then hyperframes render)."""
import json, math, random, re, subprocess, html as H
from pathlib import Path
import numpy as np
import lottiegen as LG

ROOT = Path(__file__).parent
HF = ROOT / "hyperframes"
SR = 48000
R = lambda x: round(x, 3)

# ---------- 1. lines: (spoken text, caption chunks, sfx) ----------
LINES = [
    ("একটি বড় AI কোম্পানি এবার নিজেদের পাঁচ শতাংশ শেয়ার জনকল্যাণে দেওয়ার পরিকল্পনা করেছে!", ["একটি বড় AI কোম্পানি", "নিজেদের *৫% শেয়ার*", "*জনকল্যাণে* দেওয়ার", "পরিকল্পনা করেছে!"], ["boom", "glitch"]),
    ("আর ছোট AI কি বাংলাদেশের ভবিষ্যৎ বদলে দিতে পারে?", ["আর *ছোট AI* কি", "*বাংলাদেশের* ভবিষ্যৎ", "বদলে দিতে পারে?"], ["riser"]),
    ("১৮ অক্টোবর Anthropic ঘোষণা করেছে নতুন Public Benefit Fund।", ["*১৮ অক্টোবর*", "*Anthropic* ঘোষণা করেছে", "নতুন *Public Benefit Fund*।"], ["boom", "tick"]),
    ("শেয়ারহোল্ডারদের অনুমোদন পেলে কোম্পানির পাঁচ শতাংশ শেয়ার এই ফান্ডে বরাদ্দ করা হবে।", ["শেয়ারহোল্ডারদের *অনুমোদন* পেলে", "কোম্পানির *৫% শেয়ার*", "এই ফান্ডে", "বরাদ্দ করা হবে।"], ["tick", "pop"]),
    ("এই ফান্ডের মাধ্যমে জনকল্যাণমূলক উদ্যোগ এবং AI-এর কারণে কর্মজীবনে পরিবর্তনের মুখে পড়া মানুষদের সহায়তা করা হতে পারে।", ["এই ফান্ডের মাধ্যমে", "*জনকল্যাণমূলক* উদ্যোগ", "এবং AI-এর কারণে", "কর্মজীবনে *পরিবর্তনের* মুখে", "পড়া মানুষদের", "*সহায়তা* করা হতে পারে।"], ["whoosh", "pop"]),
    ("তবে অর্থ বিতরণ এখনো শুরু হয়েছে, এমন ঘোষণা নেই।", ["তবে *অর্থ বিতরণ*", "এখনো শুরু হয়েছে,", "এমন *ঘোষণা নেই*।"], ["glitch"]),
    ("অন্যদিকে World Bank বলছে, উন্নয়নশীল দেশগুলোর জন্য ছোট AI হতে পারে বড় সুযোগ।", ["অন্যদিকে *World Bank* বলছে,", "উন্নয়নশীল দেশগুলোর জন্য", "*ছোট AI* হতে পারে", "*বড় সুযোগ*।"], ["whoosh", "boom"]),
    ("স্থানীয় ভাষায়, কম ইন্টারনেটেও নির্দিষ্ট কাজে ব্যবহারযোগ্য AI তৈরি করা সম্ভব।", ["*স্থানীয় ভাষায়*,", "*কম ইন্টারনেটেও*", "নির্দিষ্ট কাজে ব্যবহারযোগ্য", "AI তৈরি করা সম্ভব।"], ["pop", "pop2"]),
    ("বাংলাদেশে এমন AI কৃষি, শিক্ষা ও ছোট ব্যবসায় কাজে লাগতে পারে।", ["*বাংলাদেশে* এমন AI", "*কৃষি*, *শিক্ষা* ও", "*ছোট ব্যবসায়*", "কাজে লাগতে পারে।"], ["whoosh", "pop"]),
    ("তবে সঠিক বাংলা তথ্য, নিরাপত্তা আর মানুষের তত্ত্বাবধান নিশ্চিত করতে হবে।", ["তবে সঠিক *বাংলা তথ্য*,", "*নিরাপত্তা* আর মানুষের", "*তত্ত্বাবধান*", "নিশ্চিত করতে হবে।"], ["ding"]),
    ("আজকের ব্যবহারিক টুল NotebookLM।", ["আজকের ব্যবহারিক টুল", "*NotebookLM*।"], ["boom", "tick"]),
    ("নিজের নথি থেকে তথ্য খুঁজতে, সারাংশ তৈরি করতে আর পড়াশোনার প্রশ্ন বানাতে এটি ব্যবহার করতে পারেন।", ["নিজের নথি থেকে", "*তথ্য খুঁজতে*,", "*সারাংশ* তৈরি করতে", "আর পড়াশোনার *প্রশ্ন* বানাতে", "এটি ব্যবহার করতে পারেন।"], ["pop", "pop2"]),
    ("AI-এর নতুন সুযোগ কাজে লাগান, কিন্তু তথ্য যাচাই করুন।", ["AI-এর নতুন সুযোগ", "*কাজে লাগান*,", "কিন্তু তথ্য *যাচাই* করুন।"], ["ding"]),
    ("প্রতিদিনের AI নিউজ আর ফ্রি টুল জানতে আমাদের সঙ্গে থাকুন!", ["প্রতিদিনের *AI নিউজ*", "আর *ফ্রি টুল* জানতে", "আমাদের সঙ্গে *থাকুন*!"], ["whoosh", "pop"]),
    ("আমি রুবেল মিয়া।", ["আমি *রুবেল মিয়া*।"], ["flash"]),
    ("ফলো করুন, দেখা হবে পরের খবরে!", ["*ফলো করুন*,", "দেখা হবে পরের খবরে!"], ["pop", "pop2"]),
]
# speech-segment ids per line, filled in once a real voiceover exists (voice/segs.json)
VOICE_MAP = [[0], [1], [2], [3], [4], [5, 6], [7, 8], [9], [10], [11], [12, 13, 14], [15, 16], [17, 18], [19], [20], [21, 22]]
GAP, SECTION_GAP, INTRA = 0.2, 0.34, 0.14
SECTION_BEFORE = {2, 4, 6, 8, 10, 12, 14}
END_CARD = 3.4
PAD, FADE = 0.04, 0.012
CPS = 14.0  # paced timing (Bangla news read) when no voice yet

# ---------- 2. voiceover / timing ----------
TIMES, SEGT = [], {}
if VOICE_MAP and (ROOT / "voice/segs.json").exists():
    segs = json.loads((ROOT / "voice/segs.json").read_text())
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "voice/vo_raw.mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    out, t = [np.zeros(int(0.15 * SR), np.float32)], 0.15
    for li, ids in enumerate(VOICE_MAP):
        if li:
            g = SECTION_GAP if li in SECTION_BEFORE else GAP
            out.append(np.zeros(int(g * SR), np.float32)); t += g
        st = t
        for k, sid in enumerate(ids):
            if k:
                out.append(np.zeros(int(INTRA * SR), np.float32)); t += INTRA
            SEGT.setdefault(li, []).append(R(t))
            a, b = segs[sid]
            p = x[int(max(0, a - PAD) * SR): int((b + PAD) * SR)].copy()
            f = int(FADE * SR); p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
            out.append(p); t += len(p) / SR
        TIMES.append((R(st), R(t)))
    vo = np.concatenate(out)
    HAS_VOICE = True
else:
    t = 0.3
    for li, (txt, _c, _s) in enumerate(LINES):
        if li:
            t += SECTION_GAP if li in SECTION_BEFORE else GAP
        d = max(1.1, len(txt) / CPS + 0.2)
        TIMES.append((R(t), R(t + d))); SEGT[li] = [R(t)]; t += d
    vo = np.zeros(int((t + END_CARD + 1) * SR), np.float32)
    HAS_VOICE = False
(ROOT / "voice").mkdir(exist_ok=True)
tmp = ROOT / "voice/vo_cut.f32"; tmp.write_bytes(vo.astype(np.float32).tobytes())
af = "highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=7" if HAS_VOICE else "anull"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", str(tmp), "-af", af,
                "-ar", str(SR), str(ROOT / "voice/vo_clean.wav")], check=True)
tmp.unlink()

LS = [s for s, _ in TIMES]
WIN = [(LS[i], LS[i + 1] if i + 1 < len(LS) else TIMES[-1][1] + 0.25) for i in range(len(LS))]
END_S = WIN[-1][1]
DURATION = R(END_S + END_CARD)


# ---------- 3. captions ----------
def captions(i, chunks, s, e):
    """Chunks get time in proportion to their length; words pop in one by one."""
    w = [len(c.replace("*", "")) for c in chunks]
    tot = sum(w); cl, an = [], []
    cur = s
    for c, chunk in enumerate(chunks):
        span = (e - s) * w[c] / tot
        cid = f"c{i}_{c}"
        toks = re.findall(r'\*[^*]+\*\S*|\S+', chunk)
        spans = []
        for k, tk in enumerate(toks):
            hl = "*" in tk
            spans.append(f'<span id="{cid}w{k}" class="w{" hl" if hl else ""}">{H.escape(tk.replace("*", ""))}</span>')
            wt = cur + 0.03 + k * min(0.2, max(0.06, (span - 0.2) / max(1, len(toks))))
            an.append(f'tl.from("#{cid}w{k}",{{y:50,scaleX:.75,scaleY:1.35,opacity:0,duration:.34,ease:"back.out(2.4)"}},{R(wt)});')
        cl.append(f'<div id="{cid}" class="cap clip" data-start="{R(cur)}" data-duration="{R(span)}" data-track-index="6"><div class="capline">{"".join(spans)}</div></div>')
        cur += span
    return cl, an


# ---------- 4. scenes ----------
S = {}
def scene(i):
    def d(fn):
        S[i] = fn; return fn
    return d

def pop(sel, t, **kw):
    """Anticipation-free entrance with exaggeration + squash & stretch on landing + follow-through."""
    d = max(.32, kw.get("d", .3))
    return (f'tl.from("{sel}",{{y:90,scale:.5,rotation:-8,opacity:0,duration:{R(d)},ease:"power3.out"}},{R(t)});'
            f'tl.fromTo("{sel}",{{scaleX:1.16,scaleY:.84}},{{scaleX:1,scaleY:1,duration:.55,ease:"elastic.out(1,0.42)"}},{R(t+d)});')

def slide(sel, t, x=0, y=0, d=.32):
    """Arc in (x + lifted y), solid-drawing 3D tilt, overshoot, then a lagging follow-through wobble."""
    lean = -10 if x > 0 else 10
    return (f'tl.from("{sel}",{{x:{x},y:{y - 60 if y == 0 else y},rotationY:{-25 if x > 0 else 25 if x < 0 else 0},rotationX:{20 if y else 0},transformPerspective:900,opacity:0,duration:{R(d + .25)},ease:"back.out(1.5)"}},{R(t)});'
            f'tl.fromTo("{sel}",{{rotation:{lean}}},{{rotation:0,duration:.8,ease:"elastic.out(1,0.35)"}},{R(t + .05)});')

def shake(sel, t, n=5, a=12):
    return f'tl.fromTo("{sel}",{{scale:1}},{{scale:1.035,duration:.14,yoyo:true,repeat:1,ease:"power2.out"}},{R(t)});'


def globe(gid, size=420):
    mer = "".join(f'<div class="gmer" style="left:{x}px;width:{int(size*.28)}px;height:{size}px"></div>' for x in range(-size, size * 2, int(size * .18)))
    lat = "".join(f'<div class="glat" style="top:{int(size*f)}px;width:{size}px"></div>' for f in (.25, .5, .75))
    return f'<div class="globe2" style="width:{size}px;height:{size}px"><div id="{gid}" class="gmers" style="width:{size*3}px;height:{size}px;left:{-size}px">{mer}</div>{lat}<div class="gshine"></div></div>'


def holo(text, cls="holotxt", style=""):
    return f'<div class="{cls}" style="{style}">{text}</div>'


# 0 — SCROLL STOPPER: giant holographic 5% on frame 1, camera push-in, BREAKING glitch
@scene(0)
def _(s, e):
    h = f"""<div class="trails"><i class="tr1"></i><i class="tr2"></i><i class="tr3"></i></div>
    <div class="gwrap" style="left:290px;top:520px">{globe("g0", 500)}</div>
    <div id="bk0" class="breaking2">BREAKING</div>
    <div id="pc0" class="mega5">5%</div>
    <div id="sh0" class="sharetag">শেয়ার ➜ জনকল্যাণ</div>"""
    a = [f'tl.fromTo("#s0in",{{scale:1.45}},{{scale:1,duration:.7,ease:"expo.out"}},{s});',
         f'tl.fromTo("#pc0",{{rotationY:-60,transformPerspective:1000}},{{rotationY:0,duration:.9,ease:"back.out(1.4)"}},{s});',
         f'tl.fromTo("#pc0",{{x:-10,skewX:12}},{{x:0,skewX:0,duration:.05,repeat:5,yoyo:true}},{R(s+.9)});',
         f'tl.fromTo("#g0",{{x:0}},{{x:180,duration:{R(e-s)},ease:"none"}},{s});',
         f'tl.from("#bk0",{{x:-700,duration:.35,ease:"power4.out"}},{R(s+.15)});', pop("#sh0", s + (e - s) * .55)]
    return h, a


# 1 — question: can small AI change Bangladesh?
@scene(1)
def _(s, e):
    h = """<div id="ph1" class="phone2"><div class="pscreen"><div class="pchip">SMALL AI</div>
      <div id="b1a" class="cb me2">আমার ধানে কী রোগ হলো?</div><div id="b1b" class="cb ai3">ছবি পাঠান, বাংলায় বলছি 🌾</div></div></div>
    <div id="bd1" class="emo e200" style="left:90px;top:280px">🇧🇩</div><div id="qm1" class="bigq2">?</div>"""
    st = (e - s) / 3
    a = [slide("#ph1", s, y=400), pop("#bd1", s + .2), pop("#b1a", s + st * .8), pop("#b1b", s + st * 1.6),
         f'tl.from("#qm1",{{scale:3,opacity:0,rotation:-30,duration:.35,ease:"power4.in"}},{R(s+st*2)});']
    return h, a


# 2 — 18 Oct: ANTHROPIC announces Public Benefit Fund (wordmark only, no logo)
@scene(2)
def _(s, e):
    h = f"""<div class="gwrap" style="left:370px;top:300px">{globe("g2", 340)}</div>
    <div id="dt2" class="glass datechip">📅 ১৮ অক্টোবর ২০২৬</div>
    <div id="wm2" class="wordmark">ANTHROPIC</div><div id="sw2" class="sweep2"></div>
    <div id="pbf2" class="glass pbf">PUBLIC BENEFIT FUND<span>NEW</span></div>"""
    st = (e - s) / 3
    a = [f'tl.fromTo("#g2",{{x:0}},{{x:120,duration:{R(e-s)},ease:"none"}},{s});', pop("#dt2", s),
         f'tl.from("#wm2",{{opacity:0,scaleX:.4,scale:.6,duration:.5,ease:"expo.out"}},{R(s+st*.8)});',
         f'tl.fromTo("#sw2",{{x:-700}},{{x:700,duration:.6,ease:"power2.inOut"}},{R(s+st*.9)});',
         f'tl.from("#pbf2",{{y:-260,scale:.3,opacity:0,duration:.6,ease:"back.out(1.6)"}},{R(s+st*1.9)});']
    return h, a


# 3 — waffle chart: 5 of 100 squares light up; approval pending
@scene(3)
def _(s, e):
    cells = "".join(f'<span id="wf{k}" class="wcell{" hot" if k >= 95 else ""}"></span>' for k in range(100))
    h = f"""<div class="glass waffwrap"><div class="wtitle">কোম্পানির শেয়ার = ১০০%</div><div class="waffle">{cells}</div>
      <div class="wlegend"><span class="lg hot"></span> ৫% → Public Benefit Fund</div></div>
    <div id="ap3" class="glass approve"><span class="hour">⏳</span> শেয়ারহোল্ডার অনুমোদন: <b>বাকি</b></div>"""
    st = (e - s) / 4
    a = [slide("#s3in .waffwrap", s, y=300)]
    a += [f'tl.from("#wf{k}",{{scale:0,duration:.15,ease:"back.out(3)"}},{R(s+st*1.2+(k-95)*.12)});' for k in range(95, 100)]
    a += [f'tl.to("#s3in .wcell.hot",{{scale:1.25,duration:.2,yoyo:true,repeat:3}},{R(s+st*2)});', pop("#ap3", s + st * 2.6)]
    return h, a


# 4 — fund hub with spokes: initiatives + people affected by AI job change
@scene(4)
def _(s, e):
    spokes = [("🎓", "শিক্ষা", 120, 250), ("🛠️", "দক্ষতা প্রশিক্ষণ", 700, 250), ("🔬", "গবেষণা", 120, 760), ("🤝", "কমিউনিটি", 700, 760)]
    h = '<div id="hub4" class="hub">FUND<br><small>৫%</small></div>'
    h += "".join(f'<div id="sp4{k}" class="glass spoke" style="left:{x}px;top:{y}px"><span class="emo e90" style="position:relative;display:inline-block">{ic}</span><div>{lb}</div></div>' for k, (ic, lb, x, y) in enumerate(spokes))
    h += '<div id="ppl4" class="glass people">👩‍🌾 👨‍💻 👩‍🏫 👷 ← AI-এর কারণে কাজ বদলানো মানুষ</div>'
    st = (e - s) / 6
    a = [pop("#hub4", s), f'tl.to("#hub4",{{scale:1.08,duration:.5,yoyo:true,repeat:{max(1,int((e-s)/.5)-1)},ease:"sine.inOut"}},{R(s+.5)});']
    a += [pop(f"#sp4{k}", s + st * (k + .7)) for k in range(4)]
    a += [slide("#ppl4", s + st * 4.3, y=200)]
    return h, a


# 5 — status pipeline: announced ✓ → approval ⏳ → distribution: no announcement yet
@scene(5)
def _(s, e):
    h = """<div class="pipe"><div id="st5a" class="glass stg ok">✓<br>ঘোষণা</div><div class="pline"></div>
      <div id="st5b" class="glass stg wait">⏳<br>অনুমোদন</div><div class="pline dim"></div>
      <div id="st5c" class="glass stg no">—<br>বিতরণ</div></div>
    <div id="ny5" class="notyet">এখনো ঘোষণা নেই</div>"""
    st = (e - s) / 4
    a = [pop("#st5a", s), pop("#st5b", s + st), pop("#st5c", s + st * 2),
         f'tl.from("#ny5",{{scale:2.5,opacity:0,rotation:-8,duration:.25,ease:"power4.in"}},{R(s+st*2.6)});', shake("#s5in", s + st * 2.6 + .25)]
    return h, a


# 6 — World Bank: globe zooms to South Asia; small chip vs big server
@scene(6)
def _(s, e):
    h = f"""<div id="wb6" class="glass wbtag">🏦 WORLD BANK</div>
    <div id="gz6" class="gwrap" style="left:315px;top:300px">{globe("g6", 450)}<div id="pin6" class="pin6"></div></div>
    <div id="cmpA6" class="glass sizecard" style="left:80px"><div class="emo e110" style="position:relative;margin:0 auto">🏢</div><div>বড় AI</div><small>বিশাল খরচ</small></div>
    <div id="cmpB6" class="glass sizecard hi" style="left:700px"><div class="emo e110" style="position:relative;margin:0 auto">🔹</div><div>ছোট AI</div><small>বড় সুযোগ</small></div>"""
    st = (e - s) / 4
    a = [pop("#wb6", s), f'tl.fromTo("#g6",{{x:0}},{{x:260,duration:{R(st*1.6)},ease:"power2.inOut"}},{R(s+.1)});',
         f'tl.to("#gz6",{{scale:1.25,duration:{R(st*1.6)},ease:"power2.inOut"}},{R(s+.1)});', pop("#pin6", s + st * 1.6),
         slide("#cmpA6", s + st * 2.2, x=-500), slide("#cmpB6", s + st * 2.8, x=500)]
    return h, a


# 7 — phone with weak signal still answering in Bangla; three feature chips
@scene(7)
def _(s, e):
    h = """<div id="ph7" class="phone2" style="left:340px;top:220px;width:400px;height:620px"><div class="pscreen">
      <div class="sig"><i></i><i></i><i class="off"></i><i class="off"></i> 2G</div>
      <div id="c7a" class="cb me2">সার কতটুকু দিব?</div><div id="c7b" class="cb ai3">বিঘাপ্রতি… ✅</div></div></div>
    <div id="f7a" class="glass feat" style="left:40px;top:280px">🗣️ স্থানীয় ভাষা</div>
    <div id="f7b" class="glass feat" style="left:640px;top:430px">📶 কম ইন্টারনেট</div>
    <div id="f7c" class="glass feat" style="left:60px;top:700px">🎯 নির্দিষ্ট কাজ</div>"""
    st = (e - s) / 4
    a = [slide("#ph7", s, y=300), pop("#f7a", s + .2), pop("#c7a", s + st), pop("#f7b", s + st * 1.2),
         pop("#c7b", s + st * 1.9), pop("#f7c", s + st * 2.5)]
    return h, a


# 8 — Bangladesh opportunity: farm, education, small business cards
@scene(8)
def _(s, e):
    bars = "".join(f'<i style="height:{h}px"></i>' for h in (40, 70, 55, 90, 110))
    h = f"""<div id="bdm8" class="glass bdbadge">🇧🇩 বাংলাদেশ</div>
    <div id="o8a" class="glass opp" style="left:60px;top:330px"><div class="emo e110" style="position:relative">🌾</div><b>কৃষি</b><p>রোগ চেনা · আবহাওয়া</p></div>
    <div id="o8b" class="glass opp" style="left:560px;top:330px"><div class="emo e110" style="position:relative">📚</div><b>শিক্ষা</b><p>বাংলা লার্নিং সহকারী</p></div>
    <div id="o8c" class="glass opp wide" style="left:60px;top:690px"><div class="emo e110" style="position:relative">🏪</div><b>ছোট ব্যবসা</b><div class="sme">{bars}</div><p>স্টক ও বিক্রি ড্যাশবোর্ড</p></div>"""
    st = (e - s) / 4
    a = [pop("#bdm8", s), slide("#o8a", s + st * .8, x=-500), slide("#o8b", s + st * 1.5, x=500), slide("#o8c", s + st * 2.3, y=300)]
    a += [f'tl.from("#o8c .sme i",{{scaleY:0,transformOrigin:"50% 100%",duration:.3,stagger:.08,ease:"back.out(2)"}},{R(s+st*2.6)});']
    return h, a


# 9 — guardrails checklist with human + AI
@scene(9)
def _(s, e):
    rows = "".join(f'<div id="g9{k}" class="glass guard"><span class="gt">✓</span>{t}</div>' for k, t in enumerate(("সঠিক বাংলা তথ্য", "নিরাপত্তা", "মানুষের তত্ত্বাবধান")))
    h = f"""<div id="hs9" class="emo e200" style="left:440px;top:220px">🧑‍💼</div><div class="guards">{rows}</div>"""
    st = (e - s - .5) / 3
    a = [pop("#hs9", s)] + [slide(f"#g9{k}", s + .3 + k * st, x=-600) for k in range(3)]
    return h, a


# 10 — TODAY'S TOOL reveal (text wordmark, no logo)
@scene(10)
def _(s, e):
    h = """<div id="tt10" class="todaytag">TODAY'S TOOL</div><div id="nb10" class="glass toolcard"><div class="emo e140" style="position:relative;display:inline-block">📓</div><div class="tname2">NotebookLM</div><span class="free2">FREE</span></div>"""
    a = [f'tl.from("#tt10",{{y:-120,opacity:0,duration:.4,ease:"back.out(2)"}},{s});',
         f'tl.from("#nb10",{{rotationY:90,transformPerspective:1000,opacity:0,duration:.6,ease:"back.out(1.4)"}},{R(s+.2)});']
    return h, a


# 11 — illustrated workflow: upload → summary → Q&A (not a real screen recording)
@scene(11)
def _(s, e):
    h = """<div class="illus">illustration</div>
    <div id="w11a" class="glass wstep" style="top:240px"><span class="wn">1</span><span class="emo e90" style="position:relative;display:inline-block">📄</span> নিজের নথি আপলোড</div>
    <div id="w11b" class="glass wstep" style="top:470px"><span class="wn">2</span><span class="emo e90" style="position:relative;display:inline-block">📝</span> সারাংশ তৈরি</div>
    <div id="w11c" class="glass wstep" style="top:700px"><span class="wn">3</span><span class="emo e90" style="position:relative;display:inline-block">❓</span> পড়াশোনার প্রশ্ন</div>
    <div id="up11" class="upbar2"><div id="upf11" class="upfill2"></div></div>"""
    st = (e - s) / 5
    a = [slide("#w11a", s, x=-600), f'tl.fromTo("#upf11",{{scaleX:0}},{{scaleX:1,duration:{R(st*1.2)},ease:"power2.inOut"}},{R(s+.3)});',
         slide("#w11b", s + st * 1.7, x=600), slide("#w11c", s + st * 3.2, x=-600)]
    return h, a


# 12 — twin cards: seize the opportunity / verify facts
@scene(12)
def _(s, e):
    h = """<div id="t12a" class="glass twin" style="left:60px"><div class="emo e140" style="position:relative;margin:0 auto">🚀</div><b>সুযোগ কাজে লাগান</b></div>
    <div id="t12b" class="glass twin" style="left:560px"><div class="emo e140" style="position:relative;margin:0 auto">🔍</div><b>তথ্য যাচাই করুন</b></div>
    <div id="amp12" class="amp">+</div>"""
    st = (e - s) / 3
    a = [slide("#t12a", s, x=-500), pop("#amp12", s + st), slide("#t12b", s + st * 1.4, x=500)]
    return h, a


# 13 — globe outro with light trails: DAILY AI NEWS + follow
@scene(13)
def _(s, e):
    h = f"""<div class="trails"><i class="tr1"></i><i class="tr2"></i><i class="tr3"></i></div>
    <div class="gwrap" style="left:290px;top:200px">{globe("g13", 500)}</div>
    <div id="dn13" class="holotxt" style="top:760px">DAILY AI NEWS</div>
    <div id="fb13" class="followbtn" style="top:900px">ফলো করুন 🔔</div>"""
    a = [f'tl.fromTo("#g13",{{x:0}},{{x:200,duration:{R(e-s)},ease:"none"}},{s});', pop("#dn13", s + .2), pop("#fb13", s + (e - s) * .5)]
    return h, a


# 14 — presenter name card: Rubel Miah
@scene(14)
def _(s, e):
    h = """<div id="nc14" class="namecard"><div class="ncbar"></div><div class="ncname">RUBEL MIAH</div><div class="ncbn">রুবেল মিয়া · AI খবর</div></div>"""
    a = [f'tl.from("#nc14 .ncbar",{{scaleX:0,transformOrigin:"0% 50%",duration:.35,ease:"expo.out"}},{s});',
         f'tl.from("#nc14 .ncname",{{y:60,opacity:0,duration:.4,ease:"expo.out"}},{R(s+.15)});',
         f'tl.from("#nc14 .ncbn",{{y:40,opacity:0,duration:.4,ease:"expo.out"}},{R(s+.3)});']
    return h, a


# 15 — follow options: platform pills get tapped one by one
@scene(15)
def _(s, e):
    plats = [("Facebook", "#1877F2"), ("YouTube", "#FF0033"), ("Instagram", "#E1306C"), ("TikTok", "#25F4EE")]
    h = "".join(f'<div id="pf{k}" class="glass plat" style="top:{230+k*170}px"><span class="pdot" style="background:{c}"></span>{n}<span id="pfb{k}" class="pfol">FOLLOW</span></div>' for k, (n, c) in enumerate(plats))
    st = (e - s - .3) / 4
    a = []
    for k in range(4):
        a += [slide(f"#pf{k}", s + k * .12, x=-700 if k % 2 == 0 else 700),
              f'tl.to("#pfb{k}",{{scale:.88,backgroundColor:"#3dff9a",color:"#001",duration:.1,yoyo:true,repeat:1}},{R(s+.6+k*st)});',
              f'tl.set("#pfb{k}",{{backgroundColor:"#3dff9a",color:"#001"}},{R(s+.8+k*st)});']
    return h, a


def end_card(s, e):
    h = """<div class="trails"><i class="tr1"></i><i class="tr2"></i><i class="tr3"></i></div>
    <div class="holotxt" style="top:330px;font-size:96px">DAILY AI NEWS</div><div class="holosub">FOLLOW FOR MORE</div>
    <div class="glass credits9"><div><span class="crl2">Explainer</span>Rubel Miah</div><div><span class="crl2">Video Editor</span>Paloan</div></div>"""
    a = [pop("#sEin .holotxt", s), pop("#sEin .holosub", s + .3), f'tl.from("#sEin .credits9",{{y:200,opacity:0,duration:.5,ease:"expo.out"}},{R(s+.7)});']
    return h, a


SECTIONS = [(0, "#7b5cff", "🔴 BREAKING"), (2, "#00d4ff", "🏢 ANTHROPIC"), (4, "#b46bff", "🤝 PUBLIC BENEFIT"),
            (6, "#00e0b0", "🌏 WORLD BANK"), (8, "#00c8ff", "🇧🇩 BANGLADESH"), (10, "#9d7bff", "🛠️ TODAY'S TOOL"), (12, "#ff5fd2", "⭐ FOLLOW")]
HEADLINES = ["ANTHROPIC • 5% SHARES • SMALL AI", "PUBLIC BENEFIT FUND | 5% PROPOSED", "AI FOR PUBLIC BENEFIT",
             "SMALL AI • LOCAL LANGUAGE • LOW CONNECTIVITY", "AI OPPORTUNITIES FOR BANGLADESH", "TODAY'S TOOL | NOTEBOOKLM", "DAILY AI NEWS | FOLLOW FOR MORE"]
TICKER = "BREAKING  •  Anthropic: ৫% শেয়ার Public Benefit Fund-এ (শেয়ারহোল্ডার অনুমোদন সাপেক্ষে)  •  World Bank: ছোট AI = বড় সুযোগ  •  আজকের টুল: NotebookLM  •  ১৯ অক্টোবর ২০২৬  •  "


def build():
    clips, anims, cues = [], [], []
    for i, (ids, chunks, sfx) in enumerate(LINES):
        s, e = WIN[i]
        h, a = S[i](s, e)
        clips.append(f'<div id="sc{i}" class="clip scene" data-start="{s}" data-duration="{R(e-s)}" data-track-index="4"><div id="s{i}in" class="scene-in">{h}</div></div>')
        anims.append(f'tl.fromTo("#s{i}in",{{y:14}},{{y:-14,duration:{R(e-s)},ease:"none"}},{s});')
        anims += a
        c, ca = captions(i, chunks, TIMES[i][0], max(TIMES[i][1], s + .8)); clips += c; anims += ca
        for k, fx in enumerate(sfx):
            cues.append({"t": R(s + (0 if k == 0 else (e - s) * .55)), "end": e, "sfx": fx})
    h, a = end_card(END_S, DURATION)
    clips.append(f'<div id="scE" class="clip scene" data-start="{END_S}" data-duration="{R(DURATION-END_S)}" data-track-index="4"><div id="sEin" class="scene-in">{h}</div></div>')
    anims += a; cues.append({"t": END_S, "end": DURATION, "sfx": "boom"})


    # ---- Lottie layers (vector draw-ons with Disney keyframes), timed to scene beats ----
    OP = int(DURATION * LG.FPS) + 2
    def W(i): return WIN[i]
    lots = []
    s0, e0 = W(0); lots.append(("b0", LG.burst(s0 + .9, OP, 720, "#00e5ff", "#9d7bff"), 180, 50, 720, 720, s0, e0 - s0))
    s6, e6 = W(6); st6 = (e6 - s6) / 4; lots.append(("r6", LG.ripple(s6 + st6 * 1.6, e6, OP, 360, "#ff4d8d"), 380, 290, 360, 360, s6, e6 - s6))
    s9, e9 = W(9); lots.append(("c9", LG.check_badge(e9 - .8, OP, 220, "#3dff9a"), 820, 230, 220, 220, s9, e9 - s9))
    s10, e10 = W(10); lots.append(("b10", LG.burst(s10 + .55, OP, 640, "#3dff9a", "#00e5ff"), 220, 260, 640, 640, s10, e10 - s10))
    s14, e14 = W(14); lots.append(("b14", LG.burst(s14 + .3, OP, 420, "#9d7bff", "#00e5ff"), 620, 230, 420, 420, s14, e14 - s14))
    s15, e15 = W(15); st15 = (e15 - s15 - .3) / 4
    for k in range(4):
        lots.append((f"bf{k}", LG.burst(s15 + .6 + k * st15, OP, 260, "#3dff9a", "#ffffff"), 760, 230 + k * 170 - 65, 260, 260, s15, e15 - s15))
    lots.append(("bEnd", LG.burst(END_S + .3, OP, 640, "#00e5ff", "#ff5fd2"), 220, 60, 640, 640, END_S, DURATION - END_S))
    lotdata = {}
    for k, (nm, data, x, y, w, h, st, du) in enumerate(lots):
        clips.append(f'<div id="lot_{nm}" class="clip lot" data-start="{R(st)}" data-duration="{R(du)}" data-track-index="9" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>')
        lotdata[nm] = data
    for k, (li, col, label) in enumerate(SECTIONS):
        s = LS[li]; e = LS[SECTIONS[k + 1][0]] if k + 1 < len(SECTIONS) else DURATION
        anims.append(f'tl.to("#glow",{{backgroundColor:"{col}",duration:.3}},{s});')
        clips.append(f'<div id="sec{k}" class="clip secpill" data-start="{s}" data-duration="{R(e-s)}" data-track-index="7"><div id="secp{k}" class="secp">{label}</div></div>')
        anims.append(f'tl.from("#secp{k}",{{y:-90,opacity:0,duration:.3,ease:"back.out(2)"}},{R(s+.05)});')
        if li:
            anims.append(f'tl.set("#flash",{{backgroundColor:"{col}"}},{R(s-.3)});')
            anims.append(f'tl.fromTo("#flash",{{x:-1100}},{{x:1100,duration:.6,ease:"power3.inOut"}},{R(s-.3)});')
    anims.append(f'tl.set("#flash",{{backgroundColor:"#111"}},{R(END_S-.3)});')
    anims.append(f'tl.fromTo("#flash",{{x:-1100}},{{x:1100,duration:.6,ease:"power3.inOut"}},{R(END_S-.3)});')
    for k, (li, _c, _l) in enumerate(SECTIONS):
        s = LS[li]; e = LS[SECTIONS[k + 1][0]] if k + 1 < len(SECTIONS) else END_S
        tag = "BREAKING" if k == 0 else ("SAFETY" if k == 5 else "AI NEWS")
        clips.append(f'<div id="hl{k}" class="clip hlbar" data-start="{R(s)}" data-duration="{R(e-s)}" data-track-index="8"><div id="hlg{k}" class="hltag">{tag}</div><div id="hlt{k}" class="hltext">{H.escape(HEADLINES[k])}</div></div>')
        anims.append(f'tl.from("#hlg{k}",{{x:-300,duration:.3,ease:"power3.out"}},{R(s+.15)});')
        anims.append(f'tl.from("#hlt{k}",{{scaleX:0,transformOrigin:"0% 50%",duration:.35,ease:"power3.out"}},{R(s+.3)});')
    for k, cls in enumerate(("tr1", "tr2", "tr3")):
        per = 1.8 + k * .5
        anims.append(f'tl.fromTo(".{cls}",{{x:-1100}},{{x:1100,duration:{per},repeat:{max(0,int(DURATION/per)-1)},ease:"power1.inOut"}},{k*.4});')
    anims.append(f'tl.fromTo("#tick",{{x:0}},{{x:{-int(DURATION*70)},duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#livedot",{{opacity:1}},{{opacity:.2,duration:.5,yoyo:true,repeat:{int(DURATION/.5)-1}}},0);')

    rnd = random.Random(5); parts = []
    for k in range(18):
        x0, y0, sz = rnd.randint(20, 1040), rnd.randint(150, 1800), rnd.choice((6, 8, 10, 14))
        parts.append(f'<div id="pt{k}" class="pt" style="left:{x0}px;top:{y0}px;width:{sz}px;height:{sz}px"></div>')
        anims.append(f'tl.fromTo("#pt{k}",{{y:0}},{{y:{-rnd.randint(200, 600)},duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#grid",{{y:0}},{{y:-480,duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#glow",{{rotation:0}},{{rotation:180,duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#shape2",{{rotation:0,y:0}},{{rotation:-90,y:160,duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#prog",{{scaleX:0}},{{scaleX:1,duration:{DURATION},ease:"none"}},0);')

    page = (TEMPLATE.replace("%CLIPS%", "\n".join(clips)).replace("%ANIMS%", "\n".join(anims))
            .replace("%PARTS%", "\n".join(parts)).replace("%LOTDATA%", json.dumps(lotdata, separators=(",", ":"))).replace("%TICKER%", H.escape(TICKER * 6)).replace("%DUR%", str(DURATION)))
    (HF / "index.html").write_text(page, encoding="utf-8")
    (ROOT / "cues.json").write_text(json.dumps({"duration": DURATION, "cues": cues, "drop_t": LS[12], "tense": [LS[4], LS[6]]}, indent=1))
    # subtitles
    def ts(v): return f"{int(v//3600):02d}:{int(v%3600//60):02d}:{int(v%60):02d},{int(round((v%1)*1000)):03d}"
    srt = [f"{i+1}\n{ts(TIMES[i][0])} --> {ts(TIMES[i][1])}\n{' '.join(c).replace('*','')}\n" for i, (_a, c, _b) in enumerate(LINES)]
    (ROOT / "renders/subtitles.srt").write_text("\n".join(srt), encoding="utf-8")
    print("duration", DURATION, "clips", len(clips), "anims", len(anims), "cues", len(cues))


TEMPLATE = r"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>Daily AI News Holo</title>
<script src="assets/gsap.min.js"></script>
<script src="assets/lottie_light.min.js"></script>
<style>
@font-face{font-family:"HS";font-weight:700;src:url(assets/hind-siliguri-bengali-700-normal.woff2) format("woff2");unicode-range:U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1;}
@font-face{font-family:"HS";font-weight:700;src:url(assets/hind-siliguri-latin-700-normal.woff2) format("woff2");}
@font-face{font-family:"Noto Color Emoji";src:local("Noto Color Emoji");}
@font-face{font-family:"HS";font-weight:500;src:url(assets/hind-siliguri-bengali-500-normal.woff2) format("woff2");unicode-range:U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1;}
@font-face{font-family:"HS";font-weight:500;src:url(assets/hind-siliguri-latin-500-normal.woff2) format("woff2");}
:root{--y:#FFE600;--g:#39FF14;--r:#FF3B3B;--c:#00d4ff}
body{margin:0;background:#05060a;font-family:"HS","Noto Color Emoji",sans-serif;color:#fff}
#root{position:relative;width:1080px;height:1920px;overflow:hidden}
#bg{position:absolute;left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 30%,#141826,#05060a 70%)}
#glow{position:absolute;left:90px;top:120px;width:900px;height:900px;border-radius:50%;background-color:#00c8ff;opacity:.28;filter:blur(140px)}
#grid{position:absolute;left:0;top:0;width:1080px;height:2400px;opacity:.5;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 80px),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 80px)}
.pt{position:absolute;border-radius:50%;background:rgba(255,255,255,.35)}
#vig{position:absolute;left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(0,0,0,.65))}
#flash{position:absolute;left:0;top:0;width:1080px;height:1920px;background:#fff;opacity:0}
#prog{position:absolute;left:0;top:0;width:1080px;height:12px;background:var(--y);transform-origin:0 50%}
#brand{position:absolute;left:36px;top:40px;padding:8px 18px;border-radius:12px;background:rgba(255,255,255,.08);font:700 30px "HS"}
.secpill{position:absolute;left:0;top:0;width:1080px;height:200px}
.secp{position:absolute;right:36px;top:36px;padding:10px 24px;border-radius:999px;background:rgba(0,0,0,.55);border:2px solid rgba(255,255,255,.18);font:700 32px "HS"}
.scene{position:absolute;left:0;top:0;width:1080px;height:1240px}
.scene-in{position:absolute;left:0;top:0;width:1080px;height:1240px;transform-origin:50% 50%}
.cap{position:absolute;left:0;top:1250px;width:1080px;height:280px;display:flex;align-items:center;justify-content:center}
.capline{max-width:960px;text-align:center;font:700 88px/1.18 "HS";text-shadow:0 6px 0 #000,0 -3px 0 #000,4px 0 0 #000,-4px 0 0 #000,4px 4px 0 #000,-4px 4px 0 #000,0 10px 26px rgba(0,0,0,.8)}
.w{display:inline-block;margin:0 12px}.hl{color:var(--y)}.y{color:var(--y)}.r{color:var(--r)}
.emo{position:absolute;display:block;text-align:center;font-family:"Noto Color Emoji"}
.e90{width:90px;height:90px;font-size:80px;line-height:90px}.e110{width:110px;height:110px;font-size:96px;line-height:110px}
.e140{width:140px;height:140px;font-size:120px;line-height:140px}.e200{width:200px;height:200px;font-size:170px;line-height:200px}
.e240{width:240px;height:240px;font-size:210px;line-height:240px}.e320{width:320px;height:320px;font-size:280px;line-height:320px}.e360{width:360px;height:360px;font-size:310px;line-height:360px}
.pill{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:200px;padding:16px 34px;border-radius:999px;font:700 46px "HS";white-space:nowrap}
.big-pill{font-size:72px;padding:20px 50px}
.dark-bg{background:rgba(10,12,18,.85);border:2px solid rgba(255,255,255,.2)}.red-bg{background:var(--r)}.green-bg{background:#1dbf73}.gold-bg{background:var(--y);color:#111}
.big-t{position:absolute;left:0;top:960px;width:1080px;text-align:center;font:700 104px/1.1 "HS";text-shadow:0 8px 30px rgba(0,0,0,.6)}
.ring{position:absolute;width:600px;height:600px;border-radius:50%;box-sizing:border-box}
.cyan-ring{border:10px solid var(--c)}.gold-ring{border:10px solid var(--y)}
.nn{position:absolute;width:26px;height:26px;border-radius:50%;background:var(--c);box-shadow:0 0 30px var(--c)}
.bigq{position:absolute;left:340px;top:260px;width:400px;height:560px;font:700 560px/560px "HS";text-align:center;color:var(--c);text-shadow:0 0 90px rgba(0,212,255,.8)}
.cage{position:absolute;left:150px;top:250px;width:780px;height:700px;border:8px solid rgba(255,255,255,.35);border-radius:40px;box-sizing:border-box;padding:60px 40px}
.shard{position:absolute;width:100px;height:100px;border-left:8px solid rgba(255,255,255,.6);border-top:8px solid rgba(255,255,255,.6)}
.bub{display:block;padding:22px 30px;border-radius:30px;font:700 46px/1.3 "HS";margin-bottom:30px;max-width:560px}
.me{background:#1f6feb;margin-left:auto}.ai2{background:#2a2f3d}
.bub.l{margin-right:auto}.bub.r{margin-left:auto}
.stamp2{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:520px;padding:16px 40px;border:12px solid;border-radius:26px;font:700 100px "HS";transform:rotate(-8deg);background:rgba(0,0,0,.45)}
.green-st{border-color:var(--g);color:var(--g)}
.wnode{position:absolute;top:300px;width:220px;height:240px;border-radius:30px;background:rgba(20,24,34,.9);border:4px solid var(--c);text-align:center}
.wico{font:200px/1 "Noto Color Emoji";font-size:110px;margin-top:20px}.wlab{font:700 44px "HS";margin-top:10px}
.wline{position:absolute;top:416px;width:80px;height:10px;background:var(--c);transform-origin:0 50%}
.pulse{position:absolute;left:230px;top:400px;width:42px;height:42px;border-radius:50%;background:#fff;box-shadow:0 0 30px #fff,0 0 60px var(--c)}
.kin{position:absolute;left:0;top:640px;width:1080px;text-align:center;font:700 130px "HS";color:var(--c);letter-spacing:6px;text-shadow:0 0 50px rgba(0,212,255,.7)}
.gearrow{position:absolute;left:0;top:830px;width:1080px;display:flex;justify-content:center;gap:40px}.gearrow .emo{position:relative}
.phone{position:absolute;left:190px;top:170px;width:700px;height:900px;border-radius:60px;background:#10131b;border:10px solid #2a2f3d;box-sizing:border-box;padding:34px}
.ph-top{font:700 44px "HS";text-align:center;color:#9fe;padding-bottom:20px;border-bottom:2px solid #2a2f3d;margin-bottom:34px}
.badge2{position:absolute;padding:12px 26px;border-radius:16px;font:700 40px "HS"}
.panel{position:absolute;border-radius:30px;background:rgba(20,24,34,.95);border:3px solid rgba(255,255,255,.18);padding:28px;box-sizing:border-box}
.ptitle{font:700 46px "HS";margin-bottom:20px}
.minichart{display:flex;align-items:flex-end;gap:18px;height:270px}
.cbar{display:block;flex:1;background:linear-gradient(#00d4ff,#0077ff);border-radius:10px 10px 0 0;transform-origin:50% 100%}
.kpi{position:absolute;right:30px;top:24px;padding:6px 18px;border-radius:12px;background:#1dbf73;font:700 40px "HS"}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}.day{height:60px;border-radius:10px;background:#252a35;font:500 28px/60px "HS";text-align:center;color:#aab}
.orb{position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(20,24,34,.95);border:4px solid var(--c);font:72px/120px "Noto Color Emoji";text-align:center}
.rays{position:absolute;left:-210px;top:-260px;width:1500px;height:1500px;border-radius:50%;background:repeating-conic-gradient(rgba(255,230,0,.2) 0 10deg,transparent 10deg 20deg)}
.price{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:280px;padding:10px 40px;font:700 140px "HS";color:#ccc}
.strike-line{position:absolute;left:5%;top:50%;width:90%;height:16px;margin-top:-8px;background:var(--r);display:block;transform-origin:0 50%;border-radius:8px}
.zero{position:absolute;left:0;top:380px;width:1080px;text-align:center;font:700 380px/1 "HS";color:var(--g);text-shadow:0 0 80px rgba(57,255,20,.6)}
.tool{position:absolute;left:110px;width:860px;height:190px;border-radius:36px;background:rgba(20,24,34,.95);border:3px solid rgba(255,255,255,.2);display:flex;align-items:center;gap:30px;padding:0 40px;box-sizing:border-box}
.tdot2{display:block;width:70px;height:70px;border-radius:20px;flex:none}
.tname{font:700 64px "HS"}.tsub{font:500 36px "HS";color:#bbc}
.ftag{position:absolute;right:36px;top:50px;padding:10px 22px;border-radius:14px;background:var(--g);color:#000;font:700 44px "HS";transform:rotate(-6deg)}
.flow{position:absolute;left:0;top:900px;width:1080px;display:flex;align-items:center;justify-content:center;gap:20px}
.arr{font:700 70px "HS";color:var(--y)}.fpill{padding:14px 26px;border-radius:20px;background:#f2a33a;color:#111;font:700 44px "HS"}
.siren{position:absolute;left:0;top:0;width:1080px;height:1240px;background:radial-gradient(circle at 50% 40%,rgba(255,0,0,.6),transparent 60%)}
.warn{position:absolute;left:290px;top:180px;width:0;height:0;border-left:250px solid transparent;border-right:250px solid transparent;border-bottom:430px solid var(--y);filter:drop-shadow(0 0 40px rgba(255,230,0,.5))}
.warn-ex{position:absolute;left:-60px;top:90px;width:120px;font:700 300px/300px "HS";color:#111;text-align:center}
.fcard{position:absolute;top:420px;width:280px;height:400px;border-radius:30px;background:rgba(20,24,34,.95);border:3px solid rgba(255,255,255,.2);padding-top:60px;box-sizing:border-box;text-align:center}
.flab{font:700 60px "HS";margin-top:20px}
.fstamp{position:absolute;left:10px;top:150px;width:260px;padding:8px 0;border:8px solid var(--r);border-radius:18px;color:var(--r);font:700 64px "HS";transform:rotate(-14deg);background:rgba(0,0,0,.6);box-sizing:border-box}
.doc{position:absolute;left:220px;top:240px;width:640px;height:600px;border-radius:30px;background:#f4f5f7;padding:70px 50px;box-sizing:border-box}
.doc-row{display:flex;align-items:center;gap:26px;margin-bottom:50px}.doc-l{display:block;height:26px;border-radius:13px;background:#c4c9d4}
.tick{display:inline-block;width:70px;height:70px;border-radius:50%;background:#1dbf73;color:#fff;font:700 50px/70px "HS";text-align:center}
.bigcal{position:absolute;left:90px;top:260px;width:380px;height:440px;border-radius:30px;background:#f4f5f7;overflow:hidden;color:#111;text-align:center}
.calh{background:var(--r);color:#fff;font:700 54px/110px "HS"}
.calnum{position:relative;height:330px;overflow:hidden}.calcol{position:absolute;left:0;top:0;width:380px}.calcol div{height:180px;font:700 170px/180px "HS"}
.np-l{height:18px;background:#5a6070;border-radius:9px;margin:22px 0}
.chip2{position:absolute;left:140px;width:800px;padding:30px 0;border-radius:999px;background:rgba(20,24,34,.95);border:4px solid var(--y);font:700 76px "HS";text-align:center}
.follow{position:absolute;left:190px;top:640px;width:620px;height:180px;border-radius:90px;background:var(--y);color:#000;font:700 96px/180px "HS";text-align:center;box-shadow:0 0 80px rgba(255,230,0,.5)}
.cursor{position:absolute;width:0;height:0;border-left:26px solid transparent;border-right:26px solid transparent;border-bottom:62px solid #fff;transform:rotate(-30deg)}
.cursor.big{left:620px;top:770px}
.ecard-t{position:absolute;left:0;top:420px;width:1080px;text-align:center;font:700 150px/1.05 "HS";color:var(--y);text-shadow:0 0 70px rgba(255,200,0,.7)}
.ewords{position:absolute;left:0;top:820px;width:1080px;display:flex;justify-content:center;align-items:center;gap:22px}
.ew{display:inline-block;font:700 70px "HS";letter-spacing:4px}.dotsep{font:700 60px "HS";color:var(--y)}
.ichip{position:absolute;padding:14px 26px;border-radius:999px;background:rgba(20,24,34,.92);border:3px solid var(--c);font:700 44px "HS";white-space:nowrap}
.skill{position:absolute;top:300px;width:280px;height:340px;border-radius:30px;background:rgba(20,24,34,.95);border:3px solid rgba(255,255,255,.2);padding-top:50px;box-sizing:border-box;text-align:center}
.slab{font:700 46px "HS";margin-top:20px}.skx{position:absolute;left:0;top:30px;width:280px;font:700 260px/1 "HS";color:var(--r);text-shadow:0 0 40px rgba(255,0,0,.6)}
.browser{position:absolute;left:90px;top:200px;width:900px;height:860px;border-radius:30px;background:#f4f5f7;overflow:hidden;color:#111}
.bbar{height:80px;background:#dfe2e8;display:flex;align-items:center;gap:14px;padding:0 26px}.bbar>span{display:block;width:24px;height:24px;border-radius:50%;background:#ff5f57}
.bbar>span:nth-child(2){background:#febc2e}.bbar>span:nth-child(3){background:#28c840}
.burl{flex:1;margin-left:20px;height:46px;border-radius:23px;background:#fff;font:500 30px/46px "HS";padding-left:24px;color:#555}
.bbody{position:relative;height:780px}.caret2{position:absolute;left:80px;top:80px;width:8px;height:90px;background:#111}
.bempty{position:absolute;left:0;top:340px;width:900px;text-align:center;font:700 60px "HS";color:#bbb}
.promptbox{position:absolute;left:90px;top:260px;width:900px;border-radius:36px;background:#141a26;border:4px solid var(--c);padding:36px 40px;box-sizing:border-box;box-shadow:0 0 60px rgba(0,212,255,.3)}
.plabel{font:700 40px "HS";color:var(--c);margin-bottom:16px}.ptext{font:700 64px/1.35 "HS";min-height:260px}
.pwd{display:inline-block;margin-right:16px}.caret3{display:inline-block;width:6px;height:64px;background:#fff;vertical-align:middle}
.gobtn{display:block;width:fit-content;margin-left:auto;padding:18px 36px;border-radius:20px;background:var(--c);color:#000;font:700 46px "HS"}
.bbody2{padding:26px}.nav{display:flex;align-items:center;gap:20px;font:700 44px "HS";height:80px}.navl{display:block;width:90px;height:16px;border-radius:8px;background:#c4c9d4;margin-left:auto}
.hero{height:230px;border-radius:24px;margin:16px 0 22px;background:linear-gradient(120deg,#7a3cff,#ff5fa2);color:#fff;font:700 64px "HS";padding:34px;box-sizing:border-box}
.hbtn{display:block;width:fit-content;margin-top:20px;padding:10px 26px;border-radius:14px;background:#fff;color:#111;font:700 34px "HS"}
.grid5{display:flex;gap:20px}.pcard{flex:1;height:300px;border-radius:20px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.12);padding:16px;box-sizing:border-box}
.pimg{height:150px;border-radius:14px;background:#eef0f4;font:100px/150px "Noto Color Emoji";text-align:center}
.pl{height:18px;border-radius:9px;background:#c4c9d4;margin-top:18px}.short{width:60%}
.code{position:absolute;left:300px;top:900px;padding:22px 34px;border-radius:20px;background:#0d1117;border:3px solid #30363d;font:700 44px "HS";color:#7ee787}.ck{color:#ff7b72}
.tagx{position:absolute;padding:10px 24px;border-radius:14px;background:var(--y);color:#111;font:700 40px "HS"}
.wave{position:absolute;width:140px;height:260px;border:12px solid var(--y);border-left:none;border-top-color:transparent;border-bottom-color:transparent;border-radius:0 200px 200px 0;box-sizing:border-box}
.screen{position:absolute;top:300px;width:280px;height:500px;border-radius:30px;background:rgba(20,24,34,.95);border:3px solid rgba(255,255,255,.25);padding:20px;box-sizing:border-box}
.screen.sq{height:420px;top:340px}.stitle{font:700 34px "HS";margin-bottom:16px}
.mini-hero{height:140px;border-radius:16px;background:linear-gradient(120deg,#4f8bff,#00d4ff)}
.post{height:220px;border-radius:16px;background:linear-gradient(135deg,#ff5fa2,#ffb800);font:700 46px/220px "HS";text-align:center}
.likes{font:700 34px "HS";margin-top:16px}.reelbox{height:380px;border-radius:16px;background:linear-gradient(#222,#7a3cff);position:relative}
.play{position:absolute;left:80px;top:130px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.9);color:#111;font:700 56px/110px "HS";text-align:center}
.arr2{position:absolute;top:500px;width:70px;font:700 70px "HS";color:var(--y);text-align:center}
.chips7{position:absolute;left:0;top:880px;width:1080px;display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
.ch7{display:inline-block;padding:12px 22px;border-radius:999px;background:rgba(180,107,255,.25);border:3px solid #b46bff;font:700 40px "HS"}
.fnode{position:absolute;width:360px;padding:24px 20px;border-radius:26px;background:rgba(20,24,34,.95);border:4px solid var(--g);font:700 40px "HS";display:flex;align-items:center;gap:16px;box-sizing:border-box}
.fico{font:70px "Noto Color Emoji"}.fwrap{position:absolute;width:10px;height:10px;transform-origin:0 50%}.fline{position:absolute;left:0;top:0;height:10px;background:var(--g);transform-origin:0 50%}
.tool{height:170px}.tname{flex:1}.tool .ftag{top:auto;bottom:-26px;right:30px}
.ew2{display:block}
.livedot{display:inline-block;width:20px;height:20px;border-radius:50%;background:#ff2d2d;margin-right:12px;vertical-align:middle}
#ticker{position:absolute;left:0;top:112px;width:1080px;height:58px;overflow:hidden;background:rgba(200,0,0,.85)}
.tickin{position:absolute;left:0;top:0;white-space:nowrap;font:700 34px/58px "HS";color:#fff}
.hlbar{position:absolute;left:40px;top:1100px;width:1000px;height:96px;display:flex;align-items:stretch}
.hltag{display:block;padding:0 26px;background:#ff2d2d;font:700 40px/96px "HS";border-radius:14px 0 0 14px}
.hltext{display:block;flex:1;padding:0 26px;background:rgba(255,255,255,.95);color:#0b0d12;font:700 48px/96px "HS";border-radius:0 14px 14px 0;white-space:nowrap;overflow:hidden}
.floorwrap{position:absolute;left:-300px;top:560px;width:1680px;height:700px;overflow:hidden;transform:perspective(700px) rotateX(62deg);transform-origin:50% 0}
.floor{position:absolute;left:0;top:-240px;width:1680px;height:1200px;background:repeating-linear-gradient(0deg,rgba(255,60,60,.55) 0 3px,transparent 3px 80px),repeating-linear-gradient(90deg,rgba(255,60,60,.55) 0 3px,transparent 3px 80px)}
.breaking{position:absolute;left:90px;top:270px;width:900px;padding:22px 0;background:#ff2d2d;font:700 92px "HS";text-align:center;transform-origin:0 50%;box-shadow:0 0 80px rgba(255,0,0,.6);letter-spacing:4px}
.bdot{display:inline-block;width:40px;height:40px;border-radius:50%;background:#fff;margin-right:24px;vertical-align:middle}
.bigword{position:absolute;left:0;top:470px;width:1080px;text-align:center;font:700 200px/1 "HS";text-shadow:0 0 60px rgba(255,255,255,.35)}
.tape{position:absolute;left:-150px;width:1500px;height:64px;background:repeating-linear-gradient(-45deg,#ffd000 0 40px,#111 40px 80px)}
.t1{top:200px;transform:rotate(-3deg)}.t2{top:760px;transform:rotate(2deg)}
.card3d{position:absolute;width:280px;height:340px;border-radius:30px;background:rgba(20,24,34,.95);border:4px solid var(--y);text-align:center;padding-top:30px;box-sizing:border-box;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.c3ico{font:700 120px/170px "HS";color:var(--y)}.c3lab{font:700 56px "HS";margin-top:10px}
.okmark{position:absolute;right:-20px;top:-20px;width:70px;height:70px;border-radius:50%;background:#1dbf73;font:700 46px/70px "HS"}
.cstage{position:absolute;left:0;top:0;perspective:800px}
.cube{position:absolute;left:0;top:0;transform-style:preserve-3d}
.cface{position:absolute;left:0;top:0;box-sizing:border-box;border:4px solid #7ff0ff;background:rgba(0,212,255,.18);box-shadow:inset 0 0 30px rgba(0,212,255,.5)}
.dsword{position:absolute;left:0;top:560px;width:1080px;text-align:center;font:700 150px "HS";color:#6aa8ff;text-shadow:0 0 50px rgba(79,139,255,.7)}
.qchip{position:absolute;padding:18px 30px;border-radius:999px;background:rgba(20,24,34,.92);border:3px solid var(--c);font:700 50px "HS"}
.calbig{font:700 230px/300px "HS"}
.verbox{position:absolute;left:520px;top:230px;width:480px;padding:30px;border-radius:30px;background:rgba(20,24,34,.95);border:4px solid var(--c);text-align:center;box-sizing:border-box}
.vold{font:700 52px "HS";color:#99a}.varrow{font:700 70px "HS";color:var(--g)}.vnew{font:700 120px/1 "HS";color:var(--c);text-shadow:0 0 40px rgba(0,212,255,.7)}
.upbar{height:28px;border-radius:14px;background:#252a35;margin-top:26px;overflow:hidden}.upfill{width:100%;height:100%;background:linear-gradient(90deg,#00d4ff,#39ff14);transform-origin:0 50%}
.uplab{font:700 30px "HS";color:var(--g);margin-top:12px}
.chip{position:absolute;left:390px;top:320px;width:300px;height:300px;border-radius:30px;background:linear-gradient(135deg,#1c2333,#0c1018);border:4px solid #4f8bff;box-shadow:0 0 70px rgba(79,139,255,.5)}
.core{position:absolute;left:60px;top:60px;width:180px;height:180px;border-radius:24px;background:radial-gradient(circle,#7ff0ff,#0077ff);font:700 90px/180px "HS";text-align:center;color:#001;box-shadow:0 0 60px #00d4ff}
.pin{position:absolute;width:34px;height:14px;background:#c9ced8;border-radius:4px}
.codepane{position:absolute;top:660px;width:300px;height:200px;border-radius:20px;background:#0d1117;border:3px solid #30363d;padding:20px;box-sizing:border-box}
.cph{font:700 34px "HS";color:#ff7b72;margin-bottom:10px}.cph.g{color:#7ee787}
.cl{height:14px;border-radius:7px;background:#3a4150;margin:14px 0;width:90%}.cl.bad{background:#a83a3a}.cl.gg{background:#2ea043}
.cbug,.cok{position:absolute;right:16px;top:14px;font:50px "Noto Color Emoji";color:var(--g)}.cok{font:700 54px "HS"}
.upbadge{position:absolute;padding:14px 30px;border-radius:18px;background:rgba(57,255,20,.15);border:3px solid var(--g);font:700 54px "HS"}
.tile{position:absolute;width:460px;height:340px;border-radius:30px;background:rgba(20,24,34,.95);border:3px solid rgba(180,107,255,.7);padding:24px;box-sizing:border-box}
.tt{font:700 40px "HS";margin-bottom:14px}.ptext2{font:700 54px/1.25 "HS";color:var(--y)}
.track{position:relative;height:200px;border-radius:100px;border:10px dashed #555;margin-top:10px}
.arrowx{position:absolute;width:80px;font:700 70px "HS";color:var(--y);text-align:center}
.chklist{position:absolute;left:190px;top:560px;width:700px}
.chk{display:block;padding:18px 30px;margin-bottom:22px;border-radius:24px;background:rgba(20,24,34,.95);border:3px solid var(--g);font:700 56px "HS"}
.chk .tick{margin-right:20px}
.searchbar{position:absolute;left:90px;top:440px;width:900px;height:140px;border-radius:70px;background:#fff;color:#111;display:flex;align-items:center;padding:0 40px;box-sizing:border-box;box-shadow:0 0 60px rgba(79,139,255,.5)}
.sico{font:60px "Noto Color Emoji";margin-right:24px}.sqt{font:700 60px "HS"}.sqc{display:inline-block;margin-right:16px}.searchbar .caret3{background:#111}
.apibadge{position:absolute;padding:24px 34px;border-radius:24px;background:rgba(20,24,34,.95);border:4px solid #4f8bff;font:700 56px "HS"}
.newt{display:inline-block;margin-left:16px;padding:4px 14px;border-radius:10px;background:#ff2d2d;font:700 30px "HS";vertical-align:middle}
.vnode{position:absolute;left:290px;width:500px;height:110px;border-radius:26px;background:rgba(20,24,34,.95);border:4px solid #4f8bff;display:flex;align-items:center;gap:24px;padding:0 30px;box-sizing:border-box;font:700 50px "HS"}
.vico{font:66px "Noto Color Emoji"}.vline{position:absolute;left:535px;width:10px;height:55px;background:#4f8bff;transform-origin:50% 0}
.packet{position:absolute;left:520px;top:290px;width:40px;height:40px;border-radius:50%;background:#fff;box-shadow:0 0 30px #fff,0 0 60px #4f8bff}
.repo{position:absolute;left:80px;top:230px;width:920px;padding:40px;border-radius:30px;background:#0d1117;border:3px solid #30363d;box-sizing:border-box;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.rhead{font:700 54px "HS";margin-bottom:20px}.rtags{margin-bottom:24px}
.rtag{display:inline-block;padding:8px 20px;border-radius:12px;background:#21262d;border:2px solid #4f8bff;font:700 34px "HS";margin-right:16px}.rtag.g{border-color:var(--g);color:var(--g)}
.frow{display:flex;justify-content:space-between;padding:14px 0;border-top:2px solid #21262d;font:500 30px "HS";color:#c9d1d9}.fsz{color:#8b949e}
.dbar{height:30px;border-radius:15px;background:#21262d;margin-top:26px;overflow:hidden}.dfill{width:100%;height:100%;background:linear-gradient(90deg,#ff8a00,#ffd400);transform-origin:0 50%}
.dlab{font:700 36px "HS";color:#ffd400;margin-top:12px}
.cmpcard{position:absolute;top:260px;width:420px;height:520px;border-radius:30px;background:rgba(20,24,34,.95);border:5px solid;text-align:center;padding-top:50px;box-sizing:border-box}
.cmpt{font:700 50px "HS";margin-top:30px}.cmps{font:700 40px/1.3 "HS";color:#bbc;margin-top:20px;padding:0 20px}
.neq{position:absolute;left:460px;top:420px;width:160px;height:160px;border-radius:50%;background:#ff2d2d;font:700 130px/150px "HS";text-align:center;box-shadow:0 0 70px rgba(255,0,0,.7)}
.meters{position:absolute;left:0;top:560px;width:1080px;display:flex;justify-content:center;gap:120px}
.mcol{text-align:center}.mbar{position:relative;width:150px;height:360px;border-radius:24px;background:#1c2130;overflow:hidden;border:3px solid rgba(255,255,255,.2)}
.mfill{position:absolute;left:0;bottom:0;width:100%;height:100%;transform-origin:50% 100%}.mlab{font:700 46px "HS";margin-top:16px}
.secdash{position:absolute;left:110px;top:240px;width:860px;padding:40px;border-radius:30px;background:rgba(14,18,26,.96);border:3px solid var(--g);box-sizing:border-box}
.sdh{font:700 54px "HS";margin-bottom:30px}.trow{display:flex;justify-content:space-between;align-items:center;padding:22px 0;border-top:2px solid #252a35;font:700 52px "HS"}
.tog{position:relative;width:130px;height:66px;border-radius:33px;background:#333a48}.knob{position:absolute;left:4px;top:4px;width:58px;height:58px;border-radius:50%;background:#99a}
.sdok{display:block;width:fit-content;margin:30px auto 0;padding:14px 40px;border:8px solid var(--g);border-radius:20px;color:var(--g);font:700 70px "HS"}
.globe{position:absolute;left:340px;top:220px;width:400px;height:400px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 35%,#2a6cff,#06235e);box-shadow:0 0 80px rgba(42,108,255,.6)}
.merwrap{position:absolute;left:0;top:0;width:400px;height:400px}.mer{position:absolute;top:0;width:110px;height:400px;border:3px solid rgba(255,255,255,.35);border-radius:50%;box-sizing:border-box}
.lat{position:absolute;left:0;width:400px;height:3px;background:rgba(255,255,255,.3)}
.ochip{position:absolute;padding:14px 26px;border-radius:999px;background:rgba(20,24,34,.92);border:3px solid var(--y);font:700 44px "HS"}
.credits{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:920px;padding:20px 40px;border-radius:26px;background:rgba(10,12,18,.85);border:2px solid rgba(255,255,255,.25);font:700 44px/1.5 "HS";text-align:center}
.crl{display:inline-block;margin-right:14px;padding:2px 14px;border-radius:10px;background:#ff2d2d;font:700 30px "HS";vertical-align:middle}

/* ===== EDITORIAL LIGHT THEME (overrides) ===== */
:root{--y:#2D5BFF;--g:#00A86B;--r:#FF3B30;--c:#2D5BFF}
body{color:#111}
#bg{background:#F4F1EA}
#glow{left:640px;top:-260px;width:760px;height:760px;opacity:.28;filter:none;border-radius:50%;overflow:hidden}
.glowcut{position:absolute;left:150px;top:150px;width:460px;height:460px;border-radius:50%;background:#F4F1EA}
#shape2{position:absolute;left:-140px;top:1500px;width:420px;height:420px;border:28px solid #111;border-radius:40px;opacity:.08}
#grid{opacity:1;background:radial-gradient(circle,rgba(0,0,0,.13) 2.2px,transparent 2.6px) 0 0/44px 44px}
.pt{border-radius:3px;background:transparent;border:3px solid rgba(0,0,0,.18);transform:rotate(45deg)}
#vig{background:none}
#flash{opacity:1;background:#111;transform:translateX(-1100px)}
#prog{background:#111;height:10px}
#brand{background:#111;color:#fff}
.secp{background:#fff;color:#111;border:3px solid #111}
#ticker{background:#111}.tickin{color:#fff}
.hltag{background:var(--r);border-radius:0}.hltext{background:#fff;border:4px solid #111;border-left:none;border-radius:0}
.capline{color:#111;text-shadow:none;font-size:84px}
.hl{color:#fff;background:#2D5BFF;padding:0 16px;border-radius:14px}
.card3d,.qchip,.verbox,.tile,.chk,.apibadge,.vnode,.cmpcard,.secdash,.ochip,.upbadge,.pill.dark-bg,.credits{background:#fff;color:#111;box-shadow:0 18px 40px rgba(0,0,0,.12)}
.pill.dark-bg,.credits,.qchip,.ochip{border:3px solid #111}
.card3d{border-width:5px}.cmps{color:#555}.trow{border-top-color:#eee}.tog{background:#ddd}.mbar{background:#e9e6df;border-color:#ccc}
.bigword{color:#111;text-shadow:none}.kin{color:#2D5BFF;text-shadow:none}.vnew{text-shadow:none}.dsword{color:#2D5BFF;text-shadow:none}
.floor{background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 3px,transparent 3px 80px),repeating-linear-gradient(90deg,rgba(0,0,0,.22) 0 3px,transparent 3px 80px)}
.cface{border-color:#2D5BFF;background:rgba(45,91,255,.12);box-shadow:none}
.rays{background:repeating-conic-gradient(rgba(0,0,0,.06) 0 10deg,transparent 10deg 20deg)}
.follow{background:#111;color:#fff;box-shadow:0 18px 40px rgba(0,0,0,.2)}
.ecard-t{color:#111;text-shadow:none}.ecard-t .y{color:#2D5BFF}
.packet{background:#2D5BFF;box-shadow:0 0 0 8px rgba(45,91,255,.2)}
.breaking{box-shadow:12px 12px 0 #111}
.searchbar{border:4px solid #111;box-shadow:10px 10px 0 #111}
.neq{box-shadow:8px 8px 0 #111}
.bigcal{box-shadow:10px 10px 0 #111;border:4px solid #111}
.repo{color:#fff}.repo .rtag{color:#fff}.repo .rtag.g{color:var(--g)}
.repo,.codepane,.chip{box-shadow:10px 10px 0 rgba(0,0,0,.25)}
/* ===== v3 creative components ===== */
.board{position:absolute;left:60px;top:230px;width:960px;padding:30px;border-radius:24px;background:#111;box-shadow:12px 12px 0 #FF3B30}
.bhead{font:700 30px "HS";color:#ffcf3a;letter-spacing:3px;margin-bottom:22px}
.flaps{display:flex;gap:10px;justify-content:center}.flaps.small{margin-top:16px}
.flap{position:relative;width:100px;height:150px;border-radius:12px;background:#222;overflow:hidden}
.flap.s{width:420px}
.flapin{display:block;width:100%;height:100%;font:700 110px/150px "HS";color:#fff;text-align:center;background:linear-gradient(#2a2a2a 50%,#1c1c1c 50%)}
.flap.s .flapin{font-size:96px;color:#ffcf3a}
.flapline{position:absolute;left:0;top:74px;width:100%;height:3px;background:#000}
.slotm{position:absolute;left:110px;top:220px;width:780px;padding:30px;border-radius:40px;background:#FF3B30;border:6px solid #111;box-shadow:12px 12px 0 #111}
.stop{font:700 64px "HS";color:#fff;text-align:center;letter-spacing:8px;margin-bottom:18px}
.reels{display:flex;gap:18px;justify-content:center}
.reel{width:220px;height:190px;border-radius:18px;background:#fff;border:5px solid #111;overflow:hidden;position:relative}
.rcol{position:absolute;left:0;top:0;width:220px}
.cell{height:190px;font:120px/190px "Noto Color Emoji";text-align:center}
.cell.big{font:700 100px/190px "HS";color:#2D5BFF}
.slab2{display:flex;justify-content:space-around;margin-top:16px;font:700 52px "HS";color:#fff}
.lever{position:absolute;left:910px;top:300px;width:22px;height:260px;background:#888;border-radius:11px;transform-origin:50% 100%}
.knob2{position:absolute;left:-24px;top:-50px;width:70px;height:70px;border-radius:50%;background:#FF3B30;border:5px solid #111}
.sonar{position:absolute;left:190px;top:200px;width:700px;height:520px;overflow:hidden}
.sring{position:absolute;border:4px solid rgba(0,163,196,.55);border-radius:50%}
.r1{left:250px;top:160px;width:200px;height:200px}.r2{left:150px;top:60px;width:400px;height:400px}.r3{left:50px;top:-40px;width:600px;height:600px}
.sweep{position:absolute;left:350px;top:-90px;width:350px;height:700px;transform-origin:0% 50%;background:linear-gradient(90deg,rgba(0,163,196,.35),transparent 80%);clip-path:polygon(0 50%,100% 20%,100% 50%)}
.blip{position:absolute;padding:14px 26px;border-radius:999px;background:#00A3C4;color:#fff;font:700 46px "HS";box-shadow:0 0 0 10px rgba(0,163,196,.2)}
.printer{position:absolute;left:150px;top:200px;width:780px;height:90px;border-radius:24px;background:#111}
.pslot{position:absolute;left:60px;top:58px;width:660px;height:14px;border-radius:7px;background:#444}
.ticketwin{position:absolute;left:190px;top:270px;width:700px;height:680px;overflow:hidden}
.ticket{position:absolute;left:0;top:0;width:700px;height:640px;background:#fff;border-radius:0 0 30px 30px;border:4px solid #111;border-top:none;box-sizing:border-box;padding:40px}
.tkrow{display:flex;justify-content:space-between;align-items:center}.tkl{font:700 28px "HS";color:#888;letter-spacing:3px}
.tkv{font:700 110px/1 "HS"}.tkv.b{color:#2D5BFF}.tks{font:700 36px "HS";color:#555}.tkplane{font:700 90px "HS";color:#FF3B30}
.tkdash{border-top:5px dashed #ccc;margin:30px 0}.tkrow2{display:flex;justify-content:space-between}.tkm{font:700 44px "HS"}
.barcode{height:90px;margin-top:34px;background:repeating-linear-gradient(90deg,#111 0 6px,transparent 6px 10px,#111 10px 12px,transparent 12px 20px)}
.rpg{position:absolute;left:90px;top:240px;width:900px;padding:40px;border-radius:30px;background:#fff;border:5px solid #111;box-shadow:12px 12px 0 #2D5BFF;box-sizing:border-box}
.rpgh{font:700 56px "HS";margin-bottom:30px}.lvl{display:inline-block;margin-left:16px;padding:4px 16px;border-radius:12px;background:#00A86B;color:#fff;font:700 36px "HS"}
.skill2{margin-bottom:30px}.sk2l{font:700 50px "HS";margin-bottom:10px}
.xp{height:46px;border-radius:23px;background:#eee;border:4px solid #111;overflow:hidden}
.xpf{width:100%;height:100%;background:#2D5BFF;transform-origin:0 50%}
.claimtag{font:700 32px "HS";color:#FF3B30}
.levelup{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:820px;padding:16px 50px;background:#FFB800;border:6px solid #111;border-radius:20px;font:700 90px "HS";transform:rotate(-6deg);box-shadow:10px 10px 0 #111}
.cork{position:absolute;left:60px;top:210px;width:960px;height:860px;border-radius:30px;background:#c99a62;border:8px solid #7a5530;box-shadow:inset 0 0 60px rgba(0,0,0,.3)}
.polaroid{position:absolute;width:420px;height:400px;background:#fff;padding:20px 20px 0;box-sizing:border-box;box-shadow:0 18px 30px rgba(0,0,0,.35)}
.pimg2{height:280px;border-radius:6px;overflow:hidden;position:relative;background:#eef0f4;padding:16px;box-sizing:border-box}
.pimg2.race{background:#3b8c3b;padding:0}.road{position:absolute;left:0;top:90px;width:100%;height:110px;background:repeating-linear-gradient(90deg,#444 0 60px,#555 60px 120px);border-top:6px dashed #fff;border-bottom:6px dashed #fff}
.pimg2.three{background:#e8eeff}
.pcap{font:700 46px/90px "HS";text-align:center}
.pin2{position:absolute;left:190px;top:-18px;width:40px;height:40px;border-radius:50%;background:#FF3B30;box-shadow:0 4px 0 #8a1c16}
.clipb{position:absolute;left:150px;top:220px;width:620px;height:720px;border-radius:30px;background:#fff;border:6px solid #111;box-shadow:12px 12px 0 #7B3FF2;padding:90px 50px;box-sizing:border-box}
.clipt{position:absolute;left:200px;top:-30px;width:220px;height:70px;border-radius:16px;background:#888;border:5px solid #111}
.cbh{font:700 48px "HS";margin-bottom:40px;letter-spacing:2px}
.cbrow{display:flex;align-items:center;gap:30px;font:700 60px "HS";margin-bottom:46px}
.cbox{position:relative;display:inline-block;width:80px;height:80px;border:6px solid #111;border-radius:12px}
.ctick{position:absolute;left:4px;top:-30px;font:700 100px/1 "HS";color:#00A86B}
.rstamp{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:960px;padding:10px 40px;border:10px solid #FF3B30;border-radius:20px;color:#FF3B30;font:700 80px "HS";transform:rotate(-8deg);background:rgba(255,255,255,.7)}
.rstamp.green{border-color:#00A86B;color:#00A86B}
.gate{position:absolute;left:90px;top:360px;width:900px;height:600px;border-radius:30px;overflow:hidden;border:6px solid #111;background:#111}
.glow2{position:absolute;inset:0;background:radial-gradient(circle,#2D5BFF,#0b1a5e);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}
.apiname{font:700 90px "HS"}.apiplus{font:700 70px "HS";color:#ffcf3a}
.newt2{margin-top:16px;padding:6px 20px;border-radius:12px;background:#FF3B30;font:700 40px "HS"}
.door{position:absolute;top:0;width:450px;height:600px;background:repeating-linear-gradient(90deg,#2b2b2b 0 40px,#333 40px 44px);display:flex;align-items:center;justify-content:center;font:700 80px "HS";color:#ffcf3a}
.door.l{left:0;border-right:4px solid #000}.door.r{left:450px;border-left:4px solid #000}
.puzzle{position:absolute;top:330px;width:420px;height:380px;border-radius:24px;border:6px solid #111;font:700 56px "HS";text-align:center;padding-top:70px;box-sizing:border-box;box-shadow:10px 10px 0 #111}
.puzzle.a{left:80px;background:#ffcf3a}.puzzle.b{left:560px;background:#00A3C4;color:#fff}
.tab{position:absolute;right:-70px;top:140px;width:110px;height:110px;border-radius:50%;background:#ffcf3a;border:6px solid #111;border-left-color:#ffcf3a}
.slotcut{position:absolute;left:-6px;top:140px;width:60px;height:110px;border-radius:0 55px 55px 0;background:#F4F1EA;border:6px solid #111;border-left:none}
.snapfx{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:250px;font:700 80px "HS";color:#FF3B30;transform:rotate(-6deg)}
.vault{position:absolute;left:190px;top:210px;width:700px;height:700px}
.vinside{position:absolute;left:40px;top:40px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,#fff3c4,#FFB800);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:inset 0 0 60px rgba(0,0,0,.3)}
.vfile{padding:8px 24px;border-radius:12px;background:#fff;border:3px solid #111;font:700 36px "HS"}.vmit{margin-top:10px;font:700 40px "HS"}
.vdoor{position:absolute;left:0;top:0;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,#9aa3ad,#59626c);border:14px solid #2b2f35;box-sizing:border-box;box-shadow:0 20px 40px rgba(0,0,0,.4)}
.vwheel{position:absolute;left:200px;top:200px;width:270px;height:270px;border-radius:50%;border:16px solid #2b2f35}
.vwheel span{position:absolute;left:117px;top:-60px;width:20px;height:380px;background:#2b2f35;border-radius:10px}
.vwheel span:nth-child(2){transform:rotate(60deg)}.vwheel span:nth-child(3){transform:rotate(-60deg)}
.rwin{position:absolute;left:170px;top:200px;width:620px;height:860px;overflow:hidden}
.receipt{position:absolute;left:0;top:0;width:620px;padding:40px 36px 70px;background:#fff;box-sizing:border-box;box-shadow:0 10px 30px rgba(0,0,0,.15);font-family:"HS"}
.rtitle{font:700 52px "HS";text-align:center;letter-spacing:4px}.rdash{border-top:4px dashed #999;margin:22px 0}
.rline{display:flex;justify-content:space-between;font:700 40px/1.8 "HS"}.rline .g{color:#00A86B}.rline .o{color:#FF7A00}
.rline.tot{font-size:52px}.rline .x{color:#FF3B30;font-size:70px}
.zig{position:absolute;left:0;bottom:-1px;width:100%;height:30px;background:linear-gradient(135deg,#F4F1EA 25%,transparent 25%) 0 0/40px 40px,linear-gradient(225deg,#F4F1EA 25%,transparent 25%) 0 0/40px 40px}
.scale{position:absolute;left:90px;top:200px;width:900px;height:800px}
.post{position:absolute;left:440px;top:120px;width:20px;height:560px;background:#111}.base{position:absolute;left:300px;top:670px;width:300px;height:40px;border-radius:20px;background:#111}
.beam{position:absolute;left:50px;top:110px;width:800px;height:24px;border-radius:12px;background:#111;transform-origin:50% 50%}
.pan{position:absolute;top:24px;width:300px;height:300px}.pan.l{left:-50px}.pan.r{left:550px}
.pan:before{content:"";position:absolute;left:148px;top:0;width:4px;height:150px;background:#111}
.pw{position:absolute;left:0;top:150px;width:300px;padding:30px 0;border-radius:0 0 150px 150px;background:#fff;border:6px solid #111;font:700 46px "HS";text-align:center;box-sizing:border-box}
.pan.l .pw{background:#ffcf3a}.pan.r .pw{background:#00A86B;color:#fff}
.scanbox{position:absolute;left:190px;top:210px;width:700px;height:620px;border-radius:30px;border:6px dashed #00A86B;padding:40px;box-sizing:border-box}
.doc2{background:#fff;border:5px solid #111;border-radius:20px;padding:30px;height:100%;box-sizing:border-box}.d2h{font:700 50px "HS";margin-bottom:20px}
.doc2 .pl{height:26px;margin-top:26px}
.laser{position:absolute;left:10px;top:40px;width:670px;height:8px;background:#FF3B30;box-shadow:0 0 30px 10px rgba(255,59,48,.5)}
.streak{position:absolute;left:60px;top:240px;width:960px;padding:36px;border-radius:30px;background:#fff;border:5px solid #111;box-shadow:12px 12px 0 #FFB800;box-sizing:border-box}
.sth{font:700 56px "HS";margin-bottom:24px}.days2{display:flex;justify-content:space-between}
.day2{width:116px;height:190px;border-radius:20px;background:#f1eee6;border:3px solid #111;text-align:center}
.dname{font:700 34px/60px "HS"}.dfire{font:80px/110px "Noto Color Emoji"}
.stairs{position:absolute;left:90px;top:300px;width:900px;height:700px}
.step{position:absolute;display:flex;align-items:flex-start;justify-content:center;padding-top:30px;box-sizing:border-box;border:6px solid #111;font:700 64px "HS"}
.step.s1{left:0;top:420px;width:470px;height:280px;background:#ffcf3a}.step.s2{left:430px;top:170px;width:470px;height:530px;background:#2D5BFF;color:#fff}
.lot{position:absolute;pointer-events:none}
/* ===== HOLO STUDIO THEME ===== */
@font-face{font-family:"ORB";font-weight:900;src:url(assets/orbitron-latin-900-normal.woff2) format("woff2")}
@font-face{font-family:"ORB";font-weight:700;src:url(assets/orbitron-latin-700-normal.woff2) format("woff2")}
:root{--y:#00e5ff;--g:#3dff9a;--r:#ff4d8d;--c:#00d4ff;--p:#9d7bff}
body{color:#fff}
#bg{background:radial-gradient(ellipse at 50% 30%,#14205a,#060a24 55%,#02030a)}
#glow{left:90px;top:160px;width:900px;height:900px;border-radius:50%;opacity:.35;filter:blur(140px);overflow:visible}
.glowcut{display:none}
#shape2{left:-200px;top:1350px;width:700px;height:700px;border:none;border-radius:50%;opacity:.35;background:radial-gradient(circle,#9d7bff,transparent 65%)}
#grid{opacity:1;background:radial-gradient(circle,rgba(120,170,255,.22) 1.6px,transparent 2px) 0 0/48px 48px}
.pt{border-radius:50%;border:none;background:#7fe9ff;box-shadow:0 0 12px #00d4ff;transform:none;opacity:.7}
#vig{background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(0,0,10,.75))}
#flash{background:linear-gradient(100deg,transparent,#00d4ff 30%,#9d7bff 70%,transparent);opacity:1}
#prog{background:linear-gradient(90deg,#00e5ff,#9d7bff,#ff5fd2);height:10px}
#brand{background:rgba(255,255,255,.08);border:2px solid rgba(160,190,255,.4);border-radius:14px;color:#fff;font:700 28px "HS"}
.livedot{background:#ff4d8d;box-shadow:0 0 12px #ff4d8d}
.secp{background:rgba(255,255,255,.08);color:#fff;border:2px solid rgba(160,190,255,.4)}
#ticker{background:linear-gradient(90deg,rgba(123,92,255,.85),rgba(0,180,255,.85))}.tickin{color:#fff}
.hltag{background:linear-gradient(135deg,#00d4ff,#9d7bff);color:#fff;font:900 30px/96px "ORB";border-radius:16px 0 0 16px}
.hltext{background:rgba(8,12,40,.88);color:#fff;border:2px solid rgba(160,190,255,.45);border-left:none;border-radius:0 16px 16px 0;font:700 30px/92px "ORB";letter-spacing:1px}
.capline{color:#fff;text-shadow:0 0 18px rgba(0,212,255,.55),0 6px 0 #000,3px 3px 0 #000,-3px -3px 0 #000;font-size:84px}
.hl{color:#fff;background:linear-gradient(135deg,#00b8ff,#8a5cff);padding:0 16px;border-radius:16px;box-shadow:0 0 24px rgba(138,92,255,.6)}
.glass{background:rgba(255,255,255,.07);border:2px solid rgba(160,190,255,.35);border-radius:28px;box-shadow:0 0 40px rgba(0,212,255,.12),inset 0 1px 0 rgba(255,255,255,.2);color:#fff}
.trails{position:absolute;left:0;top:0;width:1080px;height:1240px;overflow:hidden}
.trails i{position:absolute;left:-200px;width:1500px;height:6px;border-radius:3px;background:linear-gradient(90deg,transparent,#00e5ff,#9d7bff,transparent);transform:rotate(-24deg);opacity:.8}
.tr1{top:240px}.tr2{top:620px;height:3px}.tr3{top:960px}
.gwrap{position:absolute}
.globe2{position:relative;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 35%,#1d6bff,#071a5e 70%);box-shadow:0 0 90px rgba(0,150,255,.6),inset -30px -30px 80px rgba(0,0,30,.7)}
.gmers{position:absolute;top:0}.gmer{position:absolute;top:0;border:2px solid rgba(140,220,255,.45);border-radius:50%;box-sizing:border-box}
.glat{position:absolute;left:0;height:2px;background:rgba(140,220,255,.35)}
.gshine{position:absolute;left:12%;top:8%;width:40%;height:30%;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.35),transparent 70%)}
.mega5{position:absolute;left:0;top:200px;width:1080px;text-align:center;font:900 380px/1 "ORB";background:linear-gradient(135deg,#7ff6ff,#00b8ff 40%,#a77bff 75%,#ff7be0);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 40px rgba(0,212,255,.7))}
.breaking2{position:absolute;left:60px;top:170px;padding:10px 26px;background:#ff2d55;font:900 40px "ORB";letter-spacing:4px;border-radius:10px;box-shadow:0 0 30px rgba(255,45,85,.7)}
.sharetag{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:1010px;padding:14px 34px;border-radius:999px;background:linear-gradient(135deg,#00b8ff,#8a5cff);font:700 52px "HS"}
.phone2{position:absolute;left:300px;top:200px;width:480px;height:760px;border-radius:56px;background:#0b1030;border:6px solid rgba(160,190,255,.5);box-shadow:0 0 60px rgba(0,212,255,.3);padding:24px;box-sizing:border-box}
.pscreen{height:100%;border-radius:36px;background:linear-gradient(#0f1846,#0a0f2e);padding:30px 20px;box-sizing:border-box}
.pchip{display:block;width:fit-content;margin:0 auto 30px;padding:8px 20px;border-radius:12px;background:linear-gradient(135deg,#00b8ff,#8a5cff);font:900 26px "ORB"}
.cb{display:block;padding:18px 22px;border-radius:24px;font:700 36px/1.3 "HS";margin-bottom:24px;max-width:340px}
.me2{background:#2a3570;margin-left:auto}.ai3{background:linear-gradient(135deg,#00a6e8,#6a4cff)}
.bigq2{position:absolute;left:800px;top:250px;font:900 240px/1 "ORB";color:#ff5fd2;text-shadow:0 0 40px rgba(255,95,210,.8)}
.datechip{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:190px;padding:14px 30px;font:700 46px "HS"}
.wordmark{position:absolute;left:0;top:700px;width:1080px;text-align:center;font:900 96px "ORB";letter-spacing:4px;background:linear-gradient(90deg,#fff,#9be9ff,#fff);-webkit-background-clip:text;background-clip:text;color:transparent}
.sweep2{position:absolute;left:200px;top:680px;width:160px;height:160px;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);opacity:.6;display:none}
.pbf{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:880px;padding:20px 40px;font:900 46px "ORB";letter-spacing:2px}
.pbf span{margin-left:16px;padding:4px 12px;border-radius:10px;background:#ff2d55;font:900 22px "ORB";vertical-align:middle}
.waffwrap{position:absolute;left:150px;top:200px;width:780px;padding:30px;box-sizing:border-box}
.wtitle{font:700 44px "HS";margin-bottom:20px;text-align:center}
.waffle{display:grid;grid-template-columns:repeat(10,1fr);gap:10px}
.wcell{display:block;height:56px;border-radius:10px;background:rgba(160,190,255,.18)}.wcell.hot{background:linear-gradient(135deg,#00e5ff,#9d7bff);box-shadow:0 0 22px #00d4ff}
.wlegend{margin-top:22px;font:700 40px "HS";text-align:center}.lg{display:inline-block;width:34px;height:34px;border-radius:8px;vertical-align:middle}.lg.hot{background:linear-gradient(135deg,#00e5ff,#9d7bff)}
.approve{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:960px;padding:16px 30px;font:700 44px "HS"}.approve b{color:#ffd23d}
.hub{position:absolute;left:390px;top:440px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,#2a7bff,#5a2fd6);box-shadow:0 0 80px rgba(120,80,255,.8);font:900 64px/1.1 "ORB";text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}
.hub small{display:block;font-size:56px}
.spoke{position:absolute;width:280px;padding:20px 0;text-align:center;font:700 44px "HS"}
.people{position:absolute;left:60px;top:1010px;width:960px;padding:14px;text-align:center;font:700 36px "HS";box-sizing:border-box}
.pipe{position:absolute;left:60px;top:400px;width:960px;display:flex;align-items:center;justify-content:space-between}
.stg{width:250px;padding:30px 0;text-align:center;font:700 50px/1.4 "HS"}.stg.ok{border-color:#3dff9a;color:#3dff9a}.stg.wait{border-color:#ffd23d;color:#ffd23d}.stg.no{opacity:.6}
.pline{flex:1;height:8px;margin:0 10px;background:linear-gradient(90deg,#3dff9a,#ffd23d);border-radius:4px}.pline.dim{background:rgba(160,190,255,.25)}
.notyet{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:780px;padding:14px 40px;border:8px solid #ff4d8d;border-radius:20px;color:#ff4d8d;font:700 70px "HS";transform:rotate(-6deg);background:rgba(10,10,30,.6);box-shadow:0 0 40px rgba(255,77,141,.5)}
.wbtag{position:absolute;z-index:5;left:0;right:0;margin:0 auto;width:fit-content;top:180px;padding:14px 34px;font:900 40px "ORB";letter-spacing:3px}
.pin6{position:absolute;left:300px;top:200px;width:40px;height:40px;border-radius:50% 50% 50% 0;background:#ff4d8d;transform:rotate(-45deg);box-shadow:0 0 30px #ff4d8d}
.sizecard{position:absolute;top:800px;width:300px;padding:20px 0;text-align:center;font:700 48px "HS"}.sizecard small{display:block;font:500 34px "HS";color:#aac}
.sizecard.hi{border-color:#00e5ff;box-shadow:0 0 50px rgba(0,229,255,.5)}
.sig{display:flex;align-items:flex-end;gap:6px;justify-content:flex-end;font:900 24px "ORB";margin-bottom:40px}.sig i{display:block;width:12px;background:#3dff9a}
.sig i:nth-child(1){height:14px}.sig i:nth-child(2){height:24px}.sig i:nth-child(3){height:34px}.sig i:nth-child(4){height:44px}.sig i.off{background:rgba(255,255,255,.2)}
.feat{position:absolute;padding:20px 30px;font:700 48px "HS"}
.bdbadge{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:190px;padding:14px 34px;font:700 52px "HS"}
.opp{position:absolute;width:460px;height:320px;padding:24px;box-sizing:border-box}.opp b{display:block;font:700 56px "HS"}.opp p{margin:6px 0 0;font:500 34px "HS";color:#bcd}
.opp.wide{width:960px;height:300px}.opp .emo{float:left;margin-right:20px}
.sme{position:absolute;right:40px;top:60px;display:flex;align-items:flex-end;gap:14px;height:120px}.sme i{display:block;width:40px;border-radius:8px 8px 0 0;background:linear-gradient(#00e5ff,#7b5cff)}
.guards{position:absolute;left:120px;top:470px;width:840px}.guard{padding:24px 30px;margin-bottom:26px;font:700 56px "HS";display:flex;align-items:center;gap:24px}
.gt{display:inline-block;width:70px;height:70px;border-radius:50%;background:#3dff9a;color:#012;font:900 44px/70px "ORB";text-align:center}
.todaytag{position:absolute;left:0;width:1080px;top:220px;text-align:center;font:900 70px "ORB";letter-spacing:6px;color:#00e5ff;text-shadow:0 0 30px rgba(0,229,255,.7)}
.toolcard{position:absolute;left:150px;top:400px;width:780px;padding:50px 30px;text-align:center}.tname2{font:900 96px "ORB";margin-top:10px}
.free2{display:inline-block;margin-top:20px;padding:8px 26px;border-radius:12px;background:#3dff9a;color:#012;font:900 40px "ORB"}
.illus{position:absolute;right:40px;top:190px;padding:6px 14px;border-radius:10px;background:rgba(255,255,255,.12);font:700 24px "ORB";color:#aac;letter-spacing:2px}
.wstep{position:absolute;left:80px;width:920px;padding:30px;font:700 56px "HS";display:flex;align-items:center;gap:24px;box-sizing:border-box}
.wn{display:inline-block;width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#00b8ff,#8a5cff);font:900 40px/70px "ORB";text-align:center}
.upbar2{position:absolute;left:130px;top:390px;width:820px;height:16px;border-radius:8px;background:rgba(255,255,255,.12);overflow:hidden}.upfill2{width:100%;height:100%;background:linear-gradient(90deg,#00e5ff,#9d7bff);transform-origin:0 50%}
.twin{position:absolute;top:340px;width:460px;height:460px;text-align:center;padding-top:80px;box-sizing:border-box}.twin b{display:block;font:700 56px/1.3 "HS";margin-top:20px}
.amp{position:absolute;left:470px;top:500px;width:140px;font:900 120px "ORB";text-align:center;color:#ff5fd2}
.holotxt{position:absolute;left:0;width:1080px;text-align:center;font:900 92px "ORB";letter-spacing:4px;background:linear-gradient(90deg,#7ff6ff,#9d7bff,#ff7be0);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 30px rgba(0,212,255,.6))}
.holosub{position:absolute;left:0;width:1080px;top:470px;text-align:center;font:700 50px "ORB";letter-spacing:8px;color:#fff}
.followbtn{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;padding:26px 60px;border-radius:999px;background:linear-gradient(135deg,#00b8ff,#8a5cff);font:700 72px "HS";box-shadow:0 0 50px rgba(138,92,255,.7)}
.namecard{position:absolute;left:90px;top:480px;width:900px}.ncbar{height:14px;border-radius:7px;background:linear-gradient(90deg,#00e5ff,#9d7bff,#ff5fd2)}
.ncname{font:900 110px/1.2 "ORB";letter-spacing:6px;margin-top:20px}.ncbn{font:700 56px "HS";color:#9be9ff}
.plat{position:absolute;left:100px;width:880px;height:130px;padding:0 30px;display:flex;align-items:center;gap:26px;font:900 50px "ORB";box-sizing:border-box}
.pdot{display:block;width:60px;height:60px;border-radius:16px}.pfol{margin-left:auto;padding:12px 26px;border-radius:999px;background:rgba(255,255,255,.15);font:900 30px "ORB";display:block}
.credits9{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:640px;padding:26px 50px;font:700 50px/1.7 "HS";text-align:center}
.crl2{display:inline-block;margin-right:16px;padding:2px 16px;border-radius:10px;background:linear-gradient(135deg,#00b8ff,#8a5cff);font:700 30px "HS";vertical-align:middle}
.lot{position:absolute;pointer-events:none}
</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="%DUR%">
  <div id="bg"></div><div id="glow"><div class="glowcut"></div></div><div id="shape2"></div><div id="grid"></div>
%PARTS%
  <div id="vig"></div>
%CLIPS%
  <div id="brand"><span id="livedot" class="livedot"></span>LIVE · AI খবর</div><div id="ticker"><div id="tick" class="tickin">%TICKER%</div></div><div id="prog"></div><div id="flash"></div>
  <audio id="bed" src="assets/soundbed.wav" data-start="0" data-duration="%DUR%" data-track-index="10" data-volume="1"></audio>
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
%ANIMS%
window.__timelines["main"] = tl;
window.__hfLottie = window.__hfLottie || [];
const LOT = %LOTDATA%;
for (const nm of Object.keys(LOT)) {
  const anim = lottie.loadAnimation({ container: document.getElementById("lot_" + nm), renderer: "svg", loop: false, autoplay: false, animationData: LOT[nm] });
  window.__hfLottie.push(anim);
}
</script>
</body></html>
"""

if __name__ == "__main__":
    build()

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
    ("ব্রেকিং নিউজ!", ["*ব্রেকিং নিউজ*!"], ["boom", "glitch"]),
    ("AI দিয়ে এবার শুধু কোড নয়, গেম আর থ্রিডি প্রজেক্টও!", ["AI দিয়ে এবার", "শুধু *কোড* নয়,", "*গেম* আর *থ্রিডি* প্রজেক্টও!"], ["whoosh", "pop"]),
    ("DeepSeek-এর নতুন আপডেটে কী এসেছে, আর কেন এটা গুরুত্বপূর্ণ? চলুন জেনে নিই!", ["*DeepSeek*-এর নতুন আপডেটে", "কী এসেছে, আর কেন", "এটা *গুরুত্বপূর্ণ*?", "চলুন জেনে নিই!"], ["riser"]),
    ("১৭ অক্টোবর DeepSeek প্রকাশ করেছে V4.1 Flash 1017।", ["*১৭ অক্টোবর*", "DeepSeek প্রকাশ করেছে", "*V4.1 Flash 1017*।"], ["boom", "tick"]),
    ("কোম্পানির দাবি, নতুন সংস্করণটি আগের তুলনায় কোডিং আর AI Agent-এর কাজে আরও উন্নত।", ["কোম্পানির দাবি,", "নতুন সংস্করণটি", "আগের তুলনায় *কোডিং*", "আর *AI Agent*-এর কাজে", "আরও উন্নত।"], ["pop", "pop2"]),
    ("এই মডেল দিয়ে ছোট সফটওয়্যার প্রজেক্ট, ওয়েব গেম, এমনকি থ্রিডি কাজের উদাহরণ দেখা যাচ্ছে।", ["এই মডেল দিয়ে ছোট", "*সফটওয়্যার* প্রজেক্ট,", "*ওয়েব গেম*, এমনকি", "*থ্রিডি* কাজের", "উদাহরণ দেখা যাচ্ছে।"], ["whoosh", "pop"]),
    ("তবে ফলাফল যাচাই করে ব্যবহার করতে হবে।", ["তবে ফলাফল", "*যাচাই* করে", "ব্যবহার করতে হবে।"], ["ding"]),
    ("আরেকটি বড় আপডেট! DeepSeek তাদের Search আর Fetch API উন্মুক্ত করেছে।", ["আরেকটি *বড় আপডেট*!", "DeepSeek তাদের", "*Search* আর *Fetch API*", "উন্মুক্ত করেছে।"], ["boom", "key"]),
    ("ডেভেলপাররা এখন AI অ্যাপের সঙ্গে ওয়েব সার্চ যুক্ত করার নতুন সুযোগ পাচ্ছেন।", ["*ডেভেলপাররা* এখন", "AI অ্যাপের সঙ্গে", "*ওয়েব সার্চ* যুক্ত করার", "নতুন সুযোগ পাচ্ছেন।"], ["tick", "tick"]),
    ("নতুন মডেলের ওপেন ওয়েটও প্রকাশিত হয়েছে।", ["নতুন মডেলের", "*ওপেন ওয়েট*ও", "প্রকাশিত হয়েছে।"], ["whoosh"]),
    ("তবে মনে রাখবেন, ওপেন ওয়েট মানেই সব ধরনের API ব্যবহার ফ্রি নয়।", ["তবে মনে রাখবেন,", "ওপেন ওয়েট মানেই", "সব ধরনের API ব্যবহার", "*ফ্রি নয়*।"], ["glitch"]),
    ("AI যত শক্তিশালী হচ্ছে, নিরাপত্তার গুরুত্বও তত বাড়ছে।", ["AI যত *শক্তিশালী* হচ্ছে,", "*নিরাপত্তার* গুরুত্বও", "তত বাড়ছে।"], ["riser"]),
    ("গুরুত্বপূর্ণ কাজের আগে AI-এর তৈরি ফলাফল অবশ্যই যাচাই করুন।", ["গুরুত্বপূর্ণ কাজের আগে", "AI-এর তৈরি ফলাফল", "অবশ্যই *যাচাই* করুন।"], ["ding"]),
    ("প্রতিদিন AI-এর নতুন খবর, ফ্রি টুলস আর বাস্তব ব্যবহার জানতে আমাদের সঙ্গে থাকুন।", ["প্রতিদিন AI-এর *নতুন খবর*,", "*ফ্রি টুলস* আর", "বাস্তব ব্যবহার জানতে", "আমাদের সঙ্গে *থাকুন*।"], ["whoosh", "pop"]),
    ("AI শিখুন, কাজে লাগান!", ["AI *শিখুন*,", "*কাজে লাগান*!"], ["flash"]),
]
# speech-segment ids per line, filled in once a real voiceover exists (voice/segs.json)
VOICE_MAP = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11, 12, 13], [14, 15, 16], [17, 18], [19, 20]]
GAP, SECTION_GAP, INTRA = 0.2, 0.34, 0.14
SECTION_BEFORE = {3, 5, 7, 9, 11, 13}
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


def cube(cid, size=220):
    h = size / 2
    faces = [f"translateZ({h}px)", f"rotateY(180deg) translateZ({h}px)", f"rotateY(90deg) translateZ({h}px)",
             f"rotateY(-90deg) translateZ({h}px)", f"rotateX(90deg) translateZ({h}px)", f"rotateX(-90deg) translateZ({h}px)"]
    fs = "".join(f'<div class="cface" style="width:{size}px;height:{size}px;transform:{tr}"></div>' for tr in faces)
    return f'<div class="cstage" style="width:{size}px;height:{size}px"><div id="{cid}" class="cube" style="width:{size}px;height:{size}px">{fs}</div></div>'


def spin(sel, s, e, rx=360, ry=540):
    return f'tl.fromTo("{sel}",{{rotationX:-20,rotationY:0}},{{rotationX:{rx-20},rotationY:{ry},duration:{R(e-s)},ease:"none"}},{R(s)});'


def blink(sel, s, e, period=.5):
    return f'tl.fromTo("{sel}",{{opacity:1}},{{opacity:.15,duration:{period/2},yoyo:true,repeat:{max(1,int((e-s)/(period/2))-1)},ease:"steps(1)"}},{R(s)});'


def pixpop(sel, t):
    """8-bit pop: stepped scale-in, then a squash & stretch settle."""
    return (f'tl.from("{sel}",{{scale:0,opacity:0,duration:.24,ease:"steps(4)"}},{R(t)});'
            f'tl.fromTo("{sel}",{{scaleX:1.18,scaleY:.84}},{{scaleX:1,scaleY:1,duration:.4,ease:"elastic.out(1,0.4)"}},{R(t+.24)});')


# 0 — INSERT COIN → coin drops in an arc → BREAKING NEWS
@scene(0)
def _(s, e):
    h = """<div class="cab"><div class="screen8"><div id="ic0" class="px y">INSERT COIN</div><div id="bn0" class="px big m">BREAKING<br>NEWS</div></div>
      <div class="coinslot"><div class="slotline"></div></div></div>
    <div id="coin0" class="emo e110" style="left:120px;top:180px">🪙</div>"""
    a = [blink("#ic0", s, s + .55, .18),
         f'tl.to("#coin0",{{keyframes:[{{x:200,y:-80,rotation:180,duration:.22,ease:"power2.out"}},{{x:360,y:560,rotation:540,duration:.28,ease:"power2.in"}},{{scale:0,duration:.05}}]}},{R(s)});',
         f'tl.set("#ic0",{{opacity:0}},{R(s+.56)});', pixpop("#bn0", s + .56), shake("#s0in", s + .62)]
    return h, a


# 1 — character select: CODE / GAME / 3D
@scene(1)
def _(s, e):
    h = f"""<div class="px t" style="top:200px">SELECT YOUR MODE</div>
    <div class="selrow">
      <div id="ch0" class="selcard"><div class="selic">&lt;/&gt;</div><div class="sellab">কোড</div></div>
      <div id="ch1" class="selcard"><div class="emo e140" style="position:relative;margin:10px auto">🎮</div><div class="sellab">গেম</div></div>
      <div id="ch2" class="selcard"><div style="position:relative;width:150px;height:150px;margin:20px auto">{cube("cube1", 120)}</div><div class="sellab">থ্রিডি</div></div>
    </div>
    <div id="cur1" class="selcur"><div class="p1">P1</div></div>
    <div id="all1" class="px g" style="top:860px">ALL SELECTED!</div>"""
    st = (e - s) / 4
    a = [pixpop(f"#ch{k}", s + k * .12) for k in range(3)] + [spin("#cube1", s, e)]
    a += [f'tl.to("#cur1",{{x:{k*310},duration:.12,ease:"steps(3)"}},{R(s+st*(k+.6))});' for k in (1, 2)]
    a += [pixpop("#all1", s + st * 3)]
    return h, a


# 2 — HERE COMES A NEW CHALLENGER: DeepSeek
@scene(2)
def _(s, e):
    h = """<div id="stripe2" class="vsstripe"></div>
    <div id="nc2" class="px m" style="top:230px;font-size:44px;line-height:1.5">HERE COMES A<br>NEW CHALLENGER!</div>
    <div id="boss2" class="emo e320" style="left:380px;top:400px">🐋</div>
    <div id="nm2" class="bossname">DEEPSEEK</div>
    <div id="q2a" class="speech" style="left:80px;top:860px">কী এসেছে?</div><div id="q2b" class="speech" style="left:620px;top:950px">কেন জরুরি?</div>"""
    st = (e - s) / 4
    a = [f'tl.from("#stripe2",{{scaleX:0,duration:.25,ease:"steps(5)"}},{R(s)});', blink("#nc2", s, s + st * 1.5, .3),
         f'tl.from("#boss2",{{x:700,duration:.5,ease:"back.out(1.6)"}},{R(s+.3)});',
         f'tl.to("#boss2",{{y:-16,duration:.35,yoyo:true,repeat:{max(1,int((e-s-1)/.35))},ease:"steps(2)"}},{R(s+.9)});',
         pixpop("#nm2", s + .7), pixpop("#q2a", s + st * 1.6), pixpop("#q2b", s + st * 2.4)]
    return h, a


# 3 — SAVE DATA: new slot V4.1 Flash 1017, pixel progress
@scene(3)
def _(s, e):
    blocks = "".join(f'<span id="pb3{k}" class="pblk"></span>' for k in range(10))
    h = f"""<div class="win8"><div class="win8h">SAVE DATA</div>
      <div class="slot8 old"><span>SLOT 1</span><span>V4.1 Flash</span></div>
      <div id="sl3" class="slot8 new"><span>SLOT 2</span><span>V4.1 Flash 1017</span><em>NEW</em></div>
      <div class="slot8 date"><span>📅</span><span>১৭ অক্টোবর ২০২৬</span></div>
      <div class="pbar">{blocks}</div><div id="ok3" class="px g" style="position:relative;top:0;font-size:34px">UPDATE COMPLETE!</div></div>"""
    st = (e - s) / 3
    a = [pixpop("#s3in .win8", s), pixpop("#sl3", s + st * .8)]
    a += [f'tl.from("#pb3{k}",{{opacity:0,duration:.01}},{R(s+st*1.2+k*st*1.2/10)});' for k in range(10)]
    a += [blink("#ok3", s + st * 2.5, e, .3)]
    return h, a


# 4 — POWER UP stats (company claim)
@scene(4)
def _(s, e):
    def bar(bid, base, add, col):
        return "".join(f'<span class="stb{" on" if i < base else ""}" style="--c:{col}"></span>' for i in range(base)) + \
               "".join(f'<span id="{bid}{i}" class="stb on add" style="--c:{col}"></span>' for i in range(add)) + \
               "".join('<span class="stb"></span>' for _ in range(10 - base - add))
    h = f"""<div class="win8" style="top:230px"><div class="win8h">🐋 STATS</div>
      <div class="statrow"><div class="statl">💻 কোডিং</div><div class="stbar">{bar("sa", 5, 3, "#2de2e6")}</div></div>
      <div class="statrow"><div class="statl">🤖 AI Agent</div><div class="stbar">{bar("sb", 4, 4, "#ff3df2")}</div></div>
      <div class="claim8">* কোম্পানির দাবি</div></div>
    <div id="pu4" class="px y big" style="top:820px">POWER UP!</div>"""
    st = (e - s) / 5
    a = [pixpop("#s4in .win8", s)]
    a += [f'tl.from("#sa{i}",{{opacity:0,scale:2,duration:.12,ease:"steps(2)"}},{R(s+st*1.4+i*.15)});' for i in range(3)]
    a += [f'tl.from("#sb{i}",{{opacity:0,scale:2,duration:.12,ease:"steps(2)"}},{R(s+st*2.4+i*.15)});' for i in range(4)]
    a += [pixpop("#pu4", s + st * 3.8)]
    return h, a


# 5 — platformer: robot jumps, bumps ? blocks, items pop out
@scene(5)
def _(s, e):
    items = [("🌐", "সফটওয়্যার", 140), ("🏎️", "ওয়েব গেম", 440), ("🧊", "থ্রিডি", 740)]
    h = '<div class="ground"></div>'
    h += "".join(f'<div id="qb{k}" class="qblock" style="left:{x}px">?</div><div id="it{k}" class="emo e110" style="left:{x+5}px;top:330px">{ic}</div><div id="il{k}" class="itlab" style="left:{x-60}px">{lb}</div>' for k, (ic, lb, x) in enumerate(items))
    h += '<div id="bot5" class="emo e140" style="left:-40px;top:740px">🤖</div>'
    st = (e - s) / 3.4
    a = []
    for k, (_ic, _lb, x) in enumerate(items):
        t0 = s + .2 + k * st
        a += [f'tl.to("#bot5",{{keyframes:[{{x:{x+20},duration:.3,ease:"none"}},{{y:-200,duration:.22,ease:"power2.out"}},{{y:0,duration:.22,ease:"power2.in"}}]}},{R(t0)});',
              f'tl.to("#qb{k}",{{y:-24,duration:.08,yoyo:true,repeat:1}},{R(t0+.52)});',
              f'tl.to("#qb{k}",{{backgroundColor:"#7a5a2a",duration:.01}},{R(t0+.52)});',
              f'tl.from("#it{k}",{{y:120,opacity:0,duration:.3,ease:"back.out(2.4)"}},{R(t0+.55)});', pixpop(f"#il{k}", t0 + .7)]
    return h, a


# 6 — CHECKPOINT flag + quest log
@scene(6)
def _(s, e):
    rows = "".join(f'<div class="qrow"><span id="qt6{k}" class="qtick">✔</span>{t}</div>' for k, t in enumerate(("টেস্ট করো", "রিভিউ করো", "বাগ ফিক্স")))
    h = f"""<div class="pole"></div><div id="flag6" class="flag8">CHECKPOINT</div>
    <div class="win8" style="top:560px;left:290px;width:700px"><div class="win8h">QUEST: <span class="bn">যাচাই করুন</span></div>{rows}</div>"""
    st = (e - s - .4) / 3
    a = [f'tl.from("#flag6",{{y:380,duration:.5,ease:"steps(8)"}},{R(s)});']
    a += [pixpop(f"#qt6{k}", s + .4 + k * st) for k in range(3)]
    return h, a


# 7 — treasure chest opens: NEW ITEMS — Search API, Fetch API
@scene(7)
def _(s, e):
    h = """<div id="big7" class="px y big" style="top:200px;font-size:64px">BIG UPDATE!</div>
    <div class="chest"><div id="lid7" class="lid"></div><div class="cbody"><div class="lock8"></div></div></div>
    <div id="glow7" class="chestglow"></div>
    <div id="it7a" class="item8" style="left:110px">🔍 SEARCH API</div><div id="it7b" class="item8" style="left:570px">📄 FETCH API</div>
    <div id="nw7" class="px g" style="top:1000px;font-size:34px">NEW ITEMS UNLOCKED · <span class="bn">উন্মুক্ত</span></div>"""
    st = (e - s) / 3
    a = [pixpop("#big7", s), f'tl.to("#lid7",{{keyframes:[{{y:8,duration:.12}},{{rotationX:-110,y:-40,duration:.35,ease:"back.out(2)"}}],transformPerspective:800,transformOrigin:"50% 100%"}},{R(s+st)});',
         f'tl.from("#glow7",{{scale:0,opacity:0,duration:.4,ease:"power2.out"}},{R(s+st+.2)});',
         f'tl.from("#it7a",{{x:330,y:300,scale:0,duration:.5,ease:"back.out(1.8)"}},{R(s+st+.35)});',
         f'tl.from("#it7b",{{x:-130,y:300,scale:0,duration:.5,ease:"back.out(1.8)"}},{R(s+st+.5)});', pixpop("#nw7", s + st * 2.2)]
    return h, a


# 8 — inventory combo: AI app + web search
@scene(8)
def _(s, e):
    h = """<div class="win8" style="top:220px"><div class="win8h">INVENTORY</div>
      <div class="inv"><div class="islot"><div id="iv8a" class="emo e110" style="position:relative;margin:20px auto">📱</div><div class="ilab">AI অ্যাপ</div></div>
      <div class="iplus">+</div>
      <div class="islot"><div id="iv8b" class="emo e110" style="position:relative;margin:20px auto">🌐</div><div class="ilab">ওয়েব সার্চ</div></div>
      <div class="iplus">=</div>
      <div id="res8" class="islot glowslot"><div class="emo e110" style="position:relative;margin:20px auto">⚡</div><div class="ilab">স্মার্ট অ্যাপ</div></div></div></div>
    <div id="cb8" class="px m big" style="top:760px">COMBO!</div><div id="dev8" class="px t" style="top:900px;font-size:30px">FOR DEVELOPERS</div>"""
    st = (e - s) / 4
    a = [pixpop("#s8in .win8", s), pixpop("#iv8a", s + .3), pixpop("#iv8b", s + st),
         f'tl.from("#res8",{{scale:0,rotation:180,duration:.4,ease:"back.out(2)"}},{R(s+st*2)});', pixpop("#cb8", s + st * 2.3), pixpop("#dev8", s + st * 3)]
    return h, a


# 9 — OPEN WEIGHTS: files drop into the backpack
@scene(9)
def _(s, e):
    h = """<div class="px y" style="top:210px;font-size:46px">OPEN WEIGHTS</div><div class="px t" style="top:290px;font-size:30px">MIT LICENSE · FREE DOWNLOAD</div>
    <div id="bag9" class="emo e320" style="left:380px;top:640px">🎒</div>""" + "".join(
        f'<div id="f9{k}" class="emo e110" style="left:{200+k*170}px;top:400px">📄</div>' for k in range(4))
    st = (e - s - .6) / 4
    a = [pixpop("#bag9", s)]
    a += [f'tl.fromTo("#f9{k}",{{y:-300,opacity:1}},{{keyframes:[{{y:40,duration:.25,ease:"power2.in"}},{{x:{(540-(200+k*170))*.9},y:330,scale:.4,duration:.25,ease:"power2.in"}},{{opacity:0,duration:.01}}]}},{R(s+.3+k*st)});' for k in range(4)]
    a += [f'tl.to("#bag9",{{scaleX:1.12,scaleY:.9,duration:.08,yoyo:true,repeat:1}},{R(s+.3+k*st+.5)});' for k in range(4)]
    return h, a


# 10 — ITEM SHOP: open weights free, API calls cost coins
@scene(10)
def _(s, e):
    h = """<div class="win8" style="top:210px"><div class="win8h">🧙 ITEM SHOP</div>
      <div class="shoprow"><span>📦 Open Weights</span><span class="free">FREE</span></div>
      <div class="shoprow"><span>☁️ Cloud API কল</span><span class="cost">🪙 COINS</span></div>
      <div class="shoprow"><span>🔍 Search/Fetch API</span><span class="cost">🪙 COINS</span></div>
      <div id="ask10" class="shoprow ask"><span>সব কিছু ফ্রি?</span><span id="no10" class="no">✗ NO</span></div></div>
    <div id="cur10" class="selarrow">▶</div>"""
    st = (e - s) / 5
    a = [pixpop("#s10in .win8", s)] + [f'tl.to("#cur10",{{y:{k*120},duration:.1,ease:"steps(2)"}},{R(s+st*(k+.5))});' for k in (1, 2, 3)]
    a += [f'tl.from("#no10",{{scale:3,opacity:0,duration:.2,ease:"power4.in"}},{R(s+st*4)});', shake("#s10in", s + st * 4 + .2)]
    return h, a


# 11 — HP bars: AI power vs safety, shield equips
@scene(11)
def _(s, e):
    h = """<div class="hp"><div class="hpl">⚡ AI POWER</div><div class="hpbar"><div id="hpA" class="hpf" style="background:#ff3df2"></div></div></div>
    <div class="hp" style="top:500px"><div class="hpl">🛡️ SAFETY</div><div class="hpbar"><div id="hpB" class="hpf" style="background:#3dff7a"></div></div></div>
    <div id="sh11" class="emo e240" style="left:420px;top:700px">🛡️</div><div id="def11" class="px g" style="top:960px;font-size:40px">DEFENSE UP!</div>"""
    st = (e - s) / 3
    a = [f'tl.fromTo("#hpA",{{scaleX:.3}},{{scaleX:1,duration:{R(st)},ease:"steps(10)"}},{R(s+.1)});',
         f'tl.fromTo("#hpB",{{scaleX:.2}},{{scaleX:1,duration:{R(st*1.2)},ease:"steps(10)"}},{R(s+st)});',
         pixpop("#sh11", s + st * 1.2), pixpop("#def11", s + st * 2.2)]
    return h, a


# 12 — ACHIEVEMENT UNLOCKED toast + scan
@scene(12)
def _(s, e):
    h = """<div class="doc8"><div class="d8h">🤖 AI OUTPUT</div><div class="dl"></div><div class="dl"></div><div class="dl s"></div><div class="dl"></div><div id="scan12" class="scan8"></div></div>
    <div id="ach12" class="toast"><div class="tico">🏆</div><div><div class="tt1">ACHIEVEMENT UNLOCKED</div><div class="tt2">ফলাফল যাচাই করা হয়েছে ✓</div></div></div>"""
    a = [f'tl.fromTo("#scan12",{{y:0}},{{y:380,duration:.8,yoyo:true,repeat:1,ease:"steps(16)"}},{R(s+.1)});',
         f'tl.from("#ach12",{{y:300,opacity:0,duration:.4,ease:"back.out(1.8)"}},{R(e-1.0)});']
    return h, a


# 13 — CONTINUE? countdown + follow
@scene(13)
def _(s, e):
    digits = "".join(f'<div>{d}</div>' for d in "9876543")
    h = f"""<div class="px m big" style="top:220px;font-size:80px">CONTINUE?</div>
    <div class="cdwin"><div id="cd13" class="cdcol">{digits}</div></div>
    <div id="fol13" class="contbtn">▶ ফলো করুন</div><div class="px t" style="top:1010px;font-size:28px">= CONTINUE</div>"""
    n = 6
    a = [f'tl.to("#cd13",{{y:{-n*220},duration:{R(e-s-.8)},ease:"steps({n})"}},{R(s+.2)});', pixpop("#fol13", s + .5),
         f'tl.to("#fol13",{{scale:.9,backgroundColor:"#3dff7a",duration:.1,yoyo:true,repeat:1}},{R(e-.4)});']
    return h, a


# 14 — LEVEL UP: শিখুন → কাজে লাগান
@scene(14)
def _(s, e):
    h = """<div class="px y big" style="top:220px">LEVEL UP!</div>
    <div class="lvrow"><div id="lv14a" class="lvbox">📚<br>শিখুন</div><div class="lvarrow">▶</div><div id="lv14b" class="lvbox hi">🛠️<br>কাজে লাগান</div></div>
    <div class="xpwrap"><div id="xp14" class="xpfill"></div></div><div class="px t" style="top:960px;font-size:30px">NEXT LEVEL →</div>"""
    a = [pixpop("#lv14a", s), pixpop("#lv14b", s + (e - s) * .45),
         f'tl.fromTo("#xp14",{{scaleX:0}},{{scaleX:1,duration:{R(e-s-.3)},ease:"steps(12)"}},{R(s+.2)});']
    return h, a


def end_card(s, e):
    h = """<div class="px m" style="top:230px;font-size:56px">TO BE CONTINUED…</div>
    <div class="px y big" style="top:360px;font-size:62px;line-height:1.4">FOLLOW FOR<br>DAILY AI NEWS</div>
    <div class="credits8"><div class="crh">HIGH SCORES</div>
      <div class="crr"><span>1UP</span><span>Explainer</span><span>Rubel Miah</span></div>
      <div class="crr"><span>2UP</span><span>Video Editor</span><span>Paloan</span></div></div>"""
    a = [pixpop("#sEin .px.m", s), pixpop("#sEin .px.y", s + .3), f'tl.from("#sEin .credits8",{{y:300,opacity:0,duration:.5,ease:"steps(6)"}},{R(s+.8)});']
    return h, a


SECTIONS = [(0, "#ff3df2", "LV1 · BREAKING"), (3, "#2de2e6", "LV2 · NEW MODEL"), (5, "#ffe14d", "LV3 · CODE GAME 3D"),
            (7, "#3dff7a", "LV4 · SEARCH API"), (9, "#ff9d3d", "LV5 · OPEN WEIGHTS"), (11, "#7d6bff", "LV6 · SAFETY"), (13, "#ff3df2", "BONUS · FOLLOW")]
HEADLINES = ["DEEPSEEK NEW AI UPDATE", "DEEPSEEK V4.1 FLASH 1017", "CODE • GAME • 3D", "NEW SEARCH & FETCH API",
             "OPEN WEIGHTS ≠ FREE API", "USE AI RESPONSIBLY", "FOLLOW FOR DAILY AI NEWS"]
TICKER = "★ HIGH SCORE NEWS ★  DeepSeek V4.1 Flash 1017 (১৭ অক্টোবর)  ★  নতুন Search ও Fetch API  ★  Open Weights (MIT)  ★  AI-এর ফলাফল যাচাই করুন  ★  ১৮ অক্টোবর ২০২৬  "



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
    s1, e1 = W(1); lots.append(("bSel", LG.burst(s1 + (e1 - s1) * .75, OP, 500, "#ffe14d", "#ff3df2"), 290, 650, 500, 500, s1, e1 - s1))
    s2, e2 = W(2); lots.append(("rBoss", LG.ripple(s2 + .3, e2, OP, 600, "#2de2e6"), 240, 260, 600, 600, s2, e2 - s2))
    s4, e4 = W(4); lots.append(("bPow", LG.burst(s4 + (e4 - s4) / 5 * 3.8, OP, 560, "#ffe14d", "#2de2e6"), 260, 580, 560, 560, s4, e4 - s4))
    s5, e5 = W(5); st5 = (e5 - s5) / 3.4
    for k, x in enumerate((140, 440, 740)):
        lots.append((f"bItem{k}", LG.burst(s5 + .2 + k * st5 + .55, OP, 300, "#ffe14d", "#ffffff"), x - 90, 230, 300, 300, s5, e5 - s5))
    s7, e7 = W(7); lots.append(("bChest", LG.burst(s7 + (e7 - s7) / 3 + .2, OP, 640, "#ffe14d", "#3dff7a"), 220, 350, 640, 640, s7, e7 - s7))
    s8, e8 = W(8); lots.append(("bCombo", LG.burst(s8 + (e8 - s8) / 4 * 2.3, OP, 560, "#ff3df2", "#2de2e6"), 260, 540, 560, 560, s8, e8 - s8))
    s12, e12 = W(12); lots.append(("bAch", LG.burst(e12 - .7, OP, 520, "#3dff7a", "#ffe14d"), 280, 640, 520, 520, s12, e12 - s12))
    s13, e13 = W(13); lots.append(("bCont", LG.burst(e13 - .4, OP, 500, "#ff3df2", "#ffe14d"), 290, 540, 500, 500, s13, e13 - s13))
    lots.append(("bEnd", LG.burst(END_S + .3, OP, 600, "#ffe14d", "#ff3df2"), 240, 170, 600, 600, END_S, DURATION - END_S))
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
        tag = f"STAGE {k + 1}"
        clips.append(f'<div id="hl{k}" class="clip hlbar" data-start="{R(s)}" data-duration="{R(e-s)}" data-track-index="8"><div id="hlg{k}" class="hltag">{tag}</div><div id="hlt{k}" class="hltext">{H.escape(HEADLINES[k])}</div></div>')
        anims.append(f'tl.from("#hlg{k}",{{x:-300,duration:.3,ease:"power3.out"}},{R(s+.15)});')
        anims.append(f'tl.from("#hlt{k}",{{scaleX:0,transformOrigin:"0% 50%",duration:.35,ease:"power3.out"}},{R(s+.3)});')
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
    (ROOT / "cues.json").write_text(json.dumps({"duration": DURATION, "cues": cues, "drop_t": LS[13], "tense": [LS[9], LS[11]]}, indent=1))
    # subtitles
    def ts(v): return f"{int(v//3600):02d}:{int(v%3600//60):02d}:{int(v%60):02d},{int(round((v%1)*1000)):03d}"
    srt = [f"{i+1}\n{ts(TIMES[i][0])} --> {ts(TIMES[i][1])}\n{' '.join(c).replace('*','')}\n" for i, (_a, c, _b) in enumerate(LINES)]
    (ROOT / "renders/subtitles.srt").write_text("\n".join(srt), encoding="utf-8")
    print("duration", DURATION, "clips", len(clips), "anims", len(anims), "cues", len(cues))


TEMPLATE = r"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>Daily AI News Arcade</title>
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
/* ===== RETRO ARCADE THEME ===== */
@font-face{font-family:"PX";src:url(assets/press-start-2p-latin-400-normal.woff2) format("woff2")}
:root{--y:#ffe14d;--g:#3dff7a;--r:#ff3d6e;--c:#2de2e6;--m:#ff3df2}
body{color:#fff}
#bg{background:radial-gradient(ellipse at 50% 35%,#2a1655,#0d0820 75%)}
#glow{left:-200px;top:1500px;width:1480px;height:700px;border-radius:0;opacity:.55;overflow:visible;background:transparent!important;
  background-image:repeating-linear-gradient(0deg,transparent 0 58px,var(--m) 58px 62px),repeating-linear-gradient(90deg,transparent 0 58px,var(--m) 58px 62px)!important;
  transform:perspective(500px) rotateX(70deg);transform-origin:50% 0}
.glowcut{display:none}
#shape2{left:760px;top:260px;width:220px;height:220px;border:none;border-radius:50%;opacity:.25;background:radial-gradient(circle,#ffe14d,#ff3df2 70%,transparent 72%)}
#grid{opacity:1;background:radial-gradient(circle,rgba(255,255,255,.5) 1.5px,transparent 2px) 0 0/90px 90px}
.pt{border-radius:0;border:none;background:#fff;opacity:.5;transform:none}
#vig{background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 2px,transparent 2px 5px),radial-gradient(ellipse at 50% 45%,transparent 60%,rgba(0,0,0,.6))}
#flash{background:var(--m);opacity:1}
#prog{background:linear-gradient(90deg,#ff3df2,#2de2e6);height:14px}
#brand{font:400 22px "PX";background:#000;border:4px solid #fff;border-radius:0;color:var(--y);padding:10px 14px}
.livedot{border-radius:0;background:var(--r)}
.secp{font:400 20px/1.6 "PX";background:#000;color:#fff;border:4px solid #fff;border-radius:0}
#ticker{background:#000;border-top:4px solid var(--m);border-bottom:4px solid var(--m)}
.tickin{color:var(--y)}
.hlbar{top:1110px}.hltag{font:400 22px/96px "PX";background:var(--m);color:#000;border-radius:0}
.hltext{font:400 26px/88px "PX";background:#000;color:#fff;border:4px solid #fff;border-left:none;border-radius:0}
.capline{color:#fff;text-shadow:4px 4px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000;font-size:84px}
.hl{color:#000;background:var(--y);padding:0 14px;border-radius:0;box-shadow:6px 6px 0 #000}
.px{position:absolute;left:0;width:1080px;text-align:center;font:400 52px/1.3 "PX";color:#fff;text-shadow:5px 5px 0 #000}
.px.big{font-size:84px}.px.y{color:var(--y)}.px.m{color:var(--m)}.px.g{color:var(--g)}.px.t{color:var(--c)}
.cab{position:absolute;left:140px;top:200px;width:800px;height:820px;background:#1b1b3a;border:10px solid #000;box-shadow:0 0 0 8px var(--m),16px 16px 0 8px #000}
.screen8{position:absolute;left:50px;top:50px;width:680px;height:520px;background:#000;border:8px solid #333;overflow:hidden}
.screen8 .px{width:680px;top:200px}.screen8 .px.big{top:130px;font-size:76px;line-height:1.35}
.coinslot{position:absolute;left:300px;top:640px;width:180px;height:110px;background:#c52020;border:8px solid #000}
.slotline{position:absolute;left:78px;top:18px;width:12px;height:60px;background:#000}
.selrow{position:absolute;left:60px;top:340px;width:960px;display:flex;gap:30px;justify-content:center}
.selcard{width:280px;height:380px;background:#1b1b3a;border:8px solid #fff;box-shadow:10px 10px 0 #000;text-align:center;box-sizing:border-box}
.selic{font:400 90px/200px "PX";color:var(--c)}.sellab{font:700 60px "HS"}
.selcur{position:absolute;left:84px;top:318px;width:300px;height:420px;border:10px solid var(--y);box-sizing:border-box}
.p1{position:absolute;left:-10px;top:-50px;padding:6px 10px;background:var(--y);color:#000;font:400 24px "PX"}
.vsstripe{position:absolute;left:-100px;top:400px;width:1280px;height:360px;background:repeating-linear-gradient(-45deg,#ff3df2 0 40px,#c21cbc 40px 80px);transform:rotate(-6deg);opacity:.85}
.bossname{position:absolute;left:0;width:1080px;top:740px;text-align:center;font:400 72px "PX";color:var(--y);text-shadow:6px 6px 0 #000}
.speech{position:absolute;padding:16px 26px;background:#fff;color:#000;border:6px solid #000;font:700 50px "HS";box-shadow:8px 8px 0 #000}
.win8{position:absolute;left:90px;top:240px;width:900px;padding:30px 40px 40px;background:#0d0d24;border:8px solid #fff;box-shadow:0 0 0 8px #000,14px 14px 0 8px var(--c);box-sizing:border-box}
.win8h{font:400 30px "PX";color:var(--y);margin-bottom:26px}
.slot8{display:flex;align-items:center;gap:30px;padding:20px 24px;margin-bottom:18px;border:5px solid #555;font:700 46px "HS";position:relative}
.slot8 span:first-child{font:400 22px "PX";color:#999}
.slot8.new{border-color:var(--g);background:rgba(61,255,122,.12)}.slot8.new em{position:absolute;right:16px;font:400 22px "PX";color:#000;background:var(--g);padding:6px 10px;font-style:normal}
.slot8.date{border-color:#333}
.pbar{display:flex;gap:10px;margin:26px 0 18px}.pblk{display:block;flex:1;height:44px;background:var(--g);box-shadow:inset -6px -6px 0 rgba(0,0,0,.3)}
.statrow{margin-bottom:34px}.statl{font:700 52px "HS";margin-bottom:12px}
.stbar{display:flex;gap:8px}.stb{display:block;flex:1;height:50px;background:#2a2a44}.stb.on{background:var(--c)}
.stbar .stb.on{background:var(--c)}.statrow:nth-child(3) .stb.on{background:var(--m)}.stb.add{box-shadow:0 0 18px #fff}
.claim8{font:700 32px "HS";color:var(--r)}
.ground{position:absolute;left:0;top:880px;width:1080px;height:120px;background:repeating-linear-gradient(90deg,#b8642a 0 60px,#9a4f1e 60px 64px);border-top:16px solid #3dbb3d}
.qblock{position:absolute;top:470px;width:120px;height:120px;background:#ffb300;border:6px solid #000;box-shadow:inset -10px -10px 0 #c77c00;font:400 60px/110px "PX";color:#fff;text-align:center;text-shadow:4px 4px 0 #000}
.itlab{position:absolute;top:640px;width:240px;text-align:center;font:700 44px "HS";text-shadow:4px 4px 0 #000}
.pole{position:absolute;left:150px;top:200px;width:16px;height:760px;background:#ddd}
.flag8{position:absolute;left:166px;top:220px;padding:20px 30px;background:var(--g);color:#000;font:400 30px "PX";border:6px solid #000}
.qrow{font:700 54px "HS";margin:22px 0;display:flex;gap:26px;align-items:center}
.qtick{display:inline-block;width:70px;height:70px;background:var(--g);color:#000;font:700 54px/70px "HS";text-align:center;border:5px solid #000}
.chest{position:absolute;left:340px;top:520px;width:400px;height:300px}
.lid{position:absolute;left:0;top:0;width:400px;height:110px;background:#a0522d;border:8px solid #000;box-sizing:border-box;box-shadow:inset 0 -14px 0 #ffd23d}
.cbody{position:absolute;left:0;top:104px;width:400px;height:196px;background:#8b4513;border:8px solid #000;box-sizing:border-box;box-shadow:inset 0 14px 0 #ffd23d}
.lock8{position:absolute;left:160px;top:30px;width:64px;height:76px;background:#ffd23d;border:6px solid #000}
.chestglow{position:absolute;left:290px;top:300px;width:500px;height:400px;background:radial-gradient(ellipse,rgba(255,225,77,.85),transparent 65%)}
.item8{position:absolute;top:360px;padding:20px 28px;background:#000;border:6px solid var(--y);font:400 30px "PX";color:var(--y);box-shadow:8px 8px 0 var(--m)}
.inv{display:flex;align-items:center;justify-content:space-between}
.islot{width:220px;height:260px;border:6px solid #fff;background:#1b1b3a;text-align:center}.ilab{font:700 36px "HS"}
.iplus{font:400 50px "PX";color:var(--y)}.glowslot{border-color:var(--y);box-shadow:0 0 30px var(--y)}
.shoprow{display:flex;justify-content:space-between;align-items:center;padding:22px 10px 22px 70px;font:700 50px "HS";border-bottom:4px dashed #444}
.free{font:400 30px "PX";color:#000;background:var(--g);padding:8px 14px}.cost{font:400 26px "PX";color:var(--y)}
.shoprow.ask{border:none;color:var(--c)}.no{font:400 40px "PX";color:#fff;background:var(--r);padding:10px 16px}
.selarrow{position:absolute;left:120px;top:345px;font:400 40px "PX";color:var(--y)}
.hp{position:absolute;left:90px;top:300px;width:900px}.hpl{font:400 34px "PX";margin-bottom:16px}
.hpbar{height:70px;border:8px solid #fff;background:#000;padding:6px;box-sizing:border-box}.hpf{width:100%;height:100%;transform-origin:0 50%}
.doc8{position:absolute;left:190px;top:220px;width:700px;height:470px;background:#fff;color:#000;border:8px solid #000;box-shadow:12px 12px 0 var(--c);padding:30px;box-sizing:border-box;overflow:hidden}
.d8h{font:400 28px "PX";margin-bottom:30px}.dl{height:30px;background:#ccc;margin:26px 0}.dl.s{width:60%}
.scan8{position:absolute;left:0;top:30px;width:100%;height:14px;background:var(--g);box-shadow:0 0 30px 10px rgba(61,255,122,.6)}
.toast{position:absolute;left:80px;top:770px;width:920px;display:flex;align-items:center;gap:24px;padding:24px 30px;background:#101010;border:6px solid var(--g);border-radius:80px;box-sizing:border-box;box-shadow:0 0 40px rgba(61,255,122,.5)}
.tico{width:110px;height:110px;border-radius:50%;background:var(--g);font:70px/110px "Noto Color Emoji";text-align:center;flex:none}
.tt1{font:400 26px "PX";color:var(--g);margin-bottom:8px}.tt2{font:700 46px "HS"}
.cdwin{position:absolute;left:390px;top:380px;width:300px;height:220px;overflow:hidden;border:10px solid var(--m);background:#000}
.cdcol{position:absolute;left:0;top:0;width:300px}.cdcol div{height:220px;font:400 160px/220px "PX";text-align:center;color:var(--y)}
.contbtn{position:absolute;left:190px;top:700px;width:700px;height:170px;background:var(--m);color:#000;border:8px solid #000;box-shadow:12px 12px 0 #fff;font:700 84px/150px "HS";text-align:center;box-sizing:border-box}
.lvrow{position:absolute;left:60px;top:400px;width:960px;display:flex;align-items:center;justify-content:space-between}
.lvbox{width:380px;padding:40px 0;background:#1b1b3a;border:8px solid #fff;font:700 64px/1.4 "HS";text-align:center;box-shadow:10px 10px 0 #000}
.lvbox.hi{border-color:var(--y);color:var(--y)}.lvarrow{font:400 60px "PX";color:var(--m)}
.xpwrap{position:absolute;left:140px;top:860px;width:800px;height:60px;border:8px solid #fff;padding:6px;box-sizing:border-box}
.xpfill{width:100%;height:100%;background:linear-gradient(90deg,#2de2e6,#ff3df2);transform-origin:0 50%}
.credits8{position:absolute;left:120px;top:620px;width:840px;padding:30px;border:8px solid #fff;background:#000;box-sizing:border-box}
.crh{font:400 30px "PX";color:var(--m);text-align:center;margin-bottom:24px}
.crr{display:flex;justify-content:space-between;align-items:center;font:700 46px/1.8 "HS"}.crr span:first-child{font:400 26px "PX";color:var(--y)}
.bn{font-family:"HS";font-weight:700;font-size:1.55em;vertical-align:-.12em;text-shadow:none}
.cface{border-color:var(--c);background:rgba(45,226,230,.15)}
.lot{position:absolute;pointer-events:none}
</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="%DUR%">
  <div id="bg"></div><div id="glow"><div class="glowcut"></div></div><div id="shape2"></div><div id="grid"></div>
%PARTS%
  <div id="vig"></div>
%CLIPS%
  <div id="brand"><span id="livedot" class="livedot"></span>1UP · AI <span class="bn">খবর</span></div><div id="ticker"><div id="tick" class="tickin">%TICKER%</div></div><div id="prog"></div><div id="flash"></div>
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

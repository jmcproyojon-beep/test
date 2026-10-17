"""Daily AI News — DeepSeek V4.1 Flash 1017 (18 Oct 2026). Voice assembly (or paced timing
when no voice yet), captions, premium 2.5D news scenes, cue list.
Run: python reel.py  (then python soundbed.py, then hyperframes render)."""
import json, math, random, re, subprocess, html as H
from pathlib import Path
import numpy as np

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
VOICE_MAP = None
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
            an.append(f'tl.from("#{cid}w{k}",{{scale:.55,opacity:0,y:18,duration:.15,ease:"back.out(2.6)"}},{R(wt)});')
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
    ease = kw.get("ease", "back.out(2.4)")
    return f'tl.from("{sel}",{{scale:0,opacity:0,duration:{kw.get("d", .3)},ease:"{ease}"}},{R(t)});'

def slide(sel, t, x=0, y=0, d=.32):
    return f'tl.from("{sel}",{{x:{x},y:{y},opacity:0,duration:{d},ease:"power3.out"}},{R(t)});'

def shake(sel, t, n=5, a=12):
    return f'tl.fromTo("{sel}",{{x:-{a}}},{{x:{a},duration:.05,repeat:{n},yoyo:true}},{R(t)});'


def cube(cid, size=220):
    h = size / 2
    faces = [("f1", f"translateZ({h}px)"), ("f2", f"rotateY(180deg) translateZ({h}px)"), ("f3", f"rotateY(90deg) translateZ({h}px)"),
             ("f4", f"rotateY(-90deg) translateZ({h}px)"), ("f5", f"rotateX(90deg) translateZ({h}px)"), ("f6", f"rotateX(-90deg) translateZ({h}px)")]
    fs = "".join(f'<div class="cface" style="width:{size}px;height:{size}px;transform:{tr}"></div>' for _n, tr in faces)
    return f'<div class="cstage" style="width:{size}px;height:{size}px"><div id="{cid}" class="cube" style="width:{size}px;height:{size}px">{fs}</div></div>'


def spin(sel, s, e, rx=360, ry=540):
    return f'tl.fromTo("{sel}",{{rotationX:-20,rotationY:0}},{{rotationX:{rx-20},rotationY:{ry},duration:{R(e-s)},ease:"none"}},{R(s)});'


@scene(0)
def _(s, e):
    h = """<div class="floorwrap"><div id="floor0" class="floor"></div></div>
    <div id="bn0" class="breaking"><span class="bdot"></span>BREAKING NEWS</div>
    <div id="bn0b" class="bigword">AI NEWS</div>
    <div id="tape0a" class="tape t1"></div><div id="tape0b" class="tape t2"></div>"""
    a = [f'tl.fromTo("#floor0",{{y:0}},{{y:240,duration:{R(e-s)},ease:"none"}},{s});',
         f'tl.from("#bn0",{{scaleX:0,duration:.25,ease:"power4.out"}},{s});',
         f'tl.fromTo("#bn0b",{{scale:3,opacity:0}},{{scale:1,opacity:1,duration:.3,ease:"power4.in"}},{R(s+.1)});',
         f'tl.fromTo("#tape0a",{{x:-300}},{{x:0,duration:{R(e-s)},ease:"none"}},{s});',
         f'tl.fromTo("#tape0b",{{x:0}},{{x:-300,duration:{R(e-s)},ease:"none"}},{s});', shake("#s0in", s + .4, 5, 16)]
    return h, a


@scene(1)
def _(s, e):
    h = f"""<div id="code1" class="card3d" style="left:90px;top:300px"><div class="c3ico">&lt;/&gt;</div><div class="c3lab">কোড</div><div id="x1" class="okmark">✓</div></div>
    <div id="game1" class="card3d" style="left:400px;top:240px;border-color:#ff5fa2"><div class="emo e140" style="position:relative;margin:0 auto">🎮</div><div class="c3lab">গেম</div></div>
    <div id="td1" class="card3d" style="left:710px;top:300px;border-color:#00d4ff"><div style="position:relative;height:160px;margin:10px auto 0;width:160px">{cube("cube1", 120)}</div><div class="c3lab">থ্রিডি</div></div>
    <div id="plus1" class="kin" style="top:730px;font-size:92px">CODE • GAME • 3D</div>"""
    st = (e - s) / 3
    a = [f'tl.from("#code1",{{rotationY:-90,opacity:0,transformPerspective:900,duration:.4,ease:"back.out(1.6)"}},{R(s)});',
         f'tl.from("#game1",{{rotationY:90,opacity:0,transformPerspective:900,duration:.4,ease:"back.out(1.6)"}},{R(s+st*1.4)});',
         f'tl.from("#td1",{{rotationY:90,opacity:0,transformPerspective:900,duration:.4,ease:"back.out(1.6)"}},{R(s+st*2)});',
         spin("#cube1", s, e), pop("#plus1", s + st * 2.2)]
    return h, a


@scene(2)
def _(s, e):
    h = """<div id="rip2a" class="ring cyan-ring" style="left:290px;top:180px;width:500px;height:500px"></div><div id="rip2b" class="ring cyan-ring" style="left:290px;top:180px;width:500px;height:500px"></div>
    <div id="whale" class="emo e240" style="left:420px;top:240px">🐋</div>
    <div id="ds2" class="dsword">DeepSeek</div>
    <div id="q2a" class="qchip" style="left:110px;top:780px">❓ কী এসেছে?</div><div id="q2b" class="qchip" style="left:560px;top:780px">⚡ কেন গুরুত্বপূর্ণ?</div>"""
    st = (e - s) / 4
    a = [pop("#whale", s), f'tl.from("#ds2",{{y:60,opacity:0,scaleX:1.6,duration:.5,ease:"power3.out"}},{R(s+.2)});']
    a += [f'tl.fromTo("#rip2{c}",{{scale:.4,opacity:.9}},{{scale:1.6,opacity:0,duration:1.2,repeat:1}},{R(s+k*.6)});' for k, c in enumerate("ab")]
    a += [slide("#q2a", s + st * 1.3, x=-500), slide("#q2b", s + st * 2.2, x=500)]
    return h, a


@scene(3)
def _(s, e):
    h = """<div id="cal3" class="bigcal" style="left:90px;top:230px"><div class="calh">অক্টোবর ২০২৬</div><div class="calbig">১৭</div></div>
    <div id="ver3" class="verbox"><div class="vold">V4.1 Flash</div><div class="varrow">⬆</div><div class="vnew">1017</div>
      <div class="upbar"><div id="upf3" class="upfill"></div></div><div class="uplab">UPDATE INSTALLED ✓</div></div>
    <div id="hf3" class="pill dark-bg" style="top:870px">🚀 নতুন সংস্করণ প্রকাশ</div>"""
    st = (e - s) / 3
    a = [f'tl.from("#cal3",{{y:-500,rotation:-10,duration:.45,ease:"bounce.out"}},{s});',
         f'tl.from("#ver3",{{x:500,opacity:0,rotationY:-40,transformPerspective:900,duration:.45,ease:"power3.out"}},{R(s+st)});',
         f'tl.fromTo("#upf3",{{scaleX:0}},{{scaleX:1,duration:{R(st*1.3)},ease:"power2.inOut"}},{R(s+st*1.3)});', pop("#hf3", s + st * 2.2)]
    return h, a


@scene(4)
def _(s, e):
    pins = "".join(f'<span class="pin" style="{side}:-34px;{axis}:{40+k*56}px"></span>' for side, axis in (("left", "top"), ("right", "top"), ("top", "left"), ("bottom", "left")) for k in range(5))
    h = f"""<div id="claim4" class="pill red-bg" style="top:190px">কোম্পানির দাবি</div>
    <div id="chip4" class="chip"><div id="core4" class="core">AI</div>{pins}</div>
    <div id="cmpA" class="codepane" style="left:60px"><div class="cph">আগে</div><div class="cl bad"></div><div class="cl"></div><div class="cl bad" style="width:60%"></div><div class="cbug">🐞</div></div>
    <div id="cmpB" class="codepane" style="left:720px"><div class="cph g">এখন</div><div class="cl gg"></div><div class="cl gg" style="width:80%"></div><div class="cl gg" style="width:70%"></div><div class="cok">✓</div></div>
    <div id="bd4a" class="upbadge" style="left:150px;top:860px">কোডিং ⬆</div><div id="bd4b" class="upbadge" style="left:560px;top:860px">AI Agent ⬆</div>"""
    st = (e - s) / 5
    a = [pop("#claim4", s), f'tl.from("#chip4",{{scale:0,rotation:-45,duration:.45,ease:"back.out(1.8)"}},{R(s+.1)});',
         f'tl.to("#core4",{{scale:1.12,duration:.3,yoyo:true,repeat:{max(1,int((e-s)/0.6))},ease:"sine.inOut"}},{R(s+.5)});',
         slide("#cmpA", s + st, x=-400), slide("#cmpB", s + st * 1.6, x=400), pop("#bd4a", s + st * 2.6), pop("#bd4b", s + st * 3.4)]
    return h, a


@scene(5)
def _(s, e):
    h = f"""<div id="t5a" class="tile" style="left:60px;top:200px"><div class="tt">✨ Prompt</div><div class="ptext2">"একটা রেসিং<br>গেম বানাও"</div></div>
    <div id="t5b" class="tile" style="left:560px;top:200px"><div class="tt">🌐 Website</div><div class="mini-hero"></div><div class="pl"></div><div class="pl short"></div></div>
    <div id="t5c" class="tile" style="left:60px;top:600px"><div class="tt">🏎️ Web Game</div><div class="track"><div id="car5" class="emo e90" style="left:10px;top:60px">🏎️</div></div></div>
    <div id="t5d" class="tile" style="left:560px;top:600px"><div class="tt">🧊 3D</div><div style="position:relative;width:180px;height:180px;margin:20px auto">{cube("cube5", 150)}</div></div>
    <div id="a5a" class="arrowx" style="left:480px;top:330px">➜</div><div id="a5b" class="arrowx" style="left:480px;top:560px;transform:rotate(135deg)">➜</div><div id="a5c" class="arrowx" style="left:480px;top:730px">➜</div>"""
    st = (e - s) / 5
    a = [pop("#t5a", s), pop("#a5a", s + st * .9), pop("#t5b", s + st), pop("#a5b", s + st * 1.9), pop("#t5c", s + st * 2),
         pop("#a5c", s + st * 2.9), pop("#t5d", s + st * 3),
         f'tl.fromTo("#car5",{{x:0}},{{x:300,duration:.9,repeat:{max(0,int((e-s-st*2)//0.9)-1)},ease:"none"}},{R(s+st*2.1)});', spin("#cube5", s, e, 360, 720)]
    return h, a


@scene(6)
def _(s, e):
    rows = "".join(f'<div id="ck6{k}" class="chk"><span class="tick">✓</span>{t}</div>' for k, t in enumerate(("টেস্ট করুন", "কোড রিভিউ", "বাগ ফিক্স")))
    h = f"""<div id="mag6" class="emo e240" style="left:420px;top:200px">🔍</div><div class="chklist">{rows}</div>"""
    a = [f'tl.fromTo("#mag6",{{x:-200,rotation:-20}},{{x:200,rotation:20,duration:.6,yoyo:true,repeat:1,ease:"sine.inOut"}},{s});']
    a += [slide(f"#ck6{k}", s + .3 + k * (e - s - .5) / 3, x=-500) for k in range(3)]
    return h, a


@scene(7)
def _(s, e):
    q = "আজকের AI খবর".split(" ")
    chars = "".join(f'<span id="sq{k}" class="sqc">{c}</span>' for k, c in enumerate(q))
    h = f"""<div id="big7" class="bigword" style="top:200px;font-size:120px;color:var(--y)">বড় আপডেট!</div>
    <div id="sb7" class="searchbar"><span class="sico">🔍</span><span class="sqt">{chars}</span><span class="caret3"></span></div>
    <div id="api7a" class="apibadge" style="left:50px;top:720px">SEARCH API<span class="newt">NEW</span></div>
    <div id="api7b" class="apibadge" style="left:580px;top:720px">FETCH API<span class="newt">NEW</span></div>"""
    st = (e - s) / 4
    a = [f'tl.fromTo("#big7",{{scale:3,opacity:0}},{{scale:1,opacity:1,duration:.3,ease:"power4.in"}},{s});', shake("#s7in", s + .3, 3),
         slide("#sb7", s + st, y=200)]
    a += [f'tl.from("#sq{k}",{{opacity:0,duration:.01}},{R(s+st*1.3+k*.25)});' for k in range(len(q))]
    a += [pop("#api7a", s + st * 2.4), pop("#api7b", s + st * 2.9)]
    return h, a


@scene(8)
def _(s, e):
    nodes = [("📱", "AI App"), ("🔍", "Search API"), ("🌐", "Web"), ("📄", "Fetch API"), ("🤖", "উত্তর")]
    h = "".join(f'<div id="n8{k}" class="vnode" style="top:{190+k*165}px"><span class="vico">{ic}</span>{lb}</div>' for k, (ic, lb) in enumerate(nodes))
    h += "".join(f'<div id="v8l{k}" class="vline" style="top:{290+k*165}px"></div>' for k in range(4))
    h += '<div id="pk8" class="packet"></div><div id="dev8" class="pill dark-bg" style="top:1000px">👨‍💻 ডেভেলপারদের জন্য</div>'
    st = (e - s - .4) / 5
    a = []
    for k in range(5):
        a.append(slide(f"#n8{k}", s + k * st, x=-600 if k % 2 == 0 else 600, d=.28))
        if k < 4: a.append(f'tl.from("#v8l{k}",{{scaleY:0,duration:.2}},{R(s+k*st+.2)});')
    a += [f'tl.fromTo("#pk8",{{y:0,opacity:1}},{{y:660,duration:1.0,ease:"none",repeat:1}},{R(s+st*4.2)});', pop("#dev8", e - .5)]
    return h, a


@scene(9)
def _(s, e):
    files = "".join(f'<div class="frow"><span>📄 model-0000{k}-of-00009.safetensors</span><span class="fsz">FP8</span></div>' for k in range(1, 4))
    h = f"""<div id="repo9" class="repo"><div class="rhead">🐋 DeepSeek-V4.1-Flash-1017</div>
      <div class="rtags"><span class="rtag g">Open Weights</span><span class="rtag">MIT License</span></div>{files}
      <div class="dbar"><div id="dl9" class="dfill"></div></div><div class="dlab">⬇ Download</div></div>"""
    a = [f'tl.from("#repo9",{{y:400,opacity:0,rotationX:30,transformPerspective:1000,duration:.45,ease:"power3.out"}},{s});',
         f'tl.fromTo("#dl9",{{scaleX:0}},{{scaleX:1,duration:{R(e-s-.6)},ease:"power1.inOut"}},{R(s+.5)});']
    return h, a


@scene(10)
def _(s, e):
    h = """<div id="ow10" class="cmpcard" style="left:40px;border-color:var(--g)"><div class="emo e140" style="position:relative;margin:0 auto">📦</div><div class="cmpt">OPEN WEIGHTS</div><div class="cmps">ডাউনলোড করা যায়</div></div>
    <div id="api10" class="cmpcard" style="left:620px;border-color:#ff8a00"><div class="emo e140" style="position:relative;margin:0 auto">☁️</div><div class="cmpt">CLOUD API</div><div class="cmps">ব্যবহারে খরচ হতে পারে 💳</div></div>
    <div id="neq10" class="neq">≠</div>"""
    st = (e - s) / 4
    a = [slide("#ow10", s, x=-500), slide("#api10", s + st, x=500),
         f'tl.from("#neq10",{{scale:4,opacity:0,duration:.25,ease:"power4.in"}},{R(s+st*2.6)});',
         f'tl.fromTo("#s10in",{{x:-14,skewX:8}},{{x:0,skewX:0,duration:.05,repeat:5,yoyo:true}},{R(s+st*2.6+.25)});']
    return h, a


@scene(11)
def _(s, e):
    h = """<div class="meters"><div class="mcol"><div class="mbar"><div id="m11a" class="mfill" style="background:linear-gradient(0deg,#4f8bff,#b46bff)"></div></div><div class="mlab">AI শক্তি</div></div>
      <div class="mcol"><div class="mbar"><div id="m11b" class="mfill" style="background:linear-gradient(0deg,#1dbf73,#39ff14)"></div></div><div class="mlab">নিরাপত্তা</div></div></div>
    <div id="sh11" class="emo e240" style="left:420px;top:280px">🛡️</div>"""
    a = [f'tl.fromTo("#m11a",{{scaleY:0}},{{scaleY:1,duration:{R(e-s-.4)},ease:"power2.in"}},{R(s+.1)});',
         f'tl.fromTo("#m11b",{{scaleY:0}},{{scaleY:1,duration:{R(e-s-.3)},ease:"power2.in"}},{R(s+.3)});',
         f'tl.from("#sh11",{{scale:0,rotationY:180,transformPerspective:800,duration:.6,ease:"back.out(1.6)"}},{R(s+.4)});']
    return h, a


@scene(12)
def _(s, e):
    rows = "".join(f'<div class="trow"><span>{t}</span><div class="tog"><div id="kn12{k}" class="knob"></div></div></div>' for k, t in enumerate(("তথ্য যাচাই", "সোর্স চেক", "মানুষের রিভিউ")))
    h = f"""<div id="dash12" class="secdash"><div class="sdh">🔐 Secure AI Dashboard</div>{rows}<div id="ok12" class="sdok">✓ VERIFIED</div></div>"""
    st = (e - s - .5) / 3
    a = [slide("#dash12", s, y=300)]
    for k in range(3):
        a.append(f'tl.to("#kn12{k}",{{x:64,backgroundColor:"#39FF14",duration:.2}},{R(s+.4+k*st)});')
    a += [f'tl.from("#ok12",{{scale:2.5,opacity:0,duration:.25,ease:"power4.in"}},{R(e-.5)});']
    return h, a


@scene(13)
def _(s, e):
    mer = "".join(f'<div class="mer" style="left:{x}px"></div>' for x in range(-280, 560, 70))
    h = f"""<div class="globe"><div id="mer13" class="merwrap">{mer}</div><div class="lat" style="top:110px"></div><div class="lat" style="top:200px"></div><div class="lat" style="top:290px"></div></div>
    <div id="o13a" class="ochip" style="left:60px;top:250px">📰 নতুন খবর</div><div id="o13b" class="ochip" style="left:700px;top:330px">🆓 ফ্রি টুলস</div><div id="o13c" class="ochip" style="left:110px;top:700px">🛠️ বাস্তব ব্যবহার</div>
    <div id="fol13" class="follow" style="top:860px;left:240px;width:600px;height:150px;font-size:80px;line-height:150px">ফলো করুন</div>"""
    st = (e - s) / 4
    a = [f'tl.fromTo("#mer13",{{x:0}},{{x:140,duration:{R(e-s)},ease:"none"}},{s});', pop("#o13a", s + .1), pop("#o13b", s + st), pop("#o13c", s + st * 2),
         pop("#fol13", s + st * 3), f'tl.to("#fol13",{{scale:.9,backgroundColor:"#39FF14",duration:.1,yoyo:true,repeat:1}},{R(e-.4)});']
    return h, a


@scene(14)
def _(s, e):
    h = """<div id="r14" class="rays"></div><div id="l14a" class="bigword" style="top:330px;font-size:150px">AI শিখুন,</div><div id="l14b" class="bigword" style="top:540px;font-size:150px;color:var(--y)">কাজে লাগান!</div>"""
    a = [f'tl.fromTo("#r14",{{rotation:0,scale:.3}},{{rotation:45,scale:1.2,duration:{R(e-s)},ease:"power1.out"}},{s});',
         f'tl.from("#l14a",{{x:-800,duration:.3,ease:"power3.out"}},{s});', f'tl.from("#l14b",{{scale:3,opacity:0,duration:.3,ease:"power4.in"}},{R(s+(e-s)*.45)});']
    return h, a


def end_card(s, e):
    h = '<div id="ecg" class="ring gold-ring" style="left:140px;top:240px;width:800px;height:800px"></div>'
    h += '<div id="ecw" class="emo e200" style="left:440px;top:230px">🌐</div>'
    h += '<div class="ecard-t" style="top:470px;font-size:118px"><span id="ew0" class="ew2">FOLLOW FOR</span><span id="ew1" class="ew2 y">DAILY</span><span id="ew2" class="ew2 y">AI NEWS</span></div>'
    h += '<div id="ech" class="pill dark-bg" style="top:950px">🔴 AI খবর · প্রতিদিন</div>'
    a = [pop("#ecw", s), f'tl.fromTo("#ecg",{{scale:.4,opacity:1}},{{scale:1.3,opacity:0,duration:1.0,repeat:1}},{R(s+.2)});']
    a += [f'tl.from("#ew{k}",{{y:80,opacity:0,duration:.35,ease:"back.out(2)"}},{R(s+.3+k*.3)});' for k in range(3)]
    a += [pop("#ech", s + 1.4)]
    return h, a


SECTIONS = [(0, "#ff2d2d", "🔴 BREAKING"), (3, "#00c8ff", "🆕 NEW MODEL"), (5, "#b46bff", "🧩 CODE • GAME • 3D"),
            (7, "#4f8bff", "🔍 SEARCH API"), (9, "#ff8a00", "📦 OPEN WEIGHTS"), (11, "#22e06b", "🛡️ AI SAFETY"), (13, "#ffd400", "⭐ FOLLOW")]
# the user's on-screen text, shown as a news lower-third per section
HEADLINES = ["DEEPSEEK NEW AI UPDATE", "DEEPSEEK V4.1 FLASH 1017", "CODE • GAME • 3D", "NEW SEARCH & FETCH API",
             "OPEN WEIGHTS ≠ FREE API", "USE AI RESPONSIBLY", "FOLLOW FOR DAILY AI NEWS"]
TICKER = "BREAKING  •  DeepSeek V4.1 Flash 1017 প্রকাশ (১৭ অক্টোবর)  •  নতুন Search ও Fetch API  •  Open Weights (MIT)  •  AI-এর ফলাফল যাচাই করুন  •  ১৮ অক্টোবর ২০২৬  •  "


def build():
    clips, anims, cues = [], [], []
    for i, (ids, chunks, sfx) in enumerate(LINES):
        s, e = WIN[i]
        h, a = S[i](s, e)
        clips.append(f'<div id="sc{i}" class="clip scene" data-start="{s}" data-duration="{R(e-s)}" data-track-index="4"><div id="s{i}in" class="scene-in">{h}</div></div>')
        anims.append(f'tl.fromTo("#s{i}in",{{scale:1}},{{scale:1.045,duration:{R(e-s)},ease:"none"}},{s});')
        anims += a
        c, ca = captions(i, chunks, TIMES[i][0], max(TIMES[i][1], s + .8)); clips += c; anims += ca
        for k, fx in enumerate(sfx):
            cues.append({"t": R(s + (0 if k == 0 else (e - s) * .55)), "end": e, "sfx": fx})
    h, a = end_card(END_S, DURATION)
    clips.append(f'<div id="scE" class="clip scene" data-start="{END_S}" data-duration="{R(DURATION-END_S)}" data-track-index="4"><div id="sEin" class="scene-in">{h}</div></div>')
    anims += a; cues.append({"t": END_S, "end": DURATION, "sfx": "boom"})

    for k, (li, col, label) in enumerate(SECTIONS):
        s = LS[li]; e = LS[SECTIONS[k + 1][0]] if k + 1 < len(SECTIONS) else DURATION
        anims.append(f'tl.to("#glow",{{backgroundColor:"{col}",duration:.3}},{s});')
        clips.append(f'<div id="sec{k}" class="clip secpill" data-start="{s}" data-duration="{R(e-s)}" data-track-index="7"><div id="secp{k}" class="secp">{label}</div></div>')
        anims.append(f'tl.from("#secp{k}",{{y:-90,opacity:0,duration:.3,ease:"back.out(2)"}},{R(s+.05)});')
        if li:
            anims.append(f'tl.to("#flash",{{opacity:.85,duration:.06,yoyo:true,repeat:1}},{R(s-.06)});')
    anims.append(f'tl.to("#flash",{{opacity:1,duration:.05,yoyo:true,repeat:1}},{R(END_S-.05)});')
    for k, (li, _c, _l) in enumerate(SECTIONS):
        s = LS[li]; e = LS[SECTIONS[k + 1][0]] if k + 1 < len(SECTIONS) else END_S
        tag = "BREAKING" if k == 0 else ("SAFETY" if k == 5 else "AI NEWS")
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
    anims.append(f'tl.fromTo("#glow",{{scale:.9}},{{scale:1.1,duration:1.3,yoyo:true,repeat:{max(0, int(DURATION // 1.3) - 1)},ease:"sine.inOut"}},0);')
    anims.append(f'tl.fromTo("#prog",{{scaleX:0}},{{scaleX:1,duration:{DURATION},ease:"none"}},0);')

    page = (TEMPLATE.replace("%CLIPS%", "\n".join(clips)).replace("%ANIMS%", "\n".join(anims))
            .replace("%PARTS%", "\n".join(parts)).replace("%TICKER%", H.escape(TICKER * 6)).replace("%DUR%", str(DURATION)))
    (HF / "index.html").write_text(page, encoding="utf-8")
    (ROOT / "cues.json").write_text(json.dumps({"duration": DURATION, "cues": cues, "drop_t": LS[13], "tense": [LS[9], LS[11]]}, indent=1))
    # subtitles
    def ts(v): return f"{int(v//3600):02d}:{int(v%3600//60):02d}:{int(v%60):02d},{int(round((v%1)*1000)):03d}"
    srt = [f"{i+1}\n{ts(TIMES[i][0])} --> {ts(TIMES[i][1])}\n{' '.join(c).replace('*','')}\n" for i, (_a, c, _b) in enumerate(LINES)]
    (ROOT / "renders/subtitles.srt").write_text("\n".join(srt), encoding="utf-8")
    print("duration", DURATION, "clips", len(clips), "anims", len(anims), "cues", len(cues))


TEMPLATE = r"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>Daily AI News DeepSeek</title>
<script src="assets/gsap.min.js"></script>
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
</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="%DUR%">
  <div id="bg"></div><div id="glow"></div><div id="grid"></div>
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
</script>
</body></html>
"""

if __name__ == "__main__":
    build()

"""AI automation + free tools reel: voice assembly, captions, full-frame scenes, cue list.
Run: python reel.py  (then python soundbed.py, then hyperframes render)."""
import json, random, re, subprocess, html as H
from pathlib import Path
import numpy as np

ROOT = Path(__file__).parent
HF = ROOT / "hyperframes"
SR = 48000
R = lambda x: round(x, 3)

# ---------- 1. lines: (speech segment ids, caption chunks, sfx) ----------
LINES = [
    ([0], ["আপনি কি *জানেন*,"], ["boom"]),
    ([1], ["AI এখন শুধু", "*প্রশ্নের উত্তর* দেওয়ার", "মধ্যেই *সীমাবদ্ধ নেই*?"], ["whoosh", "glitch"]),
    ([2], ["AI দিয়ে অনেক", "কাজের প্রক্রিয়াও", "*অটোমেট* করা সম্ভব!"], ["riser"]),
    ([3], ["ধরুন, আপনার", "একটি *ব্যবসা* আছে।"], ["whoosh"]),
    ([4], ["প্রতিদিন কাস্টমারের", "প্রশ্নের *উত্তর*,"], ["pop", "pop2"]),
    ([5], ["*রিপোর্ট* তৈরি,", "কনটেন্ট *প্ল্যানিং*…"], ["tick", "tick"]),
    ([6], ["এসব কাজে AI", "আপনাকে *সাহায্য* করতে পারে।"], ["ding"]),
    ([7], ["আর সবচেয়ে", "*মজার* ব্যাপার,", "শুরু করতে সব সময়", "*টাকা* খরচ করতে হবে না!"], ["whoosh", "flash"]),
    ([8], ["*ChatGPT*, Gemini", "কিংবা *NotebookLM*-এর", "মতো টুলের *ফ্রি*", "সুবিধা দিয়েও", "অনেক কাজ করা যায়।"], ["pop", "pop2"]),
    ([9], ["তবে *সাবধান*!"], ["boom"]),
    ([10, 11], ["AI দিয়ে তৈরি", "সব ছবি, ভিডিও", "কিংবা তথ্য", "*সত্যি নয়*।"], ["glitch"]),
    ([12], ["তাই গুরুত্বপূর্ণ তথ্য", "ব্যবহারের আগে অবশ্যই", "*যাচাই* করবেন।"], ["ding"]),
    ([13], ["প্রতিদিন AI-এর", "*নতুন খবর*,"], ["whoosh", "tick"]),
    ([14], ["ফ্রি টুলস আর", "কাজের *টিপস* জানতে", "আমাদের সঙ্গে *থাকুন*।"], ["pop"]),
    ([15], ["কারণ AI-এর ভবিষ্যৎ", "শুধু *জানার* নয়,"], ["riser"]),
    ([16], ["*কাজে লাগানোরও*!"], ["flash"]),
]
GAP, SECTION_GAP, INTRA = 0.2, 0.32, 0.12
SECTION_BEFORE = {3, 7, 9, 12, 14}
END_CARD = 3.0
PAD, FADE = 0.04, 0.012

# ---------- 2. tight voiceover ----------
segs = json.loads((ROOT / "voice/segs.json").read_text())
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "voice/vo_raw.mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
out, t, TIMES = [np.zeros(int(0.15 * SR), np.float32)], 0.15, []
for li, (ids, _c, _s) in enumerate(LINES):
    if li:
        g = SECTION_GAP if li in SECTION_BEFORE else GAP
        out.append(np.zeros(int(g * SR), np.float32)); t += g
    st = t
    for k, sid in enumerate(ids):
        if k:
            out.append(np.zeros(int(INTRA * SR), np.float32)); t += INTRA
        a, b = segs[sid]
        p = x[int(max(0, a - PAD) * SR): int((b + PAD) * SR)].copy()
        f = int(FADE * SR); p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
        out.append(p); t += len(p) / SR
    TIMES.append((R(st), R(t)))
vo = np.concatenate(out)
tmp = ROOT / "voice/vo_cut.f32"; tmp.write_bytes(vo.astype(np.float32).tobytes())
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", str(tmp),
                "-af", "highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=7",
                "-ar", str(SR), str(ROOT / "voice/vo_clean.wav")], check=True)
tmp.unlink()

# scene windows: each line holds until the next starts; end card after the last
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


@scene(0)
def _(s, e):
    nodes = "".join(f'<div id="n0d{k}" class="nn" style="left:{x}px;top:{y}px"></div>' for k, (x, y) in enumerate(((180, 300), (900, 260), (140, 820), (920, 860), (540, 180), (540, 960))))
    h = f"""{nodes}<div id="q0" class="bigq">?</div><div id="p0" class="pill dark-bg" style="top:1010px">🤖 AI এখন আর শুধু chatbot না</div>"""
    a = [f'tl.fromTo("#q0",{{scale:3,opacity:0,rotation:-30}},{{scale:1,opacity:1,rotation:0,duration:.35,ease:"power4.in"}},{s});',
         shake("#s0in", s + .36, 4, 14), pop("#p0", s + .45)]
    a += [pop(f"#n0d{k}", s + .1 + k * .05, d=.25) for k in range(6)]
    a += [f'tl.to("#q0",{{scale:1.08,duration:.25,yoyo:true,repeat:3,ease:"sine.inOut"}},{R(s+.5)});']
    return h, a


@scene(1)
def _(s, e):
    h = """<div id="box1" class="cage">
      <div id="b1q" class="bub me">AI, একটা প্রশ্ন ছিল…</div>
      <div id="b1a" class="bub ai2">এই নিন উত্তর ✅</div>
    </div>
    <div id="k1a" class="shard" style="left:150px;top:250px"></div><div id="k1b" class="shard" style="left:830px;top:250px"></div>
    <div id="k1c" class="shard" style="left:150px;top:850px"></div><div id="k1d" class="shard" style="left:830px;top:850px"></div>
    <div id="st1" class="stamp2 green-st">সীমাবদ্ধ নেই!</div>"""
    m = s + (e - s) * .55
    a = [slide("#box1", s, y=300), slide("#b1q", s + .25, x=200), slide("#b1a", s + .6, x=-200),
         f'tl.to("#box1",{{scale:1.15,opacity:0,duration:.25,ease:"power2.in"}},{R(m)});']
    a += [f'tl.fromTo("#k1{c}",{{opacity:0,x:0,y:0}},{{opacity:1,x:{dx},y:{dy},rotation:{r},duration:.5,ease:"power2.out"}},{R(m)});'
          for c, dx, dy, r in (("a", -260, -260, -90), ("b", 260, -260, 90), ("c", -260, 260, 90), ("d", 260, 260, -90))]
    a += [f'tl.from("#st1",{{scale:3,opacity:0,rotation:10,duration:.25,ease:"power4.in"}},{R(m+.15)});', shake("#s1in", m + .4)]
    return h, a


@scene(2)
def _(s, e):
    nodes = [("⚡", "Trigger", 130), ("🤖", "AI", 430), ("✅", "Action", 730)]
    h = "".join(f'<div id="w2n{k}" class="wnode" style="left:{x}px"><div class="wico">{ic}</div><div class="wlab">{lb}</div></div>' for k, (ic, lb, x) in enumerate(nodes))
    h += '<div id="w2l1" class="wline" style="left:350px"></div><div id="w2l2" class="wline" style="left:650px"></div>'
    h += '<div id="w2p" class="pulse"></div><div id="w2t" class="kin">AUTOMATION</div>'
    h += '<div class="gearrow"><div id="g2a" class="emo e140">⚙️</div><div id="g2b" class="emo e140">⚙️</div><div id="g2c" class="emo e140">⚙️</div></div>'
    a = [pop(f"#w2n{k}", s + .1 + k * .25) for k in range(3)]
    a += [f'tl.from("#w2l{k}",{{scaleX:0,duration:.25}},{R(s+.3+k*.25)});' for k in (1, 2)]
    a += [f'tl.fromTo("#w2p",{{x:0,opacity:1}},{{x:640,duration:.9,repeat:{max(0,int((e-s-.9)//1.0)-1)},ease:"none"}},{R(s+.9)});',
          f'tl.from("#w2t",{{scaleX:0,opacity:0,duration:.35,ease:"power3.out"}},{R(s+.8)});']
    a += [f'tl.fromTo("#g2{c}",{{rotation:0}},{{rotation:{d*360},duration:{R(e-s)},ease:"none"}},{s});' for c, d in (("a", 1), ("b", -1), ("c", 1))]
    return h, a


@scene(3)
def _(s, e):
    coins = "".join(f'<div id="c3{k}" class="emo e110" style="left:{x}px;top:{y}px">🪙</div>' for k, (x, y) in enumerate(((180, 300), (800, 330), (230, 700), (760, 720))))
    h = f"""{coins}<div id="shop" class="emo e360" style="left:360px;top:280px">🏪</div>
    <div id="sign3" class="pill gold-bg" style="top:700px">আপনার ব্যবসা</div>"""
    a = [f'tl.from("#shop",{{y:400,opacity:0,duration:.4,ease:"back.out(1.6)"}},{s});', pop("#sign3", s + .4)]
    a += [f'tl.from("#c3{k}",{{y:-400,opacity:0,duration:.45,ease:"bounce.out"}},{R(s+.5+k*.12)});' for k in range(4)]
    return h, a


@scene(4)
def _(s, e):
    h = """<div id="ph4" class="phone">
      <div class="ph-top">💬 Page Inbox</div>
      <div id="m4a" class="bub ai2 l">👤 ভাই, এটার দাম কত?</div>
      <div id="m4b" class="bub me r">🤖 ৳৪৫০ — আজই ডেলিভারি!</div>
      <div id="m4c" class="bub ai2 l">👤 অর্ডার কনফার্ম 🙌</div>
    </div><div id="bd4" class="badge2 green-bg" style="left:640px;top:200px">⚡ ১ সেকেন্ডে রিপ্লাই</div>"""
    a = [slide("#ph4", s, y=500, d=.35), slide("#m4a", s + .3, x=-200), slide("#m4b", s + .8, x=200),
         slide("#m4c", s + 1.3, x=-200), pop("#bd4", s + .9)]
    return h, a


@scene(5)
def _(s, e):
    bars = "".join(f'<div id="b5{k}" class="cbar" style="height:{h}px"></div>' for k, h in enumerate((90, 150, 120, 210, 260)))
    days = "".join(f'<div class="day">{d}</div>' for d in range(1, 15))
    h = f"""<div id="dash" class="panel" style="left:70px;top:200px;width:520px;height:430px">
      <div class="ptitle">📊 রিপোর্ট</div><div class="minichart">{bars}</div><div id="kpi" class="kpi">+৩২%</div></div>
    <div id="cal" class="panel" style="left:470px;top:560px;width:540px;height:430px">
      <div class="ptitle">🗓️ কনটেন্ট প্ল্যান</div><div class="cal">{days}</div>
      <div id="pi1" class="emo e90" style="left:60px;top:150px">🎬</div><div id="pi2" class="emo e90" style="left:250px;top:150px">📸</div><div id="pi3" class="emo e90" style="left:150px;top:260px">✍️</div></div>"""
    m = s + (e - s) * .45
    a = [slide("#dash", s, x=-500)] + [f'tl.from("#b5{k}",{{scaleY:0,duration:.2}},{R(s+.15+k*.08)});' for k in range(5)]
    a += [pop("#kpi", s + .6), slide("#cal", m, x=500)] + [pop(f"#pi{k}", m + .25 + k * .12) for k in (1, 2, 3)]
    return h, a


@scene(6)
def _(s, e):
    icons = [("💬", 180, 330), ("📊", 820, 330), ("🗓️", 500, 840)]
    h = '<div id="bot6" class="emo e320" style="left:380px;top:320px">🤖</div>'
    h += "".join(f'<div id="o6{k}" class="orb" style="left:{x}px;top:{y}px">{ic}</div>' for k, (ic, x, y) in enumerate(icons))
    h += '<div id="ring6" class="ring cyan-ring" style="left:240px;top:180px"></div>'
    a = [pop("#bot6", s), f'tl.fromTo("#ring6",{{scale:.4,opacity:1}},{{scale:1.5,opacity:0,duration:.9,repeat:1}},{R(s+.2)});']
    a += [f'tl.from("#o6{k}",{{x:{540-x-60},y:{480-y-60},scale:0,duration:.4,ease:"back.out(2)"}},{R(s+.3+k*.15)});' for k, (_i, x, y) in enumerate(icons)]
    return h, a


@scene(7)
def _(s, e):
    m = s + (e - s) * .38
    h = """<div id="r7" class="rays"></div><div id="e7" class="emo e320" style="left:380px;top:200px">🤩</div>
    <div id="t7" class="big-t" style="top:620px">সবচেয়ে <span class="y">মজার</span> ব্যাপার</div>
    <div id="pr7" class="price">৳ ৯৯৯৯<i id="x7" class="strike-line"></i></div>
    <div id="z7" class="zero">৳০</div><div id="f7" class="stamp2 green-st" style="top:820px">FREE!</div>"""
    a = [f'tl.fromTo("#r7",{{rotation:0,scale:.3}},{{rotation:60,scale:1.2,duration:{R(e-s)},ease:"power1.out"}},{s});',
         pop("#e7", s + .05), slide("#t7", s + .2, y=80),
         f'tl.to("#e7",{{opacity:0,y:-200,duration:.25}},{R(m)});', f'tl.to("#t7",{{opacity:0,duration:.2}},{R(m)});',
         pop("#pr7", m + .1), f'tl.from("#x7",{{scaleX:0,duration:.25}},{R(m+.7)});',
         f'tl.to("#pr7",{{y:-160,scale:.6,opacity:.5,duration:.3}},{R(m+1.0)});',
         f'tl.from("#z7",{{scale:3,opacity:0,duration:.3,ease:"power4.in"}},{R(m+1.05)});',
         f'tl.from("#f7",{{scale:3,opacity:0,rotation:-12,duration:.25,ease:"power4.in"}},{R(m+1.5)});', shake("#s7in", m + 1.75)]
    return h, a


@scene(8)
def _(s, e):
    tools = [("ChatGPT", "#10a37f", "লেখা • আইডিয়া"), ("Gemini", "#4f8bff", "রিসার্চ • ইমেজ"), ("NotebookLM", "#f2a33a", "নোট • অডিও সারাংশ")]
    h = "".join(f'<div id="tc{k}" class="tool" style="top:{190+k*230}px"><span class="tdot2" style="background:{c}"></span><div><div class="tname">{n}</div><div class="tsub">{sub}</div></div><div id="tf{k}" class="ftag">FREE</div></div>'
                for k, (n, c, sub) in enumerate(tools))
    h += '<div id="flow8" class="flow"><span class="emo e110" style="position:relative">📄</span><span class="arr">➜</span><span class="fpill">NotebookLM</span><span class="arr">➜</span><span class="emo e110" style="position:relative">🎧</span></div>'
    a = [slide(f"#tc{k}", s + .1 + k * .55, x=-800) for k in range(3)]
    a += [f'tl.from("#tf{k}",{{scale:2.5,opacity:0,rotation:-15,duration:.22,ease:"power4.in"}},{R(s+.4+k*.55)});' for k in range(3)]
    a += [slide("#flow8", s + (e - s) * .55, y=200)]
    return h, a


@scene(9)
def _(s, e):
    h = """<div id="sir" class="siren"></div><div id="w9" class="warn"><div class="warn-ex">!</div></div>
    <div id="t9" class="big-t" style="top:820px">তবে <span class="r">সাবধান!</span></div>"""
    a = [pop("#w9", s, d=.25), f'tl.fromTo("#sir",{{opacity:0}},{{opacity:.7,duration:.12,yoyo:true,repeat:5}},{s});',
         shake("#s9in", s + .2, 6, 16), slide("#t9", s + .1, y=80)]
    return h, a


@scene(10)
def _(s, e):
    cards = [("🖼️", "ছবি", 90), ("🎬", "ভিডিও", 400), ("📰", "তথ্য", 710)]
    h = "".join(f'<div id="fc{k}" class="fcard" style="left:{x}px"><div class="emo e140" style="position:relative;margin:0 auto">{ic}</div><div class="flab">{lb}</div><div id="fs{k}" class="fstamp">FAKE?</div></div>'
                for k, (ic, lb, x) in enumerate(cards))
    h += '<div id="ai10" class="pill dark-bg" style="top:200px">🤖 AI দিয়ে তৈরি</div>'
    m = s + (e - s) * .7
    a = [pop("#ai10", s)] + [slide(f"#fc{k}", s + .25 + k * .45, y=300) for k in range(3)]
    a += [f'tl.from("#fs{k}",{{scale:2.6,opacity:0,duration:.2,ease:"power4.in"}},{R(m+k*.12)});' for k in range(3)]
    a += [f'tl.fromTo("#s10in",{{x:-14,skewX:8}},{{x:0,skewX:0,duration:.05,repeat:5,yoyo:true}},{R(m+.4)});']
    return h, a


@scene(11)
def _(s, e):
    rows = "".join(f'<div class="doc-row"><span id="t11{k}" class="tick">✓</span><span class="doc-l" style="width:{w}px"></span></div>' for k, w in enumerate((420, 360, 450, 300)))
    h = f"""<div class="doc">{rows}</div><div id="mag" class="emo e240" style="left:120px;top:230px">🔍</div>
    <div id="v11" class="stamp2 green-st" style="top:780px">VERIFIED ✓</div>"""
    m = s + (e - s) * .62
    a = [f'tl.fromTo("#mag",{{x:0,y:0}},{{x:520,y:420,duration:{R(m-s-.1)},ease:"sine.inOut"}},{R(s+.1)});']
    a += [pop(f"#t11{k}", s + .3 + k * (m - s - .3) / 4) for k in range(4)]
    a += [f'tl.from("#v11",{{scale:3,opacity:0,rotation:-10,duration:.25,ease:"power4.in"}},{R(m)});', shake("#s11in", m + .25, 3)]
    return h, a


@scene(12)
def _(s, e):
    h = """<div id="cal12" class="bigcal"><div class="calh">প্রতিদিন</div><div class="calnum"><div id="cn12" class="calcol"><div>১</div><div>২</div><div>৩</div><div>৪</div><div>৫</div><div>৬</div><div>৭</div></div></div></div>
    <div id="nw12" class="panel" style="left:520px;top:300px;width:470px;height:300px"><div class="ptitle">📰 AI খবর</div><div class="np-l" style="width:90%"></div><div class="np-l" style="width:70%"></div><div class="np-l" style="width:80%"></div></div>
    <div id="nb12" class="badge2 red-bg" style="left:760px;top:250px">NEW</div>"""
    a = [slide("#cal12", s, x=-400), f'tl.fromTo("#cn12",{{y:0}},{{y:-1080,duration:{R(e-s-.2)},ease:"power2.inOut"}},{R(s+.2)});',
         slide("#nw12", s + .3, x=400), pop("#nb12", s + .7)]
    return h, a


@scene(13)
def _(s, e):
    h = """<div id="ch1" class="chip2" style="top:220px">🆓 ফ্রি টুলস</div><div id="ch2" class="chip2" style="top:420px">💡 কাজের টিপস</div>
    <div id="fol" class="follow">ফলো করুন</div><div id="bell" class="emo e200" style="left:830px;top:600px">🔔</div><div id="cur13" class="cursor big"></div>"""
    m = s + (e - s) * .5
    a = [slide("#ch1", s, x=-700), slide("#ch2", s + .35, x=700), pop("#fol", m - .2),
         f'tl.from("#cur13",{{x:300,y:300,opacity:0,duration:.4}},{R(m)});',
         f'tl.to("#fol",{{scale:.9,duration:.08,yoyo:true,repeat:1}},{R(m+.45)});',
         f'tl.to("#fol",{{backgroundColor:"#39FF14",duration:.1}},{R(m+.5)});', pop("#bell", m + .5),
         f'tl.to("#bell",{{rotation:18,duration:.08,yoyo:true,repeat:5}},{R(m+.8)});']
    return h, a


@scene(14)
def _(s, e):
    h = """<div id="br14" class="emo e320" style="left:380px;top:200px">🧠</div><div id="j14" class="pill dark-bg big-pill" style="top:620px">শুধু জানা…</div>"""
    a = [pop("#br14", s), slide("#j14", s + .3, y=80), f'tl.to("#br14",{{scale:1.1,duration:.3,yoyo:true,repeat:3}},{R(s+.4)});']
    return h, a


@scene(15)
def _(s, e):
    h = """<div id="r15" class="rays"></div><div id="rk15" class="emo e320" style="left:380px;top:300px">🚀</div>
    <div id="k15" class="big-t" style="top:760px"><span class="y">কাজে লাগানো!</span></div>"""
    a = [f'tl.fromTo("#r15",{{rotation:0,scale:.3}},{{rotation:45,scale:1.2,duration:{R(e-s)},ease:"power1.out"}},{s});',
         f'tl.from("#rk15",{{y:500,opacity:0,duration:.4,ease:"back.out(1.6)"}},{s});',
         f'tl.to("#rk15",{{y:-60,duration:{R(e-s-.4)},ease:"power1.in"}},{R(s+.4)});', pop("#k15", s + .2)]
    return h, a


def end_card(s, e):
    words = ["LEARN", "CREATE", "GROW"]
    h = '<div id="ecg" class="ring gold-ring" style="left:140px;top:300px;width:800px;height:800px"></div>'
    h += '<div id="ec1" class="ecard-t">DAILY<br>AI UPDATE</div>'
    h += '<div class="ewords">' + '<span class="dotsep">•</span>'.join(f'<span id="ew{k}" class="ew">{w}</span>' for k, w in enumerate(words)) + '</div>'
    h += '<div id="ech" class="pill dark-bg" style="top:1060px">AI খবর ⚡ ফলো করুন</div>'
    a = [f'tl.from("#ec1",{{scale:.3,opacity:0,duration:.45,ease:"back.out(2)"}},{R(s)});',
         f'tl.fromTo("#ecg",{{scale:.4,opacity:1}},{{scale:1.3,opacity:0,duration:1.0,repeat:1}},{R(s+.2)});']
    a += [f'tl.from("#ew{k}",{{y:80,opacity:0,duration:.3,ease:"back.out(2)"}},{R(s+.5+k*.3)});' for k in range(3)]
    a += [pop("#ech", s + 1.5)]
    return h, a


SECTIONS = [(0, "#00c8ff", "🤖 AI অটোমেশন"), (3, "#4f8bff", "💼 ব্যবসায় AI"), (7, "#22e06b", "🆓 ফ্রি AI টুলস"),
            (9, "#ff2d2d", "⚠️ সাবধান"), (12, "#ffd400", "DAILY AI UPDATE")]


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

    rnd = random.Random(5); parts = []
    for k in range(18):
        x0, y0, sz = rnd.randint(20, 1040), rnd.randint(150, 1800), rnd.choice((6, 8, 10, 14))
        parts.append(f'<div id="pt{k}" class="pt" style="left:{x0}px;top:{y0}px;width:{sz}px;height:{sz}px"></div>')
        anims.append(f'tl.fromTo("#pt{k}",{{y:0}},{{y:{-rnd.randint(200, 600)},duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#grid",{{y:0}},{{y:-480,duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#glow",{{scale:.9}},{{scale:1.1,duration:1.3,yoyo:true,repeat:{max(0, int(DURATION // 1.3) - 1)},ease:"sine.inOut"}},0);')
    anims.append(f'tl.fromTo("#prog",{{scaleX:0}},{{scaleX:1,duration:{DURATION},ease:"none"}},0);')

    page = (TEMPLATE.replace("%CLIPS%", "\n".join(clips)).replace("%ANIMS%", "\n".join(anims))
            .replace("%PARTS%", "\n".join(parts)).replace("%DUR%", str(DURATION)))
    (HF / "index.html").write_text(page, encoding="utf-8")
    (ROOT / "cues.json").write_text(json.dumps({"duration": DURATION, "cues": cues, "drop_t": LS[14], "tense": [LS[9], LS[12]]}, indent=1))
    # subtitles
    def ts(v): return f"{int(v//3600):02d}:{int(v%3600//60):02d}:{int(v%60):02d},{int(round((v%1)*1000)):03d}"
    srt = [f"{i+1}\n{ts(TIMES[i][0])} --> {ts(TIMES[i][1])}\n{' '.join(c).replace('*','')}\n" for i, (_a, c, _b) in enumerate(LINES)]
    (ROOT / "renders/subtitles.srt").write_text("\n".join(srt), encoding="utf-8")
    print("duration", DURATION, "clips", len(clips), "anims", len(anims), "cues", len(cues))


TEMPLATE = r"""<!doctype html>
<html lang="bn"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>AI Automation Reel</title>
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
</style></head>
<body>
<div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="%DUR%">
  <div id="bg"></div><div id="glow"></div><div id="grid"></div>
%PARTS%
  <div id="vig"></div>
%CLIPS%
  <div id="brand">AI খবর ⚡</div><div id="prog"></div><div id="flash"></div>
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

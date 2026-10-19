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
            an.append(f'tl.from("#{cid}w{k}",{{y:46,opacity:0,duration:.32,ease:"expo.out"}},{R(wt)});')
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
    ease = kw.get("ease", "expo.out")
    return f'tl.from("{sel}",{{y:70,scale:.86,rotation:-3,opacity:0,duration:{max(.45, kw.get("d", .3) + .15)},ease:"{ease}"}},{R(t)});'

def slide(sel, t, x=0, y=0, d=.32):
    return f'tl.from("{sel}",{{x:{x},y:{y},opacity:0,duration:{d + .2},ease:"expo.out"}},{R(t)});'

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


# 0 — split-flap departure board spelling BREAKING
@scene(0)
def _(s, e):
    word = "BREAKING"
    tiles = "".join(f'<div class="flap"><div id="fl{k}" class="flapin">{c}</div><div class="flapline"></div></div>' for k, c in enumerate(word))
    h = f"""<div class="board"><div class="bhead">● LIVE · DEPARTURES OF NEWS</div><div class="flaps">{tiles}</div>
    <div class="flaps small"><div class="flap s"><div id="fln" class="flapin">NEWS</div><div class="flapline"></div></div></div></div>
    <div id="mic0" class="emo e200" style="left:440px;top:760px">🎙️</div>"""
    a = [f'tl.from("#fl{k}",{{rotationX:-90,transformPerspective:600,transformOrigin:"50% 0%",duration:.22,ease:"power2.out"}},{R(s+.05+k*.06)});' for k in range(len(word))]
    a += [f'tl.from("#fln",{{rotationX:-90,transformPerspective:600,transformOrigin:"50% 0%",duration:.25}},{R(s+.6)});', pop("#mic0", s + .5)]
    return h, a


# 1 — slot machine landing on CODE / GAME / 3D
@scene(1)
def _(s, e):
    syms = [["🍒", "⭐", "🔔", "💎", "</>"], ["🍋", "🔔", "⭐", "🍒", "🎮"], ["⭐", "💎", "🍋", "🔔", "3D"]]
    reels = ""
    for r, col in enumerate(syms):
        cells = "".join(f'<div class="cell{" big" if c in ("</>", "3D") else ""}">{c}</div>' for c in col)
        reels += f'<div class="reel"><div id="rc{r}" class="rcol">{cells}</div></div>'
    h = f"""<div class="slotm"><div class="stop">JACKPOT</div><div class="reels">{reels}</div><div class="slab2"><span>কোড</span><span>গেম</span><span>থ্রিডি</span></div></div>
    <div id="lev1" class="lever"><div class="knob2"></div></div>"""
    st = (e - s) / 3
    a = [f'tl.fromTo("#lev1",{{rotation:0}},{{rotation:40,duration:.18,yoyo:true,repeat:1,transformOrigin:"50% 100%"}},{R(s)});']
    a += [f'tl.fromTo("#rc{r}",{{y:0}},{{y:-760,duration:{R(.6+r*st*.8)},ease:"back.out(1.2)"}},{R(s+.1)});' for r in range(3)]
    return h, a


# 2 — sonar scan finds the DeepSeek whale
@scene(2)
def _(s, e):
    h = """<div class="sonar"><div class="sring r1"></div><div class="sring r2"></div><div class="sring r3"></div>
      <div id="sweep2" class="sweep"></div><div id="wh2" class="emo e140" style="left:300px;top:110px">🐋</div></div>
    <div id="ds2" class="dsword" style="top:760px;font-size:120px">DeepSeek</div>
    <div id="b2a" class="blip" style="left:120px;top:300px">কী এসেছে?</div><div id="b2b" class="blip" style="left:700px;top:520px">কেন জরুরি?</div>"""
    st = (e - s) / 4
    a = [f'tl.fromTo("#sweep2",{{rotation:0}},{{rotation:720,duration:{R(e-s)},ease:"none"}},{s});',
         f'tl.from("#wh2",{{x:-260,opacity:0,duration:.8,ease:"power2.out"}},{R(s+.2)});', pop("#ds2", s + .5),
         pop("#b2a", s + st * 1.4), pop("#b2b", s + st * 2.3)]
    return h, a


# 3 — boarding pass printing out: FROM V4.1 Flash TO 1017
@scene(3)
def _(s, e):
    h = """<div class="printer"><div class="pslot"></div></div>
    <div class="ticketwin"><div id="tk3" class="ticket">
      <div class="tkrow"><div><div class="tkl">FROM</div><div class="tkv">V4.1</div><div class="tks">Flash</div></div><div class="tkplane">✈</div><div><div class="tkl">TO</div><div class="tkv b">1017</div><div class="tks">Update</div></div></div>
      <div class="tkdash"></div>
      <div class="tkrow2"><div><div class="tkl">DATE</div><div class="tkm">১৭ অক্টোবর ২০২৬</div></div><div><div class="tkl">GATE</div><div class="tkm">AI</div></div></div>
      <div class="barcode"></div></div></div>"""
    a = [f'tl.from("#tk3",{{y:-640,duration:{R(min(1.6,(e-s)*.6))},ease:"steps(12)"}},{R(s+.1)});']
    return h, a


# 4 — RPG level-up card for coding and agent skills (company claim)
@scene(4)
def _(s, e):
    h = """<div class="rpg"><div class="rpgh"><span class="emo e90" style="position:relative;display:inline-block">🐋</span> V4.1 Flash 1017 <span class="lvl">LV ⬆</span></div>
      <div class="skill2"><div class="sk2l">💻 কোডিং</div><div class="xp"><div id="xp4a" class="xpf"></div></div></div>
      <div class="skill2"><div class="sk2l">🤖 AI Agent</div><div class="xp"><div id="xp4b" class="xpf" style="background:#7B3FF2"></div></div></div>
      <div class="claimtag">* কোম্পানির দাবি</div></div>
    <div id="lu4" class="levelup">LEVEL UP!</div>"""
    st = (e - s) / 5
    a = [pop("#s4in .rpg", s), f'tl.fromTo("#xp4a",{{scaleX:.35}},{{scaleX:.9,duration:{R(st*1.5)},ease:"power2.out"}},{R(s+st*1.5)});',
         f'tl.fromTo("#xp4b",{{scaleX:.3}},{{scaleX:.85,duration:{R(st*1.5)},ease:"power2.out"}},{R(s+st*2.5)});',
         f'tl.from("#lu4",{{scale:3,opacity:0,rotation:-12,duration:.3,ease:"power4.in"}},{R(s+st*3.8)});']
    return h, a


# 5 — polaroids dropping onto a corkboard: website, racing game, 3D
@scene(5)
def _(s, e):
    h = f"""<div class="cork">
      <div id="pol1" class="polaroid" style="left:40px;top:60px;transform:rotate(-7deg)"><div class="pimg2 web"><div class="mini-hero"></div><div class="pl"></div><div class="pl short"></div></div><div class="pcap">সফটওয়্যার</div><div class="pin2"></div></div>
      <div id="pol2" class="polaroid" style="left:460px;top:20px;transform:rotate(5deg)"><div class="pimg2 race"><div class="road"></div><div id="car5" class="emo e90" style="left:-20px;top:70px">🏎️</div></div><div class="pcap">ওয়েব গেম</div><div class="pin2"></div></div>
      <div id="pol3" class="polaroid" style="left:250px;top:430px;transform:rotate(-3deg)"><div class="pimg2 three"><div style="position:relative;width:150px;height:150px;margin:20px auto">{cube("cube5", 130)}</div></div><div class="pcap">থ্রিডি</div><div class="pin2"></div></div>
    </div>"""
    st = (e - s) / 4
    a = [f'tl.from("#pol{k}",{{y:-900,rotation:{(-1)**k*25},duration:.55,ease:"bounce.out"}},{R(s+(k-1)*st)});' for k in (1, 2, 3)]
    a += [f'tl.fromTo("#car5",{{x:0}},{{x:380,duration:.8,repeat:{max(0,int((e-s-st)//0.8)-1)},ease:"none"}},{R(s+st)});', spin("#cube5", s, e, 360, 720)]
    return h, a


# 6 — inspector clipboard: pencil ticks the boxes, rubber stamp lands
@scene(6)
def _(s, e):
    rows = "".join(f'<div class="cbrow"><span class="cbox"><span id="ct6{k}" class="ctick">✓</span></span>{t}</div>' for k, t in enumerate(("টেস্ট", "রিভিউ", "বাগ ফিক্স")))
    h = f"""<div class="clipb"><div class="clipt"></div><div class="cbh">QC CHECKLIST</div>{rows}</div>
    <div id="pen6" class="emo e140" style="left:640px;top:330px">✏️</div><div id="stp6" class="rstamp" style="top:700px;left:470px;right:auto;margin:0">যাচাই করুন</div>"""
    st = (e - s - .6) / 3
    a = []
    for k in range(3):
        a += [f'tl.to("#pen6",{{y:{k*130},x:-330,duration:.18}},{R(s+.1+k*st)});', pop(f"#ct6{k}", s + .25 + k * st, d=.15)]
    a += [f'tl.from("#stp6",{{scale:2.6,opacity:0,rotation:8,duration:.22,ease:"power4.in"}},{R(e-.5)});']
    return h, a


# 7 — gate doors slide open: Search & Fetch API revealed
@scene(7)
def _(s, e):
    h = """<div class="gate"><div class="glow2"><div class="apiname">SEARCH API</div><div class="apiplus">+</div><div class="apiname">FETCH API</div><div class="newt2">NEW · উন্মুক্ত</div></div>
      <div id="gl7" class="door l"><span>DEEP</span></div><div id="gr7" class="door r"><span>SEEK</span></div></div>
    <div id="big7" class="bigword" style="top:200px;font-size:110px">বড় আপডেট!</div>"""
    st = (e - s) / 3
    a = [pop("#big7", s), f'tl.to("#gl7",{{x:-460,duration:.8,ease:"power3.inOut"}},{R(s+st)});',
         f'tl.to("#gr7",{{x:460,duration:.8,ease:"power3.inOut"}},{R(s+st)});']
    return h, a


# 8 — puzzle pieces snap together: AI App + Web Search
@scene(8)
def _(s, e):
    h = """<div id="pz8a" class="puzzle a"><span class="emo e110" style="position:relative;display:inline-block">📱</span><div>AI অ্যাপ</div><div class="tab"></div></div>
    <div id="pz8b" class="puzzle b"><div class="slotcut"></div><span class="emo e110" style="position:relative;display:inline-block">🌐</span><div>ওয়েব সার্চ</div></div>
    <div id="snap8" class="snapfx">CLICK!</div><div id="dev8" class="pill dark-bg" style="top:900px">👨‍💻 ডেভেলপারদের নতুন সুযোগ</div>"""
    st = (e - s) / 4
    a = [f'tl.from("#pz8a",{{x:-700,rotation:-20,duration:.6,ease:"expo.out"}},{R(s)});',
         f'tl.from("#pz8b",{{x:700,rotation:20,duration:.6,ease:"expo.out"}},{R(s+st)});',
         f'tl.to("#pz8b",{{x:-60,duration:.25,ease:"power4.in"}},{R(s+st*2)});',
         f'tl.from("#snap8",{{scale:0,opacity:0,duration:.3,ease:"back.out(3)"}},{R(s+st*2+.25)});', pop("#dev8", s + st * 3)]
    return h, a


# 9 — vault door swings open on glowing model files
@scene(9)
def _(s, e):
    files = "".join(f'<div class="vfile">📄 weights-0{k}</div>' for k in range(1, 5))
    h = f"""<div class="vault"><div class="vinside">{files}<div class="vmit">MIT · OPEN WEIGHTS</div></div>
      <div id="vd9" class="vdoor"><div id="vw9" class="vwheel"><span></span><span></span><span></span></div></div></div>"""
    st = (e - s) / 3
    a = [f'tl.to("#vw9",{{rotation:360,duration:{R(st)},ease:"power2.inOut"}},{R(s+.1)});',
         f'tl.to("#vd9",{{rotationY:-105,transformPerspective:1200,transformOrigin:"0% 50%",duration:.8,ease:"power3.inOut"}},{R(s+st+.1)});']
    return h, a


# 10 — a printed receipt: open weights free, API calls cost
@scene(10)
def _(s, e):
    h = """<div class="rwin"><div id="rc10" class="receipt"><div class="rtitle">AI RECEIPT</div><div class="rdash"></div>
      <div class="rline"><span>Open Weights ডাউনলোড</span><span class="g">৳০</span></div>
      <div class="rline"><span>Cloud API কল</span><span class="o">💳 খরচ</span></div>
      <div class="rline"><span>Search/Fetch API</span><span class="o">💳 খরচ</span></div>
      <div class="rdash"></div><div class="rline tot"><span>সবকিছু ফ্রি?</span><span class="x">✗</span></div><div class="zig"></div></div></div>
    <div id="neq10" class="neq" style="left:790px;top:700px">≠</div>"""
    a = [f'tl.from("#rc10",{{y:-760,duration:{R(min(1.8,(e-s)*.55))},ease:"steps(14)"}},{R(s+.1)});',
         f'tl.from("#neq10",{{scale:4,opacity:0,duration:.25,ease:"power4.in"}},{R(e-1.0)});']
    return h, a


# 11 — balance scale: AI power vs safety
@scene(11)
def _(s, e):
    h = """<div class="scale"><div class="post"></div><div class="base"></div>
      <div id="beam11" class="beam"><div class="pan l"><div class="pw">⚡ AI শক্তি</div></div><div class="pan r"><div id="pw11" class="pw">🛡️ নিরাপত্তা</div></div></div></div>"""
    st = (e - s) / 3
    a = [f'tl.fromTo("#beam11",{{rotation:0}},{{rotation:-14,duration:.6,ease:"power2.out"}},{R(s+.1)});',
         f'tl.from("#pw11",{{scale:0,duration:.35,ease:"back.out(2)"}},{R(s+st)});',
         f'tl.to("#beam11",{{rotation:0,duration:.9,ease:"elastic.out(1,0.5)"}},{R(s+st+.3)});']
    return h, a


# 12 — security scanner: laser sweeps the AI output, then VERIFIED
@scene(12)
def _(s, e):
    h = """<div class="scanbox"><div class="doc2"><div class="d2h">🤖 AI-এর ফলাফল</div><div class="pl"></div><div class="pl"></div><div class="pl short"></div><div class="pl"></div><div class="pl short"></div></div>
      <div id="laser12" class="laser"></div></div><div id="ok12" class="rstamp green" style="top:860px">✓ VERIFIED</div>"""
    a = [f'tl.fromTo("#laser12",{{y:0}},{{y:520,duration:.9,yoyo:true,repeat:1,ease:"sine.inOut"}},{R(s+.1)});',
         f'tl.from("#ok12",{{scale:2.6,opacity:0,rotation:-8,duration:.22,ease:"power4.in"}},{R(e-.6)});']
    return h, a


# 13 — daily streak: seven days check in, then follow
@scene(13)
def _(s, e):
    days = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"]
    d = "".join(f'<div class="day2"><div class="dname">{n}</div><div id="dc{k}" class="dfire">🔥</div></div>' for k, n in enumerate(days))
    h = f"""<div class="streak"><div class="sth">📰 প্রতিদিন AI খবর</div><div class="days2">{d}</div></div>
    <div id="fol13" class="follow" style="top:760px;left:240px;width:600px;height:150px;font-size:80px;line-height:150px">ফলো করুন</div>"""
    st = (e - s - .8) / 7
    a = [pop(f"#dc{k}", s + .2 + k * st, d=.15) for k in range(7)]
    a += [pop("#fol13", e - .8), f'tl.to("#fol13",{{scale:.92,backgroundColor:"#00A86B",duration:.1,yoyo:true,repeat:1}},{R(e-.35)});']
    return h, a


# 14 — staircase: learn → apply
@scene(14)
def _(s, e):
    h = """<div class="stairs"><div class="step s1"><span>📚 শিখুন</span></div><div class="step s2"><span>🛠️ কাজে লাগান</span></div><div id="flag14" class="emo e140" style="left:720px;top:-150px">🏆</div></div>
    <div id="climb14" class="emo e140" style="left:150px;top:520px">🧑‍💻</div>"""
    a = [f'tl.from("#s14in .s1",{{y:300,opacity:0,duration:.4,ease:"expo.out"}},{s});',
         f'tl.from("#s14in .s2",{{y:300,opacity:0,duration:.4,ease:"expo.out"}},{R(s+(e-s)*.4)});',
         f'tl.to("#climb14",{{x:520,y:-250,duration:{R((e-s)*.6)},ease:"power2.inOut"}},{R(s+(e-s)*.3)});', pop("#flag14", e - .5)]
    return h, a


def end_card(s, e):
    h = '<div id="ecg" class="ring gold-ring" style="left:140px;top:240px;width:800px;height:800px"></div>'
    h += '<div id="ecw" class="emo e200" style="left:440px;top:230px">🌐</div>'
    h += '<div class="ecard-t" style="top:470px;font-size:118px"><span id="ew0" class="ew2">FOLLOW FOR</span><span id="ew1" class="ew2 y">DAILY</span><span id="ew2" class="ew2 y">AI NEWS</span></div>'
    h += '<div id="ech" class="credits"><div><span class="crl">Explainer</span> Rubel Miah</div><div><span class="crl">Video Editor</span> Paloan</div></div>'
    a = [pop("#ecw", s), f'tl.fromTo("#ecg",{{scale:.4,opacity:1}},{{scale:1.3,opacity:0,duration:1.0,repeat:1}},{R(s+.2)});']
    a += [f'tl.from("#ew{k}",{{y:80,opacity:0,duration:.35,ease:"back.out(2)"}},{R(s+.3+k*.3)});' for k in range(3)]
    a += [slide("#ech", s + 1.3, y=80)]
    return h, a


SECTIONS = [(0, "#FF3B30", "🔴 BREAKING"), (3, "#2D5BFF", "🆕 NEW MODEL"), (5, "#7B3FF2", "🧩 CODE • GAME • 3D"),
            (7, "#00A3C4", "🔍 SEARCH API"), (9, "#FF7A00", "📦 OPEN WEIGHTS"), (11, "#00A86B", "🛡️ AI SAFETY"), (13, "#111111", "⭐ FOLLOW")]
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
        anims.append(f'tl.fromTo("#s{i}in",{{y:14}},{{y:-14,duration:{R(e-s)},ease:"none"}},{s});')
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
<title>Daily AI News Creative</title>
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
</script>
</body></html>
"""

if __name__ == "__main__":
    build()

"""Fully animated explainer (no presenter photo). Reuses the voice-timed LINES,
captions and cue list from build.py and replaces every visual with a full-frame scene."""
import json, random
from build import LINES, LS, DURATION, caption_html, ROOT, HF

R = lambda x: round(x, 3)
H_DIGIT = 400

# ---------- scenes: index -> (html, anims(s, e)) ----------
S = {}


def scene(i):
    def deco(fn):
        S[i] = fn
        return fn
    return deco


@scene(0)
def _(s, e):
    digits = "".join(f'<div class="dg">{d}</div>' for d in "০১২৩৪৫৬")
    html = f"""
    <div id="s0ring" class="ring red-ring"></div><div id="s0ring2" class="ring red-ring"></div>
    <div id="s0k" class="pill red-bg">🚨 OpenAI নিজেই স্বীকার করলো</div>
    <div class="row-c"><div class="slot"><div id="s0col" class="slotcol">{digits}</div></div>
      <div id="s0t" class="mega-sub">টা<br>ভয়ংকর<br><span class="y">AI ঘটনা</span></div></div>
    <div id="s0tape1" class="tape t1"></div><div id="s0tape2" class="tape t2"></div>"""
    a = [f'tl.from("#s0k",{{y:-160,opacity:0,duration:.35,ease:"back.out(2)"}},{s+.05});',
         f'tl.fromTo("#s0col",{{y:0}},{{y:{-6*H_DIGIT},duration:1.0,ease:"power3.out"}},{s+.15});',
         f'tl.from("#s0t",{{x:300,opacity:0,duration:.4,ease:"power3.out"}},{s+.9});',
         f'tl.fromTo("#s0ring",{{scale:.4,opacity:.9}},{{scale:1.6,opacity:0,duration:1.1,repeat:2,ease:"power1.out"}},{s});',
         f'tl.fromTo("#s0ring2",{{scale:.4,opacity:.9}},{{scale:1.6,opacity:0,duration:1.1,repeat:2,ease:"power1.out"}},{s+.55});',
         f'tl.fromTo("#s0tape1",{{x:-200}},{{x:0,duration:{e-s:.2f},ease:"none"}},{s});',
         f'tl.fromTo("#s0tape2",{{x:0}},{{x:-200,duration:{e-s:.2f},ease:"none"}},{s});',
         f'tl.fromTo("#s0in",{{x:-12}},{{x:12,duration:.05,repeat:7,yoyo:true}},{s+1.15});']
    return html, a


@scene(1)
def _(s, e):
    html = """
    <div class="tag">ঘটনা #১</div>
    <div class="stage-box">
      <div id="s1bot" class="emo e260" style="left:60px;top:40px">🤖</div>
      <div id="s1err" class="errcard">⚠ ERROR</div>
      <div id="s1rug" class="rug"></div>
      <div id="s1shh" class="emo e140" style="left:120px;top:-80px">🤫</div>
    </div>
    <div class="big-t">ভুল <span class="r">লুকিয়েছে</span></div>"""
    a = [f'tl.from("#s1bot",{{x:-300,rotation:-20,duration:.35,ease:"back.out(1.8)"}},{s});',
         f'tl.fromTo("#s1err",{{x:-60,y:0,scale:1}},{{x:470,y:150,scale:.6,duration:.7,ease:"power2.in"}},{s+.35});',
         f'tl.to("#s1err",{{opacity:0,duration:.05}},{s+1.05});',
         f'tl.fromTo("#s1rug",{{scaleY:1}},{{scaleY:1.25,duration:.12,yoyo:true,repeat:1}},{s+1.05});',
         f'tl.from("#s1shh",{{scale:0,rotation:-30,duration:.3,ease:"back.out(3)"}},{s+1.2});']
    return html, a


@scene(2)
def _(s, e):
    bars = "".join(f'<div id="s2b{k}" class="cbar" style="height:{h}px"></div>' for k, h in enumerate((160, 260, 380, 520)))
    html = f"""
    <div class="tag">ঘটনা #২</div>
    <div class="chart">{bars}<div id="s2stamp" class="stamp">FAKE</div></div>
    <div class="big-t"><span class="r">ভুয়া</span> ডেটা</div>"""
    a = [f'tl.from("#s2b{k}",{{scaleY:0,duration:.25,ease:"power3.out"}},{s+.05+k*.12});' for k in range(4)]
    a += [f'tl.from("#s2stamp",{{scale:3.2,opacity:0,rotation:8,duration:.22,ease:"power4.in"}},{s+.7});',
          f'tl.fromTo("#s2in",{{x:-10}},{{x:10,duration:.05,repeat:3,yoyo:true}},{s+.92});']
    return html, a


@scene(3)
def _(s, e):
    dots = "".join(f'<div id="s3d{k}" class="trail" style="left:{180+k*95}px;top:{430-int(260*(1-((k-3)/3.5)**2))}px"></div>' for k in range(7))
    html = f"""
    <div class="tag">ঘটনা #৩</div>
    <div class="stage-box">
      {dots}
      <div id="s3doc" class="emo e200" style="left:40px;top:330px">📄</div>
      <div id="s3globe" class="emo e260" style="left:640px;top:250px">🌐</div>
      <div id="s3pub" class="badge red-bg" style="left:560px;top:120px">PUBLIC!</div>
    </div>
    <div class="big-t">ফাইল <span class="r">ইন্টারনেটে</span></div>"""
    a = [f'tl.from("#s3globe",{{scale:0,duration:.35,ease:"back.out(2)"}},{s});',
         f'tl.to("#s3doc",{{x:600,y:-60,rotation:360,scale:.5,duration:.9,ease:"power2.inOut"}},{s+.3});',
         f'tl.to("#s3doc",{{opacity:0,duration:.1}},{s+1.15});']
    a += [f'tl.from("#s3d{k}",{{scale:0,opacity:0,duration:.15}},{s+.35+k*.1});' for k in range(7)]
    a += [f'tl.from("#s3pub",{{scale:0,rotation:-15,duration:.3,ease:"back.out(3)"}},{s+1.2});',
          f'tl.to("#s3globe",{{rotation:20,duration:.1,yoyo:true,repeat:3}},{s+1.15});']
    return html, a


@scene(4)
def _(s, e):
    lines = "".join(f'<div class="np-l" style="width:{w}%"></div>' for w in (95, 88, 92, 70, 90, 60))
    html = f"""
    <div id="s4paper" class="paper">
      <div class="np-head">The New York Times</div>
      <div class="np-rule"></div>
      <div class="np-h">OpenAI জানালো ৬টি উদ্বেগজনক AI ঘটনা</div>
      <div class="np-cols"><div>{lines}</div><div>{lines}</div></div>
    </div>
    <div id="s4src" class="pill dark-bg">📰 সূত্র: The New York Times</div>"""
    a = [f'tl.from("#s4paper",{{rotation:-720,scale:.05,duration:.7,ease:"power3.out"}},{s});',
         f'tl.from("#s4src",{{y:120,opacity:0,duration:.3}},{s+.7});']
    return html, a


@scene(5)
def _(s, e):
    html = """
    <div id="s5ph" class="phone">
      <div class="ph-top">ChatGPT</div>
      <div id="s5m1" class="bub me">আজকের assignment টা করে দাও 🙏</div>
      <div id="s5m2" class="bub ai"><span id="s5d1" class="tdot"></span><span id="s5d2" class="tdot"></span><span id="s5d3" class="tdot"></span></div>
    </div>
    <div id="s5you" class="emo e200" style="right:70px;top:560px">🫵</div>"""
    a = [f'tl.from("#s5ph",{{y:500,duration:.4,ease:"power3.out"}},{s});',
         f'tl.from("#s5m1",{{scale:0,transformOrigin:"100% 100%",duration:.25,ease:"back.out(2)"}},{s+.4});',
         f'tl.from("#s5m2",{{scale:0,transformOrigin:"0% 100%",duration:.25,ease:"back.out(2)"}},{s+.8});']
    a += [f'tl.fromTo("#s5d{k}",{{y:0}},{{y:-14,duration:.18,yoyo:true,repeat:3}},{s+1.0+k*.08});' for k in (1, 2, 3)]
    a += [f'tl.from("#s5you",{{scale:0,rotation:40,duration:.3,ease:"back.out(3)"}},{s+1.2});']
    return html, a


@scene(6)
def _(s, e):
    html = """
    <div id="s6warn" class="warn"><div class="warn-ex">!</div></div>
    <div id="s6t" class="big-t">আপনার <span class="y">জানা দরকার</span></div>"""
    a = [f'tl.from("#s6warn",{{scale:0,rotation:-25,duration:.35,ease:"back.out(2.5)"}},{s});',
         f'tl.to("#s6warn",{{scale:1.12,duration:.22,yoyo:true,repeat:3,ease:"sine.inOut"}},{s+.4});',
         f'tl.from("#s6t",{{y:80,opacity:0,duration:.3}},{s+.3});']
    return html, a


@scene(7)
def _(s, e):
    html = """
    <div class="ice-win"><div id="s7world" class="ice-world">
      <div class="sky"></div><div class="sea"></div>
      <div class="tip"></div><div class="berg"></div>
      <div class="waterline"></div>
    </div></div>
    <div id="s7t" class="pill dark-bg big-pill">এটা কেবল <span class="y">শুরু…</span></div>"""
    a = [f'tl.fromTo("#s7world",{{y:0}},{{y:-760,duration:{e-s-.2:.2f},ease:"power2.inOut"}},{s+.25});',
         f'tl.from("#s7t",{{opacity:0,y:40,duration:.3}},{s+.1});']
    return html, a


def numslam(sid, num, s):
    return (f'<div id="{sid}" class="numslam">{num}</div>',
            [f'tl.fromTo("#{sid}",{{scale:4,opacity:0}},{{scale:1,opacity:1,duration:.3,ease:"power4.in"}},{s});',
             f'tl.to("#{sid}",{{x:-400,y:-300,scale:.45,duration:.35,ease:"power3.inOut"}},{s+.75});'])


@scene(8)
def _(s, e):
    nh, na = numslam("s8n", "১", s)
    html = f"""
    <div id="s8o1" class="orbit o1"></div><div id="s8o2" class="orbit o2"></div><div id="s8o3" class="orbit o3"></div>
    <div id="s8k" class="kick">OpenAI-এর নতুন model</div>
    <div id="s8name" class="brandname cyan-g">Astra</div>{nh}"""
    a = na + [f'tl.from("#s8k",{{y:-60,opacity:0,duration:.3}},{s+.85});',
              f'tl.from("#s8name",{{scale:.2,opacity:0,duration:.45,ease:"back.out(2)"}},{s+.9});']
    a += [f'tl.fromTo("#s8o{k}",{{rotation:{k*40}}},{{rotation:{k*40+(200 if k%2 else -200)},duration:{e-s:.2f},ease:"none"}},{s});' for k in (1, 2, 3)]
    a += [f'tl.from("#s8o{k}",{{scale:0,opacity:0,duration:.4}},{s+.8+k*.1});' for k in (1, 2, 3)]
    return html, a


@scene(9)
def _(s, e):
    html = """
    <div class="kick">সাইবার ঝুঁকি</div>
    <div class="gauge">
      <div class="g-arc"></div><div class="g-mask"></div>
      <div id="s9needle" class="needle"></div><div class="g-hub"></div>
      <div class="g-lab l1">Low</div><div class="g-lab l2">Medium</div><div class="g-lab l3">High</div><div class="g-lab l4">Critical</div>
    </div>
    <div id="s9crit" class="badge red-bg crit">CRITICAL</div>"""
    a = [f'tl.fromTo("#s9needle",{{rotation:-85}},{{rotation:72,duration:1.0,ease:"power2.in"}},{s+.1});',
         f'tl.to("#s9needle",{{rotation:64,duration:.08,yoyo:true,repeat:5}},{s+1.1});',
         f'tl.from("#s9crit",{{scale:0,duration:.25,ease:"back.out(3)"}},{s+1.1});',
         f'tl.to("#s9crit",{{opacity:.3,duration:.12,yoyo:true,repeat:5}},{s+1.4});',
         f'tl.fromTo("#s9in",{{x:-16,skewX:10}},{{x:0,skewX:0,duration:.05,repeat:5,yoyo:true}},{s+1.1});']
    return html, a


@scene(10)
def _(s, e):
    ppl = "".join(f'<div id="s10p{k}" class="emo e110 person">🧑</div>' for k in range(5))
    html = f"""
    <div class="lock-wrap"><div id="s10sh" class="shackle"></div><div class="lockbody"><div class="keyhole"></div></div></div>
    <div class="people">{ppl}</div>
    <div class="big-t">সবাই <span class="r">পাচ্ছে না</span></div>"""
    a = [f'tl.from("#s10sh",{{y:-90,duration:.3,ease:"bounce.out"}},{s+.35});']
    a += [f'tl.from("#s10p{k}",{{y:80,opacity:0,duration:.2}},{s+.05+k*.06});' for k in range(5)]
    a += [f'tl.to("#s10p{k}",{{opacity:.25,duration:.2}},{s+.75});' for k in (0, 1, 3, 4)]
    return html, a


@scene(11)
def _(s, e):
    nh, na = numslam("s11n", "২", s)
    sp = "".join(f'<div id="s11s{k}" class="emo e90" style="left:{x}px;top:{y}px">✨</div>' for k, (x, y) in enumerate(((150, 300), (820, 260), (220, 820), (800, 780))))
    html = f"""{sp}<div id="s11k" class="kick">Meta এনেছে</div>
    <div id="s11name" class="brandname purple-g">Muse</div>
    <div id="s11sub" class="pill dark-bg" style="top:720px">personal AI agent 🤖</div>{nh}"""
    a = na + [f'tl.from("#s11k",{{y:-60,opacity:0,duration:.3}},{s+.85});',
              f'tl.from("#s11name",{{scale:.2,opacity:0,duration:.45,ease:"back.out(2)"}},{s+.9});',
              f'tl.from("#s11sub",{{y:60,opacity:0,duration:.3}},{s+1.3});']
    a += [f'tl.from("#s11s{k}",{{scale:0,rotation:90,duration:.3,ease:"back.out(3)"}},{s+1.0+k*.1});' for k in range(4)]
    return html, a


@scene(12)
def _(s, e):
    html = """
    <div id="s12b" class="bigbub">💬 শুধু উত্তর<div id="s12x" class="strike-line"></div></div>
    <div id="s12no" class="emo e200" style="left:780px;top:640px">❌</div>"""
    a = [f'tl.from("#s12b",{{scale:0,duration:.3,ease:"back.out(2)"}},{s});',
         f'tl.from("#s12x",{{scaleX:0,duration:.3,ease:"power2.out"}},{s+.6});',
         f'tl.from("#s12no",{{scale:0,rotation:-60,duration:.25,ease:"back.out(3)"}},{s+.75});']
    return html, a


@scene(13)
def _(s, e):
    html = """
    <div id="s13g1" class="emo e200" style="left:180px;top:250px">⚙️</div>
    <div id="s13g2" class="emo e140" style="left:330px;top:180px">⚙️</div>
    <div id="s13bot" class="emo e320" style="left:420px;top:260px">🤖</div>
    <div class="tasks"><div id="s13t1" class="task">✓ খোঁজা</div><div id="s13t2" class="task">✓ লেখা</div><div id="s13t3" class="task">✓ পাঠানো</div></div>"""
    a = [f'tl.from("#s13bot",{{y:300,opacity:0,duration:.3,ease:"back.out(1.6)"}},{s});',
         f'tl.fromTo("#s13g1",{{rotation:0}},{{rotation:360,duration:{e-s:.2f},ease:"none"}},{s});',
         f'tl.fromTo("#s13g2",{{rotation:0}},{{rotation:-360,duration:{e-s:.2f},ease:"none"}},{s});']
    a += [f'tl.from("#s13t{k}",{{x:-200,opacity:0,duration:.2,ease:"power3.out"}},{s+.25+k*.28});' for k in (1, 2, 3)]
    return html, a


@scene(14)
def _(s, e):
    html = """
    <div id="s14mail" class="emo e240" style="left:-260px;top:250px">✉️</div>
    <div id="s14cart" class="emo e240" style="left:-260px;top:620px">🛒</div>
    <div id="s14l1" class="lab" style="left:530px;top:330px">ইমেইল পাঠায়</div>
    <div id="s14l2" class="lab" style="left:530px;top:700px">কেনাকাটা করে</div>"""
    a = [f'tl.to("#s14mail",{{x:490,rotation:-12,duration:.45,ease:"power3.out"}},{s});',
         f'tl.from("#s14l1",{{x:200,opacity:0,duration:.3}},{s+.3});',
         f'tl.to("#s14cart",{{x:490,duration:.5,ease:"back.out(1.4)"}},{s+.8});',
         f'tl.from("#s14l2",{{x:200,opacity:0,duration:.3}},{s+1.05});']
    return html, a


@scene(15)
def _(s, e):
    html = """
    <div id="s15dlg" class="dialog">
      <div class="dlg-title">🤖 Muse জানতে চায়</div>
      <div class="dlg-body">এই ইমেইলটা পাঠাবো?</div>
      <div class="dlg-btns"><div class="btn ghost">বাতিল</div><div id="s15ok" class="btn ok">অনুমতি দিন</div></div>
      <div id="s15cur" class="cursor"></div>
    </div>
    <div id="s15chk" class="emo e200" style="left:440px;top:860px">✅</div>"""
    a = [f'tl.from("#s15dlg",{{scale:.6,opacity:0,duration:.3,ease:"back.out(2)"}},{s});',
         f'tl.from("#s15cur",{{x:300,y:260,opacity:0,duration:.6,ease:"power2.inOut"}},{s+.4});',
         f'tl.to("#s15ok",{{scale:.88,duration:.08,yoyo:true,repeat:1}},{s+1.05});',
         f'tl.to("#s15ok",{{backgroundColor:"#39FF14",color:"#000",duration:.1}},{s+1.12});',
         f'tl.from("#s15chk",{{scale:0,duration:.3,ease:"back.out(3)"}},{s+1.2});']
    return html, a


@scene(16)
def _(s, e):
    html = """
    <div id="s16rays" class="rays"></div>
    <div id="s16bolt" class="emo e360" style="left:360px;top:240px">⚡</div>
    <div id="s16t" class="big-t" style="top:820px">সবচেয়ে <span class="y">কাজের পার্ট</span></div>"""
    a = [f'tl.fromTo("#s16rays",{{rotation:0,scale:.3}},{{rotation:90,scale:1.2,duration:{e-s:.2f},ease:"power1.out"}},{s});',
         f'tl.from("#s16bolt",{{scale:0,rotation:-40,duration:.35,ease:"back.out(3)"}},{s+.15});',
         f'tl.to("#s16bolt",{{scale:1.15,duration:.15,yoyo:true,repeat:3}},{s+.6});',
         f'tl.from("#s16t",{{y:80,opacity:0,duration:.3}},{s+.4});']
    return html, a


@scene(17)
def _(s, e):
    nh, na = numslam("s17n", "৩", s)
    html = f"""<div id="s17ring" class="ring green-ring" style="top:180px"></div>
    <div id="s17sh" class="emo e360" style="left:360px;top:230px">🛡️</div>
    <div id="s17t" class="big-t" style="top:820px">নিজেকে <span class="g">safe</span> রাখুন</div>{nh}"""
    a = na + [f'tl.from("#s17sh",{{scale:0,duration:.4,ease:"back.out(2.4)"}},{s+.8});',
              f'tl.fromTo("#s17ring",{{scale:.5,opacity:.9}},{{scale:1.5,opacity:0,duration:.9,repeat:1}},{s+.9});',
              f'tl.from("#s17t",{{y:80,opacity:0,duration:.3}},{s+1.0});']
    return html, a


@scene(18)
def _(s, e):
    keys = "".join(f'<div class="pk">{k}</div>' for k in "১২৩৪৫৬৭৮৯*০#")
    dots = "".join(f'<span id="s18d{k}" class="pd"></span>' for k in range(5))
    html = f"""
    <div id="s18ph" class="phone small">
      <div class="ph-top">PIN দিন</div><div class="pdots">{dots}</div><div class="pad">{keys}</div>
    </div>
    <div id="s18x" class="bigx">✕</div>
    <div id="s18ai" class="pill red-bg" style="top:1000px">🤖 AI-কে কখনো না!</div>"""
    a = [f'tl.from("#s18ph",{{y:500,duration:.35,ease:"power3.out"}},{s});']
    a += [f'tl.from("#s18d{k}",{{scale:0,duration:.08}},{s+.35+k*.1});' for k in range(5)]
    a += [f'tl.from("#s18x",{{scale:3,opacity:0,duration:.22,ease:"power4.in"}},{s+.95});',
          f'tl.fromTo("#s18in",{{x:-14}},{{x:14,duration:.05,repeat:5,yoyo:true}},{s+1.17});',
          f'tl.from("#s18ai",{{y:100,opacity:0,duration:.25}},{s+1.2});']
    return html, a


@scene(19)
def _(s, e):
    chips = [("🔑 পাসওয়ার্ড", 300), ("🪪 NID", 520), ("🔢 OTP", 740)]
    html = "".join(f'<div id="s19c{k}" class="chip" style="top:{y}px">{t}<i id="s19x{k}" class="strike-line"></i></div>' for k, (t, y) in enumerate(chips))
    html += '<div id="s19no" class="emo e200" style="left:800px;top:880px">🚫</div>'
    a = [f'tl.from("#s19c{k}",{{x:-700,duration:.3,ease:"power3.out"}},{s+k*.25});' for k in range(3)]
    a += [f'tl.from("#s19x{k}",{{scaleX:0,duration:.2}},{s+.9+k*.15});' for k in range(3)]
    a += [f'tl.from("#s19no",{{scale:0,rotation:-60,duration:.3,ease:"back.out(3)"}},{s+1.4});']
    return html, a


@scene(20)
def _(s, e):
    html = """
    <div id="s20tag" class="pill green-bg" style="top:170px">Fiverr</div>
    <div id="s20b1" class="bub ai wide" style="top:330px">👤 Client: রিপোর্টটা আজকেই পাঠান</div>
    <div id="s20b2" class="bub me wide" style="top:520px">🤖 AI দিয়ে বানিয়েছি… পাঠাবো?</div>
    <div id="s20pl" class="emo e200" style="left:420px;top:740px">✈️</div>
    <div id="s20q" class="emo e140" style="left:640px;top:700px">❓</div>"""
    a = [f'tl.from("#s20tag",{{scale:0,duration:.25,ease:"back.out(3)"}},{s});',
         f'tl.from("#s20b1",{{x:-600,duration:.3,ease:"power3.out"}},{s+.15});',
         f'tl.from("#s20b2",{{x:600,duration:.3,ease:"power3.out"}},{s+.55});',
         f'tl.from("#s20pl",{{x:-500,y:200,duration:.5,ease:"power2.out"}},{s+.8});',
         f'tl.to("#s20pl",{{y:-20,duration:.25,yoyo:true,repeat:1}},{s+1.3});',
         f'tl.from("#s20q",{{scale:0,duration:.25,ease:"back.out(3)"}},{s+1.2});']
    return html, a


@scene(21)
def _(s, e):
    rows = "".join(f'<div class="doc-row"><span id="s21t{k}" class="tick">✓</span><span class="doc-l" style="width:{w}px"></span></div>' for k, w in enumerate((420, 360, 450, 300)))
    html = f"""
    <div class="doc">{rows}</div>
    <div id="s21mag" class="emo e240" style="left:120px;top:250px">🔍</div>"""
    a = [f'tl.fromTo("#s21mag",{{x:0,y:0}},{{x:520,y:420,duration:1.5,ease:"sine.inOut"}},{s+.1});']
    a += [f'tl.from("#s21t{k}",{{scale:0,duration:.2,ease:"back.out(3)"}},{s+.35+k*.33});' for k in range(4)]
    return html, a


@scene(22)
def _(s, e):
    html = """
    <div id="s22ai" class="brandname gold-g" style="top:230px">AI</div>
    <div class="power"><div id="s22fill" class="pfill"></div><div class="plab">POWER</div></div>
    <div id="s22b1" class="emo e140" style="left:90px;top:300px">⚡</div><div id="s22b2" class="emo e140" style="left:850px;top:300px">⚡</div>"""
    a = [f'tl.from("#s22ai",{{scale:.3,opacity:0,duration:.35,ease:"back.out(2)"}},{s});',
         f'tl.fromTo("#s22fill",{{scaleX:0}},{{scaleX:1,duration:1.1,ease:"power2.in"}},{s+.2});',
         f'tl.from("#s22b1",{{scale:0,duration:.2}},{s+1.2});', f'tl.from("#s22b2",{{scale:0,duration:.2}},{s+1.25});',
         f'tl.fromTo("#s22in",{{x:-10}},{{x:10,duration:.05,repeat:5,yoyo:true}},{s+1.3});']
    return html, a


@scene(23)
def _(s, e):
    html = """
    <div id="s23glow" class="ring gold-ring" style="top:300px"></div>
    <div id="s23hands" class="emo e320" style="left:380px;top:520px">🤲</div>
    <div id="s23key" class="emo e240" style="left:420px;top:200px">🔑</div>
    <div id="s23t" class="big-t" style="top:920px">চাবি <span class="y">আপনার হাতে</span></div>"""
    a = [f'tl.from("#s23hands",{{y:300,opacity:0,duration:.35,ease:"power3.out"}},{s+.05});',
         f'tl.from("#s23key",{{y:-600,rotation:-540,duration:.75,ease:"bounce.out"}},{s+.2});',
         f'tl.fromTo("#s23glow",{{scale:.4,opacity:1}},{{scale:1.6,opacity:0,duration:.9,repeat:1}},{s+.95});',
         f'tl.from("#s23t",{{y:80,opacity:0,duration:.3}},{s+.6});']
    return html, a


@scene(24)
def _(s, e):
    hearts = "".join(f'<div id="s24h{k}" class="emo e90" style="left:{x}px;top:640px">❤️</div>' for k, x in enumerate((700, 780, 860)))
    html = f"""
    <div class="kick" style="top:260px">কমেন্টে লিখুন 👇</div>
    <div id="s24box" class="cmt"><div class="cmt-in"><span id="s24a" class="ch">A</span><span id="s24i" class="ch">I</span><span class="caret"></span></div><div id="s24send" class="send">➤</div></div>
    {hearts}"""
    a = [f'tl.from("#s24box",{{y:300,opacity:0,duration:.3,ease:"power3.out"}},{s});',
         f'tl.from("#s24a",{{opacity:0,duration:.01}},{s+.5});', f'tl.from("#s24i",{{opacity:0,duration:.01}},{s+.7});',
         f'tl.to("#s24send",{{scale:1.3,backgroundColor:"#FFE600",duration:.15,yoyo:true,repeat:1}},{s+1.0});']
    a += [f'tl.fromTo("#s24h{k}",{{y:0,opacity:0,scale:.5}},{{y:-320,opacity:1,scale:1.2,duration:.8,ease:"power1.out"}},{s+1.1+k*.12});' for k in range(3)]
    return html, a


@scene(25)
def _(s, e):
    html = """
    <div id="s25bell" class="emo e240" style="left:420px;top:180px">🔔</div>
    <div id="s25btn" class="follow">ফলো করুন</div>
    <div id="s25sub" class="kick" style="top:860px">প্রতি সপ্তাহে AI-এর আসল খবর ⚡</div>
    <div id="s25cur" class="cursor big"></div>"""
    a = [f'tl.from("#s25btn",{{scale:.3,opacity:0,duration:.35,ease:"back.out(2.4)"}},{s});',
         f'tl.from("#s25cur",{{x:300,y:300,opacity:0,duration:.5}},{s+.4});',
         f'tl.to("#s25btn",{{scale:.9,duration:.08,yoyo:true,repeat:1}},{s+.95});',
         f'tl.to("#s25btn",{{backgroundColor:"#39FF14",duration:.1}},{s+1.0});',
         f'tl.from("#s25bell",{{scale:0,duration:.3,ease:"back.out(3)"}},{s+1.0});',
         f'tl.to("#s25bell",{{rotation:18,duration:.08,yoyo:true,repeat:7}},{s+1.3});',
         f'tl.from("#s25sub",{{y:60,opacity:0,duration:.3}},{s+.5});']
    return html, a


# section colour for the background glow + top pill
SECTIONS = [(0, "#ff2d2d", "🚨 AI ঘটনা"), (8, "#00c8ff", "১ · OpenAI Astra"), (11, "#a855ff", "২ · Meta Muse"),
            (16, "#ffb800", "⚡ কাজের পার্ট"), (17, "#22e06b", "৩ · নিজেকে safe রাখুন"), (22, "#ffd400", "শেষ কথা")]


def build():
    clips, anims, cues = [], [], []
    for i, (s, e, chunks, _f, _c, sfx) in enumerate(LINES):
        html, a = S[i](s, e)
        clips.append(f'<div id="sc{i}" class="clip scene" data-start="{s}" data-duration="{R(e-s)}" data-track-index="4">'
                     f'<div id="s{i}in" class="scene-in">{html}</div></div>')
        anims.append(f'tl.fromTo("#s{i}in",{{scale:1.0}},{{scale:1.045,duration:{R(e-s)},ease:"none"}},{s});')
        anims += a
        if chunks:
            c, ca = caption_html(i, chunks, s, e)
            clips += c; anims += ca
        for x in sfx:
            cues.append({"t": s, "end": e, "sfx": x})
        cues.append({"t": s, "end": e, "sfx": "whoosh"}) if i in (1, 4, 5, 12, 14, 19, 21, 24) else None

    for k, (li, col, label) in enumerate(SECTIONS):
        s = LS[li]; e = LS[SECTIONS[k + 1][0]] if k + 1 < len(SECTIONS) else DURATION
        anims.append(f'tl.to("#glow",{{backgroundColor:"{col}",duration:.3}},{s});')
        clips.append(f'<div id="sec{k}" class="clip secpill" data-start="{s}" data-duration="{R(e-s)}" data-track-index="7"><div id="secp{k}" class="secp">{label}</div></div>')
        anims.append(f'tl.from("#secp{k}",{{y:-90,opacity:0,duration:.3,ease:"back.out(2)"}},{s+.05});')

    for t in (LS[8], LS[11], LS[17], LS[16]):
        anims.append(f'tl.to("#flash",{{opacity:.85,duration:.06,yoyo:true,repeat:1}},{R(t-.06)});')
    anims.append(f'tl.to("#flash",{{opacity:1,duration:.05,yoyo:true,repeat:1}},{R(LS[23]-.05)});')

    # living background: drifting grid, floating particles, breathing glow
    rnd = random.Random(11)
    parts = []
    for k in range(18):
        x, y, sz = rnd.randint(20, 1040), rnd.randint(150, 1800), rnd.choice((6, 8, 10, 14))
        parts.append(f'<div id="pt{k}" class="pt" style="left:{x}px;top:{y}px;width:{sz}px;height:{sz}px"></div>')
        anims.append(f'tl.fromTo("#pt{k}",{{y:0}},{{y:{-rnd.randint(200, 600)},duration:{DURATION},ease:"none"}},0);')
    anims.append(f'tl.fromTo("#grid",{{y:0}},{{y:-480,duration:{DURATION},ease:"none"}},0);')
    n = int(DURATION // 2.6)
    anims.append(f'tl.fromTo("#glow",{{scale:.9}},{{scale:1.1,duration:1.3,yoyo:true,repeat:{max(0, n*2-1)},ease:"sine.inOut"}},0);')
    anims.append(f'tl.fromTo("#prog",{{scaleX:0}},{{scaleX:1,duration:{DURATION},ease:"none"}},0);')

    page = (TEMPLATE.replace("%CLIPS%", "\n".join(clips)).replace("%ANIMS%", "\n".join(anims))
            .replace("%PARTS%", "\n".join(parts)).replace("%DUR%", str(DURATION)))
    (HF / "index.html").write_text(page, encoding="utf-8")
    cfg = json.loads((ROOT / "cues.json").read_text())
    cfg["cues"] = cues
    (ROOT / "cues.json").write_text(json.dumps(cfg, indent=1))
    print("scenes", len(S), "clips", len(clips), "anims", len(anims), "cues", len(cues))


TEMPLATE = r"""<!doctype html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>AI Incidents Explainer</title>
<script src="assets/gsap.min.js"></script>
<style>
@font-face{font-family:"HS";font-weight:700;src:url(assets/hind-siliguri-bengali-700-normal.woff2) format("woff2");unicode-range:U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1;}
@font-face{font-family:"HS";font-weight:700;src:url(assets/hind-siliguri-latin-700-normal.woff2) format("woff2");}
@font-face{font-family:"Noto Color Emoji";src:local("Noto Color Emoji");}
@font-face{font-family:"HS";font-weight:500;src:url(assets/hind-siliguri-bengali-500-normal.woff2) format("woff2");unicode-range:U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1;}
@font-face{font-family:"HS";font-weight:500;src:url(assets/hind-siliguri-latin-500-normal.woff2) format("woff2");}
:root{--y:#FFE600;--g:#39FF14;--r:#FF3B3B;--c:#00d4ff;--p:#b46bff}
body{margin:0;background:#05060a;font-family:"HS","Noto Color Emoji",sans-serif;color:#fff}
#root{position:relative;width:1080px;height:1920px;overflow:hidden}
#bg{position:absolute;left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 30%,#141826,#05060a 70%)}
#glow{position:absolute;left:90px;top:120px;width:900px;height:900px;border-radius:50%;background-color:#ff2d2d;opacity:.28;filter:blur(140px)}
#grid{position:absolute;left:0;top:0;width:1080px;height:2400px;opacity:.5;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 80px),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 80px)}
.pt{position:absolute;border-radius:50%;background:rgba(255,255,255,.35)}
#vig{position:absolute;left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(0,0,0,.65))}
#flash{position:absolute;left:0;top:0;width:1080px;height:1920px;background:#fff;opacity:0}
#prog{position:absolute;left:0;top:0;width:1080px;height:12px;background:var(--y);transform-origin:0 50%}
#brand{position:absolute;left:36px;top:40px;padding:8px 18px;border-radius:12px;background:rgba(255,255,255,.08);font:700 30px "HS";color:#fff}
.secpill{position:absolute;left:0;top:0;width:1080px;height:200px}
.secp{position:absolute;right:36px;top:36px;padding:10px 24px;border-radius:999px;background:rgba(0,0,0,.55);border:2px solid rgba(255,255,255,.18);font:700 32px "HS"}
.scene{position:absolute;left:0;top:0;width:1080px;height:1240px}
.scene-in{position:absolute;left:0;top:0;width:1080px;height:1240px;transform-origin:50% 50%}
.cap{position:absolute;left:0;top:1250px;width:1080px;height:280px;display:flex;align-items:center;justify-content:center}
.capline{max-width:940px;text-align:center;font:700 88px/1.18 "HS";
  text-shadow:0 6px 0 #000,0 -3px 0 #000,4px 0 0 #000,-4px 0 0 #000,4px 4px 0 #000,-4px 4px 0 #000,0 10px 26px rgba(0,0,0,.8)}
.w{display:inline-block;margin:0 12px}.hl{color:var(--y)}
.y{color:var(--y)}.r{color:var(--r)}.g{color:var(--g)}
.emo{position:absolute;display:block;text-align:center;font-family:"Noto Color Emoji"}
.e90{width:90px;height:90px;font-size:80px;line-height:90px}.e110{width:110px;height:110px;font-size:96px;line-height:110px}
.e140{width:140px;height:140px;font-size:120px;line-height:140px}.e200{width:200px;height:200px;font-size:170px;line-height:200px}
.e240{width:240px;height:240px;font-size:210px;line-height:240px}.e260{width:260px;height:260px;font-size:225px;line-height:260px}
.e320{width:320px;height:320px;font-size:280px;line-height:320px}.e360{width:360px;height:360px;font-size:310px;line-height:360px}
.pill{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:200px;padding:16px 34px;border-radius:999px;font:700 46px "HS";white-space:nowrap}
.big-pill{top:980px;font-size:64px}
.red-bg{background:var(--r);color:#fff}.dark-bg{background:rgba(10,12,18,.85);border:2px solid rgba(255,255,255,.2)}.green-bg{background:#1dbf73;color:#fff}
.tag{position:absolute;left:60px;top:180px;padding:10px 26px;border-radius:14px;background:var(--r);font:700 44px "HS"}
.big-t{position:absolute;left:0;top:960px;width:1080px;text-align:center;font:700 104px/1.1 "HS";text-shadow:0 8px 30px rgba(0,0,0,.6)}
.kick{position:absolute;left:0;top:250px;width:1080px;text-align:center;font:700 54px "HS";color:#cfd6e6}
.row-c{position:absolute;left:0;top:330px;width:1080px;display:flex;align-items:center;justify-content:center;gap:30px}
.slot{width:300px;height:400px;overflow:hidden;position:relative}
.slotcol{position:absolute;left:0;top:0;width:300px}
.dg{display:block;width:300px;height:400px;font:700 400px/400px "HS";color:var(--y);text-align:center;text-shadow:0 0 60px rgba(255,230,0,.45)}
.mega-sub{font:700 92px/1.08 "HS"}
.ring{position:absolute;left:240px;top:220px;width:600px;height:600px;border-radius:50%;box-sizing:border-box}
.red-ring{border:10px solid var(--r)}.green-ring{border:10px solid var(--g)}.gold-ring{border:10px solid var(--y)}
.tape{position:absolute;left:-100px;width:1400px;height:70px;background:repeating-linear-gradient(-45deg,#ffd000 0 40px,#111 40px 80px)}
.t1{top:110px;transform:rotate(-3deg)}.t2{top:860px;transform:rotate(2deg)}
.stage-box{position:absolute;left:0;top:300px;width:1080px;height:600px}
.errcard{position:absolute;left:330px;top:120px;width:300px;height:120px;border-radius:20px;background:var(--r);font:700 54px/120px "HS";text-align:center;box-shadow:0 10px 30px rgba(255,0,0,.4)}
.rug{position:absolute;left:600px;top:250px;width:440px;height:140px;border-radius:50%;background:linear-gradient(#7a3cff,#4b1fae);box-shadow:0 20px 30px rgba(0,0,0,.5);transform-origin:50% 100%}
.chart{position:absolute;left:190px;top:300px;width:700px;height:560px;display:flex;align-items:flex-end;gap:40px;border-bottom:6px solid #fff;border-left:6px solid #fff;padding:0 40px;box-sizing:border-box}
.cbar{display:block;flex:1;background:linear-gradient(#00d4ff,#0077ff);border-radius:12px 12px 0 0;transform-origin:50% 100%}
.stamp{position:absolute;left:150px;top:160px;width:420px;height:170px;border:14px solid var(--r);border-radius:24px;color:var(--r);font:700 130px/150px "HS";text-align:center;transform:rotate(-14deg);box-sizing:border-box;background:rgba(0,0,0,.35)}
.trail{position:absolute;width:22px;height:22px;border-radius:50%;background:var(--y)}
.badge{position:absolute;padding:12px 28px;border-radius:16px;font:700 54px "HS"}
.paper{position:absolute;left:140px;top:200px;width:800px;height:740px;background:#f3efe6;color:#111;border-radius:12px;padding:40px;box-sizing:border-box;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.np-head{font:700 66px "HS";text-align:center}.np-rule{height:6px;background:#111;margin:16px 0 24px}
.np-h{font:700 56px/1.15 "HS";margin-bottom:26px}.np-cols{display:flex;gap:30px}.np-cols>div{flex:1}
.np-l{height:16px;background:#bbb;border-radius:8px;margin:14px 0}
#s4src{top:1000px}
.phone{position:absolute;left:240px;top:170px;width:600px;height:860px;border-radius:60px;background:#10131b;border:10px solid #2a2f3d;box-sizing:border-box;padding:30px}
.phone.small{left:290px;width:500px;height:800px}
.ph-top{font:700 44px "HS";text-align:center;color:#9fe;padding-bottom:20px;border-bottom:2px solid #2a2f3d;margin-bottom:30px}
.bub{display:block;padding:20px 26px;border-radius:30px;font:700 40px/1.3 "HS";margin-bottom:24px;max-width:440px}
.me{background:#1f6feb;margin-left:auto}.ai{background:#2a2f3d;width:180px}
.bub.wide{position:absolute;left:90px;max-width:none;width:900px;box-sizing:border-box;font-size:46px}
.tdot{display:inline-block;width:24px;height:24px;border-radius:50%;background:#ccd;margin-right:14px}
.warn{position:absolute;left:290px;top:180px;width:0;height:0;border-left:250px solid transparent;border-right:250px solid transparent;border-bottom:430px solid var(--y);filter:drop-shadow(0 0 40px rgba(255,230,0,.5))}
.warn-ex{position:absolute;left:-60px;top:90px;width:120px;font:700 300px/300px "HS";color:#111;text-align:center}
.ice-win{position:absolute;left:90px;top:160px;width:900px;height:780px;border-radius:40px;overflow:hidden;border:4px solid rgba(255,255,255,.2)}
.ice-world{position:absolute;left:0;top:0;width:900px;height:1600px}
.sky{position:absolute;left:0;top:0;width:900px;height:520px;background:linear-gradient(#0b1c3a,#1d4f86)}
.sea{position:absolute;left:0;top:520px;width:900px;height:1080px;background:linear-gradient(#0a4d8c,#021428)}
.tip{position:absolute;left:330px;top:330px;width:0;height:0;border-left:120px solid transparent;border-right:120px solid transparent;border-bottom:190px solid #e9f6ff}
.berg{position:absolute;left:90px;top:520px;width:720px;height:900px;background:linear-gradient(#bfe6ff,#5aa7d8);clip-path:polygon(33% 0,67% 0,92% 30%,100% 62%,78% 100%,22% 96%,0 55%,10% 22%);opacity:.85}
.waterline{position:absolute;left:0;top:516px;width:900px;height:8px;background:rgba(255,255,255,.6)}
.numslam{position:absolute;left:390px;top:420px;width:300px;height:300px;border-radius:50%;background:var(--y);color:#000;font:700 230px/300px "HS";text-align:center;box-shadow:0 0 80px rgba(255,230,0,.5)}
.brandname{position:absolute;left:0;top:380px;width:1080px;text-align:center;font:700 260px/1.1 "HS"}
.cyan-g{color:#7ff0ff;text-shadow:0 0 60px rgba(0,212,255,.7)}.purple-g{color:#d6b0ff;text-shadow:0 0 60px rgba(180,107,255,.8)}.gold-g{color:var(--y);text-shadow:0 0 70px rgba(255,200,0,.8)}
.orbit{position:absolute;left:90px;top:330px;width:900px;height:420px;border-radius:50%;border:4px solid rgba(0,212,255,.45);box-sizing:border-box}
.o2{border-color:rgba(255,255,255,.25)}.o3{border-color:rgba(0,212,255,.25);left:190px;width:700px}
.gauge{position:absolute;left:140px;top:360px;width:800px;height:420px}
.g-arc{position:absolute;left:0;top:0;width:800px;height:800px;border-radius:50%;background:conic-gradient(from -90deg,#22e06b 0 45deg,#ffd400 45deg 90deg,#ff8a00 90deg 135deg,#ff2d2d 135deg 180deg,transparent 180deg)}
.g-mask{position:absolute;left:110px;top:110px;width:580px;height:580px;border-radius:50%;background:#0b0e16}
.needle{position:absolute;left:390px;top:80px;width:20px;height:320px;border-radius:10px;background:#fff;transform-origin:50% 100%}
.g-hub{position:absolute;left:360px;top:360px;width:80px;height:80px;border-radius:50%;background:#fff}
.g-lab{position:absolute;font:700 34px "HS";color:#cfd6e6}.l1{left:-20px;top:430px}.l2{left:20px;top:20px}.l3{left:660px;top:20px}.l4{left:690px;top:430px;color:var(--r)}
.crit{left:0;right:0;margin:0 auto;width:fit-content;top:880px;font-size:80px}
.lock-wrap{position:absolute;left:390px;top:180px;width:300px;height:420px}
.shackle{position:absolute;left:55px;top:0;width:190px;height:220px;border:34px solid #c9ced8;border-bottom:none;border-radius:110px 110px 0 0;box-sizing:border-box}
.lockbody{position:absolute;left:0;top:180px;width:300px;height:240px;border-radius:30px;background:linear-gradient(#ffd400,#e09a00)}
.keyhole{position:absolute;left:125px;top:70px;width:50px;height:90px;border-radius:25px;background:#3a2a00}
.people{position:absolute;left:0;top:700px;width:1080px;display:flex;justify-content:center;gap:30px}
.person{position:relative}
.bigbub{position:absolute;left:140px;top:300px;width:800px;padding:60px 40px;box-sizing:border-box;border-radius:60px;background:#2a2f3d;font:700 100px "HS";text-align:center}
.strike-line{position:absolute;left:5%;top:50%;width:90%;height:14px;margin-top:-7px;background:var(--r);display:block;transform-origin:0 50%;border-radius:7px}
.tasks{position:absolute;left:0;top:660px;width:1080px;display:flex;justify-content:center;gap:24px}
.task{display:block;padding:18px 30px;border-radius:20px;background:rgba(57,255,20,.15);border:3px solid var(--g);font:700 48px "HS"}
.lab{position:absolute;font:700 66px "HS"}
.dialog{position:absolute;left:150px;top:300px;width:780px;padding:40px;box-sizing:border-box;border-radius:36px;background:#f4f5f7;color:#111}
.dlg-title{font:700 40px "HS";color:#666}.dlg-body{font:700 66px "HS";margin:14px 0 34px}
.dlg-btns{display:flex;gap:24px;justify-content:flex-end}
.btn{display:block;padding:20px 36px;border-radius:20px;font:700 46px "HS"}.ghost{background:#e2e4e8;color:#333}.ok{background:#1f6feb;color:#fff}
.cursor{position:absolute;right:140px;bottom:10px;width:0;height:0;border-left:26px solid transparent;border-right:26px solid transparent;border-bottom:62px solid #000;transform:rotate(-30deg)}
.cursor.big{right:auto;left:640px;top:640px;bottom:auto;border-bottom-color:#fff}
.rays{position:absolute;left:-210px;top:-260px;width:1500px;height:1500px;border-radius:50%;background:repeating-conic-gradient(rgba(255,200,0,.22) 0 10deg,transparent 10deg 20deg)}
.pdots{display:flex;justify-content:center;gap:22px;margin:10px 0 40px}
.pd{display:block;width:40px;height:40px;border-radius:50%;background:#fff}
.pad{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.pk{height:96px;border-radius:24px;background:#222838;font:700 56px/96px "HS";text-align:center}
.bigx{position:absolute;left:0;top:240px;width:1080px;text-align:center;font:700 560px/1 "HS";color:var(--r);text-shadow:0 0 60px rgba(255,0,0,.6)}
.chip{position:absolute;left:190px;width:700px;padding:30px 0;border-radius:999px;background:rgba(20,24,34,.9);border:4px solid rgba(255,255,255,.25);font:700 76px "HS";text-align:center}
.doc{position:absolute;left:220px;top:260px;width:640px;height:640px;border-radius:30px;background:#f4f5f7;padding:70px 50px;box-sizing:border-box}
.doc-row{display:flex;align-items:center;gap:26px;margin-bottom:56px}
.doc-l{display:block;height:26px;border-radius:13px;background:#c4c9d4}
.tick{display:inline-block;width:70px;height:70px;border-radius:50%;background:#1dbf73;color:#fff;font:700 50px/70px "HS";text-align:center}
.power{position:absolute;left:140px;top:720px;width:800px;height:110px;border-radius:55px;border:6px solid #fff;overflow:hidden;box-sizing:border-box}
.pfill{position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(90deg,#22e06b,#ffd400,#ff2d2d);transform-origin:0 50%}
.plab{position:absolute;left:0;top:0;width:100%;text-align:center;font:700 56px/98px "HS";color:#000;mix-blend-mode:normal}
.cmt{position:absolute;left:90px;top:440px;width:900px;height:150px;display:flex;align-items:center;gap:24px}
.cmt-in{flex:1;height:150px;border-radius:75px;background:#252a35;display:flex;align-items:center;padding-left:50px;font:700 90px "HS"}
.ch{display:inline-block}.caret{display:inline-block;width:6px;height:90px;background:#fff;margin-left:6px}
.send{width:150px;height:150px;border-radius:50%;background:#1f6feb;font-size:70px;line-height:150px;text-align:center;color:#000}
.follow{position:absolute;left:190px;top:500px;width:700px;height:200px;border-radius:100px;background:var(--y);color:#000;font:700 110px/200px "HS";text-align:center;box-shadow:0 0 80px rgba(255,230,0,.5)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="%DUR%">
  <div id="bg"></div>
  <div id="glow"></div>
  <div id="grid"></div>
%PARTS%
  <div id="vig"></div>
%CLIPS%
  <div id="brand">AI খবর ⚡</div>
  <div id="prog"></div>
  <div id="flash"></div>
  <audio id="bed" src="assets/soundbed.wav" data-start="0" data-duration="%DUR%" data-track-index="10" data-volume="1"></audio>
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
%ANIMS%
window.__timelines["main"] = tl;
</script>
</body>
</html>
"""

if __name__ == "__main__":
    build()

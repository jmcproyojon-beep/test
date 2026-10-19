"""Generate the preview composition (index.html) + cue list for the sound bed."""
import json, html, re
from pathlib import Path

ROOT = Path(__file__).parent
HF = ROOT / "hyperframes"

# (start, end, caption chunks, face framing, card id or None, sfx list)
# caption chunk: words separated by spaces, highlight word wrapped in *...*
LINES = [
    (0.0, 3.2, None, "tight", "hook", ["boom"]),
    (3.2, 4.9, ["AI নিজের *ভুল*", "লুকিয়েছে।"], "wide", "inc1", ["pop"]),
    (4.9, 6.4, ["*ভুয়া* ডেটা", "বানিয়েছে।"], "tight", "inc2", ["pop"]),
    (6.4, 8.4, ["কিছু ফাইল", "*ইন্টারনেটে* তুলে দিয়েছে।"], "wide", "inc3", ["pop"]),
    (8.4, 10.2, ["খবরটা দিয়েছে", "*New York Times*।"], "tight", "nyt", ["whoosh"]),
    (10.2, 11.7, ["আপনি *ChatGPT*", "ব্যবহার করেন?"], "wide", None, []),
    (11.7, 13.5, ["তাহলে এটা", "আপনার *জানা* দরকার।"], "tight", None, ["ding"]),
    (13.5, 15.3, ["কিন্তু এটা তো", "কেবল *শুরু*…"], "slowpush", None, ["riser"]),
    (15.3, 17.6, ["এক নম্বর।", "OpenAI-এর নতুন model, *Astra*।"], "wide", "astra", ["bass", "tick"]),
    (17.6, 19.8, ["সাইবার ঝুঁকিতে", "*Critical* লেভেলে।"], "tight", "critical", ["glitch"]),
    (19.8, 21.4, ["তাই সবাই", "এটা *পাচ্ছে না*।"], "wide", "locked", ["ding"]),
    (21.4, 23.6, ["দুই নম্বর।", "Meta এনেছে *Muse*।"], "tight", "muse", ["whoosh", "tick"]),
    (23.6, 24.9, ["এটা শুধু *উত্তর*", "দেয় না।"], "wide", None, []),
    (24.9, 26.3, ["*নিজেই* কাজ", "করে দেয়।"], "tight", None, ["ding"]),
    (26.3, 28.2, ["*ইমেইল* পাঠায়।", "কেনাকাটা করে।"], "wide", "actions", ["pop", "pop2"]),
    (28.2, 30.0, ["তবে আগে আপনার", "*অনুমতি* চায়।"], "tight", "approve", ["click"]),
    (30.0, 31.8, ["এবার সবচেয়ে", "কাজের *পার্ট*…"], "slowpush", None, ["riser"]),
    (31.8, 34.0, ["তিন নম্বর।", "নিজেকে *safe* রাখুন।"], "wide", "shield", ["bass", "tick"]),
    (34.0, 35.9, ["AI-কে bKash", "*PIN* দেবেন না।"], "tight", "pin", ["buzz"]),
    (35.9, 37.6, ["পাসওয়ার্ড, NID —", "*কিছুই* না।"], "wide", "nopass", ["pop"]),
    (37.6, 39.4, ["*Fiverr* ক্লায়েন্টকে", "কিছু পাঠাবেন?"], "tight", None, ["whoosh"]),
    (39.4, 41.4, ["আগে AI-এর তথ্য", "*যাচাই* করুন।"], "wide", "verify", ["ding"]),
    (41.4, 43.0, ["AI অনেক", "*শক্তিশালী*।"], "slowpush", None, ["riser"]),
    (43.0, 45.2, ["কিন্তু চাবি থাকবে", "আপনার *হাতে*।"], "tight", "key", ["flash"]),
    (45.2, 46.8, ["কমেন্টে *\"AI\"*", "লিখুন।"], "wide", "comment", ["key"]),
    (46.8, 49.0, ["ফ্রি AI টুলের লিস্ট", "*পাঠিয়ে* দেবো।"], "tight", "follow", ["pop"]),
]

# Re-time everything to the real voiceover (voice/lines.json from voice_edit.py).
# The take has no CTA, so the last two lines become on-screen text only.
VOICE = json.loads((ROOT / "voice/lines.json").read_text())
SPLITS = {}
_t = VOICE[-1]["end"] + 0.35
for i, row in enumerate(LINES):
    if i < len(VOICE):
        s_, e_ = VOICE[i]["start"], VOICE[i]["end"]
        if VOICE[i]["splits"]:
            SPLITS[i] = VOICE[i]["splits"][0]
    else:
        s_, e_ = _t, _t + (1.8 if i == len(VOICE) else 2.4)
        _t = e_
    LINES[i] = (round(s_, 3), round(e_, 3)) + tuple(row[2:])
# hold each line on screen until the next one starts
for i in range(len(LINES) - 1):
    LINES[i] = (LINES[i][0], LINES[i + 1][0]) + LINES[i][2:]
DURATION = round(LINES[-1][1] + 0.5, 2)
LS = [row[0] for row in LINES]  # line start times

# Section number badges: (start, end, numeral)
NUMBERS = [(LS[8], LS[11], "১"), (LS[11], LS[16], "২"), (LS[17], LS[22], "৩")]


def esc(s):
    return html.escape(s, quote=True)


def caption_html(i, chunks, start, end):
    """Two chunks per line (split at the voice's internal pause when known); words pop in one by one."""
    out, anims = [], []
    n = len(chunks)
    mid = SPLITS.get(i, start + (end - start) / n)
    bounds = [(start, mid), (mid, end)] if n == 2 else [(start, end)]
    for c, chunk in enumerate(chunks):
        cs, ce = bounds[c]
        span = ce - cs
        cid = f"cap{i}_{c}"
        # a *multi word* highlight (plus trailing punctuation) stays one token
        toks = re.findall(r'\*[^*]+\*\S*|\S+', chunk)
        spans = []
        for k, t in enumerate(toks):
            hl = "*" in t
            t = t.replace("*", "")
            spans.append(f'<span id="{cid}_w{k}" class="w{" hl" if hl else ""}">{esc(t)}</span>')
            wt = cs + 0.05 + k * min(0.22, (span - 0.25) / max(1, len(toks)))
            anims.append(f'tl.from("#{cid}_w{k}",{{scale:0.55,opacity:0,y:18,duration:0.16,ease:"back.out(2.6)"}},{wt:.3f});')
        out.append(
            f'<div id="{cid}" class="cap clip" data-start="{cs:.3f}" data-duration="{span:.3f}" data-track-index="6">'
            f'<div class="capline">{"".join(spans)}</div></div>'
        )
    return out, anims


CARDS = {
    "hook": """
      <div class="hook-wrap">
        <div id="hook-card" class="card headline">
          <div class="kicker"><span class="dot red"></span>OpenAI নিজেই জানালো</div>
          <div class="big6"><span id="hook-six">৬</span><span class="big6-t">টা ভয়ংকর<br>AI ঘটনা</span></div>
        </div>
        <div id="hook-emoji" class="emoji">🤯</div>
      </div>""",
    "inc1": "", "inc2": "", "inc3": "",
    "nyt": """
      <div id="nyt-card" class="card source">
        <div class="kicker">সূত্র</div>
        <div class="src-name">The New York Times</div>
        <div class="src-line">OpenAI ৬টি উদ্বেগজনক AI ঘটনার কথা জানিয়েছে</div>
      </div>""",
    "astra": """
      <div id="astra-card" class="card brand">
        <div class="brand-tag">OpenAI</div><div class="brand-name">Astra</div>
        <div class="brand-sub">নতুন frontier model</div>
      </div>""",
    "critical": """
      <div id="crit-card" class="card meter">
        <div class="kicker">সাইবার ঝুঁকির লেভেল</div>
        <div class="bars">
          <div id="bar1" class="bar b1">Low</div><div id="bar2" class="bar b2">Medium</div>
          <div id="bar3" class="bar b3">High</div><div id="bar4" class="bar b4">Critical</div>
        </div>
      </div>""",
    "locked": """
      <div id="lock-card" class="card pill-card"><div class="lock">🔒</div><div>সীমিত অ্যাক্সেস</div></div>""",
    "muse": """
      <div id="muse-card" class="card brand">
        <div class="brand-tag">Meta</div><div class="brand-name">Muse</div>
        <div class="brand-sub">personal AI agent</div>
      </div>""",
    "actions": """
      <div class="chips-row">
        <div id="act1" class="chip">✉️ ইমেইল</div><div id="act2" class="chip">🛒 কেনাকাটা</div>
      </div>""",
    "approve": """
      <div id="dlg" class="card dialog">
        <div class="dlg-title">Muse জানতে চায়</div>
        <div class="dlg-body">এই ইমেইলটা পাঠাবো?</div>
        <div class="dlg-btns"><div class="btn ghost">বাতিল</div><div id="dlg-ok" class="btn ok">অনুমতি দিন</div></div>
        <div id="cursor" class="cursor"></div>
      </div>""",
    "shield": """
      <div id="shield-card" class="card pill-card green"><div class="lock">🛡️</div><div>নিজেকে safe রাখুন</div></div>""",
    "pin": """
      <div id="pin-card" class="card pin">
        <div class="kicker">PIN</div>
        <div class="pin-dots"><span></span><span></span><span></span><span></span><span></span></div>
        <div id="pin-x" class="big-x">✕</div>
      </div>""",
    "nopass": """
      <div class="chips-row">
        <div id="np1" class="chip strike">পাসওয়ার্ড<i id="np1s"></i></div><div id="np2" class="chip strike">NID<i id="np2s"></i></div>
      </div>""",
    "verify": """
      <div id="verify-card" class="card check">
        <div id="chk1" class="chk-row"><span class="tick">✓</span>তথ্য যাচাই</div>
        <div id="chk2" class="chk-row"><span class="tick">✓</span>সূত্র দেখুন</div>
        <div id="chk3" class="chk-row"><span class="tick">✓</span>তারপর পাঠান</div>
      </div>""",
    "key": """
      <div id="key-card" class="card pill-card yellow"><div class="lock">🔑</div><div>চাবি আপনার হাতে</div></div>""",
    "comment": """
      <div id="cmt" class="card comment">
        <div class="cmt-avatar"></div>
        <div class="cmt-box"><span id="cmt-t1" class="cmt-ch">A</span><span id="cmt-t2" class="cmt-ch">I</span><span id="caret" class="caret"></span></div>
        <div id="cmt-send" class="cmt-send">➤</div>
      </div>""",
    "follow": """
      <div id="follow" class="card pill-card follow"><div>ফলো করুন</div><div class="sub">প্রতি সপ্তাহে AI-এর আসল খবর ⚡</div></div>""",
}

CARD_ANIM = {
    "hook": lambda s: [
        f'tl.from("#hook-card",{{scale:1.6,opacity:0,rotation:-4,duration:0.28,ease:"power4.out"}},{s});',
        f'tl.from("#hook-six",{{scale:2.4,duration:0.5,ease:"back.out(3)"}},{s+0.12});',
        f'tl.fromTo("#hook-card",{{x:-8}},{{x:8,duration:0.05,repeat:5,yoyo:true,ease:"none"}},{s+0.28});',
        f'tl.from("#hook-emoji",{{scale:0,rotation:-40,duration:0.35,ease:"back.out(3)"}},{s+1.6});',
    ],
    "nyt": lambda s: [f'tl.from("#nyt-card",{{x:900,rotation:6,duration:0.35,ease:"power3.out"}},{s});',
                      f'tl.from("#nyt-card .src-line",{{opacity:0,y:20,duration:0.3}},{s+0.35});'],
    "astra": lambda s: [f'tl.from("#astra-card",{{scale:0.4,opacity:0,duration:0.4,ease:"back.out(2.2)"}},{s+0.5});'],
    "critical": lambda s: [
        f'tl.from("#bar1",{{scaleY:0,duration:0.15}},{s+0.1});', f'tl.from("#bar2",{{scaleY:0,duration:0.15}},{s+0.25});',
        f'tl.from("#bar3",{{scaleY:0,duration:0.15}},{s+0.4});', f'tl.from("#bar4",{{scaleY:0,duration:0.2}},{s+0.55});',
        f'tl.to("#bar4",{{backgroundColor:"#ff2d2d",color:"#fff",scale:1.12,duration:0.12,repeat:5,yoyo:true}},{s+0.8});',
        f'tl.fromTo("#crit-card",{{x:-10,skewX:8}},{{x:0,skewX:0,duration:0.06,repeat:3,yoyo:true}},{s+0.8});',
    ],
    "locked": lambda s: [f'tl.from("#lock-card",{{y:120,opacity:0,duration:0.3,ease:"power3.out"}},{s});'],
    "muse": lambda s: [f'tl.from("#muse-card",{{x:-900,rotation:-6,duration:0.35,ease:"power3.out"}},{s+0.4});'],
    "actions": lambda s: [f'tl.from("#act1",{{scale:0,duration:0.3,ease:"back.out(3)"}},{s+0.05});',
                          f'tl.from("#act2",{{scale:0,duration:0.3,ease:"back.out(3)"}},{s+0.9});'],
    "approve": lambda s: [
        f'tl.from("#dlg",{{scale:0.7,opacity:0,duration:0.3,ease:"back.out(2)"}},{s});',
        f'tl.from("#cursor",{{x:260,y:220,opacity:0,duration:0.6,ease:"power2.inOut"}},{s+0.4});',
        f'tl.to("#dlg-ok",{{scale:0.9,duration:0.08,yoyo:true,repeat:1}},{s+1.05});',
        f'tl.to("#dlg-ok",{{backgroundColor:"#39FF14",color:"#000",duration:0.1}},{s+1.1});',
    ],
    "shield": lambda s: [f'tl.from("#shield-card",{{scale:0.3,opacity:0,duration:0.35,ease:"back.out(2.4)"}},{s+0.5});'],
    "pin": lambda s: [f'tl.from("#pin-card",{{y:200,opacity:0,duration:0.3,ease:"power3.out"}},{s});',
                      f'tl.from("#pin-x",{{scale:3,opacity:0,duration:0.25,ease:"power4.in"}},{s+0.9});'],
    "nopass": lambda s: [f'tl.from("#np1",{{scale:0,duration:0.25,ease:"back.out(3)"}},{s});',
                         f'tl.from("#np2",{{scale:0,duration:0.25,ease:"back.out(3)"}},{s+0.4});',
                         f'tl.from("#np1s",{{scaleX:0,duration:0.2}},{s+0.9});',
                         f'tl.from("#np2s",{{scaleX:0,duration:0.2}},{s+1.1});'],
    "verify": lambda s: [f'tl.from("#chk{k}",{{x:-80,opacity:0,duration:0.25}},{s+0.1+k*0.45});' for k in (1, 2, 3)],
    "key": lambda s: [f'tl.from("#key-card",{{scale:0.2,rotation:-20,opacity:0,duration:0.4,ease:"back.out(2.6)"}},{s+0.1});'],
    "comment": lambda s: [f'tl.from("#cmt",{{y:200,opacity:0,duration:0.3,ease:"power3.out"}},{s});',
                          f'tl.from("#cmt-t1",{{opacity:0,duration:0.01}},{s+0.5});',
                          f'tl.from("#cmt-t2",{{opacity:0,duration:0.01}},{s+0.7});',
                          f'tl.to("#cmt-send",{{scale:1.3,backgroundColor:"#FFE600",duration:0.15,yoyo:true,repeat:1}},{s+1.1});'],
    "follow": lambda s: [f'tl.from("#follow",{{scale:0.4,opacity:0,duration:0.4,ease:"back.out(2.4)"}},{s+0.1});'],
}


def build():
    clips, anims, cues = [], [], []
    # incidents list spans 3.2 -> 8.4
    clips.append(f"""<div id="inc" class="clip cardslot" data-start="{LS[1]}" data-duration="{LS[4]-LS[1]:.3f}" data-track-index="5">
      <div class="card list">
        <div id="inc1" class="row"><span class="x">✕</span>ভুল লুকিয়েছে</div>
        <div id="inc2" class="row"><span class="x">✕</span>ভুয়া ডেটা বানিয়েছে</div>
        <div id="inc3" class="row"><span class="x">✕</span>ফাইল ইন্টারনেটে</div>
      </div></div>""")
    for k, t in ((1, LS[1]), (2, LS[2]), (3, LS[3])):
        anims.append(f'tl.from("#inc{k}",{{x:-120,opacity:0,duration:0.25,ease:"power3.out"}},{t+0.05});')

    face_moves = []
    for i, (s, e, chunks, framing, card, sfx) in enumerate(LINES):
        if chunks:
            c, a = caption_html(i, chunks, s, e)
            clips += c; anims += a
        if card and CARDS.get(card):
            clips.append(f'<div id="slot_{card}" class="clip cardslot" data-start="{s}" data-duration="{e-s:.2f}" data-track-index="5">{CARDS[card]}</div>')
            anims += CARD_ANIM[card](s)
        face_moves.append((s, e, framing))
        for x in sfx:
            cues.append({"t": s, "end": e, "sfx": x})

    # face framing: hard cuts between wide / tight, slow push on re-hooks
    for s, e, fr in face_moves:
        if fr == "tight":
            anims.append(f'tl.set("#face",{{scale:1.16,x:0,y:40}},{s});')
            anims.append(f'tl.to("#face",{{scale:1.2,duration:{e-s:.2f},ease:"none"}},{s});')
        elif fr == "wide":
            anims.append(f'tl.set("#face",{{scale:1.0,x:0,y:0}},{s});')
            anims.append(f'tl.to("#face",{{scale:1.04,duration:{e-s:.2f},ease:"none"}},{s});')
        else:
            anims.append(f'tl.set("#face",{{scale:1.0,x:0,y:0}},{s});')
            anims.append(f'tl.to("#face",{{scale:1.14,y:30,duration:{e-s:.2f},ease:"power1.in"}},{s});')
            anims.append(f'tl.to("#dim",{{opacity:0.45,duration:{e-s:.2f}}},{s});')
            anims.append(f'tl.set("#dim",{{opacity:0}},{e});')

    # topic-change zoom-blur / white flash transitions
    for t in (LS[8], LS[11], LS[17]):
        anims.append(f'tl.to("#flash",{{opacity:0.9,duration:0.06,yoyo:true,repeat:1}},{t-0.06});')
    anims.append(f'tl.to("#flash",{{opacity:1,duration:0.05,yoyo:true,repeat:1}},{LS[23]-0.05:.3f});')
    for t in (LS[4], LS[20]):
        anims.append(f'tl.to("#face",{{filter:"blur(14px)",duration:0.08,yoyo:true,repeat:1}},{t-0.04:.3f});')
    # glitch #2 on hook
    anims.append('tl.fromTo("#stage",{x:-14},{x:0,duration:0.05,repeat:3,yoyo:true},0.05);')

    # number badges
    for k, (s, e, num) in enumerate(NUMBERS):
        clips.append(f'<div id="num{k}" class="clip numslot" data-start="{s}" data-duration="{e-s:.2f}" data-track-index="7"><div id="numb{k}" class="numbadge">{num}</div></div>')
        anims.append(f'tl.fromTo("#numb{k}",{{scale:3.2,x:330,y:300}},{{scale:1,x:0,y:0,duration:0.45,ease:"back.out(1.6)"}},{s});')

    # progress bar
    anims.append(f'tl.fromTo("#prog",{{scaleX:0}},{{scaleX:1,duration:{DURATION},ease:"none"}},0);')

    page = TEMPLATE.replace("%CLIPS%", "\n".join(clips)).replace("%ANIMS%", "\n".join(anims)).replace("%DUR%", str(DURATION))
    (HF / "index.html").write_text(page, encoding="utf-8")
    (ROOT / "cues.json").write_text(json.dumps({"duration": DURATION, "cues": cues, "drop_t": LS[23], "tense": [LS[7], LS[17]]}, indent=1))
    def ts(x):
        return f"{int(x//3600):02d}:{int(x%3600//60):02d}:{int(x%60):02d},{int(round((x%1)*1000)):03d}"
    srt, guide = [], ["# রেকর্ডিং টাইমিং গাইড", "", "প্রতিটা লাইন নিচের সময়ের মধ্যে বলুন।", ""]
    full = {0: "OpenAI নিজেই স্বীকার করলো — ৬টা ভয়ংকর AI ঘটনা।"}
    for i, (s_, e_, chunks, *_r) in enumerate(LINES):
        text = full.get(i) or " ".join(chunks).replace("*", "")
        srt.append(f"{i+1}\n{ts(s_)} --> {ts(e_)}\n{text}\n")
        guide.append(f"{i+1}. `{s_:.1f}s – {e_:.1f}s` ({e_-s_:.1f}s) — {text}")
    (ROOT / "renders").mkdir(exist_ok=True)
    (ROOT / "renders/script_timing.srt").write_text("\n".join(srt), encoding="utf-8")
    (ROOT / "renders/recording_guide.md").write_text("\n".join(guide) + "\n", encoding="utf-8")
    print("clips", len(clips), "anims", len(anims), "cues", len(cues))


TEMPLATE = r"""<!doctype html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>AI Incidents Reel Preview</title>
<script src="assets/gsap.min.js"></script>
<style>
@font-face{font-family:"HS";font-weight:700;src:url(assets/hind-siliguri-bengali-700-normal.woff2) format("woff2");unicode-range:U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1;}
@font-face{font-family:"HS";font-weight:700;src:url(assets/hind-siliguri-latin-700-normal.woff2) format("woff2");}
@font-face{font-family:"HS";font-weight:500;src:url(assets/hind-siliguri-bengali-500-normal.woff2) format("woff2");unicode-range:U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1;}
@font-face{font-family:"Noto Color Emoji";src:local("Noto Color Emoji");}
@font-face{font-family:"HS";font-weight:500;src:url(assets/hind-siliguri-latin-500-normal.woff2) format("woff2");}
:root{--y:#FFE600;--g:#39FF14;--r:#FF3B3B;--ink:#0b0d12}
body{margin:0;background:#000;font-family:"HS","Noto Color Emoji",sans-serif;color:#fff}
#root{position:relative;width:1080px;height:1920px;overflow:hidden}
.full{position:absolute;inset:0}
#bgfill{background:radial-gradient(ellipse 900px 520px at 50% 1320px,rgba(255,230,0,.10),rgba(255,230,0,0) 70%),repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 2px,transparent 2px 60px),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 2px,transparent 2px 60px),linear-gradient(#0b0d12,#07080b)}
#stage{position:absolute;inset:0}
#facewrap{position:absolute;left:0;top:0;width:1080px;height:1080px;overflow:hidden}
#face{position:absolute;inset:0;filter:blur(0px);width:1080px;height:1080px;background:url(assets/face_sq.jpg) center/cover no-repeat;transform-origin:50% 34%}
#facefade{position:absolute;left:0;right:0;top:820px;height:262px;background:linear-gradient(to bottom,rgba(11,13,18,0),rgba(11,13,18,.92))}
#dim{position:absolute;left:0;top:0;width:1080px;height:1920px;background:#000;opacity:0}
#flash{position:absolute;left:0;top:0;width:1080px;height:1920px;background:#fff;opacity:0}
#prog{position:absolute;left:0;top:0;width:1080px;height:10px;background:var(--y);transform-origin:0 50%}
#label{position:absolute;left:36px;top:34px;padding:8px 16px;border-radius:10px;background:rgba(0,0,0,.55);font:500 24px "HS";color:#ddd;letter-spacing:.3px}
.cap{position:absolute;left:0;top:1150px;width:1080px;height:330px;display:flex;align-items:center;justify-content:center}
.capline{max-width:900px;text-align:center;font:700 92px/1.18 "HS";
  text-shadow:0 0 1px #000,0 6px 0 #000,0 -3px 0 #000,4px 0 0 #000,-4px 0 0 #000,4px 4px 0 #000,-4px 4px 0 #000,4px -3px 0 #000,-4px -3px 0 #000,0 10px 24px rgba(0,0,0,.7)}
.w{display:inline-block;margin:0 12px}
.hl{color:var(--y)}
.cardslot{position:absolute;left:0;top:0;width:1080px;height:1080px}
.card{position:absolute;left:50%;top:640px;width:820px;margin-left:-410px;box-sizing:border-box;padding:30px 40px;border-radius:30px;
  background:rgba(14,16,22,.88);border:3px solid rgba(255,255,255,.14);box-shadow:0 24px 60px rgba(0,0,0,.55)}
.kicker{font:700 34px "HS";color:#bbb;display:flex;align-items:center;gap:14px}
.dot{width:20px;height:20px;border-radius:50%;display:block}.red{background:var(--r)}
.hook-wrap{position:absolute;inset:0}
.headline{top:560px;border-color:var(--r);border-width:5px}
.big6{display:flex;align-items:center;gap:26px;margin-top:6px}
#hook-six{display:block;font:700 260px/1 "HS";color:var(--y)}
.big6-t{font:700 82px/1.1 "HS"}
.emoji{position:absolute;right:70px;top:470px;width:150px;height:150px;font-size:130px;line-height:150px;text-align:center}
.list .row{display:block;font:700 62px/1.5 "HS"}
.x{display:inline-block;width:70px;color:var(--r)}
.source .src-name{font:700 66px "HS";margin-top:6px}
.source .src-line{font:500 44px/1.3 "HS";color:#ddd;margin-top:10px}
.brand{text-align:center;width:620px;margin-left:-310px}
.brand-tag{font:700 44px "HS";color:#bbb}.brand-name{font:700 150px/1.05 "HS";color:var(--y)}.brand-sub{font:500 40px "HS";color:#ddd}
.bars{display:flex;gap:14px;align-items:flex-end;height:230px;margin-top:20px}
.bar{flex:1;border-radius:14px;background:#2a2f3a;color:#999;font:700 30px "HS";display:flex;align-items:flex-end;justify-content:center;padding-bottom:12px;box-sizing:border-box;transform-origin:50% 100%}
.b1{height:70px}.b2{height:120px}.b3{height:170px}.b4{height:230px;background:#5a1515;color:#fff}
.pill-card{display:flex;align-items:center;justify-content:center;gap:24px;font:700 64px "HS";width:760px;margin-left:-380px}
.pill-card .lock{font-size:80px}
.green{border-color:var(--g)}.yellow{border-color:var(--y);color:var(--y)}
.follow{flex-direction:column;gap:6px;background:var(--y);color:#000;border:none}.follow .sub{font:700 38px "HS"}
.chips-row{position:absolute;left:0;top:700px;width:1080px;display:flex;justify-content:center;gap:30px}
.chip{position:relative;display:block;padding:22px 40px;border-radius:999px;background:rgba(14,16,22,.9);border:3px solid rgba(255,255,255,.2);font:700 60px "HS"}
.strike i{position:absolute;left:24px;right:24px;top:50%;height:8px;margin-top:-4px;background:var(--r);display:block;transform-origin:0 50%}
.dialog{width:720px;margin-left:-360px;background:#f4f5f7;color:#111;border:none}
.dlg-title{font:700 34px "HS";color:#666}.dlg-body{font:700 56px "HS";margin:10px 0 26px}
.dlg-btns{display:flex;gap:20px;justify-content:flex-end}
.btn{display:block;padding:16px 30px;border-radius:16px;font:700 40px "HS"}
.ghost{background:#e2e4e8;color:#333}.ok{background:#1f6feb;color:#fff}
.cursor{position:absolute;right:120px;bottom:20px;width:0;height:0;border-left:22px solid transparent;border-right:22px solid transparent;border-bottom:52px solid #000;transform:rotate(-30deg)}
.pin{text-align:center;width:620px;margin-left:-310px}
.pin-dots{display:flex;gap:26px;justify-content:center;margin:20px 0}
.pin-dots span{display:block;width:44px;height:44px;border-radius:50%;background:#fff}
.big-x{position:absolute;left:0;right:0;top:-20px;font:700 300px/1 "HS";color:var(--r);text-align:center}
.check .chk-row{display:block;font:700 58px/1.5 "HS"}
.tick{display:inline-block;width:76px;color:var(--g)}
.comment{display:flex;align-items:center;gap:22px;width:860px;margin-left:-430px}
.cmt-avatar{width:80px;height:80px;border-radius:50%;background:url(assets/face_sq.jpg) center 30%/180% no-repeat;flex:none}
.cmt-box{flex:1;height:90px;border-radius:45px;background:#252a35;display:flex;align-items:center;padding-left:34px;font:700 54px "HS"}
.cmt-ch{display:inline-block}
.caret{display:inline-block;width:4px;height:56px;background:#fff;margin-left:4px}
.cmt-send{width:90px;height:90px;border-radius:50%;background:#1f6feb;display:flex;align-items:center;justify-content:center;font-size:44px;color:#000}
.numslot{position:absolute;left:0;top:0;width:1080px;height:1080px}
.numbadge{position:absolute;left:40px;top:100px;width:150px;height:150px;border-radius:50%;background:var(--y);color:#000;
  font:700 110px/150px "HS";text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.5)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="%DUR%">
  <div id="bgfill" class="full"></div>
  <div id="stage">
    <div id="facewrap"><div id="face"></div><div id="facefade"></div></div>
  </div>
  <div id="dim"></div>
%CLIPS%
  <div id="label">AI-generated image</div>
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

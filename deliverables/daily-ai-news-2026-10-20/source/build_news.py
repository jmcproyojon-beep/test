"""Daily AI News — 20 Oct 2026. 1080x1920 animated newsroom explainer (HyperFrames + GSAP). All visuals are code-drawn graphics."""
import html, json, re

P = "/home/user/test/projects/daily-ai-news-2026-10-20"
T = json.load(open(f"{P}/artifacts/timing.json"))
DUR = T["video_duration"]
SC = {s["id"]: s for s in T["scenes"]}
LN = {}
for L in T["lines"]:
    LN.setdefault(L["scene"], []).append(L)
e = html.escape
clips, js = [], []


def at(sc, frac=0.0, off=0.0):
    a = LN[sc][0]["start"]; b = LN[sc][-1]["end"]
    return round(a + (b - a) * frac + off, 3)


def scene(sid, inner, tag, onscreen):
    s = SC[sid]
    clips.append(f'<div id="{sid}" class="clip scene" data-start="{s["start"]:.3f}" data-duration="{s["end"] - s["start"]:.3f}" data-track-index="{3 + int(sid[-1]) % 2}">'
                 f'<div class="tag" id="{sid}-tag">{tag}</div>{inner}<div class="ost" id="{sid}-ost">{onscreen}</div></div>')
    js.append(f'tl.from("#{sid}",{{opacity:0,duration:.35}},{s["start"]:.3f});')
    js.append(f'tl.to("#{sid}",{{opacity:0,duration:.3}},{s["end"] - .3:.3f});')
    js.append(f'tl.from("#{sid}-tag",{{x:-60,opacity:0,duration:.45,ease:"power3.out"}},{s["start"] + .15:.3f});')
    js.append(f'tl.from("#{sid}-ost",{{y:40,opacity:0,duration:.5,ease:"power3.out"}},{s["start"] + .35:.3f});')
    js.append(f'tl.fromTo("#{sid} .cam",{{scale:1}},{{scale:1.06,duration:{s["end"] - s["start"]:.2f},ease:"none"}},{s["start"]:.3f});')


def rev(sel, t, frm="y:40,opacity:0", d=.55, ease="power3.out"):
    js.append(f'tl.from("{sel}",{{{frm},duration:{d},ease:"{ease}"}},{t:.3f});')


GLOBE = ('<svg class="globe" viewBox="-200 -200 400 400"><defs><radialGradient id="gg" cx="35%" cy="30%"><stop offset="0" stop-color="#22d3ee" stop-opacity=".35"/><stop offset="1" stop-color="#1e1b4b" stop-opacity=".1"/></radialGradient></defs>'
         '<circle r="180" fill="url(#gg)" stroke="#22d3ee" stroke-opacity=".6" stroke-width="2"/>'
         + "".join(f'<ellipse class="mer" rx="{180 * abs(__import__("math").cos(k * 0.3927)):.1f}" ry="180" fill="none" stroke="#38bdf8" stroke-opacity=".45" stroke-width="1.5"/>' for k in range(8))
         + "".join(f'<ellipse rx="{(180 ** 2 - y * y) ** .5:.1f}" ry="{abs((180 ** 2 - y * y) ** .5) * .18:.1f}" cy="{y}" fill="none" stroke="#a855f7" stroke-opacity=".4" stroke-width="1.2"/>' for y in (-120, -60, 0, 60, 120))
         + '<circle class="ping" cx="70" cy="-40" r="7" fill="#f472b6"/><circle class="ping" cx="-60" cy="30" r="7" fill="#22d3ee"/><circle class="ping" cx="20" cy="90" r="7" fill="#facc15"/></svg>')
CHIP = ('<div class="chipwrap"><div class="chip3d"><div class="core">AI</div>' + "".join(f'<i class="pin p{s}{k}"></i>' for s in "tblr" for k in range(6)) + '</div>'
        + "".join(f'<i class="trace t{k}"></i>' for k in range(8)) + '</div>')

# 01 hook
scene("s01", f'<div class="cam"><div class="newsroom"><div class="grid3d"></div></div>{CHIP}<div class="g1">{GLOBE}</div>'
             '<div class="breaking"><span>BREAKING</span><b>আজকের AI খবর · ২০ অক্টোবর ২০২৬</b></div></div>',
      "DAILY AI NEWS", '<span class="o">NEW AI MODEL</span><i>•</i><span class="o">FREE AI</span><i>•</i><span class="o">SECURITY</span>')
s = SC["s01"]
js.append(f'tl.fromTo("#s01 .cam",{{scale:1.25}},{{scale:1,duration:2.2,ease:"power3.out"}},{s["start"]:.3f});')
rev("#s01 .breaking", s["start"] + .5, "x:-200,opacity:0", .5)
js.append(f'tl.from("#s01 .ost .o",{{scale:.6,opacity:0,stagger:.6,duration:.4,ease:"back.out(2)"}},{at("s01", .1):.3f});')

# 02 MiniMax
code = ["agent.plan(task)", "for step in plan:", "    tool = pick(step)", "    result = run(tool)", "    check(result)", "return report"]
scene("s02", '<div class="cam"><div class="brand2"><div class="wm">MiniMax</div><div class="mdl">M3.1 <b>Flash</b></div><div class="rel">RELEASED · ১৯ অক্টোবর ২০২৬</div></div>'
             '<div class="panel code" id="s02code"><div class="ph"><i></i><i></i><i></i><span>coding dashboard · প্রতীকী</span></div>' + "".join(f'<div class="cl" id="s02l{k}"><em>{k + 1}</em>{e(c)}</div>' for k, c in enumerate(code)) + '</div>'
             '<div class="flow" id="s02flow">' + "".join(f'<div class="fn" id="s02f{k}">{t}</div>' + ('<i class="fa"></i>' if k < 3 else '') for k, t in enumerate(["Plan", "Code", "Computer Use", "Check"])) + '</div>'
             '<div class="panel claim" id="s02claim"><div class="cc">COMPANY CLAIMS · কোম্পানির দাবি</div>'
             '<div class="cr"><span>এজেন্ট কাজের খরচ</span><div class="bar"><i class="b1"></i><em>আগের মডেল</em></div><div class="bar"><i class="b2"></i><em>M3.1 Flash · ৭০% পর্যন্ত কম</em></div></div>'
             '<div class="cr"><span>গতি</span><div class="sp"><b>আগের চেয়ে দ্রুত</b> — স্বাধীনভাবে যাচাই হয়নি</div></div></div></div>',
      "NEW MODEL", 'MINIMAX M3.1 FLASH <i>|</i> <span class="g">RELEASED</span>')
s = SC["s02"]
rev("#s02 .wm", s["start"] + .3, "y:60,opacity:0,scale:1.15", .7)
rev("#s02 .mdl", s["start"] + .6, "scale:.7,opacity:0", .5, "back.out(2)")
rev("#s02 .rel", s["start"] + .9, "x:-40,opacity:0")
rev("#s02code", at("s02", .25), "y:60,opacity:0")
js.append(f'tl.from("#s02code .cl",{{x:-20,opacity:0,stagger:.25,duration:.25}},{at("s02", .3):.3f});')
js.append(f'tl.to("#s02code",{{opacity:0,y:-30,duration:.35}},{at("s02", .5):.3f});')
rev("#s02flow", at("s02", .5), "y:40,opacity:0")
js.append(f'tl.from("#s02flow .fn",{{scale:.6,opacity:0,stagger:.3,duration:.35,ease:"back.out(2)"}},{at("s02", .52):.3f});')
rev("#s02claim", at("s02", .62), "y:60,opacity:0")
js.append(f'tl.fromTo("#s02claim .b1",{{scaleX:0}},{{scaleX:1,duration:.6,immediateRender:false}},{at("s02", .68):.3f});')
js.append(f'tl.fromTo("#s02claim .b2",{{scaleX:0}},{{scaleX:.3,duration:.6,immediateRender:false}},{at("s02", .76):.3f});')

# 03 OpenRouter (illustrative, not a screen recording)
scene("s03", '<div class="cam"><div class="panel orui" id="s03ui"><div class="ill">প্রতীকী চিত্র · আসল OpenRouter স্ক্রিন নয়</div>'
             '<div class="srch"><span>⌕</span>minimax m3.1 flash</div>'
             '<div class="mrow on" id="s03m1"><div><b>MiniMax M3.1 Flash (free)</b><em>minimax/minimax-m3.1-flash:free</em></div><span class="free">FREE</span></div>'
             '<div class="mrow" id="s03m2"><div><b>MiniMax M3.1 Flash</b><em>minimax/minimax-m3.1-flash</em></div><span class="paid">$0.15 / 1M input</span></div>'
             '<div class="pbox" id="s03p"><div class="pl">নমুনা প্রম্পট</div><div class="pt">একটি To-Do অ্যাপের Python কোড লিখে দাও</div></div>'
             '<div class="lims" id="s03l"><span>⏳ সীমিত সময়ের জন্য ফ্রি</span><span>⚠ Rate limit প্রযোজ্য</span></div>'
             '<div class="uses">' + "".join(f'<span id="s03u{k}">{t}</span>' for k, t in enumerate(["Coding", "Research", "AI Prototype"])) + '</div></div></div>',
      "FREE AI", '<span class="g">FREE AI AVAILABLE</span> <i>|</i> RATE LIMITS APPLY')
s = SC["s03"]
rev("#s03ui", s["start"] + .2, "y:80,opacity:0", .6)
rev("#s03m1", at("s03", .1), "x:-40,opacity:0"); rev("#s03m2", at("s03", .2), "x:-40,opacity:0")
js.append(f'tl.to("#s03m1",{{boxShadow:"0 0 0 4px #22d3ee, 0 0 40px rgba(34,211,238,.45)",duration:.4}},{at("s03", .3):.3f});')
rev("#s03p", at("s03", .45), "y:30,opacity:0"); rev("#s03l", at("s03", .35), "scale:.8,opacity:0", .4, "back.out(2)")
js.append(f'tl.from("#s03ui .uses span",{{y:20,opacity:0,stagger:.35,duration:.35}},{at("s03", .62):.3f});')

# 04 local language AI
langs = ["Bahasa Indonesia", "Jawa", "Sunda", "Bali", "Batak"]
dots = "".join(f'<i style="left:{x}px;top:{y}px"></i>' for x, y in [(80 + 46 * i, 60 + 40 * j) for i in range(18) for j in range(9)] if (x - 400) ** 2 / 3 + (y - 230) ** 2 * 2 < 120000)
scene("s04", '<div class="cam"><div class="map" id="s04map"><div class="dots">' + dots + '</div>'
             '<div class="pinm id" style="left:610px;top:330px"><i></i><b>ইন্দোনেশিয়া</b></div><div class="pinm bd" style="left:300px;top:120px"><i></i><b>বাংলাদেশ</b></div>'
             '<div class="mapnote">মানচিত্র প্রতীকী, স্কেল অনুযায়ী নয়</div></div>'
             '<div class="langs" id="s04lg">' + "".join(f'<span id="s04g{k}">{t}</span>' for k, t in enumerate(langs)) + '</div>'
             '<div class="panel repo" id="s04repo"><div class="rh">GoTo · Open AI model</div><div class="rb">৫টি ইন্দোনেশীয় ভাষা · ওপেন সোর্স</div></div>'
             '<div class="panel bdf" id="s04bd"><b>বাংলাদেশেও সম্ভব?</b><span>বাংলা ও আঞ্চলিক ভাষার AI — ভবিষ্যৎ সম্ভাবনা</span></div></div>',
      "LOCAL AI", 'NEW <span class="g">LOCAL LANGUAGE</span> AI MODEL')
s = SC["s04"]
rev("#s04map", s["start"] + .2, "scale:.9,opacity:0", .6)
js.append(f'tl.from("#s04map .dots i",{{opacity:0,duration:.3,stagger:{{each:.004,from:"random"}}}},{s["start"] + .3:.3f});')
js.append(f'tl.from("#s04map .pinm.id",{{y:-40,opacity:0,duration:.45,ease:"bounce.out"}},{at("s04", .05):.3f});')
js.append(f'tl.from("#s04lg span",{{x:60,opacity:0,stagger:.3,duration:.35}},{at("s04", .15):.3f});')
rev("#s04repo", at("s04", .35), "y:40,opacity:0")
js.append(f'tl.from("#s04map .pinm.bd",{{y:-40,opacity:0,duration:.45,ease:"bounce.out"}},{at("s04", .62):.3f});')
rev("#s04bd", at("s04", .66), "y:40,opacity:0")

# 05 Firecrawl x Google Cloud
scene("s05", '<div class="cam"><div class="wf5">'
             '<div class="panel w5" id="s05a"><b>🌐 ওয়েবসাইট</b><div class="pg"><i></i><i></i><i class="s"></i><i></i></div></div><i class="arr5"></i>'
             '<div class="panel w5 fc" id="s05b"><b>🔥 Firecrawl</b><span>scrape · crawl · search</span></div><i class="arr5"></i>'
             '<div class="panel w5" id="s05c"><b>{ } স্ট্রাকচার্ড ডেটা</b><div class="js">"title": "…"<br/>"price": "…"<br/>"updated": "আজ"</div></div><i class="arr5"></i>'
             '<div class="panel w5 gm" id="s05d"><b>✦ Gemini AI Agent</b><span>হালনাগাদ তথ্য দিয়ে উত্তর</span></div></div>'
             '<div class="gcb" id="s05g">Google Cloud Marketplace · Gemini · ADK</div></div>',
      "INTEGRATION", 'FIRECRAWL <span class="g">×</span> GOOGLE CLOUD')
for k, c in enumerate("abcd"):
    rev(f"#s05{c}", at("s05", .02 + k * .2), "x:-60,opacity:0", .45)
js.append(f'tl.from("#s05 .arr5",{{scaleY:0,transformOrigin:"50% 0",stagger:.2 * {(SC["s05"]["end"] - SC["s05"]["start"]) / 4:.2f},duration:.3}},{at("s05", .15):.3f});')
rev("#s05g", at("s05", .85), "y:20,opacity:0")

# 06 Security
scene("s06", '<div class="cam"><div class="panel dash" id="s06d"><div class="dh"><span class="dot"></span>US FEDERAL CIVILIAN SYSTEMS · ACCESS CONTROL</div>'
             '<div class="arow"><span>অনুমোদিত AI টুল</span><b class="ok">ALLOWED</b></div>'
             '<div class="arow hi" id="s06r"><span>DeepSeek ও এর প্রযুক্তি</span><b class="no">RESTRICTED</b></div>'
             '<div class="arow"><span>সাধারণ ব্যবহারকারী / বিশ্বব্যাপী</span><b class="na">নিষেধাজ্ঞা নয়</b></div></div>'
             '<div class="shield" id="s06s"><svg viewBox="0 0 120 140"><path d="M60 6 110 26v40c0 34-22 58-50 68C32 124 10 100 10 66V26z" fill="rgba(34,211,238,.12)" stroke="#22d3ee" stroke-width="5"/><path d="m38 70 15 15 30-32" fill="none" stroke="#22d3ee" stroke-width="8" stroke-linecap="round"/></svg></div>'
             '<div class="panel tip6" id="s06t">🔐 AI ব্যবহারে ডেটা নিরাপত্তা গুরুত্বপূর্ণ — গোপন তথ্য দেবেন না</div></div>',
      "SECURITY", 'AI SECURITY UPDATE <i>|</i> <span class="g">US FEDERAL SYSTEMS</span>')
rev("#s06d", SC["s06"]["start"] + .2, "y:60,opacity:0", .55)
js.append(f'tl.to("#s06r",{{backgroundColor:"rgba(244,114,182,.18)",duration:.4,yoyo:true,repeat:3}},{at("s06", .15):.3f});')
rev("#s06s", at("s06", .3), "scale:.4,opacity:0", .6, "back.out(2)")
rev("#s06t", at("s06", .7), "y:40,opacity:0")

# 07 outro
scene("s07", f'<div class="cam"><div class="g7">{GLOBE}</div><div class="trails">' + "".join(f'<i class="tr{k}"></i>' for k in range(6)) + '</div>'
             '<div class="steps7">' + "".join(f'<span id="s07k{k}">{t}</span>' for k, t in enumerate(["✓ নতুন AI শিখুন", "✓ ফ্রি টুল পরীক্ষা করুন", "✓ তথ্য যাচাই করুন"])) + '</div>'
             '<div class="logo7"><b>DAILY AI NEWS</b><span>FOLLOW FOR MORE</span></div></div>',
      "OUTRO", '<span class="g">DAILY AI NEWS</span> <i>|</i> FOLLOW FOR MORE')
js.append(f'tl.from("#s07 .steps7 span",{{x:-50,opacity:0,stagger:.9,duration:.4}},{at("s07", .02):.3f});')
rev("#s07 .logo7", at("s07", .6), "scale:.7,opacity:0", .6, "back.out(2)")
js.append(f'tl.fromTo("#s07 .trails i",{{xPercent:-120,opacity:0}},{{xPercent:120,opacity:1,duration:2.2,stagger:.35,ease:"power2.inOut",repeat:2,immediateRender:false}},{SC["s07"]["start"]:.3f});')

# continuous ambient motion
js.append(f'tl.to(".globe",{{rotation:360,duration:{DUR:.1f},ease:"none"}},0);')
js.append(f'tl.to(".mer",{{scaleX:-1,duration:4,ease:"sine.inOut",yoyo:true,repeat:{int(DUR / 4)}}},0);')
js.append(f'tl.to(".ping",{{scale:1.8,opacity:.2,transformOrigin:"50% 50%",duration:.9,yoyo:true,repeat:{int(DUR / .9)}}},0);')
js.append(f'tl.to(".chip3d",{{rotationY:20,rotationX:8,duration:3,ease:"sine.inOut",yoyo:true,repeat:{int(DUR / 3)}}},0);')
js.append(f'tl.fromTo(".trace",{{scaleX:0}},{{scaleX:1,duration:1.2,stagger:.15,ease:"power2.out",repeat:{int(DUR / 3)},repeatDelay:1.8}},0);')

caps = []
kw = lambda w: bool(re.search(r"[A-Za-z0-9০-৯]", w))
for i, c in enumerate(T["cues"]):
    spans = " ".join(f'<span class="{"kw" if kw(w) else ""}">{e(w)}</span>' for w in c["text"].split())
    st, du = c["start"] - .04, c["end"] - c["start"] + .04
    caps.append(f'<div id="cap{i}" class="clip cap" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{10 + i % 2}"><div class="capbox">{spans}</div></div>')
    js.append(f'tl.from("#cap{i} .capbox",{{scale:.92,opacity:0,duration:.14}},{st:.3f});')

page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1080, height=1920"/><title>Daily AI News 20 Oct</title>
<script src="assets/gsap.min.js"></script><style>{open("/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/news20/news.css").read()}</style></head><body>
<div id="root" data-composition-id="news" data-width="1080" data-height="1920" data-duration="{DUR:.3f}" data-fps="30">
<div id="bg" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="0"><div class="bgf"></div><i class="orb a"></i><i class="orb b"></i><div class="scan"></div></div>
<div id="hdr" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="1"><span class="live">● LIVE</span><b>DAILY AI NEWS</b><span class="dt">২০ অক্টোবর ২০২৬</span></div>
<div id="tick" class="clip" data-start="0" data-duration="{DUR:.3f}" data-track-index="2"><div class="tk">MINIMAX M3.1 FLASH · OPENROUTER FREE (সীমিত সময়) · GOTO LOCAL-LANGUAGE AI · FIRECRAWL × GOOGLE CLOUD · DEEPSEEK: US FEDERAL SYSTEMS · তথ্য যাচাই করুন · </div></div>
{''.join(clips)}{''.join(caps)}</div>
<script>window.__timelines=window.__timelines||{{}};const tl=gsap.timeline({{paused:true}});
tl.to(".orb.a",{{x:200,y:300,duration:{DUR / 3:.1f},yoyo:true,repeat:2,ease:"sine.inOut"}},0);tl.to(".orb.b",{{x:-200,y:-260,duration:{DUR / 3:.1f},yoyo:true,repeat:2,ease:"sine.inOut"}},0);
tl.fromTo("#tick .tk",{{x:0}},{{x:-3200,duration:{DUR:.1f},ease:"none"}},0);tl.fromTo(".scan",{{y:-200}},{{y:2000,duration:6,repeat:{int(DUR / 6)},ease:"none"}},0);
{chr(10).join(js)}
window.__timelines["news"]=tl;</script></body></html>"""
open(f"{P}/hf/index.html", "w").write(page)
print("wrote", len(page), "dur", DUR)

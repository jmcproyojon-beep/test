"""Assemble the 9:16 social reel from the real AI outputs: Gemini SVG images, Gemini TTS voice, Gemini SRT subtitles.
Image-to-video motion = slow zoom/pan per image + crossfades. Rendered with HyperFrames, mixed with a soft music bed."""
import html, json, os, re, shutil, subprocess, sys
import numpy as np, soundfile as sf

REC = "/home/user/test/projects/pillar01-lesson06/assets/rec"
HF = "/home/user/test/projects/pillar01-lesson06/reel_hf"
FONTS = "/home/user/test/projects/pillar01-lesson06/hf/assets/fonts"
os.makedirs(f"{HF}/assets", exist_ok=True)
if not os.path.exists(f"{HF}/assets/fonts"): shutil.copytree(FONTS, f"{HF}/assets/fonts")
shutil.copy("/home/user/test/projects/pillar01-lesson06/hf/assets/gsap.min.js", f"{HF}/assets/gsap.min.js")


def ts(s):
    h, m, r = s.strip().replace(".", ",").split(":"); sec, ms = r.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms.ljust(3, "0")[:3]) / 1000


def parse_srt(t):
    out = []
    for b in re.split(r"\n\s*\n", re.sub(r"```[a-z]*", "", t).strip()):
        L = b.strip().split("\n"); k = next((i for i, x in enumerate(L) if "-->" in x), None)
        if k is None: continue
        a, c = L[k].split("-->"); out.append(dict(s=ts(a), e=ts(c), t="\n".join(L[k + 1:]).strip()))
    return out


def plan():
    vdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{REC}/voice_bn_a.wav"], capture_output=True, text=True).stdout)
    f = f"{REC}/reel_fixed.srt" if os.path.exists(f"{REC}/reel_fixed.srt") else f"{REC}/reel_ai.srt"
    cues = parse_srt(open(f).read()) if os.path.exists(f) else []
    starts = [c["s"] for c in cues[1:]]
    snap = lambda x: min(starts, key=lambda s: abs(s - x)) if starts else x
    b1 = snap(vdur / 3); b2 = snap(2 * vdur / 3)
    if b2 <= b1 + 2: b2 = 2 * vdur / 3
    dur = round(vdur + 2.6, 3)
    p = dict(dur=dur, vdur=round(vdur, 3), cuts=[[0, round(b1, 3)], [round(b1, 3), round(b2, 3)], [round(b2, 3), dur]], cues=cues)
    json.dump(p, open(f"{REC}/reel_plan.json", "w"), ensure_ascii=False, indent=1)
    return p


def music(dur, path, vwav):
    SR = 48000; N = int(dur * SR); t = np.arange(N) / SR; y = np.zeros(N)
    note = lambda m: 440 * 2 ** ((m - 69) / 12)
    prog = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]; bar = 2.4
    for i in range(int(dur / bar) + 1):
        s0, s1 = int(i * bar * SR), min(N, int((i + 1) * bar * SR))
        if s0 >= N: break
        tt = np.arange(s1 - s0) / SR; env = np.minimum(1, np.minimum(tt / .3, (tt[-1] - tt + 1e-3) / .5))
        for m in prog[i % 4]:
            y[s0:s1] += 0.18 * np.sin(2 * np.pi * note(m) * tt) * env
        for k in range(4):                                     # soft plucked arpeggio
            a0 = s0 + int(k * bar / 4 * SR); n = min(int(0.7 * SR), N - a0)
            if n > 0:
                t2 = np.arange(n) / SR; y[a0:a0 + n] += 0.12 * np.sin(2 * np.pi * note(prog[i % 4][k % 3] + 12) * t2) * np.exp(-t2 * 5)
    y[:SR] *= np.linspace(0, 1, SR); y[-2 * SR:] *= np.linspace(1, 0, 2 * SR); y /= np.max(np.abs(y)) + 1e-9
    sf.write(path, np.stack([y, y], 1).astype(np.float32), SR)


def main():
    p = plan(); dur = p["dur"]; print("PCT 2", flush=True)
    svgs = [open(f"{REC}/img{i}.svg").read() for i in (1, 2, 3)]
    ns = lambda v, p: re.sub(r'href="#([^"]+)"', rf'href="#{p}_\1"', re.sub(r"url\(#([^)]+)\)", rf"url(#{p}_\1)", re.sub(r'id="([^"]+)"', rf'id="{p}_\1"', v)))
    svgs = [ns(v, f"i{i + 1}") for i, v in enumerate(svgs)]
    svgs = [re.sub(r"<svg", '<svg preserveAspectRatio="xMidYMid slice" width="1080" height="1920"', s, count=1) for s in svgs]
    motion = [("scale:1", "scale:1.14"), ("scale:1.12,x:-50", "scale:1.12,x:50"), ("scale:1.16", "scale:1.02")]
    clips, js = [], []
    for i, (a, b) in enumerate(p["cuts"]):
        st = max(0, a - (0.4 if i else 0)); du = b - st
        clips.append(f'<div id="im{i}" class="clip im" data-start="{st:.3f}" data-duration="{du:.3f}" data-track-index="{1 + i % 2}"><div class="kb" id="kb{i}">{svgs[i]}</div></div>')
        js.append(f'tl.fromTo("#kb{i}",{{{motion[i][0]}}},{{{motion[i][1]},duration:{du:.3f},ease:"none"}},{st:.3f});')
        if i: js.append(f'tl.from("#im{i}",{{opacity:0,duration:.4}},{st:.3f});')
    for k, c in enumerate(p["cues"]):
        txt = "<br/>".join(html.escape(x) for x in c["t"].split("\n"))
        clips.append(f'<div id="c{k}" class="clip cue" data-start="{c["s"]:.3f}" data-duration="{max(.3, c["e"] - c["s"]):.3f}" data-track-index="{5 + k % 2}"><span>{txt}</span></div>')
        js.append(f'tl.from("#c{k} span",{{y:16,opacity:0,duration:.18}},{c["s"]:.3f});')
    end0 = p["vdur"] + 0.1
    clips.append(f'<div id="endc" class="clip" data-start="{end0:.3f}" data-duration="{dur - end0:.3f}" data-track-index="8"><div class="leaf"></div><div class="bn">সবুজ পাতা</div><div class="cta">পেজে মেসেজ করুন</div></div>')
    js.append(f'tl.from("#endc",{{opacity:0,duration:.4}},{end0:.3f});tl.from("#endc .bn",{{y:40,opacity:0,duration:.5}},{end0 + .15:.3f});tl.from("#endc .cta",{{y:30,opacity:0,duration:.5}},{end0 + .4:.3f});')
    css = open(f"{os.path.dirname(os.path.abspath(__file__))}/../l3/style_l3.css").read().split(":root")[0]
    page = f"""<!doctype html><html lang="bn"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1080, height=1920"/><title>সবুজ পাতা রিল</title>
<script src="assets/gsap.min.js"></script><style>{css}
*{{margin:0;padding:0;box-sizing:border-box}} body{{background:#0f2a24}} #root{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#0f2a24;font-family:"Hind Siliguri",sans-serif}}
.clip{{position:absolute}} .im{{left:0;top:0;width:1080px;height:1920px;overflow:hidden}} .kb{{width:1080px;height:1920px;transform-origin:50% 50%}} .kb svg{{display:block}}
.cue{{left:70px;top:1330px;width:940px;text-align:center}} .cue span{{display:inline;background:rgba(8,20,16,.84);color:#fff;font:700 58px/1.5 "Hind Siliguri";padding:6px 18px;border-radius:14px;box-decoration-break:clone;-webkit-box-decoration-break:clone}}
#tag{{left:40px;top:60px;padding:10px 18px;border-radius:12px;background:rgba(8,20,16,.6);color:#e7fff5;font:600 30px "Hind Siliguri"}}
#endc{{left:0;top:0;width:1080px;height:1920px;background:linear-gradient(160deg,#0f2a24,#14532d);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px}}
.leaf{{width:150px;height:150px;border-radius:0 75px 0 75px;background:linear-gradient(135deg,#34d399,#16a34a);transform:rotate(45deg)}} .bn{{font:700 120px "Hind Siliguri";color:#fff}} .cta{{font:700 64px "Hind Siliguri";color:#facc15}}
</style></head><body><div id="root" data-composition-id="reel" data-width="1080" data-height="1920" data-duration="{dur:.3f}" data-fps="30">
{''.join(clips)}<div id="tag" class="clip" data-start="0" data-duration="{end0:.3f}" data-track-index="9">AI দিয়ে তৈরি</div></div>
<script>window.__timelines=window.__timelines||{{}};const tl=gsap.timeline({{paused:true}});{''.join(js)}window.__timelines["reel"]=tl;</script></body></html>"""
    open(f"{HF}/index.html", "w").write(page)
    pr = subprocess.Popen(["npx", "hyperframes", "render", ".", "-o", f"{REC}/reel_silent.mp4", "--workers", "4", "--crf", "18"], cwd=HF, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in pr.stdout:
        m = re.search(r'"pct":(\d+)', line)
        if m: print("PCT", min(95, 5 + int(m.group(1)) * 90 // 100), flush=True)
    if pr.wait() != 0: sys.exit("render failed")
    music(dur, f"{REC}/reel_music.wav", f"{REC}/voice_bn_a.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{REC}/reel_silent.mp4", "-i", f"{REC}/voice_bn_a.wav", "-i", f"{REC}/reel_music.wav", "-filter_complex",
                    "[1:a]aresample=48000,aformat=channel_layouts=stereo,adelay=0|0,apad,asplit=2[v][sc];[2:a]volume=0.5[m];[m][sc]sidechaincompress=threshold=0.02:ratio=10:attack=30:release=500[md];"
                    "[v][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.3f}", "-movflags", "+faststart", f"{REC}/reel_final.mp4"], check=True)
    print("PCT 100", flush=True)


if __name__ == "__main__":
    main()

"""Generate the Lesson 05 production package (12 deliverables) from the script, the real timeline and the real AI outputs."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l5_script import SCENES, SEGS, DEMOS, MEETING, DOC

P = "/home/user/test/projects/pillar01-lesson05"
D = f"{P}/deliverables"; os.makedirs(D, exist_ok=True)
T = json.load(open(f"{P}/artifacts/timing.json"))
MAN = json.load(open(f"{P}/artifacts/tts_manifest.json"))
CL = json.load(open(f"{P}/artifacts/clips.json"))
QC = json.load(open(f"{P}/artifacts/qc.json")) if os.path.exists(f"{P}/artifacts/qc.json") else {}
LIP = json.load(open(f"{P}/artifacts/lipsync_scenes.json")) if os.path.exists(f"{P}/artifacts/lipsync_scenes.json") else []
CUES = json.load(open(f"{P}/artifacts/sfx_cues.json")) if os.path.exists(f"{P}/artifacts/sfx_cues.json") else []
OUTS = [json.loads(l) for l in open(f"{P}/assets/rec/outputs.jsonl")]
OUT = {}
for o in OUTS:                       # keep the last logged answer per demo/turn (the take that was recorded)
    OUT[(o["demo"], o["turn"])] = o
SC = {s["id"]: s for s in T["scenes"]}
SG = {s["id"]: s for s in T["segs"]}
DUR = T["video_duration"]
SCREEN = sum(s["end"] - s["start"] for s in T["segs"] if s["kind"] == "screen")
models = sorted({o["model"] for o in OUT.values()})


def tc(x):
    m, s = divmod(x, 60)
    return f"{int(m):02d}:{s:04.1f}"


def srt_t(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"


DEMO_NAME = {"d2": "শিক্ষার্থী · Photosynthesis", "d3": "অফিস · মিটিং নোট → Action Plan", "d4a": "ইমেইল · দুর্বল প্রম্পট",
             "d4b": "ইমেইল · শক্তিশালী প্রম্পট", "d5": "ব্যবসা · ৭ দিনের ফেসবুক ক্যালেন্ডার", "d6": "ক্রিয়েটর · ভিডিও আইডিয়া → স্ক্রিপ্ট",
             "d7": "রিসার্চ · সারাংশ + উৎস-বাক্য", "d8": "পরিকল্পনা · বিকেলের রুটিন", "d9": "পূর্ণ ওয়ার্কফ্লো · স্টেশনারি দোকান"}
VIS = {
 "s01a": "Three problem cards (student, office worker, business owner) rise in, each stamped “সময় শেষ!”; they lift away for an “AI-সহায়ক ওয়ার্কস্পেস” card; the lesson title appears; presenter frame slides in from the left (lip-synced); a green honesty badge states the demos are live Google Gemini recordings.",
 "s02a": "Problem card: Class 8 student, “Photosynthesis বুঝতে পারছি না”, with a “কেন জরুরি” line.",
 "s02d": "Pause card “এখন ভিডিওটি থামান · অনুশীলন করুন” + 5-4-3-2-1 countdown ring.",
 "s03a": "The fictional messy meeting note (handwritten-style card) → arrow → “গোছানো Action Plan” card.",
 "s04a": "Problem card: meeting moved Thursday 10:00 → 3:00 pm (strikethrough + amber highlight).",
 "s05a": "Business information sheet rows slide in; Pricing/Offers rows in red “Not provided”; warning card “AI-কে বানাতে দেব না”.",
 "s05d": "Pause card + countdown (change the business type and re-run).",
 "s06a": "Problem card: a new creator with no video ideas.",
 "s07a": "The full fictional library report card (readable on screen).",
 "s08a": "A 4 pm–9 pm timeline bar: Study 2 h, Assignment 1 h, Reading 0.5 h, Family 1 h, break 0.5 h; the bars grow in.",
 "s08c": "Pause card + countdown (use your own tasks).",
 "s09a": "8-step workflow grid (business info → … → organise files) + the fictional stationery-shop card.",
 "s09c": "“চূড়ান্ত ফোল্ডার” card with document chips (ideas, caption, design brief, reel script, FAQ, verification checklist ✓).",
 "s10a": "Quiz cards one at a time: question → “ভাবুন…” shrinking timer bar → green answer reveal with chime.",
 "s10b": "Assignment checklist card, five items tick in one by one.",
 "s10c": "Presenter frame (lip-synced) + “আজ যা শিখলাম” 7 topic chips + key-message bar + next-class card; end card with credits.",
}


def vis(g):
    if g["kind"] == "screen":
        c = CL.get(g["id"], {})
        return (f"**LIVE screen recording** ({DEMO_NAME[g['demo']]}, turn {g['turn'] + 1}): zoom on the prompt box while the prompt is typed"
                f"{' (×' + str(c.get('type_speed')) + ')' if c.get('type_speed', 1) > 1.05 else ''}, click Send (cursor ring), "
                f"the real answer arrives (waiting time of {c.get('wait_cut_from', '?')} s trimmed to 1.2 s), then a zoom on the chat column scrolls through the answer; slow push-in while it is held for reading. Teaching-point chips on the right.")
    return VIS.get(g["id"], "")


# ============================================================ 1. SCRIPT
o = []; w = o.append
w("# 01 · Full narration script — PILLAR 01 · Lesson 05 · AI for Everyday Productivity\n")
w(f"Instructor: **Rubel Miah** · Video editor: **Paloan** · Rendered length **{tc(DUR)}** · every line below is spoken exactly as written in the video.\n")
for sc, num, title in SCENES:
    s = SC[sc]
    w(f"## দৃশ্য {num} · {title}  `{tc(s['start'])}–{tc(s['end'])}`\n")
    for g in [g for g in SEGS if g["scene"] == sc]:
        tag = {"screen": "🖥 লাইভ স্ক্রিন ডেমো", "anim": "🎞 ভিজ্যুয়াল"}[g["kind"]]
        if g.get("practice"): tag = "⏸ অনুশীলন বিরতি"
        if g.get("quiz"): tag = "❓ কুইজ"
        w(f"**[{tag} · {tc(SG[g['id']]['start'])}]**\n")
        for l in g["lines"]:
            w(f"> {l}\n")
open(f"{D}/01_script.md", "w").write("\n".join(o))

# ============================================================ 2. STORYBOARD
o = []; w = o.append
w("# 02 · Storyboard (segment by segment, real timecodes)\n")
w(f"Screen-demo time: **{tc(SCREEN)}** of {tc(DUR)} (**{SCREEN / DUR * 100:.0f}%**) is genuine screen recording of a real AI answering live.\n")
w("| # | Timecode | Type | What the viewer sees | Narration starts with |\n|---|---|---|---|---|")
for i, g in enumerate(SEGS, 1):
    s = SG[g["id"]]
    kind = "Screen demo" if g["kind"] == "screen" else ("Practice pause" if g.get("practice") else ("Quiz" if g.get("quiz") else "Animated"))
    w(f"| {i} | {tc(s['start'])}–{tc(s['end'])} | {kind} | {vis(g)} | {g['lines'][0][:60]}… |")
w("\nEvery scene opens with a 1.6 s chapter card (number + title + amber underline).\n")
w("\n### How each topic follows the 10-step teaching sequence\n")
w("| Step | Where it happens in every topic (scenes 02–09) |\n|---|---|")
for a, b in [("1 Real problem", "Opening problem card (sXXa)"), ("2 Why it matters", "“কেন জরুরি” line on the card + narration"),
             ("3 Prompt shown", "Prompt typed on screen in the live demo"), ("4 Prompt explained", "Narration + teaching-point chip for each part"),
             ("5 Real AI output", "The live Gemini answer arriving and scrolled"), ("6 Output reviewed", "Narration points at what is good/missing"),
             ("7 Follow-up prompt", "Second turn typed in the same chat (02–07, 09)"), ("8 Verify", "“যাচাই” chip + narration: what to check yourself"),
             ("9 Common mistake", "“ভুল:” chip/line at the end of the topic"), ("10 Practice/outcome", "Practice pause (02, 05, 08) or learning outcome line")]:
    w(f"| {a} | {b} |")
open(f"{D}/02_storyboard.md", "w").write("\n".join(o))

# ============================================================ 3. VISUAL PROMPTS
o = []; w = o.append
w("# 03 · Visual prompts (for re-creating or extending the animated scenes)\n")
w("Style for every frame: warm studio palette (charcoal #0e0b09, amber #ffa24c, teal #2dd4bf), glass cards with soft amber border, Hind Siliguri Bangla type, slow orbs in the background, 1920×1080.\n")
for g in SEGS:
    if g["kind"] == "anim":
        w(f"- **{g['id']}** — {VIS[g['id']]}")
w("\n**Thumbnail image prompt:** “Bangladeshi male instructor in olive overshirt, smiling, left 40% of frame; on the right a glowing laptop screen with a Bangla chat answer and three floating cards labelled ইমেইল, রুটিন, ফেসবুক পোস্ট; warm amber key light, teal rim light, dark studio background, 16:9, high detail.”\n")
open(f"{D}/03_visual_prompts.md", "w").write("\n".join(o))

# ============================================================ 4. RECORDING INSTRUCTIONS
o = []; w = o.append
w("# 04 · Screen-recording instructions\n")
w("## What was actually recorded for this video\n")
w(f"- **Assistant:** Google Gemini through the official API (`{'`, `'.join(models)}`), streamed into a simple chat page that is clearly labelled on screen “Google Gemini · লাইভ API ডেমো · আসল AI উত্তর”. It is **not** the ChatGPT website. The video says so in scene 01.")
w("- **Recorder:** Chromium (Playwright) at 1920×1080, real keystrokes typed into the box, real Send click, the answer rendered as it came back. Nothing was typed or edited into the answers afterwards.")
w("- **Editing:** only the waiting time before each answer was cut (shown per clip below), and typing was sped up where a prompt was very long. Answers are shown exactly as returned.\n")
w("| Clip | Demo | Turn | Real wait cut | Typing speed | Read-through speed |\n|---|---|---|---|---|---|")
for k, c in CL.items():
    w(f"| {k} | {DEMO_NAME[c['demo']]} | {c['turn'] + 1} | {c['wait_cut_from']} s → 1.2 s | ×{c['type_speed']} | ×{c['read_speed']} |")
w("\n## How to re-record with ChatGPT (or Gemini / Claude) yourself\n")
for i, x in enumerate([
    "Use Chrome on a computer. Create a separate browser profile with no bookmarks, extensions or saved history.",
    "Sign in at `chatgpt.com` (or `gemini.google.com`). Hide the sidebar or blur it in the edit. Hide your name, e-mail and profile picture.",
    "Display 1920×1080, browser zoom 125% so Bangla text is readable after export. Turn off notifications (Windows Focus Assist / macOS Do Not Disturb).",
    "Recorder: OBS Studio, canvas 1920×1080, 30 fps, MKV (remux to MP4), cursor visible. Record each demo as a separate file.",
    "Start a **new chat** for every demo. Paste the prompt from `05_prompts.md` exactly (typing it live is fine; speed it up in the edit).",
    "Press Send once and do not touch the mouse until the answer finishes. Then scroll slowly (about one screen every 3 s) to the end.",
    "Type the follow-up prompt in the same chat, send, wait, scroll again.",
    "Never regenerate to get a ‘better’ answer for the video without saying so on screen. If an answer contains an error, keep it and point it out — that is the verification lesson.",
    "Copy every answer into a text file with the date, tool and model name, so on-screen claims can be checked later."], 1):
    w(f"{i}. {x}")
w("\n**Edit:** cut the waiting spinner to ~1 s, zoom 125–150% on the prompt box while typing and on the answer while reading, add a cursor highlight ring on the Send click, keep every answer frame unedited.\n")
w("**Privacy:** all data in the prompts is fictional (meeting note, library report, shops). Never paste real customer, student, NID, bank or password data into a public AI tool.\n")
w("**Expected differences:** ChatGPT and Gemini will answer the same prompts with different wording, length and formatting. Teach the *method* (role, context, constraints, format, follow-up, verification), not the exact text.\n")
open(f"{D}/04_recording_instructions.md", "w").write("\n".join(o))

# ============================================================ 5. PROMPTS
o = []; w = o.append
w("# 05 · All prompts used in the lesson (copy-paste ready)\n")
for k, ps in DEMOS.items():
    w(f"## {DEMO_NAME[k]}\n")
    for i, p in enumerate(ps):
        w(f"**{'Prompt' if i == 0 else 'Follow-up'}:**\n\n```\n{p}\n```\n")
w("## Practice-pause prompts\n")
w("- দৃশ্য ০২: নিজের পাঠ্যবইয়ের একটি কঠিন বিষয় বেছে নিয়ে Photosynthesis প্রম্পটের একই কাঠামোয় (ভূমিকা · আমি কে · কী চাই · উদাহরণ · প্রশ্ন) লিখুন।")
w("- দৃশ্য ০৫: ব্যবসার ধরন বদলে (রেস্টুরেন্ট / স্টেশনারি দোকান) একই ৭ দিনের ক্যালেন্ডার প্রম্পট চালান।")
w("- দৃশ্য ০৮: নমুনা কাজের জায়গায় আজকের নিজের কাজ, সময় ও অগ্রাধিকার দিয়ে রুটিন প্রম্পট চালান।\n")
open(f"{D}/05_prompts.md", "w").write("\n".join(o))

# ============================================================ 6. OUTPUT COMPARISONS (real answers)
o = []; w = o.append
w("# 06 · Real AI outputs and comparisons\n")
w(f"Every answer below is the **verbatim** response from Google Gemini (`{'`, `'.join(models)}`) that appears in the video, logged at recording time (`assets/rec/outputs.jsonl`). Nothing was edited.\n")
w("## Comparison 1 · Weak vs strong email prompt\n")
for k, lab in [("d4a", "Weak prompt"), ("d4b", "Strong prompt")]:
    r = OUT.get((k, 0))
    if r:
        w(f"### {lab}: `{r['prompt'][:120]}{'…' if len(r['prompt']) > 120 else ''}`\n")
        w(f"Answer length: **{len(r['response'])} characters**\n\n```\n{r['response']}\n```\n")
w("**What changed:** the weak prompt gave the AI no recipient, time, reason or tone, so it had to ask questions or produce a generic template. The strong prompt specified all five, so the answer is a usable, specific draft. You still check the time, date and names before sending.\n")
w("## Comparison 2 · First answer vs follow-up (same chat)\n")
w("| Demo | First answer (chars) | Follow-up answer (chars) | What the follow-up added |\n|---|---|---|---|")
adds = {"d2": "story-based explanation + interactive quiz", "d3": "priority + missing information list", "d4b": "shorter, more polite version",
        "d5": "20-second reel script from Day 01", "d6": "60-second script table for idea 1", "d7": "source sentence next to each claim", "d9": "—"}
for k in DEMOS:
    a, b = OUT.get((k, 0)), OUT.get((k, 1))
    if a and b:
        w(f"| {DEMO_NAME[k]} | {len(a['response'])} | {len(b['response'])} | {adds.get(k, '')} |")
w("\n## All real answers (verbatim)\n")
for k in DEMOS:
    for t in (0, 1):
        r = OUT.get((k, t))
        if r:
            w(f"### {DEMO_NAME[k]} · turn {t + 1} · model `{r['model']}`\n\n**Prompt:**\n\n```\n{r['prompt']}\n```\n\n**Answer:**\n\n```\n{r['response']}\n```\n")
open(f"{D}/06_output_comparisons.md", "w").write("\n".join(o))

# ============================================================ 7. PRACTICE PAUSES + QUIZ + ASSIGNMENT
o = []; w = o.append
w("# 07 · Practice pauses, quiz and final assignment\n")
w("| Pause | Timecode | Task | On-screen countdown |\n|---|---|---|---|")
for sid, task in [("s02d", "নিজের পাঠ্যবইয়ের একটি কঠিন বিষয় AI-কে একই ধাঁচের প্রম্পটে বোঝাতে বলুন"), ("s05d", "ব্যবসা বদলে নতুন ৭ দিনের ক্যালেন্ডার"), ("s08c", "নিজের আজকের কাজ দিয়ে রুটিন")]:
    s = SG[sid]
    w(f"| {sid[:3]} | {tc(s['narr_end'])} | {task} | 5 s countdown + {s['end'] - s['narr_end']:.0f} s hold |")
w("\n## Quiz (scene 10, each answer revealed after a 4 s thinking pause)\n")
qz = [g for g in SEGS if g.get("quiz")][0]["lines"]
for i in range(0, len(qz), 2):
    w(f"**{qz[i]}**\n\n✅ {qz[i + 1]}\n")
w("## Final assignment · নিজের একটি বাস্তব AI ওয়ার্কফ্লো\n")
w("Choose one real task from your study, office, business or content work and submit:\n")
for i, x in enumerate(["একটি শুরুর প্রম্পট (starting prompt)", "একটি উন্নত প্রম্পট (role, context, constraints, format যোগ করে)", "একটি ফলো-আপ প্রম্পট",
                       "একটি যাচাই করা চূড়ান্ত ফলাফল (কী যাচাই করেছেন তা চিহ্নিত)", "AI কোথায় সাহায্য করেছে আর কোথায় আপনার সিদ্ধান্ত লেগেছে — ৩–৪ লাইনের ব্যাখ্যা"], 1):
    w(f"{i}. {x}")
w("\n**Rubric (20 points):** prompt quality 5 · improvement shown between prompts 5 · verification evidence 5 · honest reflection 5.\n")
w("**Self-check:** ব্যক্তিগত/গোপন তথ্য দিইনি? সব সংখ্যা, নাম, তারিখ যাচাই করেছি? AI যা বানিয়েছে (দাম, অফার, উৎস) তা চিহ্নিত করেছি?\n")
open(f"{D}/07_practice_quiz_assignment.md", "w").write("\n".join(o))

# ============================================================ 8. SRT
srt = []
for i, c in enumerate(T["cues"], 1):
    srt.append(f"{i}\n{srt_t(c['start'])} --> {srt_t(c['end'])}\n{c['text']}\n")
open(f"{D}/pillar01-lesson05.bn.srt", "w").write("\n".join(srt))

# ============================================================ 9. MUSIC / SFX NOTES
o = []; w = o.append
w("# 09 · Music and sound-effect notes\n")
w("- **Music:** original, code-synthesized warm bed (80 BPM, Fmaj7–Dm7–B♭maj7–C6 pad, soft bass, sparse bells, no drums) — royalty-free, same family as Lessons 03–04.")
w("- **Level:** about 20 dB under the voice, sidechain-ducked further whenever the narrator speaks; un-ducked during practice and quiz pauses so the pause does not feel dead.")
w("- **Master:** −14 LUFS integrated, true peak ≤ −1 dBTP after AAC.\n")
w("| Time | Sound effect |\n|---|---|")
for t, n in CUES:
    w(f"| {tc(t)} | {n} |")
open(f"{D}/09_music_sfx_notes.md", "w").write("\n".join(o))

# ============================================================ 10. EDITING TIMELINE
o = []; w = o.append
w("# 10 · Editing timeline (track layout of the rendered master)\n")
w("| Track | Content |\n|---|---|")
for a, b in [("V0", "Background (gradient, grid, drifting orbs)"), ("V1–V2", "Top bar (course · lesson · instructor) and progress bar"), ("V3", "Scene layouts / cards / screen frames"),
             ("V7", "Chapter cards"), ("V8 + V12", "Lip-synced presenter video + badge/name-tag overlay" if LIP else "Presenter still"), ("V9", "End card with credits"),
             ("V10–V11", "Burned-in Bangla subtitles (alternating)"), ("V20–V21", "Screen-recording clips (alternating)"),
             ("A1", "Narration (Gemini TTS, voice Orus)"), ("A2", "Music bed (ducked)"), ("A3", "SFX")]:
    w(f"| {a} | {b} |")
w("\n| Scene | Start | Narration starts | End | Length |\n|---|---|---|---|---|")
for s in T["scenes"]:
    w(f"| {s['num']} {s['title']} | {tc(s['start'])} | {tc(s['narr_start'])} | {tc(s['end'])} | {s['end'] - s['start']:.1f} s |")
w("\n### Sections that would benefit from an extended lesson\n")
w("All the user-specified examples fit in the 15-minute slot, but four are compressed and could become their own lessons:\n")
for x in ["**Scene 05 (business calendar):** the 7-day answer is long; on screen only the structure and Day 01 are readable at normal speed. An extended lesson could walk through all seven days and show how to turn each into a post.",
          "**Scene 06 (creator script):** the 60-second script table is shown but not produced as a video. An extended lesson could record the script being filmed.",
          "**Scene 07 (research):** source-sentence verification is demonstrated once. A longer lesson could practise spotting a wrong claim on purpose.",
          "**Scene 09 (full workflow):** only the master prompt and its single combined answer are shown; the individual steps (image creation, reel editing, FAQ) each deserve a hands-on session."]:
    w(f"- {x}")
open(f"{D}/10_editing_timeline.md", "w").write("\n".join(o))

# ============================================================ 11. THUMBNAIL + DESCRIPTION
o = []; w = o.append
w("# 11 · Thumbnail and YouTube description\n")
w("**Thumbnail text:** “দৈনন্দিন কাজে AI” (big) · “লাইভ ডেমো · লেসন ০৫” (small amber tag). Presenter photo left 40%, laptop with a real Bangla answer on the right. A thumbnail frame is in `thumbnail.jpg` (taken from the video).\n")
w("**Title options:**\n1. দৈনন্দিন কাজে AI — পড়াশোনা, অফিস, ইমেইল, ব্যবসা (লাইভ ডেমো) | লেসন ০৫\n2. AI দিয়ে ১৫ মিনিটে ৮টি বাস্তব কাজ — বাংলা হাতে-কলমে ক্লাস\n3. Practical AI Masterclass · Lesson 05 · AI for Everyday Productivity (বাংলা)\n")
w("**Description:**\n")
w("```\nদৈনন্দিন কাজে AI | পড়াশোনা, অফিস, ইমেইল, ব্যবসা, কনটেন্ট, রিসার্চ, পরিকল্পনা | PILLAR 01 · লেসন ০৫\nইন্সট্রাক্টর: Rubel Miah · ভিডিও এডিটর: Paloan\n\n"
  "এই ভিডিওর সব ডেমো আসল AI (Google Gemini)-এর সাথে লাইভ রেকর্ড করা। ChatGPT বা অন্য টুলে একই প্রম্পটের উত্তর কিছুটা আলাদা হবে।\n\n"
  + "\n".join(f"{tc(SC[sc]['start'])[:5]} {title}" for sc, _, title in SCENES) +
  "\n\nঅ্যাসাইনমেন্ট: নিজের একটি বাস্তব কাজের জন্য শুরুর প্রম্পট, উন্নত প্রম্পট, ফলো-আপ ও যাচাই করা ফলাফল জমা দিন।\nমনে রাখবেন: AI প্রথম খসড়া দেয় — সিদ্ধান্ত ও যাচাই আপনার। ব্যক্তিগত তথ্য কখনো দেবেন না।\n\n#AIবাংলা #ChatGPT #Gemini #Productivity #PracticalAI\n```\n")
w("**Tags:** AI বাংলা, ChatGPT বাংলা, Gemini বাংলা, AI productivity, prompt engineering বাংলা, AI for students, AI for business Bangladesh\n")
w("**Disclosure:** turn on the platform's “altered or synthetic content” label: the narration is AI text-to-speech" + (" and the presenter's lip movement is AI-generated (SadTalker)." if LIP else "."))
open(f"{D}/11_thumbnail_description.md", "w").write("\n".join(o))

# ============================================================ README / index
o = []; w = o.append
w("# PILLAR 01 · Lesson 05 — AI for Everyday Productivity · Production package\n")
w(f"**Instructor:** Rubel Miah · **Video editor:** Paloan · **Rendered:** `pillar01-lesson05_final.mp4` · {tc(DUR)} · 1920×1080 · 30 fps · H.264 + AAC\n")
w("> **What's real:**")
w(f"> - **Screen demos:** {len(CL)} clips, {tc(SCREEN)} ({SCREEN / DUR * 100:.0f}% of the video), recorded live in a browser while Google Gemini answered the exact prompts from your brief. The answers are verbatim (see 06). The tool shown is Gemini via its API with a simple, clearly labelled chat page, **not ChatGPT**; 04 explains how to re-record with ChatGPT.")
w(f"> - **Narration:** Gemini TTS, voice Orus, each scene transcribed back and matched to the script (lowest match {min(v['ratio'] for v in MAN.values()):.2f}).")
w("> - **Presenter:** your photo" + (f", lip-synced with SadTalker (open source) in the opening and closing, labelled “AI লিপ-সিঙ্ক”." if LIP else ", as a still."))
w("> - **Fictional data:** the meeting note, the library report and the businesses are invented for teaching and labelled “কাল্পনিক” on screen.\n")
w("| # | Deliverable | File |\n|---|---|---|")
for a, b in [("1", "Full script"), ("2", "Storyboard"), ("3", "Visual prompts"), ("4", "Screen-recording instructions"), ("5", "Prompts"), ("6", "Real output comparisons"),
             ("7", "Practice pauses, quiz, assignment"), ("8", "Bangla SRT"), ("9", "Music & SFX notes"), ("10", "Editing timeline + extended-lesson notes"), ("11", "Thumbnail & description"), ("12", "Final MP4")]:
    f = {"1": "01_script.md", "2": "02_storyboard.md", "3": "03_visual_prompts.md", "4": "04_recording_instructions.md", "5": "05_prompts.md", "6": "06_output_comparisons.md",
         "7": "07_practice_quiz_assignment.md", "8": "pillar01-lesson05.bn.srt", "9": "09_music_sfx_notes.md", "10": "10_editing_timeline.md", "11": "11_thumbnail_description.md", "12": "pillar01-lesson05_final.mp4"}[a]
    w(f"| {a} | {b} | `{f}` |")
if QC:
    w("\n**Measured QC on the delivered MP4:** " + " · ".join(f"{k}: {v}" for k, v in QC.items()))
open(f"{D}/README.md", "w").write("\n".join(o))
print("package written to", D)

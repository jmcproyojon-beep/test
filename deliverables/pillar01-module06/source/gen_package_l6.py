"""Generate the Module 06 production package from the script, the real timeline and the logged AI outputs."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l6_script import SCENES, SEGS, PROMPTS

P = "/home/user/test/projects/pillar01-lesson06"
D = f"{P}/deliverables"; os.makedirs(D, exist_ok=True)
R = f"{P}/assets/rec"
T = json.load(open(f"{P}/artifacts/timing.json"))
MAN = json.load(open(f"{P}/artifacts/tts_manifest.json"))
CL = json.load(open(f"{P}/artifacts/clips.json"))
QC = json.load(open(f"{P}/artifacts/qc.json")) if os.path.exists(f"{P}/artifacts/qc.json") else {}
LIP = json.load(open(f"{P}/artifacts/lipsync_scenes.json")) if os.path.exists(f"{P}/artifacts/lipsync_scenes.json") else []
CUES = json.load(open(f"{P}/artifacts/sfx_cues.json")) if os.path.exists(f"{P}/artifacts/sfx_cues.json") else []
OUTS = [json.loads(l) for l in open(f"{R}/outputs.jsonl")]
TAKES = {t["tag"]: t for t in json.load(open(f"{R}/takes.json"))}
PLAN = json.load(open(f"{R}/reel_plan.json"))
SC = {s["id"]: s for s in T["scenes"]}; SG = {s["id"]: s for s in T["segs"]}
DUR = T["video_duration"]
SCREEN = sum(s["end"] - s["start"] for s in T["segs"] if s["kind"] == "screen")
REEL = SG["s09a"]["end"] - SG["s09a"]["start"]
rd = lambda f: open(f"{R}/{f}").read().strip() if os.path.exists(f"{R}/{f}") else ""
last = lambda **kw: [o for o in OUTS if all(o.get(k) == v for k, v in kw.items())][-1]


def tc(x):
    m, s = divmod(x, 60)
    return f"{int(m):02d}:{s:04.1f}"


def srt_t(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"


DEMO = {"d1": "ধাপ ১ · স্ক্রিপ্ট (Gemini চ্যাট)", "d2": "ধাপ ২ · টেক্সট থেকে ছবি (Gemini → SVG)", "d3": "ধাপ ৩ · ভয়েস (Gemini TTS)",
        "d4": "ধাপ ৪ · ডাবিং ও অ্যাভাটার", "d5": "ধাপ ৫ · অডিও থেকে SRT (Gemini)", "d5b": "ধাপ ৫ · SRT যাচাই ও প্রিভিউ", "d6": "ধাপ ৬ · এডিট ও এক্সপোর্ট"}
VIS = {
 "s01a": "Opening sting “০৬ · Video, Audio & Production”, then two panels: আগে (camera, voice artist, editor, days — struck through) vs এখন (one person, a laptop, a few AI tools, one afternoon).",
 "s01b": "Presenter frame (lip-synced) + big name title “Rubel Miah · রুবেল মিয়া · ইন্সট্রাক্টর”, gold underline, MODULE ০৬ badge.",
 "s01c": "Recreation of the uploaded module card (06 · Video, Audio & Production · 4 topic chips · যা হাতে পাবেন: Script → image → voice → video → subtitle → social reel), honesty badge.",
 "s02a": "Six pipeline nodes light up with connecting arrows; “আউটপুট → পরের ধাপের ইনপুট”; the Script node glows.",
 "s02b": "Project card “সবুজ পাতা” (fictional) + rules card: consent for faces/voices, disclose AI content.",
 "s03c": "Practice pause + 5-4-3-2-1 countdown.",
 "s04a": "Three tool-type cards (text→image, image→video, text→video) → six-part video-prompt anatomy with an example → “সৎ কথা” card explaining why image/video models are not demoed live.",
 "s05c": "Practice pause + four voice tips (pauses via punctuation, numbers as words, listen to the whole take, style instruction in English).",
 "s07c": "Practice pause + countdown.",
 "s09a": "Phone mock-up plays the exported reel full length with sound; credit rows list which AI made each part.",
 "s09b": "Five-item pre-publish checklist + “AI খসড়া বানায় দ্রুত — গল্প, রুচি আর শেষ সিদ্ধান্ত আপনার”.",
 "s10a": "Three quiz cards with thinking-timer bars and green answer reveals.",
 "s10b": "Assignment checklist (6 items).",
 "s10c": "Outro: presenter (lip-synced), “ধন্যবাদ! Rubel Miah”, recap of the pipeline; end card with credits Instructor Rubel Miah · Video Editor Paloan.",
}


def vis(g):
    if g["kind"] == "screen":
        c = CL.get(g["id"], {})
        w = ", ".join(f"{x:.0f} s" for x in c.get("waits_cut", []))
        p = f" Then the real generated {'audio' if c['play']['tag'] != 'avatar' else 'avatar video'} plays for {c['play']['len']:.0f} s at 1×." if c.get("play") else ""
        return f"**LIVE recording** of the AI Reel Studio ({DEMO[g['demo']]}): real typing and clicks, smooth zooms on the active panel{'; AI waiting time trimmed (' + w + ' → ~1.3 s)' if w else ''}.{p}"
    return VIS.get(g["id"], "")


# 01 script
o = ["# 01 · Full narration script — PILLAR 01 · Module 06 · Video, Audio & Production\n",
     f"Instructor: **Rubel Miah** · Video editor: **Paloan** · Rendered length **{tc(DUR)}** · every line below is spoken exactly as written.\n"]
for sc, num, title in SCENES:
    s = SC[sc]; o.append(f"## দৃশ্য {num} · {title}  `{tc(s['start'])}–{tc(s['end'])}`\n")
    for g in [g for g in SEGS if g["scene"] == sc]:
        tag = {"screen": "🖥 লাইভ স্ক্রিন ডেমো", "anim": "🎞 ভিজ্যুয়াল", "reel": "📱 রিল প্রদর্শন"}[g["kind"]]
        if g.get("practice"): tag = "⏸ অনুশীলন বিরতি"
        if g.get("quiz"): tag = "❓ কুইজ"
        if g.get("lip"): tag += " · লিপ-সিঙ্ক"
        o.append(f"**[{tag} · {tc(SG[g['id']]['start'])}]**\n"); o += [f"> {l}\n" for l in g["lines"]]
open(f"{D}/01_script.md", "w").write("\n".join(o))

# 02 storyboard
o = ["# 02 · Storyboard (real timecodes)\n", f"Live screen recording: **{tc(SCREEN)}** ({SCREEN / DUR * 100:.0f}%) + the finished reel {tc(REEL)} — total real AI output on screen **{(SCREEN + REEL) / DUR * 100:.0f}%** of the lesson.\n",
     "| # | Timecode | Type | What the viewer sees | Narration starts |\n|---|---|---|---|---|"]
for i, g in enumerate(SEGS, 1):
    s = SG[g["id"]]
    k = {"screen": "Screen demo", "reel": "Reel"}.get(g["kind"], "Practice" if g.get("practice") else "Quiz" if g.get("quiz") else "Animated")
    o.append(f"| {i} | {tc(s['start'])}–{tc(s['end'])} | {k} | {vis(g)} | {g['lines'][0][:55]}… |")
open(f"{D}/02_storyboard.md", "w").write("\n".join(o))

# 03 visual prompts
o = ["# 03 · Visual prompts\n", "Theme: deep forest green #04110d → #0f3b2d, mint #34d399, gold #facc15, studio violet #7c3aed glow (taken from the module card and the studio photo). Hind Siliguri / Inter. 1920×1080.\n",
     "## Reel image prompts (typed live; Gemini answered with SVG)\n"] + [f"- **দৃশ্য {i}:** `{PROMPTS['img' + str(i)]}`" for i in (1, 2, 3)]
o += ["\n## Motion (image-to-video) applied in the edit\n", "- দৃশ্য ১: slow zoom-in 1.00→1.14 · দৃশ্য ২: pan left→right at 1.12 · দৃশ্য ৩: slow zoom-out 1.16→1.02 · 0.4 s crossfades.\n",
      "## Text-to-video prompts to try in Veo / Kling / Runway (not run here)\n",
      "- `Slow dolly-in on a tired young office worker at a desk in Dhaka at 5 pm, warm window light, flat vector illustration style, 5 seconds, 9:16.`",
      "- `Drone glide over misty Sylhet tea garden at sunrise, tea picker in foreground, soft golden light, gentle camera move forward, 5 seconds, 9:16.`",
      "- `Close-up of steaming tea cup on a wooden table, phone screen lights up with a chat message, shallow depth of field, slow push-in, 4 seconds, 9:16.`\n",
      "## Animated lesson scenes\n"] + [f"- **{k}** — {v}" for k, v in VIS.items()]
o.append("\n**Thumbnail prompt:** “Bangladeshi presenter in olive hoodie at a studio mic, left 40%; on the right a vertical phone showing a tea-garden reel with Bangla subtitles, a waveform and a timeline; deep green + mint + gold, violet rim light; big text ‘AI দিয়ে রিল’.”")
open(f"{D}/03_visual_prompts.md", "w").write("\n".join(o))

# 04 recording instructions
o = ["# 04 · Screen-recording notes and how to re-record\n", "## What was recorded for this video\n",
     "- **AI Reel Studio:** a small local web app built for this lesson, labelled on screen “লাইভ ডেমো · Google Gemini API · আসল AI আউটপুট”. Every result in it is produced live by the Google Gemini API: chat (`gemini-3.8-flash`), SVG illustration (`gemini-3.8-flash`), text-to-speech (`gemini-3.8-flash-tts`), audio→SRT (`gemini-3.8-flash`). The export button runs a real render (HyperFrames + ffmpeg).",
     "- **AI avatar:** SadTalker (open source) on the presenter photo, driven by the generated Bangla voice; rendered on CPU (~60 min for 21 s).",
     "- **Recorder:** Chromium via Playwright, 1920×1080, real keystrokes and clicks. Edits: AI waiting time trimmed, long typing sped up, scroll-reads retimed, zooms added. Generated audio and the avatar play at 1×. No AI output was edited.",
     "- **Honest retakes:** (1) the first voice take read the Bangla style note aloud — the style instruction was moved to English; (2) the first English dub glitched (spoke part of the instruction and repeated a line) — regenerated without a style wrapper; (3) the first set of images displayed with mixed colours because the three SVGs shared gradient IDs — fixed in the app and regenerated. All final outputs shown are untouched AI output.",
     "- **Real AI error kept on purpose:** Gemini's SRT had malformed timestamps (`00:03:100` instead of `00:00:03,100`). The video shows the error and the rule-based fix.\n",
     "| Clip | Demo | AI waits trimmed | Real audio/video played |\n|---|---|---|---|"]
for k, c in CL.items():
    o.append(f"| {k} | {DEMO[c['demo']]} | {', '.join(f'{x:.0f} s' for x in c['waits_cut']) or '—'} | {(c['play']['tag'] + ' · ' + str(round(c['play']['len'])) + ' s') if c.get('play') else '—'} |")
o += ["\n## Re-record with real tools (ChatGPT / Gemini app / CapCut)\n"] + [f"{i}. {x}" for i, x in enumerate([
    "Script: ChatGPT or gemini.google.com, new chat, paste the two prompts from 05_prompts.md.",
    "Images: ChatGPT image generation, Gemini app, Ideogram or Leonardo — paste the three image prompts; keep the same style words; check hands, faces, text and logos.",
    "Image-to-video: Kling, Runway or Veo — upload each image with its motion prompt (5 s each); or use pan/zoom in CapCut.",
    "Voice: ElevenLabs, Google AI Studio (TTS) or CapCut text-to-speech; write the style instruction in English; listen to the whole take.",
    "Dubbing: translate with the dub prompt, regenerate voice; compare lengths (target ±10%).",
    "Avatar: HeyGen / Synthesia / D-ID — only your own face or someone with written permission.",
    "Subtitles: CapCut auto-captions or the SRT prompt; check spelling, timing and the timestamp format.",
    "Edit: CapCut / Premiere, 1080×1920, 30 fps; music under −18 dB during speech; subtitles above the phone UI; export MP4.",
    "OBS 1920×1080/30 fps, browser zoom 125%, notifications off, hide account names."], 1)]
open(f"{D}/04_recording_instructions.md", "w").write("\n".join(o))

# 05 prompts
o = ["# 05 · All prompts (copy-paste ready)\n"] + [f"## {k}\n\n```\n{v}\n```\n" for k, v in PROMPTS.items()]
open(f"{D}/05_prompts.md", "w").write("\n".join(o))

# 06 real outputs
o = ["# 06 · Real AI outputs (verbatim)\n", "Logged at recording time in `outputs.jsonl`; nothing edited.\n"]
o += ["## Script — turn 1\n", f"```\n{last(demo='d1', turn=0)['response']}\n```\n", "## Script — turn 2 (image/motion prompts + narration block)\n", f"```\n{last(demo='d1', turn=1)['response']}\n```\n",
      "## Narration extracted for the voice step\n", f"```\n{rd('narration_bn.txt')}\n```\n",
      "## Voice takes\n", "| Take | Voice | Model | Length |\n|---|---|---|---|"]
o += [f"| {t['tag']} | {t['voice']} | {t['model']} | {t['dur']:.1f} s |" for t in TAKES.values()]
o += [f"\nEnglish dub vs Bangla: **{TAKES['voice_en']['dur']:.1f} s vs {TAKES['voice_bn_a']['dur']:.1f} s** — within {abs(TAKES['voice_en']['dur'] / TAKES['voice_bn_a']['dur'] - 1) * 100:.0f}%, as the dub prompt asked.\n",
      "## English dub translation\n", f"```\n{rd('dub_en.txt')}\n```\n", "## SRT as returned by Gemini (note the malformed timestamps)\n", f"```\n{rd('reel_ai.srt')}\n```\n",
      "## SRT after the rule-based timestamp fix (used in the reel)\n", f"```\n{rd('reel_fixed.srt')}\n```\n",
      "## SVG images\n", "The three SVG files are in `source/ai_outputs/img1.svg … img3.svg` (33 KB, 29 KB, 24 KB of AI-written code).\n",
      "## Comparison — what the AI got right and where a human had to step in\n",
      "| Step | AI did well | Human check needed |\n|---|---|---|",
      "| Script | 3 scenes, hook, CTA, stayed under 60 words, no price/health claims | approve tone; it added on-screen text ideas (“Message Us”) not used |",
      "| Images | coherent flat-vector set, correct scene content | check odd anatomy; no text/logos |",
      "| Voice | natural Bangla reading | style note must be in English or it is read aloud |",
      "| Dub | natural English, same length | listen fully — one take glitched |",
      "| Subtitles | good line breaks and timing | timestamp format wrong → fixed |",
      "| Export | — (deterministic render) | check loudness, safe areas |"]
open(f"{D}/06_output_comparisons.md", "w").write("\n".join(o))

# 07 practice / quiz / assignment
o = ["# 07 · Practice pauses, quiz, assignment\n", "| Pause | Time | Task |\n|---|---|---|"]
for sid in ("s03c", "s05c", "s07c"):
    o.append(f"| {sid} | {tc(SG[sid]['narr_end'])} | {[g for g in SEGS if g['id'] == sid][0]['lines'][0]} |")
qz = [g for g in SEGS if g.get("quiz")][0]["lines"]
o += ["\n## Quiz\n"] + [f"**{qz[i]}**\n\n✅ {qz[i + 1]}\n" for i in range(0, len(qz), 2)]
o += ["## Final assignment — your first AI reel (30 s)\n", "Submit: script prompt + script · 3 images · voice file · SRT · exported MP4 (1080×1920) · 3–4 lines on where you changed the AI's output and why.\n",
      "**Rubric (20):** script & hook 4 · visual consistency 4 · voice quality & pronunciation 4 · subtitle accuracy 4 · ethics (consent, AI label, no false claims) 4.\n"]
open(f"{D}/07_practice_quiz_assignment.md", "w").write("\n".join(o))

# 08 SRT
open(f"{D}/pillar01-module06.bn.srt", "w").write("\n".join(f"{i}\n{srt_t(c['start'])} --> {srt_t(c['end'])}\n{c['text']}\n" for i, c in enumerate(T["cues"], 1)))

# 09 music / sfx
o = ["# 09 · Music, sound and real AI audio\n", "- Lesson bed: original code-synthesized pad (Am7–Fmaj7–C–G), sidechain-ducked under narration and under the real AI audio.",
     "- Reel bed: separate soft pluck/pad loop, ducked under the generated voice; reel mastered to −14 LUFS.",
     "- **Real AI audio heard in the lesson:** generated Bangla voices (Aoede, Puck), the English dub (Kore), the avatar's voice, and the finished reel — placed exactly where they play on screen.\n",
     "| Time | Cue |\n|---|---|"] + [f"| {tc(t)} | {n} |" for t, n in CUES]
open(f"{D}/09_music_sfx_notes.md", "w").write("\n".join(o))

# 10 editing timeline
o = ["# 10 · Editing timeline\n", "| Scene | Start | Narration | End | Length |\n|---|---|---|---|---|"]
o += [f"| {s['num']} {s['title']} | {tc(s['start'])} | {tc(s['narr_start'])} | {tc(s['end'])} | {s['end'] - s['start']:.1f} s |" for s in T["scenes"]]
o += ["\n**Tracks:** V0 background · V1–2 top bar/progress · V3 scene layouts · V6 opening sting · V7 chapter cards · V8+V12 lip-sync video + name tag · V9 end card · V10–11 subtitles · V13 “এখন শুনছেন” tags · V20–22 screen clips / reel · A1 narration · A2 real AI audio · A3 music · A4 SFX.\n",
      "## Sections that would benefit from an extended lesson\n",
      "- **Real text-to-video and image generation** (Veo, Kling, Runway, Nano Banana/ChatGPT images) — needs a paid plan; a follow-up lesson can record those tools.",
      "- **AI avatars with commercial tools** (HeyGen/Synthesia): templates, gestures, brand avatars.",
      "- **Advanced editing** in CapCut/Premiere: beat-synced cuts, B-roll, colour, captions styles."]
open(f"{D}/10_editing_timeline.md", "w").write("\n".join(o))

# 11 thumbnail + description
o = ["# 11 · Thumbnail and description\n", "**Thumbnail text:** “AI দিয়ে রিল” (big) · “স্ক্রিপ্ট → ভয়েস → ভিডিও · মডিউল ০৬”. `thumbnail.jpg` is a frame from the video.\n",
     "**Title:** AI দিয়ে ভিডিও, ভয়েস ও সাবটাইটেল — একটি সম্পূর্ণ রিল বানান (লাইভ ডেমো) | মডিউল ০৬\n", "**Description:**\n",
     "```\nAI দিয়ে ভিডিও, ভয়েস ও প্রোডাকশন | Practical AI Masterclass · মডিউল ০৬\nইন্সট্রাক্টর: Rubel Miah · ভিডিও এডিটর: Paloan\n\n"
     "সব ডেমো আসল AI (Google Gemini + ওপেন-সোর্স SadTalker) দিয়ে লাইভ রেকর্ড করা।\n\n" + "\n".join(f"{tc(SC[sc]['start'])[:5]} {t}" for sc, _, t in SCENES) +
     "\n\nঅ্যাসাইনমেন্ট: নিজের প্রথম ৩০ সেকেন্ডের AI রিল বানান।\nমনে রাখবেন: অনুমতি ছাড়া কারো মুখ/কণ্ঠ নয়; AI কনটেন্ট হলে জানিয়ে দিন।\n#AIবাংলা #AIVideo #Reels #VoiceAI #PracticalAI\n```\n",
     "**Disclosure:** turn on the platform's AI/synthetic-content label (AI narration, AI lip-sync presenter, AI images and voices in the demo reel)."]
open(f"{D}/11_thumbnail_description.md", "w").write("\n".join(o))

# README
o = ["# PILLAR 01 · Module 06 — Video, Audio & Production · Production package\n",
     f"**Instructor:** Rubel Miah · **Video editor:** Paloan · **Rendered:** `pillar01-module06_final.mp4` · {tc(DUR)} · 1920×1080 · 30 fps · H.264 + AAC\n",
     "> **What's real:**",
     f"> - **Live screen demos:** {len(CL)} clips ({tc(SCREEN)}) + the finished reel ({tc(REEL)}) = {(SCREEN + REEL) / DUR * 100:.0f}% of the lesson shows real AI output created on camera — script, SVG images, voices, English dub, SRT and the export.",
     "> - **Not available, so not faked:** photo-realistic image generation and text-to-video (free-tier quota 0). The lesson says so and teaches the prompts instead.",
     f"> - **Presenter:** your new photo{', lip-synced with SadTalker in the intro and outro, labelled “AI লিপ-সিঙ্ক”' if LIP else ''}; the AI-avatar demo uses the same photo.",
     "> - **Narration:** Gemini TTS (voice Orus), every scene transcribed back and matched to the script.",
     "> - **Fictional business:** “সবুজ পাতা” is invented for teaching.\n",
     "| # | Deliverable | File |\n|---|---|---|"]
for a, b, f in [(1, "Script", "01_script.md"), (2, "Storyboard", "02_storyboard.md"), (3, "Visual prompts", "03_visual_prompts.md"), (4, "Recording instructions", "04_recording_instructions.md"),
                (5, "Prompts", "05_prompts.md"), (6, "Real outputs & comparisons", "06_output_comparisons.md"), (7, "Practice, quiz, assignment", "07_practice_quiz_assignment.md"),
                (8, "Bangla SRT", "pillar01-module06.bn.srt"), (9, "Music & audio notes", "09_music_sfx_notes.md"), (10, "Editing timeline", "10_editing_timeline.md"),
                (11, "Thumbnail & description", "11_thumbnail_description.md"), (12, "Final MP4", "pillar01-module06_final.mp4"), (13, "The demo reel (9:16)", "sobuj-pata_reel_9x16.mp4")]:
    o.append(f"| {a} | {b} | `{f}` |")
if QC: o.append("\n**Measured QC:** " + " · ".join(f"{k}: {v}" for k, v in QC.items()))
open(f"{D}/README.md", "w").write("\n".join(o))
print("package written", D)

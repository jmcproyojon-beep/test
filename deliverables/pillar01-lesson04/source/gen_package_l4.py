"""Generate the Lesson 04 production package (Sections A–G) from the script + real timeline."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l4_script import SCENES, WEAK, STRONG, FORMULA

P = "/home/user/test/projects/pillar01-lesson04"
T = json.load(open(f"{P}/artifacts/timing.json"))
MAN = json.load(open(f"{P}/artifacts/tts_manifest.json"))
QC = json.load(open(f"{P}/artifacts/qc.json")) if os.path.exists(f"{P}/artifacts/qc.json") else {}
LIP = json.load(open(f"{P}/artifacts/lipsync_scenes.json")) if os.path.exists(f"{P}/artifacts/lipsync_scenes.json") else []
SC = {s["id"]: s for s in T["scenes"]}
DUR = T["video_duration"]
SIZE = QC.get("master_size", "")
TEMPO = QC.get("tempo", "0.95")


def tc(x):
    m, s = divmod(x, 60)
    return f"{int(m):02d}:{s:04.1f}"


models = sorted({v["model"] for v in MAN.values()})
out = []
w = out.append
w("# LESSON 04 — Writing, Content & Communication (AI দিয়ে লেখা, content ও communication)")
w("## Production Package · AI Fundamentals (বাংলা)\n")
w(f"**Rendered file:** `pillar01-lesson04_final.mp4` (master{', ' + SIZE if SIZE else ''}) · **Measured duration:** {tc(DUR)} ({DUR:.1f} s) · 1920×1080 · 30 fps · H.264 + AAC\n")
w("> **What's real here:** the MP4 was actually rendered and checked.")
w(f"> - **Topic source:** the module card you sent (Module 04 — Writing, Content & Communication): email · report · proposal · script; blog · caption · ad copy; translation & editing; content workflow idea → publish; outcome: your own AI Content Engine. This replaces the earlier PILLAR 01 syllabus's Lesson 04 (prompt engineering). The lesson's writing formula covers the core prompt skills.")
w(f"> - **Narration:** Gemini text-to-speech `{models[0]}`, prebuilt male voice **Orus** (same as Lesson 03), one model for all 12 scenes. Every take was transcribed and compared to the script (Section G).")
if LIP:
    w(f"> - **Instructor:** your photo, lip-synced with the open-source SadTalker model in scenes {', '.join(x[1:] for x in LIP)} and labelled \"AI লিপ-সিঙ্ক\" on screen.")
else:
    w("> - **Instructor:** your photo as a still portrait (lip-sync not included in this render).")
w("> - **Examples on screen** (sample email, captions, script rows, translation, CV edit) are clearly labelled samples/illustrations (\"নমুনা\", \"প্রতীকী\"), not real screenshots or outputs from a specific tool.\n")
w("**Visual identity:** the warm studio palette and presenter introduced in Lesson 03 (charcoal #0e0b09, amber #ffa24c, teal #2dd4bf), kept for series consistency.\n")

# ---------------- A
w("---\n## SECTION A — Lesson metadata\n")
w(f"| Field | Value |\n|---|---|\n| Lesson | Lesson 04 — Writing, Content & Communication |\n| Planned duration | 10:00 |\n| Rendered duration | **{tc(DUR)}** |\n| Format | 16:9 · 1920×1080 · 30 fps · H.264 MP4 · Bangla burned-in subtitles + SRT |\n| Audience | Absolute beginners in Bangladesh: students, job seekers, freelancers, content creators, small business owners |\n| Language | Bangla (standard Bangladeshi), English terms kept where commonly used |\n| Instructor | Rubel Miah |\n| Video editor | Paloan |")
w("\n**Learning objectives:** by the end, the learner can:")
for o in ["write any writing prompt with the six-part formula: task, reader, purpose, tone, length, format;",
          "draft and check professional emails, structured reports and freelance/business proposals with AI, keeping facts, prices and deadlines their own;",
          "plan a short-video script (hook, body, CTA) with time, words and visuals;",
          "write blogs outline-first, add first-hand experience, use keywords naturally and fact-check;",
          "produce caption variations and honest ad copy (problem, benefit, proof, CTA) without false claims;",
          "translate Bangla↔English with context and tone, verify with back-translation, and know when a professional is required;",
          "use AI to edit their own writing while keeping their voice, asking for a list of changes;",
          "run an idea → publish content workflow with human checkpoints and repurposing, and build a personal AI Content Engine."]:
    w(f"- {o}")
w("\n**Prerequisites:** basic familiarity with any AI assistant (Lesson 03). You'll need a free ChatGPT, Gemini or Claude account and a document/spreadsheet tool (e.g. Google Docs/Sheets).\n")
w("**Expected learning outcomes:** a personal AI Content Engine document (brand voice card, prompt template library, weekly content calendar, pre-publish checklist) and one week of content produced with it: 1 blog, 3 captions, 1 Reel script, 1 email.\n")

# ---------------- B
w("---\n## SECTION B — Full narration script (Bangla)\n")
w("Every word below is exactly what the narrator says in the rendered video.\n")
for s in SCENES:
    t = SC[s["id"]]
    w(f"### {s['num']} · {s['title']}  `{tc(t['narr_start'])}–{tc(t['narr_end'])}`\n")
    for l in s["lines"]:
        w(f"{l}  ")
    w("")

# ---------------- C
w("---\n## SECTION C — Timecoded storyboard\n")
w("Times are measured from the rendered timeline. From scene 02 on, each scene opens with a short chapter card.\n")
rec = {"email": "Optional 8–12 s capture of the strong email prompt sent in a real assistant (Section E, shot 1–3), replacing the right-hand illustrated panel.",
       "captionad": "Optional capture of the caption-variations prompt and the real three-option answer (Section E, shot 4).",
       "translate": "Optional capture of the translation + back-translation check (Section E, shot 5).",
       "editing": "Optional capture of the edit-with-change-list prompt on the learner's own paragraph (Section E, shot 6)."}
for s in SCENES:
    t = SC[s["id"]]
    ls = [L for L in T["lines"] if L["scene"] == s["id"]]
    w(f"### Scene {s['num']} — {s['title']}  ·  {tc(t['start'])} → {tc(t['end'])}\n")
    w(f"- **Teaching objective:** {s['objective']}")
    w(f"- **Visual:** {s['visual']}")
    w(f"- **Camera:** {s['camera']}")
    w(f"- **Animation:** {s['animation']}")
    w(f"- **On-screen text:** " + " · ".join(f"\"{x}\"" for x in s["onscreen"]))
    w(f"- **Transition in:** {'Fade from black, logo sting' if s['id'] == 's01' else 'Amber chapter card → scene'}; previous scene fades out over 0.3 s.")
    w(f"- **Sound:** {s['sound']}")
    w(f"- **Screen-recording shot:** {rec.get(s['type'], 'none (animated scene).')}")
    w("\n| Time | Voiceover (spoken) |\n|---|---|")
    for L in ls:
        w(f"| {tc(L['start'])}–{tc(L['end'])} | {L['text']} |")
    w("")

# ---------------- D
w("---\n## SECTION D — Animation prompts (AI video generation, optional B-roll / upgrades)\n")
w("**Shared style:** \"16:9, 1920×1080, 30 fps, premium 2.5D/3D educational motion graphics, warm studio look: deep charcoal background with a faint grid, Edison-bulb amber (#ffa24c) key light and teal (#2dd4bf) accents, frosted dark-glass panels, calm camera, no on-screen text (added in edit), no brand logos, no real people.\"\n")
prompts = {
 "s01": "Slow push-in to a cosy creator desk at dusk; floating glass cards (envelope, document, film strip, megaphone, translation glyph) drift into a neat row and light amber one by one.",
 "s02": "Six coloured glass tiles drop from above and lock into a horizontal row with a soft bounce, then pulse together; a warm banner rises beneath.",
 "s03": "Split screen: on the left a generic letter full of blinking empty brackets; on the right a prompt bar types and coloured highlights sweep over its phrases, then a crisp finished email card slides in with a green tick.",
 "s04": "Two stacks of glass blocks build upward in parallel (report and proposal); a red tag stamps onto the top block of the right stack.",
 "s05": "A horizontal timeline bar fills in three coloured segments, then a three-column script table types row by row; a microphone icon pulses.",
 "s06": "An outline of short lines expands into paragraphs; a yellow sticky note slaps onto the corner; five headline bars slide in.",
 "s07": "Three smartphone mockups rise with different caption bubbles; on the right a four-step ladder lights up; a red warning banner gives a short shake.",
 "s08": "A Bangla sentence card morphs letter by letter into an English card across an arrow; a tone dial turns; four check badges pop.",
 "s09": "A paragraph receives red strikethroughs and green insertions word by word; a small change-log card slides up.",
 "s10": "Seven glass stages light up left to right along a pipeline; two stages get green person badges; one card fans out into five smaller cards.",
 "s11": "Four glass modules slide into a central machine whose gear turns; four output cards fan out below.",
 "s12": "Six green check marks light up beside a presenter frame; a star badge appears; gentle pull-back to the end card.",
}
for s in SCENES:
    w(f"**{s['num']} · {s['title']} ({tc(SC[s['id']]['start'])}–{tc(SC[s['id']]['end'])}):** {prompts[s['id']]}\n")

# ---------------- E
w("---\n## SECTION E — Screen recording guide (optional real captures)\n")
w("**Application:** any one official assistant: ChatGPT (`chatgpt.com`), Gemini (`gemini.google.com`) or Claude (`claude.ai`), in Chrome/Edge on a computer, signed in, new chat. Describe only what appears on your screen; wording varies every time.\n")
w("**Before recording:** separate browser profile, sidebar/history hidden or blurred, name/email/avatar hidden, zoom 110–125%, 1920×1080 at 30 fps, notifications off. Never paste real client data, passwords, NID or bank details; use the sample details below.\n")
w("| # | Shot | Exact prompt to type | What to show / explain | Highlight |\n|---|---|---|---|---|")
shots = [
 ("Weak email", WEAK, "Generic answer with placeholders such as [Name]", "Red circles on placeholders"),
 ("Strong email", STRONG, "A specific, nearly ready email; point at each formula part in the prompt", "Colour-underline the six parts"),
 ("Check before sending", "(no prompt) Read the email aloud; check name, date, numbers, tone, attachment mention", "Fix anything the AI invented", "Green ticks"),
 ("Caption variations", "ঢাকার একটি পোশাকের ফেসবুক পেজের নতুন ঈদ কালেকশনের জন্য তিনটি ক্যাপশন দাও: একটি মজার, একটি আবেগী, একটি সরাসরি অফারের। প্রতিটি দুই লাইনের মধ্যে, সহজ বাংলায়।", "Three options; pick one and edit it", "Box the chosen one"),
 ("Translation + back-translation", "এটি একজন বিদেশি ক্রেতার জন্য ভদ্র ও পেশাদার ইংরেজিতে অনুবাদ করো, আক্ষরিক নয়: \"আপনার অর্ডারটি আগামীকাল পাঠানো হবে। দেরির জন্য আমরা দুঃখিত।\" (then) এই ইংরেজি লেখাটি বাংলায় অনুবাদ করো।", "Meaning preserved? Names/numbers intact?", "Side-by-side zoom"),
 ("Edit with change list", "নিচের লেখার শুধু ব্যাকরণ ও বানান ঠিক করো, আমার কণ্ঠ আর অর্থ বদলাবে না, আর শেষে কী কী বদলেছ তার তালিকা দাও: [your own paragraph]", "Accept/reject each change", "Highlight the change list"),
]
for i, (a, b, c, d) in enumerate(shots, 1):
    w(f"| {i} | {a} | `{b}` | {c} | {d} |")
w("\n**Expected responses (what to look for, not fixed text):** the weak email returns a template with placeholders. The strong email returns a short English email with a subject line, a greeting, mention of the first logo draft and a request for feedback by Friday. Captions return three short Bangla options in the requested tones. The translation returns natural English, and the back-translation should preserve the meaning. The edit returns corrected text plus a numbered change list.\n")
w("**Common errors and troubleshooting:**\n")
w("| Problem | Fix |\n|---|---|")
for a, b in [("Answer ignores the word limit", "Follow up: \"১০০ শব্দের মধ্যে আনো\" (be specific)."),
             ("Tone feels robotic", "Give a sample of your own writing: \"এই ধাঁচে লেখো\"."),
             ("AI invents prices, dates or claims", "Delete them; provide the real facts in the prompt; ask \"কোন তথ্য অনুমান করেছ, চিহ্নিত করো\"."),
             ("Translation too literal", "Add the reader and tone, and say \"আক্ষরিক নয়, স্বাভাবিক ভাষায়\"."),
             ("Edit changed your meaning", "Say \"শুধু ব্যাকরণ ঠিক করো, অর্থ ও কণ্ঠ বদলাবে না\" and request a change list."),
             ("Usage limit on a free plan", "Wait for the reset or switch assistants; don't buy shared accounts.")]:
    w(f"| {a} | {b} |")
w("\n**Privacy precautions:** remove client names, contract terms, phone numbers and any personal or confidential data before pasting. Never paste passwords, NID or banking details.\n")

# ---------------- F
w("---\n## SECTION F — Student activities\n")
w("### Assignment · Build your AI Content Engine\n")
w("**Instructions (step by step):**")
for i, x in enumerate(["Create one document titled \"আমার AI Content Engine\".",
                       "**Brand voice card:** who you or your business are; your readers; 3 words that describe your tone; words you use and words you never use; one sample paragraph in your own voice.",
                       "**Prompt template library:** write 4 reusable prompts using the formula (task · reader · purpose · tone · length · format) for: an email, a Facebook caption, a blog outline, a 60-second Reel script. Mark the parts you'll change each time with [brackets].",
                       "**Weekly content calendar:** a 7-row table (day · platform · content type · topic · status).",
                       "**Pre-publish checklist:** facts and numbers verified · names/dates checked · no false claims · my voice kept · AI disclosure where the platform requires it · no private data.",
                       "Use the engine to produce one week of content: 1 blog (outline first), then repurpose it into 3 captions, 1 Reel script and 1 email.",
                       "Write two lines: where you had to change the AI's writing, and why."], 1):
    w(f"{i}. {x}")
w("\n**Expected deliverable:** the engine document plus the six pieces of content and your two-line reflection.\n")
w("**Self-assessment checklist:**")
for x in ["ব্র্যান্ড ভয়েস কার্ডে নিজের লেখার নমুনা দিয়েছি?", "চারটি টেমপ্লেটেই ছয় অংশের ফর্মুলা আছে?", "ব্লগ আগে আউটলাইন করে লিখেছি, নিজের অভিজ্ঞতা যোগ করেছি?",
          "ক্যাপশন/বিজ্ঞাপনে কোনো মিথ্যা দাবি নেই?", "প্রতিটি তথ্য ও সংখ্যা যাচাই করেছি?", "কোনো ব্যক্তিগত বা গোপন তথ্য দিইনি?"]:
    w(f"- [ ] {x}")
w("\n**Common mistakes:** asking for a whole blog in one prompt · publishing AI text without reading it · letting AI set prices or deadlines · fake urgency or guarantees in ads · literal translation for customers · edits that erase the writer's own voice · no human check before publishing.\n")
w("**Model answer (excerpt):**\n")
w("*Brand voice card:* \"রাজশাহীর হাতে বানানো নকশিকাঁথার অনলাইন শপ। পাঠক: ২৫–৪৫ বছরের শহুরে ক্রেতা, যাঁরা ঐতিহ্য ভালোবাসেন। টোন: উষ্ণ, সৎ, গর্বিত। ব্যবহার করি: হাতে বানানো, কারিগর, যত্ন। ব্যবহার করি না: সবচেয়ে সস্তা, শতভাগ গ্যারান্টি।\"\n")
w("*Caption template:* \"[পণ্যের নাম]-এর জন্য তিনটি ফেসবুক ক্যাপশন লেখো — পাঠক: [পাঠক], উদ্দেশ্য: [অর্ডারের জন্য ইনবক্স], টোন: [উষ্ণ ও সৎ], প্রতিটি দুই লাইনে, শেষে একটি কল-টু-অ্যাকশন। আমার ব্র্যান্ড ভয়েস: [কার্ড থেকে পেস্ট]।\"\n")
w("*Reflection example:* \"AI 'সারা দেশে ২৪ ঘণ্টায় ডেলিভারি' লিখেছিল — আমাদের এমন সার্ভিস নেই, তাই কেটে দিয়েছি। আর ব্লগে নিজের কারিগরের গল্প যোগ করেছি, যা AI জানত না।\"\n")
w("**Evaluation rubric (20 points):**\n")
w("| Criterion | 4–5 Excellent | 2–3 Developing | 0–1 Needs work |\n|---|---|---|---|")
for r in [("Engine completeness (5)", "All 4 parts present and specific", "1–2 parts thin", "Parts missing"),
          ("Template quality (5)", "All 4 templates use the full formula with clear [slots]", "Formula partly used", "Vague prompts"),
          ("Content quality (5)", "6 pieces on-brand, in the writer's voice, repurposed from one blog", "Some pieces generic", "Incomplete"),
          ("Accuracy & ethics (5)", "Facts verified, no false claims, private data removed, honest reflection", "Minor issues", "Unverified / misleading")]:
    w("| " + " | ".join(r) + " |")

# ---------------- G
w("\n---\n## SECTION G — Video post-production\n")
w(f"**Subtitles:** `pillar01-lesson04.bn.srt`, {len(T['cues'])} cues, burned in (Hind Siliguri Bold 42 px, warm white on charcoal, amber for English terms and numbers) and supplied as an SRT.\n")
w("**Voiceover pacing (measured per take):**\n")
w("| Scene | Model | Duration | Pace (chars/s) | Script match |\n|---|---|---|---|---|")
for k, v in MAN.items():
    w(f"| {k} | {v['model']} | {v['dur']:.1f} s | {v['cps']} | {v['ratio']:.2f} |")
w(f"\nRaw-take figures. In the edit every take was time-stretched ×{TEMPO} (pitch preserved) and normalized to −18 LUFS per take before the mix. Match scores below 1.00 mostly come from the transcriber writing English terms in Latin script.\n")
w("**Music and sound effects:** the Lesson 03 warm bed (original, code-synthesized), about 20 dB under the voice, sidechain-ducked. Sound effects: logo sting, chapter whooshes, formula-tile drops (02), keyboard taps on the prompts and a soft chime on the strong result (03), caption notification pops and a low warning tone on false claims (07), pipeline ticks (10), engine output pops (11), and a recap chime.\n")
w("**Highlights and zooms:** formula tiles pulse (02); placeholders blink and the strong prompt's six parts colour in (03); a red price tag stamps on (04); script segments fill (05); a sticky note slaps on (06); the false-claim banner shakes (07); the translation morphs and the tone dial turns (08); tracked changes appear word by word (09); human checkpoints pulse (10); the engine gear turns (11).\n")
if LIP:
    w(f"**Lip-sync:** scenes {', '.join(x[1:] for x in LIP)} use SadTalker (open source, local CPU) driven by the exact narration audio, labelled \"AI লিপ-সিঙ্ক\".\n")
w("**Credits (end card, final 3 s):** ইন্সট্রাক্টর (Instructor): **Rubel Miah** · ভিডিও এডিটর (Video Editor): **Paloan**.\n")
w("**Thumbnail title:** \"AI দিয়ে লেখা — ইমেইল থেকে বিজ্ঞাপন\" · subline \"নিজের AI Content Engine · লেসন ০৪\". Layout: presenter photo left 40%, a stack of content cards (email, caption, script) on the right, amber glow.\n")
w("**Video description:**\n")
w("```\nAI দিয়ে লেখা, কনটেন্ট ও কমিউনিকেশন | ইমেইল, প্রপোজাল, ব্লগ, ক্যাপশন, অনুবাদ | লেসন ০৪ (বাংলা)\n\nএই লেসনে শিখবেন:\n00:00 স্বাগতম\n" + "\n".join(f"{tc(SC[s['id']]['start'])[:5]} {s['title']}" for s in SCENES[1:]) +
  "\n\nঅ্যাসাইনমেন্ট: নিজের AI Content Engine বানিয়ে এক সপ্তাহের কনটেন্ট তৈরি করুন।\nমনে রাখবেন: AI খসড়া দেয় — তথ্য, দাম ও সিদ্ধান্ত আপনার। মিথ্যা দাবি নয়, ব্যক্তিগত তথ্য নয়।\n#AIবাংলা #ContentWriting #ChatGPT #Freelancing #DigitalMarketing\n```\n")
w("**Export settings:** H.264 High, 1920×1080, 30 fps CFR, yuv420p (master CRF 18), AAC-LC 192 kbps 48 kHz stereo, fast-start; −14 LUFS integrated, true peak ≤ −1 dBTP.\n")
if QC:
    w("**Measured QC on the delivered file:** " + " · ".join(f"{k}: {v}" for k, v in QC.items() if k not in ("tempo", "master_size")) + "\n")
w("**Before publishing:** optionally replace the illustrated email panel with a real capture (Section E) · listen once for pronunciation of English terms · turn on the platform's AI-generated content label (AI narration" + (" and lip-sync" if LIP else "") + ") · add the SRT as Bangla captions.\n")
open(f"{P}/deliverables/PRODUCTION_PACKAGE.md", "w").write("\n".join(out))
print("package lines", len(out))

"""Generate the Lesson 03 production package (Sections A–G) from the script + real timeline."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l3_script import SCENES, PROMPT

P = "/home/user/test/projects/pillar01-lesson03"
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
w("# PILLAR 01 · LESSON 03 — Essential AI Tools & Platforms")
w("## Production Package · AI Fundamentals & Digital Literacy (বাংলা)\n")
w(f"**Rendered file:** `pillar01-lesson03_final.mp4` (master{', ' + SIZE if SIZE else ''}) · **Measured duration:** {tc(DUR)} ({DUR:.1f} s) · 1920×1080 · 30 fps · H.264 + AAC\n")
w("> **What's real here:** the MP4 was actually rendered and checked.")
w(f"> - **Narration:** Gemini text-to-speech `{models[0]}`, prebuilt male voice **Orus**, one model for all 12 scenes. Each take was transcribed with Gemini and compared to the script (scores in Section G).")
if LIP:
    w(f"> - **Instructor:** your new photo, animated with the open-source SadTalker model to lip-sync the narration in scenes {', '.join(x[1:] for x in LIP)} (labelled \"AI লিপ-সিঙ্ক\" on screen). Other scenes use motion graphics only.")
else:
    w("> - **Instructor:** your new photo as a still portrait with a slow push-in (intro and recap). It is **not lip-synced**: commercial lip-sync services are blocked in this production environment. See Section G for how to add lip-sync.")
w("> - **Tool demo (scene 11):** the three chat panels are labelled illustrations (\"প্রতীকী — আসল স্ক্রিনশট নয়\"), and the score table is labelled as an example. This environment can't reach chatgpt.com, gemini.google.com or claude.ai. Record the real comparison with Section E and replace the panels before publishing.")
w("> - **Prices:** quoted only as an October 2026 US reference (~$20/month for each main paid plan, from multiple pricing guides that agree). Model names and limits are deliberately not quoted, because sources disagree and they change often. Check the official pricing pages before publishing.\n")
w("**Visual identity change (requested):** Lesson 03 introduces a warm studio palette: deep charcoal (#0e0b09), Edison-bulb amber (#ffa24c) and plant-green teal (#2dd4bf). It's taken from your new photo, and the layout system and typography are kept from Lessons 01–02.\n")

# ---------------- A
w("---\n## SECTION A — Lesson metadata\n")
w(f"| Field | Value |\n|---|---|\n| Lesson | PILLAR 01 · Lesson 03 — Essential AI Tools & Platforms (প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম) |\n| Planned duration | 10:00 |\n| Rendered duration | **{tc(DUR)}** |\n| Format | 16:9 · 1920×1080 · 30 fps · H.264 MP4 · Bangla burned-in subtitles + SRT |\n| Audience | Absolute beginners in Bangladesh: students, content creators, freelancers, job seekers, small business owners |\n| Language | Bangla (standard Bangladeshi), English tool names kept as-is |")
w("\n**Learning objectives:** by the end, the learner can:")
for o in ["name the six families of AI tools (text, image, video, audio, coding, research) and give one example and one use for each;",
          "describe ChatGPT, Google Gemini and Claude: who makes them, where to access them officially, and what each is commonly good for;",
          "explain the difference between free and paid plans without relying on figures that may be out of date, and avoid shared-account scams;",
          "apply four questions (what to make · Bangla quality · need for recent info or sources · budget & privacy) to choose a tool;",
          "run a fair side-by-side test of three assistants with one prompt and a four-criterion score."]:
    w(f"- {o}")
w("\n**Prerequisites:** Lessons 01–02 help but aren't required. You'll need a smartphone or computer with internet, plus free accounts (or the willingness to create them) on ChatGPT, Gemini and Claude.\n")
w("**Expected learning outcomes:** a completed three-tool comparison (screenshots + score table + a two-line verdict) and a personal shortlist of one tool per task family.\n")

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
w("Times are measured from the rendered timeline. From scene 02 on, each scene opens with a short chapter card before the narration starts.\n")
for s in SCENES:
    t = SC[s["id"]]
    ls = [L for L in T["lines"] if L["scene"] == s["id"]]
    w(f"### Scene {s['num']} — {s['title']}  ·  {tc(t['start'])} → {tc(t['end'])}\n")
    w(f"- **Teaching objective:** {s['objective']}")
    visual = s["visual"]
    if s["id"] in ("s01", "s12") and s["id"] not in LIP:
        visual = visual.replace("(lip-synced talking portrait)", "(still portrait, slow push-in)").replace("Lip-synced presenter returns", "Presenter photo returns")
    w(f"- **Visual:** {visual}")
    w(f"- **Camera:** {s['camera']}")
    w(f"- **Animation:** {s['animation']}")
    w(f"- **On-screen text:** " + " · ".join(f"\"{x}\"" for x in s["onscreen"]))
    w(f"- **Transition in:** {'Fade from black, logo sting' if s['id'] == 's01' else 'Amber chapter card (number scales in, title rises, underline draws) → card fades to the scene'}; previous scene fades out over 0.3 s.")
    w(f"- **Sound:** {s['sound']}")
    if s["type"] == "compare":
        w("- **Screen-recording shot:** replace the three illustrated panels with real captures from Section E (one per assistant, same prompt, new chat). Keep the prompt card and the score table, and fill the table with the learner's or presenter's real scores.")
    elif s["type"] == "assistant":
        w("- **Screen-recording shot (optional):** a 4–6 s capture of the assistant's official home page (signed in, personal details hidden) over the capability card (Section E, part 2).")
    else:
        w("- **Screen-recording shot:** none (animated scene).")
    w("\n| Time | Voiceover (spoken) |\n|---|---|")
    for L in ls:
        w(f"| {tc(L['start'])}–{tc(L['end'])} | {L['text']} |")
    w("")

# ---------------- D
w("---\n## SECTION D — Animation prompts (AI video generation, optional B-roll / upgrades)\n")
w("**Shared style for every prompt:** \"16:9, 1920×1080, 30 fps, premium 2.5D/3D educational motion graphics, warm studio look: deep charcoal (#0e0b09) background with a faint grid, Edison-bulb amber (#ffa24c) key light and plant-green teal (#2dd4bf) accents, frosted dark-glass panels with soft warm glow, calm confident camera moves, no on-screen text (added in edit), no brand logos, no real people.\"\n")
prompts = {
 "s01": "Slow push-in into a cosy creator studio desk at dusk: warm hanging bulbs, a plant, floating frosted-glass panels assemble into a six-step path that lights amber one by one.",
 "s02": "Six frosted-glass tiles flip into a 3×2 grid, each with a simple 3D icon (page, picture frame, film camera, sound wave, code brackets, magnifier), lighting amber in turn; static wide shot.",
 "s03": "Left: a glowing page writes itself into neat paragraphs. Right: a magnifier sweeps over floating web cards and small link chips attach to an answer card; gentle lateral move.",
 "s04": "A text bar types itself, then four soft watercolour paddy-field sunsets bloom from blur into focus; on the right a film strip scrolls with a play button pulsing; slow left-to-right dolly.",
 "s05": "An amber sound wave pulses into a microphone icon, then a dark code editor where a faint ghost-text line turns solid as a key is pressed; macro framing, shallow depth of field.",
 "s06": "A brand-neutral rounded-square badge floats beside five capability chips popping in (text, image, file, voice, globe); calm push-in.",
 "s07": "A teal badge with four small app chips orbiting it slowly (mail, document, folder, phone); soft rotation, warm rim light.",
 "s08": "A stack of document pages compresses into a single glowing summary card with a green check; slight push-in.",
 "s09": "Two frosted columns build row by row (free vs paid), a reference price strip slides up, then a red warning banner gives a short shake.",
 "s10": "Four question cards flip in a 2×2 grid, then five pill shapes connect with drawn arrows into a decision path; static camera.",
 "s11": "A prompt card types itself, three identical brand-neutral chat windows fill with placeholder lines in parallel, then rows of rating dots fill in; wide shot with a slow push on the table.",
 "s12": "Six green check marks light up beside a presenter frame, then the camera pulls back to the end card; warm music swell.",
}
for s in SCENES:
    w(f"**{s['num']} · {s['title']} ({tc(SC[s['id']]['start'])}–{tc(SC[s['id']]['end'])}):** {prompts[s['id']]}\n")

# ---------------- E
w("---\n## SECTION E — Screen recording guide\n")
w("### Part 1 · Three-assistant comparison (replaces scene 11's panels)\n")
w("**Applications (official only):** ChatGPT at `https://chatgpt.com`, Google Gemini at `https://gemini.google.com`, Claude at `https://claude.ai`, in Chrome or Edge on a computer. Anthropic's official supported-countries page lists Bangladesh for Claude. Interfaces change often, so describe only what you actually see on recording day.\n")
w("**Before recording (privacy and setup):**")
for x in ["Use a separate browser profile with three tabs only, one per assistant, already signed in. Never record a login or password step.",
          "Start a **new, empty chat** in each so earlier conversations don't affect the answer or appear on screen.",
          "Collapse or blur the sidebars (chat history), your name, email and profile picture.",
          "Browser zoom 110–125%, 1920×1080, 30 fps, cursor visible; notifications off. Recorder: OBS Studio (free) or the built-in Windows/macOS recorder.",
          "Use the default model on each free plan and say so on screen (\"ফ্রি প্ল্যান, ডিফল্ট মডেল\"), so the comparison stays honest. Don't name model versions unless the screen shows them."]:
    w(f"- {x}")
w("\n**Shot list (matches scene 11):**\n")
w("| # | Action on screen | Narration at that moment | Highlight / zoom |\n|---|---|---|---|")
rows = [("Show all three tabs, then open ChatGPT's new chat.", "\"এবার হাতে-কলমে তুলনা…\"", "Label 'একই প্রম্পট · তিনটি টুল'."),
        ("Paste the prompt below into ChatGPT and send; let the full answer appear.", "The narrator reads the prompt.", "Zoom 115% on the input, then on the answer."),
        ("Repeat in Gemini (new chat), then in Claude (new chat), with the exact same prompt.", "\"সবার জন্য একই প্রম্পট আর নতুন চ্যাট…\"", "Split-screen the three answers for 3 s."),
        ("Count the words of each answer (paste into a word counter, or count on screen).", "\"নির্দেশনা মানা, যেমন শব্দসীমা…\"", "Show the count; red mark if over 50."),
        ("Point at Bangla phrasing, the call-to-action line, and any invented detail (fake discount %, address, phone number).", "Scoring criteria.", "Amber circle on any invented detail."),
        ("Fill the score table on screen (spreadsheet or the video's table).", "\"জমা দিন — তিনটি উত্তরের স্ক্রিনশট…\"", "Dots fill as you score.")]
for i, (a, b, c) in enumerate(rows, 1):
    w(f"| {i} | {a} | {b} | {c} |")
w(f"\n**Prompt to paste (exactly):**\n\n```\n{PROMPT}\n```\n")
w("**Expected response (what to look for, not a fixed text):** a short Bangla Facebook post (around 30–60 words) announcing an Eid offer for a small online clothing shop, often with emoji, a festive greeting, a short benefit line and a call to action such as \"এখনই মেসেজ করুন\" or \"অর্ডার করতে ইনবক্স করুন\". Answers vary every time. Watch for invented specifics (a discount percentage, delivery promise, shop name or phone number you didn't give). Those should lose points under \"ভুল তথ্য\".\n")
w("### Part 2 (optional) · Official home pages (inserts for scenes 06–08)\n")
w("Record 4–6 s of each assistant's signed-in home screen, with personal details hidden, to place over the capability card. Show the address bar so viewers see the official domain.\n")
w("**Common errors and troubleshooting:**\n")
w("| Problem | Fix |\n|---|---|")
for a, b in [("Answer is in English", "Follow up: \"বাংলায় লিখুন\". Note it in the score (instruction-following)."),
             ("Answer is far over 50 words", "Don't re-prompt for the comparison: score it as is. Optionally show a follow-up \"৫০ শব্দের মধ্যে আনুন\" as a bonus."),
             ("Usage limit message on a free plan", "Wait for the reset, or record that tool later. Don't buy a plan just for the lesson."),
             ("Assistant asks to connect Gmail/Drive", "Decline for this exercise; it isn't needed."),
             ("Look-alike apps or sites", "Use only chatgpt.com, gemini.google.com, claude.ai or the publishers' official apps.")]:
    w(f"| {a} | {b} |")
w("\n**Privacy precautions (say them on camera too):** never paste passwords, NID numbers, bank/mobile-banking details, customer lists or confidential documents. Blur names and emails in screenshots before sharing.\n")

# ---------------- F
w("---\n## SECTION F — Student activities\n")
w("### Assignment · One prompt, three assistants\n")
w("**Instructions (step by step):**")
for i, x in enumerate(["Open ChatGPT, Gemini and Claude (official sites/apps), each in a new chat.",
                       f"Paste exactly: \"{PROMPT}\"",
                       "Screenshot each answer (hide your name/email).",
                       "Score each answer 1–5 on: Bangla quality · instruction-following (≤50 words, simple Bangla, ends with a call to action) · creativity · no false or invented information.",
                       "Write two lines: which tool you'd use for this kind of task, and why.",
                       "Bonus: make a shortlist of one tool per family (text, image, video, audio, coding, research) that fits your own work, and note whether you'd use its free or paid plan."], 1):
    w(f"{i}. {x}")
w("\n**Expected deliverable:** three screenshots, a 3×4 score table with totals, and a two-line verdict (plus the optional six-family shortlist).\n")
w("**Self-assessment checklist:**")
for x in ["তিনটি টুলেই হুবহু একই প্রম্পট দিয়েছি?", "প্রতিটিতে নতুন চ্যাট ব্যবহার করেছি?", "শব্দ গুনে নির্দেশনা মানা যাচাই করেছি?",
          "বানানো তথ্য (ছাড়ের হার, ফোন নম্বর ইত্যাদি) খুঁজে দেখেছি?", "স্ক্রিনশটে ব্যক্তিগত তথ্য ঢেকেছি?"]:
    w(f"- [ ] {x}")
w("\n**Common mistakes:** changing the prompt between tools · continuing an old chat · judging only by length or emoji · ignoring invented details · declaring one tool 'best at everything' from a single test.\n")
w("**Model answer (illustrative scoring; real results vary by day and plan):**\n")
w("| Tool | Bangla quality | Instruction-following | Creativity | No false info | Total /20 | Note |\n|---|---|---|---|---|---|---|")
for r in [("ChatGPT", "4", "4", "4", "5", "17", "Natural Bangla, 52 words (slightly over), clear CTA"),
          ("Gemini", "4", "3", "4", "5", "16", "Good tone, but 68 words, over the limit"),
          ("Claude", "5", "4", "4", "5", "18", "Fluent Bangla, 47 words, CTA at the end")]:
    w("| " + " | ".join(r) + " |")
w("\n*Verdict example:* \"ফেসবুক পোস্টের মতো ছোট বাংলা লেখার জন্য এই পরীক্ষায় Claude আমার কাছে সবচেয়ে ভালো লেগেছে, কারণ শব্দসীমা মেনেছে আর বাংলা স্বাভাবিক। তবে আরেকদিন আবার পরীক্ষা করে দেখব।\" (The scores above are an example for teaching how to score. They aren't a ranking of the tools.)\n")
w("**Evaluation rubric (20 points):**\n")
w("| Criterion | 4–5 Excellent | 2–3 Developing | 0–1 Needs work |\n|---|---|---|---|")
for r in [("Fair method (5)", "Same prompt, new chats, all three tools", "One condition broken", "Different prompts / tools missing"),
          ("Scoring quality (5)", "All 12 scores with a short reason each", "Scores without reasons", "Incomplete"),
          ("Accuracy check (5)", "Word count and invented details checked", "Partly checked", "Not checked"),
          ("Verdict & safety (5)", "Clear, task-specific verdict; personal data hidden", "Vague verdict", "Missing / unsafe screenshots")]:
    w("| " + " | ".join(r) + " |")

# ---------------- G
w("\n---\n## SECTION G — Video post-production\n")
w(f"**Subtitles:** `pillar01-lesson03.bn.srt`, {len(T['cues'])} cues (≤ about 66 characters each), burned in (Hind Siliguri Bold 42 px, warm white on charcoal, amber for English terms and numbers) and supplied as an SRT.\n")
w("**Voiceover pacing (measured per take):**\n")
w("| Scene | Model | Duration | Pace (chars/s) | Script match |\n|---|---|---|---|---|")
for k, v in MAN.items():
    w(f"| {k} | {v['model']} | {v['dur']:.1f} s | {v['cps']} | {v['ratio']:.2f} |")
w(f"\nRaw-take figures. In the edit every take was time-stretched ×{TEMPO} (slightly slower, pitch preserved) to reach the 10-minute plan, and normalized to −18 LUFS per take before the mix. All takes use one model and the Orus voice. Match scores below 1.00 come from the transcriber writing English terms (tool, video, freelancer…) in Latin script; the two lowest (scenes 02 and 06) were checked by eye and are complete.\n")
w("**Music and sound effects:** a new warm, original code-synthesized bed (F-major family, 80 BPM, no licensing) for the new theme, about 20 dB under the voice and sidechain-ducked. Sound effects: logo sting, chapter whooshes, tile-flip pops (scene 02), keyboard taps on both typed prompts (scenes 04 and 11), score pops, a low warning tone on the shared-account caution (scene 09), and a recap chime.\n")
w("**Transitions:** amber chapter cards between scenes, 0.3 s scene fades, ease-out entrances.\n")
w("**Highlights and zooms:** typed prompt and blur-to-sharp image reveal (04), ghost-text code completion (05), orbiting Google apps (07), document-to-summary compression (08), price strip and red caution shake (09), decision-path pills (10), filling score dots (11).\n")
if LIP:
    w(f"**Lip-sync:** scenes {', '.join(x[1:] for x in LIP)} use SadTalker (open source, run locally on CPU) driven by the actual narration track, pasted back into your full photo. It's labelled \"AI লিপ-সিঙ্ক\" on screen. Check mouth shapes on close viewing before publishing, and disclose AI-generated presenter footage per platform rules.\n")
else:
    w("**Lip-sync (not included):** HeyGen, fal and similar services are blocked by this environment's network policy. To add it later, run the intro (01) and recap (12) narration through a lip-sync tool you have access to (e.g. HeyGen Avatar/Photo or SadTalker on a GPU), using your photo, then drop the clips into the presenter card. The composition already supports `assets/talk_s01.mp4` and `assets/talk_s12.mp4` automatically.\n")
w("**Thumbnail title:** \"কোন কাজে কোন AI টুল?\" · subline \"ChatGPT · Gemini · Claude — লেসন ০৩\". Layout: your new photo on the left 40%, three brand-neutral badges (GPT · Gem · Cl) on the right, warm amber glow.\n")
w("**Video description (YouTube/Facebook):**\n")
w("```\nকোন কাজে কোন AI টুল? ChatGPT, Gemini, Claude তুলনা | লেসন ০৩ · PILLAR 01 (বাংলা)\n\nএই লেসনে শিখবেন:\n00:00 স্বাগতম\n" + "\n".join(f"{tc(SC[s['id']]['start'])[:5]} {s['title']}" for s in SCENES[1:]) +
  "\n\nঅ্যাসাইনমেন্ট: একই প্রম্পট ChatGPT, Gemini আর Claude-এ দিয়ে ৪টি বিষয়ে স্কোর করুন।\nসতর্কতা: দাম ও ফিচার দ্রুত বদলায় — অফিশিয়াল প্রাইসিং পেজ দেখুন। ফেসবুকে শেয়ার্ড অ্যাকাউন্ট কিনবেন না।\n\nপরের লেসন: প্রম্পট ইঞ্জিনিয়ারিংয়ের মূল কথা\n#AIবাংলা #ChatGPT #Gemini #Claude #AITools\n```\n")
w("**Export settings:** H.264 High, 1920×1080, 30 fps CFR, yuv420p (master CRF 18), AAC-LC 192 kbps 48 kHz stereo, fast-start; −14 LUFS integrated, true peak ≤ −1 dBTP.\n")
if QC:
    w("**Measured QC on the delivered file:** " + " · ".join(f"{k}: {v}" for k, v in QC.items() if k not in ("tempo", "master_size")) + "\n")
w("**Fact notes (checked 17 Oct 2026):** Claude: Anthropic's official supported-countries page lists Bangladesh. Pricing: multiple October 2026 pricing guides agree on ~$20/month for ChatGPT Plus, $19.99 for Google AI Pro and $20 for Claude Pro in the US. Free tiers exist for all three, with usage limits. Model names and exact limits differ between sources and are deliberately not stated. Re-check `openai.com/chatgpt/pricing`, `gemini.google/subscriptions` and `claude.com/pricing` (or their current equivalents) before publishing.\n")
w("**Before publishing:** replace the scene 11 panels with your real capture (Section E) · re-check the three pricing pages · listen once for pronunciation of tool names (Perplexity, NotebookLM, Firefly, Copilot, Cursor) · turn on the platform's AI-generated content label (AI narration" + (" and AI lip-sync" if LIP else "") + ") · add the SRT as Bangla captions.\n")
open(f"{P}/deliverables/PRODUCTION_PACKAGE.md", "w").write("\n".join(out))
print("package lines", len(out))

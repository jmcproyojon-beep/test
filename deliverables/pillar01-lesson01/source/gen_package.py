"""Generate the Lesson 01 production package (Sections A–G) from the script + real timeline."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l1_script import SCENES, SAMPLE_ANSWER

P = "/home/user/test/projects/pillar01-lesson01"
T = json.load(open(f"{P}/artifacts/timing.json"))
MAN = json.load(open(f"{P}/artifacts/tts_manifest.json"))
QC = json.load(open(f"{P}/artifacts/qc.json")) if os.path.exists(f"{P}/artifacts/qc.json") else {}
SC = {s["id"]: s for s in T["scenes"]}
DUR = T["video_duration"]


def tc(x):
    m, s = divmod(x, 60)
    return f"{int(m):02d}:{s:04.1f}"


for _v in MAN.values(): _v["model"] = _v["model"].replace(" (reused)", "")
models = sorted({v["model"] for v in MAN.values()})
out = []
w = out.append
w("# PILLAR 01 · LESSON 01 — Introduction to Artificial Intelligence")
w("## Production Package · AI Fundamentals & Digital Literacy (বাংলা)\n")
w(f"**Rendered file:** `pillar01-lesson01_final.mp4` (master, 108 MB) · `pillar01-lesson01_web.mp4` (smaller copy) · **Measured duration:** {tc(DUR)} ({DUR:.1f} s) · 1920×1080 · 30 fps · H.264 + AAC\n")
w("> **What's real here:** the MP4 was actually rendered and checked.")
w("> - **Narration:** Gemini text-to-speech (" + ", ".join(f"`{m}`" for m in models) + "), prebuilt male voice **Orus**. Each take was transcribed with Gemini and compared to the script (similarity scores in Section G).")
w("> - **ChatGPT demo (scene 08):** a clearly labelled illustration (\"প্রতীকী ডেমো — আসল স্ক্রিন রেকর্ডিং নয়\"), because this production environment can't reach chatgpt.com. Record the real screen capture with Section E and replace scene 08's right-hand panel before publishing.")
w("> - **Instructor:** the photo is the channel owner's own image (watermark cropped). It is a still, not lip-synced.\n")

# ---------------- A
w("---\n## SECTION A — Lesson metadata\n")
w(f"| Field | Value |\n|---|---|\n| Lesson | PILLAR 01 · Lesson 01 — Introduction to Artificial Intelligence (Artificial Intelligence-এর পরিচিতি) |\n| Planned duration | 10:00 |\n| Rendered duration | **{tc(DUR)}** (spoken narration {sum(v['dur'] for v in MAN.values()):.0f} s + chapter cards, pauses and end card) |\n| Format | 16:9 · 1920×1080 · 30 fps · H.264 MP4 · Bangla burned-in subtitles + SRT |\n| Audience | Absolute beginners: students, content creators, freelancers, job seekers, small business owners in Bangladesh |\n| Language | Bangla (standard Bangladeshi), English technical terms explained |")
w("\n**Learning objectives:** by the end, the learner can:")
for o in ["define Artificial Intelligence in plain Bangla and name AI they already use;",
          "explain how rule-based software differs from AI that learns from examples;",
          "place six milestones of AI history (1950–2022) in order;",
          "describe the four-step model data → training → model → prediction, and how a language model predicts the next token;",
          "give realistic AI applications in education, agriculture, health, business, communication and freelancing;",
          "list AI's main limitations (hallucination, knowledge cut-off, bias, not a substitute for experts, privacy);",
          "write, send, refine and verify a first well-structured ChatGPT prompt."]:
    w(f"- {o}")
w("\n**Prerequisites:** none in AI. A smartphone or computer with internet access and a free ChatGPT account (or willingness to create one) for the practice step.\n")
w("**Expected learning outcomes:** a completed 5-row AI applications worksheet (Section F), a saved first prompt with its follow-up, and the habit of checking AI output before using it.\n")

# ---------------- B
w("---\n## SECTION B — Full narration script (Bangla)\n")
w("Every word below is exactly what the narrator says in the rendered video. English terms stay in Latin script; the narrator says them in English.\n")
for s in SCENES:
    t = SC[s["id"]]
    w(f"### {s['num']} · {s['title']}  `{tc(t['narr_start'])}–{tc(t['narr_end'])}`\n")
    for l in s["lines"]:
        w(f"{l}  ")
    w("")

# ---------------- C
w("---\n## SECTION C — Timecoded storyboard\n")
w("Times are measured from the rendered timeline. Each scene opens with a 1.7 s chapter card (big number + title) before the narration starts.\n")
for s in SCENES:
    t = SC[s["id"]]
    ls = [L for L in T["lines"] if L["scene"] == s["id"]]
    w(f"### Scene {s['num']} — {s['title']}  ·  {tc(t['start'])} → {tc(t['end'])}\n")
    w(f"- **Teaching objective:** {s['objective']}")
    w(f"- **Visual:** {s['visual']}")
    w(f"- **Camera:** {s['camera']}")
    w(f"- **Animation:** {s['animation']}")
    w(f"- **On-screen text:** " + " · ".join(f"\"{x}\"" for x in s["onscreen"]))
    w(f"- **Transition in:** {'Fade from black, logo sting' if s['id'] == 's01' else 'Cyan-purple chapter card (number scales in with back-out, title rises, underline draws) → card fades to the scene'}; previous scene fades out over 0.3 s.")
    w(f"- **Sound:** {s['sound']}")
    if s["type"] == "demo":
        w("- **Screen-recording shot:** replace the right-hand browser panel with the real capture from Section E (steps 1–9), keeping the left step list and the timing below. If you use the real capture, remove the \"প্রতীকী ডেমো\" label.")
    else:
        w("- **Screen-recording shot:** none (animated scene).")
    w("\n| Time | Voiceover (spoken) |\n|---|---|")
    for L in ls:
        w(f"| {tc(L['start'])}–{tc(L['end'])} | {L['text']} |")
    w("")

# ---------------- D
w("---\n## SECTION D — Animation prompts (AI video generation, optional B-roll / upgrades)\n")
w("**Shared style for every prompt:** \"16:9, 1920×1080, 30 fps, premium 2.5D/3D educational motion graphics, deep navy (#060b1f) background with a subtle cyan grid, electric cyan (#22e3ff) and soft purple (#8b5cf6) accents, glassmorphism panels with soft inner glow, clean geometric shapes, calm confident camera moves, no on-screen text (text is added in edit), no logos, no real people.\" Keep prompts in English for the generators. Burn Bangla text in the edit, because generators misspell Bangla.\n")
prompts = {
 "s01": "Slow push-in through a calm futuristic learning studio: floating glass panels drift into place forming a six-step path that lights up cyan one by one, gentle particles, soft volumetric light, welcoming and uncluttered.",
 "s02": "A glowing translucent brain-shaped network made of fine cyan lines hovers centre frame; four small glass tiles orbit it (a microphone waveform, a map route line, an envelope, a stacked feed), each tile brightening in turn; static camera with slight parallax.",
 "s03": "Split composition: on the left a crisp glass calculator emitting a straight, fixed arrow path; on the right a cloud of small fruit cards (yellow mango shapes, green spiky jackfruit shapes) flowing into a glowing core that outputs a curved, learned path; slow lateral camera drift from left to right.",
 "s04": "A long horizontal glowing timeline rail draws itself left to right across a dark space; six evenly spaced nodes pulse to life one after another, each releasing a small rising glass card; camera tracks smoothly along the rail.",
 "s05": "Four glass blocks connected by flowing light: a stack of data cylinders, a circular loop arrow spinning and slowing, a solid crystalline cube, and a target; light particles travel through them in order. Then a row of word-shaped tokens with vertical light bars of different heights, the tallest glowing brightest.",
 "s06": "Six floating glass cards in a 3×2 grid, each with a simple 3D icon (open book, leaf, heart with pulse line, shopfront, globe, pen); cards flip up one by one with a soft glow; slow dolly from left to right, ending wide.",
 "s07": "Left half: a calm green-tinted panel with five check-mark lights turning on. Right half: an amber-tinted panel with five warning symbols sliding in, the first one briefly flickering; camera holds steady with a gentle zoom on each warning.",
 "s08": "A clean, generic chat window floating in 3D space (no brand, no logo, no readable text): a message line types itself in the input box, a send button pulses, a reply panel unfolds, a small green verification badge appears; slight push-in on the input box.",
 "s09": "A glass worksheet table with five empty rows assembles row by row on a dark desk surface; a small amber sticky note flips in at the side; slow push-in.",
 "s10": "Six green check marks light up in a vertical list, then the scene pulls back to reveal a glowing doorway labelled only by light, suggesting the next lesson; music swell, gentle fade to the course end card.",
}
for s in SCENES:
    w(f"**{s['num']} · {s['title']} ({tc(SC[s['id']]['start'])}–{tc(SC[s['id']]['end'])}):** {prompts[s['id']]}\n")

# ---------------- E
prompt = SCENES[7]["lines"][5]
w("---\n## SECTION E — Screen recording guide (real capture for scene 08)\n")
w("**Why this is needed:** the video's ChatGPT segment is a labelled illustration. A real capture from your own account is more authentic, and the brief requires it wherever possible.\n")
w("**Application:** ChatGPT on the web at `https://chatgpt.com` (official OpenAI site) in Google Chrome or Microsoft Edge on a computer. The official ChatGPT mobile app by OpenAI is an alternative, but record the desktop version for this lesson so it matches the 16:9 frame.\n")
w("**Before recording (privacy and setup):**")
for x in ["Use a separate browser profile with no other tabs, bookmarks or extensions visible.",
          "Sign in before you start recording. Never record the password step.",
          "Hide or blur anything personal: your name/email in the account menu, and earlier chats in the sidebar (collapse the sidebar if your layout allows it, or blur in the edit).",
          "Start a new, empty chat so no previous conversation appears.",
          "Set the browser zoom to 125% so text is readable in a 1080p video. Turn off system notifications.",
          "Recorder: OBS Studio (free) or the Windows Snipping Tool / macOS screen recording. 1920×1080, 30 fps, cursor visible; add cursor highlight if your recorder supports it.",
          "Don't type anything personal into the prompt."]:
    w(f"- {x}")
w("\n**Shot list (matches scene 08 narration):**\n")
w("| # | Action on screen | What the narration says at that moment | Highlight / zoom |\n|---|---|---|---|")
rows = [
 ("Show the browser address bar; type `chatgpt.com` and press Enter.", "\"প্রথমে ব্রাউজারে chatgpt.com ঠিকানায় যান…\"", "Highlight the address bar for 1.5 s."),
 ("If a login screen appears, show it briefly, then cut to the logged-in empty chat (don't record credentials).", "\"প্রয়োজনে… সাইন আপ বা লগইন করুন…\"", "Blur email fields."),
 ("Click into the message box at the bottom.", "\"এখন নিচের মেসেজ বক্সে এই প্রম্পটটি লিখুন।\"", "Zoom to 120% on the message box."),
 ("Paste or type the prompt below at a readable pace.", "The narrator reads the prompt.", "Keep the zoom; colour-underline 'আমি একজন নতুন শিক্ষার্থী', 'খুব সহজ বাংলায়', 'পাঁচটি বাক্যে', 'দুটি উদাহরণ দিন' in the edit."),
 ("Pause one second, then press Enter (or click the send button).", "\"এরপর Enter চাপুন, বা পাঠানোর বাটনে ক্লিক করুন…\"", "Click ripple on send."),
 ("Let the answer stream in fully; scroll slowly if it's long.", "\"উত্তর এলে মনোযোগ দিয়ে পড়ুন…\"", "Zoom back to 100%; three tick labels in the edit."),
 ("Type the follow-up prompt and send it.", "\"একই চ্যাটে ফলো-আপ লিখুন…\"", "Highlight the new message."),
 ("Point the cursor at any fact or example in the answer.", "\"…নির্ভরযোগ্য সূত্র থেকে মিলিয়ে নিন।\"", "Green 'যাচাই করুন' badge."),
 ("Hold on the final answer for two seconds; stop recording.", "Privacy reminder line.", "Red privacy banner overlay."),
]
for i, (a, b, c) in enumerate(rows, 1):
    w(f"| {i} | {a} | {b} | {c} |")
w(f"\n**Prompt to paste (exactly):**\n\n```\n{prompt}\n```\n")
w("**Follow-up prompt:**\n\n```\nউদাহরণগুলো একটি টেবিল আকারে দিন।\n```\n")
w("**Expected response (what to look for, not a fixed text):** a short Bangla explanation in about five sentences that defines AI as technology that lets computers do tasks needing human-like intelligence by learning patterns from data, with two everyday Bangladesh examples (often voice typing, maps or translation). After the follow-up, the same content arranged as a table. Wording varies every time; this is normal for generative AI. The illustrative sample used in the video was:\n")
for x in SAMPLE_ANSWER:
    w(f"> {x}")
w("\n**What to explain during each click:** steps 1–2: use only the official site/app, and beware of look-alike apps. Steps 3–4: a prompt is an instruction, and a good prompt says who you are, the language, the length and the kind of examples. Step 5: sending. Step 6: read critically (does it answer the question, is the language simple, are the examples realistic). Step 7: refine in the same chat instead of starting over. Steps 8–9: verify facts, and never paste private information.\n")
w("**Common errors and troubleshooting:**\n")
w("| Problem | Fix |\n|---|---|")
for a, b in [("Answer comes back in English", "Add \"উত্তর বাংলায় দিন\" to the prompt, or send it as a follow-up."),
             ("Answer is too long or too technical", "Follow up: \"আরও সহজ করে, তিনটি বাক্যে বলুন।\""),
             ("Login/verification email not arriving", "Check spam, wait a few minutes, or use 'Continue with Google'."),
             ("\"Something went wrong\" / network error", "Refresh the page, check the internet connection, then resend."),
             ("Message limit or model notice on a free account", "Free plans have usage limits that change over time. Wait, or check OpenAI's official pricing page for current details. Don't quote limits from memory in the video."),
             ("Downloaded a 'ChatGPT' app that asks for payment or odd permissions", "Uninstall it. Use only the app published by OpenAI, or the website chatgpt.com.")]:
    w(f"| {a} | {b} |")
w("\n**Privacy precautions (say them on camera too):** never enter passwords, NID numbers, bank/mobile-banking details, customer data or confidential office documents. Treat everything typed as potentially stored. Blur personal details before publishing.\n")

# ---------------- F
w("---\n## SECTION F — Student activities\n")
w("### Assignment 1 · Identify 5 useful AI applications\n")
w("**Instructions (step by step):**")
for i, x in enumerate(["Think about your study, work or business: where do you spend time on writing, searching, translating, planning or answering questions?",
                       "List five AI tools or features you could use there. They must be five different kinds of task.",
                       "For each, fill one row of the worksheet: name, what it does, how you'd use it, and one limitation or risk.",
                       "Optional: ask ChatGPT for ideas, e.g. \"আমি একজন [আপনার পেশা]। আমার কাজে কাজে লাগে এমন ৫টি AI টুলের নাম ও ব্যবহার বলুন।\" Then check each tool's official website yourself before writing it down.",
                       "Review your table with the self-check list and submit it (photo of handwritten table, Google Doc or spreadsheet)."], 1):
    w(f"{i}. {x}")
w("\n**Expected deliverable:** one table with exactly 5 rows × 4 columns (নাম · কী কাজ করে · আমি কীভাবে ব্যবহার করব · সীমাবদ্ধতা/ঝুঁকি), plus one line naming the source you used to verify each tool.\n")
w("**Self-assessment checklist:**")
for x in ["5টি অ্যাপ্লিকেশন কি আলাদা আলাদা কাজের?", "প্রতিটির ব্যবহার কি আমার পড়াশোনা/কাজ/ব্যবসার সাথে সরাসরি সম্পর্কিত?",
          "প্রতিটির অন্তত একটি বাস্তব সীমাবদ্ধতা বা ঝুঁকি লিখেছি?", "প্রতিটি টুলের তথ্য অফিশিয়াল সূত্র থেকে যাচাই করেছি?", "কোনো ব্যক্তিগত তথ্য শেয়ার করিনি?"]:
    w(f"- [ ] {x}")
w("\n**Common mistakes:** listing five chatbots that all do the same job · vague use (\"কাজে লাগবে\") instead of a concrete task · no limitation written · copying ChatGPT's list without checking that the tools exist or are free · claiming prices from memory.\n")
w("**Model answer (example for a university student who also freelances):**\n")
w("| # | টুল / ফিচার | কী কাজ করে | আমি কীভাবে ব্যবহার করব | সীমাবদ্ধতা / ঝুঁকি |\n|---|---|---|---|---|")
for i, r in enumerate([("Google Translate", "লেখা ও কথা অনুবাদ (বাংলা↔ইংরেজিসহ)", "ক্লায়েন্টের ইংরেজি মেসেজ বুঝতে", "প্রসঙ্গ ভুল বুঝে ভুল অনুবাদ হতে পারে; গুরুত্বপূর্ণ লেখায় নিজে দেখে নিতে হবে"),
          ("মোবাইল কিবোর্ডের বাংলা ভয়েস টাইপিং", "কথাকে লেখায় রূপান্তর", "দ্রুত নোট ও অ্যাসাইনমেন্টের খসড়া", "শব্দ ভুল আসে, বিশেষ করে শব্দদূষণে; পরে সংশোধন লাগে"),
          ("Google Maps", "ট্রাফিক দেখে রুট ও সময়ের আনুমানিক হিসাব", "ক্লাস/মিটিংয়ে সময়মতো পৌঁছাতে", "অনুমান সবসময় সঠিক নয়; লোকেশন ডেটা শেয়ার হয়"),
          ("Gmail-এর স্প্যাম ফিল্টার", "সন্দেহজনক ইমেইল আলাদা করা", "প্রতারণামূলক ইমেইল থেকে সুরক্ষা", "কখনো দরকারি মেইলও স্প্যামে যায়; স্প্যাম ফোল্ডার মাঝে মাঝে দেখতে হবে"),
          ("ChatGPT", "প্রশ্নের ব্যাখ্যা, লেখার খসড়া, আইডিয়া", "কঠিন বিষয় সহজ বাংলায় বোঝা, প্রপোজালের খসড়া", "ভুল তথ্য দিতে পারে (হ্যালুসিনেশন); ব্যক্তিগত তথ্য দেওয়া যাবে না")], 1):
    w(f"| {i} | " + " | ".join(r) + " |")
w("\n**Evaluation rubric (20 points):**\n")
w("| Criterion | 4–5 Excellent | 2–3 Developing | 0–1 Needs work |\n|---|---|---|---|")
for r in [("Variety (5)", "5 clearly different task types", "Some overlap", "Mostly the same kind of tool"),
          ("Relevance (5)", "Each use is a concrete task in the learner's own life", "Some uses are generic", "Uses are vague or missing"),
          ("Limitations (5)", "A real, specific limitation or risk for every row", "Some generic limitations", "Missing"),
          ("Verification & safety (5)", "Source noted for each tool; no personal data; no invented prices", "Partly verified", "Unverified or unsafe")]:
    w("| " + " | ".join(r) + " |")
w("\n### Practice activity · First prompt (from scene 08)\n")
w("Send the scene 08 prompt and the follow-up in your own account. Save a screenshot (with personal details hidden). Then write two sentences: what you'd change in the prompt to get a better answer, and one fact from the answer you verified, with its source.\n")

# ---------------- G
w("---\n## SECTION G — Video post-production\n")
w(f"**Subtitles:** `pillar01-lesson01.bn.srt`, {len(T['cues'])} cues, at most about 66 characters (2 lines) each, timed to the narration. They're burned into the video (Hind Siliguri Bold 42 px, white on 84% navy, cyan for English terms and numbers) and also supplied as an SRT for YouTube/Facebook closed captions.\n")
w("**Voiceover pacing (measured per take):**\n")
w("| Scene | Model | Duration | Pace (chars/s) | Script match |\n|---|---|---|---|---|")
for k, v in MAN.items():
    w(f"| {k} | {v['model']} | {v['dur']:.1f} s | {v['cps']} | {v['ratio']:.2f} |")
w("\nDurations and pace above are for the raw takes. In the edit every take was sped up 5% (atempo 1.05) to fit the 10:00 plan and normalized to the same loudness (−18 LUFS per take before the mix). Scenes 01–07 use `gemini-3.1-flash-tts-preview`. Scenes 08–10 use `gemini-2.5-flash-preview-tts` with the same Orus voice, because the first model hit its free daily limit. Listen at the 07→08 change: the timbre may differ slightly. To make it uniform, regenerate scenes 08–10 on `gemini-3.1-flash-tts-preview` after the quota resets and re-run the timing script; nothing else changes.\n")
w("Target pace is 11–14 characters per second. Match is the Gemini transcript's similarity to the script, where 1.00 means identical. Small gaps come from spelling variants (কোয়ান্টাম/Quantum, অংক/অঙ্ক).\n")
w("**Music and sound effects:**")
w("- **Music:** an original code-synthesized soft bed (no licensing needed), sitting about 20 dB under the voice and sidechain-ducked while the narrator speaks.")
w("- **Sound effects:** a soft logo sting at 0:00, a whoosh on each chapter card, gentle pops as elements appear, keyboard-tap texture during the prompt typing in scene 08, and a success chime at the recap.\n")
w("**Transitions:** chapter card between every scene (1.7 s), previous scene fades out over 0.3 s, and elements enter with ease-out motion. No hard cuts, no random effects.\n")
w("**Screen highlights and zooms:** scene 08 zooms the message box to about 103% while the prompt types. For the real capture, use the zooms in Section E: 120% on the input box, colour underlines on the four prompt parts, a click ripple on send, and blur on personal details.\n")
w("**Thumbnail title:** \"AI কী? একদম শুরু থেকে\" (main) · subline \"লেসন ০১ · PILLAR 01\". Layout: instructor photo at the left 40%, big Hind Siliguri Bold text at the right, cyan glow. No fake 'BREAKING' badges.\n")
w("**Video description (YouTube/Facebook):**\n")
w("```\nAI কী? একদম শুরু থেকে | লেসন ০১ · PILLAR 01: AI Fundamentals (বাংলা)\n\nএই লেসনে শিখবেন:\n00:00 স্বাগতম ও লেসনের রোডম্যাপ\n" + "\n".join(f"{tc(SC[s['id']]['start'])[:5]} {s['title']}" for s in SCENES[1:]) +
  "\n\nঅ্যাসাইনমেন্ট: আপনার কাজে লাগে এমন ৫টি AI অ্যাপ্লিকেশন খুঁজে টেবিলে লিখুন (নাম · কাজ · ব্যবহার · সীমাবদ্ধতা)।\nনিরাপত্তা: ব্যক্তিগত তথ্য, পাসওয়ার্ড বা NID নম্বর কখনো AI চ্যাটে দেবেন না। AI-এর তথ্য সবসময় যাচাই করুন।\n\nপরের লেসন: AI, Machine Learning, Deep Learning ও Generative AI\n#AIবাংলা #ArtificialIntelligence #ChatGPT #AIশিক্ষা\n```\n")
w("Chapter times in the description come from the rendered timeline. YouTube needs the first chapter at 00:00, which it is.\n")
w("**Export settings:** H.264 High profile, 1920×1080, 30 fps constant frame rate, yuv420p, about 12–16 Mbps VBR (the delivered file uses CRF 18). AAC-LC 192 kbps, 48 kHz stereo. Fast-start (moov atom at the front) for web playback. Loudness −14 LUFS integrated, true peak ≤ −1 dBTP.\n")
if QC:
    w("**Measured QC on the delivered file:** " + " · ".join(f"{k}: {v}" for k, v in QC.items()) + "\n")
w("**Before publishing:** replace scene 08 with your real screen capture (Section E) · listen to the full narration once for pronunciation (especially English names: Turing, Dartmouth, Deep Blue, Kasparov, Transformer) · turn on the platform's AI-generated content label, because the narration is AI-generated · add the SRT as Bangla captions.\n")
open(f"{P}/deliverables/PRODUCTION_PACKAGE.md", "w").write("\n".join(out))
print("package lines", len(out))

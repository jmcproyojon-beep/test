"""Generate the Lesson 02 production package (Sections A–G) from the script + real timeline."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from l2_script import SCENES

P = "/home/user/test/projects/pillar01-lesson02"
T = json.load(open(f"{P}/artifacts/timing.json"))
MAN = json.load(open(f"{P}/artifacts/tts_manifest.json"))
QC = json.load(open(f"{P}/artifacts/qc.json")) if os.path.exists(f"{P}/artifacts/qc.json") else {}
SC = {s["id"]: s for s in T["scenes"]}
DUR = T["video_duration"]
SIZE = QC.get("master_size", "")
TEMPO = QC.get("tempo", "1.00")


def tc(x):
    m, s = divmod(x, 60)
    return f"{int(m):02d}:{s:04.1f}"


models = sorted({v["model"] for v in MAN.values()})
by_model = {}
for k, v in MAN.items():
    by_model.setdefault(v["model"], []).append(v["scene"][1:])
model_note = "; ".join(f"scenes {', '.join(sc)}: `{m}`" for m, sc in by_model.items())
out = []
w = out.append
w("# PILLAR 01 · LESSON 02 — AI, Machine Learning, Deep Learning & Generative AI")
w("## Production Package · AI Fundamentals & Digital Literacy (বাংলা)\n")
w(f"**Rendered file:** `pillar01-lesson02_final.mp4` (master{', ' + SIZE if SIZE else ''}) · **Measured duration:** {tc(DUR)} ({DUR:.1f} s) · 1920×1080 · 30 fps · H.264 + AAC\n")
w("> **What's real here:** the MP4 was actually rendered and checked.")
w(f"> - **Narration:** Gemini text-to-speech, prebuilt male voice **Orus** ({model_note}). Each take was transcribed with Gemini and compared to the script (similarity scores in Section G).")
w("> - **Search vs assistant comparison (scene 09):** both panels are clearly labelled illustrations (\"প্রতীকী চিত্র — আসল স্ক্রিনশট নয়\"), because this production environment can't reach chatgpt.com. Record the real side-by-side capture with Section E and replace the two panels before publishing.")
w("> - **Token splits (scene 08)** are illustrative, and the video says so. Real tokenizers split text differently per model. Section E shows how to get real counts from OpenAI's official Tokenizer page.")
w("> - **Instructor:** the photo is the channel owner's own image. It is a still, not lip-synced.\n")

# ---------------- A
w("---\n## SECTION A — Lesson metadata\n")
w(f"| Field | Value |\n|---|---|\n| Lesson | PILLAR 01 · Lesson 02 — AI, Machine Learning, Deep Learning & Generative AI |\n| Planned duration | 10:00 |\n| Rendered duration | **{tc(DUR)}** (spoken narration plus chapter cards, pauses and end card) |\n| Format | 16:9 · 1920×1080 · 30 fps · H.264 MP4 · Bangla burned-in subtitles + SRT |\n| Audience | Absolute beginners: students, content creators, freelancers, job seekers, small business owners in Bangladesh |\n| Language | Bangla (standard Bangladeshi), English technical terms explained |")
w("\n**Learning objectives:** by the end, the learner can:")
for o in ["draw the nesting AI ⊃ Machine Learning ⊃ Deep Learning, and place Generative AI (mostly deep-learning based) inside it;",
          "define Machine Learning and tell supervised, unsupervised and reinforcement learning apart with one example each;",
          "explain an artificial neural network (input, hidden and output layers, weights adjusted during training) and why many layers are called deep learning;",
          "say what makes Generative AI different from AI that only recognises or classifies, and name five kinds of output;",
          "describe a Large Language Model, its two build stages (pre-training, then fine-tuning with feedback), and why it can be confidently wrong;",
          "explain how training data quality, bias, cut-off date and language coverage affect AI;",
          "define tokens, context window and inference, and contrast inference with training;",
          "choose between a search engine and a generative assistant for a given question, and verify important facts at the original source."]:
    w(f"- {o}")
w("\n**Prerequisites:** Lesson 01 (what AI is, and how it learns from data) is helpful but not required, since this lesson recaps it. You'll need internet access, Google Search, and a free ChatGPT or Gemini account for the exercise.\n")
w("**Expected learning outcomes:** a completed Search-vs-AI comparison table for three questions, and a six-item classification with reasons (Section F). The learner can also say in one sentence how AI, ML, DL, Generative AI and LLMs relate.\n")

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
w("Times are measured from the rendered timeline. From scene 02 on, each scene opens with a short chapter card (big number + title) before the narration starts.\n")
for s in SCENES:
    t = SC[s["id"]]
    ls = [L for L in T["lines"] if L["scene"] == s["id"]]
    w(f"### Scene {s['num']} — {s['title']}  ·  {tc(t['start'])} → {tc(t['end'])}\n")
    w(f"- **Teaching objective:** {s['objective']}")
    w(f"- **Visual:** {s['visual']}")
    w(f"- **Camera:** {s['camera']}")
    w(f"- **Animation:** {s['animation']}")
    w(f"- **On-screen text:** " + " · ".join(f"\"{x}\"" for x in s["onscreen"]))
    w(f"- **Transition in:** {'Fade from black, logo sting' if s['id'] == 's01' else 'Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene'}; previous scene fades out over 0.3 s.")
    w(f"- **Sound:** {s['sound']}")
    if s["type"] == "search":
        w("- **Screen-recording shot:** replace the two illustrated panels with the real side-by-side capture from Section E (Google Search on the left, ChatGPT or Gemini on the right). Keep the pros/cons, rule and example cards below. If you use the real capture, remove the \"প্রতীকী চিত্র\" labels.")
    elif s["type"] == "tokens":
        w("- **Screen-recording shot (optional):** a 10-second insert of OpenAI's official Tokenizer page counting the same English and Bangla sentences (Section E, part 2), placed over the top token card.")
    elif s["type"] == "exercise":
        w("- **Screen-recording shot (optional):** a 5–8 s glimpse of the learner typing question 1 into Google and into ChatGPT/Gemini (from the Section E capture).")
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
 "s01": "Slow push-in through a calm futuristic learning studio: six floating glass tiles assemble into a path and light up cyan one by one; gentle particles and soft volumetric light, welcoming and uncluttered.",
 "s02": "Four translucent concentric glass rings float in dark space, largest cyan, then purple, magenta and a small glowing amber core; each ring scales in from the outside inward and glows as it lands; slow push-in toward the amber core.",
 "s03": "Three glass panels side by side. Left: small envelope cards sliding in and receiving red or green tags. Centre: a cloud of grey dots drifting and gathering into three coloured clusters. Right: a small friendly robot cube moving and receiving a green star, then a red cross. Static camera with subtle parallax.",
 "s04": "A clean 3D neural network: a column of input nodes, two hidden columns, two output nodes, all joined by thin glowing lines; pulses of light travel left to right layer by layer; one connection thickens and glows amber as if being tuned; slow lateral camera move along the signal.",
 "s05": "Left: a calm sorting machine places items into two bins. Right: a glowing amber spark bursts into five floating cards (a page of text, a picture frame, a sound wave, a film strip, code brackets) arranged in a row; light sparkles; slight push toward the right.",
 "s06": "A vast library of floating pages streams into a large crystalline neural core (pre-training), then a second stage where small human-hand icons place check marks on output cards that feed back into the core (fine-tuning with feedback); calm push-in.",
 "s07": "A conveyor of example cards (text, images, sound waves, numbers) flows into a model core. Some cards are cracked and grey and come out as cracked results; a balance scale tips to one side; an hourglass marks a cut-off line. Steady camera, gentle zoom on each idea.",
 "s08": "A sentence of light breaks into coloured chip-shaped pieces with a gentle slicing motion; a horizontal window bar fills up with chips; chips then appear one after another to build a reply. Close, clean macro framing.",
 "s09": "Two floating glass browser-like panels with no brand and no readable text: the left shows three stacked link rows dropping in, the right shows one long answer bubble writing itself; small green and amber badges appear under each; static wide shot.",
 "s10": "A glass worksheet table assembles row by row on a dark desk while six small cards flip in on the right, each with an amber question badge; slow push-in.",
 "s11": "Six green check marks light up in a vertical list, then the camera pulls back to reveal a glowing doorway suggesting the next lesson; music swell, gentle fade to the course end card.",
}
for s in SCENES:
    w(f"**{s['num']} · {s['title']} ({tc(SC[s['id']]['start'])}–{tc(SC[s['id']]['end'])}):** {prompts[s['id']]}\n")

# ---------------- E
w("---\n## SECTION E — Screen recording guide\n")
w("### Part 1 · Search engine vs AI assistant (replaces scene 09's two panels)\n")
w("**Why this is needed:** scene 09 currently uses labelled illustrations. A real side-by-side capture from your own computer is more authentic, and the brief requires it wherever possible.\n")
w("**Applications:** Google Search at `https://www.google.com`, and either ChatGPT at `https://chatgpt.com` (official OpenAI site) or Google Gemini at `https://gemini.google.com` (official Google site), in Chrome or Edge on a computer. Interfaces change often, so check what you see on recording day, and say only what appears on your screen.\n")
w("**Before recording (privacy and setup):**")
for x in ["Use a separate browser profile with no other tabs, bookmarks or extensions visible.",
          "Sign in to ChatGPT/Gemini before you start recording. Never record the password step.",
          "Hide or blur your name, email and profile picture, and any earlier chats in the sidebar. Start a new, empty chat.",
          "Google results depend on your location and account. Use a signed-out or clean profile so personal suggestions don't appear.",
          "Snap the two windows side by side (Windows: Win + ← / Win + →; macOS: hover the green button → tile), at 110–125% browser zoom.",
          "Recorder: OBS Studio (free) or the built-in Windows/macOS recorder, 1920×1080, 30 fps, cursor visible.",
          "Don't type anything personal."]:
    w(f"- {x}")
w("\n**Shot list (matches scene 09 narration):**\n")
w("| # | Action on screen | Narration at that moment | Highlight / zoom |\n|---|---|---|---|")
rows = [
 ("Show both windows side by side: Google on the left, ChatGPT/Gemini on the right.", "\"…সার্চ ইঞ্জিন আর… AI অ্যাসিস্ট্যান্টের মধ্যে পার্থক্য কী?\"", "Label the panels 'সার্চ ইঞ্জিন' / 'AI অ্যাসিস্ট্যান্ট'."),
 ("In Google, type `সালোকসংশ্লেষণ কী` and press Enter; scroll slowly over the result links.", "\"সার্চ ইঞ্জিন… লিংকের তালিকা দেখায়।\"", "Box the list of links for 2 s."),
 ("In the assistant, type `সালোকসংশ্লেষণ কী, সহজ বাংলায় বলুন` and send. Let the full answer appear.", "\"AI অ্যাসিস্ট্যান্ট… একটি গোছানো উত্তর লিখে দেয়।\"", "Zoom 115% on the answer."),
 ("Type the follow-up `আরেকটু উদাহরণ দিন` and send.", "\"…ফলো-আপ প্রশ্নও করতে পারেন।\"", "Highlight the follow-up bubble."),
 ("Hover over Google's result URLs (domain names).", "Strengths/weaknesses of search.", "Green underline on a .gov.bd or textbook-board domain if one appears."),
 ("Point at the assistant's answer; if it shows sources/links, hover them; if not, point out that none are shown.", "Strengths/weaknesses of the assistant.", "Amber note: 'উৎস দেখাচ্ছে কি?'"),
 ("If an AI-generated summary appears at the top of Google, or the assistant offers web search, point at it. Skip this step if neither appears; don't stage it.", "\"এখন অনেক অ্যাসিস্ট্যান্ট ওয়েব সার্চ করে…\"", "Purple 'AI সারাংশ' tag."),
 ("In Google, search `এসএসসি পরীক্ষার ফলাফল` and open the official education board result site from the results (check the domain ends in .gov.bd or is the board's published result portal).", "SSC result example.", "Zoom on the address bar showing the official domain."),
]
for i, (a, b, c) in enumerate(rows, 1):
    w(f"| {i} | {a} | {b} | {c} |")
w("\n**Prompts to type (exactly):**\n\n```\nসালোকসংশ্লেষণ কী, সহজ বাংলায় বলুন\n```\n```\nআরেকটু উদাহরণ দিন\n```\n")
w("**Expected response (what to look for, not a fixed text):** Google shows a page of links (encyclopedia, textbook or education sites, videos), sometimes with a summary box. The assistant writes a short Bangla explanation: plants use sunlight, water and carbon dioxide to make food (glucose) and release oxygen, with a simple everyday example. Wording varies every time.\n")
w("**What to explain during each click:** search engines find existing pages and you judge the source. Assistants compose an answer from learned patterns and can continue the conversation. For recent or official information (results, dates, prices, rules), go to the official source. For explanations and drafts, assistants are useful, but check them against the textbook.\n")
w("### Part 2 (optional) · Real token counts (insert for scene 08)\n")
w("Open OpenAI's official Tokenizer page (`https://platform.openai.com/tokenizer`). Paste `I love learning AI`, then `আমি AI শিখতে ভালোবাসি`, and record the token and character counts the page shows. Read out the real numbers from your screen. They will differ from the illustrative chips in the video, which is the point: each model's tokenizer splits text its own way. If the page layout has changed, record whatever official token-count tool OpenAI currently links from its help article on tokens.\n")
w("**Common errors and troubleshooting:**\n")
w("| Problem | Fix |\n|---|---|")
for a, b in [("Assistant answers in English", "Add \"বাংলায় উত্তর দিন\" or send it as a follow-up."),
             ("Google results show personalised or local ads", "Use a clean/signed-out profile; scroll past ads and say they are ads."),
             ("Assistant says it can't browse or doesn't know recent events", "That's the knowledge cut-off from scene 07. Use it as a teaching moment and don't hide it."),
             ("SSC result date isn't announced yet", "Show the official board site anyway, and say the date will be published there. Never quote a date from an AI answer."),
             ("Free plan limits / model notices", "Plans and limits change. Don't quote them in the video; check the official pricing page if needed."),
             ("Look-alike 'AI' apps or sites", "Use only chatgpt.com / the OpenAI app, or gemini.google.com / the Google app.")]:
    w(f"| {a} | {b} |")
w("\n**Privacy precautions (say them on camera too):** never enter passwords, NID numbers, bank/mobile-banking details, exam roll/registration numbers, customer data or confidential documents. Blur personal details before publishing.\n")

# ---------------- F
w("---\n## SECTION F — Student activities\n")
w("### Part 1 · Search engine vs AI assistant comparison\n")
w("**Instructions (step by step):**")
for i, x in enumerate(["Open Google Search in one tab and ChatGPT or Gemini in another.",
                       "Ask the same three questions in both: (a) বাংলাদেশের জাতীয় ফলের নাম কী? (b) ইমেইল লেখার সময় কোন পাঁচটি বিষয় খেয়াল রাখবেন? (c) এই সপ্তাহে ঢাকার আবহাওয়া কেমন থাকবে?",
                       "For each question, record in the table who did better (S = Search, AI = Assistant, or 'equal') on four criteria: accuracy, showed a source, up to date, easy to understand.",
                       "Check at least one fact per question at an original source (for example the Bangladesh Meteorological Department for weather).",
                       "Write one sentence: which tool you'd use for which kind of question, and why."], 1):
    w(f"{i}. {x}")
w("\n### Part 2 · Which circle?\n")
w("For each of the six examples, write the innermost circle it belongs to (AI, Machine Learning, Deep Learning or Generative AI) and a one-line reason.\n")
w("**Expected deliverable:** one 3×4 comparison table with a one-sentence conclusion, plus a six-row classification list with reasons. Submit as a Google Doc, spreadsheet or a photo of handwritten work.\n")
w("**Self-assessment checklist:**")
for x in ["তিনটি প্রশ্নই দুই জায়গায় করেছি?", "প্রতিটি প্রশ্নে অন্তত একটি তথ্য আসল উৎস থেকে যাচাই করেছি?",
          "আবহাওয়ার মতো সাম্প্রতিক প্রশ্নে কোনটি ভালো করেছে, তার কারণ লিখেছি?", "ছয়টি উদাহরণের প্রতিটিতে সবচেয়ে ভেতরের বৃত্ত আর কারণ লিখেছি?", "কোনো ব্যক্তিগত তথ্য শেয়ার করিনি?"]:
    w(f"- [ ] {x}")
w("\n**Common mistakes:** saying the AI 'searched' when it answered from memory · judging accuracy without checking any source · writing only 'AI' for every example instead of the innermost circle · putting the rule-based chess program in Machine Learning · treating a fluent answer as a verified one.\n")
w("**Model answer — Part 1 (typical, results vary by day and tool):**\n")
w("| Question | Accuracy | Source shown | Up to date | Easy to understand |\n|---|---|---|---|---|")
for r in [("জাতীয় ফল (কাঁঠাল)", "Equal: both say jackfruit (কাঁঠাল)", "S (links); AI only if it used web search", "Equal (fact doesn't change)", "AI (one direct sentence)"),
          ("ইমেইলের ৫টি বিষয়", "Equal / AI (well-organised list)", "S", "Equal", "AI (structured, can be customised in a follow-up)"),
          ("ঢাকার এই সপ্তাহের আবহাওয়া", "S (forecast sites / BMD)", "S", "S, unless the assistant used live web search", "Equal")]:
    w("| " + " | ".join(r) + " |")
w("\n*Conclusion example:* \"সাম্প্রতিক বা অফিশিয়াল তথ্যের জন্য সার্চ ইঞ্জিন আর আসল উৎস; কোনো বিষয় বুঝতে বা লেখার খসড়ার জন্য AI অ্যাসিস্ট্যান্ট — তবে যাচাই করে।\"\n")
w("**Model answer — Part 2:**\n")
w("| Example | Innermost circle | Reason |\n|---|---|---|")
for r in [("স্প্যাম ফিল্টার", "Machine Learning", "Learns from labelled spam / not-spam emails (supervised). Modern filters may also use deep learning, and 'Deep Learning' is accepted with that reason."),
          ("ফোনের ফেস আনলক", "Deep Learning", "Face recognition in modern phones uses deep neural networks trained on images."),
          ("ChatGPT দিয়ে ইমেইল লেখা", "Generative AI", "An LLM generates new text."),
          ("হাতে লেখা নিয়মের দাবা প্রোগ্রাম", "AI (not ML)", "Follows rules written by programmers; it doesn't learn from data."),
          ("কাস্টমারদের দলে ভাগ করা", "Machine Learning", "Unsupervised learning (clustering) groups customers without labels."),
          ("বর্ণনা থেকে ছবি তৈরি", "Generative AI", "Creates a new image from a text prompt (deep-learning-based image generator).")]:
    w("| " + " | ".join(r) + " |")
w("\n**Evaluation rubric (20 points):**\n")
w("| Criterion | 4–5 Excellent | 2–3 Developing | 0–1 Needs work |\n|---|---|---|---|")
for r in [("Comparison completeness (5)", "All 3 questions × 4 criteria filled with reasons", "Some cells missing or unexplained", "Mostly empty"),
          ("Verification (5)", "Original source noted for each question", "Some verified", "No verification"),
          ("Classification accuracy (5)", "5–6 correct, innermost circle with a sound reason", "3–4 correct", "0–2 correct or no reasons"),
          ("Conclusion & safety (5)", "Clear rule for when to use which tool; no personal data", "Vague conclusion", "Missing / unsafe")]:
    w("| " + " | ".join(r) + " |")

# ---------------- G
w("\n---\n## SECTION G — Video post-production\n")
w(f"**Subtitles:** `pillar01-lesson02.bn.srt`, {len(T['cues'])} cues, at most about 66 characters (2 lines) each, timed to the narration. They're burned into the video (Hind Siliguri Bold 42 px, white on 84% navy, cyan for English terms and numbers) and also supplied as an SRT for YouTube/Facebook closed captions.\n")
w("**Voiceover pacing (measured per take):**\n")
w("| Scene | Model | Duration | Pace (chars/s) | Script match |\n|---|---|---|---|---|")
for k, v in MAN.items():
    w(f"| {k} | {v['model']} | {v['dur']:.1f} s | {v['cps']} | {v['ratio']:.2f} |")
w(f"\nDurations and pace above are for the raw takes. In the edit every take was time-stretched ×{TEMPO} (pitch preserved) to fit the 10:00 plan and normalized to the same loudness (−18 LUFS per take before the mix). All takes use the same Orus voice. Several TTS models were used because each free daily quota ran out ({model_note}), so the timbre can shift slightly where the model changes. To make it uniform, regenerate those scenes on one model after the quota resets and re-run the timing script; nothing else changes.\n")
w("Target pace is 11–14 characters per second. Match is the Gemini transcript's similarity to the script, where 1.00 means identical. Small gaps come from spelling variants of English terms.\n")
w("**Music and sound effects:**")
w("- **Music:** the same original code-synthesized soft bed as Lesson 01 (consistent series identity, no licensing), sitting about 20 dB under the voice and sidechain-ducked.")
w("- **Sound effects:** logo sting, a whoosh per chapter card, pops on element entrances, small 'snip' pops as tokens split in scene 08, clicks on search results and a notification on the assistant answer in scene 09, card-flip pops in scene 10, and a success chime at the recap.\n")
w("**Transitions:** chapter card between every scene, previous scene fades out over 0.3 s, and elements enter with ease-out motion. No hard cuts.\n")
w("**Screen highlights and zooms:** nested rings pulse in sequence for the rule in scene 02. Neural-network layers pulse left to right and the weight line highlights in scene 04. Tokens pop one by one in scene 08. Panel borders light up for the matching example in scene 09. For the real capture, use the zooms in Section E.\n")
w("**Thumbnail title:** \"AI, ML, Deep Learning — পার্থক্য কী?\" (main) · subline \"লেসন ০২ · PILLAR 01\". Layout: instructor photo at the left 40%, four nested coloured rings at the right with the labels AI · ML · DL · GenAI, Hind Siliguri Bold text, cyan glow.\n")
w("**Video description (YouTube/Facebook):**\n")
w("```\nAI, Machine Learning, Deep Learning ও Generative AI — পার্থক্য কী? | লেসন ০২ · PILLAR 01 (বাংলা)\n\nএই লেসনে শিখবেন:\n00:00 স্বাগতম\n" + "\n".join(f"{tc(SC[s['id']]['start'])[:5]} {s['title']}" for s in SCENES[1:]) +
  "\n\nঅনুশীলন: একই ৩টি প্রশ্ন Google আর ChatGPT/Gemini-তে করে তুলনা করুন, আর ৬টি উদাহরণ কোন বৃত্তে পড়ে লিখুন।\nনিরাপত্তা: ব্যক্তিগত তথ্য AI চ্যাটে দেবেন না। গুরুত্বপূর্ণ তথ্য আসল উৎসে যাচাই করুন।\n\nপরের লেসন: প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম\n#AIবাংলা #MachineLearning #DeepLearning #GenerativeAI #LLM\n```\n")
w("Chapter times in the description come from the rendered timeline. YouTube needs the first chapter at 00:00, which it is.\n")
w("**Export settings:** H.264 High profile, 1920×1080, 30 fps constant frame rate, yuv420p (the delivered master uses CRF 18). AAC-LC 192 kbps, 48 kHz stereo. Fast-start for web playback. Loudness −14 LUFS integrated, true peak ≤ −1 dBTP.\n")
if QC:
    w("**Measured QC on the delivered file:** " + " · ".join(f"{k}: {v}" for k, v in QC.items() if k not in ("tempo", "master_size")) + "\n")
w("**Accuracy notes (checked for this lesson):** OpenAI's help article on tokens gives the rule of thumb that 1 token is about 4 characters of English text. Bangla generally needs more tokens per word in common tokenizers, but exact counts vary by model (see the Section E part 2 insert). SSC results are published by Bangladesh's education boards on their official sites. Bangladesh's national fruit is the jackfruit (কাঁঠাল).\n")
w("**Before publishing:** replace scene 09's panels with your real capture (Section E) · listen to the full narration once for pronunciation of English terms (neural network, reinforcement, fine-tuning, inference) · turn on the platform's AI-generated content label, because the narration is AI-generated · add the SRT as Bangla captions.\n")
open(f"{P}/deliverables/PRODUCTION_PACKAGE.md", "w").write("\n".join(out))
print("package lines", len(out))

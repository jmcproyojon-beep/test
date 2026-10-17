---
name: bangla-explainer-reel
description: The channel's default video format. Use whenever the user gives a topic, prompt, PDF, article or news item and wants a video/reel/short — they only give the prompt; you write the Bangla script, generate the voice, build a fully animated 9:16 explainer (no presenter photo) with Bangla captions, SFX and music, and render the MP4. Triggers: "make a video about…", "reel on…", "create video", any topic sent with no other instructions.
---

# Bangla animated explainer reel (house style)

The user runs a Bangladeshi AI/tech channel (Facebook/Instagram Reels, YouTube Shorts, TikTok; viewers 18–35).
**They give only a prompt. You do everything else, end to end:** script → voice → animated video → MP4.
**Start from `kit/reel_template.py`** — one self-contained file: line table (speech segments → caption chunks → sfx), tight-VO assembly, word-pop captions, `@scene(i)` functions, end card, template CSS. Copy it to `projects/<slug>/reel.py` with `kit/soundbed.py`, rewrite `LINES` + scenes for the new topic, run `python reel.py && python soundbed.py`, render. (`kit/build*.py`/`voice_edit.py` = the older first reel, for reference.)

If the user supplies their own script (with timestamps/visual notes), keep their wording; split it into short caption lines; use their visual notes and on-screen text (e.g. end card text).

## Output spec (always)
- 1080×1920, 30 fps, H.264 ~14 Mbps (`-b:v 14M -maxrate 16M`), AAC 256k/48 kHz, `+faststart`; final loudness ≈ −14 LUFS.
- 45–60 s. Fully animated scenes, **no presenter photo/avatar** unless the user asks.
- Small "AI-generated" disclosure only if a realistic generated person/image is shown.

## 1. Script (Bangla, Dhaka-style spoken)
- Short sentences (≤ 8 words). English tech words stay English (AI, ChatGPT, model, prompt).
- Structure: Hook (≤ 12 words, 0–3 s) → Context (why it matters in Bangladesh) → 3 numbered points ("এক নম্বর।"…) → proof/practical tip → payoff → CTA ("কমেন্টে "AI" লিখুন। ফ্রি AI টুলের লিস্ট পাঠিয়ে দেবো।").
- Re-hook line every 15–20 s ("কিন্তু আসল খেলা এখানে…", "এবার সবচেয়ে কাজের পার্ট…").
- Local examples: Fiverr/freelancing, bKash, students, BCS, Facebook-page businesses, Dhaka traffic.
- Only claims supported by the user's source; never "এইমাত্র" for news older than a few days.
- Write `bKash` as **বিকাশ** in the TTS text (caption can still show bKash).
- Show the script to the user only if they ask; otherwise proceed.

## 2. Voice — generate it yourself
- Use the **ElevenLabs connector** (`creative_generate_speech`): for news reels prefer **"Tanvir - Confident, Upbeat, Deep"** `SamfdZr6Xh6ZtPUGZUhg` (native Dhaka Bangla, male); otherwise **"Adam - Dominant, Firm"** `pNInz6obpgDQGcFmaJgB`. For a Bangla voice write brand/version names phonetically in the TTS text (ডিপসিক, ভি ফোর পয়েন্ট ওয়ান) and keep Latin in captions (find it via `creative_list_voices`, search "Adam"), model `eleven_v4`.
- **TTS text = spoken words only.** Never include line numbers, "[HOOK]"/"Point 1"/"Payoff" labels or markdown — ElevenLabs reads them aloud (happened once; we had to cut 28 junk segments).
- Generate the whole script in one call so the tone is consistent. Download the `content_url` (storage.googleapis.com is reachable) with curl.
- **Gemini TTS (works, free tier):** `kit/gemini_tts.py` with `GEMINI_API_KEY` (write it to a chmod-600 scratch file, never into the repo), model `gemini-3.8-flash-tts` (fallback `gemini-2.5-flash-preview-tts`), voice `Charon`, prefix the text with a one-line style direction ("Read this in natural Bangladeshi (Dhaka) Bangla like a confident TV news presenter…") — it is not read aloud. Output is 24 kHz WAV.
- **Credits on every end card:** Explainer — **Rubel Miah**; Video Editor — **Paloan**.
- **Fallback chain if ElevenLabs fails** (ElevenLabs ran out of credits / free tier disabled in Oct 2026 — prefer Gemini TTS now) (the account showed "Free Tier access has been disabled… upgrade" once) — the user has asked that a voice always gets made:
  1. Google Cloud Text-to-Speech via the repo tool `tools/audio/google_tts.py` (reads `GOOGLE_TTS_API_KEY` / `GOOGLE_API_KEY` / `GEMINI_API_KEY`; texttospeech.googleapis.com is reachable). Bangla voices: `bn-IN-Chirp3-HD-*`, `bn-IN-Wavenet-*`. Free tier covers a few reels a month.
  2. Free keyless gTTS (`pip install gTTS`, `gtts-cli -l bn`) — only works if `translate.google.com` is allowed in Network access (it is blocked by default here). Robotic; last resort.
  3. Otherwise tell the user what is missing (key or allowed host) and ask for an MP3 — never fake a voice.

## 3. Align voice → lines
- Split at pauses: `ffmpeg -af silencedetect=n=-40dB:d=0.15`, transcribe each piece with local Whisper-small (`kit/transcribe_segments.mjs`; model from npm package `sts-whisper-small`, runtime `@huggingface/transformers@3` — huggingface.co itself is blocked).
- Map pieces to script lines, drop junk pieces, rebuild a tight VO with `kit/voice_edit.py` (writes `voice/vo_clean.wav` + `voice/lines.json`).

## 4. Animated composition (HyperFrames, atelier)
- Follow AGENT_GUIDE Rule Zero (pipeline + preflight). Remotion is not installed here; HyperFrames is → say so.
- `kit/build.py` = line table (captions, sfx) + voice timing; `kit/build2.py` = full-frame scenes + template. For a new topic: copy kit into `projects/<slug>/`, rewrite `LINES` and the `@scene(i)` functions **for the new content** (fresh visual metaphors per line; reuse the engine, not the exact scenes).
- House look: dark background with section-coloured glow, drifting grid + particles, top progress bar, "AI খবর ⚡" brand chip, section pill top-right, big number slams (১/২/৩), white flash on section changes, word-by-word Bangla captions (Hind Siliguri Bold, yellow highlight word, y 1250–1530, keep out of bottom 20%), emoji + CSS/SVG illustrations, a visual change every 1.5–3 s, one shake/glitch max twice.
- Assets: fonts + GSAP from npm (`npm pack @fontsource/hind-siliguri gsap@3.14.2`) — CDNs are blocked. Emoji via local "Noto Color Emoji".
- No real brand logos or fake screenshots; text labels only.

## 5. Sound
- `kit/soundbed.py`: synthesized 104 BPM bed, SFX on cues (boom, whoosh, pop, tick, ding, riser, glitch, flash), music ducked under voice, beat drop at payoff. Writes stems to `renders/stems/`.

## 6. Render + QA
- `npx hyperframes lint` (0 errors) → `snapshot --at …` contact sheets, fix overlaps → `render` (~6 min) → ffmpeg encode to spec → check `ebur128`.
- Deliver with SendUserFile: the MP4 (+ SRT if useful). Summarize scenes briefly in Bangla-friendly English.

## Optional upgrades (need keys the user adds in environment settings)
- Realistic images/video: `FAL_KEY` (FLUX/Seedream + Kling) or `GEMINI_API_KEY`; host must be allowed in Network access.
- Lip-synced presenter: `KLING_API_KEY`.

## News-format reels
`kit/news_reel_template.py` adds broadcast chrome: LIVE badge, scrolling red ticker, per-section lower-third headline bars (the user's on-screen text), 2.5D cards (rotationY + transformPerspective), CSS 3D cube, processor chip, API flow, repo card, comparison with ≠. It runs without a voice (paced at CPS=14) and switches to real timing once `voice/segs.json` + `VOICE_MAP` are filled. Verify news facts with WebSearch before building; soften any claim you cannot confirm and tell the user.

## Themes
- **Dark neon** (`kit/news_reel_template.py`): dark background, section-coloured glow, neon accents, punchy back.out pops, shakes, white flashes.
- **Light editorial** (`kit/news_reel_editorial.py`): cream paper (#F4F1EA) with dot grid, bold black type, electric-blue (#2D5BFF) caption highlight pills, hard offset shadows, rotating accent ring per section; animations are expo.out rises, word slides, gentle punches, parallax drift, and full-screen colour wipes between sections (no flashes/shakes).
Ask nothing — use the theme the user last chose; offer the other when they ask for a change.
- **Creative components** (`kit/news_reel_creative.py`, editorial theme — current default): metaphor-driven widgets instead of plain cards — split-flap departure board, slot machine reels, sonar sweep, boarding-pass printer, RPG level-up card, corkboard polaroids, QC clipboard + rubber stamp, sliding gate doors, snapping puzzle pieces, vault door, printed receipt, balance scale, laser scanner, daily streak, staircase. Invent a fresh metaphor per line for new topics; reuse the CSS idioms (hard offset shadows, thick black borders, steps() printing, bounce drops).
- **Disney-motion layer** (`kit/news_reel_motion.py`, current default): the 12 principles in GSAP — `pop` = exaggerated entrance + squash-&-stretch landing (scaleX/scaleY elastic); `slide` = arc + 3D tilt (solid drawing) + back.out overshoot + lagging rotation follow-through; captions squash-and-stretch per word; anticipation wind-ups before big actions (lever lift, stamp raise, door squeeze, vault counter-turn); arcs/pose-to-pose via GSAP `keyframes` (whale swim, stair hops); secondary action wiggles (mic, trophy, whale bob). Framer Motion is React-only; HyperFrames renders GSAP, so translate Framer Motion requests into these GSAP equivalents.
- **Lottie layer** (`kit/lottiegen.py` + `kit/news_reel_lottie.py`, current default): Lottie JSON is generated in Python (no After Effects here) — `burst` (confetti rays with trim-path follow-through), `ripple` (sonar rings), `scribble` (hand-drawn loop around a word), `check_badge` (ring + tick draw-on with squash-&-stretch pop), `arc_arrow` (arrow drawn along an arc, head overshoots). Keyframes use ABSOLUTE composition time (HyperFrames seeks every Lottie to global time); each is a `clip lot` div on track 9, loaded with `lottie_light.min.js` (npm `lottie-web@5.12.2`, CDNs are blocked) via `animationData`, `autoplay:false`, pushed to `window.__hfLottie`. Use them on punctuation beats: jackpots, level-ups, stamps, clicks, verifications, CTA presses.

---
name: bangla-explainer-reel
description: The channel's default video format. Use whenever the user gives a topic, prompt, PDF, article or news item and wants a video/reel/short — they only give the prompt; you write the Bangla script, generate the voice, build a fully animated 9:16 explainer (no presenter photo) with Bangla captions, SFX and music, and render the MP4. Triggers: "make a video about…", "reel on…", "create video", any topic sent with no other instructions.
---

# Bangla animated explainer reel (house style)

The user runs a Bangladeshi AI/tech channel (Facebook/Instagram Reels, YouTube Shorts, TikTok; viewers 18–35).
**They give only a prompt. You do everything else, end to end:** script → voice → animated video → MP4.
Reference build of a finished reel: `kit/` (built for "OpenAI's 6 AI incidents", Oct 2026).

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
- Use the **ElevenLabs connector** (`creative_generate_speech`): voice **"Adam - Dominant, Firm"** `pNInz6obpgDQGcFmaJgB` (find it via `creative_list_voices`, search "Adam"), model `eleven_v4`.
- **TTS text = spoken words only.** Never include line numbers, "[HOOK]"/"Point 1"/"Payoff" labels or markdown — ElevenLabs reads them aloud (happened once; we had to cut 28 junk segments).
- Generate the whole script in one call so the tone is consistent. Download the `content_url` (storage.googleapis.com is reachable) with curl.
- If ElevenLabs fails (the account showed "Free Tier access has been disabled… upgrade" once), tell the user plainly and ask them to upload an MP3 (their own ElevenLabs export works) — do not fake a voice.

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

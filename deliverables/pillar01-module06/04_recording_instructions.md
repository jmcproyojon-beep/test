# 04 · Screen-recording notes and how to re-record

## What was recorded for this video

- **AI Reel Studio:** a small local web app built for this lesson, labelled on screen “লাইভ ডেমো · Google Gemini API · আসল AI আউটপুট”. Every result in it is produced live by the Google Gemini API: chat (`gemini-3.8-flash`), SVG illustration (`gemini-3.8-flash`), text-to-speech (`gemini-3.8-flash-tts`), audio→SRT (`gemini-3.8-flash`). The export button runs a real render (HyperFrames + ffmpeg).
- **AI avatar:** SadTalker (open source) on the presenter photo, driven by the generated Bangla voice; rendered on CPU (~60 min for 21 s).
- **Recorder:** Chromium via Playwright, 1920×1080, real keystrokes and clicks. Edits: AI waiting time trimmed, long typing sped up, scroll-reads retimed, zooms added. Generated audio and the avatar play at 1×. No AI output was edited.
- **Honest retakes:** (1) the first voice take read the Bangla style note aloud — the style instruction was moved to English; (2) the first English dub glitched (spoke part of the instruction and repeated a line) — regenerated without a style wrapper; (3) the first set of images displayed with mixed colours because the three SVGs shared gradient IDs — fixed in the app and regenerated. All final outputs shown are untouched AI output.
- **Real AI error kept on purpose:** Gemini's SRT had malformed timestamps (`00:03:100` instead of `00:00:03,100`). The video shows the error and the rule-based fix.

| Clip | Demo | AI waits trimmed | Real audio/video played |
|---|---|---|---|
| s03a | ধাপ ১ · স্ক্রিপ্ট (Gemini চ্যাট) | 29 s | — |
| s03b | ধাপ ১ · স্ক্রিপ্ট (Gemini চ্যাট) | 102 s | — |
| s05a | ধাপ ৩ · ভয়েস (Gemini TTS) | 7 s | voice_bn_a · 12 s |
| s05b | ধাপ ৩ · ভয়েস (Gemini TTS) | 13 s | voice_bn_b · 10 s |
| s07a | ধাপ ৫ · অডিও থেকে SRT (Gemini) | 64 s | — |
| s04b | ধাপ ২ · টেক্সট থেকে ছবি (Gemini → SVG) | 210 s | — |
| s04c | ধাপ ২ · টেক্সট থেকে ছবি (Gemini → SVG) | 147 s, 100 s | — |
| s07b | ধাপ ৫ · SRT যাচাই ও প্রিভিউ | — | voice_bn_a · 12 s |
| s08a | ধাপ ৬ · এডিট ও এক্সপোর্ট | — | — |
| s08b | ধাপ ৬ · এডিট ও এক্সপোর্ট | 111 s | reel_final · 6 s |
| s06a | ধাপ ৪ · ডাবিং ও অ্যাভাটার | 9 s | — |
| s06b | ধাপ ৪ · ডাবিং ও অ্যাভাটার | 8 s | voice_en · 10 s |
| s06c | ধাপ ৪ · ডাবিং ও অ্যাভাটার | — | avatar · 12 s |

## Re-record with real tools (ChatGPT / Gemini app / CapCut)

1. Script: ChatGPT or gemini.google.com, new chat, paste the two prompts from 05_prompts.md.
2. Images: ChatGPT image generation, Gemini app, Ideogram or Leonardo — paste the three image prompts; keep the same style words; check hands, faces, text and logos.
3. Image-to-video: Kling, Runway or Veo — upload each image with its motion prompt (5 s each); or use pan/zoom in CapCut.
4. Voice: ElevenLabs, Google AI Studio (TTS) or CapCut text-to-speech; write the style instruction in English; listen to the whole take.
5. Dubbing: translate with the dub prompt, regenerate voice; compare lengths (target ±10%).
6. Avatar: HeyGen / Synthesia / D-ID — only your own face or someone with written permission.
7. Subtitles: CapCut auto-captions or the SRT prompt; check spelling, timing and the timestamp format.
8. Edit: CapCut / Premiere, 1080×1920, 30 fps; music under −18 dB during speech; subtitles above the phone UI; export MP4.
9. OBS 1920×1080/30 fps, browser zoom 125%, notifications off, hide account names.
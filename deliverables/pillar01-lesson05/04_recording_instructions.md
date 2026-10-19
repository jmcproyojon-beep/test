# 04 · Screen-recording instructions

## What was actually recorded for this video

- **Assistant:** Google Gemini through the official API (`gemini-3.7-flash`, `gemini-3.8-flash`), streamed into a simple chat page that is clearly labelled on screen “Google Gemini · লাইভ API ডেমো · আসল AI উত্তর”. It is **not** the ChatGPT website. The video says so in scene 01.
- **Recorder:** Chromium (Playwright) at 1920×1080, real keystrokes typed into the box, real Send click, the answer rendered as it came back. Nothing was typed or edited into the answers afterwards.
- **Editing:** only the waiting time before each answer was cut (shown per clip below), and typing was sped up where a prompt was very long. Answers are shown exactly as returned.

| Clip | Demo | Turn | Real wait cut | Typing speed | Read-through speed |
|---|---|---|---|---|---|
| s02b | শিক্ষার্থী · Photosynthesis | 1 | 19.7 s → 1.2 s | ×1.01 | ×0.85 |
| s02c | শিক্ষার্থী · Photosynthesis | 2 | 20.6 s → 1.2 s | ×1.0 | ×0.55 |
| s03b | অফিস · মিটিং নোট → Action Plan | 1 | 13.4 s → 1.2 s | ×1.0 | ×0.55 |
| s03c | অফিস · মিটিং নোট → Action Plan | 2 | 17.1 s → 1.2 s | ×1.0 | ×0.55 |
| s04b | ইমেইল · দুর্বল প্রম্পট | 1 | 100.9 s → 1.2 s | ×1.0 | ×0.55 |
| s04c | ইমেইল · শক্তিশালী প্রম্পট | 1 | 6.8 s → 1.2 s | ×1.0 | ×0.55 |
| s04d | ইমেইল · শক্তিশালী প্রম্পট | 2 | 6.9 s → 1.2 s | ×1.0 | ×0.55 |
| s07b | রিসার্চ · সারাংশ + উৎস-বাক্য | 1 | 54.2 s → 1.2 s | ×1.56 | ×0.55 |
| s07c | রিসার্চ · সারাংশ + উৎস-বাক্য | 2 | 130.7 s → 1.2 s | ×1.0 | ×0.55 |
| s08b | পরিকল্পনা · বিকেলের রুটিন | 1 | 20.5 s → 1.2 s | ×1.0 | ×0.55 |
| s05b | ব্যবসা · ৭ দিনের ফেসবুক ক্যালেন্ডার | 1 | 147.9 s → 1.2 s | ×1.0 | ×1.59 |
| s05c | ব্যবসা · ৭ দিনের ফেসবুক ক্যালেন্ডার | 2 | 80.2 s → 1.2 s | ×1.0 | ×0.68 |
| s06b | ক্রিয়েটর · ভিডিও আইডিয়া → স্ক্রিপ্ট | 1 | 22.9 s → 1.2 s | ×1.0 | ×1.71 |
| s06c | ক্রিয়েটর · ভিডিও আইডিয়া → স্ক্রিপ্ট | 2 | 129.2 s → 1.2 s | ×1.0 | ×0.95 |
| s09b | পূর্ণ ওয়ার্কফ্লো · স্টেশনারি দোকান | 1 | 176.2 s → 1.2 s | ×1.23 | ×1.62 |

## How to re-record with ChatGPT (or Gemini / Claude) yourself

1. Use Chrome on a computer. Create a separate browser profile with no bookmarks, extensions or saved history.
2. Sign in at `chatgpt.com` (or `gemini.google.com`). Hide the sidebar or blur it in the edit. Hide your name, e-mail and profile picture.
3. Display 1920×1080, browser zoom 125% so Bangla text is readable after export. Turn off notifications (Windows Focus Assist / macOS Do Not Disturb).
4. Recorder: OBS Studio, canvas 1920×1080, 30 fps, MKV (remux to MP4), cursor visible. Record each demo as a separate file.
5. Start a **new chat** for every demo. Paste the prompt from `05_prompts.md` exactly (typing it live is fine; speed it up in the edit).
6. Press Send once and do not touch the mouse until the answer finishes. Then scroll slowly (about one screen every 3 s) to the end.
7. Type the follow-up prompt in the same chat, send, wait, scroll again.
8. Never regenerate to get a ‘better’ answer for the video without saying so on screen. If an answer contains an error, keep it and point it out — that is the verification lesson.
9. Copy every answer into a text file with the date, tool and model name, so on-screen claims can be checked later.

**Edit:** cut the waiting spinner to ~1 s, zoom 125–150% on the prompt box while typing and on the answer while reading, add a cursor highlight ring on the Send click, keep every answer frame unedited.

**Privacy:** all data in the prompts is fictional (meeting note, library report, shops). Never paste real customer, student, NID, bank or password data into a public AI tool.

**Expected differences:** ChatGPT and Gemini will answer the same prompts with different wording, length and formatting. Teach the *method* (role, context, constraints, format, follow-up, verification), not the exact text.

# সাড়ে বারো — Lyric Video v3 (vertical, scroll-stopping)

**File:** `sare-baro_lyric_video_v3_9x16.mp4` · 2:07.8 · **1080×1920 (9:16, Reels / TikTok / Shorts)** · 30 fps · H.264 + AAC 256 kb/s (original song) · `sare-baro.lyrics.bn.srt`

**Lyric fix:** "পেতে দৌড়ায় ইদুর" → **"পেটে দৌড়ায় ইদুর"**, applied to this video and to every lyrics SRT in the deliverables. The earlier two videos still show পেতে on screen; they need a re-render to change it.

## What's different from v2 (all in your "Paloan Animate Kor" style)
- **Hook in the first second:** "সাড়ে বারো" slams in at 0.05 s with an RGB split and a colour-invert flash. A clock spins to 12:30, and every beat punches the title.
- **Word-level lyric sync:** each word's start time came from Gemini word alignment inside the vocal-aligned line windows, then snapped to the nearest detected vocal onset (within ±0.12 s). Each word pops in exactly as it is sung.
- **Beat animation (~81 BPM):** on every beat the whole frame bounces, a rotating sunburst and halftone layer pulses, and key words glow yellow.
- **Distortion:** red/cyan chromatic split on every word, an SVG displacement warp that ripples the frame on each line change and hook, VHS tracking bars, screen shake, colour-inverted impact flashes, and lines exiting with a skew-glitch.
- **Collage:** taped torn-paper props for each line (sun, moon, eye, doorbell, fridge, bell, fly, tap, laptop under the pillow, mouse, flame …). Every hook becomes a six-ring clock tunnel.
- **Texture:** grain, scanlines and a vignette. The top tag and a gradient progress bar give a social-feed look.

## Tools
HyperFrames render engine (local CLI) and ffmpeg. The HyperFrames-by-HeyGen MCP was not used for rendering: it has no `check_hyperframes_render` tool (only status checks for cloud projects), cloud `compose` cannot use a local song file, and `compose`/`render_video` are disabled from Claude Code. The local engine produced the same HyperFrames output, using your real audio.

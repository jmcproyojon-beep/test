---
name: motion-skills
description: Router and shared verify toolkit for the 55 iart.ai motion-graphics craft skills (kinetic type, data charts, explainers, TikTok/Reels, ads, e-commerce, maps, logo/brand motion, web animation, WebGL/shaders, Manim, canvas-drawn films, lower thirds, b-roll, talking heads, freelance motion business). Use when picking which motion craft skill applies to a brief, or when a motion skill says to run `scripts/seek-shot.sh`, `scripts/contact-sheet.sh` or `scripts/probe-mp4.sh`.
version: 0.1.0
---

# Motion Skills (iart.ai) — router + verify toolkit

Vendored from [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills) and its 19 pack repos (MIT). See `PROVENANCE.md` for commits.
Every sibling skill listed below is a self-contained `SKILL.md` + `references/` folder in `.agents/skills/`.

## How these fit OpenMontage

- These are **Layer 3 craft knowledge** (how a pro builds the motion), not pipelines. **Rule Zero still applies**: any video request runs through a `pipeline_defs/` pipeline and its stage director skills; read the matching skill below when a stage needs that craft (e.g. `chart-animation` during an animated-explainer scene build, `caption-animation` at compose).
- In **atelier mode**, read them as a *mechanics/craft codex* (timing, easing, safe areas, verify loops) — do not paste their example components as a finished look.
- Skills that call paid APIs (`talking-head` → fal.ai MiniMax + ElevenLabs; `talking-head-b-roll` optional ElevenLabs STT) fall under the Decision Communication Contract: announce tool/provider/model/cost before the first call.

## Shared toolkit — path mapping

Pack skills say `scripts/<name>.sh`. In this repo those live at **`.agents/skills/motion-skills/scripts/`**:

| Script | Use | Needs |
|---|---|---|
| `seek-shot.sh <file.html> [t...]` | Freeze a standalone HTML animation at `?t=N` and screenshot each moment | Playwright Chromium |
| `contact-sheet.sh <out.png> <frames...>` | Tile start/mid/end frames into one image | ffmpeg |
| `probe-mp4.sh <file.mp4> [WxH] [fps]` | Assert the real encoded spec | ffprobe |

Skill-local scripts (e.g. `lower-thirds/scripts/render.mjs`, `javascript-animation/scripts/render.mjs`, `talking-head-b-roll/scripts/transcribe.mjs`) stay inside their own skill folder.

Cloud-container note: Playwright + Chromium are preinstalled — don't let `npx -y playwright` fetch another version. If `seek-shot.sh` fails, screenshot with `require('playwright')` directly (`chromium.launch()`, `page.goto('file://…?t=N')`, `page.screenshot()`).

## The deliver-and-verify loop (common to every visual skill)

1. Build the deliverable at the right tier — **Light**: one standalone `.html` with a `?t=N` freeze harness; **Heavy**: Remotion or Manim render.
2. Freeze start / mid / end frames (`seek-shot.sh`, `npx remotion still`, or `manim -s`).
3. Tile them with `contact-sheet.sh` and **look**: fidelity to the brief, clipped text, off-canvas elements, FOUC, safe areas, loop seam.
4. For video, `probe-mp4.sh out.mp4 1080x1920 30` to assert the real spec. Fix and repeat.

## Router — pick the skill

| Brief | Skill(s) |
|---|---|
| TikTok / Reels / Shorts, hooks, retention, loops | `short-form-video`, `caption-animation`, `countdown-video` |
| Fake text/iMessage/WhatsApp story | `text-message-animation` |
| Podcast clip / waveform, YouTube intro/outro/end screen | `audiogram`, `youtube-intro-outro` |
| Sale / promo, product demo, photo slideshow | `promo-video`, `product-demo-video`, `photo-slideshow` |
| Video ads, launch/hype film, testimonial | `ad-creative-video`, `launch-video`, `testimonial-video` |
| CSV → chart / bar race, infographic, deck → video | `chart-animation`, `animated-infographic`, `presentation-video` |
| Explainer, whiteboard, isometric, diagram reveal, "Wrapped" recap | `explainer-video`, `whiteboard-animation`, `isometric-animation`, `diagram-animation`, `wrapped-video` |
| Vox-style map, route, region highlight | `map-animation` |
| Headline / title / lyric type | `kinetic-typography` |
| Logo sting, brand motion, art direction, color, composition, easing, beat cuts, backgrounds | `logo-animation`, `motion-art-direction`, `color-motion`, `shot-composition`, `animation-principles`, `beat-sync-editing`, `motion-background` |
| Remotion how-to / After Effects expressions | `remotion-video`, `after-effects` |
| Zero-asset canvas film drawn in JS + code-made music | `javascript-animation`, `soundtrack` |
| Animated illustration / generative art | `generative-illustration` |
| Transparent lower thirds / stream overlays (WebM alpha, ProRes 4444) | `lower-thirds` |
| B-roll graphics timed to a talking-head's words | `talking-head-b-roll` |
| AI talking head from photos + voice | `talking-head` |
| Web: GSAP/ScrollTrigger, SVG, Lottie, page transitions, micro-interactions, 60fps, reduced-motion, glass, ASCII | `gsap-web`, `svg-animation`, `lottie-animation`, `page-transition-animation`, `micro-interaction`, `60fps-animation`, `accessible-animation`, `glassmorphism`, `ascii-animation` |
| WebGL: Three.js scenes, shaders, particles | `webgl-threejs-animation`, `shader-glsl`, `particle-system` |
| Math animation | `manim` (pairs with existing `manimce-best-practices`) |
| Freelance business: brief, pricing, revisions, delivery specs, motion guidelines | `creative-brief`, `motion-pricing`, `client-revisions`, `video-delivery-specs`, `brand-motion-guidelines` |

Renamed on install: upstream `threejs-animation` → **`webgl-threejs-animation`** (the name `threejs-animation` was already taken by the `cloudai-x/threejs-skills` skill). Upstream ships `lower-thirds` twice; the newer dedicated `lower-thirds-skills` version is installed.

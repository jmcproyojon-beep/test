---
name: mg-styles
description: Make motion-design / lyric-video films with the mg-styles-15 toolkit (15 canonical MG styles — cel boil, isometric, flat vector, line art, 3D, shape morph, sticker explainer, HUD/FUI, collage/cut-out, aurora glass, Bauhaus, synthwave/VHS, pixel, liquid, variety captions). Use when the user asks for one of these styles, an award-level MG film, or a collage/cut-out lyric video, or names mg-styles-15.
---

# mg-styles-15 in this repo

Source: https://github.com/Vincentwei1021/mg-styles-15 (MIT). Installed git-ignored at `./mg-styles-15`.

## Setup (every new cloud session)
`scripts/setup-mg-styles.sh` — clones, `npm install`, Python audio deps (`python3 -m pip`; plain `pip` targets a different Python here),
fetches the Latin fonts from npm @fontsource (Google Fonts is blocked) and links a CJK fallback, links our films from `films/` into `demos/`.

## How a film works
- A film is `demos/<slug>/index.html` that defines `window.DEMO = {width,height,fps,duration}` and `window.renderAt(t)` (pure function of t,
  seeded randomness only), then sets `window.__ready = true`. Pages are served from the repo root (`/assets/...`, `/demos/...`).
- `audio.py` writes `out/audio.wav` (mgaudio in `lib/audio`: recipes, SFX, mastering to −14 LUFS / −1 dBTP). `cues.json` is the one cue sheet both read.
- The 15 prompts are in `prompts/*.md` (signature features per style), `rubric.md` is the jury review, `template.md` writes a new style.

## Render
- `MG_CPU=1 scripts/mg-render.sh demos/<slug> --workers 4` → `demos/<slug>/out/video.mp4` (builds audio first if missing).
- Stills: `... --stills 0.5,2,4 --scale 0.5 --noaudio`. Part: `--from 10 --to 14 --out x.mp4`.
- `MG_CPU=1` (CPU canvas) is ~10–15x faster for Canvas2D/SVG films; WebGL/Three.js films need the default SwiftShader mode.
- Deliverables over 30 MB: two-pass x264 re-encode to fit SendUserFile.

## Our films
- `films/30-manobotar-dak` — «মানবতার ডাক», collage/cut-out lyric film (6:07). Assets: `work/fetch.py` (Cleveland Museum CC0 API needs a
  browser User-Agent; NASA images API), `work/prep.py` (GrabCut / ink / oval / torn cut-outs with halftone + scissor rims, reuses 06-collage helpers),
  `work/hero.py <character sheet>` (singer → flip-top cap lid, puppet jaw, body/back/profile), `work/cues.py <song> <srt>` (lyric lines + beats + vocal
  envelope), `audio.py <song>`. Hero assets are optional: the page falls back to the 06-collage Victorian portrait.

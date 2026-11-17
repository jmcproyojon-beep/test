---
name: cinematic-film
description: Makes narrated cinematic films entirely from code, on any subject. One continuous camera glides over one designed world of photos, documents, cards, maps with routes and big numbers, with every stamp, highlight and number landing on the narrator's word, then sound effects, an optional score and burned-in captions. For documentaries and history, product launches, brand and founder stories, science and tech explainers, biographies and true crime. Covers the script, voiceover from any TTS split into timed lines, images (archives with their licences, your own photos, AI stills), a beat table, the scene, self-review stills and a memory-safe parallel render. Use for "make a cinematic video about", "documentary about", "explainer video", "launch film", "Vox-style video", "evidence board animation", or turning a story into a video for X, YouTube or TikTok.
---

# Cinematic film (Moh4696/cinematic-skill)

The full skill — rules, workflow, gates, self-review, tools — is the upstream `SKILL.md`. Read it first:
`cinematic-skill/skills/cinematic-film/SKILL.md`, and its `references/*.md` when a step names them.

## In this repo's cloud sessions

- Library: `./cinematic-skill` (git-ignored, pinned commit). Missing in a fresh container → `scripts/setup-cinematic-skill.sh`
  (clones, applies our Commons patch, installs skia-python/numpy/pillow/scipy, libEGL/libGL for skia, espeak-ng; runs `check_setup.py`).
- Scripts: `S=cinematic-skill/skills/cinematic-film/scripts`, then `python3 $S/<script>.py --project <folder>`.
  Put film projects in `films/<name>/` of this repo (commit the sources; keep renders, audio and downloaded photos out of git).
- **Wikimedia Commons from this cloud IP:** originals and non-standard sizes get HTTP 429. Always fetch with
  `COMMONS_THUMB_WIDTH=1920 python3 $S/fetch_commons.py get --project P`, and when it still stops on 429, wait ~60–75 s and
  run it again: it skips what it already has and keeps going (the Wright example needed several rounds).
- Fonts: run `python3 $S/get_fonts.py --project P` per project (Linux has no Bebas Neue / Homemade Apple).
- Scratch voice: espeak-ng (`tts_say.py`). Final voice: any TTS or the user's recording (`references/voice.md`); for Bangla
  narration use the user's own recording (edge-tts cannot stream through this proxy).
- Speed here: ~3 fps per worker at 720p, 3 workers (the 89 s example draft rendered in ~6 min; captions pass ~1.5 min).
- Deliverables over 30 MB: re-encode (x264 CRF 26–28, or two-pass) before SendUserFile.
- Tested end to end on the shipped example ("Twelve Seconds", Wright brothers): fetch → map → prep → voice → split → build →
  render → cues → sfx → mix → burn_captions.

---
name: editor
description: >-
  Edit existing footage from the shell: trim and cut, join clips with
  crossfades, remove dead air, reframe 16:9 to 9:16 for shorts, burn captions,
  add titles, lay a ducked music bed, colour grade, change speed, normalise
  loudness and export for web, social or GIF. Use when the user hands over
  footage and wants it cut, tightened, captioned, reformatted or exported.
  Runs locally with ffmpeg; no app or API key needed.
---

# editor

Quick, deterministic edits to footage the user already has. Each command reads
one file and writes a new one (never in place) and prints JSON with the output
path, duration and resolution.

Script: `scripts/edit.py` in this skill's folder
(in this repo: `.claude/skills/editor/scripts/edit.py`).

**Scope.** This is for editing existing footage. A request to *produce* a video
(an explainer, trailer, ad or anything that needs script, generated assets or
narration) must go through an OpenMontage pipeline per Rule Zero in
`AGENT_GUIDE.md`. Use this skill inside those pipelines' edit stages or on its own
for "cut this", "make this vertical", "add captions to this".

## Workflow

1. **Look first** with the `watch` skill: `overview` the footage and Read the
   filmstrip and waveform. Never cut blind.
2. **Plan the cut** as a list of time ranges and tell the user what you will
   keep and drop.
3. **Edit in steps**, one command per change, writing `step1.mp4`, `step2.mp4`
   and so on into a working folder. Put the content edits (cut, tighten)
   first, then reframe, then captions and titles, then music, then loudness,
   then export.
4. **Check the result**: `watch filmstrip` / `grab` the output at the edit
   points, and check the duration in the JSON.
5. Hand over the final file and list exactly what was done.

## Commands

```bash
E=.claude/skills/editor/scripts/edit.py
python3 $E trim      in.mp4 out.mp4 --start 8 --end 12
python3 $E keep      in.mp4 out.mp4 --ranges "0-4.2, 9.5-15, 1:02-1:10"   # keep these, joined
python3 $E cut       in.mp4 out.mp4 --ranges "3-5, 12.5-14"               # drop these
python3 $E concat    out.mp4 a.mp4 b.mp4 c.mp4 [--aspect 16:9] [--xfade 0.5]
python3 $E tighten   in.mp4 out.mp4 [--min 0.6 --pad 0.15 --noise -35] [--dry-run]
python3 $E reframe   in.mp4 out.mp4 --aspect 9:16 [--mode crop|pad|blur] [--x 0.5]
python3 $E captions  in.mp4 out.mp4 --srt subs.srt [--style clean|box|yellow] [--size 56] [--position bottom|middle]
python3 $E title     in.mp4 out.mp4 --text "Chapter 1" --start 0 --end 3 [--position center|top|bottom|lower-third] [--box]
python3 $E music     in.mp4 out.mp4 --music bed.mp3 [--volume 0.18] [--no-duck]
python3 $E grade     in.mp4 out.mp4 --look neutral|warm|cool|punchy|cinematic|bw|fade  [--lut file.cube]
python3 $E speed     in.mp4 out.mp4 --factor 1.5
python3 $E normalize in.mp4 out.mp4 [--lufs -14]
python3 $E export    in.mp4 out.mp4 --preset web|social|small|gif|audio
```

Times are seconds or `mm:ss(.ms)`. Aspect choices: 16:9, 9:16, 1:1, 4:5, 4:3.

## Recipes

**Remove filler and pauses from a talking-head clip.** Run `tighten --dry-run`
first and show the user how much it removes. For filler words, run
`watch transcribe` (it gives per-word timings), collect the ranges of "um",
"uh" and false starts, then `cut --ranges`.

**Captions.** Run `watch transcribe clip.mp4 --srt subs.srt`, read the .srt
and fix names and jargon, then `captions --srt subs.srt`. Transcribe the *final
cut*, not the original, or the timings will drift.

**Vertical short from a landscape video.** Pick the moment with `watch`, `trim`
it, then `reframe --aspect 9:16`. Use `--mode crop` with `--x` aimed at the
subject (check with `grab`), or `--mode blur` when the whole frame matters.
Add `captions --position middle` and finish with `export --preset social`.

**Music bed.** `music` loops the track to the video's length, fades it in and
out, and ducks it under speech by default. Use `--volume 0.1` for speech-heavy
clips and up to `0.3` for montage.

## Notes

- Cuts re-encode, so they are frame-accurate (not snapped to keyframes).
- `concat` scales and pads each clip to one size and frame rate, and adds
  silent audio to clips without any, so mixed sources join cleanly.
- Grading presets are starting points; judge them on a `grab` before applying
  them to a long render.
- On an ffmpeg error the JSON contains `error` with the tail of ffmpeg's
  message. Read it before retrying.

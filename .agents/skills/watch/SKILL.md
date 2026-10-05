---
name: watch
description: >-
  Watch and understand footage: answer questions about a video or audio file,
  summarize it, find scenes and moments, pull quotes, and describe what happens
  and when. Use whenever the user asks what's in a piece of footage, wants a
  summary or recap, wants to locate a moment ("where does X happen", "find the
  scene where..."), or needs a claim about a video or audio file checked.
  Runs locally with ffmpeg; no app or API key needed.
---

# watch

You cannot play video. This skill turns footage into things you *can* read: JSON
metadata, labelled contact sheets, single frames, waveforms with pauses marked,
scene-change times and a timed transcript. Look at the images with the Read tool.

Script: `scripts/watch.py` in this skill's folder
(in this repo: `.claude/skills/watch/scripts/watch.py`). Every command prints JSON.

## Requirements

- `ffmpeg` and `ffprobe` (required)
- `Pillow` (for contact sheets and waveforms; in `requirements.txt`)
- Transcription only: `pip install faster-whisper`. The first run downloads the
  model from huggingface.co. If that host is blocked, say so and work from the
  visuals and waveform instead of guessing what was said.

## Start here

```bash
python3 .claude/skills/watch/scripts/watch.py overview clip.mp4 --transcribe
```

`overview` runs probe, a 12-20 frame contact sheet, scene cuts and a waveform
(and the transcript with `--transcribe`) in one go. Then **Read the
`filmstrip.png` and `waveform.png` it lists.** Most questions can be answered from
that. Zoom in only where you need to.

## Commands

| Command | What it gives you |
| --- | --- |
| `probe FILE` | duration, resolution, fps, codecs, rotation, audio channels |
| `filmstrip FILE [-n 12] [-c 4] [--start S --end E]` | one image grid of evenly spaced frames, each labelled with its timestamp |
| `grab FILE -t 3.5 12 40.2 [-w 960]` | full frames at exact seconds, as PNGs |
| `scenes FILE [--threshold 0.3]` | scene-change times; `hard` = clear cut, `soft` = dissolve or cut between dark shots |
| `waveform FILE [--noise -35] [--min 0.5]` | waveform PNG with silences in red, silence list, mean/peak loudness |
| `transcribe FILE [--model base] [--srt out.srt] [--no-words]` | timed segments with per-word timings; optional .srt |
| `overview FILE [--transcribe] [-o DIR]` | all of the above at a glance |

Images go to a temp folder unless you pass `-o`/`--output`.

## How to answer well

1. **Ground every claim in a frame or a transcript line.** Cite timestamps
   (`00:12.4`) for anything you state happens.
2. **Locate, then confirm.** To find a moment, scan the filmstrip and transcript,
   then `grab` the candidate times (or a tighter `filmstrip --start --end`) and
   check before answering.
3. **Long footage:** run `filmstrip` per section (e.g. every 2 minutes with
   `--start/--end`) instead of one grid with tiny tiles.
4. **Quotes** come from `transcribe`, verbatim, with their start time. Whisper
   can mishear names and jargon; flag uncertain words instead of silently
   correcting them.
5. **Scene detection is a hint.** Soft transitions can be missed or doubled;
   confirm important boundaries with `grab` either side of the cut.
6. Say plainly what you could not check (no audio track, transcription
   unavailable, too dark to read).

## Related

- `editor` skill: cut, caption and export once you know what is in the footage.
- Full productions go through an OpenMontage pipeline (see `AGENT_GUIDE.md`);
  `tools/analysis/` has the pipeline versions of these analyses.

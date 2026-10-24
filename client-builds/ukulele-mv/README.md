# অচেনা শহর, নতুন সকাল — music video build

Full-length music video (4:03) cut from seven 10-second ukulele clips, every
cut locked to the song's beat grid, with the Bengali lyrics burned in.

## Inputs (not in git)

```
projects/ukulele-mv/
├── assets/video/01..07*.mp4        # 7 clips, 640x360, 24fps, 10.005s each
├── assets/audio/song-source.mp4    # the supplied track (opus in mp4)
├── assets/audio/song.wav           # extracted, 243.17s
├── assets/audio/beats.json         # 553 beats @ 136.00 BPM (librosa)
├── assets/audio/words.json         # 197 word timings (ElevenLabs Scribe)
└── renders/ochena-shohor-music-video.mp4
```

## Run order

```bash
python3.13 -I client-builds/ukulele-mv/plan_edit.py    # beat-locked cut list + lyric lines
python3.13 -I client-builds/ukulele-mv/make_lyrics.py  # lyric PNGs + title card
python3.13 -I client-builds/ukulele-mv/build_mv.py     # render each cut
python3.13 -I client-builds/ukulele-mv/stitch_mv.py    # concat, lay the song, deliver
```

Needs `python3.13` specifically — `pip` installs into 3.13 here while `python3`
is 3.11, so librosa is only importable from 3.13.

## How the sync works

`librosa.beat.beat_track` gives 553 beats at 136.00 BPM (interval 0.4412s,
std 0.015s — the track is machine-steady). Every cut boundary in
`edit-plan.json` is one of those beat times, and cut lengths are whole beats:
8 or 16 in the verses and the bridge, 4 in the choruses, 2 in the last chorus
where the song pushes. Cuts are hard, never dissolves — a crossfade smears the
exact frame the picture changes on, which is the thing that makes an edit feel
locked to the music.

Verify with scene detection rather than by eye:

```bash
ffmpeg -i renders/ochena-shohor-music-video.mp4 \
  -vf "select='gt(scene,0.25)',metadata=print" -an -f null -
```

69 of 90 cuts register within two frames (median 19ms). The other 21 are cuts
between two similar shots — a fretboard to another fretboard — which the
detector scores below threshold. They are still exactly on the beat.

## Three bugs that produced silently wrong video

All three rendered without an error and had to be caught by measurement:

- **`-ss`/`-t` after `-i` go to the NEXT input.** With the overlay PNGs added
  as extra inputs, the trim was being applied to them instead of the clip, so
  every segment played the clip from 0:00 rather than its chosen moment.
  Trimming happens in the filtergraph now (`trim=start=…:duration=…`).
- **`setpts` does not create frames.** A slowed segment kept the source frame
  count and ended short, walking every later cut off the beat. `fps=24` after
  the `setpts` generates the in-between frames.
- **The picture started a beat early.** The first beat is at 0.418s but the
  video starts at 0:00, so the whole edit sat 0.95 of a beat ahead of the
  music. The opening cut is pulled back to zero.

`build_mv.py` now asserts every segment's frame count against the plan and
refuses to finish if any is wrong, because none of these announced themselves.

## Reusing seven clips for four minutes

91 cuts from 70 seconds of footage. What keeps it from reading as a loop:

- Each clip is split into content zones (`ZONES`) — mid, close, portrait, wide,
  strum — and cuts are chosen by what the section needs, never the same clip
  twice in a row, with the last six zones excluded from reuse.
- Each cut gets its own zoom (1.0–1.18), crop anchor and a slow drift across
  the cut, so the same two seconds of source reads as a different framing.
- The grade follows the lyric arc: cool through the verses ("a thousand people
  behind glass, still so alone"), warm through the choruses, golden in the last
  one, cooling again as it fades.

Screen time is spread fairly evenly: 22s to 49s per clip.

**Shots of hands playing are never speed-changed.** Only mid, portrait and wide
shots are slowed (to at most 1.7x) for long holds. Slowing a strumming hand
makes the playing stop matching the music, which is the one thing that gives a
cut-together performance away.

## Lyrics

Transcribed with ElevenLabs Scribe (`eleven_scribe_v1`) — 197 words with
per-word timings, detected as Bengali at 0.99 confidence. Local Whisper is not
an option in this container: Hugging Face is blocked by the proxy, so the model
download 403s.

`lyrics.py` groups words into 45 singable lines, breaking on the danda, on
pauses over 0.9s, and on commas once a line is long enough to stand alone, then
folds stranded single words back into their line.

ffmpeg's `drawtext` has no complex-script shaping and mangles Bengali
conjuncts, so every lyric is rendered with Pillow instead and composited as a
PNG. A line is drawn in one call per row — splitting a Bengali string any finer
breaks the shaping.

Lines fade only at their real start and end, so a lyric spanning several cuts
does not blink at each join.

## Output

1280x720 (2x the source, no upscaling past that), 24fps to match the clips,
52 MB. Sized for YouTube and Facebook — too large for WhatsApp, which would
need a separate smaller encode.

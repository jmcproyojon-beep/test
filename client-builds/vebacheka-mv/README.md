# Vebacheka Ukulele Cover — lyric burn + cinematic grade

Burns the client's own SRT onto their own video and grades it. Nothing is
re-cut, re-framed, cropped or letterboxed; no footage, logo or card is added;
the audio is copied through untouched.

## Run

```bash
git clone https://github.com/jmcproyojon-beep/test
cd test
git checkout claude/openmontage-setup-i6a0qy

python3 client-builds/vebacheka-mv/preflight.py "Vebacheka Ukulele Cover.mp4"
python3 client-builds/vebacheka-mv/cinematic.py  "Vebacheka Ukulele Cover.mp4"
# -> projects/vebacheka-mv/renders/<name>-lyrics-cinematic.mp4
```

Run `preflight.py` first — it checks ffmpeg, Pillow, raqm, the font and the
video, and says READY or names what is missing. It takes a second; the render
takes considerably longer.

Needs only ffmpeg and `pip install "pillow[raqm]"`. The font is bundled.

It probes the source and scales the lyric type, outline, shadow and margin to
whatever resolution comes in, so 1080p and 4K both land correctly. `crf` and
`preset` are arguments to `run()` if the default (17 / slow) is too slow.

## Lyrics

`projects/vebacheka-mv/assets/lyrics.srt` is the client's file, stored
verbatim — their wording and their timings are authoritative. 31 lines,
27.0s to 242.5s, no overlaps.

`cinematic.py` prints a warning if any line runs past the end of the video,
which is the one thing that would silently drop lyrics.

## libass is not usable here, despite being built in

The obvious route is `-vf subtitles=lyrics.ass`, and this ffmpeg does have
`--enable-libass --enable-libharfbuzz`. It still renders Bengali wrong: the
filter exposes no `shaping` option, and under the default shaper libass
reorders vowel signs and misplaces trailing punctuation —

```
          wanted:  অচেনা শহর, নতুন সকাল
  libass rendered: ,অচনো শহর, নতুন সকাল        <- ে moved onto ন, comma jumped to the front
```

**Pillow needs raqm for the same reason.** Without it Pillow falls back to
basic layout and reorders the vowel signs exactly as libass does, silently.
`make_lyrics.py` refuses to run rather than burn mangled text into a finished
video, and `preflight.py` checks for it up front.

So lyrics are rendered with Pillow (which uses raqm, and shapes correctly) and
composited as images. Each line is drawn in one call per row — splitting a
Bengali string any finer breaks the shaping — and cropped to its own text
rather than the full frame, so burning 31 overlays in one pass stays cheap.
Each strip is looped only for its own span and shifted onto the timeline with
`setpts`, with `repeatlast=0` so none of them linger.

Always check a finished render at full resolution, not a thumbnail. At small
sizes the broken shaping above is invisible.

## The grade

Five stages, kept restrained — it should look like film, not like a filter:

| stage | why |
|---|---|
| `curves` | gentle S with a lifted toe, so the blacks stay open instead of crushing |
| `colorbalance` | cool shadows against the warm practice-lamp — the standard teal/amber split |
| `eq` | slight contrast and saturation, short of clipping |
| `vignette` | light, just enough to hold the eye centre-frame |
| `noise` | fine grain; also breaks up banding in the dark background |

Pass `grade=False` to `run()` for lyrics only.

## Getting the file into a cloud session

The source lives on Google Drive and this container could not fetch it:
`drive.google.com` and `drive.usercontent.google.com` are refused by the
environment's network policy, `www.googleapis.com` is reachable but wants an
API key, and the Drive connector only returns base64 — 259 MB of it.

Either allow `drive.google.com` under the environment's network settings, or
run this on a machine that already has the file.

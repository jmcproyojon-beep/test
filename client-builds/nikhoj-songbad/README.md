# নিখোঁজ সংবাদ — animated lyric video build

Full-length (5:51) animated lyric video for Raparrubel's "নিখোঁজ সংবাদ",
built from the artist's own master and cover art. No other footage or imagery
is used: the only picture in the video is their cover.

## Inputs (not in git — `projects/` is gitignored)

```
projects/nikhoj-songbad/
├── assets/audio/song.mp3        # the 320k master, 351.17s
├── assets/audio/song.wav        # decoded for analysis
├── assets/audio/words.json      # 366 word timings (ElevenLabs Scribe)
├── assets/audio/beats.json      # 749 beats @ 129.20 BPM (librosa)
├── assets/images/cover.png      # the release artwork, 1254x1254
└── renders/nikhoj-songbad-lyric-video.mp4
```

`lyrics.txt` here IS the artist's lyric sheet, stored verbatim and tracked —
deliberately not under `projects/`, which git ignores.

## Run order

```bash
python3.13 -I client-builds/nikhoj-songbad/align.py      # check the alignment first
python3    -I client-builds/nikhoj-songbad/make_type.py  # 83 lyric images
python3    -I client-builds/nikhoj-songbad/build_bg.py   # 351s moving background
python3    -I client-builds/nikhoj-songbad/compose.py    # composite, mux, deliver
```

`align.py` needs python3.13 here (librosa and friends install into 3.13 while
`python3` is 3.11). The rest run on either.

`build_bg.py` renders 10,535 frames of 1080p and takes a while; it is a
separate step precisely so the composite can be re-run without repeating it.

## Timing: the transcript is a clock, not a source of words

The artist supplied no timecodes, so word timings come from transcribing the
audio. That transcript is **wrong in places** — it hears `সকাল` as "নোকাল",
`বুনো উন্মাদ` as "ভুলো উন্মাদ", `ছায়াটা কার` as "ছাইরা করা", `চুপটি` as
"চুক্তি".

`align.py` therefore runs Needleman-Wunsch between the artist's words and the
transcript's, with a fuzzy character-level similarity so those mishearings
align as substitutions and the instrumental passages as gaps. Every word that
reaches the screen comes from `lyrics.txt`; only the times come from the
machine. All 83 display lines match, in order.

It also repairs what the transcript gets structurally wrong: Scribe emits
zero-length words on repeated shouts ("ও-ও-ও"), which would flash a line for
two frames, so each line is given a readable minimum, stopped from running
into the next, and capped so a sustained note does not hold one line for
twelve seconds.

Re-run `align.py` alone to inspect the table before rendering anything.

## Why not drawtext, libass, or letter-spacing

None of them shape Bengali correctly here, and all three fail silently:

- `drawtext` has no complex-script shaping at all.
- `libass` reorders vowel signs and moves trailing punctuation to the front of
  the line, even though this ffmpeg is built `--enable-libass --enable-libharfbuzz`
  (the filter exposes no `shaping` option).
- Per-character letter-spacing breaks conjuncts — a Bengali run must be drawn
  in ONE call.

So all type is rendered with Pillow + raqm and composited as images, and
`make_type.py` refuses to run if Pillow lacks raqm. Weight, size, colour and
an accent rule carry the styling instead of tracking.

## No beat-flashing background

Tested and rejected. At 129.20 BPM a periodic pulse drifts up to **2.97s**
against the detected beats across 5:51, so it would fall visibly out of time.
Movement comes instead from the drifting artwork, the section grade, and
lyrics entering on the actual vocal — which is beat-accurate by construction.

## Structure

The grade is keyframed to the song's own sections (from `librosa.segment`) and
interpolated, so it slides from cold and desaturated in the verses to hot in
the choruses without a visible step. Type changes per section: light sans for
the whispered mirror dialogue, serif for the verses, large bold with a red bar
(`#F00201`, sampled from the title art) for the choruses, 150px for the drop,
and the cover's sunset tone for the bridge.

The sharp cover art holds the screen during the five instrumental windows —
the 32s intro run-up, the drop, the two breaks, and the outro.

`compose.py` works in time chunks cut at those instrumental gaps, so no lyric
straddles a join and no single ffmpeg call juggles eighty overlay inputs. It
checks every chunk's frame count against the plan and refuses to continue if
one is short, because a short chunk would slide every later lyric off the
vocal without any error being raised.

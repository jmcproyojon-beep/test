# নিখোঁজ সংবাদ — fully animated music video

A 5:51 animated music video for Raparrubel's "নিখোঁজ সংবাদ", drawn entirely in
code with Remotion. At the artist's request **nothing comes from the release
artwork** — every character, city, prop and sign is drawn in
`remotion-composer/src/nikhoj/`. The only rasters are a generated newsprint
texture and film-grain tiles.

## The story

A man with no face is reported missing by his own song.

| time | scene | idea |
|---|---|---|
| 0:00 | Mirror | The mirror talks, and the figure in it is a flickering stranger — "তুমি নও। তোমার অভ্যাস।" Its short lines appear in the glass written backwards, turning readable. |
| 0:27 | Title | On the finger snap. Title words land on downbeats; he walks in one step per detected beat. |
| 0:59 | Clock city | "ঘড়ির পেটে বন্দি দুপুর" — a clock owns the sky, its second hand stepping on every beat. "ক্যালেন্ডারে মরচে" — a calendar rusts page by page. |
| 1:21 | Identity form | নাম, ঠিকানা, ছবি are ticked as each word is sung; on "আসল রেশ?" the photograph empties out. |
| 1:37 | Front page | Every chorus is a newspaper reporting him missing. The headline is the line being sung, inked word by word; the bass shakes the page; নিরুদ্দেশ is stamped on him. |
| 2:17 | Drop | "নি-খোঁ-জ! সং-বাদ!" slams syllable by syllable, then a circular spectrum from the real frequency bands, his ghosts splitting on transients. |
| 2:37 | Phone | "সকাল মানে স্ক্রিনের আলো" — he texts himself, bubbles on alternating sides. On "সেই স্টেশনটাই নাই" a station vanishes from the metro map. |
| 3:14 | Door in the rain | A door left ajar leaks warm light as the strings rise; the rain thickens on "বৃষ্টি হয়ে ঝরে"; he reaches for it on "একবার ফিরে পাও". |
| 3:29 | Front page II | Chorus 2, the page tilted and reddened. |
| 3:58 | Torn | The page that reported him missing rips open onto a sky already getting light. |
| 4:07 | Sunrise | He sits on a rooftop ledge as the sun comes up. On "(Guitar sustains. Silence.)" everything dims to the sun alone, breathing with the note. |
| 4:37 | Signs | "নামটা আমার, ছায়াটা কার?" — a signpost grows a board per question (নাম / ছায়া / পথ, from the lyric), each swinging in on its word. The bass stops; in the dark, "আমি বলব—". |
| 4:48 | Found | The page turns gold. His face comes back on "আজকে পেলাম নিজের জবাব!"; the poster's নিখোঁজ is struck through; নিরুদ্দেশ is crossed out for ঠিকানা; paper confetti on every downbeat. |
| 5:30 | Mirror | Now the reflection matches, both with faces. On the final snap, black, and the title. |

Only the artist's words appear on screen, apart from the artist name and the
"ESCAPE OF LIFE" subtitle from their lyric sheet.

## Build

```bash
python3.13 -I client-builds/nikhoj-mv/export_data.py   # timings, beats, energy -> src/nikhoj/data.json
python3    -I client-builds/nikhoj-mv/prep_assets.py   # song, fonts, paper, grain -> public/nikhoj/
cd remotion-composer
REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  npx remotion render src/index.tsx NikhojMV ../projects/nikhoj-mv/renders/picture.mp4 \
  --concurrency=4 --crf=17 --jpeg-quality=95 --muted
cd .. && python3 -I client-builds/nikhoj-mv/mux.py      # lays the master under the picture
```

`public/nikhoj/` is gitignored — the song is not committed; `prep_assets.py`
rebuilds it from `projects/nikhoj-songbad/assets/`. `data.json` IS committed.

In this container Chrome must trust the egress proxy's CA, or another
composition's Google Fonts request fails the whole bundle:
`certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n proxy -i <ca>.crt`.

## Why Remotion, and why the text is fine now

Chrome shapes Bengali with HarfBuzz, so `অচেনা`, `নিখোঁজ`, `স্বপ্নটা` render
correctly — unlike ffmpeg's drawtext and libass here, which reorder vowel
signs. That makes real kinetic typography possible: each lyric is split into
words **on spaces only** (each word stays one shaped run) and every word lights
up on its own sung timing.

## What drives the motion

`export_data.py` measures everything from the master; nothing assumes a tempo
(a periodic 129.2 BPM grid drifts ~3 s against the real beats over this song):

- per-word timings — the artist's words aligned onto the transcript's clock,
  via `../nikhoj-songbad/align.py`
- 749 detected beats and 187 downbeats (bar phase = the beat slot with most bass)
- per-frame loudness, bass, onset strength and 8 spectrum bands
- the cues the lyric sheet marks, located in the audio: the intro snap
  (27.47 s), each section's hit (chorus 97.0 s, drop 139.6 s, final 288.4 s),
  the "Bass stops" gap (286.1 s) and the closing snap (349.9 s)

Scene boundaries sit on those cues. The sheet's "One second silence" before
the first chorus is only a dip in this mix, so that cut sits on the hit that
follows it instead.

## Skills asked for, and what was actually usable

- **remotion / remotion-best-practices** — the engine for the whole video.
- **ffmpeg / video-edit** — the final mux.
- **framer-motion** — its animation principles (anticipation, overshoot,
  follow-through) are applied with Remotion springs and decays; the library
  itself is time-based and does not render deterministically in Remotion.
- **animated-drawing** — not used: it needs a supplied humanoid drawing and a
  670 MB model download, and its bundled demo characters must not be shipped
  as a client's character. The jointed SVG figure here does the same job.
- **ai-video-gen** — not usable: no HeyGen / fal / Gemini key is configured.
- **HyperFrames MCP** — compose and render are disabled for CLI clients by the
  server itself.

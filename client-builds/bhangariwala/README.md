# BhangariWala: Bangladesh e-waste animated explainer (3 x 10 s)

Vertical 1080x1920, 30 fps, one continuous 30 s film that also cuts cleanly
into three 10 s parts:

1. **Bangladesh E-Waste Situation**: 2.5D map, devices accumulate,
   `367 MILLION KG · E-WASTE • 2022`, skyline feeding one pile, `≈ 2.2 KG / PERSON`,
   "এগুলো যাচ্ছে কোথায়?", push into the pile.
2. **Where the problem begins**: out of an old phone, HOME / SHOP / OFFICE,
   three unsafe paths (mixed household waste, unorganized collection, unsafe
   dismantling: no people shown, so informal collectors aren't singled out),
   then SOIL / WATER / AIR / DATA with calm warning rings, then "সমাধান কী?".
3. **BhangariWala, a responsible journey**: the "?" turns into the recycling mark,
   COLLECT → PICKUP → PROTECT → RECOVER, the messy red flow becomes a green
   collection network on the map, and the end card.

Data: Bangladesh generated 367 million kg of e-waste in 2022, about 2.2 kg per
person (Global E-waste Monitor 2024, ITU/UNITAR, as reported by Dhaka Tribune).
No newer figures are used.

## Build

```bash
SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I client-builds/bhangariwala/vo.py   # Bangla VO + word times -> src/bhangariwala/vo.json
python3.13 client-builds/bhangariwala/build_audio.py                                     # music, SFX, ducking, -14 LUFS -> projects/bhangariwala/audio/mix.wav
# fonts: remotion-composer/public/bw/ = Inter, Inter Tight (from claude-animation-skills kit/fonts) + Anek Bangla (public/signal)
cd remotion-composer && npx remotion render src/index.tsx BhangariWalaFilm ../projects/bhangariwala/renders/video-muted.mp4 --muted --codec h264 --crf 16
# then mux with mix.wav (-t 30) and cut 0-10 / 10-20 / 20-30 for the three parts
```

Code: `remotion-composer/src/bhangariwala/`: `map.tsx` (Natural Earth 1:10m
outline, perspective tilt + extrusion), `icons.tsx` (device / building / van /
logo kit), `part1.tsx` `part2.tsx` `part3.tsx`, `BhangariWalaFilm.tsx`
(background, chapter chip, Bangla captions).

Voice: Microsoft neural TTS `bn-BD-NabanitaNeural`; English terms are spelled
in Bangla script for the voice, and captions show the client's wording.

**Logo:** the BhangariWala mark is a placeholder (green circle + recycling
arrows + "BhangariWala" wordmark) because no official logo file was supplied.
Swap `LogoMark` / `Wordmark` in `icons.tsx` for the official artwork.

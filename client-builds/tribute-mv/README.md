# ফিরে এসে কাকে ডাকি? — documentary-style music video

A 7:27, 1920×1080 music video for the client's song. Its look follows the client's vintage documentary template reference:
- a dark grunge paper background with the lyrics written faintly across it
- sepia photographs in acetate frames with tape, with slow layered parallax
- gold Bangla titles for years and chapters
- film grain, scratches, warm light leaks and a vignette
- the lyric of each line shown at the bottom as it is sung

## Sources
- **Photos:** 52 of the 54 images in the client's Drive folder "TZIA". Two files are 0 bytes in Drive itself. The zip "Photo Sources Pack" holds only a list of links, not images.
- **Excluded:** duplicates, and the images with baked-in news or advert text (#17/47, #18/50). #0 is used only as its cropped family photograph.
- **Years with no photos:** 2007 arrest and 2008–2025 London. These lines get documentary title cards and illustrations: prison-bar shadows, newspaper-clipping cards, a Dhaka ⇄ London flight arc, a rainy London window and a flipping calendar. No images of the person are generated.

## Build
1. `python3.13 -I prep.py <photos.json>` grades and resizes the photos to `public/tribute/pNN.jpg` and makes `bg.jpg` and `grain0-5.png`.
2. Timing:
   - Whisper (large-v3-turbo) runs over the song in 15 s chunks.
   - `align_lyrics.py` does Needleman-Wunsch alignment against the 65 lyric lines.
   - Choruses and garbled lines were re-transcribed with the expected lyrics as a prompt.
   - `lyric_times.py` holds the final start time of each line, checked by hand, and writes `src/tribute/lyrics.json`.
3. Render from `remotion-composer`: `npx remotion render src/tribute/index.tsx Tribute ../client-builds/tribute-mv/tribute-raw.mp4`. The song (`public/tribute/song.mp3`) is in the composition.

The shot list is `SHOTS` in `Tribute.tsx`: each shot is keyed to a lyric line, plus offsets for the instrumental gaps.

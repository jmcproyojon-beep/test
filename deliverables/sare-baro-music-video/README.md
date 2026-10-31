# সাড়ে বারো — lyric edit (1080p)

**File:** `sare-baro_lyrics_1080p.mp4` · 2:07.9 · 1920×1080 · 30 fps · H.264 + AAC 192 kb/s (original song audio, untouched) · `sare-baro.lyrics.bn.srt` (40 synced cues)

## What was changed
1. **Upscaled** the 848×478 original to 1920×1080 (Lanczos + light sharpening).
2. **Removed the floating baked-in captions** with soft, feathered blur patches. Two of them were misspelled ("ল্যাপটপ **আলিশের** নিচে", "**হয়েছেderi**"), and several lines had no caption at all. Text that is part of the scene (chalkboard, notebook, wall) was kept.
3. **Added the lyrics exactly as supplied, synced to the vocals**, with a yellow karaoke fill sweeping across each line while it is sung:
   - Lines that had an original caption are placed back **in the same spot and style** (right/left blocks, the circle at "বেল বাজে ঠনঠন", the dark brush box at "পেতে দৌড়ায় ইদুর"), now correctly spelled.
   - All other lines (including the repeated "বাজে সাড়ে বারো" and the outro) appear as captions at the bottom.
4. **Title card** "সাড়ে বারো · PABLO PIKASO" over the 4.9 s instrumental intro. The original end card is kept.

## How the timing was found
Gemini (`gemini-3.7-flash`) aligned each lyric line to the song audio. A second model's run drifted after 67 s and was discarded. Every timing was cross-checked against the original video's own captions and chalkboard text; all agree within about 1 s. Word-level timing inside a line is estimated (the fill moves evenly across the line).

## Source
`source/` — `lyrics.py` (lyrics), `align.py` + `align_b.json` (alignment), `clean.py` (upscale + caption removal), `build_mv.py` + `mv.css` (HyperFrames lyric composition).

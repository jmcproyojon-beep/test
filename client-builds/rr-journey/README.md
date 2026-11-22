# Rapar Rubel: the journey (1:53.6, 16:9)

An animated journey in the style of the client's reference, which is an animated biography (Spielberg's childhood): cinematic flat illustration, deep teal and burnt orange, paper grain, and chapter titles rising like its "1946".
- **Audio:** the client's own song "তুই নেই" from 0:00 to 1:53.6, running through the instrumental break and faded out before verse 2. There is no narration.
- **Character:** Rubel is the same character as in the Tui Nei music video (`../../remotion-composer/src/tuinei/chars.tsx`).

## Chapters (on the song's sections)
- **0:00:** ঢাকা at night.
- **0:09:** the rooftop and the phone.
- **0:16:** the idea sketched (box → ship → home).
- **0:21.7:** the route চীন থেকে.
- **0:27.7:** the port.
- **0:34.5:** Proyojon Shop (toys, stationery, bags) with orders arriving.
- **0:42.9:** সারা বাংলাদেশে.
- **0:48.2:** The AB Wardrobe kurtis.
- **0:54.4:** travel to the sea.
- **0:59.1:** the G+9 by the lake.
- **1:03.9:** the night desk.
- **1:09.86:** AI, cut on chorus 1's sung "তুই".
- **1:15.4:** MimAI.
- **1:20.8:** the AI Power User class (10 classes, 18 to 20 hours, 70% hands-on).
- **1:26.2:** গান, with Rubel lip-syncing his own line in the studio.
- **1:32.7:** the RAPAR RUBEL sign over Dhaka at sunrise.

All facts come from the client's own site, as used in the earlier Rapar Rubel promo.

## Build
1. Cut the music:
   ```bash
   ffmpeg -i ../tui-nei/audio/master.mp3 -t 113.6 -af "afade=t=out:st=109.8:d=3.8" -ar 48000 audio/music.wav
   cp audio/music.wav ../../remotion-composer/public/rrj/music.wav
   ```
2. Render, from `remotion-composer`:
   ```bash
   npx remotion render src/rrjourney/index.tsx RRJourney picture.mp4 --muted
   ```
3. Mux with `audio/music.wav` as AAC 320k.

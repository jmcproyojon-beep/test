# The Rubel Case File: 54 s, 16:9 animated intro

Built from the client's brief, `rapar-rubel-case-file-bn.srt`, their Bangla voiceover (`Generated_Audio_…4_41PM.wav`), and the top-down "investigation board" reference.
- **The floor:** a dark teal concrete floor marked with white tape rooms. Each room holds one venture's objects, all drawn in code. Label tapes name the rooms, and Bangla and English chalk notes write themselves on.
- **Camera:** one continuous glide keyed to the voiceover lines.
- **Rooms, in order:** CV and rr seal → ID card (real portrait) → AI laptop → import box, kurti, myook cap → boarding pass and G+9 plot model → MimAI phone → AI Power User notebook.
- **Ending:** the toy car drives the tape line with headlight beams. The camera pulls back to a network map with chalk lines to the RR-001 hub card, closes in on the phone as a WhatsApp notification arrives, then hard-cuts to a glowing cream **rr / RAPAR RUBEL** title with a red light streak.

## Build
1. `python3.13 -I prep.py` writes the tileable floor `public/casefile/floor.jpg`.
2. `python3.13 -I align_vo.py <voice.wav> <whisper_words.json>` (74/94 words) writes `audio/vo.wav` and `src/casefile/vo.json`.
3. `python3.13 -I mix.py` adds the pulse synth, ticking clock, chalk scratches, tape rips, car hum, phone buzz and the boom on the cut. It writes `public/casefile/mix.wav`.
4. From `remotion-composer`: `npx remotion render src/casefile/index.tsx CaseFile out.mp4`.

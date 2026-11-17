# Proyojon Abashon plot reel

A 24 s, 9:16 real-estate reel built from the client's three lip-synced presenter clips. It follows the style of the uploaded reference realtor reel:
- Kinetic Bangla words pop in over the presenter: small white lines with big cream highlights.
- Zoom-blur cuts between clips.
- The logo card appears on "প্রয়োজন আবাসন".
- Plot-size cards pop up: ৫, ১০, ১৫, ২০ and ২৫ কাঠা.
- A phone-call card shows the hotline.
- The end card has the logo, the presenter's photo, the hotline, the email and the address.

## Build
1. **Clips:** the three uploads trimmed to speech (l1 0.9–7.4, l2 0–6.3, l3 1.4–8.3), upscaled to 1080×1920 at 30 fps. They go to `remotion-composer/public/proyojon/` as `c1-3.mp4`, with their audio in `a1-3.wav`. The logo crop, face crop and end-card background frame are in the same folder.
2. **Sound:** `python3.13 -I mix.py` makes the presenter voice, music bed and cues into `audio/mix.wav`.
3. **Video:** `npx remotion render src/index.tsx ProyojonReel ../client-builds/proyojon-reel/video-muted.mp4 --muted` (run from `remotion-composer`), then mux it with `audio/mix.wav`.

The SRT supplies the caption wording. Word timings come from a faster-whisper pass over each clip. The code is in `remotion-composer/src/proyojon/ProyojonReel.tsx`.

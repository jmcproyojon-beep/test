# সাড়ে বারো (Sharey Baro) — animated lyric music video

Pablo Pikaso · from the album "Lonka Kando". Music video by Rapar Rubel (Rubel Miah).
1920×1080 / 30 fps, the exact length of the master (127.85 s). Everything is
drawn in code (`remotion-composer/src/sarebaro/`), in the artist's
psychedelic palette — neon red, orange, yellow, green, cyan, blue, violet and
magenta on black — over an animated optical-illusion background (`trip.tsx`:
wavy concentric rings and zig-zag starbursts that flow and swell with the bass).

**Story — a Dhaka Friday.** He wakes at noon under the mosquito net; every clock
says 12:30. A kid rings the bell and runs; the flat is empty but for the clock;
the fridge holds one ice cream; দারোয়ান কাকা is shouted awake to start the pump.
Shirt, shoes, the laptop under the pillow; the boss's twelve missed calls; mice
in his stomach; "ধ্যাততেরি!". The big hit freezes on the clock. He races
through rickshaws and CNGs to the office — "আজ শুক্রবার, অফিস বন্ধ" — and ends
on the steps with the ice cream and the guard, laughing. Credits card at the end.

## Lyric timing and Bangla CC

No speech recognition was available, so `timing.py` times the lyric sheet
(`lyrics.md`) from the audio: vocal separation (REPET-SIM), section windows from
the song's structure (chroma matching finds the hook three times: 28.0, 95.5,
107.5 s), line breaks placed at vocal pauses by syllable share (dynamic
programming), words snapped to vocal onsets. Phrase-level accuracy.

- burned-in Bangla CC: bottom bar, sung word highlighted
- `sare-baro.bn.srt`: the same cues, to upload as YouTube closed captions

## Rebuild

    python3.13 -I client-builds/sare-baro/timing.py        # needs vocal_est.wav (see timing.py)
    python3.13 -I client-builds/sare-baro/export_data.py   # -> src/sarebaro/data.json + .srt
    cd remotion-composer && npx remotion render src/index.tsx SareBaroMV \
        ../projects/sare-baro/renders/picture.mp4 --muted --codec h264 --crf 16
    python3 -I client-builds/sare-baro/mux.py

Fonts and grain are shared with the Signal নাই build (`remotion-composer/public/signal`,
staged by `client-builds/signal-nai/prep_assets.py`).

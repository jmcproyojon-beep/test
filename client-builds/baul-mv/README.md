# Baul riverbank music video — Rapar Rubel

An edit of the artist's eight 10 s vertical clips (a Baul singer with a
dotara on a Bangladeshi riverbank, day → sunset → night) to the artist's
302 s song (123 BPM). Two versions from one edit:

- `BaulMV` — 16:9 1920×1080 master: each vertical shot framed over a blurred,
  graded copy of itself; chorus moments as three-shot triptychs.
- `BaulMVVertical` — 9:16 1080×1920 for Reels/Shorts/TikTok, same edit full-frame.

**How the edit was made.** ffmpeg's scene detector split the clips into 32
shots, each tagged by hand (time of day, framing). `edl.py` lays them on the
song: cuts on detected downbeats; 2 bars per cut with cross-dissolves in the
solo-voice intro/outro, 2 bars in verses, 1 bar with flash-cuts in choruses;
day shots for the opening verses, sunset for the middle, clip 1's day-to-night
time-lapse over the near-silent breakdown (208–216 s), night for the finale.
Short shots are slowed (≥0.45×); reuse is spread least-used-first and varied
by in-point, mirror, push-in and drift. Clips were upscaled 360→1080 wide with
Lanczos + light sharpening before editing. Warm-to-cool grade follows the arc.

Name: opening title "a film by RAPAR RUBEL", a RAPAR RUBEL mark in the corner,
end credit "Music Video by RAPAR RUBEL (Rubel Miah)".

## Rebuild

    # stage: upscale clips + song into remotion-composer/public/baul (see transcript commands)
    python3.13 -I client-builds/baul-mv/edl.py            # -> src/baul/edl.json
    cd remotion-composer && npx remotion render src/index.tsx BaulMV ../projects/clip-mv/renders/picture.mp4 --muted
    python3 -I client-builds/baul-mv/mux.py

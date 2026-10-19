# Block-K apartment promo — build scripts

Branded promo for an apartment at বসুন্ধরা আবাসিক এলাকা, ব্লক-কে, রোড-১২, cut
from three customer clips into a single walkthrough.

## Inputs (not in git)

```
projects/bashundhara-k12/
├── assets/video/clip-a.mp4      # 480x854, 31.9s — street, facade, entrance gate
├── assets/video/clip-b.mp4      # 480x854, 103.9s — full interior walkthrough
├── assets/video/clip-c.mp4      # 480x854,  7.8s — ground-floor covered parking
├── assets/video/cfr-clip-*.mp4  # generated: constant-frame-rate copies
├── assets/images/logo.png       # client logo, white ground keyed out
├── assets/audio/music-source.wav
└── renders/bashundhara-k12-promo.mp4
```

## Run order

```bash
python3 -I client-builds/bashundhara-k12/make_overlays.py   # captions, title, spec card, end card
python3 -I client-builds/bashundhara-k12/build_promo.py     # normalise, trim, stabilise, brand
python3 -I client-builds/bashundhara-k12/stitch.py          # xfade, music bed, delivery encode
```

## Cutting against WhatsApp clips

Two things in this pack cost a full rebuild each, and both are now handled in
`build_promo.py`:

- **The sources are variable frame rate.** Seeking them is not accurate enough
  to cut against: a window picked off a preview frame landed more than a second
  away in the trim, putting whole beats on blank wall. `build_promo.py` writes a
  constant-30fps copy of each clip first and cuts only from those. Preview the
  same way it cuts — `ffmpeg -i cfr-clip-b.mp4 -vf "fps=1,scale=120:-1,tile=13x4"`
  gives an exact, labelled contact sheet of the whole clip to pick windows from.
  Do not pick windows with `-ss` seeks.
- **`vidstabtransform` with `optzoom=1` crops the subject out.** It chooses one
  zoom for the whole beat, and on a deliberate pan or tilt that zoom is large
  enough to lose the shot — the staircase beat came back as an empty wall at the
  house setting of `smoothing=28:optzoom=1`. This build uses
  `smoothing=10:optzoom=2`, which steadies the handheld wobble while keeping the
  framing that was actually shot.

Verify by filmstripping every finished beat (`fps=1,tile=4x1`), not by sampling
one frame: a beat can open on its subject and pan off it.

## Pacing

`clip-b` is a brisk walkthrough — most rooms hold frame for two or three seconds
before the camera moves on. Beats are 2.8–4.0s to match, and the caption fades
are tightened (`0.20/0.35` in, `dur-0.60/0.40` out) so even a 2.8s beat leaves
the Bengali fully opaque long enough to read.

## Framing

Every source is 480x854, the same 9:16 as the delivery, so all beats
cover-crop to 1080x1920 with nothing lost at the sides. No blurred-fill path is
needed here (unlike the Sector-9 pack, which mixed orientations).

## Delivery size

`stitch.py` derives the video bitrate from `TARGET_MB` and the length of the
cut, so a longer edit tightens the encode instead of sailing past WhatsApp's
16 MB limit.

## Copy policy

The location came from the client. Every caption describes only what is on
screen — the entrance gate, covered parking, lift, staircase, living and dining
space, tiled rooms, grilled windows, kitchen counter, bathroom fittings and the
balcony outlook. No floor area, bedroom count, price or handover date appears,
because none was supplied.

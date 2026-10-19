# Sector-9 plot promo — build scripts

Branded promo for a 5-katha plot at পূর্বাচল ৯নং সেক্টর, ৩০৪ নং রোড, cut from
three customer clips and five photos.

## Inputs (not in git)

```
projects/purbachal-s9/
├── assets/video/clip-a.mp4      # 854x480 LANDSCAPE, 30.7s — walking the plot
├── assets/video/clip-b.mp4      # 480x854 portrait, 27.6s — access path
├── assets/video/clip-c.mp4      # 480x854 portrait, 24.2s — the main road
├── assets/images/photo-17..21.jpg  # 1600x1200 (4:3) plot views
├── assets/images/logo.png       # client logo, white ground keyed out
├── assets/audio/music-source.wav
└── renders/purbachal-s9-promo.mp4
```

## Run order

```bash
python3 -I client-builds/purbachal-s9/make_overlays.py   # captions, title, spec card, end card
python3 -I client-builds/purbachal-s9/build_promo.py     # frame, stabilise, brand each beat
python3 -I client-builds/purbachal-s9/stitch.py          # xfade, music bed, delivery encode
```

## Mixed orientation

This source pack is not all portrait, so `build_promo.py` takes a per-beat
`framing` value:

- `cover` — portrait footage, scaled to fill 1080x1920 and centre-cropped.
- `fit` — landscape clips and 4:3 photos, placed full width over a blurred,
  darkened copy of themselves. Cover-cropping a landscape plot shot to 9:16
  keeps only about a third of the width, which throws away the one thing the
  buyer is looking at: how far the land runs.

## Gotchas (carried forward)

- `zoompan` emits `d` frames per input frame — every still/card render caps the
  output with `-frames:v`.
- Looped overlay stills need both `-loop 1` and `-t`, or the alpha fade leaves
  them invisible / the filtergraph never ends.
- No U+00B7 in the Bengali face; use `ও` between clauses.

## Copy policy

Size and location come from the client (5 katha; Sector 9, Road 304). Every
other caption describes only what is on screen — open level land, boundary
pillars, nearby construction, the access path, greenery, the paved road and its
street lighting. No price is stated because none was supplied.

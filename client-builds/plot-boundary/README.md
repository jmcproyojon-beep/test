# Walled-plot promo — build scripts

Branded promo cut from two customer WhatsApp clips and two exterior photos of a
boundary-walled land plot.

## Inputs (not in git)

```
projects/plot-boundary/
├── assets/video/clip-a.mp4      # 480x854, 10.3s — wall and lane
├── assets/video/clip-b.mp4      # 480x854, 21.3s — walk along the wall, gate, greenery
├── assets/images/photo-01.jpg   # lane beside the wall, wide
├── assets/images/photo-02.jpg   # the wall head-on, full extent
├── assets/images/logo.png       # client logo, white ground keyed out
├── assets/audio/music-source.wav
└── renders/plot-boundary-promo.mp4
```

## Run order

```bash
python3 -I client-builds/plot-boundary/make_overlays.py   # captions, brand chip, end card
python3 -I client-builds/plot-boundary/build_promo.py     # trim, stabilise, brand each beat
python3 -I client-builds/plot-boundary/stitch.py          # xfade, music bed, delivery encode
```

## Notes carried over from the Purbachal build

- **`zoompan` emits `d` frames per input frame.** Every still/card render caps
  the output with `-frames:v`, or a 4-second card becomes a 400-second one.
- **Looped overlay stills need `-t`.** A PNG read without `-loop 1` is a single
  frame at t=0, so an alpha fade starting later leaves it fully transparent; with
  `-loop 1` but no `-t` the filtergraph never ends.
- **No U+00B7 in the Bengali face.** A middle dot inside a Bengali caption
  renders as tofu — use `ও` between clauses.

## Copy policy

Captions describe only what the footage shows: the boundary wall and its
construction, road access, the gate, surrounding greenery and the quiet setting.
No plot size, location or price appears, because none was supplied. The booking
number on the end card is the one the client gave for the previous production.

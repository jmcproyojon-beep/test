# Proyojon Abashon — Purbachal Marine City reel

A 54 s, 9:16 property reel built from the client's aerial plot photo, logo and project details. It combines the styles of the two references:
- From the drone infographic reference: highlighted plot, 3D ground labels, road highlight, map-style pins, a spec list and a "contact now" end.
- From the plot-to-building reference: a glowing outline, a hologram that rises into the finished building, day-to-dusk, an exploded model and a logo reveal.

## Beats
| s | beat |
|---|------|
| 0 | Hook: পূর্বাচল মেরিন সিটি; the plot outline draws itself |
| 3.6 | ১০ কাঠা: extruded text lying on the plot |
| 7.2 | ৬০/২৫ ফুট রাস্তা: road highlight and text along the road |
| 10.4 | দক্ষিণমুখী: south text and arrows toward the road |
| 12.6 | লেক ভিউ: lake glow, ripples, pin, "একমাত্র লেক-ভিউ প্রজেক্ট" |
| 15.4 | Hologram G+9 rises floor by floor with a G…G+9 counter; a flash, then the solid building sweeps up |
| 23.4 | Daylight hero |
| 27.8 | Studio: the exploded model orbits, with roof / 9 residential floors / ground floor callouts |
| 34.2 | Dusk: windows light up |
| 38.6 | Project details card |
| 43.8 | Logo reveal with leaves |
| 47.8 | বুকিং চলছে: hotline, website, office address |

## Build
1. **Assets and camera:** `python3.13 -I prep.py <aerial.jpg> <logo.jpg>`
   - Inpaints the baked white outline out of the aerial and writes `public/marine/aerial.jpg`.
   - Keys out the logo's white background and writes `public/marine/logo.png`.
   - Solves the drone camera from the four plot corners and writes `src/marine/cam.json`. The solve uses vanishing points for focal length (≈982 px), then PnP. Reprojection error is under 1 px.
2. **Sound:** `python3.13 -I mix.py` writes `audio/mix.wav`. It is a synthesized 92 bpm bed plus cues; the cue times mirror `T` in `MarineReel.tsx`.
3. **Video** (run from `remotion-composer`):
   `npx remotion render src/marine/index.tsx MarineReel ../client-builds/proyojon-marine/marine-muted.mp4 --muted --gl=swangle --concurrency 4`
   Then mux the video with `audio/mix.wav`.

## Notes
- **World scale:** the world is scaled ×1.6 (`S` in `rig.tsx`) from the 10-katha area solve, so a 10-storey tower fits under the drone's height in the photo.
- **Layout:** the photo sits full-width at the bottom of the frame, with an extended sky above. A view `{z, cx, cy}` zooms the photo through a CSS transform and zooms the 3D camera through `setViewOffset`, so both layers stay locked together.
- **Ground text:** text on the ground uses CSS `matrix3d` homographies of quads projected by the same camera (`geo.ts`).
- **Tower:** `Tower.tsx` is a G+9 block 24×17 m: columns and a lobby core on the ground floor, nine floors at 3.1 m with staggered front balconies, timber fins and a brand-green strip, plus a roof with parapet and lift room. Clip planes drive both the hologram rise and the solid sweep.

# rubelpublic.github.io showcase

A 16.5 s, 5:4 (1350×1080) website showcase of the portfolio. It follows the style of the client's reference clip:
1. The hero rises from a steep 3D tilt.
2. The camera flies down the tilted page with motion blur, settling on sections.
3. An isometric grid of section cards follows.
4. The camera zooms out to the whole page behind an outline "RUBEL".
5. A title card ("Rapar Rubel", AI Expert & AI Workflow Builder) closes it, with the hero and floating chips.

## Steps
1. **Shots:** capture viewport screenshots while scrolling, at 1440×900 @2x. The site's sections are scroll-driven, so a full-page screenshot comes out mostly blank. 15 of the shots are copied to `remotion-composer/public/portfolio/s00..s14.jpg`.
2. **Sound:** `python3.13 -I mix.py` writes `audio/mix.wav` (120 bpm beat, whooshes, riser and impact).
3. **Video:** from `remotion-composer`, run `npx remotion render src/portfolio/index.tsx PortfolioShowcase ../client-builds/portfolio-showcase/showcase-muted.mp4 --muted`. This stand-alone entry doesn't need the other projects' assets. Then mux it with `audio/mix.wav`.

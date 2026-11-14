# Pythagorean cup: diagram explainer (Bangla)

A 9:16, 89 s explainer by Rubel Miah in a technical-diagram style, with no characters: a blueprint background, a shaded cup, an X-ray cutaway, numbered callouts, step chapters with a progress bar, and a physics side panel.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py   # voice + word timings (only when script.json changes)
    bash build.sh                                                    # mix + render + mux -> cup-explainer.mp4

## Structure
1. **Title and intro:** name plate.
2. **History card.**
3. **Anatomy:** the X-ray scan, then three numbered parts: hollow column, inverted-U tube with its bend height, and the hole in the base.
4. **Four steps on one continuous diagram:**
   1. Equal levels inside and outside the column; the mark sits below the bend.
   2. Overflowing the bend.
   3. The siphon. A side panel shows that the long leg is heavier and that air pressure pushes the water up the short leg.
   4. The siphon stops when air enters the intake.
5. **Rule card:** a siphon flows only while the outlet is below the water surface.
6. **Home experiment with a pipe:** includes a "don't suck by mouth" note.
7. **Legend:** history vs folklore.
8. **Lesson, then follow.**

## Code
- `web/info.js` holds the style kit (blueprint, chips, callouts, panel, cup geometry and shading).
- `web/shots.js` holds the shots and the water timeline (`cupState`).
- `main.js` gained crossfades (`tr: 'fade'`) and an overlay hook for the chapter chip and progress bar.

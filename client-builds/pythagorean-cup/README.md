# Pythagorean cup reel (Bangla, stick-figure)

A 9:16 science explainer by Rubel Miah about the Pythagorean cup ("greedy cup"): how its hidden siphon empties the cup once it is filled past the line. It runs 73 s, with Bangla voice and captions.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py   # voice + word timings (only when script.json changes)
    bash build.sh                                                    # mix + render + mux -> pythagorean-cup.mp4

## How it's built
- **Voice:** `bn-BD-PradeepNeural` (male), with word times from the TTS events.
- **Cup:** the cup and its cross-section are drawn in code (`cupDraw` in `web/shots.js`). A single water timeline (`cupState`) drives all the cut-away shots:
  1. Fill to the line.
  2. Pour past the bend of the tube.
  3. The siphon starts and drains through the stem until the inner tube's intake is uncovered.
- **Images:** no photos or third-party logos are used.

## Fact notes
- The cup is traditionally linked to Pythagoras of Samos. The story that he made it to teach moderation is legend, and the narration says so.
- The drain is a siphon: once water is past the bend of the inverted U, the falling column in the tube pulls the rest of the water after it.

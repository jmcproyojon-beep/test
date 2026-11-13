# Nvidia CEO reel (Bangla, stick-figure)

A 9:16 stick-figure news explainer by Rubel Miah, about Jensen Huang's resignation, Trump's call for Tim Cook to run Nvidia, and Apple's planned handover set against Nvidia's sudden one. It runs 3 min 21 s, with Bangla voice and captions.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py   # voice + word timings (only when script.json changes)
    bash build.sh                                                    # mix + render + mux -> nvidia-ceo-reel.mp4

## Voice and captions
- **`voice.py`:**
  - Speaks each line of `script.json` with Microsoft neural TTS `bn-BD-PradeepNeural` (male, +6 %).
  - English names are spoken in Bangla spelling (এনভিডিয়া, সিইও …) and shown in Latin script on screen.
  - Word times come from the TTS WordBoundary events, because the engine's aligner is English only.
- **Captions:** Hind Siliguri Bold. Brand names and numbers are yellow.

## Files
- **Picture:** `web/shots.js` holds the 56 shots. Their times are read from `WORDS`, so a new take re-times them automatically.
- **Rig and props:** hair, glasses and tie are in `web/chars.js`; the props are in `web/env2.js`.
- **Sound:** `audio.py` synthesises all music and sound effects in code.

## Fact notes
Checked against news reports from 12–13 Nov 2026 and the companies' own announcements:
- Huang resigned. Colette Kress is interim CEO and stays CFO. Harvey C. Jones is the board's first separate chair.
- Trump's Truth Social post backed Tim Cook.
- Cook is Apple's executive chairman; John Ternus has been CEO since 1 Sep 2026.
- Semafor reported DOJ probes. Megaspeed denies smuggling.

Three claims were softened because they could not be confirmed:
- "১৭ নভেম্বর" became "সামনেই".
- The 9to5Mac quote became "অনেকে একে বলছেন".
- "চার দিনের ঝড়" became "কয়েক দিনের ঝড়".

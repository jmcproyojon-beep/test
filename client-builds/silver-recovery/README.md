# Silver Market Crash & Recovery — RUPMYK JEWELERS

A 9:16 cinematic financial documentary, 2:06 long: 12 clips of about 10 s each, then the brand card.
- **Narration:** Bengali, a deep and calm male voice.
- **On-screen text:** English.
- **Palette:** black, charcoal and silver, with subtle red for crashes and green for recovery.

Everything is drawn in code (`remotion-composer/src/silver/Silver.tsx`): bullion bars with a specular sweep, coins, glowing line and candlestick charts, trading-room monitors with trader silhouettes, a wireframe globe with the dollar sign, a central-bank façade, a treasury-bond certificate, margin-call alerts with a "LIQUIDATED" stamp, a crowd panic wave, a sepia 1980 flip board, a 2011 chart, a 2020 empty city with stimulus flow, a higher-low candle bottom, the five signals list, and the end card.

## Build
1. `clips.json` holds the 12 narration lines.
2. `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py` reads each line with edge-tts `bn-BD-PradeepNeural` at rate −6% and pitch −6 Hz. English terms are spelled in Bangla for pronunciation. It writes `audio/vo.wav` and `src/silver/vo.json`; clips are max(10 s, line + 1.6 s).
3. `python3.13 -I mix.py` adds a drone, an 80 bpm pulse, pads and cues (impacts on crashes, an alarm on the margin call, coins, shimmer on recovery). It writes `public/silver/mix.wav`, which the composition plays.
4. From `remotion-composer`: `npx remotion render src/silver/index.tsx Silver out.mp4`.

The uploaded `Generated_Audio_…10_16PM.wav` reads the earlier "5 signals" script, not this one. `align_vo.py` and `script.json` are kept for that version.

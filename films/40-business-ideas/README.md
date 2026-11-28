# 40 · ৳২০,০০০-এর কমে ৫টা ব্যবসা — countdown explainer (9:16, ~65 s)

Five low-cost business ideas for Bangladesh, counted down from #5 to #1, ending with the one mistake that sinks any of
them. It stars the client's own character, cut out of his three pose atlases (present, walk, write; 8 frames each,
background removed with rembg isnet and foot-anchored in `assets/rafi/meta.json`). He takes the place of «Rafi»
from the brief.

- **Hook (winner).** The ৳20,000 note bundle bursts into five mini shops that land on a cartoon Dhaka street.
- **Open loop.** At 0:06 a paper boat labelled ‘ভুল’ sinks under a padlock; it pays off at 0:53, where the boat sinks
  when every coin goes in at once, the shot rewinds, and one test coin keeps it afloat.
- **Countdown.** Each number drops with a thud and shrinks into a corner badge. Before #1 the picture freezes and the
  music cuts out for 0.5 s; then the gold ‘১’ slams down with confetti.
- **Captions** carry the key word in green, and #1 in gold. «খরচ আনুমানিক, আয় নিশ্চিত নয়» stays on screen from #5 to the end.
- **Voice.** v2 uses the client's own tagged recording (`assets/vo2.wav`, 67 s) with the client's SRT, retimed to it by
  word timings. The first cut used a vidIQ voice.
- **Social hooks (v2).** A countdown tracker (৫ ৪ ৩ ২ ১) at the top: each number flies into its slot, and #১ stays a
  gold ‘?’ until it is revealed. Each idea also gets an info card: who buys, the first 3 steps, the main risk.
- **Music and SFX** are synthesised in code (mgaudio, 120 BPM) and royalty-free.

Costs in the script are planning estimates; check local prices before publishing.

## Rebuild (inside mg-styles-15, as demos/40-business-ideas)
```sh
python3 demos/40-business-ideas/audio.py                     # needs assets/vo2.wav (the voice-over, not in git)
MG_CPU=1 ../scripts/mg-render.sh demos/40-business-ideas --workers 6
```

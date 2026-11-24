# 38 · তুই নেই — stickman music video (3:19, 1920×1080)

A hand-inked stickman story on the user's song «তুই নেই» (final master, 88 BPM, 70 bars). Every scene starts on a
bar line of the real song (beats from `engine/render.js analyze`), and the flourishes are driven by the same clock:
rain bursts and the streetlamp pulse on the beat, the big wheel clicks one notch per beat, the kite tugs on each
downbeat, and the constellation of her appears one star per beat.

**Story.** Night rain; he sits at the window with two cups of tea, one untouched, and writes «তুই নেই» on the fogged
glass. An old box holds her red scarf; its glow opens the memories (warm paper): her red umbrella in the rain, the
bicycle, the tea stall, the kite, the boat, the fair, the streetlamp. Back in the present (cool grey paper) he walks
the same street alone while her outline flickers beside him. The station: she leaves on the train, he runs after it,
kneels in the rain with a phone that rings out, draws her in the sand by the river until a wave takes it. The wind
takes the scarf through the memories; it rises into the night and the stars draw her, waving. At dawn he wears the
red scarf. The only colour that belongs to her is red.

## Rebuild
```sh
cp <your song>.wav song.wav            # not in git
node engine/render.js analyze song.wav # beats.js (committed)
node song.js                           # out/music.wav (the song, -14 LUFS)
node engine/render.js video && node engine/render.js mux
```
Built with the animation-studio engine (vendored in `engine/`). `out/` and `song.wav` are not in git.

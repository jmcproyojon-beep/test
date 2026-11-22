# তুই নেই (Tui Nei): "ক্যামেরার পেছনে যে ছিল", 2.5D animated music video

1920x1080, 24 fps, 3:44.86, on the client's final master (`Tui_Nei_Production_Master_320kbps.mp3`, kept
intact: its MP3 stream is copied into the MP4, so speed, pitch and mix are untouched).

## Song map (measured from the master)

| Time | Section | Picture |
|---|---|---|
| 0:00-0:09 | instrumental intro | canteen: Nusrat props the phone on the window grill, starts the timer, runs back; Shuvo arrives late with tea; the shutter fires early on the downbeat at 8.35 s |
| 0:09-0:21.7 | processed chant, then the first clear "তুই নেই নেই তুই নেই" (18.3 s) | Rubel cracks up, Mitu laughs longest, Shuvo groans at the photo; on the clear chant Rubel glances at the sixth tea glass nobody drinks |
| 0:21.7-1:09.9 | verse 1 | the corridor (Arif walking backwards, the notebook, Nusrat pulling Arif out of the students' way) intercut with warm hand-held memories where Rubel alone looks into the lens; the cap-tilt memory on "যদি থাকতি পাশে" (43-48 s); the staircase memory (63.9-69.9 s) |
| 1:09.86 | chorus 1, on the sung "তুই" | **match cut** to the present: same rail, hand, framing; the empty landing; Shuvo waits below; Rubel lowers his hand and joins him |
| 1:15-1:32.6 | chorus 1 | performance close-up; back in the canteen Shuvo (late for the photo) is first to make room; the rickshaw at the red light (memory) and today |
| 1:32.6-1:53.6 | instrumental break | the field: cricket goes on around him; dusk |
| 1:53.6-2:37.7 | verse 2 | night on the hall veranda, memories of the veranda, the room, a bus window, a winter flower taken by the hand behind the camera; Mitu brings tea |
| 2:37.7-2:59.3 | chorus 2 | the old photos on his phone (frames from the memories), the cap photo, he calls the friends over; all five cross under the signal |
| 2:59.3-3:22 | final hook | on the steps by the field Rubel sets the timer himself and runs in; Shuvo makes room; Mitu remembers and tilts his cap; Rubel laughs; the shutter at 3:19.38 |
| 3:22-3:44.9 | musical tail | the imperfect photograph (Arif blinked, Nusrat moved, everyone made it in) held, slow push, fade |

The brief placed the staircase on "the first clear নেই নেই, তুই নেই". In the master that chant opens the song
(9-21.7 s), before verse 1, so the match cut sits on chorus 1's sung "তুই" (69.86 s) to keep the story's order
(canteen, corridor in verse 1, then the staircase); the clear chant at 18.3 s is used as a quiet foreshadow.

## Build

```bash
ffmpeg -i <master>.mp3 -ac 1 -ar 16000 client-builds/tui-nei/audio/mono16k.wav
python3.13 client-builds/tui-nei/transcribe.py audio/mono16k.wav      # Whisper word anchors (run inside client-builds/tui-nei)
python3.13 -I client-builds/tui-nei/align_lyrics.py lyrics.json audio/whisper_words.json 224.856   # -> src/tuinei/lyrics.json
python3 client-builds/tui-nei/fix_times.py                              # intro chant + verse-2 start, by hand
python3.13 -I client-builds/tui-nei/texture.py                          # paper + grain overlays -> public/tuinei
cp <master>.mp3 remotion-composer/public/tuinei/master.mp3
cd remotion-composer && npx remotion render src/tuinei/index.tsx TuiNei picture.mp4 --muted --crf 17
ffmpeg -i picture.mp4 -i public/tuinei/master.mp3 -map 0:v -map 1:a -c:v libx264 -crf 18 -c:a copy -shortest out.mp4
```

Code (`remotion-composer/src/tuinei/`): `chars.tsx` (the cel-shaded cast: Rubel from the reference sheets, the four
friends, the absent friend's hand with the red thread bracelet), `lips.ts` (Bangla syllables -> mouth shapes from the
aligned words), `envs.tsx` (canteen, corridor and staircase in real perspective, field and steps, street with the
signal, veranda, room, bus, mist), `shotsA.tsx` / `shotsB.tsx` (the 44 shots), `TuiNei.tsx` (memory look, paper,
grain, the master). `Sheet` composition = the model sheet.

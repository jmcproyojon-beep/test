# BhangariWala: the complete e-waste journey (60 s, 6 x 10 s)

Vertical 1080x1920, 30 fps. One continuous film that also cuts cleanly into six 10 s parts
(cut at 10 / 20 / 30 / 40 / 50 s). Same characters, palette, logo and visual language as the
earlier BhangariWala series (`remotion-composer/src/bhangariwala`), whose kit it reuses.

| Part | Step | What happens |
|---|---|---|
| 1 | Identify & Request Pickup | Almirah and drawer open, old electronics float into a group, the family member separates them (regular bin gets a red X, OLD ELECTRONICS box a green check), the BhangariWala app: Pickup Request → Request Received, green route from home to the van |
| 2 | Doorstep Collection | Van through a Dhaka street, handover at the apartment door, representative checks the items, Customer → BhangariWala → Secure, box loaded, Home → Facility |
| 3 | Sorting | Box onto the steel table, top-down: the pile sorts into 8 green trays, shields on PHONE / LAPTOP / OTHER ELECTRONICS (HDD), camera pushes in |
| 4 | Data Protection | Phone, laptop, HDD with abstract data cards (no real data), the big shield, DATA → SHIELD → SECURE HANDLING, secure-processing lane vs material-sorting lane, see-through laptop |
| 5 | Dismantle → Recover | Exploded laptop (display, casing, board, battery, frame, cables), six lanes METAL / PLASTIC / CIRCUIT BOARD / BATTERY / GLASS / OTHER MATERIAL; recoverable lanes glow green, battery and other go to a separate safe channel, the recovery loop |
| 6 | Responsible Recycling | Four streams (recovered, recycled, specialized recovery, separate safe processing for batteries), the 8-step loop, a cleaner Bangladesh, the brand end frame |

Each part opens with the Bangla hook on screen, shows a STEP header, and closes on the step line;
a 6-step tracker at the top carries through the whole film.

## Build

```bash
# voice: the client's recording, normalised (its WAV header is malformed), then split into the six parts
ffmpeg -i <client voice>.wav -ac 1 -ar 48000 client-builds/bw-journey/audio/client_vo.wav
python3.13 -I client-builds/bw-journey/build_vo.py client-builds/bw-journey/audio/client_vo.wav   # audio/vo.wav + src/bwjourney/vo.json
python3.13 -I client-builds/bw-journey/mix.py                                                       # music + SFX + ducking, -15 LUFS -> public/bwj/mix.wav
# logo + fonts in remotion-composer/public/bwj (logo cut by logo/cut.py) and public/bw (fonts, see ../bhangariwala)
cd remotion-composer && npx remotion render src/bwjourney/index.tsx BWJourney out.mp4
```

Voice placement (`build_vo.py`): line i of the recording starts OFF[i] s into part i. Caption word
times come from Whisper word starts (`whisper_words.json`, faster-whisper large-v3-turbo) mapped to the
script words by hand (`MAP`), pushed past silence where Whisper starts a word early.

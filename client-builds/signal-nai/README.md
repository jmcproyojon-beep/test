# Signal নাই — animated music video (Raparrubel)

A story-driven motion-graphics video, 1920×1080 / 30 fps, the exact length
of the master (247.25 s). Every visual is drawn in code
(`remotion-composer/src/signal/`); no artwork or stock is used.

**Story.** A boy who has every network and no connection. A 2004 dial-up
call drops; a radio tower broadcasts "Signal নাই" to nobody; on the rooftops
he holds his phone up for a bar while the sky is wired with everyone else's
network. Verse 1 rewinds to the analog afternoons (coins, a missed call with
home inside it, a CD written in blue ink, the school field whose crowd turns
into online avatars). The chorus is a tunnel of signal rings with an
afternoon downloading and airplane mode switched on. The drop is an 8-bit
level; the bass cut is a NO SIGNAL test card; "নাই!" slams. Verse 2 is
আগে vs এখন split-screen. The breakdown dials an old number and someone
answers "কই ছিলি এতদিন?". The bridge is rain on the school field. In the
final build his friends call him down — "আজকে আর অনলাইন না!" — and he runs
down the stairwell. The last image: the four signal bars are his friends.

## Lyric sync

The words on screen are the artist's lyric sheet (`lyrics.md`); only the
timing comes from speech recognition.

1. The ElevenLabs account had 1,746 credits; the full song needs 3,434. So the
   vocal windows were cut out, sped up 1.6× (pitch kept) and joined
   (`collage.json`, ~1,700 credits). `unmap.py` maps the transcript's word
   times back onto the song.
2. The final chorus was not sent: it repeats chorus 1 word for word, and
   chroma correlation of the music puts it +109.9 s later (r = 0.94).
3. `align.py` aligns the sheet to the transcript (Needleman-Wunsch, fuzzy,
   with "Signal" ↔ সিগন্যাল equivalence): 88 of 92 lines timed from the vocal.
4. `export_data.py` sets the few lines the transcript missed from the audio
   (each override notes its evidence), and measures beats, downbeats,
   per-frame loudness/bass/bands and the section hits.

## Rebuild

    python3 -I client-builds/signal-nai/unmap.py           # collage_words.json -> words.json
    python3.13 -I client-builds/signal-nai/export_data.py  # -> src/signal/data.json
    python3 -I client-builds/signal-nai/prep_assets.py FONT_DIR   # song, fonts, grain -> public/signal
    cd remotion-composer && npx remotion render src/index.tsx SignalMV \
        ../projects/signal-nai/renders/picture.mp4 --muted --codec h264 --crf 16
    python3 -I client-builds/signal-nai/mux.py              # + master audio

Fonts (SIL OFL, from npm @fontsource): Anek Bangla, Baloo Da 2,
Press Start 2P, Anton, Space Mono.

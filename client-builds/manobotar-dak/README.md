# মানবতার ডাক — শেষ আলো জ্বলবেই (Raparrubel / Rubel Miah)

A paper-cutout documentary music video, 1920×1080 / 30 fps, the exact length
of the master (6:07). `remotion-composer/src/manobotar/`.

**Story.** One world cut up by borders (inked red on a paper globe from
Natural Earth data) and faceless power — suited figures with no face, no
real leader is depicted — who redraw maps behind palace doors and write
history in red ink with people as pawns. Washington, Moscow, Beijing and
Delhi as pinned capitals and paper landmarks; a child and a mother whose
small world is torn by war; New York's assembly talking while people pray
outside. The hero — the artist, cut from his own character-reference sheet
(front, sides, back, three head angles) — stands up with the people: from
behind facing the sunrise, raising the white flag of humanity, breaking
chains in the bridge, and at the climax facing us among every nation. The
chants ("যুদ্ধ নয়! শান্তি চাই!" …) are shouted by nation after nation under
their flags; the borders are erased; the outro returns to a borderless
globe and a paper dove.

**Lyrics on the vocal.** `transcribe.py` runs faster-whisper large-v3 on the
separated vocal; `align.py` aligns the artist's sheet (`lyrics.md`) to it —
only the times come from the transcript. `export_data.py` sets the few
lines Whisper skipped from the audio (each with its evidence: e.g. chorus 2
matches chorus 1 at +84.8 s by chroma), and adds the climax after the
outro, which repeats "শেষ আলো জ্বলবেই!" though the sheet does not list it.
`manobotar-dak.bn.srt` holds the same lines as Bangla captions for YouTube.

## Rebuild

    python3 -I client-builds/manobotar-dak/prep_assets.py ANY.png          # paper textures, grain, song
    python3.13 -I client-builds/manobotar-dak/cutout_hero.py CHARACTER_SHEET.jpg
    python3.13 -I client-builds/manobotar-dak/export_data.py            # -> src/manobotar/data.json + .srt
    cd remotion-composer && npx remotion render src/index.tsx ManobotarMV ../projects/manobotar-dak/renders/picture.mp4 --muted
    python3 -I client-builds/manobotar-dak/mux.py

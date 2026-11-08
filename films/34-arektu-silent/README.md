# «আরেকটু থাকো» — silent-film version (lemo-opuscar "1920s Silent Film" style)
Story: a picture house in Dacca, 1927. The projectionist and the pianist share every evening show without a word; tonight is
her last. He tries to make the night last with the only machine he has — the projector (slower, frozen, rewound) — then
the reel runs out, the near-miss, the station at dawn, and the one frame she left him, held until it burns through.
Soundtrack: the artist's song master + the projector in the booth (mix.py).

Build (from the lemo-opuscar library root, after `. scripts/lemo-env.sh`; copy this folder to `films/arektu-silent`,
put the master at `assets/song.mp3`, run `sh tools/fonts.sh` and copy NotoSerifBengali-{Regular,Bold}.ttf into fonts/):
  node core/render/events.mjs films/arektu-silent && python3 films/arektu-silent/mix.py
  node core/render/video.mjs films/arektu-silent --fps 24 --workers 4 --out films/arektu-silent/out/video24.mp4
  sh core/render/mux.sh films/arektu-silent/out/video24.mp4 films/arektu-silent/mix.wav films/arektu-silent/out/master.mp4 24 1
Engine (engine/, sets.js, chars.js, poses.js, stage.js) copied from the library's silent-film demo; cast, props, shots,
timeline, cards and assembly are this film's own.

#!/bin/sh
# «আরেকটু থাকো» Stay a Little Longer — Rapar Rubel. Chalkboard lyric film, 1920x1080, 30 fps.
# Run from anywhere:  sh films/arektu-thako/build.sh   (LIB = the lemo-opuscar library; assets/song.mp3 = the artist's master)
# Steps: fonts, chalk recordings, Bangla stroke data, lyric times -> page data, events, mix, picture, master, reading check.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}; export LIB LEMO_OPUSCAR_HOME=$LIB
PY="$LIB/.venv/bin/python"; FPS=30; OUT="$HERE/out"; mkdir -p "$OUT"
[ -f "$HERE/assets/song.mp3" ] || { echo "put the song master at assets/song.mp3"; exit 1; }
cd "$LIB"
# fonts: single-line EMS (OFL) for the Latin chalk; Hind Siliguri / Atma (OFL) are in fonts/ (teacher / her hand, subtitles)
EMS=https://gitlab.com/oskay/svg-fonts/-/raw/master/fonts/EMS
for f in EMSDelight EMSCasualHand; do [ -f "$HERE/fonts/$f.svg" ] || curl -sfL -o "$HERE/fonts/$f.svg" "$EMS/$f.svg"; done
# chalk recordings (Wikimedia Commons, CC0), cut into grains
C=https://upload.wikimedia.org/wikipedia/commons; mkdir -p "$HERE/foley/raw"
[ -f "$HERE/foley/raw/chalk-on-chalkboard.wav" ] || curl -sfL -o "$HERE/foley/raw/chalk-on-chalkboard.wav" "$C/8/81/264944_chalk-on-chalkboard.wav"
[ -f "$HERE/foley/raw/Chalkboard-writing.ogg" ]  || curl -sfL -o "$HERE/foley/raw/Chalkboard-writing.ogg" "$C/3/36/Chalkboard-writing.ogg"
[ -f "$HERE/foley/lib/index.json" ] || "$PY" -I "$HERE/tools/foley_lib.py" "$HERE/foley/lib" fat="$HERE/foley/raw/chalk-on-chalkboard.wav" tom="$HERE/foley/raw/Chalkboard-writing.ogg"
# Bangla centre-line strokes for every board word (tools/bn_words.json) and the sung-line times (lines.json from work/merge.py)
"$PY" "$HERE/tools/bn_strokes.py"
"$PY" "$HERE/tools/lines_js.py"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/audio.py"
node core/render/video.mjs "$HERE" --fps $FPS --workers 3 --out "$OUT/video.mp4"
sh core/render/mux.sh "$OUT/video.mp4" "$HERE/mix.wav" "$OUT/Arektu_Thako_Chalkboard.mp4" $FPS 1
node core/render/readcheck.mjs "$HERE" > "$OUT/readcheck.txt" && echo "readcheck ok" || tail -20 "$OUT/readcheck.txt"
"$PY" "$HERE/tools/srt.py" "$OUT/Arektu_Thako.srt" || true
echo "done: $OUT/Arektu_Thako_Chalkboard.mp4"

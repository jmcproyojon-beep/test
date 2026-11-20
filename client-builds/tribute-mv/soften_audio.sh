#!/usr/bin/env bash
# Gentler, more balanced soundtrack for the tribute music video (client: "music too loud, make it soothing").
# Warm low shelf, presence/harshness cuts (3 kHz, 5.5 kHz), high shelf -3.5 dB, light de-essing, gentle 2:1
# compression, then two-pass loudnorm to -17 LUFS / -2 dBTP (was -12.9 LUFS). The video stream is copied untouched.
#   bash soften_audio.sh   (run in client-builds/tribute-mv)
set -euo pipefail
SRC=../../remotion-composer/public/tribute/song.mp3
V=../../projects/tribute-mv/fire-eshe-kake-daki-music-video.mp4
O=../../projects/tribute-mv/fire-eshe-kake-daki-music-video-soft.mp4
CH="highpass=f=32,lowshelf=f=170:g=1.2,equalizer=f=3000:t=q:w=1.1:g=-2.5,equalizer=f=5500:t=q:w=1.2:g=-2,highshelf=f=9000:g=-3.5,deesser=i=0.4:m=0.5:f=0.5,acompressor=threshold=-22dB:ratio=2:attack=25:release=300:knee=6:makeup=1"
mkdir -p audio
ffmpeg -hide_banner -i "$SRC" -af "$CH,loudnorm=I=-17:TP=-2:LRA=8:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p' > audio/ln.json
M=$(python3 -c "import json;d=json.load(open('audio/ln.json'));print('measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s'%(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset']))")
ffmpeg -v error -y -i "$SRC" -af "$CH,loudnorm=I=-17:TP=-2:LRA=8:$M:linear=true" -ar 48000 audio/song_soft.wav
ffmpeg -v error -y -i "$V" -i audio/song_soft.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$O"

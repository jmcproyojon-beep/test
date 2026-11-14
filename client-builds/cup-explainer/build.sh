#!/usr/bin/env bash
# Build the Bangla diagram explainer: mix -> render the shots in parallel -> mux.
#   bash build.sh            (run voice.py first if the script changed)
set -euo pipefail
cd "$(dirname "$0")"
KIT="$HOME/claude-animation-skills/kit"; export NODE_PATH="$KIT/node_modules"
WORKERS="${WORKERS:-6}"; NAME="$(basename "$PWD")"
node -e "
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage();
await p.goto('file://'+process.cwd()+'/web/index.html');
const r=await p.evaluate(()=>({spans:SHOT_SPANS,tr:SHOTS.map(s=>s.tr),dur:DUR}));
require('fs').writeFileSync('audio/shots.json',JSON.stringify(r));await b.close();})()"
"$KIT/.venv/bin/python" audio.py
if [ "${AUDIO_ONLY:-0}" != "1" ] || [ ! -f silent.mp4 ]; then
  mkdir -p seg; find seg -name 'shot_*' -delete
  N=$(python3 -c "import json;print(len(json.load(open('audio/shots.json'))['spans']))")
  pids=()
  for ((w = 0; w < WORKERS; w++)); do
    ids=""; for ((i = w; i < N; i += WORKERS)); do ids="${ids:+$ids,}$i"; done
    [ -n "$ids" ] && { node render.js segments "$ids" > "seg/log$w.txt" 2>&1 & pids+=($!); }
  done
  for p in "${pids[@]}"; do wait "$p"; done
  [ "$(ls seg/shot_??.mp4 | wc -l)" -eq "$N" ] || { echo "a shot failed to render, see seg/log*.txt"; exit 1; }
  for f in seg/shot_??.mp4; do echo "file '$PWD/$f'"; done > seg/list.txt
  ffmpeg -v error -y -f concat -safe 0 -i seg/list.txt -c copy silent.mp4
fi
ffmpeg -v error -y -i silent.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "alimiter=limit=0.8:attack=2:release=60,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$NAME.part.mp4"
mv "$NAME.part.mp4" "$NAME.mp4"; echo "done: $PWD/$NAME.mp4"

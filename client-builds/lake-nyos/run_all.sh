#!/usr/bin/env bash
# Render every shot (resumable). Particle-heavy shots at full 30 fps; slow/smooth
# shots every other frame (interpolated to 30 fps at assembly).
cd "$(dirname "$0")/../.."
for spec in "1 2" "2 2" "3 2" "4 2" "5 2" "6 2" "7 2" "8 2" "9 2" "10 2" "11 2" "12 2"; do
  set -- $spec
  blender -b -P client-builds/lake-nyos/render.py -- $1 0 119 --step $2 --out projects/lake-nyos/frames_fast 2>&1 | grep --line-buffered -E "FRAME|Error|Traceback"
done
echo ALL_DONE

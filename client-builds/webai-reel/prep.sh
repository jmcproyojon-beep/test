#!/usr/bin/env bash
# Trim, upscale (360x640 -> 1080x1920, 30 fps) and grade the 5 avatar clips; pull their audio.
#   bash prep.sh <folder with the uploaded clips>
set -euo pipefail
U="${1:?folder with the avatar clips}"; P="$(cd "$(dirname "$0")/../../remotion-composer/public" && pwd)/webai"; mkdir -p "$P"
i=1
# clip id, source in, source out (speech only)
for spec in "1cbd6bb8 0 9.4" "9e0e8c3f 0 9.3" "4cb1f5de 0.85 8.7" "e9269a99 1.05 9.1" "a64b9968 2.85 9.6"; do
  set -- $spec
  ffmpeg -v error -y -ss "$2" -to "$3" -i "$U"/$1-*.mp4 -an -vf "fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.7:5:5:0,eq=contrast=1.07:saturation=0.92:brightness=-0.015,colorbalance=bs=0.04:bm=0.01:rh=0.02,format=yuv420p" -c:v libx264 -crf 16 "$P/c$i.mp4"
  ffmpeg -v error -y -ss "$2" -to "$3" -i "$U"/$1-*.mp4 -vn -ac 1 -ar 48000 "$P/a$i.wav"
  i=$((i + 1))
done

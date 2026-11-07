#!/usr/bin/env bash
# Render an mg-styles-15 film (or your own page that defines window.renderAt) in a cloud session.
# Usage: scripts/mg-render.sh <demo-dir> [render.mjs options...]   e.g. scripts/mg-render.sh demos/22-hud --workers 4
# Builds the soundtrack first if the demo has audio.py and no out/audio.wav yet.
set -euo pipefail
MG="${MG_HOME:-$(cd "$(dirname "$0")/../mg-styles-15" && pwd)}"
cd "$MG"
DEMO="${1:?demo dir, e.g. demos/01-flat-vector}"; shift
export MG_CHROME="${MG_CHROME:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | head -1)}"
# No GPU in cloud containers. Default: software WebGL via SwiftShader (needed by the WebGL/Three.js films).
# MG_CPU=1: plain CPU canvas, ~10x faster for Canvas2D/SVG-only films (GPU readback under SwiftShader costs ~3 s/frame).
if [ "${MG_CPU:-0}" = 1 ]; then export MG_GPU_ARGS="${MG_GPU_ARGS:---no-sandbox --disable-gpu --disable-accelerated-2d-canvas}"
else export MG_GPU_ARGS="${MG_GPU_ARGS:---no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader}"; fi
if [ -f "$DEMO/audio.py" ] && [ ! -f "$DEMO/out/audio.wav" ]; then python3 "$DEMO/audio.py"; fi
exec node harness/render.mjs "$DEMO" "$@"

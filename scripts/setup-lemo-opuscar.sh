#!/usr/bin/env bash
# One-shot install of github.com/lemomo-ai/lemo-opuscar for cloud sessions (into ./lemo-opuscar, git-ignored).
# Usage: scripts/setup-lemo-opuscar.sh [voice]     then:  . scripts/lemo-env.sh
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d lemo-opuscar/.git ] || git clone -q --depth 1 https://github.com/lemomo-ai/lemo-opuscar.git lemo-opuscar
cd lemo-opuscar
npm install --no-audit --no-fund --loglevel=error
[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/python -m pip install -q --disable-pip-version-check -r requirements.txt -r requirements-music.txt imageio-ffmpeg
ln -sf "$(.venv/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')" .venv/bin/ffmpeg
if [ "${1:-}" = voice ]; then
  .venv/bin/python -m pip install -q --disable-pip-version-check -r requirements-voice.txt
  [ -f core/tts/kokoro-v1.0.onnx ] || sh tools/fetch.sh voice
fi
echo "lemo-opuscar ready. Now: . scripts/lemo-env.sh"

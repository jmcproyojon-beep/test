#!/usr/bin/env bash
# One-shot install of github.com/Vincentwei1021/mg-styles-15 for cloud sessions:
# clone (into ./mg-styles-15, git-ignored), npm deps, Python audio deps (for the python3 on PATH),
# Latin fonts from npm @fontsource + a CJK fallback, and our own films (films/*) linked into demos/.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d mg-styles-15/.git ] || git clone -q --depth 1 https://github.com/Vincentwei1021/mg-styles-15.git mg-styles-15
(cd mg-styles-15 && npm install --no-audit --no-fund --silent)
python3 -m pip install -q numpy scipy soundfile numba pedalboard pyloudnorm matplotlib librosa pillow fonttools brotli opencv-python-headless 2>&1 | grep -v WARNING || true
python3 scripts/mg_fonts.py mg-styles-15
for d in films/*/; do n=$(basename "$d"); [ -e "mg-styles-15/demos/$n" ] || ln -s "../../films/$n" "mg-styles-15/demos/$n"; done
echo "mg-styles-15 ready. Render: MG_CPU=1 scripts/mg-render.sh demos/<film> --workers 4"

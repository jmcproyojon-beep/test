#!/usr/bin/env bash
# setup.sh — install everything the iart.ai motion skills need to run their scripts.
#
# Usage (from the repo root):   bash .agents/skills/motion-skills/setup.sh
# Safe to re-run; each step skips itself when already satisfied.
#
# Installs:
#   - npm deps for skill-local scripts (talking-head: @fal-ai/client + @napi-rs/canvas; ascii-animation: sharp)
#   - Playwright for render/seek scripts (only if Node can't already load it)
#   - Manim Community + Cairo/Pango + LaTeX (for the `manim` skill), on Debian/Ubuntu with apt
# Needs already present: node >= 22, ffmpeg/ffprobe, python3 + pip.
# Not installed (optional): whisper.cpp for offline transcription in talking-head-b-roll —
#   set ELEVENLABS_API_KEY instead, or build whisper.cpp and put a ggml model in ~/.cache/whisper/.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; skills="$(dirname "$here")"
ok(){ printf '  \033[32m✓\033[0m %s\n' "$*"; }; warn(){ printf '  \033[33m!\033[0m %s\n' "$*"; }
SUDO=""; [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null && SUDO="sudo"

echo "== prerequisites"
for c in node npm ffmpeg ffprobe python3; do command -v $c >/dev/null && ok "$c" || warn "$c missing — install it first"; done

echo "== npm deps for skill scripts"
for d in talking-head ascii-animation; do
  if [ -f "$skills/$d/package.json" ]; then
    (cd "$skills/$d" && npm install --no-audit --no-fund --silent) && ok "$d" || warn "$d npm install failed"
  fi
done

echo "== playwright"
if node -e "try{require('playwright')}catch{require('playwright-core')}" >/dev/null 2>&1; then ok "playwright resolvable"
else
  (cd "$skills/motion-skills" && npm install --no-audit --no-fund --silent --no-save playwright-core && npx -y playwright install chromium >/dev/null) \
    && ok "playwright-core + chromium installed" || warn "playwright install failed"
fi

echo "== manim"
if command -v manim >/dev/null; then ok "$(manim --version)"
else
  if command -v apt-get >/dev/null; then
    $SUDO apt-get update -qq >/dev/null 2>&1
    DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq libcairo2-dev libpango1.0-dev pkg-config \
      texlive-latex-base texlive-latex-extra texlive-fonts-recommended dvisvgm >/dev/null 2>&1 \
      && ok "cairo/pango/LaTeX" || warn "apt install of manim system deps failed"
  else warn "no apt-get: install cairo, pango and a LaTeX distribution yourself"; fi
  # Debian's patched Python can't build the pure-python `srt` sdist (install_layout error); pack it by hand.
  if ! python3 -c "import srt" 2>/dev/null && ! pip install -q srt 2>/dev/null; then
    tmp="$(mktemp -d)"
    pip download -q srt==3.5.3 --no-deps --no-binary :all: -d "$tmp" && tar xzf "$tmp"/srt-3.5.3.tar.gz -C "$tmp" \
    && python3 -I - "$tmp/srt-3.5.3" "$tmp/srt-3.5.3-py3-none-any.whl" <<'PY' && pip install -q "$tmp/srt-3.5.3-py3-none-any.whl"
import sys, os, zipfile, hashlib, base64
src, whl = sys.argv[1], sys.argv[2]; files = {'srt.py': open(os.path.join(src, 'srt.py'), 'rb').read()}
for r, _, fs in os.walk(os.path.join(src, 'srt_tools')):
    for f in fs:
        if f.endswith('.py'): p = os.path.join(r, f); files[os.path.relpath(p, src)] = open(p, 'rb').read()
di = 'srt-3.5.3.dist-info/'
files[di + 'METADATA'] = b'Metadata-Version: 2.1\nName: srt\nVersion: 3.5.3\n'
files[di + 'WHEEL'] = b'Wheel-Version: 1.0\nGenerator: manual\nRoot-Is-Purelib: true\nTag: py3-none-any\n'
rec = [f"{k},sha256={base64.urlsafe_b64encode(hashlib.sha256(v).digest()).rstrip(b'=').decode()},{len(v)}" for k, v in files.items()]
files[di + 'RECORD'] = ('\n'.join(rec + [di + 'RECORD,,']) + '\n').encode()
with zipfile.ZipFile(whl, 'w') as z:
    for k, v in files.items(): z.writestr(k, v)
PY
    rm -rf "$tmp"
  fi
  pip install -q manim 2>/dev/null && ok "$(manim --version)" || warn "pip install manim failed"
fi

echo "== transcription (talking-head-b-roll)"
if [ -n "${ELEVENLABS_API_KEY:-}" ]; then ok "ELEVENLABS_API_KEY set"
elif command -v whisper-cli >/dev/null || command -v whisper-cpp >/dev/null; then ok "whisper.cpp found"
else warn "none — set ELEVENLABS_API_KEY or install whisper.cpp + a ggml model in ~/.cache/whisper/"; fi

echo "== API keys for paid skills"
[ -n "${FAL_KEY:-${FAL_API_KEY:-}}" ] && ok "FAL_KEY set" || warn "FAL_KEY not set (talking-head video generation)"
[ -n "${ELEVENLABS_API_KEY:-}" ] && ok "ELEVENLABS_API_KEY set" || warn "ELEVENLABS_API_KEY not set (talking-head voice)"
echo "done."

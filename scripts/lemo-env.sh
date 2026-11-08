# Source this before using the Lemo-Opuscar library in a cloud session:  . scripts/lemo-env.sh
# - LEMO_OPUSCAR_HOME: the library clone in this repo (git-ignored), so the skill never clones a second copy into ~
# - PLAYWRIGHT_CHROME: the pre-installed headless Chromium (no browser download needed)
# - PATH: the library venv first — its ffmpeg is a static ffmpeg 9 (imageio-ffmpeg); mux.sh needs ffmpeg 7+ (system has 6.1)
_root=$(cd "$(dirname "${BASH_SOURCE:-$0}")/.." 2>/dev/null && pwd || pwd)
export LEMO_OPUSCAR_HOME="$_root/lemo-opuscar"
export PLAYWRIGHT_CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)
export PATH="$LEMO_OPUSCAR_HOME/.venv/bin:$PATH"

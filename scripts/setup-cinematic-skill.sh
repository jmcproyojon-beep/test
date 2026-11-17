#!/usr/bin/env bash
# One-shot install of github.com/Moh4696/cinematic-skill for cloud sessions (into ./cinematic-skill, git-ignored).
# Usage: scripts/setup-cinematic-skill.sh        then follow .claude/skills/cinematic-film/SKILL.md
# - pins the commit this repo was tested with (bf43556); CINEMATIC_REF=main to take the latest
# - applies scripts/patches/cinematic-skill-commons-thumbs.patch (COMMONS_THUMB_WIDTH: standard Wikimedia thumbnail sizes,
#   needed here because Commons answers HTTP 429 to originals and 3200px renders from cloud IPs)
# - Python deps (skia-python, numpy, pillow, scipy) into the system python3; system libs skia needs (libEGL, libGL);
#   espeak-ng for the free scratch voice
set -euo pipefail
cd "$(dirname "$0")/.."
REF="${CINEMATIC_REF:-bf43556}"
if [ ! -d cinematic-skill/.git ]; then
  git clone -q https://github.com/Moh4696/cinematic-skill.git cinematic-skill
  git -C cinematic-skill checkout -q "$REF"
fi
if git -C cinematic-skill apply --check ../scripts/patches/cinematic-skill-commons-thumbs.patch 2>/dev/null; then
  git -C cinematic-skill apply ../scripts/patches/cinematic-skill-commons-thumbs.patch && echo "patched fetch_commons.py (COMMONS_THUMB_WIDTH)"
fi
python3 -m pip install -q --disable-pip-version-check -r cinematic-skill/requirements.txt
if ! python3 -c 'import skia' 2>/dev/null || ! command -v espeak-ng >/dev/null; then
  apt-get install -y -q libegl1 libgl1 espeak-ng >/dev/null 2>&1 || { apt-get update -q >/dev/null && apt-get install -y -q libegl1 libgl1 espeak-ng >/dev/null; }
fi
python3 cinematic-skill/skills/cinematic-film/scripts/check_setup.py

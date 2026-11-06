#!/usr/bin/env bash
# Install or update the awesome-osint list (https://github.com/jivoi/awesome-osint)
# into ./awesome-osint (git-ignored) and build the offline search page.
# Safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/awesome-osint"

if [ -d "$DIR/.git" ]; then
  echo "==> Updating awesome-osint"
  git -C "$DIR" pull --ff-only || echo "   (pull skipped)"
else
  echo "==> Cloning awesome-osint"
  git clone --depth 1 https://github.com/jivoi/awesome-osint.git "$DIR"
fi

python3 -I "$ROOT/scripts/osint.py" categories | tail -1
python3 -I "$ROOT/scripts/osint.py" html "$ROOT/awesome-osint/osint.html"
echo "==> Ready. Try: scripts/osint.py search email"

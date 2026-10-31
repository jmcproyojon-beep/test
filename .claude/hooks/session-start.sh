#!/bin/bash
# SessionStart hook: make the VectorCraft CLI + MCP server (vectorcraft-cli) available
# in Claude Code cloud sessions. The install script is idempotent: it skips the
# ~12-minute cargo build when the pinned revision is already installed.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

CARGO_BIN="${CARGO_HOME:-$HOME/.cargo}/bin"

# Install output goes to stderr so stdout stays clean for the hook protocol.
scripts/install_vectorcraft.sh >&2

# Make sure ~/.cargo/bin is on PATH for the rest of the session (MCP server, Bash).
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$CARGO_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

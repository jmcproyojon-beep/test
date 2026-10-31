#!/usr/bin/env bash
# Install the VectorCraft CLI + MCP server (https://github.com/storytold/vectorcraft).
#
# Builds `vectorcraft-cli` from source with cargo and installs it into
# $CARGO_HOME/bin (default ~/.cargo/bin). Idempotent: does nothing when the
# installed binary already matches the pinned revision, unless --force is given.
#
# Usage:
#   scripts/install_vectorcraft.sh            # pinned revision
#   VECTORCRAFT_REF=main scripts/install_vectorcraft.sh --force
#
# Requirements: git, Rust 1.95+ (rustup), a C toolchain. First build takes
# ~10-20 minutes and several GB of disk in the build cache.
set -euo pipefail

REPO_URL="${VECTORCRAFT_REPO:-https://github.com/storytold/vectorcraft.git}"
REF="${VECTORCRAFT_REF:-1a2a48580c1ced4ad3f088b9b8675b519f3db7f4}"
SRC_DIR="${VECTORCRAFT_SRC:-${XDG_CACHE_HOME:-$HOME/.cache}/openmontage/vectorcraft}"
BIN_DIR="${CARGO_HOME:-$HOME/.cargo}/bin"
STAMP="$BIN_DIR/.vectorcraft-cli.rev"
FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

export PATH="$BIN_DIR:$PATH"

if ! command -v cargo >/dev/null 2>&1; then
  echo "error: cargo not found. Install Rust first: https://rustup.rs" >&2
  exit 1
fi

if [[ $FORCE -eq 0 && -x "$BIN_DIR/vectorcraft-cli" && -f "$STAMP" && "$(cat "$STAMP")" == "$REF" ]]; then
  echo "vectorcraft-cli already installed at $BIN_DIR/vectorcraft-cli (rev $REF)"
  exit 0
fi

if [[ -d "$SRC_DIR/.git" ]]; then
  git -C "$SRC_DIR" fetch --depth 1 origin "$REF"
else
  mkdir -p "$(dirname "$SRC_DIR")"
  git clone --filter=blob:none "$REPO_URL" "$SRC_DIR"
  git -C "$SRC_DIR" fetch --depth 1 origin "$REF" || true
fi
git -C "$SRC_DIR" checkout --quiet --detach FETCH_HEAD 2>/dev/null || git -C "$SRC_DIR" checkout --quiet --detach "$REF"

cargo install --path "$SRC_DIR/apps/vectorcraft-cli" --locked --force
echo "$REF" > "$STAMP"

echo
echo "Installed: $(command -v vectorcraft-cli)"
echo "Smoke test:"
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"install","version":"0"}}}' \
  | vectorcraft-cli mcp --headless 2>/dev/null | head -c 300
echo
echo "MCP is registered for this repo in .mcp.json (server name: vectorcraft)."

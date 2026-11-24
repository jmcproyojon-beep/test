#!/usr/bin/env bash
# One-time setup for MCP for Blender (github.com/ahujasid/mcp-for-blender, PyPI mcp-for-blender 2.3.1) in a cloud session:
# Blender 4.x + a virtual display, the Python modules the addon imports, and the addon itself.
# Then start Blender with scripts/start-blender-mcp.sh; the MCP server is registered in .mcp.json (telemetry off).
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
need=(); for p in blender xvfb python3-requests python3-numpy; do dpkg -s "$p" >/dev/null 2>&1 || need+=("$p"); done
if [ ${#need[@]} -gt 0 ]; then apt-get update -qq && apt-get install -y -qq "${need[@]}"; fi
command -v uvx >/dev/null || { echo "uv is required (https://docs.astral.sh/uv/)"; exit 1; }
# writes ~/.config/blender/<ver>/scripts/addons/blender_mcp.py (Blender reads this name)
DISABLE_TELEMETRY=true uvx mcp-for-blender==2.3.1 install-addon
blender --version | head -1
echo "ready: run scripts/start-blender-mcp.sh, then restart Claude Code so the 'blender' MCP server in .mcp.json loads"

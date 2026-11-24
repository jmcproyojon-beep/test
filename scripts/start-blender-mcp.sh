#!/usr/bin/env bash
# Start Blender (4.x, GUI under a virtual display) with the MCP for Blender addon listening on localhost:9876.
# The addon runs its socket server from Blender's event loop, so it needs a real (virtual) window, not `blender -b`.
# Usage: scripts/start-blender-mcp.sh [port]      stop: scripts/start-blender-mcp.sh stop
set -euo pipefail
PORT="${1:-9876}"
LOG="${BLENDER_MCP_LOG:-/tmp/blender-mcp.log}"
PIDF=/tmp/blender-mcp.pid
if [ "$PORT" = stop ]; then
  [ -f "$PIDF" ] && pkill -TERM -P "$(cat "$PIDF")" 2>/dev/null; [ -f "$PIDF" ] && kill "$(cat "$PIDF")" 2>/dev/null
  pkill -f "blender --factory-startup --python-expr import bpy, addon_utils; addon_utils.enable\('blender_mcp'" 2>/dev/null || true
  for i in $(seq 1 20); do (exec 3<>/dev/tcp/127.0.0.1/9876) 2>/dev/null || break; sleep 0.5; done
  rm -f "$PIDF"; echo "stopped"; exit 0
fi
if (exec 3<>/dev/tcp/127.0.0.1/"$PORT") 2>/dev/null; then echo "Blender MCP already listening on $PORT"; exit 0; fi
ADDONS="$HOME/.config/blender/$(blender --version 2>/dev/null | awk 'NR==1{split($2,v,"."); print v[1]"."v[2]}')/scripts/addons"
mkdir -p "$ADDONS"
[ -f "$ADDONS/blender_mcp.py" ] || DISABLE_TELEMETRY=true uvx mcp-for-blender==2.3.1 install-addon
EXPR="import bpy, addon_utils; addon_utils.enable('blender_mcp', default_set=True, persistent=True); bpy.context.scene.blendermcp_port = $PORT; bpy.context.scene.blendermcp_auto_start_server = True"
export DISABLE_TELEMETRY=true
nohup xvfb-run -a -s "-screen 0 1600x900x24" blender --factory-startup --python-expr "$EXPR" >"$LOG" 2>&1 &
echo $! > "$PIDF"
for i in $(seq 1 60); do
  if (exec 3<>/dev/tcp/127.0.0.1/"$PORT") 2>/dev/null; then echo "Blender MCP listening on localhost:$PORT (log: $LOG)"; exit 0; fi
  sleep 1
done
echo "Blender did not open port $PORT in 60 s; see $LOG" >&2; tail -20 "$LOG" >&2; exit 1

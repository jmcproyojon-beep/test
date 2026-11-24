---
name: blender-mcp
description: Drive a live Blender (3D modelling, scenes, materials, lighting, rendering, asset import) through MCP for Blender (github.com/ahujasid/mcp-for-blender). Use when the user asks to build, edit or render something in Blender, make 3D models or scenes, render a 3D still or animation, or import Poly Haven / Sketchfab / Poly Pizza assets.
---

# MCP for Blender in this repo

**Pieces**
- Blender 4.0 (apt) running under a virtual display.
- The addon `~/.config/blender/4.0/scripts/addons/blender_mcp.py`, a socket server on `localhost:9876`.
- The MCP server `uvx mcp-for-blender==2.3.1`, registered as `blender` in `.mcp.json`, with telemetry off.

## Start
```sh
scripts/setup-blender-mcp.sh      # once per container: blender, xvfb, python3-requests/numpy, the addon
scripts/start-blender-mcp.sh      # starts Blender with the addon listening on :9876 (log /tmp/blender-mcp.log)
scripts/start-blender-mcp.sh stop
```

- The addon serves commands from Blender's event loop, so Blender must run with a window under Xvfb, **not** `blender -b`.
- The `blender` MCP tools load when Claude Code starts. After a fresh setup, restart the session (or `/mcp`) so they appear.
- Without the MCP tools loaded, drive it with a small MCP client: `uvx --with "mcp>=1.26,<2" python client.py`, using an `StdioServerParameters(command="uvx", args=["mcp-for-blender==2.3.1"])`.
- Use an MCP 1.x client; MCP 2.x fails the handshake with this server.

## Tools (2.3.1)

| Tool | What it does |
|---|---|
| `get_addon_status` | Blender and addon versions; which asset libraries and generators are on. |
| `get_scene_info` | Objects, camera, lights. |
| `execute_blender_code` | Runs Python with the full `bpy` API in the live Blender. This is the main tool. |
| `look` | Viewport or quick EEVEE render returned as an image. Pass `max_size` to keep it cheap. |
| `search_assets` / `import_asset` | Poly Haven HDRIs, textures and models; Sketchfab; Poly Pizza. These need network access, and Sketchfab needs a key. |
| `generate_3d`, `generate_gaussian_world` | Hosted generators (Hyper3D / Hunyuan3D etc.). They need API keys and may cost credits. |
| `disable_telemetry`, `record_trajectory_feedback` | Data-collection controls. Telemetry is already off through `DISABLE_TELEMETRY=true`. |

## Working rules (from the server's own instructions)
- Look shader nodes up by **type**, not name: `next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")`.
- Don't hardcode enum identifiers; read them from `bl_rna`. Set `scene.render.engine` inside try/except TypeError.
- Colours go on shader inputs; `material.diffuse_color` only changes the viewport.
- Imported or generated models come in at arbitrary scale. Size them from `world_bounding_box` and put them on the ground.
- Check the work with `look` after each meaningful step.
- Final renders and exports go to files through `execute_blender_code`:
  - Stills: `bpy.ops.render.render(write_still=True)`.
  - Animation: `scene.render.filepath`, then `bpy.ops.render.render(animation=True)`.
  - Models: `bpy.ops.export_scene.gltf(...)`.
- Write outputs under the working directory, then deliver them with SendUserFile.
- Engines on this machine: EEVEE (software GL under Xvfb, slow but fine for stills) and Cycles (CPU). Keep sizes and sample counts modest.

## Verified here
An MCP 1.x client ran this end to end:
- It listed all 10 tools.
- `get_scene_info` returned the scene.
- `execute_blender_code` built a plane, a red sphere, 6 cubes, a sun and a camera.
- `look` returned a 4.8 s EEVEE preview.

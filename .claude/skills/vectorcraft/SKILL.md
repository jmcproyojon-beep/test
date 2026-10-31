---
name: vectorcraft
description: Draw, edit and export vector art (posters, icons, logos, title cards, diagrams, SVG overlays) with VectorCraft, an open-source Rust vector illustration app driven through its MCP server or headless CLI. Use when a production needs original vector assets — SVG/PDF/PNG lower-thirds, title cards, icon sets, poster frames, recolouring or tracing an image into vectors, or converting between SVG/PDF/EPS/AI/DXF formats.
---

# VectorCraft — vector illustration for agents

VectorCraft (https://github.com/storytold/vectorcraft, MIT OR Apache-2.0) is an
Illustrator-class vector editor written in Rust. Everything the app can do is a
**command** (`shape.rectangle`, `paint.setFill`, `object.pathfinder.unite`, …),
and agents reach every command through:

- the **MCP server** `vectorcraft-cli mcp --headless` (registered in this repo's
  `.mcp.json` as `vectorcraft`, so its tools appear as `mcp__vectorcraft__*`), or
- the **headless batch CLI** `vectorcraft-cli run …` (scriptable from Bash).

Both use an in-process engine with a CPU renderer — no GPU or display needed.

## Install / check

```sh
command -v vectorcraft-cli || scripts/install_vectorcraft.sh   # builds from source, ~10-20 min first time
vectorcraft-cli --help
```

The script pins a known-good revision and installs into `~/.cargo/bin`. After a
fresh install, restart the Claude Code session so the `vectorcraft` MCP server in
`.mcp.json` connects. If MCP tools aren't available, use the CLI path below —
it has the same command set.

## Coordinate system and defaults

- Units are **points**; origin is the first artboard's **top-left**, **y points down**.
- A new document is 612 × 792 (US Letter). For video frames start with
  `file.new {width: 1920, height: 1080}` (or 1080×1920 for vertical).
- New objects become the selection; most commands act on the selection or on explicit `ids`.
- Paint: `"#rrggbb"`, `"none"`, `[r,g,b]` (0–1), `{"c","m","y","k"}`, `{"gray"}`, or
  `{"gradient": …}` / `{"swatch": "name"}`.
- For a filled shape with no outline pass `fill` **and** `stroke: "none"` (omitted paint
  inherits the current new-art appearance).
- Opacity on `draw_*` / `object.setProps` is **0–100 %** (`opacityPct`), not 0–1.

## MCP workflow (preferred)

Core tools:

| Tool | Use |
|---|---|
| `draw_shape` | `shape`: `rectangle`/`ellipse` (`x,y,width,height`, `radius`), `polygon` (`cx,cy,radius,sides`), `star` (`cx,cy,radius1,radius2,points`), `line` (`x1,y1,x2,y2`) + `fill, stroke, strokeWidth, dash, cap, join, opacity, name, effects` |
| `draw_path` | `points` (`[[x,y],…]` or `[{x,y,in,out,smooth}]`) or SVG `d`, `closed` + same styling |
| `add_text` | point type (`x,y`), area type (`width,height`), or on a path; `size, font, color, justify` |
| `apply_effect` | live effects (drop shadow, glows, blur, warp, 3D…); call with no `effect` to list them |
| `pathfinder` | `unite, minusFront, intersect, exclude, divide, trim, merge, crop, outline, minusBack` |
| `transform` | move / rotate / scale / reflect / shear, optional `copy` |
| `set_paint` | recolour selection or `ids` |
| `command_batch` | up to 256 steps in one call, `atomic: true` = one undo step; `"$N.id"` references earlier results |
| `list_commands` / `run_command` | the long tail: `list_commands {filter: "align"}` then `run_command {command, params}` |
| `inspect_document` | layer tree, ids, bounds, paint; use `depth: 0` on big docs |
| `screenshot` / `render_preview` | inline PNG of an artboard — **look at your work** |
| `open_file` / `save_file` / `export` | open SVG/PDF/AI/EPS/DXF/raster; export `svg, pdf, png, jpg, webp, eps, dxf, psd, …` |

Prompts (`prompts/get`): `poster`, `icon-set`, `recolor`, `trace-and-style`, `export-set`.

Typical loop:

1. `run_command {command: "file.new", params: {width: 1920, height: 1080}}`
2. Build with `draw_shape` / `draw_path` / `add_text`, batching with `command_batch {atomic: true}`.
3. `screenshot {scale: 0.5}` → inspect the image, fix, repeat.
4. `export {path: "projects/<id>/assets/vector/title.svg"}` and/or
   `export {path: ".../title.png", options: {width: 1920, background: "transparent"}}`.
5. Optionally `save_file {path: ".../title.vectorcraft"}` to keep an editable source.

Unknown parameter keys are refused with a "did you mean" hint — read the error and retry.
When unsure of a command's params, `list_commands {filter: "<id>"}` returns its params text.

Example batch:

```json
{"name":"command_batch","arguments":{"atomic":true,"label":"title card","steps":[
  {"id":"file.new","params":{"width":1920,"height":1080}},
  {"id":"draw_shape","params":{"shape":"rectangle","x":0,"y":0,"width":1920,"height":1080,"fill":"#0f1226","stroke":"none"}},
  {"id":"draw_shape","params":{"shape":"ellipse","x":760,"y":240,"width":400,"height":400,"fill":"#ff6b35","stroke":"none",
     "effects":[{"effect":"stylize.outerGlow"}]}},
  {"id":"draw_path","params":{"d":"M0 760 L480 520 L820 700 L1200 480 L1920 760 L1920 1080 L0 1080 Z","fill":"#2a1e5c","stroke":"none"}}
]}}
```

(Check effect ids with `apply_effect {}` before relying on one.)

## CLI workflow (no MCP needed)

```sh
# commands catalogue (JSON) — grep it for ids and params
vectorcraft-cli commands > /tmp/vc-commands.json

# one-shot build + export
vectorcraft-cli run --cmd file.new --params '{"width":1920,"height":1080}' \
  --cmd shape.star --params '{"cx":960,"cy":540,"radius1":300,"radius2":130}' \
  --cmd paint.setFill --params '{"color":"#ffc107"}' \
  --export out.svg --export out.png

# long scripts: steps from a file or stdin
vectorcraft-cli run --commands steps.json --export out.pdf

# convert / inspect / render existing files
vectorcraft-cli convert in.svg out.pdf
vectorcraft-cli info file.ai
```

`run` prints one JSON line per step and exits non-zero on the first failure, naming the step.

## Using the output in OpenMontage

- **SVG** → Remotion `<Img>`/inline SVG or HyperFrames HTML (crisp at any resolution,
  animatable with GSAP/DrawSVG after export).
- **Transparent PNG** at frame size → overlays/lower-thirds composited with FFmpeg or Remotion.
- **PDF/EPS/AI** → print or hand-off deliverables.
- Keep the `.vectorcraft` source next to exports in `projects/<id>/assets/` so later
  revisions are edits, not redraws. Log the tool choice in the run's decision log as usual.

## Gotchas

- Confine file access when needed: `vectorcraft-cli mcp --automation-read-root DIR --automation-write-root DIR`.
- Fonts: the source build has no bundled font set; type falls back to a default face unless
  system fonts are present. Use `outlineText: true` on SVG export when the viewer may lack the font.
- Large documents: drill with `inspect_document {depth: 0}`, `run_command document.find {...}`
  and `document.node {id, summary: true}` instead of dumping the whole model.
- UI-only tools (`inspect_ui`, `type_text`, `answer_dialog`, `open_panel`, `screenshot {window:true}`)
  need the desktop app (`vectorcraft --control 7979` + `vectorcraft-cli mcp --connect 127.0.0.1:7979`);
  they error in headless mode.
- Full reference: `docs/mcp.md` in the VectorCraft repo (cached at
  `~/.cache/openmontage/vectorcraft/docs/mcp.md` after running the install script).

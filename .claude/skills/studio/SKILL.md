---
name: studio
description: Open and work with Proyojon Studio, the local control panel for this repo's skills (projects, commands, platforms, research, outputs). Use when the user says "open the interface", "open the studio", "open my dashboard", "do my studio queue", "what's in my queue", "what am I working on", or asks about their Studio projects, runs or outputs.
---

# Proyojon Studio

Proyojon Studio is a local web app in `studio/`. It keeps one workspace per project
and turns the user's choices (task, platforms, research type, language) into a
command that Claude Code runs. Everything it knows is in plain files:

| What | Where |
|---|---|
| Projects | `studio/workspaces/<slug>/project.json` (name, type: personal/client/other, status, website, facebook, platforms, notes) |
| Brand context per project | `studio/workspaces/<slug>/context.md` (use it as the social media context file for that project) |
| Saved deliverables | `studio/workspaces/<slug>/outputs/*.md` |
| Run history | `studio/data/runs.json` (newest first) |
| Task queue | `studio/data/queue.json` |

## "Open the interface"

1. Check whether it is already running: `curl -s http://127.0.0.1:4321/api/health`.
2. If not, start it in the background (Bash with `run_in_background: true`) from the repo root:
   `node studio/server.mjs --open`
   It listens on 127.0.0.1:4321 and opens the browser. If the port is taken by an
   existing Studio it just opens the browser.
3. Tell the user the address, http://127.0.0.1:4321, in one line.

In a cloud session the server runs inside the container and the user's browser
cannot reach it. Say so, and offer to work through the queue or the files instead.

## "Do my studio queue"

1. Read `studio/data/queue.json` and take the items whose `status` is `"pending"`, oldest first.
2. Tell the user which items you are about to do (project and task) before starting.
3. For each item, carry out `prompt` exactly as written: it already names the
   project folder, the brand context to read and the skill to use.
4. Save the deliverable as Markdown to the item's `outputPath`.
5. Mark it done, either `curl -s -X POST http://127.0.0.1:4321/api/queue/<id>/done`
   when the server is running, or by setting `"status": "done"` and `"done": <ISO time>`
   for that item in `queue.json`.
6. Finish with one line per item: what was made and where it was saved.

## "What am I working on?"

Read `studio/data/runs.json` (latest runs), `studio/data/queue.json` (pending work) and the
`project.json` files, then summarise by project: recent tasks, what is queued, and the
newest output in each `outputs/` folder.

## Rules

- Write only inside the project's own `studio/workspaces/<slug>/` folder.
- Never invent facts, prices or claims about a brand; mark unverified items `[CONFIRM]`.
- When the user edits a project's brand context in chat, update its `context.md`.

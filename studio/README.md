# Proyojon Studio

A local control panel for the Claude Code skills in this repository. Keep your
personal and client projects in one place, pick what Claude should do, which
platforms and what kind of research, then run it and read the result.

## Start it

You need Node.js 18 or newer and [Claude Code](https://claude.com/claude-code)
installed and logged in on your computer.

```bash
node studio/server.mjs --open
```

It opens http://127.0.0.1:4321 in your browser. It only listens on your own
computer (127.0.0.1); nothing is exposed to the network.

Or, inside Claude Code in this folder, just say **"open the interface"**. The
`studio` skill starts the server and opens the page.

## What you can do

- **Projects**: one per brand, grouped as Client, Personal or Other. Each has
  a website, Facebook page, main platforms, notes, and a **Brand context** file
  that Claude reads before every task.
- **Command**: pick a task (write posts, captions, hooks, carousels, calendar,
  strategy, competitor / market / audience research, website audit, performance
  analysis, or any custom command), the platforms, the research focus, language,
  quantity and model. The exact command Claude receives is shown, and you can edit it.
- **Run now**: Claude Code runs in the background on your computer and you watch
  it work live: every search, page and file it touches. The final result is
  saved to the project's **Outputs**.
- **Add to queue**: save tasks for later. In a Claude Code chat say
  **"do my studio queue"** and Claude works through them.
- **Activity** and **History**: every run, its status, cost and output.
- **Skills**: every skill installed in `.claude/skills`, with a button to use
  one in a command.

## How runs are allowed to act

Runs use `claude -p` with a fixed tool list: read files, web search, web fetch,
skills, and edit/write **only inside that project's workspace folder**. Shell
commands are off unless you tick "Allow shell commands" for a run (needed by
the Browserbase skills, which use the `browse` CLI).

## Files

```
studio/
  server.mjs            the local server (no dependencies)
  lib/catalog.mjs       tasks, platforms, research types, and the command builder
  public/               the interface
  workspaces/<slug>/    project.json, context.md, outputs/
  data/                 runs.json and queue.json (not committed)
```

Settings: `--port 4321` or `STUDIO_PORT` changes the port; `STUDIO_CLAUDE_BIN`
points at a different `claude` executable.

Tests: `node --test studio/test/*.test.mjs`

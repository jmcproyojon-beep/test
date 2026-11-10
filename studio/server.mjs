#!/usr/bin/env node
// Proyojon Studio: a local control panel for the Claude Code skills in this repo.
//
//   node studio/server.mjs [--open] [--port 4321]
//
// Listens on 127.0.0.1 only. Projects live in studio/workspaces/<slug>/,
// run history and the task queue in studio/data/. Runs use the `claude` CLI
// installed on this machine (override with STUDIO_CLAUDE_BIN).

import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOG, buildPrompt, findAction, normalizeTask } from './lib/catalog.mjs';

const STUDIO = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(STUDIO);
const PUBLIC = path.join(STUDIO, 'public');
const WORKSPACES = process.env.STUDIO_WORKSPACES || path.join(STUDIO, 'workspaces');
const DATA = process.env.STUDIO_DATA || path.join(STUDIO, 'data');
const SKILLS = path.join(ROOT, '.claude', 'skills');
const RUNS_FILE = path.join(DATA, 'runs.json');
const QUEUE_FILE = path.join(DATA, 'queue.json');

const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const PORT = Number(portArg >= 0 ? args[portArg + 1] : process.env.STUDIO_PORT || 4321);
const HOST = '127.0.0.1';
const CLAUDE_BIN = process.env.STUDIO_CLAUDE_BIN || 'claude';
const IS_WIN = process.platform === 'win32';
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const OUTPUT_RE = /^[\w.-]+\.md$/;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

// ---------- small file helpers ----------

async function readJson(file, fallback) {
  try { return JSON.parse(await fsp.readFile(file, 'utf8')); } catch { return fallback; }
}

async function writeJson(file, value) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(value, null, 2));
  await fsp.rename(tmp, file);
}

function slugify(text) {
  return String(text).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project';
}

function stamp(date = new Date()) {
  return date.toISOString().replace(/[:T]/g, '-').slice(0, 19);
}

// ---------- projects ----------

const projectDir = (slug) => path.join(WORKSPACES, slug);

async function listProjects() {
  await fsp.mkdir(WORKSPACES, { recursive: true });
  const entries = await fsp.readdir(WORKSPACES, { withFileTypes: true });
  const projects = [];
  for (const e of entries) {
    if (!e.isDirectory() || !SLUG_RE.test(e.name)) continue;
    const meta = await readJson(path.join(projectDir(e.name), 'project.json'), null);
    if (!meta) continue;
    const outputs = await listOutputs(e.name);
    projects.push({ ...meta, slug: e.name, outputCount: outputs.length, lastOutput: outputs[0]?.created ?? null });
  }
  return projects.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
}

async function getProject(slug) {
  if (!SLUG_RE.test(slug)) return null;
  const meta = await readJson(path.join(projectDir(slug), 'project.json'), null);
  return meta ? { ...meta, slug } : null;
}

function cleanProject(input, base = {}) {
  const str = (v, max) => String(v ?? '').slice(0, max).trim();
  return {
    ...base,
    name: str(input.name ?? base.name, 120) || base.name || 'Untitled project',
    type: CATALOG.projectTypes.includes(input.type) ? input.type : base.type || 'client',
    status: ['active', 'paused', 'done'].includes(input.status) ? input.status : base.status || 'active',
    website: str(input.website ?? base.website, 300),
    facebook: str(input.facebook ?? base.facebook, 300),
    platforms: Array.isArray(input.platforms) ? input.platforms.filter((p) => CATALOG.platforms.includes(p)) : base.platforms || [],
    notes: str(input.notes ?? base.notes, 4000),
    updated: new Date().toISOString(),
  };
}

const CONTEXT_TEMPLATE = (name) => `# Social Media Context

last_updated: ${new Date().toISOString().slice(0, 10)}

## Identity
- **Name**: ${name}
- **Role**:
- **Industry/niche**:
- **Positioning**:

## Target Audience
- **Primary audience**:
- **Pain points**:
- **Goals**:

## Voice & Tone
- **Voice adjectives**:
- **Phrases to use**:
- **Phrases to avoid**:

## Content Pillars
1.

## Anti-Patterns
- **Topics to avoid**:
`;

async function createProject(input) {
  const base = slugify(input.name);
  let slug = base;
  for (let i = 2; fs.existsSync(projectDir(slug)); i++) slug = `${base}-${i}`;
  const meta = cleanProject(input, { created: new Date().toISOString() });
  await fsp.mkdir(path.join(projectDir(slug), 'outputs'), { recursive: true });
  await writeJson(path.join(projectDir(slug), 'project.json'), meta);
  await fsp.writeFile(path.join(projectDir(slug), 'context.md'), CONTEXT_TEMPLATE(meta.name));
  return { ...meta, slug };
}

async function listOutputs(slug) {
  const dir = path.join(projectDir(slug), 'outputs');
  let names = [];
  try { names = await fsp.readdir(dir); } catch { return []; }
  const files = [];
  for (const name of names.filter((n) => OUTPUT_RE.test(n))) {
    const st = await fsp.stat(path.join(dir, name));
    const head = (await fsp.readFile(path.join(dir, name), 'utf8')).slice(0, 400);
    const title = head.match(/^#\s+(.+)$/m)?.[1] ?? name;
    files.push({ name, title, size: st.size, created: st.mtime.toISOString() });
  }
  return files.sort((a, b) => b.created.localeCompare(a.created));
}

// ---------- skills ----------

async function listSkills() {
  let dirs = [];
  try { dirs = await fsp.readdir(SKILLS, { withFileTypes: true }); } catch { return []; }
  const skills = [];
  for (const d of dirs.filter((x) => x.isDirectory())) {
    let text;
    try { text = await fsp.readFile(path.join(SKILLS, d.name, 'SKILL.md'), 'utf8'); } catch { continue; }
    const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const lines = front.split(/\r?\n/);
    const i = lines.findIndex((l) => /^description:/.test(l));
    let description = '';
    if (i >= 0) {
      const parts = [lines[i].replace(/^description:\s*[|>]?-?\s*/, '')];
      for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) parts.push(lines[j].trim());
      description = parts.join(' ').replace(/^["']|["']$/g, '').trim();
    }
    const name = front.match(/^name:\s*(.+)$/m)?.[1]?.trim() || d.name;
    skills.push({ name, folder: d.name, description, group: skillGroup(d.name) });
  }
  return skills.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}

const BROWSER_SKILLS = new Set(['add-webmcp', 'agent-experience', 'autobrowse', 'browser', 'browser-to-api', 'browser-trace', 'browser-use-to-stagehand', 'company-research', 'competitor-analysis', 'cookie-sync', 'event-prospecting', 'fetch', 'functions', 'optimize-agent-prompt', 'safe-browser', 'search', 'ui-test', 'webmcp-gen']);

function skillGroup(folder) {
  if (folder.endsWith('-sms')) return 'Social media';
  if (BROWSER_SKILLS.has(folder)) return 'Web & research';
  if (folder === 'studio') return 'Studio';
  return 'Other';
}

// ---------- runs ----------

const live = new Map(); // id -> { record, events, clients, child }
let claudeVersion = null;

function claudeCommand(argv) {
  // Windows installs `claude` as a .cmd shim, which Node only starts through a
  // shell; every argument here is a fixed or whitelisted value, quoted for cmd.
  return IS_WIN
    ? { cmd: CLAUDE_BIN, argv: argv.map((a) => `"${a}"`), opts: { shell: true } }
    : { cmd: CLAUDE_BIN, argv, opts: {} };
}

function detectClaude() {
  const { cmd, argv, opts } = claudeCommand(['--version']);
  const r = spawnSync(cmd, argv, { ...opts, encoding: 'utf8', timeout: 15000 });
  claudeVersion = r.status === 0 ? r.stdout.trim() : null;
}

async function recordRun(record) {
  const runs = await readJson(RUNS_FILE, []);
  const i = runs.findIndex((r) => r.id === record.id);
  if (i >= 0) runs[i] = record; else runs.unshift(record);
  await writeJson(RUNS_FILE, runs.slice(0, 200));
}

function emit(run, event) {
  run.events.push(event);
  const line = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of run.clients) res.write(line);
}

function toolSummary(block) {
  const input = block.input || {};
  const detail = input.query || input.url || input.file_path || input.pattern || input.skill || input.command || input.description || '';
  return `${block.name}${detail ? `: ${String(detail).slice(0, 160)}` : ''}`;
}

async function startRun(project, rawTask, promptOverride) {
  const task = normalizeTask(rawTask);
  const action = findAction(task.action);
  const prompt = (promptOverride && String(promptOverride).trim()) || buildPrompt(project, task);
  const id = randomUUID().slice(0, 8);
  const ws = `./studio/workspaces/${project.slug}/**`;
  const tools = ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Skill', `Edit(${ws})`, `Write(${ws})`];
  if (task.allowShell) tools.push('Bash');

  const argv = ['-p', '--output-format', 'stream-json', '--verbose', '--allowedTools', tools.join(',')];
  if (task.model !== 'default') argv.push('--model', task.model);

  const record = {
    id, project: project.slug, projectName: project.name, action: task.action, label: action.label,
    task, status: 'running', started: new Date().toISOString(), finished: null, output: null, error: null, cost: null,
  };
  const run = { record, events: [], clients: new Set(), child: null, text: '', streamed: new Set() };
  live.set(id, run);
  await recordRun(record);
  emit(run, { type: 'status', status: 'running', label: action.label, project: project.name });

  const { cmd, argv: finalArgv, opts } = claudeCommand(argv);
  let child;
  try {
    child = spawn(cmd, finalArgv, { ...opts, cwd: ROOT, env: process.env, windowsHide: true });
  } catch (err) {
    await finishRun(run, null, `Could not start Claude Code: ${err.message}`);
    return record;
  }
  run.child = child;
  child.stdin.end(prompt);

  let buffer = '';
  let result = null;
  let failure = null;
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { emit(run, { type: 'log', text: line }); continue; }
      if (msg.type === 'stream_event' && msg.event?.delta?.type === 'text_delta') {
        run.streamed.add(msg.event.message_id ?? 'current');
        emit(run, { type: 'text', text: msg.event.delta.text });
      } else if (msg.type === 'assistant') {
        for (const block of msg.message?.content ?? []) {
          if (block.type === 'tool_use') emit(run, { type: 'tool', text: toolSummary(block) });
          else if (block.type === 'text' && !run.streamed.size) emit(run, { type: 'text', text: block.text });
        }
        run.streamed.clear();
        emit(run, { type: 'break' });
      } else if (msg.type === 'result') {
        result = msg.result ?? null;
        run.record.cost = msg.total_cost_usd ?? null;
        if (msg.is_error || msg.subtype !== 'success') failure = msg.result || msg.subtype || 'Claude reported an error';
      }
    }
  });
  let stderr = '';
  child.stderr.on('data', (c) => { stderr += c; if (stderr.length > 8000) stderr = stderr.slice(-8000); });
  child.on('error', (err) => { failure = `Could not start Claude Code (${CLAUDE_BIN}): ${err.message}`; });
  child.on('close', async (code) => {
    if (run.record.status === 'stopped') return finishRun(run, null, 'Stopped by you');
    if (!failure && code !== 0) failure = stderr.trim() || `Claude Code exited with code ${code}`;
    await finishRun(run, failure ? null : result, failure);
  });
  return record;
}

async function finishRun(run, result, error) {
  const r = run.record;
  r.finished = new Date().toISOString();
  if (r.status !== 'stopped') r.status = error ? 'failed' : 'done';
  r.error = error;
  if (result) {
    const name = `${stamp()}-${r.action}.md`;
    const header = `<!-- studio run ${r.id} · ${r.label} · ${r.finished} -->\n`;
    await fsp.mkdir(path.join(projectDir(r.project), 'outputs'), { recursive: true });
    await fsp.writeFile(path.join(projectDir(r.project), 'outputs', name), header + result);
    r.output = name;
    const meta = await readJson(path.join(projectDir(r.project), 'project.json'), null);
    if (meta) await writeJson(path.join(projectDir(r.project), 'project.json'), { ...meta, updated: r.finished });
  }
  await recordRun(r);
  emit(run, { type: 'status', status: r.status, output: r.output, error: r.error, cost: r.cost });
  for (const res of run.clients) res.end();
  run.clients.clear();
  run.child = null;
}

function stopRun(run) {
  if (!run.child) return false;
  run.record.status = 'stopped';
  if (IS_WIN) spawn('taskkill', ['/pid', String(run.child.pid), '/T', '/F']);
  else run.child.kill('SIGTERM');
  return true;
}

// ---------- queue (tasks for an interactive Claude session) ----------

async function addToQueue(project, rawTask, promptOverride) {
  const task = normalizeTask(rawTask);
  const item = {
    id: randomUUID().slice(0, 8), project: project.slug, projectName: project.name,
    action: task.action, label: findAction(task.action).label, task,
    prompt: (promptOverride && String(promptOverride).trim()) || buildPrompt(project, task),
    outputPath: `studio/workspaces/${project.slug}/outputs/${stamp()}-${task.action}.md`,
    status: 'pending', created: new Date().toISOString(), done: null,
  };
  const queue = await readJson(QUEUE_FILE, []);
  queue.push(item);
  await writeJson(QUEUE_FILE, queue);
  return item;
}

// ---------- HTTP ----------

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 2_000_000) throw Object.assign(new Error('Request too large'), { status: 413 });
    chunks.push(c);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

async function serveStatic(res, pathname) {
  const file = path.normalize(path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 404, { error: 'Not found' });
  try {
    const body = await fsp.readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    send(res, 404, { error: 'Not found' });
  }
}

async function route(req, res) {
  const url = new URL(req.url, `http://${HOST}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const method = req.method;

  if (parts[0] !== 'api') return method === 'GET' ? serveStatic(res, url.pathname) : send(res, 405, { error: 'Method not allowed' });

  // The browser page is the only expected caller; refuse cross-site requests.
  const origin = req.headers.origin;
  if (origin && origin !== `http://${HOST}:${PORT}` && origin !== `http://localhost:${PORT}`) return send(res, 403, { error: 'Forbidden origin' });

  const [, resource, a, b, c] = parts;

  if (resource === 'health') return send(res, 200, { ok: true, root: ROOT });

  if (resource === 'state' && method === 'GET') {
    const [projects, skills, runs, queue] = await Promise.all([listProjects(), listSkills(), readJson(RUNS_FILE, []), readJson(QUEUE_FILE, [])]);
    return send(res, 200, { catalog: CATALOG, projects, skills, runs: runs.slice(0, 50), queue, claude: claudeVersion, root: ROOT });
  }

  if (resource === 'projects') {
    if (!a && method === 'POST') return send(res, 201, await createProject(await readBody(req)));
    const project = a && (await getProject(a));
    if (!project) return send(res, 404, { error: 'Project not found' });
    const file = (n) => path.join(projectDir(project.slug), n);

    if (!b && method === 'PUT') {
      const meta = cleanProject(await readBody(req), project);
      delete meta.slug;
      await writeJson(file('project.json'), meta);
      return send(res, 200, { ...meta, slug: project.slug });
    }
    if (!b && method === 'DELETE') {
      const trash = path.join(WORKSPACES, '.trash');
      await fsp.mkdir(trash, { recursive: true });
      await fsp.rename(projectDir(project.slug), path.join(trash, `${project.slug}-${stamp()}`));
      return send(res, 200, { ok: true });
    }
    if (b === 'context' && method === 'GET') {
      const text = await fsp.readFile(file('context.md'), 'utf8').catch(() => '');
      return send(res, 200, { text });
    }
    if (b === 'context' && method === 'PUT') {
      const { text } = await readBody(req);
      await fsp.writeFile(file('context.md'), String(text ?? ''));
      return send(res, 200, { ok: true });
    }
    if (b === 'outputs' && !c && method === 'GET') return send(res, 200, await listOutputs(project.slug));
    if (b === 'outputs' && c && OUTPUT_RE.test(c)) {
      const target = path.join(file('outputs'), c);
      if (method === 'GET') {
        const text = await fsp.readFile(target, 'utf8').catch(() => null);
        return text === null ? send(res, 404, { error: 'Output not found' }) : send(res, 200, { name: c, text });
      }
      if (method === 'DELETE') {
        await fsp.rm(target, { force: true });
        return send(res, 200, { ok: true });
      }
    }
    if (b === 'preview' && method === 'POST') {
      const { task } = await readBody(req);
      return send(res, 200, { prompt: buildPrompt(project, task) });
    }
    if (b === 'run' && method === 'POST') {
      if (!claudeVersion) detectClaude();
      if (!claudeVersion) return send(res, 503, { error: `Claude Code CLI not found (${CLAUDE_BIN}). Install it, or set STUDIO_CLAUDE_BIN.` });
      const { task, prompt } = await readBody(req);
      return send(res, 202, await startRun(project, task, prompt));
    }
    if (b === 'queue' && method === 'POST') {
      const { task, prompt } = await readBody(req);
      return send(res, 201, await addToQueue(project, task, prompt));
    }
    return send(res, 404, { error: 'Not found' });
  }

  if (resource === 'runs' && a) {
    const run = live.get(a);
    if (b === 'stream' && method === 'GET') {
      if (!run) {
        const rec = (await readJson(RUNS_FILE, [])).find((r) => r.id === a);
        if (!rec) return send(res, 404, { error: 'Run not found' });
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
        res.end(`data: ${JSON.stringify({ type: 'status', status: rec.status, output: rec.output, error: rec.error, cost: rec.cost })}\n\n`);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      for (const ev of run.events) res.write(`data: ${JSON.stringify(ev)}\n\n`);
      if (run.child) { run.clients.add(res); req.on('close', () => run.clients.delete(res)); } else res.end();
      return;
    }
    if (b === 'stop' && method === 'POST') return send(res, run && stopRun(run) ? 200 : 409, { ok: Boolean(run) });
  }

  if (resource === 'queue' && a) {
    const queue = await readJson(QUEUE_FILE, []);
    const i = queue.findIndex((q) => q.id === a);
    if (i < 0) return send(res, 404, { error: 'Queue item not found' });
    if (method === 'DELETE') queue.splice(i, 1);
    else if (b === 'done' && method === 'POST') Object.assign(queue[i], { status: 'done', done: new Date().toISOString() });
    else return send(res, 405, { error: 'Method not allowed' });
    await writeJson(QUEUE_FILE, queue);
    return send(res, 200, { ok: true });
  }

  return send(res, 404, { error: 'Not found' });
}

function openBrowser(url) {
  const [cmd, argv] = IS_WIN ? ['cmd', ['/c', 'start', '""', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  try { spawn(cmd, argv, { stdio: 'ignore', detached: true, windowsHide: true }).unref(); } catch { /* print the URL instead */ }
}

const server = http.createServer((req, res) => {
  route(req, res).catch((err) => {
    if (!res.headersSent) send(res, err.status || (err instanceof SyntaxError ? 400 : 500), { error: err.message });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Studio is already running at http://${HOST}:${PORT}`);
    if (args.includes('--open')) openBrowser(`http://${HOST}:${PORT}`);
    process.exit(0);
  }
  throw err;
});

detectClaude();
server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`Proyojon Studio running at ${url}`);
  console.log(claudeVersion ? `Using Claude Code ${claudeVersion}` : `Claude Code CLI not found: runs are disabled, the queue still works.`);
  if (args.includes('--open')) openBrowser(url);
});

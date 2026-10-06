import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt, normalizeTask } from '../lib/catalog.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4400 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;
let server;
let tmp;

const api = async (p, opts = {}) => {
  const res = await fetch(`${BASE}/api${p}`, { ...opts, headers: { 'Content-Type': 'application/json' }, body: opts.body && JSON.stringify(opts.body) });
  return { status: res.status, body: await res.json() };
};

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-test-'));
  const fake = path.join(here, 'fake-claude.mjs');
  fs.chmodSync(fake, 0o755);
  server = spawn(process.execPath, [path.join(here, '..', 'server.mjs'), '--port', String(PORT)], {
    env: { ...process.env, STUDIO_WORKSPACES: path.join(tmp, 'ws'), STUDIO_DATA: path.join(tmp, 'data'), STUDIO_CLAUDE_BIN: fake },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  await new Promise((resolve) => server.stdout.on('data', (d) => { if (String(d).includes('running at')) resolve(); }));
});

after(() => {
  server?.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('normalizeTask drops values the catalog does not know', () => {
  const t = normalizeTask({ action: 'nope', platforms: ['Facebook', 'MySpace'], language: 'Klingon', count: '999', model: 'gpt', allowShell: 'yes' });
  assert.equal(t.action, 'custom');
  assert.deepEqual(t.platforms, ['Facebook']);
  assert.equal(t.language, 'Bangla');
  assert.equal(t.count, 50);
  assert.equal(t.model, 'default');
  assert.equal(t.allowShell, false);
});

test('buildPrompt names the project context, skill, platforms and research focus', () => {
  const p = { slug: 'acme', name: 'Acme', type: 'client', website: 'https://acme.test' };
  const posts = buildPrompt(p, { action: 'posts', platforms: ['Facebook', 'Instagram'], count: 3 });
  assert.match(posts, /studio\/workspaces\/acme\/context\.md/);
  assert.match(posts, /`post-writer-sms` skill/);
  assert.match(posts, /Platforms: Facebook, Instagram/);
  assert.match(posts, /How many: 3/);
  const research = buildPrompt(p, { action: 'competitors', research: ['Pricing & offers'], targets: 'rival.test' });
  assert.match(research, /Research focus: Pricing & offers/);
  assert.match(research, /rival\.test/);
  assert.match(research, /Cite every fact with a link/);
});

test('projects can be created, edited and given brand context', async () => {
  const created = await api('/projects', { method: 'POST', body: { name: 'Acme Homes', type: 'personal', platforms: ['TikTok', 'Bogus'] } });
  assert.equal(created.status, 201);
  assert.equal(created.body.slug, 'acme-homes');
  assert.deepEqual(created.body.platforms, ['TikTok']);

  const dup = await api('/projects', { method: 'POST', body: { name: 'Acme Homes' } });
  assert.equal(dup.body.slug, 'acme-homes-2');

  const edited = await api('/projects/acme-homes', { method: 'PUT', body: { status: 'paused', website: 'https://acme.test' } });
  assert.equal(edited.body.status, 'paused');
  assert.equal(edited.body.name, 'Acme Homes');

  await api('/projects/acme-homes/context', { method: 'PUT', body: { text: '# Acme voice' } });
  assert.equal((await api('/projects/acme-homes/context')).body.text, '# Acme voice');

  const state = await api('/state');
  assert.equal(state.body.projects.length, 2);
  assert.match(state.body.claude, /Fake Claude/);
});

test('rejects bad slugs and cross-site requests', async () => {
  assert.equal((await api('/projects/..%2F..%2Fetc/context')).status, 404);
  const res = await fetch(`${BASE}/api/state`, { headers: { Origin: 'https://evil.test' } });
  assert.equal(res.status, 403);
});

test('a run streams progress, limits writes to the workspace and saves the output', async () => {
  const run = await api('/projects/acme-homes/run', { method: 'POST', body: { task: { action: 'posts', platforms: ['Facebook'] } } });
  assert.equal(run.status, 202);

  const stream = await (await fetch(`${BASE}/api/runs/${run.body.id}/stream`)).text();
  const events = stream.split('\n\n').filter(Boolean).map((l) => JSON.parse(l.replace(/^data: /, '')));
  assert.ok(events.some((e) => e.type === 'tool' && e.text.startsWith('WebSearch')));
  assert.equal(events.filter((e) => e.type === 'text').length, 1, 'streamed text is not repeated');
  const done = events.at(-1);
  assert.equal(done.status, 'done');
  assert.equal(done.cost, 0.0123);

  const outputs = (await api('/projects/acme-homes/outputs')).body;
  assert.equal(outputs.length, 1);
  const saved = (await api(`/projects/acme-homes/outputs/${outputs[0].name}`)).body.text;
  assert.match(saved, /Edit\(\.\/studio\/workspaces\/acme-homes\/\*\*\)/);
  assert.doesNotMatch(saved, /Tools: [^\n]*Bash/);
});

test('queue items can be added and marked done', async () => {
  const item = await api('/projects/acme-homes/queue', { method: 'POST', body: { task: { action: 'calendar' } } });
  assert.equal(item.status, 201);
  assert.match(item.body.outputPath, /^studio\/workspaces\/acme-homes\/outputs\/.+-calendar\.md$/);
  await api(`/queue/${item.body.id}/done`, { method: 'POST' });
  const q = (await api('/state')).body.queue;
  assert.equal(q.find((x) => x.id === item.body.id).status, 'done');
});

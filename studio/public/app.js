// Proyojon Studio front end: plain ES module, no build step.

const $ = (sel, root = document) => root.querySelector(sel);
const main = $('#main');

const state = {
  data: null,
  view: { kind: 'home', slug: null, tab: 'command' },
  drafts: loadDrafts(),
  prompt: { text: '', edited: false },
  runs: {},          // runId -> { events: [], status, record }
  activeRun: {},     // slug -> runId shown in the command tab
  output: { slug: null, name: null, text: '' },
  context: { slug: null, text: '', dirty: false },
  search: '',
};

// ---------- utilities ----------

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function toast(message, isError = false) {
  const el = document.createElement('div');
  el.className = `toast${isError ? ' error' : ''}`;
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), isError ? 6000 : 3000);
}

function when(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function loadDrafts() {
  try { return JSON.parse(localStorage.getItem('studio.drafts') || '{}'); } catch { return {}; }
}

function saveDrafts() {
  try { localStorage.setItem('studio.drafts', JSON.stringify(state.drafts)); } catch { /* storage unavailable */ }
}

const project = () => state.data?.projects.find((p) => p.slug === state.view.slug) || null;
const action = (id) => state.data.catalog.actions.find((a) => a.id === id);

function draft(p = project()) {
  if (!state.drafts[p.slug]) {
    state.drafts[p.slug] = { action: 'posts', platforms: p.platforms?.length ? [...p.platforms] : ['Facebook'], research: ['Competitors'], language: 'Bangla', count: 3, targets: '', instructions: '', model: 'default', allowShell: false };
  }
  return state.drafts[p.slug];
}

// Small Markdown renderer for outputs: headings, lists, tables, quotes, code, links.
function md(src) {
  const inline = (t) => esc(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(?=\S)([^*]*?\S)\*\*(?![\w)])/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const lines = String(src).replace(/<!--[\s\S]*?-->\n?/g, '').split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const code = [];
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
    } else if (/^#{1,6}\s/.test(line)) {
      const level = Math.min(line.match(/^#+/)[0].length, 4);
      out.push(`<h${level}>${inline(line.replace(/^#+\s*/, ''))}</h${level}>`);
    } else if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line)) {
      out.push('<hr>');
    } else if (/^\|.*\|\s*$/.test(line) && /^\|?[\s:|-]+\|?\s*$/.test(lines[i + 1] || '')) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i++;
      const rows = [];
      while (i + 1 < lines.length && /^\|.*\|\s*$/.test(lines[i + 1])) rows.push(cells(lines[++i]));
      out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    } else if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d/.test(line);
      const items = [];
      for (; i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i]); i++) items.push(`<li>${inline(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, ''))}</li>`);
      i--;
      out.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
    } else if (/^>\s?/.test(line)) {
      const quote = [];
      for (; i < lines.length && /^>\s?/.test(lines[i]); i++) quote.push(inline(lines[i].replace(/^>\s?/, '')));
      i--;
      out.push(`<blockquote>${quote.join('<br>')}</blockquote>`);
    } else if (line.trim()) {
      const para = [inline(line)];
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|```|\||>|\s*([-*+]|\d+[.)])\s)/.test(lines[i + 1])) para.push(inline(lines[++i]));
      out.push(`<p>${para.join('<br>')}</p>`);
    }
  }
  return out.join('\n');
}

// ---------- data ----------

async function load() {
  state.data = await api('/state');
  const c = state.data.claude;
  $('#claude-status').textContent = c ? `Claude Code ${c.split(' ')[0]}` : 'Claude Code not found: queue only';
  const pending = state.data.queue.filter((q) => q.status === 'pending').length;
  const badge = $('#queue-count');
  badge.textContent = pending;
  badge.classList.toggle('zero', !pending);
  if (state.view.kind === 'home' && state.data.projects.length) state.view = { kind: 'project', slug: state.data.projects[0].slug, tab: 'command' };
  renderSidebar();
  renderMain();
}

function go(view) {
  state.view = { tab: 'command', ...view };
  if (view.kind === 'project') state.prompt = { text: '', edited: false };
  renderSidebar();
  renderMain();
  window.scrollTo(0, 0);
}

// ---------- sidebar ----------

function renderSidebar() {
  const q = state.search.toLowerCase();
  const groups = [['client', 'Client projects'], ['personal', 'Personal projects'], ['other', 'Other']];
  const list = $('#project-list');
  const projects = state.data.projects.filter((p) => !q || p.name.toLowerCase().includes(q));
  list.innerHTML = groups.map(([type, title]) => {
    const items = projects.filter((p) => p.type === type);
    if (!items.length) return '';
    return `<div><p class="group-title">${title}</p>${items.map((p) => `
      <button class="project-link${state.view.kind === 'project' && state.view.slug === p.slug ? ' active' : ''}" data-project="${esc(p.slug)}">
        <span class="dot ${esc(p.status)}"></span><span>${esc(p.name)}</span><span class="count" title="Saved outputs">${p.outputCount || ''}</span>
      </button>`).join('')}</div>`;
  }).join('') || `<p class="hint">${state.data.projects.length ? 'No match.' : 'No projects yet.'}</p>`;
  document.querySelectorAll('.nav-link').forEach((b) => b.classList.toggle('active', state.view.kind === b.dataset.view));
}

$('#project-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-project]');
  if (b) go({ kind: 'project', slug: b.dataset.project });
});
document.querySelectorAll('.nav-link').forEach((b) => b.addEventListener('click', () => go({ kind: b.dataset.view })));
$('#project-search').addEventListener('input', (e) => { state.search = e.target.value; renderSidebar(); });

// ---------- main ----------

function renderMain() {
  const v = state.view;
  if (v.kind === 'activity') return renderActivity();
  if (v.kind === 'queue') return renderQueue();
  if (v.kind === 'skills') return renderSkills();
  const p = project();
  if (!p) {
    main.innerHTML = `<div class="empty card"><h2>Welcome to Proyojon Studio</h2><p>Create a project for each brand you work on, personal or client. Then pick a task, choose platforms and run it with Claude.</p><button class="primary" data-act="new-project">+ Create your first project</button></div>`;
    return;
  }
  const tabs = [['command', 'Command'], ['outputs', `Outputs${p.outputCount ? ` (${p.outputCount})` : ''}`], ['context', 'Brand context'], ['history', 'History']];
  main.innerHTML = `
    <div class="page-head">
      <div>
        <h1>${esc(p.name)}</h1>
        <div class="meta">
          <span class="pill ${esc(p.type)}">${esc(p.type)}</span>
          <span class="pill">${esc(p.status)}</span>
          ${p.website ? `<a href="${esc(p.website)}" target="_blank" rel="noopener">Website</a>` : ''}
          ${p.facebook ? `<a href="${esc(p.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
          ${p.lastOutput ? `<span>Last output ${when(p.lastOutput)}</span>` : ''}
        </div>
      </div>
      <span class="spacer"></span>
      <button data-act="edit-project">Edit project</button>
    </div>
    <div class="tabs" role="tablist">${tabs.map(([id, label]) => `<button class="tab${v.tab === id ? ' active' : ''}" data-tab="${id}" role="tab">${label}</button>`).join('')}</div>
    <div id="tab-body"></div>`;
  const body = $('#tab-body');
  if (v.tab === 'outputs') renderOutputs(body, p);
  else if (v.tab === 'context') renderContext(body, p);
  else if (v.tab === 'history') body.innerHTML = runsTable(state.data.runs.filter((r) => r.project === p.slug), false);
  else renderCommand(body, p);
}

// ---------- command tab ----------

function renderCommand(body, p) {
  const d = draft(p);
  const cat = state.data.catalog;
  const a = action(d.action);
  const groups = [...new Set(cat.actions.map((x) => x.group))];
  const chips = (list, selected, name) => list.map((x) => `<button class="chip${selected.includes(x) ? ' active' : ''}" data-chip="${name}" data-value="${esc(x)}">${esc(x)}</button>`).join('');
  const canRun = Boolean(state.data.claude);

  body.innerHTML = `
    <div class="stack">
      <section class="card step">
        <div class="step-title"><span class="num">1</span><h2>What should Claude do?</h2></div>
        <div class="action-groups">${groups.map((g) => `
          <div class="action-group"><h3>${esc(g)}</h3><div class="action-grid">
            ${cat.actions.filter((x) => x.group === g).map((x) => `<button class="action${x.id === d.action ? ' active' : ''}" data-action="${x.id}"><strong>${esc(x.label)}</strong><small>${x.skill ? esc(x.skill) : x.research ? 'web research' : 'free-form'}</small></button>`).join('')}
          </div></div>`).join('')}
        </div>
      </section>

      <section class="card step">
        <div class="step-title"><span class="num">2</span><h2>Which platforms?</h2></div>
        <div class="chips">${chips(cat.platforms, d.platforms, 'platforms')}</div>
      </section>

      ${a.research ? `
      <section class="card step">
        <div class="step-title"><span class="num">3</span><h2>What kind of research?</h2></div>
        <div class="chips">${chips(cat.researchTypes, d.research, 'research')}</div>
        <label>Competitors, links or sources to include (optional)<textarea data-field="targets" rows="2" placeholder="e.g. rpclbd.com, Assure Group, facebook.com/…">${esc(d.targets)}</textarea></label>
      </section>` : ''}

      <section class="card step">
        <div class="step-title"><span class="num">${a.research ? 4 : 3}</span><h2>Details</h2></div>
        <div class="row">
          <label>Language<div class="segmented">${cat.languages.map((l) => `<button class="${d.language === l ? 'active' : ''}" data-lang="${esc(l)}">${esc(l)}</button>`).join('')}</div></label>
          <label>How many<input type="number" min="1" max="50" data-field="count" value="${esc(d.count ?? '')}" placeholder="any"></label>
          <label>Model<select data-field="model">${cat.models.map((m) => `<option value="${m}"${d.model === m ? ' selected' : ''}>${m === 'default' ? 'Default' : m[0].toUpperCase() + m.slice(1)}</option>`).join('')}</select></label>
        </div>
        <label>Instructions<textarea data-field="instructions" rows="4" placeholder="${esc(a.id === 'custom' ? 'Type any command for Claude…' : 'e.g. Promote the Proyojon Nest offer, focus on NRB buyers, add a site-visit call to action')}">${esc(d.instructions)}</textarea></label>
        <label class="toggle"><input type="checkbox" data-field="allowShell"${d.allowShell ? ' checked' : ''}> Allow shell commands (needed for Browserbase and other CLI-based skills)</label>
      </section>

      <section class="card step">
        <details class="prompt"${state.prompt.edited ? ' open' : ''}>
          <summary>Command Claude will receive ${state.prompt.edited ? '(edited by you)' : '(updates as you choose)'}</summary>
          <textarea id="prompt-box" spellcheck="false"></textarea>
          <div class="run-bar"><button class="small ghost" data-act="reset-prompt"${state.prompt.edited ? '' : ' hidden'}>Reset to generated command</button></div>
        </details>
        <div class="run-bar">
          <button class="primary" data-act="run"${canRun ? '' : ' disabled title="Claude Code CLI not found on this computer"'}>▶ Run now</button>
          <button data-act="queue">Add to queue</button>
          <p class="hint">Run now works in the background here. The queue holds tasks for your next Claude Code chat: say "do my studio queue".</p>
        </div>
      </section>

      <section id="run-panel"></section>
    </div>`;
  refreshPrompt();
  renderRunPanel(p);
}

async function refreshPrompt() {
  const box = $('#prompt-box');
  if (!box) return;
  if (state.prompt.edited) { box.value = state.prompt.text; return; }
  try {
    const { prompt } = await api(`/projects/${project().slug}/preview`, { method: 'POST', body: { task: draft() } });
    state.prompt.text = prompt;
    if (!state.prompt.edited && $('#prompt-box')) $('#prompt-box').value = prompt;
  } catch (err) { toast(err.message, true); }
}

function renderRunPanel(p) {
  const panel = $('#run-panel');
  const id = state.activeRun[p.slug];
  const run = id && state.runs[id];
  if (!panel || !run) { if (panel) panel.innerHTML = ''; return; }
  const running = run.status === 'running';
  panel.innerHTML = `
    <div class="card">
      <div class="run-head">
        ${running ? '<span class="spinner"></span>' : `<span class="pill ${esc(run.status)}">${esc(run.status)}</span>`}
        <h2>${esc(run.label || 'Run')}</h2>
        <span class="spacer"></span>
        ${running ? '<button class="small danger" data-act="stop">Stop</button>' : ''}
        ${run.output ? `<button class="small primary" data-act="open-output" data-name="${esc(run.output)}">Open saved output</button>` : ''}
      </div>
      <div class="console" id="console"></div>
    </div>`;
  const con = $('#console');
  for (const ev of run.events) appendEvent(con, ev);
}

function appendEvent(con, ev) {
  if (!con) return;
  const stick = con.scrollHeight - con.scrollTop - con.clientHeight < 40;
  if (ev.type === 'text') con.append(document.createTextNode(ev.text));
  else if (ev.type === 'break') { if (con.lastChild?.nodeType === 3 && !/\n$/.test(con.lastChild.textContent)) con.append(document.createTextNode('\n')); }
  else if (ev.type === 'tool') { const s = document.createElement('span'); s.className = 'tool'; s.textContent = `⚙ ${ev.text}`; con.append(s); }
  else if (ev.type === 'log') { const s = document.createElement('span'); s.className = 'tool'; s.textContent = ev.text; con.append(s); }
  else if (ev.type === 'status' && ev.error) { const s = document.createElement('div'); s.className = 'err'; s.textContent = `✖ ${ev.error}`; con.append(s); }
  else if (ev.type === 'status' && ev.status === 'done') { const s = document.createElement('div'); s.className = 'tool'; s.textContent = `✔ Finished${ev.cost != null ? ` · $${Number(ev.cost).toFixed(3)}` : ''}${ev.output ? ` · saved as ${ev.output}` : ''}`; con.append(s); }
  if (stick) con.scrollTop = con.scrollHeight;
}

function follow(runId, slug, label) {
  state.runs[runId] = { events: [], status: 'running', label, output: null };
  state.activeRun[slug] = runId;
  renderRunPanel(project());
  const source = new EventSource(`/api/runs/${runId}/stream`);
  source.onmessage = (msg) => {
    const ev = JSON.parse(msg.data);
    const run = state.runs[runId];
    run.events.push(ev);
    if (ev.type === 'status') {
      run.status = ev.status;
      if (ev.output) run.output = ev.output;
      if (ev.status !== 'running') {
        source.close();
        load().then(() => { if (state.view.slug === slug && state.view.tab === 'command') renderRunPanel(project()); });
        toast(ev.status === 'done' ? `${label} finished` : `${label}: ${ev.status}`, ev.status !== 'done');
        return;
      }
    }
    if (state.view.slug === slug && state.view.tab === 'command') appendEvent($('#console'), ev);
  };
  source.onerror = () => { source.close(); };
}

// ---------- outputs tab ----------

async function renderOutputs(body, p) {
  body.innerHTML = '<p class="hint">Loading…</p>';
  const files = await api(`/projects/${p.slug}/outputs`);
  if (!files.length) {
    body.innerHTML = '<div class="empty card">No outputs yet. Run a command and the result is saved here.</div>';
    return;
  }
  if (state.output.slug !== p.slug || !files.some((f) => f.name === state.output.name)) state.output = { slug: p.slug, name: files[0].name, text: '' };
  body.innerHTML = `
    <div class="split">
      <div class="list">${files.map((f) => `<button class="list-item${f.name === state.output.name ? ' active' : ''}" data-output="${esc(f.name)}"><strong>${esc(f.title)}</strong><small>${when(f.created)} · ${esc(f.name)}</small></button>`).join('')}</div>
      <div class="card"><div class="doc-tools"><button class="small" data-act="copy-output">Copy</button><button class="small" data-act="download-output">Download .md</button><button class="small danger ghost" data-act="delete-output">Delete</button></div><div class="md" id="doc">Loading…</div></div>
    </div>`;
  const { text } = await api(`/projects/${p.slug}/outputs/${encodeURIComponent(state.output.name)}`);
  state.output.text = text;
  $('#doc').innerHTML = md(text);
}

// ---------- context tab ----------

async function renderContext(body, p) {
  if (state.context.slug !== p.slug) {
    const { text } = await api(`/projects/${p.slug}/context`);
    state.context = { slug: p.slug, text, dirty: false };
  }
  body.innerHTML = `
    <div class="card stack">
      <p class="hint">Who this brand is, who it speaks to and how it sounds. Claude reads this file before every task for this project. Edit freely; it's Markdown.</p>
      <textarea id="context-box" rows="28" spellcheck="false" style="font:13px/1.55 ui-monospace,Menlo,Consolas,monospace">${esc(state.context.text)}</textarea>
      <div class="run-bar"><button class="primary" data-act="save-context">Save context</button><span class="hint" id="context-state">${state.context.dirty ? 'Unsaved changes' : 'Saved'}</span></div>
    </div>`;
}

// ---------- global views ----------

function runsTable(runs, showProject = true) {
  if (!runs.length) return '<div class="empty card">Nothing has run yet.</div>';
  return `<div class="card"><table class="table"><thead><tr><th>When</th>${showProject ? '<th>Project</th>' : ''}<th>Task</th><th>Status</th><th>Output</th></tr></thead><tbody>
    ${runs.map((r) => `<tr><td>${when(r.started)}</td>${showProject ? `<td><a href="#" data-project-link="${esc(r.project)}">${esc(r.projectName)}</a></td>` : ''}<td>${esc(r.label)}${r.task?.platforms?.length ? `<br><small class="hint">${esc(r.task.platforms.join(', '))}</small>` : ''}</td>
    <td><span class="pill ${esc(r.status)}">${esc(r.status)}</span>${r.error ? `<br><small class="hint">${esc(r.error.slice(0, 140))}</small>` : ''}</td>
    <td>${r.output ? `<a href="#" data-open-output="${esc(r.output)}" data-slug="${esc(r.project)}">Open</a>` : r.status === 'running' ? `<a href="#" data-watch="${esc(r.id)}" data-slug="${esc(r.project)}" data-label="${esc(r.label)}">Watch</a>` : ''}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderActivity() {
  main.innerHTML = `<div class="page-head"><div><h1>Activity</h1><p class="sub">Every run across all projects, newest first.</p></div></div>${runsTable(state.data.runs)}`;
}

function renderQueue() {
  const items = state.data.queue.slice().reverse();
  main.innerHTML = `
    <div class="page-head"><div><h1>Queue</h1><p class="sub">Tasks waiting for a Claude Code chat. Open Claude Code in this folder and say <strong>"do my studio queue"</strong>.</p></div></div>
    ${items.length ? `<div class="card"><table class="table"><thead><tr><th>Added</th><th>Project</th><th>Task</th><th>Status</th><th></th></tr></thead><tbody>
      ${items.map((q) => `<tr><td>${when(q.created)}</td><td>${esc(q.projectName)}</td><td>${esc(q.label)}<br><small class="hint">${esc(q.outputPath)}</small></td><td><span class="pill ${q.status === 'pending' ? 'running' : ''}">${esc(q.status)}</span></td>
      <td><button class="small" data-copy-queue="${esc(q.id)}">Copy command</button> <button class="small danger ghost" data-remove-queue="${esc(q.id)}">Remove</button></td></tr>`).join('')}
    </tbody></table></div>` : '<div class="empty card">The queue is empty. Use "Add to queue" on a project\'s Command tab.</div>'}`;
}

function renderSkills() {
  const skills = state.data.skills;
  const order = ['Studio', 'Social media', 'Web & research', 'Other'];
  const groups = [...new Set(skills.map((s) => s.group))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  main.innerHTML = `
    <div class="page-head"><div><h1>Skills</h1><p class="sub">${skills.length} skills installed in .claude/skills. Use one in a custom command for the open project.</p></div></div>
    ${groups.map((g) => `<div class="skill-group"><p class="group-title">${esc(g)}</p><div class="skill-list">
      ${skills.filter((s) => s.group === g).map((s) => `<div class="card skill"><code>${esc(s.name)}</code><p title="${esc(s.description)}">${esc(s.description || 'No description')}</p><div><button class="small" data-use-skill="${esc(s.name)}">Use in a command</button></div></div>`).join('')}
    </div></div>`).join('')}`;
}

// ---------- events ----------

main.addEventListener('click', async (e) => {
  const t = e.target.closest('button, a');
  if (!t) return;
  const p = project();
  const d = p && draft(p);
  try {
    if (t.dataset.tab) { state.view.tab = t.dataset.tab; renderMain(); return; }
    if (t.dataset.action) { d.action = t.dataset.action; saveDrafts(); rerenderCommand(); return; }
    if (t.dataset.chip) {
      const list = d[t.dataset.chip];
      const i = list.indexOf(t.dataset.value);
      if (i >= 0) list.splice(i, 1); else list.push(t.dataset.value);
      t.classList.toggle('active');
      saveDrafts(); refreshPrompt(); return;
    }
    if (t.dataset.lang) { d.language = t.dataset.lang; saveDrafts(); t.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === t)); refreshPrompt(); return; }
    if (t.dataset.output) { state.output.name = t.dataset.output; renderMain(); return; }
    if (t.dataset.projectLink) { e.preventDefault(); go({ kind: 'project', slug: t.dataset.projectLink }); return; }
    if (t.dataset.openOutput) { e.preventDefault(); state.output = { slug: t.dataset.slug, name: t.dataset.openOutput, text: '' }; go({ kind: 'project', slug: t.dataset.slug, tab: 'outputs' }); return; }
    if (t.dataset.watch) { e.preventDefault(); go({ kind: 'project', slug: t.dataset.slug }); follow(t.dataset.watch, t.dataset.slug, t.dataset.label); return; }
    if (t.dataset.copyQueue) { const q = state.data.queue.find((x) => x.id === t.dataset.copyQueue); await navigator.clipboard.writeText(q.prompt); toast('Command copied'); return; }
    if (t.dataset.removeQueue) { await api(`/queue/${t.dataset.removeQueue}`, { method: 'DELETE' }); await load(); return; }
    if (t.dataset.useSkill) {
      const target = project() || state.data.projects[0];
      if (!target) { toast('Create a project first', true); return; }
      const td = draft(target);
      td.action = 'custom';
      td.instructions = `Use the \`${t.dataset.useSkill}\` skill to `;
      saveDrafts();
      go({ kind: 'project', slug: target.slug });
      $('[data-field="instructions"]')?.focus();
      return;
    }

    switch (t.dataset.act) {
      case 'new-project': openProjectDialog(); break;
      case 'edit-project': openProjectDialog(p); break;
      case 'reset-prompt': state.prompt.edited = false; rerenderCommand(); break;
      case 'run': {
        if (d.action === 'custom' && !d.instructions.trim() && !state.prompt.edited) { toast('Type your command in Instructions first', true); return; }
        t.disabled = true;
        const rec = await api(`/projects/${p.slug}/run`, { method: 'POST', body: { task: d, prompt: state.prompt.edited ? state.prompt.text : null } });
        follow(rec.id, p.slug, rec.label);
        t.disabled = false;
        $('#run-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'queue': {
        const item = await api(`/projects/${p.slug}/queue`, { method: 'POST', body: { task: d, prompt: state.prompt.edited ? state.prompt.text : null } });
        toast(`Queued: ${item.label}. Say "do my studio queue" in Claude Code.`);
        await load();
        break;
      }
      case 'stop': await api(`/runs/${state.activeRun[p.slug]}/stop`, { method: 'POST' }); break;
      case 'open-output': state.output = { slug: p.slug, name: t.dataset.name, text: '' }; state.view.tab = 'outputs'; renderMain(); break;
      case 'copy-output': await navigator.clipboard.writeText(state.output.text.replace(/<!--[\s\S]*?-->\n?/, '')); toast('Copied'); break;
      case 'download-output': {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([state.output.text], { type: 'text/markdown' }));
        a.download = state.output.name;
        a.click();
        break;
      }
      case 'delete-output':
        if (!confirm(`Delete ${state.output.name}?`)) return;
        await api(`/projects/${p.slug}/outputs/${encodeURIComponent(state.output.name)}`, { method: 'DELETE' });
        state.output.name = null;
        await load();
        break;
      case 'save-context':
        await api(`/projects/${p.slug}/context`, { method: 'PUT', body: { text: $('#context-box').value } });
        state.context.text = $('#context-box').value;
        state.context.dirty = false;
        $('#context-state').textContent = 'Saved';
        toast('Brand context saved');
        break;
    }
  } catch (err) {
    t.disabled = false;
    toast(err.message, true);
  }
});

let previewTimer;
main.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'prompt-box') { state.prompt = { text: t.value, edited: true }; return; }
  if (t.id === 'context-box') { state.context.dirty = true; $('#context-state').textContent = 'Unsaved changes'; return; }
  const field = t.dataset.field;
  if (!field) return;
  const d = draft();
  d[field] = t.type === 'checkbox' ? t.checked : t.value;
  saveDrafts();
  clearTimeout(previewTimer);
  previewTimer = setTimeout(refreshPrompt, 300);
});
main.addEventListener('change', (e) => { if (e.target.dataset.field === 'model' || e.target.type === 'checkbox') e.target.dispatchEvent(new Event('input', { bubbles: true })); });

function rerenderCommand() {
  const body = $('#tab-body');
  if (body && state.view.tab === 'command') renderCommand(body, project());
}

// ---------- project dialog ----------

const dialog = $('#project-dialog');
const form = $('#project-form');
let editing = null;

function openProjectDialog(p = null) {
  editing = p;
  form.reset();
  $('#project-dialog-title').textContent = p ? 'Edit project' : 'New project';
  $('#delete-project').hidden = !p;
  for (const key of ['name', 'type', 'status', 'website', 'facebook', 'notes']) if (p) form.elements[key].value = p[key] ?? '';
  const selected = new Set(p?.platforms ?? ['Facebook']);
  $('#project-platforms').innerHTML = state.data.catalog.platforms.map((x) => `<button type="button" class="chip${selected.has(x) ? ' active' : ''}" data-value="${esc(x)}">${esc(x)}</button>`).join('');
  dialog.showModal();
}

$('#project-platforms').addEventListener('click', (e) => e.target.closest('.chip')?.classList.toggle('active'));
$('#new-project').addEventListener('click', () => openProjectDialog());

$('#delete-project').addEventListener('click', async () => {
  if (!editing || !confirm(`Delete "${editing.name}"? It moves to studio/workspaces/.trash.`)) return;
  await api(`/projects/${editing.slug}`, { method: 'DELETE' });
  dialog.close();
  state.view = { kind: 'home' };
  await load();
});

dialog.addEventListener('close', async () => {
  if (dialog.returnValue !== 'save') return;
  const body = Object.fromEntries(new FormData(form));
  body.platforms = [...$('#project-platforms').querySelectorAll('.chip.active')].map((c) => c.dataset.value);
  try {
    const saved = editing ? await api(`/projects/${editing.slug}`, { method: 'PUT', body }) : await api('/projects', { method: 'POST', body });
    if (!editing) delete state.drafts[saved.slug];
    await load();
    go({ kind: 'project', slug: saved.slug, tab: editing ? state.view.tab : 'context' });
    if (!editing) toast('Project created. Fill in its brand context so Claude knows the voice.');
  } catch (err) { toast(err.message, true); }
});

load().catch((err) => {
  main.innerHTML = `<div class="empty card"><h2>Can't reach the Studio server</h2><p>${esc(err.message)}</p><p>Start it with <code>node studio/server.mjs --open</code></p></div>`;
});

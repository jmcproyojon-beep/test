// What the Studio can ask Claude to do, and how each choice becomes a prompt.
// The server and the browser both read CATALOG, so a new action added here
// shows up in the interface without touching the UI code.

export const CATALOG = {
  actions: [
    { id: 'posts', label: 'Write posts', group: 'Create', skill: 'post-writer-sms',
      instruction: 'Write ready-to-publish social media posts for the selected platforms. For each post give the hook, the full text, the call to action, hashtags and a one-line visual brief.' },
    { id: 'captions', label: 'Captions for visuals', group: 'Create', skill: 'caption-writer-sms',
      instruction: 'Write captions for image or video posts. Describe the visual each caption pairs with if none is given.' },
    { id: 'hooks', label: 'Hooks & headlines', group: 'Create', skill: 'hook-writer-sms',
      instruction: 'Write scroll-stopping opening lines and headlines. Give several variants per idea and label the hook pattern used.' },
    { id: 'carousel', label: 'Carousel', group: 'Create', skill: 'carousel-writer-sms',
      instruction: 'Write a slide-by-slide carousel: slide text, the visual direction for each slide, and the caption.' },
    { id: 'series', label: 'Thread / series', group: 'Create', skill: 'thread-writer-sms',
      instruction: 'Write a multi-part series (thread, Reel series or post series) with a strong first part and a reason to follow every part.' },
    { id: 'repurpose', label: 'Repurpose content', group: 'Create', skill: 'content-repurposer-sms',
      instruction: 'Turn the source content given in the instructions into native formats for each selected platform.' },
    { id: 'calendar', label: 'Content calendar', group: 'Plan', skill: 'content-calendar-sms',
      instruction: 'Build a posting calendar: date, platform, pillar, format, topic, hook and call to action for every slot.' },
    { id: 'strategy', label: 'Content strategy', group: 'Plan', skill: 'content-strategy-sms',
      instruction: 'Define content pillars, topic clusters, the content mix and how each platform is used.' },
    { id: 'competitors', label: 'Competitor research', group: 'Research', skill: null, research: true,
      instruction: 'Find and analyse this project\'s competitors: who they are, their offers and prices, positioning, content style, strengths, weaknesses, and where this project can win. End with a prioritised action list.' },
    { id: 'market', label: 'Market & trend research', group: 'Research', skill: null, research: true,
      instruction: 'Research the market this project sells into: demand, prices, buyer concerns, trends and opportunities, with numbers where sources give them.' },
    { id: 'audience', label: 'Audience research', group: 'Research', skill: null, research: true,
      instruction: 'Research the target audience: who they are, what they worry about, what they search for, where they spend time online and which messages move them.' },
    { id: 'website', label: 'Website & SEO audit', group: 'Research', skill: null, research: true,
      instruction: 'Audit the project\'s website: messaging, trust signals, calls to action, share previews, speed and search visibility, and list fixes in priority order.' },
    { id: 'performance', label: 'Performance analysis', group: 'Analyse', skill: 'performance-analyzer-sms',
      instruction: 'Analyse the performance data named in the instructions (an export file or pasted numbers): best and worst posts, patterns, and what to do more or less of.' },
    { id: 'optimize', label: 'Growth recommendations', group: 'Analyse', skill: 'optimization-advisor-sms',
      instruction: 'Give prioritised, concrete recommendations to grow reach, engagement and leads.' },
    { id: 'custom', label: 'Custom command', group: 'Other', skill: null,
      instruction: 'Do exactly what the instructions below ask.' },
  ],
  platforms: ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'X / Twitter', 'Threads', 'Pinterest', 'Website / Google'],
  researchTypes: ['Competitors', 'Pricing & offers', 'Content & posting style', 'Reviews & reputation', 'SEO & keywords', 'Hashtags & trends', 'Ads'],
  languages: ['Bangla', 'English', 'Bangla + English'],
  projectTypes: ['personal', 'client', 'other'],
  models: ['default', 'sonnet', 'opus', 'haiku'],
};

const ACTIONS = new Map(CATALOG.actions.map((a) => [a.id, a]));

export function findAction(id) {
  return ACTIONS.get(id);
}

function pick(values, allowed) {
  return Array.isArray(values) ? values.filter((v) => allowed.includes(v)) : [];
}

// Keeps only values the catalog knows, so nothing a browser sends can reach
// the command line except through the prompt text itself.
export function normalizeTask(task = {}) {
  const action = findAction(task.action) ? task.action : 'custom';
  const count = Number.parseInt(task.count, 10);
  return {
    action,
    platforms: pick(task.platforms, CATALOG.platforms),
    research: pick(task.research, CATALOG.researchTypes),
    language: CATALOG.languages.includes(task.language) ? task.language : CATALOG.languages[0],
    count: Number.isFinite(count) && count > 0 ? Math.min(count, 50) : null,
    targets: String(task.targets ?? '').slice(0, 4000).trim(),
    instructions: String(task.instructions ?? '').slice(0, 20000).trim(),
    model: CATALOG.models.includes(task.model) ? task.model : 'default',
    allowShell: task.allowShell === true,
  };
}

export function buildPrompt(project, rawTask) {
  const task = normalizeTask(rawTask);
  const action = findAction(task.action);
  const dir = `studio/workspaces/${project.slug}`;
  const lines = [];

  lines.push(
    `This is a Proyojon Studio task, not a video production request: skip the OpenMontage pipeline rules.`,
    ``,
    `PROJECT: ${project.name} (${project.type} project)`,
    `Project folder: ${dir}/`,
    `Read ${dir}/context.md first. It is this project's brand and social media context; use it wherever a skill asks for .agents/social-media-context-sms.md.`,
  );
  if (project.website) lines.push(`Website: ${project.website}`);
  if (project.facebook) lines.push(`Facebook: ${project.facebook}`);
  if (project.notes) lines.push(`Project notes: ${project.notes}`);

  lines.push(``, `TASK: ${action.label}`, action.instruction);
  if (task.platforms.length) lines.push(`Platforms: ${task.platforms.join(', ')}`);
  if (action.research && task.research.length) lines.push(`Research focus: ${task.research.join(', ')}`);
  if (task.targets) lines.push(`Competitors, links or sources to include: ${task.targets}`);
  lines.push(`Language for the deliverable: ${task.language}`);
  if (task.count) lines.push(`How many: ${task.count}`);
  if (task.instructions) lines.push(``, `INSTRUCTIONS FROM THE USER:`, task.instructions);

  lines.push(``, `HOW TO WORK:`);
  if (action.skill) lines.push(`- Use the \`${action.skill}\` skill.`);
  if (action.research) {
    lines.push(
      `- Research with web search and page fetches. Cite every fact with a link.`,
      `- If a site or page cannot be reached, say so plainly. Never describe a page you did not read.`,
    );
  }
  lines.push(
    `- Never invent facts, numbers, prices or claims about the brand. Mark anything you could not verify as [CONFIRM].`,
    `- Only create or edit files inside ${dir}/, and only when the task needs a file other than the deliverable.`,
    `- Do not save the deliverable yourself. Your final message is saved to ${dir}/outputs/ automatically, so make it the complete deliverable in Markdown, starting with a # title, with no "Done" note or file paths.`,
  );
  return lines.join('\n');
}

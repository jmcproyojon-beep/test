# OpenSEO: Local Setup and Usage

[OpenSEO](https://github.com/every-app/open-seo) is an open-source,
pay-as-you-go alternative to Semrush/Ahrefs. It covers keyword research, rank
tracking, competitor and domain overviews, backlinks, site audits, local SEO
and AI-visibility (prompt) tracking. It ships an MCP server and agent skills,
so Claude can drive it directly.

It is a separate app (TypeScript, TanStack Start, Vite and Cloudflare Workers
via `wrangler`/miniflare, with Drizzle on D1/SQLite). It is **not** part of the
OpenMontage pipeline system. This repo only keeps an install script for it, and
the clone lives in `open-seo/` (git-ignored).

## Install

```bash
scripts/setup_open_seo.sh
```

With DataForSEO credentials (needed for any SEO data):

```bash
DATAFORSEO_LOGIN='you@example.com' DATAFORSEO_PASSWORD='api-password' scripts/setup_open_seo.sh
```

The script:

1. clones the repo into `open-seo/` (or pulls it if it is already there)
2. activates the pinned pnpm (10.30.1) with corepack and runs `pnpm install --frozen-lockfile`
3. creates `open-seo/.env.local` with `AUTH_MODE=local_noauth` (no login, you are `admin@localhost`)
4. writes `DATAFORSEO_API_KEY` (base64 of `login:password`) when credentials are given
5. applies the local D1 migrations

Requirements: Node 20+ and corepack.

## Run

```bash
cd open-seo && pnpm run dev
```

Open http://localhost:3001. The first start takes about 40 seconds while Vite
optimizes dependencies. The "Unable to fetch the `Request.cf` object" warning is
harmless.

## Keys

| Variable | Needed for | Where |
|---|---|---|
| `DATAFORSEO_API_KEY` | All SEO data (keywords, domains, backlinks, SERPs, rank tracking) | [dataforseo.com](https://dataforseo.com). Pay per request. See `open-seo/docs/DATAFORSEO_API_KEY.md` |
| `GOOGLE_MAPS_API_KEY` | Local SEO map | `open-seo/docs/GOOGLE_MAPS_SETUP.md` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `BETTER_AUTH_SECRET` | Google Search Console and GA4 | `open-seo/docs/SELF_HOSTING_GOOGLE_SEARCH_CONSOLE.md` |
| `CONTEXT_API_KEY` | "Render JavaScript" option in site audits | context.dev |

All keys go in `open-seo/.env.local`. Restart the dev server after you change it.
Site Audit (crawling your own site) works without DataForSEO.

## Main workflows (left sidebar)

- **Research:** Keyword Research, Domain Overview, Backlinks
- **AI Visibility:** Prompt Research, Prompt Explorer, Prompt Tracking
- **My Site:** GSC Insights, Rank Tracking, Local SEO, Saved Keywords, Site Audit
- **AI Tools:** Reports, Context, Agent setup (MCP connection details)

Work is grouped into **projects**, one per website. Use the switcher at the top left.

## Using it from Claude (MCP + skills)

**Claude Code (local instance):** the repo's `.mcp.json` registers `openseo` at
`http://localhost:3001/mcp`. In `local_noauth` mode it needs no login and exposes
81 tools (projects, keywords, SERPs, domains, backlinks, rank tracking, local
SEO, AI visibility, Search Console/GA4, site audits, reports). Start the dev
server first, then approve the project server the first time Claude Code asks
(or check it with `claude mcp list`).

**claude.ai / Claude Desktop / mobile:** these cannot reach `localhost`. Add the
hosted **OpenSEO** connector from the connector directory (Settings → Connectors),
or add a custom connector with `https://app.openseo.so/mcp`, or with the
`/mcp` URL of your own public Docker/Cloudflare deploy.

- **Agent setup** in the app shows the MCP endpoint for this instance.
- Ready-made agent skills live in `open-seo/plugins/openseo/skills/`:
  `keyword-research`, `keyword-clustering`, `competitor-analysis`,
  `competitive-landscape`, `link-prospecting`, `seo-audit`, `local-seo`,
  `ai-visibility-audit`, `ai-prompt-research`, `seo-report`,
  `seo-project-setup`, `seo-coach`.
- Install them into another agent with
  `npx skills add every-app/open-seo`. Docs: https://openseo.so/docs/mcp and
  https://openseo.so/docs/skills/setup

## Hosting permanently

A dev server inside a cloud session goes away when the session ends. For
something that is always on, use one of the following:

- **Docker:** `open-seo/docs/SELF_HOSTING_DOCKER.md` (prebuilt image, email/password accounts)
- **Cloudflare (free plan works):** `open-seo/docs/SELF_HOSTING_CLOUDFLARE.md`
- **Hosted:** https://openseo.so

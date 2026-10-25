# MiroFish — setup notes for this checkout

Vendored from [666ghj/MiroFish](https://github.com/666ghj/MiroFish) at upstream
commit `7657031`, installed and verified in a Linux container (Node 22, uv 0.11,
Python 3.11 picked by uv — the backend requires `>=3.11,<3.13`).

## What it is

A multi-agent "swarm prediction" engine. You upload seed material (a report,
news article, novel chapters — `.pdf`, `.md`, `.txt`) and describe what you want
predicted. MiroFish then:

1. **Builds a knowledge graph** from the seed (ontology generation + GraphRAG in Zep Cloud).
2. **Sets up the environment** — extracts entities, generates agent personas.
3. **Simulates** — runs OASIS (CAMEL-AI) Twitter- and Reddit-style social simulations in parallel.
4. **Writes a report** — a ReportAgent queries the post-simulation world.
5. **Lets you interact** — chat with any simulated agent or with the ReportAgent.

Layout: `backend/` (Flask API on :5001, `app/api` = graph / simulation / report
routes, `app/services` = the pipeline), `frontend/` (Vue 3 + Vite on :3000,
proxies `/api` to the backend), `locales/` (zh/en UI strings).

## Install (already done here)

```bash
cd MiroFish
npm run setup            # root + frontend node deps
npm run setup:backend    # cd backend && uv sync  (creates backend/.venv)
cp .env.example .env     # then fill in keys
```

## Configure — the only step left

Edit `MiroFish/.env` (git-ignored). The backend refuses to start without both keys:

```env
LLM_API_KEY=...          # any OpenAI-compatible API
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1   # or https://api.openai.com/v1, etc.
LLM_MODEL_NAME=qwen-plus # or gpt-4o-mini, etc.
ZEP_API_KEY=...          # free tier at https://app.getzep.com/
```

Optional: `LLM_BOOST_API_KEY` / `LLM_BOOST_BASE_URL` / `LLM_BOOST_MODEL_NAME`
for a faster secondary model (leave the lines out entirely if unused),
`OASIS_DEFAULT_MAX_ROUNDS` (default 10). Simulations burn a lot of tokens —
start with under 40 rounds.

## Run

```bash
cd MiroFish
npm run dev              # backend :5001 + frontend :3000 together
# or: npm run backend / npm run frontend
```

Docker alternative: `docker compose up -d` (reads the same `.env`).

## Verified

| Check | Result |
|-------|--------|
| `cd backend && uv run --group dev pytest -q` | 130 passed |
| backend boot (placeholder keys) | `GET /health` → `{"status":"ok"}`, `/api/graph/project/list` → 200 |
| frontend dev server | serves on :3000, `/api` proxy reaches backend |
| `npm run build` | builds clean (chunk-size warning only) |

Not verified: a real end-to-end prediction run — this container has no LLM or
Zep keys. Once keys are in `.env`, `backend/scripts/validate_zep_cloud_integration.py`
does a live Zep Cloud check (creates and deletes a test graph).

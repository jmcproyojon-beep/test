#!/usr/bin/env bash
# One-command MiroFish launcher: install missing deps, resolve keys, check them
# against the live APIs, then start backend (:5001) + frontend (:3000).
#
#   ./start.sh            # full start
#   ./start.sh --check    # stop after the key check
#
# Keys come from MiroFish/.env, or from environment variables of the same name
# (LLM_API_KEY, LLM_BASE_URL, LLM_MODEL_NAME, ZEP_API_KEY; or OPENROUTER_API_KEY
# in place of the three LLM_* ones). Environment
# variables are written into .env, because the backend loads .env with
# override=True and placeholder values there would otherwise win.
set -euo pipefail
cd "$(dirname "$0")"

say() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

command -v node >/dev/null || die "Node.js 18+ is required"
command -v uv   >/dev/null || die "uv is required: https://docs.astral.sh/uv/"

[ -d node_modules ] && [ -d frontend/node_modules ] || { say "Installing Node deps"; npm run setup; }
[ -d backend/.venv ] || { say "Installing Python deps"; npm run setup:backend; }

placeholder() { [ -z "${1:-}" ] || [[ "$1" == your_* ]] || [[ "$1" == "..." ]]; }
env_get() { [ -f .env ] && sed -n "s/^$1=//p" .env | tail -1 || true; }

# OpenRouter is OpenAI-compatible; an OPENROUTER_API_KEY fills in the LLM settings.
if placeholder "${LLM_API_KEY:-}" && ! placeholder "${OPENROUTER_API_KEY:-}"; then
  LLM_API_KEY=$OPENROUTER_API_KEY
  LLM_BASE_URL=${LLM_BASE_URL:-https://openrouter.ai/api/v1}
  LLM_MODEL_NAME=${LLM_MODEL_NAME:-openai/gpt-4o-mini}
fi

llm_key=$(env_get LLM_API_KEY); zep_key=$(env_get ZEP_API_KEY)
if { placeholder "$llm_key" || placeholder "$zep_key"; } \
   && ! placeholder "${LLM_API_KEY:-}" && ! placeholder "${ZEP_API_KEY:-}"; then
  say "Writing .env from environment variables"
  cat > .env <<EOF
LLM_API_KEY=${LLM_API_KEY}
LLM_BASE_URL=${LLM_BASE_URL:-https://api.openai.com/v1}
LLM_MODEL_NAME=${LLM_MODEL_NAME:-gpt-4o-mini}
ZEP_API_KEY=${ZEP_API_KEY}
EOF
  llm_key=$LLM_API_KEY; zep_key=$ZEP_API_KEY
fi
if placeholder "$llm_key" || placeholder "$zep_key"; then
  [ -f .env ] || cp .env.example .env
  die "Set real LLM_API_KEY and ZEP_API_KEY in $(pwd)/.env (or export them), then re-run"
fi

say "Checking keys against the live APIs"
(cd backend && uv run python - <<'EOF'
import sys
from app.config import Config
from openai import OpenAI
from zep_cloud.client import Zep

ok = True
try:
    OpenAI(api_key=Config.LLM_API_KEY, base_url=Config.LLM_BASE_URL).chat.completions.create(
        model=Config.LLM_MODEL_NAME, max_tokens=5,
        messages=[{"role": "user", "content": "ping"}])
    print(f"  LLM  ok   ({Config.LLM_MODEL_NAME} @ {Config.LLM_BASE_URL})")
except Exception as e:
    ok = False; print(f"  LLM  FAIL ({Config.LLM_MODEL_NAME} @ {Config.LLM_BASE_URL}): {type(e).__name__}: {e}")
try:
    Zep(api_key=Config.ZEP_API_KEY).graph.list_all(page_size=1)
    print("  Zep  ok")
except Exception as e:
    ok = False; print(f"  Zep  FAIL: {type(e).__name__}: {e}")
sys.exit(0 if ok else 1)
EOF
) || die "Fix the failing key/URL/model in .env and re-run"

[ "${1:-}" = "--check" ] && { say "Ready. Run ./start.sh to launch."; exit 0; }

say "Starting MiroFish — open http://localhost:3000 (API on :5001)"
exec npm run dev

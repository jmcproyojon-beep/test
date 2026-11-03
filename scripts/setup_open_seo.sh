#!/usr/bin/env bash
# Install OpenSEO (https://github.com/every-app/open-seo) for local use.
#
# Clones it into ./open-seo (git-ignored), installs dependencies with the
# pinned pnpm, creates .env.local in local no-auth mode, and migrates the
# local D1 (SQLite) database. Safe to re-run.
#
# Usage:
#   scripts/setup_open_seo.sh                 # install only
#   DATAFORSEO_LOGIN=me@x.com DATAFORSEO_PASSWORD=secret scripts/setup_open_seo.sh
#   scripts/setup_open_seo.sh --start         # install, then run the dev server on :3001
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/open-seo"
REPO="https://github.com/every-app/open-seo.git"

if [ ! -d "$DIR/.git" ]; then
  echo "==> Cloning $REPO"
  git clone --depth 1 "$REPO" "$DIR"
else
  echo "==> Updating existing clone"
  git -C "$DIR" pull --ff-only || echo "   (pull skipped; local changes present)"
fi

cd "$DIR"

echo "==> Activating pinned pnpm via corepack"
corepack enable
pnpm --version

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

if [ ! -f .env.local ]; then
  echo "==> Creating .env.local (AUTH_MODE=local_noauth)"
  cp .env.example .env.local
  sed -i.bak 's/^# AUTH_MODE=cloudflare_access$/AUTH_MODE=local_noauth/' .env.local && rm -f .env.local.bak
fi

if [ -n "${DATAFORSEO_LOGIN:-}" ] && [ -n "${DATAFORSEO_PASSWORD:-}" ]; then
  KEY="$(printf '%s' "$DATAFORSEO_LOGIN:$DATAFORSEO_PASSWORD" | base64 | tr -d '\n')"
  sed -i.bak '/^#\{0,1\} *DATAFORSEO_API_KEY=/d' .env.local && rm -f .env.local.bak
  echo "DATAFORSEO_API_KEY=$KEY" >> .env.local
  echo "==> DataForSEO key written to .env.local"
elif ! grep -q '^DATAFORSEO_API_KEY=.' .env.local; then
  echo "!!  No DATAFORSEO_API_KEY yet. SEO data features stay disabled until you add one"
  echo "    (see open-seo/docs/DATAFORSEO_API_KEY.md)."
fi

echo "==> Migrating local database"
pnpm run db:migrate:local >/dev/null

echo "==> OpenSEO ready in $DIR"

if [ "${1:-}" = "--start" ]; then
  echo "==> Starting dev server at http://localhost:3001"
  exec pnpm run dev
else
  echo "    Start it with:  cd open-seo && pnpm run dev   (http://localhost:3001)"
fi

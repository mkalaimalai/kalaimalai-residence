#!/usr/bin/env bash
# Local dev launcher. Modes differ by which backing services a surface needs:
#
#   ./scripts/dev.sh web    Next only. `/` renders from the seed; `/2.0` will NOT work.
#   ./scripts/dev.sh api    Postgres + pgweb + FastAPI. No frontend.
#   ./scripts/dev.sh all    Everything — the mode to use for `/2.0` and the portal.
#
# Database target:
#   DB_TARGET=docker    (default) local container, seeded automatically
#   DB_TARGET=supabase  cloud Supabase via api/.env.supabase — no container, NO auto-seed
#
# Note: `/` and `/2.0` are routes on the SAME Next server. There is no second frontend.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-all}"
DB_TARGET="${DB_TARGET:-docker}"
PIDS=()
cleanup() {
  [[ ${#PIDS[@]} -gt 0 ]] && kill "${PIDS[@]}" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

start_db() {
  docker info >/dev/null 2>&1 || { echo "Docker daemon is not running."; exit 1; }
  echo "==> Starting Postgres + pgweb"
  docker compose up -d db pgweb
  echo -n "==> Waiting for Postgres"
  for _ in $(seq 1 30); do
    if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
      echo " ready"; return 0
    fi
    echo -n "."; sleep 1
  done
  echo " timed out"; exit 1
}

load_supabase_env() {
  [[ -f api/.env.supabase ]] || { echo "api/.env.supabase not found."; exit 1; }
  # Only inspect assignments — the guidance comments in the file legitimately mention
  # the placeholder names, and grepping the whole file tripped on those forever.
  if grep -v '^[[:space:]]*#' api/.env.supabase \
     | grep -q "<PROJECT_REF>\|<DB_PASSWORD>\|<JWT_SECRET>"; then
    echo "api/.env.supabase still has placeholders — fill them in first."; exit 1
  fi
  # Exported vars outrank api/.env in pydantic-settings, so this wins without edits.
  set -a; . ./api/.env.supabase; set +a
  echo "==> Target: Supabase (cloud). Container not started; seeding skipped."
}

start_api() {
  [[ -x api/.venv/bin/python ]] || {
    echo "api/.venv missing. Create it:"
    echo "  python3 -m venv api/.venv && api/.venv/bin/pip install -r api/requirements.txt"
    exit 1
  }
  # Seed only the local container, only when empty. Never auto-seed Supabase —
  # that is a write to shared cloud data and must stay an explicit, manual act.
  if [[ "$DB_TARGET" == "docker" ]]; then
    local count
    count="$(docker compose exec -T db psql -U postgres -tAc \
      "select count(*) from spaces" 2>/dev/null || echo 0)"
    if [[ "$count" == "0" ]]; then
      echo "==> Seeding (database is empty)"
      npm run export:seed
      (cd api && AUTH_DISABLED=true PYTHONPATH="$PWD" ./.venv/bin/python scripts/seed.py)
    else
      echo "==> Seed present ($count spaces) — skipping load"
    fi
  fi

  echo "==> Starting FastAPI on :8099"
  if [[ "$DB_TARGET" == "supabase" ]]; then
    # AUTH_DISABLED / DATABASE_URL come from the exported Supabase profile.
    (cd api && PYTHONPATH="$PWD" ./.venv/bin/uvicorn app.main:app --reload --port 8099) &
  else
    (cd api && AUTH_DISABLED=true PYTHONPATH="$PWD" \
      ./.venv/bin/uvicorn app.main:app --reload --port 8099) &
  fi
  PIDS+=($!)
}

start_web() {
  echo "==> Starting Next on :3000"
  npm run dev &
  PIDS+=($!)
}

if [[ "$DB_TARGET" == "supabase" && "$MODE" != "web" ]]; then
  load_supabase_env
  start_db() { :; }   # no container needed
fi

case "$MODE" in
  web) start_web ;;
  api) start_db; start_api ;;
  all) start_db; start_api; start_web ;;
  *)   echo "Usage: $0 [web|api|all]"; exit 1 ;;
esac

cat <<EOF

────────────────────────────────────────────────────────────
  Frontend 1.0 (seed)   http://localhost:3000
  Frontend 2.0 (API)    http://localhost:3000/2.0
  Portal                http://localhost:3000/portal
  API docs (Swagger)    http://localhost:8099/docs
  API health            http://localhost:8099/healthz
  DB tables (pgweb)     http://localhost:8081
────────────────────────────────────────────────────────────
  AUTH_DISABLED=true — every API request is treated as admin.
  Ctrl-C stops the servers; Postgres keeps running.
  Stop it with: docker compose down     (add -v to wipe data)
────────────────────────────────────────────────────────────

EOF

wait

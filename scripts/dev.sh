#!/usr/bin/env bash
#
# Monorepo dev launcher — starts every app from the repo root.
#
#   ./scripts/dev.sh              everything: db + api + web + admin
#   ./scripts/dev.sh web          Next web app only (:3000)
#   ./scripts/dev.sh admin        Next admin app only (:3001)
#   ./scripts/dev.sh api          Postgres + pgweb + FastAPI (:8099), no frontend
#
# Database target:
#   DB_TARGET=supabase  (default) cloud Postgres via apps/api/.env.supabase. No
#                       container, real auth, and NO auto-seed — seeding would write to
#                       shared cloud data, so it stays an explicit manual act.
#   DB_TARGET=docker    local container from docker-compose.yml, seeded when empty.
#                       Auth is disabled in this mode: every request is treated as admin.
#
# Supabase is the default because it is the database the apps are actually developed
# against — the local container drifted out of use. The trade is that **every run writes
# to real data**; use DB_TARGET=docker when you want a sandbox you can wipe.
#
# Replaces apps/web/scripts/dev.sh, which predates the monorepo and knows nothing about
# the admin app or the apps/* layout.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_DIR="$ROOT/apps/api"
DB_TARGET="${DB_TARGET:-supabase}"

WEB_PORT=3000
ADMIN_PORT=3001
API_PORT=8099

PIDS=()
cleanup() {
  [[ ${#PIDS[@]} -gt 0 ]] && kill "${PIDS[@]}" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

log()  { printf '\033[1m==>\033[0m %s\n' "$*"; }
fail() { printf '\033[31mError:\033[0m %s\n' "$*" >&2; exit 1; }

# A port already in use is the single most confusing failure here: the old server keeps
# answering, the new one dies quietly, and you debug code that is not running.
require_free_port() {
  local port=$1 what=$2
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    printf '\033[31mError:\033[0m port %s (%s) is already in use by:\n' "$port" "$what" >&2
    lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | sed 1d | awk '{print "  pid " $2 "  " $1}' >&2
    printf '  Stop it first, or:  kill $(lsof -ti :%s)\n' "$port" >&2
    exit 1
  fi
}

load_supabase_env() {
  [[ -f "$API_DIR/.env.supabase" ]] || fail "apps/api/.env.supabase not found."
  # Only inspect assignments — the guidance comments in the file legitimately mention
  # the placeholder names.
  if grep -v '^[[:space:]]*#' "$API_DIR/.env.supabase" \
     | grep -q "<PROJECT_REF>\|<DB_PASSWORD>\|<JWT_SECRET>"; then
    fail "apps/api/.env.supabase still has placeholders — fill them in first."
  fi
  # Exported vars outrank apps/api/.env in pydantic-settings, so this wins without edits.
  set -a; . "$API_DIR/.env.supabase"; set +a
  log "Target: Supabase (cloud). No container; seeding skipped."
}

start_db() {
  [[ "$DB_TARGET" == "supabase" ]] && return 0
  docker info >/dev/null 2>&1 || fail "Docker daemon is not running (start Docker Desktop)."
  log "Starting Postgres + pgweb"
  docker compose up -d db pgweb
  printf '==> Waiting for Postgres'
  for _ in $(seq 1 30); do
    if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
      printf ' ready\n'; return 0
    fi
    printf '.'; sleep 1
  done
  printf '\n'; fail "Postgres did not become ready."
}

start_api() {
  [[ -x "$API_DIR/.venv/bin/python" ]] || fail \
    "apps/api/.venv missing. Create it:
  python3 -m venv apps/api/.venv && apps/api/.venv/bin/pip install -r apps/api/requirements.txt"
  require_free_port "$API_PORT" "api"

  # Build the schema before anything queries it. The container starts as a bare Postgres
  # (no initdb SQL), and neither migration era can build an empty DB alone — see
  # scripts/init-local-db.sh for why. Idempotent: a no-op once already at head.
  if [[ "$DB_TARGET" == "docker" ]]; then
    log "Building schema (raw SQL + alembic)"
    "$ROOT/scripts/init-local-db.sh" || fail "schema build failed"
  fi

  # Seed only the local container, only when empty. Never auto-seed Supabase — that is a
  # write to shared cloud data and must stay an explicit, manual act.
  if [[ "$DB_TARGET" == "docker" ]]; then
    local count
    count="$(docker compose exec -T db psql -U postgres -tAc \
      "select count(*) from spaces" 2>/dev/null || echo 0)"
    if [[ "$count" == "0" ]]; then
      log "Seeding (database is empty)"
      npm run export:seed
      (cd "$API_DIR" && AUTH_DISABLED=true PYTHONPATH="$PWD" ./.venv/bin/python scripts/seed.py)
    else
      log "Seed present ($count spaces) — skipping load"
    fi
  fi

  log "Starting FastAPI on :$API_PORT"
  # `python -m uvicorn`, not `.venv/bin/uvicorn`: console scripts bake an absolute
  # interpreter path into their shebang, and this venv was created before the monorepo
  # move, so that path still says `api/.venv` and fails with "bad interpreter". Going
  # through the module makes the launcher immune to a relocated or copied venv.
  if [[ "$DB_TARGET" == "supabase" ]]; then
    # AUTH_DISABLED / DATABASE_URL come from the exported Supabase profile.
    (cd "$API_DIR" && PYTHONPATH="$PWD" \
      ./.venv/bin/python -m uvicorn app.main:app --reload --port "$API_PORT") &
  else
    (cd "$API_DIR" && AUTH_DISABLED=true PYTHONPATH="$PWD" \
      ./.venv/bin/python -m uvicorn app.main:app --reload --port "$API_PORT") &
  fi
  PIDS+=($!)
}

start_web() {
  require_free_port "$WEB_PORT" "web"
  log "Starting web on :$WEB_PORT"
  npm run dev --workspace @kr/web &
  PIDS+=($!)
}

start_admin() {
  require_free_port "$ADMIN_PORT" "admin"
  log "Starting admin on :$ADMIN_PORT"
  npm run dev --workspace @kr/admin &
  PIDS+=($!)
}

# --- dispatch -----------------------------------------------------------------------
MODES=("${@:-all}")
[[ "$DB_TARGET" == "supabase" ]] && load_supabase_env

for mode in "${MODES[@]}"; do
  case "$mode" in
    all)    start_db; start_api; start_web; start_admin ;;
    api)    start_db; start_api ;;
    web)    start_web ;;
    admin)  start_admin ;;
    *)      fail "Unknown mode '$mode'. Use: all | web | admin | api" ;;
  esac
done

[[ ${#PIDS[@]} -eq 0 ]] && fail "Nothing to run."

# Only advertise what this invocation actually started.
running() { printf '%s\n' "${MODES[@]}" | grep -qx -e all -e "$1"; }

echo
echo "────────────────────────────────────────────────────────────"
if running web; then
  echo "  Web 2.0 (API, signed in)  http://localhost:$WEB_PORT"
  echo "  Web 1.0 (seed, public)    http://localhost:$WEB_PORT/1.0"
  echo "  Sign in / sign up         http://localhost:$WEB_PORT/login"
  echo "  Portal                    http://localhost:$WEB_PORT/portal"
fi
running admin && echo "  Admin                     http://localhost:$ADMIN_PORT"
if running api; then
  echo "  API docs (Swagger)        http://localhost:$API_PORT/docs"
  echo "  API health                http://localhost:$API_PORT/healthz"
  [[ "$DB_TARGET" == "docker" ]] && echo "  DB tables (pgweb)         http://localhost:8081"
fi
echo "────────────────────────────────────────────────────────────"
if [[ "$DB_TARGET" == "docker" ]]; then
  echo "  Local container. AUTH_DISABLED=true — every API request is admin."
  echo "  Ctrl-C stops the servers; Postgres keeps running."
  echo "  Stop it with: docker compose down     (add -v to wipe data)"
else
  echo "  Supabase (cloud) — real data, real auth. Writes are not undoable."
fi
echo "────────────────────────────────────────────────────────────"
echo

wait

#!/usr/bin/env bash
#
# open-pr.sh - Helper para abrir un PR contra hnimminh/libresbc desde el fork propio.
#
# Asume:
#   - 'upstream' = hnimminh/libresbc (read-only).
#   - 'origin'   = fork propio en GitHub (push). Configurar antes con:
#         git remote add origin https://github.com/<MI-ORG>/<repo>.git
#         gh auth login
#   - El fork debe ser un fork *real* (gh repo view origin --json fork debe dar true)
#     o al menos compartir historia con upstream y ser publico.
#
# Uso:
#   ./bin/open-pr.sh <area> <short-desc> <commits-source-rev>
#
#   <area>             ej: cfgapi, libreapi, callng, webui
#   <short-desc>       ej: directory-username-hash
#   <commits-source>   commit/rev/branch desde donde cherry-pickear
#
# Variables de entorno opcionales:
#   PR_TITLE       Override del titulo del PR (default: subject del commit cherry-pickeado).
#   PR_BODY_FILE   Archivo con el body del PR (default: body del commit + footer).
#   DRY_RUN=1      No crea el PR, solo muestra el comando.
#   FORCE_RECREATE=1 Si la branch ya existe, la elimina y la recrea.
#
# Ejemplo:
#   ./bin/open-pr.sh libreapi rtp-secure-media-enum 470afba

set -euo pipefail

if [ $# -ne 3 ]; then
  sed -n '1,32p' "$0"
  exit 2
fi

AREA="$1"
DESC="$2"
SRC_REV="$3"

REPO_DIR="${REPO_DIR:-/home/cpe/libresbc}"
UPSTREAM_REPO="${UPSTREAM_REPO:-hnimminh/libresbc}"
UPSTREAM_BASE="${UPSTREAM_BASE:-master}"
DRY_RUN="${DRY_RUN:-0}"
FORCE_RECREATE="${FORCE_RECREATE:-0}"

cd "$REPO_DIR"

log()   { printf '[%s] %s\n' "$(date +%F_%T)" "$*"; }
fatal() { log "[FATAL] $*"; exit 1; }

# --- Pre-checks ---
git remote get-url upstream >/dev/null 2>&1 || fatal "Falta remote 'upstream'"
git remote get-url origin   >/dev/null 2>&1 || fatal "Falta remote 'origin' (fork propio)"
command -v gh >/dev/null 2>&1               || fatal "gh CLI no instalado"
gh auth status >/dev/null 2>&1              || fatal "gh no autenticado: gh auth login"

# Detectar el owner del fork desde la URL del remote 'origin'.
# Soporta ssh y https.
ORIGIN_URL="$(git remote get-url origin)"
case "$ORIGIN_URL" in
  *github.com:*)  FORK_NWO="${ORIGIN_URL##*github.com:}";;
  *github.com/*)  FORK_NWO="${ORIGIN_URL##*github.com/}";;
  *)              fatal "URL de origin no es de github.com: $ORIGIN_URL";;
esac
FORK_NWO="${FORK_NWO%.git}"
FORK_OWNER="${FORK_NWO%%/*}"
[ -n "$FORK_OWNER" ] || fatal "No pude inferir el owner del fork desde $ORIGIN_URL"

log "Fork detectado: $FORK_NWO (owner=$FORK_OWNER)"

# --- Fetch refrescado ---
git fetch upstream --prune
git fetch origin --prune

# --- Branch ---
BRANCH="pr/${AREA}-${DESC}"
CURRENT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || true)"
RETURN_BRANCH="${CURRENT_BRANCH:-local/customizations}"

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  if [ "$FORCE_RECREATE" = "1" ]; then
    log "Branch $BRANCH existe; FORCE_RECREATE=1, la elimino"
    [ "$CURRENT_BRANCH" = "$BRANCH" ] && git checkout "$RETURN_BRANCH"
    git branch -D "$BRANCH"
  else
    log "Branch $BRANCH ya existe localmente; skip cherry-pick"
    BRANCH_EXISTS=1
  fi
fi

if [ "${BRANCH_EXISTS:-0}" != "1" ]; then
  log "=== Creando $BRANCH desde upstream/$UPSTREAM_BASE ==="
  git checkout -b "$BRANCH" "upstream/$UPSTREAM_BASE"

  log "=== Cherry-pick de $SRC_REV ==="
  if ! git cherry-pick "$SRC_REV"; then
    log "Conflictos. Resolver, ejecutar 'git cherry-pick --continue' y luego:"
    log "  git push -u origin $BRANCH"
    log "  $0 $AREA $DESC $SRC_REV  # re-ejecutar para crear el PR"
    exit 1
  fi
fi

# Asegurar que la branch este pusheada al fork
log "=== Push al fork propio ==="
git push -u origin "$BRANCH"

# --- Generar titulo y body del PR a partir del HEAD de la branch del PR (NO del HEAD actual) ---
DEFAULT_TITLE="$(git log -1 --format='%s' "refs/heads/$BRANCH")"
TITLE="${PR_TITLE:-$DEFAULT_TITLE}"

if [ -n "${PR_BODY_FILE:-}" ] && [ -f "$PR_BODY_FILE" ]; then
  BODY="$(cat "$PR_BODY_FILE")"
else
  COMMIT_BODY="$(git log -1 --format='%b' "refs/heads/$BRANCH")"
  BODY=$(cat <<EOF
## Summary

$COMMIT_BODY

## Context

Cherry-picked from a downstream deployment of LibreSBC. Commit \`${SRC_REV}\`
on the local fork.

## Test plan

- [ ] Existing test suite passes.
- [ ] Manual verification on a non-prod deployment.
EOF
  )
fi

# --- Volver a la branch original (no dejarla en pr/...) ---
git checkout "$RETURN_BRANCH"

# --- Verificar si ya existe un PR para esta branch ---
EXISTING_PR="$(gh pr list --repo "$UPSTREAM_REPO" --state open --head "${FORK_OWNER}:${BRANCH}" --json number,url -q '.[0].url' || true)"
if [ -n "$EXISTING_PR" ]; then
  log "PR ya abierto para $BRANCH: $EXISTING_PR"
  log "Si querés cerrarlo y rehacer: gh pr close <num> --repo $UPSTREAM_REPO"
  exit 0
fi

CMD=(gh pr create
  --repo "$UPSTREAM_REPO"
  --base "$UPSTREAM_BASE"
  --head "${FORK_OWNER}:${BRANCH}"
  --title "$TITLE"
  --body "$BODY"
)

if [ "$DRY_RUN" = "1" ]; then
  log "DRY_RUN=1; comando que se ejecutaria:"
  printf '  '
  printf '%q ' "${CMD[@]}"
  printf '\n'
  log "Para ejecutarlo: DRY_RUN=0 $0 $AREA $DESC $SRC_REV"
  exit 0
fi

log "=== Creando PR en $UPSTREAM_REPO ==="
PR_URL="$("${CMD[@]}")"
log "PR creado: $PR_URL"
log "Recordá registrarlo en UPSTREAM_PRS.md"

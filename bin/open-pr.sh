#!/usr/bin/env bash
#
# open-pr.sh - Helper para abrir un PR contra hnimminh/libresbc desde el fork propio.
#
# Asume:
#   - 'upstream' = hnimminh/libresbc (read-only).
#   - 'origin'   = fork propio (push). Configurar antes con:
#         git remote add origin https://github.com/<MI-ORG>/libresbc.git
#         gh auth login
#
# Uso:
#   ./bin/open-pr.sh <area> <short-desc> <commits-source-rev>
#
#   <area>             ej: cfgapi, libreapi, callng, webui
#   <short-desc>       ej: directory-username-hash
#   <commits-source>   commit/rev/branch desde donde cherry-pickear
#
# Ejemplo:
#   ./bin/open-pr.sh libreapi rtp-secure-media-enum 470afba

set -euo pipefail

if [ $# -ne 3 ]; then
  sed -n '1,25p' "$0"
  exit 2
fi

AREA="$1"
DESC="$2"
SRC_REV="$3"

REPO_DIR="${REPO_DIR:-/home/cpe/libresbc}"
cd "$REPO_DIR"

log()   { printf '[%s] %s\n' "$(date +%F_%T)" "$*"; }
fatal() { log "[FATAL] $*"; exit 1; }

# Pre-checks
git remote get-url upstream >/dev/null 2>&1 || fatal "Falta remote 'upstream'"
git remote get-url origin   >/dev/null 2>&1 || fatal "Falta remote 'origin' (fork propio). Ver PENDIENTE_FORK_GITHUB.md"
command -v gh >/dev/null 2>&1               || fatal "gh CLI no instalado: sudo apt install gh"
gh auth status >/dev/null 2>&1              || fatal "gh no autenticado: gh auth login"

git fetch upstream --prune

BRANCH="pr/${AREA}-${DESC}"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  fatal "Branch $BRANCH ya existe. Borrarla a mano si querés rehacer: git branch -D $BRANCH"
fi

log "=== Creando $BRANCH desde upstream/master ==="
git checkout -b "$BRANCH" upstream/master

log "=== Cherry-pick de $SRC_REV ==="
if ! git cherry-pick "$SRC_REV"; then
  log "Conflictos. Resolver, hacer 'git cherry-pick --continue' y luego pushear:"
  log "  git push origin $BRANCH"
  log "  gh pr create --repo hnimminh/libresbc --base master --head <ORG>:$BRANCH ..."
  exit 1
fi

log "=== Push al fork propio ==="
git push -u origin "$BRANCH"

log "=== Crear PR (interactivo - completar titulo y body) ==="
log "Comando sugerido:"
log "  gh pr create --repo hnimminh/libresbc --base master --head $(gh repo view origin --json nameWithOwner -q .nameWithOwner):$BRANCH"
log ""
log "Cuando se cree, registrar el numero en UPSTREAM_PRS.md."

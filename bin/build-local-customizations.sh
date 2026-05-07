#!/usr/bin/env bash
#
# build-local-customizations.sh
#
# Materializa la Tarea 6 del plan: archivar la rama vieja y construir
# `local/customizations` desde upstream/master, dejando los commits LOCAL-ONLY
# como starting set. NO aplica los `UPSTREAM-PR` (esos van en Tarea 7 con PRs).
#
# Idempotente: si ya existe `local/customizations`, solo verifica.
#
# Uso:
#   cd /home/cpe/libresbc
#   sudo ./bin/build-local-customizations.sh

set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/cpe/libresbc}"
cd "$REPO_DIR"

log()   { printf '[%s] %s\n' "$(date +%F_%T)" "$*"; }
fatal() { log "[FATAL] $*"; exit 1; }

# Pre-checks
[ -d "$REPO_DIR/.git" ]                            || fatal "$REPO_DIR no es repo git"
git remote get-url upstream >/dev/null 2>&1        || fatal "No existe remote 'upstream'"
[ -z "$(git status --porcelain)" ]                 || fatal "Working tree sucio"

git fetch upstream --prune --tags

CUR_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || true)

# Archivar la branch vieja
ARCHIVE_BRANCH="archive/feature-improved-error-handling-$(date +%Y%m)"
if git show-ref --verify --quiet "refs/heads/feature/improved-error-handling"; then
  if ! git show-ref --verify --quiet "refs/heads/$ARCHIVE_BRANCH"; then
    log "Archivando feature/improved-error-handling como $ARCHIVE_BRANCH"
    git branch "$ARCHIVE_BRANCH" feature/improved-error-handling
  else
    log "Branch $ARCHIVE_BRANCH ya existe; saltando archivado"
  fi
fi

# Asegurar master local sincronizado con upstream/master
log "Sincronizando master local con upstream/master"
git checkout master
git reset --hard upstream/master   # master local DEBE ser idéntica a upstream

# Crear local/customizations desde upstream/master
if git show-ref --verify --quiet "refs/heads/local/customizations"; then
  log "Branch local/customizations ya existe; no se recrea automáticamente."
  log "Si querés resetearla, eliminala a mano: git branch -D local/customizations"
else
  log "Creando local/customizations desde upstream/master"
  git checkout -b local/customizations upstream/master

  # Agregar el documento de auditoria como primer commit (vive en el repo)
  if [ -f "$REPO_DIR/AUDITORIA_COMMITS.md" ] || [ -f "$REPO_DIR/UPSTREAM_PRS.md" ] || [ -f "$REPO_DIR/RUNBOOK_UPGRADE.md" ]; then
    git add -f \
      "$REPO_DIR/AUDITORIA_COMMITS.md" \
      "$REPO_DIR/UPSTREAM_PRS.md" \
      "$REPO_DIR/RUNBOOK_UPGRADE.md" \
      "$REPO_DIR/bin/upgrade.sh" \
      "$REPO_DIR/bin/deploy.sh" \
      "$REPO_DIR/bin/build-local-customizations.sh" 2>/dev/null || true
    if ! git diff --staged --quiet; then
      git -c user.email="sync@libresbc.local" -c user.name="LibreSBC Sync" \
        commit -m "[LOCAL-ONLY] add upgrade tooling, runbook and audit docs

- AUDITORIA_COMMITS.md: clasificacion de commits propios
- UPSTREAM_PRS.md: tracking de PRs a hnimminh/libresbc
- RUNBOOK_UPGRADE.md: procedimiento operativo
- bin/{upgrade,deploy,build-local-customizations}.sh: tooling
"
    fi
  fi
fi

log "OK. Estado actual:"
git branch -vv
log ""
log "Siguiente paso: commits LOCAL-ONLY o REWORK-THEN-PR (segun AUDITORIA_COMMITS.md)"
log "se aplican manualmente con cherry-pick o re-implementacion limpia."
log "Los UPSTREAM-PR van como branches pr/* aparte (ver bin/open-pr.sh - pendiente)."

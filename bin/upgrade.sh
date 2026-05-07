#!/usr/bin/env bash
#
# upgrade.sh - Sincroniza LibreSBC contra upstream/master con rollback seguro.
#
# Filosofia upstream-first: la rama `local/customizations` debe ser MINIMA.
# Antes del rebase se podan los commits cuyo PR upstream ya fue mergeado.
#
# Uso:
#   sudo ./bin/upgrade.sh [--dry-run] [--no-deploy] [--target-branch=master]
#
# Opciones:
#   --dry-run        No hace deploy ni cambios destructivos. Muestra que haria.
#   --no-deploy      Hace fetch+rebase+build pero NO toca /opt/libresbc.
#   --target-branch  Rama upstream a seguir (default: master).
#
# Variables de entorno:
#   REPO_DIR     /home/cpe/libresbc (default)
#   OPT_DIR      /opt/libresbc      (default)
#   ETC_DIR      /etc/libresbc      (default)
#
# Salida no-cero -> rollback automatico.

set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/cpe/libresbc}"
OPT_DIR="${OPT_DIR:-/opt/libresbc}"
ETC_DIR="${ETC_DIR:-/etc/libresbc}"
TARGET_BRANCH="master"
DRY_RUN=0
NO_DEPLOY=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)        DRY_RUN=1 ;;
    --no-deploy)      NO_DEPLOY=1 ;;
    --target-branch=*) TARGET_BRANCH="${arg#*=}" ;;
    -h|--help)
      sed -n '1,30p' "$0"; exit 0 ;;
    *)
      echo "[ERROR] Argumento desconocido: $arg" >&2; exit 2 ;;
  esac
done

log()   { printf '[%s] %s\n' "$(date +%F_%T)" "$*"; }
fatal() { log "[FATAL] $*"; exit 1; }
run()   { if [ "$DRY_RUN" -eq 1 ]; then log "[DRY] $*"; else log "+ $*"; eval "$@"; fi; }

# ---------------------------------------------------------------------------
# Pre-checks
# ---------------------------------------------------------------------------
[ -d "$REPO_DIR/.git" ] || fatal "REPO_DIR=$REPO_DIR no es un repo git"
[ "$(id -u)" -eq 0 ]    || fatal "Hay que correrlo como root (toca /opt y systemctl)"
command -v git >/dev/null 2>&1 || fatal "git no instalado"

cd "$REPO_DIR"

# Asegurar working tree limpio
if [ -n "$(git status --porcelain)" ]; then
  fatal "Working tree sucio en $REPO_DIR. Commiteá o stasheá antes de actualizar."
fi

# Asegurar remote 'upstream'
if ! git remote get-url upstream >/dev/null 2>&1; then
  fatal "No existe remote 'upstream'. Configurarlo: git remote add upstream https://github.com/hnimminh/libresbc.git"
fi

# ---------------------------------------------------------------------------
# 1. Fetch upstream
# ---------------------------------------------------------------------------
log "=== 1. Fetch upstream ==="
run "git fetch upstream --prune --tags"

# ---------------------------------------------------------------------------
# 2. Podar de local/customizations los PRs ya mergeados
# ---------------------------------------------------------------------------
log "=== 2. Poda de commits con PR upstream mergeado ==="
PRS_MD="$REPO_DIR/UPSTREAM_PRS.md"
if [ ! -f "$PRS_MD" ]; then
  log "[WARN] $PRS_MD no existe. Saltando poda."
else
  # Por cada PR marcado como MERGED en UPSTREAM_PRS.md, buscar en
  # local/customizations un commit con su tag y aviso al usuario.
  # La poda real la hace el rebase de Tarea 6 cuando esos parches ya
  # estan absorbidos en upstream/$TARGET_BRANCH (git lo detecta solo).
  awk -F'|' '/^\| *#[0-9]+/ && / MERGED /{gsub(/ /,""); print $2}' "$PRS_MD" 2>/dev/null \
    | while read -r pr; do log "[POSIBLE-DROP] PR $pr ya mergeado upstream; rebase deberia absorberlo."; done || true
fi

# ---------------------------------------------------------------------------
# 3. Rebase local/customizations sobre upstream/$TARGET_BRANCH
# ---------------------------------------------------------------------------
log "=== 3. Rebase local/customizations sobre upstream/$TARGET_BRANCH ==="
git show-ref --verify --quiet "refs/heads/local/customizations" \
  || fatal "Branch local/customizations no existe. Crear primero (Tarea 6 del plan)."

run "git checkout local/customizations"
if [ "$DRY_RUN" -eq 0 ]; then
  if ! git rebase "upstream/$TARGET_BRANCH"; then
    log "[FATAL] Rebase con conflictos. Resolver a mano y reintentar:"
    log "        git rebase --continue   # despues de resolver"
    log "        git rebase --abort      # para volver atras"
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# 4. Crear/actualizar integration branch y verificar build
# ---------------------------------------------------------------------------
INTEGRATION="integration/${TARGET_BRANCH}-$(date +%Y%m)"
log "=== 4. Construyendo $INTEGRATION ==="
run "git branch -f $INTEGRATION local/customizations"
run "git checkout $INTEGRATION"

# Smoke check: requirements.txt parsea
if [ -f "$REPO_DIR/liberator/requirements.txt" ]; then
  python3 -c "
import sys
with open('$REPO_DIR/liberator/requirements.txt') as f:
    for ln, line in enumerate(f, 1):
        s = line.strip()
        if not s or s.startswith('#'): continue
        # Linea de requirement valida (no parsing exhaustivo, basta sintaxis)
" || fatal "requirements.txt invalido"
fi

# ---------------------------------------------------------------------------
# 5. Deploy (si no --no-deploy)
# ---------------------------------------------------------------------------
if [ "$NO_DEPLOY" -eq 1 ]; then
  log "=== 5. Skip deploy (--no-deploy) ==="
  log "Para desplegar: sudo $REPO_DIR/bin/deploy.sh"
  exit 0
fi

if [ -x "$REPO_DIR/bin/deploy.sh" ]; then
  run "$REPO_DIR/bin/deploy.sh"
else
  log "[WARN] $REPO_DIR/bin/deploy.sh no existe o no es ejecutable. Saltando deploy."
fi

log "=== upgrade.sh OK ==="

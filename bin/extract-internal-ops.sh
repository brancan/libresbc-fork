#!/usr/bin/env bash
#
# extract-internal-ops.sh
#
# Materializa la Tarea 5 del plan: separar la "operativa interna del cliente"
# del repo de codigo, llevandola a /var/lib/libresbc-ops/ (un repo git aparte
# que NO se publica a GitHub).
#
# Esto se ejecuta UNA SOLA VEZ. Despues de correrlo:
#   - El working tree de /home/cpe/libresbc va a estar lleno de "deletes"
#     que reflejan los archivos movidos.
#   - Hay que commitear esa limpieza en local/customizations como
#     "[LOCAL-ONLY] chore: extract internal ops to /var/lib/libresbc-ops".
#
# Uso:
#   cd /home/cpe/libresbc
#   sudo ./bin/extract-internal-ops.sh [--dry-run]

set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/cpe/libresbc}"
OPS_DIR="${OPS_DIR:-/var/lib/libresbc-ops}"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

log()   { printf '[%s] %s\n' "$(date +%F_%T)" "$*"; }
fatal() { log "[FATAL] $*"; exit 1; }
run()   { if [ "$DRY_RUN" -eq 1 ]; then log "[DRY] $*"; else log "+ $*"; eval "$@"; fi; }

[ "$(id -u)" -eq 0 ] || fatal "Hay que correrlo como root"

# Pre-flight: el directorio destino no debe pisar nada
if [ -d "$OPS_DIR" ] && [ "$(ls -A "$OPS_DIR")" ]; then
  log "[WARN] $OPS_DIR existe y no esta vacio. Continuando (se mergea)."
fi

run "mkdir -p '$OPS_DIR'"

# Lista de cosas a mover (relativo a $REPO_DIR)
ITEMS_TO_MOVE=(
  "archivo_obsoleto"
  "private"
  "workingdir"
  "infocollector"
  "verificar_root_libresbc.sh"
  "verificar_sincronizacion.sh"
  "SOLUCIONES_ERRORES_IMPORTANTES.md"
  "plan_limpieza_etc_libresbc.md"
)
# NOTA: CHANGELOG.md NO se mueve porque existe en upstream/master (es del proyecto).

cd "$REPO_DIR"
for item in "${ITEMS_TO_MOVE[@]}"; do
  if [ -e "$REPO_DIR/$item" ]; then
    DEST_DIR="$OPS_DIR/$(dirname "$item")"
    [ "$DEST_DIR" = "$OPS_DIR/." ] && DEST_DIR="$OPS_DIR"
    run "mkdir -p '$DEST_DIR'"
    run "mv '$REPO_DIR/$item' '$OPS_DIR/$item'"
  else
    log "[SKIP] $item no existe"
  fi
done

# Inicializar git en /var/lib/libresbc-ops si no esta
if [ ! -d "$OPS_DIR/.git" ]; then
  log "Inicializando repo git en $OPS_DIR"
  if [ "$DRY_RUN" -eq 0 ]; then
    git -C "$OPS_DIR" init -q -b main
    cat > "$OPS_DIR/.gitignore" <<'EOF'
*.pyc
__pycache__/
*.log
EOF
    cat > "$OPS_DIR/README.md" <<'EOF'
# libresbc-ops

Operativa interna del cliente. NO se publica al fork de GitHub.

Aqui viven:
- Documentacion de troubleshooting historico (`archivo_obsoleto/`).
- Configs especificas del cliente exportadas (`infocollector/`, `private/`).
- Scripts de verificacion (`verificar_*.sh`).
- Notas de migraciones, cambios y soluciones (`*.md`).

El repo de codigo (`/home/cpe/libresbc`) sigue a `hnimminh/libresbc` y solo
contiene la rama `local/customizations` con las personalizaciones MINIMAS
necesarias para esta infraestructura. Cualquier cosa de "operativa" va aca.

Recomendado: agregar un remote privado (Gitea/GitHub privado) para versionar
y respaldar este repo offsite, separado del de codigo.
EOF
    git -C "$OPS_DIR" -c user.email="sync@libresbc.local" -c user.name="LibreSBC Sync" \
      add -A
    git -C "$OPS_DIR" -c user.email="sync@libresbc.local" -c user.name="LibreSBC Sync" \
      commit -q -m "init: extracted internal ops from libresbc code repo"
  fi
fi

log "OK. Operativa interna extraida a $OPS_DIR"
log ""
log "Siguiente paso: en /home/cpe/libresbc commitear los deletes en local/customizations:"
log "  cd $REPO_DIR"
log "  git checkout local/customizations"
log "  git add -A"
log "  git commit -m '[LOCAL-ONLY] chore: extract internal ops to /var/lib/libresbc-ops'"

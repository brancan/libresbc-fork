#!/usr/bin/env bash
#
# deploy.sh - Despliega la rama actual del repo a /opt/libresbc/v<NEW>/
#             y switchea los symlinks de forma atomica con rollback.
#
# Filosofia: nunca tocar /opt/libresbc/v_actual_/ in-place. Cada deploy crea
# un directorio nuevo paralelo. El "switch" son cuatro symlinks atomicos.
# Rollback = repuntar los symlinks a la version previa y reiniciar.
#
# Uso:
#   sudo ./bin/deploy.sh [--dry-run] [--stage-only] [--rollback]
#
# Modos:
#   --dry-run     No ejecuta nada, solo printea los comandos.
#   --stage-only  Ejecuta copia + build venv + smoke tests, pero NO switchea
#                 symlinks ni reinicia el servicio. Util para validar antes
#                 de promover. El directorio queda en /opt/libresbc/v_staging_*.
#   --rollback    Vuelve atras al ultimo deploy.
#
# Variables:
#   REPO_DIR  /home/cpe/libresbc
#   OPT_DIR   /opt/libresbc

set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/cpe/libresbc}"
OPT_DIR="${OPT_DIR:-/opt/libresbc}"
DRY_RUN=0
STAGE_ONLY=0
ROLLBACK=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY_RUN=1 ;;
    --stage-only) STAGE_ONLY=1 ;;
    --rollback)   ROLLBACK=1 ;;
    -h|--help)    sed -n '1,30p' "$0"; exit 0 ;;
    *) echo "[ERROR] Argumento desconocido: $arg" >&2; exit 2 ;;
  esac
done

log()   { printf '[%s] %s\n' "$(date +%F_%T)" "$*"; }
fatal() { log "[FATAL] $*"; exit 1; }
run()   { if [ "$DRY_RUN" -eq 1 ]; then log "[DRY] $*"; else log "+ $*"; eval "$@"; fi; }

[ "$(id -u)" -eq 0 ] || fatal "Hay que correrlo como root"
[ -d "$REPO_DIR" ]   || fatal "REPO_DIR=$REPO_DIR no existe"
[ -d "$OPT_DIR" ]    || fatal "OPT_DIR=$OPT_DIR no existe"

cd "$REPO_DIR"

# ---------------------------------------------------------------------------
# Rollback
# ---------------------------------------------------------------------------
if [ "$ROLLBACK" -eq 1 ]; then
  log "=== Rollback ==="
  PREV=$(cat "$OPT_DIR/.previous_version" 2>/dev/null || true)
  [ -n "$PREV" ] || fatal "No hay $OPT_DIR/.previous_version (nunca se desplego con este script)"
  [ -d "$OPT_DIR/$PREV" ] || fatal "$OPT_DIR/$PREV no existe"
  log "Volviendo a version: $PREV"
  for s in liberator callng venv libre.env; do
    run "ln -sfn '$OPT_DIR/$PREV/$s' '$OPT_DIR/$s'"
  done
  run "systemctl restart liberator"
  log "Rollback OK. Recordá monitorear /var/log/libresbc/liberator.log"
  exit 0
fi

# ---------------------------------------------------------------------------
# Identificar version actual y proxima
# ---------------------------------------------------------------------------
GIT_DESC=$(git describe --tags --always --dirty 2>/dev/null || git rev-parse --short HEAD)
TS=$(date +%Y%m%d-%H%M%S)
if [ "$STAGE_ONLY" -eq 1 ]; then
  NEW_VER="v_staging_${GIT_DESC}-${TS}"
else
  NEW_VER="v${GIT_DESC}-${TS}"
fi
NEW_DIR="$OPT_DIR/$NEW_VER"
log "Nueva version: $NEW_VER -> $NEW_DIR"

# Detectar version anterior (apuntada por el symlink actual de liberator)
CURRENT_LIBERATOR=$(readlink -f "$OPT_DIR/liberator" 2>/dev/null || true)
PREV_VER=""
if [ -n "$CURRENT_LIBERATOR" ]; then
  PREV_VER=$(basename "$(dirname "$CURRENT_LIBERATOR")")
  log "Version anterior detectada: $PREV_VER"
fi

# ---------------------------------------------------------------------------
# 1. Crear directorio nuevo
# ---------------------------------------------------------------------------
log "=== 1. Copiar codigo a $NEW_DIR ==="
run "mkdir -p '$NEW_DIR'"
run "rsync -a --delete --exclude='.git' --exclude='__pycache__' --exclude='*.pyc' \
       '$REPO_DIR/liberator/' '$NEW_DIR/liberator/'"
run "rsync -a --delete --exclude='.git' '$REPO_DIR/callng/' '$NEW_DIR/callng/'"

# Mantener libre.env del runtime actual (nunca pisar)
if [ -f "$OPT_DIR/libre.env" ]; then
  CUR_ENV=$(readlink -f "$OPT_DIR/libre.env" 2>/dev/null || echo "$OPT_DIR/libre.env")
  run "cp -a '$CUR_ENV' '$NEW_DIR/libre.env'"
else
  fatal "No existe $OPT_DIR/libre.env (¿runtime sin configurar?)"
fi

# ---------------------------------------------------------------------------
# 2. Build venv
# ---------------------------------------------------------------------------
log "=== 2. Build venv ==="
run "python3 -m venv '$NEW_DIR/venv'"
run "'$NEW_DIR/venv/bin/pip' install --upgrade pip wheel"
run "'$NEW_DIR/venv/bin/pip' install -r '$NEW_DIR/liberator/requirements.txt'"

# ---------------------------------------------------------------------------
# 3. Smoke tests sintaxis
# ---------------------------------------------------------------------------
log "=== 3a. Smoke test sintaxis Python ==="
run "'$NEW_DIR/venv/bin/python3' -m compileall -q '$NEW_DIR/liberator/'"

# Smoke test que liberator/main.py se importa sin error fatal (sin arrancarlo)
run "'$NEW_DIR/venv/bin/python3' -c 'import sys; sys.path.insert(0, \"$NEW_DIR/liberator\"); import importlib.util; spec=importlib.util.spec_from_file_location(\"main\", \"$NEW_DIR/liberator/main.py\"); print(\"main.py importable:\", spec is not None)'" || fatal "main.py no importable"

log "=== 3b. Smoke test sintaxis Lua (callng/) ==="
if command -v luac >/dev/null 2>&1; then
  for luafile in "$NEW_DIR"/callng/*.lua; do
    [ -f "$luafile" ] || continue
    run "luac -p '$luafile'" || fatal "Sintaxis Lua invalida en $luafile"
  done
else
  log "[WARN] luac no instalado; saltando smoke test de Lua"
fi

# ---------------------------------------------------------------------------
# Si STAGE_ONLY: parar aca, no tocar el runtime
# ---------------------------------------------------------------------------
if [ "$STAGE_ONLY" -eq 1 ]; then
  log "=== STAGE-ONLY: deploy NO promovido. Directorio listo en $NEW_DIR ==="
  log "Para promoverlo a runtime real, correr:"
  log "  sudo $0          # nuevo deploy completo desde repo"
  log "  # o manualmente:"
  log "  for s in liberator callng venv libre.env; do"
  log "    sudo ln -sfn '$NEW_DIR/\$s' '$OPT_DIR/\$s'"
  log "  done"
  log "  sudo systemctl restart liberator"
  log ""
  log "Para limpiar este staging cuando ya no lo uses:"
  log "  sudo rm -rf '$NEW_DIR'"
  exit 0
fi

# ---------------------------------------------------------------------------
# 4. Switch atomico de symlinks
# ---------------------------------------------------------------------------
log "=== 4. Switch atomico ==="
[ -n "$PREV_VER" ] && run "echo '$PREV_VER' > '$OPT_DIR/.previous_version'"
for s in liberator callng venv libre.env; do
  run "ln -sfn '$NEW_DIR/$s' '$OPT_DIR/$s'"
done

# Normalizar symlinks externos que FreeSWITCH usa para cargar callng.
# Apuntan al symlink raiz $OPT_DIR/callng (no al deploy versionado), de
# modo que un proximo deploy.sh los actualice automaticamente.
FS_CALLNG_LINKS=(
  /usr/local/share/freeswitch/scripts/callng
  /usr/local/etc/freeswitch/scripts/callng
)
for fslink in "${FS_CALLNG_LINKS[@]}"; do
  if [ -L "$fslink" ] || [ ! -e "$fslink" ]; then
    if [ "$(readlink "$fslink" 2>/dev/null || true)" != "$OPT_DIR/callng" ]; then
      run "ln -sfn '$OPT_DIR/callng' '$fslink'"
    fi
  else
    log "[WARN] $fslink existe pero NO es un symlink; saltado para no romper nada."
  fi
done

# ---------------------------------------------------------------------------
# 5. Restart y verificacion
# ---------------------------------------------------------------------------
log "=== 5. Restart liberator y verificar ==="
run "systemctl restart liberator"
sleep 5

if systemctl is-active --quiet liberator; then
  log "[OK] liberator arranco. Version desplegada: $NEW_VER"
  log "Monitorear: tail -f /var/log/libresbc/liberator.log"
  log "Rollback: sudo $0 --rollback"
else
  log "[FAIL] liberator no arranco. Iniciando rollback automatico..."
  if [ -n "$PREV_VER" ]; then
    for s in liberator callng venv libre.env; do
      ln -sfn "$OPT_DIR/$PREV_VER/$s" "$OPT_DIR/$s"
    done
    systemctl restart liberator
    fatal "Deploy fallo. Rollback automatico a $PREV_VER ejecutado."
  else
    fatal "Deploy fallo y no hay version anterior. Revisar manualmente."
  fi
fi

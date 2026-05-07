# Runbook — Mantener LibreSBC alineado con upstream

> **Filosofia upstream-first**: lo que aporte a la comunidad va por **PR a `hnimminh/libresbc`**. Solo lo **exclusivo** de la infra/cliente vive en `local/customizations`.
> La rama local debe **DECRECER** con el tiempo.

## Topologia

```
hnimminh/libresbc (oficial, GitHub)
    ^                    \
    |                     \-- git fetch upstream
    |                                 \
    |                                  v
    |                       /home/cpe/libresbc (repo dev)
    |                       ├── master                          (mirror upstream)
    |                       ├── local/customizations            (rama VIVA, minima)
    |                       ├── integration/master-AAAAMM       (candidata a deploy)
    |                       └── pr/*-*                          (efimeras, una por PR)
    |                                                |
    |    fork-propio/libresbc <----- git push origin pr/*
    |          ^
    |          |
    +-- gh pr create --repo hnimminh/libresbc --head ORG:pr/*
```

## Directorios

| Path                          | Rol                                                       |
|-------------------------------|-----------------------------------------------------------|
| `/home/cpe/libresbc/`         | Repo de codigo. Unica fuente de verdad. Sigue a `hnimminh`. |
| `/opt/libresbc/v<VER>/`       | Snapshots desplegados. Cada deploy crea uno nuevo.        |
| `/opt/libresbc/{liberator,callng,venv,libre.env}` | Symlinks al `v<VER>` activo.          |
| `/etc/libresbc/`              | Configuraciones runtime versionadas (git aparte).         |
| `/var/lib/libresbc-ops/`      | Operativa interna del cliente (docs, scripts, configs exportadas). |
| `/var/log/libresbc/`          | Logs (`liberator.log`, `callng.log`, `cdr/`).             |
| `/var/backups/libresbc-pre-sync-*/` | Backups y artefactos de sincronizaciones previas.    |

## Flujo de upgrade (cadencia: mensual o por release upstream)

### 0. Pre-flight

```bash
# 0a. Verificar que no hay trabajo sin commitear
cd /home/cpe/libresbc
git status

# 0b. Snapshot de seguridad
TS=$(date +%Y%m%d-%H%M%S)
sudo mkdir -p /var/backups/libresbc-pre-sync-$TS
sudo tar -C / -czf /var/backups/libresbc-pre-sync-$TS/opt-libresbc.tar.gz opt/libresbc
sudo tar -C / -czf /var/backups/libresbc-pre-sync-$TS/etc-libresbc.tar.gz etc/libresbc
sudo redis-cli SAVE && sudo cp /var/lib/redis/dump.rdb /var/backups/libresbc-pre-sync-$TS/
```

### 1. Revisar estado de PRs upstream (poda preventiva)

```bash
# Para cada PR abierto, ver si fue mergeado:
gh pr list --repo hnimminh/libresbc --state merged --search "is:merged author:@me" --limit 20

# Editar UPSTREAM_PRS.md marcando los MERGED. El proximo rebase los podara.
$EDITOR UPSTREAM_PRS.md
```

### 2. Ejecutar el upgrade (dry-run primero)

```bash
sudo /home/cpe/libresbc/bin/upgrade.sh --dry-run
sudo /home/cpe/libresbc/bin/upgrade.sh           # de verdad
```

`upgrade.sh` hace:
1. `git fetch upstream --tags`.
2. Lee `UPSTREAM_PRS.md` y avisa de los PRs mergeados (la "absorcion" la hace git solo en el rebase).
3. `git rebase upstream/master local/customizations` (con resolucion de conflictos manual si los hay).
4. Construye `integration/master-YYYYMM` desde `local/customizations`.
5. Llama a `bin/deploy.sh` (a menos que pases `--no-deploy`).

### 3. Si el rebase tiene conflictos

```bash
# Resolver archivo por archivo
$EDITOR <archivo-en-conflicto>
git add <archivo>
git rebase --continue

# Si esta perdido / mejor abortar
git rebase --abort
```

Causa comun de conflicto: un commit `[UPSTREAM-PR:#NNN]` ya fue absorbido upstream y el rebase lo detecta como duplicado. Si `git status` muestra "no changes" tras el `--continue`, hacer:

```bash
git rebase --skip   # Ese parche ya estaba absorbido upstream
```

Y marcar el PR como MERGED en `UPSTREAM_PRS.md`.

### 4. Deploy y verificacion

`bin/deploy.sh` hace:
1. Crea `/opt/libresbc/v<NEW>/` paralelo (no toca el activo).
2. Hace `rsync` del codigo y `python -m venv` con el `requirements.txt` nuevo.
3. Smoke test de imports python.
4. `ln -sfn` atomico de los 4 symlinks.
5. `systemctl restart liberator`.
6. Si `liberator` no arranca a los 5s, **rollback automatico** al `v<PREV>`.

Verificar despues:

```bash
systemctl status liberator
journalctl -u liberator -f
tail -f /var/log/libresbc/liberator.log
```

Hacer una llamada de prueba (ej: desde Issabel a un destino conocido) y ver que pasa por LibreSBC sin errores.

### 5. Rollback manual

Si algo se rompe despues del deploy y `liberator` SI estaba activo (no rollback automatico):

```bash
sudo /home/cpe/libresbc/bin/deploy.sh --rollback
```

Vuelve a la version previa cuya identificacion esta en `/opt/libresbc/.previous_version`.

### 6. Push del fork propio (si aplica)

Cuando hay nuevos commits `[LOCAL-ONLY]` o se actualiza `local/customizations`:

```bash
cd /home/cpe/libresbc
git push origin local/customizations
git push origin integration/master-$(date +%Y%m)
```

Esto respalda offsite la rama de personalizaciones, separada de los PRs.

## Tareas de "primera vez" (one-time)

Antes de poder usar este runbook, hay que ejecutar las siguientes tareas en orden:

### One-time 1: configurar fork propio en GitHub

Ver `/var/backups/libresbc-pre-sync-*/PENDIENTE_FORK_GITHUB.md`.

```bash
# Despues de crear el fork en GitHub:
cd /home/cpe/libresbc
git remote add origin https://github.com/<MI-ORG>/libresbc.git
sudo apt install gh
gh auth login
git ls-remote origin   # smoke test
```

### One-time 2: extraer operativa interna

```bash
sudo /home/cpe/libresbc/bin/extract-internal-ops.sh --dry-run
sudo /home/cpe/libresbc/bin/extract-internal-ops.sh
```

Mueve `archivo_obsoleto/`, `private/`, `workingdir/`, `infocollector/`, scripts y docs internas a `/var/lib/libresbc-ops/`.

### One-time 3: construir `local/customizations`

```bash
sudo /home/cpe/libresbc/bin/build-local-customizations.sh
```

Archiva `feature/improved-error-handling`, sincroniza `master` con `upstream/master`, crea `local/customizations` y commitea las herramientas.

### One-time 4: portar customizaciones LOCAL-ONLY

Segun `AUDITORIA_COMMITS.md`, cherry-pick / re-implementar en `local/customizations` los commits `LOCAL-ONLY` y los porciones LOCAL-ONLY de los `REWORK-THEN-PR`. Los `UPSTREAM-PR` van por separado con `bin/open-pr.sh`.

### One-time 5: webui como servicio systemd

El webui actual corre `./webui/libresbc-webui` desde `tty1` a mano. Crear unidad:

```bash
sudo tee /etc/systemd/system/libresbc-webui.service > /dev/null <<'EOF'
[Unit]
Description=LibreSBC WebUI
After=network.target liberator.service
Wants=liberator.service

[Service]
Type=simple
WorkingDirectory=/home/cpe/libresbc/webui
ExecStart=/home/cpe/libresbc/webui/libresbc-webui -L https://127.0.0.1:8443 -H 0.0.0.0 -P 8088
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
# matar el proceso lanzado a mano en tty1 antes:
sudo pkill -f libresbc-webui || true
sudo systemctl enable --now libresbc-webui
```

## Troubleshooting

| Sintoma                                            | Posible causa                                            | Accion |
|----------------------------------------------------|----------------------------------------------------------|--------|
| `liberator` no arranca tras deploy                 | Cambio breaking en `libre.env` upstream                  | `bin/deploy.sh --rollback`. Diff `libre.env` activo vs `build/ansible/roles/libre/templates/libre.j2.env`. |
| Llamadas no rutean tras deploy                     | Schema de Redis cambio (ver upstream `440544e`)          | Revisar `liberator.log` y restaurar `redis-dump.rdb` del backup pre-sync. |
| Rebase con conflictos en `liberator/libreapi.py`   | Cambios upstream sobre la misma area que un `LOCAL-ONLY` | Resolver a mano. Si el LOCAL-ONLY ya no aplica, considerar abrir PR upstream para que se absorba. |
| `gh pr create` falla con `not authenticated`       | `gh auth` no esta hecho                                  | `gh auth login` con la cuenta del fork propio. |

## Definicion de exito

- `local/customizations` decrece con el tiempo (mediable: `git rev-list --count upstream/master..local/customizations`).
- Cero commits con tag `[UPSTREAM-PR:pendiente]` que tengan mas de 30 dias sin abrirse.
- Rollback testeado al menos una vez por trimestre.

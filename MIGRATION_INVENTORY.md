# Inventario de migración: archive → local/customizations

Diff de `archive/feature-improved-error-handling-202605` vs `upstream/master`,
clasificado archivo por archivo para decidir qué se reaplica en
`local/customizations` y qué se descarta.

**Universo de cambios (excluyendo docs internas, configs cliente, backups):**
86 archivos cambiados, +4265 / -351 líneas, de los cuales:

- ~30% son Kamailio (DROP por decisión de aceptar la dirección de upstream).
- ~25% son refactors de `libreapi.py` con valor genérico (candidatos UPSTREAM-PR).
- ~25% son fixes/features locales legítimos (LOCAL-ONLY o REWORK→PR).
- ~20% es ruido (typos, paths hardcoded, downgrades, copyright, binarios).

## Convenciones

- **DROP**: no se reaplica. Se queda en el archive como referencia histórica.
- **UPSTREAM-PR (puro)**: cambio limpio, abrir PR sin reaplicar localmente.
  Si el PR mergea, se incorpora vía rebase contra upstream.
- **UPSTREAM-PR (mientras tanto LOCAL-ONLY)**: cambio limpio pero el PR
  puede tardar; se reaplica como `[UPSTREAM-PR:#NNN]` en local mientras tanto.
  Cuando mergee upstream, se elimina del overlay.
- **LOCAL-ONLY**: específico del cliente o decisión nuestra; vive permanentemente
  en `local/customizations`.

## Tabla maestra

| Archivo | Δ lineas | Categoria | Decisión | Notas |
|---|---|---|---|---|
| **build/docker/** (4 files) | +251 | Generic | **UPSTREAM-PR** | docker-compose templates + libre.env genérico (sin IPs cliente). |
| `build/preconfig/freeswitch/freeswitch.xml` | +215 | Verify | **A INSPECCIONAR** | Config FreeSWITCH base. Verificar si tiene NODEID/IPs del cliente. |
| `build/preconfig/freeswitch/modules.conf` | +20 | Verify | **A INSPECCIONAR** | Lista de módulos. Probablemente genérico. |
| `callng/callfunc.lua` | +94 | Mixed | **REWORK→PR** | Lógica inbound routing (parte de 9ae0250). Inspeccionar si parametrizable. |
| `callng/configuration.lua` | +1 | Trivial | **A INSPECCIONAR** | Cambio de 1 línea. |
| `callng/event.initiation.lua` | +17 | Generic | **UPSTREAM-PR** | Defensive json.encode (parte de 47412d5). Listo para PR. |
| `callng/main.lua` | +10 | Local feature | **LOCAL-ONLY** o REWORK | Lee `LIBRE_DEFAULT_ROUTING_TABLE`. Decisión: ¿feature local permanente o promover como PR? |
| `callng/sigfunc.lua` | +52 (NEW) | Kamailio stub | **DROP** | Funciones VACÍAS para no requerir kamailio. Sin valor sin kamailio. |
| `callng/utilities.lua` | +26 | Generic | **UPSTREAM-PR** | `split()` defensive (parte de 47412d5). Listo para PR. |
| `liberator/api.py` | +23 | Generic | **UPSTREAM-PR** | Captura body de PUT/POST a `/libreapi/sipprofile` para tracking/middleware. Útil para todos. |
| `liberator/basemgr.py` (kamailio) | ~+150 | Kamailio | **DROP** | Re-add `kaminstance()` y access-layer machinery. |
| `liberator/basemgr.py` (paths hardcoded) | +1 | Bug | **DROP** | `_NFT = ... '/opt/libresbc/liberator/nft'` rompe portabilidad. Upstream usa relativo. |
| `liberator/cdr.py` | +10 | Verify | **A INSPECCIONAR** | Cambios en CDR processing. |
| `liberator/cfgapi.py` (username hash) | +1 | Generic | **UPSTREAM-PR** | `hmget(..., 'username')` para directory hash. Esto es `b5da7a2`, próximo PR. |
| `liberator/cfgapi.py` (path hardcoded) | +1 | Bug | **DROP** | `directory="/opt/libresbc/liberator/fscfg/xml"` rompe portabilidad. |
| `liberator/cfgapi.py` (try/finally) | +~10 | Generic | **UPSTREAM-PR** | Refactor de control flow. Va junto a similares en libreapi.py. |
| `liberator/cfgapi.py` (typo `ENGAGMENT`) | +1/-1 | Bug | **DROP** | Introduce typo. Si vamos a tocar, hay que CORREGIR el typo upstream también. |
| `liberator/libreapi.py` (RtpSecureMediaEnum) | +7 | Generic | **EN PR #209** | Ya abierto. |
| `liberator/libreapi.py` (refactor pydantic.v1) | ~+300 | Generic | **UPSTREAM-PR (split)** | Migración de validators imperativos a pydantic validators. Útil pero grande. |
| `liberator/libreapi.py` (validators check_member, netalias) | ~+40 | Generic | **UPSTREAM-PR** | Pydantic validators reemplazando check imperativo. |
| `liberator/libreapi.py` (try/finally consistente) | ~+40 | Generic | **UPSTREAM-PR** | Refactor de control flow. |
| `liberator/libreapi.py` (NODEID env default) | +2 | Generic | **UPSTREAM-PR** | `os.getenv('NODEID', 'libresbc-node1')`. |
| `liberator/libreapi.py` (DistributedGatewayModel.weight str→int validator) | +~5 | Generic | **UPSTREAM-PR** | Parte de 47412d5. Listo para PR. |
| `liberator/libreapi.py` (resto +~700) | varios | Mixed | **REVISAR** | Probablemente DistributedGateway, Routing, etc. del cliente. Necesita split detallado. |
| `liberator/main_cdr_only.py` (NEW) | +50 | Local feature | **A INSPECCIONAR** | Modo "solo CDR" sin tocar FS/Kamailio. ¿Se usa en runtime? Si sí: feature local. |
| `liberator/nft/nftables.j2.conf` | +43 | Kamailio | **DROP** | Template de access-layers para kamailio. Sin valor sin kamailio. |
| `liberator/requirements.txt` | -2 lines | Bug | **DROP** | Downgradea `requests` y `Jinja2`. Upstream tiene versiones más nuevas. |
| `liberator/system/logrotate.d/libre` | +17 | Mixed | **DROP** | Diff diverge solo por sección de kamailio.log. Upstream ya cubre el resto. |
| `liberator/system/rsyslog.d/libre.conf` | +6 | Verify | **A INSPECCIONAR** | Probablemente refleja pequeñas diferencias de path. |
| `liberator/system/sbin/liberator.sh` (NEW, 3 lines) | +3 | Obsolete | **DROP** | Script con `cd /opt/liberator` (path antiguo). Upstream tiene systemd unit. |
| `liberator/system/sbin/uvicorn.sh` (NEW, 9 lines) | +9 | Obsolete | **DROP** | Launcher dev de uvicorn. No se usa en producción. |
| `liberator/utilities.py:redishash` | +21 | Generic | **UPSTREAM-PR** | Defensive coding cuando `json.dumps` falla. Listo para PR. |
| `webui/assets/css/customize.css` | +34 | Generic | **EN PR #210** | Ya abierto. |
| `webui/assets/js/site.js` (toasts ~140) | +140 | Generic | **EN PR #210** | Ya abierto. |
| `webui/assets/js/site.js` (resto ~104) | +104 | Mixed | **A INSPECCIONAR** | Hay más cambios además de los toasts del PR #210. Splitear. |
| `webui/index.html` | +1/-1 | Trivial bug | **DROP** | Hardcodea "© 2023". Upstream usa year dinámico. |
| `webui/libresbc-webui` | +8.7MB binario | Binario | **DROP DEL REPO** | Binario compilado del webui de Go. NO va en repo de código. Se construye en deploy. |
| `webui/test-error-handling.html` | +130 (NEW) | Test artifact | **DROP** | Página HTML de prueba para los toasts. No es producto. |

## Resumen de decisiones

| Categoría | # archivos | Acción |
|---|---|---|
| **DROP** definitivo | ~12 | Quedan en archive, no se reaplican. Incluye kamailio, paths hardcoded, downgrades, binarios, scripts dev, copyright. |
| **UPSTREAM-PR** ya abiertos | 2 | #209 (RtpSecureMediaEnum), #210 (webui error toasts). |
| **UPSTREAM-PR** próximos a abrir | ~7 | `b5da7a2` (cfgapi-username-hash), 3 splits de `47412d5` (event.initiation, utilities split, weight validator), `api.py` body capture, `utilities.py:redishash`, `cfgapi.py` try/finally. |
| **UPSTREAM-PR (mientras tanto LOCAL-ONLY)** | ~3 | Refactors grandes de `libreapi.py` (pydantic validators) — abrir PR pero mantener local porque no es trivial reescribir. |
| **LOCAL-ONLY** real | 1-2 | `LIBRE_DEFAULT_ROUTING_TABLE` (callng/main.lua). Posiblemente `main_cdr_only.py` si está en uso. |
| **A INSPECCIONAR** antes de decidir | ~5 | `freeswitch.xml`, `modules.conf`, `cdr.py`, `rsyslog.d/libre.conf`, resto de `site.js`, resto de `libreapi.py`. |

## Plan de re-aplicación

### Fase 1 — DROP confirmados (no requiere acción)

Todo el código kamailio, paths hardcoded, downgrades de deps, copyright, binarios y scripts dev quedan en el archive y no se tocan.

### Fase 2 — Re-aplicar **LOCAL-ONLY** mínimos (necesarios para mantener funcionalidad runtime)

Crear commits limpios sobre `local/customizations`:

1. `[LOCAL-ONLY] feat(callng): support LIBRE_DEFAULT_ROUTING_TABLE env var`
2. (condicional) `[LOCAL-ONLY] feat(liberator): add main_cdr_only mode` si se usa.

### Fase 3 — Abrir PRs upstream restantes (no requiere reaplicar localmente)

Por cada uno: `bin/open-pr.sh ...`. Cuando mergee, viene gratis vía `git fetch upstream + rebase`.

3. `b5da7a2` → PR `pr/cfgapi-directory-username-hash`
4. `47412d5` split (a) → PR `pr/callng-event-initiation-defensive-json`
5. `47412d5` split (b) → PR `pr/callng-utilities-split-defensive`
6. `47412d5` split (c) → PR `pr/libreapi-weight-string-validator`
7. `api.py` body capture → PR `pr/libreapi-sipprofile-body-capture`
8. `utilities.py:redishash` defensive → PR `pr/utilities-redishash-defensive`
9. `cfgapi.py` try/finally + libreapi.py try/finally → PR (combinado)

### Fase 4 — Refactors grandes (mientras tanto LOCAL-ONLY)

10. `libreapi.py` pydantic validators (`check_member`, `netalias_agreement`, etc.) — abrir PR pero reaplicar como `[UPSTREAM-PR:#NNN]` en local porque su impacto en API es grande.

### Fase 5 — Resto a inspeccionar caso a caso

11. `freeswitch.xml`, `modules.conf`, `cdr.py`, `rsyslog.d/libre.conf`, resto de `site.js`, resto de `libreapi.py`.

## Estado al cierre del proceso (objetivo)

`local/customizations` debería terminar con **2-4 commits**:

- 1 commit `[LOCAL-ONLY] add upgrade tooling, runbook and audit docs` (ya existe)
- 1 commit `[LOCAL-ONLY] open-pr.sh: bug fixes` (ya existe)
- 1 commit `[LOCAL-ONLY] track PRs en UPSTREAM_PRS.md` (ya existe)
- 0-1 commit `[LOCAL-ONLY] feat(callng): LIBRE_DEFAULT_ROUTING_TABLE` (TODO)
- 0-1 commit `[LOCAL-ONLY] feat: main_cdr_only mode` (condicional)

Los commits `[UPSTREAM-PR:#NNN]` para refactors grandes se descartan al rebasar contra upstream cuando los PRs mergeen.

**Si todo va bien, en 6-12 meses la rama queda con 1-3 commits permanentes.**

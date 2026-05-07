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

## Tabla maestra (decisiones finales)

| Archivo | Δ lineas | Decisión | Notas |
|---|---|---|---|
| `build/docker/Dockerfile.standalone` (NEW) | +74 | **UPSTREAM-PR** | Sin datos del cliente. |
| `build/docker/docker-compose.dev.yml` (NEW) | +63 | **UPSTREAM-PR** | Composición dev sin IPs. |
| `build/docker/docker-compose.standalone.yml` (NEW) | +29 | **UPSTREAM-PR** | Standalone sin IPs. |
| `build/docker/docker-compose.yml` (NEW) | +60 | **UPSTREAM-PR** | Composición default sin IPs. |
| `build/docker/libre.env` (NEW) | +25 | **UPSTREAM-PR** | Template genérico (`REDIS_HOST=127.0.0.1`, sin secrets reales). |
| `build/preconfig/freeswitch/freeswitch.xml` (NEW) | +215 | **DROP** | Verificado en runtime: NO existe en `/opt/libresbc/v1.0.0/build/`. FreeSWITCH usa default + override dinámico de `sip_profiles/`. Archivo muerto. |
| `build/preconfig/freeswitch/modules.conf` (NEW) | +20 | **DROP** | Idem `freeswitch.xml`: archivo muerto. |
| `callng/callfunc.lua` | +94 | **REWORK→PR (split)** | Lógica inbound routing (parte de `9ae0250`). Hay que separar parte genérica del cliente. |
| `callng/configuration.lua` | +1 | **UPSTREAM-PR** | Cambia `os.exit()` por `NODEID = "libresbc-node1"` cuando env var falta. Defensive. |
| `callng/event.initiation.lua` | +17 | **UPSTREAM-PR** | Defensive `json.encode` (parte de `47412d5`). |
| `callng/main.lua` | +10 | **LOCAL-ONLY** | Lee `LIBRE_DEFAULT_ROUTING_TABLE`. Único feature local real. |
| `callng/sigfunc.lua` (NEW) | +52 | **DROP** | Funciones VACÍAS, stub para no requerir kamailio. Sin kamailio = sin sentido. |
| `callng/utilities.lua` | +26 | **UPSTREAM-PR** | `split()` defensive (parte de `47412d5`). |
| `liberator/api.py` | +23 | **UPSTREAM-PR** | Captura body de PUT/POST a `/libreapi/sipprofile` (middleware tracking útil). |
| `liberator/basemgr.py` (kamailio) | ~+150 | **DROP** | Re-add `kaminstance()` y access-layer machinery. |
| `liberator/basemgr.py` (path hardcoded) | +1 | **DROP** | `_NFT = ... '/opt/libresbc/liberator/nft'` rompe portabilidad. |
| `liberator/cdr.py` | +10 | **UPSTREAM-PR** | `try/finally: return result` defensive. |
| `liberator/cfgapi.py` (username hash) | +1 | **UPSTREAM-PR** | `hmget(..., 'username')`. Núcleo de `b5da7a2`. |
| `liberator/cfgapi.py` (path hardcoded) | +1 | **DROP** | `directory="/opt/libresbc/liberator/fscfg/xml"`. |
| `liberator/cfgapi.py` (try/finally) | +~10 | **UPSTREAM-PR** | Combinable con cdr.py + libreapi.py. |
| `liberator/cfgapi.py` (typo `ENGAGMENT`) | +1/-1 | **DROP** | Introduce typo. |
| `liberator/libreapi.py` (RtpSecureMediaEnum) | +7 | **EN PR [#209](https://github.com/hnimminh/libresbc/pull/209)** | Abierto. |
| `liberator/libreapi.py` (DistributedGatewayModel.weight validator) | +~5 | **UPSTREAM-PR** | Parte de `47412d5`. |
| `liberator/libreapi.py` (validators check_member, netalias) | ~+40 | **UPSTREAM-PR (combinable)** | Pydantic validators. |
| `liberator/libreapi.py` (try/finally consistente) | ~+40 | **UPSTREAM-PR (combinable)** | Refactor control flow. |
| `liberator/libreapi.py` (NODEID env default) | +2 | **UPSTREAM-PR** | `os.getenv('NODEID', 'libresbc-node1')`. Compañero de `configuration.lua`. |
| `liberator/libreapi.py` (DomainPolicy + AccessService + AntiFlooding + AuthFailure + AttackAvoid + AccessDirectory) | ~+700 | **DROP** | Endpoints `/access_directory_user`, `/access_service`, `/access_domain_policy`. Es la API del access-layer abandonado. Sin kamailio = sin uso. |
| `liberator/main_cdr_only.py` (NEW) | +50 | **DROP** | Servicio `liberator-cdr.service` está `disabled + inactive` (verificado en runtime). Feature dormida. |
| `liberator/nft/nftables.j2.conf` | +43 | **DROP** | Template `accesslayers` para kamailio. |
| `liberator/requirements.txt` | -2 lines | **DROP** | Downgrade de deps (peor que upstream). |
| `liberator/system/logrotate.d/libre` | +17 | **DROP** | Diferencia es solo sección kamailio.log. |
| `liberator/system/rsyslog.d/libre.conf` | +6 | **DROP** | Mismo: agrega `kamailio.log` rsyslog rules. |
| `liberator/system/sbin/liberator.sh` (NEW, 3 lines) | +3 | **DROP** | Script con `cd /opt/liberator` (path antiguo). Upstream tiene systemd unit. |
| `liberator/system/sbin/uvicorn.sh` (NEW, 9 lines) | +9 | **DROP** | Launcher dev de uvicorn. |
| `liberator/utilities.py:redishash` | +21 | **UPSTREAM-PR** | Defensive coding cuando `json.dumps` falla. |
| `webui/assets/css/customize.css` | +34 | **EN PR [#210](https://github.com/hnimminh/libresbc/pull/210)** | Abierto. |
| `webui/assets/js/site.js` (toasts ~140) | +140 | **EN PR [#210](https://github.com/hnimminh/libresbc/pull/210)** | Abierto. |
| `webui/assets/js/site.js` (`Array.isArray()` defensive ~30) | +30 | **UPSTREAM-PR (separado)** | Defensive guards antes de `forEach`. |
| `webui/assets/js/site.js` (otros ~74) | +74 | **A REVISAR** | Mix de cambios menores. Splitear o DROP. |
| `webui/index.html` | +1/-1 | **DROP** | Hardcodea "© 2023". |
| `webui/libresbc-webui` (NEW, 8.7MB) | +8388608 (binario) | **DROP DEL REPO** | Binario compilado del webui de Go. NO va en repo de código. |
| `webui/test-error-handling.html` (NEW) | +130 | **DROP** | Página HTML de prueba. |

## Resumen de decisiones (CERRADO tras inspección runtime)

| Categoría | # | Items |
|---|---|---|
| **DROP** definitivo | 14 | Kamailio (kami.lua, sigfunc.lua, kamcfg/, nft accesslayers, rsyslog kamailio, basemgr kaminstance, libreapi access_*, build/preconfig/freeswitch/, main_cdr_only.py), paths hardcoded (basemgr, cfgapi), bugs (typo ENGAGMENT, deps downgrade, copyright 2023), binarios (webui-go, test-error-handling.html, scripts liberator.sh/uvicorn.sh), logrotate/rsyslog kamailio. |
| **UPSTREAM-PR** abiertos | 2 | [#209](https://github.com/hnimminh/libresbc/pull/209), [#210](https://github.com/hnimminh/libresbc/pull/210). |
| **UPSTREAM-PR** a abrir | 9-10 | `b5da7a2` (cfgapi-username), 3 splits de `47412d5` (event.initiation, utilities split, weight validator), `api.py` body capture, `utilities.py:redishash`, `configuration.lua` NODEID default + libreapi NODEID default (combinable), `cdr.py + cfgapi + libreapi try/finally` (combinable), `site.js` Array.isArray defensive, `libreapi.py` pydantic validators (`check_member`, `netalias_agreement`), `build/docker/*` templates. |
| **LOCAL-ONLY** real | 1 | `LIBRE_DEFAULT_ROUTING_TABLE` (`callng/main.lua` + posiblemente `libreapi.py` para exponer la config). |
| **REWORK→PR (split detallado)** | 1 | `callng/callfunc.lua` (+94 lineas). Lógica inbound routing — separar parte genérica (PR) de parte específica del cliente (LOCAL-ONLY). |
| **A revisar caso a caso** | 1 | `webui/assets/js/site.js` resto (~74 líneas no clasificadas). |

## Plan de re-aplicación (versión final)

### Fase A — DROP confirmados (sin acción)

14 archivos quedan en el archive (`archive/feature-improved-error-handling-202605`) y no se reaplican. Si el cliente quiere conservar el binario `webui/libresbc-webui` o algún script muerto, van a `/var/lib/libresbc-ops/`.

### Fase B — Reaplicar el único LOCAL-ONLY real

Un commit en `local/customizations`:

1. `[LOCAL-ONLY] feat(callng): support LIBRE_DEFAULT_ROUTING_TABLE env var`
   - Reaplica el cambio chico de `callng/main.lua` (+10 líneas).
   - Si hay un cambio compañero en `libreapi.py` para exponer la config, va junto.

### Fase C — Abrir PRs upstream restantes (en paralelo a Fase B)

Cada uno con `bin/open-pr.sh`. Por orden de "facilidad de merge":

| # | PR | Origen | Riesgo |
|---|---|---|---|
| 3 | `pr/cfgapi-directory-username-hash` | `b5da7a2` (parcial) | Bajo. 1 línea cambio. |
| 4 | `pr/callng-event-initiation-defensive-json` | `47412d5` parte | Bajo. Defensive. |
| 5 | `pr/callng-utilities-split-defensive` | `47412d5` parte | Bajo. Defensive. |
| 6 | `pr/libreapi-weight-string-validator` | `47412d5` parte | Bajo. Pydantic validator. |
| 7 | `pr/api-sipprofile-body-capture` | `api.py` cambio | Medio. Middleware general. |
| 8 | `pr/utilities-redishash-defensive` | `utilities.py:redishash` | Bajo. Defensive. |
| 9 | `pr/configuration-nodeid-default` | `callng/configuration.lua` + `libreapi.py:NODEID` (combinable) | Bajo. Defensive. |
| 10 | `pr/cdr-cfgapi-libreapi-try-finally` | combinado | Medio. Refactor consistente. |
| 11 | `pr/webui-array-isarray-defensive` | `site.js` parte | Bajo. Guards. |
| 12 | `pr/libreapi-pydantic-validators` | `libreapi.py` validators | Medio-alto. Refactor mayor. |
| 13 | `pr/build-docker-templates` | `build/docker/*` (5 archivos) | Medio. ¿Ya tienen template propio? Verificar. |

### Fase D — Casos especiales

- `callng/callfunc.lua` (+94): split entre PR (parte genérica de inbound routing) y commit `[LOCAL-ONLY]` (parte que dependa de tabla del cliente).
- `webui/assets/js/site.js` (+74 sin clasificar): inspeccionar trozo a trozo.

## Estado al cierre del proceso (objetivo realista)

`local/customizations` deberia terminar con **5-6 commits permanentes**:

1. `[LOCAL-ONLY] add upgrade tooling, runbook and audit docs` ✅
2. `[LOCAL-ONLY] open-pr.sh: detect fork owner, idempotent re-runs, auto-create PR` ✅
3. `[LOCAL-ONLY] track PR #210 (webui error toasts)` ✅
4. `[LOCAL-ONLY] add MIGRATION_INVENTORY.md` ✅
5. `[LOCAL-ONLY] feat(callng): LIBRE_DEFAULT_ROUTING_TABLE` ✅
6. `[LOCAL-ONLY] deploy.sh: --stage-only flag and Lua syntax smoke test` ✅
7. `[LOCAL-ONLY] fix(callng+deploy): LIBRE_DEFAULT_ROUTING_TABLE via os.getenv + FS callng symlinks` ✅
8. `[LOCAL-ONLY] fix(callng): determine_inbound_connection - real Redis lookup with CIDR matching` ✅

Cualquier commit `[UPSTREAM-PR:#NNN]` para refactors grandes se descartara al
rebasar contra upstream cuando el PR correspondiente mergee.

## Estado real al 2026-05-07 (post validacion runtime)

La rama `local/customizations` cuenta **10 commits sobre `upstream/master`**:

- 4 commits de **tooling/docs** (1, 2, 3, 4 de la lista de arriba).
- 4 commits de **feature LIBRE_DEFAULT_ROUTING_TABLE + determine_inbound_connection** (5, 6, 7, 8). Inicialmente fueron solo 2, pero la validacion runtime descubrio 3 bugs heredados de la rama vieja del cliente que requirieron 2 commits de fix adicionales. Ver `AUDITORIA_COMMITS.md` seccion "Validacion runtime de Fase B".
- 2 commits de **migration inventory** y **docs intermedias**.

**Validacion en runtime cerrada** ✅:
- Deploy completo ejecutado 3 veces sin issues.
- 7/7 casos de prueba CIDR pasando para `determine_inbound_connection`.
- Servicios estables: liberator, nginx, redis activos.
- Cleanup de `/opt/libresbc/`: deploy intermedio borrado, `v1.0.0` archivado, archivos cliente migrados a `/var/lib/libresbc-ops/`.

### Camino hacia "rama LOCAL minima"

Los 4 commits de la feature (5-8) son tecnicamente **upstream-PR-eables** (la funcion es generica, sin branding del cliente). Cuando el operador decida abrirlo como PR, esos 4 commits se reconvierten a 1-2 commits limpios y se postulan a `hnimminh/libresbc`. Si se aceptan upstream, se eliminan de `local/customizations` en el siguiente rebase.

Objetivo realista a 6-12 meses: **rama de 4-5 commits** todos de tooling/docs.

**Si todo va bien, en 6-12 meses la rama queda con 4-6 commits permanentes**, todos
de tooling/docs/configuracion explicitamente local — la deuda tecnica quedaria
casi en cero.

# Auditoria commit-por-commit — Tarea 4

Auditoria de los 17 commits propios entre `upstream/master` y `feature/improved-error-handling`.

Categorias de decision:

- **`UPSTREAM-PR`** — Util para la comunidad, sin info especifica del cliente. Se prepara como PR contra `hnimminh/libresbc`.
- **`LOCAL-ONLY`** — Especifico de la infra del cliente (Issabel, IPs, branding). Vive en `local/customizations`.
- **`REWORK-THEN-PR`** — La idea es buena pero el commit mezcla cambios o tiene branding/datos del cliente. Hay que reescribir limpio antes del PR. Mientras tanto vive como `LOCAL-ONLY`.
- **`DROP`** — Ya esta en upstream, fue revertido, era basura (commits "."), o es ruido fuera del codigo (docs internas, `archivo_obsoleto/`).

Convencion de subject de los commits reescritos en `local/customizations`:
- `[LOCAL-ONLY] ...`
- `[UPSTREAM-PR:pendiente] ...`
- `[UPSTREAM-PR:#NNN] ...` cuando ya hay PR abierto.

---

## Tabla resumen

| # | Commit  | Autor   | Subject                                                                       | Files        | +/-          | Decision         | Justificacion |
|---|---------|---------|-------------------------------------------------------------------------------|--------------|--------------|------------------|---------------|
| 1 | 82a0f62 | brancan | feat(webui): improve API error handling with enhanced toast notifications     | 2 (webui)    | +140/-29     | UPSTREAM-PR      | Mejora generica del webui (toasts), util para todos. Sin datos del cliente. |
| 2 | a96efa2 | brancan | "."                                                                          | 17 (1era etapa) | +780/-6   | LOCAL-ONLY       | 17 JSON de configuracion del cliente bajo `1era etapa/`. Subject vacio, son configs de Issabel/Bicentenario. NO debe ir al repo de codigo, va a `/etc/libresbc/` o repo de operativa. |
| 3 | a923bae | brancan | "."                                                                          | 1 (.md)      | +687/-0      | DROP             | `LIBRESBC_CONFIGURACION_DIRECTA.md` doc interna. Posteriormente borrada por `d6406a1`. Subject vacio. |
| 4 | b3c6903 | brancan | "."                                                                          | 1 (.md)      | +29/-132     | DROP             | Edicion del mismo doc interno borrado despues. Subject vacio. |
| 5 | 4854362 | Minh Minh | remove(access-layer): unsupport kamailio                                   | 13           | +7/-1534     | DROP             | El MISMO commit con identico subject existe en upstream como `462c579`. Es un cherry-pick. Upstream ya removio access-layer; rebasar sobre `upstream/master` lo absorbe automaticamente. |
| 6 | 0666083 | brancan | fix(basemgr): remove remaining access-layer references                       | 4 (liberator+webui) | +158/-27 | UPSTREAM-PR    | Limpieza follow-up post 4854362. Verificar que upstream ya no tenga referencias residuales; si quedan, este fix es candidato a PR. Si upstream ya las limpio, queda DROP en el rebase. |
| 7 | d6406a1 | brancan | remove(LIBRESBC_CONFIGURACION_DIRECTA): delete obsolete configuration guide  | 29           | +7717/-2     | REWORK / SPLIT   | Subject mentiroso. Borra UN doc pero ANIADE 7717 lineas: cambios reales en `callng/{callfunc,main}.lua`, `build/ansible/inventory.yml`, todo el directorio `infocollector/` (28 archivos), y modifica documentos varios. **Hay que descomponer**: separar (a) cambios de codigo en callng (REWORK-THEN-PR), (b) `infocollector/` decidir si va al producto o a operativa interna, (c) `build/ansible/inventory.yml` con datos del cliente -> LOCAL-ONLY. |
| 8 | 881fd8e | brancan | asdfasdfasdf                                                                 | 1 (private/) | +50/-0       | DROP             | Garbage commit con `private/issabel.txt`. Datos internos del cliente. NO va al repo. |
| 9 | 9ae0250 | brancan | feat(callng): enhance inbound connection detection and routing logic         | 27           | +7093/-70    | REWORK / SPLIT   | Subject describe codigo, pero el commit MEZCLA: cambios reales en `callng/{callfunc,configuration,kami,main,sigfunc,utilities}.lua`, archivos `.backup` (`callfunc.lua.backup`, `main.lua.backup`, `main.lua.backup.20251013_145858`), y docs `RESUMEN_CONFIGURACION.md`. **Reescribir limpio**: extraer SOLO los cambios de codigo cohesivos; los `.backup` son ruido y van a DROP; el `RESUMEN_CONFIGURACION.md` es operativa interna. Una vez aislado, lo de codigo es candidato a UPSTREAM-PR. |
| 10 | 47412d5 | brancan | fix: Corregir formato de campo 'rules' en AccessControl issabel_access     | 4            | +37/-3       | REWORK / SPLIT   | Mezcla: (a) `1era etapa/AccessControl issabel_access.json` -> LOCAL-ONLY (config del cliente). (b) `callng/event.initiation.lua`, `callng/utilities.lua`, `liberator/libreapi.py` -> probable UPSTREAM-PR si el cambio es generico (formato de campo `rules` en AccessControl es comportamiento del producto). Verificar si ya esta en upstream. |
| 11 | 572864d | brancan | fix: update file paths and enhance JSON handling in utilities                | 5            | +220/-6      | REWORK / SPLIT   | Mezcla: (a) `liberator/{basemgr,cfgapi,libreapi,utilities}.py` -> UPSTREAM-PR, (b) `liberator/utilities.py.backup.20251022_124147` -> DROP (archivo backup). |
| 12 | 37a7997 | brancan | docs: add summary of applied changes and fixes                               | 1 (.md)      | +56/-0       | DROP             | `CAMBIOS_APLICADOS.md` doc interna. Va a operativa interna, no al repo. |
| 13 | 3419594 | brancan | fix(callng): update gateway retrieval and enhance proxy handling logic       | 57           | +10403/-16   | REWORK / SPLIT   | Subject sobre codigo, pero la mayoria de los archivos son `ANALISIS_*.md` (docs internos de troubleshooting). **Descomponer**: separar el codigo real en `callng/` y `liberator/` (UPSTREAM-PR si limpio); todos los `ANALISIS_*.md` van a operativa interna -> DROP del repo de codigo. |
| 14 | 470afba | brancan | feat(libapi): add RtpSecureMediaEnum for RTP/SRTP security modes             | 1 (libreapi.py) | +7/-0     | UPSTREAM-PR      | Cambio chico (+7 lineas) y cohesivo. Anade un enum para modos SRTP. Sin datos del cliente. **Candidato ideal a primer PR**. |
| 15 | b5da7a2 | brancan | fix(cfgapi): update directory function to include username in hash generation | 2           | +142/-3      | REWORK-THEN-PR   | Toca `liberator/cfgapi.py` (codigo real, util generico) Y `verificar_sincronizacion.sh` (script de operativa interna). Aislar el cambio en `cfgapi.py` para PR; dejar el script aparte. |
| 16 | 74f7c4f | brancan | delete: remove obsolete analysis and configuration files                     | 70           | +250/-6696   | LOCAL-ONLY (limpieza) | Borra `archivo_obsoleto/`, `ANALISIS_*.md`, `SOLUCIONES_ERRORES_IMPORTANTES.md`, etc. Es la contrapartida a `3419594`/`d6406a1` que los habian agregado. Si en Tarea 5 movemos toda esa operativa fuera del repo, este commit se vuelve trivial -> DROP. |
| 17 | 28b9ee6 | brancan | fix: correct username handling in SIP profile hash generation                | 1            | +203/-0      | DROP             | **Subject ENGANIOSO**. NO toca `liberator/`. Solo agrega un script `verificar_root_libresbc.sh` (203 lineas de bash de operativa interna). El "fix" real esta en `b5da7a2`. Este commit es solo un script auxiliar -> va a operativa interna. |

---

## Resumen de decisiones

| Decision         | # commits | Comentario |
|------------------|-----------|------------|
| UPSTREAM-PR      | 3 (puros) | `82a0f62` (webui toasts), `0666083` (cleanup access-layer), `470afba` (RtpSecureMediaEnum). Listos para PR sin reescritura. |
| REWORK / SPLIT   | 5         | `d6406a1`, `9ae0250`, `47412d5`, `572864d`, `3419594`, `b5da7a2`. Mezclan codigo util + datos del cliente o backups. Hay que descomponer. |
| LOCAL-ONLY       | 1+        | `a96efa2` (configs cliente). Mas las "porciones LOCAL-ONLY" extraidas de los REWORK. |
| DROP             | 7         | `a923bae`, `b3c6903`, `4854362`, `881fd8e`, `37a7997`, `74f7c4f`, `28b9ee6`. |

**Total cambios reales de codigo a preservar**: probablemente **5-7 features/fixes** una vez extraidos limpios. El resto es ruido (commits ".", subjects engañosos, backups, docs internas, configs del cliente).

---

## Plan de extraccion para Tarea 6

Orden sugerido para construir `local/customizations` sobre `upstream/master`:

1. **PRs limpios primero (UPSTREAM-PR puros)** — un commit nuevo por cada uno, sin tocar repo del cliente:
   - PR-1: `feat(webui): improve API error handling with toasts` (extraido de `82a0f62`).
   - PR-2: `feat(libapi): add RtpSecureMediaEnum for RTP/SRTP security modes` (extraido de `470afba`).
   - PR-3: `fix(cfgapi): include username in directory hash generation` (extraido de `b5da7a2`, sin el script).
   - PR-4: `fix(basemgr): remove remaining access-layer references` (de `0666083`, verificar previamente que upstream/master tenga residuos).

2. **Splitting de los grandes** — descomponer `9ae0250`, `47412d5`, `572864d`, `3419594` en commits cohesivos:
   - Por commit grande, identificar 1 o 2 cambios "generalizables" -> `[UPSTREAM-PR:pendiente]`.
   - Identificar cambios "del cliente" (paths/IPs hardcodeadas, JSONs de cluster, `1era etapa/...`) -> `[LOCAL-ONLY]`.

3. **LOCAL-ONLY puros**:
   - Configuracion del cliente extraida de `a96efa2` (los 17 JSONs de `1era etapa/`) **NO va al repo de codigo**, sino a `/etc/libresbc/` (Tarea 5).

Salida de `local/customizations` esperada: **3-7 commits limpios** con tags `[LOCAL-ONLY]` o `[UPSTREAM-PR:pendiente]`. Todo lo demas va a operativa interna o se descarta.

---

## Validaciones ejecutadas (2026-05-07)

- [x] **`4854362` patch-id == `462c579` patch-id** = `c6c7d93cf80673df34258908b8a67281cd9833b5`. Es el mismo cambio cherry-picked. Rebase contra `upstream/master` lo absorbe automaticamente. **DROP confirmado**.
- [x] **`upstream/master:liberator/basemgr.py`** ya esta libre de `access-layer`. Solo conserva 4 referencias a `kami:authfailure/attackavoid/antiflooding` como nombres de claves Redis legacy (lineas 441-459). NO ejecuta kamailio.
- [x] **Local `feature/improved-error-handling:liberator/basemgr.py`** SI tiene access-layer completo (`kaminstance()`, `kambin`, `nameset:access:service`, `access:policy:{domain}`, etc.). Investigacion: el commit `9ae0250` **re-introdujo** la funcion `kaminstance` (`git log -S "def kaminstance"` confirma que aparece en `9ae0250`).
- [x] **Runtime check**: kamailio NO esta corriendo (servicio `kamailio.service` disabled, sin proceso). Solo quedan claves residuales `access:policy:libresbc.local`, `access:service:default`, `nameset:access:service` en Redis pero **nadie las consume**.
- [x] **`LIBRE_STANDALONE_MODEL=true`** (en `/opt/libresbc/libre.env`) DESACTIVA `kaminstance()` por codigo: `basemgr.py:305-306` `"skip this action with standardalone model"`. Esto explica por que el access-layer esta "presente" en codigo pero "muerto" en runtime.
- [x] **`LIBRE_STANDALONE_MODEL` ya existe en upstream/master** (`configuration.py:53-57`). NO es una customizacion local. Buena noticia.
- [x] **`LIBRE_DYNAMIC_ROUTING` y `LIBRE_DEFAULT_ROUTING_TABLE` NO existen en upstream**. Son features locales introducidas por `9ae0250` y `3419594`. `LIBRE_DEFAULT_ROUTING_TABLE` se LEE en `callng/main.lua:101` (`freeswitch.getGlobalVariable("LIBRE_DEFAULT_ROUTING_TABLE")`). `LIBRE_DYNAMIC_ROUTING` NO se referencia en codigo runtime - posible variable muerta o solo controla comportamiento via libre.env sin lectura activa.
- [x] **`47412d5` tiene subject ENGANIOSO**. Su titulo dice "rules en AccessControl issabel_access" pero el diff real son 3 cambios de defensive coding genericos: (1) `event.initiation.lua` valida `json.encode`, (2) `utilities.lua/split()` maneja inputs vacios, (3) `libreapi.py:DistributedGatewayModel.weight` acepta strings y los convierte a int via validator. Mas un cambio en JSON del cliente. **Las 3 mejoras de codigo son perfectos UPSTREAM-PR**.
- [x] **`upstream/master`** no toco `callng/callfunc.lua` ni `callng/main.lua` desde el ancestor comun `cb172a7`. Eso significa que los cambios de `9ae0250` aplican limpio en upstream.

## Implicancias para la migracion

### Decision sobre access-layer/kamailio

**Aceptar la direccion de upstream (sin access-layer)**. Justificacion:

1. Kamailio no esta corriendo (servicio disabled, sin proceso).
2. `LIBRE_STANDALONE_MODEL=true` ya neutraliza ese codigo en runtime.
3. Solo hay 3 claves residuales en Redis sin consumidor.
4. Mantener un patch local para preservar `kaminstance()` y `access:service:*` solo crearia deuda de rebase permanente sin beneficio operativo.

Accion post-deploy: opcionalmente limpiar las claves Redis `access:*` y `nameset:access:service` (no afectan nada, pero simplifican el dump). El binario `/usr/local/sbin/kamailio` puede dejarse instalado o desinstalarse.

### Reclasificacion definitiva tras validaciones

| Commit  | Clasificacion previa | **Clasificacion final** | Razon |
|---------|----------------------|---------------------------|-------|
| 82a0f62 | UPSTREAM-PR          | **UPSTREAM-PR**           | Sin cambios. Mejora generica del webui. |
| a96efa2 | LOCAL-ONLY           | **DROP del repo de codigo**, va a /var/lib/libresbc-ops/ | 17 JSONs de config del cliente. NO es codigo. |
| a923bae | DROP                 | **DROP**                  | Sin cambios. Doc interna. |
| b3c6903 | DROP                 | **DROP**                  | Sin cambios. Doc interna. |
| 4854362 | DROP                 | **DROP confirmado**       | Patch-id identico a `462c579` upstream. Rebase lo absorbe. |
| 0666083 | UPSTREAM-PR          | **DROP**                  | Solo tiene sentido si se mantiene access-layer. Como aceptamos la decision upstream, este "fix" residual no aporta. Upstream ya esta limpio. |
| d6406a1 | REWORK / SPLIT       | **REWORK / SPLIT**        | Sin cambios. Subject engañoso, mezcla muchas cosas. |
| 881fd8e | DROP                 | **DROP**                  | Sin cambios. Garbage commit. |
| 9ae0250 | REWORK / SPLIT       | **REWORK / SPLIT**        | Las mejoras de `callfunc.lua`/`main.lua` (94+13 lineas) son UPSTREAM-PR limpias (upstream no toco esos archivos). El re-add de `kaminstance()` es DROP. La parte de `LIBRE_DYNAMIC_ROUTING`/`LIBRE_DEFAULT_ROUTING_TABLE` evaluar si va como UPSTREAM-PR (feature general util) o LOCAL-ONLY. |
| 47412d5 | REWORK / SPLIT       | **3 UPSTREAM-PR + 1 LOCAL-ONLY** | Subject engañoso. Los 3 cambios de codigo (`event.initiation.lua`, `utilities.lua/split`, `libreapi.py/weight validator`) son cambios de defensive coding **excelentes** para PR independientes. El JSON del cliente va al repo de ops. |
| 572864d | REWORK / SPLIT       | **REWORK / SPLIT**        | Sin cambios respecto a estimacion previa. |
| 37a7997 | DROP                 | **DROP**                  | Sin cambios. Doc interna. |
| 3419594 | REWORK / SPLIT       | **REWORK / SPLIT**        | Sin cambios. Mayoria son docs internos -> DROP. Las partes de codigo en callng/liberator se evaluan caso a caso. |
| 470afba | UPSTREAM-PR          | **UPSTREAM-PR**           | Sin cambios. Cambio chico, cohesivo. **Primer PR sugerido**. |
| b5da7a2 | REWORK-THEN-PR       | **REWORK-THEN-PR**        | Sin cambios. Aislar `cfgapi.py` para PR, descartar el script `verificar_*.sh`. |
| 74f7c4f | LOCAL-ONLY (limpieza) | **DROP**                 | Si la Tarea 5 ya saco la operativa interna del repo, este commit (que borra `archivo_obsoleto/`, `ANALISIS_*.md`, etc.) se vuelve trivial. |
| 28b9ee6 | DROP                 | **DROP**                  | Sin cambios. Solo agrega un script de operativa interna; subject engañoso. |

### Resumen final

**Commits que sobrevivirian en `local/customizations`** (ESTIMADO):
- 0 hasta 1-2 commits `[LOCAL-ONLY]` (si `LIBRE_DYNAMIC_ROUTING` y/o `LIBRE_DEFAULT_ROUTING_TABLE` se deciden mantener como features locales).
- Eventualmente 0 si todos los UPSTREAM-PR se aceptan rapido y las features se decide promoverlas como PRs tambien.

**PRs a abrir contra `hnimminh/libresbc`** (al menos 6 candidatos identificados):
1. `feat(webui): improve API error handling with toasts` (de `82a0f62`).
2. `feat(libapi): add RtpSecureMediaEnum for SRTP security modes` (de `470afba`).
3. `fix(cfgapi): include username in directory hash generation` (de `b5da7a2`).
4. `fix(callng/event.initiation): defensive json.encode handling` (de `47412d5`).
5. `fix(callng/utilities): handle empty inputs in split()` (de `47412d5`).
6. `fix(libreapi): accept string for weight in DistributedGatewayModel` (de `47412d5`).
7. (opcional) `feat(callng): enhance inbound connection detection` (parte limpia de `9ae0250`).
8. (opcional) `feat: dynamic routing table via LIBRE_DEFAULT_ROUTING_TABLE` (de `9ae0250`/`3419594` si se decide upstream-PR).

**Lo que se descarta directamente** (no entra en `local/customizations` ni en PRs): commits `.`, garbage, docs internas, scripts de verificacion, JSONs del cliente (estos van a `/var/lib/libresbc-ops/`).


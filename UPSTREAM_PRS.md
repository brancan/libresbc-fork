# PRs upstream — `hnimminh/libresbc`

Documento vivo. Cada vez que se abre, mergea o cierra un PR, actualizar la tabla.

Tags asociados a los commits en `local/customizations`:
- `[LOCAL-ONLY]` — vive permanentemente en la rama local.
- `[UPSTREAM-PR:pendiente]` — preparado para PR pero aun no abierto.
- `[UPSTREAM-PR:#NNN]` — PR abierto, esperando review/merge.
- Cuando un PR se mergea, el commit equivalente se **retira** de `local/customizations` en el siguiente rebase (Tarea 10 del plan, `bin/upgrade.sh`).

---

## Tabla de PRs

| #   | Branch                          | Origen (commit)  | Area    | Estado    | Mergeado | Commit equivalente en `local/customizations` |
|-----|---------------------------------|------------------|---------|-----------|----------|----------------------------------------------|
| ?   | `pr/libreapi-rtp-secure-media-enum`     | `470afba` | libreapi  | DRAFT     | -        | `[UPSTREAM-PR:pendiente] feat(libapi): add RtpSecureMediaEnum` |
| ?   | `pr/cfgapi-directory-username-hash`     | `b5da7a2` | cfgapi    | DRAFT     | -        | `[UPSTREAM-PR:pendiente] fix(cfgapi): include username in hash` |
| ?   | `pr/webui-error-toasts`                 | `82a0f62` | webui     | DRAFT     | -        | `[UPSTREAM-PR:pendiente] feat(webui): improved API error toasts` |
| ?   | `pr/basemgr-cleanup-access-layer`       | `0666083` | basemgr   | A-VERIFICAR | -      | `[UPSTREAM-PR:pendiente] fix(basemgr): remove access-layer remnants` |

(Los `?` se reemplazan por el numero real cuando se abren los PRs.)

---

## Como abrir un PR

```bash
sudo /home/cpe/libresbc/bin/open-pr.sh <area> <short-desc> <source-rev>
```

Ejemplo:

```bash
sudo /home/cpe/libresbc/bin/open-pr.sh libreapi rtp-secure-media-enum 470afba
```

Ver `bin/open-pr.sh` para detalles.

---

## Como confirmar que un PR fue mergeado

```bash
gh pr view <NNN> --repo hnimminh/libresbc --json state,mergeCommit
```

Si `state=MERGED`, marcar la fila como `MERGED <fecha>`. En el siguiente
`bin/upgrade.sh` el rebase contra `upstream/master` deberia detectar que el
commit ya esta absorbido y removerlo automaticamente. Si por alguna razon
queda un parche residual con conflictos, eliminar a mano el commit del overlay.

---

## Criterios para "este commit es UPSTREAM-PR-eable"

1. NO contiene paths internos de la infra (IPs, hostnames, NODEIDs).
2. NO contiene datos de configuracion del cliente (JSONs de cluster, AccessControl con reglas especificas).
3. Es atomico: un solo cambio cohesivo, no un mix.
4. Tiene tests o al menos no rompe los existentes.
5. El subject sigue convencion conventional commits del proyecto (feat/fix/docs/chore/refactor).

Si NO cumple alguna, va como `LOCAL-ONLY` o se reescribe (`REWORK-THEN-PR`) hasta que cumpla.

---

## Filosofia: la rama local debe DECRECER

`local/customizations` es deuda tecnica. Cada commit en esa rama es un parche
que tenemos que rebasar mensualmente. La meta:

- **Cada ciclo, abrir al menos 1 PR upstream** de algo que hoy esta como `LOCAL-ONLY`.
- **Cada ciclo, retirar al menos 1 commit** porque su PR se mergeo.
- Si la rama crece, es señal de problema: estamos creando deuda en vez de aportar a la comunidad.

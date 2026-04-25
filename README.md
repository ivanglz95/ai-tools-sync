# AI Tools Sync

Repositorio personal para sincronizar skills, plugins y manifiestos de instalacion entre proyectos y dispositivos.

La idea es guardar en Git solo lo reproducible:

- Skills y plugins propios que quieras mantener versionados.
- Inventarios de lo que hay instalado en cada maquina.
- Fuentes de marketplaces y comandos de reinstalacion.
- Scripts pequenos para recolectar y restaurar assets locales.

No se deben commitear tokens, credenciales, sesiones, logs, caches pesadas ni archivos generados por runtime.

## Estructura

```text
codex/
  skills/      # Skills propias para instalar en ~/.codex/skills
  plugins/     # Plugins propios o en desarrollo para Codex
claude/
  skills/      # Skills propias para instalar en ~/.claude/skills
  plugins/     # Plugins propios o en desarrollo para Claude
inventory/     # Inventarios generados por scripts/collect-inventory.ps1
manifests/     # Estado deseado y notas para reinstalar en otra maquina
scripts/       # Herramientas de inventario y restauracion
```

## Inventariar esta maquina

```powershell
.\scripts\collect-inventory.ps1
```

Esto genera:

- `inventory/current.json`
- `inventory/current.md`

El archivo `manifests/current-desired-state.json` resume el estado que vale la pena reproducir en otra maquina sin copiar caches ni rutas locales.

## Restaurar assets propios en otra maquina

Primero clona este repo. Luego ejecuta una simulacion:

```powershell
.\scripts\restore-local-assets.ps1
```

Para copiar skills propias al home de cada herramienta:

```powershell
.\scripts\restore-local-assets.ps1 -Apply
```

Para instalar marketplaces y plugins de Claude declarados en el manifiesto:

```powershell
.\scripts\install-claude-from-manifest.ps1 -Apply
```

El script no reinstala caches ni paquetes de marketplaces automaticamente. Para Claude, usa el inventario como guia:

```powershell
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin marketplace add thedotmack/claude-mem
claude plugin install claude-mem@thedotmack
```

Para Codex, los plugins que aparecen como `openai-*` son plugins del entorno/app y conviene tratarlos como dependencias administradas por Codex, no como archivos a copiar entre maquinas.

Ver [SYNC.md](SYNC.md) para el flujo completo entre varias PCs.

## Politica de sync

- Trackear: skills propias, plugins propios, templates, docs, scripts, inventarios.
- No trackear: `auth.json`, `.credentials.json`, `sessions`, `logs`, `cache`, `node_modules`, bases sqlite, archivos temporales.
- Para upgrades: correr `scripts/collect-inventory.ps1`, revisar el diff y commitear solo cambios esperados.

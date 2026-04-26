# Indice operativo ARGI

Objetivo: orientar futuras sesiones con lectura minima. Leer este archivo primero; abrir specs, planes o codigo solo cuando la tarea lo requiera.

## Estado

- Fase 1 completa: plugin ARGI base con 4 skills, core compartido, discovery de Drive y memoria progresiva.
- Fase 2 completa: MCP InfoLEG en `argi-plugin/mcp/infoleg-mcp/`.
- Fase 3 completa: MCP ARCA en `argi-plugin/mcp/arca-mcp/`.
- Rama esperada: `master`.
- Remoto: `https://github.com/ivanglz95/ai-tools-sync.git`.

## Lectura rapida por tarea

- Orientacion general: `AGENTS.md` + este indice.
- Diseno completo: `docs/superpowers/specs/2026-04-26-argi-plugin-design.md`.
- Historia de Fase 1: `docs/superpowers/plans/2026-04-26-argi-plugin-phase1.md`.
- Metadata del plugin: `argi-plugin/.claude-plugin/plugin.json`.
- Uso e instalacion: `argi-plugin/README.md`.
- Instalacion multi-PC: `argi-plugin/INSTALL.md`.
- Marketplace local Claude Code: `.claude-plugin/marketplace.json`.
- Servidores MCP habilitados: `argi-plugin/.mcp.json`.
- Core compartido: `argi-plugin/core/argi-core.md`.
- Skills: `argi-plugin/skills/{impositivo,contable,laboral,societario}/SKILL.md`.

## Reglas de contexto

- Indexar primero; no leer carpetas completas.
- Leer specs o planes solo si hay que cambiar arquitectura o reconstruir decisiones.
- Leer un MCP solo si la tarea afecta ese MCP.
- No cargar `bun.lock`, specs largas ni fuentes normativas completas salvo necesidad concreta.
- No versionar `node_modules`, `dist`, caches, `.argi-path` ni memorias privadas.

## Comandos utiles

Desde la raiz del repo:

```powershell
git -c safe.directory="$PWD" status --short --branch
git -c safe.directory="$PWD" pull --ff-only
```

Verificar InfoLEG:

```powershell
cd argi-plugin/mcp/infoleg-mcp
bun install --frozen-lockfile
bun run typecheck
bun test
```

Verificar ARCA:

```powershell
cd argi-plugin/mcp/arca-mcp
bun install --frozen-lockfile
bun run typecheck
bun test
```

Despues de verificar, no dejar `node_modules/` versionado.

Instalar o actualizar en otra PC:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\argi-plugin\scripts\install-claude-argi.ps1
```

## Cierre v4.0.0

- Plugin completo para el alcance definido: Fase 1, Fase 2 InfoLEG y Fase 3 ARCA.
- Pruebas minimas disponibles en ambos MCPs con `bun test`.
- Uso de `ARCA_PADRON_TXT_PATH` documentado en `argi-plugin/README.md`.
- Backlog opcional futuro: ampliar tests sin red, agregar Fase 4 si se decide integrar WSAA/certificados.

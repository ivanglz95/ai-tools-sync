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
```

Verificar ARCA:

```powershell
cd argi-plugin/mcp/arca-mcp
bun install --frozen-lockfile
bun run typecheck
```

Despues de verificar, no dejar `node_modules/` versionado.

## Pendientes reales

- Revision final integral del plugin ARGI v4.0.0.
- Opcional: agregar pruebas automatizadas pequenas para los clientes MCP.
- Opcional: documentar instalacion/uso de `ARCA_PADRON_TXT_PATH` para consulta local de padron publico.

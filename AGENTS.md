# ARGI Plugin — Contexto para Agentes (Codex / Claude Code)

## Proyecto
Plugin ARGI v4.0.0 — Asesor fiscal, contable, laboral y societario argentino.
Refactorizacion del skill monolitico `argi-consultor-impositivo-contable-laboral` en 4 skills modulares con base de normativas local (Google Drive Desktop) y MCPs futuros.

## Estado actual
- **Fase 1 COMPLETA:** plugin base con 4 skills, nucleo compartido, discover-drive.ps1, memoria progresiva.
- **Fase 2 PENDIENTE:** MCP InfoLEG (servidor TypeScript que expone buscar_norma / obtener_norma / buscar_por_numero).
- **Fase 3 PENDIENTE:** MCP ARCA (servidor TypeScript que expone consultar_contribuyente / obtener_vencimientos / verificar_constancia).

## Documentacion clave (leer antes de cualquier tarea)
- Spec completo: `docs/superpowers/specs/2026-04-26-argi-plugin-design.md`
- Plan Fase 1 (completo): `docs/superpowers/plans/2026-04-26-argi-plugin-phase1.md`

## Estructura del repo
```
argi-plugin/
├── .claude-plugin/plugin.json   <- metadata del plugin
├── core/argi-core.md            <- nucleo compartido (Kelsen, R1-R8, Master)
├── scripts/discover-drive.ps1   <- auto-discovery letra de disco Drive Desktop
├── skills/impositivo/SKILL.md   <- modulo fiscal
├── skills/contable/SKILL.md     <- modulo contable
├── skills/laboral/SKILL.md      <- modulo laboral
└── skills/societario/SKILL.md   <- modulo societario
docs/superpowers/
├── specs/                       <- disenos aprobados
└── plans/                       <- planes de implementacion
```

## Base de normativas (Drive Desktop)
Ruta: `{DRIVE}:\Mi unidad\NORMATIVAS IMPOSITIVAS\` (cuenta bg.impositivo@gmail.com)
La letra de disco se detecta con `scripts/discover-drive.ps1` → genera `.argi-path`.
`.argi-path` y `skills/*/memory/*.md` estan en .gitignore (privados del estudio).

## Stack tecnico
- Skills: Markdown
- MCPs (Fase 2-3): TypeScript + Node.js/Bun
- Scripts: PowerShell
- Sin framework de aplicacion

## Reglas de trabajo
- No modificar la estructura de carpetas en Drive (solo agregar fichas en `94_FICHAS_TEMATICAS/`)
- Commits frecuentes con mensajes `feat(argi): ...`
- Cada MCP va en su propia carpeta `argi-plugin/mcp/{nombre}-mcp/`
- Declarar los MCPs en `argi-plugin/.mcp.json` cuando esten listos

---
name: notebooklm-mcp
description: Use when the user asks to interact with Google NotebookLM: listar, crear, consultar o editar notebooks, agregar fuentes, generar audios/videos/infografias/slides/mindmaps/quizzes/flashcards, hacer queries sobre fuentes, buscar notebooks, exportar artefactos, ejecutar pipelines multi-paso o consultas cross-notebook.
---

# NotebookLM MCP

Este MCP conecta Claude directamente con Google NotebookLM via el servidor `notebooklm-mcp-cli` (comando `nlm`).

## Instalacion

```powershell
# 1. Instalar uv (si no esta instalado)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 2. Instalar el CLI
uv tool install notebooklm-mcp-cli

# 3. Autenticar con Google (abre el browser)
nlm login

# 4. Configurar en Claude Code
nlm setup add claude-code

# Reiniciar Claude Code para activar el MCP
```

## Herramientas disponibles via MCP

El MCP expone todas las capacidades de NotebookLM:

| Categoria | Acciones |
|-----------|----------|
| **Notebooks** | listar, crear, renombrar, eliminar, compartir, exportar |
| **Fuentes** | agregar (URL, archivo, texto, Google Drive), eliminar, sincronizar, ver contenido |
| **Notas** | crear, editar, eliminar, listar |
| **Chat/Query** | preguntar sobre las fuentes de un notebook |
| **Artefactos** | audio overview, video overview, slides, infografias, mindmaps, quizzes, flashcards, data tables, reportes |
| **Busqueda** | cross-notebook queries, research/descubrir fuentes, batch operations |
| **Aliases** | asignar nombres cortos a IDs de notebooks |

## Uso tipico

```
"Lista mis notebooks de NotebookLM"
"Crea un notebook llamado 'Investigacion IA' y agrega esta URL como fuente"
"Preguntale a mi notebook sobre X"
"Genera un audio overview del notebook Y"
"Exporta los artefactos del notebook Z a Google Docs"
```

## Autenticacion

- Login via browser con cuenta Google
- Las cookies se renuevan automaticamente cada 2-4 semanas
- Si expira: `nlm login` para re-autenticar
- Soporte multi-perfil (distintas cuentas Google)

## Seguridad

- Para material sensible, usar una cuenta Google dedicada
- Las credenciales se guardan localmente (no en este repo)
- No commitear `auth.json`, `.credentials.json` ni archivos de sesion

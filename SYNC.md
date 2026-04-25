# Como sincronizar entre PCs

Este repo sincroniza lo que conviene versionar: skills propias, plugins propios, manifiestos e inventario. Las credenciales y caches se configuran en cada maquina.

## 1. Publicar este repo en un remoto privado

Crea un repo privado en GitHub, GitLab o Bitbucket. Luego, desde esta carpeta:

```powershell
git remote add origin <URL_DEL_REPO_PRIVADO>
git push -u origin main
```

## 2. Preparar una nueva PC

Instala Codex y Claude Code, inicia sesion en cada herramienta y clona el repo:

```powershell
git clone <URL_DEL_REPO_PRIVADO> ai-tools-sync
cd ai-tools-sync
```

Restaura skills propias versionadas:

```powershell
.\scripts\restore-local-assets.ps1 -Apply
```

Instala marketplaces y plugins de Claude desde el manifiesto:

```powershell
.\scripts\install-claude-from-manifest.ps1 -Apply
```

Regenera inventario para confirmar el estado de esa PC:

```powershell
.\scripts\collect-inventory.ps1
git diff
```

Si el diff es esperado:

```powershell
git add inventory/current.json inventory/current.md
git commit -m "Update inventory from <NOMBRE_PC>"
git push
```

## 3. Flujo diario

Antes de cambiar skills o plugins:

```powershell
git pull
```

Despues de crear o editar una skill propia, guardala dentro del repo:

- Codex: `codex/skills/<nombre>/SKILL.md`
- Claude: `claude/skills/<nombre>/SKILL.md`

Luego publica:

```powershell
.\scripts\collect-inventory.ps1
git add .
git commit -m "Update AI tools sync"
git push
```

En las otras PCs:

```powershell
git pull
.\scripts\restore-local-assets.ps1 -Apply
.\scripts\install-claude-from-manifest.ps1 -Apply
```

## Que se sincroniza

- Skills propias que esten en `codex/skills` y `claude/skills`.
- Plugins propios o en desarrollo que pongas en `codex/plugins` y `claude/plugins`.
- Marketplaces y plugins instalados de Claude, como estado reproducible.
- Inventarios de cada maquina.

## Que no se sincroniza

- Tokens, sesiones, auth, credentials, logs y bases sqlite.
- Caches de plugins descargados.
- `node_modules` u otras dependencias pesadas.
- Conectores o logins de Codex/Claude: eso se autoriza en cada PC.

## Notas sobre Codex

Los plugins `openai-bundled`, `openai-curated` y `openai-primary-runtime` son administrados por la app de Codex. El repo los inventaria, pero no los copia entre maquinas. Para tenerlos en otra PC, instala/actualiza Codex y habilita los mismos conectores o plugins desde la app.

## Notas sobre Claude

Claude si expone comandos para marketplaces y plugins. El script `install-claude-from-manifest.ps1` lee `manifests/current-desired-state.json` y ejecuta los comandos equivalentes a:

```powershell
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin marketplace add thedotmack/claude-mem
claude plugin install claude-mem@thedotmack
```

El manifiesto guarda la version instalada para auditoria. Si el marketplace publica una version nueva, el CLI puede instalar o actualizar a la version disponible segun sus reglas.


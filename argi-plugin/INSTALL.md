# Instalar ARGI en otra PC

Requisitos:

- Windows PowerShell.
- Git.
- Bun en PATH.
- Claude Code en PATH (`claude --version`).
- Google Drive Desktop iniciado si se quiere usar la base local de normativas.

## 1. Clonar o actualizar

```powershell
git clone https://github.com/ivanglz95/ai-tools-sync.git
cd ai-tools-sync
git checkout master
git pull --ff-only
```

Si el repo ya existe, entrar en la carpeta y ejecutar solo `git pull --ff-only`.

## 2. Instalar plugin, skills y MCPs

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\argi-plugin\scripts\install-claude-argi.ps1
```

El instalador:

- Copia las 4 skills a `%USERPROFILE%\.claude\skills\argi-*`.
- Copia `core/argi-core.md` dentro de cada skill.
- Ejecuta `bun install --frozen-lockfile` en ambos MCPs.
- Registra `infoleg-mcp` y `arca-mcp` con `claude mcp add -s user`.
- Intenta detectar Google Drive Desktop y guarda `ARGI_BASE` como variable de usuario.
- Corre `typecheck`, `bun test` y `claude mcp get`.

## 3. Verificar

```powershell
claude mcp get infoleg-mcp
claude mcp get arca-mcp
```

Ambos deben mostrar `Status: Connected` o el indicador de conexion correcta de Claude Code.

## Opcional: padron ARCA local

Para que `consultar_contribuyente` y `verificar_constancia` resuelvan datos individuales sin certificado:

1. Descargar el archivo completo desde:
   `https://www.afip.gov.ar/genericos/cinscripcion/archivocompleto.asp`
2. Extraer el `.txt`.
3. Reinstalar indicando la ruta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\argi-plugin\scripts\install-claude-argi.ps1 -ArcaPadronTxtPath "C:\ruta\padron.txt"
```

Sin ese archivo, el MCP informa correctamente que la consulta online requiere CAPTCHA o WSAA/certificado.

## Reinstalar o actualizar

Despues de un `git pull --ff-only`, volver a ejecutar:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\argi-plugin\scripts\install-claude-argi.ps1
```

El script es idempotente: actualiza skills, reinstala dependencias si hace falta y re-registra MCPs.

# ARGI Plugin v4.0.0

Plugin modular para consultas fiscales, contables, laborales y societarias de Argentina.

## Estado

- 4 skills: `impositivo`, `contable`, `laboral`, `societario`.
- Core compartido: `core/argi-core.md`.
- MCP InfoLEG: `mcp/infoleg-mcp`.
- MCP ARCA: `mcp/arca-mcp`.
- Configuracion MCP: `.mcp.json`.

## Instalacion local

Desde `argi-plugin/mcp/infoleg-mcp`:

```powershell
bun install --frozen-lockfile
bun run typecheck
bun test
```

Desde `argi-plugin/mcp/arca-mcp`:

```powershell
bun install --frozen-lockfile
bun run typecheck
bun test
```

No versionar `node_modules/`.

## ARCA_PADRON_TXT_PATH

`consultar_contribuyente` y `verificar_constancia` pueden resolver datos individuales sin certificado solo si existe un padron publico local extraido.

1. Descargar el archivo completo desde la fuente oficial:
   `https://www.afip.gov.ar/genericos/cinscripcion/archivocompleto.asp`
2. Extraer el `.txt` fijo publicado por ARCA/AFIP.
3. Configurar la ruta:

```powershell
$env:ARCA_PADRON_TXT_PATH = "C:\ruta\al\padron.txt"
```

Sin ese archivo local, el MCP devuelve una respuesta explicita indicando que la consulta online esta protegida por CAPTCHA y que el web service formal requiere WSAA/certificado.

## Fuentes publicas usadas

- InfoLEG: `https://servicios.infoleg.gob.ar/infolegInternet`
- InfoLEG API base configurable: `https://servicios.infoleg.gob.ar/infoleg-internet/api/`
- ARCA vencimientos XML: `https://www.arca.gob.ar/vencimientos/xml/vencimientos.xml`
- ARCA constancia/archivo completo: `https://www.afip.gov.ar/genericos/cinscripcion/archivocompleto.asp`

## Cierre

El plugin esta completo para el alcance v4.0.0 definido en la spec:

- Fase 1: plugin base.
- Fase 2: MCP InfoLEG.
- Fase 3: MCP ARCA sin certificado.

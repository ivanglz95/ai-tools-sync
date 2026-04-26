# InfoLEG MCP

MCP server for ARGI Phase 2. It exposes three tools:

- `buscar_norma`
- `obtener_norma`
- `buscar_por_numero`

The client first tries the configured InfoLEG API base URL:

```text
https://servicios.infoleg.gob.ar/infoleg-internet/api/
```

If that API surface is unavailable, it falls back to the official public InfoLEG
HTML endpoints and normalizes the response as JSON for MCP clients.

## Run

```powershell
bun install
bun run typecheck
bun src/server.ts
```

Optional environment variables:

- `INFOLEG_API_BASE_URL`
- `INFOLEG_WEB_BASE_URL`
- `INFOLEG_TIMEOUT_MS`

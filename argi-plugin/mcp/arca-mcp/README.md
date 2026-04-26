# ARCA MCP

MCP server for ARGI Phase 3. It exposes:

- `consultar_contribuyente`
- `obtener_vencimientos`
- `verificar_constancia`

The server uses only public/no-certificate sources. ARCA's online constancia
form is protected by CAPTCHA, and the formal web service requires WSAA
certificate authentication, so individual taxpayer details are resolved only
when `ARCA_PADRON_TXT_PATH` points to an extracted public "archivo completo"
padron file.

## Run

```powershell
bun install
bun run typecheck
bun src/server.ts
```

Optional environment variables:

- `ARCA_PADRON_TXT_PATH`: local extracted fixed-width padron file.
- `ARCA_TIMEOUT_MS`: HTTP timeout in milliseconds.

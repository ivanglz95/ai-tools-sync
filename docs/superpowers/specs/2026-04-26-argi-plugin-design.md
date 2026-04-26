# ARGI Plugin — Diseño de Arquitectura
**Fecha:** 2026-04-26  
**Versión:** 4.0.0  
**Base:** ARGI v3.7.0 (skill monolítico) → refactorizado como plugin modular

---

## 1. Objetivo

Convertir el skill monolítico `argi-consultor-impositivo-contable-laboral` en un **plugin Claude Code** con:
- 4 skills especializados por área temática
- Núcleo compartido (sin duplicación)
- 2 MCP servers con APIs reales (InfoLEG + ARCA)
- Sistema de memoria progresiva por área
- Base de normativas en Markdown leída bajo demanda desde Google Drive Desktop
- ~60% reducción de tokens de contexto base vs. ARGI v3.7.0

**Funciona en:** Claude Code CLI + Claude.ai web

---

## 2. Estructura de archivos del plugin

```
argi-plugin/
├── .claude-plugin/
│   └── plugin.json                      ← metadata, versión, skills declarados, MCPs
├── core/
│   └── argi-core.md                     ← núcleo compartido (~500 tokens)
├── .argi-path                           ← letra de disco resuelta (auto-generado)
├── scripts/
│   └── discover-drive.ps1               ← auto-discovery letra de disco Drive Desktop
├── skills/
│   ├── impositivo/
│   │   ├── SKILL.md                     ← módulo fiscal + referencia a core (~300 tokens)
│   │   └── memory/
│   │       ├── plantillas.md            ← Excel conocidos (se aprende durante uso)
│   │       └── preferencias.md          ← preferencias aprendidas
│   ├── contable/
│   │   ├── SKILL.md                     ← 5 sub-módulos + RT 54/55/57/60 (~300 tokens)
│   │   └── memory/
│   │       └── plantillas-contables.md
│   ├── laboral/
│   │   ├── SKILL.md                     ← sueldos + F.931 + CCT (~250 tokens)
│   │   └── memory/
│   │       └── plantillas-sueldos.md
│   └── societario/
│       ├── SKILL.md                     ← SRL/SA/SAS + balances (~250 tokens)
│       └── memory/
│           └── preferencias.md
├── mcp/
│   ├── infoleg-mcp/
│   │   ├── package.json
│   │   └── src/
│   │       └── server.ts                ← MCP InfoLEG REST API
│   └── arca-mcp/
│       ├── package.json
│       └── src/
│           └── server.ts                ← MCP ARCA endpoints públicos
└── .mcp.json                            ← declara ambos MCPs del plugin
```

---

## 3. argi-core.md — Núcleo compartido

**Propósito:** contener todo lo invariante entre los 4 skills. Se carga como referencia, no se duplica.  
**Budget objetivo:** ≤ 500 tokens.

### Contenido

- **Identidad compacta:** rol, dominio, límite profesional
- **Pirámide de Kelsen:** jerarquía normativa en 10 niveles (3 líneas)
- **Reglas operativas R1–R8:** versión condensada
- **Heurísticas H1–H6:** una línea cada una
- **Template REGLA 8:** formato de respuesta (MARCO NORMATIVO → ANÁLISIS TÉCNICO)
- **Seguridad SEC-1/2/3:** condensado en 3 bullets
- **Módulo Master Sub-6–11:** solo nombres (cada skill expande lo relevante)

### Lo que NO va en core

- Módulos temáticos específicos (van en cada skill)
- Novedades normativas (van en los índices de Drive)
- Umbrales y montos (datos variables, van con R1: verificar online)

---

## 4. Skills especializados

### Principio de carga

Al invocar `/impositivo`, Claude carga:
1. `core/argi-core.md` (referencia)
2. `skills/impositivo/SKILL.md`
3. `skills/impositivo/references/_index.md`
4. `skills/impositivo/memory/*.md` (compactado, ≤ 300 tokens)

Los otros 3 skills no existen en contexto.

### 4.1 SKILL impositivo

**Módulos activos:**
- IVA · Ganancias · Monotributo · Ingresos Brutos · REIBP · Convenio Multilateral
- Moratorias · planes de pago · Facturación electrónica (RG 5762/2025)
- RG 5824/2026 (liquidación electrónica) · RG 5832/2026 (CUIT)
- Ley 27.799 (Régimen Penal Tributario) — con umbrales como R1 (verificar)
- Módulo Master Sub-6→11 expandido (derecho tributario constitucional + defensa + planificación)
- Protocolo de Control Tributario ARGI v3.7.0

**MCPs activos:** `infoleg_mcp` + `arca_mcp`  
**Web search:** Boletín Oficial + ATP Formosa + CSJN + InfoLEG (fallback)

### 4.2 SKILL contable

**Módulos activos:**
- Sub-1: Contabilidad Básica/Financiera
- Sub-2: Análisis de Estados Contables
- Sub-3: Sistemas Contables
- Sub-4: Teoría Contable
- Sub-5: Teoría y Técnica Impositiva
- RT 54 (NUA) + Res. JG 660/26 (dispensa exposición)
- RT 55 (sindicatura) · RT 57 · RT 60 (sostenibilidad) · RT 37 mod. RT 53
- Auditoría externa · sindicatura societaria

**MCPs activos:** `infoleg_mcp`  
**Web search:** FACPCE + BO

### 4.3 SKILL laboral

**Módulos activos:**
- Liquidación de sueldos · cargas sociales · F.931 · SIPA
- Ley 27.802 (recibos itemizados, vigente marzo 2026)
- CCT por sector · Derecho Laboral · SAC · horas extras
- Contribuciones patronales · ART

**MCPs activos:** `arca_mcp` (vencimientos F.931)  
**Web search:** MTEySS + ANSES + BO + SMVM

### 4.4 SKILL societario

**Módulos activos:**
- SRL · SA · SAS · constitución · modificación · disolución
- Balances · ajuste por inflación (RT 6 / Ley 27.468)
- Derecho concursal · peritajes (Art. 13 Ley 20.488)
- Responsabilidad de socios y directores · Ley 27.401

**MCPs activos:** `infoleg_mcp`  
**Web search:** IGJ + BO + Registro Público

---

## 5. MCPs

### 5.1 infoleg-mcp

**Base URL:** `https://servicios.infoleg.gob.ar/infoleg-internet/api/`  
**Stack:** TypeScript + Node.js (Bun runtime)  
**Herramientas expuestas:**

| Herramienta | Parámetros | Respuesta |
|---|---|---|
| `buscar_norma` | query, organismo?, solo_vigentes? | id, título, fecha, URL |
| `obtener_norma` | id | texto completo, artículos |
| `buscar_por_numero` | tipo, numero, anio | norma exacta |

**Ventaja de token:** respuesta JSON estructurada vs. HTML completo de web search.

### 5.2 arca-mcp

**Endpoints públicos** (sin certificado digital):  
**Stack:** TypeScript + Node.js (Bun runtime)  
**Herramientas expuestas:**

| Herramienta | Parámetros | Respuesta |
|---|---|---|
| `consultar_contribuyente` | cuit | nombre, estado, actividades, domicilio |
| `obtener_vencimientos` | periodo? (AAAAMM) | tabla vencimientos |
| `verificar_constancia` | cuit | constancia de inscripción vigente |

**Nota:** operaciones que requieren certificado digital (WSAA) quedan fuera del scope. El usuario las ejecuta directamente en el portal ARCA.

---

## 6. Base de normativas (Google Drive Desktop — estructura real)

### Ruta base

```
{DRIVE}:\Mi unidad\NORMATIVAS IMPOSITIVAS\
```

La letra del disco varía según el equipo (Drive Desktop asigna la próxima disponible).  
La cuenta es: `bg.impositivo@gmail.com`

### Resolución dinámica de letra de disco

El plugin incluye un script de auto-discovery que se ejecuta una sola vez en primer uso:

```powershell
# discover-drive.ps1
$base = Get-PSDrive -PSProvider FileSystem |
  Where-Object { Test-Path "$($_.Root)Mi unidad\NORMATIVAS IMPOSITIVAS" } |
  Select-Object -First 1 -ExpandProperty Root
if ($base) {
    $env:ARGI_BASE = "${base}Mi unidad\NORMATIVAS IMPOSITIVAS"
    $base | Set-Content ".\.argi-path"   # cache local para sesiones futuras
} else {
    Write-Error "No se encontró la carpeta NORMATIVAS IMPOSITIVAS en ningún disco"
}
```

En sesiones posteriores: leer `.argi-path` (1 línea, instantáneo). Si el disco cambia, el script vuelve a correr y actualiza el cache.

Los skills usan siempre `$ARGI_BASE` o el contenido de `.argi-path`, nunca letra hardcodeada.

### Estructura real de la base (no modificar, ya está optimizada)

```
$ARGI_BASE\
├── 00_INDICE_GENERAL.md                         ← índice maestro de toda la base
├── 00_INDICES_Y_MEMORIA\APS_REFERENCIA\
│   ├── 00_INDICE_NORMATIVO.md                   ← índice operativo por cliente APS
│   └── MEMORIA_FINAL_NORMATIVAS_APS.md
├── 01_LEGISLACION_NACIONAL\                     ← [impositivo]
│   ├── 01_CONSTITUCIONAL_Y_PROCEDIMIENTO\       (CN, Ley 11.683)
│   ├── 02_IVA\
│   ├── 03_GANANCIAS\
│   ├── 04_MONOTRIBUTO\                          (12 archivos MD cronológicos)
│   └── 05_OTROS_IMPUESTOS\
├── 02_LEGISLACION_PROVINCIAL_FORMOSA\           ← [impositivo]
│   ├── 01_CODIGO_FISCAL_Y_LEY_IMPOSITIVA\
│   └── 02_IIBB_RETENCIONES_PERCEPCIONES\
├── 03_LEGISLACION_MUNICIPAL_FORMOSA\            ← [impositivo]
│   ├── 01_CODIGO_TRIBUTARIO\
│   └── 02_CODIGO_TARIFARIO\
├── 04_DOCTRINA\                                 (reservado, pendiente)
├── 05_JURISPRUDENCIA\                           (reservado, pendiente)
├── 06_DERECHO_TRIBUTARIO\                       ← [impositivo + societario]
├── 07_POR_SUJETO\
│   ├── 04_EMPLEADORES_AGENTES_RETENCION\        ← [laboral] LCT, CCT UTEDYC, SIPA, ART
│   └── 05_ENTIDADES_CIVILES\                    ← [societario] CCyC asociaciones
├── 08_POR_OBJETO\                               (mapa cross-skill)
├── 09_NORMAS_CONTABLES_PROFESIONALES\           ← [contable]
│   └── 01_FACPCE_RT_RESOLUCIONES\              (RT54, RT53, Res JG 608, 660)
├── 11_CONTABILIDAD_AUDITORIA\                   ← [contable]
│   └── 03_AUDITORIA_Y_CONTROL\
├── 12_LABORAL_PREVISIONAL\                      ← [laboral]
│   └── 04_GUIAS_OPERATIVAS\                    (F.931 guía operativa)
├── 90_INDICES_CONTEXTUALES\
│   ├── 00_MANIFIESTO_SUPERBASE.md
│   ├── 01_MATRIZ_PROFUNDIZACION.md              ← navegación por área (carga liviana)
│   └── 02_MAPA_REFERENCIAS_CRUZADAS.md
├── 91_INVENTARIO_Y_TRAZABILIDAD\
│   └── 00_RESUMEN_INVENTARIO.md
├── 92_PENDIENTES_DE_PROFUNDIZACION\
│   └── 00_PENDIENTES_PRIORIZADOS.md
├── 93_ARGI_CONTEXT_PACK\                        ← PUNTO DE ENTRADA PRINCIPAL
│   ├── 00_ARGI_LECTURA_RAPIDA.md               ← carga siempre (~150 tokens)
│   ├── 01_TAXONOMIA_ARGI.md
│   ├── 02_PROMPT_CONTEXTUAL_ARGI.md
│   └── 03_BRECHAS_ARGI.md
├── 94_FICHAS_TEMATICAS\                         ← LECTURA BAJO DEMANDA
│   ├── 00_PLANTILLAS\plantilla_ficha.md
│   ├── 01_TRIBUTARIO_NACIONAL\                  (fichas IVA, Ganancias, Monotributo, etc.)
│   └── 02_FORMOSA_PROVINCIAL\                  (fichas ATP, IIBB, CF Formosa)
└── 99_FUENTES_LOCALES_APS\
    ├── 01_EECC_PAPELES_TRABAJO\                 ← [contable] Excel papeles de trabajo
    └── 02_SUELDOS_NORMATIVA_ORIGINAL\           ← [laboral] Excel sueldos mensuales
```

### Mapeo skills ↔ carpetas de la base

| Skill | Carpetas primarias | Fichas rápidas |
|---|---|---|
| impositivo | `01_`, `02_`, `03_`, `06_` | `94_FICHAS_TEMATICAS\01_TRIBUTARIO_NACIONAL\`, `\02_FORMOSA_PROVINCIAL\` |
| contable | `09_`, `11_`, `99_\01_EECC` | — |
| laboral | `07_\04_EMPLEADORES`, `12_`, `99_\02_SUELDOS` | — |
| societario | `07_\05_ENTIDADES_CIVILES`, `10_DERECHO_SOCIETARIO` | — |

### Flujo de lectura bajo demanda (sin cambios al diseño general)

```
Consulta específica
→ Skill carga: 93_ARGI_CONTEXT_PACK\00_ARGI_LECTURA_RAPIDA.md (~150 t) — siempre
→ Skill carga: 90_INDICES_CONTEXTUALES\01_MATRIZ_PROFUNDIZACION.md (~80 t) — siempre
→ Si necesita norma: busca ficha en 94_FICHAS_TEMATICAS\ primero (~300 t)
→ Si la ficha no alcanza: lee archivo completo desde su carpeta (~400-800 t)
→ Nunca carga carpeta entera
```

### Regla importante

**No se crea ni mueve ningún archivo en la base.** La estructura existente es la fuente de verdad. Solo se agregan fichas nuevas en `94_FICHAS_TEMATICAS\` cuando se analiza una norma nueva.

---

## 7. Sistema de memoria progresiva

### Estructura por skill

```
skills/{area}/memory/
├── plantillas.md       ← Excel y planillas conocidas
├── clientes.md         ← instrucciones por cliente recurrente (si aplica)
└── preferencias.md     ← formato, nivel técnico, vocabulario del estudio
```

### Triggers de escritura automática

El skill detecta y guarda sin que el usuario lo pida explícitamente:
- Frases: "recordá que...", "siempre que...", "para este cliente...", "esta planilla tiene..."
- Correcciones repetidas al mismo punto (2+ veces → se guarda)
- Instrucciones sobre estructura de Excel al trabajar con planillas

### Carga y compactación

- Se carga automáticamente después de core e índice
- Budget máximo: **300 tokens** de memoria por sesión
- Si supera 300 tokens → compactar automáticamente manteniendo instrucciones más recientes y más frecuentes
- Prefijo en cada entrada: `[AAAA-MM-DD]` para poder purgar entradas viejas

---

## 8. Presupuesto de tokens por sesión

| Componente | Tokens aprox. | Cuándo |
|---|---|---|
| argi-core.md | ~500 | Siempre |
| SKILL.md del área | ~300 | Siempre |
| `93_ARGI_CONTEXT_PACK\00_ARGI_LECTURA_RAPIDA.md` | ~150 | Siempre |
| `90_INDICES_CONTEXTUALES\01_MATRIZ_PROFUNDIZACION.md` | ~80 | Siempre |
| memory/ (compactada, ≤300t) | ~200 | Siempre |
| **Base total** | **~1.230** | **fijos** |
| Ficha temática bajo demanda | ~300 | Solo si aplica |
| Norma completa bajo demanda | ~400–800 | Solo si aplica |
| MCP response JSON (InfoLEG/ARCA) | ~200–400 | Solo si aplica |
| **ARGI v3.7.0 monolítico (referencia)** | **~2.800** | **siempre (fijos)** |

**Ahorro en contexto base: ~56% menos tokens.**  
Los archivos de normas, fichas temáticas y respuestas MCP solo entran en contexto cuando la consulta los requiere.

---

## 9. plugin.json (estructura)

```json
{
  "name": "argi",
  "version": "4.0.0",
  "description": "Asesor fiscal, contable, laboral y societario argentino — plugin modular con MCPs",
  "skills": [
    { "name": "impositivo", "path": "skills/impositivo" },
    { "name": "contable",   "path": "skills/contable" },
    { "name": "laboral",    "path": "skills/laboral" },
    { "name": "societario", "path": "skills/societario" }
  ],
  "mcpServers": ["infoleg-mcp", "arca-mcp"]
}
```

---

## 10. Decisiones de diseño

| Decisión | Opción elegida | Razón |
|---|---|---|
| Arquitectura | Núcleo compartido + skills modulares | Sin duplicación, mantenimiento centralizado |
| Conectores | Híbrido API + web search | APIs donde existen (JSON < HTML), web search para el resto |
| Normativas | Índice en plugin + archivos en Drive bajo demanda | 60% menos tokens de contexto base |
| Memoria | Progresiva, se aprende durante el uso | Sin pre-configuración, crece con el uso real |
| Drive access | Filesystem local (Drive Desktop) | Sin MCP extra, funciona offline |
| Stack MCPs | TypeScript + Bun | Consistente con ecosistema Claude plugins |

---

## 11. Fuera de scope (v4.0.0)

- WSAA (web services ARCA con certificado digital) — requiere infraestructura de auth
- MCP FACPCE — sin API pública documentada
- MCP Boletín Oficial — sin API limpia
- UI web propia — el plugin funciona en Claude Code CLI y Claude.ai web nativamente
- Multi-usuario / multi-estudio — diseñado para uso individual del estudio

---

## 12. Fases de implementación sugeridas

1. **Fase 1 — Plugin base:** argi-core.md + 4 skills + plugin.json + estructura Drive + memoria
2. **Fase 2 — MCP InfoLEG:** server TypeScript + integración en skills impositivo y societario
3. **Fase 3 — MCP ARCA:** server TypeScript + integración en skills impositivo y laboral
4. **Fase 4 — Poblado de normativas:** migrar contenido actual a estructura Drive optimizada

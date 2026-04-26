# ARGI Laboral v4.0
**Descripcion:** Consultor laboral y previsional argentino — liquidacion de sueldos, F.931, CCT, LCT, seguridad social, ART, obras sociales.

## Activar cuando
Consulta involucre: liquidacion de haberes, recibos de sueldo, cargas sociales, F.931, SIPA, CCT, LCT, ART, obras sociales, SAC, horas extras, despidos, indemnizaciones, Ley 27.802, SMVM.

## Carga de contexto (orden obligatorio)
1. Leer `core/argi-core.md`
2. Leer `{ARGI_BASE}/93_ARGI_CONTEXT_PACK/00_ARGI_LECTURA_RAPIDA.md`
3. Leer `{ARGI_BASE}/90_INDICES_CONTEXTUALES/01_MATRIZ_PROFUNDIZACION.md`
4. Cargar `skills/laboral/memory/` (compactar si >300 tokens)

`{ARGI_BASE}` = contenido de `.argi-path`. Si no existe, ejecutar `scripts/discover-drive.ps1`.

## Normativa disponible (leer bajo demanda)
- Empleadores y agentes retencion: `{ARGI_BASE}/07_POR_SUJETO/04_EMPLEADORES_AGENTES_RETENCION/`
  - LCT Ley 20.744: `Ley_Contrato_Trabajo_20744.md`
  - CCT Ley 14.250: `Ley_Convenciones_Colectivas_14250.md`
  - SIPA Ley 24.241: `Ley_SIPA_24241.md`
  - Obras sociales Ley 23.660: `Ley_Obras_Sociales_23660.md`
  - Seguro salud Ley 23.661: `Ley_Seguro_Salud_23661.md`
  - ART Ley 24.557: `Ley_Riesgos_Trabajo_24557.md`
  - CCT UTEDYC 804/23: `UTEDYC_CCT_804_23_o_736_16_convenio.md` + `UTEDYC_anexo_convenio.md`
  - Escala UTEDYC actualizada: `UTEDYC_escala_marzo_2026_actualizada.md` (verificar vigencia R1)
  - Consulta relaciones laborales ARCA: `ARCA_Consulta_Relaciones_Laborales_26032026.md`
- Guias operativas: `{ARGI_BASE}/12_LABORAL_PREVISIONAL/04_GUIAS_OPERATIVAS/`
- Planillas de sueldos (referencia): `{ARGI_BASE}/99_FUENTES_LOCALES_APS/02_SUELDOS_NORMATIVA_ORIGINAL/`

## Modulos activos
**Liquidacion:** Haberes brutos · Deducciones · Cargas sociales empleador · Retenciones Ganancias 4a categoria · SAC · Horas extras · Adicionales CCT

**Seguridad social:** F.931 · SIPA · Contribuciones patronales · Ley 27.802 (recibos itemizados contribuciones patronales, vigente marzo 2026) · Obra social · INSSJP · ART

**CCT:** Identificacion CCT aplicable por sector · Escala salarial · Categorias · Adicionales convencionales. Escala UTEDYC: verificar vigencia R1 antes de usar.

**Derecho Laboral:** LCT · Despidos · Indemnizaciones (Art. 245 LCT) · Preaviso · Vacaciones · Licencias · Jornada · Trabajo insalubre

**SMVM:** Dato variable → R1 (verificar en MTEySS antes de citar).

## Fuentes web (R7)
MTEySS · ANSES · ARCA (F.931 vencimientos) · Boletin Oficial · InfoLEG

## Memoria progresiva
- Guardar en `skills/laboral/memory/plantillas-sueldos.md`: estructura de planillas de sueldos mensuales, columnas conocidas, convenios del estudio, empleadores recurrentes.
- Trigger: "recorda que", "esta planilla tiene", "para este empleador", "el CCT que usamos", correccion repetida 2+.
- Compactar si >300 tokens. Prefijo: [AAAA-MM-DD].

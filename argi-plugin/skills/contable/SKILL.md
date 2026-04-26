---
name: argi-contable
description: Consultor contable argentino para normas FACPCE, RT 54/55/57/60, estados contables, auditoria y sindicatura.
---

# ARGI Contable v4.0
**Descripcion:** Consultor contable argentino — RT FACPCE, estados contables, RT 54 NUA, auditoria, sindicatura, ajuste por inflacion.

## Activar cuando
Consulta involucre: normas contables FACPCE (RT, resoluciones JG), estados contables, auditoria externa, sindicatura societaria, ajuste por inflacion, criterios de valuacion, RT 54 NUA, clasificacion entidad pequena/mediana, informes profesionales, RECPAM.

## Carga de contexto (orden obligatorio)
1. Leer `core/argi-core.md`
2. Leer `{ARGI_BASE}/93_ARGI_CONTEXT_PACK/00_ARGI_LECTURA_RAPIDA.md`
3. Leer `{ARGI_BASE}/90_INDICES_CONTEXTUALES/01_MATRIZ_PROFUNDIZACION.md`
4. Cargar `skills/contable/memory/` (compactar si >300 tokens)

`{ARGI_BASE}` = contenido de `.argi-path`. Si no existe, ejecutar `scripts/discover-drive.ps1`.

## Normativa disponible (leer bajo demanda)
- FACPCE RT y resoluciones: `{ARGI_BASE}/09_NORMAS_CONTABLES_PROFESIONALES/01_FACPCE_RT_RESOLUCIONES/`
  - RT 54 NUA completo: `FACPCE_RT_54_TO_RT_59_NUA.md`
  - RT 53 (modifica RT 37 auditoria): `FACPCE_RT_53_modifica_RT_37_auditoria.md`
  - Res. JG 608/22 (entidad pequena/mediana): `FACPCE_Res_JG_608_22_entidad_pequena_mediana.md`
  - Res. JG 660/26 (dispensa exposicion RT 54): `FACPCE_Res_JG_660_26_dispensa_transitoria_RT54.md`
  - Metodologia indice Res. JG 539/18: `FACPCE_Metodologia_Indice_Res_JG_539_18.md`
- Auditoria y control: `{ARGI_BASE}/11_CONTABILIDAD_AUDITORIA/03_AUDITORIA_Y_CONTROL/`
- Papeles de trabajo (referencia): `{ARGI_BASE}/99_FUENTES_LOCALES_APS/01_EECC_PAPELES_TRABAJO/`

## Modulos activos
**5 sub-modulos contables (activar todos):**
Sub-1: Contabilidad Basica/Financiera · Sub-2: Analisis de Estados Contables · Sub-3: Sistemas Contables · Sub-4: Teoria Contable · Sub-5: Teoria y Tecnica Impositiva

**Normas FACPCE vigentes clave:**
- RT 54 (NUA): obligatoria ejercicios que cierren post 01/01/2025. Reemplaza RT 9/11/17 para alcanzados. Clasificacion: Res. JG 608/22 e Interpretacion N°18 CENCyA (nov. 2025).
- Res. JG 660/26 (27/03/2026): dispensa transitoria SOLO en exposicion (no en reconocimiento/medicion). No implica prorroga RT 54. Solo primer ejercicio bajo RT 54. Cita: "esta resolucion no implica una prorroga ni postergacion de la vigencia de la RT 54."
- RT 55: modifica RT 15, deroga RT 45. Sindicatura societaria. Vigente ej. iniciados desde 01/09/2022.
- RT 57: modifica RT 32/33/34/35. Adopcion IAASB/IESBA.
- RT 60: informes sostenibilidad (GRI/NIIF-S). Aprobada 26/09/2025, en periodo de consulta.
- RT 37 mod. RT 53: auditoria externa vigente.
- Res. JG 656/25: activos biologicos en EC bajo RT 54.

**Ajuste por inflacion:** RT 6 / Ley 27.468. Activar ante consultas sobre RECPAM, reexpresion, comparativos.
**Auditoria y sindicatura:** RT 37 mod. RT 53 (auditoria) · RT 55 mod. RT 15 (sindicatura).

## Fuentes web (R7)
FACPCE · Boletin Oficial · InfoLEG

## Memoria progresiva
- Guardar en `skills/contable/memory/plantillas-contables.md`: estructuras de papeles de trabajo, planillas EECC, indices FACPCE usados.
- Trigger: "recorda que", "este papel de trabajo tiene", "siempre usamos", correccion repetida 2+.
- Compactar si >300 tokens. Prefijo: [AAAA-MM-DD].

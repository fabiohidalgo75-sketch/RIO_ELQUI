# Integración con el Proyecto de Título

ElquiAlerta (Innovación III) **consume** los productos del Proyecto de Título "Caracterización geomática y análisis territorial del río Elqui en la comuna de Vicuña" (Cap. 2, 22-10-2026). La tesis declara que no hace modelación hidráulica ni escenarios de inundación; esa parte es la de Innovación III.

```
Título:      LE-12 (DOH) → Base PPK + PC1–PC7 → vuelo UAV-PPK → MDT + ortomosaico + geodatabase
                                                                   │
Innovación III:                       HEC-RAS / Iber 2D  ◄─────────┘  (+ batimetría del lecho, pendiente)
                                            │
ElquiAlerta:  FloodZone por T → BlockExposure por manzana → alerta por hogar → confirmaciones → brigadas
```

## Qué dato del Título alimenta qué tabla

| Dato del Título | Valor real | Dónde entra en ElquiAlerta |
|---|---|---|
| Tramo levantado | Puente Fiscal Vicuña → puente Ruta 41, ~1,43 km² | Extensión de `sectors` y `blocks` |
| Referencia | Monolito DOH LE-12, WGS 84 / UTM 19S (EPSG:32719) | Transformar a EPSG:4326 al importar (`POST /blocks/import`) |
| MDT | Vuelo con GSD ≈ 2,9 cm/px; MDT de Metashape con píxel de 11,3 cm (≈ 4 × GSD); clasificado con Classify LAS Ground (Conservative) | Insumo del modelo HEC-RAS que genera `flood_zones` |
| Ortofoto y curvas | Ortofoto a 5 cm; curvas de nivel cada 0,30 m | Rugosidad de Manning por cobertura; revisión visual de manzanas |
| Derivados del MDT | Pendiente reclasificada (4 clases), red de drenaje por método HAND y 9 unidades geomorfológicas (altura HAND × pendiente) | Apoyo para delimitar cauce activo, llanura de inundación y terrazas antes de la modelación |
| Población por manzana | Censo 2024, atributo `n_per` (ej. Marquesa 56, El Arrayán 22, Vicuña Sur 1.148) | `blocks.population` |
| Red vial | Ruta 41-CH, D-463, D-465, D-367, D-287 | Capa de rutas de evacuación (`evacuation_routes`) |
| Personas expuestas (comuna) | ~5.000 (Plan Comunal RRD Vicuña 2023–2025) | Indicador de cobertura del sistema |
| Calidad | RMS 1–3 mm, reproyección 1,21 px, traslape frontal 70 % | `flood_scenarios.validated = false` hasta validar |

## Pendientes que bloquean usar los datos reales

1. **Lecho sumergido:** la fotogrametría no lo registra (FODA del Título). Los perfiles transversales del MDT lo confirman: donde la ortofoto ve agua, el perfil queda plano porque mide la superficie del agua. HEC-RAS necesita el fondo. Sin él, los escenarios de `flood_scenarios` no son confiables.
2. **Sistema de referencia único:** el levantamiento usa EPSG:32719 y los estudios del Cap. 1–2 usan EPSG:20049 (SIRGAS-Chile). Elegir uno y documentar la transformación.
3. **Exactitud externa del MDT:** faltan puntos de chequeo independientes.
4. **Importador de zonas inundables:** convertir los rásters de profundidad de HEC-RAS (exportados desde RAS Mapper) a polígonos por clase (`D0_05`, `D05_15`, `D15_PLUS`).

Vista completa del encaje y de los productos (sombreado, curvas, ortofoto, perfiles y derivados): `../../04_Presentacion_Web/index.html#productos`. Primera versión: `../../03_Integracion_Titulo/elqui-titulo-innovacion.html`.

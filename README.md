# Innovacion_EVA3

Desarrollo de prototipo final, un plan innovador de advertencia privada para usuarios capacitados en su análisis.

Entrega de **Innovación III**: alerta temprana de crecidas del río Elqui **por manzana** en Vicuña, enriquecida con los datos del Proyecto de Título (levantamiento GNSS + vuelo UAV-PPK → MDT).

## Empieza aquí

Abre **`04_Presentacion_Web/index.html`** en el navegador (doble clic). Funciona sin servidor y sin internet.

| Carpeta | Qué es |
|---|---|
| `04_Presentacion_Web/` | **Página principal.** Cadena Título → Innovación III, matriz de encaje (12 hallazgos), 5 claves de evaluación técnica y económica con calculadoras, costo por persona expuesta. Datos en `datos/datos.js`; decisiones de diseño en `docs/`. Trae copias de las otras carpetas en `anexos/`. |
| `01_Pagina_Conceptos_Clave/` | Los 5 conceptos clave del curso, con texto extraído de las Fichas 1–12. |
| `02_ElquiAlerta/` | Arquitectura (NestJS + Prisma/PostGIS + BullMQ + Socket.io, Angular, Expo) y prototipo interactivo en `apps/admin/prototype/index.html`. |
| `03_Integracion_Titulo/` | Primeras versiones de la página de integración (respaldo). |

## Cómo se relacionan

```
Proyecto de Título
  levantamiento GNSS + UAV → MDT + geodatabase
          │  (traspaso; falta el lecho sumergido)
          ▼
Innovación III
  modelación HEC-RAS 2D → manzanas expuestas → ElquiAlerta
```

## Advertencias

- Trabajo académico. Los mapas y esquemas **no son cartografía oficial** ni delimitan zonas inundables.
- Los valores marcados **EJEMPLO** en los presupuestos son supuestos, no cotizaciones.
- `02_ElquiAlerta` compila, pero no se ha probado contra una base PostGIS real. Los `.env.example` solo traen valores de ejemplo.
- La arquitectura de ElquiAlerta se basó en *EcoPoint*, un proyecto de otro estudiante que no se incluye en este repositorio; `02_ElquiAlerta/docs/01_ANALISIS_ECOPOINT.md` describe qué se tomó y qué se mejoró.

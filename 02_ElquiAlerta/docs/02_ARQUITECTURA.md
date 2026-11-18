# Arquitectura de ElquiAlerta

## 1. Problema que resuelve

Las fichas del curso muestran tres brechas (Ficha 9):

- **Alertas abstractas**: se avisa por umbral de caudal, no por manzana afectada.
- **Vacío cartográfico local**: no hay topografía de detalle para saber qué se inunda.
- **Brecha de comunicación**: señalética y avisos no dicen al vecino qué hacer.

ElquiAlerta une el modelo hidráulico (topografía + HEC-RAS 2D + ArcGIS Pro) con una red de alerta por manzana, con confirmación de doble vía.

## 2. Flujo principal

```
Estación hidrométrica registra caudal
        ↓
Worker hydro-threshold compara con umbrales  ──→  socket "hydro:reading" → dashboard
        ↓ (supera umbral)
Se elige el escenario HEC-RAS más cercano (T = 10 / 50 / 100)
        ↓
Se cruzan manzanas × zona inundable (BlockExposure precalculado en PostGIS)
        ↓
AlertEvent creado (AUTO) → el operador lo confirma o lo ajusta en el dashboard
        ↓
Cola alert-dispatch: un mensaje POR VECINO con
  · profundidad estimada en su manzana
  · ruta de evacuación de su sector
  · albergue asignado y cupos libres
        ↓
Vecino responde: "Estoy a salvo" | "Necesito ayuda"
        ↓
Sin respuesta en 15 min + movilidad reducida → lista prioritaria de brigadas
        ↓
Brigadista atiende (Inspection) → dashboard se actualiza en tiempo real
        ↓
Operador cierra la alerta → resumen del evento (personas confirmadas, atenciones, reportes)
```

## 3. Roles

| Rol | App | Vista principal |
|---|---|---|
| `RESIDENT` (vecino) | móvil | Estado de **mi manzana**, botón "Reportar", ruta a mi albergue, checklist de preparación. |
| `BRIGADIST` (brigadista) | móvil | Mapa completo con reportes y personas que pidieron ayuda; *bottom sheet* con detalle y "Trazar ruta". |
| `OPERATOR` (centro de monitoreo) | web | Dashboard: caudal en vivo, nivel de alerta, mapa por escenario, manzanas expuestas, reportes, albergues, emisor de alertas. |

## 4. Módulos de la API (NestJS)

```
apps/api/src/
├── auth/              JWT + refresh (de EcoPoint; registro asigna manzana)   ✔ portado
├── residents/         vecinos y su vivienda/manzana          (≈ users)          ✔ portado
├── brigadists/        brigadas e institución                 (≈ collectors)     ✔ portado
├── operators/         centro de monitoreo                    (≈ admins)         ✔ portado
├── blocks/            manzanas y sectores (PostGIS)          (≈ points)         ✔ portado
├── flood-scenarios/   escenarios HEC-RAS y exposición de manzanas   NUEVO       ✔ implementado
├── hydrology/         estaciones, lecturas y umbrales                NUEVO       ✔ implementado
├── alerts/            eventos de alerta, envío y confirmaciones      NUEVO       ✔ implementado
├── evacuation/        albergues y rutas                              NUEVO       ✔ portado
├── reports/           reportes ciudadanos con foto y ubicación (mejorado) ✔ implementado
├── inspections/       atenciones de brigadas                 (≈ collections)    ✔ portado
├── preparedness/      checklist y avance por sector          (≈ gamification)   ✔ portado
├── notifications/     push Expo + SMS de respaldo                                ✔ portado
├── storage/           fotos en MinIO (copiado de EcoPoint)                       ✔ copiado
├── gateway/           Socket.io por rooms (mejorado: CORS restringido)           ✔ implementado
├── workers/           hydro-threshold, alert-dispatch, ack-timeout, report-escalation, notification ✔
├── common/ config/ prisma/   infraestructura (copiado de EcoPoint)               ✔ copiado
```

Verificación (17-11-2026): `tsc` sin errores en API, tipos compartidos y seed; `prisma generate` valida el esquema; al arrancar, los 17 módulos se inicializan y se mapean 60 rutas. No se ha probado contra una base de datos real.

## 5. Modelo de datos

Ver `apps/api/prisma/schema.prisma`. Las entidades centrales:

```
Sector 1─* Block 1─* Resident
Block *─* FloodScenario   (vía BlockExposure: maxDepthM, meanDepthM, wetAreaPct)
FloodScenario 1─* FloodZone (MultiPolygon por clase de profundidad)
HydroStation 1─* HydroReading
AlertEvent 1─* AlertDelivery *─1 Resident   (deliveredAt, ackStatus, ackAt)
Sector 1─* EvacuationRoute *─1 Shelter
Report *─1 Resident | Brigadist ;  Report 1─* Inspection
InfrastructureAsset (gavión, defensa, puente…) con estado
```

Consulta clave (manzanas expuestas en un escenario):

```sql
SELECT b.code, s.name AS sector, e.max_depth_m, b.population
FROM block_exposures e
JOIN blocks b  ON b.id = e.block_id
JOIN sectors s ON s.id = b.sector_id
WHERE e.scenario_id = $1 AND e.max_depth_m > 0.05
ORDER BY e.max_depth_m DESC;
```

`BlockExposure` se recalcula con `ST_Intersection(block.geom, zone.geom)` cada vez que se importa un escenario nuevo desde ArcGIS Pro (GeoJSON o shapefile convertido).

## 6. Niveles de alerta

Se usan los nombres de SENAPRED para que el vecino reconozca el mensaje:

| Nivel | Disparador (ejemplo, configurable por estación) | Escenario asociado |
|---|---|---|
| Normal | caudal < umbral preventivo | — |
| Alerta Temprana Preventiva | caudal ≥ umbral preventivo | T = 10 |
| Alerta Amarilla | caudal ≥ umbral amarillo | T = 50 |
| Alerta Roja | caudal ≥ umbral rojo o decisión del operador | T = 100 |

Los valores de umbral del prototipo son ilustrativos. En producción los define la DGA / SENAPRED.

## 7. Infraestructura

Igual que EcoPoint (`compose.yaml`): PostGIS, Redis, MinIO, con versiones fijas. Ver `docs/infra.md`.

## 8. Aspecto legal (Ficha 7)

Los mapas de un escenario académico **no son delimitaciones oficiales**. Por eso `FloodScenario.validated` parte en `false`, y el dashboard muestra "Escenario no validado" hasta que un organismo competente lo apruebe.

## 03_PENDIENTES

1. Levantar la infraestructura (`docker compose up -d`), correr `pnpm db:migrate` y `pnpm db:seed`, y probar los endpoints contra PostGIS real.
2. Importar las manzanas reales desde ArcGIS Pro (`POST /api/v1/blocks/import`) y las zonas inundables de cada escenario (importador de `FloodZone` aún no escrito).
3. Elegir el proveedor SMS de respaldo (hoy, sin proveedor, el SMS se registra en el log).
4. Apps reales: `apps/admin` (Angular) y `apps/mobile` (Expo) a partir del prototipo en `apps/admin/prototype/`.
5. Pruebas automatizadas (EcoPoint tampoco las tenía).

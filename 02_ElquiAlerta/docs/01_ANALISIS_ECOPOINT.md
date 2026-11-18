# Análisis de EcoPoint

Revisión de la carpeta `../EcoPoint` (no se modificó nada en ella). EcoPoint es una red colaborativa de reciclaje: vecinos publican un punto con material, recolectores lo retiran y un administrador supervisa todo desde un panel.

## 1. Qué contiene

```
EcoPoint/
├── apps/
│   ├── api/        NestJS 10 + Prisma 5 + PostGIS  (único módulo con código: ~2.700 líneas TS)
│   ├── admin/      Angular 18 + Tailwind           (solo package.json)
│   └── mobile/     Expo 50 + React Native + maps   (solo package.json)
├── packages/shared-types/   enums compartidos (Role, PointStatus, Report*)
├── Context/        DESIGN.md (design system Stitch/MD3) + 3 capturas
├── docs/infra.md   cómo levantar Postgres, Redis y MinIO con Docker
├── compose.yaml    postgis 16-3.4, redis 7, minio + job de bucket
└── README.md       roles, flujos, pantallas, stack, alcance del MVP
```

## 2. Arquitectura (lo que está bien hecho y se copia)

| Pieza | Cómo lo resuelve EcoPoint | Por qué sirve para nuestro tema |
|---|---|---|
| **Monorepo pnpm** | `apps/*` + `packages/*`, scripts raíz (`api:dev`, `db:migrate`, `infra:up`) | Un solo repo para API, panel y app. Tipos compartidos sin duplicar. |
| **3 roles con JWT** | `RECYCLER`, `COLLECTOR`, `ADMIN`; guards por rol; access + refresh token hasheado | Se traduce 1 a 1: vecino, brigadista, operador del centro de monitoreo. |
| **Módulos NestJS desacoplados** | Un módulo por dominio (points, collections, reports, gamification…) | Permite agregar módulos de hidrología y escenarios sin tocar el resto. |
| **PostGIS** | `ST_DWithin` + `ST_Distance` para puntos cercanos, índice GIST | Base de todo análisis de manzanas, zonas inundables y rutas. |
| **Tiempo real** | Socket.io con *rooms* por rol (`collectors`, `admins`, `user:{id}`) y adaptador Redis | El centro de monitoreo y las brigadas necesitan ver la crecida en vivo. |
| **Colas BullMQ** | Workers de notificaciones, gamificación y alertas de reportes | Enviar miles de alertas personalizadas sin bloquear la API. |
| **Regla automática** | 3+ reportes "no llegó" → prioridad CRÍTICA | Mismo patrón para escalar reportes ciudadanos (ej. 3 reportes de desborde en un sector). |
| **Almacenamiento S3 (MinIO)** | Fotos adjuntas a reportes | Fotos de terreno georreferenciadas (Ficha 1 y 3 lo exigen). |
| **Design system escrito** | `DESIGN.md` con tokens MD3, tipografía y componentes | Se reutiliza la estructura de tokens, cambiando la paleta al mundo del agua y el riesgo. |
| **Pantallas por rol** | Admin: métricas + reportes + salud del sistema. Reciclador: mapa a media pantalla + FAB. Recolector: mapa completo + *bottom sheet* + "Trazar ruta". | Las tres vistas se mantienen; cambia el contenido. |

## 3. Problemas encontrados (y cómo los mejora ElquiAlerta)

| # | Hallazgo en EcoPoint | Evidencia | Mejora aplicada |
|---|---|---|---|
| 1 | El README promete PostGIS con columnas `GEOMETRY`, pero el esquema guarda `latitude`/`longitude` como `Float`. | `prisma/schema.prisma`, modelo `RecyclingPoint` | Columnas `geometry` reales (Point, Polygon, MultiPolygon, LineString). Las zonas inundables son polígonos y no caben en dos floats. |
| 2 | `Report.reporterId` no tiene relación (FK); sirve para usuario o recolector indistintamente. | modelo `Report` | Dos FK opcionales (`residentId`, `brigadistId`) con relaciones reales e integridad referencial. |
| 3 | `RefreshToken.role` es `String` libre. | modelo `RefreshToken` | Usa el enum `Role`. |
| 4 | Al activar un punto solo se emite por socket: un recolector con la app cerrada no se entera. La cola `notifications` se registra pero no se usa ahí. | `points.service.ts → activate()` | Toda alerta pasa por la cola `alert-dispatch` (push + SMS de respaldo) además del socket. |
| 5 | El README dice "Panel Admin (Next.js)" pero `apps/admin` es Angular. | `README.md` vs `apps/admin/package.json` | Una sola decisión documentada (Angular 18, igual que el original). |
| 6 | El README lista un módulo `routes/` que no existe. | `README.md` vs `src/` | Módulo `evacuation` real: rutas y albergues. |
| 7 | `.env.example` usa `PORT=3001`; la documentación dice 3000. | `.env.example` vs `docs/infra.md` | Puerto único 3000 en todos los archivos. |
| 8 | Imagen `minio:latest` sin versión fija. | `compose.yaml` | Imágenes con versión fija. |
| 9 | El gateway acepta CORS `origin: '*'` aunque la API REST restringe orígenes. | `gateway/app.gateway.ts` | El gateway usa la misma lista `ALLOWED_ORIGINS`. |
| 10 | Dark mode fuera del MVP. | README, "Lo que NO está" | Incluido desde el inicio: el centro de monitoreo opera de noche durante una emergencia. |
| 11 | La comunicación es de una vía: el sistema avisa, pero nadie confirma que recibió. | flujo principal | **Confirmación de doble vía**: "Estoy a salvo" / "Necesito ayuda". Los que no responden y tienen movilidad reducida pasan a la lista de las brigadas. |
| 12 | Las métricas del admin son conteos genéricos. | `screen.png` | Métricas con significado operativo: caudal vs. umbral, nivel de alerta, manzanas y personas expuestas, ocupación de albergues. |
| 13 | `multer` se usa en `storage.module.ts` pero no está en las dependencias (solo `@types/multer`): la API no arranca. | `apps/api/package.json` | Agregado `multer` (detectado al arrancar ElquiAlerta). |
| 14 | `ignoreDeprecations: "6.0"` en `tsconfig.base.json` hace fallar a TypeScript 5.x al compilar `shared-types`. | `tsconfig.base.json` | Eliminado. |

## 4. Traducción de dominio

| EcoPoint | ElquiAlerta | Comentario |
|---|---|---|
| Reciclador | **Vecino** | Registra su vivienda y manzana, recibe alertas personalizadas, reporta incidentes. |
| Recolector | **Brigadista** (municipio, SENAPRED, bomberos, COGRID) | Mapa completo, verifica reportes, apoya evacuación. |
| Administrador | **Operador del centro de monitoreo** | Dashboard en tiempo real, emite y cierra alertas. |
| Punto de reciclaje | **Manzana** (polígono) + vivienda | La unidad de análisis de las fichas 6 y 9. |
| Material | **Tipo de capa / tipo de incidente** | Catálogo configurable. |
| "Tengo material listo" | **Nivel de alerta activado** (automático por caudal u operador) | Disparador del flujo. |
| Recolección | **Inspección / atención** | Cierra el ciclo de un reporte o de un vecino que pidió ayuda. |
| Gamificación (puntos) | **Preparación familiar** (checklist, simulacros) | Se premia estar preparado, no acumular puntos. |
| Ranking por comuna | **Avance de preparación por sector** | Útil para el municipio. |
| — (nuevo) | **Hidrología** | Estaciones, lecturas de caudal y umbrales. |
| — (nuevo) | **Escenarios de inundación** | Resultados HEC-RAS 2D por período de retorno, importados desde ArcGIS Pro. |
| — (nuevo) | **Evacuación** | Albergues con capacidad y rutas por sector. |
| — (nuevo) | **Infraestructura** | Gaviones, defensas, puentes y su estado (AEIOU "Objetos"). |

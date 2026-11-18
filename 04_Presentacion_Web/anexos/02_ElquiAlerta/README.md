# ElquiAlerta

Red de alerta temprana de crecidas del río Elqui **por manzana**, para Vicuña. Une el modelo hidráulico del curso (topografía + HEC-RAS 2D + ArcGIS Pro) con avisos personalizados y confirmación de doble vía ("Estoy a salvo" / "Necesito ayuda").

Arquitectura copiada y mejorada de **EcoPoint** (`../EcoPoint`, sin modificar).

## Empieza aquí

| Quiero… | Abre |
|---|---|
| Ver el prototipo interactivo | `apps/admin/prototype/index.html` (doble clic) |
| Entender qué se tomó de EcoPoint y qué se mejoró | `docs/01_ANALISIS_ECOPOINT.md` |
| Ver la arquitectura, flujos y módulos | `docs/02_ARQUITECTURA.md` |
| Ver el plan de diseño | `docs/03_DISENO.md` |
| Ver qué datos del Proyecto de Título usa y qué falta | `docs/04_INTEGRACION_TITULO.md` |
| Levantar la infraestructura local | `docs/infra.md` |

## Estructura (misma que EcoPoint)

```
02_ElquiAlerta/
├── apps/
│   ├── api/                 NestJS + Prisma + PostGIS
│   │   ├── prisma/schema.prisma   modelo completo (manzanas, escenarios, alertas, reportes…)
│   │   └── src/
│   │       ├── flood-scenarios/   escenarios HEC-RAS y exposición por manzana   (nuevo)
│   │       ├── hydrology/         estaciones, caudal y umbrales                 (nuevo)
│   │       ├── alerts/            alertas por manzana + confirmaciones          (nuevo)
│   │       ├── reports/           reportes ciudadanos (mejorado)
│   │       ├── gateway/           Socket.io por rol y sector (mejorado)
│   │       ├── workers/           hydro-threshold, alert-dispatch, ack-timeout, report-escalation
│   │       └── common/ config/ prisma/ storage/   copiados de EcoPoint
│   ├── admin/               Angular (package.json) + prototype/index.html
│   └── mobile/              Expo (package.json)
├── packages/shared-types/   enums: Role, AlertLevel, AckStatus, ReportType, DepthClass
├── docs/
├── compose.yaml             PostGIS, Redis, MinIO (versiones fijas)
└── .env.example
```

## Roles

| EcoPoint | ElquiAlerta |
|---|---|
| Reciclador | Vecino |
| Recolector | Brigadista (municipio, SENAPRED, bomberos, COGRID) |
| Administrador | Operador del centro de monitoreo |

## Estado

- **Prototipo:** funcional y navegable, con datos simulados e ilustrativos.
- **API:** los 17 módulos están escritos. Compila sin errores y arranca hasta pedir la base de datos (60 rutas). Falta probarla contra PostGIS real (ver `docs/02_ARQUITECTURA.md`, sección 03_PENDIENTES).
- Verificar que las etiquetas de imagen de MinIO en `compose.yaml` existan antes de usarlas.
- Los mapas son de un escenario académico: **no son delimitaciones oficiales** (Ficha 7).

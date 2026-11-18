# Plan de diseño de ElquiAlerta

## 1. Referentes del sector

| Referente | Qué se toma |
|---|---|
| Visores de riesgo (SENAPRED, Google Flood Hub, ArcGIS Dashboards) | El **mapa es el centro**; todo lo demás lo rodea. |
| Centros de operaciones de emergencia | El **nivel de alerta tiñe la barra superior**: se entiende el estado sin leer. |
| Apps de clima por capas (línea de tiempo con "play") | Un **reproductor de crecida** para ver cómo evoluciona el evento hora a hora. |
| EcoPoint (Material 3, Stitch) | Tokens MD3, chips tipo píldora, *bottom sheet*, barra inferior en móvil, FAB de acción principal. |

## 2. Principios

1. **Estado en un vistazo.** Color del nivel de alerta + caudal vs. umbral siempre visibles.
2. **Mapa primero, detalle al tocar.** Clic en una manzana → panel con profundidad, personas, ruta y albergue.
3. **Una acción principal por vista.** Operador: *Emitir alerta*. Brigadista: *Trazar ruta*. Vecino: *Estoy a salvo / Necesito ayuda*.
4. **Color semántico reservado al riesgo.** Verde/ámbar/rojo solo para niveles; el azul es la marca y el agua.
5. **Lenguaje del vecino.** "Tu manzana", "sal por", "tu albergue", nunca "BlockExposure".
6. **Funciona de noche.** Modo oscuro desde el inicio.

## 3. Tokens (misma estructura que `EcoPoint/Context/DESIGN.md`)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `primary` | `#0b5b8a` | `#7cc4f0` | Marca, agua, acciones |
| `tertiary` | `#0f766e` | `#5fd4c4` | Albergues, confirmaciones |
| `surface` | `#f3f6f8` | `#0d1519` | Fondo |
| `surface-container` | `#ffffff` | `#141f25` | Tarjetas y paneles |
| `outline-variant` | `#d3dde3` | `#26343c` | Bordes suaves |
| `alert-preventiva` | `#2e8b57` | `#58c98b` | Alerta Temprana Preventiva |
| `alert-amarilla` | `#c98a0b` | `#f0b93f` | Alerta Amarilla |
| `alert-roja` | `#c0362c` | `#f2705f` | Alerta Roja |
| Profundidad | `#b9dcf0` → `#5aa4d6` → `#1d5f94` | invertida en brillo | 0–0,5 m · 0,5–1,5 m · > 1,5 m |

Tipografía: **Plus Jakarta Sans** (títulos) + **Work Sans** (texto), heredadas de EcoPoint, más **IBM Plex Mono** para cifras (caudal, profundidades, horas).

Forma: tarjetas 16 px, controles 8 px, chips en píldora (igual que EcoPoint).

## 4. Pantallas

### Centro de monitoreo (web)
```
┌──────────────────────────────────────────────────────────────────┐
│ EcoPoint · [NIVEL DE ALERTA]  caudal 182 m³/s ▲  14:20  [rol] │  ← barra teñida por el nivel
├──┬───────────────────────────────────────────┬───────────────────┤
│  │ Escenario [T10][T50][T100]  Capas ▾        │ KPI: personas,    │
│n │                                            │ manzanas, reportes│
│a │            MAPA DEL VALLE                  │ albergues         │
│v │  (manzanas clicables, reportes, albergues, │──────────────────│
│  │   rutas, Ruta 41-CH)                       │ Pestañas:         │
│  │                                            │ Manzanas│Reportes│
│  │                                            │ Albergues         │
├──┴───────────────────────────────────────────┴───────────────────┤
│ ▶ Simular crecida  ──●──────────── hidrograma 48 h con umbrales   │
└──────────────────────────────────────────────────────────────────┘
```
Acción principal: **Emitir alerta** → modal con vista previa del mensaje por manzana y número de destinatarios.

### Brigadista (móvil)
Mapa completo + *bottom sheet* con el siguiente caso (persona que pidió ayuda o reporte), distancia y "Trazar ruta". Barra inferior: Mapa · Casos · Historial · Reportar.

### Vecino (móvil)
Tarjeta "Mi manzana" con nivel y profundidad estimada, botones **Estoy a salvo / Necesito ayuda**, ruta a su albergue, anillo de preparación familiar (reemplaza la gamificación), FAB "Reportar".

## 5. Interacciones clave del prototipo

- Reproductor de crecida (48 h): mueve caudal, nivel, mapa, KPIs y reportes a la vez.
- Clic en manzana → panel de detalle con botón "Alertar solo esta manzana".
- Reportes con flujo de estado (Pendiente → Verificando → Atendido / Escalado).
- Emisor de alerta con vista previa personalizada.
- Cambio de rol: el mismo evento visto por operador, brigadista y vecino.
- Modo claro / oscuro.

Prototipo: `apps/admin/prototype/index.html`.

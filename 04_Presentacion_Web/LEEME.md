# Del levantamiento a la alerta: presentación web

Página de presentación para Innovación III. Muestra cómo el Proyecto de Título (levantamiento GNSS + vuelo UAV-PPK, MDT del río Elqui en Vicuña) alimenta a Innovación III (modelación HEC-RAS 2D, manzanas expuestas y sistema de alerta ElquiAlerta).

## Cómo abrirla

1. Abre `index.html` con doble clic. No necesita servidor ni instalación.
2. Funciona sin internet. Con conexión carga las tipografías Barlow, Barlow Semi Condensed y JetBrains Mono desde Google Fonts. Sin conexión usa Bahnschrift o Arial Narrow, Segoe UI y Consolas, y el diseño se mantiene.
3. Para proyectar en sala, pulsa **Modo sala** en la barra superior: agranda todo el contenido un 20 %. **Tema** cambia entre sistema, claro y oscuro.
4. Para guardar un PDF de respaldo usa Imprimir del navegador (Ctrl + P) y elige "Guardar como PDF". La hoja de impresión oculta los controles, muestra las 12 filas de la matriz sin filtro y el detalle de las 6 etapas.

## Qué contiene

| Sección | Contenido |
|---|---|
| Portada | Título, mapa en planta de PC1–PC7 con sus coordenadas UTM reales y la franja Título → MDT → Innovación III. Cuatro cifras clave. |
| Cadena | Las 6 etapas, interactivas (clic o flechas del teclado). Costura visible en el MDT y la brecha del lecho sumergido. |
| Encaje | Matriz de 12 filas: 6 Confirma, 3 Precisa, 3 Tensiona. Barra de proporción que sirve de filtro. Orden: lo que tensiona primero. |
| Claves 1–5 | Geodesia (H = h − N), GNSS (PDOP, RMS, satélites), vuelo (GSD, traslapes, baterías), control de calidad y riesgos, presupuesto (horas × valor hora, retención 15,25 %) y comparación con estación total. |
| Por persona | Costo del levantamiento por persona expuesta (5.000 por defecto, PCRRD Vicuña) y tabla de alternativas de la Ficha 12. Con los valores por defecto: total $1.451.582 y unos $290 por persona. |
| Síntesis | Lo que encaja y la lista de pendientes con casillas (se guardan solo en el navegador que las marca). |
| Fuentes | Fuentes numeradas con páginas del Cap. 2 y enlaces a los otros entregables de la carpeta. |

## Estructura de carpetas

```
04_Presentacion_Web/
├── index.html                  página (abrir con doble clic)
├── css/estilos.css             estilos, tokens de color, modo oscuro e impresión
├── js/app.js                   toda la interactividad y los gráficos SVG
├── datos/datos.js              TODOS los datos de la web (window.ELQUI_DATA)
├── img/productos/              12 imágenes (WebP + SVG) de la sección «Lo que entrega el Título»
├── LEEME.md                    este archivo
├── docs/
│   ├── decisiones-de-diseno.md qué aportó cada revisor y qué se decidió
│   └── revisiones/             una revisión por skill de diseño (7 archivos)
└── anexos/                     copias de los otros entregables, para que los enlaces funcionen
    ├── 01_Pagina_Conceptos_Clave/  página de los 5 conceptos del curso + textos de las fichas
    ├── 02_ElquiAlerta/             arquitectura, documentación y prototipo (apps/admin/prototype/index.html)
    └── 03_Integracion_Titulo/      primera versión de esta página y la variante v2
```

Los anexos son copias tomadas el 17-11-2026. Si cambias los originales en la carpeta de Innovación III, vuelve a copiarlos.

Para cambiar una cifra o un texto de la matriz, las etapas, el presupuesto o las fuentes, edita solo `datos/datos.js`. Los textos explicativos de cada clave están en `index.html`.

## Fuentes de datos

- Proyecto de Título: "Caracterización geomática y análisis territorial del río Elqui en la comuna de Vicuña", Cap. 2 (22-10-2026). Coordenadas e indicadores GNSS: Ilustraciones 160 y 161 (ajuste Magnet Tools, 26-09-2026).
- Seminario de título 2024 "Base geomática integral, Altos Los Porotitos", Cap. III, secciones 27 y 29 (valores hora).
- Plan Comunal de Reducción del Riesgo de Desastres de Vicuña 2023–2025 (personas expuestas, citado en el Cap. 2).
- Innovación III: Fichas 1 a 12, página "Cinco claves del Elqui" y prototipo ElquiAlerta.
- Ley 21.133 (retención de boletas de honorarios 2026: 15,25 %).

Todas las cifras se copiaron sin cambios desde la página base `03_Integracion_Titulo/elqui-titulo-innovacion.html`. Las páginas exactas del Cap. 2 provienen de la variante v2 de esa página.

## Advertencias

- Los valores marcados **EJEMPLO** en el presupuesto (horas, arriendos, combustible, colaciones, imprevistos, estación total, valor UF) son supuestos editables. **No son cotizaciones.** Hay que reemplazarlos por cotizaciones reales antes del Capítulo 3.
- El costo por persona expuesta incluye **solo el levantamiento**. Falta el modelo hidráulico y la operación de ElquiAlerta.
- El mapa de la portada y los esquemas **no son cartografía oficial** ni delimitan zonas inundables. La línea del mapa une los puntos en orden; no es el eje del cauce.
- El esquema de alturas de la Clave 1 no está a escala.
- Los resultados son académicos y no constituyen una evaluación oficial del riesgo ("escenario no validado").
- El modelo de vuelo de la Clave 3 es orientativo (calibrado con la planificación real, 20 min por batería).
- La carpeta es autosuficiente: los enlaces apuntan a `anexos/`, así que basta con enviar `04_Presentacion_Web` (comprimida en .zip). En la versión publicada en línea esos enlaces no abren, porque los anexos solo viajan en la carpeta.

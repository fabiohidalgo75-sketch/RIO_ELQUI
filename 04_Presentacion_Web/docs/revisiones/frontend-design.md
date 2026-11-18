# Revisión: frontend-design

## Diagnóstico

La página base tiene una identidad real: libreta de terreno técnica, la cruz naranja de los GCP como motivo, Barlow Semi Condensed (aire de señalética vial) y una paleta de terreno, geoide y elipsoide. El contenido es sólido: datos reales de PC1–PC7, 12 filas de encaje y calculadoras que funcionan. Pero el envoltorio cae en tics de plantilla: etiquetas en mayúsculas monoespaciadas sobre casi cada bloque, textos unidos con punto medio y seis estilos de recuadro que compiten (.def, .example, .innote, .gap, .warnbox, .panel). Las partes 1 y 2 son rejillas de tarjetas idénticas. El portal es solo texto: el río con sus 7 puntos y el traspaso en el MDT no se ven hasta la Clave 1. Para proyectar, muchos textos de 10,5 a 14 px quedan chicos, y depender de Google Fonts hace que, sin internet, se pierda la tipografía. La v2 trae buenas ideas estructurales (mapa, barra fija, cifras clave, fuentes paginadas, impresión), pero borra la identidad: Segoe UI, sin modo oscuro y azul corporativo genérico.

## Recomendaciones

| # | Recomendación | Prioridad | Resumen | Resultado |
|---|---|---|---|---|
| 1 | Portal: mostrar el río y el traspaso | alta | Hero en dos columnas con SVG en planta de PC1–PC7 (coordenadas reales, cruces GCP) y franja Título / Innovación III con corte en el MDT. H1 corto y subtítulo. | Adoptada |
| 2 | Quitar mayúsculas monoespaciadas y puntos medios | alta | Etiquetas en fuente de cuerpo, borrar eyebrows que repiten el h2, número grande 1–5 colgado del h2 en las claves. | Adoptada (se mantienen puntos medios dentro de textos de datos que no se cambian) |
| 3 | Cadena como riel continuo con costura en el MDT | alta | Borde inferior de 6 px por tramo, MDT con fondo suave y cruz, zigzag rojo "lecho sumergido", números grandes, relleno animado al cargar. | Adoptada |
| 4 | Matriz como tabla de verdad | alta | 4 columnas con Resultado primero, franja lateral de color, orden Tensiona → Precisa → Confirma, chips del resumen como filtro. | Adoptada |
| 5 | De seis recuadros a dos | alta | Nivel A: puente a Innovación III (borde azul, título). Nivel B: advertencias con fondo suave. Ejemplo como texto con negrita. Fórmula en 22 px. | Adoptada |
| 6 | Escala tipográfica para proyectar | alta | Mínimo 13 px, escala 1,25 sobre 17 px, botón "Modo presentación". | Adoptada ("Modo sala", zoom 1,2) |
| 7 | Fuentes locales en la carpeta | alta | Descargar woff2 a fonts/ con @font-face. | Parcial: pila de respaldo del sistema; descarga pendiente |
| 8 | Título = terreno, Innovación III = agua | media | Ocre para el Título, azul para Innovación III, naranja reservado al traspaso. | Adoptada |
| 9 | Una sola navegación fija | media | Barra sticky con cruz y "Elqui", sección activa con IntersectionObserver, skip link. | Adoptada |
| 10 | Síntesis como lista de cierre | media | Dos columnas: riel en miniatura y pendientes con casillas guardadas en el navegador. | Adoptada (3 pendientes con texto completo) |
| 11 | Hoja de impresión | media | Ocultar controles, break-inside, forzar "Todos" con beforeprint. | Adoptada |
| 12 | Limpiar estilos inline y tokens | baja | Unificar :root, borrar .handoff sin uso. | Adoptada |

## Ideas tomadas de la v2

Mapa del portal con coordenadas reales, fila de 4 cifras, barra fija, fuentes numeradas con páginas, hoja de impresión, enlace al prototipo, reduced-motion y touch-action. No adoptar: Segoe UI, modo oscuro anulado, azul #195e88, radios de 26 px.

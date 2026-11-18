# Revisión: design-taste-frontend

## Diagnóstico

Página editorial y técnica para un profesor y compañeros, con lenguaje de libreta de terreno. Diales sugeridos: VARIANCE 5, MOTION 3, DENSITY 6. La base tiene identidad propia (cruz GCP, Barlow Semi Condensed con JetBrains Mono, filete de 2 px entre secciones, datos reales). Lo que la hace ver genérica es la repetición: 12 filas con la misma tarjeta, 6 etapas iguales y 5 claves con el mismo esquema 5fr/7fr + ejemplo + nota. Sobre eso, unas 30 etiquetas en mayúsculas mono, dos índices con estilos en línea, un morado #7a3fb0 sin relación con el motivo, una portada sin elemento visual y 13 líneas con guiones largos o medios. La v2 resuelve la portada con un mapa de datos y unifica la matriz, pero pierde personalidad.

## Recomendaciones

| # | Recomendación | Prioridad | Resumen | Resultado |
|---|---|---|---|---|
| 1 | Portada con el mapa de PC1–PC7 | alta | División asimétrica, SVG desde el arreglo PC con cruces y escala de 500 m, lede más corto. | Adoptada (lede original conservado; LE-12 y Base PPK no se dibujan porque no hay coordenadas en los datos) |
| 2 | Matriz como registro | alta | Un contenedor, encabezado único, franja lateral por estado, contadores dentro del filtro. | Adoptada (sin encabezado sticky) |
| 3 | Reemplazar el morado | alta | Color del territorio para Innovación III. | Adoptada con azul agua en vez de verde agua, para el par ocre/azul |
| 4 | Cadena como río con un corte | alta | Columna de traspaso entre 3 y 4, línea continua por tramo, columna vertical en móvil. | Adoptada |
| 5 | Máximo 5 etiquetas en mayúsculas | alta | Quitar eyebrows de sección, "Ejemplo" en negrita, títulos de panel como h3. | Adoptada (no queda ninguna en mayúsculas salvo FUENTE/EJEMPLO) |
| 6 | Ritmo distinto en las 5 claves | media | Invertir la Clave 2, Claves 4 y 5 a ancho completo. | Adoptada |
| 7 | Guiones y puntos medios | media | Rangos con guion normal, un punto medio por línea. | Parcial: se limpiaron etiquetas y la interfaz; los textos citados de los datos se dejaron como estaban para no alterar el contenido |
| 8 | Navegación fija en una línea | media | Barra sticky, subrayado activo, scroll horizontal en móvil. | Adoptada |
| 9 | Semáforo sin puntos de color y radios unificados | media | Franja lateral en vez del punto, --r-ctl 4 px y --r-box 8 px, corregir drawRisk. | Adoptada |
| 10 | Síntesis con peso visual | media | Renombrar, rejilla asimétrica, borde superior naranja de 4 px, sin bloque sólido. | Adoptada (dos columnas) |
| 11 | Carpeta sin conexión e impresión | media | Fuentes locales, lang es-CL, impresión forzada a claro. | Parcial: fuentes con respaldo del sistema |
| 12 | Movimiento mínimo con propósito | baja | Fundido en #sdetail, escalonado en la matriz, barras con transición. | Adoptada |

## Ideas tomadas de la v2

Mapa de portada con nota honesta, franja de 4 cifras, matriz en un contenedor, barra fija con skip link, botón al prototipo, nota de alcance, fuentes con páginas, impresión y reduced-motion, calculadora en 2 columnas. El verde agua #217267 se evaluó y se cambió por azul.

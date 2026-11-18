# Revisión: impeccable (critique, solo lectura)

## Diagnóstico

La base tiene un mundo visual propio: libreta de terreno, cruz GCP, código de color Título / Innovación III, cifras en mono y cada dato con su fuente. Los problemas aparecen al presentarla y al entregarla como carpeta: (1) falta el esqueleto del documento (doctype, charset, lang, viewport), y al abrirla desde la carpeta los tildes pueden verse mal; (2) la portada pone unos 15 elementos al mismo nivel (6 datos y 7 enlaces en dos índices) y la cadena no muestra el flujo ni el traspaso; (3) mucho texto es demasiado chico para proyectar (10,5 a 12,5 px, SVG a 11 px); (4) el costo por persona expuesta queda escondido al fondo de la Clave 5. El detector encontró 9 bordes laterales de acento, 8 eyebrows en mayúsculas y 38 avisos de contraste (la mayoría falsos positivos del análisis estático en oscuro). Puntaje heurístico estimado: 27/40.

## Recomendaciones

| # | Recomendación | Prioridad | Resumen | Resultado |
|---|---|---|---|---|
| 1 | Esqueleto del documento | alta | doctype, lang, charset, viewport y description. | Adoptada |
| 2 | Un solo índice y menos datos en portada | alta | Navegación única con grupos, 4 cifras grandes y el resto en una línea. | Adoptada (barra fija) |
| 3 | Mostrar flujo y traspaso en la cadena | alta | Conectores, línea de traspaso, fondo fijo en el MDT, anillo de selección distinto, brecha como bloque. "Selecciona una etapa". | Adoptada |
| 4 | Tamaños mínimos para proyectar | alta | 13 px en etiquetas, 15 px en filas, SVG a 13 px. | Adoptada |
| 5 | Costo por persona en bloque propio | media | Banda entre Clave 5 y síntesis, cifra grande, tabla de la Ficha 12 al lado, nota visible, UF sin "editable en el código". | Adoptada (UF editable en la página) |
| 6 | Matriz ordenada y "Precisa" en azul | media | .c-geo, contadores dentro del filtro, Tensiona primero, "Mostrando 3 de 12". | Adoptada |
| 7 | Calculadora legible | media | Unidad en cada campo, inputmode, details para estación total, badges con fondo, barra ET en geo, corregir rama redundante en riesgos. | Adoptada |
| 8 | Impresión y PDF | media | @media print y beforeprint con todo visible. | Adoptada |
| 9 | Menos bordes laterales y eyebrows | baja | Borde solo en .innote y .def, títulos de panel en tipo de oración. | Adoptada |
| 10 | Título y síntesis | baja | H1 dividido, síntesis renombrada y en dos columnas. | Adoptada ("Síntesis: qué queda listo y qué falta") |

## Ideas tomadas de la v2

Franja de cifras, mapa de portada con la advertencia de que no es zona inundable, barra fija con skip link, nota de alcance, fuentes con páginas y la diferencia de 1 mm en PC4, enlaces relativos a otros entregables, impresión, botones de 40–46 px, matriz como lista con divisores, reduced-motion y touch-action. No adoptar: modo claro forzado, Segoe UI, ocultar el índice sin reemplazo.

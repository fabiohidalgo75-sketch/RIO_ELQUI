# Revisión: web-design-guidelines

## Diagnóstico

La base (623 líneas) tiene buena semántica en lo esencial: controles como `<button>` con aria-pressed, sliders con `<label for>`, cifras con toLocaleString("es-CL") y tabular-nums, text-wrap:balance y tokens de modo oscuro. Los problemas serios aparecen al sacar el archivo del Artifact para entregarlo: no trae doctype, lang, charset ni viewport, no tiene `<main>` ni skip link, y sin conexión depende de Google Fonts. Hay tres fallas WCAG 2.2 AA medibles: ámbar y naranja como texto entre 2,95:1 y 3,97:1; la etapa 3 pierde el anillo de foco por un outline en línea; y drawPipe() y drawRisk() reconstruyen el innerHTML en cada clic, perdiendo el foco. Para proyectar hay texto de 10,5 a 11 px.

## Recomendaciones

| # | Recomendación | Prioridad | Resumen | Resultado |
|---|---|---|---|---|
| 1 | Documento HTML completo y autónomo | alta | doctype, lang es-CL, charset, viewport, description, theme-color. | Adoptada |
| 2 | Contraste de ámbar y naranja | alta | Tokens de texto separados (--warn #8a5a00, --gcp-ink #a8410f). | Adoptada |
| 3 | No reconstruir botones | alta | Generarlos una vez y actualizar atributos. | Adoptada |
| 4 | Anillo de foco en la etapa 3 y en enlaces | alta | Clase en vez de estilo en línea, a:focus-visible, hover en .seg y .risk. | Adoptada (:focus-visible global) |
| 5 | Landmarks, skip link y listas | media | `<main>`, skip link, caption y scope en tablas. | Adoptada |
| 6 | Anunciar resultados que cambian | media | role=status en el conteo, aria-live en totales, aria-describedby en SVG. | Adoptada |
| 7 | Campos numéricos para móvil | media | name, inputmode, autocomplete, 16 px en móvil, touch-action, .seg de 36–40 px. | Adoptada |
| 8 | Texto mínimo y SVG para proyectar | media | txt() a 13 px, etiquetas a 12–13 px. | Adoptada |
| 9 | Copia sin conexión e impresión | baja | Revisar respaldo de fuentes, @media print, color-scheme en :root. | Adoptada |
| 10 | Pulir tipografía y redacción | baja | Estilos en línea a clases, UF editable con formato es-CL. | Adoptada en parte (espacios no separables no se aplicaron a los textos de datos) |

## Ideas tomadas de la v2

Skip link y `<main>`, documento completo, impresión, reduced-motion con scroll-padding, touch-action y botones de 40 px, fuentes con páginas, cifras destacadas, enlace al prototipo, ámbar más oscuro. No copiar: modo oscuro forzado a claro, mono reemplazada por Segoe UI, ocultar el índice en móvil.

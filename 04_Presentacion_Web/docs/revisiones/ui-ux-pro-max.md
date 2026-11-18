# Revisión: ui-ux-pro-max

## Diagnóstico

La base ya tiene un sistema coherente: tokens con modo oscuro, el trío Barlow Semi Condensed / Barlow / JetBrains Mono con cifras tabulares y la cruz GCP. Encaja con un informe técnico-académico (Swiss Modernism 2.0). Los problemas están en la semántica del color y la accesibilidad: el ámbar `--warn` da 2,85:1 sobre su chip y el naranja `--gcp` 3,7–3,97:1, bajo 4,5:1 en texto pequeño. "Precisa" usa el mismo ámbar que "Condicionado" y parece un problema siendo un hallazgo positivo. Hay texto de 10,5–11 px, botones de unos 30 px de alto, sin navegación persistente, sin estilos de impresión y sin lang. La v2 aporta barra fija, KPIs, skip link, impresión y fuentes, pero rompe el sistema (modo claro forzado, Segoe UI, sin cruz GCP).

## Recomendaciones

| # | Recomendación | Prioridad | Resumen | Resultado |
|---|---|---|---|---|
| 1 | "Precisa" no debe parecer advertencia | alta | Token propio en azul geo y clase .c-prec en filas y resumen. | Adoptada |
| 2 | Contraste de --warn y --gcp a 4,5:1 | alta | --warn #8a5a00, --gcp para texto más oscuro, --ok #236847. | Adoptada |
| 3 | No depender solo del color | alta | Glifo en cada chip y borde lateral por estado en la matriz. | Adoptada |
| 4 | Tipografía y controles para proyección | alta | Nada bajo 12 px, SVG a 12,5–14, botones de 40 px con gap. | Adoptada |
| 5 | Barra fija y un solo índice | media | Header sticky con fondo por token, subrayado activo, scroll-padding. | Adoptada |
| 6 | Franja de KPIs | media | 4 cifras en grande, resto como metadatos. | Adoptada (cifras en Barlow Semi Condensed) |
| 7 | Patrón propio para el traspaso | media | .stage.handoff con fondo suave, conector entre 3 y 4, numeración en móvil. | Adoptada |
| 8 | Foco visible en enlaces y SVG | media | :focus-visible global, puntos del perfil con tabindex, role y Enter/Espacio. | Adoptada |
| 9 | Impresión y PDF | media | @media print con break-inside y matriz completa. | Adoptada |
| 10 | Jerarquía de cajas | baja | Escala de radios y un patrón por rol. | Adoptada (dos radios: 4 y 8 px) |
| 11 | Separar valores EJEMPLO | baja | Chips FUENTE/EJEMPLO, borde discontinuo, dos columnas, leyenda "solo levantamiento". | Adoptada |

## Ideas tomadas de la v2

Barra fija con scroll-padding, franja de KPIs, skip link y reduced-motion, impresión, sección de fuentes con páginas, botones de acción del hero con enlaces relativos, controles de 40 px, inputs en dos columnas, nota de alcance, mini mapa. No copiar: modo claro forzado, Segoe UI en cifras, eliminar la cruz GCP. El bloque sólido de la síntesis se descartó.

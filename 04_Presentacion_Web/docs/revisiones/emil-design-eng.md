# Revisión: emil-design-eng

## Diagnóstico

La base tiene contenido sólido e identidad coherente, pero cero movimiento: no hay transition, :active, hover con media query ni prefers-reduced-motion. Cada cambio de estado (etapa, filtro, métrica GNSS, riesgo) se resuelve con un innerHTML completo, así que el contenido salta de golpe y en pantalla no se ve qué cambió. Ese re-render destruye el foco del teclado en cada clic (drawPipe, drawRisk, drawFit, drawHeights). En la etapa 3 (MDT) un outline en línea anula el anillo :focus-visible. Los puntos del perfil son clicables pero no enfocables y su zona de toque es mínima (r = 4,5). La v2 tampoco anima nada, pero aporta scroll suave con resguardo, scroll-padding, skip link, impresión y touch-action.

## Recomendaciones

| # | Recomendación | Prioridad | Resumen | Resultado |
|---|---|---|---|---|
| 1 | No re-renderizar los botones | alta | Crearlos una vez y solo cambiar aria-pressed. | Adoptada |
| 2 | Anillo de foco en la etapa 3 | alta | Quitar el outline en línea, marcar el traspaso con clase y la selección en tinta. | Adoptada |
| 3 | Fundido corto en el panel de detalle | alta | WAAPI, 180 ms, translateY 4 px, respetando reduced-motion. | Adoptada |
| 4 | Respuesta al presionar | alta | scale(.97) en :active, hover solo con hover:hover, sin transition:all. | Adoptada |
| 5 | Matriz: entrada escalonada y conteos en filtros | media | Stagger de 35 ms con tope de 6 filas. | Adoptada |
| 6 | Barras GNSS que crecen | media | scaleY desde la base al cambiar de métrica; nunca en sliders ni inputs. | Adoptada |
| 7 | Puntos del perfil enfocables | media | tabindex, role, aria-label, zona de toque transparente, Enter/Espacio. | Adoptada |
| 8 | Resaltar el total al confirmar | media | Escuchar change y animar el fondo; foco visible en el campo. | Adoptada |
| 9 | Scroll suave y aviso del destino | media | scroll-behavior con resguardo, touch-action. | Adoptada sin la marca en el h2 destino |
| 10 | Teclado en la cadena | media | Roving tabindex, flechas, Inicio/Fin, sin fundido al navegar con flechas. | Adoptada (también en puntos, indicadores y riesgos) |
| 11 | Impresión | baja | beforeprint fuerza "Todos" en matriz y semáforo. | Adoptada |
| 12 | Entrada única del encabezado | baja | Animación de los hijos del hero y de la cruz. | Descartada: el único momento automático es el riel de la cadena |

## Ideas tomadas de la v2

Skip link, scroll-padding, scroll suave con resguardo, impresión, touch-action, fila de cifras, mini-atlas, fuentes numeradas, barra fija con backdrop-filter, botón al prototipo.

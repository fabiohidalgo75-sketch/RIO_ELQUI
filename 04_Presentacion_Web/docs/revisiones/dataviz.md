# Revisión: dataviz

## Diagnóstico

La lógica de datos de la base es sólida: los gráficos usan datos reales con tabla o texto de apoyo, y las calculadoras se recalculan en vivo. Los problemas son de sistema visual. Los colores de estado se usan para categorías que no son estados ("Precisa" y "Ocurrió" en ámbar). Varias etiquetas del SVG van pintadas con el color de la serie. Ningún gráfico tiene tooltip. La etiqueta de la comparación puede desbordar por la derecha. Las cifras que defienden la propuesta ("× más caro", costo por persona) aparecen como texto chico. El validador de paleta muestra que el par Título/Innovación (azul #1f6f8b frente a morado #7a3fb0) queda en ΔE 7,8 deutan en claro y 3,1 en oscuro (FAIL). Además hay una inconsistencia: la nota de la Clave 4 dice "dos ámbar y dos rojos" y el semáforo tiene 3 ámbar y 2 rojos.

## Recomendaciones

| # | Recomendación | Prioridad | Resumen | Resultado |
|---|---|---|---|---|
| 1 | Separar estados de categorías en la matriz | alta | Chips propios para Confirma, Precisa y Tensiona con ícono y texto en tinta. | Adoptada |
| 2 | Barra de proporción 6/3/3 como filtro | alta | Tramos proporcionales que son botones, conteo en los botones. | Adoptada |
| 3 | Desborde en la comparación | alta | Escala a 300 px y etiqueta siempre dentro del viewBox. | Adoptada |
| 4 | Cifras protagonistas en la Clave 5 | alta | "× más cara" y costo por persona en grande con marca naranja. | Adoptada |
| 5 | Texto SVG sin color de serie | media | Valores en tinta, rótulos en gris, identidad en la línea. | Adoptada |
| 6 | Umbral GNSS neutro | media | Línea de tinta discontinua, barras más angostas. | Adoptada (barras rectangulares) |
| 7 | Hover y tooltip en todos los gráficos | media | Tooltip propio y zona de toque de 14 px. | Adoptada con `<title>` nativo y zona de 16 px |
| 8 | Ejes y aviso de esquema en la Clave 1 | media | Marcas de Este en el perfil, quitar el área desde 592 m, "Esquema, no a escala". | Adoptada |
| 9 | Par Título/Innovación en oscuro | media | Mejorar separación y codificación secundaria. | Adoptada con ocre/azul, que separa por el eje amarillo-azul |
| 10 | Semáforo y riesgos | media | Íconos en chips, resumen de conteos, corregir "tres ámbar", color solo para impacto. | Adoptada (conteos en los botones del filtro) |
| 11 | Composición del presupuesto | baja | Columna % del total con barra en línea. | Adoptada |
| 12 | Celdas .stats en la Clave 1 | baja | Tamaño fluido y resta en dos líneas. | Adoptada |

## Ideas tomadas de la v2

Fila de 4 indicadores, validación de entradas (sin NaN), botón "Restablecer valores", protecciones numéricas en la comparación, foco en la etapa tras redibujar, impresión, fuentes con páginas. Para decidir con el autor (no adoptado porque cambia el conteo 6/3/3): reclasificar Google Flood Hub y la contradicción de las pp. 135 y 137.

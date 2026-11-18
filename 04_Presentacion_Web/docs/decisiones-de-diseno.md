# Decisiones de diseño

Siete especialistas revisaron la página base, cada uno con una skill de diseño distinta. Un director de diseño unificó sus recomendaciones y construyó esta versión. Criterios para resolver conflictos, en este orden:

1. **Fidelidad de los datos.** Ninguna cifra cambia. Solo se usan datos de la página base o de la v2.
2. **Claridad al presentar en clase.** Texto legible a 3–4 m, jerarquía evidente, una idea por bloque.
3. **Accesibilidad.** Contraste AA, foco visible, teclado, estados que no dependen solo del color.
4. **Identidad.** Se conserva la libreta de terreno de la base (cruz GCP, Barlow, cifras en mono). La v2 fue fuente de ideas, no base.

## Decisiones principales

| Tema | Decisión | Revisores que la proponían |
|---|---|---|
| Base | Se parte de la página base y se toman piezas de la v2 (mapa, cifras clave, barra fija, fuentes paginadas, impresión). Se descarta la estética de la v2 (Segoe UI, modo oscuro anulado, azul corporativo, radios de 26 px). | Todos |
| Portada | Dos columnas: texto y mapa en planta de PC1–PC7 dibujado con las coordenadas reales, con la cruz GCP en cada punto, retícula UTM, norte y escala de 500 m. Debajo, la franja Título → MDT → Innovación III. H1 corto ("Del levantamiento a la alerta") y subtítulo aparte. | frontend-design, design-taste, impeccable, ui-ux-pro-max |
| Cifras clave | Franja de 4 cifras (1,43 km², 7 PC, ≈2,9 cm, 1–3 mm) en Barlow Semi Condensed, sin degradados. Los otros datos van en una línea de metadatos. | ui-ux-pro-max, impeccable, design-taste, dataviz |
| Color | Título = terreno (ocre `#7a5a1c`), Innovación III = agua (azul `#1d5fa0`). Separa bien con deuteranopía, a diferencia del par azul/morado. El naranja GCP queda reservado para el traspaso (MDT) y las cruces. | frontend-design (ocre/azul), design-taste (sacar el morado), dataviz (falla deutan) |
| Semántica de estados | "Precisa" deja de ser ámbar: usa el azul geo con glifo ±. Cada chip lleva glifo (✓ ± ! ~ ✗) además de color, y texto en tinta. | ui-ux-pro-max, impeccable, dataviz |
| Contraste | `--warn #8a5a00`, `--ok #236847`, `--gcp-ink #a8410f` para texto; el naranja `#d4561d` solo en rellenos. | ui-ux-pro-max, web-design-guidelines |
| Navegación | Una barra fija con la cruz y "Elqui", enlaces a cada sección, sección activa con IntersectionObserver, enlace "Ir al contenido". Se eliminan los dos índices de la portada. | Todos |
| Cadena | Riel continuo: tramos ocre (1–3) y azul (4–6), números grandes porque es una secuencia real, costura entre la etapa 3 y la 4 con la cruz y un zigzag rojo rotulado "lecho sumergido". En móvil pasa a columna vertical. Única animación automática: el riel se rellena al cargar. | frontend-design, design-taste, impeccable |
| Foco y teclado | Los botones se crean una sola vez; al seleccionar solo cambia `aria-pressed`. Roving tabindex y flechas en cadena, puntos, indicadores y riesgos. Se quita el outline en línea que anulaba el foco en la etapa del MDT. | emil-design-eng, web-design-guidelines |
| Matriz de encaje | Tabla de 4 columnas (Resultado, Innovación III dice, El Título muestra, Qué hacer) con franja lateral por estado. Orden Tensiona → Precisa → Confirma. Los contadores pasan a ser una barra de proporción 3/3/6 que es el filtro. "Mostrando N de 12" con aria-live. | frontend-design, design-taste, dataviz, impeccable |
| Recuadros | Dos niveles: "Qué cambia para Innovación III" (borde azul, sin fondo, título de 19 px) y advertencias (fondo naranja suave, sin borde). "Ejemplo:" pasa a texto normal con negrita. Las fórmulas en 22 px. | frontend-design, ui-ux-pro-max, impeccable |
| Ritmo de las claves | Clave 1 normal, Clave 2 invertida (figura a la izquierda), Clave 3 normal, Claves 4 y 5 a ancho completo con texto en dos columnas. | design-taste |
| Escala tipográfica | Proporción 1,25 sobre 17 px. Mínimo 12,5–13,6 px en etiquetas; texto de los SVG a 13 px. Botón "Modo sala" (zoom 1,2) guardado en el navegador. | frontend-design, impeccable, web-design-guidelines, ui-ux-pro-max |
| Gráficos | Texto de los SVG en tinta o gris, no en el color de la serie. Línea de umbral GNSS en tinta discontinua, no en rojo (todos cumplen). `<title>` por marca como tooltip. Ejes Este en el perfil. "Esquema, no a escala" en la figura de alturas. Etiqueta de la comparación sin desborde. % del total con barra en el presupuesto. | dataviz |
| Economía | "× más cara" y costo por persona como cifras protagonistas. El costo por persona tiene su propia sección, con la tabla de la Ficha 12 al lado, la UF editable (marcada EJEMPLO) y la nota "Solo levantamiento" visible. | impeccable, dataviz |
| Calculadora | Campos en 2 columnas, unidad dentro del campo, insignias FUENTE/EJEMPLO como chips, borde discontinuo en los EJEMPLO, escenario de estación total plegable, botón "Restablecer valores". | ui-ux-pro-max, impeccable, web-design-guidelines, dataviz |
| Movimiento | Fundido de 180 ms en los paneles de detalle, entrada escalonada al filtrar la matriz, barras GNSS que crecen al cambiar de indicador, resalte del total al confirmar un valor. Todo se anula con `prefers-reduced-motion`. Sin animaciones al hacer scroll. | emil-design-eng, design-taste |
| Síntesis | Dos columnas: "Encajan en secuencia" con riel en miniatura, y pendientes como lista con casillas que enlazan a su sección. Los 5 textos se conservan. | frontend-design, design-taste, impeccable |
| Entrega en carpeta | Documento HTML completo (`lang="es-CL"`, charset, viewport, description), datos en `datos.js` sin fetch, fallback de fuentes del sistema, hoja `@media print` que fuerza "Todos" antes de imprimir y muestra las 6 etapas. | web-design-guidelines, impeccable, frontend-design |
| Fuentes | Lista numerada con páginas del Cap. 2 y la nota de 1 mm en PC4 (h − N = 604,208 frente a H = 604,207). Enlaces relativos a los otros entregables. | frontend-design, ui-ux-pro-max, web-design-guidelines |

## Correcciones de contenido

- **Clave 4:** la nota decía "los dos ámbar y los dos rojos", pero el semáforo tiene 3 criterios condicionados (ámbar) y 2 que no cumplen. Ahora dice "los tres ámbar y los dos rojos". Lo detectó dataviz.
- **Riesgos:** la base usaba ámbar para impacto "Medio" y "Medio-alto" por igual, y colores de estado para "Ocurrió" y "Preventivo". Ahora el color es solo para el impacto (Alto rojo, Medio-alto ámbar, Medio neutro) y el estado es un chip neutro.
- **"Toca cada etapa"** pasó a "Selecciona una etapa", porque se presentará con mouse o teclado.
- **Eyebrows de sección eliminados** ("Parte 1 · ...", "Parte 2 · ..."): el H2 basta.

## Lo que se descartó y por qué

| Propuesta | Motivo |
|---|---|
| Reclasificar Google Flood Hub como "Tensiona" y la contradicción pp. 135/137 sobre las sesiones (v2) | Cambia el conteo 6/3/3 y la tarea pide no cambiar cifras. Queda como decisión del autor. |
| Agrupar la matriz por estado con subtítulos (design-taste) | El orden Tensiona → Precisa → Confirma y la franja de color ya muestran los grupos; los subtítulos alargaban la lista en pantalla. |
| Encabezado de matriz fijo con `position:sticky` (design-taste) | Choca con la barra fija superior; en móvil la fila se apila con etiquetas en línea. |
| Tooltip flotante propio en todos los gráficos (dataviz) | Se usó `<title>` nativo: funciona sin código extra, también al imprimir y con lector de pantalla. |
| Bloque de color sólido en la síntesis (v2) | Invierte el tema a mitad de página. Se usó borde superior naranja de 4 px. |
| Modo oscuro forzado a claro, Segoe UI en todo, radios de 26 px (v2) | Borran la identidad de libreta de terreno y pierden las cifras tabulares. |
| Entrada animada de la portada y rotación de la cruz (emil-design-eng) | La regla de un solo momento de movimiento: se eligió el riel de la cadena. |
| Descargar los woff2 a una carpeta `fonts/` (frontend-design, design-taste) | No se descargaron archivos en esta etapa. Se usa Google Fonts como mejora opcional y una pila de respaldo del sistema (Bahnschrift en Windows mantiene el aire condensado). Se puede agregar después. |
| Casilla de verificación por cada uno de los 9 pendientes técnicos (frontend-design) | Habría que partir las 5 viñetas originales. Se mantuvieron los 3 pendientes con su texto completo, cada uno con casilla. |
| Barras con radio solo en el extremo (dataviz) | Se dejaron rectangulares: con 7 barras el radio no aporta lectura. |

## Por revisor

- **frontend-design:** identidad (cruz GCP, Barlow), portada con mapa y franja de traspaso, riel con costura, menos etiquetas en mayúsculas, dos niveles de recuadro, ocre/azul, números grandes de clave, síntesis con lista de cierre.
- **ui-ux-pro-max:** semántica de "Precisa", contrastes de `--warn` y `--gcp`, glifos en chips, controles de 40 px, franja de KPIs, campos con borde discontinuo para EJEMPLO, dos columnas en la calculadora.
- **impeccable:** esqueleto HTML completo, un solo índice, costo por persona en su propia sección, `beforeprint`, título dividido, corrección de la rama redundante en riesgos, "Selecciona una etapa".
- **design-taste-frontend:** sacar el morado, ritmo distinto entre claves, matriz como registro, cierre con peso visual, movimiento mínimo con propósito.
- **emil-design-eng:** no recrear botones (el foco no se pierde), fundidos cortos, respuesta al presionar, stagger al filtrar, barras GNSS que crecen, resalte del total en `change`, flechas del teclado, puntos del perfil enfocables con zona de toque de 16 px.
- **web-design-guidelines:** `lang`, charset, `<main>`, skip link, `caption` y `scope` en tablas, `aria-live` en resultados, `inputmode` y 16 px en móvil, `touch-action`, `color-scheme`.
- **dataviz:** colores de estado separados de categorías, barra de proporción como filtro, cifras protagonistas, texto SVG en tinta, umbral neutro, ejes del perfil, aviso "no a escala", % del total, corrección "tres ámbar".

## Pendiente para el autor

- Decidir si se adopta la lectura de la v2 sobre Google Flood Hub y sobre la contradicción de las pp. 135 y 137 (cambiaría la matriz y el semáforo).
- Opcional: copiar los archivos woff2 de las tres familias a `fonts/` y declararlos con `@font-face` para que la tipografía sea idéntica sin internet.
- Verificado en navegador (17-11-2026): a 375 px no hay scroll horizontal (los SVG y tablas anchos se desplazan dentro de su caja), el modo oscuro aplica el fondo #10161a, la consola no muestra errores y con los valores por defecto el total es $1.451.582 y $290 por persona. Conviene igual darle una mirada final en el proyector de la sala.

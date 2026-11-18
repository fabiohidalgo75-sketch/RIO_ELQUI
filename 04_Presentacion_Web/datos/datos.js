/*
  Datos de la presentación "Del levantamiento a la alerta".
  Todo el contenido numérico y textual que la página dibuja vive aquí.
  Se carga con <script src="datos/datos.js"> (no usa fetch, funciona con doble clic en file://).

  Fuentes:
  - Proyecto de Título: "Caracterización geomática y análisis territorial del río Elqui
    en la comuna de Vicuña", Cap. 2 (22-10-2026). Ilustraciones 160 y 161.
  - Seminario de título 2024 "Base geomática integral, Altos Los Porotitos", Cap. III.
  - Innovación III: Fichas 1 a 12 y prototipo ElquiAlerta.
  Las cifras se copiaron sin cambios desde la página base
  (03_Integracion_Titulo/elqui-titulo-innovacion.html).
*/
window.ELQUI_DATA = {

  /* Cifras clave bajo la portada */
  kpis: [
    { valor: "1,43 km²", rotulo: "área volada en el tramo urbano" },
    { valor: "7 PC", rotulo: "puntos de apoyo GNSS (PC1–PC7)" },
    { valor: "≈2,9 cm", rotulo: "GSD por píxel a 110 m" },
    { valor: "1–3 mm", rotulo: "RMS de los vectores GNSS" }
  ],
  metadatos: ["Monolito DOH LE-12", "Base PPK + PC1–PC7", "WGS 84 / UTM 19S · EPSG:32719", "DJI Mavic 3E a 110 m", "Norma ETT-DOH 2021"],

  /* Puntos de control ajustados (Cap. 2, Ilustraciones 160 y 161).
     N, E: UTM 19S (m). h: altura elipsoidal. und: ondulación geoidal EGM2008. H: altura ortométrica.
     sh, su: desviación estándar horizontal y vertical (m). len: longitud del vector Base → PC (m).
     dur: duración de la sesión (mm:ss). ep: épocas. sat: satélites. pdop. rms (m). */
  pc: [
    { id: "PC1", N: 6675557.477, E: 333956.656, h: 629.603, und: 33.131, H: 596.472, sh: .002, su: .003, len: 887.1, dur: "10:29", ep: 629, sat: 17, pdop: 1.384, rms: .003 },
    { id: "PC2", N: 6675494.066, E: 334182.097, h: 633.450, und: 33.169, H: 600.281, sh: .002, su: .002, len: 655.6, dur: "10:04", ep: 604, sat: 17, pdop: 1.574, rms: .002 },
    { id: "PC3", N: 6675428.571, E: 334351.003, h: 635.000, und: 33.198, H: 601.802, sh: .002, su: .002, len: 483.6, dur: "10:13", ep: 613, sat: 16, pdop: 1.718, rms: .001 },
    { id: "PC4", N: 6675380.982, E: 334664.934, h: 637.457, und: 33.249, H: 604.207, sh: .001, su: .002, len: 176.9, dur: "13:58", ep: 838, sat: 14, pdop: 1.556, rms: .001 },
    { id: "PC5", N: 6675390.380, E: 334911.207, h: 640.731, und: 33.287, H: 607.444, sh: .002, su: .002, len: 86.8, dur: "13:17", ep: 797, sat: 15, pdop: 1.447, rms: .001 },
    { id: "PC6", N: 6675524.953, E: 335124.854, h: 645.656, und: 33.312, H: 612.344, sh: .002, su: .002, len: 305.1, dur: "10:15", ep: 615, sat: 15, pdop: 1.725, rms: .001 },
    { id: "PC7", N: 6675733.948, E: 335670.772, h: 652.280, und: 33.386, H: 618.894, sh: .002, su: .002, len: 889.4, dur: "10:33", ep: 633, sat: 16, pdop: 1.642, rms: .002 }
  ],

  /* Parte 1: la cadena de 6 etapas. p: "tit" = Proyecto de Título, "inn" = Innovación III. */
  etapas: [
    { p: "tit", n: "Control geodésico", s: "LE-12 → Base PPK → PC1–PC7",
      in: ["Monolito LE-12 de la DOH (cota nivelada)", "Plan de observación en GNSS Planning (máscara 15°)", "Receptores Topcon HiPer SR"],
      out: ["Base PPK y 7 puntos de apoyo", "RMS 1–3 mm, σ milimétrica", "WGS 84 / UTM 19S (EPSG:32719)"],
      src: "Título · Cap. 2, Planificación geodésica" },
    { p: "tit", n: "Vuelo UAV-PPK", s: "Mavic 3E · 110 m · 70/70 %",
      in: ["Polígono KMZ del tramo (Google Earth)", "DJI Pilot 2, 3 baterías", "Trayectorias corregidas en Emlid Studio"],
      out: ["Imágenes georreferenciadas de 1,43 km²", "GSD ≈ 2,9 cm/píxel"],
      src: "Título · Cap. 2, Planificación UAV-PPK" },
    { p: "tit", n: "MDT y geodatabase", s: "Punto de traspaso", h: true,
      in: ["Metashape: 100 % alineación, reproyección 1,21 px", "ArcGIS Pro ModelBuilder: Classify LAS Ground (Conservative)"],
      out: ["Nube clasificada y MDT", "Ortomosaico, curvas, pendientes", "Geodatabase para SECPLAN"],
      src: "Título · Cap. 2, Procesamiento en ArcGIS Pro",
      gap: "Falta el lecho sumergido: la fotogrametría no ve bajo el agua." },
    { p: "inn", n: "Modelación hidráulica 2D", s: "HEC-RAS / Iber",
      in: ["MDT del título + batimetría del lecho", "Caudales por período de retorno (T = 10, 50, 100)", "Rugosidad de Manning por cobertura (ortomosaico)"],
      out: ["Rásters de profundidad y velocidad por escenario", "Zona inundable y fajas marginales"],
      src: "Innovación III · Fichas 7, 8 y 10; curso HEC-RAS e Iber (módulos 5 a 8)" },
    { p: "inn", n: "Exposición y priorización", s: "Manzanas expuestas",
      in: ["Profundidad por escenario", "Manzanas Censo 2024 (atributo n_per)", "Red vial, albergues y observación AEIOU"],
      out: ["Manzanas con agua y profundidad máxima", "Mapa de priorización para SECPLAN"],
      src: "Innovación III · Fichas 4, 9 y 10 + priorización territorial del Título" },
    { p: "inn", n: "Alerta por manzana", s: "ElquiAlerta",
      in: ["Exposición por manzana (block_exposures)", "Caudal DGA vs. umbrales", "Vecinos registrados por manzana"],
      out: ["Mensaje por hogar: cuánta agua, ruta y albergue", "Confirmación “Estoy a salvo / Necesito ayuda”", "Casos priorizados para brigadas"],
      src: "Innovación III · 02_ElquiAlerta" }
  ],

  /* Parte 2: matriz de encaje. [resultado, Innovación III dice, El Título muestra, Qué hacer]
     Conteo: 6 Confirma, 3 Precisa, 3 Tensiona. Orden original de la página base. */
  encaje: [
    ["Confirma", "Ficha 9 · “Vacío cartográfico local”: faltan insumos topográficos de alta resolución.", "Para el contexto comunal solo había un DEM ALOS PALSAR de 12,5 m (IDE) y “no se dispone de información LiDAR de alta resolución para el sector de Vicuña”.", "Citar ambos documentos juntos en el informe de Innovación III."],
    ["Precisa", "Ficha 8 · Resolución “< 5 m” con drones de 5–10 cm/píxel.", "GSD real ≈ 2,9 cm/píxel a 110 m sobre 1,43 km² del tramo urbano.", "Actualizar la cifra en la Ficha 8 y en la página de conceptos."],
    ["Precisa", "Ficha 6 · Araya: “un error de medio metro en el DEM puede subestimar o sobreestimar zonas inundables”.", "Puntos de control con RMS de 1–3 mm y σU de 2–3 mm. La exactitud externa del MDT todavía no se mide.", "Agregar puntos de chequeo independientes y reportar el error vertical del MDT."],
    ["Tensiona", "Fichas 7 y 10 · La modelación 2D depende de la precisión de la topografía y es la idea priorizada.", "FODA del Título: la fotogrametría no registra el fondo sumergido. El levantamiento del lecho con estación total queda “para una etapa posterior”.", "Coordinar con el Título la medición del lecho antes de correr HEC-RAS."],
    ["Precisa", "Ficha 8 · Evacuaciones preventivas en 80 hogares no protegidos.", "El Plan Comunal RRD Vicuña 2023–2025 estima ~5.000 personas expuestas y registra la crecida de 1997 con daños a infraestructura.", "Usar ambas cifras: 80 hogares como evidencia reciente y 5.000 personas como dimensión del problema."],
    ["Confirma", "Ficha 4 · AEIOU: Marquesa, Nueva Talcuna y El Arrayán junto al cauce.", "En Marquesa “algunos cursos atraviesan o se aproximan directamente a sectores ocupados”. El Censo 2024 da población por manzana (n_per): Marquesa 56, El Arrayán 22, Vicuña Sur 1.148.", "Cargar n_per del Censo 2024 como población de manzana en ElquiAlerta."],
    ["Confirma", "Ficha 7 · Legal: los resultados académicos no deben presentarse como delimitación oficial.", "El Título se limita a caracterizar, “sin atribuir a los resultados un alcance de evaluación oficial del riesgo”.", "Mantener la etiqueta “escenario no validado” en mapas y en ElquiAlerta."],
    ["Confirma", "Ficha 10 · Prioridad alta: modelación 2D más mapas fáciles de leer.", "El Título planifica una “cartografía de priorización territorial” para SECPLAN en ArcGIS Pro.", "Unir criterios: geomorfología y cambios del Título más exposición por manzana de Innovación III."],
    ["Tensiona", "ElquiAlerta · Las manzanas se importan en GeoJSON (EPSG:4326).", "El levantamiento usa WGS 84 / UTM 19S (EPSG:32719); los estudios del Cap. 1–2 usan SIRGAS-Chile / UTM 19S (EPSG:20049). LE-12 no declara época SIRGAS.", "Elegir un solo marco y documentar la transformación al importar."],
    ["Tensiona", "Ficha 8 · “Costos 60 % menores a estudios tradicionales”.", "El Título aún no tiene capítulo económico; el primer número es la calculadora de esta página.", "Respaldar el 60 % con cotizaciones o quitarlo de la ficha."],
    ["Confirma", "Ficha 12 · Google Flood Hub “carece de la alta resolución topográfica (DEM detallado)”.", "El Título produce justamente ese DEM detallado para el tramo urbano.", "Destacarlo como la diferencia clave de la propuesta."],
    ["Confirma", "Fichas 3 y 4 · La Ruta 41-CH es el eje estructurante y se corta con quebradas.", "El estudio de geomensura la define como el principal eje de acceso; el tramo levantado termina en el puente de la Ruta 41.", "Incluir la Ruta 41-CH como capa crítica en la priorización."]
  ],
  /* Orden en que se muestran los grupos: primero lo que hay que defender. */
  ordenEncaje: ["Tensiona", "Precisa", "Confirma"],

  /* Clave 2: notas por indicador GNSS */
  gnssNotas: {
    pdop: "PDOP entre 1,38 y 1,73: muy por debajo del límite 3. Buena geometría satelital en el valle, pese al relieve.",
    rms: "RMS entre 0,1 y 0,3 cm frente a una tolerancia de 2 cm. Cumple de sobra en precisión interna, pero no prueba la exactitud externa.",
    sat: "Entre 14 y 17 satélites combinando GPS y GLONASS: casi el doble del mínimo de 8.",
    len: "La ETT-DOH pide más tiempo cuanto más largo es el vector. Con vectores bajo 900 m y receptores de doble frecuencia (L1/L2), sesiones de 10 a 14 minutos son técnicamente adecuadas, según el propio capítulo."
  },

  /* Clave 3: cámara del Mavic 3E y planificación real del vuelo */
  vuelo: {
    sensorMm: 17.3, focalMm: 12.29, pxAncho: 5280, pxAlto: 3956,
    areaM2: 1.43e6,
    planGsdM: 0.0242, planDistM: 44320, planMin: 59.97, planTraslape: 0.7,
    minPorBateria: 20, baterias: 3,
    alturaDefecto: 110, frontalDefecto: 70, lateralDefecto: 70
  },

  /* Clave 4: semáforo de control de calidad. [estado, criterio, obtenido] */
  qc: [
    ["ok", "PDOP ≤ 3 en todas las sesiones", "Obtenido 1,38 – 1,73"],
    ["ok", "RMS de vectores ≤ 2 cm (ETT-DOH)", "Obtenido 0,1 – 0,3 cm"],
    ["ok", "σ ≤ 1 cm planimetría y ≤ 2 cm altimetría", "σHz 0,1–0,2 cm · σU 0,2–0,3 cm"],
    ["ok", "Sesiones compatibles con la longitud del vector", "10–14 min, vectores < 900 m, L1/L2"],
    ["bad", "Redundancia: figuras cerradas o repetición", "Un solo vector por punto; se compensa con registro de alturas"],
    ["ok", "GSD efectivo ≤ 3,0 cm/px", "≈ 2,9 cm/px a 110 m"],
    ["bad", "Traslape frontal ≥ 80 % (ETT-DOH)", "70 %: decisión por 3 baterías"],
    ["ok", "Traslape lateral ≥ 40 % (ETT-DOH)", "70 %, compensa parcialmente"],
    ["ok", "Alineación de imágenes", "100 % de las imágenes orientadas"],
    ["warn", "Error de reproyección < 1 px", "1,21 px: levemente sobre el óptimo"],
    ["warn", "≥ 95 % de centros de foto con solución FIX (PPK)", "Pendiente de verificar en Emlid Studio"],
    ["warn", "Exactitud externa con puntos de chequeo independientes", "Aún no evaluada"]
  ],

  /* Clave 4: riesgos técnicos y operacionales */
  riesgos: [
    { t: "Viento durante el vuelo", lv: "Alto", st: "Ocurrió", c: "Ráfagas y cambios de viento.", i: "Pérdida de estabilidad, desvío de trayectoria y fotos menos nítidas.", m: "Revisar pronóstico y límites del fabricante y fijar criterios de suspensión. En terreno se subió a 110 m y se continuó." },
    { t: "Terreno irregular e inestable", lv: "Alto", st: "Observado", c: "Piedras, material suelto, taludes.", i: "Caídas, lesiones y daño al instrumental.", m: "Reconocer rutas seguras, usar EPP y calzado de seguridad, no cargar equipo por superficies inestables." },
    { t: "Marcas de control poco visibles", lv: "Medio-alto", st: "Ocurrió", c: "Poco contraste o tamaño inadecuado de la cruz.", i: "Errores al marcar los PC en Metashape y peor georreferenciación.", m: "Marcas de alto contraste y tamaño adecuado al GSD; verificar visibilidad desde el aire antes del vuelo." },
    { t: "Geometría GNSS desfavorable", lv: "Alto", st: "Preventivo", c: "Relieve del valle, multitrayectoria.", i: "Mayor incertidumbre y precisión insuficiente.", m: "Planificar ventanas con GNSS Planning (máscara 15°, PDOP ≤ 3) y repetir observaciones si hace falta." },
    { t: "Pérdida o corrupción de datos", lv: "Alto", st: "Preventivo", c: "Un solo dispositivo, sin copias.", i: "Repetir el terreno y perder trazabilidad.", m: "Conservar .tps/RINEX originales, copias en ubicaciones independientes y verificación al cierre de cada jornada." },
    { t: "Acceso restringido a riberas", lv: "Medio", st: "Ocurrió", c: "Terrenos privados, accesos no habilitados.", i: "Retrasos y puntos que no se pueden ocupar.", m: "Reconocer accesos, gestionar autorizaciones y definir rutas alternativas." }
  ],

  /* Clave 5: entradas del presupuesto.
     [id, etiqueta, valor, fuente ("s" = seminario/tesis, "e" = EJEMPLO editable), unidad]
     Las filas ["g", título] abren un grupo. "abierto": false pliega el grupo. */
  presupuesto: [
    ["g", "Recursos humanos"],
    ["vh_geo", "Ingeniero geomensor, valor hora", 18000, "s", "$/h"], ["h_geo", "Ingeniero geomensor, horas", 40, "e", "h"],
    ["vh_dib", "Dibujante, valor hora", 9500, "s", "$/h"], ["h_dib", "Dibujante, horas", 24, "e", "h"],
    ["vh_ala", "Alarife, valor hora", 8000, "s", "$/h"], ["h_ala", "Alarife, horas", 9, "e", "h"],
    ["g", "Instrumental (arriendo por día)"],
    ["uav", "UAV con módulo RTK/PPK", 150000, "e", "$/día"], ["gnss", "Par GNSS geodésico (base + rover)", 120000, "e", "$/día"], ["dias", "Días de terreno", 1, "s", "días"],
    ["g", "Operación"],
    ["km", "Distancia La Serena → Vicuña (ida)", 62, "e", "km"], ["rend", "Rendimiento camioneta", 10, "s", "km/l"], ["comb", "Precio combustible", 1300, "e", "$/l"],
    ["pers", "Personas en terreno", 3, "s", "pers."], ["col", "Colación por persona", 4500, "e", "$"],
    ["g", "Margen"], ["imp", "Imprevistos", 10, "e", "%"], ["ret", "Retención boleta honorarios 2026", 15.25, "s", "%"],
    ["g", "Escenario estación total (para comparar)"], ["et", "Arriendo estación total por día", 45000, "e", "$/día"], ["rendET", "Rendimiento estación total", 6, "e", "ha/día"]
  ],
  /* Total esperado con los valores por defecto: $1.451.582 (control de regresión). */
  totalEsperado: 1451582,

  /* Ficha 12: alternativas frente a la propuesta. r: "no" | "parcial" | "si" */
  alternativas: [
    { n: "Defensas fluviales, sector Ruta 5 (570 m)", costo: "Alto", r: "no", t: "No" },
    { n: "Encauzamiento río Elqui, Vicuña", costo: "Medio", r: "no", t: "No" },
    { n: "Plataforma de alerta y monitoreo hidrológico", costo: "Medio-alto", r: "no", t: "No" },
    { n: "Google Flood Hub", costo: "Bajo", r: "parcial", t: "Sin detalle local" },
    { n: "Defensas acceso oriente, puente Ing. Díaz Ossa", costo: "Alto", r: "no", t: "No" }
  ],
  propuesta: { n: "Levantamiento UAV (Título) + modelo y ElquiAlerta (Innovación III)", t: "Sí, por manzana" },

  /* Costo por persona expuesta (PCRRD Vicuña 2023–2025, citado en Cap. 2) */
  personas: { defecto: 5000, min: 1000, max: 10000, paso: 500 },
  ufReferencial: 40000,

  /* Síntesis: textos de la página base, sin cambios */
  sintesis: {
    encaja: [
      ["Encajan en secuencia, sin superponerse.", "El Título entrega el terreno medido (MDT, ortomosaico, geodatabase amarrada a la DOH). Innovación III lo convierte en escenarios de inundación, manzanas expuestas y avisos por hogar con ElquiAlerta."],
      ["La tesis respalda con datos la mayoría de los hallazgos del curso:", "vacío cartográfico, sectores expuestos, límite legal, priorización y la ventaja frente a Google Flood Hub."]
    ],
    pendientes: [
      { id: "aj", titulo: "Tres ajustes antes de entregar:", texto: "medir el lecho sumergido antes de modelar, unificar el sistema de referencia (EPSG:32719 o 20049) y respaldar o quitar el “60 % menos costo” de la Ficha 8.", ir: "#encaje" },
      { id: "tec", titulo: "Pendiente técnico:", texto: "puntos de chequeo independientes para medir el error del MDT. Explicar el traslape frontal de 70 % (DOH pide 80 %) y la reproyección de 1,21 px.", ir: "#c4" },
      { id: "eco", titulo: "Pendiente económico:", texto: "reemplazar los valores EJEMPLO por cotizaciones y sumar el costo del modelo hidráulico y de ElquiAlerta.", ir: "#c5" }
    ]
  },

  /* Fuentes y alcance (páginas tomadas de la variante v2 de la página) */
  fuentes: [
    "Proyecto de Título, Capítulo 2 (22-10-2026): alcance (p. 76), población y unidades censales (pp. 72 y 87), cobertura (p. 128), control GNSS (pp. 135–137), procesamiento (p. 138) y limitaciones del lecho (p. 145).",
    "Coordenadas e indicadores GNSS: Cap. 2, Ilustraciones 160 y 161 (ajuste en Magnet Tools, 26-09-2026). En PC4, la resta h − N da 604,208 m y la tabla reporta H = 604,207 m: 1 mm de diferencia por redondeo. Se mantiene el valor de la tabla fuente.",
    "Valores hora del presupuesto: Seminario de título 2024 “Base geomática integral, Altos Los Porotitos”, Cap. III, secciones 27 y 29. Los valores marcados EJEMPLO son supuestos editables, no cotizaciones.",
    "Retención de boletas de honorarios 2026: 15,25 % (Ley 21.133).",
    "Personas expuestas: Plan Comunal de Reducción del Riesgo de Desastres de Vicuña 2023–2025, citado en el Cap. 2.",
    "Hallazgos del curso: Fichas 1 a 12 de Innovación III, página “Cinco claves del Elqui” y prototipo ElquiAlerta."
  ],

  enlaces: [
    { t: "Prototipo ElquiAlerta", href: "anexos/02_ElquiAlerta/apps/admin/prototype/index.html" },
    { t: "Conceptos clave del curso", href: "anexos/01_Pagina_Conceptos_Clave/conceptos-clave-innovacion-iii.html" },
    { t: "Documento de integración", href: "anexos/02_ElquiAlerta/docs/04_INTEGRACION_TITULO.md" },
    { t: "Página base (versión publicada)", href: "anexos/03_Integracion_Titulo/elqui-titulo-innovacion.html" }
  ]
};

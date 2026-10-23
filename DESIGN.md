# GIM · Sistema visual

## Dirección

Identidad de sala de pesas: superficies grafito, acento lima y tipografía de títulos compacta. Solicitada por el usuario para dar una temática más gimnasio y mejorar orden y colores. El cambio conserva el nombre GIM, las ilustraciones, el flujo de registro y los tres módulos.

## Color

- Fondo: `#111813`.
- Panel: `#1a241d`.
- Campo: `#101811`.
- Texto: `#f0f4e9`.
- Texto secundario: `#b0bba8`.
- Borde: `#344137`.
- Acento de acción y selección: `#cef568`; texto sobre acento `#17200e`.
- Confirmación: `#b7df90`; error `#ffb6a4`; advertencia `#f2cf94`.

El acento identifica Guardar serie, selección de navegación y fila actual. No usar varios colores brillantes con igual importancia. Los estados conservan su significado entre entrenamiento, historial y configuración. Las ilustraciones mantienen un fondo blanco local, sin invertir ni recolorear la imagen.

## Tipografía

Títulos y marca: Barlow Condensed Semibold, archivo local `app/public/fonts/BarlowCondensed-SemiBold.ttf`, con `font-display: swap`. Fuente oficial de Google Fonts con licencia OFL incluida en la misma carpeta. Texto y valores: familia de sistema, con números tabulares en las tablas. No usar la fuente condensada para párrafos o formularios largos.

## Composición

- Pantalla amplia: ficha del ejercicio y registro como columna principal; progreso y rutina en columna lateral. Bitácora y opciones debajo del registro.
- Hasta 880 px: ejercicio, progreso/rutina y detalles en una sola columna.
- En celular: navegación inferior existente y márgenes que respetan el espacio ocupado por esa barra.
- Inicio: tarjetas de rutina en tres columnas cuando hay espacio; lista vertical en pantallas pequeñas. Referencia visual del primer ejercicio para facilitar reconocimiento.
- Jerarquía dentro de la ficha: identidad del ejercicio, serie/objetivo, tabla, referencia de carga, ajustes opcionales y Guardar serie.
- Historial y configuración conservan una anchura de lectura menor que el área de entrenamiento.

## Componentes y comportamiento

Paneles de 12 px de radio, sin brillos ni texturas decorativas. Ilustraciones existentes y SVG geométricos del sistema. Una acción principal por tarea; ajustes secundarios desplegables. No añadir acciones ni lógica de entrenamiento solo para justificar una estética.

## Recursos y límites

Fuente e ilustraciones son locales y están incluidas en el precaché PWA. Sin llamadas externas mientras se entrena. Los colores de navegador y manifest coinciden con el fondo de la interfaz. No se alteran datos ni migraciones por un cambio visual.

Esta dirección está implementada en código. No se verificó renderizado ni uso en navegador, por la instrucción vigente de no ejecutar tests ni automatización de navegador.

En v0.11, la ficha de ejercicio incorpora Anterior/Siguiente y desplazamiento lateral con umbral del 25 % o gesto rápido, también al revisar resultados. El desplazamiento vertical y el zoom quedan a cargo del navegador. En móvil, la tabla utiliza su altura natural y no captura un scroll interno; los botones y campos conservan sus gestos habituales. La ficha siempre vuelve a una posición completa.

v0.11.1 da continuidad al gesto mediante una pista con vistas previas laterales y ajuste de 260 ms con desaceleración. Arrastre directo, sin transición durante el movimiento; la selección cambia al terminar el ajuste. Misma transición para botones. Sin autoplay ni dependencias adicionales. Referencia oficial: https://www.embla-carousel.com/docs/api/options.

v0.12 acerca acciones a los datos: confirmar en la fila editable y corregir al tocar los valores guardados, con formulario en la misma ficha. El borrador se distingue del registro confirmado. Criterio de carga y avisos principales a 14 px; atajos de suma/resta simétricos. La consulta anterior es desplegable. Historial separa frecuencia de comparación por ejercicio, sin añadir indicadores sin contexto. Herramientas de prueba dentro de Configuración. Referencias y límites en docs/revision-uso-v0.12.md.

v0.13 local añade montaje habitual en un bloque opcional del editor y una lectura compacta de su copia en la sesión. La nota de la sesión se distingue de esa copia; formulario en contexto, sin modal, con guardar/cancelar y navegación bloqueada durante la edición. Los textos largos respetan saltos de línea; textarea reutiliza tipografía, colores y foco del formulario existente. Referencia y estado de comprobación en docs/entrega-0.13-montaje.md.

v0.13.1/F21: línea compacta de último registro confirmado; borrador recuperado identificado; nota pendiente recuperable. Aviso contextual de respaldo únicamente en Configuración, sin modal, posponible siete días. Referencias Carbon/MDN y contrato en docs/entrega-0.13.1-continuidad.md. Sin validación visual en navegador.

v0.14/E2: biblioteca dentro del editor, búsqueda y filtros nativos, resultados en lista de altura natural, selección explícita de variante y personalizado como salida. Favoritos/alias a pedido; equipo concreto y montaje en detalle opcional. Resumen de variante/equipo copiados en Entrenar e Historial. Referencia Carbon Search y contrato: docs/entrega-0.14-biblioteca.md. Conserva grafito/lima, sin imágenes nuevas ni dependencias. Detector estático sin hallazgos; renderizado/uso móvil no verificados.

v0.15/F05: objetivos diferentes por serie en detalle opcional del editor, controles nativos de mínimos/máximos/carga/descanso, duplicar y copiar a todas. En uso se conserva una acción principal y objetivo separado del resultado, con prescripción copiada consultable en Historial. Referencia oficial Hevy y contrato: docs/entrega-0.15-objetivos.md. Sin imágenes, dependencias ni temporizador nuevos; revisión estática correcta, uso móvil no verificado.

## Ampliación local 0.20 · operar sin convertir el registro en configuración

Las tres áreas y el sistema grafito/lima permanecen. Configuración prepara modalidad, objetivos, roles, grupos, equipo, alternativas y reglas. Entrenar muestra el formulario que corresponde al ejercicio; el simple mantiene la fila principal. «Adaptar esta sesión» contiene acciones excepcionales y conserva una lectura explícita de pospuesto/omitido/sustituido. La navegación lateral existente no se reutiliza como gesto destructivo.

El descanso aparece como un panel compacto con su origen y estado; su reloj solo repinta ese panel. Lados y tramos distinguen guardar avance de cerrar serie. No completar automáticamente un lado faltante ni presentar un cronómetro abierto como resultado. Las unidades aparecen en campos y resultados; objetivos y registro real se leen por separado. Corrección en contexto, errores con recuperación y borradores separados de confirmación.

Bloques/importación/progresión quedan en detalles dentro de Configuración, con vista previa y aceptación explícita. El historial muestra dimensiones de conteo sin convertir tramos en series principales. No se añaden gráficos, insignias, animaciones, dependencias ni recursos remotos por ampliar el modelo.

Referencias oficiales adaptadas durante esta ejecución: Hevy para [prescripción por serie](https://www.hevyapp.com/features/how-to-write-sets-and-reps/), [roles y tipos](https://help.hevyapp.com/hc/en-us/articles/34896293707927-Set-Types-in-Hevy-Explained-Drop-Sets-Warm-Up-Sets-and-More), [descanso](https://help.hevyapp.com/hc/en-us/articles/35385404949143-Rest-Timer-Default-Rest-Timer-How-to-Add-Adjust-Volume-and-Sound), [avance entre miembros de grupos](https://help.hevyapp.com/hc/en-us/articles/35650286563095-The-Complete-Guide-to-Supersets-and-Smart-Superset-Scrolling) y [programación](https://www.hevyapp.com/features/exercise-programming-options/). La adaptación conserva los límites de una PWA local; no copia promesas nativas ni prescribe técnica. Contratos y fuentes completas en docs/entrega-0.20-ruta-principal.md.

Se aplicó Impeccable Operate y revisión estática sin hallazgos. No se inspeccionó el renderizado ni se observó uso móvil, por la instrucción de no realizar tests ni automatización de navegador. Ergonomía, teclado y navegación con las modalidades nuevas siguen pendientes de evidencia real.

0.20.1 · Revisión de usabilidad: actualización disponible con aviso global y consulta manual, sin aplicar recargas durante una edición; resultados avanzados con confirmación y corrección en contexto; atajos de carga también con RIR/tramos, campos bloqueados coherentes y unidades propias en cronología. Sección de limpieza en Configuración con recuperación local explícita, conservación de planes y bloqueo ante conflictos. Referencias oficiales de NN/g (visibilidad/control/deshacer) y Chrome Workbox documentadas en docs/revision-plan-usabilidad-0.20.1.md. Sin cambios de paleta, tipografías, navegación ni dependencias. Revisión de código/detector; capturas fallaron y no se atribuye inspección visual o validación móvil.

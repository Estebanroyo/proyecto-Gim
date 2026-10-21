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

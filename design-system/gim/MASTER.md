# GIM · sistema de interfaz para entrenar

Estado: aplicado en la rama `feat/mobile-clarity-uupm`, versión local 0.21.0. Referencia principal: UI UX Pro Max, instalada desde el repositorio oficial enlazado por https://uupm.cc/. Este documento adapta sus coincidencias verificadas al producto; no es una copia ciega de la salida del generador.

## Prioridad de decisión

1. PWA personal, celular y registro real entre series en el gimnasio.
2. Claridad del dato, facilidad de interacción y preservación de lo guardado.
3. Este sistema, basado en UI UX Pro Max y el contexto de PRODUCT.md.
4. Impeccable Operate como apoyo de consistencia y revisión estática.

No convertir la pantalla de entrenamiento en landing, red social o tablero de indicadores. Conservar Entrenar, Historial y Configuración. La skill no cambia el significado de los datos ni autoriza paquetes/servicios.

## Dirección visual

Minimalismo funcional con grafito neutro y un acento lima. Superficies sólidas, sin degradados decorativos, cristales, nuevas imágenes ni efectos de fondo. La lectura y la confirmación tienen prioridad sobre la marca.

Se conserva una apariencia oscura por continuidad del producto y ajuste de la recomendación Fitness/Gym App; no se afirma que una categoría determine el tema óptimo para todos los gimnasios. Evaluar reflejos/luz ambiente con uso real antes de agregar otro tema.

| Token | Valor | Uso |
|---|---|---|
| background | #101418 | Fondo y barras |
| surface | #1a2126 | Ficha y paneles |
| field | #11171b | Entradas |
| soft | #242e35 | Estados secundarios |
| ink | #f5f7f8 | Texto principal |
| muted | #b7c1c9 | Texto secundario |
| line | #354047 | Separadores |
| field-line | #64727c | Límites de controles |
| accent | #cef568 | Guardar y selección |
| on-accent | #17200e | Texto sobre lima |

Los tokens semánticos de confirmación/error/advertencia existentes permanecen. Selección de texto y hover de atajos usan `on-accent` sobre lima. Un color no sustituye la etiqueta del estado.

Tipografía de sistema para valores, formularios y títulos funcionales. Barlow Condensed local permanece en marca y piezas existentes donde aporta identidad; no descargar Inter/Playfair ni fuentes externas para reproducir la recomendación genérica. Números tabulares; valores grandes en la serie actual, metadatos secundarios discretos.

## Estructura de Entrenar

Orden de lectura de la ficha abierta:

1. Ejercicio, referencia visual pequeña y Anterior/Siguiente.
2. Serie actual y objetivo, con calentamiento explícito cuando corresponda.
3. Peso y repeticiones de la serie actual, en dos campos amplios con teclado numérico adecuado.
4. Sumar +1,25 / +5 / +10 / +20 kg; restar/reiniciar desplegables.
5. Un botón ancho «Guardar serie», confirmación y estado de borrador.
6. Serie anterior, correcciones y detalles del plan/equipo a pedido.

El registro no comparte la tabla con todas las filas anteriores o pendientes. La tabla sigue disponible en «Series de este ejercicio», con corrección en contexto. Modalidades avanzadas conservan formularios y validaciones propios. Los atajos se reutilizan mediante WeightAdjustments.tsx.

Montaje y notas de sesión permanecen debajo del registro; no esconder el formulario de una nota que se está editando dentro de un nuevo acordeón. Detalles de variante/equipo/criterio y objetivos completos son consultables aparte. Los objetivos no se convierten en resultados.

Progreso compacto; lista de ejercicios y resumen detallado desplegables. Bitácora cronológica y opciones de sesión continúan accesibles. No usar una barra fija de guardado que compita con teclado y navegación inferior.

## Móvil e interacción

- Diseñar la serie actual primero; ampliar la composición en escritorio.
- Controles principales de 48–56 CSS px o más; separación de 8 px en atajos. Son objetivos de comodidad de esta web, no equivalencias universales entre pt/dp/px.
- Campos de valores de 72 px; sin precisión de toque sobre un pequeño check de tabla para confirmar.
- Mantener scroll vertical y zoom. El carrusel existente solo conserva su navegación lateral con umbral y alternativa visible; no agregar otro gesto destructivo.
- Navegación inferior de tres destinos, con área segura y espacio inferior de contenido. Teclado y barras no deben ocultar la tarea; no se verificó físicamente esa condición en esta entrega.
- Press feedback sin cambiar geometría; conservar la animación lateral existente y su alternativa de movimiento reducido. Sin GSAP ni nuevas dependencias.

## Historial y Configuración

Historial conserva consulta por sesión y contexto de los resultados. Comparaciones solo con datos compatibles; no inventar marcas, tiempo entrenado ni calorías para llenar espacio.

Configuración agrupa: Rutinas y registro; Planes y progreso; Respaldo y datos; Más opciones; Aplicación. Los paneles siguen siendo desplegables con título y explicación consistentes. No se añaden destinos a la navegación principal.

## Procedencia y filtrado de las búsquedas

Ejecutadas con `scripts/search.py` de la instalación oficial:

| Consulta | Modo | Coincidencia aplicable |
|---|---|---|
| gym workout tracker mobile | --design-system --variance 2 --density 6 | Minimalism & Swiss Style: jerarquía clara, funcionalidad, bajo coste visual |
| fitness workout tracker | --domain product | Fitness/Gym App: contexto de entrenamiento y soporte de modo oscuro |
| mobile thumb bottom navigation | --domain ux | Mobile First, Mobile Keyboards y Sticky Navigation sin ocultar contenido |
| touch target spacing | --domain ux | Touch Spacing, Touch Target Size y reflujo de texto |
| form progressive disclosure | --domain ux | Submit Feedback y Form Labels; no se atribuye una coincidencia específica de divulgación progresiva que no devolvió |
| form input state | --stack react | Formularios controlados, etiquetas y estado inicial perezoso |

La primera salida mezcló landing Feature-Rich Showcase, tipografía editorial y sugerencias de gamificación. El contraste con la búsqueda explícita de producto confirmó el contexto, pero esas piezas siguen sin servir a una bitácora en uso: se excluyeron. La paleta naranja/verde no sustituye automáticamente la marca de un producto existente. No persistir salidas no verificadas como decisiones del producto.

Referencias de implementación: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill, https://react.dev/reference/react-dom/components/input y https://react.dev/reference/react/useState. Los resultados son guías, no evidencia de usabilidad propia.

## Evidencia y límites

Compilación de producción y detector estático en componentes modificados. Sin tests, automatización de navegador, capturas nuevas ni validación táctil. No declarar la lista nativa de comprobaciones de UI UX Pro Max como realizada: esta app es web y el pedido mantiene la restricción de tests/automatización. El significado y las versiones de datos no cambian por este rediseño.

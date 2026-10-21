# Navegación móvil · v0.11

La tabla de series tenía altura máxima y `overscroll-behavior: contain`, que impedía continuar el scroll hacia la página al llegar a su límite. Ahora permite encadenarlo y, en pantallas de hasta 880 px o con puntero táctil, usa la altura completa sin scroll interno. Los campos conservan su edición habitual y permiten desplazamiento vertical.

`SwipeExerciseCard` detecta el eje después de 10 px; una diagonal se trata como desplazamiento vertical. `touch-action: pan-y pinch-zoom` conserva scroll y zoom nativos. No se inicia navegación desde inputs, botones ni otros controles. `pointercancel` devuelve la ficha a su posición. No utiliza listeners globales ni librerías adicionales.

Se cambia de ejercicio al soltar después de recorrer al menos el 25 % del ancho de la ficha, o 36 px con velocidad reciente de 0,5 px/ms en la misma dirección. El gesto solo avanza un ejercicio, no envuelve los extremos y vuelve siempre a desplazamiento cero. No existe una posición intermedia persistente entre dos fichas. Anterior/Siguiente proporciona la misma navegación sin gestos.

El mismo componente se usa durante la sesión y al consultar una sesión finalizada o sin fecha. Navegar cambia el ejercicio seleccionado y su formulario; no guarda series automáticamente. Durante una corrección se bloquea el cambio para conservar el contexto. Las series ya guardadas no se modifican.

La compilación y revisión estática no equivalen a probar gestos en un teléfono real. No se ejecutan tests ni automatización de navegador, según la instrucción vigente.

Referencias técnicas: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action y https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior.

## Transición v0.11.1

Referencia de comportamiento: opciones oficiales de Embla (https://www.embla-carousel.com/docs/api/options), con ajuste a posiciones, avance de una ficha y sin desplazamiento libre. También se consultaron las páginas oficiales de carrusel y movimiento de Material 3; las pautas del carrusel requieren JavaScript para leer su contenido completo en esa web.

La ficha actual y las vistas previas vecinas se desplazan juntas. Se muestran nombre, imagen, objetivo y series guardadas reales de la ficha vecina; las vistas previas son de consulta, sin controles activos ni guardado. Al completar el movimiento, se activa su formulario habitual. No se montan formularios editables duplicados.

El arrastre sigue el dedo sin transición. Al soltar o pulsar anterior/siguiente, se completa el recorrido en 260 ms con desaceleración `cubic-bezier(0.22, 1, 0.36, 1)`. El ejercicio seleccionado cambia al terminar la animación, no antes. Si el gesto no alcanza el umbral, el mismo movimiento devuelve la ficha al centro. Cancelación, desmontaje y cambio externo de ejercicio limpian el gesto y sus temporizadores; un respaldo de 320 ms evita depender exclusivamente de transitionend.

Se anima un único transform y se indica will-change solo durante el arrastre o ajuste. Sin nuevas dependencias, autoplay ni efectos globales. La preferencia de movimiento reducido utiliza cambio directo. No se midieron cuadros por segundo ni se verificó el gesto en navegador por la instrucción de no realizar tests.

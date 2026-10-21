# Navegación móvil · v0.11

La tabla de series tenía altura máxima y `overscroll-behavior: contain`, que impedía continuar el scroll hacia la página al llegar a su límite. Ahora permite encadenarlo y, en pantallas de hasta 880 px o con puntero táctil, usa la altura completa sin scroll interno. Los campos conservan su edición habitual y permiten desplazamiento vertical.

`SwipeExerciseCard` detecta el eje después de 10 px; una diagonal se trata como desplazamiento vertical. `touch-action: pan-y pinch-zoom` conserva scroll y zoom nativos. No se inicia navegación desde inputs, botones ni otros controles. `pointercancel` devuelve la ficha a su posición. No utiliza listeners globales ni librerías adicionales.

Se cambia de ejercicio al soltar después de recorrer al menos el 25 % del ancho de la ficha, o 36 px con velocidad reciente de 0,5 px/ms en la misma dirección. El gesto solo avanza un ejercicio, no envuelve los extremos y vuelve siempre a desplazamiento cero. No existe una posición intermedia persistente entre dos fichas. Anterior/Siguiente proporciona la misma navegación sin gestos.

El mismo componente se usa durante la sesión y al consultar una sesión finalizada o sin fecha. Navegar cambia el ejercicio seleccionado y su formulario; no guarda series automáticamente. Durante una corrección se bloquea el cambio para conservar el contexto. Las series ya guardadas no se modifican.

La compilación y revisión estática no equivalen a probar gestos en un teléfono real. No se ejecutan tests ni automatización de navegador, según la instrucción vigente.

Referencias técnicas: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action y https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior.

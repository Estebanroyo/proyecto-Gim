# Revisión del recorrido de uso · v0.12

## Diagnóstico

El informe aportado describe un recorrido real en una ventana angosta, no en un teléfono físico. Registró, corrigió, cambió de ejercicio, recargó y cerró una sesión parcial. Son evidencias útiles de interacción y persistencia en ese navegador, pero no verifican teclado móvil, uso con pulgar, falta de red ni comparación entre dos sesiones.

El problema principal era la distancia entre la tarea y su control: guardar estaba separado de la fila editable y corregir exigía abrir otra zona. El segundo problema era de confianza: los valores escritos y los valores sugeridos eran visualmente parecidos, pero solo los primeros representaban la intención reciente del usuario. El tercero era de significado: un número de kg sin criterio de carga no garantiza una comparación válida.

## Hallazgos y cambios

| Hallazgo | Causa | Corrección |
|---|---|---|
| Guardar exigía bajar | Confirmación debajo de tabla y herramientas | Botón de confirmación en la fila editable, junto a kg y reps; una única acción de alta |
| Corregir exigía ir a la bitácora | Único punto de entrada alejado de la serie | Peso y reps guardados abren corrección en la misma ficha; conserva acceso desde bitácora |
| Borrador perdido al recargar o cambiar ejercicio | Valores solo en estado React | Borrador local por sesión y ejercicio, escritura al editar y recuperación con aviso explícito |
| Valores nuevos confundidos con sugerencias | Sin distinción entre preparado y confirmado | Estados «Valores sugeridos», «Borrador conservado» y confirmación de serie guardada |
| Solo había una resta pequeña | Atajos asimétricos | ±1,25, ±5, ±10 y ±20 kg, manteniendo entrada directa y límite inferior 0 |
| Peso de mancuernas ambiguo | No existía un criterio en el plan o copia histórica | Criterio editable por ejercicio: total, por mancuerna o lastre; explicación en entrenamiento, edición e historial |
| Control de prueba mezclado con uso cotidiano | Herramienta temporal en opciones de sesión | Movido a Configuración → Herramientas de prueba, con sesión identificada y confirmación |
| Faltaba consultar la última vez completa | Solo se sugería una carga inicial | Desplegable con todas las series anteriores y criterio de carga, en la misma rutina y ejercicio |
| Totales no respondían preguntas de progreso | Resumen agregado sin contexto temporal | Frecuencia de las últimas 4 semanas y mejor serie a una misma carga entre sesiones compatibles |
| Información secundaria pequeña | Referencias a 13 px | Referencias, estado de borrador y ayudas principales a 14 px con interlineado 1,6 |

Se conservan los comportamientos positivos observados: inicio directo por rutina, valores de la última serie al continuar, cambio de orden sin completar ficticiamente un ejercicio, objetivos separados de resultados y cierre parcial sin borrar lo realizado. La navegación lateral conserva la animación anterior.

## Criterio de carga y compatibilidad

La rutina precargada propone peso por mancuerna en press inclinado, aperturas y curls alternado/martillo; lastre en flexiones, fondos y dominadas; carga total en los demás. Son valores iniciales editables en Mis rutinas. Si se usa otro equipo o variante, hay que ajustar el criterio del plan; la imagen es una referencia, no una detección del equipo utilizado.

Los ejercicios nuevos del editor empiezan con carga total y permiten elegir otro criterio. Las sesiones futuras copian ese dato. Las sesiones anteriores sin ese campo se muestran con «criterio sin declarar»; no se convierten pesos ni se atribuye una convención retrospectiva. Las migraciones v1/v2 tampoco inventan ese campo. Se conserva el formato v3 con campo opcional validado y exportado/importado en los respaldos.

Las sugerencias de sesiones nuevas con criterio explícito solo reutilizan pesos anteriores con el mismo criterio. Una sesión anterior con criterio desconocido sigue disponible para consulta, pero no aporta automáticamente su carga a una sesión con otro significado declarado.

## Borradores

`draft.ts` usa una clave separada del registro de series. Conserva los textos introducidos, incluidos valores incompletos, sin convertirlos en series. Su base incluye las series guardadas del ejercicio y el criterio de carga. Si esa base cambia, no se restaura silenciosamente un borrador desactualizado: se avisa para revisar las sugerencias. Al registrar se limpia después de guardar correctamente, y al corregir se conserva y actualiza la base del borrador de la serie siguiente.

El borrador no sincroniza dispositivos ni forma parte del respaldo de entrenamientos. Puede fallar por restricciones de almacenamiento; la interfaz lo avisa sin afirmar que se conservó. La app no puede recuperar lo escrito antes de instalar esta versión. La corrección aún no confirmada y el editor de rutinas no están incluidos en este nuevo mecanismo de borrador de serie.

## Cómo se interpreta la evolución

- Frecuencia: fechas distintas con al menos una serie guardada, también en sesiones parciales; excluye sesiones vacías, sin fecha y fechas futuras. Tabla de semanas de lunes a domingo; la actual está en curso y no debe compararse como si ya estuviera completa. Respeta el filtro de rutina.
- Repeticiones: misma rutina, identidad y nombre del ejercicio y mismo criterio explícito. Se elige una carga y se compara la mejor serie a esa carga por sesión, indicando cuántas series se hicieron con ese peso. Se muestran hasta 8 sesiones hasta la fecha seleccionada.
- Una mejora numérica no demuestra por sí sola mayor fuerza: técnica, esfuerzo, equipo y descanso pueden variar. No se generan puntuaciones globales, calorías ni resultados ficticios cuando falta historial.
- Los registros con criterio desconocido o distinto no participan en la comparación automática. Siguen visibles en el historial original.

## Referencias consultadas

- [Hevy: valores del entrenamiento anterior](https://help.hevyapp.com/hc/en-us/articles/36011896355479-How-to-Use-Previous-Workout-Values-to-Improve-Performance-in-Hevy): referencia histórica en contexto; diferencia entre consultar resultados y rellenar campos.
- [Hevy: registro de entrenamientos](https://www.hevyapp.com/features/track-workouts/): interacción en filas y consulta del rendimiento previo. Se adapta la interacción al producto, sin agregar funciones sociales ni temporizador.
- [Hevy: progreso](https://www.hevyapp.com/features/gym-progress/): frecuencia y resultados por ejercicio como preguntas distintas.
- [Strong: corrección de un entrenamiento anterior](https://help.strongapp.io/article/249-how-do-i-edit-a-past-workout): conservación del registro con corrección explícita.

## Alcance de la comprobación

Compilación de producción y revisión estática de código y diseño. No se escribieron ni ejecutaron tests ni automatización de navegador, por la instrucción vigente. No se modificaron los datos reales ni se publicaron el informe del usuario, sus ejemplos o capturas. Falta confirmar la comodidad y los gestos en un teléfono real; compilar y desplegar no demuestra esa comodidad.

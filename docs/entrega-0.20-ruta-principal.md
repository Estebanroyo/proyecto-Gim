# Entrega local 0.20 · ruta principal E3–E8

Estado: **IMPLEMENTADO_NO_VALIDADO**. Cierre de implementación local del pedido de completar la ruta principal. No es una publicación ni una validación funcional. Continuación de las entregas [0.13](entrega-0.13-montaje.md), [0.13.1](entrega-0.13.1-continuidad.md), [0.14](entrega-0.14-biblioteca.md) y [0.15](entrega-0.15-objetivos.md).

## 1. Resultado y alcance

La aplicación conserva Entrenar, Historial y Configuración. El registro simple sigue teniendo una acción principal. Preparación de grupos, modalidades, alternativas y reglas está en Configuración; adaptar una sesión es una acción secundaria desplegable. No se agregaron dependencias, imágenes, fuentes remotas, cuentas, servidor ni servicios pagos.

Las versiones 0.16–0.19 de la planificación eran etiquetas candidatas, no publicaciones realizadas: estas capacidades se integran en la entrega local 0.20. E9 sigue condicionado según §8 de la hoja de ruta; completar el plan no autoriza activar todas sus opciones sin necesidad.

## 2. Trazabilidad por función

Todas las filas de esta tabla tienen implementación local y revisión de código, pero **no validación de uso**. Los archivos son relativos a `app/src/`.

| Etapa / ID | Capacidad implementada | Archivos principales | Límite explícito |
|---|---|---|---|
| E3 / F05 | Objetivos por serie, rangos, carga y descanso opcionales; copia histórica | `prescription.ts`, `PrescribedSets.tsx`, `RoutineEditor.tsx`, `training.ts` | La prescripción no es un resultado; se conserva el contrato de 0.15 |
| E3 / F04 | Rol trabajo/calentamiento; añadir calentamiento a una sesión; fallo explícito con cero reps | `execution.ts`, `sessionFlow.ts`, `AdvancedSetForm.tsx`, `SessionSummary.tsx` | Los registros antiguos sin rol no se etiquetan retrospectivamente |
| E3 / F01 | Descanso persistente, pausa, reanudar, omitir; duración por objetivo, ejercicio y ronda | `Rest.tsx`, `App.tsx` | Sin aviso garantizado con pantalla bloqueada, sonido ni vibración |
| E4 / F07 | Posponer, retomar, cambiar orden y sustituir por alternativa preparada; conserva resultados del original | `sessionFlow.ts`, `SessionTools.tsx`, `ExerciseOptions.tsx` | Cambios en la sesión, no en la plantilla; no hay reversión automática de una sustitución |
| E4 / F06 | Grupos ordenados de 2–6 miembros, rondas, trabajo desigual y descanso al cierre efectivo | `GroupEditor.tsx`, `execution.ts`, `Rest.tsx` | Solo ejercicios simples de peso/reps; sin mezclar automáticamente lados, tramos o tiempo |
| E4 / PLAN01 | Versión corta marcada previamente; omite pendientes de bloques preparados | `ExerciseOptions.tsx`, `sessionFlow.ts` | No decide por el usuario qué ejercicios son menos importantes; lo realizado permanece |
| E5 / F10 | RIR opcional 0–10, desconocido si está vacío; asistencia separada | `AdvancedSetForm.tsx`, `execution.ts` | RIR solo para series simples; sin RPE ni inferencias de fatiga |
| E5 / F09 | Carga/reps izquierda y derecha, igualar explícito, avance parcial y cierre con dato faltante visible | `AdvancedSetForm.tsx`, `SideProgress.tsx`, `weight.ts` | Una serie principal; no inventa lado faltante ni convierte asistencia en carga negativa |
| E5 / F08 | Dropset descendente por tramos confirmados, corrección y cierre explícito | `AdvancedSetForm.tsx`, `execution.ts` | Hasta 30 tramos; el descanso y avance principal empiezan al cerrar |
| E6 / F11 | Objetivo y resultado por segundos, cronómetro opcional y borrador temporal | `AdvancedSetForm.tsx`, `exerciseConfig.ts`, `prescription.ts` | Un cronómetro abierto no es duración confirmada ni medición fisiológica |
| E6 / F12 | Cardio manual, duración y distancia opcional m/km; velocidad, inclinación y resistencia | `AdvancedSetForm.tsx`, `catalog.ts` | Sin GPS, potencia, frecuencia cardiaca ni cálculo de calorías |
| E7 / F13 | Bloques independientes; copiar grupos/planes con IDs nuevos; plan JSON portátil sin historial | `portable.ts`, `PlanLibrary.tsx`, `PlanPreview.tsx` | El archivo portátil excluye equipo concreto y alternativas; no sustituye al respaldo completo |
| E7 / F15 | Plantilla CSV propia, análisis por fila, elección de alias y confirmación conjunta | `planCsv.ts`, `PlanLibrary.tsx` | No importa Excel arbitrario ni resultados históricos; no descarta columnas desconocidas |
| E8 / F19 | Historial con roles, fallos, abiertos, tramos y segundos; frecuencia y comparación contextual | `ProgressPanel.tsx`, `SideProgress.tsx`, `SessionSummary.tsx`, `progress.ts` | No suma modalidades incompatibles ni usa tiempo de pestaña como tiempo entrenado |
| E8 / F14 | Regla de doble progresión elegida: hechos, propuesta, aceptar futuro o descartar | `progression.ts`, `ProgressionPanel.tsx`, `ExerciseOptions.tsx` | No aplica cambios automáticamente ni evalúa técnica/recuperación |
| E2 / CAT01 | 35 variantes locales; añade isométrico y dos referencias de cardio a la biblioteca previa | `catalog.ts` | Los 150 candidatos de investigación siguen siendo una reserva, no una importación automática |
| R02 transversal | Datos v5 y respaldo 3, lectura anterior y copia previa antes de primera escritura | `training.ts`, `storage.ts`, `backup.ts`, `useRegistro.ts` | No se ejecutó una migración sobre datos reales del usuario |

## 3. D25 · Contrato de datos y transición

- Versión de interfaz: **0.20.0**. Registro escrito: **5**. Respaldo completo emitido: **3**. Plan portátil: **1**; son contratos diferentes.
- La autoridad sigue siendo la clave histórica `gim.app.entrenamientos.v3`. El sufijo no describe el JSON actual. No crear una segunda autoridad editable con nombre v5.
- El lector acepta fuentes v1/v2/v3/v4/v5; valida y normaliza la envoltura en memoria a v5. Abrir la app no reescribe datos ni infiere roles, variante, equipo, lados o esfuerzo faltantes.
- Antes de escribir sobre JSON v3 conserva el texto original en `gim.app.transicion-v4.original-v3`, nombre mantenido por compatibilidad. Si la fuente es v4, usa `gim.app.transicion-v5.original-v4`.
- Si falla la copia previa, se cancela la escritura principal. Si falla la escritura principal, el dato confirmado anterior sigue siendo autoridad; la interfaz no confirma el cambio. La copia previa no es otro registro operativo ni respaldo externo.
- Se compara el texto actual con la base de la pestaña antes de guardar y otra vez después de preparar la copia. `localStorage` no ofrece una transacción entre estas operaciones: persiste una carrera entre pestañas. Usar una pestaña evita ese problema habitual; no se promete coordinación transaccional.
- Si existe la autoridad y no se puede interpretar, no se cae silenciosamente a un registro viejo o vacío. No se borra almacenamiento para actualizar.
- Cerrar/actualizar pestañas antiguas antes de continuar. Lectores anteriores rechazan versiones nuevas; no hay degradación con descarte de campos ni restauración automática a código viejo.
- Respaldo 1 requiere datos v3, respaldo 2 datos v4 y respaldo 3 datos v5. El lector conserva compatibilidad con los tres. Validar y clonar el registro completo evita olvidar modalidades, grupos, bloques y excepciones al exportar.
- Límite de respaldo: 2 MiB, además de la cuota del navegador. La copia previa ocupa espacio adicional; no se introduce IndexedDB sin una necesidad de transacciones o crecimiento observada.

Los objetivos materializados para sesiones nuevas tienen IDs propios y rol de trabajo por defecto. Las sesiones antiguas mantienen sus campos originales; un objetivo virtual de lectura no se convierte en dato histórico inventado. Las rutinas, los bloques y las sesiones son copias independientes.

## 4. D26 · Resultados, roles y unidades

| Modalidad | Registro principal | Cuándo resuelve el turno | Opcionales compatibles |
|---|---|---|---|
| Repeticiones | Peso externo y reps completas | Al confirmar; un fallo explícito también resuelve el intento | Rol, RIR, asistencia separada |
| Lados | Izquierda/derecha con su peso y reps | Al cerrar explícitamente, incluso si falta un lado | Rol y asistencia separada |
| Tramos | Lista de cargas descendentes y reps; IDs/fechas por tramo | Al cerrar la serie principal | Rol; no RIR, lados ni asistencia |
| Tiempo | Segundos reales | Al confirmar | Rol, carga externa opcional |
| Cardio | Segundos reales | Al confirmar | Rol, carga, distancia, velocidad, inclinación o resistencia |

RIR es una estimación personal entera 0–10: cero declara que no quedaba otra repetición; vacío es desconocido. No equivale a fallo técnico medido. Cero repeticiones exige `estado: fallida` en una serie simple. Un intento fallido permite avanzar, pero no integra las marcas ni las series de trabajo exitosas.

El resumen distingue trabajo exitoso, calentamientos, fallos, roles desconocidos y series abiertas. Son dimensiones: un calentamiento fallido puede aparecer en calentamientos y fallos; no sumar esas cifras como categorías mutuamente excluyentes. Tramos son hijos, no series extra. Segundos son actividad explícitamente confirmada, no `finalizadaEn - creación`.

Peso total, por mancuerna, lastre y por lado tienen significado explícito. El criterio de repeticiones puede ser totales, por lado o alternadas totales. La modalidad izquierda/derecha exige criterio por lado; las temporales no llevan criterio de reps. No se divide, duplica ni convierte un número histórico para completar metadatos faltantes.

La asistencia se guarda aparte y se excluye de la comparación de carga externa y progresión. No se calculan calorías fiables desde kg/reps. Las correcciones conservan ID, vínculo/rol del objetivo y estado abierto/cerrado; no arrancan otro descanso.

## 5. D27 · Flujo de sesión

- El motor cuenta turnos resueltos, no filas de tramos ni un lado como otra serie. Los objetivos de calentamiento no consumen trabajo planificado.
- En un grupo prioriza trabajo menos avanzado y calentamientos pendientes antes del siguiente trabajo, respetando orden de miembros. Objetivos desiguales no fabrican series extra.
- Pospuesto sigue pendiente, queda fuera de la propuesta automática y se retoma explícitamente. Omitido no es hecho ni fallido. Se conserva motivo `usuario`, `version-corta` o `sustituido`.
- Cambiar orden afecta solo a la copia de sesión. Sustituir conserva el original y sus series, omite su pendiente y añade una copia nueva de la alternativa preparada con vínculo al original. Usa la cantidad/objetivos propios de la alternativa, no interpreta equivalencia fisiológica ni transfiere la carga del original.
- En grupos, una alternativa debe ser simple. Lados/tramos abiertos deben cerrarse antes de omitir o sustituir; se protege el trabajo parcial.
- La versión corta omite solo pendientes marcados previamente; si un miembro está marcado, afecta pendientes del grupo completo. Mantiene lo ya registrado. Una omisión distinta de sustitución puede restaurarse en sesión abierta.
- Reiniciar con la herramienta de prueba borra resultados y pospuestos de esa sesión tras confirmar; mantiene el plan efectivo, sustituciones y omisiones, para no resucitar simultáneamente original y sustituto. No es deshacer.

## 6. D28 · Descanso y borradores

El registro principal se persiste antes de confirmar, avanzar o iniciar descanso. `Rest.tsx` guarda un instante de fin y calcula lo restante con `Date.now()`. El intervalo solo repinta el panel, sin volver a renderizar toda la app cada medio segundo. Al volver a foco/recargar se consulta el estado local; si venció, aparece terminado.

Prioridad fuera de grupo: objetivo → ejercicio → preferencia general (90 s iniciales, desactivable o cero). En un grupo de trabajo, el descanso de ronda tiene prioridad al cierre efectivo; pospuestos y omitidos no bloquean ese cierre. El calentamiento dentro de grupo solo usa descanso específico del objetivo, si se declaró. Guardar un tramo o un lado abierto no inicia el descanso principal. Correcciones no lo reinician. Cierre/reinicio/nueva sesión retiran el descanso incoherente.

Claves auxiliares: `gim.app.descanso.v1`, `gim.app.descanso-ajustes.v1` y `gim.app.borrador-avanzado.v1.<sesión>.<ejercicio>.<registro|nuevo>`. No forman parte del respaldo principal. El borrador avanzado guarda texto y contexto de sesión/objetivo/resultados; recuperarlo no confirma una serie. Se elimina después de guardar correctamente; ante fallo permanecen los campos.

El cronómetro opcional de tiempo/cardio conserva inicio y acumulado en borrador; «usar tiempo» lo copia al formulario y todavía exige confirmación. Si falla guardar metadatos del descanso, el resultado ya confirmado se mantiene y aparece aviso independiente. Sin notificación garantizada en segundo plano ni con pantalla bloqueada.

## 7. D29 · Bloques, planes portátiles y CSV

Guardar un bloque y copiarlo al plan crea nuevas identidades de rutina/ejercicios/objetivos/grupos. Se conserva identidad de variante, sin compartir referencias editables. Las sesiones existentes no se cambian.

### Plan JSON y respaldo son diferentes

Plan JSON: envoltura `aplicacion: gim-plan`, `formatoPlan: 1`, `plan`. Exportación por lista explícita de campos. Incluye nombres de rutina, ejercicios y grupos, objetivos, modalidades, criterios y reglas. Excluye historial, notas de sesiones, preferencias, equipos concretos y alternativas. Notas del plan y montaje se incluyen únicamente con elección explícita, porque pueden contener información privada. No se promete anonimato: nombres introducidos por el usuario también pueden identificarlo.

El respaldo completo conserva sesiones, rutinas personalizadas y bloques, incluidas notas y equipos; es una copia privada local. Exportar un plan no equivale a respaldo completo. Los nombres `gim-plan*.json`, `gim-bloque*.json` y `gim-plan.csv` se excluyen de publicación mediante patrones concretos, sin ignorar todos los JSON.

### Especificación CSV de esta entrega

UTF-8, separador `;`, punto decimal; campos con comillas dobles y escape `""`. Encabezado exacto, en este orden:

```text
rutina;ejercicio;variante_id;personalizado;grupo;series;reps_min;reps_max;carga_kg;descanso_s;modalidad;duracion_s;equipo_id;equipo_nombre;criterio_peso;criterio_reps
```

| Columnas | Significado y límites |
|---|---|
| `rutina`, `ejercicio`, `grupo` | Título de plan, nombre visible y grupo muscular; filas de igual título forman un plan |
| `variante_id`, `personalizado` | ID de catálogo explícito o `personalizado=si`; no ambos. Alias sin ID exige elección, incluso si hay una candidata |
| `series` | Entero 1–100; mismo objetivo repetido por fila |
| `reps_min`, `reps_max` | Enteros 1–100, mínimo ≤ máximo; vacíos en tiempo/cardio |
| `carga_kg` | Opcional, 0–1000 kg externos; cero no equivale a peso corporal |
| `descanso_s` | Opcional, entero 0–3600 s; cero es sin descanso |
| `modalidad`, `duracion_s` | Repeticiones, tiempo o cardio; duración obligatoria 1–86400 s para las dos últimas |
| `equipo_id`, `equipo_nombre` | Ambos o ninguno; importación explícita. Exportación CSV los deja vacíos para no compartir equipo privado |
| `criterio_peso` | total, por-mancuerna o lastre; por-lado exige la modalidad correspondiente del editor |
| `criterio_reps` | Vacío o totales, por-lado, alternadas-totales; vacío obligatorio en modalidades temporales |

Archivo hasta 2 MiB, hasta 1000 filas y hasta 5000 objetivos expandidos, además de límites del esquema de rutinas. Los errores usan número de fila lógica CSV (incluyendo encabezado), no línea física si hay celdas multilínea. La plantilla descargable contiene ejemplos ficticios.

CSV no representa grupos, lados, tramos, objetivos distintos por serie, calentamientos, notas, montaje, RIR, progresión, alternativas ni versión corta. Exportar un plan con esos detalles se rechaza con explicación para usar JSON; no se eliminan silenciosamente. No se evalúan fórmulas ni código. Exportar celdas que podrían interpretarse como fórmulas antepone apóstrofo; al reimportar ese apóstrofo puede seguir formando parte del texto por seguridad.

Analizar/seleccionar/cancelar no modifican el registro. La vista previa muestra ejercicios, objetivos, modalidades y grupos. Confirmar aplica todos los planes en una escritura validada. Agregar bloquea títulos repetidos; reemplazar requiere coincidencia exacta y única, conserva ID de rutina y renueva instancias para las sesiones futuras. Si el registro cambió desde el análisis, se debe analizar otra vez. No hay media importación ni sobreescritura del historial. El historial y las sesiones ya creadas conservan sus copias.

## 8. D30 · Historial y propuesta de progresión

Comparación simple: misma instancia/rutina, modalidad, variante, equipo y criterio de carga/reps compatibles; solo trabajo sin fallo ni asistencia. No unir por nombre similar. En máquinas/poleas/Smith vinculadas a catálogo, falta de equipo concreto impide asumir equivalencia entre sesiones. El cambio de nombre de una variante vinculada no rompe su identidad. Los lados se comparan por separado y solo si están registrados en una serie cerrada compatible. Otros modos conservan el detalle sin inventar una marca comparable con peso/reps.

La frecuencia cuenta fechas con registros, incluso sesiones parciales, y etiqueta la semana actual como incompleta. El resumen separa roles, tramos, abiertos y actividad temporal. No convierte segundos en duración de toda la sesión ni los días sin registro en ausencias programadas.

La regla de doble progresión está desactivada hasta que el usuario la elige por ejercicio simple. Exige variante, criterio explícito de peso y repeticiones, rango, cantidad de series e incremento posible declarado. La última sesión finalizada compatible y no futura debe tener exactamente esas series de trabajo vinculadas, del rango elegido, sin omisiones, fallo, asistencia o registros abiertos. Todas deben alcanzar el máximo a la misma carga. La cantidad futura también debe coincidir.

Primero se muestra el hecho registrado; después la propuesta `carga + incremento`. Aceptar solo actualiza objetivos de trabajo de la plantilla futura; no reescribe resultados ni sesiones creadas. Descartar recuerda esa evidencia/regla en `gim.app.progresion-descartada.v1`, sin insistir por el mismo caso. El descarte es preferencia local, no parte del respaldo. No mide técnica, recuperación ni esfuerzo real; no prescribe automáticamente.

## 9. Referencias de UX adaptadas

Consultadas en esta ejecución; documentación oficial de producto, usada para patrones de registro y preparación, no como evidencia fisiológica ni garantía de usabilidad propia:

- [Hevy: prescripción por serie](https://www.hevyapp.com/features/how-to-write-sets-and-reps/): objetivo separado del resultado y detalle por fila.
- [Hevy: tipos de serie](https://help.hevyapp.com/hc/en-us/articles/34896293707927-Set-Types-in-Hevy-Explained-Drop-Sets-Warm-Up-Sets-and-More): roles y tramos visibles; aquí cero exige fallo explícito, sin repetición ficticia.
- [Hevy: descanso](https://help.hevyapp.com/hc/en-us/articles/35385404949143-Rest-Timer-Default-Rest-Timer-How-to-Add-Adjust-Volume-and-Sound): duración general y excepciones. No se copian promesas de alarmas de una app nativa.
- [Hevy: circuitos y grupos](https://help.hevyapp.com/hc/en-us/articles/36954623739415-Circuits-Intervals-and-Supersets-Explained-How-to-Build-Them-in-the-Hevy-App) y [avance entre miembros](https://help.hevyapp.com/hc/en-us/articles/35650286563095-The-Complete-Guide-to-Supersets-and-Smart-Superset-Scrolling): grupo preparado y próximo turno reconocible.
- [Hevy: programación](https://www.hevyapp.com/features/exercise-programming-options/): preparar variantes/modalidades antes de entrenar.
- [Carbon Search](https://www.carbondesignsystem.com/building-blocks/core/components/search/guidelines): búsqueda explícita y selección de identidad, continuando E2.
- [MDN: descarga de archivo](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download): descarga local iniciada por acción. Preparar descarga no demuestra que el usuario haya conservado el archivo.

La escala RIR, los filtros de comparación y la regla de progresión son contratos propios descritos arriba. Se aplicó Impeccable Operate: controles nativos, detalles opcionales, componentes existentes y jerarquía de la tarea. No se atribuyen mejoras cuantificadas sin observar uso.

## 10. Evidencia y deuda técnica

- Revisión de código y compilación TypeScript de producción/Vite, generación del service worker y detector estático Impeccable. Consultar el cierre en [estado](estado-desarrollo-gim.md) para artefactos finales.
- `tsconfig.build.json` extiende el proyecto y excluye fixtures `*.test.ts/tsx` de la compilación de producción. No se modificaron ni ejecutaron esos tests; algunos siguen representando v3. El script de tests existente no constituye cobertura de v5.
- Sin tests, automatización de navegador, renderizado inspeccionado, mediciones de fluidez, migración de datos reales, restauración real ni validación táctil. HTTP estático confirma entrega de archivos, no funcionamiento de formularios/offline.
- La persistencia principal sigue siendo síncrona y sin transacciones entre pestañas. Las combinaciones avanzadas están limitadas deliberadamente a las declaradas. Los componentes nuevos deben ajustarse con evidencia real si generan fricción en celular.
- No se copió código a `.deployment-repo`, no se subió a GitHub ni se publicó esta entrega. No se accedió al almacenamiento personal del navegador.

### Criterios pendientes de validación, no verificaciones realizadas

Conservar evidencia del teléfono cuando el usuario use la versión: ergonomía con teclado, vuelta después de interrupción, alternancia con miembro pospuesto, fallo de guardado, tramos abiertos/corregidos, lado faltante, tiempo/cardio y m/km, importación cancelada/con conflictos, restauración entre formatos y actualización desde v3/v4. Offline requiere preparar recursos previamente. No ejecutar automatización ni tests para cubrir estos criterios mientras siga la restricción.

## 11. E9 y próximo trabajo

| ID | Estado | Condición necesaria para abrir implementación |
|---|---|---|
| F16 | CONDICIONADO | Uso real de rest-pause/cluster; definir pausas internas persistidas |
| F17 | CONDICIONADO | Necesidad de rotación/ciclos por encima de elegir Día 1/2/3 |
| F18-A | CONDICIONADO | El equipo mínimo con identidad no alcanza para varios gimnasios |
| F20 | CONDICIONADO | Pregunta concreta que requiere peso/medidas voluntarias y alcance de privacidad |
| F22 | CONDICIONADO | Uso de sesiones libres y conversión posterior a plantilla |
| F23 | CONDICIONADO | Cálculos repetidos con barra y discos realmente disponibles |
| F24 | CONDICIONADO | Respaldo manual insuficiente; diseñar identidad, autenticación, conflictos, privacidad, borrado, offline y coste |

No hay ticket de implementación activo al cerrar E8. La siguiente acción es recoger evidencia de uso de la ruta principal y resolver hallazgos concretos. No volver a añadir funciones solo por completar el backlog condicionado. La publicación requiere pedido independiente; no confundir disponibilidad local con actualización pública.

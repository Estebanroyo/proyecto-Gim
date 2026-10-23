# Hoja de ruta de GIM · producto, UX, UI y datos

Creación: **22/10/2026**. Última revisión: **23/10/2026**. Revisión del documento: **7**.
Base observada: **app 0.12.0**, registro **v3**, referencia del checkout local **69eb949**.
Estado: **ruta principal E1–E8 IMPLEMENTADO_NO_VALIDADO en versión local 0.20.1; E9 CONDICIONADO; sin publicación de esta entrega**. El mapa inicial sigue referido a v0.12; avances actuales en [estado de desarrollo](estado-desarrollo-gim.md).

Revisión contra código y hallazgos concretos: [cobertura/usabilidad 0.20.1](revision-plan-usabilidad-0.20.1.md). La limpieza de historial solicitada se ejecutó de forma recuperable; no convierte los demás criterios en validados.

## 1. Cómo usar este documento sin perder contexto

Este es el plan canónico. [Estado de desarrollo](estado-desarrollo-gim.md) es el punto de reanudación y registro operativo. No mantener otra lista independiente de prioridades.

Lectura al retomar: estado → etapa y ficha de trabajo aquí → decisiones y reglas de datos → archivos afectados. Leer la investigación completa solo si la tarea depende de un matiz no resumido. Una función mencionada aquí no existe por ese solo hecho.

Fuentes de verdad, por propósito:

| Archivo | Qué determina |
|---|---|
| `../AGENTS.md` | Instrucciones y restricciones vigentes; prevalecen las instrucciones posteriores del usuario |
| `../PRODUCT.md` y código en `../app/src/` | Producto actual y comportamiento implementado; investigar discrepancias |
| [Investigación 2021–2026](investigacion-gimnasio-2021-2026.md) | Evidencia, límites, técnicas y backlog F01–F24 |
| [Catálogo de investigación](catalogo-ejercicios-investigacion-2026.md) | 150 entradas candidatas; E001–E150 son referencias documentales, no IDs de la app |
| Este documento | Orden propuesto, decisiones, dependencias y aceptación futura |
| [Estado de desarrollo](estado-desarrollo-gim.md) | Qué se hizo realmente, qué falta y siguiente acción exacta |
| [Revisión v0.12](revision-uso-v0.12.md) y `../DESIGN.md` | Hallazgos de uso previos y sistema visual que se conserva |

Si se contradicen una descripción y el código, registrar la diferencia; no modificar historial ni declarar una función terminada para hacer coincidir los documentos.

## 2. Diagnóstico y dirección de producto

**Objetivo:** que una persona con su rutina preparada pueda registrar lo que realmente hizo, retomar después de una interrupción y consultar resultados comparables, con pocas decisiones entre series.

La investigación es exploratoria: combina testimonios, documentación de apps, informes y estudios con alcances distintos. No demuestra que todas las técnicas sean populares, mejores o necesarias para este usuario. La prioridad de esta hoja es una decisión de producto apoyada en esa investigación, no una conclusión estadística.

La cobertura útil no se mide por cuántos ejercicios se agregan. Se mide por si la app representa correctamente una máquina ocupada, un calentamiento, un resultado por lado o una serie interrumpida, sin obligar a inventar datos.

Dirección: **confiabilidad y comodidad → identidad y búsqueda → plan y ejecución flexibles → mediciones ampliadas → planificación y análisis**. La app sigue siendo una bitácora personal, gratuita de usar en su arquitectura actual, sin gestión de clientes, nutrición ni red social.

### 2.1. Línea base v0.12 que debía preservarse

- React, TypeScript, Vite, vite-plugin-pwa; interfaz en español con voseo.
- Entrenar, Historial y Configuración; diseño grafito/lima, recursos locales y navegación móvil inferior.
- Una sesión por rutina y fecha, copia del plan al crearla, cierre parcial y recuperación de última sesión/ejercicio.
- Alta al confirmar junto a los campos, corrección desde los valores visibles, atajos de suma/resta y borrador local de serie.
- Carga inicial desde la primera serie anterior compatible, no desde la más pesada; en la sesión actual se conserva la última carga usada.
- Deslizamiento lateral y anterior/siguiente, con animación; el gesto vertical no debe quedar atrapado en la tabla.
- Criterio de carga opcional en v3; datos antiguos sin criterio no se convierten retrospectivamente.
- Consulta de resultados anteriores, frecuencia semanal y comparación a igual carga y criterio.
- Editor de rutinas, respaldo JSON, vista previa de importación y detección de conflictos.
- Publicación conocida en GitHub Pages. Offline requiere preparación previa; datos por navegador/origen, sin cuentas ni sincronización.

En la línea base v0.12, no confundir cobertura parcial con función completa: se podía elegir otro ejercicio, pero no posponerlo formalmente; las biseries escritas en notas no constituyen un motor de rondas; el editor no es una biblioteca buscable; la sesión «sin rutina» no es un constructor libre completo.

### 2.2. Límites reales al iniciar el plan

El informe de uso anterior fue en ventana angosta, no teléfono físico. Hubo compilación y despliegue de v0.12, pero no validación táctil ni de teclado móvil por el agente. No hay métricas de comodidad o rendimiento medidas. La preferencia de no realizar tests ni automatización de navegador continúa vigente.

La revisión de privacidad no encontró credenciales comunes ni entrenamientos reales publicados en los archivos revisados. Sí son públicos el usuario del repositorio, la rutina precargada y documentación del producto. Existen referencias locales con rutas personales que no deben copiarse indiscriminadamente al checkout de publicación. No afirmar seguridad exhaustiva ni que localStorage esté cifrado.

## 3. Priorización y mapa de entregas

Cada etapa entrega una capacidad completa: configuración → uso → corrección → historial → respaldo. No entregar solo una pantalla que guarda campos descartados al exportar.

S/M/L/XL expresan complejidad relativa, no horas ni compromiso de calendario. Las versiones son **etiquetas candidatas**; revalidar al comenzar cada entrega. Las etapas avanzadas pueden omitirse si no aportan valor al uso real.

| Etapa | Versión candidata | Resultado | Contenido principal | Tamaño | Entrada |
|---|---|---|---|---|---|
| E0 | Sin versión de app | Base y contratos de cambio claros | R00–R02; privacidad, continuidad, mapa de datos | S/M | Estado actual |
| E1 | 0.13 | Recordar equipo y retomar con confianza | F02, F21; tarjeta de montaje y respaldo | M | E0 |
| E2 | 0.14 | Encontrar y distinguir variantes | F03, mínimo de F18; identidad de catálogo/equipo | L | E1; R02 |
| E3 | 0.15a/b | Plan por serie, calentamiento y descanso | F05 → F04 → F01 | L, en cortes | E2; contrato de migración |
| E4 | 0.16a/b | Adaptarse a máquinas ocupadas y alternar | F07 → F06 | L/XL, en cortes | E3 |
| E5 | 0.17a/b/c | Registrar esfuerzo, lados y tramos | F10, F09, F08 | L/XL, separados | E3; E4 para combinaciones |
| E6 | 0.18a/b | Tiempo, isométricos y cardio sencillo | F11 → F12 | M/L | E3; unión de resultados definida |
| E7 | 0.19a/b | Reutilizar y trasladar planes | F13, F15; bloque portátil y plan corto | M/L | E4; tipos exportables de E5/E6 según alcance |
| E8 | 0.20a/b | Analizar y decidir objetivos con contexto | F19 → F14 | L | Datos comparables de etapas previas |
| E9 | Sin versión comprometida | Expansión condicionada | F16–F18 ampliado, F20, F22–F24 | Variable | Necesidad concreta y decisión registrada |

**Orden de implementación concluido localmente:** E1/E2/F05, después E3–E8 según el pedido de completar la ruta principal. La siguiente acción es recoger evidencia de uso y resolver hallazgos concretos, sin activar E9 automáticamente. Contratos y trazabilidad en [entrega 0.20](entrega-0.20-ruta-principal.md).

### 3.1. Cambios de prioridad respecto del informe

- Se adelanta un identificador mínimo de equipo/variante de F18 a E2: es necesario para no transferir cargas entre máquinas distintas. Administrar múltiples gimnasios queda condicionado en E9.
- F05 precede a F04/F06: contar correctamente requiere objetivos y roles de serie, no solo sumar filas.
- F07 precede al motor de grupos: una biserie no debe quedar en un bucle cuando falta una estación.
- F19 ya existe parcialmente en v0.12; se amplía, no se reconstruye de cero.
- F24 sigue condicionado. Preservar datos no obliga a crear cuentas o contratar infraestructura.

## 4. Reglas de UX y UI para todas las etapas

Aplicar Impeccable en modo Operate. Investigar referencias actuales en fuentes oficiales para cada cambio de UX; anotar fuente, fecha y qué se adapta. Un patrón de otra app no demuestra eficacia de entrenamiento ni obliga a copiar sus funciones.

| Área | Regla de experiencia | Criterio observable de aceptación futura |
|---|---|---|
| Entrenar | La tarea actual manda | Dato, unidad, referencia y confirmación se entienden juntos; una acción principal de registro |
| Detalles | Divulgación progresiva por ejercicio | RIR, lado, tempo o tramos no aparecen en ejercicios que no los usan |
| Guardado | Confirmar después de persistir | Si falla, quedan los valores y no avanzan ejercicio, ronda o descanso |
| Interrupción | Contexto recuperable | Diferenciar sugerencia, borrador y último registro confirmado; no mostrar borrador como resultado |
| Navegación | Gesto y control explícito | Arrastre lateral se ajusta a una ficha; desplazamiento vertical y campos no quedan bloqueados |
| Corrección | En contexto | Corregir una serie, lado o tramo sin recorrer otra pantalla ni perder el borrador siguiente |
| Configuración | Preparar antes de entrenar | Equipo, reglas, grupos y detalles avanzados quedan aquí; acciones excepcionales desplegables |
| Historial | Explicar antes que decorar | Unidad, variante, criterio, estado y contexto temporal visibles; sin marcas entre registros incompatibles |
| Estados | No fabricar resultados | Cero, desconocido, omitido, pendiente e interrumpido tienen representación distinta |
| Móvil | Conservar el trabajo con teclado/interrupciones | No depender de hover, gesto único, sonido, vibración o una pantalla siempre encendida |
| UI | Conservar identidad y legibilidad | Reusar tokens, tipografías e iconos existentes; mantener cifras y acciones legibles con nombres largos |
| Recursos | Arranque pequeño y offline explícito | No descargar vídeos ni todo el catálogo para registrar una serie; procedencia/licencia documentada |

No convertir cada etapa en un rediseño de colores. La ampliación de UI debe explicar un nuevo estado o dato. No se fija una puntuación UX ni una reducción porcentual de toques sin medición.

## 5. Registro de decisiones que no se deben redescubrir

**Vigente** = restricción o comportamiento actual que se conserva. **Propuesta** = dirección de diseño de esta hoja, a concretar al implementar. **Condicionada** = no hay compromiso de construirla.

| ID | Estado | Decisión y motivo | Condición para revisarla |
|---|---|---|---|
| D01 | Vigente | Producto personal, tres módulos, una sesión/rutina/fecha | Pedido explícito que cambie el modelo de uso |
| D02 | Vigente | Plan y resultados separados; cada sesión conserva copia | Nunca reescribir historia para acomodar una edición de catálogo |
| D03 | Vigente | Guardar antes de confirmar/avanzar; borrador no es serie | Cualquier ampliación debe conservar la regla |
| D04 | Vigente | Preservar IDs y valores antiguos; desconocido no se inventa | Una declaración explícita del usuario puede agregar contexto, nunca una inferencia silenciosa |
| D05 | Vigente | Carga inicial anterior = primera serie comparable | Cambiar solo si el usuario pide otra política; el motor de progresión ofrece un objetivo, no lo sustituye en silencio |
| D06 | Vigente | Sin tests ni automatización de navegador mientras siga la instrucción | Solo una instrucción posterior del usuario la cambia |
| D07 | Vigente | Coste objetivo cero; no contratar servicios | Cualquier gasto requiere autorización explícita |
| D08 | Aplicada en D21/E2 | Familia, variante e instancia en rutina son identidades distintas | Resolver nombres del contrato en R02, conservando el significado |
| D09 | Aplicada en D22/E2 | Equipo concreto forma parte de la comparación cuando cambia la carga | No hace falta un administrador de gimnasios para darle identidad |
| D10 | Aplicada localmente en 0.20 | Calentamiento, estructura, agrupación y esfuerzo son dimensiones independientes | No reemplazar por un único selector de «tipo de serie» |
| D11 | Aplicada localmente en 0.20 | Dropset = serie principal con tramos; lados no duplican la serie principal | Mostrar conteos separados; no afirmar equivalencia fisiológica |
| D12 | Aplicada localmente en 0.20 | Temporizador basado en instante de fin persistido | Nunca depender de contar ticks en una pestaña en segundo plano |
| D13 | Aplicada localmente en 0.20 | Detalles avanzados opcionales por ejercicio | No agregar un modo avanzado obligatorio ni un formulario universal |
| D14 | Aplicada localmente en 0.20 | Local primero; IndexedDB solo con necesidad justificada | No backend por el solo hecho de ampliar el modelo; evaluar transacciones y tamaño |
| D15 | Vigente | Publicar solo código/documentación seleccionados | El pedido posterior autoriza implementación local de la ruta principal; no es una orden de despliegue |
| D16 | Condicionada | Sincronización es un proyecto separado | Requiere conflictos, privacidad, costes y continuidad offline resueltos |
| D17 | Aplicada localmente en 0.20 | Los 150 candidatos son una reserva editorial | Incorporar los que se usan y una muestra por modalidad, no una meta de cantidad |
| D18 | Aplicada 22/10/2026 en F02 | Montaje en instancia de ejercicio/rutina y copia histórica; nota de sesión separada. Campos opcionales v3 y respaldo explícito. La etiqueta de equipo no sustituye una identidad estable | Ampliar en E2/F18-M sin unir históricos por nombre; contrato en entrega-0.13-montaje.md |
| D19 | Aplicada 22/10/2026 en F21 | Borrador de nota separado y ligado a base contextual; recuperar no confirma | Contrato en entrega-0.13.1-continuidad.md |
| D20 | Aplicada 22/10/2026 en F21 | Huella del archivo preparado, aviso en Configuración y posposición siete días; no prueba copia externa | Contrato en entrega-0.13.1-continuidad.md |
| D21 | Aplicada 22/10/2026 en E2 | Familia/variante/instancia separadas; vínculo explícito, sin unir históricos por nombre; preferencias fuera del registro | Contrato R02 en entrega-0.14-biblioteca.md |
| D22 | Aplicada 22/10/2026 en E2 | Equipo concreto por UUID copiado; sin transferir cargas entre aparatos no identificados en nuevas variantes vinculadas | Límites legados y exportación en entrega-0.14-biblioteca.md |
| D23 | Aplicada 22/10/2026 en F05 | Escritura v4 en la clave histórica única; copia previa v3 y respaldo 2 con lectura de formato 1 | Migración, fallos y pestañas antiguas en entrega-0.15-objetivos.md |
| D24 | Aplicada 22/10/2026 en F05 | Objetivos por serie con ID, rangos y opcionales; resultados vinculados sin modificar la prescripción; proyecciones escalares validadas | Modelo lineal actual; ampliar roles/resultado en F04 |
| D25 | Aplicada localmente en 0.20 | Registro v5 y respaldo 3; misma autoridad histórica y copias previas v3/v4 | Contrato y límites de transición en entrega-0.20-ruta-principal.md §3 |
| D26 | Aplicada localmente en 0.20 | Resultados discriminados por modalidad, roles, cierre explícito y criterios separados de peso/reps | Combinaciones permitidas en entrega 0.20 §4; sin reinterpretar desconocidos |
| D27 | Aplicada localmente en 0.20 | Motor de turnos, grupos simples y excepciones de sesión; original y sustituto conservados | Entrega 0.20 §5; grupos de 2–6 miembros, sin combinaciones implícitas |
| D28 | Aplicada localmente en 0.20 | Descanso por fin persistido, solo tras guardado resuelto; borradores auxiliares separados | Entrega 0.20 §6; sin garantías de alarma en segundo plano |
| D29 | Aplicada localmente en 0.20 | Bloques independientes, plan portátil por lista de campos y CSV propio limitado | Entrega 0.20 §7; importar no crea resultados ni sustituye respaldos |
| D30 | Aplicada localmente en 0.20 | Comparación contextual y propuesta optativa basada en hechos; aceptar solo cambia futuro | Entrega 0.20 §8; sin asistencia/fallos ni criterios desconocidos para progresión |

## 6. Base técnica y evolución del dato

### 6.1. Mapa técnico de la línea base v0.12

| Archivo/área | Responsabilidad actual | Implicación futura |
|---|---|---|
| `app/src/training.ts`, `workout.ts` | Tipos v3, validaciones, creación y modificación de series | Peso/reps es insuficiente para tiempo, asistencia, lados y tramos; hoy reps completas debe ser al menos 1 |
| `app/src/guided.ts` | Pendientes, avance, carga inicial y cierre | Requiere un motor de turnos/roles/grupos; contar todas las filas no sirve para calentamientos |
| `app/src/progress.ts`, `ProgressPanel.tsx` | Compatibilidad por rutina/ID/nombre y criterio | Hoy cambiar el nombre puede cortar comparación; reemplazar por identidad de variante, sin unir variantes distintas |
| `app/src/storage.ts`, `useRegistro.ts` | Lectura, validación y comprobación de cambios externos | Comprobar y escribir en localStorage no es una transacción atómica entre pestañas |
| `app/src/draft.ts` | Borrador por sesión/ejercicio y base de series | Ampliar la base a objetivos, turnos/lados/tramos cuando existan; no restaurar un borrador sobre otro turno |
| `app/src/backup.ts`, `BackupPanel.tsx` | Copia explícita de campos, respaldo y conflictos | Cada campo nuevo debe preservarse aquí; límite actual de respaldo de 2 MiB |
| `App.tsx`, `TrainingScreen.tsx`, `ExerciseSets.tsx` | Orquestación y registro | Extraer decisiones de ejecución al dominio al ampliar grupos; evitar que handlers de UI dicten el plan |
| `RoutineEditor.tsx`, `rutina.ts`, `weight.ts`, `ExerciseVisual.tsx` | Plantillas, criterios iniciales, referencias visuales | Los valores iniciales y las imágenes no detectan el equipo real; asociación al catálogo debe ser explícita |
| `app/vite.config.ts`, `.github/workflows/deploy.yml` | Manifest, precaché y base de publicación | Conservar `/proyecto-Gim/` en despliegue y `/` en local; service worker no almacena por sí solo resultados |

Mapa actual v0.20: consultar la arquitectura en `../app/README.md` y D25–D30. La tabla anterior se conserva para explicar las carencias iniciales; ya no describe las capacidades presentes.

### 6.2. Modelo conceptual y su evolución

| Concepto | Identidad y contenido | Invariante |
|---|---|---|
| Familia | ID y alias de búsqueda | Encontrar no significa combinar marcas |
| Variante | ID, familia, equipo/técnica y modalidades admitidas | Renombrar una etiqueta no cambia la identidad del movimiento |
| Equipo concreto | ID local y montaje | Dos máquinas distintas pueden no ser comparables |
| Ejercicio en rutina | ID actual, variante vinculada, orden y preferencias | No reemplazar el ID histórico por E001–E150 |
| Serie planificada | ID, rol, reps exactas/rango/tiempo, esfuerzo opcional | Es una prescripción; no una serie realizada |
| Grupo | Miembros ordenados, turnos/rondas y descansos | Alternancia independiente de resultados de cada ejercicio |
| Resultado de serie | ID actual o nuevo, vínculo opcional al plan, estado y modalidad | Un resultado puede ser parcial, fallido o no vinculado a plan |
| Tramo | ID/orden, resultados y pausa interna | Editar un tramo no crea otra serie principal |
| Lado | Identidad izquierda/derecha o bilateral declarada | «Iguales» es una acción explícita, no rellenado automático |
| Sesión | Copia efectiva, excepciones, posición y ejecución | Alterar una sesión no cambia la rutina base |
| Descanso | Origen del turno, inicio/fin/pausa y estado | No es duración fisiológica medida ni garantía de alarma |

Distinguir modalidad de resultado (carga/reps, peso corporal, tiempo, distancia/tiempo), criterio de carga (total, implemento, lado, lastre, asistencia) y criterio de repeticiones. kg/lb y m/km son unidades, no identidades de ejercicio. Un valor que falta no equivale a cero.

Los estados de planificación y de resultado no deben reducirse a un booleano `completo`. Ejemplo: un turno puede resolverse como intento fallido con cero reps completas, quedar registrado y permitir continuar, sin contarlo como una serie exitosa ni atribuirle una repetición ficticia. Definir esa transición y sus conteos antes de admitir cero en el formulario.

### 6.3. Contrato de migración y respaldo

1. R02 se resolvió por cortes: F02 aditivo v3; D23/F05 escritura v4 y respaldo 2; D25/ruta principal escritura v5 y respaldo 3. La clave histórica de autoridad se conserva; copia previa antes de escribir sobre v3/v4. Consultar el contrato completo de fallos en entrega 0.20, no diseñar otra autoridad paralela.
2. Especificar cómo se leen v1/v2/v3, cómo se conserva cada ID y qué campos quedan desconocidos. No inferir variante, equipo, rol o lado desde un nombre ambiguo.
3. Conservar las fuentes legadas hasta completar la transición. Nunca solucionar un error con `localStorage.clear()` ni borrando entrenamientos.
4. Preparar un nuevo registro por completo, validarlo y persistirlo antes de cambiar la autoridad de lectura. Documentar qué pasa si falla cada escritura y si hay pestañas con código antiguo. No prometer atomicidad de varias claves de localStorage.
5. En una versión nueva incompatible, impedir que una pestaña antigua aparente seguir escribiendo sobre una copia sin autoridad. Definir actualización/recarga y protección de borrador; no mantener dos registros editables divergentes.
6. Actualizar serialización, respaldo, importación, comparación de conflictos y límites junto al tipo nuevo. Un formato de exportación puede necesitar versión propia, distinta de la versión de la interfaz.
7. El retorno a v0.12 no debe abrir un registro v4 como si fuera v3. Proponer recuperación de solo lectura o exportación compatible explícita, sin descartar campos en silencio.
8. Evaluar IndexedDB si se necesitan transacciones o si la serialización/tamaño empieza a perjudicar el uso. Es decisión técnica justificada, no obligación de este plan.
9. Guardar imágenes/vídeos fuera del JSON de entrenamientos. El respaldo no contiene credenciales ni adjuntos personales por defecto.

## 7. Fichas ejecutables por etapa

Estas fichas conservan el alcance y los criterios del plan. E1–E8 tienen implementación local en 0.20; consultar evidencia y límites en la entrega y el estado antes de abrir cambios. Los criterios de aceptación no son pruebas ejecutadas ni autorización para ejecutarlas.

### E0 · Preparación acotada, sin frenar la primera mejora

**R00 · Línea base y recuperación.** Registrar versión de app/datos, archivos modificados y checkout de publicación. Confirmar qué evidencia existe y qué no. Anotar cómo conservar un respaldo sin acceder a datos reales ni enviarlos a GitHub. Aceptación: otro agente puede identificar la fuente local y no confunde una compilación con una prueba de uso. Tamaño S.

**R01 · Higiene de publicación.** Proponer exclusiones concretas para respaldos `gim-respaldo-*`, planillas personales y capturas privadas; revisar enlaces/rutas de docs. No ignorar todos los JSON ni borrar archivos útiles. Aceptación: lista de archivos a publicar revisable y sin datos personales añadidos. No reescribir el historial de Git ni cambiar visibilidad como efecto lateral. Tamaño S.

**R02 · Contrato de identidad y extensiones.** Concretar §6: identidad de variante/instancia, notas estables vs copia histórica, modos, turnos y estrategia v3/v4. Resolver renombrado sin mezclar variantes, y equipo mínimo antes de progresión. Aceptación: ejemplos de lectura legada, escritura nueva, fallo de almacenamiento y pestaña antigua documentados; ninguna migración ejecutada en datos reales. Tamaño M. No construir todos los tipos avanzados ahora: reservar extensiones y detallar solo la próxima entrega.

Salida de E0: R00/R01 y la parte de R02 necesaria para F02 están claras. R02 se amplía por etapas; no es una reescritura completa como requisito para agregar notas.

### E1 · Notas y continuidad · candidata 0.13

**F02 · Tarjeta de montaje persistente.** Problema: recordar asiento, respaldo, polea y agarre. Preparación: nota por equipo/variante, con texto libre breve y opción de editar. Entrenar: resumen compacto al entrar; distinguir «montaje habitual» de «nota de esta sesión». Datos: copiar la nota efectiva al crear/usar la sesión; actualizar la nota habitual no cambia el historial. Si aún no hay catálogo, usar una referencia local estable y documentar su vinculación posterior. Aceptación: nota editable, recuperable tras recarga y conservada en respaldo; el historial anterior conserva su texto; no aparecen campos vacíos en la ficha. Base: R00–R02. Tamaño M.

**F21 · Continuidad y respaldo con significado.** Entrenar: último dato confirmado, borrador recuperado y dónde retomar. Configuración: aviso discreto de respaldo según cambios desde la última exportación preparada y recordatorio posponible. Diferenciar «archivo preparado» de «archivo recibido/restaurado»: el navegador no demuestra que el usuario lo guardó bien. Aceptación: no se presenta como copia en la nube; exportar no borra nada; un error conserva formulario; al importar cambia de forma controlada el contexto de borrador. La recuperación sigue funcionando sin notificaciones. Base: almacenamiento/borrador actual; R01. Tamaño M.

**Corte recomendado:** entregar F02 primero. Agregar F21 sin modal obligatorio al iniciar ni recordatorios entre cada serie. Salida: recordar montaje y retomar sin reconstruir de memoria; estado de validación móvil explícito.

### E2 · Biblioteca útil e identidad · candidata 0.14

**F03 · Buscar, filtrar y elegir.** Configuración: buscador en el selector del editor; alias en español/inglés y personales, filtro de equipo/grupo y favoritos locales. Priorizar favoritos/recientes sin hacer obligatorio usarlos. Datos: familia ≠ variante ≠ instancia de rutina; conservar ejercicios personalizados. Aceptación: «press plano», «press banca» y «bench press» encuentran la familia; barra, mancuernas y Smith siguen separados; renombrar alias no rompe ni combina historia; búsqueda y selección funcionan con el catálogo local preparado; estado sin resultados permite crear un ejercicio. Base: R02. Tamaño L.

**F18-M · Equipo mínimo, adelantado.** Identificar equipo cuando influye en carga y notas. Si falta, mostrar «equipo no declarado»; no afirmar equivalencia entre dos máquinas por compartir kg. Aceptación: se pueden separar dos equipos del mismo ejercicio, mantener sus ajustes y no transferir automáticamente carga/marca. Sin cuentas, geolocalización ni gestión de gimnasios. Base: F03 y R02. Tamaño M.

**CAT01 · Cobertura gradual.** Primera tanda: ejercicios de las tres rutinas actuales, revisando nombres ambiguos, más variantes faltantes realmente pedidas. Más adelante una muestra de unilateral, asistencia, tiempo y distancia cuando exista su registro. Para cada entrada: ID estable, aliases, familia, equipo, medición, convención de carga/reps y procedencia visual. Aceptación: asociación explícita del ejercicio existente, sin sustituir IDs por E001–E150; desconocidos pendientes de decisión; imágenes propias/licenciadas o alternativa neutra. No importar automáticamente medios de las fuentes. Base: F03; modalidades de E5/E6 para ampliar cobertura. Tamaño M por tanda.

Salida: se encuentran los ejercicios que se usan y se sabe cuáles se pueden comparar. No exigir una imagen nueva para cada candidato ni contabilizar 150 como hito de éxito.

### E3 · Prescripción por serie y descanso · candidata 0.15

**F05 · Objetivo por serie y rango.** Editor: reps exactas o mínimo/máximo, carga/descanso opcionales por serie y copia sencilla. Entrenar: mostrar 8–12 como objetivo, registrar reps logradas sin forzar el rango. Datos: objetivos con ID separados del resultado; mantener objetivos históricos exactos. Aceptación: mínimo ≤ máximo; resultado de 7 o 13 puede registrarse sin reescribir el objetivo; una pirámide conserva objetivos distintos; corregir el resultado no modifica la prescripción. Base: R02, contrato de migración y F03 para identidad. Tamaño L.

**F04 · Calentamiento vs trabajo.** Editor/Entrenar: rol de serie con modo simple predeterminado; calentamientos opcionales antes o entre trabajo según el plan. Historial: conteos separados, sin borrar aproximaciones. Aceptación: registrar dos calentamientos no completa dos series de trabajo; el siguiente turno usa su objetivo real; una serie extra no se convierte en calentamiento por ser liviana; cero reps solo en intento fallido explícito con transición resuelta y conteos claros. Base: F05. Tamaño M/L.

**F01 · Descanso persistente.** Preferencia desactivable; duración general con excepción por ejercicio, y luego por ronda. Iniciar una sola vez tras guardar correctamente; fin previsto persistido, cálculo al volver con la hora actual, pausa/reanudar/omitir y aviso de finalización visible. No depender de `setInterval` como reloj. Corregir una serie no reinicia descanso; fallo de guardado no lo inicia; finalizar sesión no deja una alarma futura incoherente. Sonido/vibración son opcionales y dependientes de soporte; no prometer pantalla bloqueada. Aceptación: recarga no reinicia el descanso, vencido se muestra vencido, ajustes no alteran lo ya registrado y bloquear pantalla no produce una afirmación falsa de notificación garantizada. Base: F05; persistencia de contexto. Tamaño M.

Cortes: 0.15a F05/F04; 0.15b F01. Salida: roles y turnos explícitos, copia completa en respaldo y documentación de compatibilidad de datos. Para grupos, el descanso entre rondas se integra en E4.

### E4 · Flujo flexible y agrupaciones · candidata 0.16

**F07 · Posponer, reordenar y sustituir localmente.** Dividir en tres cortes: (a) posponer/retomar y orden efectivo de sesión; (b) alternativas elegidas de antemano; (c) sustitución parcial con resultados existentes. No usar un swipe de borrado que compita con la navegación lateral ya establecida. Entrenar: acción secundaria «Ahora no» con estado visible. Aceptación: un pospuesto no reaparece en bucle; cambiar orden no lo marca hecho; sustituir conserva series previas del original y registra el vínculo con el nuevo; las cargas del sustituto vienen de su historia compatible o quedan por definir; la rutina base no cambia sin acción separada. Base: E2, F05/F04 y estados de sesión. Tamaño L.

**F06 · Parejas y rondas.** Editor: agrupar ejercicios y definir orden, rondas y descansos; permitir etiqueta biserie/superserie sin atribuir una definición regional universal. Entrenar: «ronda 2 · ejercicio B» y próximo turno. Primer corte una pareja; después tres o más miembros si hace falta. Aceptación: guardar A1 propone B1 y después A2; al volver se conserva posición; un B pospuesto permite continuar sin fabricar su resultado; objetivos desiguales no crean series extra en A; fallo de guardado no consume el turno; descanso principal se vincula al cierre efectivo de ronda. Base: F07-a, F01 y F05/F04. Tamaño XL en cortes.

**PLAN01 · Versión corta preparada.** Solo después de grupos: el usuario marca previamente qué bloques omitir cuando dispone de menos tiempo. Aceptación: omitir se distingue de fallar y de completar; conserva lo ya hecho; no recorta una rutina automáticamente por criterio del sistema. Base: F06/F07; reutilización en F13. Tamaño M.

Salida: se puede representar el ejemplo B de la investigación sin duplicar rondas ni modificar la plantilla histórica.

### E5 · Esfuerzo, lados y tramos · candidata 0.17

**F10 · Esfuerzo opcional.** RIR como primer campo, activable por ejercicio, con escala/ayuda definida en el contrato. RIR desconocido o no anotado ≠ RIR 0; fallo técnico no se deduce de reps bajas. Aceptación: registrar una serie simple no requiere RIR; corrección y respaldo conservan el valor; no se afirma recuperación o fatiga fisiológica medida. RPE de sesión/serie es una ampliación posterior con escalas explícitas. Base: F05. Tamaño M; puede adelantarse si aparece una necesidad concreta.

**F09 · Resultados por lado.** Peso y reps por izquierda/derecha cuando el ejercicio lo necesita. Atajo «igualar ambos» explícito; bilateral sencillo mantiene su formulario actual. Carga por mancuerna, carga por lado y reps totales alternadas se distinguen. Aceptación: izquierda 10 y derecha 9 sobreviven a corrección/recarga/respaldo; no se llena el lado faltante; el total no duplica la serie principal; la comparación es por lado y mismo equipo/variante. Asistencia se guarda en su dimensión, nunca como kg negativos. Base: E2 y F05; unión de resultados. Tamaño L.

**F08 · Dropset por tramos.** Primero cargas descendentes con reps; guardar cada tramo como ejecución parcial dentro de una serie principal y cerrar explícitamente la serie extendida. Aceptación: interrupción conserva los tramos confirmados y no inventa los restantes; corregir uno cambia detalle/totales sin duplicar la serie; el descanso principal comienza al cerrar, no después de cada drop; serie principal y tramos se cuentan por separado. Base: contrato de resultados, F04/F05/F01; E4 solo para combinarlo con grupos. Tamaño L/XL.

No habilitar combinaciones arbitrarias de lado × drop × grupo por accidente. Declarar las combinaciones soportadas y permitir conservar/consultar datos de otras versiones sin descartarlos. Rest-pause, myo-reps y clusters no se anuncian como resueltos por tener un array de tramos.

### E6 · Tiempo y cardio básico · candidata 0.18

**F11 · Series por tiempo.** Editor: modalidad de segundos y objetivo; Entrenar: registrar duración real manualmente y cronómetro opcional. Una pausa/sostenimiento no exige reps ficticias. Aceptación: unidad visible, borrador temporal conservado, duración confirmada distinta de cronómetro abierto, carga opcional explícita e historial separado de reps. Base: modalidades y temporizador de E3. Tamaño M.

**F12 · Cardio dentro de la sesión.** Añadir duración y distancia opcional en m/km; velocidad, inclinación o resistencia solo si el usuario elige registrarlas y con su unidad. Primer corte cinta/bicicleta como registro manual sencillo, sin GPS ni integraciones. Aceptación: anotar duración sin distancia; convertir m/km sin alterar el valor real; distinguir tiempo de actividad de tiempo con la app abierta; no fabricar calorías, potencia ni frecuencia cardiaca. Base: F11, identidad de equipo. Tamaño M/L.

Cobertura CAT01: agregar las entradas correspondientes solo cuando puedan registrarse con la modalidad correcta. Movilidad e intervalos se incorporan por necesidad; no fingir soporte de EMOM/Tabata con una nota de texto.

### E7 · Reutilización y entrada de planes · candidata 0.19

**F13 · Bloques reutilizables y portátiles.** Guardar una pareja/circuito con objetivos y descansos, copiar al plan y editar la copia independientemente. Exportación de plan/bloque sin historial ni medidas personales; distinguir de respaldo completo. Aceptación: cambiar la copia no altera el bloque de origen ni las sesiones; identificadores de instancia nuevos y referencias de variante conservadas; no salen notas privadas salvo selección explícita. Base: F06 y contratos de exportación. Tamaño M/L.

**F15 · Plantilla CSV propia.** Publicar columnas, unidades, codificación y ejemplos ficticios; admitir solo los tipos de dato ya implementados. Vista previa, errores por fila, selección de reemplazar/agregar y conflictos explícitos. Primera versión importa planes, no resultados históricos. Aceptación: importar no crea series realizadas; alias ambiguo exige elección; el fallo no deja media rutina; columnas no soportadas no se descartan en silencio; no ejecutar fórmulas ni código y, si se exporta CSV, neutralizar celdas de texto interpretables como fórmula. Base: F03/F05, F13 si incluye bloques. Tamaño L.

No prometer importación automática de cualquier Excel ni integrar Drive/Sheets por este solo requisito.

### E8 · Historial accionable y progresión sugerida · candidata 0.20

**F19 · Constancia y marcas contextualizadas.** Extender v0.12, no duplicar su panel. Separar asistencia registrada, series de trabajo, calentamientos, tramos, lados y periodos completos/incompletos. Marcas dentro de una variante/equipo/criterio compatibles. Aceptación: no premiar un dropset como tres series principales; una semana parcial no se anuncia como retroceso; renombrar etiqueta no pierde una marca compatible; datos desconocidos muestran límite en vez de cero. Duración solo si se registran intervalos válidos, no fin menos creación de una sesión abandonada. Base: identidades E2 y resultados habilitados. Tamaño M/L.

**F14 · Doble progresión elegida por el usuario.** Regla configurable de rango, series consideradas e incremento realizable con ese equipo. Mostrar primero el hecho («tres series de trabajo en el límite superior») y después la propuesta. Aceptación: con información insuficiente no hay recomendación; no mezcla calentamientos, equipo diferente ni asistencia; aceptar cambia un objetivo futuro, nunca el resultado pasado; rechazar no genera avisos insistentes. En técnica, esfuerzo o condiciones desconocidas indicar el límite. Sin prescripción automática ni promesa de mejora fisiológica. Base: F05/F19 y convención/equipo; F10 si la regla usa esfuerzo. Tamaño L.

## 8. Backlog condicionado y criterios para activarlo

No implementar solo porque figura en el informe. Registrar la necesidad observada y la decisión de activación en el estado.

| ID | Función | Activar cuando | Dependencias y aceptación mínima |
|---|---|---|---|
| F16 | Rest-pause/cluster; luego protocolos concretos | El plan personal usa esas pausas internas | F08/F01; pausas y mini-series persistidas; no llamar myo-reps a cualquier rest-pause |
| F17 | Plan rotativo y ciclos | Se necesita A/B/C rotativo o bloques semanales reales | Plan separado de rutina/sesión; reprogramar futuro no cambia pasado; no convierte días sin registro en ausencias |
| F18-A | Varios gimnasios y configuración de equipo completa | La persona usa equipos distintos y el mínimo de E2 no alcanza | Reusar F18-M; historial/comparación separados, sin equivalencias automáticas |
| F20 | Peso corporal y medidas voluntarias | Hay una pregunta concreta que requiere ese dato | Consentimiento de uso local, eliminación/exportación con alcance claro, sin requisito para registrar series ni diagnóstico |
| F22 | Sesión libre → plantilla | Se entrena fuera de las rutinas y luego se reutiliza | Selector de catálogo, objetivos opcionales y regla de una sesión/rutina/fecha aclarada; crear plantilla no altera sesión |
| F23 | Calculadora de discos | Se hacen cuentas de barra repetidamente | Peso real de barra, pares de discos disponibles, total vs lado; no inventar que existe la combinación propuesta |
| F24 | Sincronización multidispositivo | Respaldo manual ya no cubre una necesidad frecuente | Proyecto aparte: identidad, conflictos, autenticación, privacidad, borrado, continuidad offline y presupuesto; ningún servicio contratado sin autorización |

Otros recursos del glosario: tempo, pausas, parciales, reps asistidas y método 21 se mantienen como cobertura documentada hasta tener semántica y necesidad. Triseries/circuitos reutilizan el modelo de grupos, pero intervalos temporizados requieren F11 y reglas específicas. BFR queda en notas/referencia, sin calculadora de presión ni recomendación. kg/lb, bandas y asistencia necesitan convenciones explícitas antes de poder sumar/comparar; no convertir colores de bandas en kilos.

Fuera de alcance de esta ruta: feed social, rankings entre personas, nutrición completa, chat de entrenador, diagnóstico por imágenes, recuperación exacta, calorías supuestamente fiables por serie y soporte de todos los relojes. Una función adicional debe demostrar cómo ayuda a esta bitácora.

## 9. Trazabilidad completa F01–F24

La segunda columna conserva la línea base al iniciar el plan; la cuarta indica el estado actual de implementación. **IMPLEMENTADO_NO_VALIDADO** no significa validación en teléfono ni publicación.

| ID fuente | Línea base v0.12 | Destino y dependencia clave | Estado local 0.20 |
|---|---|---|---|
| F01 | Pendiente | E3; persistencia de descanso, luego rondas en E4 | IMPLEMENTADO_NO_VALIDADO |
| F02 | Parcial: notas en plan, sin equipo separado | E1; R02 | IMPLEMENTADO_NO_VALIDADO |
| F03 | Pendiente: hay editor, no biblioteca buscable | E2; identidad | IMPLEMENTADO_NO_VALIDADO |
| F04 | Pendiente | E3; F05 | IMPLEMENTADO_NO_VALIDADO |
| F05 | Parcial: objetivo uniforme exacto | E3; plan por serie | IMPLEMENTADO_NO_VALIDADO |
| F06 | Pendiente: texto de biserie no ejecuta rondas | E4; F07-a/F01/F04/F05 | IMPLEMENTADO_NO_VALIDADO |
| F07 | Parcial: cambiar de ejercicio sí; posponer/reordenar/sustituir formalmente no | E4; estados e identidad | IMPLEMENTADO_NO_VALIDADO |
| F08 | Pendiente | E5; tramos | IMPLEMENTADO_NO_VALIDADO |
| F09 | Parcial: criterio por mancuerna, no resultado por lado | E5; unión de resultados | IMPLEMENTADO_NO_VALIDADO |
| F10 | Pendiente | E5; opcional por ejercicio | IMPLEMENTADO_NO_VALIDADO |
| F11 | Pendiente | E6; modalidad temporal | IMPLEMENTADO_NO_VALIDADO |
| F12 | Pendiente | E6; F11 | IMPLEMENTADO_NO_VALIDADO |
| F13 | Pendiente | E7; grupos y exportación | IMPLEMENTADO_NO_VALIDADO |
| F14 | Pendiente | E8; registros comparables | IMPLEMENTADO_NO_VALIDADO |
| F15 | Pendiente: respaldo JSON no es importación CSV de plan | E7; formato documentado | IMPLEMENTADO_NO_VALIDADO |
| F16 | Condicionado | E9; F08/F01 | CONDICIONADO |
| F17 | Condicionado | E9; plan multisemana | CONDICIONADO |
| F18 | Pendiente | Mínimo E2; ampliación condicionada E9 | M IMPLEMENTADO_NO_VALIDADO; A CONDICIONADO |
| F19 | Parcial: frecuencia y mejor serie a la misma carga | E8; extender semántica de conteos | IMPLEMENTADO_NO_VALIDADO |
| F20 | Condicionado | E9; necesidad y privacidad | CONDICIONADO |
| F21 | Parcial: respaldo/recuperación ya disponibles | E1; mejorar continuidad y avisos | IMPLEMENTADO_NO_VALIDADO |
| F22 | Condicionado: sesión sin rutina limitada a press de banca | E9; catálogo y plantilla | CONDICIONADO |
| F23 | Condicionado | E9; equipo real | CONDICIONADO |
| F24 | Condicionado, no existe | E9; arquitectura y coste separados | CONDICIONADO |

Trazabilidad de ideas del §13 de la investigación: tarjeta de montaje→F02; alternativa preparada→F07; versión corta→PLAN01; resumen próximo→F19/F14; diccionario→F03; continuidad→F21; bloque portátil→F13; cambios de plan→copias/versionado de §6 y F19; detalle por ejercicio→D13 y E3/E5/E6.

## 10. Trabajo por entregas, aceptación y evidencia

### 10.1. Ciclo de una ficha

1. Leer el estado, el ID elegido, dependencias y decisión relevante. Confirmar versión/archivos reales antes de editar.
2. Resolver el contrato mínimo y ejemplos de datos para ese corte, no para todo el backlog. Registrar dudas que bloqueen comparar o conservar datos.
3. Antes de cambiar UX, consultar referencia vigente y aplicar Impeccable; conservar la identidad visual salvo pedido de rediseño.
4. Implementar dominio/validación y persistencia, luego editor/registro y finalmente consulta/exportación. Mantener los cambios revisables y acotados.
5. Revisar estados vacío, normal, parcial, error de guardado, corrección, interrupción y datos legados. Estos escenarios son criterios; no se ejecutan pruebas mientras siga la prohibición vigente.
6. Compilar si se cambió código y hacer la revisión estática apropiada. Una compilación correcta solo demuestra construcción y tipos.
7. Registrar resultado: archivos, evidencia obtenida, limitaciones, esquema, compatibilidad, siguiente acción y decisión de publicación. No publicar documentos/datos privados ni empujar todo el curso.

### 10.2. Definición de terminado sin falsear validación

Separar tres estados: **implementado** (código/datos/documentación), **compilado** (evidencia técnica), **validado en uso** (evidencia real). Un ticket puede estar implementado pero pendiente de validación móvil. No cambiar esa etiqueta por haber desplegado.

Para dar una entrega por implementada: aceptación cubierta por diseño/código, errores conservan datos, respaldo conserva campos, legado legible, copia de sesión intacta, y estado actualizado. Si una comprobación requerida no está permitida, dejarla pendiente; no escribir ni ejecutar tests para cumplir el checklist. Si el riesgo impide una publicación responsable, explicar el bloqueo concreto sin inventar una autorización.

### 10.3. Señales de valor y criterios para frenar

Sin analítica remota por defecto. Usar devoluciones voluntarias y ejemplos anonimizados:

- ¿Pudo registrar/corregir sin buscar controles en otra zona? Registrar dificultad concreta, no porcentajes inventados.
- ¿Pudo retomar y distinguir confirmado vs borrador? Registrar qué estado se recuperó y en qué plataforma.
- ¿Una técnica obligó a inventar reps, carga o series? Si sí, el tipo aún no está correctamente soportado.
- ¿La comparación explica qué coincide y qué no? No llamar marca a datos incompatibles.
- ¿Hay que configurar repetidamente lo mismo? Priorizar nota/plantilla sobre más indicadores.
- Si aumentan campos obligatorios, mensajes o decisiones por serie convencional, recortar alcance antes de sumar otra técnica.

No comprometer fechas ni capacidad de avisos en segundo plano sin evidencia. Cambiar prioridad si el uso personal muestra otra necesidad; registrar el motivo para que no parezca un olvido.

## 11. Riesgos, mitigaciones y límites

| Riesgo | Acción planificada |
|---|---|
| Crecer hasta ser difícil de usar | Cortes verticales, D13, una acción principal y funciones condicionadas |
| Perder campos al exportar | Cambiar serialización/respaldo junto al modelo, comprobar copia explícita y conflictos |
| Alterar historia o mezclar equipos | Copias efectivas, identidades separadas y límites de comparación visibles |
| Temporizador detenido en segundo plano | Instante de fin, recuperación visible y capacidades de avisos no prometidas |
| Pérdida de almacenamiento local | Manejo de error, respaldo voluntario y evaluación de persistencia; no confundir instalación con copia externa |
| Escrituras simultáneas | Reconocer límite de localStorage; decidir transacción/estrategia antes de ampliar conflictos |
| Múltiples tipos con combinaciones no soportadas | Matriz explícita de combinaciones por entrega; no descartar desconocidos al importar |
| Filtrar rutina, notas o rutas personales | Publicación por lista seleccionada; separar respaldo completo de plan portátil |
| Imágenes ajenas sin derechos | Procedencia/licencia o recurso neutro; no copiar desde búsquedas |
| Estadísticas que suenan a consejo médico | Mostrar datos y reglas elegidas; no prometer eficacia ni diagnóstico |
| Coste o dependencia del proveedor | Conservar exportación y local primero; F24 necesita evaluación propia |

No se garantiza confidencialidad por estar en localStorage, permanencia por instalar una PWA ni aislamiento entre rutas de un mismo origen. Este plan no agrega cifrado, autenticación ni sincronización.

## 12. Reanudación y mantenimiento del contexto

**Al iniciar:** leer `estado-desarrollo-gim.md`; identificar próxima acción y su ficha; comprobar qué archivos cambiaron desde la última entrada. No reconstruir prioridades desde el chat ni activar todos los P1 a la vez.

**Al terminar o antes de una recontextualización:** actualizar el estado con ID, corte, resultado real, archivos, esquema, evidencia y pendientes. Añadir decisiones nuevas a §5 con fecha/motivo; si se revierte una, conservar su rastro. Ajustar `PRODUCT.md` solo cuando una capacidad exista y `DESIGN.md` cuando se aplique una decisión visual. No convertir propuestas en hechos.

**Si se interrumpe una tarea:** dejar una acción siguiente ejecutable y qué no se debe repetir. Si no hay trabajo iniciado, escribir «sin implementación iniciada»; no dejar un estado ambiguo «en progreso».

El recorrido inicial **R00 → R01 → R02/F02 → F21 → E2 → E3–E8** ya tiene implementación local. No reiniciarlo. La siguiente acción es observar uso de la versión 0.20 y priorizar un hallazgo, o activar una condición concreta de E9 si aparece necesidad. Pedir aclaración solo ante una decisión material no cubierta por estas reglas ni por instrucciones posteriores.

## 13. Fuentes y alcance de esta planificación

Base principal: [investigación local, §§2–16](investigacion-gimnasio-2021-2026.md), [catálogo complementario](catalogo-ejercicios-investigacion-2026.md), [producto actual](../PRODUCT.md), [hallazgos v0.12](revision-uso-v0.12.md), lectura de los tipos/almacenamiento/avance/comparación actuales y criterio Operate de Impeccable. No se revalidaron todos los artículos científicos del informe ni se usaron para prescribir entrenamiento.

Referencias oficiales reconsultadas el 22/10/2026:

- [StrengthLog: búsqueda](https://help.strengthlog.com/help-article/finding-the-right-excercises/): filtros y selección según uso; respalda el patrón de F03, no una cuota de catálogo.
- [StrengthLog: sustitutos](https://help.strengthlog.com/help-article/similar-exercises/): elección de alternativas durante sesión. GIM propone mayor separación de cargas por variante; no copia equivalencias automáticamente.
- [MDN: Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API): restricciones del trabajo en segundo plano; fundamenta D12, no garantiza alarmas.
- [MDN: cuotas y eliminación de almacenamiento](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria): persistencia y errores dependen del navegador; fundamenta F21 y la evaluación de almacenamiento.

En esta entrega se crean documentos de planificación y enlaces de continuidad. No se modifica la aplicación, no se migran datos, no se ejecutan tests ni navegador y no se publica nada.

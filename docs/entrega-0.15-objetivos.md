# Entrega local 0.15.0 · E3/R02 + F05: objetivos por serie

Fecha: 22/10/2026. Estado: F05 IMPLEMENTADO_NO_VALIDADO, E3 EN_CURSO. Siguiente corte: F04; después F01. Este documento es el contrato de datos y la reanudación, no evidencia de pruebas funcionales.

## Comportamiento implementado

- El plan uniforme existente sigue siendo el camino simple. En Mis rutinas se puede abrir «Personalizar objetivos por serie», materializar filas y definir repeticiones mínimas/máximas, carga opcional y descanso opcional. Iguales mínimos/máximos representan una cantidad exacta.
- Se pueden añadir, duplicar y quitar series, o copiar la primera a todas. Copiar contenido conserva los IDs de las posiciones existentes; duplicar/añadir crea otro ID. Máximo 100 series por ejercicio.
- Al personalizar, cantidad/repeticiones generales quedan derivadas y sus campos deshabilitados. Volver al plan uniforme retira explícitamente rangos/cargas/descansos del borrador y conserva cantidad y mínimo de la primera serie. Cancelar la edición conserva la rutina guardada.
- Entrenar muestra el objetivo del turno actual (p. ej., 8–12), la carga prevista y el descanso si existen. Puede registrar 7 o 13 reps frente a ese objetivo: son resultados válidos, no cambian el plan. Cero reps sigue sin admitirse; intento fallido se resolverá en F04.
- Carga explícita por serie tiene prioridad como valor sugerido; el usuario puede modificarla. Si falta, continúa la sugerencia anterior: última carga propia o primera serie anterior compatible. Las reps sugeridas usan el mínimo del objetivo actual, sin registrarlo automáticamente. Tras confirmar se preparan los valores del siguiente turno.
- La sesión conserva su prescripción completa y el historial permite consultarla. Corregir peso/reps cambia solamente el resultado. Completar el número de series avanza aunque no se llegue al rango.
- El descanso es una referencia planificada en segundos, sin cuenta regresiva ni aviso. No afirmar que F01 ya está implementada.

## D23 / R02 · Formato y autoridad

Registro nuevo **v4**, respaldo nuevo **formato 2**. Lectura de registros v1/v2/v3 y respaldos formato 1/v3 conservada. No se relajan versiones silenciosamente: formato 1 debe contener datos v3; formato 2, v4. Los v3 con objetivos avanzados se rechazan por incoherentes.

Se conserva la clave histórica `gim.app.entrenamientos.v3` como **único registro autorizado**, aunque su nombre incluya v3. La versión válida está en el JSON, no en el nombre de la clave. Esto evita crear dos claves de trabajo divergentes: las versiones antiguas que leen esa misma clave rechazan JSON v4 en lugar de editar una copia v3 separada.

Secuencia de lectura/escritura:

1. Leer y validar la fuente actual; convertir únicamente la versión envolvente a v4 en memoria. No escribir al abrir. IDs, fechas, números, ejercicios y objetivos uniformes históricos conservados. No se asignan objetivos/roles nuevos a resultados antiguos.
2. En la primera escritura con fuente v3, construir y validar completamente el nuevo registro. Copiar el texto v3 previo a `gim.app.transicion-v4.original-v3`. Es copia de recuperación local, nunca otra autoridad editable; no es archivo externo ni se exporta aparte.
3. Comprobar nuevamente vigencia y escribir el JSON v4 completo en la misma clave autorizada. Solo después se confirma el cambio de estado en React. Si falla copiar, no se escribe el principal; si falla la escritura principal, sigue el principal previo y queda la copia de recuperación. Un reintento puede actualizar la copia con el v3 realmente vigente antes de completar la transición.
4. Las fuentes v1/v2 se conservan en sus claves previas. Si no había registro v3, el primer guardado escribe v4 en la clave autorizada sin borrar esas fuentes.
5. Una pestaña 0.14 ya abierta detecta que el texto base cambió y bloquea edición/exportación por el control existente. Si abre desde cero sobre v4, su lector v3 falla y deshabilita escrituras. Actualizar las pestañas antes de continuar. Esto describe el código, no una prueba entre navegadores.

No hay transacción entre claves ni exclusión mutua atómica entre pestañas. La copia previa puede existir aunque falle el guardado principal. El control por texto reduce conflictos pero no elimina la carrera de dos escrituras exactamente simultáneas; no prometer atomicidad de localStorage. No se añadió IndexedDB ni backend para este corte.

Rollback: una versión antigua no debe reetiquetar v4 como v3 ni importar formato 2. Conservar el archivo nuevo y abrirlo con 0.15 o posterior. La copia previa local permite recuperación técnica manual del estado anterior a la transición, no de cambios posteriores. No hay botón de rollback automático ni conversión con pérdida. No se ejecutó ninguna migración sobre datos reales desde herramientas.

## D24 · Objetivo y resultado separados

```ts
type ObjetivoSerie = {
  id: string;
  repsMin: number;
  repsMax: number;
  pesoKg?: number;
  descansoSegundos?: number;
};
// EjercicioPlan.objetivosSerie?: ObjetivoSerie[]
// SerieEjercicio.objetivoId?: string
```

- IDs de objetivo son únicos dentro del ejercicio y se conservan al copiar una prescripción avanzada a una sesión. Los de una sesión nueva desde plan uniforme se materializan una sola vez con UUID. No son IDs globales de resultados.
- Para compatibilidad de pantallas simples, `seriesObjetivo` debe ser exactamente la longitud de objetivos, y `repeticionesObjetivo`, el mínimo del primero. Son proyecciones validadas; el editor no permite una segunda versión editable independiente.
- Planes/sesiones legados pueden seguir sin lista. Su vista uniforme se deriva para lectura sin persistir objetivos ficticios ni vincular retrospectivamente resultados. Cada sesión nueva con objetivos definidos sí recibe una lista propia; una sesión libre sin objetivo sigue sin lista.
- Cada resultado nuevo usa el ID del objetivo ordinal actual cuando existe. Series extra no inventan objetivo. Validación requiere referencia existente, única por ejercicio y coherente con el orden actual. El modelo de este corte es lineal; F04 deberá ampliar el contrato antes de introducir roles e intentos.
- Límites: 1–100 reps, mínimo ≤ máximo; 0–1000 kg finitos; 0–3600 segundos enteros. Ausencia no equivale a cero: 0 kg o 0 segundos son valores explícitos. Objetivos/resultados se validan por separado.
- Cambiar a otra variante vinculada o volver a personalizado retira objetivos avanzados del borrador reemplazado. Cambiar criterio de carga retira las cargas planificadas; no convierte kilos entre convenciones. Copiar un personalizado conserva su plan en una instancia nueva.
- El borrador de serie avanzada incluye la prescripción en su firma contextual; los borradores uniformes anteriores conservan su firma. No se borra almacenamiento para resolver una actualización.

Ejemplos de contrato (no tests ejecutados):

| Situación | Lectura/escritura prevista |
|---|---|
| v3 con 4×10 y resultados 10/10/8 | Se conserva ese objetivo uniforme y esos resultados; no aparece un rango inferido |
| Plan nuevo 12/10/8 con 20/30/40 kg | La sesión copia tres objetivos; cada resultado guarda su vínculo, no modifica el objetivo |
| Rango 8–12 y resultado 7 o 13 | Se registra si pasa las validaciones generales; el rango queda 8–12 |
| Editar rutina mientras hay sesión anterior | Solo sesiones futuras reciben la modificación; copia previa intacta |
| Mínimo 12 / máximo 8, o ID duplicado | Rutina/importación rechazada, registro previo conservado |
| Fallo al guardar o copiar v3 previo | Formulario conservado, sin mensaje de éxito ni avance |
| Importar respaldo formato 1 válido | Se normaliza a v4 en memoria; vista previa/conflictos siguen vigentes |

## Diseño y referencias

Se aplicó Impeccable, criterio Operate. Sin otro módulo ni modal. Configuración avanzada opcional con filas y controles nativos; cuadrícula de dos columnas, una en pantallas muy estrechas. Un campo inválido abre su detalle para que pueda corregirse. Entrenar mantiene una acción principal; objetivo y resultado se distinguen sin añadir otra columna ancha. Consulta de prescripción en detalle tanto en sesión como Historial.

[Hevy: objetivos por serie y rangos](https://www.hevyapp.com/features/how-to-write-sets-and-reps/) documenta la prescripción de cargas/repeticiones por serie y selección de rangos. Adaptación propia: mínimos/máximos en el editor a pedido, objetivo separado de lo realizado y sin convertir el registro en una validación obligatoria del rango. No se adoptaron funciones sociales, recomendación automática de entrenamiento ni la navegación completa de otra app.

## Evidencia y límites

- Compilación final `pnpm --dir app run build`: TypeScript estricto de producción, Vite y PWA correctos. 53 módulos, 18 recursos en precaché; JS 334.62 kB (99.40 kB gzip).
- Detector estático Impeccable: `[]`.
- La compilación inicial detectó un cierre JSX corregido y después tipos v3 en fixtures de tests antiguos. Se añadió `tsconfig.build.json` para compilar el código de producción sin esos archivos; `tsconfig.json` general permanece. **No se editaron ni ejecutaron tests.** Los tests existentes siguen con supuestos v3; actualizar/revisar esa deuda solo cuando el usuario autorice retomarlos. El build no acredita que esos tests pasen ni que el uso esté validado.
- No automatización de navegador, pruebas manuales realizadas por el agente, descargas de respaldo real, lectura de entrenamientos privados, ni publicación. Ergonomía móvil, actualización entre pestañas y transición real de datos quedan sin verificar en uso.
- Offline exige preparación previa; almacenamiento por navegador/origen, sin sincronización. La copia previa es local y también puede perderse al limpiar el navegador.

Archivos nuevos: `app/src/prescription.ts`, `PrescriptionEditor.tsx`, `PrescribedSets.tsx`, `app/tsconfig.build.json`. Modificados: `training.ts`, `storage.ts`, `useRegistro.ts`, `backup.ts`, `guided.ts`, `draft.ts`, `App.tsx`, `RoutineEditor.tsx`, `TrainingScreen.tsx`, `ExerciseSets.tsx`, `HistoryScreen.tsx`, `BackupPanel.tsx`, `styles.css`, `app/package.json` y documentación.

## Punto de reanudación

F05 implementado localmente; E3 permanece EN_CURSO. Siguiente: F04, contrato de rol (calentamiento/trabajo) independiente de resultado y de estructura; intento fallido explícito para cero reps, avance de turno y conteos sin fingir éxito. Mantener IDs de objetivos/resultados, lectura v3/v4 y respaldo 1/2. Ampliar el formato antes de interpretar campos nuevos; no relajar a cero toda validación general. Después F01: descanso persistido por instante final, inicio solo tras escritura exitosa y sin reiniciarlo al corregir. No construir grupos/tramos/RIR dentro de F04.

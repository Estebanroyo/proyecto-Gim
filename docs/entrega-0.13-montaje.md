# Entrega local 0.13 · F02, montaje y notas de sesión

Fecha: 22/10/2026. Estado: **IMPLEMENTADO_NO_VALIDADO**. Compilación y revisión estática correctas; sin pruebas de uso ni publicación.

## Corte ejecutado

Primer corte de E1 de la [hoja de ruta](hoja-de-ruta-gim.md): F02 completo en configuración, entrenamiento, consulta y respaldo. F21 todavía no se implementó.

### R00 · Línea base y recuperación

- Inicio: app 0.12.0, registro v3, respaldo formato 1. Fuente de trabajo `app/`; checkout de publicación `.deployment-repo`, limpio en 69eb949 al revisarlo. No se consultó ni modificó el remoto.
- Antes de una publicación futura, conservar un respaldo mediante Configuración → Descargar respaldo, revisar su destino fuera del repositorio y utilizar v0.13 para exportar los campos nuevos. Esta es una instrucción de recuperación; no se descargó ni inspeccionó ningún entrenamiento real.
- El JSON contiene datos personales legibles. No adjuntarlo a commits ni convertirlo en un fixture con datos reales.
- No se borra almacenamiento ni se cambia la autoridad del registro; siguen leyéndose datos v1/v2/v3. La reversión a una app antigua puede omitir estos campos en un respaldo antiguo: no usarla para editar/exportar después de empezar a registrar notas nuevas.

### R01 · Higiene de publicación

Se añadieron exclusiones de `gim-respaldo-*.json`, planillas .xlsx/.xls y temporales de Office a `.gitignore` y `app/.gitignore`. La raíz también excluye `docs/curso/referencias/` y `docs/curso/evidencias/`. No se borraron archivos ni se ignoraron todos los JSON. Las exclusiones no retiran archivos ya versionados.

El corte sigue local: no se copiaron cambios a `.deployment-repo`. Una futura publicación debe seleccionar código, recursos y documentos técnicos; revisar rutas personales y excluir respaldos, capturas y planillas. No hace falta reescribir el historial de Git para este corte.

### R02 · Contrato mínimo aplicado a F02

Decisión D18: el montaje habitual pertenece a la **instancia de ejercicio de una rutina**, referenciada por sus IDs actuales. No se comparte por nombre entre otras rutinas ni se crea un catálogo de equipos por esta función.

```text
EjercicioPlan.montaje? = { equipo: string, ajustes: string }
Sesion.ejercicios[].montaje? = copia independiente al crear la sesión
Sesion.notasEjercicios? = mapa ejercicioId → texto de esta sesión
```

- `equipo`: etiqueta local de hasta 80 caracteres; no es un identificador de máquina validado.
- `ajustes`: texto de hasta 500 caracteres; al menos equipo o ajustes debe tener contenido.
- Nota de sesión: hasta 500 caracteres, vinculada a un ejercicio existente; texto vacío elimina esa nota.
- Notas técnicas/biseries existentes en `notas` conservan su significado y no se migran a montaje.
- Un entrenamiento creado antes de configurar montaje no recibe información retrospectiva. Cambiar el habitual solo alcanza futuras sesiones.
- Solo una sesión abierta con fecha admite crear/corregir su nota; al finalizar queda de consulta. Se puede reabrir con la función existente.
- El reinicio de prueba sigue borrando series/borradores: conserva montaje y notas, que no se eliminan por un reinicio de series.

Compatibilidad: campos opcionales aditivos en v3, sin migración ni formato nuevo de respaldo. La validación, copia profunda de montaje, exportación de rutina/sesión e importación preservan los campos. El flujo de conflictos existente no sobrescribe diferencias silenciosamente. Ante fallo de persistencia, la nota sigue en edición y no se anuncia guardado.

Comparabilidad: si las etiquetas de equipo declaradas difieren, incluyendo declarado frente a no declarado, no se reutiliza automáticamente esa referencia en las comparaciones y sugerencias existentes. Renombrar la etiqueta también corta esa asociación; dos etiquetas iguales no demuestran que sea la misma máquina. Resolver identidad estable de equipo corresponde a F18-M/E2. El texto libre de la nota no se interpreta como un cambio automático de equipo ni convierte pesos.

## Experiencia implementada

- Mis rutinas: bloque opcional «Equipo y montaje habitual», sin campos nuevos obligatorios en el ejercicio convencional.
- Entrenar: montaje copiado a la sesión, visible cuando existe, y acción secundaria para anotar un ajuste de esa sesión.
- Durante la edición de una nota se bloquean cambio de ejercicio, módulos, alta de serie y cierre hasta guardar/cancelar; la acción de guardar nota es la principal de ese momento.
- Sesiones finalizadas e Historial: montaje y nota guardados en lectura, sin botones de alta vacíos.
- No se añaden imágenes, servicios, dependencias ni navegación nueva.

**Límite de borrador:** el borrador persistente de peso/reps continúa intacto. La nota todavía sin confirmar vive en el formulario y una recarga puede perder esa edición; se avisa allí. No afirmar que F21 está resuelto por haber agregado notas.

## Ejemplo conceptual de conservación

Configurar «asiento 4» y crear sesión A copia ese texto. Cambiar el habitual a «asiento 5» para la siguiente sesión B no altera A. Si en A se anotó «hoy ajusté el respaldo», el texto queda como nota de A y no reemplaza el habitual. Es un ejemplo de contrato, no una prueba ejecutada con datos personales.

## Archivos y evidencia

- Dominio/datos: `app/src/training.ts`, `setup.ts`, `backup.ts`, `progress.ts`.
- UX/UI: `RoutineEditor.tsx`, `SetupNotes.tsx`, `TrainingScreen.tsx`, `HistoryScreen.tsx`, `PreviousExercise.tsx`, `App.tsx`, `styles.css`.
- Versión: `app/package.json` → 0.13.0; datos v3 y respaldo formato 1 permanecen.
- Compilación de producción correcta con TypeScript/Vite y generación de service worker: 18 recursos precacheados. Detector estático Impeccable sin hallazgos.
- No se escribieron/ejecutaron tests ni automatización de navegador; no se verificó comodidad táctil, recuperación en un dispositivo real ni rendimiento medido. No se tocaron datos reales.
- No hay commit ni despliegue nuevo. El sitio público no recibe este cambio hasta una publicación autorizada.

## Referencia de UX

[Hevy: notas de rutina y entrenamiento](https://help.hevyapp.com/hc/en-us/articles/34463684392983-How-do-the-exercise-notes-routine-and-workout-notes-work), consultada el 22/10/2026: se adapta la separación entre nota habitual y nota de una ejecución, no se copia una política de sobrescritura de historial. Impeccable, criterio Operate; se conserva el diseño actual.

## Siguiente corte

F21: retomar con estado claro y avisos discretos de respaldo. Usar este contrato y el estado de desarrollo; no repetir la investigación del catálogo ni iniciar F01/F03 por accidente. Evaluar dentro de F21 si conviene persistir también la edición de la nota, sin mezclarla con la nota confirmada.

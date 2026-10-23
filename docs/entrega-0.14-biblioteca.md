# Entrega local 0.14 · E2: biblioteca e identidad

Fecha: 22/10/2026. Estado: IMPLEMENTADO_NO_VALIDADO. Alcance: R02 mínimo de identidad, F03, F18-M y primera tanda CAT01. Sin publicación ni acceso a datos reales.

## Diseño aplicado

En Configuración → Mis rutinas, cada fila permite abrir una biblioteca en contexto. No hay otro módulo ni modal obligatorio. Buscar acepta palabras sin distinción de mayúsculas/tildes, nombres españoles/ingleses, familia y alias personal. Filtros por grupo/tipo de equipo; favoritos y elecciones recientes primero. Si no hay resultados, se puede escribir un ejercicio propio. Los personalizados ya guardados en rutinas siguen disponibles y pueden copiarse a otra fila. Los resultados se despliegan en altura natural, sin scroll interno que capture el gesto en móvil.

La biblioteca inicial contiene 32 variantes de carga/repeticiones relacionadas con los 25 nombres de la rutina de tres días y alternativas que aclaran nombres ambiguos. No se importaron los 150 candidatos ni medios externos. Una búsqueda amplia muestra alternativas; no afirma cuál realizó el usuario.

El equipo concreto se prepara en el bloque opcional de montaje: elegir uno conocido, crear uno con nombre distintivo o mantener «Equipo no declarado». Las referencias disponibles se reconstruyen de rutinas y sesiones; un equipo nuevo solo se confirma con la rutina. Cambiarlo limpia el montaje de esa fila para no trasladar ajustes de otra máquina. Se pueden tener dos filas/rutinas del mismo ejercicio con equipos y montajes independientes. No hay gestor global de gimnasios ni edición masiva del equipo.

## R02 / D21 · Identidades diferentes

| Identidad | Representación | Regla |
|---|---|---|
| Familia | `familiasCatalogo`, IDs editoriales estables | Agrupa búsquedas; no determina comparabilidad |
| Variante | `catalogo[].id`, referencia opcional `EjercicioPlan.varianteId` | No reciclar IDs ni convertir aliases en identificadores |
| Instancia en rutina | `EjercicioPlan.id` existente | Primera vinculación explícita conserva el ID; cambiar una variante ya vinculada crea uno nuevo |
| Equipo concreto | `EjercicioPlan.equipoRef: { id, nombre }` opcional | UUID independiente del nombre, copiado en la sesión |
| Ejecución | `Sesion.id` y series existentes | No se reasignan ni recalculan series históricas |

`EjercicioPlan.nombre` sigue siendo el nombre visible editable. Cuando hay variante vinculada, cambiar ese nombre no cambia la identidad ni reúne registros distintos. El alias personal es únicamente una preferencia de búsqueda.

Elegir una variante aplica nombre, grupo y criterio de carga sugerido al borrador del plan; conserva sus objetivos. La primera vinculación conserva montaje/notas, que la persona puede revisar. Reemplazar una variante vinculada limpia equipo/montaje/notas y crea otra instancia. Copiar un personalizado crea una instancia nueva y copia su configuración, sin heredar series. Volver a personalizado desde una variante crea otra instancia y limpia referencias incompatibles.

No se vincula ninguna fila antigua automáticamente, aunque coincida el nombre. Ejemplos: «Press plano» no declara barra; «Press de hombros (mancuernas o máquina)» no declara equipo; «Curl concentrado en banco Scott» requiere elegir variante. Las filas y sesiones existentes permanecen intactas hasta una edición explícita del plan, y esa edición solo afecta a sesiones futuras.

## R02 / D22 · Equipo y comparación

- Para trasladar carga se conservan misma rutina e instancia, criterio de peso y compatibilidad de variante/equipo. No se amplía la comparación entre rutinas por compartir catálogo.
- Variante distinta o declarada frente a no declarada: no se comparan automáticamente. Equipo con ID distinto o conocido frente a desconocido: tampoco.
- Con el mismo equipo identificado, su nombre visible no determina la identidad. El montaje histórico es una copia, no una consulta mutable a una entidad global.
- En sesiones vinculadas al catálogo con Máquina, Polea o Smith y equipo concreto ausente, no se toma otra sesión como carga/marca comparable. El registro de la propia sesión sí se puede consultar.
- Barra, mancuernas y peso corporal pueden conservar referencia con la misma variante/instancia/criterio sin exigir identificar cada objeto físico. La persona puede declarar equipo concreto si quiere distinguirlo.
- Para legados sin variante ni equipo identificado se conserva la comparación anterior restringida a rutina/instancia/nombre y etiqueta de montaje. No equivale a una garantía de misma máquina; no se añade conocimiento que antes faltaba.
- El texto libre de `montaje.equipo` se conserva como referencia adicional; no se transforma en un UUID. Si no hay equipo identificado sigue operando la cautela legada por etiqueta.

La UI muestra variante y equipo en Entrenar/Historial. El aviso de «sin registro compatible» puede aparecer tras la primera vinculación; el historial antiguo no se borró. Reasignar referencias al pasado queda fuera de este corte.

## CAT01 · Cobertura y procedencia

Todos los elementos están en `app/src/catalog.ts`: ID estable, familia con ID, nombre, grupo, tipo de equipo, aliases, criterio de carga, medición carga/repeticiones y declaración de que no se añadió un recurso visual específico. Curación local a partir de `rutina.ts` y del catálogo de investigación; no es una recomendación médica ni una importación de una API externa.

| Nombres originales | Variantes ofrecidas / decisión pendiente |
|---|---|
| Press plano, inclinado | Plano barra/mancuernas/Smith; inclinado barra/mancuernas. Elegir explícitamente |
| Press Hammer | Press de pecho convergente como candidato; nombre comercial no demuestra máquina concreta |
| Flexiones, fondos, dominadas | Suelo, paralelas, prono. Lastre añadido; asistencia queda para otra etapa |
| Aperturas | Mancuernas o poleas, separadas |
| Tríceps barra/soga/de espaldas | Tres variantes de polea; equipo concreto no supuesto |
| Jalón cerrado; remo bajo/Hammer/T | Jalón cerrado, polea baja, convergente y barra T; confirmar la ejecución real |
| Curl alternado/martillo/Scott | Mancuernas en los dos primeros; Scott barra o mancuerna. El nombre mixto original queda sin asociación automática |
| Sentadillas | Barra o Smith; ninguna asignada por defecto |
| Prensa 45°, gemelos de pie, abductores, femoral acostado, cuádriceps | Candidatos con medición actual; identificar aparato para comparación nueva |
| Elevaciones laterales; press de hombros | Polea; hombros mancuernas o máquina como variantes independientes |

Se conservan las referencias visuales existentes por coincidencia exacta del nombre en `ExerciseVisual.tsx`. Un nombre nuevo sin coincidencia usa la alternativa neutra; no se copió una imagen por familia ni se asignó mediante similitud. No hay vídeos ni imágenes descargadas en este corte. Ampliar modalidades requerirá su contrato de registro, no solo otra entrada en la lista.

## Persistencia y compatibilidad

Registro v3 y respaldo formato 1 permanecen, con campos opcionales `varianteId` (hasta 100 caracteres) y `equipoRef` (ID hasta 100, nombre hasta 80). Se validan al leer/importar y se copian explícitamente al exportar; sesión nueva copia profundamente el plan. Una variante desconocida de un respaldo futuro conserva su ID y muestra referencia no disponible: no se reasigna por nombre.

Favoritos, últimos 20 elegidos y alias personales se guardan aparte en `gim.app.biblioteca-preferencias.v1`; no son registros de entrenamiento ni se incluyen en el respaldo. Un fallo se informa y no bloquea elegir. Cancelar el plan no deshace esas preferencias, pero sí descarta el borrador de rutina/equipo. Entre pestañas, preferencias simultáneas no tienen resolución de conflictos; los datos confirmados conservan el control de concurrencia existente.

Errores al guardar una rutina mantienen el formulario y muestran el fallo. No se ejecuta migración ni se escribe nada al abrir el catálogo. Una pestaña antigua puede no preservar extensiones opcionales al editar/exportar: actualizar todas las pestañas antes de editar datos nuevos. No garantizar compatibilidad de escritura con versiones antiguas. Al importar rigen vista previa y conflictos sin sobrescritura. Nombres de equipo repetidos procedentes de archivos distintos siguen siendo referencias diferentes; el selector los distingue por un ordinal local, no los fusiona. No hay renombrado global ni deduplicación automática.

Offline requiere preparación previa. Datos/preferencias pertenecen al navegador/origen; sin sincronización automática. No se borró almacenamiento ni se leyeron entrenamientos reales.

## Evidencia y fuentes UX

- TypeScript/Vite y generación PWA final correctas: 50 módulos, 18 recursos precacheados, JS principal 325.88 kB (97.17 kB gzip). No se agregaron dependencias, fuentes ni llamadas remotas.
- Impeccable, criterio Operate: revisión estática de los componentes y CSS devuelve `[]`.
- No se escribieron ni ejecutaron tests ni automatización de navegador. Sin evidencia observada de uso móvil, búsqueda, guardado o importación; compilación no equivale a validar esos flujos.
- [Carbon Search](https://www.carbondesignsystem.com/building-blocks/core/components/search/guidelines): búsqueda localizada en el conjunto relevante, campo familiar y estados. Adaptación: selector dentro del editor, con filtros nativos y salida a personalizado. Sin pantalla global adicional.
- Requisitos de identidad y candidatos: [hoja de ruta E2](hoja-de-ruta-gim.md), [catálogo de investigación](catalogo-ejercicios-investigacion-2026.md), y plan existente `app/src/rutina.ts`. No se atribuye la taxonomía propia a Carbon.

Archivos: nuevos `catalog.ts`, `useLibraryPreferences.ts`, `ExercisePicker.tsx`, `EquipmentPicker.tsx`, `ExerciseReference.tsx`; cambios en `training.ts`, `backup.ts`, `progress.ts`, `RoutineEditor.tsx`, `TrainingScreen.tsx`, `HistoryScreen.tsx`, `ProgressPanel.tsx`, `App.tsx`, `styles.css`, `app/package.json` y documentación.

## Reanudación exacta

E2 implementada localmente, validación de uso pendiente. Siguiente corte: E3/R02 + F05, objetivos por serie y rangos. Resolver primero versión/migración v3-v4 y compatibilidad de exportación; no diseñar un registro paralelo editable. Después F04 (rol calentamiento/trabajo e intento fallido), después F01 (descanso por instante persistido y límites por plataforma). No adelantar temporizador, grupos, tramos, RIR o cardio dentro de este corte.

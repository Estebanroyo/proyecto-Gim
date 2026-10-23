# GIM · aplicación de rama 0.21.0

React, TypeScript, Vite y vite-plugin-pwa. Implementación local de la ruta principal hasta E8; pendiente de validación de uso. Tres áreas: Entrenar, Historial y Configuración. Consultar el [README general](../README.md) y la [entrega detallada](../docs/entrega-0.20-ruta-principal.md).

## Compilar y servir

Desde esta carpeta, con Node.js 24 y pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Preview: http://127.0.0.1:5175/. Desarrollo: `pnpm dev`, http://127.0.0.1:5173/. No comparten almacenamiento. El preview es local a esta computadora; mantener su terminal activa.

En este equipo también está disponible el runtime incluido en Codex, sin instalación global. Desde la raíz del proyecto:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" --dir app run build
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" --dir app run preview
```

La compilación usa `tsconfig.build.json`, excluye fixtures de tests antiguos y no ejecuta tests. Esos fixtures siguen pendientes de adaptación a v5; no presentarlos como cobertura actual. No se realizaron tests ni automatización de navegador para esta entrega por instrucción del usuario.

## Arquitectura y contratos actuales

| Área | Responsabilidad |
|---|---|
| `training.ts`, `workout.ts` | DTO v5, validación, lectura legada y operaciones de dominio |
| `storage.ts`, `useRegistro.ts` | Autoridad local única, copia previa, conflicto entre pestañas y estado React |
| `prescription.ts`, `execution.ts`, `guided.ts`, `sessionFlow.ts` | Objetivos, resultados por modalidad, turnos, grupos y excepciones |
| `RoutineEditor.tsx`, `ExerciseOptions.tsx`, `GroupEditor.tsx` | Preparación del plan, alternativas y reglas opcionales |
| `TrainingScreen.tsx`, `AdvancedSetForm.tsx`, `SessionTools.tsx` | Registro en contexto, corrección, borradores y adaptación de sesión |
| `Rest.tsx` | Descanso persistido por instante de fin; reloj de UI aislado |
| `backup.ts`, `BackupPanel.tsx` | Respaldo completo formato 3; importación de formatos 1/2/3 sin resolver conflictos por sobrescritura |
| `portable.ts`, `planCsv.ts`, `PlanLibrary.tsx` | Bloques, JSON de plan y CSV limitado; vista previa y confirmación completa |
| `progress.ts`, `ProgressPanel.tsx`, `SideProgress.tsx`, `progression.ts` | Compatibilidad de resultados, frecuencia y propuesta futura elegida |

Registro v5 bajo `gim.app.entrenamientos.v3`. La clave conserva el nombre anterior, pero el contenido tiene versión explícita. Lectores v1/v2/v3/v4/v5; abrir no escribe. Antes de guardar sobre v3/v4 se conserva una copia previa local. Cualquier fallo conserva lo confirmado y no autoriza borrar almacenamiento. Comparar y escribir no es una transacción entre pestañas; preferir una sola pestaña.

Respaldo 3 incluye sesiones, rutinas personalizadas y bloques; no incluye borradores, navegación, preferencias de biblioteca, temporizador ni descartes de propuestas. Límite 2 MiB. El plan portátil no contiene historial y excluye equipos concretos/alternativas; notas solo por elección. CSV no representa todas las modalidades/combinaciones: usar JSON para planes avanzados. Especificación en la entrega 0.20.

Cada sesión copia ejercicios y objetivos; editar plantillas no modifica el pasado. Variante, instancia, equipo, criterio de peso y criterio de reps se mantienen distintos. Los datos desconocidos no se inventan. Series por lado y tramos tienen cierre explícito y no multiplican el número de series principales. No se calculan calorías, recuperación ni equivalencias fisiológicas.

## Continuidad PWA y límites

Manifest describe instalación; service worker precachea interfaz; localStorage guarda resultados. Offline requiere conexión previa y recursos preparados. Instalar no garantiza que el navegador conserve datos indefinidamente. Un origen/perfil distinto tiene otro registro, sin sincronización automática.

El aviso de actualización permite cargar la versión nueva. No eliminar datos para actualizar. Las pestañas con código antiguo deben actualizarse antes de seguir escribiendo. El temporizador se recalcula al volver, sin garantía de notificación con pantalla bloqueada. No hay sonido, vibración, GPS ni servicios externos.

Estado operativo y evidencia: [punto de reanudación](../docs/estado-desarrollo-gim.md).

Revisión 0.20.1: HistoryManagement.tsx gestiona limpieza recuperable y restauración sin conflictos. Copia auxiliar local fuera del respaldo principal; no es borrado permanente. PwaControls ofrece búsqueda de actualización y App avisa cuando está lista. [Detalle](../docs/revision-plan-usabilidad-0.20.1.md).

Rediseño separado de main según UI UX Pro Max: [sistema canónico](../design-system/gim/MASTER.md). Serie actual en campos amplios con confirmación única, atajos reutilizados y consulta de tablas/metadatos a pedido. Sin cambio de esquema ni dependencias.

# Entrega local 0.13.1 · F21: continuidad y respaldo

Fecha: 22/10/2026. Estado: IMPLEMENTADO_NO_VALIDADO. Cierra el código previsto para E1; falta validación de uso. Sin publicación.

## Comportamiento implementado

- Entrenar muestra la última serie confirmada de la sesión, con ejercicio, peso y repeticiones. Conserva la navegación existente al último entrenamiento/ejercicio; no agrega pantalla obligatoria al abrir.
- El borrador de serie recuperado se distingue de los valores sugeridos y de una serie confirmada. Editar no registra automáticamente.
- La nota en edición se conserva por sesión y ejercicio en almacenamiento local. Tras recargar, se recupera abierta y pendiente de confirmar; guardar o cancelar libera la navegación. No se incluye en el respaldo hasta confirmar.
- Configuración compara el registro confirmado con la huella del último archivo preparado. Si hay cambios, muestra un aviso con acceso al respaldo y opción de posponerlo siete días. No hay avisos entre series ni permisos de notificación.
- Descargar registra fecha y huella del contenido preparado después de solicitar la descarga. La interfaz recuerda comprobar el archivo: el navegador no demuestra que terminó guardado fuera del almacenamiento de la aplicación.

## Contrato técnico y decisiones

**D19:** `noteDraft.ts` utiliza claves `gim.app.borrador-nota.v1.<sesión>.<ejercicio>`. El borrador contiene texto (máximo 500 caracteres) y base contextual: fecha, cierre, montaje y nota confirmada. Una base incompatible no se aplica silenciosamente. Los errores de lectura/escritura/eliminación se muestran; el texto en pantalla permanece. Cancelar descarta el borrador, guardar lo limpia solo después de confirmar la nota. Reiniciar la sesión de prueba también limpia sus borradores de nota.

**D20:** `useBackupStatus.ts` guarda únicamente versión, fecha de preparación, huella SHA-256 del JSON confirmado y fecha opcional de posposición en `gim.app.estado-respaldo.v1`. No duplica el registro completo. Compara todo el contenido, incluidas correcciones/notas/rutinas que no cambian la cantidad de series. No representa archivo recibido, nube ni sincronización. Siete días es una política local ajustable, no una recomendación derivada de investigación. Si falla la comparación, ofrece exportación manual; si falla guardar metadatos, lo informa sin alterar entrenamientos. Se actualiza al volver al foco y por cambios de metadatos en otra pestaña.

Datos: registro v3, lectores anteriores y respaldo formato 1 conservados. Sin migración, dependencias ni servicios nuevos. Importar mantiene validación/vista previa/conflictos y el cambio controlado de contexto existente; los borradores no viajan en los archivos.

## Diseño y referencias

Aplicada Impeccable, criterio Operate. Se conserva grafito/lima, tres módulos, una acción principal y detalles a pedido. El aviso contextual vive junto al respaldo; puede posponerse y sus acciones se acomodan en pantallas estrechas.

- [Carbon: notificaciones](https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines): información contextual, escasa y accionable, sin interrumpir tareas. Adaptación: un aviso en Configuración, acceso a respaldo y posposición.
- [MDN: HTMLAnchorElement.download](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download): solicitar descarga no demuestra recepción/persistencia del archivo. Fundamenta el lenguaje «preparado».
- [Hevy: notas de rutina y entrenamiento](https://help.hevyapp.com/hc/en-us/articles/34463684392983-How-do-the-exercise-notes-routine-and-workout-notes-work): continuidad del criterio de notas separadas de F02.

## Evidencia y límites

Compilación TypeScript/Vite y generación PWA correctas. Revisión estática Impeccable señaló un borde lateral decorativo; se retiró y se volvió a compilar. No tests ni automatización de navegador; ergonomía móvil, recuperación efectiva y descarga/importación en uso no verificadas. No se tocaron datos reales.

Offline requiere preparación previa. Borradores y metadatos pertenecen al navegador/origen y pueden perderse si se elimina su almacenamiento. No hay sincronización ni garantía de copia externa. Los conflictos simultáneos de borradores entre pestañas no se resuelven automáticamente; el registro confirmado conserva su control de concurrencia.

Archivos principales: `app/src/noteDraft.ts`, `useBackupStatus.ts`, `SetupNotes.tsx`, `BackupPanel.tsx`, `TrainingScreen.tsx`, `App.tsx`, `styles.css`, `app/package.json`.

Siguiente acción: E2/R02, resolver identidad estable de catálogo/variante y equipo antes de F03/F18-M/CAT01. No incorporar los 150 candidatos automáticamente ni unir historial por nombre.

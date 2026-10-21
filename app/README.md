# GIM · Bitácora

Versión 0.12 del proyecto del curso: React + TypeScript + Vite + vite-plugin-pwa.

v0.12 responde al recorrido de uso: confirmación en la fila, corrección desde los valores visibles, borradores de serie, atajos de resta, criterio de carga y comparación histórica. Herramientas de prueba separadas en Configuración. El dato v3 agrega un criterio opcional sin reinterpretar registros antiguos. Ver ../docs/revision-uso-v0.12.md.

v0.11 mejora el desplazamiento vertical en móvil y agrega navegación anterior/siguiente y por gesto lateral en la ficha del ejercicio, también para sesiones finalizadas. El cambio se completa al superar el 25 % del ancho o con un gesto rápido; no hay posición intermedia persistente. Ver ../docs/navegacion-movil.md. Sin cambios del formato de datos ni guardado automático al navegar.

## Alcance

v0.10 ajusta orden y temática: grafito/lima, títulos Barlow Condensed locales y composición de registro principal con rutina lateral en escritorio. En móvil conserva una columna y navegación inferior. La paleta se aplica también a historial y configuración. Ver ../DESIGN.md. Sin cambios de datos ni funciones nuevas.

v0.9 incorpora referencias visuales de los ejercicios, una tabla de series guardadas/actual/pendientes y una vista compacta de la rutina que permite elegir un ejercicio. Guardar serie conserva el único camino de confirmación. Las sesiones cerradas muestran la tabla de consulta sin campos editables; deben reabrirse para agregar series. Los ejercicios personalizados sin referencia usan un símbolo neutro.

La interfaz se divide en Entrenar, Historial y Configuración. Entrenar inicia una rutina de hoy con un toque o recupera la última sesión; muestra peso, repeticiones y Guardar serie. Ajustes de carga, correcciones y acciones excepcionales se despliegan a pedido. Historial permite consultar sin cambiar la sesión activa. Configuración agrupa rutinas, respaldos, fecha personalizada e instalación/actualización. Diseño y referencias oficiales en ../docs/curso/v0.7-uso-simple.md.

Flujo personal de gimnasio: una sesión por rutina/fecha, cargas rápidas, sugerencia de peso inicial desde la primera serie anterior, avance entre ejercicios, cierre y bitácora cronológica. Editor para crear, modificar y ordenar rutinas; cada sesión copia sus ejercicios/objetivos. Respaldo de sesiones y catálogo personalizado con vista previa y detección de conflictos. No tiene importación genérica de Excel, eliminación de series, cuentas ni sincronización automática todavía. Las tres rutinas del Excel de referencia siguen precargadas.

El formato actual es versión 3 bajo gim.app.entrenamientos.v3. Si no existe, se recupera v2, o v1 si tampoco existe v2. Los entrenamientos anteriores conservan su id, fecha, nombre y series de press de banca; se les agrega ese ejercicio sin objetivos inventados. V1 sigue apareciendo Sin fecha. No se escriben datos durante el render inicial: la primera alta exitosa persiste v3. Las entradas v1/v2 quedan intactas. Si existe v3 es la autoridad y no se cae silenciosamente a versiones viejas ante corrupción. Actualizar pestañas a v0.10 antes de seguir registrando; no se fusionan escrituras posteriores de aplicaciones viejas.

Un navegador/perfil/origen diferente puede mostrar otro registro. No hay migración desde el contador didáctico de clase 4.

## Comandos habituales

Requiere Node.js compatible con Vite (se utilizó 24.19.0) y pnpm (se utilizó 11.25.0).

Desde esta carpeta:

```powershell
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm preview
```

Preview: http://127.0.0.1:5175/. Desarrollo: pnpm dev → http://127.0.0.1:5173/. Son orígenes diferentes: no comparten almacenamiento local.

En esta computadora se utilizaron las herramientas incluidas en Codex, sin instalar Node ni pnpm globalmente. Desde la raíz PWA GIM, equivalente concreto:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" --dir app run build
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" --dir app run preview
```

Mantener la terminal del servidor abierta mientras se usa la vista previa. El servidor solo escucha en esta computadora: no es una URL para abrir desde el celular. Publicación HTTPS y prueba desde celular se harán después.

## Prueba PWA

1. Ejecutar build y preview; la PWA se comprueba en la versión de producción, no solo en dev.
2. Abrir la URL con conexión, esperar la preparación offline y recargar para que el service worker controle la página.
3. Crear una sesión de Día 1, registrar sus cuatro series de Press plano: debe avanzar a Press inclinado incluso si la cuarta tiene menos repeticiones. La bitácora conserva el orden. Crear otra sesión en otra fecha: no debe compartir series; su primera carga sugerida corresponde a la primera serie anterior. Al abrir se restaura la última sesión y ejercicio consultados.
4. Con DevTools en Offline, recargar, crear una sesión y registrar otra serie: deben conservarse localmente y sobrevivir otra recarga.
5. Volver a No throttling al terminar. Instalar desde el menú del navegador si lo ofrece; la aparición del botón Instalar app depende de beforeinstallprompt.

Manifest describe identidad/instalación. Service worker conserva archivos de interfaz. localStorage conserva las series. Cada mecanismo tiene una función diferente. Offline requiere que los recursos hayan quedado preparados previamente.

Las actualizaciones disponibles muestran un aviso. Aplicarlas recarga la página: terminar primero los datos aún no enviados del formulario. Esta versión incorpora transición v1/v2→v3 sin borrar sus fuentes.

## Calidad y límites

Entrega v0.10: detector estático sin hallazgos y compilación de producción correcta. Tipografía oficial de Google Fonts guardada en public/fonts con su licencia OFL y precacheada. No se realizaron tests ni pruebas de navegador; no hay validación visual ni métricas reales de rendimiento de esta entrega.

Entrega v0.9: compilación de producción y detector estático correctos. Atlas de ilustraciones inspeccionado como imagen, empaquetado en un WebP local de 154.230 bytes y precacheado para offline. No se ejecutaron tests ni pruebas de navegador. Detalles en ../docs/curso/v0.9-ejercicios-visuales.md.

Entrega v0.8: revisión de código con Impeccable, estilos consolidados, mejor escala de lectura y controles, estados de cierre/series extra aclarados y montaje diferido de paneles y registros. Detector estático sin hallazgos y compilación de producción completada. No se realizaron tests ni pruebas de navegador. Ver docs/curso/v0.8-revision-ux.md para evidencia y límites.

Entrega v0.7: por pedido del estudiante no se escribieron ni ejecutaron tests ni pruebas de navegador. Se realizó compilación TypeScript/Vite y generación del service worker. Las verificaciones siguientes corresponden a v0.6 y entregas anteriores; no validan la interfaz nueva. El script verify-guided.cjs corresponde al flujo v0.6.

- TypeScript estricto y build de producción.
- Treinta y cuatro pruebas node:test: dominio y formatos anteriores, correcciones, persistencia inyectable, respaldo, catálogo, sugerencias, avance y política de importación.
- Chrome con perfiles temporales: regresión de alta/edición, descarga inspeccionada, análisis sin escritura, cancelar/confirmar, duplicados/conflictos, archivos inválidos/grandes, vista previa desactualizada, exclusión de borradores, eventos entre pestañas, recarga/offline y fallos de almacenamiento. Capturas de escritorio/móvil inspeccionadas.
- Capturas de escritorio/móvil en ../docs/curso/evidencias/.
- Instalación real en el dispositivo del estudiante: pendiente de prueba manual.

Antes de escribir se compara el texto actual con la versión leída por esta pestaña. Si cambió, se exige recargar; el evento storage también informa cambios desde otras pestañas. No es coordinación transaccional ni sincronización: usar una pestaña sigue siendo la recomendación. Si el dato guardado no puede interpretarse, se deshabilitan escrituras y respaldos para no sobrescribir ni exportar un registro vacío ficticio. La recuperación automática sobre almacenamiento local corrupto no se implementa todavía. El almacenamiento del navegador no constituye un respaldo externo.

## Rutina de referencia

El estudiante aportó una planilla de tres días. Se extrajo en ../docs/curso/referencias/rutina-3-dias.json con hoja/fila de origen, sin modificar el Excel. app/src/rutina.ts contiene las plantillas usadas por la interfaz, sin rutas personales ni enlaces externos. Sus objetivos no se registran como series realizadas.

Cada sesión copia nombre, grupo, objetivos y notas de los ejercicios. Cambiar luego la plantilla no modifica sesiones existentes. Las biseries se muestran como nota: no hay temporizador ni ejecución coordinada. Se permiten series adicionales y repeticiones distintas al objetivo porque registramos lo realizado.

La primera serie sugiere la primera carga anterior del mismo ejercicio y rutina, considerando solo fechas previas. Dentro de la sesión se conserva la última carga del ejercicio. Sugerencias editables, no series automáticas. 0 kg significa sin carga externa; no representa peso corporal. Se calcula volumen externo como suma de carga por repeticiones; no equivale a calorías. Usar un criterio consistente al registrar peso.

CSS sencillo sin Tailwind por ahora: evita una herramienta adicional en este primer paso. No hay secretos, servicios contratados ni despliegue público.

## Corrección de series

Editar abre un formulario con los valores de esa serie. El borrador solo vive en memoria hasta Guardar cambios. Cancelar no escribe. Mientras se edita se bloquean navegación, creación de sesiones, importación y alta de series; primero hay que guardar o cancelar. Una sesión finalizada permite corregir valores, pero requiere reabrirse para agregar series.

Guardar corrige únicamente peso/repeticiones del id de serie dentro de su sesión y ejercicio. No cambia identidad, cantidad de series, fecha ni objetivos. Se valida y escribe antes de actualizar la interfaz. Un fallo mantiene la fila original y el borrador disponible; una pestaña desactualizada exige recargar.

Los registros Sin fecha siguen siendo solo consultables. No hay historial de correcciones ni botón Deshacer después de guardar. Cancelar solo descarta cambios todavía no guardados. La versión de app es 0.10; el formato sigue siendo v3 con campos opcionales aditivos para catálogo, hora de registro y cierre. Los registros anteriores siguen siendo válidos.

## Arquitectura y respaldo

- App.tsx y BackupPanel.tsx presentan datos y coordinan acciones.
- training.ts calcula cambios y valida reglas sin acceder a almacenamiento.
- useRegistro.ts coordina estado React, errores de carga y cambios externos.
- storage.ts lee/escribe mediante un contrato Almacen inyectable (getItem/setItem), conserva migraciones y comprueba versión leída antes de escribir.
- backup.ts valida archivos, serializa el respaldo y calcula una propuesta de importación sin efectos de almacenamiento.
- guided.ts concentra sugerencias, pendientes, finalización/reapertura, catálogo y recuperación de navegación; RoutineEditor.tsx mantiene el borrador separado de la rutina guardada.

El respaldo es JSON legible, con aplicacion, formatoRespaldo:1, exportadoEn y datos (registro v3, incluyendo catálogo personalizado y tiempos cuando existen). Límite actual: 2 MB tanto de importación como de exportación. No incluye borradores ni última pantalla consultada. No se envía a un servidor.

La vista previa clasifica sesiones y catálogo: nuevos, idénticos o en conflicto. Se agregan solo los nuevos; los idénticos no se duplican. Diferencias en identidades existentes, series de otra sesión o una rutina/fecha que ya existe con otro ID bloquean toda la importación. No se elige una copia ganadora ni se reemplazan valores existentes. No se eliminan duplicados históricos ya guardados.

Analizar y cancelar no escriben. Confirmar usa el mismo contrato de persistencia que el resto de la app. Si el registro cambia después del análisis, se invalida la vista previa. Si cambia en otra pestaña, se bloquea la escritura desactualizada. Mientras se edita una serie no se puede importar; exportar incluye solo lo guardado.

Las comparaciones de versión y escritura no son una operación atómica entre pestañas. IndexedDB o un backend requerirán adaptar este contrato síncrono a operaciones asíncronas y estados pendientes; el aislamiento de persistencia facilita ese trabajo, pero no lo convierte en un simple cambio de nombre.

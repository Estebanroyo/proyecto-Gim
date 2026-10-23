# GIM 0.21 · claridad móvil con UI UX Pro Max

Fecha: 23/10/2026. Rama: `feat/mobile-clarity-uupm`. Pedido: publicar primero la versión actual, crear una rama e instalar/aplicar la skill de uupm.cc para una PWA clara y fácil de usar en el gimnasio.

## Publicación y separación

- Base 0.20.1 publicada en main: commit `1e4203c3c57e2f190e0141f51bd0439a1f5e30b6`.
- GitHub Actions: https://github.com/Estebanroyo/proyecto-Gim/actions/runs/39961864701, completado con éxito.
- Página https://estebanroyo.github.io/proyecto-Gim/: HTTP 200 y JS con marcador v0.20.1. Es disponibilidad estática, no validación funcional.
- Rama creada desde esa base y publicada antes de modificar interfaz. El rediseño 0.21 permanece separado: no se fusionó ni desplegó en main.
- Solo fuentes/recursos y documentación técnica seleccionada; sin respaldos, planillas, capturas privadas, node_modules ni datos de navegadores. El checkout público contiene un estado técnico resumido, no el registro operativo privado.

## Skill y fuente de verdad

Instalada `ui-ux-pro-max` con skill-installer, desde `.claude/skills/ui-ux-pro-max` de https://github.com/nextlevelbuilder/ui-ux-pro-max-skill, enlazado por https://uupm.cc/. La instalación global queda disponible para siguientes turnos. Sus scripts locales se ejecutaron en este trabajo; no se añadió la herramienta al bundle de la PWA.

Sistema canónico: [MASTER.md](../design-system/gim/MASTER.md). Documenta consultas, coincidencias válidas, exclusiones y adaptación. No se persistió como regla una salida genérica de landing/edición que no correspondía al producto. UI UX Pro Max es la referencia principal por pedido; Impeccable Operate se usa como apoyo estático y de consistencia.

## Decisiones e implementación

| Problema | Cambio | Archivos |
|---|---|---|
| La tabla de todas las series desplazaba la serie actual | Formulario enfocado en dos campos amplios y un Guardar serie ancho; tabla de consulta/corrección desplegable | TrainingScreen.tsx |
| Sumar peso requería abrir opciones | Cuatro incrementos visibles; restar/cero a pedido; reutilización también en modos avanzados compatibles | WeightAdjustments.tsx, AdvancedSetForm.tsx |
| Metadatos competían con el registro | Variante, equipo, criterios y objetivos completos a pedido; montaje/notas debajo del formulario | TrainingScreen.tsx |
| Resumen y lista completos ampliaban la pantalla móvil | Progreso compacto; lista y resumen detallado desplegables | TrainingScreen.tsx |
| Inicio se parecía más a un conjunto de paneles que a elegir rutina | Filas táctiles compactas en móvil, ampliadas a columnas con más espacio | styles.css |
| Configuración agrupaba todas las herramientas con igual jerarquía | Rutinas y registro; Planes y progreso; Respaldo y datos; Más opciones; Aplicación | App.tsx, styles.css |
| Tinte y títulos competían con valores | Grafito neutro, lima reservado a acción/selección, títulos funcionales de sistema y números tabulares | styles.css, vite.config.ts |

No se modifica dominio, identidades, datos v5, respaldo 3, planes 1, regla de una sesión/rutina/fecha, borradores ni recuperación de historial. Los mismos callbacks de confirmación y corrección siguen validando y persistiendo antes de avanzar. Los campos mantienen min/max/paso y teclados apropiados.

## Evidencia y límites

Compilación de producción con TypeScript/Vite y generación PWA; detector estático sobre componentes modificados. Preview local http://127.0.0.1:5175/ sirve build 0.21; el service worker de una pestaña ya abierta puede requerir Aplicar actualización. HTTP no comprueba qué versión controla una pestaña.

Sin tests, automatización de navegador, renderizado capturado ni uso táctil. No se ejecutó el checklist nativo como si fuera una prueba de esta web. Las recomendaciones de tamaño y composición están implementadas en CSS, pendientes de validación real con teclado, reflejos, gestos y texto largo.

Sin dependencias, fuentes remotas, nuevos medios ni animaciones añadidas. La navegación lateral existente permanece, con scroll vertical y controles Anterior/Siguiente. No hay porcentaje de mejora medido ni afirmación de que toda recomendación de la skill se haya aplicado.

## Próxima revisión

Evaluar el recorrido real de una serie en teléfono: localizar ejercicio/objetivo, ajustar carga, confirmar y pasar al siguiente turno. Corregir el primer hallazgo concreto. Mantener el rediseño en su rama hasta decidir su integración; el pedido de publicar la base no equivale a publicar el nuevo diseño.

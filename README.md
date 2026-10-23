# GIM · Bitácora personal de entrenamiento

PWA personal para seguir rutinas y registrar lo realizado en el gimnasio, con prioridad de uso en celular. Versión de la rama 0.21.0; base pública 0.20.1. React, TypeScript, Vite y vite-plugin-pwa.

## Usar y ejecutar

[Página pública](https://estebanroyo.github.io/proyecto-Gim/) · [Estado de publicación](https://github.com/Estebanroyo/proyecto-Gim/actions/workflows/deploy.yml).

```sh
pnpm --dir app install --frozen-lockfile
pnpm --dir app dev
pnpm --dir app build
pnpm --dir app preview
```

Requiere Node.js 24 y pnpm 11.25.0. Build compila producción y genera la PWA; no ejecuta tests. Preview local: http://127.0.0.1:5175/.

## Capacidades

- Entrenar, Historial y Configuración; rutinas reutilizables y copia independiente del plan por sesión.
- Registro local, borradores, correcciones, sugerencia de carga inicial y objetivos por serie.
- Calentamiento/trabajo/fallo explícito, descansos persistentes, grupos simples y adaptación de sesión.
- Registro opcional de RIR, asistencia, lados, tramos, duración y cardio manual.
- Biblioteca local, equipo concreto, montaje habitual, bloques reutilizables y planes portátiles.
- CSV propio con vista previa, respaldo completo y detección de conflictos.
- Historial contextual, propuesta de progresión optativa y limpieza recuperable de entrenamientos.

Detalle, combinaciones soportadas y contratos de datos en [entrega principal](docs/entrega-0.20-ruta-principal.md). [Estado técnico](docs/estado-desarrollo-gim.md) · [Producto](PRODUCT.md) · [Diseño](DESIGN.md).

## Datos y límites

Registro v5 bajo la clave histórica única, lectores anteriores y respaldo 3. Las sesiones conservan sus copias; no se completan retrospectivamente roles, equipos o criterios desconocidos. Offline requiere preparar recursos con conexión. Instalar no equivale a respaldo ni sincronización.

Sin cuenta, backend ni sincronización automática. Cada navegador/perfil/origen conserva sus propios datos; pasar al teléfono requiere respaldo manual. Publicar el código no publica los entrenamientos del navegador. La recuperación de limpieza es local y no forma parte del respaldo completo activo.

La implementación está compilada, pero la aceptación integral y ergonomía física siguen pendientes. No se realizaron tests ni automatización de escenarios para esta entrega. Los fixtures de tests históricos se conservan fuera de la compilación de producción y no son cobertura del contrato actual.

GitHub Pages se publica desde main mediante Actions; el rediseño se trabaja por separado. [Despliegue](docs/despliegue.md). Recursos gráficos y fuentes locales; licencia OFL en app/public/fonts/OFL.txt.

Rediseño móvil en esta rama: [entrega](docs/rediseno-movil-uupm-0.21.md) y [sistema canónico UI UX Pro Max](design-system/gim/MASTER.md). No integrado en main.

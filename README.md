# GIM · Bitácora personal de entrenamiento

PWA para seguir rutinas y registrar series, peso y repeticiones desde el gimnasio. React, TypeScript, Vite y vite-plugin-pwa. Versión 0.11.

## Desarrollo

Requiere Node.js 24 y pnpm 11.25.0.

```sh
pnpm --dir app install --frozen-lockfile
pnpm --dir app dev
```

## Compilación

```sh
pnpm --dir app build
pnpm --dir app preview
```

La compilación genera `app/dist`. El preview es local, no un servidor de producción. No se ejecutan tests en el flujo de publicación.

## Publicación

Workflow preparado para GitHub Pages: `.github/workflows/deploy.yml`. Hay que habilitar GitHub Actions como fuente en Settings → Pages. La disponibilidad depende de la visibilidad y el plan del repositorio.

URL prevista después del despliegue: https://estebanroyo.github.io/proyecto-Gim/

Ver [configuración y límites del despliegue](docs/despliegue.md).

## Funcionamiento

- Entrenar, Historial y Configuración separados.
- Rutinas reutilizables y copia de objetivos por sesión.
- Registro local por serie y avance al siguiente ejercicio.
- Sugerencia de carga desde la primera serie del entrenamiento anterior.
- Editor de rutinas y respaldo JSON con validación.
- Acceso offline después de preparar la aplicación con conexión.
- Reinicio de una sesión con confirmación explícita para repetir el flujo.
- Navegación por ejercicios con anterior/siguiente y gesto lateral, también al revisar sesiones finalizadas. Tabla sin scroll interno en móvil.

No hay cuentas, backend ni sincronización automática. Cambiar de origen o dispositivo requiere exportar e importar un respaldo desde Configuración. No se publican datos de entrenamientos al subir el código.

Los recursos gráficos y fuentes son locales. La licencia OFL de Barlow Condensed se incluye en `app/public/fonts/OFL.txt`.

[Contexto de producto](PRODUCT.md) · [Diseño](DESIGN.md)

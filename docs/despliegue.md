# Publicación de GIM

La app es un frontend estático: Vite genera HTML, CSS, JavaScript y recursos en `app/dist`. GitHub Pages sirve esos archivos con HTTPS. No necesita ejecutar Node en el servidor. El service worker permite reutilizar archivos después de una primera carga completa con conexión; localStorage mantiene las series en ese navegador.

## GitHub Pages

Repositorio: https://github.com/Estebanroyo/proyecto-Gim

URL prevista una vez habilitado y desplegado: https://estebanroyo.github.io/proyecto-Gim/

El propietario debe habilitar Pages en Settings → Pages → Source: GitHub Actions. GitHub Free requiere que el repositorio sea público; si se desea mantener privado, usar un plan compatible o un hosting estático que admita repositorios privados. No se cambia la visibilidad automáticamente.

`.github/workflows/deploy.yml` instala dependencias con el lockfile, compila y despliega. Se ejecuta al subir cambios de la app a main y también desde Actions → Publicar PWA en GitHub Pages → Run workflow. No ejecuta tests.

`DEPLOY_BASE_PATH=/proyecto-Gim/` configura rutas de recursos, manifest, inicio, alcance del service worker y documento offline. Sin esa variable el desarrollo y compilación local siguen usando `/`. Para otro nombre de repositorio o dominio, ajustar esa variable en el workflow.

## Publicar cambios desde esta computadora

El checkout vinculado al repositorio remoto está en `.deployment-repo/`. La carpeta `app/` original sigue siendo la fuente de trabajo local: copiar explícitamente allí los cambios necesarios antes de un commit, excluyendo node_modules, dist y archivos .env. No usar git add sobre todo el directorio del curso.

## Datos al cambiar de dirección

La dirección pública y http://127.0.0.1:5175 tienen almacenamiento separado. Antes de cambiar, exportar el respaldo JSON desde Configuración y luego importarlo en la URL pública. Para llevar datos al teléfono, trasladar ese archivo e importarlo allí. Ninguna publicación sube automáticamente entrenamientos, crea cuentas o sincroniza dispositivos.

Solo se publican fuentes de la app, recursos necesarios y documentación técnica seleccionada. No subir respaldos de entrenamientos, planillas personales, credenciales, node_modules, archivos del curso ni herramientas locales de Codex.

Fuentes: https://vite.dev/guide/static-deploy y https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site.

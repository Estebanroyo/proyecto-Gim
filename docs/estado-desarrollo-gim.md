# Estado técnico publicado · 0.20.1

La ruta principal E1–E8 está implementada en código; aceptación integral de uso pendiente. E9 conserva las condiciones de la [hoja de ruta](hoja-de-ruta-gim.md). Datos v5, respaldos 3 y planes portátiles 1; consultar [contratos de entrega](entrega-0.20-ruta-principal.md).

0.20.1 incorpora limpieza recuperable sin cambiar rutinas, aviso de actualización y consulta manual, confirmación/corrección del registro avanzado, atajos de carga con RIR/tramos y presentación coherente de unidades y ejercicios pospuestos. Sin cambio de esquema principal.

Se conserva localStorage como autoridad por origen, con lectura anterior, copia previa y detección de cambios externos. No hay transacciones entre pestañas, backend ni sincronización. Las copias auxiliares de recuperación no son respaldos externos.

Compilación de producción y revisión estática realizadas. Sin tests ni automatización de escenarios; sin afirmación de validación móvil. La documentación operativa privada y los datos de navegadores no forman parte de este repositorio.

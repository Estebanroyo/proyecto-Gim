# GIM · Bitácora personal de entrenamiento

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Una persona que registra su propio entrenamiento en el gimnasio, principalmente desde el celular y entre series. No es una herramienta para administrar clientes o entrenamientos de otras personas.

## Product Purpose

Seguir una rutina previamente preparada y registrar el peso y las repeticiones realmente realizados, con pocas decisiones durante la sesión. Conservar un historial ordenado para futuras consultas y análisis.

## Operating Context

El usuario abre la app, elige Día 1, 2 o 3 y comienza por el primer ejercicio. Registra cada serie, ajusta la carga y avanza por el plan. La rutina original fue aportada en un Excel de tres días y está precargada en la aplicación. Puede faltar conexión a internet en el gimnasio.

La app debe recuperar el último entrenamiento y ejercicio utilizados. En una sesión nueva, la primera carga sugerida de un ejercicio corresponde a la primera serie de la sesión anterior de la misma rutina: si comenzó con 20 kg y terminó con 40 kg, vuelve a sugerir 20 kg. Es una sugerencia editable, no una serie realizada automáticamente.

## Capabilities and Constraints

- Código existente: React, TypeScript, Vite y vite-plugin-pwa; versión de interfaz actual 0.10.
- Tres módulos: Entrenar, Historial y Configuración. Configuración contiene rutinas, respaldos, registro en otra fecha e instalación/actualización.
- Guardado local inmediato por serie, con actualización de pantalla y avance después de una escritura exitosa. Sin backend, cuenta ni sincronización automática.
- Una sesión por identidad de rutina y fecha; si ya existe, se continúa la misma. No se borran automáticamente duplicados históricos.
- El objetivo del ejercicio y el resultado real son diferentes. Se avanza al completar la cantidad de series prevista, aunque no se alcancen las repeticiones objetivo.
- Cada sesión conserva una copia de sus ejercicios y objetivos. Editar la rutina se aplica a sesiones futuras, sin reescribir el historial.
- Editor para crear, ordenar y modificar rutinas. La referencia de Excel está precargada; no hay importador genérico de nuevas planillas.
- Referencias visuales locales para la rutina original, series en filas con estados y vista compacta de ejercicios. Los ejercicios personalizados sin imagen reconocida utilizan una alternativa neutra.
- Datos v3 en localStorage; respaldos JSON de sesiones y catálogo, con validación, vista previa y conflictos sin sobrescritura forzada.
- Acceso offline después de preparar la app con conexión. Navegadores, perfiles y orígenes diferentes tienen almacenamiento separado.
- Despliegue local; la URL loopback de esta computadora no proporciona acceso desde otro dispositivo. Publicación y uso real desde celular quedan pendientes.
- Se muestra volumen externo de entrenamiento. No inferir calorías fiables por serie a partir de peso y repeticiones ni inventar precisión o datos fisiológicos.

## Brand Commitments

Nombre actual: GIM · Bitácora. Interfaz y comunicación en español, con voseo y lenguaje directo. El usuario prioriza claridad y facilidad de uso y solicitó una temática más gimnasio en orden y colores. La implementación v0.10 adopta grafito y lima, manteniendo nombre, ilustraciones y funciones. Las reglas visuales se registran en DESIGN.md.

## Evidence on Hand

- Requisitos funcionales explicados por el usuario en esta conversación: rutina personal, cargas rápidas, peso inicial anterior, avance por series, historial, edición de rutinas y recuperación de última sesión.
- Referencia de rutina: docs/curso/referencias/rutina-3-dias.json y docs/curso/referencias/rutina-3-dias.md.
- Decisiones y límites actuales: docs/curso/v0.6-flujo-gimnasio.md y docs/curso/v0.7-uso-simple.md.
- La v0.7 se compiló sin ejecutar tests ni pruebas de navegador, por pedido del usuario. No atribuirle verificaciones de versiones anteriores.
- No hay métricas reales de uso, evaluaciones con usuarios ni mediciones de rendimiento que permitan afirmar mejoras cuantificadas.

## Product Principles

1. Registrar una serie debe ser el camino más evidente; preparar el plan y consultar el pasado son tareas separadas.
2. Reducir decisiones repetidas: rutina reutilizable, fecha de hoy y valores anteriores sugeridos.
3. Priorizar lectura clara en celular, interacción táctil, navegación intuitiva y carga rápida.
4. Mostrar confirmaciones verdaderas y conservar los datos antes de avanzar.
5. Incorporar funciones por su utilidad durante el entrenamiento; evitar acumular las características de otras apps.

- Preferencia confirmada durante v0.8: centrar el trabajo en comodidad de uso y claridad general, sin ampliar el alcance a funcionalidades específicas para discapacidades.

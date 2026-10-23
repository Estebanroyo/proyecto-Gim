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

- React, TypeScript, Vite y vite-plugin-pwa; versión local 0.21.0 en rama feat/mobile-clarity-uupm. La base 0.20.1 está publicada en main; el rediseño no se desplegó.
- Tres áreas: Entrenar, Historial y Configuración. Una acción principal para registrar; preparación y opciones avanzadas desplegables.
- Guardado local antes de confirmar/avanzar, con borradores recuperables separados de resultados. Sin backend, cuenta ni sincronización automática.
- Una sesión por rutina/fecha. Cada sesión copia ejercicios, objetivos, equipo y montaje. Editar plantillas o aceptar progresión solo cambia futuro.
- Objetivos por serie, rangos, carga y descanso opcionales. Trabajo, calentamiento, intento fallido, pendiente y omitido tienen significado distinto. No se reinterpretan datos antiguos sin metadatos.
- Descanso persistente por instante de fin, pausa/reanudar/omitir y excepciones por objetivo/ejercicio/ronda. Sin garantía de alarma con pantalla bloqueada.
- Grupos ordenados de 2–6 ejercicios simples; posponer/retomar, reordenar, alternativas preparadas y versión corta elegida de antemano, sin borrar lo realizado.
- Registro opcional por modalidad: peso/reps, lados separados, dropsets descendentes, tiempo y cardio manual. RIR 0–10 solo en series simples; asistencia separada. No se combinan técnicas automáticamente.
- Biblioteca local de 35 variantes, búsqueda ES/EN, favoritos/recientes/alias personales, equipo concreto con identidad y montaje por ejercicio. Los 150 candidatos de investigación no son una meta de importación.
- Bloques reutilizables, plan JSON portátil y CSV propio con vista previa, errores por fila y confirmación completa. No hay importación genérica de archivos Excel; la rutina original sigue precargada.
- Escritura del registro v5 en la clave histórica única; lectura v1–v5, respaldo completo 3 con lectura 1/2/3. Copias previas locales al escribir sobre v3/v4, sin borrar fuentes ni completar datos desconocidos.
- Respaldo completo conserva historial, rutinas personalizadas, bloques y notas. Plan portátil excluye historial, equipo concreto y alternativas; notas/montaje solo por elección explícita. Preferencias, borradores y temporizador no forman parte del respaldo.
- Historial con conteos contextualizados, actividad temporal confirmada y comparaciones por variante/equipo/criterio compatibles. Progresión desactivada hasta elección del usuario; exige evidencia suficiente y aceptación para modificar objetivos futuros.
- Offline después de preparar recursos con conexión. Navegador/perfil/origen distinto conserva otro registro. Almacenamiento local sujeto a cuota; no está coordinado transaccionalmente entre pestañas.
- Referencias gráficas y fuentes locales; personalizados sin ilustración usan alternativa neutra. No se añaden recursos pesados para registrar.
- Sin calorías fiables por serie, GPS, frecuencia cardiaca, diagnóstico ni medición de recuperación. kg/reps y segundos registrados no equivalen a precisión fisiológica.
- E1–E8 implementados localmente, pendientes de validación de uso. E9 condicionado: no activar ciclos, medidas personales, discos, sesión libre completa o sincronización sin necesidad y contrato propios.

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


Contrato actual, fuentes, límites y deuda: [entrega local 0.20](docs/entrega-0.20-ruta-principal.md). Continuidad exacta: [estado de desarrollo](docs/estado-desarrollo-gim.md). Las entregas anteriores conservan su evidencia por versión; compilación y revisión estática no validan uso móvil.

Revisión local 0.20.1: limpieza recuperable de historial en Configuración, sin cambiar rutinas/bloques; no es borrado definitivo. Actualización visible, búsqueda manual, corrección y confirmación en registro avanzado, atajos de carga conservados con RIR/tramos. Alcance y operación real en docs/revision-plan-usabilidad-0.20.1.md; aceptación integral pendiente.

Dirección móvil 0.21: sistema de interfaz basado en UI UX Pro Max, canónico en design-system/gim/MASTER.md. Serie actual en campos amplios, suma rápida y una confirmación; tablas/metadatos a pedido. No cambia el contrato de datos. Detalle y límites: docs/rediseno-movil-uupm-0.21.md.

import type { EjercicioPlan, RutinaDia } from './training';

export function etiquetaPeso(e: EjercicioPlan): string {
  return e.criterioPeso === 'por-mancuerna' ? 'kg por mancuerna' : e.criterioPeso === 'lastre' ? 'kg de lastre' : e.criterioPeso === 'total' ? 'kg totales' : 'kg · criterio sin declarar';
}

export function ayudaPeso(e: EjercicioPlan): string {
  if (e.criterioPeso === 'por-mancuerna') return 'Anotá el peso de una mancuerna: dos de 12 kg se registran como 12. Repeticiones por lado.';
  if (e.criterioPeso === 'lastre') return 'Anotá solo el peso añadido, sin sumar tu peso corporal. Sin lastre: 0 kg.';
  if (e.criterioPeso === 'total') return 'Anotá la carga total: barra y discos, o el valor de la máquina. Si usás dos mancuernas, sumá ambas.';
  return 'Este registro anterior no indica cómo se contó el peso. Conservá tu criterio habitual; los números históricos no se convierten. Definí el criterio en Mis rutinas para las próximas sesiones.';
}

// Solo completa planes para sesiones futuras; jamás modifica copias históricas.
export function completarCriterios(rutinas: RutinaDia[]): RutinaDia[] {
  const porMancuerna = new Set(['Press inclinado', 'Aperturas', 'Curl alternado', 'Curl martillo']);
  const lastre = new Set(['Flexiones', 'Fondos', 'Dominadas (agarre prono)']);
  return rutinas.map(r => ({ ...r, ejercicios: r.ejercicios.map(e => ({ ...e, criterioPeso: e.criterioPeso ?? (porMancuerna.has(e.nombre) ? 'por-mancuerna' : lastre.has(e.nombre) ? 'lastre' : 'total') })) }));
}

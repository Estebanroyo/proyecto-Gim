import type { EjercicioPlan, Sesion } from './training';

export function mismoEjercicio(s: Sesion, actual: Sesion, e: EjercicioPlan): boolean {
  const anterior = s.ejercicios.find(item => item.id === e.id);
  return (s.rutinaOrigen?.id ?? null) === (actual.rutinaOrigen?.id ?? null) && anterior?.nombre.trim().toLocaleLowerCase('es-AR') === e.nombre.trim().toLocaleLowerCase('es-AR');
}

export function sesionAnterior(sesiones: Sesion[], actual: Sesion, e: EjercicioPlan): Sesion | undefined {
  return sesiones.filter(s => s.id !== actual.id && s.fecha && actual.fecha && s.fecha < actual.fecha && mismoEjercicio(s, actual, e) && s.series.some(serie => serie.ejercicioId === e.id)).sort((a, b) => b.fecha!.localeCompare(a.fecha!))[0];
}

export function criterioComparable(s: Sesion, e: EjercicioPlan): boolean {
  return Boolean(e.criterioPeso && s.ejercicios.find(item => item.id === e.id)?.criterioPeso === e.criterioPeso);
}

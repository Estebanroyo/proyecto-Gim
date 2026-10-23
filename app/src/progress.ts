import type { EjercicioPlan, Sesion } from './training';
import { varianteDe } from './catalog';

export function mismoEjercicio(s: Sesion, actual: Sesion, e: EjercicioPlan): boolean {
  const anterior = s.ejercicios.find(item => item.id === e.id);
  if (!anterior || (anterior.modalidad ?? "repeticiones") !== (e.modalidad ?? "repeticiones") || (anterior.varianteId ?? null) !== (e.varianteId ?? null)) return false;
  if (anterior.equipoRef || e.equipoRef) {
    if (anterior.equipoRef?.id !== e.equipoRef?.id) return false;
  }
  // Un aparato no identificado no demuestra equivalencia entre sesiones.
  const tipo = varianteDe(e)?.equipo;
  if (s.id !== actual.id && e.varianteId && !e.equipoRef && (!tipo || ['Máquina', 'Polea', 'Smith'].includes(tipo))) return false;
  const equipoAnterior = anterior?.montaje?.equipo.trim().toLocaleLowerCase('es-AR') ?? '';
  const equipoActual = e.montaje?.equipo.trim().toLocaleLowerCase('es-AR') ?? '';
  if (!e.equipoRef && equipoAnterior !== equipoActual) return false;
  return (s.rutinaOrigen?.id ?? null) === (actual.rutinaOrigen?.id ?? null) && (e.varianteId ? true : anterior.nombre.trim().toLocaleLowerCase('es-AR') === e.nombre.trim().toLocaleLowerCase('es-AR'));
}

export function sesionAnterior(sesiones: Sesion[], actual: Sesion, e: EjercicioPlan): Sesion | undefined {
  return sesiones.filter(s => s.id !== actual.id && s.fecha && actual.fecha && s.fecha < actual.fecha && mismoEjercicio(s, actual, e) && s.series.some(serie => serie.ejercicioId === e.id)).sort((a, b) => b.fecha!.localeCompare(a.fecha!))[0];
}

export function criterioComparable(s: Sesion, e: EjercicioPlan): boolean {
  const anterior=s.ejercicios.find(item=>item.id===e.id);
  return Boolean(e.criterioPeso && anterior?.criterioPeso === e.criterioPeso && (anterior.criterioReps??null)===(e.criterioReps??null));
}

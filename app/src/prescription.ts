import type { EjercicioPlan, ObjetivoSerie, Sesion } from './training';
import type { Modalidad } from './training';
import { realizadas } from './execution';

export function objetivosDe(e: EjercicioPlan): ObjetivoSerie[] {
  return e.objetivosSerie ?? (e.seriesObjetivo && e.repeticionesObjetivo ? Array.from({ length: e.seriesObjetivo }, (_, i) => ({ id: `uniforme:${e.id}:${i}`, repsMin: e.repeticionesObjetivo!, repsMax: e.repeticionesObjetivo! })) : []);
}
export function objetivoActual(s: Sesion, e: EjercicioPlan): ObjetivoSerie | undefined {
  return objetivosDe(e)[realizadas(s, e.id).length];
}
export function repeticionesSugeridas(s?: Sesion, e?: EjercicioPlan): number {
  return s && e ? objetivoActual(s, e)?.repsMin ?? s.series.filter(serie => serie.ejercicioId === e.id).at(-1)?.repeticiones ?? e.repeticionesObjetivo ?? 10 : 10;
}
export function textoReps(o?: ObjetivoSerie): string {
  if (o?.segundos !== undefined) return `${o.segundos} s`;
  return o && Number.isFinite(o.repsMin) && Number.isFinite(o.repsMax) ? o.repsMin === o.repsMax ? String(o.repsMin) : `${o.repsMin}–${o.repsMax}` : '—';
}
export function resumenObjetivos(e: EjercicioPlan): string {
  const objetivos = objetivosDe(e);
  if (!objetivos.length) return 'A tu ritmo';
  const uniforme = objetivos.every(o => o.repsMin === objetivos[0].repsMin && o.repsMax === objetivos[0].repsMax && o.segundos === objetivos[0].segundos);
  return `${objetivos.length} series · ${uniforme ? `${textoReps(objetivos[0])}${objetivos[0].segundos === undefined ? " reps" : ""}` : 'objetivos por serie'}`;
}
export function prescripcionValida(dato: unknown, cantidad: unknown, reps: unknown, modalidad?: Modalidad): boolean {
  if (!Array.isArray(dato) || dato.length < 1 || dato.length > 100 || cantidad !== dato.length) return false;
  const ids = new Set<string>();
  const rep = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 100;
  for (const o of dato) {
    const temporal = modalidad === 'tiempo' || modalidad === 'cardio';
    if (!o || typeof o !== 'object' || typeof o.id !== 'string' || !o.id.trim() || o.id.length > 100 || ids.has(o.id) || (temporal ? !(typeof o.segundos === 'number' && Number.isFinite(o.segundos) && o.segundos >= 1 && o.segundos <= 86400 && o.repsMin === undefined && o.repsMax === undefined) : !rep(o.repsMin) || !rep(o.repsMax) || o.repsMin > o.repsMax || o.segundos !== undefined) ||
      (o.rol !== undefined && !['calentamiento', 'trabajo'].includes(o.rol)) ||
      (o.pesoKg !== undefined && (typeof o.pesoKg !== 'number' || !Number.isFinite(o.pesoKg) || o.pesoKg < 0 || o.pesoKg > 1000)) ||
      (o.descansoSegundos !== undefined && (typeof o.descansoSegundos !== 'number' || !Number.isInteger(o.descansoSegundos) || o.descansoSegundos < 0 || o.descansoSegundos > 3600))) return false;
    ids.add(o.id);
  }
  return reps === ((modalidad === 'tiempo' || modalidad === 'cardio') ? null : dato[0].repsMin);
}

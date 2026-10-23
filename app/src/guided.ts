import { validarRutinas } from './training.ts';
import type { EjercicioPlan, RegistroActual, RutinaDia, Sesion } from './training';
import { criterioComparable, mismoEjercicio } from './progress.ts';
import { esSimple, pendiente, turnoSiguiente } from './execution';
import { objetivoActual } from './prescription';

export function ejercicioPendiente(sesion: Sesion): EjercicioPlan | undefined {
  return turnoSiguiente(sesion);
}
export function siguienteEjercicio(sesion: Sesion, actualId: string): EjercicioPlan | undefined {
  return turnoSiguiente(sesion, actualId);
}
export function hayPendientes(sesion: Sesion): boolean { return sesion.ejercicios.some(e=>pendiente(sesion,e)); }
export function sugerirPeso(registro: RegistroActual, sesion: Sesion, ejercicioId: string): { pesoKg: number; origen: string } {
  const ejercicioActual = sesion.ejercicios.find(e => e.id === ejercicioId);
  const objetivo = ejercicioActual ? objetivoActual(sesion, ejercicioActual) : undefined;
  if (objetivo?.pesoKg !== undefined) return { pesoKg: objetivo.pesoKg, origen: 'Objetivo de carga de esta serie' };
  const propias = sesion.series.filter(s => s.ejercicioId === ejercicioId).filter(esSimple).filter(s => s.estado !== 'fallida');
  if (propias.length) return { pesoKg: propias.at(-1)!.pesoKg, origen: 'Última serie de este entrenamiento' };
  // Fecha de entrenamiento, no fecha de importación. Nunca usar una sesión futura.
  const anteriores = registro.entrenamientos.filter(s => s.id !== sesion.id && s.fecha && sesion.fecha && s.fecha < sesion.fecha &&
    (s.rutinaOrigen?.id ?? null) === (sesion.rutinaOrigen?.id ?? null))
    .sort((a, b) => b.fecha!.localeCompare(a.fecha!));
  for (const anterior of anteriores) {
    const ejercicio = sesion.ejercicios.find(e => e.id === ejercicioId);
    if (!ejercicio || !mismoEjercicio(anterior, sesion, ejercicio) || (ejercicio.criterioPeso && !criterioComparable(anterior, ejercicio))) continue;
    const primera = anterior.series.filter(esSimple).find(s => s.ejercicioId === ejercicioId && s.estado !== 'fallida');
    if (primera) return { pesoKg: primera.pesoKg, origen: `Primera serie del ${anterior.fecha}` };
  }
  return { pesoKg: 0, origen: 'Sin referencia anterior; ajustá tu carga' };
}

export function sumarPeso(valor: string, incremento: number): string {
  const numero = valor.trim() === '' ? 0 : Number(valor.replace(',', '.'));
  if (!Number.isFinite(numero)) throw new Error('Ingresá un peso válido antes de sumar.');
  return String(Math.round(Math.min(1000, Math.max(0, numero + incremento)) * 100) / 100);
}

export function finalizarSesion(registro: RegistroActual, id: string, instante: string): RegistroActual {
  const sesion = registro.entrenamientos.find(s => s.id === id);
  if (!sesion?.fecha) throw new Error('Elegí una sesión con fecha.');
  if (sesion.series.some(s=>s.cerrada===false)) throw new Error('Cerrá las series de lados o dropset que siguen abiertas antes de finalizar.');
  if (!sesion.series.length && !sesion.omisiones?.length) throw new Error('Registrá un resultado u omití explícitamente lo pendiente antes de finalizar.');
  if (!Number.isFinite(Date.parse(instante))) throw new Error('La fecha de finalización no es válida.');
  return { ...registro, entrenamientos: registro.entrenamientos.map(s => s.id === id ? { ...s, finalizadaEn: instante } : s) };
}

export function reabrirSesion(registro: RegistroActual, id: string): RegistroActual {
  return { ...registro, entrenamientos: registro.entrenamientos.map(s => {
    if (s.id !== id) return s;
    const { finalizadaEn: _, ...abierta } = s;
    return abierta;
  }) };
}

export function reiniciarSesion(registro: RegistroActual, id: string): RegistroActual {
  const sesion = registro.entrenamientos.find(s => s.id === id);
  if (!sesion?.fecha) throw new Error('Seleccioná un entrenamiento con fecha para reiniciarlo.');
  return { ...registro, entrenamientos: registro.entrenamientos.map(s => {
    if (s.id !== id) return s;
    const { finalizadaEn: _, ...abierta } = s;
    return { ...abierta, series: [], pospuestos: [] };
  }) };
}

export function guardarRutina(registro: RegistroActual, catalogo: RutinaDia[], rutina: RutinaDia): RegistroActual {
  const existente = catalogo.some(r => r.id === rutina.id);
  const rutinas = existente ? catalogo.map(r => r.id === rutina.id ? structuredClone(rutina) : r) : [...catalogo, structuredClone(rutina)];
  validarRutinas(rutinas);
  return { ...registro, rutinas };
}

export const claveNavegacion = 'gim.app.navegacion.v1';
export type Navegacion = { sesionId: string; ejercicioId: string };

export function recuperarNavegacion(registro: RegistroActual, texto: string | null): Navegacion {
  let candidato: Partial<Navegacion> = {};
  try { candidato = JSON.parse(texto ?? '{}') ?? {}; } catch { /* Preferencia dañada: se puede reconstruir sin tocar datos. */ }
  const sesion = registro.entrenamientos.find(s => s.id === candidato.sesionId) ?? [...registro.entrenamientos].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))[0];
  const ejercicio = sesion?.ejercicios.find(e => e.id === candidato.ejercicioId) ?? (sesion ? ejercicioPendiente(sesion) ?? sesion.ejercicios.at(-1) : undefined);
  return { sesionId: sesion?.id ?? '', ejercicioId: ejercicio?.id ?? '' };
}

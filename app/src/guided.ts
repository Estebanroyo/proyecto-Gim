import { validarRutinas } from './training.ts';
import type { EjercicioPlan, RegistroActual, RutinaDia, Sesion } from './training';

export function ejercicioPendiente(sesion: Sesion): EjercicioPlan | undefined {
  return sesion.ejercicios.find(e => e.seriesObjetivo === null || sesion.series.filter(s => s.ejercicioId === e.id).length < e.seriesObjetivo);
}

export function siguienteEjercicio(sesion: Sesion, actualId: string): EjercicioPlan | undefined {
  const indice = sesion.ejercicios.findIndex(e => e.id === actualId);
  const orden = [...sesion.ejercicios.slice(indice + 1), ...sesion.ejercicios.slice(0, indice)];
  return orden.find(e => e.seriesObjetivo === null || sesion.series.filter(s => s.ejercicioId === e.id).length < e.seriesObjetivo);
}

export function sugerirPeso(registro: RegistroActual, sesion: Sesion, ejercicioId: string): { pesoKg: number; origen: string } {
  const propias = sesion.series.filter(s => s.ejercicioId === ejercicioId);
  if (propias.length) return { pesoKg: propias.at(-1)!.pesoKg, origen: 'Última serie de este entrenamiento' };
  // Fecha de entrenamiento, no fecha de importación. Nunca usar una sesión futura.
  const anteriores = registro.entrenamientos.filter(s => s.id !== sesion.id && s.fecha && sesion.fecha && s.fecha < sesion.fecha &&
    (s.rutinaOrigen?.id ?? null) === (sesion.rutinaOrigen?.id ?? null))
    .sort((a, b) => b.fecha!.localeCompare(a.fecha!));
  for (const anterior of anteriores) {
    const primera = anterior.series.find(s => s.ejercicioId === ejercicioId);
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
  if (!sesion?.fecha || !sesion.series.length || !Number.isFinite(Date.parse(instante))) throw new Error('Registrá al menos una serie antes de finalizar.');
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
    return { ...abierta, series: [] };
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

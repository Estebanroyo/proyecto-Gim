import type { Montaje, RegistroActual, Sesion } from './training';

export function notaDeSesion(sesion: Sesion, ejercicioId: string): string | undefined {
  const notas = sesion.notasEjercicios;
  return notas && Object.hasOwn(notas, ejercicioId) ? notas[ejercicioId] : undefined;
}

export function normalizarMontaje(equipo: string, ajustes: string): Montaje | undefined {
  const limpio = { equipo: equipo.trim(), ajustes: ajustes.trim() };
  if (limpio.equipo.length > 80 || limpio.ajustes.length > 500) throw new Error('Usá hasta 80 caracteres para el equipo y 500 para sus ajustes.');
  return limpio.equipo || limpio.ajustes ? limpio : undefined;
}

export function guardarNotaSesion(registro: RegistroActual, sesionId: string, ejercicioId: string, texto: string): RegistroActual {
  const sesion = registro.entrenamientos.find(s => s.id === sesionId);
  if (!sesion?.fecha || sesion.finalizadaEn) throw new Error('Las notas solo se pueden editar en una sesión abierta con fecha.');
  if (!sesion.ejercicios.some(e => e.id === ejercicioId)) throw new Error('El ejercicio no pertenece a esta sesión.');
  const nota = texto.trim();
  if (nota.length > 500) throw new Error('La nota admite hasta 500 caracteres.');
  const entradas = Object.entries(sesion.notasEjercicios ?? {}).filter(([id]) => id !== ejercicioId);
  if (nota) entradas.push([ejercicioId, nota]);
  const notasEjercicios = Object.fromEntries(entradas);
  const { notasEjercicios: _anteriores, ...resto } = sesion;
  const actualizada = { ...resto, ...(entradas.length ? { notasEjercicios } : {}) };
  return { ...registro, entrenamientos: registro.entrenamientos.map(s => s.id === sesionId ? actualizada : s) };
}

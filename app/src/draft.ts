import type { EjercicioPlan, Sesion } from './training';

type Borrador = { base: string; peso: string; repeticiones: string };
const prefijo = 'gim.app.borrador-serie.v1.';
const clave = (sesion: Sesion, ejercicio: EjercicioPlan) => `${prefijo}${encodeURIComponent(sesion.id)}.${encodeURIComponent(ejercicio.id)}`;
const base = (sesion: Sesion, ejercicio: EjercicioPlan) => JSON.stringify([sesion.finalizadaEn ?? null, ejercicio.criterioPeso ?? null, sesion.series.filter(s => s.ejercicioId === ejercicio.id).map(s => [s.id, s.pesoKg, s.repeticiones])]);

export function leerBorrador(sesion: Sesion, ejercicio: EjercicioPlan): { borrador: Borrador | null; aviso: string } {
  if (sesion.finalizadaEn || !sesion.fecha) return { borrador: null, aviso: '' };
  try {
    const texto = localStorage.getItem(clave(sesion, ejercicio));
    if (!texto) return { borrador: null, aviso: '' };
    const dato: unknown = JSON.parse(texto);
    if (typeof dato !== 'object' || !dato || !('base' in dato) || dato.base !== base(sesion, ejercicio) || !('peso' in dato) || typeof dato.peso !== 'string' || dato.peso.length > 32 || !('repeticiones' in dato) || typeof dato.repeticiones !== 'string' || dato.repeticiones.length > 32) {
      return { borrador: null, aviso: 'El borrador no coincide con las series actuales. Revisá los valores sugeridos antes de guardar.' };
    }
    return { borrador: dato as Borrador, aviso: '' };
  } catch { return { borrador: null, aviso: 'No se pudo recuperar el borrador. Revisá los valores antes de guardar.' }; }
}

export function escribirBorrador(sesion: Sesion, ejercicio: EjercicioPlan, peso: string, repeticiones: string): string {
  try {
    localStorage.setItem(clave(sesion, ejercicio), JSON.stringify({ base: base(sesion, ejercicio), peso, repeticiones }));
    return '';
  } catch { return 'No se pudo conservar el borrador. Lo escrito sigue en pantalla, pero podría perderse al recargar.'; }
}

export function quitarBorrador(sesion: Sesion, ejercicio: EjercicioPlan): string {
  try { localStorage.removeItem(clave(sesion, ejercicio)); return ''; }
  catch { return 'No se pudo limpiar el borrador de este dispositivo.'; }
}

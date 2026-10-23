import { recuperarRegistroActual } from './training.ts';
import type { RegistroActual, Sesion } from './training';

export const limiteRespaldoBytes = 2 * 1024 * 1024;

function copiaValidada(registro: RegistroActual): RegistroActual {
  return structuredClone(recuperarRegistroActual(JSON.stringify(registro), null, null));
}
export function crearRespaldo(registro: RegistroActual, exportadoEn = new Date().toISOString()): string {
  if (Number.isNaN(Date.parse(exportadoEn))) throw new Error('La fecha del respaldo no es válida.');
  const texto = JSON.stringify({ aplicacion: 'gim-bitacora', formatoRespaldo: 3, exportadoEn, datos: copiaValidada(registro) }, null, 2);
  if (new TextEncoder().encode(texto).length > limiteRespaldoBytes) throw new Error('El registro supera el límite de respaldo de 2 MB de esta versión.');
  return texto;
}

export function leerRespaldo(texto: string): RegistroActual {
  if (new TextEncoder().encode(texto).length > limiteRespaldoBytes) throw new Error('El archivo supera el límite de 2 MB.');
  let archivo: unknown;
  try { archivo = JSON.parse(texto); }
  catch { throw new Error('El archivo no contiene JSON válido.'); }
  if (typeof archivo !== 'object' || archivo === null || Array.isArray(archivo) ||
    !('aplicacion' in archivo) || archivo.aplicacion !== 'gim-bitacora' ||
    !('formatoRespaldo' in archivo) || ![1, 2, 3].includes(archivo.formatoRespaldo as number) ||
    !('exportadoEn' in archivo) || typeof archivo.exportadoEn !== 'string' || Number.isNaN(Date.parse(archivo.exportadoEn)) ||
    !('datos' in archivo) || archivo.datos === null) {
    throw new Error('No es un respaldo compatible de GIM.');
  }
  const datos = archivo.datos as { version?: unknown };
  if ((archivo.formatoRespaldo === 1 && datos.version !== 3) || (archivo.formatoRespaldo === 2 && datos.version !== 4) || (archivo.formatoRespaldo === 3 && datos.version !== 5)) throw new Error('La versión de los datos no corresponde al formato del respaldo.');
  try { return copiaValidada(archivo.datos as RegistroActual); }
  catch { throw new Error('El respaldo contiene entrenamientos o referencias inválidas. No se importó nada.'); }
}

export type AnalisisImportacion = {
  registro: RegistroActual;
  nuevas: number;
  identicas: number;
  rutinasNuevas: number;
  bloquesNuevos: number;
  conflictos: string[];
};

export function analizarImportacion(actual: RegistroActual, entrante: RegistroActual): AnalisisImportacion {
  const base = copiaValidada(actual);
  const archivo = copiaValidada(entrante);
  const existentes = new Map(base.entrenamientos.map(sesion => [sesion.id, sesion]));
  const seriesExistentes = new Set(base.entrenamientos.flatMap(sesion => sesion.series.map(serie => serie.id)));
  const nuevas: Sesion[] = [];
  const conflictos: string[] = [];
  let identicas = 0;
  const rutinas = [...(base.rutinas ?? [])];
  let rutinasNuevas = 0;
  let bloquesNuevos = 0;
  const bloques = [...(base.bloques ?? [])];
  for (const b of archivo.bloques ?? []) {
    const existente = bloques.find(x => x.id === b.id);
    if (existente && JSON.stringify(existente) !== JSON.stringify(b)) conflictos.push('Bloque con el mismo ID y contenido distinto: ' + b.titulo);
    else if (!existente) { bloques.push(b); bloquesNuevos++; }
  }
  for (const rutina of archivo.rutinas ?? []) {
    const existente = rutinas.find(r => r.id === rutina.id);
    if (existente && JSON.stringify(existente) !== JSON.stringify(rutina)) conflictos.push(`Rutina «${rutina.titulo}»: el plan difiere del existente.`);
    else if (!existente) { rutinas.push(rutina); rutinasNuevas++; }
  }
  for (const sesion of archivo.entrenamientos) {
    const existente = existentes.get(sesion.id);
    if (existente) {
      if (JSON.stringify(existente) === JSON.stringify(sesion)) identicas++;
      else conflictos.push(`«${sesion.nombre}»: la copia difiere del entrenamiento existente.`);
    } else if (sesion.series.some(serie => seriesExistentes.has(serie.id))) {
      conflictos.push(`«${sesion.nombre}»: contiene series que ya pertenecen a otro entrenamiento.`);
    } else if (sesion.fecha && sesion.rutinaOrigen && [...base.entrenamientos, ...nuevas].some(s => s.fecha === sesion.fecha && s.rutinaOrigen?.id === sesion.rutinaOrigen?.id)) {
      conflictos.push(`«${sesion.nombre}»: ya existe esa rutina en la misma fecha con otro identificador.`);
    } else {
      nuevas.push(sesion);
    }
  }
  return { registro: conflictos.length > 0 ? base : { ...base, entrenamientos: [...nuevas, ...base.entrenamientos], ...(base.rutinas || archivo.rutinas ? { rutinas } : {}), ...(base.bloques || archivo.bloques ? { bloques } : {}) }, nuevas: nuevas.length, identicas, rutinasNuevas, bloquesNuevos, conflictos };
}

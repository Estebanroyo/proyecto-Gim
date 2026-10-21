import { recuperarRegistroActual } from './training.ts';
import type { RegistroActual, RutinaDia, Sesion } from './training';

export const limiteRespaldoBytes = 2 * 1024 * 1024;

function copiarSesion(sesion: Sesion): Sesion {
  return {
    id: sesion.id, fecha: sesion.fecha, nombre: sesion.nombre,
    ...(sesion.finalizadaEn ? { finalizadaEn: sesion.finalizadaEn } : {}),
    rutinaOrigen: sesion.rutinaOrigen ? { id: sesion.rutinaOrigen.id, titulo: sesion.rutinaOrigen.titulo } : null,
    ejercicios: sesion.ejercicios.map(ejercicio => ({
      id: ejercicio.id, nombre: ejercicio.nombre, grupo: ejercicio.grupo,
      seriesObjetivo: ejercicio.seriesObjetivo, repeticionesObjetivo: ejercicio.repeticionesObjetivo, notas: ejercicio.notas,
      ...(ejercicio.criterioPeso ? { criterioPeso: ejercicio.criterioPeso } : {}),
    })),
    series: sesion.series.map(serie => ({ id: serie.id, pesoKg: serie.pesoKg, repeticiones: serie.repeticiones, ejercicioId: serie.ejercicioId, ...(serie.registradaEn ? { registradaEn: serie.registradaEn } : {}) })),
  };
}

function copiaValidada(registro: RegistroActual): RegistroActual {
  const validado = recuperarRegistroActual(JSON.stringify(registro), null, null);
  return { version: 3, entrenamientos: validado.entrenamientos.map(copiarSesion), ...(validado.rutinas ? { rutinas: validado.rutinas.map(copiarRutina) } : {}) };
}

function copiarRutina(rutina: RutinaDia): RutinaDia {
  return { id: rutina.id, titulo: rutina.titulo, ejercicios: rutina.ejercicios.map(e => ({ id: e.id, nombre: e.nombre, grupo: e.grupo, seriesObjetivo: e.seriesObjetivo, repeticionesObjetivo: e.repeticionesObjetivo, notas: e.notas, ...(e.criterioPeso ? { criterioPeso: e.criterioPeso } : {}) })) };
}

export function crearRespaldo(registro: RegistroActual, exportadoEn = new Date().toISOString()): string {
  if (Number.isNaN(Date.parse(exportadoEn))) throw new Error('La fecha del respaldo no es válida.');
  const texto = JSON.stringify({ aplicacion: 'gim-bitacora', formatoRespaldo: 1, exportadoEn, datos: copiaValidada(registro) }, null, 2);
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
    !('formatoRespaldo' in archivo) || archivo.formatoRespaldo !== 1 ||
    !('exportadoEn' in archivo) || typeof archivo.exportadoEn !== 'string' || Number.isNaN(Date.parse(archivo.exportadoEn)) ||
    !('datos' in archivo) || archivo.datos === null) {
    throw new Error('No es un respaldo compatible de GIM.');
  }
  try { return copiaValidada(archivo.datos as RegistroActual); }
  catch { throw new Error('El respaldo contiene entrenamientos o referencias inválidas. No se importó nada.'); }
}

export type AnalisisImportacion = {
  registro: RegistroActual;
  nuevas: number;
  identicas: number;
  rutinasNuevas: number;
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
  return { registro: conflictos.length > 0 ? base : { ...base, entrenamientos: [...nuevas, ...base.entrenamientos], ...(base.rutinas || archivo.rutinas ? { rutinas } : {}) }, nuevas: nuevas.length, identicas, rutinasNuevas, conflictos };
}

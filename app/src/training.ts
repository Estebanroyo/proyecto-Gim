import { esFechaValida, recuperarRegistro, validarSerie } from './workout.ts';
import type { Serie } from './workout';

export const claveRegistroActual = 'gim.app.entrenamientos.v3';

export type EjercicioPlan = {
  id: string;
  nombre: string;
  grupo: string;
  seriesObjetivo: number | null;
  repeticionesObjetivo: number | null;
  notas: string | null;
  criterioPeso?: 'total' | 'por-mancuerna' | 'lastre';
};

export type RutinaDia = {
  id: string;
  titulo: string;
  ejercicios: EjercicioPlan[];
};

export type SerieEjercicio = Serie & { ejercicioId: string; registradaEn?: string };

export type Sesion = {
  id: string;
  fecha: string | null;
  nombre: string;
  rutinaOrigen: { id: string; titulo: string } | null;
  ejercicios: EjercicioPlan[];
  series: SerieEjercicio[];
  finalizadaEn?: string;
};

// Campos opcionales aditivos: los registros v3 anteriores siguen siendo legibles.
export type RegistroActual = { version: 3; entrenamientos: Sesion[]; rutinas?: RutinaDia[] };

export function ejercicioInicial(): EjercicioPlan {
  return { id: 'press-banca', nombre: 'Press de banca', grupo: 'Pecho', seriesObjetivo: null, repeticionesObjetivo: null, notas: null };
}

function esObjeto(dato: unknown): dato is Record<string, unknown> {
  return typeof dato === 'object' && dato !== null && !Array.isArray(dato);
}

function textoValido(dato: unknown, limite: number): dato is string {
  return typeof dato === 'string' && dato.trim().length > 0 && dato.length <= limite;
}

function esObjetivo(dato: unknown): boolean {
  return dato === null || (typeof dato === 'number' && Number.isInteger(dato) && dato >= 1 && dato <= 100);
}

function validarEjercicios(dato: unknown): asserts dato is EjercicioPlan[] {
  if (!Array.isArray(dato) || dato.length === 0) throw new Error('Faltan los ejercicios del entrenamiento.');
  const ids = new Set<string>();
  for (const ejercicio of dato) {
    if (!esObjeto(ejercicio) || !textoValido(ejercicio.id, 100) || ids.has(ejercicio.id) ||
      !textoValido(ejercicio.nombre, 200) || !textoValido(ejercicio.grupo, 100) ||
      !esObjetivo(ejercicio.seriesObjetivo) || !esObjetivo(ejercicio.repeticionesObjetivo) ||
      (ejercicio.criterioPeso !== undefined && !['total', 'por-mancuerna', 'lastre'].includes(ejercicio.criterioPeso as string)) ||
      ((ejercicio.seriesObjetivo === null) !== (ejercicio.repeticionesObjetivo === null)) ||
      !(ejercicio.notas === null || (typeof ejercicio.notas === 'string' && ejercicio.notas.length <= 500))) {
      throw new Error('El entrenamiento contiene un ejercicio inválido.');
    }
    ids.add(ejercicio.id);
  }
}

export function validarRutinas(dato: unknown): asserts dato is RutinaDia[] {
  if (!Array.isArray(dato) || dato.length > 100) throw new Error('El catálogo admite hasta 100 rutinas.');
  const ids = new Set<string>();
  for (const rutina of dato) {
    if (!esObjeto(rutina) || !textoValido(rutina.id, 100) || ids.has(rutina.id) || !textoValido(rutina.titulo, 60)) throw new Error('La rutina necesita un identificador único y un nombre de hasta 60 caracteres.');
    validarEjercicios(rutina.ejercicios);
    if (rutina.ejercicios.length > 100) throw new Error('Una rutina admite hasta 100 ejercicios.');
    ids.add(rutina.id);
  }
}

function fechaHoraValida(valor: unknown): boolean {
  return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valor) && Number.isFinite(Date.parse(valor));
}

export function recuperarRegistroActual(textoV3: string | null, textoV2: string | null, textoV1: string | null): RegistroActual {
  if (textoV3 === null) {
    const anterior = recuperarRegistro(textoV2, textoV1);
    return {
      version: 3,
      entrenamientos: anterior.entrenamientos.map(sesion => ({
        ...sesion,
        rutinaOrigen: null,
        ejercicios: [ejercicioInicial()],
        series: sesion.series.map(serie => ({ ...serie, ejercicioId: 'press-banca' })),
      })),
    };
  }
  const datos: unknown = JSON.parse(textoV3);
  if (!esObjeto(datos) || datos.version !== 3 || !Array.isArray(datos.entrenamientos)) {
    throw new Error('El registro no tiene un formato compatible.');
  }
  const idsSesiones = new Set<string>();
  if (datos.rutinas !== undefined) validarRutinas(datos.rutinas);
  const idsSeries = new Set<string>();
  for (const sesion of datos.entrenamientos) {
    if (!esObjeto(sesion) || !textoValido(sesion.id, 100) || idsSesiones.has(sesion.id) ||
      !textoValido(sesion.nombre, 60) ||
      !(sesion.fecha === null || (typeof sesion.fecha === 'string' && esFechaValida(sesion.fecha))) ||
      !(sesion.rutinaOrigen === null || (esObjeto(sesion.rutinaOrigen) && textoValido(sesion.rutinaOrigen.id, 100) && textoValido(sesion.rutinaOrigen.titulo, 200))) ||
      !Array.isArray(sesion.series) || (sesion.finalizadaEn !== undefined && !fechaHoraValida(sesion.finalizadaEn))) {
      throw new Error('El registro contiene una sesión inválida.');
    }
    idsSesiones.add(sesion.id);
    validarEjercicios(sesion.ejercicios);
    const ejercicios = new Set(sesion.ejercicios.map(ejercicio => ejercicio.id));
    for (const serie of sesion.series) {
      if (!esObjeto(serie) || !textoValido(serie.id, 100) || idsSeries.has(serie.id) ||
        typeof serie.ejercicioId !== 'string' || !ejercicios.has(serie.ejercicioId) ||
        typeof serie.pesoKg !== 'number' || typeof serie.repeticiones !== 'number' ||
        validarSerie(serie.pesoKg, serie.repeticiones) !== null || (serie.registradaEn !== undefined && !fechaHoraValida(serie.registradaEn))) {
        throw new Error('Una serie no corresponde a un ejercicio válido del entrenamiento.');
      }
      idsSeries.add(serie.id);
    }
  }
  return datos as RegistroActual;
}

export function crearSesion(registro: RegistroActual, id: string, fecha: string, nombre: string, dia: RutinaDia | null): RegistroActual {
  if (!textoValido(id, 100) || registro.entrenamientos.some(sesion => sesion.id === id)) throw new Error('El identificador de sesión no es válido.');
  if (!esFechaValida(fecha)) throw new Error('Elegí una fecha válida para el entrenamiento.');
  const titulo = nombre.trim();
  if (!textoValido(titulo, 60)) throw new Error('Ingresá un nombre de entre 1 y 60 caracteres.');
  if (dia) {
    if (!textoValido(dia.id, 100) || !textoValido(dia.titulo, 200)) throw new Error('El día de rutina no es válido.');
    validarEjercicios(dia.ejercicios);
  }
  if (registro.entrenamientos.some(sesion => sesion.fecha === fecha && (sesion.rutinaOrigen?.id ?? null) === (dia?.id ?? null))) {
    throw new Error('Ya existe un entrenamiento de esta rutina en esa fecha. Reabrí el existente.');
  }
  const sesion: Sesion = {
    id, fecha, nombre: titulo,
    rutinaOrigen: dia ? { id: dia.id, titulo: dia.titulo } : null,
    ejercicios: dia ? dia.ejercicios.map(ejercicio => ({ ...ejercicio })) : [{ ...ejercicioInicial(), criterioPeso: 'total' }],
    series: [],
  };
  return { ...registro, entrenamientos: [sesion, ...registro.entrenamientos] };
}

export function registrarSerie(registro: RegistroActual, sesionId: string, ejercicioId: string, serie: Serie & { registradaEn?: string }): RegistroActual {
  const sesion = registro.entrenamientos.find(item => item.id === sesionId);
  if (!sesion || sesion.fecha === null) throw new Error('Elegí un entrenamiento con fecha.');
  if (sesion.finalizadaEn) throw new Error('Reabrí el entrenamiento antes de agregar series.');
  if (!sesion.ejercicios.some(ejercicio => ejercicio.id === ejercicioId)) throw new Error('El ejercicio no pertenece al entrenamiento seleccionado.');
  const error = validarSerie(serie.pesoKg, serie.repeticiones);
  if (error) throw new Error(error);
  if (!textoValido(serie.id, 100) || registro.entrenamientos.some(item => item.series.some(actual => actual.id === serie.id))) {
    throw new Error('El identificador de serie no es válido.');
  }
  return {
    ...registro,
    entrenamientos: registro.entrenamientos.map(item => item.id === sesionId
      ? { ...item, series: [...item.series, { ...serie, ejercicioId }] }
      : item),
  };
}

export function sesionesPorFecha(entrenamientos: Sesion[]): Sesion[] {
  return [...entrenamientos].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
}

export function corregirSerie(
  registro: RegistroActual,
  sesionId: string,
  ejercicioId: string,
  serieId: string,
  cambios: Pick<Serie, 'pesoKg' | 'repeticiones'>,
): RegistroActual {
  const sesion = registro.entrenamientos.find(item => item.id === sesionId);
  if (!sesion || sesion.fecha === null) throw new Error('Elegí un entrenamiento con fecha para corregir sus series.');
  if (!sesion.ejercicios.some(ejercicio => ejercicio.id === ejercicioId)) {
    throw new Error('El ejercicio no pertenece al entrenamiento seleccionado.');
  }
  const serie = sesion.series.find(item => item.id === serieId && item.ejercicioId === ejercicioId);
  if (!serie) throw new Error('La serie no pertenece al ejercicio y entrenamiento seleccionados.');
  const error = validarSerie(cambios.pesoKg, cambios.repeticiones);
  if (error) throw new Error(error);
  return {
    ...registro,
    entrenamientos: registro.entrenamientos.map(item => item.id === sesionId
      ? {
        ...item,
        series: item.series.map(actual => actual.id === serieId
          ? { ...actual, pesoKg: cambios.pesoKg, repeticiones: cambios.repeticiones }
          : actual),
      }
      : item),
  };
}

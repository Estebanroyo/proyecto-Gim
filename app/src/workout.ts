export type Serie = {
  id: string;
  pesoKg: number;
  repeticiones: number;
};

export const claveSeries = 'gim.app.press-banca.series.v1';
export const claveEntrenamientos = 'gim.app.entrenamientos.v2';

export type Entrenamiento = {
  id: string;
  fecha: string | null;
  nombre: string;
  series: Serie[];
};

export type Registro = {
  version: 2;
  entrenamientos: Entrenamiento[];
};

export function fechaLocal(fecha = new Date()): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

export function esFechaValida(fecha: string): boolean {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(fecha)) return false;
  const valor = new Date(`${fecha}T12:00:00`);
  return !Number.isNaN(valor.getTime()) && fechaLocal(valor) === fecha;
}

export function ordenarEntrenamientos(entrenamientos: Entrenamiento[]): Entrenamiento[] {
  return [...entrenamientos].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
}

export function mostrarFecha(fecha: string | null): string {
  if (fecha === null) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${fecha}T12:00:00`));
}

export function validarSerie(pesoKg: number, repeticiones: number): string | null {
  if (!Number.isFinite(pesoKg) || pesoKg < 0 || pesoKg > 1000) {
    return 'Ingresá un peso entre 0 y 1000 kg.';
  }
  if (!Number.isInteger(repeticiones) || repeticiones < 1 || repeticiones > 100) {
    return 'Ingresá un número entero de repeticiones entre 1 y 100.';
  }
  return null;
}

export function recuperarSeries(texto: string | null): Serie[] {
  if (texto === null) return [];
  const datos: unknown = JSON.parse(texto);
  if (!Array.isArray(datos)) throw new Error('El registro guardado no es una lista.');
  const ids = new Set<string>();
  for (const dato of datos) {
    if (
      typeof dato !== 'object' || dato === null ||
      typeof dato.id !== 'string' || dato.id.length === 0 || ids.has(dato.id) ||
      typeof dato.pesoKg !== 'number' || typeof dato.repeticiones !== 'number' ||
      validarSerie(dato.pesoKg, dato.repeticiones) !== null
    ) {
      throw new Error('El registro guardado contiene una serie inválida.');
    }
    ids.add(dato.id);
  }
  return datos as Serie[];
}

export function recuperarRegistro(textoActual: string | null, textoAnterior: string | null): Registro {
  if (textoActual === null) {
    const anteriores = recuperarSeries(textoAnterior);
    return {
      version: 2,
      entrenamientos: anteriores.length === 0 ? [] : [{
        id: 'registro-anterior-v1', fecha: null, nombre: 'Registro anterior', series: anteriores,
      }],
    };
  }
  const datos: unknown = JSON.parse(textoActual);
  if (typeof datos !== 'object' || datos === null || !('version' in datos) || datos.version !== 2 || !('entrenamientos' in datos) || !Array.isArray(datos.entrenamientos)) {
    throw new Error('El registro no tiene un formato compatible.');
  }
  const ids = new Set<string>();
  const idsSeries = new Set<string>();
  for (const entrenamiento of datos.entrenamientos) {
    if (
      typeof entrenamiento !== 'object' || entrenamiento === null ||
      typeof entrenamiento.id !== 'string' || entrenamiento.id.length === 0 || ids.has(entrenamiento.id) ||
      typeof entrenamiento.nombre !== 'string' || entrenamiento.nombre.trim().length === 0 || entrenamiento.nombre.length > 60 ||
      !(entrenamiento.fecha === null || (typeof entrenamiento.fecha === 'string' && esFechaValida(entrenamiento.fecha))) ||
      !Array.isArray(entrenamiento.series)
    ) throw new Error('El registro contiene un entrenamiento inválido.');
    ids.add(entrenamiento.id);
    const series = recuperarSeries(JSON.stringify(entrenamiento.series));
    for (const serie of series) {
      if (idsSeries.has(serie.id)) throw new Error('Hay identificadores de series repetidos.');
      idsSeries.add(serie.id);
    }
  }
  return datos as Registro;
}

export function crearEntrenamiento(registro: Registro, id: string, fecha: string, nombre: string): Registro {
  if (!id || registro.entrenamientos.some(e => e.id === id)) throw new Error('El identificador del entrenamiento no es válido.');
  if (!esFechaValida(fecha)) throw new Error('Elegí una fecha válida para el entrenamiento.');
  const titulo = nombre.trim();
  if (!titulo || titulo.length > 60) throw new Error('Ingresá un nombre de entre 1 y 60 caracteres.');
  return { version: 2, entrenamientos: [{ id, fecha, nombre: titulo, series: [] }, ...registro.entrenamientos] };
}

export function agregarSerie(registro: Registro, entrenamientoId: string, serie: Serie): Registro {
  const entrenamiento = registro.entrenamientos.find(e => e.id === entrenamientoId);
  if (!entrenamiento || entrenamiento.fecha === null) throw new Error('Elegí un entrenamiento con fecha para registrar la serie.');
  const problema = validarSerie(serie.pesoKg, serie.repeticiones);
  if (problema) throw new Error(problema);
  if (!serie.id || registro.entrenamientos.some(e => e.series.some(s => s.id === serie.id))) throw new Error('El identificador de la serie no es válido.');
  return {
    version: 2,
    entrenamientos: registro.entrenamientos.map(e => e.id === entrenamientoId ? { ...e, series: [...e.series, serie] } : e),
  };
}

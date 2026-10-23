import { esFechaValida, recuperarRegistro, validarSerie } from './workout.ts';
import type { Serie } from './workout';
import { objetivosDe, prescripcionValida } from './prescription';
import { realizadas, validarResultado, trabajoPlanificado } from './execution';

export const claveRegistroActual = 'gim.app.entrenamientos.v3';

export type Montaje = { equipo: string; ajustes: string };
export type EquipoReferencia = { id: string; nombre: string };
export type Modalidad = 'repeticiones' | 'lados' | 'tramos' | 'tiempo' | 'cardio';
export type ObjetivoSerie = { id: string; repsMin?: number; repsMax?: number; segundos?: number; pesoKg?: number; descansoSegundos?: number; rol?: 'calentamiento' | 'trabajo' };
export type GrupoEjercicios = { id: string; nombre: string; miembros: string[]; rondas: number; descansoSegundos?: number };

export type EjercicioPlan = {
  id: string;
  nombre: string;
  grupo: string;
  seriesObjetivo: number | null;
  repeticionesObjetivo: number | null;
  notas: string | null;
  criterioPeso?: 'total' | 'por-mancuerna' | 'lastre' | 'por-lado';
  criterioReps?: 'totales' | 'por-lado' | 'alternadas-totales';
  montaje?: Montaje;
  varianteId?: string;
  equipoRef?: EquipoReferencia;
  objetivosSerie?: ObjetivoSerie[];
  modalidad?: Modalidad;
  registrarRir?: boolean;
  descansoSegundos?: number;
  omitible?: boolean;
  alternativas?: EjercicioPlan[];
  progresion?: { incrementoKg: number; series: number; repsMin: number; repsMax: number };
};

export type RutinaDia = {
  id: string;
  titulo: string;
  ejercicios: EjercicioPlan[];
  grupos?: GrupoEjercicios[];
};

export type SerieEjercicio = {
  id: string; ejercicioId: string; registradaEn?: string; objetivoId?: string;
  modalidad?: Modalidad; pesoKg?: number; repeticiones?: number; segundos?: number;
  rol?: 'calentamiento' | 'trabajo'; estado?: 'realizada' | 'fallida'; rir?: number; asistenciaKg?: number;
  izquierda?: { pesoKg: number; repeticiones: number }; derecha?: { pesoKg: number; repeticiones: number };
  cerrada?: boolean; tramos?: { id: string; pesoKg: number; repeticiones: number; registradaEn: string }[];
  distanciaMetros?: number; velocidadKmh?: number; inclinacionPorcentaje?: number; resistenciaNivel?: number;
};

export type Sesion = {
  id: string;
  fecha: string | null;
  nombre: string;
  rutinaOrigen: { id: string; titulo: string } | null;
  ejercicios: EjercicioPlan[];
  series: SerieEjercicio[];
  finalizadaEn?: string;
  notasEjercicios?: Record<string, string>;
  grupos?: GrupoEjercicios[];
  pospuestos?: string[];
  omisiones?: { ejercicioId: string; motivo: 'usuario' | 'version-corta' | 'sustituido' }[];
  sustituciones?: { originalId: string; nuevoId: string; realizadaEn: string }[];
};

// v4 es la única escritura nueva; v1/v2/v3 siguen teniendo lectores.
export type RegistroActual = { version: 5; entrenamientos: Sesion[]; rutinas?: RutinaDia[]; bloques?: RutinaDia[] };

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

function montajeValido(dato: unknown): boolean {
  return esObjeto(dato) && typeof dato.equipo === 'string' && dato.equipo.length <= 80 &&
    typeof dato.ajustes === 'string' && dato.ajustes.length <= 500 && Boolean(dato.equipo.trim() || dato.ajustes.trim());
}

function validarEjercicios(dato: unknown, profundidad = 0): asserts dato is EjercicioPlan[] {
  if (!Array.isArray(dato) || dato.length === 0) throw new Error('Faltan los ejercicios del entrenamiento.');
  const ids = new Set<string>();
  for (const ejercicio of dato) {
    if (!esObjeto(ejercicio) || !textoValido(ejercicio.id, 100) || ids.has(ejercicio.id) ||
      !textoValido(ejercicio.nombre, 200) || !textoValido(ejercicio.grupo, 100) ||
      !esObjetivo(ejercicio.seriesObjetivo) || !esObjetivo(ejercicio.repeticionesObjetivo) ||
      (ejercicio.criterioPeso !== undefined && !['total', 'por-mancuerna', 'lastre', 'por-lado'].includes(ejercicio.criterioPeso as string)) ||
      (ejercicio.criterioReps !== undefined && (!['totales','por-lado','alternadas-totales'].includes(ejercicio.criterioReps as string) || ['tiempo','cardio'].includes(ejercicio.modalidad as string))) ||
      (ejercicio.modalidad === 'lados' && (ejercicio.criterioPeso !== 'por-lado' || ejercicio.criterioReps !== 'por-lado')) ||
      (ejercicio.criterioPeso === 'por-lado' && ejercicio.modalidad !== 'lados') ||
      (ejercicio.montaje !== undefined && !montajeValido(ejercicio.montaje)) ||
      (ejercicio.varianteId !== undefined && !textoValido(ejercicio.varianteId, 100)) ||
      (ejercicio.equipoRef !== undefined && (!esObjeto(ejercicio.equipoRef) || !textoValido(ejercicio.equipoRef.id, 100) || !textoValido(ejercicio.equipoRef.nombre, 80))) ||
      (ejercicio.modalidad !== undefined && !['repeticiones', 'lados', 'tramos', 'tiempo', 'cardio'].includes(ejercicio.modalidad as string)) ||
      (ejercicio.registrarRir !== undefined && (typeof ejercicio.registrarRir !== 'boolean' || (ejercicio.registrarRir === true && ejercicio.modalidad && ejercicio.modalidad !== 'repeticiones'))) ||
      (ejercicio.omitible !== undefined && typeof ejercicio.omitible !== 'boolean') ||
      (ejercicio.descansoSegundos !== undefined && !(typeof ejercicio.descansoSegundos === 'number' && Number.isInteger(ejercicio.descansoSegundos) && ejercicio.descansoSegundos >= 0 && ejercicio.descansoSegundos <= 3600)) ||
      (ejercicio.objetivosSerie !== undefined && !prescripcionValida(ejercicio.objetivosSerie, ejercicio.seriesObjetivo, ejercicio.repeticionesObjetivo, ejercicio.modalidad as Modalidad | undefined)) ||
      ((!ejercicio.modalidad || !['tiempo', 'cardio'].includes(ejercicio.modalidad as string)) && ((ejercicio.seriesObjetivo === null) !== (ejercicio.repeticionesObjetivo === null))) ||
      !(ejercicio.notas === null || (typeof ejercicio.notas === 'string' && ejercicio.notas.length <= 500))) {
      throw new Error('El entrenamiento contiene un ejercicio inválido.');
    }
    if (ejercicio.alternativas !== undefined) {
      if (profundidad || !Array.isArray(ejercicio.alternativas) || ejercicio.alternativas.length > 5) throw new Error('Admitimos hasta cinco alternativas preparadas, sin alternativas anidadas.');
      if (ejercicio.alternativas.length) validarEjercicios(ejercicio.alternativas, profundidad + 1);
    }
    if (ejercicio.progresion !== undefined) {
      const p = ejercicio.progresion;
      if (!esObjeto(p) || typeof p.incrementoKg !== 'number' || !Number.isFinite(p.incrementoKg) || p.incrementoKg <= 0 || p.incrementoKg > 100 || !esObjetivo(p.series) || p.series === null || !esObjetivo(p.repsMin) || !esObjetivo(p.repsMax) || typeof p.repsMin !== 'number' || typeof p.repsMax !== 'number' || p.repsMin > p.repsMax || (ejercicio.modalidad && ejercicio.modalidad !== 'repeticiones')) throw new Error('La progresión requiere series simples y una regla válida de rango, cantidad e incremento.');
    }
    ids.add(ejercicio.id);
  }
}
export function validarGrupos(dato: unknown, ejercicios: EjercicioPlan[]): asserts dato is GrupoEjercicios[] | undefined {
  if (dato === undefined) return;
  if (!Array.isArray(dato) || dato.length > 50) throw new Error('Grupos inválidos.');
  const usados = new Set<string>(), ids = new Set<string>();
  for (const g of dato) {
    if (!esObjeto(g) || !textoValido(g.id, 100) || ids.has(g.id) || !textoValido(g.nombre, 60) || !Array.isArray(g.miembros) || g.miembros.length < 2 || g.miembros.length > 6 || !esObjetivo(g.rondas) || g.rondas === null || (g.descansoSegundos !== undefined && !(typeof g.descansoSegundos === 'number' && Number.isInteger(g.descansoSegundos) && g.descansoSegundos >= 0 && g.descansoSegundos <= 3600))) throw new Error('Definí grupos de 2 a 6 ejercicios con rondas válidas.');
    ids.add(g.id);
    for (const id of g.miembros) {
      const e = ejercicios.find(x => x.id === id);
      if (!e || usados.has(id) || (e.modalidad && e.modalidad !== 'repeticiones') || e.seriesObjetivo === null || trabajoPlanificado(e) > (g.rondas as number)) throw new Error('Los grupos admiten series simples planificadas, sin repetir miembros y con rondas suficientes para sus objetivos de trabajo.');
      usados.add(id);
    }
  }
}

export function validarRutinas(dato: unknown): asserts dato is RutinaDia[] {
  if (!Array.isArray(dato) || dato.length > 100) throw new Error('El catálogo admite hasta 100 rutinas.');
  const ids = new Set<string>();
  for (const rutina of dato) {
    if (!esObjeto(rutina) || !textoValido(rutina.id, 100) || ids.has(rutina.id) || !textoValido(rutina.titulo, 60)) throw new Error('La rutina necesita un identificador único y un nombre de hasta 60 caracteres.');
    validarEjercicios(rutina.ejercicios);
    validarGrupos(rutina.grupos, rutina.ejercicios);
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
      version: 5,
      entrenamientos: anterior.entrenamientos.map(sesion => ({
        ...sesion,
        rutinaOrigen: null,
        ejercicios: [ejercicioInicial()],
        series: sesion.series.map(serie => ({ ...serie, ejercicioId: 'press-banca' })),
      })),
    };
  }
  const datos: unknown = JSON.parse(textoV3);
  if (!esObjeto(datos) || ![3, 4, 5].includes(datos.version as number) || !Array.isArray(datos.entrenamientos)) {
    throw new Error('El registro no tiene un formato compatible.');
  }
  const idsSesiones = new Set<string>();
  if (datos.rutinas !== undefined) validarRutinas(datos.rutinas);
  if (datos.bloques !== undefined) validarRutinas(datos.bloques);
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
    validarGrupos(sesion.grupos, sesion.ejercicios);
    const ejercicios = new Set(sesion.ejercicios.map(ejercicio => ejercicio.id));
    const objetivosUsados = new Set<string>();
    const ordenPorEjercicio = new Map<string, number>();
    if (sesion.notasEjercicios !== undefined && (!esObjeto(sesion.notasEjercicios) || Object.entries(sesion.notasEjercicios).some(([id, nota]) => !ejercicios.has(id) || !textoValido(nota, 500)))) {
      throw new Error('Una nota de sesión no corresponde a un ejercicio válido o supera los 500 caracteres.');
    }
    for (const serie of sesion.series) {
      if (!esObjeto(serie) || !textoValido(serie.id, 100) || idsSeries.has(serie.id) ||
        typeof serie.ejercicioId !== 'string' || !ejercicios.has(serie.ejercicioId) ||
        validarResultado(serie as SerieEjercicio) !== null || (serie.registradaEn !== undefined && !fechaHoraValida(serie.registradaEn))) {
        throw new Error('Una serie no corresponde a un ejercicio válido del entrenamiento.');
      }
      const e = sesion.ejercicios.find(x => x.id === serie.ejercicioId)!;
      if ((serie.modalidad ?? 'repeticiones') !== (e.modalidad ?? 'repeticiones')) throw new Error('La modalidad del resultado no coincide con la copia de ejercicio.');
      const objetivoRol = e.objetivosSerie?.find(o=>o.id===serie.objetivoId)?.rol;
      if (objetivoRol && objetivoRol !== serie.rol) throw new Error('El rol del resultado no coincide con el objetivo copiado.');
      if (serie.objetivoId !== undefined) {
        const plan = sesion.ejercicios.find(e => e.id === serie.ejercicioId)?.objetivosSerie;
        const claveObjetivo = JSON.stringify([serie.ejercicioId, serie.objetivoId]);
        if (!textoValido(serie.objetivoId, 100) || plan?.[ordenPorEjercicio.get(serie.ejercicioId) ?? 0]?.id !== serie.objetivoId || objetivosUsados.has(claveObjetivo)) throw new Error('Una serie no corresponde a un objetivo válido, ordenado y único.');
        objetivosUsados.add(claveObjetivo);
      }
      ordenPorEjercicio.set(serie.ejercicioId, (ordenPorEjercicio.get(serie.ejercicioId) ?? 0) + 1);
      idsSeries.add(serie.id);
    }
    const idEjercicio = (id: unknown): id is string => typeof id === 'string' && ejercicios.has(id);
    if (sesion.pospuestos !== undefined && (!Array.isArray(sesion.pospuestos) || new Set(sesion.pospuestos).size !== sesion.pospuestos.length || !sesion.pospuestos.every(idEjercicio))) throw new Error('Pospuestos inválidos.');
    if (sesion.omisiones !== undefined && (!Array.isArray(sesion.omisiones) || new Set(sesion.omisiones.map(o => esObjeto(o) ? o.ejercicioId : null)).size !== sesion.omisiones.length || !sesion.omisiones.every(o => esObjeto(o) && idEjercicio(o.ejercicioId) && ['usuario','version-corta','sustituido'].includes(o.motivo as string)))) throw new Error('Omisiones inválidas.');
    if (sesion.sustituciones !== undefined && (!Array.isArray(sesion.sustituciones) || !sesion.sustituciones.every(o => esObjeto(o) && idEjercicio(o.originalId) && idEjercicio(o.nuevoId) && o.originalId !== o.nuevoId && fechaHoraValida(o.realizadaEn)))) throw new Error('Sustituciones inválidas.');
  }
  const planes = [...((datos.rutinas as RutinaDia[] | undefined) ?? []), ...(datos.entrenamientos as Sesion[])];
  if (datos.version === 3 && (planes.some(r => r.ejercicios.some(e => e.objetivosSerie !== undefined)) || (datos.entrenamientos as Sesion[]).some(s => s.series.some(serie => serie.objetivoId !== undefined)))) throw new Error('Los objetivos por serie requieren el formato v4.');
  if (datos.version !== 5 && (datos.bloques !== undefined || planes.some(r => r.grupos !== undefined || r.ejercicios.some(e => e.modalidad !== undefined || e.criterioReps !== undefined || e.descansoSegundos !== undefined || e.criterioPeso === "por-lado" || e.registrarRir !== undefined || e.alternativas !== undefined || e.progresion !== undefined || e.omitible !== undefined || e.objetivosSerie?.some(o => o.rol !== undefined || o.segundos !== undefined))) || (datos.entrenamientos as Sesion[]).some(s => s.pospuestos !== undefined || s.omisiones !== undefined || s.sustituciones !== undefined || s.series.some(x => x.rol !== undefined || x.estado !== undefined || x.modalidad !== undefined || x.rir !== undefined || x.asistenciaKg !== undefined)))) throw new Error('Estas capacidades requieren el registro v5.');
  return { ...datos, version: 5 } as RegistroActual;
}

export function copiarEjercicioParaSesion(e:EjercicioPlan):EjercicioPlan {
  const copia=structuredClone(e);
  if(!copia.objetivosSerie&&copia.seriesObjetivo!==null&&objetivosDe(copia).length)copia.objetivosSerie=objetivosDe(copia).map(o=>({...o,id:crypto.randomUUID()}));
  if(copia.objetivosSerie)copia.objetivosSerie=copia.objetivosSerie.map(o=>({...o,rol:o.rol??'trabajo'}));
  return copia;
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
    ejercicios: dia ? dia.ejercicios.map(copiarEjercicioParaSesion) : [{ ...ejercicioInicial(), criterioPeso: 'total' }],
    series: [],
    ...(dia?.grupos ? { grupos: structuredClone(dia.grupos) } : {}),
  };
  return { ...registro, entrenamientos: [sesion, ...registro.entrenamientos] };
}

export function registrarSerie(registro: RegistroActual, sesionId: string, ejercicioId: string, entrada: Omit<SerieEjercicio, 'ejercicioId'>): RegistroActual {
  const sesion = registro.entrenamientos.find(s => s.id === sesionId);
  if (!sesion?.fecha || sesion.finalizadaEn) throw new Error('Elegí una sesión abierta con fecha.');
  const ejercicio = sesion.ejercicios.find(e => e.id === ejercicioId);
  if (!ejercicio || sesion.omisiones?.some(o => o.ejercicioId === ejercicioId)) throw new Error('El ejercicio no está disponible en esta sesión.');
  const existente = sesion.series.find(s => s.id === entrada.id && s.ejercicioId === ejercicioId);
  if (!textoValido(entrada.id, 100) || registro.entrenamientos.some(s => s.series.some(x => x.id === entrada.id && (s.id !== sesionId || x.ejercicioId !== ejercicioId)))) throw new Error('Identificador de serie inválido.');
  if (!existente && sesion.series.some(s => s.ejercicioId === ejercicioId && (s.modalidad === 'lados' || s.modalidad === 'tramos') && !s.cerrada)) throw new Error('Cerrá la serie abierta antes de comenzar otra.');
  const objetivo = ejercicio.objetivosSerie?.[realizadas(sesion, ejercicioId).length];
  const serie: SerieEjercicio = existente ? { ...entrada, ejercicioId, objetivoId: existente.objetivoId, rol: existente.rol } : { ...entrada, ejercicioId, rol: objetivo?.rol ?? 'trabajo', ...(objetivo ? { objetivoId: objetivo.id } : {}) };
  const error = validarResultado(serie);
  if (error) throw new Error(error);
  if ((serie.modalidad ?? 'repeticiones') !== (ejercicio.modalidad ?? 'repeticiones')) throw new Error('Modalidad incompatible con el ejercicio.');
  return { ...registro, entrenamientos: registro.entrenamientos.map(s => s.id === sesionId ? { ...s, pospuestos: s.pospuestos?.filter(id=>id!==ejercicioId), series: existente ? s.series.map(x => x.id === serie.id ? serie : x) : [...s.series, serie] } : s) };
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
  const error = validarResultado({ ...serie, ...cambios });
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
